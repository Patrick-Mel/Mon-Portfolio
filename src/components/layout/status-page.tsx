import type { ReactNode } from "react";

/**
 * Mise en page des pages 404 / 500 : un nœud isolé du réseau,
 * avec une liaison coupée — la métaphore de l'hôte injoignable.
 */
export function StatusPage({
  code,
  title,
  text,
  children,
}: {
  code: string;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <section className="container-site grid min-h-[70vh] items-center gap-12 py-20 md:grid-cols-12">
      <div className="md:col-span-7">
        <p className="layer-label mb-6 flex items-center gap-3 text-danger">
          <span aria-hidden className="inline-block size-2 bg-danger" />
          {code}
        </p>
        <h1 className="text-h1">{title}</h1>
        <p className="mt-6 max-w-xl text-lead text-muted">{text}</p>
        {children && <div className="mt-10 flex flex-wrap gap-3">{children}</div>}
      </div>
      <svg viewBox="0 0 320 220" aria-hidden className="w-full max-w-md text-line-strong md:col-span-5">
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="20" y="90" width="56" height="40" rx="4" />
          <rect x="244" y="90" width="56" height="40" rx="4" className="text-danger" stroke="var(--danger)" />
          <path d="M76 110h62" />
          <path d="M182 110h62" strokeDasharray="4 6" />
          <path d="M146 98l24 24M170 98l-24 24" stroke="var(--danger)" strokeWidth="2" />
          <path d="M48 90V40h224v50" strokeDasharray="2 5" />
        </g>
        <circle cx="48" cy="40" r="4" fill="var(--accent)" />
        <text x="272" y="160" textAnchor="middle" className="fill-subtle font-mono text-[11px]">
          timeout
        </text>
      </svg>
    </section>
  );
}
