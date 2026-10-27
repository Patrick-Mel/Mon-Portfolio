import type { Metadata } from "next";
import { EntityForm } from "@/components/admin/entity-form";
import { AdminHeader } from "@/components/admin/ui";
import { settingsGroups } from "@/lib/admin/entities";
import { requireAdmin } from "@/lib/admin/auth";
import { settingsToRow } from "@/lib/data/mappers";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (
    <>
      <AdminHeader
        title="Paramètres du site"
        description="Nom, marque, domaine, coordonnées, SEO, apparence et fonctionnalités. Les valeurs par défaut viennent de site.config.ts."
      />
      <EntityForm entity="settings" id="1" groups={settingsGroups} values={data ?? settingsToRow(siteConfig)} />
    </>
  );
}
