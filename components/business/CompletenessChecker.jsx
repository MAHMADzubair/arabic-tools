"use client";

/**
 * components/business/CompletenessChecker.jsx
 * Shared completeness checker UI for invoice/tax tools. Ink & Signal theme.
 *
 * Accepts a pre-computed array of check objects from the parent component.
 * Parent is responsible for all validation logic (country-specific rules stay there).
 *
 * Props:
 *   checks      — Array<{ label, status: "ok"|"warning"|"missing", hint? }>
 *   completePct — number 0-100
 *   barColor    — kept for backward compatibility, ignored (status never relies on color)
 *   okCount     — number
 *   warnCount   — number
 *   missCount   — number
 *   title?      — string  (default: "فحص مبدئي لاكتمال الحقول المطلوبة")
 *   subtitle?   — string  (default: "ليس فحصاً رسمياً — تحقق شكلي فقط")
 *   className?  — extra wrapper classes
 *
 * Exports:
 *   default CompletenessChecker  — renders its own styles
 *   CheckItem                    — single row; if used OUTSIDE CompletenessChecker,
 *                                  render <CompletenessStyles /> once on the page
 *   CompletenessStyles           — the <style> block
 */

const STATUS = {
  ok: { mark: "✓", word: "مكتمل" },
  warning: { mark: "!", word: "تنبيه" },
  missing: { mark: "✗", word: "ناقص" },
};

export default function CompletenessChecker({
  checks = [],
  completePct = 0,
  // eslint-disable-next-line no-unused-vars
  barColor,
  okCount = 0,
  warnCount = 0,
  missCount = 0,
  title = "فحص مبدئي لاكتمال الحقول المطلوبة",
  subtitle = "ليس فحصاً رسمياً — تحقق شكلي فقط",
  className = "",
}) {
  const pct = Math.min(100, Math.max(0, Number(completePct) || 0));

  return (
    <section className={`cc ${className}`} aria-label={title}>
      <CompletenessStyles />

      {/* Header */}
      <div className="cc-head">
        <h2 className="cc-title">{title}</h2>
        {subtitle && <p className="cc-sub">{subtitle}</p>}
      </div>

      {/* Progress */}
      <div className="cc-progress">
        <div className="cc-between">
          <span>اكتمال الحقول</span>
          <strong><bdi>{pct}%</bdi></strong>
        </div>
        <div
          className="cc-track"
          role="progressbar"
          aria-label="اكتمال الحقول"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className="cc-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="cc-counts">
          <span className="cc-count" data-s="ok">✓ <bdi>{okCount}</bdi> مكتمل</span>
          {warnCount > 0 && <span className="cc-count" data-s="warning">! <bdi>{warnCount}</bdi> يحتاج مراجعة</span>}
          {missCount > 0 && <span className="cc-count" data-s="missing">✗ <bdi>{missCount}</bdi> مفقود</span>}
        </p>
      </div>

      {/* Check items */}
      {checks.length > 0 && (
        <div className="cc-list" role="list">
          {checks.map((c, i) => (
            <CheckItem key={i} status={c.status} label={c.label} hint={c.hint} />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Single check row — also exported for inline use.
 * Status is written out as text (✓ مكتمل / ! تنبيه / ✗ ناقص) and also changes the
 * border: ok = thin solid, warning = dashed, missing = thick solid.
 */
export function CheckItem({ status, label, hint }) {
  const s = STATUS[status] ? status : "missing";
  const { mark, word } = STATUS[s];

  return (
    <div className="cc-item" data-s={s} role="listitem">
      <span className="cc-tag">{mark} {word}</span>
      <div>
        <strong>{label}</strong>
        {hint && <span className="cc-hint"> — {hint}</span>}
      </div>
    </div>
  );
}

export function CompletenessStyles() {
  return <style>{css}</style>;
}

// Reads the site's --c-* tokens when present, with the palette as fallback.
const css = `
:where(.cc,.cc-item){
  --i-bg:var(--c-bg,#F5F5F2);
  --i-ink:var(--c-ink,#0D0D0D);
  --i-mute:var(--c-mute,#55554F);
  --i-soft:var(--c-soft,#DEDED8);
  --i-accent:var(--c-accent,#FF6A1A);
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]) :where(.cc,.cc-item){
    --i-bg:var(--c-bg,#0D0D0D);--i-ink:var(--c-ink,#F5F5F2);
    --i-mute:var(--c-mute,#B4B4AD);--i-soft:var(--c-soft,#2A2A27);
  }
}
:root[data-theme="dark"] :where(.cc,.cc-item){
  --i-bg:var(--c-bg,#0D0D0D);--i-ink:var(--c-ink,#F5F5F2);
  --i-mute:var(--c-mute,#B4B4AD);--i-soft:var(--c-soft,#2A2A27);
}
.cc,.cc *,.cc-item,.cc-item *{box-sizing:border-box}
.cc{border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);color:var(--i-ink);padding:1.25rem;line-height:1.6}
.cc h2,.cc p{margin:0;padding:0}
.cc-head{margin-bottom:1rem}
.cc-title{font-size:.95rem;font-weight:800}
.cc-sub{font-size:.78rem;color:var(--i-mute)}
.cc-progress{display:grid;gap:.4rem;margin-bottom:1rem}
.cc-between{display:flex;justify-content:space-between;gap:1rem;font-size:.8rem}
.cc-track{height:.9rem;border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);overflow:hidden}
.cc-fill{height:100%;background:var(--i-accent);border-inline-end:2px solid var(--i-ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.cc-counts{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.25rem !important}
.cc-count{border:2px solid var(--i-ink);border-radius:2px;padding:0 .5rem;font-size:.75rem;font-weight:700;line-height:1.6}
.cc-count[data-s="warning"]{border-style:dashed}
.cc-count[data-s="missing"]{background:var(--i-ink);color:var(--i-bg)}
.cc-list{display:grid;gap:.5rem}

.cc-item{display:flex;align-items:flex-start;gap:.6rem;border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);color:var(--i-ink);padding:.55rem .75rem;font-size:.8rem;line-height:1.55}
.cc-item[data-s="warning"]{border-style:dashed}
.cc-item[data-s="missing"]{border-width:4px}
.cc-tag{flex:none;border:2px solid var(--i-ink);border-radius:2px;padding:0 .4rem;font-size:.72rem;font-weight:800;line-height:1.5;white-space:nowrap}
.cc-item[data-s="missing"] .cc-tag{background:var(--i-ink);color:var(--i-bg)}
.cc-hint{color:var(--i-mute)}
`;