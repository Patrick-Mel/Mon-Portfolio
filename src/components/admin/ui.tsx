import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function AdminHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-3 inline-flex items-center gap-1 font-mono text-xs text-subtle hover:text-fg">
            ← {back.label}
          </Link>
        )}
        <h1 className="font-display text-3xl tracking-tight">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({ title, description, children, className, actions }: { title?: ReactNode; description?: ReactNode; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-lg border border-line bg-surface", className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="font-display text-lg tracking-tight">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full min-w-[640px] text-left text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3 [&_th]:font-mono [&_th]:text-xs [&_th]:font-normal [&_th]:tracking-wide [&_th]:text-subtle [&_th]:uppercase [&_thead]:border-b [&_thead]:border-line [&_tbody_tr]:border-b [&_tbody_tr]:border-line [&_tbody_tr:last-child]:border-0 [&_tbody_tr:hover]:bg-surface-2/60">
        {children}
      </table>
    </div>
  );
}

type Tone = "neutral" | "accent" | "success" | "warning" | "danger";
const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  accent: "bg-accent-soft text-accent-ink",
  success: "bg-[color-mix(in_oklab,var(--success)_14%,transparent)] text-success",
  warning: "bg-[color-mix(in_oklab,var(--warning)_16%,transparent)] text-warning",
  danger: "bg-[color-mix(in_oklab,var(--danger)_14%,transparent)] text-danger",
};

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-xs px-2 py-0.5 font-mono text-[0.6875rem] whitespace-nowrap", tones[tone])}>{children}</span>;
}

export const STATUS_LABELS: Record<string, [string, Tone]> = {
  draft: ["Brouillon", "neutral"],
  published: ["Publié", "success"],
  scheduled: ["Planifié", "accent"],
  new: ["Nouveau", "accent"],
  read: ["Lu", "neutral"],
  in_progress: ["En cours", "warning"],
  done: ["Traité", "success"],
  pending: ["En attente", "warning"],
  approved: ["Approuvé", "success"],
  rejected: ["Rejeté", "neutral"],
  spam: ["Spam", "danger"],
  confirmed: ["Confirmé", "success"],
  unsubscribed: ["Désinscrit", "neutral"],
};

export function StatusPill({ status }: { status: string }) {
  const [label, tone] = STATUS_LABELS[status] ?? [status, "neutral" as Tone];
  return <Pill tone={tone}>{label}</Pill>;
}

export function ExamplePill() {
  return <Pill tone="warning">Exemple</Pill>;
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12! text-center text-muted">
        {children}
      </td>
    </tr>
  );
}

export function FilterTabs({ items, current }: { items: { href: string; label: string; count?: number; value: string }[]; current: string }) {
  return (
    <nav aria-label="Filtres" className="mb-5 flex flex-wrap gap-1">
      {items.map((i) => (
        <Link
          key={i.value}
          href={i.href}
          aria-current={current === i.value ? "page" : undefined}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm transition-colors",
            current === i.value ? "bg-fg text-bg" : "text-muted hover:bg-surface-2 hover:text-fg",
          )}
        >
          {i.label}
          {i.count != null && <span className="font-mono text-xs opacity-70">{i.count}</span>}
        </Link>
      ))}
    </nav>
  );
}

export function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Douala" }).format(new Date(iso));
}
