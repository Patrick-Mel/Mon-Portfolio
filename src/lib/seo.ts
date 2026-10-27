import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { tr } from "@/lib/i18n-utils";
import type { Locale, SiteSettings } from "@/lib/types";

type Href = Parameters<typeof getPathname>[0]["href"];

/** URL absolue d'une route localisée. */
export function absoluteUrl(settings: SiteSettings, locale: Locale, href: Href): string {
  return `${settings.siteUrl}${getPathname({ locale, href })}`;
}

/** Canonical + hreflang (fr, en, x-default) pour une route. */
export function alternatesFor(settings: SiteSettings, locale: Locale, href: Href): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = absoluteUrl(settings, l, href);
  languages["x-default"] = absoluteUrl(settings, routing.defaultLocale, href);
  return {
    canonical: absoluteUrl(settings, locale, href),
    languages,
    types: { "application/rss+xml": `${settings.siteUrl}/${locale}/rss.xml` },
  };
}

interface PageMetaInput {
  settings: SiteSettings;
  locale: Locale;
  href: Href;
  title?: string;
  description?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  /** Image de partage spécifique ; sinon l'image générée par opengraph-image. */
  image?: string | null;
}

export function pageMetadata({
  settings,
  locale,
  href,
  title,
  description,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
  image,
}: PageMetaInput): Metadata {
  const desc = description || tr(settings.seoDescription, locale);
  const url = absoluteUrl(settings, locale, href);
  const images = image ? [{ url: image, width: 1200, height: 630 }] : undefined;
  return {
    title,
    description: desc,
    alternates: alternatesFor(settings, locale, href),
    openGraph: {
      type,
      url,
      title: title ?? tr(settings.seoTitle, locale),
      description: desc,
      siteName: settings.brandName,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? ["en_US"] : ["fr_FR"],
      ...(images && { images }),
      ...(type === "article" && { publishedTime, modifiedTime, tags, authors: [settings.ownerName] }),
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? tr(settings.seoTitle, locale),
      description: desc,
      ...(images && { images: images.map((i) => i.url) }),
    },
  };
}
