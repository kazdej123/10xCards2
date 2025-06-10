import { z } from "zod";
import type { APIRoute } from "astro";
import type { GenerateFlashcardsCommand, GenerationCreateResponseDto, FlashcardProposalDto } from "../../types";
import { GenerationService } from "../../lib/services/generationService";

// Validation schema for input
const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text cannot exceed 10000 characters"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Validate authentication
    const supabase = locals.supabase;
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Parse and validate input
    const body = await request.json();
    const result = generateFlashcardsSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: result.error.errors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const command = result.data as GenerateFlashcardsCommand;

    // 3. Generate flashcards using service
    const generationService = new GenerationService(supabase, user.id);
    const response = await generationService.generateFlashcards(command.source_text);

    // 4. Return successful response
    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing generation request:", error);

    // Return 503 for AI service errors
    if (error instanceof Error && error.message.includes("AI service")) {
      return new Response(
        JSON.stringify({
          error: "AI service unavailable",
          message: error.message,
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return 500 for other errors
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
