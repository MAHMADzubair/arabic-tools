import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import StatusBadge from "@/components/admin/StatusBadge";
import KpiCard from "@/components/admin/KpiCard";
import DataTable from "@/components/admin/DataTable";
import { Activity, Shield } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Live Activity | QEMLO Command Center",
};

export default function LiveActivityPage() {
  // Live session mock-safe feed placeholder for Stage 1 (public telemetry is unactivated)
  const columns = [
    { key: "time", label: "Time (UTC)", sortable: true },
    { key: "type", label: "Event Type", render: (val) => <span className="font-mono text-[#FF5B04]">{val}</span> },
    { key: "target", label: "Tool / Route" },
    { key: "country", label: "Country", render: (val) => <span className="font-mono">{val}</span> },
    { key: "device", label: "Device" },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val === "Active" ? "live" : "success"} label={val} size="sm" />,
    },
  ];

  return (
    <AdminShell title="Live Activity Monitoring">
      {/* Live status bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#F5F5F2]">
                Realtime Telemetry Ingestion Gateway
              </span>
              <StatusBadge status="live" label="Polling Ready" size="sm" />
            </div>
            <p className="text-xs text-[#A3A39E]">
              Ephemerally buffered via serverless memory. Public ingestion disabled during Stage 1.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-[#262626] bg-[#141414] px-3 py-1.5 text-xs text-[#A3A39E]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Auto-Refresh: Every 10s
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Active Sessions"
          value="0"
          subtitle="Currently active anonymous sessions"
          source="Live Feed"
          highlight={true}
          badge={<StatusBadge status="live" label="Live" size="sm" />}
        />
        <KpiCard
          title="Events / Minute"
          value="0"
          subtitle="Real-time ingestion rate"
          source="Telemetry Gateway"
          badge={<StatusBadge status="neutral" label="Stage 1" size="sm" />}
        />
        <KpiCard
          title="Privacy Guardrail"
          value="Enforced"
          subtitle="Zero PII or calculator inputs stored"
          source="Audit Policy"
          badge={<StatusBadge status="success" label="Active" size="sm" />}
        />
      </div>

      {/* Privacy Guarantee Alert */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#262626] bg-[#161616] p-4 text-xs text-[#A3A39E]">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5B04]" />
        <div>
          <span className="font-semibold text-[#F5F5F2]">Privacy-Safe Live Monitoring: </span>
          QEMLO live event streaming captures only anonymous route transitions and step completions. Raw user input values, salary numbers, calculated documents, and personal identifiers are cryptographically and architecturally excluded.
        </div>
      </div>

      {/* Live Stream Table */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-[#F5F5F2]">
          Realtime Stream Feed
        </h3>
        <DataTable
          columns={columns}
          data={[]}
          emptyMessage="Live public telemetry ingestion is paused in Stage 1 development. Once Stage 4 is activated, anonymous events stream here in real time."
        />
      </div>
    </AdminShell>
  );
}
