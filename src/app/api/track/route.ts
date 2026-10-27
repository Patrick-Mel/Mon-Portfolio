import { userAgent, type NextRequest } from "next/server";
import { z } from "zod";
import { hashValue, rateLimit } from "@/lib/security";
import { getServiceClient } from "@/lib/supabase/service";

const bodySchema = z.object({
  path: z.string().max(300).startsWith("/"),
  locale: z.enum(["fr", "en"]).optional(),
  referrer: z.string().max(500).optional().default(""),
});

/**
 * Collecte d'une page vue, sans cookie. L'empreinte visiteur est
 * sha256(ip + user-agent + date du jour + sel) : impossible de suivre
 * quelqu'un d'un jour à l'autre, ni de retrouver son IP.
 */
export async function POST(req: NextRequest) {
  // Même origine uniquement (protection CSRF / pollution des statistiques).
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.nextUrl.host) return new Response(null, { status: 403 });
  if (req.headers.get("dnt") === "1" || req.headers.get("sec-gpc") === "1") return new Response(null, { status: 204 });

  const db = getServiceClient();
  if (!db) return new Response(null, { status: 204 });

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return new Response(null, { status: 400 });
  }

  const ua = userAgent(req);
  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] ?? "0.0.0.0").trim();
  const day = new Date().toISOString().slice(0, 10);
  const visitor = hashValue(`${ip}|${ua.ua}`, `visitor:${day}`);
  if (!(await rateLimit(`track:${visitor}`, 120, 3600))) return new Response(null, { status: 204 });

  let referrerHost: string | null = null;
  try {
    const host = body.referrer ? new URL(body.referrer).host : "";
    referrerHost = host && host !== req.nextUrl.host ? host.replace(/^www\./, "") : null;
  } catch {
    referrerHost = null;
  }

  const device = ua.isBot ? "bot" : ua.device.type === "mobile" ? "mobile" : ua.device.type === "tablet" ? "tablet" : "desktop";
  const { error } = await db.from("page_views").insert({
    path: body.path.split("?")[0],
    locale: body.locale ?? null,
    referrer_host: referrerHost,
    country: req.headers.get("x-vercel-ip-country") ?? null,
    device,
    visitor_hash: visitor,
  });
  if (error) console.error("[track]", error.message);
  return new Response(null, { status: 204 });
}
