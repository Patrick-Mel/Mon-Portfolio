"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { submitContact } from "@/app/actions/public";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { contactSchema, type ActionError, type ContactInput } from "@/lib/validation/forms";
import { Field, FormAlert, FormSuccess, Honeypot, Input, Textarea, Turnstile, useActionErrorText, useFieldErrorText, useStartedAt } from "./form-kit";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const tf = useTranslations("forms");
  const locale = useLocale() as Locale;
  const startedAt = useStartedAt();
  const fieldError = useFieldErrorText();
  const actionError = useActionErrorText();
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [serverError, setServerError] = useState<ActionError | "network" | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", website: "", turnstileToken: "", locale, startedAt },
  });
  const onToken = useCallback((token: string) => setValue("turnstileToken", token), [setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const res = await submitContact({ ...values, locale, startedAt });
      if (res.ok) {
        setStatus("success");
        reset();
        return;
      }
      if (res.fieldErrors) {
        for (const [k, v] of Object.entries(res.fieldErrors)) setError(k as keyof ContactInput, { message: v });
      }
      setServerError(res.error);
      setResetKey((k) => k + 1);
    } catch {
      setServerError("network");
    }
  });

  if (status === "success") {
    return (
      <FormSuccess
        title={t("successTitle")}
        text={t("success")}
        action={
          <Button variant="secondary" onClick={() => setStatus("idle")}>
            {tf("sendAnother")}
          </Button>
        }
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-6" aria-label={t("title")}>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t("name")} required error={fieldError(errors.name?.message)}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} autoComplete="name" aria-describedby={describedBy} aria-invalid={invalid} {...register("name")} />
          )}
        </Field>
        <Field label={t("email")} required error={fieldError(errors.email?.message)}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="email" autoComplete="email" inputMode="email" aria-describedby={describedBy} aria-invalid={invalid} {...register("email")} />
          )}
        </Field>
      </div>
      <Field label={t("subject")} required error={fieldError(errors.subject?.message)}>
        {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...register("subject")} />}
      </Field>
      <Field label={t("message")} required error={fieldError(errors.message?.message)}>
        {({ id, describedBy, invalid }) => <Textarea id={id} rows={7} aria-describedby={describedBy} aria-invalid={invalid} {...register("message")} />}
      </Field>
      <Honeypot register={register("website")} />
      <Turnstile onToken={onToken} resetKey={resetKey} />
      {serverError && <FormAlert>{actionError(serverError)}</FormAlert>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs text-subtle">
          <Link href="/privacy" className="underline underline-offset-2 hover:text-fg">
            {tf("privacyNote")}
          </Link>
        </p>
        <Button type="submit" size="lg" loading={isSubmitting}>
          {isSubmitting ? tf("sending") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
