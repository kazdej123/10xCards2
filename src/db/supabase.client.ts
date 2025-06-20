import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_KEY;

// Debug information in test environment
if (import.meta.env.MODE === "test" || process.env.NODE_ENV === "test") {
  // eslint-disable-next-line no-console
  console.log("🐛 Supabase client debug info:");
  // eslint-disable-next-line no-console
  console.log(`   SUPABASE_URL: ${supabaseUrl ? "SET (****)" : "NOT SET"}`);
  // eslint-disable-next-line no-console
  console.log(`   SUPABASE_KEY: ${supabaseKey ? "SET (****)" : "NOT SET"}`);
  // eslint-disable-next-line no-console
  console.log(`   MODE: ${import.meta.env.MODE}`);
  // eslint-disable-next-line no-console
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
}

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is required. Please set it in your environment variables or .env file.");
}

if (!supabaseKey) {
  throw new Error("SUPABASE_KEY is required. Please set it in your environment variables or .env file.");
}

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: false, // Set to false for localhost
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });
};

// Client-side Supabase client
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
export type SupabaseClient = typeof supabaseClient;
