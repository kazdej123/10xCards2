import { Button } from "../ui/button";

interface AuthButtonsProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
}

export function AuthButtons({ isLoggedIn, onLogout }: AuthButtonsProps) {
  if (isLoggedIn) {
    return (
      <Button
        variant="outline"
        onClick={onLogout}
        className="text-red-200 hover:text-red-100 border-red-400/50 hover:bg-red-500/20 hover:border-red-400/70 transition-all duration-200"
      >
        Wyloguj
      </Button>
    );
  }

  return (
    <div className="flex gap-3">
      <Button
        asChild
        className="bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200 backdrop-blur-sm"
      >
        <a href="/login">Logowanie</a>
      </Button>
      <Button
        asChild
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <a href="/register">Rejestracja</a>
      </Button>
    </div>
  );
}
