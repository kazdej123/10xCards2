import { useState } from "react";
import type {
  FlashcardProposalDto,
  GenerationCreateResponseDto,
  FlashcardsCreateCommand,
  FlashcardCreateDto,
} from "../types";
import { TextInputArea } from "./TextInputArea";
import { GenerateButton } from "./GenerateButton";
import { SkeletonLoader } from "./SkeletonLoader";
import { FlashcardList } from "./FlashcardList";
import { BulkSaveButton } from "./BulkSaveButton";

export interface FlashcardProposalViewModel extends FlashcardProposalDto {
  id: string;
  status: "pending" | "accepted" | "rejected" | "edited";
  isEditing?: boolean;
}

export function FlashcardGenerationView() {
  const [textValue, setTextValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardProposalViewModel[]>([]);
  const [generationId, setGenerationId] = useState<number | null>(null);

  const handleTextChange = (value: string) => {
    setTextValue(value);
    setErrorMessage(null);
  };

  const handleGenerateClick = async () => {
    if (textValue.length < 1000 || textValue.length > 10000) {
      setErrorMessage("Text must be between 1000 and 10000 characters");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source_text: textValue }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: GenerationCreateResponseDto = await response.json();
      setGenerationId(data.generation_id);

      const flashcardsWithIds: FlashcardProposalViewModel[] = data.flashcard_proposals.map((proposal) => ({
        ...proposal,
        id: crypto.randomUUID(),
        status: "pending",
      }));

      setFlashcards(flashcardsWithIds);
    } catch {
      setErrorMessage("Failed to generate flashcards. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = (id: string) => {
    setFlashcards((current) => current.map((card) => (card.id === id ? { ...card, status: "accepted" } : card)));
  };

  const handleEdit = (id: string, newFront: string, newBack: string) => {
    setFlashcards((current) =>
      current.map((card) => (card.id === id ? { ...card, front: newFront, back: newBack, status: "edited" } : card))
    );
  };

  const handleReject = (id: string) => {
    setFlashcards((current) => current.map((card) => (card.id === id ? { ...card, status: "rejected" } : card)));
  };

  const saveFlashcards = async (cardsToSave: FlashcardProposalViewModel[]) => {
    if (!generationId) {
      setErrorMessage("Generation ID is missing. Please try generating flashcards again.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const flashcardsToSave: FlashcardCreateDto[] = cardsToSave.map((card) => ({
        front: card.front,
        back: card.back,
        source: card.status === "edited" ? "ai-edited" : "ai-full",
        generation_id: generationId,
      }));

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flashcards: flashcardsToSave } as FlashcardsCreateCommand),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Remove saved cards from the list
      setFlashcards((current) => current.filter((card) => !cardsToSave.some((saved) => saved.id === card.id)));
    } catch {
      setErrorMessage("Failed to save flashcards. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAccepted = () => {
    const acceptedCards = flashcards.filter((card) => card.status === "accepted" || card.status === "edited");
    if (acceptedCards.length === 0) return;
    saveFlashcards(acceptedCards);
  };

  const handleSaveAll = () => {
    const cardsToSave = flashcards.filter((card) => card.status !== "rejected");
    if (cardsToSave.length === 0) return;
    saveFlashcards(cardsToSave);
  };

  const acceptedCount = flashcards.filter((card) => card.status === "accepted" || card.status === "edited").length;
  const totalCount = flashcards.filter((card) => card.status !== "rejected").length;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <TextInputArea value={textValue} onChange={handleTextChange} disabled={isLoading} />
        <div className="flex justify-end">
          <GenerateButton
            onClick={handleGenerateClick}
            disabled={textValue.length < 1000 || textValue.length > 10000}
            isLoading={isLoading}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-500/20 text-red-200 px-4 py-3 rounded-lg border border-red-500/30 backdrop-blur-sm">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <>
          <FlashcardList flashcards={flashcards} onAccept={handleAccept} onEdit={handleEdit} onReject={handleReject} />
          {flashcards.length > 0 && (
            <BulkSaveButton
              onSaveAll={handleSaveAll}
              onSaveAccepted={handleSaveAccepted}
              disabled={false}
              isLoading={isSaving}
              acceptedCount={acceptedCount}
              totalCount={totalCount}
            />
          )}
        </>
      )}
    </div>
  );
}
