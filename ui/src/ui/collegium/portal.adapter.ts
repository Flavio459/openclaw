import {
  PORTAL_FIRST_BLOCK_CONTRACT,
  type PortalFirstBlockState,
  type PortalFirstBlockViewModel,
} from "./portal.contract.ts";
import type { PresenceEntry } from "../types.ts";

export type PortalFirstBlockAdapterInput = {
  state: PortalFirstBlockState;
  contextLine: string;
  primaryHeadline: string;
  supportingSubheadline: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  signalPanel: {
    compressedMargin: string;
    leakPoint: string;
    nextAdjustment: string;
    dataState: "observed" | "placeholder";
  };
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

export type PortalDefaultRuntimeInput = {
  connected: boolean;
  lastError: string | null;
  presenceEntries: PresenceEntry[];
  sessionsCount?: number | null;
  execApprovalQueueCount?: number;
  nowMs?: number;
};

const DEFAULT_CONTEXT_LINE = "Leitura curta do turno atual";
const DEFAULT_HEADLINE = "Veja onde o turno perdeu clareza antes da próxima corrida.";
const DEFAULT_SUBHEADLINE =
  "Receba uma leitura operacional do ponto de vazamento e do próximo ajuste sem cadastro pesado na primeira dobra.";
const DEFAULT_PRIMARY_CTA_LABEL = "Ler meu turno agora";
const DEFAULT_PRIMARY_CTA_HREF = "/portal/read-shift";
const DEFAULT_SECONDARY_CTA_LABEL = "Entender como a leitura funciona";
const DEFAULT_SECONDARY_CTA_HREF = "/portal/method";
const RECENT_PRESENCE_WINDOW_MS = 90_000;

const formatPresenceAge = (ageMs: number) => {
  const ageSeconds = Math.max(0, Math.round(ageMs / 1000));
  if (ageSeconds < 60) {
    return `${ageSeconds}s`;
  }
  const ageMinutes = Math.round(ageSeconds / 60);
  return `${ageMinutes}min`;
};

const latestPresenceTimestamp = (presenceEntries: PresenceEntry[]) =>
  presenceEntries.reduce<number | null>((latest, entry) => {
    const ts = typeof entry.ts === "number" && Number.isFinite(entry.ts) ? entry.ts : null;
    if (ts == null) {
      return latest;
    }
    return latest == null || ts > latest ? ts : latest;
  }, null);

const freshestInputSeconds = (presenceEntries: PresenceEntry[]) =>
  presenceEntries.reduce<number | null>((freshest, entry) => {
    const seconds =
      typeof entry.lastInputSeconds === "number" && Number.isFinite(entry.lastInputSeconds)
        ? entry.lastInputSeconds
        : null;
    if (seconds == null) {
      return freshest;
    }
    return freshest == null || seconds < freshest ? seconds : freshest;
  }, null);

const hasNarrativeDrift = (value: string) => {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("comunidade") ||
    normalized.includes("grupo") ||
    normalized.includes("ganho") ||
    normalized.includes("renda") ||
    normalized.includes("promessa")
  );
};

export const buildPortalFirstBlockViewModel = (
  input: PortalFirstBlockAdapterInput,
): PortalFirstBlockViewModel => {
  const texts = [
    input.contextLine,
    input.primaryHeadline,
    input.supportingSubheadline,
    input.primaryCtaLabel,
    input.secondaryCtaLabel,
    input.signalPanel.compressedMargin,
    input.signalPanel.leakPoint,
    input.signalPanel.nextAdjustment,
  ];

  if (texts.some(hasNarrativeDrift)) {
    throw new Error("Portal first block input violates narrative guardrails.");
  }

  return {
    state: input.state,
    contextLine: input.contextLine,
    primaryHeadline: input.primaryHeadline,
    supportingSubheadline: input.supportingSubheadline,
    primaryCta: {
      label: input.primaryCtaLabel,
      href: input.primaryCtaHref,
    },
    signalPanel: input.signalPanel,
    secondaryCta: {
      label: input.secondaryCtaLabel,
      href: input.secondaryCtaHref,
    },
    guardrails: PORTAL_FIRST_BLOCK_CONTRACT.narrativeGuardrails,
  };
};

