import type { TimelineEntry } from "@/lib/types";

/** Résumé de formation affiché sur l'accueil, ex. « IAI Cameroun · 2023 — 2026 ». */
export function educationSummary(entries: TimelineEntry[]): string | null {
  const edu = entries.filter((e) => e.kind === "education");
  if (!edu.length) return null;
  const counts = new Map<string, number>();
  edu.forEach((e) => counts.set(e.organization, (counts.get(e.organization) ?? 0) + 1));
  const org = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  const start = edu.map((e) => e.startDate.slice(0, 4)).sort()[0];
  const ends = edu.map((e) => (e.endDate ?? "").slice(0, 4)).filter(Boolean).sort();
  const end = ends[ends.length - 1];
  return [org, start && end ? `${start} — ${end}` : start].filter(Boolean).join(" · ");
}
