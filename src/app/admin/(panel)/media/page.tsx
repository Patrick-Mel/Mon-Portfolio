import type { Metadata } from "next";
import type { MediaItem } from "@/app/admin/_actions/media";
import { MediaLibrary } from "@/components/admin/media-library";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Médiathèque" };

export default async function MediaAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("media").select("*").order("created_at", { ascending: false }).limit(300);
  return (
    <>
      <AdminHeader title="Médiathèque" description="Images, schémas et PDF (dont vos CV FR et EN) utilisés sur le site." />
      <MediaLibrary items={(data ?? []) as MediaItem[]} />
    </>
  );
}
