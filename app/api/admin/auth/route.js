import { NextResponse } from "next/server";
import { isAdminAuthConfigured, verifyAdminTotp } from "@/lib/adminMfa";
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
  // Production remains fail-closed until owner email, rotated password, a valid
  // authenticator seed, explicit MFA enablement and DB credentials are configured.
  if (process.env.VERCEL_ENV === "production" && !isAdminAuthConfigured()) {
    return NextResponse.json({ error: "admin_temporarily_unavailable" }, { status: 503 });
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

  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ error: "admin_temporarily_unavailable" }, { status: 503 });
  }

  // ── Logout Action ──────────────────────────────────────────
  if (body.action === "logout") {
    const rawToken = request.cookies.get(COOKIE_NAME)?.value;
    const revoked = rawToken ? await revokeSession(rawToken) : true;
    // Clear the browser cookie even when DB revocation could not be confirmed.
    // Return an error instead of falsely claiming the remote session was revoked.
    const res = NextResponse.json(
      revoked ? { success: true, message: "logged_out" } : { error: "logout_unavailable" },
      { status: revoked ? 200 : 503 }
    );
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

  // 2. Require all three inputs: owner identifier, master password and TOTP.
  // Never log passwords, MFA codes or seed values.
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const totp = typeof body.totp === "string" ? body.totp : "";
  const emailOk = email.length <= 320 && safeCompare(email, process.env.ADMIN_LOGIN_EMAIL.toLowerCase());
  const passwordOk = password.length <= 256 && safeCompare(password, process.env.ADMIN_SECRET);
  const totpOk = verifyAdminTotp(totp);
  if (!emailOk || !passwordOk || !totpOk) {
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
