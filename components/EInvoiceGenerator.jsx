"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  formatSAR as fmt,
  parseNum,
  calcLineVat,
  isValidSaudiVatNumber,
  calcCompleteness,
  inputCls,
  labelCls,
} from "@/lib/businessUtils";
import { CheckItem } from "@/components/business/CompletenessChecker";

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
    icon: "🏢",
    desc: "للمعاملات بين منشآت الأعمال (B2B) — يُشترط فيها الرقم الضريبي للمشتري عند تسجيله",
    requiresBuyerVat: true,
  },
  {
    id: "simplified",
    labelAr: "فاتورة ضريبية مبسطة",
    labelEn: "Simplified Tax Invoice (B2C)",
    icon: "🧾",
    desc: "للمعاملات مع المستهلك النهائي (B2C) — تتطلب في المرحلة الأولى رمز QR وتفاصيل مبسطة",
    requiresBuyerVat: false,
  },
];

// ─── Preset Sample Data ───────────────────────────────────────────────────────
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

// ─── Calculate single line item ───────────────────────────────────────────────
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

// ─── Blank line item factory ──────────────────────────────────────────────────
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

// ─── Validation Rules (Completeness Checker) ──────────────────────────────────
function validateInvoice({ invoiceType, seller, buyer, invoiceDetails, lines }) {
  const checks = [];

  const req = (label, value, hint) => ({
    label,
    status: value && String(value).trim() !== "" ? "ok" : "missing",
    hint: hint || null,
  });

  // 1. Seller Info
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

  // 2. Invoice Meta
  checks.push(req("رقم الفاتورة التسلسلي", invoiceDetails.invoiceNumber, "يجب أن يكون رقماً تسلسلياً فريداً"));
  checks.push(req("تاريخ إصدار الفاتورة", invoiceDetails.issueDate, "تاريخ تحرير المعاملة الضريبية"));

  // 3. Buyer Info
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

  // 4. Line Items
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EInvoiceGenerator() {
  // Invoice Type
  const [invoiceType, setInvoiceType] = useState("tax"); // "tax" | "simplified"

  // Seller State
  const [seller, setSeller] = useState(SAMPLE_PRESETS.tax.seller);

  // Buyer State
  const [buyer, setBuyer] = useState(SAMPLE_PRESETS.tax.buyer);

  // Invoice Details
  const [invoiceDetails, setInvoiceDetails] = useState(SAMPLE_PRESETS.tax.invoiceDetails);

  // Line Items
  const [lines, setLines] = useState(SAMPLE_PRESETS.tax.lines);

  // UI State
  const [showValidation, setShowValidation] = useState(false);
  const [activeTab, setActiveTab] = useState("form"); // "form" | "preview"

  // ─── Load Preset ───────────────────────────────────────────────────────────
  const applyPreset = (type) => {
    const preset = SAMPLE_PRESETS[type];
    setInvoiceType(type);
    setSeller(preset.seller);
    setBuyer(preset.buyer);
    setInvoiceDetails(preset.invoiceDetails);
    setLines(preset.lines);
  };

  // ─── Line Item Handlers ───────────────────────────────────────────────────
  const addLine = () => setLines((prev) => [...prev, newLine()]);
  const removeLine = (id) => setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  const updateLine = (id, field, value) =>
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );

  // ─── Calculations ─────────────────────────────────────────────────────────
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

    return {
      grossTotal,
      totalDiscount,
      taxable15,
      exemptOrZero,
      netSubtotal,
      totalVat,
      grandTotal,
    };
  }, [lineCalcs, lines]);

  // ─── Validation ───────────────────────────────────────────────────────────
  const validationResults = useMemo(
    () => validateInvoice({ invoiceType, seller, buyer, invoiceDetails, lines }),
    [invoiceType, seller, buyer, invoiceDetails, lines]
  );

  const { okCount, warnCount: warningCount, missCount: missingCount, completenessPercent, barColor: completenessBarColor } = calcCompleteness(validationResults);
  // keep legacy names for the JSX below
  const completePct_ = completenessPercent;

  // ─── Reset ────────────────────────────────────────────────────────────────
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

  // ─── Print ────────────────────────────────────────────────────────────────
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

  // ─── Styling Helpers (shared constants imported from businessUtils) ──────

  const currentInvoiceTypeMeta = INVOICE_TYPES.find((t) => t.id === invoiceType) || INVOICE_TYPES[0];

  return (
    <div className="rounded-2xl border border-brand-border bg-white shadow-card overflow-hidden" dir="rtl">
      {/* ── Top Official Disclaimer Banner ─────────────────────────────────── */}
      <div className="bg-amber-500/10 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 no-print">
        <div className="flex items-center gap-2">
          <span className="text-base shrink-0">⚠️</span>
          <p className="font-semibold leading-relaxed">
            <strong>تنبيه وإخلاء مسؤولية:</strong> هذا المولد يُنتج نماذج فواتير إرشادية وتدريبية قابلة للطباعة لترتيب الحسابات والتوثيق، ولا يُعد بديلاً عن حلول الفوترة الإلكترونية المعتمدة أو نظام الربط المباشر لهيئة الزكاة والضريبة والجمارك (ZATCA).
          </p>
        </div>
      </div>

      {/* ── App Header ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-l from-indigo-700 via-indigo-800 to-slate-900 px-6 py-5 text-white no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-xl bg-white/10 border border-white/20">🧾</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  مولد الفاتورة الإلكترونية السعودية
                </h1>
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  ZATCA 2026
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-1">
                فاتورة ضريبية B2B وفاتورة مبسطة B2C مع احتساب VAT 15% وفحص اكتمال الحقول
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-200 font-bold hidden sm:inline">تحميل نموذج:</span>
            <button
              onClick={() => applyPreset("tax")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                invoiceType === "tax"
                  ? "bg-white text-indigo-900 border-white shadow-sm"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              🏢 نموذج B2B ضريبية
            </button>
            <button
              onClick={() => applyPreset("simplified")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                invoiceType === "simplified"
                  ? "bg-white text-indigo-900 border-white shadow-sm"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              🧾 نموذج B2C مبسطة
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-3 border-t border-white/10">
          <button
            onClick={() => setActiveTab("form")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === "form"
                ? "bg-white text-indigo-900 shadow-md"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <span>📝</span>
            <span>تحرير بيانات الفاتورة</span>
          </button>
          <button
            onClick={handlePreview}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === "preview"
                ? "bg-white text-indigo-900 shadow-md"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <span>👁️</span>
            <span>معاينة الفاتورة والطباعة</span>
          </button>
        </div>
      </div>

      {/* ── Completeness Progress Strip ─────────────────────────────────────── */}
      <div className="border-b border-brand-border bg-slate-50 px-6 py-3 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-ink">مقياس اكتمال متطلبات الفاتورة:</span>
            <div className="w-32 sm:w-44 bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${completenessBarColor}`}
                style={{ width: `${completenessPercent}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-ink tabular-nums">{completenessPercent}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              {okCount} مكتمل ✓
            </span>
            {warningCount > 0 && (
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                {warningCount} تنبيه ⚠
              </span>
            )}
            {missingCount > 0 && (
              <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                {missingCount} ناقص ✗
              </span>
            )}
            <button
              onClick={() => setShowValidation(!showValidation)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline mr-2"
            >
              {showValidation ? "إخفاء الفحص" : "عرض قائمة التحقق"}
            </button>
          </div>
        </div>

        {/* Detailed Validation Accordion */}
        {showValidation && (
          <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {validationResults.map((check, i) => (
              <CheckItem key={i} status={check.status} label={check.label} hint={check.hint} />
            ))}
          </div>
        )}
      </div>

      {/* ══ FORM TAB ════════════════════════════════════════════════════════ */}
      {activeTab === "form" && (
        <div className="p-4 sm:p-6 space-y-6 no-print">

          {/* ─── Step 1: Invoice Type ────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                  ١
                </span>
                نوع الفاتورة الإلكترونية
              </h2>
              <span className="text-xs text-ink-muted">وفق معايير هيئة الزكاة والضريبة والجمارك</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INVOICE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setInvoiceType(t.id)}
                  className={`rounded-xl border-2 p-4 text-right transition-all ${
                    invoiceType === t.id
                      ? "border-indigo-600 bg-indigo-50/60 shadow-sm"
                      : "border-gray-200 bg-white hover:border-indigo-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{t.icon}</span>
                      <span className="text-sm font-extrabold text-ink">{t.labelAr}</span>
                    </div>
                    {invoiceType === t.id && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-indigo-700 font-medium">{t.labelEn}</p>
                  <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">{t.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* ─── Step 2: Seller Details ───────────────────────────────────── */}
          <section>
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                ٢
              </span>
              بيانات المورد / البائع (المكلف)
            </h2>
            <div className="rounded-xl border border-gray-200 bg-slate-50/50 p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    اسم المنشأة القانوني <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="مثال: شركة الحلول الرقمية ذ.م.م"
                    value={seller.name}
                    onChange={(e) => setSeller({ ...seller, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    الرقم الضريبي للبائع (15 رقماً) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="3XXXXXXXXXXXXXX (15 رقماً تبدأ بـ 3)"
                    maxLength={15}
                    value={seller.vatNumber}
                    onChange={(e) => setSeller({ ...seller, vatNumber: e.target.value.replace(/\D/g, "") })}
                  />
                  {seller.vatNumber && !isValidSaudiVatNumber(seller.vatNumber) && (
                    <p className="text-xs text-amber-600 mt-1">⚠ الرقم الضريبي السعودي يتكون من 15 رقماً ويبدأ بـ 3</p>
                  )}
                </div>
              </div>
              <div>
                <label className={labelCls}>
                  عنوان المنشأة التفصيلي <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="اسم الشارع، الحي، الرمز البريدي"
                  value={seller.address}
                  onChange={(e) => setSeller({ ...seller, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>
                    السجل التجاري (CR) <span className="text-gray-400 font-normal">اختياري</span>
                  </label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="1010XXXXXX"
                    value={seller.cr}
                    onChange={(e) => setSeller({ ...seller, cr: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    المدينة <span className="text-gray-400 font-normal">اختياري</span>
                  </label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="الرياض، جدة، الدمام..."
                    value={seller.city}
                    onChange={(e) => setSeller({ ...seller, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>الدولة</label>
                  <input
                    type="text"
                    className={`${inputCls} bg-gray-100 text-ink-muted`}
                    value={seller.country}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ─── Step 3: Buyer Details ────────────────────────────────────── */}
          <section>
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                ٣
              </span>
              بيانات المشتري / العميل
            </h2>
            <div className="rounded-xl border border-gray-200 bg-slate-50/50 p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    اسم العميل / الشركة <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="اسم المنشأة أو العميل الفرد"
                    value={buyer.name}
                    onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    الرقم الضريبي للمشتري
                    {invoiceType === "tax" ? (
                      <span className="text-indigo-700 mr-1 font-bold">(إلزامي في B2B عند التسجيل)</span>
                    ) : (
                      <span className="text-gray-400 mr-1 font-normal">(غير مطلوب في الفاتورة المبسطة)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder={invoiceType === "tax" ? "3XXXXXXXXXXXXXX" : "اختياري للمستهلك النهائي"}
                    maxLength={15}
                    value={buyer.vatNumber}
                    onChange={(e) => setBuyer({ ...buyer, vatNumber: e.target.value.replace(/\D/g, "") })}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>
                  عنوان العميل <span className="text-gray-400 font-normal">اختياري</span>
                </label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="المدينة، الحي (اختياري في المبسطة)"
                  value={buyer.address}
                  onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* ─── Step 4: Invoice Details ──────────────────────────────────── */}
          <section>
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                ٤
              </span>
              بيانات وتاريخ الفاتورة
            </h2>
            <div className="rounded-xl border border-gray-200 bg-slate-50/50 p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>
                    رقم الفاتورة <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="INV-2026-001"
                    value={invoiceDetails.invoiceNumber}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    تاريخ الإصدار <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={inputCls}
                    value={invoiceDetails.issueDate}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, issueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    وقت الإصدار <span className="text-gray-400 font-normal">اختياري</span>
                  </label>
                  <input
                    type="time"
                    className={inputCls}
                    value={invoiceDetails.issueTime}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, issueTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    تاريخ التوريد الفعلي <span className="text-gray-400 font-normal">اختياري</span>
                  </label>
                  <input
                    type="date"
                    className={inputCls}
                    value={invoiceDetails.supplyDate}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, supplyDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>عملة الفاتورة</label>
                  <select
                    className={inputCls}
                    value={invoiceDetails.currency}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, currency: e.target.value })}
                  >
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="EUR">يورو (EUR)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Step 5: Line Items ───────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                  ٥
                </span>
                بنود وتفاصيل السلع والخدمات
              </h2>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <span>+</span> إضافة بند جديد
              </button>
            </div>

            <div className="space-y-3">
              {lines.map((line, idx) => {
                const calc = lineCalcs.find((c) => c.id === line.id) || {};
                return (
                  <div
                    key={line.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm hover:border-indigo-300 transition-colors"
                  >
                    {/* Item row header */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        بند رقم {idx + 1}
                      </span>
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          className="text-xs text-rose-500 hover:text-rose-700 font-bold transition-colors"
                        >
                          ✕ حذف البند
                        </button>
                      )}
                    </div>

                    {/* Name + Description */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>
                          اسم السلعة / الخدمة <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="وصف واضح للسلعة أو الخدمة الموردة"
                          value={line.name}
                          onChange={(e) => updateLine(line.id, "name", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          الوصف التفصيلي <span className="text-gray-400 font-normal">اختياري</span>
                        </label>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="مواصفات إضافية، رقم الموديل، المدة..."
                          value={line.desc}
                          onChange={(e) => updateLine(line.id, "desc", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Qty, Price, VAT rate, Discount */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className={labelCls}>الكمية</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          className={inputCls}
                          value={line.qty}
                          onChange={(e) => updateLine(line.id, "qty", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>سعر الوحدة ({invoiceDetails.currency})</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={inputCls}
                          placeholder="0.00"
                          value={line.unitPrice}
                          onChange={(e) => updateLine(line.id, "unitPrice", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>نسبة الضريبة (VAT)</label>
                        <select
                          className={inputCls}
                          value={line.vatRateId}
                          onChange={(e) => updateLine(line.id, "vatRateId", e.target.value)}
                        >
                          {VAT_RATES.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>الخصم ({invoiceDetails.currency})</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={inputCls}
                          placeholder="0.00"
                          value={line.discount}
                          onChange={(e) => updateLine(line.id, "discount", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Live Line Calculations */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 bg-slate-50/70 p-2.5 rounded-lg text-center">
                      <div>
                        <p className="text-[10px] text-ink-muted">الوعاء بعد الخصم</p>
                        <p className="text-xs font-bold text-ink">{fmt(calc.taxableBase)} {invoiceDetails.currency}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-ink-muted">
                          مبلغ الضريبة ({calc.tag})
                        </p>
                        <p className="text-xs font-bold text-indigo-700">{fmt(calc.vatAmount)} {invoiceDetails.currency}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-ink-muted">إجمالي البند شامل الضريبة</p>
                        <p className="text-xs font-black text-emerald-700">{fmt(calc.total)} {invoiceDetails.currency}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={addLine}
              className="w-full mt-3 border-2 border-dashed border-indigo-200 rounded-xl py-3 text-sm text-indigo-600 font-bold hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors"
            >
              + إضافة بند جديد للفاتورة
            </button>
          </section>

          {/* ─── Step 6: Notes ───────────────────────────────────────────── */}
          <section>
            <h2 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                ٦
              </span>
              ملاحظات وشروط الدفع والتعاقد
            </h2>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="شروط السداد، رقم الحساب البنكي (IBAN)، سياسة الاستبدال أو أي تعليمات إضافية..."
              value={invoiceDetails.notes}
              onChange={(e) => setInvoiceDetails({ ...invoiceDetails, notes: e.target.value })}
            />
          </section>

          {/* ─── Totals Summary Card ──────────────────────────────────────── */}
          <div className="rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white p-5 space-y-2.5">
            <h3 className="text-sm font-extrabold text-ink border-b border-indigo-100 pb-2">
              📊 ملخص إجماليات الفاتورة
            </h3>

            <div className="flex items-center justify-between text-xs text-ink-secondary">
              <span>إجمالي المبيعات قبل الخصم:</span>
              <span className="font-bold tabular-nums">{fmt(totals.grossTotal)} {invoiceDetails.currency}</span>
            </div>

            {totals.totalDiscount > 0 && (
              <div className="flex items-center justify-between text-xs text-rose-600">
                <span>إجمالي الخصومات:</span>
                <span className="font-bold tabular-nums">- {fmt(totals.totalDiscount)} {invoiceDetails.currency}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-ink font-bold border-t border-indigo-100 pt-1.5">
              <span>الوعاء الخاضع للضريبة (15%):</span>
              <span className="tabular-nums">{fmt(totals.taxable15)} {invoiceDetails.currency}</span>
            </div>

            {totals.exemptOrZero > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>مبالغ صفرية / معفاة / خارج النطاق:</span>
                <span className="font-medium tabular-nums">{fmt(totals.exemptOrZero)} {invoiceDetails.currency}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-indigo-700 font-extrabold">
              <span>إجمالي ضريبة القيمة المضافة (15%):</span>
              <span className="tabular-nums">+{fmt(totals.totalVat)} {invoiceDetails.currency}</span>
            </div>

            <div className="border-t-2 border-indigo-200 pt-3 flex items-center justify-between">
              <span className="text-base font-black text-ink">الإجمالي النهائي المستحق للدفع:</span>
              <span className="text-xl font-black text-emerald-700 tabular-nums">
                {fmt(totals.grandTotal)} {invoiceDetails.currency}
              </span>
            </div>
          </div>

          {/* ─── ZATCA QR Status Notice ───────────────────────────────────── */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">📱</span>
              <div className="space-y-1">
                <p className="text-xs font-bold text-blue-950">
                  رمز الاستجابة السريعة (QR Code) — منظومة فاتورة ZATCA
                </p>
                <p className="text-xs text-blue-800 leading-relaxed">
                  خاصية تشفير رمز QR بتقنية TLV Base64 والربط المباشر مع منصة Fatoora (CSID) <strong>قيد التطوير التقني</strong>. تجنباً لأي ادعاء غير معتمد، لا نعرض رمزاً وهمياً، وتُخصص مساحة مخصصة للرمز في نموذج الطباعة للمراجعة والتحضير الداخلي.
                </p>
                <a
                  href="https://zatca.gov.sa/en/E-Invoicing/SystemsDevelopers/Pages/E-Invoice-specifications.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>مراجعة المواصفات الفنية الرسمية لهيئة الزكاة والضريبة والجمارك</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* ─── Internal Tools Links ─────────────────────────────────────── */}
          <div className="rounded-xl border border-gray-200 bg-slate-50 p-4 space-y-2">
            <p className="text-xs font-bold text-ink">🔗 أدوات مساعدة لمنظومة الفوترة والضريبة بالسعودية:</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <Link
                href="/vat-calculator/saudi"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-indigo-400 text-indigo-700 font-bold transition shadow-sm"
              >
                <span>🧾</span>
                <span>حاسبة ضريبة القيمة المضافة 15%</span>
                <span>←</span>
              </Link>
              <Link
                href="/ar/sa/vat-registration-checker"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-purple-400 text-purple-700 font-bold transition shadow-sm"
              >
                <span>🏢</span>
                <span>حاسبة أهلية التسجيل في ضريبة القيمة المضافة</span>
                <span>←</span>
              </Link>
            </div>
          </div>

          {/* ─── Action Buttons ───────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={handlePreview}
              className="flex-1 min-w-[140px] rounded-xl bg-indigo-600 py-3 text-sm font-extrabold text-white hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>👁️</span>
              <span>معاينة الفاتورة للطباعة</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 min-w-[140px] rounded-xl border-2 border-indigo-600 bg-white py-3 text-sm font-extrabold text-indigo-700 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
            >
              <span>🖨️</span>
              <span>طباعة الفاتورة (A4 / PDF)</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-ink-secondary hover:bg-gray-50 transition-colors"
            >
              🔄 مسح الحقول
            </button>
          </div>
        </div>
      )}

      {/* ══ PRINT & PREVIEW VIEW ════════════════════════════════════════════ */}
      <div className={`${activeTab === "preview" ? "block" : "hidden"} print:block p-4 sm:p-6`}>
        {/* Back and Print Bar (Hidden during actual print) */}
        <div className="flex items-center justify-between gap-3 mb-6 no-print bg-slate-100 p-3 rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-ink hover:bg-gray-50 transition"
          >
            <span>←</span>
            <span>العودة لتعديل البيانات</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-700 px-5 py-2 text-xs font-extrabold text-white hover:bg-indigo-800 transition shadow-sm"
            >
              <span>🖨️</span>
              <span>طباعة الفاتورة أو حفظ كـ PDF</span>
            </button>
          </div>
        </div>

        {/* ═══ The Physical A4 Printable Invoice Document ══════════════════ */}
        <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 sm:p-8 text-black print:border-0 print:p-0 print:m-0 print:shadow-none print:w-full print:max-w-none">
          
          {/* Invoice Document Header */}
          <div className="border-b-2 border-black pb-5 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-black">
                  {currentInvoiceTypeMeta.labelAr}
                </h2>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-0.5">
                  {currentInvoiceTypeMeta.labelEn}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  المملكة العربية السعودية — نموذج فوترة إلكترونية
                </p>
              </div>

              <div className="text-right bg-gray-50 p-3 rounded-xl border border-gray-200 print:bg-transparent print:border-0 print:p-0">
                <p className="text-xs text-gray-500 font-bold">رقم الفاتورة | Invoice #</p>
                <p className="text-lg font-black text-black font-mono mt-0.5">
                  {invoiceDetails.invoiceNumber || "—"}
                </p>
              </div>
            </div>

            {/* Dates & Currency Strip */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl print:bg-gray-100">
              <div>
                <span className="text-gray-500 block">تاريخ الإصدار / Issue Date:</span>
                <span className="font-bold text-black font-mono">{invoiceDetails.issueDate || "—"}</span>
              </div>
              <div>
                <span className="text-gray-500 block">وقت الإصدار / Issue Time:</span>
                <span className="font-bold text-black font-mono">{invoiceDetails.issueTime || "—"}</span>
              </div>
              <div>
                <span className="text-gray-500 block">تاريخ التوريد / Supply Date:</span>
                <span className="font-bold text-black font-mono">{invoiceDetails.supplyDate || "—"}</span>
              </div>
              <div>
                <span className="text-gray-500 block">العملة / Currency:</span>
                <span className="font-bold text-black">{invoiceDetails.currency}</span>
              </div>
            </div>
          </div>

          {/* Seller & Buyer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
            {/* Seller */}
            <div className="border border-gray-300 rounded-xl p-4 bg-gray-50/50">
              <p className="font-black text-black text-sm border-b border-gray-200 pb-1 mb-2">
                بيانات المورد / البائع (Seller)
              </p>
              <div className="space-y-1">
                <p><strong className="text-black">الاسم القانوني:</strong> {seller.name || "—"}</p>
                <p><strong className="text-black">الرقم الضريبي (VAT):</strong> <span className="font-mono font-bold">{seller.vatNumber || "—"}</span></p>
                {seller.cr && <p><strong className="text-black">السجل التجاري (CR):</strong> <span className="font-mono">{seller.cr}</span></p>}
                {seller.address && <p><strong className="text-black">العنوان:</strong> {seller.address}</p>}
                {seller.city && <p><strong className="text-black">المدينة والدولة:</strong> {seller.city}، {seller.country}</p>}
              </div>
            </div>

            {/* Buyer */}
            <div className="border border-gray-300 rounded-xl p-4 bg-gray-50/50">
              <p className="font-black text-black text-sm border-b border-gray-200 pb-1 mb-2">
                بيانات المشتري / العميل (Buyer)
              </p>
              <div className="space-y-1">
                <p><strong className="text-black">الاسم:</strong> {buyer.name || "—"}</p>
                {buyer.vatNumber ? (
                  <p><strong className="text-black">الرقم الضريبي (VAT):</strong> <span className="font-mono font-bold">{buyer.vatNumber}</span></p>
                ) : (
                  <p className="text-gray-500">الرقم الضريبي: غير مسجل / مستهلك نهائي</p>
                )}
                {buyer.address && <p><strong className="text-black">العنوان:</strong> {buyer.address}</p>}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-black text-white print:bg-black print:text-white">
                  <th className="p-2 text-right">#</th>
                  <th className="p-2 text-right">البيان والوصف / Description</th>
                  <th className="p-2 text-center">الكمية</th>
                  <th className="p-2 text-left">سعر الوحدة</th>
                  <th className="p-2 text-left">الخصم</th>
                  <th className="p-2 text-left">الوعاء الضريبي</th>
                  <th className="p-2 text-left">نسبة الضريبة</th>
                  <th className="p-2 text-left">مبلغ الضريبة</th>
                  <th className="p-2 text-left">الإجمالي شامل الضريبة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lines.map((line, idx) => {
                  const calc = lineCalcs.find((c) => c.id === line.id) || {};
                  return (
                    <tr key={line.id} className="border-b border-gray-200">
                      <td className="p-2 font-mono text-gray-500">{idx + 1}</td>
                      <td className="p-2">
                        <p className="font-bold text-black">{line.name || "—"}</p>
                        {line.desc && <p className="text-[10px] text-gray-500 mt-0.5">{line.desc}</p>}
                      </td>
                      <td className="p-2 font-mono text-center font-bold">{line.qty}</td>
                      <td className="p-2 font-mono text-left">{fmt(parseNum(line.unitPrice))}</td>
                      <td className="p-2 font-mono text-left">{parseNum(line.discount) > 0 ? fmt(parseNum(line.discount)) : "—"}</td>
                      <td className="p-2 font-mono text-left font-medium">{fmt(calc.taxableBase)}</td>
                      <td className="p-2 text-left font-bold">{calc.tag}</td>
                      <td className="p-2 font-mono text-left font-bold">{fmt(calc.vatAmount)}</td>
                      <td className="p-2 font-mono text-left font-black text-black">{fmt(calc.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Section: QR Status + Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start mb-6">
            
            {/* QR Code Presentation Box */}
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-4 bg-gray-50/70 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 border border-gray-300 bg-white rounded-lg flex flex-col items-center justify-center p-2 mb-2 shadow-inner">
                <span className="text-2xl text-gray-400">📱</span>
                <span className="text-[9px] font-bold text-gray-700 mt-1">ZATCA QR</span>
                <span className="text-[8px] text-amber-700 font-bold bg-amber-100 px-1 py-0.5 rounded mt-0.5">
                  قيد التطوير الفني
                </span>
              </div>
              <p className="text-xs font-black text-gray-800">
                رمز الاستجابة السريعة (ZATCA FATOORA)
              </p>
              <p className="text-[10px] text-gray-600 leading-relaxed max-w-[240px] mt-1">
                توليد رمز QR المعتمد يستلزم تشفيراً بترميز TLV Base64 والربط المباشر عبر شهادة CSID. حفاظاً على المصداقية والشفافية النظامية، لا نُضمّن رمزاً وهمياً.
              </p>
            </div>

            {/* Financial Totals Box */}
            <div className="border border-gray-300 rounded-xl p-4 bg-gray-50/50 space-y-2 text-xs">
              <div className="flex justify-between text-gray-700">
                <span>إجمالي المبلغ الخاضع للضريبة (قبل الضريبة):</span>
                <span className="font-mono font-bold">{fmt(totals.netSubtotal)} {invoiceDetails.currency}</span>
              </div>

              {totals.totalDiscount > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>إجمالي الخصم التجاري:</span>
                  <span className="font-mono font-bold">- {fmt(totals.totalDiscount)} {invoiceDetails.currency}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-900 font-bold border-t border-gray-200 pt-1.5">
                <span>إجمالي ضريبة القيمة المضافة 15%:</span>
                <span className="font-mono font-black">{fmt(totals.totalVat)} {invoiceDetails.currency}</span>
              </div>

              <div className="border-t-2 border-black pt-2 flex justify-between items-center text-sm font-black text-black">
                <span>المبلغ الإجمالي المستحق:</span>
                <span className="font-mono text-base">{fmt(totals.grandTotal)} {invoiceDetails.currency}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoiceDetails.notes && (
            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 mb-4 text-xs">
              <p className="font-bold text-gray-700 mb-1">ملاحظات وشروط:</p>
              <p className="text-gray-600 leading-relaxed">{invoiceDetails.notes}</p>
            </div>
          )}

          {/* Printed Footer & Legal Disclaimer */}
          <div className="border-t border-gray-300 pt-3 text-center text-[10px] text-gray-500 leading-relaxed">
            <p className="font-bold text-gray-700">
              نموذج فاتورة إلكترونية تجريبي وقابل للطباعة لأغراض المراجعة والتوثيق الداخلي
            </p>
            <p className="mt-0.5">
              هذا المستند لا يُعد فاتورة إلكترونية معتمدة أو مصدقة رسمياً من هيئة الزكاة والضريبة والجمارك (ZATCA). يتطلب الامتثال القانوني الربط التقني بمنظومة فاتورة عبر حلول فوترة إلكترونية معتمدة.
            </p>
            <p className="mt-0.5 font-mono text-[9px] text-gray-400">
              arabic-tools-xi.vercel.app/ar/sa/e-invoice-generator | {seller.name || "منظومة الأدوات العربية"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
