import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getLegalPage, getSettings } from "@/lib/data/content";
import { tr } from "@/lib/i18n-utils";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/legal-notice">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [settings, page] = await Promise.all([getSettings(), getLegalPage("legal-notice")]);
  return pageMetadata({ settings, locale, href: "/legal-notice", title: tr(page?.title, locale) });
}

export default async function LegalNoticePage({ params }: PageProps<"/[locale]/legal-notice">) {
  const locale = await resolveLocale(params);
  return <LegalPage slug="legal-notice" locale={locale} />;
}
