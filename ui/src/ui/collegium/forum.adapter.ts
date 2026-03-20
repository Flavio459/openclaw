import type { EventLogEntry } from "../app-events.ts";
import {
  COLLEGIUM_FORUM_NAME,
  buildDevEvents,
  buildIntentDisambiguation,
  buildPraetoriumBlockers,
  detectRuntimeEnvironment,
  groupAgentsByClass,
} from "../collegium.ts";
import type { ExecApprovalRequest } from "../controllers/exec-approval.ts";
import type { GatewayHelloOk } from "../gateway.ts";
import type { AgentsListResult, CronJob } from "../types.ts";
import {
  deriveDeliberativeAction,
  resolveGovernanceOutcome,
  validateDecisionTrace,
} from "./agentic-governance.ts";
import type { DecisionTrace } from "./agentic-governance.contract.ts";
import type { ForumEvidenceItem, ForumOption, ForumViewModel } from "./forum.contract.ts";

export type ForumAdapterInput = {
  gatewayUrl: string;
  hello: GatewayHelloOk | null;
  agentsList: AgentsListResult | null;
  eventLog: EventLogEntry[];
  execApprovalQueue: ExecApprovalRequest[];
  connected: boolean;
  lastError: string | null;
  cronJobs: CronJob[];
};

function buildEvidence(input: ForumAdapterInput): ForumEvidenceItem[] {
  const recentEvents = buildDevEvents(
    input.eventLog,
    input.gatewayUrl,
    input.hello,
    input.agentsList,
  );
  const blockers = buildPraetoriumBlockers(
    input.lastError,
    input.execApprovalQueue,
    input.cronJobs,
    recentEvents,
  );
  const ambiguity = buildIntentDisambiguation(recentEvents);

  const approvalEvidence = input.execApprovalQueue.slice(0, 3).map((entry) => ({
    id: entry.id,
    kind: "approval" as const,
    summary:
      entry.request.ask?.trim() ||
      entry.request.command?.trim() ||
      "Solicitação de autoridade aguardando decisão.",
    source: "exec_approval_queue",
    severity: "high" as const,
  }));
  const eventEvidence = recentEvents
    .filter((entry) => entry.surface === "the_forum" || entry.scope === "product")
    .slice(0, 3)
    .map((entry) => ({
      id: entry.id,
      kind: "event" as const,
      summary: entry.summary,
      source: entry.actor_name,
      severity: entry.ambiguity_flag ? ("medium" as const) : ("low" as const),
    }));
  const blockerEvidence = blockers.slice(0, 2).map((entry, index) => ({
    id: `blocker-${index + 1}`,
    kind: "blocker" as const,
    summary: entry,
    source: "praetorium_blockers",
    severity: "high" as const,
  }));
  const ambiguityEvidence = ambiguity
    ? [
        {
          id: ambiguity.request_id,
          kind: "ambiguity" as const,
          summary: ambiguity.reason,
          source: "intent_disambiguation",
          severity: "medium" as const,
        },
      ]
    : [];
  const runtimeEvidence =
    input.lastError != null
      ? [
          {
            id: "runtime-error",
            kind: "runtime" as const,
            summary: input.lastError,
            source: "gateway",
            severity: "high" as const,
          },
        ]
      : [];

  return [
    ...approvalEvidence,
    ...eventEvidence,
    ...blockerEvidence,
    ...ambiguityEvidence,
    ...runtimeEvidence,
  ];
}

function deriveTraceStatus(
  action: "approve" | "defer" | "escalate",
): DecisionTrace["status"] {
  if (action === "approve") {
    return "approved";
  }
  if (action === "defer") {
    return "deferred";
  }
  return "escalated";
}

function deriveNextResponsible(
  action: "approve" | "defer" | "escalate",
  trace: Pick<DecisionTrace, "agentRole">,
): DecisionTrace["nextResponsible"] {
  if (action === "escalate") {
    return "human-chairman";
  }
  if (action === "defer") {
    return trace.agentRole;
  }
  return "lead-dev";
}

