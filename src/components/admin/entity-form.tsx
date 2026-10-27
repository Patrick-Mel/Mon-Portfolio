"use client";

import { useActionState, useId, useRef, useState, type ReactNode } from "react";
import { saveEntity, type FormState } from "@/app/admin/_actions/content";
import { TopologyDiagram } from "@/components/visuals/topology-diagram";
import { getPath, type FieldDef, type FieldGroup, type Values } from "@/lib/admin/fields";
import { cn } from "@/lib/cn";
import { slugify } from "@/lib/i18n-utils";
import type { Diagram, ProcessStep } from "@/lib/types";
import { MarkdownEditor } from "./markdown-field";
import { MediaPicker } from "./media-picker";
import { StepsEditor } from "./steps-editor";

const control =
  "w-full rounded-sm border bg-surface px-3 text-[0.9375rem] focus:border-fg focus:outline-none focus-visible:outline-2 focus-visible:outline-accent aria-[invalid=true]:border-danger";
const ctl = (invalid?: boolean) => cn(control, invalid ? "border-danger" : "border-line-strong");

/** datetime ISO → valeur de <input type="datetime-local"> (heure locale). */
function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Saisie dans l'heure locale du navigateur, envoi en ISO (UTC) via un champ caché :
 * le serveur n'a pas à deviner le fuseau horaire de l'administrateur.
 */
function DateTimeField({ common, name, initial, invalid }: { common: Record<string, unknown>; name: string; initial: string | null; invalid: boolean }) {
  const [local, setLocal] = useState(() => toLocalInput(initial));
  const iso = local ? new Date(local).toISOString() : "";
  return (
    <>
      <input {...common} suppressHydrationWarning type="datetime-local" value={local} onChange={(e) => setLocal(e.target.value)} className={cn(ctl(invalid), "h-11")} />
      <input type="hidden" name={name} value={iso} />
    </>
  );
}

function LangTag({ lang }: { lang: string }) {
  return <span className="mb-1 inline-block font-mono text-[0.6875rem] text-subtle uppercase">{lang}</span>;
}

function JsonField({ field, value, error, id }: { field: FieldDef; value: unknown; error?: string; id: string }) {
  const [text, setText] = useState(() => JSON.stringify(value ?? [], null, 2));
  let parsed: unknown = null;
  let parseError: string | null = null;
  try {
    parsed = JSON.parse(text || "[]");
  } catch (e) {
    parseError = (e as Error).message;
  }
  const diagrams = Array.isArray(parsed) ? (parsed as Diagram[]).filter((d) => d && Array.isArray(d.nodes) && Array.isArray(d.links)) : [];
  return (
    <div className="grid gap-3">
      <textarea
        id={id}
        name={field.name}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={14}
        spellCheck={false}
        aria-invalid={!!error || !!parseError}
        className={cn(ctl(!!error || !!parseError), "py-3 font-mono text-xs leading-relaxed")}
      />
      <div className="flex items-center gap-3 text-xs">
        <button type="button" onClick={() => !parseError && setText(JSON.stringify(parsed, null, 2))} className="rounded-xs border border-line px-2 py-1 hover:border-fg">
          Formater
        </button>
        <span className={parseError ? "text-danger" : "text-success"}>{parseError ? `JSON invalide : ${parseError}` : "JSON valide"}</span>
      </div>
      {diagrams.length > 0 && (
        <div className="grid gap-3">
          <p className="font-mono text-xs text-subtle">Aperçu en direct</p>
          {diagrams.map((d, i) => {
            try {
              return (
                <div key={i} className="bg-dots overflow-x-auto rounded-sm border border-line p-4">
                  <div className="min-w-[520px]">
                    <TopologyDiagram diagram={d} locale="fr" animated={false} />
                  </div>
                </div>
              );
            } catch {
              return null;
            }
          })}
        </div>
      )}
    </div>
  );
}

