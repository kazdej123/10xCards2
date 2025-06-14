/**
 * Global teardown that runs after all tests
 * Useful for cleanup, database reset, etc.
 */
async function globalTeardown() {
  // eslint-disable-next-line no-console
  console.log("🧹 Running global teardown...");

  // Here you can add:
  // - Database cleanup
  // - File cleanup
  // - API cleanup calls
  // - Environment reset

  // eslint-disable-next-line no-console
  console.log("✅ Global teardown completed");
}

export default globalTeardown;
