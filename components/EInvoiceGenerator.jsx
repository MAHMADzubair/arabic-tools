"use client";

import { useState, useMemo, useEffect, useId } from "react";
import Link from "next/link";
import {
  formatSAR as fmt,
  parseNum,
  calcLineVat,
  isValidSaudiVatNumber,
  calcCompleteness,
} from "@/lib/businessUtils";
// NOTE: inputCls, labelCls and CheckItem are no longer imported. This file
// ships its own inputs, labels and check rows (styled with the Ink & Signal tokens).

// ─── VAT Rate Options ────────────────────────────────────────────────────────
const VAT_RATES = [
  { id: "15", label: "15% — خاضعة للنسبة الأساسية", rate: 0.15, tag: "15%" },
  { id: "0", label: "0% — صفرية المعدل (تصدير/أدوية)", rate: 0, tag: "0%" },
  { id: "exempt", label: "معفاة من الضريبة (إيجار سكني/مالية)", rate: null, tag: "معفاة" },
  { id: "out", label: "خارج نطاق الضريبة", rate: null, tag: "خارج النطاق" },
];

// ─── Invoice Type Options ────────────────────────────────────────────────────
const INVOICE_TYPES = [
  {
    id: "tax",
    labelAr: "فاتورة ضريبية",
    labelEn: "Tax Invoice (B2B)",
    desc: "للمعاملات بين منشآت الأعمال (B2B) — يُشترط فيها الرقم الضريبي للمشتري عند تسجيله",
    requiresBuyerVat: true,
  },
  {
    id: "simplified",
    labelAr: "فاتورة ضريبية مبسطة",
    labelEn: "Simplified Tax Invoice (B2C)",
    desc: "للمعاملات مع المستهلك النهائي (B2C) — تتطلب في المرحلة الأولى رمز QR وتفاصيل مبسطة",
    requiresBuyerVat: false,
  },
];

// ─── Preset Sample Data (unchanged) ──────────────────────────────────────────
const SAMPLE_PRESETS = {
  tax: {
    seller: {
      name: "شركة الرؤية التقنية للحلول الرقمية ذ.م.م",
      vatNumber: "300456789100003",
      cr: "1010654321",
      address: "طريق الملك فهد، حي الصحافة",
      city: "الرياض",
      country: "المملكة العربية السعودية",
    },
    buyer: {
      name: "شركة آفاق البناء للتجارة والمقاولات",
      vatNumber: "301234567890003",
      address: "طريق المدينة، حي الشاطئ، جدة",
    },
    invoiceDetails: {
      invoiceNumber: "INV-2026-B2B-0142",
      issueDate: new Date().toISOString().split("T")[0],
      issueTime: "10:30",
      supplyDate: new Date().toISOString().split("T")[0],
      currency: "SAR",
      notes: "شروط الدفع: سداد خلال 30 يوماً من تاريخ إصدار الفاتورة عبر التحويل البنكي لحساب الآيبان المسجل لدى المنشأة.",
    },
    lines: [
      {
        id: 1,
        name: "تطوير نظام إدارة الموارد والفوترة السحابية",
        desc: "تشمل التهيئة وربط واجهات API والدعم الفني للشهر الأول",
        qty: "1",
        unitPrice: "12000",
        vatRateId: "15",
        discount: "500",
      },
      {
        id: 2,
        name: "خدمات الاستضافة السحابية والنسخ الاحتياطي السنوي",
        desc: "سيرفر مخصص متوافق مع معايير الأمن السيبراني",
        qty: "2",
        unitPrice: "2500",
        vatRateId: "15",
        discount: "0",
      },
      {
        id: 3,
        name: "استشارات استراتيجية خارج نطاق الضريبة الإقليمي",
        desc: "خدمات استشارية تم تقديمها لفرع دولي خارجي",
        qty: "1",
        unitPrice: "3000",
        vatRateId: "out",
        discount: "0",
      },
    ],
  },
  simplified: {
    seller: {
      name: "مؤسسة زاد التقنية للأجهزة الإلكترونية",
      vatNumber: "300987654321003",
      cr: "1010432198",
      address: "طريق أنس بن مالك، حي الملقا",
      city: "الرياض",
      country: "المملكة العربية السعودية",
    },
    buyer: {
      name: "عبد العزيز بن سلطان التميمي (مستهلك نهائي)",
      vatNumber: "",
      address: "الرياض، المملكة العربية السعودية",
    },
    invoiceDetails: {
      invoiceNumber: "SIMP-2026-0089",
      issueDate: new Date().toISOString().split("T")[0],
      issueTime: "14:15",
      supplyDate: new Date().toISOString().split("T")[0],
      currency: "SAR",
      notes: "السلع المباعة قابلة للاستبدال والاسترجاع خلال 7 أيام من تاريخ الشراء بشرط سلامة التغليف الأصلي والفاتورة.",
    },
    lines: [
      {
        id: 1,
        name: "شاشة كمبيوتر احترافية 27 بوصة 4K",
        desc: "موديل 2026 مع ضمان سنتين من الوكيل المعتمد",
        qty: "1",
        unitPrice: "1850",
        vatRateId: "15",
        discount: "100",
      },
      {
        id: 2,
        name: "لوحة مفاتيح ميكانيكية لاسلكية RGB",
        desc: "مفاتيح صامتة مناسبة للمكتب والعمل الطويل",
        qty: "2",
        unitPrice: "320",
        vatRateId: "15",
        discount: "0",
      },
    ],
  },
};

// ─── Calculate single line item (unchanged) ──────────────────────────────────
function calcLine(item) {
  const { gross, taxableBase, vatAmount, lineTotal } = calcLineVat({
    qty: item.qty,
    unitPrice: item.unitPrice,
    discount: item.discount,
    vatRate: (VAT_RATES.find((r) => r.id === item.vatRateId) || VAT_RATES[0]).rate,
  });
  const vatRateObj = VAT_RATES.find((r) => r.id === item.vatRateId) || VAT_RATES[0];
  return {
    gross,
    taxableBase,
    vatAmount,
    total: lineTotal,
    vatRate: vatRateObj.rate,
    vatRateId: item.vatRateId,
    tag: vatRateObj.tag,
  };
}

// ─── Blank line item factory (unchanged) ─────────────────────────────────────
let _lineId = 10;
function newLine() {
  return {
    id: _lineId++,
    name: "",
    desc: "",
    qty: "1",
    unitPrice: "",
    vatRateId: "15",
    discount: "0",
  };
}

