import { Button } from "./ui/button";

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
    <div
      className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
      data-testid="bulk-save-buttons"
    >
      <div className="text-blue-100 text-sm">
        <span data-testid="stats-counter">
          {acceptedCount} z {totalCount} fiszek wybranych do zapisu
        </span>
      </div>
      <div className="flex gap-3">
        <Button
          data-testid="save-accepted-button"
          onClick={onSaveAccepted}
          disabled={disabled || isLoading || acceptedCount === 0}
          className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Zapisywanie...
            </>
          ) : (
            `Zapisz wybrane (${acceptedCount})`
          )}
        </Button>
        <Button
          data-testid="save-all-button"
          onClick={onSaveAll}
          disabled={disabled || isLoading || totalCount === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Zapisywanie...
            </>
          ) : (
            `Zapisz wszystkie (${totalCount})`
          )}
        </Button>
      </div>
    </div>
  );
}
