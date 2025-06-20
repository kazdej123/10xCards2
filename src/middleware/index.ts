import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/reset-password",
  "/auth/update-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/reset-password",
  "/api/auth/update-password",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  // Skip middleware auth for API routes - let them handle their own authentication
  if (url.pathname.startsWith("/api/")) {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });
    locals.supabase = supabase;

    // Get user session for API routes
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Store user in locals if authenticated (API routes will check this)
    if (user) {
      locals.user = {
        id: user.id,
        email: user.email,
      };
    }

    return next();
  }

  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  locals.supabase = supabase;

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Store user in locals if authenticated
  if (user) {
    locals.user = {
      id: user.id,
      email: user.email,
    };

    // Redirect authenticated users away from auth pages
    if (url.pathname === "/login" || url.pathname === "/register" || url.pathname === "/reset-password") {
      return redirect("/generate");
    }
  } else {
    // Redirect to login for protected routes
    return redirect("/login");
  }

  const response = await next();
  return response;
});
