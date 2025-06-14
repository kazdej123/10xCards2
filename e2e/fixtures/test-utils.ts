import { Page, expect, Locator } from "@playwright/test";

/**
 * Test utilities and helper functions
 */
export class TestUtils {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for network to be idle (no requests for 500ms)
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Wait for multiple elements to be visible
   */
  async waitForElements(testIds: string[]): Promise<void> {
    const promises = testIds.map((testId) => this.page.getByTestId(testId).waitFor({ state: "visible" }));
    await Promise.all(promises);
  }

  /**
   * Take screenshot with timestamp
   */
  async takeTimestampedScreenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    await this.page.screenshot({
      path: `e2e/results/screenshots/${name}-${timestamp}.png`,
      fullPage: true,
    });
  }

  /**
   * Check if element exists without waiting
   */
  async elementExists(testId: string): Promise<boolean> {
    try {
      await this.page.getByTestId(testId).waitFor({
        state: "attached",
        timeout: 1000,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(testId: string): Promise<void> {
    await this.page.getByTestId(testId).scrollIntoViewIfNeeded();
  }

  /**
   * Get element count
   */
  async getElementCount(testId: string): Promise<number> {
    return await this.page.getByTestId(testId).count();
  }

  /**
   * Wait for text to appear in element
   */
  async waitForText(testId: string, expectedText: string): Promise<void> {
    await expect(this.page.getByTestId(testId)).toContainText(expectedText);
  }

  /**
   * Clear and fill input field
   */
  async clearAndFill(testId: string, value: string): Promise<void> {
    const input = this.page.getByTestId(testId);
    await input.clear();
    await input.fill(value);
  }

  /**
   * Select option from dropdown
   */
  async selectOption(testId: string, value: string): Promise<void> {
    await this.page.getByTestId(testId).selectOption(value);
  }

  /**
   * Check checkbox
   */
  async checkCheckbox(testId: string): Promise<void> {
    await this.page.getByTestId(testId).check();
  }

  /**
   * Uncheck checkbox
   */
  async uncheckCheckbox(testId: string): Promise<void> {
    await this.page.getByTestId(testId).uncheck();
  }

  /**
   * Wait for URL to contain specific path
   */
  async waitForUrlContains(path: string): Promise<void> {
    await this.page.waitForURL(`**/${path}**`);
  }

  /**
   * Press key combination
   */
  async pressKeyboardShortcut(keys: string): Promise<void> {
    await this.page.keyboard.press(keys);
  }

  /**
   * Hover over element
   */
  async hoverElement(testId: string): Promise<void> {
    await this.page.getByTestId(testId).hover();
  }

  /**
   * Double click element
   */
  async doubleClickElement(testId: string): Promise<void> {
    await this.page.getByTestId(testId).dblclick();
  }

  /**
   * Right click element
   */
  async rightClickElement(testId: string): Promise<void> {
    await this.page.getByTestId(testId).click({ button: "right" });
  }

  /**
   * Upload file
   */
  async uploadFile(testId: string, filePath: string): Promise<void> {
    await this.page.getByTestId(testId).setInputFiles(filePath);
  }

  /**
   * Get element attribute value
   */
  async getAttributeValue(testId: string, attribute: string): Promise<string | null> {
    return await this.page.getByTestId(testId).getAttribute(attribute);
  }
}
