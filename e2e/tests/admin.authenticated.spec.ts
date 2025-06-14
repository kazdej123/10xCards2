import { test, expect } from "@playwright/test";

// Ten test używa stanu uwierzytelnienia administratora z pliku e2e/.auth/admin.json
// dzięki konfiguracji projektu "chromium-admin" w playwright.config.ts

test.describe("Panel administratora - Uwierzytelniony administrator", () => {
  test.beforeEach(async ({ page }) => {
    // Strona jest już uwierzytelniona jako administrator dzięki storageState
    await page.goto("/admin");
  });

  test("powinien wyświetlić panel administratora", async ({ page }) => {
    // Arrange - dane już załadowane w beforeEach

    // Act & Assert
    await expect(page.getByTestId("admin-panel")).toBeVisible();
    await expect(page.getByTestId("admin-title")).toContainText("Panel Administratora");
    await expect(page.getByTestId("user-menu")).toBeVisible();
  });

  test("powinien umożliwić zarządzanie użytkownikami", async ({ page }) => {
    // Act
    const usersSection = page.getByTestId("users-management");
    await usersSection.click();

    // Assert
    await expect(page).toHaveURL(/admin\/users/);
    await expect(page.getByTestId("users-table")).toBeVisible();
    await expect(page.getByTestId("add-user-button")).toBeVisible();
  });

  test("powinien mieć dostęp do ustawień systemowych", async ({ page }) => {
    // Act
    const settingsLink = page.getByTestId("system-settings-link");
    await settingsLink.click();

    // Assert
    await expect(page).toHaveURL(/admin\/settings/);
    await expect(page.getByTestId("system-settings-form")).toBeVisible();
  });

  test("powinien wyświetlić statystyki systemu", async ({ page }) => {
    // Act
    const statsSection = page.getByTestId("system-stats");

    // Assert
    await expect(statsSection).toBeVisible();
    await expect(page.getByTestId("total-users")).toBeVisible();
    await expect(page.getByTestId("active-sessions")).toBeVisible();
  });
});
