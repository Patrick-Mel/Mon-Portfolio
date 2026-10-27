import type { Metadata } from "next";
import { AdminHeader, EmptyRow, fmtDateTime, Pill, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Journal d'activité" };

const ACTIONS: Record<string, [string, "neutral" | "accent" | "success" | "warning" | "danger"]> = {
  create: ["Création", "success"],
  update: ["Modification", "neutral"],
  delete: ["Suppression", "danger"],
  login: ["Connexion", "accent"],
  logout: ["Déconnexion", "neutral"],
  upload: ["Téléversement", "neutral"],
  export: ["Export", "warning"],
  reply: ["Réponse", "accent"],
  send: ["Envoi", "accent"],
  moderate: ["Modération", "neutral"],
  status: ["Statut", "neutral"],
  mfa_enabled: ["2FA activée", "success"],
  mfa_disabled: ["2FA désactivée", "danger"],
};

export default async function ActivityAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(200);
  return (
    <>
      <AdminHeader title="Journal d'activité" description="Les 200 dernières actions effectuées dans l'administration." />
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Action</th>
            <th>Élément</th>
            <th>Détail</th>
            <th>Compte</th>
          </tr>
        </thead>
        <tbody>
          {!data?.length && <EmptyRow colSpan={5}>Aucune activité enregistrée.</EmptyRow>}
          {data?.map((a) => {
            const [label, tone] = ACTIONS[a.action] ?? [a.action, "neutral" as const];
            const meta = a.meta && Object.keys(a.meta).length ? Object.values(a.meta as Record<string, unknown>).filter((v) => typeof v === "string" || typeof v === "number").join(" · ") : "";
            return (
              <tr key={a.id}>
                <td className="font-mono text-xs whitespace-nowrap">{fmtDateTime(a.created_at)}</td>
                <td>
                  <Pill tone={tone}>{label}</Pill>
                </td>
                <td className="font-mono text-xs">{a.entity}</td>
                <td className="max-w-xs truncate text-muted">{meta}</td>
                <td className="text-xs text-subtle">{a.actor_email}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
