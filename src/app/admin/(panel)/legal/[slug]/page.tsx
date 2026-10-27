import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityForm } from "@/components/admin/entity-form";
import { AdminHeader } from "@/components/admin/ui";
import { legalGroups } from "@/lib/admin/entities";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Page légale" };

export default async function LegalEdit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== "legal-notice" && slug !== "privacy") notFound();
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("legal_pages").select("*").eq("slug", slug).maybeSingle();
  if (!data) notFound();
  return (
    <>
      <AdminHeader back={{ href: "/admin/legal", label: "Pages légales" }} title={data.title.fr} />
      <EntityForm entity="legal" id={slug} groups={legalGroups} values={data} />
    </>
  );
}
