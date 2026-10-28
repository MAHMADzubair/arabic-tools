import { NextResponse } from "next/server";

/**
 * middleware.js
 *
 * Domain-migration redirect: arabic-tools-xi.vercel.app → qemlo.com
 *
 * Rules:
 *  - Only fires on the exact old production hostname.
 *  - Preserves pathname + search string.
 *  - Does NOT redirect qemlo.com (no loop).
 *  - Does NOT redirect *.vercel.app preview deployments.
 *  - Does NOT redirect localhost / development.
 *  - Uses HTTP 308 (Permanent Redirect, method-preserving).
 *
 * This matcher runs on every request path (excluding _next/static,
 * _next/image, favicon, etc. which are excluded below to avoid overhead).
 */

const OLD_HOST = "arabic-tools-xi.vercel.app";
const NEW_ORIGIN = "https://qemlo.com";

export function middleware(request) {
  const host = request.headers.get("host") || "";

  const { pathname, search } = request.nextUrl;

  // Preserve exact legacy-domain migration redirect.
  if (host === OLD_HOST) {
    const destination = `${NEW_ORIGIN}${pathname}${search}`;
    return NextResponse.redirect(destination, { status: 308 });
  }

  // Deny privileged admin requests before App Router rendering if MFA has not
  // been explicitly provisioned. A public sign-in form may remain available,
  // but a nested layout alone is not the only authorization boundary.
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLogin = pathname === "/admin/login" || pathname === "/admin/login/";
  if (process.env.VERCEL_ENV === "production" && isAdminPage && !isLogin) {
    const readyForMfaRouting =
      process.env.ADMIN_MFA_ENABLED === "true" &&
      Boolean(process.env.ADMIN_LOGIN_EMAIL) &&
      Boolean(process.env.ADMIN_SECRET && process.env.ADMIN_SECRET.length >= 24) &&
      Boolean(process.env.ADMIN_TOTP_SECRET) &&
      Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (!readyForMfaRouting) {
      return new NextResponse("Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths EXCEPT:
   *  - _next/static  (static assets)
   *  - _next/image   (image optimisation)
   *  - favicon.ico
   *  - robots.txt
   *  - sitemap.xml
   *
   * These are excluded so the middleware does not add latency to
   * pure-asset requests even when the host check would short-circuit anyway.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)",
  ],
};
