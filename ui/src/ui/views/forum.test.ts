import { render } from "lit";
import { describe, expect, it } from "vitest";
import type { EventLogEntry } from "../app-events.ts";
import type { ExecApprovalRequest } from "../controllers/exec-approval.ts";
import { buildDefaultCollegiumDomainSnapshot } from "../collegium-domain.fixtures.ts";
import { buildForumDomainProjection } from "../collegium-domain.projections.ts";
import { renderForum, type ForumProps } from "./forum.ts";

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
const DOMAIN = buildForumDomainProjection(SNAPSHOT);

function createProps(overrides: Partial<ForumProps> = {}): ForumProps {
  return {
    gatewayUrl: "ws://127.0.0.1:18789",
    hello: null,
    environment: "LAB",
    agentsList: AGENTS,
    eventLog: [],
    execApprovalQueue: [],
    domainProjection: DOMAIN,
    onRefresh: () => undefined,
    onOpenPraetorium: () => undefined,
    ...overrides,
  };
}

function createApproval(overrides: Partial<ExecApprovalRequest> = {}): ExecApprovalRequest {
  return {
    id: "approval-1",
    request: {
      command: "bash scripts/pema_lab_v3_identity_smoke.sh",
      ask: "Review fleet changes",
      agentId: "ped",
      cwd: "/workspace/openclaw",
    },
    createdAtMs: 1_700_000_000_000,
    expiresAtMs: 1_700_000_100_000,
    ...overrides,
  };
}

describe("forum view", () => {
  it("renders an empty agenda without breaking", () => {
    const container = document.createElement("div");
    render(
      renderForum(
        createProps({
          domainProjection: {
            deliberationQueue: [],
            strategicHighlights: [],
            riskLattice: [],
            leadCase: null,
            provenance: "fixture_projection",
          },
        }),
      ),
      container,
    );

    expect(container.textContent).toContain("No authority request is waiting.");
  });

  it("renders the protocol agenda before runtime approval details", () => {
    const container = document.createElement("div");
    render(
      renderForum(
        createProps({
          execApprovalQueue: [createApproval()],
        }),
      ),
      container,
    );

    expect(container.textContent).toContain("Lead Case");
    expect(container.textContent).toContain("Resolve Bruno restriction before demand surge");
    expect(container.textContent).toContain("Operational authority rail");
    expect(container.textContent).toContain("Review fleet changes");
    expect(container.textContent).toContain("Risk Lattice");
    expect(container.textContent).toContain("cwd: /workspace/openclaw");
    expect(container.textContent).toContain("Decision Panel");
    expect(container.textContent).toContain("Approve supervised release");
    expect(container.textContent).toContain("Authority State");
    expect(container.textContent).toContain("chairman_pending");
    expect(container.textContent).toContain("Urgency");
    expect(container.textContent).toContain("immediate");
  });

  it("shows both domain highlights and live strategic events", () => {
    const container = document.createElement("div");
    const eventLog: EventLogEntry[] = [
      {
        ts: 1_700_000_100_000,
        event: "chat",
        payload: {
          sessionKey: "agent:ceo:main",
          message: "Need authority to review fleet changes",
        },
      },
    ];

    render(
      renderForum(
        createProps({
          eventLog,
        }),
      ),
      container,
    );

    expect(container.textContent).toContain("Strategic Traces");
    expect(container.textContent).toContain("Resolve Bruno restriction before demand surge");
    expect(container.textContent).toContain("Need authority to review fleet changes");
    expect(container.textContent).toContain("options: 3");
    expect(container.textContent).toContain("Chairman Action");
    expect(container.textContent).toContain("chairman lane: approve or reject");
    expect(container.textContent).toContain("urgency: immediate");
  });
});
