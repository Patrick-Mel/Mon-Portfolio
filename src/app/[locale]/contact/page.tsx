import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/forms/contact-form";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { getSettings } from "@/lib/data/content";
import { tr } from "@/lib/i18n-utils";
import { resolveLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import { SOCIAL_LABELS } from "@/lib/socials";
import type { SocialKey } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [settings, t] = await Promise.all([getSettings(), getTranslations("contact")]);
  return pageMetadata({ settings, locale, href: "/contact", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const locale = await resolveLocale(params);
  const [settings, t, tc] = await Promise.all([getSettings(), getTranslations("contact"), getTranslations("common")]);
  const socials = Object.entries(settings.socials).filter(([, url]) => !!url) as [SocialKey, string][];

  const channels = [
    { label: t("email"), value: settings.contactEmail, href: `mailto:${settings.contactEmail}` },
    settings.phone && { label: t("phone"), value: settings.phone, href: `tel:${settings.phone.replace(/[^\d+]/g, "")}` },
    settings.whatsapp && { label: t("whatsapp"), value: `+${settings.whatsapp}`, href: `https://wa.me/${settings.whatsapp}`, external: true },
    { label: t("location"), value: tr(settings.location, locale) },
  ].filter(Boolean) as { label: string; value: string; href?: string; external?: boolean }[];

  return (
    <>
      <PageHeader layer={t("layer")} title={t("title")} intro={t("intro")} />
      <div className="container-site grid gap-14 py-14 md:py-20 lg:grid-cols-12">
        <section aria-labelledby="contact-form-title" className="lg:col-span-7">
          <h2 id="contact-form-title" className="sr-only">
            {t("form.title")}
          </h2>
          <ContactForm />
        </section>

        <aside className="grid content-start gap-8 lg:col-span-4 lg:col-start-9">
          <div>
            <h2 className="layer-label mb-5">{t("channels")}</h2>
            <dl className="divide-y divide-line border-y border-line">
              {channels.map((c) => (
                <div key={c.label} className="grid gap-1 py-4">
                  <dt className="font-mono text-xs text-subtle">{c.label}</dt>
                  <dd>
                    {c.href ? (
                      <a
                        href={c.href}
                        {...(c.external && { target: "_blank", rel: "noopener noreferrer" })}
                        className="break-all text-fg link-underline hover:text-accent-ink"
                      >
                        {c.value}
                        {c.external && <span className="sr-only"> {tc("external")}</span>}
                      </a>
                    ) : (
                      <span className="text-fg">{c.value}</span>
                    )}
                  </dd>
                </div>
              ))}
              {socials.length > 0 && (
                <div className="grid gap-2 py-4">
                  <dt className="font-mono text-xs text-subtle">{t("socials")}</dt>
                  <dd className="flex flex-wrap gap-x-5 gap-y-2">
                    {socials.map(([k, url]) => (
                      <a key={k} href={url} target="_blank" rel="noopener noreferrer me" className="text-fg link-underline hover:text-accent-ink">
                        {SOCIAL_LABELS[k]} <span aria-hidden>↗</span>
                        <span className="sr-only"> {tc("external")}</span>
                      </a>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {settings.features.quotes && (
            <div className="chamfer bg-accent-soft p-6">
              <p className="font-display text-xl tracking-tight text-fg">{t("quoteTeaser")}</p>
              <p className="mt-2 text-sm text-muted">{t("quoteTeaserText")}</p>
              <Link href="/quote" className={buttonClasses({ size: "sm", className: "mt-5" })}>
                {tc("requestQuote")} <ArrowIcon />
              </Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
