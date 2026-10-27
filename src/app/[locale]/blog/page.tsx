import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BlogList } from "@/components/blog/blog-list";
import { PageHeader } from "@/components/ui/primitives";
import { getCategories, getPosts, getSettings, getTags } from "@/lib/data/content";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/blog">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [settings, t] = await Promise.all([getSettings(), getTranslations("blog")]);
  return pageMetadata({ settings, locale, href: "/blog", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function BlogPage({ params }: PageProps<"/[locale]/blog">) {
  const locale = await resolveLocale(params);
  const [settings, posts, categories, tags, t] = await Promise.all([
    getSettings(),
    getPosts(),
    getCategories(),
    getTags(),
    getTranslations("blog"),
  ]);
  if (!settings.features.blog) notFound();
  const usedTags = tags.filter((tg) => posts.some((p) => p.tags.some((pt) => pt.id === tg.id)));

  return (
    <>
      <PageHeader layer={t("layer")} title={t("title")} intro={t("intro")} />
      <BlogList posts={posts} categories={categories} tags={usedTags} locale={locale} newsletter={settings.features.newsletter} />
    </>
  );
}
