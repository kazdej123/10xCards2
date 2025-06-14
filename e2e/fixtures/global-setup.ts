import { FullConfig } from "@playwright/test";

/**
 * Global setup that runs before all tests
 * Useful for database seeding, authentication, etc.
 */
async function globalSetup(config: FullConfig) {
  console.log("🔧 Running global setup...");

  // Here you can add:
  // - Database seeding
  // - Authentication setup
  // - Environment preparation
  // - API calls for test data preparation

  console.log("✅ Global setup completed");
}

export default globalSetup;
