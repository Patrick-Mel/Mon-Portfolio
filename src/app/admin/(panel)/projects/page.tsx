import type { Metadata } from "next";
import Link from "next/link";
import { btnPrimary, CrudTable, ToggleForm } from "@/components/admin/crud";
import { AdminHeader, Pill, StatusPill } from "@/components/admin/ui";
import { PROJECT_CATEGORY_OPTIONS } from "@/lib/admin/entities";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Projets" };

export default async function ProjectsAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("projects").select("id, title, slug, category, status, featured, year, sort_order, is_example").order("sort_order");
  const cat = (v: string) => PROJECT_CATEGORY_OPTIONS.find((o) => o.value === v)?.label ?? v;

  return (
    <>
      <AdminHeader
        title="Projets"
        description="Études de cas affichées sur /projets. L'ordre d'affichage et la mise en avant pilotent l'accueil."
        actions={
          <Link href="/admin/projects/new" className={btnPrimary}>
            + Nouveau projet
          </Link>
        }
      />
      <CrudTable
        rows={data ?? []}
        basePath="/admin/projects"
        empty="Aucun projet. Créez le premier !"
        columns={[
          { label: "Titre", render: (r) => r.title.fr },
          { label: "Domaine", render: (r) => cat(r.category) },
          { label: "Année", render: (r) => r.year },
          {
            label: "Statut",
            render: (r) => (
              <ToggleForm entity="projects" id={r.id} field="status" value={r.status === "published" ? "draft" : "published"} label={r.status === "published" ? "Repasser en brouillon" : "Publier"}>
                <StatusPill status={r.status} />
              </ToggleForm>
            ),
          },
          {
            label: "Accueil",
            render: (r) => (
              <ToggleForm entity="projects" id={r.id} field="featured" value={String(!r.featured)} label={r.featured ? "Retirer de l'accueil" : "Mettre en avant"}>
                <Pill tone={r.featured ? "accent" : "neutral"}>{r.featured ? "★ En avant" : "☆"}</Pill>
              </ToggleForm>
            ),
          },
          { label: "Ordre", render: (r) => <span className="font-mono text-xs">{r.sort_order}</span> },
        ]}
      />
    </>
  );
}
