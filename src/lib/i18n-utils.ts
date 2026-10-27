import type { I18n, Locale, LocalizedText, SiteSettings } from "@/lib/types";

/** Résout un texte traduit (ou un terme technique identique dans toutes les langues). */
export function tr(value: LocalizedText | null | undefined, locale: Locale): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.fr || value.en || "";
}

export function trList(value: I18n<string[]> | null | undefined, locale: Locale): string[] {
  if (!value) return [];
  return value[locale]?.length ? value[locale] : (value.fr ?? []);
}

/** Remplace les variables {{ownerName}}, {{siteUrl}}… des modèles éditables. */
export function fillTemplate(text: string, settings: SiteSettings, locale: Locale): string {
  const vars: Record<string, string> = {
    ownerName: settings.ownerName,
    brandName: settings.brandName,
    siteUrl: settings.siteUrl,
    contactEmail: settings.contactEmail,
    location: tr(settings.location, locale),
  };
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => vars[key] ?? match);
}

/** Temps de lecture estimé (200 mots/minute, minimum 1). */
export function readingTime(markdown: string): number {
  const words = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const intlLocale = (locale: Locale) => (locale === "fr" ? "fr-FR" : "en-GB");

export function formatDate(iso: string, locale: Locale, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
    ...opts,
  }).format(new Date(iso));
}

/** « 2025-10 » → « oct. 2025 » */
export function formatMonth(ym: string, locale: Locale): string {
  const [y, m] = ym.split("-").map(Number);
  return new Intl.DateTimeFormat(intlLocale(locale), {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y ?? 2000, (m ?? 1) - 1, 1)));
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
