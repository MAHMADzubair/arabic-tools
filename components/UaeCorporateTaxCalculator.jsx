"use client";

/**
 * components/UaeCorporateTaxCalculator.jsx
 * Ink & Signal: UAE corporate tax calculator.
 * All state, useMemo calculations, presets and lib imports are unchanged.
 * Changes: local styling (no Tailwind colour classes), emoji removed,
 * step badges are 1/2/3 (not Arabic-Indic), toggles/collapsibles use
 * aria-pressed / aria-expanded, status never relies on colour alone,
 * print shows only the summary.
 */
import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  CT_ZERO_RATE_LIMIT, NATURAL_PERSON_TURNOVER_LIMIT, TAXPAYER_TYPE,
  calcStandardCT, calcQfzpCT, checkSBREligibility,
  formatAED, sanitizeNumber, FTA_CT_URL, FTA_SBR_URL,
} from "@/lib/uaeCorporateTaxConfig";

/* ─── Small UI pieces ───────────────────────────────────────────────────── */

function AedInput({ id, label, hint, value, onChange, optional = false }) {
  return (
    <div className="uc-field">
      <label htmlFor={id} className="uc-label">
        {label}{optional && <span className="uc-hint"> (اختياري)</span>}
      </label>
      <div className="uc-input-wrap">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
  const lid = `uc-tri-${label.length}-${label.charCodeAt(0)}`;
  return (
    <div className="uc-field">
      <p id={lid} className="uc-label">{label}</p>
      <div className="uc-seg uc-seg-3" role="group" aria-labelledby={lid}>
        {[{ l: "نعم", v: true }, { l: "لا", v: false }, { l: "غير متأكد", v: null }].map(({ l, v }) => (
          <button key={l} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>
        ))}
      </div>
    </div>
  );
}

function StepTitle({ n, children }) {
  return (
    <div className="uc-step">
      <span className="uc-num" aria-hidden="true">{n}</span>
      <h2 className="uc-h2">{children}</h2>
    </div>
  );
}

/** Notice: always a mark + text, never colour-only. */
function Note({ title, children, dashed = false }) {
  return (
    <aside className={`uc-note ${dashed ? "uc-note-dash" : ""}`}>
      <span className="uc-mark" aria-hidden="true">!</span>
      <p className="uc-note-text">{title && <strong>{title} </strong>}{children}</p>
    </aside>
  );
}

/** Status box: ✓ (solid) or ! (dashed), with the word spelled out in the title. */
function Status({ ok, title, children }) {
  return (
    <div className={`uc-status ${ok ? "" : "uc-status-no"}`}>
      <p className="uc-status-title">
        <span className="uc-mark" aria-hidden="true">{ok ? "✓" : "!"}</span>
        {title}
      </p>
      {children}
    </div>
  );
}

function Stat({ label, value, sub, main = false }) {
  return (
    <div className={`uc-stat ${main ? "uc-stat-main" : ""}`}>
      <p className="uc-stat-l">{label}</p>
      <p className="uc-stat-v"><span className="uc-ltr">{value}</span></p>
      {sub && <p className="uc-small">{sub}</p>}
    </div>
  );
}

const TAXPAYER_OPTIONS = [
  { val: TAXPAYER_TYPE.STANDARD,       label: "شركة / شخص اعتباري",             desc: "شركة ذات مسؤولية محدودة أو أي كيان قانوني مسجّل" },
  { val: TAXPAYER_TYPE.NATURAL_PERSON, label: "شخص طبيعي يمارس نشاطاً تجارياً", desc: "فرد يمارس أعمالاً تجارية مستقلة أو مهنية في الإمارات" },
  { val: TAXPAYER_TYPE.FREE_ZONE,      label: "منشأة في منطقة حرة",              desc: "شركة مسجّلة في منطقة حرة إماراتية معتمدة" },
  { val: TAXPAYER_TYPE.UNSURE,         label: "غير متأكد",                       desc: "أحتاج توجيهاً حول نوع الخاضع للضريبة" },
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

  const estimatedTI = useMemo(() => {
    if (!estimateMode) return null;
    return Math.max(0, sanitizeNumber(estRevenue) - sanitizeNumber(estExpenses) + sanitizeNumber(estAdjustments) - sanitizeNumber(estTaxLosses));
  }, [estimateMode, estRevenue, estExpenses, estAdjustments, estTaxLosses]);

  const effectiveTI = useMemo(() => {
    if (estimateMode && estimatedTI !== null) return estimatedTI;
    return sanitizeNumber(taxableIncome);
  }, [estimateMode, estimatedTI, taxableIncome]);

  const stdResult = useMemo(() => calcStandardCT(effectiveTI), [effectiveTI]);
  const qfzpResult = useMemo(() => calcQfzpCT(qualifyingIncome, nonQualifyingIncome), [qualifyingIncome, nonQualifyingIncome]);
  const sbrResult = useMemo(
    () => checkSBREligibility({ isResident: sbrIsResident, currentRevenue: sbrCurrentRevenue, priorMaxRevenue: sbrPriorRevenue, isQFZP: sbrIsQFZP, isMNEAboveThreshold: sbrIsMNE }),
    [sbrIsResident, sbrCurrentRevenue, sbrPriorRevenue, sbrIsQFZP, sbrIsMNE]
  );

  const npTurnoverNum = sanitizeNumber(npTurnover);
  const npInScope = npTurnoverNum > NATURAL_PERSON_TURNOVER_LIMIT;
  const isFZQFZP = taxpayerType === TAXPAYER_TYPE.FREE_ZONE && isQFZP === true;
  const isNP = taxpayerType === TAXPAYER_TYPE.NATURAL_PERSON;
  const activeTI = isNP ? (npInScope ? sanitizeNumber(taxableIncome) : 0) : effectiveTI;
  const today = new Date().toLocaleDateString("ar-AE", { year: "numeric", month: "long", day: "numeric" });

  const handleReset = useCallback(() => {
    setTaxpayerType(TAXPAYER_TYPE.STANDARD); setAnnualRevenue("0"); setTaxableIncome("0");
    setEstimateMode(false); setEstRevenue("0"); setEstExpenses("0"); setEstAdjustments("0"); setEstTaxLosses("0");
    setNpTurnover("0"); setIsQFZP(null); setQualifyingIncome("0"); setNonQualifyingIncome("0");
    setShowSBR(false); setSbrIsResident(null); setSbrCurrentRevenue("0"); setSbrPriorRevenue("0"); setSbrIsQFZP(null); setSbrIsMNE(null);
    setShowCalcDetails(false); setShowPrint(false);
  }, []);

  const loadPreset = (id) => {
    handleReset();
    if (id === "ex1") { setTimeout(() => { setTaxableIncome("300000"); }, 0); }
    else if (id === "ex2") { setTimeout(() => { setTaxableIncome("1000000"); setAnnualRevenue("1200000"); }, 0); }
    else if (id === "ex3") { setTimeout(() => { setAnnualRevenue("2400000"); setTaxableIncome("500000"); setShowSBR(true); setSbrIsResident(true); setSbrCurrentRevenue("2400000"); setSbrPriorRevenue("0"); setSbrIsQFZP(false); setSbrIsMNE(false); }, 0); }
    else if (id === "ex4") { setTimeout(() => { setTaxpayerType(TAXPAYER_TYPE.NATURAL_PERSON); setNpTurnover("800000"); }, 0); }
    else if (id === "ex5") { setTimeout(() => { setTaxpayerType(TAXPAYER_TYPE.FREE_ZONE); setIsQFZP(true); setQualifyingIncome("2000000"); setNonQualifyingIncome("200000"); }, 0); }
  };

  const showResult = taxpayerType !== TAXPAYER_TYPE.UNSURE;
  const npOut = isNP && !npInScope;
  const barPct = Math.min(100, Math.max(3, (activeTI / (CT_ZERO_RATE_LIMIT * 2)) * 100));

  const resultTitle = isFZQFZP
    ? "نظام الشخص المؤهل في المنطقة الحرة (QFZP)"
    : npOut ? "قد لا تكون في نطاق ضريبة الشركات"
    : stdResult.tax === 0 ? "الدخل ضمن نطاق الإعفاء (0%)"
    : "ضريبة الشركات التقديرية";
  const resultSub = isFZQFZP
    ? `ضريبة QFZP التقديرية: ${formatAED(qfzpResult.tax)} د.إ على الدخل غير المؤهل`
    : npOut ? "الدوران دون 1,000,000 درهم. مراجعة FTA مطلوبة للتأكيد"
    : `الضريبة التقديرية: ${formatAED(stdResult.tax)} د.إ`;

  return (
    <div className="uc-root" dir="rtl">
      <CalcStyles />

      {/* Header */}
      <header className="uc-card uc-noprint">
        <div className="uc-head-row">
          <div>
            <h1 className="uc-h1">حاسبة ضريبة الشركات في الإمارات</h1>
            <p className="uc-lead">تقدير ضريبة الشركات وفق نسبتَي 0% و9%. المرسوم بقانون رقم 47 لسنة 2022</p>
          </div>
          <p className="uc-tag">محدث 2026 — FTA</p>
        </div>
      </header>

      {/* Presets */}
      <section className="uc-card uc-noprint" aria-labelledby="uc-presets">
        <p id="uc-presets" className="uc-small-b">نماذج سريعة للتجربة</p>
        <div className="uc-actions">
          {PRESETS.map((p) => (
            <button key={p.id} type="button" className="uc-btn uc-btn-sm" onClick={() => loadPreset(p.id)}>{p.label}</button>
          ))}
        </div>
      </section>

      {/* 1 — Taxpayer type */}
      <section className="uc-card uc-noprint" aria-labelledby="uc-s1">
        <div className="uc-step">
          <span className="uc-num" aria-hidden="true">1</span>
          <h2 id="uc-s1" className="uc-h2">ما نوع الخاضع للضريبة؟</h2>
        </div>
        <div className="uc-two" role="group" aria-labelledby="uc-s1">
          {TAXPAYER_OPTIONS.map(({ val, label, desc }) => {
            const on = taxpayerType === val;
            return (
              <button key={val} type="button" aria-pressed={on} onClick={() => setTaxpayerType(val)} className="uc-opt">
                <span className="uc-opt-top">
                  <span className="uc-opt-label">{label}</span>
                  {on && <span className="uc-check" aria-hidden="true">✓</span>}
                </span>
                <span className="uc-opt-desc">{desc}</span>
              </button>
            );
          })}
        </div>
        {taxpayerType === TAXPAYER_TYPE.UNSURE && (
          <Note title="توجيه:">إذا كنت شركة مسجّلة فاختر شركة. إذا كنت فرداً بنشاط تجاري فاختر شخص طبيعي. يُنصح بمراجعة مستشار ضريبي مؤهل.</Note>
        )}
      </section>

      {/* Natural person */}
      {isNP && (
        <section className="uc-card uc-noprint" aria-labelledby="uc-np">
          <StepTitle n="2"><span id="uc-np">بيانات الشخص الطبيعي</span></StepTitle>
          <Note dashed>يدخل الشخص الطبيعي في نطاق ضريبة الشركات عندما يتجاوز <strong>دوران نشاطه التجاري الإماراتي 1,000,000 درهم</strong> خلال السنة الميلادية. لا يُحتسب: الرواتب، دخل الاستثمار الشخصي، أو دخل الاستثمار العقاري المؤهل.</Note>
          <AedInput id="npTurnover" label="إجمالي دوران النشاط التجاري خلال السنة الميلادية *" hint="مجموع إيرادات النشاط التجاري أو المهني فقط. لا تُدرج الراتب أو دخل الاستثمار." value={npTurnover} onChange={setNpTurnover} />
          {npTurnoverNum > 0 && (
            <Status ok={!npInScope} title={npInScope ? "الدوران يتجاوز 1,000,000 درهم: قد تكون في نطاق ضريبة الشركات" : "الدوران دون 1,000,000 درهم: قد لا تكون مطالباً بالتسجيل"}>
              <p className="uc-text">{npInScope ? "يتجاوز الدوران حد التسجيل. ينبغي دراسة الالتزام بضريبة الشركات لدى FTA." : "قد لا تكون مطالباً بالتسجيل بناءً على هذا الشرط وحده. راجع دورياً."}</p>
            </Status>
          )}
          {npInScope && (
            <AedInput id="npTI" label="الدخل الخاضع للضريبة التقديري *" hint="تنطبق نسبتا 0% (أول 375,000 د.إ) و9% (ما يزيد) كالشركات." value={taxableIncome} onChange={setTaxableIncome} />
          )}
        </section>
      )}

      {/* Free zone */}
      {taxpayerType === TAXPAYER_TYPE.FREE_ZONE && (
        <section className="uc-card uc-noprint" aria-labelledby="uc-fz">
          <StepTitle n="2"><span id="uc-fz">بيانات منشأة المنطقة الحرة</span></StepTitle>
          <TriToggle label="هل أنت Qualifying Free Zone Person (QFZP) وفق الشروط الحالية؟" value={isQFZP} onChange={setIsQFZP} />
          {isQFZP === true && (
            <>
              <Note dashed title="نظام QFZP:">الدخل المؤهل ← 0%. الدخل غير المؤهل ← 9% كاملة بدون نطاق إعفاء 375,000 درهم.</Note>
              <div className="uc-two">
                <AedInput id="qi" label="الدخل المؤهل (Qualifying Income) *" hint="دخل الأنشطة المؤهلة. نسبة 0%." value={qualifyingIncome} onChange={setQualifyingIncome} />
                <AedInput id="nqti" label="الدخل غير المؤهل (Non-Qualifying Taxable Income) *" hint="دخل الأنشطة المستبعدة. يخضع لنسبة 9% كاملة بدون نطاق الإعفاء." value={nonQualifyingIncome} onChange={setNonQualifyingIncome} />
              </div>
              <Note>وضع QFZP يستلزم استيفاء شروط متعددة: الأنشطة المؤهلة، الجوهر الاقتصادي، أسعار التحويل، ومتطلبات de minimis. هذه الحاسبة لا تُحقق من وضع QFZP.</Note>
            </>
          )}
          {isQFZP === false && (
            <>
              <Note dashed>تنطبق القواعد المعيارية: 0% على أول 375,000 درهم، و9% على ما يتجاوزه.</Note>
              <AedInput id="fzTI" label="الدخل الخاضع للضريبة *" hint="صافي الدخل الخاضع بعد التعديلات." value={taxableIncome} onChange={setTaxableIncome} />
            </>
          )}
          {isQFZP === null && (
            <Note>لتحديد وضع QFZP تحقق من: نوع المنطقة الحرة، طبيعة الأنشطة، الجوهر الاقتصادي. يُنصح بمراجعة مستشار ضريبي.</Note>
          )}
        </section>
      )}

      {/* Standard */}
      {taxpayerType === TAXPAYER_TYPE.STANDARD && (
        <section className="uc-card uc-noprint" aria-labelledby="uc-st">
          <StepTitle n="2"><span id="uc-st">البيانات المالية</span></StepTitle>
          <Note dashed title="تنبيه:">الإيرادات ليست الدخل الخاضع للضريبة. ضريبة الشركات تُحسب على <strong>الدخل الخاضع للضريبة</strong> بعد المصروفات والتعديلات الضريبية المعتمدة.</Note>
          <div className="uc-two">
            <AedInput id="rev" label="الإيرادات السنوية" hint="يُستخدم لاختبارات الأهلية كتسهيلات الأعمال الصغيرة." value={annualRevenue} onChange={setAnnualRevenue} optional />
            <AedInput id="ti" label="الدخل الخاضع للضريبة *" hint="صافي الدخل بعد كل المصروفات والتعديلات الضريبية المعتمدة." value={taxableIncome} onChange={setTaxableIncome} />
          </div>
          <div className="uc-block">
            <button type="button" className="uc-link" aria-expanded={estimateMode} aria-controls="uc-est" onClick={() => setEstimateMode(!estimateMode)}>
              {estimateMode ? "إخفاء التقدير" : "تقدير الدخل الخاضع من الإيرادات والمصروفات"}
            </button>
            {estimateMode && (
              <div id="uc-est" className="uc-stack">
                <p className="uc-small">تقدير أولي للدخل الخاضع للضريبة. ليس إقراراً ضريبياً دقيقاً.</p>
                <div className="uc-two">
                  <AedInput id="eRev" label="الإيرادات" value={estRevenue} onChange={setEstRevenue} />
                  <AedInput id="eExp" label="المصروفات القابلة للخصم" value={estExpenses} onChange={setEstExpenses} />
                  <AedInput id="eAdj" label="تعديلات أخرى (إضافة)" value={estAdjustments} onChange={setEstAdjustments} optional />
                  <AedInput id="eLoss" label="خسائر ضريبية مستخدمة" value={estTaxLosses} onChange={setEstTaxLosses} optional />
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

      {/* Breakdown bar */}
      {showResult && (
        <section className="uc-card uc-noprint" aria-labelledby="uc-bd">
          <h3 id="uc-bd" className="uc-h3">توزيع الدخل الخاضع للضريبة</h3>
          {isFZQFZP ? (
            <div className="uc-two">
              <Stat label="الدخل المؤهل" value={`${formatAED(qfzpResult.qi)} د.إ`} sub="نسبة 0%" />
              <Stat label="الدخل غير المؤهل" value={`${formatAED(qfzpResult.nqti)} د.إ`} sub="نسبة 9% كاملة" />
            </div>
          ) : (
            <div className="uc-stack">
              <div className="uc-track" role="img" aria-label={`الدخل ${formatAED(activeTI)} د.إ مقابل حد 375,000 د.إ لنسبة 0%`}>
                <div className="uc-zone" />
                <div className="uc-fill" style={{ width: `${barPct}%` }} />
              </div>
              <div className="uc-scale">
                <span>0</span>
                <span><span className="uc-ltr">375,000 د.إ</span><br /><span className="uc-small">حد 0%</span></span>
                <span><span className="uc-ltr">+375,000</span><br /><span className="uc-small">9%</span></span>
              </div>
              <div className="uc-two">
                <Stat label="أول 375,000 د.إ" value="0%" sub="خاضع لنسبة 0%" />
                <Stat label="ما يتجاوز 375,000 د.إ" value="9%" sub="يخضع لنسبة 9%" />
              </div>
            </div>
          )}
        </section>
      )}

      {/* Result */}
      {showResult && (
        <section className="uc-result uc-noprint" aria-live="polite" aria-labelledby="uc-res">
          <div className="uc-result-head">
            <h2 id="uc-res" className="uc-result-h">{resultTitle}</h2>
            <p className="uc-result-sub"><span className="uc-ltr-flow">{resultSub}</span></p>
          </div>
          <div className="uc-result-body">
            {isFZQFZP ? (
              <div className="uc-three">
                <Stat label="الدخل المؤهل (0%)" value={`${formatAED(qfzpResult.qi)} د.إ`} />
                <Stat label="الدخل غير المؤهل (9%)" value={`${formatAED(qfzpResult.nqti)} د.إ`} />
                <Stat main label="ضريبة QFZP التقديرية" value={`${formatAED(qfzpResult.tax)} د.إ`} sub={`معدل فعلي: ${(qfzpResult.effectiveRate * 100).toFixed(2)}%`} />
              </div>
            ) : (
              <div className="uc-four">
                <Stat label="الدخل الخاضع للضريبة" value={`${formatAED(activeTI)} د.إ`} />
                <Stat label="الجزء الخاضع لـ 0%" value={`${formatAED(stdResult.zeroRatePortion)} د.إ`} />
                <Stat label="الجزء الخاضع لـ 9%" value={`${formatAED(stdResult.ninePercentPortion)} د.إ`} />
                <Stat main label="ضريبة الشركات التقديرية" value={`${formatAED(stdResult.tax)} د.إ`} sub={`معدل فعلي: ${(stdResult.effectiveRate * 100).toFixed(2)}%`} />
              </div>
            )}

            <div className="uc-block">
              <button type="button" className="uc-link" aria-expanded={showCalcDetails} aria-controls="uc-how" onClick={() => setShowCalcDetails(!showCalcDetails)}>
                كيف تم الحساب؟
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
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SBR */}
      {(taxpayerType === TAXPAYER_TYPE.STANDARD || (isNP && npInScope)) && (
        <section className="uc-card uc-noprint" aria-labelledby="uc-sbr">
          <div className="uc-step uc-step-between">
            <div className="uc-step">
              <span className="uc-num" aria-hidden="true">3</span>
              <h2 id="uc-sbr" className="uc-h2">تسهيلات الأعمال الصغيرة (SBR)</h2>
            </div>
            <button type="button" className="uc-btn uc-btn-sm" aria-expanded={showSBR} aria-controls="uc-sbr-body" onClick={() => setShowSBR(!showSBR)}>
              {showSBR ? "إخفاء" : "فحص الأهلية"}
            </button>
          </div>
          {!showSBR && <p className="uc-small">إذا كانت إيراداتك أقل أو تساوي 3,000,000 درهم قد تكون مؤهلاً لتسهيلات الأعمال الصغيرة.</p>}
          {showSBR && (
            <div id="uc-sbr-body" className="uc-stack">
              <TriToggle label="هل المنشأة مقيمة لأغراض ضريبة الشركات؟" value={sbrIsResident} onChange={setSbrIsResident} />
              <div className="uc-two">
                <AedInput id="sbrRev" label="إجمالي الإيرادات للفترة الضريبية الحالية" hint="يجب ألا تتجاوز 3,000,000 درهم." value={sbrCurrentRevenue} onChange={setSbrCurrentRevenue} />
                <AedInput id="sbrPrior" label="أعلى إيرادات في أي فترة ضريبية سابقة ذات صلة" hint="يجب ألا تكون في أي فترة سابقة تجاوزت 3,000,000 درهم." value={sbrPriorRevenue} onChange={setSbrPriorRevenue} optional />
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

              <Note>تم تمديد تسهيلات الأعمال الصغيرة (بحد إيرادات 3,000,000 درهم) بموجب القرار الوزاري رقم 131 لسنة 2026. تسري على الفترات الضريبية التي تنتهي في أو قبل 31 ديسمبر 2029. التسهيل اختياري (election) وليس إعفاءً تلقائياً. يجب مراجعة أحدث إرشادات الهيئة الاتحادية للضرائب قبل الاعتماد على هذه النتيجة. آخر مراجعة: أكتوبر 2026.</Note>
            </div>
          )}
        </section>
      )}

      {/* Print summary */}
      {showResult && (
        <section className={`uc-card ${showPrint ? "" : "uc-noprint"}`} aria-labelledby="uc-pr">
          <div className="uc-step uc-step-between uc-noprint">
            <h3 id="uc-pr" className="uc-h3">ملخص تقديري قابل للطباعة</h3>
            <button type="button" className="uc-btn uc-btn-sm" aria-expanded={showPrint} aria-controls="uc-print-body" onClick={() => setShowPrint(!showPrint)}>
              {showPrint ? "إخفاء" : "إنشاء الملخص"}
            </button>
          </div>
          {showPrint && (
            <div id="uc-print-body" className="uc-doc">
              <div className="uc-doc-head">
                <h4 className="uc-doc-title">ملخص تقديري لضريبة الشركات</h4>
                <p className="uc-small">هذا الملخص تقديري استرشادي وليس إقراراً ضريبياً أو وثيقة معتمدة.</p>
              </div>
              <table className="uc-table">
                <tbody>
                  {[
                    ["نوع الخاضع للضريبة", TAXPAYER_OPTIONS.find((o) => o.val === taxpayerType)?.label || "-"],
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
              <p className="uc-small">هذا الملخص تقديري استرشادي يعتمد على البيانات المدخلة ولا يمثل إقراراً ضريبياً أو قراراً رسمياً من الهيئة الاتحادية للضرائب.</p>
              <button type="button" className="uc-btn uc-btn-p uc-noprint" onClick={() => window.print()}>طباعة / حفظ PDF</button>
            </div>
          )}
        </section>
      )}

      {/* Disclaimer */}
      <aside className="uc-card uc-dash uc-noprint" aria-labelledby="uc-disc">
        <h3 id="uc-disc" className="uc-h3">إخلاء المسؤولية</h3>
        <p className="uc-text">هذه الحاسبة تقديرية وتعتمد على البيانات التي يدخلها المستخدم، ولا تمثل إقراراً ضريبياً أو قراراً رسمياً من الهيئة الاتحادية للضرائب.</p>
        <p className="uc-text">قد تختلف النتيجة بحسب نوع الشخص، التعديلات الضريبية، الإعفاءات، الخسائر، وضع المنطقة الحرة، المعاملات مع الأطراف المرتبطة، والفترة الضريبية.</p>
        <p className="uc-text">يرجى الرجوع إلى <a href={FTA_CT_URL} target="_blank" rel="noopener noreferrer" className="uc-anchor">الهيئة الاتحادية للضرائب — tax.gov.ae<span className="uc-sr"> (يفتح في نافذة جديدة)</span></a> أو مستشار ضريبي مؤهل عند الحاجة إلى تحديد رسمي.</p>
      </aside>

      {/* Reset + cross-link */}
      <div className="uc-actions uc-between uc-noprint">
        <button type="button" className="uc-btn" onClick={handleReset}>إعادة تعيين</button>
        <Link href="/ar/ae/vat-registration-checker" className="uc-btn uc-btn-link">هل تحتاج فحص أهلية التسجيل في ضريبة القيمة المضافة؟</Link>
      </div>

      {/* Official source */}
      <footer className="uc-card uc-noprint">
        <p className="uc-text">المصدر: <strong>الهيئة الاتحادية للضرائب — دولة الإمارات العربية المتحدة</strong></p>
        <div className="uc-actions">
          <a href={FTA_CT_URL} target="_blank" rel="noopener noreferrer" className="uc-anchor">ضريبة الشركات — FTA<span className="uc-sr"> (يفتح في نافذة جديدة)</span></a>
          <a href={FTA_SBR_URL} target="_blank" rel="noopener noreferrer" className="uc-anchor">تسهيلات الأعمال الصغيرة<span className="uc-sr"> (يفتح في نافذة جديدة)</span></a>
        </div>
      </footer>
    </div>
  );
}

/**
 * Local styles. Map the --uc-* fallbacks to your real Ink & Signal tokens.
 */
function CalcStyles() {
  return (
    <style>{`
      .uc-root{
        --uc-ink:#0a0a0a; --uc-paper:#ffffff; --uc-muted:#f0f0f0;
        --uc-text2:#404040; --uc-orange:#ff5a1f;
        max-width:48rem; margin:0 auto; padding:1.5rem 1rem;
        color:var(--uc-ink); background:var(--uc-paper); display:grid; gap:1.25rem;
      }
      @media (prefers-color-scheme: dark){
        :root:not([data-theme="light"]) .uc-root{
          --uc-ink:#f5f5f5; --uc-paper:#0a0a0a; --uc-muted:#1a1a1a; --uc-text2:#d4d4d4;
        }
      }
      :root[data-theme="dark"] .uc-root{
        --uc-ink:#f5f5f5; --uc-paper:#0a0a0a; --uc-muted:#1a1a1a; --uc-text2:#d4d4d4;
      }
      .uc-root :focus-visible{ outline:3px solid var(--uc-orange); outline-offset:2px; }
      .uc-ltr{ direction:ltr; unicode-bidi:isolate; display:inline-block; }
      .uc-ltr-flow{ unicode-bidi:plaintext; }
      .uc-sr{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
      .uc-stack{ display:grid; gap:1rem; }

      /* Text */
      .uc-h1{ margin:0; font-size:1.375rem; font-weight:800; line-height:1.5; }
      .uc-h2{ margin:0; font-size:.9375rem; font-weight:800; line-height:1.6; }
      .uc-h3{ margin:0; font-size:.8125rem; font-weight:800; }
      .uc-lead{ margin:.25rem 0 0; font-size:.75rem; line-height:1.8; color:var(--uc-text2); }
      .uc-text{ margin:0; font-size:.75rem; line-height:1.9; color:var(--uc-text2); }
      .uc-small{ margin:0; font-size:.6875rem; line-height:1.8; color:var(--uc-text2); }
      .uc-small-b{ margin:0; font-size:.75rem; font-weight:800; }
      .uc-tag{ margin:0; padding:.125rem .75rem; border:2px solid var(--uc-ink); font-size:.75rem; font-weight:800; white-space:nowrap; }
      .uc-big{ margin:0; font-size:1.25rem; font-weight:900; }
      .uc-list{ margin:0; padding-inline-start:1.25rem; display:grid; gap:.25rem; }
      .uc-anchor{ color:var(--uc-ink); font-size:.75rem; font-weight:800; text-decoration:underline; text-underline-offset:3px; }

      /* Cards */
      .uc-card{ border:2px solid var(--uc-ink); padding:1.25rem; display:grid; gap:1rem; }
      .uc-dash{ border-style:dashed; }
      .uc-head-row{ display:flex; flex-wrap:wrap; gap:1rem; justify-content:space-between; align-items:flex-start; }
      .uc-step{ display:flex; align-items:center; gap:.625rem; }
      .uc-step-between{ justify-content:space-between; flex-wrap:wrap; }
      .uc-num{
        flex:none; width:1.75rem; height:1.75rem; display:inline-flex; align-items:center; justify-content:center;
        border:2px solid var(--uc-ink); font-size:.8125rem; font-weight:800;
      }
      .uc-block{ border-top:2px solid var(--uc-ink); padding-top:.75rem; display:grid; gap:.75rem; }
      .uc-box{ border:2px solid var(--uc-ink); padding:.75rem 1rem; display:grid; gap:.25rem; }

      /* Notes + status (mark + text, never colour-only) */
      .uc-note{
        display:flex; gap:.5rem; align-items:flex-start; border:2px solid var(--uc-ink);
        border-inline-start:6px solid var(--uc-orange); padding:.625rem .75rem;
      }
      .uc-note-dash{ border:2px dashed var(--uc-ink); border-inline-start:2px dashed var(--uc-ink); }
      .uc-note-text{ margin:0; font-size:.75rem; line-height:1.9; color:var(--uc-text2); }
      .uc-mark{
        flex:none; width:1.25rem; height:1.25rem; display:inline-flex; align-items:center; justify-content:center;
        border:2px solid currentColor; font-size:.75rem; font-weight:900; color:var(--uc-ink);
      }
      .uc-status{ border:2px solid var(--uc-ink); padding:.75rem 1rem; display:grid; gap:.5rem; }
      .uc-status-no{ border-style:dashed; border-width:3px; }
      .uc-status-title{ margin:0; display:flex; gap:.5rem; align-items:flex-start; font-size:.8125rem; font-weight:800; line-height:1.7; }

      /* Buttons */
      .uc-actions{ display:flex; flex-wrap:wrap; gap:.5rem; align-items:center; }
      .uc-between{ justify-content:space-between; }
      .uc-btn{
        display:inline-block; padding:.5rem .875rem; border:2px solid var(--uc-ink); font-size:.75rem; font-weight:800;
        font-family:inherit; cursor:pointer; background:var(--uc-paper); color:var(--uc-ink); text-decoration:none;
      }
      .uc-btn:hover{ background:var(--uc-muted); }
      .uc-btn-sm{ padding:.25rem .625rem; }
      .uc-btn-p{ background:var(--uc-orange); color:#0a0a0a; }
      .uc-btn-p:hover{ background:var(--uc-ink); color:var(--uc-paper); }
      .uc-btn-link{ border-inline-start:6px solid var(--uc-orange); }
      .uc-link{
        justify-self:start; background:none; border:0; padding:0; font-family:inherit; font-size:.75rem;
        font-weight:800; color:var(--uc-ink); text-decoration:underline; text-underline-offset:3px; cursor:pointer;
      }

      /* Options + segmented */
      .uc-two{ display:grid; gap:.875rem; grid-template-columns:1fr; }
      @media (min-width:640px){ .uc-two{ grid-template-columns:1fr 1fr; } }
      .uc-three,.uc-four{ display:grid; gap:.75rem; grid-template-columns:1fr; }
      @media (min-width:640px){ .uc-three{ grid-template-columns:repeat(3,1fr); } .uc-four{ grid-template-columns:repeat(2,1fr); } }
      @media (min-width:900px){ .uc-four{ grid-template-columns:repeat(4,1fr); } }
      .uc-opt{
        display:grid; gap:.25rem; text-align:start; padding:.75rem; border:2px solid var(--uc-ink);
        background:var(--uc-paper); color:var(--uc-ink); font-family:inherit; cursor:pointer;
      }
      .uc-opt:hover{ background:var(--uc-muted); }
      .uc-opt[aria-pressed="true"]{ background:var(--uc-orange); color:#0a0a0a; border-width:4px; padding:.5rem .625rem; }
      .uc-opt-top{ display:flex; justify-content:space-between; align-items:center; gap:.5rem; }
      .uc-opt-label{ font-size:.8125rem; font-weight:800; }
      .uc-opt-desc{ font-size:.6875rem; line-height:1.7; font-weight:600; }
      .uc-check{ font-weight:900; }
      .uc-seg{ display:flex; border:2px solid var(--uc-ink); max-width:24rem; }
      .uc-seg button{
        flex:1; padding:.5rem .5rem; border:0; background:var(--uc-paper); color:var(--uc-ink);
        font-size:.75rem; font-weight:800; font-family:inherit; cursor:pointer;
      }
      .uc-seg button + button{ border-inline-start:2px solid var(--uc-ink); }
      .uc-seg button[aria-pressed="true"]{ background:var(--uc-ink); color:var(--uc-paper); }

      /* Fields */
      .uc-field{ display:grid; gap:.25rem; align-content:start; }
      .uc-label{ margin:0; font-size:.75rem; font-weight:800; line-height:1.6; }
      .uc-hint{ font-weight:600; color:var(--uc-text2); }
      .uc-input-wrap{ display:flex; border:2px solid var(--uc-ink); background:var(--uc-paper); }
      .uc-input-wrap:focus-within{ outline:3px solid var(--uc-orange); outline-offset:2px; }
      .uc-input{
        flex:1; min-width:0; border:0; background:transparent; color:var(--uc-ink);
        padding:.625rem .75rem; font-size:.875rem; font-weight:700; font-family:inherit;
      }
      .uc-input:focus-visible{ outline:none; }
      .uc-sym{
        flex:none; padding:0 .75rem; display:inline-flex; align-items:center; background:var(--uc-muted);
        border-inline-start:2px solid var(--uc-ink); font-size:.75rem; font-weight:800;
      }

      /* Bar */
      .uc-track{ position:relative; height:1.5rem; border:2px solid var(--uc-ink); background:var(--uc-paper); overflow:hidden; direction:ltr; }
      .uc-zone{ position:absolute; top:0; bottom:0; left:50%; right:0; background:var(--uc-muted); border-left:2px solid var(--uc-ink); }
      .uc-fill{ position:absolute; top:0; bottom:0; left:0; background:var(--uc-ink); }
      .uc-scale{ display:flex; justify-content:space-between; font-size:.6875rem; font-weight:800; line-height:1.6; padding-inline:.25rem; direction:ltr; }

      /* Stats + result */
      .uc-stat{ border:2px solid var(--uc-ink); padding:.75rem; display:grid; gap:.125rem; align-content:start; }
      .uc-stat-main{ border-width:4px; padding:.5rem .625rem; }
      .uc-stat-l{ margin:0; font-size:.6875rem; font-weight:700; }
      .uc-stat-v{ margin:0; font-size:1rem; font-weight:900; }
      .uc-result{ border:2px solid var(--uc-ink); }
      .uc-result-head{
        background:var(--uc-orange); color:#0a0a0a; padding:1.25rem; border-bottom:2px solid var(--uc-ink);
        display:grid; gap:.375rem; print-color-adjust:exact; -webkit-print-color-adjust:exact;
      }
      .uc-result-h{ margin:0; font-size:1.125rem; font-weight:900; line-height:1.6; }
      .uc-result-sub{ margin:0; font-size:.8125rem; font-weight:700; }
      .uc-result-body{ padding:1.25rem; display:grid; gap:1rem; }

      /* Print summary */
      .uc-doc{ border:2px solid var(--uc-ink); padding:1rem; display:grid; gap:.75rem; }
      .uc-doc-head{ border-bottom:2px solid var(--uc-ink); padding-bottom:.5rem; display:grid; gap:.25rem; }
      .uc-doc-title{ margin:0; font-size:1rem; font-weight:900; }
      .uc-table{ width:100%; border-collapse:collapse; font-size:.75rem; }
      .uc-table th,.uc-table td{ padding:.375rem .5rem; border-bottom:1px solid var(--uc-ink); font-weight:800; }
      .uc-table th{ text-align:start; color:var(--uc-text2); }
      .uc-table td{ text-align:end; }

      @media print{
        .uc-noprint{ display:none !important; }
        .uc-root{ padding:0; max-width:none; background:#fff; color:#000; --uc-ink:#000; --uc-paper:#fff; --uc-text2:#000; }
        .uc-card{ border-color:#000; padding:0; border:0; }
        .uc-doc{ break-inside:avoid; }
      }
    `}</style>
  );
}