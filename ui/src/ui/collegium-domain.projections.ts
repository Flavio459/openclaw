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
  const activeMobilityCount = snapshot.mobilityEvents.filter(
    (event) => event.status === "in_progress" || event.status === "matched",
  ).length;
  const completedMobilityCount = snapshot.mobilityEvents.filter(
    (event) => event.status === "completed",
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

  return {
    pilotCount: snapshot.pilots.length,
    activePilotCount,
    passengerCount: snapshot.passengers.length,
    activeMobilityCount,
    completedMobilityCount,
    validatedProductionUnits,
    connectedNetworkCount: snapshot.networkNodes.length,
    pendingDeliberationCount,
    operationalAlerts: alerts,
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

  return {
    deliberationQueue,
    strategicHighlights,
    provenance: "fixture_projection",
  };
}

export { buildDefaultCollegiumDomainSnapshot };
