/**
 * Modèle de contenu partagé par le site public, l'admin, le contenu d'exemple
 * et le générateur de seed. Les champs traduits sont des objets { fr, en }.
 */

export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** Valeur traduite dans chaque langue du site. */
export type I18n<T = string> = Record<Locale, T>;

/** Texte identique dans toutes les langues (terme technique) ou traduit. */
export type LocalizedText = string | I18n;

export type PublishStatus = "draft" | "published";
export type PostStatus = "draft" | "scheduled" | "published";

export const SKILL_CATEGORIES = ["network", "systems", "fullstack", "design"] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

/** Niveaux qualitatifs (pas de pourcentage). */
export const SKILL_LEVELS = ["learning", "proficient", "advanced"] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const PROJECT_CATEGORIES = ["network", "systems", "development", "design"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export type SocialKey = "github" | "linkedin" | "x" | "behance" | "dribbble" | "facebook" | "instagram";

export interface FeatureFlags {
  blog: boolean;
  comments: boolean;
  newsletter: boolean;
  quotes: boolean;
  analytics: boolean;
}

export interface SiteSettings {
  ownerName: string;
  initials: string;
  brandName: string;
  siteUrl: string;
  contactEmail: string;
  phone: string;
  whatsapp: string;
  location: I18n;
  role: I18n;
  tagline: I18n;
  heroIntro: I18n;
  about: I18n;
  availability: I18n;
  seoTitle: I18n;
  seoDescription: I18n;
  ogImageUrl: string | null;
  avatarUrl: string | null;
  accentColor: string;
  defaultTheme: "system" | "light" | "dark";
  socials: Partial<Record<SocialKey, string>>;
  features: FeatureFlags;
  cvUrl: Partial<Record<Locale, string>>;
  isExample: boolean;
}

export interface KeyFigure {
  id: string;
  value: string;
  label: I18n;
  sortOrder: number;
  isExample: boolean;
}

export interface ProcessStep {
  title: I18n;
  text: I18n;
}

export interface Service {
  id: string;
  slug: string;
  icon: string;
  title: I18n;
  summary: I18n;
  description: I18n;
  benefits: I18n<string[]>;
  deliverables: I18n<string[]>;
  process: ProcessStep[];
  sortOrder: number;
  published: boolean;
  isExample: boolean;
}

export interface Skill {
  id: string;
  name: I18n;
  category: SkillCategory;
  level: SkillLevel;
  icon: string;
  featured: boolean;
  sortOrder: number;
  isExample: boolean;
}

export interface TimelineEntry {
  id: string;
  kind: "education" | "experience";
  title: I18n;
  organization: string;
  location: string;
  startDate: string; // AAAA-MM
  endDate: string | null;
  description: I18n;
  sortOrder: number;
  isExample: boolean;
}

/* ---------- Schémas de topologie (rendus en SVG, thémables) ---------- */

export const DIAGRAM_NODE_KINDS = [
  "router",
  "firewall",
  "switch",
  "server",
  "client",
  "cloud",
  "database",
  "app",
  "monitor",
  "vpn",
] as const;
export type DiagramNodeKind = (typeof DIAGRAM_NODE_KINDS)[number];

export interface DiagramNode {
  id: string;
  label: LocalizedText;
  sub?: LocalizedText;
  kind: DiagramNodeKind;
  x: number;
  y: number;
}

export interface DiagramLink {
  from: string;
  to: string;
  label?: LocalizedText;
  style?: "solid" | "dashed" | "tunnel";
}

export interface DiagramZone {
  label: LocalizedText;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Diagram {
  id: string;
  title: I18n;
  caption?: I18n;
  width: number;
  height: number;
  zones?: DiagramZone[];
  nodes: DiagramNode[];
  links: DiagramLink[];
}

export interface ProjectImage {
  id: string;
  url: string;
  alt: I18n;
  caption: I18n | null;
  kind: "gallery" | "diagram";
  width: number | null;
  height: number | null;
  sortOrder: number;
}

export interface Project {
  id: string;
  slug: string;
  category: ProjectCategory;
  title: I18n;
  summary: I18n;
  context: I18n;
  problem: I18n;
  solution: I18n;
  results: I18n;
  learnings: I18n;
  role: I18n;
  year: number;
  duration: I18n;
  stack: string[];
  coverUrl: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
  status: PublishStatus;
  sortOrder: number;
  diagrams: Diagram[];
  images: ProjectImage[];
  seoDescription: I18n | null;
  isExample: boolean;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: I18n;
}

export type Tag = Category;

export interface Post {
  id: string;
  slug: string;
  title: I18n;
  excerpt: I18n;
  content: I18n;
  coverUrl: string | null;
  category: Category | null;
  tags: Tag[];
  status: PostStatus;
  publishedAt: string | null;
  seoTitle: I18n | null;
  seoDescription: I18n | null;
  isExample: boolean;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface LegalPage {
  slug: "legal-notice" | "privacy";
  title: I18n;
  content: I18n;
  updatedAt: string;
  isExample: boolean;
}
