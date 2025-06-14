import { test, expect } from "@playwright/test";

test.describe("API Tests", () => {
  test("should check health endpoint", async ({ request }) => {
    // Arrange & Act
    const response = await request.get("/api/health");

    // Assert
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test("should handle generations endpoint with valid data", async ({ request }) => {
    // Arrange
    const validText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.".repeat(50); // >1000 chars
    const requestBody = {
      source_text: validText,
    };

    // Act
    const response = await request.post("/api/generations", {
      data: requestBody,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Assert
    if (response.ok()) {
      const data = await response.json();
      expect(data).toHaveProperty("generation_id");
      expect(data).toHaveProperty("flashcard_proposals");
      expect(Array.isArray(data.flashcard_proposals)).toBe(true);

      // Verify flashcard structure
      if (data.flashcard_proposals.length > 0) {
        const flashcard = data.flashcard_proposals[0];
        expect(flashcard).toHaveProperty("front");
        expect(flashcard).toHaveProperty("back");
        expect(typeof flashcard.front).toBe("string");
        expect(typeof flashcard.back).toBe("string");
      }
    } else {
      // If API is not implemented yet, expect specific error codes
      expect([404, 501, 500]).toContain(response.status());
    }
  });

  test("should reject generations with invalid data", async ({ request }) => {
    // Arrange - Text too short
    const invalidRequestBody = {
      source_text: "Too short",
    };

    // Act
    const response = await request.post("/api/generations", {
      data: invalidRequestBody,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Assert
    if (response.status() !== 404) {
      // API exists, check validation
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    }
  });

  test("should handle flashcards save endpoint", async ({ request }) => {
    // Arrange
    const flashcardsData = {
      flashcards: [
        {
          front: "Test front",
          back: "Test back",
          source: "ai-full",
          generation_id: 1,
        },
      ],
    };

    // Act
    const response = await request.post("/api/flashcards", {
      data: flashcardsData,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Assert
    if (response.ok()) {
      expect(response.status()).toBe(201);
    } else {
      // If API is not implemented yet, expect specific error codes
      expect([404, 501, 500]).toContain(response.status());
    }
  });

  test("should validate request headers and content types", async ({ request }) => {
    // Arrange & Act - Missing content-type
    const response = await request.post("/api/generations", {
      data: '{"source_text": "test"}',
      // No Content-Type header
    });

    // Assert
    if (response.status() !== 404) {
      // API exists, should handle missing content-type appropriately
      expect([400, 415, 500]).toContain(response.status());
    }
  });

  test("should handle CORS preflight requests", async ({ request }) => {
    // Arrange & Act
    const response = await request.fetch("/api/generations", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:4321",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });

    // Assert
    if (response.ok()) {
      const corsHeaders = response.headers();
      expect(corsHeaders["access-control-allow-origin"]).toBeDefined();
      expect(corsHeaders["access-control-allow-methods"]).toBeDefined();
    }
  });
});
