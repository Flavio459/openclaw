import {
  type CollegiumDomainSnapshot,
  type CommandDomainProjection,
  type DeliberationCase,
  type ForumDomainProjection,
  type ForumStrategicHighlight,
} from "./collegium-domain.ts";

function rankDeliberation(caseItem: DeliberationCase): number {
  const riskScore = caseItem.riskLevel === "high" ? 3 : caseItem.riskLevel === "medium" ? 2 : 1;
  const statusScore =
    caseItem.status === "pending_chairman"
      ? 30
      : caseItem.status === "under_review"
        ? 20
        : caseItem.status === "draft"
          ? 10
          : 0;
  const chairmanScore = caseItem.chairmanActionRequired ? 100 : 0;
  return chairmanScore + statusScore + riskScore;
}

export function buildCommandDomainProjection(
  snapshot: CollegiumDomainSnapshot,
): CommandDomainProjection {
  const activePilotCount = snapshot.pilots.filter((pilot) => pilot.status === "active").length;
  const restrictedPilotCount = snapshot.pilots.filter(
    (pilot) => pilot.status === "restricted" || pilot.status === "suspended",
  ).length;
  const flaggedPassengerCount = snapshot.passengers.filter(
    (passenger) => passenger.status === "flagged" || passenger.status === "restricted",
  ).length;
  const activeMobilityCount = snapshot.mobilityEvents.filter(
    (event) => event.status === "in_progress" || event.status === "matched",
  ).length;
  const completedMobilityCount = snapshot.mobilityEvents.filter(
    (event) => event.status === "completed",
  ).length;
  const contestedMobilityCount = snapshot.mobilityEvents.filter(
    (event) => event.status === "contested",
  ).length;
  const validatedProductionUnits = snapshot.productionLedger.reduce(
    (total, entry) => total + entry.amount,
    0,
  );
  const pendingDeliberationCount = snapshot.deliberations.filter(
    (caseItem) => caseItem.chairmanActionRequired,
  ).length;

  const alerts: string[] = [];
  snapshot.pilots
    .filter((pilot) => pilot.status === "restricted" || pilot.status === "suspended")
    .forEach((pilot) =>
      alerts.push(`${pilot.displayName} is ${pilot.status} and requires corridor governance.`),
    );
  snapshot.mobilityEvents
    .filter((event) => event.status === "contested")
    .forEach((event) =>
      alerts.push(`Mobility event ${event.id} is contested on route ${event.routeLabel}.`),
    );
  snapshot.deliberations
    .filter((caseItem) => caseItem.chairmanActionRequired)
    .forEach((caseItem) => alerts.push(`${caseItem.title} is waiting on the Chairman rail.`));

  const networkSummary = snapshot.networkNodes
    .toSorted((left, right) => right.activeProductionUnits - left.activeProductionUnits)
    .map((node) => {
      const nodeMobility = snapshot.mobilityEvents.filter((event) =>
        node.pilotIds.includes(event.pilotId),
      );
      const activeMobilityCount = nodeMobility.filter(
        (event) => event.status === "in_progress" || event.status === "matched",
      ).length;
      const contestedMobilityCount = nodeMobility.filter(
        (event) => event.status === "contested",
      ).length;
      const pressureLevel =
        contestedMobilityCount > 0
          ? "critical"
          : activeMobilityCount > 0 || node.activeProductionUnits >= 8
            ? "elevated"
            : "steady";
      const trend =
        contestedMobilityCount > 0
          ? "failing"
          : activeMobilityCount > 0
            ? "stressed"
            : "recovering";
      return {
        id: node.id,
        label: node.label,
        pilotCount: node.pilotIds.length,
        activeProductionUnits: node.activeProductionUnits,
        supervisedBy: node.supervisedBy,
        activeMobilityCount,
        contestedMobilityCount,
        pressureLevel,
        trend,
      };
    });

  const governanceWatchlist = [
    ...snapshot.pilots
      .filter((pilot) => pilot.status === "restricted" || pilot.status === "suspended")
      .map((pilot) => ({
        id: `pilot:${pilot.id}`,
        kind: "pilot" as const,
        title: pilot.displayName,
        status: pilot.status,
        summary:
          pilot.flags.length > 0
            ? `Flags: ${pilot.flags.join(", ")}`
            : "Pilot is under protocol governance review.",
      })),
    ...snapshot.passengers
      .filter((passenger) => passenger.status === "flagged" || passenger.status === "restricted")
      .map((passenger) => ({
        id: `passenger:${passenger.id}`,
        kind: "passenger" as const,
        title: passenger.displayName,
        status: passenger.status,
        summary:
          passenger.trustFlags.length > 0
            ? `Trust flags: ${passenger.trustFlags.join(", ")}`
            : "Passenger requires trust review.",
      })),
    ...snapshot.mobilityEvents
      .filter((event) => event.status === "contested")
      .map((event) => ({
        id: `mobility:${event.id}`,
        kind: "mobility" as const,
        title: event.routeLabel,
        status: event.status,
        summary:
          event.riskSignals.length > 0
            ? `Signals: ${event.riskSignals.join(", ")}`
            : "Mobility event is contested and requires review.",
      })),
  ];

  const pilotBoard = snapshot.pilots
    .toSorted((left, right) => right.productionUnitsValidated - left.productionUnitsValidated)
    .map((pilot) => ({
      id: pilot.id,
      displayName: pilot.displayName,
      status: pilot.status,
      reputationScore: pilot.reputationScore,
      productionUnitsValidated: pilot.productionUnitsValidated,
      activeMobilityEvents: pilot.activeMobilityEvents,
      flags: pilot.flags,
    }));

  const passengerBoard = snapshot.passengers
    .toSorted((left, right) => {
      const leftWeight = (left.status === "flagged" || left.status === "restricted" ? 100 : 0) +
        left.completedTrips;
      const rightWeight =
        (right.status === "flagged" || right.status === "restricted" ? 100 : 0) +
        right.completedTrips;
      return rightWeight - leftWeight;
    })
    .map((passenger) => ({
      id: passenger.id,
      displayName: passenger.displayName,
      status: passenger.status,
      reputationScore: passenger.reputationScore,
      completedTrips: passenger.completedTrips,
      trustFlags: passenger.trustFlags,
    }));

  const pilotLabelById = new Map(snapshot.pilots.map((pilot) => [pilot.id, pilot.displayName]));
  const passengerLabelById = new Map(
    snapshot.passengers.map((passenger) => [passenger.id, passenger.displayName]),
  );

  const mobilityBoard = snapshot.mobilityEvents
    .toSorted((left, right) => {
      const leftWeight =
        left.status === "contested" ? 3 : left.status === "in_progress" ? 2 : 1;
      const rightWeight =
        right.status === "contested" ? 3 : right.status === "in_progress" ? 2 : 1;
      return rightWeight - leftWeight;
    })
    .map((event) => ({
      id: event.id,
      routeLabel: event.routeLabel,
      status: event.status,
      pilotLabel: pilotLabelById.get(event.pilotId) ?? event.pilotId,
      passengerLabel: passengerLabelById.get(event.passengerId) ?? event.passengerId,
      productionUnitsGenerated: event.productionUnitsGenerated,
      riskSignals: event.riskSignals,
    }));

  const contestedCaseBoard = snapshot.mobilityEvents
    .filter((event) => event.status === "contested")
    .map((event) => {
      const pilot = snapshot.pilots.find((entry) => entry.id === event.pilotId);
      const passenger = snapshot.passengers.find((entry) => entry.id === event.passengerId);
      const asymmetryLevel =
        pilot?.status === "restricted" || passenger?.status === "flagged"
          ? "critical"
          : event.riskSignals.length > 1
            ? "material"
            : "contained";
      return {
        id: event.id,
        routeLabel: event.routeLabel,
        pilotLabel: pilot?.displayName ?? event.pilotId,
        pilotStatus: pilot?.status ?? "candidate",
        passengerLabel: passenger?.displayName ?? event.passengerId,
        passengerStatus: passenger?.status ?? "active",
        asymmetryLevel,
        summary: `pilot ${pilot?.status ?? "unknown"} · passenger ${passenger?.status ?? "unknown"} · signals ${event.riskSignals.join(", ") || "none"}`,
      };
    });

  const reconciliationBoard = [
    {
      id: "production",
      title: "Validated production",
      productionUnits: validatedProductionUnits,
      riskLoad: contestedMobilityCount,
      authorityState: pendingDeliberationCount > 0 ? "chairman_attention" : "clear",
      summary:
        pendingDeliberationCount > 0
          ? "Production is healthy, but institutional approvals still gate full release."
          : "Production and authority are currently aligned.",
    },
    {
      id: "contested",
      title: "Contested mobility",
      productionUnits: snapshot.mobilityEvents
        .filter((event) => event.status === "contested")
        .reduce((total, event) => total + event.productionUnitsGenerated, 0),
      riskLoad: contestedCaseBoard.length,
      authorityState: contestedCaseBoard.length > 0 ? "board_attention" : "clear",
      summary:
        contestedCaseBoard.length > 0
          ? "Disputed events are concentrating institutional attention and can distort economic confidence."
          : "No active contested mobility is projected.",
    },
    {
      id: "restricted",
      title: "Restricted governance",
      productionUnits: snapshot.pilots
        .filter((pilot) => pilot.status === "restricted" || pilot.status === "suspended")
        .reduce((total, pilot) => total + pilot.productionUnitsValidated, 0),
      riskLoad: restrictedPilotCount + flaggedPassengerCount,
      authorityState:
        restrictedPilotCount > 0 || flaggedPassengerCount > 0 ? "chairman_attention" : "clear",
      summary:
        restrictedPilotCount > 0 || flaggedPassengerCount > 0
          ? "Restricted actors and flagged passengers are forcing governance to absorb operational load."
          : "No restricted governance pressure is visible.",
    },
  ];

  return {
    pilotCount: snapshot.pilots.length,
    activePilotCount,
    restrictedPilotCount,
    passengerCount: snapshot.passengers.length,
    flaggedPassengerCount,
    activeMobilityCount,
    completedMobilityCount,
    contestedMobilityCount,
    validatedProductionUnits,
    connectedNetworkCount: snapshot.networkNodes.length,
    pendingDeliberationCount,
    operationalAlerts: alerts,
    networkSummary,
    governanceWatchlist,
    pilotBoard,
    passengerBoard,
    mobilityBoard,
    contestedCaseBoard,
    reconciliationBoard,
    provenance: "fixture_projection",
  };
}

