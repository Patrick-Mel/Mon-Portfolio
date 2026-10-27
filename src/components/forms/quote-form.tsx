"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Paperclip, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { submitQuote } from "@/app/actions/public";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import {
  ATTACHMENT_TYPES,
  BUDGETS,
  TIMELINES,
  quoteSchema,
  validateAttachments,
  type ActionError,
  type QuoteInput,
} from "@/lib/validation/forms";
import { Field, FormAlert, FormSuccess, Honeypot, Input, Select, Textarea, Turnstile, useActionErrorText, useFieldErrorText, useStartedAt } from "./form-kit";

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-6 border-t border-line pt-8 first:border-t-0 first:pt-0">
      <legend className="float-left mb-6 flex w-full items-baseline gap-3 font-display text-xl tracking-tight">
        <span className="font-mono text-sm text-accent-ink">{String(n).padStart(2, "0")}</span>
        {title}
      </legend>
      <div className="clear-both grid gap-6">{children}</div>
    </fieldset>
  );
}

/** Taille lisible et localisée (« 1,2 Mo » / « 1.2 MB »). */
const formatSize = (bytes: number, locale: Locale) => {
  const mb = bytes > 1024 * 1024;
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: mb ? "megabyte" : "kilobyte",
    unitDisplay: "short",
    maximumFractionDigits: 1,
  }).format(mb ? bytes / 1024 / 1024 : Math.ceil(bytes / 1024));
};

