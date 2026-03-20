import { render } from "lit";
import { describe, expect, it, vi } from "vitest";
import { renderCockpitPreview } from "./cockpit-preview.ts";

describe("cockpit preview view", () => {
  it("renders the internal pilot review states", () => {
    const container = document.createElement("div");
    render(renderCockpitPreview(), container);

    const cards = container.querySelectorAll(".cockpit-preview-card");
    expect(cards).toHaveLength(3);
    expect(container.textContent).toContain("Baseline do Piloto");
    expect(container.textContent).toContain("Cidade Dormente");
    expect(container.textContent).toContain("Hold de Compliance");
  });

  it("renders the runtime-bound baseline as observed when signals are present", () => {
    const container = document.createElement("div");
    render(
      renderCockpitPreview({
        runtimeDefaultInput: {
          runtimeSignals: {
            runtimeContinuity: {
              status: "nominal",
              detail: "2 instâncias vivas mantêm o runtime observável.",
              sourceIds: ["runtime:a"],
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
          },
          presenceEntries: [{ instanceId: "runtime:a", host: "lab-a", ts: Date.now() }],
          sessionsCount: 2,
        },
      }),
      container,
    );

    expect(container.textContent).toContain("observed");
    expect(container.textContent).toContain("Fontes do Binding");
    expect(container.textContent).toContain("internamente observável");
  });

  it("keeps The Cockpit distinct from Cortex Praetorium", () => {
    const container = document.createElement("div");
    render(renderCockpitPreview(), container);

    expect(container.textContent).toContain("Revisão Interna da Superfície do Piloto");
    expect(container.textContent).toContain("Distinta");
    expect(container.textContent).not.toContain("supervisão de runtime");
  });

  it("renders alerts and compliance rails for each state", () => {
    const container = document.createElement("div");
    render(renderCockpitPreview(), container);

    const surfaces = container.querySelectorAll(".cockpit-surface");
    expect(surfaces).toHaveLength(3);
    expect(container.textContent).toContain("Alertas Operacionais");
    expect(container.textContent).toContain("Avisos de Compliance");
    expect(container.textContent).toContain("not_bound");
  });

  it("opens and seeds a dedicated pilot review room", () => {
    const container = document.createElement("div");
    const onOpenReviewRoom = vi.fn();
    const onSendReviewBrief = vi.fn();

    render(
      renderCockpitPreview({
        reviewRoom: {
          sessionKey: "agent:main:cockpit-preview",
          label: "Sala de Revisão do The Cockpit",
          status: "Sala ativa",
          note: "Mantenha a revisão do piloto no mesmo fio.",
        },
        onOpenReviewRoom,
        onSendReviewBrief,
      }),
      container,
    );

    const text = container.textContent ?? "";
    expect(text).toContain("Sala de Revisão do The Cockpit");
    expect(text).toContain("Sala de Revisão");

    const openButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Abrir Sala de Revisão",
    );
    const seedButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Semear Sala com o Brief do Piloto",
    );

    openButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    seedButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onOpenReviewRoom).toHaveBeenCalledTimes(1);
    expect(onSendReviewBrief).toHaveBeenCalledTimes(1);
  });
});
