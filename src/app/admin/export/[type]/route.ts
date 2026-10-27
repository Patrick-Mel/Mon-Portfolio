import { logActivity } from "@/lib/admin/activity";
import { getAdmin } from "@/lib/admin/auth";
import { toCsv } from "@/lib/csv";

const EXPORTS = {
  messages: {
    table: "contact_messages",
    columns: [
      { key: "created_at", label: "Date" },
      { key: "name", label: "Nom" },
      { key: "email", label: "E-mail" },
      { key: "subject", label: "Sujet" },
      { key: "message", label: "Message" },
      { key: "status", label: "Statut" },
      { key: "locale", label: "Langue" },
    ],
  },
  quotes: {
    table: "quote_requests",
    columns: [
      { key: "created_at", label: "Date" },
      { key: "name", label: "Nom" },
      { key: "email", label: "E-mail" },
      { key: "phone", label: "Téléphone" },
      { key: "company", label: "Organisation" },
      { key: "service", label: "Prestation" },
      { key: "budget", label: "Budget" },
      { key: "timeline", label: "Délai" },
      { key: "description", label: "Besoin" },
      { key: "status", label: "Statut" },
    ],
  },
  subscribers: {
    table: "subscribers",
    columns: [
      { key: "email", label: "E-mail" },
      { key: "locale", label: "Langue" },
      { key: "status", label: "Statut" },
      { key: "created_at", label: "Inscription" },
      { key: "confirmed_at", label: "Confirmation" },
    ],
  },
} as const;

/** Export CSV réservé à l'administrateur (vérification serveur, pas seulement le proxy). */
export async function GET(_req: Request, { params }: RouteContext<"/admin/export/[type]">) {
  const ctx = await getAdmin();
  if (!ctx) return new Response("Unauthorized", { status: 401 });
  const { type } = await params;
  const cfg = EXPORTS[type as keyof typeof EXPORTS];
  if (!cfg) return new Response("Not found", { status: 404 });

  const { data, error } = await ctx.supabase.from(cfg.table).select(cfg.columns.map((c) => c.key).join(", ")).order("created_at", { ascending: false });
  if (error) return new Response(error.message, { status: 500 });
  await logActivity(ctx, "export", cfg.table, null, { rows: data?.length ?? 0 });

  const csv = toCsv((data ?? []) as unknown as Record<string, unknown>[], [...cfg.columns]);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
