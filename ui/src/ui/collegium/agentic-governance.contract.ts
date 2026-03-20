export type AgentRole =
  | "main"
  | "ceo"
  | "cto"
  | "cfo"
  | "legal"
  | "cmo"
  | "ped"
  | "chairman";

export type Mandate =
  | "strategy"
  | "architecture"
  | "economics"
  | "compliance"
  | "narrative"
  | "operations"
  | "chairman";

export type EscalationReason =
  | "structural_change"
  | "economic_change"
  | "compliance_risk"
  | "reputational_risk"
  | "cross_mandate_conflict"
  | "insufficient_evidence"
  | "runtime_degradation";

export type DeliberativeAction = "approve" | "defer" | "escalate";

export type DecisionTraceStatus =
  | "draft"
  | "review_required"
  | "deferred"
  | "escalated"
  | "approved";

export type DecisionTrace = {
  traceId: string;
  agentRole: AgentRole;
  mandate: Mandate;
  summary: string;
  rationale: string;
  evidenceIds: string[];
  consulted: AgentRole[];
  hitlRequired: boolean;
  escalate: boolean;
  escalationReasons: EscalationReason[];
  status: DecisionTraceStatus;
  nextResponsible: AgentRole | "human-chairman" | "lead-dev";
  observedAt: string;
};

export type GovernanceOutcome = {
  owner: AgentRole;
  accountable: AgentRole;
  consulted: AgentRole[];
  informed: AgentRole[];
  hitlRequired: boolean;
  escalate: boolean;
  escalationReasons: EscalationReason[];
};

export type DecisionTraceValidation = {
  ok: boolean;
  issues: string[];
  outcome: GovernanceOutcome;
};
