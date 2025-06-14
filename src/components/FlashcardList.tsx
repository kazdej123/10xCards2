import type { FlashcardProposalViewModel } from "./FlashcardGenerationView";
import { FlashcardListItem } from "./FlashcardListItem";

interface FlashcardListProps {
  flashcards: FlashcardProposalViewModel[];
  onAccept: (id: string) => void;
  onEdit: (id: string, newFront: string, newBack: string) => void;
  onReject: (id: string) => void;
}

export function FlashcardList({ flashcards, onAccept, onEdit, onReject }: FlashcardListProps) {
  if (flashcards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4" data-testid="flashcard-list">
      {flashcards.map((flashcard) => (
        <FlashcardListItem
          key={flashcard.id}
          flashcard={flashcard}
          onAccept={onAccept}
          onEdit={onEdit}
          onReject={onReject}
        />
      ))}
    </div>
  );
}
