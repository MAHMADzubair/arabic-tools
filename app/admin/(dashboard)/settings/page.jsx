import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { Settings, Shield, Lock, ExternalLink } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings & Integrations | QEMLO Command Center",
};

export default function SettingsPage() {
  const envChecklist = [
    { name: "ADMIN_SECRET", desc: "Administrative master passphrase", configured: Boolean(process.env.ADMIN_SECRET), critical: true },
    { name: "SUPABASE_URL", desc: "PostgreSQL project endpoint", configured: Boolean(process.env.SUPABASE_URL), critical: true },
    { name: "SUPABASE_SERVICE_ROLE_KEY", desc: "Server-only database service key", configured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY), critical: true },
    { name: "NEXT_PUBLIC_ADSENSE_PUB_ID", desc: "Public AdSense publisher ID", configured: Boolean(process.env.NEXT_PUBLIC_ADSENSE_PUB_ID), critical: false },
    { name: "MFA_ENCRYPTION_KEY", desc: "AES-256-GCM TOTP secret encryption", configured: Boolean(process.env.MFA_ENCRYPTION_KEY), critical: true },
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
          value="Mandatory"
          subtitle="Enforced for production administrative account"
          source="Security Policy"
          highlight={true}
          badge={<StatusBadge status="warning" label="Enforced in Prod" size="sm" />}
        />
        <KpiCard
          title="Data Retention"
          value="30 Days"
          subtitle="Rolling purge of raw telemetry events"
          source="Database"
          badge={<StatusBadge status="success" label="Scheduled" size="sm" />}
        />
        <KpiCard
          title="Audit Log Retention"
          value="Permanent"
          subtitle="Administrative login & auth trail preserved"
          source="Security Log"
          badge={<StatusBadge status="live" label="Preserved" size="sm" />}
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
              Status of required and optional server configuration keys. Secret values are strictly hidden.
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
                      label={item.configured ? "Configured" : "Missing"}
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
            <span>Single-admin account architecture: public registrations are permanently disallowed.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#FF5B04]">✓</span>
            <span>All administrative queries execute strictly via server-side service-role; no client keys are exposed.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-[#FF5B04]">✓</span>
            <span>Search crawlers are forbidden from indexing any route matching <code className="text-[#FF5B04]">/admin/*</code> or <code className="text-[#FF5B04]">/api/*</code>.</span>
          </li>
        </ul>
      </div>
    </AdminShell>
  );
}
