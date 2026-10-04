"use client";

import { useState, useMemo, useId } from "react";

// ─── Data (unchanged) ────────────────────────────────────────────────────────
const COUNTRIES = [
  {
    id: "sa",
    name: "السعودية",
    flag: "🇸🇦",
    currency: "SAR",
    standardDays: 21,
    seniorDays: 30, // after 5 years
    seniorThresholdYears: 5,
    wageBasis: "الأجر الفعلي (الأساسي + البدلات)",
    lawNote: "نظام العمل السعودي (م/109 و111): 21 يوماً للسنوات الخمس الأولى و30 يوماً لمن أمضى 5 سنوات",
  },
  {
    id: "ae",
    name: "الإمارات",
    flag: "🇦🇪",
    currency: "AED",
    standardDays: 30,
    seniorDays: 30,
    seniorThresholdYears: 0,
    wageBasis: "الراتب الأساسي فقط لبدل الرصيد",
    lawNote: "قانون العمل الإماراتي (م/29): 30 يوماً تقويمياً عن كل سنة خدمة كاملة",
  },
  {
    id: "kw",
    name: "الكويت",
    flag: "🇰🇼",
    currency: "KWD",
    standardDays: 30,
    seniorDays: 30,
    seniorThresholdYears: 0,
    wageBasis: "الأجر على أساس 26 يوماً",
    lawNote: "قانون العمل الكويتي (م/70): 30 يوم عمل مدفوعة الأجر عن كل سنة",
  },
  {
    id: "eg",
    name: "مصر",
    flag: "🇪🇬",
    currency: "EGP",
    standardDays: 21,
    seniorDays: 30, // لمن أمضى 10 سنوات أو تجاوز سن الخمسين
    seniorThresholdYears: 10,
    wageBasis: "الأجر الشامل",
    lawNote: "قانون العمل المصري (م/47): 21 يوماً وتزاد إلى 30 يوماً لمن أمضى 10 سنوات أو بلغ سن الخمسين",
  },
];

