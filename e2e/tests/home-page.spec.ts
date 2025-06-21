import { test, expect } from "@playwright/test";
import { HomePage } from "../page-objects/home-page";

test.describe("Home Page Tests", () => {
  test("should load home page successfully", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.navigateToHome();

    // Assert
    await homePage.verifyHomePageLoaded();
    await homePage.verifyAppTitle();
    await expect(page).toHaveTitle(/10xCards\.ai/i);
  });

  test("should display auth buttons for unauthenticated users", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.navigateToHome();

    // Assert
    await expect(page.getByTestId("auth-buttons-container")).toBeVisible();
    await expect(page.getByTestId("login-button")).toBeVisible();
    await expect(page.getByTestId("register-button")).toBeVisible();
    await expect(page.getByTestId("login-button")).toHaveText("Logowanie");
    await expect(page.getByTestId("register-button")).toHaveText("Rejestracja");
  });

  test("should navigate to login page when clicking login button", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);
    await homePage.navigateToHome();

    // Act
    await homePage.clickLoginButton();

    // Assert
    await expect(page).toHaveURL("/login");
  });

  test("should navigate to register page when clicking register button", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);
    await homePage.navigateToHome();

    // Act
    await homePage.clickRegisterButton();

    // Assert
    await expect(page).toHaveURL("/register");
  });

  test("should take screenshot for visual regression testing", async ({ page }) => {
    // Skip visual regression tests in CI due to platform rendering differences
    test.skip(!!process.env.CI, "Visual regression tests skipped in CI due to Linux/Windows rendering differences");

    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.navigateToHome();
    await page.waitForLoadState("networkidle");

    // Assert - Visual comparison
    await expect(page).toHaveScreenshot("home-page.png");
  });

  test("should have proper page structure and accessibility", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.navigateToHome();

    // Assert
    // Check main heading
    await expect(page.locator("h1").first()).toBeVisible();

    // Check page has proper semantic structure
    const mainElements = page.locator("main, div");
    await expect(mainElements.first()).toBeVisible();

    // Check navigation elements are accessible
    const loginButton = page.getByTestId("login-button");
    const registerButton = page.getByTestId("register-button");

    await expect(loginButton).toBeEnabled();
    await expect(registerButton).toBeEnabled();

    // Check buttons have proper href attributes
    await expect(loginButton).toHaveAttribute("href", "/login");
    await expect(registerButton).toHaveAttribute("href", "/register");
  });
});
