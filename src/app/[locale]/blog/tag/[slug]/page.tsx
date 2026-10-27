import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BlogList } from "@/components/blog/blog-list";
import { PageHeader } from "@/components/ui/primitives";
import { routing } from "@/i18n/routing";
import { getCategories, getPosts, getSettings, getTags } from "@/lib/data/content";
import { tr } from "@/lib/i18n-utils";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const tags = await getTags();
  return routing.locales.flatMap((locale) => tags.map((tg) => ({ locale, slug: tg.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/tag/[slug]">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const [settings, tags, t] = await Promise.all([getSettings(), getTags(), getTranslations("blog")]);
  const tag = tags.find((tg) => tg.slug === slug);
  if (!tag) return {};
  return pageMetadata({
    settings,
    locale,
    href: { pathname: "/blog/tag/[slug]", params: { slug } },
    title: t("tagTitle", { name: tr(tag.name, locale) }),
    description: t("metaDescription"),
  });
}

export default async function TagPage({ params }: PageProps<"/[locale]/blog/tag/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const [settings, posts, categories, tags, t] = await Promise.all([
    getSettings(),
    getPosts(),
    getCategories(),
    getTags(),
    getTranslations("blog"),
  ]);
  const tag = tags.find((tg) => tg.slug === slug);
  if (!settings.features.blog || !tag) notFound();
  const filtered = posts.filter((p) => p.tags.some((pt) => pt.id === tag.id));
  const usedTags = tags.filter((tg) => posts.some((p) => p.tags.some((pt) => pt.id === tg.id)));

  return (
    <>
      <PageHeader layer={t("layer")} title={t("tagTitle", { name: tr(tag.name, locale) })} />
      <BlogList posts={filtered} categories={categories} tags={usedTags} locale={locale} activeTag={slug} newsletter={settings.features.newsletter} />
    </>
  );
}
