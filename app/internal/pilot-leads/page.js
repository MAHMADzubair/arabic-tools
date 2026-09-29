import { headers } from "next/headers";
import PilotLeadsClient from "./PilotLeadsClient";

export const metadata = {
  title: "Pilot Leads — Internal",
  robots: { index: false, follow: false },
};

const PLATFORM_LABEL = { salla:"سلة", shopify:"Shopify", zid:"Zid", other:"أخرى" };
const VOLUME_LABEL   = { lt_100:"< 100", "100_500":"100–500", "500_2000":"500–2000", gt_2000:"> 2000" };
const PROBLEM_LABEL  = { no_followup:"عدم المتابعة", price_objection:"اعتراض السعر", slow_response:"تأخر الرد", cart_abandon:"تخلي قبل الدفع", unknown_loss:"سبب مجهول", other:"أخرى" };
const INTEREST_LABEL = { yes:"نعم", maybe:"ربما" };

function priorityBadge(p) {
  if (p === "high")   return "🔴 عالي";
  if (p === "medium") return "🟡 متوسط";
  return "⚪ منخفض";
}

function priorityColor(p) {
  if (p === "high")   return "bg-rose-100 text-rose-800 border-rose-300";
  if (p === "medium") return "bg-amber-100 text-amber-800 border-amber-300";
  return "bg-slate-100 text-slate-600 border-slate-300";
}

async function fetchLeads(secret) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/internal/pilot-leads?secret=${encodeURIComponent(secret)}`,
      { cache: "no-store" });
    if (!res.ok) return { leads: [], error: `HTTP ${res.status}` };
    return res.json();
  } catch (err) {
    return { leads: [], error: err.message };
  }
}

export default async function PilotLeadsPage({ searchParams }) {
  const adminSecret = process.env.ADMIN_SECRET;

  // Not configured
  if (!adminSecret) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-8 text-center space-y-3 max-w-md">
          <p className="text-2xl">⚙️</p>
          <p className="text-white font-bold">ADMIN_SECRET not set</p>
          <p className="text-slate-400 text-sm">Add ADMIN_SECRET to your Vercel environment variables.</p>
        </div>
      </div>
    );
  }

  const secret = searchParams?.secret || "";
  if (secret !== adminSecret) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="rounded-2xl bg-slate-800 border border-red-800 p-8 text-center space-y-3 max-w-md">
          <p className="text-2xl">🔒</p>
          <p className="text-white font-bold">Unauthorized</p>
          <p className="text-slate-400 text-sm">
            Access this page at:<br />
            <code className="text-amber-400 text-xs">/internal/pilot-leads?secret=YOUR_ADMIN_SECRET</code>
          </p>
        </div>
      </div>
    );
  }

  const { leads = [], error, source } = await fetchLeads(secret);

  const enriched = leads.map(l => ({
    ...l,
    platformLabel:  PLATFORM_LABEL[l.platform]  || l.platform,
    volumeLabel:    VOLUME_LABEL[l.monthly_conversation_volume]   || l.monthly_conversation_volume,
    problemLabel:   PROBLEM_LABEL[l.biggest_problem]  || l.biggest_problem,
    interestLabel:  INTEREST_LABEL[l.trial_interest] || l.trial_interest,
    priorityBadge:  priorityBadge(l.priority),
    priorityColor:  priorityColor(l.priority),
    dateFormatted:  l.created_at ? new Date(l.created_at).toLocaleString("ar-SA", { dateStyle:"short", timeStyle:"short" }) : "—",
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏷️</span>
          <div>
            <h1 className="text-lg font-black">Pilot Leads — Internal</h1>
            <p className="text-slate-400 text-xs">AI Sales Closer · {enriched.length} lead{enriched.length !== 1 ? "s" : ""} · source: {source || "—"}</p>
          </div>
        </div>
        {error && <span className="rounded-lg bg-red-900 text-red-200 text-xs px-3 py-1">⚠️ {error}</span>}
      </div>

      {/* Stats bar */}
      {enriched.length > 0 && (
        <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "إجمالي الطلبات", val: enriched.length, color: "text-white" },
            { label: "أولوية عالية 🔴", val: enriched.filter(l=>l.priority==="high").length,   color: "text-rose-400" },
            { label: "أولوية متوسطة 🟡", val: enriched.filter(l=>l.priority==="medium").length, color: "text-amber-400" },
            { label: "يريد التجربة", val: enriched.filter(l=>l.trial_interest==="yes").length, color: "text-emerald-400" },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-slate-800 border border-slate-700 p-3 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
              <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pass to client for CSV + table interactivity */}
      <PilotLeadsClient leads={enriched} secret={secret} />
    </div>
  );
}
