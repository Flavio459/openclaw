import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const hooksDir = path.resolve(__dirname, "..");
const claudeDir = path.resolve(hooksDir, "..");
const rulesPath = path.join(claudeDir, "skills", "skill-rules.json");
const defaultStateDir = path.join(hooksDir, "state");

export async function readStdin() {
  return await new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

export function loadRules() {
  try {
    return JSON.parse(fs.readFileSync(rulesPath, "utf8"));
  } catch {
    return { version: "1.0", skills: {} };
  }
}

export function getStateDir() {
  const override = process.env.OPENCLAW_GUARDRAIL_STATE_DIR?.trim();
  if (!override) {
    return defaultStateDir;
  }
  return path.resolve(override);
}

export function ensureStateDir(stateDir = getStateDir()) {
  fs.mkdirSync(stateDir, { recursive: true });
  return stateDir;
}

export function createEmptySessionState() {
  return { validated_skills: {} };
}

export function pruneExpiredValidations(data, now = Date.now()) {
  const next = createEmptySessionState();
  const source = data?.validated_skills;
  if (!source || typeof source !== "object") {
    return next;
  }

  for (const [skillName, entry] of Object.entries(source)) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const expiresAtMs = Number(entry.expiresAtMs ?? 0);
    const validatedAtMs = Number(entry.validatedAtMs ?? 0);
    if (!expiresAtMs || expiresAtMs <= now || !validatedAtMs) {
      continue;
    }
    next.validated_skills[skillName] = {
      validatedAtMs,
      expiresAtMs,
      ack: entry.ack && typeof entry.ack === "object" ? { ...entry.ack } : {},
    };
  }

  return next;
}

export function sessionStatePath(sessionId, stateDir = getStateDir()) {
  const normalized = sessionId && String(sessionId).trim() ? String(sessionId).trim() : "default";
  return path.join(ensureStateDir(stateDir), `skills-used-${normalized}.json`);
}

export function saveSessionState(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function loadSessionState(sessionId, options = {}) {
  const now = options.now ?? Date.now();
  const stateDir = options.stateDir ?? getStateDir();
  const persistPruned = options.persistPruned ?? false;
  const filePath = sessionStatePath(sessionId, stateDir);

  let raw = createEmptySessionState();
  let exists = false;
  try {
    raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    exists = true;
  } catch {
    raw = createEmptySessionState();
  }

  const data = pruneExpiredValidations(raw, now);
  if (persistPruned && exists && JSON.stringify(data) !== JSON.stringify(raw)) {
    saveSessionState(filePath, data);
  }

  return { filePath, data };
}

export function recordValidatedSkill(sessionId, skillName, ack, ttlMinutes, options = {}) {
  const now = options.now ?? Date.now();
  const stateDir = options.stateDir ?? getStateDir();
  const ttlMs = Math.max(1, Number(ttlMinutes) || 0) * 60 * 1000;
  const { filePath, data } = loadSessionState(sessionId, {
    now,
    stateDir,
    persistPruned: false,
  });

  data.validated_skills[skillName] = {
    validatedAtMs: now,
    expiresAtMs: now + ttlMs,
    ack: { ...ack },
  };
  saveSessionState(filePath, data);
  return data.validated_skills[skillName];
}

export function getValidatedSkill(data, skillName, now = Date.now()) {
  const entry = data?.validated_skills?.[skillName];
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const expiresAtMs = Number(entry.expiresAtMs ?? 0);
  if (!expiresAtMs || expiresAtMs <= now) {
    return null;
  }
  return entry;
}
