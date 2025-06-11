import { z } from "zod";
import type { APIRoute } from "astro";
import type { FlashcardsCreateCommand, FlashcardDto, CreateFlashcardsResponseDto, FlashcardInsert } from "../../types";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

export const prerender = false;

// Schema for single flashcard validation
const flashcardCreateSchema = z
  .object({
    front: z.string().min(1).max(200),
    back: z.string().min(1).max(500),
    source: z.enum(["ai-full", "ai-edited", "manual"] as const),
    generation_id: z.number().nullable(),
  })
  .refine(
    (data) => {
      // Validate generation_id based on source
      if (data.source === "manual") {
        return data.generation_id === null;
      } else {
        return typeof data.generation_id === "number" && data.generation_id > 0;
      }
    },
    {
      message: "generation_id must be null for manual source and a positive number for AI sources",
    }
  );

// Schema for the entire request body
const flashcardsCreateCommandSchema = z.object({
  flashcards: z.array(flashcardCreateSchema).min(1).max(100), // Limit to 100 flashcards per request
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Parse and validate input
    const body = (await request.json()) as FlashcardsCreateCommand;
    const result = flashcardsCreateCommandSchema.safeParse(body);

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

    const command = result.data as FlashcardsCreateCommand;
    const { supabase } = locals;

    // Collect unique generation IDs from AI-generated flashcards
    const aiGenerationIds = [
      ...new Set(
        command.flashcards
          .filter((f) => f.source !== "manual" && f.generation_id !== null)
          .map((f) => f.generation_id as number)
      ),
    ];

    // Verify generation ownership if there are any AI-generated flashcards
    if (aiGenerationIds.length > 0) {
      const { data: generations, error: generationsError } = await supabase
        .from("generations")
        .select("id")
        .eq("user_id", DEFAULT_USER_ID)
        .in("id", aiGenerationIds);

      if (generationsError) {
        console.error("Error verifying generation ownership:", generationsError);
        return new Response(JSON.stringify({ error: "Failed to verify generation ownership" }), { status: 500 });
      }

      const foundGenerationIds = new Set(generations?.map((g: { id: number }) => g.id) || []);
      const unauthorizedGenerationIds = aiGenerationIds.filter((id) => !foundGenerationIds.has(id));

      if (unauthorizedGenerationIds.length > 0) {
        return new Response(
          JSON.stringify({
            error: "Unauthorized generation IDs",
            details: { unauthorized_ids: unauthorizedGenerationIds },
          }),
          { status: 400 }
        );
      }
    }

    // Prepare records for insertion
    const flashcardsToInsert: FlashcardInsert[] = command.flashcards.map((flashcard) => ({
      user_id: DEFAULT_USER_ID,
      front: flashcard.front,
      back: flashcard.back,
      source: flashcard.source,
      generation_id: flashcard.generation_id,
    }));

    // Batch insert flashcards
    const { data: insertedFlashcards, error: insertError } = await supabase
      .from("flashcards")
      .insert(flashcardsToInsert)
      .select("id, front, back, source, generation_id, created_at, updated_at");

    if (insertError) {
      console.error("Error inserting flashcards:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create flashcards" }), { status: 500 });
    }

    // Update generation counters for AI-generated flashcards
    if (aiGenerationIds.length > 0) {
      const generationCounts: Record<number, { unedited: number; edited: number }> = {};

      command.flashcards.forEach((flashcard) => {
        if (flashcard.generation_id === null || typeof flashcard.generation_id !== "number") return;

        const genId: number = flashcard.generation_id;
        if (!generationCounts[genId]) {
          generationCounts[genId] = { unedited: 0, edited: 0 };
        }

        if (flashcard.source === "ai-full") {
          generationCounts[genId].unedited++;
        } else if (flashcard.source === "ai-edited") {
          generationCounts[genId].edited++;
        }
      });

      // Update each generation's counters
      for (const [generationId, counts] of Object.entries(generationCounts)) {
        // First get current values
        const { data: currentGen } = await supabase
          .from("generations")
          .select("accepted_unedited_count, accepted_edited_count")
          .eq("id", parseInt(generationId))
          .single();

        const currentUnedited = currentGen?.accepted_unedited_count || 0;
        const currentEdited = currentGen?.accepted_edited_count || 0;

        await supabase
          .from("generations")
          .update({
            accepted_unedited_count: currentUnedited + counts.unedited,
            accepted_edited_count: currentEdited + counts.edited,
          })
          .eq("id", parseInt(generationId));
      }
    }

    const response: CreateFlashcardsResponseDto = {
      data: insertedFlashcards as FlashcardDto[],
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing flashcards creation:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
