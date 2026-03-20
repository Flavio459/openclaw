import type { IconName } from "./icons.js";

export const TAB_GROUPS = [
  {
    label: "Comece Aqui",
    tabs: ["home"],
  },
  {
    label: "Superfícies Centrais",
    tabs: ["command", "forum", "praetorium"],
  },
  { label: "Salas em Andamento", tabs: ["chat"] },
  {
    label: "Pré-visualizações Internas",
    tabs: ["portal-preview", "cockpit-preview"],
  },
  {
    label: "Runtime e Acesso",
    tabs: ["overview", "channels", "instances", "sessions", "usage", "cron"],
  },
  { label: "Operação de Agentes", tabs: ["agents", "skills", "nodes"] },
  { label: "Sistema", tabs: ["config", "debug", "logs"] },
] as const;

export type Tab =
  | "home"
  | "command"
  | "forum"
  | "praetorium"
  | "portal-preview"
  | "cockpit-preview"
  | "agents"
  | "overview"
  | "channels"
  | "instances"
  | "sessions"
  | "usage"
  | "cron"
  | "skills"
  | "nodes"
  | "chat"
  | "config"
  | "debug"
  | "logs";

const TAB_PATHS: Record<Tab, string> = {
  home: "/",
  command: "/command",
  forum: "/command/forum",
  praetorium: "/praetorium",
  "portal-preview": "/portal-preview",
  "cockpit-preview": "/cockpit-preview",
  agents: "/agents",
  overview: "/overview",
  channels: "/channels",
  instances: "/instances",
  sessions: "/sessions",
  usage: "/usage",
  cron: "/cron",
  skills: "/skills",
  nodes: "/nodes",
  chat: "/chat",
  config: "/config",
  debug: "/debug",
  logs: "/logs",
};

const PATH_TO_TAB = new Map(Object.entries(TAB_PATHS).map(([tab, path]) => [path, tab as Tab]));

export function normalizeBasePath(basePath: string): string {
  if (!basePath) {
    return "";
  }
  let base = basePath.trim();
  if (!base.startsWith("/")) {
    base = `/${base}`;
  }
  if (base === "/") {
    return "";
  }
  if (base.endsWith("/")) {
    base = base.slice(0, -1);
  }
  return base;
}

export function normalizePath(path: string): string {
  if (!path) {
    return "/";
  }
  let normalized = path.trim();
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

export function pathForTab(tab: Tab, basePath = ""): string {
  const base = normalizeBasePath(basePath);
  const path = TAB_PATHS[tab];
  return base ? `${base}${path}` : path;
}

export function tabFromPath(pathname: string, basePath = ""): Tab | null {
  const base = normalizeBasePath(basePath);
  let path = pathname || "/";
  if (base) {
    if (path === base) {
      path = "/";
    } else if (path.startsWith(`${base}/`)) {
      path = path.slice(base.length);
    }
  }
  let normalized = normalizePath(path).toLowerCase();
  if (normalized.endsWith("/index.html")) {
    normalized = "/";
  }
  if (normalized === "/") {
    return "home";
  }
  return PATH_TO_TAB.get(normalized) ?? null;
}

export function inferBasePathFromPathname(pathname: string): string {
  let normalized = normalizePath(pathname);
  if (normalized.endsWith("/index.html")) {
    normalized = normalizePath(normalized.slice(0, -"/index.html".length));
  }
  if (normalized === "/") {
    return "";
  }
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length === 0) {
    return "";
  }
  for (let i = 0; i < segments.length; i++) {
    const candidate = `/${segments.slice(i).join("/")}`.toLowerCase();
    if (PATH_TO_TAB.has(candidate)) {
      const prefix = segments.slice(0, i);
      return prefix.length ? `/${prefix.join("/")}` : "";
    }
  }
  return `/${segments.join("/")}`;
}

export function iconForTab(tab: Tab): IconName {
  switch (tab) {
    case "home":
      return "globe";
    case "command":
      return "brain";
    case "forum":
      return "book";
    case "praetorium":
      return "puzzle";
    case "portal-preview":
      return "monitor";
    case "cockpit-preview":
      return "smartphone";
    case "agents":
      return "folder";
    case "chat":
      return "messageSquare";
    case "overview":
      return "barChart";
    case "channels":
      return "link";
    case "instances":
      return "radio";
    case "sessions":
      return "fileText";
    case "usage":
      return "barChart";
    case "cron":
      return "loader";
    case "skills":
      return "zap";
    case "nodes":
      return "monitor";
    case "config":
      return "settings";
    case "debug":
      return "bug";
    case "logs":
      return "scrollText";
    default:
      return "folder";
  }
}