function toNum(v) {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

// Western digits (9,000.00). For Arabic-Hindi digits change "en-US" to "ar-EG".
const fmt = (n) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Component ───────────────────────────────────────────────────────────────
export default function AnnualLeaveCalculator() {
  const uid = useId();
  const [countryId, setCountryId] = useState("sa");
  const [salary, setSalary] = useState("9000");
  const [yearsOfService, setYearsOfService] = useState("6");
  const [unusedDays, setUnusedDays] = useState("15");

  const country = COUNTRIES.find((c) => c.id === countryId) || COUNTRIES[0];

  const results = useMemo(() => {
    const s = toNum(salary);
    const y = toNum(yearsOfService);
    const uDays = toNum(unusedDays);

    const annualEntitlement =
      country.seniorThresholdYears > 0 && y >= country.seniorThresholdYears
        ? country.seniorDays
        : country.standardDays;

    const daysInMonth = country.id === "kw" ? 26 : 30;
    const dailyWage = s > 0 ? s / daysInMonth : 0;
    const fullAnnualLeavePay = dailyWage * annualEntitlement;
    const unusedBalanceCompensation = dailyWage * uDays;

    return {
      annualEntitlement,
      dailyWage,
      fullAnnualLeavePay,
      unusedBalanceCompensation,
      daysInMonth,
    };
  }, [salary, yearsOfService, unusedDays, country]);

  return (
    <div className="alc">
      <style>{CSS}</style>

      {/* Header */}
      <header className="alc-head">
        <h1 className="alc-title">حاسبة بدل الإجازات السنوية</h1>
        <p className="alc-sub">
          احسب أجر الإجازة السنوية والتعويض النقدي عن رصيد الإجازات غير المستنفدة.
        </p>
      </header>

      <div className="alc-card">
        {/* Country */}
        <fieldset className="alc-field alc-fieldset">
          <legend className="alc-label">دولة العمل</legend>
          <div className="alc-seg" role="radiogroup" aria-label="دولة العمل">
            {COUNTRIES.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={countryId === c.id}
                onClick={() => setCountryId(c.id)}
                className="alc-seg-btn"
              >
                <span aria-hidden="true">{c.flag}</span> {c.name}
              </button>
            ))}
          </div>
          <p className="alc-note">{country.lawNote}</p>
        </fieldset>

        {/* Salary */}
        <div className="alc-field">
          <label className="alc-label" htmlFor={`${uid}-salary`}>
            الراتب الشهري المعتمد للحساب
          </label>
          <div className="alc-input-wrap">
            <input
              id={`${uid}-salary`}
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="مثال: 9000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="alc-input alc-num alc-has-unit"
            />
            <span className="alc-unit" aria-hidden="true">{country.currency}</span>
          </div>
          <p className="alc-hint">يُعتمد {country.wageBasis}</p>
        </div>

        {/* Years + unused days */}
        <div className="alc-grid2">
          <div className="alc-field">
            <label className="alc-label" htmlFor={`${uid}-years`}>
              سنوات الخدمة
            </label>
            <input
              id={`${uid}-years`}
              type="number"
              inputMode="decimal"
              min="0"
              value={yearsOfService}
              onChange={(e) => setYearsOfService(e.target.value)}
              className="alc-input alc-num"
            />
          </div>
          <div className="alc-field">
            <label className="alc-label" htmlFor={`${uid}-days`}>
              رصيد الإجازة المتبقي (أيام)
            </label>
            <input
              id={`${uid}-days`}
              type="number"
              inputMode="decimal"
              min="0"
              value={unusedDays}
              onChange={(e) => setUnusedDays(e.target.value)}
              className="alc-input alc-num"
            />
          </div>
        </div>

        {/* Result: the one orange moment */}
        <section className="alc-result" aria-live="polite" aria-label="النتيجة">
          <p className="alc-result-label">التعويض النقدي عن الرصيد المتبقي</p>
          <p className="alc-result-value">
            <span className="alc-num">{fmt(results.unusedBalanceCompensation)}</span>
            <span className="alc-result-cur">{country.currency}</span>
          </p>
        </section>

        {/* Breakdown */}
        <dl className="alc-rows">
          <div className="alc-row">
            <dt>استحقاق الإجازة السنوي</dt>
            <dd>{results.annualEntitlement} يوماً</dd>
          </div>
          <div className="alc-row">
            <dt>أجر اليوم الواحد (الراتب ÷ {results.daysInMonth})</dt>
            <dd>
              <span className="alc-num">{fmt(results.dailyWage)}</span> {country.currency}
            </dd>
          </div>
          <div className="alc-row">
            <dt>أجر الإجازة السنوية الكاملة</dt>
            <dd>
              <span className="alc-num">{fmt(results.fullAnnualLeavePay)}</span> {country.currency}
            </dd>
          </div>
        </dl>

        <p className="alc-legal">
          وفقاً للأنظمة العمالية، يُسدد أجر الإجازة السنوية مقدماً قبل تمتع العامل بها، ويحق للعامل الحصول على تعويض نقدي كامل عن كافة أيام الإجازات التي لم يستنفدها عند ترك العمل.
        </p>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
// All colours come from the variables on .alc. If your tokens.css already
// defines these, delete the fallback values and map the names in one place.
const CSS = `
.alc {
  --c-bg: var(--bg, #F5F5F2);
  --c-surface: var(--surface, #FFFFFF);
  --c-ink: var(--ink, #0D0D0D);
  --c-ink-soft: var(--ink-soft, #4A4A46);
  --c-line: var(--line, #D9D9D3);
  --c-signal: var(--signal, #FF6A1A);
  --c-on-ink: var(--on-ink, #FFFFFF);
  --c-on-signal: var(--on-signal, #0D0D0D);

  max-width: 32rem;
  margin-inline: auto;
  color: var(--c-ink);
  font-family: inherit;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .alc {
    --c-bg: var(--bg, #0D0D0D);
    --c-surface: var(--surface, #181816);
    --c-ink: var(--ink, #F5F5F2);
    --c-ink-soft: var(--ink-soft, #B4B4AD);
    --c-line: var(--line, #34342F);
    --c-on-ink: var(--on-ink, #0D0D0D);
  }
}
:root[data-theme="dark"] .alc {
  --c-bg: var(--bg, #0D0D0D);
  --c-surface: var(--surface, #181816);
  --c-ink: var(--ink, #F5F5F2);
  --c-ink-soft: var(--ink-soft, #B4B4AD);
  --c-line: var(--line, #34342F);
  --c-on-ink: var(--on-ink, #0D0D0D);
}

.alc *, .alc *::before, .alc *::after { box-sizing: border-box; }

.alc-head { margin-block-end: 1.25rem; padding-inline-start: 0.9rem; border-inline-start: 4px solid var(--c-ink); }
.alc-title { margin: 0; font-size: 1.6rem; font-weight: 800; line-height: 1.3; }
.alc-sub { margin: 0.4rem 0 0; font-size: 0.9rem; line-height: 1.7; color: var(--c-ink-soft); }

.alc-card {
  display: grid;
  gap: 1.25rem;
  padding: 1.25rem;
  background: var(--c-surface);
  border: 1px solid var(--c-line);
  border-radius: 14px;
}
@media (min-width: 640px) { .alc-card { padding: 1.75rem; } }

.alc-field { display: grid; gap: 0.4rem; min-width: 0; }
.alc-fieldset { border: 0; padding: 0; margin: 0; }
.alc-label { padding: 0; font-size: 0.85rem; font-weight: 700; color: var(--c-ink); }
.alc-hint { margin: 0; font-size: 0.8rem; color: var(--c-ink-soft); }
.alc-note {
  margin: 0.25rem 0 0;
  padding-inline-start: 0.7rem;
  border-inline-start: 2px solid var(--c-line);
  font-size: 0.8rem;
  line-height: 1.7;
  color: var(--c-ink-soft);
}

/* Country selector */
.alc-seg { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
@media (min-width: 480px) { .alc-seg { grid-template-columns: repeat(4, 1fr); } }
.alc-seg-btn {
  min-height: 44px;
  padding: 0.5rem 0.6rem;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--c-ink);
  background: var(--c-surface);
  border: 2px solid var(--c-line);
  border-radius: 10px;
  cursor: pointer;
  transition: background-color .15s, border-color .15s, color .15s;
}
.alc-seg-btn:hover { border-color: var(--c-ink); }
.alc-seg-btn[aria-checked="true"] {
  color: var(--c-on-ink);
  background: var(--c-ink);
  border-color: var(--c-ink);
}

/* Inputs */
.alc-input {
  width: 100%;
  min-height: 46px;
  padding: 0.55rem 0.8rem;
  font: inherit;
  font-size: 1rem;
  color: var(--c-ink);
  background: var(--c-surface);
  border: 2px solid var(--c-line);
  border-radius: 10px;
}
.alc-input:hover { border-color: var(--c-ink-soft); }
.alc-num { direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; }
input.alc-num { text-align: center; }
.alc-input-wrap { position: relative; }
.alc-has-unit { padding-inline-start: 3.6rem; }
.alc-unit {
  position: absolute;
  inset-inline-start: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--c-ink-soft);
  pointer-events: none;
}
.alc-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

/* Result: orange is a background only, text stays ink */
.alc-result {
  padding: 1.1rem 1.25rem;
  background: var(--c-signal);
  color: var(--c-on-signal);
  border-radius: 12px;
}
.alc-result-label { margin: 0; font-size: 0.9rem; font-weight: 700; }
.alc-result-value {
  margin: 0.3rem 0 0;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1.2;
}
.alc-result-cur { font-size: 1rem; font-weight: 700; }

/* Breakdown */
.alc-rows { margin: 0; border-block-start: 1px solid var(--c-line); }
.alc-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.7rem;
  border-block-end: 1px solid var(--c-line);
  font-size: 0.9rem;
}
.alc-row dt { color: var(--c-ink-soft); }
.alc-row dd { margin: 0; font-weight: 700; white-space: nowrap; }

.alc-legal { margin: 0; font-size: 0.78rem; line-height: 1.8; color: var(--c-ink-soft); }

/* Focus + motion */
.alc button:focus-visible,
.alc input:focus-visible {
  outline: 3px solid var(--c-signal);
  outline-offset: 2px;
  border-color: var(--c-ink);
}
@media (prefers-reduced-motion: reduce) {
  .alc * { transition: none !important; }
}
`;