import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import ChartCard from "@/components/admin/ChartCard";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";
import DataTable from "@/components/admin/DataTable";
import { getGa4VisitorsReport, getGa4Config } from "@/lib/integrations/ga4";
import { Users, Eye, Clock, Activity, ExternalLink } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Visitors & Audience | QEMLO Command Center",
};

export default async function VisitorsPage({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const selectedRange = resolvedParams.range || "7d";

  const config = getGa4Config();
  const report = await getGa4VisitorsReport(selectedRange);
  const isConnected = report.status === "connected";

  const pageColumns = [
    { key: "path", label: "Page Path", sortable: true },
    { key: "views", label: "Page Views", sortable: true },
    { key: "users", label: "Active Users", sortable: true },
  ];

  return (
    <AdminShell title="Visitors & Audience Analytics">
      {/* Integration Status Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#262626] bg-[#141414] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF5B04]/10 text-[#FF5B04]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#F5F5F2]">
                Google Analytics 4 Data API
              </span>
              <StatusBadge
                status={isConnected ? "success" : "disconnected"}
                label={isConnected ? "Connected & Verified" : "Setup Required"}
                size="sm"
              />
            </div>
            <p className="text-xs text-[#A3A39E]">
              {isConnected
                ? "Live audience reports queried directly from GA4 Data API v1beta."
                : "Audience analytics requires GA4 Property ID and Google Service Account credentials."}
            </p>
          </div>
        </div>

        {/* Date Filter Badges */}
        <div className="flex items-center gap-1.5">
          {["24h", "7d", "30d", "90d"].map((r) => (
            <a
              key={r}
              href={`/admin/visitors?range=${r}`}
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

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Active Visitors"
          value={isConnected ? report.data?.kpis?.activeUsers?.toLocaleString() : "Unavailable"}
          subtitle={isConnected ? `Unique active users (${selectedRange})` : "Requires connected GA4 Property"}
          source="GA4 Data API"
          highlight={isConnected}
          badge={
            <StatusBadge
              status={isConnected ? "success" : "disconnected"}
              label={isConnected ? "Verified" : "Setup Required"}
              size="sm"
            />
          }
        />

        <KpiCard
          title="Total Sessions"
          value={isConnected ? report.data?.kpis?.sessions?.toLocaleString() : "Unavailable"}
          subtitle={isConnected ? `User sessions recorded` : "Awaiting telemetry adapter"}
          source="GA4 Data API"
          badge={
            <StatusBadge
              status={isConnected ? "info" : "neutral"}
              label={isConnected ? "Reported" : "Offline"}
              size="sm"
            />
          }
        />

        <KpiCard
          title="Screen Page Views"
          value={isConnected ? report.data?.kpis?.views?.toLocaleString() : "Unavailable"}
          subtitle={isConnected ? `Aggregated calculator views` : "Traffic counter not connected"}
          source="GA4 Data API"
          badge={
            <StatusBadge
              status={isConnected ? "live" : "neutral"}
              label={isConnected ? "Aggregated" : "Offline"}
              size="sm"
            />
          }
        />

        <KpiCard
          title="Engagement / Bounce Rate"
          value={
            isConnected
              ? `${report.data?.kpis?.bounceRatePct || 0}% bounce`
              : "Unavailable"
          }
          subtitle={
            isConnected
              ? `Avg duration: ${report.data?.kpis?.avgDurationSec || 0}s`
              : "Zero synthetic percentages shown"
          }
          source="GA4 Telemetry"
          badge={
            <StatusBadge
              status={isConnected ? "neutral" : "disconnected"}
              label={isConnected ? "Field Metric" : "Not Connected"}
              size="sm"
            />
          }
        />
      </div>

      {/* Connected Dashboard View vs Disconnected View */}
      {isConnected && report.data ? (
        <>
          {/* Charts Row */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
              title="Daily Active Visitors"
              subtitle={`Audience traffic over the past ${selectedRange}`}
              data={report.data.dailyTrends || []}
              type="area"
              color="#FF5B04"
              source="GA4 Data API"
            />

            <ChartCard
              title="Visitors by Top Countries"
              subtitle="Regional distribution across GCC and global markets"
              data={(report.data.countries || []).map((c) => ({
                label: c.label.slice(0, 10),
                value: c.value,
              }))}
              type="bar"
              color="#FF5B04"
              source="GA4 Data API"
            />
          </div>

          {/* Top Visited Calculator Pages Table */}
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-[#F5F5F2]">
              Top Visited Calculator Paths ({selectedRange})
            </h3>
            <DataTable
              columns={pageColumns}
              data={report.data.topPages || []}
              emptyMessage="No page views recorded in the selected period."
              searchPlaceholder="Filter paths..."
            />
          </div>
        </>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="Audience Analytics — Setup Required"
            description="A verified analytics source has not been connected. Country share, device mix, session counts and conversion rates are intentionally withheld rather than displayed as estimated or fabricated data."
            requiredEnv={[
              "GA4_PROPERTY_ID",
              "GOOGLE_ANALYTICS_CLIENT_EMAIL",
              "GOOGLE_ANALYTICS_PRIVATE_KEY",
            ]}
            actionText="Google Analytics Admin"
            actionHref="https://analytics.google.com/analytics/web/"
          />
        </div>
      )}
    </AdminShell>
  );
}
