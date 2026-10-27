import { cn } from "@/lib/cn";
import { SKILL_LEVELS, type SkillLevel } from "@/lib/types";

/**
 * Niveau qualitatif affiché comme un indicateur de signal (3 barres),
 * jamais comme un pourcentage. Le libellé reste lisible par les lecteurs d'écran.
 */
export function LevelMeter({
  level,
  label,
  inverse,
  showLabel,
}: {
  level: SkillLevel;
  label: string;
  inverse?: boolean;
  showLabel?: boolean;
}) {
  const rank = SKILL_LEVELS.indexOf(level) + 1;
  return (
    <span className="inline-flex shrink-0 items-center gap-2" title={label}>
      <span aria-hidden className="flex h-3.5 items-end gap-[3px]">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "w-[3px] rounded-[1px]",
              i <= rank ? "bg-accent" : inverse ? "bg-[color-mix(in_oklab,var(--fg-inverse)_22%,transparent)]" : "bg-line-strong",
            )}
            style={{ height: `${i * 33.3}%` }}
          />
        ))}
      </span>
      <span className={showLabel ? "font-mono text-xs text-muted" : "sr-only"}>{label}</span>
    </span>
  );
}
