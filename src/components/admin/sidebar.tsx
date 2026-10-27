"use client";

import {
  Activity,
  BookOpen,
  Briefcase,
  FileText,
  FolderKanban,
  Gauge,
  Hash,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  ListOrdered,
  LogOut,
  Mail,
  MessageSquare,
  Milestone,
  Scale,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/admin/_actions/auth";
import { Monogram } from "@/components/brand/monogram";
import { ThemeToggle } from "@/components/layout/theme";
import { cn } from "@/lib/cn";

interface Item {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export function AdminSidebar({
  brand,
  initials,
  email,
  counts,
}: {
  brand: string;
  initials: string;
  email: string;
  counts: { inbox: number; comments: number };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const sections: { title: string; items: Item[] }[] = [
    { title: "", items: [{ href: "/admin", label: "Tableau de bord", icon: Gauge }] },
    {
      title: "Contenu",
      items: [
        { href: "/admin/projects", label: "Projets", icon: FolderKanban },
        { href: "/admin/posts", label: "Articles", icon: BookOpen },
        { href: "/admin/taxonomy", label: "Catégories & tags", icon: Hash },
        { href: "/admin/services", label: "Services", icon: Briefcase },
        { href: "/admin/skills", label: "Compétences", icon: Sparkles },
        { href: "/admin/timeline", label: "Parcours", icon: Milestone },
        { href: "/admin/figures", label: "Chiffres clés", icon: ListOrdered },
        { href: "/admin/legal", label: "Pages légales", icon: Scale },
      ],
    },
    {
      title: "Relations",
      items: [
        { href: "/admin/inbox", label: "Boîte de réception", icon: Inbox, badge: counts.inbox },
        { href: "/admin/comments", label: "Commentaires", icon: MessageSquare, badge: counts.comments },
        { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
      ],
    },
    {
      title: "Système",
      items: [
        { href: "/admin/media", label: "Médiathèque", icon: ImageIcon },
        { href: "/admin/settings", label: "Paramètres", icon: Settings },
        { href: "/admin/settings/security", label: "Sécurité (2FA)", icon: KeyRound },
        { href: "/admin/activity", label: "Journal d'activité", icon: Activity },
      ],
    },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || (pathname.startsWith(`${href}/`) && !(href === "/admin/settings" && pathname.startsWith("/admin/settings/security")));

  const nav = (
    <nav aria-label="Administration" className="flex-1 overflow-y-auto px-3 py-4">
      {sections.map((s) => (
        <div key={s.title || "root"} className="mb-5">
          {s.title && <p className="mb-2 px-3 font-mono text-[0.6875rem] tracking-wider text-subtle uppercase">{s.title}</p>}
          <ul className="grid gap-0.5">
            {s.items.map((it) => {
              const active = isActive(it.href);
              const Icon = it.icon;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors",
                      active ? "bg-surface-2 font-medium text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
                    )}
                  >
                    <Icon size={16} aria-hidden className={active ? "text-accent-ink" : undefined} />
                    <span className="flex-1">{it.label}</span>
                    {!!it.badge && (
                      <span className="rounded-full bg-accent px-1.5 font-mono text-[0.6875rem] leading-5 text-accent-contrast">
                        {it.badge}
                        <span className="sr-only"> nouveaux</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-line p-3">
      <p className="truncate px-3 pb-2 font-mono text-xs text-subtle" title={email}>
        {email}
      </p>
      <div className="flex items-center gap-1">
        <a href="/" target="_blank" rel="noopener" className="flex flex-1 items-center gap-2 rounded-sm px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg">
          <FileText size={16} aria-hidden /> Voir le site ↗
        </a>
        <ThemeToggle labels={{ toLight: "Thème clair", toDark: "Thème sombre" }} />
        <form action={signOut}>
          <button type="submit" className="grid size-10 place-items-center rounded-sm text-muted hover:bg-surface-2 hover:text-danger" aria-label="Se déconnecter" title="Se déconnecter">
            <LogOut size={16} aria-hidden />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Barre supérieure mobile */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Monogram initials={initials} size={28} />
          <span className="font-display font-semibold">Admin</span>
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="admin-drawer"
          onClick={() => setOpen((o) => !o)}
          className="h-10 rounded-sm border border-line px-3 text-sm"
        >
          {open ? "Fermer" : "Menu"}
          {!open && counts.inbox + counts.comments > 0 && <span className="ml-2 inline-block size-2 rounded-full bg-accent" aria-hidden />}
        </button>
      </div>

      <aside
        id="admin-drawer"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-surface transition-transform duration-300 ease-signal lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:translate-x-0",
          open ? "translate-x-0 shadow-3" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-line px-5">
          <Monogram initials={initials} size={30} />
          <div className="min-w-0">
            <p className="truncate font-display text-sm leading-tight font-semibold">{brand}</p>
            <p className="font-mono text-[0.6875rem] text-subtle">/admin</p>
          </div>
        </div>
        {nav}
        {footer}
      </aside>
      {open && <button type="button" aria-label="Fermer le menu" className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
