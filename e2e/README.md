# E2E Testing with Playwright

This directory contains end-to-end tests for the 10xCards application using Playwright.

## Directory Structure

```
e2e/
├── fixtures/              # Custom test fixtures and utilities
│   ├── global-setup.ts    # Global setup for all tests
│   ├── global-teardown.ts # Global teardown for all tests
│   └── test-fixtures.ts   # Custom test fixtures
├── page-objects/          # Page Object Model classes
│   ├── base-page.ts      # Base class for all page objects
│   └── home-page.ts      # Home page specific methods
├── tests/                 # Test files
│   └── example.spec.ts   # Example test demonstrating AAA pattern
├── results/              # Test results and artifacts
│   └── screenshots/      # Screenshots from tests
└── README.md            # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- Playwright installed (automatically done when following setup)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

### Running Tests

#### Basic Commands

```bash
# Run all e2e tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Generate test code using codegen
npm run test:e2e:codegen
```

#### Development

```bash
# Start dev server for e2e testing
npm run dev:e2e

# In another terminal, run tests
npm run test:e2e
```

## Writing Tests

### Guidelines

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use Page Object Model**: Organize page interactions in classes
3. **Use data-testid**: For resilient element selection
4. **Descriptive Test Names**: Clearly describe what the test does
5. **Independent Tests**: Each test should be able to run in isolation

### Example Test Structure

```typescript
import { test, expect } from "@playwright/test";
import { HomePage } from "../page-objects/home-page";

test.describe("Feature Name", () => {
  test("should do something specific", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);
    
    // Act
    await homePage.navigateToHome();
    
    // Assert
    await homePage.verifyHomePageLoaded();
  });
});
```

### Using data-testid

Add data-testid attributes to your components:

```html
<button data-testid="submit-button">Submit</button>
```

Then use them in tests:

```typescript
await page.getByTestId('submit-button').click();
```

## Configuration

The Playwright configuration is in `playwright.config.ts` at the root level.

Key configurations:
- **Browser**: Only Chromium (Desktop Chrome)
- **Base URL**: http://localhost:3000
- **Parallel**: Enabled for faster execution
- **Retries**: 2 retries on CI, 0 locally
- **Screenshots**: Only on failure
- **Video**: Retain on failure
- **Trace**: On first retry

## CI/CD Integration

The tests are configured to run in CI with:
- Reduced parallelism (workers: 1)
- Automatic retries (2 attempts)
- Multiple report formats (HTML, JSON, JUnit)

## Visual Testing

Use visual comparison for UI testing:

```typescript
await expect(page).toHaveScreenshot("page-name.png");
```

## Debugging

1. **Trace Viewer**: Automatically enabled on first retry
2. **Debug Mode**: Use `npm run test:e2e:debug`
3. **Headed Mode**: Use `npm run test:e2e:headed`
4. **Screenshots**: Check `e2e/results/screenshots/`

## Best Practices

1. **Isolation**: Use browser contexts for test isolation
2. **Cleanup**: Implement proper teardown in fixtures
3. **API Testing**: Use Playwright for backend validation
4. **Performance**: Use parallel execution
5. **Maintenance**: Keep page objects updated with UI changes

## Troubleshooting

### Common Issues

1. **Timeout Issues**: Increase timeout in playwright.config.ts
2. **Element Not Found**: Check data-testid attributes
3. **Flaky Tests**: Add proper waits and assertions
4. **CI Failures**: Check screenshots and trace files

### Environment Issues

1. **Port Conflicts**: Ensure port 3000 is available
2. **Dev Server**: Make sure `npm run dev:e2e` is running
3. **Dependencies**: Run `npm install` and `npx playwright install chromium`

## New Tests and Data-testid

### Overview

This directory contains complete E2E tests for the 10xCards application.

### Key Components

### 🔧 Configuration (playwright.config.ts)
- Configured only for Chromium/Desktop Chrome
- Enabled trace and debugging
- Parallel execution
- Automatic dev server

### 📋 Page Object Models
- **BasePage**: Common methods for all pages
- **HomePage**: Methods specific to the home page
- **GeneratePage**: Methods for the generate flashcard page

### 🏷️ Data-testid

According to best practices, all UI components contain data-testid selectors:

#### Authentication Components
- `auth-buttons-container` - authentication buttons container
- `login-button` - login button
- `register-button` - register button
- `logout-button` - logout button

#### Generate Flashcard Components
- `flashcard-generation-view` - main generation view
- `text-input-area` - text input area
- `source-text-input` - text input field
- `character-counter` - character counter
- `text-validation-message` - validation message
- `generate-button` - generate button
- `error-message` - error message
- `flashcard-list` - flashcard list
- `bulk-save-buttons` - bulk save buttons container
- `stats-counter` - stats counter
- `save-accepted-button` - save accepted button
- `save-all-button` - save all button

### Test Scenarios

#### 🏠 Home Page (home-page.spec.ts)
- Loading the home page
- Displaying authentication buttons
- Navigating to login/register pages
- Page structure and accessibility
- Visual tests (screenshots)

#### 🎯 Generate Flashcards (generate.spec.ts)
- Loading the generate page
- Validating text length
- Character counter
- Enabling/disabling generate button
- Accessibility tests

#### 🔄 Navigation (example.spec.ts)
- Navigation flow between pages
- Branding consistency
- Page structure
- Visual tests

#### 🌐 API (api.spec.ts)
- API endpoint tests
- Input data validation
- Error handling
- CORS tests

## Running Tests

### Preparation
```bash
# Install dependencies
npm install

