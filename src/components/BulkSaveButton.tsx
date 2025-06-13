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
    <div className="flex justify-end gap-3 pt-6 border-t border-white/20">
      <Button
        variant="outline"
        onClick={onSaveAccepted}
        disabled={disabled || isLoading || acceptedCount === 0}
        aria-label={`Zapisz ${acceptedCount} zaakceptowane fiszki`}
        className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-200"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Zapisywanie...</span>
          </>
        ) : (
          <>
            <span>Zapisz zaakceptowane</span>
            <span className="ml-2 text-xs bg-blue-500/30 px-2 py-1 rounded text-blue-200 font-medium">
              {acceptedCount}
            </span>
          </>
        )}
      </Button>
      <Button
        onClick={onSaveAll}
        disabled={disabled || isLoading || totalCount === 0}
        aria-label={`Zapisz wszystkie ${totalCount} fiszki`}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Zapisywanie...</span>
          </>
        ) : (
          <>
            <span>Zapisz wszystkie</span>
            <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded text-white font-medium">{totalCount}</span>
          </>
        )}
      </Button>
    </div>
  );
}
