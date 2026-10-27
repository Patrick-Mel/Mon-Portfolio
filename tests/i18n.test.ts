import { describe, expect, it } from "vitest";
import { legalPages } from "@/content/legal";
import { posts } from "@/content/posts";
import { keyFigures, skills, timeline } from "@/content/profile";
import { projects } from "@/content/projects";
import { services } from "@/content/services";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

function keys(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

/** Parcourt un objet et renvoie les chemins des valeurs {fr, en} dont une langue est vide. */
function missingTranslations(obj: unknown, path = ""): string[] {
  if (Array.isArray(obj)) return obj.flatMap((v, i) => missingTranslations(v, `${path}[${i}]`));
  if (typeof obj !== "object" || obj === null) return [];
  const o = obj as Record<string, unknown>;
  if ("fr" in o && "en" in o && Object.keys(o).length === 2) {
    const empty = (v: unknown) => (Array.isArray(v) ? v.length === 0 : !v);
    return empty(o.fr) !== empty(o.en) ? [path] : [];
  }
  return Object.entries(o).flatMap(([k, v]) => missingTranslations(v, path ? `${path}.${k}` : k));
}

describe("traductions de l'interface", () => {
  it("fr.json et en.json ont exactement les mêmes clés", () => {
    expect(keys(en).sort()).toEqual(keys(fr).sort());
  });

  it("aucune chaîne vide", () => {
    for (const dict of [fr, en]) {
      for (const k of keys(dict)) {
        const v = k.split(".").reduce<unknown>((o, p) => (o as Record<string, unknown>)[p], dict);
        expect(typeof v === "string" && v.trim().length > 0, k).toBe(true);
      }
    }
  });
});

describe("contenu d'exemple bilingue", () => {
  it.each([
    ["services", services],
    ["projets", projects],
    ["articles", posts],
    ["compétences", skills],
    ["parcours", timeline],
    ["chiffres", keyFigures],
    ["pages légales", legalPages],
  ])("%s : chaque texte existe en FR et en EN", (_, data) => {
    expect(missingTranslations(data)).toEqual([]);
  });

  it("respecte le volume demandé", () => {
    expect(services).toHaveLength(5);
    expect(skills.length).toBeGreaterThanOrEqual(20);
    expect(skills.length).toBeLessThanOrEqual(30);
    expect(projects.length).toBeGreaterThanOrEqual(3);
    expect(projects.length).toBeLessThanOrEqual(5);
    expect(posts).toHaveLength(3);
  });

  it("les liaisons des schémas pointent vers des nœuds existants", () => {
    for (const p of projects) {
      for (const d of p.diagrams) {
        const ids = new Set(d.nodes.map((n) => n.id));
        for (const l of d.links) {
          expect(ids.has(l.from), `${p.slug}: ${l.from}`).toBe(true);
          expect(ids.has(l.to), `${p.slug}: ${l.to}`).toBe(true);
        }
      }
    }
  });
});
