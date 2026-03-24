#!/usr/bin/env node

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const activationHook = path.join(rootDir, ".claude", "hooks", "skill-activation-prompt.mjs");
const verificationHook = path.join(rootDir, ".claude", "hooks", "skill-verification-guard.mjs");
const stateDir = path.join(rootDir, ".claude", "hooks", "state");
const forumFile = path.join(rootDir, "ui", "src", "ui", "views", "exec-approval.ts");

function runHook(scriptPath, input, extraEnv = {}) {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: rootDir,
    encoding: "utf8",
    input: JSON.stringify(input),
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  if (result.error) {
    throw result.error;
  }

  return result;
}

function parseJsonOutput(output, label) {
  const trimmed = output.trim();
  assert.ok(trimmed, `${label} did not emit any output`);

  try {
    return JSON.parse(trimmed);
  } catch (err) {
    throw new Error(`${label} did not emit valid JSON: ${trimmed}`);
  }
}

function testActivationHook() {
  const result = runHook(activationHook, {
    prompt: "Please explain Collegium Cortex governance and The Forum.",
  });

  assert.equal(result.status, 0, "skill activation hook should exit cleanly");
  assert.equal(result.stderr.trim(), "", "skill activation hook should not write to stderr");

  const payload = parseJsonOutput(result.stdout, "skill activation hook");
  assert.equal(payload.suppressOutput, true);
  assert.equal(payload.hookSpecificOutput?.hookEventName, "UserPromptSubmit");

  const context = String(payload.hookSpecificOutput?.additionalContext ?? "");
  assert.match(context, /COLLEGIUM SKILL ACTIVATION CHECK/);
  assert.match(context, /- collegium-context/);
  assert.match(context, /- forum-deliberation/);
}

function testVerificationGuard() {
  const sessionId = `claude-hook-test-${randomUUID()}`;
  const stateFile = path.join(stateDir, `skills-used-${sessionId}.json`);

  try {
    const first = runHook(verificationHook, {
      tool_name: "Edit",
      cwd: rootDir,
      tool_input: {
        file_path: forumFile,
      },
      session_id: sessionId,
    });

    assert.equal(first.status, 2, "guard should block the first edit attempt");
    assert.match(
      first.stderr,
      /Forum Deliberation Structure Required/,
      "guard should explain why the edit is blocked",
    );
    assert.match(
      first.stderr,
      /ui[\\/]+src[\\/]+ui[\\/]+views[\\/]+exec-approval\.ts/,
      "guard should mention the relative file path",
    );
    assert.ok(existsSync(stateFile), "guard should persist session state after blocking");

    const second = runHook(verificationHook, {
      tool_name: "Edit",
      cwd: rootDir,
      tool_input: {
        file_path: forumFile,
      },
      session_id: sessionId,
    });

    assert.equal(second.status, 0, "guard should allow the second attempt for the same session");
    assert.equal(second.stderr.trim(), "", "allowed edit should not emit an error");
  } finally {
    rmSync(stateFile, { force: true });
  }
}

function main() {
  testActivationHook();
  testVerificationGuard();
  console.log("Claude hook validation passed.");
}

main();
