import "server-only";
import { revalidatePath } from "next/cache";
import type { AdminContext } from "./auth";

/** Trace une action dans le journal d'activité (n'échoue jamais l'action principale). */
export async function logActivity(
  ctx: AdminContext,
  action: string,
  entity: string,
  entityId?: string | null,
  meta: Record<string, unknown> = {},
) {
  const { error } = await ctx.supabase.from("activity_log").insert({
    actor_id: ctx.user.id,
    actor_email: ctx.user.email,
    action,
    entity,
    entity_id: entityId ?? null,
    meta,
  });
  if (error) console.error("[activity]", error.message);
}

/** Rafraîchit tout le site public (ISR) après une modification de contenu. */
export function revalidatePublicSite() {
  revalidatePath("/[locale]", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/[locale]/rss.xml", "page");
}
