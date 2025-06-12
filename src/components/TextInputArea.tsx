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
  const countColor = isValidLength ? "text-muted-foreground" : "text-destructive";
  const validationMessage = !isValidLength
    ? characterCount < 1000
      ? "Please enter at least 1000 characters"
      : "Please enter no more than 10000 characters"
    : null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="source-text">Source Text</Label>
        <div className={`text-sm ${countColor}`} role="status" aria-live="polite">
          {characterCount} / 10000 characters
        </div>
      </div>
      <Textarea
        id="source-text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Paste your text here (1000-10000 characters)"
        className="min-h-[200px] resize-y"
        aria-describedby={validationMessage ? "text-validation" : undefined}
        aria-invalid={!isValidLength}
      />
      {validationMessage && (
        <div id="text-validation" className="text-sm text-destructive" role="alert">
          {validationMessage}
        </div>
      )}
    </div>
  );
}
