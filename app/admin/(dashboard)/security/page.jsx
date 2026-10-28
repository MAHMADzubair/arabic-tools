import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import DataTable from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";
import { getSupabaseAdmin } from "@/lib/sessionAuth";
import { getAdminOperationalSnapshot } from "@/lib/adminOperationalSnapshot";
import { isAdminAuthConfigured } from "@/lib/adminMfa";

export const dynamic = "force-dynamic";
export const metadata = { title: "Security Center | QEMLO Command Center" };

function maskIp(ip) {
  if (!ip || typeof ip !== "string") return "Not recorded";
  if (ip.includes(":")) return ip.split(":").slice(0, 2).join(":") + ":…";
  const parts = ip.split(".");
  return parts.length === 4 ? parts.slice(0, 2).join(".") + ".***.***" : "Masked";
}

export default async function SecurityCenterPage() {
  const snapshot = await getAdminOperationalSnapshot();
  const mfaReady = isAdminAuthConfigured();
  let attempts = null;

  if (snapshot.status === "healthy" || snapshot.status === "degraded") {
    try {
      const sb = await getSupabaseAdmin();
      if (sb) {
        const result = await sb.from("admin_login_attempts")
          .select("id, ip_address, attempt_time")
          .order("attempt_time", { ascending: false })
          .limit(20);
        if (!result.error) {
          attempts = (result.data || []).map((entry) => ({
            id: entry.id,
            attempt_time: entry.attempt_time ? new Date(entry.attempt_time).toISOString().slice(0, 19).replace("T", " ") + " UTC" : "Unknown",
            ip_masked: maskIp(entry.ip_address),
            action: "Authentication attempt",
            outcome: "Not recorded",
          }));
        }
      }
    } catch {
      attempts = null;
    }
  }

  const columns = [
    { key: "attempt_time", label: "Timestamp (UTC)", sortable: true },
    { key: "ip_masked", label: "IP (masked)" },
    { key: "action", label: "Event" },
    { key: "outcome", label: "Outcome" },
  ];

  return (
    <AdminShell title="Security Center & Audit Log">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Active Admin Sessions" value={snapshot.activeSessions ?? "Unavailable"}
          subtitle="Non-expired, non-revoked sessions" source="Supabase"
          badge={<StatusBadge status={snapshot.activeSessions === null ? "warning" : "success"} label={snapshot.activeSessions === null ? "Not Connected" : "Verified Query"} size="sm" />} />
        <KpiCard title="Login Attempts (24h)" value={snapshot.loginAttempts24h ?? "Unavailable"}
          subtitle="All attempts; results not separately recorded" source="Supabase" />
        <KpiCard title="Login Rate Limit" value="5 per 15 min"
          subtitle="Requires verified database RPC in staging" source="Policy"
          badge={<StatusBadge status="pending" label="Verification Required" size="sm" />} />
        <KpiCard title="Multi-Factor Authentication" value={mfaReady ? "Configured" : "Setup Required"}
          subtitle="TOTP enforced in login; requires verified owner enrollment and live QA" source="Owner Access"
          badge={<StatusBadge status={mfaReady ? "warning" : "error"} label={mfaReady ? "Verification Pending" : "Release Blocker"} size="sm" />} />
      </div>

      <div className="mt-6 rounded-xl border border-[#262626] bg-[#161616] p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F2]">Authentication Safeguards</h3>
        <p className="mt-2 text-xs leading-relaxed text-[#A3A39E]">
          Sessions use hashed tokens, HttpOnly cookies, explicit revocation, and server-side authorization.
          Admin access requires the configured owner identity, password, and TOTP code, with rate limiting and server-side session validation.
          Session lifetime is eight hours maximum, not a sliding inactivity timeout.
        </p>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-[#F5F5F2]">Recent Authentication Attempts</h3>
        {attempts === null ? (
          <EmptyState title="Audit Database Not Connected"
            description="Recent authentication attempts cannot be displayed until the authorized database query succeeds. This is not evidence of zero attempts." />
        ) : (
          <DataTable columns={columns} data={attempts}
            emptyMessage="No authentication attempts found in the queried records."
            searchPlaceholder="Filter masked IP or timestamp..." />
        )}
      </div>
    </AdminShell>
  );
}