export const buildPortalDefaultRuntimeInput = (
  input: PortalDefaultRuntimeInput,
): PortalFirstBlockAdapterInput => {
  const presenceCount = input.presenceEntries.length;
  const sessionsCount = typeof input.sessionsCount === "number" ? Math.max(0, input.sessionsCount) : null;
  const execApprovalQueueCount =
    typeof input.execApprovalQueueCount === "number" ? Math.max(0, input.execApprovalQueueCount) : 0;
  const nowMs = input.nowMs ?? Date.now();
  const latestTs = latestPresenceTimestamp(input.presenceEntries);
  const latestInputSeconds = freshestInputSeconds(input.presenceEntries);

  if (input.lastError) {
    return {
      state: "portal-default",
      contextLine: DEFAULT_CONTEXT_LINE,
      primaryHeadline: DEFAULT_HEADLINE,
      supportingSubheadline: DEFAULT_SUBHEADLINE,
      primaryCtaLabel: DEFAULT_PRIMARY_CTA_LABEL,
      primaryCtaHref: DEFAULT_PRIMARY_CTA_HREF,
      signalPanel: {
        compressedMargin: "Continuidade de presença interrompida no runtime interno.",
        leakPoint: `Leitura viva bloqueada por erro estrutural: ${input.lastError}`,
        nextAdjustment: "Próximo ajuste: remover o bloqueio atual antes de restaurar a continuidade de presença.",
        dataState: "placeholder",
      },
      secondaryCtaLabel: DEFAULT_SECONDARY_CTA_LABEL,
      secondaryCtaHref: DEFAULT_SECONDARY_CTA_HREF,
    };
  }

  if (!input.connected) {
    return {
      state: "portal-default",
      contextLine: DEFAULT_CONTEXT_LINE,
      primaryHeadline: DEFAULT_HEADLINE,
      supportingSubheadline: DEFAULT_SUBHEADLINE,
      primaryCtaLabel: DEFAULT_PRIMARY_CTA_LABEL,
      primaryCtaHref: DEFAULT_PRIMARY_CTA_HREF,
      signalPanel: {
        compressedMargin: "Continuidade de presença indisponível porque o runtime está desconectado.",
        leakPoint: "A leitura viva ainda não pode abrir porque não há presença ativa sustentando o bloco.",
        nextAdjustment: "Próximo ajuste: reconectar o runtime antes de avaliar continuidade de presença.",
        dataState: "placeholder",
      },
      secondaryCtaLabel: DEFAULT_SECONDARY_CTA_LABEL,
      secondaryCtaHref: DEFAULT_SECONDARY_CTA_HREF,
    };
  }

  if (presenceCount === 0) {
    return {
      state: "portal-default",
      contextLine: DEFAULT_CONTEXT_LINE,
      primaryHeadline: DEFAULT_HEADLINE,
      supportingSubheadline: DEFAULT_SUBHEADLINE,
      primaryCtaLabel: DEFAULT_PRIMARY_CTA_LABEL,
      primaryCtaHref: DEFAULT_PRIMARY_CTA_HREF,
      signalPanel: {
        compressedMargin: "Continuidade de presença ainda não foi sustentada neste momento.",
        leakPoint: "Não existe instância ativa suficiente para dizer que a leitura viva está disponível agora.",
        nextAdjustment: "Próximo ajuste: estabilizar pelo menos uma presença ativa antes de elevar o bloco além de prontidão controlada.",
        dataState: "placeholder",
      },
      secondaryCtaLabel: DEFAULT_SECONDARY_CTA_LABEL,
      secondaryCtaHref: DEFAULT_SECONDARY_CTA_HREF,
    };
  }

  if (latestTs == null) {
    return {
      state: "portal-default",
      contextLine: DEFAULT_CONTEXT_LINE,
      primaryHeadline: DEFAULT_HEADLINE,
      supportingSubheadline: DEFAULT_SUBHEADLINE,
      primaryCtaLabel: DEFAULT_PRIMARY_CTA_LABEL,
      primaryCtaHref: DEFAULT_PRIMARY_CTA_HREF,
      signalPanel: {
        compressedMargin: `Continuidade de presença disponível com ${presenceCount} instância(s) ativa(s), mas sem timestamp recente confirmado.`,
        leakPoint: "A leitura viva ainda não pode afirmar janela recente porque a presença ativa chegou sem marca temporal utilizável.",
        nextAdjustment: "Próximo ajuste: confirmar heartbeat recente antes de elevar a leitura viva além de disponibilidade básica.",
        dataState: "placeholder",
      },
      secondaryCtaLabel: DEFAULT_SECONDARY_CTA_LABEL,
      secondaryCtaHref: DEFAULT_SECONDARY_CTA_HREF,
    };
  }

  const ageMs = Math.max(0, nowMs - latestTs);
  const ageLabel = formatPresenceAge(ageMs);

  if (ageMs > RECENT_PRESENCE_WINDOW_MS) {
    return {
      state: "portal-default",
      contextLine: DEFAULT_CONTEXT_LINE,
      primaryHeadline: DEFAULT_HEADLINE,
      supportingSubheadline: DEFAULT_SUBHEADLINE,
      primaryCtaLabel: DEFAULT_PRIMARY_CTA_LABEL,
      primaryCtaHref: DEFAULT_PRIMARY_CTA_HREF,
      signalPanel: {
        compressedMargin: `Continuidade de presença existe com ${presenceCount} instância(s), mas a janela recente já degradou para ${ageLabel}.`,
        leakPoint: `O último heartbeat confirmável saiu da janela curta de atividade recente há ${ageLabel}.`,
        nextAdjustment: "Próximo ajuste: restaurar cadência curta de heartbeat antes de tratar a leitura viva como sustentada.",
        dataState: "placeholder",
      },
      secondaryCtaLabel: DEFAULT_SECONDARY_CTA_LABEL,
      secondaryCtaHref: DEFAULT_SECONDARY_CTA_HREF,
    };
  }

  const recentInputLine =
    latestInputSeconds == null
      ? "Sem input recente confirmado ainda."
      : `Input recente observado há ${formatPresenceAge(latestInputSeconds * 1000)}.`;
  const sessionsLine =
    sessionsCount == null
      ? "Contagem de sessões ainda não carregada."
      : `${sessionsCount} sessão(ões) ativa(s) confirmada(s).`;
  const authorityLine =
    execApprovalQueueCount > 0
      ? `${execApprovalQueueCount} aprovação(ões) pendente(s) no trilho de autoridade.`
      : "Nenhuma aprovação pendente no trilho de autoridade.";
  const pressureLine =
    execApprovalQueueCount > 0
      ? `Há pressão no trilho de autoridade com ${execApprovalQueueCount} aprovação(ões) pendente(s), sem que isso seja lido como qualidade do turno.`
      : sessionsCount === 0
        ? "A leitura viva está disponível, mas ainda sem sessão ativa confirmada para tratar este bloco como cadência operacional em curso."
        : "A leitura viva já pode afirmar disponibilidade, recência do runtime e frescor de input quando presente, mas ainda não afirma qualidade do turno nem resultado econômico.";
  const nextAdjustmentLine =
    execApprovalQueueCount > 0
      ? "Próximo ajuste: reduzir a fila de autoridade pendente antes de ligar qualquer leitura mais sensível do turno."
      : sessionsCount === 0
        ? "Próximo ajuste: confirmar a primeira sessão ativa sobre essa janela recente antes de subir a leitura para cadência operacional."
        : "Próximo ajuste: conectar um único sinal real do turno sobre essa janela recente de heartbeat, input e continuidade, sem inventar telemetria dos Pilots.";

  return {
    state: "portal-default",
    contextLine: DEFAULT_CONTEXT_LINE,
    primaryHeadline: DEFAULT_HEADLINE,
    supportingSubheadline: DEFAULT_SUBHEADLINE,
    primaryCtaLabel: DEFAULT_PRIMARY_CTA_LABEL,
    primaryCtaHref: DEFAULT_PRIMARY_CTA_HREF,
    signalPanel: {
      compressedMargin: `Continuidade de presença disponível com ${presenceCount} instância(s) ativa(s), heartbeat recente em ${ageLabel}, ${recentInputLine.toLowerCase()} ${sessionsLine} ${authorityLine}`,
      leakPoint: pressureLine,
      nextAdjustment: nextAdjustmentLine,
      dataState: "observed",
    },
    secondaryCtaLabel: DEFAULT_SECONDARY_CTA_LABEL,
    secondaryCtaHref: DEFAULT_SECONDARY_CTA_HREF,
  };
};
