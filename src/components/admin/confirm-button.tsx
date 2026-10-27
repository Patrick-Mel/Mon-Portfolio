"use client";

import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";

/** Bouton de soumission avec confirmation native (actions destructrices). */
export function ConfirmButton({
  message = "Confirmer la suppression ? Cette action est définitive.",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { message?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={cn("disabled:opacity-50", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Bouton de soumission qui reflète l'état d'envoi du formulaire parent. */
export function SubmitButton({ className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending || undefined} className={cn("disabled:opacity-50", className)} {...rest}>
      {children}
    </button>
  );
}
