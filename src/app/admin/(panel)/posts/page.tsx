import type { Metadata } from "next";
import Link from "next/link";
import { btnPrimary, btnSecondary, CrudTable, ToggleForm } from "@/components/admin/crud";
import { AdminHeader, fmtDateTime, StatusPill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Articles" };

export default async function PostsAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("posts")
    .select("id, title, slug, status, published_at, is_example, category:post_categories(name), comments(count)")
    .order("published_at", { ascending: false, nullsFirst: true });

  return (
    <>
      <AdminHeader
        title="Articles"
        description="Brouillons, articles planifiés et publiés. Un article planifié apparaît automatiquement à sa date."
        actions={
          <>
            <Link href="/admin/taxonomy" className={btnSecondary}>
              Catégories & tags
            </Link>
            <Link href="/admin/posts/new" className={btnPrimary}>
              + Nouvel article
            </Link>
          </>
        }
      />
      <CrudTable
        rows={data ?? []}
        basePath="/admin/posts"
        empty="Aucun article pour le moment."
        columns={[
          { label: "Titre", render: (r) => r.title.fr },
          { label: "Catégorie", render: (r) => r.category?.name?.fr ?? "—" },
          {
            label: "Statut",
            render: (r) => (
              <ToggleForm entity="posts" id={r.id} field="status" value={r.status === "draft" ? "published" : "draft"} label={r.status === "draft" ? "Publier maintenant" : "Repasser en brouillon"}>
                <StatusPill status={r.status === "scheduled" && r.published_at && new Date(r.published_at) <= new Date() ? "published" : r.status} />
              </ToggleForm>
            ),
          },
          { label: "Publication", render: (r) => <span className="font-mono text-xs">{fmtDateTime(r.published_at)}</span> },
          { label: "Commentaires", render: (r) => <span className="font-mono text-xs">{r.comments?.[0]?.count ?? 0}</span> },
        ]}
      />
    </>
  );
}
