import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const appRoot = path.join(repoRoot, "_preview_artifacts", "collegium-discussions");
const dataRoot = path.join(repoRoot, "local", "collegium-discussions");
const packetsRoot = path.join(dataRoot, "review-packets");
const statePath = path.join(dataRoot, "state.json");
const port = Number(process.env.COLLEGIUM_DISCUSSIONS_PORT ?? "8940");

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(appRoot));

app.get("/api/state", async (_request, response) => {
  response.json(await readState());
});

app.post("/api/discussions", async (request, response) => {
  const state = await readState();
  const title = cleanText(request.body?.title);
  const context = cleanText(request.body?.context);
  if (!title) {
    response.status(400).json({ error: "title_required" });
    return;
  }

  const now = isoNow();
  const discussion = {
    id: `DISC-${timestampId()}`,
    title,
    type: cleanEnum(request.body?.type, ["duvida", "melhoria", "risco", "observacao", "incidente"], "observacao"),
    surface: cleanEnum(request.body?.surface, ["Cortex Command", "The Forum", "Cortex Praetorium", "OpenClaw Runtime"], "Cortex Praetorium"),
    status: "novo",
    destination: "triagem_local",
    owner: cleanText(request.body?.owner) || "Chairman",
    impact: cleanText(request.body?.impact) || "",
    context,
    createdAt: now,
    updatedAt: now,
    messages: context
      ? [
          {
            id: `MSG-${timestampId()}`,
            author: cleanText(request.body?.owner) || "Chairman",
            body: context,
            createdAt: now,
          },
        ]
      : [],
    promotions: [],
  };

  state.discussions.unshift(discussion);
  state.updatedAt = now;
  await writeState(state);
  response.status(201).json(discussion);
});

app.post("/api/discussions/:id/messages", async (request, response) => {
  const state = await readState();
  const discussion = findDiscussion(state, request.params.id);
  if (!discussion) {
    response.status(404).json({ error: "not_found" });
    return;
  }

  const body = cleanText(request.body?.body);
  if (!body) {
    response.status(400).json({ error: "body_required" });
    return;
  }

  const now = isoNow();
  const message = {
    id: `MSG-${timestampId()}`,
    author: cleanText(request.body?.author) || "Chairman",
    body,
    createdAt: now,
  };
  discussion.messages.push(message);
  discussion.updatedAt = now;
  state.updatedAt = now;
  await writeState(state);
  response.status(201).json(message);
});

app.patch("/api/discussions/:id", async (request, response) => {
  const state = await readState();
  const discussion = findDiscussion(state, request.params.id);
  if (!discussion) {
    response.status(404).json({ error: "not_found" });
    return;
  }

  discussion.title = cleanText(request.body?.title) || discussion.title;
  discussion.type = cleanEnum(request.body?.type, ["duvida", "melhoria", "risco", "observacao", "incidente"], discussion.type);
  discussion.surface = cleanEnum(
    request.body?.surface,
    ["Cortex Command", "The Forum", "Cortex Praetorium", "OpenClaw Runtime"],
    discussion.surface,
  );
  discussion.status = cleanEnum(request.body?.status, ["novo", "em_triagem", "promovido", "arquivado"], discussion.status);
  discussion.destination = cleanEnum(
    request.body?.destination,
    ["triagem_local", "analise_lider", "forum", "arquivo"],
    discussion.destination,
  );
  discussion.owner = cleanText(request.body?.owner) || discussion.owner;
  discussion.impact = cleanText(request.body?.impact) || discussion.impact;
  discussion.context = cleanText(request.body?.context) || discussion.context;
  discussion.updatedAt = isoNow();
  state.updatedAt = discussion.updatedAt;

  await writeState(state);
  response.json(discussion);
});

