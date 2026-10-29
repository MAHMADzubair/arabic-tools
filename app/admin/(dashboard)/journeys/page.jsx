import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";
import { getFunnelAnalytics } from "@/lib/integrations/toolEvents";
import { GitFork, Shield, ArrowRight, CheckCircle2 } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User Journeys | QEMLO Command Center",
};

export default async function UserJourneysPage({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const selectedRange = resolvedParams.range || "7d";

  const funnel = await getFunnelAnalytics(selectedRange);
  const isConnected = funnel.status === "connected";

  return (
    <AdminShell title="Anonymous User Journeys & Funnels">
      {/* Top Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#262626] bg-[#141414] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF5B04]/10 text-[#FF5B04]">
            <GitFork className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#F5F5F2]">
                Privacy-Preserving Aggregate Funnels
              </span>
              <StatusBadge
                status={isConnected ? "success" : "disconnected"}
                label={isConnected ? "Telemetry Active" : "Setup Required"}
                size="sm"
              />
            </div>
            <p className="text-xs text-[#A3A39E]">
              Strictly anonymous conversion telemetry. Form inputs, salaries and personal information are NEVER tracked.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {["7d", "30d"].map((r) => (
            <a
              key={r}
              href={`/admin/journeys?range=${r}`}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                selectedRange === r
                  ? "bg-[#FF5B04] text-[#0D0D0D]"
                  : "border border-[#262626] bg-[#1A1A1A] text-[#A3A39E] hover:text-[#F5F5F2]"
              }`}
            >
              {r.toUpperCase()}
            </a>
          ))}
        </div>
      </div>

      {/* Connected Funnel View vs Disconnected View */}
      {isConnected && funnel.data?.stages ? (
        <div className="space-y-6">
          {/* Funnel Progress Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {funnel.data.stages.map((stage, idx) => (
              <div
                key={stage.name}
                className="relative rounded-xl border border-[#262626] bg-[#161616] p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#73736C]">
                    Stage {idx + 1}
                  </span>
                  <StatusBadge status="live" label={`${stage.conversionPct}%`} size="sm" />
                </div>
                <h3 className="mt-2 text-base font-bold text-[#F5F5F2]">{stage.name}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#FF5B04]">
                    {stage.count.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#A3A39E]">events recorded</span>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy & Conversion Safeguards */}
          <div className="rounded-xl border border-[#262626] bg-[#161616] p-5">
            <h3 className="text-sm font-semibold text-[#F5F5F2]">
              Strict Zero-PII Funnel Protocol
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#A3A39E]">
              All calculation logic runs client-side inside the user's web browser. Event counts record only that an action was triggered (e.g. "Calculation Executed", "PDF Exported"), without transmitting or persisting numerical values, salaries, employee names, passport IDs, or business financial records.
            </p>
          </div>
        </div>
      ) : (
        <EmptyState
          title="User Journey Analytics — Setup Required"
          description="No verified journey or conversion data source is connected. Funnel completion percentages and session paths will appear only when privacy-safe telemetry is implemented, reviewed and explicitly enabled."
          requiredEnv={[
            "GA4_PROPERTY_ID",
            "GOOGLE_ANALYTICS_CLIENT_EMAIL",
            "GOOGLE_ANALYTICS_PRIVATE_KEY",
          ]}
          actionText="Google Analytics Events"
          actionHref="https://analytics.google.com/"
        />
      )}
    </AdminShell>
  );
}
