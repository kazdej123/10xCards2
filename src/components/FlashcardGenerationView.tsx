import { useState } from "react";
import type { FlashcardProposalDto, GenerationCreateResponseDto } from "../types";
import { TextInputArea } from "./TextInputArea";
import { GenerateButton } from "./GenerateButton";
import { SkeletonLoader } from "./SkeletonLoader";
import { FlashcardList } from "./FlashcardList";

export interface FlashcardProposalViewModel extends FlashcardProposalDto {
  id: string;
  status: "pending" | "accepted" | "rejected" | "edited";
  isEditing?: boolean;
}

export function FlashcardGenerationView() {
  const [textValue, setTextValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardProposalViewModel[]>([]);

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

      const flashcardsWithIds: FlashcardProposalViewModel[] = data.flashcard_proposals.map((proposal) => ({
        ...proposal,
        id: crypto.randomUUID(),
        status: "pending",
      }));

      setFlashcards(flashcardsWithIds);
    } catch (error) {
      setErrorMessage("Failed to generate flashcards. Please try again.");
      console.error("Generation error:", error);
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

      {errorMessage && <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">{errorMessage}</div>}

      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <FlashcardList flashcards={flashcards} onAccept={handleAccept} onEdit={handleEdit} onReject={handleReject} />
      )}
    </div>
  );
}
