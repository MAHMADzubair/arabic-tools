"use client";

import { useState, useMemo } from "react";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function toNum(v) {
  const n = parseFloat(String(v));
  return isNaN(n) || n < 0 ? 0 : n;
}

function fmt(n) {
  return n.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Total fractional months between two date strings, pro-rata for partial month */
function calcServiceMonths(startStr, endStr) {
  const s = new Date(startStr);
  const e = new Date(endStr);
  if (isNaN(s) || isNaN(e) || e <= s) return 0;

  let years = e.getFullYear() - s.getFullYear();
  let months = e.getMonth() - s.getMonth();
  let days = e.getDate() - s.getDate();

  let totalMonths = years * 12 + months;
  if (days >= 0) {
    totalMonths += days / 30;
  } else {
    const daysInPrevMonth = new Date(e.getFullYear(), e.getMonth(), 0).getDate();
    totalMonths -= 1;
    totalMonths += (daysInPrevMonth + days) / daysInPrevMonth;
  }
  return Math.max(0, totalMonths);
}

/** Day-of-month from lastWorkingDate = days worked in the last (partial) month */
function getLastMonthDays(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  return isNaN(d) ? 0 : d.getDate();
}

function formatDuration(totalMonths) {
  const years = Math.floor(totalMonths / 12);
  const months = Math.floor(totalMonths % 12);
  const days = Math.round(((totalMonths % 12) - months) * 30);
  let parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "سنة" : "سنوات"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "شهر" : "أشهر"}`);
  if (days > 0 && years === 0) parts.push(`${days} يوماً`);
  return parts.length ? parts.join(" و") : "أقل من شهر";
}

// ─── Sub-Components ────────────────────────────────────────────────────────────
function SectionHeader({ num, title, icon }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-brand-border/60 pb-3 mb-1">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white text-sm font-extrabold">
        {num}
      </div>
      <span className="text-xl">{icon}</span>
      <h2 className="text-base font-extrabold text-ink">{title}</h2>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink-secondary mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink-muted/50 focus:border-brand focus:outline-none"
      />
    </div>
  );
}

function NumInput({ label, value, onChange, min = 0, note }) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink-secondary mb-1">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        className="w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-sm font-medium text-ink focus:border-brand focus:outline-none"
      />
      {note && <p className="mt-1 text-[11px] text-ink-muted">{note}</p>}
    </div>
  );
}

function DateInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink-secondary mb-1">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-sm font-semibold text-ink focus:border-brand focus:outline-none"
      />
    </div>
  );
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 2)}, 1fr)` }}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-xl border p-2.5 text-xs font-semibold text-right transition-all ${
            value === opt.id
              ? "border-brand bg-brand-light text-brand-dark shadow-sm font-bold"
              : "border-brand-border bg-white text-ink-secondary hover:border-brand-200 hover:bg-slate-50"
          }`}
        >
          {opt.label}
          {opt.desc && <span className="block text-[10px] font-normal text-ink-muted mt-0.5">{opt.desc}</span>}
        </button>
      ))}
    </div>
  );
}

function WageStatCard({ label, value, highlight }) {
  return (
    <div className={`rounded-xl p-3 ${highlight ? "bg-white border-2 border-brand shadow-sm" : "bg-white/70 border border-brand-border/60"}`}>
      <p className="text-[11px] text-ink-muted font-medium truncate">{label}</p>
      <p className={`text-sm font-extrabold mt-0.5 ${highlight ? "text-brand-dark" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function BreakdownRow({ label, sub, amount, type = "add" }) {
  const isNet = type === "net";
  const isGross = type === "gross";
  const isDeduct = type === "deduct";

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-xl px-3 py-2.5 ${
        isNet
          ? "bg-hero-gradient text-white"
          : isGross
          ? "bg-brand-surface border border-brand-border font-bold"
          : isDeduct
          ? "bg-rose-50/60 border border-rose-100"
          : "hover:bg-slate-50/60"
      }`}
    >
      <div className="min-w-0">
        <p className={`text-sm font-bold leading-tight ${isNet ? "text-white" : isDeduct ? "text-rose-700" : "text-ink"}`}>{label}</p>
        {sub && <p className={`text-[11px] mt-0.5 ${isNet ? "text-white/75" : "text-ink-muted"}`}>{sub}</p>}
      </div>
      <p
        className={`shrink-0 font-extrabold text-right ${
          isNet ? "text-white text-lg" : isGross ? "text-brand-dark" : isDeduct ? "text-rose-700" : "text-ink"
        }`}
      >
        {isDeduct && amount > 0 ? "−" : ""}
        {fmt(Math.abs(amount))} <span className="text-xs font-bold">ر.س</span>
      </p>
    </div>
  );
}

function CalcExplain({ title, formula, law }) {
  return (
    <div className="rounded-lg border border-brand-border/50 bg-white p-3 space-y-1">
      <p className="text-xs font-bold text-brand-dark">{title}</p>
      <p className="font-mono text-[11px] text-ink leading-relaxed">{formula}</p>
      <p className="text-[11px] text-ink-muted">📜 {law}</p>
    </div>
  );
}

function DocTableRow({ label, value, isGross, isDeduct, isNet }) {
  return (
    <tr
      className={
        isNet
          ? "bg-brand text-white font-black"
          : isGross
          ? "bg-slate-100 font-bold"
          : isDeduct
          ? "text-rose-700"
          : ""
      }
    >
      <td className="px-3 py-2.5 border border-slate-200 text-sm">{label}</td>
      <td className="px-3 py-2.5 border border-slate-200 text-sm text-left font-semibold">{value}</td>
    </tr>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function FinalSettlementCalculator() {
  // — Employee Info —
  const [employeeName, setEmployeeName] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [position, setPosition] = useState("");

  // — Contract —
  const [contractType, setContractType] = useState("indefinite");
  const [terminationReason, setTerminationReason] = useState("terminate");
  const [joiningDate, setJoiningDate] = useState("2021-01-01");
  const [lastWorkingDate, setLastWorkingDate] = useState(new Date().toISOString().slice(0, 10));

  // — Wage —
  const [basicSalary, setBasicSalary] = useState("8000");
  const [housingAllowance, setHousingAllowance] = useState("2000");
  const [transportAllowance, setTransportAllowance] = useState("1000");
  const [otherAllowances, setOtherAllowances] = useState("0");
  const [monthlyDivisor, setMonthlyDivisor] = useState("30");

  // — Annual Leave —
  const [unusedLeaveDays, setUnusedLeaveDays] = useState("0");
  const [leaveWageBase, setLeaveWageBase] = useState("actual");

  // — Notice Period —
  const [noticeRequired, setNoticeRequired] = useState("60");
  const [noticeServed, setNoticeServed] = useState("0");

  // — Other Additions —
  const [unpaidSalary, setUnpaidSalary] = useState("0");
  const [overtimeAmount, setOvertimeAmount] = useState("0");
  const [bonuses, setBonuses] = useState("0");
  const [otherAdditions, setOtherAdditions] = useState("0");

  // — Deductions —
  const [loans, setLoans] = useState("0");
  const [companyAssets, setCompanyAssets] = useState("0");
  const [otherDeductions, setOtherDeductions] = useState("0");

  // — UI State —
  const [showDocument, setShowDocument] = useState(false);
  const [expandedCalc, setExpandedCalc] = useState(false);

  // ─── Core Calculation ──────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const basic = toNum(basicSalary);
    const housing = toNum(housingAllowance);
    const transport = toNum(transportAllowance);
    const other = toNum(otherAllowances);
    const totalWage = basic + housing + transport + other;
    const divisor = toNum(monthlyDivisor) || 30;
    const dailyWage = totalWage / divisor;

    // Service Duration
    const serviceMonths = calcServiceMonths(joiningDate, lastWorkingDate);
    const serviceYears = serviceMonths / 12;

    // ── Block 1: Last Month Partial Salary ────────────────────────────────────
    const daysWorked = getLastMonthDays(lastWorkingDate);
    const lastMonthPay = dailyWage * daysWorked;

    // ── Block 2: EOSB — Article 84 + 85 ──────────────────────────────────────
    const y1 = Math.min(serviceYears, 5);
    const y2 = Math.max(0, serviceYears - 5);
    const fullGratuity = totalWage * 0.5 * y1 + totalWage * 1.0 * y2;

    let esobPercent = 1.0;
    let esobNote = "";
    if (["terminate", "retire", "mutual", "fixed_expired"].includes(terminationReason)) {
      esobPercent = 1.0;
      esobNote = "استحقاق كامل (100٪) وفق المادة (84) من نظام العمل";
    } else if (terminationReason === "female_special") {
      esobPercent = 1.0;
      esobNote = "استحقاق كامل استثنائي بموجب المادة (87) من نظام العمل";
    } else if (terminationReason === "resign") {
      if (serviceYears < 2) {
        esobPercent = 0;
        esobNote = "لا يستحق مكافأة — الاستقالة قبل اكتمال سنتين خدمة (م/85)";
      } else if (serviceYears < 5) {
        esobPercent = 1 / 3;
        esobNote = `ثلث المكافأة (33.3٪) — استقالة بين سنتين و5 سنوات (م/85)`;
      } else if (serviceYears < 10) {
        esobPercent = 2 / 3;
        esobNote = `ثلثا المكافأة (66.7٪) — استقالة بين 5 و10 سنوات (م/85)`;
      } else {
        esobPercent = 1.0;
        esobNote = `المكافأة كاملة (100٪) — الاستقالة بعد 10 سنوات أو أكثر (م/85)`;
      }
    }
    const eosb = fullGratuity * esobPercent;

    // ── Block 3: Annual Leave — Article 111 ───────────────────────────────────
    const leaveDays = toNum(unusedLeaveDays);
    const leaveBase = leaveWageBase === "basic" ? basic : totalWage;
    const leaveDailyRate = leaveBase / divisor;
    const leavePay = leaveDays * leaveDailyRate;

    // ── Block 4: Notice Period — Articles 75/76 ───────────────────────────────
    let noticePay = 0;
    let noticeNote = "";
    let missedDays = 0;
    if (contractType === "indefinite") {
      const required = toNum(noticeRequired);
      const served = Math.min(toNum(noticeServed), required);
      missedDays = Math.max(0, required - served);
      noticePay = dailyWage * missedDays;
      if (required === 0) {
        noticeNote = "لم تُحدد مهلة إشعار";
      } else if (missedDays === 0) {
        noticeNote = "فترة الإشعار خُدمت كاملة — لا تعويض إضافي";
      } else {
        noticeNote = `تعويض عن ${missedDays} يوماً من فترة الإشعار غير المخدومة`;
      }
    } else {
      noticeNote = "عقد محدد المدة — أحكام مهلة الإشعار (م/75) لا تنطبق";
    }

    // ── Block 5: Other Additions & Deductions ─────────────────────────────────
    const addTotal =
      toNum(unpaidSalary) + toNum(overtimeAmount) + toNum(bonuses) + toNum(otherAdditions);
    const dedTotal = toNum(loans) + toNum(companyAssets) + toNum(otherDeductions);

    // ── Grand Totals ──────────────────────────────────────────────────────────
    const grossDues = lastMonthPay + eosb + leavePay + noticePay + addTotal;
    const netSettlement = grossDues - dedTotal;

    return {
      // Wage
      totalWage, basic, daily: dailyWage, divisor,
      // Service
      serviceMonths, serviceYears,
      serviceDurationLabel: formatDuration(serviceMonths),
      // Block 1
      daysWorked, lastMonthPay,
      // Block 2
      eosb, fullGratuity, esobPercent, esobNote, y1, y2,
      y1Full: totalWage * 0.5 * y1,
      y2Full: totalWage * 1.0 * y2,
      // Block 3
      leaveDays, leaveDailyRate, leavePay, leaveBase,
      // Block 4
      noticePay, noticeNote, missedDays,
      required: toNum(noticeRequired),
      // Block 5
      addTotal, dedTotal,
      unpaidSalary: toNum(unpaidSalary),
      overtimeAmount: toNum(overtimeAmount),
      bonuses: toNum(bonuses),
      otherAdditions: toNum(otherAdditions),
      loans: toNum(loans),
      companyAssets: toNum(companyAssets),
      otherDeductions: toNum(otherDeductions),
      // Grand
      grossDues, netSettlement,
    };
  }, [
    basicSalary, housingAllowance, transportAllowance, otherAllowances, monthlyDivisor,
    joiningDate, lastWorkingDate, terminationReason, contractType,
    unusedLeaveDays, leaveWageBase,
    noticeRequired, noticeServed,
    unpaidSalary, overtimeAmount, bonuses, otherAdditions,
    loans, companyAssets, otherDeductions,
  ]);

  const calcDate = new Date().toLocaleDateString("ar-SA", {
    year: "numeric", month: "long", day: "numeric",
  });

  // ─── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header Banner ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-hero-gradient p-6 text-white shadow-result">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📋</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold leading-tight">
                حاسبة المخالصة النهائية في السعودية
              </h1>
              <p className="mt-1 text-sm text-white/80">
                تصفية كاملة لجميع مستحقات العامل وفق المواد 75 و84 و85 و111 من نظام العمل
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-bold whitespace-nowrap">
            محدث فبراير 2025
          </span>
        </div>
      </div>

      {/* ── Section 1: Employee & Contract ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <SectionHeader num="١" title="بيانات الموظف والعقد" icon="👤" />

        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput label="اسم الموظف (للوثيقة)" value={employeeName} onChange={setEmployeeName} placeholder="محمد علي الزهراني" />
          <TextInput label="اسم جهة العمل / الشركة" value={employerName} onChange={setEmployerName} placeholder="شركة الخليج للمقاولات" />
          <TextInput label="المسمى الوظيفي" value={position} onChange={setPosition} placeholder="مهندس مدني أول" />
          <TextInput label="رقم الهوية الوطنية / الإقامة" value={employeeId} onChange={setEmployeeId} placeholder="1xxxxxxxxx" />
        </div>

        {/* Contract Type */}
        <div>
          <label className="block text-xs font-bold text-ink-secondary mb-2">نوع العقد</label>
          <ToggleGroup
            value={contractType}
            onChange={setContractType}
            options={[
              { id: "indefinite", label: "عقد غير محدد المدة", desc: "مفتوح بدون تاريخ انتهاء" },
              { id: "fixed", label: "عقد محدد المدة", desc: "بتاريخ انتهاء مسبق" },
            ]}
          />
        </div>

        {/* Termination Reason */}
        <div>
          <label className="block text-xs font-bold text-ink-secondary mb-2">سبب إنهاء العلاقة العمالية</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { id: "terminate", label: "🔴 فسخ من صاحب العمل" },
              { id: "resign", label: "🟡 استقالة الموظف" },
              { id: "retire", label: "🟢 تقاعد / بلوغ السن" },
              { id: "mutual", label: "🔵 إنهاء بالتراضي" },
              { id: "fixed_expired", label: "⚫ انتهاء عقد محدد" },
              { id: "female_special", label: "🟣 استثناء المرأة (م/87)" },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setTerminationReason(r.id)}
                className={`rounded-xl border p-2.5 text-[11px] font-semibold text-right transition-all ${
                  terminationReason === r.id
                    ? "border-brand bg-brand-light text-brand-dark shadow-sm font-bold"
                    : "border-brand-border bg-white text-ink-secondary hover:border-brand-200"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <DateInput label="تاريخ الالتحاق بالعمل" value={joiningDate} onChange={setJoiningDate} />
          <DateInput label="آخر يوم عمل فعلي" value={lastWorkingDate} onChange={setLastWorkingDate} />
        </div>

        {/* Service Duration Display */}
        {calc.serviceMonths > 0 && (
          <div className="rounded-xl bg-brand-surface border border-brand-border px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-ink-secondary font-medium">مدة الخدمة المحتسبة</span>
            <div className="text-right">
              <span className="font-extrabold text-brand-dark">{calc.serviceDurationLabel}</span>
              <span className="text-xs text-ink-muted block">({calc.serviceYears.toFixed(3)} سنة)</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: Wage Structure ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <SectionHeader num="٢" title="هيكل الراتب والأجر الفعلي" icon="💰" />

        <div className="grid gap-3 sm:grid-cols-2">
          <NumInput label="الراتب الأساسي الشهري (ر.س)" value={basicSalary} onChange={setBasicSalary} />
          <NumInput label="بدل السكن الشهري (ر.س)" value={housingAllowance} onChange={setHousingAllowance} />
          <NumInput label="بدل النقل الشهري (ر.س)" value={transportAllowance} onChange={setTransportAllowance} />
          <NumInput label="بدلات ثابتة دورية أخرى (ر.س)" value={otherAllowances} onChange={setOtherAllowances} />
        </div>

        {/* Monthly Divisor */}
        <div>
          <label className="block text-xs font-bold text-ink-secondary mb-2">
            قاسم الشهر لحساب الأجر اليومي
          </label>
          <div className="flex gap-2">
            {[
              { val: "30", label: "÷30", desc: "الأشيع بالسعودية" },
              { val: "26", label: "÷26", desc: "بعض العقود" },
              { val: "22", label: "÷22", desc: "أيام العمل الفعلية" },
            ].map((d) => (
              <button
                key={d.val}
                type="button"
                onClick={() => setMonthlyDivisor(d.val)}
                className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                  monthlyDivisor === d.val
                    ? "border-brand bg-brand-light text-brand-dark"
                    : "border-brand-border bg-white text-ink-secondary hover:border-brand-200"
                }`}
              >
                <span className="block text-sm">{d.label}</span>
                <span className="block text-[10px] font-normal text-ink-muted">{d.desc}</span>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-ink-muted">
            ÷30 هو الأساس الافتراضي الأكثر استخداماً في عقود العمل السعودية. يمكن تغييره إن نصّ العقد على خلاف ذلك.
          </p>
        </div>

        {/* Wage Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <WageStatCard label="الأجر الفعلي الإجمالي" value={`${fmt(calc.totalWage)} ر.س`} highlight />
          <WageStatCard label="الأجر اليومي" value={`${fmt(calc.daily)} ر.س`} />
          <WageStatCard label="أجر الساعة (÷8)" value={`${fmt(calc.daily / 8)} ر.س`} />
        </div>
      </div>

      {/* ── Section 3: EOSB ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
        <SectionHeader num="٣" title="مكافأة نهاية الخدمة — المادتان 84 و 85" icon="🎖️" />

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-ink-secondary">
              السنوات الأولى (حتى 5 سنوات): {calc.y1.toFixed(2)} سنة × نصف شهر
            </span>
            <span className="font-bold">{fmt(calc.y1Full)} ر.س</span>
          </div>
          {calc.y2 > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-ink-secondary">
                السنوات التالية (بعد 5): {calc.y2.toFixed(2)} سنة × شهر كامل
              </span>
              <span className="font-bold">{fmt(calc.y2Full)} ر.س</span>
            </div>
          )}
          <div className="border-t border-amber-300 pt-2 flex justify-between text-sm font-bold">
            <span>المكافأة الأصلية (100٪)</span>
            <span>{fmt(calc.fullGratuity)} ر.س</span>
          </div>
          {calc.esobPercent < 1.0 && (
            <div className="flex justify-between text-sm text-rose-700">
              <span>نسبة الاستحقاق المطبقة</span>
              <span className="font-bold">× {(calc.esobPercent * 100).toFixed(1)}٪</span>
            </div>
          )}
        </div>

        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            calc.esobPercent === 1.0
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : calc.esobPercent === 0
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          📜 {calc.esobNote}
        </div>

        <div className="flex justify-between items-center rounded-xl bg-brand-surface border border-brand-border px-4 py-3">
          <span className="font-bold text-ink">مكافأة نهاية الخدمة المستحقة</span>
          <span className="text-xl font-black text-brand-dark">{fmt(calc.eosb)} ر.س</span>
        </div>
      </div>

      {/* ── Section 4: Annual Leave ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <SectionHeader num="٤" title="بدل رصيد الإجازة السنوية — المادة 111" icon="🌴" />

        <NumInput
          label="رصيد الإجازة السنوية غير المستنفد (بالأيام)"
          value={unusedLeaveDays}
          onChange={setUnusedLeaveDays}
        />

        <div>
          <label className="block text-xs font-bold text-ink-secondary mb-2">أساس حساب بدل الإجازة</label>
          <ToggleGroup
            value={leaveWageBase}
            onChange={setLeaveWageBase}
            options={[
              { id: "actual", label: "الأجر الفعلي الإجمالي", desc: "الأشمل — المعتمد قضائياً غالباً" },
              { id: "basic", label: "الراتب الأساسي فقط", desc: "بعض العقود تنص عليه" },
            ]}
          />
          <p className="mt-1.5 text-[11px] text-ink-muted">
            المادة (111) تُلزم بتعويض نقدي عن الإجازات غير المستنفدة. تعتمد المحاكم العمالية غالباً الأجر الفعلي الإجمالي.
          </p>
        </div>

        {calc.leaveDays > 0 && (
          <div className="rounded-xl bg-teal-50 border border-teal-200 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-secondary">أجر اليوم المحتسب ({leaveWageBase === "basic" ? "الأساسي" : "الإجمالي"})</span>
              <span className="font-bold">{fmt(calc.leaveDailyRate)} ر.س</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary">الحساب: {calc.leaveDays} يوم × {fmt(calc.leaveDailyRate)} ر.س</span>
              <span className="font-bold text-teal-800">{fmt(calc.leavePay)} ر.س</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 5: Notice Period ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
        <SectionHeader num="٥" title="بدل مهلة الإشعار — المادتان 75 و 76" icon="📢" />

        {contractType === "fixed" ? (
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-ink-secondary">
            ⚠️ <strong>عقد محدد المدة:</strong> لا تنطبق أحكام مهلة الإشعار القياسية وفق المادتين (75) و(76) من نظام العمل.
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-blue-50 border border-blue-200 px-3 py-2.5 text-xs text-blue-800 leading-relaxed">
              📜 <strong>المادة (75):</strong> للعقد غير المحدد مع الراتب الشهري — مهلة الإشعار 30 يوماً (إشعار من الموظف) أو 60 يوماً (إنهاء من صاحب العمل). الطرف الذي لا يُخطر يلتزم بدفع مقابل الأجر عن فترة الإشعار.
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumInput
                label="مهلة الإشعار المطلوبة (بالأيام)"
                value={noticeRequired}
                onChange={setNoticeRequired}
                note="30 يوماً للاستقالة • 60 يوماً لإنهاء صاحب العمل (الحد الأدنى)"
              />
              <NumInput
                label="فترة الإشعار المخدومة فعلياً (بالأيام)"
                value={noticeServed}
                onChange={setNoticeServed}
              />
            </div>

            {calc.missedDays > 0 ? (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-secondary">أيام الإشعار غير المخدومة</span>
                  <span className="font-bold">{calc.missedDays} يوم</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">الحساب: {calc.missedDays} × {fmt(calc.daily)} ر.س</span>
                  <span className="font-bold text-rose-800">{fmt(calc.noticePay)} ر.س</span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
                ✓ {calc.noticeNote || "لا تعويض إشعار مستحق"}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Section 6: Other Additions & Deductions ─────────────────────────────── */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-5">
        <SectionHeader num="٦" title="مستحقات وخصومات أخرى" icon="⚖️" />

        <div>
          <p className="text-xs font-extrabold text-emerald-700 mb-3">➕ إضافات ومستحقات أخرى</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumInput label="رواتب متأخرة غير مصروفة (ر.س)" value={unpaidSalary} onChange={setUnpaidSalary} />
            <NumInput label="بدل أوفر تايم مستحق (ر.س)" value={overtimeAmount} onChange={setOvertimeAmount} />
            <NumInput label="مكافآت ومنح مستحقة (ر.س)" value={bonuses} onChange={setBonuses} />
            <NumInput label="إضافات أخرى (ر.س)" value={otherAdditions} onChange={setOtherAdditions} />
          </div>
        </div>

        <div className="border-t border-brand-border pt-4">
          <p className="text-xs font-extrabold text-rose-700 mb-3">➖ خصومات واستقطاعات</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumInput label="سلف وقروض مستحقة للشركة (ر.س)" value={loans} onChange={setLoans} />
            <NumInput label="عهد وأصول شركة غير مُردودة (ر.س)" value={companyAssets} onChange={setCompanyAssets} />
            <NumInput label="خصومات أخرى (ر.س)" value={otherDeductions} onChange={setOtherDeductions} />
          </div>
        </div>
      </div>

      {/* ── Results Panel ─────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-brand bg-white shadow-xl overflow-hidden">
        {/* Net Total Header */}
        <div className="bg-hero-gradient px-6 py-5 text-white">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white/75">إجمالي المخالصة النهائية الصافية</p>
              <p className="text-4xl sm:text-5xl font-black mt-1">
                {fmt(calc.netSettlement)}{" "}
                <span className="text-2xl font-bold">ر.س</span>
              </p>
            </div>
            <span className="text-6xl opacity-15 hidden sm:block">📋</span>
          </div>
        </div>

        {/* Itemised Breakdown */}
        <div className="p-5 space-y-1.5">
          <BreakdownRow
            label="آخر راتب مستحق"
            sub={`${calc.daysWorked} يوماً × ${fmt(calc.daily)} ر.س/يوم`}
            amount={calc.lastMonthPay}
          />
          <BreakdownRow
            label="مكافأة نهاية الخدمة"
            sub={calc.esobNote}
            amount={calc.eosb}
          />
          <BreakdownRow
            label="بدل رصيد الإجازة السنوية"
            sub={
              calc.leaveDays > 0
                ? `${calc.leaveDays} يوم × ${fmt(calc.leaveDailyRate)} ر.س`
                : "لم تُدخل أيام إجازة"
            }
            amount={calc.leavePay}
          />
          <BreakdownRow
            label="بدل مهلة الإشعار"
            sub={calc.noticeNote}
            amount={calc.noticePay}
          />
          {calc.addTotal > 0 && (
            <BreakdownRow label="مستحقات أخرى" sub="" amount={calc.addTotal} />
          )}

          <div className="border-t-2 border-brand-border/60 pt-1.5">
            <BreakdownRow
              label="إجمالي المستحقات"
              sub=""
              amount={calc.grossDues}
              type="gross"
            />
          </div>

          {calc.dedTotal > 0 && (
            <BreakdownRow
              label="إجمالي الخصومات والاستقطاعات"
              sub={`سلف وعهد وخصومات`}
              amount={calc.dedTotal}
              type="deduct"
            />
          )}

          <div className="border-t-4 border-brand pt-2">
            <BreakdownRow
              label="صافي المخالصة النهائية المستحقة"
              sub=""
              amount={calc.netSettlement}
              type="net"
            />
          </div>
        </div>

        {/* Expandable Calculation Explanation */}
        <div className="border-t border-brand-border">
          <button
            type="button"
            onClick={() => setExpandedCalc(!expandedCalc)}
            className="w-full px-5 py-3 text-right text-sm font-bold text-brand hover:bg-brand-surface/40 transition flex justify-between items-center"
          >
            <span>🔍 كيف تم الحساب؟ — تفصيل الفورمولا القانونية</span>
            <span className={`transition-transform duration-200 ${expandedCalc ? "rotate-180" : ""}`}>▼</span>
          </button>
          {expandedCalc && (
            <div className="px-5 pb-5 space-y-3 bg-slate-50/50">
              <CalcExplain
                title="١. آخر راتب مستحق"
                formula={`(${fmt(calc.totalWage)} ر.س ÷ ${calc.divisor}) × ${calc.daysWorked} يوم = ${fmt(calc.lastMonthPay)} ر.س`}
                law="حساب نسبي للأجر اليومي عن أيام الشهر الأخير المعمولة فعلاً"
              />
              <CalcExplain
                title="٢. مكافأة نهاية الخدمة"
                formula={`أول 5 سنوات: ${fmt(calc.totalWage)} × 0.5 × ${calc.y1.toFixed(2)} = ${fmt(calc.y1Full)} ر.س${
                  calc.y2 > 0
                    ? ` | بعد 5 سنوات: ${fmt(calc.totalWage)} × 1.0 × ${calc.y2.toFixed(2)} = ${fmt(calc.y2Full)} ر.س`
                    : ""
                } | نسبة الاستحقاق ${(calc.esobPercent * 100).toFixed(1)}٪ → ${fmt(calc.eosb)} ر.س`}
                law="المادة (84) للحساب الأساسي — المادة (85) لتدرج الاستقالة — المادة (87) لاستثناء المرأة"
              />
              <CalcExplain
                title="٣. بدل رصيد الإجازة السنوية"
                formula={`${calc.leaveDays} يوم × (${fmt(calc.leaveBase)} ر.س ÷ ${calc.divisor}) = ${calc.leaveDays} × ${fmt(calc.leaveDailyRate)} = ${fmt(calc.leavePay)} ر.س`}
                law="المادة (111) من نظام العمل: حق تعويض نقدي كامل عن الإجازات السنوية غير المستنفدة عند ترك العمل"
              />
              {calc.noticePay > 0 && (
                <CalcExplain
                  title="٤. بدل مهلة الإشعار"
                  formula={`${calc.missedDays} يوم غير مخدوم × ${fmt(calc.daily)} ر.س/يوم = ${fmt(calc.noticePay)} ر.س`}
                  law="المادتان (75) و(76): حق التعويض عن فترة الإشعار غير المخدومة في العقود غير المحددة المدة"
                />
              )}
              <CalcExplain
                title="٥. الإجمالي والصافي"
                formula={`إجمالي المستحقات ${fmt(calc.grossDues)} − الخصومات ${fmt(calc.dedTotal)} = صافي المخالصة ${fmt(calc.netSettlement)} ر.س`}
                law="التصفية الإجمالية النهائية لجميع حقوق ومديونيات الطرفين"
              />
            </div>
          )}
        </div>

        {/* Legal Disclaimer */}
        <div className="mx-5 mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 leading-relaxed">
          ⚖️ <strong>ملاحظة قانونية:</strong> هذه الحاسبة تقديرية واسترشادية وليست بديلاً عن الاستشارة القانونية أو التسوية الرسمية مع جهة العمل. للنزاعات العمالية، توجه إلى منصة <strong>ودي</strong> التابعة لوزارة الموارد البشرية والتنمية الاجتماعية. آخر مراجعة: فبراير 2025 وفق التعديلات الرسمية لنظام العمل.
        </div>

        {/* Action Buttons */}
        <div className="border-t border-brand-border px-5 pb-5 pt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowDocument(true)}
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark shadow-sm transition-all"
          >
            <span>📄</span>
            <span>إصدار وثيقة المخالصة الرسمية</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-bold text-ink-secondary hover:bg-brand-light hover:text-brand transition-all"
          >
            <span>🖨️</span>
            <span>طباعة</span>
          </button>
        </div>
      </div>

      {/* ── Settlement Document Modal ─────────────────────────────────────────────── */}
      {showDocument && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl my-4 rounded-2xl bg-white shadow-2xl">
            {/* Modal Toolbar */}
            <div className="sticky top-0 bg-white border-b border-brand-border px-5 py-3 flex justify-between items-center rounded-t-2xl z-10">
              <span className="font-extrabold text-ink text-sm">وثيقة المخالصة النهائية — Saudi Final Settlement</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-xl bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark"
                >
                  🖨️ طباعة / PDF
                </button>
                <button
                  onClick={() => setShowDocument(false)}
                  className="rounded-xl border border-brand-border px-3 py-1.5 text-xs font-bold text-ink-secondary hover:bg-brand-surface"
                >
                  ✕ إغلاق
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-6 sm:p-10 space-y-6 print:p-4" id="settlement-document">
              {/* Doc Header */}
              <div className="text-center border-b-2 border-ink pb-5 space-y-1">
                <div className="text-3xl">📋</div>
                <h2 className="text-2xl font-black text-ink">وثيقة المخالصة النهائية</h2>
                <p className="text-sm text-ink-secondary">Final Employment Settlement Certificate</p>
                <p className="text-xs text-ink-muted">وفق أحكام نظام العمل السعودي الصادر بالمرسوم الملكي رقم (م/51) وتعديلاته 2025</p>
              </div>

              {/* Parties Info */}
              <div>
                <h3 className="text-sm font-extrabold text-ink mb-3 border-b border-slate-200 pb-1">
                  بيانات الأطراف وفترة العقد
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {[
                    ["اسم الموظف", employeeName || "—"],
                    ["جهة العمل / الشركة", employerName || "—"],
                    ["المسمى الوظيفي", position || "—"],
                    ["رقم الهوية / الإقامة", employeeId || "—"],
                    ["تاريخ الالتحاق", joiningDate],
                    ["آخر يوم عمل", lastWorkingDate],
                    ["مدة الخدمة الكاملة", calc.serviceDurationLabel],
                    [
                      "سبب إنهاء الخدمة",
                      terminationReason === "terminate" ? "إنهاء من صاحب العمل" :
                      terminationReason === "resign" ? "استقالة الموظف" :
                      terminationReason === "retire" ? "التقاعد" :
                      terminationReason === "mutual" ? "إنهاء بالتراضي" :
                      terminationReason === "female_special" ? "استثناء المرأة (م/87)" :
                      "انتهاء عقد محدد المدة",
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="space-y-0.5">
                      <p className="text-[11px] font-bold text-ink-muted">{label}</p>
                      <p className="font-semibold text-ink">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settlement Table */}
              <div>
                <h3 className="text-sm font-extrabold text-ink mb-3 border-b border-slate-200 pb-1">
                  بيان المستحقات والخصومات التفصيلي
                </h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-ink font-bold">
                      <th className="px-3 py-2.5 text-right border border-slate-300">البند</th>
                      <th className="px-3 py-2.5 text-right border border-slate-300">المبلغ (ر.س)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <DocTableRow label="١. آخر راتب مستحق (نسبي)" value={`${fmt(calc.lastMonthPay)}`} />
                    <DocTableRow label="٢. مكافأة نهاية الخدمة" value={`${fmt(calc.eosb)}`} />
                    <DocTableRow label="٣. بدل رصيد الإجازة السنوية" value={`${fmt(calc.leavePay)}`} />
                    <DocTableRow label="٤. بدل مهلة الإشعار" value={`${fmt(calc.noticePay)}`} />
                    {calc.unpaidSalary > 0 && <DocTableRow label="رواتب متأخرة غير مصروفة" value={fmt(calc.unpaidSalary)} />}
                    {calc.overtimeAmount > 0 && <DocTableRow label="بدل أوفر تايم مستحق" value={fmt(calc.overtimeAmount)} />}
                    {calc.bonuses > 0 && <DocTableRow label="مكافآت ومنح" value={fmt(calc.bonuses)} />}
                    {calc.otherAdditions > 0 && <DocTableRow label="إضافات أخرى" value={fmt(calc.otherAdditions)} />}
                    <DocTableRow label="إجمالي المستحقات" value={fmt(calc.grossDues)} isGross />
                    {calc.loans > 0 && <DocTableRow label="(−) سلف وقروض مستحقة" value={`(${fmt(calc.loans)})`} isDeduct />}
                    {calc.companyAssets > 0 && <DocTableRow label="(−) عهد وأصول شركة" value={`(${fmt(calc.companyAssets)})`} isDeduct />}
                    {calc.otherDeductions > 0 && <DocTableRow label="(−) خصومات أخرى" value={`(${fmt(calc.otherDeductions)})`} isDeduct />}
                  </tbody>
                  <tfoot>
                    <tr className="bg-brand text-white">
                      <td className="px-3 py-3 font-black border border-brand text-sm">
                        ══ صافي المخالصة النهائية المستحقة
                      </td>
                      <td className="px-3 py-3 font-black border border-brand text-right text-base">
                        {fmt(calc.netSettlement)} ر.س
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Wage Basis */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-ink-secondary space-y-1">
                <p><strong>أساس الحساب:</strong> الأجر الفعلي الإجمالي = {fmt(calc.totalWage)} ر.س/شهر | قاسم الشهر: ÷{calc.divisor} | الأجر اليومي: {fmt(calc.daily)} ر.س</p>
                <p><strong>مدة الخدمة:</strong> {calc.serviceYears.toFixed(3)} سنة ({calc.serviceDurationLabel})</p>
              </div>

              {/* Signatures */}
              <div>
                <h3 className="text-sm font-extrabold text-ink mb-4 border-b border-slate-200 pb-1">التوقيعات والإقرار</h3>
                <p className="text-xs text-ink-secondary mb-6">
                  بتوقيع هذه الوثيقة، يُقرّ الطرفان باستلام وتسليم جميع المستحقات المبيّنة أعلاه وبراءة كل منهما تجاه الآخر من أي مطالبات عمالية تتعلق بفترة الخدمة المنتهية، ما لم يُنصّ صراحة على خلاف ذلك.
                </p>
                <div className="grid grid-cols-2 gap-10">
                  <div className="text-center space-y-6">
                    <p className="text-xs font-bold text-ink">توقيع الموظف واستلام المبلغ</p>
                    <div className="border-b-2 border-ink/30 mx-2" />
                    <div className="text-xs text-ink-muted space-y-0.5">
                      <p>{employeeName || "الاسم"}</p>
                      <p>التاريخ: ___________</p>
                    </div>
                  </div>
                  <div className="text-center space-y-6">
                    <p className="text-xs font-bold text-ink">توقيع وختم جهة العمل</p>
                    <div className="border-b-2 border-ink/30 mx-2" />
                    <div className="text-xs text-ink-muted space-y-0.5">
                      <p>{employerName || "الجهة"}</p>
                      <p>التاريخ: ___________</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doc Footer */}
              <div className="border-t border-slate-200 pt-4 text-center text-[11px] text-ink-muted space-y-1">
                <p>تاريخ إصدار الوثيقة: {calcDate}</p>
                <p>أُنشئت بواسطة حاسبة المخالصة النهائية — منصة الأدوات العربية</p>
                <p className="text-amber-700 font-medium">
                  ⚖️ هذه الوثيقة تقديرية وتستلزم مراجعة ومصادقة أطراف العلاقة العمالية للاعتداد بها قانونياً.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
