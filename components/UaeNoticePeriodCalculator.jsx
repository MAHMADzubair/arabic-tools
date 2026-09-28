"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function toNum(v) {
  const n = parseFloat(String(v).replace(/,/g, ""));
  return isNaN(n) || n < 0 ? 0 : n;
}

function fmt(n) {
  return Number(n || 0).toLocaleString("ar-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDateAr(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ar-AE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Add calendar days to a date string (YYYY-MM-DD) */
function addDays(dateStr, days) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/** Calculate calendar day difference between two dates inclusive or exclusive */
function getDaysDiff(startStr, endStr) {
  if (!startStr || !endStr) return 0;
  const s = new Date(startStr);
  const e = new Date(endStr);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
  const diffMs = e.getTime() - s.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export default function UaeNoticePeriodCalculator() {
  // ── Scope & Jurisdiction ─────────────────────────────────────────────────────
  const [sectorType, setSectorType] = useState("private_mohre"); // "private_mohre" | "difc_adgm" | "other"
  const [isProbation, setIsProbation] = useState("no"); // "no" | "yes"

  // ── Core Inputs ──────────────────────────────────────────────────────────────
  const [initiator, setInitiator] = useState("employee"); // "employee" | "employer"
  const [noticeStartDate, setNoticeStartDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [contractNoticePreset, setContractNoticePreset] = useState("30"); // "30" | "45" | "60" | "90" | "custom"
  const [customNoticeDays, setCustomNoticeDays] = useState("30");

  // ── Served Notice Inputs ─────────────────────────────────────────────────────
  const [servedInputMode, setServedInputMode] = useState("days"); // "days" | "date"
  const [servedDaysInput, setServedDaysInput] = useState("30");
  const [actualLastWorkingDate, setActualLastWorkingDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 29);
    return today.toISOString().split("T")[0];
  });

  // ── Salary Inputs ────────────────────────────────────────────────────────────
  const [lastWage, setLastWage] = useState("9000");

  // ── Special Conditions ───────────────────────────────────────────────────────
  const [isMutualWaiver, setIsMutualWaiver] = useState(false);

  // ── UI States ────────────────────────────────────────────────────────────────
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [employerName, setEmployerName] = useState("");

  // ── Resolved Contract Notice Days ────────────────────────────────────────────
  const requiredNoticeDays = useMemo(() => {
    if (contractNoticePreset === "custom") {
      return toNum(customNoticeDays);
    }
    return toNum(contractNoticePreset);
  }, [contractNoticePreset, customNoticeDays]);

  // Notice Period 30-90 Validation
  const noticeValidation = useMemo(() => {
    if (requiredNoticeDays < 30) {
      return {
        status: "warning",
        msg: "المادة (43) تنص على ألا تقل مدة الإنذار عن 30 يوماً. أي مدة أقل قد تُعتبر مخالفة لقانون العمل الإماراتي ما لم تكن لمصلحة العامل بنص صريح.",
      };
    }
    if (requiredNoticeDays > 90) {
      return {
        status: "warning",
        msg: "المادة (43) تنص على ألا تزيد مدة الإنذار عن 90 يوماً. وضع مدة أطول قد يتعارض مع الحد الأقصى المقرر قانوناً.",
      };
    }
    return { status: "valid", msg: "" };
  }, [requiredNoticeDays]);

  // Expected Last Working Date Calculation
  // Convention: Notice starts on noticeStartDate (Day 1). Last day = noticeStartDate + (requiredNoticeDays - 1)
  const expectedLastWorkingDate = useMemo(() => {
    if (!noticeStartDate || requiredNoticeDays <= 0) return "";
    return addDays(noticeStartDate, Math.max(0, requiredNoticeDays - 1));
  }, [noticeStartDate, requiredNoticeDays]);

  // Auto-sync when noticeStartDate changes and mode is 'date'
  const handleStartDateChange = (newDate) => {
    setNoticeStartDate(newDate);
    if (servedInputMode === "date" && newDate && requiredNoticeDays > 0) {
      setActualLastWorkingDate(addDays(newDate, Math.max(0, requiredNoticeDays - 1)));
    }
  };

  // Resolved Served Days
  const servedNoticeDays = useMemo(() => {
    if (servedInputMode === "days") {
      return toNum(servedDaysInput);
    } else {
      if (!noticeStartDate || !actualLastWorkingDate) return 0;
      const diff = getDaysDiff(noticeStartDate, actualLastWorkingDate);
      if (diff < 0) return 0; // last date is before notice start
      return diff + 1; // inclusive counting (day of notice to last working day)
    }
  }, [servedInputMode, servedDaysInput, noticeStartDate, actualLastWorkingDate]);

  // Date validity check for actual last date
  const isActualDateInvalid = useMemo(() => {
    if (servedInputMode !== "date") return false;
    if (!noticeStartDate || !actualLastWorkingDate) return false;
    return new Date(actualLastWorkingDate) < new Date(noticeStartDate);
  }, [servedInputMode, noticeStartDate, actualLastWorkingDate]);

  // Unserved / Remaining Notice Days
  const remainingNoticeDays = useMemo(() => {
    if (isMutualWaiver) return 0;
    return Math.max(0, requiredNoticeDays - servedNoticeDays);
  }, [requiredNoticeDays, servedNoticeDays, isMutualWaiver]);

  // Wage Math
  const wage = toNum(lastWage);
  const dailyWage = wage / 30; // standard UAE MOHRE daily wage convention
  const estimatedCompensation = remainingNoticeDays * dailyWage;

  // Compensation Direction
  const compensationDirection = useMemo(() => {
    if (remainingNoticeDays <= 0 || isMutualWaiver || wage <= 0) {
      return "none";
    }
    // If employer terminated and did not allow full notice -> owes employee (+)
    if (initiator === "employer") {
      return "to_employee";
    }
    // If employee resigned and left early without serving required notice -> owes employer (-)
    return "to_employer";
  }, [remainingNoticeDays, isMutualWaiver, wage, initiator]);

  // Timeline percentage calculation
  const timelineProgress = useMemo(() => {
    if (requiredNoticeDays <= 0) return 100;
    const pct = Math.min(100, Math.round((servedNoticeDays / requiredNoticeDays) * 100));
    return Math.max(0, pct);
  }, [servedNoticeDays, requiredNoticeDays]);

  // Presets from User Request Worked Examples
  const applyPreset = (presetNum) => {
    if (presetNum === 1) {
      // Example 1: Employee resignation, 60 days notice, 60 served, 9000 AED => 0 compensation
      setInitiator("employee");
      setContractNoticePreset("60");
      setServedInputMode("days");
      setServedDaysInput("60");
      setLastWage("9000");
      setIsMutualWaiver(false);
      setIsProbation("no");
      setSectorType("private_mohre");
    } else if (presetNum === 2) {
      // Example 2: Employee resignation, 60 days notice, 40 served, 9000 AED => 6000 AED payable to employer
      setInitiator("employee");
      setContractNoticePreset("60");
      setServedInputMode("days");
      setServedDaysInput("40");
      setLastWage("9000");
      setIsMutualWaiver(false);
      setIsProbation("no");
      setSectorType("private_mohre");
    } else if (presetNum === 3) {
      // Example 3: Employer termination, 30 days notice, 10 served, 12000 AED => 8000 AED payable to employee
      setInitiator("employer");
      setContractNoticePreset("30");
      setServedInputMode("days");
      setServedDaysInput("10");
      setLastWage("12000");
      setIsMutualWaiver(false);
      setIsProbation("no");
      setSectorType("private_mohre");
    }
  };

  const handleReset = () => {
    setSectorType("private_mohre");
    setIsProbation("no");
    setInitiator("employee");
    const today = new Date().toISOString().split("T")[0];
    setNoticeStartDate(today);
    setContractNoticePreset("30");
    setCustomNoticeDays("30");
    setServedInputMode("days");
    setServedDaysInput("30");
    setActualLastWorkingDate(addDays(today, 29));
    setLastWage("9000");
    setIsMutualWaiver(false);
    setEmployeeName("");
    setEmployerName("");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* ── Top Header / Badges ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-brand-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">⏳</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
              حاسبة فترة الإنذار في الإمارات 2026
            </h1>
          </div>
          <p className="text-sm text-ink-muted">
            احتساب آخر يوم عمل، الأيام غير المنفذة، وبدل الإنذار التعويضي وفق المادة (43) من قانون العمل الإماراتي رقم 33 لسنة 2021
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
            <span>🇦🇪</span> قانون 33 م 43
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            حساب فوري 100%
          </span>
        </div>
      </div>

      {/* ── Preset Examples Selector ── */}
      <div className="mb-6 rounded-xl border border-brand-border bg-slate-50 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold text-ink flex items-center gap-1.5">
            <span>💡</span> أمثلة عملية جاهزة (اضغط لتجربة فورية):
          </span>
          <button
            onClick={handleReset}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold underline transition"
          >
            إعادة تعيين الحقول
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => applyPreset(1)}
            className="rounded-lg border border-slate-200 bg-white p-2.5 text-right text-xs hover:border-brand hover:bg-brand-50 transition shadow-sm"
          >
            <div className="font-bold text-ink">مثال 1: استقالة وتنفيذ كامل</div>
            <div className="text-ink-muted text-[11px] mt-0.5">إنذار 60 يوماً / نُفذت كاملة / لا تعويض</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset(2)}
            className="rounded-lg border border-slate-200 bg-white p-2.5 text-right text-xs hover:border-brand hover:bg-brand-50 transition shadow-sm"
          >
            <div className="font-bold text-ink">مثال 2: استقالة وتنفيذ جزئي</div>
            <div className="text-ink-muted text-[11px] mt-0.5">خدم 40 من 60 يوماً / تعويض لصاحب العمل</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset(3)}
            className="rounded-lg border border-slate-200 bg-white p-2.5 text-right text-xs hover:border-brand hover:bg-brand-50 transition shadow-sm"
          >
            <div className="font-bold text-ink">مثال 3: إنهاء من صاحب العمل</div>
            <div className="text-ink-muted text-[11px] mt-0.5">خدم 10 من 30 يوماً / تعويض لصالح الموظف</div>
          </button>
        </div>
      </div>

      {/* ── Main Calculator Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Input Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Scope & Jurisdiction */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <div className="flex items-center gap-2 border-b border-brand-border pb-3 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
                1
              </span>
              <h2 className="text-base font-extrabold text-ink">
                نطاق النظام وفترة التجربة
              </h2>
            </div>

            <div className="space-y-4">
              {/* Scope Question */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  جهة العمل ونظام التشريع الخاضع له:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "private_mohre", label: "القطاع الخاص (MOHRE)" },
                    { id: "difc_adgm", label: "DIFC أو ADGM" },
                    { id: "other", label: "حكومي / شبه حكومي" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSectorType(item.id)}
                      className={`rounded-xl border py-2.5 px-2 text-center text-xs font-bold transition ${
                        sectorType === item.id
                          ? "border-brand bg-brand-50 text-brand shadow-sm"
                          : "border-slate-200 bg-white text-ink-muted hover:border-slate-300"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* DIFC / ADGM Warning */}
              {sectorType === "difc_adgm" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed">
                  ⚠️ <strong>تنبيه اختصاص:</strong> قد تختلف قواعد الإشعار في المناطق المالية الحرة (DIFC أو ADGM) عن قانون العمل الاتحادي، لذلك لا ينبغي الاعتماد على هذه الحاسبة وحدها.
                </div>
              )}

              {/* Government Warning */}
              {sectorType === "other" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed">
                  ⚠️ <strong>تنبيه اختصاص:</strong> تخضع القطاعات الحكومية والمناطق الحرة ذات القوانين الخاصة لتنظيمات إشعار مختلفة لا تخضع لأحكام المادة (43) مباشرة.
                </div>
              )}

              {/* Probation Question */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  هل الموظف لا يزال في فترة التجربة؟
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProbation("no")}
                    className={`rounded-xl border py-2 px-3 text-center text-xs font-bold transition ${
                      isProbation === "no"
                        ? "border-brand bg-brand-50 text-brand shadow-sm"
                        : "border-slate-200 bg-white text-ink-muted hover:border-slate-300"
                    }`}
                  >
                    لا (خدمة عادية بعد التجربة)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsProbation("yes")}
                    className={`rounded-xl border py-2 px-3 text-center text-xs font-bold transition ${
                      isProbation === "yes"
                        ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm"
                        : "border-slate-200 bg-white text-ink-muted hover:border-slate-300"
                    }`}
                  >
                    نعم (في فترة التجربة)
                  </button>
                </div>
              </div>

              {/* Probation Warning */}
              {isProbation === "yes" && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900 leading-relaxed">
                  ⚠️ <strong>تنبيه فترة التجربة:</strong> تخضع فترة التجربة لقواعد إشعار خاصة بحسب سبب الانتقال أو المغادرة (المادة 9 من قانون العمل: 14 يوماً من صاحب العمل، أو شهر إذا كان العامل سينتقل لعمل آخر بالدولة، أو 14 يوماً لمغادرة الدولة). هذه الحاسبة حالياً مخصصة أساساً لعقود العمل العادية لما بعد فترة التجربة (المادة 43).
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: Notice Initiation & Contract Notice */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <div className="flex items-center gap-2 border-b border-brand-border pb-3 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
                2
              </span>
              <h2 className="text-base font-extrabold text-ink">
                بيانات إشعار الإنهاء وعقد العمل
              </h2>
            </div>

            <div className="space-y-4">
              {/* SECTION A: Who Initiated */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  من قام بإنهاء العلاقة / تقديم الاستقالة؟
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInitiator("employee")}
                    className={`rounded-xl border py-2.5 px-3 text-center text-xs font-bold transition flex items-center justify-center gap-2 ${
                      initiator === "employee"
                        ? "border-brand bg-brand-50 text-brand shadow-sm"
                        : "border-slate-200 bg-white text-ink-muted hover:border-slate-300"
                    }`}
                  >
                    <span>👤</span>
                    <span>الموظف (استقالة)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInitiator("employer")}
                    className={`rounded-xl border py-2.5 px-3 text-center text-xs font-bold transition flex items-center justify-center gap-2 ${
                      initiator === "employer"
                        ? "border-brand bg-brand-50 text-brand shadow-sm"
                        : "border-slate-200 bg-white text-ink-muted hover:border-slate-300"
                    }`}
                  >
                    <span>🏢</span>
                    <span>صاحب العمل (إنهاء العقد)</span>
                  </button>
                </div>
                <p className="text-[11px] text-ink-muted mt-1">
                  {initiator === "employee"
                    ? "إذا لم يلتزم الموظف بفترة الإنذار كاملة، يكون التعويض مستحقاً لصالح صاحب العمل."
                    : "إذا أنهى صاحب العمل العقد فوراً أو لم يلتزم بالإنذار، يكون التعويض مستحقاً لصالح الموظف."}
                </p>
              </div>

              {/* SECTION B: Notice Date */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  تاريخ تقديم إشعار الإنهاء / الاستقالة:
                </label>
                <input
                  type="date"
                  value={noticeStartDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
                <span className="text-[11px] text-ink-muted mt-1 block">
                  اليوم الأول لاحتساب فترة الإنذار: {formatDateAr(noticeStartDate)}
                </span>
              </div>

              {/* SECTION C: Contractual Notice Period */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-ink">
                    فترة الإنذار المتفق عليها في عقد العمل:
                  </label>
                  <span className="text-[11px] text-brand font-bold">
                    المادة 43 (30 إلى 90 يوماً)
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {[
                    { id: "30", label: "30 يوماً" },
                    { id: "45", label: "45 يوماً" },
                    { id: "60", label: "60 يوماً" },
                    { id: "90", label: "90 يوماً" },
                    { id: "custom", label: "مخصصة" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setContractNoticePreset(p.id)}
                      className={`rounded-lg border py-2 px-1 text-center text-xs font-bold transition ${
                        contractNoticePreset === p.id
                          ? "border-brand bg-brand-50 text-brand shadow-sm"
                          : "border-slate-200 bg-white text-ink-muted hover:border-slate-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {contractNoticePreset === "custom" && (
                  <div className="mt-2">
                    <label className="block text-xs text-ink-muted mb-1">
                      أدخل عدد الأيام التعاقدية المخصصة:
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={customNoticeDays}
                        onChange={(e) => setCustomNoticeDays(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                      />
                      <span className="absolute left-3 top-2 text-xs text-ink-muted font-bold">
                        يوماً
                      </span>
                    </div>
                  </div>
                )}

                {/* Notice Validation Warnings */}
                {noticeValidation.msg && (
                  <div className="mt-2 rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900 leading-relaxed">
                    ⚠️ {noticeValidation.msg}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 3: Notice Served & Last Wage */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <div className="flex items-center gap-2 border-b border-brand-border pb-3 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
                3
              </span>
              <h2 className="text-base font-extrabold text-ink">
                الأيام المنفذة والأجر الأخير
              </h2>
            </div>

            <div className="space-y-4">
              {/* SECTION D: Method of entering served days */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  طريقة احتساب الأيام المنفذة فعلياً:
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setServedInputMode("days")}
                    className={`rounded-xl border py-2 px-3 text-center text-xs font-bold transition ${
                      servedInputMode === "days"
                        ? "border-brand bg-brand-50 text-brand shadow-sm"
                        : "border-slate-200 bg-white text-ink-muted hover:border-slate-300"
                    }`}
                  >
                    1. إدخال عدد الأيام مباشرة
                  </button>
                  <button
                    type="button"
                    onClick={() => setServedInputMode("date")}
                    className={`rounded-xl border py-2 px-3 text-center text-xs font-bold transition ${
                      servedInputMode === "date"
                        ? "border-brand bg-brand-50 text-brand shadow-sm"
                        : "border-slate-200 bg-white text-ink-muted hover:border-slate-300"
                    }`}
                  >
                    2. باختيار آخر يوم عمل فعلي
                  </button>
                </div>

                {servedInputMode === "days" ? (
                  <div>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={servedDaysInput}
                        onChange={(e) => setServedDaysInput(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                      />
                      <span className="absolute left-3 top-2 text-xs text-ink-muted font-bold">
                        يوماً تم تنفيذها
                      </span>
                    </div>
                    {toNum(servedDaysInput) > requiredNoticeDays && (
                      <p className="text-[11px] text-emerald-700 mt-1 font-bold">
                        ✓ الأيام المنفذة تتجاوز أو تغطي كامل المدة التعاقدية.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs text-ink-muted mb-1">
                      تاريخ آخر يوم عمل فعلي:
                    </label>
                    <input
                      type="date"
                      value={actualLastWorkingDate}
                      onChange={(e) => setActualLastWorkingDate(e.target.value)}
                      className={`w-full rounded-xl border px-3 py-2 text-sm text-ink focus:outline-none ${
                        isActualDateInvalid
                          ? "border-rose-400 bg-rose-50"
                          : "border-slate-300 focus:border-brand"
                      }`}
                    />
                    {isActualDateInvalid ? (
                      <p className="text-[11px] text-rose-600 mt-1 font-bold">
                        ❌ تاريخ آخر يوم عمل لا يمكن أن يكون قبل تاريخ تقديم الإشعار ({formatDateAr(noticeStartDate)}).
                      </p>
                    ) : (
                      <p className="text-[11px] text-ink-muted mt-1">
                        الأيام المحسوبة من تاريخ الإشعار: <strong>{servedNoticeDays} يوماً</strong>.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION E: Last Wage */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <span>آخر أجر كان يتقاضاه العامل (الأجر الأخير):</span>
                  </label>
                  <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    الراتب الشامل للبدلات
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={lastWage}
                    onChange={(e) => setLastWage(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                    placeholder="مثال: 9000"
                  />
                  <span className="absolute left-3 top-2 text-xs text-ink-muted font-bold">
                    درهم إماراتي (AED)
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
                  ℹ️ <strong>تنبيه قانوني:</strong> يُحسب بدل الإنذار بموجب المادة 43 على أساس <strong>الأجر الأخير</strong> (الأساسي + البدلات المنتظمة كالسكن والانتقال)، بخلاف مكافأة نهاية الخدمة التي تُحسب على الأساسي فقط.
                </p>
              </div>

              {/* Special Waiver / Mutual Agreement */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMutualWaiver}
                    onChange={(e) => setIsMutualWaiver(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                  />
                  <span className="text-xs text-ink leading-relaxed">
                    تم الاتفاق كتابياً بين الطرفين على الإعفاء المتبادل من مهلة الإنذار أو إنهائها بالتراضي مع حفظ الحقوق المقررة.
                  </span>
                </label>
                {isMutualWaiver && (
                  <div className="mt-2 rounded-xl border border-sky-200 bg-sky-50 p-2.5 text-xs text-sky-900 leading-relaxed">
                    📌 وفقاً للمادة (43) البند (2)، يجوز للطرفين الاتفاق على خفض مدة الإنذار أو الإعفاء منها بشرط الحفاظ على حقوق العامل المقررة في العقد والقانون. لا يُحسب تعويض بدل إنذار في حالة الإعفاء المتفق عليه.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right / Result Card Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Results Card */}
          <div className="rounded-2xl border-2 border-brand/20 bg-gradient-to-b from-white to-brand-50/20 p-5 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-brand-border pb-3 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-brand">
                  نتائج الحساب التقديري
                </span>
                <h3 className="text-lg font-black text-ink">ملخص فترة الإنذار</h3>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-extrabold text-brand border border-brand/20">
                المادة 43
              </span>
            </div>

            {/* Compensation Highlight Banner */}
            <div
              className={`rounded-2xl p-4 mb-4 text-center border ${
                compensationDirection === "to_employee"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : compensationDirection === "to_employer"
                  ? "bg-rose-50 border-rose-300 text-rose-950"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            >
              <div className="text-xs font-bold mb-1 opacity-80">
                {compensationDirection === "to_employee" && "بدل إنذار مستحق (+) لصالح:"}
                {compensationDirection === "to_employer" && "بدل إنذار مستحق (-) لصالح:"}
                {compensationDirection === "none" && "حالة التعويض عن الإنذار:"}
              </div>

              <div className="text-base font-black mb-1">
                {compensationDirection === "to_employee" && "الموظف (من صاحب العمل)"}
                {compensationDirection === "to_employer" && "صاحب العمل (من الموظف)"}
                {compensationDirection === "none" && (
                  remainingNoticeDays === 0
                    ? "تم استيفاء كامل فترة الإنذار"
                    : isMutualWaiver
                    ? "إعفاء متبادل بالتراضي"
                    : "لا يوجد بدل مستحق"
                )}
              </div>

              <div className="text-3xl font-black tracking-tight my-1">
                {fmt(estimatedCompensation)}{" "}
                <span className="text-sm font-bold">AED</span>
              </div>

              <div className="text-xs font-bold mt-1">
                {remainingNoticeDays > 0 ? (
                  <span>
                    مقابل {remainingNoticeDays} يوماً غير منفذة (الأجر اليومي {fmt(dailyWage)} AED)
                  </span>
                ) : (
                  <span>لا توجد أيام إنذار غير منفذة</span>
                )}
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="space-y-2.5 text-xs border-b border-brand-border pb-4 mb-4">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-ink-muted">تاريخ تقديم الإشعار:</span>
                <span className="font-bold text-ink">{formatDateAr(noticeStartDate)}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-ink-muted">فترة الإنذار المتفق عليها:</span>
                <span className="font-bold text-ink">{requiredNoticeDays} يوماً</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-ink-muted">آخر يوم عمل متوقع (تعاقدياً):</span>
                <span className="font-black text-brand">{formatDateAr(expectedLastWorkingDate)}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-ink-muted">الأيام المنفذة فعلياً:</span>
                <span className="font-bold text-emerald-700">{servedNoticeDays} يوماً</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-ink-muted">الأيام غير المنفذة (المتبقية):</span>
                <span
                  className={`font-black ${
                    remainingNoticeDays > 0 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {remainingNoticeDays} يوماً
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-ink-muted">آخر أجر شهري (شامل):</span>
                <span className="font-bold text-ink">{fmt(wage)} AED</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-ink-muted">الأجر اليومي المحسوب (الأجر ÷ 30):</span>
                <span className="font-bold text-ink">{fmt(dailyWage)} AED</span>
              </div>
            </div>

            {/* Informational: Employer Termination Job Search Day */}
            {initiator === "employer" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 mb-4 text-xs text-blue-900 leading-relaxed">
                ℹ️ <strong>يوم البحث عن عمل (المادة 43 - البند 5):</strong>
                <p className="mt-1 text-[11px]">
                  في حال قيام صاحب العمل بإنهاء العقد، يحق للموظف التغيب يوماً واحداً غير مدفوع الأجر أسبوعياً أو (8 ساعات متفرقة) للبحث عن عمل آخر، شريطة إخطار صاحب العمل قبل الغياب بثلاثة أيام على الأقل.
                </p>
              </div>
            )}

            {/* Printable summary action */}
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="w-full rounded-xl bg-ink hover:bg-slate-800 text-white font-bold py-2.5 px-4 text-xs transition shadow flex items-center justify-center gap-2"
            >
              <span>🖨️</span>
              <span>إنشاء ملخص فترة الإنذار قابل للطباعة</span>
            </button>
          </div>

          {/* Visual Timeline Card */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h4 className="text-xs font-black text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>📊</span> المخطط الزمني لفترة الإنذار
            </h4>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[11px] font-bold text-ink-muted mb-1">
                <span>تم تنفيذ {servedNoticeDays} يوماً ({timelineProgress}%)</span>
                <span>المتبقي {remainingNoticeDays} يوماً</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${timelineProgress}%` }}
                />
                {remainingNoticeDays > 0 && (
                  <div
                    className="h-full bg-rose-400/80 transition-all duration-300"
                    style={{ width: `${100 - timelineProgress}%` }}
                  />
                )}
              </div>
            </div>

            {/* Step Track */}
            <div className="relative pr-4 border-r-2 border-slate-200 space-y-4 text-xs">
              {/* Step 1: Notice Given */}
              <div className="relative">
                <span className="absolute -right-[21px] top-1 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="font-bold text-ink">تاريخ الإشعار: {formatDateAr(noticeStartDate)}</div>
                <div className="text-[11px] text-ink-muted">بداية سريان مهلة الإنذار المحددة بـ {requiredNoticeDays} يوماً.</div>
              </div>

              {/* Step 2: Actual last day */}
              <div className="relative">
                <span
                  className={`absolute -right-[21px] top-1 h-3 w-3 rounded-full ring-4 ring-white ${
                    remainingNoticeDays > 0 ? "bg-amber-500" : "bg-emerald-600"
                  }`}
                />
                <div className="font-bold text-ink">
                  الأيام المنفذة: {servedNoticeDays} يوماً
                </div>
                <div className="text-[11px] text-ink-muted">
                  {remainingNoticeDays > 0
                    ? `انقطعت فترة الإنذار مبكراً مع بقاء ${remainingNoticeDays} يوماً غير منفذة.`
                    : "تمت خدمة كامل فترة الإنذار المقررة في العقد بنجاح."}
                </div>
              </div>

              {/* Step 3: Expected end date */}
              <div className="relative">
                <span className="absolute -right-[21px] top-1 h-3 w-3 rounded-full bg-slate-400 ring-4 ring-white" />
                <div className="font-bold text-ink">آخر يوم عمل تعاقدي: {formatDateAr(expectedLastWorkingDate)}</div>
                <div className="text-[11px] text-ink-muted">الموعد النظامي لانقضاء رابطة العمل بشكل كامل.</div>
              </div>
            </div>
          </div>

          {/* Collapsible: How Calculation Works */}
          <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card">
            <button
              type="button"
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              className="w-full flex items-center justify-between text-xs font-bold text-ink hover:text-brand transition"
            >
              <span className="flex items-center gap-1.5">
                <span>📐</span> كيف تم الحساب؟ (المعادلة والأجر اليومي)
              </span>
              <span className="text-base">{showFormulaDetails ? "▲" : "▼"}</span>
            </button>

            {showFormulaDetails && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-ink-secondary space-y-2 leading-relaxed">
                <p>
                  <strong>1. احتساب الأجر اليومي:</strong>
                  <br />
                  الأجر اليومي = آخر أجر شهري ÷ 30
                  <br />
                  <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded text-ink">
                    {fmt(wage)} ÷ 30 = {fmt(dailyWage)} AED
                  </code>
                </p>

                <p>
                  <strong>2. احتساب بدل مهلة الإنذار:</strong>
                  <br />
                  بدل الإنذار = الأيام غير المنفذة × الأجر اليومي
                  <br />
                  <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded text-ink">
                    {remainingNoticeDays} × {fmt(dailyWage)} = {fmt(estimatedCompensation)} AED
                  </code>
                </p>

                <p>
                  <strong>3. توجيه المستفيد من التعويض:</strong>
                  <br />
                  وفقاً لنص المادة (43) البند (3)، يلتزم الطرف المخل بدفع بدل الإنذار إلى الطرف الآخر؛ فإذا أنهى صاحب العمل العقد دون إنذار استحق العامل التعويض، وإذا غادر الموظف قبل انتهاء الإنذار التزم بدفع البدل لصاحب العمل.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Printable Modal ── */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between border-b border-brand-border pb-3 mb-4 print:hidden">
              <h3 className="text-lg font-black text-ink">
                🖨️ معاينة ملخص فترة الإنذار للطباعة
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-lg bg-brand hover:bg-brand-dark px-3 py-1.5 text-xs font-bold text-white transition"
                >
                  طباعة فورية
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-ink-muted hover:bg-slate-50 transition"
                >
                  إغلاق
                </button>
              </div>
            </div>

            {/* Optional inputs for print personalization (Hidden in Print) */}
            <div className="mb-4 grid grid-cols-2 gap-3 print:hidden">
              <div>
                <label className="block text-[11px] font-bold text-ink mb-1">اسم الموظف (اختياري):</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="مثال: أحمد محمد"
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-ink mb-1">جهة العمل / الشركة (اختياري):</label>
                <input
                  type="text"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  placeholder="مثال: شركة الخليج للتجارة"
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            {/* Printable Content Block */}
            <div className="print-content space-y-4 text-ink border border-slate-200 rounded-xl p-6 bg-slate-50/50">
              <div className="text-center border-b border-slate-300 pb-3">
                <div className="text-xs text-ink-muted font-bold">دولة الإمارات العربية المتحدة</div>
                <h2 className="text-xl font-black mt-1">ملخص تقديري لفترة الإنذار</h2>
                <div className="text-xs text-ink-muted mt-0.5">
                  استناداً إلى أحكام المادة (43) من المرسوم بقانون اتحادي رقم (33) لسنة 2021
                </div>
              </div>

              {/* Parties Info */}
              {(employeeName || employerName) && (
                <div className="grid grid-cols-2 gap-4 text-xs bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-ink-muted">الموظف: </span>
                    <span className="font-bold">{employeeName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted">صاحب العمل: </span>
                    <span className="font-bold">{employerName || "—"}</span>
                  </div>
                </div>
              )}

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-white p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-ink-muted block mb-0.5">الطرف المبادر بالإنهاء:</span>
                  <span className="font-bold">{initiator === "employee" ? "الموظف (استقالة)" : "صاحب العمل (إنهاء)"}</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">تاريخ تقديم الإشعار:</span>
                  <span className="font-bold">{formatDateAr(noticeStartDate)}</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">فترة الإنذار المتفق عليها:</span>
                  <span className="font-bold">{requiredNoticeDays} يوماً</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">آخر يوم عمل متوقع (تعاقدياً):</span>
                  <span className="font-bold">{formatDateAr(expectedLastWorkingDate)}</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">الأيام المنفذة فعلياً:</span>
                  <span className="font-bold">{servedNoticeDays} يوماً</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">الأيام غير المنفذة (المتبقية):</span>
                  <span className="font-bold">{remainingNoticeDays} يوماً</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">الأجر الأخير المعتمد:</span>
                  <span className="font-bold">{fmt(wage)} AED</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">الأجر اليومي (الأجر ÷ 30):</span>
                  <span className="font-bold">{fmt(dailyWage)} AED</span>
                </div>
              </div>

              {/* Compensation Summary in Print */}
              <div className="bg-white p-4 rounded-lg border-2 border-brand/30 text-center">
                <div className="text-xs text-ink-muted font-bold">بدل الإنذار التقديري المستحق:</div>
                <div className="text-2xl font-black text-brand my-1">
                  {fmt(estimatedCompensation)} AED
                </div>
                <div className="text-xs font-bold text-ink">
                  الطرف المستفيد من التعويض:{" "}
                  {compensationDirection === "to_employee"
                    ? "الموظف (مستحق من صاحب العمل)"
                    : compensationDirection === "to_employer"
                    ? "صاحب العمل (مستحق من الموظف)"
                    : "لا يوجد تعويض مالي (تم استيفاء المدة أو تم الإعفاء بالتراضي)"}
                </div>
              </div>

              {/* Print Footer / Legal Disclaimer */}
              <div className="text-[10px] text-ink-muted space-y-1 pt-2 border-t border-slate-300">
                <p>
                  <strong>إخلاء مسؤولية قانوني:</strong> هذه الوثيقة تقديرية واسترشادية أُنشئت إلكترونياً بناءً على البيانات المُدخلة من المستخدم، ولا تُعد قراراً صادراً عن وزارة الموارد البشرية والتوطين (MOHRE) أو تسوية قانونية نهائية أو وثيقة قضائية ملزمة.
                </p>
                <div className="flex justify-between pt-1">
                  <span>تاريخ إصدار الملخص: {new Date().toLocaleDateString("ar-AE")}</span>
                  <span>المصدر: حاسبة فترة الإنذار في الإمارات — موقع الأدوات العربية</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Official Source Citation ── */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-ink-secondary flex items-start gap-3">
        <span className="text-xl">🏛️</span>
        <div>
          <div className="font-bold text-ink mb-0.5">
            المصدر القانوني المعتمد:
          </div>
          <p className="leading-relaxed">
            وزارة الموارد البشرية والتوطين (MOHRE) — المرسوم بقانون اتحادي رقم (33) لسنة 2021 بشأن تنظيم علاقات العمل ولائحته التنفيذية — <strong>المادة (43) إنهاء عقد العمل وفترة الإنذار</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
