import { BasePage } from "./base-page";

/**
 * Generate Page Object Model
 * Contains methods specific to the flashcard generation page
 */
export class GeneratePage extends BasePage {
  /**
   * Navigate to generate page
   */
  async navigateToGenerate(): Promise<void> {
    await this.goto("/generate");
    await this.waitForPageLoad();
  }

  /**
   * Verify generate page is loaded
   */
  async verifyGeneratePageLoaded(): Promise<void> {
    await this.verifyUrl("/generate");
    await this.verifyElementVisible("flashcard-generation-view");
  }

  /**
   * Fill source text input
   */
  async fillSourceText(text: string): Promise<void> {
    await this.fillByTestId("source-text-input", text);
  }

  /**
   * Get character counter text
   */
  async getCharacterCount(): Promise<string> {
    return await this.getTextByTestId("character-counter");
  }

  /**
   * Check if validation message is visible
   */
  async isValidationMessageVisible(): Promise<boolean> {
    try {
      await this.verifyElementVisible("text-validation-message");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get validation message text
   */
  async getValidationMessage(): Promise<string> {
    return await this.getTextByTestId("text-validation-message");
  }

  /**
   * Click generate button
   */
  async clickGenerateButton(): Promise<void> {
    await this.clickByTestId("generate-button");
  }

  /**
   * Check if generate button is disabled
   */
  async isGenerateButtonDisabled(): Promise<boolean> {
    return await this.getByTestId("generate-button").isDisabled();
  }

  /**
   * Wait for flashcards to be generated
   */
  async waitForFlashcardsGeneration(): Promise<void> {
    // Wait for skeleton loader to disappear and flashcard list to appear
    await this.page.waitForSelector('[data-testid="flashcard-list"]', { state: "visible", timeout: 30000 });
  }

  /**
   * Check if error message is visible
   */
  async isErrorMessageVisible(): Promise<boolean> {
    try {
      await this.verifyElementVisible("error-message");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.getTextByTestId("error-message");
  }

  /**
   * Get number of generated flashcards
   */
  async getFlashcardCount(): Promise<number> {
    const flashcardItems = await this.page.locator('[data-testid="flashcard-list"] > div').count();
    return flashcardItems;
  }

  /**
   * Accept first flashcard
   */
  async acceptFirstFlashcard(): Promise<void> {
    await this.page
      .locator('[data-testid="flashcard-list"] > div')
      .first()
      .locator('button:has-text("Accept")')
      .click();
  }

  /**
   * Reject first flashcard
   */
  async rejectFirstFlashcard(): Promise<void> {
    await this.page
      .locator('[data-testid="flashcard-list"] > div')
      .first()
      .locator('button:has-text("Reject")')
      .click();
  }

  /**
   * Check if bulk save buttons are visible
   */
  async areBulkSaveButtonsVisible(): Promise<boolean> {
    try {
      await this.verifyElementVisible("bulk-save-buttons");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get stats counter text
   */
  async getStatsCounter(): Promise<string> {
    return await this.getTextByTestId("stats-counter");
  }

  /**
   * Click save accepted flashcards button
   */
  async clickSaveAcceptedButton(): Promise<void> {
    await this.clickByTestId("save-accepted-button");
  }

  /**
   * Click save all flashcards button
   */
  async clickSaveAllButton(): Promise<void> {
    await this.clickByTestId("save-all-button");
  }

  /**
   * Check if save button is disabled
   */
  async isSaveButtonDisabled(buttonType: "accepted" | "all"): Promise<boolean> {
    const testId = buttonType === "accepted" ? "save-accepted-button" : "save-all-button";
    return await this.getByTestId(testId).isDisabled();
  }
}
