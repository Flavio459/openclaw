import { html } from "lit";
import type { EventLogEntry } from "../app-events.ts";
import type { CollegiumDomainSnapshotSource } from "../collegium-domain.snapshot.ts";
import type { ExecApprovalRequest } from "../controllers/exec-approval.ts";
import type { GatewayHelloOk } from "../gateway.ts";
import type { AgentsListResult, CronJob } from "../types.ts";
import {
  COLLEGIUM_BRAND_NAME,
  COLLEGIUM_PRAETORIUM_NAME,
  buildDevCockpitState,
  buildIntentDisambiguation,
  buildPraetoriumBlockers,
  groupAgentsByClass,
} from "../collegium.ts";

export type PraetoriumProps = {
  connected: boolean;
  lastError: string | null;
  gatewayUrl: string;
  hello: GatewayHelloOk | null;
  agentsList: AgentsListResult | null;
  eventLog: EventLogEntry[];
  execApprovalQueue: ExecApprovalRequest[];
  cronJobs: CronJob[];
  domainSnapshotSourceKind: CollegiumDomainSnapshotSource["kind"];
  domainSnapshotRaw: string;
  onRefresh: () => void;
  onOpenCommand: () => void;
  onReloadDomainSnapshot: () => void;
  onSaveDomainSnapshot: (raw: string) => void;
  onResetDomainSnapshot: () => void;
};

