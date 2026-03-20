import { describe, expect, it } from "vitest";
import { buildCommandViewModel } from "./command.adapter.ts";
import {
  runtimeAttentionFixture,
  runtimeAwaitingFixture,
  runtimeNominalFixture,
} from "./command.fixtures.ts";

describe("buildCommandViewModel", () => {
  it("maps nominal runtime state into an executive command view model", () => {
    const viewModel = buildCommandViewModel(runtimeNominalFixture);

    expect(viewModel.environment).toBe("DEV");
    expect(viewModel.institutionState.status).toBe("operational");
    expect(viewModel.collaborators.total).toBe(4);
    expect(viewModel.dominantWorkstream.label).toContain("The Foundry");
    expect(viewModel.signalContext.authorityPressure).toContain("trilho do Chairman");
    expect(viewModel.executionEnvelope.pilotsTelemetry).toBe("not_bound");
    expect(viewModel.modules).toHaveLength(5);
  });

  it("maps error state into attention_required without inventing missing feeds", () => {
    const viewModel = buildCommandViewModel(runtimeAttentionFixture);

    expect(viewModel.institutionState.status).toBe("attention_required");
    expect(viewModel.institutionState.detail).toBe("Gateway degraded");
    expect(viewModel.chairmanRail.pendingAuthorityCount).toBe(1);
    expect(viewModel.executionEnvelope.financialFeed).toBe("not_bound");
    expect(viewModel.executionEnvelope.authorityRail).toBe(
      "1 solicitação de autoridade pressiona o trilho executivo.",
    );
  });

  it("maps disconnected state into awaiting_runtime and preserves bridge labels", () => {
    const viewModel = buildCommandViewModel(runtimeAwaitingFixture);

    expect(viewModel.institutionState.status).toBe("awaiting_runtime");
    expect(viewModel.executionEnvelope.runtimePresence).toBe(
      "A continuidade do runtime aguarda uma conexão saudável com o gateway.",
    );
    expect(viewModel.bridges.forumLabel).toBe("Abrir The Forum");
    expect(viewModel.bridges.praetoriumLabel).toBe("Inspecionar Praetorium");
  });
});
