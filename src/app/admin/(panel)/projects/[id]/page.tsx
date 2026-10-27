import type { Metadata } from "next";
import { CrudEditPage } from "@/components/admin/crud";
import { ProjectImages } from "@/components/admin/project-images";
import { projectGroups } from "@/lib/admin/entities";

export const metadata: Metadata = { title: "Projet" };

export default async function ProjectEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CrudEditPage
      entity="projects"
      table="projects"
      id={id}
      select="*, project_images(id, url, alt, kind, sort_order)"
      groups={projectGroups}
      title={(r) => (r ? r.title.fr : "Nouveau projet")}
      back={{ href: "/admin/projects", label: "Projets" }}
      aside={(r) => (
        <ProjectImages projectId={r.id} images={[...(r.project_images ?? [])].sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)} />
      )}
    />
  );
}
