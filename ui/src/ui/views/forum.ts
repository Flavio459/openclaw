import { html, nothing } from "lit";
import type { EventLogEntry } from "../app-events.ts";
import type { DeliberationCase, ForumDomainProjection } from "../collegium-domain.ts";
import type { ExecApprovalRequest } from "../controllers/exec-approval.ts";
import type { GatewayHelloOk } from "../gateway.ts";
import type { AgentsListResult } from "../types.ts";
import {
  COLLEGIUM_FORUM_NAME,
  COLLEGIUM_PROTOCOL_NAME,
  buildDevEvents,
  groupAgentsByClass,
  type RuntimeEnvironment,
} from "../collegium.ts";

export type ForumProps = {
  gatewayUrl: string;
  hello: GatewayHelloOk | null;
  environment: RuntimeEnvironment;
  agentsList: AgentsListResult | null;
  eventLog: EventLogEntry[];
  execApprovalQueue: ExecApprovalRequest[];
  domainProjection: ForumDomainProjection;
  onRefresh: () => void;
  onOpenPraetorium: () => void;
};

export function renderForum(props: ForumProps) {
  const agents = groupAgentsByClass(props.agentsList);
  const events = buildDevEvents(props.eventLog, props.gatewayUrl, props.hello, props.agentsList);
  const strategicEvents = events
    .filter((entry) => entry.surface === "the_forum" || entry.scope === "product")
    .slice(0, 6);
  const strategicTraceCount =
    props.domainProjection.strategicHighlights.length + strategicEvents.length;

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
            <div class="collegium-status-card__value">${props.domainProjection.deliberationQueue.length}</div>
            <div class="muted">Institutional cases currently visible in the protocol queue.</div>
          </div>
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Strategic Traces</div>
            <div class="collegium-status-card__value">${strategicTraceCount}</div>
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
            <div class="card-title">Lead Case</div>
            <div class="card-sub">
              Estrutura deliberativa principal da sala: topic, context, evidence, options, risks and chairman action.
            </div>
            ${
              props.domainProjection.leadCase
                ? html`
                    <div class="forum-lead-case">
                      <div class="forum-lead-case__section">
                        <div class="forum-lead-case__label">Topic</div>
                        <div class="forum-lead-case__value">${props.domainProjection.leadCase.topic}</div>
                      </div>
                      <div class="forum-lead-case__section">
                        <div class="forum-lead-case__label">Context</div>
                        <div class="forum-lead-case__value">${props.domainProjection.leadCase.context}</div>
                      </div>
                      <div class="forum-lead-case__grid">
                        ${renderLeadCaseList("Participants", props.domainProjection.leadCase.participants)}
                        ${renderLeadCaseList("Evidence", props.domainProjection.leadCase.evidence)}
                        ${renderLeadCaseList("Options", props.domainProjection.leadCase.options)}
                        ${renderLeadCaseList("Risks", props.domainProjection.leadCase.risks)}
                      </div>
                      <div class="forum-lead-case__section">
                        <div class="forum-lead-case__label">Recommended Path</div>
                        <div class="forum-lead-case__value">
                          ${props.domainProjection.leadCase.recommendedPath}
                        </div>
                      </div>
                      <div class="forum-lead-case__section">
                        <div class="forum-lead-case__label">Chairman Action</div>
                        <div class="forum-lead-case__value mono">
                          ${props.domainProjection.leadCase.chairmanAction}
                        </div>
                      </div>
                      <div class="forum-lead-case__grid">
                        <div class="forum-lead-case__section">
                          <div class="forum-lead-case__label">Authority State</div>
                          <div class="forum-lead-case__value mono">
                            ${props.domainProjection.leadCase.authorityState}
                          </div>
                        </div>
                        <div class="forum-lead-case__section">
                          <div class="forum-lead-case__label">Urgency</div>
                          <div class="forum-lead-case__value mono">
                            ${props.domainProjection.leadCase.urgency}
                          </div>
                        </div>
                      </div>
                      <div class="forum-lead-case__grid">
                        <div class="forum-lead-case__section">
                          <div class="forum-lead-case__label">Protected U.P.</div>
                          <div class="forum-lead-case__value mono">
                            ${props.domainProjection.leadCase.economicImpact.protectedProductionUnits}
                          </div>
                        </div>
                        <div class="forum-lead-case__section">
                          <div class="forum-lead-case__label">Contested U.P.</div>
                          <div class="forum-lead-case__value mono">
                            ${props.domainProjection.leadCase.economicImpact.contestedProductionUnits}
                          </div>
                        </div>
                        <div class="forum-lead-case__section">
                          <div class="forum-lead-case__label">Projected Exposure</div>
                          <div class="forum-lead-case__value mono">
                            ${props.domainProjection.leadCase.economicImpact.projectedExposure}
                          </div>
                        </div>
                        <div class="forum-lead-case__section">
                          <div class="forum-lead-case__label">Economic Authority</div>
                          <div class="forum-lead-case__value mono">
                            ${props.domainProjection.leadCase.economicImpact.authorityState}
                          </div>
                        </div>
                      </div>
                      <div class="forum-lead-case__section">
                        <div class="forum-lead-case__label">Decision Panel</div>
                        <div class="list" style="margin-top: 8px;">
                          ${props.domainProjection.leadCase.decisionPanel.map(
                            (item) => html`
                              <div class="list-item">
                                <div class="list-main">
                                  <div class="list-title">${item.label}</div>
                                  <div class="list-sub">${item.rationale}</div>
                                </div>
                                <div class="list-meta mono">${item.action}</div>
                              </div>
                            `,
                          )}
                        </div>
                      </div>
                      <div class="forum-lead-case__section">
                        <div class="forum-lead-case__label">Evidence Trail</div>
                        <div class="list" style="margin-top: 8px;">
                          ${props.domainProjection.leadCase.evidenceTrail.map(
                            (item) => html`
                              <div class="list-item">
                                <div class="list-main">
                                  <div class="list-title">${item.entityRef}</div>
                                  <div class="list-sub">${item.summary}</div>
                                  <div class="muted">${item.evidenceRefs.join(", ") || "no direct refs"}</div>
                                </div>
                                <div class="list-meta mono">${item.role}</div>
                              </div>
                            `,
                          )}
                        </div>
                      </div>
                    </div>
                  `
                : html`
                    <div class="callout" style="margin-top: 14px;">
                      No lead case is available in the current institutional queue.
                    </div>
                  `
            }
          </section>

          <section class="card">
            <div class="card-title">Current Agenda</div>
            <div class="card-sub">What the room can act on right now without guessing.</div>
            <div class="forum-agenda-list">
              ${
                props.domainProjection.deliberationQueue.length === 0 &&
                props.execApprovalQueue.length === 0
                  ? html`
                      <div class="callout" style="margin-top: 14px">
                        No authority request is waiting. The room is clear for proactive strategy work.
                      </div>
                    `
                  : html`
                      ${props.domainProjection.deliberationQueue.map((entry) => renderDeliberationCard(entry))}
                      ${
                        props.execApprovalQueue.length > 0
                          ? html`
                              <div class="callout warn" style="margin-top: 14px;">
                                <strong>Operational authority rail</strong><br />
                                Runtime approvals remain visible here as execution authority, below the institutional agenda.
                              </div>
                              ${props.execApprovalQueue.map((entry) => renderDecisionCard(entry))}
                            `
                          : nothing
                      }
                    `
              }
            </div>
          </section>

          <section class="card" style="margin-top: 18px;">
            <div class="card-title">Context Stream</div>
            <div class="card-sub">Recent events that matter to strategy, risk, or authority.</div>
            <div class="list" style="margin-top: 12px;">
              ${
                props.domainProjection.strategicHighlights.length === 0 &&
                strategicEvents.length === 0
                  ? html`
                      <div class="muted">No strategic traces visible yet.</div>
                    `
                  : html`
                      ${props.domainProjection.strategicHighlights.map(
                        (entry) => html`
                          <div class="list-item">
                            <div class="list-main">
                              <div class="list-title">${entry.title}</div>
                              <div class="list-sub">${entry.summary}</div>
                            </div>
                            <div class="list-meta">
                              <div class="mono">${entry.riskLevel}</div>
                              <div class="muted">${entry.linkedEntityRefs.join(" · ")}</div>
                            </div>
                          </div>
                        `,
                      )}
                      ${strategicEvents.map(
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
                      )}
                    `
              }
            </div>
          </section>
        </div>

        <aside class="forum-rail">
          <section class="card">
            <div class="card-title">Risk Lattice</div>
            <div class="card-sub">
              Participantes e eventos que sustentam a pauta institucional desta sala.
            </div>
            <div class="list" style="margin-top: 12px;">
              ${
                props.domainProjection.riskLattice.length === 0
                  ? html`<div class="muted">No governed risk signal is visible.</div>`
                  : props.domainProjection.riskLattice.map(
                      (entry) => html`
                        <div class="list-item">
                          <div class="list-main">
                            <div class="list-title">${entry.title}</div>
                            <div class="list-sub">${entry.summary}</div>
                          </div>
                          <div class="list-meta">
                            <div class="mono">${entry.kind}</div>
                            <div class="muted">${entry.status}</div>
                          </div>
                        </div>
                      `,
                    )
              }
            </div>
          </section>

          <section class="card">
            <div class="card-title">Participants</div>
            <div class="card-sub">Digital collaborators currently defined in the system.</div>
            <div class="list" style="margin-top: 12px;">
              ${
                agents.length === 0
                  ? html`
                      <div class="muted">No collaborators loaded.</div>
                    `
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
            <div class="card-title">Protocol Provenance</div>
            <div class="card-sub">Current source of institutional domain data.</div>
            <div class="callout" style="margin-top: 12px;">
              ${props.domainProjection.provenance}. Este slice ainda é modelado por fixture_projection, não por backend vivo.
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

function renderDeliberationCard(entry: DeliberationCase) {
  return html`
    <article class="forum-decision-card">
      <div class="forum-decision-card__header">
        <div>
          <div class="forum-decision-card__title">${entry.title}</div>
          <div class="forum-decision-card__meta">
            ${entry.status} · ${entry.riskLevel} risk
          </div>
        </div>
        <span class="chip">${entry.chairmanActionRequired ? "chairman" : "review"}</span>
      </div>
      <div class="forum-decision-card__body">${entry.summary}</div>
      <div class="muted" style="margin-top: 10px;">Recommended path: ${entry.recommendedPath}</div>
      <div class="muted" style="margin-top: 6px;">
        options: ${entry.options.length} · evidence: ${entry.evidenceRefs.length}
      </div>
      <div class="muted" style="margin-top: 6px;">
        chairman lane: ${entry.chairmanActionRequired ? "approve or reject" : "review or defer"} ·
        urgency: ${entry.riskLevel === "high" ? "immediate" : entry.riskLevel === "medium" ? "priority" : "monitor"}
      </div>
      <div class="muted" style="margin-top: 6px;">
        refs: ${[
          ...entry.linkedPilotIds.map((id) => `pilot:${id}`),
          ...entry.linkedMobilityEventIds.map((id) => `mobility:${id}`),
        ].join(" · ")}
      </div>
    </article>
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

function renderLeadCaseList(label: string, items: string[]) {
  return html`
    <div class="forum-lead-case__section">
      <div class="forum-lead-case__label">${label}</div>
      ${
        items.length === 0
          ? html`<div class="muted">None</div>`
          : html`
              <div class="list" style="margin-top: 8px;">
                ${items.map(
                  (item) => html`
                    <div class="list-item">
                      <div class="list-main">
                        <div class="list-title">${item}</div>
                      </div>
                    </div>
                  `,
                )}
              </div>
            `
      }
    </div>
  `;
}
