import type { SupabaseClient } from "@supabase/supabase-js";
import type { FlashcardProposalDto, GenerationCreateResponseDto } from "../../types";

export class GenerationService {
  constructor(private readonly supabase: SupabaseClient) {}

  async generateFlashcards(sourceText: string, userId: string): Promise<GenerationCreateResponseDto> {
    try {
      // 1.
      const startTime = Date.now();
      const sourceTextHash = await this.calculateHash(sourceText);

      // 2.
      const flashcardProposals = await this.callAIService(sourceText);

      // 3.
      const generationId = await this.saveGenerationMetadata({
        userId,
        sourceText,
        sourceTextHash,
        generatedCount: flashcardProposals.length,
        durationMs: Date.now() - startTime,
      });

      return {
        generation_id: generationId,
        flashcard_proposals: flashcardProposals,
        generated_count: flashcardProposals.length,
      };
    } catch (error) {
      // Log error
      await this.logGenerationError(error, {
        userId,
        sourceTextHash: await this.calculateHash(sourceText),
        sourceTextLength: sourceText.length,
      });
      throw error;
    }
  }

  private async calculateHash(text: string): Promise<string> {
    // TODO: Implement
    return text;
  }

  private async callAIService(/*text: string*/): Promise<FlashcardProposalDto[]> {
    // TODO: Implement
    return [];
  }

  private async saveGenerationMetadata(data: {
    userId: string;
    sourceText: string;
    sourceTextHash: string;
    generatedCount: number;
    durationMs: number;
  }): Promise<number> {
    const { data: generation, error } = await this.supabase
      .from("generations")
      .insert({
        user_id: data.userId,
        source_text: data.sourceText,
        source_text_hash: data.sourceTextHash,
        source_text_length: data.sourceText.length,
        generated_count: data.generatedCount,
        generation_duration: data.durationMs,
      })
      .select("id")
      .single();

    if (error) throw error;
    return generation.id;
  }

  private async logGenerationError(
    error: unknown,
    data: {
      userId: string;
      sourceTextHash: string;
      sourceTextLength: number;
    }
  ): Promise<void> {
    await this.supabase.from("generation_error_logs").insert({
      user_id: data.userId,
      error_code: error instanceof Error ? error.name : "UNKNOWN",
      error_message: error instanceof Error ? error.message : String(error),
      model: "gpt-4", // TODO: Make configurable
      source_text_hash: data.sourceTextHash,
      source_text_length: data.sourceTextLength,
    });
  }
}
