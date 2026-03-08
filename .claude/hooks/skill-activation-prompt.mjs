import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const claudeDir = path.resolve(__dirname, "..");
const rulesPath = path.join(claudeDir, "skills", "skill-rules.json");

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

function loadRules() {
  try {
    return JSON.parse(fs.readFileSync(rulesPath, "utf8"));
  } catch {
    return { version: "1.0", skills: {} };
  }
}

function matchesPrompt(prompt, rule) {
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

function buildAdditionalContext(skillNames) {
  const lines = [
    "COLLEGIUM SKILL ACTIVATION CHECK",
    "Recommended local skills for this prompt:",
    ...skillNames.map((name) => `- ${name}`),
    "Use the relevant project-local skills before responding or editing when they apply.",
  ];

  return lines.join("\n");
}

async function main() {
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

  const rules = loadRules();
  const matches = Object.entries(rules.skills ?? {})
    .filter(([, rule]) => matchesPrompt(prompt, rule))
    .sort(([, left], [, right]) => priorityRank(left.priority) - priorityRank(right.priority))
    .map(([name]) => name);

  if (matches.length === 0) {
    process.exit(0);
  }

  const payload = {
    suppressOutput: true,
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: buildAdditionalContext(matches),
    },
  };

  process.stdout.write(JSON.stringify(payload));
}

main().catch(() => {
  process.exit(0);
});
