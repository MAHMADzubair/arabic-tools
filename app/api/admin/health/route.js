import { NextResponse } from "next/server";
import { COOKIE_NAME, verifySession, getSupabaseAdmin } from "@/lib/sessionAuth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "admin_temporarily_unavailable" }, { status: 503 });
  }
  // Enforce session authorization
  const token = request.cookies?.get ? request.cookies.get(COOKIE_NAME)?.value : null;
  const isValid = await verifySession(token);
  if (!isValid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const sb = await getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Supabase client unconfigured",
        latencyMs: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  try {
    const { count: sessionsCount, error: sErr } = await sb
      .from("admin_sessions")
      .select("*", { count: "exact", head: true });

    const { count: attemptsCount, error: aErr } = await sb
      .from("admin_login_attempts")
      .select("*", { count: "exact", head: true });

    const { count: leadsCount, error: lErr } = await sb
      .from("pilot_leads")
      .select("*", { count: "exact", head: true });

    const latencyMs = Date.now() - startTime;

    if (sErr || aErr || lErr) {
      return NextResponse.json(
        {
          status: "degraded",
          error: (sErr || aErr || lErr)?.message,
          latencyMs,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "healthy",
      latencyMs,
      timestamp: new Date().toISOString(),
      database: {
        adminSessionsCount: sessionsCount || 0,
        loginAttemptsCount: attemptsCount || 0,
        pilotLeadsCount: leadsCount || 0,
      },
      environment: {
        nodeVersion: process.version,
        isProduction: process.env.NODE_ENV === "production",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        error: err.message,
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
