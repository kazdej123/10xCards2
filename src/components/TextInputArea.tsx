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

  return (
    <div className="space-y-2">
      <Label htmlFor="source-text">Source Text</Label>
      <Textarea
        id="source-text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Paste your text here (1000-10000 characters)"
        className="min-h-[200px] resize-y"
      />
      <div className={`text-sm ${countColor} text-right`}>{characterCount} / 10000 characters</div>
    </div>
  );
}
