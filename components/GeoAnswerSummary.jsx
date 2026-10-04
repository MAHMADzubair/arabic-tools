/**
 * components/GeoAnswerSummary.jsx
 *
 * Reusable GEO / Answer-engine factual summary block (Ink & Signal).
 * Renders near the top of priority Saudi and UAE legal/tax/HR tool pages
 * so AI answer engines and search snippets can extract structured key facts.
 *
 * Server component: no hooks, no client JS. All content is plain HTML.
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
 *   - Uses a <dl> so each label/value pair is machine-readable.
 *   - Colors come from --c-* tokens with fallbacks (#F5F5F2 / #0D0D0D / #FF6A1A).
 *   - Orange is only a fill (the side bar), never text.
 *   - Do NOT invent dates; only use "سبتمبر 2026" for pages reviewed in this task.
 */

const CSS = `
.geo{--bg:var(--c-bg,#F5F5F2);--ink:var(--c-ink,#0D0D0D);--ac:var(--c-accent,#FF6A1A);--sf:var(--c-surface,#FFFFFF);--mu:var(--c-muted,#55554F);--ln:var(--c-line,#0D0D0D)}
@media (prefers-color-scheme:dark){.geo{--bg:var(--c-bg,#0D0D0D);--ink:var(--c-ink,#F5F5F2);--sf:var(--c-surface,#161616);--mu:var(--c-muted,#A8A8A0);--ln:var(--c-line,#F5F5F2)}}
.geo-box{display:flex;background:var(--sf);color:var(--ink);border:2px solid var(--ln);font-size:13px;line-height:1.7}
.geo-bar{flex:none;width:8px;background:var(--ac);border-inline-end:2px solid var(--ln)}
.geo-body{flex:1;min-width:0;padding:14px 16px}
.geo-dl{margin:0;display:grid;grid-template-columns:1fr}
.geo-row{display:grid;grid-template-columns:7.5rem 1fr;gap:12px;padding:8px 0;border-bottom:1px solid var(--ln)}
.geo-row:first-child{padding-top:0}
.geo-row:last-child{border-bottom:0;padding-bottom:0}
.geo-dl dt{margin:0;font-weight:800}
.geo-dl dd{margin:0;color:var(--ink);overflow-wrap:anywhere}
.geo-dl a{color:var(--ink);font-weight:700;text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:2px}
.geo-dl a:hover{background:var(--ac);color:#0D0D0D}
.geo-dl a:focus-visible{outline:3px solid var(--ac);outline-offset:2px}
.geo-note{margin:12px 0 0;padding-top:10px;border-top:2px solid var(--ln);font-size:12px;color:var(--mu)}
.geo-note b{color:var(--ink)}
@media (max-width:420px){.geo-row{grid-template-columns:1fr;gap:0}}
`;

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
    <div className="geo mx-auto max-w-2xl px-4 mt-5" dir="rtl">
      <style>{CSS}</style>
      <section className="geo-box" aria-label="ملخص سريع">
        <div className="geo-bar" aria-hidden="true" />
        <div className="geo-body">
          <dl className="geo-dl">
            <div className="geo-row">
              <dt>ماذا تفعل هذه الأداة؟</dt>
              <dd>{whatItDoes}</dd>
            </div>

            <div className="geo-row">
              <dt>تنطبق على</dt>
              <dd>{appliesTo}</dd>
            </div>

            <div className="geo-row">
              <dt>القاعدة الأساسية</dt>
              <dd>{keyRule}</dd>
            </div>

            <div className="geo-row">
              <dt>الجهة المرجعية</dt>
              <dd>
                {authorityUrl ? (
                  <a href={authorityUrl} target="_blank" rel="noopener noreferrer">
                    {authority}
                    <span className="sr-only"> (يفتح في نافذة جديدة)</span>
                  </a>
                ) : (
                  authority
                )}
              </dd>
            </div>

            <div className="geo-row">
              <dt>آخر مراجعة</dt>
              <dd>{lastReviewed}</dd>
            </div>
          </dl>

          {disclaimer && (
            <p className="geo-note">
              <b>تنبيه:</b> {disclaimer}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}