"use client";

/**
 * components/AnnualLeaveCalculator.jsx
 * Qemlo style: annual leave pay calculator.
 * COUNTRIES data, toNum, fmt, state and the useMemo calculation are unchanged.
 * Changes: local styling (glossy orange tiles, 26px cards, 16px controls),
 * flag emoji replaced by country-code chips, SVG icons, mobile sticky result
 * bar, copy button, accessibility and print styles.
 */

import { useState, useMemo, useId, useRef, useEffect } from "react";

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

// Short code shown instead of the flag emoji (display only).
const CODES = { sa: "SA", ae: "AE", kw: "KW", eg: "EG" };

function toNum(v) {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

// Western digits (9,000.00). For Arabic-Hindi digits change "en-US" to "ar-EG".
const fmt = (n) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Whole numbers lose ".00" on screen only.
const fmtShort = (n) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });

// ─── Icons ───────────────────────────────────────────────────────────────────
const ICONS = {
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v1" />
      <rect x="3.5" y="7.5" width="17" height="12" rx="3" />
      <path d="M16 13.5h1.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.6 3.7 5.4 3.7 8.5s-1.2 5.9-3.7 8.5c-2.5-2.6-3.7-5.4-3.7-8.5S9.5 6.1 12 3.5Z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  down: <path d="m6 9.5 6 6 6-6" />,
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  );
}

