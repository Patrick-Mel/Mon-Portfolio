import type { Metadata } from "next";
import Link from "next/link";
import { btnPrimary, CrudTable, ToggleForm } from "@/components/admin/crud";
import { AdminHeader, Pill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Compétences" };

const CATEGORY: Record<string, string> = { network: "Réseaux", systems: "Systèmes & sécurité", fullstack: "Full-stack", design: "Design" };
const LEVEL: Record<string, string> = { learning: "En progression", proficient: "Opérationnel", advanced: "Avancé" };

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("skills").select("id, name, category, level, featured, sort_order, is_example").order("category").order("sort_order");

  return (
    <>
      <AdminHeader
        title="Compétences"
        description="Regroupées par domaine. Les compétences « clés » apparaissent sur l'accueil."
        actions={
          <Link href="/admin/skills/new" className={btnPrimary}>
            + Nouvelle compétence
          </Link>
        }
      />
      <CrudTable
        rows={data ?? []}
        basePath="/admin/skills"
        empty="Rien pour le moment."
        columns={[
          { label: "Nom", render: (r) => r.name.fr },
          { label: "Domaine", render: (r) => CATEGORY[r.category] ?? r.category },
          { label: "Niveau", render: (r) => LEVEL[r.level] ?? r.level },
          {
            label: "Clé",
            render: (r) => (
              <ToggleForm entity="skills" id={r.id} field="featured" value={String(!r.featured)} label={r.featured ? "Retirer des compétences clés" : "Marquer comme clé"}>
                <Pill tone={r.featured ? "accent" : "neutral"}>{r.featured ? "★ Clé" : "☆"}</Pill>
              </ToggleForm>
            ),
          },
          { label: "Ordre", render: (r) => <span className="font-mono text-xs">{r.sort_order}</span> },
        ]}
      />
    </>
  );
}
