"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { logActivity } from "@/lib/admin/activity";
import { assertAdmin, getAdmin } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { getClientIp, hashValue, rateLimit } from "@/lib/security";
import { getSessionClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; ok?: boolean } | null;

const credentials = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(200),
});

const GENERIC = "Identifiants invalides.";

/**
 * Connexion : limitation par IP (10 / 15 min) et par compte (5 / 15 min),
 * message d'erreur générique, contrôle d'appartenance à public.admins.
 */
export async function signIn(_prev: AuthState, fd: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured) return { error: "Supabase n'est pas configuré." };
  const parsed = credentials.safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { error: GENERIC };
  const { email, password } = parsed.data;

  const ipHash = hashValue(await getClientIp(), "ip");
  const allowed =
    (await rateLimit(`login:ip:${ipHash}`, 10, 900)) && (await rateLimit(`login:user:${hashValue(email, "email")}`, 5, 900));
  if (!allowed) return { error: "Trop de tentatives. Réessayez dans 15 minutes." };

  const supabase = await getSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: GENERIC };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { error: GENERIC };
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") redirect("/admin/login/mfa");

  const ctx = await getAdmin();
  if (ctx) await logActivity(ctx, "login", "auth");
  redirect("/admin");
}

export async function verifyMfa(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const code = String(fd.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { error: "Code à 6 chiffres attendu." };
  const ipHash = hashValue(await getClientIp(), "ip");
  if (!(await rateLimit(`mfa:${ipHash}`, 8, 900))) return { error: "Trop de tentatives. Réessayez dans 15 minutes." };

  const supabase = await getSessionClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((f) => f.status === "verified");
  if (!factor) redirect("/admin");
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) return { error: "Code incorrect ou expiré." };

  const ctx = await getAdmin();
  if (ctx) await logActivity(ctx, "login", "auth", null, { mfa: true });
  redirect("/admin");
}

export async function signOut(): Promise<void> {
  const supabase = await getSessionClient();
  const ctx = await getAdmin();
  if (ctx) await logActivity(ctx, "logout", "auth");
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* ---------- Double authentification (TOTP) ---------- */

export type MfaEnrollState = { factorId?: string; qr?: string; secret?: string; error?: string; ok?: boolean } | null;

export async function startMfaEnroll(): Promise<MfaEnrollState> {
  const ctx = await assertAdmin();
  // Nettoie les facteurs non vérifiés d'une tentative précédente.
  const { data: factors } = await ctx.supabase.auth.mfa.listFactors();
  for (const f of factors?.all ?? []) if (f.status !== "verified") await ctx.supabase.auth.mfa.unenroll({ factorId: f.id });
  const { data, error } = await ctx.supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `admin-${Date.now()}` });
  if (error || !data) return { error: error?.message ?? "Activation impossible." };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function confirmMfaEnroll(_prev: MfaEnrollState, fd: FormData): Promise<MfaEnrollState> {
  const ctx = await assertAdmin();
  const factorId = String(fd.get("factorId") ?? "");
  const code = String(fd.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { factorId, error: "Code à 6 chiffres attendu." };
  const { error } = await ctx.supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { factorId, error: "Code incorrect. Vérifiez l'heure de votre téléphone." };
  await logActivity(ctx, "mfa_enabled", "auth");
  return { ok: true };
}

export async function disableMfa(fd: FormData): Promise<void> {
  const ctx = await assertAdmin();
  const factorId = String(fd.get("factorId") ?? "");
  await ctx.supabase.auth.mfa.unenroll({ factorId });
  await logActivity(ctx, "mfa_disabled", "auth");
  redirect("/admin/settings/security");
}
