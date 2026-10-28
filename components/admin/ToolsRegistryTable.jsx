"use client";

import React from "react";
import Link from "next/link";
import DataTable from "./DataTable";
import StatusBadge from "./StatusBadge";

/**
 * Keep client-only render callbacks inside a Client Component.
 * Server Components may pass only plain, serializable registry data to this table.
 */
export default function ToolsRegistryTable({ tools = [] }) {
  const columns = [
    {
      key: "nameEn",
      label: "Tool",
      sortable: true,
      render: (name, tool) => (
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="text-lg">{tool.icon}</span>
          <div>
            <Link href={`/admin/tools/${encodeURIComponent(tool.id)}`} className="font-semibold text-[#F5F5F2] hover:text-[#FF5B04]">
              {name}
            </Link>
            <span className="block text-[11px] text-[#A3A39E]" dir="rtl">{tool.nameAr}</span>
          </div>
        </div>
      ),
    },
    { key: "categoryLabel", label: "Category", sortable: true },
    {
      key: "status",
      label: "Registry Status",
      sortable: true,
      render: (value) => (
        <StatusBadge status={value === "active" ? "success" : "pending"} label={value} size="sm" />
      ),
    },
    {
      key: "marketLabels",
      label: "Markets",
      render: (value) => (
        <span className="text-[#A3A39E]">{value || "Not specified"}</span>
      ),
    },
    {
      key: "featuredLabel",
      label: "Featured",
      sortable: true,
    },
    {
      key: "id",
      label: "Actions",
      render: (id, tool) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/tools/${encodeURIComponent(id)}`} className="rounded bg-[#202020] px-2 py-1 text-[11px] text-[#F5F5F2] hover:text-[#FF5B04]">
            Details
          </Link>
          <a href={tool.href} rel="noopener noreferrer" target="_blank" className="rounded bg-[#202020] px-2 py-1 text-[11px] text-[#A3A39E] hover:text-[#F5F5F2]">
            Public
          </a>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={tools} rowsPerPage={12} searchPlaceholder="Search tools, categories or markets..." />;
}
