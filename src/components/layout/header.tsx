import { getTranslations } from "next-intl/server";
import { Monogram } from "@/components/brand/monogram";
import { buttonClasses } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale, SiteSettings } from "@/lib/types";
import { LocaleSwitcher, MobileMenu, NavLinks, type NavItem } from "./nav";
import { ThemeToggle } from "./theme";

export async function buildNavItems(settings: SiteSettings): Promise<NavItem[]> {
  const t = await getTranslations("nav");
  const items: (NavItem | false)[] = [
    { href: "/skills", label: t("skills") },
    { href: "/services", label: t("services") },
    { href: "/projects", label: t("projects") },
    settings.features.blog && { href: "/blog", label: t("blog") },
    { href: "/journey", label: t("journey") },
    { href: "/contact", label: t("contact") },
  ];
  return items.filter(Boolean) as NavItem[];
}

export async function Header({ settings, locale }: { settings: SiteSettings; locale: Locale }) {
  const t = await getTranslations();
  const items = await buildNavItems(settings);
  const localeLabels = {
    language: t("nav.language"),
    names: { fr: t("languages.fr"), en: t("languages.en") },
    switchTo: {
      fr: t("nav.switchTo", { language: t("languages.fr") }),
      en: t("nav.switchTo", { language: t("languages.en") }),
    },
  };
  const themeLabels = { toLight: t("theme.toLight"), toDark: t("theme.toDark") };

  return (
    <header className="sticky top-0 z-50 h-[var(--header-h)] border-b border-line/70 bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
      <div className="container-site flex h-full items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3 rounded-sm" aria-label={`${settings.brandName} — ${t("meta.home")}`}>
          <Monogram initials={settings.initials} size={34} className="transition-transform duration-500 ease-signal group-hover:rotate-90" />
          <span className="hidden font-display text-[1.05rem] font-semibold tracking-tight sm:inline">
            {settings.brandName}
          </span>
        </Link>

        <nav aria-label={t("meta.mainNav")} className="hidden md:block">
          <NavLinks items={items} />
        </nav>

        <div className="flex items-center gap-1">
          <LocaleSwitcher labels={localeLabels} />
          <ThemeToggle labels={themeLabels} />
          {settings.features.quotes && (
            <span className="ml-2 hidden lg:block">
              <Link href="/quote" className={buttonClasses({ size: "sm" })}>
                {t("common.requestQuote")}
              </Link>
            </span>
          )}
          <MobileMenu
            items={settings.features.quotes ? [...items, { href: "/quote", label: t("nav.quote") }] : items}
            labels={{ open: t("nav.openMenu"), close: t("nav.closeMenu"), nav: t("meta.mainNav") }}
            footer={
              <p className="font-mono text-xs text-subtle">
                {settings.contactEmail} · {locale.toUpperCase()}
              </p>
            }
          />
        </div>
      </div>
    </header>
  );
}
