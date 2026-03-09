import type { EventLogEntry } from "./app-events.ts";
import type { ExecApprovalRequest } from "./controllers/exec-approval.ts";
import type { GatewayHelloOk } from "./gateway.ts";
import type { Tab } from "./navigation.ts";
import type { AgentsListResult, CronJob, GatewayAgentRow } from "./types.ts";
import { parseAgentSessionKey } from "../../../src/routing/session-key.js";

export const COLLEGIUM_BRAND_NAME = "Collegium Cortex" as const;
export const COLLEGIUM_SLOGAN = "Intelligentia in Motu" as const;
export const COLLEGIUM_PROTOCOL_NAME = "PEMA Protocol" as const;
export const COLLEGIUM_RUNTIME_NAME = "OpenClaw Runtime" as const;
export const COLLEGIUM_COMMAND_NAME = "Cortex Command" as const;
export const COLLEGIUM_FORUM_NAME = "The Forum" as const;
export const COLLEGIUM_PRAETORIUM_NAME = "Cortex Praetorium" as const;

export type RuntimeEnvironment = "LAB" | "DEV" | "PROD";
export type Scope = "product" | "engine" | "infra" | "research";
export type AgentClass = "business_agent" | "engineering_agent";
export type Surface = "cortex_command" | "the_forum" | "cortex_praetorium";

export type DevEvent = {
  id: string;
  timestamp: string;
  environment: RuntimeEnvironment;
  scope: Scope;
  surface: Surface;
  actor_id: string;
  actor_name: string;
  actor_class: AgentClass;
  event_type:
    | "task_started"
    | "handoff_sent"
    | "handoff_received"
    | "file_changed"
    | "test_started"
    | "test_passed"
    | "test_failed"
    | "decision_required"
    | "decision_resolved"
    | "blocked"
    | "warning";
  title: string;
  summary: string;
  evidence_refs: string[];
  ambiguity_flag: boolean;
  ambiguity_note?: string;
};

export type DevCockpitState = {
  environment: RuntimeEnvironment;
  runtime_name: typeof COLLEGIUM_RUNTIME_NAME;
  brand_name: typeof COLLEGIUM_BRAND_NAME;
  protocol_name: typeof COLLEGIUM_PROTOCOL_NAME;
  status: "running" | "waiting" | "blocked" | "error";
  current_scope: Scope;
  active_agent?: {
    id: string;
    name: string;
    class: AgentClass;
    role: string;
    current_task: string;
    started_at: string;
  };
  queue_counts: {
    in_progress: number;
    pending: number;
    blocked: number;
  };
  unresolved_decisions: number;
  active_blockers: number;
  recent_events: DevEvent[];
};

export type IntentDisambiguation = {
  request_id: string;
  raw_request: string;
  interpreted_scope: Scope;
  confidence: number;
  alternatives: Scope[];
  requires_confirmation: boolean;
  reason: string;
};

type CockpitParams = {
  connected: boolean;
  lastError: string | null;
  gatewayUrl: string;
  hello: GatewayHelloOk | null;
  eventLog: EventLogEntry[];
  agentsList: AgentsListResult | null;
  execApprovalQueue: ExecApprovalRequest[];
  cronJobs: CronJob[];
};

type Branding = {
  title: string;
  subtitle: string;
};

