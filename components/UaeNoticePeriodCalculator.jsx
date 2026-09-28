"use client";

import { useState, useMemo } from "react";
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
  d.setDate(d.getDate() + Number(days));
  return d.toISOString().split("T")[0];
}

/** Calculate calendar day difference between two dates */
function getDaysDiff(startStr, endStr) {
  if (!startStr || !endStr) return 0;
  const s = new Date(startStr);
  const e = new Date(endStr);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
  const diffMs = e.getTime() - s.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export default function UaeNoticePeriodCalculator() {
  // ── Section 3: Scope Check Questions ─────────────────────────────────────────
  // 1. هل تعمل في القطاع الخاص الخاضع لقانون العمل الإماراتي؟ (نعم / لا / غير متأكد)
  const [isPrivateSector, setIsPrivateSector] = useState("yes"); // "yes" | "no" | "unsure"
  // 2. هل تعمل في DIFC أو ADGM؟ (لا / نعم / غير متأكد)
  const [isDifcAdgm, setIsDifcAdgm] = useState("no"); // "no" | "yes" | "unsure"

  // ── Section 4: Probation Status ──────────────────────────────────────────────
  // هل الموظف لا يزال في فترة التجربة؟ (نعم / لا)
  const [isProbation, setIsProbation] = useState("no"); // "no" | "yes"

  // ── Section 5: Core User Inputs ──────────────────────────────────────────────
  // A. Who initiated termination? (الموظف / صاحب العمل)
  const [initiator, setInitiator] = useState("employee"); // "employee" | "employer"

  // B. Notice date (تاريخ تقديم الإشعار / الاستقالة)
  const [noticeStartDate, setNoticeStartDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // C. Contractual notice period (30, 45, 60, 90, Custom)
  const [contractNoticePreset, setContractNoticePreset] = useState("30"); // "30" | "45" | "60" | "90" | "custom"
  const [customNoticeDays, setCustomNoticeDays] = useState("30");

  // D. Actual notice served (عدد الأيام التي تم تنفيذها OR آخر يوم عمل فعلي)
  const [servedInputMode, setServedInputMode] = useState("days"); // "days" | "date"
  const [servedDaysInput, setServedDaysInput] = useState("30");
  const [actualLastWorkingDate, setActualLastWorkingDate] = useState(() => {
    return addDays(new Date().toISOString().split("T")[0], 30);
  });

  // E. Last wage (آخر أجر كان يتقاضاه العامل) AED
  const [lastWage, setLastWage] = useState("9000");

  // Special waiver / agreement
  const [isMutualWaiver, setIsMutualWaiver] = useState(false);

  // UI States
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [employerName, setEmployerName] = useState("");

  // ── Contractual Notice Days Calculation ──────────────────────────────────────
  const requiredNoticeDays = useMemo(() => {
    if (contractNoticePreset === "custom") {
      return toNum(customNoticeDays);
    }
    return toNum(contractNoticePreset);
  }, [contractNoticePreset, customNoticeDays]);

  // Validation: 30 to 90 days
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

  // Section 6: Expected Last Working Day
  // noticeStartDate + contractNoticeDays = expectedLastWorkingDate
  const expectedLastWorkingDate = useMemo(() => {
    if (!noticeStartDate || requiredNoticeDays <= 0) return "";
    return addDays(noticeStartDate, requiredNoticeDays);
  }, [noticeStartDate, requiredNoticeDays]);

  // Auto-sync when noticeStartDate changes and mode is 'date'
  const handleStartDateChange = (newDate) => {
    setNoticeStartDate(newDate);
    if (servedInputMode === "date" && newDate && requiredNoticeDays > 0) {
      setActualLastWorkingDate(addDays(newDate, requiredNoticeDays));
    }
  };

  // Section 7: Resolved Served Days
  const servedNoticeDays = useMemo(() => {
    if (servedInputMode === "days") {
      return toNum(servedDaysInput);
    } else {
      if (!noticeStartDate || !actualLastWorkingDate) return 0;
      const diff = getDaysDiff(noticeStartDate, actualLastWorkingDate);
      if (diff < 0) return 0;
      return diff;
    }
  }, [servedInputMode, servedDaysInput, noticeStartDate, actualLastWorkingDate]);

  // Date validity check for actual last date
  const isActualDateInvalid = useMemo(() => {
    if (servedInputMode !== "date") return false;
    if (!noticeStartDate || !actualLastWorkingDate) return false;
    return new Date(actualLastWorkingDate) < new Date(noticeStartDate);
  }, [servedInputMode, noticeStartDate, actualLastWorkingDate]);

  // Section 7: Remaining Notice Days
  // remainingNoticeDays = max(requiredNoticeDays - servedNoticeDays, 0)
  const remainingNoticeDays = useMemo(() => {
    if (isMutualWaiver) return 0;
    return Math.max(requiredNoticeDays - servedNoticeDays, 0);
  }, [requiredNoticeDays, servedNoticeDays, isMutualWaiver]);

  // Section 8: Wage & Compensation Math
  const wage = toNum(lastWage);
  const dailyWage = wage / 30; // dailyWage = lastWage / 30
  const estimatedCompensation = remainingNoticeDays * dailyWage; // remainingNoticeDays * dailyWage

  // Section 8: Compensation Direction
  const compensationDirection = useMemo(() => {
    if (remainingNoticeDays <= 0 || isMutualWaiver || wage <= 0) {
      return "none";
    }
    // If employer failed to serve notice -> compensation payable to employee
    if (initiator === "employer") {
      return "to_employee";
    }
    // If employee failed to serve notice -> compensation payable to employer
    return "to_employer";
  }, [remainingNoticeDays, isMutualWaiver, wage, initiator]);

  // Timeline progress percentage
  const timelineProgress = useMemo(() => {
    if (requiredNoticeDays <= 0) return 100;
    const pct = Math.min(100, Math.round((servedNoticeDays / requiredNoticeDays) * 100));
    return Math.max(0, pct);
  }, [servedNoticeDays, requiredNoticeDays]);

  // Presets from User Request Worked Examples
  const applyPreset = (presetNum) => {
    if (presetNum === 1) {
      // Example 1: Employee resignation, 60 days notice, 60 served, 9000 AED => no compensation
      setInitiator("employee");
      setContractNoticePreset("60");
      setServedInputMode("days");
      setServedDaysInput("60");
      setLastWage("9000");
      setIsMutualWaiver(false);
      setIsProbation("no");
      setIsPrivateSector("yes");
      setIsDifcAdgm("no");
    } else if (presetNum === 2) {
      // Example 2: Employee resignation, 60 days notice, 40 served, 9000 AED => 6000 AED payable to employer
      setInitiator("employee");
      setContractNoticePreset("60");
      setServedInputMode("days");
      setServedDaysInput("40");
      setLastWage("9000");
      setIsMutualWaiver(false);
      setIsProbation("no");
      setIsPrivateSector("yes");
      setIsDifcAdgm("no");
    } else if (presetNum === 3) {
      // Example 3: Employer termination, 30 days notice, 10 served, 12000 AED => 8000 AED payable to employee
      setInitiator("employer");
      setContractNoticePreset("30");
      setServedInputMode("days");
      setServedDaysInput("10");
      setLastWage("12000");
      setIsMutualWaiver(false);
      setIsProbation("no");
      setIsPrivateSector("yes");
      setIsDifcAdgm("no");
    }
  };

  const handleReset = () => {
    setIsPrivateSector("yes");
    setIsDifcAdgm("no");
    setIsProbation("no");
    setInitiator("employee");
    const today = new Date().toISOString().split("T")[0];
    setNoticeStartDate(today);
    setContractNoticePreset("30");
    setCustomNoticeDays("30");
    setServedInputMode("days");
    setServedDaysInput("30");
    setActualLastWorkingDate(addDays(today, 30));
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
              حاسبة فترة الإنذار في الإمارات
            </h1>
          </div>
          <p className="text-sm text-ink-muted">
            احتساب آخر يوم عمل، الأيام غير المنفذة، وبدل الإنذار التعويضي وفق أحكام المادة (43) من قانون العمل الإماراتي رقم 33 لسنة 2021
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
            <span>🇦🇪</span> المادة 43
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
            <span>💡</span> أمثلة عملية سريعة (اضغط للتطبيق المباشر):
          </span>
          <button
            onClick={handleReset}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold underline transition"
          >
            إعادة تعيين
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => applyPreset(1)}
            className="rounded-lg border border-slate-200 bg-white p-2.5 text-right text-xs hover:border-brand hover:bg-brand-50 transition shadow-sm"
          >
            <div className="font-bold text-ink">مثال 1: استقالة وتنفيذ كامل</div>
            <div className="text-ink-muted text-[11px] mt-0.5">إنذار 60 يوماً / نُفذت 60 / لا تعويض (0)</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset(2)}
            className="rounded-lg border border-slate-200 bg-white p-2.5 text-right text-xs hover:border-brand hover:bg-brand-50 transition shadow-sm"
          >
            <div className="font-bold text-ink">مثال 2: استقالة وتنفيذ جزئي</div>
            <div className="text-ink-muted text-[11px] mt-0.5">خدم 40 من 60 يوماً / 6,000 درهم لصاحب العمل</div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset(3)}
            className="rounded-lg border border-slate-200 bg-white p-2.5 text-right text-xs hover:border-brand hover:bg-brand-50 transition shadow-sm"
          >
            <div className="font-bold text-ink">مثال 3: إنهاء من صاحب العمل</div>
            <div className="text-ink-muted text-[11px] mt-0.5">خدم 10 من 30 يوماً / 8,000 درهم لصالح الموظف</div>
          </button>
        </div>
      </div>

      {/* ── Main Calculator Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Scope Check & Probation */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <div className="flex items-center gap-2 border-b border-brand-border pb-3 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
                1
              </span>
              <h2 className="text-base font-extrabold text-ink">
                فحص النطاق وجهة الاختصاص
              </h2>
            </div>

            <div className="space-y-4">
              {/* Question 1: Private Sector */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  هل تعمل في القطاع الخاص الخاضع لقانون العمل الإماراتي؟
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "yes", label: "نعم" },
                    { id: "no", label: "لا" },
                    { id: "unsure", label: "غير متأكد" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setIsPrivateSector(opt.id)}
                      className={`rounded-xl border py-2 px-3 text-center text-xs font-bold transition ${
                        isPrivateSector === opt.id
                          ? "border-brand bg-brand-50 text-brand shadow-sm"
                          : "border-slate-200 bg-white text-ink-muted hover:border-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {isPrivateSector !== "yes" && (
                  <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900 leading-relaxed">
                    ⚠️ <strong>تنبيه:</strong> قد تختلف التشريعات المنظمة للقطاعات الحكومية وشبه الحكومية والمناطق ذات الأنظمة المستقلة عن أحكام المادة (43) من قانون العمل الاتحادي.
                  </div>
                )}
              </div>

              {/* Question 2: DIFC or ADGM */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  هل تعمل في DIFC أو ADGM؟
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "no", label: "لا" },
                    { id: "yes", label: "نعم" },
                    { id: "unsure", label: "غير متأكد" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setIsDifcAdgm(opt.id)}
                      className={`rounded-xl border py-2 px-3 text-center text-xs font-bold transition ${
                        isDifcAdgm === opt.id
                          ? opt.id === "yes"
                            ? "border-amber-500 bg-amber-50 text-amber-900 shadow-sm"
                            : "border-brand bg-brand-50 text-brand shadow-sm"
                          : "border-slate-200 bg-white text-ink-muted hover:border-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {isDifcAdgm === "yes" && (
                  <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900 leading-relaxed">
                    ⚠️ <strong>تنبيه:</strong> قد تختلف قواعد الإشعار في DIFC أو ADGM، لذلك لا ينبغي الاعتماد على هذه الحاسبة وحدها.
                  </div>
                )}
              </div>

              {/* Question 3: Probation Status */}
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
                    لا
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsProbation("yes")}
                    className={`rounded-xl border py-2 px-3 text-center text-xs font-bold transition ${
                      isProbation === "yes"
                        ? "border-rose-500 bg-rose-50 text-rose-800 shadow-sm"
                        : "border-slate-200 bg-white text-ink-muted hover:border-slate-300"
                    }`}
                  >
                    نعم
                  </button>
                </div>
                {isProbation === "yes" && (
                  <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-900 leading-relaxed">
                    ⚠️ هذه الحاسبة مخصصة أساساً لما بعد فترة التجربة، وقد تختلف قواعد الإشعار أثناء التجربة.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2: Notice & Contract Details */}
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
              {/* A. Who Initiated */}
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
                    <span>الموظف</span>
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
                    <span>صاحب العمل</span>
                  </button>
                </div>
              </div>

              {/* B. Notice Date */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  تاريخ تقديم الإشعار / الاستقالة:
                </label>
                <input
                  type="date"
                  value={noticeStartDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
                <span className="text-[11px] text-ink-muted mt-1 block">
                  تاريخ تقديم الإشعار: {formatDateAr(noticeStartDate)}
                </span>
              </div>

              {/* C. Contractual Notice Period */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-ink">
                    فترة الإنذار المتفق عليها:
                  </label>
                  <span className="text-[11px] text-brand font-bold">
                    الحد النظامي: 30 إلى 90 يوماً
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
                      أدخل عدد الأيام المخصصة:
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

                {/* Validation Warnings */}
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
                الأيام المنفذة وآخر أجر
              </h2>
            </div>

            <div className="space-y-4">
              {/* D. Actual notice served */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  الأيام المنفذة فعلياً من فترة الإنذار:
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
                    عدد الأيام التي تم تنفيذها
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
                    آخر يوم عمل فعلي
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
                        يوماً
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs text-ink-muted mb-1">
                      حدد آخر يوم عمل فعلي:
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
                        ❌ لا يمكن أن يكون آخر يوم عمل قبل تاريخ تقديم الإشعار.
                      </p>
                    ) : (
                      <p className="text-[11px] text-ink-muted mt-1">
                        الأيام المنفذة المحسوبة تلقائياً: <strong>{servedNoticeDays} يوماً</strong>.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* E. Last Wage */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-ink">
                    آخر أجر كان يتقاضاه العامل:
                  </label>
                  <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    الأجر المعتمد لبدل الإنذار
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
                    AED
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
                  يُعتمد الأجر الأخير الشامل (الأساسي والبدلات) في احتساب بدل الإنذار بموجب المادة (43).
                </p>
              </div>

              {/* Special Waiver */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMutualWaiver}
                    onChange={(e) => setIsMutualWaiver(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                  />
                  <span className="text-xs text-ink leading-relaxed">
                    تم الاتفاق كتابياً بين الطرفين على الإعفاء المتبادل من مهلة الإنذار مع حفظ الحقوق المقررة.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Result Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Result Card */}
          <div className="rounded-2xl border-2 border-brand/20 bg-gradient-to-b from-white to-brand-50/20 p-5 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-brand-border pb-3 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-brand">
                  نتائج الحساب التقديري
                </span>
                <h3 className="text-lg font-black text-ink">بطاقة النتائج</h3>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-extrabold text-brand border border-brand/20">
                المادة 43
              </span>
            </div>

            {/* Compensation Highlight Banner with EXACT LABELS */}
            <div
              className={`rounded-2xl p-4 mb-4 text-center border ${
                compensationDirection === "to_employee"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : compensationDirection === "to_employer"
                  ? "bg-rose-50 border-rose-300 text-rose-950"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            >
              <div className="text-sm font-black mb-1">
                {compensationDirection === "to_employee" && "بدل إنذار لصالح الموظف (+)"}
                {compensationDirection === "to_employer" && "بدل إنذار لصالح صاحب العمل (−)"}
                {compensationDirection === "none" && (
                  remainingNoticeDays === 0
                    ? "تم تنفيذ فترة الإنذار كاملة"
                    : isMutualWaiver
                    ? "تم الإعفاء من الإنذار بالتراضي"
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
                  <span>0 أيام متبقية — لا تعويض مالي مستحق</span>
                )}
              </div>
            </div>

            {/* Section 9: Breakdown Table */}
            <div className="space-y-2.5 text-xs border-b border-brand-border pb-4 mb-4">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-ink-muted">تاريخ الإشعار:</span>
                <span className="font-bold text-ink">{formatDateAr(noticeStartDate)}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-ink-muted">فترة الإنذار:</span>
                <span className="font-bold text-ink">{requiredNoticeDays} يوم</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-ink-muted">آخر يوم عمل المتوقع:</span>
                <span className="font-black text-brand">{formatDateAr(expectedLastWorkingDate)}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-ink-muted">الأيام المنفذة:</span>
                <span className="font-bold text-emerald-700">{servedNoticeDays} يوم</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-ink-muted">الأيام غير المنفذة:</span>
                <span
                  className={`font-black ${
                    remainingNoticeDays > 0 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {remainingNoticeDays} يوم
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-ink-muted">آخر أجر:</span>
                <span className="font-bold text-ink">{fmt(wage)} AED</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-ink-muted">الأجر اليومي:</span>
                <span className="font-bold text-ink">{fmt(dailyWage)} AED</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-ink-muted">بدل الإنذار:</span>
                <span className="font-black text-ink">{fmt(estimatedCompensation)} AED</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-ink-muted">الطرف المستفيد:</span>
                <span className="font-bold text-brand">
                  {compensationDirection === "to_employee"
                    ? "الموظف"
                    : compensationDirection === "to_employer"
                    ? "صاحب العمل"
                    : "لا يوجد (تم استيفاء المدة)"}
                </span>
              </div>
            </div>

            {/* Informational: Employer Termination Job Search Day */}
            {initiator === "employer" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 mb-4 text-xs text-blue-900 leading-relaxed">
                ℹ️ <strong>ملاحظة (المادة 43 - البند 5):</strong>
                <p className="mt-1 text-[11px]">
                  في حال قيام صاحب العمل بإنهاء العقد، يحق للعامل التغيب يوماً واحداً غير مدفوع الأجر أسبوعياً للبحث عن عمل، شريطة إخطار صاحب العمل مسبقاً بثلاثة أيام على الأقل.
                </p>
              </div>
            )}

            {/* Section 12: Printable summary button */}
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="w-full rounded-xl bg-ink hover:bg-slate-800 text-white font-bold py-2.5 px-4 text-xs transition shadow flex items-center justify-center gap-2"
            >
              <span>🖨️</span>
              <span>إنشاء ملخص فترة الإنذار قابل للطباعة</span>
            </button>
          </div>

          {/* Section 10: Visual Timeline */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
            <h4 className="text-xs font-black text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>📊</span> المخطط الزمني لفترة الإنذار
            </h4>

            {/* Progress Bar */}
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
                    className="h-full bg-rose-400 transition-all duration-300"
                    style={{ width: `${100 - timelineProgress}%` }}
                  />
                )}
              </div>
            </div>

            {/* Step Track */}
            <div className="relative pr-4 border-r-2 border-slate-200 space-y-4 text-xs">
              <div className="relative">
                <span className="absolute -right-[21px] top-1 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="font-bold text-ink">تاريخ الإشعار: {formatDateAr(noticeStartDate)}</div>
                <div className="text-[11px] text-ink-muted">بداية سريان فترة الإنذار ({requiredNoticeDays} يوماً).</div>
              </div>

              <div className="relative">
                <span
                  className={`absolute -right-[21px] top-1 h-3 w-3 rounded-full ring-4 ring-white ${
                    remainingNoticeDays > 0 ? "bg-rose-500" : "bg-emerald-600"
                  }`}
                />
                <div className="font-bold text-ink">
                  فترة الإنذار المنفذة: {servedNoticeDays} يوماً
                </div>
                <div className="text-[11px] text-ink-muted">
                  {remainingNoticeDays > 0
                    ? `توقفت خدمة الإنذار مع بقاء ${remainingNoticeDays} يوماً غير منفذة.`
                    : "تمت خدمة كامل فترة الإنذار المقررة في العقد بنجاح."}
                </div>
              </div>

              <div className="relative">
                <span className="absolute -right-[21px] top-1 h-3 w-3 rounded-full bg-slate-400 ring-4 ring-white" />
                <div className="font-bold text-ink">آخر يوم عمل المتوقع: {formatDateAr(expectedLastWorkingDate)}</div>
                <div className="text-[11px] text-ink-muted">الموعد التعاقدي لانتهاء سريان عقد العمل.</div>
              </div>
            </div>
          </div>

          {/* Section 11: How calculation works (Collapsible) */}
          <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-card">
            <button
              type="button"
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              className="w-full flex items-center justify-between text-xs font-bold text-ink hover:text-brand transition"
            >
              <span className="flex items-center gap-1.5">
                <span>📐</span> كيف تم الحساب؟
              </span>
              <span className="text-base">{showFormulaDetails ? "▲" : "▼"}</span>
            </button>

            {showFormulaDetails && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-ink-secondary space-y-2.5 leading-relaxed">
                <div>
                  <div className="font-bold text-ink">1. احتساب الأجر اليومي:</div>
                  <div className="bg-slate-100 p-2 rounded text-ink font-mono text-[11px] mt-0.5">
                    آخر أجر ÷ 30 = الأجر اليومي
                    <br />
                    {fmt(wage)} ÷ 30 = {fmt(dailyWage)} AED
                  </div>
                </div>

                <div>
                  <div className="font-bold text-ink">2. احتساب بدل الإنذار:</div>
                  <div className="bg-slate-100 p-2 rounded text-ink font-mono text-[11px] mt-0.5">
                    الأجر اليومي × الأيام غير المنفذة = بدل الإنذار
                    <br />
                    {fmt(dailyWage)} × {remainingNoticeDays} = {fmt(estimatedCompensation)} AED
                  </div>
                </div>

                <div>
                  <div className="font-bold text-ink">3. من يدفع التعويض؟</div>
                  <p className="mt-0.5 text-[11px]">
                    يلتزم الطرف الذي أخل بمهلة الإنذار بتعويض الطرف الآخر؛ فإذا أنهى صاحب العمل العقد استحق الموظف البدل، وإذا غادر الموظف مبكراً التزم بسداد البدل لصاحب العمل.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 12: Printable Summary Modal ── */}
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
                  طباعة
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
                  placeholder="مثال: أحمد سالم"
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-ink mb-1">صاحب العمل / الشركة (اختياري):</label>
                <input
                  type="text"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  placeholder="مثال: شركة الاتحاد للتجارة"
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            {/* Printable Content Block */}
            <div className="print-content space-y-4 text-ink border border-slate-200 rounded-xl p-6 bg-slate-50/50">
              <div className="text-center border-b border-slate-300 pb-3">
                <div className="text-xs text-ink-muted font-bold">دولة الإمارات العربية المتحدة</div>
                {/* Heading EXACT per Section 12 */}
                <h2 className="text-xl font-black mt-1">ملخص تقديري لفترة الإنذار</h2>
                <div className="text-xs text-ink-muted mt-0.5">
                  وفق أحكام المادة (43) من المرسوم بقانون اتحادي رقم (33) لسنة 2021
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
                    <span className="text-ink-muted">صاحب العمل / الشركة: </span>
                    <span className="font-bold">{employerName || "—"}</span>
                  </div>
                </div>
              )}

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-white p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-ink-muted block mb-0.5">الطرف المبادر بالإنهاء:</span>
                  <span className="font-bold">{initiator === "employee" ? "الموظف" : "صاحب العمل"}</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">تاريخ الإشعار:</span>
                  <span className="font-bold">{formatDateAr(noticeStartDate)}</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">فترة الإنذار التعاقدية:</span>
                  <span className="font-bold">{requiredNoticeDays} يوم</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">آخر يوم عمل المتوقع:</span>
                  <span className="font-bold">{formatDateAr(expectedLastWorkingDate)}</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">آخر يوم عمل فعلي:</span>
                  <span className="font-bold">
                    {servedInputMode === "date" ? formatDateAr(actualLastWorkingDate) : `بعد ${servedNoticeDays} يوم`}
                  </span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">الأيام المنفذة:</span>
                  <span className="font-bold">{servedNoticeDays} يوم</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">الأيام المتبقية (غير المنفذة):</span>
                  <span className="font-bold">{remainingNoticeDays} يوم</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">آخر أجر:</span>
                  <span className="font-bold">{fmt(wage)} AED</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">الأجر اليومي:</span>
                  <span className="font-bold">{fmt(dailyWage)} AED</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">الطرف المستفيد:</span>
                  <span className="font-bold">
                    {compensationDirection === "to_employee"
                      ? "الموظف"
                      : compensationDirection === "to_employer"
                      ? "صاحب العمل"
                      : "لا يوجد تعويض مستحق"}
                  </span>
                </div>
              </div>

              {/* Compensation Summary in Print */}
              <div className="bg-white p-4 rounded-lg border-2 border-brand/30 text-center">
                <div className="text-xs text-ink-muted font-bold">بدل الإنذار التقديري:</div>
                <div className="text-2xl font-black text-brand my-1">
                  {fmt(estimatedCompensation)} AED
                </div>
                <div className="text-xs font-bold text-ink">
                  {compensationDirection === "to_employee" && "بدل إنذار لصالح الموظف (+)"}
                  {compensationDirection === "to_employer" && "بدل إنذار لصالح صاحب العمل (−)"}
                  {compensationDirection === "none" && "تم تنفيذ فترة الإنذار كاملة"}
                </div>
              </div>

              {/* Section 13: Exact Disclaimer */}
              <div className="text-[10px] text-ink-muted space-y-1 pt-2 border-t border-slate-300">
                <p>
                  <strong>إخلاء مسؤولية:</strong> هذه الحاسبة تقديرية وتعتمد على البيانات التي يدخلها المستخدم. ولا تمثل قراراً رسمياً من وزارة الموارد البشرية والتوطين أو حكماً قانونياً نهائياً. قد تختلف النتيجة بحسب عقد العمل، حالة فترة التجربة، جهة الاختصاص أو ظروف إنهاء العلاقة العمالية.
                </p>
                <div className="flex justify-between pt-1">
                  <span>تاريخ الحساب: {new Date().toLocaleDateString("ar-AE")}</span>
                  <span>المصدر: حاسبة فترة الإنذار في الإمارات — الأدوات العربية</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Section 13: Page Disclaimer ── */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-ink-secondary flex items-start gap-3">
        <span className="text-xl">⚖️</span>
        <div>
          <div className="font-bold text-ink mb-1">
            إخلاء مسؤولية قانوني:
          </div>
          <p className="leading-relaxed">
            هذه الحاسبة تقديرية وتعتمد على البيانات التي يدخلها المستخدم. ولا تمثل قراراً رسمياً من وزارة الموارد البشرية والتوطين أو حكماً قانونياً نهائياً. قد تختلف النتيجة بحسب عقد العمل، حالة فترة التجربة، جهة الاختصاص أو ظروف إنهاء العلاقة العمالية.
          </p>
        </div>
      </div>
    </div>
  );
}
