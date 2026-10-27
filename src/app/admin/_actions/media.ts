"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { z } from "zod";
import { logActivity } from "@/lib/admin/activity";
import { assertAdmin } from "@/lib/admin/auth";

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  created_at: string;
}

const MAX_BYTES = 10 * 1024 * 1024;
const RASTER = ["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif"];
const ALLOWED = [...RASTER, "image/svg+xml", "application/pdf"];

/** Nettoyage minimal d'un SVG : refuse scripts, gestionnaires d'événements et contenus externes. */
function isSafeSvg(text: string): boolean {
  return !/<script|on\w+\s*=|javascript:|<foreignObject|xlink:href\s*=\s*["']https?:|<iframe|<embed/i.test(text);
}

export type UploadResult = { ok: true; items: MediaItem[] } | { ok: false; error: string };

/**
 * Téléversement dans la médiathèque. Les images matricielles sont optimisées
 * automatiquement (rotation EXIF, redimensionnement 2400 px max, WebP qualité 82,
 * suppression des métadonnées). SVG et PDF sont conservés tels quels.
 */
export async function uploadMedia(fd: FormData): Promise<UploadResult> {
  const ctx = await assertAdmin();
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { ok: false, error: "Aucun fichier." };
  const items: MediaItem[] = [];

  for (const file of files.slice(0, 10)) {
    if (file.size > MAX_BYTES) return { ok: false, error: `${file.name} : 10 Mo maximum.` };
    if (!ALLOWED.includes(file.type)) return { ok: false, error: `${file.name} : type non accepté (${file.type || "inconnu"}).` };

    let body: Buffer = Buffer.from(await file.arrayBuffer());
    let mime = file.type;
    let ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    let width: number | null = null;
    let height: number | null = null;

    if (RASTER.includes(file.type) && file.type !== "image/gif") {
      const out = await sharp(body)
        .rotate()
        .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });
      body = out.data;
      width = out.info.width;
      height = out.info.height;
      mime = "image/webp";
      ext = "webp";
    } else if (file.type === "image/svg+xml") {
      if (!isSafeSvg(body.toString("utf8"))) return { ok: false, error: `${file.name} : SVG refusé (script ou contenu actif).` };
    }

    const now = new Date();
    const path = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${ext}`;
    const { error } = await ctx.supabase.storage.from("media").upload(path, body, {
      contentType: mime,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) return { ok: false, error: `${file.name} : ${error.message}` };

    const url = ctx.supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
    const { data, error: insErr } = await ctx.supabase
      .from("media")
      .insert({ bucket: "media", path, url, name: file.name.slice(0, 200), mime, size: body.length, width, height })
      .select("*")
      .single();
    if (insErr) return { ok: false, error: insErr.message };
    items.push(data as MediaItem);
    await logActivity(ctx, "upload", "media", data.id, { name: file.name });
  }
  revalidatePath("/admin/media");
  return { ok: true, items };
}

export async function listMedia(kind: "image" | "pdf" | "all" = "all"): Promise<MediaItem[]> {
  const ctx = await assertAdmin();
  let q = ctx.supabase.from("media").select("*").order("created_at", { ascending: false }).limit(200);
  if (kind === "image") q = q.like("mime", "image/%");
  if (kind === "pdf") q = q.eq("mime", "application/pdf");
  const { data } = await q;
  return (data ?? []) as MediaItem[];
}

export async function updateMediaAlt(fd: FormData): Promise<void> {
  const ctx = await assertAdmin();
  const id = z.string().uuid().parse(fd.get("id"));
  const alt = z.string().trim().max(300).parse(fd.get("alt") ?? "");
  await ctx.supabase.from("media").update({ alt }).eq("id", id);
  revalidatePath("/admin/media");
}

export async function deleteMedia(fd: FormData): Promise<void> {
  const ctx = await assertAdmin();
  const id = z.string().uuid().parse(fd.get("id"));
  const { data } = await ctx.supabase.from("media").select("path").eq("id", id).maybeSingle();
  if (data?.path) await ctx.supabase.storage.from("media").remove([data.path as string]);
  await ctx.supabase.from("media").delete().eq("id", id);
  await logActivity(ctx, "delete", "media", id);
  revalidatePath("/admin/media");
}
