import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import {
  AboutSection,
  BlogPreview,
  FinalCta,
  ProjectsPreview,
  ServicesPreview,
  SkillsPreview,
} from "@/components/sections/home-sections";
import {
  getKeyFigures,
  getPosts,
  getProjects,
  getServices,
  getSettings,
  getSkills,
  getTimeline,
} from "@/lib/data/content";
import { tr } from "@/lib/i18n-utils";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import { educationSummary } from "@/lib/timeline";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const settings = await getSettings();
  return {
    ...pageMetadata({ settings, locale, href: "/" }),
    title: { absolute: `${settings.ownerName} — ${tr(settings.seoTitle, locale)}` },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const [settings, figures, services, projects, skills, posts, timeline] = await Promise.all([
    getSettings(),
    getKeyFigures(),
    getServices(),
    getProjects(),
    getSkills(),
    getPosts(),
    getTimeline(),
  ]);

  return (
    <>
      <Hero settings={settings} locale={locale} />
      <AboutSection settings={settings} figures={figures} education={educationSummary(timeline)} locale={locale} />
      <ServicesPreview services={services} locale={locale} />
      <ProjectsPreview projects={projects} locale={locale} />
      <SkillsPreview skills={skills} locale={locale} />
      {settings.features.blog && <BlogPreview posts={posts} locale={locale} />}
      <FinalCta settings={settings} locale={locale} />
    </>
  );
}
