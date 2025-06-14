import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const password = formData.get("password")?.toString();
    const accessToken = formData.get("accessToken")?.toString();

    if (!password || !accessToken) {
      return new Response(JSON.stringify({ error: "Hasło i token dostępu są wymagane" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: "Hasło musi mieć co najmniej 6 znaków" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    // Set the session using the access token
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.error("Invalid access token:", userError);
      return new Response(JSON.stringify({ error: "Nieprawidłowy lub wygasły token dostępu" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update the user's password
    const { error } = await supabase.auth.updateUser({ password }, { accessToken });

    if (error) {
      console.error("Update password error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        message: "Hasło zostało pomyślnie zaktualizowane",
        success: true,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error in update password:", error);
    return new Response(JSON.stringify({ error: "Wystąpił nieoczekiwany błąd" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
