import { buildDefaultCollegiumDomainSnapshot } from "./collegium-domain.fixtures.ts";
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
    .map((node) => ({
      id: node.id,
      label: node.label,
      pilotCount: node.pilotIds.length,
      activeProductionUnits: node.activeProductionUnits,
      supervisedBy: node.supervisedBy,
    }));

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

  return {
    deliberationQueue,
    strategicHighlights,
    riskLattice,
    provenance: "fixture_projection",
  };
}

export { buildDefaultCollegiumDomainSnapshot };
