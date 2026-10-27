import type { Metadata } from "next";
import Link from "next/link";
import { btnPrimary, CrudTable } from "@/components/admin/crud";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Chiffres clés" };

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("key_figures").select("id, value, label, sort_order, is_example").order("sort_order");

  return (
    <>
      <AdminHeader
        title="Chiffres clés"
        description="Affichés sous la présentation de l'accueil. Uniquement des faits vérifiables."
        actions={
          <Link href="/admin/figures/new" className={btnPrimary}>
            + Nouveau chiffre
          </Link>
        }
      />
      <CrudTable
        rows={data ?? []}
        basePath="/admin/figures"
        empty="Rien pour le moment."
        columns={[
          { label: "Valeur", render: (r) => <span className="font-display text-lg">{r.value}</span> },
          { label: "Libellé", render: (r) => r.label.fr },
          { label: "Ordre", render: (r) => <span className="font-mono text-xs">{r.sort_order}</span> },
        ]}
      />
    </>
  );
}
