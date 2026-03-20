import {
  countBusinessAgents,
  countEngineeringAgents,
  type RuntimeEnvironment,
} from "../collegium.ts";
import type { AgentsListResult } from "../types.ts";
import type { CommandViewModel } from "./command.contract.ts";
import type { RuntimeSignals } from "./runtime-signals.ts";

export type CommandAdapterInput = {
  environment: RuntimeEnvironment;
  agentsList: AgentsListResult | null;
  runtimeSignals: RuntimeSignals;
};

const buildInstitutionState = (
  runtimeSignals: RuntimeSignals,
): CommandViewModel["institutionState"] => {
  if (runtimeSignals.runtimeContinuity.status === "blocked") {
    return {
      status: "attention_required",
      detail: runtimeSignals.runtimeContinuity.detail,
    };
  }
  if (
    runtimeSignals.runtimeContinuity.status === "waiting" ||
    runtimeSignals.sessionContinuity.status === "waiting"
  ) {
    return {
      status: "awaiting_runtime",
      detail: runtimeSignals.runtimeContinuity.detail,
    };
  }
  return {
    status: "operational",
    detail: runtimeSignals.runtimeContinuity.detail,
  };
};

const buildCommandPriority = (
  runtimeSignals: RuntimeSignals,
): CommandViewModel["commandPriority"] => {
  return {
    headline: "Prioridade e tensão abrem a leitura",
    tension: runtimeSignals.authorityPressure.detail,
  };
};

const buildDominantWorkstream = (
  engineeringAgents: number,
  runtimeSignals: RuntimeSignals,
): CommandViewModel["dominantWorkstream"] => {
  if ((runtimeSignals.automationCadence.counts?.cronJobs ?? 0) > 0) {
    return {
      label: `The Foundry · ${runtimeSignals.automationCadence.counts?.cronJobs ?? 0} rotina(s) automatizada(s)`,
      summary:
        "A camada operacional intermediária permanece com The Foundry; a evidência continua subordinada à leitura executiva.",
    };
  }
  return {
    label: `The Foundry · ${engineeringAgents} colaborador(es) de engenharia`,
    summary:
      "O workstream permanece como camada operacional intermediária enquanto os feeds financeiro e de The Pilots seguem explicitamente desvinculados.",
  };
};

const buildModules = (
  input: CommandAdapterInput,
  engineeringAgents: number,
): CommandViewModel["modules"] => [
  {
    id: "boardroom",
    name: "Conselho",
    owner: "Chairman",
    status: input.runtimeSignals.authorityPressure.detail,
    detail: "Autoridade, vetos e decisões que exigem soberania humana formal.",
  },
  {
    id: "operations",
    name: "Operações",
    owner: "Agente Executivo-Chefe",
    status: input.runtimeSignals.runtimeContinuity.detail,
    detail: "A rede operacional continua observável sem fingir que a telemetria de The Pilots já existe.",
  },
  {
    id: "capital_assets",
    name: "Capital e Ativos",
    owner: "Agente Financeiro-Chefe",
    status: input.runtimeSignals.sessionContinuity.detail,
    detail: "O feed financeiro permanece intencionalmente desvinculado; só o lastro operacional disponível é mostrado.",
  },
  {
    id: "compliance",
    name: "Compliance",
    owner: "Agente Jurídico-Chefe",
    status:
      input.runtimeSignals.strategicAmbiguity.status === "pending"
        ? "Revisão obrigatória"
        : "Nominal",
    detail: "O compliance permanece na leitura sem derivar para telemetria administrativa genérica.",
  },
  {
    id: "foundry",
    name: "The Foundry",
    owner: "Agente-Chefe de Produto/Engenharia",
    status:
      input.runtimeSignals.automationCadence.status === "nominal"
        ? input.runtimeSignals.automationCadence.detail
        : `${engineeringAgents} colaborador(es) de engenharia`,
    detail: "P&D e execução técnica permanecem como camada operacional intermediária da superfície.",
  },
];

export const buildCommandViewModel = (input: CommandAdapterInput): CommandViewModel => {
  const business = countBusinessAgents(input.agentsList);
  const engineering = countEngineeringAgents(input.agentsList);
  const institutionState = buildInstitutionState(input.runtimeSignals);

  return {
    environment: input.environment,
    institutionState,
    chairmanRail: {
      pendingAuthorityCount: input.runtimeSignals.authorityPressure.counts?.approvals ?? 0,
    },
    collaborators: {
      total: input.agentsList?.agents.length ?? 0,
      business,
      engineering,
    },
    commandPriority: buildCommandPriority(input.runtimeSignals),
    dominantWorkstream: buildDominantWorkstream(engineering, input.runtimeSignals),
    signalContext: {
      authorityPressure: input.runtimeSignals.authorityPressure.detail,
      automationCadence: input.runtimeSignals.automationCadence.detail,
      strategicAmbiguity: input.runtimeSignals.strategicAmbiguity.detail,
    },
    modules: buildModules(input, engineering),
    executionEnvelope: {
      pilotsTelemetry: "not_bound",
      financialFeed: "not_bound",
      runtimePresence: input.runtimeSignals.runtimeContinuity.detail,
      authorityRail: input.runtimeSignals.authorityPressure.detail,
    },
    bridges: {
      forumLabel:
        input.runtimeSignals.strategicAmbiguity.status === "pending"
          ? "Abrir The Forum · ambiguidade"
          : "Abrir The Forum",
      praetoriumLabel: "Inspecionar Praetorium",
    },
  };
};
