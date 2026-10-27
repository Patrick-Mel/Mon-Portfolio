import type { Metadata } from "next";
import { CrudEditPage } from "@/components/admin/crud";
import { serviceGroups } from "@/lib/admin/entities";

export const metadata: Metadata = { title: "Services" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CrudEditPage
      entity="services"
      table="services"
      id={id}
      groups={serviceGroups}
      title={(r) => (r ? r.title.fr : "Nouveau service")}
      back={{ href: "/admin/services", label: "Services" }}
    />
  );
}
