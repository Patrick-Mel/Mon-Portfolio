import { cn } from "@/lib/cn";

interface MonogramProps {
  initials: string;
  size?: number;
  className?: string;
  /** Libellé accessible ; omis = décoratif. */
  title?: string;
}

/**
 * Monogramme « nœud » : initiales dans un cadre aux coins chanfreinés,
 * le coin inférieur droit porte un point de signal (couleur d'accent).
 * Entièrement paramétré par les initiales du fichier de configuration.
 */
export function Monogram({ initials, size = 36, className, title }: MonogramProps) {
  const text = initials.slice(0, 3).toUpperCase();
  const fontSize = text.length > 2 ? 13 : text.length === 2 ? 17 : 22;
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d="M11 2.5H45.5V37L37 45.5H2.5V11Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M37 45.5L45.5 37" stroke="var(--accent)" strokeWidth="2.5" />
      <rect x="41.5" y="41.5" width="6" height="6" fill="var(--accent)" />
      <text
        x="24"
        y="24.5"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        style={{ fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "-0.04em" }}
        fontSize={fontSize}
      >
        {text}
      </text>
    </svg>
  );
}
