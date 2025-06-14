import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Extract access token from URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get("access_token");

    if (token) {
      setAccessToken(token);
    } else {
      setError("Nieprawidłowy lub wygasły link resetowania hasła");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    if (!password || !confirmPassword) {
      setError("Wszystkie pola są wymagane");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków");
      setIsLoading(false);
      return;
    }

    if (!accessToken) {
      setError("Brak tokenu dostępu");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("password", password);
      formData.append("accessToken", accessToken);

      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Hasło zostało pomyślnie zaktualizowane. Możesz teraz się zalogować.");
        setPassword("");
        setConfirmPassword("");
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else {
        setError(data.error || "Wystąpił błąd podczas aktualizacji hasła");
      }
    } catch {
      setError("Wystąpił błąd podczas wysyłania żądania");
    } finally {
      setIsLoading(false);
    }
  };

  if (!accessToken) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Błąd</h1>
          <p className="text-red-200">{error}</p>
          <Button
            onClick={() => (window.location.href = "/reset-password")}
            className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Powrót do resetowania hasła
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
      <div className="space-y-2 text-center mb-6">
        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 text-transparent bg-clip-text">
          Nowe hasło
        </h1>
        <p className="text-blue-100/90">Wprowadź nowe hasło dla swojego konta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-blue-100 font-medium">
            Nowe hasło
          </Label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 backdrop-blur-sm"
            placeholder="Wprowadź nowe hasło"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-blue-100 font-medium">
            Potwierdź hasło
          </Label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 backdrop-blur-sm"
            placeholder="Potwierdź nowe hasło"
          />
        </div>

        {error && (
          <div className="p-4 text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-lg backdrop-blur-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="p-4 text-sm text-green-200 bg-green-500/20 border border-green-500/30 rounded-lg backdrop-blur-sm">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={isLoading || !accessToken}
          >
            {isLoading ? "Aktualizowanie..." : "Zaktualizuj hasło"}
          </Button>

          <div className="text-center">
            <a href="/login" className="text-blue-200 hover:text-blue-100 text-sm hover:underline transition-colors">
              Powrót do logowania
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
