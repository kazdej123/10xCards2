import { test as teardown } from "@playwright/test";
import { DatabaseCleanup } from "../fixtures/database-cleanup";

/**
 * Database cleanup test - runs as a teardown project
 * This follows the recommended project dependencies approach from Playwright docs
 */
teardown("cleanup database after all tests", async () => {
  // eslint-disable-next-line no-console
  console.log("🧹 Running database cleanup teardown...");

  try {
    // Initialize database cleanup utility
    const dbCleanup = new DatabaseCleanup();

    // Show database stats before cleanup (for debugging)
    await dbCleanup.getDatabaseStats();

    // Perform the actual cleanup
    await dbCleanup.cleanupTestData();

    // Show database stats after cleanup (for verification)
    await dbCleanup.getDatabaseStats();

    // eslint-disable-next-line no-console
    console.log("✅ Database cleanup teardown completed successfully");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Database cleanup teardown failed:", error);
    // Re-throw the error to fail the teardown project if cleanup fails
    throw error;
  }
});
