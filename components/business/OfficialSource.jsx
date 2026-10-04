/**
 * components/business/OfficialSource.jsx
 * Ink & Signal: official source attribution, bottom of tool content sections.
 * Server-safe.
 *
 * Props (unchanged): sourceText, lastUpdated?, disclaimer?, className?
 */
export default function OfficialSource({
  sourceText,
  lastUpdated = null,
  disclaimer = null,
  className = "",
}) {
  return (
    <footer className={`os-box ${className}`} dir="rtl">
      <OfficialSourceStyles />
      <p className="os-line">
        <span className="os-label">المصدر:</span> {sourceText}.
        {lastUpdated && (
          <>
            {" "}
            <span className="os-label">آخر تحديث:</span>{" "}
            <time>{lastUpdated}</time>.
          </>
        )}
      </p>
      {disclaimer && <p className="os-note">{disclaimer}</p>}
    </footer>
  );
}

/**
 * Local styles. Map the --os-* fallbacks to your real Ink & Signal tokens.
 */
function OfficialSourceStyles() {
  return (
    <style>{`
      .os-box{
        --os-ink:#0a0a0a; --os-text2:#404040; --os-orange:#ff5a1f;
        margin-top:1rem; padding-top:.75rem;
        border-top:2px solid var(--os-ink);
        border-inline-start:6px solid var(--os-orange);
        padding-inline-start:.75rem;
        font-size:.6875rem; line-height:1.7; color:var(--os-text2);
      }
      @media (prefers-color-scheme: dark){
        :root:not([data-theme="light"]) .os-box{ --os-ink:#f5f5f5; --os-text2:#d4d4d4; }
      }
      :root[data-theme="dark"] .os-box{ --os-ink:#f5f5f5; --os-text2:#d4d4d4; }

      .os-line,.os-note{ margin:0; }
      .os-note{ margin-top:.25rem; }
      .os-label{ font-weight:800; color:var(--os-ink); }

      @media print{
        .os-box{ border-color:#000; color:#000; }
        .os-label{ color:#000; }
      }
    `}</style>
  );
}