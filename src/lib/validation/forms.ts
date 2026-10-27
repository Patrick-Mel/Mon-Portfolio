import { z } from "zod";
import { LOCALES } from "@/lib/types";

/**
 * Schémas partagés client (react-hook-form) et serveur (Server Actions).
 * Les messages sont des codes « clé:paramètre » traduits côté client
 * (voir `translateFieldError`), jamais du texte en dur.
 */

const text = (min: number, max: number) =>
  z
    .string({ error: "required" })
    .trim()
    .min(1, "required")
    .min(min, `tooShort:${min}`)
    .max(max, `tooLong:${max}`);

const optionalText = (max: number) => z.string().trim().max(max, `tooLong:${max}`).optional().default("");

const email = z.string({ error: "required" }).trim().min(1, "required").max(200, "tooLong:200").pipe(z.email("email"));

/** Champs anti-spam communs : pot de miel + horodatage d'affichage du formulaire. */
const antiSpam = {
  website: z.string().max(0, "invalid").optional().default(""),
  startedAt: z.coerce.number().optional().default(0),
  turnstileToken: z.string().max(4096).optional().default(""),
  locale: z.enum(LOCALES).default("fr"),
};

export const contactSchema = z.object({
  name: text(2, 100),
  email,
  subject: text(2, 150),
  message: text(10, 5000),
  ...antiSpam,
});
export type ContactInput = z.input<typeof contactSchema>;

export const BUDGETS = ["lt150k", "150k-500k", "500k-1500k", "gt1500k", "unknown"] as const;
export const TIMELINES = ["urgent", "1month", "3months", "flexible"] as const;

export const quoteSchema = z.object({
  service: text(1, 80),
  description: text(20, 8000),
  budget: z.enum(BUDGETS, { error: "required" }),
  timeline: z.enum(TIMELINES, { error: "required" }),
  name: text(2, 100),
  email,
  phone: z
    .string()
    .trim()
    .max(40, "tooLong:40")
    .regex(/^[+()\d\s.-]*$/, "invalid")
    .optional()
    .default(""),
  company: optionalText(120),
  ...antiSpam,
});
export type QuoteInput = z.input<typeof quoteSchema>;

export const ATTACHMENT_MAX_FILES = 3;
export const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
export const ATTACHMENT_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "text/plain": "txt",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};

/** Vérifie la liste de pièces jointes ; renvoie un code d'erreur ou null. */
export function validateAttachments(files: { size: number; type: string }[]): string | null {
  if (files.length > ATTACHMENT_MAX_FILES) return "tooManyFiles";
  for (const f of files) {
    if (f.size > ATTACHMENT_MAX_BYTES) return "fileTooLarge";
    if (!(f.type in ATTACHMENT_TYPES)) return "fileType";
  }
  return null;
}

export const commentSchema = z.object({
  postId: z.string().min(1).max(64),
  postSlug: z.string().min(1).max(120),
  name: text(2, 80),
  email,
  content: text(2, 2000),
  ...antiSpam,
});
export type CommentInput = z.input<typeof commentSchema>;

export const newsletterSchema = z.object({
  email,
  ...antiSpam,
});
export type NewsletterInput = z.input<typeof newsletterSchema>;

/** Délai minimal (ms) entre l'affichage et l'envoi : les robots soumettent instantanément. */
export const MIN_FILL_TIME_MS = 2500;

export type ActionError = "validation" | "rateLimited" | "spam" | "captcha" | "unavailable" | "generic";
export type ActionResult = { ok: true } | { ok: false; error: ActionError; fieldErrors?: Record<string, string> };

/** Convertit les erreurs zod en { champ: code } pour l'affichage client. */
export function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
