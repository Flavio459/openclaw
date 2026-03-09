import { describe, expect, it } from "vitest";
import type { EventLogEntry } from "./app-events.ts";
import {
  buildDevCockpitState,
  buildDevEvents,
  brandingForTab,
  detectRuntimeEnvironment,
  isCollegiumTab,
  selectCollegiumEventFeed,
} from "./collegium.ts";

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

describe("isCollegiumTab", () => {
  it("identifies the new Collegium surfaces", () => {
    expect(isCollegiumTab("command")).toBe(true);
    expect(isCollegiumTab("forum")).toBe(true);
    expect(isCollegiumTab("praetorium")).toBe(true);
    expect(isCollegiumTab("overview")).toBe(false);
  });
});

describe("brandingForTab", () => {
  it("returns Collegium branding for product and cockpit tabs", () => {
    expect(brandingForTab("command").title).toBe("COLLEGIUM CORTEX");
    expect(brandingForTab("forum").subtitle).toBe("The Forum");
    expect(brandingForTab("praetorium").subtitle).toBe("Cortex Praetorium");
  });
});

describe("detectRuntimeEnvironment", () => {
  it("infers lab, dev, and prod from the gateway url", () => {
    expect(detectRuntimeEnvironment("ws://127.0.0.1:18789", null)).toBe("LAB");
    expect(detectRuntimeEnvironment("wss://openclaw-dev.internal/ws", null)).toBe("DEV");
    expect(detectRuntimeEnvironment("wss://openclaw-prod.internal/ws", null)).toBe("PROD");
  });
});

describe("selectCollegiumEventFeed", () => {
  it("uses the live buffer for The Forum and the stable log elsewhere", () => {
    const eventLog: EventLogEntry[] = [{ ts: 1, event: "agent", payload: { agentId: "main" } }];
    const eventLogBuffer: EventLogEntry[] = [
      { ts: 2, event: "chat", payload: { sessionKey: "agent:ceo:main" } },
    ];

    expect(selectCollegiumEventFeed("forum", eventLog, eventLogBuffer)).toBe(eventLogBuffer);
    expect(selectCollegiumEventFeed("praetorium", eventLog, eventLogBuffer)).toBe(eventLog);
    expect(selectCollegiumEventFeed("chat", eventLog, eventLogBuffer)).toBe(eventLog);
  });
});

describe("buildDevEvents", () => {
  it("maps gateway events into Collegium cockpit events", () => {
    const events: EventLogEntry[] = [
      {
        ts: 1_700_000_000_000,
        event: "exec.approval.requested",
        payload: {
          id: "approval-1",
          request: {
            command: "bash scripts/pema_lab_v3_identity_smoke.sh",
            agentId: "ped",
            cwd: "/workspace/openclaw",
          },
        },
      },
      {
        ts: 1_700_000_100_000,
        event: "chat",
        payload: {
          sessionKey: "agent:ceo:main",
          message: "Need authority to review fleet changes",
        },
      },
    ];

    const mapped = buildDevEvents(events, "ws://127.0.0.1:18789", null, AGENTS);
    expect(mapped).toHaveLength(2);
    expect(mapped[0].surface).toBe("the_forum");
    expect(mapped[0].actor_id).toBe("ped");
    expect(mapped[1].actor_id).toBe("ceo");
    expect(mapped[1].scope).toBe("product");
  });
});

describe("buildDevCockpitState", () => {
  it("aggregates runtime telemetry into a Praetorium state snapshot", () => {
    const events: EventLogEntry[] = [
      {
        ts: 1_700_000_000_000,
        event: "exec.approval.requested",
        payload: {
          id: "approval-1",
          request: {
            command: "node scripts/run-node.mjs agent",
            agentId: "ped",
          },
        },
      },
    ];
    const approvalQueue = [
      {
        id: "approval-1",
        request: {
          command: "node scripts/run-node.mjs agent",
          agentId: "ped",
        },
        createdAtMs: 1_700_000_000_000,
        expiresAtMs: 1_700_000_100_000,
      },
    ];

    const cockpit = buildDevCockpitState({
      connected: true,
      lastError: null,
      gatewayUrl: "ws://127.0.0.1:18789",
      hello: null,
      eventLog: events,
      agentsList: AGENTS,
      execApprovalQueue: approvalQueue,
      cronJobs: [],
    });

    expect(cockpit.environment).toBe("LAB");
    expect(cockpit.status).toBe("blocked");
    expect(cockpit.unresolved_decisions).toBe(1);
    expect(cockpit.active_agent?.id).toBe("ped");
    expect(cockpit.current_scope).toBe("engine");
  });
});
