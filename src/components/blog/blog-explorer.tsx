"use client";

import { useTranslations } from "next-intl";
import { useDeferredValue, useMemo, useRef, useState, type ReactNode } from "react";
import { EmptyState } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

export interface BlogItem {
  slug: string;
  haystack: string;
}

const PAGE_SIZE = 6;
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Recherche instantanée et pagination côté client sur la liste (déjà rendue côté serveur). */
export function BlogExplorer({ items, rows }: { items: BlogItem[]; rows: Record<string, ReactNode> }) {
  const t = useTranslations("blog");
  const tc = useTranslations("common");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);
  const q = useDeferredValue(normalize(query.trim()));

  const filtered = useMemo(() => items.filter((it) => !q || normalize(it.haystack).includes(q)), [items, q]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const go = (p: number) => {
    setPage(p);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={listRef} className="scroll-mt-[calc(var(--header-h)+1rem)]">
      <label className="relative block max-w-md">
        <span className="sr-only">{tc("search")}</span>
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-subtle">
          <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder={t("searchPlaceholder")}
          className="h-11 w-full rounded-sm border border-line-strong bg-surface pr-3 pl-10 text-[0.9375rem] placeholder:text-subtle focus:border-fg focus:outline-none focus-visible:outline-2 focus-visible:outline-accent"
        />
      </label>
      <p className="mt-4 font-mono text-xs text-subtle" aria-live="polite">
        {tc("results", { count: filtered.length })}
      </p>

      {visible.length ? (
        <ul className="mt-6 border-t border-line">
          {visible.map((it) => (
            <li key={it.slug}>{rows[it.slug]}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-6">
          <EmptyState title={t("noResults")} />
        </div>
      )}

      {pages > 1 && (
        <nav aria-label={tc("pagination")} className="mt-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => go(current - 1)}
            disabled={current === 1}
            className="h-10 rounded-sm border border-line-strong px-4 text-sm transition-colors hover:border-fg disabled:opacity-40"
          >
            ← {tc("previous")}
          </button>
          <ul className="flex items-center gap-1">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <li key={p}>
                <button
                  type="button"
                  onClick={() => go(p)}
                  aria-current={p === current ? "page" : undefined}
                  aria-label={tc("pageOf", { current: p, total: pages })}
                  className={cn(
                    "grid size-10 place-items-center rounded-sm font-mono text-sm transition-colors",
                    p === current ? "bg-accent text-accent-contrast" : "text-muted hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  {p}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => go(current + 1)}
            disabled={current === pages}
            className="h-10 rounded-sm border border-line-strong px-4 text-sm transition-colors hover:border-fg disabled:opacity-40"
          >
            {tc("next")} →
          </button>
        </nav>
      )}
    </div>
  );
}
