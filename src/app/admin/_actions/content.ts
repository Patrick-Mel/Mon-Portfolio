"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logActivity, revalidatePublicSite } from "@/lib/admin/activity";
import { assertAdmin, type AdminContext } from "@/lib/admin/auth";
import {
  figureGroups,
  legalGroups,
  postGroups,
  projectGroups,
  serviceGroups,
  settingsGroups,
  skillGroups,
  taxonomyGroups,
  timelineGroups,
} from "@/lib/admin/entities";
import { allFields, parseFields, type FieldGroup, type Values } from "@/lib/admin/fields";
import { renderMarkdown } from "@/lib/markdown";
import { DIAGRAM_NODE_KINDS } from "@/lib/types";

export type FormState = { ok: boolean; message?: string; errors?: Record<string, string> } | null;

interface EntityConfig {
  table: string;
  label: string;
  /** Chemin de la liste dans l'admin. */
  path: string;
  /** Clé primaire (défaut : id). */
  key?: string;
  groups: (ctx: AdminContext) => Promise<FieldGroup[]>;
  /** Contrôles et transformations spécifiques avant écriture. */
  prepare?: (values: Values, fd: FormData) => { errors?: Partial<Record<string, string>> } | void;
  /** Écritures annexes après sauvegarde (relations). */
  after?: (ctx: AdminContext, id: string, fd: FormData) => Promise<void>;
}

const i18nText = z.union([z.string().max(200), z.object({ fr: z.string().max(200), en: z.string().max(200) })]);
const diagramSchema = z.array(
  z.object({
    id: z.string().min(1).max(60),
    title: z.object({ fr: z.string(), en: z.string() }),
    caption: z.object({ fr: z.string(), en: z.string() }).optional(),
    width: z.number().positive().max(4000),
    height: z.number().positive().max(4000),
    zones: z.array(z.object({ label: i18nText, x: z.number(), y: z.number(), w: z.number(), h: z.number() })).optional(),
    nodes: z.array(
      z.object({ id: z.string().min(1), label: i18nText, sub: i18nText.optional(), kind: z.enum(DIAGRAM_NODE_KINDS), x: z.number(), y: z.number() }),
    ),
    links: z.array(z.object({ from: z.string(), to: z.string(), label: i18nText.optional(), style: z.enum(["solid", "dashed", "tunnel"]).optional() })),
  }),
);
const stepsSchema = z.array(
  z.object({ title: z.object({ fr: z.string().max(80), en: z.string().max(80) }), text: z.object({ fr: z.string().max(300), en: z.string().max(300) }) }),
);

async function categoryOptions(ctx: AdminContext) {
  const { data } = await ctx.supabase.from("post_categories").select("id, name").order("slug");
  return [{ value: "", label: "— Aucune —" }, ...(data ?? []).map((c) => ({ value: c.id as string, label: (c.name as { fr: string }).fr }))];
}

