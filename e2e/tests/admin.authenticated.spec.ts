import { test, expect } from "@playwright/test";

// Ten test sprawdza funkcjonalność dostępną dla uwierzytelnionych użytkowników
// zmieniony z testów admin panel (który nie istnieje) na testy generate page

test.describe("Generate Page - Uwierzytelniony użytkownik", () => {
  test.beforeEach(async ({ page }) => {
    // Nawigujemy do strony generowania fiszek
    await page.goto("/generate");
    // Wait for the page to be fully loaded and React components to hydrate
    await page.waitForLoadState("networkidle");
    // Wait for page content to be ready - using multiple fallback strategies
    await Promise.race([
      expect(page.getByTestId("flashcard-generation-view")).toBeVisible({ timeout: 15000 }),
      expect(page.getByRole("heading", { name: "Generuj fiszki" })).toBeVisible({ timeout: 15000 }),
      expect(page.getByTestId("logout-button")).toBeVisible({ timeout: 15000 }),
    ]);
  });

  test("powinien wyświetlić stronę generowania fiszek", async ({ page }) => {
    // Arrange - dane już załadowane w beforeEach

    // Act & Assert
    await expect(page.getByRole("heading", { name: "Generuj fiszki" })).toBeVisible();
    await expect(page.getByTestId("logout-button")).toBeVisible();
    await expect(page.getByTestId("flashcard-generation-view")).toBeVisible();
  });

  test("powinien wyświetlić pole do wprowadzania tekstu", async ({ page }) => {
    // Act & Assert - wait for React components to be fully hydrated
    await expect(page.getByTestId("source-text-input")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("generate-button")).toBeVisible({ timeout: 15000 });
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

    // Assert
    await expect(page).toHaveURL(/\/login|\/home|\/$/, { timeout: 10000 });
  });

  test("powinien wyświetlić informacje o użytkowniku", async ({ page }) => {
    // Act & Assert - wait for text to be rendered
    await expect(page.getByText("Witaj,")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Użytkowniku")).toBeVisible({ timeout: 10000 });
  });
});
