import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
const uiDir = path.resolve(here, "..");
const repoRoot = path.resolve(uiDir, "..");

function parseArgs(argv) {
  const options = {
    url: null,
    outputDir: path.join(repoRoot, "output", "playwright", "collegium-local-smoke"),
    headed: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--url") {
      options.url = argv[index + 1] ?? null;
      index += 1;
      continue;
    }
    if (arg === "--output-dir") {
      options.outputDir = argv[index + 1] ?? options.outputDir;
      index += 1;
      continue;
    }
    if (arg === "--headed") {
      options.headed = true;
    }
  }

  if (!options.url) {
    throw new Error("Missing required --url argument.");
  }

  return options;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function expectVisible(locator, label) {
  try {
    await locator.waitFor({ state: "visible", timeout: 10_000 });
  } catch (error) {
    throw new Error(`Expected visible: ${label}`);
  }
}

async function clickNav(page, label) {
  const navItem = page.locator("a.nav-item").filter({ hasText: label }).first();
  await expectVisible(navItem, `nav item ${label}`);
  await navItem.click();
}

async function assertPageTitle(page, title) {
  const pageTitle = page.locator(".page-title").filter({ hasText: title }).first();
  await expectVisible(pageTitle, `page title ${title}`);
}

async function assertChatSession(page, sessionKey) {
  const select = page.locator(".chat-controls select").first();
  await expectVisible(select, `chat session select for ${sessionKey}`);
  const deadline = Date.now() + 5_000;

  while (Date.now() < deadline) {
    const value = await select.inputValue();
    if (value === sessionKey) {
      return;
    }
    await page.waitForTimeout(200);
  }

  const value = await select.inputValue();
  throw new Error(`Expected chat session ${sessionKey}, got ${value}`);
}

async function assertChatContainsText(page, text) {
  const thread = page.locator(".chat-thread").first();
  await expectVisible(thread, "chat thread");
  const deadline = Date.now() + 10_000;

  while (Date.now() < deadline) {
    const content = (await thread.textContent()) ?? "";
    if (content.includes(text)) {
      return;
    }
    await page.waitForTimeout(200);
  }

  throw new Error(`Expected chat text in thread: ${text}`);
}

async function abortChatIfStreaming(page) {
  const stopButton = page.getByRole("button", { name: "Stop" }).first();
  try {
    await stopButton.waitFor({ state: "visible", timeout: 2_000 });
  } catch {
    return;
  }

  await stopButton.click();
  await page.waitForTimeout(300);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await ensureDir(options.outputDir);

  const report = {
    startedAt: new Date().toISOString(),
    url: options.url,
    visited: [],
    consoleErrors: [],
    pageErrors: [],
  };

  const browser = await chromium.launch({
    headless: !options.headed,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  });
  const page = await context.newPage();

  page.on("console", (message) => {
    if (message.type() === "error") {
      report.consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    report.pageErrors.push(error.message);
  });

  try {
    await page.goto(options.url, { waitUntil: "domcontentloaded", timeout: 20_000 });
    await expectVisible(page.locator(".shell").first(), "app shell");
    const bodyText = await page.locator("body").innerText();
    if (bodyText.includes("gateway token mismatch")) {
      throw new Error("Gateway token mismatch detected in UI.");
    }

    await clickNav(page, "Overview");
    await assertPageTitle(page, "Overview");
    report.visited.push("overview");

    await clickNav(page, "Cortex Command");
    await assertPageTitle(page, "Cortex Command");
    report.visited.push("command");

    await clickNav(page, "The Forum");
    await expectVisible(page.getByText("Deliberative Room", { exact: true }), "The Forum hero");
    report.visited.push("forum");

    await page.getByRole("button", { name: "Send Deliberation Brief" }).click();
    await assertPageTitle(page, "Chat");
    await assertChatSession(page, "agent:main:forum");
    await assertChatContainsText(page, "Forum brief");
    await abortChatIfStreaming(page);
    report.visited.push("forum-brief");

    await clickNav(page, "Portal Preview");
    await assertPageTitle(page, "Portal Preview");
    report.visited.push("portal-preview");

    await page.getByRole("button", { name: "Open Review Room" }).click();
    await assertPageTitle(page, "Chat");
    await assertChatSession(page, "agent:main:portal-preview");
    report.visited.push("portal-review-room");

    await clickNav(page, "The Cockpit");
    await assertPageTitle(page, "The Cockpit");
    report.visited.push("cockpit-preview");

    await page.getByRole("button", { name: "Open Review Room" }).click();
    await assertPageTitle(page, "Chat");
    await assertChatSession(page, "agent:main:cockpit-preview");
    report.visited.push("cockpit-review-room");

    await clickNav(page, "Cortex Praetorium");
    await expectVisible(
      page.getByText("Development Command Room", { exact: true }),
      "Praetorium hero",
    );
    report.visited.push("praetorium");

    await page.getByRole("button", { name: "Continue Working Room" }).click();
    await assertPageTitle(page, "Chat");
    await assertChatSession(page, "agent:main:praetorium");
    report.visited.push("praetorium-working-room");

    await clickNav(page, "Overview");
    await assertPageTitle(page, "Overview");
    report.visited.push("overview-final");

    const screenshotPath = path.join(options.outputDir, "collegium-local-smoke.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });
    report.screenshotPath = screenshotPath;

    if (report.consoleErrors.length > 0 || report.pageErrors.length > 0) {
      throw new Error("Console or page errors were detected during smoke.");
    }
  } catch (error) {
    const failureScreenshotPath = path.join(options.outputDir, "collegium-local-smoke.failure.png");
    await page.screenshot({ path: failureScreenshotPath, fullPage: true });
    report.failureScreenshotPath = failureScreenshotPath;
    report.failureMessage = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    report.finishedAt = new Date().toISOString();
    const reportPath = path.join(options.outputDir, "collegium-local-smoke.json");
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    await browser.close();
  }
}

await main();
