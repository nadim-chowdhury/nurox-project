import { defineConfig, devices } from "@playwright/test";

const apiUrl = process.env.E2E_API_URL ?? "http://localhost:3001/api/v1";
const webUrl = process.env.E2E_WEB_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "html",
  timeout: 60_000,
  use: {
    baseURL: webUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "api",
      testMatch: /api\/.*\.spec\.ts/,
      use: {
        baseURL: apiUrl.replace(/\/api\/v1$/, ""),
      },
    },
    {
      name: "ui-chromium",
      testMatch: /ui\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.E2E_SKIP_WEBSERVER
    ? undefined
    : [
        {
          command: "pnpm --filter api start",
          url: `${(process.env.E2E_API_ORIGIN ?? "http://localhost:3001").replace(/\/$/, "")}/api/health`,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
          cwd: "../..",
        },
        {
          command: "pnpm --filter web dev",
          url: webUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          cwd: "../..",
        },
      ],
});