export function buildForumDomainProjection(
  snapshot: CollegiumDomainSnapshot,
): ForumDomainProjection {
  const deliberationQueue = snapshot.deliberations.toSorted(
    (left, right) => rankDeliberation(right) - rankDeliberation(left),
  );

  const strategicHighlights: ForumStrategicHighlight[] = deliberationQueue.map((caseItem) => ({
    id: caseItem.id,
    title: caseItem.title,
    summary: caseItem.summary,
    riskLevel: caseItem.riskLevel,
    linkedEntityRefs: [
      ...caseItem.linkedPilotIds.map((id) => `pilot:${id}`),
      ...caseItem.linkedMobilityEventIds.map((id) => `mobility:${id}`),
    ],
  }));

  const riskLattice = [
    ...snapshot.mobilityEvents
      .filter((event) => event.status === "contested")
      .map((event) => ({
        id: `mobility:${event.id}`,
        kind: "mobility" as const,
        title: event.routeLabel,
        status: event.status,
        summary:
          event.riskSignals.length > 0
            ? `Signals: ${event.riskSignals.join(", ")}`
            : "Contested mobility event in protocol review.",
      })),
    ...snapshot.pilots
      .filter((pilot) => pilot.status === "restricted" || pilot.status === "suspended")
      .map((pilot) => ({
        id: `pilot:${pilot.id}`,
        kind: "pilot" as const,
        title: pilot.displayName,
        status: pilot.status,
        summary:
          pilot.flags.length > 0
            ? `Flags: ${pilot.flags.join(", ")}`
            : "Pilot requires governance review.",
      })),
    ...snapshot.passengers
      .filter((passenger) => passenger.status === "flagged" || passenger.status === "restricted")
      .map((passenger) => ({
        id: `passenger:${passenger.id}`,
        kind: "passenger" as const,
        title: passenger.displayName,
        status: passenger.status,
        summary:
          passenger.trustFlags.length > 0
            ? `Trust flags: ${passenger.trustFlags.join(", ")}`
            : "Passenger requires trust review.",
      })),
  ];

  const leadDeliberation = deliberationQueue[0] ?? null;
  const leadCase = leadDeliberation
    ? {
        topic: leadDeliberation.title,
        context: leadDeliberation.summary,
        participants: [
          ...leadDeliberation.linkedPilotIds.map((id) => `pilot:${id}`),
          ...leadDeliberation.linkedMobilityEventIds.map((id) => `mobility:${id}`),
        ],
        evidence: leadDeliberation.evidenceRefs,
        options: leadDeliberation.options,
        risks: riskLattice
          .filter(
            (item) =>
              leadDeliberation.linkedPilotIds.some((id) => item.id === `pilot:${id}`) ||
              leadDeliberation.linkedMobilityEventIds.some((id) => item.id === `mobility:${id}`),
        )
          .map((item) => `${item.title}: ${item.summary}`),
        recommendedPath: leadDeliberation.recommendedPath,
        chairmanAction: leadDeliberation.chairmanActionRequired ? "approve" : "review",
        authorityState: leadDeliberation.chairmanActionRequired
          ? "chairman_pending"
          : "board_review",
        urgency:
          leadDeliberation.riskLevel === "high"
            ? "immediate"
            : leadDeliberation.riskLevel === "medium"
              ? "priority"
              : "monitor",
        economicImpact: buildEconomicImpact(snapshot, leadDeliberation),
        decisionScenarios: buildDecisionScenarios(snapshot, leadDeliberation),
        evidenceTrail: buildEvidenceTrail(snapshot, leadDeliberation),
        decisionPanel: buildDecisionPanel(leadDeliberation),
      }
    : null;

  return {
    deliberationQueue,
    strategicHighlights,
    riskLattice,
    leadCase,
    provenance: "fixture_projection",
  };
}

