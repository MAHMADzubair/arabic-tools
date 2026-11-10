"use client";

/**
 * components/UaeNoticePeriodCalculator.jsx
 * Qemlo style: glossy orange + ink, 26px cards, 16px controls, SVG icons.
 * Helpers (toNum, fmt, formatDateAr, addDays, getDaysDiff), all state, every
 * useMemo (including the block-reason chain) and the presets are unchanged.
 * Changes: design and responsive layout, mobile sticky result bar, scope
 * progress pill, accessible print dialog (focus trap, Escape, scroll lock,
 * focus return, bottom sheet on mobile), icons instead of emoji/letters,
 * reduced-motion support, and only the summary prints.
 */
import React, { useState, useMemo, useEffect, useRef } from "react";
import { toNum, isInvalidNumericInput, addDays, getDaysDiff, noticeCompensation } from "../lib/uaeNoticeCalc";

// ─── Helpers (unchanged) ───────────────────────────────────────────────────────
function currentLocalDateISO() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function fmt(n) {
  return Number(n || 0).toLocaleString("ar-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

// ─── Icons (inline SVG, no emoji) ──────────────────────────────────────────────
const ICONS = {
  shield: (<><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></>),
  file: (<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h6" /></>),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  calendar: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>),
  timer: (<><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M9 2h6" /></>),
  info: (<><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>),
  alert: (<><path d="M12 3l10 18H2z" /><path d="M12 10v5" /><path d="M12 18h.01" /></>),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  reset: (<><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></>),
  external: (<><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>),
  printer: (<><path d="M7 9V3h10v6" /><rect x="4" y="9" width="16" height="8" rx="2" /><path d="M7 14h10v7H7z" /></>),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  scale: (<><path d="M12 3v18M6 21h12M5 7h14" /><path d="M5 7l-3 7a3.5 3.5 0 0 0 6 0z" /><path d="M19 7l-3 7a3.5 3.5 0 0 0 6 0z" /></>),
};

function Icon({ name, size = 20, className = "" }) {
  return (
    <svg className={`nc-ico ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {ICONS[name]}
    </svg>
  );
}

// ─── Small UI pieces ───────────────────────────────────────────────────────────
function Seg({ id, label, value, onChange, options, wide = false }) {
  return (
    <div className="nc-field">
      <p id={id} className="nc-label">{label}</p>
      <div className={`nc-seg ${wide ? "nc-seg-wide" : ""}`} role="group" aria-labelledby={id}>
        {options.map((o) => (
          <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

function SectionHead({ icon, id, children, right }) {
  return (
    <div className="nc-sec-head">
      <div className="nc-sec-title">
        <span className="nc-tile nc-gloss"><Icon name={icon} size={20} /></span>
        <h2 id={id} className="nc-h2">{children}</h2>
      </div>
      {right}
    </div>
  );
}

function Note({ title, children, dashed = false }) {
  return (
    <aside className={`nc-note ${dashed ? "nc-note-dash" : ""}`}>
      <span className="nc-mark" aria-hidden="true"><Icon name="info" size={14} /></span>
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
  // Probation and statutory timing / exception gates
  const [isProbation, setIsProbation] = useState("unsure");
  const [isTerminationDuringLeave, setIsTerminationDuringLeave] = useState("unsure");
  const [isNoNoticeStatutoryCase, setIsNoNoticeStatutoryCase] = useState("unsure");
  // Core inputs
  const [terminationInitiator, setTerminationInitiator] = useState("unsure");
  const [nonCompliantParty, setNonCompliantParty] = useState("unsure");
  const [noticeStartDate, setNoticeStartDate] = useState("");
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
  const resultRef = useRef(null);
  // Mobile bar is only useful while the result is still below the screen.
  const [barOn, setBarOn] = useState(true);
  const printBtnRef = useRef(null);

  // ── Calculations (unchanged) ─────────────────────────────────────────────────
  const requiredNoticeDays = useMemo(() => {
    if (contractNoticePreset === "custom") {
      return toNum(customNoticeDays);
    }
    return toNum(contractNoticePreset);
  }, [contractNoticePreset, customNoticeDays]);

  const noticeValidation = useMemo(() => {
    if (requiredNoticeDays <= 0) {
      return {
        status: "warning",
        msg: "اختر مدة الإنذار المتفق عليها من الخيارات، أو أدخلها في حقل المدة المخصصة.",
      };
    }
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

  // The money math lives in lib/uaeNoticeCalc.js so tests exercise the real code.
  const wage = toNum(lastWage);
  const { remainingDays: remainingNoticeDays, dailyWage, compensation: estimatedCompensation } = useMemo(
    () => noticeCompensation({ requiredDays: requiredNoticeDays, servedDays: servedNoticeDays, monthlyWage: wage }),
    [requiredNoticeDays, servedNoticeDays, wage]
  );

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
    if (isTerminationDuringLeave !== "no") {
      return isTerminationDuringLeave === "yes"
        ? "وفق المادة (35)، إذا تم الإخطار بإنهاء العقد أثناء إجازة العامل، فلا تبدأ مهلة الإنذار إلا من اليوم التالي لموعد العودة المجدول، ما لم يتفق الطرفان على خلاف ذلك. هذه الحاسبة لا تحسب أثر الإجازة أو الاتفاق المختلف؛ راجع تاريخ العودة والاتفاق مع MOHRE قبل احتساب آخر يوم."
        : "أكد أن إشعار إنهاء العقد لم يُقدّم أثناء إجازة العامل. إذا لم تكن متأكداً، لا تعتمد على تقدير المادة (43) قبل مراجعة المادة (35) والجهة المختصة.";
    }
    if (isNoNoticeStatutoryCase !== "no") {
      return isNoNoticeStatutoryCase === "yes"
        ? "قد تنطبق حالة إنهاء دون إنذار وفق المادة (44) أو مغادرة العمل دون إنذار وفق المادة (45). لهذه الحالات شروط وإجراءات مستقلة، ولا تقرر هذه الحاسبة انطباقها أو تحسب بدلها. راجع النص القانوني وMOHRE."
        : "أكد أن الحالة لا تستند إلى حق إنهاء دون إنذار وفق المادة (44) أو المادة (45). إذا لم تتأكد، لا تستخدم تقدير المادة (43) قبل مراجعة الجهة المختصة.";
    }
    if (isMutualWaiver) {
      return "عند الاتفاق الكتابي على الإعفاء أو تخفيض الإنذار، لا يعني ذلك تلقائياً أن بدل الإنذار يساوي صفراً؛ فالمادة (43/2) تشترط حفظ حقوق العامل. راجع نص الاتفاق وMOHRE، وهذه الحاسبة لا تحسب اتفاقات الإعفاء أو التسوية الخاصة.";
    }
    if (contractNoticePreset === "custom" && isInvalidNumericInput(customNoticeDays)) {
      return "أدخل مدة إنذار رقمية غير سالبة بالأيام، دون أحرف أو رموز غير رقمية.";
    }
    if (servedInputMode === "days" && isInvalidNumericInput(servedDaysInput)) {
      return "أدخل عدد أيام منفذة رقمياً وبقيمة لا تقل عن صفر. لا يمكن أن تكون الأيام المنفذة سالبة.";
    }
    if (isInvalidNumericInput(lastWage)) {
      return "أدخل آخر أجر شهري كقيمة رقمية غير سالبة.";
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
    if (remainingNoticeDays > 0 && wage <= 0) {
      return "أدخل آخر أجر شهري إجمالي أكبر من صفر لحساب بدل الأيام غير المنفذة.";
    }
    if (remainingNoticeDays > 0 && nonCompliantParty === "unsure") {
      return "حدد الطرف الذي لم يلتزم بإكمال فترة الإنذار. الطرف الذي بدأ إنهاء العقد ليس بالضرورة الطرف المخل؛ إذا لم تتأكد، راجع الإخطار والاتفاق أو استشر MOHRE قبل الاعتماد على أي مبلغ.";
    }
    return "";
  }, [
    isPrivateSector,
    isExcludedCategory,
    isDifcAdgm,
    isProbation,
    isTerminationDuringLeave,
    isNoNoticeStatutoryCase,
    nonCompliantParty,
    noticeValidation.msg,
    requiredNoticeDays,
    contractNoticePreset,
    customNoticeDays,
    noticeStartDate,
    servedInputMode,
    servedDaysInput,
    actualLastWorkingDate,
    isActualDateInvalid,
    servedNoticeDays,
    remainingNoticeDays,
    wage,
    lastWage,
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
    setNoticeStartDate(currentLocalDateISO());
    setActualLastWorkingDate("");
    setCustomNoticeDays("");
    setIsTerminationDuringLeave("no");
    setIsNoNoticeStatutoryCase("no");
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
    setIsTerminationDuringLeave("unsure");
    setIsNoNoticeStatutoryCase("unsure");
    setTerminationInitiator("unsure");
    setNonCompliantParty("unsure");
    setNoticeStartDate("");
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

  const gatesPassed = [
    isPrivateSector === "yes",
    isExcludedCategory === "no",
    isDifcAdgm === "no",
    isProbation === "no",
    isTerminationDuringLeave === "no",
    isNoNoticeStatutoryCase === "no",
  ].filter(Boolean).length;

  const blocked = Boolean(calculationBlockReason);
  const scopeAllConfirmed = gatesPassed === 6;

  // One tap for the common case: the person reads the six conditions and confirms
  // they all apply. Each answer stays editable below.
  const confirmAllScope = () => {
    setIsPrivateSector("yes");
    setIsExcludedCategory("no");
    setIsDifcAdgm("no");
    setIsProbation("no");
    setIsTerminationDuringLeave("no");
    setIsNoNoticeStatutoryCase("no");
  };

  // Hide the mobile bar once the result is on screen or already scrolled past
  useEffect(() => {
    const el = resultRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([entry]) => {
      setBarOn(!entry.isIntersecting && entry.boundingClientRect.top > 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const scrollToResult = () => {
    const el = resultRef.current;
    if (!el) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  // Print dialog: Escape closes, page scroll is locked, focus returns to the opener.
  useEffect(() => {
    if (!showPrintModal) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setShowPrintModal(false); };
    window.addEventListener("keydown", onKey);
    const opener = printBtnRef.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      if (opener && opener.focus) opener.focus();
    };
  }, [showPrintModal]);

  const trapTab = (e) => {
    if (e.key !== "Tab") return;
    const nodes = e.currentTarget.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <div className="nc-root" dir="rtl">
      <NoticeStyles />

      <div className="nc-main">
        {/* Header */}
        <header className="nc-hero">
          <div className="nc-hero-top">
            <span className="nc-tile nc-tile-lg nc-gloss"><Icon name="timer" size={26} /></span>
            <div className="nc-actions">
              <p className="nc-badge"><span className="nc-dot" aria-hidden="true" />المادة 43</p>
              <p className="nc-badge nc-badge-soft">حساب فوري</p>
            </div>
          </div>
          <div>
            <h1 className="nc-h1">حاسبة فترة الإنذار في الإمارات</h1>
            <p className="nc-lead">احتساب آخر يوم عمل، الأيام غير المنفذة، وبدل الإنذار التعويضي وفق أحكام المادة (43) من قانون العمل الإماراتي رقم 33 لسنة 2021</p>
          </div>
          <ul className="nc-chips" aria-label="ملخص القاعدة">
            <li className="nc-chip">الإنذار من <strong>30</strong> إلى <strong>90</strong> يوماً</li>
            <li className="nc-chip">الأجر اليومي = الأجر الشهري ÷ <strong>30</strong></li>
            <li className="nc-chip">يدفع البدل الطرف المخل بالإنذار</li>
          </ul>
        </header>

        {/* Presets */}
        <section className="nc-card" aria-labelledby="nc-presets">
          <SectionHead
            icon="bolt"
            id="nc-presets"
            right={
              <button type="button" className="nc-btn nc-btn-sm" onClick={handleReset}>
                <Icon name="reset" size={16} />
                إعادة تعيين
              </button>
            }
          >
            أمثلة عملية سريعة
          </SectionHead>
          <p className="nc-small">اضغط على مثال لتعبئة الحقول مباشرة.</p>
          <div className="nc-three">
            <button type="button" className="nc-opt" onClick={() => applyPreset(1)}>
              <span className="nc-tile"><Icon name="check" size={20} /></span>
              <span className="nc-opt-body">
                <span className="nc-opt-t">مثال 1: استقالة وتنفيذ كامل</span>
                <span className="nc-opt-d">إنذار 60 يوماً / نُفذت 60 / لا تعويض (0)</span>
              </span>
            </button>
            <button type="button" className="nc-opt" onClick={() => applyPreset(2)}>
              <span className="nc-tile"><Icon name="clock" size={20} /></span>
              <span className="nc-opt-body">
                <span className="nc-opt-t">مثال 2: استقالة وتنفيذ جزئي</span>
                <span className="nc-opt-d">خدم 40 من 60 يوماً / 6,000 درهم لصاحب العمل</span>
              </span>
            </button>
            <button type="button" className="nc-opt" onClick={() => applyPreset(3)}>
              <span className="nc-tile"><Icon name="user" size={20} /></span>
              <span className="nc-opt-body">
                <span className="nc-opt-t">مثال 3: إنهاء من صاحب العمل</span>
                <span className="nc-opt-d">خدم 10 من 30 يوماً / 8,000 درهم لصالح الموظف</span>
              </span>
            </button>
          </div>
        </section>

        <div className="nc-grid">
          {/* ── Inputs ── */}
          <div className="nc-col">
            {/* 1: Scope */}
            <section className="nc-card" aria-labelledby="nc-s1">
              <SectionHead
                icon="shield"
                id="nc-s1"
                right={<p className="nc-pill" aria-label={`تم تأكيد ${gatesPassed} من 6 شروط`}><span className="nc-ltr">{gatesPassed}/6</span> مؤكد</p>}
              >
                فحص النطاق وجهة الاختصاص
              </SectionHead>

              {!scopeAllConfirmed && (
                <div className="nc-quick">
                  <p className="nc-small-b">هل تنطبق عليك الشروط الستة التالية كلها؟</p>
                  <ul className="nc-conds">
                    <li>عقد عمل في القطاع الخاص يخضع لقانون العمل الاتحادي</li>
                    <li>لست من العمالة المنزلية أو القوات المسلحة أو الشرطة أو الأمن</li>
                    <li>لا تعمل في DIFC أو ADGM</li>
                    <li>انتهت فترة التجربة</li>
                    <li>لم يُقدَّم الإشعار أثناء إجازة العامل</li>
                    <li>الحالة ليست إنهاءً أو تركاً للعمل دون إنذار (المادتان 44 و45)</li>
                  </ul>
                  <button type="button" className="nc-btn nc-btn-dark" onClick={confirmAllScope}>
                    <Icon name="check" size={18} />
                    نعم، تنطبق كلها
                  </button>
                  <p className="nc-small">إذا كان أحدها لا ينطبق أو لست متأكداً، أجب عن كل سؤال بالأسفل.</p>
                </div>
              )}
              {scopeAllConfirmed && (
                <p className="nc-ok"><Icon name="check" size={18} />تم تأكيد الشروط الستة. يمكنك مراجعة أي إجابة بالأسفل.</p>
              )}

              <details className="nc-scope">
                <summary>{scopeAllConfirmed ? "مراجعة إجابات النطاق" : "الإجابة عن كل سؤال على حدة"}</summary>
                <div className="nc-scope-body">
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

              <Seg id="nc-leave" label="هل تم تقديم إشعار إنهاء العقد أثناء إجازة العامل؟" value={isTerminationDuringLeave} onChange={setIsTerminationDuringLeave}
                options={[{ id: "no", label: "لا" }, { id: "yes", label: "نعم" }, { id: "unsure", label: "غير متأكد" }]} />
              {isTerminationDuringLeave !== "no" && (
                <Note>وفق المادة (35)، تبدأ مهلة الإنذار في اليوم التالي لموعد عودة العامل المجدول من الإجازة، ما لم يتفق الطرفان على خلاف ذلك. لا تصدر الحاسبة نتيجة آلية لهذه الحالة.</Note>
              )}

              <Seg id="nc-no-notice" label="هل تعتمد الحالة على حق إنهاء دون إنذار وفق المادة (44) أو (45)؟" value={isNoNoticeStatutoryCase} onChange={setIsNoNoticeStatutoryCase}
                options={[{ id: "no", label: "لا" }, { id: "yes", label: "نعم" }, { id: "unsure", label: "غير متأكد" }]} />
              {isNoNoticeStatutoryCase !== "no" && (
                <Note>للمادة (44) شروط وإجراءات خاصة بإنهاء صاحب العمل دون إنذار، وللمادة (45) حالات محددة يستطيع فيها العامل مغادرة العمل دون إنذار مع الاحتفاظ بحقوقه. هذه الحاسبة لا تقرر انطباق تلك الحالات.</Note>
              )}
                </div>
              </details>
            </section>

            {/* 2: Notice details */}
            <section className="nc-card" aria-labelledby="nc-s2">
              <SectionHead icon="file" id="nc-s2">بيانات إشعار الإنهاء وعقد العمل</SectionHead>

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
                <div className="nc-seg nc-seg-presets" role="group" aria-labelledby="nc-len">
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
                      <input id="nc-custom" type="number" inputMode="numeric" min="1" max="365" dir="ltr" className="nc-input-bare"
                        value={customNoticeDays} onChange={(e) => setCustomNoticeDays(e.target.value)} onWheel={(e) => e.currentTarget.blur()} />
                      <span className="nc-sym" aria-hidden="true">يوماً</span>
                    </div>
                  </div>
                )}

                {noticeValidation.msg && <Note>{noticeValidation.msg}</Note>}
              </div>
            </section>

            {/* 3: Served + wage */}
            <section className="nc-card" aria-labelledby="nc-s3">
              <SectionHead icon="clock" id="nc-s3">الأيام المنفذة وآخر أجر</SectionHead>

              <Seg id="nc-mode" wide label="الأيام المنفذة فعلياً من فترة الإنذار" value={servedInputMode} onChange={setServedInputMode}
                options={[{ id: "days", label: "عدد الأيام التي تم تنفيذها" }, { id: "date", label: "آخر يوم عمل فعلي" }]} />

              {servedInputMode === "days" ? (
                <div className="nc-field">
                  <label htmlFor="nc-served" className="nc-label">عدد الأيام المنفذة</label>
                  <div className="nc-input-wrap">
                    <input id="nc-served" type="number" inputMode="numeric" min="0" dir="ltr" className="nc-input-bare"
                      value={servedDaysInput} onChange={(e) => setServedDaysInput(e.target.value)} onWheel={(e) => e.currentTarget.blur()} />
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
                    <p id="nc-actual-m" className="nc-err"><Icon name="alert" size={14} />لا يمكن أن يكون آخر يوم عمل قبل تاريخ تقديم الإشعار.</p>
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
                  <input id="nc-wage" type="number" inputMode="decimal" min="0" step="100" dir="ltr" className="nc-input-bare"
                    value={lastWage} onChange={(e) => setLastWage(e.target.value)} onWheel={(e) => e.currentTarget.blur()}
                    placeholder="مثال: 9000" aria-describedby="nc-wage-h" />
                  <span className="nc-sym" aria-hidden="true">AED</span>
                </div>
                <p id="nc-wage-h" className="nc-small">أدخل آخر أجر شهري وفق تعريف «الأجر» في المادة (1): الأجر الأساسي مضافاً إليه البدلات النقدية والمزايا العينية المقررة كجزء من الأجر في العقد أو القانون.</p>
                <p className="nc-small">هذه النسخة تدعم الأجر الشهري فقط. الأجر الأسبوعي أو اليومي أو بالساعة أو بالقطعة يحتاج أساس احتساب مختلفاً وفق المادة (43/4)، فلا تستخدم هذه النتيجة لهذه الحالات.</p>
              </div>

              <label className="nc-check">
                <input type="checkbox" checked={isMutualWaiver} onChange={(e) => setIsMutualWaiver(e.target.checked)} />
                <span>يوجد اتفاق كتابي على الإعفاء من مهلة الإنذار أو تخفيضها مع حفظ الحقوق.</span>
              </label>
            </section>
          </div>

          {/* ── Results ── */}
          <div className="nc-col nc-sticky" ref={resultRef}>
            <section className="nc-result" aria-labelledby="nc-res">
              <div className="nc-result-head nc-gloss" aria-live="polite" aria-atomic="true">
                <div className="nc-row-between">
                  <h2 id="nc-res" className="nc-result-h">بطاقة النتائج (تقديري)</h2>
                  <p className="nc-chip">المادة 43</p>
                </div>
                {blocked ? (
                  <p className="nc-result-sub">بانتظار بيانات صالحة لإصدار نتيجة</p>
                ) : (
                  <>
                    <p className="nc-result-t">{dirTitle}</p>
                    <p className="nc-fig">
                      <span className="nc-ltr nc-pop" key={estimatedCompensation}>{fmt(estimatedCompensation)}</span>
                      <span className="nc-cur">AED</span>
                    </p>
                    <p className="nc-result-sub">
                      {remainingNoticeDays > 0
                        ? `مقابل ${remainingNoticeDays} يوماً غير منفذة (الأجر اليومي ${fmt(dailyWage)} AED)`
                        : "0 أيام متبقية: لا تعويض مالي مستحق"}
                    </p>
                  </>
                )}
              </div>

              <div className="nc-result-body">
                {blocked ? (
                  <div className="nc-status" role="status">
                    <p className="nc-status-title"><span className="nc-mark" aria-hidden="true"><Icon name="alert" size={14} /></span>لا يمكن إصدار نتيجة رقمية موثوقة بهذه البيانات</p>
                    <p className="nc-small">{calculationBlockReason}</p>
                    <p className="nc-small">راجع عقد العمل والمصدر الرسمي قبل اتخاذ قرار مالي أو قانوني.</p>
                    <a href="https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/job-offers-and-work-permits-and-contracts/terminating-employment-contracts" target="_blank" rel="noopener noreferrer" className="nc-anchor">
                      الاطلاع على إرشادات حكومة الإمارات الرسمية
                      <Icon name="external" size={14} />
                      <span className="nc-sr"> (يفتح في نافذة جديدة)</span>
                    </a>
                  </div>
                ) : (
                  <>
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

                    {terminationInitiator === "employer" && (
                      <Note title="ملاحظة (المادة 43 - البند 5):">إذا كان صاحب العمل هو من أنهى عقد العمل، يحق للعامل التغيب يوماً واحداً غير مدفوع الأجر أسبوعياً للبحث عن عمل، شريطة إخطار صاحب العمل قبل يوم الغياب بثلاثة أيام على الأقل. إذا لم تتأكد من الطرف الذي بدأ الإنهاء، تحقق من الإخطار المكتوب.</Note>
                    )}

                    <button type="button" ref={printBtnRef} className="nc-btn nc-btn-ink" onClick={() => setShowPrintModal(true)}>
                      <Icon name="printer" size={18} />
                      إنشاء ملخص فترة الإنذار قابل للطباعة
                    </button>
                  </>
                )}
              </div>
            </section>

            {!blocked && (
              <>
                {/* Timeline */}
                <section className="nc-card" aria-labelledby="nc-tl">
                  <SectionHead icon="calendar" id="nc-tl">المخطط الزمني لفترة الإنذار</SectionHead>
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
                      <span className="nc-dotnum" aria-hidden="true">1</span>
                      <div>
                        <p className="nc-small-b">تاريخ الإشعار: {formatDateAr(noticeStartDate)}</p>
                        <p className="nc-small">بداية سريان فترة الإنذار ({requiredNoticeDays} يوماً).</p>
                      </div>
                    </li>
                    <li>
                      <span className="nc-dotnum" aria-hidden="true">2</span>
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
                      <span className="nc-dotnum" aria-hidden="true">3</span>
                      <div>
                        <p className="nc-small-b">آخر يوم عمل المتوقع: {formatDateAr(expectedLastWorkingDate)}</p>
                        <p className="nc-small">الموعد التعاقدي لانتهاء سريان عقد العمل.</p>
                      </div>
                    </li>
                  </ol>
                </section>

                {/* Formula */}
                <section className="nc-card">
                  <button type="button" className="nc-toggle" aria-expanded={showFormulaDetails} aria-controls="nc-formula" onClick={() => setShowFormulaDetails(!showFormulaDetails)}>
                    كيف تم الحساب؟
                    <Icon name="chevron" size={16} className="nc-chev" />
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
          <SectionHead icon="scale" id="nc-disc">إخلاء مسؤولية قانوني</SectionHead>
          <p className="nc-text">هذه الحاسبة تقديرية للموظفين بأجر شهري في القطاع الخاص الخاضع للقانون الاتحادي بعد فترة التجربة فقط. لا تحسب حالات DIFC أو ADGM أو القطاع الحكومي أو الأجور غير الشهرية أو الإنهاء أثناء الإجازة وفق المادة (35) أو حالات المادتين (44) و(45) أو اتفاقات الإعفاء والتخفيض الخاصة، ولا تمثل قراراً رسمياً من MOHRE أو حكماً قانونياً نهائياً. راجع عقد العمل والجهة المختصة قبل اتخاذ قرار.</p>
        </aside>
      </div>

      {/* Mobile sticky result bar */}
      <div className={`nc-bar${barOn ? "" : " nc-bar-off"}`}>
        <div className="nc-bar-info">
          <span className="nc-bar-l">{blocked ? "النتيجة غير جاهزة" : dirTitle}</span>
          <span className="nc-bar-v">{blocked ? "—" : <><span className="nc-ltr">{fmt(estimatedCompensation)}</span> AED</>}</span>
        </div>
        <button type="button" className="nc-btn nc-btn-orange nc-gloss" onClick={scrollToResult}>{blocked ? "السبب" : "التفاصيل"}</button>
      </div>

      {/* ── Print summary dialog ── */}
      {showPrintModal && !blocked && (
        <div className="nc-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowPrintModal(false); }}>
          <div className="nc-modal" role="dialog" aria-modal="true" aria-labelledby="nc-modal-t" onKeyDown={trapTab}>
            <div className="nc-modal-ctl">
              <h3 id="nc-modal-t" className="nc-h2">معاينة ملخص فترة الإنذار للطباعة</h3>
              <div className="nc-actions">
                <button type="button" className="nc-btn nc-btn-orange nc-gloss" onClick={() => window.print()}>
                  <Icon name="printer" size={18} />
                  طباعة
                </button>
                <button type="button" className="nc-btn" autoFocus onClick={() => setShowPrintModal(false)}>
                  <Icon name="close" size={18} />
                  إغلاق
                </button>
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
 * Local styles. Global tokens (--bg, --surface, --orange) are used when your
 * site defines them; otherwise the fallbacks and prefers-color-scheme apply.
 * The printed summary (.nc-doc) always uses fixed ink-on-white colours.
 */
function NoticeStyles() {
  return (
    <style>{`
      .nc-root{
        --nc-bg:var(--bg,#f3f3f1); --nc-surface:var(--surface,#ffffff); --nc-orange:var(--orange,#ff5a1f);
        --nc-ink:#0a0a0a; --nc-on-ink:#ffffff; --nc-on-orange:#0a0a0a;
        --nc-text2:#4a4a47; --nc-soft:#efefec; --nc-line:rgba(10,10,10,.14);
        --nc-r-card:26px; --nc-r-ctl:16px;
        --nc-shadow:0 1px 0 rgba(10,10,10,.04),0 14px 34px -20px rgba(10,10,10,.28);
        max-width:72rem; margin:0 auto; padding:.875rem .75rem calc(6.5rem + env(safe-area-inset-bottom,0px));
        color:var(--nc-ink); background:var(--nc-bg); font-family:inherit; line-height:1.6;
        -webkit-text-size-adjust:100%; text-size-adjust:100%; overflow-wrap:break-word;
      }
      @media (min-width:720px){ .nc-root{ padding:1.5rem; border-radius:32px; } }
      @media (min-width:960px){ .nc-root{ padding-bottom:1.5rem; } }
      @media (prefers-color-scheme: dark){
        :root:not([data-theme="light"]) .nc-root{
          --nc-bg:var(--bg,#0b0b0c); --nc-surface:var(--surface,#161618);
          --nc-ink:#f5f5f4; --nc-on-ink:#0a0a0a; --nc-text2:#c6c6c2; --nc-soft:#202023; --nc-line:rgba(255,255,255,.16);
          --nc-shadow:0 1px 0 rgba(255,255,255,.04),0 14px 34px -20px rgba(0,0,0,.8);
        }
      }
      :root[data-theme="dark"] .nc-root{
        --nc-bg:var(--bg,#0b0b0c); --nc-surface:var(--surface,#161618);
        --nc-ink:#f5f5f4; --nc-on-ink:#0a0a0a; --nc-text2:#c6c6c2; --nc-soft:#202023; --nc-line:rgba(255,255,255,.16);
        --nc-shadow:0 1px 0 rgba(255,255,255,.04),0 14px 34px -20px rgba(0,0,0,.8);
      }
      .nc-root *,.nc-root *::before,.nc-root *::after{ box-sizing:border-box; }
      .nc-root h1,.nc-root h2,.nc-root h3,.nc-root p,.nc-root dl,.nc-root dd,.nc-root ul,.nc-root ol{ margin:0; padding:0; }
      .nc-root button,.nc-root input{ font:inherit; color:inherit; }
      .nc-root :focus-visible{ outline:3px solid var(--nc-orange); outline-offset:3px; }
      .nc-main{ display:grid; gap:1rem; min-width:0; }
      .nc-ltr{ direction:ltr; unicode-bidi:isolate; display:inline-block; }
      .nc-sr{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
      .nc-ico{ flex:none; display:block; }
      .nc-stack{ display:grid; gap:.875rem; }
      .nc-stack-s{ display:grid; gap:.25rem; }

      /* Glossy orange */
      .nc-gloss{
        background:var(--nc-orange);
        background:linear-gradient(180deg,color-mix(in srgb,var(--nc-orange) 76%,#fff) 0%,var(--nc-orange) 48%,color-mix(in srgb,var(--nc-orange) 84%,#000) 100%);
        color:var(--nc-on-orange);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 0 rgba(0,0,0,.14),0 10px 22px -12px rgba(255,90,31,.7);
        print-color-adjust:exact; -webkit-print-color-adjust:exact;
      }
      .nc-root :focus-visible.nc-gloss{ outline-color:var(--nc-ink); }

      /* Text */
      .nc-h1{ font-size:clamp(1.375rem,5vw,2rem); font-weight:800; line-height:1.45; }
      .nc-h2{ font-size:1.0625rem; font-weight:800; line-height:1.5; }
      .nc-lead{ margin-top:.375rem; font-size:.9375rem; line-height:1.9; color:var(--nc-text2); max-width:48rem; }
      .nc-text{ font-size:.9375rem; line-height:1.9; color:var(--nc-text2); }
      .nc-small{ font-size:.8125rem; line-height:1.8; color:var(--nc-text2); }
      .nc-small-b{ font-size:.875rem; font-weight:800; }
      .nc-anchor{ display:inline-flex; align-items:center; gap:.375rem; min-height:44px; font-size:.9375rem; font-weight:700; color:var(--nc-ink); text-decoration:underline; text-underline-offset:4px; }

      /* Hero */
      .nc-hero{ display:grid; gap:1rem; padding:1.25rem; background:var(--nc-surface); border:1px solid var(--nc-line); border-radius:var(--nc-r-card); box-shadow:var(--nc-shadow); }
      @media (min-width:640px){ .nc-hero{ padding:1.75rem; } }
      .nc-hero-top,.nc-row-between{ display:flex; flex-wrap:wrap; gap:.75rem; justify-content:space-between; align-items:center; }
      .nc-actions{ display:flex; flex-wrap:wrap; gap:.5rem; align-items:center; }
      .nc-badge{ display:inline-flex; align-items:center; gap:.5rem; padding:.375rem .875rem; border-radius:999px; background:var(--nc-ink); color:var(--nc-on-ink); font-size:.8125rem; font-weight:700; }
      .nc-badge-soft{ background:var(--nc-soft); color:var(--nc-ink); border:1px solid var(--nc-line); }
      .nc-dot{ width:.5rem; height:.5rem; border-radius:50%; background:var(--nc-orange); }
      .nc-chips{ list-style:none; display:flex; flex-wrap:wrap; gap:.5rem; }
      .nc-chip{ padding:.375rem .875rem; border-radius:999px; background:var(--nc-soft); border:1px solid var(--nc-line); font-size:.875rem; }
      .nc-chip strong{ font-weight:800; }

      /* Tiles */
      .nc-tile{ flex:none; width:2.5rem; height:2.5rem; border-radius:14px; display:grid; place-items:center; }
      .nc-tile-lg{ width:3.25rem; height:3.25rem; border-radius:18px; }

      /* Layout */
      .nc-grid{ display:grid; grid-template-columns:minmax(0,1fr); gap:1rem; }
      @media (min-width:960px){
        .nc-grid{ grid-template-columns:minmax(0,1fr) 25rem; column-gap:1.25rem; align-items:start; }
        .nc-sticky{
          position:sticky; top:5rem; max-height:calc(100vh - 6rem); max-height:calc(100dvh - 6rem);
          overflow-y:auto; overscroll-behavior:contain; padding:.25rem; margin:-.25rem;
        }
      }
      .nc-col{ display:grid; gap:1rem; min-width:0; align-content:start; scroll-margin-top:1rem; }
      .nc-three{ display:grid; gap:.625rem; grid-template-columns:minmax(0,1fr); }
      @media (min-width:720px){ .nc-three{ grid-template-columns:repeat(3,minmax(0,1fr)); } }
      .nc-two{ display:grid; gap:.875rem; grid-template-columns:minmax(0,1fr); }
      @media (min-width:640px){ .nc-two{ grid-template-columns:repeat(2,minmax(0,1fr)); } }

      /* Cards */
      .nc-card{ background:var(--nc-surface); border:1px solid var(--nc-line); border-radius:var(--nc-r-card); padding:1.125rem; display:grid; gap:1rem; align-content:start; box-shadow:var(--nc-shadow); min-width:0; }
      @media (min-width:640px){ .nc-card{ padding:1.5rem; } }
      .nc-dash{ border:1.5px dashed color-mix(in srgb,var(--nc-ink) 45%,transparent); box-shadow:none; background:transparent; }
      .nc-sec-head{ display:flex; align-items:center; justify-content:space-between; gap:.75rem; flex-wrap:wrap; }
      .nc-sec-title{ display:flex; align-items:center; gap:.75rem; min-width:0; }
      .nc-pill{ padding:.25rem .75rem; border-radius:999px; background:var(--nc-soft); border:1px solid var(--nc-line); font-size:.8125rem; font-weight:700; white-space:nowrap; }
      .nc-opt{
        display:grid; grid-template-columns:auto minmax(0,1fr); gap:.75rem; align-items:center; text-align:start; padding:.75rem .875rem;
        border:1px solid var(--nc-line); border-radius:20px; background:var(--nc-surface); color:var(--nc-ink); cursor:pointer;
        -webkit-tap-highlight-color:transparent; transition:border-color .15s;
      }
      .nc-opt:hover{ border-color:var(--nc-ink); }
      .nc-opt:active{ transform:translateY(1px); }
      .nc-opt .nc-tile{ background:var(--nc-soft); color:var(--nc-ink); }
      .nc-opt-body{ display:grid; gap:.125rem; min-width:0; }
      .nc-opt-t{ font-size:.9375rem; font-weight:800; line-height:1.5; }
      .nc-opt-d{ font-size:.8125rem; line-height:1.7; color:var(--nc-text2); }

      /* Notes + status (icon + text, never colour-only) */
      .nc-note{ display:flex; gap:.625rem; align-items:flex-start; padding:.75rem .875rem; border-radius:var(--nc-r-ctl); background:var(--nc-soft); border:1px solid var(--nc-line); border-inline-start:5px solid var(--nc-orange); }
      .nc-note-dash{ background:transparent; border:1.5px dashed color-mix(in srgb,var(--nc-ink) 45%,transparent); }
      .nc-note-text{ font-size:.875rem; line-height:1.9; color:var(--nc-text2); }
      .nc-note-text strong{ color:var(--nc-ink); }
      .nc-mark{ flex:none; width:1.5rem; height:1.5rem; display:grid; place-items:center; border-radius:50%; background:var(--nc-ink); color:var(--nc-on-ink); margin-top:.125rem; }
      .nc-status{ border:2px dashed var(--nc-ink); border-radius:var(--nc-r-ctl); padding:.875rem 1rem; display:grid; gap:.5rem; background:var(--nc-surface); }
      .nc-status-title{ display:flex; gap:.625rem; align-items:flex-start; font-size:.9375rem; font-weight:800; line-height:1.7; }

      /* Buttons */
      .nc-btn{
        display:inline-flex; align-items:center; justify-content:center; gap:.5rem; min-height:48px; padding:0 1.125rem;
        border-radius:var(--nc-r-ctl); border:1.5px solid var(--nc-ink); background:var(--nc-surface); color:var(--nc-ink);
        font-size:.9375rem; font-weight:700; text-align:center; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:background-color .15s, transform .1s;
      }
      .nc-btn:hover{ background:var(--nc-soft); }
      .nc-btn:active{ transform:translateY(1px); }
      .nc-btn-sm{ min-height:44px; padding:0 .875rem; font-size:.875rem; }
      .nc-btn-orange{ border-color:rgba(0,0,0,.22); }
      .nc-btn-orange:hover{ background:var(--nc-orange); filter:brightness(1.05); }
      .nc-btn-ink{ background:var(--nc-ink); color:var(--nc-on-ink); width:100%; }
      /* ".nc-root button{color:inherit}" outranks a single class, which made the dark
         buttons' text the same colour as their background; restate it with more weight. */
      .nc-root .nc-btn-ink,.nc-root .nc-btn-dark{ color:var(--nc-on-ink); }
      .nc-btn-ink:hover{ background:var(--nc-ink); filter:brightness(1.2); }
      .nc-toggle{ justify-self:start; display:inline-flex; align-items:center; gap:.375rem; min-height:44px; padding:0; background:none; border:0; font-size:.9375rem; font-weight:800; text-decoration:underline; text-underline-offset:4px; cursor:pointer; }
      .nc-chev{ transition:transform .2s; }
      [aria-expanded="true"] > .nc-chev{ transform:rotate(180deg); }

      /* Segmented */
      .nc-seg{ display:grid; grid-template-columns:repeat(auto-fit,minmax(5.5rem,1fr)); gap:.25rem; padding:.25rem; border-radius:var(--nc-r-ctl); background:var(--nc-soft); border:1px solid var(--nc-line); }
      .nc-seg-wide{ grid-template-columns:repeat(auto-fit,minmax(10rem,1fr)); }
      .nc-seg-presets{ grid-template-columns:repeat(auto-fit,minmax(4.5rem,1fr)); }
      .nc-seg button{
        min-height:48px; padding:.25rem .5rem; border:0; border-radius:12px; background:transparent; color:var(--nc-ink);
        font-size:.9375rem; font-weight:700; line-height:1.5; cursor:pointer; -webkit-tap-highlight-color:transparent;
        display:inline-flex; align-items:center; justify-content:center; gap:.375rem;
      }
      .nc-seg button:hover{ background:color-mix(in srgb,var(--nc-ink) 8%,transparent); }
      .nc-seg button[aria-pressed="true"]{ background:var(--nc-ink); color:var(--nc-on-ink); }
      .nc-seg button[aria-pressed="true"]::before{ content:"✓"; font-weight:800; }

      /* Fields */
      .nc-field{ display:grid; gap:.375rem; align-content:start; min-width:0; }
      .nc-label{ font-size:.9375rem; font-weight:800; line-height:1.6; }
      .nc-hint{ font-weight:600; color:var(--nc-text2); }
      .nc-input{
        width:100%; min-width:0; min-height:3.25rem; border:1.5px solid var(--nc-line); border-radius:var(--nc-r-ctl);
        background:var(--nc-surface); color:var(--nc-ink); padding:0 1rem; font-size:1.0625rem; font-weight:700;
        transition:border-color .15s, box-shadow .15s;
      }
      .nc-input:hover{ border-color:color-mix(in srgb,var(--nc-ink) 50%,transparent); }
      .nc-input:focus{ outline:none; border-color:var(--nc-orange); box-shadow:0 0 0 4px color-mix(in srgb,var(--nc-orange) 28%,transparent); }
      .nc-input[aria-invalid="true"]{ border:2px dashed var(--nc-ink); }
      .nc-input-wrap{ display:flex; align-items:stretch; min-height:3.25rem; border-radius:var(--nc-r-ctl); border:1.5px solid var(--nc-line); background:var(--nc-surface); overflow:hidden; transition:border-color .15s, box-shadow .15s; }
      .nc-input-wrap:hover{ border-color:color-mix(in srgb,var(--nc-ink) 50%,transparent); }
      .nc-input-wrap:focus-within{ border-color:var(--nc-orange); box-shadow:0 0 0 4px color-mix(in srgb,var(--nc-orange) 28%,transparent); }
      .nc-input-bare{ flex:1; min-width:0; border:0; background:transparent; color:var(--nc-ink); padding:0 1rem; font-size:1.125rem; font-weight:800; text-align:right; outline:none; -moz-appearance:textfield; appearance:textfield; }
      .nc-input-bare::-webkit-outer-spin-button,.nc-input-bare::-webkit-inner-spin-button{ -webkit-appearance:none; margin:0; }
      .nc-input-bare::placeholder,.nc-input::placeholder{ color:var(--nc-text2); opacity:.6; font-weight:600; }
      .nc-sym{ flex:none; display:grid; place-items:center; padding:0 1rem; background:var(--nc-soft); border-inline-start:1px solid var(--nc-line); font-size:.875rem; font-weight:800; color:var(--nc-text2); }
      .nc-err{ display:flex; align-items:center; gap:.375rem; font-size:.8125rem; font-weight:800; }
      .nc-check{ display:flex; gap:.75rem; align-items:flex-start; padding:.75rem .875rem; border:1px solid var(--nc-line); border-radius:var(--nc-r-ctl); background:var(--nc-soft); font-size:.9375rem; line-height:1.8; cursor:pointer; }
      .nc-check input{ width:1.375rem; height:1.375rem; margin-top:.25rem; accent-color:var(--nc-orange); flex:none; }

      /* Result */
      .nc-result{ border-radius:var(--nc-r-card); overflow:hidden; background:var(--nc-surface); border:1px solid var(--nc-line); box-shadow:var(--nc-shadow); }
      .nc-result-head{ padding:1.25rem; display:grid; gap:.5rem; }
      .nc-result-h{ font-size:.9375rem; font-weight:800; }
      .nc-chip-inv,.nc-result-head .nc-chip{ background:#0a0a0a; color:#fff; border-color:#0a0a0a; padding:.125rem .75rem; font-size:.8125rem; font-weight:700; }
      .nc-result-t{ font-size:1rem; font-weight:800; line-height:1.6; }
      .nc-fig{ display:flex; align-items:baseline; flex-wrap:wrap; gap:.5rem; font-size:clamp(2rem,9vw,2.75rem); font-weight:800; line-height:1.2; overflow-wrap:anywhere; }
      .nc-pop{ animation:nc-pop .35s ease-out; }
      .nc-cur{ font-size:1.0625rem; font-weight:800; }
      .nc-result-sub{ font-size:.875rem; font-weight:600; line-height:1.7; }
      .nc-result-body{ padding:1.125rem; display:grid; gap:1rem; }
      @keyframes nc-pop{ from{ opacity:.35; transform:translateY(5px); } to{ opacity:1; transform:none; } }
      .nc-dl{ border:1px solid var(--nc-line); border-radius:var(--nc-r-ctl); overflow:hidden; }
      .nc-row{ display:flex; justify-content:space-between; gap:.25rem 1rem; flex-wrap:wrap; padding:.625rem .875rem; border-top:1px solid var(--nc-line); font-size:.9rem; }
      .nc-row:first-child{ border-top:0; }
      .nc-row dt{ color:var(--nc-text2); font-weight:600; }
      .nc-row dd{ font-weight:700; overflow-wrap:anywhere; }
      .nc-row dd.nc-strong{ font-weight:800; }

      /* Timeline */
      .nc-track{ height:1.125rem; border-radius:999px; border:1px solid var(--nc-line); overflow:hidden; direction:ltr;
        background:repeating-linear-gradient(135deg,var(--nc-soft) 0 5px,color-mix(in srgb,var(--nc-ink) 14%,transparent) 5px 7px); }
      .nc-fill{ height:100%; background:var(--nc-ink); transition:width .4s ease; }
      .nc-tl{ list-style:none; display:grid; gap:.875rem; }
      .nc-tl li{ display:flex; gap:.75rem; align-items:flex-start; }
      .nc-dotnum{ flex:none; width:1.75rem; height:1.75rem; display:grid; place-items:center; border-radius:50%; background:var(--nc-ink); color:var(--nc-on-ink); font-size:.8125rem; font-weight:800; }
      .nc-code{ border:1px solid var(--nc-line); background:var(--nc-soft); border-radius:var(--nc-r-ctl); padding:.625rem .875rem; font-size:.8125rem; line-height:2; font-weight:700; overflow-x:auto; }

      /* Mobile sticky bar */
      .nc-bar{
        position:fixed; left:0; right:0; bottom:0; z-index:30; display:flex; align-items:center; justify-content:space-between; gap:.75rem;
        padding:.625rem .875rem calc(.625rem + env(safe-area-inset-bottom,0px)); background:var(--nc-surface);
        border-top:1px solid var(--nc-line); box-shadow:0 -12px 30px -18px rgba(0,0,0,.45); color:var(--nc-ink);
      }
      .nc-bar-info{ display:grid; min-width:0; }
      .nc-bar-l{ font-size:.8125rem; font-weight:600; color:var(--nc-text2); }
      .nc-bar-v{ font-size:1.25rem; font-weight:800; overflow-wrap:anywhere; }
      .nc-bar{ transition:transform .2s ease; }
      .nc-bar-off{ transform:translateY(110%); visibility:hidden; }
      @media (min-width:960px){ .nc-bar{ display:none; } }

      /* One-tap scope confirmation */
      .nc-quick{ display:grid; gap:.75rem; padding:1rem; background:var(--nc-soft); border:1px solid var(--nc-line); border-radius:var(--nc-r-ctl); }
      .nc-conds{ list-style:none; display:grid; gap:.4rem; font-size:.875rem; line-height:1.7; }
      .nc-conds li{ display:flex; gap:.5rem; align-items:flex-start; }
      .nc-conds li::before{ content:""; flex:none; width:.5rem; height:.5rem; margin-top:.55em; border-radius:3px; background:var(--nc-orange); }
      .nc-btn-dark{ justify-self:start; background:var(--nc-ink); color:var(--nc-on-ink); border-color:var(--nc-ink); min-height:48px; padding-inline:1.25rem; font-weight:800; }
      .nc-ok{ display:flex; gap:.5rem; align-items:center; padding:.75rem 1rem; font-size:.875rem; font-weight:700; border:1px solid var(--nc-line); border-inline-start:4px solid var(--nc-orange); border-radius:var(--nc-r-ctl); background:var(--nc-soft); }
      .nc-scope{ border:1px dashed var(--nc-line); border-radius:var(--nc-r-ctl); }
      .nc-scope summary{ list-style:none; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:.75rem; min-height:48px; padding:.75rem 1rem; font-size:.9rem; font-weight:800; border-radius:var(--nc-r-ctl); }
      .nc-scope summary::-webkit-details-marker{ display:none; }
      .nc-scope summary::after{ content:"+"; flex:none; font-size:1.2rem; }
      .nc-scope[open] summary::after{ content:"−"; }
      .nc-scope-body{ display:grid; gap:.875rem; padding:0 1rem 1rem; }

      /* Dialog: bottom sheet on mobile */
      .nc-overlay{ position:fixed; inset:0; z-index:50; background:rgba(0,0,0,.65); display:flex; align-items:flex-end; justify-content:center; padding:0; }
      .nc-modal{
        width:100%; max-width:44rem; max-height:92vh; max-height:92dvh; overflow-y:auto; background:var(--nc-surface); color:var(--nc-ink);
        border-radius:var(--nc-r-card) var(--nc-r-card) 0 0; padding:1.125rem 1.125rem calc(1.125rem + env(safe-area-inset-bottom,0px)); display:grid; gap:1rem;
      }
      @media (min-width:640px){
        .nc-overlay{ align-items:center; padding:1rem; }
        .nc-modal{ border-radius:var(--nc-r-card); padding:1.5rem; border:1px solid var(--nc-line); }
      }
      .nc-modal-ctl{ display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:.75rem; }
      .nc-modal .nc-two.nc-modal-ctl{ display:grid; }

      /* Printed document: fixed ink on white */
      .nc-doc{ --d-ink:#0a0a0a; --d-text2:#404040; --d-or:#ff5a1f; background:#fff; color:var(--d-ink); border:2px solid #0a0a0a; border-radius:18px; overflow:hidden; }
      .nc-doc p{ margin:0; }
      .nc-doc-head{ background:var(--d-or); color:#0a0a0a; border-bottom:2px solid #0a0a0a; padding:1rem 1.25rem; text-align:center; display:grid; gap:.25rem; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
      .nc-doc-title{ margin:0; font-size:1.25rem; font-weight:800; }
      .nc-doc-small{ font-size:.75rem; font-weight:700; }
      .nc-doc-body{ padding:1rem 1.25rem; display:grid; gap:1rem; }
      .nc-doc-grid{ margin:0; display:grid; gap:.625rem 1rem; grid-template-columns:1fr 1fr; border:2px solid var(--d-ink); border-radius:12px; padding:.75rem 1rem; font-size:.8125rem; }
      @media screen and (max-width:479px){ .nc-doc-grid{ grid-template-columns:1fr; } }
      .nc-doc-grid dt{ color:var(--d-text2); font-size:.75rem; }
      .nc-doc-grid dd{ margin:0; font-weight:700; }
      .nc-doc-total{ border:4px solid var(--d-ink); border-radius:12px; padding:.875rem; text-align:center; display:grid; gap:.25rem; }
      .nc-doc-amount{ font-size:1.625rem; font-weight:800; }
      .nc-doc-strong{ font-size:.8125rem; font-weight:700; }
      .nc-doc-disc{ display:flex; gap:.5rem; align-items:flex-start; border:2px dashed var(--d-ink); border-radius:12px; padding:.625rem .75rem; font-size:.6875rem; line-height:1.8; color:var(--d-text2); }
      .nc-doc-disc > div{ display:grid; gap:.375rem; }
      .nc-doc-excl{ flex:none; width:1.25rem; height:1.25rem; display:inline-flex; align-items:center; justify-content:center; border:2px solid var(--d-ink); border-radius:50%; font-weight:700; color:var(--d-ink); }
      .nc-doc-foot{ display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap; }

      @media (prefers-reduced-motion: reduce){
        .nc-root *,.nc-root *::before,.nc-root *::after{ animation:none !important; transition:none !important; scroll-behavior:auto !important; }
      }

      @media print{
        body{ overflow:visible !important; }
        .nc-main,.nc-bar{ display:none !important; }
        .nc-root{ padding:0; max-width:none; border-radius:0; background:#fff; }
        .nc-overlay{ position:static; background:none; padding:0; display:block; }
        .nc-modal{ max-height:none; overflow:visible; border:0; border-radius:0; padding:0; background:#fff; }
        .nc-modal-ctl{ display:none !important; }
        .nc-doc{ border-radius:0; }
        .nc-doc-grid,.nc-doc-total,.nc-doc-disc{ break-inside:avoid; }
      }
    `}</style>
  );
}