import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";

let client: SupabaseClient | null = null;

/**
 * Client anonyme sans cookies, pour lire le contenu publié depuis les
 * composants serveur sans rendre les pages dynamiques (compatible ISR).
 * Soumis aux politiques RLS du rôle `anon`.
 */
export function getPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  client ??= createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
