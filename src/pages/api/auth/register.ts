import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Basic password validation
  if (password.length < 8) {
    return new Response(JSON.stringify({ error: "Hasło musi mieć co najmniej 8 znaków" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Return success with user data and confirmation message
  return new Response(
    JSON.stringify({
      user: data.user,
      needsConfirmation: !data.user?.email_confirmed_at,
      message: data.user?.email_confirmed_at
        ? "Konto zostało utworzone i aktywowane."
        : "Konto zostało utworzone. Sprawdź swoją skrzynkę pocztową i kliknij link aktywacyjny, aby dokończyć rejestrację.",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
