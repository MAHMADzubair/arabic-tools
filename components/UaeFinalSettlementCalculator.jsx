"use client";

/**
 * components/UaeFinalSettlementCalculator.jsx
 * Ink & Signal: UAE final settlement calculator.
 * toNum / fmt / calcServiceDuration, all state, presets and the useMemo
 * calculations are unchanged. Changes: local styling (no Tailwind colours),
 * emoji removed, every control has a label (htmlFor), toggles use
 * aria-pressed, +/− never rely on colour alone, the literal "**" around
 * "الراتب الأساسي" is now a real <strong>, and the printed document is a
 * fixed ink-on-white page with an orange header band.
 */
import { useState, useMemo } from "react";

// ─── Helpers (unchanged) ───────────────────────────────────────────────────────
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

// ─── Small UI pieces ───────────────────────────────────────────────────────────
function Field({ id, label, hint, req, optional, children }) {
  return (
    <div className="fs-field">
      <label htmlFor={id} className="fs-label">
        {label}
        {req && <span aria-hidden="true"> *</span>}
        {optional && <span className="fs-hint"> (اختياري)</span>}
      </label>
      {children}
      {hint && <p id={`${id}-hint`} className="fs-small">{hint}</p>}
    </div>
  );
}

function NumField({ id, label, hint, req, optional, value, onChange, ...rest }) {
  return (
    <Field id={id} label={label} hint={hint} req={req} optional={optional}>
      <input id={id} type="number" inputMode="decimal" dir="ltr" className="fs-input"
        value={value} onChange={(e) => onChange(e.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined} {...rest} />
    </Field>
  );
}

function SelField({ id, label, value, onChange, children }) {
  return (
    <Field id={id} label={label}>
      <select id={id} className="fs-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </Field>
  );
}

function Seg({ id, label, value, onChange, options }) {
  return (
    <div className="fs-field">
      <p id={id} className="fs-label">{label}</p>
      <div className="fs-seg" role="group" aria-labelledby={id}>
        {options.map((o) => (
          <button key={o.v} type="button" aria-pressed={value === o.v} onClick={() => onChange(o.v)}>{o.l}</button>
        ))}
      </div>
    </div>
  );
}

function Step({ n, id, children }) {
  return (
    <div className="fs-step">
      <span className="fs-num" aria-hidden="true">{n}</span>
      <h2 id={id} className="fs-h2">{children}</h2>
    </div>
  );
}

function Note({ title, children, dashed = false }) {
  return (
    <aside className={`fs-note ${dashed ? "fs-note-dash" : ""}`}>
      <span className="fs-mark" aria-hidden="true">!</span>
      <p className="fs-note-text">{title && <strong>{title} </strong>}{children}</p>
    </aside>
  );
}

function Calc({ label, value, sub }) {
  return (
    <div className="fs-calc">
      <p className="fs-small">{label}</p>
      <p className="fs-calc-v"><span className="fs-ltr">{value}</span></p>
      {sub && <p className="fs-small">{sub}</p>}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function UaeFinalSettlementCalculator() {
  // Section A
  const [isCitizen, setIsCitizen] = useState("non_citizen");
  const [isMOHRE, setIsMOHRE] = useState("yes");
  const [savingsScheme, setSavingsScheme] = useState("no");
  const [workPattern, setWorkPattern] = useState("full_time");

  // Section B
  const [joiningDate, setJoiningDate] = useState("2022-01-01");
  const [lastWorkingDate, setLastWorkingDate] = useState(new Date().toISOString().split("T")[0]);
  const [unpaidAbsenceDays, setUnpaidAbsenceDays] = useState("0");

  // Section C
  const [basicSalary, setBasicSalary] = useState("6000");
  const [grossSalary, setGrossSalary] = useState("9000");

  // Section D
  const [salaryMode, setSalaryMode] = useState("days");
  const [workedDaysInLastMonth, setWorkedDaysInLastMonth] = useState("30");
  const [manualSalaryDue, setManualSalaryDue] = useState("0");

  // Section E
  const [unusedLeaveDays, setUnusedLeaveDays] = useState("10");

  // Section F
  const [isNoticeServed, setIsNoticeServed] = useState("yes");
  const [whoBreachedNotice, setWhoBreachedNotice] = useState("employer");
  const [requiredNoticeDays, setRequiredNoticeDays] = useState("30");
  const [servedNoticeDays, setServedNoticeDays] = useState("0");

  // Section G
  const [overdueSalary, setOverdueSalary] = useState("0");
  const [commissions, setCommissions] = useState("0");
  const [repatriationTicket, setRepatriationTicket] = useState("1000");
  const [otherAdditions, setOtherAdditions] = useState("0");

  const [loans, setLoans] = useState("500");
  const [assetsDue, setAssetsDue] = useState("0");
  const [otherDeductions, setOtherDeductions] = useState("0");

  // Printable metadata
  const [employeeName, setEmployeeName] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  // UI state
  const [activeTab, setActiveTab] = useState("form");
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  // ─── Preset loader (unchanged) ──────────────────────────────────────────────
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
      setWorkedDaysInLastMonth("0");
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

  // ─── Reset (unchanged) ──────────────────────────────────────────────────────
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

  // ─── Calculations (unchanged) ───────────────────────────────────────────────
  const service = useMemo(
    () => calcServiceDuration(joiningDate, lastWorkingDate, unpaidAbsenceDays),
    [joiningDate, lastWorkingDate, unpaidAbsenceDays]
  );

  const calcs = useMemo(() => {
    const basic = toNum(basicSalary);
    const gross = toNum(grossSalary);
    const dailyBasic = basic / 30;
    const dailyGross = gross / 30;

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

    let finalSalaryDue = 0;
    if (salaryMode === "days") {
      const days = Math.min(31, toNum(workedDaysInLastMonth));
      finalSalaryDue = days * dailyGross;
    } else {
      finalSalaryDue = toNum(manualSalaryDue);
    }

    const leaveDays = toNum(unusedLeaveDays);
    const leavePayout = leaveDays * dailyBasic;

    let noticeAmount = 0;
    let noticeDirection = "none";
    if (isNoticeServed === "no") {
      const req = toNum(requiredNoticeDays);
      const srv = toNum(servedNoticeDays);
      const rem = Math.max(0, req - srv);
      noticeAmount = rem * dailyGross;
      noticeDirection = whoBreachedNotice === "employer" ? "to_employee" : "to_employer";
    }

    const totalAdditions =
      toNum(overdueSalary) +
      toNum(commissions) +
      toNum(repatriationTicket) +
      toNum(otherAdditions);

    const regularDeductions = toNum(loans) + toNum(assetsDue) + toNum(otherDeductions);
    const noticeDeduction = noticeDirection === "to_employer" ? noticeAmount : 0;
    const totalDeductions = regularDeductions + noticeDeduction;

    const noticeAddition = noticeDirection === "to_employee" ? noticeAmount : 0;
    const grossTotalDues = finalSalaryDue + gratuity + leavePayout + noticeAddition + totalAdditions;
    const netSettlement = Math.max(0, grossTotalDues - totalDeductions);

    return {
      dailyBasic, dailyGross, rawGratuity, gratuity, isCapped, gratuityNote, twoYearCap,
      finalSalaryDue, leavePayout, noticeAmount, noticeDirection, totalAdditions,
      regularDeductions, totalDeductions, grossTotalDues, netSettlement,
    };
  }, [
    isCitizen, savingsScheme, service, basicSalary, grossSalary, salaryMode,
    workedDaysInLastMonth, manualSalaryDue, unusedLeaveDays, isNoticeServed,
    whoBreachedNotice, requiredNoticeDays, servedNoticeDays, overdueSalary,
    commissions, repatriationTicket, otherAdditions, loans, assetsDue, otherDeductions,
  ]);

  const handlePrint = () => {
    setActiveTab("preview");
    setTimeout(() => window.print(), 250);
  };

  const goPreview = () => {
    setActiveTab("preview");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fs-root" dir="rtl">
      <FinalStyles />

      {/* Header */}
      <header className="fs-card fs-noprint">
        <div className="fs-head-row">
          <div>
            <h1 className="fs-h1">حاسبة المخالصة النهائية في الإمارات</h1>
            <p className="fs-lead">تصفية شاملة لمستحقات العامل: مكافأة نهاية الخدمة، كسر الراتب، رصيد الإجازات، وبدل الإنذار</p>
          </div>
          <p className="fs-tag">قانون العمل 2026</p>
        </div>

        <div className="fs-actions">
          <span className="fs-small-b">أمثلة سريعة:</span>
          <button type="button" className="fs-btn fs-btn-sm" onClick={() => applyPreset("standard")}>4 سنوات (6 آلاف)</button>
          <button type="button" className="fs-btn fs-btn-sm" onClick={() => applyPreset("senior")}>خبرة عليا + إنذار</button>
        </div>

        <div className="fs-tabs" role="group" aria-label="العرض">
          <button type="button" aria-pressed={activeTab === "form"} onClick={() => setActiveTab("form")}>إدخال بيانات التصفية</button>
          <button type="button" aria-pressed={activeTab === "preview"} onClick={goPreview}>معاينة نموذج المخالصة والطباعة</button>
        </div>
      </header>

      {/* ══ FORM ══ */}
      {activeTab === "form" && (
        <div className="fs-stack fs-noprint">

          {/* 1 — Scope */}
          <section className="fs-card" aria-labelledby="fs-s1">
            <Step n="1" id="fs-s1">صفة الموظف ونطاق العمل القانوني</Step>
            <div className="fs-two">
              <Seg id="fs-cit" label="هل الموظف مواطن إماراتي أم غير مواطن؟" value={isCitizen} onChange={setIsCitizen}
                options={[{ v: "non_citizen", l: "غير مواطن (مقيم)" }, { v: "citizen", l: "مواطن إماراتي" }]} />
              <Seg id="fs-moh" label="هل يعمل بالقطاع الخاص الخاضع لـ MOHRE؟" value={isMOHRE} onChange={setIsMOHRE}
                options={[{ v: "yes", l: "نعم (قانون العمل 33)" }, { v: "other", l: "لا / منطقة حرة مالية" }]} />
            </div>
            <div className="fs-two">
              <SelField id="fs-sav" label="هل الموظف مشمول بنظام الادخار البديل لمكافأة نهاية الخدمة؟" value={savingsScheme} onChange={setSavingsScheme}>
                <option value="no">لا (نظام المكافأة التراكمي التقليدي)</option>
                <option value="yes">نعم (مشترك في صناديق نظام الادخار الاستثماري)</option>
                <option value="uncertain">غير متأكد</option>
              </SelField>
              <SelField id="fs-pat" label="نوع ونمط العمل" value={workPattern} onChange={setWorkPattern}>
                <option value="full_time">دوام كامل (Full-Time)</option>
                <option value="part_time">دوام جزئي أو نمط مرن/مؤقت</option>
              </SelField>
            </div>

            {isCitizen === "citizen" && (
              <Note title="تنبيه للمواطنين:">هذه الحاسبة مخصصة أساساً للعمال غير المواطنين في القطاع الخاص. يخضع المواطنون الإماراتيون لأنظمة المعاشات والتأمينات الاجتماعية (الهيئة العامة للمعاشات GPSSA أو صندوق أبوظبي للتقاعد)، ولا تُحتسب لهم مكافأة نهاية الخدمة العمالية للوافدين تلقائياً.</Note>
            )}
            {isMOHRE === "other" && (
              <Note title="تنبيه للمناطق الحرة والجهات الخاصة:">تخضع المناطق الحرة المالية (مثل مركز دبي المالي العالمي DIFC وسوق أبوظبي العالمي ADGM) لقوانين عمل مستقلة وبرامج ادخار وإيداع إلزامية (مثل نظام DEWS). يرجى مراجعة لوائح جهة العمل المختصة.</Note>
            )}
            {savingsScheme !== "no" && (
              <Note title="تنبيه نظام الادخار البديل:">إذا كانت المنشأة مسجلة في النظام الاختياري البديل لمكافأة نهاية الخدمة، تُودع اشتراكات شهرية في محافظ وصناديق استثمارية معتمدة؛ وتُستحق أموال الصندوق وعوائدها الاستثمارية مباشرة من مدير الصندوق بدلاً من حساب مكافأة السنوات التراكمية التقليدية.</Note>
            )}
            {workPattern === "part_time" && (
              <Note dashed title="ملاحظة الدوام الجزئي:">وفق اللائحة التنفيذية لقانون العمل، تُحسب مكافأة نهاية الخدمة للدوام الجزئي بنسبة وتناسب وفق عدد الساعات المنفذة مقارنة بالدوام الكامل، ويلزم مراجعة العقد الفردي.</Note>
            )}
          </section>

          {/* 2 — Dates */}
          <section className="fs-card" aria-labelledby="fs-s2">
            <Step n="2" id="fs-s2">تواريخ الخدمة ومدة العمل الفعلية</Step>
            <div className="fs-three">
              <Field id="fs-join" label="تاريخ بدء العمل" req>
                <input id="fs-join" type="date" dir="ltr" className="fs-input" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} />
              </Field>
              <Field id="fs-last" label="آخر يوم عمل" req>
                <input id="fs-last" type="date" dir="ltr" className="fs-input" value={lastWorkingDate} onChange={(e) => setLastWorkingDate(e.target.value)} />
              </Field>
              <NumField id="fs-abs" label="أيام الغياب بدون راتب" optional min="0" placeholder="0"
                hint="تُستبعد من مدة الخدمة لحساب المكافأة نظاماً" value={unpaidAbsenceDays} onChange={setUnpaidAbsenceDays} />
            </div>
            <div className="fs-box fs-row-between" aria-live="polite">
              <p className="fs-text">صافي مدة الخدمة المحتسبة: <strong>{service.formatted}</strong></p>
              {service.isValid && <p className="fs-tag">{service.netYears.toFixed(2)} سنة خدمة فعلية</p>}
            </div>
          </section>

          {/* 3 — Salary */}
          <section className="fs-card" aria-labelledby="fs-s3">
            <Step n="3" id="fs-s3">بيانات الأجر (الأساسي والإجمالي)</Step>
            <div className="fs-two">
              <NumField id="fs-basic" label="الراتب الأساسي الأخير (Basic Salary)" req min="0" step="50" placeholder="مثال: 6000"
                hint="تُحسب عليه مكافأة نهاية الخدمة وبدل رصيد الإجازات السنوية (المادة 51)" value={basicSalary} onChange={setBasicSalary} />
              <NumField id="fs-gross" label="الراتب الإجمالي الأخير (Gross Salary)" req min="0" step="50" placeholder="مثال: 9000"
                hint="يشمل الأساسي والبدلات (السكن، النقل)؛ تُحسب عليه تعويضات الإنذار والراتب المتبقي" value={grossSalary} onChange={setGrossSalary} />
            </div>
            <div className="fs-two">
              <Calc label="أجر اليوم الأساسي (الأساسي ÷ 30)" value={`${fmt(calcs.dailyBasic)} AED`} />
              <Calc label="أجر اليوم الإجمالي (الإجمالي ÷ 30)" value={`${fmt(calcs.dailyGross)} AED`} />
            </div>
          </section>

          {/* 4 — Final month */}
          <section className="fs-card" aria-labelledby="fs-s4">
            <Step n="4" id="fs-s4">الراتب المستحق عن آخر فترة عمل (كسر الشهر)</Step>
            <div className="fs-two">
              <Seg id="fs-mode" label="طريقة احتساب الراتب المتبقي" value={salaryMode} onChange={setSalaryMode}
                options={[{ v: "days", l: "حسب عدد الأيام" }, { v: "amount", l: "إدخال مبلغ محدد" }]} />
              {salaryMode === "days" ? (
                <NumField id="fs-days" label="أيام العمل المستحقة في الشهر الأخير (0–31)" min="0" max="31"
                  hint={`يُحسب على أساس الأجر الإجمالي وقسمة الشهر على 30 يوماً (${fmt(calcs.dailyGross)} AED/يوم)`}
                  value={workedDaysInLastMonth} onChange={setWorkedDaysInLastMonth} />
              ) : (
                <NumField id="fs-man" label="المبلغ الصافي المستحق عن الراتب الأخير (AED)" min="0" value={manualSalaryDue} onChange={setManualSalaryDue} />
              )}
            </div>
            <Calc label="قيمة راتب آخر شهر المحتسبة" value={`${fmt(calcs.finalSalaryDue)} AED`} />
          </section>

          {/* 5 — Leave */}
          <section className="fs-card" aria-labelledby="fs-s5">
            <Step n="5" id="fs-s5">بدل رصيد الإجازة السنوية غير المستخدمة</Step>
            <div className="fs-two">
              <Field id="fs-leave" label="عدد أيام رصيد الإجازات المتبقية والمستحقة"
                hint={<>يُحسب التعويض النقدي لرصيد الإجازات نظاماً على أساس <strong>الراتب الأساسي</strong> (أجر اليوم: {fmt(calcs.dailyBasic)} AED)</>}>
                <input id="fs-leave" type="number" inputMode="decimal" dir="ltr" className="fs-input" min="0" step="0.5" placeholder="مثال: 10"
                  value={unusedLeaveDays} onChange={(e) => setUnusedLeaveDays(e.target.value)} aria-describedby="fs-leave-hint" />
              </Field>
              <Calc label="بدل رصيد الإجازة المستحق" value={`${fmt(calcs.leavePayout)} AED`}
                sub={`المعادلة: ${unusedLeaveDays || 0} يوم × ${fmt(calcs.dailyBasic)} درهم`} />
            </div>
          </section>

          {/* 6 — Notice */}
          <section className="fs-card" aria-labelledby="fs-s6">
            <Step n="6" id="fs-s6">فترة الإنذار والتعويض عنها</Step>
            <Seg id="fs-notice" label="هل تم الالتزام بفترة الإنذار المتفق عليها كاملة؟" value={isNoticeServed} onChange={setIsNoticeServed}
              options={[{ v: "yes", l: "نعم (تم إكمال الإنذار ولا يوجد تعويض)" }, { v: "no", l: "لا (يوجد إخلال أو إنهاء فوري)" }]} />

            {isNoticeServed === "no" && (
              <div className="fs-dash fs-stack">
                <div className="fs-three">
                  <SelField id="fs-who" label="من الطرف الذي لم يلتزم بالإنذار؟" value={whoBreachedNotice} onChange={setWhoBreachedNotice}>
                    <option value="employer">صاحب العمل (تعويض لصالح الموظف +)</option>
                    <option value="employee">الموظف (خصم من مستحقات الموظف −)</option>
                  </SelField>
                  <NumField id="fs-req" label="مدة الإنذار التعاقدية (أيام)" min="30" max="90"
                    hint="القانون يحددها بين 30 إلى 90 يوماً" value={requiredNoticeDays} onChange={setRequiredNoticeDays} />
                  <NumField id="fs-srv" label="الأيام المنجزة فعلياً من الإنذار" min="0" value={servedNoticeDays} onChange={setServedNoticeDays} />
                </div>
                <div className="fs-box fs-row-between" aria-live="polite">
                  <div>
                    <p className="fs-small-b">
                      {calcs.noticeDirection === "to_employee"
                        ? "بدل الإنذار المستحق لصالح الموظف (+):"
                        : "بدل الإنذار الواجب خصمه لصالح صاحب العمل (−):"}
                    </p>
                    <p className="fs-small">يُحسب على أساس الأجر الإجمالي الأخير ({fmt(calcs.dailyGross)} AED/يوم)</p>
                  </div>
                  <p className="fs-calc-v">
                    <span className="fs-ltr">{calcs.noticeDirection === "to_employee" ? "+" : "−"} {fmt(calcs.noticeAmount)} AED</span>
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* 7 — Additions / deductions */}
          <section className="fs-card" aria-labelledby="fs-s7">
            <Step n="7" id="fs-s7">مستحقات إضافية وخصومات</Step>

            <fieldset className="fs-fieldset">
              <legend className="fs-legend">مستحقات وإضافات أخرى للموظف (+)</legend>
              <div className="fs-two">
                <NumField id="fs-over" label="رواتب متأخرة سابقة (AED)" min="0" value={overdueSalary} onChange={setOverdueSalary} />
                <NumField id="fs-comm" label="عمولات أو مكافآت (AED)" min="0" value={commissions} onChange={setCommissions} />
                <NumField id="fs-tick" label="بدل تذكرة العودة (AED)" min="0" hint="اختياري بحسب شروط عقد العمل والمغادرة" value={repatriationTicket} onChange={setRepatriationTicket} />
                <NumField id="fs-oadd" label="مستحقات أخرى (AED)" min="0" value={otherAdditions} onChange={setOtherAdditions} />
              </div>
            </fieldset>

            <fieldset className="fs-fieldset fs-fieldset-dash">
              <legend className="fs-legend">استقطاعات وخصومات على الموظف (−)</legend>
              <div className="fs-three">
                <NumField id="fs-loan" label="سلف وقروض متبقية (AED)" min="0" value={loans} onChange={setLoans} />
                <NumField id="fs-asset" label="عهد أو مبالغ مستحقة للشركة (AED)" min="0" value={assetsDue} onChange={setAssetsDue} />
                <NumField id="fs-odeds" label="خصومات أخرى (AED)" min="0" value={otherDeductions} onChange={setOtherDeductions} />
              </div>
            </fieldset>
          </section>

          {/* Summary */}
          <section className="fs-result" aria-live="polite" aria-labelledby="fs-sum">
            <div className="fs-row-between">
              <h2 id="fs-sum" className="fs-result-h">ملخص بنود التصفية العمالية التقديرية</h2>
              <p className="fs-small-b">الدرهم الإماراتي (AED)</p>
            </div>
            <div className="fs-tbox">
              <div className="fs-trow"><span>1. الراتب المستحق عن آخر فترة</span><span className="fs-ltr">{fmt(calcs.finalSalaryDue)}</span></div>
              <div className="fs-trow">
                <span>2. مكافأة نهاية الخدمة (قانون 33){calcs.isCapped && <span className="fs-chip">مطابق لسقف السنتين</span>}</span>
                <span className="fs-ltr">{fmt(calcs.gratuity)}</span>
              </div>
              {calcs.gratuityNote && <p className="fs-trow-note">{calcs.gratuityNote}</p>}
              <div className="fs-trow"><span>3. بدل رصيد الإجازات السنوية</span><span className="fs-ltr">{fmt(calcs.leavePayout)}</span></div>
              {calcs.noticeDirection === "to_employee" && (
                <div className="fs-trow"><span>4. بدل الإنذار (لصالح الموظف)</span><span className="fs-ltr">+ {fmt(calcs.noticeAmount)}</span></div>
              )}
              {calcs.totalAdditions > 0 && (
                <div className="fs-trow"><span>5. مستحقات وإضافات أخرى</span><span className="fs-ltr">+ {fmt(calcs.totalAdditions)}</span></div>
              )}
              {calcs.totalDeductions > 0 && (
                <div className="fs-trow fs-trow-b"><span>6. إجمالي الخصومات والاستقطاعات</span><span className="fs-ltr">− {fmt(calcs.totalDeductions)}</span></div>
              )}
            </div>
            <div className="fs-grand">
              <span>صافي المخالصة النهائية التقديرية</span>
              <span className="fs-ltr">{fmt(calcs.netSettlement)} AED</span>
            </div>

            <div className="fs-tbox fs-pad">
              <button type="button" className="fs-link" aria-expanded={showFormulaDetails} aria-controls="fs-formula" onClick={() => setShowFormulaDetails(!showFormulaDetails)}>
                كيف تم الحساب والمعادلات القانونية؟
              </button>
              {showFormulaDetails && (
                <div id="fs-formula" className="fs-stack">
                  <p className="fs-text"><strong>مكافأة نهاية الخدمة:</strong> تُحسب على أساس الأجر اليومي الأساسي ({fmt(calcs.dailyBasic)} درهم): أجر 21 يوماً عن كل سنة من السنوات الخمس الأولى، و30 يوماً عن كل سنة بعدها، مع سقف أقصى لا يتجاوز أجر سنتين ({fmt(calcs.twoYearCap)} درهم).</p>
                  <p className="fs-text"><strong>بدل الإجازة السنوية:</strong> يُحسب حصراً على الراتب الأساسي الأخير ({fmt(calcs.dailyBasic)} درهم × {unusedLeaveDays} يوم).</p>
                  <p className="fs-text"><strong>بدل الإنذار:</strong> يُحسب على الأجر الإجمالي الكامل شاملاً البدلات ({fmt(calcs.dailyGross)} درهم/يوم).</p>
                </div>
              )}
            </div>
          </section>

          {/* Actions */}
          <div className="fs-actions fs-bottom">
            <button type="button" className="fs-btn fs-btn-p" onClick={goPreview}>معاينة نموذج المخالصة</button>
            <button type="button" className="fs-btn" onClick={handlePrint}>طباعة المخالصة (A4 / PDF)</button>
            <button type="button" className="fs-btn fs-btn-plain" onClick={handleReset}>إعادة تعيين</button>
          </div>
        </div>
      )}

      {/* ══ PREVIEW & PRINT ══ */}
      <div className={`fs-preview ${activeTab === "preview" ? "fs-show" : ""}`}>
        <div className="fs-actions fs-noprint fs-prev-bar">
          <button type="button" className="fs-btn" onClick={() => setActiveTab("form")}>العودة لتعديل البيانات</button>
          <button type="button" className="fs-btn fs-btn-p" onClick={handlePrint}>طباعة المستند أو تصدير كـ PDF</button>
        </div>

        <article className="fs-doc">
          <div className="fs-doc-head">
            <h2 className="fs-doc-title">نموذج مخالصة نهائية تقديرية</h2>
            <p className="fs-doc-sub">Estimated Final Settlement Statement</p>
            <p className="fs-doc-small">دولة الإمارات العربية المتحدة — قطاع خاص (وفق مرسوم قانون تنظيم علاقات العمل رقم 33 لسنة 2021)</p>
          </div>

          <div className="fs-doc-body">
            <div className="fs-doc-meta">
              <div>
                <label htmlFor="fs-m-name" className="fs-doc-cap">اسم الموظف / Employee Name</label>
                <input id="fs-m-name" type="text" placeholder="أدخل اسم الموظف..." value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className="fs-doc-input" />
              </div>
              <div>
                <label htmlFor="fs-m-co" className="fs-doc-cap">اسم المنشأة / Company</label>
                <input id="fs-m-co" type="text" placeholder="أدخل اسم الشركة..." value={employerName} onChange={(e) => setEmployerName(e.target.value)} className="fs-doc-input" />
              </div>
              <div>
                <label htmlFor="fs-m-id" className="fs-doc-cap">الرقم الوظيفي / Employee ID</label>
                <input id="fs-m-id" type="text" placeholder="اختياري..." value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="fs-doc-input" />
              </div>
            </div>

            <dl className="fs-doc-info">
              <div><dt>تاريخ بدء العمل</dt><dd dir="ltr">{joiningDate || "—"}</dd></div>
              <div><dt>آخر يوم عمل</dt><dd dir="ltr">{lastWorkingDate || "—"}</dd></div>
              <div><dt>مدة الخدمة الفعلية</dt><dd>{service.formatted}</dd></div>
              <div><dt>تاريخ الاحتساب</dt><dd dir="ltr">{new Date().toISOString().split("T")[0]}</dd></div>
              <div><dt>الراتب الأساسي الأخير</dt><dd dir="ltr">{fmt(basicSalary)} AED</dd></div>
              <div><dt>الراتب الإجمالي الأخير</dt><dd dir="ltr">{fmt(grossSalary)} AED</dd></div>
            </dl>

            <div className="fs-doc-scroll">
              <table className="fs-doc-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>بيان الاستحقاق / التفصيل</th>
                    <th>النوع</th>
                    <th>المبلغ بالدرهم (AED)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td><p className="fs-doc-strong">الراتب المستحق عن آخر شهر / كسر الشهر</p><p className="fs-doc-small">محسوب حسب الأجر الإجمالي</p></td>
                    <td>مستحق (+)</td>
                    <td dir="ltr" className="fs-doc-strong">{fmt(calcs.finalSalaryDue)}</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>
                      <p className="fs-doc-strong">مكافأة نهاية الخدمة (قانون تنظيم علاقات العمل رقم 33)</p>
                      <p className="fs-doc-small">
                        {service.netYears.toFixed(2)} سنة خدمة — محسوبة على الراتب الأساسي ({fmt(calcs.dailyBasic)} AED/يوم)
                        {calcs.isCapped && " [مطابق لسقف أجر سنتين]"}
                      </p>
                    </td>
                    <td>مستحق (+)</td>
                    <td dir="ltr" className="fs-doc-strong">{fmt(calcs.gratuity)}</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>
                      <p className="fs-doc-strong">بدل رصيد الإجازات السنوية غير المستخدمة</p>
                      <p className="fs-doc-small">{unusedLeaveDays || 0} يوم × الراتب الأساسي اليومي ({fmt(calcs.dailyBasic)} AED)</p>
                    </td>
                    <td>مستحق (+)</td>
                    <td dir="ltr" className="fs-doc-strong">{fmt(calcs.leavePayout)}</td>
                  </tr>
                  {calcs.noticeDirection === "to_employee" && (
                    <tr>
                      <td>4</td>
                      <td><p className="fs-doc-strong">تعويض بدل مهلة الإنذار (لصالح الموظف)</p><p className="fs-doc-small">عدم التزام صاحب العمل بفترة الإنذار كاملة</p></td>
                      <td>مستحق (+)</td>
                      <td dir="ltr" className="fs-doc-strong">{fmt(calcs.noticeAmount)}</td>
                    </tr>
                  )}
                  {calcs.totalAdditions > 0 && (
                    <tr>
                      <td>5</td>
                      <td><p className="fs-doc-strong">مستحقات وإضافات أخرى (رواتب سابقة / عمولات / تذكرة عودة)</p></td>
                      <td>مستحق (+)</td>
                      <td dir="ltr" className="fs-doc-strong">{fmt(calcs.totalAdditions)}</td>
                    </tr>
                  )}
                  {calcs.totalDeductions > 0 && (
                    <tr>
                      <td>6</td>
                      <td>
                        <p className="fs-doc-strong">إجمالي الخصومات والاستقطاعات</p>
                        <p className="fs-doc-small">
                          سلف: {fmt(loans)} AED | عهد: {fmt(assetsDue)} AED
                          {calcs.noticeDirection === "to_employer" && ` | بدل إنذار لصالح الشركة: ${fmt(calcs.noticeAmount)} AED`}
                          {toNum(otherDeductions) > 0 && ` | أخرى: ${fmt(otherDeductions)} AED`}
                        </p>
                      </td>
                      <td>خصم (−)</td>
                      <td dir="ltr" className="fs-doc-strong">− {fmt(calcs.totalDeductions)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="fs-doc-tot-wrap">
              <div className="fs-doc-tot">
                <div className="fs-doc-trow"><span>إجمالي المستحقات</span><span dir="ltr">{fmt(calcs.grossTotalDues)} AED</span></div>
                {calcs.totalDeductions > 0 && (
                  <div className="fs-doc-trow"><span>إجمالي الخصومات</span><span dir="ltr">− {fmt(calcs.totalDeductions)} AED</span></div>
                )}
                <div className="fs-doc-grand"><span>صافي المخالصة النهائية</span><span dir="ltr">{fmt(calcs.netSettlement)} AED</span></div>
              </div>
            </div>

            <div className="fs-doc-sigs">
              <div>
                <div className="fs-doc-line" />
                <p className="fs-doc-strong">توقيع الموظف / Employee Signature</p>
                <p className="fs-doc-small">التاريخ: ___ / ___ / ______</p>
              </div>
              <div>
                <div className="fs-doc-line" />
                <p className="fs-doc-strong">ختم وتوقيع المنشأة / Employer Stamp &amp; Signature</p>
                <p className="fs-doc-small">التاريخ: ___ / ___ / ______</p>
              </div>
            </div>

            <div className="fs-doc-disc">
              <span className="fs-doc-excl" aria-hidden="true">!</span>
              <div>
                <p className="fs-doc-strong">إخلاء مسؤولية رسمي</p>
                <p>هذه الحاسبة تقديرية وتعتمد على البيانات التي يدخلها المستخدم، ولا تمثل قراراً رسمياً من وزارة الموارد البشرية والتوطين (MOHRE) أو حكماً قانونياً نهائياً. قد تختلف المستحقات بحسب نوع العقد، نمط العمل، جهة الاختصاص، نظام الادخار البديل، أو الظروف الخاصة بإنهاء العلاقة العمالية.</p>
                <p dir="ltr" className="fs-doc-url">qemlo.com/ar/ae/final-settlement-calculator</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

/**
 * Local styles. Map the --fs-* fallbacks to your real Ink & Signal tokens.
 * The printed document (.fs-doc) always uses fixed ink-on-white colours.
 */
function FinalStyles() {
  return (
    <style>{`
      .fs-root{
        --fs-ink:#0a0a0a; --fs-paper:#ffffff; --fs-muted:#f0f0f0;
        --fs-text2:#404040; --fs-orange:#ff5a1f;
        max-width:52rem; margin:0 auto; padding:1.5rem 1rem;
        color:var(--fs-ink); background:var(--fs-paper); display:grid; gap:1rem;
      }
      @media (prefers-color-scheme: dark){
        :root:not([data-theme="light"]) .fs-root{
          --fs-ink:#f5f5f5; --fs-paper:#0a0a0a; --fs-muted:#1a1a1a; --fs-text2:#d4d4d4;
        }
      }
      :root[data-theme="dark"] .fs-root{
        --fs-ink:#f5f5f5; --fs-paper:#0a0a0a; --fs-muted:#1a1a1a; --fs-text2:#d4d4d4;
      }
      .fs-root :focus-visible{ outline:3px solid var(--fs-orange); outline-offset:2px; }
      .fs-ltr{ direction:ltr; unicode-bidi:isolate; display:inline-block; }
      .fs-stack{ display:grid; gap:1rem; }

      /* Text */
      .fs-h1{ margin:0; font-size:1.375rem; font-weight:800; line-height:1.5; }
      .fs-h2{ margin:0; font-size:.9375rem; font-weight:800; line-height:1.6; }
      .fs-lead{ margin:.25rem 0 0; font-size:.75rem; line-height:1.8; color:var(--fs-text2); }
      .fs-text{ margin:0; font-size:.75rem; line-height:1.9; color:var(--fs-text2); }
      .fs-small{ margin:0; font-size:.6875rem; line-height:1.8; color:var(--fs-text2); }
      .fs-small-b{ margin:0; font-size:.75rem; font-weight:800; }
      .fs-tag{ margin:0; padding:.125rem .75rem; border:2px solid var(--fs-ink); font-size:.75rem; font-weight:800; white-space:nowrap; }

      /* Cards */
      .fs-card{ border:2px solid var(--fs-ink); padding:1.25rem; display:grid; gap:1rem; }
      .fs-head-row{ display:flex; flex-wrap:wrap; gap:1rem; justify-content:space-between; align-items:flex-start; }
      .fs-step{ display:flex; align-items:center; gap:.625rem; }
      .fs-num{
        flex:none; width:1.75rem; height:1.75rem; display:inline-flex; align-items:center; justify-content:center;
        border:2px solid var(--fs-ink); font-size:.8125rem; font-weight:800;
      }
      .fs-box{ border:2px solid var(--fs-ink); padding:.75rem 1rem; display:grid; gap:.25rem; }
      .fs-dash{ border:2px dashed var(--fs-ink); padding:1rem; }
      .fs-row-between{ display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:.75rem; }
      .fs-calc{ border:2px solid var(--fs-ink); padding:.625rem .75rem; display:grid; gap:.125rem; align-content:start; }
      .fs-calc-v{ margin:0; font-size:1rem; font-weight:900; }
      .fs-fieldset{ margin:0; border:2px solid var(--fs-ink); padding:1rem; display:grid; gap:.75rem; min-width:0; }
      .fs-fieldset-dash{ border-style:dashed; }
      .fs-legend{ padding:0 .5rem; font-size:.75rem; font-weight:800; }

      /* Notes */
      .fs-note{
        display:flex; gap:.5rem; align-items:flex-start; border:2px solid var(--fs-ink);
        border-inline-start:6px solid var(--fs-orange); padding:.625rem .75rem;
      }
      .fs-note-dash{ border:2px dashed var(--fs-ink); }
      .fs-note-text{ margin:0; font-size:.75rem; line-height:1.9; color:var(--fs-text2); }
      .fs-mark{
        flex:none; width:1.25rem; height:1.25rem; display:inline-flex; align-items:center; justify-content:center;
        border:2px solid currentColor; font-size:.75rem; font-weight:900; color:var(--fs-ink);
      }

      /* Buttons */
      .fs-actions{ display:flex; flex-wrap:wrap; gap:.5rem; align-items:center; }
      .fs-btn{
        padding:.5rem .875rem; border:2px solid var(--fs-ink); font-size:.75rem; font-weight:800;
        font-family:inherit; cursor:pointer; background:var(--fs-paper); color:var(--fs-ink);
      }
      .fs-btn:hover{ background:var(--fs-muted); }
      .fs-btn-sm{ padding:.25rem .625rem; }
      .fs-btn-p{ background:var(--fs-orange); color:#0a0a0a; }
      .fs-btn-p:hover{ background:var(--fs-ink); color:var(--fs-paper); }
      .fs-btn-plain{ border-style:dashed; }
      .fs-bottom .fs-btn{ flex:1; padding:.75rem 1rem; font-size:.8125rem; }
      .fs-link{
        justify-self:start; background:none; border:0; padding:0; font-family:inherit; font-size:.75rem;
        font-weight:800; color:var(--fs-ink); text-decoration:underline; text-underline-offset:3px; cursor:pointer;
      }

      /* Tabs / segmented */
      .fs-tabs,.fs-seg{ display:flex; border:2px solid var(--fs-ink); }
      .fs-tabs button,.fs-seg button{
        flex:1; padding:.5rem .75rem; border:0; background:var(--fs-paper); color:var(--fs-ink);
        font-size:.75rem; font-weight:800; font-family:inherit; cursor:pointer; line-height:1.6;
      }
      .fs-tabs button + button,.fs-seg button + button{ border-inline-start:2px solid var(--fs-ink); }
      .fs-tabs button[aria-pressed="true"],.fs-seg button[aria-pressed="true"]{ background:var(--fs-ink); color:var(--fs-paper); }

      /* Fields */
      .fs-two,.fs-three{ display:grid; gap:.875rem; grid-template-columns:1fr; }
      @media (min-width:640px){ .fs-two{ grid-template-columns:1fr 1fr; } .fs-three{ grid-template-columns:repeat(3,1fr); } }
      .fs-field{ display:grid; gap:.25rem; align-content:start; }
      .fs-label{ margin:0; font-size:.75rem; font-weight:800; line-height:1.6; }
      .fs-hint{ font-weight:600; color:var(--fs-text2); }
      .fs-input{
        width:100%; min-width:0; box-sizing:border-box; border:2px solid var(--fs-ink);
        background:var(--fs-paper); color:var(--fs-ink); padding:.625rem .75rem;
        font-size:.8125rem; font-weight:700; font-family:inherit;
      }

      /* Summary (orange panel, black text) */
      .fs-result{ background:var(--fs-orange); color:#0a0a0a; border:2px solid var(--fs-ink); padding:1.25rem; display:grid; gap:.75rem; }
      .fs-result .fs-small-b,.fs-result .fs-text{ color:#0a0a0a; }
      .fs-result-h{ margin:0; font-size:.9375rem; font-weight:800; }
      .fs-tbox{ background:#fff; color:#0a0a0a; border:2px solid #0a0a0a; }
      .fs-pad{ padding:.75rem 1rem; display:grid; gap:.5rem; }
      .fs-pad .fs-link{ color:#0a0a0a; }
      .fs-trow{ display:flex; justify-content:space-between; gap:1rem; padding:.375rem .75rem; border-top:1px solid #0a0a0a; font-size:.75rem; font-weight:700; }
      .fs-trow:first-child{ border-top:0; }
      .fs-trow-b{ border-top:2px solid #0a0a0a; font-weight:800; }
      .fs-trow-note{ margin:0; padding:0 .75rem .375rem; font-size:.6875rem; line-height:1.8; color:#404040; }
      .fs-chip{ margin-inline-start:.5rem; border:1px solid #0a0a0a; padding:0 .375rem; font-size:.625rem; font-weight:800; }
      .fs-grand{ display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap; align-items:center; font-size:1.125rem; font-weight:900; }

      /* Preview */
      .fs-preview{ display:none; }
      .fs-show{ display:block; }
      .fs-prev-bar{ margin-bottom:1rem; }

      /* Document: fixed ink on white, independent of theme */
      .fs-doc{ --d-ink:#0a0a0a; --d-text2:#404040; --d-or:#ff5a1f; background:#fff; color:var(--d-ink); border:2px solid #0a0a0a; }
      .fs-doc p{ margin:0; }
      .fs-doc-head{ background:var(--d-or); color:#0a0a0a; border-bottom:2px solid #0a0a0a; padding:1.25rem 1.5rem; text-align:center; display:grid; gap:.25rem; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
      .fs-doc-title{ margin:0; font-size:1.5rem; font-weight:900; }
      .fs-doc-sub{ font-size:.8125rem; font-weight:700; }
      .fs-doc-small{ font-size:.6875rem; color:var(--d-text2); }
      .fs-doc-head .fs-doc-small{ color:#0a0a0a; }
      .fs-doc-body{ padding:1.25rem 1.5rem; display:grid; gap:1.25rem; }
      .fs-doc-meta{ display:grid; gap:.75rem; grid-template-columns:1fr; border:2px solid var(--d-ink); padding:.75rem 1rem; }
      @media (min-width:640px){ .fs-doc-meta{ grid-template-columns:repeat(3,1fr); } }
      .fs-doc-cap{ display:block; font-size:.6875rem; font-weight:800; color:var(--d-text2); }
      .fs-doc-input{ width:100%; box-sizing:border-box; border:0; border-bottom:2px dashed var(--d-ink); background:transparent; color:var(--d-ink); font-family:inherit; font-size:.8125rem; font-weight:800; padding:.25rem 0; }
      .fs-doc-input:focus-visible{ outline:3px solid var(--d-or); outline-offset:2px; }
      .fs-doc-info{ margin:0; display:grid; gap:.5rem 1rem; grid-template-columns:1fr 1fr; border:2px solid var(--d-ink); padding:.75rem 1rem; font-size:.75rem; }
      @media (min-width:640px){ .fs-doc-info{ grid-template-columns:repeat(3,1fr); } }
      .fs-doc-info dt{ color:var(--d-text2); font-size:.6875rem; }
      .fs-doc-info dd{ margin:0; font-weight:800; }
      .fs-doc-scroll{ overflow-x:auto; }
      .fs-doc-table{ width:100%; border-collapse:collapse; font-size:.75rem; border:2px solid var(--d-ink); }
      .fs-doc-table th{ background:#0a0a0a; color:#fff; text-align:right; padding:.5rem; font-weight:800; white-space:nowrap; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
      .fs-doc-table td{ padding:.5rem; border-bottom:1px solid var(--d-ink); color:var(--d-text2); vertical-align:top; }
      .fs-doc-table tr:last-child td{ border-bottom:0; }
      .fs-doc-table td:last-child{ text-align:left; white-space:nowrap; }
      .fs-doc-strong{ font-weight:800; color:var(--d-ink) !important; }
      .fs-doc-tot-wrap{ display:flex; justify-content:flex-end; }
      .fs-doc-tot{ width:100%; max-width:20rem; border:2px solid var(--d-ink); }
      .fs-doc-trow{ display:flex; justify-content:space-between; gap:1rem; padding:.375rem .75rem; border-bottom:1px solid var(--d-ink); font-size:.75rem; font-weight:700; }
      .fs-doc-grand{ display:flex; justify-content:space-between; gap:1rem; padding:.625rem .75rem; background:var(--d-or); color:#0a0a0a; font-size:.875rem; font-weight:900; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
      .fs-doc-sigs{ display:grid; grid-template-columns:1fr 1fr; gap:2rem; padding-top:.75rem; text-align:center; font-size:.6875rem; }
      .fs-doc-line{ border-bottom:2px solid var(--d-ink); height:3rem; margin-bottom:.5rem; }
      .fs-doc-disc{ display:flex; gap:.5rem; align-items:flex-start; border:2px dashed var(--d-ink); padding:.625rem .75rem; font-size:.625rem; line-height:1.8; color:var(--d-text2); }
      .fs-doc-disc > div{ display:grid; gap:.25rem; }
      .fs-doc-excl{ flex:none; width:1.25rem; height:1.25rem; display:inline-flex; align-items:center; justify-content:center; border:2px solid var(--d-ink); font-weight:800; color:var(--d-ink); }
      .fs-doc-url{ font-size:.5625rem; }

      @media print{
        .fs-noprint{ display:none !important; }
        .fs-root{ padding:0; max-width:none; background:#fff; }
        .fs-preview{ display:block; }
        .fs-doc{ border:0; }
        .fs-doc-scroll{ overflow:visible; }
        .fs-doc-input{ border-bottom:0; }
        .fs-doc-tot,.fs-doc-sigs,.fs-doc-disc,.fs-doc-table tr{ break-inside:avoid; }
      }
    `}</style>
  );
}