import { defineRouting } from "next-intl/routing";
import { LOCALES } from "@/lib/types";

/**
 * Routes publiques localisées. Les dossiers de `src/app/[locale]` portent les
 * noms internes (anglais) ; chaque langue expose ses propres chemins.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: "fr",
  localePrefix: "always",
  // Détection via Accept-Language uniquement : aucun cookie de langue n'est déposé.
  localeCookie: false,
  pathnames: {
    "/": "/",
    "/skills": { fr: "/competences", en: "/skills" },
    "/services": "/services",
    "/projects": { fr: "/projets", en: "/projects" },
    "/projects/[slug]": { fr: "/projets/[slug]", en: "/projects/[slug]" },
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/blog/category/[slug]": { fr: "/blog/categorie/[slug]", en: "/blog/category/[slug]" },
    "/blog/tag/[slug]": "/blog/tag/[slug]",
    "/contact": "/contact",
    "/quote": { fr: "/devis", en: "/quote" },
    "/journey": { fr: "/parcours", en: "/journey" },
    "/legal-notice": { fr: "/mentions-legales", en: "/legal-notice" },
    "/privacy": { fr: "/confidentialite", en: "/privacy" },
    "/newsletter/[status]": "/newsletter/[status]",
  },
});

export type AppPathname = keyof typeof routing.pathnames;
