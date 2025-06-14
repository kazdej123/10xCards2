import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e/tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html"],
    ["json", { outputFile: "e2e/results/test-results.json" }],
    ["junit", { outputFile: "e2e/results/test-results.xml" }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:4321",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Take screenshots on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "retain-on-failure",

    /* Global test timeout */
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev:e2e",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* Output directories */
  outputDir: "e2e/results/",

  /* Global setup and teardown */
  globalSetup: "./e2e/fixtures/global-setup.ts",
  globalTeardown: "./e2e/fixtures/global-teardown.ts",
});
