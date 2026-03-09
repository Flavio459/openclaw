import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const activationHookPath = path.join(__dirname, "skill-activation-prompt.mjs");
const verificationHookPath = path.join(__dirname, "skill-verification-guard.mjs");

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writeWorkspaceFile(workspaceDir, relativePath, content = "placeholder") {
  const filePath = path.join(workspaceDir, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  return filePath;
}

function runActivation({ prompt, sessionId = "test-session", stateDir }) {
  return spawnSync(process.execPath, [activationHookPath], {
    encoding: "utf8",
    env: {
      ...process.env,
      OPENCLAW_GUARDRAIL_STATE_DIR: stateDir,
    },
    input: JSON.stringify({ session_id: sessionId, prompt }),
  });
}

function runVerification({
  workspaceDir,
  relativePath,
  sessionId = "test-session",
  stateDir,
  env = {},
}) {
  return spawnSync(process.execPath, [verificationHookPath], {
    encoding: "utf8",
    env: {
      ...process.env,
      OPENCLAW_GUARDRAIL_STATE_DIR: stateDir,
      ...env,
    },
    input: JSON.stringify({
      session_id: sessionId,
      tool_name: "Edit",
      cwd: workspaceDir,
      tool_input: {
        file_path: path.join(workspaceDir, relativePath),
      },
    }),
  });
}

function readState(stateDir, sessionId = "test-session") {
  const filePath = path.join(stateDir, `skills-used-${sessionId}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

void test("blocked attempts do not create their own unlock state", () => {
  const stateDir = makeTempDir("openclaw-guardrail-state-");
  const workspaceDir = makeTempDir("openclaw-guardrail-workspace-");
  try {
    const relativePath = "scripts/pema/CONTEXTO_OPERACIONAL_AGENTES.md";
    writeWorkspaceFile(workspaceDir, relativePath, "context doc\n");

    const first = runVerification({ workspaceDir, relativePath, stateDir });
    const second = runVerification({ workspaceDir, relativePath, stateDir });

    assert.equal(first.status, 2);
    assert.equal(second.status, 2);

    const state = readState(stateDir);
    assert.ok(!state || Object.keys(state.validated_skills ?? {}).length === 0);
  } finally {
    fs.rmSync(stateDir, { recursive: true, force: true });
    fs.rmSync(workspaceDir, { recursive: true, force: true });
  }
});

void test("single-skill files require a valid ack", () => {
  const stateDir = makeTempDir("openclaw-guardrail-state-");
  const workspaceDir = makeTempDir("openclaw-guardrail-workspace-");
  try {
    const relativePath = "scripts/pema/CONTEXTO_OPERACIONAL_AGENTES.md";
    writeWorkspaceFile(workspaceDir, relativePath, "context doc\n");

    runActivation({
      stateDir,
      prompt: `[guardrail:protocol-defensability]\neconomic_activity: fleet mobility operations\nrule: tie every protocol claim to real dispatch activity\nevidence: board packet\nreview_path: chairman -> legal -> ceo\nrisk: regulatory narrative drift\n[/guardrail]`,
    });

    const result = runVerification({ workspaceDir, relativePath, stateDir });
    assert.equal(result.status, 0);
  } finally {
    fs.rmSync(stateDir, { recursive: true, force: true });
    fs.rmSync(workspaceDir, { recursive: true, force: true });
  }
});

void test("files with multiple guardrails require all acknowledgements", () => {
  const stateDir = makeTempDir("openclaw-guardrail-state-");
  const workspaceDir = makeTempDir("openclaw-guardrail-workspace-");
  try {
    const relativePath = "ui/src/ui/views/forum.ts";
    writeWorkspaceFile(workspaceDir, relativePath, "export const forum = true;\n");

    runActivation({
      stateDir,
      prompt: `[guardrail:surface-separation]\nsurface: The Forum\nis: strategic deliberation surface\nis_not: runtime cockpit\n[/guardrail]`,
    });

    const blocked = runVerification({ workspaceDir, relativePath, stateDir });
    assert.equal(blocked.status, 2);
    assert.match(blocked.stderr, /forum-deliberation/);

    runActivation({
      stateDir,
      prompt: `[guardrail:forum-deliberation]\ntopic: authority review\ncontext: pending fleet decision\nparticipants: chairman, ceo, legal\nevidence: approval queue\noptions: approve, reject\nrisks: wrong escalation\nrecommended_path: review in forum first\nchairman_action: approve or reject\n[/guardrail]`,
    });

    const allowed = runVerification({ workspaceDir, relativePath, stateDir });
    assert.equal(allowed.status, 0);
  } finally {
    fs.rmSync(stateDir, { recursive: true, force: true });
    fs.rmSync(workspaceDir, { recursive: true, force: true });
  }
});

void test("expired validations stop allowing edits", () => {
  const stateDir = makeTempDir("openclaw-guardrail-state-");
  const workspaceDir = makeTempDir("openclaw-guardrail-workspace-");
  try {
    const relativePath = "scripts/pema/CONTEXTO_OPERACIONAL_AGENTES.md";
    writeWorkspaceFile(workspaceDir, relativePath, "context doc\n");

    runActivation({
      stateDir,
      prompt: `[guardrail:protocol-defensability]\neconomic_activity: fleet mobility operations\nrule: tie every protocol claim to real dispatch activity\nevidence: board packet\nreview_path: chairman -> legal -> ceo\nrisk: regulatory narrative drift\n[/guardrail]`,
    });

    const stateFile = path.join(stateDir, "skills-used-test-session.json");
    const state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
    state.validated_skills["protocol-defensability"].expiresAtMs = Date.now() - 1;
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

    const result = runVerification({ workspaceDir, relativePath, stateDir });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /protocol-defensability/);
  } finally {
    fs.rmSync(stateDir, { recursive: true, force: true });
    fs.rmSync(workspaceDir, { recursive: true, force: true });
  }
});

void test("@skip-validation bypasses the guardrail", () => {
  const stateDir = makeTempDir("openclaw-guardrail-state-");
  const workspaceDir = makeTempDir("openclaw-guardrail-workspace-");
  try {
    const relativePath = "scripts/pema/CONTEXTO_OPERACIONAL_AGENTES.md";
    writeWorkspaceFile(workspaceDir, relativePath, "@skip-validation\ncontext doc\n");

    const result = runVerification({ workspaceDir, relativePath, stateDir });
    assert.equal(result.status, 0);
  } finally {
    fs.rmSync(stateDir, { recursive: true, force: true });
    fs.rmSync(workspaceDir, { recursive: true, force: true });
  }
});

void test("env overrides bypass the guardrail", () => {
  const stateDir = makeTempDir("openclaw-guardrail-state-");
  const workspaceDir = makeTempDir("openclaw-guardrail-workspace-");
  try {
    const relativePath = "scripts/pema/CONTEXTO_OPERACIONAL_AGENTES.md";
    writeWorkspaceFile(workspaceDir, relativePath, "context doc\n");

    const result = runVerification({
      workspaceDir,
      relativePath,
      stateDir,
      env: { SKIP_PROTOCOL_DEFENSABILITY_GUARD: "1" },
    });

    assert.equal(result.status, 0);
  } finally {
    fs.rmSync(stateDir, { recursive: true, force: true });
    fs.rmSync(workspaceDir, { recursive: true, force: true });
  }
});