// ─── Validation Rules (unchanged) ────────────────────────────────────────────
function validateInvoice({ invoiceType, seller, buyer, invoiceDetails, lines }) {
  const checks = [];

  const req = (label, value, hint) => ({
    label,
    status: value && String(value).trim() !== "" ? "ok" : "missing",
    hint: hint || null,
  });

  checks.push(req("اسم المنشأة البائعة (الاسم القانوني)", seller.name, "مطلوب لتحديد هوية المكلف المورد"));

  if (!seller.vatNumber || String(seller.vatNumber).trim() === "") {
    checks.push({
      label: "الرقم الضريبي للبائع (15 رقماً)",
      status: "missing",
      hint: "إلزامي لكافة المسجلين في ضريبة القيمة المضافة بالسعودية",
    });
  } else {
    const isValidVat = isValidSaudiVatNumber(seller.vatNumber.trim());
    checks.push({
      label: "صحة تنسيق الرقم الضريبي للبائع (15 رقماً يبدأ بـ 3)",
      status: isValidVat ? "ok" : "warning",
      hint: isValidVat
        ? "تنسيق صحيح (15 رقماً يبدأ بـ 3)"
        : "تنبيه: الرقم الضريبي في المملكة يتكون من 15 رقماً ويبدأ وينتهي بالرقم 3",
    });
  }

  checks.push(req("عنوان المنشأة البائعة", seller.address, "مطلوب نظاماً في الفاتورة الضريبية والمبسطة"));

  checks.push(req("رقم الفاتورة التسلسلي", invoiceDetails.invoiceNumber, "يجب أن يكون رقماً تسلسلياً فريداً"));
  checks.push(req("تاريخ إصدار الفاتورة", invoiceDetails.issueDate, "تاريخ تحرير المعاملة الضريبية"));

  checks.push(req("اسم المشتري / العميل", buyer.name, "مطلوب لتوثيق طرف المعاملة"));
  if (invoiceType === "tax") {
    if (!buyer.vatNumber || buyer.vatNumber.trim() === "") {
      checks.push({
        label: "الرقم الضريبي للمشتري (مطلوب في B2B)",
        status: "warning",
        hint: "إلزامي في الفاتورة الضريبية B2B إذا كان العميل مسجلاً في ضريبة القيمة المضافة لاسترداد المدخلات",
      });
    } else {
      const isValidBuyerVat = isValidSaudiVatNumber(buyer.vatNumber.trim());
      checks.push({
        label: "الرقم الضريبي للمشتري (B2B)",
        status: isValidBuyerVat ? "ok" : "warning",
        hint: isValidBuyerVat ? "تنسيق صحيح (15 رقماً)" : "تنبيه: تأكد من تنسيق الـ 15 رقماً للمشتري",
      });
    }
  }

  if (lines.length === 0) {
    checks.push({
      label: "بنود الفاتورة",
      status: "missing",
      hint: "يجب إضافة بند واحد على الأقل",
    });
  } else {
    const hasName = lines.every((l) => l.name && l.name.trim() !== "");
    const hasQty = lines.every((l) => parseNum(l.qty) > 0);
    const hasPrice = lines.every((l) => parseNum(l.unitPrice) >= 0 && l.unitPrice !== "");

    checks.push({
      label: "وصف كل سلعة أو خدمة في البنود",
      status: hasName ? "ok" : "missing",
      hint: hasName ? null : "يوجد بند بدون اسم أو وصف محدد",
    });
    checks.push({
      label: "الكميات لجميع البنود (أكبر من 0)",
      status: hasQty ? "ok" : "missing",
      hint: hasQty ? null : "يوجد بند به كمية غير صحيحة",
    });
    checks.push({
      label: "أسعار الوحدات لجميع البنود",
      status: hasPrice ? "ok" : "missing",
      hint: hasPrice ? null : "يوجد بند بدون سعر وحدة محدد",
    });
  }

  return checks;
}

// ─── Small presentational helpers ────────────────────────────────────────────
function Field({ id, label, optional, required, hint, children }) {
  return (
    <div className="ei-field">
      <label className="ei-label" htmlFor={id}>
        {label}
        {required && <span className="ei-req" aria-hidden="true"> *</span>}
        {optional && <span className="ei-opt"> اختياري</span>}
      </label>
      {children}
      {hint && <p className="ei-warn-inline">{hint}</p>}
    </div>
  );
}

