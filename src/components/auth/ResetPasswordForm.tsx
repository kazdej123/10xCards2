import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    // Form submission will be handled later
    // Simulate success for now
    setTimeout(() => {
      setMessage("Link do resetowania hasła został wysłany na Twój email");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
      <div className="space-y-2 text-center mb-6">
        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 text-transparent bg-clip-text">
          Reset hasła
        </h1>
        <p className="text-blue-100/90">Wprowadź swój adres email aby otrzymać link do resetowania hasła</p>
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
            disabled={isLoading}
          >
            {isLoading ? "Wysyłanie..." : "Wyślij link resetujący"}
          </Button>

          <div className="text-center space-y-3">
            <a href="/login" className="text-blue-200 hover:text-blue-100 text-sm hover:underline transition-colors">
              Powrót do logowania
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
