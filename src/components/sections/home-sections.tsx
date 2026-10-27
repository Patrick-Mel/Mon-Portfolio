import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Monogram } from "@/components/brand/monogram";
import { ProjectCard } from "@/components/projects/project-card";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SectionHeader } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { cvHref } from "@/lib/cv";
import { formatDate, readingTime, tr } from "@/lib/i18n-utils";
import { SKILL_CATEGORIES, type KeyFigure, type Locale, type Post, type Project, type Service, type SiteSettings, type Skill } from "@/lib/types";
import { LevelMeter } from "@/components/skills/level-meter";

/* ---------- Portrait (ou emplacement élégant en attendant la photo) ---------- */
export function Portrait({ settings, className }: { settings: SiteSettings; className?: string }) {
  return (
    <div className={cn("chamfer relative aspect-[4/5] overflow-hidden bg-surface-2", className)}>
      {settings.avatarUrl ? (
        <Image src={settings.avatarUrl} alt={settings.ownerName} fill sizes="(min-width: 768px) 30vw, 80vw" className="object-cover" />
      ) : (
        <div className="bg-dots absolute inset-0 grid place-items-center">
          <Monogram initials={settings.initials} size={120} className="text-fg/80" />
        </div>
      )}
      <span aria-hidden className="absolute right-0 bottom-0 size-3 bg-accent" />
    </div>
  );
}

