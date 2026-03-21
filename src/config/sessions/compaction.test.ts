import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { loadSessionStore } from "./store.js";
import {
  appendSessionEvent,
  compactSessionTrail,
  replaySessionState,
} from "./compaction.js";

function extractSnapshotText(message: unknown): string {
  if (!message || typeof message !== "object") {
    return "";
  }
  const content = (message as { content?: unknown }).content;
  if (!Array.isArray(content) || content.length === 0) {
    return "";
  }
  const first = content[0];
  if (!first || typeof first !== "object") {
    return "";
  }
  const text = (first as { text?: unknown }).text;
  return typeof text === "string" ? text : "";
}

describe("session compaction", () => {
  test("replaySessionState prepends a snapshot summary", () => {
    const snapshot = {
      sessionKey: "main",
      sessionId: "sess-main",
      runId: "run-1",
      phase: "final" as const,
      startedAt: 1_000,
      lastEventAt: 2_000,
      lastAssistantText: "Answer ready",
      lastError: "none",
      toolCounts: { read: 2, write: 1 },
      retryCount: 1,
      lastCompactedEventSeq: 42,
      snapshotVersion: 1,
      snapshotUpdatedAt: 3_000,
      trailBytes: 12_345,
      trailEventCount: 50,
    };

    const tail = [
      { role: "user", content: "hello" },
      { role: "assistant", content: "world" },
    ];

    const replayed = replaySessionState(snapshot, tail);

    expect(replayed.messages).toHaveLength(3);
    expect(replayed.messages[0]).toMatchObject({
      role: "system",
      __openclaw: { kind: "snapshot" },
    });
    const summaryText = extractSnapshotText(replayed.messages[0]);
    expect(summaryText).toContain("Session snapshot");
    expect(summaryText).toContain("Phase: final");
    expect(summaryText).toContain("Last assistant: Answer ready");
    expect(summaryText).toContain("Last error: none");
    expect(replayed.messages.slice(1)).toEqual(tail);
  });

  test("appendSessionEvent persists live snapshot metadata", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-session-snapshot-"));
    try {
      const storePath = path.join(dir, "sessions.json");
      await fs.writeFile(
        storePath,
        JSON.stringify({
          main: {
            sessionId: "sess-main",
            updatedAt: 1,
          },
        }),
        "utf-8",
      );

      const updated = await appendSessionEvent({
        storePath,
        sessionKey: "main",
        event: {
          runId: "run-1",
          phase: "started",
          startedAt: 10,
          lastEventAt: 20,
          lastAssistantText: "still going",
          lastError: "none",
          retryCount: 2,
          toolCounts: { read: 1 },
        },
      });

      expect(updated?.runId).toBe("run-1");
      expect(updated?.phase).toBe("started");
      expect(updated?.startedAt).toBe(10);
      expect(updated?.lastEventAt).toBe(20);
      expect(updated?.lastAssistantText).toBe("still going");
      expect(updated?.lastError).toBe("none");
      expect(updated?.retryCount).toBe(2);
      expect(updated?.toolCounts).toEqual({ read: 1 });
      expect(updated?.snapshotVersion).toBe(1);
      expect(updated?.snapshotUpdatedAt).toBeTypeOf("number");

      const store = loadSessionStore(storePath, { skipCache: true });
      expect(store.main?.runId).toBe("run-1");
      expect(store.main?.phase).toBe("started");
      expect(store.main?.snapshotVersion).toBe(1);
      expect(store.main?.snapshotUpdatedAt).toBeTypeOf("number");
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  test("compactSessionTrail archives the raw trail and keeps a bounded hot window", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-session-compact-"));
    try {
      const storePath = path.join(dir, "sessions.json");
      const sessionId = "sess-main";
      const transcriptPath = path.join(dir, `${sessionId}.jsonl`);
      await fs.writeFile(
        storePath,
        JSON.stringify({
          main: {
            sessionId,
            updatedAt: Date.now(),
          },
        }),
        "utf-8",
      );
      const lines = [
        JSON.stringify({
          type: "session",
          version: 3,
          id: sessionId,
          timestamp: new Date().toISOString(),
          cwd: dir,
        }),
        JSON.stringify({
          message: {
            role: "user",
            content: [{ type: "text", text: "message 1" }],
            timestamp: 1,
          },
        }),
        JSON.stringify({
          message: {
            role: "assistant",
            content: [{ type: "text", text: "message 2" }],
            timestamp: 2,
          },
        }),
        JSON.stringify({
          message: {
            role: "user",
            content: [{ type: "text", text: "message 3" }],
            timestamp: 3,
          },
        }),
        JSON.stringify({
          message: {
            role: "assistant",
            content: [{ type: "text", text: "message 4" }],
            timestamp: 4,
          },
        }),
        JSON.stringify({
          message: {
            role: "assistant",
            content: [{ type: "text", text: "message 5" }],
            timestamp: 5,
          },
        }),
      ];
      await fs.writeFile(transcriptPath, `${lines.join("\n")}\n`, "utf-8");

      const result = await compactSessionTrail({
        storePath,
        sessionKey: "main",
        force: true,
        maxTailMessages: 2,
        reason: "final",
      });

      expect(result.compacted).toBe(true);
      expect(result.kept).toBe(2);
      expect(result.archived).toContain("sess-main.jsonl.bak.");
      expect(result.snapshot.snapshotVersion).toBe(1);
      expect(result.snapshot.trailEventCount).toBe(5);
      expect(result.snapshot.lastCompactedEventSeq).toBe(3);
      expect(result.snapshot.phase).toBe("final");
      expect(result.snapshot.lastAssistantText).toBe("message 5");

      const hotTrail = (await fs.readFile(transcriptPath, "utf-8"))
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0);
      expect(hotTrail).toHaveLength(3);
      expect(JSON.parse(hotTrail[0])).toMatchObject({ type: "session" });
      expect(JSON.parse(hotTrail[1])).toMatchObject({
        message: { role: "assistant" },
      });
      expect(JSON.parse(hotTrail[2])).toMatchObject({
        message: { role: "assistant" },
      });

      const store = loadSessionStore(storePath, { skipCache: true });
      expect(store.main?.snapshotVersion).toBe(1);
      expect(store.main?.trailEventCount).toBe(5);
      expect(store.main?.trailBytes).toBeGreaterThan(0);
      expect(store.main?.lastCompactedEventSeq).toBe(3);
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
});
