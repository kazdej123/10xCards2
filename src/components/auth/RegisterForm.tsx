import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Label } from "../ui/label";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (password.length < 8) {
      setError("Hasło musi mieć co najmniej 8 znaków");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    // Form submission will be handled later
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Rejestracja</h1>
        <p className="text-sm text-muted-foreground">Utwórz nowe konto aby korzystać z aplikacji</p>
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

        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"
            placeholder="••••••••"
          />
          <p className="text-xs text-muted-foreground">Minimum 8 znaków</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"
            placeholder="••••••••"
          />
        </div>

        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

        <div className="space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Rejestracja..." : "Zarejestruj się"}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Masz już konto?{" "}
            <a href="/login" className="text-primary hover:underline">
              Zaloguj się
            </a>
          </p>
        </div>
      </form>
    </Card>
  );
}
