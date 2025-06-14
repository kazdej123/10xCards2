import { DatabaseCleanup } from "./database-cleanup";

/**
 * Global teardown that runs after all tests
 * Cleans up Supabase database using environment variables from .env.test
 */
async function globalTeardown() {
  // eslint-disable-next-line no-console
  console.log("🧹 Running global teardown...");

  try {
    // Initialize database cleanup utility
    const dbCleanup = new DatabaseCleanup();

    // Show database stats before cleanup (optional)
    await dbCleanup.getDatabaseStats();

    // Perform database cleanup
    await dbCleanup.cleanupTestData();

    // Show database stats after cleanup (optional)
    await dbCleanup.getDatabaseStats();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Global teardown failed:", error);
    // Don't throw the error to prevent test failures due to cleanup issues
    // but log it for debugging purposes
  }

  // eslint-disable-next-line no-console
  console.log("✅ Global teardown completed");
}

export default globalTeardown;
