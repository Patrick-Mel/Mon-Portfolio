import type { Locale, SiteSettings } from "@/lib/types";

/**
 * Lien du CV : PDF téléversé depuis l'admin, sinon CV d'exemple livré dans /public/cv.
 */
export function cvHref(settings: SiteSettings, locale: Locale): string {
  return settings.cvUrl[locale] || settings.cvUrl.fr || settings.cvUrl.en || `/cv/cv-${locale}.pdf`;
}
