import { render } from "lit";
import { describe, expect, it, vi } from "vitest";
import { renderHome } from "./home.ts";

describe("renderHome", () => {
  it("renders intent-based entry cards", () => {
    const host = document.createElement("div");
    render(
      renderHome({
      connected: true,
      lastError: null,
      presenceCount: 3,
      sessionsCount: 7,
      onOpenForum: vi.fn(),
      onOpenPraetorium: vi.fn(),
      onOpenCommand: vi.fn(),
      onOpenPortalPreview: vi.fn(),
      onOpenCockpitPreview: vi.fn(),
      onOpenChat: vi.fn(),
      onOpenOverview: vi.fn(),
      }),
      host,
    );

    const markup = host.textContent ?? "";
    expect(markup).toContain("Comece pela intenção, não pelo nome da sala.");
    expect(markup).toContain("Abrir The Forum");
    expect(markup).toContain("Abrir Praetorium");
    expect(markup).toContain("Abrir Cortex Command");
    expect(markup).toContain("Abrir Prévia do Portal");
    expect(markup).toContain("Abrir The Cockpit");
    expect(markup).toContain("Abrir Sala Viva");
    expect(markup).toContain("Abrir Visão Geral");
  });
});