export function titleForTab(tab: Tab) {
  switch (tab) {
    case "home":
      return "Comece Aqui";
    case "command":
      return "Cortex Command";
    case "forum":
      return "The Forum";
    case "praetorium":
      return "Cortex Praetorium";
    case "portal-preview":
      return "Prévia do Portal";
    case "cockpit-preview":
      return "The Cockpit";
    case "agents":
      return "Agentes";
    case "overview":
      return "Visão Geral";
    case "channels":
      return "Canais";
    case "instances":
      return "Instâncias";
    case "sessions":
      return "Sessões";
    case "usage":
      return "Uso";
    case "cron":
      return "Rotinas Cron";
    case "skills":
      return "Habilidades";
    case "nodes":
      return "Nós";
    case "chat":
      return "Sala Viva";
    case "config":
      return "Configuração";
    case "debug":
      return "Depuração";
    case "logs":
      return "Logs";
    default:
      return "Controle";
  }
}

export function subtitleForTab(tab: Tab) {
  switch (tab) {
    case "home":
      return "Comece pela intenção e entre na superfície correta do Collegium sem adivinhar nomes de sala.";
    case "command":
      return "Superfície executiva do Collegium Cortex, The CORE e The Pilots.";
    case "forum":
      return "Sala estratégica para deliberação, incidentes, finanças e decisões do Chairman.";
    case "praetorium":
      return "Cockpit vivo para supervisão do runtime, repasses, bloqueios e evidências.";
    case "portal-preview":
      return "Superfície interna de revisão do primeiro bloco do portal antes de qualquer integração pública.";
    case "cockpit-preview":
      return "Superfície interna de revisão voltada ao piloto, mantida separada de Cortex Praetorium e da supervisão do runtime.";
    case "agents":
      return "Gerencie workspaces, ferramentas e identidades dos agentes.";
    case "overview":
      return "Status do gateway, pontos de entrada e leitura rápida de saúde.";
    case "channels":
      return "Gerencie canais e configurações.";
    case "instances":
      return "Sinais de presença de clientes e nós conectados.";
    case "sessions":
      return "Inspecione sessões ativas e ajuste padrões por sessão.";
    case "usage":
      return "";
    case "cron":
      return "Agende despertares e execuções recorrentes de agentes.";
    case "skills":
      return "Gerencie disponibilidade de skills e injeção de chaves de API.";
    case "nodes":
      return "Dispositivos pareados, capacidades e exposição de comandos.";
    case "chat":
      return "Superfície de continuação de uma sala viva depois de entrar pelo Fórum, Praetorium, Portal ou Cockpit.";
    case "config":
      return "Edite ~/.openclaw/openclaw.json com segurança.";
    case "debug":
      return "Snapshots do gateway, eventos e chamadas RPC manuais.";
    case "logs":
      return "Acompanhamento em tempo real dos logs de arquivo do gateway.";
    default:
      return "";
  }
}

export function useForTab(tab: Tab) {
  switch (tab) {
    case "home":
      return "Escolha por onde começar";
    case "command":
      return "Prioridade e leitura executiva";
    case "forum":
      return "Reuniões, discussão de projeto e decisões";
    case "praetorium":
      return "Trabalho ativo, bloqueios e repasses";
    case "portal-preview":
      return "Revisar o primeiro bloco do portal";
    case "cockpit-preview":
      return "Revisar a superfície do app do piloto";
    case "chat":
      return "Continuar uma sala viva";
    case "overview":
      return "Conectar e corrigir acesso";
    case "channels":
      return "Canais de mensagem";
    case "instances":
      return "Clientes conectados";
    case "sessions":
      return "Controle por sessão";
    case "usage":
      return "Métricas de uso do runtime";
    case "cron":
      return "Execuções agendadas";
    case "agents":
      return "Identidades e arquivos dos agentes";
    case "skills":
      return "Disponibilidade de habilidades";
    case "nodes":
      return "Dispositivos pareados";
    case "config":
      return "Configuração do gateway";
    case "debug":
      return "Diagnóstico técnico";
    case "logs":
      return "Evidência operacional";
    default:
      return "";
  }
}
