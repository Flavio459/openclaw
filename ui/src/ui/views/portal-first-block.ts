import { html } from "lit";
import type { PortalFirstBlockViewModel } from "../collegium/portal.contract.ts";

export type PortalFirstBlockProps = {
  viewModel: PortalFirstBlockViewModel;
};

export const renderPortalFirstBlock = ({ viewModel }: PortalFirstBlockProps) => html`
  <section class="card portal-first-block" data-portal-state=${viewModel.state}>
    <div class="portal-first-block__context muted">${viewModel.contextLine}</div>
    <h2 class="portal-first-block__headline">${viewModel.primaryHeadline}</h2>
    <p class="portal-first-block__subheadline">${viewModel.supportingSubheadline}</p>

    <div class="portal-first-block__actions row">
      <a class="btn primary portal-first-block__primary-cta" href=${viewModel.primaryCta.href}>
        ${viewModel.primaryCta.label}
      </a>
    </div>

    <section class="portal-first-block__signal-panel callout">
      <div class="card-title">Leitura sintética</div>
      <div class="muted">${viewModel.signalPanel.compressedMargin}</div>
      <div class="muted">${viewModel.signalPanel.leakPoint}</div>
      <div class="muted">${viewModel.signalPanel.nextAdjustment}</div>
      <div class="mono">data-state: ${viewModel.signalPanel.dataState}</div>
    </section>

    <div class="portal-first-block__secondary">
      <a class="btn portal-first-block__secondary-cta" href=${viewModel.secondaryCta.href}>
        ${viewModel.secondaryCta.label}
      </a>
    </div>
  </section>
`;
