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

/** Calculate service duration between two dates */
function calcServiceDuration(startStr, endStr, unpaidAbsenceDays = 0) {
  if (!startStr || !endStr) return { totalMonths: 0, netYears: 0, formatted: "—", isValid: false, daysTotal: 0 };
  const s = new Date(startStr);
  const e = new Date(endStr);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) {
    return { totalMonths: 0, netYears: 0, formatted: "تاريخ غير صالح", isValid: false, daysTotal: 0 };
  }

  const diffMs = e.getTime() - s.getTime();
  const rawDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const netDays = Math.max(0, rawDays - toNum(unpaidAbsenceDays));
  const netYears = netDays / 365.25;
  const totalMonths = netDays / (365.25 / 12);

  const years = Math.floor(netYears);
  const remMonths = Math.floor((netYears - years) * 12);
  const remDays = Math.floor(netDays - (years * 365.25 + remMonths * (365.25 / 12)));

  let parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "سنة" : years === 2 ? "سنتان" : years <= 10 ? "سنوات" : "سنة"}`);
  if (remMonths > 0) parts.push(`${remMonths} ${remMonths === 1 ? "شهر" : remMonths === 2 ? "شهران" : remMonths <= 10 ? "أشهر" : "شهراً"}`);
  if (remDays > 0 && years === 0) parts.push(`${remDays} يوماً`);

  return {
    totalMonths,
    netYears,
    netDays,
    formatted: parts.length ? parts.join(" و") : "أقل من شهر",
    isValid: true,
  };
}

export default function UaeFinalSettlementCalculator() {
  // ── Section A: Employee Scope & Status ────────────────────────────────────
  const [isCitizen, setIsCitizen] = useState("non_citizen"); // "non_citizen" | "citizen"
  const [isMOHRE, setIsMOHRE] = useState("yes"); // "yes" | "other"
  const [savingsScheme, setSavingsScheme] = useState("no"); // "no" | "yes" | "uncertain"
  const [workPattern, setWorkPattern] = useState("full_time"); // "full_time" | "part_time"

  // ── Section B: Dates & Service ────────────────────────────────────────────
  const [joiningDate, setJoiningDate] = useState("2022-01-01");
  const [lastWorkingDate, setLastWorkingDate] = useState(new Date().toISOString().split("T")[0]);
  const [unpaidAbsenceDays, setUnpaidAbsenceDays] = useState("0");

  // ── Section C: Salary Details ─────────────────────────────────────────────
  const [basicSalary, setBasicSalary] = useState("6000");
  const [grossSalary, setGrossSalary] = useState("9000");

  // ── Section D: Final Salary (آخر شهر) ──────────────────────────────────────
  const [salaryMode, setSalaryMode] = useState("days"); // "days" | "amount"
  const [workedDaysInLastMonth, setWorkedDaysInLastMonth] = useState("30");
  const [manualSalaryDue, setManualSalaryDue] = useState("0");

  // ── Section E: Annual Leave ───────────────────────────────────────────────
  const [unusedLeaveDays, setUnusedLeaveDays] = useState("10");

  // ── Section F: Notice Period ──────────────────────────────────────────────
  const [isNoticeServed, setIsNoticeServed] = useState("yes"); // "yes" | "no"
  const [whoBreachedNotice, setWhoBreachedNotice] = useState("employer"); // "employer" | "employee"
  const [requiredNoticeDays, setRequiredNoticeDays] = useState("30");
  const [servedNoticeDays, setServedNoticeDays] = useState("0");

  // ── Section G: Other Additions & Deductions ───────────────────────────────
  const [overdueSalary, setOverdueSalary] = useState("0");
  const [commissions, setCommissions] = useState("0");
  const [repatriationTicket, setRepatriationTicket] = useState("1000");
  const [otherAdditions, setOtherAdditions] = useState("0");

  const [loans, setLoans] = useState("500");
  const [assetsDue, setAssetsDue] = useState("0");
  const [otherDeductions, setOtherDeductions] = useState("0");

  // ── Printable metadata ────────────────────────────────────────────────────
  const [employeeName, setEmployeeName] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  // UI state
  const [activeTab, setActiveTab] = useState("form"); // "form" | "preview"
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  // ─── Preset loader ────────────────────────────────────────────────────────
  const applyPreset = (type) => {
    if (type === "standard") {
      setIsCitizen("non_citizen");
      setIsMOHRE("yes");
      setSavingsScheme("no");
      setWorkPattern("full_time");
      setJoiningDate("2022-01-01");
      setLastWorkingDate("2026-01-01");
      setUnpaidAbsenceDays("0");
      setBasicSalary("6000");
      setGrossSalary("9000");
      setSalaryMode("days");
      setWorkedDaysInLastMonth("0"); // final salary already paid in this scenario
      setUnusedLeaveDays("10");
      setIsNoticeServed("yes");
      setRepatriationTicket("1000");
      setOverdueSalary("0");
      setCommissions("0");
      setOtherAdditions("0");
      setLoans("500");
      setAssetsDue("0");
      setOtherDeductions("0");
    } else if (type === "senior") {
      setIsCitizen("non_citizen");
      setIsMOHRE("yes");
      setSavingsScheme("no");
      setWorkPattern("full_time");
      setJoiningDate("2018-05-01");
      setLastWorkingDate(new Date().toISOString().split("T")[0]);
      setUnpaidAbsenceDays("0");
      setBasicSalary("15000");
      setGrossSalary("22000");
      setSalaryMode("days");
      setWorkedDaysInLastMonth("30");
      setUnusedLeaveDays("25");
      setIsNoticeServed("no");
      setWhoBreachedNotice("employer");
      setRequiredNoticeDays("30");
      setServedNoticeDays("0");
      setRepatriationTicket("1500");
      setOverdueSalary("0");
      setCommissions("3000");
      setOtherAdditions("0");
      setLoans("0");
      setAssetsDue("0");
      setOtherDeductions("0");
    }
  };

  // ─── Reset Handler ────────────────────────────────────────────────────────
  const handleReset = () => {
    setIsCitizen("non_citizen");
    setIsMOHRE("yes");
    setSavingsScheme("no");
    setWorkPattern("full_time");
    setJoiningDate("");
    setLastWorkingDate("");
    setUnpaidAbsenceDays("0");
    setBasicSalary("0");
    setGrossSalary("0");
    setSalaryMode("days");
    setWorkedDaysInLastMonth("0");
    setManualSalaryDue("0");
    setUnusedLeaveDays("0");
    setIsNoticeServed("yes");
    setRequiredNoticeDays("30");
    setServedNoticeDays("0");
    setOverdueSalary("0");
    setCommissions("0");
    setRepatriationTicket("0");
    setOtherAdditions("0");
    setLoans("0");
    setAssetsDue("0");
    setOtherDeductions("0");
    setEmployeeName("");
    setEmployerName("");
    setEmployeeId("");
    setActiveTab("form");
  };

  // ─── Calculations ─────────────────────────────────────────────────────────
  const service = useMemo(
    () => calcServiceDuration(joiningDate, lastWorkingDate, unpaidAbsenceDays),
    [joiningDate, lastWorkingDate, unpaidAbsenceDays]
  );

  const calcs = useMemo(() => {
    const basic = toNum(basicSalary);
    const gross = toNum(grossSalary);
    const dailyBasic = basic / 30;
    const dailyGross = gross / 30;

    // 1. Gratuity Calculation (Article 51 of Law 33/2021)
    let rawGratuity = 0;
    let gratuity = 0;
    let isCapped = false;
    let gratuityNote = "";
    const twoYearCap = basic * 24;

    if (isCitizen === "citizen") {
      gratuity = 0;
      gratuityNote = "المواطنون الإماراتيون يخضعون لنظام المعاشات والتأمينات (GPSSA / صندوق أبوظبي) ولا تنطبق عليهم مكافأة الوافدين.";
    } else if (savingsScheme === "yes") {
      gratuity = 0;
      gratuityNote = "الموظف مشمول بنظام الادخار البديل؛ تُصرف مستحقاته من الصندوق الاستثماري مباشرة مع العوائد.";
    } else if (!service.isValid) {
      gratuity = 0;
      gratuityNote = "يُرجى إدخال تواريخ خدمة صحيحة.";
    } else if (service.netYears < 1) {
      gratuity = 0;
      gratuityNote = "مدة الخدمة أقل من سنة كاملة؛ لا تستحق مكافأة نهاية الخدمة نظاماً.";
    } else {
      const firstFive = Math.min(service.netYears, 5);
      const afterFive = Math.max(service.netYears - 5, 0);

      const firstPart = firstFive * 21 * dailyBasic;
      const secondPart = afterFive * 30 * dailyBasic;
      rawGratuity = firstPart + secondPart;

      if (rawGratuity > twoYearCap) {
        gratuity = twoYearCap;
        isCapped = true;
        gratuityNote = "تم تطبيق الحد الأقصى القانوني لمكافأة نهاية الخدمة (أجر سنتين أساسي = 24 شهراً).";
      } else {
        gratuity = rawGratuity;
      }
    }

    // 2. Final Salary Calculation
    let finalSalaryDue = 0;
    if (salaryMode === "days") {
      const days = Math.min(31, toNum(workedDaysInLastMonth));
      finalSalaryDue = days * dailyGross;
    } else {
      finalSalaryDue = toNum(manualSalaryDue);
    }

    // 3. Annual Leave Payout (Basic Salary basis)
    const leaveDays = toNum(unusedLeaveDays);
    const leavePayout = leaveDays * dailyBasic;

    // 4. Notice Period Compensation (Gross Salary basis)
    let noticeAmount = 0;
    let noticeDirection = "none"; // "none" | "to_employee" | "to_employer"
    if (isNoticeServed === "no") {
      const req = toNum(requiredNoticeDays);
      const srv = toNum(servedNoticeDays);
      const rem = Math.max(0, req - srv);
      noticeAmount = rem * dailyGross;
      noticeDirection = whoBreachedNotice === "employer" ? "to_employee" : "to_employer";
    }

    // 5. Other Additions
    const totalAdditions =
      toNum(overdueSalary) +
      toNum(commissions) +
      toNum(repatriationTicket) +
      toNum(otherAdditions);

    // 6. Deductions
    const regularDeductions = toNum(loans) + toNum(assetsDue) + toNum(otherDeductions);
    const noticeDeduction = noticeDirection === "to_employer" ? noticeAmount : 0;
    const totalDeductions = regularDeductions + noticeDeduction;

    // 7. Gross & Net Total Settlement
    const noticeAddition = noticeDirection === "to_employee" ? noticeAmount : 0;
    const grossTotalDues = finalSalaryDue + gratuity + leavePayout + noticeAddition + totalAdditions;
    const netSettlement = Math.max(0, grossTotalDues - totalDeductions);

    return {
      dailyBasic,
      dailyGross,
      rawGratuity,
      gratuity,
      isCapped,
      gratuityNote,
      twoYearCap,
      finalSalaryDue,
      leavePayout,
      noticeAmount,
      noticeDirection,
      totalAdditions,
      regularDeductions,
      totalDeductions,
      grossTotalDues,
      netSettlement,
    };
  }, [
    isCitizen,
    savingsScheme,
    service,
    basicSalary,
    grossSalary,
    salaryMode,
    workedDaysInLastMonth,
    manualSalaryDue,
    unusedLeaveDays,
    isNoticeServed,
    whoBreachedNotice,
    requiredNoticeDays,
    servedNoticeDays,
    overdueSalary,
    commissions,
    repatriationTicket,
    otherAdditions,
    loans,
    assetsDue,
    otherDeductions,
  ]);

  // ─── Print Handler ────────────────────────────────────────────────────────
  const handlePrint = () => {
    setActiveTab("preview");
    setTimeout(() => window.print(), 250);
  };

  const inputCls =
    "w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-sm font-semibold text-ink placeholder:text-ink-muted/50 focus:border-brand focus:outline-none transition";
  const labelCls = "block text-xs font-bold text-ink-secondary mb-1";

  return (
    <div className="rounded-2xl border border-brand-border bg-white shadow-card overflow-hidden" dir="rtl">
      
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-l from-emerald-800 via-teal-900 to-slate-900 px-6 py-5 text-white no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-xl bg-white/10 border border-white/20">📋</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight">
                  حاسبة المخالصة النهائية في الإمارات
                </h1>
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  قانون العمل 2026
                </span>
              </div>
              <p className="text-xs text-teal-200 mt-1">
                تصفية شاملة لمستحقات العامل: مكافأة نهاية الخدمة، كسر الراتب، رصيد الإجازات، وبدل الإنذار
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-teal-200 font-bold hidden sm:inline">أمثلة سريعة:</span>
            <button
              type="button"
              onClick={() => applyPreset("standard")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              مثال: 4 سنوات (6 آلاف)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("senior")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              مثال: خبرة عليا + إنذار
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-5 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === "form"
                ? "bg-white text-emerald-950 shadow-md"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <span>📝</span>
            <span>إدخال بيانات التصفية</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("preview");
              if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === "preview"
                ? "bg-white text-emerald-950 shadow-md"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <span>📄</span>
            <span>معاينة نموذج المخالصة والطباعة</span>
          </button>
        </div>
      </div>

      {/* ══ FORM VIEW ════════════════════════════════════════════════════════ */}
      {activeTab === "form" && (
        <div className="p-4 sm:p-6 space-y-6 no-print">

          {/* ── Section 1: Scope & Status ──────────────────────────────────── */}
          <section className="space-y-3">
            <div className="border-b border-brand-border/60 pb-2">
              <h2 className="text-sm font-extrabold text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-black flex items-center justify-center">
                  ١
                </span>
                صفة الموظف ونطاق العمل القانوني
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>هل الموظف مواطن إماراتي أم غير مواطن؟</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCitizen("non_citizen")}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                      isCitizen === "non_citizen"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm"
                        : "border-brand-border bg-white text-ink-secondary hover:bg-slate-50"
                    }`}
                  >
                    غير مواطن (مقيم)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCitizen("citizen")}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                      isCitizen === "citizen"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm"
                        : "border-brand-border bg-white text-ink-secondary hover:bg-slate-50"
                    }`}
                  >
                    مواطن إماراتي
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>هل يعمل بالقطاع الخاص الخاضع لـ MOHRE؟</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMOHRE("yes")}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                      isMOHRE === "yes"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm"
                        : "border-brand-border bg-white text-ink-secondary hover:bg-slate-50"
                    }`}
                  >
                    نعم (قانون العمل 33)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMOHRE("other")}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                      isMOHRE === "other"
                        ? "border-amber-600 bg-amber-50 text-amber-900 shadow-sm"
                        : "border-brand-border bg-white text-ink-secondary hover:bg-slate-50"
                    }`}
                  >
                    لا / منطقة حرة مالية
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>هل الموظف مشمول بنظام الادخار البديل لمكافأة نهاية الخدمة؟</label>
                <select
                  value={savingsScheme}
                  onChange={(e) => setSavingsScheme(e.target.value)}
                  className={inputCls}
                >
                  <option value="no">لا (نظام المكافأة التراكمي التقليدي)</option>
                  <option value="yes">نعم (مشترك في صناديق نظام الادخار الاستثماري)</option>
                  <option value="uncertain">غير متأكد</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>نوع ونمط العمل</label>
                <select
                  value={workPattern}
                  onChange={(e) => setWorkPattern(e.target.value)}
                  className={inputCls}
                >
                  <option value="full_time">دوام كامل (Full-Time)</option>
                  <option value="part_time">دوام جزئي أو نمط مرن/مؤقت</option>
                </select>
              </div>
            </div>

            {/* Special-case warnings */}
            {isCitizen === "citizen" && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
                <span className="text-base shrink-0">🇦🇪</span>
                <p className="leading-relaxed">
                  <strong>تنبيه للمواطنين:</strong> هذه الحاسبة مخصصة أساساً للعمال غير المواطنين في القطاع الخاص. يخضع المواطنون الإماراتيون لأنظمة المعاشات والتأمينات الاجتماعية (الهيئة العامة للمعاشات GPSSA أو صندوق أبوظبي للتقاعد)، ولا تُحتسب لهم مكافأة نهاية الخدمة العمالية للوافدين تلقائياً.
                </p>
              </div>
            )}

            {isMOHRE === "other" && (
              <div className="rounded-xl border border-blue-300 bg-blue-50 p-3.5 text-xs text-blue-950 flex items-start gap-2.5">
                <span className="text-base shrink-0">🏛️</span>
                <p className="leading-relaxed">
                  <strong>تنبيه للمناطق الحرة والجهات الخاصة:</strong> تخضع المناطق الحرة المالية (مثل مركز دبي المالي العالمي DIFC وسوق أبوظبي العالمي ADGM) لقوانين عمل مستقلة وبرامج ادخار وإيداع إلزامية (مثل نظام DEWS). يرجى مراجعة لوائح جهة العمل المختصة.
                </p>
              </div>
            )}

            {savingsScheme !== "no" && (
              <div className="rounded-xl border border-purple-300 bg-purple-50 p-3.5 text-xs text-purple-950 flex items-start gap-2.5">
                <span className="text-base shrink-0">📈</span>
                <p className="leading-relaxed">
                  <strong>تنبيه نظام الادخار البديل:</strong> إذا كانت المنشأة مسجلة في النظام الاختياري البديل لمكافأة نهاية الخدمة، تُودع اشتراكات شهرية في محافظ وصناديق استثمارية معتمدة؛ وتُستحق أموال الصندوق وعوائدها الاستثمارية مباشرة من مدير الصندوق بدلاً من حساب مكافأة السنوات التراكمية التقليدية.
                </p>
              </div>
            )}

            {workPattern === "part_time" && (
              <div className="rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-800">
                ℹ️ <strong>ملاحظة الدوام الجزئي:</strong> وفق اللائحة التنفيذية لقانون العمل، تُحسب مكافأة نهاية الخدمة للدوام الجزئي بنسبة وتناسب وفق عدد الساعات المنفذة مقارنة بالدوام الكامل، ويلزم مراجعة العقد الفردي.
              </div>
            )}
          </section>

          {/* ── Section 2: Dates & Service Duration ────────────────────────── */}
          <section className="space-y-3">
            <div className="border-b border-brand-border/60 pb-2">
              <h2 className="text-sm font-extrabold text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-black flex items-center justify-center">
                  ٢
                </span>
                تواريخ الخدمة ومدة العمل الفعلية
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>تاريخ بدء العمل <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>آخر يوم عمل <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={lastWorkingDate}
                  onChange={(e) => setLastWorkingDate(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>أيام الغياب بدون راتب <span className="text-gray-400 font-normal">(إن وُجدت)</span></label>
                <input
                  type="number"
                  min="0"
                  value={unpaidAbsenceDays}
                  onChange={(e) => setUnpaidAbsenceDays(e.target.value)}
                  className={inputCls}
                  placeholder="0"
                />
                <p className="text-[10px] text-ink-muted mt-0.5">تُستبعد من مدة الخدمة لحساب المكافأة نظاماً</p>
              </div>
            </div>

            {/* Service Summary Card */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">⏳</span>
                <div>
                  <span className="text-ink-secondary">صافي مدة الخدمة المحتسبة: </span>
                  <strong className="text-emerald-950 font-black text-sm">{service.formatted}</strong>
                </div>
              </div>
              {service.isValid && (
                <span className="text-emerald-800 font-semibold bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                  {service.netYears.toFixed(2)} سنة خدمة فعلية
                </span>
              )}
            </div>
          </section>

          {/* ── Section 3: Salary Details ──────────────────────────────────── */}
          <section className="space-y-3">
            <div className="border-b border-brand-border/60 pb-2">
              <h2 className="text-sm font-extrabold text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-black flex items-center justify-center">
                  ٣
                </span>
                بيانات الأجر (الأساسي والإجمالي)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  الراتب الأساسي الأخير (Basic Salary) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                  className={inputCls}
                  placeholder="مثال: 6000"
                />
                <p className="text-[11px] text-ink-muted mt-1">
                  تُحسب عليه مكافأة نهاية الخدمة وبدل رصيد الإجازات السنوية (المادة 51)
                </p>
              </div>

              <div>
                <label className={labelCls}>
                  الراتب الإجمالي الأخير (Gross Salary) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(e.target.value)}
                  className={inputCls}
                  placeholder="مثال: 9000"
                />
                <p className="text-[11px] text-ink-muted mt-1">
                  يشمل الأساسي والبدلات (السكن، النقل)؛ تُحسب عليه تعويضات الإنذار والراتب المتبقي
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-brand-border/60">
              <div>
                <span className="text-ink-muted block">أجر اليوم الأساسي (الأساسي ÷ 30):</span>
                <strong className="text-ink font-mono text-sm">{fmt(calcs.dailyBasic)} AED</strong>
              </div>
              <div>
                <span className="text-ink-muted block">أجر اليوم الإجمالي (الإجمالي ÷ 30):</span>
                <strong className="text-ink font-mono text-sm">{fmt(calcs.dailyGross)} AED</strong>
              </div>
            </div>
          </section>

          {/* ── Section 4: Final Month Outstanding Salary ──────────────────── */}
          <section className="space-y-3">
            <div className="border-b border-brand-border/60 pb-2">
              <h2 className="text-sm font-extrabold text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-black flex items-center justify-center">
                  ٤
                </span>
                الراتب المستحق عن آخر فترة عمل (كسر الشهر)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>طريقة احتساب الراتب المتبقي:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSalaryMode("days")}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                      salaryMode === "days"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm"
                        : "border-brand-border bg-white text-ink-secondary hover:bg-slate-50"
                    }`}
                  >
                    حسب عدد الأيام
                  </button>
                  <button
                    type="button"
                    onClick={() => setSalaryMode("amount")}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                      salaryMode === "amount"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm"
                        : "border-brand-border bg-white text-ink-secondary hover:bg-slate-50"
                    }`}
                  >
                    إدخال مبلغ محدد
                  </button>
                </div>
              </div>

              {salaryMode === "days" ? (
                <div>
                  <label className={labelCls}>أيام العمل المستحقة في الشهر الأخير (0–31):</label>
                  <input
                    type="number"
                    min="0"
                    max="31"
                    value={workedDaysInLastMonth}
                    onChange={(e) => setWorkedDaysInLastMonth(e.target.value)}
                    className={inputCls}
                  />
                  <p className="text-[10px] text-ink-muted mt-1">
                    يُحسب على أساس الأجر الإجمالي وقسمة الشهر على 30 يوماً ({fmt(calcs.dailyGross)} AED/يوم)
                  </p>
                </div>
              ) : (
                <div>
                  <label className={labelCls}>المبلغ الصافي المستحق عن الراتب الأخير (AED):</label>
                  <input
                    type="number"
                    min="0"
                    value={manualSalaryDue}
                    onChange={(e) => setManualSalaryDue(e.target.value)}
                    className={inputCls}
                  />
                </div>
              )}
            </div>

            <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-brand-border/60 flex justify-between items-center">
              <span className="text-ink-secondary">قيمة راتب آخر شهر المحتسبة:</span>
              <strong className="text-emerald-800 font-bold text-sm font-mono">
                {fmt(calcs.finalSalaryDue)} AED
              </strong>
            </div>
          </section>

          {/* ── Section 5: Annual Leave Payout ─────────────────────────────── */}
          <section className="space-y-3">
            <div className="border-b border-brand-border/60 pb-2">
              <h2 className="text-sm font-extrabold text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-black flex items-center justify-center">
                  ٥
                </span>
                بدل رصيد الإجازة السنوية غير المستخدمة
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className={labelCls}>عدد أيام رصيد الإجازات المتبقية والمستحقة:</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={unusedLeaveDays}
                  onChange={(e) => setUnusedLeaveDays(e.target.value)}
                  className={inputCls}
                  placeholder="مثال: 10"
                />
                <p className="text-[10px] text-ink-muted mt-1">
                  يُحسب التعويض النقدي لرصيد الإجازات نظاماً على أساس **الراتب الأساسي** (أجر اليوم: {fmt(calcs.dailyBasic)} AED)
                </p>
              </div>

              <div className="rounded-xl border border-brand-border/70 bg-slate-50 p-3 text-xs space-y-1">
                <span className="text-ink-muted block">بدل رصيد الإجازة المستحق:</span>
                <strong className="text-emerald-800 font-black text-base font-mono block">
                  {fmt(calcs.leavePayout)} AED
                </strong>
                <span className="text-[10px] text-ink-secondary block">
                  معادلة: {unusedLeaveDays || 0} يوم × {fmt(calcs.dailyBasic)} درهم
                </span>
              </div>
            </div>
          </section>

          {/* ── Section 6: Notice Period ───────────────────────────────────── */}
          <section className="space-y-3">
            <div className="border-b border-brand-border/60 pb-2">
              <h2 className="text-sm font-extrabold text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-black flex items-center justify-center">
                  ٦
                </span>
                فترة الإنذار والتعويض عنها
              </h2>
            </div>

            <div>
              <label className={labelCls}>هل تم الالتزام بفترة الإنذار المتفق عليها كاملة؟</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsNoticeServed("yes")}
                  className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                    isNoticeServed === "yes"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm"
                      : "border-brand-border bg-white text-ink-secondary hover:bg-slate-50"
                  }`}
                >
                  نعم (تم إكمال الإنذار ولا يوجد تعويض)
                </button>
                <button
                  type="button"
                  onClick={() => setIsNoticeServed("no")}
                  className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                    isNoticeServed === "no"
                      ? "border-amber-600 bg-amber-50 text-amber-900 shadow-sm"
                      : "border-brand-border bg-white text-ink-secondary hover:bg-slate-50"
                  }`}
                >
                  لا (يوجد إخلال أو إنهاء فوري)
                </button>
              </div>
            </div>

            {isNoticeServed === "no" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>من الطرف الذي لم يلتزم بالإنذار؟</label>
                    <select
                      value={whoBreachedNotice}
                      onChange={(e) => setWhoBreachedNotice(e.target.value)}
                      className={inputCls}
                    >
                      <option value="employer">صاحب العمل (تعويض لصالح الموظف +)</option>
                      <option value="employee">الموظف (خصم من مستحقات الموظف −)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>مدة الإنذار التعاقدية (أيام):</label>
                    <input
                      type="number"
                      min="30"
                      max="90"
                      value={requiredNoticeDays}
                      onChange={(e) => setRequiredNoticeDays(e.target.value)}
                      className={inputCls}
                    />
                    <p className="text-[10px] text-ink-muted mt-0.5">القانون يحددها بين 30 إلى 90 يوماً</p>
                  </div>
                  <div>
                    <label className={labelCls}>الأيام المنجزة فعلياً من الإنذار:</label>
                    <input
                      type="number"
                      min="0"
                      value={servedNoticeDays}
                      onChange={(e) => setServedNoticeDays(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-amber-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold">
                      {calcs.noticeDirection === "to_employee"
                        ? "بدل الإنذار المستحق لصالح الموظف (+):"
                        : "بدل الإنذار الواجب خصمه لصالح صاحب العمل (−):"}
                    </span>
                    <p className="text-[10px] text-ink-muted mt-0.5">
                      يُحسب على أساس الأجر الإجمالي الأخير ({fmt(calcs.dailyGross)} AED/يوم)
                    </p>
                  </div>
                  <strong
                    className={`font-mono text-sm font-black ${
                      calcs.noticeDirection === "to_employee" ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {calcs.noticeDirection === "to_employee" ? "+" : "−"} {fmt(calcs.noticeAmount)} AED
                  </strong>
                </div>
              </div>
            )}
          </section>

          {/* ── Section 7: Other Additions & Deductions ─────────────────────── */}
          <section className="space-y-4">
            <div className="border-b border-brand-border/60 pb-2">
              <h2 className="text-sm font-extrabold text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-black flex items-center justify-center">
                  ٧
                </span>
                مستحقات إضافية وخصومات
              </h2>
            </div>

            {/* Additions */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
              <h3 className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                <span>➕</span> مستحقات وإضافات أخرى للموظف:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className={labelCls}>رواتب متأخرة سابقة (AED)</label>
                  <input
                    type="number"
                    min="0"
                    value={overdueSalary}
                    onChange={(e) => setOverdueSalary(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>عمولات أو مكافآت (AED)</label>
                  <input
                    type="number"
                    min="0"
                    value={commissions}
                    onChange={(e) => setCommissions(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>بدل تذكرة العودة (AED)</label>
                  <input
                    type="number"
                    min="0"
                    value={repatriationTicket}
                    onChange={(e) => setRepatriationTicket(e.target.value)}
                    className={inputCls}
                  />
                  <p className="text-[10px] text-ink-muted mt-0.5">اختياري بحسب شروط عقد العمل والمغادرة</p>
                </div>
                <div>
                  <label className={labelCls}>مستحقات أخرى (AED)</label>
                  <input
                    type="number"
                    min="0"
                    value={otherAdditions}
                    onChange={(e) => setOtherAdditions(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 space-y-3">
              <h3 className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                <span>➖</span> استقطاعات وخصومات على الموظف:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>سلف وقروض متبقية (AED)</label>
                  <input
                    type="number"
                    min="0"
                    value={loans}
                    onChange={(e) => setLoans(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>عهد أو مبالغ مستحقة للشركة (AED)</label>
                  <input
                    type="number"
                    min="0"
                    value={assetsDue}
                    onChange={(e) => setAssetsDue(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>خصومات أخرى (AED)</label>
                  <input
                    type="number"
                    min="0"
                    value={otherDeductions}
                    onChange={(e) => setOtherDeductions(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Summary & Grand Total Card ─────────────────────────────────── */}
          <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
              <h3 className="text-sm font-black text-ink">📊 ملخص بنود التصفية العمالية التقديرية</h3>
              <span className="text-xs text-emerald-800 font-bold">الدرهم الإماراتي (AED)</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-ink">
                <span>1. الراتب المستحق عن آخر فترة:</span>
                <span className="font-mono font-bold">{fmt(calcs.finalSalaryDue)} AED</span>
              </div>

              <div className="flex justify-between items-center text-ink">
                <div>
                  <span>2. مكافأة نهاية الخدمة (قانون 33):</span>
                  {calcs.isCapped && (
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mr-1.5">
                      مطابق لسقف السنتين
                    </span>
                  )}
                </div>
                <span className="font-mono font-bold text-emerald-800">{fmt(calcs.gratuity)} AED</span>
              </div>
              {calcs.gratuityNote && (
                <p className="text-[11px] text-ink-muted -mt-1 pr-3">{calcs.gratuityNote}</p>
              )}

              <div className="flex justify-between items-center text-ink">
                <span>3. بدل رصيد الإجازات السنوية:</span>
                <span className="font-mono font-bold">{fmt(calcs.leavePayout)} AED</span>
              </div>

              {calcs.noticeDirection === "to_employee" && (
                <div className="flex justify-between items-center text-emerald-800 font-bold">
                  <span>4. بدل الإنذار (لصالح الموظف):</span>
                  <span className="font-mono">+{fmt(calcs.noticeAmount)} AED</span>
                </div>
              )}

              {calcs.totalAdditions > 0 && (
                <div className="flex justify-between items-center text-ink">
                  <span>5. مستحقات وإضافات أخرى:</span>
                  <span className="font-mono font-bold">+{fmt(calcs.totalAdditions)} AED</span>
                </div>
              )}

              {calcs.totalDeductions > 0 && (
                <div className="flex justify-between items-center text-rose-700 font-bold border-t border-emerald-100/80 pt-1.5">
                  <span>6. إجمالي الخصومات والاستقطاعات:</span>
                  <span className="font-mono">- {fmt(calcs.totalDeductions)} AED</span>
                </div>
              )}

              <div className="border-t-2 border-emerald-300 pt-3 flex justify-between items-center text-sm font-black text-ink">
                <span>صافي المخالصة النهائية التقديرية:</span>
                <span className="text-xl font-black text-emerald-800 font-mono">
                  {fmt(calcs.netSettlement)} AED
                </span>
              </div>
            </div>

            {/* Expandable Explanation */}
            <div className="border-t border-emerald-100 pt-2">
              <button
                type="button"
                onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <span>🔍 كيف تم الحساب والمعادلات القانونية؟</span>
                <span>{showFormulaDetails ? "▲" : "▼"}</span>
              </button>

              {showFormulaDetails && (
                <div className="mt-3 p-3 rounded-xl bg-white border border-emerald-100 space-y-2 text-xs text-ink-secondary">
                  <p>
                    • <strong>مكافأة نهاية الخدمة:</strong> تقسم على أساس الأجر اليومي الأساسي ({fmt(calcs.dailyBasic)} درهم):
                    أجر 21 يوماً عن كل سنة من السنوات الخمس الأولى، و30 يوماً عن كل سنة بعدها، مع سقف أقصى لا يتجاوز أجر سنتين ({fmt(calcs.twoYearCap)} درهم).
                  </p>
                  <p>
                    • <strong>بدل الإجازة السنوية:</strong> يحسب حصراً على الراتب الأساسي الأخير ({fmt(calcs.dailyBasic)} درهم × {unusedLeaveDays} يوم).
                  </p>
                  <p>
                    • <strong>بدل الإنذار:</strong> يحسب على الأجر الإجمالي الكامل شاملاً البدلات ({fmt(calcs.dailyGross)} درهم/يوم).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Action Buttons ────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("preview");
                if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex-1 min-w-[140px] rounded-xl bg-emerald-700 py-3 text-sm font-extrabold text-white hover:bg-emerald-800 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>📄</span>
              <span>معاينة نموذج المخالصة</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 min-w-[140px] rounded-xl border-2 border-emerald-700 bg-white py-3 text-sm font-extrabold text-emerald-800 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
            >
              <span>🖨️</span>
              <span>طباعة المخالصة (A4 / PDF)</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-ink-secondary hover:bg-gray-50 transition-colors"
            >
              🔄 إعادة تعيين
            </button>
          </div>
        </div>
      )}

      {/* ══ PREVIEW & PRINT VIEW ════════════════════════════════════════════ */}
      <div className={`${activeTab === "preview" ? "block" : "hidden"} print:block p-4 sm:p-6`}>
        
        {/* Navigation & Print Top Bar (hidden during print) */}
        <div className="flex items-center justify-between gap-3 mb-6 no-print bg-slate-100 p-3 rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-ink hover:bg-gray-50 transition"
          >
            <span>←</span>
            <span>العودة لتعديل البيانات</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-5 py-2 text-xs font-extrabold text-white hover:bg-emerald-900 transition shadow-sm"
          >
            <span>🖨️</span>
            <span>طباعة المستند أو تصدير كـ PDF</span>
          </button>
        </div>

        {/* ═══ Physical A4 Document ═════════════════════════════════════════ */}
        <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 sm:p-8 text-black print:border-0 print:p-0 print:m-0 print:shadow-none print:w-full print:max-w-none">
          
          {/* Header */}
          <div className="border-b-2 border-black pb-4 mb-5 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-black">
              نموذج مخالصة نهائية تقديرية
            </h2>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-0.5">
              Estimated Final Settlement Statement
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              دولة الإمارات العربية المتحدة — قطاع خاص (وفق مرسوم قانون تنظيم علاقات العمل رقم 33 لسنة 2021)
            </p>
          </div>

          {/* Metadata Inputs in Print View */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200 print:bg-transparent print:border-gray-300">
            <div>
              <span className="text-gray-500 block">اسم الموظف / Employee Name:</span>
              <input
                type="text"
                placeholder="أدخل اسم الموظف..."
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full bg-transparent font-bold text-black border-b border-dashed border-gray-400 focus:outline-none text-xs py-0.5 print:border-none"
              />
            </div>
            <div>
              <span className="text-gray-500 block">اسم المنشأة / Company:</span>
              <input
                type="text"
                placeholder="أدخل اسم الشركة..."
                value={employerName}
                onChange={(e) => setEmployerName(e.target.value)}
                className="w-full bg-transparent font-bold text-black border-b border-dashed border-gray-400 focus:outline-none text-xs py-0.5 print:border-none"
              />
            </div>
            <div>
              <span className="text-gray-500 block">الرقم الوظيفي / Employee ID:</span>
              <input
                type="text"
                placeholder="اختياري..."
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full bg-transparent font-bold text-black border-b border-dashed border-gray-400 focus:outline-none text-xs py-0.5 print:border-none"
              />
            </div>
          </div>

          {/* Service & Wage Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-gray-200 mb-5 print:bg-gray-100">
            <div>
              <span className="text-gray-500 block">تاريخ بدء العمل:</span>
              <span className="font-bold text-black font-mono">{joiningDate || "—"}</span>
            </div>
            <div>
              <span className="text-gray-500 block">آخر يوم عمل:</span>
              <span className="font-bold text-black font-mono">{lastWorkingDate || "—"}</span>
            </div>
            <div>
              <span className="text-gray-500 block">مدة الخدمة الفعلية:</span>
              <span className="font-bold text-black">{service.formatted}</span>
            </div>
            <div>
              <span className="text-gray-500 block">تاريخ الاحتساب:</span>
              <span className="font-bold text-black font-mono">{new Date().toISOString().split("T")[0]}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs border border-gray-200 rounded-xl p-3 mb-5">
            <div>
              <span className="text-gray-500">الراتب الأساسي الأخير:</span>
              <strong className="text-black font-mono font-bold mr-1.5">{fmt(basicSalary)} AED</strong>
            </div>
            <div>
              <span className="text-gray-500">الراتب الإجمالي الأخير:</span>
              <strong className="text-black font-mono font-bold mr-1.5">{fmt(grossSalary)} AED</strong>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-black text-white print:bg-black print:text-white">
                  <th className="p-2 text-right">#</th>
                  <th className="p-2 text-right">بيان الاستحقاق / التفصيل</th>
                  <th className="p-2 text-center">النوع</th>
                  <th className="p-2 text-left">المبلغ بالدرهم (AED)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="border-b border-gray-200">
                  <td className="p-2 font-mono text-gray-500">1</td>
                  <td className="p-2">
                    <p className="font-bold text-black">الراتب المستحق عن آخر شهر / كسر الشهر</p>
                    <p className="text-[10px] text-gray-500">محسوب حسب الأجر الإجمالي</p>
                  </td>
                  <td className="p-2 text-center font-bold text-emerald-800">مستحق (+)</td>
                  <td className="p-2 font-mono text-left font-bold">{fmt(calcs.finalSalaryDue)}</td>
                </tr>

                <tr className="border-b border-gray-200">
                  <td className="p-2 font-mono text-gray-500">2</td>
                  <td className="p-2">
                    <p className="font-bold text-black">مكافأة نهاية الخدمة (قانون تنظيم علاقات العمل رقم 33)</p>
                    <p className="text-[10px] text-gray-500">
                      {service.netYears.toFixed(2)} سنة خدمة — محسوبة على الراتب الأساسي ({fmt(calcs.dailyBasic)} AED/يوم)
                      {calcs.isCapped && " [مطابق لسقف أجر سنتين]"}
                    </p>
                  </td>
                  <td className="p-2 text-center font-bold text-emerald-800">مستحق (+)</td>
                  <td className="p-2 font-mono text-left font-bold">{fmt(calcs.gratuity)}</td>
                </tr>

                <tr className="border-b border-gray-200">
                  <td className="p-2 font-mono text-gray-500">3</td>
                  <td className="p-2">
                    <p className="font-bold text-black">بدل رصيد الإجازات السنوية غير المستخدمة</p>
                    <p className="text-[10px] text-gray-500">
                      {unusedLeaveDays || 0} يوم × الراتب الأساسي اليومي ({fmt(calcs.dailyBasic)} AED)
                    </p>
                  </td>
                  <td className="p-2 text-center font-bold text-emerald-800">مستحق (+)</td>
                  <td className="p-2 font-mono text-left font-bold">{fmt(calcs.leavePayout)}</td>
                </tr>

                {calcs.noticeDirection === "to_employee" && (
                  <tr className="border-b border-gray-200">
                    <td className="p-2 font-mono text-gray-500">4</td>
                    <td className="p-2">
                      <p className="font-bold text-black">تعويض بدل مهلة الإنذار (لصالح الموظف)</p>
                      <p className="text-[10px] text-gray-500">عدم التزام صاحب العمل بفترة الإنذار كاملة</p>
                    </td>
                    <td className="p-2 text-center font-bold text-emerald-800">مستحق (+)</td>
                    <td className="p-2 font-mono text-left font-bold">{fmt(calcs.noticeAmount)}</td>
                  </tr>
                )}

                {calcs.totalAdditions > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="p-2 font-mono text-gray-500">5</td>
                    <td className="p-2">
                      <p className="font-bold text-black">مستحقات وإضافات أخرى (رواتب سابقة / عمولات / تذكرة عودة)</p>
                    </td>
                    <td className="p-2 text-center font-bold text-emerald-800">مستحق (+)</td>
                    <td className="p-2 font-mono text-left font-bold">{fmt(calcs.totalAdditions)}</td>
                  </tr>
                )}

                {calcs.totalDeductions > 0 && (
                  <tr className="border-b border-gray-200 bg-rose-50/40">
                    <td className="p-2 font-mono text-gray-500">6</td>
                    <td className="p-2">
                      <p className="font-bold text-rose-900">إجمالي الخصومات والاستقطاعات</p>
                      <p className="text-[10px] text-rose-700">
                        سلف: {fmt(loans)} AED | عهد: {fmt(assetsDue)} AED
                        {calcs.noticeDirection === "to_employer" && ` | بدل إنذار لصالح الشركة: ${fmt(calcs.noticeAmount)} AED`}
                        {toNum(otherDeductions) > 0 && ` | أخرى: ${fmt(otherDeductions)} AED`}
                      </p>
                    </td>
                    <td className="p-2 text-center font-bold text-rose-800">خصم (−)</td>
                    <td className="p-2 font-mono text-left font-bold text-rose-800">- {fmt(calcs.totalDeductions)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Grand Total Box */}
          <div className="flex justify-end mb-6">
            <div className="w-full sm:w-80 border-2 border-black rounded-xl p-3.5 space-y-2 bg-gray-50 print:bg-transparent">
              <div className="flex justify-between text-xs text-gray-700">
                <span>إجمالي المستحقات:</span>
                <span className="font-mono font-bold">{fmt(calcs.grossTotalDues)} AED</span>
              </div>
              {calcs.totalDeductions > 0 && (
                <div className="flex justify-between text-xs text-rose-700">
                  <span>إجمالي الخصومات:</span>
                  <span className="font-mono font-bold">- {fmt(calcs.totalDeductions)} AED</span>
                </div>
              )}
              <div className="border-t-2 border-black pt-2 flex justify-between items-center text-sm font-black text-black">
                <span>صافي المخالصة النهائية:</span>
                <span className="font-mono text-base font-black">{fmt(calcs.netSettlement)} AED</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="border-t border-gray-300 pt-6 mt-8 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="font-bold text-black mb-6">توقيع الموظف / Employee Signature:</p>
              <div className="border-b border-black w-48 mb-1"></div>
              <p className="text-[10px] text-gray-500">التاريخ: ___ / ___ / 2026م</p>
            </div>
            <div className="text-left">
              <p className="font-bold text-black mb-6">ختم وتوقيع المنشأة / Employer Stamp & Signature:</p>
              <div className="border-b border-black w-48 mb-1 mr-auto"></div>
              <p className="text-[10px] text-gray-500">التاريخ: ___ / ___ / 2026م</p>
            </div>
          </div>

          {/* Print Disclaimer */}
          <div className="border-t border-gray-200 pt-4 mt-6 text-center text-[10px] text-gray-500 leading-relaxed">
            <p className="font-bold text-gray-700">
              إخلاء مسؤولية رسمي
            </p>
            <p className="mt-0.5">
              هذه الحاسبة تقديرية وتعتمد على البيانات التي يدخلها المستخدم، ولا تمثل قراراً رسمياً من وزارة الموارد البشرية والتوطين (MOHRE) أو حكماً قانونياً نهائياً. قد تختلف المستحقات بحسب نوع العقد، نمط العمل، جهة الاختصاص، نظام الادخار البديل، أو الظروف الخاصة بإنهاء العلاقة العمالية.
            </p>
            <p className="mt-0.5 font-mono text-[9px] text-gray-400">
              arabic-tools-xi.vercel.app/ar/ae/final-settlement-calculator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
