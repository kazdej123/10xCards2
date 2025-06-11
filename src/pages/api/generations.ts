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

    // 2. Generate flashcards using service
    const generationService = new GenerationService(locals.supabase);
    const response = await generationService.generateFlashcards(result.data.source_text);

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle different types of errors
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check if it's an AI service error (should return 503)
    if (errorMessage.includes("AI service") || errorMessage.includes("timeout")) {
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
