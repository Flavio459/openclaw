import type { RuntimeEnvironment } from "../collegium.ts";
import type { CommandAdapterInput } from "./command.adapter.ts";
import type { RuntimeSignals } from "./runtime-signals.ts";

const signal = (
  overrides: Partial<RuntimeSignals["runtimeContinuity"]>,
): RuntimeSignals["runtimeContinuity"] => ({
  status: "nominal",
  detail: "1 instância viva mantém o runtime observável.",
  sourceIds: ["node-1"],
  observedAt: "2026-03-13T00:00:00.000Z",
  counts: {},
  ...overrides,
});

const runtimeSignals = (
  overrides: Partial<RuntimeSignals> = {},
): RuntimeSignals => ({
  runtimeContinuity: signal({
    counts: { presence: 1 },
  }),
  authorityPressure: signal({
    status: "none",
    detail: "Nenhuma solicitação de autoridade está aguardando no trilho do Chairman.",
    sourceIds: [],
    counts: { approvals: 0 },
  }),
  automationCadence: signal({
    detail: "3 rotinas de automação mantêm a camada operacional intermediária ativa.",
    sourceIds: ["cron:status"],
    counts: { cronJobs: 3 },
  }),
  sessionContinuity: signal({
    detail: "8 sessões ativas sustentam a leitura atual de continuidade.",
    sourceIds: ["sessions:visible"],
    counts: { sessions: 8 },
  }),
  strategicAmbiguity: signal({
    status: "none",
    detail: "Nenhuma ambiguidade estratégica está aberta no feed atual.",
    sourceIds: [],
    counts: { ambiguities: 0 },
  }),
  ...overrides,
});

const baseFixture = (environment: RuntimeEnvironment): CommandAdapterInput => ({
  environment,
  agentsList: {
    defaultId: "main",
    mainKey: "main",
    scope: "gateway",
    agents: [
      { id: "main", name: "Main" },
      { id: "ceo", name: "Chief Executive Agent" },
      { id: "ped", name: "Chief Product/Eng. Agent" },
      { id: "legal", name: "Chief Legal Agent" },
    ],
  },
  runtimeSignals: runtimeSignals(),
});

export const runtimeNominalFixture: CommandAdapterInput = baseFixture("DEV");

export const runtimeAttentionFixture: CommandAdapterInput = {
  ...baseFixture("DEV"),
  runtimeSignals: runtimeSignals({
    runtimeContinuity: signal({
      status: "blocked",
      detail: "Gateway degraded",
      sourceIds: ["runtime:error"],
      counts: { presence: 1 },
    }),
    authorityPressure: signal({
      status: "pending",
      detail: "1 solicitação de autoridade pressiona o trilho executivo.",
      sourceIds: ["approval-1"],
      counts: { approvals: 1 },
    }),
    strategicAmbiguity: signal({
      status: "pending",
      detail: "The Control UI received runtime telemetry, but not the original user instruction.",
      sourceIds: ["ambiguity-1"],
      counts: { ambiguities: 1 },
    }),
  }),
};

export const runtimeAwaitingFixture: CommandAdapterInput = {
  ...baseFixture("LAB"),
  runtimeSignals: runtimeSignals({
    runtimeContinuity: signal({
      status: "waiting",
      detail: "A continuidade do runtime aguarda uma conexão saudável com o gateway.",
      sourceIds: ["runtime:offline"],
      counts: { presence: 0 },
    }),
    automationCadence: signal({
      status: "waiting",
      detail: "A cadência de automação ainda não está vinculada.",
      sourceIds: ["cron:unbound"],
      counts: {},
    }),
    sessionContinuity: signal({
      status: "waiting",
      detail: "A continuidade de sessões ainda não está vinculada.",
      sourceIds: ["sessions:unbound"],
      counts: {},
    }),
  }),
};
