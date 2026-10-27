import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { getServices, getSettings } from "@/lib/data/content";
import { tr, trList } from "@/lib/i18n-utils";
import { JsonLd, servicesJsonLd } from "@/lib/jsonld";
import { resolveLocale } from "@/lib/locale";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/services">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [settings, t] = await Promise.all([getSettings(), getTranslations("services")]);
  return pageMetadata({ settings, locale, href: "/services", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/services">) {
  const locale = await resolveLocale(params);
  const [settings, services, t, tc] = await Promise.all([
    getSettings(),
    getServices(),
    getTranslations("services"),
    getTranslations("common"),
  ]);
  const quoteHref = (slug: string) =>
    settings.features.quotes
      ? ({ pathname: "/quote", query: { service: slug } } as const)
      : ({ pathname: "/contact" } as const);

  return (
    <>
      <JsonLd data={servicesJsonLd(settings, services, locale, absoluteUrl(settings, locale, "/services"))} />
      <PageHeader layer={t("layer")} title={t("title")} intro={t("intro")}>
        <nav aria-label={t("jump")} className="mt-10">
          <ul className="flex flex-wrap gap-2">
            {services.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm text-muted transition-colors hover:border-fg hover:text-fg"
                >
                  <span className="font-mono text-xs text-accent-ink">{String(i + 1).padStart(2, "0")}</span>
                  {tr(s.title, locale)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      {services.map((s, i) => (
        <section key={s.id} id={s.slug} aria-labelledby={`${s.slug}-title`} className={i % 2 === 1 ? "border-y border-line bg-surface" : ""}>
          <div className="container-site grid gap-12 py-16 md:py-24 lg:grid-cols-12">
            <div className="lg:col-span-5" data-reveal>
              <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
                <div className="flex items-center gap-4">
                  <span className="chamfer grid size-14 place-items-center bg-accent-soft text-accent-ink">
                    <Icon name={s.icon} size={26} />
                  </span>
                  <span className="font-mono text-xs text-subtle">
                    {String(i + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
                  </span>
                </div>
                <h2 id={`${s.slug}-title`} className="mt-6 text-h2">
                  {tr(s.title, locale)}
                </h2>
                <p className="mt-5 text-lead text-fg">{tr(s.summary, locale)}</p>
                <p className="mt-4 text-muted">{tr(s.description, locale)}</p>
                <Link href={quoteHref(s.slug)} className={buttonClasses({ className: "mt-8" })}>
                  {tc("requestQuote")} <ArrowIcon />
                </Link>
              </div>
            </div>

            <div className="grid gap-10 lg:col-span-6 lg:col-start-7">
              <div className="grid gap-8 sm:grid-cols-2" data-reveal>
                <div>
                  <h3 className="layer-label mb-4">{t("benefits")}</h3>
                  <ul className="grid gap-3">
                    {trList(s.benefits, locale).map((b) => (
                      <li key={b} className="flex gap-3 text-fg">
                        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden className="mt-1 shrink-0 text-accent-ink">
                          <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="layer-label mb-4">{t("deliverables")}</h3>
                  <ul className="grid gap-3">
                    {trList(s.deliverables, locale).map((d) => (
                      <li key={d} className="flex gap-3 text-muted">
                        <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-line-strong" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {s.process.length > 0 && (
                <div data-reveal>
                  <h3 className="layer-label mb-6">{t("process")}</h3>
                  <ol className="relative grid gap-0 sm:grid-cols-2 xl:grid-cols-4">
                    {s.process.map((step, j) => (
                      <li key={j} className="relative border-l border-line pb-8 pl-6 sm:pb-6 xl:border-t xl:border-l-0 xl:pt-6 xl:pr-4 xl:pl-0">
                        <span aria-hidden className="absolute top-0 -left-[5px] size-[9px] rotate-45 border border-accent bg-bg xl:-top-[5px] xl:left-0" />
                        <p className="font-mono text-xs text-subtle">{t("step", { n: j + 1 })}</p>
                        <p className="mt-1 font-display text-lg text-fg">{tr(step.title, locale)}</p>
                        <p className="mt-1 text-sm text-muted">{tr(step.text, locale)}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

      <section className="section-y">
        <div className="container-site flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between" data-reveal>
          <div className="max-w-2xl">
            <h2 className="text-h2">{t("ctaTitle")}</h2>
            <p className="mt-4 text-lead text-muted">{t("ctaText")}</p>
          </div>
          <Link href={settings.features.quotes ? "/quote" : "/contact"} className={buttonClasses({ size: "lg" })}>
            {settings.features.quotes ? tc("requestQuote") : tc("contactMe")} <ArrowIcon />
          </Link>
        </div>
      </section>
    </>
  );
}
