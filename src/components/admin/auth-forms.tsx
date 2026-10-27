"use client";

import { useActionState } from "react";
import { signIn, verifyMfa, type AuthState } from "@/app/admin/_actions/auth";
import { Button } from "@/components/ui/button";

const input =
  "h-12 w-full rounded-sm border border-line-strong bg-surface px-3.5 text-[0.9375rem] focus:border-fg focus:outline-none focus-visible:outline-2 focus-visible:outline-accent";

function ErrorBox({ state }: { state: AuthState }) {
  if (!state?.error) return null;
  return (
    <p role="alert" className="rounded-sm border border-danger/40 bg-[color-mix(in_oklab,var(--danger)_8%,transparent)] px-3 py-2 text-sm">
      {state.error}
    </p>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Adresse e-mail
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className={input} />
      </div>
      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          Mot de passe
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} className={input} />
      </div>
      <ErrorBox state={state} />
      <Button type="submit" size="lg" loading={pending}>
        Se connecter
      </Button>
    </form>
  );
}

export function MfaForm() {
  const [state, action, pending] = useActionState(verifyMfa, null);
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="code" className="text-sm font-medium">
          Code à 6 chiffres de votre application d&apos;authentification
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          required
          autoFocus
          className={`${input} text-center font-mono text-xl tracking-[0.4em]`}
        />
      </div>
      <ErrorBox state={state} />
      <Button type="submit" size="lg" loading={pending}>
        Vérifier
      </Button>
    </form>
  );
}
