import type { ReactNode } from "react";
import { Monogram } from "@/components/brand/monogram";
import type { SiteSettings } from "@/lib/types";

/** Écran centré des pages de connexion et de configuration. */
export function AuthShell({ settings, title, subtitle, children }: { settings: SiteSettings; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="bg-dots grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-8 shadow-3 md:p-10">
        <div className="mb-8 flex items-center gap-3">
          <Monogram initials={settings.initials} size={38} />
          <div>
            <p className="font-display text-lg leading-tight font-semibold">{settings.brandName}</p>
            <p className="font-mono text-xs text-subtle">/admin</p>
          </div>
        </div>
        <h1 className="font-display text-2xl tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
