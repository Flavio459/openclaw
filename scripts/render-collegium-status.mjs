import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import MarkdownIt from "markdown-it";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const defaultInput = path.join(repoRoot, "docs", "collegium-implantation-status.md");
const defaultSnapshotInput = path.join(repoRoot, "docs", "collegium-status.snapshot.json");
const defaultSchemaPath = path.join(repoRoot, "docs", "collegium-status.schema.json");
const defaultOutput = path.join(repoRoot, "_preview_artifacts", "collegium-status", "index.html");
const agenticContractPath = path.join(repoRoot, "docs", "collegium-agentic-operating-contract.md");
const runtimeChecklistPath = path.join(repoRoot, "docs", "runtime-adoption-checklist.md");

const args = process.argv.slice(2);
const inputPath = resolveArg("--input", defaultInput);
const outputPath = resolveArg("--output", defaultOutput);
const validateOnly = args.includes("--validate-only");

const md = new MarkdownIt({
  html: true,
  linkify: false,
  breaks: false,
});

md.validateLink = (url) => /^(file|https?):/i.test(url);

main().catch((error) => {
  console.error("[X] Failed to render Collegium status:", error);
  process.exitCode = 1;
});

async function main() {
  const statusData = await loadStatusData(inputPath);
  if (validateOnly) {
    console.log("[OK] Collegium status snapshot validated.");
    return;
  }

  const {
    title,
    stateFields,
    scopeHtml,
    nowItems,
    nextActionText,
    topThree,
    operations,
    blockers,
    decisions,
    risks,
    surfaces,
    components,
    evidenceList,
    observations,
    updatedAt,
    summarySignals,
  } = statusData;
  const topbarLinks = {
    agenticContract: relativeFileHref(outputPath, agenticContractPath),
    runtimeChecklist: relativeFileHref(outputPath, runtimeChecklistPath),
  };

  const componentGroups = groupComponents(components);
  const activeSurfaces = countMatches(surfaces.rows, 1, /ativo/i);
  const labComponents = countMatches(components.rows, 1, /(lab|provisorio)/i);
  const signalCards = summarySignals?.length
    ? summarySignals
    : [
        {
          label: "superficies ativas",
          value: String(activeSurfaces),
          status: activeSurfaces > 0 ? "ativo" : "parcial",
          summary: "Superficies que ja operam com sinal forte na implantacao atual.",
        },
        {
          label: "bloqueios",
          value: String(blockers.length),
          status: blockers.length > 0 ? "bloqueado" : "ativo",
          summary: "Pontos que seguram consolidacao, decisao ou evolucao do runtime.",
        },
        {
          label: "decisoes",
          value: String(decisions.length),
          status: decisions.length > 0 ? "parcial" : "ativo",
          summary: "Itens que pedem julgamento ou priorizacao explicita.",
        },
        {
          label: "lab e provisoes",
          value: String(labComponents),
          status: labComponents > 0 ? "lab" : "ativo",
          summary: "Componentes que ainda nao devem ser lidos como camada estavel.",
        },
      ];
  const favicon = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="18" fill="#0e1a20"/>
      <path d="M16 21h32v7H24v8h20v7H24v14h-8V21z" fill="#eef3ed"/>
      <circle cx="50" cy="18" r="6" fill="#6cd39a"/>
    </svg>`,
  );

  const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <link rel="icon" href="data:image/svg+xml,${favicon}" />
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap");
      :root {
        --bg: #091115;
        --panel: rgba(14, 24, 29, 0.88);
        --panel-strong: rgba(18, 30, 36, 0.96);
        --line: rgba(255, 255, 255, 0.08);
        --line-strong: rgba(255, 255, 255, 0.16);
        --text: #eef3ed;
        --muted: #93a5a7;
        --active: #6cd39a;
        --warning: #f0c36b;
        --blocked: #ef7f70;
        --neutral: #8eb8ea;
        --accent: #b5d9ff;
        --shadow: 0 26px 70px rgba(0, 0, 0, 0.34);
        --radius: 26px;
        --radius-small: 18px;
        --radius-pill: 999px;
        --sans: "Manrope", "Segoe UI", sans-serif;
        --display: "Fraunces", Georgia, serif;
        --mono: "IBM Plex Mono", "Cascadia Code", monospace;
      }
      * { box-sizing: border-box; }
      html, body { margin: 0; min-height: 100%; }
      body {
        color: var(--text);
        font-family: var(--sans);
        background:
          radial-gradient(circle at 0% 0%, rgba(142, 184, 234, 0.14), transparent 26%),
          radial-gradient(circle at 100% 0%, rgba(108, 211, 154, 0.11), transparent 24%),
          radial-gradient(circle at 50% 100%, rgba(240, 195, 107, 0.12), transparent 30%),
          linear-gradient(180deg, #071014, #0c1519 46%, #091115);
      }
      body::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        background-image:
          linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
        background-size: 36px 36px;
        mask-image: linear-gradient(180deg, rgba(0,0,0,0.55), transparent 78%);
      }
      a { color: var(--accent); text-decoration: none; }
      a:hover { text-decoration: underline; }
      code { font-family: var(--mono); font-size: 0.94em; }
      .shell { width: min(1520px, calc(100vw - 24px)); margin: 0 auto; padding: 18px 0 48px; }
      .topbar {
        display: flex; justify-content: space-between; align-items: center; gap: 12px;
        margin-bottom: 16px; padding: 10px 14px; border: 1px solid var(--line);
        border-radius: var(--radius-pill); background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(14px);
      }
      .topbar-actions { display: flex; align-items: center; gap: 10px; }
      .action-link {
        display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 0 13px;
        border-radius: var(--radius-pill); border: 1px solid rgba(181, 217, 255, 0.22);
        background: rgba(181, 217, 255, 0.08); color: var(--accent); font-size: 12px;
        appearance: none; cursor: pointer; font-family: var(--sans);
      }
      .action-link--subtle {
        border-color: rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.03);
        color: var(--muted);
      }
      .action-link:hover { text-decoration: none; background: rgba(181, 217, 255, 0.12); }
      .eyebrow, .section-tag, .mini-label, .footer {
        font: 11px var(--mono); text-transform: uppercase; letter-spacing: 0.16em; color: var(--muted);
      }
      .hero { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr); gap: 18px; }
      .hero-main, .hero-rail, .signal-card, .panel, .mini-card, .surface-card, .component-card, .observation-card, .decision-card {
        border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); box-shadow: var(--shadow); backdrop-filter: blur(14px);
      }
      .hero-main {
        position: relative; overflow: hidden; padding: 28px;
        background: radial-gradient(circle at 85% 18%, rgba(142, 184, 234, 0.16), transparent 24%), linear-gradient(180deg, rgba(18, 30, 36, 0.92), rgba(12, 21, 25, 0.92));
      }
      .hero-main::after {
        content: ""; position: absolute; inset: auto -6% -36% 18%; height: 240px;
        background: radial-gradient(circle, rgba(108, 211, 154, 0.18), transparent 64%); pointer-events: none;
      }
      h1 { margin: 14px 0 10px; max-width: 11ch; font: 600 clamp(48px, 7vw, 88px)/0.92 var(--display); letter-spacing: -0.05em; }
      .hero-copy, .scope-prose, .panel-copy, .entry-card li, .entry-card p { color: var(--muted); line-height: 1.68; font-size: 14px; }
      .token-row, .surface-meta, .component-meta, .obs-meta { display: flex; flex-wrap: wrap; gap: 10px; }
      .token, .status-chip {
        display: inline-flex; align-items: center; gap: 8px; min-height: 34px; padding: 0 13px;
        border-radius: var(--radius-pill); border: 1px solid var(--line); background: rgba(255, 255, 255, 0.04); font-size: 12px;
      }
      .status-chip { font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.08em; }
      .status-chip::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
      .status--active { color: var(--active); border-color: rgba(108, 211, 154, 0.22); background: rgba(108, 211, 154, 0.08); }
      .status--warning { color: var(--warning); border-color: rgba(240, 195, 107, 0.22); background: rgba(240, 195, 107, 0.08); }
      .status--blocked { color: var(--blocked); border-color: rgba(239, 127, 112, 0.24); background: rgba(239, 127, 112, 0.08); }
      .status--neutral { color: var(--neutral); border-color: rgba(142, 184, 234, 0.22); background: rgba(142, 184, 234, 0.08); }
      .status--muted { color: var(--muted); }
      .hero-rail { display: grid; gap: 18px; padding: 20px; background: linear-gradient(180deg, rgba(16, 28, 33, 0.92), rgba(11, 19, 23, 0.92)); }
      .scope-prose h3, .scope-prose h4 { margin: 0 0 8px; color: var(--text); font-size: 14px; }
      .scope-prose p, .scope-prose ul, .scope-prose ol { margin: 0 0 10px; }
      .signal-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin: 18px 0; }
      .signal-card { padding: 18px; background: var(--panel-strong); }
      .signal-value { margin: 8px 0 6px; font: 600 32px/1 var(--display); letter-spacing: -0.03em; }
      .signal-copy { color: var(--muted); line-height: 1.6; font-size: 13px; }
      .access-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
      .access-intro {
        margin-bottom: 16px; padding: 14px 16px; border-radius: 16px;
        border: 1px solid rgba(181, 217, 255, 0.14); background: rgba(181, 217, 255, 0.05);
        color: var(--muted); line-height: 1.66;
      }
      .mode-strip {
        display: grid;
        grid-template-columns: minmax(0, 1.3fr) repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }
      .mode-card {
        padding: 16px 18px;
        border-radius: 18px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.03);
      }
      .mode-card--primary {
        border-color: rgba(108, 211, 154, 0.24);
        background:
          radial-gradient(circle at 100% 0%, rgba(108, 211, 154, 0.1), transparent 34%),
          rgba(255, 255, 255, 0.03);
      }
      .mode-title {
        margin-top: 6px;
        font: 600 20px/1.08 var(--display);
        letter-spacing: -0.03em;
        color: var(--text);
      }
      .mode-copy {
        margin-top: 8px;
        color: var(--muted);
        line-height: 1.6;
        font-size: 13px;
      }
      .access-card {
        display: grid; gap: 14px; border-color: rgba(181, 217, 255, 0.14);
        background:
          radial-gradient(circle at 100% 0%, rgba(181, 217, 255, 0.08), transparent 32%),
          rgba(255, 255, 255, 0.03);
      }
      .access-top, .access-badges { display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; align-items: flex-start; }
      .access-badges { justify-content: flex-end; }
      .access-title { margin-top: 8px; font: 600 24px/1.08 var(--display); letter-spacing: -0.03em; color: var(--text); }
      .access-body { display: grid; gap: 10px; }
      .access-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 12px;
      }
      .access-block {
        padding: 12px 14px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.03);
      }
      .access-label {
        margin-bottom: 6px; font: 11px var(--mono); text-transform: uppercase;
        letter-spacing: 0.16em; color: var(--muted);
      }
      .access-command {
        display: block; margin-top: 4px; padding: 10px 12px; border-radius: 12px;
        background: rgba(0, 0, 0, 0.18); border: 1px solid rgba(255, 255, 255, 0.06);
        overflow-wrap: anywhere;
      }
      .copy-feedback {
        min-height: 16px;
        color: var(--muted);
        font-size: 12px;
      }
      .deck { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(340px, 0.8fr); gap: 18px; }
      .stack, .section-grid, .timeline, .component-groups, .evidence-list { display: grid; gap: 18px; }
      .panel { padding: 22px; }
      .panel-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
      .panel-title { margin: 8px 0 0; font: 600 28px/1.05 var(--display); letter-spacing: -0.03em; }
      .section-grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      .mini-card, .entry-card, .surface-card, .component-card, .observation-card, .evidence-item, .decision-card {
        border: 1px solid var(--line); border-radius: var(--radius-small); padding: 18px; background: rgba(255, 255, 255, 0.03);
      }
      .mini-value { margin-top: 8px; font: 600 24px/1 var(--display); }
      .action-card strong, .entry-card strong, .surface-title, .component-title { display: block; margin-bottom: 8px; font-size: 16px; color: var(--text); }
      .entry-card ul, .observation-card ul { margin: 10px 0 0; padding-left: 18px; }
      .decision-stack, .chairman-board { display: grid; gap: 14px; }
      .decision-card {
        position: relative;
        overflow: hidden;
        display: grid;
        grid-template-columns: 76px minmax(0, 1fr);
        gap: 16px;
        border-color: rgba(240, 195, 107, 0.22);
        background:
          linear-gradient(180deg, rgba(240, 195, 107, 0.11), rgba(240, 195, 107, 0.02) 48%),
          rgba(20, 30, 35, 0.98);
      }
      .decision-card::before {
        content: "";
        position: absolute;
        inset: 0 auto 0 0;
        width: 4px;
        background: linear-gradient(180deg, rgba(240, 195, 107, 0.96), rgba(239, 127, 112, 0.72));
      }
      .decision-index {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 14px;
        min-height: 100%;
        padding: 10px 8px 10px 4px;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
      }
      .decision-number {
        font: 600 34px/1 var(--display);
        letter-spacing: -0.04em;
      }
      .decision-label {
        font: 11px var(--mono);
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: var(--warning);
      }
      .decision-body {
        display: grid;
        gap: 12px;
      }
      .decision-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }
      .decision-title {
        margin: 0;
        font-size: 17px;
        line-height: 1.35;
        color: var(--text);
      }
      .decision-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .decision-impact {
        padding: 12px 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.03);
        color: var(--muted);
        line-height: 1.62;
      }
      .decision-fields {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .decision-field {
        padding: 11px 12px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
      }
      .decision-field-label {
        margin-bottom: 6px;
        font: 11px var(--mono);
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--muted);
      }
      .decision-field-value {
        color: var(--text);
        line-height: 1.5;
      }
      .timeline-item { display: grid; grid-template-columns: 24px minmax(0, 1fr); gap: 12px; align-items: start; padding: 12px 0; border-top: 1px solid var(--line); }
      .timeline-item:first-child { border-top: 0; padding-top: 0; }
      .timeline-dot { width: 12px; height: 12px; margin-top: 5px; border-radius: 50%; background: linear-gradient(180deg, rgba(181, 217, 255, 0.95), rgba(108, 211, 154, 0.9)); box-shadow: 0 0 0 6px rgba(181, 217, 255, 0.08); }
      .surface-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
      .surface-top, .component-top, .obs-top, .evidence-item { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
      .component-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
      .component-group { border-top: 1px solid var(--line); padding-top: 16px; }
      .component-group:first-child { border-top: 0; padding-top: 0; }
      .chairman-board {
        padding: 4px;
        border-radius: calc(var(--radius) - 6px);
        background:
          linear-gradient(180deg, rgba(181, 217, 255, 0.08), rgba(108, 211, 154, 0.02)),
          rgba(255, 255, 255, 0.02);
      }
      .observation-card {
        position: relative;
        overflow: hidden;
        border-color: rgba(181, 217, 255, 0.18);
        background:
          radial-gradient(circle at 100% 0%, rgba(181, 217, 255, 0.12), transparent 28%),
          linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)),
          rgba(20, 32, 38, 0.96);
      }
      .observation-card::before {
        content: "";
        position: absolute;
        inset: 0 auto 0 0;
        width: 4px;
        background: linear-gradient(180deg, rgba(181, 217, 255, 0.96), rgba(108, 211, 154, 0.72));
      }
      .observation-copy {
        display: grid;
        gap: 10px;
      }
      .observation-impact {
        margin-top: 2px;
        padding: 12px 14px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.07);
      }
      .response {
        margin-top: 14px;
        padding: 16px;
        border: 1px solid rgba(108, 211, 154, 0.18);
        border-radius: 16px;
        background: rgba(108, 211, 154, 0.06);
        display: grid;
        gap: 10px;
        color: var(--muted);
      }
      .response-tag {
        font: 11px var(--mono);
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: var(--active);
      }
      .response strong { color: var(--text); }
      .guide { display: grid; gap: 10px; }
      .guide-item { padding: 12px 14px; border-left: 2px solid rgba(181, 217, 255, 0.26); background: rgba(255, 255, 255, 0.03); border-radius: 0 14px 14px 0; color: var(--muted); line-height: 1.62; }
      .footer { margin-top: 18px; text-align: right; }
      @media (max-width: 1220px) {
        .hero, .deck { grid-template-columns: 1fr; }
        .signal-grid, .access-grid, .surface-grid, .component-list, .decision-fields { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .mode-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 760px) {
        .shell { width: min(100vw - 16px, 100%); padding-top: 12px; }
        .topbar, .hero-main, .hero-rail, .panel, .signal-card { padding: 16px; }
        h1 { font-size: 44px; }
        .signal-grid, .access-grid, .mode-strip, .section-grid.two, .surface-grid, .component-list, .decision-fields { grid-template-columns: 1fr; }
        .decision-card { grid-template-columns: 1fr; }
        .decision-index { border-right: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding: 0 0 12px; }
        .evidence-item { flex-direction: column; align-items: flex-start; }
        .access-top, .access-badges { justify-content: flex-start; }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <div class="topbar">
        <div class="eyebrow">Collegium Cortex / command deck de implantacao</div>
        <div class="topbar-actions">
          <a class="action-link action-link--subtle" href="${escapeHtml(topbarLinks.agenticContract)}">Contrato agentico</a>
          <a class="action-link action-link--subtle" href="${escapeHtml(topbarLinks.runtimeChecklist)}">Checklist runtime</a>
          <a class="action-link action-link--subtle" href="http://127.0.0.1:8940/" target="_blank" rel="noreferrer">Inbox auxiliar</a>
          <div class="status-chip ${statusClass(stateFields["Status geral"] ?? "n/a")}">${renderInline(stateFields["Status geral"] ?? "n/a")}</div>
        </div>
      </div>
      <section class="hero">
        <article class="hero-main">
          <div class="eyebrow">leituras principais em menos de dois minutos</div>
          <h1>estado, tensao e proxima decisao</h1>
          <div class="hero-copy">Painel executivo local para acompanhar a implantacao do Collegium dentro de <code>openclaw-push</code>, sem confundir engine, produto, integracoes PEMA e tooling de LAB.</div>
          <div class="token-row">
            <span class="token"><strong>Branch</strong> ${renderInline(stateFields["Branch ativa"] ?? "n/a")}</span>
            <span class="token"><strong>Frente</strong> ${renderInline(shorten(stateFields["Frente ativa"] ?? "n/a", 90))}</span>
            <span class="token"><strong>Atualizado</strong> ${escapeHtml(updatedAt)}</span>
          </div>
          <div class="signal-grid">
            ${renderSignalCards(signalCards)}
          </div>
        </article>
        <aside class="hero-rail">
          <div><div class="section-tag">escopo</div><div class="scope-prose">${scopeHtml}</div></div>
          <div><div class="section-tag">proxima acao dominante</div><div class="panel-title">${renderInline(nextActionText)}</div></div>
          <div class="guide">
            <div class="section-tag">como ler</div>
            <div class="guide-item">Comece pelo topo: status geral, bloqueios e decisao dominante.</div>
            <div class="guide-item">Desca para as trilhas de decisao e veja o que esta puxando a implantacao agora.</div>
            <div class="guide-item">Use observacoes do Chairman como canal formal de correcao e redirecionamento.</div>
            <div class="guide-item">Este painel e a entrada canonica. Use a inbox apenas como trilha auxiliar de triagem paralela.</div>
          </div>
        </aside>
      </section>
      <section class="panel" style="margin-top: 18px;">
        <div class="panel-head">
          <div>
            <div class="section-tag">centro operacional</div>
            <div class="panel-title">Onde se faz o que</div>
            <div class="panel-copy">Acesso por intencao humana para evitar desenvolvimento, registro ou validacao no ambiente errado.</div>
          </div>
        </div>
        <div class="mode-strip">
          <article class="mode-card mode-card--primary">
            <div class="section-tag">fase atual</div>
            <div class="mode-title">Voce esta em desenvolvimento</div>
            <div class="mode-copy">Nesta fase, o ambiente dominante e o <code>local</code>. Escreva codigo aqui, registre contexto no <code>vault</code> e so feche runtime real em <code>VPS lab</code>.</div>
          </article>
          <article class="mode-card">
            <div class="section-tag">desenvolver</div>
            <div class="mode-title">Local</div>
            <div class="mode-copy">Implementacao, refactor, teste rapido e build.</div>
          </article>
          <article class="mode-card">
            <div class="section-tag">registrar</div>
            <div class="mode-title">Vault</div>
            <div class="mode-copy">Decisao, checkpoint, SPEC, REV e memoria operacional.</div>
          </article>
          <article class="mode-card">
            <div class="section-tag">promover</div>
            <div class="mode-title">Lab antes de prod</div>
            <div class="mode-copy">Validacao real de runtime fecha em <code>VPS lab</code>; <code>prod</code> fica para operacao estavel.</div>
          </article>
        </div>
        <div class="access-intro">Na fase atual de desenvolvimento, a regra padrao e esta: codigo nasce no <code>local</code>, decisao e rastreabilidade vivem no <code>vault</code>, validacao real de runtime fecha em <code>VPS lab</code> e <code>VPS prod</code> fica restrito a operacao estavel.</div>
        <div class="access-grid">
          ${renderAccessCards(operations)}
        </div>
      </section>
      <section class="deck" style="margin-top: 18px;">
        <div class="stack">
          <article class="panel">
            <div class="panel-head">
              <div>
                <div class="section-tag">estado atual</div>
                <div class="panel-title">Agora</div>
              </div>
              <div class="status-chip status--neutral">checkpoint ${renderInline(extractDate(stateFields["Ultimo checkpoint"] ?? "n/a"))}</div>
            </div>
            <div class="timeline">
              ${nowItems.map((item) => `<div class="timeline-item"><div class="timeline-dot"></div><div><strong>${renderInline(item)}</strong></div></div>`).join("")}
            </div>
          </article>
          <article class="panel">
            <div class="panel-head">
              <div>
                <div class="section-tag">gestao da semana</div>
                <div class="panel-title">Top 3 da Semana</div>
              </div>
            </div>
            <div class="section-grid two">
              ${topThree.map((item, index) => `<div class="mini-card"><div class="mini-label">prioridade ${index + 1}</div><div class="mini-value">${index + 1}</div><div class="panel-copy">${renderInline(item)}</div></div>`).join("")}
            </div>
          </article>
          <article class="panel">
            <div class="panel-head">
              <div>
                <div class="section-tag">produto</div>
                <div class="panel-title">Superficies</div>
              </div>
            </div>
            <div class="surface-grid">
              ${renderSurfaceCards(surfaces)}
            </div>
          </article>
          <article class="panel">
            <div class="panel-head">
              <div>
                <div class="section-tag">arquitetura operacional</div>
                <div class="panel-title">Componentes</div>
                <div class="panel-copy">Agrupados por tipo para reduzir leitura tecnica dispersa.</div>
              </div>
            </div>
            <div class="component-groups">
              ${renderComponentGroups(componentGroups)}
            </div>
          </article>
        </div>
        <div class="stack">
          <article class="panel">
            <div class="panel-head">
              <div>
                <div class="section-tag">autoridade</div>
                <div class="panel-title">Decisoes Pendentes</div>
              </div>
              <div class="status-chip ${decisions.length === 0 ? "status--active" : "status--warning"}">${decisions.length} abertas</div>
            </div>
            <div class="decision-stack">
              ${renderDecisionCards(decisions)}
            </div>
          </article>
          <article class="panel">
            <div class="panel-head">
              <div>
                <div class="section-tag">restricoes</div>
                <div class="panel-title">Bloqueios</div>
              </div>
              <div class="status-chip ${blockers.length === 0 ? "status--active" : "status--blocked"}">${blockers.length} ativos</div>
            </div>
            <div class="section-grid">
              ${renderEntryCards(blockers, "blocked")}
            </div>
          </article>
          <article class="panel">
            <div class="panel-head">
              <div>
                <div class="section-tag">riscos</div>
                <div class="panel-title">Riscos Atuais</div>
              </div>
            </div>
            <div class="section-grid">
              ${renderEntryCards(risks, "neutral")}
            </div>
          </article>
          <article class="panel">
            <div class="panel-head">
              <div>
                <div class="section-tag">evidencia</div>
                <div class="panel-title">Ultimas Evidencias</div>
              </div>
            </div>
            <div class="evidence-list">
              ${evidenceList.map(renderEvidenceCard).join("")}
            </div>
          </article>
        </div>
      </section>
      <section style="margin-top: 18px;">
        <article class="panel">
          <div class="panel-head">
            <div>
              <div class="section-tag">chairman rail</div>
              <div class="panel-title">Observacoes do Chairman</div>
              <div class="panel-copy">Feedback formal, resposta da IA lider e trilha de transformacao para acao.</div>
            </div>
          </div>
          <div class="chairman-board">
            ${observations.map(renderObservationCard).join("")}
          </div>
        </article>
      </section>
      <div class="footer">Fonte: ${escapeHtml(inputPath.replace(/\//g, "\\"))} | Renderizado em ${escapeHtml(outputPath.replace(/\//g, "\\"))}</div>
    </main>
    <script>
      (() => {
        const buttons = document.querySelectorAll("[data-copy]");
        for (const button of buttons) {
          button.addEventListener("click", async () => {
            const text = button.getAttribute("data-copy") ?? "";
            const feedback = button.parentElement?.querySelector("[data-copy-feedback]");
            let ok = false;
            try {
              if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                ok = true;
              }
            } catch {}
            if (!ok) {
              const probe = document.createElement("textarea");
              probe.value = text;
              probe.setAttribute("readonly", "true");
              probe.style.position = "fixed";
              probe.style.opacity = "0";
              document.body.appendChild(probe);
              probe.select();
              try {
                ok = document.execCommand("copy");
              } catch {
                ok = false;
              }
              document.body.removeChild(probe);
            }
            if (feedback) {
              feedback.textContent = ok ? "Comando copiado." : "Nao foi possivel copiar automaticamente.";
              window.setTimeout(() => {
                if (feedback.textContent === "Comando copiado." || feedback.textContent === "Nao foi possivel copiar automaticamente.") {
                  feedback.textContent = "";
                }
              }, 2200);
            }
          });
        }
      })();
    </script>
  </body>
</html>`;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, html, "utf8");
  console.log(`[OK] Collegium status rendered to ${outputPath.replace(/\//g, "\\")}`);
}

