import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadSessionState,
  loadRules,
  readStdin,
  recordValidatedSkill,
} from "./lib/guardrail-state.mjs";

const __filename = fileURLToPath(import.meta.url);

export function matchesPrompt(prompt, rule) {
  const promptLower = prompt.toLowerCase();
  const keywords = rule?.promptTriggers?.keywords ?? [];
  const intentPatterns = rule?.promptTriggers?.intentPatterns ?? [];

  const keywordMatches = keywords.some((keyword) =>
    promptLower.includes(String(keyword).toLowerCase()),
  );

  const patternMatches = intentPatterns.some((pattern) => {
    try {
      return new RegExp(pattern, "i").test(prompt);
    } catch {
      return false;
    }
  });

  return keywordMatches || patternMatches;
}

function priorityRank(priority) {
  switch (priority) {
    case "critical":
      return 0;
    case "high":
      return 1;
    case "medium":
      return 2;
    case "low":
      return 3;
    default:
      return 4;
  }
}

function parseAckBody(body) {
  const ack = {};
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }
    const separatorIndex = line.indexOf(":");
    if (separatorIndex <= 0) {
      continue;
    }
    const field = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (!field || !value) {
      continue;
    }
    ack[field] = value;
  }
  return ack;
}

export function parseGuardrailAckBlocks(prompt) {
  const blocks = [];
  const pattern = /\[guardrail:([a-z0-9-]+)\]([\s\S]*?)\[\/guardrail\]/gi;
  for (const match of prompt.matchAll(pattern)) {
    const skillName = match[1]?.trim();
    if (!skillName) {
      continue;
    }
    blocks.push({
      skillName,
      ack: parseAckBody(match[2] ?? ""),
    });
  }
  return blocks;
}

export function validateGuardrailAck(rule, ack) {
  const requiredFields = rule?.ack?.requiredFields ?? [];
  const missingFields = requiredFields.filter((field) => {
    const value = ack?.[field];
    return typeof value !== "string" || !value.trim();
  });
  return {
    requiredFields,
    missingFields,
    valid: missingFields.length === 0,
  };
}

function buildAdditionalContext(skillNames, ackNotes) {
  const lines = [];

  if (skillNames.length > 0) {
    lines.push(
      "COLLEGIUM SKILL ACTIVATION CHECK",
      "Recommended local skills for this prompt:",
      ...skillNames.map((name) => `- ${name}`),
      "Use the relevant project-local skills before responding or editing when they apply.",
    );
  }

  if (ackNotes.length > 0) {
    if (lines.length > 0) {
      lines.push("");
    }
    lines.push("Guardrail acknowledgement notes:", ...ackNotes.map((note) => `- ${note}`));
  }

  return lines.length > 0 ? lines.join("\n") : null;
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

  const prompt = typeof input.prompt === "string" ? input.prompt : "";
  if (!prompt.trim()) {
    process.exit(0);
  }

  const sessionId = typeof input.session_id === "string" ? input.session_id : "default";
  loadSessionState(sessionId, { persistPruned: true });
  const rules = loadRules();
  const matches = Object.entries(rules.skills ?? {})
    .filter(([, rule]) => matchesPrompt(prompt, rule))
    .toSorted(([, left], [, right]) => priorityRank(left.priority) - priorityRank(right.priority))
    .map(([name]) => name);

  const ackNotes = [];
  for (const block of parseGuardrailAckBlocks(prompt)) {
    const rule = rules.skills?.[block.skillName];
    if (!rule || rule.type !== "guardrail" || rule.enforcement !== "block" || !rule.ack) {
      continue;
    }

    const validation = validateGuardrailAck(rule, block.ack);
    if (!validation.valid) {
      ackNotes.push(
        `${block.skillName} ack ignored; missing: ${validation.missingFields.join(", ")}`,
      );
      continue;
    }

    recordValidatedSkill(sessionId, block.skillName, block.ack, rule.ack.ttlMinutes ?? 10);
  }

  const additionalContext = buildAdditionalContext(matches, ackNotes);
  if (!additionalContext) {
    process.exit(0);
  }

  const payload = {
    suppressOutput: true,
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext,
    },
  };

  process.stdout.write(JSON.stringify(payload));
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch(() => {
    process.exit(0);
  });
}
