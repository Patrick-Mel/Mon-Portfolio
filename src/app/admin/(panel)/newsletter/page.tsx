import type { Metadata } from "next";
import Link from "next/link";
import { deleteSubscriber } from "@/app/admin/_actions/inbox";
import { CampaignForm } from "@/components/admin/campaign-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { btnSecondary } from "@/components/admin/crud";
import { AdminHeader, EmptyRow, FilterTabs, fmtDateTime, Panel, StatusPill, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { getSettings } from "@/lib/data/content";

export const metadata: Metadata = { title: "Newsletter" };

const FILTERS = [
  ["all", "Tous"],
  ["confirmed", "Confirmés"],
  ["pending", "En attente"],
  ["unsubscribed", "Désinscrits"],
] as const;

export default async function NewsletterAdmin({ searchParams }: { searchParams: Promise<{ status?: string; post?: string }> }) {
  const sp = await searchParams;
  const status = FILTERS.some(([s]) => s === sp.status) ? sp.status! : "all";
  const { supabase } = await requireAdmin();

  let q = supabase.from("subscribers").select("id, email, locale, status, created_at").order("created_at", { ascending: false }).limit(500);
  if (status !== "all") q = q.eq("status", status);
  const [{ data: subs }, confirmed, { data: campaigns }, { data: posts }, settings] = await Promise.all([
    q,
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("campaigns").select("id, subject, audience, recipients, sent_at").order("sent_at", { ascending: false }).limit(20),
    supabase.from("posts").select("id, slug, title, excerpt").neq("status", "draft").order("published_at", { ascending: false }).limit(10),
    getSettings(),
  ]);

  // Pré-remplissage « annoncer un article ».
  const post = posts?.find((p) => p.id === sp.post);
  const preset = post
    ? {
        subject: `Nouvel article — ${post.title.fr}`,
        body: `## ${post.title.fr}\n\n${post.excerpt.fr}\n\n[Lire l'article](${settings.siteUrl}/fr/blog/${post.slug})\n\n---\n\n## ${post.title.en}\n\n${post.excerpt.en}\n\n[Read the article](${settings.siteUrl}/en/blog/${post.slug})`,
      }
    : undefined;

  return (
    <>
      <AdminHeader
        title="Newsletter"
        description="Double opt-in : seuls les abonnés ayant confirmé leur adresse reçoivent les campagnes."
        actions={
          // eslint-disable-next-line @next/next/no-html-link-for-pages -- téléchargement (route handler), pas une page
          <a href="/admin/export/subscribers" className={btnSecondary}>
            Exporter en CSV
          </a>
        }
      />
      <div className="grid gap-6">
        <Panel
          title="Nouvelle campagne"
          description={`${confirmed.count ?? 0} abonné(s) confirmé(s).`}
          actions={
            posts?.length ? (
              <form className="flex items-center gap-2">
                <label htmlFor="post-preset" className="sr-only">
                  Annoncer un article
                </label>
                <select id="post-preset" name="post" defaultValue={sp.post ?? ""} className="h-9 max-w-56 rounded-sm border border-line-strong bg-surface px-2 text-sm">
                  <option value="">Annoncer un article…</option>
                  {posts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title.fr}
                    </option>
                  ))}
                </select>
                <button type="submit" className="h-9 rounded-sm border border-line-strong px-3 text-sm">
                  Pré-remplir
                </button>
              </form>
            ) : null
          }
        >
          <CampaignForm key={sp.post ?? "blank"} preset={preset} confirmed={confirmed.count ?? 0} />
        </Panel>

        <div>
          <h2 className="mb-4 font-display text-xl">Abonnés</h2>
          <FilterTabs current={status} items={FILTERS.map(([s, l]) => ({ value: s, label: l, href: `/admin/newsletter?status=${s}` }))} />
          <Table>
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Langue</th>
                <th>Statut</th>
                <th>Inscription</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {!subs?.length && <EmptyRow colSpan={5}>Aucun abonné.</EmptyRow>}
              {subs?.map((s) => (
                <tr key={s.id}>
                  <td>{s.email}</td>
                  <td className="font-mono text-xs uppercase">{s.locale}</td>
                  <td>
                    <StatusPill status={s.status} />
                  </td>
                  <td className="font-mono text-xs">{fmtDateTime(s.created_at)}</td>
                  <td className="text-right">
                    <form action={deleteSubscriber}>
                      <input type="hidden" name="id" value={s.id} />
                      <ConfirmButton message="Supprimer définitivement cet abonné ?" className="text-xs text-danger hover:underline">
                        Supprimer
                      </ConfirmButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div>
          <h2 className="mb-4 font-display text-xl">Campagnes envoyées</h2>
          <Table>
            <thead>
              <tr>
                <th>Objet</th>
                <th>Audience</th>
                <th>Destinataires</th>
                <th>Envoi</th>
              </tr>
            </thead>
            <tbody>
              {!campaigns?.length && <EmptyRow colSpan={4}>Aucune campagne envoyée.</EmptyRow>}
              {campaigns?.map((c) => (
                <tr key={c.id}>
                  <td>{c.subject}</td>
                  <td className="font-mono text-xs uppercase">{c.audience}</td>
                  <td className="font-mono text-xs">{c.recipients}</td>
                  <td className="font-mono text-xs">{fmtDateTime(c.sent_at)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <p className="mt-3 text-xs text-subtle">
            Astuce : depuis <Link href="/admin/posts" className="underline">Articles</Link>, publiez puis revenez ici pour annoncer le nouvel article.
          </p>
        </div>
      </div>
    </>
  );
}
