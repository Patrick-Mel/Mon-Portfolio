import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";

const intl = createIntlMiddleware(routing);

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

/**
 * Garde optimiste de /admin : rafraîchit la session Supabase, renvoie vers la
 * connexion si besoin et impose l'étape TOTP quand un facteur est enregistré.
 * L'autorisation réelle est revérifiée côté serveur (requireAdmin + RLS).
 */
async function adminGuard(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { pathname } = request.nextUrl;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname === p);

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!user) {
    return isPublic || pathname === "/admin/login/mfa" ? response : redirectTo("/admin/login");
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const needsMfa = aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2";
  if (needsMfa && pathname !== "/admin/login/mfa") return redirectTo("/admin/login/mfa");
  if (!needsMfa && (isPublic || pathname === "/admin/login/mfa")) return redirectTo("/admin");

  return response;
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) return adminGuard(request);
  return intl(request);
}

export const config = {
  // Tout sauf l'API, les fichiers internes de Next et les fichiers statiques.
  matcher: ["/((?!api|_next|_vercel|icon|apple-icon|.*\\..*).*)"],
};
