import { useState } from "react";
import { Button } from "../ui/button";
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
    <div className="w-full max-w-md mx-auto p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
      <div className="space-y-2 text-center mb-6">
        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 text-transparent bg-clip-text">
          Rejestracja
        </h1>
        <p className="text-blue-100/90">Utwórz nowe konto aby korzystać z aplikacji</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
          />
          <p className="text-xs text-blue-200/70">Minimum 8 znaków</p>
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
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-4 text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-lg backdrop-blur-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={isLoading}
          >
            {isLoading ? "Rejestracja..." : "Zarejestruj się"}
          </Button>

          <p className="text-blue-100/80 text-sm text-center">
            Masz już konto?{" "}
            <a
              href="/login"
              className="text-blue-200 hover:text-blue-100 hover:underline font-medium transition-colors"
            >
              Zaloguj się
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
