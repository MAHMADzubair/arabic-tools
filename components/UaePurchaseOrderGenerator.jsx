"use client";

/**
 * components/UaePurchaseOrderGenerator.jsx
 * Qemlo redesign — glossy orange / ink, SVG icons, 26px radius, dark + light.
 * ALL logic is unchanged (calculations, draft save/restore, prefill import,
 * invoice hand-off, over-discount guards, completeness checks).
 * The printed/preview document (.po-doc) stays fixed ink-on-white for print.
 */
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  formatAED as fmt,
  parseNum,
  calcLineVat,
  discountExceedsGross,
  isValidUaeTrn,
  calcCompleteness,
  checkOk,
  checkWarn,
  checkMissing,
} from "@/lib/businessUtils";
import { EMIRATES } from "@/lib/countryBusinessConfig";

// ─── Constants ─────────────────────────────────────────────────────────────────

const DRAFT_KEY = "uae_purchase_order_draft_v1";
const PREFILL_KEY = "uae_po_prefill_v1";

const VAT_RATES = [
  { id: "5", label: "5% — خاضعة للضريبة", rate: 0.05, tag: "5%" },
  { id: "0", label: "0% — صفرية المعدل", rate: 0, tag: "0%" },
  { id: "exempt", label: "معفاة", rate: null, tag: "معفاة" },
  { id: "out", label: "خارج النطاق", rate: null, tag: "خ.ن" },
  { id: "none", label: "بدون ضريبة", rate: null, tag: "—" },
];

const UNITS = ["وحدة", "قطعة", "صندوق", "كرتون", "كغ", "طن", "متر", "متر مربع", "لتر", "ساعة", "يوم", "شهر", "نسخة"];

const STATUS_OPTIONS = [
  { id: "", label: "بدون حالة" },
  { id: "draft", label: "مسودة" },
  { id: "sent", label: "مرسل للمورد" },
  { id: "confirmed", label: "مؤكد" },
  { id: "cancelled", label: "ملغي" },
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

const today = () => new Date().toISOString().split("T")[0];
const plus7 = () => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split("T")[0]; };

const defaultBuyer = () => ({
  name: "", address: "", emirate: "دبي", trn: "",
  contactPerson: "", phone: "", email: "",
});
const defaultSupplier = () => ({
  name: "", address: "", emirate: "", trn: "",
  contactPerson: "", phone: "", email: "",
});
const defaultPoDetails = () => ({
  poNumber: generatePoNumber(),
  issueDate: today(),
  deliveryDate: plus7(),
  currency: "AED",
  quoteRef: "",
  projectRef: "",
  requestedBy: "",
  status: "",
  showVat: true,
});
const defaultDelivery = () => ({
  address: "",
  instructions: "",
  paymentTerms: "50% مقدماً و50% عند التسليم",
  paymentMethod: "",
  warranty: "",
  returns: "",
  notes: "",
});
const defaultCharges = () => ({
  shipping: { label: "رسوم الشحن والتوصيل", amount: "" },
  installation: { label: "رسوم التركيب", amount: "" },
  custom: { label: "", amount: "" },
});

// ─── Icons ─────────────────────────────────────────────────────────────────────

const ICONS = {
  file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>,
  building: <><path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16" /><path d="M14 10h5a1 1 0 0 1 1 1v10" /><path d="M8 8h2M8 12h2M8 16h2M3 21h18" /></>,
  truck: <><path d="M3 6h11v10H3z" /><path d="M14 9h4l3 3v4h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
  box: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><path d="M9 8h6M9 12h6" /></>,
  wallet: <><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a1 1 0 0 1 1 1v2" /><path d="M3 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3" /><path d="M21 9.5h-4a2.5 2.5 0 0 0 0 5h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5z" /></>,
  shield: <><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" /><path d="m9 12 2.2 2.2L15 10.5" /></>,
  sum: <><path d="M17 5H7l6 7-6 7h10" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  alert: <><path d="M12 3 2.5 20h19L12 3z" /><path d="M12 10v4M12 17h.01" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  save: <><path d="M5 4h11l3 3v13H5z" /><path d="M8 4v5h7V4M8 20v-6h8v6" /></>,
  undo: <><path d="M9 7 4 12l5 5" /><path d="M4 12h10a6 6 0 0 1 0 12" transform="translate(0 -5)" /></>,
  trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="3" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  print: <><path d="M7 9V4h10v5" /><rect x="4" y="9" width="16" height="8" rx="2" /><path d="M7 14h10v6H7z" /></>,
  external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13 7 4 4" /></>,
  reset: <><path d="M4 12a8 8 0 1 0 3-6.2" /><path d="M4 4v5h5" /></>,
  bolt: <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7z" />,
};

function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {ICONS[name]}
    </svg>
  );
}

// ─── Small UI pieces ───────────────────────────────────────────────────────────

