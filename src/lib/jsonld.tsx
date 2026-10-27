import { tr } from "@/lib/i18n-utils";
import type { Locale, Post, Project, Service, SiteSettings } from "@/lib/types";

type Json = Record<string, unknown>;

/** Sérialisation sûre : empêche la fermeture prématurée de la balise script. */
export function JsonLd({ data }: { data: Json | Json[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function websiteJsonLd(s: SiteSettings, locale: Locale): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${s.siteUrl}/#website`,
    url: s.siteUrl,
    name: s.brandName,
    description: tr(s.seoDescription, locale),
    inLanguage: locale,
    publisher: { "@id": `${s.siteUrl}/#person` },
  };
}

export function personJsonLd(s: SiteSettings, locale: Locale): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${s.siteUrl}/#person`,
    name: s.ownerName,
    url: s.siteUrl,
    jobTitle: tr(s.role, locale),
    email: `mailto:${s.contactEmail}`,
    ...(s.avatarUrl && { image: s.avatarUrl }),
    address: { "@type": "PostalAddress", addressLocality: tr(s.location, locale) },
    sameAs: Object.values(s.socials).filter(Boolean),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}

export function articleJsonLd(s: SiteSettings, post: Post, locale: Locale, url: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: tr(post.title, locale),
    description: tr(post.excerpt, locale),
    url,
    mainEntityOfPage: url,
    inLanguage: locale,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@id": `${s.siteUrl}/#person` },
    publisher: { "@id": `${s.siteUrl}/#person` },
    image: `${url}/opengraph-image`,
    keywords: post.tags.map((t) => tr(t.name, locale)).join(", "),
  };
}

export function projectJsonLd(s: SiteSettings, p: Project, locale: Locale, url: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: tr(p.title, locale),
    description: tr(p.summary, locale),
    url,
    inLanguage: locale,
    dateCreated: String(p.year),
    creator: { "@id": `${s.siteUrl}/#person` },
    keywords: p.stack.join(", "),
  };
}

export function servicesJsonLd(s: SiteSettings, services: Service[], locale: Locale, url: string): Json[] {
  return services.map((svc) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: tr(svc.title, locale),
    description: tr(svc.description, locale),
    url: `${url}#${svc.slug}`,
    provider: { "@id": `${s.siteUrl}/#person` },
    areaServed: tr(s.location, locale),
  }));
}
