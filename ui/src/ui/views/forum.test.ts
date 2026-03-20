import { render } from "lit";
import { describe, expect, it, vi } from "vitest";
import { buildForumViewModel } from "../collegium/forum.adapter.ts";
import {
  forumEscalationFixture,
  forumNominalFixture,
} from "../collegium/forum.fixtures.ts";
import { renderForum, type ForumProps } from "./forum.ts";

const createProps = (overrides: Partial<ForumProps> = {}): ForumProps => ({
  viewModel: buildForumViewModel(forumNominalFixture),
  discussionRoom: {
    sessionKey: "agent:main:forum",
    label: "Sala Viva do The Forum",
    status: "Sala ativa",
    note: "Continue a mesma thread deliberativa em vez de começar do zero.",
  },
  onRefresh: () => undefined,
  onOpenPraetorium: () => undefined,
  onOpenDiscussion: () => undefined,
  onSendBrief: () => undefined,
  ...overrides,
});

describe("forum view", () => {
  it("renders the deliberative room with topic, options and chairman action", () => {
    const container = document.createElement("div");
    const onRefresh = vi.fn();
    const onOpenPraetorium = vi.fn();
    const onOpenDiscussion = vi.fn();
    const onSendBrief = vi.fn();
    const props = createProps({ onRefresh, onOpenPraetorium, onOpenDiscussion, onSendBrief });

    render(renderForum(props), container);

    const text = container.textContent ?? "";
    expect(text).toContain(props.viewModel.topic);
    expect(text).toContain("Deliberação Atual");
    expect(text).toContain("Ação para o Chairman");
    expect(text).toContain("Rastro Decisório");
    expect(text).toContain("Sala Viva de Discussão");
    expect(text).toContain(props.viewModel.recommendedPath.rationale);
    expect(text).toContain("status:");
    expect(text).toContain("próximo:");
    expect(text).toContain("lead-dev");

    const buttons = Array.from(container.querySelectorAll("button"));
    const refreshButton = buttons.find((button) => button.textContent?.trim() === "Atualizar");
    const praetoriumButton = buttons.find(
      (button) => button.textContent?.trim() === "Inspecionar Praetorium",
    );
    const discussionButton = buttons.find(
      (button) => button.textContent?.trim() === "Continuar Sala Viva",
    );
    const seedButton = buttons.find(
      (button) => button.textContent?.trim() === "Enviar Brief Deliberativo",
    );

    refreshButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    praetoriumButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    discussionButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    seedButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onOpenPraetorium).toHaveBeenCalledTimes(1);
    expect(onOpenDiscussion).toHaveBeenCalledTimes(1);
    expect(onSendBrief).toHaveBeenCalledTimes(1);
  });

  it("renders escalation clearly instead of hiding the conflict", () => {
    const container = document.createElement("div");
    render(
      renderForum(
        createProps({
          viewModel: buildForumViewModel(forumEscalationFixture),
        }),
      ),
      container,
    );

    const text = container.textContent ?? "";
    expect(text).toContain("Escalonar");
    expect(text).toContain("A degradação do runtime já está visível na sala.");
    expect(text).toContain("runtime_degradation");
    expect(text).toContain("human-chairman");
  });
});
