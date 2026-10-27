import type { Metadata } from "next";
import Link from "next/link";
import { deleteEntity } from "@/app/admin/_actions/content";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { btnSecondary } from "@/components/admin/crud";
import { AdminHeader, EmptyRow, Panel, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Catégories & tags" };

export default async function TaxonomyAdmin() {
  const { supabase } = await requireAdmin();
  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from("post_categories").select("id, slug, name, posts(count)").order("slug"),
    supabase.from("tags").select("id, slug, name, post_tags(count)").order("slug"),
  ]);
  const sections = [
    { entity: "categories", title: "Catégories", rows: categories ?? [], count: (r: { posts?: { count: number }[] }) => r.posts?.[0]?.count ?? 0 },
    { entity: "tags", title: "Tags", rows: tags ?? [], count: (r: { post_tags?: { count: number }[] }) => r.post_tags?.[0]?.count ?? 0 },
  ];

  return (
    <>
      <AdminHeader title="Catégories & tags" description="Taxonomie du blog. Les pages /blog/categorie/… et /blog/tag/… sont générées automatiquement." />
      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((s) => (
          <Panel
            key={s.entity}
            title={s.title}
            actions={
              <Link href={`/admin/taxonomy/new?type=${s.entity}`} className={btnSecondary}>
                + Ajouter
              </Link>
            }
          >
            <Table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Slug</th>
                  <th>Articles</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {s.rows.length === 0 && <EmptyRow colSpan={4}>Aucun élément.</EmptyRow>}
                {s.rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/admin/taxonomy/${r.id}`} className="font-medium hover:text-accent-ink hover:underline">
                        {(r.name as { fr: string }).fr}
                      </Link>
                    </td>
                    <td className="font-mono text-xs">{r.slug}</td>
                    <td className="font-mono text-xs">{s.count(r as never)}</td>
                    <td className="text-right">
                      <form action={deleteEntity}>
                        <input type="hidden" name="_entity" value={s.entity} />
                        <input type="hidden" name="_id" value={r.id} />
                        <ConfirmButton className="text-xs text-danger hover:underline">Supprimer</ConfirmButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Panel>
        ))}
      </div>
    </>
  );
}
