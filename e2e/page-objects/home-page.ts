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
    // Add specific home page verification here
    // Example: await this.verifyElementVisible('home-header');
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
