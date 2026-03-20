export type PortalFirstBlockState =
  | "portal-default"
  | "portal-high-tension"
  | "portal-low-signal"
  | "portal-mobile-compact"
  | "portal-mobile-continuity";

export type PortalFirstBlockContract = {
  visualPriority: {
    primaryCtaDominance: true;
    syntheticPanelSubordinate: true;
  };
  narrativeGuardrails: {
    forbidCommunityDrift: true;
    forbidEconomicPromiseDrift: true;
    secondaryCtaMethodologicalOnly: true;
  };
  readingOrder: [
    "context_short",
    "headline",
    "subheadline",
    "primary_cta",
    "synthetic_panel",
    "secondary_cta",
  ];
};

export type PortalRuntimeBaselineSignal =
  | "presence_continuity"
  | "heartbeat_recency"
  | "input_freshness"
  | "session_continuity"
  | "authority_queue_pressure";

export type PortalRuntimeBaselineExcludedSignal =
  | "turn_quality"
  | "economic_outcome"
  | "channel_mix"
  | "cron_cadence";

export type PortalRuntimeBaselineContract = {
  status: "internal-stable";
  includedSignals: PortalRuntimeBaselineSignal[];
  excludedSignals: PortalRuntimeBaselineExcludedSignal[];
  nextExpansionGate: "first_turn_metric_contract";
};

export type PortalFirstBlockViewModel = {
  state: PortalFirstBlockState;
  contextLine: string;
  primaryHeadline: string;
  supportingSubheadline: string;
  primaryCta: {
    label: string;
    href: string;
  };
  signalPanel: {
    compressedMargin: string;
    leakPoint: string;
    nextAdjustment: string;
    dataState: "observed" | "placeholder";
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  guardrails: PortalFirstBlockContract["narrativeGuardrails"];
};

export const PORTAL_FIRST_BLOCK_CONTRACT: PortalFirstBlockContract = {
  visualPriority: {
    primaryCtaDominance: true,
    syntheticPanelSubordinate: true,
  },
  narrativeGuardrails: {
    forbidCommunityDrift: true,
    forbidEconomicPromiseDrift: true,
    secondaryCtaMethodologicalOnly: true,
  },
  readingOrder: [
    "context_short",
    "headline",
    "subheadline",
    "primary_cta",
    "synthetic_panel",
    "secondary_cta",
  ],
};

export const PORTAL_DEFAULT_RUNTIME_BASELINE: PortalRuntimeBaselineContract = {
  status: "internal-stable",
  includedSignals: [
    "presence_continuity",
    "heartbeat_recency",
    "input_freshness",
    "session_continuity",
    "authority_queue_pressure",
  ],
  excludedSignals: ["turn_quality", "economic_outcome", "channel_mix", "cron_cadence"],
  nextExpansionGate: "first_turn_metric_contract",
};
