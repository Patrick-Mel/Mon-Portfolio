"use client";

import { Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const MIN = 1;
const MAX = 4;

/**
 * Affiche un contenu (schéma SVG, image) avec un bouton « agrandir » qui ouvre
 * une visionneuse plein écran : zoom (boutons, molette, clavier, pincement) et
 * déplacement (glisser). Utilise <dialog> natif : focus piégé et Échap gérés.
 */
export function Zoomable({
  children,
  labels,
  title,
}: {
  children: ReactNode;
  title: string;
  labels: { open: string; close: string; zoomIn: string; zoomOut: string; reset: string };
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);

  const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v));
  const zoom = useCallback((delta: number) => setScale((s) => clamp(Math.round((s + delta) * 100) / 100)), []);
  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const open = () => {
    reset();
    dialogRef.current?.showModal();
  };

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") zoom(0.5);
      if (e.key === "-") zoom(-0.5);
      if (e.key === "0") reset();
    };
    d.addEventListener("keydown", onKey);
    return () => d.removeEventListener("keydown", onKey);
  }, [zoom, reset]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setDragging(true);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { dist: Math.hypot(a!.x - b!.x, a!.y - b!.y), scale };
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      setScale(clamp((pinchStart.current.scale * dist) / pinchStart.current.dist));
    } else if (scale > 1) {
      setOffset((o) => ({ x: o.x + e.clientX - prev.x, y: o.y + e.clientY - prev.y }));
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) setDragging(false);
  };

  const ctrl =
    "grid size-10 place-items-center rounded-sm border border-line bg-surface text-fg transition-colors hover:border-fg disabled:opacity-40";

  return (
    <>
      <div className="group relative">
        {children}
        <button
          type="button"
          onClick={open}
          aria-label={`${labels.open} — ${title}`}
          className="absolute top-3 right-3 grid size-10 place-items-center rounded-sm border border-line bg-surface/90 text-fg opacity-90 backdrop-blur transition-[opacity,border-color] hover:border-fg md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
        >
          <Maximize2 size={16} aria-hidden />
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-label={title}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-bg p-0 text-fg backdrop:bg-black/60"
        onClose={reset}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
            <p className="truncate font-display text-lg">{title}</p>
            <div className="flex items-center gap-2">
              <button type="button" className={ctrl} onClick={() => zoom(-0.5)} disabled={scale <= MIN} aria-label={labels.zoomOut}>
                <Minus size={16} aria-hidden />
              </button>
              <span className="w-12 text-center font-mono text-xs text-muted" aria-live="polite">
                {Math.round(scale * 100)}%
              </span>
              <button type="button" className={ctrl} onClick={() => zoom(0.5)} disabled={scale >= MAX} aria-label={labels.zoomIn}>
                <Plus size={16} aria-hidden />
              </button>
              <button type="button" className={ctrl} onClick={reset} aria-label={labels.reset}>
                <RotateCcw size={16} aria-hidden />
              </button>
              <button type="button" className={ctrl} onClick={() => dialogRef.current?.close()} aria-label={labels.close}>
                <X size={16} aria-hidden />
              </button>
            </div>
          </div>
          <div
            className="bg-dots relative flex-1 touch-none overflow-hidden"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={(e) => zoom(e.deltaY < 0 ? 0.25 : -0.25)}
            style={{ cursor: scale > 1 ? "grab" : "zoom-in" }}
          >
            <div
              className="absolute inset-0 grid place-items-center p-4 md:p-10"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transition: dragging ? "none" : "transform 200ms cubic-bezier(.2,.8,.2,1)",
              }}
            >
              <div className="w-full max-w-6xl">{children}</div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
