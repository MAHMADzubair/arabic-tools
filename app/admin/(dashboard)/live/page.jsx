import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live Activity | QEMLO Command Center" };

export default function LiveActivityPage() {
  return (
    <AdminShell title="Live Activity Monitoring">
      <div className="mb-6 rounded-xl border border-amber-500/25 bg-amber-500/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-[#F5F5F2]">Realtime Telemetry</h2>
          <StatusBadge status="disconnected" label="Ingestion Not Enabled" size="sm" />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#A3A39E]">
          No live event provider or approved ingestion endpoint is connected to this dashboard.
          An empty feed does not mean there are zero visitors.
        </p>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="Active Public Visitors" value="Unavailable" subtitle="Requires a verified real-time data source" source="Not Connected" />
        <KpiCard title="Events per Minute" value="Unavailable" subtitle="Ingestion has not been activated" source="Not Connected" />
        <KpiCard title="Data Collection Policy" value="Pending Review" subtitle="Approve scope, retention and privacy before activation" source="Security" />
      </div>
      <EmptyState title="Live Feed — Setup Required"
        description="Connect and verify privacy-reviewed public telemetry in a separate release. No mock sessions, auto-refresh indicators or synthetic events are shown." />
    </AdminShell>
  );
}
