"use client";

import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import { useTranslations } from "next-intl";
import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { EmptyState } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { PROJECT_CATEGORIES, type ProjectCategory } from "@/lib/types";

export interface ExplorerItem {
  slug: string;
  category: ProjectCategory;
  title: string;
  year: number;
  featured: boolean;
  sortOrder: number;
  /** Texte indexé pour la recherche (titre, résumé, stack). */
  haystack: string;
}

type Sort = "featured" | "newest" | "oldest" | "title";

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function ProjectsExplorer({ items, cards }: { items: ExplorerItem[]; cards: Record<string, ReactNode> }) {
  const t = useTranslations("projects");
  const tc = useTranslations("common");
  const [category, setCategory] = useState<ProjectCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("featured");
  const q = useDeferredValue(normalize(query.trim()));

  const visible = useMemo(() => {
    const list = items.filter(
      (it) => (category === "all" || it.category === category) && (!q || normalize(it.haystack).includes(q)),
    );
    const sorters: Record<Sort, (a: ExplorerItem, b: ExplorerItem) => number> = {
      featured: (a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder,
      newest: (a, b) => b.year - a.year || a.sortOrder - b.sortOrder,
      oldest: (a, b) => a.year - b.year || a.sortOrder - b.sortOrder,
      title: (a, b) => a.title.localeCompare(b.title),
    };
    return list.sort(sorters[sort]);
  }, [items, category, q, sort]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    items.forEach((it) => (c[it.category] = (c[it.category] ?? 0) + 1));
    return c;
  }, [items]);

  const filtersActive = category !== "all" || query !== "";

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label={t("filterLabel")} className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {(["all", ...PROJECT_CATEGORIES] as const).map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                disabled={c !== "all" && !counts[c]}
                onClick={() => setCategory(c)}
                className={cn(
                  "relative inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm transition-colors disabled:opacity-40",
                  active ? "text-accent-contrast" : "text-muted hover:text-fg",
                )}
              >
                {active && (
                  <m.span layoutId="project-filter" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", bounce: 0.15, duration: 0.45 }} />
                )}
                <span className="relative">{c === "all" ? tc("all") : t(`categories.${c}`)}</span>
                <span className={cn("relative font-mono text-[0.6875rem]", active ? "opacity-80" : "text-subtle")}>{counts[c] ?? 0}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block sm:w-72">
            <span className="sr-only">{tc("search")}</span>
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-subtle">
              <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-11 w-full rounded-sm border border-line-strong bg-surface pr-3 pl-10 text-[0.9375rem] placeholder:text-subtle focus:border-fg focus:outline-none focus-visible:outline-2 focus-visible:outline-accent"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="layer-label shrink-0">{t("sortLabel")}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-11 w-full rounded-sm border border-line-strong bg-surface px-3 text-[0.9375rem] sm:w-auto"
            >
              {(["featured", "newest", "oldest", "title"] as const).map((s) => (
                <option key={s} value={s}>
                  {t(`sort.${s}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="mt-4 font-mono text-xs text-subtle" aria-live="polite">
        {tc("results", { count: visible.length })}
      </p>

      {visible.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={t("noResults")}>
            {filtersActive && (
              <button
                type="button"
                className="mt-2 font-medium text-accent-ink underline underline-offset-4"
                onClick={() => {
                  setCategory("all");
                  setQuery("");
                }}
              >
                {tc("resetFilters")}
              </button>
            )}
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-6 grid gap-6 md:grid-cols-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((it, i) => (
              <m.li
                key={it.slug}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                className={cn(i === 0 && visible.length % 2 === 1 && "md:col-span-2")}
              >
                {cards[it.slug]}
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </LazyMotion>
  );
}
