import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const claudeDir = path.resolve(__dirname, "..");
const rulesPath = path.join(claudeDir, "skills", "skill-rules.json");
const stateDir = path.join(__dirname, "state");

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

function ensureStateDir() {
  fs.mkdirSync(stateDir, { recursive: true });
}

function loadState(sessionId) {
  ensureStateDir();
  const filePath = path.join(stateDir, `skills-used-${sessionId || "default"}.json`);
  try {
    return {
      filePath,
      data: JSON.parse(fs.readFileSync(filePath, "utf8")),
    };
  } catch {
    return {
      filePath,
      data: { skills_used: [] },
    };
  }
}

function saveState(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
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

function matchesFileRule(relativePath, rule) {
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
  const state = loadState(sessionId);

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
    if (
      skipConditions.sessionSkillUsed &&
      Array.isArray(state.data.skills_used) &&
      state.data.skills_used.includes(skillName)
    ) {
      continue;
    }
    if (fileContainsAnyMarker(filePath, skipConditions.fileMarkers ?? [])) {
      continue;
    }

    state.data.skills_used = Array.from(new Set([...(state.data.skills_used ?? []), skillName]));
    saveState(state.filePath, state.data);

    const message = String(rule.blockMessage ?? "")
      .replaceAll("{file_path}", relativePath)
      .replaceAll("{skill_name}", skillName);
    process.stderr.write(message || `Use skill ${skillName} before editing ${relativePath}.`);
    process.exit(2);
  }

  process.exit(0);
}

main().catch(() => {
  process.exit(0);
});
