import type { Metadata } from "next";
import Link from "next/link";
import { btnPrimary, CrudTable, ToggleForm } from "@/components/admin/crud";
import { AdminHeader, StatusPill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Services" };

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("services").select("id, title, slug, published, sort_order, is_example").order("sort_order");

  return (
    <>
      <AdminHeader
        title="Services"
        description="Offres affichées sur /services et proposées dans le formulaire de devis."
        actions={
          <Link href="/admin/services/new" className={btnPrimary}>
            + Nouveau service
          </Link>
        }
      />
      <CrudTable
        rows={data ?? []}
        basePath="/admin/services"
        empty="Rien pour le moment."
        columns={[
          { label: "Titre", render: (r) => r.title.fr },
          { label: "Slug", render: (r) => <span className="font-mono text-xs">{r.slug}</span> },
          {
            label: "Statut",
            render: (r) => (
              <ToggleForm entity="services" id={r.id} field="published" value={String(!r.published)} label={r.published ? "Masquer" : "Publier"}>
                <StatusPill status={r.published ? "published" : "draft"} />
              </ToggleForm>
            ),
          },
          { label: "Ordre", render: (r) => <span className="font-mono text-xs">{r.sort_order}</span> },
        ]}
      />
    </>
  );
}
