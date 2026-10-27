import { getTranslations } from "next-intl/server";
import { getProject, getSettings } from "@/lib/data/content";
import { tr } from "@/lib/i18n-utils";
import { OG_SIZE, renderOg } from "@/lib/og";
import type { Locale } from "@/lib/types";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Project";

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = (raw === "en" ? "en" : "fr") as Locale;
  const [settings, project, t] = await Promise.all([getSettings(), getProject(slug), getTranslations({ locale, namespace: "projects" })]);
  return renderOg({
    settings,
    eyebrow: project ? `${t(`categories.${project.category}`)} · ${project.year}` : t("title"),
    title: project ? tr(project.title, locale) : t("title"),
    subtitle: project?.stack.slice(0, 5).join(" · "),
  });
}