function SectionHead({ icon, title, hint }) {
  return (
    <div className="alc-sec-head">
      <span className="alc-tile">
        <Icon name={icon} size={20} />
      </span>
      <div className="alc-sec-text">
        <h2 className="alc-sec-title">{title}</h2>
        {hint ? <p className="alc-sec-hint">{hint}</p> : null}
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function AnnualLeaveCalculator() {
  const uid = useId();
  const resultRef = useRef(null);
  const copyTimer = useRef(null);
  const [copied, setCopied] = useState(false);
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

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const salaryNum = toNum(salary);

  const reportText = [
    "حاسبة بدل الإجازات السنوية",
    `الدولة: ${country.name}`,
    `الراتب المعتمد: ${fmt(salaryNum)} ${country.currency}`,
    `سنوات الخدمة: ${toNum(yearsOfService)}`,
    `رصيد الإجازة المتبقي: ${toNum(unusedDays)} يوماً`,
    `استحقاق الإجازة السنوي: ${results.annualEntitlement} يوماً`,
    `أجر اليوم الواحد: ${fmt(results.dailyWage)} ${country.currency}`,
    `أجر الإجازة السنوية الكاملة: ${fmt(results.fullAnnualLeavePay)} ${country.currency}`,
    `التعويض النقدي عن الرصيد المتبقي: ${fmt(results.unusedBalanceCompensation)} ${country.currency}`,
  ].join("\n");

  const handleCopy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(reportText);
      ok = true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = reportText;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToResult = () => {
    const el = resultRef.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const noWheel = (e) => e.currentTarget.blur();

  const daysLabel = (c) =>
    c.standardDays === c.seniorDays
      ? `${c.standardDays} يوماً`
      : `${c.standardDays}–${c.seniorDays} يوماً`;

  return (
    <div className="alc">
      <style>{CSS}</style>

      {/* Header */}
      <header className="alc-head">
        <span className="alc-tile alc-tile-lg">
          <Icon name="calendar" size={26} />
        </span>
        <div className="alc-head-text">
          <h1 className="alc-title">حاسبة بدل الإجازات السنوية</h1>
          <p className="alc-sub">
            احسب أجر الإجازة السنوية والتعويض النقدي عن رصيد الإجازات غير المستنفدة.
          </p>
        </div>
      </header>

      <div className="alc-layout">
        {/* Inputs */}
        <div className="alc-col">
          <section className="alc-card" aria-labelledby={`${uid}-h-country`}>
            <fieldset className="alc-fieldset">
              <legend className="alc-legend" id={`${uid}-h-country`}>
                <SectionHead
                  icon="globe"
                  title="دولة العمل"
                  hint="تحدد الدولة الاستحقاق السنوي وأساس احتساب الأجر."
                />
              </legend>
              <div className="alc-countries" role="radiogroup" aria-labelledby={`${uid}-h-country`}>
                {COUNTRIES.map((c) => {
                  const on = countryId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setCountryId(c.id)}
                      className="alc-country"
                    >
                      <span className="alc-code" aria-hidden="true">{CODES[c.id]}</span>
                      <span className="alc-country-name">{c.name}</span>
                      <span className="alc-country-days">{daysLabel(c)}</span>
                      {on ? (
                        <span className="alc-tick" aria-hidden="true">
                          <Icon name="check" size={14} />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <p className="alc-note">
                <span className="alc-note-ic"><Icon name="info" size={16} /></span>
                <span>{country.lawNote}</span>
              </p>
            </fieldset>
          </section>

          <section className="alc-card" aria-labelledby={`${uid}-h-inputs`}>
            <SectionHead
              icon="wallet"
              title="بيانات الحساب"
              hint={`يُعتمد ${country.wageBasis}`}
            />
            <div className="alc-fields">
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
                    onWheel={noWheel}
                    className="alc-input alc-num alc-has-unit"
                  />
                  <span className="alc-unit" aria-hidden="true">{country.currency}</span>
                </div>
                {salaryNum >= 10000 ? (
                  <p className="alc-preview alc-num" aria-live="polite">
                    {fmtShort(salaryNum)} {country.currency}
                  </p>
                ) : null}
              </div>

              <div className="alc-grid2">
                <div className="alc-field">
                  <label className="alc-label" htmlFor={`${uid}-years`}>
                    سنوات الخدمة
                  </label>
                  <div className="alc-input-wrap">
                    <input
                      id={`${uid}-years`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={yearsOfService}
                      onChange={(e) => setYearsOfService(e.target.value)}
                      onWheel={noWheel}
                      className="alc-input alc-num alc-has-unit"
                    />
                    <span className="alc-unit" aria-hidden="true">سنة</span>
                  </div>
                </div>
                <div className="alc-field">
                  <label className="alc-label" htmlFor={`${uid}-days`}>
                    رصيد الإجازة المتبقي
                  </label>
                  <div className="alc-input-wrap">
                    <input
                      id={`${uid}-days`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={unusedDays}
                      onChange={(e) => setUnusedDays(e.target.value)}
                      onWheel={noWheel}
                      className="alc-input alc-num alc-has-unit"
                    />
                    <span className="alc-unit" aria-hidden="true">يوم</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <p className="alc-legal">
            وفقاً للأنظمة العمالية، يُسدد أجر الإجازة السنوية مقدماً قبل تمتع العامل بها، ويحق للعامل الحصول على تعويض نقدي كامل عن كافة أيام الإجازات التي لم يستنفدها عند ترك العمل.
          </p>
        </div>

        {/* Result */}
        <aside className="alc-side" ref={resultRef} id={`${uid}-result`}>
          <section className="alc-result" aria-live="polite" aria-label="النتيجة">
            <div className="alc-result-top">
              <span className="alc-tile alc-tile-ink">
                <Icon name="clock" size={20} />
              </span>
              <p className="alc-result-label">التعويض النقدي عن الرصيد المتبقي</p>
            </div>
            <p className="alc-result-value">
              <span className="alc-num alc-result-num">{fmtShort(results.unusedBalanceCompensation)}</span>
              <span className="alc-result-cur">{country.currency}</span>
            </p>
            <p className="alc-result-meta">
              <span className="alc-num">{toNum(unusedDays)}</span> يوماً × أجر اليوم{" "}
              <span className="alc-num">{fmtShort(results.dailyWage)}</span>
            </p>

            <dl className="alc-rows">
              <div className="alc-row">
                <dt>استحقاق الإجازة السنوي</dt>
                <dd>
                  <span className="alc-num">{results.annualEntitlement}</span> يوماً
                </dd>
              </div>
              <div className="alc-row">
                <dt>أجر اليوم الواحد (الراتب ÷ <span className="alc-num">{results.daysInMonth}</span>)</dt>
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

            <button type="button" className="alc-copy" onClick={handleCopy}>
              <Icon name={copied ? "check" : "copy"} size={18} />
              <span>{copied ? "تم النسخ" : "نسخ النتيجة"}</span>
            </button>
            <span className="alc-sr" role="status">{copied ? "تم نسخ النتيجة" : ""}</span>
          </section>
        </aside>
      </div>

      {/* Mobile sticky result bar */}
      <div className="alc-bar" role="region" aria-label="ملخص النتيجة">
        <div className="alc-bar-text">
          <span className="alc-bar-label">التعويض عن الرصيد</span>
          <span className="alc-bar-value">
            <span className="alc-num">{fmtShort(results.unusedBalanceCompensation)}</span>{" "}
            <span className="alc-bar-cur">{country.currency}</span>
          </span>
        </div>
        <button type="button" className="alc-bar-btn" onClick={scrollToResult}>
          <span>التفاصيل</span>
          <Icon name="down" size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
// Colours come from the variables on .alc. Your global tokens (--bg, --surface,
// --ink, --signal ...) win when present; the fallbacks keep it standalone.
const CSS = `
.alc {
  --c-bg: var(--bg, #F5F5F2);
  --c-surface: var(--surface, #FFFFFF);
  --c-ink: var(--ink, #0D0D0D);
  --c-ink-soft: var(--ink-soft, #4A4A46);
  --c-line: var(--line, #D9D9D3);
  --c-signal: var(--signal, var(--orange, #FF6A1A));
  --c-on-ink: var(--on-ink, #FFFFFF);
  --c-on-signal: var(--on-signal, #0D0D0D);
  --c-gloss-1: #FF9B63;
  --c-gloss-2: #FF6A1A;
  --c-gloss-3: #EE5A0B;

  max-width: 68rem;
  margin-inline: auto;
  padding-block-end: 5.5rem;
  color: var(--c-ink);
  font-family: inherit;
}
@media (min-width: 960px) { .alc { padding-block-end: 0; } }
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
.alc-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* Glossy orange tile */
.alc-tile {
  flex: none;
  display: inline-grid;
  place-items: center;
  width: 40px;
  height: 40px;
  color: var(--c-on-signal);
  background: linear-gradient(160deg, var(--c-gloss-1) 0%, var(--c-gloss-2) 55%, var(--c-gloss-3) 100%);
  border-radius: 13px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.55), inset 0 -2px 0 rgba(0,0,0,.12), 0 4px 10px -4px rgba(238,90,11,.55);
}
.alc-tile-lg { width: 54px; height: 54px; border-radius: 17px; }
.alc-tile-ink {
  background: var(--c-ink);
  color: var(--c-on-ink);
  box-shadow: none;
}

/* Header */
.alc-head {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-block-end: 1.25rem;
}
.alc-head-text { min-width: 0; }
.alc-title { margin: 0; font-size: clamp(1.35rem, 4.6vw, 1.9rem); font-weight: 800; line-height: 1.3; }
.alc-sub { margin: 0.3rem 0 0; font-size: 0.92rem; line-height: 1.7; color: var(--c-ink-soft); }

/* Layout */
.alc-layout { display: grid; gap: 1rem; }
.alc-col { display: grid; gap: 1rem; min-width: 0; align-content: start; }
@media (min-width: 960px) {
  .alc-layout { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 1.5rem; align-items: start; }
  .alc-side { position: sticky; top: 1rem; }
}
.alc-side { scroll-margin-top: 1rem; min-width: 0; }

/* Cards */
.alc-card {
  display: grid;
  gap: 1.1rem;
  padding: 1.1rem;
  background: var(--c-surface);
  border: 1px solid var(--c-line);
  border-radius: 26px;
  min-width: 0;
}
@media (min-width: 640px) { .alc-card { padding: 1.5rem; } }

.alc-sec-head { display: flex; align-items: center; gap: 0.75rem; }
.alc-sec-text { min-width: 0; }
.alc-sec-title { margin: 0; font-size: 1.05rem; font-weight: 800; line-height: 1.4; }
.alc-sec-hint { margin: 0.1rem 0 0; font-size: 0.82rem; line-height: 1.6; color: var(--c-ink-soft); }

.alc-fieldset { border: 0; padding: 0; margin: 0; min-width: 0; display: grid; gap: 1.1rem; }
.alc-legend { padding: 0; width: 100%; float: inline-start; }
.alc-legend + * { clear: both; }

/* Country cards */
.alc-countries { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; }
@media (min-width: 640px) { .alc-countries { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.alc-country {
  position: relative;
  display: grid;
  justify-items: start;
  gap: 0.25rem;
  min-height: 48px;
  padding: 0.75rem 0.8rem;
  font: inherit;
  text-align: start;
  color: var(--c-ink);
  background: var(--c-surface);
  border: 2px solid var(--c-line);
  border-radius: 16px;
  cursor: pointer;
  transition: background-color .15s, border-color .15s, color .15s;
}
.alc-country:hover { border-color: var(--c-ink); }
.alc-code {
  display: inline-block;
  padding: 0.1rem 0.45rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--c-on-ink);
  background: var(--c-ink);
  border-radius: 8px;
}
.alc-country-name { font-size: 0.98rem; font-weight: 800; }
.alc-country-days { font-size: 0.78rem; color: var(--c-ink-soft); }
.alc-country[aria-checked="true"] {
  color: var(--c-on-signal);
  background: linear-gradient(160deg, var(--c-gloss-1) 0%, var(--c-gloss-2) 55%, var(--c-gloss-3) 100%);
  border-color: var(--c-ink);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.5);
}
.alc-country[aria-checked="true"] .alc-country-days { color: var(--c-on-signal); }
.alc-country[aria-checked="true"] .alc-code { background: #0D0D0D; color: #FFFFFF; }
.alc-tick {
  position: absolute;
  inset-block-start: 0.55rem;
  inset-inline-end: 0.55rem;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  color: #FFFFFF;
  background: #0D0D0D;
  border-radius: 50%;
}

.alc-note {
  display: flex;
  gap: 0.5rem;
  margin: 0;
  padding: 0.75rem 0.9rem;
  font-size: 0.84rem;
  line-height: 1.75;
  color: var(--c-ink-soft);
  background: var(--c-bg);
  border: 1px solid var(--c-line);
  border-radius: 16px;
}
.alc-note-ic { flex: none; margin-block-start: 0.2rem; color: var(--c-ink); }

/* Inputs */
.alc-fields { display: grid; gap: 1rem; }
.alc-field { display: grid; gap: 0.4rem; min-width: 0; }
.alc-label { font-size: 0.88rem; font-weight: 700; color: var(--c-ink); }
.alc-input {
  width: 100%;
  min-height: 52px;
  padding: 0.6rem 0.9rem;
  font: inherit;
  font-size: 18px;
  font-weight: 700;
  color: var(--c-ink);
  background: var(--c-surface);
  border: 2px solid var(--c-line);
  border-radius: 16px;
}
.alc-input:hover { border-color: var(--c-ink-soft); }
.alc-num { direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; }
input.alc-num { text-align: start; }
html[dir="rtl"] input.alc-num, .alc input.alc-num { text-align: center; }
.alc-input-wrap { position: relative; }
.alc-has-unit { padding-left: 3.9rem; padding-right: 0.9rem; }
.alc-unit {
  position: absolute;
  left: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.2rem 0.5rem;
  font-size: 0.76rem;
  font-weight: 800;
  color: var(--c-ink);
  background: var(--c-bg);
  border: 1px solid var(--c-line);
  border-radius: 9px;
  pointer-events: none;
}
.alc-preview { margin: 0; font-size: 0.82rem; font-weight: 700; color: var(--c-ink-soft); text-align: end; }
.alc-grid2 { display: grid; grid-template-columns: 1fr; gap: 1rem; }
@media (min-width: 420px) { .alc-grid2 { grid-template-columns: 1fr 1fr; } }

.alc-legal { margin: 0; padding-inline: 0.4rem; font-size: 0.8rem; line-height: 1.9; color: var(--c-ink-soft); }

/* Result panel: orange is the background, text stays ink */
.alc-result {
  display: grid;
  gap: 0.9rem;
  padding: 1.25rem;
  color: var(--c-on-signal);
  background: linear-gradient(160deg, var(--c-gloss-1) 0%, var(--c-gloss-2) 45%, var(--c-gloss-3) 100%);
  border-radius: 26px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.55), inset 0 -3px 0 rgba(0,0,0,.1);
  overflow-wrap: anywhere;
}
@media (min-width: 640px) { .alc-result { padding: 1.6rem; } }
.alc-result-top { display: flex; align-items: center; gap: 0.7rem; }
.alc-result-label { margin: 0; font-size: 0.95rem; font-weight: 800; line-height: 1.5; }
.alc-result-value {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
  line-height: 1.15;
}
.alc-result-num { font-size: clamp(2.2rem, 9vw, 3rem); font-weight: 800; }
.alc-result-cur { font-size: 1.05rem; font-weight: 800; }
.alc-result-meta { margin: 0; font-size: 0.86rem; font-weight: 600; opacity: 0.85; }

.alc-rows {
  margin: 0;
  padding: 0.25rem 1rem;
  background: rgba(255,255,255,.28);
  border: 1px solid rgba(13,13,13,.18);
  border-radius: 18px;
}
.alc-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  padding-block: 0.7rem;
  font-size: 0.88rem;
}
.alc-row + .alc-row { border-block-start: 1px solid rgba(13,13,13,.18); }
.alc-row dt { min-width: 0; font-weight: 600; }
.alc-row dd { margin: 0; font-weight: 800; text-align: end; }
@media (max-width: 380px) {
  .alc-row { flex-direction: column; gap: 0.15rem; }
  .alc-row dd { text-align: start; }
}

.alc-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  padding: 0.6rem 1rem;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--c-on-ink);
  background: var(--c-ink);
  border: 2px solid var(--c-ink);
  border-radius: 16px;
  cursor: pointer;
}
.alc-copy:hover { opacity: 0.9; }

/* Mobile sticky bar */
.alc-bar {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.65rem 1rem calc(0.65rem + env(safe-area-inset-bottom, 0px));
  background: var(--c-surface);
  border-block-start: 1px solid var(--c-line);
  box-shadow: 0 -8px 24px -12px rgba(0,0,0,.25);
}
@media (min-width: 960px) { .alc-bar { display: none; } }
.alc-bar-text { display: grid; min-width: 0; }
.alc-bar-label { font-size: 0.76rem; font-weight: 600; color: var(--c-ink-soft); }
.alc-bar-value { font-size: 1.25rem; font-weight: 800; line-height: 1.3; overflow-wrap: anywhere; }
.alc-bar-cur { font-size: 0.8rem; font-weight: 800; }
.alc-bar-btn {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 48px;
  padding: 0.5rem 1.1rem;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--c-on-signal);
  background: linear-gradient(160deg, var(--c-gloss-1) 0%, var(--c-gloss-2) 55%, var(--c-gloss-3) 100%);
  border: 2px solid var(--c-ink);
  border-radius: 16px;
  cursor: pointer;
}

/* Focus + motion */
.alc button:focus-visible,
.alc input:focus-visible {
  outline: 3px solid var(--c-ink);
  outline-offset: 2px;
}
.alc .alc-result button:focus-visible { outline-color: var(--c-on-ink); box-shadow: 0 0 0 5px #0D0D0D; }
.alc input:focus-visible { border-color: var(--c-ink); }
@media (prefers-reduced-motion: reduce) {
  .alc * { transition: none !important; scroll-behavior: auto !important; }
}

/* Print: result and breakdown only */
@media print {
  .alc-bar, .alc-copy, .alc-col { display: none !important; }
  .alc-layout { display: block; }
  .alc-side { position: static; }
  .alc-result { color: #000; background: #fff; border: 1px solid #000; box-shadow: none; }
  .alc-rows { background: #fff; border-color: #000; }
}
`;