const COLLEGIUM_TABS = new Set<Tab>(["command", "forum", "praetorium"]);
const BUSINESS_AGENT_IDS = new Set(["chairman", "ceo", "cfo", "legal"]);
const ENGINEERING_AGENT_IDS = new Set(["main", "ped"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeText(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function agentNameForId(agentId: string, agentsList: AgentsListResult | null): string {
  const match = agentsList?.agents.find((entry) => entry.id === agentId);
  if (match?.identity?.name?.trim()) {
    return match.identity.name.trim();
  }
  if (match?.name?.trim()) {
    return match.name.trim();
  }
  return agentId;
}

function inferAgentId(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }
  if (typeof payload.agentId === "string" && payload.agentId.trim()) {
    return payload.agentId.trim();
  }
  if (isRecord(payload.request) && typeof payload.request.agentId === "string") {
    const agentId = payload.request.agentId.trim();
    if (agentId) {
      return agentId;
    }
  }
  const directSessionKey =
    typeof payload.sessionKey === "string" ? payload.sessionKey.trim() : undefined;
  if (directSessionKey) {
    return parseAgentSessionKey(directSessionKey)?.agentId ?? null;
  }
  if (isRecord(payload.data)) {
    const nested = payload.data;
    if (typeof nested.agentId === "string" && nested.agentId.trim()) {
      return nested.agentId.trim();
    }
    if (typeof nested.sessionKey === "string") {
      return parseAgentSessionKey(nested.sessionKey)?.agentId ?? null;
    }
  }
  return null;
}

function inferAgentClass(agentId: string, agentsList: AgentsListResult | null): AgentClass {
  const normalizedId = normalizeText(agentId);
  if (BUSINESS_AGENT_IDS.has(normalizedId)) {
    return "business_agent";
  }
  if (ENGINEERING_AGENT_IDS.has(normalizedId)) {
    return "engineering_agent";
  }
  const name = normalizeText(agentNameForId(agentId, agentsList));
  if (
    name.includes("chief executive") ||
    name.includes("chief financial") ||
    name.includes("chief legal")
  ) {
    return "business_agent";
  }
  return "engineering_agent";
}

function buildEvidenceRefs(payload: unknown): string[] {
  if (!isRecord(payload)) {
    return [];
  }
  const refs: string[] = [];
  const add = (value: unknown) => {
    if (typeof value !== "string") {
      return;
    }
    const trimmed = value.trim();
    if (!trimmed || refs.includes(trimmed)) {
      return;
    }
    refs.push(trimmed);
  };
  add(payload.sessionKey);
  add(payload.host);
  if (isRecord(payload.request)) {
    add(payload.request.cwd);
    add(payload.request.resolvedPath);
    add(payload.request.sessionKey);
    add(payload.request.command);
  }
  if (isRecord(payload.data)) {
    add(payload.data.sessionKey);
    add(payload.data.path);
    add(payload.data.file);
  }
  return refs.slice(0, 4);
}

function buildSummary(event: string, payload: unknown): string {
  if (!isRecord(payload)) {
    return event;
  }
  if (isRecord(payload.request) && typeof payload.request.command === "string") {
    return payload.request.command;
  }
  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }
  if (isRecord(payload.data)) {
    const data = payload.data;
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message.trim();
    }
    if (typeof data.phase === "string" && data.phase.trim()) {
      return `${event} · ${data.phase.trim()}`;
    }
  }
  return event;
}

function inferScope(
  event: string,
  payload: unknown,
  actorClass: AgentClass,
): { scope: Scope; ambiguous: boolean; note?: string } {
  if (event === "presence" || event.startsWith("device.")) {
    return { scope: "infra", ambiguous: false };
  }
  if (event.startsWith("exec.approval")) {
    return { scope: "engine", ambiguous: false };
  }
  const summary = buildSummary(event, payload).toLowerCase();
  if (summary.includes("research")) {
    return { scope: "research", ambiguous: false };
  }
  if (event === "cron") {
    return { scope: actorClass === "business_agent" ? "product" : "engine", ambiguous: false };
  }
  if (event === "agent") {
    return { scope: actorClass === "business_agent" ? "product" : "engine", ambiguous: false };
  }
  if (event === "chat") {
    return {
      scope: actorClass === "business_agent" ? "product" : "engine",
      ambiguous: actorClass === "engineering_agent",
      note:
        actorClass === "engineering_agent"
          ? "Chat telemetry alone cannot confirm whether the request targeted product or runtime."
          : undefined,
    };
  }
  return {
    scope: "engine",
    ambiguous: true,
    note: "Scope was inferred from generic gateway telemetry rather than an explicit intent tag.",
  };
}

function inferEventType(event: string, payload: unknown): DevEvent["event_type"] {
  if (event === "exec.approval.requested") {
    return "decision_required";
  }
  if (event === "exec.approval.resolved") {
    return "decision_resolved";
  }
  if (event === "cron") {
    return "task_started";
  }
  if (event.startsWith("device.")) {
    return "warning";
  }
  const summary = buildSummary(event, payload).toLowerCase();
  if (summary.includes("test passed") || summary.includes("smoke passed")) {
    return "test_passed";
  }
  if (summary.includes("test failed") || summary.includes("smoke failed")) {
    return "test_failed";
  }
  if (summary.includes("error") || summary.includes("failed") || summary.includes("blocked")) {
    return "blocked";
  }
  if (summary.includes("handoff")) {
    return summary.includes("received") ? "handoff_received" : "handoff_sent";
  }
  if (summary.includes("file") || summary.includes(".md") || summary.includes(".ts")) {
    return "file_changed";
  }
  return "task_started";
}

