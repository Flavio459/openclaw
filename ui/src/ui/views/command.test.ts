import { render } from "lit";
import { describe, expect, it, vi } from "vitest";
import { buildCommandViewModel } from "../collegium/command.adapter.ts";
import {
  runtimeAwaitingFixture,
  runtimeNominalFixture,
} from "../collegium/command.fixtures.ts";
import { renderCommand, type CommandProps } from "./command.ts";

const createProps = (overrides: Partial<CommandProps> = {}): CommandProps => ({
  viewModel: buildCommandViewModel(runtimeNominalFixture),
  onRefresh: () => undefined,
  onOpenForum: () => undefined,
  onOpenPraetorium: () => undefined,
  ...overrides,
});

describe("command view", () => {
  it("renders priority before core modules and exposes contextual bridges", () => {
    const container = document.createElement("div");
    const onOpenForum = vi.fn();
    const onOpenPraetorium = vi.fn();
    const props = createProps({
      onOpenForum,
      onOpenPraetorium,
    });

    render(renderCommand(props), container);

    const text = container.textContent ?? "";
    expect(text.indexOf(props.viewModel.commandPriority.headline)).toBeLessThan(
      text.indexOf(props.viewModel.modules[0]?.name ?? ""),
    );
    expect(text).toContain(props.viewModel.dominantWorkstream.label);

    const buttons = Array.from(container.querySelectorAll("button"));
    const forumButton = buttons.find(
      (button) => button.textContent?.trim() === props.viewModel.bridges.forumLabel,
    );
    const praetoriumButton = buttons.find(
      (button) => button.textContent?.trim() === props.viewModel.bridges.praetoriumLabel,
    );

    expect(forumButton).not.toBeUndefined();
    expect(praetoriumButton).not.toBeUndefined();

    forumButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    praetoriumButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onOpenForum).toHaveBeenCalledTimes(1);
    expect(onOpenPraetorium).toHaveBeenCalledTimes(1);
  });

  it("renders not_bound states honestly when feeds do not exist", () => {
    const container = document.createElement("div");
    render(renderCommand(createProps()), container);

    expect(container.textContent).toContain("not_bound");
  });

  it("shows awaiting runtime state without inventing live telemetry", () => {
    const container = document.createElement("div");
    const viewModel = buildCommandViewModel(runtimeAwaitingFixture);
    render(
      renderCommand(
        createProps({
          viewModel,
        }),
      ),
      container,
    );

    expect(container.textContent).toContain("Aguardando Runtime");
    expect(container.textContent).toContain(
      "A continuidade do runtime aguarda uma conexão saudável com o gateway.",
    );
  });
});
