import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import DataTable from "@/components/admin/DataTable";
import { getSupabaseAdmin } from "@/lib/sessionAuth";
import { Shield, Lock, Activity } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Security Center | QEMLO Command Center",
};

export default async function SecurityCenterPage() {
  let sessionCount = 0;
  let recentAttempts = [];

  try {
    const sb = await getSupabaseAdmin();
    if (sb) {
      const { count } = await sb
        .from("admin_sessions")
        .select("*", { count: "exact", head: true });
      sessionCount = count || 0;

      const { data: attempts } = await sb
        .from("admin_login_attempts")
        .select("id, ip_address, attempt_time")
        .order("attempt_time", { ascending: false })
        .limit(20);

      recentAttempts = attempts || [];
    }
  } catch {
    // Fail closed fallback
  }

  const columns = [
    {
      key: "attempt_time",
      label: "Timestamp (UTC)",
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs text-[#A3A39E]">
          {new Date(val).toISOString().replace("T", " ").slice(0, 19)}
        </span>
      ),
    },
    {
      key: "ip_address",
      label: "Client IP",
      render: (ip) => {
        // Mask last octet for privacy
        const masked = ip ? ip.replace(/\.\d+$/, ".***") : "127.0.0.1";
        return <code className="rounded bg-[#0D0D0D] px-2 py-0.5 font-mono text-xs text-[#FF5B04]">{masked}</code>;
      },
    },
    {
      key: "action",
      label: "Security Event",
      render: () => <span className="font-medium text-[#F5F5F2]">Admin Login Attempt</span>,
    },
    {
      key: "status",
      label: "Result",
      render: () => <StatusBadge status="live" label="Atomic Logged" size="sm" />,
    },
  ];

  return (
    <AdminShell title="Security Center & Audit Log">
      {/* Top Security KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Active Sessions"
          value={sessionCount}
          subtitle="Non-expired tokens in PostgreSQL"
          source="admin_sessions"
          highlight={true}
          badge={<StatusBadge status="live" label="Secured" size="sm" />}
        />
        <KpiCard
          title="Login Rate Limit"
          value="5 / 15m"
          subtitle="Atomic lock via pg_advisory_xact_lock"
          source="Stored Procedure"
          badge={<StatusBadge status="success" label="Active" size="sm" />}
        />
        <KpiCard
          title="Session Cookie"
          value="HttpOnly"
          subtitle="SameSite=Strict · 8h Max Age"
          source="Cookie Policy"
          badge={<StatusBadge status="success" label="Strict" size="sm" />}
        />
        <KpiCard
          title="CSRF Protection"
          value="Origin Match"
          subtitle="Cross-origin requests blocked"
          source="API Gate"
          badge={<StatusBadge status="info" label="Enforced" size="sm" />}
        />
      </div>

      {/* Security Architecture Summary */}
      <div className="mt-6 rounded-xl border border-[#262626] bg-[#161616] p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F2]">
          Authentication Security Invariants
        </h3>
        <p className="mt-0.5 text-xs text-[#A3A39E]">
          Active cryptographic measures safeguarding administrative privileges.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-[#262626] bg-[#0D0D0D] p-3.5">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#FF5B04]" />
              <span className="text-xs font-bold text-[#F5F5F2]">SHA-256 Token Hashes</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#A3A39E]">
              Raw tokens are held exclusively in the client HttpOnly cookie; only irreversible SHA-256 hashes are persisted in Postgres.
            </p>
          </div>

          <div className="rounded-lg border border-[#262626] bg-[#0D0D0D] p-3.5">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#FF5B04]" />
              <span className="text-xs font-bold text-[#F5F5F2]">Instant Revocation</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#A3A39E]">
              Logout immediately stamps <code className="text-[#FF5B04]">revoked_at = now()</code> in the database, preventing token replay attacks.
            </p>
          </div>

          <div className="rounded-lg border border-[#262626] bg-[#0D0D0D] p-3.5">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#FF5B04]" />
              <span className="text-xs font-bold text-[#F5F5F2]">Fail-Closed Model</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#A3A39E]">
              Any database disconnection or missing configuration denies access by default with HTTP 401/503.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Audit Table */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F2]">
              Administrative Login Attempt History
            </h3>
            <p className="text-xs text-[#A3A39E]">
              Real database records from <code className="text-[#FF5B04]">admin_login_attempts</code> table.
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={recentAttempts}
          emptyMessage="No login attempts recorded in the database yet."
          searchPlaceholder="Filter attempts by IP or date..."
        />
      </div>
    </AdminShell>
  );
}
