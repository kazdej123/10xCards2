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
- **Base URL**: http://localhost:4321
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

1. **Port Conflicts**: Ensure port 4321 is available
2. **Dev Server**: Make sure `npm run dev:e2e` is running
3. **Dependencies**: Run `npm install` and `npx playwright install chromium` 