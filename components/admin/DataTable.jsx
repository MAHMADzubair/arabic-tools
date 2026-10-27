"use client";
import React, { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "./Icons";

export default function DataTable({
  columns = [], // [{ key, label, render?, sortable? }]
  data = [],
  searchPlaceholder = "Search records...",
  emptyMessage = "No records found.",
  rowsPerPage = 10,
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...data];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some(
          (val) => val && String(val).toLowerCase().includes(q)
        )
      );
    }

    if (sortKey) {
      result.sort((a, b) => {
        const va = a[sortKey] ?? "";
        const vb = b[sortKey] ?? "";
        if (typeof va === "number" && typeof vb === "number") {
          return sortDir === "asc" ? va - vb : vb - va;
        }
        return sortDir === "asc"
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
    }

    return result;
  }, [data, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const currentRows = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#262626] bg-[#161616]">
      {/* Search Header */}
      <div className="flex items-center justify-between border-b border-[#222222] p-4">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#73736C]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-[#262626] bg-[#0D0D0D] py-1.5 pl-9 pr-3 text-xs text-[#F5F5F2] placeholder-[#73736C] outline-none transition focus:border-[#FF5B04]"
          />
        </div>
        <span className="text-xs text-[#73736C]">
          Showing {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#222222] bg-[#121212] text-[11px] uppercase tracking-wider text-[#73736C]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold ${
                    col.sortable ? "cursor-pointer hover:text-[#F5F5F2]" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {sortKey === col.key && (
                      <span className="text-[#FF5B04]">
                        {sortDir === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {currentRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-xs text-[#73736C]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentRows.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="transition hover:bg-[#1C1C1C]"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="whitespace-nowrap px-4 py-3 text-[#F5F5F2]"
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#222222] px-4 py-3 text-xs text-[#73736C]">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded border border-[#262626] bg-[#0D0D0D] transition hover:bg-[#202020] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded border border-[#262626] bg-[#0D0D0D] transition hover:bg-[#202020] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