function firstHeading(source) {
  const match = source.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? null;
}

function parseSections(source) {
  const sections = new Map();
  const matches = [...source.matchAll(/^##\s+(.+)$/gm)];
  for (let index = 0; index < matches.length; index += 1) {
    const title = matches[index][1].trim();
    const start = matches[index].index + matches[index][0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : source.length;
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

function getCleanParagraph(section) {
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");
}

function groupComponents(table) {
  const groups = new Map();
  for (const row of table.rows) {
    const [component, type, status, source, nextStep] = row;
    if (!groups.has(type)) {
      groups.set(type, []);
    }
    groups.get(type).push({ component, type, status, source, nextStep });
  }
  return groups;
}

function countMatches(rows, columnIndex, pattern) {
  return rows.filter((row) => pattern.test(row[columnIndex] ?? "")).length;
}

function renderEntryCards(entries, defaultTone) {
  if (entries.length === 0) {
    return `<div class="entry-card"><strong>Sem itens abertos.</strong><p>Nenhuma acao requerida neste momento.</p></div>`;
  }
  return entries.map((entry) => {
    const fields = Object.entries(entry.fields)
      .map(([label, value]) => `<li><strong>${escapeHtml(label)}:</strong> ${renderInline(value)}</li>`)
      .join("");
    return `<article class="entry-card"><div class="surface-top"><strong>${escapeHtml(entry.title)}</strong><span class="status-chip ${statusClass(entry.fields.Status ?? entry.fields.Urgencia ?? defaultTone)}">${renderInline(defaultTone)}</span></div><ul>${fields}</ul></article>`;
  }).join("");
}

function renderAccessCards(entries) {
  if (entries.length === 0) {
    return `<article class="access-card"><div class="access-title">Sem acessos mapeados.</div><div class="panel-copy">Registre o centro operacional neste artefato antes de usar o painel como referência.</div></article>`;
  }
  return entries.map((entry) => {
    const environment = entry.fields["Ambiente"] ?? "n/a";
    const status = entry.fields["Status"] ?? "n/a";
    const doHere = entry.fields["Fazer aqui"] ?? "n/a";
    const dontHere = entry.fields["Nao fazer aqui"] ?? "n/a";
    const access = entry.fields["Acesso"] ?? "n/a";
    const command = entry.fields["Comando"] ?? "";
    const source = entry.fields["Fonte de verdade"] ?? "n/a";
    const accessHref = extractActionHref(access);
    const actions = [];

    if (accessHref) {
      actions.push(`<a class="action-link" href="${escapeHtml(accessHref)}" target="_blank" rel="noreferrer">Abrir acesso</a>`);
    }
    if (command) {
      actions.push(`<button type="button" class="action-link" data-copy="${escapeHtml(command.replace(/^`|`$/g, ""))}">Copiar comando</button>`);
    }

    return `<article class="access-card">
      <div class="access-top">
        <div>
          <div class="section-tag">acesso por intencao</div>
          <div class="access-title">${escapeHtml(entry.title)}</div>
        </div>
        <div class="access-badges">
          <span class="status-chip ${statusClass(environment)}">${renderInline(environment)}</span>
          <span class="status-chip ${statusClass(status)}">${renderInline(status)}</span>
        </div>
      </div>
      <div class="access-body">
        <div class="access-block">
          <div class="access-label">fazer aqui</div>
          <div class="panel-copy">${renderInline(doHere)}</div>
        </div>
        <div class="access-block">
          <div class="access-label">nao fazer aqui</div>
          <div class="panel-copy">${renderInline(dontHere)}</div>
        </div>
        <div class="access-block">
          <div class="access-label">acesso</div>
          <div class="panel-copy">${renderInline(access)}</div>
          ${command ? `<code class="access-command">${escapeHtml(command.replace(/^`|`$/g, ""))}</code>` : ""}
        </div>
        <div class="access-block">
          <div class="access-label">fonte de verdade</div>
          <div class="panel-copy">${renderInline(source)}</div>
        </div>
        ${actions.length > 0 ? `<div class="access-actions">${actions.join("")}</div><div class="copy-feedback" data-copy-feedback></div>` : ""}
      </div>
    </article>`;
  }).join("");
}

function renderDecisionCards(entries) {
  if (entries.length === 0) {
    return `<div class="decision-card"><div class="decision-index"><div><div class="decision-label">fila</div><div class="decision-number">0</div></div></div><div class="decision-body"><div class="decision-title">Sem decisoes abertas.</div><div class="decision-impact">A frente segue sem dependencia imediata de arbitragem humana.</div></div></div>`;
  }
  return entries.map((entry, index) => {
    const impact = entry.fields.Impacto ?? "Sem impacto declarado.";
    const urgency = entry.fields.Urgencia ?? "n/a";
    const owner = entry.fields.Dono ?? "n/a";
    return `<article class="decision-card">
      <div class="decision-index">
        <div>
          <div class="decision-label">decisao</div>
          <div class="decision-number">${index + 1}</div>
        </div>
        <span class="status-chip ${statusClass(urgency)}">${renderInline(urgency)}</span>
      </div>
      <div class="decision-body">
        <div class="decision-head">
          <h3 class="decision-title">${escapeHtml(entry.title)}</h3>
          <div class="decision-meta">
            <span class="status-chip ${statusClass(owner)}">${renderInline(owner)}</span>
          </div>
        </div>
        <div class="decision-impact"><strong>Impacto:</strong> ${renderInline(impact)}</div>
        <div class="decision-fields">
          <div class="decision-field">
            <div class="decision-field-label">Urgencia</div>
            <div class="decision-field-value">${renderInline(urgency)}</div>
          </div>
          <div class="decision-field">
            <div class="decision-field-label">Dono</div>
            <div class="decision-field-value">${renderInline(owner)}</div>
          </div>
        </div>
      </div>
    </article>`;
  }).join("");
}

function renderSurfaceCards(table) {
  if (table.rows.length === 0) {
    return `<div class="surface-card"><strong>Sem superficies mapeadas.</strong></div>`;
  }
  return table.rows.map(([surface, status, realData, dependency, maturity]) => `<article class="surface-card"><div class="surface-top"><div class="surface-title">${escapeHtml(surface)}</div><span class="status-chip ${statusClass(status)}">${renderInline(status)}</span></div><div class="surface-meta"><span class="status-chip ${statusClass(realData)}">dados ${renderInline(realData)}</span><span class="status-chip ${statusClass(maturity)}">${renderInline(maturity)}</span></div><div class="panel-copy" style="margin-top: 12px;"><strong>Dependencia:</strong> ${renderInline(dependency)}</div></article>`).join("");
}

function renderComponentGroups(groups) {
  return [...groups.entries()].map(([group, items]) => `<section class="component-group"><div class="section-tag">${escapeHtml(group)}</div><div class="component-list">${items.map((item) => `<article class="component-card"><div class="component-top"><div class="component-title">${escapeHtml(item.component)}</div><span class="status-chip ${statusClass(item.status)}">${renderInline(item.status)}</span></div><div class="panel-copy"><strong>Fonte:</strong> ${renderInline(item.source)}</div><div class="panel-copy" style="margin-top: 10px;"><strong>Proximo passo:</strong> ${renderInline(item.nextStep)}</div></article>`).join("")}</div></section>`).join("");
}

function renderEvidenceCard(item) {
  return `<div class="evidence-item"><div><div class="surface-title">${escapeHtml(item.label)}</div><div class="panel-copy">${escapeHtml(item.href)}</div></div><a href="${escapeHtml(item.href)}">abrir</a></div>`;
}

function renderObservationCard(observation) {
  const data = observation.fields.Data ?? "n/a";
  const type = observation.fields.Tipo ?? "n/a";
  const status = observation.fields.Status ?? "n/a";
  const text = observation.fields.Texto ?? "Sem texto.";
  const impact = observation.fields["Impacto esperado"] ?? "Sem impacto declarado.";
  const response = Object.entries(observation.response)
    .map(([label, value]) => `<div><strong>${escapeHtml(label)}:</strong> ${renderInline(value)}</div>`)
    .join("");
  return `<article class="observation-card"><div class="obs-top"><div class="component-title">${escapeHtml(observation.id)}</div><div class="obs-meta"><span class="status-chip ${statusClass(type)}">${renderInline(type)}</span><span class="status-chip ${statusClass(status)}">${renderInline(status)}</span><span class="status-chip status--muted">${escapeHtml(data)}</span></div></div><div class="observation-copy"><div class="panel-copy"><strong>Texto:</strong> ${renderInline(text)}</div><div class="observation-impact panel-copy"><strong>Impacto esperado:</strong> ${renderInline(impact)}</div></div>${response ? `<div class="response"><div class="response-tag">resposta da IA lider</div>${response}</div>` : ""}</article>`;
}

function renderInline(value) {
  return md.renderInline(value ?? "");
}

function extractActionHref(value) {
  if (!value) {
    return "";
  }

  const link = /\[[^\]]+\]\(([^)]+)\)/.exec(String(value));
  if (link?.[1]) {
    return link[1].trim();
  }

  const cleaned = String(value).trim().replace(/^`|`$/g, "");
  if (/^(https?|file):/i.test(cleaned)) {
    return cleaned;
  }
  if (/^[A-Za-z]:(\\\\|\/)/.test(cleaned)) {
    return windowsPathToFileHref(cleaned);
  }
  return "";
}

function extractDate(value) {
  const match = String(value).match(/\d{4}-\d{2}-\d{2}/);
  return match?.[0] ?? value;
}

function statusClass(value) {
  const normalized = normalize(value);
  if (normalized.includes("ativo") || normalized === "sim" || normalized.includes("operacional") || normalized.includes("resolvida") || normalized.includes("resolvido")) {
    return "status--active";
  }
  if (normalized.includes("parcial") || normalized.includes("consolidacao") || normalized.includes("media") || normalized.includes("em_acao") || normalized.includes("em acao") || normalized.includes("lida")) {
    return "status--warning";
  }
  if (normalized.includes("bloque") || normalized.includes("alta") || normalized.includes("erro") || normalized.includes("veto")) {
    return "status--blocked";
  }
  if (normalized.includes("lab") || normalized.includes("local") || normalized.includes("vault") || normalized.includes("prod") || normalized.includes("separado") || normalized.includes("experimental") || normalized.includes("provisorio") || normalized.includes("provis") || normalized.includes("direcao") || normalized.includes("duvida") || normalized.includes("prioridade") || normalized.includes("nova") || normalized === "nao") {
    return "status--neutral";
  }
  return "status--muted";
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

function relativeFileHref(fromPath, targetPath) {
  return path.relative(path.dirname(fromPath), targetPath).split(path.sep).join("/");
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function windowsPathToFileHref(value) {
  const normalized = String(value).replace(/\\\\/g, "/").replace(/\\/g, "/");
  const parts = normalized.split("/");
  return `file:///${parts.map((part, index) => (index === 0 ? part : encodeURIComponent(part))).join("/")}`;
}

function shorten(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1).trim()}...`;
}

async function loadStatusData(requestedInputPath) {
  const effectiveInputPath = await resolveStatusInputPath(requestedInputPath);
  const source = await fs.readFile(effectiveInputPath, "utf8");

  if (effectiveInputPath.toLowerCase().endsWith(".json")) {
    const snapshot = JSON.parse(source);
    await validateSnapshotJson(snapshot);
    return buildStatusDataFromJson(snapshot);
  }

  return buildStatusDataFromMarkdown(source);
}

async function resolveStatusInputPath(requestedInputPath) {
  if (requestedInputPath !== defaultInput) {
    return requestedInputPath;
  }

  if (await fileExists(defaultSnapshotInput)) {
    return defaultSnapshotInput;
  }

  return requestedInputPath;
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function validateSnapshotJson(snapshot) {
  const schemaSource = await fs.readFile(defaultSchemaPath, "utf8");
  const schema = JSON.parse(schemaSource);
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
  });
  const validate = ajv.compile(schema);
  const valid = validate(snapshot);

  if (valid) {
    return;
  }

  const details = (validate.errors ?? [])
    .map((error) => `${error.instancePath || "/"} ${error.message ?? "validation error"}`)
    .join("; ");
  throw new Error(`Snapshot schema validation failed: ${details}`);
}

function buildStatusDataFromMarkdown(source) {
  const sections = parseSections(source);
  return {
    title: firstHeading(source) ?? "Collegium Cortex Implantation Status",
    stateFields: parseFieldList(sections.get("Estado Atual") ?? ""),
    scopeHtml: md.render(sections.get("Escopo") ?? ""),
    nowItems: parseList(sections.get("Agora") ?? ""),
    nextActionText: getCleanParagraph(sections.get("Proxima Acao Dominante") ?? ""),
    topThree: parseList(sections.get("Top 3 da Semana") ?? ""),
    operations: parseEntries(sections.get("Centro Operacional") ?? ""),
    blockers: parseEntries(sections.get("Bloqueios") ?? ""),
    decisions: parseEntries(sections.get("Decisoes Pendentes") ?? ""),
    risks: parseEntries(sections.get("Riscos Atuais") ?? ""),
    surfaces: parseMarkdownTable(sections.get("Superficies do Produto") ?? ""),
    components: parseMarkdownTable(sections.get("Componentes de Implantacao") ?? ""),
    evidenceList: parseMarkdownLinks(sections.get("Ultimas Evidencias") ?? ""),
    observations: parseObservations(sections.get("Observacoes do Chairman") ?? ""),
    updatedAt: new Date().toLocaleString("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    summarySignals: [],
  };
}

function buildStatusDataFromJson(json) {
  const generalState = json.generalState ?? {};

  return {
    title: json.meta?.title ?? "Collegium Cortex Implantation Status",
    stateFields: {
      "Branch ativa": generalState.branch ?? "n/a",
      "Frente ativa": generalState.activeFront ?? "n/a",
      "Status geral": generalState.overallStatus ?? json.meta?.statusSignal ?? "n/a",
      "Ultimo checkpoint": generalState.lastCheckpoint ?? json.meta?.lastUpdated ?? "n/a",
    },
    scopeHtml: renderScopeFromJson(json.meta?.scope ?? {}),
    nowItems: (json.now ?? []).map((item) => item.summary ?? item.title ?? String(item)),
    nextActionText: json.nextDominantAction?.title ?? json.nextDominantAction?.summary ?? "Sem acao dominante declarada.",
    topThree: (json.weeklyTop3 ?? []).map((item) => item.summary ?? item.title ?? String(item)),
    operations: (json.operations ?? []).map((item) => ({
      title: item.title,
      fields: {
        Ambiente: item.environmentScope ?? item.environment ?? "n/a",
        Status: item.status ?? "n/a",
        "Fazer aqui": item.doHere ?? item.summary ?? "n/a",
        "Nao fazer aqui": item.dontHere ?? item.doNotDoHere ?? "n/a",
        Acesso: item.access ?? "n/a",
        Comando: item.command ?? "",
        Preflight: item.preflight ?? "",
        "Fonte de verdade": item.sourceOfTruth ?? item.source ?? "n/a",
      },
    })),
    blockers: (json.blockers ?? []).map((item) => ({
      title: item.title,
      fields: {
        ID: item.id ?? "n/a",
        Status: item.status ?? "n/a",
        Efeito: item.effect ?? item.summary ?? "n/a",
        Dependencia: item.dependency ?? "n/a",
        "Decisao humana": booleanToPt(item.needsHumanDecision),
        Dono: item.owner ?? "n/a",
        "Ultima atualizacao": item.lastUpdated ?? json.meta?.lastUpdated ?? "n/a",
      },
    })),
    decisions: (json.pendingDecisions ?? []).map((item) => ({
      title: item.title,
      fields: {
        ID: item.id ?? "n/a",
        Impacto: item.impact ?? item.summary ?? "n/a",
        Urgencia: item.urgency ?? item.status ?? "n/a",
        Dono: item.owner ?? "n/a",
      },
    })),
    risks: (json.risks ?? []).map((item) => ({
      title: item.title,
      fields: {
        ID: item.id ?? "n/a",
        Status: item.status ?? "n/a",
        Efeito: item.effect ?? item.summary ?? "n/a",
        Mitigacao: item.mitigation ?? "n/a",
      },
    })),
    surfaces: {
      headers: ["superficie", "status", "usa dado real?", "dependencia", "maturidade"],
      rows: (json.surfaces ?? []).map((item) => [
        item.name ?? "n/a",
        item.status ?? "n/a",
        item.realData ?? "n/a",
        item.dependency ?? "n/a",
        item.maturity ?? "n/a",
      ]),
    },
    components: {
      headers: ["componente", "tipo", "status", "fonte", "next_step"],
      rows: (json.components ?? []).map((item) => [
        item.name ?? "n/a",
        item.componentType ?? "n/a",
        item.status ?? "n/a",
        item.source ?? "n/a",
        item.nextStep ?? "n/a",
      ]),
    },
    evidenceList: (json.evidence ?? []).map((item) => ({
      label: item.label ?? "n/a",
      href: item.href ?? "#",
    })),
    observations: (json.chairmanObservations ?? []).map((item) => ({
      id: item.id ?? "n/a",
      fields: {
        Data: item.date ?? "n/a",
        Tipo: item.type ?? "n/a",
        Texto: item.text ?? "n/a",
        "Impacto esperado": item.expectedImpact ?? "n/a",
        Status: item.status ?? "n/a",
      },
      response: {
        Leitura: item.response?.reading ?? "n/a",
        Impacto: item.response?.impact ?? "n/a",
        "Acao adotada": item.response?.actionTaken ?? "n/a",
        "Precisa decisao humana": booleanToPt(item.response?.needsHumanDecision),
      },
    })),
    updatedAt: formatUpdatedAt(json.meta?.lastUpdated),
    summarySignals: (json.summarySignals ?? []).map((item) => ({
      label: item.label ?? "n/a",
      value: item.value ?? "n/a",
      status: item.status ?? "n/a",
      summary: item.summary ?? "",
    })),
  };
}

function renderScopeFromJson(scope) {
  const parts = [];
  if (scope.covers?.length) {
    parts.push("### Cobre");
    for (const item of scope.covers) {
      parts.push(`- ${item}`);
    }
  }
  if (scope.doesNotCover?.length) {
    parts.push("### Nao cobre");
    for (const item of scope.doesNotCover) {
      parts.push(`- ${item}`);
    }
  }
  if (scope.distinction?.length) {
    parts.push("### Distincao");
    for (const item of scope.distinction) {
      parts.push(`- ${item}`);
    }
  }
  return md.render(parts.join("\n"));
}

function renderSignalCards(items) {
  return items
    .map(
      (item) => `<article class="signal-card">
        <div class="mini-label">${escapeHtml(item.label)}</div>
        <div class="signal-value">${renderInline(String(item.value ?? "n/a"))}</div>
        <div class="status-chip ${statusClass(item.status)}">${renderInline(item.status ?? "n/a")}</div>
        <div class="signal-copy">${renderInline(item.summary ?? "")}</div>
      </article>`,
    )
    .join("");
}

function booleanToPt(value) {
  if (value === true) {
    return "sim";
  }
  if (value === false) {
    return "nao";
  }
  return "n/a";
}

function formatUpdatedAt(value) {
  if (!value) {
    return new Date().toLocaleString("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleString("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
