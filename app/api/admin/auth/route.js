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

export async function POST(request) {
  // Never issue privileged admin sessions in production until MFA is implemented.
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "admin_temporarily_unavailable" }, { status: 503 });
  }
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json(
      { error: "ADMIN_SECRET not configured on server" },
      { status: 503 }
    );
  }

  const ct = request.headers.get("content-type") || "";
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // CSRF validation
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json(
          { error: "cross_origin_forbidden" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json({ error: "invalid_origin" }, { status: 400 });
    }
  }

  let body = {};
  if (ct.includes("application/json")) {
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }
  } else if (
    ct.includes("application/x-www-form-urlencoded") ||
    ct.includes("multipart/form-data")
  ) {
    try {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } catch {
      return NextResponse.json({ error: "invalid_form_data" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "invalid_content_type" }, { status: 400 });
  }

  // ── Logout Action ──────────────────────────────────────────
  if (body.action === "logout") {
    const rawToken = request.cookies.get(COOKIE_NAME)?.value;
    if (rawToken) {
      await revokeSession(rawToken);
    }
    const res = NextResponse.json({ success: true, message: "logged_out" });
    res.cookies.set(COOKIE_NAME, "", {
      ...getSessionCookieOptions(),
      maxAge: 0,
    });
    return res;
  }

  // ── Login Action ───────────────────────────────────────────
  // 1. Cross-instance atomic rate limit check
  const rl = await checkAndRecordLoginAttempt(ip);
  if (!rl || !rl.allowed) {
    const status = rl?.reason === "Too many attempts" ? 429 : 503;
    return NextResponse.json(
      { error: rl?.reason || "Rate limit unavailable" },
      { status }
    );
  }

  // 2. Validate password in constant time
  const password = String(body.password || "").trim();
  if (!safeCompare(password, adminSecret)) {
    return NextResponse.json(
      { error: "Invalid administrative credentials" },
      { status: 401 }
    );
  }

  // 3. Create cryptographically secure server session
  const rawToken = await createSession(ip, userAgent);
  if (!rawToken) {
    return NextResponse.json(
      { error: "Session creation failed: database unavailable" },
      { status: 500 }
    );
  }

  // 4. Issue HttpOnly, Secure, SameSite=Strict cookie
  const response = NextResponse.json({
    success: true,
    redirect: "/admin",
  });
  response.cookies.set(COOKIE_NAME, rawToken, getSessionCookieOptions());
  return response;
}

export async function GET() {
  return new NextResponse(
    "Method Not Allowed. Use POST for authentication actions.",
    {
      status: 405,
      headers: {
        Allow: "POST",
        "Content-Type": "text/plain",
      },
    }
  );
}
