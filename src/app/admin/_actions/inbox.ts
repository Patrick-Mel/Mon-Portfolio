"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity, revalidatePublicSite } from "@/lib/admin/activity";
import { assertAdmin } from "@/lib/admin/auth";
import { getSettings } from "@/lib/data/content";
import { emailLayout, isEmailConfigured, sendEmail } from "@/lib/email";
import { renderMarkdown } from "@/lib/markdown";
import { escapeHtml } from "@/lib/security";

const INBOX_TABLES = { message: "contact_messages", quote: "quote_requests" } as const;
const INBOX_STATUS = ["new", "read", "in_progress", "done"] as const;
type InboxType = keyof typeof INBOX_TABLES;

function inboxTable(type: string) {
  if (!(type in INBOX_TABLES)) throw new Error("Type inconnu");
  return INBOX_TABLES[type as InboxType];
}

export async function setInboxStatus(fd: FormData): Promise<void> {
  const ctx = await assertAdmin();
  const table = inboxTable(String(fd.get("type")));
  const status = z.enum(INBOX_STATUS).parse(fd.get("status"));
  const id = z.string().uuid().parse(fd.get("id"));
  await ctx.supabase.from(table).update({ status }).eq("id", id);
  await logActivity(ctx, "status", table, id, { status });
  revalidatePath("/admin", "layout");
}

export async function deleteInboxItem(fd: FormData): Promise<void> {
  const ctx = await assertAdmin();
  const type = String(fd.get("type"));
  const table = inboxTable(type);
  const id = z.string().uuid().parse(fd.get("id"));
  if (type === "quote") {
    const { data } = await ctx.supabase.from("quote_requests").select("attachments").eq("id", id).maybeSingle();
    const paths = ((data?.attachments ?? []) as { path: string }[]).map((a) => a.path);
    if (paths.length) await ctx.supabase.storage.from("private").remove(paths);
  }
  await ctx.supabase.from(table).delete().eq("id", id);
  await logActivity(ctx, "delete", table, id);
  revalidatePath("/admin", "layout");
}

/** Lien de téléchargement temporaire (60 s) d'une pièce jointe privée. */
export async function attachmentUrl(path: string): Promise<string | null> {
  const ctx = await assertAdmin();
  if (!/^quotes\/[\w/.-]+$/.test(path)) return null;
  const { data } = await ctx.supabase.storage.from("private").createSignedUrl(path, 60, { download: true });
  return data?.signedUrl ?? null;
}

export type ReplyState = { ok?: boolean; error?: string } | null;

const replySchema = z.object({
  type: z.enum(["message", "quote"]),
  id: z.string().uuid(),
  subject: z.string().trim().min(2).max(200),
  body: z.string().trim().min(2).max(20000),
});

/** Réponse par e-mail depuis l'admin (Resend), avec passage au statut « en cours ». */
export async function replyByEmail(_prev: ReplyState, fd: FormData): Promise<ReplyState> {
  const ctx = await assertAdmin();
  const parsed = replySchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: "Objet et message requis." };
  if (!isEmailConfigured()) return { error: "Resend n'est pas configuré : utilisez le lien « Répondre avec ma messagerie »." };
  const { type, id, subject, body } = parsed.data;
  const table = inboxTable(type);
  const { data: item } = await ctx.supabase.from(table).select("email, name").eq("id", id).maybeSingle();
  if (!item) return { error: "Élément introuvable." };

  const settings = await getSettings();
  const { html } = await renderMarkdown(body);
  const sent = await sendEmail({
    to: item.email as string,
    replyTo: settings.contactEmail,
    subject,
    text: body,
    html: emailLayout(settings, subject, `<div style="font-size:15px;line-height:1.6">${html}</div>`, `${escapeHtml(settings.ownerName)} — ${escapeHtml(settings.siteUrl)}`),
  });
  if (!sent) return { error: "L'envoi a échoué. Consultez les journaux Resend." };
  await ctx.supabase.from(table).update({ status: "in_progress" }).eq("id", id);
  await logActivity(ctx, "reply", table, id, { subject });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/* ---------- Commentaires ---------- */

export async function moderateComment(fd: FormData): Promise<void> {
  const ctx = await assertAdmin();
  const id = z.string().uuid().parse(fd.get("id"));
  const action = z.enum(["approved", "rejected", "spam", "pending", "delete"]).parse(fd.get("action"));
  if (action === "delete") await ctx.supabase.from("comments").delete().eq("id", id);
  else await ctx.supabase.from("comments").update({ status: action }).eq("id", id);
  await logActivity(ctx, action === "delete" ? "delete" : "moderate", "comments", id, { action });
  revalidatePublicSite();
  revalidatePath("/admin", "layout");
}

/* ---------- Newsletter ---------- */

export async function deleteSubscriber(fd: FormData): Promise<void> {
  const ctx = await assertAdmin();
  const id = z.string().uuid().parse(fd.get("id"));
  await ctx.supabase.from("subscribers").delete().eq("id", id);
  await logActivity(ctx, "delete", "subscribers", id);
  revalidatePath("/admin/newsletter");
}

export type CampaignState = { ok?: boolean; error?: string; sent?: number } | null;

const campaignSchema = z.object({
  subject: z.string().trim().min(2).max(200),
  body: z.string().trim().min(10).max(50000),
  audience: z.enum(["all", "fr", "en"]),
});

/**
 * Envoi d'une campagne aux abonnés confirmés, un e-mail par destinataire
 * (lien de désinscription personnel + en-têtes List-Unsubscribe).
 */
export async function sendCampaign(_prev: CampaignState, fd: FormData): Promise<CampaignState> {
  const ctx = await assertAdmin();
  const parsed = campaignSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: "Objet (2+ caractères) et contenu (10+ caractères) requis." };
  if (!isEmailConfigured()) return { error: "Resend n'est pas configuré (RESEND_API_KEY, EMAIL_FROM)." };
  const { subject, body, audience } = parsed.data;

  let query = ctx.supabase.from("subscribers").select("email, token, locale").eq("status", "confirmed");
  if (audience !== "all") query = query.eq("locale", audience);
  const { data: subs } = await query;
  if (!subs?.length) return { error: "Aucun abonné confirmé pour cette audience." };

  const settings = await getSettings();
  const { html } = await renderMarkdown(body);
  let sent = 0;
  for (const s of subs) {
    const unsubscribe = `${settings.siteUrl}/api/newsletter/unsubscribe?token=${s.token}`;
    const label = s.locale === "en" ? "Unsubscribe in one click" : "Se désinscrire en un clic";
    const ok = await sendEmail({
      to: s.email as string,
      subject,
      text: `${body}\n\n${label} : ${unsubscribe}`,
      html: emailLayout(settings, subject, `<div style="font-size:15px;line-height:1.6">${html}</div>`, `<a href="${unsubscribe}" style="color:#6b6861">${label}</a>`),
      headers: { "List-Unsubscribe": `<${unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    });
    if (ok) sent += 1;
  }
  await ctx.supabase.from("campaigns").insert({ subject, body, audience, recipients: sent, sent_at: new Date().toISOString() });
  await logActivity(ctx, "send", "campaigns", null, { subject, sent });
  revalidatePath("/admin/newsletter");
  return { ok: true, sent };
}
