import { defineConfig, devices } from "@playwright/test";
import { loadTestEnv } from "./e2e/fixtures/env-validator";

// Load .env.test file for test environment variables (especially Supabase config)
loadTestEnv();

// Debug information in CI environment
if (process.env.CI) {
  // eslint-disable-next-line no-console
  console.log("🐛 Playwright config debug info:");
  // eslint-disable-next-line no-console
  console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? "SET (****)" : "NOT SET"}`);
  // eslint-disable-next-line no-console
  console.log(`   SUPABASE_KEY: ${process.env.SUPABASE_KEY ? "SET (****)" : "NOT SET"}`);
  // eslint-disable-next-line no-console
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  // eslint-disable-next-line no-console
  console.log(`   CI: ${process.env.CI}`);
}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e/tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only - zwiększone dla lepszej stabilności */
  retries: process.env.CI ? 3 : 0,
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
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Take screenshots on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "retain-on-failure",

    /* Global test timeout - zwiększone dla CI */
    actionTimeout: process.env.CI ? 45000 : 30000,
    navigationTimeout: process.env.CI ? 45000 : 30000,
  },

  /* Global timeout dla całego test suite */
  timeout: process.env.CI ? 60000 : 30000,

  /* Configure projects for major browsers */
  projects: [
    // Setup projects - uruchamiają się przed testami
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    // Database cleanup project - runs after all tests using project dependencies approach
    {
      name: "cleanup",
      testMatch: /.*\.cleanup\.ts/,
    },

    // Main testing project z uwierzytelnionym użytkownikiem
    {
      name: "chromium-user",
      use: {
        ...devices["Desktop Chrome"],
        // Użyj zapisanego stanu uwierzytelniania
        storageState: "e2e/.auth/user.json",
      },
      testMatch: [
        "**/dashboard.authenticated.spec.ts",
        "**/generate.authenticated.spec.ts",
        "**/user.authenticated.spec.ts",
      ],
      dependencies: ["setup"],
      teardown: "cleanup",
    },

    // Testing project z uwierzytelnionym administratorem
    {
      name: "chromium-admin",
      use: {
        ...devices["Desktop Chrome"],
        // Użyj zapisanego stanu uwierzytelniania administratora
        storageState: "e2e/.auth/admin.json",
      },
      testMatch: ["**/admin.authenticated.spec.ts"],
      dependencies: ["setup"],
      teardown: "cleanup",
    },

    // Testing project bez uwierzytelniania (dla testów publicznych stron)
    {
      name: "chromium-guest",
      use: {
        ...devices["Desktop Chrome"],
        // Resetuj stan uwierzytelniania
        storageState: { cookies: [], origins: [] },
      },
      testMatch: [
        "**/public-pages.guest.spec.ts",
        "**/api.spec.ts",
        "**/generate.spec.ts",
        "**/home-page.spec.ts",
        "**/security.spec.ts",
        "**/example.spec.ts",
        "**/env-validation.spec.ts",
      ],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev:e2e",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 180 * 1000 : 120 * 1000, // 3 minuty w CI, 2 minuty lokalnie
    env: {
      // Przekaż wszystkie zmienne środowiskowe do dev server
      ...process.env,
      // Upewnij się, że te kluczowe zmienne są ustawione
      SUPABASE_URL: process.env.SUPABASE_URL || "",
      SUPABASE_KEY: process.env.SUPABASE_KEY || "",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      NODE_ENV: process.env.NODE_ENV || "test",
    },
  },

  /* Output directories */
  outputDir: "e2e/results/",

  /* Global setup and teardown */
  globalSetup: "./e2e/fixtures/global-setup.ts",
  globalTeardown: "./e2e/fixtures/global-teardown.ts",
});
