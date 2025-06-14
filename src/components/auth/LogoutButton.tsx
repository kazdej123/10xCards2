import { useState } from "react";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
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
        // Silent fail - user will see they're still logged in
      }
    } catch {
      // Silent fail - user will see they're still logged in
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="px-4 py-2 bg-red-500/80 hover:bg-red-600/80 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "Wylogowywanie..." : "Wyloguj"}
    </button>
  );
}
