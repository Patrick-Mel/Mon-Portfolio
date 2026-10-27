import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getPosts, getSettings } from "@/lib/data/content";
import { tr } from "@/lib/i18n-utils";
import type { Locale } from "@/lib/types";
import { escapeXml } from "@/lib/xml";

export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Flux RSS 2.0 du blog, un par langue. */
export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (routing.locales as readonly string[]).includes(raw) ? (raw as Locale) : routing.defaultLocale;
  const [settings, posts, t] = await Promise.all([getSettings(), getPosts(), getTranslations({ locale, namespace: "blog" })]);
  const home = `${settings.siteUrl}${getPathname({ locale, href: "/blog" })}`;

  const items = posts
    .slice(0, 30)
    .map((p) => {
      const url = `${settings.siteUrl}${getPathname({ locale, href: { pathname: "/blog/[slug]", params: { slug: p.slug } } })}`;
      return [
        "    <item>",
        `      <title>${escapeXml(tr(p.title, locale))}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escapeXml(tr(p.excerpt, locale))}</description>`,
        p.publishedAt ? `      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>` : "",
        p.category ? `      <category>${escapeXml(tr(p.category.name, locale))}</category>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${settings.brandName} — ${t("title")}`)}</title>
    <link>${home}</link>
    <description>${escapeXml(t("metaDescription"))}</description>
    <language>${locale}</language>
    <atom:link href="${settings.siteUrl}/${locale}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}
