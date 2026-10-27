/**
 * Conversion lignes PostgreSQL (snake_case) ⇄ modèle applicatif (camelCase).
 * Les lignes Supabase ne sont pas typées par génération : chaque mapper fixe le contrat.
 */
import { siteConfig } from "@/site.config";
import type {
  Category,
  Diagram,
  I18n,
  KeyFigure,
  LegalPage,
  Post,
  Project,
  ProjectImage,
  Service,
  SiteSettings,
  Skill,
  TimelineEntry,
} from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any -- lignes brutes de la base */
export type Row = Record<string, any>;

const i18n = (v: unknown): I18n => {
  const o = (v ?? {}) as Partial<I18n>;
  return { fr: o.fr ?? "", en: o.en ?? "" };
};
const i18nOrNull = (v: unknown): I18n | null => (v ? i18n(v) : null);

export function mapSettings(r: Row): SiteSettings {
  return {
    ownerName: r.owner_name,
    initials: r.initials,
    brandName: r.brand_name,
    // Une URL locale en base (seed) ne doit jamais remplacer le domaine de production.
    siteUrl: (r.site_url && !/localhost|127\.0\.0\.1/.test(r.site_url) ? String(r.site_url) : siteConfig.siteUrl).replace(/\/$/, ""),
    contactEmail: r.contact_email,
    phone: r.phone ?? "",
    whatsapp: r.whatsapp ?? "",
    location: i18n(r.location),
    role: i18n(r.role),
    tagline: i18n(r.tagline),
    heroIntro: i18n(r.hero_intro),
    about: i18n(r.about),
    availability: i18n(r.availability),
    seoTitle: i18n(r.seo_title),
    seoDescription: i18n(r.seo_description),
    ogImageUrl: r.og_image_url ?? null,
    avatarUrl: r.avatar_url ?? null,
    accentColor: r.accent_color ?? siteConfig.accentColor,
    defaultTheme: r.default_theme ?? "system",
    socials: r.socials ?? {},
    features: { ...siteConfig.features, ...(r.features ?? {}) },
    cvUrl: r.cv_url ?? {},
    isExample: Boolean(r.is_example),
  };
}

export function settingsToRow(s: SiteSettings): Row {
  return {
    id: 1,
    owner_name: s.ownerName,
    initials: s.initials,
    brand_name: s.brandName,
    site_url: s.siteUrl,
    contact_email: s.contactEmail,
    phone: s.phone,
    whatsapp: s.whatsapp,
    location: s.location,
    role: s.role,
    tagline: s.tagline,
    hero_intro: s.heroIntro,
    about: s.about,
    availability: s.availability,
    seo_title: s.seoTitle,
    seo_description: s.seoDescription,
    og_image_url: s.ogImageUrl,
    avatar_url: s.avatarUrl,
    accent_color: s.accentColor,
    default_theme: s.defaultTheme,
    socials: s.socials,
    features: s.features,
    cv_url: s.cvUrl,
    is_example: s.isExample,
  };
}

export const mapKeyFigure = (r: Row): KeyFigure => ({
  id: r.id,
  value: r.value,
  label: i18n(r.label),
  sortOrder: r.sort_order ?? 0,
  isExample: Boolean(r.is_example),
});

export const mapService = (r: Row): Service => ({
  id: r.id,
  slug: r.slug,
  icon: r.icon,
  title: i18n(r.title),
  summary: i18n(r.summary),
  description: i18n(r.description),
  benefits: { fr: r.benefits?.fr ?? [], en: r.benefits?.en ?? [] },
  deliverables: { fr: r.deliverables?.fr ?? [], en: r.deliverables?.en ?? [] },
  process: (r.process ?? []).map((p: Row) => ({ title: i18n(p.title), text: i18n(p.text) })),
  sortOrder: r.sort_order ?? 0,
  published: Boolean(r.published),
  isExample: Boolean(r.is_example),
});

export const mapSkill = (r: Row): Skill => ({
  id: r.id,
  name: i18n(r.name),
  category: r.category,
  level: r.level,
  icon: r.icon,
  featured: Boolean(r.featured),
  sortOrder: r.sort_order ?? 0,
  isExample: Boolean(r.is_example),
});

export const mapTimeline = (r: Row): TimelineEntry => ({
  id: r.id,
  kind: r.kind,
  title: i18n(r.title),
  organization: r.organization,
  location: r.location ?? "",
  startDate: r.start_date,
  endDate: r.end_date ?? null,
  description: i18n(r.description),
  sortOrder: r.sort_order ?? 0,
  isExample: Boolean(r.is_example),
});

export const mapProjectImage = (r: Row): ProjectImage => ({
  id: r.id,
  url: r.url,
  alt: i18n(r.alt),
  caption: i18nOrNull(r.caption),
  kind: r.kind,
  width: r.width ?? null,
  height: r.height ?? null,
  sortOrder: r.sort_order ?? 0,
});

export const mapProject = (r: Row): Project => ({
  id: r.id,
  slug: r.slug,
  category: r.category,
  title: i18n(r.title),
  summary: i18n(r.summary),
  context: i18n(r.context),
  problem: i18n(r.problem),
  solution: i18n(r.solution),
  results: i18n(r.results),
  learnings: i18n(r.learnings),
  role: i18n(r.role),
  year: r.year,
  duration: i18n(r.duration),
  stack: r.stack ?? [],
  coverUrl: r.cover_url ?? null,
  githubUrl: r.github_url ?? null,
  demoUrl: r.demo_url ?? null,
  featured: Boolean(r.featured),
  status: r.status,
  sortOrder: r.sort_order ?? 0,
  diagrams: (r.diagrams ?? []) as Diagram[],
  images: ((r.project_images ?? []) as Row[]).map(mapProjectImage).sort((a, b) => a.sortOrder - b.sortOrder),
  seoDescription: i18nOrNull(r.seo_description),
  isExample: Boolean(r.is_example),
  updatedAt: r.updated_at,
});

export const mapCategory = (r: Row): Category => ({ id: r.id, slug: r.slug, name: i18n(r.name) });

export const mapPost = (r: Row): Post => ({
  id: r.id,
  slug: r.slug,
  title: i18n(r.title),
  excerpt: i18n(r.excerpt),
  content: i18n(r.content),
  coverUrl: r.cover_url ?? null,
  category: r.category ? mapCategory(r.category) : null,
  tags: ((r.post_tags ?? []) as Row[])
    .map((pt) => pt.tag)
    .filter(Boolean)
    .map(mapCategory),
  status: r.status,
  publishedAt: r.published_at ?? null,
  seoTitle: i18nOrNull(r.seo_title),
  seoDescription: i18nOrNull(r.seo_description),
  isExample: Boolean(r.is_example),
  updatedAt: r.updated_at,
});

export const mapLegal = (r: Row): LegalPage => ({
  slug: r.slug,
  title: i18n(r.title),
  content: i18n(r.content),
  updatedAt: r.updated_at,
  isExample: Boolean(r.is_example),
});
