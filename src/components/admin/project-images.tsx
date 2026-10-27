"use client";

import { useActionState, useState } from "react";
import { addProjectImage, deleteProjectImage, type FormState } from "@/app/admin/_actions/content";
import { ConfirmButton } from "./confirm-button";
import { MediaPicker } from "./media-picker";

interface ImageRow {
  id: string;
  url: string;
  alt: { fr: string; en: string };
  kind: "gallery" | "diagram";
}

const input = "h-10 w-full rounded-sm border border-line-strong bg-surface px-3 text-sm focus:border-fg focus:outline-none";

/** Galerie et schémas téléversés (images/SVG) d'un projet. */
export function ProjectImages({ projectId, images }: { projectId: string; images: ImageRow[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addProjectImage, null);
  const [dims, setDims] = useState<{ width: number | null; height: number | null }>({ width: null, height: null });

  return (
    <section className="mt-6 rounded-lg border border-line bg-surface">
      <div className="border-b border-line px-5 py-4">
        <h2 className="font-display text-lg tracking-tight">Galerie et schémas téléversés</h2>
        <p className="mt-1 text-sm text-muted">Captures, photos ou schémas exportés (PNG, SVG…). Chaque image est zoomable sur la page du projet.</p>
      </div>
      <div className="grid gap-6 p-5">
        {images.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((img) => (
              <li key={img.id} className="overflow-hidden rounded-sm border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element -- vignette admin */}
                <img src={img.url} alt={img.alt.fr} className="aspect-video w-full bg-surface-2 object-cover" loading="lazy" />
                <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs">
                  <span className="truncate text-muted">{img.kind === "diagram" ? "Schéma" : "Galerie"} · {img.alt.fr}</span>
                  <form action={deleteProjectImage}>
                    <input type="hidden" name="id" value={img.id} />
                    <input type="hidden" name="projectId" value={projectId} />
                    <ConfirmButton message="Retirer cette image du projet ?" className="text-danger hover:underline">
                      Retirer
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
        <form action={action} className="grid gap-3 rounded-sm border border-dashed border-line-strong p-4 md:grid-cols-2">
          <input type="hidden" name="projectId" value={projectId} />
          {dims.width && <input type="hidden" name="width" value={dims.width} />}
          {dims.height && <input type="hidden" name="height" value={dims.height} />}
          <div className="md:col-span-2">
            <label htmlFor="img-url" className="mb-1.5 block text-sm font-medium">
              Image
            </label>
            <MediaPicker id="img-url" name="url" defaultValue={null} onPick={(m) => setDims({ width: m.width, height: m.height })} />
          </div>
          <input name="altFr" placeholder="Texte alternatif (FR) *" aria-label="Texte alternatif FR" className={input} required />
          <input name="altEn" placeholder="Alt text (EN) *" aria-label="Texte alternatif EN" className={input} required />
          <input name="captionFr" placeholder="Légende (FR)" aria-label="Légende FR" className={input} />
          <input name="captionEn" placeholder="Caption (EN)" aria-label="Légende EN" className={input} />
          <select name="kind" aria-label="Type" className={input} defaultValue="gallery">
            <option value="gallery">Galerie</option>
            <option value="diagram">Schéma (section « Schémas »)</option>
          </select>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={pending} className="h-10 rounded-sm bg-fg px-4 text-sm font-medium text-bg disabled:opacity-50">
              Ajouter l&apos;image
            </button>
            {state?.message && (
              <span role="status" className={state.ok ? "text-sm text-success" : "text-sm text-danger"}>
                {state.message}
              </span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
