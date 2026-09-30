"use client";

/**
 * components/business/CompletenessChecker.jsx
 * Shared completeness checker UI for invoice/tax tools.
 *
 * Accepts a pre-computed array of check objects from the parent component.
 * Parent is responsible for all validation logic (country-specific rules stay there).
 *
 * Props:
 *   checks      — Array<{ label, status: "ok"|"warning"|"missing", hint? }>
 *   completePct — number 0-100
 *   barColor    — Tailwind class e.g. "bg-emerald-500"
 *   okCount     — number
 *   warnCount   — number
 *   missCount   — number
 *   title?      — string  (default: "فحص مبدئي لاكتمال الحقول المطلوبة")
 *   subtitle?   — string  (default: "ليس فحصاً رسمياً — تحقق شكلي فقط")
 *   className?  — extra wrapper classes
 */
export default function CompletenessChecker({
  checks = [],
  completePct = 0,
  barColor = "bg-rose-500",
  okCount = 0,
  warnCount = 0,
  missCount = 0,
  title = "فحص مبدئي لاكتمال الحقول المطلوبة",
  subtitle = "ليس فحصاً رسمياً — تحقق شكلي فقط",
  className = "",
}) {
  return (
    <div className={`rounded-2xl border border-brand-border bg-white p-5 shadow-card ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🔍</span>
        <div>
          <h2 className="text-sm font-extrabold text-ink">{title}</h2>
          {subtitle && <p className="text-[11px] text-ink-muted">{subtitle}</p>}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-[11px] text-ink-secondary">
          <span>اكتمال الحقول</span>
          <span className="font-bold">{completePct}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${completePct}%` }}
          />
        </div>
        <div className="flex gap-3 text-[11px] font-bold pt-1">
          <span className="text-emerald-600">✅ {okCount} مكتمل</span>
          {warnCount > 0 && <span className="text-amber-600">⚠️ {warnCount} يحتاج مراجعة</span>}
          {missCount > 0 && <span className="text-rose-600">❌ {missCount} مفقود</span>}
        </div>
      </div>

      {/* Check items */}
      {checks.length > 0 && (
        <div className="space-y-1.5">
          {checks.map((c, i) => (
            <CheckItem key={i} status={c.status} label={c.label} hint={c.hint} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Single check row — also exported for inline use.
 */
export function CheckItem({ status, label, hint }) {
  const styles = {
    ok:      "bg-emerald-50 border-emerald-200 text-emerald-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    missing: "bg-rose-50 border-rose-200 text-rose-800",
  };
  const icon = status === "ok" ? "✅" : status === "warning" ? "⚠️" : "❌";

  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${styles[status] ?? styles.missing}`}>
      <span className="shrink-0 font-bold">{icon}</span>
      <div>
        <span className="font-bold">{label}</span>
        {hint && <span className="mr-1 opacity-75"> — {hint}</span>}
      </div>
    </div>
  );
}
