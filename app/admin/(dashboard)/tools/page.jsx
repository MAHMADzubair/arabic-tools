import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import StatusBadge from "@/components/admin/StatusBadge";
import KpiCard from "@/components/admin/KpiCard";
import ToolsRegistryTable from "@/components/admin/ToolsRegistryTable";
import { getActiveTools, CATEGORIES } from "@/lib/registry";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tool Analytics | QEMLO Command Center",
};

export default function ToolAnalyticsPage() {
  const tools = getActiveTools();
  const categories = CATEGORIES;

  const categoryNames = Object.fromEntries(categories.map((category) => [category.id, category.nameEn]));
  const tableRows = tools.map((tool) => ({
    id: tool.id,
    href: tool.href,
    nameEn: tool.nameEn,
    nameAr: tool.nameAr,
    icon: tool.icon,
    categoryLabel: categoryNames[tool.category] || tool.category,
    status: tool.status,
    marketLabels: (tool.countries || []).join(", ").toUpperCase(),
    featuredLabel: tool.featured ? "Yes" : "No",
  }));

  return (
    <AdminShell title="Tool Analytics & Performance">
      {/* Top KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Tools"
          value={tools.length}
          subtitle="Dynamically loaded from registry"
          source="Registry"
          highlight={true}
          badge={<StatusBadge status="success" label="Active" size="sm" />}
        />
        <KpiCard
          title="Categories"
          value={categories.length}
          subtitle="Specialized operational domains"
          source="Registry"
          badge={<StatusBadge status="neutral" label="Structured" size="sm" />}
        />
        <KpiCard
          title="Featured Tools"
          value={tools.filter((t) => t.featured).length}
          subtitle="Highlighted on public homepage"
          source="Homepage Config"
          badge={<StatusBadge status="info" label="Featured" size="sm" />}
        />
        <KpiCard
          title="Gulf Coverage"
          value={tools.filter((t) => t.category === "gulf").length}
          subtitle="Specific Saudi & UAE legal calculators"
          source="Gulf Engines"
          badge={<StatusBadge status="live" label="Core Engines" size="sm" />}
        />
      </div>

      {/* Dynamic Tools Table */}
      <div className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F2]">
              All Registered Calculators & Digital Tools
            </h3>
            <p className="text-xs text-[#A3A39E]">
              Single source of truth in <code className="text-[#FF5B04]">lib/registry.js</code>. All tools dynamically rendered.
            </p>
          </div>
        </div>

        <ToolsRegistryTable tools={tableRows} />
      </div>
    </AdminShell>
  );
}
