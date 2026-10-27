import type { Metadata } from "next";
import { CrudEditPage } from "@/components/admin/crud";
import { taxonomyGroups } from "@/lib/admin/entities";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Catégorie ou tag" };

export default async function TaxonomyEdit({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string }> }) {
  const { id } = await params;
  const { type } = await searchParams;
  let entity: "categories" | "tags" = type === "tags" ? "tags" : "categories";
  if (id !== "new") {
    const { supabase } = await requireAdmin();
    const { data } = await supabase.from("tags").select("id").eq("id", id).maybeSingle();
    entity = data ? "tags" : "categories";
  }
  const label = entity === "tags" ? "tag" : "catégorie";
  return (
    <CrudEditPage
      entity={entity}
      table={entity === "tags" ? "tags" : "post_categories"}
      id={id}
      groups={taxonomyGroups}
      title={(r) => (r ? `${label[0]!.toUpperCase()}${label.slice(1)} : ${r.name.fr}` : `Nouvelle ${label === "tag" ? "étiquette (tag)" : "catégorie"}`)}
      back={{ href: "/admin/taxonomy", label: "Catégories & tags" }}
    />
  );
}
