import { describe, expect, it } from "vitest";
import { buildForumViewModel } from "./forum.adapter.ts";
import { forumEscalationFixture, forumNominalFixture } from "./forum.fixtures.ts";

describe("buildForumViewModel", () => {
  it("builds a recommendation-ready room with evidence and chairman action", () => {
    const viewModel = buildForumViewModel(forumNominalFixture);

    expect(viewModel.topic).toContain("Aprovar");
    expect(viewModel.options).toHaveLength(3);
    expect(viewModel.recommendedPath.traceId).toBeTruthy();
    expect(viewModel.chairmanAction.action).toBe("approve");
    expect(viewModel.decisionTrace[0]?.status).toBe("approved");
    expect(viewModel.decisionTrace[0]?.nextResponsible).toBe("lead-dev");
  });

  it("escalates degraded runtime instead of hiding the conflict", () => {
    const viewModel = buildForumViewModel(forumEscalationFixture);

    expect(viewModel.chairmanAction.action).toBe("escalate");
    expect(viewModel.risks).toContain("A degradação do runtime já está visível na sala.");
    expect(viewModel.decisionTrace[0]?.escalationReasons).toContain("runtime_degradation");
    expect(viewModel.decisionTrace[0]?.status).toBe("escalated");
    expect(viewModel.decisionTrace[0]?.nextResponsible).toBe("human-chairman");
  });
});
