import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config, isSupabaseConfigured } from "@/lib/config";

let client: SupabaseClient | null = null;

/** True when Supabase credentials are valid and mock auth is not active. */
export function isSupabaseAvailable(): boolean {
  return isSupabaseConfigured() && !config.useMockAuth;
}

export function getSupabase(): SupabaseClient {
  if (!isSupabaseAvailable()) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  if (!client) {
    client = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  return client;
}
