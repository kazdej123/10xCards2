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
    await expect(page).toHaveTitle(/10x Cards/i);
  });

  test("should take screenshot on home page", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);

    // Act
    await homePage.navigateToHome();

    // Assert - Visual comparison
    await expect(page).toHaveScreenshot("home-page.png");
  });

  test.skip("example search functionality", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);
    const searchTerm = "test query";

    // Act
    await homePage.navigateToHome();
    await homePage.performSearch(searchTerm);

    // Assert
    // Add assertions based on your application's search functionality
    await expect(page.getByTestId("search-results")).toBeVisible();
  });
});
