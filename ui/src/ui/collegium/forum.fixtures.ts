import type { EventLogEntry } from "../app-events.ts";
import type { ExecApprovalRequest } from "../controllers/exec-approval.ts";
import type { ForumAdapterInput } from "./forum.adapter.ts";

const approval = (overrides: Partial<ExecApprovalRequest> = {}): ExecApprovalRequest => ({
  id: "approval-1",
  request: {
    command: "node scripts/run-node.mjs agent",
    agentId: "ceo",
    ask: "Aprovar a direção atual",
  },
  createdAtMs: 1_700_000_000_000,
  expiresAtMs: 1_700_000_030_000,
  ...overrides,
});

const event = (overrides: Partial<EventLogEntry> = {}): EventLogEntry => ({
  ts: 1_700_000_000_500,
  event: "agent",
  payload: {
    agentId: "ceo",
    message: "Revisão estratégica em andamento.",
  },
  ...overrides,
});

const baseFixture = (): ForumAdapterInput => ({
  gatewayUrl: "http://127.0.0.1:19000",
  hello: null,
  agentsList: {
    defaultId: "main",
    mainKey: "main",
    scope: "gateway",
    agents: [
      { id: "main", name: "Main" },
      { id: "ceo", name: "Chief Executive Agent" },
      { id: "cfo", name: "Chief Financial Agent" },
      { id: "legal", name: "Chief Legal Agent" },
      { id: "ped", name: "Chief Product/Eng. Agent" },
    ],
  },
  eventLog: [event()],
  execApprovalQueue: [],
  connected: true,
  lastError: null,
  cronJobs: [],
});

export const forumNominalFixture: ForumAdapterInput = {
  ...baseFixture(),
  execApprovalQueue: [approval()],
};

export const forumEscalationFixture: ForumAdapterInput = {
  ...baseFixture(),
  lastError: "Gateway degradado",
  execApprovalQueue: [approval()],
  eventLog: [
    event(),
    event({
      event: "chat",
      payload: {
        data: {
          message: "Need direction on this structural change.",
        },
      },
    }),
  ],
};
