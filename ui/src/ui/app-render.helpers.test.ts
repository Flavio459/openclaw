import { render } from "lit";
import { describe, expect, it, vi } from "vitest";
import type { AppViewState } from "./app-view-state.ts";
import type { SessionsListResult } from "./types.ts";
import { renderChatControls } from "./app-render.helpers.ts";

function createSessions(keys: string[]): SessionsListResult {
  return {
    ts: 0,
    path: "",
    count: keys.length,
    defaults: { model: null, contextTokens: null },
    sessions: keys.map((key) => ({
      key,
      kind: "direct",
      label: undefined,
      subject: undefined,
      displayName: undefined,
      thinkingLevel: undefined,
      verboseLevel: undefined,
      reasoningLevel: undefined,
      updatedAt: null,
    })),
  };
}

function createState(
  sessionKey: string,
  sessionsResult: SessionsListResult | null,
): AppViewState {
  return {
    hello: null,
    sessionsResult,
    sessionKey,
    connected: true,
    onboarding: false,
    chatLoading: false,
    chatMessage: "",
    chatStream: null,
    chatRunId: null,
    settings: {
      gatewayUrl: "ws://127.0.0.1:19000",
      token: "token",
      sessionKey,
      lastActiveSessionKey: sessionKey,
      theme: "dark",
      chatFocusMode: false,
      chatShowThinking: true,
      splitRatio: 0.6,
      navCollapsed: false,
      navGroupsCollapsed: {},
    },
    applySettings: vi.fn(),
    loadAssistantIdentity: vi.fn(),
    resetToolStream: vi.fn(),
    resetChatScroll: vi.fn(),
  } as unknown as AppViewState;
}

describe("renderChatControls", () => {
  it("keeps the visible session select aligned with the live room session after options load", () => {
    const container = document.createElement("div");
    const state = createState("agent:main:forum", createSessions(["main"]));

    render(renderChatControls(state), container);

    state.sessionsResult = createSessions(["main", "agent:main:forum"]);
    render(renderChatControls(state), container);

    const select = container.querySelector("select");
    expect(select).not.toBeNull();
    expect((select as HTMLSelectElement).value).toBe("agent:main:forum");
  });
});
