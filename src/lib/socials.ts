import type { SocialKey } from "@/lib/types";

/** Noms propres des réseaux : identiques dans toutes les langues. */
export const SOCIAL_LABELS: Record<SocialKey, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  x: "X",
  behance: "Behance",
  dribbble: "Dribbble",
  facebook: "Facebook",
  instagram: "Instagram",
};

export const SOCIAL_KEYS = Object.keys(SOCIAL_LABELS) as SocialKey[];
