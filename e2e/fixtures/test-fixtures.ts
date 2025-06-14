import { test as base, Page } from "@playwright/test";
import { HomePage } from "../page-objects/home-page";

/**
 * Custom test fixtures
 * Extend the base test with page objects and custom utilities
 */
export const test = base.extend<{
  homePage: HomePage;
  authenticatedPage: Page;
}>({
  // Page Object fixtures
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  // Example: Authenticated page fixture
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Add authentication logic here
    // For example: login, set cookies, etc.
    // await page.goto('/login');
    // await page.fill('[data-testid="email"]', 'test@example.com');
    // await page.fill('[data-testid="password"]', 'password');
    // await page.click('[data-testid="login-button"]');

    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";
