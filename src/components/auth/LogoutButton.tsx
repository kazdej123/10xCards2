import { useState } from "react";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      // Clear client-side storage first
      localStorage.clear();
      sessionStorage.clear();

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Redirect to home page
        window.location.href = "/";
      } else {
        // Handle logout failure - force reload to clear any stale state
        window.location.reload();
      }
    } catch {
      // Handle logout error - force redirect on error
      window.location.href = "/";
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      data-testid="logout-button"
      className="px-4 py-2 bg-red-500/80 hover:bg-red-600/80 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "Wylogowywanie..." : "Wyloguj"}
    </button>
  );
}
