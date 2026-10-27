"use client";

import { Check, Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

/** Partage sans scripts tiers : simples liens + copie du lien. */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const t = useTranslations("blog");
  const tc = useTranslations("common");
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const ti = encodeURIComponent(title);
  const networks = [
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: "X", href: `https://x.com/intent/post?url=${u}&text=${ti}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${ti}%20${u}` },
  ];
  const btn =
    "inline-flex h-9 items-center gap-2 rounded-sm border border-line px-3 text-sm text-muted transition-colors hover:border-fg hover:text-fg";

  return (
    <div>
      <p className="layer-label mb-3">{t("share")}</p>
      <ul className="flex flex-wrap gap-2">
        {networks.map((n) => (
          <li key={n.name}>
            <a href={n.href} target="_blank" rel="noopener noreferrer" className={btn} aria-label={t("shareOn", { network: n.name })}>
              {n.name}
            </a>
          </li>
        ))}
        <li>
          <button
            type="button"
            className={btn}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {
                // Presse-papiers indisponible (contexte non sécurisé) : rien à faire.
              }
            }}
          >
            {copied ? <Check size={14} aria-hidden /> : <Link2 size={14} aria-hidden />}
            <span aria-live="polite">{copied ? tc("copied") : tc("copyLink")}</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
