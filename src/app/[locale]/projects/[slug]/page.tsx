import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ProjectCover } from "@/components/projects/project-card";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { Badge } from "@/components/ui/primitives";
import { Zoomable } from "@/components/ui/zoomable";
import { TopologyDiagram } from "@/components/visuals/topology-diagram";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getProject, getProjects, getSettings } from "@/lib/data/content";
import { tr } from "@/lib/i18n-utils";
import { breadcrumbJsonLd, JsonLd, projectJsonLd } from "@/lib/jsonld";
import { resolveLocale } from "@/lib/locale";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const projects = await getProjects();
  return routing.locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const [settings, project] = await Promise.all([getSettings(), getProject(slug)]);
  if (!project) return {};
  return pageMetadata({
    settings,
    locale,
    href: { pathname: "/projects/[slug]", params: { slug } },
    title: tr(project.title, locale),
    description: tr(project.seoDescription, locale) || tr(project.summary, locale),
    type: "article",
    modifiedTime: project.updatedAt,
    tags: project.stack,
    image: project.coverUrl,
  });
}

export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const [settings, projects, t, tn, tc] = await Promise.all([
    getSettings(),
    getProjects(),
    getTranslations("projects"),
    getTranslations("nav"),
    getTranslations("common"),
  ]);
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  if (!project) notFound();

  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const url = absoluteUrl(settings, locale, { pathname: "/projects/[slug]", params: { slug } });
  const title = tr(project.title, locale);
  const diagramImages = project.images.filter((i) => i.kind === "diagram");
  const gallery = project.images.filter((i) => i.kind === "gallery");
  const zoomLabels = { open: t("case.zoom"), close: tc("close"), zoomIn: t("case.zoomIn"), zoomOut: t("case.zoomOut"), reset: t("case.zoomReset") };

  const sections = [
    { id: "context", label: t("case.context"), body: tr(project.context, locale) },
    { id: "problem", label: t("case.problem"), body: tr(project.problem, locale) },
    { id: "solution", label: t("case.solution"), body: tr(project.solution, locale) },
    ...(project.diagrams.length || diagramImages.length ? [{ id: "diagrams", label: t("case.diagrams"), body: null }] : []),
    { id: "results", label: t("case.results"), body: tr(project.results, locale) },
    { id: "learnings", label: t("case.learnings"), body: tr(project.learnings, locale) },
    ...(gallery.length ? [{ id: "gallery", label: t("case.gallery"), body: null }] : []),
  ].filter((s) => s.body === null || s.body.trim());

  let figure = 0;

  return (
    <article>
      <JsonLd
        data={[
          projectJsonLd(settings, project, locale, url),
          breadcrumbJsonLd([
            { name: tn("home"), url: absoluteUrl(settings, locale, "/") },
            { name: tn("projects"), url: absoluteUrl(settings, locale, "/projects") },
            { name: title, url },
          ]),
        ]}
      />
      <header className="border-b border-line">
        <div className="container-site pt-10 pb-12 md:pt-14 md:pb-16">
          <Breadcrumb items={[{ label: tn("home"), href: "/" }, { label: tn("projects"), href: "/projects" }, { label: title }]} />
          <p className="mt-10 flex items-center gap-3 font-mono text-xs text-subtle">
            <span className="text-accent-ink">{t(`categories.${project.category}`)}</span>
            <span aria-hidden>·</span>
            {project.year}
          </p>
          <h1 className="mt-4 max-w-5xl text-h1">{title}</h1>
          <p className="mt-6 max-w-3xl text-lead text-muted">{tr(project.summary, locale)}</p>

          <dl className="mt-10 grid gap-6 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="layer-label">{t("case.role")}</dt>
              <dd className="mt-2 text-fg">{tr(project.role, locale)}</dd>
            </div>
            <div>
              <dt className="layer-label">{t("case.year")}</dt>
              <dd className="mt-2 text-fg">{project.year}</dd>
            </div>
            <div>
              <dt className="layer-label">{t("case.duration")}</dt>
              <dd className="mt-2 text-fg">{tr(project.duration, locale)}</dd>
            </div>
            <div>
              <dt className="layer-label">{t("case.category")}</dt>
              <dd className="mt-2 text-fg">{t(`categories.${project.category}`)}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="sr-only">{t("case.stack")}</h2>
              <ul className="flex flex-wrap gap-2" aria-label={t("case.stack")}>
                {project.stack.map((s) => (
                  <li key={s}>
                    <Badge tone="outline">{s}</Badge>
                  </li>
                ))}
              </ul>
            </div>
            {(project.githubUrl || project.demoUrl) && (
              <div className="flex flex-wrap gap-3">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "secondary", size: "sm" })}>
                    {t("case.github")} <span aria-hidden>↗</span>
                  </a>
                )}
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses({ size: "sm" })}>
                    {t("case.demo")} <span aria-hidden>↗</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sans visuel dédié, le schéma est présenté dans sa section (pas de doublon). */}
      {project.coverUrl ? (
        <div className="container-site">
          <ProjectCover project={project} locale={locale} priority className="mt-10 rounded-lg border border-line md:mt-14" sizes="(min-width: 1400px) 1400px, 100vw" />
        </div>
      ) : null}

      <div className="container-site grid gap-12 py-14 md:py-20 lg:grid-cols-12">
        <nav aria-label={t("case.onThisPage")} className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-[calc(var(--header-h)+2rem)]">
            <p className="layer-label mb-4">{t("case.onThisPage")}</p>
            <ol className="grid gap-2 border-l border-line text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="-ml-px flex gap-3 border-l border-transparent py-1 pl-4 text-muted transition-colors hover:border-accent hover:text-fg">
                    <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="grid gap-16 md:gap-20 lg:col-span-9">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-[calc(var(--header-h)+2rem)]" data-reveal>
              <h2 id={`${s.id}-h`} className="mb-6 flex items-baseline gap-4 text-h3">
                <span className="font-mono text-sm text-accent-ink">{String(i + 1).padStart(2, "0")}</span>
                {s.label}
              </h2>

              {s.body && <Markdown source={s.body} />}

              {s.id === "diagrams" && (
                <div className="grid gap-10">
                  {project.diagrams.map((d) => {
                    figure += 1;
                    return (
                      <figure key={d.id} className="overflow-hidden rounded-lg border border-line bg-surface">
                        <Zoomable title={tr(d.title, locale)} labels={zoomLabels}>
                          <div className="bg-dots overflow-x-auto p-4 md:p-8">
                            <div className="min-w-[560px]">
                              <TopologyDiagram diagram={d} locale={locale} />
                            </div>
                          </div>
                        </Zoomable>
                        <figcaption className="border-t border-line px-5 py-4 text-sm">
                          <span className="font-mono text-xs text-accent-ink">{t("case.figure", { n: figure })}</span>{" "}
                          <span className="font-medium text-fg">{tr(d.title, locale)}</span>
                          {d.caption && <span className="mt-1 block text-muted">{tr(d.caption, locale)}</span>}
                        </figcaption>
                      </figure>
                    );
                  })}
                  {diagramImages.map((img) => {
                    figure += 1;
                    return (
                      <figure key={img.id} className="overflow-hidden rounded-lg border border-line bg-surface">
                        <Zoomable title={tr(img.alt, locale)} labels={zoomLabels}>
                          <Image src={img.url} alt={tr(img.alt, locale)} width={img.width ?? 1600} height={img.height ?? 1000} sizes="(min-width: 1024px) 70vw, 100vw" className="h-auto w-full bg-white" />
                        </Zoomable>
                        <figcaption className="border-t border-line px-5 py-4 text-sm">
                          <span className="font-mono text-xs text-accent-ink">{t("case.figure", { n: figure })}</span>{" "}
                          <span className="text-muted">{tr(img.caption, locale) || tr(img.alt, locale)}</span>
                        </figcaption>
                      </figure>
                    );
                  })}
                </div>
              )}

              {s.id === "gallery" && (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {gallery.map((img, j) => (
                    <li key={img.id} className={j === 0 && gallery.length % 2 === 1 ? "sm:col-span-2" : undefined}>
                      <figure className="overflow-hidden rounded-lg border border-line">
                        <Zoomable title={tr(img.alt, locale)} labels={zoomLabels}>
                          <Image src={img.url} alt={tr(img.alt, locale)} width={img.width ?? 1600} height={img.height ?? 1000} sizes="(min-width: 640px) 50vw, 100vw" className="h-auto w-full" />
                        </Zoomable>
                        {img.caption && <figcaption className="px-4 py-3 text-sm text-muted">{tr(img.caption, locale)}</figcaption>}
                      </figure>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>

      {projects.length > 1 && prev && next && (
        <nav aria-label={t("title")} className="border-t border-line">
          <div className="container-site grid md:grid-cols-2">
            {[
              { p: prev, label: t("case.previous"), align: "" },
              { p: next, label: t("case.next"), align: "md:text-right md:border-l md:border-line" },
            ].map(({ p, label, align }) => (
              <Link
                key={label}
                href={{ pathname: "/projects/[slug]", params: { slug: p.slug } }}
                className={`group/btn block py-10 md:px-8 ${align} border-b border-line md:border-b-0`}
              >
                <span className="layer-label">{label}</span>
                <span className="mt-3 block font-display text-xl tracking-tight text-fg transition-colors group-hover/btn:text-accent-ink md:text-2xl">
                  {tr(p.title, locale)}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      )}

      <div className="container-site flex justify-center pb-16">
        <Link href="/projects" className={buttonClasses({ variant: "ghost" })}>
          {t("title")} <ArrowIcon />
        </Link>
      </div>
    </article>
  );
}
