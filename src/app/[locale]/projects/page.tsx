import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectsExplorer, type ExplorerItem } from "@/components/projects/projects-explorer";
import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { getProjects, getSettings } from "@/lib/data/content";
import { tr } from "@/lib/i18n-utils";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [settings, t] = await Promise.all([getSettings(), getTranslations("projects")]);
  return pageMetadata({ settings, locale, href: "/projects", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function ProjectsPage({ params }: PageProps<"/[locale]/projects">) {
  const locale = await resolveLocale(params);
  const [projects, t, tc] = await Promise.all([getProjects(), getTranslations("projects"), getTranslations("common")]);

  const items: ExplorerItem[] = projects.map((p) => ({
    slug: p.slug,
    category: p.category,
    title: tr(p.title, locale),
    year: p.year,
    featured: p.featured,
    sortOrder: p.sortOrder,
    haystack: [tr(p.title, locale), tr(p.summary, locale), p.stack.join(" "), t(`categories.${p.category}`)].join(" "),
  }));
  const cards = Object.fromEntries(
    projects.map((p, i) => [
      p.slug,
      <ProjectCard key={p.slug} project={p} locale={locale} categoryLabel={t(`categories.${p.category}`)} index={i} />,
    ]),
  );

  return (
    <>
      <PageHeader layer={t("layer")} title={t("title")} intro={t("intro")} />
      <div className="container-site py-12 md:py-16">
        {projects.length ? <ProjectsExplorer items={items} cards={cards} /> : <EmptyState title={tc("empty")} />}
      </div>
    </>
  );
}
