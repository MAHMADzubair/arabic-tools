/**
 * components/business/GeoSummary.jsx
 * Compact answer-engine / GEO factual summary block.
 * Renders near the top of major legal/tax tool pages so that
 * AI answer engines and search snippets can extract the key facts.
 *
 * Props:
 *   whatItDoes   — string  "تحسب ضريبة القيمة المضافة 15%..."
 *   appliesTo    — string  "المملكة العربية السعودية"
 *   keyRule      — string  "النسبة الأساسية 15% — نظام ضريبة القيمة المضافة"
 *   authority    — string  "هيئة الزكاة والضريبة والجمارك (ZATCA)"
 *   authorityUrl — string  optional link to authority portal
 *   lastReviewed — string  "سبتمبر 2026"
 *   disclaimer?  — string  optional one-line advisory note
 */
export default function GeoSummary({
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
          {/* What it does */}
          <div className="flex gap-2">
            <span className="shrink-0 font-extrabold text-indigo-700 w-28">ماذا تفعل؟</span>
            <span className="text-ink-secondary">{whatItDoes}</span>
          </div>
          {/* Applies to */}
          <div className="flex gap-2">
            <span className="shrink-0 font-extrabold text-indigo-700 w-28">تنطبق على:</span>
            <span className="text-ink-secondary">{appliesTo}</span>
          </div>
          {/* Key rule */}
          <div className="flex gap-2">
            <span className="shrink-0 font-extrabold text-indigo-700 w-28">القاعدة الأساسية:</span>
            <span className="text-ink-secondary">{keyRule}</span>
          </div>
          {/* Authority */}
          <div className="flex gap-2">
            <span className="shrink-0 font-extrabold text-indigo-700 w-28">الجهة المرجعية:</span>
            {authorityUrl ? (
              <a href={authorityUrl} target="_blank" rel="noopener noreferrer"
                className="text-indigo-700 hover:underline">
                {authority}
              </a>
            ) : (
              <span className="text-ink-secondary">{authority}</span>
            )}
          </div>
          {/* Last reviewed */}
          <div className="flex gap-2 sm:col-span-2">
            <span className="shrink-0 font-extrabold text-indigo-700 w-28">آخر مراجعة:</span>
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