export function renderPraetorium(props: PraetoriumProps) {
  const cockpit = buildDevCockpitState({
    connected: props.connected,
    lastError: props.lastError,
    gatewayUrl: props.gatewayUrl,
    hello: props.hello,
    eventLog: props.eventLog,
    agentsList: props.agentsList,
    execApprovalQueue: props.execApprovalQueue,
    cronJobs: props.cronJobs,
  });
  const blockers = buildPraetoriumBlockers(
    props.lastError,
    props.execApprovalQueue,
    props.cronJobs,
    cockpit.recent_events,
  );
  const ambiguity = buildIntentDisambiguation(cockpit.recent_events);
  const agents = groupAgentsByClass(props.agentsList);

  return html`
    <section class="collegium-shell">
      <section class="collegium-hero collegium-hero--praetorium">
        <div class="collegium-hero__main">
          <div class="collegium-kicker">${COLLEGIUM_PRAETORIUM_NAME}</div>
          <h2>Development Command Room</h2>
          <p class="collegium-lead">
            Supervisão viva do que o motor está fazendo agora. Este cockpit existe para reduzir
            incerteza, expor bloqueios e mostrar evidência real do que está acontecendo.
          </p>
          <div class="chip-row">
            <span class="chip">${COLLEGIUM_BRAND_NAME}</span>
            <span class="chip">${cockpit.runtime_name}</span>
            <span class="chip">${cockpit.environment}</span>
            <span class="chip">${cockpit.current_scope}</span>
          </div>
          <div class="row" style="margin-top: 18px; gap: 10px;">
            <button class="btn primary" @click=${props.onRefresh}>Refresh telemetry</button>
            <button class="btn" @click=${props.onOpenCommand}>Back to Command</button>
          </div>
        </div>
        <div class="collegium-hero__rail">
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Status</div>
            <div class="collegium-status-card__value ${statusTone(cockpit.status)}">
              ${cockpit.status}
            </div>
            <div class="muted">Current scope: ${cockpit.current_scope}</div>
          </div>
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Active Agent</div>
            <div class="collegium-status-card__value">
              ${cockpit.active_agent?.name ?? "System"}
            </div>
            <div class="muted">${cockpit.active_agent?.current_task ?? "No active task detected."}</div>
          </div>
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Queue</div>
            <div class="collegium-status-card__value">
              ${cockpit.queue_counts.in_progress}/${cockpit.queue_counts.pending}/${cockpit.queue_counts.blocked}
            </div>
            <div class="muted">in progress / pending / blocked</div>
          </div>
        </div>
      </section>

      <section class="praetorium-grid">
        <section class="card praetorium-panel">
          <div class="card-title">Agent Map</div>
          <div class="card-sub">Who belongs to the business lattice and who belongs to engineering.</div>
          <div class="list" style="margin-top: 12px;">
            ${
              agents.length === 0
                ? html`
                    <div class="muted">No agents loaded.</div>
                  `
                : agents.map(
                    (agent) => html`
                      <div class="list-item">
                        <div class="list-main">
                          <div class="list-title">${agent.displayName}</div>
                          <div class="list-sub">${agent.id}</div>
                        </div>
                        <div class="list-meta">
                          <span class="chip">${agent.class}</span>
                        </div>
                      </div>
                    `,
                  )
            }
          </div>
        </section>

        <section class="card praetorium-panel praetorium-panel--timeline">
          <div class="card-title">Live Timeline</div>
          <div class="card-sub">Recent runtime events mapped into a readable operational stream.</div>
          <div class="praetorium-timeline">
            ${
              cockpit.recent_events.length === 0
                ? html`
                    <div class="muted">No runtime events available yet.</div>
                  `
                : cockpit.recent_events.map(
                    (entry) => html`
                      <article class="praetorium-event">
                        <div class="praetorium-event__time">${new Date(entry.timestamp).toLocaleTimeString()}</div>
                        <div class="praetorium-event__body">
                          <div class="praetorium-event__title">${entry.title}</div>
                          <div class="praetorium-event__meta">
                            <span class="chip">${entry.scope}</span>
                            <span class="chip">${entry.actor_name}</span>
                            <span class="chip">${entry.surface}</span>
                          </div>
                          <div class="muted">${entry.summary}</div>
                        </div>
                      </article>
                    `,
                  )
            }
          </div>
        </section>

        <section class="card praetorium-panel">
          <div class="card-title">Blockers</div>
          <div class="card-sub">What is currently slowing or stopping the system.</div>
          <div class="list" style="margin-top: 12px;">
            ${
              blockers.length === 0
                ? html`
                    <div class="muted">No blockers detected in the current read.</div>
                  `
                : blockers.map(
                    (blocker) => html`
                      <div class="list-item">
                        <div class="list-main">
                          <div class="list-title">Blocking condition</div>
                          <div class="list-sub">${blocker}</div>
                        </div>
                      </div>
                    `,
                  )
            }
          </div>

          <div class="card-title" style="margin-top: 18px;">Ambiguity</div>
          <div class="card-sub">Where runtime telemetry still cannot disambiguate intent by itself.</div>
          ${
            ambiguity
              ? html`
                  <div class="callout warn" style="margin-top: 12px;">
                    <div><strong>Interpreted as:</strong> ${ambiguity.interpreted_scope}</div>
                    <div><strong>Reason:</strong> ${ambiguity.reason}</div>
                    <div><strong>Observed text:</strong> ${ambiguity.raw_request}</div>
                  </div>
                `
              : html`
                  <div class="callout" style="margin-top: 12px">
                    No ambiguous event is currently visible in the recent feed.
                  </div>
                `
          }
        </section>
      </section>

      <section class="grid grid-cols-2" style="margin-top: 18px;">
        <section class="card">
          <div class="card-title">Evidence</div>
          <div class="card-sub">Files, commands, and references emitted by the latest runtime events.</div>
          <div class="list" style="margin-top: 12px;">
            ${
              cockpit.recent_events.flatMap((entry) => entry.evidence_refs).length === 0
                ? html`
                    <div class="muted">No evidence refs available yet.</div>
                  `
                : Array.from(
                    new Set(cockpit.recent_events.flatMap((entry) => entry.evidence_refs)),
                  ).map(
                    (ref) => html`
                      <div class="list-item">
                        <div class="list-main">
                          <div class="list-title mono">${ref}</div>
                        </div>
                      </div>
                    `,
                  )
            }
          </div>
        </section>

        <section class="card">
          <div class="card-title">Decision Rail</div>
          <div class="card-sub">Authority items that are still unresolved.</div>
          <div class="list" style="margin-top: 12px;">
            ${
              props.execApprovalQueue.length === 0
                ? html`
                    <div class="muted">No pending authority request.</div>
                  `
                : props.execApprovalQueue.map(
                    (entry) => html`
                      <div class="list-item">
                        <div class="list-main">
                          <div class="list-title">${entry.request.ask ?? "Authority request"}</div>
                          <div class="list-sub mono">${entry.request.command}</div>
                        </div>
                        <div class="list-meta">
                          <div>${entry.request.agentId ?? "system"}</div>
                          <div class="muted">${new Date(entry.expiresAtMs).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    `,
                  )
            }
          </div>
        </section>
      </section>

      <section class="card" style="margin-top: 18px;">
        <div class="card-title">Domain Snapshot Console</div>
        <div class="card-sub">
          Local backstage source for Collegium domain inspection and controlled mutation before a
          real backend exists.
        </div>
        <div class="chip-row" style="margin-top: 12px;">
          <span class="chip">source: ${props.domainSnapshotSourceKind}</span>
          <span class="chip">storage: local browser</span>
          <span class="chip">stage: pre-backend</span>
        </div>
        <label class="field" style="margin-top: 16px;">
          <span>Snapshot JSON</span>
          <textarea id=${PRAETORIUM_DOMAIN_EDITOR_ID} rows="18" spellcheck="false">
${props.domainSnapshotRaw}</textarea
          >
        </label>
        <div class="row" style="margin-top: 14px; gap: 10px;">
          <button
            class="btn primary"
            @click=${() => props.onSaveDomainSnapshot(readDomainEditorValue())}
          >
            Save local snapshot
          </button>
          <button class="btn" @click=${props.onReloadDomainSnapshot}>Reload snapshot</button>
          <button class="btn" @click=${props.onResetDomainSnapshot}>Reset to fixture</button>
        </div>
      </section>
    </section>
  `;
}

const PRAETORIUM_DOMAIN_EDITOR_ID = "praetorium-domain-editor";

function readDomainEditorValue(): string {
  if (typeof document === "undefined") {
    return "";
  }
  const textarea = document.getElementById(PRAETORIUM_DOMAIN_EDITOR_ID);
  if (!(textarea instanceof HTMLTextAreaElement)) {
    return "";
  }
  return textarea.value;
}

function statusTone(status: "running" | "waiting" | "blocked" | "error") {
  if (status === "running") {
    return "ok";
  }
  if (status === "waiting") {
    return "warn";
  }
  if (status === "blocked" || status === "error") {
    return "danger";
  }
  return "";
}
