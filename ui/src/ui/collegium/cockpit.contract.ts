export type CockpitBindingState = "observed" | "placeholder";

export type CockpitContract = {
  identityAndActivation: string;
  cityReadiness: string;
  networkPosition: string;
  turnState: string;
  upState: string;
  rankState: string;
  alerts: string[];
  complianceNotices: string[];
  bindingState: CockpitBindingState;
  bindingSources: string[];
};
