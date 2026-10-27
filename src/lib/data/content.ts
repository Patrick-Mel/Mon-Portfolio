import "server-only";
import { cache } from "react";
import { legalPages as localLegal } from "@/content/legal";
import { categories as localCategories, posts as localPosts, tags as localTags } from "@/content/posts";
import { keyFigures as localFigures, skills as localSkills, timeline as localTimeline } from "@/content/profile";
import { projects as localProjects } from "@/content/projects";
import { services as localServices } from "@/content/services";
import { getPublicClient } from "@/lib/supabase/public";
import type {
  Category,
  Comment,
  KeyFigure,
  LegalPage,
  Post,
  Project,
  Service,
  SiteSettings,
  Skill,
  Tag,
  TimelineEntry,
} from "@/lib/types";
import { siteConfig } from "@/site.config";
import {
  mapCategory,
  mapKeyFigure,
  mapLegal,
  mapPost,
  mapProject,
  mapService,
  mapSettings,
  mapSkill,
  mapTimeline,
  type Row,
} from "./mappers";

/**
 * Accès en lecture au contenu public.
 * - Supabase configuré : lecture via le rôle anon (RLS : contenu publié seulement).
 *   Une erreur est levée plutôt que de servir du contenu d'exemple : en ISR,
 *   Next.js continue alors de servir la dernière version valide de la page.
 * - Supabase absent : contenu d'exemple local (`src/content`), pour démarrer sans configuration.
 */

class ContentError extends Error {
  constructor(what: string, cause: unknown) {
    super(`[content] Lecture impossible de « ${what} » : ${(cause as { message?: string })?.message ?? cause}`);
  }
}

async function query<T>(what: string, run: (db: NonNullable<ReturnType<typeof getPublicClient>>) => PromiseLike<{ data: Row[] | null; error: unknown }>, map: (r: Row) => T): Promise<T[] | null> {
  const db = getPublicClient();
  if (!db) return null;
  const { data, error } = await run(db);
  if (error) throw new ContentError(what, error);
  return (data ?? []).map(map);
}

const isLive = (p: Pick<Post, "status" | "publishedAt">) =>
  p.status !== "draft" && !!p.publishedAt && new Date(p.publishedAt) <= new Date();

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const db = getPublicClient();
  if (!db) return siteConfig;
  const { data, error } = await db.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new ContentError("site_settings", error);
  return data ? mapSettings(data) : siteConfig;
});

export const getKeyFigures = cache(async (): Promise<KeyFigure[]> => {
  const rows = await query("key_figures", (db) => db.from("key_figures").select("*").order("sort_order"), mapKeyFigure);
  return rows ?? localFigures;
});

export const getServices = cache(async (): Promise<Service[]> => {
  const rows = await query(
    "services",
    (db) => db.from("services").select("*").eq("published", true).order("sort_order"),
    mapService,
  );
  return rows ?? localServices.filter((s) => s.published);
});

export const getSkills = cache(async (): Promise<Skill[]> => {
  const rows = await query("skills", (db) => db.from("skills").select("*").order("sort_order"), mapSkill);
  return rows ?? localSkills;
});

export const getTimeline = cache(async (): Promise<TimelineEntry[]> => {
  const rows = await query(
    "timeline_entries",
    (db) => db.from("timeline_entries").select("*").order("sort_order"),
    mapTimeline,
  );
  return rows ?? localTimeline;
});

export const getProjects = cache(async (): Promise<Project[]> => {
  const rows = await query(
    "projects",
    (db) => db.from("projects").select("*, project_images(*)").eq("status", "published").order("sort_order"),
    mapProject,
  );
  return rows ?? localProjects.filter((p) => p.status === "published");
});

export const getProject = cache(async (slug: string): Promise<Project | null> => {
  const all = await getProjects();
  return all.find((p) => p.slug === slug) ?? null;
});

export const getPosts = cache(async (): Promise<Post[]> => {
  const rows = await query(
    "posts",
    (db) =>
      db
        .from("posts")
        .select("*, category:post_categories(*), post_tags(tag:tags(*))")
        .in("status", ["published", "scheduled"])
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false }),
    mapPost,
  );
  const list = rows ?? localPosts;
  return list.filter(isLive).sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
});

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const all = await getPosts();
  return all.find((p) => p.slug === slug) ?? null;
});

export const getCategories = cache(async (): Promise<Category[]> => {
  const rows = await query("post_categories", (db) => db.from("post_categories").select("*").order("slug"), mapCategory);
  return rows ?? localCategories;
});

export const getTags = cache(async (): Promise<Tag[]> => {
  const rows = await query("tags", (db) => db.from("tags").select("*").order("slug"), mapCategory);
  return rows ?? localTags;
});

export const getApprovedComments = cache(async (postId: string): Promise<Comment[]> => {
  const rows = await query(
    "comments",
    (db) =>
      db
        .from("comments")
        .select("id, post_id, author_name, content, created_at")
        .eq("post_id", postId)
        .eq("status", "approved")
        .order("created_at"),
    (r): Comment => ({
      id: r.id,
      postId: r.post_id,
      authorName: r.author_name,
      content: r.content,
      createdAt: r.created_at,
    }),
  );
  return rows ?? [];
});

export const getLegalPage = cache(async (slug: LegalPage["slug"]): Promise<LegalPage | null> => {
  const rows = await query(
    "legal_pages",
    (db) => db.from("legal_pages").select("*").eq("slug", slug),
    mapLegal,
  );
  if (rows) return rows[0] ?? null;
  return localLegal.find((l) => l.slug === slug) ?? null;
});
