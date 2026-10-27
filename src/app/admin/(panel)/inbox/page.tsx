import type { Metadata } from "next";
import Link from "next/link";
import { btnSecondary } from "@/components/admin/crud";
import { AdminHeader, EmptyRow, FilterTabs, fmtDateTime, Pill, StatusPill, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Boîte de réception" };

const STATUSES = [
  ["all", "Tous"],
  ["new", "Nouveaux"],
  ["read", "Lus"],
  ["in_progress", "En cours"],
  ["done", "Traités"],
] as const;

export default async function InboxAdmin({ searchParams }: { searchParams: Promise<{ type?: string; status?: string; q?: string }> }) {
  const sp = await searchParams;
  const type = sp.type === "quote" ? "quote" : "message";
  const status = STATUSES.some(([s]) => s === sp.status) ? sp.status! : "all";
  const q = (sp.q ?? "").trim().slice(0, 100);
  const { supabase } = await requireAdmin();
  const table = type === "quote" ? "quote_requests" : "contact_messages";

  let query = supabase
    .from(table)
    .select(type === "quote" ? "id, name, email, service, budget, status, created_at, attachments" : "id, name, email, subject, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all") query = query.eq("status", status);
  if (q) {
    const safe = q.replace(/[%,()]/g, " ");
    query = query.or(
      type === "quote"
        ? `name.ilike.%${safe}%,email.ilike.%${safe}%,description.ilike.%${safe}%,company.ilike.%${safe}%`
        : `name.ilike.%${safe}%,email.ilike.%${safe}%,subject.ilike.%${safe}%,message.ilike.%${safe}%`,
    );
  }
  const [{ data }, newMessages, newQuotes] = await Promise.all([
    query,
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  const rows = (data ?? []) as unknown as {
    id: string;
    name: string;
    email: string;
    service?: string;
    subject?: string;
    status: string;
    created_at: string;
    attachments?: unknown[];
  }[];
  const href = (p: Record<string, string>) => `/admin/inbox?${new URLSearchParams({ type, status, ...(q && { q }), ...p })}`;

  return (
    <>
      <AdminHeader
        title="Boîte de réception"
        description="Messages de contact et demandes de devis. Les nouvelles soumissions déclenchent aussi un e-mail de notification."
        actions={
           
          <a href={`/admin/export/${type === "quote" ? "quotes" : "messages"}`} className={btnSecondary}>
            Exporter en CSV
          </a>
        }
      />
      <div className="mb-4 flex gap-2 border-b border-line">
        {(
          [
            ["message", "Messages", newMessages.count ?? 0],
            ["quote", "Devis", newQuotes.count ?? 0],
          ] as const
        ).map(([t, label, count]) => (
          <Link
            key={t}
            href={`/admin/inbox?type=${t}`}
            aria-current={type === t ? "page" : undefined}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm ${type === t ? "border-accent font-medium text-fg" : "border-transparent text-muted hover:text-fg"}`}
          >
            {label}
            {count > 0 && <Pill tone="accent">{count}</Pill>}
          </Link>
        ))}
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <FilterTabs current={status} items={STATUSES.map(([s, l]) => ({ value: s, label: l, href: href({ status: s }) }))} />
        <form className="flex gap-2" role="search">
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="status" value={status} />
          <label htmlFor="inbox-q" className="sr-only">
            Rechercher
          </label>
          <input id="inbox-q" name="q" defaultValue={q} placeholder="Nom, e-mail, contenu…" className="h-9 w-56 rounded-sm border border-line-strong bg-surface px-3 text-sm" />
          <button type="submit" className="h-9 rounded-sm border border-line-strong px-3 text-sm hover:border-fg">
            Rechercher
          </button>
        </form>
      </div>
      <Table>
        <thead>
          <tr>
            <th>De</th>
            <th>{type === "quote" ? "Prestation" : "Sujet"}</th>
            <th>Statut</th>
            <th>Reçu</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={4}>Aucun élément{q ? ` pour « ${q} »` : ""}.</EmptyRow>}
          {rows.map((r) => (
            <tr key={r.id} className={r.status === "new" ? "font-medium" : undefined}>
              <td>
                <Link href={`/admin/inbox/${type}/${r.id}`} className="hover:text-accent-ink hover:underline">
                  {r.name}
                </Link>
                <span className="block text-xs font-normal text-subtle">{r.email}</span>
              </td>
              <td className="max-w-xs truncate">
                {type === "quote" ? r.service : r.subject}
                {type === "quote" && Array.isArray(r.attachments) && r.attachments.length > 0 && <span className="ml-2 text-xs text-subtle">📎 {r.attachments.length}</span>}
              </td>
              <td>
                <StatusPill status={r.status} />
              </td>
              <td className="font-mono text-xs">{fmtDateTime(r.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
