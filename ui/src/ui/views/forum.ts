import { html, nothing } from "lit";
import type { EventLogEntry } from "../app-events.ts";
import {
  COLLEGIUM_FORUM_NAME,
  COLLEGIUM_PROTOCOL_NAME,
  buildDevEvents,
  groupAgentsByClass,
  type RuntimeEnvironment,
} from "../collegium.ts";
import type { ExecApprovalRequest } from "../controllers/exec-approval.ts";
import type { GatewayHelloOk } from "../gateway.ts";
import type { AgentsListResult } from "../types.ts";

export type ForumProps = {
  gatewayUrl: string;
  hello: GatewayHelloOk | null;
  environment: RuntimeEnvironment;
  agentsList: AgentsListResult | null;
  eventLog: EventLogEntry[];
  execApprovalQueue: ExecApprovalRequest[];
  onRefresh: () => void;
  onOpenPraetorium: () => void;
};

export function renderForum(props: ForumProps) {
  const agents = groupAgentsByClass(props.agentsList);
  const events = buildDevEvents(props.eventLog, props.gatewayUrl, props.hello, props.agentsList);
  const strategicEvents = events
    .filter((entry) => entry.surface === "the_forum" || entry.scope === "product")
    .slice(0, 6);

  return html`
    <section class="collegium-shell">
      <section class="collegium-hero collegium-hero--forum">
        <div class="collegium-hero__main">
          <div class="collegium-kicker">${COLLEGIUM_FORUM_NAME}</div>
          <h2>Strategic Deliberation Room</h2>
          <p class="collegium-lead">
            Espaço central para problemas, ideias, soluções, resultados, finanças e decisões. O
            foco aqui não é o runtime bruto; é a consolidação da direção da companhia.
          </p>
          <div class="chip-row">
            <span class="chip">${COLLEGIUM_PROTOCOL_NAME}</span>
            <span class="chip">${props.environment}</span>
            <span class="chip">${agents.length} collaborators present</span>
          </div>
        </div>
        <div class="collegium-hero__rail">
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Pending Decisions</div>
            <div class="collegium-status-card__value">${props.execApprovalQueue.length}</div>
            <div class="muted">Items that can be escalated to the Chairman rail.</div>
          </div>
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Strategic Traces</div>
            <div class="collegium-status-card__value">${strategicEvents.length}</div>
            <div class="muted">Relevant product or authority events visible in the current feed.</div>
          </div>
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Board Access</div>
            <div class="collegium-status-card__value">${agents.filter((entry) => entry.class === "business_agent").length}</div>
            <div class="muted">Business agents participating in the current governance lattice.</div>
          </div>
        </div>
      </section>

      <section class="forum-layout">
        <div class="forum-main">
          <section class="card">
            <div class="card-title">Current Agenda</div>
            <div class="card-sub">What the room can act on right now without guessing.</div>
            <div class="forum-agenda-list">
              ${
                props.execApprovalQueue.length === 0
                  ? html`
                      <div class="callout" style="margin-top: 14px;">
                        No authority request is waiting. The room is clear for proactive strategy work.
                      </div>
                    `
                  : props.execApprovalQueue.map((entry) => renderDecisionCard(entry))
              }
            </div>
          </section>

          <section class="card" style="margin-top: 18px;">
            <div class="card-title">Context Stream</div>
            <div class="card-sub">Recent events that matter to strategy, risk, or authority.</div>
            <div class="list" style="margin-top: 12px;">
              ${
                strategicEvents.length === 0
                  ? html`<div class="muted">No strategic traces visible yet.</div>`
                  : strategicEvents.map(
                      (entry) => html`
                        <div class="list-item">
                          <div class="list-main">
                            <div class="list-title">${entry.title}</div>
                            <div class="list-sub">${entry.summary}</div>
                          </div>
                          <div class="list-meta">
                            <div class="mono">${entry.scope}</div>
                            <div class="muted">${new Date(entry.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      `,
                    )
              }
            </div>
          </section>
        </div>

        <aside class="forum-rail">
          <section class="card">
            <div class="card-title">Participants</div>
            <div class="card-sub">Digital collaborators currently defined in the system.</div>
            <div class="list" style="margin-top: 12px;">
              ${
                agents.length === 0
                  ? html`<div class="muted">No collaborators loaded.</div>`
                  : agents.map(
                      (agent) => html`
                        <div class="list-item">
                          <div class="list-main">
                            <div class="list-title">${agent.displayName}</div>
                            <div class="list-sub">${agent.id}</div>
                          </div>
                          <div class="list-meta">
                            <span class="chip">${agent.class === "business_agent" ? "business" : "engineering"}</span>
                          </div>
                        </div>
                      `,
                    )
              }
            </div>
          </section>

          <section class="card" style="margin-top: 18px;">
            <div class="card-title">Chairman Rail</div>
            <div class="card-sub">Escalation and authority view.</div>
            <div class="callout ${props.execApprovalQueue.length > 0 ? "warn" : ""}" style="margin-top: 12px;">
              ${
                props.execApprovalQueue.length > 0
                  ? `${props.execApprovalQueue.length} decision(s) can be escalated to the Chairman.`
                  : "No pending authority items right now."
              }
            </div>
            <div class="row" style="margin-top: 14px;">
              <button class="btn" @click=${props.onOpenPraetorium}>Inspect Praetorium</button>
              <button class="btn" @click=${props.onRefresh}>Refresh</button>
            </div>
          </section>
        </aside>
      </section>
    </section>
  `;
}

function renderDecisionCard(entry: ExecApprovalRequest) {
  return html`
    <article class="forum-decision-card">
      <div class="forum-decision-card__header">
        <div>
          <div class="forum-decision-card__title">${entry.request.ask ?? "Authority request"}</div>
          <div class="forum-decision-card__meta">
            ${entry.request.agentId ?? "system"} · expires
            ${new Date(entry.expiresAtMs).toLocaleTimeString()}
          </div>
        </div>
        <span class="chip">pending</span>
      </div>
      <div class="forum-decision-card__body mono">${entry.request.command}</div>
      ${
        entry.request.cwd
          ? html`<div class="muted" style="margin-top: 10px;">cwd: ${entry.request.cwd}</div>`
          : nothing
      }
    </article>
  `;
}
