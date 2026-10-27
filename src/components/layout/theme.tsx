"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { THEME_STORAGE_KEY as STORAGE_KEY } from "./theme-script";
type Theme = "light" | "dark";

/** Abonnement à l'attribut data-theme de <html> (source de vérité unique). */
function subscribeTheme(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(next: Theme, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const commit = () => {
    root.dataset.theme = next;
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  if (!doc.startViewTransition || reduce || !origin) return commit();

  // Bascule animée : révélation circulaire depuis le bouton (View Transitions API).
  const radius = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));
  const transition = doc.startViewTransition(commit);
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`] },
        { duration: 550, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => undefined);
}

export function ThemeToggle({ labels, className }: { labels: { toLight: string; toDark: string }; className?: string }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => null);

  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch {}
      if (stored) return;
      const next = e.matches ? "dark" : "light";
      applyTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isDark = theme === "dark";
  const label = isDark ? labels.toLight : labels.toDark;

  return (
    <button
      type="button"
      onClick={(e) => {
        const next: Theme = readTheme() === "dark" ? "light" : "dark";
        const r = e.currentTarget.getBoundingClientRect();
        applyTheme(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {}
      }}
      aria-label={label}
      title={label}
      className={cn(
        "relative grid size-10 place-items-center rounded-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg",
        className,
      )}
    >
      <Sun
        aria-hidden
        size={18}
        strokeWidth={1.7}
        className="col-start-1 row-start-1 transition-[transform,opacity] duration-500 ease-signal [[data-theme=dark]_&]:scale-50 [[data-theme=dark]_&]:-rotate-90 [[data-theme=dark]_&]:opacity-0"
      />
      <Moon
        aria-hidden
        size={18}
        strokeWidth={1.7}
        className="col-start-1 row-start-1 scale-50 rotate-90 opacity-0 transition-[transform,opacity] duration-500 ease-signal [[data-theme=dark]_&]:scale-100 [[data-theme=dark]_&]:rotate-0 [[data-theme=dark]_&]:opacity-100"
      />
    </button>
  );
}
