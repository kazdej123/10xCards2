import { test, expect } from "@playwright/test";

// Ten test sprawdza funkcjonalność dostępną dla uwierzytelnionych użytkowników
// zmieniony z testów admin panel (który nie istnieje) na testy generate page

test.describe("Generate Page - Uwierzytelniony użytkownik", () => {
  test.beforeEach(async ({ page }) => {
    // Nawigujemy do strony generowania fiszek
    await page.goto("/generate");
  });

  test("powinien wyświetlić stronę generowania fiszek", async ({ page }) => {
    // Arrange - dane już załadowane w beforeEach

    // Act & Assert
    await expect(page.getByText("Generuj fiszki")).toBeVisible();
    await expect(page.getByTestId("logout-button")).toBeVisible();
    await expect(page.getByTestId("flashcard-generation-view")).toBeVisible();
  });

  test("powinien wyświetlić pole do wprowadzania tekstu", async ({ page }) => {
    // Act & Assert
    await expect(page.getByTestId("source-text-input")).toBeVisible();
    await expect(page.getByTestId("generate-button")).toBeVisible();
  });

  test("powinien umożliwić wylogowanie", async ({ page }) => {
    // Act
    const logoutButton = page.getByTestId("logout-button");
    await logoutButton.click();

    // Assert
    await expect(page).toHaveURL(/login|home/);
  });

  test("powinien wyświetlić informacje o użytkowniku", async ({ page }) => {
    // Act & Assert
    await expect(page.getByText("Witaj")).toBeVisible();
    await expect(page.getByText("Użytkowniku")).toBeVisible();
  });
});
