import { test, expect } from "@playwright/test";

// Ten test używa stanu uwierzytelnienia z pliku e2e/.auth/user.json
// dzięki konfiguracji projektu "chromium-user" w playwright.config.ts

test.describe("Dashboard - Uwierzytelniony użytkownik", () => {
  test.beforeEach(async ({ page }) => {
    // Strona jest już uwierzytelniona dzięki storageState
    await page.goto("/dashboard");
  });

  test("powinien wyświetlić dashboard użytkownika", async ({ page }) => {
    // Arrange - dane już załadowane w beforeEach

    // Act - sprawdzamy elementy dashboardu
    const userMenu = page.getByTestId("user-menu");
    const dashboardTitle = page.getByTestId("dashboard-title");

    // Assert
    await expect(userMenu).toBeVisible();
    await expect(dashboardTitle).toBeVisible();
    await expect(dashboardTitle).toContainText("Dashboard");
  });

  test("powinien umożliwić nawigację do ustawień", async ({ page }) => {
    // Arrange
    const userMenu = page.getByTestId("user-menu");

    // Act
    await userMenu.click();
    const settingsLink = page.getByTestId("settings-link");
    await settingsLink.click();

    // Assert
    await expect(page).toHaveURL(/settings/);
    await expect(page.getByTestId("settings-form")).toBeVisible();
  });

  test("powinien wyświetlić dane użytkownika", async ({ page }) => {
    // Arrange
    const profileSection = page.getByTestId("profile-section");

    // Act & Assert
    await expect(profileSection).toBeVisible();

    // Sprawdzamy czy wyświetla się email użytkownika testowego
    const userEmail = page.getByTestId("user-email");
    await expect(userEmail).toBeVisible();

    // Opcjonalnie: sprawdź konkretną wartość jeśli jest znana
    // await expect(userEmail).toContainText("test@example.com");
  });

  test("powinien umożliwić wylogowanie", async ({ page }) => {
    // Arrange
    const userMenu = page.getByTestId("user-menu");

    // Act
    await userMenu.click();
    const logoutButton = page.getByTestId("logout-button");
    await logoutButton.click();

    // Assert - sprawdzamy czy zostaliśmy przekierowani do strony logowania
    await expect(page).toHaveURL(/login|home/);

    // Sprawdzamy czy elementy wymagające logowania znikły
    await expect(userMenu).not.toBeVisible();
  });
});
