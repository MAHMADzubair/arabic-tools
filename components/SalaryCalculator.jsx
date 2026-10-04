"use client";

/**
 * components/SalaryCalculator.jsx
 * Ink & Signal: net salary calculator.
 * Tax/social logic (calcTax, calcSocial, useMemo) is unchanged, except:
 * inputs are clamped to >= 0, and the unused `showPayslip` state is removed.
 */
import { useState, useMemo } from "react";

/* ─── Country Tax Configs (data unchanged, flags removed) ───────────────── */
const COUNTRIES = [
  {
    id: "sa", code: "SA", name: "السعودية", currency: "SAR", symbol: "ر.س",
    taxName: "ضريبة الدخل", socialName: "التأمينات الاجتماعية (جوسي)",
    hasTax: false, socialRate: 0.10, socialCap: 45000,
    allowances: { housing: 0.25, transport: 800, food: 500 },
    note: "لا توجد ضريبة دخل على الرواتب في السعودية"
  },
  {
    id: "ae", code: "AE", name: "الإمارات", currency: "AED", symbol: "د.إ",
    taxName: "ضريبة الدخل", socialName: "الضمان الاجتماعي",
    hasTax: false, socialRate: 0, socialCap: 0,
    allowances: { housing: 0.25, transport: 600, food: 400 },
    note: "لا توجد ضريبة دخل على الرواتب في الإمارات"
  },
  {
    id: "eg", code: "EG", name: "مصر", currency: "EGP", symbol: "ج.م",
    taxName: "ضريبة الدخل", socialName: "التأمين الاجتماعي",
    hasTax: true, socialRate: 0.11, socialCap: 12000,
    allowances: { housing: 0.20, transport: 500, food: 300 },
    brackets: [
      { limit: 15000/12, rate: 0 },
      { limit: 30000/12, rate: 0.025 },
      { limit: 45000/12, rate: 0.10 },
      { limit: 60000/12, rate: 0.15 },
      { limit: 200000/12, rate: 0.20 },
      { limit: 400000/12, rate: 0.225 },
      { limit: Infinity, rate: 0.25 },
    ],
    note: "شرائح ضريبية تصاعدية على الراتب الشهري"
  },
  {
    id: "pk", code: "PK", name: "باكستان", currency: "PKR", symbol: "₨",
    taxName: "ضريبة الدخل", socialName: "EOBI",
    hasTax: true, socialRate: 0, socialFixed: 370, socialCap: 0,
    allowances: { housing: 0.45, transport: 0.10, food: 0 },
    brackets: [
      { limit: 50000, rate: 0 },
      { limit: 100000, rate: 0.05 },
      { limit: 183333, rate: 0.125 },
      { limit: 266667, rate: 0.225 },
      { limit: 341667, rate: 0.275 },
      { limit: Infinity, rate: 0.35 },
    ],
    note: "شرائح ضريبية 2024-25 (سنوي / 12)"
  },
  {
    id: "gb", code: "GB", name: "المملكة المتحدة", currency: "GBP", symbol: "£",
    taxName: "ضريبة الدخل", socialName: "التأمين الوطني (NI)",
    hasTax: true, socialRate: 0.08, socialCap: 50270/12,
    allowances: { housing: 0, transport: 0, food: 0 },
    personalAllowance: 12570/12,
    brackets: [
      { limit: 12570/12, rate: 0 },
      { limit: 50270/12, rate: 0.20 },
      { limit: 125140/12, rate: 0.40 },
      { limit: Infinity, rate: 0.45 },
    ],
    note: "يشمل NI عند الدخل فوق £12,570 سنوياً"
  },
  {
    id: "us", code: "US", name: "الولايات المتحدة", currency: "USD", symbol: "$",
    taxName: "ضريبة الدخل الفيدرالية", socialName: "الضمان الاجتماعي + Medicare",
    hasTax: true, socialRate: 0.0765, socialCap: 168600/12,
    allowances: { housing: 0, transport: 0, food: 0 },
    standardDeduction: 14600/12,
    brackets: [
      { limit: 11600/12, rate: 0.10 },
      { limit: 47150/12, rate: 0.12 },
      { limit: 100525/12, rate: 0.22 },
      { limit: 191950/12, rate: 0.24 },
      { limit: 243725/12, rate: 0.32 },
      { limit: 609350/12, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ],
    note: "Federal + SS 6.2% + Medicare 1.45% (2024)"
  },
];

/* ─── Tax Calculation (unchanged) ───────────────────────────────────────── */
function calcTax(gross, country) {
  if (!country.hasTax || !country.brackets) return 0;
  let taxable = gross;
  if (country.personalAllowance) taxable = Math.max(0, gross - country.personalAllowance);
  if (country.standardDeduction) taxable = Math.max(0, gross - country.standardDeduction);

  let tax = 0;
  let prev = 0;
  for (const bracket of country.brackets) {
    if (taxable <= prev) break;
    const inBracket = Math.min(taxable, bracket.limit) - prev;
    tax += inBracket * bracket.rate;
    prev = bracket.limit;
    if (bracket.limit === Infinity) break;
  }
  return Math.max(0, tax);
}

function calcSocial(gross, country) {
  if (country.socialFixed) return country.socialFixed;
  if (!country.socialRate) return 0;
  const base = country.socialCap ? Math.min(gross, country.socialCap) : gross;
  return base * country.socialRate;
}

const nn = (v) => Math.max(0, Number(v) || 0);

/** Keeps signs / digits / % in a stable left-to-right order inside RTL text. */
function Num({ children }) {
  return <span className="sc-ltr">{children}</span>;
}

function Field({ id, label, hint, value, onChange, sym, placeholder = "0", big = false }) {
  return (
    <div className="sc-field">
      <label htmlFor={id} className="sc-label">
        <span>{label}</span>
        {hint && <span className="sc-hint">{hint}</span>}
      </label>
      <div className="sc-input-wrap">
        <span className="sc-sym" aria-hidden="true">{sym}</span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`sc-input ${big ? "sc-input-big" : ""}`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function SalaryCalculator({
  initialCountry = "sa",
  pageTitle = null,
  pageDesc = null,
  pageBadge = null,
}) {
  const [countryId, setCountryId] = useState(initialCountry);
  const [grossSalary, setGrossSalary] = useState(10000);
  const [housingAllowance, setHousingAllowance] = useState(0);
  const [transportAllowance, setTransportAllowance] = useState(0);
  const [foodAllowance, setFoodAllowance] = useState(0);
  const [otherAllowances, setOtherAllowances] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);
  const [period, setPeriod] = useState("monthly"); // monthly | annual

  const country = COUNTRIES.find((c) => c.id === countryId);

  const handleCountryChange = (id) => {
    const c = COUNTRIES.find((x) => x.id === id);
    if (!c) return;
    setCountryId(id);
    if (c.allowances.housing < 1) {
      setHousingAllowance(Math.round(grossSalary * c.allowances.housing));
    } else {
      setHousingAllowance(0);
    }
    setTransportAllowance(
      c.allowances.transport < 1
        ? Math.round(grossSalary * c.allowances.transport)
        : c.allowances.transport || 0
    );
    setFoodAllowance(c.allowances.food || 0);
  };

  const result = useMemo(() => {
    if (!country || !grossSalary) return null;
    const gross = nn(grossSalary);
    const housing = nn(housingAllowance);
    const transport = nn(transportAllowance);
    const food = nn(foodAllowance);
    const other = nn(otherAllowances);
    const totalAllowances = housing + transport + food + other;
    const totalGross = gross + totalAllowances;

    const incomeTax = calcTax(gross, country);
    const socialInsurance = calcSocial(gross, country);
    const extraDeductions = nn(otherDeductions);
    const totalDeductions = incomeTax + socialInsurance + extraDeductions;
    const netPay = totalGross - totalDeductions;
    const effectiveTaxRate = totalGross > 0 ? (totalDeductions / totalGross) * 100 : 0;

    const mult = period === "annual" ? 12 : 1;

    return {
      grossBasic: gross * mult,
      totalAllowances: totalAllowances * mult,
      totalGross: totalGross * mult,
      incomeTax: incomeTax * mult,
      socialInsurance: socialInsurance * mult,
      extraDeductions: extraDeductions * mult,
      totalDeductions: totalDeductions * mult,
      netPay: netPay * mult,
      effectiveTaxRate,
      housing: housing * mult,
      transport: transport * mult,
      food: food * mult,
      other: other * mult,
    };
  }, [country, grossSalary, housingAllowance, transportAllowance, foodAllowance, otherAllowances, otherDeductions, period]);

  const sym = country?.symbol || "";

  function fmt(n) {
    return `${sym} ${Math.round(n).toLocaleString("en-US")}`;
  }

  const deductionItems = result
    ? [
        { label: country?.taxName || "ضريبة الدخل", value: result.incomeTax },
        { label: country?.socialName || "التأمين الاجتماعي", value: result.socialInsurance },
        { label: "خصومات أخرى", value: result.extraDeductions },
      ]
    : [];

  const netPct = result ? Math.min(100, Math.max(0, 100 - result.effectiveTaxRate)) : 0;
  const housingPct = country?.allowances?.housing;
  const housingHint = housingPct > 0 && housingPct < 1 ? `متعارف عليه: ${Math.round(housingPct * 100)}%` : "";

  const allowanceFields = [
    { id: "sc-housing", label: "بدل السكن", value: housingAllowance, setter: setHousingAllowance, hint: housingHint },
    { id: "sc-transport", label: "بدل النقل", value: transportAllowance, setter: setTransportAllowance, hint: "" },
    { id: "sc-food", label: "بدل الطعام", value: foodAllowance, setter: setFoodAllowance, hint: "" },
    { id: "sc-other", label: "بدلات أخرى", value: otherAllowances, setter: setOtherAllowances, hint: "" },
  ];

  const earnings = result
    ? [
        { label: "الراتب الأساسي", value: result.grossBasic },
        result.housing > 0 && { label: "بدل السكن", value: result.housing },
        result.transport > 0 && { label: "بدل النقل", value: result.transport },
        result.food > 0 && { label: "بدل الطعام", value: result.food },
        result.other > 0 && { label: "بدلات أخرى", value: result.other },
      ].filter(Boolean)
    : [];

  return (
    <div className="sc-root" dir="rtl">
      <SalaryStyles />

      {/* Header */}
      <header className="sc-header sc-noprint">
        <p className="sc-kicker-tag">{pageBadge || "حاسبة الراتب الصافي"}</p>
        <h1 className="sc-h1">{pageTitle || "حاسبة الراتب الصافي وصافي الأجر"}</h1>
        <p className="sc-lead">
          {pageDesc || "احسب راتبك الصافي بعد الضرائب والتأمينات الاجتماعية والبدلات لـ 6 دول."}
        </p>
      </header>

      <div className="sc-grid">
        {/* ─── Inputs ─── */}
        <div className="sc-col sc-noprint">
          {/* Country */}
          <section className="sc-card" aria-labelledby="sc-s1">
            <h2 id="sc-s1" className="sc-h2">
              <span className="sc-num" aria-hidden="true">1</span>
              الدولة / نظام الضرائب
            </h2>
            <div className="sc-countries">
              {COUNTRIES.map((c) => {
                const on = countryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => handleCountryChange(c.id)}
                    className="sc-country"
                  >
                    <span className="sc-country-top">
                      <span className="sc-code" aria-hidden="true">{c.code}</span>
                      {on && <span className="sc-check" aria-hidden="true">✓</span>}
                    </span>
                    <span className="sc-country-name">{c.name}</span>
                    <span className="sc-sub">{c.hasTax ? "ضريبة تصاعدية" : "بدون ضريبة دخل"}</span>
                  </button>
                );
              })}
            </div>
            {country?.note && (
              <p className="sc-note-line">
                <span className="sc-tag" aria-hidden="true">i</span>
                <span>{country.note}</span>
              </p>
            )}
          </section>

          {/* Gross + period */}
          <section className="sc-card" aria-labelledby="sc-s2">
            <div className="sc-title-row">
              <h2 id="sc-s2" className="sc-h2">
                <span className="sc-num" aria-hidden="true">2</span>
                الراتب الأساسي
              </h2>
              <div className="sc-seg" role="group" aria-label="فترة العرض">
                <button type="button" aria-pressed={period === "monthly"} onClick={() => setPeriod("monthly")}>شهري</button>
                <button type="button" aria-pressed={period === "annual"} onClick={() => setPeriod("annual")}>سنوي</button>
              </div>
            </div>
            <Field
              id="sc-gross"
              label="الراتب الأساسي الشهري"
              value={grossSalary}
              onChange={setGrossSalary}
              sym={sym}
              placeholder="الراتب الأساسي الشهري"
              big
            />
            <p className="sc-help">
              أدخل الراتب الأساسي الشهري دائماً. خيار «سنوي» يعرض النتائج مضروبة في 12 فقط.
            </p>
          </section>

          {/* Allowances */}
          <section className="sc-card" aria-labelledby="sc-s3">
            <h2 id="sc-s3" className="sc-h2">
              <span className="sc-num" aria-hidden="true">3</span>
              البدلات الشهرية
            </h2>
            <div className="sc-two">
              {allowanceFields.map((f) => (
                <Field key={f.id} id={f.id} label={f.label} hint={f.hint}
                  value={f.value} onChange={f.setter} sym={sym} />
              ))}
            </div>
          </section>

          {/* Extra deductions */}
          <section className="sc-card" aria-labelledby="sc-s4">
            <h2 id="sc-s4" className="sc-h2">
              <span className="sc-num" aria-hidden="true">4</span>
              خصومات إضافية شهرية
            </h2>
            <Field
              id="sc-extra"
              label="قرض، تأمين صحي إضافي..."
              value={otherDeductions}
              onChange={setOtherDeductions}
              sym={sym}
            />
          </section>
        </div>

        {/* ─── Results ─── */}
        <div className="sc-col sc-sticky">
          <section className="sc-result" aria-live="polite" aria-labelledby="sc-res-title">
            <h2 id="sc-res-title" className="sc-result-label">
              صافي الراتب ({period === "monthly" ? "شهرياً" : "سنوياً"})
            </h2>
            <p className="sc-big"><Num>{result ? fmt(result.netPay) : "—"}</Num></p>

            {result && (
              <>
                <div className="sc-stats">
                  <div className="sc-stat">
                    <p>إجمالي الراتب</p>
                    <strong><Num>{fmt(result.totalGross)}</Num></strong>
                  </div>
                  <div className="sc-stat">
                    <p>إجمالي الخصومات</p>
                    <strong><Num>{fmt(result.totalDeductions)}</Num></strong>
                  </div>
                </div>

                <div className="sc-barbox">
                  <div
                    className="sc-track"
                    role="img"
                    aria-label={`الصافي ${netPct.toFixed(1)}% من إجمالي الراتب`}
                  >
                    <div className="sc-fill" style={{ width: `${netPct}%` }} />
                  </div>
                  <p className="sc-bar-text"><Num>{netPct.toFixed(1)}%</Num> صافي</p>
                </div>
              </>
            )}

            <div className="sc-actions sc-noprint">
              <button type="button" onClick={() => window.print()} className="sc-btn">
                طباعة
              </button>
            </div>
          </section>

          {result && (
            <section className="sc-card sc-card-flush" aria-labelledby="sc-slip">
              <h3 id="sc-slip" className="sc-slip-title">تفصيل قسيمة الراتب</h3>

              <div className="sc-block">
                <p className="sc-block-title"><span aria-hidden="true">+</span> الإجمالي</p>
                <dl className="sc-dl">
                  {earnings.map((item) => (
                    <div key={item.label} className="sc-dl-row">
                      <dt>{item.label}</dt>
                      <dd><Num>{fmt(item.value)}</Num></dd>
                    </div>
                  ))}
                  <div className="sc-dl-row sc-dl-total">
                    <dt>الإجمالي الكلي</dt>
                    <dd><Num>{fmt(result.totalGross)}</Num></dd>
                  </div>
                </dl>
              </div>

              <div className="sc-block">
                <p className="sc-block-title"><span aria-hidden="true">−</span> الخصومات</p>
                <dl className="sc-dl">
                  {deductionItems.filter((d) => d.value > 0).map((item) => (
                    <div key={item.label} className="sc-ded">
                      <div className="sc-dl-row sc-dl-flat">
                        <dt>{item.label}</dt>
                        <dd><Num>({fmt(item.value)})</Num></dd>
                      </div>
                      <div className="sc-mini" aria-hidden="true">
                        <div
                          className="sc-mini-fill"
                          style={{
                            width: `${result.totalGross > 0 ? Math.min(100, (item.value / result.totalGross) * 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="sc-dl-row sc-dl-total">
                    <dt>إجمالي الخصومات</dt>
                    <dd><Num>({fmt(result.totalDeductions)})</Num></dd>
                  </div>
                </dl>
              </div>

              <div className="sc-net">
                <span>صافي الراتب</span>
                <strong><Num>{fmt(result.netPay)}</Num></strong>
              </div>

              <div className="sc-eff">
                <p>معدل الخصم الفعلي</p>
                <strong><Num>{result.effectiveTaxRate.toFixed(1)}%</Num></strong>
                <p>من إجمالي الراتب</p>
              </div>
            </section>
          )}

          {result && (
            <section className="sc-quick" aria-labelledby="sc-quick-t">
              <h3 id="sc-quick-t" className="sc-quick-title">مقارنة سريعة</h3>
              <dl className="sc-dl sc-dl-plain">
                <div className="sc-dl-row sc-dl-flat">
                  <dt>صافي شهري:</dt>
                  <dd><Num>{sym} {Math.round(result.netPay / (period === "annual" ? 12 : 1)).toLocaleString("en-US")}</Num></dd>
                </div>
                <div className="sc-dl-row sc-dl-flat">
                  <dt>صافي سنوي:</dt>
                  <dd><Num>{sym} {Math.round(result.netPay * (period === "monthly" ? 12 : 1)).toLocaleString("en-US")}</Num></dd>
                </div>
                <div className="sc-dl-row sc-dl-flat">
                  <dt>صافي يومي (÷30):</dt>
                  <dd><Num>{sym} {Math.round(result.netPay / (period === "annual" ? 365 : 30)).toLocaleString("en-US")}</Num></dd>
                </div>
              </dl>
            </section>
          )}
        </div>
      </div>

      <p className="sc-disclaimer">
        <span className="sc-tag" aria-hidden="true">!</span>
        <span>
          <span className="sc-sr">تنبيه: </span>
          الأرقام تقديرية للأغراض التخطيطية فقط. تختلف الضرائب الفعلية بحسب وضعك الضريبي الكامل واستقطاعاتك المؤهلة. استشر محاسباً معتمداً.
        </span>
      </p>
    </div>
  );
}

/**
 * Local styles. Map the --sc-* fallbacks to your real Ink & Signal tokens.
 */
function SalaryStyles() {
  return (
    <style>{`
      .sc-root{
        --sc-ink:#0a0a0a; --sc-paper:#ffffff; --sc-muted:#f0f0f0;
        --sc-text2:#404040; --sc-orange:#ff5a1f;
        max-width:64rem; margin:0 auto; padding:2rem 1rem;
        color:var(--sc-ink); background:var(--sc-paper);
      }
      @media (min-width:640px){ .sc-root{ padding:3rem 1rem; } }
      @media (prefers-color-scheme: dark){
        :root:not([data-theme="light"]) .sc-root{
          --sc-ink:#f5f5f5; --sc-paper:#0a0a0a; --sc-muted:#1a1a1a; --sc-text2:#d4d4d4;
        }
      }
      :root[data-theme="dark"] .sc-root{
        --sc-ink:#f5f5f5; --sc-paper:#0a0a0a; --sc-muted:#1a1a1a; --sc-text2:#d4d4d4;
      }

      .sc-ltr{ direction:ltr; unicode-bidi:isolate; display:inline-block; }
      .sc-sr{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
      .sc-root :focus-visible{ outline:3px solid var(--sc-orange); outline-offset:2px; }

      /* Header */
      .sc-header{ text-align:center; margin-bottom:2rem; display:grid; gap:.75rem; justify-items:center; }
      .sc-kicker-tag{ margin:0; padding:.125rem .75rem; border:2px solid var(--sc-ink); font-size:.75rem; font-weight:800; }
      .sc-h1{ margin:0; font-size:1.875rem; font-weight:800; line-height:1.4; }
      @media (min-width:640px){ .sc-h1{ font-size:2.25rem; } }
      .sc-lead{ margin:0; max-width:36rem; font-size:.9375rem; line-height:1.9; color:var(--sc-text2); }

      .sc-grid{ display:grid; grid-template-columns:1fr; gap:1.5rem; }
      @media (min-width:1024px){ .sc-grid{ grid-template-columns:3fr 2fr; align-items:start; } }
      .sc-col{ display:grid; gap:1.25rem; }
      @media (min-width:1024px){ .sc-sticky{ position:sticky; top:1rem; } }

      /* Cards */
      .sc-card{ border:2px solid var(--sc-ink); padding:1.25rem; display:grid; gap:1rem; }
      .sc-card-flush{ padding:0; gap:0; }
      .sc-h2{ margin:0; display:flex; align-items:center; gap:.625rem; font-size:1rem; font-weight:800; }
      .sc-num{
        flex:none; width:1.75rem; height:1.75rem; display:inline-flex;
        align-items:center; justify-content:center;
        border:2px solid var(--sc-ink); font-size:.8125rem; font-weight:800;
      }
      .sc-title-row{ display:flex; align-items:center; justify-content:space-between; gap:.75rem; flex-wrap:wrap; }
      .sc-two{ display:grid; gap:1rem; grid-template-columns:1fr; }
      @media (min-width:640px){ .sc-two{ grid-template-columns:1fr 1fr; } }
      .sc-help{ margin:0; font-size:.75rem; line-height:1.8; color:var(--sc-text2); }

      /* Country picker */
      .sc-countries{ display:grid; grid-template-columns:1fr 1fr; gap:.5rem; }
      @media (min-width:640px){ .sc-countries{ grid-template-columns:repeat(3,1fr); } }
      .sc-country{
        display:grid; gap:.125rem; text-align:start; padding:.625rem .75rem;
        border:2px solid var(--sc-ink); background:var(--sc-paper); color:var(--sc-ink);
        font-family:inherit; cursor:pointer;
      }
      .sc-country:hover{ background:var(--sc-muted); }
      .sc-country[aria-pressed="true"]{ background:var(--sc-orange); color:#0a0a0a; border-width:4px; padding:.5rem .625rem; }
      .sc-country-top{ display:flex; align-items:center; justify-content:space-between; }
      .sc-code{ border:2px solid currentColor; padding:0 .375rem; font-size:.625rem; font-weight:800; letter-spacing:.04em; line-height:1.6; }
      .sc-check{ font-weight:900; font-size:.875rem; }
      .sc-country-name{ font-size:.8125rem; font-weight:800; }
      .sc-sub{ font-size:.625rem; font-weight:600; }

      .sc-note-line{
        margin:0; display:flex; gap:.5rem; align-items:flex-start;
        border:2px dashed var(--sc-ink); padding:.625rem .75rem;
        font-size:.75rem; line-height:1.8; color:var(--sc-text2);
      }
      .sc-tag{
        flex:none; width:1.25rem; height:1.25rem; display:inline-flex;
        align-items:center; justify-content:center; font-weight:800;
        border:2px solid currentColor; color:var(--sc-ink);
      }

      /* Segmented toggle */
      .sc-seg{ display:flex; border:2px solid var(--sc-ink); }
      .sc-seg button{
        padding:.375rem .875rem; border:0; background:var(--sc-paper); color:var(--sc-ink);
        font-size:.75rem; font-weight:800; font-family:inherit; cursor:pointer;
      }
      .sc-seg button + button{ border-inline-start:2px solid var(--sc-ink); }
      .sc-seg button[aria-pressed="true"]{ background:var(--sc-ink); color:var(--sc-paper); }

      /* Fields */
      .sc-field{ display:grid; gap:.375rem; align-content:start; }
      .sc-label{ display:flex; justify-content:space-between; gap:.5rem; font-size:.75rem; font-weight:800; line-height:1.6; }
      .sc-hint{ font-weight:600; color:var(--sc-text2); }
      .sc-input-wrap{ display:flex; border:2px solid var(--sc-ink); background:var(--sc-paper); }
      .sc-input-wrap:focus-within{ outline:3px solid var(--sc-orange); outline-offset:2px; }
      .sc-sym{
        flex:none; padding:0 .75rem; display:inline-flex; align-items:center;
        background:var(--sc-muted); border-inline-end:2px solid var(--sc-ink);
        font-size:.75rem; font-weight:800;
      }
      .sc-input{
        flex:1; min-width:0; border:0; background:transparent; color:var(--sc-ink);
        padding:.625rem .75rem; font-size:.875rem; font-weight:700; font-family:inherit;
      }
      .sc-input-big{ font-size:1.125rem; font-weight:800; padding:.75rem; }
      .sc-input:focus-visible{ outline:none; }

      /* Result panel (orange, black text) */
      .sc-result{
        background:var(--sc-orange); color:#0a0a0a; border:2px solid var(--sc-ink);
        padding:1.25rem; display:grid; gap:1rem;
      }
      .sc-result-label{ margin:0; font-size:.8125rem; font-weight:800; }
      .sc-big{ margin:0; font-size:2.25rem; font-weight:900; line-height:1.2; }
      .sc-stats{ display:grid; grid-template-columns:1fr 1fr; gap:.5rem; }
      .sc-stat{ border:2px solid #0a0a0a; padding:.5rem; text-align:center; }
      .sc-stat p{ margin:0; font-size:.625rem; font-weight:700; }
      .sc-stat strong{ font-size:.8125rem; font-weight:800; }
      .sc-barbox{ background:#ffffff; border:2px solid #0a0a0a; padding:.625rem; display:grid; gap:.375rem; }
      .sc-track{ height:.875rem; border:2px solid #0a0a0a; background:#ffffff; overflow:hidden; }
      .sc-fill{ height:100%; background:#0a0a0a; }
      .sc-bar-text{ margin:0; font-size:.75rem; font-weight:800; }
      .sc-actions{ display:flex; gap:.5rem; }
      .sc-btn{
        flex:1; padding:.5rem .75rem; background:#0a0a0a; color:#ffffff;
        border:2px solid #0a0a0a; font-size:.75rem; font-weight:800; font-family:inherit; cursor:pointer;
      }
      .sc-btn:hover{ background:#ffffff; color:#0a0a0a; }
      .sc-result .sc-btn:focus-visible{ outline:3px solid #0a0a0a; outline-offset:3px; }

      /* Payslip */
      .sc-slip-title{ margin:0; padding:.875rem 1.25rem; border-bottom:2px solid var(--sc-ink); font-size:.875rem; font-weight:800; }
      .sc-block{ padding:1rem 1.25rem; border-bottom:2px solid var(--sc-ink); display:grid; gap:.5rem; }
      .sc-block-title{ margin:0; font-size:.75rem; font-weight:800; display:flex; gap:.375rem; align-items:center; }
      .sc-block-title span{
        width:1.25rem; height:1.25rem; display:inline-flex; align-items:center; justify-content:center;
        border:2px solid var(--sc-ink); font-weight:800;
      }
      .sc-dl{ margin:0; display:grid; }
      .sc-dl-row{
        display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap;
        padding:.375rem 0; border-bottom:1px solid var(--sc-ink); font-size:.75rem;
      }
      .sc-dl-row dt{ margin:0; color:var(--sc-text2); }
      .sc-dl-row dd{ margin:0; font-weight:800; }
      .sc-dl-flat{ border-bottom:0; }
      .sc-dl-total{ border-bottom:0; border-top:2px solid var(--sc-ink); margin-top:.25rem; padding-top:.5rem; font-size:.8125rem; }
      .sc-dl-total dt{ color:var(--sc-ink); font-weight:800; }
      .sc-ded{ display:grid; gap:.125rem; }
      .sc-mini{ height:.5rem; border:1px solid var(--sc-ink); }
      .sc-mini-fill{ height:100%; background:var(--sc-ink); }

      .sc-net{
        display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;
        padding:.875rem 1.25rem; background:var(--sc-orange); color:#0a0a0a;
        border-bottom:2px solid var(--sc-ink); font-size:.9375rem;
      }
      .sc-net span,.sc-net strong{ font-weight:900; }
      .sc-eff{ padding:1rem 1.25rem; text-align:center; }
      .sc-eff p{ margin:0; font-size:.75rem; color:var(--sc-text2); }
      .sc-eff strong{ display:block; font-size:1.5rem; font-weight:900; margin:.125rem 0; }

      /* Quick comparison */
      .sc-quick{ border:2px dashed var(--sc-ink); padding:1rem 1.25rem; display:grid; gap:.5rem; }
      .sc-quick-title{ margin:0; font-size:.8125rem; font-weight:800; }
      .sc-dl-plain .sc-dl-row{ padding:.25rem 0; }

      /* Disclaimer */
      .sc-disclaimer{
        margin:2rem 0 0; padding:.75rem 1rem; border:2px dashed var(--sc-ink);
        display:flex; gap:.5rem; align-items:flex-start;
        font-size:.75rem; line-height:1.8; color:var(--sc-text2);
      }

      /* Print: results only */
      @media print{
        .sc-noprint{ display:none !important; }
        .sc-root{ color:#000; background:none; padding:0; }
        .sc-grid{ grid-template-columns:1fr; }
        .sc-sticky{ position:static; }
        .sc-result,.sc-net{ -webkit-print-color-adjust:exact; print-color-adjust:exact; border-color:#000; }
        .sc-card,.sc-disclaimer,.sc-quick{ border-color:#000; color:#000; }
        .sc-dl-row dt,.sc-disclaimer{ color:#000; }
      }
    `}</style>
  );
}