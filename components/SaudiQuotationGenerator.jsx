"use client";

/**
 * components/SaudiQuotationGenerator.jsx
 * Ink & Signal: Saudi quotation generator.
 * All calculation, draft, and invoice-handoff logic is unchanged, except:
 *  - the draft-restore bug fix (duplicate line ids, see _lineId)
 *  - Ink & Signal styling is local (the inputCls/selectCls/labelCls/stepBadgeCls
 *    imports from businessUtils are no longer used here)
 */
import { useState, useMemo, useCallback } from "react";
import {
  formatSAR as fmt,
  parseNum,
  calcLineVat,
  discountExceedsGross,
  isValidSaudiVatNumber,
} from "@/lib/businessUtils";
import PrintWrapper from "@/components/business/PrintWrapper";
import LegalDisclaimer from "@/components/business/LegalDisclaimer";

// ─── Constants ─────────────────────────────────────────────────────────────────

const DRAFT_KEY   = "saudi_quotation_draft_v1";
const PREFILL_KEY = "saudi_invoice_prefill_v1";

const VAT_RATES = [
  { id: "15",     label: "خاضعة للضريبة",   rate: 0.15, tag: "15%" },
  { id: "0",      label: "صفرية المعدل",     rate: 0,    tag: "0%" },
  { id: "exempt", label: "معفاة من الضريبة", rate: null, tag: "معفاة" },
  { id: "out",    label: "خارج نطاق الضريبة", rate: null, tag: "خ.ن" },
  { id: "none",   label: "بدون ضريبة",       rate: null, tag: "—" },
];

const SAUDI_CITIES = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الظهران",
  "أبها", "تبوك", "القصيم", "بريدة", "الطائف", "نجران", "حائل", "الجبيل", "ينبع",
];

const UNITS = ["وحدة", "ساعة", "يوم", "شهر", "متر", "كغ", "طن", "قطعة", "متر مربع", "نسخة"];

const QUICK_TEMPLATES = [
  { id: "web", label: "تطوير موقع", lines: [
    { name: "تصميم واجهة الموقع (UI/UX)", qty: "1", unit: "مشروع", unitPrice: "4000", discount: "0", vatRateId: "15" },
    { name: "تطوير وبرمجة الموقع", qty: "1", unit: "مشروع", unitPrice: "6000", discount: "500", vatRateId: "15" },
    { name: "استضافة سنوية + دومين", qty: "1", unit: "سنة", unitPrice: "800", discount: "0", vatRateId: "15" },
  ]},
  { id: "design", label: "تصميم", lines: [
    { name: "تصميم هوية بصرية (شعار + ألوان + خطوط)", qty: "1", unit: "مشروع", unitPrice: "3500", discount: "0", vatRateId: "15" },
    { name: "تصميم مواد تسويقية (بروشور + بوستر)", qty: "1", unit: "مجموعة", unitPrice: "1800", discount: "0", vatRateId: "15" },
  ]},
  { id: "marketing", label: "تسويق رقمي", lines: [
    { name: "إدارة حسابات التواصل الاجتماعي", qty: "3", unit: "شهر", unitPrice: "2500", discount: "0", vatRateId: "15" },
    { name: "إعداد وتنفيذ حملة إعلانية", qty: "1", unit: "حملة", unitPrice: "5000", discount: "0", vatRateId: "15" },
  ]},
  { id: "consulting", label: "استشارات", lines: [
    { name: "جلسة استشارية أولى", qty: "2", unit: "ساعة", unitPrice: "600", discount: "0", vatRateId: "15" },
    { name: "إعداد تقرير تحليلي تفصيلي", qty: "1", unit: "تقرير", unitPrice: "3000", discount: "0", vatRateId: "15" },
  ]},
  { id: "construction", label: "مقاولات", lines: [
    { name: "أعمال بناء وتشطيب", qty: "100", unit: "متر مربع", unitPrice: "350", discount: "0", vatRateId: "15" },
    { name: "توريد مواد البناء", qty: "1", unit: "مجموعة", unitPrice: "12000", discount: "500", vatRateId: "15" },
  ]},
  { id: "supply", label: "توريد منتجات", lines: [
    { name: "توريد معدات مكتبية", qty: "10", unit: "قطعة", unitPrice: "450", discount: "0", vatRateId: "15" },
    { name: "توريد أجهزة حاسوب محمول", qty: "5", unit: "جهاز", unitPrice: "4000", discount: "200", vatRateId: "15" },
  ]},
  { id: "maintenance", label: "صيانة", lines: [
    { name: "صيانة دورية شهرية", qty: "6", unit: "شهر", unitPrice: "1500", discount: "0", vatRateId: "15" },
    { name: "قطع غيار وتوريدات", qty: "1", unit: "مجموعة", unitPrice: "3000", discount: "0", vatRateId: "15" },
  ]},
];

