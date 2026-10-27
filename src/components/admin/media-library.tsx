"use client";

import { Check, Copy, FileText, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteMedia, updateMediaAlt, uploadMedia, type MediaItem } from "@/app/admin/_actions/media";
import { ConfirmButton } from "./confirm-button";

const size = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} Mo` : `${Math.ceil(b / 1024)} Ko`);

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const upload = (files: FileList | null) => {
    if (!files?.length) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    setError(null);
    start(async () => {
      const res = await uploadMedia(fd);
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          upload(e.dataTransfer.files);
        }}
        className={`grid place-items-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors ${drag ? "border-accent bg-accent-soft" : "border-line-strong"}`}
      >
        <Upload aria-hidden className="text-subtle" />
        <p className="text-sm text-muted">Glissez-déposez des fichiers ici, ou</p>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={pending} className="h-10 rounded-sm bg-accent px-4 text-sm font-medium text-accent-contrast disabled:opacity-50">
          {pending ? "Optimisation et envoi…" : "Choisir des fichiers"}
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" className="sr-only" onChange={(e) => upload(e.target.files)} />
        <p className="text-xs text-subtle">Images converties en WebP (2400 px max, métadonnées retirées). SVG et PDF conservés. 10 Mo max.</p>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-center text-sm text-muted">La médiathèque est vide.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <li key={m.id} className="overflow-hidden rounded-lg border border-line bg-surface">
              <div className="grid aspect-video place-items-center bg-surface-2">
                {m.mime.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element -- aperçu de médiathèque
                  <img src={m.url} alt={m.alt} loading="lazy" className="size-full object-contain" />
                ) : (
                  <FileText size={32} aria-hidden className="text-muted" />
                )}
              </div>
              <div className="grid gap-2 p-3 text-sm">
                <p className="truncate font-medium" title={m.name}>
                  {m.name}
                </p>
                <p className="font-mono text-xs text-subtle">
                  {m.mime} · {size(m.size)}
                  {m.width ? ` · ${m.width}×${m.height}` : ""}
                </p>
                <form action={updateMediaAlt} className="flex gap-2">
                  <input type="hidden" name="id" value={m.id} />
                  <label htmlFor={`alt-${m.id}`} className="sr-only">
                    Texte alternatif
                  </label>
                  <input id={`alt-${m.id}`} name="alt" defaultValue={m.alt} placeholder="Texte alternatif" className="h-8 min-w-0 flex-1 rounded-xs border border-line px-2 text-xs" />
                  <button type="submit" className="h-8 rounded-xs border border-line px-2 text-xs hover:border-fg">
                    OK
                  </button>
                </form>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(m.url);
                      setCopied(m.id);
                      setTimeout(() => setCopied(null), 1500);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg"
                  >
                    {copied === m.id ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
                    {copied === m.id ? "Copiée" : "Copier l'URL"}
                  </button>
                  <form action={deleteMedia}>
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmButton message="Supprimer ce fichier ? Les pages qui l'utilisent afficheront une image manquante." className="text-xs text-danger hover:underline">
                      Supprimer
                    </ConfirmButton>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
