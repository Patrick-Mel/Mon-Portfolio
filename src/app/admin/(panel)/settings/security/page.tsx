import type { Metadata } from "next";
import { disableMfa } from "@/app/admin/_actions/auth";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { MfaSetup } from "@/components/admin/mfa-setup";
import { AdminHeader, fmtDateTime, Panel, Pill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Sécurité" };

export default async function SecurityAdmin() {
  const { supabase, user } = await requireAdmin();
  const { data } = await supabase.auth.mfa.listFactors();
  const verified = data?.totp.filter((f) => f.status === "verified") ?? [];

  return (
    <>
      <AdminHeader title="Sécurité du compte" description={`Connecté en tant que ${user.email}. Dernière connexion : ${fmtDateTime(user.last_sign_in_at)}.`} />
      <div className="grid gap-6">
        <Panel
          title="Double authentification (TOTP)"
          description="Fortement recommandée : même si votre mot de passe fuite, personne ne peut se connecter sans votre téléphone."
          actions={<Pill tone={verified.length ? "success" : "warning"}>{verified.length ? "Activée" : "Désactivée"}</Pill>}
        >
          {verified.length ? (
            <ul className="grid gap-3">
              {verified.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-4 text-sm">
                  <span>
                    Application d&apos;authentification · ajoutée le {fmtDateTime(f.created_at)}
                  </span>
                  <form action={disableMfa}>
                    <input type="hidden" name="factorId" value={f.id} />
                    <ConfirmButton message="Désactiver la double authentification ?" className="text-sm text-danger hover:underline">
                      Désactiver
                    </ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <MfaSetup />
          )}
        </Panel>
        <Panel title="Bonnes pratiques">
          <ul className="grid list-disc gap-2 pl-5 text-sm text-muted">
            <li>Utilisez un mot de passe unique d&apos;au moins 16 caractères, stocké dans un gestionnaire de mots de passe.</li>
            <li>Les inscriptions publiques doivent rester désactivées dans Supabase (Authentication → Providers → Email → « Allow new users to sign up » décoché).</li>
            <li>Ne partagez jamais la clé service_role ; en cas de doute, régénérez-la dans Supabase puis sur Vercel.</li>
            <li>Consultez régulièrement le journal d&apos;activité.</li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