const CHECK_TEXT = { ok: "✓ مكتمل", warning: "! تنبيه", missing: "✗ ناقص" };
function CheckItem({ status, label, hint }) {
  return (
    <li className={`ei-check is-${status}`}>
      <span className="ei-check-st">{CHECK_TEXT[status] || status}</span>
      <div>
        <strong>{label}</strong>
        {hint && <p>{hint}</p>}
      </div>
    </li>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EInvoiceGenerator() {
  const uid = useId();
  const [invoiceType, setInvoiceType] = useState("tax"); // "tax" | "simplified"
  const [seller, setSeller] = useState(SAMPLE_PRESETS.tax.seller);
  const [buyer, setBuyer] = useState(SAMPLE_PRESETS.tax.buyer);
  const [invoiceDetails, setInvoiceDetails] = useState(SAMPLE_PRESETS.tax.invoiceDetails);
  const [lines, setLines] = useState(SAMPLE_PRESETS.tax.lines);

  const [showValidation, setShowValidation] = useState(false);
  const [activeTab, setActiveTab] = useState("form"); // "form" | "preview"

  // ─── Prefill from Quotation Generator (unchanged) ──────────────────────────
  const [prefillData, setPrefillData] = useState(null);
  const [prefillDismissed, setPrefillDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" && localStorage.getItem("saudi_invoice_prefill_v1");
      if (raw) setPrefillData(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const handleImportPrefill = () => {
    if (!prefillData) return;
    try {
      if (prefillData.seller) setSeller({ ...SAMPLE_PRESETS.tax.seller, ...prefillData.seller });
      if (prefillData.buyer) setBuyer({ ...SAMPLE_PRESETS.tax.buyer, ...prefillData.buyer });
      if (prefillData.invoiceDetails) setInvoiceDetails({ ...SAMPLE_PRESETS.tax.invoiceDetails, ...prefillData.invoiceDetails });
      if (prefillData.invoiceType) setInvoiceType(prefillData.invoiceType);
      if (prefillData.lines && prefillData.lines.length > 0) setLines(prefillData.lines);
      localStorage.removeItem("saudi_invoice_prefill_v1");
    } catch { /* ignore */ }
    setPrefillData(null);
    setPrefillDismissed(false);
  };

  const handleDismissPrefill = () => setPrefillDismissed(true);

  // ─── Presets ───────────────────────────────────────────────────────────────
  const applyPreset = (type) => {
    const preset = SAMPLE_PRESETS[type];
    setInvoiceType(type);
    setSeller(preset.seller);
    setBuyer(preset.buyer);
    setInvoiceDetails(preset.invoiceDetails);
    setLines(preset.lines);
  };

  // ─── Line handlers ─────────────────────────────────────────────────────────
  const addLine = () => setLines((prev) => [...prev, newLine()]);
  const removeLine = (id) => setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  const updateLine = (id, field, value) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));

  // ─── Calculations (unchanged) ──────────────────────────────────────────────
  const lineCalcs = useMemo(() => lines.map((l) => ({ ...calcLine(l), id: l.id })), [lines]);

  const totals = useMemo(() => {
    let grossTotal = 0;
    let totalDiscount = 0;
    let taxable15 = 0;
    let exemptOrZero = 0;
    let totalVat = 0;

    lineCalcs.forEach((c, idx) => {
      const line = lines[idx];
      grossTotal += c.gross;
      totalDiscount += parseNum(line?.discount);

      if (c.vatRateId === "15") {
        taxable15 += c.taxableBase;
      } else {
        exemptOrZero += c.taxableBase;
      }
      totalVat += c.vatAmount;
    });

    const netSubtotal = Math.max(0, grossTotal - totalDiscount);
    const grandTotal = netSubtotal + totalVat;

    return { grossTotal, totalDiscount, taxable15, exemptOrZero, netSubtotal, totalVat, grandTotal };
  }, [lineCalcs, lines]);

  // ─── Validation ────────────────────────────────────────────────────────────
  const validationResults = useMemo(
    () => validateInvoice({ invoiceType, seller, buyer, invoiceDetails, lines }),
    [invoiceType, seller, buyer, invoiceDetails, lines]
  );

  const {
    okCount,
    warnCount: warningCount,
    missCount: missingCount,
    completenessPercent,
  } = calcCompleteness(validationResults);

  // ─── Reset / Print / Preview (unchanged) ───────────────────────────────────
  const handleReset = () => {
    setInvoiceType("tax");
    setSeller({ name: "", vatNumber: "", address: "", cr: "", city: "", country: "المملكة العربية السعودية" });
    setBuyer({ name: "", vatNumber: "", address: "" });
    setInvoiceDetails({
      invoiceNumber: "",
      issueDate: new Date().toISOString().split("T")[0],
      issueTime: "",
      supplyDate: "",
      currency: "SAR",
      notes: "",
    });
    setLines([newLine()]);
    setShowValidation(false);
    setActiveTab("form");
  };

  const handlePrint = () => {
    setActiveTab("preview");
    setTimeout(() => window.print(), 250);
  };

  const handlePreview = () => {
    setActiveTab("preview");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentInvoiceTypeMeta = INVOICE_TYPES.find((t) => t.id === invoiceType) || INVOICE_TYPES[0];
  const cur = invoiceDetails.currency;
  const sellerVatBad = seller.vatNumber && !isValidSaudiVatNumber(seller.vatNumber);

  return (
    <div className="ei" dir="rtl">
      <style>{CSS}</style>

      {/* ── Prefill banner ───────────────────────────────────────────────── */}
      {prefillData && !prefillDismissed && (
        <div className="ei-banner ei-noprint" role="region" aria-label="استيراد من عرض السعر">
          <p>
            <strong>تم اكتشاف بيانات من مولد عرض السعر السعودي — هل تريد استيرادها؟</strong>{" "}
            <span className="ei-soft">لن تُستبدل بيانات الفاتورة الحالية إلا بعد موافقتك.</span>
          </p>
          <div className="ei-row">
            <button type="button" onClick={handleImportPrefill} className="ei-btn ei-btn--ink">استيراد بيانات عرض السعر</button>
            <button type="button" onClick={handleDismissPrefill} className="ei-btn">تجاهل</button>
          </div>
        </div>
      )}

      {/* ── Disclaimer ───────────────────────────────────────────────────── */}
      <p className="ei-disclaimer ei-noprint" role="note">
        <strong>تنبيه وإخلاء مسؤولية:</strong> هذا المولد يُنتج نماذج فواتير إرشادية وتدريبية قابلة للطباعة لترتيب الحسابات والتوثيق، ولا يُعد بديلاً عن حلول الفوترة الإلكترونية المعتمدة أو نظام الربط المباشر لهيئة الزكاة والضريبة والجمارك (ZATCA).
      </p>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="ei-head ei-noprint">
        <div className="ei-head-top">
          <div>
            <p className="ei-badge">ZATCA فاتورة</p>
            <h1 className="ei-title">مولد الفاتورة الإلكترونية السعودية</h1>
            <p className="ei-sub">فاتورة ضريبية B2B وفاتورة مبسطة B2C مع احتساب VAT 15% وفحص اكتمال الحقول</p>
          </div>
          <div className="ei-presets" role="group" aria-label="تحميل نموذج">
            <span className="ei-label">تحميل نموذج:</span>
            <button type="button" aria-pressed={invoiceType === "tax"} onClick={() => applyPreset("tax")} className="ei-chip">
              نموذج B2B ضريبية
            </button>
            <button type="button" aria-pressed={invoiceType === "simplified"} onClick={() => applyPreset("simplified")} className="ei-chip">
              نموذج B2C مبسطة
            </button>
          </div>
        </div>

        <div className="ei-tabs" role="tablist" aria-label="طريقة العرض">
          <button type="button" role="tab" aria-selected={activeTab === "form"} onClick={() => setActiveTab("form")} className="ei-tab">
            تحرير بيانات الفاتورة
          </button>
          <button type="button" role="tab" aria-selected={activeTab === "preview"} onClick={handlePreview} className="ei-tab">
            معاينة الفاتورة والطباعة
          </button>
        </div>
      </header>

      {/* ── Completeness strip ───────────────────────────────────────────── */}
      <section className="ei-strip ei-noprint" aria-label="مقياس الاكتمال">
        <div className="ei-strip-row">
          <div className="ei-meter-wrap">
            <span className="ei-label">مقياس اكتمال متطلبات الفاتورة:</span>
            <div
              className="ei-meter"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completenessPercent}
              aria-label="نسبة اكتمال الفاتورة"
            >
              <i style={{ width: `${completenessPercent}%` }} />
            </div>
            <strong className="ei-num">{completenessPercent}%</strong>
          </div>
          <div className="ei-row">
            <span className="ei-count"><span className="ei-num">{okCount}</span> مكتمل</span>
            {warningCount > 0 && <span className="ei-count is-warn"><span className="ei-num">{warningCount}</span> تنبيه</span>}
            {missingCount > 0 && <span className="ei-count is-miss"><span className="ei-num">{missingCount}</span> ناقص</span>}
            <button
              type="button"
              onClick={() => setShowValidation(!showValidation)}
              aria-expanded={showValidation}
              className="ei-link"
            >
              {showValidation ? "إخفاء الفحص" : "عرض قائمة التحقق"}
            </button>
          </div>
        </div>

        {showValidation && (
          <ul className="ei-checks">
            {validationResults.map((check, i) => (
              <CheckItem key={i} status={check.status} label={check.label} hint={check.hint} />
            ))}
          </ul>
        )}
      </section>

      {/* ══ FORM TAB ══════════════════════════════════════════════════════ */}
      {activeTab === "form" && (
        <div className="ei-body ei-noprint">
          {/* 1 · Type */}
          <section className="ei-sec">
            <div className="ei-line">
              <h2 className="ei-h2"><span className="ei-step">1</span> نوع الفاتورة الإلكترونية</h2>
              <span className="ei-soft">وفق معايير هيئة الزكاة والضريبة والجمارك</span>
            </div>
            <div className="ei-grid2" role="radiogroup" aria-label="نوع الفاتورة">
              {INVOICE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={invoiceType === t.id}
                  onClick={() => setInvoiceType(t.id)}
                  className="ei-opt"
                >
                  <strong>{t.labelAr}</strong>
                  <span className="ei-opt-en">{t.labelEn}</span>
                  <span className="ei-opt-d">{t.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 2 · Seller */}
          <section className="ei-sec">
            <h2 className="ei-h2"><span className="ei-step">2</span> بيانات المورد / البائع (المكلف)</h2>
            <div className="ei-box">
              <div className="ei-grid2">
                <Field id={`${uid}-sname`} label="اسم المنشأة القانوني" required>
                  <input id={`${uid}-sname`} type="text" aria-required="true" className="ei-input" placeholder="مثال: شركة الحلول الرقمية ذ.م.م"
                    value={seller.name} onChange={(e) => setSeller({ ...seller, name: e.target.value })} />
                </Field>
                <Field id={`${uid}-svat`} label="الرقم الضريبي للبائع (15 رقماً)" required
                  hint={sellerVatBad ? "الرقم الضريبي السعودي يتكون من 15 رقماً ويبدأ بـ 3" : null}>
                  <input id={`${uid}-svat`} type="text" inputMode="numeric" aria-required="true" className="ei-input ei-num"
                    placeholder="3XXXXXXXXXXXXXX (15 رقماً تبدأ بـ 3)" maxLength={15}
                    value={seller.vatNumber} onChange={(e) => setSeller({ ...seller, vatNumber: e.target.value.replace(/\D/g, "") })} />
                </Field>
              </div>
              <Field id={`${uid}-saddr`} label="عنوان المنشأة التفصيلي" required>
                <input id={`${uid}-saddr`} type="text" aria-required="true" className="ei-input" placeholder="اسم الشارع، الحي، الرمز البريدي"
                  value={seller.address} onChange={(e) => setSeller({ ...seller, address: e.target.value })} />
              </Field>
              <div className="ei-grid3">
                <Field id={`${uid}-scr`} label="السجل التجاري (CR)" optional>
                  <input id={`${uid}-scr`} type="text" className="ei-input ei-num" placeholder="1010XXXXXX"
                    value={seller.cr} onChange={(e) => setSeller({ ...seller, cr: e.target.value })} />
                </Field>
                <Field id={`${uid}-scity`} label="المدينة" optional>
                  <input id={`${uid}-scity`} type="text" className="ei-input" placeholder="الرياض، جدة، الدمام..."
                    value={seller.city} onChange={(e) => setSeller({ ...seller, city: e.target.value })} />
                </Field>
                <Field id={`${uid}-scountry`} label="الدولة">
                  <input id={`${uid}-scountry`} type="text" className="ei-input ei-readonly" value={seller.country} readOnly />
                </Field>
              </div>
            </div>
          </section>

          {/* 3 · Buyer */}
          <section className="ei-sec">
            <h2 className="ei-h2"><span className="ei-step">3</span> بيانات المشتري / العميل</h2>
            <div className="ei-box">
              <div className="ei-grid2">
                <Field id={`${uid}-bname`} label="اسم العميل / الشركة" required>
                  <input id={`${uid}-bname`} type="text" aria-required="true" className="ei-input" placeholder="اسم المنشأة أو العميل الفرد"
                    value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} />
                </Field>
                <div className="ei-field">
                  <label className="ei-label" htmlFor={`${uid}-bvat`}>
                    الرقم الضريبي للمشتري
                    {invoiceType === "tax" ? (
                      <strong> (إلزامي في B2B عند التسجيل)</strong>
                    ) : (
                      <span className="ei-opt"> (غير مطلوب في الفاتورة المبسطة)</span>
                    )}
                  </label>
                  <input id={`${uid}-bvat`} type="text" inputMode="numeric" className="ei-input ei-num" maxLength={15}
                    placeholder={invoiceType === "tax" ? "3XXXXXXXXXXXXXX" : "اختياري للمستهلك النهائي"}
                    value={buyer.vatNumber} onChange={(e) => setBuyer({ ...buyer, vatNumber: e.target.value.replace(/\D/g, "") })} />
                </div>
              </div>
              <Field id={`${uid}-baddr`} label="عنوان العميل" optional>
                <input id={`${uid}-baddr`} type="text" className="ei-input" placeholder="المدينة، الحي (اختياري في المبسطة)"
                  value={buyer.address} onChange={(e) => setBuyer({ ...buyer, address: e.target.value })} />
              </Field>
            </div>
          </section>

          {/* 4 · Details */}
          <section className="ei-sec">
            <h2 className="ei-h2"><span className="ei-step">4</span> بيانات وتاريخ الفاتورة</h2>
            <div className="ei-box">
              <div className="ei-grid3">
                <Field id={`${uid}-no`} label="رقم الفاتورة" required>
                  <input id={`${uid}-no`} type="text" aria-required="true" className="ei-input ei-num" placeholder="INV-2026-001"
                    value={invoiceDetails.invoiceNumber} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })} />
                </Field>
                <Field id={`${uid}-date`} label="تاريخ الإصدار" required>
                  <input id={`${uid}-date`} type="date" aria-required="true" className="ei-input ei-num"
                    value={invoiceDetails.issueDate} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, issueDate: e.target.value })} />
                </Field>
                <Field id={`${uid}-time`} label="وقت الإصدار" optional>
                  <input id={`${uid}-time`} type="time" className="ei-input ei-num"
                    value={invoiceDetails.issueTime} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, issueTime: e.target.value })} />
                </Field>
              </div>
              <div className="ei-grid2">
                <Field id={`${uid}-supply`} label="تاريخ التوريد الفعلي" optional>
                  <input id={`${uid}-supply`} type="date" className="ei-input ei-num"
                    value={invoiceDetails.supplyDate} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, supplyDate: e.target.value })} />
                </Field>
                <Field id={`${uid}-cur`} label="عملة الفاتورة">
                  <select id={`${uid}-cur`} className="ei-input" value={invoiceDetails.currency}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, currency: e.target.value })}>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="EUR">يورو (EUR)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                  </select>
                </Field>
              </div>
            </div>
          </section>

          {/* 5 · Lines */}
          <section className="ei-sec">
            <div className="ei-line">
              <h2 className="ei-h2"><span className="ei-step">5</span> بنود وتفاصيل السلع والخدمات</h2>
              <button type="button" onClick={addLine} className="ei-btn ei-btn--ink">+ إضافة بند جديد</button>
            </div>

            <div className="ei-stack">
              {lines.map((line, idx) => {
                const calc = lineCalcs.find((c) => c.id === line.id) || {};
                const p = `${uid}-l${line.id}`;
                return (
                  <div key={line.id} className="ei-lcard">
                    <div className="ei-line">
                      <span className="ei-tag">بند رقم <span className="ei-num">{idx + 1}</span></span>
                      {lines.length > 1 && (
                        <button type="button" onClick={() => removeLine(line.id)} className="ei-link ei-link--danger"
                          aria-label={`حذف البند رقم ${idx + 1}`}>
                          حذف البند
                        </button>
                      )}
                    </div>

                    <div className="ei-grid2">
                      <Field id={`${p}-name`} label="اسم السلعة / الخدمة" required>
                        <input id={`${p}-name`} type="text" aria-required="true" className="ei-input" placeholder="وصف واضح للسلعة أو الخدمة الموردة"
                          value={line.name} onChange={(e) => updateLine(line.id, "name", e.target.value)} />
                      </Field>
                      <Field id={`${p}-desc`} label="الوصف التفصيلي" optional>
                        <input id={`${p}-desc`} type="text" className="ei-input" placeholder="مواصفات إضافية، رقم الموديل، المدة..."
                          value={line.desc} onChange={(e) => updateLine(line.id, "desc", e.target.value)} />
                      </Field>
                    </div>

                    <div className="ei-grid4">
                      <Field id={`${p}-qty`} label="الكمية">
                        <input id={`${p}-qty`} type="number" inputMode="decimal" min="1" step="1" className="ei-input ei-num"
                          value={line.qty} onChange={(e) => updateLine(line.id, "qty", e.target.value)} />
                      </Field>
                      <Field id={`${p}-price`} label={`سعر الوحدة (${cur})`}>
                        <input id={`${p}-price`} type="number" inputMode="decimal" min="0" step="0.01" className="ei-input ei-num" placeholder="0.00"
                          value={line.unitPrice} onChange={(e) => updateLine(line.id, "unitPrice", e.target.value)} />
                      </Field>
                      <Field id={`${p}-vat`} label="نسبة الضريبة (VAT)">
                        <select id={`${p}-vat`} className="ei-input" value={line.vatRateId}
                          onChange={(e) => updateLine(line.id, "vatRateId", e.target.value)}>
                          {VAT_RATES.map((r) => (
                            <option key={r.id} value={r.id}>{r.label}</option>
                          ))}
                        </select>
                      </Field>
                      <Field id={`${p}-disc`} label={`الخصم (${cur})`}>
                        <input id={`${p}-disc`} type="number" inputMode="decimal" min="0" step="0.01" className="ei-input ei-num" placeholder="0.00"
                          value={line.discount} onChange={(e) => updateLine(line.id, "discount", e.target.value)} />
                      </Field>
                    </div>

                    <dl className="ei-calc">
                      <div><dt>الوعاء بعد الخصم</dt><dd className="ei-num">{fmt(calc.taxableBase)} {cur}</dd></div>
                      <div><dt>مبلغ الضريبة ({calc.tag})</dt><dd className="ei-num">{fmt(calc.vatAmount)} {cur}</dd></div>
                      <div><dt>إجمالي البند شامل الضريبة</dt><dd className="ei-num ei-strong">{fmt(calc.total)} {cur}</dd></div>
                    </dl>
                  </div>
                );
              })}
            </div>

            <button type="button" onClick={addLine} className="ei-add">+ إضافة بند جديد للفاتورة</button>
          </section>

          {/* 6 · Notes */}
          <section className="ei-sec">
            <h2 className="ei-h2"><span className="ei-step">6</span> <label htmlFor={`${uid}-notes`}>ملاحظات وشروط الدفع والتعاقد</label></h2>
            <textarea id={`${uid}-notes`} className="ei-input ei-area" rows={3}
              placeholder="شروط السداد، رقم الحساب البنكي (IBAN)، سياسة الاستبدال أو أي تعليمات إضافية..."
              value={invoiceDetails.notes} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, notes: e.target.value })} />
          </section>

          {/* Totals */}
          <section className="ei-box ei-totals" aria-label="ملخص إجماليات الفاتورة">
            <h2 className="ei-h2">ملخص إجماليات الفاتورة</h2>
            <dl className="ei-rows">
              <div className="ei-r"><dt>إجمالي المبيعات قبل الخصم:</dt><dd className="ei-num">{fmt(totals.grossTotal)} {cur}</dd></div>
              {totals.totalDiscount > 0 && (
                <div className="ei-r"><dt>إجمالي الخصومات:</dt><dd className="ei-num">- {fmt(totals.totalDiscount)} {cur}</dd></div>
              )}
              <div className="ei-r ei-r--b"><dt>الوعاء الخاضع للضريبة (15%):</dt><dd className="ei-num">{fmt(totals.taxable15)} {cur}</dd></div>
              {totals.exemptOrZero > 0 && (
                <div className="ei-r"><dt>مبالغ صفرية / معفاة / خارج النطاق:</dt><dd className="ei-num">{fmt(totals.exemptOrZero)} {cur}</dd></div>
              )}
              <div className="ei-r ei-r--b"><dt>إجمالي ضريبة القيمة المضافة (15%):</dt><dd className="ei-num">+{fmt(totals.totalVat)} {cur}</dd></div>
            </dl>
            <div className="ei-grand" aria-live="polite">
              <span>الإجمالي النهائي المستحق للدفع:</span>
              <strong className="ei-num">{fmt(totals.grandTotal)} {cur}</strong>
            </div>
          </section>

          {/* QR notice */}
          <section className="ei-note" aria-label="حالة رمز QR">
            <p><strong>رمز الاستجابة السريعة (QR Code) — منظومة فاتورة ZATCA</strong></p>
            <p>
              خاصية تشفير رمز QR بتقنية TLV Base64 والربط المباشر مع منصة Fatoora (CSID) <strong>قيد التطوير التقني</strong>. تجنباً لأي ادعاء غير معتمد، لا نعرض رمزاً وهمياً، وتُخصص مساحة مخصصة للرمز في نموذج الطباعة للمراجعة والتحضير الداخلي.
            </p>
            <a href="https://zatca.gov.sa/en/E-Invoicing/SystemsDevelopers/Pages/E-Invoice-specifications.aspx"
              target="_blank" rel="noopener noreferrer" className="ei-link">
              مراجعة المواصفات الفنية الرسمية لهيئة الزكاة والضريبة والجمارك (يفتح في نافذة جديدة)
            </a>
          </section>

          {/* Internal links */}
          <nav className="ei-box" aria-label="أدوات مساعدة">
            <p className="ei-label">أدوات مساعدة لمنظومة الفوترة والضريبة بالسعودية:</p>
            <div className="ei-row">
              <Link href="/vat-calculator/saudi" className="ei-chip ei-chip--a">حاسبة ضريبة القيمة المضافة 15%</Link>
              <Link href="/ar/sa/vat-registration-checker" className="ei-chip ei-chip--a">حاسبة أهلية التسجيل في ضريبة القيمة المضافة</Link>
            </div>
          </nav>

          {/* Actions */}
          <div className="ei-actions">
            <button type="button" onClick={handlePreview} className="ei-btn ei-btn--ink ei-btn--lg">معاينة الفاتورة للطباعة</button>
            <button type="button" onClick={handlePrint} className="ei-btn ei-btn--lg">طباعة الفاتورة (A4 / PDF)</button>
            <button type="button" onClick={handleReset} className="ei-btn ei-btn--lg ei-btn--quiet">مسح الحقول</button>
          </div>
        </div>
      )}

      {/* ══ PREVIEW / PRINT ═══════════════════════════════════════════════ */}
      <div className={`ei-preview${activeTab === "preview" ? "" : " is-hidden"}`}>
        <div className="ei-bar ei-noprint">
          <button type="button" onClick={() => setActiveTab("form")} className="ei-btn">← العودة لتعديل البيانات</button>
          <button type="button" onClick={handlePrint} className="ei-btn ei-btn--ink">طباعة الفاتورة أو حفظ كـ PDF</button>
        </div>

        {/* The A4 document: always black on white, independent of the theme */}
        <article className="ei-paper" aria-label="الفاتورة">
          <div className="ei-p-head">
            <div className="ei-p-top">
              <div>
                <h2 className="ei-p-title">{currentInvoiceTypeMeta.labelAr}</h2>
                <p className="ei-p-en">{currentInvoiceTypeMeta.labelEn}</p>
                <p className="ei-p-soft">المملكة العربية السعودية — نموذج فوترة إلكترونية</p>
              </div>
              <div className="ei-p-no">
                <p className="ei-p-soft">رقم الفاتورة | Invoice #</p>
                <p className="ei-p-no-v">{invoiceDetails.invoiceNumber || "—"}</p>
              </div>
            </div>

            <dl className="ei-p-meta">
              <div><dt>تاريخ الإصدار / Issue Date:</dt><dd>{invoiceDetails.issueDate || "—"}</dd></div>
              <div><dt>وقت الإصدار / Issue Time:</dt><dd>{invoiceDetails.issueTime || "—"}</dd></div>
              <div><dt>تاريخ التوريد / Supply Date:</dt><dd>{invoiceDetails.supplyDate || "—"}</dd></div>
              <div><dt>العملة / Currency:</dt><dd>{cur}</dd></div>
            </dl>
          </div>

          <div className="ei-p-parties">
            <section className="ei-p-box">
              <h3>بيانات المورد / البائع (Seller)</h3>
              <p><strong>الاسم القانوني:</strong> {seller.name || "—"}</p>
              <p><strong>الرقم الضريبي (VAT):</strong> <b className="ei-mono">{seller.vatNumber || "—"}</b></p>
              {seller.cr && <p><strong>السجل التجاري (CR):</strong> <span className="ei-mono">{seller.cr}</span></p>}
              {seller.address && <p><strong>العنوان:</strong> {seller.address}</p>}
              {seller.city && <p><strong>المدينة والدولة:</strong> {seller.city}، {seller.country}</p>}
            </section>
            <section className="ei-p-box">
              <h3>بيانات المشتري / العميل (Buyer)</h3>
              <p><strong>الاسم:</strong> {buyer.name || "—"}</p>
              {buyer.vatNumber ? (
                <p><strong>الرقم الضريبي (VAT):</strong> <b className="ei-mono">{buyer.vatNumber}</b></p>
              ) : (
                <p className="ei-p-soft">الرقم الضريبي: غير مسجل / مستهلك نهائي</p>
              )}
              {buyer.address && <p><strong>العنوان:</strong> {buyer.address}</p>}
            </section>
          </div>

          <div className="ei-p-tablewrap">
            <table className="ei-p-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">البيان والوصف / Description</th>
                  <th scope="col">الكمية</th>
                  <th scope="col">سعر الوحدة</th>
                  <th scope="col">الخصم</th>
                  <th scope="col">الوعاء الضريبي</th>
                  <th scope="col">نسبة الضريبة</th>
                  <th scope="col">مبلغ الضريبة</th>
                  <th scope="col">الإجمالي شامل الضريبة</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => {
                  const calc = lineCalcs.find((c) => c.id === line.id) || {};
                  return (
                    <tr key={line.id}>
                      <td className="ei-mono">{idx + 1}</td>
                      <td>
                        <strong>{line.name || "—"}</strong>
                        {line.desc && <span className="ei-p-d">{line.desc}</span>}
                      </td>
                      <td className="ei-mono ei-c">{line.qty}</td>
                      <td className="ei-mono">{fmt(parseNum(line.unitPrice))}</td>
                      <td className="ei-mono">{parseNum(line.discount) > 0 ? fmt(parseNum(line.discount)) : "—"}</td>
                      <td className="ei-mono">{fmt(calc.taxableBase)}</td>
                      <td><b>{calc.tag}</b></td>
                      <td className="ei-mono">{fmt(calc.vatAmount)}</td>
                      <td className="ei-mono"><b>{fmt(calc.total)}</b></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="ei-p-bottom">
            <div className="ei-p-qr">
              <div className="ei-p-qrbox">
                <b>ZATCA QR</b>
                <span>قيد التطوير الفني</span>
              </div>
              <p><b>رمز الاستجابة السريعة (ZATCA FATOORA)</b></p>
              <p className="ei-p-soft">
                توليد رمز QR المعتمد يستلزم تشفيراً بترميز TLV Base64 والربط المباشر عبر شهادة CSID. حفاظاً على المصداقية والشفافية النظامية، لا نُضمّن رمزاً وهمياً.
              </p>
            </div>

            <dl className="ei-p-totals">
              <div><dt>إجمالي المبلغ الخاضع للضريبة (قبل الضريبة):</dt><dd className="ei-mono">{fmt(totals.netSubtotal)} {cur}</dd></div>
              {totals.totalDiscount > 0 && (
                <div><dt>إجمالي الخصم التجاري:</dt><dd className="ei-mono">- {fmt(totals.totalDiscount)} {cur}</dd></div>
              )}
              <div><dt>إجمالي ضريبة القيمة المضافة 15%:</dt><dd className="ei-mono">{fmt(totals.totalVat)} {cur}</dd></div>
              <div className="ei-p-grand"><dt>المبلغ الإجمالي المستحق:</dt><dd className="ei-mono">{fmt(totals.grandTotal)} {cur}</dd></div>
            </dl>
          </div>

          {invoiceDetails.notes && (
            <div className="ei-p-box ei-p-notes">
              <p><strong>ملاحظات وشروط:</strong></p>
              <p>{invoiceDetails.notes}</p>
            </div>
          )}

          <footer className="ei-p-foot">
            <p><b>نموذج فاتورة إلكترونية تجريبي وقابل للطباعة لأغراض المراجعة والتوثيق الداخلي</b></p>
            <p>هذا المستند لا يُعد فاتورة إلكترونية معتمدة أو مصدقة رسمياً من هيئة الزكاة والضريبة والجمارك (ZATCA). يتطلب الامتثال القانوني الربط التقني بمنظومة فاتورة عبر حلول فوترة إلكترونية معتمدة.</p>
            <p className="ei-mono ei-p-url">qemlo.com/ar/sa/e-invoice-generator | {seller.name || "منظومة الأدوات العربية"}</p>
          </footer>
        </article>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
// Colours come from --c-* on .ei. If your tokens.css already defines the
// underlying names, delete the fallback values and map them in one place.
const CSS = `
.ei {
  --c-surface: var(--surface, #FFFFFF);
  --c-ink: var(--ink, #0D0D0D);
  --c-ink-soft: var(--ink-soft, #4A4A46);
  --c-line: var(--line, #D9D9D3);
  --c-signal: var(--signal, #FF6A1A);
  --c-on-ink: var(--on-ink, #FFFFFF);
  --c-on-signal: var(--on-signal, #0D0D0D);
  --c-warning: var(--warning, #8A5A00);
  --c-error: var(--error, #B42318);

  color: var(--c-ink);
  background: var(--c-surface);
  border: 1px solid var(--c-line);
  border-radius: 16px;
  overflow: hidden;
  font-family: inherit;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .ei {
    --c-surface: var(--surface, #181816);
    --c-ink: var(--ink, #F5F5F2);
    --c-ink-soft: var(--ink-soft, #B4B4AD);
    --c-line: var(--line, #34342F);
    --c-on-ink: var(--on-ink, #0D0D0D);
    --c-warning: var(--warning, #F2B84B);
    --c-error: var(--error, #FF8A80);
  }
}
:root[data-theme="dark"] .ei {
  --c-surface: var(--surface, #181816);
  --c-ink: var(--ink, #F5F5F2);
  --c-ink-soft: var(--ink-soft, #B4B4AD);
  --c-line: var(--line, #34342F);
  --c-on-ink: var(--on-ink, #0D0D0D);
  --c-warning: var(--warning, #F2B84B);
  --c-error: var(--error, #FF8A80);
}
.ei *, .ei *::before, .ei *::after { box-sizing: border-box; }
.ei-num { direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; }
input.ei-num { text-align: start; }
.ei-soft { color: var(--c-ink-soft); font-size: 0.8rem; }
.ei-strong { font-weight: 800; }
.ei-row { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
.ei-line { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; }
.ei-stack { display: grid; gap: 0.9rem; }

/* Banners */
.ei-banner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.8rem 1.1rem; border-block-end: 2px solid var(--c-ink); font-size: 0.85rem; line-height: 1.7; }
.ei-banner p { margin: 0; }
.ei-disclaimer { margin: 0; padding: 0.7rem 1.1rem; font-size: 0.8rem; line-height: 1.8; color: var(--c-warning); border-block-end: 2px dashed var(--c-warning); }

/* Header */
.ei-head { padding: 1.25rem 1.1rem 0; border-block-end: 1px solid var(--c-line); }
.ei-head-top { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.ei-badge { display: inline-block; margin: 0 0 0.5rem; padding: 0.15rem 0.7rem; font-size: 0.75rem; font-weight: 800; color: var(--c-on-signal); background: var(--c-signal); border-radius: 999px; }
.ei-title { margin: 0; font-size: 1.45rem; font-weight: 800; line-height: 1.4; }
.ei-sub { margin: 0.35rem 0 0; max-width: 60ch; font-size: 0.88rem; line-height: 1.8; color: var(--c-ink-soft); }
.ei-presets { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
.ei-tabs { display: flex; gap: 0.25rem; margin-block-start: 1rem; }
.ei-tab { min-height: 44px; padding: 0.5rem 1rem; font: inherit; font-size: 0.88rem; font-weight: 700; color: var(--c-ink-soft); background: transparent; border: 0; border-block-end: 4px solid transparent; cursor: pointer; }
.ei-tab:hover { color: var(--c-ink); }
.ei-tab[aria-selected="true"] { color: var(--c-ink); border-block-end-color: var(--c-ink); }

/* Strip */
.ei-strip { padding: 0.9rem 1.1rem; border-block-end: 1px solid var(--c-line); }
.ei-strip-row { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; }
.ei-meter-wrap { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; }
.ei-meter { width: 11rem; height: 0.7rem; background: var(--c-line); border-radius: 999px; overflow: hidden; }
.ei-meter i { display: block; height: 100%; background: var(--c-ink); transition: width .3s; }
.ei-count { padding: 0.1rem 0.6rem; font-size: 0.78rem; font-weight: 700; border: 1px solid var(--c-line); border-radius: 8px; }
.ei-count.is-warn { color: var(--c-warning); border: 1px dashed var(--c-warning); }
.ei-count.is-miss { color: var(--c-error); border: 2px solid var(--c-error); }
.ei-checks { display: grid; gap: 0.5rem; margin: 0.9rem 0 0; padding: 0.9rem 0 0; list-style: none; border-block-start: 1px solid var(--c-line); }
@media (min-width: 720px) { .ei-checks { grid-template-columns: 1fr 1fr; } }
.ei-check { display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.6rem 0.7rem; font-size: 0.82rem; line-height: 1.6; border: 1px solid var(--c-line); border-radius: 10px; }
.ei-check p { margin: 0.15rem 0 0; color: var(--c-ink-soft); font-size: 0.78rem; }
.ei-check-st { flex: none; font-weight: 800; font-size: 0.78rem; white-space: nowrap; }
.ei-check.is-warning { border: 1px dashed var(--c-warning); }
.ei-check.is-warning .ei-check-st { color: var(--c-warning); }
.ei-check.is-missing { border: 2px solid var(--c-error); }
.ei-check.is-missing .ei-check-st { color: var(--c-error); }

/* Body + sections */
.ei-body { display: grid; gap: 1.6rem; padding: 1.25rem 1.1rem; }
@media (min-width: 720px) { .ei-body { padding: 1.5rem; } }
.ei-sec { display: grid; gap: 0.8rem; }
.ei-h2 { display: flex; align-items: center; gap: 0.6rem; margin: 0; font-size: 1rem; font-weight: 800; }
.ei-step { display: inline-grid; place-items: center; width: 1.7rem; height: 1.7rem; font-size: 0.82rem; font-weight: 800; color: var(--c-on-ink); background: var(--c-ink); border-radius: 6px; }
.ei-box { display: grid; gap: 0.9rem; padding: 1rem; border: 1px solid var(--c-line); border-radius: 12px; }
.ei-grid2 { display: grid; gap: 0.8rem; }
.ei-grid3 { display: grid; gap: 0.8rem; }
.ei-grid4 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
@media (min-width: 640px) {
  .ei-grid2 { grid-template-columns: 1fr 1fr; }
  .ei-grid3 { grid-template-columns: repeat(3, 1fr); }
  .ei-grid4 { grid-template-columns: repeat(4, 1fr); }
}

/* Fields */
.ei-field { display: grid; gap: 0.35rem; min-width: 0; align-content: start; }
.ei-label { font-size: 0.82rem; font-weight: 700; }
.ei-opt { font-weight: 500; color: var(--c-ink-soft); font-size: 0.76rem; }
.ei-req { font-weight: 800; }
.ei-warn-inline { margin: 0; font-size: 0.78rem; color: var(--c-warning); }
.ei-input {
  width: 100%; min-height: 44px; padding: 0.5rem 0.75rem; font: inherit; font-size: 0.92rem;
  color: var(--c-ink); background: var(--c-surface); border: 2px solid var(--c-line); border-radius: 10px;
}
.ei-input:hover { border-color: var(--c-ink-soft); }
.ei-readonly { color: var(--c-ink-soft); border-style: dashed; }
.ei-area { resize: vertical; line-height: 1.8; }

/* Type options */
.ei-opt { }
button.ei-opt {
  display: grid; gap: 0.2rem; padding: 0.9rem 1rem; text-align: start; font: inherit; color: var(--c-ink);
  background: var(--c-surface); border: 2px solid var(--c-line); border-radius: 12px; cursor: pointer;
  transition: background-color .15s, color .15s, border-color .15s;
}
button.ei-opt strong { font-size: 0.98rem; font-weight: 800; }
button.ei-opt .ei-opt-en { font-size: 0.78rem; font-weight: 700; direction: ltr; text-align: start; unicode-bidi: isolate; color: inherit; opacity: 0.8; }
button.ei-opt .ei-opt-d { font-size: 0.8rem; line-height: 1.7; color: var(--c-ink-soft); }
button.ei-opt:hover { border-color: var(--c-ink); }
button.ei-opt[aria-checked="true"] { color: var(--c-on-ink); background: var(--c-ink); border-color: var(--c-ink); }
button.ei-opt[aria-checked="true"] .ei-opt-d { color: inherit; opacity: 0.85; }

/* Line cards */
.ei-lcard { display: grid; gap: 0.9rem; padding: 1rem; border: 1px solid var(--c-line); border-radius: 12px; }
.ei-tag { padding: 0.1rem 0.7rem; font-size: 0.78rem; font-weight: 800; border: 2px solid var(--c-ink); border-radius: 999px; }
.ei-calc { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin: 0; padding: 0.7rem; text-align: center; border: 1px solid var(--c-line); border-radius: 10px; }
.ei-calc dt { font-size: 0.7rem; color: var(--c-ink-soft); }
.ei-calc dd { margin: 0.15rem 0 0; font-size: 0.82rem; font-weight: 700; }
@media (max-width: 520px) { .ei-calc { grid-template-columns: 1fr; text-align: start; } }
.ei-add { min-height: 48px; padding: 0.6rem; font: inherit; font-size: 0.9rem; font-weight: 700; color: var(--c-ink); background: transparent; border: 2px dashed var(--c-ink-soft); border-radius: 12px; cursor: pointer; }
.ei-add:hover { border-color: var(--c-ink); border-style: solid; }

/* Totals: grand total = the orange moment */
.ei-rows { margin: 0; }
.ei-r { display: flex; justify-content: space-between; gap: 1rem; padding-block: 0.55rem; border-block-start: 1px solid var(--c-line); font-size: 0.88rem; }
.ei-r:first-child { border-block-start: 0; }
.ei-r dt { color: var(--c-ink-soft); }
.ei-r dd { margin: 0; font-weight: 700; }
.ei-r--b dt { color: var(--c-ink); font-weight: 700; }
.ei-grand { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 0.5rem; padding: 1rem 1.1rem; color: var(--c-on-signal); background: var(--c-signal); border-radius: 12px; }
.ei-grand span { font-size: 0.95rem; font-weight: 800; }
.ei-grand strong { font-size: 1.6rem; font-weight: 800; }

.ei-note { display: grid; gap: 0.4rem; padding: 0.9rem 1rem; border-inline-start: 6px solid var(--c-ink); border-radius: 4px 12px 12px 4px; background: color-mix(in srgb, var(--c-line) 30%, transparent); font-size: 0.85rem; line-height: 1.8; }
.ei-note p { margin: 0; }

/* Buttons */
.ei-chip, .ei-btn {
  display: inline-flex; align-items: center; justify-content: center; min-height: 40px; padding: 0.35rem 0.9rem; font: inherit; font-size: 0.84rem; font-weight: 700; text-decoration: none;
  color: var(--c-ink); background: var(--c-surface); border: 2px solid var(--c-ink); border-radius: 10px; cursor: pointer;
  transition: background-color .15s, color .15s, border-color .15s;
}
.ei-chip { border-radius: 999px; border-color: var(--c-line); }
.ei-chip:hover { border-color: var(--c-ink); }
.ei-chip[aria-pressed="true"] { color: var(--c-on-ink); background: var(--c-ink); border-color: var(--c-ink); }
.ei-chip--a:hover { background: var(--c-ink); color: var(--c-on-ink); }
.ei-btn:hover { background: var(--c-ink); color: var(--c-on-ink); }
.ei-btn--ink { color: var(--c-on-ink); background: var(--c-ink); }
.ei-btn--ink:hover { background: var(--c-signal); color: var(--c-on-signal); border-color: var(--c-ink); }
.ei-btn--quiet { border-color: var(--c-line); }
.ei-btn--lg { flex: 1 1 10rem; min-height: 48px; font-size: 0.92rem; }
.ei-actions { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.ei-link { padding: 0; font: inherit; font-size: 0.82rem; font-weight: 700; color: var(--c-ink); background: none; border: 0; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.ei-link--danger { color: var(--c-error); }

/* Preview */
.ei-preview { padding: 1rem; background: color-mix(in srgb, var(--c-line) 35%, transparent); }
.ei-preview.is-hidden { display: none; }
.ei-bar { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.6rem; margin-block-end: 1rem; }

/* Paper: fixed black on white */
.ei-paper {
  --p-ink: #000; --p-soft: #555; --p-line: #BBBBBB;
  padding: 1.5rem; color: var(--p-ink); background: #FFFFFF; border: 1px solid var(--p-line); border-radius: 6px; font-size: 0.82rem; line-height: 1.7;
}
@media (min-width: 720px) { .ei-paper { padding: 2rem; } }
.ei-paper p { margin: 0; }
.ei-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; direction: ltr; unicode-bidi: isolate; }
.ei-p-soft { color: var(--p-soft); }
.ei-p-head { padding-block-end: 1.1rem; margin-block-end: 1.1rem; border-block-end: 3px solid var(--p-ink); }
.ei-p-top { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; }
.ei-p-title { margin: 0; font-size: 1.6rem; font-weight: 800; }
.ei-p-en { font-weight: 700; color: var(--p-soft); direction: ltr; text-align: start; }
.ei-p-no-v { font-family: ui-monospace, monospace; font-size: 1.15rem; font-weight: 800; direction: ltr; }
.ei-p-meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.7rem; margin: 1rem 0 0; padding: 0.7rem; border: 1px solid var(--p-line); }
@media (min-width: 720px) { .ei-p-meta { grid-template-columns: repeat(4, 1fr); } }
.ei-p-meta dt { color: var(--p-soft); font-size: 0.74rem; }
.ei-p-meta dd { margin: 0; font-weight: 700; direction: ltr; text-align: start; }
.ei-p-parties { display: grid; gap: 0.9rem; margin-block-end: 1.1rem; }
@media (min-width: 720px) { .ei-p-parties { grid-template-columns: 1fr 1fr; } }
.ei-p-box { padding: 0.8rem; border: 1px solid var(--p-line); }
.ei-p-box h3 { margin: 0 0 0.4rem; padding-block-end: 0.3rem; font-size: 0.92rem; font-weight: 800; border-block-end: 1px solid var(--p-line); }
.ei-p-tablewrap { overflow-x: auto; margin-block-end: 1.1rem; }
.ei-p-table { width: 100%; min-width: 640px; border-collapse: collapse; }
.ei-p-table th { padding: 0.5rem; text-align: start; font-size: 0.74rem; color: #FFF; background: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.ei-p-table td { padding: 0.5rem; vertical-align: top; border-block-end: 1px solid var(--p-line); }
.ei-p-table .ei-c { text-align: center; }
.ei-p-d { display: block; font-size: 0.7rem; color: var(--p-soft); }
.ei-p-bottom { display: grid; gap: 1.1rem; margin-block-end: 1.1rem; align-items: start; }
@media (min-width: 720px) { .ei-p-bottom { grid-template-columns: 1fr 1fr; } }
.ei-p-qr { display: grid; justify-items: center; gap: 0.4rem; padding: 0.9rem; text-align: center; border: 2px dashed var(--p-line); }
.ei-p-qrbox { display: grid; place-items: center; width: 6.5rem; height: 6.5rem; padding: 0.4rem; border: 1px solid var(--p-line); font-size: 0.7rem; }
.ei-p-totals { margin: 0; padding: 0.8rem; border: 1px solid var(--p-line); }
.ei-p-totals > div { display: flex; justify-content: space-between; gap: 1rem; padding-block: 0.35rem; }
.ei-p-totals dd { margin: 0; font-weight: 700; }
.ei-p-grand { margin-block-start: 0.4rem; padding-block-start: 0.6rem !important; border-block-start: 3px solid var(--p-ink); font-size: 0.95rem; font-weight: 800; }
.ei-p-notes { margin-block-end: 0.9rem; }
.ei-p-foot { padding-block-start: 0.7rem; text-align: center; font-size: 0.7rem; color: var(--p-soft); border-block-start: 1px solid var(--p-line); }
.ei-p-foot p + p { margin-block-start: 0.2rem; }
.ei-p-url { font-size: 0.66rem; }

/* Focus, motion, print */
.ei button:focus-visible, .ei input:focus-visible, .ei select:focus-visible, .ei textarea:focus-visible, .ei a:focus-visible {
  outline: 3px solid var(--c-signal); outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) { .ei * { transition: none !important; } }
@media print {
  .ei { border: 0; border-radius: 0; }
  .ei-noprint { display: none !important; }
  .ei-preview, .ei-preview.is-hidden { display: block !important; padding: 0; background: #FFF; }
  .ei-paper { border: 0; padding: 0; border-radius: 0; }
}
`;