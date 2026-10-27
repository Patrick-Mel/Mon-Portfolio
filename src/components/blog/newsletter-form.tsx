"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { subscribeNewsletter } from "@/app/actions/public";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/types";
import { newsletterSchema, type ActionError, type NewsletterInput } from "@/lib/validation/forms";
import { Honeypot, Turnstile, useActionErrorText, useFieldErrorText, useStartedAt } from "@/components/forms/form-kit";

export function NewsletterForm() {
  const t = useTranslations("newsletter");
  const locale = useLocale() as Locale;
  const startedAt = useStartedAt();
  const fieldError = useFieldErrorText();
  const actionError = useActionErrorText();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<ActionError | "network" | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "", website: "", turnstileToken: "", locale, startedAt },
  });
  const onToken = useCallback((token: string) => setValue("turnstileToken", token), [setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const res = await subscribeNewsletter({ ...values, locale, startedAt });
      if (res.ok) setDone(true);
      else setServerError(res.error);
    } catch {
      setServerError("network");
    }
  });

  const err = fieldError(errors.email?.message) ?? (serverError ? actionError(serverError) : undefined);

  return (
    <section aria-labelledby="newsletter-title" className="chamfer relative bg-surface p-6 ring-1 ring-line ring-inset">
      <h2 id="newsletter-title" className="font-display text-xl tracking-tight">
        {t("title")}
      </h2>
      <p className="mt-2 text-sm text-muted">{t("text")}</p>
      {done ? (
        <p role="status" className="mt-5 flex gap-2 text-sm text-success">
          <span aria-hidden>✓</span> {t("success")}
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="relative mt-5 grid gap-3">
          <label htmlFor="newsletter-email" className="sr-only">
            {t("email")}
          </label>
          <input
            id="newsletter-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t("email")}
            aria-invalid={!!err}
            aria-describedby={err ? "newsletter-err" : undefined}
            className="h-11 w-full rounded-sm border border-line-strong bg-bg px-3.5 text-[0.9375rem] placeholder:text-subtle focus:border-fg focus:outline-none focus-visible:outline-2 focus-visible:outline-accent aria-[invalid=true]:border-danger"
            {...register("email")}
          />
          <Honeypot register={register("website")} />
          <Turnstile onToken={onToken} />
          {err && (
            <p id="newsletter-err" role="alert" className="text-sm text-danger">
              {err}
            </p>
          )}
          <Button type="submit" loading={isSubmitting}>
            {t("submit")}
          </Button>
        </form>
      )}
    </section>
  );
}
