import { siteConfig } from "@/site.config";
import { AuthShell } from "./auth-shell";

/** Affiché tant que Supabase n'est pas configuré : l'admin ne peut pas fonctionner sans base. */
export function SetupNotice() {
  const steps = [
    "Créez un projet sur supabase.com (région la plus proche de vos visiteurs).",
    "Exécutez les migrations de supabase/migrations puis supabase/seed.sql (voir README).",
    "Copiez .env.example en .env.local et renseignez NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY et SUPABASE_SERVICE_ROLE_KEY.",
    "Créez le compte propriétaire : pnpm admin:create votre@email.com",
    "Redémarrez le serveur puis revenez sur /admin.",
  ];
  return (
    <AuthShell settings={siteConfig} title="Configuration requise" subtitle="Le site public fonctionne avec le contenu d'exemple. L'administration nécessite Supabase.">
      <ol className="grid gap-4">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="font-mono text-xs text-accent-ink">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-muted">{s}</span>
          </li>
        ))}
      </ol>
    </AuthShell>
  );
}