# Start dev server for e2e testing
npm run dev:e2e
```

### Running Tests
```bash
# All tests
npx playwright test

# Specific group of tests
npx playwright test home-page.spec.ts
npx playwright test generate.spec.ts
npx playwright test api.spec.ts

# Test in headed mode (with browser visible)
npx playwright test --headed

# Test with debugging
npx playwright test --debug
```

### Developer Tools
```bash
# Codegen - recording tests
npx playwright codegen http://localhost:3000

# Trace viewer - debugging
npx playwright show-trace

# HTML report
npx playwright show-report
```

## Best Practices

### ✅ AAA Structure
All tests use the Arrange-Act-Assert pattern:
```typescript
test("should do something", async ({ page }) => {
  // Arrange
  const homePage = new HomePage(page);
  
  // Act
  await homePage.navigateToHome();
  
  // Assert
  await expect(page).toHaveTitle(/Expected Title/);
});
```

### ✅ Data-testid
Use data-testid selectors instead of CSS selectors:
```typescript
// ✅ Correct
await page.getByTestId("login-button").click();

// ❌ Incorrect
await page.click(".login-btn");
```

### ✅ Page Object Model
Encapsulate page logic in Page Objects:
```typescript
// ✅ Correct
await homePage.clickLoginButton();

// ❌ Incorrect
await page.getByTestId("login-button").click();
```

### ✅ Fixtures
Use fixtures for shared Page Objects:
```typescript
test("should test something", async ({ homePage, generatePage }) => {
  // homePage and generatePage are automatically available
});
```

## Debugging

### Trace Viewer
```bash
npx playwright test --trace on
npx playwright show-trace
```

### Screenshots
```bash
# Automatic screenshots on failures
npx playwright test

# Visual comparison
await expect(page).toHaveScreenshot("expected.png");
```

### Console
```bash
# Logs in console
npx playwright test --reporter=line
```

## Extensions

### Adding New Tests
1. Add data-testid selectors to components
2. Extend Page Objects in `page-objects/`
3. Create new test file in `tests/`
4. Use AAA pattern

### Adding New Page Objects
1. Extend `BasePage`
2. Add to `test-fixtures.ts`
3. Use in tests via fixtures

### Mocking API
```typescript
await page.route("**/api/endpoint", (route) => {
  route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ data: "mock" }),
  });
});
```

## Monitoring

### CI/CD
Tests are configured to:
- Parallel execution
- Retry on failures
- Generate reports (HTML, JSON, JUnit)
- Trace on failures

### Metrics
- Test execution time
- Test pass percentage
- Visual coverage (screenshots)

## Support

In case of issues:
1. Check if dev server is running: `npm run dev:e2e`
2. Check trace: `npx playwright show-trace`
3. Run with debug: `npx playwright test --debug`
4. Check HTML report: `npx playwright show-report` 