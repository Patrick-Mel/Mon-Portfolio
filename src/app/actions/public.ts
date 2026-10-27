"use server";

import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { getTranslations } from "next-intl/server";
import { getSettings } from "@/lib/data/content";
import { emailFields, emailLayout, ownerEmail, sendEmail } from "@/lib/email";
import { escapeHtml, getClientIp, hashValue, looksLikeSpam, rateLimit, verifyTurnstile } from "@/lib/security";
import { getServiceClient } from "@/lib/supabase/service";
import {
  ATTACHMENT_TYPES,
  commentSchema,
  contactSchema,
  fieldErrorsOf,
  newsletterSchema,
  quoteSchema,
  validateAttachments,
  type ActionResult,
  type CommentInput,
  type ContactInput,
  type NewsletterInput,
} from "@/lib/validation/forms";

/**
 * Toutes les soumissions publiques suivent la même chaîne :
 * validation zod → anti-spam (pot de miel, délai) → limitation de débit par IP hachée
 * → Turnstile (si configuré) → écriture service_role → notification e-mail en différé.
 */
async function guard(
  scope: string,
  input: { website?: string; startedAt?: number; turnstileToken?: string },
  limit: { max: number; windowSeconds: number },
): Promise<{ ok: true; ipHash: string } | { ok: false; error: "spam" | "rateLimited" | "captcha" }> {
  if (looksLikeSpam(input)) return { ok: false, error: "spam" };
  const ip = await getClientIp();
  const ipHash = hashValue(ip, "ip");
  if (!(await rateLimit(`${scope}:${ipHash}`, limit.max, limit.windowSeconds))) return { ok: false, error: "rateLimited" };
  if (!(await verifyTurnstile(input.turnstileToken ?? "", ip))) return { ok: false, error: "captcha" };
  return { ok: true, ipHash };
}

export async function submitContact(raw: ContactInput): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "validation", fieldErrors: fieldErrorsOf(parsed.error) };
  const data = parsed.data;

  const g = await guard("contact", data, { max: 5, windowSeconds: 3600 });
  if (!g.ok) return g;

  const db = getServiceClient();
  if (!db) return { ok: false, error: "unavailable" };
  const { error } = await db.from("contact_messages").insert({
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    locale: data.locale,
    ip_hash: g.ipHash,
  });
  if (error) {
    console.error("[contact]", error.message);
    return { ok: false, error: "generic" };
  }

  after(async () => {
    const settings = await getSettings();
    await sendEmail({
      to: ownerEmail(settings),
      replyTo: data.email,
      subject: `[Contact] ${data.subject}`,
      text: `${data.name} <${data.email}>\n\n${data.message}`,
      html: emailLayout(
        settings,
        "Nouveau message de contact",
        emailFields([
          ["Nom", data.name],
          ["E-mail", data.email],
          ["Sujet", data.subject],
          ["Langue", data.locale],
          ["Message", data.message],
        ]),
        `Répondez directement à cet e-mail ou depuis ${escapeHtml(settings.siteUrl)}/admin/inbox`,
      ),
    });
  });
  return { ok: true };
}

export async function submitQuote(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string"));
  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "validation", fieldErrors: fieldErrorsOf(parsed.error) };
  const data = parsed.data;

  const files = formData.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);
  const fileError = validateAttachments(files);
  if (fileError) return { ok: false, error: "validation", fieldErrors: { attachments: fileError } };

  const g = await guard("quote", data, { max: 3, windowSeconds: 3600 });
  if (!g.ok) return g;

  const db = getServiceClient();
  if (!db) return { ok: false, error: "unavailable" };

  const attachments: { path: string; name: string; size: number; type: string }[] = [];
  for (const file of files) {
    const ext = ATTACHMENT_TYPES[file.type] ?? "bin";
    const path = `quotes/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${ext}`;
    const { error } = await db.storage.from("private").upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      console.error("[quote:upload]", error.message);
      return { ok: false, error: "generic" };
    }
    attachments.push({ path, name: file.name.slice(0, 120), size: file.size, type: file.type });
  }

  const { error } = await db.from("quote_requests").insert({
    service: data.service,
    description: data.description,
    budget: data.budget,
    timeline: data.timeline,
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    attachments,
    locale: data.locale,
    ip_hash: g.ipHash,
  });
  if (error) {
    console.error("[quote]", error.message);
    return { ok: false, error: "generic" };
  }

  after(async () => {
    const [settings, t] = await Promise.all([getSettings(), getTranslations({ locale: "fr", namespace: "quote" })]);
    await sendEmail({
      to: ownerEmail(settings),
      replyTo: data.email,
      subject: `[Devis] ${data.name} — ${data.service}`,
      text: `${data.name} <${data.email}>\n${data.service} · ${data.budget} · ${data.timeline}\n\n${data.description}`,
      html: emailLayout(
        settings,
        "Nouvelle demande de devis",
        emailFields([
          ["Nom", data.name],
          ["E-mail", data.email],
          ["Téléphone", data.phone],
          ["Organisation", data.company],
          ["Prestation", data.service],
          ["Budget", t(`budgets.${data.budget}`)],
          ["Délai", t(`timelines.${data.timeline}`)],
          ["Pièces jointes", attachments.map((a) => a.name).join(", ")],
          ["Besoin", data.description],
        ]),
      ),
    });
  });
  return { ok: true };
}

