import { html } from "lit";
import type { CommandDomainProjection } from "../collegium-domain.ts";
import type { ExecApprovalRequest } from "../controllers/exec-approval.ts";
import type {
  AgentsListResult,
  ChannelsStatusSnapshot,
  CronStatus,
  PresenceEntry,
} from "../types.ts";
import {
  COLLEGIUM_BRAND_NAME,
  COLLEGIUM_COMMAND_NAME,
  COLLEGIUM_PROTOCOL_NAME,
  COLLEGIUM_RUNTIME_NAME,
  COLLEGIUM_SLOGAN,
  countBusinessAgents,
  countEngineeringAgents,
  type RuntimeEnvironment,
} from "../collegium.ts";

export type CommandProps = {
  connected: boolean;
  lastError: string | null;
  environment: RuntimeEnvironment;
  agentsList: AgentsListResult | null;
  presenceEntries: PresenceEntry[];
  channelsSnapshot: ChannelsStatusSnapshot | null;
  execApprovalQueue: ExecApprovalRequest[];
  cronStatus: CronStatus | null;
  sessionsCount: number | null;
  domainProjection: CommandDomainProjection;
  onRefresh: () => void;
  onOpenForum: () => void;
  onOpenPraetorium: () => void;
};

export function renderCommand(props: CommandProps) {
  const businessAgents = countBusinessAgents(props.agentsList);
  const engineeringAgents = countEngineeringAgents(props.agentsList);
  const departments = [
    {
      name: "Boardroom",
      owner: "Chairman",
      status:
        props.domainProjection.pendingDeliberationCount > 0
          ? `${props.domainProjection.pendingDeliberationCount} institutional pending`
          : props.execApprovalQueue.length > 0
            ? `${props.execApprovalQueue.length} runtime pending`
            : "Clear for action",
      detail: "Vetos, autorização HITL e decisões que exigem autoridade formal.",
    },
    {
      name: "Operations",
      owner: "Chief Executive Agent",
      status: `${props.domainProjection.activePilotCount}/${props.domainProjection.pilotCount} pilots active`,
      detail:
        "A camada de domínio já projeta pilotos e mobilidade. A lattice de runtime continua ao lado como telemetria operacional.",
    },
    {
      name: "Capital & Assets",
      owner: "Chief Financial Agent",
      status: `${props.domainProjection.validatedProductionUnits} validated U.P.`,
      detail:
        "Produção econômica derivada de eventos de mobilidade completados e validados por evidência.",
    },
    {
      name: "Compliance",
      owner: "Chief Legal Agent",
      status:
        props.domainProjection.operationalAlerts.length > 0 ? "Protocol alerts raised" : "Nominal",
      detail:
        "Governança protocolar, restrições e eventos contestados agora aparecem como alertas explícitos de domínio.",
    },
    {
      name: "The Foundry",
      owner: "Chief Product/Eng. Agent",
      status:
        props.cronStatus?.jobs != null
          ? `${props.cronStatus.jobs} routines`
          : `${engineeringAgents} engineering agents`,
      detail: "R&D, stack, roteirização e evolução do sistema.",
    },
  ];
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
            <span class="chip">${props.environment}</span>
          </div>
          <div class="row" style="margin-top: 18px; gap: 10px;">
            <button class="btn primary" @click=${props.onOpenForum}>Enter The Forum</button>
            <button class="btn" @click=${props.onOpenPraetorium}>Open Praetorium</button>
            <button class="btn" @click=${props.onRefresh}>Refresh</button>
          </div>
        </div>

        <div class="collegium-hero__rail">
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Institution State</div>
            <div class="collegium-status-card__value ${props.connected ? "ok" : "warn"}">
              ${props.connected ? "Operational" : "Awaiting Runtime"}
            </div>
            <div class="muted">
              ${props.lastError ?? "Runtime and protocol are responding without a blocking error."}
            </div>
          </div>
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Chairman Rail</div>
            <div class="collegium-status-card__value">
              ${props.execApprovalQueue.length}
            </div>
            <div class="muted">Pending authority requests waiting for a decision.</div>
          </div>
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Digital Collaborators</div>
            <div class="collegium-status-card__value">
              ${props.agentsList?.agents.length ?? 0}
            </div>
            <div class="muted">
              ${businessAgents} business · ${engineeringAgents} engineering
            </div>
          </div>
        </div>
      </section>

      <section class="collegium-kpi-grid">
        <div class="collegium-kpi-card">
          <div class="collegium-kpi-card__label">The Pilots</div>
          <div class="collegium-kpi-card__value">
            ${props.domainProjection.activePilotCount}/${props.domainProjection.pilotCount}
          </div>
          <div class="muted">
            Fixture-backed protocol model. O domínio já mostra pilotos ativos sem fingir telemetria real de campo.
          </div>
        </div>
        <div class="collegium-kpi-card">
          <div class="collegium-kpi-card__label">Connected Networks</div>
          <div class="collegium-kpi-card__value">${props.domainProjection.connectedNetworkCount}</div>
          <div class="muted">Domain projection das redes econômicas atualmente modeladas.</div>
        </div>
        <div class="collegium-kpi-card">
          <div class="collegium-kpi-card__label">Operational Lattice</div>
          <div class="collegium-kpi-card__value">${props.presenceEntries.length}</div>
          <div class="muted">Presença em tempo real dos nós e instâncias do ambiente.</div>
        </div>
        <div class="collegium-kpi-card">
          <div class="collegium-kpi-card__label">Validated U.P.</div>
          <div class="collegium-kpi-card__value">${props.domainProjection.validatedProductionUnits}</div>
          <div class="muted">Produção validada a partir de eventos concluídos e ledger protocolar.</div>
        </div>
      </section>

      <section class="grid grid-cols-2" style="margin-top: 18px;">
        <div class="card">
          <div class="card-title">Governed Field</div>
          <div class="card-sub">
            Sinais do dominio que ja exigem governanca sobre pilotos, passageiros e eventos.
          </div>
          <div class="list" style="margin-top: 12px;">
            ${renderCapability("Restricted Pilots", String(props.domainProjection.restrictedPilotCount))}
            ${renderCapability("Flagged Passengers", String(props.domainProjection.flaggedPassengerCount))}
            ${renderCapability("Contested Mobility", String(props.domainProjection.contestedMobilityCount))}
            ${renderCapability("Completed Mobility", String(props.domainProjection.completedMobilityCount))}
          </div>
        </div>

        <div class="card">
          <div class="card-title">Corridor Watch</div>
        <div class="card-sub">
            Corredores e rede economica derivados do snapshot protocolar atual.
          </div>
          <div class="list" style="margin-top: 12px;">
            ${props.domainProjection.networkSummary.map(
              (node) => html`
                <div class="list-item">
                  <div class="list-main">
                    <div class="list-title">${node.label}</div>
                    <div class="list-sub">
                      ${node.pilotCount} pilot(s) · supervisor ${node.supervisedBy ?? "unassigned"}
                    </div>
                    <div class="muted">
                      ${node.activeMobilityCount} active mobility · ${node.contestedMobilityCount}
                      contested · ${node.pressureLevel} pressure
                    </div>
                  </div>
                  <div class="list-meta mono">${node.activeProductionUnits} U.P.</div>
                </div>
              `,
            )}
          </div>
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
              ${
                props.execApprovalQueue.length > 0
                  ? "A pauta já exige decisão humana"
                  : "A sala está pronta para deliberação"
              }
            </div>
            <div class="muted">
              ${
                props.execApprovalQueue.length > 0
                  ? `Há ${props.execApprovalQueue.length} item(ns) na trilha de decisão.`
                  : "Sem decisões pendentes nesta leitura. Use a sala para abrir contexto estratégico."
              }
            </div>
          </div>
          <div class="row" style="margin-top: 14px;">
            <button class="btn primary" @click=${props.onOpenForum}>Open The Forum</button>
          </div>
        </div>

        <div class="card collegium-capability-card">
          <div class="card-title">Execution Envelope</div>
          <div class="card-sub">
            O que já está ligado agora, sem inventar backend que ainda não existe.
          </div>
          <div class="list" style="margin-top: 12px;">
            ${renderCapability("Colaboradores Digitais", `${props.agentsList?.agents.length ?? 0} loaded`)}
            ${renderCapability("Authority Rail", `${props.execApprovalQueue.length} pending decisions`)}
            ${renderCapability("Runtime Presence", `${props.presenceEntries.length} live instances`)}
            ${renderCapability("The Pilots Domain", `${props.domainProjection.pilotCount} pilots mapped`)}
            ${renderCapability("Protocol Source", props.domainProjection.provenance)}
          </div>
        </div>
      </section>

      <section class="card" style="margin-top: 18px;">
        <div class="card-title">Corridor Pressure</div>
        <div class="card-sub">
          Pressao operacional por corredor, separando producao, mobilidade ativa e disputa institucional.
        </div>
        <div class="list" style="margin-top: 12px;">
          ${props.domainProjection.networkSummary.map(
            (node) => html`
              <div class="list-item">
                <div class="list-main">
                  <div class="list-title">${node.label}</div>
                  <div class="list-sub">
                    ${node.activeProductionUnits} validated U.P. · ${node.activeMobilityCount}
                    active mobility
                  </div>
                </div>
                <div class="list-meta">
                  <div class="mono">${node.pressureLevel}</div>
                  <div class="muted">${node.contestedMobilityCount} contested</div>
                </div>
              </div>
            `,
          )}
        </div>
      </section>

      <section class="card" style="margin-top: 18px;">
        <div class="card-title">Pilot Board</div>
        <div class="card-sub">
          Leitura operacional por piloto, ainda derivada do snapshot protocolar atual.
        </div>
        <div class="list" style="margin-top: 12px;">
          ${props.domainProjection.pilotBoard.map(
            (pilot) => html`
              <div class="list-item">
                <div class="list-main">
                  <div class="list-title">${pilot.displayName}</div>
                  <div class="list-sub">
                    reputation ${pilot.reputationScore} · active mobility ${pilot.activeMobilityEvents}
                  </div>
                  ${
                    pilot.flags.length > 0
                      ? html`<div class="muted">flags: ${pilot.flags.join(", ")}</div>`
                      : html`<div class="muted">No active governance flags.</div>`
                  }
                </div>
                <div class="list-meta">
                  <div class="mono">${pilot.productionUnitsValidated} U.P.</div>
                  <div class="muted">${pilot.status}</div>
                </div>
              </div>
            `,
          )}
        </div>
      </section>

      <section class="card" style="margin-top: 18px;">
        <div class="card-title">Mobility Board</div>
        <div class="card-sub">
          Eventos de mobilidade que sustentam producao, risco e pauta institucional.
        </div>
        <div class="list" style="margin-top: 12px;">
          ${props.domainProjection.mobilityBoard.map(
            (event) => html`
              <div class="list-item">
                <div class="list-main">
                  <div class="list-title">${event.routeLabel}</div>
                  <div class="list-sub">${event.pilotLabel} · ${event.passengerLabel}</div>
                  <div class="muted">
                    ${
                      event.riskSignals.length > 0
                        ? `signals: ${event.riskSignals.join(", ")}`
                        : "No additional risk signals."
                    }
                  </div>
                </div>
                <div class="list-meta">
                  <div class="mono">${event.productionUnitsGenerated} U.P.</div>
                  <div class="muted">${event.status}</div>
                </div>
              </div>
            `,
          )}
        </div>
      </section>

      <section class="card" style="margin-top: 18px;">
        <div class="card-title">Governance Watchlist</div>
        <div class="card-sub">
          Itens do dominio que ja pedem vigilancia institucional antes de qualquer backend real.
        </div>
        <div class="list" style="margin-top: 12px;">
          ${props.domainProjection.governanceWatchlist.map(
            (item) => html`
              <div class="list-item">
                <div class="list-main">
                  <div class="list-title">${item.title}</div>
                  <div class="list-sub">${item.summary}</div>
                </div>
                <div class="list-meta">
                  <div class="mono">${item.kind}</div>
                  <div class="muted">${item.status}</div>
                </div>
              </div>
            `,
          )}
        </div>
      </section>

      <section class="card" style="margin-top: 18px;">
        <div class="card-title">Operational Alerts</div>
        <div class="card-sub">
          Alertas derivados do domínio protocolar. Não substituem runtime; complementam a leitura executiva.
        </div>
        <div class="list" style="margin-top: 12px;">
          ${
            props.domainProjection.operationalAlerts.length === 0
              ? html`
                  <div class="muted">No protocol alert is currently projected.</div>
                `
              : props.domainProjection.operationalAlerts.map(
                  (alert) => html`
                    <div class="list-item">
                      <div class="list-main">
                        <div class="list-title">${alert}</div>
                      </div>
                      <div class="list-meta mono">${props.domainProjection.provenance}</div>
                    </div>
                  `,
                )
          }
        </div>
      </section>

      <section class="card" style="margin-top: 18px;">
        <div class="card-title">The CORE</div>
        <div class="card-sub">
          Governança comercial do Collegium Cortex, com leitura honesta do que já está disponível.
        </div>
        <div class="collegium-module-grid">
          ${departments.map(
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
