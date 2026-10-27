"use client";

import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppPathname } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/types";

export interface NavItem {
  href: Extract<AppPathname, "/skills" | "/services" | "/projects" | "/blog" | "/journey" | "/contact" | "/quote">;
  label: string;
}

function useIsActive() {
  const pathname = usePathname() as string;
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ items }: { items: NavItem[] }) {
  const isActive = useIsActive();
  return (
    <ul className="flex items-center gap-1">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative rounded-sm px-3 py-2 text-[0.9375rem] transition-colors",
                active ? "text-fg" : "text-muted hover:text-fg",
              )}
            >
              {item.label}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-3 -bottom-px h-px origin-left bg-accent transition-transform duration-300 ease-signal",
                  active ? "scale-x-100" : "scale-x-0",
                )}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Lien vers la même page dans l'autre langue (fonctionne sans JavaScript, indexable). */
export function LocaleSwitcher({
  labels,
  className,
}: {
  labels: { language: string; names: Record<Locale, string>; switchTo: Record<Locale, string> };
  className?: string;
}) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();
  const other: Locale = locale === "fr" ? "en" : "fr";
  return (
    <nav aria-label={labels.language} className={className}>
      <Link
        // @ts-expect-error -- pathname interne + params courants : combinaison valide à l'exécution
        href={{ pathname, params }}
        locale={other}
        hrefLang={other}
        aria-label={labels.switchTo[other]}
        className="inline-flex h-10 items-center gap-1 rounded-sm px-2.5 font-mono text-xs tracking-wider text-muted uppercase transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <span className="text-fg">{locale}</span>
        <span aria-hidden className="text-subtle">
          /
        </span>
        <span>{other}</span>
      </Link>
    </nav>
  );
}

export function MobileMenu({
  items,
  labels,
  footer,
}: {
  items: NavItem[];
  labels: { open: string; close: string; nav: string };
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const isActive = useIsActive();
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Ferme le menu à chaque navigation (ajustement d'état pendant le rendu).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
      if (e.key === "Tab" && panelRef.current) {
        // Piège de focus dans le panneau ouvert.
        const f = panelRef.current.querySelectorAll<HTMLElement>("a, button");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <LazyMotion features={domAnimation} strict>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? labels.close : labels.open}
        onClick={() => setOpen((o) => !o)}
        className="relative z-50 grid size-10 place-items-center rounded-sm text-fg hover:bg-surface-2 md:hidden"
      >
        <span aria-hidden className="relative block h-3 w-5">
          <span
            className={cn(
              "absolute left-0 h-[1.5px] w-5 bg-current transition-transform duration-300 ease-signal",
              open ? "top-1.5 rotate-45" : "top-0",
            )}
          />
          <span
            className={cn(
              "absolute left-0 h-[1.5px] bg-current transition-all duration-300 ease-signal",
              open ? "top-1.5 w-5 -rotate-45" : "top-3 w-3",
            )}
          />
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <m.div
            ref={panelRef}
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-[var(--header-h)] z-40 flex flex-col overflow-y-auto bg-bg md:hidden"
          >
            <nav aria-label={labels.nav} className="container-site flex-1 py-8">
              <ul className="grid gap-1">
                {items.map((item, i) => (
                  <m.li
                    key={item.href}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className="group flex items-baseline gap-4 border-b border-line py-4 font-display text-3xl tracking-tight"
                    >
                      <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                      <span className={cn(isActive(item.href) ? "text-accent-ink" : "text-fg")}>{item.label}</span>
                    </Link>
                  </m.li>
                ))}
              </ul>
            </nav>
            {footer && <div className="container-site border-t border-line py-6">{footer}</div>}
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
