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
  calcCompleteness,
  checkOk,
  checkWarn,
  checkMissing,
} from "@/lib/businessUtils";
import { EMIRATES } from "@/lib/countryBusinessConfig";

// ─── Constants ─────────────────────────────────────────────────────────────────

const DRAFT_KEY   = "uae_purchase_order_draft_v1";
const PREFILL_KEY = "uae_po_prefill_v1";

const VAT_RATES = [
  { id: "5",      label: "5% — خاضعة للضريبة",   rate: 0.05, tag: "5%",    color: "bg-blue-100 text-blue-800" },
  { id: "0",      label: "0% — صفرية المعدل",      rate: 0,    tag: "0%",    color: "bg-emerald-100 text-emerald-800" },
  { id: "exempt", label: "معفاة",                  rate: null, tag: "معفاة", color: "bg-amber-100 text-amber-800" },
  { id: "out",    label: "خارج النطاق",             rate: null, tag: "خ.ن",  color: "bg-slate-100 text-slate-700" },
  { id: "none",   label: "بدون ضريبة",              rate: null, tag: "—",    color: "bg-gray-100 text-gray-500" },
];

const UNITS = ["وحدة", "قطعة", "صندوق", "كرتون", "كغ", "طن", "متر", "متر مربع", "لتر", "ساعة", "يوم", "شهر", "نسخة"];

