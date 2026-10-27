"use client";

import { useActionState, useState, useTransition } from "react";
import { confirmMfaEnroll, startMfaEnroll, type MfaEnrollState } from "@/app/admin/_actions/auth";

/** Activation de la double authentification TOTP (QR code + vérification d'un code). */
export function MfaSetup() {
  const [enroll, setEnroll] = useState<MfaEnrollState>(null);
  const [starting, start] = useTransition();
  const [state, action, pending] = useActionState(confirmMfaEnroll, null);

  if (state?.ok) {
    return (
      <p role="status" className="text-sm text-success">
        Double authentification activée. Elle sera demandée à chaque connexion.
      </p>
    );
  }

  if (!enroll?.qr) {
    return (
      <div className="grid gap-3">
        {enroll?.error && <p className="text-sm text-danger">{enroll.error}</p>}
        <button
          type="button"
          disabled={starting}
          onClick={() => start(async () => setEnroll(await startMfaEnroll()))}
          className="h-10 w-fit rounded-sm bg-accent px-4 text-sm font-medium text-accent-contrast disabled:opacity-50"
        >
          Activer la double authentification
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      {/* eslint-disable-next-line @next/next/no-img-element -- QR code SVG (data URL) fourni par Supabase */}
      <img src={enroll.qr} alt="QR code à scanner avec votre application d'authentification" className="size-[200px] rounded-sm bg-white p-2" />
      <form action={action} className="grid content-start gap-3">
        <p className="text-sm text-muted">
          1. Scannez ce QR code avec Google Authenticator, Aegis, 1Password…
          <br />
          2. Saisissez le code à 6 chiffres affiché.
        </p>
        <p className="font-mono text-xs break-all text-subtle">Clé manuelle : {enroll.secret}</p>
        <input type="hidden" name="factorId" value={enroll.factorId} />
        <label htmlFor="mfa-code" className="text-sm font-medium">
          Code de vérification
        </label>
        <input
          id="mfa-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={7}
          required
          className="h-11 w-48 rounded-sm border border-line-strong bg-surface px-3 text-center font-mono tracking-[0.3em]"
        />
        {(state?.error ?? enroll.error) && (
          <p role="alert" className="text-sm text-danger">
            {state?.error ?? enroll.error}
          </p>
        )}
        <button type="submit" disabled={pending} className="h-10 w-fit rounded-sm bg-fg px-4 text-sm font-medium text-bg disabled:opacity-50">
          Vérifier et activer
        </button>
      </form>
    </div>
  );
}
