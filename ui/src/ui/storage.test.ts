import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadSettings, saveSettings, type UiSettings } from "./storage.ts";

const STORAGE_KEY = "openclaw.control.settings.v1";

const makeSettings = (): UiSettings => ({
  gatewayUrl: "ws://127.0.0.1:19000",
  token: "test-token-123",
  sessionKey: "main",
  lastActiveSessionKey: "main",
  theme: "system",
  chatFocusMode: false,
  chatShowThinking: true,
  splitRatio: 0.6,
  navCollapsed: false,
  navGroupsCollapsed: {},
});

describe("storage token persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("loads the persisted token instead of falling back to the default token", () => {
    const settings = makeSettings();
    saveSettings(settings);

    const loaded = loadSettings();

    expect(loaded.token).toBe("test-token-123");
  });

  it("falls back to the default token when the persisted token is missing", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        gatewayUrl: "ws://127.0.0.1:19000",
        sessionKey: "main",
        lastActiveSessionKey: "main",
      }),
    );

    const loaded = loadSettings();

    expect(loaded.token).toBe("openclaw99");
  });
});