const STATUS_OPTIONS = [
  { id: "",         label: "بدون حالة" },
  { id: "draft",    label: "مسودة" },
  { id: "sent",     label: "مرسل" },
  { id: "accepted", label: "مقبول" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

let _lineId = 200;
const newLineId = () => ++_lineId;

const emptyLine = () => ({
  id: newLineId(),
  name: "", qty: "1", unit: "وحدة", unitPrice: "", discount: "0", vatRateId: "15",
});

function generateQuoteNumber() {
  const y = new Date().getFullYear();
  const n = String(Math.floor(Math.random() * 9000) + 1000);
  return `QT-SA-${y}-${n}`;
}

const today  = () => new Date().toISOString().split("T")[0];
const plus15 = () => { const d = new Date(); d.setDate(d.getDate() + 15); return d.toISOString().split("T")[0]; };

const defaultSeller = () => ({
  name: "", contactPerson: "", address: "", city: "الرياض",
  phone: "", email: "", website: "", vatNumber: "",
});
const defaultCustomer = () => ({
  name: "", contactPerson: "", address: "", city: "",
  phone: "", email: "", vatNumber: "",
});
const defaultDetails = () => ({
  quoteNumber: generateQuoteNumber(),
  issueDate:   today(),
  validUntil:  plus15(),
  currency:    "SAR",
  projectRef:  "",
  status:      "",
  showVat:     true,
});
const defaultTerms = () => ({
  validity:     "صالح لمدة 15 يوماً من تاريخ الإصدار",
  payment:      "50% مقدماً و50% عند الإنجاز",
  delivery:     "",
  warranty:     "",
  exclusions:   "",
  cancellation: "",
  notes:        "",
});
const defaultFees = () => ({
  delivery: { label: "رسوم التوصيل", amount: "" },
  service:  { label: "رسوم الخدمة",  amount: "" },
  custom:   { label: "",              amount: "" },
});

// ─── Small UI pieces ───────────────────────────────────────────────────────────

function Field({ id, label, hint, span, children }) {
  return (
    <div className={`qg-field ${span ? "qg-span" : ""}`}>
      <label htmlFor={id} className="qg-label">
        {label}{hint && <span className="qg-hint"> {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function TextField({ id, label, hint, span, value, onChange, area = false, ...rest }) {
  return (
    <Field id={id} label={label} hint={hint} span={span}>
      {area ? (
        <textarea id={id} className="qg-input" rows={2} value={value}
          onChange={(e) => onChange(e.target.value)} {...rest} />
      ) : (
        <input id={id} className="qg-input" value={value}
          onChange={(e) => onChange(e.target.value)} {...rest} />
      )}
    </Field>
  );
}

function SelectField({ id, label, span, value, onChange, children }) {
  return (
    <Field id={id} label={label} span={span}>
      <select id={id} className="qg-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </Field>
  );
}

function VatField({ id, label, hint, value, onChange, showResult = false }) {
  const has = Boolean(value);
  const ok = has && isValidSaudiVatNumber(value);
  return (
    <Field id={id} label={label} hint={hint}>
      <input
        id={id}
        className="qg-input"
        placeholder="3XXXXXXXXXXXXXX"
        dir="ltr"
        maxLength={15}
        inputMode="numeric"
        value={value}
        aria-invalid={has && !ok}
        aria-describedby={has ? `${id}-msg` : undefined}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      />
      {has && !ok && <p id={`${id}-msg`} className="qg-err">يجب أن يكون 15 رقماً ويبدأ بالرقم 3</p>}
      {showResult && ok && <p id={`${id}-msg`} className="qg-ok">صالح شكلياً. التحقق الرسمي عبر بوابة ZATCA</p>}
    </Field>
  );
}

function StepTitle({ n, id, children }) {
  return (
    <h2 id={id} className="qg-h2">
      <span className="qg-num" aria-hidden="true">{n}</span>
      {children}
    </h2>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function SaudiQuotationGenerator() {
  const [seller,        setSeller]        = useState(defaultSeller);
  const [customer,      setCustomer]      = useState(defaultCustomer);
  const [details,       setDetails]       = useState(defaultDetails);
  const [lines,         setLines]         = useState([emptyLine()]);
  const [fees,          setFees]          = useState(defaultFees);
  const [terms,         setTerms]         = useState(defaultTerms);
  const [activeTab,     setActiveTab]     = useState("form");
  const [draftMsg,      setDraftMsg]      = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  const flash = (msg) => { setDraftMsg(msg); setTimeout(() => setDraftMsg(""), 3000); };

  // ── Draft save / restore ──────────────────────────────────────────────────────
  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ seller, customer, details, lines, fees, terms }));
      flash("تم حفظ المسودة على هذا الجهاز");
    } catch { flash("تعذّر الحفظ"); }
  }, [seller, customer, details, lines, fees, terms]);

  const restoreDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) { flash("لا توجد مسودة محفوظة"); return; }
      const d = JSON.parse(raw);
      if (d.seller)   setSeller(d.seller);
      if (d.customer) setCustomer(d.customer);
      if (d.details)  setDetails(d.details);
      if (d.lines) {
        // keep new ids above restored ids (otherwise duplicate keys after reload)
        _lineId = Math.max(_lineId, ...d.lines.map((l) => Number(l.id) || 0));
        setLines(d.lines);
      }
      if (d.fees)     setFees(d.fees);
      if (d.terms)    setTerms(d.terms);
      flash("تمت استعادة المسودة");
    } catch { flash("تعذّرت الاستعادة"); }
  }, []);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    flash("تم مسح المسودة");
  }, []);

  // ── Line helpers ──────────────────────────────────────────────────────────────
  const updateLine = (id, field, value) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  const addLine    = () => setLines((ls) => [...ls, emptyLine()]);
  const removeLine = (id) => setLines((ls) => (ls.length > 1 ? ls.filter((l) => l.id !== id) : ls));
  const duplicateLine = (id) => {
    const src = lines.find((l) => l.id === id);
    if (!src) return;
    const dup = { ...src, id: newLineId() };
    setLines((ls) => {
      const idx = ls.findIndex((l) => l.id === id);
      const next = [...ls]; next.splice(idx + 1, 0, dup); return next;
    });
  };

  const applyTemplate = (tpl) => {
    setLines(tpl.lines.map((l) => ({ ...l, id: newLineId() })));
    setShowTemplates(false);
  };

  const handleReset = () => {
    setSeller(defaultSeller());   setCustomer(defaultCustomer());
    setDetails(defaultDetails()); setLines([emptyLine()]);
    setFees(defaultFees());       setTerms(defaultTerms());
    setActiveTab("form");
  };

  const handlePrint = () => { setActiveTab("preview"); setTimeout(() => window.print(), 300); };

  // ── Calculations (unchanged) ──────────────────────────────────────────────────
  const { lineCalcs, totals } = useMemo(() => {
    const lineCalcs = lines.map((l) => {
      const rateObj       = VAT_RATES.find((r) => r.id === l.vatRateId) || VAT_RATES[0];
      const effectiveRate = details.showVat ? rateObj.rate : null;
      const result        = calcLineVat({ qty: l.qty, unitPrice: l.unitPrice, discount: l.discount, vatRate: effectiveRate });
      return { ...result, rateObj };
    });

    const feeTotal      = parseNum(fees.delivery.amount) + parseNum(fees.service.amount) + parseNum(fees.custom.amount);
    const grossTotal    = lineCalcs.reduce((s, l) => s + l.gross, 0);
    const totalDiscount = lineCalcs.reduce((s, l) => s + l.discount, 0);
    const taxable15     = lineCalcs.filter((l) => l.rateObj.id === "15").reduce((s, l) => s + l.taxableBase, 0);
    const taxable0      = lineCalcs.filter((l) => l.rateObj.id === "0").reduce((s, l) => s + l.taxableBase, 0);
    const exemptTotal   = lineCalcs.filter((l) => l.rateObj.id === "exempt").reduce((s, l) => s + l.taxableBase, 0);
    const outTotal      = lineCalcs.filter((l) => l.rateObj.id === "out").reduce((s, l) => s + l.taxableBase, 0);
    const totalVat      = lineCalcs.reduce((s, l) => s + l.vatAmount, 0);
    const grandTotal    = lineCalcs.reduce((s, l) => s + l.lineTotal, 0) + feeTotal;

    return { lineCalcs, totals: { grossTotal, totalDiscount, taxable15, taxable0, exemptTotal, outTotal, totalVat, totalFees: feeTotal, grandTotal } };
  }, [lines, fees, details.showVat]);

  // ── Convert to SA invoice (unchanged) ─────────────────────────────────────────
  const handleConvertToInvoice = () => {
    try {
      const payload = {
        seller: {
          name: seller.name, vatNumber: seller.vatNumber, cr: "",
          address: seller.address, city: seller.city, country: "المملكة العربية السعودية",
        },
        buyer: {
          name: customer.name, vatNumber: customer.vatNumber,
          address: customer.address ? `${customer.address}${customer.city ? "، " + customer.city : ""}` : customer.city,
        },
        invoiceDetails: {
          invoiceNumber: details.quoteNumber.replace("QT-SA-", "INV-SA-").replace("QT-", "INV-"),
          issueDate: details.issueDate, issueTime: "", supplyDate: details.issueDate,
          currency: details.currency, notes: terms.notes,
        },
        lines: lines.map((l) => ({
          id: l.id, name: l.name, desc: "", qty: l.qty,
          unitPrice: l.unitPrice, vatRateId: l.vatRateId, discount: l.discount,
        })),
        invoiceType: "tax",
      };
      localStorage.setItem(PREFILL_KEY, JSON.stringify(payload));
    } catch { /* silent: link still works */ }
    window.open("/ar/sa/e-invoice-generator", "_blank");
  };

  const cur = details.currency;
  const statusLabel = STATUS_OPTIONS.find((s) => s.id === details.status)?.label;

  const totalRows = (bi) => [
    { label: bi ? "المجموع الفرعي / Subtotal" : "المجموع قبل الخصم", val: totals.grossTotal },
    totals.totalDiscount > 0 && { label: bi ? "الخصومات / Discounts" : "إجمالي الخصومات", val: -totals.totalDiscount },
    details.showVat && totals.taxable15 > 0   && { label: bi ? "خاضع 15% / Taxable 15%" : "القيمة الخاضعة لـ 15%", val: totals.taxable15 },
    details.showVat && totals.taxable0 > 0    && { label: bi ? "صفري / Zero-rated" : "القيمة الخاضعة لـ 0%", val: totals.taxable0 },
    details.showVat && totals.exemptTotal > 0 && { label: bi ? "معفاة / Exempt" : "القيمة المعفاة", val: totals.exemptTotal },
    details.showVat && totals.outTotal > 0    && { label: bi ? "خارج النطاق / Out of scope" : "خارج النطاق الضريبي", val: totals.outTotal },
    details.showVat && { label: bi ? "إجمالي الضريبة / Total VAT" : "إجمالي ضريبة القيمة المضافة", val: totals.totalVat, bold: true },
    totals.totalFees > 0 && { label: bi ? "رسوم إضافية / Fees" : "إجمالي الرسوم الإضافية", val: totals.totalFees },
  ].filter(Boolean);

  const TotalRows = ({ bi }) =>
    totalRows(bi).map((r, i) => (
      <div key={i} className={`qg-trow ${r.bold ? "qg-trow-b" : ""}`}>
        <span>{r.label}</span>
        <span className="qg-ltr">{r.val < 0 ? "-" : ""}{fmt(Math.abs(r.val))} {cur}</span>
      </div>
    ));

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="qg-root" dir="rtl">
      <QuoteStyles />

      {/* ── Header ── */}
      <header className="qg-card qg-noprint">
        <div className="qg-head-row">
          <div>
            <h1 className="qg-h1">مولد عرض السعر في السعودية</h1>
            <p className="qg-lead">
              أنشئ عرض سعر احترافي بالعربية والإنجليزية للمستقلين والشركات والمتاجر والمقاولين في المملكة
            </p>
          </div>
          <div className="qg-actions">
            <button type="button" className="qg-btn qg-btn-o" aria-expanded={showTemplates}
              onClick={() => setShowTemplates((v) => !v)}>قوالب سريعة</button>
            <button type="button" className="qg-btn qg-btn-o" onClick={handleReset}>مسح</button>
          </div>
        </div>

        {showTemplates && (
          <div className="qg-dash">
            <p className="qg-small-b">اختر قالباً لتعبئة بنود توضيحية (مثال فقط، راجع قبل الإرسال)</p>
            <div className="qg-actions">
              {QUICK_TEMPLATES.map((t) => (
                <button key={t.id} type="button" className="qg-btn qg-btn-o qg-btn-sm"
                  onClick={() => applyTemplate(t)}>{t.label}</button>
              ))}
            </div>
          </div>
        )}

        <div className="qg-actions qg-draft">
          <button type="button" className="qg-btn qg-btn-o qg-btn-sm" onClick={saveDraft}>حفظ المسودة</button>
          <button type="button" className="qg-btn qg-btn-o qg-btn-sm" onClick={restoreDraft}>استعادة آخر مسودة</button>
          <button type="button" className="qg-btn qg-btn-o qg-btn-sm" onClick={clearDraft}>مسح المسودة</button>
          <span className="qg-small" role="status" aria-live="polite">{draftMsg}</span>
          <span className="qg-small qg-push">محفوظ على هذا الجهاز فقط</span>
        </div>

        <div className="qg-tabs" role="group" aria-label="العرض">
          <button type="button" aria-pressed={activeTab === "form"} onClick={() => setActiveTab("form")}>إدخال البيانات</button>
          <button type="button" aria-pressed={activeTab === "preview"} onClick={() => setActiveTab("preview")}>معاينة عرض السعر</button>
        </div>
      </header>

      {/* ══════════════ FORM TAB ══════════════ */}
      {activeTab === "form" && (
        <div className="qg-stack qg-noprint">

          {/* 1 — Quote details */}
          <section className="qg-card" aria-labelledby="qg-s1">
            <StepTitle n="1" id="qg-s1">بيانات عرض السعر</StepTitle>
            <div className="qg-two">
              <TextField id="qg-qno" label="رقم عرض السعر *" placeholder="QT-SA-2026-0001" dir="ltr"
                value={details.quoteNumber} onChange={(v) => setDetails((d) => ({ ...d, quoteNumber: v }))} />
              <SelectField id="qg-cur" label="العملة" value={details.currency}
                onChange={(v) => setDetails((d) => ({ ...d, currency: v }))}>
                <option value="SAR">ريال سعودي — SAR</option>
                <option value="USD">دولار أمريكي — USD</option>
                <option value="EUR">يورو — EUR</option>
                <option value="AED">درهم إماراتي — AED</option>
                <option value="GBP">جنيه استرليني — GBP</option>
              </SelectField>
              <TextField id="qg-issue" label="تاريخ الإصدار *" type="date" dir="ltr"
                value={details.issueDate} onChange={(v) => setDetails((d) => ({ ...d, issueDate: v }))} />
              <TextField id="qg-valid" label="صالح حتى تاريخ" type="date" dir="ltr"
                value={details.validUntil} onChange={(v) => setDetails((d) => ({ ...d, validUntil: v }))} />
              <TextField id="qg-ref" label="رقم المشروع / المرجع (اختياري)" placeholder="PRJ-001" dir="ltr"
                value={details.projectRef} onChange={(v) => setDetails((d) => ({ ...d, projectRef: v }))} />
              <SelectField id="qg-status" label="حالة عرض السعر (اختياري)" value={details.status}
                onChange={(v) => setDetails((d) => ({ ...d, status: v }))}>
                {STATUS_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </SelectField>
            </div>

            <div className="qg-dash qg-vat-row">
              <div>
                <p className="qg-small-b">هل تريد إظهار ضريبة القيمة المضافة (15%)؟</p>
                <p className="qg-small">إضافة ضريبة القيمة المضافة إلى عرض السعر لا تجعل المستند فاتورة ضريبية</p>
              </div>
              <div className="qg-seg" role="group" aria-label="إظهار ضريبة القيمة المضافة">
                <button type="button" aria-pressed={details.showVat}
                  onClick={() => setDetails((d) => ({ ...d, showVat: true }))}>نعم</button>
                <button type="button" aria-pressed={!details.showVat}
                  onClick={() => setDetails((d) => ({ ...d, showVat: false }))}>لا</button>
              </div>
            </div>
          </section>

          {/* 2 — Seller */}
          <section className="qg-card" aria-labelledby="qg-s2">
            <StepTitle n="2" id="qg-s2">بيانات منشأتك (المُعِد)</StepTitle>
            <div className="qg-two">
              <TextField id="qg-sname" span label="اسم المنشأة / المستقل *" placeholder="شركة الرؤية للحلول الرقمية"
                value={seller.name} onChange={(v) => setSeller((s) => ({ ...s, name: v }))} />
              <TextField id="qg-scontact" label="اسم جهة الاتصال (اختياري)" placeholder="أحمد العمري"
                value={seller.contactPerson} onChange={(v) => setSeller((s) => ({ ...s, contactPerson: v }))} />
              <SelectField id="qg-scity" label="المدينة *" value={seller.city}
                onChange={(v) => setSeller((s) => ({ ...s, city: v }))}>
                {SAUDI_CITIES.map((c) => <option key={c}>{c}</option>)}
              </SelectField>
              <TextField id="qg-saddr" span label="العنوان" placeholder="طريق الملك فهد، حي الصحافة"
                value={seller.address} onChange={(v) => setSeller((s) => ({ ...s, address: v }))} />
              <TextField id="qg-sphone" label="الهاتف" type="tel" placeholder="+966 5x xxx xxxx" dir="ltr"
                value={seller.phone} onChange={(v) => setSeller((s) => ({ ...s, phone: v }))} />
              <TextField id="qg-semail" label="البريد الإلكتروني" type="email" placeholder="info@company.sa" dir="ltr"
                value={seller.email} onChange={(v) => setSeller((s) => ({ ...s, email: v }))} />
              <TextField id="qg-sweb" label="الموقع الإلكتروني (اختياري)" type="url" placeholder="www.company.sa" dir="ltr"
                value={seller.website} onChange={(v) => setSeller((s) => ({ ...s, website: v }))} />
              <VatField id="qg-svat" label="الرقم الضريبي (اختياري)"
                hint="(15 رقماً يبدأ بـ 3. تحقق شكلي فقط ولا يعني التحقق من التسجيل لدى ZATCA)"
                value={seller.vatNumber} onChange={(v) => setSeller((s) => ({ ...s, vatNumber: v }))} showResult />
            </div>
          </section>

          {/* 3 — Customer */}
          <section className="qg-card" aria-labelledby="qg-s3">
            <StepTitle n="3" id="qg-s3">بيانات العميل</StepTitle>
            <div className="qg-two">
              <TextField id="qg-cname" span label="اسم العميل / الشركة *" placeholder="شركة آفاق للتجارة والمقاولات"
                value={customer.name} onChange={(v) => setCustomer((c) => ({ ...c, name: v }))} />
              <TextField id="qg-ccontact" label="اسم جهة الاتصال" placeholder="محمد الشمري"
                value={customer.contactPerson} onChange={(v) => setCustomer((c) => ({ ...c, contactPerson: v }))} />
              <SelectField id="qg-ccity" label="المدينة" value={customer.city}
                onChange={(v) => setCustomer((c) => ({ ...c, city: v }))}>
                <option value="">— اختر —</option>
                {SAUDI_CITIES.map((city) => <option key={city}>{city}</option>)}
              </SelectField>
              <TextField id="qg-caddr" span label="العنوان" placeholder="طريق المدينة، حي الشاطئ، جدة"
                value={customer.address} onChange={(v) => setCustomer((c) => ({ ...c, address: v }))} />
              <TextField id="qg-cphone" label="الهاتف" type="tel" placeholder="+966 5x xxx xxxx" dir="ltr"
                value={customer.phone} onChange={(v) => setCustomer((c) => ({ ...c, phone: v }))} />
              <TextField id="qg-cemail" label="البريد الإلكتروني" type="email" placeholder="client@company.sa" dir="ltr"
                value={customer.email} onChange={(v) => setCustomer((c) => ({ ...c, email: v }))} />
              <VatField id="qg-cvat" label="الرقم الضريبي (اختياري)"
                value={customer.vatNumber} onChange={(v) => setCustomer((c) => ({ ...c, vatNumber: v }))} />
            </div>
          </section>

          {/* 4 — Line items */}
          <section className="qg-card" aria-labelledby="qg-s4">
            <StepTitle n="4" id="qg-s4">البنود والخدمات</StepTitle>
            <div className="qg-stack">
              {lines.map((line, idx) => {
                const calc    = lineCalcs[idx];
                const rateObj = VAT_RATES.find((r) => r.id === line.vatRateId) || VAT_RATES[0];
                const overDisc = discountExceedsGross(line.qty, line.unitPrice, line.discount);
                const k = `qg-l${line.id}`;
                return (
                  <fieldset key={line.id} className="qg-line">
                    <legend className="qg-legend">بند {idx + 1}</legend>
                    <div className="qg-line-top qg-actions">
                      <button type="button" className="qg-link" aria-label={`تكرار البند ${idx + 1}`}
                        onClick={() => duplicateLine(line.id)}>تكرار</button>
                      {lines.length > 1 && (
                        <button type="button" className="qg-link" aria-label={`حذف البند ${idx + 1}`}
                          onClick={() => removeLine(line.id)}>حذف</button>
                      )}
                    </div>

                    <div className="qg-line-grid">
                      <div className="qg-c3">
                        <TextField id={`${k}-name`} label="الوصف / اسم السلعة أو الخدمة *" placeholder="تطوير موقع إلكتروني"
                          value={line.name} onChange={(v) => updateLine(line.id, "name", v)} />
                      </div>
                      <TextField id={`${k}-qty`} label="الكمية" type="number" min="0" step="any" placeholder="1" dir="ltr"
                        value={line.qty} onChange={(v) => updateLine(line.id, "qty", v)} />
                      <SelectField id={`${k}-unit`} label="الوحدة" value={line.unit}
                        onChange={(v) => updateLine(line.id, "unit", v)}>
                        {UNITS.map((u) => <option key={u}>{u}</option>)}
                      </SelectField>
                      <TextField id={`${k}-price`} label={`سعر الوحدة (${cur})`} type="number" min="0" step="any"
                        placeholder="0.00" dir="ltr"
                        value={line.unitPrice} onChange={(v) => updateLine(line.id, "unitPrice", v)} />
                    </div>

                    <div className="qg-line-grid3">
                      <Field id={`${k}-disc`} label={`الخصم (${cur})`}>
                        <input id={`${k}-disc`} className="qg-input" type="number" min="0" step="any" placeholder="0" dir="ltr"
                          aria-invalid={overDisc} aria-describedby={overDisc ? `${k}-disc-msg` : undefined}
                          value={line.discount} onChange={(e) => updateLine(line.id, "discount", e.target.value)} />
                        {overDisc && <p id={`${k}-disc-msg`} className="qg-err">الخصم يتجاوز قيمة البند</p>}
                      </Field>
                      {details.showVat && (
                        <SelectField id={`${k}-vat`} label="نسبة الضريبة" value={line.vatRateId}
                          onChange={(v) => updateLine(line.id, "vatRateId", v)}>
                          {VAT_RATES.map((r) => <option key={r.id} value={r.id}>{r.tag} — {r.label}</option>)}
                        </SelectField>
                      )}
                      {parseNum(line.unitPrice) > 0 && (
                        <dl className="qg-mini">
                          <div><dt>قبل الخصم</dt><dd className="qg-ltr">{fmt(calc?.gross)} {cur}</dd></div>
                          {details.showVat && <div><dt>الضريبة ({rateObj.tag})</dt><dd className="qg-ltr">{fmt(calc?.vatAmount)}</dd></div>}
                          <div className="qg-mini-t"><dt>الإجمالي</dt><dd className="qg-ltr">{fmt(calc?.lineTotal)}</dd></div>
                        </dl>
                      )}
                    </div>
                  </fieldset>
                );
              })}
            </div>
            <button type="button" className="qg-add" onClick={addLine}>+ إضافة بند جديد</button>
          </section>

          {/* 5 — Fees */}
          <section className="qg-card" aria-labelledby="qg-s5">
            <StepTitle n="5" id="qg-s5">رسوم إضافية (اختياري)</StepTitle>
            <div className="qg-stack">
              {[
                { key: "delivery", placeholder: "رسوم التوصيل والشحن" },
                { key: "service",  placeholder: "رسوم الخدمة والتركيب" },
                { key: "custom",   placeholder: "رسوم إضافية أخرى..." },
              ].map(({ key, placeholder }) => (
                <div key={key} className="qg-two">
                  <TextField id={`qg-f-${key}-l`} label={key === "custom" ? "رسوم مخصصة (التسمية)" : "التسمية"}
                    placeholder={placeholder} value={fees[key].label}
                    onChange={(v) => setFees((f) => ({ ...f, [key]: { ...f[key], label: v } }))} />
                  <TextField id={`qg-f-${key}-a`} label={`المبلغ (${cur})`} type="number" min="0" step="any"
                    placeholder="0.00" dir="ltr" value={fees[key].amount}
                    onChange={(v) => setFees((f) => ({ ...f, [key]: { ...f[key], amount: v } }))} />
                </div>
              ))}
            </div>
          </section>

          {/* Totals */}
          <section className="qg-result" aria-live="polite" aria-labelledby="qg-tot">
            <h2 id="qg-tot" className="qg-result-h">ملخص الإجماليات</h2>
            <div className="qg-tbox">
              <TotalRows bi={false} />
            </div>
            <div className="qg-grand-row">
              <span>الإجمالي النهائي</span>
              <span className="qg-ltr">{fmt(totals.grandTotal)} {cur}</span>
            </div>
          </section>

          {/* 6 — Terms */}
          <section className="qg-card" aria-labelledby="qg-s6">
            <StepTitle n="6" id="qg-s6">الشروط والأحكام</StepTitle>
            <div className="qg-two">
              <TextField id="qg-t-validity" label="صلاحية عرض السعر" value={terms.validity}
                onChange={(v) => setTerms((t) => ({ ...t, validity: v }))} />
              <TextField id="qg-t-payment" label="شروط الدفع" value={terms.payment}
                onChange={(v) => setTerms((t) => ({ ...t, payment: v }))} />
              <TextField id="qg-t-delivery" label="موعد التسليم (اختياري)" placeholder="خلال 14 يوم عمل" value={terms.delivery}
                onChange={(v) => setTerms((t) => ({ ...t, delivery: v }))} />
              <TextField id="qg-t-warranty" label="الضمان (اختياري)" placeholder="ضمان 6 أشهر" value={terms.warranty}
                onChange={(v) => setTerms((t) => ({ ...t, warranty: v }))} />
              <TextField id="qg-t-excl" span label="الاستثناءات من النطاق (اختياري)" placeholder="لا تشمل رسوم الاستضافة السنوية"
                value={terms.exclusions} onChange={(v) => setTerms((t) => ({ ...t, exclusions: v }))} />
              <TextField id="qg-t-cancel" span label="شروط الإلغاء (اختياري)" placeholder="الدفعة المقدمة غير قابلة للاسترداد بعد بدء العمل"
                value={terms.cancellation} onChange={(v) => setTerms((t) => ({ ...t, cancellation: v }))} />
              <TextField id="qg-t-notes" span area label="ملاحظات إضافية" placeholder="أي معلومات إضافية للعميل..."
                value={terms.notes} onChange={(v) => setTerms((t) => ({ ...t, notes: v }))} />
            </div>
          </section>

          {/* Actions */}
          <div className="qg-actions qg-bottom">
            <button type="button" className="qg-btn qg-btn-p" onClick={() => setActiveTab("preview")}>معاينة عرض السعر</button>
            <button type="button" className="qg-btn qg-btn-o" onClick={handlePrint}>طباعة / PDF</button>
            <button type="button" className="qg-btn qg-btn-o" onClick={handleConvertToInvoice}>
              تحويل إلى فاتورة<span className="qg-sr"> (يفتح في نافذة جديدة)</span>
            </button>
          </div>

          <aside className="qg-note">
            <p className="qg-small-b">تحويل إلى فاتورة ضريبية سعودية</p>
            <p className="qg-small">
              يفتح مولد الفاتورة الإلكترونية السعودية مع نقل بيانات عرض السعر تلقائياً عبر التخزين المحلي.
              راجع بيانات الفاتورة قبل الإصدار. لا تُشكّل هذه الأداة حلاً لفوترة إلكترونية معتمداً من ZATCA.
            </p>
          </aside>
        </div>
      )}

      {/* ══════════════ PREVIEW TAB ══════════════ */}
      {activeTab === "preview" && (
        <>
          <div className="qg-actions qg-noprint qg-prev-bar">
            <button type="button" className="qg-btn qg-btn-o" onClick={() => setActiveTab("form")}>العودة للتعديل</button>
            <button type="button" className="qg-btn qg-btn-p" onClick={handlePrint}>طباعة / PDF</button>
          </div>

          <PrintWrapper id="quotation-print-sa">
            <div className="qg-doc">

              {/* Header band */}
              <div className="qg-doc-head">
                <div className="qg-doc-head-row">
                  <div>
                    <p className="qg-doc-title">عرض سعر</p>
                    <p className="qg-doc-sub">QUOTATION</p>
                    {statusLabel && details.status && <span className="qg-doc-status">{statusLabel}</span>}
                  </div>
                  <div className="qg-doc-meta" dir="ltr">
                    <p>رقم عرض السعر / Quotation No.</p>
                    <p className="qg-doc-no">{details.quoteNumber || "—"}</p>
                    {details.projectRef && <p>Ref: {details.projectRef}</p>}
                    <p>{cur} · المملكة العربية السعودية</p>
                  </div>
                </div>
                <div className="qg-doc-dates" dir="ltr">
                  <span>التاريخ / Date: <strong>{details.issueDate || "—"}</strong></span>
                  {details.validUntil && <span>صالح حتى / Valid Until: <strong>{details.validUntil}</strong></span>}
                </div>
              </div>

              <div className="qg-doc-body" dir="rtl">

                {/* Seller + Customer */}
                <div className="qg-doc-parties">
                  <div className="qg-doc-box">
                    <p className="qg-doc-cap">إعداد · Prepared By</p>
                    <p className="qg-doc-name">{seller.name || "—"}</p>
                    {seller.contactPerson && <p>{seller.contactPerson}</p>}
                    {seller.address && <p>{seller.address}</p>}
                    {seller.city && <p>{seller.city}، المملكة العربية السعودية</p>}
                    {seller.phone && <p dir="ltr">{seller.phone}</p>}
                    {seller.email && <p dir="ltr">{seller.email}</p>}
                    {seller.website && <p dir="ltr">{seller.website}</p>}
                    {seller.vatNumber && <p className="qg-doc-vat">الرقم الضريبي: <span dir="ltr">{seller.vatNumber}</span></p>}
                  </div>
                  <div className="qg-doc-box">
                    <p className="qg-doc-cap">مُقدَّم إلى · Prepared For</p>
                    <p className="qg-doc-name">{customer.name || "—"}</p>
                    {customer.contactPerson && <p>{customer.contactPerson}</p>}
                    {customer.address && <p>{customer.address}</p>}
                    {customer.city && <p>{customer.city}، المملكة العربية السعودية</p>}
                    {customer.phone && <p dir="ltr">{customer.phone}</p>}
                    {customer.email && <p dir="ltr">{customer.email}</p>}
                    {customer.vatNumber && <p className="qg-doc-vat">الرقم الضريبي: <span dir="ltr">{customer.vatNumber}</span></p>}
                  </div>
                </div>

                {/* Line items */}
                <div className="qg-doc-scroll">
                  <table className="qg-doc-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>الوصف / Description</th>
                        <th>الكمية / Qty</th>
                        <th>الوحدة</th>
                        <th>سعر الوحدة / Unit Price</th>
                        <th>الخصم / Discount</th>
                        {details.showVat && <th>نسبة الضريبة / VAT %</th>}
                        {details.showVat && <th>مبلغ الضريبة / VAT</th>}
                        <th>الإجمالي / Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, idx) => {
                        const calc    = lineCalcs[idx];
                        const rateObj = VAT_RATES.find((r) => r.id === line.vatRateId) || VAT_RATES[0];
                        return (
                          <tr key={line.id}>
                            <td>{idx + 1}</td>
                            <td className="qg-doc-strong">{line.name || "—"}</td>
                            <td dir="ltr">{line.qty}</td>
                            <td>{line.unit}</td>
                            <td dir="ltr">{fmt(parseNum(line.unitPrice))}</td>
                            <td dir="ltr">{parseNum(line.discount) > 0 ? `(${fmt(parseNum(line.discount))})` : "—"}</td>
                            {details.showVat && <td><span className="qg-doc-tag">{rateObj.tag}</span></td>}
                            {details.showVat && <td dir="ltr">{fmt(calc?.vatAmount)}</td>}
                            <td className="qg-doc-strong" dir="ltr">{fmt(calc?.lineTotal)}</td>
                          </tr>
                        );
                      })}
                      {[fees.delivery, fees.service, fees.custom]
                        .filter((f) => parseNum(f.amount) > 0 && f.label)
                        .map((f, i) => (
                          <tr key={`fee-${i}`}>
                            <td>—</td>
                            <td><em>{f.label}</em></td>
                            <td colSpan={details.showVat ? 6 : 4} />
                            <td className="qg-doc-strong" dir="ltr">{fmt(parseNum(f.amount))}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="qg-doc-tot-wrap">
                  <div className="qg-doc-tot">
                    <TotalRows bi />
                    <div className="qg-doc-grand">
                      <span>الإجمالي / Grand Total</span>
                      <span className="qg-ltr">{fmt(totals.grandTotal)} {cur}</span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                {(terms.validity || terms.payment || terms.delivery || terms.warranty || terms.exclusions || terms.cancellation) && (
                  <div className="qg-doc-box">
                    <p className="qg-doc-cap">الشروط والأحكام / Terms &amp; Conditions</p>
                    <div className="qg-doc-terms">
                      {terms.validity     && <p><strong>الصلاحية: </strong>{terms.validity}</p>}
                      {terms.payment      && <p><strong>الدفع: </strong>{terms.payment}</p>}
                      {terms.delivery     && <p><strong>التسليم: </strong>{terms.delivery}</p>}
                      {terms.warranty     && <p><strong>الضمان: </strong>{terms.warranty}</p>}
                      {terms.exclusions   && <p className="qg-doc-wide"><strong>الاستثناءات: </strong>{terms.exclusions}</p>}
                      {terms.cancellation && <p className="qg-doc-wide"><strong>الإلغاء: </strong>{terms.cancellation}</p>}
                    </div>
                  </div>
                )}

                {terms.notes && (
                  <div className="qg-doc-box">
                    <p className="qg-doc-cap">ملاحظات / Notes</p>
                    <p>{terms.notes}</p>
                  </div>
                )}

                {/* Signatures */}
                <div className="qg-doc-sigs">
                  <div>
                    <div className="qg-doc-line" />
                    <p className="qg-doc-strong">إعداد / Prepared By</p>
                    <p>{seller.name || ""}</p>
                  </div>
                  <div>
                    <div className="qg-doc-line" />
                    <p className="qg-doc-strong">اعتماد العميل / Client Approval</p>
                    <p>{customer.name || ""}</p>
                  </div>
                </div>

                <div className="qg-doc-disc">
                  <span className="qg-doc-excl" aria-hidden="true">!</span>
                  <p>
                    لا يُعد عرض السعر فاتورة ضريبية. هذا المستند أداة مساعدة لإنشاء عرض سعر ولا يحمل اعتماد هيئة الزكاة والضريبة والجمارك (ZATCA).
                    {" "}This is a commercial quotation, not a Tax Invoice. Not affiliated with or approved by ZATCA.
                  </p>
                </div>
              </div>
            </div>
          </PrintWrapper>
        </>
      )}
    </div>
  );
}

