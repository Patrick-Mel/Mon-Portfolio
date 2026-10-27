import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { serverEnv } from "@/lib/server-env";
import { getServiceClient } from "@/lib/supabase/service";
import { MIN_FILL_TIME_MS } from "@/lib/validation/forms";

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "0.0.0.0").trim();
}

/** Empreinte non réversible d'une IP (aucune IP n'est stockée en clair). */
export function hashValue(value: string, extra = ""): string {
  return createHash("sha256").update(`${serverEnv.hashSalt}:${extra}:${value}`).digest("hex").slice(0, 32);
}

/* Repli mémoire quand Supabase n'est pas configuré (développement). */
const memory = new Map<string, { count: number; start: number }>();

/**
 * Limitation de débit par fenêtre fixe, partagée entre les instances via Postgres.
 * @returns true si l'action est autorisée.
 */
export async function rateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const db = getServiceClient();
  if (db) {
    const { data, error } = await db.rpc("hit_rate_limit", { p_key: key, p_max: max, p_window_seconds: windowSeconds });
    if (!error) return Boolean(data);
    console.error("[rate-limit]", error.message);
  }
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || now - entry.start > windowSeconds * 1000) {
    memory.set(key, { count: 1, start: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

/** Vérifie un jeton Cloudflare Turnstile. Désactivé (true) si aucune clé secrète. */
export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!serverEnv.turnstileSecretKey) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: serverEnv.turnstileSecretKey, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/** Pot de miel rempli ou formulaire envoyé trop vite : très probablement un robot. */
export function looksLikeSpam(input: { website?: string; startedAt?: number }): boolean {
  if (input.website) return true;
  if (input.startedAt && Date.now() - input.startedAt < MIN_FILL_TIME_MS) return true;
  return false;
}

/** Échappe le texte destiné à un e-mail HTML. */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
