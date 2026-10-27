"use client";

import { useActionState, useId } from "react";
import { sendCampaign } from "@/app/admin/_actions/inbox";
import { MarkdownEditor } from "./markdown-field";

/** Rédaction et envoi d'une campagne ; peut être pré-remplie depuis un article. */
export function CampaignForm({ preset, confirmed }: { preset?: { subject: string; body: string }; confirmed: number }) {
  const [state, action, pending] = useActionState(sendCampaign, null);
  const bodyId = useId();
  const input = "h-10 w-full rounded-sm border border-line-strong bg-surface px-3 text-sm focus:border-fg focus:outline-none";
  return (
    <form
      action={action}
      className="grid gap-4"
      onSubmit={(e) => {
        if (!window.confirm(`Envoyer cette campagne aux abonnés confirmés (${confirmed}) ?`)) e.preventDefault();
      }}
    >
      <div className="grid gap-4 md:grid-cols-[1fr_200px]">
        <div className="grid gap-1.5">
          <label htmlFor="c-subject" className="text-sm font-medium">
            Objet
          </label>
          <input id="c-subject" name="subject" defaultValue={preset?.subject} required className={input} />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="c-audience" className="text-sm font-medium">
            Audience
          </label>
          <select id="c-audience" name="audience" className={input} defaultValue="all">
            <option value="all">Tous</option>
            <option value="fr">Abonnés FR</option>
            <option value="en">Abonnés EN</option>
          </select>
        </div>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor={bodyId} className="text-sm font-medium">
          Contenu (Markdown)
        </label>
        <MarkdownEditor id={bodyId} name="body" defaultValue={preset?.body ?? ""} rows={10} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending || confirmed === 0} className="h-10 rounded-sm bg-accent px-4 text-sm font-medium text-accent-contrast disabled:opacity-50">
          {pending ? "Envoi en cours…" : "Envoyer la campagne"}
        </button>
        <span className="text-xs text-subtle">Un lien de désinscription personnel est ajouté automatiquement.</span>
        {state?.ok && (
          <span role="status" className="text-sm text-success">
            Envoyée à {state.sent} abonné(s).
          </span>
        )}
        {state?.error && (
          <span role="alert" className="text-sm text-danger">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
