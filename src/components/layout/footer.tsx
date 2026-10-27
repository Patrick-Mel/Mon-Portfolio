import { getTranslations } from "next-intl/server";
import { Monogram } from "@/components/brand/monogram";
import { Link } from "@/i18n/navigation";
import { tr } from "@/lib/i18n-utils";
import { SOCIAL_LABELS } from "@/lib/socials";
import type { Locale, SiteSettings, SocialKey } from "@/lib/types";
import { buildNavItems } from "./header";

export async function Footer({ settings, locale }: { settings: SiteSettings; locale: Locale }) {
  const t = await getTranslations();
  const items = await buildNavItems(settings);
  const socials = Object.entries(settings.socials).filter(([, url]) => !!url) as [SocialKey, string][];
  const cv = settings.cvUrl[locale] ?? settings.cvUrl.fr;
  const linkCls = "link-underline text-muted transition-colors hover:text-fg";

  return (
    <footer className="relative mt-auto border-t border-line bg-surface">
      <div className="container-site grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <Link href="/" className="inline-flex items-center gap-3" aria-label={settings.brandName}>
            <Monogram initials={settings.initials} size={40} />
            <span className="font-display text-xl font-semibold tracking-tight">{settings.brandName}</span>
          </Link>
          <p className="mt-6 max-w-sm font-display text-2xl leading-tight tracking-tight text-fg">{t("footer.tagline")}</p>
          <p className="mt-4 flex items-center gap-2 text-sm text-muted">
            <span aria-hidden className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            {tr(settings.availability, locale)}
          </p>
        </div>

        <nav aria-label={t("meta.footerNav")} className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
          <div>
            <h2 className="layer-label mb-4">{t("footer.explore")}</h2>
            <ul className="grid gap-2.5 text-[0.9375rem]">
              {items.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className={linkCls}>
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="layer-label mb-4">{t("footer.work")}</h2>
            <ul className="grid gap-2.5 text-[0.9375rem]">
              {settings.features.quotes && (
                <li>
                  <Link href="/quote" className={linkCls}>
                    {t("common.requestQuote")}
                  </Link>
                </li>
              )}
              <li>
                <Link href="/contact" className={linkCls}>
                  {t("common.contactMe")}
                </Link>
              </li>
              <li>
                {cv ? (
                  <a href={cv} className={linkCls} download>
                    {t("common.downloadCv")}
                  </a>
                ) : (
                  <Link href="/journey" className={linkCls}>
                    {t("nav.journey")}
                  </Link>
                )}
              </li>
              <li>
                <a href={`mailto:${settings.contactEmail}`} className={`${linkCls} break-all`}>
                  {settings.contactEmail}
                </a>
              </li>
            </ul>
          </div>
          {socials.length > 0 && (
            <div>
              <h2 className="layer-label mb-4">{t("footer.connect")}</h2>
              <ul className="grid gap-2.5 text-[0.9375rem]">
                {socials.map(([key, url]) => (
                  <li key={key}>
                    <a href={url} target="_blank" rel="noopener noreferrer me" className={linkCls}>
                      {SOCIAL_LABELS[key]} <span aria-hidden>↗</span>
                      <span className="sr-only"> {t("common.external")}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="container-site flex flex-col gap-4 py-6 text-sm text-subtle md:flex-row md:items-center md:justify-between">
          <p>{t("footer.rights", { year: new Date().getFullYear(), name: settings.ownerName })}</p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <li>
              <Link href="/legal-notice" className={linkCls}>
                {t("footer.legalNotice")}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className={linkCls}>
                {t("footer.privacy")}
              </Link>
            </li>
            {settings.features.blog && (
              <li>
                <a href={`/${locale}/rss.xml`} className={linkCls}>
                  {t("footer.rss")}
                </a>
              </li>
            )}
            <li className="font-mono text-xs">{t("footer.noCookies")}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
