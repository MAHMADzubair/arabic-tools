"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  VAT_MANDATORY_THRESHOLD,
  VAT_VOLUNTARY_THRESHOLD,
  REGISTRATION_STATUS,
  ZATCA_OFFICIAL_URL,
  evaluateVatEligibility,
  formatSAR,
  formatInt,
} from "@/lib/vatRegistrationConfig";

export default function VatRegistrationChecker() {
  // Step 1: Residency
  const [isResident, setIsResident] = useState(true);
  const [obligatedToPaySaudiVat, setObligatedToPaySaudiVat] = useState(false);

  // Step 2: Previous 12 months supplies
  const [grossPreviousSupplies, setGrossPreviousSupplies] = useState("450000");
  const [exemptSupplies, setExemptSupplies] = useState("100000");
  const [outOfScopeSupplies, setOutOfScopeSupplies] = useState("0");
  const [capitalAssetSales, setCapitalAssetSales] = useState("0");
  const [showExclusionInputs, setShowExclusionInputs] = useState(true);

  // Step 3: Expected next 12 months supplies
  const [expectedSupplies, setExpectedSupplies] = useState("350000");

  // Step 4: Taxable expenses (for voluntary threshold assessment)
  const [previousTaxableExpenses, setPreviousTaxableExpenses] = useState("0");
  const [expectedTaxableExpenses, setExpectedTaxableExpenses] = useState("0");
  const [showExpenseInputs, setShowExpenseInputs] = useState(false);

  // UI helpers
  const [copied, setCopied] = useState(false);
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);

  // Reset form
  const handleReset = () => {
    setIsResident(true);
    setObligatedToPaySaudiVat(false);
    setGrossPreviousSupplies("0");
    setExemptSupplies("0");
    setOutOfScopeSupplies("0");
    setCapitalAssetSales("0");
    setExpectedSupplies("0");
    setPreviousTaxableExpenses("0");
    setExpectedTaxableExpenses("0");
    setShowExclusionInputs(false);
    setShowExpenseInputs(false);
  };

  // Load preset scenarios
  const loadPreset = (scenario) => {
    setIsResident(true);
    setObligatedToPaySaudiVat(false);
    if (scenario === "mandatory") {
      setGrossPreviousSupplies("420000");
      setExemptSupplies("0");
      setOutOfScopeSupplies("0");
      setCapitalAssetSales("0");
      setExpectedSupplies("400000");
      setPreviousTaxableExpenses("50000");
      setExpectedTaxableExpenses("60000");
      setShowExclusionInputs(false);
    } else if (scenario === "voluntary") {
      setGrossPreviousSupplies("250000");
      setExemptSupplies("0");
      setOutOfScopeSupplies("0");
      setCapitalAssetSales("0");
      setExpectedSupplies("260000");
      setPreviousTaxableExpenses("80000");
      setExpectedTaxableExpenses("90000");
      setShowExclusionInputs(false);
    } else if (scenario === "below") {
      setGrossPreviousSupplies("150000");
      setExemptSupplies("0");
      setOutOfScopeSupplies("0");
      setCapitalAssetSales("0");
      setExpectedSupplies("160000");
      setPreviousTaxableExpenses("40000");
      setExpectedTaxableExpenses("45000");
      setShowExclusionInputs(false);
    } else if (scenario === "exclusions") {
      setGrossPreviousSupplies("450000");
      setExemptSupplies("100000");
      setOutOfScopeSupplies("0");
      setCapitalAssetSales("0");
      setExpectedSupplies("320000");
      setPreviousTaxableExpenses("60000");
      setExpectedTaxableExpenses("70000");
      setShowExclusionInputs(true);
    } else if (scenario === "nonresident") {
      setIsResident(false);
      setObligatedToPaySaudiVat(true);
      setGrossPreviousSupplies("50000");
      setExemptSupplies("0");
      setOutOfScopeSupplies("0");
      setCapitalAssetSales("0");
      setExpectedSupplies("50000");
    }
  };

  // Run evaluation engine
  const evalResult = useMemo(() => {
    return evaluateVatEligibility({
      isResident,
      obligatedToPaySaudiVat,
      grossPreviousSupplies,
      exemptSupplies,
      outOfScopeSupplies,
      capitalAssetSales,
      expectedSupplies,
      previousTaxableExpenses,
      expectedTaxableExpenses,
    });
  }, [
    isResident,
    obligatedToPaySaudiVat,
    grossPreviousSupplies,
    exemptSupplies,
    outOfScopeSupplies,
    capitalAssetSales,
    expectedSupplies,
    previousTaxableExpenses,
    expectedTaxableExpenses,
  ]);

  // Analytics event tracking
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.trackEvent === "function") {
      window.trackEvent("calculator_used", {
        tool: "vat-registration-checker",
        status: evalResult.status,
        is_resident: isResident,
      });
    }
  }, [evalResult.status, isResident]);

  // WhatsApp share text
  const shareText = useMemo(() => {
    return `🏢 نتيجة فحص أهلية التسجيل في ضريبة القيمة المضافة بالسعودية:
• الحالة: ${evalResult.titleAr}
• التوريدات الخاضعة المحتسبة: ${formatSAR(evalResult.taxablePreviousSupplies)} ر.س
• حد التسجيل الإلزامي: ${formatSAR(VAT_MANDATORY_THRESHOLD)} ر.س
• حد التسجيل الاختياري: ${formatSAR(VAT_VOLUNTARY_THRESHOLD)} ر.س
• النتيجة: ${evalResult.primaryReason}

افحص أهليتك مجاناً عبر حاسبة ضريبة القيمة المضافة:
https://arabic-tools-xi.vercel.app/ar/sa/vat-registration-checker`;
  }, [evalResult]);

  return (
    <div className="space-y-6">
      {/* ── Hero Banner ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-hero-gradient p-6 text-white shadow-result">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏢</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black leading-tight">
                حاسبة أهلية التسجيل في ضريبة القيمة المضافة
              </h1>
              <p className="mt-1 text-sm text-white/85">
                فحص فوري للالتزام بحد التسجيل الإلزامي (375 ألف ر.س) والاختياري (187.5 ألف ر.س) وفق معايير ZATCA
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-white/20 border border-white/30 px-3 py-1 text-xs font-bold whitespace-nowrap">
            محدث 2026 — هيئة الزكاة والضريبة والجمارك
          </span>
        </div>
      </div>

      {/* ── Presets Bar ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="text-xs font-extrabold text-ink flex items-center gap-1.5">
            <span>💡</span>
            <span>نماذج سريعة للتجربة:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadPreset("mandatory")}
              className="rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-800 hover:bg-rose-100 transition-all"
            >
              مبيعات 420 ألف (إلزامي)
            </button>
            <button
              type="button"
              onClick={() => loadPreset("voluntary")}
              className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition-all"
            >
              مبيعات 250 ألف (اختياري)
            </button>
            <button
              type="button"
              onClick={() => loadPreset("below")}
              className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-all"
            >
              مبيعات 150 ألف (دون الحد)
            </button>
            <button
              type="button"
              onClick={() => loadPreset("exclusions")}
              className="rounded-lg bg-purple-50 border border-purple-200 px-2.5 py-1 text-[11px] font-bold text-purple-800 hover:bg-purple-100 transition-all"
            >
              إجمالي 450 ألف مع معفى (استبعاد)
            </button>
            <button
              type="button"
              onClick={() => loadPreset("nonresident")}
              className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-bold text-blue-800 hover:bg-blue-100 transition-all"
            >
              غير مقيم (حالة خاصة)
            </button>
          </div>
        </div>
      </div>

      {/* ── Interactive Input Form ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* STEP 1: Residency */}
        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
              ١
            </span>
            <span className="text-lg">🇸🇦</span>
            <h2 className="text-sm sm:text-base font-extrabold text-ink">
              الإقامة والنشاط الاقتصادي في المملكة
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-2">
              هل المنشأة / الشخص مقيم في المملكة العربية السعودية؟
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setIsResident(true)}
                className={`rounded-xl border p-3 text-center text-xs font-extrabold transition-all ${
                  isResident
                    ? "border-brand bg-brand-light text-brand-dark shadow-sm"
                    : "border-brand-border bg-white text-ink-secondary hover:border-brand-200"
                }`}
              >
                نعم (مقيم في المملكة)
              </button>
              <button
                type="button"
                onClick={() => setIsResident(false)}
                className={`rounded-xl border p-3 text-center text-xs font-extrabold transition-all ${
                  !isResident
                    ? "border-brand bg-brand-light text-brand-dark shadow-sm"
                    : "border-brand-border bg-white text-ink-secondary hover:border-brand-200"
                }`}
              >
                لا (غير مقيم)
              </button>
            </div>
          </div>

          {/* Non-resident followup question */}
          {!isResident && (
            <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <h3 className="text-xs font-extrabold text-purple-900">
                    ضوابط تسجيل غير المقيمين لدى هيئة الزكاة والضريبة والجمارك (ZATCA)
                  </h3>
                  <p className="text-[11px] text-purple-800 leading-relaxed mt-0.5">
                    الأشخاص غير المقيمين ليس لهم حد أدنى للتسجيل (لا ينطبق حد الـ 375,000 ريال) في حال كانوا ملزمين بسداد الضريبة عن توريداتهم بالمملكة.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-950 mb-2">
                  هل أنت ملزم بسداد ضريبة القيمة المضافة عن توريدات داخل المملكة؟
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setObligatedToPaySaudiVat(true)}
                    className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                      obligatedToPaySaudiVat
                        ? "border-purple-600 bg-purple-200/80 text-purple-950 shadow-sm"
                        : "border-purple-200 bg-white text-purple-900 hover:bg-purple-100/50"
                    }`}
                  >
                    نعم (ملزم بسداد الضريبة محلياً)
                  </button>
                  <button
                    type="button"
                    onClick={() => setObligatedToPaySaudiVat(false)}
                    className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                      !obligatedToPaySaudiVat
                        ? "border-purple-600 bg-purple-200/80 text-purple-950 shadow-sm"
                        : "border-purple-200 bg-white text-purple-900 hover:bg-purple-100/50"
                    }`}
                  >
                    لا (توريدات خاضعة للتكليف العكسي أو لا تتطلب سداداً)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: Previous 12 Months Supplies */}
        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
                ٢
              </span>
              <span className="text-lg">📊</span>
              <h2 className="text-sm sm:text-base font-extrabold text-ink">
                إجمالي التوريدات خلال آخر 12 شهراً
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowExclusionInputs(!showExclusionInputs)}
              className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1"
            >
              <span>{showExclusionInputs ? "إخفاء الاستبعادات" : "إضافة استبعادات (معفى / أصول)"}</span>
              <span>{showExclusionInputs ? "▲" : "▼"}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-1">
              إجمالي التوريدات (المبيعات) خلال الـ 12 شهراً الماضية (ر.س) *
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={grossPreviousSupplies}
              onChange={(e) => setGrossPreviousSupplies(e.target.value)}
              placeholder="مثال: 450000"
              className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-ink-muted">
              المبلغ الإجمالي لكافة التوريدات والمبيعات الصادرة قبل احتساب الاستثناءات.
            </p>
          </div>

          {/* Exclusions Sub-section */}
          {showExclusionInputs && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <span>🛡️</span>
                  <span>الاستبعادات النظامية (لا تُحتسب ضمن حد الـ 375,000 ريال):</span>
                </span>
                <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                  تُخصم تلقائياً
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    التوريدات المعفاة (ر.س)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={exemptSupplies}
                    onChange={(e) => setExemptSupplies(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-ink focus:border-brand focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-amber-800">
                    كإيجار العقارات السكنية وبعض الخدمات المالية.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    توريدات خارج نطاق الضريبة (ر.س)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={outOfScopeSupplies}
                    onChange={(e) => setOutOfScopeSupplies(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-ink focus:border-brand focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-amber-800">
                    العمليات غير الخاضعة للنظام الضريبي.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    مبيعات الأصول الرأسمالية (ر.س)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={capitalAssetSales}
                    onChange={(e) => setCapitalAssetSales(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-ink focus:border-brand focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-amber-800">
                    بيع سيارات أو أجهزة المنشأة المستعملة.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Calculated Net Supplies Card */}
          <div className="rounded-xl border border-brand-border bg-brand-surface p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs font-extrabold text-brand-dark">
                التوريدات الخاضعة المحتسبة لأغراض التسجيل (الصافية):
              </p>
              <p className="text-[11px] text-ink-muted">
                {formatSAR(evalResult.grossPrev)} − {formatSAR(evalResult.totalExclusions)} (استبعادات) =
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-lg font-black text-brand-dark">
                {formatSAR(evalResult.taxablePreviousSupplies)} ر.س
              </span>
            </div>
          </div>
        </div>

        {/* STEP 3: Expected Next 12 Months */}
        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
              ٣
            </span>
            <span className="text-lg">🔮</span>
            <h2 className="text-sm sm:text-base font-extrabold text-ink">
              التوريدات الخاضعة المتوقعة خلال الـ 12 شهراً القادمة
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-1">
              التوريدات الخاضعة المتوقعة في الـ 12 شهراً القادمة (ر.س) *
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={expectedSupplies}
              onChange={(e) => setExpectedSupplies(e.target.value)}
              placeholder="مثال: 350000"
              className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-ink-muted">
              حسب العقود المؤكدة، أو التوقعات الموثقة للنشاط في نهاية أي شهر للعام المقبل.
            </p>
          </div>
        </div>

        {/* STEP 4: Taxable Expenses (Voluntary) */}
        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
                ٤
              </span>
              <span className="text-lg">🧾</span>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-ink">
                  المصروفات الخاضعة للضريبة (لتقييم التسجيل الاختياري)
                </h2>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  اختياري — تفيد المنشآت التي لم تصل مبيعاتها لحد الـ 187,500 وترغب باسترداد ضريبة مدخلاتها.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowExpenseInputs(!showExpenseInputs)}
              className="text-[11px] font-bold text-brand hover:underline shrink-0"
            >
              {showExpenseInputs ? "إخفاء المصروفات" : "إدخال المصروفات ▼"}
            </button>
          </div>

          {showExpenseInputs && (
            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              <div>
                <label className="block text-xs font-bold text-ink-secondary mb-1">
                  المصروفات الخاضعة خلال آخر 12 شهراً (ر.س)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={previousTaxableExpenses}
                  onChange={(e) => setPreviousTaxableExpenses(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm font-semibold text-ink focus:border-brand focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-ink-muted">
                  مشتريات ومصروفات تشغيلية خاضعة لنسبة الـ 15%.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-secondary mb-1">
                  المصروفات الخاضعة المتوقعة للـ 12 شهراً القادمة (ر.س)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={expectedTaxableExpenses}
                  onChange={(e) => setExpectedTaxableExpenses(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm font-semibold text-ink focus:border-brand focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-ink-muted">
                  مشتريات وتكاليف تأسيس متوقعة للمشروع.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Visual Threshold Indicator ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-extrabold text-ink flex items-center gap-1.5">
            <span>📈</span>
            <span>مؤشر حدود التسجيل الضريبي في السعودية:</span>
          </h3>
          <span className="text-[11px] font-bold text-brand-dark">
            أعلى قيمة محتسبة: {formatSAR(evalResult.primaryTriggerValue || 0)} ر.س
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="relative h-6 w-full rounded-xl bg-slate-100 overflow-hidden border border-slate-300">
            {/* Range 1: 0 - 187,500 (50%) */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-emerald-100 border-l border-emerald-300"
              style={{ width: "50%" }}
            />
            {/* Range 2: 187,500 - 375,000 (50%) */}
            <div
              className="absolute left-[50%] top-0 bottom-0 bg-amber-100 border-l border-amber-300"
              style={{ width: "50%" }}
            />
            {/* Active User Marker Fill */}
            <div
              className={`absolute top-0 bottom-0 transition-all duration-500 ${
                evalResult.status === REGISTRATION_STATUS.MANDATORY
                  ? "bg-rose-500 shadow-md"
                  : evalResult.status === REGISTRATION_STATUS.VOLUNTARY
                  ? "bg-amber-500"
                  : evalResult.status === REGISTRATION_STATUS.NON_RESIDENT_SPECIAL
                  ? "bg-purple-600"
                  : "bg-emerald-500"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    3,
                    ((evalResult.primaryTriggerValue || 0) / VAT_MANDATORY_THRESHOLD) * 100
                  )
                )}%`,
              }}
            />
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between text-[10px] sm:text-[11px] font-bold text-ink-muted px-1">
            <span>٠ ر.س</span>
            <span className="text-amber-800">
              ١٨٧٬٥٠٠ ر.س
              <span className="block text-[9px] font-normal text-ink-muted text-center">حد اختياري</span>
            </span>
            <span className="text-rose-800">
              ٣٧٥٬٠٠٠ ر.س
              <span className="block text-[9px] font-normal text-ink-muted text-left">حد إلزامي</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-center">
            <span className="font-extrabold text-emerald-800 block">دون الحد (أقل من 187.5 ألف)</span>
            <span className="text-emerald-700 text-[10px]">غير ملزم بالتسجيل حالياً</span>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-center">
            <span className="font-extrabold text-amber-800 block">التسجيل الاختياري (187.5 - 375 ألف)</span>
            <span className="text-amber-700 text-[10px]">مؤهل اختياري لاسترداد المدخلات</span>
          </div>
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-center">
            <span className="font-extrabold text-rose-800 block">التسجيل الإلزامي (أكثر من 375 ألف)</span>
            <span className="text-rose-700 text-[10px]">مطلوب نظاماً تجنباً للغرامات</span>
          </div>
        </div>
      </div>

      {/* ── PRIMARY RESULT CARD ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-brand bg-white shadow-xl overflow-hidden">
        {/* Result Header */}
        <div
          className={`p-6 text-white ${
            evalResult.status === REGISTRATION_STATUS.MANDATORY
              ? "bg-gradient-to-r from-rose-700 to-rose-600"
              : evalResult.status === REGISTRATION_STATUS.VOLUNTARY
              ? "bg-gradient-to-r from-amber-600 to-amber-500"
              : evalResult.status === REGISTRATION_STATUS.NON_RESIDENT_SPECIAL
              ? "bg-gradient-to-r from-purple-800 to-indigo-700"
              : "bg-gradient-to-r from-emerald-700 to-teal-600"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="text-4xl sm:text-5xl">
                {evalResult.status === REGISTRATION_STATUS.MANDATORY
                  ? "🚨"
                  : evalResult.status === REGISTRATION_STATUS.VOLUNTARY
                  ? "⭐"
                  : evalResult.status === REGISTRATION_STATUS.NON_RESIDENT_SPECIAL
                  ? "🌐"
                  : "✅"}
              </span>
              <div>
                <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold mb-1">
                  {evalResult.badgeAr}
                </span>
                <h2 className="text-xl sm:text-2xl font-black">{evalResult.titleAr}</h2>
                <p className="text-xs sm:text-sm text-white/90 mt-1 leading-relaxed">
                  {evalResult.primaryReason}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Result Metrics Grid */}
        <div className="p-6 space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-brand-border bg-slate-50/70 p-3.5">
              <p className="text-[11px] font-bold text-ink-muted">حد التسجيل الإلزامي</p>
              <p className="text-base font-black text-rose-700 mt-0.5">
                {formatSAR(VAT_MANDATORY_THRESHOLD)} ر.س
              </p>
              <p className="text-[10px] text-ink-muted">وفق المادة (50) من اللائحة</p>
            </div>

            <div className="rounded-xl border border-brand-border bg-slate-50/70 p-3.5">
              <p className="text-[11px] font-bold text-ink-muted">حد التسجيل الاختياري</p>
              <p className="text-base font-black text-amber-700 mt-0.5">
                {formatSAR(VAT_VOLUNTARY_THRESHOLD)} ر.س
              </p>
              <p className="text-[10px] text-ink-muted">وفق المادة (51) من اللائحة</p>
            </div>

            <div className="rounded-xl border-2 border-brand bg-brand-surface p-3.5">
              <p className="text-[11px] font-extrabold text-brand-dark">القيمة الخاضعة المحتسبة</p>
              <p className="text-base font-black text-brand-dark mt-0.5">
                {formatSAR(evalResult.primaryTriggerValue || 0)} ر.س
              </p>
              <p className="text-[10px] text-ink-muted">
                {evalResult.status === REGISTRATION_STATUS.MANDATORY
                  ? `الفرق عن الإلزامي: +${formatSAR(evalResult.difference)} ر.س`
                  : evalResult.status === REGISTRATION_STATUS.VOLUNTARY
                  ? `المسافة للإلزامي: ${formatSAR(evalResult.distanceToMandatory)} ر.س`
                  : `المتبقي للاختياري: ${formatSAR(evalResult.difference)} ر.س`}
              </p>
            </div>
          </div>

          {/* Detailed Legal Advice Card */}
          <div className="rounded-xl border border-brand-border/80 bg-slate-50 p-4 space-y-2">
            <h4 className="text-xs font-extrabold text-ink flex items-center gap-1.5">
              <span>📋</span>
              <span>التوجيه والالتزام الإجرائي المطلوب:</span>
            </h4>
            <p className="text-xs text-ink-secondary leading-relaxed">
              {evalResult.detailedExplanation}
            </p>
            {evalResult.status === REGISTRATION_STATUS.MANDATORY && (
              <p className="text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 p-2.5 rounded-lg leading-relaxed">
                ⚠️ تنبيه: عدم التسجيل في الموعد المحدد يُعرّض المنشأة لغرامات مالية بموجب نظام ضريبة القيمة المضافة (تصل إلى 10,000 ريال عن عدم التسجيل بالإضافة لغرامات التأخير في السداد وتقديم الإقرارات).
              </p>
            )}
            {evalResult.status === REGISTRATION_STATUS.NON_RESIDENT_SPECIAL && (
              <div className="text-[11px] text-purple-900 bg-purple-50 border border-purple-200 p-2.5 rounded-lg space-y-1">
                <p className="font-bold">🌐 لغير المقيمين في السعودية:</p>
                <p>
                  يمكن إتمام التسجيل إما بصفة مباشرة أو عن طريق تعيين <strong>ممثل ضريبي معتمد (Tax Representative)</strong> يقيم داخل المملكة ويكون مسؤولاً بالتضامن عن الالتزامات الضريبية أمام ZATCA.
                </p>
              </div>
            )}
          </div>

          {/* Collapsible: How was this determined? */}
          <div className="border-t border-brand-border/60 pt-3">
            <button
              type="button"
              onClick={() => setShowCalculationDetails(!showCalculationDetails)}
              className="w-full flex items-center justify-between text-xs font-extrabold text-brand hover:text-brand-dark py-1"
            >
              <span className="flex items-center gap-1.5">
                <span>🔍</span>
                <span>كيف تم تحديد النتيجة واحتساب الاستبعادات؟</span>
              </span>
              <span>{showCalculationDetails ? "▲ إغلاق" : "▼ تفاصيل الفورمولا"}</span>
            </button>

            {showCalculationDetails && (
              <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3 text-xs text-ink-secondary">
                <div className="space-y-1.5 border-b border-slate-200 pb-3">
                  <p className="font-bold text-ink">معادلة احتساب التوريدات الخاضعة الصافية:</p>
                  <p className="font-mono bg-white p-2 rounded-lg border border-slate-200 text-ink">
                    إجمالي التوريدات السابقة ({formatSAR(evalResult.grossPrev)} ر.س)
                    <br />
                    − التوريدات المعفاة ({formatSAR(evalResult.exempt)} ر.س)
                    <br />
                    − خارج نطاق الضريبة ({formatSAR(evalResult.outOfScope)} ر.س)
                    <br />
                    − مبيعات الأصول الرأسمالية ({formatSAR(evalResult.capital)} ر.س)
                    <br />
                    = <strong>التوريدات المحتسبة للتسجيل: {formatSAR(evalResult.taxablePreviousSupplies)} ر.س</strong>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="font-bold text-ink">المقارنة مع الحدود النظامية الصادرة من ZATCA:</p>
                  <ul className="space-y-1 list-disc list-inside text-[11px]">
                    <li>
                      <strong>حد التسجيل الإلزامي:</strong> 375,000 ريال سعودي. المقارنة مع المحتسب:{" "}
                      {evalResult.taxablePreviousSupplies > VAT_MANDATORY_THRESHOLD ||
                      evalResult.expectedTaxableSupplies > VAT_MANDATORY_THRESHOLD
                        ? "تم تجاوز الحد الإلزامي."
                        : "دون الحد الإلزامي."}
                    </li>
                    <li>
                      <strong>حد التسجيل الاختياري:</strong> 187,500 ريال سعودي. المقارنة مع المحتسب:{" "}
                      {evalResult.primaryTriggerValue > VAT_VOLUNTARY_THRESHOLD
                        ? "تم تجاوز الحد الاختياري، والمنشأة مؤهلة للتسجيل."
                        : "دون الحد الاختياري حالياً."}
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Official ZATCA Link & Source Attribution */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏛️</span>
              <div>
                <p className="text-xs font-bold text-blue-950">
                  المصدر الرسمي: هيئة الزكاة والضريبة والجمارك (ZATCA)
                </p>
                <p className="text-[11px] text-blue-800">
                  بوابة الخدمات الإلكترونية — تسجيل ضريبة القيمة المضافة وإصدار الشهادة الضريبية
                </p>
              </div>
            </div>
            <a
              href={ZATCA_OFFICIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-xl bg-blue-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-800 transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>بوابة ZATCA الإلكترونية</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>

          {/* Legal Disclaimer */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-900 leading-relaxed">
            ⚖️ <strong>إخلاء مسؤولية رسمي:</strong> هذه الأداة تقديرية وتعتمد على البيانات التي يدخلها المستخدم، ولا تمثل قراراً رسمياً من هيئة الزكاة والضريبة والجمارك (ZATCA). قد تختلف متطلبات التسجيل بحسب طبيعة النشاط وحالة المكلف والتوريدات والاستثناءات النظامية. يرجى الرجوع إلى هيئة الزكاة والضريبة والجمارك عند الحاجة إلى تحديد رسمي للالتزام بالتسجيل.
          </div>

          {/* Action Buttons */}
          <div className="border-t border-brand-border pt-4 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => {
                const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
                window.open(url, "_blank");
                if (typeof window !== "undefined" && typeof window.trackEvent === "function") {
                  window.trackEvent("share_clicked", { tool: "vat-registration-checker", method: "whatsapp" });
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all"
            >
              <span>📲</span>
              <span>مشاركة النتيجة عبر واتساب</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(shareText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                  if (typeof window !== "undefined" && typeof window.trackEvent === "function") {
                    window.trackEvent("share_clicked", { tool: "vat-registration-checker", method: "clipboard" });
                  }
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-3.5 py-2 text-xs font-bold text-ink hover:bg-brand-surface shadow-sm transition-all"
            >
              <span>{copied ? "✓" : "📋"}</span>
              <span>{copied ? "تم نسخ النتيجة!" : "نسخ الملخص"}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-ink-muted hover:bg-slate-100 transition-all mr-auto"
            >
              <span>🔄</span>
              <span>إعادة تعيين</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
