import type { SupabaseClient } from "@supabase/supabase-js";
import type { FlashcardProposalDto, GenerationCreateResponseDto } from "../../types";
import type { Database } from "../../db/database.types";

export class GenerationService {
  private supabase: SupabaseClient<Database>;
  private userId: string;

  constructor(supabase: SupabaseClient<Database>, userId: string) {
    this.supabase = supabase;
    this.userId = userId;
  }

  /**
   * Generates flashcard proposals using AI based on the provided text
   * @param sourceText The text to generate flashcards from
   * @returns Generation response with ID, proposals and count
   */
  async generateFlashcards(sourceText: string): Promise<GenerationCreateResponseDto> {
    const startTime = Date.now();

    try {
      // 1. Create initial generation record
      const { data: generation, error: insertError } = await this.supabase
        .from("generations")
        .insert({
          user_id: this.userId,
          model: "gpt-4", // TODO: Make configurable
          source_text_hash: await this.hashText(sourceText),
          source_text_length: sourceText.length,
          generated_count: 0,
          generation_duration: 0,
        })
        .select()
        .single();

      if (insertError || !generation) {
        throw new Error("Failed to create generation record");
      }

      // TODO: 2. Call AI service to generate flashcards
      // TODO: 3. Update generation record with results
      // TODO: 4. Return response

      throw new Error("Not implemented");
    } catch (error) {
      // Log error and rethrow
      await this.logGenerationError(sourceText, error);
      throw error;
    }
  }

  /**
   * Creates a hash of the source text for deduplication
   */
  private async hashText(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Logs generation errors to the generation_error_logs table
   */
  private async logGenerationError(sourceText: string, error: unknown): Promise<void> {
    try {
      await this.supabase.from("generation_error_logs").insert({
        user_id: this.userId,
        model: "gpt-4", // TODO: Make configurable
        source_text_hash: await this.hashText(sourceText),
        source_text_length: sourceText.length,
        error_code: error instanceof Error ? error.name : "UnknownError",
        error_message: error instanceof Error ? error.message : String(error),
      });
    } catch (logError) {
      console.error("Failed to log generation error:", logError);
    }
  }
}
