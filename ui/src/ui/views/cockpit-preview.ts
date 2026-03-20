import { html } from "lit";
import type { CockpitContract } from "../collegium/cockpit.contract.ts";
import {
  buildCockpitRuntimeContract,
  type CockpitRuntimeInput,
} from "../collegium/cockpit.adapter.ts";
import {
  cockpitBaselineFixture,
  cockpitComplianceHoldFixture,
  cockpitDormantCityFixture,
} from "../collegium/cockpit.fixtures.ts";

type CockpitPreviewState = {
  title: string;
  description: string;
  fixture: CockpitContract;
};

function renderCockpitSurface(fixture: CockpitContract) {
  return html`
    <section class="cockpit-surface">
      <div class="cockpit-surface__topline">
        <span class="cockpit-surface__eyebrow">The Cockpit</span>
        <span class="cockpit-surface__badge">Superfície do Piloto</span>
        <span class="cockpit-surface__badge cockpit-surface__badge--${
          fixture.bindingState === "observed" ? "ok" : "warn"
        }">${fixture.bindingState}</span>
      </div>

      <div class="cockpit-surface__headline">
        <div>
          <div class="cockpit-surface__label">Identidade e Ativação</div>
          <p>${fixture.identityAndActivation}</p>
        </div>
        <div>
          <div class="cockpit-surface__label">Prontidão da Cidade</div>
          <p>${fixture.cityReadiness}</p>
        </div>
      </div>

      <div class="cockpit-surface__grid">
        <article class="cockpit-surface__panel">
          <div class="cockpit-surface__label">Posição de Rede</div>
          <p>${fixture.networkPosition}</p>
        </article>
        <article class="cockpit-surface__panel">
          <div class="cockpit-surface__label">Estado de Turno</div>
          <p>${fixture.turnState}</p>
        </article>
        <article class="cockpit-surface__panel">
          <div class="cockpit-surface__label">Estado de UP</div>
          <p>${fixture.upState}</p>
        </article>
        <article class="cockpit-surface__panel">
          <div class="cockpit-surface__label">Estado de Patente</div>
          <p>${fixture.rankState}</p>
        </article>
      </div>

      <div class="cockpit-surface__rails">
        <article class="cockpit-surface__rail">
          <div class="cockpit-surface__label">Alertas Operacionais</div>
          <ul>
            ${fixture.alerts.map((entry) => html`<li>${entry}</li>`)}
          </ul>
        </article>
        <article class="cockpit-surface__rail">
          <div class="cockpit-surface__label">Avisos de Compliance</div>
          <ul>
            ${fixture.complianceNotices.map((entry) => html`<li>${entry}</li>`)}
          </ul>
        </article>
      </div>

      <div class="cockpit-surface__binding">
        <div class="cockpit-surface__label">Fontes do Binding</div>
        <div class="cockpit-surface__binding-list">
          ${fixture.bindingSources.map((entry) => html`<span>${entry}</span>`)}
        </div>
      </div>
    </section>
  `;
}

export function renderCockpitPreview(options?: {
  runtimeDefaultInput?: CockpitRuntimeInput;
  reviewRoom?: {
    sessionKey: string;
    label: string;
    status: string;
    note: string;
  };
  onOpenReviewRoom?: () => void;
  onSendReviewBrief?: () => void;
}) {
  const previewStates: CockpitPreviewState[] = [
    {
      title: "Baseline do Piloto",
      description:
        "Leitura principal de ativação, prontidão da cidade e estado honesto de turno antes de qualquer binding econômico real.",
      fixture: options?.runtimeDefaultInput
        ? buildCockpitRuntimeContract(options.runtimeDefaultInput)
        : cockpitBaselineFixture,
    },
    {
      title: "Cidade Dormente",
      description:
        "Cidade ainda não pronta. O produto deve assumir espera explícita, não promessa latente de demanda.",
      fixture: cockpitDormantCityFixture,
    },
    {
      title: "Hold de Compliance",
      description:
        "Ativação visível, mas operacionalmente travada até que CFO e Legal validem evidência suficiente.",
      fixture: cockpitComplianceHoldFixture,
    },
  ];

  return html`
    <section class="collegium-shell">
      <section class="collegium-hero collegium-hero--cockpit cockpit-preview-hero">
        <div class="collegium-hero__main">
          <div class="collegium-kicker">The Cockpit</div>
          <h2>Revisão Interna da Superfície do Piloto</h2>
          <p class="collegium-lead">
            Superfície interna de revisão do produto do piloto, separada do cockpit técnico e ainda
            sem mapa, chat, payout ou binding econômico executável.
          </p>
          <div class="row" style="margin-top: 18px; gap: 10px;">
            <button class="btn primary" @click=${() => options?.onOpenReviewRoom?.()}>
              Continuar Sala de Revisão
            </button>
            <button class="btn" @click=${() => options?.onSendReviewBrief?.()}>
              Enviar Brief do Piloto
            </button>
          </div>
        </div>
        <div class="collegium-hero__rail">
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Estados</div>
            <div class="collegium-status-card__value">${previewStates.length}</div>
            <div class="muted">
              Baseline com binding operacional mínimo, cidade dormente e hold de compliance tipados
              para revisão.
            </div>
          </div>
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Binding Econômico</div>
            <div class="collegium-status-card__value warn">not_bound</div>
            <div class="muted">Sem payout, demanda, remuneração ou incentivo executável nesta fase.</div>
          </div>
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Fronteira</div>
            <div class="collegium-status-card__value ok">Distinta</div>
            <div class="muted">
              The Cockpit permanece separado de Cortex Praetorium em naming, UX e responsabilidade.
            </div>
          </div>
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Binding ao Runtime</div>
            <div class="collegium-status-card__value">
              ${previewStates[0]?.fixture.bindingState ?? "placeholder"}
            </div>
            <div class="muted">
              Só o estado baseline lê continuidade operacional mínima; os outros continuam como
              cenários canônicos de revisão.
            </div>
          </div>
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Sala de Revisão</div>
            <div class="muted mono">${options?.reviewRoom?.label ?? "Sala de Revisão do The Cockpit"}</div>
            <div class="collegium-status-card__value">
              ${options?.reviewRoom?.status ?? "Sala indisponível"}
            </div>
            <div class="muted">
              ${options?.reviewRoom?.note ??
              "Abra uma sala dedicada para manter a revisão da superfície do piloto em um fio persistente."}
            </div>
            <div class="row" style="margin-top: 12px; gap: 8px;">
              <button class="btn" @click=${() => options?.onOpenReviewRoom?.()}>Abrir Sala de Revisão</button>
              <button class="btn" @click=${() => options?.onSendReviewBrief?.()}>
                Semear Sala com o Brief do Piloto
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="cockpit-preview-grid">
        ${previewStates.map(
          (entry) => html`
            <article class="card cockpit-preview-card">
              <div class="card-title">${entry.title}</div>
              <div class="card-sub">${entry.description}</div>
              <div class="cockpit-preview-card__surface">${renderCockpitSurface(entry.fixture)}</div>
            </article>
          `,
        )}
      </section>
    </section>
  `;
}