export async function submitComment(raw: CommentInput): Promise<ActionResult> {
  const parsed = commentSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "validation", fieldErrors: fieldErrorsOf(parsed.error) };
  const data = parsed.data;

  const settings = await getSettings();
  if (!settings.features.comments) return { ok: false, error: "unavailable" };

  const g = await guard("comment", data, { max: 5, windowSeconds: 600 });
  if (!g.ok) return g;

  const db = getServiceClient();
  if (!db) return { ok: false, error: "unavailable" };

  const { data: post } = await db.from("posts").select("id").eq("id", data.postId).maybeSingle();
  if (!post) return { ok: false, error: "validation", fieldErrors: { content: "invalid" } };

  const { error } = await db.from("comments").insert({
    post_id: data.postId,
    author_name: data.name,
    author_email: data.email,
    content: data.content,
    locale: data.locale,
    ip_hash: g.ipHash,
  });
  if (error) {
    console.error("[comment]", error.message);
    return { ok: false, error: "generic" };
  }

  after(() =>
    sendEmail({
      to: ownerEmail(settings),
      subject: `[Commentaire à modérer] ${data.postSlug}`,
      text: `${data.name}: ${data.content}`,
      html: emailLayout(settings, "Nouveau commentaire à modérer", emailFields([["Article", data.postSlug], ["Nom", data.name], ["Commentaire", data.content]])),
    }),
  );
  return { ok: true };
}

export async function subscribeNewsletter(raw: NewsletterInput): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "validation", fieldErrors: fieldErrorsOf(parsed.error) };
  const data = parsed.data;

  const settings = await getSettings();
  if (!settings.features.newsletter) return { ok: false, error: "unavailable" };

  const g = await guard("newsletter", data, { max: 5, windowSeconds: 3600 });
  if (!g.ok) return g;

  const db = getServiceClient();
  if (!db) return { ok: false, error: "unavailable" };

  const email = data.email.toLowerCase();
  const { data: existing } = await db.from("subscribers").select("id, status").ilike("email", email).maybeSingle();
  // Déjà confirmé : on répond comme pour une nouvelle inscription (pas de fuite d'information).
  if (existing?.status === "confirmed") return { ok: true };

  const token = randomUUID();
  const write = existing
    ? db.from("subscribers").update({ status: "pending", token, locale: data.locale, unsubscribed_at: null }).eq("id", existing.id)
    : db.from("subscribers").insert({ email, locale: data.locale, token });
  const { error } = await write;
  if (error) {
    console.error("[newsletter]", error.message);
    return { ok: false, error: "generic" };
  }

  after(async () => {
    const t = await getTranslations({ locale: data.locale, namespace: "newsletter.mail" });
    const confirmUrl = `${settings.siteUrl}/api/newsletter/confirm?token=${token}`;
    await sendEmail({
      to: email,
      subject: t("confirmSubject", { name: settings.brandName }),
      text: `${t("confirmIntro")}\n\n${confirmUrl}\n\n${t("ignore")}`,
      html: emailLayout(
        settings,
        t("confirmSubject", { name: settings.brandName }),
        `<p style="font-size:15px;line-height:1.6">${escapeHtml(t("confirmIntro"))}</p>
<p style="margin:24px 0"><a href="${confirmUrl}" style="background:${settings.accentColor};color:#140a04;padding:12px 20px;text-decoration:none;font-weight:600;display:inline-block">${escapeHtml(t("confirmButton"))}</a></p>
<p style="font-size:13px;color:#6b6861">${escapeHtml(t("ignore"))}</p>`,
      ),
    });
  });
  return { ok: true };
}
