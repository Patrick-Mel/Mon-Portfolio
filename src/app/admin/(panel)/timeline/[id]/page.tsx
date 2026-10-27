import type { Metadata } from "next";
import { CrudEditPage } from "@/components/admin/crud";
import { timelineGroups } from "@/lib/admin/entities";

export const metadata: Metadata = { title: "Parcours" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CrudEditPage
      entity="timeline"
      table="timeline_entries"
      id={id}
      groups={timelineGroups}
      title={(r) => (r ? r.title.fr : "Nouvelle étape")}
      back={{ href: "/admin/timeline", label: "Parcours" }}
    />
  );
}