function buildDecisionPanel(caseItem: DeliberationCase) {
  const approvalLabel = caseItem.chairmanActionRequired
    ? "Approve supervised release"
    : "Approve board recommendation";
  const approvalRationale = caseItem.chairmanActionRequired
    ? "Moves the lead case forward on the Chairman rail while preserving monitored access."
    : "Allows the board recommendation to proceed without opening a higher authority rail.";
  const escalationLabel =
    caseItem.riskLevel === "high" ? "Escalate to legal corridor" : "Escalate to board escalation lane";
  const escalationRationale =
    caseItem.riskLevel === "high"
      ? "Transfers the case to a stricter compliance path when risk outweighs operational urgency."
      : "Raises the case to a stronger institutional lane when current board review is insufficient.";

  return [
    {
      action: "approve" as const,
      label: approvalLabel,
      rationale: approvalRationale,
    },
    {
      action: "reject" as const,
      label: "Keep institutional restriction",
      rationale:
        "Preserves control until evidence closes the open risk and the room has a defensible release path.",
    },
    {
      action: "defer" as const,
      label: "Defer until more evidence",
      rationale:
        "Holds the case in the room and requests additional protocol evidence before authority acts.",
    },
    {
      action: "escalate" as const,
      label: escalationLabel,
      rationale: escalationRationale,
    },
  ];
}

