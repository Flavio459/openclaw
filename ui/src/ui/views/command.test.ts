import { render } from "lit";
import { describe, expect, it } from "vitest";
import { buildDefaultCollegiumDomainSnapshot } from "../collegium-domain.fixtures.ts";
import { buildCommandDomainProjection } from "../collegium-domain.projections.ts";
import { renderCommand, type CommandProps } from "./command.ts";

const AGENTS = {
  defaultId: "main",
  mainKey: "main",
  scope: "gateway",
  agents: [
    { id: "main", name: "Main" },
    { id: "ceo", name: "Chief Executive Agent" },
    { id: "ped", name: "Chief Product/Eng. Agent" },
  ],
};

const SNAPSHOT = buildDefaultCollegiumDomainSnapshot();
const DOMAIN = buildCommandDomainProjection(SNAPSHOT);

function createProps(overrides: Partial<CommandProps> = {}): CommandProps {
  return {
    connected: true,
    lastError: null,
    environment: "LAB",
    agentsList: AGENTS,
    presenceEntries: [],
    channelsSnapshot: null,
    execApprovalQueue: [],
    cronStatus: { enabled: true, jobs: 3, nextWakeAtMs: null },
    sessionsCount: 4,
    domainProjection: DOMAIN,
    onRefresh: () => undefined,
    onOpenForum: () => undefined,
    onOpenPraetorium: () => undefined,
    ...overrides,
  };
}

describe("command view", () => {
  it("shows domain KPIs without falling back to placeholder copy", () => {
    const container = document.createElement("div");
    render(renderCommand(createProps()), container);

    expect(container.textContent).toContain("The Pilots");
    expect(container.textContent).toContain("2/3");
    expect(container.textContent).toContain("Connected Networks");
    expect(container.textContent).toContain("2");
    expect(container.textContent).toContain("Validated U.P.");
    expect(container.textContent).toContain("Governed Field");
    expect(container.textContent).toContain("Pilot Board");
    expect(container.textContent).toContain("Passenger Trust Board");
    expect(container.textContent).toContain("Mobility Board");
    expect(container.textContent).toContain("Governance Watchlist");
    expect(container.textContent).toContain("Corridor Pressure");
    expect(container.textContent).toContain("critical");
    expect(container.textContent).toContain("stressed trend");
    expect(container.textContent).toContain("failing");
    expect(container.textContent).toContain("Bruno Vale");
    expect(container.textContent).toContain("Ana Cruz");
    expect(container.textContent).toContain("Noah Lima");
    expect(container.textContent).toContain("Hospital -> Zona Sul");
    expect(container.textContent).toContain("Dispute Asymmetry");
    expect(container.textContent).toContain("critical");
    expect(container.textContent).toContain("Production Reconciliation");
    expect(container.textContent).toContain("chairman_attention");
    expect(container.textContent).not.toContain("Feed pending");
  });

  it("keeps runtime signals visible beside the domain projection", () => {
    const container = document.createElement("div");
    render(
      renderCommand(
        createProps({
          presenceEntries: [
            {
              instanceId: "dev-1",
              ts: Date.now(),
            },
          ],
        }),
      ),
      container,
    );

    expect(container.textContent).toContain("Fixture-backed protocol model");
    expect(container.textContent).toContain("Runtime Presence");
    expect(container.textContent).toContain("1 live instances");
  });
});
