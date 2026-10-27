import type { Metadata } from "next";
import { CrudEditPage } from "@/components/admin/crud";
import { skillGroups } from "@/lib/admin/entities";

export const metadata: Metadata = { title: "Compétences" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CrudEditPage
      entity="skills"
      table="skills"
      id={id}
      groups={skillGroups}
      title={(r) => (r ? r.name.fr : "Nouvelle compétence")}
      back={{ href: "/admin/skills", label: "Compétences" }}
    />
  );
}
