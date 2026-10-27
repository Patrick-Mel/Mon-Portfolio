import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buttonClasses } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/primitives";
import { getSettings, getTimeline } from "@/lib/data/content";
import { formatMonth, tr } from "@/lib/i18n-utils";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import type { Locale, TimelineEntry } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/[locale]/journey">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [settings, t] = await Promise.all([getSettings(), getTranslations("journey")]);
  return pageMetadata({ settings, locale, href: "/journey", title: t("metaTitle"), description: t("metaDescription") });
}

function Timeline({ entries, locale, present }: { entries: TimelineEntry[]; locale: Locale; present: string }) {
  return (
    <ol className="relative border-l border-line">
      {entries.map((e, i) => (
        <li key={e.id} className="relative pb-12 pl-8 last:pb-0 md:pl-12" data-reveal style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}>
          <span aria-hidden className="absolute top-1.5 -left-[6px] size-[11px] rotate-45 border border-accent bg-bg" />
          <p className="font-mono text-xs text-subtle">
            <time dateTime={e.startDate}>{formatMonth(e.startDate, locale)}</time> —{" "}
            {e.endDate ? <time dateTime={e.endDate}>{formatMonth(e.endDate, locale)}</time> : present}
          </p>
          <h3 className="mt-2 font-display text-xl tracking-tight text-fg md:text-2xl">{tr(e.title, locale)}</h3>
          <p className="mt-1 text-sm font-medium text-accent-ink">
            {e.organization}
            {e.location && <span className="text-subtle"> · {e.location}</span>}
          </p>
          <p className="mt-3 max-w-2xl text-muted">{tr(e.description, locale)}</p>
        </li>
      ))}
    </ol>
  );
}

export default async function JourneyPage({ params }: PageProps<"/[locale]/journey">) {
  const locale = await resolveLocale(params);
  const [settings, timeline, t] = await Promise.all([getSettings(), getTimeline(), getTranslations("journey")]);
  const education = timeline.filter((e) => e.kind === "education");
  const experience = timeline.filter((e) => e.kind === "experience");
  const cv = {
    fr: settings.cvUrl.fr || "/cv/cv-fr.pdf",
    en: settings.cvUrl.en || "/cv/cv-en.pdf",
  };

  return (
    <>
      <PageHeader layer={t("layer")} title={t("title")} intro={t("intro")} />
      <div className="container-site grid gap-16 py-14 md:py-20 lg:grid-cols-12">
        <div className="grid gap-16 lg:col-span-8">
          {education.length > 0 && (
            <section aria-labelledby="edu-title">
              <h2 id="edu-title" className="layer-label mb-8">
                {t("education")}
              </h2>
              <Timeline entries={education} locale={locale} present={t("present")} />
            </section>
          )}
          {experience.length > 0 && (
            <section aria-labelledby="exp-title">
              <h2 id="exp-title" className="layer-label mb-8">
                {t("experience")}
              </h2>
              <Timeline entries={experience} locale={locale} present={t("present")} />
            </section>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="chamfer sticky top-[calc(var(--header-h)+2rem)] bg-surface p-8 ring-1 ring-line ring-inset" data-reveal>
            <svg viewBox="0 0 48 60" width="40" height="50" aria-hidden className="text-accent-ink">
              <path d="M4 2h28l12 12v44H4z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M32 2v12h12M12 28h24M12 36h24M12 44h16" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            <h2 className="mt-6 font-display text-2xl tracking-tight">{t("cvTitle")}</h2>
            <p className="mt-2 text-muted">{t("cvText")}</p>
            <div className="mt-8 grid gap-3">
              <a href={cv[locale]} download hrefLang={locale} className={buttonClasses({ className: "w-full" })}>
                {locale === "fr" ? t("cvFr") : t("cvEn")}
              </a>
              <a href={cv[locale === "fr" ? "en" : "fr"]} download hrefLang={locale === "fr" ? "en" : "fr"} className={buttonClasses({ variant: "secondary", className: "w-full" })}>
                {locale === "fr" ? t("cvEn") : t("cvFr")}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
