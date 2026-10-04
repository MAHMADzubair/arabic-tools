"use client";



import { useState, useMemo, useCallback } from "react";

import {

  formatAED as fmt,

  parseNum,

  calcLineVat,

  isValidUaeTrn as isValidTrn,

  calcCompleteness,

} from "@/lib/businessUtils";

import { EMIRATES } from "@/lib/countryBusinessConfig";



const VAT_RATES = [
  { id: "5",      label: "5% — خاضعة للضريبة",    rate: 0.05, tag: "5%",    tone: "sig-vat-standard" },
  { id: "0",      label: "0% — صفرية المعدل",      rate: 0,    tag: "0%",    tone: "sig-vat-zero" },
  { id: "exempt", label: "معفاة من الضريبة",       rate: null, tag: "معفاة", tone: "sig-vat-exempt" },
  { id: "out",    label: "خارج نطاق الضريبة",      rate: null, tag: "خ.ن",   tone: "sig-vat-out" },
];



// ─── VAT Rate Options ─────────────────────────────────────────────────────────*





// ─── Sample presets ───────────────────────────────────────────────────────────*



const PRESETS = {

  full: {

    seller: { name: "شركة النخيل للتجارة ذ.م.م", address: "شارع الشيخ زايد، برج المكتب 12", emirate: "دبي", trn: "100345678901234", cr: "123456", email: "info@nakhil.ae", phone: "+971 4 555 0001" },

    buyer:  { name: "مؤسسة الخليج للمقاولات", address: "منطقة المصفح الصناعية، مبنى 45", emirate: "أبوظبي", vatRegistered: "yes", trn: "100987654321098" },

    details:{ invoiceNumber: "INV-2026-001", issueDate: "2026-09-30", supplyDate: "", currency: "AED", notes: "" },

    lines: [

      { id: 1, name: "خدمات استشارية هندسية", qty: "10", unitPrice: "1500", discount: "0", vatRateId: "5" },

      { id: 2, name: "مواد بناء — خرسانة مسلحة", qty: "50",  unitPrice: "200",  discount: "500", vatRateId: "5" },

    ],

  },

  simplified: {

    seller: { name: "مطعم الإمارات التراثي", address: "شارع المرور، بناية 7", emirate: "أبوظبي", trn: "100111222333444", cr: "", email: "", phone: "" },

    buyer:  { name: "عميل أفراد", address: "", emirate: "", vatRegistered: "no", trn: "" },

    details:{ invoiceNumber: "INV-2026-042", issueDate: "2026-09-30", supplyDate: "", currency: "AED", notes: "" },

    lines: [

      { id: 1, name: "وجبة عشاء لشخصين", qty: "1", unitPrice: "1200", discount: "0", vatRateId: "5" },

      { id: 2, name: "مشروبات غير كحولية",  qty: "4", unitPrice: "25",   discount: "0", vatRateId: "5" },

    ],

  },

  mixed: {

    seller: { name: "مجموعة الفلك التجارية", address: "جبل علي الصناعية، مستودع 9", emirate: "دبي", trn: "100222333444555", cr: "789012", email: "", phone: "" },

    buyer:  { name: "شركة الأفق للتصدير", address: "منطقة الحميرية، دبي", emirate: "دبي", vatRegistered: "yes", trn: "100888999000111" },

    details:{ invoiceNumber: "INV-2026-088", issueDate: "2026-09-30", supplyDate: "", currency: "AED", notes: "" },

    lines: [

      { id: 1, name: "بضائع مستوردة — إلكترونيات",    qty: "5",  unitPrice: "3000", discount: "0",   vatRateId: "5" },

      { id: 2, name: "صادرات — مواد غذائية مصنّعة",   qty: "100",unitPrice: "50",   discount: "250", vatRateId: "0" },

      { id: 3, name: "خدمات مالية — رسوم إدارة ائتمان",qty: "1",  unitPrice: "800",  discount: "0",   vatRateId: "exempt" },

    ],

  },

};



const emptyLine = (id) => ({ id, name: "", qty: "1", unitPrice: "", discount: "0", vatRateId: "5" });



// ─── Main component ───────────────────────────────────────────────────────────*




const inputCls =
  "sig-input w-full rounded-xl border border-[var(--sig-border)] bg-[var(--sig-surface)] px-3.5 py-2.5 text-sm text-[var(--sig-text)] placeholder:text-[var(--sig-muted)] focus:outline-none";
const selectCls = `${inputCls} cursor-pointer`;
const labelCls =
  "mb-1 block text-xs font-bold text-[var(--sig-text-2)]";

