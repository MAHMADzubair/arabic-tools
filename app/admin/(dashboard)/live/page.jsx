import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";
import ChartCard from "@/components/admin/ChartCard";
import DataTable from "@/components/admin/DataTable";
import { getGa4RealtimeReport } from "@/lib/integrations/ga4";
import { Activity, Radio, Users } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Live Activity | QEMLO Command Center",
};

export default async function LiveActivityPage() {
  const realtime = await getGa4RealtimeReport();
  const isConnected = realtime.status === "connected";

  const screenColumns = [
    { key: "screen", label: "Active Page / Screen (unifiedScreenName)", sortable: true },
    { key: "users", label: "Realtime Active Visitors", sortable: true },
  ];

  return (
    <AdminShell title="Live Activity Monitoring">
      {/* Top Banner */}
      <div className="mb-6 rounded-xl border border-amber-500/25 bg-amber-500/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF5B04]/10 text-[#FF5B04]">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F5F5F2]">Realtime Telemetry</h2>
              <p className="mt-0.5 text-xs text-[#A3A39E]">
                {isConnected
                  ? "Verified active visitors snapshot from Google Analytics Realtime API (last 30 minutes). Distinct property-wide active users."
                  : "No live event provider or approved ingestion endpoint is connected to this dashboard. An empty feed does not mean there are zero visitors."}
              </p>
            </div>
          </div>
          <StatusBadge
            status={isConnected ? "live" : "disconnected"}
            label={isConnected ? "Realtime Snapshot Verified" : "Ingestion Not Enabled"}
            size="sm"
          />
        </div>
      </div>

      {/* Realtime KPI Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Active Public Visitors"
          value={isConnected ? realtime.data?.activeUsers : "Unavailable"}
          subtitle={
            isConnected
              ? "Property-wide distinct active users (last 30m, unsummed)"
              : "Requires a verified real-time data source"
          }
          source={isConnected ? "GA4 Realtime API" : "Not Connected"}
          highlight={isConnected}
          badge={
            <StatusBadge
              status={isConnected ? "live" : "disconnected"}
              label={isConnected ? "Realtime Snapshot" : "Setup Required"}
              size="sm"
            />
          }
        />

        <KpiCard
          title="Active Screens Monitored"
          value={isConnected ? realtime.data?.topScreens?.length : "Unavailable"}
          subtitle={
            isConnected
              ? "Distinct calculator screens currently receiving traffic"
              : "Ingestion has not been activated"
          }
          source={isConnected ? "GA4 Realtime" : "Not Connected"}
          badge={
            <StatusBadge
              status={isConnected ? "info" : "neutral"}
              label={isConnected ? "Observed" : "Offline"}
              size="sm"
            />
          }
        />

        <KpiCard
          title="Data Collection Policy"
          value={isConnected ? "Strictly Anonymous" : "Pending Review"}
          subtitle="Approve scope, retention and privacy before activation"
          source="Security"
          badge={
            <StatusBadge
              status={isConnected ? "success" : "neutral"}
              label={isConnected ? "Compliant" : "Review Required"}
              size="sm"
            />
          }
        />
      </div>

      {/* Connected Snapshot View vs Disconnected View */}
      {isConnected && realtime.data ? (
        <div className="space-y-6">
          {realtime.data.countries?.length > 0 && (
            <ChartCard
              title="Realtime Visitors by Country"
              subtitle="Current active countries observed on QEMLO"
              data={realtime.data.countries}
              type="bar"
              color="#FF5B04"
              source="GA4 Realtime"
            />
          )}

          <div>
            <h3 className="mb-1 text-sm font-semibold text-[#F5F5F2]">
              Active Calculator Screens (Last 30 Min)
            </h3>
            <p className="mb-3 text-xs text-[#A3A39E]">
              Reported directly by GA4 Realtime API using the verified <code className="text-[#FF5B04]">unifiedScreenName</code> dimension.
            </p>
            <DataTable
              columns={screenColumns}
              data={realtime.data.topScreens || []}
              emptyMessage="No active visitors recorded on calculator screens in the last 30 minutes."
              searchPlaceholder="Filter active screens or page titles..."
            />
          </div>
        </div>
      ) : (
        <EmptyState
          title="Live Feed — Setup Required"
          description="Connect and verify privacy-reviewed public telemetry in a separate release. No mock sessions, auto-refresh indicators or synthetic events are shown."
          requiredEnv={[
            "GA4_PROPERTY_ID",
            "GOOGLE_ANALYTICS_CLIENT_EMAIL",
            "GOOGLE_ANALYTICS_PRIVATE_KEY",
          ]}
          actionText="Google Analytics Console"
          actionHref="https://analytics.google.com/"
        />
      )}
    </AdminShell>
  );
}
