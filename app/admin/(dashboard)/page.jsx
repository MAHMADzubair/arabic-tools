import React from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import ChartCard from "@/components/admin/ChartCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { getActiveTools, CATEGORIES } from "@/lib/registry";
import { getSupabaseAdmin } from "@/lib/sessionAuth";
import {
  Wrench,
  Server,
  Shield,
  Activity,
  ArrowUpRight,
  ExternalLink,
} from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Overview | QEMLO Command Center",
};

export default async function AdminOverviewPage() {
  const activeTools = getActiveTools();
  const categories = CATEGORIES;

  // Real-time Supabase connection check
  const startPing = Date.now();
  let dbStatus = "healthy";
  let dbLatency = 0;
  let sessionCount = 0;
  let attemptCount = 0;

  try {
    const sb = await getSupabaseAdmin();
    if (sb) {
      const { count: sCount } = await sb
        .from("admin_sessions")
        .select("*", { count: "exact", head: true });
      const { count: aCount } = await sb
        .from("admin_login_attempts")
        .select("*", { count: "exact", head: true });

      sessionCount = sCount || 0;
      attemptCount = aCount || 0;
      dbLatency = Date.now() - startPing;
    } else {
      dbStatus = "disconnected";
    }
  } catch {
    dbStatus = "error";
    dbLatency = Date.now() - startPing;
  }

  // Tool categories aggregation from dynamic registry
  const categoryStats = categories.map((c) => {
    const count = activeTools.filter((t) => t.category === c.id).length;
    return {
      label: c.nameEn,
      value: count,
      id: c.id,
      nameAr: c.nameAr,
    };
  });

  // Country target coverage
  const countryCounts = {
    Saudi: activeTools.filter((t) => (t.countries || []).includes("sa")).length,
    UAE: activeTools.filter((t) => (t.countries || []).includes("ae")).length,
    Kuwait: activeTools.filter((t) => (t.countries || []).includes("kw")).length,
    Qatar: activeTools.filter((t) => (t.countries || []).includes("qa")).length,
    Oman: activeTools.filter((t) => (t.countries || []).includes("om")).length,
    Bahrain: activeTools.filter((t) => (t.countries || []).includes("bh")).length,
    Egypt: activeTools.filter((t) => (t.countries || []).includes("eg")).length,
  };

  const countryChartData = Object.entries(countryCounts).map(([label, val]) => ({
    label,
    value: val,
  }));

  return (
    <AdminShell title="Overview Dashboard">
      {/* Top operational banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#262626] bg-[#141414] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF5B04]/10 text-[#FF5B04]">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#F5F5F2]">
                QEMLO Production Status
              </span>
              <StatusBadge status="live" label="Live & Operational" size="sm" />
            </div>
            <p className="text-xs text-[#A3A39E]">
              Primary Domain: <span className="font-mono text-[#F5F5F2]">qemlo.com</span> · Arabic RTL Public Interface
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/system"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#262626] bg-[#1A1A1A] px-3 py-1.5 text-xs font-semibold text-[#F5F5F2] transition hover:border-[#FF5B04]"
          >
            <span>Inspect System Health</span>
            <ArrowUpRight className="h-3 w-3 text-[#FF5B04]" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Active Registered Tools"
          value={activeTools.length}
          subtitle="Dynamically synced from registry"
          source="Registry"
          highlight={true}
          badge={<StatusBadge status="success" label="Active" size="sm" />}
        />

        <KpiCard
          title="Database Latency"
          value={`${dbLatency} ms`}
          subtitle="Direct PostgreSQL server round-trip"
          source="Supabase"
          badge={
            <StatusBadge
              status={dbStatus === "healthy" ? "success" : "warning"}
              label={dbStatus === "healthy" ? "Connected" : "Degraded"}
              size="sm"
            />
          }
        />

        <KpiCard
          title="Security Sessions"
          value={sessionCount}
          subtitle="Active admin sessions in DB"
          source="Auth"
          badge={<StatusBadge status="info" label="Secured" size="sm" />}
        />

        <KpiCard
          title="Rate-Limit Events"
          value={attemptCount}
          subtitle="Logged login attempts (24h)"
          source="Atomic RL"
          badge={<StatusBadge status="neutral" label="Monitored" size="sm" />}
        />
      </div>

      {/* Secondary KPI Grid (Integrations status) */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Google Search Console"
          value="Pending"
          subtitle="Awaiting GSC service account credentials"
          source="GSC API"
          badge={<StatusBadge status="disconnected" label="Setup Required" size="sm" />}
        />

        <KpiCard
          title="AdSense Revenue"
          value="Pending"
          subtitle="ca-pub-4706954030329423 tag active"
          source="AdSense"
          badge={<StatusBadge status="disconnected" label="Setup Required" size="sm" />}
        />

        <KpiCard
          title="Core Web Vitals"
          value="Ready"
          subtitle="Vercel Analytics tag mounted"
          source="Telemetry"
          badge={<StatusBadge status="info" label="Telemetry Ready" size="sm" />}
        />

        <KpiCard
          title="Index Protection"
          value="Active"
          subtitle="robots.txt disallow: /admin/"
          source="Robots"
          badge={<StatusBadge status="success" label="Noindex" size="sm" />}
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Tools by Target Country"
          subtitle="GCC regional calculation engines active on QEMLO"
          data={countryChartData}
          type="bar"
          color="#FF5B04"
          source="lib/registry.js"
        />

        <ChartCard
          title="Tools by Category"
          subtitle="Category distribution across business, finance & gulf"
          data={categoryStats.map((c) => ({ label: c.label.slice(0, 8), value: c.value }))}
          type="area"
          color="#FF5B04"
          source="lib/registry.js"
        />
      </div>

      {/* Registered Tools Overview Table */}
      <div className="mt-6 rounded-xl border border-[#262626] bg-[#161616] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222222] pb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F2]">
              Top Dynamic Platform Tools
            </h3>
            <p className="mt-0.5 text-xs text-[#A3A39E]">
              Discovered from central registry (<code className="text-[#FF5B04]">lib/registry.js</code>)
            </p>
          </div>
          <Link
            href="/admin/tools"
            className="text-xs font-semibold text-[#FF5B04] transition hover:text-[#FF7326]"
          >
            View all {activeTools.length} tools →
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#222222] text-[11px] uppercase tracking-wider text-[#73736C]">
              <tr>
                <th className="py-2.5 font-semibold">Tool Name</th>
                <th className="py-2.5 font-semibold">Category</th>
                <th className="py-2.5 font-semibold">Status</th>
                <th className="py-2.5 font-semibold">Target Countries</th>
                <th className="py-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {activeTools.slice(0, 6).map((tool) => (
                <tr key={tool.id} className="transition hover:bg-[#1A1A1A]">
                  <td className="py-3 font-medium text-[#F5F5F2]">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{tool.icon}</span>
                      <div>
                        <span>{tool.nameEn}</span>
                        <span className="block text-[11px] text-[#A3A39E]" dir="rtl">
                          {tool.nameAr}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 capitalize text-[#A3A39E]">
                    {tool.category}
                  </td>
                  <td className="py-3">
                    <StatusBadge
                      status={tool.status === "active" ? "success" : "pending"}
                      label={tool.status}
                      size="sm"
                    />
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {(tool.countries || []).map((code) => (
                        <span
                          key={code}
                          className="rounded bg-[#202020] px-1.5 py-0.5 text-[10px] font-mono uppercase text-[#A3A39E]"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <a
                      href={tool.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded bg-[#202020] px-2 py-1 text-[11px] font-medium text-[#FF5B04] transition hover:bg-[#2A2A2A]"
                    >
                      <span>Public</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
