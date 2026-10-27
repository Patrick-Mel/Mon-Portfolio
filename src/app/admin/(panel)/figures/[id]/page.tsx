import type { Metadata } from "next";
import { CrudEditPage } from "@/components/admin/crud";
import { figureGroups } from "@/lib/admin/entities";

export const metadata: Metadata = { title: "Chiffres clés" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CrudEditPage
      entity="figures"
      table="key_figures"
      id={id}
      groups={figureGroups}
      title={(r) => (r ? `${r.value} — ${r.label.fr}` : "Nouveau chiffre clé")}
      back={{ href: "/admin/figures", label: "Chiffres clés" }}
    />
  );
}
