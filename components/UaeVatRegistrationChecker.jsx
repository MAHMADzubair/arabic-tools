"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  UAE_VAT_MANDATORY_THRESHOLD,
  UAE_VAT_VOLUNTARY_THRESHOLD,
  REGISTRATION_STATUS,
  FTA_OFFICIAL_URL,
  FTA_REGISTRATION_URL,
  evaluateUaeVatEligibility,
  formatAED,
} from "@/lib/uaeVatRegistrationConfig";

// ─── Small reusable AED input ──────────────────────────────────────────────────
function AedInput({ label, hint, value, onChange, id }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-ink-secondary mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none"
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">
          د.إ
        </span>
      </div>
      {hint && <p className="mt-1 text-[11px] text-ink-muted leading-relaxed">{hint}</p>}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function UaeVatRegistrationChecker() {
  // Step 1: Residency
  const [isResident, setIsResident] = useState(true);
  // Non-resident follow-up
  const [makesUaeTaxableSupplies, setMakesUaeTaxableSupplies] = useState(false);
  const [otherPartyLiable, setOtherPartyLiable] = useState(null); // true | false | null

  // Step 2: Supplies/imports inputs
  const [prev12MonthSupplies, setPrev12MonthSupplies] = useState("0");
  const [next30DaysSupplies, setNext30DaysSupplies]   = useState("0");

  // Step 3: Taxable expenses (voluntary only)
  const [prev12MonthExpenses, setPrev12MonthExpenses] = useState("0");
  const [next30DaysExpenses, setNext30DaysExpenses]   = useState("0");
  const [showExpenseInputs, setShowExpenseInputs]     = useState(false);

  // UI state
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);
  const [showExplanations, setShowExplanations]             = useState(false);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setIsResident(true);
    setMakesUaeTaxableSupplies(false);
    setOtherPartyLiable(null);
    setPrev12MonthSupplies("0");
    setNext30DaysSupplies("0");
    setPrev12MonthExpenses("0");
    setNext30DaysExpenses("0");
    setShowExpenseInputs(false);
    setShowCalculationDetails(false);
  };

  // ── Preset loader ──────────────────────────────────────────────────────────
  const loadPreset = (preset) => {
    setIsResident(preset.isResident ?? true);
    setMakesUaeTaxableSupplies(preset.makesUaeTaxableSupplies ?? false);
    setOtherPartyLiable(
      preset.otherPartyLiable === "no"   ? false :
      preset.otherPartyLiable === "yes"  ? true  : null
    );
    setPrev12MonthSupplies(preset.prev12MonthSupplies ?? "0");
    setNext30DaysSupplies(preset.next30DaysSupplies ?? "0");
    setPrev12MonthExpenses(preset.prev12MonthExpenses ?? "0");
    setNext30DaysExpenses(preset.next30DaysExpenses ?? "0");
    if ((parseFloat(preset.prev12MonthExpenses) || 0) > 0 ||
        (parseFloat(preset.next30DaysExpenses)  || 0) > 0) {
      setShowExpenseInputs(true);
    }
  };

  // ── Decision engine ────────────────────────────────────────────────────────
  const result = useMemo(() => evaluateUaeVatEligibility({
    isResident,
    makesUaeTaxableSupplies,
    otherPartyLiable,
    prev12MonthSupplies,
    next30DaysSupplies,
    prev12MonthExpenses,
    next30DaysExpenses,
  }), [isResident, makesUaeTaxableSupplies, otherPartyLiable,
       prev12MonthSupplies, next30DaysSupplies,
       prev12MonthExpenses, next30DaysExpenses]);

  // ── Analytics ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.trackEvent === "function") {
      window.trackEvent("calculator_used", {
        tool: "uae-vat-registration-checker",
        status: result.status,
        is_resident: isResident,
      });
    }
  }, [result.status, isResident]);

  // ── Result colour helpers ──────────────────────────────────────────────────
  const resultGradient =
    result.status === REGISTRATION_STATUS.MANDATORY
      ? "bg-gradient-to-r from-rose-700 to-rose-600"
      : result.status === REGISTRATION_STATUS.VOLUNTARY
      ? "bg-gradient-to-r from-amber-600 to-amber-500"
      : result.status === REGISTRATION_STATUS.NON_RESIDENT_SPECIAL
      ? "bg-gradient-to-r from-purple-800 to-indigo-700"
      : "bg-gradient-to-r from-emerald-700 to-teal-600";

  const resultEmoji =
    result.status === REGISTRATION_STATUS.MANDATORY         ? "🚨"
    : result.status === REGISTRATION_STATUS.VOLUNTARY       ? "⭐"
    : result.status === REGISTRATION_STATUS.NON_RESIDENT_SPECIAL ? "🌐"
    : "✅";

  return (
    <div className="space-y-6">

      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-hero-gradient p-6 text-white shadow-result">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏢</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black leading-tight">
                حاسبة أهلية التسجيل في ضريبة القيمة المضافة في الإمارات
              </h1>
              <p className="mt-1 text-sm text-white/85">
                فحص فوري للالتزام بحد التسجيل الإلزامي (375,000 د.إ) والاختياري (187,500 د.إ) وفق معايير الهيئة الاتحادية للضرائب
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-white/20 border border-white/30 px-3 py-1 text-xs font-bold whitespace-nowrap">
            محدث 2026 — FTA
          </span>
        </div>
      </div>

      {/* ── Quick Presets ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <span>💡</span>
          <span className="text-xs font-extrabold text-ink">نماذج سريعة للتجربة:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "توريدات 420 ألف (إلزامي)", color: "rose",    data: { isResident: true, prev12MonthSupplies: "420000", next30DaysSupplies: "0", prev12MonthExpenses: "0", next30DaysExpenses: "0" } },
            { label: "توريدات 250 ألف (اختياري)", color: "amber",  data: { isResident: true, prev12MonthSupplies: "250000", next30DaysSupplies: "0", prev12MonthExpenses: "0", next30DaysExpenses: "0" } },
            { label: "مصروفات 210 ألف (اختياري)", color: "amber",  data: { isResident: true, prev12MonthSupplies: "150000", next30DaysSupplies: "0", prev12MonthExpenses: "210000", next30DaysExpenses: "0" } },
            { label: "توريدات 100 ألف (دون الحد)", color: "emerald",data: { isResident: true, prev12MonthSupplies: "100000", next30DaysSupplies: "0", prev12MonthExpenses: "0", next30DaysExpenses: "0" } },
            { label: "متوقع 400 ألف / 30 يوماً",  color: "rose",   data: { isResident: true, prev12MonthSupplies: "0", next30DaysSupplies: "400000", prev12MonthExpenses: "0", next30DaysExpenses: "0" } },
            { label: "غير مقيم (حالة خاصة)",       color: "purple", data: { isResident: false, makesUaeTaxableSupplies: true, otherPartyLiable: "no", prev12MonthSupplies: "0", next30DaysSupplies: "0", prev12MonthExpenses: "0", next30DaysExpenses: "0" } },
          ].map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => loadPreset(p.data)}
              className={
                p.color === "rose"    ? "rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-800 hover:bg-rose-100 transition-all"
                : p.color === "amber"   ? "rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition-all"
                : p.color === "emerald" ? "rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-all"
                : "rounded-lg bg-purple-50 border border-purple-200 px-2.5 py-1 text-[11px] font-bold text-purple-800 hover:bg-purple-100 transition-all"
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── STEP 1: Residency ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">١</span>
          <span className="text-lg">🇦🇪</span>
          <h2 className="text-sm sm:text-base font-extrabold text-ink">الإقامة والنشاط في الإمارات</h2>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-secondary mb-2">
            هل المنشأة مقيمة في دولة الإمارات العربية المتحدة؟
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {[{ label: "نعم (مقيمة في الإمارات)", val: true }, { label: "لا (غير مقيمة)", val: false }].map(({ label, val }) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => { setIsResident(val); if (val) { setMakesUaeTaxableSupplies(false); setOtherPartyLiable(null); } }}
                className={`rounded-xl border p-3 text-center text-xs font-extrabold transition-all ${
                  isResident === val
                    ? "border-brand bg-brand-light text-brand-dark shadow-sm"
                    : "border-brand-border bg-white text-ink-secondary hover:border-brand"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Non-resident follow-up */}
        {!isResident && (
          <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-4 space-y-4">
            <div className="flex items-start gap-2">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-xs font-extrabold text-purple-900">
                  ضوابط تسجيل غير المقيمين — الهيئة الاتحادية للضرائب (FTA)
                </p>
                <p className="text-[11px] text-purple-800 mt-0.5 leading-relaxed">
                  لا ينطبق حد الـ 375,000 درهم تلقائياً على غير المقيمين. يتوقف الالتزام على طبيعة التوريدات ووجود طرف آخر مسؤول.
                </p>
              </div>
            </div>

            {/* Q1: taxable supplies in UAE? */}
            <div>
              <label className="block text-xs font-bold text-purple-950 mb-2">
                هل تقوم بتوريدات خاضعة للضريبة داخل دولة الإمارات؟
              </label>
              <div className="grid grid-cols-2 gap-2 max-w-sm">
                {[{ label: "نعم", val: true }, { label: "لا", val: false }].map(({ label, val }) => (
                  <button key={String(val)} type="button"
                    onClick={() => { setMakesUaeTaxableSupplies(val); if (!val) setOtherPartyLiable(null); }}
                    className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                      makesUaeTaxableSupplies === val
                        ? "border-purple-600 bg-purple-200/80 text-purple-950 shadow-sm"
                        : "border-purple-200 bg-white text-purple-900 hover:bg-purple-100/50"
                    }`}
                  >{label}</button>
                ))}
              </div>
            </div>

            {/* Q2: another UAE party liable? */}
            {makesUaeTaxableSupplies && (
              <div>
                <label className="block text-xs font-bold text-purple-950 mb-2">
                  هل يوجد طرف آخر في الإمارات مسؤول عن احتساب وسداد الضريبة على هذه التوريدات؟
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "نعم", val: true },
                    { label: "لا", val: false },
                    { label: "غير متأكد", val: null },
                  ].map(({ label, val }) => (
                    <button key={label} type="button"
                      onClick={() => setOtherPartyLiable(val)}
                      className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                        otherPartyLiable === val
                          ? "border-purple-600 bg-purple-200/80 text-purple-950 shadow-sm"
                          : "border-purple-200 bg-white text-purple-900 hover:bg-purple-100/50"
                      }`}
                    >{label}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── STEP 2: Taxable supplies / imports ───────────────────────────────── */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">٢</span>
          <span className="text-lg">📊</span>
          <h2 className="text-sm sm:text-base font-extrabold text-ink">
            التوريدات الخاضعة للضريبة والواردات
          </h2>
        </div>

        <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-sky-900 leading-relaxed">
          <strong>ملاحظة:</strong> أدخل إجمالي التوريدات الخاضعة للضريبة (بنسبة 5% أو 0%) وكذلك الواردات الخاضعة للضريبة.
          لا تُدرج التوريدات المعفاة (كإيجار العقارات السكنية أو الخدمات المالية المعفاة).
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AedInput
            id="prev12S"
            label="التوريدات الخاضعة والواردات — آخر 12 شهراً *"
            hint="إجمالي المبيعات الخاضعة للضريبة (5% وصفرية) والواردات خلال الـ 12 شهراً الماضية."
            value={prev12MonthSupplies}
            onChange={setPrev12MonthSupplies}
          />
          <AedInput
            id="next30S"
            label="التوريدات الخاضعة والواردات المتوقعة — الـ 30 يوماً القادمة *"
            hint="القيمة المتوقعة بناءً على عقود مؤكدة أو توقعات موثقة خلال الـ 30 يوماً القادمة."
            value={next30DaysSupplies}
            onChange={setNext30DaysSupplies}
          />
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 space-y-1">
          <p className="text-[11px] font-bold text-amber-900">الفرق بين التوريدات الخاضعة والمعفاة:</p>
          <ul className="text-[11px] text-amber-800 space-y-0.5 list-disc list-inside leading-relaxed">
            <li><strong>الخاضعة بنسبة 5%:</strong> معظم السلع والخدمات التجارية — تُدرج هنا.</li>
            <li><strong>الخاضعة بنسبة 0%:</strong> الصادرات، الرعاية الصحية، التعليم، النقل الدولي — تُدرج هنا (هي خاضعة للضريبة بنسبة صفرية).</li>
            <li><strong>المعفاة:</strong> إيجار العقارات السكنية، خدمات مالية معينة — لا تُدرج هنا.</li>
          </ul>
        </div>
      </div>

      {/* ── STEP 3: Taxable expenses (voluntary) ─────────────────────────────── */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">٣</span>
            <span className="text-lg">🧾</span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-ink">
                المصروفات الخاضعة للضريبة
              </h2>
              <p className="text-[11px] text-ink-muted mt-0.5">
                اختياري — لتقييم التسجيل الاختياري بناءً على التكاليف
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowExpenseInputs(!showExpenseInputs)}
            className="text-[11px] font-bold text-brand hover:underline shrink-0"
          >
            {showExpenseInputs ? "إخفاء ▲" : "إدخال المصروفات ▼"}
          </button>
        </div>

        {!showExpenseInputs && (
          <p className="text-xs text-ink-muted">
            إذا كانت مبيعاتك أقل من 187,500 درهم لكن مصروفاتك الخاضعة تتجاوز هذا الحد، قد تكون مؤهلاً للتسجيل الاختياري.
          </p>
        )}

        {showExpenseInputs && (
          <div className="grid gap-4 sm:grid-cols-2">
            <AedInput
              id="prev12E"
              label="المصروفات الخاضعة — آخر 12 شهراً"
              hint="مشتريات ومصروفات تشغيلية خاضعة لضريبة 5% (إيجارات تجارية، مواد، خدمات مهنية...)."
              value={prev12MonthExpenses}
              onChange={setPrev12MonthExpenses}
            />
            <AedInput
              id="next30E"
              label="المصروفات الخاضعة المتوقعة — الـ 30 يوماً القادمة"
              hint="مشتريات وتكاليف تأسيس متوقعة خلال الـ 30 يوماً القادمة."
              value={next30DaysExpenses}
              onChange={setNext30DaysExpenses}
            />
          </div>
        )}
      </div>

      {/* ── Visual Threshold Indicator ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-extrabold text-ink flex items-center gap-1.5">
            <span>📈</span>
            <span>مؤشر حدود التسجيل في ضريبة القيمة المضافة — الإمارات:</span>
          </h3>
          <span className="text-[11px] font-bold text-brand-dark">
            أعلى قيمة: {formatAED(result.primaryTriggerValue || 0)} د.إ
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="relative h-6 w-full rounded-xl bg-slate-100 overflow-hidden border border-slate-300">
            <div className="absolute left-0 top-0 bottom-0 bg-emerald-100 border-l border-emerald-300" style={{ width: "50%" }} />
            <div className="absolute left-[50%] top-0 bottom-0 bg-amber-100 border-l border-amber-300" style={{ width: "50%" }} />
            <div
              className={`absolute top-0 bottom-0 transition-all duration-500 ${
                result.status === REGISTRATION_STATUS.MANDATORY        ? "bg-rose-500 shadow-md"
                : result.status === REGISTRATION_STATUS.VOLUNTARY      ? "bg-amber-500"
                : result.status === REGISTRATION_STATUS.NON_RESIDENT_SPECIAL ? "bg-purple-600"
                : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(3, ((result.primaryTriggerValue || 0) / UAE_VAT_MANDATORY_THRESHOLD) * 100))}%` }}
            />
            {/* Voluntary threshold marker */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-amber-600/70" style={{ left: "50%" }} />
          </div>
          <div className="flex justify-between text-[10px] sm:text-[11px] font-bold text-ink-muted px-1">
            <span>٠</span>
            <span className="text-amber-800 text-center">
              187,500 د.إ
              <span className="block text-[9px] font-normal">حد اختياري</span>
            </span>
            <span className="text-rose-800 text-left">
              375,000 د.إ
              <span className="block text-[9px] font-normal">حد إلزامي</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-center">
            <span className="font-extrabold text-emerald-800 block">دون 187,500 د.إ</span>
            <span className="text-emerald-700 text-[10px]">غير ملزم بالتسجيل حالياً</span>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-center">
            <span className="font-extrabold text-amber-800 block">187,500 — 375,000 د.إ</span>
            <span className="text-amber-700 text-[10px]">مؤهل للتسجيل الاختياري</span>
          </div>
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-center">
            <span className="font-extrabold text-rose-800 block">أكثر من 375,000 د.إ</span>
            <span className="text-rose-700 text-[10px]">تسجيل إلزامي مطلوب</span>
          </div>
        </div>
      </div>

      {/* ── PRIMARY RESULT CARD ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-brand bg-white shadow-xl overflow-hidden">
        {/* Result header */}
        <div className={`p-6 text-white ${resultGradient}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="text-4xl sm:text-5xl">{resultEmoji}</span>
              <div>
                <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold mb-1">
                  {result.badgeAr}
                </span>
                <h2 className="text-xl sm:text-2xl font-black">{result.titleAr}</h2>
                <p className="text-xs sm:text-sm text-white/90 mt-1 leading-relaxed">
                  {result.primaryReason}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="p-6 space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-brand-border bg-slate-50/70 p-3.5">
              <p className="text-[11px] font-bold text-ink-muted">حد التسجيل الإلزامي</p>
              <p className="text-base font-black text-rose-700 mt-0.5">375,000.00 د.إ</p>
              <p className="text-[10px] text-ink-muted">المادة 17 من قانون VAT الاتحادي</p>
            </div>
            <div className="rounded-xl border border-brand-border bg-slate-50/70 p-3.5">
              <p className="text-[11px] font-bold text-ink-muted">حد التسجيل الاختياري</p>
              <p className="text-base font-black text-amber-700 mt-0.5">187,500.00 د.إ</p>
              <p className="text-[10px] text-ink-muted">50% من حد الإلزام</p>
            </div>
            <div className="rounded-xl border-2 border-brand bg-brand-surface p-3.5">
              <p className="text-[11px] font-extrabold text-brand-dark">أعلى قيمة محتسبة</p>
              <p className="text-base font-black text-brand-dark mt-0.5">
                {formatAED(result.primaryTriggerValue || 0)} د.إ
              </p>
              <p className="text-[10px] text-ink-muted">
                {result.status === REGISTRATION_STATUS.MANDATORY
                  ? `فوق الإلزامي بـ: +${formatAED(result.difference)} د.إ`
                  : result.status === REGISTRATION_STATUS.VOLUNTARY
                  ? `المتبقي للإلزامي: ${formatAED(result.distanceToMandatory || 0)} د.إ`
                  : result.status === REGISTRATION_STATUS.BELOW_THRESHOLD
                  ? `المتبقي للاختياري: ${formatAED(result.difference || 0)} د.إ`
                  : "انظر التفاصيل أدناه"}
              </p>
            </div>
          </div>

          {/* Mandatory: which trigger fired */}
          {result.status === REGISTRATION_STATUS.MANDATORY && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className={`rounded-xl border p-3.5 ${result.prevExceedsMandatory ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
                <p className="text-[11px] font-bold text-ink-muted mb-1">التوريدات — آخر 12 شهراً</p>
                <p className={`text-base font-black ${result.prevExceedsMandatory ? "text-rose-700" : "text-ink-secondary"}`}>
                  {formatAED(result.prev12S)} د.إ
                </p>
                <p className={`text-[10px] mt-0.5 font-bold ${result.prevExceedsMandatory ? "text-rose-600" : "text-ink-muted"}`}>
                  {result.prevExceedsMandatory ? "✓ تجاوز الحد الإلزامي" : "لم يتجاوز الحد الإلزامي"}
                </p>
              </div>
              <div className={`rounded-xl border p-3.5 ${result.next30ExceedsMandatory ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
                <p className="text-[11px] font-bold text-ink-muted mb-1">التوريدات المتوقعة — الـ 30 يوماً القادمة</p>
                <p className={`text-base font-black ${result.next30ExceedsMandatory ? "text-rose-700" : "text-ink-secondary"}`}>
                  {formatAED(result.next30S)} د.إ
                </p>
                <p className={`text-[10px] mt-0.5 font-bold ${result.next30ExceedsMandatory ? "text-rose-600" : "text-ink-muted"}`}>
                  {result.next30ExceedsMandatory ? "✓ تجاوز الحد الإلزامي" : "لم يتجاوز الحد الإلزامي"}
                </p>
              </div>
            </div>
          )}

          {/* Voluntary: qualifying triggers */}
          {result.status === REGISTRATION_STATUS.VOLUNTARY && result.qualifyingTriggers?.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="text-xs font-extrabold text-amber-900 mb-2">القيم التي أهّلتك للتسجيل الاختياري:</p>
              <ul className="space-y-1">
                {result.qualifyingTriggers.map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-amber-800">
                    <span className="text-amber-600 font-black">⭐</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Non-resident special */}
          {result.status === REGISTRATION_STATUS.NON_RESIDENT_SPECIAL && (
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 space-y-2">
              <p className="text-xs font-extrabold text-purple-900">🌐 ملاحظة هامة لغير المقيمين:</p>
              <p className="text-xs text-purple-800 leading-relaxed">
                يُلزم قانون ضريبة القيمة المضافة الإماراتي (المرسوم بقانون رقم 8 لسنة 2017) الشخص غير المقيم الذي يُقدّم توريدات خاضعة في الإمارات بالتسجيل لدى الهيئة الاتحادية للضرائب (FTA) بصرف النظر عن قيمة هذه التوريدات، إذا لم يكن هناك طرف آخر مسجل مسؤول عن احتساب الضريبة.
              </p>
            </div>
          )}

          {/* Detailed explanation */}
          <div className="rounded-xl border border-brand-border/80 bg-slate-50 p-4 space-y-2">
            <h4 className="text-xs font-extrabold text-ink flex items-center gap-1.5">
              <span>📋</span><span>التوجيه والإجراء المطلوب:</span>
            </h4>
            <p className="text-xs text-ink-secondary leading-relaxed">{result.detailedExplanation}</p>
            {result.status === REGISTRATION_STATUS.MANDATORY && (
              <p className="text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 p-2.5 rounded-lg leading-relaxed">
                ⚠️ تنبيه: عدم التسجيل في الموعد المحدد يُعرّض المنشأة لغرامات مالية بموجب قانون ضريبة القيمة المضافة (تصل إلى 20,000 درهم على التأخر في التسجيل وفق لوائح FTA).
              </p>
            )}
            {result.status === REGISTRATION_STATUS.VOLUNTARY && (
              <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg leading-relaxed">
                💡 فائدة التسجيل الاختياري: استرداد ضريبة المدخلات (5%) على مشترياتك وتكاليفك التشغيلية، وتعزيز المصداقية التجارية مع عملاء B2B.
              </p>
            )}
          </div>

          {/* Zero-rated only exception note */}
          {(result.status === REGISTRATION_STATUS.MANDATORY || result.status === REGISTRATION_STATUS.VOLUNTARY) && (
            <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
              <p className="text-xs font-extrabold text-sky-900 mb-1">📌 استثناء للمنشآت ذات التوريدات الصفرية فقط:</p>
              <p className="text-xs text-sky-800 leading-relaxed">
                إذا كانت جميع توريداتك خاضعة بنسبة 0% (صفرية) دون أي توريدات بنسبة 5%، قد تكون مؤهلاً لطلب استثناء من التسجيل إذا توفرت الشروط النظامية.
                يُرجى مراجعة متطلبات الهيئة الاتحادية للضرائب للتأكد من الأهلية.
              </p>
            </div>
          )}

          {/* How was this calculated? */}
          <div className="border-t border-brand-border/60 pt-3">
            <button
              type="button"
              onClick={() => setShowCalculationDetails(!showCalculationDetails)}
              className="w-full flex items-center justify-between text-xs font-extrabold text-brand hover:text-brand-dark py-1"
            >
              <span className="flex items-center gap-1.5">
                <span>🔍</span><span>كيف تم تحديد النتيجة؟</span>
              </span>
              <span>{showCalculationDetails ? "▲ إغلاق" : "▼ عرض التفاصيل"}</span>
            </button>

            {showCalculationDetails && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3 text-xs">
                <p className="font-extrabold text-ink">مقارنة القيم المدخلة بالحدود المعتمدة:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300">
                        <th className="text-right py-1.5 px-2 font-extrabold text-ink">المعيار</th>
                        <th className="text-right py-1.5 px-2 font-extrabold text-ink">القيمة المدخلة</th>
                        <th className="text-right py-1.5 px-2 font-extrabold text-rose-800">الحد الإلزامي</th>
                        <th className="text-right py-1.5 px-2 font-extrabold text-amber-800">الحد الاختياري</th>
                        <th className="text-right py-1.5 px-2 font-extrabold text-ink">الحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[
                        { label: "التوريدات — آخر 12 شهراً", val: result.prev12S },
                        { label: "التوريدات المتوقعة — 30 يوماً", val: result.next30S },
                        { label: "المصروفات الخاضعة — آخر 12 شهراً", val: result.prev12E },
                        { label: "المصروفات المتوقعة — 30 يوماً", val: result.next30E },
                      ].map(({ label, val }) => (
                        <tr key={label} className="hover:bg-white/70">
                          <td className="py-1.5 px-2 text-ink-secondary">{label}</td>
                          <td className="py-1.5 px-2 font-bold text-ink">{formatAED(val)} د.إ</td>
                          <td className={`py-1.5 px-2 font-bold ${val > UAE_VAT_MANDATORY_THRESHOLD ? "text-rose-700" : "text-ink-muted"}`}>
                            {val > UAE_VAT_MANDATORY_THRESHOLD ? "✓ تجاوز" : "لم يتجاوز"}
                          </td>
                          <td className={`py-1.5 px-2 font-bold ${val > UAE_VAT_VOLUNTARY_THRESHOLD ? "text-amber-700" : "text-ink-muted"}`}>
                            {val > UAE_VAT_VOLUNTARY_THRESHOLD ? "✓ تجاوز" : "لم يتجاوز"}
                          </td>
                          <td className="py-1.5 px-2">
                            {val > UAE_VAT_MANDATORY_THRESHOLD
                              ? <span className="text-rose-700 font-extrabold">إلزامي</span>
                              : val > UAE_VAT_VOLUNTARY_THRESHOLD
                              ? <span className="text-amber-700 font-bold">اختياري</span>
                              : <span className="text-emerald-700">دون الحد</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-ink-muted">
                  المنهجية: يُطبق اختبار أي من القيم الأربع — التسجيل الإلزامي يتحقق إذا تجاوزت التوريدات/الواردات 375,000 درهم في أي من الفترتين، والتسجيل الاختياري إذا تجاوزت التوريدات أو المصروفات 187,500 درهم.
                </p>
              </div>
            )}
          </div>

          {/* Reset */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-brand-border px-4 py-2 text-xs font-bold text-ink-secondary hover:border-brand hover:text-brand transition-all"
            >
              ↺ إعادة تعيين
            </button>
          </div>
        </div>
      </div>

      {/* ── Disclaimer ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
        <h3 className="text-xs font-extrabold text-ink flex items-center gap-2">
          <span>⚖️</span><span>إخلاء المسؤولية وملاحظة قانونية</span>
        </h3>
        <p className="text-[11px] text-ink-secondary leading-relaxed">
          هذه الحاسبة تقديرية وتعتمد على البيانات التي يدخلها المستخدم، ولا تمثل قراراً رسمياً من
          الهيئة الاتحادية للضرائب. قد تختلف متطلبات التسجيل بحسب حالة الشخص، نوع التوريدات،
          مكان الإقامة، وطبيعة النشاط.
        </p>
        <p className="text-[11px] text-ink-secondary leading-relaxed">
          يرجى الرجوع إلى{" "}
          <a href={FTA_OFFICIAL_URL} target="_blank" rel="noopener noreferrer" className="text-brand underline font-bold">
            الهيئة الاتحادية للضرائب — tax.gov.ae
          </a>{" "}
          أو منصة{" "}
          <a href="https://www.emaratax.ae" target="_blank" rel="noopener noreferrer" className="text-brand underline font-bold">
            EmaraTax
          </a>{" "}
          عند الحاجة إلى تحديد رسمي.
        </p>
      </div>

      {/* ── Explanations accordion ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
        <button
          type="button"
          onClick={() => setShowExplanations(!showExplanations)}
          className="w-full flex items-center justify-between text-sm font-extrabold text-ink"
        >
          <span className="flex items-center gap-2"><span>📚</span><span>مصطلحات ومفاهيم ضريبية مهمة</span></span>
          <span className="text-brand text-xs">{showExplanations ? "▲ إغلاق" : "▼ عرض"}</span>
        </button>

        {showExplanations && (
          <div className="pt-2 space-y-4">
            {[
              {
                q: "ما المقصود بالتوريدات الخاضعة للضريبة؟",
                a: "هي كل توريد للسلع أو الخدمات تجري في الإمارات مقابل مبالغ مالية ضمن إطار النشاط الاقتصادي، وتشمل التوريدات بنسبة 5% وكذلك التوريدات بنسبة صفرية (0%). لا تشمل التوريدات المعفاة.",
              },
              {
                q: "الفرق بين التوريدات بنسبة 5% والتوريدات بنسبة 0%",
                a: "كلاهما 'خاضع للضريبة' ويُحتسب في حدود التسجيل. الفرق: التوريدات بنسبة 5% تُلزمك بتحصيل الضريبة من العميل، بينما التوريدات الصفرية (كالصادرات والرعاية الصحية والتعليم) تُعفيك من التحصيل لكن تبقيك مؤهلاً لاسترداد ضريبة المدخلات.",
              },
              {
                q: "ما الفرق بين التوريدات المعفاة والتوريدات الصفرية؟",
                a: "التوريدات المعفاة (كإيجار العقارات السكنية وبعض الخدمات المالية) لا تُحتسب ضمن حدود التسجيل ولا يحق المطالبة باسترداد ضريبة مدخلاتها. أما التوريدات الصفرية فهي خاضعة للضريبة بنسبة 0% وتُحتسب في الحدود ويحق استرداد ضريبة مدخلاتها.",
              },
              {
                q: "متى تدخل المصروفات في حساب التسجيل الاختياري؟",
                a: "إذا لم تتجاوز مبيعاتك 187,500 درهم لكن مصروفاتك الخاضعة (كمشتريات المواد والإيجارات التجارية والخدمات المهنية) تجاوزت هذا الحد خلال الـ 12 شهراً الماضية أو يُتوقع أن تتجاوزه خلال الـ 30 يوماً القادمة، تصبح مؤهلاً للتسجيل الاختياري.",
              },
              {
                q: "لماذا تختلف حالة غير المقيم عن المقيم؟",
                a: "المقيم في الإمارات يخضع لحد التسجيل (375,000 درهم). أما غير المقيم الذي يُقدّم توريدات خاضعة داخل الإمارات فيلتزم بالتسجيل فور بدء هذه التوريدات بغض النظر عن قيمتها، إلا إذا كان المشتري المسجل في الإمارات هو المسؤول عن احتساب الضريبة (آلية الاحتساب العكسي).",
              },
            ].map((item, i) => (
              <div key={i} className="border-b border-brand-border/60 pb-4 last:border-b-0 last:pb-0">
                <p className="text-xs font-extrabold text-ink mb-1">❓ {item.q}</p>
                <p className="text-xs text-ink-secondary leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Cross-link: UAE VAT Calculator ───────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-purple-300/60 bg-gradient-to-l from-purple-50 to-indigo-50 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧾</span>
          <div>
            <h3 className="text-sm font-extrabold text-purple-950">
              احسب قيمة ضريبة القيمة المضافة 5% على فواتيرك
            </h3>
            <p className="text-xs text-purple-800 mt-0.5">
              بعد التسجيل، احسب الضريبة المضافة أو استخرج السعر الأصلي بدقة.
            </p>
          </div>
        </div>
        <Link
          href="/vat-calculator/uae"
          className="shrink-0 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-black px-4 py-2.5 transition shadow"
        >
          حاسبة ضريبة القيمة المضافة 5% ←
        </Link>
      </div>

      {/* ── Official source ───────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-ink-secondary">
          <span>🏛️</span>
          <span>
            المصدر: <strong className="text-ink">الهيئة الاتحادية للضرائب — دولة الإمارات العربية المتحدة</strong>
          </span>
        </div>
        <div className="flex gap-3 text-[11px]">
          <a href={FTA_OFFICIAL_URL} target="_blank" rel="noopener noreferrer" className="text-brand underline hover:text-brand-dark font-bold">
            tax.gov.ae — التسجيل في VAT ↗
          </a>
          <a href="https://www.emaratax.ae" target="_blank" rel="noopener noreferrer" className="text-brand underline hover:text-brand-dark font-bold">
            EmaraTax ↗
          </a>
        </div>
      </div>
    </div>
  );
}
