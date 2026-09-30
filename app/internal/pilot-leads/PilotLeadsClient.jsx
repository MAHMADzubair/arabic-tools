"use client";

import { useState } from "react";

function buildCSV(leads) {
  const headers = [
    "الأولوية","الاسم","اسم المتجر","البريد الإلكتروني","واتساب",
    "المنصة","حجم المحادثات","المشكلة الرئيسية","اهتمام بالتجربة","تاريخ الإرسال",
  ];
  const rows = leads.map(l => [
    l.priorityBadge, l.name, l.store_name, l.email, l.whatsapp,
    l.platformLabel, l.volumeLabel, l.problemLabel, l.interestLabel, l.dateFormatted,
  ]);
  const escape = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return "\uFEFF" + [headers, ...rows].map(r => r.map(escape).join(",")).join("\r\n");
}

function downloadCSV(leads) {
  const csv  = buildCSV(leads);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `pilot-leads-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function PilotLeadsClient({ leads }) {
  const [sortField,  setSortField]  = useState("created_at");
  const [sortDir,    setSortDir]    = useState("desc");
  const [filterP,    setFilterP]    = useState("all");  // priority filter
  const [search,     setSearch]     = useState("");

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  }

  const filtered = leads
    .filter(l => filterP === "all" || l.priority === filterP)
    .filter(l => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (l.name||"").toLowerCase().includes(q)
        || (l.store_name||"").toLowerCase().includes(q)
        || (l.email||"").toLowerCase().includes(q);
    })
    .sort((a, b) => {
      let va = a[sortField] ?? "", vb = b[sortField] ?? "";
      if (sortField === "priority") { va = PRIORITY_ORDER[a.priority] ?? 9; vb = PRIORITY_ORDER[b.priority] ?? 9; }
      if (sortField === "created_at") { va = new Date(va); vb = new Date(vb); }
      if (va < vb) return sortDir === "asc" ? -1 :  1;
      if (va > vb) return sortDir === "asc" ?  1 : -1;
      return 0;
    });

  const SortBtn = ({ field, label }) => (
    <button onClick={() => toggleSort(field)}
      className={`text-left hover:text-white transition-colors ${sortField === field ? "text-amber-400 font-black" : "text-slate-400 font-bold"}`}>
      {label} {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </button>
  );

  if (!leads || leads.length === 0) {
    return (
      <div className="px-6 py-20 text-center space-y-3">
        <p className="text-4xl">📭</p>
        <p className="text-slate-400">No leads yet.</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-4 space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <input type="text" placeholder="بحث بالاسم أو المتجر أو الإيميل..." value={search} onChange={e => setSearch(e.target.value)}
          className="rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-slate-500 px-3.5 py-2 text-sm focus:border-amber-400 focus:outline-none w-full sm:w-64" />

        {/* Priority filter */}
        <div className="flex gap-2">
          {[
            { val: "all",    label: "الكل" },
            { val: "high",   label: "🔴 عالي" },
            { val: "medium", label: "🟡 متوسط" },
            { val: "low",    label: "⚪ منخفض" },
          ].map(f => (
            <button key={f.val} onClick={() => setFilterP(f.val)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${filterP === f.val ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* CSV export */}
        <button onClick={() => downloadCSV(filtered)}
          className="mr-auto rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2 transition-all">
          ⬇️ تصدير CSV ({filtered.length})
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-700">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-800 text-slate-400 text-xs">
            <tr>
              <th className="p-3 text-right"><SortBtn field="priority" label="الأولوية" /></th>
              <th className="p-3 text-right"><SortBtn field="name" label="الاسم" /></th>
              <th className="p-3 text-right">المتجر</th>
              <th className="p-3 text-right">المنصة</th>
              <th className="p-3 text-right"><SortBtn field="monthly_conversation_volume" label="الحجم" /></th>
              <th className="p-3 text-right">المشكلة</th>
              <th className="p-3 text-right">التجربة</th>
              <th className="p-3 text-right">البريد</th>
              <th className="p-3 text-right">واتساب</th>
              <th className="p-3 text-right"><SortBtn field="created_at" label="التاريخ" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.map(l => (
              <tr key={l.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-3">
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${l.priorityColor}`}>{l.priorityBadge}</span>
                </td>
                <td className="p-3 font-bold text-white whitespace-nowrap">{l.name}</td>
                <td className="p-3 text-slate-300 whitespace-nowrap">{l.store_name}</td>
                <td className="p-3">
                  <span className="rounded-full bg-brand/20 text-brand-200 border border-brand/30 text-[11px] font-bold px-2 py-0.5">{l.platformLabel}</span>
                </td>
                <td className="p-3 text-slate-300 text-xs whitespace-nowrap">{l.volumeLabel}</td>
                <td className="p-3 text-slate-300 text-xs max-w-[140px] truncate" title={l.problemLabel}>{l.problemLabel}</td>
                <td className="p-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${l.trial_interest === "yes" ? "bg-emerald-900 text-emerald-300" : "bg-slate-700 text-slate-400"}`}>{l.interestLabel}</span>
                </td>
                <td className="p-3 text-slate-400 text-xs" dir="ltr">
                  <a href={`mailto:${l.email}`} className="hover:text-amber-400 transition-colors">{l.email}</a>
                </td>
                <td className="p-3 text-slate-400 text-xs whitespace-nowrap" dir="ltr">{l.whatsapp}</td>
                <td className="p-3 text-slate-500 text-xs whitespace-nowrap">{l.dateFormatted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-slate-600 text-xs text-center">
        {filtered.length} of {leads.length} leads · Internal use only · noindex
      </p>
    </div>
  );
}
