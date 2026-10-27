/**
 * Génère supabase/seed.sql à partir du contenu d'exemple de src/content
 * (source unique : le site hors-ligne et la base démarrent avec les mêmes données).
 *
 * Usage : pnpm db:seed:generate
 * Idempotent : `on conflict do nothing`, identifiants déterministes md5(id)::uuid.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { legalPages } from "../src/content/legal";
import { categories, posts, tags } from "../src/content/posts";
import { keyFigures, skills, timeline } from "../src/content/profile";
import { projects } from "../src/content/projects";
import { services } from "../src/content/services";
import { settingsToRow } from "../src/lib/data/mappers";
import { siteConfig } from "../site.config";

const q = (v: unknown): string => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return `'${v.replace(/'/g, "''")}'`;
  return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
};
const uuid = (id: string) => `md5(${q(id)})::uuid`;
const arr = (items: string[]) => (items.length ? `array[${items.map(q).join(", ")}]::text[]` : `'{}'::text[]`);

function insert(table: string, rows: Record<string, string>[], conflict = "do nothing") {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]!);
  const values = rows.map((r) => `  (${cols.map((c) => r[c]).join(", ")})`).join(",\n");
  return `insert into public.${table} (${cols.join(", ")}) values\n${values}\non conflict ${conflict};\n\n`;
}

const settings = settingsToRow({ ...siteConfig, siteUrl: "http://localhost:3000" });
let sql = `-- =============================================================================
-- SEED — CONTENU D'EXEMPLE (généré par scripts/generate-seed.ts, ne pas éditer à la main)
-- Tout est marqué is_example = true : à remplacer depuis /admin.
-- Pensez à mettre à jour site_url dans /admin → Paramètres après le déploiement.
-- =============================================================================

`;

sql += insert(
  "site_settings",
  [Object.fromEntries(Object.entries(settings).map(([k, v]) => [k, typeof v === "object" && v !== null ? q(v) : q(v)]))],
  "(id) do nothing",
);

sql += insert(
  "key_figures",
  keyFigures.map((f) => ({ id: uuid(f.id), value: q(f.value), label: q(f.label), sort_order: q(f.sortOrder), is_example: "true" })),
);

sql += insert(
  "services",
  services.map((s) => ({
    id: uuid(s.id),
    slug: q(s.slug),
    icon: q(s.icon),
    title: q(s.title),
    summary: q(s.summary),
    description: q(s.description),
    benefits: q(s.benefits),
    deliverables: q(s.deliverables),
    process: q(s.process),
    sort_order: q(s.sortOrder),
    published: q(s.published),
    is_example: "true",
  })),
);

sql += insert(
  "skills",
  skills.map((s) => ({
    id: uuid(s.id),
    name: q(s.name),
    category: q(s.category),
    level: q(s.level),
    icon: q(s.icon),
    featured: q(s.featured),
    sort_order: q(s.sortOrder),
    is_example: "true",
  })),
);

sql += insert(
  "timeline_entries",
  timeline.map((e) => ({
    id: uuid(e.id),
    kind: q(e.kind),
    title: q(e.title),
    organization: q(e.organization),
    location: q(e.location),
    start_date: q(e.startDate),
    end_date: q(e.endDate),
    description: q(e.description),
    sort_order: q(e.sortOrder),
    is_example: "true",
  })),
);

sql += insert(
  "projects",
  projects.map((p) => ({
    id: uuid(p.id),
    slug: q(p.slug),
    category: q(p.category),
    title: q(p.title),
    summary: q(p.summary),
    context: q(p.context),
    problem: q(p.problem),
    solution: q(p.solution),
    results: q(p.results),
    learnings: q(p.learnings),
    role: q(p.role),
    duration: q(p.duration),
    year: q(p.year),
    stack: arr(p.stack),
    cover_url: q(p.coverUrl),
    github_url: q(p.githubUrl),
    demo_url: q(p.demoUrl),
    featured: q(p.featured),
    status: q(p.status),
    sort_order: q(p.sortOrder),
    diagrams: q(p.diagrams),
    seo_description: q(p.seoDescription),
    published_at: q(p.updatedAt),
    is_example: "true",
  })),
);

sql += insert("post_categories", categories.map((c) => ({ id: uuid(c.id), slug: q(c.slug), name: q(c.name) })));
sql += insert("tags", tags.map((t) => ({ id: uuid(t.id), slug: q(t.slug), name: q(t.name) })));

sql += insert(
  "posts",
  posts.map((p) => ({
    id: uuid(p.id),
    slug: q(p.slug),
    title: q(p.title),
    excerpt: q(p.excerpt),
    content: q(p.content),
    cover_url: q(p.coverUrl),
    category_id: p.category ? uuid(p.category.id) : "null",
    status: q(p.status),
    published_at: q(p.publishedAt),
    seo_title: q(p.seoTitle),
    seo_description: q(p.seoDescription),
    is_example: "true",
  })),
);

sql += insert(
  "post_tags",
  posts.flatMap((p) => p.tags.map((t) => ({ post_id: uuid(p.id), tag_id: uuid(t.id) }))),
);

sql += insert(
  "legal_pages",
  legalPages.map((l) => ({ slug: q(l.slug), title: q(l.title), content: q(l.content), is_example: "true" })),
  "(slug) do nothing",
);

const out = join(process.cwd(), "supabase", "seed.sql");
writeFileSync(out, sql);
console.log(`✓ ${out} (${(sql.length / 1024).toFixed(1)} Ko)`);
