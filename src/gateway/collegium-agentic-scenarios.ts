import type {
  DecisionTrace,
  DeliberativeAction,
  EscalationReason,
} from "../../ui/src/ui/collegium/agentic-governance.contract.ts";

export type CollegiumAgenticScenario = {
  id: string;
  title: string;
  trace: DecisionTrace;
  expected: {
    action: DeliberativeAction;
    escalationReasons: EscalationReason[];
    hitlRequired: boolean;
    owner: DecisionTrace["agentRole"] | "cto" | "cmo" | "chairman";
    consultedIncludes: DecisionTrace["agentRole"][];
  };
};

function makeTrace(overrides: Partial<DecisionTrace>): DecisionTrace {
  return {
    traceId: overrides.traceId ?? "trace-default",
    agentRole: overrides.agentRole ?? "ceo",
    mandate: overrides.mandate ?? "strategy",
    summary: overrides.summary ?? "Decision-ready scenario.",
    rationale: overrides.rationale ?? "The room must preserve mandate and evidence.",
    evidenceIds: overrides.evidenceIds ?? ["evidence-1"],
    consulted: overrides.consulted ?? [],
    hitlRequired: overrides.hitlRequired ?? false,
    escalate: overrides.escalate ?? false,
    escalationReasons: overrides.escalationReasons ?? [],
    status: overrides.status ?? "review_required",
    nextResponsible: overrides.nextResponsible ?? "lead-dev",
    observedAt: overrides.observedAt ?? "2026-03-13T00:00:00.000Z",
  };
}

export const collegiumAgenticScenarios: CollegiumAgenticScenario[] = [
  {
    id: "ceo-vs-cfo-expansion-conflict",
    title: "CEO proposes expansion and CFO rejects sustainability",
    trace: makeTrace({
      traceId: "trace-expansion-conflict",
      agentRole: "ceo",
      mandate: "strategy",
      summary: "Expansion path conflicts with financial sustainability.",
      rationale: "The growth path creates a cross-mandate conflict with economics.",
      consulted: ["cfo"],
      escalationReasons: ["cross_mandate_conflict"],
    }),
    expected: {
      action: "escalate",
      escalationReasons: ["cross_mandate_conflict"],
      hitlRequired: true,
      owner: "ceo",
      consultedIncludes: ["cfo"],
    },
  },
  {
    id: "cto-sensitive-automation-compliance",
    title: "CTO proposes sensitive automation with compliance impact",
    trace: makeTrace({
      traceId: "trace-cto-compliance",
      agentRole: "cto",
      mandate: "architecture",
      summary: "Sensitive automation touches compliance and runtime guardrails.",
      rationale: "The architecture path affects policy, runtime trust, and auditability.",
      escalationReasons: ["compliance_risk", "reputational_risk"],
    }),
    expected: {
      action: "escalate",
      escalationReasons: ["compliance_risk", "reputational_risk"],
      hitlRequired: true,
      owner: "cto",
      consultedIncludes: ["legal"],
    },
  },
  {
    id: "cmo-public-narrative-insufficient-evidence",
    title: "CMO proposes narrative change without enough evidence",
    trace: makeTrace({
      traceId: "trace-cmo-narrative",
      agentRole: "cmo",
      mandate: "narrative",
      summary: "Public narrative change lacks enough evidence.",
      rationale: "The room does not yet have enough structured evidence for release.",
      evidenceIds: [],
      escalationReasons: ["insufficient_evidence"],
      hitlRequired: true,
      escalate: true,
    }),
    expected: {
      action: "defer",
      escalationReasons: ["insufficient_evidence"],
      hitlRequired: true,
      owner: "cmo",
      consultedIncludes: ["legal", "cfo"],
    },
  },
  {
    id: "runtime-degraded-with-pending-approvals",
    title: "Runtime degrades while authority queue remains pending",
    trace: makeTrace({
      traceId: "trace-runtime-degraded",
      agentRole: "main",
      mandate: "operations",
      summary: "Runtime degradation reached the authority rail.",
      rationale: "A degraded runtime plus live approvals creates executive tension.",
      escalationReasons: ["runtime_degradation"],
    }),
    expected: {
      action: "escalate",
      escalationReasons: ["runtime_degradation"],
      hitlRequired: true,
      owner: "main",
      consultedIncludes: ["ped"],
    },
  },
];
