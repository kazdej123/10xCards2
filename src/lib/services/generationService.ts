import type { SupabaseClient } from "../../db/supabase.client";
import type { FlashcardProposalDto, GenerationCreateResponseDto } from "../../types";
import { OpenRouterService } from "./openRouterService";
import crypto from "crypto";

export class GenerationService {
  private readonly openRouterService: OpenRouterService;
  private readonly userId: string;

  constructor(
    private readonly supabase: SupabaseClient,
    openRouterApiKey: string,
    userId: string
  ) {
    this.openRouterService = new OpenRouterService({
      apiKey: openRouterApiKey,
    });
    this.userId = userId;

    // Configure the OpenRouter service for flashcard generation
    this.setupOpenRouterService();
  }

  private setupOpenRouterService(): void {
    // Set the model - using a good model for structured output
    this.openRouterService.setModel("openai/gpt-4o-mini", {
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Set system message for flashcard generation
    const systemMessage = `You are an expert flashcard creator. Your task is to generate high-quality flashcards from provided text content.

Guidelines for creating flashcards:
1. Create clear, concise questions that test understanding of key concepts
2. Provide accurate, comprehensive answers
3. Focus on important facts, concepts, definitions, and relationships
4. Ensure questions are neither too easy nor too difficult
5. Avoid ambiguous or trick questions
6. Make sure each flashcard is self-contained and doesn't rely on others
7. Generate between 3-8 flashcards depending on content complexity and length

Return your response as a JSON object with an array of flashcards, each containing 'front' (question) and 'back' (answer) fields.`;

    this.openRouterService.setSystemMessage(systemMessage);

    // Set response format schema for structured output
    const responseSchema = {
      name: "flashcards",
      schema: {
        type: "object",
        properties: {
          flashcards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                front: { type: "string" },
                back: { type: "string" },
              },
              required: ["front", "back"],
            },
          },
        },
        required: ["flashcards"],
      },
    };

    this.openRouterService.setResponseFormat(responseSchema);
  }

  async generateFlashcards(sourceText: string): Promise<GenerationCreateResponseDto> {
    try {
      // 1. Calculate metadata
      const startTime = Date.now();
      const sourceTextHash = await this.calculateHash(sourceText);

      // 2. Call AI service using OpenRouter
      const flashcardProposals = await this.callAIService(sourceText);

      // 3. Save generation metadata
      const generationId = await this.saveGenerationMetadata({
        sourceTextHash,
        sourceTextLength: sourceText.length,
        generatedCount: flashcardProposals.length,
        durationMs: Date.now() - startTime,
      });

      return {
        generation_id: generationId,
        flashcard_proposals: flashcardProposals,
        generated_count: flashcardProposals.length,
      };
    } catch (error) {
      // Log error and save to generation_error_logs
      await this.logGenerationError(error, {
        sourceTextHash: await this.calculateHash(sourceText),
        sourceTextLength: sourceText.length,
      });
      throw error;
    }
  }

  private async calculateHash(text: string): Promise<string> {
    return crypto.createHash("md5").update(text).digest("hex");
  }

  private async callAIService(text: string): Promise<FlashcardProposalDto[]> {
    try {
      // Create user message with the source text
      const userMessage = `Please create flashcards from the following text content:

${text}

Generate flashcards that capture the most important concepts, facts, and relationships from this content.`;

      // Send request to OpenRouter
      const response = await this.openRouterService.sendChatMessage(userMessage);

      // Parse the response
      if (!response.choices || response.choices.length === 0) {
        throw new Error("No response from AI service");
      }

      const content = response.choices[0].message.content;

      if (!content) {
        throw new Error("Empty response from AI service");
      }

      // Parse JSON response
      try {
        const parsedResponse = JSON.parse(content);

        if (!parsedResponse.flashcards || !Array.isArray(parsedResponse.flashcards)) {
          throw new Error("Invalid response format from AI service");
        }

        // Convert to FlashcardProposalDto format
        const flashcardProposals: FlashcardProposalDto[] = parsedResponse.flashcards.map(
          (card: { front: string; back: string }) => ({
            front: card.front,
            back: card.back,
            source: "ai-full" as const,
          })
        );

        return flashcardProposals;
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error("Invalid JSON response from AI service");
        }
        throw error;
      }
    } catch (error) {
      throw new Error(`Failed to generate flashcards: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async saveGenerationMetadata(data: {
    sourceTextHash: string;
    sourceTextLength: number;
    generatedCount: number;
    durationMs: number;
  }): Promise<number> {
    const { data: generation, error } = await this.supabase
      .from("generations")
      .insert({
        user_id: this.userId,
        source_text_hash: data.sourceTextHash,
        source_text_length: data.sourceTextLength,
        generated_count: data.generatedCount,
        generation_duration: data.durationMs,
        model: "openai/gpt-4o-mini", // Updated to match the actual model being used
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return generation.id;
  }

  private async logGenerationError(
    error: unknown,
    data: {
      sourceTextHash: string;
      sourceTextLength: number;
    }
  ): Promise<void> {
    await this.supabase.from("generation_error_logs").insert({
      user_id: this.userId,
      error_code: error instanceof Error ? error.name : "UNKNOWN",
      error_message: error instanceof Error ? error.message : String(error),
      model: "openai/gpt-4o-mini", // Updated to match the actual model being used
      source_text_hash: data.sourceTextHash,
      source_text_length: data.sourceTextLength,
    });
  }
}
