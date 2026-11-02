"use client";

/**
 * components/UaeNoticePeriodCalculator.jsx
 * Ink & Signal: UAE notice period calculator.
 * Helpers (toNum, fmt, formatDateAr, addDays, getDaysDiff), all state, every
 * useMemo and the presets are unchanged. Changes: local styling (no Tailwind
 * colours), emoji removed, labels bound with htmlFor, toggles use
 * aria-pressed, the print summary is a real dialog (role="dialog", Escape to
 * close, only the summary prints), direction/validity never rely on colour
 * alone, and the unused `Link` import is gone.
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

function getUaeDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function formatDateAr(dateStr) {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return "—";
  const d = new Date(Date.UTC(year, month - 1, day, 12));
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ar-AE", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Add Gregorian calendar days to a date string without browser-timezone drift. */
function addDays(dateStr, days) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day || !Number.isFinite(Number(days))) return "";
  const d = new Date(Date.UTC(year, month - 1, day + Number(days)));
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    String(d.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

/** Calculate Gregorian calendar day difference independent of browser timezone. */
function getDaysDiff(startStr, endStr) {
  if (!startStr || !endStr) return 0;
  const [sy, sm, sd] = startStr.split("-").map(Number);
  const [ey, em, ed] = endStr.split("-").map(Number);
  if (![sy, sm, sd, ey, em, ed].every(Number.isFinite)) return 0;
  const start = Date.UTC(sy, sm - 1, sd);
  const end = Date.UTC(ey, em - 1, ed);
  return Math.round((end - start) / 86400000);
}

// ─── Small UI pieces ───────────────────────────────────────────────────────────
function Seg({ id, label, value, onChange, options, cols }) {
  return (
    <div className="nc-field">
      <p id={id} className="nc-label">{label}</p>
      <div className={`nc-seg ${cols ? "nc-seg-wrap" : ""}`} role="group" aria-labelledby={id}>
        {options.map((o) => (
          <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

function Step({ n, id, children }) {
  return (
    <div className="nc-step">
      <span className="nc-num" aria-hidden="true">{n}</span>
      <h2 id={id} className="nc-h2">{children}</h2>
    </div>
  );
}

function Note({ title, children, dashed = false }) {
  return (
    <aside className={`nc-note ${dashed ? "nc-note-dash" : ""}`}>
      <span className="nc-mark" aria-hidden="true">!</span>
      <p className="nc-note-text">{title && <strong>{title} </strong>}{children}</p>
    </aside>
  );
}

function Row({ k, v, strong }) {
  return (
    <div className="nc-row">
      <dt>{k}</dt>
      <dd className={strong ? "nc-strong" : ""}>{v}</dd>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function UaeNoticePeriodCalculator() {
  // Scope
  const [isPrivateSector, setIsPrivateSector] = useState("unsure");
  const [isExcludedCategory, setIsExcludedCategory] = useState("unsure");
  const [isDifcAdgm, setIsDifcAdgm] = useState("unsure");
  // Probation
  const [isProbation, setIsProbation] = useState("unsure");
  // Core inputs
  const [terminationInitiator, setTerminationInitiator] = useState("unsure");
  const [nonCompliantParty, setNonCompliantParty] = useState("unsure");
  const [noticeStartDate, setNoticeStartDate] = useState(() => getUaeDateString());
  const [contractNoticePreset, setContractNoticePreset] = useState("custom");
  const [customNoticeDays, setCustomNoticeDays] = useState("");
  const [servedInputMode, setServedInputMode] = useState("days");
  const [servedDaysInput, setServedDaysInput] = useState("");
  const [actualLastWorkingDate, setActualLastWorkingDate] = useState("");
  const [lastWage, setLastWage] = useState("");
  const [isMutualWaiver, setIsMutualWaiver] = useState(false);

  // UI
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [employerName, setEmployerName] = useState("");

  // ── Calculations (unchanged) ─────────────────────────────────────────────────
  const requiredNoticeDays = useMemo(() => {
    if (contractNoticePreset === "custom") {
      return toNum(customNoticeDays);
    }
    return toNum(contractNoticePreset);
  }, [contractNoticePreset, customNoticeDays]);

  const noticeValidation = useMemo(() => {
    if (requiredNoticeDays < 30) {
      return {
        status: "warning",
        msg: "الأصل وفق المادة (43) أن تكون مدة الإنذار المتفق عليها بين 30 و90 يوماً. إذا كان هناك اتفاق كتابي على تخفيض المهلة أو الإعفاء منها، اختر خانة الاتفاق الكتابي أدناه؛ ستتوقف الحاسبة عن إصدار رقم آلي حتى تُراجع الحقوق المحفوظة في الاتفاق وفق المادة (43/2).",
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

  const expectedLastWorkingDate = useMemo(() => {
    if (!noticeStartDate || requiredNoticeDays <= 0) return "";
    return addDays(noticeStartDate, requiredNoticeDays);
  }, [noticeStartDate, requiredNoticeDays]);

  const handleStartDateChange = (newDate) => {
    setNoticeStartDate(newDate);
  };

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

  const isActualDateInvalid = useMemo(() => {
    if (servedInputMode !== "date") return false;
    if (!noticeStartDate || !actualLastWorkingDate) return false;
    return actualLastWorkingDate < noticeStartDate;
  }, [servedInputMode, noticeStartDate, actualLastWorkingDate]);

  const remainingNoticeDays = useMemo(() => {
    return Math.max(requiredNoticeDays - servedNoticeDays, 0);
  }, [requiredNoticeDays, servedNoticeDays]);

  const wage = toNum(lastWage);
  const dailyWage = wage / 30;
  const estimatedCompensation = remainingNoticeDays * dailyWage;

  const calculationBlockReason = useMemo(() => {
    if (isPrivateSector !== "yes") {
      return isPrivateSector === "no"
        ? "هذه الحاسبة لا تشمل القطاع الحكومي أو الجهات التي لا تخضع لقانون العمل الاتحادي."
        : "أكد أولاً أن عقد العمل في القطاع الخاص الخاضع لقانون العمل الاتحادي. لن تصدر الحاسبة نتيجة قبل تأكيد نطاق العمل.";
    }
    if (isExcludedCategory !== "no") {
      return isExcludedCategory === "yes"
        ? "لا تشمل هذه الحاسبة العمالة المنزلية أو العاملين في القوات المسلحة أو الشرطة أو الأمن؛ فهذه الفئات مستثناة من نطاق هذا القانون أو تخضع لتشريعات أخرى."
        : "أكد أنك لا تعمل ضمن العمالة المنزلية أو القوات المسلحة أو الشرطة أو الأمن؛ هذه الفئات لا تستخدم هذه الحاسبة.";
    }
    if (isDifcAdgm !== "no") {
      return isDifcAdgm === "yes"
        ? "أنظمة DIFC وADGM مستقلة عن قانون العمل الاتحادي؛ لا يمكن لهذه الحاسبة تقدير فترة الإنذار الخاصة بهما."
        : "أكد أنك لا تعمل في DIFC أو ADGM؛ لهاتين المنطقتين إطارا عمل مستقلان عن القانون الاتحادي.";
    }
    if (isProbation !== "no") {
      return isProbation === "yes"
        ? "فترة التجربة تخضع للمادة (9) وليس للمادة (43). تختلف المهلة حسب الحالة: 14 يوماً لإنهاء صاحب العمل، أو شهراً للانتقال إلى صاحب عمل آخر داخل الدولة، أو 14 يوماً للعامل الأجنبي الذي يغادر الدولة. هذه الحاسبة لا تصدر نتيجة لفترة التجربة."
        : "أكد أن فترة التجربة انتهت قبل استخدام حاسبة المادة (43). إذا لم تتأكد من حالة التجربة، لا تعتمد على هذا التقدير.";
    }
    if (isMutualWaiver) {
      return "عند الاتفاق الكتابي على الإعفاء أو تخفيض الإنذار، لا يعني ذلك تلقائياً أن بدل الإنذار يساوي صفراً؛ فالمادة (43/2) تشترط حفظ حقوق العامل. راجع نص الاتفاق وMOHRE، وهذه الحاسبة لا تحسب اتفاقات الإعفاء أو التسوية الخاصة.";
    }
    if (nonCompliantParty === "unsure") {
      return "حدد الطرف الذي لم يلتزم بإكمال فترة الإنذار. الطرف الذي بدأ إنهاء العقد ليس بالضرورة الطرف المخل؛ إذا لم تتأكد، راجع الإخطار والاتفاق أو استشر MOHRE قبل الاعتماد على أي مبلغ.";
    }
    if (noticeValidation.msg) return noticeValidation.msg;
    if (!Number.isInteger(requiredNoticeDays)) {
      return "أدخل مدة إنذار كاملة بالأيام دون كسور.";
    }
    if (!noticeStartDate) return "أدخل تاريخ الإشعار قبل حساب آخر يوم عمل.";
    if (servedInputMode === "days" && String(servedDaysInput ?? "").trim() === "") {
      return "أدخل عدد الأيام التي نُفذت فعلياً من فترة الإنذار.";
    }
    if (servedInputMode === "date" && !actualLastWorkingDate) {
      return "أدخل آخر يوم عمل فعلي أو بدّل طريقة الإدخال إلى عدد الأيام.";
    }
    if (isActualDateInvalid) {
      return "لا يمكن أن يكون آخر يوم عمل فعلي قبل تاريخ تقديم الإشعار.";
    }
    if (!Number.isInteger(servedNoticeDays)) {
      return "أدخل عدد الأيام المنفذة كعدد صحيح دون كسور.";
    }
    if (servedNoticeDays > requiredNoticeDays) {
      return "الأيام المنفذة لا يمكن أن تتجاوز مدة الإنذار المتفق عليها. راجع التاريخ أو عدد الأيام المدخل.";
    }
    if (wage <= 0) return "أدخل آخر أجر شهري إجمالي أكبر من صفر.";
    return "";
  }, [
    isPrivateSector,
    isExcludedCategory,
    isDifcAdgm,
    isProbation,
    nonCompliantParty,
    noticeValidation.msg,
    requiredNoticeDays,
    noticeStartDate,
    servedInputMode,
    actualLastWorkingDate,
    isActualDateInvalid,
    servedNoticeDays,
    wage,
    isMutualWaiver,
  ]);

  const compensationDirection = useMemo(() => {
    if (remainingNoticeDays <= 0 || wage <= 0 || nonCompliantParty === "unsure") return "none";
    return nonCompliantParty === "employer" ? "to_employee" : "to_employer";
  }, [remainingNoticeDays, wage, nonCompliantParty]);

  const timelineProgress = useMemo(() => {
    if (requiredNoticeDays <= 0) return 100;
    const pct = Math.min(100, Math.round((servedNoticeDays / requiredNoticeDays) * 100));
    return Math.max(0, pct);
  }, [servedNoticeDays, requiredNoticeDays]);

  // ── Presets / reset (unchanged) ──────────────────────────────────────────────
  const applyPreset = (presetNum) => {
    if (presetNum === 1) {
      setTerminationInitiator("employee");
      setNonCompliantParty("employee");
      setContractNoticePreset("60");
      setServedInputMode("days");
      setServedDaysInput("60");
      setLastWage("9000");
      setIsMutualWaiver(false);
      setIsProbation("no");
      setIsPrivateSector("yes");
      setIsExcludedCategory("no");
      setIsDifcAdgm("no");
    } else if (presetNum === 2) {
      setTerminationInitiator("employee");
      setNonCompliantParty("employee");
      setContractNoticePreset("60");
      setServedInputMode("days");
      setServedDaysInput("40");
      setLastWage("9000");
      setIsMutualWaiver(false);
      setIsProbation("no");
      setIsPrivateSector("yes");
      setIsExcludedCategory("no");
      setIsDifcAdgm("no");
    } else if (presetNum === 3) {
      setTerminationInitiator("employer");
      setNonCompliantParty("employer");
      setContractNoticePreset("30");
      setServedInputMode("days");
      setServedDaysInput("10");
      setLastWage("12000");
      setIsMutualWaiver(false);
      setIsProbation("no");
      setIsPrivateSector("yes");
      setIsExcludedCategory("no");
      setIsDifcAdgm("no");
    }
  };

  const handleReset = () => {
    setIsPrivateSector("unsure");
    setIsExcludedCategory("unsure");
    setIsDifcAdgm("unsure");
    setIsProbation("unsure");
    setTerminationInitiator("unsure");
    setNonCompliantParty("unsure");
    const today = getUaeDateString();
    setNoticeStartDate(today);
    setContractNoticePreset("custom");
    setCustomNoticeDays("");
    setServedInputMode("days");
    setServedDaysInput("");
    setActualLastWorkingDate("");
    setLastWage("");
    setIsMutualWaiver(false);
    setEmployeeName("");
    setEmployerName("");
  };

  // ── Display helpers ──────────────────────────────────────────────────────────
  const dirTitle =
    compensationDirection === "to_employee" ? "بدل إنذار لصالح الموظف (+)"
    : compensationDirection === "to_employer" ? "بدل إنذار لصالح صاحب العمل (−)"
    : remainingNoticeDays === 0 ? "تم تنفيذ فترة الإنذار كاملة"
    : "لا يوجد بدل مستحق";
  const beneficiary =
    compensationDirection === "to_employee" ? "الموظف"
    : compensationDirection === "to_employer" ? "صاحب العمل"
    : "لا يوجد (تم استيفاء المدة)";

  const yesNoUnsure = (yesFirst) => (yesFirst
    ? [{ id: "yes", label: "نعم" }, { id: "no", label: "لا" }, { id: "unsure", label: "غير متأكد" }]
    : [{ id: "no", label: "لا" }, { id: "yes", label: "نعم" }, { id: "unsure", label: "غير متأكد" }]);

  const onModalKey = (e) => { if (e.key === "Escape") setShowPrintModal(false); };

  return (
    <div className="nc-root" dir="rtl">
      <NoticeStyles />

      <div className="nc-main">
        {/* Header */}
        <header className="nc-card">
          <div className="nc-head-row">
            <div>
              <h1 className="nc-h1">حاسبة فترة الإنذار في الإمارات</h1>
              <p className="nc-lead">احتساب آخر يوم عمل، الأيام غير المنفذة، وبدل الإنذار التعويضي وفق أحكام المادة (43) من قانون العمل الإماراتي رقم 33 لسنة 2021</p>
            </div>
            <div className="nc-actions">
              <p className="nc-tag">المادة 43</p>
              <p className="nc-tag">حساب فوري</p>
            </div>
          </div>
        </header>

        {/* Presets */}
        <section className="nc-card" aria-labelledby="nc-presets">
          <div className="nc-row-between">
            <p id="nc-presets" className="nc-small-b">أمثلة عملية سريعة (اضغط للتطبيق المباشر)</p>
            <button type="button" className="nc-link" onClick={handleReset}>إعادة تعيين</button>
          </div>
          <div className="nc-three">
            <button type="button" className="nc-opt" onClick={() => applyPreset(1)}>
              <span className="nc-opt-t">مثال 1: استقالة وتنفيذ كامل</span>
              <span className="nc-opt-d">إنذار 60 يوماً / نُفذت 60 / لا تعويض (0)</span>
            </button>
            <button type="button" className="nc-opt" onClick={() => applyPreset(2)}>
              <span className="nc-opt-t">مثال 2: استقالة وتنفيذ جزئي</span>
              <span className="nc-opt-d">خدم 40 من 60 يوماً / 6,000 درهم لصاحب العمل</span>
            </button>
            <button type="button" className="nc-opt" onClick={() => applyPreset(3)}>
              <span className="nc-opt-t">مثال 3: إنهاء من صاحب العمل</span>
              <span className="nc-opt-d">خدم 10 من 30 يوماً / 8,000 درهم لصالح الموظف</span>
            </button>
          </div>
        </section>

        <div className="nc-grid">
          {/* ── Inputs ── */}
          <div className="nc-col">
            {/* 1 — Scope */}
            <section className="nc-card" aria-labelledby="nc-s1">
              <Step n="1" id="nc-s1">فحص النطاق وجهة الاختصاص</Step>

              <Seg id="nc-private" label="هل تعمل في القطاع الخاص الخاضع لقانون العمل الإماراتي؟" value={isPrivateSector} onChange={setIsPrivateSector} options={yesNoUnsure(true)} />
              {isPrivateSector !== "yes" && (
                <Note title="تنبيه:">قد تختلف التشريعات المنظمة للقطاعات الحكومية وشبه الحكومية والمناطق ذات الأنظمة المستقلة عن أحكام المادة (43) من قانون العمل الاتحادي.</Note>
              )}

              <Seg id="nc-excluded" label="هل تعمل في العمالة المنزلية أو القوات المسلحة أو الشرطة أو الأمن؟" value={isExcludedCategory} onChange={setIsExcludedCategory} options={yesNoUnsure(false)} />
              {isExcludedCategory !== "no" && (
                <Note title="تنبيه:">هذه الفئات مستثناة من نطاق قانون العمل الاتحادي العام أو تخضع لتشريعات منفصلة؛ لن تصدر الحاسبة نتيجة رقمية لها.</Note>
              )}

              <Seg id="nc-difc" label="هل تعمل في DIFC أو ADGM؟" value={isDifcAdgm} onChange={setIsDifcAdgm} options={yesNoUnsure(false)} />
              {isDifcAdgm !== "no" && (
                <Note title="تنبيه:">قد تختلف قواعد الإشعار في DIFC أو ADGM، لذلك لا ينبغي الاعتماد على هذه الحاسبة وحدها.</Note>
              )}

              <Seg id="nc-prob" label="هل الموظف لا يزال في فترة التجربة؟" value={isProbation} onChange={setIsProbation}
                options={[{ id: "no", label: "لا" }, { id: "yes", label: "نعم" }, { id: "unsure", label: "غير متأكد" }]} />
              {isProbation !== "no" && (
                <Note>لا تصدر الحاسبة نتيجة إلا بعد تأكيد انتهاء فترة التجربة؛ فحالات التجربة تخضع للمادة (9) لا للمادة (43).</Note>
              )}
            </section>

            {/* 2 — Notice details */}
            <section className="nc-card" aria-labelledby="nc-s2">
              <Step n="2" id="nc-s2">بيانات إشعار الإنهاء وعقد العمل</Step>

              <Seg id="nc-init" label="من بدأ إنهاء عقد العمل؟" value={terminationInitiator} onChange={setTerminationInitiator}
                options={[{ id: "employee", label: "الموظف" }, { id: "employer", label: "صاحب العمل" }, { id: "unsure", label: "غير متأكد" }]} />

              <Seg id="nc-breach" label="من الطرف الذي لم يلتزم بإكمال فترة الإنذار؟" value={nonCompliantParty} onChange={setNonCompliantParty}
                options={[{ id: "employee", label: "الموظف" }, { id: "employer", label: "صاحب العمل" }, { id: "unsure", label: "غير متأكد" }]} />
              <Note>وفق المادة (43/3)، الطرف الذي لم يلتزم بمدة الإنذار هو الذي يدفع البدل للطرف الآخر؛ وليس بالضرورة الطرف الذي بدأ إنهاء العقد.</Note>

              <div className="nc-field">
                <label htmlFor="nc-start" className="nc-label">تاريخ تقديم الإشعار / الاستقالة</label>
                <input id="nc-start" type="date" dir="ltr" className="nc-input" value={noticeStartDate}
                  onChange={(e) => handleStartDateChange(e.target.value)} aria-describedby="nc-start-h" />
                <p id="nc-start-h" className="nc-small">تاريخ تقديم الإشعار: {formatDateAr(noticeStartDate)}</p>
              </div>

              <div className="nc-stack">
                <div className="nc-row-between">
                  <p id="nc-len" className="nc-label">فترة الإنذار المتفق عليها</p>
                  <p className="nc-small-b">الحد النظامي: 30 إلى 90 يوماً</p>
                </div>
                <div className="nc-seg nc-seg-wrap" role="group" aria-labelledby="nc-len">
                  {[
                    { id: "30", label: "30 يوماً" },
                    { id: "45", label: "45 يوماً" },
                    { id: "60", label: "60 يوماً" },
                    { id: "90", label: "90 يوماً" },
                    { id: "custom", label: "مخصصة" },
                  ].map((p) => (
                    <button key={p.id} type="button" aria-pressed={contractNoticePreset === p.id} onClick={() => setContractNoticePreset(p.id)}>{p.label}</button>
                  ))}
                </div>

                {contractNoticePreset === "custom" && (
                  <div className="nc-field">
                    <label htmlFor="nc-custom" className="nc-label">أدخل عدد الأيام المخصصة</label>
                    <div className="nc-input-wrap">
                      <input id="nc-custom" type="number" min="1" max="365" dir="ltr" className="nc-input-bare"
                        value={customNoticeDays} onChange={(e) => setCustomNoticeDays(e.target.value)} />
                      <span className="nc-sym" aria-hidden="true">يوماً</span>
                    </div>
                  </div>
                )}

                {noticeValidation.msg && <Note>{noticeValidation.msg}</Note>}
              </div>
            </section>

            {/* 3 — Served + wage */}
            <section className="nc-card" aria-labelledby="nc-s3">
              <Step n="3" id="nc-s3">الأيام المنفذة وآخر أجر</Step>

              <Seg id="nc-mode" label="الأيام المنفذة فعلياً من فترة الإنذار" value={servedInputMode} onChange={setServedInputMode}
                options={[{ id: "days", label: "عدد الأيام التي تم تنفيذها" }, { id: "date", label: "آخر يوم عمل فعلي" }]} />

              {servedInputMode === "days" ? (
                <div className="nc-field">
                  <label htmlFor="nc-served" className="nc-label">عدد الأيام المنفذة</label>
                  <div className="nc-input-wrap">
                    <input id="nc-served" type="number" min="0" dir="ltr" className="nc-input-bare"
                      value={servedDaysInput} onChange={(e) => setServedDaysInput(e.target.value)} />
                    <span className="nc-sym" aria-hidden="true">يوماً</span>
                  </div>
                </div>
              ) : (
                <div className="nc-field">
                  <label htmlFor="nc-actual" className="nc-label">حدد آخر يوم عمل فعلي</label>
                  <input id="nc-actual" type="date" dir="ltr" className="nc-input" value={actualLastWorkingDate}
                    onChange={(e) => setActualLastWorkingDate(e.target.value)}
                    aria-invalid={isActualDateInvalid} aria-describedby="nc-actual-m" />
                  {isActualDateInvalid ? (
                    <p id="nc-actual-m" className="nc-err">لا يمكن أن يكون آخر يوم عمل قبل تاريخ تقديم الإشعار.</p>
                  ) : (
                    <p id="nc-actual-m" className="nc-small">الأيام المنفذة المحسوبة تلقائياً: <strong>{servedNoticeDays} يوماً</strong>.</p>
                  )}
                </div>
              )}

              <div className="nc-field">
                <label htmlFor="nc-wage" className="nc-label">
                  آخر أجر شهري إجمالي <span className="nc-hint">(للعامل الذي يتقاضى راتباً شهرياً)</span>
                </label>
                <div className="nc-input-wrap">
                  <input id="nc-wage" type="number" min="0" step="100" dir="ltr" className="nc-input-bare"
                    value={lastWage} onChange={(e) => setLastWage(e.target.value)} placeholder="مثال: 9000" aria-describedby="nc-wage-h" />
                  <span className="nc-sym" aria-hidden="true">AED</span>
                </div>
                <p id="nc-wage-h" className="nc-small">أدخل آخر أجر شهري وفق تعريف «الأجر» في المادة (1): الأجر الأساسي مضافاً إليه البدلات النقدية والمزايا العينية المقررة كجزء من الأجر في العقد أو القانون.</p>
                <p className="nc-small">هذه النسخة تدعم الأجر الشهري فقط. الأجر الأسبوعي أو اليومي أو بالساعة أو بالقطعة يحتاج أساس احتساب مختلفاً وفق المادة (43/4)، فلا تستخدم هذه النتيجة لهذه الحالات.</p>
              </div>

              <div className="nc-block">
                <label className="nc-check">
                  <input type="checkbox" checked={isMutualWaiver} onChange={(e) => setIsMutualWaiver(e.target.checked)} />
                  <span>يوجد اتفاق كتابي على الإعفاء من مهلة الإنذار أو تخفيضها مع حفظ الحقوق.</span>
                </label>
              </div>
            </section>
          </div>

          {/* ── Results ── */}
          <div className="nc-col nc-sticky">
            <section className="nc-result" aria-live="polite" aria-labelledby="nc-res">
              <div className="nc-row-between">
                <h2 id="nc-res" className="nc-result-h">بطاقة النتائج (تقديري)</h2>
                <p className="nc-chip">المادة 43</p>
              </div>

              {calculationBlockReason ? (
                <div className="nc-white" role="status">
                  <p className="nc-small-b">لا يمكن إصدار نتيجة رقمية موثوقة بهذه البيانات</p>
                  <p className="nc-small">{calculationBlockReason}</p>
                  <p className="nc-small">راجع عقد العمل والمصدر الرسمي قبل اتخاذ قرار مالي أو قانوني.</p>
                  <a href="https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/job-offers-and-work-permits-and-contracts/terminating-employment-contracts" target="_blank" rel="noopener noreferrer" className="nc-link">الاطلاع على إرشادات حكومة الإمارات الرسمية</a>
                </div>
              ) : (
                <>
                  <div className="nc-banner">
                    <p className="nc-banner-t">{dirTitle}</p>
                    <p className="nc-big"><span className="nc-ltr">{fmt(estimatedCompensation)} AED</span></p>
                    <p className="nc-banner-s">
                      {remainingNoticeDays > 0
                        ? `مقابل ${remainingNoticeDays} يوماً غير منفذة (الأجر اليومي ${fmt(dailyWage)} AED)`
                        : "0 أيام متبقية: لا تعويض مالي مستحق"}
                    </p>
                  </div>

                  <dl className="nc-dl">
                    <Row k="تاريخ الإشعار" v={formatDateAr(noticeStartDate)} />
                    <Row k="فترة الإنذار" v={`${requiredNoticeDays} يوم`} />
                    <Row k="آخر يوم عمل المتوقع" v={formatDateAr(expectedLastWorkingDate)} strong />
                    <Row k="الأيام المنفذة" v={`${servedNoticeDays} يوم`} />
                    <Row k="الأيام غير المنفذة" v={`${remainingNoticeDays} يوم`} strong />
                    <Row k="آخر أجر شهري" v={<span className="nc-ltr">{fmt(wage)} AED</span>} />
                    <Row k="الأجر اليومي التقديري" v={<span className="nc-ltr">{fmt(dailyWage)} AED</span>} />
                    <Row k="بدل الإنذار" v={<span className="nc-ltr">{fmt(estimatedCompensation)} AED</span>} strong />
                    <Row k="الطرف المستفيد" v={beneficiary} strong />
                  </dl>

                  {terminationInitiator !== "employee" && (
                    <div className="nc-white">
                      <p className="nc-small-b">ملاحظة (المادة 43 - البند 5)</p>
                      <p className="nc-small">إذا كان صاحب العمل هو من أنهى عقد العمل، يحق للعامل التغيب يوماً واحداً غير مدفوع الأجر أسبوعياً للبحث عن عمل، شريطة إخطار صاحب العمل قبل يوم الغياب بثلاثة أيام على الأقل. إذا لم تتأكد من الطرف الذي بدأ الإنهاء، تحقق من الإخطار المكتوب.</p>
                    </div>
                  )}

                  <button type="button" className="nc-btn nc-btn-ink" onClick={() => setShowPrintModal(true)}>
                    إنشاء ملخص فترة الإنذار قابل للطباعة
                  </button>
                </>
              )}
            </section>

            {!calculationBlockReason && (
            <>
            {/* Timeline */}
            <section className="nc-card" aria-labelledby="nc-tl">
              <h3 id="nc-tl" className="nc-h3">المخطط الزمني لفترة الإنذار</h3>
              <div className="nc-stack">
                <div className="nc-row-between nc-small-b">
                  <span>تم تنفيذ {servedNoticeDays} يوماً ({timelineProgress}%)</span>
                  <span>المتبقي {remainingNoticeDays} يوماً</span>
                </div>
                <div className="nc-track" role="img" aria-label={`تم تنفيذ ${timelineProgress}% من فترة الإنذار، المتبقي ${remainingNoticeDays} يوماً`}>
                  <div className="nc-fill" style={{ width: `${timelineProgress}%` }} />
                </div>
              </div>

              <ol className="nc-tl">
                <li>
                  <span className="nc-dot" aria-hidden="true">1</span>
                  <div>
                    <p className="nc-small-b">تاريخ الإشعار: {formatDateAr(noticeStartDate)}</p>
                    <p className="nc-small">بداية سريان فترة الإنذار ({requiredNoticeDays} يوماً).</p>
                  </div>
                </li>
                <li>
                  <span className="nc-dot" aria-hidden="true">2</span>
                  <div>
                    <p className="nc-small-b">فترة الإنذار المنفذة: {servedNoticeDays} يوماً</p>
                    <p className="nc-small">
                      {remainingNoticeDays > 0
                        ? `لم تُستكمل مدة الإنذار، وبقي ${remainingNoticeDays} يوماً غير منفذة.`
                        : "تمت خدمة كامل فترة الإنذار المقررة في العقد."}
                    </p>
                  </div>
                </li>
                <li>
                  <span className="nc-dot" aria-hidden="true">3</span>
                  <div>
                    <p className="nc-small-b">آخر يوم عمل المتوقع: {formatDateAr(expectedLastWorkingDate)}</p>
                    <p className="nc-small">الموعد التعاقدي لانتهاء سريان عقد العمل.</p>
                  </div>
                </li>
              </ol>
            </section>

            {/* Formula */}
            <section className="nc-card">
              <button type="button" className="nc-link" aria-expanded={showFormulaDetails} aria-controls="nc-formula" onClick={() => setShowFormulaDetails(!showFormulaDetails)}>
                كيف تم الحساب؟
              </button>
              {showFormulaDetails && (
                <div id="nc-formula" className="nc-stack">
                  <div className="nc-stack-s">
                    <p className="nc-small-b">1. احتساب الأجر اليومي</p>
                    <p className="nc-code">آخر أجر ÷ 30 = الأجر اليومي<br /><span className="nc-ltr">{fmt(wage)} ÷ 30 = {fmt(dailyWage)} AED</span></p>
                  </div>
                  <div className="nc-stack-s">
                    <p className="nc-small-b">2. احتساب بدل الإنذار</p>
                    <p className="nc-code">الأجر اليومي × الأيام غير المنفذة = بدل الإنذار<br /><span className="nc-ltr">{fmt(dailyWage)} × {remainingNoticeDays} = {fmt(estimatedCompensation)} AED</span></p>
                  </div>
                  <div className="nc-stack-s">
                    <p className="nc-small-b">3. من يدفع التعويض؟</p>
                    <p className="nc-small">يلتزم الطرف الذي لم يلتزم بمهلة الإنذار بتعويض الطرف الآخر، بصرف النظر عمّن بدأ إنهاء العقد. اختر الطرف المسؤول في خانة «من لم يلتزم بإكمال فترة الإنذار؟».</p>
                  </div>
                </div>
              )}
            </section>
            </>
            )}
          </div>
        </div>

        {/* Page disclaimer */}
        <aside className="nc-card nc-dash" aria-labelledby="nc-disc">
          <h3 id="nc-disc" className="nc-h3">إخلاء مسؤولية قانوني</h3>
          <p className="nc-text">هذه الحاسبة تقديرية للموظفين بأجر شهري في القطاع الخاص الخاضع للقانون الاتحادي بعد فترة التجربة فقط. لا تحسب حالات DIFC أو ADGM أو القطاع الحكومي أو الأجور غير الشهرية أو اتفاقات الإعفاء والتخفيض الخاصة، ولا تمثل قراراً رسمياً من MOHRE أو حكماً قانونياً نهائياً. راجع عقد العمل والجهة المختصة قبل اتخاذ قرار.</p>
        </aside>
      </div>

      {/* ── Print summary dialog ── */}
      {showPrintModal && !calculationBlockReason && (
        <div className="nc-overlay" onKeyDown={onModalKey}>
          <div className="nc-modal" role="dialog" aria-modal="true" aria-labelledby="nc-modal-t">
            <div className="nc-modal-ctl">
              <h3 id="nc-modal-t" className="nc-h2">معاينة ملخص فترة الإنذار للطباعة</h3>
              <div className="nc-actions">
                <button type="button" className="nc-btn nc-btn-p" onClick={() => window.print()}>طباعة</button>
                <button type="button" className="nc-btn" autoFocus onClick={() => setShowPrintModal(false)}>إغلاق</button>
              </div>
            </div>

            <div className="nc-two nc-modal-ctl">
              <div className="nc-field">
                <label htmlFor="nc-en" className="nc-label">اسم الموظف (اختياري)</label>
                <input id="nc-en" type="text" className="nc-input" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="مثال: أحمد سالم" />
              </div>
              <div className="nc-field">
                <label htmlFor="nc-co" className="nc-label">صاحب العمل / الشركة (اختياري)</label>
                <input id="nc-co" type="text" className="nc-input" value={employerName} onChange={(e) => setEmployerName(e.target.value)} placeholder="مثال: شركة الاتحاد للتجارة" />
              </div>
            </div>

            <article className="nc-doc">
              <div className="nc-doc-head">
                <p className="nc-doc-small">دولة الإمارات العربية المتحدة</p>
                <h2 className="nc-doc-title">ملخص تقديري لفترة الإنذار</h2>
                <p className="nc-doc-small">وفق أحكام المادة (43) من المرسوم بقانون اتحادي رقم (33) لسنة 2021</p>
              </div>

              <div className="nc-doc-body">
                {(employeeName || employerName) && (
                  <dl className="nc-doc-grid">
                    <div><dt>الموظف</dt><dd>{employeeName || "—"}</dd></div>
                    <div><dt>صاحب العمل / الشركة</dt><dd>{employerName || "—"}</dd></div>
                  </dl>
                )}

                <dl className="nc-doc-grid">
                  <div><dt>الطرف الذي بدأ الإنهاء</dt><dd>{terminationInitiator === "employee" ? "الموظف" : terminationInitiator === "employer" ? "صاحب العمل" : "غير محدد"}</dd></div>
                  <div><dt>الطرف الذي لم يلتزم بالإنذار</dt><dd>{nonCompliantParty === "employee" ? "الموظف" : nonCompliantParty === "employer" ? "صاحب العمل" : "غير محدد"}</dd></div>
                  <div><dt>تاريخ الإشعار</dt><dd>{formatDateAr(noticeStartDate)}</dd></div>
                  <div><dt>فترة الإنذار التعاقدية</dt><dd>{requiredNoticeDays} يوم</dd></div>
                  <div><dt>آخر يوم عمل المتوقع</dt><dd>{formatDateAr(expectedLastWorkingDate)}</dd></div>
                  <div><dt>آخر يوم عمل فعلي</dt><dd>{servedInputMode === "date" ? formatDateAr(actualLastWorkingDate) : `بعد ${servedNoticeDays} يوم`}</dd></div>
                  <div><dt>الأيام المنفذة</dt><dd>{servedNoticeDays} يوم</dd></div>
                  <div><dt>الأيام المتبقية (غير المنفذة)</dt><dd>{remainingNoticeDays} يوم</dd></div>
                  <div><dt>آخر أجر</dt><dd dir="ltr">{fmt(wage)} AED</dd></div>
                  <div><dt>الأجر اليومي</dt><dd dir="ltr">{fmt(dailyWage)} AED</dd></div>
                  <div><dt>الطرف المستفيد</dt><dd>{compensationDirection === "to_employee" ? "الموظف" : compensationDirection === "to_employer" ? "صاحب العمل" : "لا يوجد تعويض مستحق"}</dd></div>
                </dl>

                <div className="nc-doc-total">
                  <p className="nc-doc-small">بدل الإنذار التقديري</p>
                  <p className="nc-doc-amount" dir="ltr">{fmt(estimatedCompensation)} AED</p>
                  <p className="nc-doc-strong">
                    {compensationDirection === "to_employee" && "بدل إنذار لصالح الموظف (+)"}
                    {compensationDirection === "to_employer" && "بدل إنذار لصالح صاحب العمل (−)"}
                    {compensationDirection === "none" && "تم تنفيذ فترة الإنذار كاملة"}
                  </p>
                </div>

                <div className="nc-doc-disc">
                  <span className="nc-doc-excl" aria-hidden="true">!</span>
                  <div>
                    <p><strong>إخلاء مسؤولية:</strong> هذه الحاسبة تقديرية وتعتمد على البيانات التي يدخلها المستخدم. ولا تمثل قراراً رسمياً من وزارة الموارد البشرية والتوطين أو حكماً قانونياً نهائياً. قد تختلف النتيجة بحسب عقد العمل، حالة فترة التجربة، جهة الاختصاص أو ظروف إنهاء العلاقة العمالية.</p>
                    <p className="nc-doc-foot"><span>تاريخ الحساب: {new Date().toLocaleDateString("ar-AE")}</span><span>المصدر: حاسبة فترة الإنذار في الإمارات — الأدوات العربية</span></p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Local styles. Map the --nc-* fallbacks to your real Ink & Signal tokens.
 * The printed summary (.nc-doc) always uses fixed ink-on-white colours.
 */
function NoticeStyles() {
  return (
    <style>{`
      .nc-root{
        --nc-ink:#0a0a0a; --nc-paper:#ffffff; --nc-muted:#f0f0f0;
        --nc-text2:#404040; --nc-orange:#ff5a1f;
        max-width:64rem; margin:0 auto; padding:1.5rem 1rem;
        color:var(--nc-ink); background:var(--nc-paper);
      }
      @media (prefers-color-scheme: dark){
        :root:not([data-theme="light"]) .nc-root{
          --nc-ink:#f5f5f5; --nc-paper:#0a0a0a; --nc-muted:#1a1a1a; --nc-text2:#d4d4d4;
        }
      }
      :root[data-theme="dark"] .nc-root{
        --nc-ink:#f5f5f5; --nc-paper:#0a0a0a; --nc-muted:#1a1a1a; --nc-text2:#d4d4d4;
      }
      .nc-root :focus-visible{ outline:3px solid var(--nc-orange); outline-offset:2px; }
      .nc-main{ display:grid; gap:1.25rem; }
      .nc-ltr{ direction:ltr; unicode-bidi:isolate; display:inline-block; }
      .nc-stack{ display:grid; gap:.75rem; }
      .nc-stack-s{ display:grid; gap:.25rem; }

      /* Text */
      .nc-h1{ margin:0; font-size:1.5rem; font-weight:700; line-height:1.5; }
      .nc-h2{ margin:0; font-size:.9375rem; font-weight:700; line-height:1.6; }
      .nc-h3{ margin:0; font-size:.8125rem; font-weight:700; }
      .nc-lead{ margin:.25rem 0 0; font-size:.8125rem; line-height:1.9; color:var(--nc-text2); max-width:60ch; }
      .nc-text{ margin:0; font-size:.75rem; line-height:1.9; color:var(--nc-text2); }
      .nc-small{ margin:0; font-size:.6875rem; line-height:1.8; color:var(--nc-text2); }
      .nc-small-b{ margin:0; font-size:.75rem; font-weight:700; }
      .nc-tag{ margin:0; padding:.125rem .75rem; border:2px solid var(--nc-ink); font-size:.75rem; font-weight:700; white-space:nowrap; }

      /* Layout */
      .nc-grid{ display:grid; grid-template-columns:1fr; gap:1.25rem; }
      @media (min-width:1024px){ .nc-grid{ grid-template-columns:7fr 5fr; align-items:start; } .nc-sticky{ position:sticky; top:1rem; } }
      .nc-col{ display:grid; gap:1.25rem; }
      .nc-three{ display:grid; gap:.625rem; grid-template-columns:1fr; }
      @media (min-width:640px){ .nc-three{ grid-template-columns:repeat(3,1fr); } }
      .nc-two{ display:grid; gap:.75rem; grid-template-columns:1fr; }
      @media (min-width:640px){ .nc-two{ grid-template-columns:1fr 1fr; } }
      .nc-head-row,.nc-row-between{ display:flex; flex-wrap:wrap; gap:.75rem; justify-content:space-between; align-items:center; }
      .nc-actions{ display:flex; flex-wrap:wrap; gap:.5rem; align-items:center; }

      /* Cards */
      .nc-card{ border:2px solid var(--nc-ink); padding:1.25rem; display:grid; gap:1rem; align-content:start; }
      .nc-dash{ border-style:dashed; }
      .nc-step{ display:flex; align-items:center; gap:.625rem; }
      .nc-num{
        flex:none; width:1.75rem; height:1.75rem; display:inline-flex; align-items:center; justify-content:center;
        border:2px solid var(--nc-ink); font-size:.8125rem; font-weight:700;
      }
      .nc-block{ border-top:2px solid var(--nc-ink); padding-top:.75rem; }
      .nc-opt{
        display:grid; gap:.25rem; text-align:start; padding:.75rem; border:2px solid var(--nc-ink);
        background:var(--nc-paper); color:var(--nc-ink); font-family:inherit; cursor:pointer;
      }
      .nc-opt:hover{ background:var(--nc-muted); }
      .nc-opt-t{ font-size:.8125rem; font-weight:700; }
      .nc-opt-d{ font-size:.6875rem; line-height:1.7; color:var(--nc-text2); }

      /* Notes */
      .nc-note{ display:flex; gap:.5rem; align-items:flex-start; border:2px solid var(--nc-ink); border-inline-start:6px solid var(--nc-orange); padding:.625rem .75rem; }
      .nc-note-dash{ border:2px dashed var(--nc-ink); }
      .nc-note-text{ margin:0; font-size:.75rem; line-height:1.9; color:var(--nc-text2); }
      .nc-mark{
        flex:none; width:1.25rem; height:1.25rem; display:inline-flex; align-items:center; justify-content:center;
        border:2px solid currentColor; font-size:.75rem; font-weight:700; color:var(--nc-ink);
      }

      /* Buttons / segmented */
      .nc-btn{
        padding:.5rem .875rem; border:2px solid var(--nc-ink); font-size:.75rem; font-weight:700;
        font-family:inherit; cursor:pointer; background:var(--nc-paper); color:var(--nc-ink);
      }
      .nc-btn:hover{ background:var(--nc-muted); }
      .nc-btn-p{ background:var(--nc-orange); color:#0a0a0a; }
      .nc-btn-p:hover{ background:var(--nc-ink); color:var(--nc-paper); }
      .nc-btn-ink{ background:#0a0a0a; color:#fff; border-color:#0a0a0a; padding:.75rem 1rem; }
      .nc-btn-ink:hover{ background:#fff; color:#0a0a0a; }
      .nc-link{
        justify-self:start; background:none; border:0; padding:0; font-family:inherit; font-size:.75rem;
        font-weight:700; color:var(--nc-ink); text-decoration:underline; text-underline-offset:3px; cursor:pointer;
      }
      .nc-seg{ display:flex; border:2px solid var(--nc-ink); }
      .nc-seg button{
        flex:1; padding:.5rem .5rem; border:0; background:var(--nc-paper); color:var(--nc-ink);
        font-size:.75rem; font-weight:700; font-family:inherit; cursor:pointer; line-height:1.6;
      }
      .nc-seg button + button{ border-inline-start:2px solid var(--nc-ink); }
      .nc-seg button[aria-pressed="true"]{ background:var(--nc-ink); color:var(--nc-paper); }

      /* Fields */
      .nc-field{ display:grid; gap:.25rem; align-content:start; }
      .nc-label{ margin:0; font-size:.75rem; font-weight:700; line-height:1.6; }
      .nc-hint{ font-weight:600; color:var(--nc-text2); }
      .nc-input{
        width:100%; min-width:0; box-sizing:border-box; border:2px solid var(--nc-ink);
        background:var(--nc-paper); color:var(--nc-ink); padding:.625rem .75rem;
        font-size:.8125rem; font-weight:700; font-family:inherit;
      }
      .nc-input[aria-invalid="true"]{ border-style:dashed; border-width:3px; }
      .nc-input-wrap{ display:flex; border:2px solid var(--nc-ink); background:var(--nc-paper); }
      .nc-input-wrap:focus-within{ outline:3px solid var(--nc-orange); outline-offset:2px; }
      .nc-input-bare{ flex:1; min-width:0; border:0; background:transparent; color:var(--nc-ink); padding:.625rem .75rem; font-size:.8125rem; font-weight:700; font-family:inherit; }
      .nc-input-bare:focus-visible{ outline:none; }
      .nc-sym{ flex:none; padding:0 .75rem; display:inline-flex; align-items:center; background:var(--nc-muted); border-inline-start:2px solid var(--nc-ink); font-size:.75rem; font-weight:700; }
      .nc-err{ margin:0; font-size:.6875rem; font-weight:700; }
      .nc-err::before{ content:"! "; font-weight:700; }
      .nc-check{ display:flex; gap:.625rem; align-items:flex-start; font-size:.75rem; line-height:1.8; cursor:pointer; }
      .nc-check input{ width:1.125rem; height:1.125rem; margin-top:.25rem; accent-color:var(--nc-orange); flex:none; }

      /* Result */
      .nc-result{ background:var(--nc-orange); color:#0a0a0a; border:2px solid var(--nc-ink); padding:1.25rem; display:grid; gap:1rem; }
      .nc-result-h{ margin:0; font-size:.9375rem; font-weight:700; }
      .nc-chip{ margin:0; padding:0 .5rem; border:2px solid #0a0a0a; font-size:.6875rem; font-weight:700; background:#fff; }
      .nc-banner{ background:#fff; border:2px solid #0a0a0a; padding:1rem; text-align:center; display:grid; gap:.25rem; }
      .nc-banner-t{ margin:0; font-size:.875rem; font-weight:700; }
      .nc-big{ margin:0; font-size:1.875rem; font-weight:700; line-height:1.3; }
      .nc-banner-s{ margin:0; font-size:.75rem; font-weight:700; }
      .nc-dl{ margin:0; background:#fff; border:2px solid #0a0a0a; }
      .nc-row{ display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap; padding:.375rem .75rem; border-top:1px solid #0a0a0a; font-size:.75rem; }
      .nc-row:first-child{ border-top:0; }
      .nc-row dt{ margin:0; color:#404040; }
      .nc-row dd{ margin:0; font-weight:700; }
      .nc-row dd.nc-strong{ font-weight:700; }
      .nc-white{ background:#fff; border:2px dashed #0a0a0a; padding:.75rem; display:grid; gap:.25rem; }
      .nc-white .nc-small,.nc-white .nc-small-b{ color:#0a0a0a; }

      /* Timeline */
      .nc-track{ height:.875rem; border:2px solid var(--nc-ink); background:var(--nc-paper); overflow:hidden; direction:ltr; }
      .nc-fill{ height:100%; background:var(--nc-ink); }
      .nc-tl{ margin:0; padding:0; list-style:none; display:grid; gap:.875rem; }
      .nc-tl li{ display:flex; gap:.75rem; align-items:flex-start; }
      .nc-dot{ flex:none; width:1.5rem; height:1.5rem; display:inline-flex; align-items:center; justify-content:center; border:2px solid var(--nc-ink); font-size:.75rem; font-weight:700; }
      .nc-code{ margin:0; border:2px solid var(--nc-ink); background:var(--nc-muted); padding:.5rem .75rem; font-size:.6875rem; line-height:1.9; font-weight:700; }

      /* Dialog */
      .nc-overlay{ position:fixed; inset:0; z-index:50; background:rgba(0,0,0,.65); display:flex; align-items:center; justify-content:center; padding:1rem; }
      .nc-modal{ width:100%; max-width:42rem; max-height:90vh; overflow-y:auto; background:var(--nc-paper); color:var(--nc-ink); border:2px solid var(--nc-ink); padding:1.25rem; display:grid; gap:1rem; }
      .nc-modal-ctl{ display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:.75rem; }
      .nc-modal .nc-two.nc-modal-ctl{ display:grid; }

      /* Printed document: fixed ink on white */
      .nc-doc{ --d-ink:#0a0a0a; --d-text2:#404040; --d-or:#ff5a1f; background:#fff; color:var(--d-ink); border:2px solid #0a0a0a; }
      .nc-doc p{ margin:0; }
      .nc-doc-head{ background:var(--d-or); color:#0a0a0a; border-bottom:2px solid #0a0a0a; padding:1rem 1.25rem; text-align:center; display:grid; gap:.25rem; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
      .nc-doc-title{ margin:0; font-size:1.25rem; font-weight:700; }
      .nc-doc-small{ font-size:.6875rem; font-weight:700; }
      .nc-doc-body{ padding:1rem 1.25rem; display:grid; gap:1rem; }
      .nc-doc-grid{ margin:0; display:grid; gap:.625rem 1rem; grid-template-columns:1fr 1fr; border:2px solid var(--d-ink); padding:.75rem 1rem; font-size:.75rem; }
      .nc-doc-grid dt{ color:var(--d-text2); font-size:.6875rem; }
      .nc-doc-grid dd{ margin:0; font-weight:700; }
      .nc-doc-total{ border:4px solid var(--d-ink); padding:.875rem; text-align:center; display:grid; gap:.25rem; }
      .nc-doc-amount{ font-size:1.5rem; font-weight:700; }
      .nc-doc-strong{ font-size:.75rem; font-weight:700; }
      .nc-doc-disc{ display:flex; gap:.5rem; align-items:flex-start; border:2px dashed var(--d-ink); padding:.625rem .75rem; font-size:.625rem; line-height:1.8; color:var(--d-text2); }
      .nc-doc-disc > div{ display:grid; gap:.375rem; }
      .nc-doc-excl{ flex:none; width:1.25rem; height:1.25rem; display:inline-flex; align-items:center; justify-content:center; border:2px solid var(--d-ink); font-weight:700; color:var(--d-ink); }
      .nc-doc-foot{ display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap; }

      @media print{
        .nc-main{ display:none !important; }
        .nc-root{ padding:0; background:#fff; }
        .nc-overlay{ position:static; background:none; padding:0; display:block; }
        .nc-modal{ max-height:none; overflow:visible; border:0; padding:0; background:#fff; }
        .nc-modal-ctl{ display:none !important; }
        .nc-doc{ border:0; }
        .nc-doc-grid,.nc-doc-total,.nc-doc-disc{ break-inside:avoid; }
      }
    `}</style>
  );
}