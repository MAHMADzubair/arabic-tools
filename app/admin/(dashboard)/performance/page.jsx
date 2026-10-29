import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";
import { getCruxPerformanceMetrics, getCruxConfig } from "@/lib/integrations/crux";
import { Gauge, Zap, Activity, Shield } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Performance & Core Web Vitals | QEMLO Command Center",
};

export default async function PerformancePage() {
  const config = getCruxConfig();
  const crux = await getCruxPerformanceMetrics();
  const isConnected = crux.status === "connected";

  const getBadgeStatus = (rating) => {
    if (rating === "good") return "success";
    if (rating === "needs_improvement") return "warning";
    if (rating === "poor") return "error";
    return "neutral";
  };

  return (
    <AdminShell title="Performance & Core Web Vitals">
      {/* Top Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#262626] bg-[#141414] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF5B04]/10 text-[#FF5B04]">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#F5F5F2]">
                Chrome User Experience Report (CrUX) Field Data
              </span>
              <StatusBadge
                status={isConnected ? "success" : "disconnected"}
                label={isConnected ? "Field Measurements Active" : "Setup Required"}
                size="sm"
              />
            </div>
            <p className="text-xs text-[#A3A39E]">
              Origin: <span className="font-mono text-[#F5F5F2]">{config.origin}</span> · Real-user 75th percentile measurements
            </p>
          </div>
        </div>
      </div>

      {/* Connected Field Metrics vs Disconnected Empty State */}
      {isConnected && crux.data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard
              title="Largest Contentful Paint (LCP)"
              value={crux.data.lcp ? `${crux.data.lcp.p75} ms` : "No Data"}
              subtitle="Target: ≤ 2500 ms (Loading)"
              source="CrUX P75"
              highlight={crux.data.lcp?.rating === "good"}
              badge={
                <StatusBadge
                  status={getBadgeStatus(crux.data.lcp?.rating)}
                  label={crux.data.lcp?.label || "Unrated"}
                  size="sm"
                />
              }
            />

            <KpiCard
              title="Interaction to Next Paint (INP)"
              value={crux.data.inp ? `${crux.data.inp.p75} ms` : "No Data"}
              subtitle="Target: ≤ 200 ms (Interactivity)"
              source="CrUX P75"
              badge={
                <StatusBadge
                  status={getBadgeStatus(crux.data.inp?.rating)}
                  label={crux.data.inp?.label || "Unrated"}
                  size="sm"
                />
              }
            />

            <KpiCard
              title="Cumulative Layout Shift (CLS)"
              value={crux.data.cls ? `${crux.data.cls.p75}` : "No Data"}
              subtitle="Target: ≤ 0.1 (Visual Stability)"
              source="CrUX P75"
              badge={
                <StatusBadge
                  status={getBadgeStatus(crux.data.cls?.rating)}
                  label={crux.data.cls?.label || "Unrated"}
                  size="sm"
                />
              }
            />

            <KpiCard
              title="First Contentful Paint (FCP)"
              value={crux.data.fcp ? `${crux.data.fcp.p75} ms` : "No Data"}
              subtitle="Target: ≤ 1800 ms"
              source="CrUX P75"
              badge={
                <StatusBadge
                  status={getBadgeStatus(crux.data.fcp?.rating)}
                  label={crux.data.fcp?.label || "Unrated"}
                  size="sm"
                />
              }
            />

            <KpiCard
              title="Time to First Byte (TTFB)"
              value={crux.data.ttfb ? `${crux.data.ttfb.p75} ms` : "No Data"}
              subtitle="Target: ≤ 800 ms (Edge Server Latency)"
              source="CrUX P75"
              badge={
                <StatusBadge
                  status={getBadgeStatus(crux.data.ttfb?.rating)}
                  label={crux.data.ttfb?.label || "Unrated"}
                  size="sm"
                />
              }
            />

            <KpiCard
              title="Audit Device Mix"
              value="Mobile & Desktop"
              subtitle="Aggregated across all form factors"
              source="Google CrUX"
              badge={<StatusBadge status="neutral" label="All Form Factors" size="sm" />}
            />
          </div>

          {/* CWV Diagnostic Standards Card */}
          <div className="rounded-xl border border-[#262626] bg-[#161616] p-5">
            <h3 className="text-sm font-semibold text-[#F5F5F2]">
              Next.js 15 App Router Edge Optimization Standards
            </h3>
            <p className="mt-0.5 text-xs text-[#A3A39E]">
              Field measurements are collected from real Chrome visitors accessing QEMLO in GCC and international regions.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
              <div className="rounded-lg border border-[#222222] bg-[#0D0D0D] p-3">
                <span className="font-semibold text-emerald-400">Zero-Layout Shift</span>
                <p className="mt-1 text-[#A3A39E]">
                  All calculator forms reserve explicit height blocks and utilize native CSS grid structures to prevent dynamic layout reflows.
                </p>
              </div>

              <div className="rounded-lg border border-[#222222] bg-[#0D0D0D] p-3">
                <span className="font-semibold text-emerald-400">Client-Side Calculation Speed</span>
                <p className="mt-1 text-[#A3A39E]">
                  Statutory math executes synchronously on the client without API round-trips, ensuring instantaneous INP response times.
                </p>
              </div>

              <div className="rounded-lg border border-[#222222] bg-[#0D0D0D] p-3">
                <span className="font-semibold text-emerald-400">Static Asset Streaming</span>
                <p className="mt-1 text-[#A3A39E]">
                  Pre-compressed WebP assets and localized RTL typography are cached at the edge for sub-800ms TTFB globally.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Core Web Vitals — Setup Required"
          description="Verified field measurements have not been connected. No LCP, INP, CLS, TTFB or route-count values are presented as live measurements until an authorized source is available."
          requiredEnv={["GOOGLE_CRUX_API_KEY"]}
          actionText="Google Cloud APIs"
          actionHref="https://console.cloud.google.com/apis/library/chromeuxreport.googleapis.com"
        />
      )}
    </AdminShell>
  );
}
