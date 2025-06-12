import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
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

  const statusColor = {
    pending: "",
    accepted: "border-green-500",
    rejected: "border-red-500",
    edited: "border-blue-500",
  }[flashcard.status];

  const statusText = {
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Rejected",
    edited: "Edited",
  }[flashcard.status];

  if (isEditing) {
    return (
      <Card className={`border-2 ${statusColor}`}>
        <CardHeader>
          <Label htmlFor={`front-${flashcard.id}`}>Front side</Label>
          <Textarea
            id={`front-${flashcard.id}`}
            value={editedFront}
            onChange={(e) => {
              setEditedFront(e.target.value);
              setValidationError(null);
            }}
            placeholder="Front side"
            className="resize-none"
            aria-describedby={`front-length-${flashcard.id}`}
          />
          <div id={`front-length-${flashcard.id}`} className="text-xs text-muted-foreground text-right">
            {editedFront.length}/200 characters
          </div>
        </CardHeader>
        <CardContent>
          <Label htmlFor={`back-${flashcard.id}`}>Back side</Label>
          <Textarea
            id={`back-${flashcard.id}`}
            value={editedBack}
            onChange={(e) => {
              setEditedBack(e.target.value);
              setValidationError(null);
            }}
            placeholder="Back side"
            className="resize-none"
            aria-describedby={`back-length-${flashcard.id}`}
          />
          <div id={`back-length-${flashcard.id}`} className="text-xs text-muted-foreground text-right">
            {editedBack.length}/500 characters
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {validationError && (
            <div className="w-full text-sm text-destructive" role="alert">
              {validationError}
            </div>
          )}
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setEditedFront(flashcard.front);
                setEditedBack(flashcard.back);
                setValidationError(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${statusColor}`}>
      <CardHeader className="relative">
        <div className="absolute top-2 right-2">
          <span className="text-xs text-muted-foreground">{statusText}</span>
        </div>
        <div className="font-medium pt-6">{flashcard.front}</div>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">{flashcard.back}</div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {flashcard.status === "pending" && (
          <>
            <Button variant="outline" onClick={() => onReject(flashcard.id)} aria-label="Reject flashcard">
              Reject
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(true)} aria-label="Edit flashcard">
              Edit
            </Button>
            <Button onClick={() => onAccept(flashcard.id)} aria-label="Accept flashcard">
              Accept
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
