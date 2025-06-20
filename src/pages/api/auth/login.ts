import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  let email: string | undefined;
  let password: string | undefined;

  // Check Content-Type to determine how to parse the request
  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      // Handle JSON data (for API requests)
      const jsonData = await request.json();
      email = jsonData.email;
      password = jsonData.password;
    } else {
      // Handle FormData (for form submissions)
      const formData = await request.formData();
      email = formData.get("email")?.toString();
      password = formData.get("password")?.toString();
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check if this is an API request (JSON content-type) or form submission
  if (contentType.includes("application/json")) {
    // Return JSON response for API requests
    return new Response(
      JSON.stringify({
        token: data.session?.access_token || "",
        user: {
          id: data.user?.id,
          email: data.user?.email,
          role: data.user?.user_metadata?.role || "user",
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } else {
    // Redirect for form submissions
    return redirect("/generate");
  }
};
