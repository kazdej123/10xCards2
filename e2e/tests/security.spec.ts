import { test, expect } from "@playwright/test";
import { LoginPage } from "../page-objects/login-page";

test.describe("Security Tests - Authorization & Authentication", () => {
  test.describe("Access Control", () => {
    test("should block unauthenticated access to protected routes", async ({ page }) => {
      // Test dla różnych chronionych ścieżek
      const protectedRoutes = ["/dashboard", "/settings", "/admin", "/profile"];

      for (const route of protectedRoutes) {
        await page.goto(route);

        // Powinniśmy zostać przekierowani do logowania
        await expect(page).toHaveURL(/login/);
        await expect(page.getByTestId("login-form")).toBeVisible();
      }
    });

    test("should prevent regular user from accessing admin panel", async ({ page, context }) => {
      // Użyj stanu zwykłego użytkownika
      await context.addInitScript(() => {
        // Symuluj token zwykłego użytkownika
        localStorage.setItem("authToken", "regular-user-token");
      });

      // Próba dostępu do panelu administratora
      await page.goto("/admin");

      // Sprawdź czy zostaliśmy przekierowani lub otrzymaliśmy błąd 403
      const currentUrl = page.url();
      if (currentUrl.includes("/admin")) {
        // Jeśli jesteśmy w panelu, sprawdź czy widzimy komunikat o braku uprawnień
        await expect(page.getByTestId("access-denied")).toBeVisible();
      } else {
        // Powinniśmy zostać przekierowani
        expect(currentUrl).toMatch(/dashboard|login|403/);
      }
    });
  });

  test.describe("Session Management", () => {
    test("should handle expired tokens gracefully", async ({ page }) => {
      // Ustaw wygasły token
      await page.addInitScript(() => {
        localStorage.setItem("authToken", "expired-token");
      });

      await page.goto("/dashboard");

      // Powinniśmy zostać przekierowani do logowania
      await expect(page).toHaveURL(/login/);
      await expect(page.getByTestId("login-form")).toBeVisible();
    });

    test("should clear session data on logout", async ({ page, context }) => {
      const loginPage = new LoginPage(page);

      // Ustaw sesje
      await context.addInitScript(() => {
        localStorage.setItem("authToken", "valid-token");
        sessionStorage.setItem("userData", '{"id": 1, "email": "test@example.com"}');
      });

      await page.goto("/dashboard");

      // Wyloguj się
      await loginPage.logout();

      // Sprawdź czy dane sesji zostały wyczyszczone
      const authToken = await page.evaluate(() => localStorage.getItem("authToken"));
      const userData = await page.evaluate(() => sessionStorage.getItem("userData"));

      expect(authToken).toBeNull();
      expect(userData).toBeNull();
    });
  });

  test.describe("API Security", () => {
    test("should return 401 for unauthenticated API requests", async ({ request }) => {
      // Test różnych chronionych endpointów API
      const protectedEndpoints = ["/api/user/profile", "/api/flashcards", "/api/admin/users"];

      for (const endpoint of protectedEndpoints) {
        const response = await request.get(endpoint);

        // Oczekujemy błędu autoryzacji
        expect([401, 403]).toContain(response.status());
      }
    });

    test("should validate JWT tokens properly", async ({ request }) => {
      // Test z nieprawidłowymi tokenami
      const invalidTokens = [
        "invalid-token",
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.invalid", // nieprawidłowy JWT
        "", // pusty token
        "Bearer ", // pusty Bearer token
      ];

      for (const token of invalidTokens) {
        const response = await request.get("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect([401, 403]).toContain(response.status());
      }
    });
  });

  test.describe("Input Validation", () => {
    test("should prevent SQL injection in login form", async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigateToLogin();

      // Próby SQL injection
      const maliciousInputs = ["admin'--", "admin' OR '1'='1", "'; DROP TABLE users; --"];

      for (const input of maliciousInputs) {
        await loginPage.fillLoginForm(input, "password");
        await loginPage.submitLogin();

        // Powinien być błąd walidacji, nie błąd serwera
        await expect(loginPage.errorMessage).toBeVisible();
        const errorText = await loginPage.errorMessage.textContent();
        expect(errorText?.toLowerCase()).toMatch(/invalid|nieprawidłowe|błąd/);
      }
    });

    test("should sanitize user input in forms", async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigateToLogin();

      // Test XSS
      const xssPayload = '<script>alert("XSS")</script>';

      await loginPage.fillLoginForm(xssPayload, "password");
      await loginPage.submitLogin();

      // Sprawdź czy payload nie został wykonany
      const pageContent = await page.content();
      expect(pageContent).not.toContain('<script>alert("XSS")</script>');
    });
  });

  test.describe("Rate Limiting", () => {
    test("should implement rate limiting on login attempts", async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigateToLogin();

      // Wykonaj wiele nieudanych prób logowania
      const maxAttempts = 5;

      for (let i = 0; i < maxAttempts + 1; i++) {
        await loginPage.fillLoginForm("test@example.com", "wrongpassword");
        await loginPage.submitLogin();

        if (i < maxAttempts) {
          await expect(loginPage.errorMessage).toBeVisible();
        }
      }

      // Po przekroczeniu limitu powinien pojawić się odpowiedni komunikat
      const finalError = await loginPage.errorMessage.textContent();
      expect(finalError?.toLowerCase()).toMatch(/limit|zbyt.*prób|blocked/);
    });
  });
});
