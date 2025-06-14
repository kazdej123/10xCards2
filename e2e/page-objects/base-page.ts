import { Page, Locator, expect } from "@playwright/test";

/**
 * Base Page Object Model class
 * Contains common methods and utilities for all page objects
 */
export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Get element by data-testid attribute
   * This follows the convention specified in the guidelines
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElementVisible(testId: string): Promise<void> {
    await this.getByTestId(testId).waitFor({ state: "visible" });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(testId: string): Promise<void> {
    await this.getByTestId(testId).waitFor({ state: "hidden" });
  }

  /**
   * Click element by test id
   */
  async clickByTestId(testId: string): Promise<void> {
    await this.getByTestId(testId).click();
  }

  /**
   * Fill input by test id
   */
  async fillByTestId(testId: string, value: string): Promise<void> {
    await this.getByTestId(testId).fill(value);
  }

  /**
   * Get text content by test id
   */
  async getTextByTestId(testId: string): Promise<string> {
    return (await this.getByTestId(testId).textContent()) || "";
  }

  /**
   * Take a screenshot with a specific name
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `e2e/results/screenshots/${name}.png` });
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Verify current URL
   */
  async verifyUrl(expectedUrl: string): Promise<void> {
    await expect(this.page).toHaveURL(expectedUrl);
  }

  /**
   * Verify page title
   */
  async verifyTitle(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Wait for and verify element text
   */
  async verifyElementText(testId: string, expectedText: string): Promise<void> {
    await expect(this.getByTestId(testId)).toHaveText(expectedText);
  }

  /**
   * Verify element is visible
   */
  async verifyElementVisible(testId: string): Promise<void> {
    await expect(this.getByTestId(testId)).toBeVisible();
  }

  /**
   * Verify element is hidden
   */
  async verifyElementHidden(testId: string): Promise<void> {
    await expect(this.getByTestId(testId)).toBeHidden();
  }

  /**
   * Get the page instance for direct access when needed
   */
  getPage(): Page {
    return this.page;
  }
}