function Field({ id, label, hint, span, children }) {
  return (
    <div className={`po-field ${span ? "po-span" : ""}`}>
      <label htmlFor={id} className="po-label">
        {label}{hint && <span className="po-hint"> {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function TextField({ id, label, hint, span, value, onChange, area = false, ...rest }) {
  return (
    <Field id={id} label={label} hint={hint} span={span}>
      {area ? (
        <textarea id={id} className="po-input" rows={2} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      ) : (
        <input id={id} className="po-input" value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      )}
    </Field>
  );
}

function SelectField({ id, label, span, value, onChange, children }) {
  return (
    <Field id={id} label={label} span={span}>
      <select id={id} className="po-input po-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </Field>
  );
}

function TrnField({ id, label, hint, value, onChange }) {
  const has = Boolean(value);
  const ok = has && isValidUaeTrn(value);
  return (
    <Field id={id} label={label} hint={hint}>
      <input
        id={id} className="po-input" placeholder="100XXXXXXXXXXXX" dir="ltr" maxLength={15} inputMode="numeric"
        value={value} aria-invalid={has && !ok} aria-describedby={has ? `${id}-msg` : undefined}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      />
      {has && !ok && <p id={`${id}-msg`} className="po-err"><Icon name="alert" size={14} />الرقم الضريبي غير صالح شكلياً (عادةً 15 رقماً)</p>}
      {ok && <p id={`${id}-msg`} className="po-ok"><Icon name="check" size={14} />صالح شكلياً</p>}
    </Field>
  );
}

function StepTitle({ icon, id, children }) {
  return (
    <h2 id={id} className="po-h2">
      <span className="po-tile"><Icon name={icon} size={20} /></span>
      <span>{children}</span>
    </h2>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function UaePurchaseOrderGenerator() {
  const [buyer, setBuyer] = useState(defaultBuyer);
  const [supplier, setSupplier] = useState(defaultSupplier);
  const [poDetails, setPoDetails] = useState(defaultPoDetails);
  const [lines, setLines] = useState([emptyLine()]);
  const [charges, setCharges] = useState(defaultCharges);
  const [delivery, setDelivery] = useState(defaultDelivery);
  const [activeTab, setActiveTab] = useState("form");
  const [draftMsg, setDraftMsg] = useState("");
  const [showChecker, setShowChecker] = useState(false);

  const flash = (msg) => { setDraftMsg(msg); setTimeout(() => setDraftMsg(""), 3000); };

  // ── Prefill from Quotation Generator ──────────────────────────────────────────
  const [prefillData, setPrefillData] = useState(null);
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
      if (prefillData.supplier) setSupplier(s => ({ ...s, ...prefillData.supplier }));
      if (prefillData.buyer) setBuyer(b => ({ ...b, ...prefillData.buyer }));
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
      flash("تم حفظ المسودة على هذا الجهاز");
    } catch { flash("تعذّر الحفظ"); }
  }, [buyer, supplier, poDetails, lines, charges, delivery]);

  const restoreDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) { flash("لا توجد مسودة محفوظة"); return; }
      const d = JSON.parse(raw);
      if (d.buyer) setBuyer(d.buyer);
      if (d.supplier) setSupplier(d.supplier);
      if (d.poDetails) setPoDetails(d.poDetails);
      if (d.lines) {
        // keep new ids above restored ids (otherwise duplicate keys after reload)
        _lineId = Math.max(_lineId, ...d.lines.map((l) => Number(l.id) || 0));
        setLines(d.lines);
      }
      if (d.charges) setCharges(d.charges);
      if (d.delivery) setDelivery(d.delivery);
      flash("تمت استعادة المسودة");
    } catch { flash("تعذّرت الاستعادة"); }
  }, []);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    flash("تم مسح المسودة");
  }, []);

  // ── Line helpers ──────────────────────────────────────────────────────────────
  const updateLine = (id, field, value) =>
    setLines(ls => ls.map(l => l.id === id ? { ...l, [field]: value } : l));
  const addLine = () => setLines(ls => [...ls, emptyLine()]);
  const removeLine = (id) => setLines(ls => ls.length > 1 ? ls.filter(l => l.id !== id) : ls);
  const duplicateLine = (id) => {
    const src = lines.find(l => l.id === id);
    if (!src) return;
    const dup = { ...src, id: newLineId() };
    setLines(ls => {
      const idx = ls.findIndex(l => l.id === id);
      const next = [...ls]; next.splice(idx + 1, 0, dup); return next;
    });
  };

  const handleReset = () => {
    setBuyer(defaultBuyer()); setSupplier(defaultSupplier());
    setPoDetails(defaultPoDetails()); setLines([emptyLine()]);
    setCharges(defaultCharges()); setDelivery(defaultDelivery());
    setActiveTab("form");
  };

  const handlePrint = () => {
    if (hasOverDiscount) return; // handler-level guard — cannot be bypassed
    setActiveTab("preview");
    setTimeout(() => window.print(), 300);
  };

  // ── Open invoice generator ────────────────────────────────────────────────────
  /**
   * Draft invoice number derived from the PO number (strip PO-/LPO- prefix, add INV-).
   * Draft reference only — a compliant sequential tax invoice number must be assigned
   * by the supplier's invoicing system; the PO reference is kept in the notes.
   */
  const deriveDraftInvoiceNumber = (poNumber) => {
    const stripped = poNumber.replace(/^(L?PO[-_]?)/i, "");
    return `INV-${stripped}`;
  };

  const handleOpenInvoice = () => {
    try {
      const draftInvNumber = deriveDraftInvoiceNumber(poDetails.poNumber);
      const payload = {
        seller: { name: supplier.name, address: supplier.address, emirate: supplier.emirate, trn: supplier.trn, email: supplier.email, phone: supplier.phone, cr: "" },
        buyer: { name: buyer.name, address: buyer.address, emirate: buyer.emirate, trn: buyer.trn, vatRegistered: buyer.trn ? "yes" : "no" },
        details: {
          invoiceNumber: draftInvNumber,
          issueDate: poDetails.issueDate,
          supplyDate: "",
          currency: poDetails.currency,
          notes: [
            `مرجع أمر الشراء / PO Ref: ${poDetails.poNumber}`,
            delivery.notes,
          ].filter(Boolean).join("\n"),
        },
        lines: lines.map(l => ({ id: l.id, name: l.name, qty: l.qty, unitPrice: l.unitPrice, discount: l.discount, vatRateId: l.vatRateId })),
      };
      localStorage.setItem("uae_invoice_prefill_v1", JSON.stringify(payload));
    } catch { /* silent */ }
    window.open("/ar/ae/vat-invoice-generator", "_blank");
  };

  // ── Calculations (effective discount capped at gross so totals reconcile) ────
  const { lineCalcs, totals } = useMemo(() => {
    const lineCalcs = lines.map(l => {
      const rateObj = VAT_RATES.find(r => r.id === l.vatRateId) || VAT_RATES[0];
      const effectiveRate = poDetails.showVat ? rateObj.rate : null;
      const result = calcLineVat({ qty: l.qty, unitPrice: l.unitPrice, discount: l.discount, vatRate: effectiveRate });
      const effectiveDiscount = Math.min(result.discount, result.gross);
      return { ...result, rateObj, effectiveDiscount };
    });

    const chargeTotal = parseNum(charges.shipping.amount) + parseNum(charges.installation.amount) + parseNum(charges.custom.amount);
    const grossTotal = lineCalcs.reduce((s, l) => s + l.gross, 0);
    const totalDiscount = lineCalcs.reduce((s, l) => s + l.effectiveDiscount, 0);
    const taxable5 = lineCalcs.filter(l => l.rateObj.id === "5").reduce((s, l) => s + l.taxableBase, 0);
    const taxable0 = lineCalcs.filter(l => l.rateObj.id === "0").reduce((s, l) => s + l.taxableBase, 0);
    const exemptTotal = lineCalcs.filter(l => l.rateObj.id === "exempt").reduce((s, l) => s + l.taxableBase, 0);
    const outTotal = lineCalcs.filter(l => l.rateObj.id === "out").reduce((s, l) => s + l.taxableBase, 0);
    const totalVat = lineCalcs.reduce((s, l) => s + l.vatAmount, 0);
    const grandTotal = lineCalcs.reduce((s, l) => s + l.lineTotal, 0) + chargeTotal;

    return { lineCalcs, totals: { grossTotal, totalDiscount, taxable5, taxable0, exemptTotal, outTotal, totalVat, chargeTotal, grandTotal } };
  }, [lines, charges, poDetails.showVat]);

  // ── Completeness checks ───────────────────────────────────────────────────────
  const checks = useMemo(() => {
    const c = [];
    buyer.name.trim() ? c.push(checkOk("اسم الشركة المشترية")) : c.push(checkMissing("اسم الشركة المشترية", "مطلوب"));
    supplier.name.trim() ? c.push(checkOk("اسم المورد")) : c.push(checkMissing("اسم المورد", "مطلوب"));
    poDetails.poNumber.trim() ? c.push(checkOk("رقم أمر الشراء")) : c.push(checkMissing("رقم أمر الشراء", "مطلوب"));
    poDetails.issueDate ? c.push(checkOk("تاريخ الإصدار")) : c.push(checkMissing("تاريخ الإصدار", "مطلوب"));
    poDetails.deliveryDate ? c.push(checkOk("تاريخ التسليم المتوقع")) : c.push(checkWarn("تاريخ التسليم المتوقع", "يُستحسن تحديده"));
    const badLines = lines.filter(l => !l.name.trim() || !parseNum(l.unitPrice));
    badLines.length === 0 ? c.push(checkOk("بنود أمر الشراء (وصف + سعر)")) : c.push(checkMissing("بنود أمر الشراء", `${badLines.length} بند ناقص`));
    delivery.paymentTerms.trim() ? c.push(checkOk("شروط الدفع")) : c.push(checkWarn("شروط الدفع", "يُستحسن تحديدها"));
    return c;
  }, [buyer, supplier, poDetails, lines, delivery]);

  const { okCount, warnCount, missCount, completePct } = calcCompleteness(checks);

  const overDiscountLines = lines.filter(l =>
    discountExceedsGross(l.qty, l.unitPrice, l.discount)
  );
  const hasOverDiscount = overDiscountLines.length > 0;

  const cur = poDetails.currency;
  const statusLabel = STATUS_OPTIONS.find((s) => s.id === poDetails.status)?.label;

  const totalRows = (bi) => [
    { label: bi ? "المجموع الفرعي / Subtotal" : "المجموع قبل الخصم", val: totals.grossTotal },
    totals.totalDiscount > 0 && { label: bi ? "الخصومات / Discounts" : "إجمالي الخصومات", val: -totals.totalDiscount },
    poDetails.showVat && totals.taxable5 > 0 && { label: bi ? "خاضع 5% / Taxable 5%" : "القيمة الخاضعة لـ 5%", val: totals.taxable5 },
    poDetails.showVat && totals.taxable0 > 0 && { label: bi ? "صفري / Zero-rated" : "القيمة الخاضعة لـ 0%", val: totals.taxable0 },
    poDetails.showVat && totals.exemptTotal > 0 && { label: bi ? "معفاة / Exempt" : "القيمة المعفاة", val: totals.exemptTotal },
    poDetails.showVat && totals.outTotal > 0 && { label: bi ? "خارج النطاق / Out of scope" : "خارج النطاق", val: totals.outTotal },
    poDetails.showVat && { label: bi ? "إجمالي الضريبة / Total VAT" : "إجمالي ضريبة القيمة المضافة", val: totals.totalVat, bold: true },
    totals.chargeTotal > 0 && { label: bi ? "رسوم إضافية / Charges" : "إجمالي الرسوم الإضافية", val: totals.chargeTotal },
  ].filter(Boolean);

  const TotalRows = ({ bi }) =>
    totalRows(bi).map((r, i) => (
      <div key={i} className={`po-trow ${r.bold ? "po-trow-b" : ""}`}>
        <span>{r.label}</span>
        <span className="po-ltr">{r.val < 0 ? "-" : ""}{fmt(Math.abs(r.val))} {cur}</span>
      </div>
    ));

  const chargeRows = [charges.shipping, charges.installation, charges.custom].filter((c) => parseNum(c.amount) > 0 && c.label);

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="po-root" dir="rtl">
      <PoStyles />

      {/* Prefill banner */}
      {prefillData && !prefillDismissed && (
        <aside className="po-note po-noprint" aria-live="polite">
          <span className="po-ico"><Icon name="info" size={20} /></span>
          <div className="po-note-body">
            <p className="po-small-b">تم اكتشاف بيانات من مولد عرض السعر الإماراتي</p>
            <p className="po-small">لن تُستبدل البيانات الحالية إلا بعد موافقتك الصريحة</p>
            <div className="po-actions">
              <button type="button" className="po-btn po-btn-p po-btn-sm" onClick={handleImportPrefill}>استيراد بيانات عرض السعر</button>
              <button type="button" className="po-btn po-btn-sm" onClick={handleDismissPrefill}>تجاهل</button>
            </div>
          </div>
        </aside>
      )}

      {/* Header */}
      <header className="po-card po-noprint">
        <div className="po-head-row">
          <div>
            {/* Intentionally not an H1 — the page hero already owns the H1 */}
            <p className="po-h1" role="heading" aria-level="2">
              <span className="po-tile"><Icon name="file" size={20} /></span>
              مولد أمر الشراء في الإمارات
            </p>
            <p className="po-lead">أنشئ أمر شراء احترافي بالعربية والإنجليزية — للشركات والمتاجر وفرق المشتريات في الإمارات</p>
          </div>
          <button type="button" className="po-btn po-btn-o" onClick={handleReset}><Icon name="reset" size={16} />مسح</button>
        </div>

        <div className="po-actions po-draft">
          <button type="button" className="po-btn po-btn-o po-btn-sm" onClick={saveDraft}><Icon name="save" size={16} />حفظ المسودة</button>
          <button type="button" className="po-btn po-btn-o po-btn-sm" onClick={restoreDraft}><Icon name="undo" size={16} />استعادة آخر مسودة</button>
          <button type="button" className="po-btn po-btn-o po-btn-sm" onClick={clearDraft}><Icon name="trash" size={16} />مسح المسودة</button>
          <span className="po-small" role="status" aria-live="polite">{draftMsg}</span>
          <span className="po-small po-push">محفوظ على هذا الجهاز فقط</span>
        </div>

        <div className="po-tabs" role="group" aria-label="العرض">
          <button type="button" aria-pressed={activeTab === "form"} onClick={() => setActiveTab("form")}><Icon name="edit" size={16} />إدخال البيانات</button>
          <button
            type="button"
            aria-pressed={activeTab === "preview"}
            disabled={hasOverDiscount}
            aria-disabled={hasOverDiscount}
            onClick={() => !hasOverDiscount && setActiveTab("preview")}
          ><Icon name="eye" size={16} />معاينة أمر الشراء</button>
        </div>
      </header>

      {/* ══════════════ FORM ══════════════ */}
      {activeTab === "form" && (
        <div className="po-stack po-noprint">

          {/* 1 — PO details */}
          <section className="po-card" aria-labelledby="po-s1">
            <StepTitle icon="file" id="po-s1">بيانات أمر الشراء</StepTitle>
            <div className="po-two">
              <TextField id="po-no" label="رقم أمر الشراء (PO No.) *" placeholder="PO-2026-0001" dir="ltr"
                value={poDetails.poNumber} onChange={(v) => setPoDetails((d) => ({ ...d, poNumber: v }))} />
              <SelectField id="po-cur" label="العملة" value={poDetails.currency} onChange={(v) => setPoDetails((d) => ({ ...d, currency: v }))}>
                <option value="AED">درهم إماراتي — AED</option>
                <option value="USD">دولار أمريكي — USD</option>
                <option value="EUR">يورو — EUR</option>
                <option value="GBP">جنيه استرليني — GBP</option>
                <option value="SAR">ريال سعودي — SAR</option>
              </SelectField>
              <TextField id="po-issue" label="تاريخ الإصدار *" type="date" dir="ltr"
                value={poDetails.issueDate} onChange={(v) => setPoDetails((d) => ({ ...d, issueDate: v }))} />
              <TextField id="po-deliv" label="تاريخ التسليم المتوقع" type="date" dir="ltr"
                value={poDetails.deliveryDate} onChange={(v) => setPoDetails((d) => ({ ...d, deliveryDate: v }))} />
              <TextField id="po-quote" label="مرجع عرض السعر (اختياري)" placeholder="QT-2026-0001" dir="ltr"
                value={poDetails.quoteRef} onChange={(v) => setPoDetails((d) => ({ ...d, quoteRef: v }))} />
              <TextField id="po-proj" label="المشروع / القسم (اختياري)" placeholder="قسم المشتريات / IT"
                value={poDetails.projectRef} onChange={(v) => setPoDetails((d) => ({ ...d, projectRef: v }))} />
              <TextField id="po-req" label="طلب بواسطة (اختياري)" placeholder="أحمد المنصوري"
                value={poDetails.requestedBy} onChange={(v) => setPoDetails((d) => ({ ...d, requestedBy: v }))} />
              <SelectField id="po-status" label="حالة أمر الشراء (اختياري)" value={poDetails.status} onChange={(v) => setPoDetails((d) => ({ ...d, status: v }))}>
                {STATUS_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </SelectField>
            </div>

            <div className="po-dash po-vat-row">
              <div>
                <p className="po-small-b">هل تريد إظهار ضريبة القيمة المضافة (VAT)؟</p>
                <p className="po-small">أمر الشراء ليس فاتورة ضريبية، حتى عند إظهار ضريبة القيمة المضافة</p>
              </div>
              <div className="po-seg" role="group" aria-label="إظهار ضريبة القيمة المضافة">
                <button type="button" aria-pressed={poDetails.showVat} onClick={() => setPoDetails((d) => ({ ...d, showVat: true }))}>نعم</button>
                <button type="button" aria-pressed={!poDetails.showVat} onClick={() => setPoDetails((d) => ({ ...d, showVat: false }))}>لا</button>
              </div>
            </div>
          </section>

          {/* 2 — Buyer */}
          <section className="po-card" aria-labelledby="po-s2">
            <StepTitle icon="building" id="po-s2">بيانات المشتري (شركتك / جهة الشراء)</StepTitle>
            <div className="po-two">
              <TextField id="po-bname" span label="اسم الشركة *" placeholder="شركة الأفق التجارية ذ.م.م"
                value={buyer.name} onChange={(v) => setBuyer((b) => ({ ...b, name: v }))} />
              <TextField id="po-bcontact" label="جهة الاتصال" placeholder="مسؤول المشتريات"
                value={buyer.contactPerson} onChange={(v) => setBuyer((b) => ({ ...b, contactPerson: v }))} />
              <SelectField id="po-bemirate" label="الإمارة" value={buyer.emirate} onChange={(v) => setBuyer((b) => ({ ...b, emirate: v }))}>
                {EMIRATES.map((em) => <option key={em}>{em}</option>)}
              </SelectField>
              <TextField id="po-baddr" span label="العنوان" placeholder="شارع الشيخ زايد، مبنى 15، دبي"
                value={buyer.address} onChange={(v) => setBuyer((b) => ({ ...b, address: v }))} />
              <TextField id="po-bphone" label="الهاتف" type="tel" placeholder="+971 4 xxx xxxx" dir="ltr"
                value={buyer.phone} onChange={(v) => setBuyer((b) => ({ ...b, phone: v }))} />
              <TextField id="po-bemail" label="البريد الإلكتروني" type="email" placeholder="procurement@company.ae" dir="ltr"
                value={buyer.email} onChange={(v) => setBuyer((b) => ({ ...b, email: v }))} />
              <TrnField id="po-btrn" label="الرقم الضريبي TRN (اختياري)" hint="(تحقق شكلي فقط)"
                value={buyer.trn} onChange={(v) => setBuyer((b) => ({ ...b, trn: v }))} />
            </div>
          </section>

          {/* 3 — Supplier */}
          <section className="po-card" aria-labelledby="po-s3">
            <StepTitle icon="truck" id="po-s3">بيانات المورد (Supplier)</StepTitle>
            <div className="po-two">
              <TextField id="po-sname" span label="اسم المورد *" placeholder="شركة التوريدات التقنية ذ.م.م"
                value={supplier.name} onChange={(v) => setSupplier((s) => ({ ...s, name: v }))} />
              <TextField id="po-scontact" label="جهة الاتصال" placeholder="مندوب المبيعات"
                value={supplier.contactPerson} onChange={(v) => setSupplier((s) => ({ ...s, contactPerson: v }))} />
              <SelectField id="po-semirate" label="الإمارة" value={supplier.emirate} onChange={(v) => setSupplier((s) => ({ ...s, emirate: v }))}>
                <option value="">— اختر —</option>
                {EMIRATES.map((em) => <option key={em}>{em}</option>)}
              </SelectField>
              <TextField id="po-saddr" span label="العنوان" placeholder="المنطقة الصناعية، جبل علي"
                value={supplier.address} onChange={(v) => setSupplier((s) => ({ ...s, address: v }))} />
              <TextField id="po-sphone" label="الهاتف" type="tel" placeholder="+971 4 xxx xxxx" dir="ltr"
                value={supplier.phone} onChange={(v) => setSupplier((s) => ({ ...s, phone: v }))} />
              <TextField id="po-semail" label="البريد الإلكتروني" type="email" placeholder="sales@supplier.ae" dir="ltr"
                value={supplier.email} onChange={(v) => setSupplier((s) => ({ ...s, email: v }))} />
              <TrnField id="po-strn" label="الرقم الضريبي TRN (اختياري)"
                value={supplier.trn} onChange={(v) => setSupplier((s) => ({ ...s, trn: v }))} />
            </div>
          </section>

          {/* 4 — Lines */}
          <section className="po-card" aria-labelledby="po-s4">
            <StepTitle icon="box" id="po-s4">بنود الطلب</StepTitle>
            <div className="po-stack">
              {lines.map((line, idx) => {
                const calc = lineCalcs[idx];
                const rateObj = VAT_RATES.find((r) => r.id === line.vatRateId) || VAT_RATES[0];
                const overDisc = discountExceedsGross(line.qty, line.unitPrice, line.discount);
                const k = `po-l${line.id}`;
                return (
                  <fieldset key={line.id} className="po-line">
                    <legend className="po-legend">بند {idx + 1}</legend>
                    <div className="po-actions po-line-top">
                      <button type="button" className="po-link" aria-label={`تكرار البند ${idx + 1}`} onClick={() => duplicateLine(line.id)}><Icon name="copy" size={15} />تكرار</button>
                      {lines.length > 1 && (
                        <button type="button" className="po-link" aria-label={`حذف البند ${idx + 1}`} onClick={() => removeLine(line.id)}><Icon name="trash" size={15} />حذف</button>
                      )}
                    </div>

                    <div className="po-line-grid">
                      <div className="po-c3">
                        <TextField id={`${k}-name`} label="الوصف / اسم الصنف *" placeholder="كرسي مكتب مع ظهر داعم"
                          value={line.name} onChange={(v) => updateLine(line.id, "name", v)} />
                      </div>
                      <div className="po-c2">
                        <TextField id={`${k}-sku`} label="كود الصنف / SKU (اختياري)" placeholder="CHAIR-001" dir="ltr"
                          value={line.sku} onChange={(v) => updateLine(line.id, "sku", v)} />
                      </div>
                      <SelectField id={`${k}-unit`} label="الوحدة" value={line.unit} onChange={(v) => updateLine(line.id, "unit", v)}>
                        {UNITS.map((u) => <option key={u}>{u}</option>)}
                      </SelectField>
                    </div>

                    <div className="po-line-grid4">
                      <TextField id={`${k}-qty`} label="الكمية" type="number" min="0" step="any" placeholder="1" dir="ltr"
                        value={line.qty} onChange={(v) => updateLine(line.id, "qty", v)} />
                      <TextField id={`${k}-price`} label={`سعر الوحدة (${cur})`} type="number" min="0" step="any" placeholder="0.00" dir="ltr"
                        value={line.unitPrice} onChange={(v) => updateLine(line.id, "unitPrice", v)} />
                      <Field id={`${k}-disc`} label={`الخصم (${cur})`}>
                        <input id={`${k}-disc`} className="po-input" type="number" min="0" step="any" placeholder="0" dir="ltr"
                          aria-invalid={overDisc} aria-describedby={overDisc ? `${k}-disc-msg` : undefined}
                          value={line.discount} onChange={(e) => updateLine(line.id, "discount", e.target.value)} />
                        {overDisc && <p id={`${k}-disc-msg`} className="po-err"><Icon name="alert" size={14} />الخصم يتجاوز قيمة البند</p>}
                      </Field>
                      {poDetails.showVat && (
                        <SelectField id={`${k}-vat`} label="نسبة الضريبة" value={line.vatRateId} onChange={(v) => updateLine(line.id, "vatRateId", v)}>
                          {VAT_RATES.map((r) => <option key={r.id} value={r.id}>{r.tag} — {r.label}</option>)}
                        </SelectField>
                      )}
                    </div>

                    {parseNum(line.unitPrice) > 0 && (
                      <dl className="po-mini">
                        <div><dt>قبل الخصم</dt><dd className="po-ltr">{fmt(calc?.gross)} {cur}</dd></div>
                        {poDetails.showVat && <div><dt>الضريبة ({rateObj.tag})</dt><dd className="po-ltr">{fmt(calc?.vatAmount)}</dd></div>}
                        <div className="po-mini-t"><dt>الإجمالي</dt><dd className="po-ltr">{fmt(calc?.lineTotal)}</dd></div>
                      </dl>
                    )}
                  </fieldset>
                );
              })}
            </div>
            <button type="button" className="po-add" onClick={addLine}><Icon name="plus" size={18} />إضافة بند جديد</button>
          </section>

          {/* 5 — Charges */}
          <section className="po-card" aria-labelledby="po-s5">
            <StepTitle icon="receipt" id="po-s5">رسوم إضافية (اختياري)</StepTitle>
            <div className="po-dash po-noprint" role="note">
              <p className="po-small-b po-with-ico"><span className="po-ico"><Icon name="alert" size={18} /></span>تنبيه: معالجة ضريبة القيمة المضافة على الرسوم الإضافية</p>
              <p className="po-small">
                المبالغ المدخلة هنا تُضاف كما هي إلى الإجمالي النهائي — بدون احتساب ضريبة قيمة مضافة إضافية.
                إذا كانت هذه الرسوم خاضعة لـ VAT، فيجب أن يشمل المبلغ المدخل ضريبة القيمة المضافة، أو يمكنك إضافتها كبند منفصل في قسم «بنود الطلب» باختيار نسبة الضريبة المناسبة.
                المعالجة الضريبية الفعلية تحددها الفاتورة الضريبية الرسمية الصادرة من المورد.
              </p>
            </div>
            <div className="po-stack">
              {[
                { key: "shipping", placeholder: "رسوم الشحن والتوصيل", lab: "التسمية" },
                { key: "installation", placeholder: "رسوم التركيب والتشغيل", lab: "التسمية" },
                { key: "custom", placeholder: "رسوم إضافية...", lab: "رسوم مخصصة (التسمية)" },
              ].map(({ key, placeholder, lab }) => (
                <div key={key} className="po-two">
                  <TextField id={`po-c-${key}-l`} label={lab} placeholder={placeholder} value={charges[key].label}
                    onChange={(v) => setCharges((c) => ({ ...c, [key]: { ...c[key], label: v } }))} />
                  <TextField id={`po-c-${key}-a`} label={`المبلغ (${cur}) — كما هو، بدون VAT إضافي`} type="number" min="0" step="any" placeholder="0.00" dir="ltr"
                    value={charges[key].amount}
                    onChange={(v) => setCharges((c) => ({ ...c, [key]: { ...c[key], amount: v } }))} />
                </div>
              ))}
            </div>
          </section>

          {/* Totals */}
          <section className="po-result" aria-live="polite" aria-labelledby="po-tot">
            <h2 id="po-tot" className="po-result-h">ملخص الإجماليات</h2>
            <div className="po-tbox"><TotalRows bi={false} /></div>
            <div className="po-grand-row">
              <span>الإجمالي النهائي</span>
              <span className="po-ltr">{fmt(totals.grandTotal)} {cur}</span>
            </div>
          </section>

          {/* 6 — Delivery */}
          <section className="po-card" aria-labelledby="po-s6">
            <StepTitle icon="wallet" id="po-s6">شروط التسليم والدفع</StepTitle>
            <div className="po-two">
              <TextField id="po-d-addr" span label="عنوان التسليم" placeholder="نفس عنوان الشركة أو عنوان مختلف"
                value={delivery.address} onChange={(v) => setDelivery((d) => ({ ...d, address: v }))} />
              <TextField id="po-d-terms" label="شروط الدفع" value={delivery.paymentTerms}
                onChange={(v) => setDelivery((d) => ({ ...d, paymentTerms: v }))} />
              <TextField id="po-d-method" label="طريقة الدفع (اختياري)" placeholder="تحويل بنكي / شيك"
                value={delivery.paymentMethod} onChange={(v) => setDelivery((d) => ({ ...d, paymentMethod: v }))} />
              <TextField id="po-d-instr" span label="تعليمات التسليم (اختياري)" placeholder="التسليم خلال 7 أيام عمل — التغليف المطلوب..."
                value={delivery.instructions} onChange={(v) => setDelivery((d) => ({ ...d, instructions: v }))} />
              <TextField id="po-d-warr" label="شروط الضمان (اختياري)" placeholder="ضمان سنة ضد عيوب التصنيع"
                value={delivery.warranty} onChange={(v) => setDelivery((d) => ({ ...d, warranty: v }))} />
              <TextField id="po-d-ret" label="شروط الإرجاع والاستبدال (اختياري)" placeholder="إرجاع خلال 14 يوماً بحالة جيدة"
                value={delivery.returns} onChange={(v) => setDelivery((d) => ({ ...d, returns: v }))} />
              <TextField id="po-d-notes" span area label="ملاحظات إضافية" placeholder="أي تعليمات أو متطلبات خاصة..."
                value={delivery.notes} onChange={(v) => setDelivery((d) => ({ ...d, notes: v }))} />
            </div>
          </section>

          {/* Completeness checker */}
          <section className="po-card" aria-labelledby="po-chk">
            <div className="po-head-row">
              <div className="po-chk-head">
                <span className="po-tile"><Icon name="shield" size={20} /></span>
                <div>
                  <h2 id="po-chk" className="po-h2-plain">فحص مبدئي لاكتمال أمر الشراء</h2>
                  <p className="po-small">تحقق شكلي — ليس شرطاً قانونياً</p>
                </div>
              </div>
              <button type="button" className="po-link" aria-expanded={showChecker} aria-controls="po-chk-list" onClick={() => setShowChecker((v) => !v)}>
                {showChecker ? "إخفاء التفاصيل" : "عرض التفاصيل"}
              </button>
            </div>

            <div className="po-stack-s">
              <div className="po-row-between po-small-b"><span>اكتمال الحقول</span><span>{completePct}%</span></div>
              <div className="po-track" role="img" aria-label={`اكتمال الحقول ${completePct}%`}>
                <div className="po-fill" style={{ width: `${completePct}%` }} />
              </div>
              <p className="po-small-b">
                مكتمل: {okCount}
                {warnCount > 0 && <> · يحتاج مراجعة: {warnCount}</>}
                {missCount > 0 && <> · مفقود: {missCount}</>}
              </p>
            </div>

            {showChecker && (
              <ul id="po-chk-list" className="po-checks">
                {checks.map((c, i) => {
                  const word = c.status === "ok" ? "مكتمل" : c.status === "warning" ? "يحتاج مراجعة" : "مفقود";
                  return (
                    <li key={i} className={`po-check ${c.status === "missing" ? "po-check-miss" : c.status === "warning" ? "po-check-warn" : "po-check-ok"}`}>
                      <span className="po-mark" aria-hidden="true"><Icon name={c.status === "ok" ? "check" : "alert"} size={14} /></span>
                      <span><strong>{c.label}</strong> ({word}){c.hint && <> — {c.hint}</>}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Actions */}
          <div className="po-actions po-bottom">
            <button
              type="button"
              className="po-btn po-btn-p"
              onClick={() => setActiveTab("preview")}
              disabled={hasOverDiscount}
              aria-disabled={hasOverDiscount}
            >
              <Icon name="eye" size={18} />معاينة أمر الشراء
            </button>
            <button
              type="button"
              className="po-btn po-btn-o"
              onClick={handlePrint}
              disabled={hasOverDiscount}
              aria-disabled={hasOverDiscount}
            >
              <Icon name="print" size={18} />طباعة / PDF
            </button>
            <button type="button" className="po-btn po-btn-o" onClick={handleOpenInvoice}>
              <Icon name="external" size={18} />فتح مولد الفاتورة<span className="po-sr"> (يفتح في نافذة جديدة)</span>
            </button>
          </div>

          {/* Over-discount blocking error */}
          {hasOverDiscount && (
            <aside className="po-note po-note-err" role="alert" aria-live="assertive">
              <span className="po-ico"><Icon name="alert" size={20} /></span>
              <div className="po-note-body">
                <p className="po-small-b">لا يمكن معاينة أو طباعة أمر الشراء</p>
                <p className="po-small">
                  {overDiscountLines.length === 1
                    ? `البند "${overDiscountLines[0].name || (lines.indexOf(overDiscountLines[0]) + 1)}" يحتوي على خصم يتجاوز قيمة البند.`
                    : `${overDiscountLines.length} بنود تحتوي على خصوم تتجاوز قيمتها.`
                  }
                  {" "}يرجى تصحيح قيم الخصم قبل المتابعة — الطباعة بقيم متناقضة قد تُصدر وثيقة مالية مضللة.
                </p>
              </div>
            </aside>
          )}

          <aside className="po-note-b">
            <span className="po-ico"><Icon name="info" size={20} /></span>
            <div>
              <p className="po-small-b">ملاحظة</p>
              <p className="po-small">أمر الشراء ليس فاتورة ضريبية. لإصدار فاتورة ضريبية معتمدة استخدم مولد الفاتورة الضريبية الإماراتي — بعد قبول المورد لأمر الشراء وإتمام التوريد.</p>
            </div>
          </aside>
        </div>
      )}

      {/* ══════════════ PREVIEW ══════════════ */}
      {activeTab === "preview" && (
        <>
          <div className="po-actions po-noprint">
            <button type="button" className="po-btn po-btn-o" onClick={() => setActiveTab("form")}><Icon name="edit" size={18} />العودة للتعديل</button>
            <button
              type="button"
              className="po-btn po-btn-p"
              onClick={handlePrint}
              disabled={hasOverDiscount}
              aria-disabled={hasOverDiscount}
            ><Icon name="print" size={18} />طباعة / PDF</button>
          </div>

          <article id="po-print" className="po-doc">
            <div className="po-doc-head">
              <div className="po-doc-head-row">
                <div>
                  <p className="po-doc-title">أمر شراء</p>
                  <p className="po-doc-sub">PURCHASE ORDER</p>
                  {poDetails.status && statusLabel && <span className="po-doc-status">{statusLabel}</span>}
                </div>
                <div className="po-doc-meta" dir="ltr">
                  <p>رقم أمر الشراء / PO No.</p>
                  <p className="po-doc-no">{poDetails.poNumber || "—"}</p>
                  {poDetails.quoteRef && <p>Quote Ref: {poDetails.quoteRef}</p>}
                  {poDetails.projectRef && <p>Project: {poDetails.projectRef}</p>}
                  <p>{cur}</p>
                </div>
              </div>
              <div className="po-doc-dates" dir="ltr">
                <span>التاريخ / Date: <strong>{poDetails.issueDate || "—"}</strong></span>
                {poDetails.deliveryDate && <span>التسليم / Delivery: <strong>{poDetails.deliveryDate}</strong></span>}
                {poDetails.requestedBy && <span>Requested By: <strong>{poDetails.requestedBy}</strong></span>}
              </div>
            </div>

            <div className="po-doc-body" dir="rtl">
              <div className="po-doc-parties">
                <div className="po-doc-box">
                  <p className="po-doc-cap">المشتري · Buyer</p>
                  <p className="po-doc-name">{buyer.name || "—"}</p>
                  {buyer.contactPerson && <p>{buyer.contactPerson}</p>}
                  {buyer.address && <p>{buyer.address}</p>}
                  {buyer.emirate && <p>{buyer.emirate}، الإمارات</p>}
                  {buyer.phone && <p dir="ltr">{buyer.phone}</p>}
                  {buyer.email && <p dir="ltr">{buyer.email}</p>}
                  {buyer.trn && <p className="po-doc-vat">TRN: <span dir="ltr">{buyer.trn}</span></p>}
                </div>
                <div className="po-doc-box">
                  <p className="po-doc-cap">المورد · Supplier</p>
                  <p className="po-doc-name">{supplier.name || "—"}</p>
                  {supplier.contactPerson && <p>{supplier.contactPerson}</p>}
                  {supplier.address && <p>{supplier.address}</p>}
                  {supplier.emirate && <p>{supplier.emirate}، الإمارات</p>}
                  {supplier.phone && <p dir="ltr">{supplier.phone}</p>}
                  {supplier.email && <p dir="ltr">{supplier.email}</p>}
                  {supplier.trn && <p className="po-doc-vat">TRN: <span dir="ltr">{supplier.trn}</span></p>}
                </div>
              </div>

              <p className="po-scroll-hint po-noprint">اسحب الجدول يميناً ويساراً لعرض كل الأعمدة</p>
              <div className="po-doc-scroll">
                <table className="po-doc-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>الوصف / Description</th>
                      <th>SKU</th>
                      <th>الكمية / Qty</th>
                      <th>الوحدة</th>
                      <th>سعر الوحدة / Unit Price</th>
                      <th>الخصم</th>
                      {poDetails.showVat && <th>نسبة الضريبة</th>}
                      {poDetails.showVat && <th>مبلغ الضريبة</th>}
                      <th>الإجمالي / Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, idx) => {
                      const calc = lineCalcs[idx];
                      const rateObj = VAT_RATES.find((r) => r.id === line.vatRateId) || VAT_RATES[0];
                      return (
                        <tr key={line.id}>
                          <td>{idx + 1}</td>
                          <td className="po-doc-strong">{line.name || "—"}</td>
                          <td dir="ltr">{line.sku || "—"}</td>
                          <td dir="ltr">{line.qty}</td>
                          <td>{line.unit}</td>
                          <td dir="ltr">{fmt(parseNum(line.unitPrice))}</td>
                          <td dir="ltr">{parseNum(calc?.effectiveDiscount) > 0 ? `(${fmt(calc.effectiveDiscount)})` : "—"}</td>
                          {poDetails.showVat && <td><span className="po-doc-tag">{rateObj.tag}</span></td>}
                          {poDetails.showVat && <td dir="ltr">{fmt(calc?.vatAmount)}</td>}
                          <td className="po-doc-strong" dir="ltr">{fmt(calc?.lineTotal)}</td>
                        </tr>
                      );
                    })}
                    {chargeRows.map((c, i) => (
                      <tr key={`charge-${i}`}>
                        <td>—</td>
                        <td>
                          <em>{c.label}</em>
                          <span className="po-doc-charge-note"> (رسوم إضافية — بدون VAT إضافي)</span>
                        </td>
                        <td colSpan={poDetails.showVat ? 7 : 5} />
                        <td className="po-doc-strong" dir="ltr">{fmt(parseNum(c.amount))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="po-doc-tot-wrap">
                <div className="po-doc-tot">
                  <TotalRows bi />
                  <div className="po-doc-grand">
                    <span>الإجمالي / Grand Total</span>
                    <span className="po-ltr">{fmt(totals.grandTotal)} {cur}</span>
                  </div>
                </div>
              </div>

              {(delivery.address || delivery.paymentTerms || delivery.instructions || delivery.warranty || delivery.returns || delivery.paymentMethod) && (
                <div className="po-doc-box">
                  <p className="po-doc-cap">شروط التسليم والدفع / Delivery &amp; Payment Terms</p>
                  <div className="po-doc-terms">
                    {delivery.address && <p className="po-doc-wide"><strong>عنوان التسليم: </strong>{delivery.address}</p>}
                    {delivery.paymentTerms && <p><strong>الدفع: </strong>{delivery.paymentTerms}</p>}
                    {delivery.paymentMethod && <p><strong>طريقة الدفع: </strong>{delivery.paymentMethod}</p>}
                    {delivery.instructions && <p className="po-doc-wide"><strong>تعليمات التسليم: </strong>{delivery.instructions}</p>}
                    {delivery.warranty && <p><strong>الضمان: </strong>{delivery.warranty}</p>}
                    {delivery.returns && <p><strong>الإرجاع: </strong>{delivery.returns}</p>}
                  </div>
                </div>
              )}

              {delivery.notes && (
                <div className="po-doc-box">
                  <p className="po-doc-cap">ملاحظات / Notes</p>
                  <p>{delivery.notes}</p>
                </div>
              )}

              <div className="po-doc-sigs">
                {[
                  { ar: "إعداد", en: "Prepared By", name: buyer.contactPerson || buyer.name },
                  { ar: "اعتماد", en: "Approved By", name: "" },
                  { ar: "إقرار المورد", en: "Supplier Acknowledgement", name: supplier.name },
                ].map((sig, i) => (
                  <div key={i}>
                    <div className="po-doc-line" />
                    <p className="po-doc-strong">{sig.ar} / {sig.en}</p>
                    {sig.name && <p>{sig.name}</p>}
                  </div>
                ))}
              </div>

              <div className="po-doc-disc">
                <span className="po-doc-excl" aria-hidden="true">!</span>
                <p>
                  هذا أمر شراء تجاري وليس فاتورة ضريبية — غير مرتبط بالهيئة الاتحادية للضرائب (FTA) ولا يحمل اعتمادها.
                  {" "}This is a commercial Purchase Order, not a Tax Invoice. Not affiliated with or approved by the UAE FTA.
                </p>
              </div>
            </div>
          </article>
        </>
      )}
    </div>
  );
}

/**
 * Styles. Form UI follows the Qemlo system (glossy orange, 26px cards, 16px inputs).
 * The printed document (.po-doc) always uses fixed ink-on-white colours.
 */
function PoStyles() {
  return (
    <style>{`
      .po-root{
        --f-bg:#F5F5F2; --f-surface:#FFFFFF; --f-line:#E1E1DA; --f-ink:#0D0D0D; --f-t2:#55554F; --f-t3:#8A8A82;
        --f-soft:rgba(13,13,13,.04); --f-shadow:0 1px 0 rgba(255,255,255,.9) inset, 0 12px 32px -18px rgba(13,13,13,.28);
        --f-err-bg:#FFF1EC; --f-err-tx:#B42318;
      }
      @media (prefers-color-scheme:dark){
        .po-root{
          --f-bg:#0D0D0D; --f-surface:#171717; --f-line:#2A2A27; --f-ink:#F5F5F2; --f-t2:#B4B4AC; --f-t3:#7C7C75;
          --f-soft:rgba(255,255,255,.05); --f-shadow:0 1px 0 rgba(255,255,255,.06) inset, 0 16px 36px -20px rgba(0,0,0,.9);
          --f-err-bg:#2A1411; --f-err-tx:#FDA29B;
        }
      }
      .po-root{
        --po-ink:var(--text,var(--f-ink)); --po-text2:var(--text-2,var(--f-t2)); --po-dim:var(--text-3,var(--f-t3));
        --po-surface:var(--surface,var(--f-surface)); --po-bg:var(--bg,var(--f-bg)); --po-line:var(--border,var(--f-line));
        --po-orange:var(--orange,#FF5B04); --po-on:var(--on-orange,#0D0D0D);
        --po-gloss:linear-gradient(165deg,#FF9A52 0%,#FF5B04 46%,#E14600 100%);
        --po-gloss-sh:inset 0 1px 0 rgba(255,255,255,.5), inset 0 -3px 8px rgba(120,30,0,.25), 0 14px 28px -12px rgba(255,91,4,.6);
        --po-r:26px; --po-r-sm:16px;
        max-width:52rem; margin:0 auto; padding:1.5rem 1rem 3rem; color:var(--po-ink); display:grid; gap:1.25rem; line-height:1.6;
      }
      @media (min-width:640px){ .po-root{ padding:2.5rem 1.5rem 4rem; } }
      .po-root *{ box-sizing:border-box; }
      .po-root :focus-visible{ outline:3px solid var(--po-orange); outline-offset:2px; }
      .po-ltr{ direction:ltr; unicode-bidi:isolate; display:inline-block; }
      .po-sr{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
      .po-stack{ display:grid; gap:1.25rem; }
      .po-stack-s{ display:grid; gap:.5rem; }

      /* Cards + text */
      .po-card{
        background:var(--po-surface); border:1px solid var(--po-line); border-radius:var(--po-r); padding:1.25rem;
        display:grid; gap:1rem; box-shadow:var(--f-shadow); transition:border-color .2s, box-shadow .2s;
      }
      @media (min-width:640px){ .po-card{ padding:1.5rem; } }
      .po-card:hover{ border-color:var(--po-orange); box-shadow:0 0 0 3px color-mix(in srgb,var(--po-orange) 20%,transparent), var(--f-shadow); }
      .po-h1{ margin:0; display:flex; align-items:center; gap:.75rem; font-size:1.375rem; font-weight:800; line-height:1.4; }
      .po-h2{ margin:0; display:flex; align-items:center; gap:.75rem; font-size:1.0625rem; font-weight:800; line-height:1.5; }
      .po-h2-plain{ margin:0; font-size:1.0625rem; font-weight:800; line-height:1.5; }
      .po-chk-head{ display:flex; align-items:center; gap:.75rem; }
      .po-tile{
        flex:none; width:2.5rem; height:2.5rem; display:inline-flex; align-items:center; justify-content:center;
        border-radius:14px; background:var(--po-gloss); color:var(--po-on); box-shadow:var(--po-gloss-sh);
      }
      .po-lead{ margin:.5rem 0 0; font-size:.875rem; line-height:1.8; color:var(--po-text2); }
      .po-small{ margin:0; font-size:.8125rem; line-height:1.8; color:var(--po-text2); }
      .po-small-b{ margin:0; font-size:.875rem; font-weight:800; }
      .po-with-ico{ display:flex; align-items:center; gap:.5rem; }
      .po-head-row,.po-row-between{ display:flex; flex-wrap:wrap; gap:1rem; justify-content:space-between; align-items:flex-start; }
      .po-actions{ display:flex; flex-wrap:wrap; gap:.5rem; align-items:center; }
      .po-draft{ padding-top:.25rem; }
      .po-push{ margin-inline-start:auto; }
      .po-dash{ border:1px dashed var(--po-dim); border-radius:var(--po-r-sm); background:var(--f-soft); padding:.875rem 1rem; display:grid; gap:.5rem; }
      .po-vat-row{ display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:.75rem; }
      .po-ico{ flex:none; display:inline-flex; margin-top:.1rem; color:var(--po-orange); }
      .po-with-ico .po-ico{ margin-top:0; }
      .po-note,.po-note-b{
        display:flex; gap:.75rem; align-items:flex-start; background:var(--po-surface); border:1px solid var(--po-line);
        border-inline-start:6px solid var(--po-orange); border-radius:var(--po-r-sm); padding:.875rem 1rem; box-shadow:var(--f-shadow);
      }
      .po-note-err{ background:var(--f-err-bg); border-color:var(--f-err-tx); border-inline-start-color:var(--f-err-tx); }
      .po-note-err .po-ico{ color:var(--f-err-tx); }
      .po-note-body{ display:grid; gap:.375rem; }
      .po-mark{
        flex:none; width:1.5rem; height:1.5rem; display:inline-flex; align-items:center; justify-content:center;
        border-radius:8px; background:#0D0D0D; color:#FF7A33;
      }
      @media (prefers-color-scheme:dark){ .po-mark{ background:#2A2A27; } }

      /* Buttons */
      .po-btn{
        display:inline-flex; align-items:center; justify-content:center; gap:.5rem; padding:.5rem 1rem; min-height:2.75rem;
        border:1.5px solid var(--po-line); border-radius:var(--po-r-sm); font-size:.875rem; font-weight:800;
        font-family:inherit; cursor:pointer; background:var(--po-surface); color:var(--po-ink); transition:border-color .15s, transform .15s, background-color .15s;
      }
      .po-btn:hover{ border-color:var(--po-orange); }
      .po-btn:disabled,.po-btn[aria-disabled="true"]{ opacity:.45; cursor:not-allowed; pointer-events:none; }
      .po-btn-sm{ padding:.375rem .875rem; font-size:.8125rem; }
      .po-btn-p{ background:var(--po-gloss); border-color:transparent; color:var(--po-on); box-shadow:var(--po-gloss-sh); flex:1; }
      .po-btn-p:hover{ transform:translateY(-1px); border-color:transparent; }
      .po-bottom .po-btn{ flex:1; min-height:3rem; padding:.75rem 1rem; }
      .po-link{
        display:inline-flex; align-items:center; gap:.375rem; background:none; border:0; padding:.25rem .5rem; min-height:2.25rem;
        border-radius:999px; font-family:inherit; font-size:.8125rem; font-weight:800; color:var(--po-orange); cursor:pointer;
      }
      .po-link:hover{ background:color-mix(in srgb,var(--po-orange) 14%,transparent); }
      .po-add{
        width:100%; display:inline-flex; align-items:center; justify-content:center; gap:.5rem; min-height:3rem; padding:.75rem;
        border:1.5px dashed var(--po-dim); border-radius:var(--po-r-sm); background:transparent; color:var(--po-ink);
        font-family:inherit; font-size:.875rem; font-weight:800; cursor:pointer; transition:border-color .15s, color .15s;
      }
      .po-add:hover{ border-color:var(--po-orange); color:var(--po-orange); }

      /* Tabs / segmented */
      .po-tabs,.po-seg{ display:flex; gap:.25rem; padding:.25rem; border:1px solid var(--po-line); border-radius:999px; background:var(--f-soft); }
      .po-tabs button,.po-seg button{
        flex:1; display:inline-flex; align-items:center; justify-content:center; gap:.5rem; min-height:2.5rem; padding:.25rem 1rem;
        border:0; border-radius:999px; background:transparent; color:var(--po-ink);
        font-size:.875rem; font-weight:800; font-family:inherit; cursor:pointer; transition:background-color .15s;
      }
      .po-tabs button:hover,.po-seg button:hover{ background:var(--f-soft); }
      .po-tabs button[aria-pressed="true"],.po-seg button[aria-pressed="true"]{ background:var(--po-gloss); color:var(--po-on); box-shadow:var(--po-gloss-sh); }
      .po-tabs button:disabled,.po-tabs button[aria-disabled="true"]{ opacity:.4; cursor:not-allowed; pointer-events:none; }
      .po-seg button{ flex:none; padding:.25rem 1.25rem; }

      /* Fields */
      .po-two{ display:grid; gap:1rem; grid-template-columns:minmax(0,1fr); }
      @media (min-width:640px){ .po-two{ grid-template-columns:repeat(2,minmax(0,1fr)); } .po-span{ grid-column:1 / -1; } }
      .po-field{ display:grid; gap:.5rem; align-content:start; min-width:0; }
      .po-label{ font-size:.875rem; font-weight:700; line-height:1.6; }
      .po-hint{ font-weight:600; color:var(--po-text2); font-size:.75rem; }
      .po-input{
        width:100%; min-width:0; min-height:3rem; border:1.5px solid var(--po-line); border-radius:var(--po-r-sm);
        background:var(--po-bg); color:var(--po-ink); padding:.5rem .875rem;
        font-size:.9375rem; font-weight:700; font-family:inherit; transition:border-color .15s, box-shadow .15s;
      }
      .po-input:hover{ border-color:var(--po-dim); }
      .po-input:focus-visible{ outline:none; border-color:var(--po-orange); box-shadow:0 0 0 4px color-mix(in srgb,var(--po-orange) 28%,transparent); }
      .po-input::placeholder{ color:var(--po-dim); font-weight:500; }
      .po-input[aria-invalid="true"]{ border-color:var(--f-err-tx); background:var(--f-err-bg); }
      textarea.po-input{ resize:vertical; line-height:1.7; }
      .po-select{
        cursor:pointer; color-scheme:light dark; appearance:none; -webkit-appearance:none; padding-inline-start:2.5rem; text-overflow:ellipsis;
        background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23FF5B04' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat:no-repeat; background-position:left .875rem center;
      }
      .po-select option{ background:var(--po-surface); color:var(--po-ink); }
      .po-err,.po-ok{ margin:0; display:flex; align-items:center; gap:.375rem; font-size:.8125rem; font-weight:800; }
      .po-err{ color:var(--f-err-tx); }
      .po-ok{ color:var(--po-orange); }

      /* Lines */
      .po-line{
        border:1px solid var(--po-line); border-radius:20px; background:var(--f-soft);
        margin:0; padding:1rem; display:grid; gap:.875rem; min-width:0;
      }
      .po-legend{ padding:0 .625rem; font-size:.875rem; font-weight:800; }
      .po-line-top{ justify-content:flex-end; }
      .po-line-grid,.po-line-grid4{ display:grid; gap:.875rem; grid-template-columns:minmax(0,1fr); }
      @media (min-width:640px){
        .po-line-grid{ grid-template-columns:repeat(6,minmax(0,1fr)); }
        .po-c3{ grid-column:span 3; } .po-c2{ grid-column:span 2; }
        .po-line-grid4{ grid-template-columns:repeat(4,minmax(0,1fr)); }
      }
      .po-mini{ margin:0; display:grid; gap:.25rem; font-size:.8125rem; padding:.75rem .875rem; border:1px dashed var(--po-dim); border-radius:var(--po-r-sm); background:var(--po-surface); }
      .po-mini div{ display:flex; justify-content:space-between; gap:.5rem; }
      .po-mini dt{ color:var(--po-text2); } .po-mini dd{ margin:0; font-weight:800; }
      .po-mini-t{ border-top:1.5px dashed var(--po-dim); padding-top:.375rem; margin-top:.125rem; }
      .po-mini-t dt{ color:var(--po-ink); font-weight:800; }

      /* Totals (glossy orange panel) */
      .po-result{
        position:relative; overflow:hidden; background:var(--po-gloss); color:#0D0D0D; border-radius:var(--po-r);
        padding:1.5rem 1.25rem; display:grid; gap:.875rem; box-shadow:var(--po-gloss-sh);
      }
      .po-result::before{ content:""; position:absolute; inset:0 0 62% 0; pointer-events:none; background:linear-gradient(180deg,rgba(255,255,255,.34),rgba(255,255,255,0)); }
      .po-result>*{ position:relative; }
      .po-result-h{ margin:0; font-size:1.0625rem; font-weight:800; }
      .po-tbox{ background:#0D0D0D; color:#F5F5F2; border-radius:18px; overflow:hidden; }
      .po-trow{ display:flex; justify-content:space-between; gap:1rem; padding:.5rem .875rem; border-top:1px solid #2E2E2B; font-size:.875rem; font-weight:700; }
      .po-trow:first-child{ border-top:0; }
      .po-trow-b{ border-top:1.5px solid #FF7A33; font-weight:800; }
      .po-grand-row{ display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap; align-items:center; font-size:1.25rem; font-weight:800; }

      /* Checker */
      .po-track{ height:.875rem; border:1px solid var(--po-line); border-radius:999px; background:var(--f-soft); overflow:hidden; direction:ltr; }
      .po-fill{ height:100%; background:var(--po-gloss); border-radius:999px; transition:width .35s ease; }
      .po-checks{ margin:0; padding:0; list-style:none; display:grid; gap:.5rem; }
      .po-check{ display:flex; gap:.625rem; align-items:flex-start; border:1px solid var(--po-line); border-radius:var(--po-r-sm); padding:.625rem .875rem; font-size:.875rem; line-height:1.7; }
      .po-check-warn{ border-style:dashed; border-color:var(--po-dim); }
      .po-check-miss{ border-style:dashed; border-color:var(--f-err-tx); background:var(--f-err-bg); }

      @media (prefers-reduced-motion:reduce){ .po-root *{ transition:none !important; } .po-btn-p:hover{ transform:none; } }

      /* ───── Preview document: fixed ink on white, independent of theme ───── */
      .po-doc{ --d-ink:#0a0a0a; --d-text2:#404040; --d-or:#ff5a1f; background:#fff; color:var(--d-ink); border:2px solid #0a0a0a; border-radius:0; line-height:1.6; }
      .po-doc p{ margin:0; }
      .po-doc-head{ background:var(--d-or); color:#0a0a0a; border-bottom:2px solid #0a0a0a; padding:1.25rem 1.5rem; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
      .po-doc-head-row{ display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap; align-items:flex-start; }
      .po-doc-title{ font-size:1.5rem; font-weight:700; }
      .po-doc-sub{ font-size:.8125rem; font-weight:700; }
      .po-doc-status{ display:inline-block; margin-top:.5rem; border:2px solid #0a0a0a; padding:0 .625rem; font-size:.6875rem; font-weight:700; background:#fff; }
      .po-doc-meta{ text-align:right; font-size:.6875rem; font-weight:600; }
      .po-doc-no{ font-size:1.125rem; font-weight:700; }
      .po-doc-dates{ margin-top:.75rem; display:flex; flex-wrap:wrap; gap:1.5rem; font-size:.75rem; }
      .po-doc-body{ padding:1.25rem 1.5rem; display:grid; gap:1.25rem; }
      .po-doc-parties{ display:grid; gap:1rem; grid-template-columns:1fr; }
      @media (min-width:640px){ .po-doc-parties{ grid-template-columns:1fr 1fr; } }
      .po-doc-box{ border:2px solid var(--d-ink); padding:.75rem 1rem; font-size:.75rem; line-height:1.8; color:var(--d-text2); }
      .po-doc-cap{ font-size:.6875rem; font-weight:700; color:var(--d-ink); border-bottom:1px solid var(--d-ink); margin-bottom:.375rem !important; padding-bottom:.25rem; }
      .po-doc-name{ font-size:.875rem; font-weight:700; color:var(--d-ink); }
      .po-doc-vat{ font-size:.6875rem; margin-top:.25rem !important; }
      .po-doc-scroll{ overflow-x:auto; }
      .po-doc-table{ width:100%; border-collapse:collapse; font-size:.75rem; border:2px solid var(--d-ink); }
      .po-doc-table th{ background:#f0f0f0; text-align:right; padding:.5rem; font-weight:700; border-bottom:2px solid var(--d-ink); white-space:nowrap; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
      .po-doc-table td{ padding:.5rem; border-bottom:1px solid var(--d-ink); color:var(--d-text2); }
      .po-doc-table tr:last-child td{ border-bottom:0; }
      .po-doc-strong{ font-weight:700; color:var(--d-ink) !important; }
      .po-doc-tag{ border:1px solid var(--d-ink); padding:0 .375rem; font-size:.625rem; font-weight:700; }
      .po-doc-tot-wrap{ display:flex; justify-content:flex-end; }
      .po-doc-tot{ width:100%; max-width:20rem; border:2px solid var(--d-ink); }
      .po-doc-tot .po-trow{ background:#fff; color:var(--d-ink); border-top:1px solid var(--d-ink); font-size:.75rem; padding:.375rem .75rem; }
      .po-doc-tot .po-trow:first-child{ border-top:0; }
      .po-doc-tot .po-trow-b{ border-top:2px solid var(--d-ink); }
      .po-doc-grand{ display:flex; justify-content:space-between; gap:1rem; padding:.625rem .75rem; background:var(--d-or); color:#0a0a0a; border-top:2px solid var(--d-ink); font-size:.875rem; font-weight:700; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
      .po-doc-terms{ display:grid; gap:.25rem 1rem; grid-template-columns:1fr; }
      @media (min-width:640px){ .po-doc-terms{ grid-template-columns:1fr 1fr; } .po-doc-wide{ grid-column:1 / -1; } }
      .po-doc-terms strong{ color:var(--d-ink); }
      .po-doc-sigs{ display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; padding-top:.75rem; text-align:center; font-size:.6875rem; color:var(--d-text2); }
      .po-doc-line{ border-bottom:2px solid var(--d-ink); height:3rem; margin-bottom:.5rem; }
      .po-doc-charge-note{ font-size:.5625rem; font-weight:400; color:var(--d-text2); margin-inline-start:.375rem; }
      .po-doc-disc{ display:flex; gap:.5rem; align-items:flex-start; border:2px dashed var(--d-ink); padding:.625rem .75rem; font-size:.625rem; line-height:1.8; color:var(--d-text2); }
      .po-doc-excl{ flex:none; width:1.25rem; height:1.25rem; display:inline-flex; align-items:center; justify-content:center; border:2px solid var(--d-ink); font-weight:700; color:var(--d-ink); }


      /* ───── Mobile responsive ───── */
      .po-root > *{ min-width:0; }
      .po-scroll-hint{ display:none; margin:0; font-size:.75rem; color:#404040; }
      .po-line-grid .po-c3,.po-line-grid .po-c2{ min-width:0; }

      @media (max-width:639px){
        .po-root{ padding:1rem .75rem 2.5rem; gap:1rem; }
        .po-card{ padding:1rem; border-radius:22px; }
        .po-stack{ gap:1rem; }
        .po-h1{ font-size:1.125rem; gap:.625rem; }
        .po-h2{ font-size:1rem; }
        .po-tile{ width:2.25rem; height:2.25rem; border-radius:12px; }
        .po-lead{ font-size:.8125rem; }

        /* inputs: 16px stops iOS zoom-on-focus */
        .po-input{ font-size:1rem; min-height:3rem; }

        /* header + draft bar */
        .po-head-row{ flex-direction:column; align-items:stretch; gap:.75rem; }
        .po-head-row > .po-btn{ width:100%; }
        .po-draft{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.5rem; }
        .po-draft .po-btn{ width:100%; padding-inline:.5rem; }
        .po-draft .po-btn:last-of-type{ grid-column:1 / -1; }
        .po-draft .po-small{ grid-column:1 / -1; margin:0; }
        .po-push{ margin-inline-start:0; }
        .po-tabs button{ font-size:.8125rem; padding-inline:.5rem; gap:.375rem; }

        /* VAT toggle row */
        .po-vat-row{ flex-direction:column; align-items:stretch; }
        .po-seg{ width:100%; }
        .po-seg button{ flex:1; }

        /* lines */
        .po-line{ padding:.875rem .75rem; border-radius:18px; }
        .po-line-grid,.po-line-grid4{ grid-template-columns:repeat(2,minmax(0,1fr)); gap:.75rem; }
        .po-line-grid .po-c3{ grid-column:1 / -1; }
        .po-line-grid .po-c2{ grid-column:1 / 2; }
        .po-line-top{ justify-content:space-between; }
        .po-link{ min-height:2.75rem; padding:.25rem .75rem; }

        /* totals + checker */
        .po-result{ padding:1.25rem 1rem; border-radius:22px; }
        .po-trow{ flex-wrap:wrap; gap:.125rem .75rem; padding:.5rem .75rem; font-size:.8125rem; }
        .po-grand-row{ font-size:1.125rem; }
        .po-chk-head{ align-items:flex-start; }
        .po-check{ font-size:.8125rem; }

        /* bottom actions */
        .po-bottom{ flex-direction:column; align-items:stretch; }
        .po-bottom .po-btn{ width:100%; flex:none; }
        .po-note,.po-note-b{ padding:.75rem; }

        /* preview toolbar */
        .po-actions:not(.po-draft):not(.po-bottom):not(.po-line-top){ flex-direction:column; align-items:stretch; }
        .po-actions:not(.po-draft):not(.po-bottom):not(.po-line-top) .po-btn{ width:100%; flex:none; }

        /* preview document */
        .po-doc-head{ padding:1rem; }
        .po-doc-head-row{ flex-direction:column; }
        .po-doc-meta{ text-align:left; }
        .po-doc-title{ font-size:1.25rem; }
        .po-doc-dates{ gap:.5rem 1rem; flex-direction:column; }
        .po-doc-body{ padding:1rem; gap:1rem; }
        .po-doc-box{ padding:.625rem .75rem; }
        .po-scroll-hint{ display:block; }
        .po-doc-scroll{ -webkit-overflow-scrolling:touch; margin-inline:-.25rem; }
        .po-doc-table{ min-width:42rem; }
        .po-doc-tot{ max-width:none; }
        .po-doc-sigs{ grid-template-columns:1fr; gap:1rem; }
        .po-doc-line{ height:2.25rem; }
      }
      @media (max-width:380px){
        .po-line-grid,.po-line-grid4{ grid-template-columns:minmax(0,1fr); }
        .po-line-grid .po-c2{ grid-column:auto; }
        .po-tabs{ flex-direction:column; border-radius:22px; }
        .po-draft{ grid-template-columns:minmax(0,1fr); }
      }

      @media print{
        .po-scroll-hint{ display:none !important; }
        .po-doc-table{ min-width:0; }
        .po-doc-sigs{ grid-template-columns:repeat(3,1fr); }
        .po-doc-head-row{ flex-direction:row; }
        .po-doc-body{ padding:1.25rem 1.5rem; }
      }

      @media print{
        .po-noprint{ display:none !important; }
        .po-root{ padding:0; max-width:none; background:none; }
        .po-doc{ border:0; }
        .po-doc-scroll{ overflow:visible; }
        .po-doc-box,.po-doc-tot,.po-doc-sigs,.po-doc-disc{ break-inside:avoid; }
      }
    `}</style>
  );
}