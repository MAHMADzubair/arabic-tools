"use client";

import { useState, useMemo, useEffect, useId } from "react";

function toNum(v) {
  const n = parseFloat(String(v));
  return isNaN(n) || n < 0 ? 0 : n;
}

// Western digits (9,000.00). For Arabic-Hindi digits change "en-US" to "ar-SA".
function fmt(n) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function track(event, params) {
  if (typeof window !== "undefined" && typeof window.trackEvent === "function") {
    window.trackEvent(event, params);
  }
}

export default function Article77Calculator() {
  const uid = useId();

  // Inputs
  const [contractType, setContractType] = useState("indefinite"); // "indefinite" | "fixed"
  const [terminatingParty, setTerminatingParty] = useState("employer"); // "employer" | "employee"
  const [hasAgreedClause, setHasAgreedClause] = useState("no"); // "no" | "yes"
  const [agreedAmount, setAgreedAmount] = useState("0");

  const [basicSalary, setBasicSalary] = useState("8000");
  const [housingAllowance, setHousingAllowance] = useState("2000");
  const [transportAllowance, setTransportAllowance] = useState("1000");
  const [otherAllowances, setOtherAllowances] = useState("0");

  const [serviceYears, setServiceYears] = useState("4");
  const [serviceMonths, setServiceMonths] = useState("6");
  const [remainingMonths, setRemainingMonths] = useState("5");

  const [copied, setCopied] = useState(false);

  // ─── Calculation (unchanged) ───────────────────────────────────────────────
  const calc = useMemo(() => {
    const basic = toNum(basicSalary);
    const housing = toNum(housingAllowance);
    const transport = toNum(transportAllowance);
    const others = toNum(otherAllowances);
    const totalWage = basic + housing + transport + others;
    const dailyWage = totalWage / 30;

    let statutoryRaw = 0;
    let calculationFormulaDesc = "";

    if (contractType === "indefinite") {
      const yrs = toNum(serviceYears) + toNum(serviceMonths) / 12;
      statutoryRaw = 0.5 * totalWage * yrs;
      calculationFormulaDesc = `أجر 15 يوماً (نصف شهر = ${fmt(totalWage / 2)} ر.س) × ${yrs.toFixed(2)} سنة خدمة`;
    } else {
      const rem = toNum(remainingMonths);
      statutoryRaw = totalWage * rem;
      calculationFormulaDesc = `أجر كامل المدة المتبقية (${rem} شهر) × ${fmt(totalWage)} ر.س`;
    }

    const statutoryFloor = 2 * totalWage;
    const floorApplied = statutoryRaw < statutoryFloor;
    const finalStatutory = Math.max(statutoryRaw, statutoryFloor);

    let finalCompensation = finalStatutory;
    let ruleApplied = "";

    if (hasAgreedClause === "yes" && toNum(agreedAmount) > 0) {
      finalCompensation = toNum(agreedAmount);
      ruleApplied = "التعويض الاتفاقي المنصوص عليه صراحة في عقد العمل (أولوية تعاقدية)";
    } else {
      ruleApplied = floorApplied
        ? "تطبيق الحد الأدنى النظامي الإلزامي (أجر شهرين) لأن الناتج الحسابي أقل من الحد الأدنى"
        : contractType === "indefinite"
        ? "حساب الفقرة (1) من المادة 77: 15 يوماً عن كل سنة خدمة"
        : "حساب الفقرة (2) من المادة 77: أجر كامل المدة المتبقية في العقد";
    }

    return {
      totalWage,
      basic,
      dailyWage,
      statutoryRaw,
      statutoryFloor,
      floorApplied,
      finalCompensation,
      calculationFormulaDesc,
      ruleApplied,
    };
  }, [
    contractType,
    hasAgreedClause,
    agreedAmount,
    basicSalary,
    housingAllowance,
    transportAllowance,
    otherAllowances,
    serviceYears,
    serviceMonths,
    remainingMonths,
  ]);

  // Analytics (unchanged)
  useEffect(() => {
    track("calculator_used", {
      tool: "article-77",
      contract_type: contractType,
      terminating_party: terminatingParty,
    });
    track("result_generated", {
      tool: "article-77",
      compensation: Math.round(calc.finalCompensation),
    });
  }, [calc.finalCompensation, contractType, terminatingParty]);

  // Share text (unchanged)
  const shareText = useMemo(() => {
    const beneficiaryText =
      terminatingParty === "employer" ? "مستحق للعامل (تعويض)" : "مستحق لصاحب العمل";
    return `📊 نتيجة حساب تعويض المادة 77 (الفصل لسبب غير مشروع):
• نوع العقد: ${contractType === "indefinite" ? "غير محدد المدة" : "محدد المدة"}
• الأجر الفعلي الشهري: ${fmt(calc.totalWage)} ر.س
• الطرف المنهي للعقد: ${terminatingParty === "employer" ? "صاحب العمل" : "العامل"}
• قيمة التعويض المستحق: ${fmt(calc.finalCompensation)} ر.س (${beneficiaryText})
• السند: المادة (77) من نظام العمل السعودي

احسب تعويضك الآن مجاناً عبر:
${(process.env.NEXT_PUBLIC_SITE_URL || "https://arabic-tools-xi.vercel.app")}/ar/sa/article-77-calculator`;
  }, [contractType, terminatingParty, calc]);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      track("share_clicked", { tool: "article-77", method: "clipboard" });
    }
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
    track("share_clicked", { tool: "article-77", method: "whatsapp" });
  };

  const toEmployee = terminatingParty === "employer";

  return (
    <div className="a77">
      <style>{CSS}</style>

      <div className="a77-card">
        {/* Header */}
        <header className="a77-head">
          <p className="a77-badge">نظام العمل السعودي — المرسوم الملكي م/51</p>
          <h1 className="a77-title">حاسبة التعويض عن إنهاء العقد غير المشروع (المادة 77)</h1>
          <p className="a77-sub">
            قدّر التعويض وفق قاعدة المادة 77 من نظام العمل السعودي عند فسخ عقد العمل دون سبب مشروع مع تطبيق الحد الأدنى النظامي (أجر شهرين).
          </p>
        </header>

        <div className="a77-cols">
          {/* ───────── Inputs ───────── */}
          <div className="a77-stack">
            {/* Contract type */}
            <fieldset className="a77-fs">
              <legend className="a77-label">نوع عقد العمل</legend>
              <div className="a77-seg a77-seg--2" role="radiogroup" aria-label="نوع عقد العمل">
                <button
                  type="button"
                  role="radio"
                  aria-checked={contractType === "indefinite"}
                  onClick={() => setContractType("indefinite")}
                  className="a77-opt"
                >
                  <strong>غير محدد المدة</strong>
                  <span>15 يوماً عن كل سنة خدمة</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={contractType === "fixed"}
                  onClick={() => setContractType("fixed")}
                  className="a77-opt"
                >
                  <strong>محدد المدة</strong>
                  <span>أجر المدة الباقية كاملة</span>
                </button>
              </div>
            </fieldset>

            {/* Terminating party */}
            <fieldset className="a77-fs">
              <legend className="a77-label">الطرف المنهي للعقد (المتسبب بالإنهاء غير المشروع)</legend>
              <div className="a77-seg a77-seg--2" role="radiogroup" aria-label="الطرف المنهي للعقد">
                <button
                  type="button"
                  role="radio"
                  aria-checked={terminatingParty === "employer"}
                  onClick={() => setTerminatingParty("employer")}
                  className="a77-opt"
                >
                  <strong>صاحب العمل</strong>
                  <span>فصل تعسفي</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={terminatingParty === "employee"}
                  onClick={() => setTerminatingParty("employee")}
                  className="a77-opt"
                >
                  <strong>العامل</strong>
                  <span>ترك العمل دون سبب</span>
                </button>
              </div>
              <p className="a77-note">
                {toEmployee
                  ? "التعويض يُدفع للعامل جبراً عن إنهاء خدماته التعسفي."
                  : "التعويض يُستحق لصاحب العمل جبراً عن إخلال العامل بمدّة العقد."}
              </p>
            </fieldset>

            {/* Wage breakdown */}
            <fieldset className="a77-fs a77-box">
              <legend className="a77-label">الأجر الفعلي المعتمد (الأساسي + البدلات)</legend>
              <div className="a77-grid2">
                <Field id={`${uid}-basic`} label="الراتب الأساسي" value={basicSalary} onChange={setBasicSalary} ph="8000" />
                <Field id={`${uid}-housing`} label="بدل السكن" value={housingAllowance} onChange={setHousingAllowance} ph="2000" />
                <Field id={`${uid}-transport`} label="بدل النقل" value={transportAllowance} onChange={setTransportAllowance} ph="1000" />
                <Field id={`${uid}-other`} label="بدلات أخرى ثابتة" value={otherAllowances} onChange={setOtherAllowances} ph="0" />
              </div>
              <p className="a77-total">
                <span>إجمالي الأجر الفعلي الشهري</span>
                <strong className="a77-num">{fmt(calc.totalWage)} ر.س</strong>
              </p>
            </fieldset>

            {/* Duration */}
            {contractType === "indefinite" ? (
              <fieldset className="a77-fs">
                <legend className="a77-label">مدة الخدمة في المنشأة</legend>
                <div className="a77-grid2">
                  <Field id={`${uid}-years`} label="سنوات الخدمة" value={serviceYears} onChange={setServiceYears} ph="4" />
                  <Field id={`${uid}-months`} label="أشهر إضافية" value={serviceMonths} onChange={setServiceMonths} ph="6" max="11" />
                </div>
              </fieldset>
            ) : (
              <div className="a77-field">
                <label className="a77-label" htmlFor={`${uid}-remaining`}>
                  المدة المتبقية حتى نهاية العقد (بالأشهر)
                </label>
                <input
                  id={`${uid}-remaining`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={remainingMonths}
                  onChange={(e) => setRemainingMonths(e.target.value)}
                  className="a77-input a77-num"
                  placeholder="5"
                />
                <p className="a77-hint">
                  احسب عدد الشهور والأيام المتبقية حتى تاريخ نهاية العقد المبرم بين الطرفين.
                </p>
              </div>
            )}

            {/* Agreed clause */}
            <div className="a77-box a77-stack-sm">
              <div className="a77-field">
                <label className="a77-label" htmlFor={`${uid}-clause`}>
                  هل ينص العقد على تعويض محدد متفق عليه؟
                </label>
                <select
                  id={`${uid}-clause`}
                  value={hasAgreedClause}
                  onChange={(e) => setHasAgreedClause(e.target.value)}
                  className="a77-input"
                >
                  <option value="no">لا (التعويض النظامي)</option>
                  <option value="yes">نعم (شرط اتفاقي)</option>
                </select>
              </div>
              {hasAgreedClause === "yes" && (
                <div className="a77-field">
                  <label className="a77-label" htmlFor={`${uid}-agreed`}>
                    قيمة التعويض المنصوص عليها في العقد (ر.س)
                  </label>
                  <input
                    id={`${uid}-agreed`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={agreedAmount}
                    onChange={(e) => setAgreedAmount(e.target.value)}
                    className="a77-input a77-num"
                    placeholder="مثال: 30000"
                  />
                  <p className="a77-hint">
                    صدارة المادة (77): "ما لم يتضمن العقد تعويضاً محدداً..." يُقدَّم الشرط الجزائي المتفق عليه إن وُجد.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ───────── Results ───────── */}
          <div className="a77-stack">
            <section className="a77-result" aria-live="polite" aria-label="النتيجة">
              <p className="a77-result-top">
                <span>مستحق التعويض</span>
                <span className="a77-tag">
                  {toEmployee ? "حق للعامل (+)" : "مستحق لصاحب العمل (−)"}
                </span>
              </p>
              <p className="a77-result-label">صافي قيمة التعويض المستحق بموجب المادة 77</p>
              <p className="a77-result-value">
                <span className="a77-num">{fmt(calc.finalCompensation)}</span>
                <span className="a77-result-cur">ر.س</span>
              </p>
              <p className="a77-result-note">
                {toEmployee
                  ? "يُصرف للعامل بالإضافة إلى مكافأة نهاية الخدمة وبدل الإجازات."
                  : "يحق لصاحب العمل خصمه من مستحقات العامل أو المطالبة به."}
              </p>
            </section>

            <section className="a77-box" aria-label="تفصيل السند الحسابي والنظامي">
              <h2 className="a77-h2">تفصيل السند الحسابي والنظامي</h2>
              <dl className="a77-rows">
                <div className="a77-row">
                  <dt>الأجر الفعلي الشهري</dt>
                  <dd><span className="a77-num">{fmt(calc.totalWage)}</span> ر.س</dd>
                </div>
                <div className="a77-row a77-row--stack">
                  <dt>معادلة الحساب</dt>
                  <dd className="a77-formula">{calc.calculationFormulaDesc}</dd>
                </div>
                <div className="a77-row">
                  <dt>الناتج الحسابي الأولي</dt>
                  <dd><span className="a77-num">{fmt(calc.statutoryRaw)}</span> ر.س</dd>
                </div>
                <div className="a77-row">
                  <dt>الحد الأدنى الإلزامي (شهرين)</dt>
                  <dd><span className="a77-num">{fmt(calc.statutoryFloor)}</span> ر.س</dd>
                </div>
              </dl>

              {calc.floorApplied && hasAgreedClause !== "yes" && (
                <p className="a77-warn" role="note">
                  <strong>تنبيه:</strong> الناتج الحسابي ({fmt(calc.statutoryRaw)} ر.س) كان أقل من أجر شهرين، فتم رفع التعويض وجوباً إلى الحد الأدنى القانوني ({fmt(calc.statutoryFloor)} ر.س) وفق الفقرة (3) من المادة (77).
                </p>
              )}

              <p className="a77-rule">
                <strong>القاعدة المطبقة:</strong> {calc.ruleApplied}
              </p>
            </section>

            {/* Share */}
            <div className="a77-actions a77-noprint">
              <div className="a77-grid2">
                <button type="button" onClick={handleWhatsApp} className="a77-btn a77-btn--ink">
                  واتساب
                </button>
                <button type="button" onClick={handleCopy} className="a77-btn">
                  {copied ? "تم النسخ" : "نسخ النتيجة"}
                </button>
              </div>
              <button type="button" onClick={() => window.print()} className="a77-btn">
                طباعة تقرير التعويض
              </button>
              <span className="a77-sr" role="status">{copied ? "تم نسخ النتيجة" : ""}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, value, onChange, ph, max }) {
  return (
    <div className="a77-field">
      <label className="a77-label a77-label--sm" htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="a77-input a77-num"
        placeholder={ph}
      />
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
// Colours come from --c-* on .a77. If your tokens.css already defines the
// underlying names, delete the fallback values and map them in one place.
const CSS = `
.a77 {
  --c-surface: var(--surface, #FFFFFF);
  --c-ink: var(--ink, #0D0D0D);
  --c-ink-soft: var(--ink-soft, #4A4A46);
  --c-line: var(--line, #D9D9D3);
  --c-signal: var(--signal, #FF6A1A);
  --c-on-ink: var(--on-ink, #FFFFFF);
  --c-on-signal: var(--on-signal, #0D0D0D);
  --c-warning: var(--warning, #8A5A00);

  max-width: 64rem;
  margin-inline: auto;
  color: var(--c-ink);
  font-family: inherit;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .a77 {
    --c-surface: var(--surface, #181816);
    --c-ink: var(--ink, #F5F5F2);
    --c-ink-soft: var(--ink-soft, #B4B4AD);
    --c-line: var(--line, #34342F);
    --c-on-ink: var(--on-ink, #0D0D0D);
    --c-warning: var(--warning, #F2B84B);
  }
}
:root[data-theme="dark"] .a77 {
  --c-surface: var(--surface, #181816);
  --c-ink: var(--ink, #F5F5F2);
  --c-ink-soft: var(--ink-soft, #B4B4AD);
  --c-line: var(--line, #34342F);
  --c-on-ink: var(--on-ink, #0D0D0D);
  --c-warning: var(--warning, #F2B84B);
}
.a77 *, .a77 *::before, .a77 *::after { box-sizing: border-box; }

.a77-card {
  padding: 1.25rem;
  background: var(--c-surface);
  border: 1px solid var(--c-line);
  border-radius: 14px;
}
@media (min-width: 640px) { .a77-card { padding: 1.75rem; } }

.a77-head {
  margin-block-end: 1.5rem;
  padding-block-end: 1.25rem;
  border-block-end: 1px solid var(--c-line);
}
.a77-badge {
  display: inline-block;
  margin: 0 0 0.7rem;
  padding: 0.2rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 700;
  border: 1px solid var(--c-ink);
  border-radius: 999px;
}
.a77-title { margin: 0; font-size: 1.5rem; font-weight: 800; line-height: 1.4; }
@media (min-width: 640px) { .a77-title { font-size: 1.75rem; } }
.a77-sub { margin: 0.5rem 0 0; max-width: 60ch; font-size: 0.9rem; line-height: 1.8; color: var(--c-ink-soft); }

.a77-cols { display: grid; gap: 1.5rem; }
@media (min-width: 860px) { .a77-cols { grid-template-columns: 1fr 1fr; align-items: start; } }
.a77-stack { display: grid; gap: 1.25rem; min-width: 0; }
.a77-stack-sm { display: grid; gap: 0.9rem; }

.a77-fs { border: 0; margin: 0; padding: 0; min-width: 0; }
.a77-fs.a77-box { padding: 1rem; }
.a77-box { padding: 1rem; border: 1px solid var(--c-line); border-radius: 12px; }

.a77-label { padding: 0; margin-block-end: 0.45rem; display: block; font-size: 0.85rem; font-weight: 700; }
.a77-label--sm { font-size: 0.8rem; font-weight: 600; color: var(--c-ink-soft); margin-block-end: 0.3rem; }
.a77-field { display: grid; min-width: 0; }
.a77-hint, .a77-note { margin: 0.45rem 0 0; font-size: 0.8rem; line-height: 1.7; color: var(--c-ink-soft); }
.a77-note { padding-inline-start: 0.7rem; border-inline-start: 2px solid var(--c-line); }

.a77-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

/* Selectable options */
.a77-seg { display: grid; gap: 0.5rem; }
.a77-seg--2 { grid-template-columns: 1fr 1fr; }
.a77-opt {
  display: grid;
  gap: 0.15rem;
  min-height: 52px;
  padding: 0.6rem 0.75rem;
  text-align: start;
  font: inherit;
  color: var(--c-ink);
  background: var(--c-surface);
  border: 2px solid var(--c-line);
  border-radius: 10px;
  cursor: pointer;
  transition: background-color .15s, border-color .15s, color .15s;
}
.a77-opt strong { font-size: 0.9rem; font-weight: 700; }
.a77-opt span { font-size: 0.78rem; color: var(--c-ink-soft); }
.a77-opt:hover { border-color: var(--c-ink); }
.a77-opt[aria-checked="true"] { color: var(--c-on-ink); background: var(--c-ink); border-color: var(--c-ink); }
.a77-opt[aria-checked="true"] span { color: inherit; opacity: 0.85; }

/* Inputs */
.a77-input {
  width: 100%;
  min-height: 44px;
  padding: 0.5rem 0.75rem;
  font: inherit;
  font-size: 0.95rem;
  color: var(--c-ink);
  background: var(--c-surface);
  border: 2px solid var(--c-line);
  border-radius: 10px;
}
.a77-input:hover { border-color: var(--c-ink-soft); }
.a77-num { direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; }
input.a77-num { text-align: center; }

.a77-total {
  display: flex; justify-content: space-between; gap: 1rem;
  margin: 0.9rem 0 0; padding-block-start: 0.75rem;
  border-block-start: 1px solid var(--c-line);
  font-size: 0.9rem; font-weight: 700;
}

/* Result: the one orange moment (background only, text stays ink) */
.a77-result { padding: 1.25rem; background: var(--c-signal); color: var(--c-on-signal); border-radius: 12px; }
.a77-result-top { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; margin: 0; font-size: 0.85rem; font-weight: 700; }
.a77-tag { padding: 0.15rem 0.65rem; font-size: 0.8rem; font-weight: 800; border: 2px solid var(--c-on-signal); border-radius: 999px; }
.a77-result-label { margin: 1rem 0 0; font-size: 0.9rem; font-weight: 700; }
.a77-result-value { margin: 0.3rem 0 0; display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap; font-size: 2.4rem; font-weight: 800; line-height: 1.2; }
.a77-result-cur { font-size: 1.1rem; font-weight: 700; }
.a77-result-note { margin: 0.6rem 0 0; font-size: 0.82rem; line-height: 1.7; }

/* Breakdown */
.a77-h2 { margin: 0 0 0.5rem; font-size: 0.95rem; font-weight: 800; }
.a77-rows { margin: 0; }
.a77-row { display: flex; justify-content: space-between; gap: 1rem; padding-block: 0.6rem; border-block-start: 1px solid var(--c-line); font-size: 0.88rem; }
.a77-row--stack { display: grid; gap: 0.25rem; }
.a77-row dt { color: var(--c-ink-soft); }
.a77-row dd { margin: 0; font-weight: 700; }
.a77-row dd.a77-formula { font-weight: 500; font-size: 0.82rem; line-height: 1.7; }
.a77-warn {
  margin: 0.5rem 0 0; padding: 0.7rem 0.8rem;
  font-size: 0.82rem; line-height: 1.8;
  color: var(--c-warning);
  border: 2px dashed var(--c-warning);
  border-radius: 10px;
}
.a77-rule { margin: 0.75rem 0 0; font-size: 0.82rem; line-height: 1.8; color: var(--c-ink-soft); }

/* Buttons */
.a77-actions { display: grid; gap: 0.5rem; }
.a77-btn {
  min-height: 44px; padding: 0.5rem 0.9rem;
  font: inherit; font-size: 0.9rem; font-weight: 700;
  color: var(--c-ink); background: var(--c-surface);
  border: 2px solid var(--c-ink); border-radius: 10px; cursor: pointer;
  transition: background-color .15s, color .15s;
}
.a77-btn:hover { background: var(--c-ink); color: var(--c-on-ink); }
.a77-btn--ink { color: var(--c-on-ink); background: var(--c-ink); }
.a77-btn--ink:hover { background: var(--c-signal); color: var(--c-on-signal); border-color: var(--c-ink); }

.a77-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* Focus, motion, print */
.a77 button:focus-visible, .a77 input:focus-visible, .a77 select:focus-visible {
  outline: 3px solid var(--c-signal);
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) { .a77 * { transition: none !important; } }
@media print { .a77-noprint { display: none !important; } }
`;