import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth-shell";
import { MfaForm } from "@/components/admin/auth-forms";
import { getSettings } from "@/lib/data/content";

export const metadata: Metadata = { title: "Double authentification" };

export default async function MfaPage() {
  const settings = await getSettings();
  return (
    <AuthShell settings={settings} title="Double authentification" subtitle="Saisissez le code affiché par votre application (Google Authenticator, Aegis, 1Password…).">
      <MfaForm />
    </AuthShell>
  );
}
