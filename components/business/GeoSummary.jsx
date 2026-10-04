/**
 * components/business/GeoSummary.jsx
 * Ink & Signal: answer-engine / GEO factual summary block.
 *
 * Props (unchanged):
 *   whatItDoes, appliesTo, keyRule, authority, authorityUrl?, lastReviewed, disclaimer?
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
    <section
      className="gs-wrap"
      dir="rtl"
      aria-label="ملخص سريع"
    >
      <GeoSummaryStyles />
      <div className="gs-box">
        <dl className="gs-grid">
          <div className="gs-row">
            <dt>ماذا تفعل؟</dt>
            <dd>{whatItDoes}</dd>
          </div>

          <div className="gs-row">
            <dt>تنطبق على</dt>
            <dd>{appliesTo}</dd>
          </div>

          <div className="gs-row gs-key">
            <dt>القاعدة الأساسية</dt>
            <dd>{keyRule}</dd>
          </div>

          <div className="gs-row">
            <dt>الجهة المرجعية</dt>
            <dd>
              {authorityUrl ? (
                <a
                  href={authorityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gs-link"
                >
                  {authority}
                  <span className="gs-sr"> (يفتح في نافذة جديدة)</span>
                </a>
              ) : (
                authority
              )}
            </dd>
          </div>

          <div className="gs-row gs-full">
            <dt>آخر مراجعة</dt>
            <dd>
              <time>{lastReviewed}</time>
            </dd>
          </div>
        </dl>

        {disclaimer && (
          <p className="gs-note">
            <span className="gs-tag" aria-hidden="true">!</span>
            <span>
              <span className="gs-sr">تنبيه: </span>
              {disclaimer}
            </span>
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * Local styles. Map the --gs-* fallbacks to your real Ink & Signal tokens.
 */
function GeoSummaryStyles() {
  return (
    <style>{`
      .gs-wrap{
        --gs-ink:#0a0a0a; --gs-paper:#ffffff; --gs-muted:#e5e5e5;
        --gs-text2:#404040; --gs-orange:#ff5a1f; --gs-on-orange:#0a0a0a;
        max-width:42rem; margin:1.25rem auto 0; padding:0 1rem;
      }
      @media (prefers-color-scheme: dark){
        :root:not([data-theme="light"]) .gs-wrap{
          --gs-ink:#f5f5f5; --gs-paper:#0a0a0a; --gs-muted:#262626; --gs-text2:#d4d4d4;
        }
      }
      :root[data-theme="dark"] .gs-wrap{
        --gs-ink:#f5f5f5; --gs-paper:#0a0a0a; --gs-muted:#262626; --gs-text2:#d4d4d4;
      }

      .gs-box{
        border:2px solid var(--gs-ink); background:var(--gs-paper);
        color:var(--gs-ink); font-size:.8125rem; line-height:1.7;
      }
      .gs-grid{ display:grid; margin:0; grid-template-columns:1fr; }
      .gs-row{
        display:flex; flex-direction:column; gap:.125rem;
        padding:.75rem 1rem; border-bottom:1px solid var(--gs-ink);
      }
      .gs-row:last-child{ border-bottom:0; }
      .gs-row dt{
        font-weight:800; font-size:.6875rem; letter-spacing:.02em;
        color:var(--gs-ink); margin:0;
      }
      .gs-row dd{ margin:0; color:var(--gs-text2); }

      .gs-key{ background:var(--gs-orange); border-bottom-color:var(--gs-on-orange); }
      .gs-key dt, .gs-key dd{ color:var(--gs-on-orange); }
      .gs-key dd{ font-weight:700; }

      .gs-link{
        color:var(--gs-ink); font-weight:700;
        text-decoration:underline; text-underline-offset:3px;
      }
      .gs-link:hover{ text-decoration-thickness:2px; }
      .gs-link:focus-visible{ outline:3px solid var(--gs-orange); outline-offset:2px; }

      .gs-note{
        display:flex; gap:.5rem; align-items:flex-start; margin:0;
        padding:.75rem 1rem; border-top:2px dashed var(--gs-ink);
        font-size:.6875rem; color:var(--gs-text2);
      }
      .gs-tag{
        flex:none; width:1.25rem; height:1.25rem; display:inline-flex;
        align-items:center; justify-content:center; font-weight:800;
        border:2px solid var(--gs-ink); color:var(--gs-ink);
      }

      .gs-sr{
        position:absolute; width:1px; height:1px; overflow:hidden;
        clip:rect(0 0 0 0); white-space:nowrap;
      }

      @media (min-width:640px){
        .gs-grid{ grid-template-columns:1fr 1fr; }
        .gs-row{ border-bottom:1px solid var(--gs-ink); }
        .gs-row:nth-child(odd):not(.gs-full){ border-inline-start:0; }
        .gs-row:nth-child(even){ border-inline-start:1px solid var(--gs-ink); }
        .gs-full{ grid-column:1 / -1; border-inline-start:0 !important; }
      }

      @media print{
        .gs-key{ background:none; border:2px solid #000; }
        .gs-key dt,.gs-key dd,.gs-box,.gs-row dd{ color:#000; }
      }
    `}</style>
  );
}