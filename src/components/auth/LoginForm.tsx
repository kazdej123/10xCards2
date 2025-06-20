import { useState } from "react";
import { Button } from "../ui/button";
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

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
      });

      if (response.redirected) {
        // Follow the redirect from the server
        window.location.href = response.url;
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      // This shouldn't happen as successful login should redirect
      window.location.href = "/generate";
    } catch (err: unknown) {
      const error = err as Error;
      setError(
        error.message === "Invalid login credentials"
          ? "Nieprawidłowy email lub hasło"
          : "Wystąpił błąd podczas logowania. Spróbuj ponownie."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
      <div className="space-y-2 text-center mb-6">
        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 text-transparent bg-clip-text">
          Logowanie
        </h1>
        <p className="text-blue-100/90">Wprowadź swoje dane aby się zalogować</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-blue-100 font-medium">
            Email
          </Label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 backdrop-blur-sm"
            placeholder="twoj@email.com"
            data-testid="email-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-blue-100 font-medium">
            Hasło
          </Label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 backdrop-blur-sm"
            placeholder="••••••••"
            data-testid="password-input"
          />
        </div>

        {error && (
          <div
            className="p-4 text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-lg backdrop-blur-sm"
            data-testid="error-message"
          >
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={isLoading}
            data-testid="login-button"
          >
            {isLoading ? "Logowanie..." : "Zaloguj się"}
          </Button>

          <div className="text-center space-y-3">
            <a
              href="/reset-password"
              className="text-blue-200 hover:text-blue-100 text-sm hover:underline transition-colors"
            >
              Zapomniałeś hasła?
            </a>
            <p className="text-blue-100/80 text-sm">
              Nie masz jeszcze konta?{" "}
              <a
                href="/register"
                className="text-blue-200 hover:text-blue-100 hover:underline font-medium transition-colors"
              >
                Zarejestruj się
              </a>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
