import { getTranslations } from "next-intl/server";
import { getPost, getSettings } from "@/lib/data/content";
import { tr } from "@/lib/i18n-utils";
import { OG_SIZE, renderOg } from "@/lib/og";
import type { Locale } from "@/lib/types";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Article";

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = (raw === "en" ? "en" : "fr") as Locale;
  const [settings, post, t] = await Promise.all([getSettings(), getPost(slug), getTranslations({ locale, namespace: "blog" })]);
  return renderOg({
    settings,
    eyebrow: post?.category ? `${t("title")} · ${tr(post.category.name, locale)}` : t("title"),
    title: post ? tr(post.title, locale) : t("title"),
    subtitle: settings.ownerName,
  });
}
