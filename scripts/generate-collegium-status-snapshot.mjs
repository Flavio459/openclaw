import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const defaultInput = path.join(repoRoot, "docs", "collegium-implantation-status.md");
const defaultOutput = path.join(repoRoot, "docs", "collegium-status.snapshot.json");
const pemaHealthUrl = process.env.PEMA_HEALTH_URL ?? "http://127.0.0.1:8787/health";
const pemaStateUrl = process.env.PEMA_STATE_URL ?? "http://127.0.0.1:8787/state";
const pemaApiToken = process.env.PEMA_API_TOKEN ?? "";
const execFileAsync = promisify(execFile);

const args = process.argv.slice(2);
const inputPath = resolveArg("--input", defaultInput);
const outputPath = resolveArg("--output", defaultOutput);

main().catch((error) => {
  console.error("[X] Failed to generate Collegium status snapshot:", error);
  process.exitCode = 1;
});

async function main() {
  const source = await fs.readFile(inputPath, "utf8");
  const sections = parseSections(source);
  const title = firstHeading(source) ?? "Collegium Cortex Implantation Status";
  const stateFields = parseFieldList(sections.get("Estado Atual") ?? "");
  const scope = parseScopeSection(sections.get("Escopo") ?? "");
  const blockers = parseEntries(sections.get("Bloqueios") ?? "");
  const decisions = parseEntries(sections.get("Decisoes Pendentes") ?? "");
  const componentsTable = parseMarkdownTable(sections.get("Componentes de Implantacao") ?? "");
  const surfacesTable = parseMarkdownTable(sections.get("Superficies do Produto") ?? "");
  const liveBranch = await getCurrentBranch();
  const localGatewayHealth = await probeJson("http://127.0.0.1:19000/health");
  const chairmanApiHealth = await probeJson(pemaHealthUrl);
  const chairmanState = await probeJson(pemaStateUrl, pemaApiToken);

  const snapshot = {
    schemaVersion: "1.0.0",
    meta: {
      title,
      surface: "Cortex Praetorium",
      reason:
        "Superficie executiva de supervisao da implantacao do Collegium com leitura curta para Chairman e lider de desenvolvimento.",
      notThis: "Nao e dashboard SaaS generico, nao e runtime engine e nao e painel de tooling LAB.",
      statusSignal: stateFields["Status geral"] ?? "n/a",
      lastUpdated: new Date().toISOString(),
      scope,
    },
    generalState: {
      branch: liveBranch ?? cleanInline(stateFields["Branch ativa"] ?? "n/a"),
      activeFront: cleanInline(stateFields["Frente ativa"] ?? "n/a"),
      overallStatus: cleanInline(stateFields["Status geral"] ?? "n/a"),
      lastCheckpoint: extractDate(stateFields["Ultimo checkpoint"] ?? new Date().toISOString().slice(0, 10)),
      agenticContract: cleanInline(stateFields["Contrato agentico"] ?? "n/a"),
    },
    summarySignals: buildSummarySignals(stateFields, blockers, decisions, surfacesTable, componentsTable, {
      liveBranch,
      localGatewayHealth,
      chairmanApiHealth,
      chairmanState,
    }),
    now: wrapItems(parseList(sections.get("Agora") ?? ""), "now"),
    nextDominantAction: {
      id: "next-01",
      title: cleanInline(getCleanParagraph(sections.get("Proxima Acao Dominante") ?? "")),
      summary: "Acao dominante da leitura executiva atual do Collegium.",
      lastUpdated: currentDay(),
    },
    weeklyTop3: wrapItems(parseList(sections.get("Top 3 da Semana") ?? ""), "top"),
    operations: parseEntries(sections.get("Centro Operacional") ?? "").map((entry, index) => ({
      id: `op-${index + 1}`,
      title: entry.title,
      environmentScope: cleanInline(entry.fields["Ambiente"] ?? "n/a"),
      status: cleanInline(entry.fields["Status"] ?? "n/a"),
      doHere: cleanInline(entry.fields["Fazer aqui"] ?? "n/a"),
      dontHere: cleanInline(entry.fields["Nao fazer aqui"] ?? "n/a"),
      access: cleanInline(entry.fields["Acesso"] ?? "n/a"),
      command: cleanInline(entry.fields["Comando"] ?? ""),
      preflight: cleanInline(entry.fields["Preflight"] ?? ""),
      sourceOfTruth: cleanInline(entry.fields["Fonte de verdade"] ?? "n/a"),
      lastUpdated: currentDay(),
    })),
    blockers: blockers.map((entry, index) => ({
      id: extractLeadingCode(entry.title) ?? `B${index + 1}`,
      title: stripLeadingCode(entry.title),
      status: blockerStatus(entry.fields),
      summary: cleanInline(entry.fields["Efeito"] ?? "n/a"),
      effect: cleanInline(entry.fields["Efeito"] ?? "n/a"),
      dependency: cleanInline(entry.fields["Dependencia"] ?? "n/a"),
      needsHumanDecision: yesNoToBoolean(entry.fields["Decisao humana"]),
      owner: cleanInline(entry.fields["Dono"] ?? inferBlockerOwner(entry.fields)),
      lastUpdated: currentDay(),
    })),
    pendingDecisions: decisions.map((entry, index) => ({
      id: extractLeadingCode(entry.title) ?? `D${index + 1}`,
      title: stripLeadingCode(entry.title),
      impact: cleanInline(entry.fields["Impacto"] ?? "n/a"),
      urgency: cleanInline(entry.fields["Urgencia"] ?? "n/a"),
      owner: cleanInline(entry.fields["Dono"] ?? "n/a"),
      summary: cleanInline(entry.fields["Impacto"] ?? "n/a"),
      lastUpdated: currentDay(),
    })),
    surfaces: surfacesTable.rows.map((row) => ({
      name: cleanInline(row[0] ?? "n/a"),
      status: cleanInline(row[1] ?? "n/a"),
      realData: cleanInline(row[2] ?? "n/a"),
      dependency: cleanInline(row[3] ?? "n/a"),
      maturity: cleanInline(row[4] ?? "n/a"),
      summary: cleanInline(row[4] ?? "n/a"),
      lastUpdated: currentDay(),
    })),
    components: componentsTable.rows.map((row) => ({
      name: cleanInline(row[0] ?? "n/a"),
      componentType: cleanInline(row[1] ?? "n/a"),
      status: cleanInline(row[2] ?? "n/a"),
      source: cleanInline(row[3] ?? "n/a"),
      nextStep: cleanInline(row[4] ?? "n/a"),
      environmentScope: inferEnvironmentScope(row[1] ?? "", row[0] ?? ""),
      summary: cleanInline(row[4] ?? "n/a"),
      lastUpdated: currentDay(),
    })),
    risks: parseEntries(sections.get("Riscos Atuais") ?? "").map((entry, index) => ({
      id: extractLeadingCode(entry.title) ?? `R${index + 1}`,
      title: stripLeadingCode(entry.title),
      status: riskStatus(entry.fields),
      effect: cleanInline(entry.fields["Efeito"] ?? "n/a"),
      mitigation: cleanInline(entry.fields["Mitigacao"] ?? "n/a"),
      summary: cleanInline(entry.fields["Efeito"] ?? "n/a"),
      lastUpdated: currentDay(),
    })),
    evidence: [
      ...parseMarkdownLinks(sections.get("Ultimas Evidencias") ?? "").map((item) => ({
        label: item.label,
        href: item.href,
        kind: classifyEvidence(item.href),
        lastUpdated: currentDay(),
      })),
      {
        label: "gateway-local-health",
        href: "http://127.0.0.1:19000/health",
        kind: "endpoint",
        lastUpdated: currentDay(),
      },
      {
        label: "chairman-api-health",
        href: pemaHealthUrl,
        kind: "endpoint",
        lastUpdated: currentDay(),
      },
      {
        label: "chairman-api-state",
        href: pemaStateUrl,
        kind: "endpoint",
        lastUpdated: currentDay(),
      },
    ],
    chairmanObservations: parseObservations(sections.get("Observacoes do Chairman") ?? "").map((item) => ({
      id: item.id,
      date: extractDate(item.fields.Data ?? currentDay()),
      type: cleanInline(item.fields.Tipo ?? "n/a"),
      text: cleanInline(item.fields.Texto ?? "n/a"),
      expectedImpact: cleanInline(item.fields["Impacto esperado"] ?? "n/a"),
      status: cleanInline(item.fields.Status ?? "n/a"),
      response: {
        reading: cleanInline(item.response.Leitura ?? "n/a"),
        impact: cleanInline(item.response.Impacto ?? "n/a"),
        actionTaken: cleanInline(item.response["Acao adotada"] ?? "n/a"),
        needsHumanDecision: yesNoToBoolean(item.response["Precisa decisao humana"]),
      },
    })),
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(`[OK] Collegium status snapshot generated at ${outputPath}`);
}

function parseSections(source) {
  const sections = new Map();
  const headingPattern = /^##\s+(.+)$/gm;
  const headings = [...source.matchAll(headingPattern)];
  for (let index = 0; index < headings.length; index += 1) {
    const title = headings[index][1].trim();
    const start = headings[index].index + headings[index][0].length;
    const end = index + 1 < headings.length ? headings[index + 1].index : source.length;
    sections.set(title, source.slice(start, end).trim());
  }
  return sections;
}

function parseFieldList(section) {
  const fields = {};
  for (const line of section.split(/\r?\n/)) {
    const match = line.match(/^- \*\*(.+?):\*\* (.+)$/);
    if (match) {
      fields[match[1].trim()] = match[2].trim();
    }
  }
  return fields;
}

function parseList(section) {
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").trim())
    .filter(Boolean);
}

function parseEntries(section) {
  const headings = [...section.matchAll(/^###\s+(.+)$/gm)];
  if (headings.length === 0) {
    return [];
  }
  return headings.map((match, index) => {
    const title = match[1].trim();
    const start = match.index + match[0].length;
    const end = index + 1 < headings.length ? headings[index + 1].index : section.length;
    const body = section.slice(start, end).trim();
    return { title, fields: parseFieldList(body) };
  });
}

function parseObservations(section) {
  const matches = [...section.matchAll(/^###\s+(OBS-[^\r\n]+)$/gm)];
  if (matches.length === 0) {
    return [];
  }
  return matches.map((match, index) => {
    const id = match[1].trim();
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : section.length;
    const body = section.slice(start, end).trim();
    const responseMarker = body.indexOf("#### Resposta da IA Lider");
    const mainBody = responseMarker === -1 ? body : body.slice(0, responseMarker).trim();
    let responseBody = "";
    if (responseMarker !== -1) {
      const afterResponse = body.slice(responseMarker + "#### Resposta da IA Lider".length).trim();
      const nextSubsection = afterResponse.search(/^####\s+/m);
      responseBody = nextSubsection === -1 ? afterResponse : afterResponse.slice(0, nextSubsection).trim();
    }
    return { id, fields: parseFieldList(mainBody), response: parseFieldList(responseBody) };
  });
}

function parseMarkdownTable(section) {
  const lines = section.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.startsWith("|"));
  if (lines.length < 2) {
    return { headers: [], rows: [] };
  }
  return {
    headers: splitTableLine(lines[0]),
    rows: lines.slice(2).map((line) => splitTableLine(line)),
  };
}

function splitTableLine(line) {
  return line.split("|").slice(1, -1).map((cell) => cell.trim());
}

function parseMarkdownLinks(section) {
  return [...section.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((match) => ({
    label: match[1].trim(),
    href: match[2].trim(),
  }));
}

function firstHeading(source) {
  const match = source.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

function getCleanParagraph(section) {
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");
}

function parseScopeSection(section) {
  const subsections = new Map();
  const headings = [...section.matchAll(/^###\s+(.+)$/gm)];
  for (let index = 0; index < headings.length; index += 1) {
    const title = headings[index][1].trim();
    const start = headings[index].index + headings[index][0].length;
    const end = index + 1 < headings.length ? headings[index + 1].index : section.length;
    subsections.set(title, parseList(section.slice(start, end).trim()).map(cleanInline));
  }
  return {
    covers: subsections.get("Cobre") ?? [],
    doesNotCover: subsections.get("Nao cobre") ?? [],
    distinction: subsections.get("Distincao") ?? [],
  };
}

function buildSummarySignals(stateFields, blockers, decisions, surfacesTable, componentsTable, liveState = {}) {
  const activeSurfaces = surfacesTable.rows.filter((row) => normalize(row[1]).includes("ativo")).length;
  const labOrProvisional = componentsTable.rows.filter((row) => /(lab|provisorio)/i.test(row[1] ?? "")).length;
  const chairmanStateCount =
    liveState.chairmanState && typeof liveState.chairmanState === "object"
      ? countChairmanPending(liveState.chairmanState)
      : null;
  return [
    {
      label: "branch ativa",
      value: liveState.liveBranch ?? cleanInline(stateFields["Branch ativa"] ?? "n/a"),
      status: "ativo",
      summary: "Branch viva da implantacao em acompanhamento executivo.",
    },
    {
      label: "gateway local",
      value: liveState.localGatewayHealth?.status ?? "indisponivel",
      status: liveState.localGatewayHealth?.status === "ok" ? "ativo" : "bloqueado",
      summary:
        liveState.localGatewayHealth?.status === "ok"
          ? "Health direto do runtime local validado em 127.0.0.1:19000."
          : "Health direto do runtime local indisponivel no momento da geracao do snapshot.",
    },
    {
      label: "chairman api",
      value: liveState.chairmanApiHealth?.status ?? "indisponivel",
      status: liveState.chairmanApiHealth?.status === "ok" ? "ativo" : "parcial",
      summary:
        chairmanStateCount === null
          ? "Health do Chairman API sondado; leitura de /state nao disponivel ou nao autenticada."
          : `Health do Chairman API ok; /state acessivel com ${chairmanStateCount} pendencias detectadas.`,
    },
    {
      label: "status geral",
      value: cleanInline(stateFields["Status geral"] ?? "n/a"),
      status: cleanInline(stateFields["Status geral"] ?? "n/a"),
      summary: "Leitura dominante da implantacao no ciclo atual.",
    },
    {
      label: "superficies ativas",
      value: String(activeSurfaces),
      status: activeSurfaces > 0 ? "ativo" : "parcial",
      summary: "Superficies com sinal forte na implantacao atual.",
    },
    {
      label: "bloqueios ativos",
      value: String(blockers.length),
      status: blockers.length > 0 ? "bloqueado" : "ativo",
      summary: `${decisions.length} decisoes pendentes e ${labOrProvisional} componentes lab/provisorios na leitura atual.`,
    },
  ];
}

function wrapItems(items, prefix) {
  return items.map((item, index) => ({
    id: `${prefix}-${String(index + 1).padStart(2, "0")}`,
    title: cleanInline(item),
    summary: cleanInline(item),
    lastUpdated: currentDay(),
  }));
}

function yesNoToBoolean(value) {
  return normalize(value) === "sim";
}

function blockerStatus(fields) {
  return yesNoToBoolean(fields["Decisao humana"]) ? "parcial" : "bloqueado";
}

function riskStatus(fields) {
  return normalize(fields.Efeito).includes("risco") ? "bloqueado" : "parcial";
}

function inferBlockerOwner(fields) {
  return yesNoToBoolean(fields["Decisao humana"]) ? "Chairman" : "lider de desenvolvimento";
}

function inferEnvironmentScope(type, name) {
  const normalized = `${type} ${name}`.toLowerCase();
  if (normalized.includes("lab")) {
    return "local";
  }
  if (normalized.includes("prod")) {
    return "vps-prod";
  }
  if (normalized.includes("api") || normalized.includes("handoff") || normalized.includes("guard")) {
    return "vps-lab";
  }
  return "local";
}

function classifyEvidence(href) {
  if (href.endsWith(".ps1") || href.endsWith(".mjs") || href.endsWith(".ts")) {
    return "script";
  }
  if (href.endsWith(".log")) {
    return "log";
  }
  return "documento";
}

function extractLeadingCode(value) {
  const match = value.match(/^([A-Z]+\d+)\./);
  return match ? match[1] : "";
}

function stripLeadingCode(value) {
  return value.replace(/^[A-Z]+\d+\.\s*/, "").trim();
}

function extractDate(value) {
  const match = String(value).match(/\d{4}-\d{2}-\d{2}/);
  return match?.[0] ?? currentDay();
}

function cleanInline(value) {
  return String(value ?? "")
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*/g, "")
    .trim();
}

function currentDay() {
  return new Date().toISOString().slice(0, 10);
}

function normalize(value) {
  return String(value ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

function resolveArg(flag, fallback) {
  const index = args.indexOf(flag);
  if (index === -1 || index === args.length - 1) {
    return fallback;
  }
  return path.resolve(process.cwd(), args[index + 1]);
}

async function getCurrentBranch() {
  try {
    const { stdout } = await execFileAsync("git", ["-C", repoRoot, "branch", "--show-current"]);
    const branch = stdout.trim();
    return branch || null;
  } catch {
    return null;
  }
}

async function probeJson(url, bearerToken) {
  try {
    const headers = {};
    if (bearerToken) {
      headers.Authorization = `Bearer ${bearerToken}`;
    }
    const response = await fetch(url, { method: "GET", headers });
    if (!response.ok) {
      return { status: `http-${response.status}` };
    }
    return await response.json();
  } catch {
    return null;
  }
}

function countChairmanPending(state) {
  if (!state || typeof state !== "object") {
    return null;
  }
  if (Array.isArray(state.pending)) {
    return state.pending.length;
  }
  if (Array.isArray(state.decisions)) {
    return state.decisions.length;
  }
  if (typeof state.pending_count === "number") {
    return state.pending_count;
  }
  return null;
}
