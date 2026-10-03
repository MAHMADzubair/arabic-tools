"use client";

import { useState, useMemo, useCallback } from "react";
import {
  formatAED as fmt,
  parseNum,
  calcLineVat,
  isValidUaeTrn as isValidTrn,
  calcCompleteness,
  inputCls,
  selectCls,
  labelCls,
} from "@/lib/businessUtils";
import { EMIRATES } from "@/lib/countryBusinessConfig";
import { CheckItem } from "@/components/business/CompletenessChecker";

const VAT_RATES = [
  { id: "5",      label: "5% — خاضعة للضريبة",      rate: 0.05, tag: "5%",      color: "bg-blue-100 text-blue-800" },
  { id: "0",      label: "0% — صفرية المعدل",         rate: 0,    tag: "0%",      color: "bg-emerald-100 text-emerald-800" },
  { id: "exempt", label: "معفاة من الضريبة",           rate: null, tag: "معفاة",   color: "bg-amber-100 text-amber-800" },
  { id: "out",    label: "خارج نطاق الضريبة",          rate: null, tag: "خ.ن",    color: "bg-slate-100 text-slate-700" },
];

// ─── VAT Rate Options ─────────────────────────────────────────────────────────


// ─── Sample presets ───────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export default function UaeVatInvoiceGenerator() {
  const [invoiceType, setInvoiceType] = useState("full"); // "full" | "simplified"
  const [seller,  setSeller]  = useState(PRESETS.full.seller);
  const [buyer,   setBuyer]   = useState(PRESETS.full.buyer);
  const [details, setDetails] = useState(PRESETS.full.details);
  const [lines,   setLines]   = useState(PRESETS.full.lines);
  const [showValidation, setShowValidation] = useState(false);
  const [activeTab, setActiveTab] = useState("form"); // "form" | "preview"
  const [validationOpen, setValidationOpen] = useState(false);

  // ── Apply preset ────────────────────────────────────────────────────────────
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

  // ── Line item helpers ───────────────────────────────────────────────────────
  const updateLine = (id, field, value) =>
    setLines(ls => ls.map(l => l.id === id ? { ...l, [field]: value } : l));

  const addLine = () =>
    setLines(ls => [...ls, emptyLine(ls.length ? Math.max(...ls.map(l => l.id)) + 1 : 1)]);

  const removeLine = (id) =>
    setLines(ls => ls.length > 1 ? ls.filter(l => l.id !== id) : ls);

  // ── Calculations ────────────────────────────────────────────────────────────
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

  // ── Simplified invoice warning ──────────────────────────────────────────────
  const simplifiedWarning = invoiceType === "simplified"
    && totals.grandTotal > 10000
    && buyer.vatRegistered === "yes";

  // ── Completeness validation ─────────────────────────────────────────────────
  const checks = useMemo(() => {
    const c = [];
    const ok = (label) => c.push({ label, status: "ok" });
    const warn = (label, hint) => c.push({ label, status: "warning", hint });
    const miss = (label, hint) => c.push({ label, status: "missing", hint });

    // Invoice heading (always present in our output)
    ok('عنوان "فاتورة ضريبية / Tax Invoice"');

    // Seller
    seller.name.trim()    ? ok("اسم المورد")    : miss("اسم المورد",    "مطلوب في كلا النوعين");
    seller.address.trim() ? ok("عنوان المورد")  : miss("عنوان المورد", "مطلوب في كلا النوعين");
    isValidTrn(seller.trn)
      ? ok("الرقم الضريبي للمورد (15 خانة)")
      : seller.trn.trim()
        ? warn("الرقم الضريبي للمورد", "يجب أن يكون 15 رقماً")
        : miss("الرقم الضريبي للمورد", "مطلوب في كلا النوعين");

    // Invoice details
    details.invoiceNumber.trim() ? ok("رقم الفاتورة التسلسلي") : miss("رقم الفاتورة", "مطلوب");
    details.issueDate            ? ok("تاريخ الإصدار")           : miss("تاريخ الإصدار", "مطلوب");

    if (details.supplyDate && details.supplyDate !== details.issueDate) {
      ok("تاريخ التوريد (مختلف عن الإصدار)");
    } else if (!details.supplyDate) {
      warn("تاريخ التوريد", "أضفه إذا كان مختلفاً عن تاريخ الإصدار");
    }

    // Buyer — full invoice
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

    // Line items
    const badLines = lines.filter(l => !l.name.trim() || !parseFloat(l.unitPrice));
    badLines.length === 0
      ? ok("بنود الفاتورة (وصف + سعر)")
      : miss("بنود الفاتورة", `${badLines.length} بند ناقص الوصف أو السعر`);

    return c;
  }, [seller, buyer, details, lines, invoiceType]);

  const { okCount, warnCount, missCount, completePct, barColor } = calcCompleteness(checks);

  // ── Print ───────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    setActiveTab("preview");
    setTimeout(() => window.print(), 300);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">

      {/* ── Header card ── */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card no-print">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🧾</span>
              <h2 className="text-xl font-extrabold text-ink">مولد الفاتورة الضريبية في الإمارات</h2>
            </div>
            <p className="text-xs text-ink-secondary">
              أنشئ نموذج فاتورة ضريبية VAT قابل للطباعة — فاتورة كاملة أو مبسطة وفق متطلبات هيئة الضرائب الاتحادية FTA
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => applyPreset("full")}
              className="rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-3 py-1.5 hover:bg-indigo-100 transition-all">
              مثال كامل
            </button>
            <button onClick={() => applyPreset("simplified")}
              className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 hover:bg-emerald-100 transition-all">
              مثال مبسط
            </button>
            <button onClick={() => applyPreset("mixed")}
              className="rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 hover:bg-amber-100 transition-all">
              مثال مختلط
            </button>
            <button onClick={resetForm}
              className="rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 hover:bg-slate-100 transition-all">
              مسح
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mt-4 flex gap-1 rounded-xl bg-slate-100 p-1">
          {[
            { id: "form",    label: "📝 إدخال البيانات" },
            { id: "preview", label: "👁 معاينة الفاتورة" },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 rounded-lg text-xs font-bold py-2 transition-all ${activeTab === t.id ? "bg-white shadow text-indigo-700" : "text-ink-secondary hover:text-ink"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════ FORM TAB ══════════════════════ */}
      {activeTab === "form" && (
        <div className="space-y-4 no-print">

          {/* Step 1 — Invoice type */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">١</span>
              نوع الفاتورة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "full",       label: "فاتورة ضريبية كاملة",   desc: "B2B أو مبالغ تتجاوز 10,000 درهم",  icon: "📄" },
                { id: "simplified", label: "فاتورة ضريبية مبسطة",   desc: "للمستهلكين أو مبالغ ≤ 10,000 درهم", icon: "🧾" },
              ].map(opt => (
                <button key={opt.id} onClick={() => setInvoiceType(opt.id)}
                  className={`rounded-xl border-2 p-4 text-right transition-all ${invoiceType === opt.id ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-white hover:border-indigo-200"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{opt.icon}</span>
                    <span className="text-sm font-extrabold text-ink">{opt.label}</span>
                  </div>
                  <p className="text-xs text-ink-secondary">{opt.desc}</p>
                  {invoiceType === opt.id && (
                    <span className="mt-2 inline-block text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">✓ محدد</span>
                  )}
                </button>
              ))}
            </div>

            {/* Simplified guidance */}
            <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3">
              <p className="text-xs text-blue-900 leading-relaxed">
                <span className="font-bold">متى تُستخدم الفاتورة المبسطة؟ </span>
                يمكن استخدامها عندما يكون المستلم غير مسجل في ضريبة القيمة المضافة، أو عندما لا تتجاوز قيمة المعاملة 10,000 درهم لمستلم مسجل.
                <span className="font-bold"> تحقق من انطباق شروط الفاتورة المبسطة على حالتك.</span>
              </p>
            </div>

            {simplifiedWarning && (
              <div className="mt-2 rounded-xl border border-rose-300 bg-rose-50 p-3 flex items-start gap-2">
                <span className="text-lg shrink-0">⚠️</span>
                <p className="text-xs text-rose-900 font-bold leading-relaxed">
                  إجمالي الفاتورة يتجاوز 10,000 درهم والعميل مسجل ضريبياً — يجب إصدار فاتورة ضريبية كاملة وليس مبسطة.
                </p>
              </div>
            )}
          </div>

          {/* Step 2 — Seller */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">٢</span>
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
                  <span className="mr-1 text-[10px] text-amber-700 font-normal">(تحقق شكلي — 15 رقماً)</span>
                </label>
                <input className={`${inputCls} ${seller.trn && !isValidTrn(seller.trn) ? "border-rose-400 ring-1 ring-rose-200" : seller.trn && isValidTrn(seller.trn) ? "border-emerald-400" : ""}`}
                  placeholder="100xxxxxxxxxxxxxxx" dir="ltr" maxLength={15}
                  value={seller.trn}
                  onChange={e => setSeller(s => ({ ...s, trn: e.target.value.replace(/\D/g,"") }))} />
                {seller.trn && !isValidTrn(seller.trn) && (
                  <p className="text-[11px] text-rose-600 mt-1">يجب أن يكون الرقم الضريبي 15 رقماً بالضبط</p>
                )}
                {seller.trn && isValidTrn(seller.trn) && (
                  <p className="text-[11px] text-emerald-600 mt-1">✓ صالح شكلياً — التحقق الرسمي عبر بوابة EmaraTax</p>
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
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">٣</span>
              بيانات العميل (المستلم)
              {invoiceType === "simplified" && (
                <span className="text-[10px] font-normal text-ink-muted mr-1">(اختيارية جزئياً في المبسطة)</span>
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
                    {invoiceType === "full" && buyer.vatRegistered === "yes" && <span className="text-rose-600 mr-1">*</span>}
                    <span className="text-[10px] text-amber-700 font-normal mr-1">(15 رقماً)</span>
                  </label>
                  <input className={`${inputCls} ${buyer.trn && !isValidTrn(buyer.trn) ? "border-rose-400" : buyer.trn && isValidTrn(buyer.trn) ? "border-emerald-400" : ""}`}
                    placeholder="100xxxxxxxxxxxxxxx" dir="ltr" maxLength={15}
                    value={buyer.trn}
                    onChange={e => setBuyer(b => ({ ...b, trn: e.target.value.replace(/\D/g,"") }))} />
                </div>
              )}
            </div>
          </div>

          {/* Step 4 — Invoice details */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">٤</span>
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
                  <span className="text-[10px] text-ink-muted font-normal mr-1">(إذا اختلف عن تاريخ الإصدار)</span>
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
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                <p className="text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold">⚠️ تنبيه: </span>
                  عند استخدام عملة أجنبية، يجب الإشارة إلى سعر الصرف المستخدم في الفاتورة ويجب التعبير عن مبلغ الضريبة بالدرهم الإماراتي أيضاً وفق متطلبات هيئة الضرائب FTA.
                </p>
              </div>
            )}
          </div>

          {/* Step 5 — Line items */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">٥</span>
              بنود الفاتورة
            </h2>

            <div className="space-y-3">
              {lines.map((line, idx) => {
                const calc = lineCalcs[idx];
                const rateObj = VAT_RATES.find(r => r.id === line.vatRateId) || VAT_RATES[0];
                return (
                  <div key={line.id} className="rounded-xl border border-gray-200 bg-slate-50/50 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-ink-secondary">بند {idx + 1}</span>
                      {lines.length > 1 && (
                        <button onClick={() => removeLine(line.id)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold transition-colors">
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
                          <p className="text-[11px] text-rose-600 mt-0.5">الخصم يتجاوز قيمة البند</p>
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
                        <span className="rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5">
                          إجمالي: {fmt(calc?.gross)} {details.currency}
                        </span>
                        {(calc?.discount || 0) > 0 && (
                          <span className="rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 px-2.5 py-0.5">
                            بعد الخصم: {fmt(calc?.taxableBase)} {details.currency}
                          </span>
                        )}
                        <span className={`rounded-full text-[11px] font-bold px-2.5 py-0.5 ${rateObj.color}`}>
                          ضريبة: {fmt(calc?.vatAmount)} {details.currency}
                        </span>
                        <span className="rounded-full text-[11px] font-black bg-indigo-100 text-indigo-800 px-2.5 py-0.5">
                          المجموع: {fmt(calc?.lineTotal)} {details.currency}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={addLine}
              className="mt-3 w-full rounded-xl border-2 border-dashed border-indigo-200 text-indigo-600 font-bold text-xs py-3 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
              + إضافة بند جديد
            </button>
          </div>

          {/* Totals card */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className="text-base">🧮</span> ملخص الإجماليات
            </h2>
            <div className="space-y-2 text-sm">
              {[
                { label: "المجموع قبل الخصم",          val: totals.grossTotal,    color: "text-ink" },
                totals.totalDiscount > 0 && { label: "إجمالي الخصومات",  val: -totals.totalDiscount, color: "text-rose-700" },
                totals.taxable5 > 0 && { label: "القيمة الخاضعة لـ 5%", val: totals.taxable5, color: "text-blue-700" },
                totals.taxable0 > 0 && { label: "القيمة الخاضعة لـ 0%", val: totals.taxable0, color: "text-emerald-700" },
                totals.exemptTotal > 0 && { label: "القيمة المعفاة", val: totals.exemptTotal, color: "text-amber-700" },
                totals.outTotal > 0 && { label: "خارج النطاق الضريبي",  val: totals.outTotal, color: "text-slate-600" },
                { label: "إجمالي ضريبة القيمة المضافة (5%)", val: totals.totalVat, color: "text-blue-800", bold: true },
              ].filter(Boolean).map((row, i) => (
                <div key={i} className={`flex justify-between items-center py-1 ${row.bold ? "border-t border-indigo-200 pt-2" : ""}`}>
                  <span className={`text-xs ${row.bold ? "font-extrabold" : "font-medium"} text-ink-secondary`}>{row.label}</span>
                  <span className={`text-sm font-black ${row.color}`} dir="ltr">
                    {row.val < 0 ? "-" : ""}{fmt(Math.abs(row.val))} {details.currency}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center border-t-2 border-indigo-300 pt-3 mt-2">
                <span className="text-base font-extrabold text-ink">الإجمالي النهائي شامل الضريبة</span>
                <span className="text-xl font-black text-indigo-700" dir="ltr">
                  {fmt(totals.grandTotal)} {details.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Completeness checker */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => { setShowValidation(true); setValidationOpen(v => !v); }}>
              <div className="flex items-center gap-2">
                <span className="text-base">🔍</span>
                <div>
                  <h2 className="text-sm font-extrabold text-ink">فحص مبدئي لاكتمال الحقول المطلوبة</h2>
                  <p className="text-[11px] text-ink-muted">ليس فحصاً رسمياً من هيئة الضرائب — تحقق شكلي فقط</p>
                </div>
              </div>
              <span className="text-ink-secondary text-xs">{validationOpen ? "▲" : "▼"}</span>
            </div>

            {/* Progress bar — always visible */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[11px] text-ink-secondary">
                <span>اكتمال الحقول</span>
                <span className="font-bold">{completePct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className={`h-2 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${completePct}%` }} />
              </div>
              <div className="flex gap-3 text-[11px] font-bold pt-1">
                <span className="text-emerald-600">✅ {okCount} مكتمل</span>
                {warnCount > 0 && <span className="text-amber-600">⚠️ {warnCount} يحتاج مراجعة</span>}
                {missCount > 0 && <span className="text-rose-600">❌ {missCount} مفقود</span>}
              </div>
            </div>

            {/* Expandable details */}
            {(showValidation && validationOpen) && (
              <div className="mt-3 space-y-1.5">
                {checks.map((c, i) => (
                  <CheckItem key={i} status={c.status} label={c.label} hint={c.hint} />
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 no-print">
            <button onClick={() => setActiveTab("preview")}
              className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-3 transition-all">
              👁 معاينة الفاتورة
            </button>
            <button onClick={handlePrint}
              className="flex-1 rounded-xl border border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-extrabold text-sm py-3 transition-all">
              🖨 طباعة الفاتورة
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
              className="rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs px-4 py-2 transition-all">
              ← العودة للتعديل
            </button>
            <button onClick={handlePrint}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 transition-all">
              🖨 طباعة
            </button>
          </div>

          {/* A4 Invoice Document */}
          <div id="invoice-print" className="rounded-2xl border border-slate-300 bg-white shadow-xl print:shadow-none print:border-0 print:rounded-none print:m-0 overflow-hidden">

            {/* Invoice header band */}
            <div className="bg-indigo-700 px-8 py-5 print:bg-indigo-700" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-xl font-black">فاتورة ضريبية</p>
                  <p className="text-indigo-200 text-sm font-semibold">Tax Invoice</p>
                  {invoiceType === "simplified" && (
                    <span className="mt-1 inline-block rounded-full bg-white/20 text-white text-[10px] font-bold px-2 py-0.5">مبسطة · Simplified</span>
                  )}
                </div>
                <div className="text-left" dir="ltr">
                  <p className="text-white font-black text-lg">{details.invoiceNumber || "—"}</p>
                  <p className="text-indigo-200 text-xs">{details.issueDate || ""}</p>
                  <p className="text-indigo-300 text-[11px] mt-0.5">{details.currency}</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6" dir="rtl">

              {/* Seller + Buyer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Seller */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wide mb-2">المورد · Supplier</p>
                  <p className="font-extrabold text-ink text-sm">{seller.name || "—"}</p>
                  {seller.address && <p className="text-xs text-ink-secondary mt-0.5">{seller.address}</p>}
                  {seller.emirate && <p className="text-xs text-ink-secondary">{seller.emirate}، الإمارات العربية المتحدة</p>}
                  {seller.trn && (
                    <div className="mt-2">
                      <p className="text-[10px] font-bold text-ink-muted">الرقم الضريبي TRN</p>
                      <p className="font-black text-xs text-ink" dir="ltr">{seller.trn}</p>
                    </div>
                  )}
                  {seller.cr && <p className="text-[10px] text-ink-muted mt-1">السجل التجاري: {seller.cr}</p>}
                  {seller.email && <p className="text-[10px] text-ink-muted">{seller.email}</p>}
                  {seller.phone && <p className="text-[10px] text-ink-muted" dir="ltr">{seller.phone}</p>}
                </div>

                {/* Buyer */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-wide mb-2">العميل · Customer</p>
                  {buyer.name ? (
                    <>
                      <p className="font-extrabold text-ink text-sm">{buyer.name}</p>
                      {buyer.address && <p className="text-xs text-ink-secondary mt-0.5">{buyer.address}</p>}
                      {buyer.emirate && <p className="text-xs text-ink-secondary">{buyer.emirate}، الإمارات</p>}
                      {buyer.trn && (
                        <div className="mt-2">
                          <p className="text-[10px] font-bold text-ink-muted">الرقم الضريبي TRN</p>
                          <p className="font-black text-xs text-ink" dir="ltr">{buyer.trn}</p>
                        </div>
                      )}
                      {buyer.vatRegistered === "no" && (
                        <p className="mt-1 text-[10px] text-slate-500">غير مسجل في ضريبة القيمة المضافة</p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-ink-muted">عميل أفراد / مستهلك نهائي</p>
                  )}
                </div>
              </div>

              {/* Supply date row */}
              {details.supplyDate && details.supplyDate !== details.issueDate && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 flex items-center gap-3">
                  <span className="text-amber-600 text-sm">📅</span>
                  <div className="text-xs text-amber-900">
                    <span className="font-bold">تاريخ التوريد: </span>
                    <span dir="ltr">{details.supplyDate}</span>
                    <span className="mr-2 text-amber-700">(يختلف عن تاريخ الإصدار {details.issueDate})</span>
                  </div>
                </div>
              )}

              {/* Line items table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-ink-secondary">
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
                  <tbody className="divide-y divide-slate-100">
                    {lines.map((line, idx) => {
                      const calc = lineCalcs[idx];
                      const rateObj = VAT_RATES.find(r => r.id === line.vatRateId) || VAT_RATES[0];
                      return (
                        <tr key={line.id} className="hover:bg-slate-50/50">
                          <td className="p-2 text-ink-muted">{idx + 1}</td>
                          <td className="p-2 font-medium text-ink">{line.name || "—"}</td>
                          <td className="p-2 text-ink-secondary" dir="ltr">{line.qty || 0}</td>
                          <td className="p-2 text-ink-secondary" dir="ltr">{fmt(parseFloat(line.unitPrice) || 0)}</td>
                          <td className="p-2 text-rose-700" dir="ltr">{parseFloat(line.discount) > 0 ? `(${fmt(parseFloat(line.discount))})` : "—"}</td>
                          <td className="p-2">
                            <span className={`rounded-full text-[10px] font-bold px-1.5 py-0.5 ${rateObj.color}`}>{rateObj.tag}</span>
                          </td>
                          <td className="p-2 text-blue-700 font-medium" dir="ltr">{fmt(calc?.vatAmount)}</td>
                          <td className="p-2 font-black text-ink" dir="ltr">{fmt(calc?.lineTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full sm:w-72 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                  {[
                    { label: "المجموع قبل الخصم", val: totals.grossTotal, sub: true },
                    totals.totalDiscount > 0 && { label: "إجمالي الخصومات", val: -totals.totalDiscount, sub: true, neg: true },
                    totals.taxable5 > 0 && { label: "خاضع 5%", val: totals.taxable5, sub: true },
                    totals.taxable0 > 0 && { label: "صفري المعدل 0%", val: totals.taxable0, sub: true },
                    totals.exemptTotal > 0 && { label: "معفاة", val: totals.exemptTotal, sub: true },
                    totals.outTotal > 0 && { label: "خارج النطاق", val: totals.outTotal, sub: true },
                    { label: "إجمالي الضريبة (5%)", val: totals.totalVat, sub: true, bold: true },
                  ].filter(Boolean).map((row, i) => (
                    <div key={i} className={`flex justify-between px-4 py-2 text-xs ${row.bold ? "bg-blue-50 border-t border-blue-200" : "border-t border-slate-100 first:border-t-0"}`}>
                      <span className={row.bold ? "font-extrabold text-blue-800" : "text-ink-secondary"}>{row.label}</span>
                      <span className={`font-black ${row.neg ? "text-rose-700" : row.bold ? "text-blue-800" : "text-ink"}`} dir="ltr">
                        {row.neg ? "-" : ""}{fmt(Math.abs(row.val))} {details.currency}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between px-4 py-3 bg-indigo-700 text-white">
                    <span className="text-sm font-extrabold">الإجمالي النهائي</span>
                    <span className="text-sm font-black" dir="ltr">{fmt(totals.grandTotal)} {details.currency}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {details.notes && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold text-ink-muted mb-1">ملاحظات</p>
                  <p className="text-xs text-ink-secondary leading-relaxed">{details.notes}</p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-1.5">
                <p className="text-[10px] font-extrabold text-amber-900">⚠️ إشعار مهم</p>
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  هذه الأداة تنشئ نموذج فاتورة ضريبية قابل للطباعة، ولا تُنشئ فاتورة إلكترونية ضمن نظام الفوترة الإلكترونية الإماراتي.
                  ملف PDF أو مستند مطبوع لا يُعدّ فاتورة إلكترونية بموجب متطلبات المنظومة الإماراتية للفوترة الإلكترونية.
                  تحقق من متطلبات الفاتورة الضريبية مع مستشارك الضريبي أو عبر بوابة EmaraTax.
                </p>
                <p className="text-[10px] text-amber-700 font-bold">
                  المصدر: الهيئة الاتحادية للضرائب — دولة الإمارات العربية المتحدة
                </p>
              </div>

            </div>
          </div>
        </>
      )}

      {/* ── e-Invoicing notice (always visible) ── */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 shadow-card no-print">
        <h3 className="text-sm font-extrabold text-rose-900 mb-2 flex items-center gap-2">
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
          <a href="https://tax.gov.ae/en/e-invoicing" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-rose-700 hover:text-rose-900 underline">
            اقرأ أكثر عن نظام الفوترة الإلكترونية الإماراتي ←
          </a>
        </div>
      </div>

    </div>
  );
}
