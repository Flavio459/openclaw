import { html } from "lit";
import {
  buildPortalDefaultRuntimeInput,
  buildPortalFirstBlockViewModel,
  type PortalDefaultRuntimeInput,
} from "../collegium/portal.adapter.ts";
import { PORTAL_DEFAULT_RUNTIME_BASELINE } from "../collegium/portal.contract.ts";
import {
  portalDefaultFixture,
  portalHighTensionFixture,
  portalLowSignalFixture,
  portalMobileCompactFixture,
  portalMobileContinuityFixture,
} from "../collegium/portal.fixtures.ts";
import { renderPortalFirstBlock } from "./portal-first-block.ts";

type PortalPreviewProps = {
  runtimeDefaultInput?: PortalDefaultRuntimeInput | null;
  reviewRoom?: {
    sessionKey: string;
    label: string;
    status: string;
    note: string;
  };
  onOpenReviewRoom?: () => void;
  onSendReviewBrief?: () => void;
};

const fixedPreviewStates = [
  {
    title: "Portal High Tension",
    description: "Estado com maior pressão operacional, mantendo dominância do CTA primário.",
    fixture: portalHighTensionFixture,
  },
  {
    title: "Portal Low Signal",
    description: "Estado com dados parciais, marcando placeholders de forma explícita.",
    fixture: portalLowSignalFixture,
  },
  {
    title: "Portal Mobile Compact",
    description: "Primeira área visível focada em headline e CTA primário.",
    fixture: portalMobileCompactFixture,
  },
  {
    title: "Portal Mobile Continuity",
    description: "Continuidade móvel preservando a subordinação do CTA secundário.",
    fixture: portalMobileContinuityFixture,
  },
];

export const renderPortalPreview = (props: PortalPreviewProps = {}) => {
  const previewStates = [
    {
      title: "Portal Default",
      description:
        "Leitura principal do bloco agora ancorada na prontidão real do runtime, sem fingir telemetria de turno onde ela ainda não existe.",
      fixture: props.runtimeDefaultInput
        ? buildPortalDefaultRuntimeInput(props.runtimeDefaultInput)
        : portalDefaultFixture,
    },
    ...fixedPreviewStates,
  ];
  const liveBinding = Boolean(props.runtimeDefaultInput);
  const baselineStatus =
    PORTAL_DEFAULT_RUNTIME_BASELINE.status === "internal-stable" ? "Internal Stable" : "Draft";
  const liveBindingLabel = liveBinding ? "Presence + Heartbeat + Input + Runtime Rails" : "None";
  const liveBindingDescription = liveBinding
    ? "O estado default já reflete continuidade de presença com heartbeat recente, frescor de input, sessões ativas e pressão do trilho de autoridade, sem fingir leitura viva de turno onde ela ainda não existe."
    : "Surface interna, estática e tipada, sem leitura direta do vault em produção.";

  return html`
  <section class="collegium-shell">
    <section class="collegium-hero collegium-hero--forum portal-preview-hero">
      <div class="collegium-hero__main">
        <div class="collegium-kicker">Prévia do Portal</div>
        <h2>Superfície Interna de Revisão</h2>
        <p class="collegium-lead">
          Revisão interna do primeiro bloco do portal como interface viva controlada, ainda sem rota
          pública e sem acoplamento ao runtime.
        </p>
        <div class="row" style="margin-top: 18px; gap: 10px;">
          <button class="btn primary" @click=${() => props.onOpenReviewRoom?.()}>
            Continuar Sala de Revisão
          </button>
          <button class="btn" @click=${() => props.onSendReviewBrief?.()}>
            Enviar Brief do Portal
          </button>
        </div>
      </div>
      <div class="collegium-hero__rail">
        <div class="collegium-status-card">
          <div class="collegium-status-card__label">Estados</div>
          <div class="collegium-status-card__value">${previewStates.length}</div>
          <div class="muted">Cinco estados canônicos do bloco já renderizáveis para revisão interna.</div>
        </div>
        <div class="collegium-status-card">
          <div class="collegium-status-card__label">Acoplamento ao Runtime</div>
          <div class="collegium-status-card__value ${liveBinding ? "ok" : ""}">
            ${liveBindingLabel}
          </div>
          <div class="muted">${liveBindingDescription}</div>
        </div>
        <div class="collegium-status-card">
          <div class="collegium-status-card__label">Baseline</div>
          <div class="collegium-status-card__value ok">${baselineStatus}</div>
          <div class="muted">
            ${PORTAL_DEFAULT_RUNTIME_BASELINE.includedSignals.length} sinais travados. Expansão só após
            ${PORTAL_DEFAULT_RUNTIME_BASELINE.nextExpansionGate}.
          </div>
        </div>
        <div class="collegium-status-card">
          <div class="collegium-status-card__label">Sala de Revisão</div>
          <div class="muted mono">${props.reviewRoom?.label ?? "Sala de Revisão da Prévia do Portal"}</div>
          <div class="collegium-status-card__value">
            ${props.reviewRoom?.status ?? "Sala indisponível"}
          </div>
          <div class="muted">
            ${props.reviewRoom?.note ??
            "Abra uma sala dedicada para manter a revisão do portal presa a um fio persistente."}
          </div>
          <div class="row" style="margin-top: 12px; gap: 8px;">
            <button class="btn" @click=${() => props.onOpenReviewRoom?.()}>Abrir Sala de Revisão</button>
            <button class="btn" @click=${() => props.onSendReviewBrief?.()}>
              Semear Sala com o Bloco Atual
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="portal-preview-grid">
      ${previewStates.map((entry) => {
        const viewModel = buildPortalFirstBlockViewModel(entry.fixture);
        return html`
          <article class="card portal-preview-card">
            <div class="card-title">${entry.title}</div>
            <div class="card-sub">${entry.description}</div>
            <div class="portal-preview-card__surface">
              ${renderPortalFirstBlock({ viewModel })}
            </div>
          </article>
        `;
      })}
    </section>
  </section>
`;
};
