import { useState } from "react";
import { Card, CardContent } from "./ui/card";
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
      setValidationError("Front side must be 200 characters or less");
      return false;
    }
    if (editedBack.length > 500) {
      setValidationError("Back side must be 500 characters or less");
      return false;
    }
    if (editedFront.trim().length === 0) {
      setValidationError("Front side cannot be empty");
      return false;
    }
    if (editedBack.trim().length === 0) {
      setValidationError("Back side cannot be empty");
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
      border: "border-l-gray-300",
      text: "Pending",
      bgColor: "bg-gray-50",
      textColor: "text-gray-600",
    },
    accepted: {
      border: "border-l-green-500",
      text: "Accepted",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    rejected: {
      border: "border-l-red-500",
      text: "Rejected",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
    },
    edited: {
      border: "border-l-blue-500",
      text: "Edited",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
  }[flashcard.status];

  if (isEditing) {
    return (
      <Card className={`${statusConfig.border} border-l-4 ${statusConfig.bgColor}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-sm font-medium ${statusConfig.textColor}`}>{statusConfig.text}</span>
            </div>

            <div>
              <Label htmlFor={`front-${flashcard.id}`} className="text-xs text-gray-600 mb-1 block">
                Front side
              </Label>
              <Textarea
                id={`front-${flashcard.id}`}
                value={editedFront}
                onChange={(e) => {
                  setEditedFront(e.target.value);
                  setValidationError(null);
                }}
                placeholder="Front side"
                className="resize-none min-h-[60px] text-sm"
                aria-describedby={`front-length-${flashcard.id}`}
              />
              <div id={`front-length-${flashcard.id}`} className="text-xs text-muted-foreground text-right mt-1">
                {editedFront.length}/200 characters
              </div>
            </div>

            <div>
              <Label htmlFor={`back-${flashcard.id}`} className="text-xs text-gray-600 mb-1 block">
                Back side
              </Label>
              <Textarea
                id={`back-${flashcard.id}`}
                value={editedBack}
                onChange={(e) => {
                  setEditedBack(e.target.value);
                  setValidationError(null);
                }}
                placeholder="Back side"
                className="resize-none min-h-[60px] text-sm"
                aria-describedby={`back-length-${flashcard.id}`}
              />
              <div id={`back-length-${flashcard.id}`} className="text-xs text-muted-foreground text-right mt-1">
                {editedBack.length}/500 characters
              </div>
            </div>

            {validationError && (
              <div className="text-sm text-destructive" role="alert">
                {validationError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditedFront(flashcard.front);
                  setEditedBack(flashcard.back);
                  setValidationError(null);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${statusConfig.border} border-l-4 ${statusConfig.bgColor}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${statusConfig.textColor}`}>{statusConfig.text}</span>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900">{flashcard.front}</div>
            <div className="text-sm text-gray-600">{flashcard.back}</div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {flashcard.status === "rejected" ? (
              <Button
                size="sm"
                onClick={() => onAccept(flashcard.id)}
                aria-label="Accept flashcard"
                className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100"
              >
                ✓ Accept
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject(flashcard.id)}
                  aria-label="Reject flashcard"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  ✕
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit flashcard"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  ✏️
                </Button>
                {flashcard.status !== "accepted" && flashcard.status !== "edited" && (
                  <Button
                    size="sm"
                    onClick={() => onAccept(flashcard.id)}
                    aria-label="Accept flashcard"
                    className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100"
                  >
                    ✓
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
