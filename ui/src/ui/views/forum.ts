import { html } from "lit";
import { COLLEGIUM_FORUM_NAME, COLLEGIUM_PROTOCOL_NAME } from "../collegium.ts";
import type { ForumEvidenceItem, ForumViewModel } from "../collegium/forum.contract.ts";

export type ForumProps = {
  viewModel: ForumViewModel;
  discussionRoom: {
    sessionKey: string;
    label: string;
    status: string;
    note: string;
  };
  onRefresh: () => void;
  onOpenPraetorium: () => void;
  onOpenDiscussion: () => void;
  onSendBrief: () => void;
};

export function renderForum(props: ForumProps) {
  const { viewModel } = props;

  return html`
    <section class="collegium-shell">
      <section class="collegium-hero collegium-hero--forum">
        <div class="collegium-hero__main">
          <div class="collegium-kicker">${COLLEGIUM_FORUM_NAME}</div>
          <h2>Sala Deliberativa</h2>
          <p class="collegium-lead">
            A sala organiza caso, evidência, opções, risco, caminho recomendado e ação do
            Chairman sem colapsar conflito de mandato em narrativa bonita.
          </p>
          <div class="chip-row">
            <span class="chip">${COLLEGIUM_PROTOCOL_NAME}</span>
            <span class="chip">${formatAction(viewModel.chairmanAction.action)}</span>
            <span class="chip">${viewModel.participants.length} participante(s)</span>
          </div>
          <div class="callout" style="margin-top: 18px;">
            <div class="card-title">${viewModel.topic}</div>
            <div class="muted">${viewModel.context}</div>
          </div>
          <div class="callout" style="margin-top: 12px;">
            <div class="card-title">Caminho recomendado</div>
            <div class="muted">${viewModel.recommendedPath.rationale}</div>
          </div>
          <div class="callout" style="margin-top: 12px;">
            <div class="card-title">${props.discussionRoom.label}</div>
            <div class="muted">${props.discussionRoom.status}</div>
            <div class="muted mono" style="margin-top: 6px;">${props.discussionRoom.sessionKey}</div>
            <div class="muted" style="margin-top: 6px;">${props.discussionRoom.note}</div>
          </div>
          <div class="row" style="margin-top: 18px; gap: 10px;">
            <button class="btn btn-primary" @click=${props.onOpenDiscussion}>
              Continuar Sala Viva
            </button>
            <button class="btn" @click=${props.onSendBrief}>Enviar Brief Deliberativo</button>
            <button class="btn" @click=${props.onOpenPraetorium}>Inspecionar Praetorium</button>
            <button class="btn" @click=${props.onRefresh}>Atualizar</button>
          </div>
        </div>

        <div class="collegium-hero__rail">
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Ação para o Chairman</div>
            <div class="collegium-status-card__value">
              ${formatAction(viewModel.chairmanAction.action)}
            </div>
            <div class="muted">${viewModel.chairmanAction.reason}</div>
          </div>
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Trilha de Evidências</div>
            <div class="collegium-status-card__value">${viewModel.evidence.length}</div>
            <div class="muted">
              ${viewModel.recommendedPath.evidenceIds.length} vínculo(s) de evidência sustentam a
              recomendação.
            </div>
          </div>
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Rastro Decisório</div>
            <div class="collegium-status-card__value">${viewModel.decisionTrace.length}</div>
            <div class="muted">${viewModel.risks.length} risco(s) ativo(s) na sala.</div>
          </div>
        </div>
      </section>

      <section class="forum-layout">
        <div class="forum-main">
          <section class="card">
            <div class="card-title">Deliberação Atual</div>
            <div class="card-sub">A sala só avança o que pode ser defendido por evidência.</div>
            <div class="callout" style="margin-top: 14px;">
              <div class="card-title">${viewModel.topic}</div>
              <div class="muted">${viewModel.context}</div>
            </div>
            <div class="list" style="margin-top: 14px;">
              ${viewModel.options.map(
                (option) => html`
                  <div class="list-item">
                    <div class="list-main">
                      <div class="list-title">${option.label}</div>
                      <div class="list-sub">${option.consequence}</div>
                    </div>
                    <div class="list-meta mono">${option.id}</div>
                  </div>
                `,
              )}
            </div>
          </section>

          <section class="card" style="margin-top: 18px;">
            <div class="card-title">Evidências</div>
            <div class="card-sub">Aprovações, eventos, bloqueios, ambiguidade e prova de runtime.</div>
            <div class="list" style="margin-top: 12px;">
              ${viewModel.evidence.length === 0
                ? html`<div class="muted">Nenhuma evidência visível na sala ainda.</div>`
                : viewModel.evidence.map((entry) => renderEvidence(entry))}
            </div>
          </section>
        </div>

        <aside class="forum-rail">
          <section class="card">
            <div class="card-title">Sala Viva de Discussão</div>
            <div class="card-sub">
              Use a sala para enquadrar o caso e depois continuar a discussão real do projeto em um
              fio vivo, em vez de parar em um resumo somente leitura.
            </div>
            <div class="callout" style="margin-top: 14px;">
              <div class="card-title">${props.discussionRoom.status}</div>
              <div class="muted">${props.discussionRoom.note}</div>
              <div class="muted mono" style="margin-top: 6px;">${props.discussionRoom.sessionKey}</div>
            </div>
            <div class="row" style="margin-top: 14px; gap: 10px;">
              <button class="btn btn-primary" @click=${props.onOpenDiscussion}>
                Abrir Sala Viva
              </button>
              <button class="btn" @click=${props.onSendBrief}>Semear Sala com o Caso Atual</button>
            </div>
          </section>

          <section class="card" style="margin-top: 18px;">
            <div class="card-title">Participantes</div>
            <div class="card-sub">Titulares de mandato e colaboradores visíveis neste caso.</div>
            <div class="list" style="margin-top: 12px;">
              ${viewModel.participants.map(
                (participant) => html`
                  <div class="list-item">
                    <div class="list-main">
                      <div class="list-title">${participant}</div>
                    </div>
                  </div>
                `,
              )}
            </div>
          </section>

          <section class="card" style="margin-top: 18px;">
            <div class="card-title">Riscos</div>
            <div class="card-sub">Nada escondido atrás de um consenso vago.</div>
            <div class="list" style="margin-top: 12px;">
              ${viewModel.risks.length === 0
                ? html`<div class="muted">Nenhum risco ativo aberto agora.</div>`
                : viewModel.risks.map(
                    (risk) => html`
                      <div class="list-item">
                        <div class="list-main">
                          <div class="list-title">${risk}</div>
                        </div>
                      </div>
                    `,
                  )}
            </div>
          </section>

          <section class="card" style="margin-top: 18px;">
            <div class="card-title">Rastro Decisório</div>
            <div class="card-sub">Recomendação, mandato e escalonamento permanecem explícitos.</div>
            <div class="list" style="margin-top: 12px;">
              ${viewModel.decisionTrace.map(
                (trace) => html`
                  <div class="list-item">
                    <div class="list-main">
                      <div class="list-title">${trace.agentRole} · ${trace.mandate}</div>
                      <div class="list-sub">${trace.summary}</div>
                    </div>
                    <div class="list-meta mono">${trace.traceId}</div>
                  </div>
                  <div class="muted" style="margin: -4px 0 10px 0;">
                    status: ${trace.status} · próximo: ${trace.nextResponsible} · consultados:
                    ${trace.consulted.length > 0 ? trace.consulted.join(", ") : "nenhum"} · hitl:
                    ${trace.hitlRequired ? "obrigatório" : "não obrigatório"} · escalonamento:
                    ${trace.escalationReasons.length > 0
                      ? trace.escalationReasons.join(", ")
                      : "nenhum"}
                  </div>
                  <div class="muted" style="margin: -6px 0 10px 0;">rationale: ${trace.rationale}</div>
                `,
              )}
            </div>
          </section>
        </aside>
      </section>
    </section>
  `;
}

function renderEvidence(entry: ForumEvidenceItem) {
  return html`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${entry.summary}</div>
        <div class="list-sub">${entry.source}</div>
      </div>
      <div class="list-meta">
        <span class="chip">${entry.kind}</span>
        <span class="chip">${entry.severity}</span>
      </div>
    </div>
  `;
}

function formatAction(action: ForumViewModel["chairmanAction"]["action"]) {
  if (action === "approve") {
    return "Aprovar";
  }
  if (action === "defer") {
    return "Adiar";
  }
  return "Escalonar";
}