const ENTITIES: Record<string, EntityConfig> = {
  projects: {
    table: "projects",
    label: "Projet",
    path: "/admin/projects",
    groups: async () => projectGroups,
    prepare: (v) => {
      const parsed = diagramSchema.safeParse(v.diagrams);
      if (!parsed.success) return { errors: { diagrams: `Schéma invalide : ${parsed.error.issues[0]?.path.join(".")} — ${parsed.error.issues[0]?.message}` } };
      if (v.github_url && !String(v.github_url).startsWith("https://")) return { errors: { github_url: "Le lien doit commencer par https://" } };
      if (v.demo_url && !String(v.demo_url).startsWith("https://")) return { errors: { demo_url: "Le lien doit commencer par https://" } };
      if (v.status === "published") v.published_at ??= new Date().toISOString();
    },
  },
  posts: {
    table: "posts",
    label: "Article",
    path: "/admin/posts",
    groups: async (ctx) => postGroups(await categoryOptions(ctx)),
    prepare: (v) => {
      v.category_id = v.category_id || null;
      if (v.status === "published" && !v.published_at) v.published_at = new Date().toISOString();
      if (v.status === "scheduled" && !v.published_at) return { errors: { published_at: "Indiquez la date de publication planifiée." } };
    },
    after: async (ctx, id, fd) => {
      const tagIds = fd.getAll("tags").filter((t): t is string => typeof t === "string" && /^[0-9a-f-]{36}$/.test(t));
      await ctx.supabase.from("post_tags").delete().eq("post_id", id);
      if (tagIds.length) await ctx.supabase.from("post_tags").insert(tagIds.map((tag_id) => ({ post_id: id, tag_id })));
    },
  },
  services: {
    table: "services",
    label: "Service",
    path: "/admin/services",
    groups: async () => serviceGroups,
    prepare: (v) => {
      const parsed = stepsSchema.safeParse(v.process);
      if (!parsed.success) return { errors: { process: "Étapes invalides (titre 80 car., texte 300 car. maximum)." } };
    },
  },
  skills: { table: "skills", label: "Compétence", path: "/admin/skills", groups: async () => skillGroups },
  timeline: { table: "timeline_entries", label: "Étape de parcours", path: "/admin/timeline", groups: async () => timelineGroups },
  figures: { table: "key_figures", label: "Chiffre clé", path: "/admin/figures", groups: async () => figureGroups },
  categories: { table: "post_categories", label: "Catégorie", path: "/admin/taxonomy", groups: async () => taxonomyGroups },
  tags: { table: "tags", label: "Tag", path: "/admin/taxonomy", groups: async () => taxonomyGroups },
  legal: { table: "legal_pages", label: "Page légale", path: "/admin/legal", key: "slug", groups: async () => legalGroups },
  settings: { table: "site_settings", label: "Paramètres", path: "/admin/settings", groups: async () => settingsGroups },
};

function entityOf(fd: FormData): [string, EntityConfig] {
  const name = String(fd.get("_entity") ?? "");
  const cfg = ENTITIES[name];
  if (!cfg) throw new Error("Entité inconnue");
  return [name, cfg];
}

/** Création ou mise à jour d'un élément (formulaire générique). */
export async function saveEntity(_prev: FormState, fd: FormData): Promise<FormState> {
  const ctx = await assertAdmin();
  const [name, cfg] = entityOf(fd);
  const id = String(fd.get("_id") ?? "");
  const key = cfg.key ?? "id";

  const parsed = parseFields(allFields(await cfg.groups(ctx)), fd);
  if (!parsed.ok) return { ok: false, message: "Certains champs sont à corriger.", errors: parsed.errors };
  const values = parsed.values;
  const extra = cfg.prepare?.(values, fd);
  if (extra?.errors) return { ok: false, message: "Certains champs sont à corriger.", errors: extra.errors as Record<string, string> };

  let savedId = id;
  if (name === "settings") {
    const { error } = await ctx.supabase.from(cfg.table).upsert({ id: 1, ...values });
    if (error) return { ok: false, message: error.message };
  } else if (id) {
    const { error } = await ctx.supabase.from(cfg.table).update(values).eq(key, id);
    if (error) return dbError(error);
  } else {
    const { data, error } = await ctx.supabase.from(cfg.table).insert(values).select(key).single();
    if (error) return dbError(error);
    savedId = String((data as unknown as Record<string, unknown>)[key]);
  }

  await cfg.after?.(ctx, savedId, fd);
  await logActivity(ctx, id ? "update" : "create", cfg.table, savedId, { title: values.title?.fr ?? values.name?.fr ?? values.value });
  revalidatePublicSite();
  revalidatePath("/admin", "layout");

  if (!id && name !== "settings") redirect(`${cfg.path}/${savedId}?created=1`);
  return { ok: true, message: `${cfg.label} enregistré.` };
}

function dbError(error: { code?: string; message: string }): FormState {
  if (error.code === "23505") return { ok: false, message: "Ce slug est déjà utilisé.", errors: { slug: "Déjà utilisé par un autre élément." } };
  if (error.code === "23514") return { ok: false, message: `Contrainte non respectée : ${error.message}` };
  return { ok: false, message: error.message };
}