export function QuoteForm({ services }: { services: { value: string; label: string }[] }) {
  const t = useTranslations("quote");
  const tf = useTranslations("forms");
  const locale = useLocale() as Locale;
  const params = useSearchParams();
  const startedAt = useStartedAt();
  const fieldError = useFieldErrorText();
  const actionError = useActionErrorText();
  const fileInput = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | undefined>();
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [serverError, setServerError] = useState<ActionError | "network" | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const preset = params.get("service");
  const initialService = preset && services.some((s) => s.value === preset) ? preset : "";

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      service: initialService,
      description: "",
      name: "",
      email: "",
      phone: "",
      company: "",
      website: "",
      turnstileToken: "",
      locale,
      startedAt,
    },
  });
  const onToken = useCallback((token: string) => setValue("turnstileToken", token), [setValue]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files, ...Array.from(list)];
    const err = validateAttachments(next);
    setFileError(err ?? undefined);
    if (!err) setFiles(next);
    if (fileInput.current) fileInput.current.value = "";
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const fd = new FormData();
    for (const [k, v] of Object.entries({ ...values, locale, startedAt })) fd.append(k, String(v ?? ""));
    files.forEach((f) => fd.append("attachments", f));
    try {
      const res = await submitQuote(fd);
      if (res.ok) {
        setStatus("success");
        setFiles([]);
        reset();
        return;
      }
      if (res.fieldErrors) {
        for (const [k, v] of Object.entries(res.fieldErrors)) {
          if (k === "attachments") setFileError(v);
          else setError(k as keyof QuoteInput, { message: v });
        }
      }
      setServerError(res.error);
      setResetKey((k) => k + 1);
    } catch {
      setServerError("network");
    }
  });

  if (status === "success") {
    return <FormSuccess title={t("form.successTitle")} text={t("form.success")} />;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-10" aria-label={t("title")}>
      <Step n={1} title={t("steps.project")}>
        <Field label={t("form.service")} required error={fieldError(errors.service?.message)}>
          {({ id, describedBy, invalid }) => (
            <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} {...register("service")}>
              <option value="">{t("form.servicePlaceholder")}</option>
              {services.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
              <option value="other">{t("form.other")}</option>
            </Select>
          )}
        </Field>
        <Field label={t("form.description")} hint={t("form.descriptionHint")} required error={fieldError(errors.description?.message)}>
          {({ id, describedBy, invalid }) => <Textarea id={id} rows={8} aria-describedby={describedBy} aria-invalid={invalid} {...register("description")} />}
        </Field>
      </Step>

      <Step n={2} title={t("steps.details")}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t("form.budget")} required error={fieldError(errors.budget?.message)}>
            {({ id, describedBy, invalid }) => (
              <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} defaultValue="" {...register("budget")}>
                <option value="" disabled>
                  —
                </option>
                {BUDGETS.map((b) => (
                  <option key={b} value={b}>
                    {t(`budgets.${b}`)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t("form.timeline")} required error={fieldError(errors.timeline?.message)}>
            {({ id, describedBy, invalid }) => (
              <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} defaultValue="" {...register("timeline")}>
                <option value="" disabled>
                  —
                </option>
                {TIMELINES.map((tl) => (
                  <option key={tl} value={tl}>
                    {t(`timelines.${tl}`)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        <Field label={t("form.attachments")} hint={t("form.attachmentsHint")} error={fieldError(fileError)}>
          {({ id, describedBy, invalid }) => (
            <div className="grid gap-3">
              <label
                htmlFor={id}
                className="flex cursor-pointer items-center justify-center gap-3 rounded-sm border border-dashed border-line-strong bg-surface px-4 py-6 text-sm text-muted transition-colors hover:border-fg hover:text-fg"
              >
                <Paperclip size={16} aria-hidden />
                {t("form.attachments")}
              </label>
              <input
                ref={fileInput}
                id={id}
                type="file"
                multiple
                accept={Object.keys(ATTACHMENT_TYPES).join(",")}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                className="sr-only"
                onChange={(e) => addFiles(e.target.files)}
              />
              {files.length > 0 && (
                <ul className="grid gap-2">
                  {files.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 rounded-sm border border-line bg-surface px-3 py-2 text-sm">
                      <span className="truncate">{f.name}</span>
                      <span className="flex shrink-0 items-center gap-3 font-mono text-xs text-subtle">
                        {formatSize(f.size, locale)}
                        <button
                          type="button"
                          onClick={() => setFiles(files.filter((_, j) => j !== i))}
                          aria-label={t("form.removeFile", { name: f.name })}
                          className="grid size-8 place-items-center rounded-sm hover:bg-surface-2 hover:text-fg"
                        >
                          <X size={14} aria-hidden />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Field>
      </Step>

      <Step n={3} title={t("steps.contact")}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t("form.name")} required error={fieldError(errors.name?.message)}>
            {({ id, describedBy, invalid }) => <Input id={id} autoComplete="name" aria-describedby={describedBy} aria-invalid={invalid} {...register("name")} />}
          </Field>
          <Field label={t("form.email")} required error={fieldError(errors.email?.message)}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="email" inputMode="email" autoComplete="email" aria-describedby={describedBy} aria-invalid={invalid} {...register("email")} />
            )}
          </Field>
          <Field label={t("form.phone")} optionalLabel={t("form.optional")} error={fieldError(errors.phone?.message)}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="tel" inputMode="tel" autoComplete="tel" aria-describedby={describedBy} aria-invalid={invalid} {...register("phone")} />
            )}
          </Field>
          <Field label={t("form.company")} optionalLabel={t("form.optional")} error={fieldError(errors.company?.message)}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} autoComplete="organization" aria-describedby={describedBy} aria-invalid={invalid} {...register("company")} />
            )}
          </Field>
        </div>
      </Step>

      <Honeypot register={register("website")} />
      <Turnstile onToken={onToken} resetKey={resetKey} />
      {serverError && <FormAlert>{actionError(serverError)}</FormAlert>}
      <div className="flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs text-subtle">
          <Link href="/privacy" className="underline underline-offset-2 hover:text-fg">
            {tf("privacyNote")}
          </Link>
        </p>
        <Button type="submit" size="lg" loading={isSubmitting}>
          {isSubmitting ? tf("sending") : t("form.submit")}
        </Button>
      </div>
    </form>
  );
}