function inferSurface(scope: Scope, eventType: DevEvent["event_type"]): Surface {
  if (eventType === "decision_required" || eventType === "decision_resolved") {
    return "the_forum";
  }
  if (scope === "product") {
    return "cortex_command";
  }
  return "cortex_praetorium";
}

function buildTitle(event: string, actorName: string, eventType: DevEvent["event_type"]): string {
  switch (eventType) {
    case "decision_required":
      return `${actorName} requested authority`;
    case "decision_resolved":
      return `${actorName} resolved a decision`;
    case "handoff_sent":
      return `${actorName} sent a handoff`;
    case "handoff_received":
      return `${actorName} received a handoff`;
    case "test_passed":
      return "Validation passed";
    case "test_failed":
      return "Validation failed";
    case "file_changed":
      return `${actorName} touched workspace artifacts`;
    case "blocked":
      return `${actorName} hit a blocker`;
    default:
      return `${actorName} reported ${event}`;
  }
}

export function isCollegiumTab(tab: Tab): boolean {
  return COLLEGIUM_TABS.has(tab);
}

export function selectCollegiumEventFeed(
  tab: Tab,
  eventLog: EventLogEntry[],
  eventLogBuffer: EventLogEntry[],
): EventLogEntry[] {
  if (tab === "forum") {
    return eventLogBuffer;
  }
  return eventLog;
}

export function brandingForTab(tab: Tab): Branding {
  if (tab === "command") {
    return { title: "COLLEGIUM CORTEX", subtitle: COLLEGIUM_COMMAND_NAME };
  }
  if (tab === "forum") {
    return { title: "COLLEGIUM CORTEX", subtitle: COLLEGIUM_FORUM_NAME };
  }
  if (tab === "praetorium") {
    return { title: "COLLEGIUM CORTEX", subtitle: COLLEGIUM_PRAETORIUM_NAME };
  }
  return { title: "OPENCLAW", subtitle: "Gateway Dashboard" };
}

export function detectRuntimeEnvironment(
  gatewayUrl: string,
  hello?: GatewayHelloOk | null,
): RuntimeEnvironment {
  const source = `${gatewayUrl} ${JSON.stringify(hello ?? {})}`.toLowerCase();
  if (source.includes("prod")) {
    return "PROD";
  }
  if (source.includes("dev")) {
    return "DEV";
  }
  if (
    source.includes("lab") ||
    source.includes("127.0.0.1") ||
    source.includes("localhost") ||
    source.includes("ws://") ||
    source.includes("wss://")
  ) {
    return "LAB";
  }
  return "LAB";
}

export function buildDevEvents(
  eventLog: EventLogEntry[],
  gatewayUrl: string,
  hello: GatewayHelloOk | null,
  agentsList: AgentsListResult | null,
): DevEvent[] {
  const environment = detectRuntimeEnvironment(gatewayUrl, hello);
  return eventLog.slice(0, 20).map((entry, index) => {
    const actorId = inferAgentId(entry.payload) ?? "system";
    const actorName = actorId === "system" ? "System" : agentNameForId(actorId, agentsList);
    const actorClass =
      actorId === "system" ? "engineering_agent" : inferAgentClass(actorId, agentsList);
    const scopeInfo = inferScope(entry.event, entry.payload, actorClass);
    const eventType = inferEventType(entry.event, entry.payload);
    return {
      id: `${entry.ts}-${entry.event}-${index}`,
      timestamp: new Date(entry.ts).toISOString(),
      environment,
      scope: scopeInfo.scope,
      surface: inferSurface(scopeInfo.scope, eventType),
      actor_id: actorId,
      actor_name: actorName,
      actor_class: actorClass,
      event_type: eventType,
      title: buildTitle(entry.event, actorName, eventType),
      summary: buildSummary(entry.event, entry.payload),
      evidence_refs: buildEvidenceRefs(entry.payload),
      ambiguity_flag: scopeInfo.ambiguous || actorId === "system",
      ambiguity_note:
        scopeInfo.note ??
        (actorId === "system" ? "The event was emitted without an agent identity." : undefined),
    };
  });
}

