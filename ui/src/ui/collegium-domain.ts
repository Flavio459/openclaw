export type PilotId = string;
export type PassengerId = string;
export type MobilityEventId = string;
export type DeliberationId = string;
export type NetworkNodeId = string;

export type PilotStatus = "candidate" | "active" | "restricted" | "suspended";
export type PassengerStatus = "active" | "flagged" | "restricted";
export type MobilityEventStatus =
  | "requested"
  | "matched"
  | "in_progress"
  | "completed"
  | "canceled"
  | "contested";
export type DeliberationStatus = "draft" | "under_review" | "pending_chairman" | "resolved";

export type Pilot = {
  id: PilotId;
  displayName: string;
  status: PilotStatus;
  reputationScore: number;
  productionUnitsValidated: number;
  networkNodeId: NetworkNodeId;
  activeMobilityEvents: number;
  flags: string[];
};

export type Passenger = {
  id: PassengerId;
  displayName: string;
  status: PassengerStatus;
  reputationScore: number;
  trustFlags: string[];
  completedTrips: number;
};

export type MobilityEvent = {
  id: MobilityEventId;
  pilotId: PilotId;
  passengerId: PassengerId;
  status: MobilityEventStatus;
  startedAt?: string;
  completedAt?: string;
  productionUnitsGenerated: number;
  routeLabel: string;
  riskSignals: string[];
  evidenceRefs: string[];
};

export type ProductionUnitLedgerEntry = {
  mobilityEventId: MobilityEventId;
  pilotId: PilotId;
  amount: number;
  validatedAt: string;
  evidenceRefs: string[];
};

export type EconomicNetworkNode = {
  id: NetworkNodeId;
  label: string;
  pilotIds: PilotId[];
  supervisedBy?: PilotId;
  activeProductionUnits: number;
};

export type DeliberationRiskLevel = "low" | "medium" | "high";

export type DeliberationCase = {
  id: DeliberationId;
  title: string;
  status: DeliberationStatus;
  linkedMobilityEventIds: MobilityEventId[];
  linkedPilotIds: PilotId[];
  riskLevel: DeliberationRiskLevel;
  summary: string;
  options: string[];
  recommendedPath: string;
  chairmanActionRequired: boolean;
  evidenceRefs: string[];
};

export type CollegiumDomainSnapshot = {
  generatedAt: string;
  pilots: Pilot[];
  passengers: Passenger[];
  mobilityEvents: MobilityEvent[];
  productionLedger: ProductionUnitLedgerEntry[];
  networkNodes: EconomicNetworkNode[];
  deliberations: DeliberationCase[];
};

export type CommandDomainProjection = {
  pilotCount: number;
  activePilotCount: number;
  restrictedPilotCount: number;
  passengerCount: number;
  flaggedPassengerCount: number;
  activeMobilityCount: number;
  completedMobilityCount: number;
  contestedMobilityCount: number;
  validatedProductionUnits: number;
  connectedNetworkCount: number;
  pendingDeliberationCount: number;
  operationalAlerts: string[];
  networkSummary: Array<{
    id: NetworkNodeId;
    label: string;
    pilotCount: number;
    activeProductionUnits: number;
    supervisedBy?: PilotId;
    activeMobilityCount: number;
    contestedMobilityCount: number;
    pressureLevel: "steady" | "elevated" | "critical";
  }>;
  governanceWatchlist: Array<{
    id: string;
    kind: "pilot" | "passenger" | "mobility";
    title: string;
    status: string;
    summary: string;
  }>;
  pilotBoard: Array<{
    id: PilotId;
    displayName: string;
    status: PilotStatus;
    reputationScore: number;
    productionUnitsValidated: number;
    activeMobilityEvents: number;
    flags: string[];
  }>;
  mobilityBoard: Array<{
    id: MobilityEventId;
    routeLabel: string;
    status: MobilityEventStatus;
    pilotLabel: string;
    passengerLabel: string;
    productionUnitsGenerated: number;
    riskSignals: string[];
  }>;
  provenance: "fixture_projection";
};

export type ForumStrategicHighlight = {
  id: string;
  title: string;
  summary: string;
  riskLevel: DeliberationRiskLevel;
  linkedEntityRefs: string[];
};

export type ForumDomainProjection = {
  deliberationQueue: DeliberationCase[];
  strategicHighlights: ForumStrategicHighlight[];
  riskLattice: Array<{
    id: string;
    kind: "pilot" | "passenger" | "mobility";
    title: string;
    status: string;
    summary: string;
  }>;
  leadCase:
    | {
        topic: string;
        context: string;
        participants: string[];
        evidence: string[];
        options: string[];
        risks: string[];
        recommendedPath: string;
        chairmanAction: "approve" | "review" | "defer";
        decisionPanel: Array<{
          action: "approve" | "reject" | "defer" | "escalate";
          label: string;
          rationale: string;
        }>;
      }
    | null;
  provenance: "fixture_projection";
};
