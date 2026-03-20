import type {
  AgentRole,
  DecisionTrace,
  DecisionTraceValidation,
  DeliberativeAction,
  EscalationReason,
  GovernanceOutcome,
  Mandate,
} from "./agentic-governance.contract.ts";

type MandatePolicy = {
  owner: AgentRole;
  accountable: AgentRole;
  consulted: AgentRole[];
  informed: AgentRole[];
};

const SENSITIVE_MANDATES = new Set<Mandate>([
  "economics",
  "compliance",
  "narrative",
  "chairman",
]);

const MANDATE_POLICIES: Record<Mandate, MandatePolicy> = {
  strategy: {
    owner: "ceo",
    accountable: "ceo",
    consulted: ["cfo"],
    informed: ["chairman"],
  },
  architecture: {
    owner: "cto",
    accountable: "cto",
    consulted: ["main", "ped"],
    informed: ["ceo"],
  },
  economics: {
    owner: "cfo",
    accountable: "cfo",
    consulted: ["ceo", "legal"],
    informed: ["chairman"],
  },
  compliance: {
    owner: "legal",
    accountable: "legal",
    consulted: ["ceo"],
    informed: ["chairman"],
  },
  narrative: {
    owner: "cmo",
    accountable: "cmo",
    consulted: ["ceo", "legal", "cfo"],
    informed: ["chairman"],
  },
  operations: {
    owner: "main",
    accountable: "cto",
    consulted: ["ped"],
    informed: ["ceo"],
  },
  chairman: {
    owner: "chairman",
    accountable: "chairman",
    consulted: ["ceo"],
    informed: [],
  },
};

function dedupeRoles(roles: AgentRole[]): AgentRole[] {
  return [...new Set(roles)];
}

function dedupeReasons(reasons: EscalationReason[]): EscalationReason[] {
  return [...new Set(reasons)];
}

function deriveConsultedRoles(
  trace: Pick<DecisionTrace, "agentRole" | "mandate" | "consulted" | "escalationReasons">,
): AgentRole[] {
  const policy = MANDATE_POLICIES[trace.mandate];
  const autoConsulted: AgentRole[] = [];

  if (trace.agentRole !== policy.owner) {
    autoConsulted.push(policy.owner);
  }
  if (
    trace.escalationReasons.includes("compliance_risk") &&
    trace.agentRole !== "legal"
  ) {
    autoConsulted.push("legal");
  }
  if (
    trace.escalationReasons.includes("economic_change") &&
    trace.agentRole !== "cfo"
  ) {
    autoConsulted.push("cfo");
  }
  if (
    trace.escalationReasons.includes("cross_mandate_conflict") &&
    trace.agentRole !== "ceo"
  ) {
    autoConsulted.push("ceo");
  }
  if (
    trace.escalationReasons.includes("reputational_risk") &&
    trace.agentRole !== "legal"
  ) {
    autoConsulted.push("legal");
  }

  return dedupeRoles([...policy.consulted, ...trace.consulted, ...autoConsulted]);
}

export function resolveGovernanceOutcome(
  trace: Pick<
    DecisionTrace,
    "agentRole" | "mandate" | "consulted" | "evidenceIds" | "escalationReasons"
  >,
): GovernanceOutcome {
  const policy = MANDATE_POLICIES[trace.mandate];
  const evidenceMissingReasons: EscalationReason[] =
    trace.evidenceIds.length === 0 ? ["insufficient_evidence"] : [];
  const escalationReasons = dedupeReasons([
    ...trace.escalationReasons,
    ...evidenceMissingReasons,
  ]);
  const consulted = deriveConsultedRoles({
    agentRole: trace.agentRole,
    mandate: trace.mandate,
    consulted: trace.consulted,
    escalationReasons,
  });
  const hitlRequired =
    SENSITIVE_MANDATES.has(trace.mandate) || escalationReasons.length > 0;

  return {
    owner: policy.owner,
    accountable: policy.accountable,
    consulted,
    informed: dedupeRoles([...policy.informed, trace.agentRole, "chairman"]).filter(
      (role) => role !== policy.accountable,
    ),
    hitlRequired,
    escalate: escalationReasons.length > 0,
    escalationReasons,
  };
}

export function deriveDeliberativeAction(
  trace: Pick<DecisionTrace, "evidenceIds" | "escalationReasons">,
): DeliberativeAction {
  const escalationReasons = dedupeReasons(trace.escalationReasons);
  if (
    trace.evidenceIds.length === 0 ||
    escalationReasons.includes("insufficient_evidence")
  ) {
    return "defer";
  }
  if (escalationReasons.length > 0) {
    return "escalate";
  }
  return "approve";
}

export function validateDecisionTrace(trace: DecisionTrace): DecisionTraceValidation {
  const outcome = resolveGovernanceOutcome(trace);
  const issues: string[] = [];

  if (!trace.status) {
    issues.push("DecisionTrace.status is required.");
  }
  if (!trace.nextResponsible) {
    issues.push("DecisionTrace.nextResponsible is required.");
  }
  if (!trace.summary.trim()) {
    issues.push("DecisionTrace.summary is required.");
  }
  if (!trace.rationale.trim()) {
    issues.push("DecisionTrace.rationale is required.");
  }
  if (trace.evidenceIds.length === 0) {
    issues.push("Sensitive recommendations require evidenceIds.");
  }
  if (SENSITIVE_MANDATES.has(trace.mandate) && !trace.hitlRequired) {
    issues.push("Sensitive mandates must require HITL.");
  }
  if (
    trace.escalationReasons.includes("cross_mandate_conflict") &&
    !trace.escalate
  ) {
    issues.push("Cross-mandate conflicts cannot be silently synthesized.");
  }
  if (
    trace.escalationReasons.includes("insufficient_evidence") &&
    trace.evidenceIds.length > 0
  ) {
    issues.push("Insufficient evidence cannot coexist with non-empty evidenceIds.");
  }

  return {
    ok: issues.length === 0,
    issues,
    outcome,
  };
}
