import "server-only";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { getSessionClient } from "@/lib/supabase/server";

export type SessionClient = Awaited<ReturnType<typeof getSessionClient>>;

export interface AdminContext {
  supabase: SessionClient;
  user: User;
}

/**
 * Vérification serveur obligatoire de chaque page et action d'administration :
 * session valide (getUser contacte Supabase, pas seulement le cookie),
 * niveau MFA atteint si un facteur existe, et appartenance à public.admins.
 */
export const getAdmin = cache(async (): Promise<AdminContext | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await getSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") return null;

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return null;
  return { supabase, user };
});

/** Pour les pages : redirige vers la connexion si l'accès n'est pas autorisé. */
export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await getAdmin();
  if (!ctx) redirect("/admin/login");
  return ctx;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("unauthorized");
  }
}

/** Pour les actions : lève une erreur au lieu de rediriger. */
export async function assertAdmin(): Promise<AdminContext> {
  const ctx = await getAdmin();
  if (!ctx) throw new UnauthorizedError();
  return ctx;
}
