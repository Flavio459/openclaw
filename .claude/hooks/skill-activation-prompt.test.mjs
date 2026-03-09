import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const hookPath = path.join(__dirname, "skill-activation-prompt.mjs");

function makeStateDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-guardrail-state-"));
}

function runHook({ prompt, sessionId = "test-session", stateDir }) {
  return spawnSync(process.execPath, [hookPath], {
    encoding: "utf8",
    env: {
      ...process.env,
      OPENCLAW_GUARDRAIL_STATE_DIR: stateDir,
    },
    input: JSON.stringify({ session_id: sessionId, prompt }),
  });
}

function readState(stateDir, sessionId = "test-session") {
  const filePath = path.join(stateDir, `skills-used-${sessionId}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

void test("ignores unrelated prompts", () => {
  const stateDir = makeStateDir();
  try {
    const result = runHook({ prompt: "hello world", stateDir });
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), "");
  } finally {
    fs.rmSync(stateDir, { recursive: true, force: true });
  }
});

void test("keeps skill suggestions for matching prompts", () => {
  const stateDir = makeStateDir();
  try {
    const result = runHook({ prompt: "Update The Forum decision flow", stateDir });
    assert.equal(result.status, 0);
    const payload = JSON.parse(result.stdout);
    assert.match(payload.hookSpecificOutput.additionalContext, /forum-deliberation/);
  } finally {
    fs.rmSync(stateDir, { recursive: true, force: true });
  }
});

void test("records validated guardrail ack blocks with ttl", () => {
  const stateDir = makeStateDir();
  try {
    const result = runHook({
      prompt: `[guardrail:protocol-defensability]\neconomic_activity: fleet mobility operations\nrule: keep protocol claims tied to real dispatch activity\nevidence: board decision memo\nreview_path: chairman -> legal -> ceo\nrisk: investor narrative drift\n[/guardrail]`,
      stateDir,
    });

    assert.equal(result.status, 0);
    if (result.stdout.trim()) {
      const payload = JSON.parse(result.stdout);
      assert.match(payload.hookSpecificOutput.additionalContext, /forum-deliberation/);
    }

    const state = readState(stateDir);
    assert.ok(state);
    const validation = state.validated_skills["protocol-defensability"];
    assert.ok(validation);
    assert.equal(validation.ack.rule, "keep protocol claims tied to real dispatch activity");
    assert.ok(validation.expiresAtMs > validation.validatedAtMs);
  } finally {
    fs.rmSync(stateDir, { recursive: true, force: true });
  }
});

void test("ignores incomplete guardrail ack blocks", () => {
  const stateDir = makeStateDir();
  try {
    const result = runHook({
      prompt: `[guardrail:protocol-defensability]\neconomic_activity: fleet mobility operations\nrule: keep protocol claims tied to real dispatch activity\nreview_path: chairman -> legal -> ceo\nrisk: investor narrative drift\n[/guardrail]`,
      stateDir,
    });

    assert.equal(result.status, 0);
    const payload = JSON.parse(result.stdout);
    assert.match(payload.hookSpecificOutput.additionalContext, /missing: evidence/);
    const state = readState(stateDir);
    assert.ok(!state || !state.validated_skills["protocol-defensability"]);
  } finally {
    fs.rmSync(stateDir, { recursive: true, force: true });
  }
});
