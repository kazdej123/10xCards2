import { test, expect } from "@playwright/test";
import { GeneratePage } from "../page-objects/generate-page";

test.describe("Flashcard Generation Tests", () => {
  // Sample valid text for testing (>1000 characters)
  const validText = `
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, 
    eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. 
    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
    Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
    Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?
    Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
  `.trim();

  const shortText = "This text is too short";
  const tooLongText = "a".repeat(10001);

  test("should load generate page successfully", async ({ page }) => {
    // Arrange
    const generatePage = new GeneratePage(page);

    // Act
    await generatePage.navigateToGenerate();

    // Assert
    await generatePage.verifyGeneratePageLoaded();
    await expect(page).toHaveTitle(/Generuj fiszki/i);
  });

  test("should display character counter correctly", async ({ page }) => {
    // Arrange
    const generatePage = new GeneratePage(page);
    await generatePage.navigateToGenerate();

    // Act
    await generatePage.fillSourceText("Hello World!");

    // Assert
    const counterText = await generatePage.getCharacterCount();
    expect(counterText).toContain("12 / 10000");
  });

  test("should show validation message for text too short", async ({ page }) => {
    // Arrange
    const generatePage = new GeneratePage(page);
    await generatePage.navigateToGenerate();

    // Act
    await generatePage.fillSourceText(shortText);

    // Assert
    const isValidationVisible = await generatePage.isValidationMessageVisible();
    expect(isValidationVisible).toBe(true);

    const validationMessage = await generatePage.getValidationMessage();
    expect(validationMessage).toContain("co najmniej 1000 znaków");

    const isButtonDisabled = await generatePage.isGenerateButtonDisabled();
    expect(isButtonDisabled).toBe(true);
  });

  test("should show validation message for text too long", async ({ page }) => {
    // Arrange
    const generatePage = new GeneratePage(page);
    await generatePage.navigateToGenerate();

    // Act
    await generatePage.fillSourceText(tooLongText);

    // Assert
    const isValidationVisible = await generatePage.isValidationMessageVisible();
    expect(isValidationVisible).toBe(true);

    const validationMessage = await generatePage.getValidationMessage();
    expect(validationMessage).toContain("nie więcej niż 10000 znaków");

    const isButtonDisabled = await generatePage.isGenerateButtonDisabled();
    expect(isButtonDisabled).toBe(true);
  });

  test("should enable generate button for valid text length", async ({ page }) => {
    // Arrange
    const generatePage = new GeneratePage(page);
    await generatePage.navigateToGenerate();

    // Act
    await generatePage.fillSourceText(validText);

    // Assert
    const isValidationVisible = await generatePage.isValidationMessageVisible();
    expect(isValidationVisible).toBe(false);

    const isButtonDisabled = await generatePage.isGenerateButtonDisabled();
    expect(isButtonDisabled).toBe(false);
  });

  test("should take screenshot of generate page", async ({ page }) => {
    // Arrange
    const generatePage = new GeneratePage(page);

    // Act
    await generatePage.navigateToGenerate();
    await generatePage.fillSourceText(validText);
    await page.waitForLoadState("networkidle");

    // Assert - Visual comparison
    await expect(page).toHaveScreenshot("generate-page-with-text.png");
  });
});
