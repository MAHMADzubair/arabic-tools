"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  formatAED as fmt,
  parseNum,
  calcLineVat,
  discountExceedsGross,
  isValidUaeTrn,
  inputCls,
  selectCls,
  labelCls,
  stepBadgeCls,
} from "@/lib/businessUtils";
import { EMIRATES } from "@/lib/countryBusinessConfig";

// ─── Constants ─────────────────────────────────────────────────────────────────

const DRAFT_KEY = "uae_quotation_draft_v1";

const VAT_RATES = [
  { id: "5",      label: "5% — خاضعة للضريبة",   rate: 0.05, tag: "5%",    color: "bg-blue-100 text-blue-800" },
  { id: "0",      label: "0% — صفرية المعدل",      rate: 0,    tag: "0%",    color: "bg-emerald-100 text-emerald-800" },
  { id: "exempt", label: "معفاة",                  rate: null, tag: "معفاة", color: "bg-amber-100 text-amber-800" },
  { id: "out",    label: "خارج النطاق",             rate: null, tag: "خ.ن",  color: "bg-slate-100 text-slate-700" },
  { id: "none",   label: "بدون ضريبة",              rate: null, tag: "—",    color: "bg-gray-100 text-gray-500" },
];

const UNITS = ["وحدة", "ساعة", "يوم", "شهر", "متر", "كغ", "طن", "قطعة", "متر مربع", "نسخة"];

const QUICK_TEMPLATES = [
  {
    id: "design",
    label: "🎨 خدمات تصميم",
    lines: [
      { name: "تصميم هوية بصرية (شعار + ألوان + خطوط)", qty: "1", unit: "مشروع", unitPrice: "3000", discount: "0", vatRateId: "5" },
      { name: "تصميم مواد تسويقية (بروشور + بوستر)", qty: "1", unit: "مجموعة", unitPrice: "1500", discount: "0", vatRateId: "5" },
    ],
  },
  {
    id: "web",
    label: "💻 تطوير موقع",
    lines: [
      { name: "تصميم واجهة الموقع (UI/UX)", qty: "1", unit: "مشروع", unitPrice: "4000", discount: "0", vatRateId: "5" },
      { name: "تطوير وبرمجة الموقع", qty: "1", unit: "مشروع", unitPrice: "6000", discount: "500", vatRateId: "5" },
      { name: "استضافة سنوية + دومين", qty: "1", unit: "سنة", unitPrice: "800", discount: "0", vatRateId: "5" },
    ],
  },
  {
    id: "consulting",
    label: "📊 استشارات",
    lines: [
      { name: "جلسة استشارية أولى", qty: "2", unit: "ساعة", unitPrice: "500", discount: "0", vatRateId: "5" },
      { name: "إعداد تقرير تحليلي تفصيلي", qty: "1", unit: "تقرير", unitPrice: "2500", discount: "0", vatRateId: "5" },
    ],
  },
  {
    id: "construction",
    label: "🔨 مقاولات",
    lines: [
      { name: "أعمال ترميم وصيانة", qty: "50", unit: "متر مربع", unitPrice: "200", discount: "0", vatRateId: "5" },
      { name: "مواد بناء وتشطيبات", qty: "1", unit: "مجموعة", unitPrice: "8000", discount: "500", vatRateId: "5" },
    ],
  },
  {
    id: "supply",
    label: "📦 توريد منتجات",
    lines: [
      { name: "توريد معدات مكتبية", qty: "10", unit: "قطعة", unitPrice: "350", discount: "0", vatRateId: "5" },
      { name: "توريد أجهزة حاسوب محمول", qty: "5", unit: "جهاز", unitPrice: "3200", discount: "200", vatRateId: "5" },
    ],
  },
  {
    id: "marketing",
    label: "📣 خدمات تسويق",
    lines: [
      { name: "إدارة حسابات التواصل الاجتماعي (شهري)", qty: "3", unit: "شهر", unitPrice: "2000", discount: "0", vatRateId: "5" },
      { name: "إعداد وتنفيذ حملة إعلانية", qty: "1", unit: "حملة", unitPrice: "4500", discount: "0", vatRateId: "5" },
    ],
  },
];

