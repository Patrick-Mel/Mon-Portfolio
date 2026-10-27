/**
 * Définitions de champs des formulaires d'administration.
 * Le nom d'un champ est un chemin dans la ligne de base de données
 * (ex. `title` → colonne jsonb {fr,en}, `socials.github` → clé d'une colonne jsonb).
 * Le même descripteur sert au rendu (client) et à la validation (serveur).
 */
import { LOCALES } from "@/lib/types";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "url"
  | "email"
  | "slug"
  | "select"
  | "boolean"
  | "i18n"
  | "i18n-textarea"
  | "i18n-markdown"
  | "i18n-list"
  | "list"
  | "image"
  | "file"
  | "color"
  | "month"
  | "datetime"
  | "json"
  | "steps";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDef {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  help?: string;
  options?: FieldOption[];
  /** Pour `slug` : champ source (ex. `title.fr`). */
  slugFrom?: string;
  max?: number;
  accept?: string;
  placeholder?: string;
  /** Mise en page : `half` place deux champs côte à côte. */
  width?: "half" | "full";
  /** Valeur par défaut d'un nouvel élément. */
  defaultValue?: unknown;
}

export interface FieldGroup {
  title: string;
  description?: string;
  fields: FieldDef[];
}

/* eslint-disable @typescript-eslint/no-explicit-any -- valeurs de formulaire génériques */
export type Values = Record<string, any>;

export function getPath(obj: Values, path: string): any {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function setPath(obj: Values, path: string, value: unknown) {
  const keys = path.split(".");
  let cur = obj;
  keys.slice(0, -1).forEach((k) => {
    cur[k] = cur[k] && typeof cur[k] === "object" ? cur[k] : {};
    cur = cur[k];
  });
  cur[keys[keys.length - 1]!] = value;
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const HEX_RE = /^#[0-9a-f]{6}$/i;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const str = (fd: FormData, name: string) => {
  const v = fd.get(name);
  return typeof v === "string" ? v.trim() : "";
};
const lines = (s: string) =>
  s
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

function isUrl(s: string) {
  if (s.startsWith("/")) return true;
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Lit un FormData selon les définitions et renvoie la ligne à écrire,
 * ou des messages d'erreur par champ (validation serveur stricte).
 */
export function parseFields(
  fields: FieldDef[],
  fd: FormData,
): { ok: true; values: Values } | { ok: false; errors: Record<string, string> } {
  const values: Values = {};
  const errors: Record<string, string> = {};
  const fail = (name: string, msg: string) => (errors[name] ??= msg);

  for (const f of fields) {
    const max = f.max ?? (f.type.includes("textarea") || f.type.includes("markdown") ? 50000 : 300);
    switch (f.type) {
      case "text":
      case "textarea":
      case "email":
      case "url":
      case "slug":
      case "color":
      case "month":
      case "image":
      case "file":
      case "select": {
        const v = str(fd, f.name);
        if (!v) {
          if (f.required) fail(f.name, "Champ obligatoire.");
          setPath(values, f.name, f.type === "image" || f.type === "file" || f.type === "url" || f.type === "month" ? null : "");
          break;
        }
        if (v.length > max) fail(f.name, `${max} caractères maximum.`);
        if (f.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) fail(f.name, "Adresse e-mail invalide.");
        if ((f.type === "url" || f.type === "image" || f.type === "file") && !isUrl(v)) fail(f.name, "URL invalide.");
        if (f.type === "slug" && !SLUG_RE.test(v)) fail(f.name, "Minuscules, chiffres et tirets uniquement.");
        if (f.type === "color" && !HEX_RE.test(v)) fail(f.name, "Couleur hexadécimale attendue (#RRGGBB).");
        if (f.type === "month" && !MONTH_RE.test(v)) fail(f.name, "Format AAAA-MM attendu.");
        if (f.type === "select" && f.options && !f.options.some((o) => o.value === v)) fail(f.name, "Valeur non autorisée.");
        setPath(values, f.name, v);
        break;
      }
      case "number": {
        const raw = str(fd, f.name);
        const n = Number(raw);
        if (!raw && f.required) fail(f.name, "Champ obligatoire.");
        if (raw && !Number.isFinite(n)) fail(f.name, "Nombre attendu.");
        setPath(values, f.name, raw ? Math.round(n) : 0);
        break;
      }
      case "boolean":
        setPath(values, f.name, fd.get(f.name) === "on" || fd.get(f.name) === "true");
        break;
      case "datetime": {
        const v = str(fd, f.name);
        if (!v) {
          if (f.required) fail(f.name, "Champ obligatoire.");
          setPath(values, f.name, null);
          break;
        }
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) fail(f.name, "Date invalide.");
        else setPath(values, f.name, d.toISOString());
        break;
      }
      case "i18n":
      case "i18n-textarea":
      case "i18n-markdown": {
        const obj: Record<string, string> = {};
        for (const l of LOCALES) {
          const v = str(fd, `${f.name}.${l}`);
          if (f.required && !v) fail(f.name, `Traduction ${l.toUpperCase()} obligatoire.`);
          if (v.length > max) fail(f.name, `${max} caractères maximum.`);
          obj[l] = v;
        }
        // Champ facultatif entièrement vide → null (colonnes nullable).
        setPath(values, f.name, !f.required && LOCALES.every((l) => !obj[l]) ? null : obj);
        break;
      }
      case "i18n-list": {
        const obj: Record<string, string[]> = {};
        for (const l of LOCALES) obj[l] = lines(str(fd, `${f.name}.${l}`)).slice(0, 30);
        if (f.required && LOCALES.some((l) => !obj[l]!.length)) fail(f.name, "Au moins un élément par langue.");
        setPath(values, f.name, obj);
        break;
      }
      case "list": {
        const items = str(fd, f.name)
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 40);
        if (f.required && !items.length) fail(f.name, "Au moins un élément.");
        setPath(values, f.name, items);
        break;
      }
      case "json":
      case "steps": {
        const raw = str(fd, f.name) || "[]";
        try {
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed)) throw new Error();
          setPath(values, f.name, parsed);
        } catch {
          fail(f.name, "JSON invalide : un tableau est attendu.");
        }
        break;
      }
    }
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, values };
}

export const allFields = (groups: FieldGroup[]) => groups.flatMap((g) => g.fields);
