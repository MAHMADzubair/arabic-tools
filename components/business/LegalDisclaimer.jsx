/**
 * components/business/LegalDisclaimer.jsx
 * Ink & Signal: reusable legal disclaimer block for invoice/tax tools.
 * Server-safe (no "use client" needed).
 *
 * Props (unchanged):
 *   variant?       — "invoice" | "checker" | "custom"  (default: "invoice")
 *   authorityAr?   — Arabic name of tax authority
 *   eInvoicingUrl? — URL to official e-invoicing page
 *   customText?    — Override all text (for custom variant)
 *   className?     — Extra wrapper classes
 */
export default function LegalDisclaimer({
  variant = "invoice",
  authorityAr = "الهيئة الاتحادية للضرائب",
  eInvoicingUrl = "https://tax.gov.ae/en/e-invoicing",
  customText = null,
  className = "",
}) {
  let heading = "إشعار مهم";
  let body = null;
  let showLink = false;

  if (variant === "custom" && customText) {
    body = customText;
  } else if (variant === "checker") {
    heading = "إخلاء مسؤولية";
    body =
      "نتائج هذه الأداة استرشادية فقط. تحقق من وضعك الضريبي مع مستشارك الضريبي أو مباشرة عبر البوابة الرسمية.";
  } else {
    body =
      "هذه الأداة تنشئ نموذج فاتورة ضريبية قابل للطباعة، ولا تُنشئ فاتورة إلكترونية ضمن نظام الفوترة الإلكترونية الرسمي. ملف PDF أو مستند مطبوع لا يُعدّ فاتورة إلكترونية بموجب المنظومة الرسمية. تحقق من متطلبات الفاتورة الضريبية مع مستشارك الضريبي.";
    showLink = Boolean(eInvoicingUrl);
  }

  const showSource = variant !== "custom" || !customText;

  return (
    <aside className={`ld-box ${className}`} dir="rtl" aria-label={heading}>
      <LegalDisclaimerStyles />
      <p className="ld-head">
        <span className="ld-tag" aria-hidden="true">!</span>
        <span>{heading}</span>
      </p>
      <p className="ld-body">{body}</p>

      {showLink && (
        <a
          href={eInvoicingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ld-link"
        >
          اقرأ أكثر عن نظام الفوترة الإلكترونية الرسمي
          <span className="ld-sr"> (يفتح في نافذة جديدة)</span>
        </a>
      )}

      {showSource && (
        <p className="ld-src">
          <span>المصدر:</span> {authorityAr}
        </p>
      )}
    </aside>
  );
}

/**
 * Local styles. Map the --ld-* fallbacks to your real Ink & Signal tokens.
 */
function LegalDisclaimerStyles() {
  return (
    <style>{`
      .ld-box{
        --ld-ink:#0a0a0a; --ld-paper:#ffffff; --ld-text2:#404040; --ld-orange:#ff5a1f;
        border:2px dashed var(--ld-ink); background:var(--ld-paper);
        color:var(--ld-ink); padding:1rem; font-size:.75rem; line-height:1.7;
      }
      @media (prefers-color-scheme: dark){
        :root:not([data-theme="light"]) .ld-box{
          --ld-ink:#f5f5f5; --ld-paper:#0a0a0a; --ld-text2:#d4d4d4;
        }
      }
      :root[data-theme="dark"] .ld-box{
        --ld-ink:#f5f5f5; --ld-paper:#0a0a0a; --ld-text2:#d4d4d4;
      }

      .ld-head{
        display:flex; align-items:center; gap:.5rem; margin:0 0 .5rem;
        font-weight:800; font-size:.8125rem; color:var(--ld-ink);
      }
      .ld-tag{
        flex:none; width:1.25rem; height:1.25rem; display:inline-flex;
        align-items:center; justify-content:center; font-weight:800;
        background:var(--ld-orange); color:#0a0a0a; border:2px solid var(--ld-ink);
      }
      .ld-body{ margin:0; color:var(--ld-text2); }

      .ld-link{
        display:inline-block; margin-top:.5rem; font-weight:700;
        color:var(--ld-ink); text-decoration:underline; text-underline-offset:3px;
      }
      .ld-link:hover{ text-decoration-thickness:2px; }
      .ld-link:focus-visible{ outline:3px solid var(--ld-orange); outline-offset:2px; }

      .ld-src{
        margin:.75rem 0 0; padding-top:.5rem; border-top:1px solid var(--ld-ink);
        font-weight:700; color:var(--ld-ink);
      }
      .ld-src span{ font-weight:800; }

      .ld-sr{
        position:absolute; width:1px; height:1px; overflow:hidden;
        clip:rect(0 0 0 0); white-space:nowrap;
      }

      @media print{
        .ld-box{ border:2px dashed #000; color:#000; background:none; }
        .ld-body,.ld-src,.ld-head,.ld-link{ color:#000; }
        .ld-tag{ background:none; }
      }
    `}</style>
  );
}