function buildEconomicImpact(snapshot: CollegiumDomainSnapshot, caseItem: DeliberationCase) {
  const linkedEvents = caseItem.linkedMobilityEventIds
    .map((id) => snapshot.mobilityEvents.find((event) => event.id === id))
    .filter((entry): entry is NonNullable<typeof entry> => entry != null);
  const contestedProductionUnits = linkedEvents.reduce(
    (total, event) => total + event.productionUnitsGenerated,
    0,
  );
  const protectedProductionUnits = snapshot.productionLedger.reduce(
    (total, entry) => total + entry.amount,
    0,
  );
  const projectedExposure =
    contestedProductionUnits + linkedEvents.reduce((total, event) => total + event.riskSignals.length, 0);

  return {
    protectedProductionUnits,
    contestedProductionUnits,
    projectedExposure,
    authorityState: caseItem.chairmanActionRequired ? "chairman_pending" : "board_review",
  };
}

function buildDecisionScenarios(snapshot: CollegiumDomainSnapshot, caseItem: DeliberationCase) {
  const impact = buildEconomicImpact(snapshot, caseItem);
  return [
    {
      action: "approve" as const,
      label: "Approve supervised release",
      protectedProductionUnits: impact.protectedProductionUnits + impact.contestedProductionUnits,
      contestedProductionUnits: 0,
      projectedExposure: Math.max(0, impact.projectedExposure - 3),
      authorityState: "clear" as const,
      summary:
        "Releases contested production back into the protected corridor, but still assumes managed supervision cost.",
    },
    {
      action: "reject" as const,
      label: "Maintain restriction",
      protectedProductionUnits: impact.protectedProductionUnits,
      contestedProductionUnits: impact.contestedProductionUnits,
      projectedExposure: impact.projectedExposure + 1,
      authorityState: "chairman_attention" as const,
      summary:
        "Preserves institutional control, but keeps exposure and blocked production concentrated on the Chairman rail.",
    },
    {
      action: "defer" as const,
      label: "Defer for more evidence",
      protectedProductionUnits: impact.protectedProductionUnits,
      contestedProductionUnits: impact.contestedProductionUnits,
      projectedExposure: impact.projectedExposure + 2,
      authorityState: "board_attention" as const,
      summary:
        "Holds current production intact while operational uncertainty grows with every unresolved cycle.",
    },
    {
      action: "escalate" as const,
      label: "Escalate to legal corridor",
      protectedProductionUnits: impact.protectedProductionUnits,
      contestedProductionUnits: impact.contestedProductionUnits,
      projectedExposure: impact.projectedExposure,
      authorityState: "chairman_attention" as const,
      summary:
        "Transfers the burden to a stricter authority path without immediately reducing contested exposure.",
    },
  ];
}

