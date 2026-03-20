import { render } from "lit";
import { describe, expect, it, vi } from "vitest";
import { renderPraetorium, type PraetoriumProps } from "./praetorium.ts";

const createProps = (overrides: Partial<PraetoriumProps> = {}): PraetoriumProps => ({
  connected: true,
  lastError: null,
  gatewayUrl: "http://127.0.0.1:19000",
  hello: null,
  agentsList: null,
  eventLog: [],
  execApprovalQueue: [],
  cronJobs: [],
  workingRoom: {
    sessionKey: "agent:main:praetorium",
    label: "Sala de Trabalho do Praetorium",
    status: "Sala ativa",
    note: "Mantenha bloqueios e repasses na mesma thread.",
  },
  onRefresh: () => undefined,
  onOpenCommand: () => undefined,
  onOpenWorkingRoom: () => undefined,
  onSendOpsBrief: () => undefined,
  ...overrides,
});

describe("praetorium view", () => {
  it("renders and wires the working room actions", () => {
    const container = document.createElement("div");
    const onRefresh = vi.fn();
    const onOpenCommand = vi.fn();
    const onOpenWorkingRoom = vi.fn();
    const onSendOpsBrief = vi.fn();

    render(
      renderPraetorium(
        createProps({
          onRefresh,
          onOpenCommand,
          onOpenWorkingRoom,
          onSendOpsBrief,
        }),
      ),
      container,
    );

    const text = container.textContent ?? "";
    expect(text).toContain("Sala de Trabalho");
    expect(text).toContain("Sala de Trabalho do Praetorium");

    const buttons = Array.from(container.querySelectorAll("button"));
    const openButton = buttons.find((button) => button.textContent?.trim() === "Abrir Sala de Trabalho");
    const seedButton = buttons.find(
      (button) => button.textContent?.trim() === "Semear Sala com Brief Operacional",
    );
    const refreshButton = buttons.find(
      (button) => button.textContent?.trim() === "Atualizar telemetria",
    );
    const commandButton = buttons.find((button) => button.textContent?.trim() === "Voltar ao Command");

    openButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    seedButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    refreshButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    commandButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onOpenWorkingRoom).toHaveBeenCalledTimes(1);
    expect(onSendOpsBrief).toHaveBeenCalledTimes(1);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onOpenCommand).toHaveBeenCalledTimes(1);
  });
});
