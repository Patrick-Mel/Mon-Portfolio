"use client";

import { useTranslations } from "next-intl";
import { forwardRef, useEffect, useId, useRef, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { publicEnv } from "@/lib/env";
import { cn } from "@/lib/cn";
import type { ActionError } from "@/lib/validation/forms";

/* ---------- Traduction des codes d'erreur « clé:paramètre » ---------- */
export function useFieldErrorText() {
  const t = useTranslations("validation");
  return (code?: string) => {
    if (!code) return undefined;
    const [key, param] = code.split(":");
    const n = Number(param);
    switch (key) {
      case "required":
      case "email":
      case "invalid":
      case "fileTooLarge":
      case "fileType":
      case "tooManyFiles":
        return t(key);
      case "tooShort":
        return t("tooShort", { min: n });
      case "tooLong":
        return t("tooLong", { max: n });
      default:
        return t("invalid");
    }
  };
}

export function useActionErrorText() {
  const t = useTranslations("errors");
  return (e: ActionError | "network") => t(e === "validation" ? "validation" : e);
}

/* ---------- Champs ---------- */
const control =
  "w-full rounded-sm border bg-surface px-3.5 text-[0.9375rem] text-fg placeholder:text-subtle transition-colors " +
  "focus:border-fg focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent " +
  "aria-[invalid=true]:border-danger disabled:opacity-60";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optionalLabel?: string;
  className?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

export function Field({ label, error, hint, required, optionalLabel, className, children }: FieldProps) {
  const id = useId();
  const t = useTranslations("forms");
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
        {required ? (
          <span className="ml-0.5 text-accent-ink" aria-hidden>
            *
          </span>
        ) : (
          optionalLabel && <span className="ml-1.5 font-normal text-subtle">({optionalLabel})</span>
        )}
        {required && <span className="sr-only"> ({t("required")})</span>}
      </label>
      {children({ id, describedBy: [hintId, errId].filter(Boolean).join(" ") || undefined, invalid: !!error })}
      {hint && (
        <p id={hintId} className="text-xs text-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className="flex items-center gap-1.5 text-sm text-danger" role="alert">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
            <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.5v4M8 10.8v.2" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cn(control, "h-12", className)} {...p} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...p }, ref) {
  return <textarea ref={ref} className={cn(control, "min-h-36 resize-y py-3 leading-relaxed", className)} {...p} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...p }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(control, "h-12 appearance-none pr-10", className)} {...p}>
        {children}
      </select>
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-subtle">
        <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
});

/* ---------- Pot de miel (invisible pour les humains, y compris lecteurs d'écran) ---------- */
export function Honeypot({ register }: { register: object }) {
  const t = useTranslations("forms");
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        {t("honeypot")}
        <input type="text" tabIndex={-1} autoComplete="off" {...register} />
      </label>
    </div>
  );
}

/** Horodatage d'affichage du formulaire (contrôle anti-robot côté serveur). */
export function useStartedAt() {
  const [startedAt] = useState(() => Date.now());
  return startedAt;
}

/* ---------- Cloudflare Turnstile (chargé seulement si une clé est configurée) ---------- */
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

let turnstileScript: Promise<void> | null = null;
function loadTurnstile() {
  turnstileScript ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile"));
    document.head.appendChild(s);
  });
  return turnstileScript;
}

export function Turnstile({ onToken, resetKey }: { onToken: (token: string) => void; resetKey?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations("forms");
  const siteKey = publicEnv.turnstileSiteKey;

  useEffect(() => {
    if (!siteKey || !ref.current) return;
    let widgetId: string | undefined;
    let cancelled = false;
    const el = ref.current;
    // Chargement différé : le script n'est demandé qu'à l'approche du formulaire.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        loadTurnstile()
          .then(() => {
            if (cancelled || !window.turnstile) return;
            widgetId = window.turnstile.render(el, {
              sitekey: siteKey,
              theme: document.documentElement.dataset.theme === "dark" ? "dark" : "light",
              callback: onToken,
              "expired-callback": () => onToken(""),
            });
          })
          .catch(() => onToken(""));
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      if (widgetId) window.turnstile?.remove(widgetId);
    };
    // resetKey : force un nouveau widget après un envoi.
  }, [siteKey, onToken, resetKey]);

  if (!siteKey) return null;
  return <div ref={ref} aria-label={t("turnstile")} className="min-h-[65px]" />;
}

/* ---------- États de soumission ---------- */
export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex gap-3 rounded-md border border-danger/40 bg-[color-mix(in_oklab,var(--danger)_8%,transparent)] p-4 text-sm text-fg">
      <span aria-hidden className="mt-1 size-2 shrink-0 rotate-45 bg-danger" />
      {children}
    </div>
  );
}

export function FormSuccess({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div ref={ref} tabIndex={-1} role="status" className="flex flex-col items-start gap-4 rounded-lg border border-line bg-surface p-8 outline-none">
      <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden className="text-success">
        <path d="M11 2.5H45.5V37L37 45.5H2.5V11Z" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m15 24 6.5 6.5L34 18" fill="none" stroke="currentColor" strokeWidth="2.5" />
      </svg>
      <h3 className="font-display text-2xl tracking-tight">{title}</h3>
      <p className="text-muted">{text}</p>
      {action}
    </div>
  );
}
