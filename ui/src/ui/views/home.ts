import { html } from "lit";
import {
  COLLEGIUM_BRAND_NAME,
  COLLEGIUM_COCKPIT_NAME,
  COLLEGIUM_COMMAND_NAME,
  COLLEGIUM_FORUM_NAME,
  COLLEGIUM_PRAETORIUM_NAME,
  COLLEGIUM_PROTOCOL_NAME,
} from "../collegium.ts";

export type HomeProps = {
  connected: boolean;
  lastError: string | null;
  presenceCount: number;
  sessionsCount: number | null;
  onOpenForum: () => void;
  onOpenPraetorium: () => void;
  onOpenCommand: () => void;
  onOpenPortalPreview: () => void;
  onOpenCockpitPreview: () => void;
  onOpenChat: () => void;
  onOpenOverview: () => void;
};

export function renderHome(props: HomeProps) {
  return html`
    <section class="collegium-shell home-shell">
      <section class="collegium-hero home-hero">
        <div class="collegium-hero__main">
          <div class="collegium-kicker">${COLLEGIUM_BRAND_NAME}</div>
          <h2>Comece pela intenção, não pelo nome da sala.</h2>
          <p class="collegium-lead">
            A aplicação estava expondo a topologia interna cedo demais. Comece aqui, escolha o que
            quer fazer e entre na superfície certa sem adivinhar se a sala é estratégica,
            operacional ou apenas uma continuação de conversa.
          </p>
          <div class="chip-row">
            <span class="chip">${COLLEGIUM_PROTOCOL_NAME}</span>
            <span class="chip">${props.connected ? "runtime conectado" : "runtime precisa de atenção"}</span>
            <span class="chip">${props.sessionsCount ?? "n/d"} sessões</span>
            <span class="chip">${props.presenceCount} sinal(is) de presença ativo(s)</span>
          </div>
        </div>

        <div class="collegium-hero__rail">
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Por onde começar</div>
            <div class="collegium-status-card__value ${props.connected ? "ok" : "warn"}">
              ${props.connected ? "Escolha uma superfície de trabalho" : "Corrija o acesso primeiro"}
            </div>
            <div class="muted">
              ${props.connected
                ? "Use Fórum, Praetorium ou Command conforme a intenção. A Sala Viva não é mais o ponto de entrada."
                : props.lastError ?? "O runtime está offline ou sem autenticação."}
            </div>
          </div>
          <div class="collegium-status-card">
            <div class="collegium-status-card__label">Sala Viva agora significa</div>
            <div class="collegium-status-card__value">Continuação</div>
            <div class="muted">
              Entre primeiro em uma sala viva a partir de uma superfície. Depois use Sala Viva para
              continuar esse fio.
            </div>
          </div>
        </div>
      </section>

      <section class="home-grid">
        ${renderHomeCard({
          eyebrow: "Discutir e decidir",
          title: COLLEGIUM_FORUM_NAME,
          description:
            "Use quando precisar comparar opções, enquadrar um caso de projeto, discutir tradeoffs ou decidir o próximo passo.",
          cta: "Abrir The Forum",
          onClick: props.onOpenForum,
          priority: true,
        })}
        ${renderHomeCard({
          eyebrow: "Acompanhar trabalho ativo",
          title: COLLEGIUM_PRAETORIUM_NAME,
          description:
            "Use quando precisar de bloqueios, repasses, evidências do runtime e da trilha atual de execução em um só lugar.",
          cta: "Abrir Praetorium",
          onClick: props.onOpenPraetorium,
        })}
        ${renderHomeCard({
          eyebrow: "Ver prioridade máxima",
          title: COLLEGIUM_COMMAND_NAME,
          description:
            "Use quando precisar da leitura executiva, do workstream dominante e da tensão institucional atual.",
          cta: "Abrir Cortex Command",
          onClick: props.onOpenCommand,
        })}
        ${renderHomeCard({
          eyebrow: "Revisar superfície do portal",
          title: "Prévia do Portal",
          description:
            "Use quando quiser inspecionar o primeiro bloco do portal e discutir mensagem ou hierarquia de leitura antes de qualquer exposição pública.",
          cta: "Abrir Prévia do Portal",
          onClick: props.onOpenPortalPreview,
        })}
        ${renderHomeCard({
          eyebrow: "Revisar superfície do piloto",
          title: COLLEGIUM_COCKPIT_NAME,
          description:
            "Use quando quiser inspecionar a superfície de produto voltada ao piloto sem confundi-la com Praetorium.",
          cta: "Abrir The Cockpit",
          onClick: props.onOpenCockpitPreview,
        })}
        ${renderHomeCard({
          eyebrow: "Continuar uma sala",
          title: "Sala Viva",
          description:
            "Use só depois de entrar por Fórum, Praetorium, Portal ou Cockpit. Este é o fio de continuação, não o ponto de partida.",
          cta: "Abrir Sala Viva",
          onClick: props.onOpenChat,
        })}
      </section>

      <section class="home-flow">
        <div class="card">
          <div class="card-title">Como o fluxo funciona agora</div>
          <div class="list" style="margin-top: 14px;">
            <div class="list-item">
              <div class="list-main">
                <div class="list-title">1. Decida em ${COLLEGIUM_FORUM_NAME}</div>
                <div class="list-sub">Discuta direção do projeto, opções e riscos.</div>
              </div>
            </div>
            <div class="list-item">
              <div class="list-main">
                <div class="list-title">2. Trabalhe em ${COLLEGIUM_PRAETORIUM_NAME}</div>
                <div class="list-sub">Acompanhe bloqueios, repasses e evidência operacional.</div>
              </div>
            </div>
            <div class="list-item">
              <div class="list-main">
                <div class="list-title">3. Monitore em ${COLLEGIUM_COMMAND_NAME}</div>
                <div class="list-sub">Veja prioridade executiva e dominância de workstream.</div>
              </div>
            </div>
            <div class="list-item">
              <div class="list-main">
                <div class="list-title">4. Continue na Sala Viva</div>
                <div class="list-sub">Só depois que uma superfície abrir a sala correta.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Acesso e recuperação</div>
          <div class="card-sub">
            Se o runtime estiver offline, sem autenticação ou confuso, vá primeiro para Visão Geral.
          </div>
          <div class="callout" style="margin-top: 14px;">
            <div class="card-title">${props.connected ? "O runtime parece disponível" : "O runtime precisa de atenção"}</div>
            <div class="muted">
              ${props.connected
                ? "Visão Geral serve para acesso e checagem de saúde, não como ponto normal de entrada."
                : props.lastError ?? "Use Visão Geral para reconectar, validar token ou inspecionar a saúde."}
            </div>
          </div>
          <div class="row" style="margin-top: 14px;">
            <button class="btn" @click=${props.onOpenOverview}>Abrir Visão Geral</button>
          </div>
        </div>
      </section>
    </section>
  `;
}

type HomeCardArgs = {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
  priority?: boolean;
};

function renderHomeCard(args: HomeCardArgs) {
  return html`
    <article class="card home-card ${args.priority ? "home-card--priority" : ""}">
      <div class="home-card__eyebrow">${args.eyebrow}</div>
      <div class="card-title">${args.title}</div>
      <div class="card-sub">${args.description}</div>
      <div class="home-card__actions">
        <button class=${`btn${args.priority ? " primary" : ""}`} @click=${args.onClick}>
          ${args.cta}
        </button>
      </div>
    </article>
  `;
}
