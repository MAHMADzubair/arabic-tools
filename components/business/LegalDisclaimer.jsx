/**
 * components/business/LegalDisclaimer.jsx
 * Reusable legal disclaimer block for invoice/tax tools.
 * Server-safe (no "use client" needed).
 *
 * Props:
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
  if (variant === "custom" && customText) {
    return (
      <div className={`rounded-xl border border-amber-200 bg-amber-50/60 p-4 ${className}`}>
        <p className="text-[10px] font-extrabold text-amber-900 mb-1">⚠️ إشعار مهم</p>
        <p className="text-[10px] text-amber-800 leading-relaxed">{customText}</p>
      </div>
    );
  }

  if (variant === "checker") {
    return (
      <div className={`rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-1.5 ${className}`}>
        <p className="text-[10px] font-extrabold text-amber-900">⚠️ إخلاء مسؤولية</p>
        <p className="text-[10px] text-amber-800 leading-relaxed">
          نتائج هذه الأداة استرشادية فقط. تحقق من وضعك الضريبي مع مستشارك الضريبي أو مباشرة عبر البوابة الرسمية.
        </p>
        <p className="text-[10px] text-amber-700 font-bold">
          المصدر: {authorityAr}
        </p>
      </div>
    );
  }

  // Default: invoice variant
  return (
    <div className={`rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-1.5 ${className}`}>
      <p className="text-[10px] font-extrabold text-amber-900">⚠️ إشعار مهم</p>
      <p className="text-[10px] text-amber-800 leading-relaxed">
        هذه الأداة تنشئ نموذج فاتورة ضريبية قابل للطباعة، ولا تُنشئ فاتورة إلكترونية ضمن نظام الفوترة الإلكترونية الرسمي.
        ملف PDF أو مستند مطبوع لا يُعدّ فاتورة إلكترونية بموجب المنظومة الرسمية.
        تحقق من متطلبات الفاتورة الضريبية مع مستشارك الضريبي.
      </p>
      {eInvoicingUrl && (
        <a
          href={eInvoicingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-900 underline"
        >
          اقرأ أكثر عن نظام الفوترة الإلكترونية الرسمي ←
        </a>
      )}
      <p className="text-[10px] text-amber-700 font-bold">
        المصدر: {authorityAr}
      </p>
    </div>
  );
}
