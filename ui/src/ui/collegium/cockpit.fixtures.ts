import type { CockpitContract } from "./cockpit.contract.ts";

export const cockpitBaselineFixture: CockpitContract = {
  identityAndActivation:
    "Pilot identity, activation tier, and readiness status remain the first read of the surface.",
  cityReadiness:
    "The city only becomes actionable when operational readiness is explicit, not inferred by marketing copy.",
  networkPosition:
    "The pilot sees rank, referral tree position, and direct network leverage without exposing technical supervision rails.",
  turnState:
    "Turn state stays grounded in honest operational signs and never fabricates payout or demand certainty.",
  upState:
    "UP remains visible as protocol state, not as promotional pressure or guaranteed financial outcome.",
  rankState:
    "Rank progression is readable, but still subordinate to compliance, activation, and city readiness.",
  alerts: [
    "No passenger-facing workflow enters this phase.",
    "No payout logic or economic execution is bound in the current contract.",
  ],
  complianceNotices: [
    "Any compensation, remuneration, or payout rule requires explicit CFO and Legal gate.",
    "The Cockpit remains distinct from Cortex Praetorium in naming, UX, and responsibility.",
  ],
  bindingState: "placeholder",
  bindingSources: ["fixture:baseline"],
};

export const cockpitDormantCityFixture: CockpitContract = {
  ...cockpitBaselineFixture,
  cityReadiness:
    "A dormant city state must read as inactive and waiting for validated readiness, not as latent demand.",
  alerts: [
    ...cockpitBaselineFixture.alerts,
    "Dormant city mode blocks activation framing until readiness becomes explicit.",
  ],
  bindingState: "placeholder",
  bindingSources: ["fixture:dormant-city"],
};

export const cockpitComplianceHoldFixture: CockpitContract = {
  ...cockpitBaselineFixture,
  identityAndActivation:
    "Activation is visible, but it remains held until compliance evidence is complete and current.",
  turnState:
    "Turn state may stay visible as staged readiness, but it cannot imply release, demand, or payout while the hold remains.",
  alerts: [
    "Compliance hold prevents launch of the pilot-facing flow.",
    "Activation copy must remain procedural and non-promotional while evidence is incomplete.",
  ],
  complianceNotices: [
    "Missing compliance evidence escalates to CFO and Legal before any operational unlock.",
    "The Cockpit cannot imply economic outcome while a hold is active.",
  ],
  bindingState: "placeholder",
  bindingSources: ["fixture:compliance-hold"],
};
