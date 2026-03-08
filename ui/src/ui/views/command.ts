import { html } from "lit";
import type { ExecApprovalRequest } from "../controllers/exec-approval.ts";
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
import type {
  AgentsListResult,
  ChannelsStatusSnapshot,
  CronStatus,
  PresenceEntry,
} from "../types.ts";

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
        props.execApprovalQueue.length > 0
          ? `${props.execApprovalQueue.length} pending`
          : "Clear for action",
      detail: "Vetos, autorização HITL e decisões que exigem autoridade formal.",
    },
    {
      name: "Operations",
      owner: "Chief Executive Agent",
      status: `${props.presenceEntries.length} live nodes`,
      detail: "Rede operacional observável. Telemetria específica de The Pilots ainda precisa ser conectada.",
    },
    {
      name: "Capital & Assets",
      owner: "Chief Financial Agent",
      status: props.sessionsCount != null ? `${props.sessionsCount} tracked sessions` : "Feed pending",
      detail: "Fluxo financeiro real ainda não está ligado a esta superfície. Sessões já estão disponíveis como lastro operacional.",
    },
    {
      name: "Compliance",
      owner: "Chief Legal Agent",
      status: props.lastError ? "Attention required" : "Nominal",
      detail: "Contratos, seguros e normativos. Nesta etapa, o melhor sinal disponível é a saúde do runtime.",
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
  const channels = props.channelsSnapshot?.channelOrder?.length ?? 0;

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
          <div class="collegium-kpi-card__value">Feed pending</div>
          <div class="muted">
            A superfície já reserva o domínio operacional, mas a telemetria real dos Pilots ainda
            não está conectada ao runtime atual.
          </div>
        </div>
        <div class="collegium-kpi-card">
          <div class="collegium-kpi-card__label">Connected Networks</div>
          <div class="collegium-kpi-card__value">${channels}</div>
          <div class="muted">Canais configurados e disponíveis como rede institucional.</div>
        </div>
        <div class="collegium-kpi-card">
          <div class="collegium-kpi-card__label">Operational Lattice</div>
          <div class="collegium-kpi-card__value">${props.presenceEntries.length}</div>
          <div class="muted">Presença em tempo real dos nós e instâncias do ambiente.</div>
        </div>
        <div class="collegium-kpi-card">
          <div class="collegium-kpi-card__label">Automated Routines</div>
          <div class="collegium-kpi-card__value">${props.cronStatus?.jobs ?? 0}</div>
          <div class="muted">Rotinas já conectadas ao Foundry e à disciplina operacional.</div>
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
              ${props.execApprovalQueue.length > 0
                ? "A pauta já exige decisão humana"
                : "A sala está pronta para deliberação"}
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
            ${renderCapability("The Pilots Telemetry", "Not yet bound")}
            ${renderCapability("Financial Feed", "Not yet bound")}
          </div>
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
