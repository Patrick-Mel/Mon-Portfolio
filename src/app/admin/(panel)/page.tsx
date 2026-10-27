import type { Metadata } from "next";
import Link from "next/link";
import { DailyViewsChart, type DailyPoint } from "@/components/admin/charts";
import { AdminHeader, ExamplePill, FilterTabs, fmtDateTime, Panel, StatusPill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Tableau de bord" };

interface Ranked {
  label: string;
  value: number;
}
interface Analytics {
  views: number;
  visitors: number;
  prevViews: number;
  prevVisitors: number;
  daily: DailyPoint[];
  pages: Ranked[];
  referrers: Ranked[];
  countries: Ranked[];
  devices: Ranked[];
  locales: Ranked[];
}

const DEVICE: Record<string, string> = { mobile: "Mobile", tablet: "Tablette", desktop: "Ordinateur" };
const RANGES = [7, 30, 90] as const;

function Delta({ now, prev }: { now: number; prev: number }) {
  if (!prev) return <span className="text-xs text-subtle">— période précédente vide</span>;
  const pct = Math.round(((now - prev) / prev) * 100);
  return (
    <span className={`font-mono text-xs ${pct >= 0 ? "text-success" : "text-danger"}`}>
      {pct >= 0 ? "▲" : "▼"} {Math.abs(pct)} % <span className="text-subtle">vs période précédente</span>
    </span>
  );
}

/** Classement en barres horizontales mono-teinte, valeurs en texte. */
function RankList({ title, rows, format = (s) => s }: { title: string; rows: Ranked[]; format?: (s: string) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Panel title={title}>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">Pas encore de données.</p>
      ) : (
        <ol className="grid gap-2.5">
          {rows.map((r) => (
            <li key={r.label} className="grid gap-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate" title={r.label}>
                  {format(r.label)}
                </span>
                <span className="font-mono text-xs text-muted">{r.value}</span>
              </div>
              <div aria-hidden className="h-1.5 rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days: raw } = await searchParams;
  const days = RANGES.find((r) => String(r) === raw) ?? 30;
  const { supabase } = await requireAdmin();

  const [analytics, msgs, quotes, comments, subs, examples, latestMessages, latestQuotes, pendingComments] = await Promise.all([
    supabase.rpc("admin_analytics", { p_days: days }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("comments").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
    Promise.all(
      ["projects", "posts", "services", "skills", "timeline_entries", "key_figures", "legal_pages", "site_settings"].map((t) =>
        supabase.from(t).select("*", { count: "exact", head: true }).eq("is_example", true),
      ),
    ),
    supabase.from("contact_messages").select("id, name, subject, status, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("quote_requests").select("id, name, service, status, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("comments").select("id, author_name, content, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
  ]);
  const a = (analytics.data ?? null) as Analytics | null;
  const exampleCount = examples.reduce((n, r) => n + (r.count ?? 0), 0);

  const tiles = [
    { label: "Nouveaux messages", value: msgs.count ?? 0, href: "/admin/inbox?type=message&status=new" },
    { label: "Nouveaux devis", value: quotes.count ?? 0, href: "/admin/inbox?type=quote&status=new" },
    { label: "Commentaires à modérer", value: comments.count ?? 0, href: "/admin/comments" },
    { label: "Abonnés confirmés", value: subs.count ?? 0, href: "/admin/newsletter?status=confirmed" },
  ];

  return (
    <>
      <AdminHeader title="Tableau de bord" description="Vue d'ensemble de l'audience et des demandes entrantes." />

      {exampleCount > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-md border border-warning/40 bg-[color-mix(in_oklab,var(--warning)_10%,transparent)] px-4 py-3 text-sm">
          <ExamplePill />
          <span>
            <strong>{exampleCount}</strong> élément(s) contiennent encore du contenu d&apos;exemple. Remplacez-les par vos informations réelles (paramètres, projets, parcours…).
          </span>
        </div>
      )}

      <ul className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className="block rounded-lg border border-line bg-surface p-5 transition-colors hover:border-line-strong">
              <p className="text-xs text-muted">{t.label}</p>
              <p className="mt-2 font-display text-3xl tracking-tight">{t.value}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl">Audience</h2>
        <FilterTabs current={String(days)} items={RANGES.map((r) => ({ value: String(r), label: `${r} jours`, href: `/admin?days=${r}` }))} />
      </div>

      {!a ? (
        <Panel>
          <p className="text-sm text-muted">Statistiques indisponibles ({analytics.error?.message ?? "aucune donnée"}).</p>
        </Panel>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-surface p-5">
              <p className="text-xs text-muted">Visiteurs uniques (estimation quotidienne)</p>
              <p className="mt-2 font-display text-4xl tracking-tight">{a.visitors}</p>
              <Delta now={a.visitors} prev={a.prevVisitors} />
            </div>
            <div className="rounded-lg border border-line bg-surface p-5">
              <p className="text-xs text-muted">Pages vues</p>
              <p className="mt-2 font-display text-4xl tracking-tight">{a.views}</p>
              <Delta now={a.views} prev={a.prevViews} />
            </div>
          </div>
          <Panel title={`Pages vues par jour · ${days} jours`}>
            <DailyViewsChart data={a.daily} />
          </Panel>
          <div className="grid gap-6 md:grid-cols-2">
            <RankList title="Pages les plus vues" rows={a.pages} />
            <RankList title="Sources" rows={a.referrers} format={(s) => (s === "direct" ? "Accès direct" : s)} />
            <RankList title="Pays" rows={a.countries} format={(s) => (s === "??" ? "Inconnu" : s)} />
            <RankList title="Appareils" rows={a.devices} format={(s) => DEVICE[s] ?? s} />
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Derniers messages" actions={<Link href="/admin/inbox?type=message" className="text-sm text-accent-ink hover:underline">Tout voir</Link>}>
          <ul className="grid gap-3 text-sm">
            {!latestMessages.data?.length && <li className="text-muted">Aucun message.</li>}
            {latestMessages.data?.map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-2">
                <Link href={`/admin/inbox/message/${m.id}`} className="min-w-0 hover:underline">
                  <span className="block truncate font-medium">{m.name}</span>
                  <span className="block truncate text-xs text-muted">{m.subject}</span>
                </Link>
                <StatusPill status={m.status} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Derniers devis" actions={<Link href="/admin/inbox?type=quote" className="text-sm text-accent-ink hover:underline">Tout voir</Link>}>
          <ul className="grid gap-3 text-sm">
            {!latestQuotes.data?.length && <li className="text-muted">Aucune demande.</li>}
            {latestQuotes.data?.map((q) => (
              <li key={q.id} className="flex items-start justify-between gap-2">
                <Link href={`/admin/inbox/quote/${q.id}`} className="min-w-0 hover:underline">
                  <span className="block truncate font-medium">{q.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {q.service} · {fmtDateTime(q.created_at)}
                  </span>
                </Link>
                <StatusPill status={q.status} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Commentaires à modérer" actions={<Link href="/admin/comments" className="text-sm text-accent-ink hover:underline">Modérer</Link>}>
          <ul className="grid gap-3 text-sm">
            {!pendingComments.data?.length && <li className="text-muted">Rien à modérer.</li>}
            {pendingComments.data?.map((c) => (
              <li key={c.id}>
                <span className="font-medium">{c.author_name}</span>
                <span className="block truncate text-xs text-muted">{c.content}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
