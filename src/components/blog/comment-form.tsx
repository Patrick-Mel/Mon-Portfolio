"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { submitComment } from "@/app/actions/public";
import { Field, FormAlert, Honeypot, Input, Textarea, Turnstile, useActionErrorText, useFieldErrorText, useStartedAt } from "@/components/forms/form-kit";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/types";
import { commentSchema, type ActionError, type CommentInput } from "@/lib/validation/forms";

export function CommentForm({ postId, postSlug }: { postId: string; postSlug: string }) {
  const t = useTranslations("blog.comments");
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
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: { postId, postSlug, name: "", email: "", content: "", website: "", turnstileToken: "", locale, startedAt },
  });
  const onToken = useCallback((token: string) => setValue("turnstileToken", token), [setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const res = await submitComment({ ...values, locale, startedAt });
      if (res.ok) {
        setDone(true);
        reset();
      } else setServerError(res.error);
    } catch {
      setServerError("network");
    }
  });

  if (done) {
    return (
      <p role="status" className="rounded-md border border-line bg-surface p-5 text-sm text-fg">
        <span aria-hidden className="mr-2 text-success">
          ✓
        </span>
        {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5" aria-labelledby="comment-form-title">
      <h3 id="comment-form-title" className="font-display text-xl tracking-tight">
        {t("formTitle")}
      </h3>
      <p className="-mt-2 text-sm text-muted">{t("moderation")}</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("name")} required error={fieldError(errors.name?.message)}>
          {({ id, describedBy, invalid }) => <Input id={id} autoComplete="name" aria-describedby={describedBy} aria-invalid={invalid} {...register("name")} />}
        </Field>
        <Field label={t("email")} required error={fieldError(errors.email?.message)}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="email" autoComplete="email" aria-describedby={describedBy} aria-invalid={invalid} {...register("email")} />
          )}
        </Field>
      </div>
      <Field label={t("content")} required error={fieldError(errors.content?.message)}>
        {({ id, describedBy, invalid }) => <Textarea id={id} rows={5} aria-describedby={describedBy} aria-invalid={invalid} {...register("content")} />}
      </Field>
      <Honeypot register={register("website")} />
      <Turnstile onToken={onToken} />
      {serverError && <FormAlert>{actionError(serverError)}</FormAlert>}
      <div>
        <Button type="submit" loading={isSubmitting}>
          {t("submit")}
        </Button>
      </div>
    </form>
  );
}
