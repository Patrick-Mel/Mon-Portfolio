import { AdminSidebar } from "@/components/admin/sidebar";
import { SetupNotice } from "@/components/admin/setup-notice";
import { requireAdmin } from "@/lib/admin/auth";
import { getSettings } from "@/lib/data/content";
import { isSupabaseConfigured } from "@/lib/env";

/** Toutes les pages du panneau passent par cette vérification serveur. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) return <SetupNotice />;
  const ctx = await requireAdmin();
  const [settings, messages, quotes, comments] = await Promise.all([
    getSettings(),
    ctx.supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
    ctx.supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    ctx.supabase.from("comments").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return (
    <div className="lg:flex">
      <AdminSidebar
        brand={settings.brandName}
        initials={settings.initials}
        email={ctx.user.email ?? ""}
        counts={{ inbox: (messages.count ?? 0) + (quotes.count ?? 0), comments: comments.count ?? 0 }}
      />
      <main id="main" className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