function buildEvidenceTrail(snapshot: CollegiumDomainSnapshot, caseItem: DeliberationCase) {
  const pilotEntries = caseItem.linkedPilotIds
    .map((id) => snapshot.pilots.find((pilot) => pilot.id === id))
    .filter((entry): entry is NonNullable<typeof entry> => entry != null)
    .map((pilot) => ({
      entityRef: `pilot:${pilot.id}`,
      role: "pilot" as const,
      summary:
        pilot.flags.length > 0
          ? `${pilot.displayName} is ${pilot.status} with flags ${pilot.flags.join(", ")}.`
          : `${pilot.displayName} is ${pilot.status} with no active protocol flags.`,
      evidenceRefs: pilot.flags.map((flag) => `risk:${flag}`),
    }));

  const mobilityEntries = caseItem.linkedMobilityEventIds
    .map((id) => snapshot.mobilityEvents.find((event) => event.id === id))
    .filter((entry): entry is NonNullable<typeof entry> => entry != null)
    .map((event) => ({
      entityRef: `mobility:${event.id}`,
      role: "mobility" as const,
      summary:
        event.riskSignals.length > 0
          ? `${event.routeLabel} is ${event.status} with signals ${event.riskSignals.join(", ")}.`
          : `${event.routeLabel} is ${event.status}.`,
      evidenceRefs: event.evidenceRefs,
    }));

  const linkedPassengerIds = new Set(
    mobilityEntries.map((entry) => entry.entityRef.replace("mobility:", "")).flatMap((mobilityId) => {
      const event = snapshot.mobilityEvents.find((item) => item.id === mobilityId);
      return event ? [event.passengerId] : [];
    }),
  );
  const passengerEntries = [...linkedPassengerIds]
    .map((id) => snapshot.passengers.find((passenger) => passenger.id === id))
    .filter((entry): entry is NonNullable<typeof entry> => entry != null)
    .map((passenger) => ({
      entityRef: `passenger:${passenger.id}`,
      role: "passenger" as const,
      summary:
        passenger.trustFlags.length > 0
          ? `${passenger.displayName} is ${passenger.status} with trust flags ${passenger.trustFlags.join(", ")}.`
          : `${passenger.displayName} is ${passenger.status} with no active trust flags.`,
      evidenceRefs: passenger.trustFlags.map((flag) => `trust:${flag}`),
    }));

  return [...pilotEntries, ...passengerEntries, ...mobilityEntries];
}
