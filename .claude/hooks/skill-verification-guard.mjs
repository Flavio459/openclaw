import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getValidatedSkill,
  loadRules,
  loadSessionState,
  readStdin,
} from "./lib/guardrail-state.mjs";

const __filename = fileURLToPath(import.meta.url);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function globToRegex(glob) {
  let regex = escapeRegex(glob);
  regex = regex.replace(/\\\*\\\*/g, ".*");
  regex = regex.replace(/\\\*/g, "[^/]*");
  regex = regex.replace(/\\\?/g, ".");
  return new RegExp(`^${regex}$`, "i");
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/");
}

function fileContainsAnyMarker(filePath, markers) {
  if (!markers?.length || !fs.existsSync(filePath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    return markers.some((marker) => content.includes(marker));
  } catch {
    return false;
  }
}

export function matchesFileRule(relativePath, rule) {
  const fileTriggers = rule?.fileTriggers;
  if (!fileTriggers?.pathPatterns?.length) {
    return false;
  }

  const included = fileTriggers.pathPatterns.some((pattern) =>
    globToRegex(normalizePath(pattern)).test(relativePath),
  );
  if (!included) {
    return false;
  }

  const excluded = (fileTriggers.pathExclusions ?? []).some((pattern) =>
    globToRegex(normalizePath(pattern)).test(relativePath),
  );

  return !excluded;
}

function buildBlockMessage(relativePath, missingGuardrails) {
  const lines = [
    `⚠️ BLOCKED - Guardrail acknowledgement required for ${relativePath}`,
    "",
    "Missing guardrails:",
  ];

  for (const entry of missingGuardrails) {
    lines.push(`- ${entry.skillName}`);
    if (entry.helpLabel) {
      lines.push(`  help: ${entry.helpLabel}`);
    }
    lines.push(`  required fields: ${entry.requiredFields.join(", ")}`);
  }

  lines.push("", "Add one block per missing guardrail before retrying.");
  for (const entry of missingGuardrails) {
    lines.push(
      "",
      `[guardrail:${entry.skillName}]`,
      ...entry.requiredFields.map((field) => `${field}: ...`),
      "[/guardrail]",
    );
  }

  const bypasses = [];
  const envOverrides = missingGuardrails.flatMap((entry) =>
    typeof entry.envOverride === "string" && entry.envOverride.length > 0
      ? [entry.envOverride]
      : [],
  );
  if (missingGuardrails.some((entry) => entry.fileMarkers.length > 0)) {
    bypasses.push("- add @skip-validation to the file");
  }
  for (const envOverride of new Set(envOverrides)) {
    bypasses.push(`- set ${String(envOverride)}=1`);
  }
  if (bypasses.length > 0) {
    lines.push("", "Explicit bypasses:", ...bypasses);
  }

  return lines.join("\n");
}

export async function main() {
  const rawInput = await readStdin();
  if (!rawInput.trim()) {
    process.exit(0);
  }

  let input;
  try {
    input = JSON.parse(rawInput);
  } catch {
    process.exit(0);
  }

  const toolName = input.tool_name ?? "";
  if (!["Edit", "Write", "MultiEdit"].includes(toolName)) {
    process.exit(0);
  }

  const cwd = input.cwd || process.cwd();
  const filePath = input.tool_input?.file_path;
  if (typeof filePath !== "string" || !filePath.trim()) {
    process.exit(0);
  }

  const relativePath = normalizePath(path.relative(cwd, filePath));
  const rules = loadRules();
  const sessionId = input.session_id || "default";
  const { data: sessionState } = loadSessionState(sessionId, { persistPruned: false });
  const now = Date.now();

  const missingGuardrails = [];
  for (const [skillName, rule] of Object.entries(rules.skills ?? {})) {
    if (rule.enforcement !== "block" || rule.type !== "guardrail") {
      continue;
    }
    if (!matchesFileRule(relativePath, rule)) {
      continue;
    }

    const skipConditions = rule.skipConditions ?? {};
    if (skipConditions.envOverride && process.env[skipConditions.envOverride]) {
      continue;
    }
    if (fileContainsAnyMarker(filePath, skipConditions.fileMarkers ?? [])) {
      continue;
    }
    if (getValidatedSkill(sessionState, skillName, now)) {
      continue;
    }

    missingGuardrails.push({
      skillName,
      requiredFields: rule.ack?.requiredFields ?? [],
      helpLabel: rule.ack?.helpLabel ?? null,
      envOverride: skipConditions.envOverride ?? null,
      fileMarkers: skipConditions.fileMarkers ?? [],
    });
  }

  if (missingGuardrails.length === 0) {
    process.exit(0);
  }

  process.stderr.write(buildBlockMessage(relativePath, missingGuardrails));
  process.exit(2);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch(() => {
    process.exit(0);
  });
}
