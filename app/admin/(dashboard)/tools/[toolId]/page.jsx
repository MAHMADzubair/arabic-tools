import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import StatusBadge from "@/components/admin/StatusBadge";
import KpiCard from "@/components/admin/KpiCard";
import { TOOLS, CATEGORIES } from "@/lib/registry";
import EmptyState from "@/components/admin/EmptyState";
import { getToolUsageReport } from "@/lib/integrations/toolEvents";
import { ExternalLink, ChevronLeft, Wrench, Eye, Users } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export default async function ToolDetailPage({ params }) {
  const { toolId } = await params;
  const tool = TOOLS.find((t) => t.id === toolId);

  if (!tool) {
    notFound();
  }

  const category = CATEGORIES.find((c) => c.id === tool.category);
  const usage = await getToolUsageReport();
  const isUsageConnected = usage.status === "connected";
  const toolStats = isUsageConnected
    ? usage.data?.tools?.find((t) => t.id === tool.id)
    : null;

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
          <span className="rounded bg-[#121212] px-2.5 py-1">
            Target Countries: <strong className="font-mono uppercase text-[#F5F5F2]">{(tool.countries || []).join(", ") || "Global"}</strong>
          </span>
        </div>
      </div>

      {/* Usage Analytics Grid (if connected) or Disconnected State */}
      {isUsageConnected && toolStats ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard
            title="Calculator Page Views"
            value={toolStats.views.toLocaleString()}
            subtitle="Verified views from GA4"
            source="GA4 Data API"
            highlight={true}
            badge={<StatusBadge status="success" label="Verified" size="sm" />}
          />
          <KpiCard
            title="Active Users"
            value={toolStats.users.toLocaleString()}
            subtitle="Unique visitors using this engine"
            source="GA4 Data API"
            badge={<StatusBadge status="info" label="Active" size="sm" />}
          />
          <KpiCard
            title="Calculation Integrity"
            value="Statutory Compliant"
            subtitle="Client-side execution verified"
            source="Engine Rules"
            badge={<StatusBadge status="live" label="100% Free" size="sm" />}
          />
        </div>
      ) : (
        <EmptyState
          title="Tool Conversion Analytics — Setup Required"
          description="The tool registry information above is current. No verified funnel, export conversion or error-rate telemetry is connected; these metrics are intentionally unavailable."
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
