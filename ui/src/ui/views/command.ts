import { html } from "lit";
import {
  COLLEGIUM_BRAND_NAME,
  COLLEGIUM_COMMAND_NAME,
  COLLEGIUM_PROTOCOL_NAME,
  COLLEGIUM_RUNTIME_NAME,
  COLLEGIUM_SLOGAN,
} from "../collegium.ts";
import type { CommandViewModel } from "../collegium/command.contract.ts";

export type CommandProps = {
  viewModel: CommandViewModel;
  onRefresh: () => void;
  onOpenForum: () => void;
  onOpenPraetorium: () => void;
};

export function renderCommand(props: CommandProps) {
  const { viewModel } = props;
  const institutionTone =
    viewModel.institutionState.status === "operational"
      ? "ok"
      : viewModel.institutionState.status === "attention_required"
        ? "warn"
        : "warn";

  return html`
    <section class="collegium-shell">
      <section class="collegium-hero collegium-hero--command">
        <div class="collegium-hero__main">
          <div class="collegium-kicker">${COLLEGIUM_BRAND_NAME}</div>
          <h2>${COLLEGIUM_COMMAND_NAME}</h2>
          <p class="collegium-lead">
            ${COLLEGIUM_SLOGAN}. Escritório digital da companhia, com visão executiva da operação,
            governança do The CORE e acesso imediato ao ${" "}
            <span class="mono">${"The Forum"}</span>.
          </p>
          <div class="chip-row">
            <span class="chip">${COLLEGIUM_PROTOCOL_NAME}</span>
            <span class="chip">${COLLEGIUM_RUNTIME_NAME}</span>
            <span class="chip">${viewModel.environment}</span>
          </div>
          <div class="callout" style="margin-top: 18px;">
            <div class="card-title">${viewModel.commandPriority.headline}</div>
            <div class="muted">${viewModel.commandPriority.tension}</div>
          </div>
          <div class="callout" style="margin-top: 12px;">
            <div class="card-title">${viewModel.dominantWorkstream.label}</div>
            <div class="muted">${viewModel.dominantWorkstream.summary}</div>
          </div>
          <div class="row" style="margin-top: 18px; gap: 10px;">
            <button class="btn primary" @click=${props.onOpenForum}>
              ${viewModel.bridges.forumLabel}
            </button>
            <button class="btn" @click=${props.onOpenPraetorium}>
              ${viewModel.bridges.praetoriumLabel}
            </button>
            <button class="btn" @click=${props.onRefresh}>Atualizar</button>
          </div>
        </div>

        <div class="collegium-hero__rail">
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Estado Institucional</div>
            <div class="collegium-status-card__value ${institutionTone}">
              ${formatInstitutionState(viewModel.institutionState.status)}
            </div>
            <div class="muted">${viewModel.institutionState.detail}</div>
          </div>
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Trilho do Chairman</div>
            <div class="collegium-status-card__value">
              ${viewModel.chairmanRail.pendingAuthorityCount}
            </div>
            <div class="muted">Solicitações de autoridade pendentes aguardando decisão.</div>
          </div>
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Colaboradores Digitais</div>
            <div class="collegium-status-card__value">
              ${viewModel.collaborators.total}
            </div>
            <div class="muted">
              ${viewModel.collaborators.business} negócio ·
              ${viewModel.collaborators.engineering} engenharia
            </div>
          </div>
        </div>
      </section>

      <section class="collegium-kpi-grid">
        <div class="collegium-kpi-card">
          <div class="collegium-kpi-card__label">Faixa de Prioridade</div>
          <div class="collegium-kpi-card__value">${viewModel.commandPriority.headline}</div>
          <div class="muted">
            ${viewModel.commandPriority.tension}
          </div>
        </div>
        <div class="collegium-kpi-card">
          <div class="collegium-kpi-card__label">Workstream Dominante</div>
          <div class="collegium-kpi-card__value">${viewModel.dominantWorkstream.label}</div>
          <div class="muted">${viewModel.dominantWorkstream.summary}</div>
        </div>
        <div class="collegium-kpi-card">
          <div class="collegium-kpi-card__label">Malha Operacional</div>
          <div class="collegium-kpi-card__value">${viewModel.executionEnvelope.runtimePresence}</div>
          <div class="muted">A evidência viva do runtime permanece subordinada à leitura executiva.</div>
        </div>
        <div class="collegium-kpi-card">
          <div class="collegium-kpi-card__label">Trilho de Autoridade</div>
          <div class="collegium-kpi-card__value">${viewModel.executionEnvelope.authorityRail}</div>
          <div class="muted">Decisões e riscos aprofundam a leitura sem substituir a prioridade principal.</div>
        </div>
      </section>

      <section class="grid grid-cols-2" style="margin-top: 18px;">
        <div class="card collegium-forum-card">
          <div class="card-title">The Forum</div>
          <div class="card-sub">
            Sala central para estratégia, incidentes, finanças, soluções e decisões do Chairman.
          </div>
          <div class="forum-callout">
            <div class="forum-callout__title">
              ${viewModel.chairmanRail.pendingAuthorityCount > 0
                ? "A pauta já exige decisão humana"
                : "A sala está pronta para deliberação"}
            </div>
            <div class="muted">
              ${
                viewModel.chairmanRail.pendingAuthorityCount > 0
                  ? `Há ${viewModel.chairmanRail.pendingAuthorityCount} item(ns) na trilha de decisão.`
                  : viewModel.signalContext.strategicAmbiguity
              }
            </div>
          </div>
          <div class="row" style="margin-top: 14px;">
            <button class="btn primary" @click=${props.onOpenForum}>
              ${viewModel.bridges.forumLabel}
            </button>
          </div>
        </div>

        <div class="card collegium-capability-card">
          <div class="card-title">Envelope de Execução</div>
          <div class="card-sub">
            O que já está ligado agora, sem inventar backend que ainda não existe.
          </div>
          <div class="list" style="margin-top: 12px;">
            ${renderCapability("Colaboradores Digitais", `${viewModel.collaborators.total} carregado(s)`)}
            ${renderCapability("Trilho de Autoridade", viewModel.executionEnvelope.authorityRail)}
            ${renderCapability("Presença do Runtime", viewModel.executionEnvelope.runtimePresence)}
            ${renderCapability("Telemetria de The Pilots", viewModel.executionEnvelope.pilotsTelemetry)}
            ${renderCapability("Feed Financeiro", viewModel.executionEnvelope.financialFeed)}
          </div>
        </div>
      </section>

      <section class="card" style="margin-top: 18px;">
        <div class="card-title">The CORE</div>
        <div class="card-sub">
          Governança comercial do Collegium Cortex, com leitura honesta do que já está disponível.
        </div>
        <div class="collegium-module-grid">
          ${viewModel.modules.map(
            (department) => html`
              <article class="collegium-module-card">
                <div class="collegium-module-card__title">${department.name}</div>
                <div class="collegium-module-card__meta">${department.owner}</div>
                <div class="collegium-module-card__status">${department.status}</div>
                <div class="muted">${department.detail}</div>
              </article>
            `,
          )}
        </div>
      </section>
    </section>
  `;
}

const formatInstitutionState = (status: CommandViewModel["institutionState"]["status"]) => {
  if (status === "operational") {
    return "Operacional";
  }
  if (status === "attention_required") {
    return "Atenção necessária";
  }
  return "Aguardando Runtime";
};

function renderCapability(label: string, value: string) {
  return html`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${label}</div>
      </div>
      <div class="list-meta mono">${value}</div>
    </div>
  `;
}
