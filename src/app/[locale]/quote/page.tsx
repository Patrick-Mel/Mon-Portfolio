import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { QuoteForm } from "@/components/forms/quote-form";
import { Icon } from "@/components/ui/icon";
import { PageHeader, Skeleton } from "@/components/ui/primitives";
import { getServices, getSettings } from "@/lib/data/content";
import { tr } from "@/lib/i18n-utils";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/quote">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [settings, t] = await Promise.all([getSettings(), getTranslations("quote")]);
  return pageMetadata({ settings, locale, href: "/quote", title: t("metaTitle"), description: t("metaDescription") });
}

function FormSkeleton() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-12" />
      <Skeleton className="h-40" />
      <Skeleton className="h-12 w-40" />
    </div>
  );
}

export default async function QuotePage({ params }: PageProps<"/[locale]/quote">) {
  const locale = await resolveLocale(params);
  const [settings, services, t] = await Promise.all([getSettings(), getServices(), getTranslations("quote")]);
  if (!settings.features.quotes) notFound();
  const options = services.map((s) => ({ value: s.slug, label: tr(s.title, locale) }));

  return (
    <>
      <PageHeader layer={t("layer")} title={t("title")} intro={t("intro")} />
      <div className="container-site grid gap-14 py-14 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {/* useSearchParams (pré-remplissage) : la page reste statique, le formulaire s'hydrate. */}
          <Suspense fallback={<FormSkeleton />}>
            <QuoteForm services={options} />
          </Suspense>
        </div>
        <aside className="lg:col-span-4 lg:col-start-9">
          <ul className="sticky top-[calc(var(--header-h)+2rem)] grid gap-px overflow-hidden rounded-lg border border-line bg-line">
            {services.map((s) => (
              <li key={s.id} className="flex gap-4 bg-surface p-5">
                <Icon name={s.icon} className="mt-0.5 shrink-0 text-accent-ink" size={20} />
                <div>
                  <p className="font-medium text-fg">{tr(s.title, locale)}</p>
                  <p className="mt-1 text-sm text-muted">{tr(s.summary, locale)}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
