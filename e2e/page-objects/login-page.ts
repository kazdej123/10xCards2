import { expect } from "@playwright/test";
import { BasePage } from "./base-page";

export class LoginPage extends BasePage {
  // Locators
  get emailInput() {
    return this.page.getByTestId("email-input");
  }

  get passwordInput() {
    return this.page.getByTestId("password-input");
  }

  get loginButton() {
    return this.page.getByTestId("login-button");
  }

  get loginForm() {
    return this.page.getByTestId("login-form");
  }

  get errorMessage() {
    return this.page.getByTestId("error-message");
  }

  get successMessage() {
    return this.page.getByTestId("success-message");
  }

  // Actions - UI Login (tymczasowe podejście)
  async navigateToLogin() {
    await this.page.goto("/login");
    await expect(this.loginForm).toBeVisible();
  }

  async fillLoginForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submitLogin() {
    await this.loginButton.click();
  }

  async loginViaUI(email: string, password: string) {
    await this.navigateToLogin();
    await this.fillLoginForm(email, password);
    await this.submitLogin();

    // Czekamy na przekierowanie po udanym logowaniu
    await this.page.waitForURL(/dashboard|home/);
  }

  // Zoptymalizowane logowanie przez API
  async loginViaAPI(email: string, password: string) {
    // First navigate to the login page to establish proper context
    await this.page.goto("/login");

    const response = await this.page.request.post("/api/auth/login", {
      data: {
        email,
        password,
      },
    });

    // Szczegółowa walidacja odpowiedzi
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");

    const responseData = await response.json();

    // Walidacja struktury odpowiedzi
    expect(responseData).toHaveProperty("token");
    expect(responseData).toHaveProperty("user");
    expect(typeof responseData.token).toBe("string");
    expect(responseData.token.length).toBeGreaterThan(0);

    // The authentication should be handled through cookies by Supabase
    // Since we made the API call through the same context, the cookies should be set
    // Let's navigate to the generate page to check if authentication worked
    await this.page.goto("/generate");

    return responseData;
  }

  // Walidacja stanu logowania
  async verifyLoggedIn() {
    // Sprawdzamy czy jesteśmy na stronie wymagającej logowania
    // Zamiast nieistniejącego user-menu, sprawdzamy logout-button lub generate page
    const currentUrl = this.page.url();
    if (currentUrl.includes("/generate")) {
      await expect(this.page.getByTestId("logout-button")).toBeVisible();
    } else {
      // Alternatywnie sprawdzamy czy nie jesteśmy na stronie logowania
      await expect(this.page).not.toHaveURL(/\/login/);
    }
  }

  async verifyLoggedOut() {
    // Sprawdzamy czy jesteśmy na stronie logowania lub publicznej
    const currentUrl = this.page.url();
    expect(currentUrl).toMatch(/login|home|landing/);
  }

  // Wylogowanie
  async logout() {
    // Sprawdzamy czy logout button jest dostępny bezpośrednio
    const logoutButton = this.page.getByTestId("logout-button");
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      throw new Error("Logout button not found - user may not be logged in");
    }

    await this.verifyLoggedOut();
  }
}
