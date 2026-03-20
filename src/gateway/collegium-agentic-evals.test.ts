import { describe, expect, it } from "vitest";
import { collegiumAgenticScenarios } from "./collegium-agentic-scenarios.ts";
import {
  deriveDeliberativeAction,
  resolveGovernanceOutcome,
  validateDecisionTrace,
} from "../../ui/src/ui/collegium/agentic-governance.ts";

describe("collegium agentic evals", () => {
  for (const scenario of collegiumAgenticScenarios) {
    it(scenario.title, () => {
      const validation = validateDecisionTrace(scenario.trace);
      const outcome = resolveGovernanceOutcome(scenario.trace);
      const action = deriveDeliberativeAction(scenario.trace);

      expect(action).toBe(scenario.expected.action);
      expect(outcome.owner).toBe(scenario.expected.owner);
      expect(outcome.hitlRequired).toBe(scenario.expected.hitlRequired);
      expect(outcome.escalationReasons).toEqual(
        expect.arrayContaining(scenario.expected.escalationReasons),
      );
      expect(outcome.consulted).toEqual(
        expect.arrayContaining(scenario.expected.consultedIncludes),
      );

      if (scenario.trace.evidenceIds.length === 0) {
        expect(validation.ok).toBe(false);
      }
      if (scenario.trace.escalationReasons.includes("cross_mandate_conflict")) {
        expect(outcome.escalate).toBe(true);
      }
    });
  }
});
