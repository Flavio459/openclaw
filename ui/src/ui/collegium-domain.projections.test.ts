import { describe, expect, it } from "vitest";
import { buildDefaultCollegiumDomainSnapshot } from "./collegium-domain.fixtures.ts";
import {
  buildCommandDomainProjection,
  buildForumDomainProjection,
} from "./collegium-domain.projections.ts";

describe("buildCommandDomainProjection", () => {
  it("calculates the command kpis from the domain snapshot", () => {
    const projection = buildCommandDomainProjection(buildDefaultCollegiumDomainSnapshot());

    expect(projection.pilotCount).toBe(3);
    expect(projection.activePilotCount).toBe(2);
    expect(projection.restrictedPilotCount).toBe(1);
    expect(projection.passengerCount).toBe(3);
    expect(projection.flaggedPassengerCount).toBe(1);
    expect(projection.activeMobilityCount).toBe(1);
    expect(projection.completedMobilityCount).toBe(2);
    expect(projection.contestedMobilityCount).toBe(1);
    expect(projection.validatedProductionUnits).toBe(12);
    expect(projection.connectedNetworkCount).toBe(2);
    expect(projection.pendingDeliberationCount).toBe(1);
    expect(projection.networkSummary[0]?.label).toBe("Alpha Corridor");
    expect(projection.networkSummary[0]?.pressureLevel).toBe("elevated");
    expect(projection.networkSummary[1]?.pressureLevel).toBe("critical");
    expect(projection.governanceWatchlist).toHaveLength(3);
    expect(projection.pilotBoard[0]?.displayName).toBe("Ana Cruz");
    expect(projection.passengerBoard[0]?.displayName).toBe("Noah Lima");
    expect(projection.passengerBoard[0]?.status).toBe("flagged");
    expect(projection.mobilityBoard[0]?.status).toBe("contested");
    expect(projection.contestedCaseBoard[0]?.routeLabel).toBe("Hospital -> Zona Sul");
    expect(projection.contestedCaseBoard[0]?.asymmetryLevel).toBe("critical");
    expect(projection.provenance).toBe("fixture_projection");
  });

  it("emits operational alerts for restricted pilots, contested mobility, and chairman cases", () => {
    const projection = buildCommandDomainProjection(buildDefaultCollegiumDomainSnapshot());

    expect(
      projection.operationalAlerts.some((alert) => alert.includes("Bruno Vale is restricted")),
    ).toBe(true);
    expect(
      projection.operationalAlerts.some((alert) => alert.includes("Mobility event mob-1002")),
    ).toBe(true);
    expect(projection.operationalAlerts.some((alert) => alert.includes("Chairman rail"))).toBe(
      true,
    );
  });
});

describe("buildForumDomainProjection", () => {
  it("prioritizes deliberations that require the Chairman rail", () => {
    const projection = buildForumDomainProjection(buildDefaultCollegiumDomainSnapshot());

    expect(projection.deliberationQueue).toHaveLength(2);
    expect(projection.deliberationQueue[0].status).toBe("pending_chairman");
    expect(projection.deliberationQueue[0].chairmanActionRequired).toBe(true);
    expect(projection.riskLattice).toHaveLength(3);
    expect(projection.leadCase?.topic).toBe("Resolve Bruno restriction before demand surge");
    expect(projection.leadCase?.chairmanAction).toBe("approve");
    expect(projection.leadCase?.authorityState).toBe("chairman_pending");
    expect(projection.leadCase?.urgency).toBe("immediate");
    expect(projection.leadCase?.evidenceTrail).toHaveLength(3);
    expect(projection.leadCase?.evidenceTrail[0]?.entityRef).toBe("pilot:pilot-bruno");
    expect(projection.leadCase?.decisionPanel).toHaveLength(4);
    expect(projection.leadCase?.decisionPanel[0]?.action).toBe("approve");
    expect(projection.leadCase?.decisionPanel[3]?.label).toContain("legal corridor");
  });

  it("creates strategic highlights linked to domain entities", () => {
    const projection = buildForumDomainProjection(buildDefaultCollegiumDomainSnapshot());

    expect(projection.strategicHighlights[0]?.riskLevel).toBe("high");
    expect(
      projection.strategicHighlights[0]?.linkedEntityRefs.some((ref) => ref.startsWith("pilot:")),
    ).toBe(true);
    expect(projection.provenance).toBe("fixture_projection");
  });
});
