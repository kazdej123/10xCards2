import type { Tables, TablesInsert, TablesUpdate } from "./db/database.types";
import type { Database } from "./db/database.types";

// -----------------------------------------------------------------------------
// Aliases for base database types extracted from the Database model definitions
// -----------------------------------------------------------------------------
export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
export type FlashcardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];
export type Generation = Database["public"]["Tables"]["generations"]["Row"];
export type GenerationErrorLog = Database["public"]["Tables"]["generation_error_logs"]["Row"];

/**
 * Source of a flashcard.
 */
export type Source = "ai-full" | "ai-edited" | "manual";

/**
 * DTO representing a flashcard returned by the API.
 */
export type FlashcardDto = Omit<Tables<"flashcards">, "user_id">;

/**
 * DTO for creating a flashcard.
 */
export type FlashcardCreateDto = Pick<TablesInsert<"flashcards">, "front" | "back" | "generation_id"> & {
  source: Source;
};

/**
 * Command model for bulk creation of flashcards.
 */
export interface FlashcardsCreateCommand {
  flashcards: FlashcardCreateDto[];
}

/**
 * DTO for updating a flashcard.
 */
export type FlashcardUpdateDto = Partial<Pick<TablesUpdate<"flashcards">, "front" | "back">>;

/**
 * Pagination metadata returned in list responses.
 */
export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
}

/**
 * Response DTO for listing flashcards.
 */
export interface FlashcardsListResponseDto {
  data: FlashcardDto[];
  pagination: PaginationDto;
}

/**
 * Response DTO after creating flashcards.
 */
export interface CreateFlashcardsResponseDto {
  data: FlashcardDto[];
}

/**
 * Response DTO after updating a flashcard.
 */
export type UpdateFlashcardResponseDto = FlashcardDto;

/**
 * Command model for initiating flashcard generation.
 */
export interface GenerateFlashcardsCommand {
  source_text: string;
}

/**
 * DTO for a single flashcard proposal generated from AI.
 */
export interface FlashcardProposalDto {
  front: string;
  back: string;
  source: "ai-full";
}

/**
 * Response DTO for a completed generation request.
 */
export interface GenerationCreateResponseDto {
  generation_id: number;
  flashcard_proposals: FlashcardProposalDto[];
  generated_count: number;
}

/**
 * DTO for detailed generation information.
 */
export type GenerationDetailDto = Generation & {
  flashcards?: FlashcardDto[];
};

/**
 * DTO for a generation record.
 */
export type GenerationDto = Pick<
  Tables<"generations">,
  "id" | "model" | "generated_count" | "accepted_unedited_count" | "accepted_edited_count" | "created_at" | "updated_at"
>;

/**
 * Response DTO for listing generations.
 */
export interface GetGenerationsResponseDto {
  data: GenerationDto[];
  pagination: PaginationDto;
}

/**
 * Response DTO for retrieving a single generation.
 */
export type GetGenerationResponseDto = GenerationDto;

/**
 * Command model for accepting generation proposals (bulk flashcard creation).
 */
export type AcceptFlashcardCommand = Omit<FlashcardCreateDto, "generation_id"> & {
  /** Only AI-generated proposals can be accepted */
  source: Extract<Source, "ai-full" | "ai-edited">;
};

/**
 * Command model for bulk accepting generation flashcards.
 */
export interface AcceptGenerationFlashcardsCommand {
  flashcards: AcceptFlashcardCommand[];
}

/**
 * Response DTO after accepting generation flashcards.
 */
export interface AcceptGenerationFlashcardsResponseDto {
  data: FlashcardDto[];
}

/**
 * DTO for a generation error log entry exposed by the API.
 */
export type GenerationErrorLogDto = Pick<
  Tables<"generation_error_logs">,
  "id" | "error_code" | "error_message" | "model" | "source_text_hash" | "source_text_length" | "created_at"
>;

/**
 * Response DTO for listing generation error logs.
 */
export interface GetGenerationErrorLogsResponseDto {
  data: GenerationErrorLogDto[];
  pagination: PaginationDto;
}

/**
 * Response DTO for retrieving a single generation error log.
 */
export type GetGenerationErrorLogResponseDto = GenerationErrorLogDto;

/**
 * Response DTO for retrieving a single flashcard.
 */
export type GetFlashcardResponseDto = FlashcardDto;
