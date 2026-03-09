#!/usr/bin/env node

/**
 * Minimal MCP server for a Chairman dashboard:
 * - Reads PEMA state from a JSON file
 * - Sends approve/reject decisions to the Chairman API
 *
 * Transport: stdio (MCP framing with Content-Length headers)
 */

import fs from "node:fs/promises";

const PROTOCOL_VERSION = "2024-11-05";

const API_TOKEN = process.env.PEMA_API_TOKEN ?? "";
const STATE_URL = process.env.PEMA_STATE_URL ?? "";
const STATE_FILE =
  process.env.PEMA_STATE_FILE ??
  "/home/deploy/.openclaw-lab/workspace/PEMA_Antigravity/tools/state.json";
const DECISION_URL = process.env.PEMA_DECISION_URL ?? "http://127.0.0.1:8787/decision";
const HEALTH_URL = process.env.PEMA_HEALTH_URL ?? "http://127.0.0.1:8787/health";

const TOOL_LIST = [
  {
    name: "pema.health",
    description: "Checks Chairman API health endpoint.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "pema.state",
    description: "Returns dashboard state summary and the decisions list.",
    inputSchema: {
      type: "object",
      properties: {
        includeAll: { type: "boolean", default: true },
      },
      additionalProperties: false,
    },
  },
  {
    name: "pema.pending",
    description: "Returns only pending decisions.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "pema.decision",
    description: "Approves or rejects a pending decision by ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        status: { type: "string", enum: ["approved", "rejected"] },
        actor: { type: "string", default: "chairman" },
        note: { type: "string" },
      },
      required: ["id", "status"],
      additionalProperties: false,
    },
  },
];

function writeMessage(message) {
  const payload = JSON.stringify(message);
  const header = `Content-Length: ${Buffer.byteLength(payload, "utf8")}\r\n\r\n`;
  process.stdout.write(header + payload);
}

function ok(id, result) {
  writeMessage({ jsonrpc: "2.0", id, result });
}

function fail(id, code, message, data) {
  writeMessage({
    jsonrpc: "2.0",
    id,
    error: { code, message, data },
  });
}

function parseHeaders(rawHeaders) {
  const headers = {};
  for (const line of rawHeaders.split("\r\n")) {
    const idx = line.indexOf(":");
    if (idx <= 0) {
      continue;
    }
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    headers[key] = value;
  }
  return headers;
}

async function readState() {
  if (STATE_URL) {
    const res = await fetch(STATE_URL, { headers: buildHeaders() });
    const body = await res.text();
    if (!res.ok) {
      throw new Error(`State API failed (${res.status}): ${body}`);
    }
    return tryJson(body);
  }
  const raw = await fs.readFile(STATE_FILE, "utf8");
  return JSON.parse(raw);
}

function pendingFromState(state) {
  const items = state?.decisions?.items;
  if (!Array.isArray(items)) {
    return [];
  }
  return items.filter((item) => String(item?.status ?? "").toLowerCase() === "pending");
}

function buildHeaders({ json = false } = {}) {
  const headers = {};
  if (json) {
    headers["Content-Type"] = "application/json";
  }
  if (API_TOKEN) {
    headers.Authorization = `Bearer ${API_TOKEN}`;
  }
  return headers;
}

async function callTool(name, args) {
  if (name === "pema.health") {
    const res = await fetch(HEALTH_URL, { headers: buildHeaders() });
    const body = await res.text();
    return {
      httpStatus: res.status,
      ok: res.ok,
      body: tryJson(body),
    };
  }

  if (name === "pema.state") {
    const state = await readState();
    const includeAll = args?.includeAll ?? true;
    return {
      generated_at: state?.generated_at ?? null,
      decisions: state?.decisions ?? {},
      agents: state?.agents ?? {},
      meeting: state?.meeting ?? {},
      items: includeAll ? (state?.decisions?.items ?? []) : undefined,
    };
  }

  if (name === "pema.pending") {
    const state = await readState();
    const pending = pendingFromState(state);
    return {
      generated_at: state?.generated_at ?? null,
      pending_count: pending.length,
      pending,
    };
  }

  if (name === "pema.decision") {
    const id = String(args?.id ?? "").trim();
    const status = String(args?.status ?? "")
      .trim()
      .toLowerCase();
    const actor = String(args?.actor ?? "chairman").trim() || "chairman";
    const note = String(args?.note ?? `mcp:${status}`).trim();

    if (!id) {
      throw new Error("`id` is required.");
    }
    if (status !== "approved" && status !== "rejected") {
      throw new Error("`status` must be `approved` or `rejected`.");
    }

    const res = await fetch(DECISION_URL, {
      method: "POST",
      headers: buildHeaders({ json: true }),
      body: JSON.stringify({ id, status, actor, note }),
    });
    const body = await res.text();
    const parsed = tryJson(body);
    if (!res.ok || parsed?.ok === false) {
      throw new Error(`Decision API failed (${res.status}): ${body}`);
    }
    return parsed;
  }

  throw new Error(`Unknown tool: ${name}`);
}

function tryJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function handleRequest(message) {
  const { id, method, params } = message;

  if (method === "initialize") {
    ok(id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: {
        name: "pema-chairman-dashboard",
        version: "0.1.0",
      },
    });
    return;
  }

  if (method === "tools/list") {
    ok(id, { tools: TOOL_LIST });
    return;
  }

  if (method === "tools/call") {
    try {
      const name = params?.name;
      const args = params?.arguments ?? {};
      const result = await callTool(name, args);
      ok(id, {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      });
    } catch (error) {
      ok(id, {
        content: [{ type: "text", text: String(error?.message ?? error) }],
        isError: true,
      });
    }
    return;
  }

  // Notifications we can safely ignore.
  if (id === undefined) {
    return;
  }

  fail(id, -32601, `Method not found: ${method}`);
}

let buffer = Buffer.alloc(0);

process.stdin.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  void pump();
});

process.stdin.on("error", (err) => {
  process.stderr.write(`[mcp] stdin error: ${String(err)}\n`);
});

async function pump() {
  while (true) {
    const sep = buffer.indexOf("\r\n\r\n");
    if (sep < 0) {
      return;
    }

    const rawHeaders = buffer.slice(0, sep).toString("utf8");
    const headers = parseHeaders(rawHeaders);
    const contentLength = Number(headers["content-length"]);
    if (!Number.isFinite(contentLength) || contentLength < 0) {
      process.stderr.write("[mcp] invalid Content-Length\n");
      buffer = Buffer.alloc(0);
      return;
    }

    const total = sep + 4 + contentLength;
    if (buffer.length < total) {
      return;
    }

    const body = buffer.slice(sep + 4, total).toString("utf8");
    buffer = buffer.slice(total);

    let message;
    try {
      message = JSON.parse(body);
    } catch (error) {
      process.stderr.write(`[mcp] invalid JSON: ${String(error)}\n`);
      continue;
    }

    await handleRequest(message);
  }
}
