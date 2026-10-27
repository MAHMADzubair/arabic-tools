import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { getSupabaseAdmin } from "@/lib/sessionAuth";
import { Server, Activity, CheckCircle } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "System Health | QEMLO Command Center",
};

export default async function SystemHealthPage() {
  const startPing = Date.now();
  let dbStatus = "healthy";
  let dbLatency = 0;
  let sessionCount = 0;
  let attemptCount = 0;
  let leadsCount = 0;
  let dbError = null;

  try {
    const sb = await getSupabaseAdmin();
    if (sb) {
      const { count: sCount, error: sErr } = await sb
        .from("admin_sessions")
        .select("*", { count: "exact", head: true });
      const { count: aCount, error: aErr } = await sb
        .from("admin_login_attempts")
        .select("*", { count: "exact", head: true });
      const { count: lCount, error: lErr } = await sb
        .from("pilot_leads")
        .select("*", { count: "exact", head: true });

      dbLatency = Date.now() - startPing;

      if (sErr || aErr || lErr) {
        dbStatus = "degraded";
        dbError = (sErr || aErr || lErr)?.message;
      } else {
        sessionCount = sCount || 0;
        attemptCount = aCount || 0;
        leadsCount = lCount || 0;
      }
    } else {
      dbStatus = "disconnected";
      dbError = "Supabase client credentials missing";
    }
  } catch (err) {
    dbStatus = "error";
    dbLatency = Date.now() - startPing;
    dbError = err.message;
  }

  const migrations = [
    { id: "001_pilot_leads.sql", status: "Applied & Verified", date: "Initial Schema", tables: "pilot_leads" },
    { id: "002_admin_sessions.sql", status: "Applied & Verified", date: "Security Update", tables: "admin_sessions, admin_login_attempts" },
    { id: "003_admin_analytics_and_audit.sql", status: "Prepared (Staging)", date: "Upcoming Milestone", tables: "analytics_events, admin_audit_logs, admin_mfa_config" },
  ];

  return (
    <AdminShell title="System Health & Infrastructure Diagnostics">
      {/* Top Infrastructure KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Supabase Database"
          value={dbStatus === "healthy" ? "Healthy" : "Degraded"}
          subtitle={`${dbLatency} ms query round-trip`}
          source="PostgreSQL"
          highlight={dbStatus === "healthy"}
          badge={
            <StatusBadge
              status={dbStatus === "healthy" ? "success" : "warning"}
              label={dbStatus}
              size="sm"
            />
          }
        />
        <KpiCard
          title="Next.js Runtime"
          value="v15.5.28"
          subtitle="React 19 App Router on Vercel"
          source="Server Runtime"
          badge={<StatusBadge status="live" label="Production" size="sm" />}
        />
        <KpiCard
          title="Node Environment"
          value={process.version}
          subtitle="Vercel Serverless Function Engine"
          source="Runtime"
          badge={<StatusBadge status="neutral" label="64-bit" size="sm" />}
        />
        <KpiCard
          title="Security Ingestion"
          value="Fail-Closed"
          subtitle="Outages immediately lock privileges"
          source="Auth Policy"
          badge={<StatusBadge status="success" label="Active" size="sm" />}
        />
      </div>

      {/* Database Tables Telemetry */}
      <div className="mt-6 rounded-xl border border-[#262626] bg-[#161616] p-5">
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F2]">
              PostgreSQL Active Table Metrics
            </h3>
            <p className="mt-0.5 text-xs text-[#A3A39E]">
              Direct live row counts obtained through Supabase service-role client.
            </p>
          </div>
          <span className="font-mono text-xs text-emerald-400">
            Ping: {dbLatency} ms
          </span>
        </div>

        {dbError && (
          <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
            Database Warning: {dbError}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[#262626] bg-[#0D0D0D] p-4">
            <span className="text-xs font-semibold text-[#A3A39E]">admin_sessions</span>
            <div className="mt-2 text-2xl font-bold text-[#F5F5F2]">{sessionCount}</div>
            <p className="mt-1 text-[11px] text-[#73736C]">Active session hashes</p>
          </div>

          <div className="rounded-lg border border-[#262626] bg-[#0D0D0D] p-4">
            <span className="text-xs font-semibold text-[#A3A39E]">admin_login_attempts</span>
            <div className="mt-2 text-2xl font-bold text-[#F5F5F2]">{attemptCount}</div>
            <p className="mt-1 text-[11px] text-[#73736C]">Recorded rate-limit entries</p>
          </div>

          <div className="rounded-lg border border-[#262626] bg-[#0D0D0D] p-4">
            <span className="text-xs font-semibold text-[#A3A39E]">pilot_leads</span>
            <div className="mt-2 text-2xl font-bold text-[#F5F5F2]">{leadsCount}</div>
            <p className="mt-1 text-[11px] text-[#73736C]">Registered lead submissions</p>
          </div>
        </div>
      </div>

      {/* Migration Audit Table */}
      <div className="mt-6 rounded-xl border border-[#262626] bg-[#161616] p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F2]">
          Database Migrations Audit History
        </h3>
        <p className="mt-0.5 text-xs text-[#A3A39E]">
          Chronological schema evolution track for PostgreSQL database.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#222222] text-[11px] uppercase tracking-wider text-[#73736C]">
              <tr>
                <th className="py-2.5 font-semibold">Migration File</th>
                <th className="py-2.5 font-semibold">Status</th>
                <th className="py-2.5 font-semibold">Target Tables</th>
                <th className="py-2.5 text-right font-semibold">Milestone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {migrations.map((m) => (
                <tr key={m.id} className="transition hover:bg-[#1A1A1A]">
                  <td className="py-3 font-mono font-medium text-[#FF5B04]">
                    {m.id}
                  </td>
                  <td className="py-3">
                    <StatusBadge
                      status={m.status.includes("Applied") ? "success" : "pending"}
                      label={m.status}
                      size="sm"
                    />
                  </td>
                  <td className="py-3 font-mono text-[#A3A39E]">{m.tables}</td>
                  <td className="py-3 text-right text-[#73736C]">{m.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
