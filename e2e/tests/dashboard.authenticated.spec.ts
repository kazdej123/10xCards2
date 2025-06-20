import { test, expect } from "@playwright/test";

// Ten test sprawdza stronę generowania fiszek (faktyczną funkcjonalność)
// zamiast nieistniejącego dashboardu

test.describe("Generate Page - Uwierzytelniony użytkownik", () => {
  test.beforeEach(async ({ page }) => {
    // Nawigujemy do strony generowania zamiast nieistniejącego dashboardu
    await page.goto("/generate");
  });

  test("powinien wyświetlić stronę generowania fiszek", async ({ page }) => {
    // Arrange - dane już załadowane w beforeEach

    // Act - sprawdzamy elementy strony generowania
    const pageTitle = page.getByRole("heading", { name: "Generuj fiszki" });
    const logoutButton = page.getByTestId("logout-button");

    // Assert
    await expect(pageTitle).toBeVisible();
    await expect(logoutButton).toBeVisible();
  });

  test("powinien wyświetlić formularz generowania", async ({ page }) => {
    // Arrange
    const sourceTextInput = page.getByTestId("source-text-input");
    const generateButton = page.getByTestId("generate-button");

    // Act & Assert
    await expect(sourceTextInput).toBeVisible();
    await expect(generateButton).toBeVisible();
  });

  test("powinien wyświetlić informacje o użytkowniku", async ({ page }) => {
    // Arrange
    const welcomeText = page.getByText("Witaj");
    const userText = page.getByText("Użytkowniku");

    // Act & Assert
    await expect(welcomeText).toBeVisible();
    await expect(userText).toBeVisible();
  });

  test("powinien umożliwić wylogowanie", async ({ page }) => {
    // Arrange - wait for button to be fully interactive
    const logoutButton = page.getByTestId("logout-button");
    await expect(logoutButton).toBeVisible();
    await expect(logoutButton).toBeEnabled();

    // Wait for React hydration to complete
    await page.waitForTimeout(1000);

    // Act - click the button and wait for navigation
    await logoutButton.click();

    // Wait for any navigation to complete
    await page.waitForLoadState("networkidle");

    // Assert - sprawdzamy czy zostaliśmy przekierowani
    await expect(page).toHaveURL(/\/login|\/home|\/$/, { timeout: 10000 });
  });
});