export function buildPraetoriumBlockers(
  lastError: string | null,
  execApprovalQueue: ExecApprovalRequest[],
  cronJobs: CronJob[],
  recentEvents: DevEvent[],
): string[] {
  const blockers: string[] = [];
  if (lastError?.trim()) {
    blockers.push(lastError.trim());
  }
  if (execApprovalQueue.length > 0) {
    blockers.push(
      `${execApprovalQueue.length} authority request${execApprovalQueue.length === 1 ? "" : "s"} waiting on the Chairman rail.`,
    );
  }
  const failingJobs = cronJobs.filter((job) => job.state?.lastStatus === "error");
  if (failingJobs.length > 0) {
    blockers.push(
      `${failingJobs.length} cron job${failingJobs.length === 1 ? "" : "s"} reported failure.`,
    );
  }
  const blockedEvents = recentEvents.filter((entry) => entry.event_type === "blocked").slice(0, 2);
  blockedEvents.forEach((entry) => blockers.push(entry.summary));
  return blockers;
}

export function buildIntentDisambiguation(recentEvents: DevEvent[]): IntentDisambiguation | null {
  const ambiguous = recentEvents.find((entry) => entry.ambiguity_flag);
  if (!ambiguous) {
    return null;
  }
  return {
    request_id: ambiguous.id,
    raw_request: ambiguous.summary,
    interpreted_scope: ambiguous.scope,
    confidence: 0.52,
    alternatives: ambiguous.scope === "product" ? ["engine", "research"] : ["product", "infra"],
    requires_confirmation: true,
    reason:
      ambiguous.ambiguity_note ??
      "The Control UI received runtime telemetry, but not the original user instruction.",
  };
}

export function buildDevCockpitState(params: CockpitParams): DevCockpitState {
  const recentEvents = buildDevEvents(
    params.eventLog,
    params.gatewayUrl,
    params.hello,
    params.agentsList,
  );
  const blockers = buildPraetoriumBlockers(
    params.lastError,
    params.execApprovalQueue,
    params.cronJobs,
    recentEvents,
  );
  const activeEvent = recentEvents.find((entry) => entry.actor_id !== "system");
  const inProgress = new Set(
    recentEvents.filter((entry) => entry.actor_id !== "system").map((entry) => entry.actor_id),
  ).size;
  const status =
    !params.connected && params.lastError
      ? "error"
      : !params.connected
        ? "waiting"
        : blockers.length > 0
          ? "blocked"
          : recentEvents.length > 0
            ? "running"
            : "waiting";
  return {
    environment: detectRuntimeEnvironment(params.gatewayUrl, params.hello),
    runtime_name: COLLEGIUM_RUNTIME_NAME,
    brand_name: COLLEGIUM_BRAND_NAME,
    protocol_name: COLLEGIUM_PROTOCOL_NAME,
    status,
    current_scope: activeEvent?.scope ?? "engine",
    active_agent: activeEvent
      ? {
          id: activeEvent.actor_id,
          name: activeEvent.actor_name,
          class: activeEvent.actor_class,
          role: activeEvent.actor_name,
          current_task: activeEvent.title,
          started_at: activeEvent.timestamp,
        }
      : undefined,
    queue_counts: {
      in_progress: inProgress,
      pending: params.execApprovalQueue.length,
      blocked: blockers.length,
    },
    unresolved_decisions: params.execApprovalQueue.length,
    active_blockers: blockers.length,
    recent_events: recentEvents,
  };
}

export function countBusinessAgents(agentsList: AgentsListResult | null): number {
  return (
    agentsList?.agents.filter((entry) => inferAgentClass(entry.id, agentsList) === "business_agent")
      .length ?? 0
  );
}

export function countEngineeringAgents(agentsList: AgentsListResult | null): number {
  return (
    agentsList?.agents.filter(
      (entry) => inferAgentClass(entry.id, agentsList) === "engineering_agent",
    ).length ?? 0
  );
}

export function groupAgentsByClass(
  agentsList: AgentsListResult | null,
): Array<GatewayAgentRow & { class: AgentClass; displayName: string }> {
  return (
    agentsList?.agents.map((entry) => ({
      ...entry,
      class: inferAgentClass(entry.id, agentsList),
      displayName: agentNameForId(entry.id, agentsList),
    })) ?? []
  );
}
