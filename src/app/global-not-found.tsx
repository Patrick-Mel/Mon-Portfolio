import type { Metadata } from "next";
import Link from "next/link";
import { themeScript } from "@/components/layout/theme-script";
import { siteConfig } from "@/site.config";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: `404 · ${siteConfig.brandName}`,
  robots: { index: false },
};

/** 404 hors de toute route connue (ni /fr, ni /en, ni /admin) : bilingue. */
export default function GlobalNotFound() {
  return (
    <html lang="fr" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript(siteConfig.defaultTheme) }} />
      </head>
      <body className="grid min-h-dvh place-items-center bg-bg p-6 text-fg">
        <main className="max-w-xl">
          <p className="layer-label mb-6 text-danger">404 · Host unreachable</p>
          <h1 className="text-h2">Page introuvable</h1>
          <p className="mt-2 font-display text-xl text-muted" lang="en">
            Page not found
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/fr" className="rounded-sm bg-accent px-5 py-3 font-medium text-accent-contrast">
              Accueil (FR)
            </Link>
            <Link href="/en" lang="en" className="rounded-sm border border-line-strong px-5 py-3 font-medium">
              Home (EN)
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