function InvoiceCheckItem({ status, label, hint }) {
  const tone =
    status === "ok"
      ? "sig-success-text"
      : status === "warning"
        ? "sig-warning-text"
        : "sig-error-text";
  const mark = status === "ok" ? "✓" : status === "warning" ? "!" : "×";

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-[var(--sig-border)] bg-[var(--sig-surface)] p-3">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-current text-xs font-black ${tone}`}
        aria-hidden="true"
      >
        {mark}
      </span>
      <div className="min-w-0">
        <p className={`text-xs font-extrabold ${tone}`}>{label}</p>
        {hint && (
          <p className="mt-0.5 text-[10px] leading-5 text-[var(--sig-muted)]">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

function InvoiceStyles() {
  return (
    <style>{`
      .sig-invoice{
        --sig-bg:#F5F5F2;
        --sig-surface:#FFFFFF;
        --sig-surface-2:#ECECE7;
        --sig-border:#D4D4CE;
        --sig-text:#0D0D0D;
        --sig-text-2:#555555;
        --sig-muted:#6B6B66;
        --sig-ink:#0D0D0D;
        --sig-ink-text:#FFFFFF;
        --sig-ink-muted:#B5B5B0;
        --sig-orange:#FF5B04;
        --sig-orange-hover:#FF7A33;
        --sig-orange-press:#E64F00;
        --sig-success:#137A47;
        --sig-warning:#8A5A00;
        --sig-error:#C8321F;
      }
      @media (prefers-color-scheme: dark){
        :root:not([data-theme="light"]) .sig-invoice{
          --sig-bg:#0D0D0D;
          --sig-surface:#161616;
          --sig-surface-2:#1D1D1D;
          --sig-border:#2A2A2A;
          --sig-text:#F5F5F2;
          --sig-text-2:#B5B5B0;
          --sig-muted:#8E8E89;
          --sig-ink:#F5F5F2;
          --sig-ink-text:#0D0D0D;
          --sig-ink-muted:#555555;
          --sig-success:#4ADE80;
          --sig-warning:#FBBF24;
          --sig-error:#FF7A6B;
        }
      }
      :root[data-theme="dark"] .sig-invoice{
        --sig-bg:#0D0D0D;
        --sig-surface:#161616;
        --sig-surface-2:#1D1D1D;
        --sig-border:#2A2A2A;
        --sig-text:#F5F5F2;
        --sig-text-2:#B5B5B0;
        --sig-muted:#8E8E89;
        --sig-ink:#F5F5F2;
        --sig-ink-text:#0D0D0D;
        --sig-ink-muted:#555555;
        --sig-success:#4ADE80;
        --sig-warning:#FBBF24;
        --sig-error:#FF7A6B;
      }
      .sig-invoice{ color:var(--sig-text); }
      .sig-invoice :focus-visible{
        outline:2px solid var(--sig-orange);
        outline-offset:3px;
      }
      .sig-input:focus{
        border-color:var(--sig-orange)!important;
        box-:0 0 0 3px color-mix(in srgb,var(--sig-orange) 16%,transparent);
      }
      .sig-step{
        background:var(--sig-orange);
        color:#0D0D0D;
      }
      .sig-primary{
        background:var(--sig-orange);
        color:#0D0D0D;
        border:1px solid var(--sig-orange);
      }
      .sig-primary:hover{background:var(--sig-orange-hover)}
      .sig-primary:active{background:var(--sig-orange-press)}
      .sig-secondary{
        background:var(--sig-surface);
        color:var(--sig-text);
        border:1px solid var(--sig-border);
      }
      .sig-secondary:hover{border-color:var(--sig-text)}
      .sig-ink{
        background:var(--sig-ink);
        color:var(--sig-ink-text);
      }
      .sig-soft{
        background:var(--sig-surface-2);
        border-color:var(--sig-border);
      }
      .sig-success-text{color:var(--sig-success)!important}
      .sig-warning-text{color:var(--sig-warning)!important}
      .sig-error-text{color:var(--sig-error)!important}
      .sig-success-soft{
        background:color-mix(in srgb,var(--sig-success) 8%,var(--sig-surface));
        border-color:color-mix(in srgb,var(--sig-success) 35%,var(--sig-border));
      }
      .sig-warning-soft{
        background:color-mix(in srgb,var(--sig-warning) 8%,var(--sig-surface));
        border-color:color-mix(in srgb,var(--sig-warning) 35%,var(--sig-border));
      }
      .sig-error-soft{
        background:color-mix(in srgb,var(--sig-error) 8%,var(--sig-surface));
        border-color:color-mix(in srgb,var(--sig-error) 35%,var(--sig-border));
      }
      .sig-vat-standard{
        background:var(--sig-orange);
        color:#0D0D0D;
      }
      .sig-vat-zero{
        border:1px solid var(--sig-success);
        color:var(--sig-success);
        background:transparent;
      }
      .sig-vat-exempt{
        border:1px solid var(--sig-warning);
        color:var(--sig-warning);
        background:transparent;
      }
      .sig-vat-out{
        border:1px solid var(--sig-border);
        color:var(--sig-text-2);
        background:var(--sig-surface-2);
      }
      .sig-print-document{
        color:#0D0D0D;
        background:#FFFFFF;
      }
      .sig-print-document .sig-print-muted{color:#555555}
      .sig-print-document .sig-print-border{border-color:#D4D4CE}
      @media print{
        .sig-invoice{
          --sig-surface:#FFFFFF;
          --sig-surface-2:#F5F5F2;
          --sig-border:#D4D4CE;
          --sig-text:#0D0D0D;
          --sig-text-2:#555555;
          --sig-muted:#6B6B66;
        }
      }
    `}</style>
  );
}

export default function UaeVatInvoiceGenerator() {

  const [invoiceType, setInvoiceType] = useState("full"); // "full" | "simplified"*

  const [seller,  setSeller]  = useState(PRESETS.full.seller);

  const [buyer,   setBuyer]   = useState(PRESETS.full.buyer);

  const [details, setDetails] = useState(PRESETS.full.details);

  const [lines,   setLines]   = useState(PRESETS.full.lines);

  const [showValidation, setShowValidation] = useState(false);

  const [activeTab, setActiveTab] = useState("form"); // "form" | "preview"*

  const [validationOpen, setValidationOpen] = useState(false);



  // ── Apply preset ────────────────────────────────────────────────────────────*

  const applyPreset = useCallback((key) => {

    const p = PRESETS[key];

    if (key === "simplified") setInvoiceType("simplified");

    else setInvoiceType("full");

    setSeller(p.seller);

    setBuyer(p.buyer);

    setDetails(p.details);

    setLines(p.lines);

    setShowValidation(false);

    setActiveTab("form");

  }, []);



  const resetForm = useCallback(() => {

    setInvoiceType("full");

    setSeller({ name:"", address:"", emirate:"دبي", trn:"", cr:"", email:"", phone:"" });

    setBuyer({ name:"", address:"", emirate:"", vatRegistered:"no", trn:"" });

    setDetails({ invoiceNumber:"", issueDate:"", supplyDate:"", currency:"AED", notes:"" });

    setLines([emptyLine(1)]);

    setShowValidation(false);

    setActiveTab("form");

  }, []);



  // ── Line item helpers ───────────────────────────────────────────────────────*

  const updateLine = (id, field, value) =>

    setLines(ls => ls.map(l => l.id === id ? { ...l, [field]: value } : l));



  const addLine = () =>

    setLines(ls => [...ls, emptyLine(ls.length ? Math.max(...ls.map(l => l.id)) + 1 : 1)]);



  const removeLine = (id) =>

    setLines(ls => ls.length > 1 ? ls.filter(l => l.id !== id) : ls);



  // ── Calculations ────────────────────────────────────────────────────────────*

  const { lineCalcs, totals } = useMemo(() => {

    const lineCalcs = lines.map(l => {

      const rateObj   = VAT_RATES.find(r => r.id === l.vatRateId) || VAT_RATES[0];

      const result    = calcLineVat({ qty: l.qty, unitPrice: l.unitPrice, discount: l.discount, vatRate: rateObj.rate });

      return { ...result, rateObj };

    });



    const grossTotal    = lineCalcs.reduce((s, l) => s + l.gross, 0);

    const totalDiscount = lineCalcs.reduce((s, l) => s + l.discount, 0);

    const taxable5      = lineCalcs.filter(l => l.rateObj.id === "5").reduce((s, l) => s + l.taxableBase, 0);

    const taxable0      = lineCalcs.filter(l => l.rateObj.id === "0").reduce((s, l) => s + l.taxableBase, 0);

    const exemptTotal   = lineCalcs.filter(l => l.rateObj.id === "exempt").reduce((s, l) => s + l.taxableBase, 0);

    const outTotal      = lineCalcs.filter(l => l.rateObj.id === "out").reduce((s, l) => s + l.taxableBase, 0);

    const totalVat      = lineCalcs.reduce((s, l) => s + l.vatAmount, 0);

    const grandTotal    = lineCalcs.reduce((s, l) => s + l.lineTotal, 0);



    return { lineCalcs, totals: { grossTotal, totalDiscount, taxable5, taxable0, exemptTotal, outTotal, totalVat, grandTotal } };

  }, [lines]);



  // ── Simplified invoice warning ──────────────────────────────────────────────*

  const simplifiedWarning = invoiceType === "simplified"

    && totals.grandTotal > 10000

    && buyer.vatRegistered === "yes";



  // ── Completeness validation ─────────────────────────────────────────────────*

  const checks = useMemo(() => {

    const c = [];

    const ok = (label) => c.push({ label, status: "ok" });

    const warn = (label, hint) => c.push({ label, status: "warning", hint });

    const miss = (label, hint) => c.push({ label, status: "missing", hint });



    // Invoice heading (always present in our output)*

    ok('عنوان "فاتورة ضريبية / Tax Invoice"');



    // Seller*

    seller.name.trim()    ? ok("اسم المورد")    : miss("اسم المورد",    "مطلوب في كلا النوعين");

    seller.address.trim() ? ok("عنوان المورد")  : miss("عنوان المورد", "مطلوب في كلا النوعين");

    isValidTrn(seller.trn)

      ? ok("الرقم الضريبي للمورد (15 خانة)")

      : seller.trn.trim()

        ? warn("الرقم الضريبي للمورد", "يجب أن يكون 15 رقماً")

        : miss("الرقم الضريبي للمورد", "مطلوب في كلا النوعين");



    // Invoice details*

    details.invoiceNumber.trim() ? ok("رقم الفاتورة التسلسلي") : miss("رقم الفاتورة", "مطلوب");

    details.issueDate            ? ok("تاريخ الإصدار")           : miss("تاريخ الإصدار", "مطلوب");



    if (details.supplyDate && details.supplyDate !== details.issueDate) {

      ok("تاريخ التوريد (مختلف عن الإصدار)");

    } else if (!details.supplyDate) {

      warn("تاريخ التوريد", "أضفه إذا كان مختلفاً عن تاريخ الإصدار");

    }



    // Buyer — full invoice*

    if (invoiceType === "full") {

      buyer.name.trim()    ? ok("اسم العميل")    : miss("اسم العميل",    "مطلوب في الفاتورة الكاملة");

      buyer.address.trim() ? ok("عنوان العميل") : warn("عنوان العميل", "يُستحسن للفاتورة الكاملة");

      if (buyer.vatRegistered === "yes") {

        isValidTrn(buyer.trn)

          ? ok("الرقم الضريبي للعميل")

          : buyer.trn.trim()

            ? warn("الرقم الضريبي للعميل", "يجب أن يكون 15 رقماً — مطلوب لعملاء مسجلين")

            : miss("الرقم الضريبي للعميل", "مطلوب عندما يكون العميل مسجلاً");

      }

    }



    // Line items*

    const badLines = lines.filter(l => !l.name.trim() || !parseFloat(l.unitPrice));

    badLines.length === 0

      ? ok("بنود الفاتورة (وصف + سعر)")

      : miss("بنود الفاتورة", `${badLines.length} بند ناقص الوصف أو السعر`);



    return c;

  }, [seller, buyer, details, lines, invoiceType]);



  const { okCount, warnCount, missCount, completePct } = calcCompleteness(checks);



  // ── Print ───────────────────────────────────────────────────────────────────*

  const handlePrint = () => {

    setActiveTab("preview");

    setTimeout(() => window.print(), 300);

  };



  // ─── Render ─────────────────────────────────────────────────────────────────*

  return (

    <div className="sig-invoice mx-auto max-w-3xl space-y-4 px-4 py-6" dir="rtl">
      <InvoiceStyles />



      {/* ── Header card ── */}

      <div className="rounded-2xl border border-[var(--sig-border)] bg-[var(--sig-surface)] p-5  no-print">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>

            <div className="flex items-center gap-2 mb-1">

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sig-orange)] text-xs font-black text-[#0D0D0D]" aria-hidden="true">VAT</span>

              <h2 className="text-xl font-extrabold text-[var(--sig-text)]">مولد الفاتورة الضريبية في الإمارات</h2>

            </div>

            <p className="text-xs text-[var(--sig-text-2)]">

              أنشئ نموذج فاتورة ضريبية VAT قابل للطباعة — فاتورة كاملة أو مبسطة وفق متطلبات هيئة الضرائب الاتحادية FTA

            </p>

          </div>

          <div className="flex gap-2 flex-wrap">

            <button onClick={() => applyPreset("full")}

              className="rounded-xl bg-[var(--sig-surface-2)] border border-[var(--sig-border)] text-[var(--sig-text)] text-xs font-bold px-3 py-1.5 hover:bg-[var(--sig-surface-2)] transition-all">

              مثال كامل

            </button>

            <button onClick={() => applyPreset("simplified")}

              className="rounded-xl sig-success-soft border border-[var(--sig-border)] sig-success-text text-xs font-bold px-3 py-1.5 hover:sig-success-soft transition-all">

              مثال مبسط

            </button>

            <button onClick={() => applyPreset("mixed")}

              className="rounded-xl sig-warning-soft border border-[var(--sig-border)] sig-warning-text text-xs font-bold px-3 py-1.5 hover:sig-warning-soft transition-all">

              مثال مختلط

            </button>

            <button onClick={resetForm}

              className="rounded-xl bg-[var(--sig-surface-2)] border border-[var(--sig-border)] text-[var(--sig-text-2)] text-xs font-bold px-3 py-1.5 hover:bg-[var(--sig-surface-2)] transition-all">

              مسح

            </button>

          </div>

        </div>



        {/* Tab bar */}

        <div className="mt-4 flex gap-1 rounded-xl bg-[var(--sig-surface-2)] p-1">

          {[

            { id: "form",    label: "إدخال البيانات" },

            { id: "preview", label: "معاينة الفاتورة" },

          ].map(t => (

            <button key={t.id} onClick={() => setActiveTab(t.id)}

              className={`flex-1 rounded-lg text-xs font-bold py-2 transition-all ${activeTab === t.id ? "bg-[var(--sig-orange)] text-[#0D0D0D]" : "text-[var(--sig-text-2)] hover:text-[var(--sig-text)]"}`}>

              {t.label}

            </button>

          ))}

        </div>

      </div>



      {/* ══════════════════════ FORM TAB ══════════════════════ */}

      {activeTab === "form" && (

        <div className="space-y-4 no-print">



          {/* Step 1 — Invoice type */}

          <div className="rounded-2xl border border-[var(--sig-border)] bg-[var(--sig-surface)] p-5 ">

            <h2 className="text-sm font-extrabold text-[var(--sig-text)] mb-3 flex items-center gap-2">

              <span className="sig-step flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black">١</span>

              نوع الفاتورة

            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {[

                { id: "full",       label: "فاتورة ضريبية كاملة",   desc: "B2B أو مبالغ تتجاوز 10,000 درهم" },

                { id: "simplified", label: "فاتورة ضريبية مبسطة",   desc: "للمستهلكين أو مبالغ ≤ 10,000 درهم" },

              ].map(opt => (

                <button key={opt.id} onClick={() => setInvoiceType(opt.id)}

                  className={`rounded-xl border-2 p-4 text-right transition-all ${invoiceType === opt.id ? "border-[var(--sig-orange)] bg-[var(--sig-surface-2)]" : "border-[var(--sig-border)] bg-[var(--sig-surface)] hover:border-[var(--sig-border)]"}`}>

                  <div className="flex items-center gap-2 mb-1">

                    
                    <span className="text-sm font-extrabold text-[var(--sig-text)]">{opt.label}</span>

                  </div>

                  <p className="text-xs text-[var(--sig-text-2)]">{opt.desc}</p>

                  {invoiceType === opt.id && (

                    <span className="mt-2 inline-block text-[10px] font-black sig-primary px-2 py-0.5 rounded-full">✓ محدد</span>

                  )}

                </button>

              ))}

            </div>



            {/* Simplified guidance */}

            <div className="mt-3 rounded-xl border border-[var(--sig-border)] bg-[var(--sig-surface-2)] p-3">

              <p className="text-xs text-[var(--sig-text-2)] leading-relaxed">

                <span className="font-bold">متى تُستخدم الفاتورة المبسطة؟ </span>

                يمكن استخدامها عندما يكون المستلم غير مسجل في ضريبة القيمة المضافة، أو عندما لا تتجاوز قيمة المعاملة 10,000 درهم لمستلم مسجل.

                <span className="font-bold"> تحقق من انطباق شروط الفاتورة المبسطة على حالتك.</span>

              </p>

            </div>



            {simplifiedWarning && (

              <div className="mt-2 rounded-xl border border-[var(--sig-border)] sig-error-soft p-3 flex items-start gap-2">

                <span className="text-lg shrink-0">⚠️</span>

                <p className="text-xs sig-error-text font-bold leading-relaxed">

                  إجمالي الفاتورة يتجاوز 10,000 درهم والعميل مسجل ضريبياً — يجب إصدار فاتورة ضريبية كاملة وليس مبسطة.

                </p>

              </div>

            )}

          </div>



          {/* Step 2 — Seller */}

          <div className="rounded-2xl border border-[var(--sig-border)] bg-[var(--sig-surface)] p-5 ">

            <h2 className="text-sm font-extrabold text-[var(--sig-text)] mb-3 flex items-center gap-2">

              <span className="sig-step flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black">٢</span>

              بيانات المورد (المنشأة المُصدِرة)

            </h2>

            <div className="grid gap-3 sm:grid-cols-2">

              <div className="sm:col-span-2">

                <label className={labelCls}>اسم المنشأة *</label>

                <input className={inputCls} placeholder="شركة النخيل للتجارة ذ.م.م" value={seller.name}

                  onChange={e => setSeller(s => ({ ...s, name: e.target.value }))} />

              </div>

              <div className="sm:col-span-2">

                <label className={labelCls}>العنوان *</label>

                <input className={inputCls} placeholder="شارع الشيخ زايد، برج المكتب 12" value={seller.address}

                  onChange={e => setSeller(s => ({ ...s, address: e.target.value }))} />

              </div>

              <div>

                <label className={labelCls}>الإمارة *</label>

                <select className={selectCls} value={seller.emirate}

                  onChange={e => setSeller(s => ({ ...s, emirate: e.target.value }))}>

                  {EMIRATES.map(em => <option key={em}>{em}</option>)}

                </select>

              </div>

              <div>

                <label className={labelCls}>

                  الرقم الضريبي TRN *

                  <span className="mr-1 text-[10px] sig-warning-text font-normal">(تحقق شكلي — 15 رقماً)</span>

                </label>

                <input className={`${inputCls} ${seller.trn && !isValidTrn(seller.trn) ? "border-[var(--sig-error)] ring-1 " : seller.trn && isValidTrn(seller.trn) ? "border-[var(--sig-success)]" : ""}`}

                  placeholder="100xxxxxxxxxxxxxxx" dir="ltr" maxLength={15}

                  value={seller.trn}

                  onChange={e => setSeller(s => ({ ...s, trn: e.target.value.replace(/\D/g,"") }))} />

                {seller.trn && !isValidTrn(seller.trn) && (

                  <p className="text-[11px] sig-error-text mt-1">يجب أن يكون الرقم الضريبي 15 رقماً بالضبط</p>

                )}

                {seller.trn && isValidTrn(seller.trn) && (

                  <p className="text-[11px] sig-success-text mt-1">✓ صالح شكلياً — التحقق الرسمي عبر بوابة EmaraTax</p>

                )}

              </div>

              <div>

                <label className={labelCls}>السجل التجاري (اختياري)</label>

                <input className={inputCls} placeholder="123456" value={seller.cr}

                  onChange={e => setSeller(s => ({ ...s, cr: e.target.value }))} />

              </div>

              <div>

                <label className={labelCls}>البريد الإلكتروني (اختياري)</label>

                <input className={inputCls} type="email" placeholder="info@company.ae" dir="ltr" value={seller.email}

                  onChange={e => setSeller(s => ({ ...s, email: e.target.value }))} />

              </div>

              <div>

                <label className={labelCls}>الهاتف (اختياري)</label>

                <input className={inputCls} type="tel" placeholder="+971 4 xxx xxxx" dir="ltr" value={seller.phone}

                  onChange={e => setSeller(s => ({ ...s, phone: e.target.value }))} />

              </div>

            </div>

          </div>



          {/* Step 3 — Buyer */}

          <div className="rounded-2xl border border-[var(--sig-border)] bg-[var(--sig-surface)] p-5 ">

            <h2 className="text-sm font-extrabold text-[var(--sig-text)] mb-3 flex items-center gap-2">

              <span className="sig-step flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black">٣</span>

              بيانات العميل (المستلم)

              {invoiceType === "simplified" && (

                <span className="text-[10px] font-normal text-[var(--sig-muted)] mr-1">(اختيارية جزئياً في المبسطة)</span>

              )}

            </h2>

            <div className="grid gap-3 sm:grid-cols-2">

              <div className="sm:col-span-2">

                <label className={labelCls}>اسم العميل {invoiceType === "full" ? "*" : "(اختياري)"}</label>

                <input className={inputCls} placeholder="مؤسسة الخليج للمقاولات" value={buyer.name}

                  onChange={e => setBuyer(b => ({ ...b, name: e.target.value }))} />

              </div>

              {invoiceType === "full" && (

                <>

                  <div className="sm:col-span-2">

                    <label className={labelCls}>عنوان العميل</label>

                    <input className={inputCls} placeholder="منطقة المصفح، مبنى 45" value={buyer.address}

                      onChange={e => setBuyer(b => ({ ...b, address: e.target.value }))} />

                  </div>

                  <div>

                    <label className={labelCls}>الإمارة</label>

                    <select className={selectCls} value={buyer.emirate}

                      onChange={e => setBuyer(b => ({ ...b, emirate: e.target.value }))}>

                      <option value="">— اختر —</option>

                      {EMIRATES.map(em => <option key={em}>{em}</option>)}

                    </select>

                  </div>

                </>

              )}

              <div>

                <label className={labelCls}>هل العميل مسجل في ضريبة القيمة المضافة؟</label>

                <select className={selectCls} value={buyer.vatRegistered}

                  onChange={e => setBuyer(b => ({ ...b, vatRegistered: e.target.value, trn: "" }))}>

                  <option value="yes">نعم — مسجل</option>

                  <option value="no">لا — غير مسجل</option>

                  <option value="unknown">غير متأكد</option>

                </select>

              </div>

              {(buyer.vatRegistered === "yes" || buyer.vatRegistered === "unknown") && (

                <div className={invoiceType === "full" ? "" : ""}>

                  <label className={labelCls}>

                    الرقم الضريبي للعميل

                    {invoiceType === "full" && buyer.vatRegistered === "yes" && <span className="sig-error-text mr-1">*</span>}

                    <span className="text-[10px] sig-warning-text font-normal mr-1">(15 رقماً)</span>

                  </label>

                  <input className={`${inputCls} ${buyer.trn && !isValidTrn(buyer.trn) ? "border-[var(--sig-error)]" : buyer.trn && isValidTrn(buyer.trn) ? "border-[var(--sig-success)]" : ""}`}

                    placeholder="100xxxxxxxxxxxxxxx" dir="ltr" maxLength={15}

                    value={buyer.trn}

                    onChange={e => setBuyer(b => ({ ...b, trn: e.target.value.replace(/\D/g,"") }))} />

                </div>

              )}

            </div>

          </div>



          {/* Step 4 — Invoice details */}

          <div className="rounded-2xl border border-[var(--sig-border)] bg-[var(--sig-surface)] p-5 ">

            <h2 className="text-sm font-extrabold text-[var(--sig-text)] mb-3 flex items-center gap-2">

              <span className="sig-step flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black">٤</span>

              تفاصيل الفاتورة

            </h2>

            <div className="grid gap-3 sm:grid-cols-2">

              <div>

                <label className={labelCls}>رقم الفاتورة التسلسلي *</label>

                <input className={inputCls} placeholder="INV-2026-001" dir="ltr" value={details.invoiceNumber}

                  onChange={e => setDetails(d => ({ ...d, invoiceNumber: e.target.value }))} />

              </div>

              <div>

                <label className={labelCls}>العملة</label>

                <select className={selectCls} value={details.currency}

                  onChange={e => setDetails(d => ({ ...d, currency: e.target.value }))}>

                  <option value="AED">درهم إماراتي — AED</option>

                  <option value="USD">دولار أمريكي — USD</option>

                  <option value="EUR">يورو — EUR</option>

                  <option value="GBP">جنيه استرليني — GBP</option>

                  <option value="SAR">ريال سعودي — SAR</option>

                </select>

              </div>

              <div>

                <label className={labelCls}>تاريخ الإصدار *</label>

                <input className={inputCls} type="date" dir="ltr" value={details.issueDate}

                  onChange={e => setDetails(d => ({ ...d, issueDate: e.target.value }))} />

              </div>

              <div>

                <label className={labelCls}>

                  تاريخ التوريد

                  <span className="text-[10px] text-[var(--sig-muted)] font-normal mr-1">(إذا اختلف عن تاريخ الإصدار)</span>

                </label>

                <input className={inputCls} type="date" dir="ltr" value={details.supplyDate}

                  onChange={e => setDetails(d => ({ ...d, supplyDate: e.target.value }))} />

              </div>

              <div className="sm:col-span-2">

                <label className={labelCls}>ملاحظات (اختياري)</label>

                <textarea className={inputCls} rows={2} placeholder="شروط الدفع، تعليمات خاصة..." value={details.notes}

                  onChange={e => setDetails(d => ({ ...d, notes: e.target.value }))} />

              </div>

            </div>

            {details.currency !== "AED" && (

              <div className="mt-3 rounded-xl border border-[var(--sig-border)] sig-warning-soft p-3">

                <p className="text-xs sig-warning-text leading-relaxed">

                  <span className="font-bold">تنبيه: </span>

                  عند استخدام عملة أجنبية، يجب الإشارة إلى سعر الصرف المستخدم في الفاتورة ويجب التعبير عن مبلغ الضريبة بالدرهم الإماراتي أيضاً وفق متطلبات هيئة الضرائب FTA.

                </p>

              </div>

            )}

          </div>



          {/* Step 5 — Line items */}

          <div className="rounded-2xl border border-[var(--sig-border)] bg-[var(--sig-surface)] p-5 ">

            <h2 className="text-sm font-extrabold text-[var(--sig-text)] mb-3 flex items-center gap-2">

              <span className="sig-step flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black">٥</span>

              بنود الفاتورة

            </h2>



            <div className="space-y-3">

              {lines.map((line, idx) => {

                const calc = lineCalcs[idx];

                const rateObj = VAT_RATES.find(r => r.id === line.vatRateId) || VAT_RATES[0];

                return (

                  <div key={line.id} className="rounded-xl border border-[var(--sig-border)] bg-[var(--sig-surface-2)] p-3 space-y-3">

                    <div className="flex items-center justify-between">

                      <span className="text-xs font-extrabold text-[var(--sig-text-2)]">بند {idx + 1}</span>

                      {lines.length > 1 && (

                        <button onClick={() => removeLine(line.id)}

                          className="sig-error-text hover:sig-error-text text-xs font-bold transition-colors">

                          ✕ حذف

                        </button>

                      )}

                    </div>

                    <div>

                      <label className={labelCls}>الوصف / اسم السلعة أو الخدمة *</label>

                      <input className={inputCls} placeholder="خدمات استشارية هندسية" value={line.name}

                        onChange={e => updateLine(line.id, "name", e.target.value)} />

                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                      <div>

                        <label className={labelCls}>الكمية</label>

                        <input className={inputCls} type="number" min="0" step="any" placeholder="1" dir="ltr" value={line.qty}

                          onChange={e => updateLine(line.id, "qty", e.target.value)} />

                      </div>

                      <div>

                        <label className={labelCls}>سعر الوحدة ({details.currency})</label>

                        <input className={inputCls} type="number" min="0" step="any" placeholder="0.00" dir="ltr" value={line.unitPrice}

                          onChange={e => updateLine(line.id, "unitPrice", e.target.value)} />

                      </div>

                      <div>

                        <label className={labelCls}>الخصم ({details.currency})</label>

                        <input className={inputCls} type="number" min="0" step="any" placeholder="0" dir="ltr" value={line.discount}

                          onChange={e => updateLine(line.id, "discount", e.target.value)} />

                        {parseFloat(line.discount) > parseFloat(line.qty || 0) * parseFloat(line.unitPrice || 0) && (

                          <p className="text-[11px] sig-error-text mt-0.5">الخصم يتجاوز قيمة البند</p>

                        )}

                      </div>

                      <div>

                        <label className={labelCls}>نسبة الضريبة</label>

                        <select className={selectCls} value={line.vatRateId}

                          onChange={e => updateLine(line.id, "vatRateId", e.target.value)}>

                          {VAT_RATES.map(r => <option key={r.id} value={r.id}>{r.tag} — {r.label.split("—")[0].trim()}</option>)}

                        </select>

                      </div>

                    </div>

                    {/* Line calc summary */}

                    {(parseFloat(line.qty) > 0 && parseFloat(line.unitPrice) > 0) && (

                      <div className="flex flex-wrap gap-2 pt-1">

                        <span className="rounded-full text-[11px] font-bold bg-[var(--sig-surface-2)] text-[var(--sig-text-2)] px-2.5 py-0.5">

                          إجمالي: {fmt(calc?.gross)} {details.currency}

                        </span>

                        {(calc?.discount || 0) > 0 && (

                          <span className="rounded-full text-[11px] font-bold sig-error-soft sig-error-text px-2.5 py-0.5">

                            بعد الخصم: {fmt(calc?.taxableBase)} {details.currency}

                          </span>

                        )}

                        <span className={`rounded-full text-[11px] font-bold px-2.5 py-0.5 ${rateObj.tone}`}>

                          ضريبة: {fmt(calc?.vatAmount)} {details.currency}

                        </span>

                        <span className="rounded-full text-[11px] font-black bg-[var(--sig-surface-2)] text-[var(--sig-text)] px-2.5 py-0.5">

                          المجموع: {fmt(calc?.lineTotal)} {details.currency}

                        </span>

                      </div>

                    )}

                  </div>

                );

              })}

            </div>



            <button onClick={addLine}

              className="mt-3 w-full rounded-xl border-2 border-dashed border-[var(--sig-border)] text-[var(--sig-orange)] font-bold text-xs py-3 hover:border-[var(--sig-text)] hover:bg-[var(--sig-surface-2)] transition-all">

              + إضافة بند جديد

            </button>

          </div>



          {/* Totals card */}

          <div className="rounded-2xl border border-[var(--sig-border)] bg-[var(--sig-surface-2)] p-5 ">

            <h2 className="text-sm font-extrabold text-[var(--sig-text)] mb-3 flex items-center gap-2">

              <span className="text-base"></span> ملخص الإجماليات

            </h2>

            <div className="space-y-2 text-sm">

              {[

                { label: "المجموع قبل الخصم",          val: totals.grossTotal,    color: "text-[var(--sig-text)]" },

                totals.totalDiscount > 0 && { label: "إجمالي الخصومات",  val: -totals.totalDiscount, color: "sig-error-text" },

                totals.taxable5 > 0 && { label: "القيمة الخاضعة لـ 5%", val: totals.taxable5, color: "text-[var(--sig-text)]" },

                totals.taxable0 > 0 && { label: "القيمة الخاضعة لـ 0%", val: totals.taxable0, color: "text-[var(--sig-text)]" },

                totals.exemptTotal > 0 && { label: "القيمة المعفاة", val: totals.exemptTotal, color: "text-[var(--sig-text-2)]" },

                totals.outTotal > 0 && { label: "خارج النطاق الضريبي",  val: totals.outTotal, color: "text-[var(--sig-text-2)]" },

                { label: "إجمالي ضريبة القيمة المضافة (5%)", val: totals.totalVat, color: "text-[var(--sig-text)]", bold: true },

              ].filter(Boolean).map((row, i) => (

                <div key={i} className={`flex justify-between items-center py-1 ${row.bold ? "border-t border-[var(--sig-border)] pt-2" : ""}`}>

                  <span className={`text-xs ${row.bold ? "font-extrabold" : "font-medium"} text-[var(--sig-text-2)]`}>{row.label}</span>

                  <span className={`text-sm font-black ${row.color}`} dir="ltr">

                    {row.val < 0 ? "-" : ""}{fmt(Math.abs(row.val))} {details.currency}

                  </span>

                </div>

              ))}

              <div className="flex justify-between items-center border-t-2 border-[var(--sig-border)] pt-3 mt-2">

                <span className="text-base font-extrabold text-[var(--sig-text)]">الإجمالي النهائي شامل الضريبة</span>

                <span className="text-xl font-black text-[var(--sig-text)]" dir="ltr">

                  {fmt(totals.grandTotal)} {details.currency}

                </span>

              </div>

            </div>

          </div>



          {/* Completeness checker */}

          <div className="rounded-2xl border border-[var(--sig-border)] bg-[var(--sig-surface)] p-5 ">

            <div className="flex items-center justify-between cursor-pointer" onClick={() => { setShowValidation(true); setValidationOpen(v => !v); }}>

              <div className="flex items-center gap-2">

                <span className="text-base">🔍</span>

                <div>

                  <h2 className="text-sm font-extrabold text-[var(--sig-text)]">فحص مبدئي لاكتمال الحقول المطلوبة</h2>

                  <p className="text-[11px] text-[var(--sig-muted)]">ليس فحصاً رسمياً من هيئة الضرائب — تحقق شكلي فقط</p>

                </div>

              </div>

              <span className="text-[var(--sig-text-2)] text-xs">{validationOpen ? "▲" : "▼"}</span>

            </div>



            {/* Progress bar — always visible */}

            <div className="mt-3 space-y-1">

              <div className="flex justify-between text-[11px] text-[var(--sig-text-2)]">

                <span>اكتمال الحقول</span>

                <span className="font-bold">{completePct}%</span>

              </div>

              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">

                <div className={`h-2 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${completePct}%` }} />

              </div>

              <div className="flex gap-3 text-[11px] font-bold pt-1">

                <span className="sig-success-text">{okCount} مكتمل</span>

                {warnCount > 0 && <span className="sig-warning-text">{warnCount} يحتاج مراجعة</span>}

                {missCount > 0 && <span className="sig-error-text">{missCount} مفقود</span>}

              </div>

            </div>



            {/* Expandable details */}

            {(showValidation && validationOpen) && (

              <div className="mt-3 space-y-1.5">

                {checks.map((c, i) => (

                  <InvoiceCheckItem key={i} status={c.status} label={c.label} hint={c.hint} />

                ))}

              </div>

            )}

          </div>



          {/* Action buttons */}

          <div className="flex flex-col sm:flex-row gap-3 no-print">

            <button onClick={() => setActiveTab("preview")}

              className="sig-primary flex-1 rounded-xl py-3 text-sm font-extrabold transition-colors">

              معاينة الفاتورة

            </button>

            <button onClick={handlePrint}

              className="sig-secondary flex-1 rounded-xl py-3 text-sm font-extrabold transition-colors">

              طباعة / حفظ PDF

            </button>

          </div>

        </div>

      )}



      {/* ══════════════════════ PREVIEW TAB ══════════════════════ */}

      {activeTab === "preview" && (

        <>

          {/* Back button — hidden in print */}

          <div className="no-print flex gap-3">

            <button onClick={() => setActiveTab("form")}

              className="rounded-xl border border-[var(--sig-border)] text-[var(--sig-text-2)] hover:bg-[var(--sig-surface-2)] font-bold text-xs px-4 py-2 transition-all">

              ← العودة للتعديل

            </button>

            <button onClick={handlePrint}

              className="rounded-xl bg-[var(--sig-orange)] hover:bg-[var(--sig-ink)] text-white font-bold text-xs px-4 py-2 transition-all">

              طباعة / حفظ PDF

            </button>

          </div>



          {/* A4 Invoice Document */}

          <div id="invoice-print" className="rounded-2xl border border-[#D4D4CE] bg-white  print:-none print:border-0 print:rounded-none print:m-0 overflow-hidden">



            {/* Invoice header band */}

            <div className="bg-[var(--sig-ink)] px-8 py-5 print:bg-[var(--sig-ink)]" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-white text-xl font-black">فاتورة ضريبية</p>

                  <p className="text-[#D4D4CE] text-sm font-semibold">Tax Invoice</p>

                  {invoiceType === "simplified" && (

                    <span className="mt-1 inline-block rounded-full bg-white/20 text-white text-[10px] font-bold px-2 py-0.5">مبسطة · Simplified</span>

                  )}

                </div>

                <div className="text-left" dir="ltr">

                  <p className="text-white font-black text-lg">{details.invoiceNumber || "—"}</p>

                  <p className="text-[#D4D4CE] text-xs">{details.issueDate || ""}</p>

                  <p className="text-[#B5B5B0] text-[11px] mt-0.5">{details.currency}</p>

                </div>

              </div>

            </div>



            <div className="p-6 sm:p-8 space-y-6" dir="rtl">



              {/* Seller + Buyer */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Seller */}

                <div className="rounded-xl border border-[#D4D4CE] bg-[#F5F5F2] p-4">

                  <p className="text-[10px] font-black text-[var(--sig-orange)] uppercase tracking-wide mb-2">المورد · Supplier</p>

                  <p className="font-extrabold text-[#0D0D0D] text-sm">{seller.name || "—"}</p>

                  {seller.address && <p className="text-xs text-[#555555] mt-0.5">{seller.address}</p>}

                  {seller.emirate && <p className="text-xs text-[#555555]">{seller.emirate}، الإمارات العربية المتحدة</p>}

                  {seller.trn && (

                    <div className="mt-2">

                      <p className="text-[10px] font-bold text-[#6B6B66]">الرقم الضريبي TRN</p>

                      <p className="font-black text-xs text-[#0D0D0D]" dir="ltr">{seller.trn}</p>

                    </div>

                  )}

                  {seller.cr && <p className="text-[10px] text-[#6B6B66] mt-1">السجل التجاري: {seller.cr}</p>}

                  {seller.email && <p className="text-[10px] text-[#6B6B66]">{seller.email}</p>}

                  {seller.phone && <p className="text-[10px] text-[#6B6B66]" dir="ltr">{seller.phone}</p>}

                </div>



                {/* Buyer */}

                <div className="rounded-xl border border-[#D4D4CE] bg-[#F5F5F2] p-4">

                  <p className="text-[10px] font-black text-[#555555] uppercase tracking-wide mb-2">العميل · Customer</p>

                  {buyer.name ? (

                    <>

                      <p className="font-extrabold text-[#0D0D0D] text-sm">{buyer.name}</p>

                      {buyer.address && <p className="text-xs text-[#555555] mt-0.5">{buyer.address}</p>}

                      {buyer.emirate && <p className="text-xs text-[#555555]">{buyer.emirate}، الإمارات</p>}

                      {buyer.trn && (

                        <div className="mt-2">

                          <p className="text-[10px] font-bold text-[#6B6B66]">الرقم الضريبي TRN</p>

                          <p className="font-black text-xs text-[#0D0D0D]" dir="ltr">{buyer.trn}</p>

                        </div>

                      )}

                      {buyer.vatRegistered === "no" && (

                        <p className="mt-1 text-[10px] text-[#6B6B66]">غير مسجل في ضريبة القيمة المضافة</p>

                      )}

                    </>

                  ) : (

                    <p className="text-xs text-[#6B6B66]">عميل أفراد / مستهلك نهائي</p>

                  )}

                </div>

              </div>



              {/* Supply date row */}

              {details.supplyDate && details.supplyDate !== details.issueDate && (

                <div className="rounded-xl border border-[#D4D4CE] sig-warning-soft/50 p-3 flex items-center gap-3">

                  <span className="sig-warning-text text-sm"></span>

                  <div className="text-xs sig-warning-text">

                    <span className="font-bold">تاريخ التوريد: </span>

                    <span dir="ltr">{details.supplyDate}</span>

                    <span className="mr-2 sig-warning-text">(يختلف عن تاريخ الإصدار {details.issueDate})</span>

                  </div>

                </div>

              )}



              {/* Line items table */}

              <div className="overflow-x-auto">

                <table className="w-full text-xs border-collapse">

                  <thead>

                    <tr className="bg-[#F5F5F2] text-[#555555]">

                      <th className="text-right p-2 font-extrabold rounded-tr-lg">#</th>

                      <th className="text-right p-2 font-extrabold">الوصف</th>

                      <th className="text-right p-2 font-extrabold">الكمية</th>

                      <th className="text-right p-2 font-extrabold">سعر الوحدة</th>

                      <th className="text-right p-2 font-extrabold">الخصم</th>

                      <th className="text-right p-2 font-extrabold">الضريبة</th>

                      <th className="text-right p-2 font-extrabold">ضريبة</th>

                      <th className="text-right p-2 font-extrabold rounded-tl-lg">الإجمالي</th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-[var(--sig-border)]">

                    {lines.map((line, idx) => {

                      const calc = lineCalcs[idx];

                      const rateObj = VAT_RATES.find(r => r.id === line.vatRateId) || VAT_RATES[0];

                      return (

                        <tr key={line.id} className="hover:bg-[#F5F5F2]">

                          <td className="p-2 text-[#6B6B66]">{idx + 1}</td>

                          <td className="p-2 font-medium text-[#0D0D0D]">{line.name || "—"}</td>

                          <td className="p-2 text-[#555555]" dir="ltr">{line.qty || 0}</td>

                          <td className="p-2 text-[#555555]" dir="ltr">{fmt(parseFloat(line.unitPrice) || 0)}</td>

                          <td className="p-2 sig-error-text" dir="ltr">{parseFloat(line.discount) > 0 ? `(${fmt(parseFloat(line.discount))})` : "—"}</td>

                          <td className="p-2">

                            <span className={`rounded-full text-[10px] font-bold px-1.5 py-0.5 ${rateObj.tone}`}>{rateObj.tag}</span>

                          </td>

                          <td className="p-2 text-[#0D0D0D] font-medium" dir="ltr">{fmt(calc?.vatAmount)}</td>

                          <td className="p-2 font-black text-[#0D0D0D]" dir="ltr">{fmt(calc?.lineTotal)}</td>

                        </tr>

                      );

                    })}

                  </tbody>

                </table>

              </div>



              {/* Totals */}

              <div className="flex justify-end">

                <div className="w-full sm:w-72 rounded-xl border border-[#D4D4CE] bg-[#F5F5F2] overflow-hidden">

                  {[

                    { label: "المجموع قبل الخصم", val: totals.grossTotal, sub: true },

                    totals.totalDiscount > 0 && { label: "إجمالي الخصومات", val: -totals.totalDiscount, sub: true, neg: true },

                    totals.taxable5 > 0 && { label: "خاضع 5%", val: totals.taxable5, sub: true },

                    totals.taxable0 > 0 && { label: "صفري المعدل 0%", val: totals.taxable0, sub: true },

                    totals.exemptTotal > 0 && { label: "معفاة", val: totals.exemptTotal, sub: true },

                    totals.outTotal > 0 && { label: "خارج النطاق", val: totals.outTotal, sub: true },

                    { label: "إجمالي الضريبة (5%)", val: totals.totalVat, sub: true, bold: true },

                  ].filter(Boolean).map((row, i) => (

                    <div key={i} className={`flex justify-between px-4 py-2 text-xs ${row.bold ? "bg-[#F5F5F2] border-t border-[#D4D4CE]" : "border-t border-[#D4D4CE] first:border-t-0"}`}>

                      <span className={row.bold ? "font-extrabold text-[#0D0D0D]" : "text-[#555555]"}>{row.label}</span>

                      <span className={`font-black ${row.neg ? "sig-error-text" : row.bold ? "text-[#0D0D0D]" : "text-[#0D0D0D]"}`} dir="ltr">

                        {row.neg ? "-" : ""}{fmt(Math.abs(row.val))} {details.currency}

                      </span>

                    </div>

                  ))}

                  <div className="flex justify-between px-4 py-3 bg-[var(--sig-ink)] text-white">

                    <span className="text-sm font-extrabold">الإجمالي النهائي</span>

                    <span className="text-sm font-black" dir="ltr">{fmt(totals.grandTotal)} {details.currency}</span>

                  </div>

                </div>

              </div>



              {/* Notes */}

              {details.notes && (

                <div className="rounded-xl border border-[#D4D4CE] bg-[#F5F5F2] p-4">

                  <p className="text-[10px] font-bold text-[#6B6B66] mb-1">ملاحظات</p>

                  <p className="text-xs text-[#555555] leading-relaxed">{details.notes}</p>

                </div>

              )}



              {/* Disclaimer */}

              <div className="rounded-xl border border-[#D4D4CE] sig-warning-soft p-4 space-y-1.5">

                <p className="text-[10px] font-extrabold sig-warning-text">إشعار مهم</p>

                <p className="text-[10px] sig-warning-text leading-relaxed">

                  هذه الأداة تنشئ نموذج فاتورة ضريبية قابل للطباعة، ولا تُنشئ فاتورة إلكترونية ضمن نظام الفوترة الإلكترونية الإماراتي.

                  ملف PDF أو مستند مطبوع لا يُعدّ فاتورة إلكترونية بموجب متطلبات المنظومة الإماراتية للفوترة الإلكترونية.

                  تحقق من متطلبات الفاتورة الضريبية مع مستشارك الضريبي أو عبر بوابة EmaraTax.

                </p>

                <p className="text-[10px] sig-warning-text font-bold">

                  المصدر: الهيئة الاتحادية للضرائب — دولة الإمارات العربية المتحدة

                </p>

              </div>



            </div>

          </div>

        </>

      )}



      {/* ── e-Invoicing notice (always visible) ── */}

      <div className="rounded-2xl border border-rose-200 sig-error-soft/60 p-5  no-print">

        <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-[var(--sig-ink-text)]">

          <span>📡</span> هذه الأداة ليست نظام فوترة إلكترونية

        </h3>

        <div className="space-y-2 text-xs text-rose-800 leading-relaxed">

          <p>

            الفاتورة الإلكترونية في الإمارات (e-Invoice) هي بيانات منظمة يتم تبادلها إلكترونياً والإبلاغ عنها عبر المنظومة الرسمية المعتمدة من هيئة الضرائب الاتحادية.

            ملفات PDF ومستندات Word والصور والنسخ الممسوحة ضوئياً ورسائل البريد الإلكتروني <span className="font-black">لا تُعدّ فواتير إلكترونية</span>.

          </p>

          <p>

            هذه الأداة تنشئ نموذج فاتورة ضريبية قابل للطباعة فقط.

          </p>

          <a href="https\://tax.gov.ae/en/e-invoicing" target="_blank" rel="noopener noreferrer"

            className="inline-flex items-center gap-1 font-bold text-[var(--sig-ink-muted)] hover:text-[var(--sig-ink-muted)] underline">

            اقرأ أكثر عن نظام الفوترة الإلكترونية الإماراتي ←

          </a>

        </div>

      </div>



    </div>

  );

}
