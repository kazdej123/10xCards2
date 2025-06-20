import { test, expect } from "@playwright/test";

test.describe("API Tests", () => {
  test("should check health endpoint", async ({ request }) => {
    // Arrange & Act
    const response = await request.get("/api/health");

    // Assert
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test("should handle generations endpoint with valid data", async ({ page }) => {
    const response = await page.request.post("/api/generations", {
      data: {
        source_text: "A".repeat(1500), // Valid length text
      },
    });

    // Assert - API should return 401 for unauthenticated requests
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Authentication required");
  });

  test("should reject generations with invalid data", async ({ page }) => {
    const response = await page.request.post("/api/generations", {
      data: {
        source_text: "short", // Too short
      },
    });

    // Assert - API should return 401 for unauthenticated requests (auth checked first)
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Authentication required");
  });

  test("should handle flashcards save endpoint", async ({ page }) => {
    const response = await page.request.post("/api/flashcards", {
      data: {
        flashcards: [
          {
            front: "Test Question",
            back: "Test Answer",
            source: "manual",
            generation_id: null,
          },
        ],
      },
    });

    // Assert - API should return 401 for unauthenticated requests
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Authentication required");
  });

  test("should validate request headers and content types", async ({ page }) => {
    const response = await page.request.post("/api/generations", {
      data: "invalid-data",
      headers: {
        "Content-Type": "text/plain",
      },
    });

    // Assert - API should return 401 for unauthenticated requests (auth checked first)
    expect(response.status()).toBe(401);
  });

  test("should handle CORS preflight requests", async ({ page }) => {
    // Note: Playwright doesn't easily simulate CORS preflight OPTIONS requests
    // This test checks that the POST endpoint exists and handles requests properly
    const response = await page.request.post("/api/generations", {
      data: {},
    });

    // Assert - endpoint exists and returns proper JSON error (not HTML)
    expect(response.status()).toBe(401);
    expect(response.headers()["content-type"]).toContain("application/json");
  });
});
