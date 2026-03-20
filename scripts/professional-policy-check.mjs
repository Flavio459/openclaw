#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import JSON5 from "json5";

function parseConfigFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return JSON5.parse(raw);
  }
}

function isTruthy(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
}

function parseExpectedBool(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!normalized) {
    return undefined;
  }
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  throw new Error(`invalid boolean value: ${value}`);
}

function parseExpectedArchive(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!normalized) {
    return undefined;
  }
  if (["0", "off", "none", "disabled"].includes(normalized)) {
    return undefined;
  }
  const minutes = Number.parseInt(normalized, 10);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new Error(`invalid archive minutes value: ${value}`);
  }
  return minutes;
}

function parseExpectedEnum(value, allowed, fieldName) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!normalized) {
    return undefined;
  }
  if (["unset", "default", "disabled", "none"].includes(normalized)) {
    return undefined;
  }
  if (!allowed.includes(normalized)) {
    throw new Error(`invalid ${fieldName} value: ${value}`);
  }
  return normalized;
}

function readModelChain(cfg) {
  const modelCfg = cfg?.agents?.defaults?.model ?? {};
  const primary =
    typeof modelCfg?.primary === "string" && modelCfg.primary.trim()
      ? modelCfg.primary.trim()
      : "";
  const fallbacks = Array.isArray(modelCfg?.fallbacks)
    ? modelCfg.fallbacks
        .map((value) => String(value ?? "").trim())
        .filter(Boolean)
    : [];
  return { primary, fallbacks };
}

function readSubagentPolicy(cfg) {
  const subagents = cfg?.agents?.defaults?.subagents ?? {};
  const inheritPersona =
    typeof subagents.inheritPersona === "boolean" ? subagents.inheritPersona : true;
  const archiveAfterMinutes =
    typeof subagents.archiveAfterMinutes === "number" &&
    Number.isFinite(subagents.archiveAfterMinutes) &&
    subagents.archiveAfterMinutes > 0
      ? Math.floor(subagents.archiveAfterMinutes)
      : undefined;
  return { inheritPersona, archiveAfterMinutes };
}

function readHeartbeatPolicy(cfg) {
  const heartbeat = cfg?.agents?.defaults?.heartbeat ?? {};
  const every = typeof heartbeat.every === "string" && heartbeat.every.trim() ? heartbeat.every.trim() : undefined;
  const activeHours = heartbeat?.activeHours ?? {};
  const start =
    typeof activeHours.start === "string" && activeHours.start.trim() ? activeHours.start.trim() : undefined;
  const end = typeof activeHours.end === "string" && activeHours.end.trim() ? activeHours.end.trim() : undefined;
  const timezone =
    typeof activeHours.timezone === "string" && activeHours.timezone.trim()
      ? activeHours.timezone.trim()
      : undefined;
  return {
    every,
    activeHours: {
      start,
      end,
      timezone,
      configured: Boolean(start || end || timezone),
      complete: Boolean(start && end),
    },
  };
}

function readSecurityPolicy(cfg) {
  const gatewayBind =
    typeof cfg?.gateway?.bind === "string" && cfg.gateway.bind.trim()
      ? cfg.gateway.bind.trim().toLowerCase()
      : "loopback";
  const sandboxModeRaw = cfg?.agents?.defaults?.sandbox?.mode;
  const sandboxMode =
    typeof sandboxModeRaw === "string" && sandboxModeRaw.trim()
      ? sandboxModeRaw.trim().toLowerCase()
      : undefined;
  const execAskRaw = cfg?.tools?.exec?.ask;
  const execAsk =
    typeof execAskRaw === "string" && execAskRaw.trim() ? execAskRaw.trim().toLowerCase() : "on-miss";
  return { gatewayBind, sandboxMode, execAsk };
}