const STATUS_OPTIONS = [
  { id: "",         label: "بدون حالة", style: "" },
  { id: "draft",    label: "مسودة",     style: "bg-slate-100 text-slate-700 border-slate-300" },
  { id: "sent",     label: "مرسل",      style: "bg-blue-100 text-blue-800 border-blue-300" },
  { id: "accepted", label: "مقبول",     style: "bg-emerald-100 text-emerald-800 border-emerald-300" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

let _lineId = 100;
const newLineId = () => ++_lineId;

const emptyLine = () => ({
  id: newLineId(),
  name: "", qty: "1", unit: "وحدة", unitPrice: "", discount: "0", vatRateId: "5",
});

function generateQuoteNumber() {
  const y = new Date().getFullYear();
  const n = String(Math.floor(Math.random() * 9000) + 1000);
  return `QT-${y}-${n}`;
}

const today = () => new Date().toISOString().split("T")[0];
const plus15 = () => {
  const d = new Date(); d.setDate(d.getDate() + 15);
  return d.toISOString().split("T")[0];
};

// ─── Default state factories ────────────────────────────────────────────────────

const defaultSeller = () => ({
  name: "", contactPerson: "", address: "", emirate: "دبي",
  phone: "", email: "", website: "", trn: "",
});

const defaultCustomer = () => ({
  name: "", contactPerson: "", address: "", emirate: "",
  phone: "", email: "", trn: "",
});

const defaultDetails = () => ({
  quoteNumber: generateQuoteNumber(),
  issueDate: today(),
  validUntil: plus15(),
  currency: "AED",
  projectRef: "",
  status: "",
  showVat: true,
});

const defaultTerms = () => ({
  validity: "صالح لمدة 15 يوماً من تاريخ الإصدار",
  payment: "50% دفعة مقدمة، 50% عند الاستلام",
  delivery: "",
  warranty: "",
  exclusions: "",
  cancellation: "",
  notes: "",
});

const defaultFees = () => ({
  shipping: { label: "رسوم شحن وتوصيل", amount: "" },
  service:  { label: "رسوم خدمة",        amount: "" },
  custom:   { label: "",                  amount: "" },
});

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function UaeQuotationGenerator() {
  const [seller,   setSeller]   = useState(defaultSeller);
  const [customer, setCustomer] = useState(defaultCustomer);
  const [details,  setDetails]  = useState(defaultDetails);
  const [lines,    setLines]    = useState([emptyLine()]);
  const [fees,     setFees]     = useState(defaultFees);
  const [terms,    setTerms]    = useState(defaultTerms);
  const [activeTab, setActiveTab] = useState("form");
  const [draftMsg,  setDraftMsg]  = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  // ── Draft save / restore ──────────────────────────────────────────────────────
  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ seller, customer, details, lines, fees, terms }));
      setDraftMsg("✅ تم حفظ المسودة على هذا الجهاز");
      setTimeout(() => setDraftMsg(""), 3000);
    } catch { setDraftMsg("⚠️ تعذّر الحفظ"); }
  }, [seller, customer, details, lines, fees, terms]);

  const restoreDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) { setDraftMsg("لا توجد مسودة محفوظة"); setTimeout(() => setDraftMsg(""), 3000); return; }
      const d = JSON.parse(raw);
      if (d.seller)   setSeller(d.seller);
      if (d.customer) setCustomer(d.customer);
      if (d.details)  setDetails(d.details);
      if (d.lines)    setLines(d.lines);
      if (d.fees)     setFees(d.fees);
      if (d.terms)    setTerms(d.terms);
      setDraftMsg("✅ تمت استعادة المسودة");
      setTimeout(() => setDraftMsg(""), 3000);
    } catch { setDraftMsg("⚠️ تعذّر الاستعادة"); }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setDraftMsg("🗑 تم مسح المسودة");
    setTimeout(() => setDraftMsg(""), 3000);
  }, []);

  // ── Line helpers ──────────────────────────────────────────────────────────────
  const updateLine = (id, field, value) =>
    setLines(ls => ls.map(l => l.id === id ? { ...l, [field]: value } : l));

  const addLine = () => setLines(ls => [...ls, emptyLine()]);

  const removeLine = (id) =>
    setLines(ls => ls.length > 1 ? ls.filter(l => l.id !== id) : ls);

  const duplicateLine = (id) => {
    const src = lines.find(l => l.id === id);
    if (!src) return;
    const dup = { ...src, id: newLineId() };
    setLines(ls => {
      const idx = ls.findIndex(l => l.id === id);
      const next = [...ls];
      next.splice(idx + 1, 0, dup);
      return next;
    });
  };

  // ── Template apply ────────────────────────────────────────────────────────────
  const applyTemplate = (tpl) => {
    setLines(tpl.lines.map(l => ({ ...l, id: newLineId() })));
    setShowTemplates(false);
  };

  // ── Reset ─────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSeller(defaultSeller());
    setCustomer(defaultCustomer());
    setDetails(defaultDetails());
    setLines([emptyLine()]);
    setFees(defaultFees());
    setTerms(defaultTerms());
    setActiveTab("form");
  };

  // ── Print ─────────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    setActiveTab("preview");
    setTimeout(() => window.print(), 300);
  };

  // ── Calculations ──────────────────────────────────────────────────────────────
  const { lineCalcs, totals } = useMemo(() => {
    const lineCalcs = lines.map(l => {
      const rateObj = VAT_RATES.find(r => r.id === l.vatRateId) || VAT_RATES[0];
      const effectiveRate = details.showVat ? rateObj.rate : null;
      const result = calcLineVat({ qty: l.qty, unitPrice: l.unitPrice, discount: l.discount, vatRate: effectiveRate });
      return { ...result, rateObj };
    });

    const feeShipping = parseNum(fees.shipping.amount);
    const feeService  = parseNum(fees.service.amount);
    const feeCustom   = parseNum(fees.custom.amount);
    const totalFees   = feeShipping + feeService + feeCustom;

    const grossTotal    = lineCalcs.reduce((s, l) => s + l.gross, 0);
    const totalDiscount = lineCalcs.reduce((s, l) => s + l.discount, 0);
    const taxable5      = lineCalcs.filter(l => l.rateObj.id === "5").reduce((s, l) => s + l.taxableBase, 0);
    const taxable0      = lineCalcs.filter(l => l.rateObj.id === "0").reduce((s, l) => s + l.taxableBase, 0);
    const exemptTotal   = lineCalcs.filter(l => l.rateObj.id === "exempt").reduce((s, l) => s + l.taxableBase, 0);
    const outTotal      = lineCalcs.filter(l => l.rateObj.id === "out").reduce((s, l) => s + l.taxableBase, 0);
    const totalVat      = lineCalcs.reduce((s, l) => s + l.vatAmount, 0);
    const grandTotal    = lineCalcs.reduce((s, l) => s + l.lineTotal, 0) + totalFees;

    return { lineCalcs, totals: { grossTotal, totalDiscount, taxable5, taxable0, exemptTotal, outTotal, totalVat, totalFees, grandTotal } };
  }, [lines, fees, details.showVat]);

  // ── Convert to Invoice URL (localStorage-based handoff) ───────────────────────
  const handleConvertToInvoice = () => {
    try {
      const payload = {
        seller: { name: seller.name, address: seller.address, emirate: seller.emirate, trn: seller.trn, email: seller.email, phone: seller.phone, cr: "" },
        buyer:  { name: customer.name, address: customer.address, emirate: customer.emirate, trn: customer.trn, vatRegistered: customer.trn ? "yes" : "no" },
        details: { invoiceNumber: details.quoteNumber.replace("QT-", "INV-"), issueDate: details.issueDate, supplyDate: "", currency: details.currency, notes: terms.notes },
        lines: lines.map(l => ({ id: l.id, name: l.name, qty: l.qty, unitPrice: l.unitPrice, discount: l.discount, vatRateId: l.vatRateId })),
      };
      localStorage.setItem("uae_invoice_prefill_v1", JSON.stringify(payload));
    } catch { /* silent — link still works */ }
    window.open("/ar/ae/vat-invoice-generator", "_blank");
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">

      {/* ── Header ── */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card no-print">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📋</span>
              <h1 className="text-xl font-extrabold text-ink">مولد عرض السعر في الإمارات</h1>
            </div>
            <p className="text-xs text-ink-secondary">
              أنشئ عرض سعر احترافي بالعربية والإنجليزية — للمستقلين والشركات والمتاجر والمقاولين
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowTemplates(v => !v)}
              className="rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 hover:bg-amber-100 transition-all">
              ⚡ قوالب سريعة
            </button>
            <button onClick={handleReset}
              className="rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 hover:bg-slate-100 transition-all">
              مسح
            </button>
          </div>
        </div>

        {/* Quick templates dropdown */}
        {showTemplates && (
          <div className="mt-3 p-3 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
            <p className="text-xs font-bold text-amber-900 mb-2">اختر قالباً لتعبئة بنود توضيحية (مثال فقط — راجع قبل الإرسال)</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_TEMPLATES.map(t => (
                <button key={t.id} onClick={() => applyTemplate(t)}
                  className="rounded-lg bg-white border border-amber-200 text-amber-800 text-xs font-bold px-3 py-1.5 hover:bg-amber-100 transition-all">
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Draft controls */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={saveDraft}
            className="rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-3 py-1.5 hover:bg-indigo-100 transition-all">
            💾 حفظ المسودة
          </button>
          <button onClick={restoreDraft}
            className="rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 hover:bg-slate-100 transition-all">
            ↩️ استعادة آخر مسودة
          </button>
          <button onClick={clearDraft}
            className="rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold px-3 py-1.5 hover:bg-rose-100 transition-all">
            🗑 مسح المسودة
          </button>
          {draftMsg && <span className="text-xs font-bold text-ink-secondary">{draftMsg}</span>}
          <span className="text-[10px] text-ink-muted mr-auto">محفوظ على هذا الجهاز فقط</span>
        </div>

        {/* Tab bar */}
        <div className="mt-4 flex gap-1 rounded-xl bg-slate-100 p-1">
          {[
            { id: "form",    label: "📝 إدخال البيانات" },
            { id: "preview", label: "👁 معاينة عرض السعر" },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 rounded-lg text-xs font-bold py-2 transition-all ${activeTab === t.id ? "bg-white shadow text-indigo-700" : "text-ink-secondary hover:text-ink"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════ FORM TAB ══════════════ */}
      {activeTab === "form" && (
        <div className="space-y-4 no-print">

          {/* Step 1 — Quote details */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className={stepBadgeCls}>١</span>
              بيانات عرض السعر
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>رقم عرض السعر *</label>
                <input className={inputCls} placeholder="QT-2026-0001" dir="ltr" value={details.quoteNumber}
                  onChange={e => setDetails(d => ({ ...d, quoteNumber: e.target.value }))} />
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
                <label className={labelCls}>صالح حتى تاريخ</label>
                <input className={inputCls} type="date" dir="ltr" value={details.validUntil}
                  onChange={e => setDetails(d => ({ ...d, validUntil: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>رقم المشروع / المرجع (اختياري)</label>
                <input className={inputCls} placeholder="PRJ-001" dir="ltr" value={details.projectRef}
                  onChange={e => setDetails(d => ({ ...d, projectRef: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>حالة عرض السعر (اختياري)</label>
                <select className={selectCls} value={details.status}
                  onChange={e => setDetails(d => ({ ...d, status: e.target.value }))}>
                  {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>
            {/* VAT toggle */}
            <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/60 p-3 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs font-bold text-blue-900">هل تريد إظهار ضريبة القيمة المضافة (VAT)؟</p>
                <p className="text-[10px] text-blue-700 mt-0.5">إضافة VAT لعرض السعر لا يجعله فاتورة ضريبية</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDetails(d => ({ ...d, showVat: true }))}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold border transition-all ${details.showVat ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"}`}>
                  نعم
                </button>
                <button onClick={() => setDetails(d => ({ ...d, showVat: false }))}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold border transition-all ${!details.showVat ? "bg-slate-600 text-white border-slate-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                  لا
                </button>
              </div>
            </div>
          </div>

          {/* Step 2 — Seller */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className={stepBadgeCls}>٢</span>
              بيانات منشأتك (المُعِد)
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>اسم المنشأة / المستقل *</label>
                <input className={inputCls} placeholder="شركة النخيل للتصميم" value={seller.name}
                  onChange={e => setSeller(s => ({ ...s, name: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>اسم جهة الاتصال (اختياري)</label>
                <input className={inputCls} placeholder="أحمد المنصوري" value={seller.contactPerson}
                  onChange={e => setSeller(s => ({ ...s, contactPerson: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>الإمارة *</label>
                <select className={selectCls} value={seller.emirate}
                  onChange={e => setSeller(s => ({ ...s, emirate: e.target.value }))}>
                  {EMIRATES.map(em => <option key={em}>{em}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>العنوان</label>
                <input className={inputCls} placeholder="شارع الشيخ زايد، برج المكتب 12" value={seller.address}
                  onChange={e => setSeller(s => ({ ...s, address: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>الهاتف</label>
                <input className={inputCls} type="tel" placeholder="+971 50 xxx xxxx" dir="ltr" value={seller.phone}
                  onChange={e => setSeller(s => ({ ...s, phone: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>البريد الإلكتروني</label>
                <input className={inputCls} type="email" placeholder="info@company.ae" dir="ltr" value={seller.email}
                  onChange={e => setSeller(s => ({ ...s, email: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>الموقع الإلكتروني (اختياري)</label>
                <input className={inputCls} type="url" placeholder="www.company.ae" dir="ltr" value={seller.website}
                  onChange={e => setSeller(s => ({ ...s, website: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>
                  الرقم الضريبي TRN (اختياري)
                  <span className="text-[10px] text-amber-700 font-normal mr-1">(تحقق شكلي فقط)</span>
                </label>
                <input className={`${inputCls} ${seller.trn && !isValidUaeTrn(seller.trn) ? "border-rose-400" : seller.trn && isValidUaeTrn(seller.trn) ? "border-emerald-400" : ""}`}
                  placeholder="100XXXXXXXXXXXX" dir="ltr" maxLength={15}
                  value={seller.trn}
                  onChange={e => setSeller(s => ({ ...s, trn: e.target.value.replace(/\D/g, "") }))} />
                {seller.trn && !isValidUaeTrn(seller.trn) && (
                  <p className="text-[11px] text-rose-600 mt-1">يجب أن يكون الرقم الضريبي 15 رقماً</p>
                )}
              </div>
            </div>
          </div>

          {/* Step 3 — Customer */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className={stepBadgeCls}>٣</span>
              بيانات العميل
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>اسم العميل / الشركة *</label>
                <input className={inputCls} placeholder="مؤسسة الأفق للتجارة" value={customer.name}
                  onChange={e => setCustomer(c => ({ ...c, name: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>اسم جهة الاتصال</label>
                <input className={inputCls} placeholder="محمد العامري" value={customer.contactPerson}
                  onChange={e => setCustomer(c => ({ ...c, contactPerson: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>الإمارة</label>
                <select className={selectCls} value={customer.emirate}
                  onChange={e => setCustomer(c => ({ ...c, emirate: e.target.value }))}>
                  <option value="">— اختر —</option>
                  {EMIRATES.map(em => <option key={em}>{em}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>العنوان</label>
                <input className={inputCls} placeholder="منطقة المصفح، مبنى 45" value={customer.address}
                  onChange={e => setCustomer(c => ({ ...c, address: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>الهاتف</label>
                <input className={inputCls} type="tel" placeholder="+971 4 xxx xxxx" dir="ltr" value={customer.phone}
                  onChange={e => setCustomer(c => ({ ...c, phone: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>البريد الإلكتروني</label>
                <input className={inputCls} type="email" placeholder="client@company.ae" dir="ltr" value={customer.email}
                  onChange={e => setCustomer(c => ({ ...c, email: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>الرقم الضريبي TRN (اختياري)</label>
                <input className={`${inputCls} ${customer.trn && !isValidUaeTrn(customer.trn) ? "border-rose-400" : customer.trn && isValidUaeTrn(customer.trn) ? "border-emerald-400" : ""}`}
                  placeholder="100XXXXXXXXXXXX" dir="ltr" maxLength={15}
                  value={customer.trn}
                  onChange={e => setCustomer(c => ({ ...c, trn: e.target.value.replace(/\D/g, "") }))} />
              </div>
            </div>
          </div>

          {/* Step 4 — Line items */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className={stepBadgeCls}>٤</span>
              البنود والخدمات
            </h2>

            <div className="space-y-3">
              {lines.map((line, idx) => {
                const calc = lineCalcs[idx];
                const rateObj = VAT_RATES.find(r => r.id === line.vatRateId) || VAT_RATES[0];
                const overDiscount = discountExceedsGross(line.qty, line.unitPrice, line.discount);
                return (
                  <div key={line.id} className="rounded-xl border border-gray-200 bg-slate-50/50 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-ink-secondary">بند {idx + 1}</span>
                      <div className="flex gap-2">
                        <button onClick={() => duplicateLine(line.id)}
                          className="text-indigo-500 hover:text-indigo-700 text-xs font-bold transition-colors">
                          ⧉ تكرار
                        </button>
                        {lines.length > 1 && (
                          <button onClick={() => removeLine(line.id)}
                            className="text-rose-500 hover:text-rose-700 text-xs font-bold transition-colors">
                            ✕ حذف
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label className={labelCls}>الوصف / اسم السلعة أو الخدمة *</label>
                        <input className={inputCls} placeholder="تصميم موقع إلكتروني" value={line.name}
                          onChange={e => updateLine(line.id, "name", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>الكمية</label>
                        <input className={inputCls} type="number" min="0" step="any" placeholder="1" dir="ltr" value={line.qty}
                          onChange={e => updateLine(line.id, "qty", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>الوحدة</label>
                        <select className={selectCls} value={line.unit}
                          onChange={e => updateLine(line.id, "unit", e.target.value)}>
                          {UNITS.map(u => <option key={u}>{u}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>سعر الوحدة ({details.currency})</label>
                        <input className={inputCls} type="number" min="0" step="any" placeholder="0.00" dir="ltr" value={line.unitPrice}
                          onChange={e => updateLine(line.id, "unitPrice", e.target.value)} />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className={labelCls}>الخصم ({details.currency})</label>
                        <input className={`${inputCls} ${overDiscount ? "border-rose-400" : ""}`}
                          type="number" min="0" step="any" placeholder="0" dir="ltr" value={line.discount}
                          onChange={e => updateLine(line.id, "discount", e.target.value)} />
                        {overDiscount && <p className="text-[11px] text-rose-600 mt-0.5">الخصم يتجاوز قيمة البند</p>}
                      </div>
                      {details.showVat && (
                        <div>
                          <label className={labelCls}>نسبة الضريبة</label>
                          <select className={selectCls} value={line.vatRateId}
                            onChange={e => updateLine(line.id, "vatRateId", e.target.value)}>
                            {VAT_RATES.map(r => <option key={r.id} value={r.id}>{r.tag} — {r.label}</option>)}
                          </select>
                        </div>
                      )}
                      {/* Line summary chips */}
                      {parseNum(line.unitPrice) > 0 && (
                        <div className="flex flex-wrap gap-1.5 items-end pb-0.5">
                          <span className="rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5">
                            {fmt(calc?.gross)} {details.currency}
                          </span>
                          {details.showVat && (
                            <span className={`rounded-full text-[11px] font-bold px-2.5 py-0.5 ${rateObj.color}`}>
                              {fmt(calc?.vatAmount)}
                            </span>
                          )}
                          <span className="rounded-full text-[11px] font-black bg-indigo-100 text-indigo-800 px-2.5 py-0.5">
                            {fmt(calc?.lineTotal)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={addLine}
              className="mt-3 w-full rounded-xl border-2 border-dashed border-indigo-200 text-indigo-600 font-bold text-xs py-3 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
              + إضافة بند جديد
            </button>
          </div>

          {/* Step 5 — Optional fees */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className={stepBadgeCls}>٥</span>
              رسوم إضافية (اختياري)
            </h2>
            <div className="space-y-3">
              {[
                { key: "shipping", placeholder: "0.00" },
                { key: "service",  placeholder: "0.00" },
              ].map(({ key, placeholder }) => (
                <div key={key} className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>التسمية</label>
                    <input className={inputCls} value={fees[key].label}
                      onChange={e => setFees(f => ({ ...f, [key]: { ...f[key], label: e.target.value } }))} />
                  </div>
                  <div>
                    <label className={labelCls}>المبلغ ({details.currency})</label>
                    <input className={inputCls} type="number" min="0" step="any" placeholder={placeholder} dir="ltr"
                      value={fees[key].amount}
                      onChange={e => setFees(f => ({ ...f, [key]: { ...f[key], amount: e.target.value } }))} />
                  </div>
                </div>
              ))}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>رسوم إضافية مخصصة (التسمية)</label>
                  <input className={inputCls} placeholder="رسوم إدارة..." value={fees.custom.label}
                    onChange={e => setFees(f => ({ ...f, custom: { ...f.custom, label: e.target.value } }))} />
                </div>
                <div>
                  <label className={labelCls}>المبلغ ({details.currency})</label>
                  <input className={inputCls} type="number" min="0" step="any" placeholder="0.00" dir="ltr"
                    value={fees.custom.amount}
                    onChange={e => setFees(f => ({ ...f, custom: { ...f.custom, amount: e.target.value } }))} />
                </div>
              </div>
            </div>
          </div>

          {/* Totals card */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className="text-base">🧮</span> ملخص الإجماليات
            </h2>
            <div className="space-y-2 text-sm">
              {[
                { label: "المجموع الفرعي",                   val: totals.grossTotal,    show: true },
                { label: "إجمالي الخصومات",                  val: -totals.totalDiscount, show: totals.totalDiscount > 0, neg: true },
                details.showVat && totals.taxable5 > 0   && { label: "القيمة الخاضعة لـ 5%", val: totals.taxable5,    show: true },
                details.showVat && totals.taxable0 > 0   && { label: "القيمة الخاضعة لـ 0%", val: totals.taxable0,    show: true },
                details.showVat && totals.exemptTotal > 0 && { label: "القيمة المعفاة",        val: totals.exemptTotal, show: true },
                details.showVat && totals.outTotal > 0    && { label: "خارج النطاق",           val: totals.outTotal,    show: true },
                details.showVat && { label: "إجمالي ضريبة القيمة المضافة", val: totals.totalVat, show: true, bold: true },
                totals.totalFees > 0 && { label: "إجمالي الرسوم الإضافية", val: totals.totalFees, show: true },
              ].filter(Boolean).filter(r => r && r.show).map((row, i) => (
                <div key={i} className={`flex justify-between items-center py-1 ${row.bold ? "border-t border-indigo-200 pt-2" : ""}`}>
                  <span className={`text-xs ${row.bold ? "font-extrabold" : "font-medium"} text-ink-secondary`}>{row.label}</span>
                  <span className={`text-sm font-black ${row.neg ? "text-rose-700" : row.bold ? "text-blue-800" : "text-ink"}`} dir="ltr">
                    {row.neg ? "-" : ""}{fmt(Math.abs(row.val))} {details.currency}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center border-t-2 border-indigo-300 pt-3 mt-2">
                <span className="text-base font-extrabold text-ink">الإجمالي النهائي</span>
                <span className="text-xl font-black text-indigo-700" dir="ltr">
                  {fmt(totals.grandTotal)} {details.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Step 6 — Terms */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className={stepBadgeCls}>٦</span>
              الشروط والأحكام
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>صلاحية عرض السعر</label>
                <input className={inputCls} value={terms.validity}
                  onChange={e => setTerms(t => ({ ...t, validity: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>شروط الدفع</label>
                <input className={inputCls} value={terms.payment}
                  onChange={e => setTerms(t => ({ ...t, payment: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>موعد التسليم (اختياري)</label>
                <input className={inputCls} placeholder="خلال 14 يوم عمل" value={terms.delivery}
                  onChange={e => setTerms(t => ({ ...t, delivery: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>الضمان (اختياري)</label>
                <input className={inputCls} placeholder="ضمان 6 أشهر على الأعطال" value={terms.warranty}
                  onChange={e => setTerms(t => ({ ...t, warranty: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>الاستثناءات من النطاق (اختياري)</label>
                <input className={inputCls} placeholder="لا تشمل رسوم الاستضافة السنوية" value={terms.exclusions}
                  onChange={e => setTerms(t => ({ ...t, exclusions: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>شروط الإلغاء (اختياري)</label>
                <input className={inputCls} placeholder="الدفعة المقدمة غير قابلة للاسترداد بعد بدء العمل" value={terms.cancellation}
                  onChange={e => setTerms(t => ({ ...t, cancellation: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>ملاحظات إضافية</label>
                <textarea className={inputCls} rows={2} placeholder="أي معلومات إضافية تريد إيصالها للعميل..." value={terms.notes}
                  onChange={e => setTerms(t => ({ ...t, notes: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 no-print">
            <button onClick={() => setActiveTab("preview")}
              className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-3 transition-all">
              👁 معاينة عرض السعر
            </button>
            <button onClick={handlePrint}
              className="flex-1 rounded-xl border border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-extrabold text-sm py-3 transition-all">
              🖨 طباعة / PDF
            </button>
            <button onClick={handleConvertToInvoice}
              className="rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold text-sm px-5 py-3 transition-all whitespace-nowrap">
              🧾 تحويل إلى فاتورة
            </button>
          </div>

          {/* Convert notice */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-900 leading-relaxed">
            <span className="font-bold">تحويل إلى فاتورة ضريبية: </span>
            يؤدي هذا الزر إلى فتح مولد الفاتورة الضريبية مع نقل بيانات عرض السعر تلقائياً عبر التخزين المحلي (في هذا الجهاز فقط). راجع بيانات الفاتورة قبل الإرسال.
          </div>
        </div>
      )}

      {/* ══════════════ PREVIEW TAB ══════════════ */}
      {activeTab === "preview" && (
        <>
          <div className="no-print flex gap-3">
            <button onClick={() => setActiveTab("form")}
              className="rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs px-4 py-2 transition-all">
              ← العودة للتعديل
            </button>
            <button onClick={handlePrint}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 transition-all">
              🖨 طباعة / PDF
            </button>
          </div>

          {/* A4 Print Document */}
          <div id="quotation-print"
            className="bg-white rounded-2xl border border-slate-300 shadow-xl print:shadow-none print:border-0 print:rounded-none print:m-0 overflow-hidden">

            {/* Header band */}
            <div className="bg-indigo-700 px-8 py-6 print:bg-indigo-700" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white text-2xl font-black">عرض سعر</p>
                  <p className="text-indigo-200 text-sm font-semibold">QUOTATION</p>
                  {details.status && (
                    <span className={`mt-2 inline-block rounded-full text-[10px] font-black px-3 py-0.5 border ${STATUS_OPTIONS.find(s => s.id === details.status)?.style || ""}`}>
                      {STATUS_OPTIONS.find(s => s.id === details.status)?.label}
                    </span>
                  )}
                </div>
                <div className="text-right" dir="ltr">
                  <p className="text-indigo-200 text-xs">رقم عرض السعر / Quotation No.</p>
                  <p className="text-white font-black text-lg">{details.quoteNumber || "—"}</p>
                  {details.projectRef && <p className="text-indigo-300 text-xs mt-0.5">Ref: {details.projectRef}</p>}
                  <p className="text-indigo-200 text-xs mt-1">{details.currency}</p>
                </div>
              </div>
              {/* Date strip */}
              <div className="mt-4 flex flex-wrap gap-6 text-xs" dir="ltr">
                <div>
                  <span className="text-indigo-300">التاريخ / Date: </span>
                  <span className="text-white font-bold">{details.issueDate || "—"}</span>
                </div>
                {details.validUntil && (
                  <div>
                    <span className="text-indigo-300">صالح حتى / Valid Until: </span>
                    <span className="text-white font-bold">{details.validUntil}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6" dir="rtl">

              {/* Seller + Customer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wide mb-2">إعداد · Prepared By</p>
                  <p className="font-extrabold text-ink text-sm">{seller.name || "—"}</p>
                  {seller.contactPerson && <p className="text-xs text-ink-secondary mt-0.5">{seller.contactPerson}</p>}
                  {seller.address && <p className="text-xs text-ink-secondary">{seller.address}</p>}
                  {seller.emirate && <p className="text-xs text-ink-secondary">{seller.emirate}، الإمارات</p>}
                  {seller.phone && <p className="text-xs text-ink-secondary" dir="ltr">{seller.phone}</p>}
                  {seller.email && <p className="text-xs text-ink-secondary" dir="ltr">{seller.email}</p>}
                  {seller.website && <p className="text-xs text-indigo-600" dir="ltr">{seller.website}</p>}
                  {seller.trn && <p className="text-[10px] text-ink-muted mt-1">TRN: <span dir="ltr">{seller.trn}</span></p>}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-wide mb-2">مُقدَّم إلى · Prepared For</p>
                  <p className="font-extrabold text-ink text-sm">{customer.name || "—"}</p>
                  {customer.contactPerson && <p className="text-xs text-ink-secondary mt-0.5">{customer.contactPerson}</p>}
                  {customer.address && <p className="text-xs text-ink-secondary">{customer.address}</p>}
                  {customer.emirate && <p className="text-xs text-ink-secondary">{customer.emirate}، الإمارات</p>}
                  {customer.phone && <p className="text-xs text-ink-secondary" dir="ltr">{customer.phone}</p>}
                  {customer.email && <p className="text-xs text-ink-secondary" dir="ltr">{customer.email}</p>}
                  {customer.trn && <p className="text-[10px] text-ink-muted mt-1">TRN: <span dir="ltr">{customer.trn}</span></p>}
                </div>
              </div>

              {/* Line items table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-ink-secondary">
                      <th className="text-right p-2 font-extrabold">#</th>
                      <th className="text-right p-2 font-extrabold">الوصف / Description</th>
                      <th className="text-right p-2 font-extrabold">الكمية / Qty</th>
                      <th className="text-right p-2 font-extrabold">الوحدة</th>
                      <th className="text-right p-2 font-extrabold">السعر / Price</th>
                      <th className="text-right p-2 font-extrabold">الخصم</th>
                      {details.showVat && <th className="text-right p-2 font-extrabold">الضريبة</th>}
                      {details.showVat && <th className="text-right p-2 font-extrabold">VAT</th>}
                      <th className="text-right p-2 font-extrabold">الإجمالي / Total</th>
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
                          <td className="p-2 text-ink-secondary" dir="ltr">{line.qty}</td>
                          <td className="p-2 text-ink-muted">{line.unit}</td>
                          <td className="p-2 text-ink-secondary" dir="ltr">{fmt(parseNum(line.unitPrice))}</td>
                          <td className="p-2 text-rose-700" dir="ltr">{parseNum(line.discount) > 0 ? `(${fmt(parseNum(line.discount))})` : "—"}</td>
                          {details.showVat && (
                            <td className="p-2">
                              <span className={`rounded-full text-[10px] font-bold px-1.5 py-0.5 ${rateObj.color}`}>{rateObj.tag}</span>
                            </td>
                          )}
                          {details.showVat && (
                            <td className="p-2 text-blue-700 font-medium" dir="ltr">{fmt(calc?.vatAmount)}</td>
                          )}
                          <td className="p-2 font-black text-ink" dir="ltr">{fmt(calc?.lineTotal)}</td>
                        </tr>
                      );
                    })}
                    {/* Optional fees rows */}
                    {[fees.shipping, fees.service, fees.custom].filter(f => parseNum(f.amount) > 0 && f.label).map((f, i) => (
                      <tr key={`fee-${i}`} className="bg-slate-50/30">
                        <td className="p-2 text-ink-muted">—</td>
                        <td className="p-2 text-ink-secondary italic">{f.label}</td>
                        <td colSpan={details.showVat ? 6 : 4} />
                        <td className="p-2 font-bold text-ink" dir="ltr">{fmt(parseNum(f.amount))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals box */}
              <div className="flex justify-end">
                <div className="w-full sm:w-72 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                  {[
                    { label: "المجموع الفرعي / Subtotal", val: totals.grossTotal },
                    totals.totalDiscount > 0 && { label: "الخصومات / Discounts", val: -totals.totalDiscount, neg: true },
                    details.showVat && totals.taxable5 > 0 && { label: "خاضع 5% / Taxable 5%", val: totals.taxable5 },
                    details.showVat && totals.taxable0 > 0 && { label: "صفري / Zero-rated", val: totals.taxable0 },
                    details.showVat && totals.exemptTotal > 0 && { label: "معفاة / Exempt", val: totals.exemptTotal },
                    details.showVat && { label: "إجمالي VAT / Total VAT", val: totals.totalVat, bold: true },
                    totals.totalFees > 0 && { label: "رسوم إضافية / Fees", val: totals.totalFees },
                  ].filter(Boolean).map((row, i) => (
                    <div key={i} className={`flex justify-between px-4 py-2 text-xs ${row.bold ? "bg-blue-50 border-t border-blue-200" : "border-t border-slate-100 first:border-t-0"}`}>
                      <span className={row.bold ? "font-extrabold text-blue-800" : "text-ink-secondary"}>{row.label}</span>
                      <span className={`font-black ${row.neg ? "text-rose-700" : row.bold ? "text-blue-800" : "text-ink"}`} dir="ltr">
                        {row.neg ? "-" : ""}{fmt(Math.abs(row.val))} {details.currency}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between px-4 py-3 bg-indigo-700 text-white">
                    <span className="text-sm font-extrabold">الإجمالي / Grand Total</span>
                    <span className="text-sm font-black" dir="ltr">{fmt(totals.grandTotal)} {details.currency}</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              {(terms.validity || terms.payment || terms.delivery || terms.warranty || terms.exclusions || terms.cancellation) && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
                  <p className="text-xs font-extrabold text-ink border-b border-slate-200 pb-2">الشروط والأحكام / Terms & Conditions</p>
                  <div className="grid gap-1.5 sm:grid-cols-2 text-xs text-ink-secondary">
                    {terms.validity    && <p><span className="font-bold text-ink">الصلاحية: </span>{terms.validity}</p>}
                    {terms.payment     && <p><span className="font-bold text-ink">الدفع: </span>{terms.payment}</p>}
                    {terms.delivery    && <p><span className="font-bold text-ink">التسليم: </span>{terms.delivery}</p>}
                    {terms.warranty    && <p><span className="font-bold text-ink">الضمان: </span>{terms.warranty}</p>}
                    {terms.exclusions  && <p className="sm:col-span-2"><span className="font-bold text-ink">الاستثناءات: </span>{terms.exclusions}</p>}
                    {terms.cancellation && <p className="sm:col-span-2"><span className="font-bold text-ink">الإلغاء: </span>{terms.cancellation}</p>}
                  </div>
                </div>
              )}

              {/* Notes */}
              {terms.notes && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold text-ink-muted mb-1">ملاحظات / Notes</p>
                  <p className="text-xs text-ink-secondary leading-relaxed">{terms.notes}</p>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="text-center">
                  <div className="border-b-2 border-slate-300 mb-2 h-12" />
                  <p className="text-xs font-bold text-ink-secondary">إعداد / Prepared By</p>
                  <p className="text-[10px] text-ink-muted">{seller.name || ""}</p>
                </div>
                <div className="text-center">
                  <div className="border-b-2 border-slate-300 mb-2 h-12" />
                  <p className="text-xs font-bold text-ink-secondary">اعتماد العميل / Client Approval</p>
                  <p className="text-[10px] text-ink-muted">{customer.name || ""}</p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-center">
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  هذا عرض سعر تجاري وليس فاتورة ضريبية — غير مرتبط بهيئة الضرائب الاتحادية (FTA) ولا يحمل اعتمادها.
                  This is a commercial quotation, not a Tax Invoice. Not affiliated with or approved by the UAE FTA.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
