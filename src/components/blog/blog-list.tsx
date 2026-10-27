import { getTranslations } from "next-intl/server";
import { PostRow } from "@/components/sections/home-sections";
import { EmptyState } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { readingTime, tr } from "@/lib/i18n-utils";
import type { Category, Locale, Post, Tag } from "@/lib/types";
import { BlogExplorer } from "./blog-explorer";
import { NewsletterForm } from "./newsletter-form";

/** Liste du blog partagée par /blog, /blog/categorie/[slug] et /blog/tag/[slug]. */
export async function BlogList({
  posts,
  categories,
  tags,
  locale,
  activeCategory,
  activeTag,
  newsletter,
}: {
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  locale: Locale;
  activeCategory?: string;
  activeTag?: string;
  newsletter: boolean;
}) {
  const [t, tc] = await Promise.all([getTranslations("blog"), getTranslations("common")]);
  const usedCategories = categories.filter((c) => posts.some((p) => p.category?.id === c.id) || c.slug === activeCategory);
  const chip = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center rounded-full border px-4 text-sm transition-colors",
      active ? "border-accent bg-accent text-accent-contrast" : "border-line text-muted hover:border-fg hover:text-fg",
    );

  const items = posts.map((p) => ({
    slug: p.slug,
    haystack: [tr(p.title, locale), tr(p.excerpt, locale), p.category ? tr(p.category.name, locale) : "", ...p.tags.map((tg) => tr(tg.name, locale))].join(" "),
  }));
  const rows = Object.fromEntries(
    posts.map((p) => [p.slug, <PostRow key={p.slug} post={p} locale={locale} minRead={tc("minRead", { count: readingTime(tr(p.content, locale)) })} />]),
  );

  return (
    <div className="container-site grid gap-14 py-12 md:py-16 lg:grid-cols-12">
      <div className="lg:col-span-8">
        {posts.length ? <BlogExplorer items={items} rows={rows} /> : <EmptyState title={t("empty")} />}
      </div>
      <aside className="grid content-start gap-10 lg:col-span-4">
        <nav aria-labelledby="blog-categories">
          <h2 id="blog-categories" className="layer-label mb-4">
            {t("categories")}
          </h2>
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link href="/blog" className={chip(!activeCategory && !activeTag)} aria-current={!activeCategory && !activeTag ? "page" : undefined}>
                {t("allCategories")}
              </Link>
            </li>
            {usedCategories.map((c) => (
              <li key={c.id}>
                <Link href={{ pathname: "/blog/category/[slug]", params: { slug: c.slug } }} className={chip(activeCategory === c.slug)} aria-current={activeCategory === c.slug ? "page" : undefined}>
                  {tr(c.name, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {tags.length > 0 && (
          <nav aria-labelledby="blog-tags">
            <h2 id="blog-tags" className="layer-label mb-4">
              {t("tags")}
            </h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-sm">
              {tags.map((tg) => (
                <li key={tg.id}>
                  <Link
                    href={{ pathname: "/blog/tag/[slug]", params: { slug: tg.slug } }}
                    aria-current={activeTag === tg.slug ? "page" : undefined}
                    className={cn("transition-colors hover:text-fg", activeTag === tg.slug ? "text-accent-ink" : "text-muted")}
                  >
                    #{tr(tg.name, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <a href={`/${locale}/rss.xml`} className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-fg">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
            <path d="M3 3a10 10 0 0 1 10 10M3 7a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="4" cy="12" r="1.3" fill="currentColor" />
          </svg>
          {t("rss")}
        </a>
        {newsletter && <NewsletterForm />}
      </aside>
    </div>
  );
}
