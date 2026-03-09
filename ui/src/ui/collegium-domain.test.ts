import { describe, expect, it } from "vitest";
import { buildDefaultCollegiumDomainSnapshot } from "./collegium-domain.fixtures.ts";

describe("Collegium domain fixture", () => {
  it("contains the minimum entities required for the first domain slice", () => {
    const snapshot = buildDefaultCollegiumDomainSnapshot();

    expect(snapshot.pilots).toHaveLength(3);
    expect(snapshot.passengers).toHaveLength(3);
    expect(snapshot.mobilityEvents).toHaveLength(4);
    expect(snapshot.productionLedger).toHaveLength(4);
    expect(snapshot.networkNodes).toHaveLength(2);
    expect(snapshot.deliberations).toHaveLength(2);
  });

  it("links every production ledger entry to an existing mobility event", () => {
    const snapshot = buildDefaultCollegiumDomainSnapshot();
    const eventIds = new Set(snapshot.mobilityEvents.map((event) => event.id));

    snapshot.productionLedger.forEach((entry) => {
      expect(eventIds.has(entry.mobilityEventId)).toBe(true);
      expect(entry.amount).toBeGreaterThan(0);
    });
  });

  it("anchors every deliberation to a pilot or mobility event", () => {
    const snapshot = buildDefaultCollegiumDomainSnapshot();

    snapshot.deliberations.forEach((caseItem) => {
      expect(caseItem.linkedPilotIds.length > 0 || caseItem.linkedMobilityEventIds.length > 0).toBe(
        true,
      );
    });
  });

  it("never gives negative production to completed mobility events", () => {
    const snapshot = buildDefaultCollegiumDomainSnapshot();

    snapshot.mobilityEvents
      .filter((event) => event.status === "completed")
      .forEach((event) => {
        expect(event.productionUnitsGenerated).toBeGreaterThanOrEqual(0);
      });
  });

  it("keeps pilot production aligned with the aggregated ledger", () => {
    const snapshot = buildDefaultCollegiumDomainSnapshot();

    snapshot.pilots.forEach((pilot) => {
      const total = snapshot.productionLedger
        .filter((entry) => entry.pilotId === pilot.id)
        .reduce((sum, entry) => sum + entry.amount, 0);
      expect(pilot.productionUnitsValidated).toBe(total);
    });
  });
});
