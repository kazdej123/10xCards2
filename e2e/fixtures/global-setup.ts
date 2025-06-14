/**
 * Global setup that runs before all tests
 * Useful for database seeding, authentication, etc.
 */
async function globalSetup() {
  // eslint-disable-next-line no-console
  console.log("🔧 Running global setup...");

  // 1. Check if development server is running
  try {
    const response = await fetch("http://localhost:4321");
    if (!response.ok) {
      throw new Error("Development server not responding");
    }
    // eslint-disable-next-line no-console
    console.log("✅ Development server is running");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Development server not accessible:", error);
    // eslint-disable-next-line no-console
    console.log("Please ensure the development server is running with: npm run dev:e2e");
  }

  // 2. Verify API endpoints are accessible (optional - will fail gracefully in tests)
  try {
    const healthResponse = await fetch("http://localhost:4321/api/health");
    if (healthResponse.ok) {
      // eslint-disable-next-line no-console
      console.log("✅ API health endpoint is accessible");
    } else {
      // eslint-disable-next-line no-console
      console.log("⚠️  API health endpoint not available (expected if not implemented)");
    }
  } catch {
    // eslint-disable-next-line no-console
    console.log("⚠️  API endpoints not accessible (expected if not implemented)");
  }

  // 3. Seed test data (if needed)
  // This is where you would add database seeding logic
  // For example:
  // await seedDatabase();
  // await createTestUsers();

  // 4. Prepare test environment
  // Clear any existing test data
  // Set up test users, permissions, etc.

  // eslint-disable-next-line no-console
  console.log("✅ Global setup completed");
}

export default globalSetup;
