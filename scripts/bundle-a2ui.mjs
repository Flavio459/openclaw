#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const hashFile = path.join(rootDir, "src", "canvas-host", "a2ui", ".bundle.hash");
const outputFile = path.join(rootDir, "src", "canvas-host", "a2ui", "a2ui.bundle.js");
const rendererDir = path.join(rootDir, "vendor", "a2ui", "renderers", "lit");
const appDir = path.join(rootDir, "apps", "shared", "OpenClawKit", "Tools", "CanvasA2UI");
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

function normalize(p) {
  return p.split(path.sep).join("/");
}

async function walk(entryPath, files) {
  const st = await fs.stat(entryPath);
  if (st.isDirectory()) {
    const entries = await fs.readdir(entryPath);
    for (const entry of entries) {
      await walk(path.join(entryPath, entry), files);
    }
    return;
  }
  files.push(entryPath);
}

function run(command, args, label) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    throw new Error(`${label} failed: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status ?? "unknown"}`);
  }
}

async function main() {
  if (!(await exists(rendererDir)) || !(await exists(appDir))) {
    console.log("A2UI sources missing; keeping prebuilt bundle.");
    return;
  }

  const inputPaths = [
    path.join(rootDir, "package.json"),
    path.join(rootDir, "pnpm-lock.yaml"),
    rendererDir,
    appDir,
  ];

  const files = [];
  for (const inputPath of inputPaths) {
    await walk(inputPath, files);
  }

  files.sort((a, b) => normalize(a).localeCompare(normalize(b)));

  const hash = createHash("sha256");
  for (const filePath of files) {
    const rel = normalize(path.relative(rootDir, filePath));
    hash.update(rel);
    hash.update("\0");
    hash.update(await fs.readFile(filePath));
    hash.update("\0");
  }

  const currentHash = hash.digest("hex");
  let previousHash = "";
  try {
    previousHash = (await fs.readFile(hashFile, "utf8")).trim();
  } catch {
    // First run or hash file missing.
  }

  if (previousHash === currentHash && (await exists(outputFile))) {
    console.log("A2UI bundle up to date; skipping.");
    return;
  }

  run(pnpmCommand, ["-s", "exec", "tsc", "-p", path.join(rendererDir, "tsconfig.json")], "TypeScript bundling");
  run(
    pnpmCommand,
    ["-s", "exec", "rolldown", "-c", path.join(appDir, "rolldown.config.mjs")],
    "Rolldown bundling",
  );

  await fs.mkdir(path.dirname(hashFile), { recursive: true });
  await fs.writeFile(hashFile, currentHash, "utf8");
}

main().catch((err) => {
  console.error("A2UI bundling failed. Re-run with: pnpm canvas:a2ui:bundle");
  console.error("If this persists, verify pnpm deps and try again.");
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
