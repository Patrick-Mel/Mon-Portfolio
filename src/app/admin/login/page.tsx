import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth-shell";
import { LoginForm } from "@/components/admin/auth-forms";
import { SetupNotice } from "@/components/admin/setup-notice";
import { getSettings } from "@/lib/data/content";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage() {
  const settings = await getSettings().catch(() => null);
  if (!isSupabaseConfigured || !settings) return <SetupNotice />;
  return (
    <AuthShell settings={settings} title="Connexion" subtitle="Espace réservé au propriétaire du site.">
      <LoginForm />
    </AuthShell>
  );
}
