"use client";

import { Download } from "lucide-react";
import { useActionState, useTransition } from "react";
import { attachmentUrl, replyByEmail } from "@/app/admin/_actions/inbox";

export function AttachmentLink({ path, name, size }: { path: string; name: string; size: number }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const url = await attachmentUrl(path);
          if (url) window.location.href = url;
        })
      }
      className="inline-flex items-center gap-2 rounded-sm border border-line px-3 py-2 text-sm hover:border-fg disabled:opacity-50"
    >
      <Download size={14} aria-hidden />
      {name}
      <span className="font-mono text-xs text-subtle">{Math.ceil(size / 1024)} Ko</span>
    </button>
  );
}

export function ReplyForm({ type, id, defaultSubject }: { type: "message" | "quote"; id: string; defaultSubject: string }) {
  const [state, action, pending] = useActionState(replyByEmail, null);
  const input = "w-full rounded-sm border border-line-strong bg-surface px-3 text-sm focus:border-fg focus:outline-none";
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="id" value={id} />
      <label htmlFor="reply-subject" className="text-sm font-medium">
        Objet
      </label>
      <input id="reply-subject" name="subject" defaultValue={defaultSubject} required className={`${input} h-10`} />
      <label htmlFor="reply-body" className="text-sm font-medium">
        Message (Markdown accepté)
      </label>
      <textarea id="reply-body" name="body" rows={8} required className={`${input} py-2.5`} />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="h-10 rounded-sm bg-accent px-4 text-sm font-medium text-accent-contrast disabled:opacity-50">
          {pending ? "Envoi…" : "Envoyer la réponse"}
        </button>
        {state?.ok && (
          <span role="status" className="text-sm text-success">
            Réponse envoyée, statut passé à « En cours ».
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
