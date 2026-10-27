"use client";

import { FileText, ImagePlus, Upload, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { listMedia, uploadMedia, type MediaItem } from "@/app/admin/_actions/media";
import { cn } from "@/lib/cn";

/**
 * Champ « média » : URL + aperçu + bibliothèque (choisir un fichier existant
 * ou en téléverser un nouveau, optimisé automatiquement côté serveur).
 */
export function MediaPicker({
  name,
  id,
  defaultValue,
  kind = "image",
  invalid,
  describedBy,
  onPick,
}: {
  name?: string;
  id: string;
  defaultValue: string | null;
  kind?: "image" | "pdf";
  invalid?: boolean;
  describedBy?: string;
  onPick?: (item: { url: string; width: number | null; height: number | null }) => void;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const dialog = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const open = () => {
    dialog.current?.showModal();
    start(async () => setItems(await listMedia(kind)));
  };
  const pick = (m: MediaItem) => {
    setValue(m.url);
    onPick?.({ url: m.url, width: m.width, height: m.height });
    dialog.current?.close();
  };
  const upload = (files: FileList | null) => {
    if (!files?.length) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    setError(null);
    start(async () => {
      const res = await uploadMedia(fd);
      if (!res.ok) setError(res.error);
      else {
        setItems((prev) => [...res.items, ...(prev ?? [])]);
        if (res.items.length === 1) pick(res.items[0]!);
      }
    });
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-stretch gap-2">
        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-sm border border-line bg-surface-2">
          {value && kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element -- aperçu admin d'une URL arbitraire
            <img src={value} alt="" className="size-full object-cover" />
          ) : value ? (
            <FileText size={18} aria-hidden className="text-muted" />
          ) : (
            <ImagePlus size={18} aria-hidden className="text-subtle" />
          )}
        </div>
        <input
          id={id}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={kind === "pdf" ? "https://…/cv.pdf" : "https://…/image.webp"}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={cn(
            "h-12 min-w-0 flex-1 rounded-sm border bg-surface px-3 font-mono text-xs focus:border-fg focus:outline-none",
            invalid ? "border-danger" : "border-line-strong",
          )}
        />
        <button type="button" onClick={open} className="h-12 shrink-0 rounded-sm border border-line-strong px-3 text-sm hover:border-fg">
          Choisir
        </button>
        {value && (
          <button type="button" onClick={() => setValue("")} aria-label="Retirer" className="grid h-12 w-10 shrink-0 place-items-center rounded-sm text-muted hover:text-danger">
            <X size={16} aria-hidden />
          </button>
        )}
      </div>

      <dialog ref={dialog} aria-label="Médiathèque" className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-lg border border-line bg-surface p-0 text-fg backdrop:bg-black/50">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <p className="font-display text-lg">Médiathèque</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-sm bg-accent px-3 text-sm font-medium text-accent-contrast">
              <Upload size={14} aria-hidden /> Téléverser
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept={kind === "pdf" ? "application/pdf" : "image/*"}
              className="sr-only"
              onChange={(e) => upload(e.target.files)}
            />
            <button type="button" onClick={() => dialog.current?.close()} aria-label="Fermer" className="grid size-9 place-items-center rounded-sm hover:bg-surface-2">
              <X size={16} aria-hidden />
            </button>
          </div>
        </div>
        <div className="max-h-[65vh] overflow-y-auto p-5">
          {error && (
            <p role="alert" className="mb-4 text-sm text-danger">
              {error}
            </p>
          )}
          {pending && !items ? (
            <p className="text-sm text-muted">Chargement…</p>
          ) : !items?.length ? (
            <p className="text-sm text-muted">Aucun fichier pour le moment. Téléversez-en un.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => pick(m)}
                    className={cn("group block w-full overflow-hidden rounded-sm border text-left hover:border-fg", m.url === value ? "border-accent" : "border-line")}
                  >
                    <span className="grid aspect-square place-items-center bg-surface-2">
                      {m.mime.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element -- vignette de médiathèque
                        <img src={m.url} alt={m.alt} loading="lazy" className="size-full object-cover" />
                      ) : (
                        <FileText size={28} aria-hidden className="text-muted" />
                      )}
                    </span>
                    <span className="block truncate px-2 py-1.5 text-xs text-muted">{m.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {pending && items && <p className="mt-3 text-xs text-subtle">Traitement…</p>}
        </div>
      </dialog>
    </div>
  );
}