export async function deleteEntity(fd: FormData): Promise<void> {
  const ctx = await assertAdmin();
  const [, cfg] = entityOf(fd);
  const id = String(fd.get("_id") ?? "");
  if (!id || cfg.table === "site_settings" || cfg.table === "legal_pages") return;
  const { error } = await ctx.supabase.from(cfg.table).delete().eq(cfg.key ?? "id", id);
  if (error) throw new Error(error.message);
  await logActivity(ctx, "delete", cfg.table, id);
  revalidatePublicSite();
  revalidatePath("/admin", "layout");
  if (fd.get("_redirect")) redirect(cfg.path);
}

/** Bascule rapide publié/brouillon ou mise en avant depuis une liste. */
export async function toggleField(fd: FormData): Promise<void> {
  const ctx = await assertAdmin();
  const [, cfg] = entityOf(fd);
  const id = String(fd.get("_id") ?? "");
  const field = String(fd.get("_field") ?? "");
  const value = String(fd.get("_value") ?? "");
  const allowed: Record<string, string[]> = {
    projects: ["status", "featured"],
    posts: ["status"],
    services: ["published"],
    skills: ["featured"],
  };
  if (!allowed[cfg.table]?.includes(field)) throw new Error("Champ non modifiable");
  const v = value === "true" ? true : value === "false" ? false : value;
  const patch: Record<string, unknown> = { [field]: v };
  if (cfg.table === "posts" && v === "published") patch.published_at = new Date().toISOString();
  if (cfg.table === "projects" && v === "published") patch.published_at = new Date().toISOString();
  const { error } = await ctx.supabase.from(cfg.table).update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  await logActivity(ctx, "update", cfg.table, id, { [field]: v });
  revalidatePublicSite();
  revalidatePath("/admin", "layout");
}

/** Aperçu Markdown exact (même pipeline que le site public). */
export async function previewMarkdown(markdown: string): Promise<string> {
  await assertAdmin();
  const { html } = await renderMarkdown(markdown.slice(0, 200000));
  return html;
}

/* ---------- Images de projet (galerie et schémas téléversés) ---------- */

const imageSchema = z.object({
  projectId: z.string().uuid(),
  url: z.string().min(1).max(1000),
  altFr: z.string().trim().min(1).max(200),
  altEn: z.string().trim().min(1).max(200),
  captionFr: z.string().trim().max(300).optional().default(""),
  captionEn: z.string().trim().max(300).optional().default(""),
  kind: z.enum(["gallery", "diagram"]),
  width: z.coerce.number().int().positive().optional(),
  height: z.coerce.number().int().positive().optional(),
});

export async function addProjectImage(_prev: FormState, fd: FormData): Promise<FormState> {
  const ctx = await assertAdmin();
  const parsed = imageSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: "Image, texte alternatif FR et EN requis." };
  const d = parsed.data;
  const { count } = await ctx.supabase.from("project_images").select("id", { count: "exact", head: true }).eq("project_id", d.projectId);
  const { error } = await ctx.supabase.from("project_images").insert({
    project_id: d.projectId,
    url: d.url,
    alt: { fr: d.altFr, en: d.altEn },
    caption: d.captionFr || d.captionEn ? { fr: d.captionFr, en: d.captionEn } : null,
    kind: d.kind,
    width: d.width ?? null,
    height: d.height ?? null,
    sort_order: (count ?? 0) + 1,
  });
  if (error) return { ok: false, message: error.message };
  await logActivity(ctx, "create", "project_images", d.projectId);
  revalidatePublicSite();
  revalidatePath(`/admin/projects/${d.projectId}`);
  return { ok: true, message: "Image ajoutée." };
}

export async function deleteProjectImage(fd: FormData): Promise<void> {
  const ctx = await assertAdmin();
  const id = String(fd.get("id") ?? "");
  const projectId = String(fd.get("projectId") ?? "");
  await ctx.supabase.from("project_images").delete().eq("id", id);
  await logActivity(ctx, "delete", "project_images", id);
  revalidatePublicSite();
  revalidatePath(`/admin/projects/${projectId}`);
}
