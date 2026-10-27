import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CommentForm } from "@/components/blog/comment-form";
import { NewsletterForm } from "@/components/blog/newsletter-form";
import { ShareButtons } from "@/components/blog/share";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PostRow } from "@/components/sections/home-sections";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getApprovedComments, getPost, getPosts, getSettings } from "@/lib/data/content";
import { formatDate, readingTime, tr } from "@/lib/i18n-utils";
import { articleJsonLd, breadcrumbJsonLd, JsonLd } from "@/lib/jsonld";
import { resolveLocale } from "@/lib/locale";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const posts = await getPosts();
  return routing.locales.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const [settings, post] = await Promise.all([getSettings(), getPost(slug)]);
  if (!post) return {};
  return pageMetadata({
    settings,
    locale,
    href: { pathname: "/blog/[slug]", params: { slug } },
    title: tr(post.seoTitle, locale) || tr(post.title, locale),
    description: tr(post.seoDescription, locale) || tr(post.excerpt, locale),
    type: "article",
    publishedTime: post.publishedAt ?? undefined,
    modifiedTime: post.updatedAt,
    tags: post.tags.map((t) => tr(t.name, locale)),
    image: post.coverUrl,
  });
}

export default async function PostPage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const [settings, posts, t, tn, tc] = await Promise.all([
    getSettings(),
    getPosts(),
    getTranslations("blog"),
    getTranslations("nav"),
    getTranslations("common"),
  ]);
  const post = posts.find((p) => p.slug === slug);
  if (!settings.features.blog || !post) notFound();

  const content = tr(post.content, locale);
  const [{ html, toc }, comments] = await Promise.all([
    renderMarkdown(content),
    settings.features.comments ? getApprovedComments(post.id) : Promise.resolve([]),
  ]);
  const title = tr(post.title, locale);
  const url = absoluteUrl(settings, locale, { pathname: "/blog/[slug]", params: { slug } });

  const related = posts
    .filter((p) => p.id !== post.id)
    .map((p) => ({
      p,
      score: (p.category?.id === post.category?.id ? 2 : 0) + p.tags.filter((tg) => post.tags.some((x) => x.id === tg.id)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.p);

  return (
    <article>
      <JsonLd
        data={[
          articleJsonLd(settings, post, locale, url),
          breadcrumbJsonLd([
            { name: tn("home"), url: absoluteUrl(settings, locale, "/") },
            { name: tn("blog"), url: absoluteUrl(settings, locale, "/blog") },
            { name: title, url },
          ]),
        ]}
      />
      <header className="border-b border-line">
        <div className="container-site pt-10 pb-12 md:pt-14 md:pb-16">
          <Breadcrumb items={[{ label: tn("home"), href: "/" }, { label: tn("blog"), href: "/blog" }, { label: title }]} />
          <div className="mt-10 max-w-4xl">
            {post.category && (
              <Link
                href={{ pathname: "/blog/category/[slug]", params: { slug: post.category.slug } }}
                className="font-mono text-xs text-accent-ink hover:underline"
              >
                {tr(post.category.name, locale)}
              </Link>
            )}
            <h1 className="mt-4 text-h1">{title}</h1>
            <p className="mt-6 text-lead text-muted">{tr(post.excerpt, locale)}</p>
            <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-subtle">
              <span>{settings.ownerName}</span>
              <span aria-hidden>·</span>
              {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>}
              <span aria-hidden>·</span>
              <span>{tc("minRead", { count: readingTime(content) })}</span>
            </p>
          </div>
        </div>
      </header>

      {post.coverUrl && (
        <div className="container-site mt-10">
          <div className="relative aspect-[2/1] overflow-hidden rounded-lg border border-line">
            <Image src={post.coverUrl} alt="" fill priority sizes="(min-width: 1400px) 1400px, 100vw" className="object-cover" />
          </div>
        </div>
      )}

      <div className="container-site grid gap-12 py-12 md:py-16 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <div className="prose-signal" dangerouslySetInnerHTML={{ __html: html }} />

          {post.tags.length > 0 && (
            <ul className="mt-12 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-6 font-mono text-sm" aria-label={t("tags")}>
              {post.tags.map((tg) => (
                <li key={tg.id}>
                  <Link href={{ pathname: "/blog/tag/[slug]", params: { slug: tg.slug } }} className="text-muted hover:text-accent-ink">
                    #{tr(tg.name, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8 lg:hidden">
            <ShareButtons url={url} title={title} />
          </div>
        </div>

        <aside className="hidden lg:col-span-3 lg:col-start-10 lg:block">
          <div className="sticky top-[calc(var(--header-h)+2rem)] grid gap-10">
            {toc.length > 0 && (
              <nav aria-labelledby="toc-title">
                <p id="toc-title" className="layer-label mb-4">
                  {t("toc")}
                </p>
                <ol className="grid gap-1.5 border-l border-line text-sm">
                  {toc.map((h) => (
                    <li key={h.id} className={h.depth === 3 ? "pl-4" : undefined}>
                      <a href={`#${h.id}`} className="-ml-px block border-l border-transparent py-0.5 pl-4 text-muted transition-colors hover:border-accent hover:text-fg">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <ShareButtons url={url} title={title} />
          </div>
        </aside>
      </div>

      {settings.features.comments && (
        <section aria-labelledby="comments-title" className="border-t border-line bg-surface">
          <div className="container-site grid gap-12 py-14 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h2 id="comments-title" className="text-h3">
                {t("comments.title")} <span className="font-mono text-sm text-subtle">({comments.length})</span>
              </h2>
              {comments.length ? (
                <ol className="mt-8 grid gap-6">
                  {comments.map((c) => (
                    <li key={c.id} className="border-l-2 border-line pl-5">
                      <p className="flex flex-wrap items-baseline gap-3">
                        <span className="font-medium text-fg">{c.authorName}</span>
                        <time dateTime={c.createdAt} className="font-mono text-xs text-subtle">
                          {formatDate(c.createdAt, locale)}
                        </time>
                      </p>
                      <p className="mt-2 whitespace-pre-line text-muted">{c.content}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-6 text-muted">{t("comments.empty")}</p>
              )}
              <div className="mt-12">
                <CommentForm postId={post.id} postSlug={post.slug} />
              </div>
            </div>
          </div>
        </section>
      )}

      {(related.length > 0 || settings.features.newsletter) && (
        <section aria-labelledby="related-title" className="section-y">
          <div className="container-site grid gap-12 lg:grid-cols-12">
            {related.length > 0 && (
              <div className="lg:col-span-8">
                <h2 id="related-title" className="text-h3">
                  {t("related")}
                </h2>
                <ul className="mt-6 border-t border-line">
                  {related.map((p) => (
                    <li key={p.id}>
                      <PostRow post={p} locale={locale} minRead={tc("minRead", { count: readingTime(tr(p.content, locale)) })} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {settings.features.newsletter && (
              <div className="lg:col-span-4">
                <NewsletterForm />
              </div>
            )}
          </div>
        </section>
      )}
    </article>
  );
}