function buildTrace(input: ForumAdapterInput, evidence: ForumEvidenceItem[]): DecisionTrace {
  const ambiguity = evidence.find((entry) => entry.kind === "ambiguity");
  const observedAt = new Date(
    Math.max(...input.eventLog.map((entry) => entry.ts), Date.now()),
  ).toISOString();

  if (input.lastError) {
    const seed: DecisionTrace = {
      traceId: "forum-runtime-degradation",
      agentRole: "main",
      mandate: "operations",
      summary: "A degradação do runtime alcançou a sala deliberativa.",
      rationale:
        "Um erro bloqueante de runtime agora está acoplado ao trilho de autoridade e não pode ser tratado como ruído de bastidor.",
      evidenceIds: evidence.map((entry) => entry.id).slice(0, 4),
      consulted: ["ceo"],
      hitlRequired: false,
      escalate: false,
      escalationReasons: ["runtime_degradation"],
      status: "review_required",
      nextResponsible: "human-chairman",
      observedAt,
    };
    const outcome = resolveGovernanceOutcome(seed);
    const action = deriveDeliberativeAction(seed);
    return {
      ...seed,
      consulted: outcome.consulted,
      hitlRequired: outcome.hitlRequired,
      escalate: outcome.escalate,
      escalationReasons: outcome.escalationReasons,
      status: deriveTraceStatus(action),
      nextResponsible: deriveNextResponsible(action, seed),
    };
  }

  if (input.execApprovalQueue.length > 0) {
    const firstApproval = input.execApprovalQueue[0];
    const seed: DecisionTrace = {
      traceId: "forum-authority-case",
      agentRole: "ceo",
      mandate: "strategy",
      summary:
        firstApproval.request.ask?.trim() ||
        firstApproval.request.command?.trim() ||
        "Uma solicitação de autoridade entrou na sala.",
      rationale:
        ambiguity != null
          ? "A sala tem uma solicitação de autoridade ativa, mas a telemetria ainda deixa ambiguidade material de escopo ou enquadramento."
          : "A sala tem evidência suficiente para recomendar um caminho estratégico antes de tocar o trilho do Chairman.",
      evidenceIds: evidence.map((entry) => entry.id).slice(0, 4),
      consulted: [],
      hitlRequired: false,
      escalate: false,
      escalationReasons: ambiguity != null ? ["insufficient_evidence"] : [],
      status: "review_required",
      nextResponsible: ambiguity != null ? "ceo" : "lead-dev",
      observedAt,
    };
    const outcome = resolveGovernanceOutcome(seed);
    const action = deriveDeliberativeAction(seed);
    return {
      ...seed,
      consulted: outcome.consulted,
      hitlRequired: outcome.hitlRequired,
      escalate: outcome.escalate,
      escalationReasons: outcome.escalationReasons,
      status: deriveTraceStatus(action),
      nextResponsible: deriveNextResponsible(action, seed),
    };
  }

  const seed: DecisionTrace = {
    traceId: `${COLLEGIUM_FORUM_NAME.toLowerCase().replace(/\s+/g, "-")}-clear-room`,
    agentRole: "ceo",
    mandate: "strategy",
    summary:
      ambiguity?.summary ?? "A sala está livre para revisão estratégica proativa.",
    rationale:
      ambiguity != null
        ? "A sala enxerga contexto, mas ainda não tem evidência suficiente para avançar uma escolha estrutural."
        : "Não há fila viva de autoridade; a sala pode manter vigilância deliberativa sem fabricar urgência.",
    evidenceIds: evidence.map((entry) => entry.id).slice(0, 4),
    consulted: [],
    hitlRequired: false,
    escalate: false,
    escalationReasons: ambiguity != null ? ["insufficient_evidence"] : [],
    status: "review_required",
    nextResponsible: ambiguity != null ? "ceo" : "lead-dev",
    observedAt,
  };
  const outcome = resolveGovernanceOutcome(seed);
  const action = deriveDeliberativeAction(seed);
  return {
    ...seed,
    consulted: outcome.consulted,
    hitlRequired: outcome.hitlRequired,
    escalate: outcome.escalate,
    escalationReasons: outcome.escalationReasons,
    status: deriveTraceStatus(action),
    nextResponsible: deriveNextResponsible(action, seed),
  };
}

