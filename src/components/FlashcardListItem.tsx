import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import type { FlashcardProposalViewModel } from "./FlashcardGenerationView";

interface FlashcardListItemProps {
  flashcard: FlashcardProposalViewModel;
  onAccept: (id: string) => void;
  onEdit: (id: string, newFront: string, newBack: string) => void;
  onReject: (id: string) => void;
}

export function FlashcardListItem({ flashcard, onAccept, onEdit, onReject }: FlashcardListItemProps) {
  const [isEditing, setIsEditing] = useState(flashcard.isEditing);
  const [editedFront, setEditedFront] = useState(flashcard.front);
  const [editedBack, setEditedBack] = useState(flashcard.back);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateEdit = () => {
    if (editedFront.length > 200) {
      setValidationError("Strona przednia musi mieć maksymalnie 200 znaków");
      return false;
    }
    if (editedBack.length > 500) {
      setValidationError("Strona tylna musi mieć maksymalnie 500 znaków");
      return false;
    }
    if (editedFront.trim().length === 0) {
      setValidationError("Strona przednia nie może być pusta");
      return false;
    }
    if (editedBack.trim().length === 0) {
      setValidationError("Strona tylna nie może być pusta");
      return false;
    }
    return true;
  };

  const handleSaveEdit = () => {
    setValidationError(null);
    if (!validateEdit()) return;

    onEdit(flashcard.id, editedFront, editedBack);
    setIsEditing(false);
  };

  const statusConfig = {
    pending: {
      border: "border-l-white/30",
      text: "Oczekuje",
      bgColor: "bg-white/10",
      textColor: "text-blue-200",
    },
    accepted: {
      border: "border-l-green-400",
      text: "Zaakceptowana",
      bgColor: "bg-green-500/20",
      textColor: "text-green-200",
    },
    rejected: {
      border: "border-l-red-400",
      text: "Odrzucona",
      bgColor: "bg-red-500/20",
      textColor: "text-red-200",
    },
    edited: {
      border: "border-l-blue-400",
      text: "Edytowana",
      bgColor: "bg-blue-500/20",
      textColor: "text-blue-200",
    },
  }[flashcard.status];

  if (isEditing) {
    return (
      <div
        className={`${statusConfig.border} border-l-4 ${statusConfig.bgColor} backdrop-blur-sm rounded-lg border border-white/10 p-4`}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${statusConfig.textColor}`}>{statusConfig.text}</span>
          </div>

          <div>
            <Label htmlFor={`front-${flashcard.id}`} className="text-blue-100 font-medium mb-2 block">
              Strona przednia
            </Label>
            <Textarea
              id={`front-${flashcard.id}`}
              value={editedFront}
              onChange={(e) => {
                setEditedFront(e.target.value);
                setValidationError(null);
              }}
              placeholder="Strona przednia"
              className="resize-none min-h-[60px] text-sm bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-blue-400/50 focus:ring-blue-400/50"
              aria-describedby={`front-length-${flashcard.id}`}
            />
            <div id={`front-length-${flashcard.id}`} className="text-xs text-blue-200/70 text-right mt-1">
              {editedFront.length}/200 znaków
            </div>
          </div>

          <div>
            <Label htmlFor={`back-${flashcard.id}`} className="text-blue-100 font-medium mb-2 block">
              Strona tylna
            </Label>
            <Textarea
              id={`back-${flashcard.id}`}
              value={editedBack}
              onChange={(e) => {
                setEditedBack(e.target.value);
                setValidationError(null);
              }}
              placeholder="Strona tylna"
              className="resize-none min-h-[60px] text-sm bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-blue-400/50 focus:ring-blue-400/50"
              aria-describedby={`back-length-${flashcard.id}`}
            />
            <div id={`back-length-${flashcard.id}`} className="text-xs text-blue-200/70 text-right mt-1">
              {editedBack.length}/500 znaków
            </div>
          </div>

          {validationError && (
            <div
              className="text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-lg p-3 backdrop-blur-sm"
              role="alert"
            >
              {validationError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setEditedFront(flashcard.front);
                setEditedBack(flashcard.back);
                setValidationError(null);
              }}
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
            >
              Anuluj
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              Zapisz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${statusConfig.border} border-l-4 ${statusConfig.bgColor} backdrop-blur-sm rounded-lg border border-white/10 p-4`}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <span className={`text-sm font-medium ${statusConfig.textColor}`}>{statusConfig.text}</span>
        </div>

        <div className="space-y-3">
          <div className="text-white font-medium">{flashcard.front}</div>
          <div className="text-blue-100/80">{flashcard.back}</div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {flashcard.status === "rejected" ? (
            <Button
              size="sm"
              onClick={() => onAccept(flashcard.id)}
              aria-label="Zaakceptuj fiszkę"
              className="bg-green-500/80 hover:bg-green-500 text-white border-0"
            >
              ✓ Akceptuj
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(flashcard.id)}
                aria-label="Odrzuć fiszkę"
                className="bg-red-500/20 border-red-400/60 text-red-100 hover:bg-red-500/30 hover:border-red-400/80 transition-all duration-200"
              >
                ✕
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                aria-label="Edytuj fiszkę"
                className="border-blue-400/50 text-blue-200 hover:bg-blue-500/20 hover:border-blue-400/70"
              >
                ✏️
              </Button>
              {flashcard.status !== "accepted" && flashcard.status !== "edited" && (
                <Button
                  size="sm"
                  onClick={() => onAccept(flashcard.id)}
                  aria-label="Zaakceptuj fiszkę"
                  className="bg-green-500/80 hover:bg-green-500 text-white border-0"
                >
                  ✓ Akceptuj
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
