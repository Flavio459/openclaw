import { describe, expect, it } from "vitest";
import {
  TAB_GROUPS,
  iconForTab,
  inferBasePathFromPathname,
  normalizeBasePath,
  normalizePath,
  pathForTab,
  subtitleForTab,
  tabFromPath,
  titleForTab,
  useForTab,
  type Tab,
} from "./navigation.ts";

/** All valid tab identifiers derived from TAB_GROUPS */
const ALL_TABS: Tab[] = TAB_GROUPS.flatMap((group) => group.tabs) as Tab[];

describe("iconForTab", () => {
  it("returns a non-empty string for every tab", () => {
    for (const tab of ALL_TABS) {
      const icon = iconForTab(tab);
      expect(icon).toBeTruthy();
      expect(typeof icon).toBe("string");
      expect(icon.length).toBeGreaterThan(0);
    }
  });

  it("returns stable icons for known tabs", () => {
    expect(iconForTab("home")).toBe("globe");
    expect(iconForTab("command")).toBe("brain");
    expect(iconForTab("forum")).toBe("book");
    expect(iconForTab("praetorium")).toBe("puzzle");
    expect(iconForTab("portal-preview")).toBe("monitor");
    expect(iconForTab("cockpit-preview")).toBe("smartphone");
    expect(iconForTab("chat")).toBe("messageSquare");
    expect(iconForTab("overview")).toBe("barChart");
    expect(iconForTab("channels")).toBe("link");
    expect(iconForTab("instances")).toBe("radio");
    expect(iconForTab("sessions")).toBe("fileText");
    expect(iconForTab("cron")).toBe("loader");
    expect(iconForTab("skills")).toBe("zap");
    expect(iconForTab("nodes")).toBe("monitor");
    expect(iconForTab("config")).toBe("settings");
    expect(iconForTab("debug")).toBe("bug");
    expect(iconForTab("logs")).toBe("scrollText");
  });

  it("returns a fallback icon for unknown tab", () => {
    // TypeScript won't allow this normally, but runtime could receive unexpected values
    const unknownTab = "unknown" as Tab;
    expect(iconForTab(unknownTab)).toBe("folder");
  });
});

describe("titleForTab", () => {
  it("returns a non-empty string for every tab", () => {
    for (const tab of ALL_TABS) {
      const title = titleForTab(tab);
      expect(title).toBeTruthy();
      expect(typeof title).toBe("string");
    }
  });

  it("returns expected titles", () => {
    expect(titleForTab("home")).toBe("Comece Aqui");
    expect(titleForTab("command")).toBe("Cortex Command");
    expect(titleForTab("forum")).toBe("The Forum");
    expect(titleForTab("praetorium")).toBe("Cortex Praetorium");
    expect(titleForTab("portal-preview")).toBe("Prévia do Portal");
    expect(titleForTab("cockpit-preview")).toBe("The Cockpit");
    expect(titleForTab("chat")).toBe("Sala Viva");
    expect(titleForTab("overview")).toBe("Visão Geral");
    expect(titleForTab("cron")).toBe("Rotinas Cron");
  });
});

describe("subtitleForTab", () => {
  it("returns a string for every tab", () => {
    for (const tab of ALL_TABS) {
      const subtitle = subtitleForTab(tab);
      expect(typeof subtitle).toBe("string");
    }
  });

  it("returns descriptive subtitles", () => {
    expect(subtitleForTab("home")).toContain("Comece pela intenção");
    expect(subtitleForTab("command")).toContain("Collegium Cortex");
    expect(subtitleForTab("praetorium")).toContain("supervisão do runtime");
    expect(subtitleForTab("portal-preview")).toContain("Superfície interna de revisão");
    expect(subtitleForTab("cockpit-preview")).toContain("voltada ao piloto");
    expect(subtitleForTab("chat")).toContain("Superfície de continuação");
    expect(subtitleForTab("config")).toContain("openclaw.json");
  });
});

describe("useForTab", () => {
  it("returns a non-empty usage hint for every tab", () => {
    for (const tab of ALL_TABS) {
      const hint = useForTab(tab);
      expect(hint).toBeTruthy();
      expect(typeof hint).toBe("string");
    }
  });

  it("makes discussion and execution surfaces explicit", () => {
    expect(useForTab("home")).toContain("Escolha");
    expect(useForTab("forum")).toContain("Reuniões");
    expect(useForTab("forum")).toContain("discussão");
    expect(useForTab("praetorium")).toContain("bloqueios");
    expect(useForTab("command")).toContain("Prioridade");
    expect(useForTab("overview")).toContain("Conectar");
  });
});

