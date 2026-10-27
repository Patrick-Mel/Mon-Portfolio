import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/server-env";

let client: SupabaseClient | null = null;

/**
 * Client `service_role` : contourne la RLS. Réservé aux actions serveur qui ont
 * déjà validé et filtré leurs entrées (formulaires publics, analytics).
 * Retourne null si la clé n'est pas configurée.
 */
export function getServiceClient(): SupabaseClient | null {
  if (!publicEnv.supabaseUrl || !serverEnv.supabaseServiceRoleKey) return null;
  client ??= createClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
