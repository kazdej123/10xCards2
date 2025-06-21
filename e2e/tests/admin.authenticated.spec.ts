import { test, expect } from "@playwright/test";
import { navigateAndWaitForHydration, waitForTestElement, debugPageState } from "../fixtures/test-utils";

// Ten test sprawdza funkcjonalność dostępną dla uwierzytelnionych użytkowników
// zmieniony z testów admin panel (który nie istnieje) na testy generate page

test.describe("Generate Page - Uwierzytelniony użytkownik", () => {
  test.beforeEach(async ({ page }) => {
    // Nawigujemy do strony generowania fiszek z lepszą obsługą hydratacji
    await navigateAndWaitForHydration(page, "/generate");

    // Debug info for CI troubleshooting
    await debugPageState(page, "beforeEach - after navigation");

    // Wait for key elements to be available
    await Promise.race([
      waitForTestElement(page, "flashcard-generation-view"),
      waitForTestElement(page, "logout-button"),
      page.waitForSelector('h1:has-text("Generuj fiszki")', { state: "visible", timeout: 30000 }),
    ]);
  });

  test("powinien wyświetlić stronę generowania fiszek", async ({ page }) => {
    // Debug info
    await debugPageState(page, "test start - main view");

    // Act & Assert - with CI-friendly timeouts
    await expect(page.getByRole("heading", { name: "Generuj fiszki" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("logout-button")).toBeVisible({ timeout: 15000 });

    // Check for the main component using utility
    await waitForTestElement(page, "flashcard-generation-view");
  });

  test("powinien wyświetlić pole do wprowadzania tekstu", async ({ page }) => {
    // Debug info
    await debugPageState(page, "test start - input fields");

    // Act & Assert - wait for React components to be fully hydrated
    await waitForTestElement(page, "source-text-input");
    await waitForTestElement(page, "generate-button");
  });

  test("powinien umożliwić wylogowanie", async ({ page }) => {
    // Debug info
    await debugPageState(page, "test start - logout");

    // Arrange - wait for button to be fully interactive
    await waitForTestElement(page, "logout-button");
    const logoutButton = page.getByTestId("logout-button");
    await expect(logoutButton).toBeEnabled({ timeout: 15000 });

    // Act - click the button and wait for navigation
    await logoutButton.click();
    await page.waitForLoadState("networkidle");

    // Assert - with longer timeout for CI
    await expect(page).toHaveURL(/\/login|\/home|\/$/, { timeout: 15000 });
  });

  test("powinien wyświetlić informacje o użytkowniku", async ({ page }) => {
    // Debug info
    await debugPageState(page, "test start - user info");

    // Act & Assert - wait for text to be rendered with CI-friendly timeout
    await expect(page.getByText("Witaj,")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Użytkowniku")).toBeVisible({ timeout: 15000 });
  });
});
