import { NextResponse } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/sessionAuth";
import { isAdminAuthConfigured } from "@/lib/adminMfa";
import { getAdminOperationalSnapshot } from "@/lib/adminOperationalSnapshot";

export const dynamic = "force-dynamic";

export async function GET(request) {
  // Server-side fail-closed MFA and owner configuration gate.
  if (process.env.VERCEL_ENV === "production" && !isAdminAuthConfigured()) {
    return NextResponse.json({ error: "admin_temporarily_unavailable" }, { status: 503 });
  }

  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ error: "admin_temporarily_unavailable" }, { status: 503 });
  }
  const token = request.cookies?.get ? request.cookies.get(COOKIE_NAME)?.value : null;
  if (!(await verifySession(token))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Return the same observed snapshot shown on the dashboard, without raw DB errors.
  const snapshot = await getAdminOperationalSnapshot();
  const healthy = snapshot.status === "healthy";
  return NextResponse.json({
    status: snapshot.status,
    timestamp: new Date().toISOString(),
    latencyMs: snapshot.latencyMs,
    database: {
      activeSessions: snapshot.activeSessions,
      loginAttempts24h: snapshot.loginAttempts24h,
      pilotLeads: snapshot.pilotLeads,
    },
    ...(healthy ? {} : { error: "Operational data unavailable or incomplete" }),
  }, { status: healthy ? 200 : 503 });
}