/* ---------- Présentation + chiffres clés ---------- */
export async function AboutSection({
  settings,
  figures,
  education,
  locale,
}: {
  settings: SiteSettings;
  figures: KeyFigure[];
  /** Ex. « IAI Cameroun · 2023 — 2026 », calculé depuis le parcours. */
  education: string | null;
  locale: Locale;
}) {
  const t = await getTranslations("home.about");
  return (
    <section aria-labelledby="about-title" className="section-y">
      <div className="container-site">
        <SectionHeader layer={t("layer")} title={t("title")} id="about-title" />
        <div className="mt-14 grid gap-12 md:grid-cols-12">
          <Portrait settings={settings} className="max-w-xs md:col-span-4 md:max-w-none" />
          <div className="md:col-span-7 md:col-start-6" data-reveal>
            <p className="text-lead text-fg">{tr(settings.about, locale)}</p>
            <dl className="mt-10 grid gap-6 border-t border-line pt-8 sm:grid-cols-2">
              {education && (
                <div>
                  <dt className="layer-label">{t("school")}</dt>
                  <dd className="mt-2 text-fg">{education}</dd>
                </div>
              )}
              <div>
                <dt className="layer-label">{t("location")}</dt>
                <dd className="mt-2 text-fg">{tr(settings.location, locale)}</dd>
              </div>
            </dl>
            <Link href="/journey" className="group/btn mt-10 inline-flex items-center gap-2 font-medium text-accent-ink link-underline">
              {t("more")} <ArrowIcon />
            </Link>
          </div>
        </div>

        {figures.length > 0 && (
          <dl className="mt-20 grid grid-cols-2 border-y border-line lg:grid-cols-4">
            {figures.map((f, i) => (
              <div
                key={f.id}
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}
                className={cn("flex flex-col-reverse py-8 pr-4", i % 2 === 1 && "border-l border-line pl-6", i >= 2 && "border-t border-line lg:border-t-0", i > 0 && "lg:border-l lg:pl-6")}
              >
                <dt className="mt-3 max-w-[22ch] text-sm text-muted">{tr(f.label, locale)}</dt>
                <dd className="font-display text-[clamp(2.75rem,5vw,4.25rem)] leading-none font-semibold tracking-tight text-fg">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

/* ---------- Services : liste éditoriale numérotée ---------- */
export async function ServicesPreview({ services, locale }: { services: Service[]; locale: Locale }) {
  const t = await getTranslations("home.services");
  return (
    <section aria-labelledby="services-title" className="section-y border-t border-line bg-surface">
      <div className="container-site">
        <SectionHeader
          layer={t("layer")}
          title={t("title")}
          intro={t("intro")}
          id="services-title"
          action={
            <Link href="/services" className={buttonClasses({ variant: "secondary" })}>
              {t("all")} <ArrowIcon />
            </Link>
          }
        />
        <ol className="mt-14 border-t border-line">
          {services.map((s, i) => (
            <li key={s.id} data-reveal style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}>
              <Link
                href={{ pathname: "/services", hash: s.slug }}
                className="group/btn grid grid-cols-[auto_1fr_auto] items-start gap-x-5 gap-y-2 border-b border-line py-7 transition-colors md:grid-cols-[4rem_minmax(0,5fr)_minmax(0,6fr)_auto] md:items-center md:gap-x-8"
              >
                <span className="pt-1 font-mono text-xs text-subtle md:pt-0">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex items-center gap-4">
                  <Icon name={s.icon} className="hidden text-accent-ink md:block" size={22} />
                  <span className="font-display text-xl tracking-tight text-fg transition-colors group-hover/btn:text-accent-ink md:text-2xl">
                    {tr(s.title, locale)}
                  </span>
                </span>
                <span className="col-start-2 text-muted md:col-start-auto">{tr(s.summary, locale)}</span>
                <span className="col-start-3 row-start-1 grid size-10 place-items-center rounded-full border border-line text-fg transition-[background-color,border-color,color] group-hover/btn:border-accent group-hover/btn:bg-accent group-hover/btn:text-accent-contrast md:col-start-auto md:row-start-auto">
                  <ArrowIcon />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Projets mis en avant : un grand + colonnes ---------- */
export async function ProjectsPreview({ projects, locale }: { projects: Project[]; locale: Locale }) {
  const t = await getTranslations();
  const featured = (projects.filter((p) => p.featured).length ? projects.filter((p) => p.featured) : projects).slice(0, 3);
  const [lead, ...others] = featured;
  if (!lead) return null;
  return (
    <section aria-labelledby="projects-title" className="section-y">
      <div className="container-site">
        <SectionHeader
          layer={t("home.projects.layer")}
          title={t("home.projects.title")}
          intro={t("home.projects.intro")}
          id="projects-title"
          action={
            <Link href="/projects" className={buttonClasses({ variant: "secondary" })}>
              {t("home.projects.all")} <ArrowIcon />
            </Link>
          }
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 lg:row-span-2" data-reveal>
            <ProjectCard project={lead} locale={locale} categoryLabel={t(`projects.categories.${lead.category}`)} index={0} large />
          </div>
          {others.map((p, i) => (
            <div key={p.id} data-reveal style={{ ["--reveal-delay" as string]: `${(i + 1) * 90}ms` }}>
              <ProjectCard project={p} locale={locale} categoryLabel={t(`projects.categories.${p.category}`)} index={i + 1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Compétences clés par domaine ---------- */
export async function SkillsPreview({ skills, locale }: { skills: Skill[]; locale: Locale }) {
  const t = await getTranslations();
  return (
    <section aria-labelledby="skills-title" className="section-y relative overflow-hidden border-y border-line bg-inverse text-fg-inverse">
      <div aria-hidden className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(currentColor_1px,transparent_1.2px)] [background-size:22px_22px]" />
      <div className="container-site relative">
        <div className="grid gap-6 md:grid-cols-12 md:items-end" data-reveal>
          <div className="md:col-span-8">
            <p className="mb-4 flex items-center gap-3 font-mono text-xs tracking-[0.08em] uppercase opacity-70">
              <span aria-hidden className="inline-block h-px w-8 bg-accent" />
              {t("home.skills.layer")}
            </p>
            <h2 id="skills-title" className="text-h2">
              {t("home.skills.title")}
            </h2>
          </div>
          <div className="md:col-span-4 md:justify-self-end">
            <Link href="/skills" className={buttonClasses({ className: "group/btn" })}>
              {t("home.skills.all")} <ArrowIcon />
            </Link>
          </div>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-lg bg-[color-mix(in_oklab,var(--fg-inverse)_14%,transparent)] sm:grid-cols-2 lg:grid-cols-4">
          {SKILL_CATEGORIES.map((cat, i) => {
            const list = skills.filter((s) => s.category === cat && s.featured).slice(0, 4);
            return (
              <div key={cat} className="bg-inverse p-6 md:p-7" data-reveal style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}>
                <p className="font-mono text-xs opacity-60">0{i + 1}</p>
                <h3 className="mt-3 font-display text-xl">{t(`skills.categories.${cat}`)}</h3>
                <ul className="mt-6 grid gap-3">
                  {list.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 text-[0.9375rem]">
                      <span className="opacity-90">{tr(s.name, locale)}</span>
                      <LevelMeter level={s.level} label={t(`skills.levels.${s.level}`)} inverse />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Derniers articles ---------- */
export async function BlogPreview({ posts, locale }: { posts: Post[]; locale: Locale }) {
  const t = await getTranslations();
  if (!posts.length) return null;
  return (
    <section aria-labelledby="blog-title" className="section-y">
      <div className="container-site">
        <SectionHeader
          layer={t("home.blog.layer")}
          title={t("home.blog.title")}
          id="blog-title"
          action={
            <Link href="/blog" className={buttonClasses({ variant: "secondary" })}>
              {t("home.blog.all")} <ArrowIcon />
            </Link>
          }
        />
        <ul className="mt-14 border-t border-line">
          {posts.slice(0, 3).map((p, i) => (
            <li key={p.id} data-reveal style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}>
              <PostRow post={p} locale={locale} minRead={t("common.minRead", { count: readingTime(tr(p.content, locale)) })} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PostRow({ post, locale, minRead }: { post: Post; locale: Locale; minRead: string }) {
  return (
    <article className="group/btn relative grid gap-3 border-b border-line py-8 md:grid-cols-12 md:gap-8">
      <div className="flex gap-4 font-mono text-xs text-subtle md:col-span-3 md:flex-col md:gap-2">
        {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>}
        <span>{minRead}</span>
      </div>
      <div className="md:col-span-7">
        {post.category && <p className="mb-2 font-mono text-xs text-accent-ink">{tr(post.category.name, locale)}</p>}
        <h3 className="font-display text-xl tracking-tight text-fg md:text-2xl">
          <Link href={{ pathname: "/blog/[slug]", params: { slug: post.slug } }} className="after:absolute after:inset-0 after:content-[''] group-hover/btn:text-accent-ink">
            {tr(post.title, locale)}
          </Link>
        </h3>
        <p className="mt-3 text-muted">{tr(post.excerpt, locale)}</p>
      </div>
      <div className="hidden justify-self-end md:col-span-2 md:block">
        <span className="grid size-10 place-items-center rounded-full border border-line transition-colors group-hover/btn:border-accent group-hover/btn:bg-accent group-hover/btn:text-accent-contrast">
          <ArrowIcon />
        </span>
      </div>
    </article>
  );
}

/* ---------- Appel à l'action final ---------- */
export async function FinalCta({ settings, locale }: { settings: SiteSettings; locale: Locale }) {
  const t = await getTranslations();
  return (
    <section aria-labelledby="cta-title" className="pb-[var(--section-y)]">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-xl border border-line bg-surface px-6 py-14 md:px-14 md:py-20" data-reveal>
          <div aria-hidden className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
          <svg aria-hidden viewBox="0 0 200 200" className="absolute -top-10 -right-10 w-64 text-accent opacity-90 md:w-80">
            <g fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="100" cy="100" r="30" />
              <circle cx="100" cy="100" r="60" strokeDasharray="3 6" />
              <circle cx="100" cy="100" r="90" strokeDasharray="1 8" />
            </g>
            <rect x="94" y="94" width="12" height="12" fill="currentColor" />
          </svg>
          <div className="relative max-w-3xl">
            <p className="layer-label mb-5 flex items-center gap-3">
              <span aria-hidden className="inline-block h-px w-8 bg-accent" />
              {t("home.cta.layer")}
            </p>
            <h2 id="cta-title" className="text-h1">
              {t("home.cta.title")}
            </h2>
            <p className="mt-6 max-w-xl text-lead text-muted">{t("home.cta.text")}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              {settings.features.quotes && (
                <Link href="/quote" className={buttonClasses({ size: "lg" })}>
                  {t("home.cta.quote")} <ArrowIcon />
                </Link>
              )}
              <Link href="/contact" className={buttonClasses({ size: "lg", variant: "secondary" })}>
                {t("home.cta.contact")}
              </Link>
              <a href={cvHref(settings, locale)} download className={buttonClasses({ size: "lg", variant: "ghost" })}>
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
                  <path d="M8 2v8M4.5 7 8 10.5 11.5 7M3 13.5h10" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                {t("common.downloadCv")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
