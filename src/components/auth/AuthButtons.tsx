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
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        Wyloguj
      </Button>
    );
  }

  return (
    <div className="flex gap-4">
      <Button variant="outline" asChild>
        <a href="/login">Logowanie</a>
      </Button>
      <Button asChild>
        <a href="/register">Rejestracja</a>
      </Button>
    </div>
  );
}
