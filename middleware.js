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

  // Only redirect the exact old production hostname — no wildcards.
  if (host !== OLD_HOST) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  const destination = `${NEW_ORIGIN}${pathname}${search}`;

  return NextResponse.redirect(destination, { status: 308 });
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
