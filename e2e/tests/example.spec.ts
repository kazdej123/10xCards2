import { test, expect } from "../fixtures/test-fixtures";

test.describe("Application Navigation Tests", () => {
  test("should navigate through main application flow", async ({ homePage }) => {
    // Arrange & Act - Start at home page
    await homePage.navigateToHome();

    // Assert - Home page loads correctly
    await homePage.verifyHomePageLoaded();
    await homePage.verifyAppTitle();
    await expect(homePage.getPage()).toHaveTitle(/10xCards\.ai/i);

    // Act - Check auth buttons are present
    await expect(homePage.getByTestId("auth-buttons-container")).toBeVisible();
    await expect(homePage.getByTestId("login-button")).toBeVisible();
    await expect(homePage.getByTestId("register-button")).toBeVisible();
  });

  test("should handle direct navigation to generate page", async ({ generatePage }) => {
    // Arrange & Act
    await generatePage.navigateToGenerate();

    // Assert - should redirect to login for unauthenticated users
    await expect(generatePage.getPage()).toHaveURL(/login/);
  });

  test("should display proper page structure across pages", async ({ homePage, generatePage }) => {
    // Arrange & Act - Test home page
    await homePage.navigateToHome();

    // Assert - Home page structure
    await expect(homePage.getPage().locator("h1").first()).toBeVisible();

    // Act - Navigate to generate page (will redirect to login)
    await generatePage.navigateToGenerate();

    // Assert - Should be redirected to login page
    await expect(generatePage.getPage()).toHaveURL(/login/);
    await expect(generatePage.getPage().getByTestId("login-form")).toBeVisible();
  });

  test("should maintain consistent branding across pages", async ({ homePage, generatePage }) => {
    // Arrange & Act - Check home page branding
    await homePage.navigateToHome();
    await expect(homePage.getPage().locator("h1").first()).toBeVisible();

    // Act & Assert - Check generate page branding
    await generatePage.navigateToGenerate();
    await expect(generatePage.getPage().locator('a:has-text("10xCards.ai")')).toBeVisible();
  });

  test("should take comprehensive screenshots for visual regression", async ({ homePage, generatePage }) => {
    // Arrange & Act - Home page screenshot
    await homePage.navigateToHome();
    await homePage.getPage().waitForLoadState("networkidle");

    // Assert - Visual comparison home page
    await expect(homePage.getPage()).toHaveScreenshot("home-page-full.png");

    // Act - Generate page screenshot
    await generatePage.navigateToGenerate();
    await generatePage.getPage().waitForLoadState("networkidle");

    // Assert - Visual comparison generate page
    await expect(generatePage.getPage()).toHaveScreenshot("generate-page-full.png");
  });
});
