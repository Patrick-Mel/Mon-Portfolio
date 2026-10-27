import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteInboxItem, setInboxStatus } from "@/app/admin/_actions/inbox";
import { ConfirmButton, SubmitButton } from "@/components/admin/confirm-button";
import { AttachmentLink, ReplyForm } from "@/components/admin/inbox-widgets";
import { AdminHeader, fmtDateTime, Panel, StatusPill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Message" };

const STATUS_FLOW = [
  ["new", "Nouveau"],
  ["read", "Lu"],
  ["in_progress", "En cours"],
  ["done", "Traité"],
] as const;

export default async function InboxItem({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  if ((type !== "message" && type !== "quote") || !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const table = type === "quote" ? "quote_requests" : "contact_messages";
  const { data: item } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (!item) notFound();

  // Ouvrir un nouvel élément le marque comme lu.
  if (item.status === "new") {
    await supabase.from(table).update({ status: "read" }).eq("id", id);
    item.status = "read";
  }

  const tq = (await getTranslations({ locale: "fr", namespace: "quote" })) as unknown as { has: (k: string) => boolean; (k: string): string };
  const label = (k: string, fallback: string) => (tq.has(k) ? tq(k) : fallback);
  const subject = type === "quote" ? `Votre demande de devis — ${item.service}` : `Re: ${item.subject}`;
  const fields: [string, string][] =
    type === "quote"
      ? [
          ["Prestation", item.service],
          ["Budget", label(`budgets.${item.budget}`, item.budget)],
          ["Délai", label(`timelines.${item.timeline}`, item.timeline)],
          ["Téléphone", item.phone],
          ["Organisation", item.company],
          ["Langue", item.locale],
        ]
      : [
          ["Sujet", item.subject],
          ["Langue", item.locale],
        ];

  return (
    <>
      <AdminHeader
        back={{ href: `/admin/inbox?type=${type}`, label: "Boîte de réception" }}
        title={item.name}
        description={
          <>
            <a href={`mailto:${item.email}`} className="text-accent-ink hover:underline">
              {item.email}
            </a>{" "}
            · reçu le {fmtDateTime(item.created_at)}
          </>
        }
        actions={
          <form action={deleteInboxItem}>
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="id" value={id} />
            <ConfirmButton className="inline-flex h-10 items-center rounded-sm border border-danger/40 px-4 text-sm text-danger">Supprimer</ConfirmButton>
          </form>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:col-span-2">
          <Panel title={type === "quote" ? "Besoin décrit" : "Message"}>
            <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed">{type === "quote" ? item.description : item.message}</p>
            {type === "quote" && item.attachments?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-4">
                {(item.attachments as { path: string; name: string; size: number }[]).map((a) => (
                  <AttachmentLink key={a.path} {...a} />
                ))}
              </div>
            )}
          </Panel>
          <Panel
            title="Répondre"
            description="Envoyé via Resend depuis votre adresse d'expédition, avec votre e-mail public en adresse de réponse."
            actions={
              <a href={`mailto:${item.email}?subject=${encodeURIComponent(subject)}`} className="text-sm text-accent-ink hover:underline">
                Répondre avec ma messagerie ↗
              </a>
            }
          >
            <ReplyForm type={type} id={id} defaultSubject={subject} />
          </Panel>
        </div>
        <div className="grid content-start gap-6">
          <Panel title="Statut" actions={<StatusPill status={item.status} />}>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_FLOW.map(([s, label]) => (
                <form key={s} action={setInboxStatus}>
                  <input type="hidden" name="type" value={type} />
                  <input type="hidden" name="id" value={id} />
                  <input type="hidden" name="status" value={s} />
                  <SubmitButton
                    aria-pressed={item.status === s}
                    className={cn("h-9 w-full rounded-sm border text-sm", item.status === s ? "border-accent bg-accent-soft text-accent-ink" : "border-line hover:border-fg")}
                  >
                    {label}
                  </SubmitButton>
                </form>
              ))}
            </div>
          </Panel>
          <Panel title="Détails">
            <dl className="grid gap-3 text-sm">
              {fields
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-mono text-xs text-subtle">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
