import type { Metadata } from "next";
import Link from "next/link";
import { CrudEditPage } from "@/components/admin/crud";
import { postGroups } from "@/lib/admin/entities";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Article" };

export default async function PostEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from("post_categories").select("id, name").order("slug"),
    supabase.from("tags").select("id, name, slug").order("slug"),
  ]);
  const groups = postGroups([
    { value: "", label: "— Aucune —" },
    ...(categories ?? []).map((c) => ({ value: c.id as string, label: (c.name as { fr: string }).fr })),
  ]);

  return (
    <CrudEditPage
      entity="posts"
      table="posts"
      id={id}
      select="*, post_tags(tag_id)"
      groups={groups}
      title={(r) => (r ? r.title.fr : "Nouvel article")}
      back={{ href: "/admin/posts", label: "Articles" }}
      extra={(r) => {
        const selected = new Set<string>((r?.post_tags ?? []).map((t: { tag_id: string }) => t.tag_id));
        return (
          <section className="rounded-lg border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-lg tracking-tight">Tags</h2>
              <Link href="/admin/taxonomy" className="text-sm text-accent-ink hover:underline">
                Gérer les tags
              </Link>
            </div>
            <fieldset className="flex flex-wrap gap-2 p-5">
              <legend className="sr-only">Tags de l&apos;article</legend>
              {(tags ?? []).length === 0 && <p className="text-sm text-muted">Aucun tag. Créez-en dans « Catégories & tags ».</p>}
              {(tags ?? []).map((t) => (
                <label key={t.id} className="cursor-pointer">
                  <input type="checkbox" name="tags" value={t.id} defaultChecked={selected.has(t.id)} className="peer sr-only" />
                  <span className="inline-flex h-8 items-center rounded-full border border-line px-3 font-mono text-xs text-muted transition-colors peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent-ink peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                    #{(t.name as { fr: string }).fr}
                  </span>
                </label>
              ))}
            </fieldset>
          </section>
        );
      }}
    />
  );
}
