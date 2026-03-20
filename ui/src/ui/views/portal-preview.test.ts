import { render } from "lit";
import { describe, expect, it, vi } from "vitest";
import { renderPortalPreview } from "./portal-preview.ts";

describe("portal preview view", () => {
  it("renders the five canonical internal review states", () => {
    const container = document.createElement("div");
    render(renderPortalPreview(), container);

    const cards = container.querySelectorAll(".portal-preview-card");
    expect(cards).toHaveLength(5);
    expect(container.textContent).toContain("Portal Default");
    expect(container.textContent).toContain("Portal Mobile Continuity");
    expect(container.textContent).toContain("Internal Stable");
  });

  it("renders each portal state through the first-block surface", () => {
    const container = document.createElement("div");
    render(renderPortalPreview(), container);

    const surfaces = container.querySelectorAll(".portal-first-block");
    expect(surfaces).toHaveLength(5);
  });

  it("shows one live runtime binding when the default state is connected to real signals", () => {
    const container = document.createElement("div");
    render(
      renderPortalPreview({
        runtimeDefaultInput: {
          connected: true,
          lastError: null,
          presenceEntries: [
            { instanceId: "node-1", host: "lab-01", ts: 1_700_000_000_000, lastInputSeconds: 45 },
          ],
          sessionsCount: 3,
          execApprovalQueueCount: 1,
          nowMs: 1_700_000_030_000,
        },
      }),
      container,
    );

    expect(container.textContent).toContain("Presence + Heartbeat + Input + Runtime Rails");
    expect(container.textContent).toContain("heartbeat recente");
    expect(container.textContent).toContain("input recente observado há 45s");
    expect(container.textContent).toContain("3 sessão(ões) ativa(s)");
    expect(container.textContent).toContain("1 aprovação(ões) pendente(s)");
  });

  it("opens and seeds a dedicated review room", () => {
    const container = document.createElement("div");
    const onOpenReviewRoom = vi.fn();
    const onSendReviewBrief = vi.fn();

    render(
      renderPortalPreview({
        reviewRoom: {
          sessionKey: "agent:main:portal-preview",
          label: "Sala de Revisão da Prévia do Portal",
          status: "Sala ativa",
          note: "Mantenha a revisão do portal no mesmo fio.",
        },
        onOpenReviewRoom,
        onSendReviewBrief,
      }),
      container,
    );

    const text = container.textContent ?? "";
    expect(text).toContain("Sala de Revisão");
    expect(text).toContain("Sala de Revisão da Prévia do Portal");

    const openButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Abrir Sala de Revisão",
    );
    const seedButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Semear Sala com o Bloco Atual",
    );

    openButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    seedButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onOpenReviewRoom).toHaveBeenCalledTimes(1);
    expect(onSendReviewBrief).toHaveBeenCalledTimes(1);
  });
});
