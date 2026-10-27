import type { Metadata } from "next";
import Link from "next/link";
import { btnPrimary, CrudTable } from "@/components/admin/crud";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Parcours" };

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("timeline_entries").select("id, title, kind, organization, start_date, end_date, sort_order, is_example").order("sort_order");

  return (
    <>
      <AdminHeader
        title="Parcours"
        description="Formation et expériences affichées sur /parcours (et dans le résumé de l'accueil)."
        actions={
          <Link href="/admin/timeline/new" className={btnPrimary}>
            + Nouvelle étape
          </Link>
        }
      />
      <CrudTable
        rows={data ?? []}
        basePath="/admin/timeline"
        empty="Rien pour le moment."
        columns={[
          { label: "Intitulé", render: (r) => r.title.fr },
          { label: "Type", render: (r) => (r.kind === "education" ? "Formation" : "Expérience") },
          { label: "Organisation", render: (r) => r.organization },
          { label: "Période", render: (r) => <span className="font-mono text-xs">{r.start_date} → {r.end_date ?? "en cours"}</span> },
        ]}
      />
    </>
  );
}
