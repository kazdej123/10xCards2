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

    // Bezpieczne ustawienie tokena
    if (responseData.token && typeof responseData.token === "string") {
      await this.page.evaluate((token) => {
        localStorage.setItem("authToken", token);
      }, responseData.token);
    } else {
      throw new Error("Invalid token received from API");
    }

    return responseData;
  }

  // Walidacja stanu logowania
  async verifyLoggedIn() {
    // Sprawdzamy czy jesteśmy na stronie wymagającej logowania
    await expect(this.page.getByTestId("user-menu")).toBeVisible();
  }

  async verifyLoggedOut() {
    // Sprawdzamy czy jesteśmy na stronie logowania lub publicznej
    const currentUrl = this.page.url();
    expect(currentUrl).toMatch(/login|home|landing/);
  }

  // Wylogowanie
  async logout() {
    const userMenu = this.page.getByTestId("user-menu");
    await userMenu.click();

    const logoutButton = this.page.getByTestId("logout-button");
    await logoutButton.click();

    await this.verifyLoggedOut();
  }
}