function FieldControl({ field, values, error, formRef }: { field: FieldDef; values: Values; error?: string; formRef: React.RefObject<HTMLFormElement | null> }) {
  const id = useId();
  const v = getPath(values, field.name) ?? field.defaultValue;
  const errId = error ? `${id}-err` : undefined;
  const helpId = field.help ? `${id}-help` : undefined;
  const describedBy = [helpId, errId].filter(Boolean).join(" ") || undefined;
  const common = { id, "aria-invalid": !!error || undefined, "aria-describedby": describedBy };
  let control: ReactNode;

  switch (field.type) {
    case "text":
    case "email":
    case "url":
    case "number":
    case "month":
      control = (
        <input
          {...common}
          name={field.name}
          type={field.type === "month" ? "month" : field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
          defaultValue={v ?? ""}
          required={field.required}
          maxLength={field.max}
          className={cn(ctl(!!error), "h-11")}
        />
      );
      break;
    case "color":
      control = (
        <div className="flex items-center gap-2">
          <input {...common} name={field.name} type="color" defaultValue={v ?? "#ff5a1f"} className="h-11 w-16 cursor-pointer rounded-sm border border-line-strong bg-surface p-1" />
          <span className="text-xs text-muted">Sélecteur de couleur</span>
        </div>
      );
      break;
    case "textarea":
      control = <textarea {...common} name={field.name} defaultValue={v ?? ""} rows={4} maxLength={field.max} className={cn(ctl(!!error), "py-2.5")} />;
      break;
    case "slug":
      control = (
        <div className="flex gap-2">
          <input {...common} name={field.name} defaultValue={v ?? ""} required={field.required} pattern="[a-z0-9]+(-[a-z0-9]+)*" className={cn(ctl(!!error), "h-11 font-mono text-sm")} />
          {field.slugFrom && (
            <button
              type="button"
              className="h-11 shrink-0 rounded-sm border border-line-strong px-3 text-sm hover:border-fg"
              onClick={() => {
                const form = formRef.current;
                const src = form?.elements.namedItem(field.slugFrom!) as HTMLInputElement | null;
                const target = form?.elements.namedItem(field.name) as HTMLInputElement | null;
                if (src && target) target.value = slugify(src.value);
              }}
            >
              Générer
            </button>
          )}
        </div>
      );
      break;
    case "select":
      control = (
        <select {...common} name={field.name} defaultValue={v ?? ""} required={field.required} className={cn(ctl(!!error), "h-11")}>
          {!field.required && !field.options?.some((o) => o.value === "") && <option value="">—</option>}
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "boolean":
      return (
        <label className="flex cursor-pointer items-start gap-3 py-1">
          <input type="checkbox" name={field.name} defaultChecked={Boolean(v)} className="peer sr-only" aria-describedby={describedBy} />
          <span
            aria-hidden
            className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-line-strong transition-colors peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4"
          />
          <span>
            <span className="text-sm font-medium">{field.label}</span>
            {field.help && (
              <span id={helpId} className="block text-xs text-subtle">
                {field.help}
              </span>
            )}
          </span>
        </label>
      );
    case "datetime":
      control = <DateTimeField common={common} name={field.name} initial={v} invalid={!!error} />;
      break;
    case "i18n":
    case "i18n-textarea":
    case "i18n-list":
      control = (
        <div className="grid gap-3 md:grid-cols-2">
          {(["fr", "en"] as const).map((l) => {
            const val = field.type === "i18n-list" ? ((v?.[l] as string[] | undefined) ?? []).join("\n") : (v?.[l] ?? "");
            const name = `${field.name}.${l}`;
            return (
              <div key={l}>
                <LangTag lang={l} />
                {field.type === "i18n" ? (
                  <input
                    id={l === "fr" ? id : undefined}
                    aria-label={`${field.label} (${l.toUpperCase()})`}
                    aria-invalid={!!error || undefined}
                    aria-describedby={describedBy}
                    name={name}
                    defaultValue={val}
                    required={field.required}
                    maxLength={field.max}
                    className={cn(ctl(!!error), "h-11")}
                  />
                ) : (
                  <textarea
                    id={l === "fr" ? id : undefined}
                    aria-label={`${field.label} (${l.toUpperCase()})`}
                    aria-invalid={!!error || undefined}
                    aria-describedby={describedBy}
                    name={name}
                    defaultValue={val}
                    rows={field.type === "i18n-list" ? 5 : 4}
                    required={field.required}
                    className={cn(ctl(!!error), "py-2.5")}
                  />
                )}
              </div>
            );
          })}
        </div>
      );
      break;
    case "i18n-markdown":
      control = (
        <div className="grid gap-4 xl:grid-cols-2">
          {(["fr", "en"] as const).map((l) => (
            <div key={l}>
              <LangTag lang={l} />
              <MarkdownEditor name={`${field.name}.${l}`} id={l === "fr" ? id : `${id}-${l}`} defaultValue={v?.[l] ?? ""} invalid={!!error} describedBy={describedBy} rows={field.max && field.max > 60000 ? 22 : 10} />
            </div>
          ))}
        </div>
      );
      break;
    case "list":
      control = (
        <textarea {...common} name={field.name} defaultValue={Array.isArray(v) ? v.join(", ") : ""} rows={2} className={cn(ctl(!!error), "py-2.5 font-mono text-sm")} />
      );
      break;
    case "image":
    case "file":
      control = <MediaPicker name={field.name} id={id} defaultValue={v ?? null} kind={field.type === "file" ? "pdf" : "image"} invalid={!!error} describedBy={describedBy} />;
      break;
    case "json":
      control = <JsonField field={field} value={v} error={error} id={id} />;
      break;
    case "steps":
      control = <StepsEditor name={field.name} defaultValue={(v as ProcessStep[]) ?? []} />;
      break;
  }

  return (
    <div className={cn("grid gap-1.5", field.width === "half" ? "md:col-span-1" : "md:col-span-2")}>
      <label htmlFor={id} className="text-sm font-medium">
        {field.label}
        {field.required && (
          <span aria-hidden className="ml-0.5 text-accent-ink">
            *
          </span>
        )}
      </label>
      {control}
      {field.help && (
        <p id={helpId} className="text-xs text-subtle">
          {field.help}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Formulaire d'édition générique. `extra` permet d'ajouter des champs
 * spécifiques (ex. tags d'un article) dans le même envoi.
 */
export function EntityForm({
  entity,
  id,
  groups,
  values,
  extra,
  submitLabel = "Enregistrer",
}: {
  entity: string;
  id?: string;
  groups: FieldGroup[];
  values: Values;
  extra?: ReactNode;
  submitLabel?: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveEntity, null);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state?.errors ?? {};

  return (
    <form ref={formRef} action={action} className="grid gap-6 pb-24" noValidate>
      <input type="hidden" name="_entity" value={entity} />
      {id && <input type="hidden" name="_id" value={id} />}
      {groups.map((g) => (
        <section key={g.title} className="rounded-lg border border-line bg-surface">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-lg tracking-tight">{g.title}</h2>
            {g.description && <p className="mt-1 text-sm text-muted">{g.description}</p>}
          </div>
          <div className="grid gap-5 p-5 md:grid-cols-2">
            {g.fields.map((f) => (
              <FieldControl key={f.name} field={f} values={values} error={errors[f.name]} formRef={formRef} />
            ))}
          </div>
        </section>
      ))}
      {extra}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <p role="status" aria-live="polite" className={cn("text-sm", state?.ok ? "text-success" : state ? "text-danger" : "text-subtle")}>
            {state?.message ?? "Les modifications sont publiées sur le site dès l'enregistrement."}
          </p>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-sm bg-accent px-5 font-medium text-accent-contrast disabled:opacity-60"
          >
            {pending && <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
