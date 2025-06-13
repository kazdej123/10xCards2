import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Label } from "../ui/label";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    // Form submission will be handled later
    setIsSubmitted(true);
    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sprawdź email</h1>
          <p className="text-sm text-muted-foreground">
            Wysłaliśmy instrukcje resetowania hasła na podany adres email. Link będzie aktywny przez 24 godziny.
          </p>
        </div>
        <Button asChild className="w-full">
          <a href="/login">Wróć do logowania</a>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset hasła</h1>
        <p className="text-sm text-muted-foreground">Wprowadź swój email aby zresetować hasło</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"
            placeholder="twoj@email.com"
          />
        </div>

        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

        <div className="space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Wysyłanie..." : "Wyślij link resetujący"}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Pamiętasz hasło?{" "}
            <a href="/login" className="text-primary hover:underline">
              Zaloguj się
            </a>
          </p>
        </div>
      </form>
    </Card>
  );
}