/**
 * Local styles. Map the --qg-* fallbacks to your real Ink & Signal tokens.
 * The printed document (.qg-doc) always uses fixed ink-on-white colors.
 */
function QuoteStyles() {
  return (
    <style>{`
      .qg-root{
        --qg-ink:#0a0a0a; --qg-paper:#ffffff; --qg-muted:#f0f0f0;
        --qg-text2:#404040; --qg-orange:#ff5a1f;
        max-width:48rem; margin:0 auto; padding:1.5rem 1rem;
        color:var(--qg-ink); background:var(--qg-paper); display:grid; gap:1rem;
      }
      @media (prefers-color-scheme: dark){
        :root:not([data-theme="light"]) .qg-root{
          --qg-ink:#f5f5f5; --qg-paper:#0a0a0a; --qg-muted:#1a1a1a; --qg-text2:#d4d4d4;
        }
      }
      :root[data-theme="dark"] .qg-root{
        --qg-ink:#f5f5f5; --qg-paper:#0a0a0a; --qg-muted:#1a1a1a; --qg-text2:#d4d4d4;
      }
      .qg-root :focus-visible{ outline:3px solid var(--qg-orange); outline-offset:2px; }
      .qg-ltr{ direction:ltr; unicode-bidi:isolate; display:inline-block; }
      .qg-sr{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
      .qg-stack{ display:grid; gap:1rem; }

      /* Cards */
      .qg-card{ border:2px solid var(--qg-ink); padding:1.25rem; display:grid; gap:1rem; }
      .qg-h1{ margin:0; font-size:1.375rem; font-weight:800; }
      .qg-h2{ margin:0; display:flex; align-items:center; gap:.625rem; font-size:.9375rem; font-weight:800; }
      .qg-num{
        flex:none; width:1.75rem; height:1.75rem; display:inline-flex; align-items:center; justify-content:center;
        border:2px solid var(--qg-ink); font-size:.8125rem; font-weight:800;
      }
      .qg-lead{ margin:.25rem 0 0; font-size:.75rem; line-height:1.8; color:var(--qg-text2); }
      .qg-small{ margin:0; font-size:.6875rem; line-height:1.8; color:var(--qg-text2); }
      .qg-small-b{ margin:0 0 .25rem; font-size:.75rem; font-weight:800; }
      .qg-head-row{ display:flex; flex-wrap:wrap; gap:1rem; justify-content:space-between; align-items:flex-start; }
      .qg-actions{ display:flex; flex-wrap:wrap; gap:.5rem; align-items:center; }
      .qg-draft{ padding-top:.25rem; }
      .qg-push{ margin-inline-start:auto; }
      .qg-dash{ border:2px dashed var(--qg-ink); padding:.75rem; display:grid; gap:.5rem; }
      .qg-vat-row{ display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:.75rem; }
      .qg-note{ border:2px solid var(--qg-ink); border-inline-start:6px solid var(--qg-orange); padding:.75rem 1rem; }
      .qg-note p:last-child{ margin:0; }

      /* Buttons */
      .qg-btn{
        padding:.5rem .875rem; border:2px solid var(--qg-ink); font-size:.75rem; font-weight:800;
        font-family:inherit; cursor:pointer; background:var(--qg-paper); color:var(--qg-ink);
      }
      .qg-btn-sm{ padding:.25rem .625rem; }
      .qg-btn-o:hover{ background:var(--qg-muted); }
      .qg-btn-p{ background:var(--qg-orange); color:#0a0a0a; border-color:var(--qg-ink); flex:1; }
      .qg-btn-p:hover{ background:var(--qg-ink); color:var(--qg-paper); }
      .qg-bottom .qg-btn{ flex:1; padding:.75rem 1rem; font-size:.8125rem; }
      .qg-link{
        background:none; border:0; padding:0; font-family:inherit; font-size:.75rem; font-weight:800;
        color:var(--qg-ink); text-decoration:underline; text-underline-offset:3px; cursor:pointer;
      }
      .qg-add{
        width:100%; padding:.75rem; border:2px dashed var(--qg-ink); background:transparent;
        color:var(--qg-ink); font-family:inherit; font-size:.75rem; font-weight:800; cursor:pointer;
      }
      .qg-add:hover{ background:var(--qg-muted); }

      /* Tabs / segmented */
      .qg-tabs,.qg-seg{ display:flex; border:2px solid var(--qg-ink); }
      .qg-tabs button,.qg-seg button{
        flex:1; padding:.5rem .875rem; border:0; background:var(--qg-paper); color:var(--qg-ink);
        font-size:.75rem; font-weight:800; font-family:inherit; cursor:pointer;
      }
      .qg-tabs button + button,.qg-seg button + button{ border-inline-start:2px solid var(--qg-ink); }
      .qg-tabs button[aria-pressed="true"],.qg-seg button[aria-pressed="true"]{ background:var(--qg-ink); color:var(--qg-paper); }
      .qg-seg button{ flex:none; padding:.375rem 1.25rem; }

      /* Fields */
      .qg-two{ display:grid; gap:.875rem; grid-template-columns:1fr; }
      @media (min-width:640px){ .qg-two{ grid-template-columns:1fr 1fr; } .qg-span{ grid-column:1 / -1; } }
      .qg-field{ display:grid; gap:.25rem; align-content:start; }
      .qg-label{ font-size:.75rem; font-weight:800; line-height:1.6; }
      .qg-hint{ font-weight:600; color:var(--qg-text2); font-size:.625rem; }
      .qg-input{
        width:100%; min-width:0; box-sizing:border-box; border:2px solid var(--qg-ink);
        background:var(--qg-paper); color:var(--qg-ink); padding:.5rem .625rem;
        font-size:.8125rem; font-weight:600; font-family:inherit;
      }
      .qg-input[aria-invalid="true"]{ border-style:dashed; border-width:3px; }
      .qg-err,.qg-ok{ margin:0; font-size:.6875rem; font-weight:700; }
      .qg-err::before{ content:"! "; font-weight:900; }
      .qg-ok::before{ content:"✓ "; font-weight:900; }

      /* Lines */
      .qg-line{ border:2px solid var(--qg-ink); margin:0; padding:.75rem; display:grid; gap:.75rem; }
      .qg-legend{ padding:0 .5rem; font-size:.75rem; font-weight:800; }
      .qg-line-top{ justify-content:flex-end; }
      .qg-line-grid{ display:grid; gap:.75rem; grid-template-columns:1fr; }
      .qg-line-grid3{ display:grid; gap:.75rem; grid-template-columns:1fr; align-items:end; }
      @media (min-width:640px){
        .qg-line-grid{ grid-template-columns:repeat(6,1fr); }
        .qg-c3{ grid-column:span 3; }
        .qg-line-grid3{ grid-template-columns:repeat(3,1fr); }
      }
      .qg-mini{ margin:0; display:grid; gap:.125rem; font-size:.6875rem; }
      .qg-mini div{ display:flex; justify-content:space-between; gap:.5rem; }
      .qg-mini dt{ color:var(--qg-text2); } .qg-mini dd{ margin:0; font-weight:800; }
      .qg-mini-t{ border-top:2px solid var(--qg-ink); padding-top:.125rem; }
      .qg-mini-t dt{ color:var(--qg-ink); font-weight:800; }

      /* Totals (orange panel, black text) */
      .qg-result{ background:var(--qg-orange); color:#0a0a0a; border:2px solid var(--qg-ink); padding:1.25rem; display:grid; gap:.75rem; }
      .qg-result-h{ margin:0; font-size:.9375rem; font-weight:800; }
      .qg-tbox{ background:#fff; border:2px solid #0a0a0a; }
      .qg-trow{ display:flex; justify-content:space-between; gap:1rem; padding:.375rem .75rem; border-top:1px solid #0a0a0a; font-size:.75rem; font-weight:700; }
      .qg-trow:first-child{ border-top:0; }
      .qg-trow-b{ border-top:2px solid #0a0a0a; font-weight:800; }
      .qg-grand-row{ display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap; align-items:center; font-size:1.125rem; font-weight:900; }

      /* Preview document (fixed ink on white, independent of theme) */
      .qg-doc{ --d-ink:#0a0a0a; --d-text2:#404040; --d-or:#ff5a1f; background:#fff; color:var(--d-ink); }
      .qg-doc p{ margin:0; }
      .qg-doc-head{ background:var(--d-or); color:#0a0a0a; border-bottom:2px solid #0a0a0a; padding:1.25rem 1.5rem; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
      .qg-doc-head-row{ display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap; align-items:flex-start; }
      .qg-doc-title{ font-size:1.5rem; font-weight:900; }
      .qg-doc-sub{ font-size:.8125rem; font-weight:700; }
      .qg-doc-status{ display:inline-block; margin-top:.5rem; border:2px solid #0a0a0a; padding:0 .625rem; font-size:.6875rem; font-weight:800; background:#fff; }
      .qg-doc-meta{ text-align:right; font-size:.6875rem; font-weight:600; }
      .qg-doc-no{ font-size:1.125rem; font-weight:900; }
      .qg-doc-dates{ margin-top:.75rem; display:flex; flex-wrap:wrap; gap:1.5rem; font-size:.75rem; }
      .qg-doc-body{ padding:1.25rem 1.5rem; display:grid; gap:1.25rem; }
      .qg-doc-parties{ display:grid; gap:1rem; grid-template-columns:1fr; }
      @media (min-width:640px){ .qg-doc-parties{ grid-template-columns:1fr 1fr; } }
      .qg-doc-box{ border:2px solid var(--d-ink); padding:.75rem 1rem; font-size:.75rem; line-height:1.8; color:var(--d-text2); }
      .qg-doc-cap{ font-size:.6875rem; font-weight:800; color:var(--d-ink); border-bottom:1px solid var(--d-ink); margin-bottom:.375rem !important; padding-bottom:.25rem; }
      .qg-doc-name{ font-size:.875rem; font-weight:800; color:var(--d-ink); }
      .qg-doc-vat{ font-size:.6875rem; margin-top:.25rem !important; }
      .qg-doc-scroll{ overflow-x:auto; }
      .qg-doc-table{ width:100%; border-collapse:collapse; font-size:.75rem; border:2px solid var(--d-ink); }
      .qg-doc-table th{ background:#f0f0f0; text-align:right; padding:.5rem; font-weight:800; border-bottom:2px solid var(--d-ink); white-space:nowrap; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
      .qg-doc-table td{ padding:.5rem; border-bottom:1px solid var(--d-ink); color:var(--d-text2); }
      .qg-doc-table tr:last-child td{ border-bottom:0; }
      .qg-doc-strong{ font-weight:800; color:var(--d-ink) !important; }
      .qg-doc-tag{ border:1px solid var(--d-ink); padding:0 .375rem; font-size:.625rem; font-weight:800; }
      .qg-doc-tot-wrap{ display:flex; justify-content:flex-end; }
      .qg-doc-tot{ width:100%; max-width:20rem; border:2px solid var(--d-ink); }
      .qg-doc-tot .qg-trow{ border-top:1px solid var(--d-ink); color:var(--d-ink); }
      .qg-doc-tot .qg-trow:first-child{ border-top:0; }
      .qg-doc-tot .qg-trow-b{ border-top:2px solid var(--d-ink); }
      .qg-doc-grand{ display:flex; justify-content:space-between; gap:1rem; padding:.625rem .75rem; background:var(--d-or); color:#0a0a0a; border-top:2px solid var(--d-ink); font-size:.875rem; font-weight:900; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
      .qg-doc-terms{ display:grid; gap:.25rem 1rem; grid-template-columns:1fr; }
      @media (min-width:640px){ .qg-doc-terms{ grid-template-columns:1fr 1fr; } .qg-doc-wide{ grid-column:1 / -1; } }
      .qg-doc-terms strong{ color:var(--d-ink); }
      .qg-doc-sigs{ display:grid; grid-template-columns:1fr 1fr; gap:2rem; padding-top:.75rem; text-align:center; font-size:.6875rem; color:var(--d-text2); }
      .qg-doc-line{ border-bottom:2px solid var(--d-ink); height:3rem; margin-bottom:.5rem; }
      .qg-doc-disc{ display:flex; gap:.5rem; align-items:flex-start; border:2px dashed var(--d-ink); padding:.625rem .75rem; font-size:.625rem; line-height:1.8; color:var(--d-text2); }
      .qg-doc-excl{ flex:none; width:1.25rem; height:1.25rem; display:inline-flex; align-items:center; justify-content:center; border:2px solid var(--d-ink); font-weight:800; color:var(--d-ink); }

      @media print{
        .qg-noprint{ display:none !important; }
        .qg-root{ padding:0; max-width:none; background:none; }
        .qg-doc-scroll{ overflow:visible; }
        .qg-doc-box,.qg-doc-tot,.qg-doc-sigs,.qg-doc-disc{ break-inside:avoid; }
      }
    `}</style>
  );
}