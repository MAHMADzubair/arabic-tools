"use client";

/**
 * components/UaeCorporateTaxCalculator.jsx
 * Qemlo style: glossy orange + ink, 26px cards, 16px controls, SVG icons.
 * Tax maths, lib imports and presets are unchanged. Changes are listed in the
 * hand-off notes: layout, accessibility, mobile bar, copy button, two small
 * state fixes (estimate mode leaking into other taxpayer types, natural-person
 * result not following the in-scope income) and refreshed legal notes.
 */
import { useState, useMemo, useCallback, useEffect, useId, useRef } from "react";
import Link from "next/link";
import {
  CT_ZERO_RATE_LIMIT, NATURAL_PERSON_TURNOVER_LIMIT, TAXPAYER_TYPE,
  calcStandardCT, calcQfzpCT, checkSBREligibility,
  formatAED, sanitizeNumber, FTA_CT_URL, FTA_SBR_URL,
} from "@/lib/uaeCorporateTaxConfig";

/* ─── Icons (inline SVG, no emoji) ──────────────────────────────────────── */

const ICONS = {
  building: (<><path d="M5 21V4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v17" /><path d="M14 9h4a1 1 0 0 1 1 1v11" /><path d="M3 21h18" /><path d="M9 7h2M9 11h2M9 15h2" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z" /></>),
  help: (<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7" /><path d="M12 17h.01" /></>),
  info: (<><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>),
  check: (<path d="M5 12.5l4.5 4.5L19 7.5" />),
  alert: (<><path d="M12 3l10 18H2z" /><path d="M12 10v5" /><path d="M12 18h.01" /></>),
  calc: (<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8" /><path d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" /></>),
  chart: (<><path d="M3 21h18" /><path d="M6 21V11M12 21V5M18 21v-8" /></>),
  shield: (<><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></>),
  file: (<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h6" /></>),
  bolt: (<path d="M13 2L4 14h7l-1 8 9-12h-7z" />),
  chevron: (<path d="M6 9l6 6 6-6" />),
  reset: (<><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></>),
  external: (<><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>),
  arrow: (<><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></>),
  copy: (<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>),
  printer: (<><path d="M7 9V3h10v6" /><rect x="4" y="9" width="16" height="8" rx="2" /><path d="M7 14h10v7H7z" /></>),
};

function Icon({ name, size = 20, className = "" }) {
  return (
    <svg className={`uc-ico ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {ICONS[name]}
    </svg>
  );
}

/* ─── Small UI pieces ───────────────────────────────────────────────────── */

function AedInput({ id, label, hint, value, onChange, optional = false }) {
  const num = sanitizeNumber(value);
  return (
    <div className="uc-field">
      <div className="uc-label-row">
        <label htmlFor={id} className="uc-label">
          {label}{optional && <span className="uc-opt-tag"> (اختياري)</span>}
        </label>
        {num >= 10000 && <span className="uc-echo" aria-hidden="true"><span className="uc-ltr">{formatAED(num)}</span></span>}
      </div>
      <div className="uc-input-wrap">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onWheel={(e) => e.currentTarget.blur()}
          placeholder="0"
          className="uc-input"
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        <span className="uc-sym" aria-hidden="true">د.إ</span>
      </div>
      {hint && <p id={`${id}-hint`} className="uc-small">{hint}</p>}
    </div>
  );
}

function TriToggle({ label, value, onChange }) {
  const lid = useId();
  return (
    <div className="uc-field">
      <p id={lid} className="uc-label">{label}</p>
      <div className="uc-seg" role="group" aria-labelledby={lid}>
        {[{ l: "نعم", v: true }, { l: "لا", v: false }, { l: "غير متأكد", v: null }].map(({ l, v }) => (
          <button key={l} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>
        ))}
      </div>
    </div>
  );
}

function SectionHead({ icon, id, as: Tag = "h2", children, right }) {
  return (
    <div className="uc-sec-head">
      <div className="uc-sec-title">
        <span className="uc-tile uc-gloss"><Icon name={icon} size={20} /></span>
        <Tag id={id} className="uc-h2">{children}</Tag>
      </div>
      {right}
    </div>
  );
}

/** Notice: always an icon + text, never colour-only. */
function Note({ title, children, dashed = false }) {
  return (
    <aside className={`uc-note ${dashed ? "uc-note-dash" : ""}`}>
      <span className="uc-mark" aria-hidden="true"><Icon name="info" size={14} /></span>
      <p className="uc-note-text">{title && <strong>{title} </strong>}{children}</p>
    </aside>
  );
}

/** Status box: solid + check, or dashed + alert, with the verdict spelled out. */
function Status({ ok, title, children }) {
  return (
    <div className={`uc-status ${ok ? "" : "uc-status-no"}`}>
      <p className="uc-status-title">
        <span className="uc-mark" aria-hidden="true"><Icon name={ok ? "check" : "alert"} size={14} /></span>
        <span>{title}</span>
      </p>
      {children}
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="uc-stat">
      <p className="uc-stat-l">{label}</p>
      <p className="uc-stat-v"><span className="uc-ltr">{value}</span></p>
      {sub && <p className="uc-small">{sub}</p>}
    </div>
  );
}

const TAXPAYER_OPTIONS = [
  { val: TAXPAYER_TYPE.STANDARD, icon: "building", label: "شركة / شخص اعتباري", desc: "شركة ذات مسؤولية محدودة أو أي كيان قانوني مسجّل" },
  { val: TAXPAYER_TYPE.NATURAL_PERSON, icon: "user", label: "شخص طبيعي يمارس نشاطاً تجارياً", desc: "فرد يمارس أعمالاً تجارية مستقلة أو مهنية في الإمارات" },
  { val: TAXPAYER_TYPE.FREE_ZONE, icon: "globe", label: "منشأة في منطقة حرة", desc: "شركة مسجّلة في منطقة حرة إماراتية معتمدة" },
  { val: TAXPAYER_TYPE.UNSURE, icon: "help", label: "غير متأكد", desc: "أحتاج توجيهاً حول نوع الخاضع للضريبة" },
];

const PRESETS = [
  { id: "ex1", label: "دخل 300 ألف (0%)" },
  { id: "ex2", label: "دخل مليون درهم (9%)" },
  { id: "ex3", label: "2.4 مليون + فحص SBR" },
  { id: "ex4", label: "شخص طبيعي 800 ألف" },
  { id: "ex5", label: "QFZP — 2 مليون مؤهل" },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function UaeCorporateTaxCalculator() {
  const [taxpayerType, setTaxpayerType] = useState(TAXPAYER_TYPE.STANDARD);
  const [annualRevenue, setAnnualRevenue] = useState("0");
  const [taxableIncome, setTaxableIncome] = useState("0");
  const [estimateMode, setEstimateMode] = useState(false);
  const [estRevenue, setEstRevenue] = useState("0");
  const [estExpenses, setEstExpenses] = useState("0");
  const [estAdjustments, setEstAdjustments] = useState("0");
  const [estTaxLosses, setEstTaxLosses] = useState("0");
  const [npTurnover, setNpTurnover] = useState("0");
  const [isQFZP, setIsQFZP] = useState(null);
  const [qualifyingIncome, setQualifyingIncome] = useState("0");
  const [nonQualifyingIncome, setNonQualifyingIncome] = useState("0");
  const [showSBR, setShowSBR] = useState(false);
  const [sbrIsResident, setSbrIsResident] = useState(null);
  const [sbrCurrentRevenue, setSbrCurrentRevenue] = useState("0");
  const [sbrPriorRevenue, setSbrPriorRevenue] = useState("0");
  const [sbrIsQFZP, setSbrIsQFZP] = useState(null);
  const [sbrIsMNE, setSbrIsMNE] = useState(null);
  const [showCalcDetails, setShowCalcDetails] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [copied, setCopied] = useState(false);

  const resultRef = useRef(null);
  const copyTimer = useRef(null);
  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const isStd = taxpayerType === TAXPAYER_TYPE.STANDARD;
  const isNP = taxpayerType === TAXPAYER_TYPE.NATURAL_PERSON;
  const isFZQFZP = taxpayerType === TAXPAYER_TYPE.FREE_ZONE && isQFZP === true;

  const estimatedTI = useMemo(() => {
    if (!estimateMode) return null;
    return Math.max(0, sanitizeNumber(estRevenue) - sanitizeNumber(estExpenses) + sanitizeNumber(estAdjustments) - sanitizeNumber(estTaxLosses));
  }, [estimateMode, estRevenue, estExpenses, estAdjustments, estTaxLosses]);

  // The estimate only applies to the standard taxpayer form, where it is shown.
  const effectiveTI = useMemo(() => {
    if (isStd && estimateMode && estimatedTI !== null) return estimatedTI;
    return sanitizeNumber(taxableIncome);
  }, [isStd, estimateMode, estimatedTI, taxableIncome]);

  const npTurnoverNum = sanitizeNumber(npTurnover);
  const npInScope = npTurnoverNum > NATURAL_PERSON_TURNOVER_LIMIT;
  const activeTI = isNP ? (npInScope ? effectiveTI : 0) : effectiveTI;

  const stdResult = useMemo(() => calcStandardCT(activeTI), [activeTI]);
  const qfzpResult = useMemo(() => calcQfzpCT(qualifyingIncome, nonQualifyingIncome), [qualifyingIncome, nonQualifyingIncome]);
  const sbrResult = useMemo(
    () => checkSBREligibility({ isResident: sbrIsResident, currentRevenue: sbrCurrentRevenue, priorMaxRevenue: sbrPriorRevenue, isQFZP: sbrIsQFZP, isMNEAboveThreshold: sbrIsMNE }),
    [sbrIsResident, sbrCurrentRevenue, sbrPriorRevenue, sbrIsQFZP, sbrIsMNE]
  );

  const today = new Date().toLocaleDateString("ar-AE", { year: "numeric", month: "long", day: "numeric" });

  const handleReset = useCallback(() => {
    setTaxpayerType(TAXPAYER_TYPE.STANDARD); setAnnualRevenue("0"); setTaxableIncome("0");
    setEstimateMode(false); setEstRevenue("0"); setEstExpenses("0"); setEstAdjustments("0"); setEstTaxLosses("0");
    setNpTurnover("0"); setIsQFZP(null); setQualifyingIncome("0"); setNonQualifyingIncome("0");
    setShowSBR(false); setSbrIsResident(null); setSbrCurrentRevenue("0"); setSbrPriorRevenue("0"); setSbrIsQFZP(null); setSbrIsMNE(null);
    setShowCalcDetails(false); setShowPrint(false);
  }, []);

  // Updates are batched inside the click handler, so the preset values win over the reset.
  const loadPreset = (id) => {
    handleReset();
    if (id === "ex1") { setTaxableIncome("300000"); }
    else if (id === "ex2") { setTaxableIncome("1000000"); setAnnualRevenue("1200000"); }
    else if (id === "ex3") { setAnnualRevenue("2400000"); setTaxableIncome("500000"); setShowSBR(true); setSbrIsResident(true); setSbrCurrentRevenue("2400000"); setSbrPriorRevenue("0"); setSbrIsQFZP(false); setSbrIsMNE(false); }
    else if (id === "ex4") { setTaxpayerType(TAXPAYER_TYPE.NATURAL_PERSON); setNpTurnover("800000"); }
    else if (id === "ex5") { setTaxpayerType(TAXPAYER_TYPE.FREE_ZONE); setIsQFZP(true); setQualifyingIncome("2000000"); setNonQualifyingIncome("200000"); }
  };

  const showResult = taxpayerType !== TAXPAYER_TYPE.UNSURE;
  const npOut = isNP && !npInScope;
  const barPct = Math.min(100, Math.max(3, (activeTI / (CT_ZERO_RATE_LIMIT * 2)) * 100));
  const mainTax = isFZQFZP ? qfzpResult.tax : stdResult.tax;
  const typeLabel = TAXPAYER_OPTIONS.find((o) => o.val === taxpayerType)?.label || "-";

  const resultTitle = isFZQFZP
    ? "نظام الشخص المؤهل في المنطقة الحرة (QFZP)"
    : npOut ? "قد لا تكون في نطاق ضريبة الشركات"
      : stdResult.tax === 0 ? "الدخل ضمن نطاق الإعفاء (0%)"
        : "ضريبة الشركات التقديرية";
  const resultSub = isFZQFZP
    ? "تُحتسب على الدخل غير المؤهل فقط"
    : npOut ? "الدوران دون 1,000,000 درهم. مراجعة FTA مطلوبة للتأكيد"
      : `على دخل خاضع للضريبة قدره ${formatAED(activeTI)} د.إ`;

  const scrollToResult = () => {
    const el = resultRef.current;
    if (!el) return;
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const buildReport = () => [
    "ملخص تقديري لضريبة الشركات في الإمارات",
    `نوع الخاضع للضريبة: ${typeLabel}`,
    ...(isFZQFZP
      ? [
        `الدخل المؤهل (0%): ${formatAED(qfzpResult.qi)} د.إ`,
        `الدخل غير المؤهل (9%): ${formatAED(qfzpResult.nqti)} د.إ`,
        `ضريبة QFZP التقديرية: ${formatAED(qfzpResult.tax)} د.إ`,
        `المعدل الفعلي: ${(qfzpResult.effectiveRate * 100).toFixed(2)}%`,
      ]
      : [
        `الدخل الخاضع للضريبة: ${formatAED(activeTI)} د.إ`,
        `الجزء الخاضع لـ 0%: ${formatAED(stdResult.zeroRatePortion)} د.إ`,
        `الجزء الخاضع لـ 9%: ${formatAED(stdResult.ninePercentPortion)} د.إ`,
        `ضريبة الشركات التقديرية: ${formatAED(stdResult.tax)} د.إ`,
        `المعدل الفعلي: ${(stdResult.effectiveRate * 100).toFixed(2)}%`,
      ]),
    `التاريخ: ${today}`,
    "تقدير استرشادي وليس إقراراً ضريبياً أو قراراً رسمياً من الهيئة الاتحادية للضرائب.",
  ].join("\n");

  const copyReport = async () => {
    const text = buildReport();
    let ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); ok = true; }
    } catch (e) { ok = false; }
    if (!ok) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", "");
        ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch (e) { ok = false; }
    }
    if (ok) {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="uc-root" dir="rtl">
      <CalcStyles />

      {/* Header */}
      <header className="uc-hero uc-noprint">
        <div className="uc-hero-top">
          <span className="uc-tile uc-tile-lg uc-gloss"><Icon name="calc" size={26} /></span>
          <p className="uc-badge"><span className="uc-dot" aria-hidden="true" />محدث 2026 — FTA</p>
        </div>
        <div>
          <h1 className="uc-h1">حاسبة ضريبة الشركات في الإمارات</h1>
          <p className="uc-lead">تقدير ضريبة الشركات وفق نسبتَي 0% و9%. المرسوم بقانون رقم 47 لسنة 2022</p>
        </div>
        <ul className="uc-chips" aria-label="ملخص النسب">
          <li className="uc-chip"><strong>0%</strong> حتى <span className="uc-ltr">375,000</span> د.إ</li>
          <li className="uc-chip"><strong>9%</strong> على ما يزيد</li>
          <li className="uc-chip"><strong>SBR</strong> إيرادات حتى <span className="uc-ltr">3,000,000</span> د.إ</li>
        </ul>
      </header>

      <div className={`uc-layout ${showResult ? "" : "uc-layout-solo"}`}>
        {/* Presets */}
        <section className="uc-card uc-noprint" aria-labelledby="uc-presets">
          <SectionHead icon="bolt" id="uc-presets">نماذج سريعة للتجربة</SectionHead>
          <div className="uc-presets">
            {PRESETS.map((p) => (
              <button key={p.id} type="button" className="uc-chipbtn" onClick={() => loadPreset(p.id)}>{p.label}</button>
            ))}
          </div>
        </section>

        {/* 1: Taxpayer type */}
        <section className="uc-card uc-noprint" aria-labelledby="uc-s1">
          <SectionHead icon="building" id="uc-s1">ما نوع الخاضع للضريبة؟</SectionHead>
          <div className="uc-two" role="group" aria-labelledby="uc-s1">
            {TAXPAYER_OPTIONS.map(({ val, icon, label, desc }) => {
              const on = taxpayerType === val;
              return (
                <button key={val} type="button" aria-pressed={on} onClick={() => setTaxpayerType(val)} className="uc-opt">
                  <span className="uc-tile"><Icon name={icon} size={20} /></span>
                  <span className="uc-opt-body">
                    <span className="uc-opt-label">{label}</span>
                    <span className="uc-opt-desc">{desc}</span>
                  </span>
                  <span className="uc-check" aria-hidden="true">{on && <Icon name="check" size={18} />}</span>
                </button>
              );
            })}
          </div>
          {taxpayerType === TAXPAYER_TYPE.UNSURE && (
            <Note title="توجيه:">إذا كنت شركة مسجّلة فاختر شركة. إذا كنت فرداً بنشاط تجاري فاختر شخص طبيعي. يُنصح بمراجعة مستشار ضريبي مؤهل.</Note>
          )}
        </section>

        {/* 2: Natural person */}
        {isNP && (
          <section className="uc-card uc-noprint" aria-labelledby="uc-np">
            <SectionHead icon="user" id="uc-np">بيانات الشخص الطبيعي</SectionHead>
            <Note dashed>يدخل الشخص الطبيعي في نطاق ضريبة الشركات عندما يتجاوز <strong>دوران نشاطه التجاري الإماراتي 1,000,000 درهم</strong> خلال السنة الميلادية. لا يُحتسب: الرواتب، دخل الاستثمار الشخصي، أو دخل الاستثمار العقاري المؤهل.</Note>
            <AedInput id="uc-npTurnover" label="إجمالي دوران النشاط التجاري خلال السنة الميلادية *" hint="مجموع إيرادات النشاط التجاري أو المهني فقط. لا تُدرج الراتب أو دخل الاستثمار." value={npTurnover} onChange={setNpTurnover} />
            {npTurnoverNum > 0 && (
              <Status ok={!npInScope} title={npInScope ? "الدوران يتجاوز 1,000,000 درهم: قد تكون في نطاق ضريبة الشركات" : "الدوران دون 1,000,000 درهم: قد لا تكون مطالباً بالتسجيل"}>
                <p className="uc-text">{npInScope ? "يتجاوز الدوران حد التسجيل. ينبغي دراسة الالتزام بضريبة الشركات لدى FTA." : "قد لا تكون مطالباً بالتسجيل بناءً على هذا الشرط وحده. راجع دورياً."}</p>
              </Status>
            )}
            {npInScope && (
              <AedInput id="uc-npTI" label="الدخل الخاضع للضريبة التقديري *" hint="تنطبق نسبتا 0% (أول 375,000 د.إ) و9% (ما يزيد) كالشركات." value={taxableIncome} onChange={setTaxableIncome} />
            )}
          </section>
        )}

        {/* 2: Free zone */}
        {taxpayerType === TAXPAYER_TYPE.FREE_ZONE && (
          <section className="uc-card uc-noprint" aria-labelledby="uc-fz">
            <SectionHead icon="globe" id="uc-fz">بيانات منشأة المنطقة الحرة</SectionHead>
            <TriToggle label="هل أنت Qualifying Free Zone Person (QFZP) وفق الشروط الحالية؟" value={isQFZP} onChange={setIsQFZP} />
            {isQFZP === true && (
              <>
                <Note dashed title="نظام QFZP:">الدخل المؤهل ← 0%. الدخل غير المؤهل ← 9% كاملة بدون نطاق إعفاء 375,000 درهم.</Note>
                <div className="uc-two">
                  <AedInput id="uc-qi" label="الدخل المؤهل (Qualifying Income) *" hint="دخل الأنشطة المؤهلة. نسبة 0%." value={qualifyingIncome} onChange={setQualifyingIncome} />
                  <AedInput id="uc-nqti" label="الدخل غير المؤهل (Non-Qualifying Taxable Income) *" hint="دخل الأنشطة المستبعدة. يخضع لنسبة 9% كاملة بدون نطاق الإعفاء." value={nonQualifyingIncome} onChange={setNonQualifyingIncome} />
                </div>
                <Note>وضع QFZP يستلزم استيفاء شروط متعددة: الأنشطة المؤهلة، الجوهر الاقتصادي، أسعار التحويل، والقوائم المالية المدققة. ومن شروطها ألا يتجاوز الإيراد غير المؤهل (de minimis) الأقل من 5% من إجمالي الإيرادات أو 5,000,000 درهم. تجاوز هذا الحد يُفقد الوضع في الفترة الحالية والفترات الأربع التالية. هذه الحاسبة لا تُحقق من وضع QFZP.</Note>
              </>
            )}
            {isQFZP === false && (
              <>
                <Note dashed>تنطبق القواعد المعيارية: 0% على أول 375,000 درهم، و9% على ما يتجاوزه.</Note>
                <AedInput id="uc-fzTI" label="الدخل الخاضع للضريبة *" hint="صافي الدخل الخاضع بعد التعديلات." value={taxableIncome} onChange={setTaxableIncome} />
              </>
            )}
            {isQFZP === null && (
              <Note>لتحديد وضع QFZP تحقق من: نوع المنطقة الحرة، طبيعة الأنشطة، الجوهر الاقتصادي. يُنصح بمراجعة مستشار ضريبي.</Note>
            )}
          </section>
        )}

        {/* 2: Standard */}
        {isStd && (
          <section className="uc-card uc-noprint" aria-labelledby="uc-st">
            <SectionHead icon="calc" id="uc-st">البيانات المالية</SectionHead>
            <Note dashed title="تنبيه:">الإيرادات ليست الدخل الخاضع للضريبة. ضريبة الشركات تُحسب على <strong>الدخل الخاضع للضريبة</strong> بعد المصروفات والتعديلات الضريبية المعتمدة.</Note>
            <div className="uc-two">
              <AedInput id="uc-rev" label="الإيرادات السنوية" hint="يُستخدم لاختبارات الأهلية كتسهيلات الأعمال الصغيرة." value={annualRevenue} onChange={setAnnualRevenue} optional />
              <AedInput id="uc-ti" label="الدخل الخاضع للضريبة *" hint="صافي الدخل بعد كل المصروفات والتعديلات الضريبية المعتمدة." value={taxableIncome} onChange={setTaxableIncome} />
            </div>
            <div className="uc-block">
              <button type="button" className="uc-toggle" aria-expanded={estimateMode} aria-controls="uc-est" onClick={() => setEstimateMode(!estimateMode)}>
                {estimateMode ? "إخفاء التقدير" : "تقدير الدخل الخاضع من الإيرادات والمصروفات"}
                <Icon name="chevron" size={16} className="uc-chev" />
              </button>
              {estimateMode && (
                <div id="uc-est" className="uc-stack">
                  <p className="uc-small">تقدير أولي للدخل الخاضع للضريبة. ليس إقراراً ضريبياً دقيقاً.</p>
                  <div className="uc-two">
                    <AedInput id="uc-eRev" label="الإيرادات" value={estRevenue} onChange={setEstRevenue} />
                    <AedInput id="uc-eExp" label="المصروفات القابلة للخصم" value={estExpenses} onChange={setEstExpenses} />
                    <AedInput id="uc-eAdj" label="تعديلات أخرى (إضافة)" value={estAdjustments} onChange={setEstAdjustments} optional />
                    <AedInput id="uc-eLoss" label="خسائر ضريبية مستخدمة" value={estTaxLosses} onChange={setEstTaxLosses} optional />
                  </div>
                  {estimatedTI !== null && (
                    <div className="uc-box" aria-live="polite">
                      <p className="uc-small-b">تقدير أولي للدخل الخاضع للضريبة</p>
                      <p className="uc-big"><span className="uc-ltr">{formatAED(estimatedTI)} د.إ</span></p>
                      <p className="uc-small">تقدير استرشادي. ليس إقراراً ضريبياً.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Result column (sticky on desktop) */}
        {showResult && (
          <div className="uc-aside uc-noprint" ref={resultRef}>
            <section className="uc-result" aria-labelledby="uc-res">
              <div className="uc-result-head uc-gloss" aria-live="polite" aria-atomic="true">
                <h2 id="uc-res" className="uc-result-h">{resultTitle}</h2>
                <p className="uc-fig"><span className="uc-ltr" key={`${mainTax}-${taxpayerType}`}>{formatAED(mainTax)}</span><span className="uc-cur">د.إ</span></p>
                <p className="uc-result-sub"><span className="uc-ltr-flow">{resultSub}</span></p>
              </div>
              <div className="uc-result-body">
                {isFZQFZP ? (
                  <div className="uc-stats">
                    <Stat label="الدخل المؤهل (0%)" value={`${formatAED(qfzpResult.qi)} د.إ`} />
                    <Stat label="الدخل غير المؤهل (9%)" value={`${formatAED(qfzpResult.nqti)} د.إ`} />
                    <Stat label="المعدل الفعلي" value={`${(qfzpResult.effectiveRate * 100).toFixed(2)}%`} />
                  </div>
                ) : (
                  <div className="uc-stats">
                    <Stat label="الدخل الخاضع للضريبة" value={`${formatAED(activeTI)} د.إ`} />
                    <Stat label="المعدل الفعلي" value={`${(stdResult.effectiveRate * 100).toFixed(2)}%`} />
                    <Stat label="الجزء الخاضع لـ 0%" value={`${formatAED(stdResult.zeroRatePortion)} د.إ`} />
                    <Stat label="الجزء الخاضع لـ 9%" value={`${formatAED(stdResult.ninePercentPortion)} د.إ`} />
                  </div>
                )}

                <div className="uc-actions">
                  <button type="button" className="uc-btn uc-btn-sm" onClick={copyReport}>
                    <Icon name={copied ? "check" : "copy"} size={16} />
                    {copied ? "تم النسخ" : "نسخ الملخص"}
                  </button>
                  <span className="uc-sr" role="status">{copied ? "تم نسخ الملخص" : ""}</span>
                </div>

                <div className="uc-block">
                  <button type="button" className="uc-toggle" aria-expanded={showCalcDetails} aria-controls="uc-how" onClick={() => setShowCalcDetails(!showCalcDetails)}>
                    كيف تم الحساب؟
                    <Icon name="chevron" size={16} className="uc-chev" />
                  </button>
                  {showCalcDetails && (
                    <div id="uc-how" className="uc-box">
                      {isFZQFZP ? (
                        <>
                          <p className="uc-small-b">منهجية حساب QFZP</p>
                          <p className="uc-text">الدخل المؤهل ({formatAED(qfzpResult.qi)} د.إ) × 0% = 0 د.إ</p>
                          <p className="uc-text">الدخل غير المؤهل ({formatAED(qfzpResult.nqti)} د.إ) × 9% = <strong>{formatAED(qfzpResult.tax)} د.إ</strong></p>
                          <p className="uc-small">لا ينطبق نطاق إعفاء 375,000 درهم على الدخل غير المؤهل لـ QFZP.</p>
                        </>
                      ) : (
                        <>
                          <p className="uc-small-b">منهجية الحساب المعياري</p>
                          <p className="uc-text">الدخل الخاضع للضريبة: {formatAED(activeTI)} د.إ</p>
                          <p className="uc-text">الجزء الخاضع لـ 0%: <span className="uc-ltr">min({formatAED(activeTI)}, 375,000) = {formatAED(stdResult.zeroRatePortion)}</span> د.إ</p>
                          <p className="uc-text">الجزء الخاضع لـ 9%: <span className="uc-ltr">max({formatAED(activeTI)} − 375,000, 0) = {formatAED(stdResult.ninePercentPortion)}</span> د.إ</p>
                          <p className="uc-text"><strong><span className="uc-ltr">{formatAED(stdResult.ninePercentPortion)} × 9% = {formatAED(stdResult.tax)}</span> د.إ</strong></p>
                          <p className="uc-small">صيغة مختصرة عند تجاوز 375,000: الضريبة = (الدخل × 9%) − <span className="uc-ltr">33,750</span></p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="uc-card" aria-labelledby="uc-bd">
              <SectionHead icon="chart" id="uc-bd" as="h3">توزيع الدخل الخاضع للضريبة</SectionHead>
              {isFZQFZP ? (
                <div className="uc-stats">
                  <Stat label="الدخل المؤهل" value={`${formatAED(qfzpResult.qi)} د.إ`} sub="نسبة 0%" />
                  <Stat label="الدخل غير المؤهل" value={`${formatAED(qfzpResult.nqti)} د.إ`} sub="نسبة 9% كاملة" />
                </div>
              ) : (
                <div className="uc-stack">
                  <div className="uc-track" role="img" aria-label={`الدخل ${formatAED(activeTI)} د.إ مقابل حد 375,000 د.إ لنسبة 0%`}>
                    <div className="uc-zone" />
                    <div className="uc-fill0" style={{ width: `${Math.min(barPct, 50)}%` }} />
                    <div className="uc-fill9" style={{ width: `${Math.max(0, barPct - 50)}%` }} />
                    <div className="uc-tick" />
                  </div>
                  <div className="uc-scale" aria-hidden="true">
                    <span>0</span>
                    <span><span className="uc-ltr">375,000 د.إ</span><br /><span className="uc-small">حد 0%</span></span>
                    <span><span className="uc-ltr">+375,000</span><br /><span className="uc-small">9%</span></span>
                  </div>
                  <div className="uc-stats">
                    <Stat label="أول 375,000 د.إ" value="0%" sub="خاضع لنسبة 0%" />
                    <Stat label="ما يتجاوز 375,000 د.إ" value="9%" sub="يخضع لنسبة 9%" />
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* 3: SBR */}
        {(isStd || (isNP && npInScope)) && (
          <section className="uc-card uc-noprint" aria-labelledby="uc-sbr">
            <SectionHead
              icon="shield"
              id="uc-sbr"
              right={
                <button type="button" className="uc-btn uc-btn-sm uc-toggle-btn" aria-expanded={showSBR} aria-controls="uc-sbr-body" onClick={() => setShowSBR(!showSBR)}>
                  {showSBR ? "إخفاء" : "فحص الأهلية"}
                  <Icon name="chevron" size={16} className="uc-chev" />
                </button>
              }
            >
              تسهيلات الأعمال الصغيرة (SBR)
            </SectionHead>
            {!showSBR && <p className="uc-small">إذا كانت إيراداتك أقل أو تساوي 3,000,000 درهم قد تكون مؤهلاً لتسهيلات الأعمال الصغيرة.</p>}
            {showSBR && (
              <div id="uc-sbr-body" className="uc-stack">
                <TriToggle label="هل المنشأة مقيمة لأغراض ضريبة الشركات؟" value={sbrIsResident} onChange={setSbrIsResident} />
                <div className="uc-two">
                  <AedInput id="uc-sbrRev" label="إجمالي الإيرادات للفترة الضريبية الحالية" hint="يجب ألا تتجاوز 3,000,000 درهم." value={sbrCurrentRevenue} onChange={setSbrCurrentRevenue} />
                  <AedInput id="uc-sbrPrior" label="أعلى إيرادات في أي فترة ضريبية سابقة ذات صلة" hint="يجب ألا تكون في أي فترة سابقة تجاوزت 3,000,000 درهم." value={sbrPriorRevenue} onChange={setSbrPriorRevenue} optional />
                </div>
                <TriToggle label="هل أنت شخص مؤهل في منطقة حرة (QFZP)؟" value={sbrIsQFZP} onChange={setSbrIsQFZP} />
                <TriToggle label="هل تنتمي لمجموعة متعددة الجنسيات بإيرادات موحدة تتجاوز 3.15 مليار درهم؟" value={sbrIsMNE} onChange={setSbrIsMNE} />

                <div aria-live="polite">
                  <Status ok={sbrResult.eligible} title={sbrResult.eligible ? "قد تكون مؤهلاً لاختيار تسهيلات الأعمال الصغيرة" : "لا تستوفي شروط تسهيلات الأعمال الصغيرة حالياً"}>
                    {sbrResult.eligible ? (
                      <p className="uc-text">قد تكون مؤهلاً لاختيار تسهيلات الأعمال الصغيرة وفق الشروط النظامية. تسهيلات الأعمال الصغيرة هي اختيار (election) وليست إعفاءً تلقائياً. يجب تقديم الاختيار لدى FTA في الموعد المحدد.</p>
                    ) : (
                      <ul className="uc-list">{sbrResult.reasons.map((r, i) => (<li key={i} className="uc-text">{r}</li>))}</ul>
                    )}
                  </Status>
                </div>

                <Note>مدّد القرار الوزاري رقم 131 لسنة 2026 (أعلنته وزارة المالية في أغسطس 2026) سريان تسهيلات الأعمال الصغيرة إلى الفترات الضريبية التي تنتهي في أو قبل 31 ديسمبر 2029. بقي حد الإيرادات 3,000,000 درهم دون تغيير. التسهيل اختياري (election) وليس إعفاءً تلقائياً، وإذا اخترته في فترة فلا تُرحَّل خسائرها الضريبية إلى فترات لاحقة. راجع أحدث إرشادات الهيئة الاتحادية للضرائب قبل الاعتماد على هذه النتيجة. آخر مراجعة: نوفمبر 2026.</Note>
              </div>
            )}
          </section>
        )}

        {/* Print summary */}
        {showResult && (
          <section className={`uc-card ${showPrint ? "" : "uc-noprint"}`} aria-labelledby="uc-pr">
            <div className="uc-noprint">
              <SectionHead
                icon="file"
                id="uc-pr"
                as="h3"
                right={
                  <button type="button" className="uc-btn uc-btn-sm uc-toggle-btn" aria-expanded={showPrint} aria-controls="uc-print-body" onClick={() => setShowPrint(!showPrint)}>
                    {showPrint ? "إخفاء" : "إنشاء الملخص"}
                    <Icon name="chevron" size={16} className="uc-chev" />
                  </button>
                }
              >
                ملخص تقديري قابل للطباعة
              </SectionHead>
            </div>
            {showPrint && (
              <div id="uc-print-body" className="uc-doc">
                <div className="uc-doc-head">
                  <h4 className="uc-doc-title">ملخص تقديري لضريبة الشركات</h4>
                  <p className="uc-small">هذا الملخص تقديري استرشادي وليس إقراراً ضريبياً أو وثيقة معتمدة.</p>
                </div>
                <div className="uc-tablewrap">
                  <table className="uc-table">
                    <tbody>
                      {[
                        ["نوع الخاضع للضريبة", typeLabel],
                        ["الإيرادات السنوية", formatAED(annualRevenue) + " د.إ"],
                        isFZQFZP ? ["الدخل المؤهل (0%)", formatAED(qfzpResult.qi) + " د.إ"] : ["الدخل الخاضع للضريبة", formatAED(activeTI) + " د.إ"],
                        isFZQFZP ? ["الدخل غير المؤهل (9%)", formatAED(qfzpResult.nqti) + " د.إ"] : ["الجزء الخاضع لـ 0%", formatAED(stdResult.zeroRatePortion) + " د.إ"],
                        isFZQFZP ? ["ضريبة QFZP التقديرية", formatAED(qfzpResult.tax) + " د.إ"] : ["الجزء الخاضع لـ 9%", formatAED(stdResult.ninePercentPortion) + " د.إ"],
                        isFZQFZP ? ["المعدل الفعلي", (qfzpResult.effectiveRate * 100).toFixed(2) + "%"] : ["ضريبة الشركات التقديرية", formatAED(stdResult.tax) + " د.إ"],
                        !isFZQFZP ? ["المعدل الفعلي", (stdResult.effectiveRate * 100).toFixed(2) + "%"] : null,
                        ["تسهيلات الأعمال الصغيرة", showSBR ? (sbrResult.eligible ? "قد تكون مؤهلاً (مراجعة مطلوبة)" : "غير مؤهل") : "لم يتم الفحص"],
                        ["تاريخ الحساب", today],
                      ].filter(Boolean).map(([k, v], i) => (
                        <tr key={i}><th scope="row">{k}</th><td><span className="uc-ltr-flow">{v}</span></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="uc-small">هذا الملخص تقديري استرشادي يعتمد على البيانات المدخلة ولا يمثل إقراراً ضريبياً أو قراراً رسمياً من الهيئة الاتحادية للضرائب.</p>
                <button type="button" className="uc-btn uc-btn-orange uc-gloss uc-noprint" onClick={() => window.print()}>
                  <Icon name="printer" size={18} />
                  طباعة / حفظ PDF
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      <div className="uc-tail uc-noprint">
        {/* Disclaimer */}
        <aside className="uc-card uc-dash" aria-labelledby="uc-disc">
          <SectionHead icon="info" id="uc-disc" as="h3">إخلاء المسؤولية</SectionHead>
          <p className="uc-text">هذه الحاسبة تقديرية وتعتمد على البيانات التي يدخلها المستخدم، ولا تمثل إقراراً ضريبياً أو قراراً رسمياً من الهيئة الاتحادية للضرائب.</p>
          <p className="uc-text">قد تختلف النتيجة بحسب نوع الشخص، التعديلات الضريبية، الإعفاءات، الخسائر، وضع المنطقة الحرة، المعاملات مع الأطراف المرتبطة، والفترة الضريبية.</p>
          <p className="uc-text">يرجى الرجوع إلى <a href={FTA_CT_URL} target="_blank" rel="noopener noreferrer" className="uc-anchor">الهيئة الاتحادية للضرائب — tax.gov.ae<span className="uc-sr"> (يفتح في نافذة جديدة)</span></a> أو مستشار ضريبي مؤهل عند الحاجة إلى تحديد رسمي.</p>
        </aside>

        {/* Reset + cross-link */}
        <div className="uc-actions uc-between">
          <button type="button" className="uc-btn" onClick={handleReset}>
            <Icon name="reset" size={18} />
            إعادة تعيين
          </button>
          <Link href="/ar/ae/vat-registration-checker" className="uc-btn uc-btn-link">
            هل تحتاج فحص أهلية التسجيل في ضريبة القيمة المضافة؟
            <Icon name="arrow" size={18} />
          </Link>
        </div>

        {/* Official source */}
        <footer className="uc-card">
          <p className="uc-text">المصدر: <strong>الهيئة الاتحادية للضرائب — دولة الإمارات العربية المتحدة</strong></p>
          <div className="uc-actions">
            <a href={FTA_CT_URL} target="_blank" rel="noopener noreferrer" className="uc-anchor">ضريبة الشركات — FTA<Icon name="external" size={14} /><span className="uc-sr"> (يفتح في نافذة جديدة)</span></a>
            <a href={FTA_SBR_URL} target="_blank" rel="noopener noreferrer" className="uc-anchor">تسهيلات الأعمال الصغيرة<Icon name="external" size={14} /><span className="uc-sr"> (يفتح في نافذة جديدة)</span></a>
          </div>
        </footer>
      </div>

      {/* Mobile sticky result bar */}
      {showResult && (
        <div className="uc-bar uc-noprint">
          <div className="uc-bar-info">
            <span className="uc-bar-l">{isFZQFZP ? "ضريبة QFZP التقديرية" : "ضريبة الشركات التقديرية"}</span>
            <span className="uc-bar-v"><span className="uc-ltr">{formatAED(mainTax)}</span> د.إ</span>
          </div>
          <button type="button" className="uc-btn uc-btn-orange uc-gloss" onClick={scrollToResult}>التفاصيل</button>
        </div>
      )}
    </div>
  );
}

/**
 * Local styles. Global tokens (--bg, --surface, --orange) are used when your
 * site defines them; otherwise the fallbacks and prefers-color-scheme apply.
 */
function CalcStyles() {
  return (
    <style>{`
      .uc-root{
        --uc-bg:var(--bg,#f3f3f1); --uc-surface:var(--surface,#ffffff); --uc-orange:var(--orange,#ff5a1f);
        --uc-ink:#0a0a0a; --uc-on-ink:#ffffff; --uc-on-orange:#0a0a0a;
        --uc-text2:#4a4a47; --uc-soft:#efefec; --uc-line:rgba(10,10,10,.14);
        --uc-r-card:26px; --uc-r-ctl:16px;
        --uc-shadow:0 1px 0 rgba(10,10,10,.04),0 14px 34px -20px rgba(10,10,10,.28);
        max-width:70rem; margin:0 auto; padding:.875rem .75rem calc(6.5rem + env(safe-area-inset-bottom,0px));
        color:var(--uc-ink); background:var(--uc-bg); font-family:inherit; display:grid; gap:1rem;
        -webkit-text-size-adjust:100%; text-size-adjust:100%; overflow-wrap:break-word;
      }
      @media (min-width:720px){ .uc-root{ padding:1.5rem; border-radius:32px; } }
      @media (min-width:960px){ .uc-root{ padding-bottom:1.5rem; } }
      @media (prefers-color-scheme: dark){
        :root:not([data-theme="light"]) .uc-root{
          --uc-bg:var(--bg,#0b0b0c); --uc-surface:var(--surface,#161618);
          --uc-ink:#f5f5f4; --uc-on-ink:#0a0a0a; --uc-text2:#c6c6c2; --uc-soft:#202023; --uc-line:rgba(255,255,255,.16);
          --uc-shadow:0 1px 0 rgba(255,255,255,.04),0 14px 34px -20px rgba(0,0,0,.8);
        }
      }
      :root[data-theme="dark"] .uc-root{
        --uc-bg:var(--bg,#0b0b0c); --uc-surface:var(--surface,#161618);
        --uc-ink:#f5f5f4; --uc-on-ink:#0a0a0a; --uc-text2:#c6c6c2; --uc-soft:#202023; --uc-line:rgba(255,255,255,.16);
        --uc-shadow:0 1px 0 rgba(255,255,255,.04),0 14px 34px -20px rgba(0,0,0,.8);
      }
      .uc-root *,.uc-root *::before,.uc-root *::after{ box-sizing:border-box; }
      .uc-root :focus-visible{ outline:3px solid var(--uc-orange); outline-offset:3px; }
      .uc-ltr{ direction:ltr; unicode-bidi:isolate; display:inline-block; }
      .uc-ltr-flow{ unicode-bidi:plaintext; }
      .uc-sr{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
      .uc-stack{ display:grid; gap:1rem; }
      .uc-ico{ flex:none; display:block; }

      /* Glossy orange */
      .uc-gloss{
        background:var(--uc-orange);
        background:linear-gradient(180deg,color-mix(in srgb,var(--uc-orange) 76%,#fff) 0%,var(--uc-orange) 48%,color-mix(in srgb,var(--uc-orange) 84%,#000) 100%);
        color:var(--uc-on-orange);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 0 rgba(0,0,0,.14),0 10px 22px -12px rgba(255,90,31,.7);
        print-color-adjust:exact; -webkit-print-color-adjust:exact;
      }
      .uc-root :focus-visible.uc-gloss{ outline-color:var(--uc-ink); }

      /* Text */
      .uc-h1{ margin:0; font-size:clamp(1.375rem,5vw,2rem); font-weight:800; line-height:1.45; }
      .uc-h2{ margin:0; font-size:1.0625rem; font-weight:800; line-height:1.5; }
      .uc-lead{ margin:.375rem 0 0; font-size:.9375rem; line-height:1.9; color:var(--uc-text2); }
      .uc-text{ margin:0; font-size:.9375rem; line-height:1.9; color:var(--uc-text2); }
      .uc-small{ margin:0; font-size:.8125rem; line-height:1.8; color:var(--uc-text2); }
      .uc-small-b{ margin:0; font-size:.875rem; font-weight:800; }
      .uc-big{ margin:0; font-size:1.375rem; font-weight:800; }
      .uc-list{ margin:0; padding-inline-start:1.25rem; display:grid; gap:.25rem; }
      .uc-anchor{ display:inline-flex; align-items:center; gap:.375rem; min-height:44px; color:var(--uc-ink); font-size:.9375rem; font-weight:700; text-decoration:underline; text-underline-offset:4px; }

      /* Hero */
      .uc-hero{ display:grid; gap:1rem; padding:1.25rem; background:var(--uc-surface); border:1px solid var(--uc-line); border-radius:var(--uc-r-card); box-shadow:var(--uc-shadow); }
      @media (min-width:640px){ .uc-hero{ padding:1.75rem; } }
      .uc-hero-top{ display:flex; align-items:center; justify-content:space-between; gap:.75rem; flex-wrap:wrap; }
      .uc-badge{ margin:0; display:inline-flex; align-items:center; gap:.5rem; padding:.375rem .875rem; border-radius:999px; background:var(--uc-ink); color:var(--uc-on-ink); font-size:.8125rem; font-weight:700; }
      .uc-dot{ width:.5rem; height:.5rem; border-radius:50%; background:var(--uc-orange); }
      .uc-chips{ list-style:none; margin:0; padding:0; display:flex; flex-wrap:wrap; gap:.5rem; }
      .uc-chip{ padding:.375rem .875rem; border-radius:999px; background:var(--uc-soft); border:1px solid var(--uc-line); font-size:.875rem; }
      .uc-chip strong{ font-weight:800; }

      /* Tiles */
      .uc-tile{ flex:none; width:2.5rem; height:2.5rem; border-radius:14px; display:grid; place-items:center; }
      .uc-tile-lg{ width:3.25rem; height:3.25rem; border-radius:18px; }

      /* Layout */
      .uc-layout{ display:block; min-width:0; }
      .uc-layout > *{ margin-block-end:1rem; min-width:0; }
      .uc-layout > *:last-child{ margin-block-end:0; }
      .uc-aside{ display:grid; gap:1rem; scroll-margin-top:1rem; align-content:start; }
      @media (min-width:960px){
        .uc-layout{ display:grid; grid-template-columns:minmax(0,1fr) 24rem; column-gap:1.25rem; align-items:start; }
        .uc-layout > *{ grid-column:1; }
        .uc-layout > .uc-aside{
          grid-column:2; grid-row:1 / span 8; position:sticky; top:1rem; align-self:start;
          max-height:calc(100vh - 2rem); max-height:calc(100dvh - 2rem); overflow-y:auto; overscroll-behavior:contain;
          padding:.25rem; margin:-.25rem; margin-block-end:0;
        }
        .uc-layout-solo{ grid-template-columns:minmax(0,44rem); justify-content:center; }
      }
      .uc-tail{ display:grid; gap:1rem; }

      /* Cards */
      .uc-card{ background:var(--uc-surface); border:1px solid var(--uc-line); border-radius:var(--uc-r-card); padding:1.125rem; display:grid; gap:1rem; box-shadow:var(--uc-shadow); }
      @media (min-width:640px){ .uc-card{ padding:1.5rem; } }
      .uc-dash{ border:1.5px dashed color-mix(in srgb,var(--uc-ink) 45%,transparent); box-shadow:none; background:transparent; }
      .uc-sec-head{ display:flex; align-items:center; justify-content:space-between; gap:.75rem; flex-wrap:wrap; }
      .uc-sec-title{ display:flex; align-items:center; gap:.75rem; min-width:0; }
      .uc-block{ border-top:1px solid var(--uc-line); padding-top:.875rem; display:grid; gap:.875rem; }
      .uc-box{ border:1px solid var(--uc-line); background:var(--uc-soft); border-radius:var(--uc-r-ctl); padding:.875rem 1rem; display:grid; gap:.375rem; }

      /* Presets */
      .uc-presets{ display:flex; gap:.5rem; overflow-x:auto; padding:.125rem .125rem .5rem; margin-inline:-.125rem; scroll-snap-type:x proximity; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
      .uc-presets::-webkit-scrollbar{ display:none; }
      .uc-chipbtn{
        flex:none; min-height:44px; padding:0 1rem; border-radius:999px; border:1px solid var(--uc-line); background:var(--uc-soft);
        color:var(--uc-ink); font:inherit; font-size:.9375rem; font-weight:700; white-space:nowrap; cursor:pointer; scroll-snap-align:start;
        -webkit-tap-highlight-color:transparent; transition:border-color .15s, background-color .15s;
      }
      .uc-chipbtn:hover{ border-color:var(--uc-ink); }
      .uc-chipbtn:active{ transform:translateY(1px); }
      @media (min-width:720px){ .uc-presets{ flex-wrap:wrap; overflow:visible; padding-bottom:.125rem; } }

      /* Option cards + segmented */
      .uc-two{ display:grid; gap:.875rem; grid-template-columns:minmax(0,1fr); }
      @media (min-width:640px){ .uc-two{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
      .uc-opt{
        display:grid; grid-template-columns:auto minmax(0,1fr) 1.5rem; gap:.75rem; align-items:center; text-align:start; min-height:4.5rem;
        padding:.75rem .875rem; border:1px solid var(--uc-line); border-radius:20px; background:var(--uc-surface); color:var(--uc-ink);
        font:inherit; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:border-color .15s, background-color .15s;
      }
      .uc-opt:hover{ border-color:var(--uc-ink); }
      .uc-opt .uc-tile{ background:var(--uc-soft); color:var(--uc-ink); }
      .uc-opt-body{ display:grid; gap:.125rem; min-width:0; }
      .uc-opt-label{ font-size:.9375rem; font-weight:800; line-height:1.5; }
      .uc-opt-desc{ font-size:.8125rem; line-height:1.7; color:var(--uc-text2); }
      .uc-check{ display:grid; place-items:center; width:1.5rem; height:1.5rem; }
      .uc-opt[aria-pressed="true"]{
        background:var(--uc-orange);
        background:linear-gradient(180deg,color-mix(in srgb,var(--uc-orange) 76%,#fff) 0%,var(--uc-orange) 48%,color-mix(in srgb,var(--uc-orange) 84%,#000) 100%);
        color:var(--uc-on-orange); border-color:transparent;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 0 rgba(0,0,0,.14),0 10px 22px -12px rgba(255,90,31,.7);
      }
      .uc-opt[aria-pressed="true"] .uc-tile{ background:#0a0a0a; color:#fff; }
      .uc-opt[aria-pressed="true"] .uc-opt-desc{ color:#2a2a2a; }
      .uc-opt[aria-pressed="true"]:focus-visible{ outline-color:var(--uc-ink); }
      .uc-seg{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.25rem; padding:.25rem; border-radius:var(--uc-r-ctl); background:var(--uc-soft); border:1px solid var(--uc-line); max-width:26rem; }
      .uc-seg button{
        min-height:48px; padding:0 .5rem; border:0; border-radius:12px; background:transparent; color:var(--uc-ink);
        font:inherit; font-size:.9375rem; font-weight:700; cursor:pointer; -webkit-tap-highlight-color:transparent;
        display:inline-flex; align-items:center; justify-content:center; gap:.375rem;
      }
      .uc-seg button:hover{ background:color-mix(in srgb,var(--uc-ink) 8%,transparent); }
      .uc-seg button[aria-pressed="true"]{ background:var(--uc-ink); color:var(--uc-on-ink); }
      .uc-seg button[aria-pressed="true"]::before{ content:"✓"; font-weight:800; }

      /* Fields */
      .uc-field{ display:grid; gap:.375rem; align-content:start; min-width:0; }
      .uc-label-row{ display:flex; align-items:baseline; justify-content:space-between; gap:.5rem; }
      .uc-label{ margin:0; font-size:.9375rem; font-weight:800; line-height:1.6; }
      .uc-opt-tag{ font-weight:600; color:var(--uc-text2); }
      .uc-echo{ flex:none; font-size:.8125rem; font-weight:700; color:var(--uc-text2); }
      .uc-input-wrap{
        display:flex; align-items:stretch; min-height:3.25rem; border-radius:var(--uc-r-ctl); border:1.5px solid var(--uc-line);
        background:var(--uc-surface); overflow:hidden; transition:border-color .15s, box-shadow .15s;
      }
      .uc-input-wrap:hover{ border-color:color-mix(in srgb,var(--uc-ink) 50%,transparent); }
      .uc-input-wrap:focus-within{ border-color:var(--uc-orange); box-shadow:0 0 0 4px color-mix(in srgb,var(--uc-orange) 28%,transparent); }
      .uc-input{
        flex:1; min-width:0; border:0; background:transparent; color:inherit; padding:0 1rem; font:inherit;
        font-size:1.125rem; font-weight:800; text-align:right; outline:none; -moz-appearance:textfield; appearance:textfield;
      }
      .uc-input::-webkit-outer-spin-button,.uc-input::-webkit-inner-spin-button{ -webkit-appearance:none; margin:0; }
      .uc-input::placeholder{ color:var(--uc-text2); opacity:.6; }
      .uc-sym{ flex:none; display:grid; place-items:center; padding:0 1rem; background:var(--uc-soft); border-inline-start:1px solid var(--uc-line); font-size:.875rem; font-weight:800; color:var(--uc-text2); }

      /* Notes + status (icon + text, never colour-only) */
      .uc-note{
        display:flex; gap:.625rem; align-items:flex-start; padding:.75rem .875rem; border-radius:var(--uc-r-ctl);
        background:var(--uc-soft); border:1px solid var(--uc-line); border-inline-start:5px solid var(--uc-orange);
      }
      .uc-note-dash{ background:transparent; border:1.5px dashed color-mix(in srgb,var(--uc-ink) 45%,transparent); }
      .uc-note-text{ margin:0; font-size:.875rem; line-height:1.9; color:var(--uc-text2); }
      .uc-note-text strong{ color:var(--uc-ink); }
      .uc-mark{ flex:none; width:1.5rem; height:1.5rem; display:grid; place-items:center; border-radius:50%; background:var(--uc-ink); color:var(--uc-on-ink); margin-top:.125rem; }
      .uc-status{ border:2px solid var(--uc-ink); border-radius:var(--uc-r-ctl); padding:.875rem 1rem; display:grid; gap:.5rem; background:var(--uc-surface); }
      .uc-status-no{ border-style:dashed; }
      .uc-status-title{ margin:0; display:flex; gap:.625rem; align-items:flex-start; font-size:.9375rem; font-weight:800; line-height:1.7; }
      .uc-status:not(.uc-status-no) .uc-mark{ background:var(--uc-orange); color:#0a0a0a; }

      /* Buttons */
      .uc-actions{ display:flex; flex-wrap:wrap; gap:.625rem; align-items:center; }
      .uc-between{ justify-content:space-between; }
      .uc-btn{
        display:inline-flex; align-items:center; justify-content:center; gap:.5rem; min-height:48px; padding:0 1.125rem;
        border-radius:var(--uc-r-ctl); border:1.5px solid var(--uc-ink); background:var(--uc-surface); color:var(--uc-ink);
        font:inherit; font-size:.9375rem; font-weight:700; text-align:center; text-decoration:none; cursor:pointer;
        -webkit-tap-highlight-color:transparent; transition:background-color .15s, transform .1s;
      }
      .uc-btn:hover{ background:var(--uc-soft); }
      .uc-btn:active{ transform:translateY(1px); }
      .uc-btn-sm{ min-height:44px; padding:0 .875rem; font-size:.875rem; }
      .uc-btn-orange{ border-color:rgba(0,0,0,.22); }
      .uc-btn-orange:hover{ background:var(--uc-orange); filter:brightness(1.05); }
      .uc-btn-link{ border-inline-start:5px solid var(--uc-orange); line-height:1.6; padding-block:.5rem; }
      .uc-toggle{
        justify-self:start; display:inline-flex; align-items:center; gap:.375rem; min-height:44px; padding:0; background:none; border:0;
        color:var(--uc-ink); font:inherit; font-size:.9375rem; font-weight:800; text-decoration:underline; text-underline-offset:4px; cursor:pointer;
      }
      .uc-chev{ transition:transform .2s; }
      [aria-expanded="true"] > .uc-chev{ transform:rotate(180deg); }

      /* Bar */
      .uc-track{ position:relative; height:1.125rem; border-radius:999px; background:var(--uc-soft); border:1px solid var(--uc-line); overflow:hidden; direction:ltr; }
      .uc-zone{ position:absolute; top:0; bottom:0; left:50%; right:0; background:repeating-linear-gradient(135deg,transparent 0 5px,color-mix(in srgb,var(--uc-ink) 14%,transparent) 5px 7px); }
      .uc-fill0{ position:absolute; top:0; bottom:0; left:0; background:var(--uc-ink); transition:width .4s ease; }
      .uc-fill9{ position:absolute; top:0; bottom:0; left:50%; background:var(--uc-orange); transition:width .4s ease; }
      .uc-tick{ position:absolute; top:0; bottom:0; left:50%; width:2px; margin-left:-1px; background:var(--uc-ink); }
      .uc-scale{ display:grid; grid-template-columns:1fr auto 1fr; align-items:start; direction:ltr; font-size:.8125rem; font-weight:700; line-height:1.6; }
      .uc-scale > :first-child{ text-align:left; }
      .uc-scale > :nth-child(2){ text-align:center; }
      .uc-scale > :last-child{ text-align:right; }

      /* Stats + result */
      .uc-stats{ display:grid; gap:.625rem; grid-template-columns:repeat(2,minmax(0,1fr)); }
      @media (max-width:379px){ .uc-stats{ grid-template-columns:minmax(0,1fr); } }
      .uc-stats > .uc-stat:last-child:nth-child(odd){ grid-column:1 / -1; }
      .uc-stat{ padding:.75rem .875rem; border-radius:var(--uc-r-ctl); background:var(--uc-soft); border:1px solid var(--uc-line); display:grid; gap:.125rem; align-content:start; min-width:0; }
      .uc-stat-l{ margin:0; font-size:.8125rem; font-weight:600; color:var(--uc-text2); line-height:1.6; }
      .uc-stat-v{ margin:0; font-size:1.0625rem; font-weight:800; overflow-wrap:anywhere; }
      .uc-result{ border-radius:var(--uc-r-card); overflow:hidden; background:var(--uc-surface); border:1px solid var(--uc-line); box-shadow:var(--uc-shadow); }
      .uc-result-head{ padding:1.25rem; display:grid; gap:.375rem; border-radius:0; }
      .uc-result-h{ margin:0; font-size:.9375rem; font-weight:800; line-height:1.6; }
      .uc-fig{ margin:0; display:flex; align-items:baseline; flex-wrap:wrap; gap:.5rem; font-size:clamp(2rem,9vw,2.75rem); font-weight:800; line-height:1.2; overflow-wrap:anywhere; }
      .uc-fig .uc-ltr{ animation:uc-pop .35s ease-out; }
      .uc-cur{ font-size:1rem; font-weight:800; }
      .uc-result-sub{ margin:0; font-size:.875rem; font-weight:600; line-height:1.7; }
      .uc-result-body{ padding:1.125rem; display:grid; gap:1rem; }
      @keyframes uc-pop{ from{ opacity:.35; transform:translateY(5px); } to{ opacity:1; transform:none; } }

      /* Mobile sticky bar */
      .uc-bar{
        position:fixed; left:0; right:0; bottom:0; z-index:30; display:flex; align-items:center; justify-content:space-between; gap:.75rem;
        padding:.625rem .875rem calc(.625rem + env(safe-area-inset-bottom,0px)); background:var(--uc-surface);
        border-top:1px solid var(--uc-line); box-shadow:0 -12px 30px -18px rgba(0,0,0,.45);
      }
      .uc-bar-info{ display:grid; min-width:0; }
      .uc-bar-l{ font-size:.8125rem; font-weight:600; color:var(--uc-text2); }
      .uc-bar-v{ font-size:1.25rem; font-weight:800; overflow-wrap:anywhere; }
      @media (min-width:960px){ .uc-bar{ display:none; } }

      /* Print summary */
      .uc-doc{ border:1.5px solid var(--uc-ink); border-radius:var(--uc-r-ctl); padding:1rem; display:grid; gap:.875rem; }
      .uc-doc-head{ border-bottom:1.5px solid var(--uc-ink); padding-bottom:.625rem; display:grid; gap:.25rem; }
      .uc-doc-title{ margin:0; font-size:1.0625rem; font-weight:800; }
      .uc-tablewrap{ overflow-x:auto; }
      .uc-table{ width:100%; border-collapse:collapse; font-size:.875rem; }
      .uc-table th,.uc-table td{ padding:.5rem .5rem; border-bottom:1px solid var(--uc-line); font-weight:700; vertical-align:top; }
      .uc-table th{ text-align:start; color:var(--uc-text2); }
      .uc-table td{ text-align:end; overflow-wrap:anywhere; }

      @media (prefers-reduced-motion: reduce){
        .uc-root *,.uc-root *::before,.uc-root *::after{ animation:none !important; transition:none !important; scroll-behavior:auto !important; }
      }

      @media print{
        .uc-noprint,.uc-bar{ display:none !important; }
        .uc-root{ padding:0; max-width:none; border-radius:0; background:#fff; color:#000; --uc-ink:#000; --uc-surface:#fff; --uc-text2:#000; --uc-line:#000; --uc-soft:#fff; }
        .uc-layout{ display:block; }
        .uc-card{ border:0; padding:0; box-shadow:none; }
        .uc-doc{ break-inside:avoid; }
      }
    `}</style>
  );
}