const STATUS_OPTIONS = [
  { id: "",         label: "بدون حالة",    style: "" },
  { id: "draft",    label: "مسودة",        style: "bg-slate-100 text-slate-700 border-slate-300" },
  { id: "sent",     label: "مرسل للمورد",  style: "bg-blue-100 text-blue-800 border-blue-300" },
  { id: "confirmed",label: "مؤكد",         style: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { id: "cancelled",label: "ملغي",         style: "bg-rose-100 text-rose-800 border-rose-300" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

let _lineId = 300;
const newLineId = () => ++_lineId;

const emptyLine = () => ({
  id: newLineId(), name: "", sku: "",
  qty: "1", unit: "وحدة", unitPrice: "", discount: "0", vatRateId: "5",
});

function generatePoNumber() {
  const y = new Date().getFullYear();
  const n = String(Math.floor(Math.random() * 9000) + 1000);
  return `PO-${y}-${n}`;
}

const today  = () => new Date().toISOString().split("T")[0];
const plus7  = () => { const d = new Date(); d.setDate(d.getDate() + 7);  return d.toISOString().split("T")[0]; };

// ─── Default state factories ────────────────────────────────────────────────────

const defaultBuyer = () => ({
  name: "", address: "", emirate: "دبي", trn: "",
  contactPerson: "", phone: "", email: "",
});

const defaultSupplier = () => ({
  name: "", address: "", emirate: "", trn: "",
  contactPerson: "", phone: "", email: "",
});

const defaultPoDetails = () => ({
  poNumber:      generatePoNumber(),
  issueDate:     today(),
  deliveryDate:  plus7(),
  currency:      "AED",
  quoteRef:      "",
  projectRef:    "",
  requestedBy:   "",
  status:        "",
  showVat:       true,
});

const defaultDelivery = () => ({
  address:      "",
  instructions: "",
  paymentTerms: "50% مقدماً و50% عند التسليم",
  paymentMethod:"",
  warranty:     "",
  returns:      "",
  notes:        "",
});

const defaultCharges = () => ({
  shipping:     { label: "رسوم الشحن والتوصيل", amount: "" },
  installation: { label: "رسوم التركيب",          amount: "" },
  custom:       { label: "",                        amount: "" },
});

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function UaePurchaseOrderGenerator() {
  const [buyer,      setBuyer]      = useState(defaultBuyer);
  const [supplier,   setSupplier]   = useState(defaultSupplier);
  const [poDetails,  setPoDetails]  = useState(defaultPoDetails);
  const [lines,      setLines]      = useState([emptyLine()]);
  const [charges,    setCharges]    = useState(defaultCharges);
  const [delivery,   setDelivery]   = useState(defaultDelivery);
  const [activeTab,  setActiveTab]  = useState("form");
  const [draftMsg,   setDraftMsg]   = useState("");
  const [showChecker,setShowChecker]= useState(false);

  // ── Prefill from Quotation Generator ──────────────────────────────────────────
  const [prefillData,      setPrefillData]      = useState(null);
  const [prefillDismissed, setPrefillDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" && localStorage.getItem(PREFILL_KEY);
      if (raw) setPrefillData(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const handleImportPrefill = () => {
    if (!prefillData) return;
    try {
      if (prefillData.supplier)  setSupplier(s => ({ ...s, ...prefillData.supplier }));
      if (prefillData.buyer)     setBuyer(b => ({ ...b, ...prefillData.buyer }));
      if (prefillData.lines && prefillData.lines.length > 0) setLines(prefillData.lines.map(l => ({ ...l, id: newLineId(), sku: l.sku || "" })));
      if (prefillData.poDetails) setPoDetails(d => ({ ...d, ...prefillData.poDetails }));
      localStorage.removeItem(PREFILL_KEY);
    } catch { /* ignore */ }
    setPrefillData(null);
  };

  const handleDismissPrefill = () => setPrefillDismissed(true);

  // ── Draft ─────────────────────────────────────────────────────────────────────
  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ buyer, supplier, poDetails, lines, charges, delivery }));
      setDraftMsg("✅ تم حفظ المسودة على هذا الجهاز");
      setTimeout(() => setDraftMsg(""), 3000);
    } catch { setDraftMsg("⚠️ تعذّر الحفظ"); }
  }, [buyer, supplier, poDetails, lines, charges, delivery]);

  const restoreDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) { setDraftMsg("لا توجد مسودة محفوظة"); setTimeout(() => setDraftMsg(""), 3000); return; }
      const d = JSON.parse(raw);
      if (d.buyer)      setBuyer(d.buyer);
      if (d.supplier)   setSupplier(d.supplier);
      if (d.poDetails)  setPoDetails(d.poDetails);
      if (d.lines)      setLines(d.lines);
      if (d.charges)    setCharges(d.charges);
      if (d.delivery)   setDelivery(d.delivery);
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
  const updateLine    = (id, field, value) =>
    setLines(ls => ls.map(l => l.id === id ? { ...l, [field]: value } : l));
  const addLine       = () => setLines(ls => [...ls, emptyLine()]);
  const removeLine    = (id) => setLines(ls => ls.length > 1 ? ls.filter(l => l.id !== id) : ls);
  const duplicateLine = (id) => {
    const src = lines.find(l => l.id === id);
    if (!src) return;
    const dup = { ...src, id: newLineId() };
    setLines(ls => {
      const idx = ls.findIndex(l => l.id === id);
      const next = [...ls]; next.splice(idx + 1, 0, dup); return next;
    });
  };

  // ── Reset ─────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setBuyer(defaultBuyer());        setSupplier(defaultSupplier());
    setPoDetails(defaultPoDetails()); setLines([emptyLine()]);
    setCharges(defaultCharges());    setDelivery(defaultDelivery());
    setActiveTab("form");
  };

  // ── Print ─────────────────────────────────────────────────────────────────────
  const handlePrint = () => { setActiveTab("preview"); setTimeout(() => window.print(), 300); };

  // ── Open invoice generator ─────────────────────────────────────────────────────
  const handleOpenInvoice = () => {
    try {
      const payload = {
        seller: { name: supplier.name, address: supplier.address, emirate: supplier.emirate, trn: supplier.trn, email: supplier.email, phone: supplier.phone, cr: "" },
        buyer:  { name: buyer.name, address: buyer.address, emirate: buyer.emirate, trn: buyer.trn, vatRegistered: buyer.trn ? "yes" : "no" },
        details: { invoiceNumber: poDetails.poNumber.replace("PO-", "INV-"), issueDate: poDetails.issueDate, supplyDate: "", currency: poDetails.currency, notes: delivery.notes },
        lines: lines.map(l => ({ id: l.id, name: l.name, qty: l.qty, unitPrice: l.unitPrice, discount: l.discount, vatRateId: l.vatRateId })),
      };
      localStorage.setItem("uae_invoice_prefill_v1", JSON.stringify(payload));
    } catch { /* silent */ }
    window.open("/ar/ae/vat-invoice-generator", "_blank");
  };

  // ── Calculations ──────────────────────────────────────────────────────────────
  const { lineCalcs, totals } = useMemo(() => {
    const lineCalcs = lines.map(l => {
      const rateObj      = VAT_RATES.find(r => r.id === l.vatRateId) || VAT_RATES[0];
      const effectiveRate = poDetails.showVat ? rateObj.rate : null;
      const result       = calcLineVat({ qty: l.qty, unitPrice: l.unitPrice, discount: l.discount, vatRate: effectiveRate });
      return { ...result, rateObj };
    });

    const chargeTotal = parseNum(charges.shipping.amount) + parseNum(charges.installation.amount) + parseNum(charges.custom.amount);
    const grossTotal    = lineCalcs.reduce((s, l) => s + l.gross, 0);
    const totalDiscount = lineCalcs.reduce((s, l) => s + l.discount, 0);
    const taxable5      = lineCalcs.filter(l => l.rateObj.id === "5").reduce((s, l) => s + l.taxableBase, 0);
    const taxable0      = lineCalcs.filter(l => l.rateObj.id === "0").reduce((s, l) => s + l.taxableBase, 0);
    const exemptTotal   = lineCalcs.filter(l => l.rateObj.id === "exempt").reduce((s, l) => s + l.taxableBase, 0);
    const outTotal      = lineCalcs.filter(l => l.rateObj.id === "out").reduce((s, l) => s + l.taxableBase, 0);
    const totalVat      = lineCalcs.reduce((s, l) => s + l.vatAmount, 0);
    const grandTotal    = lineCalcs.reduce((s, l) => s + l.lineTotal, 0) + chargeTotal;

    return { lineCalcs, totals: { grossTotal, totalDiscount, taxable5, taxable0, exemptTotal, outTotal, totalVat, chargeTotal, grandTotal } };
  }, [lines, charges, poDetails.showVat]);

  // ── Completeness checks ───────────────────────────────────────────────────────
  const checks = useMemo(() => {
    const c = [];
    buyer.name.trim()                  ? c.push(checkOk("اسم الشركة المشترية"))     : c.push(checkMissing("اسم الشركة المشترية", "مطلوب"));
    supplier.name.trim()               ? c.push(checkOk("اسم المورد"))               : c.push(checkMissing("اسم المورد", "مطلوب"));
    poDetails.poNumber.trim()          ? c.push(checkOk("رقم أمر الشراء"))           : c.push(checkMissing("رقم أمر الشراء", "مطلوب"));
    poDetails.issueDate                ? c.push(checkOk("تاريخ الإصدار"))             : c.push(checkMissing("تاريخ الإصدار", "مطلوب"));
    poDetails.deliveryDate             ? c.push(checkOk("تاريخ التسليم المتوقع"))     : c.push(checkWarn("تاريخ التسليم المتوقع", "يُستحسن تحديده"));
    const badLines = lines.filter(l => !l.name.trim() || !parseNum(l.unitPrice));
    badLines.length === 0              ? c.push(checkOk("بنود أمر الشراء (وصف + سعر)")) : c.push(checkMissing("بنود أمر الشراء", `${badLines.length} بند ناقص`));
    delivery.paymentTerms.trim()       ? c.push(checkOk("شروط الدفع"))               : c.push(checkWarn("شروط الدفع", "يُستحسن تحديدها"));
    return c;
  }, [buyer, supplier, poDetails, lines, delivery]);

  const { okCount, warnCount, missCount, completePct, barColor } = calcCompleteness(checks);

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">

      {/* ── Prefill import banner ── */}
      {prefillData && !prefillDismissed && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-card no-print flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xl shrink-0">📋</span>
            <div>
              <p className="text-xs font-extrabold text-emerald-900">تم اكتشاف بيانات من مولد عرض السعر الإماراتي</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">لن تُستبدل البيانات الحالية إلا بعد موافقتك الصريحة</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={handleImportPrefill}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 transition-all">
              ✅ استيراد بيانات عرض السعر
            </button>
            <button onClick={handleDismissPrefill}
              className="rounded-lg border border-emerald-300 text-emerald-700 text-xs font-bold px-3 py-1.5 hover:bg-emerald-100 transition-all">
              تجاهل
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card no-print">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📦</span>
              <h1 className="text-xl font-extrabold text-ink">مولد أمر الشراء في الإمارات</h1>
            </div>
            <p className="text-xs text-ink-secondary">
              أنشئ أمر شراء احترافي بالعربية والإنجليزية — للشركات والمتاجر وفرق المشتريات في الإمارات
            </p>
          </div>
          <button onClick={handleReset}
            className="rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 hover:bg-slate-100 transition-all self-start sm:self-auto">
            مسح
          </button>
        </div>

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
          {[{ id: "form", label: "📝 إدخال البيانات" }, { id: "preview", label: "👁 معاينة أمر الشراء" }].map(t => (
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

          {/* Step 1 — PO Details */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className={stepBadgeCls}>١</span>
              بيانات أمر الشراء
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>رقم أمر الشراء (PO No.) *</label>
                <input className={inputCls} placeholder="PO-2026-0001" dir="ltr" value={poDetails.poNumber}
                  onChange={e => setPoDetails(d => ({ ...d, poNumber: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>العملة</label>
                <select className={selectCls} value={poDetails.currency}
                  onChange={e => setPoDetails(d => ({ ...d, currency: e.target.value }))}>
                  <option value="AED">درهم إماراتي — AED</option>
                  <option value="USD">دولار أمريكي — USD</option>
                  <option value="EUR">يورو — EUR</option>
                  <option value="GBP">جنيه استرليني — GBP</option>
                  <option value="SAR">ريال سعودي — SAR</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>تاريخ الإصدار *</label>
                <input className={inputCls} type="date" dir="ltr" value={poDetails.issueDate}
                  onChange={e => setPoDetails(d => ({ ...d, issueDate: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>تاريخ التسليم المتوقع</label>
                <input className={inputCls} type="date" dir="ltr" value={poDetails.deliveryDate}
                  onChange={e => setPoDetails(d => ({ ...d, deliveryDate: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>مرجع عرض السعر (اختياري)</label>
                <input className={inputCls} placeholder="QT-2026-0001" dir="ltr" value={poDetails.quoteRef}
                  onChange={e => setPoDetails(d => ({ ...d, quoteRef: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>المشروع / القسم (اختياري)</label>
                <input className={inputCls} placeholder="قسم المشتريات / IT" value={poDetails.projectRef}
                  onChange={e => setPoDetails(d => ({ ...d, projectRef: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>طلب بواسطة (اختياري)</label>
                <input className={inputCls} placeholder="أحمد المنصوري" value={poDetails.requestedBy}
                  onChange={e => setPoDetails(d => ({ ...d, requestedBy: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>حالة أمر الشراء (اختياري)</label>
                <select className={selectCls} value={poDetails.status}
                  onChange={e => setPoDetails(d => ({ ...d, status: e.target.value }))}>
                  {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>
            {/* VAT toggle */}
            <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/60 p-3 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs font-bold text-blue-900">هل تريد إظهار ضريبة القيمة المضافة (VAT)؟</p>
                <p className="text-[10px] text-blue-700 mt-0.5">أمر الشراء ليس فاتورة ضريبية، حتى عند إظهار ضريبة القيمة المضافة</p>
              </div>
              <div className="flex gap-2">
                {[{ v: true, label: "نعم" }, { v: false, label: "لا" }].map(opt => (
                  <button key={String(opt.v)} onClick={() => setPoDetails(d => ({ ...d, showVat: opt.v }))}
                    className={`rounded-lg px-4 py-1.5 text-xs font-bold border transition-all ${poDetails.showVat === opt.v ? (opt.v ? "bg-blue-600 text-white border-blue-600" : "bg-slate-600 text-white border-slate-600") : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2 — Buyer */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className={stepBadgeCls}>٢</span>
              بيانات المشتري (شركتك / جهة الشراء)
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>اسم الشركة *</label>
                <input className={inputCls} placeholder="شركة الأفق التجارية ذ.م.م" value={buyer.name}
                  onChange={e => setBuyer(b => ({ ...b, name: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>جهة الاتصال</label>
                <input className={inputCls} placeholder="مسؤول المشتريات" value={buyer.contactPerson}
                  onChange={e => setBuyer(b => ({ ...b, contactPerson: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>الإمارة</label>
                <select className={selectCls} value={buyer.emirate}
                  onChange={e => setBuyer(b => ({ ...b, emirate: e.target.value }))}>
                  {EMIRATES.map(em => <option key={em}>{em}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>العنوان</label>
                <input className={inputCls} placeholder="شارع الشيخ زايد، مبنى 15، دبي" value={buyer.address}
                  onChange={e => setBuyer(b => ({ ...b, address: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>الهاتف</label>
                <input className={inputCls} type="tel" placeholder="+971 4 xxx xxxx" dir="ltr" value={buyer.phone}
                  onChange={e => setBuyer(b => ({ ...b, phone: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>البريد الإلكتروني</label>
                <input className={inputCls} type="email" placeholder="procurement@company.ae" dir="ltr" value={buyer.email}
                  onChange={e => setBuyer(b => ({ ...b, email: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>
                  الرقم الضريبي TRN (اختياري)
                  <span className="text-[10px] text-amber-700 font-normal mr-1">(تحقق شكلي فقط)</span>
                </label>
                <input className={`${inputCls} ${buyer.trn && !isValidUaeTrn(buyer.trn) ? "border-rose-400" : buyer.trn && isValidUaeTrn(buyer.trn) ? "border-emerald-400" : ""}`}
                  placeholder="100XXXXXXXXXXXX" dir="ltr" maxLength={15}
                  value={buyer.trn} onChange={e => setBuyer(b => ({ ...b, trn: e.target.value.replace(/\D/g, "") }))} />
              </div>
            </div>
          </div>

          {/* Step 3 — Supplier */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className={stepBadgeCls}>٣</span>
              بيانات المورد (Supplier)
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>اسم المورد *</label>
                <input className={inputCls} placeholder="شركة التوريدات التقنية ذ.م.م" value={supplier.name}
                  onChange={e => setSupplier(s => ({ ...s, name: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>جهة الاتصال</label>
                <input className={inputCls} placeholder="مندوب المبيعات" value={supplier.contactPerson}
                  onChange={e => setSupplier(s => ({ ...s, contactPerson: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>الإمارة</label>
                <select className={selectCls} value={supplier.emirate}
                  onChange={e => setSupplier(s => ({ ...s, emirate: e.target.value }))}>
                  <option value="">— اختر —</option>
                  {EMIRATES.map(em => <option key={em}>{em}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>العنوان</label>
                <input className={inputCls} placeholder="المنطقة الصناعية، جبل علي" value={supplier.address}
                  onChange={e => setSupplier(s => ({ ...s, address: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>الهاتف</label>
                <input className={inputCls} type="tel" placeholder="+971 4 xxx xxxx" dir="ltr" value={supplier.phone}
                  onChange={e => setSupplier(s => ({ ...s, phone: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>البريد الإلكتروني</label>
                <input className={inputCls} type="email" placeholder="sales@supplier.ae" dir="ltr" value={supplier.email}
                  onChange={e => setSupplier(s => ({ ...s, email: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>الرقم الضريبي TRN (اختياري)</label>
                <input className={`${inputCls} ${supplier.trn && !isValidUaeTrn(supplier.trn) ? "border-rose-400" : supplier.trn && isValidUaeTrn(supplier.trn) ? "border-emerald-400" : ""}`}
                  placeholder="100XXXXXXXXXXXX" dir="ltr" maxLength={15}
                  value={supplier.trn} onChange={e => setSupplier(s => ({ ...s, trn: e.target.value.replace(/\D/g, "") }))} />
              </div>
            </div>
          </div>

          {/* Step 4 — Line items */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className={stepBadgeCls}>٤</span>
              بنود الطلب
            </h2>
            <div className="space-y-3">
              {lines.map((line, idx) => {
                const calc     = lineCalcs[idx];
                const rateObj  = VAT_RATES.find(r => r.id === line.vatRateId) || VAT_RATES[0];
                const overDisc = discountExceedsGross(line.qty, line.unitPrice, line.discount);
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
                        <label className={labelCls}>الوصف / اسم الصنف *</label>
                        <input className={inputCls} placeholder="كرسي مكتب مع ظهر داعم" value={line.name}
                          onChange={e => updateLine(line.id, "name", e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>كود الصنف / SKU (اختياري)</label>
                        <input className={inputCls} placeholder="CHAIR-001" dir="ltr" value={line.sku}
                          onChange={e => updateLine(line.id, "sku", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>الوحدة</label>
                        <select className={selectCls} value={line.unit}
                          onChange={e => updateLine(line.id, "unit", e.target.value)}>
                          {UNITS.map(u => <option key={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-4">
                      <div>
                        <label className={labelCls}>الكمية</label>
                        <input className={inputCls} type="number" min="0" step="any" placeholder="1" dir="ltr"
                          value={line.qty} onChange={e => updateLine(line.id, "qty", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>سعر الوحدة ({poDetails.currency})</label>
                        <input className={inputCls} type="number" min="0" step="any" placeholder="0.00" dir="ltr"
                          value={line.unitPrice} onChange={e => updateLine(line.id, "unitPrice", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>الخصم ({poDetails.currency})</label>
                        <input className={`${inputCls} ${overDisc ? "border-rose-400" : ""}`}
                          type="number" min="0" step="any" placeholder="0" dir="ltr"
                          value={line.discount} onChange={e => updateLine(line.id, "discount", e.target.value)} />
                        {overDisc && <p className="text-[11px] text-rose-600 mt-0.5">الخصم يتجاوز قيمة البند</p>}
                      </div>
                      {poDetails.showVat && (
                        <div>
                          <label className={labelCls}>نسبة الضريبة</label>
                          <select className={selectCls} value={line.vatRateId}
                            onChange={e => updateLine(line.id, "vatRateId", e.target.value)}>
                            {VAT_RATES.map(r => <option key={r.id} value={r.id}>{r.tag} — {r.label}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                    {parseNum(line.unitPrice) > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5">
                          {fmt(calc?.gross)} {poDetails.currency}
                        </span>
                        {poDetails.showVat && (
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
                );
              })}
            </div>
            <button onClick={addLine}
              className="mt-3 w-full rounded-xl border-2 border-dashed border-indigo-200 text-indigo-600 font-bold text-xs py-3 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
              + إضافة بند جديد
            </button>
          </div>

          {/* Step 5 — Optional charges */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className={stepBadgeCls}>٥</span>
              رسوم إضافية (اختياري)
            </h2>
            <div className="space-y-3">
              {[
                { key: "shipping",     placeholder: "رسوم الشحن والتوصيل" },
                { key: "installation", placeholder: "رسوم التركيب والتشغيل" },
              ].map(({ key, placeholder }) => (
                <div key={key} className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>التسمية</label>
                    <input className={inputCls} placeholder={placeholder} value={charges[key].label}
                      onChange={e => setCharges(c => ({ ...c, [key]: { ...c[key], label: e.target.value } }))} />
                  </div>
                  <div>
                    <label className={labelCls}>المبلغ ({poDetails.currency})</label>
                    <input className={inputCls} type="number" min="0" step="any" placeholder="0.00" dir="ltr"
                      value={charges[key].amount}
                      onChange={e => setCharges(c => ({ ...c, [key]: { ...c[key], amount: e.target.value } }))} />
                  </div>
                </div>
              ))}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>رسوم مخصصة (التسمية)</label>
                  <input className={inputCls} placeholder="رسوم إضافية..." value={charges.custom.label}
                    onChange={e => setCharges(c => ({ ...c, custom: { ...c.custom, label: e.target.value } }))} />
                </div>
                <div>
                  <label className={labelCls}>المبلغ ({poDetails.currency})</label>
                  <input className={inputCls} type="number" min="0" step="any" placeholder="0.00" dir="ltr"
                    value={charges.custom.amount}
                    onChange={e => setCharges(c => ({ ...c, custom: { ...c.custom, amount: e.target.value } }))} />
                </div>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className="text-base">🧮</span> ملخص الإجماليات
            </h2>
            <div className="space-y-2 text-sm">
              {[
                { label: "المجموع قبل الخصم",                    val: totals.grossTotal,    show: true },
                { label: "إجمالي الخصومات",                      val: -totals.totalDiscount, show: totals.totalDiscount > 0, neg: true },
                poDetails.showVat && totals.taxable5 > 0   && { label: "القيمة الخاضعة لـ 5%", val: totals.taxable5,    show: true },
                poDetails.showVat && totals.taxable0  > 0  && { label: "القيمة الخاضعة لـ 0%", val: totals.taxable0,    show: true },
                poDetails.showVat && totals.exemptTotal > 0 && { label: "القيمة المعفاة",        val: totals.exemptTotal, show: true },
                poDetails.showVat && totals.outTotal   > 0  && { label: "خارج النطاق",           val: totals.outTotal,    show: true },
                poDetails.showVat && { label: "إجمالي ضريبة القيمة المضافة", val: totals.totalVat, show: true, bold: true },
                totals.chargeTotal > 0 && { label: "إجمالي الرسوم الإضافية", val: totals.chargeTotal, show: true },
              ].filter(Boolean).filter(r => r && r.show).map((row, i) => (
                <div key={i} className={`flex justify-between items-center py-1 ${row.bold ? "border-t border-indigo-200 pt-2" : ""}`}>
                  <span className={`text-xs ${row.bold ? "font-extrabold" : "font-medium"} text-ink-secondary`}>{row.label}</span>
                  <span className={`text-sm font-black ${row.neg ? "text-rose-700" : row.bold ? "text-blue-800" : "text-ink"}`} dir="ltr">
                    {row.neg ? "-" : ""}{fmt(Math.abs(row.val))} {poDetails.currency}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center border-t-2 border-indigo-300 pt-3 mt-2">
                <span className="text-base font-extrabold text-ink">الإجمالي النهائي</span>
                <span className="text-xl font-black text-indigo-700" dir="ltr">{fmt(totals.grandTotal)} {poDetails.currency}</span>
              </div>
            </div>
          </div>

          {/* Step 6 — Delivery & Payment */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className={stepBadgeCls}>٦</span>
              شروط التسليم والدفع
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>عنوان التسليم</label>
                <input className={inputCls} placeholder="نفس عنوان الشركة أو عنوان مختلف" value={delivery.address}
                  onChange={e => setDelivery(d => ({ ...d, address: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>شروط الدفع</label>
                <input className={inputCls} value={delivery.paymentTerms}
                  onChange={e => setDelivery(d => ({ ...d, paymentTerms: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>طريقة الدفع (اختياري)</label>
                <input className={inputCls} placeholder="تحويل بنكي / شيك" value={delivery.paymentMethod}
                  onChange={e => setDelivery(d => ({ ...d, paymentMethod: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>تعليمات التسليم (اختياري)</label>
                <input className={inputCls} placeholder="التسليم خلال 7 أيام عمل — التغليف المطلوب..." value={delivery.instructions}
                  onChange={e => setDelivery(d => ({ ...d, instructions: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>شروط الضمان (اختياري)</label>
                <input className={inputCls} placeholder="ضمان سنة ضد عيوب التصنيع" value={delivery.warranty}
                  onChange={e => setDelivery(d => ({ ...d, warranty: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>شروط الإرجاع والاستبدال (اختياري)</label>
                <input className={inputCls} placeholder="إرجاع خلال 14 يوماً بحالة جيدة" value={delivery.returns}
                  onChange={e => setDelivery(d => ({ ...d, returns: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>ملاحظات إضافية</label>
                <textarea className={inputCls} rows={2} placeholder="أي تعليمات أو متطلبات خاصة..." value={delivery.notes}
                  onChange={e => setDelivery(d => ({ ...d, notes: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Completeness checker */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <div className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowChecker(v => !v)}>
              <div className="flex items-center gap-2">
                <span className="text-base">🔍</span>
                <div>
                  <h2 className="text-sm font-extrabold text-ink">فحص مبدئي لاكتمال أمر الشراء</h2>
                  <p className="text-[11px] text-ink-muted">تحقق شكلي — ليس شرطاً قانونياً</p>
                </div>
              </div>
              <span className="text-ink-secondary text-xs">{showChecker ? "▲" : "▼"}</span>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[11px] text-ink-secondary">
                <span>اكتمال الحقول</span><span className="font-bold">{completePct}%</span>
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
            {showChecker && (
              <div className="mt-3 space-y-1.5">
                {checks.map((c, i) => {
                  const styles = { ok: "bg-emerald-50 border-emerald-200 text-emerald-800", warning: "bg-amber-50 border-amber-200 text-amber-800", missing: "bg-rose-50 border-rose-200 text-rose-800" };
                  const icon   = c.status === "ok" ? "✅" : c.status === "warning" ? "⚠️" : "❌";
                  return (
                    <div key={i} className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${styles[c.status]}`}>
                      <span className="shrink-0 font-bold">{icon}</span>
                      <div>
                        <span className="font-bold">{c.label}</span>
                        {c.hint && <span className="mr-1 opacity-75"> — {c.hint}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 no-print">
            <button onClick={() => setActiveTab("preview")}
              className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-3 transition-all">
              👁 معاينة أمر الشراء
            </button>
            <button onClick={handlePrint}
              className="flex-1 rounded-xl border border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-extrabold text-sm py-3 transition-all">
              🖨 طباعة / PDF
            </button>
            <button onClick={handleOpenInvoice}
              className="rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold text-sm px-5 py-3 transition-all whitespace-nowrap">
              🧾 فتح مولد الفاتورة
            </button>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">ملاحظة: </span>
            أمر الشراء ليس فاتورة ضريبية. لإصدار فاتورة ضريبية معتمدة استخدم مولد الفاتورة الضريبية الإماراتي — بعد قبول المورد لأمر الشراء وإتمام التوريد.
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

          {/* A4 Document */}
          <div id="po-print"
            className="bg-white rounded-2xl border border-slate-300 shadow-xl print:shadow-none print:border-0 print:rounded-none print:m-0 overflow-hidden">

            {/* Header */}
            <div className="bg-indigo-700 px-8 py-6 print:bg-indigo-700" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white text-2xl font-black">أمر شراء</p>
                  <p className="text-indigo-200 text-sm font-semibold">PURCHASE ORDER</p>
                  {poDetails.status && (
                    <span className={`mt-2 inline-block rounded-full text-[10px] font-black px-3 py-0.5 border ${STATUS_OPTIONS.find(s => s.id === poDetails.status)?.style || ""}`}>
                      {STATUS_OPTIONS.find(s => s.id === poDetails.status)?.label}
                    </span>
                  )}
                </div>
                <div className="text-right" dir="ltr">
                  <p className="text-indigo-200 text-xs">رقم أمر الشراء / PO No.</p>
                  <p className="text-white font-black text-lg">{poDetails.poNumber || "—"}</p>
                  {poDetails.quoteRef && <p className="text-indigo-300 text-xs mt-0.5">Quote Ref: {poDetails.quoteRef}</p>}
                  {poDetails.projectRef && <p className="text-indigo-300 text-xs">Project: {poDetails.projectRef}</p>}
                  <p className="text-indigo-200 text-xs mt-1">{poDetails.currency}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-6 text-xs" dir="ltr">
                <div>
                  <span className="text-indigo-300">التاريخ / Date: </span>
                  <span className="text-white font-bold">{poDetails.issueDate || "—"}</span>
                </div>
                {poDetails.deliveryDate && (
                  <div>
                    <span className="text-indigo-300">التسليم / Delivery: </span>
                    <span className="text-white font-bold">{poDetails.deliveryDate}</span>
                  </div>
                )}
                {poDetails.requestedBy && (
                  <div>
                    <span className="text-indigo-300">Requested By: </span>
                    <span className="text-white font-bold">{poDetails.requestedBy}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6" dir="rtl">

              {/* Buyer + Supplier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wide mb-2">المشتري · Buyer</p>
                  <p className="font-extrabold text-ink text-sm">{buyer.name || "—"}</p>
                  {buyer.contactPerson && <p className="text-xs text-ink-secondary mt-0.5">{buyer.contactPerson}</p>}
                  {buyer.address && <p className="text-xs text-ink-secondary">{buyer.address}</p>}
                  {buyer.emirate && <p className="text-xs text-ink-secondary">{buyer.emirate}، الإمارات</p>}
                  {buyer.phone && <p className="text-xs text-ink-secondary" dir="ltr">{buyer.phone}</p>}
                  {buyer.email && <p className="text-xs text-ink-secondary" dir="ltr">{buyer.email}</p>}
                  {buyer.trn && <p className="text-[10px] text-ink-muted mt-1">TRN: <span dir="ltr">{buyer.trn}</span></p>}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-wide mb-2">المورد · Supplier</p>
                  <p className="font-extrabold text-ink text-sm">{supplier.name || "—"}</p>
                  {supplier.contactPerson && <p className="text-xs text-ink-secondary mt-0.5">{supplier.contactPerson}</p>}
                  {supplier.address && <p className="text-xs text-ink-secondary">{supplier.address}</p>}
                  {supplier.emirate && <p className="text-xs text-ink-secondary">{supplier.emirate}، الإمارات</p>}
                  {supplier.phone && <p className="text-xs text-ink-secondary" dir="ltr">{supplier.phone}</p>}
                  {supplier.email && <p className="text-xs text-ink-secondary" dir="ltr">{supplier.email}</p>}
                  {supplier.trn && <p className="text-[10px] text-ink-muted mt-1">TRN: <span dir="ltr">{supplier.trn}</span></p>}
                </div>
              </div>

              {/* Line items table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-ink-secondary">
                      <th className="text-right p-2 font-extrabold">#</th>
                      <th className="text-right p-2 font-extrabold">الوصف / Description</th>
                      <th className="text-right p-2 font-extrabold">SKU</th>
                      <th className="text-right p-2 font-extrabold">الكمية / Qty</th>
                      <th className="text-right p-2 font-extrabold">الوحدة</th>
                      <th className="text-right p-2 font-extrabold">سعر الوحدة / Unit Price</th>
                      <th className="text-right p-2 font-extrabold">الخصم</th>
                      {poDetails.showVat && <th className="text-right p-2 font-extrabold">الضريبة / VAT</th>}
                      {poDetails.showVat && <th className="text-right p-2 font-extrabold">VAT</th>}
                      <th className="text-right p-2 font-extrabold">الإجمالي / Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lines.map((line, idx) => {
                      const calc    = lineCalcs[idx];
                      const rateObj = VAT_RATES.find(r => r.id === line.vatRateId) || VAT_RATES[0];
                      return (
                        <tr key={line.id} className="hover:bg-slate-50/50">
                          <td className="p-2 text-ink-muted">{idx + 1}</td>
                          <td className="p-2 font-medium text-ink">{line.name || "—"}</td>
                          <td className="p-2 text-ink-muted text-[11px]" dir="ltr">{line.sku || "—"}</td>
                          <td className="p-2 text-ink-secondary" dir="ltr">{line.qty}</td>
                          <td className="p-2 text-ink-muted">{line.unit}</td>
                          <td className="p-2 text-ink-secondary" dir="ltr">{fmt(parseNum(line.unitPrice))}</td>
                          <td className="p-2 text-rose-700" dir="ltr">{parseNum(line.discount) > 0 ? `(${fmt(parseNum(line.discount))})` : "—"}</td>
                          {poDetails.showVat && <td className="p-2"><span className={`rounded-full text-[10px] font-bold px-1.5 py-0.5 ${rateObj.color}`}>{rateObj.tag}</span></td>}
                          {poDetails.showVat && <td className="p-2 text-blue-700 font-medium" dir="ltr">{fmt(calc?.vatAmount)}</td>}
                          <td className="p-2 font-black text-ink" dir="ltr">{fmt(calc?.lineTotal)}</td>
                        </tr>
                      );
                    })}
                    {[charges.shipping, charges.installation, charges.custom].filter(c => parseNum(c.amount) > 0 && c.label).map((c, i) => (
                      <tr key={`charge-${i}`} className="bg-slate-50/30">
                        <td className="p-2 text-ink-muted">—</td>
                        <td className="p-2 text-ink-secondary italic">{c.label}</td>
                        <td colSpan={poDetails.showVat ? 7 : 5} />
                        <td className="p-2 font-bold text-ink" dir="ltr">{fmt(parseNum(c.amount))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full sm:w-72 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                  {[
                    { label: "المجموع الفرعي / Subtotal", val: totals.grossTotal },
                    totals.totalDiscount > 0 && { label: "الخصومات / Discounts", val: -totals.totalDiscount, neg: true },
                    poDetails.showVat && totals.taxable5 > 0 && { label: "خاضع 5%", val: totals.taxable5 },
                    poDetails.showVat && totals.taxable0 > 0 && { label: "صفري 0%", val: totals.taxable0 },
                    poDetails.showVat && totals.exemptTotal > 0 && { label: "معفاة", val: totals.exemptTotal },
                    poDetails.showVat && { label: "إجمالي الضريبة / Total VAT", val: totals.totalVat, bold: true },
                    totals.chargeTotal > 0 && { label: "رسوم إضافية / Charges", val: totals.chargeTotal },
                  ].filter(Boolean).map((row, i) => (
                    <div key={i} className={`flex justify-between px-4 py-2 text-xs ${row.bold ? "bg-blue-50 border-t border-blue-200" : "border-t border-slate-100 first:border-t-0"}`}>
                      <span className={row.bold ? "font-extrabold text-blue-800" : "text-ink-secondary"}>{row.label}</span>
                      <span className={`font-black ${row.neg ? "text-rose-700" : row.bold ? "text-blue-800" : "text-ink"}`} dir="ltr">
                        {row.neg ? "-" : ""}{fmt(Math.abs(row.val))} {poDetails.currency}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between px-4 py-3 bg-indigo-700 text-white">
                    <span className="text-sm font-extrabold">الإجمالي / Grand Total</span>
                    <span className="text-sm font-black" dir="ltr">{fmt(totals.grandTotal)} {poDetails.currency}</span>
                  </div>
                </div>
              </div>

              {/* Delivery & payment terms */}
              {(delivery.address || delivery.paymentTerms || delivery.instructions || delivery.warranty || delivery.returns) && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
                  <p className="text-xs font-extrabold text-ink border-b border-slate-200 pb-2">شروط التسليم والدفع / Delivery & Payment Terms</p>
                  <div className="grid gap-1.5 sm:grid-cols-2 text-xs text-ink-secondary">
                    {delivery.address      && <p className="sm:col-span-2"><span className="font-bold text-ink">عنوان التسليم: </span>{delivery.address}</p>}
                    {delivery.paymentTerms && <p><span className="font-bold text-ink">الدفع: </span>{delivery.paymentTerms}</p>}
                    {delivery.paymentMethod && <p><span className="font-bold text-ink">طريقة الدفع: </span>{delivery.paymentMethod}</p>}
                    {delivery.instructions && <p className="sm:col-span-2"><span className="font-bold text-ink">تعليمات التسليم: </span>{delivery.instructions}</p>}
                    {delivery.warranty     && <p><span className="font-bold text-ink">الضمان: </span>{delivery.warranty}</p>}
                    {delivery.returns      && <p><span className="font-bold text-ink">الإرجاع: </span>{delivery.returns}</p>}
                  </div>
                </div>
              )}

              {/* Notes */}
              {delivery.notes && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold text-ink-muted mb-1">ملاحظات / Notes</p>
                  <p className="text-xs text-ink-secondary leading-relaxed">{delivery.notes}</p>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { ar: "إعداد", en: "Prepared By",   name: buyer.contactPerson || buyer.name },
                  { ar: "اعتماد", en: "Approved By",  name: "" },
                  { ar: "إقرار المورد", en: "Supplier Acknowledgement", name: supplier.name },
                ].map((sig, i) => (
                  <div key={i} className="text-center">
                    <div className="border-b-2 border-slate-300 mb-2 h-10" />
                    <p className="text-xs font-bold text-ink-secondary">{sig.ar} / {sig.en}</p>
                    {sig.name && <p className="text-[10px] text-ink-muted">{sig.name}</p>}
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-center">
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  هذا أمر شراء تجاري وليس فاتورة ضريبية — غير مرتبط بالهيئة الاتحادية للضرائب (FTA) ولا يحمل اعتمادها.
                  This is a commercial Purchase Order, not a Tax Invoice. Not affiliated with or approved by the UAE FTA.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
