/**
 * components/business/OfficialSource.jsx
 * Official source attribution block shown at the bottom of tool content sections.
 * Server-safe.
 *
 * Props:
 *   sourceText    — e.g. "الهيئة الاتحادية للضرائب (FTA) — دولة الإمارات"
 *   lastUpdated?  — e.g. "سبتمبر 2026م"
 *   disclaimer?   — extra disclaimer sentence
 *   className?
 */
export default function OfficialSource({
  sourceText,
  lastUpdated = null,
  disclaimer = null,
  className = "",
}) {
  return (
    <p className={`text-[11px] text-ink-muted border-t border-brand-border pt-3 ${className}`}>
      {lastUpdated && <span>آخر تحديث: {lastUpdated} — </span>}
      <span>المصدر: {sourceText}.</span>
      {disclaimer && <span> {disclaimer}</span>}
    </p>
  );
}
