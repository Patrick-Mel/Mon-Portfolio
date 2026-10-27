import type { Metadata, Viewport } from "next";
import { themeScript } from "@/components/layout/theme-script";
import { getSettings } from "@/lib/data/content";
import { fontVariables } from "../fonts";
import "../globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => null);
  return {
    title: { default: "Administration", template: `%s · Admin${settings ? ` · ${settings.brandName}` : ""}` },
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  };
}

export const viewport: Viewport = { colorScheme: "light dark" };

/** Layout racine séparé du site public : pas de navigation publique, non indexé. */
export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings().catch(() => null);
  const accent = settings && /^#[0-9a-f]{6}$/i.test(settings.accentColor) ? settings.accentColor : null;
  return (
    <html lang="fr" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript("system") }} />
        {accent && <style>{`:root{--accent:${accent}}`}</style>}
      </head>
      <body className="min-h-dvh bg-bg text-fg antialiased">{children}</body>
    </html>
  );
}
