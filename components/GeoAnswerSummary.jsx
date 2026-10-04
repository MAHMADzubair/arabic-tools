/**
 * components/GeoAnswerSummary.jsx
 *
 * Reusable GEO / Answer-engine factual summary block.
 * Renders near the top of priority Saudi and UAE legal/tax/HR tool pages
 * so AI answer engines and search snippets can extract structured key facts.
 *
 * Props:
 *   whatItDoes   — string  — ماذا تفعل هذه الأداة؟
 *   appliesTo    — string  — تنطبق على (country / jurisdiction)
 *   keyRule      — string  — القاعدة الأساسية
 *   authority    — string  — الجهة المرجعية
 *   authorityUrl — string  — optional URL for authority portal
 *   lastReviewed — string  — آخر مراجعة (e.g. "سبتمبر 2026")
 *   disclaimer   — string? — optional one-line advisory note
 *
 * Design notes:
 *   - All content is server-rendered HTML for GEO/snippet extraction.
 *   - Keep it concise: one fact per row.
 *   - Do NOT invent dates; only use "سبتمبر 2026" for pages reviewed in this task.
 */
export default function GeoAnswerSummary({
  whatItDoes,
  appliesTo,
  keyRule,
  authority,
  authorityUrl = null,
  lastReviewed,
  disclaimer = null,
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 mt-5" dir="rtl">
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs leading-relaxed shadow-sm">
        <div className="grid gap-2 sm:grid-cols-2">

          {/* ماذا تفعل هذه الأداة؟ */}
          <div className="flex gap-2">
            <span className="shrink-0 font-extrabold text-indigo-700 w-32">ماذا تفعل هذه الأداة؟</span>
            <span className="text-ink-secondary">{whatItDoes}</span>
          </div>

          {/* تنطبق على */}
          <div className="flex gap-2">
            <span className="shrink-0 font-extrabold text-indigo-700 w-32">تنطبق على:</span>
            <span className="text-ink-secondary">{appliesTo}</span>
          </div>

          {/* القاعدة الأساسية */}
          <div className="flex gap-2">
            <span className="shrink-0 font-extrabold text-indigo-700 w-32">القاعدة الأساسية:</span>
            <span className="text-ink-secondary">{keyRule}</span>
          </div>

          {/* الجهة المرجعية */}
          <div className="flex gap-2">
            <span className="shrink-0 font-extrabold text-indigo-700 w-32">الجهة المرجعية:</span>
            {authorityUrl ? (
              <a
                href={authorityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-700 hover:underline"
              >
                {authority}
              </a>
            ) : (
              <span className="text-ink-secondary">{authority}</span>
            )}
          </div>

          {/* آخر مراجعة */}
          <div className="flex gap-2 sm:col-span-2">
            <span className="shrink-0 font-extrabold text-indigo-700 w-32">آخر مراجعة:</span>
            <span className="text-ink-secondary">{lastReviewed}</span>
          </div>

        </div>

        {disclaimer && (
          <p className="mt-2 pt-2 border-t border-indigo-100 text-[11px] text-ink-muted leading-relaxed">
            ⚠️ {disclaimer}
          </p>
        )}
      </div>
    </div>
  );
}
