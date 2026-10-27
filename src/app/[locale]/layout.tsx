import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Analytics } from "@/components/layout/analytics";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { RevealObserver } from "@/components/layout/reveal-observer";
import { themeScript } from "@/components/layout/theme-script";
import { JsonLd, personJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { routing } from "@/i18n/routing";
import { getSettings } from "@/lib/data/content";
import { isSupabaseConfigured } from "@/lib/env";
import { tr } from "@/lib/i18n-utils";
import { alternatesFor } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import { fontVariables } from "../fonts";
import "../globals.css";

export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0c" },
  ],
  colorScheme: "light dark",
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const settings = await getSettings();
  const title = tr(settings.seoTitle, locale);
  return {
    metadataBase: new URL(settings.siteUrl),
    title: { default: `${settings.ownerName} — ${title}`, template: `%s · ${settings.brandName}` },
    description: tr(settings.seoDescription, locale),
    applicationName: settings.brandName,
    authors: [{ name: settings.ownerName, url: settings.siteUrl }],
    creator: settings.ownerName,
    alternates: alternatesFor(settings, locale, "/"),
    formatDetection: { telephone: false },
    robots: { index: true, follow: true },
  };
}

/** Clés de traduction utilisées par les composants client (le reste reste côté serveur). */
const CLIENT_NAMESPACES = ["common", "error", "forms", "validation", "errors", "contact", "quote", "blog", "newsletter", "projects"];

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [settings, messages, t] = await Promise.all([getSettings(), getMessages(), getTranslations("meta")]);
  const clientMessages = Object.fromEntries(Object.entries(messages).filter(([k]) => CLIENT_NAMESPACES.includes(k)));
  const accent = /^#[0-9a-f]{6}$/i.test(settings.accentColor) ? settings.accentColor : null;

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript(settings.defaultTheme) }} />
        {accent && <style>{`:root{--accent:${accent}}`}</style>}
        <JsonLd data={[websiteJsonLd(settings, locale), personJsonLd(settings, locale)]} />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="fixed top-2 left-2 z-[100] -translate-y-20 rounded-sm bg-accent px-4 py-2 font-medium text-accent-contrast transition-transform focus:translate-y-0"
        >
          {t("skipLink")}
        </a>
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <Header settings={settings} locale={locale} />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer settings={settings} locale={locale} />
          <RevealObserver />
          {isSupabaseConfigured && settings.features.analytics && <Analytics />}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
