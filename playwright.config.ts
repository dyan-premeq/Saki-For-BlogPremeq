import { defineConfig, devices } from "playwright/test";

const host = "127.0.0.1";
const port = 4321;
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  testDir: "./tests/smoke",
  outputDir: "./test-results",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    colorScheme: "light",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm run serve:built",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "mobile-390x844",
      use: {
        ...devices["Desktop Chrome"],
        viewport: {
          width: 390,
          height: 844,
        },
      },
    },
  ],
});
