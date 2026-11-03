"use client";

/**
 * components/SalaryCalculator.jsx
 * Qemlo redesign — glossy orange / ink, SVG icons, 26px radius, dark + light.
 * Calculation logic is IDENTICAL to the previous version (SA GOSI, EG, PK, GB, US).
 * Theme: uses global tokens (--bg, --surface, --border, --text, --text-2, --text-3,
 * --orange, --orange-hover, --on-orange) and falls back to prefers-color-scheme.
 */
import { useState, useMemo } from "react";
import { calculateGOSI } from "@/lib/gosiEngine";

/* ─── Country Tax Configs ────────────────────────────────────────────────── */
const COUNTRIES = [
  {
    id: "sa", code: "SA", name: "السعودية", currency: "SAR", symbol: "ر.س",
    taxName: "ضريبة الدخل", socialName: "التأمينات الاجتماعية (GOSI)",
    hasTax: false, socialRate: 0.0975, socialCap: 45000,
    allowances: { housing: 0.25, transport: 800, food: 500 },
    note: "لا توجد ضريبة دخل على الرواتب في السعودية",
  },
  {
    id: "ae", code: "AE", name: "الإمارات", currency: "AED", symbol: "د.إ",
    taxName: "ضريبة الدخل", socialName: "الضمان الاجتماعي",
    hasTax: false, socialRate: 0, socialCap: 0,
    allowances: { housing: 0.25, transport: 600, food: 400 },
    note: "لا توجد ضريبة دخل على الرواتب في الإمارات",
  },
  {
    id: "eg", code: "EG", name: "مصر", currency: "EGP", symbol: "ج.م",
    taxName: "ضريبة الدخل", socialName: "التأمين الاجتماعي (NOSI)",
    hasTax: true,
    // Law 148/2019 (NOSI): 11% employee, capped at EGP 16,700/month (2026)
    socialRate: 0.11, socialCap: 16700,
    allowances: { housing: 0.20, transport: 500, food: 300 },
    // Personal exemption EGP 20,000/yr (Law 91/2005 Art.13, as amended)
    personalExemptionAnnual: 20000,
    // Source: Egyptian Tax Authority / PwC Egypt 2026; Law 91/2005 as amended by Law 7/2024
    annualBrackets: [
      { limit: 40000, rate: 0 },
      { limit: 55000, rate: 0.10 },
      { limit: 70000, rate: 0.15 },
      { limit: 200000, rate: 0.20 },
      { limit: 400000, rate: 0.225 },
      { limit: 1200000, rate: 0.25 },
      { limit: Infinity, rate: 0.275 },
    ],
    note: "شرائح ضريبية مصر 2026 — قانون 91/2005 معدلاً بقانون 7/2024. الإعفاء الشخصي 20,000 جنيه سنوياً.",
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
    note: "شرائح ضريبية 2024-25 (سنوي / 12)",
  },
  {
    // UK — England, Wales & NI. Scotland has different bands (not covered).
    // Source: HMRC rates and thresholds 2026-27 (6 Apr 2026 – 5 Apr 2027)
    id: "gb", code: "GB", name: "المملكة المتحدة", currency: "GBP", symbol: "£",
    taxName: "ضريبة الدخل (إنجلترا/ويلز/أيرلندا الشمالية)", socialName: "التأمين الوطني (NI Class 1)",
    hasTax: true,
    allowances: { housing: 0, transport: 0, food: 0 },
    personalAllowanceAnnual: 12570,
    paFullTaperAt: 125140,
    paTaperStart: 100000,
    annualBrackets: [
      { limit: 37700, rate: 0.20 },
      { limit: 112570, rate: 0.40 },
      { limit: Infinity, rate: 0.45 },
    ],
    niPrimaryThresholdAnnual: 12570,
    niUpperEarningsLimitAnnual: 50270,
    niRateMain: 0.08,
    niRateAboveUEL: 0.02,
    note: "إنجلترا/ويلز/أيرلندا الشمالية فقط — اسكتلندا لها شرائح مختلفة. ضريبة الدخل + NI 2026-27 (HMRC).",
  },
  {
    // US — Federal only, single filer. State/local taxes not included.
    id: "us", code: "US", name: "الولايات المتحدة", currency: "USD", symbol: "$",
    taxName: "ضريبة الدخل الفيدرالية (Single Filer)", socialName: "الضمان الاجتماعي + Medicare (فيدرالي)",
    hasTax: true,
    allowances: { housing: 0, transport: 0, food: 0 },
    standardDeductionAnnual: 16100,
    annualBrackets: [
      { limit: 12400, rate: 0.10 },
      { limit: 50400, rate: 0.12 },
      { limit: 105700, rate: 0.22 },
      { limit: 201775, rate: 0.24 },
      { limit: 256225, rate: 0.32 },
      { limit: 640600, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ],
    ssRate: 0.062,
    ssWageBaseAnnual: 184500,
    medicareRate: 0.0145,
    additionalMedicareRate: 0.009,
    additionalMedicareThresholdAnnual: 200000,
    note: "فيدرالي فقط — ضريبة الدخل الفيدرالية (Single Filer 2026) + SS 6.2% (حد $184,500) + Medicare 1.45%. لا تشمل ضرائب الولايات.",
  },
];

/* ─── Tax Calculation Helpers (unchanged logic) ─────────────────────────── */
function applyAnnualBrackets(taxableAnnual, brackets) {
  if (!brackets || taxableAnnual <= 0) return 0;
  let tax = 0;
  let prev = 0;
  for (const bracket of brackets) {
    if (taxableAnnual <= prev) break;
    const inBracket = Math.min(taxableAnnual, bracket.limit) - prev;
    tax += inBracket * bracket.rate;
    prev = bracket.limit;
    if (bracket.limit === Infinity) break;
  }
  return Math.max(0, tax);
}

function calcTaxPK(monthlyGross, country) {
  if (!country.hasTax || !country.brackets) return 0;
  let tax = 0;
  let prev = 0;
  for (const bracket of country.brackets) {
    if (monthlyGross <= prev) break;
    const inBracket = Math.min(monthlyGross, bracket.limit) - prev;
    tax += inBracket * bracket.rate;
    prev = bracket.limit;
    if (bracket.limit === Infinity) break;
  }
  return Math.max(0, tax);
}

function calcUKIncomeTax(annualGross, country) {
  let pa = country.personalAllowanceAnnual;
  if (annualGross > country.paTaperStart) {
    const excess = annualGross - country.paTaperStart;
    pa = Math.max(0, pa - Math.floor(excess / 2));
  }
  const taxable = Math.max(0, annualGross - pa);
  return applyAnnualBrackets(taxable, country.annualBrackets);
}

function calcUKNI(annualGross, country) {
  const pt = country.niPrimaryThresholdAnnual;
  const uel = country.niUpperEarningsLimitAnnual;
  let ni = 0;
  if (annualGross > pt) ni += (Math.min(annualGross, uel) - pt) * country.niRateMain;
  if (annualGross > uel) ni += (annualGross - uel) * country.niRateAboveUEL;
  return Math.max(0, ni);
}

function calcUSPayroll(annualGross, country) {
  const ssBase = Math.min(annualGross, country.ssWageBaseAnnual);
  const ss = ssBase * country.ssRate;
  const medicare = annualGross * country.medicareRate;
  const additionalMedicare =
    annualGross > country.additionalMedicareThresholdAnnual
      ? (annualGross - country.additionalMedicareThresholdAnnual) * country.additionalMedicareRate
      : 0;
  const taxable = Math.max(0, annualGross - country.standardDeductionAnnual);
  const federalTax = applyAnnualBrackets(taxable, country.annualBrackets);
  return {
    federalTax,
    ss,
    medicare: medicare + additionalMedicare,
    total: federalTax + ss + medicare + additionalMedicare,
  };
}

function calcEGIncomeTax(annualGross, annualSocialInsurance, country) {
  const taxable = Math.max(0, annualGross - annualSocialInsurance - country.personalExemptionAnnual);
  return applyAnnualBrackets(taxable, country.annualBrackets);
}

function calcSocial(monthlyGross, country) {
  if (country.socialFixed) return country.socialFixed;
  if (!country.socialRate) return 0;
  const base = country.socialCap ? Math.min(monthlyGross, country.socialCap) : monthlyGross;
  return base * country.socialRate;
}

const nn = (v) => Math.max(0, Number(v) || 0);

/* ─── Icons (inline SVG, stroke = currentColor) ─────────────────────────── */
const ICON_PATHS = {
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" /></>,
  wallet: <><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a1 1 0 0 1 1 1v2" /><path d="M3 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3" /><path d="M21 9.5h-4a2.5 2.5 0 0 0 0 5h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5z" /></>,
  plus: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
  minus: <><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /></>,
  building: <><path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16" /><path d="M14 10h5a1 1 0 0 1 1 1v10" /><path d="M8 8h2M8 12h2M8 16h2M3 21h18" /></>,
  print: <><path d="M7 9V4h10v5" /><rect x="4" y="9" width="16" height="8" rx="2" /><path d="M7 14h10v6H7z" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  alert: <><path d="M12 3 2.5 20h19L12 3z" /><path d="M12 10v4M12 17h.01" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><path d="M9 8h6M9 12h6" /></>,
  bolt: <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7z" />,
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

/** Keeps signs / digits / % in a stable left-to-right order inside RTL text. */
function Num({ children }) {
  return <span className="sc-ltr">{children}</span>;
}

function Field({
  id, label, hint, value, onChange, sym, placeholder = "0",
  big = false, type = "number", min = "0", max, disabled = false,
}) {
  return (
    <div className="sc-field">
      <label htmlFor={id} className="sc-label">
        <span>{label}</span>
        {hint && <span className="sc-hint">{hint}</span>}
      </label>
      <div className={`sc-input-wrap ${disabled ? "sc-disabled" : ""}`}>
        {sym ? <span className="sc-sym" aria-hidden="true">{sym}</span> : null}
        <input
          id={id}
          type={type}
          inputMode={type === "number" ? "decimal" : undefined}
          min={type === "number" ? min : undefined}
          max={type === "number" ? max : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`sc-input ${big ? "sc-input-big" : ""}`}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function SelectField({ id, label, hint, value, onChange, options }) {
  return (
    <div className="sc-field">
      <label htmlFor={id} className="sc-label">
        <span>{label}</span>
        {hint && <span className="sc-hint">{hint}</span>}
      </label>
      <div className="sc-input-wrap">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sc-input sc-select"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function CardTitle({ id, icon, children, aside }) {
  return (
    <div className="sc-title-row">
      <h2 id={id} className="sc-h2">
        <span className="sc-tile"><Icon name={icon} /></span>
        <span>{children}</span>
      </h2>
      {aside}
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

  // Saudi GOSI specific state
  const [employeeCategory, setEmployeeCategory] = useState("legacy"); // legacy | new | expat | gcc
  const [contributionDate, setContributionDate] = useState(() =>
    new Date().toISOString().substring(0, 10)
  );
  const [period, setPeriod] = useState("monthly"); // monthly | annual
  const [housingValuationMode, setHousingValuationMode] = useState("cash"); // cash | inKind | none
  const [employeeAge, setEmployeeAge] = useState("");

  const country = COUNTRIES.find((c) => c.id === countryId);

  const handleCountryChange = (id) => {
    const c = COUNTRIES.find((x) => x.id === id);
    if (!c) return;
    setCountryId(id);
    if (c.id === "sa") {
      setEmployeeCategory("legacy");
      setHousingValuationMode("cash");
    }
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

    // SA: cash housing adds to bank earnings; in-kind enters GOSI base only.
    const effectiveCashHousing =
      country.id === "sa" ? (housingValuationMode === "cash" ? housing : 0) : housing;

    const transport = nn(transportAllowance);
    const food = nn(foodAllowance);
    const other = nn(otherAllowances);
    const totalAllowances = effectiveCashHousing + transport + food + other;
    const totalGross = gross + totalAllowances;

    let gosi = {};
    let incomeTax = 0;

    if (country.id === "sa") {
      gosi = calculateGOSI({
        basic: gross,
        housing: housingValuationMode === "cash" ? housing : 0,
        housingValuationMode,
        employeeCategory,
        contributionDate,
        age: employeeAge ? Number(employeeAge) : null,
      });
      incomeTax = 0;
    } else if (country.id === "gb") {
      const annualGross = gross * 12;
      incomeTax = calcUKIncomeTax(annualGross, country) / 12;
      const monthlyNI = calcUKNI(annualGross, country) / 12;
      gosi = {
        employeeTotal: monthlyNI,
        employerTotal: 0,
        employeeBreakdown: monthlyNI > 0 ? [{ label: country.socialName, value: monthlyNI }] : [],
        employerBreakdown: [],
        breakdown: monthlyNI > 0 ? [{ label: country.socialName, value: monthlyNI }] : [],
      };
    } else if (country.id === "us") {
      const annualGross = gross * 12;
      const usPayroll = calcUSPayroll(annualGross, country);
      incomeTax = usPayroll.federalTax / 12;
      const monthlySocial = (usPayroll.ss + usPayroll.medicare) / 12;
      const socialBreakdown = [
        { label: "الضمان الاجتماعي (SS 6.2%)", value: usPayroll.ss / 12 },
        { label: "Medicare (1.45%+)", value: usPayroll.medicare / 12 },
      ].filter((b) => b.value > 0);
      gosi = {
        employeeTotal: monthlySocial,
        employerTotal: 0,
        employeeBreakdown: socialBreakdown,
        employerBreakdown: [],
        breakdown: socialBreakdown,
      };
    } else if (country.id === "eg") {
      const monthlySI = calcSocial(gross, country);
      incomeTax = calcEGIncomeTax(gross * 12, monthlySI * 12, country) / 12;
      gosi = {
        employeeTotal: monthlySI,
        employerTotal: 0,
        employeeBreakdown: monthlySI > 0 ? [{ label: country.socialName, value: monthlySI }] : [],
        employerBreakdown: [],
        breakdown: monthlySI > 0 ? [{ label: country.socialName, value: monthlySI }] : [],
      };
    } else {
      incomeTax = calcTaxPK(gross, country);
      const socialInsurance = calcSocial(gross, country);
      gosi = {
        employeeTotal: socialInsurance,
        employerTotal: 0,
        employeeBreakdown: socialInsurance > 0 ? [{ label: country.socialName, value: socialInsurance }] : [],
        employerBreakdown: [],
        breakdown: socialInsurance > 0 ? [{ label: country.socialName, value: socialInsurance }] : [],
      };
    }

    const extraDeductions = nn(otherDeductions);
    const totalDeductions = incomeTax + (gosi.employeeTotal || 0) + extraDeductions;
    const netPay = Math.max(0, totalGross - totalDeductions);
    const effectiveTaxRate = totalGross > 0 ? (totalDeductions / totalGross) * 100 : 0;
    const mult = period === "annual" ? 12 : 1;

    return {
      grossBasic: gross * mult,
      totalAllowances: totalAllowances * mult,
      totalGross: totalGross * mult,
      incomeTax: incomeTax * mult,
      socialInsurance: (gosi.employeeTotal || 0) * mult,
      employerTotal: (gosi.employerTotal || 0) * mult,
      extraDeductions: extraDeductions * mult,
      totalDeductions: totalDeductions * mult,
      netPay: netPay * mult,
      effectiveTaxRate,
      housing: effectiveCashHousing * mult,
      transport: transport * mult,
      food: food * mult,
      other: other * mult,
      employeeBreakdown: (gosi.employeeBreakdown || []).map((i) => ({ label: i.label, value: i.value * mult })),
      employerBreakdown: (gosi.employerBreakdown || []).map((i) => ({ label: i.label, value: i.value * mult })),
      gosiNote: gosi.note,
      contributoryWage: (gosi.contributoryWage || 0) * mult,
    };
  }, [
    country, grossSalary, housingAllowance, transportAllowance, foodAllowance,
    otherAllowances, otherDeductions, period, employeeCategory, contributionDate,
    housingValuationMode, employeeAge,
  ]);

  const sym = country?.symbol || "";

  function fmt(n) {
    return `${sym} ${Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // Employee deductions only — employer contributions are NEVER listed here.
  const deductionItems = result
    ? [
      { label: country?.taxName || "ضريبة الدخل", value: result.incomeTax },
      ...(result.employeeBreakdown || []),
      { label: "خصومات أخرى", value: result.extraDeductions },
    ]
    : [];

  const netPct = result ? Math.min(100, Math.max(0, 100 - result.effectiveTaxRate)) : 0;
  const housingPct = country?.allowances?.housing;
  const housingHint =
    housingPct > 0 && housingPct < 1 ? `متعارف عليه: ${Math.round(housingPct * 100)}%` : "";

  const allowanceFields = [
    { id: "sc-transport", label: "بدل النقل", value: transportAllowance, setter: setTransportAllowance },
    { id: "sc-food", label: "بدل الطعام", value: foodAllowance, setter: setFoodAllowance },
    { id: "sc-other", label: "بدلات أخرى", value: otherAllowances, setter: setOtherAllowances },
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
        <p className="sc-kicker-tag">
          <Icon name="bolt" size={14} />
          {pageBadge || "حاسبة الراتب الصافي"}
        </p>
        <h1 className="sc-h1">{pageTitle || "حاسبة الراتب الصافي وصافي الأجر"}</h1>
        <p className="sc-lead">
          {pageDesc || "احسب راتبك الصافي بدقة بعد الضرائب والتأمينات الاجتماعية والبدلات."}
        </p>
      </header>

      <div className="sc-grid">
        {/* ─── Inputs ─── */}
        <div className="sc-col sc-noprint">
          {/* 1. Country */}
          <section className="sc-card" aria-labelledby="sc-s1">
            <CardTitle id="sc-s1" icon="globe">الدولة / نظام الضرائب والتأمينات</CardTitle>
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
                      {on && <span className="sc-check"><Icon name="check" size={16} /></span>}
                    </span>
                    <span className="sc-country-name">{c.name}</span>
                    <span className="sc-sub">{c.hasTax ? "ضريبة تصاعدية" : "بدون ضريبة دخل"}</span>
                  </button>
                );
              })}
            </div>
            {country?.note && (
              <p className="sc-note-line">
                <span className="sc-ico"><Icon name="info" size={18} /></span>
                <span>{country.note}</span>
              </p>
            )}

            {countryId === "sa" && (
              <div className="sc-sa-section">
                <h3 className="sc-subhead">خيارات التأمينات الاجتماعية السعودية (GOSI)</h3>
                <SelectField
                  id="sc-category"
                  label="فئة الموظف ونظام التأمينات"
                  hint="اختر النظام المناسب لتطبيق نسب الاشتراك المعتمدة بدقة"
                  value={employeeCategory}
                  onChange={setEmployeeCategory}
                  options={[
                    { value: "legacy", label: "مواطن سعودي — النظام السابق (مستمر قبل 3 يوليو 2024 / معاشات 9% + ساند 0.75%)" },
                    { value: "new", label: "مواطن سعودي — النظام الجديد (ملتحق بعد 3 يوليو 2024 / تدرج معاشات 9% إلى 11%)" },
                    { value: "expat", label: "مقيم غير سعودي (وافد — أخطار مهنية 2% على المنشأة فقط دون خصم من الراتب)" },
                    { value: "gcc", label: "مواطن خليجي (GCC — نظام مد الحماية التأمينية)" },
                  ]}
                />

                {employeeCategory === "new" && (
                  <Field
                    id="sc-contribution-date"
                    label="تاريخ الاشتراك (لتحديد شريحة المعاشات)"
                    hint="التدرج: 9.5% حتى يونيو 2026، 10% حتى يونيو 2027، 10.5% حتى يونيو 2028، 11% بعدها"
                    type="date"
                    value={
                      typeof contributionDate === "string"
                        ? contributionDate
                        : contributionDate instanceof Date && !isNaN(contributionDate)
                          ? contributionDate.toISOString().substring(0, 10)
                          : ""
                    }
                    onChange={setContributionDate}
                  />
                )}

                {(employeeCategory === "legacy" || employeeCategory === "new") && (
                  <Field
                    id="sc-age"
                    label="عمر الموظف (سنة) — اختياري"
                    hint="يتوقف استقطاع ساند نظاماً عند بلوغ سن الستين (60 سنة)"
                    type="number"
                    min="15"
                    max="100"
                    placeholder="مثال: 30"
                    value={employeeAge}
                    onChange={setEmployeeAge}
                  />
                )}
              </div>
            )}
          </section>

          {/* 2. Gross + period */}
          <section className="sc-card" aria-labelledby="sc-s2">
            <CardTitle
              id="sc-s2"
              icon="wallet"
              aside={
                <div className="sc-seg" role="group" aria-label="فترة العرض">
                  <button type="button" aria-pressed={period === "monthly"} onClick={() => setPeriod("monthly")}>شهري</button>
                  <button type="button" aria-pressed={period === "annual"} onClick={() => setPeriod("annual")}>سنوي</button>
                </div>
              }
            >
              الراتب الأساسي
            </CardTitle>
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

          {/* 3. Allowances */}
          <section className="sc-card" aria-labelledby="sc-s3">
            <CardTitle id="sc-s3" icon="plus">البدلات الشهرية</CardTitle>

            {countryId === "sa" && (
              <div className="sc-housing-mode-wrap">
                <SelectField
                  id="sc-housing-mode"
                  label="طريقة احتساب بدل السكن"
                  hint="يدخل بدل السكن في وعاء احتساب اشتراك التأمينات الاجتماعية (GOSI)"
                  value={housingValuationMode}
                  onChange={setHousingValuationMode}
                  options={[
                    { value: "cash", label: "بدل سكن نقدي (يُدفع في الحساب البنكي ويخضع للتأمينات)" },
                    { value: "inKind", label: "سكن عيني موفر من المنشأة (يُقدّر للتأمينات بأجر شهرين سنوياً)" },
                    { value: "none", label: "لا يوجد بدل سكن (الراتب الأساسي فقط يخضع للتأمينات)" },
                  ]}
                />
                {housingValuationMode === "inKind" && (
                  <p className="sc-help sc-help-amber">
                    <Icon name="info" size={16} />
                    <span>
                      السكن العيني يُحتسب للتأمينات بقيمة (الأساسي ÷ 6 = <Num>{fmt(nn(grossSalary) / 6)}</Num> شهرياً) ولا يُضاف كحوالة نقدية لراتبك البنكي.
                    </span>
                  </p>
                )}
              </div>
            )}

            <div className="sc-two">
              {(countryId !== "sa" || housingValuationMode === "cash") && (
                <Field
                  id="sc-housing"
                  label="بدل السكن النقدي"
                  hint={housingHint}
                  value={housingAllowance}
                  onChange={setHousingAllowance}
                  sym={sym}
                />
              )}
              {allowanceFields.map((f) => (
                <Field
                  key={f.id}
                  id={f.id}
                  label={f.label}
                  value={f.value}
                  onChange={f.setter}
                  sym={sym}
                />
              ))}
            </div>
          </section>

          {/* 4. Extra deductions */}
          <section className="sc-card" aria-labelledby="sc-s4">
            <CardTitle id="sc-s4" icon="minus">خصومات إضافية شهرية</CardTitle>
            <Field
              id="sc-extra"
              label="قرض، تأمين صحي إضافي، سلف..."
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
                  <div className="sc-track" role="img" aria-label={`الصافي ${netPct.toFixed(1)}% من إجمالي الراتب`}>
                    <div className="sc-fill" style={{ width: `${netPct}%` }} />
                  </div>
                  <p className="sc-bar-text"><Num>{netPct.toFixed(1)}%</Num> صافي</p>
                </div>
              </>
            )}

            <div className="sc-actions sc-noprint">
              <button type="button" onClick={() => window.print()} className="sc-btn">
                <Icon name="print" size={18} />
                طباعة
              </button>
            </div>
          </section>

          {result && (
            <section className="sc-card sc-card-flush" aria-labelledby="sc-slip">
              <div className="sc-slip-head">
                <span className="sc-tile"><Icon name="receipt" /></span>
                <h3 id="sc-slip" className="sc-slip-title">تفصيل قسيمة الراتب</h3>
              </div>

              <div className="sc-block">
                <p className="sc-block-title"><span className="sc-mark"><Icon name="plus" size={16} /></span> الإجمالي</p>
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
                <p className="sc-block-title"><span className="sc-mark"><Icon name="minus" size={16} /></span> الخصومات من الراتب</p>
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

              {result.employerBreakdown && result.employerBreakdown.length > 0 && result.employerTotal > 0 && (
                <div className="sc-block sc-employer-block">
                  <div className="sc-employer-header">
                    <p className="sc-block-title">
                      <span className="sc-mark"><Icon name="building" size={16} /></span>
                      مساهمات المنشأة (صاحب العمل)
                    </p>
                    <span className="sc-employer-badge">لا تُخصم من الراتب</span>
                  </div>
                  <dl className="sc-dl">
                    {result.employerBreakdown.filter((d) => d.value > 0).map((item) => (
                      <div key={item.label} className="sc-dl-row sc-dl-flat">
                        <dt>{item.label}</dt>
                        <dd><Num>{fmt(item.value)}</Num></dd>
                      </div>
                    ))}
                    <div className="sc-dl-row sc-dl-total">
                      <dt>إجمالي مساهمة المنشأة</dt>
                      <dd><Num>{fmt(result.employerTotal)}</Num></dd>
                    </div>
                  </dl>
                </div>
              )}

              {result.gosiNote && (
                <div className="sc-note-box" role="status">
                  <span className="sc-ico"><Icon name="info" size={18} /></span>
                  <span>{result.gosiNote}</span>
                </div>
              )}

              <div className="sc-net">
                <span>صافي الراتب المستلم</span>
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
        <span className="sc-ico"><Icon name="alert" size={18} /></span>
        <span>
          <span className="sc-sr">تنبيه: </span>
          الأرقام تقديرية للأغراض التخطيطية والاسترشادية فقط. تختلف الخصومات الفعلية بحسب تاريخ التسجيل بالتأمينات والتصنيف النظامي للمنشأة والبدلات المسجلة في عقد العمل الموثق.
        </span>
      </p>
    </div>
  );
}

/**
 * Styles — built on global tokens, with built-in light/dark fallbacks.
 * Radius system: cards 26px, inputs/buttons 16px, chips 999px.
 */
function SalaryStyles() {
  return (
    <style>{`
      .sc-root{
        /* light fallbacks */
        --f-bg:#F5F5F2; --f-surface:#FFFFFF; --f-line:#E1E1DA; --f-ink:#0D0D0D; --f-t2:#55554F; --f-t3:#8A8A82;
        --f-soft:rgba(13,13,13,.04); --f-shadow:0 1px 0 rgba(255,255,255,.9) inset, 0 12px 32px -18px rgba(13,13,13,.28);
        --f-amber-bg:#FFF4E8; --f-amber-bd:#FFD9B8; --f-amber-tx:#9A3412;
      }
      @media (prefers-color-scheme:dark){
        .sc-root{
          --f-bg:#0D0D0D; --f-surface:#171717; --f-line:#2A2A27; --f-ink:#F5F5F2; --f-t2:#B4B4AC; --f-t3:#7C7C75;
          --f-soft:rgba(255,255,255,.04); --f-shadow:0 1px 0 rgba(255,255,255,.06) inset, 0 16px 36px -20px rgba(0,0,0,.9);
          --f-amber-bg:#2A1A0E; --f-amber-bd:#5A3517; --f-amber-tx:#FDBA74;
        }
      }
      .sc-root{
        --sc-ink:var(--text,var(--f-ink)); --sc-text2:var(--text-2,var(--f-t2)); --sc-text3:var(--text-3,var(--f-t3));
        --sc-surface:var(--surface,var(--f-surface)); --sc-bg:var(--bg,var(--f-bg)); --sc-line:var(--border,var(--f-line));
        --sc-orange:var(--orange,#FF5B04); --sc-orange-hover:var(--orange-hover,#FF7A33); --sc-on:var(--on-orange,#0D0D0D);
        --sc-gloss:linear-gradient(165deg,#FF9A52 0%,#FF5B04 46%,#E14600 100%);
        --sc-gloss-shadow:inset 0 1px 0 rgba(255,255,255,.5), inset 0 -3px 8px rgba(120,30,0,.25), 0 14px 28px -12px rgba(255,91,4,.6);
        --sc-r:26px; --sc-r-sm:16px;
        max-width:64rem; margin:0 auto; padding:2rem 1rem; color:var(--sc-ink);
      }
      @media (min-width:640px){ .sc-root{ padding:3rem 1.5rem; } }

      .sc-ltr{ direction:ltr; unicode-bidi:isolate; display:inline-block; }
      .sc-sr{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
      .sc-root :focus-visible{ outline:3px solid var(--sc-orange); outline-offset:2px; }

      /* Header */
      .sc-header{ text-align:center; margin-bottom:2.5rem; display:grid; gap:1rem; justify-items:center; }
      .sc-kicker-tag{
        margin:0; padding:.375rem 1rem; border-radius:999px; background:var(--sc-gloss); color:var(--sc-on);
        font-size:.8125rem; font-weight:800; display:inline-flex; align-items:center; gap:.375rem; box-shadow:var(--sc-gloss-shadow);
      }
      .sc-h1{ margin:0; font-size:clamp(1.5rem,5vw,2.375rem); font-weight:800; line-height:1.3; }
      .sc-lead{ margin:0; max-width:38rem; font-size:1rem; line-height:1.9; color:var(--sc-text2); }

      .sc-grid{ display:grid; grid-template-columns:minmax(0,1fr); gap:1.5rem; }
      @media (min-width:1024px){ .sc-grid{ grid-template-columns:minmax(0,3fr) minmax(0,2fr); gap:2rem; align-items:start; } }
      .sc-col{ display:grid; gap:1.25rem; min-width:0; }
      @media (min-width:1024px){ .sc-sticky{ position:sticky; top:1rem; } }

      /* Cards */
      .sc-card{
        position:relative; background:var(--sc-surface); border:1px solid var(--sc-line); border-radius:var(--sc-r);
        padding:1.25rem; display:grid; gap:1rem; box-shadow:var(--f-shadow); transition:border-color .2s, box-shadow .2s;
      }
      .sc-card:not(.sc-card-flush):hover{ border-color:var(--sc-orange); box-shadow:0 0 0 3px color-mix(in srgb,var(--sc-orange) 22%,transparent), var(--f-shadow); }
      .sc-card-flush{ padding:0; gap:0; overflow:hidden; }
      @media (min-width:640px){ .sc-card{ padding:1.5rem; } .sc-card-flush{ padding:0; } }

      .sc-title-row{ display:flex; align-items:center; justify-content:space-between; gap:.75rem; flex-wrap:wrap; }
      .sc-h2{ margin:0; display:flex; align-items:center; gap:.75rem; font-size:1.0625rem; font-weight:800; line-height:1.5; }
      .sc-tile{
        flex:none; width:2.5rem; height:2.5rem; display:inline-flex; align-items:center; justify-content:center;
        border-radius:14px; background:var(--sc-gloss); color:var(--sc-on); box-shadow:var(--sc-gloss-shadow);
      }
      .sc-two{ display:grid; gap:1rem; grid-template-columns:minmax(0,1fr); }
      @media (min-width:640px){ .sc-two{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
      .sc-help{ margin:0; font-size:.875rem; line-height:1.8; color:var(--sc-text2); }

      /* Country picker */
      .sc-countries{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.625rem; }
      @media (min-width:640px){ .sc-countries{ grid-template-columns:repeat(3,minmax(0,1fr)); } }
      .sc-country{
        position:relative; display:grid; gap:.125rem; text-align:start; min-height:4.75rem; padding:.75rem .875rem;
        border:1.5px solid var(--sc-line); border-radius:20px; background:var(--sc-surface); color:var(--sc-ink);
        font-family:inherit; cursor:pointer; overflow:hidden; transition:border-color .15s, transform .15s, box-shadow .15s;
      }
      .sc-country:hover{ border-color:var(--sc-orange); transform:translateY(-2px); }
      .sc-country[aria-pressed="true"]{
        background:var(--sc-gloss); border-color:transparent; color:var(--sc-on); box-shadow:var(--sc-gloss-shadow);
      }
      .sc-country[aria-pressed="true"]::before{
        content:""; position:absolute; inset:0 0 55% 0; background:linear-gradient(180deg,rgba(255,255,255,.32),rgba(255,255,255,0));
        pointer-events:none;
      }
      .sc-country-top{ display:flex; align-items:center; justify-content:space-between; position:relative; }
      .sc-code{ border:1.5px solid currentColor; border-radius:8px; padding:0 .4rem; font-size:.75rem; font-weight:800; line-height:1.6; }
      .sc-check{ display:inline-flex; }
      .sc-country-name{ position:relative; font-size:.9375rem; font-weight:800; line-height:1.5; }
      .sc-sub{ position:relative; font-size:.8125rem; font-weight:600; line-height:1.5; }
      .sc-country:not([aria-pressed="true"]) .sc-sub{ color:var(--sc-text2); }

      .sc-note-line{
        margin:0; display:flex; gap:.625rem; align-items:flex-start; border-radius:var(--sc-r-sm);
        background:var(--f-soft); border:1px dashed var(--sc-text3); padding:.75rem .875rem; font-size:.875rem; line-height:1.8; color:var(--sc-text2);
      }
      .sc-ico{ flex:none; display:inline-flex; margin-top:.15rem; color:var(--sc-orange); }

      /* Saudi controls */
      .sc-sa-section{ margin-top:.25rem; padding-top:1.25rem; border-top:1px dashed var(--sc-line); display:flex; flex-direction:column; gap:1rem; }
      .sc-subhead{ font-size:.9375rem; font-weight:800; margin:0; }
      .sc-housing-mode-wrap{ display:flex; flex-direction:column; gap:.75rem; }

      /* Segmented toggle */
      .sc-seg{ display:flex; padding:.25rem; gap:.25rem; border:1px solid var(--sc-line); border-radius:999px; background:var(--f-soft); }
      .sc-seg button{
        min-height:2.5rem; padding:.25rem 1.125rem; border:0; border-radius:999px; background:transparent; color:var(--sc-ink);
        font-size:.9375rem; font-weight:800; font-family:inherit; cursor:pointer; transition:background-color .15s;
      }
      .sc-seg button:hover{ background:var(--f-soft); }
      .sc-seg button[aria-pressed="true"]{ background:var(--sc-gloss); color:var(--sc-on); box-shadow:var(--sc-gloss-shadow); }

      /* Fields */
      .sc-field{ display:grid; gap:.5rem; align-content:start; min-width:0; }
      .sc-label{ display:flex; justify-content:space-between; gap:.5rem; flex-wrap:wrap; font-size:.9375rem; font-weight:700; line-height:1.6; }
      .sc-hint{ font-size:.8125rem; font-weight:500; color:var(--sc-text2); }
      .sc-input-wrap{
        display:flex; min-height:3.25rem; border:1.5px solid var(--sc-line); border-radius:var(--sc-r-sm);
        background:var(--sc-bg); overflow:hidden; transition:border-color .15s, box-shadow .15s;
      }
      .sc-input-wrap:hover{ border-color:var(--sc-text3); }
      .sc-input-wrap:focus-within{ border-color:var(--sc-orange); box-shadow:0 0 0 4px color-mix(in srgb,var(--sc-orange) 28%,transparent); }
      .sc-sym{
        flex:none; padding:0 .875rem; display:inline-flex; align-items:center; background:var(--f-soft);
        border-inline-end:1.5px solid var(--sc-line); font-size:.875rem; font-weight:700; color:var(--sc-text2);
      }
      .sc-input{
        flex:1; min-width:0; border:0; background:transparent; color:var(--sc-ink);
        padding:.625rem .875rem; font-size:.9375rem; font-weight:700; font-family:inherit; text-align:start;
      }
      .sc-input-big{ font-size:1.375rem; font-weight:800; padding:.75rem .875rem; }
      .sc-input::placeholder{ color:var(--sc-text3); font-weight:500; }
      .sc-input:focus-visible{ outline:none; }
      .sc-disabled{ opacity:.6; }
      .sc-select{
        cursor:pointer; color-scheme:light dark;
        background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23FF5B04' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat:no-repeat; background-position:left .875rem center; padding-left:2.5rem;
        appearance:none; -webkit-appearance:none; text-overflow:ellipsis;
      }
      .sc-select option{ background:var(--sc-surface); color:var(--sc-ink); }

      /* Amber helpers */
      .sc-help-amber{
        display:flex; gap:.5rem; align-items:flex-start; color:var(--f-amber-tx); background:var(--f-amber-bg);
        padding:.625rem .875rem; border-radius:var(--sc-r-sm); border:1px solid var(--f-amber-bd);
      }
      .sc-help-amber svg{ flex:none; margin-top:.2rem; }
      .sc-note-box{
        padding:1rem 1.25rem; background:var(--f-amber-bg); border-bottom:1px solid var(--f-amber-bd);
        font-size:.875rem; line-height:1.7; color:var(--f-amber-tx); display:flex; align-items:flex-start; gap:.625rem;
      }
      .sc-note-box .sc-ico{ color:inherit; }

      /* Result panel */
      .sc-result{
        position:relative; overflow:hidden; background:var(--sc-gloss); color:var(--sc-on); border-radius:var(--sc-r);
        padding:1.5rem 1.25rem; display:grid; gap:1rem; box-shadow:var(--sc-gloss-shadow);
      }
      .sc-result::before{
        content:""; position:absolute; inset:0 0 58% 0; pointer-events:none;
        background:linear-gradient(180deg,rgba(255,255,255,.34),rgba(255,255,255,0));
      }
      .sc-result > *{ position:relative; }
      .sc-result .sc-ltr{ max-width:100%; }
      .sc-result-label{ margin:0; font-size:.9375rem; font-weight:800; }
      .sc-big{ margin:0; font-size:2.5rem; font-weight:800; line-height:1.15; overflow-wrap:anywhere; }
      .sc-stats{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.625rem; }
      .sc-stat{ border:1.5px solid rgba(13,13,13,.55); border-radius:18px; padding:.75rem .5rem; text-align:center; background:rgba(255,255,255,.14); }
      .sc-stat p{ margin:0; font-size:.8125rem; font-weight:700; }
      .sc-stat strong{ font-size:.9375rem; font-weight:800; overflow-wrap:anywhere; }
      .sc-barbox{ background:#0D0D0D; color:#F5F5F2; border-radius:18px; padding:.875rem; display:grid; gap:.5rem; }
      .sc-track{ height:.75rem; border-radius:999px; background:#2E2E2B; overflow:hidden; }
      .sc-fill{ height:100%; background:var(--sc-gloss); border-radius:999px; transition:width .35s ease; }
      .sc-bar-text{ margin:0; font-size:.875rem; font-weight:700; }
      .sc-actions{ display:flex; gap:.5rem; }
      .sc-btn{
        flex:1; min-height:3rem; padding:.5rem .75rem; background:#0D0D0D; color:#FFFFFF; border:1.5px solid #0D0D0D;
        border-radius:var(--sc-r-sm); font-size:.9375rem; font-weight:800; font-family:inherit; cursor:pointer;
        display:inline-flex; align-items:center; justify-content:center; gap:.5rem; transition:background-color .15s, color .15s;
      }
      .sc-btn:hover{ background:transparent; color:#0D0D0D; }
      .sc-result :focus-visible{ outline:3px solid #0D0D0D; outline-offset:3px; }

      /* Payslip */
      .sc-slip-head{ display:flex; align-items:center; gap:.75rem; padding:1rem 1.25rem; border-bottom:1px solid var(--sc-line); }
      .sc-slip-title{ margin:0; font-size:1.0625rem; font-weight:800; }
      .sc-block{ padding:1rem 1.25rem; border-bottom:1px solid var(--sc-line); display:grid; gap:.5rem; }
      .sc-block-title{ margin:0; font-size:.9375rem; font-weight:800; display:flex; gap:.5rem; align-items:center; }
      .sc-mark{
        width:1.75rem; height:1.75rem; flex:none; display:inline-flex; align-items:center; justify-content:center;
        border-radius:10px; background:#0D0D0D; color:#FF7A33;
      }
      @media (prefers-color-scheme:dark){ .sc-mark{ background:#2A2A27; } }
      .sc-employer-block{ background:var(--f-soft); }
      .sc-employer-header{ display:flex; align-items:center; justify-content:space-between; gap:.5rem; flex-wrap:wrap; }
      .sc-employer-badge{
        font-size:.75rem; font-weight:800; padding:.25rem .625rem; border-radius:999px;
        background:color-mix(in srgb,var(--sc-orange) 16%,transparent); color:var(--sc-orange); border:1px solid color-mix(in srgb,var(--sc-orange) 40%,transparent);
      }
      .sc-dl{ margin:0; display:grid; }
      .sc-dl-row{
        display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap; padding:.5rem 0;
        border-bottom:1px solid var(--sc-line); font-size:.9375rem; line-height:1.6;
      }
      .sc-dl-row dt{ margin:0; color:var(--sc-text2); font-size:.9375rem; }
      .sc-dl-row dd{ margin:0; font-weight:800; font-size:.9375rem; }
      .sc-dl-flat{ border-bottom:0; }
      .sc-dl-total{ border-bottom:0; border-top:1.5px dashed var(--sc-text3); margin-top:.25rem; padding-top:.625rem; }
      .sc-dl-total dt{ color:var(--sc-ink); font-weight:800; }
      .sc-ded{ display:grid; gap:.125rem; }
      .sc-mini{ height:.5rem; border-radius:999px; background:var(--f-soft); border:1px solid var(--sc-line); overflow:hidden; }
      .sc-mini-fill{ height:100%; background:var(--sc-gloss); border-radius:999px; }

      .sc-net{
        position:relative; display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;
        padding:1.125rem 1.25rem; background:var(--sc-gloss); color:var(--sc-on); font-size:1.0625rem;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.45);
      }
      .sc-net span,.sc-net strong{ font-weight:800; }
      .sc-eff{ padding:1.25rem; text-align:center; }
      .sc-eff p{ margin:0; font-size:.875rem; color:var(--sc-text2); }
      .sc-eff strong{ display:block; font-size:1.875rem; font-weight:800; margin:.125rem 0; }

      /* Quick comparison */
      .sc-quick{ border:1px dashed var(--sc-text3); border-radius:var(--sc-r); padding:1.125rem 1.25rem; display:grid; gap:.5rem; background:var(--f-soft); }
      .sc-quick-title{ margin:0; font-size:1rem; font-weight:800; }
      .sc-dl-plain .sc-dl-row{ padding:.25rem 0; }

      /* Disclaimer */
      .sc-disclaimer{
        margin:2rem 0 0; padding:.875rem 1rem; border:1px dashed var(--sc-text3); border-radius:var(--sc-r-sm);
        display:flex; gap:.625rem; align-items:flex-start; font-size:.875rem; line-height:1.8; color:var(--sc-text2);
      }

      @media (max-width:420px){
        .sc-big{ font-size:2.125rem; }
        .sc-stat strong{ font-size:.875rem; }
      }
      @media (prefers-reduced-motion:reduce){ .sc-root *{ transition:none !important; } .sc-country:hover{ transform:none; } }

      /* Print: results only, plain black on white */
      @media print{
        .sc-noprint{ display:none !important; }
        .sc-root{ color:#000; padding:0; }
        .sc-grid{ grid-template-columns:minmax(0,1fr); }
        .sc-sticky{ position:static; }
        .sc-result,.sc-net,.sc-tile,.sc-mini-fill,.sc-fill{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        .sc-card,.sc-disclaimer,.sc-quick{ border-color:#000; color:#000; background:#fff; box-shadow:none; }
        .sc-dl-row dt,.sc-disclaimer,.sc-eff p{ color:#000; }
      }
    `}</style>
  );
}