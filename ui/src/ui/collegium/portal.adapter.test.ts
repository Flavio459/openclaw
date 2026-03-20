import { describe, expect, it } from "vitest";
import {
  buildPortalDefaultRuntimeInput,
  buildPortalFirstBlockViewModel,
} from "./portal.adapter.ts";
import {
  portalDefaultFixture,
  portalHighTensionFixture,
  portalLowSignalFixture,
} from "./portal.fixtures.ts";

describe("buildPortalFirstBlockViewModel", () => {
  it("maps canonical portal content into a stable first-block view model", () => {
    const viewModel = buildPortalFirstBlockViewModel(portalDefaultFixture);

    expect(viewModel.state).toBe("portal-default");
    expect(viewModel.primaryCta.label).toBe("Ler meu turno agora");
    expect(viewModel.signalPanel.dataState).toBe("observed");
    expect(viewModel.guardrails.forbidCommunityDrift).toBe(true);
  });

  it("preserves high-tension state without changing CTA dominance", () => {
    const viewModel = buildPortalFirstBlockViewModel(portalHighTensionFixture);

    expect(viewModel.state).toBe("portal-high-tension");
    expect(viewModel.primaryCta.label).toBe(portalDefaultFixture.primaryCtaLabel);
    expect(viewModel.secondaryCta.label).toBe(portalDefaultFixture.secondaryCtaLabel);
  });

  it("marks low-signal panel honestly as placeholder", () => {
    const viewModel = buildPortalFirstBlockViewModel(portalLowSignalFixture);

    expect(viewModel.state).toBe("portal-low-signal");
    expect(viewModel.signalPanel.dataState).toBe("placeholder");
  });

  it("rejects narrative drift in first-dobro content", () => {
    expect(() =>
      buildPortalFirstBlockViewModel({
        ...portalDefaultFixture,
        supportingSubheadline: "Entre para a comunidade e aumente sua renda.",
      }),
    ).toThrow(/narrative guardrails/i);
  });

  it("binds the default state to real runtime readiness without faking pilot telemetry", () => {
    const runtimeBound = buildPortalDefaultRuntimeInput({
      connected: true,
      lastError: null,
      presenceEntries: [
        { instanceId: "node-1", host: "lab-01", ts: 1_700_000_000_000, lastInputSeconds: 45 },
      ],
      sessionsCount: 3,
      execApprovalQueueCount: 1,
      nowMs: 1_700_000_030_000,
    });

    expect(runtimeBound.state).toBe("portal-default");
    expect(runtimeBound.signalPanel.compressedMargin).toContain("1 instância(s) ativa(s)");
    expect(runtimeBound.signalPanel.compressedMargin).toContain("heartbeat recente");
    expect(runtimeBound.signalPanel.compressedMargin).toContain("input recente observado há 45s");
    expect(runtimeBound.signalPanel.compressedMargin).toContain("3 sessão(ões) ativa(s)");
    expect(runtimeBound.signalPanel.compressedMargin).toContain("1 aprovação(ões) pendente(s)");
    expect(runtimeBound.signalPanel.leakPoint).toContain("trilho de autoridade");
    expect(runtimeBound.signalPanel.dataState).toBe("observed");
  });

  it("keeps the default state honest when runtime is disconnected", () => {
    const runtimeBound = buildPortalDefaultRuntimeInput({
      connected: false,
      lastError: null,
      presenceEntries: [],
    });

    expect(runtimeBound.signalPanel.compressedMargin).toContain("desconectado");
    expect(runtimeBound.signalPanel.dataState).toBe("placeholder");
  });

  it("keeps the default state in placeholder when no active presence is available", () => {
    const runtimeBound = buildPortalDefaultRuntimeInput({
      connected: true,
      lastError: null,
      presenceEntries: [],
    });

    expect(runtimeBound.signalPanel.compressedMargin).toContain("ainda não foi sustentada");
    expect(runtimeBound.signalPanel.dataState).toBe("placeholder");
  });

  it("keeps the default state in placeholder when presence has no usable timestamp", () => {
    const runtimeBound = buildPortalDefaultRuntimeInput({
      connected: true,
      lastError: null,
      presenceEntries: [{ instanceId: "node-1", host: "lab-01" }],
      nowMs: 1_700_000_030_000,
    });

    expect(runtimeBound.signalPanel.compressedMargin).toContain("sem timestamp recente confirmado");
    expect(runtimeBound.signalPanel.dataState).toBe("placeholder");
  });

  it("keeps heartbeat availability honest when no recent input is confirmed yet", () => {
    const runtimeBound = buildPortalDefaultRuntimeInput({
      connected: true,
      lastError: null,
      presenceEntries: [{ instanceId: "node-1", host: "lab-01", ts: 1_700_000_000_000 }],
      sessionsCount: 0,
      nowMs: 1_700_000_030_000,
    });

    expect(runtimeBound.signalPanel.compressedMargin).toContain("sem input recente confirmado ainda");
    expect(runtimeBound.signalPanel.dataState).toBe("observed");
  });

  it("surfaces missing session continuity without downgrading runtime availability", () => {
    const runtimeBound = buildPortalDefaultRuntimeInput({
      connected: true,
      lastError: null,
      presenceEntries: [
        { instanceId: "node-1", host: "lab-01", ts: 1_700_000_000_000, lastInputSeconds: 15 },
      ],
      sessionsCount: 0,
      execApprovalQueueCount: 0,
      nowMs: 1_700_000_020_000,
    });

    expect(runtimeBound.signalPanel.compressedMargin).toContain("0 sessão(ões) ativa(s)");
    expect(runtimeBound.signalPanel.leakPoint).toContain("sem sessão ativa confirmada");
    expect(runtimeBound.signalPanel.dataState).toBe("observed");
  });

  it("degrades the default state when the last heartbeat leaves the recent window", () => {
    const runtimeBound = buildPortalDefaultRuntimeInput({
      connected: true,
      lastError: null,
      presenceEntries: [{ instanceId: "node-1", host: "lab-01", ts: 1_700_000_000_000 }],
      nowMs: 1_700_000_180_000,
    });

    expect(runtimeBound.signalPanel.compressedMargin).toContain("janela recente já degradou");
    expect(runtimeBound.signalPanel.leakPoint).toContain("3min");
    expect(runtimeBound.signalPanel.dataState).toBe("placeholder");
  });
});
