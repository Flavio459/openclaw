import type { RuntimeEnvironment } from "../collegium.ts";

export type CommandModuleId =
  | "boardroom"
  | "operations"
  | "capital_assets"
  | "compliance"
  | "foundry";

export type CommandViewModel = {
  environment: RuntimeEnvironment;
  institutionState: {
    status: "operational" | "awaiting_runtime" | "attention_required";
    detail: string;
  };
  chairmanRail: {
    pendingAuthorityCount: number;
  };
  collaborators: {
    total: number;
    business: number;
    engineering: number;
  };
  commandPriority: {
    headline: string;
    tension: string;
  };
  dominantWorkstream: {
    label: string;
    summary: string;
  };
  signalContext: {
    authorityPressure: string;
    automationCadence: string;
    strategicAmbiguity: string;
  };
  modules: Array<{
    id: CommandModuleId;
    name: string;
    owner: string;
    status: string;
    detail: string;
  }>;
  executionEnvelope: {
    pilotsTelemetry: "not_bound";
    financialFeed: "not_bound";
    runtimePresence: string;
    authorityRail: string;
  };
  bridges: {
    forumLabel: string;
    praetoriumLabel: string;
  };
};
