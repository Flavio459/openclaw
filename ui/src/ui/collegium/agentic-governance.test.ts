import { describe, expect, it } from "vitest";
import {
  deriveDeliberativeAction,
  resolveGovernanceOutcome,
  validateDecisionTrace,
} from "./agentic-governance.ts";
import type { DecisionTrace } from "./agentic-governance.contract.ts";

const baseTrace = (overrides: Partial<DecisionTrace> = {}): DecisionTrace => ({
  traceId: "trace-1",
  agentRole: "ceo",
  mandate: "strategy",
  summary: "Strategic expansion is proposed.",
  rationale: "The company needs a decision-ready path with auditable evidence.",
  evidenceIds: ["approval-1"],
  consulted: [],
  hitlRequired: false,
  escalate: false,
  escalationReasons: [],
  status: "review_required",
  nextResponsible: "ceo",
  observedAt: "2026-03-13T00:00:00.000Z",
  ...overrides,
});

describe("agentic governance", () => {
  it("resolves economics as CFO-owned and HITL-required", () => {
    const outcome = resolveGovernanceOutcome(
      baseTrace({
        agentRole: "ceo",
        mandate: "economics",
      }),
    );

    expect(outcome.owner).toBe("cfo");
    expect(outcome.accountable).toBe("cfo");
    expect(outcome.consulted).toContain("legal");
    expect(outcome.hitlRequired).toBe(true);
  });

  it("auto-consults legal for architecture proposals with compliance risk", () => {
    const outcome = resolveGovernanceOutcome(
      baseTrace({
        agentRole: "cto",
        mandate: "architecture",
        escalationReasons: ["compliance_risk"],
      }),
    );

    expect(outcome.consulted).toContain("legal");
    expect(outcome.escalate).toBe(true);
    expect(outcome.hitlRequired).toBe(true);
  });

  it("forces narrative work to consult legal and cfo", () => {
    const outcome = resolveGovernanceOutcome(
      baseTrace({
        agentRole: "cmo",
        mandate: "narrative",
      }),
    );

    expect(outcome.owner).toBe("cmo");
    expect(outcome.consulted).toContain("legal");
    expect(outcome.consulted).toContain("cfo");
  });

  it("rejects sensitive traces without evidence", () => {
    const result = validateDecisionTrace(
      baseTrace({
        mandate: "economics",
        evidenceIds: [],
        escalationReasons: ["insufficient_evidence"],
        hitlRequired: true,
        escalate: true,
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.issues).toContain("Sensitive recommendations require evidenceIds.");
    expect(deriveDeliberativeAction(baseTrace({ evidenceIds: [] }))).toBe("defer");
  });

  it("does not allow cross-mandate conflict to disappear into a clean approve", () => {
    const result = validateDecisionTrace(
      baseTrace({
        escalationReasons: ["cross_mandate_conflict"],
        escalate: false,
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.issues).toContain(
      "Cross-mandate conflicts cannot be silently synthesized.",
    );
    expect(
      deriveDeliberativeAction(
        baseTrace({
          escalationReasons: ["cross_mandate_conflict"],
        }),
      ),
    ).toBe("escalate");
  });

  it("requires deliberative handoff fields to remain explicit", () => {
    const trace = baseTrace({
      status: "deferred",
      nextResponsible: "lead-dev",
    });

    expect(trace.status).toBe("deferred");
    expect(trace.nextResponsible).toBe("lead-dev");
  });

  it("rejects traces without an explicit status", () => {
    const result = validateDecisionTrace(
      baseTrace({
        status: "" as DecisionTrace["status"],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.issues).toContain("DecisionTrace.status is required.");
  });

  it("rejects traces without an explicit nextResponsible", () => {
    const result = validateDecisionTrace(
      baseTrace({
        nextResponsible: "" as DecisionTrace["nextResponsible"],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.issues).toContain("DecisionTrace.nextResponsible is required.");
  });
});
