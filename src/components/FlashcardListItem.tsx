import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
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

  const handleSaveEdit = () => {
    if (editedFront.length > 200 || editedBack.length > 500) {
      return; // Could add error message here
    }
    onEdit(flashcard.id, editedFront, editedBack);
    setIsEditing(false);
  };

  const statusColor = {
    pending: "",
    accepted: "border-green-500",
    rejected: "border-red-500",
    edited: "border-blue-500",
  }[flashcard.status];

  if (isEditing) {
    return (
      <Card className={`border-2 ${statusColor}`}>
        <CardHeader>
          <Textarea
            value={editedFront}
            onChange={(e) => setEditedFront(e.target.value)}
            placeholder="Front side"
            className="resize-none"
          />
        </CardHeader>
        <CardContent>
          <Textarea
            value={editedBack}
            onChange={(e) => setEditedBack(e.target.value)}
            placeholder="Back side"
            className="resize-none"
          />
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              setEditedFront(flashcard.front);
              setEditedBack(flashcard.back);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveEdit}>Save</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${statusColor}`}>
      <CardHeader>
        <div className="font-medium">{flashcard.front}</div>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">{flashcard.back}</div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {flashcard.status === "pending" && (
          <>
            <Button variant="outline" onClick={() => onReject(flashcard.id)}>
              Reject
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button onClick={() => onAccept(flashcard.id)}>Accept</Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