function readCronPolicy(configPath) {
  const defaultStore = path.join(path.dirname(path.resolve(configPath)), "cron", "jobs.json");
  const storePathRaw = String(process.env.OPENCLAW_CRON_STORE ?? "").trim();
  const storePath = storePathRaw || defaultStore;
  const out = {
    storePath,
    exists: false,
    enabledMain: 0,
    enabledIsolated: 0,
    enabledUnknown: 0,
  };
  if (!fs.existsSync(storePath)) {
    return out;
  }
  out.exists = true;
  let data;
  try {
    data = parseConfigFile(storePath);
  } catch {
    out.enabledUnknown = -1;
    return out;
  }
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  for (const job of jobs) {
    if (job?.enabled === false) {
      continue;
    }
    const targetRaw = typeof job?.sessionTarget === "string" ? job.sessionTarget.trim().toLowerCase() : "";
    if (targetRaw === "main") {
      out.enabledMain += 1;
      continue;
    }
    if (targetRaw === "isolated") {
      out.enabledIsolated += 1;
      continue;
    }
    out.enabledUnknown += 1;
  }
  return out;
}

function compareStringArray(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) {
      return false;
    }
  }
  return true;
}

function main() {
  const configPath = process.argv[2];
  if (!configPath) {
    console.error("POLICY_ERROR=config path is required");
    process.exit(2);
  }
  if (!fs.existsSync(configPath)) {
    console.error(`POLICY_ERROR=config file not found: ${configPath}`);
    process.exit(2);
  }

  let cfg;
  try {
    cfg = parseConfigFile(configPath);
  } catch (error) {
    console.error(`POLICY_ERROR=failed to parse config: ${String(error)}`);
    process.exit(2);
  }

  const { primary, fallbacks } = readModelChain(cfg);
  const { inheritPersona, archiveAfterMinutes } = readSubagentPolicy(cfg);
  const heartbeat = readHeartbeatPolicy(cfg);
  const security = readSecurityPolicy(cfg);
  const cron = readCronPolicy(configPath);
  const openrouterChain = [primary, ...fallbacks].filter((value) => value.startsWith("openrouter/"));

  console.log(`ENGINE_PRIMARY=${primary || "not-set"}`);
  if (fallbacks.length === 0) {
    console.log("ENGINE_FALLBACKS=none");
  } else {
    for (const [index, value] of fallbacks.entries()) {
      console.log(`ENGINE_FALLBACK_${index + 1}=${value}`);
    }
  }
  console.log(`OPENROUTER_CHAIN_MODELS=${openrouterChain.length > 0 ? openrouterChain.join(",") : "empty"}`);
  console.log(`SUBAGENT_INHERIT_PERSONA=${inheritPersona ? "on" : "off"}`);
  console.log(
    `SUBAGENT_ARCHIVE_AFTER_MINUTES=${
      archiveAfterMinutes === undefined ? "disabled" : String(archiveAfterMinutes)
    }`,
  );
  console.log("MAIN_SESSION_DELETE_PROTECTION=on");
  console.log("SESSION_CORRUPTION_RECOVERY=in-place-reset");
  console.log(`HEARTBEAT_EVERY=${heartbeat.every ?? "disabled"}`);
  if (!heartbeat.activeHours.configured) {
    console.log("HEARTBEAT_ACTIVE_HOURS=disabled");
  } else {
    const start = heartbeat.activeHours.start ?? "unset";
    const end = heartbeat.activeHours.end ?? "unset";
    const timezone = heartbeat.activeHours.timezone ?? "user";
    console.log(`HEARTBEAT_ACTIVE_HOURS=${start}-${end}@${timezone}`);
  }
  console.log(`GATEWAY_BIND=${security.gatewayBind}`);
  console.log(`AGENT_SANDBOX_MODE=${security.sandboxMode ?? "unset"}`);
  console.log(`TOOLS_EXEC_ASK=${security.execAsk}`);
  console.log(`CRON_STORE=${cron.storePath}`);
  console.log(`CRON_ENABLED_MAIN_JOBS=${cron.enabledMain}`);
  console.log(`CRON_ENABLED_ISOLATED_JOBS=${cron.enabledIsolated}`);
  console.log(`CRON_ENABLED_UNKNOWN_TARGET_JOBS=${cron.enabledUnknown}`);

  const policyErrors = [];
  const policyWarnings = [];

  if (!primary) {
    policyErrors.push("ENGINE_PRIMARY is not set (explicit pin required).");
  }
  if (fallbacks.length === 0) {
    policyErrors.push("ENGINE_FALLBACKS is empty (explicit fallback chain required).");
  }

  const allowMinimalPersona = isTruthy(process.env.OPENCLAW_ALLOW_SUBAGENT_MINIMAL_PERSONA);
  if (!inheritPersona && !allowMinimalPersona) {
    policyErrors.push(
      "SUBAGENT_INHERIT_PERSONA is off (set OPENCLAW_ALLOW_SUBAGENT_MINIMAL_PERSONA=1 to allow).",
    );
  }

  const allowSubagentArchive = isTruthy(process.env.OPENCLAW_ALLOW_SUBAGENT_AUTO_ARCHIVE);
  if (archiveAfterMinutes !== undefined && !allowSubagentArchive) {
    policyErrors.push(
      "SUBAGENT_ARCHIVE_AFTER_MINUTES is enabled (set OPENCLAW_ALLOW_SUBAGENT_AUTO_ARCHIVE=1 to allow).",
    );
  }

  const allowNoHeartbeatActiveHours = isTruthy(process.env.OPENCLAW_ALLOW_NO_HEARTBEAT_ACTIVE_HOURS);
  const allowHeartbeatDisabled = isTruthy(process.env.OPENCLAW_ALLOW_HEARTBEAT_DISABLED);
  if (!heartbeat.every && !allowHeartbeatDisabled) {
    policyWarnings.push("HEARTBEAT_EVERY is disabled (set OPENCLAW_ALLOW_HEARTBEAT_DISABLED=1 to allow).");
  }
  if (heartbeat.every && !heartbeat.activeHours.complete && !allowNoHeartbeatActiveHours) {
    policyWarnings.push(
      "HEARTBEAT activeHours is not fully configured (set OPENCLAW_ALLOW_NO_HEARTBEAT_ACTIVE_HOURS=1 to allow).",
    );
  }

  const allowSandboxOff = isTruthy(process.env.OPENCLAW_ALLOW_SANDBOX_OFF);
  if ((!security.sandboxMode || security.sandboxMode === "off") && !allowSandboxOff) {
    policyWarnings.push(
      "AGENT_SANDBOX_MODE is off/unset (set OPENCLAW_ALLOW_SANDBOX_OFF=1 to allow).",
    );
  }

  const allowExecAskOff = isTruthy(process.env.OPENCLAW_ALLOW_EXEC_ASK_OFF);
  if (security.execAsk === "off" && !allowExecAskOff) {
    policyErrors.push("TOOLS_EXEC_ASK is off (set OPENCLAW_ALLOW_EXEC_ASK_OFF=1 to allow).");
  }

  const allowNonLoopbackGateway = isTruthy(process.env.OPENCLAW_ALLOW_NON_LOOPBACK_GATEWAY);
  if (!["loopback", "tailnet"].includes(security.gatewayBind) && !allowNonLoopbackGateway) {
    policyErrors.push(
      "GATEWAY_BIND is not loopback/tailnet (set OPENCLAW_ALLOW_NON_LOOPBACK_GATEWAY=1 to allow).",
    );
  }

  const allowMainCron = isTruthy(process.env.OPENCLAW_ALLOW_MAIN_CRON_JOBS);
  if (cron.enabledMain > 0 && !allowMainCron) {
    policyWarnings.push(
      "CRON has main-session jobs enabled (set OPENCLAW_ALLOW_MAIN_CRON_JOBS=1 to allow).",
    );
  }

  const requireIsolatedCron = isTruthy(process.env.OPENCLAW_REQUIRE_ISOLATED_CRON);
  if (requireIsolatedCron && cron.enabledMain > 0) {
    policyErrors.push("CRON isolated requirement violated: main-session jobs are enabled.");
  }
  if (!heartbeat.every && cron.enabledMain + cron.enabledIsolated === 0) {
    policyWarnings.push(
      "No proactive scheduler found (heartbeat disabled and no enabled cron jobs).",
    );
  }

  const expectedPrimary = String(process.env.OPENCLAW_EXPECTED_ENGINE_PRIMARY ?? "").trim();
  if (expectedPrimary && primary !== expectedPrimary) {
    policyErrors.push(`ENGINE_PRIMARY mismatch: expected ${expectedPrimary}, got ${primary || "not-set"}.`);
  }

  const expectedFallbacksRaw = String(process.env.OPENCLAW_EXPECTED_ENGINE_FALLBACKS ?? "").trim();
  if (expectedFallbacksRaw) {
    const expectedFallbacks = expectedFallbacksRaw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (!compareStringArray(fallbacks, expectedFallbacks)) {
      policyErrors.push(
        `ENGINE_FALLBACKS mismatch: expected [${expectedFallbacks.join(", ")}], got [${fallbacks.join(", ")}].`,
      );
    }
  }

  const expectedInheritPersonaRaw = process.env.OPENCLAW_EXPECT_SUBAGENT_INHERIT_PERSONA;
  if (expectedInheritPersonaRaw !== undefined && String(expectedInheritPersonaRaw).trim() !== "") {
    let expectedInheritPersona;
    try {
      expectedInheritPersona = parseExpectedBool(expectedInheritPersonaRaw);
    } catch (error) {
      policyErrors.push(`OPENCLAW_EXPECT_SUBAGENT_INHERIT_PERSONA: ${String(error)}`);
    }
    if (
      typeof expectedInheritPersona === "boolean" &&
      expectedInheritPersona !== inheritPersona
    ) {
      policyErrors.push(
        `SUBAGENT_INHERIT_PERSONA mismatch: expected ${
          expectedInheritPersona ? "on" : "off"
        }, got ${inheritPersona ? "on" : "off"}.`,
      );
    }
  }

  const expectedArchiveRaw = process.env.OPENCLAW_EXPECT_SUBAGENT_ARCHIVE_AFTER_MINUTES;
  if (expectedArchiveRaw !== undefined && String(expectedArchiveRaw).trim() !== "") {
    let expectedArchive;
    try {
      expectedArchive = parseExpectedArchive(expectedArchiveRaw);
    } catch (error) {
      policyErrors.push(`OPENCLAW_EXPECT_SUBAGENT_ARCHIVE_AFTER_MINUTES: ${String(error)}`);
    }
    if (expectedArchive !== archiveAfterMinutes) {
      const expectedText = expectedArchive === undefined ? "disabled" : String(expectedArchive);
      const actualText =
        archiveAfterMinutes === undefined ? "disabled" : String(archiveAfterMinutes);
      policyErrors.push(
        `SUBAGENT_ARCHIVE_AFTER_MINUTES mismatch: expected ${expectedText}, got ${actualText}.`,
      );
    }
  }

  const expectedGatewayBindRaw = process.env.OPENCLAW_EXPECTED_GATEWAY_BIND;
  if (expectedGatewayBindRaw !== undefined && String(expectedGatewayBindRaw).trim() !== "") {
    let expectedGatewayBind;
    try {
      expectedGatewayBind = parseExpectedEnum(
        expectedGatewayBindRaw,
        ["auto", "lan", "loopback", "custom", "tailnet"],
        "gateway bind",
      );
    } catch (error) {
      policyErrors.push(`OPENCLAW_EXPECTED_GATEWAY_BIND: ${String(error)}`);
    }
    if (expectedGatewayBind !== undefined && expectedGatewayBind !== security.gatewayBind) {
      policyErrors.push(
        `GATEWAY_BIND mismatch: expected ${expectedGatewayBind}, got ${security.gatewayBind}.`,
      );
    }
  }

  const expectedSandboxModeRaw = process.env.OPENCLAW_EXPECTED_SANDBOX_MODE;
  if (expectedSandboxModeRaw !== undefined && String(expectedSandboxModeRaw).trim() !== "") {
    let expectedSandboxMode;
    try {
      expectedSandboxMode = parseExpectedEnum(
        expectedSandboxModeRaw,
        ["off", "non-main", "all"],
        "sandbox mode",
      );
    } catch (error) {
      policyErrors.push(`OPENCLAW_EXPECTED_SANDBOX_MODE: ${String(error)}`);
    }
    if (expectedSandboxMode !== security.sandboxMode) {
      policyErrors.push(
        `AGENT_SANDBOX_MODE mismatch: expected ${
          expectedSandboxMode ?? "unset"
        }, got ${security.sandboxMode ?? "unset"}.`,
      );
    }
  }

  const expectedExecAskRaw = process.env.OPENCLAW_EXPECTED_EXEC_ASK;
  if (expectedExecAskRaw !== undefined && String(expectedExecAskRaw).trim() !== "") {
    let expectedExecAsk;
    try {
      expectedExecAsk = parseExpectedEnum(
        expectedExecAskRaw,
        ["off", "on-miss", "always"],
        "exec ask",
      );
    } catch (error) {
      policyErrors.push(`OPENCLAW_EXPECTED_EXEC_ASK: ${String(error)}`);
    }
    if (expectedExecAsk !== undefined && expectedExecAsk !== security.execAsk) {
      policyErrors.push(`TOOLS_EXEC_ASK mismatch: expected ${expectedExecAsk}, got ${security.execAsk}.`);
    }
  }

  const expectedHeartbeatEvery = String(process.env.OPENCLAW_EXPECTED_HEARTBEAT_EVERY ?? "").trim();
  if (expectedHeartbeatEvery && heartbeat.every !== expectedHeartbeatEvery) {
    policyErrors.push(
      `HEARTBEAT_EVERY mismatch: expected ${expectedHeartbeatEvery}, got ${heartbeat.every ?? "disabled"}.`,
    );
  }

  const expectedHeartbeatActiveHoursRaw = process.env.OPENCLAW_EXPECT_HEARTBEAT_ACTIVE_HOURS;
  if (expectedHeartbeatActiveHoursRaw !== undefined && String(expectedHeartbeatActiveHoursRaw).trim() !== "") {
    let expectedHeartbeatActiveHours;
    try {
      expectedHeartbeatActiveHours = parseExpectedBool(expectedHeartbeatActiveHoursRaw);
    } catch (error) {
      policyErrors.push(`OPENCLAW_EXPECT_HEARTBEAT_ACTIVE_HOURS: ${String(error)}`);
    }
    if (
      typeof expectedHeartbeatActiveHours === "boolean" &&
      expectedHeartbeatActiveHours !== heartbeat.activeHours.complete
    ) {
      policyErrors.push(
        `HEARTBEAT activeHours mismatch: expected ${
          expectedHeartbeatActiveHours ? "configured" : "disabled"
        }, got ${heartbeat.activeHours.complete ? "configured" : "disabled"}.`,
      );
    }
  }

  if (policyErrors.length > 0) {
    console.log("POLICY_STATUS=error");
    for (const issue of policyErrors) {
      console.log(`POLICY_ERROR=${issue}`);
    }
    process.exit(2);
  }

  if (policyWarnings.length > 0) {
    console.log("POLICY_STATUS=warn");
    for (const issue of policyWarnings) {
      console.log(`POLICY_WARN=${issue}`);
    }
    return;
  }

  console.log("POLICY_STATUS=ok");
}

main();
