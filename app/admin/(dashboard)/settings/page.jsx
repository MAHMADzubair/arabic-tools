import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { getAdminAuthConfigStatus, isAdminAuthConfigured } from "@/lib/adminMfa";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings & Integrations | QEMLO Command Center",
};

export default function SettingsPage() {
  const ownerMfaReady = isAdminAuthConfigured();
  const mfaConfigStatus = getAdminAuthConfigStatus();
  // Configuration validates format/presence only; it is not a successful
  // database API call or proof of a live owner sign-in or logout.
  const envChecklist = [
    { name: "ADMIN_LOGIN_EMAIL", desc: "Private owner identity; email format checked", configured: mfaConfigStatus.ADMIN_LOGIN_EMAIL === "PASS", critical: true },
    { name: "ADMIN_SECRET", desc: "Owner password; minimum 24 characters", configured: mfaConfigStatus.ADMIN_SECRET === "PASS", critical: true },
    { name: "ADMIN_TOTP_SECRET", desc: "Time-based authenticator seed; Base32 format checked", configured: mfaConfigStatus.ADMIN_TOTP_SECRET === "PASS", critical: true },
    { name: "ADMIN_MFA_ENABLED", desc: "Explicit TOTP enforcement flag", configured: mfaConfigStatus.ADMIN_MFA_ENABLED === "PASS", critical: true },
    { name: "SUPABASE_URL", desc: "Server-side database project endpoint", configured: mfaConfigStatus.SUPABASE_URL === "PASS", critical: true },
    { name: "SUPABASE_SERVICE_ROLE_KEY", desc: "Server-only database key; presence checked, API access unverified", configured: mfaConfigStatus.SUPABASE_SERVICE_ROLE_KEY === "PASS", critical: true },
    { name: "NEXT_PUBLIC_ADSENSE_PUB_ID", desc: "Public AdSense publisher ID", configured: Boolean(process.env.NEXT_PUBLIC_ADSENSE_PUB_ID), critical: false },
    { name: "GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL", desc: "GSC service account email", configured: Boolean(process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL), critical: false },
    { name: "GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY", desc: "GSC service account key", configured: Boolean(process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY), critical: false },
    { name: "ADSENSE_CLIENT_ID", desc: "Google AdSense OAuth client ID", configured: Boolean(process.env.ADSENSE_CLIENT_ID), critical: false },
    { name: "ADSENSE_CLIENT_SECRET", desc: "Google AdSense OAuth secret", configured: Boolean(process.env.ADSENSE_CLIENT_SECRET), critical: false },
  ];

  return (
    <AdminShell title="Settings & Operational Configuration">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="MFA Policy"
          value={ownerMfaReady ? "Configured" : "Setup Required"}
          subtitle="TOTP, owner identity, password and database settings are checked server-side. Successful login, logout and release QA require separate verification."
          source="Security Policy"
          highlight={true}
          badge={<StatusBadge status={ownerMfaReady ? "warning" : "error"} label={ownerMfaReady ? "Configuration Ready · QA Pending" : "Release Blocker"} size="sm" />}
        />
        <KpiCard
          title="Data Retention"
          value="Not Configured"
          subtitle="Public telemetry not enabled; no retention job claimed"
          source="Database"
          badge={<StatusBadge status="disconnected" label="Pending Policy" size="sm" />}
        />
        <KpiCard
          title="Audit Log Retention"
          value="Database-Dependent"
          subtitle="Attempt data retention requires a verified cleanup schedule"
          source="Security Log"
          badge={<StatusBadge status="warning" label="Verify Database" size="sm" />}
        />
      </div>

      {/* Environment Variables Audit (Zero secrets displayed) */}
      <div className="mt-6 rounded-xl border border-[#262626] bg-[#161616] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222222] pb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F2]">
              Environment Configuration Audit
            </h3>
            <p className="mt-0.5 text-xs text-[#A3A39E]">
              Server-side presence and format checks only; not a database connection or API authorization test. Secret values are never shown.
            </p>
          </div>
          <span className="text-xs text-[#73736C]">
            Server Runtime: Node {process.version}
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#222222] text-[11px] uppercase tracking-wider text-[#73736C]">
              <tr>
                <th className="py-2.5 font-semibold">Variable Name</th>
                <th className="py-2.5 font-semibold">Purpose</th>
                <th className="py-2.5 font-semibold">Priority</th>
                <th className="py-2.5 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {envChecklist.map((item) => (
                <tr key={item.name} className="transition hover:bg-[#1A1A1A]">
                  <td className="py-3 font-mono font-medium text-[#FF5B04]">
                    {item.name}
                  </td>
                  <td className="py-3 text-[#A3A39E]">{item.desc}</td>
                  <td className="py-3">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        item.critical
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {item.critical ? "Critical" : "Optional"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <StatusBadge
                      status={item.configured ? "success" : item.critical ? "error" : "disconnected"}
                      label={item.configured ? (item.critical ? "Format OK" : "Present") : (item.critical ? "Missing / Invalid" : "Missing")}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operational Rules */}
      <div className="mt-6 rounded-xl border border-[#262626] bg-[#161616] p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F2]">
          Administrative Security Controls
        </h3>
        <p className="mt-0.5 text-xs text-[#A3A39E]">
          Non-negotiable operational safeguards governing QEMLO command operations.
        </p>

        <ul className="mt-4 space-y-2.5 text-xs text-[#A3A39E]">
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#FF5B04]">✓</span>
            <span>This admin interface has no public registration flow; a private entry URL does not replace authentication.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#FF5B04]">✓</span>
            <span>Admin operations require server-side credentials and database-backed sessions. Production access must pass separate release checks.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#FF5B04]">✓</span>
            <span>robots.txt and noindex are crawler directives, not authorization controls. Session checks and MFA protect private routes.</span>
          </li>
        </ul>
      </div>
    </AdminShell>
  );
}
