import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/ui/markdown";
import { PageHeader } from "@/components/ui/primitives";
import { getLegalPage, getSettings } from "@/lib/data/content";
import { fillTemplate, formatDate, tr } from "@/lib/i18n-utils";
import type { LegalPage as LegalPageType, Locale } from "@/lib/types";

export async function LegalPage({ slug, locale }: { slug: LegalPageType["slug"]; locale: Locale }) {
  const [settings, page, t] = await Promise.all([getSettings(), getLegalPage(slug), getTranslations("legal")]);
  if (!page) notFound();
  return (
    <>
      <PageHeader layer={t("layer")} title={tr(page.title, locale)}>
        <p className="mt-6 font-mono text-xs text-subtle">{t("lastUpdated", { date: formatDate(page.updatedAt, locale) })}</p>
      </PageHeader>
      <div className="container-site py-14 md:py-20">
        <Markdown source={fillTemplate(tr(page.content, locale), settings, locale)} />
      </div>
    </>
  );
}
