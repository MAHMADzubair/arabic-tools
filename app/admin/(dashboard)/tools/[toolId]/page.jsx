import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import StatusBadge from "@/components/admin/StatusBadge";
import { TOOLS, CATEGORIES } from "@/lib/registry";
import EmptyState from "@/components/admin/EmptyState";
import { ExternalLink, ChevronLeft } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export default async function ToolDetailPage({ params }) {
  const { toolId } = await params;
  const tool = TOOLS.find((t) => t.id === toolId);

  if (!tool) {
    notFound();
  }

  const category = CATEGORIES.find((c) => c.id === tool.category);

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

      <EmptyState
        title="Tool Conversion Analytics — Setup Required"
        description="The tool registry information above is current. No verified funnel, export conversion or error-rate telemetry is connected; these metrics are intentionally unavailable."
      />
    </AdminShell>
  );
}
