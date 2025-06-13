import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Label } from "../ui/label";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    // Form submission will be handled later
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Logowanie</h1>
        <p className="text-sm text-muted-foreground">Wprowadź swoje dane aby się zalogować</p>
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
        </div>

        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

        <div className="space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logowanie..." : "Zaloguj się"}
          </Button>

          <div className="text-center space-y-2">
            <a href="/reset-password" className="text-sm text-primary hover:underline">
              Zapomniałeś hasła?
            </a>
            <p className="text-sm text-muted-foreground">
              Nie masz jeszcze konta?{" "}
              <a href="/register" className="text-primary hover:underline">
                Zarejestruj się
              </a>
            </p>
          </div>
        </div>
      </form>
    </Card>
  );
}
