import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { getAdminOperationalSnapshot } from "@/lib/adminOperationalSnapshot";
import { Server, Activity, CheckCircle } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "System Health | QEMLO Command Center",
};

export default async function SystemHealthPage() {
  const snapshot = await getAdminOperationalSnapshot();
  const migrations = [
    { id: "001_pilot_leads.sql", status: "File Present — DB Unverified", tables: "pilot_leads" },
    { id: "002_admin_sessions.sql", status: "File Present — DB Unverified", tables: "admin_sessions, admin_login_attempts" },
  ];

  return (
    <AdminShell title="System Health & Infrastructure Diagnostics">
      {/* Top Infrastructure KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Supabase Database"
          value={snapshot.status === "healthy" ? "Healthy" : "Unavailable"}
          subtitle={snapshot.latencyMs === null ? "Database is not connected" : `${snapshot.latencyMs} ms query duration`}
          source="PostgreSQL"
          highlight={snapshot.status === "healthy"}
          badge={
            <StatusBadge
              status={snapshot.status === "healthy" ? "success" : "warning"}
              label={snapshot.status}
              size="sm"
            />
          }
        />
        <KpiCard
          title="Next.js Runtime"
          value="Next.js 15"
          subtitle="App Router framework major version"
          source="Server Runtime"
          badge={<StatusBadge status="neutral" label="Framework" size="sm" />}
        />
        <KpiCard
          title="Node Environment"
          value={process.version}
          subtitle="Current server runtime reported by Node.js"
          source="Runtime"
          badge={<StatusBadge status="neutral" label="64-bit" size="sm" />}
        />
        <KpiCard
          title="Security Ingestion"
          value="Fail-Closed"
          subtitle="Admin operations deny access when verification fails"
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
            Query: {snapshot.latencyMs === null ? "Unavailable" : `${snapshot.latencyMs} ms`}
          </span>
        </div>

        {snapshot.error && (
          <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
            Database Warning: {snapshot.error}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[#262626] bg-[#0D0D0D] p-4">
            <span className="text-xs font-semibold text-[#A3A39E]">admin_sessions</span>
            <div className="mt-2 text-2xl font-bold text-[#F5F5F2]">{snapshot.activeSessions ?? "Unavailable"}</div>
            <p className="mt-1 text-[11px] text-[#73736C]">Non-revoked, non-expired sessions</p>
          </div>

          <div className="rounded-lg border border-[#262626] bg-[#0D0D0D] p-4">
            <span className="text-xs font-semibold text-[#A3A39E]">admin_login_attempts</span>
            <div className="mt-2 text-2xl font-bold text-[#F5F5F2]">{snapshot.loginAttempts24h ?? "Unavailable"}</div>
            <p className="mt-1 text-[11px] text-[#73736C]">Authentication attempts in past 24h</p>
          </div>

          <div className="rounded-lg border border-[#262626] bg-[#0D0D0D] p-4">
            <span className="text-xs font-semibold text-[#A3A39E]">pilot_leads</span>
            <div className="mt-2 text-2xl font-bold text-[#F5F5F2]">{snapshot.pilotLeads ?? "Unavailable"}</div>
            <p className="mt-1 text-[11px] text-[#73736C]">Registered lead submissions</p>
          </div>
        </div>
      </div>

      {/* Migration Audit Table */}
      <div className="mt-6 rounded-xl border border-[#262626] bg-[#161616] p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F2]">
          Migration Files in Repository
        </h3>
        <p className="mt-0.5 text-xs text-[#A3A39E]">
          Repository SQL files only. Their execution in any database is not verified by this page.
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
                      status="pending"
                      label={m.status}
                      size="sm"
                    />
                  </td>
                  <td className="py-3 font-mono text-[#A3A39E]">{m.tables}</td>
                  <td className="py-3 text-right text-[#73736C]">Awaiting database audit</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
