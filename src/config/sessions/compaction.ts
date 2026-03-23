import fs from "node:fs";
import path from "node:path";
import type { RunModelTelemetry } from "../../agents/model-run-telemetry.js";
import { mergeSessionEntry, type SessionEntry, type SessionTrailPhase } from "./types.js";
import { loadSessionStore, updateSessionStore } from "./store.js";

export type SessionTrailEvent = {
  runId?: string;
  phase: SessionTrailPhase;
  startedAt?: number;
  lastEventAt?: number;
  modelTelemetry?: RunModelTelemetry;
  lastAssistantText?: string;
  lastError?: string;
  toolCounts?: Record<string, number>;
  retryCount?: number;
};

export type SessionTrailSnapshot = {
  sessionKey: string;
  sessionId: string;
  runId?: string;
  phase: SessionTrailPhase;
  startedAt?: number;
  lastEventAt?: number;
  modelTelemetry?: RunModelTelemetry;
  lastAssistantText?: string;
  lastError?: string;
  toolCounts?: Record<string, number>;
  retryCount?: number;
  lastCompactedEventSeq?: number;
  snapshotVersion: number;
  snapshotUpdatedAt: number;
  trailBytes?: number;
  trailEventCount?: number;
};

export type SessionTrailCompactionResult = {
  ok: true;
  compacted: boolean;
  reason?: string;
  archived?: string;
  kept: number;
  snapshot: SessionTrailSnapshot;
  summary?: string;
};

const DEFAULT_TAIL_MESSAGES = 200;
const DEFAULT_TAIL_BYTES = 256 * 1024;

type TranscriptMessage = {
  role?: string;
  content?: unknown;
  timestamp?: number | string;
};

type TranscriptRecord = {
  type?: string;
  timestamp?: string;
  message?: TranscriptMessage;
  [key: string]: unknown;
};

function normalizeText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function extractTextFromContent(content: unknown): string | undefined {
  if (typeof content === "string") {
    return normalizeText(content);
  }
  if (!Array.isArray(content)) {
    return undefined;
  }
  const parts = content
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }
      const text = (item as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .filter((text) => text.trim().length > 0);
  if (parts.length === 0) {
    return undefined;
  }
  return normalizeText(parts.join("\n"));
}

function extractMessageText(message: TranscriptMessage | undefined): string | undefined {
  if (!message) {
    return undefined;
  }
  return extractTextFromContent(message.content);
}

function parseTranscriptRecords(raw: string): TranscriptRecord[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        const parsed = JSON.parse(line);
        return parsed && typeof parsed === "object" ? [parsed as TranscriptRecord] : [];
      } catch {
        return [];
      }
    });
}

