/// <reference types="astro/client" />

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export interface User {
  id: string;
  email: string | null | undefined;
}

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user?: User;
    }
  }
}
