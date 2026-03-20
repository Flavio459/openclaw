import { describe, expect, it } from "vitest";
import { buildRuntimeSignals } from "./runtime-signals.ts";

const baseInput = () => ({
  connected: true,
  lastError: null,
  presenceEntries: [{ instanceId: "node-1", host: "lab-01", ts: 1_700_000_000_000 }],
  execApprovalQueue: [],
  cronStatus: {
    enabled: true,
    jobs: 2,
    nextWakeAtMs: 1_700_000_100_000,
  },
  sessionsCount: 4,
  eventLog: [
    {
      ts: 1_700_000_000_500,
      event: "agent",
      payload: {
        agentId: "ceo",
        message: "Strategic review in progress.",
      },
    },
  ],
  gatewayUrl: "http://127.0.0.1:19000",
  hello: null,
});

describe("buildRuntimeSignals", () => {
  it("maps disconnected runtime into waiting continuity", () => {
    const signals = buildRuntimeSignals({
      ...baseInput(),
      connected: false,
    });

    expect(signals.runtimeContinuity.status).toBe("waiting");
  });

  it("maps runtime errors into blocked continuity", () => {
    const signals = buildRuntimeSignals({
      ...baseInput(),
      lastError: "Gateway degraded",
    });

    expect(signals.runtimeContinuity.status).toBe("blocked");
    expect(signals.runtimeContinuity.detail).toBe("Gateway degraded");
  });

  it("maps approvals into pending authority pressure", () => {
    const signals = buildRuntimeSignals({
      ...baseInput(),
      execApprovalQueue: [
        {
          id: "approval-1",
          request: {
            command: "node scripts/run-node.mjs agent",
            agentId: "ceo",
            ask: "Approve move",
          },
          createdAtMs: 1_700_000_000_000,
          expiresAtMs: 1_700_000_010_000,
        },
      ],
    });

    expect(signals.authorityPressure.status).toBe("pending");
    expect(signals.authorityPressure.counts?.approvals).toBe(1);
  });

  it("preserves null sessions as waiting instead of zero", () => {
    const signals = buildRuntimeSignals({
      ...baseInput(),
      sessionsCount: null,
    });

    expect(signals.sessionContinuity.status).toBe("waiting");
    expect(signals.sessionContinuity.counts?.sessions).toBeUndefined();
  });

  it("surfaces ambiguity when telemetry lacks explicit user intent", () => {
    const signals = buildRuntimeSignals({
      ...baseInput(),
      eventLog: [
        {
          ts: 1_700_000_000_000,
          event: "chat",
          payload: {
            data: {
              message: "Need a direction on this change.",
            },
          },
        },
      ],
    });

    expect(signals.strategicAmbiguity.status).toBe("pending");
    expect(signals.strategicAmbiguity.counts?.ambiguities).toBe(1);
  });
});
