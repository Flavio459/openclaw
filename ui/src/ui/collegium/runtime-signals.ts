import type { EventLogEntry } from "../app-events.ts";
import { buildDevEvents, buildIntentDisambiguation } from "../collegium.ts";
import type { ExecApprovalRequest } from "../controllers/exec-approval.ts";
import type { GatewayHelloOk } from "../gateway.ts";
import type { CronStatus, PresenceEntry } from "../types.ts";

export type RuntimeSignalStatus =
  | "nominal"
  | "pending"
  | "waiting"
  | "degraded"
  | "blocked"
  | "none";

export type RuntimeSignal = {
  status: RuntimeSignalStatus;
  detail: string;
  sourceIds: string[];
  observedAt: string | null;
  counts?: Partial<{
    approvals: number;
    sessions: number;
    presence: number;
    cronJobs: number;
    ambiguities: number;
  }>;
};

export type RuntimeSignals = {
  runtimeContinuity: RuntimeSignal;
  authorityPressure: RuntimeSignal;
  automationCadence: RuntimeSignal;
  sessionContinuity: RuntimeSignal;
  strategicAmbiguity: RuntimeSignal;
};

export type RuntimeSignalsInput = {
  connected: boolean;
  lastError: string | null;
  presenceEntries: PresenceEntry[];
  execApprovalQueue: ExecApprovalRequest[];
  cronStatus: CronStatus | null;
  sessionsCount: number | null;
  eventLog: EventLogEntry[];
  gatewayUrl: string;
  hello: GatewayHelloOk | null;
};

function toIso(ts: number | null | undefined): string | null {
  return typeof ts === "number" && Number.isFinite(ts)
    ? new Date(ts).toISOString()
    : null;
}

function latestObservedAt(input: RuntimeSignalsInput): string | null {
  const candidates = [
    ...input.presenceEntries.map((entry) => entry.ts ?? null),
    ...input.eventLog.map((entry) => entry.ts),
  ].filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (candidates.length === 0) {
    return null;
  }
  return new Date(Math.max(...candidates)).toISOString();
}

function buildRuntimeContinuity(input: RuntimeSignalsInput): RuntimeSignal {
  const observedAt = latestObservedAt(input) ?? toIso(input.presenceEntries[0]?.ts ?? null);
  const sourceIds = input.presenceEntries
    .map((entry) => entry.instanceId ?? entry.host ?? null)
    .filter((value): value is string => Boolean(value));

  if (input.lastError) {
    return {
      status: "blocked",
      detail: input.lastError,
      sourceIds: sourceIds.length > 0 ? sourceIds : ["runtime:error"],
      observedAt,
      counts: { presence: input.presenceEntries.length },
    };
  }
  if (!input.connected) {
    return {
      status: "waiting",
      detail: "A continuidade do runtime aguarda uma conexão saudável com o gateway.",
      sourceIds: sourceIds.length > 0 ? sourceIds : ["runtime:offline"],
      observedAt,
      counts: { presence: input.presenceEntries.length },
    };
  }
  if (input.presenceEntries.length === 0) {
    return {
      status: "degraded",
      detail: "O runtime está acessível, mas ainda não há presença viva visível.",
      sourceIds: ["runtime:presence-missing"],
      observedAt,
      counts: { presence: 0 },
    };
  }
  return {
    status: "nominal",
    detail: `${input.presenceEntries.length} instância(s) viva(s) mantêm o runtime observável.`,
    sourceIds,
    observedAt,
    counts: { presence: input.presenceEntries.length },
  };
}

function buildAuthorityPressure(input: RuntimeSignalsInput): RuntimeSignal {
  if (input.execApprovalQueue.length === 0) {
    return {
      status: "none",
      detail: "Nenhuma solicitação de autoridade está aguardando no trilho do Chairman.",
      sourceIds: [],
      observedAt: latestObservedAt(input),
      counts: { approvals: 0 },
    };
  }
  return {
    status: "pending",
    detail: `${input.execApprovalQueue.length} solicitação(ões) de autoridade pressionam o trilho executivo.`,
    sourceIds: input.execApprovalQueue.map((entry) => entry.id),
    observedAt: latestObservedAt(input),
    counts: { approvals: input.execApprovalQueue.length },
  };
}

function buildAutomationCadence(input: RuntimeSignalsInput): RuntimeSignal {
  if (input.cronStatus == null) {
    return {
      status: "waiting",
      detail: "A cadência de automação ainda não está vinculada.",
      sourceIds: ["cron:unbound"],
      observedAt: latestObservedAt(input),
    };
  }
  if (input.cronStatus.jobs <= 0) {
    return {
      status: "none",
      detail: "Nenhuma rotina agendada de automação está ativa na leitura atual.",
      sourceIds: ["cron:none"],
      observedAt: toIso(input.cronStatus.nextWakeAtMs ?? null),
      counts: { cronJobs: 0 },
    };
  }
  return {
    status: "nominal",
    detail: `${input.cronStatus.jobs} rotina(s) de automação mantêm a camada operacional intermediária ativa.`,
    sourceIds: ["cron:status"],
    observedAt: toIso(input.cronStatus.nextWakeAtMs ?? null),
    counts: { cronJobs: input.cronStatus.jobs },
  };
}

function buildSessionContinuity(input: RuntimeSignalsInput): RuntimeSignal {
  if (input.sessionsCount == null) {
    return {
      status: "waiting",
      detail: "A continuidade de sessões ainda não está vinculada.",
      sourceIds: ["sessions:unbound"],
      observedAt: latestObservedAt(input),
    };
  }
  if (input.sessionsCount === 0) {
    return {
      status: "degraded",
      detail: "Nenhuma sessão ativa está visível na leitura operacional atual.",
      sourceIds: ["sessions:empty"],
      observedAt: latestObservedAt(input),
      counts: { sessions: 0 },
    };
  }
  return {
    status: "nominal",
    detail: `${input.sessionsCount} sessão(ões) ativa(s) sustentam a leitura atual de continuidade.`,
    sourceIds: ["sessions:visible"],
    observedAt: latestObservedAt(input),
    counts: { sessions: input.sessionsCount },
  };
}

function buildStrategicAmbiguity(input: RuntimeSignalsInput): RuntimeSignal {
  const recentEvents = buildDevEvents(input.eventLog, input.gatewayUrl, input.hello, null);
  const ambiguity = buildIntentDisambiguation(recentEvents);
  if (!ambiguity) {
    return {
      status: "none",
      detail: "Nenhuma ambiguidade estratégica está aberta no feed atual.",
      sourceIds: [],
      observedAt: latestObservedAt(input),
      counts: { ambiguities: 0 },
    };
  }
  return {
    status: "pending",
    detail: ambiguity.reason,
    sourceIds: [ambiguity.request_id],
    observedAt: latestObservedAt(input),
    counts: { ambiguities: 1 },
  };
}

export function buildRuntimeSignals(input: RuntimeSignalsInput): RuntimeSignals {
  return {
    runtimeContinuity: buildRuntimeContinuity(input),
    authorityPressure: buildAuthorityPressure(input),
    automationCadence: buildAutomationCadence(input),
    sessionContinuity: buildSessionContinuity(input),
    strategicAmbiguity: buildStrategicAmbiguity(input),
  };
}
