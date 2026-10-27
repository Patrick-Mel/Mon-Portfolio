import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ---------- Badge ---------- */
type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "outline";
const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-muted",
  accent: "bg-accent-soft text-accent-ink",
  success: "bg-[color-mix(in_oklab,var(--success)_14%,transparent)] text-success",
  warning: "bg-[color-mix(in_oklab,var(--warning)_16%,transparent)] text-warning",
  danger: "bg-[color-mix(in_oklab,var(--danger)_14%,transparent)] text-danger",
  outline: "border border-line-strong text-muted",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs px-2 py-0.5 font-mono text-[0.75rem] leading-5 tracking-tight",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Carte ---------- */
export function Card({ className, interactive, ...rest }: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-surface",
        interactive &&
          "transition-[border-color,box-shadow,transform] duration-300 ease-signal hover:-translate-y-0.5 hover:border-line-strong hover:shadow-2",
        className,
      )}
      {...rest}
    />
  );
}

/* ---------- En-tête de section ---------- */
export function SectionHeader({
  layer,
  title,
  intro,
  action,
  as: Heading = "h2",
  className,
  id,
}: {
  layer: string;
  title: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2";
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-12 md:items-end", className)} data-reveal>
      <div className="md:col-span-8">
        <p className="layer-label mb-4 flex items-center gap-3">
          <span aria-hidden className="inline-block h-px w-8 bg-accent" />
          {layer}
        </p>
        <Heading id={id} className={Heading === "h1" ? "text-h1" : "text-h2"}>
          {title}
        </Heading>
        {intro && <p className="mt-5 max-w-2xl text-lead text-muted">{intro}</p>}
      </div>
      {action && <div className="md:col-span-4 md:justify-self-end">{action}</div>}
    </div>
  );
}

/* ---------- En-tête de page ---------- */
export function PageHeader({
  layer,
  title,
  intro,
  children,
}: {
  layer: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="bg-dots absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="container-site relative pt-16 pb-12 md:pt-24 md:pb-16">
        <p className="layer-label mb-5 flex items-center gap-3">
          <span aria-hidden className="inline-block h-px w-8 bg-accent" />
          {layer}
        </p>
        <h1 className="text-h1 max-w-4xl">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-lead text-muted">{intro}</p>}
        {children}
      </div>
    </header>
  );
}

/* ---------- États vides et squelettes ---------- */
export function EmptyState({ title, children, icon }: { title: string; children?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line-strong px-6 py-14 text-center">
      {icon ?? (
        <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden className="text-subtle">
          <circle cx="8" cy="20" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="32" cy="20" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 20h6M22 20h6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" />
        </svg>
      )}
      <p className="font-display text-lg text-fg">{title}</p>
      {children && <div className="max-w-md text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}

/* ---------- Badge « Exemple » (contenu à remplacer) ---------- */
export function ExampleTag({ label }: { label: string }) {
  return (
    <Badge tone="warning" className="uppercase">
      {label}
    </Badge>
  );
}

/* ---------- Kbd / méta technique ---------- */
export function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1">
      <dt className="layer-label">{label}</dt>
      <dd className="text-fg">{children}</dd>
    </div>
  );
}
