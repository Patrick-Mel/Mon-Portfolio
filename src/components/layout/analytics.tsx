"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Mesure d'audience maison, sans cookie ni stockage local : une requête
 * `sendBeacon` par page vue. Respecte Do Not Track et Global Privacy Control.
 */
export function Analytics() {
  const pathname = usePathname();
  const locale = useLocale();
  const first = useRef(true);

  useEffect(() => {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;
    const referrer = first.current ? document.referrer : "";
    first.current = false;
    const body = JSON.stringify({ path: pathname, locale, referrer });
    try {
      if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
        void fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
      }
    } catch {
      // La mesure d'audience ne doit jamais casser la navigation.
    }
  }, [pathname, locale]);

  return null;
}
