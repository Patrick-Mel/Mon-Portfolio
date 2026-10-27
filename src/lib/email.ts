import "server-only";
import { escapeHtml } from "@/lib/security";
import { serverEnv } from "@/lib/server-env";
import type { SiteSettings } from "@/lib/types";

interface EmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

export const isEmailConfigured = () => Boolean(serverEnv.resendApiKey && serverEnv.emailFrom);

/**
 * Envoi via l'API HTTP de Resend (pas de SDK : moins de dépendances).
 * Ne lève jamais : un échec d'e-mail ne doit pas faire échouer une soumission déjà enregistrée.
 */
export async function sendEmail(input: EmailInput): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn(`[email] RESEND_API_KEY/EMAIL_FROM absents — e-mail non envoyé : « ${input.subject} »`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${serverEnv.resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: serverEnv.emailFrom,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo,
        headers: input.headers,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) console.error("[email] Resend", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("[email]", e);
    return false;
  }
}

/** Destinataire des notifications : variable dédiée, sinon l'e-mail de contact du site. */
export function ownerEmail(settings: SiteSettings): string {
  return serverEnv.ownerNotificationEmail || settings.contactEmail;
}

/** Gabarit HTML sobre, compatible clients mail (tableaux, styles en ligne). */
export function emailLayout(settings: SiteSettings, title: string, bodyHtml: string, footer?: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f6f5f1;font-family:Arial,Helvetica,sans-serif;color:#121210">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #e2dfd7">
<tr><td style="padding:24px 28px;border-bottom:3px solid ${settings.accentColor}">
<span style="font-weight:700;font-size:15px;letter-spacing:-.01em">${escapeHtml(settings.brandName)}</span></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:20px;line-height:1.3">${escapeHtml(title)}</h1>
${bodyHtml}
</td></tr>
<tr><td style="padding:16px 28px;border-top:1px solid #e2dfd7;font-size:12px;color:#6b6861">${footer ?? escapeHtml(settings.siteUrl)}</td></tr>
</table></td></tr></table></body></html>`;
}

/** Tableau clé/valeur échappé pour les notifications. */
export function emailFields(rows: [string, string][]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;line-height:1.5">${rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6b6861;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>`;
}
