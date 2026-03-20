import { render } from "lit";
import { describe, expect, it } from "vitest";
import { buildPortalFirstBlockViewModel } from "../collegium/portal.adapter.ts";
import {
  portalDefaultFixture,
  portalLowSignalFixture,
} from "../collegium/portal.fixtures.ts";
import { renderPortalFirstBlock } from "./portal-first-block.ts";

describe("portal first block view", () => {
  it("renders the first-dobro elements in the mandated order", () => {
    const container = document.createElement("div");
    const viewModel = buildPortalFirstBlockViewModel(portalDefaultFixture);
    render(renderPortalFirstBlock({ viewModel }), container);

    const text = container.textContent ?? "";
    expect(text.indexOf(viewModel.contextLine)).toBeLessThan(text.indexOf(viewModel.primaryHeadline));
    expect(text.indexOf(viewModel.primaryHeadline)).toBeLessThan(
      text.indexOf(viewModel.supportingSubheadline),
    );
    expect(text.indexOf(viewModel.supportingSubheadline)).toBeLessThan(
      text.indexOf(viewModel.primaryCta.label),
    );
    expect(text.indexOf(viewModel.primaryCta.label)).toBeLessThan(
      text.indexOf(viewModel.secondaryCta.label),
    );
  });

  it("keeps the primary CTA and secondary CTA visually separated by explicit classes", () => {
    const container = document.createElement("div");
    const viewModel = buildPortalFirstBlockViewModel(portalDefaultFixture);
    render(renderPortalFirstBlock({ viewModel }), container);

    expect(container.querySelector(".portal-first-block__primary-cta")).not.toBeNull();
    expect(container.querySelector(".portal-first-block__secondary-cta")).not.toBeNull();
  });

  it("renders low-signal state honestly with placeholder data", () => {
    const container = document.createElement("div");
    const viewModel = buildPortalFirstBlockViewModel(portalLowSignalFixture);
    render(renderPortalFirstBlock({ viewModel }), container);

    expect(container.textContent).toContain("data-state: placeholder");
    expect(container.getAttribute("data-portal-state")).toBeNull();
    expect(container.querySelector("[data-portal-state='portal-low-signal']")).not.toBeNull();
  });
});
