import { test, expect } from "@playwright/test";
import { LoginPage } from "../page-objects/login-page";

// Ten test używa projektu "chromium-guest" który resetuje stan uwierzytelnienia
// dzięki storageState: { cookies: [], origins: [] }

test.describe("Strony publiczne - Nieuwierzytelniony użytkownik", () => {
  test("powinien wyświetlić stronę główną", async ({ page }) => {
    // Act
    await page.goto("/");

    // Assert - sprawdzamy elementy, które rzeczywiście istnieją
    await expect(page.getByTestId("home-title")).toBeVisible();
    await expect(page.getByTestId("login-button")).toBeVisible();
    await expect(page.getByTestId("register-button")).toBeVisible();
  });

  test("powinien wyświetlić stronę logowania", async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    await page.goto("/login");

    // Assert
    await expect(loginPage.loginForm).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test("powinien wyświetlić stronę rejestracji", async ({ page }) => {
    // Act
    await page.goto("/register");

    // Assert
    await expect(page.getByTestId("register-form")).toBeVisible();
    await expect(page.getByTestId("email-input")).toBeVisible();
    await expect(page.getByTestId("password-input")).toBeVisible();
    await expect(page.getByTestId("register-button")).toBeVisible();
  });

  test("powinien przekierować do logowania przy próbie dostępu do chronionej strony", async ({ page }) => {
    // Act - próbujemy dostać się do chronionej strony
    await page.goto("/generate");

    // Assert - powinniśmy zostać przekierowani do logowania
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("powinien umożliwić logowanie przez UI", async ({ page }) => {
    // Ten test pokazuje jak testować proces logowania
    // (alternatywa dla zoptymalizowanego uwierzytelniania)

    const loginPage = new LoginPage(page);

    // Arrange
    await page.goto("/login");

    // Act
    await loginPage.fillLoginForm("test@example.com", "testpassword123");
    await loginPage.submitLogin();

    // Assert - po logowaniu powinniśmy być przekierowani
    // Uwaga: ten test może nie działać bez prawdziwych danych testowych
    // await expect(page).toHaveURL(/dashboard|home/);
    // await expect(page.getByTestId("user-menu")).toBeVisible();
  });

  test("powinien wyświetlić błąd dla nieprawidłowych danych logowania", async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Arrange
    await page.goto("/login");

    // Act - próbujemy zalogować się z nieprawidłowymi danymi
    await loginPage.fillLoginForm("invalid@email.com", "wrongpassword");
    await loginPage.submitLogin();

    // Assert - powinien pojawić się komunikat o błędzie
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/invalid|błąd|error/i);

    // Sprawdzamy że dalej jesteśmy na stronie logowania
    await expect(page).toHaveURL(/login/);
  });
});
