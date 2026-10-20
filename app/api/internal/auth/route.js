/**
 * app/api/internal/auth/route.js
 *
 * Internal Administrative Authentication & Session Management
 *
 * Endpoints:
 *  - POST /api/internal/auth : Login or Logout (state-changing actions use POST)
 *  - GET  /api/internal/auth : 405 Method Not Allowed (enforces POST-only state changes)
 */

import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createSession,
  verifySession,
  revokeSession,
  checkAndRecordLoginAttempt,
  safeCompare,
  getSessionCookieOptions,
} from "@/lib/sessionAuth";

// Re-export for compatibility with other internal routes
export { COOKIE_NAME, verifySession, revokeSession };

// ── POST: Login or Logout ────────────────────────────────────────────────────

export async function POST(request) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  }

  const ct = request.headers.get("content-type") || "";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // CSRF: verify Origin header matches Host if present
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json({ error: "cross_origin_forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "invalid_origin" }, { status: 400 });
    }
  }

  // Parse incoming payload (JSON or Form URL-Encoded)
  let body = {};
  const isForm = ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data");

  if (ct.includes("application/json")) {
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
  } else if (isForm) {
    try {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } catch {
      return NextResponse.json({ error: "invalid_form_data" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "invalid_content_type" }, { status: 400 });
  }

  // ── Action: LOGOUT ──────────────────────────────────────────────────────────
  if (body.action === "logout") {
    const rawToken = request.cookies.get(COOKIE_NAME)?.value;
    if (rawToken) {
      await revokeSession(rawToken);
    }

    if (isForm) {
      const redirectUrl = new URL("/internal/login", request.url);
      const res = NextResponse.redirect(redirectUrl, { status: 303 });
      res.cookies.set(COOKIE_NAME, "", { ...getSessionCookieOptions(), maxAge: 0 });
      return res;
    }

    const res = NextResponse.json({ success: true, message: "logged_out" });
    res.cookies.set(COOKIE_NAME, "", { ...getSessionCookieOptions(), maxAge: 0 });
    return res;
  }

  // ── Action: LOGIN (Default) ────────────────────────────────────────────────
  // 1. Cross-instance database rate limiting check
  const rl = await checkAndRecordLoginAttempt(ip);
  if (!rl || !rl.allowed) {
    const status = rl?.reason === "Too many attempts" ? 429 : 503;
    return NextResponse.json(
      { error: rl?.reason || "Rate limit unavailable" },
      { status }
    );
  }

  // 2. Validate password using constant-time string comparison
  const password = String(body.password || "").trim();
  if (!safeCompare(password, adminSecret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 3. Create server-side session in database
  const rawToken = await createSession(ip, userAgent);
  if (!rawToken) {
    return NextResponse.json(
      { error: "session_creation_failed", detail: "Database unavailable" },
      { status: 500 }
    );
  }

  // 4. Issue HttpOnly, Secure, SameSite=Strict cookie
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, rawToken, getSessionCookieOptions());
  return response;
}

// ── GET: Method Not Allowed ──────────────────────────────────────────────────
// Enforces Task 1 Requirement 11: State changes must not use GET.

export async function GET() {
  return new NextResponse("Method Not Allowed. Use POST for authentication actions.", {
    status: 405,
    headers: {
      Allow: "POST",
      "Content-Type": "text/plain",
    },
  });
}
