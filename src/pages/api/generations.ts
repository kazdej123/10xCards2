import { z } from "zod";
import type { APIRoute } from "astro";
import type { GenerateFlashcardsCommand } from "../../types";
import { GenerationService } from "../../lib/services/generationService";

export const prerender = false;

// Validation schema for the input
const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text cannot exceed 10000 characters"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Authentication required",
          message: "You must be logged in to generate flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if OpenRouter API key is configured
    const openRouterApiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return new Response(
        JSON.stringify({
          error: "Service configuration error",
          message: "AI service is not properly configured",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 1. Parse and validate input
    const body = (await request.json()) as GenerateFlashcardsCommand;
    const result = generateFlashcardsSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: result.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Generate flashcards using service with authenticated user ID
    const generationService = new GenerationService(locals.supabase, openRouterApiKey, locals.user.id);
    const response = await generationService.generateFlashcards(result.data.source_text);

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check if it's an AI service error (should return 503)
    if (
      errorMessage.includes("AI service") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("Failed to generate flashcards")
    ) {
      return new Response(
        JSON.stringify({
          error: "Service temporarily unavailable",
          message: "AI service is currently unavailable. Please try again later.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check for authentication errors
    if (errorMessage.includes("Invalid API key") || errorMessage.includes("401")) {
      return new Response(
        JSON.stringify({
          error: "Service configuration error",
          message: "AI service authentication failed",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // All other errors return 500
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
