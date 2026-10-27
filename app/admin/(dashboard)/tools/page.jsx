import React from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import StatusBadge from "@/components/admin/StatusBadge";
import KpiCard from "@/components/admin/KpiCard";
import DataTable from "@/components/admin/DataTable";
import { getActiveTools, CATEGORIES } from "@/lib/registry";
import { Wrench, ExternalLink, ArrowUpRight } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tool Analytics | QEMLO Command Center",
};

export default function ToolAnalyticsPage() {
  const tools = getActiveTools();
  const categories = CATEGORIES;

  const columns = [
    {
      key: "nameEn",
      label: "Tool Name",
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{row.icon}</span>
          <div>
            <Link
              href={`/admin/tools/${row.id}`}
              className="font-semibold text-[#F5F5F2] hover:text-[#FF5B04]"
            >
              {val}
            </Link>
            <span className="block text-[11px] text-[#A3A39E]" dir="rtl">
              {row.nameAr}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (val) => {
        const cat = categories.find((c) => c.id === val);
        return (
          <span className="capitalize text-[#A3A39E]">
            {cat ? cat.nameEn : val}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Lifecycle",
      sortable: true,
      render: (val) => (
        <StatusBadge
          status={val === "active" ? "success" : "pending"}
          label={val}
          size="sm"
        />
      ),
    },
    {
      key: "countries",
      label: "Markets",
      render: (val) => (
        <div className="flex flex-wrap gap-1">
          {(val || []).map((code) => (
            <span
              key={code}
              className="rounded bg-[#202020] px-1.5 py-0.5 text-[10px] font-mono uppercase text-[#A3A39E]"
            >
              {code}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "featured",
      label: "Featured",
      render: (val) => (
        <span className={`text-[11px] font-bold ${val ? "text-[#FF5B04]" : "text-[#73736C]"}`}>
          {val ? "★ Yes" : "No"}
        </span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (id, row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/tools/${id}`}
            className="inline-flex items-center gap-1 rounded bg-[#202020] px-2 py-1 text-[11px] font-semibold text-[#F5F5F2] transition hover:bg-[#2A2A2A] hover:text-[#FF5B04]"
          >
            <span>Funnel</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <a
            href={row.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded bg-[#202020] px-2 py-1 text-[11px] font-medium text-[#73736C] transition hover:bg-[#2A2A2A] hover:text-[#F5F5F2]"
          >
            <span>Public</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ),
    },
  ];

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

        <DataTable
          columns={columns}
          data={tools}
          searchPlaceholder="Search tools by name, slug or category..."
          rowsPerPage={12}
        />
      </div>
    </AdminShell>
  );
}
