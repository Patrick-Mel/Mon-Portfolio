import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LevelMeter } from "@/components/skills/level-meter";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/primitives";
import { getSettings, getSkills } from "@/lib/data/content";
import { tr } from "@/lib/i18n-utils";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import { SKILL_CATEGORIES, SKILL_LEVELS } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/[locale]/skills">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [settings, t] = await Promise.all([getSettings(), getTranslations("skills")]);
  return pageMetadata({ settings, locale, href: "/skills", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function SkillsPage({ params }: PageProps<"/[locale]/skills">) {
  const locale = await resolveLocale(params);
  const [skills, t] = await Promise.all([getSkills(), getTranslations("skills")]);

  return (
    <>
      <PageHeader layer={t("layer")} title={t("title")} intro={t("intro")}>
        <dl aria-label={t("legend")} className="mt-10 grid gap-4 sm:grid-cols-3">
          {SKILL_LEVELS.map((level) => (
            <div key={level} className="flex items-start gap-3 rounded-md border border-line bg-surface p-4">
              <LevelMeter level={level} label={t(`levels.${level}`)} />
              <div>
                <dt className="font-medium text-fg">{t(`levels.${level}`)}</dt>
                <dd className="mt-1 text-sm text-muted">{t(`levelHint.${level}`)}</dd>
              </div>
            </div>
          ))}
        </dl>
      </PageHeader>

      <div className="container-site">
        {SKILL_CATEGORIES.map((cat, i) => {
          const list = skills.filter((s) => s.category === cat);
          if (!list.length) return null;
          return (
            <section key={cat} aria-labelledby={`cat-${cat}`} className="grid gap-8 border-b border-line py-14 last:border-b-0 md:grid-cols-12 md:py-20">
              <div className="md:col-span-4" data-reveal>
                <div className="md:sticky md:top-[calc(var(--header-h)+2rem)]">
                  <p className="font-mono text-xs text-accent-ink">
                    {String(i + 1).padStart(2, "0")} / {String(SKILL_CATEGORIES.length).padStart(2, "0")}
                  </p>
                  <h2 id={`cat-${cat}`} className="mt-3 text-h2">
                    {t(`categories.${cat}`)}
                  </h2>
                  <p className="mt-4 max-w-xs text-muted">{t(`categoryIntro.${cat}`)}</p>
                  <p className="mt-4 font-mono text-xs text-subtle">{t("count", { count: list.length })}</p>
                </div>
              </div>
              <ul className="grid content-start gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 md:col-span-8">
                {list.map((s, j) => (
                  <li
                    key={s.id}
                    data-reveal
                    style={{ ["--reveal-delay" as string]: `${j * 40}ms` }}
                    className="flex items-center gap-4 bg-surface p-5 transition-colors hover:bg-surface-2"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-line text-accent-ink">
                      <Icon name={s.icon} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-fg">
                        {tr(s.name, locale)}
                        {s.featured && (
                          <span title={t("featured")} className="ml-2 inline-block size-1.5 -translate-y-0.5 rotate-45 bg-accent align-middle">
                            <span className="sr-only">{t("featured")}</span>
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block">
                        <LevelMeter level={s.level} label={t(`levels.${s.level}`)} showLabel />
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