app.post("/api/discussions/:id/promote", async (request, response) => {
  const state = await readState();
  const discussion = findDiscussion(state, request.params.id);
  if (!discussion) {
    response.status(404).json({ error: "not_found" });
    return;
  }

  const destination = cleanEnum(
    request.body?.destination,
    ["analise_lider", "forum", "arquivo"],
    "analise_lider",
  );
  const now = isoNow();
  discussion.destination = destination;
  discussion.status = destination === "arquivo" ? "arquivado" : "promovido";
  discussion.updatedAt = now;
  const packetId = `${discussion.id}-${timestampId()}`;
  const fileName = `${packetId}.md`;
  const packetPath = path.join(packetsRoot, fileName);
  const packetBody = renderPacket(discussion, {
    destination,
    promotedAt: now,
    packetId,
  });

  await fs.mkdir(packetsRoot, { recursive: true });
  await fs.writeFile(packetPath, packetBody, "utf8");

  const packet = {
    id: packetId,
    destination,
    createdAt: now,
    fileName,
    packetPath,
  };

  discussion.promotions.unshift(packet);
  state.updatedAt = now;

  await writeState(state);
  response.status(201).json(packet);
});

app.get("/review-packets/:fileName", async (request, response) => {
  const fileName = path.basename(request.params.fileName);
  const packetPath = path.join(packetsRoot, fileName);
  try {
    const body = await fs.readFile(packetPath, "utf8");
    response.type("text/markdown").send(body);
  } catch {
    response.status(404).send("Packet not found.");
  }
});

app.use(async (_request, response) => {
  response.sendFile(path.join(appRoot, "index.html"));
});

await ensureState();
app.listen(port, "127.0.0.1", () => {
  console.log(`[OK] Collegium discussions running at http://127.0.0.1:${port}`);
  console.log(`[OK] Local state: ${statePath}`);
});

async function ensureState() {
  await fs.mkdir(dataRoot, { recursive: true });
  await fs.mkdir(packetsRoot, { recursive: true });
  try {
    await fs.access(statePath);
  } catch {
    await writeState({
      version: 1,
      updatedAt: isoNow(),
      discussions: [],
    });
  }
}

async function readState() {
  await ensureState();
  const raw = await fs.readFile(statePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.discussions)) {
    parsed.discussions = [];
  }
  return parsed;
}

async function writeState(state) {
  await fs.writeFile(statePath, JSON.stringify(state, null, 2), "utf8");
}

function findDiscussion(state, id) {
  return state.discussions.find((entry) => entry.id === id);
}

function renderPacket(discussion, meta) {
  const messages = discussion.messages.length
    ? discussion.messages
        .map(
          (message) =>
            `### ${message.author} - ${message.createdAt}\n${message.body}\n`,
        )
        .join("\n")
    : "_Sem mensagens registradas._";
  const promotions = discussion.promotions.length
    ? discussion.promotions
        .map(
          (packet) =>
            `- ${packet.createdAt} | ${packet.destination} | ${packet.fileName}`,
        )
        .join("\n")
    : "- primeira promocao";

  return `# Discussion Review Packet\n\n## Envelope\n- packet_id: ${meta.packetId}\n- discussion_id: ${discussion.id}\n- destination: ${meta.destination}\n- promoted_at: ${meta.promotedAt}\n\n## Summary\n- title: ${discussion.title}\n- type: ${discussion.type}\n- surface: ${discussion.surface}\n- status: ${discussion.status}\n- owner: ${discussion.owner}\n- impact: ${discussion.impact || "n/a"}\n\n## Context\n${discussion.context || "_Sem contexto adicional._"}\n\n## Discussion Log\n${messages}\n\n## Promotions\n${promotions}\n\n## Requested Action\n- analyze this packet without mutating source code directly\n- classify as intervention, research, forum decision, or archive\n- respond with recommended path, risks, and required human decision if any\n`;
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function cleanEnum(value, allowed, fallback) {
  const text = cleanText(value);
  return allowed.includes(text) ? text : fallback;
}

function isoNow() {
  return new Date().toISOString();
}

function timestampId() {
  return isoNow().replaceAll(/[-:.TZ]/g, "").slice(0, 14);
}
