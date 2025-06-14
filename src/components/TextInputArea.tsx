import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TextInputArea({ value, onChange, disabled }: TextInputAreaProps) {
  const characterCount = value.length;
  const isValidLength = characterCount >= 1000 && characterCount <= 10000;
  const countColor = isValidLength ? "text-blue-200/70" : "text-red-200";
  const validationMessage = !isValidLength
    ? characterCount < 1000
      ? "Wprowadź co najmniej 1000 znaków"
      : "Wprowadź nie więcej niż 10000 znaków"
    : null;

  return (
    <div className="space-y-3" data-testid="text-input-area">
      <div className="flex justify-between items-center">
        <Label htmlFor="source-text" className="text-blue-100 font-medium text-lg">
          Tekst źródłowy
        </Label>
        <div
          className={`text-sm font-medium ${countColor}`}
          role="status"
          aria-live="polite"
          data-testid="character-counter"
        >
          {characterCount} / 10000 znaków
        </div>
      </div>
      <Textarea
        id="source-text"
        data-testid="source-text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Wklej tutaj swój tekst (1000-10000 znaków)"
        className="min-h-[200px] resize-y bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-blue-400/50 focus:ring-blue-400/50 backdrop-blur-sm"
        aria-describedby={validationMessage ? "text-validation" : undefined}
        aria-invalid={!isValidLength}
      />
      {validationMessage && (
        <div
          id="text-validation"
          data-testid="text-validation-message"
          className="text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-lg p-3 backdrop-blur-sm"
          role="alert"
        >
          {validationMessage}
        </div>
      )}
    </div>
  );
}
