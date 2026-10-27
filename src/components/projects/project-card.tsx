import Image from "next/image";
import { Badge } from "@/components/ui/primitives";
import { TopologyDiagram } from "@/components/visuals/topology-diagram";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { tr } from "@/lib/i18n-utils";
import type { Locale, Project } from "@/lib/types";

/** Motif de repli quand un projet n'a ni visuel ni schéma (ex. projets de design). */
function CategoryPattern({ category }: { category: Project["category"] }) {
  if (category === "design") {
    return (
      <svg viewBox="0 0 400 250" aria-hidden className="size-full">
        <g fill="none" stroke="var(--line-strong)" strokeWidth="1.2">
          <circle cx="200" cy="125" r="70" />
          <circle cx="200" cy="125" r="40" strokeDasharray="3 5" />
          <path d="M60 125h280M200 20v210" strokeDasharray="2 6" />
          <rect x="130" y="55" width="140" height="140" />
        </g>
        <rect x="262" y="187" width="16" height="16" fill="var(--accent)" />
        <path d="M150 55h120v140" fill="none" stroke="var(--fg)" strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 400 250" aria-hidden className="size-full">
      <g fill="none" stroke="var(--line-strong)" strokeWidth="1.2">
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M${40 + i * 64} 40v170`} strokeDasharray="2 6" />
        ))}
        <path d="M40 125h320" />
      </g>
      <rect x="192" y="117" width="16" height="16" fill="var(--accent)" />
    </svg>
  );
}

export function ProjectCover({
  project,
  locale,
  priority,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: {
  project: Project;
  locale: Locale;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const diagram = project.diagrams[0];
  return (
    <div className={cn("relative aspect-[16/10] overflow-hidden bg-surface-2", className)}>
      {project.coverUrl ? (
        <Image
          src={project.coverUrl}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-signal group-hover:scale-[1.03]"
        />
      ) : (
        <div className="bg-dots absolute inset-0 grid place-items-center p-6 sm:p-8">
          {diagram ? (
            <TopologyDiagram diagram={diagram} locale={locale} compact animated={false} className="max-h-full transition-transform duration-700 ease-signal group-hover:scale-[1.03]" />
          ) : (
            <CategoryPattern category={project.category} />
          )}
        </div>
      )}
    </div>
  );
}

export function ProjectCard({
  project,
  locale,
  categoryLabel,
  index,
  large,
}: {
  project: Project;
  locale: Locale;
  categoryLabel: string;
  index?: number;
  large?: boolean;
}) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-[border-color,box-shadow] duration-300 ease-signal hover:border-line-strong hover:shadow-2">
      <ProjectCover project={project} locale={locale} className="border-b border-line" sizes={large ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"} />
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <div className="mb-4 flex items-center justify-between gap-3 font-mono text-xs text-subtle">
          <span className="flex items-center gap-2">
            {index != null && <span className="text-accent-ink">{String(index + 1).padStart(2, "0")}</span>}
            {categoryLabel}
          </span>
          <span>{project.year}</span>
        </div>
        <h3 className={cn("font-display tracking-tight text-fg", large ? "text-h3 md:text-[2rem] md:leading-tight" : "text-h3")}>
          <Link href={{ pathname: "/projects/[slug]", params: { slug: project.slug } }} className="after:absolute after:inset-0 after:content-['']">
            {tr(project.title, locale)}
          </Link>
        </h3>
        <p className="mt-3 text-muted">{tr(project.summary, locale)}</p>
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
          {project.stack.slice(0, large ? 6 : 4).map((s) => (
            <li key={s}>
              <Badge tone="outline">{s}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
