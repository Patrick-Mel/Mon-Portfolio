"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Un seul observateur pour toutes les apparitions au scroll (`data-reveal`).
 * Les éléments déjà visibles au montage sont révélés immédiatement, avant
 * d'activer le masquage : pas de flash, et sans JavaScript tout reste visible.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-reveal='in'])"));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach((n) => (n.dataset.reveal = "in"));
      return;
    }

    nodes.forEach((n) => {
      if (n.getBoundingClientRect().top < innerHeight * 0.95) n.dataset.reveal = "in";
    });
    root.dataset.js = "";

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.reveal = "in";
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    nodes.filter((n) => n.dataset.reveal !== "in").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
