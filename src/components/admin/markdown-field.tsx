"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { previewMarkdown } from "@/app/admin/_actions/content";
import { cn } from "@/lib/cn";

const TOOLS: { label: string; title: string; wrap: [string, string]; block?: boolean }[] = [
  { label: "B", title: "Gras", wrap: ["**", "**"] },
  { label: "I", title: "Italique", wrap: ["_", "_"] },
  { label: "H2", title: "Titre de section", wrap: ["\n## ", ""], block: true },
  { label: "H3", title: "Sous-titre", wrap: ["\n### ", ""], block: true },
  { label: "•", title: "Liste", wrap: ["\n- ", ""], block: true },
  { label: "</>", title: "Code en ligne", wrap: ["`", "`"] },
  { label: "{ }", title: "Bloc de code", wrap: ["\n```bash\n", "\n```\n"], block: true },
  { label: "❝", title: "Citation", wrap: ["\n> ", ""], block: true },
  { label: "🔗", title: "Lien", wrap: ["[", "](https://)"] },
];

/**
 * Éditeur Markdown : barre d'outils, compteur de mots et aperçu rendu par le
 * même pipeline que le site public (coloration, assainissement).
 */
export function MarkdownEditor({
  name,
  id,
  defaultValue,
  invalid,
  describedBy,
  required,
  rows = 14,
}: {
  name: string;
  id: string;
  defaultValue: string;
  invalid?: boolean;
  describedBy?: string;
  required?: boolean;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [html, setHtml] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    if (mode !== "preview") return;
    start(async () => setHtml(await previewMarkdown(value)));
  }, [mode, value]);

  const apply = (wrap: [string, string]) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = value.slice(s, e);
    const next = value.slice(0, s) + wrap[0] + selected + wrap[1] + value.slice(e);
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + wrap[0].length, s + wrap[0].length + selected.length);
    });
  };

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className={cn("overflow-hidden rounded-sm border bg-surface", invalid ? "border-danger" : "border-line-strong")}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2/60 px-2 py-1.5">
        <div className="flex flex-wrap gap-0.5" role="toolbar" aria-label="Mise en forme">
          {TOOLS.map((t) => (
            <button
              key={t.title}
              type="button"
              title={t.title}
              aria-label={t.title}
              disabled={mode === "preview"}
              onClick={() => apply(t.wrap)}
              className="h-8 min-w-8 rounded-xs px-2 font-mono text-xs text-muted hover:bg-surface hover:text-fg disabled:opacity-40"
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.6875rem] text-subtle">{words} mots</span>
          <div className="flex rounded-xs border border-line p-0.5 text-xs">
            {(["edit", "preview"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={cn("rounded-[3px] px-2.5 py-1", mode === m ? "bg-fg text-bg" : "text-muted hover:text-fg")}
              >
                {m === "edit" ? "Écrire" : "Aperçu"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <textarea
        ref={ref}
        id={id}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={rows}
        required={required}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        spellCheck
        className={cn("block w-full resize-y bg-transparent p-4 font-mono text-[0.8125rem] leading-relaxed focus:outline-none", mode === "preview" && "hidden")}
      />
      {mode === "preview" && (
        <div className="max-h-[32rem] min-h-40 overflow-y-auto p-5" aria-live="polite" aria-busy={pending}>
          {pending && !html ? <p className="text-sm text-subtle">Rendu…</p> : <div className="prose-signal" dangerouslySetInnerHTML={{ __html: html }} />}
        </div>
      )}
    </div>
  );
}
