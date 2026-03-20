import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium", name: "chromium" }],
      headless: true,
      ui: false,
      api: {
        host: "127.0.0.1",
        port: 39015,
        strictPort: false,
      },
    },
  },
});
