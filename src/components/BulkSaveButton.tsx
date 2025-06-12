import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface BulkSaveButtonProps {
  onSaveAll: () => void;
  onSaveAccepted: () => void;
  disabled: boolean;
  isLoading: boolean;
  acceptedCount: number;
  totalCount: number;
}

export function BulkSaveButton({
  onSaveAll,
  onSaveAccepted,
  disabled,
  isLoading,
  acceptedCount,
  totalCount,
}: BulkSaveButtonProps) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button
        variant="outline"
        onClick={onSaveAccepted}
        disabled={disabled || isLoading || acceptedCount === 0}
        aria-label={`Save ${acceptedCount} accepted flashcards`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <span>Save Accepted</span>
            <span className="ml-1.5 text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{acceptedCount}</span>
          </>
        )}
      </Button>
      <Button
        onClick={onSaveAll}
        disabled={disabled || isLoading || totalCount === 0}
        aria-label={`Save all ${totalCount} flashcards`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <span>Save All</span>
            <span className="ml-1.5 text-xs bg-white bg-opacity-20 px-1.5 py-0.5 rounded text-white">{totalCount}</span>
          </>
        )}
      </Button>
    </div>
  );
}
