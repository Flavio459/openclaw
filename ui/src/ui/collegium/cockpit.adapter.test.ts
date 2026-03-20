import { describe, expect, it } from "vitest";
import { buildCockpitRuntimeContract } from "./cockpit.adapter.ts";
import type { RuntimeSignals } from "./runtime-signals.ts";

const nominalSignals: RuntimeSignals = {
  runtimeContinuity: {
    status: "nominal",
    detail: "2 instâncias vivas mantêm o runtime observável.",
    sourceIds: ["runtime:a", "runtime:b"],
    observedAt: "2026-03-13T10:00:00.000Z",
    counts: { presence: 2 },
  },
  authorityPressure: {
    status: "none",
    detail: "Nenhuma solicitação de autoridade está aguardando no trilho do Chairman.",
    sourceIds: [],
    observedAt: "2026-03-13T10:00:00.000Z",
    counts: { approvals: 0 },
  },
  automationCadence: {
    status: "nominal",
    detail: "1 rotina de automação mantém a camada operacional intermediária ativa.",
    sourceIds: ["cron:status"],
    observedAt: "2026-03-13T10:00:00.000Z",
    counts: { cronJobs: 1 },
  },
  sessionContinuity: {
    status: "nominal",
    detail: "2 sessões ativas sustentam a leitura atual de continuidade.",
    sourceIds: ["sessions:visible"],
    observedAt: "2026-03-13T10:00:00.000Z",
    counts: { sessions: 2 },
  },
  strategicAmbiguity: {
    status: "none",
    detail: "Nenhuma ambiguidade estratégica está aberta no feed atual.",
    sourceIds: [],
    observedAt: "2026-03-13T10:00:00.000Z",
    counts: { ambiguities: 0 },
  },
};

describe("cockpit adapter", () => {
  it("produces an observed baseline when runtime continuity is nominal", () => {
    const viewModel = buildCockpitRuntimeContract({
      runtimeSignals: nominalSignals,
      presenceEntries: [
        { instanceId: "runtime:a", host: "lab-a", ts: Date.now() },
        { instanceId: "runtime:b", host: "lab-b", ts: Date.now() },
      ],
      sessionsCount: 2,
    });

    expect(viewModel.bindingState).toBe("observed");
    expect(viewModel.identityAndActivation).toContain("internamente observável");
    expect(viewModel.turnState).toContain("2 sessão(ões) ativa(s)");
    expect(viewModel.upState).toContain("Nenhum payout");
  });

  it("keeps the baseline as placeholder when runtime is blocked", () => {
    const viewModel = buildCockpitRuntimeContract({
      runtimeSignals: {
        ...nominalSignals,
        runtimeContinuity: {
          status: "blocked",
          detail: "Gateway handshake failed.",
          sourceIds: ["runtime:error"],
          observedAt: "2026-03-13T10:00:00.000Z",
          counts: { presence: 0 },
        },
      },
      presenceEntries: [],
      sessionsCount: null,
    });

    expect(viewModel.bindingState).toBe("placeholder");
    expect(viewModel.cityReadiness).toContain("não pode avançar");
    expect(viewModel.alerts.join(" ")).toContain("bloqueio do runtime");
  });

  it("surfaces authority pressure without turning the baseline economic", () => {
    const viewModel = buildCockpitRuntimeContract({
      runtimeSignals: {
        ...nominalSignals,
        authorityPressure: {
          status: "pending",
          detail: "1 solicitação de autoridade pressiona o trilho executivo.",
          sourceIds: ["approval:1"],
          observedAt: "2026-03-13T10:00:00.000Z",
          counts: { approvals: 1 },
        },
      },
      presenceEntries: [{ instanceId: "runtime:a", host: "lab-a", ts: Date.now() }],
      sessionsCount: 1,
    });

    expect(viewModel.bindingState).toBe("observed");
    expect(viewModel.cityReadiness).toContain("readiness controlada");
    expect(viewModel.turnState).toContain("solicitação(ões) de autoridade");
    expect(viewModel.complianceNotices.join(" ")).not.toContain("passageiro");
  });
});
