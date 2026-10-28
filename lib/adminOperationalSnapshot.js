/**
 * Server-only operational snapshot for the private QEMLO dashboard.
 * Never turns missing credentials or failed DB queries into apparent zero activity.
 * These are admin/database counters, NOT public audience analytics.
 */
import { getSupabaseAdmin } from "./sessionAuth.js";

export async function getAdminOperationalSnapshot() {
  const start = Date.now();
  const empty = {
    status: "disconnected",
    latencyMs: null,
    activeSessions: null,
    loginAttempts24h: null,
    pilotLeads: null,
    error: "Admin database is not configured.",
  };

  try {
    const sb = await getSupabaseAdmin();
    if (!sb) return empty;

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const [sessions, attempts, leads] = await Promise.all([
      sb.from("admin_sessions").select("*", { count: "exact", head: true })
        .is("revoked_at", null).gt("expires_at", now.toISOString()),
      sb.from("admin_login_attempts").select("*", { count: "exact", head: true })
        .gte("attempt_time", yesterday.toISOString()),
      sb.from("pilot_leads").select("*", { count: "exact", head: true }),
    ]);

    const error = sessions.error || attempts.error || leads.error;
    return {
      status: error ? "degraded" : "healthy",
      latencyMs: Date.now() - start,
      activeSessions: sessions.error ? null : sessions.count,
      loginAttempts24h: attempts.error ? null : attempts.count,
      pilotLeads: leads.error ? null : leads.count,
      error: error ? "One or more operational database queries failed." : null,
    };
  } catch {
    return {
      ...empty,
      status: "error",
      latencyMs: Date.now() - start,
      error: "Operational database request failed.",
    };
  }
}
