import { NextResponse, type NextRequest } from "next/server";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { getServiceClient } from "@/lib/supabase/service";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function redirectTo(req: NextRequest, locale: Locale, status: "confirmed" | "unsubscribed" | "invalid") {
  const path = getPathname({ locale, href: { pathname: "/newsletter/[status]", params: { status } } });
  return NextResponse.redirect(new URL(path, req.url), 303);
}

async function handle(req: NextRequest, action: string) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const db = getServiceClient();
  if (!db || !UUID.test(token) || (action !== "confirm" && action !== "unsubscribe")) {
    return redirectTo(req, "fr", "invalid");
  }

  const { data: sub } = await db.from("subscribers").select("id, locale, status").eq("token", token).maybeSingle();
  if (!sub) return redirectTo(req, "fr", "invalid");
  const locale: Locale = sub.locale === "en" ? "en" : "fr";

  if (action === "confirm") {
    if (sub.status !== "unsubscribed") {
      await db.from("subscribers").update({ status: "confirmed", confirmed_at: new Date().toISOString() }).eq("id", sub.id);
      return redirectTo(req, locale, "confirmed");
    }
    return redirectTo(req, locale, "invalid");
  }

  await db.from("subscribers").update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() }).eq("id", sub.id);
  return redirectTo(req, locale, "unsubscribed");
}

/** Liens reçus par e-mail : /api/newsletter/confirm?token=… et /api/newsletter/unsubscribe?token=… */
export async function GET(req: NextRequest, { params }: RouteContext<"/api/newsletter/[action]">) {
  return handle(req, (await params).action);
}

/** Désinscription en un clic (RFC 8058, en-tête List-Unsubscribe-Post). */
export async function POST(req: NextRequest, { params }: RouteContext<"/api/newsletter/[action]">) {
  const { action } = await params;
  if (action !== "unsubscribe") return new Response(null, { status: 405 });
  await handle(req, action);
  return new Response(null, { status: 200 });
}
