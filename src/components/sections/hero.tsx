import { getTranslations } from "next-intl/server";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { HeroTopology } from "@/components/visuals/hero-topology";
import { Link } from "@/i18n/navigation";
import { tr } from "@/lib/i18n-utils";
import type { Locale, SiteSettings } from "@/lib/types";

export async function Hero({ settings, locale }: { settings: SiteSettings; locale: Locale }) {
  const t = await getTranslations();
  const [first, ...rest] = settings.ownerName.split(" ");
  const roles = tr(settings.role, locale).split("·").map((r) => r.trim());

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="container-site grid gap-12 pt-12 pb-16 md:pt-20 lg:grid-cols-12 lg:gap-8 lg:pb-24">
        <div className="lg:col-span-7 lg:pt-8">
          <p className="mb-8 inline-flex items-center gap-3 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-xs text-muted">
            <span aria-hidden className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            {t("home.hero.status")} · {tr(settings.location, locale)}
          </p>

          <h1 className="text-display font-bold">
            <span className="block font-sans text-lead font-normal tracking-normal text-muted">
              {t("home.hero.greeting")}
            </span>
            <span className="mt-3 block">{first}</span>
            {rest.length > 0 && (
              <span className="block">
                {rest.join(" ")}
                <span aria-hidden className="text-accent">
                  .
                </span>
              </span>
            )}
          </h1>

          <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-2 font-mono text-[0.8125rem] text-fg" aria-label={tr(settings.role, locale)}>
            {roles.map((r, i) => (
              <li key={r} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden className="size-1 rotate-45 bg-accent" />}
                {r}
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-xl text-lead text-muted">{tr(settings.heroIntro, locale)}</p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/projects" className={buttonClasses({ size: "lg" })}>
              {t("common.seeProjects")} <ArrowIcon />
            </Link>
            <Link
              href={settings.features.quotes ? "/quote" : "/contact"}
              className={buttonClasses({ size: "lg", variant: "secondary" })}
            >
              {settings.features.quotes ? t("common.requestQuote") : t("common.contactMe")}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          <HeroTopology label={t("home.hero.diagramLabel")} />
          <p className="mt-2 text-right font-mono text-[0.6875rem] tracking-wider text-subtle uppercase">
            {tr(settings.tagline, locale)}
          </p>
        </div>
      </div>
    </section>
  );
}