function recordTimestamp(record: TranscriptRecord): number | undefined {
  if (typeof record.timestamp === "string") {
    const parsed = Date.parse(record.timestamp);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  const messageTs = record.message?.timestamp;
  if (typeof messageTs === "number" && Number.isFinite(messageTs)) {
    return messageTs;
  }
  if (typeof messageTs === "string") {
    const parsed = Date.parse(messageTs);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function isSessionHeader(record: TranscriptRecord): boolean {
  return record.type === "session" && typeof record.id === "string";
}

function resolveTranscriptPath(params: {
  sessionId: string;
  storePath: string;
  sessionFile?: string;
}): string {
  if (params.sessionFile?.trim()) {
    return params.sessionFile.trim();
  }
  return path.join(path.dirname(params.storePath), `${params.sessionId}.jsonl`);
}

function buildSnapshotSummary(snapshot: SessionTrailSnapshot): string {
  const lines = ["Session snapshot"];
  lines.push(`Session key: ${snapshot.sessionKey}`);
  lines.push(`Session id: ${snapshot.sessionId}`);
  lines.push(`Phase: ${snapshot.phase}`);
  if (snapshot.runId) {
    lines.push(`Run id: ${snapshot.runId}`);
  }
  if (typeof snapshot.startedAt === "number") {
    lines.push(`Started: ${new Date(snapshot.startedAt).toISOString()}`);
  }
  if (typeof snapshot.lastEventAt === "number") {
    lines.push(`Last event: ${new Date(snapshot.lastEventAt).toISOString()}`);
  }
  if (snapshot.lastAssistantText) {
    lines.push(`Last assistant: ${snapshot.lastAssistantText}`);
  }
  if (snapshot.lastError) {
    lines.push(`Last error: ${snapshot.lastError}`);
  }
  if (snapshot.toolCounts && Object.keys(snapshot.toolCounts).length > 0) {
    const counts = Object.entries(snapshot.toolCounts)
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");
    lines.push(`Tools: ${counts}`);
  }
  if (typeof snapshot.retryCount === "number") {
    lines.push(`Retry count: ${snapshot.retryCount}`);
  }
  if (typeof snapshot.trailEventCount === "number") {
    lines.push(`Trail events: ${snapshot.trailEventCount}`);
  }
  if (typeof snapshot.lastCompactedEventSeq === "number") {
    lines.push(`Compacted through event: ${snapshot.lastCompactedEventSeq}`);
  }
  return lines.join("\n");
}

function buildSnapshotMessage(snapshot: SessionTrailSnapshot): Record<string, unknown> {
  return {
    role: "system",
    content: [{ type: "text", text: buildSnapshotSummary(snapshot) }],
    timestamp: snapshot.snapshotUpdatedAt,
    __openclaw: {
      kind: "snapshot",
      version: snapshot.snapshotVersion,
      trailEventCount: snapshot.trailEventCount,
      lastCompactedEventSeq: snapshot.lastCompactedEventSeq,
    },
  };
}

function resolveCompactionPhase(
  reason: "final" | "error" | "stalled" | "threshold" | "manual" | undefined,
  fallback: SessionTrailPhase,
): SessionTrailPhase {
  switch (reason) {
    case "final":
    case "error":
    case "stalled":
      return reason;
    default:
      return fallback;
  }
}

function deriveTrailSnapshot(params: {
  sessionKey: string;
  entry: SessionEntry;
  records: TranscriptRecord[];
  now?: number;
  snapshotVersion?: number;
  lastCompactedEventSeq?: number;
  trailBytes?: number;
  trailEventCount?: number;
}): SessionTrailSnapshot {
  const { entry, records } = params;
  let lastAssistantText = normalizeText(entry.lastAssistantText);
  let lastError = normalizeText(entry.lastError);
  let lastEventAt = typeof entry.lastEventAt === "number" ? entry.lastEventAt : undefined;
  let startedAt = typeof entry.startedAt === "number" ? entry.startedAt : undefined;
  for (const record of records) {
    const ts = recordTimestamp(record);
    if (typeof ts === "number") {
      lastEventAt = ts;
      startedAt ??= ts;
    }
    const message = record.message;
    const role = message?.role?.toLowerCase();
    if (role === "assistant") {
      const text = extractMessageText(message);
      if (text) {
        lastAssistantText = text;
      }
    }
    if (role === "user") {
      startedAt ??= ts;
    }
  }

  return {
    sessionKey: params.sessionKey,
    sessionId: entry.sessionId,
    runId: entry.runId,
    phase: entry.phase ?? "final",
    startedAt,
    lastEventAt,
    modelTelemetry: entry.modelTelemetry,
    lastAssistantText,
    lastError,
    toolCounts: entry.toolCounts,
    retryCount: entry.retryCount,
    lastCompactedEventSeq: params.lastCompactedEventSeq,
    snapshotVersion: params.snapshotVersion ?? entry.snapshotVersion ?? 1,
    snapshotUpdatedAt: params.now ?? Date.now(),
    trailBytes: params.trailBytes,
    trailEventCount: params.trailEventCount,
  };
}

function buildSnapshotFromEntry(params: {
  sessionKey: string;
  entry: SessionEntry;
  now?: number;
}): SessionTrailSnapshot | undefined {
  const { entry } = params;
  if (
    entry.snapshotVersion == null &&
    entry.lastCompactedEventSeq == null &&
    entry.trailEventCount == null &&
    entry.trailBytes == null &&
    entry.phase == null &&
    entry.runId == null &&
    entry.lastAssistantText == null &&
    entry.lastError == null
  ) {
    return undefined;
  }
  return {
    sessionKey: params.sessionKey,
    sessionId: entry.sessionId,
    runId: entry.runId,
    phase: entry.phase ?? "accepted",
    startedAt: entry.startedAt,
    lastEventAt: entry.lastEventAt,
    modelTelemetry: entry.modelTelemetry,
    lastAssistantText: entry.lastAssistantText,
    lastError: entry.lastError,
    toolCounts: entry.toolCounts,
    retryCount: entry.retryCount,
    lastCompactedEventSeq: entry.lastCompactedEventSeq,
    snapshotVersion: entry.snapshotVersion ?? 1,
    snapshotUpdatedAt: entry.snapshotUpdatedAt ?? params.now ?? entry.updatedAt,
    trailBytes: entry.trailBytes,
    trailEventCount: entry.trailEventCount,
  };
}

export function loadSessionSnapshot(params: {
  sessionKey: string;
  entry?: SessionEntry;
  now?: number;
}): SessionTrailSnapshot | undefined {
  const { entry } = params;
  if (!entry) {
    return undefined;
  }
  return buildSnapshotFromEntry({ ...params, entry });
}

export function replaySessionState(
  snapshot: SessionTrailSnapshot | undefined,
  tail: unknown[],
): { messages: unknown[] } {
  const canRenderSnapshot =
    !!snapshot &&
    typeof snapshot.snapshotVersion === "number" &&
    snapshot.snapshotVersion > 0 &&
    typeof snapshot.trailEventCount === "number" &&
    typeof snapshot.lastCompactedEventSeq === "number";
  if (!canRenderSnapshot || !snapshot) {
    return { messages: tail };
  }
  return {
    messages: [buildSnapshotMessage(snapshot), ...tail],
  };
}

export async function appendSessionEvent(params: {
  storePath: string;
  sessionKey: string;
  event: SessionTrailEvent;
  now?: number;
  createIfMissing?: boolean;
}): Promise<SessionEntry | null> {
  const now = params.now ?? Date.now();
  const createIfMissing = params.createIfMissing ?? true;
  return await updateSessionStore(params.storePath, (store) => {
    const existing = store[params.sessionKey];
    if (!existing && !createIfMissing) {
      return null;
    }
    const next = mergeSessionEntry(existing, {
      sessionId: existing?.sessionId ?? params.sessionKey,
      updatedAt: now,
      runId: params.event.runId ?? existing?.runId,
      phase: params.event.phase,
      startedAt:
        params.event.startedAt ?? existing?.startedAt ?? (params.event.phase === "accepted" ? now : undefined),
      lastEventAt: params.event.lastEventAt ?? now,
      modelTelemetry: params.event.modelTelemetry ?? existing?.modelTelemetry,
      lastAssistantText: params.event.lastAssistantText ?? existing?.lastAssistantText,
      lastError: params.event.lastError ?? existing?.lastError,
      toolCounts: params.event.toolCounts ?? existing?.toolCounts,
      retryCount: params.event.retryCount ?? existing?.retryCount,
      snapshotVersion: Math.max(existing?.snapshotVersion ?? 0, 1),
      snapshotUpdatedAt: now,
    });
    store[params.sessionKey] = next;
    return next;
  });
}

async function readTranscriptFile(filePath: string): Promise<{
  raw: string;
  header?: TranscriptRecord;
  records: TranscriptRecord[];
}> {
  const raw = await fs.promises.readFile(filePath, "utf-8");
  const parsed = parseTranscriptRecords(raw);
  const first = parsed[0];
  const header = first && isSessionHeader(first) ? first : undefined;
  const records = header ? parsed.slice(1) : parsed;
  return { raw, header, records };
}

async function rewriteTranscriptFile(params: {
  filePath: string;
  header?: TranscriptRecord;
  records: TranscriptRecord[];
}): Promise<void> {
  const lines: string[] = [];
  if (params.header) {
    lines.push(JSON.stringify(params.header));
  }
  lines.push(...params.records.map((record) => JSON.stringify(record)));
  await fs.promises.writeFile(
    params.filePath,
    lines.length > 0 ? `${lines.join("\n")}\n` : "",
    "utf-8",
  );
}

function archiveFileOnDisk(filePath: string, reason: string): string {
  const ts = new Date().toISOString().replaceAll(":", "-");
  const archived = `${filePath}.${reason}.${ts}`;
  fs.renameSync(filePath, archived);
  return archived;
}

export async function compactSessionTrail(params: {
  sessionKey: string;
  storePath: string;
  sessionFile?: string;
  force?: boolean;
  maxTailMessages?: number;
  maxTailBytes?: number;
  reason?: "final" | "error" | "stalled" | "threshold" | "manual";
  now?: number;
}): Promise<SessionTrailCompactionResult> {
  const now = params.now ?? Date.now();
  const store = loadSessionStore(params.storePath, { skipCache: true });
  const entry = store[params.sessionKey];
  if (!entry?.sessionId) {
    return {
      ok: true,
      compacted: false,
      kept: 0,
      snapshot: {
        sessionKey: params.sessionKey,
        sessionId: entry?.sessionId ?? "",
        phase: "accepted",
        snapshotVersion: entry?.snapshotVersion ?? 0,
        snapshotUpdatedAt: entry?.snapshotUpdatedAt ?? now,
      } as SessionTrailSnapshot,
      reason: "no sessionId",
    };
  }

  const filePath = resolveTranscriptPath({
    sessionId: entry.sessionId,
    storePath: params.storePath,
    sessionFile: params.sessionFile ?? entry.sessionFile,
  });
  if (!fs.existsSync(filePath)) {
    const snapshot = await appendSessionEvent({
      storePath: params.storePath,
      sessionKey: params.sessionKey,
      now,
      createIfMissing: false,
      event: {
        phase: resolveCompactionPhase(params.reason, entry.phase ?? "final"),
        runId: entry.runId,
        startedAt: entry.startedAt,
        lastEventAt: entry.lastEventAt,
        modelTelemetry: entry.modelTelemetry,
        lastAssistantText: entry.lastAssistantText,
        lastError: entry.lastError,
        toolCounts: entry.toolCounts,
        retryCount: entry.retryCount,
      },
    });
    return {
      ok: true,
      compacted: false,
      kept: 0,
      snapshot: (loadSessionSnapshot({
        sessionKey: params.sessionKey,
        entry: snapshot ?? entry,
        now,
      }) ?? {
        sessionKey: params.sessionKey,
        sessionId: entry.sessionId,
        phase: entry.phase ?? "accepted",
        snapshotVersion: entry.snapshotVersion ?? 0,
        snapshotUpdatedAt: entry.snapshotUpdatedAt ?? now,
      }),
      reason: "no transcript",
    };
  }

  const { raw, header, records } = await readTranscriptFile(filePath);
  const totalBytes = Buffer.byteLength(raw, "utf8");
  const tailLimit = Math.max(
    1,
    Math.floor(params.maxTailMessages ?? DEFAULT_TAIL_MESSAGES),
  );
  const bytesLimit = Math.max(1, Math.floor(params.maxTailBytes ?? DEFAULT_TAIL_BYTES));
  const shouldCompact =
    params.force === true ||
    params.reason === "final" ||
    params.reason === "error" ||
    params.reason === "stalled" ||
    records.length > tailLimit ||
    totalBytes > bytesLimit;

  if (!shouldCompact) {
    const liveSnapshot = await appendSessionEvent({
      storePath: params.storePath,
      sessionKey: params.sessionKey,
      now,
      createIfMissing: false,
      event: {
        phase: entry.phase ?? "accepted",
        runId: entry.runId,
        startedAt: entry.startedAt,
        lastEventAt: entry.lastEventAt,
        modelTelemetry: entry.modelTelemetry,
        lastAssistantText: entry.lastAssistantText,
        lastError: entry.lastError,
        toolCounts: entry.toolCounts,
        retryCount: entry.retryCount,
      },
    });
    return {
      ok: true,
      compacted: false,
      kept: records.length,
      snapshot: (loadSessionSnapshot({
        sessionKey: params.sessionKey,
        entry: liveSnapshot ?? entry,
        now,
      }) ?? {
        sessionKey: params.sessionKey,
        sessionId: entry.sessionId,
        phase: entry.phase ?? "accepted",
        snapshotVersion: entry.snapshotVersion ?? 0,
        snapshotUpdatedAt: entry.snapshotUpdatedAt ?? now,
      }),
      reason: "below threshold",
    };
  }

  const keptRecords = records.slice(-tailLimit);
  const archived = archiveFileOnDisk(filePath, "bak");
  await rewriteTranscriptFile({
    filePath,
    header,
    records: keptRecords,
  });

  const snapshot = deriveTrailSnapshot({
    sessionKey: params.sessionKey,
    entry,
    records,
    now,
    snapshotVersion: Math.max(entry.snapshotVersion ?? 0, 1),
    lastCompactedEventSeq: Math.max(0, records.length - keptRecords.length),
    trailBytes: totalBytes,
    trailEventCount: records.length,
  });

  await updateSessionStore(params.storePath, (current) => {
    const existing = current[params.sessionKey];
    if (!existing) {
      return null;
    }
    current[params.sessionKey] = mergeSessionEntry(existing, {
      ...snapshot,
      phase: resolveCompactionPhase(params.reason, snapshot.phase),
      snapshotVersion: snapshot.snapshotVersion,
      snapshotUpdatedAt: now,
      trailBytes: totalBytes,
      trailEventCount: records.length,
      lastCompactedEventSeq: Math.max(0, records.length - keptRecords.length),
      lastAssistantText: snapshot.lastAssistantText,
      lastError: snapshot.lastError,
      startedAt: snapshot.startedAt,
      lastEventAt: snapshot.lastEventAt,
      runId: snapshot.runId,
      modelTelemetry: snapshot.modelTelemetry,
      toolCounts: snapshot.toolCounts,
      retryCount: snapshot.retryCount,
    });
    return current[params.sessionKey];
  });

  const updated = loadSessionStore(params.storePath, { skipCache: true })[params.sessionKey];
  const nextSnapshot =
    loadSessionSnapshot({
      sessionKey: params.sessionKey,
      entry: updated ?? entry,
      now,
    }) ?? snapshot;

  return {
    ok: true,
    compacted: true,
    archived,
    kept: keptRecords.length,
    snapshot: nextSnapshot,
  };
}
