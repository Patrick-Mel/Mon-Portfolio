import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCategories, getPosts, getProjects, getSettings, getTags } from "@/lib/data/content";

type Href = Parameters<typeof getPathname>[0]["href"];

export const revalidate = 3600;

/** Plan du site dynamique : chaque URL avec ses alternatives hreflang. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, projects, posts, categories, tags] = await Promise.all([
    getSettings(),
    getProjects(),
    getPosts(),
    getCategories(),
    getTags(),
  ]);

  const entry = (href: Href, opts: { lastModified?: string; priority?: number } = {}) => {
    const languages = Object.fromEntries(
      routing.locales.map((l) => [l, `${settings.siteUrl}${getPathname({ locale: l, href })}`]),
    );
    return routing.locales.map((locale) => ({
      url: `${settings.siteUrl}${getPathname({ locale, href })}`,
      lastModified: opts.lastModified ? new Date(opts.lastModified) : undefined,
      priority: opts.priority,
      alternates: { languages },
    }));
  };

  const staticPages: Href[] = ["/", "/skills", "/services", "/projects", "/journey", "/contact", "/legal-notice", "/privacy"];
  if (settings.features.quotes) staticPages.push("/quote");
  if (settings.features.blog) staticPages.push("/blog");

  return [
    ...staticPages.flatMap((h) => entry(h, { priority: h === "/" ? 1 : 0.7 })),
    ...projects.flatMap((p) =>
      entry({ pathname: "/projects/[slug]", params: { slug: p.slug } }, { lastModified: p.updatedAt, priority: 0.8 }),
    ),
    ...(settings.features.blog
      ? [
          ...posts.flatMap((p) =>
            entry({ pathname: "/blog/[slug]", params: { slug: p.slug } }, { lastModified: p.updatedAt, priority: 0.6 }),
          ),
          ...categories.flatMap((c) => entry({ pathname: "/blog/category/[slug]", params: { slug: c.slug } }, { priority: 0.4 })),
          ...tags.flatMap((tg) => entry({ pathname: "/blog/tag/[slug]", params: { slug: tg.slug } }, { priority: 0.3 })),
        ]
      : []),
  ];
}
