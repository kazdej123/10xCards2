import { expect, type Page } from "@playwright/test";

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

/**
 * Waits for React hydration to complete in CI environment
 * This is particularly important for Astro + React SSR apps
 */
export async function waitForReactHydration(page: Page): Promise<void> {
  // In CI environment, React hydration can take longer
  if (process.env.CI) {
    console.log("🔧 CI detected - waiting for React hydration...");
    await page.waitForTimeout(3000);

    // Additional check - wait for React to be available
    await page
      .waitForFunction(
        () => {
          // Check if React is available and components are hydrated
          return window.React !== undefined || document.querySelector("[data-reactroot]") !== null;
        },
        { timeout: 10000 }
      )
      .catch(() => {
        // If React detection fails, that's okay - some components might not use React
        console.log("⚠️ React detection timeout - proceeding anyway");
      });
  } else {
    // Local environment - shorter wait
    await page.waitForTimeout(1000);
  }
}

/**
 * Enhanced navigation with hydration wait
 */
export async function navigateAndWaitForHydration(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await waitForReactHydration(page);
}

/**
 * Wait for test element with CI-friendly timeout and better error handling
 */
export async function waitForTestElement(
  page: Page,
  testId: string,
  options: { timeout?: number; visible?: boolean } = {}
): Promise<void> {
  const timeout = options.timeout || (process.env.CI ? 30000 : 15000);
  const shouldBeVisible = options.visible !== false;

  try {
    const element = page.getByTestId(testId);
    if (shouldBeVisible) {
      await expect(element).toBeVisible({ timeout });
    } else {
      await expect(element).toBeAttached({ timeout });
    }
  } catch (error) {
    console.error(`❌ Failed to find element with testId: ${testId}`);
    console.error(`   Timeout: ${timeout}ms`);
    console.error(`   CI environment: ${process.env.CI ? "Yes" : "No"}`);
    throw error;
  }
}

/**
 * Debug helper to log page state
 */
export async function debugPageState(page: Page, context: string): Promise<void> {
  if (process.env.CI) {
    console.log(`🐛 Debug page state (${context}):`);
    console.log(`   URL: ${page.url()}`);
    console.log(`   Title: ${await page.title()}`);

    // Check for common elements
    const elements = ["flashcard-generation-view", "logout-button", "source-text-input", "generate-button"];

    for (const testId of elements) {
      const isVisible = await page
        .getByTestId(testId)
        .isVisible()
        .catch(() => false);
      console.log(`   ${testId}: ${isVisible ? "✅ visible" : "❌ not visible"}`);
    }
  }
}
