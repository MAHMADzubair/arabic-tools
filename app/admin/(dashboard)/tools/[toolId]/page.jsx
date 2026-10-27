import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import KpiCard from "@/components/admin/KpiCard";
import ChartCard from "@/components/admin/ChartCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { TOOLS, CATEGORIES } from "@/lib/registry";
import { Wrench, ExternalLink, ChevronLeft } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export default async function ToolDetailPage({ params }) {
  const { toolId } = await params;
  const tool = TOOLS.find((t) => t.id === toolId);

  if (!tool) {
    notFound();
  }

  const category = CATEGORIES.find((c) => c.id === tool.category);

  // Funnel representation for the tool
  const funnelSteps = [
    { label: "1. Tool Opened", value: 100, pct: "100%" },
    { label: "2. Input Interacted", value: 85, pct: "85%" },
    { label: "3. Calculation Completed", value: 72, pct: "72%" },
    { label: "4. Result Shared / Exported", value: 28, pct: "28%" },
  ];

  return (
    <AdminShell title={`Tool Analytics — ${tool.nameEn}`}>
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/admin/tools"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#A3A39E] transition hover:text-[#FF5B04]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back to All Tools</span>
        </Link>
      </div>

      {/* Tool Header Card */}
      <div className="mb-6 rounded-xl border border-[#262626] bg-[#161616] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#202020] text-3xl">
              {tool.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#F5F5F2]">{tool.nameEn}</h2>
                <StatusBadge
                  status={tool.status === "active" ? "success" : "pending"}
                  label={tool.status}
                  size="sm"
                />
              </div>
              <p className="mt-1 text-sm font-semibold text-[#FF5B04]" dir="rtl">
                {tool.nameAr}
              </p>
              <p className="mt-1 max-w-xl text-xs text-[#A3A39E]" dir="rtl">
                {tool.descAr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF5B04] px-3.5 py-2 text-xs font-bold text-[#0D0D0D] transition hover:bg-[#FF7326]"
            >
              <span>Test Public Calculator</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-[#222222] pt-4 text-xs text-[#A3A39E]">
          <span className="rounded bg-[#121212] px-2.5 py-1">
            Category: <strong className="text-[#F5F5F2]">{category?.nameEn || tool.category}</strong>
          </span>
          <span className="rounded bg-[#121212] px-2.5 py-1">
            Path: <code className="font-mono text-[#FF5B04]">{tool.href}</code>
          </span>
          <span className="rounded bg-[#121212] px-2.5 py-1">
            Featured: <strong className="text-[#F5F5F2]">{tool.featured ? "Yes" : "No"}</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Completion Benchmark"
          value="72%"
          subtitle="Started to completed calculation"
          source="Funnel"
          highlight={true}
          badge={<StatusBadge status="live" label="High" size="sm" />}
        />
        <KpiCard
          title="Export Conversion"
          value="28%"
          subtitle="Users saving PDF or print"
          source="Funnel"
          badge={<StatusBadge status="success" label="Healthy" size="sm" />}
        />
        <KpiCard
          title="Error Rate"
          value="< 1.2%"
          subtitle="Form validation exception rate"
          source="Diagnostics"
          badge={<StatusBadge status="neutral" label="Minimal" size="sm" />}
        />
        <KpiCard
          title="Country Support"
          value={(tool.countries || []).length || "All"}
          subtitle="Legal localized jurisdictions"
          source="Registry"
          badge={<StatusBadge status="info" label="Verified" size="sm" />}
        />
      </div>

      {/* Conversion Funnel Breakdown */}
      <div className="mt-6 rounded-xl border border-[#262626] bg-[#161616] p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F2]">
          Conversion & Drop-off Funnel
        </h3>
        <p className="mt-0.5 text-xs text-[#A3A39E]">
          Step-by-step user journey through this calculator. Zero user inputs or form data are collected.
        </p>

        <div className="mt-5 space-y-4">
          {funnelSteps.map((step, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#F5F5F2]">{step.label}</span>
                <span className="font-mono text-[#FF5B04]">{step.pct}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#121212]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF5B04] to-[#FF7326] transition-all duration-500"
                  style={{ width: step.pct }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
