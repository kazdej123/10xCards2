import { BasePage } from "./base-page";

/**
 * Home Page Object Model
 * Contains methods specific to the home page
 */
export class HomePage extends BasePage {
  /**
   * Navigate to home page
   */
  async navigateToHome(): Promise<void> {
    await this.goto("/");
    await this.waitForPageLoad();
  }

  /**
   * Verify home page is loaded
   */
  async verifyHomePageLoaded(): Promise<void> {
    await this.verifyUrl("/");
    await this.verifyElementVisible("auth-buttons-container");
  }

  /**
   * Verify app title is displayed
   */
  async verifyAppTitle(): Promise<void> {
    await this.page.waitForSelector('h1:has-text("10xCards.ai")', { state: "visible" });
  }

  /**
   * Click login button
   */
  async clickLoginButton(): Promise<void> {
    await this.clickByTestId("login-button");
  }

  /**
   * Click register button
   */
  async clickRegisterButton(): Promise<void> {
    await this.clickByTestId("register-button");
  }

  /**
   * Check if user is logged in by looking for logout button
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="logout-button"]', { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click logout button (when logged in)
   */
  async clickLogoutButton(): Promise<void> {
    await this.clickByTestId("logout-button");
  }

  /**
   * Navigate to generate page (when logged in)
   */
  async navigateToGeneratePage(): Promise<void> {
    await this.page.click('a[href="/generate"]');
    await this.waitForPageLoad();
  }

  /**
   * Example method for clicking navigation menu
   */
  async clickNavigationMenu(): Promise<void> {
    await this.clickByTestId("navigation-menu");
  }

  /**
   * Example method for searching
   */
  async performSearch(searchTerm: string): Promise<void> {
    await this.fillByTestId("search-input", searchTerm);
    await this.clickByTestId("search-button");
  }

  /**
   * Example method for getting welcome message
   */
  async getWelcomeMessage(): Promise<string> {
    return await this.getTextByTestId("welcome-message");
  }
}