function buildOptions(evidenceIds: string[]): ForumOption[] {
  return [
    {
      id: "approve",
      label: "Avançar com a evidência atual",
      consequence: "Move o caminho atual sem reabrir a sala.",
      evidenceIds,
    },
    {
      id: "defer",
      label: "Segurar até a sala ficar mais clara",
      consequence: "Mantém a ação pausada enquanto mais evidência ou desambiguação é reunida.",
      evidenceIds,
    },
    {
      id: "escalate",
      label: "Escalonar para o trilho do Chairman",
      consequence: "Envia o caso para cima porque risco, conflito de mandato ou degradação já estão ativos.",
      evidenceIds,
    },
  ];
}

function buildParticipants(input: ForumAdapterInput, trace: DecisionTrace): string[] {
  const governance = resolveGovernanceOutcome(trace);
  const liveParticipants = groupAgentsByClass(input.agentsList).map(
    (agent) => `${agent.displayName} (${agent.id})`,
  );
  return [
    ...new Set([
      `${governance.owner} · owner`,
      `${governance.accountable} · accountable`,
      ...governance.consulted.map((role) => `${role} · consulted`),
      ...liveParticipants,
    ]),
  ];
}

function buildRisks(
  input: ForumAdapterInput,
  trace: DecisionTrace,
  evidence: ForumEvidenceItem[],
): string[] {
  const risks: string[] = [];
  if (input.lastError) {
    risks.push("A degradação do runtime já está visível na sala.");
  }
  if (trace.escalationReasons.includes("cross_mandate_conflict")) {
    risks.push("Um conflito entre mandatos não pode ser reduzido a um consenso cosmético.");
  }
  if (trace.escalationReasons.includes("insufficient_evidence")) {
    risks.push("A sala ainda não tem evidência suficiente para uma recomendação no nível de aprovação.");
  }
  if (input.execApprovalQueue.length > 0) {
    risks.push("A pressão de autoridade está ativa e pode atropelar a estratégia se a sala continuar vaga.");
  }
  if (evidence.some((entry) => entry.kind === "ambiguity")) {
    risks.push("A ambiguidade da telemetria está visível e precisa ser tratada explicitamente.");
  }
  return risks;
}

export function buildForumViewModel(input: ForumAdapterInput): ForumViewModel {
  const evidence = buildEvidence(input);
  const trace = buildTrace(input, evidence);
  const validation = validateDecisionTrace(trace);
  const action = deriveDeliberativeAction(trace);
  const options = buildOptions(trace.evidenceIds);
  const recommendedPath = options.find((option) => option.id === action) ?? options[1]!;
  const governance = resolveGovernanceOutcome(trace);
  const environment = detectRuntimeEnvironment(input.gatewayUrl, input.hello);

  const risks = buildRisks(input, trace, evidence);
  if (!validation.ok) {
    risks.push(...validation.issues);
  }

  return {
    topic: trace.summary,
    context:
      action === "escalate"
        ? `${environment} está mostrando um caso que já exige disciplina explícita de escalonamento.`
        : action === "defer"
          ? `${environment} ainda precisa de mais evidência antes de a sala aprovar um caminho.`
          : `${environment} tem evidência suficiente para uma recomendação pronta para decisão sem inventar drama extra.`,
    participants: buildParticipants(input, trace),
    evidence,
    options,
    risks,
    decisionTrace: [
      {
        ...trace,
        consulted: governance.consulted,
        hitlRequired: governance.hitlRequired,
        escalate: governance.escalate,
        escalationReasons: governance.escalationReasons,
      },
    ],
    recommendedPath: {
      optionId: recommendedPath.id,
      rationale: trace.rationale,
      evidenceIds: trace.evidenceIds,
      traceId: trace.traceId,
    },
    chairmanAction: {
      action,
      reason:
        action === "approve"
          ? "A sala tem evidência suficiente para avançar o caminho atual."
          : action === "defer"
            ? "A sala ainda precisa de evidência mais clara antes da aprovação."
            : "Risco, degradação ou conflito de mandato já justificam escalonamento.",
      evidenceIds: trace.evidenceIds,
      traceId: trace.traceId,
    },
  };
}
