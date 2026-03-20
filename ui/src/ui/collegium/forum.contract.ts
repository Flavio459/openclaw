import type { DecisionTrace } from "./agentic-governance.contract.ts";

export type ForumEvidenceItem = {
  id: string;
  kind: "approval" | "event" | "blocker" | "ambiguity" | "runtime";
  summary: string;
  source: string;
  severity: "low" | "medium" | "high";
};

export type ForumOption = {
  id: "approve" | "defer" | "escalate";
  label: string;
  consequence: string;
  evidenceIds: string[];
};

export type ForumViewModel = {
  topic: string;
  context: string;
  participants: string[];
  evidence: ForumEvidenceItem[];
  options: ForumOption[];
  risks: string[];
  decisionTrace: DecisionTrace[];
  recommendedPath: {
    optionId: ForumOption["id"];
    rationale: string;
    evidenceIds: string[];
    traceId: string;
  };
  chairmanAction: {
    action: "approve" | "defer" | "escalate";
    reason: string;
    evidenceIds: string[];
    traceId: string;
  };
};
