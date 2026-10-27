import type { Metadata } from "next";
import { moderateComment } from "@/app/admin/_actions/inbox";
import { ConfirmButton, SubmitButton } from "@/components/admin/confirm-button";
import { AdminHeader, FilterTabs, fmtDateTime, StatusPill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Commentaires" };

const FILTERS = [
  ["pending", "À modérer"],
  ["approved", "Approuvés"],
  ["rejected", "Rejetés"],
  ["spam", "Spam"],
] as const;

export default async function CommentsAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: raw } = await searchParams;
  const status = FILTERS.some(([s]) => s === raw) ? raw! : "pending";
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("comments")
    .select("id, author_name, author_email, content, status, created_at, locale, post:posts(title, slug)")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(100);

  const action = (id: string, a: string, label: string, cls: string) => (
    <form action={moderateComment}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="action" value={a} />
      {a === "delete" ? (
        <ConfirmButton className={cls}>{label}</ConfirmButton>
      ) : (
        <SubmitButton className={cls}>{label}</SubmitButton>
      )}
    </form>
  );
  const btn = "h-8 rounded-sm border border-line px-3 text-xs hover:border-fg";

  return (
    <>
      <AdminHeader title="Commentaires" description="Aucun commentaire n'est publié sans votre approbation. L'e-mail des auteurs n'est jamais affiché sur le site." />
      <FilterTabs current={status} items={FILTERS.map(([s, l]) => ({ value: s, label: l, href: `/admin/comments?status=${s}` }))} />
      {!data?.length ? (
        <p className="rounded-lg border border-dashed border-line-strong p-10 text-center text-muted">Rien dans cette catégorie.</p>
      ) : (
        <ul className="grid gap-4">
          {data.map((c) => {
            const post = c.post as unknown as { title: { fr: string }; slug: string } | null;
            return (
              <li key={c.id} className="rounded-lg border border-line bg-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <p>
                    <span className="font-medium">{c.author_name}</span> <span className="text-subtle">· {c.author_email}</span>
                  </p>
                  <StatusPill status={c.status} />
                </div>
                <p className="mt-1 font-mono text-xs text-subtle">
                  {fmtDateTime(c.created_at)} · sur «{" "}
                  <a href={`/${c.locale}/blog/${post?.slug}`} target="_blank" rel="noopener" className="hover:underline">
                    {post?.title.fr}
                  </a>{" "}
                  »
                </p>
                <p className="mt-3 text-[0.9375rem] whitespace-pre-wrap">{c.content}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.status !== "approved" && action(c.id, "approved", "Approuver", `${btn} border-success/50 text-success`)}
                  {c.status !== "rejected" && action(c.id, "rejected", "Rejeter", btn)}
                  {c.status !== "spam" && action(c.id, "spam", "Spam", btn)}
                  {action(c.id, "delete", "Supprimer", `${btn} text-danger`)}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
