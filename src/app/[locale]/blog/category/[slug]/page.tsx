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
  const categories = await getCategories();
  return routing.locales.flatMap((locale) => categories.map((c) => ({ locale, slug: c.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/category/[slug]">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const [settings, categories, t] = await Promise.all([getSettings(), getCategories(), getTranslations("blog")]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) return {};
  return pageMetadata({
    settings,
    locale,
    href: { pathname: "/blog/category/[slug]", params: { slug } },
    title: t("categoryTitle", { name: tr(category.name, locale) }),
    description: t("metaDescription"),
  });
}

export default async function CategoryPage({ params }: PageProps<"/[locale]/blog/category/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const [settings, posts, categories, tags, t] = await Promise.all([
    getSettings(),
    getPosts(),
    getCategories(),
    getTags(),
    getTranslations("blog"),
  ]);
  const category = categories.find((c) => c.slug === slug);
  if (!settings.features.blog || !category) notFound();
  const filtered = posts.filter((p) => p.category?.id === category.id);
  const usedTags = tags.filter((tg) => posts.some((p) => p.tags.some((pt) => pt.id === tg.id)));

  return (
    <>
      <PageHeader layer={t("layer")} title={t("categoryTitle", { name: tr(category.name, locale) })} />
      <BlogList posts={filtered} categories={categories} tags={usedTags} locale={locale} activeCategory={slug} newsletter={settings.features.newsletter} />
    </>
  );
}
