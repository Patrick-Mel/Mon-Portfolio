"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ProcessStep } from "@/lib/types";

const empty = (): ProcessStep => ({ title: { fr: "", en: "" }, text: { fr: "", en: "" } });

/** Répéteur d'étapes (processus d'un service), sérialisé en JSON dans un champ caché. */
export function StepsEditor({ name, defaultValue }: { name: string; defaultValue: ProcessStep[] }) {
  const [steps, setSteps] = useState<ProcessStep[]>(defaultValue.length ? defaultValue : [empty()]);
  const update = (i: number, path: "title" | "text", lang: "fr" | "en", v: string) =>
    setSteps((s) => s.map((st, j) => (j === i ? { ...st, [path]: { ...st[path], [lang]: v } } : st)));
  const move = (i: number, d: -1 | 1) =>
    setSteps((s) => {
      const n = [...s];
      const [it] = n.splice(i, 1);
      n.splice(i + d, 0, it!);
      return n;
    });
  const input = "h-10 w-full rounded-sm border border-line-strong bg-surface px-3 text-sm focus:border-fg focus:outline-none";

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={JSON.stringify(steps.filter((s) => s.title.fr || s.title.en))} />
      {steps.map((s, i) => (
        <fieldset key={i} className="grid gap-2 rounded-sm border border-line p-3">
          <legend className="px-1 font-mono text-xs text-subtle">Étape {i + 1}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <input aria-label={`Étape ${i + 1} — titre FR`} placeholder="Titre (FR)" value={s.title.fr} onChange={(e) => update(i, "title", "fr", e.target.value)} className={input} />
            <input aria-label={`Étape ${i + 1} — titre EN`} placeholder="Title (EN)" value={s.title.en} onChange={(e) => update(i, "title", "en", e.target.value)} className={input} />
            <input aria-label={`Étape ${i + 1} — texte FR`} placeholder="Texte (FR)" value={s.text.fr} onChange={(e) => update(i, "text", "fr", e.target.value)} className={input} />
            <input aria-label={`Étape ${i + 1} — texte EN`} placeholder="Text (EN)" value={s.text.en} onChange={(e) => update(i, "text", "en", e.target.value)} className={input} />
          </div>
          <div className="flex gap-1">
            <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Monter" className="grid size-8 place-items-center rounded-xs text-muted hover:bg-surface-2 disabled:opacity-30">
              <ArrowUp size={14} aria-hidden />
            </button>
            <button type="button" disabled={i === steps.length - 1} onClick={() => move(i, 1)} aria-label="Descendre" className="grid size-8 place-items-center rounded-xs text-muted hover:bg-surface-2 disabled:opacity-30">
              <ArrowDown size={14} aria-hidden />
            </button>
            <button type="button" onClick={() => setSteps((st) => st.filter((_, j) => j !== i))} aria-label="Supprimer l'étape" className="grid size-8 place-items-center rounded-xs text-muted hover:bg-surface-2 hover:text-danger">
              <Trash2 size={14} aria-hidden />
            </button>
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={() => setSteps((s) => [...s, empty()])} className="inline-flex h-9 w-fit items-center gap-2 rounded-sm border border-dashed border-line-strong px-3 text-sm text-muted hover:border-fg hover:text-fg">
        <Plus size={14} aria-hidden /> Ajouter une étape
      </button>
    </div>
  );
}