describe("normalizeBasePath", () => {
  it("returns empty string for falsy input", () => {
    expect(normalizeBasePath("")).toBe("");
  });

  it("adds leading slash if missing", () => {
    expect(normalizeBasePath("ui")).toBe("/ui");
  });

  it("removes trailing slash", () => {
    expect(normalizeBasePath("/ui/")).toBe("/ui");
  });

  it("returns empty string for root path", () => {
    expect(normalizeBasePath("/")).toBe("");
  });

  it("handles nested paths", () => {
    expect(normalizeBasePath("/apps/openclaw")).toBe("/apps/openclaw");
  });
});

describe("normalizePath", () => {
  it("returns / for falsy input", () => {
    expect(normalizePath("")).toBe("/");
  });

  it("adds leading slash if missing", () => {
    expect(normalizePath("chat")).toBe("/chat");
  });

  it("removes trailing slash except for root", () => {
    expect(normalizePath("/chat/")).toBe("/chat");
    expect(normalizePath("/")).toBe("/");
  });
});

describe("pathForTab", () => {
  it("returns correct path without base", () => {
    expect(pathForTab("home")).toBe("/");
    expect(pathForTab("command")).toBe("/command");
    expect(pathForTab("forum")).toBe("/command/forum");
    expect(pathForTab("praetorium")).toBe("/praetorium");
    expect(pathForTab("portal-preview")).toBe("/portal-preview");
    expect(pathForTab("cockpit-preview")).toBe("/cockpit-preview");
    expect(pathForTab("chat")).toBe("/chat");
    expect(pathForTab("overview")).toBe("/overview");
  });

  it("prepends base path", () => {
    expect(pathForTab("chat", "/ui")).toBe("/ui/chat");
    expect(pathForTab("sessions", "/apps/openclaw")).toBe("/apps/openclaw/sessions");
  });
});

describe("tabFromPath", () => {
  it("returns tab for valid path", () => {
    expect(tabFromPath("/command")).toBe("command");
    expect(tabFromPath("/command/forum")).toBe("forum");
    expect(tabFromPath("/praetorium")).toBe("praetorium");
    expect(tabFromPath("/portal-preview")).toBe("portal-preview");
    expect(tabFromPath("/cockpit-preview")).toBe("cockpit-preview");
    expect(tabFromPath("/chat")).toBe("chat");
    expect(tabFromPath("/overview")).toBe("overview");
    expect(tabFromPath("/sessions")).toBe("sessions");
  });

  it("returns home for root path", () => {
    expect(tabFromPath("/")).toBe("home");
  });

  it("handles base paths", () => {
    expect(tabFromPath("/ui/chat", "/ui")).toBe("chat");
    expect(tabFromPath("/apps/openclaw/sessions", "/apps/openclaw")).toBe("sessions");
  });

  it("returns null for unknown path", () => {
    expect(tabFromPath("/unknown")).toBeNull();
  });

  it("is case-insensitive", () => {
    expect(tabFromPath("/CHAT")).toBe("chat");
    expect(tabFromPath("/Overview")).toBe("overview");
  });
});

describe("inferBasePathFromPathname", () => {
  it("returns empty string for root", () => {
    expect(inferBasePathFromPathname("/")).toBe("");
  });

  it("returns empty string for direct tab path", () => {
    expect(inferBasePathFromPathname("/chat")).toBe("");
    expect(inferBasePathFromPathname("/overview")).toBe("");
  });

  it("infers base path from nested paths", () => {
    expect(inferBasePathFromPathname("/ui/chat")).toBe("/ui");
    expect(inferBasePathFromPathname("/apps/openclaw/sessions")).toBe("/apps/openclaw");
  });

  it("handles index.html suffix", () => {
    expect(inferBasePathFromPathname("/index.html")).toBe("");
    expect(inferBasePathFromPathname("/ui/index.html")).toBe("/ui");
  });
});

describe("TAB_GROUPS", () => {
  it("contains all expected groups", () => {
    const labels = TAB_GROUPS.map((g) => g.label);
    expect(labels).toContain("Comece Aqui");
    expect(labels).toContain("Superfícies Centrais");
    expect(labels).toContain("Salas em Andamento");
    expect(labels).toContain("Pré-visualizações Internas");
    expect(labels).toContain("Runtime e Acesso");
    expect(labels).toContain("Operação de Agentes");
    expect(labels).toContain("Sistema");
  });

  it("all tabs are unique", () => {
    const allTabs = TAB_GROUPS.flatMap((g) => g.tabs);
    const uniqueTabs = new Set(allTabs);
    expect(uniqueTabs.size).toBe(allTabs.length);
  });
});
