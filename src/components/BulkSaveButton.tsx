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
    <div className="fixed bottom-0 left-0 right-0 sm:relative p-4 sm:p-0 bg-background border-t sm:border-0 shadow-lg sm:shadow-none">
      <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row justify-end gap-2">
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
              <span className="ml-1.5 text-xs text-muted-foreground">({acceptedCount})</span>
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
              <span className="ml-1.5 text-xs text-muted-foreground">({totalCount})</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
