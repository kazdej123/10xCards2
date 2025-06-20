import { test, expect } from "@playwright/test";
import { GeneratePage } from "../page-objects/generate-page";

test.describe("Generate Page Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Przejdź do strony generowania
    await page.goto("/generate");
  });

  test("should redirect to login if not authenticated", async ({ page }) => {
    // Assert - powinno przekierować do logowania
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("should display generate form when authenticated", async ({ page }) => {
    // Pomijamy jeśli nie jesteśmy uwierzytelnieni
    if (page.url().includes("/login")) {
      test.skip();
    }

    // Assert - sprawdzamy elementy formularza
    await expect(page.getByTestId("flashcard-generation-view")).toBeVisible();
    await expect(page.getByTestId("source-text-input")).toBeVisible();
    await expect(page.getByTestId("generate-button")).toBeVisible();
  });

  test("should show validation for short text", async ({ page }) => {
    // Pomijamy jeśli nie jesteśmy uwierzytelnieni
    if (page.url().includes("/login")) {
      test.skip();
    }

    // Act - wprowadź za krótki tekst
    await page.getByTestId("source-text-input").fill("Krótki tekst");

    // Assert - sprawdź komunikat walidacji
    await expect(page.getByTestId("text-validation-message")).toBeVisible();
    await expect(page.getByTestId("text-validation-message")).toContainText("co najmniej 1000 znaków");
  });

  test("should show validation for long text", async ({ page }) => {
    // Pomijamy jeśli nie jesteśmy uwierzytelnieni
    if (page.url().includes("/login")) {
      test.skip();
    }

    // Act - wprowadź za długi tekst
    const longText = "A".repeat(10001);
    await page.getByTestId("source-text-input").fill(longText);

    // Assert - sprawdź komunikat walidacji
    await expect(page.getByTestId("text-validation-message")).toBeVisible();
    await expect(page.getByTestId("text-validation-message")).toContainText("nie więcej niż 10000 znaków");
  });

  test("should enable generate button with valid text", async ({ page }) => {
    // Pomijamy jeśli nie jesteśmy uwierzytelnieni
    if (page.url().includes("/login")) {
      test.skip();
    }

    // Act - wprowadź prawidłowy tekst
    const validText = "A".repeat(1500);
    await page.getByTestId("source-text-input").fill(validText);

    // Assert - przycisk powinien być dostępny
    await expect(page.getByTestId("generate-button")).toBeEnabled();
  });
});
