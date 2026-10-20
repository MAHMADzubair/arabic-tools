"use client";

/**
 * components/SalaryCalculator.jsx
 * Ink & Signal: net salary calculator.
 * Compliant with Saudi GOSI legislation (including new Social Insurance Law 2024+
 * and SANED regulations) while preserving identical calculations and layout for
 * UAE, Egypt, Pakistan, UK, and US.
 *
 * Sprint 6C fixes:
 * — UK: corrected income-tax bands (England/Wales/NI assumption), NI two-tier rates
 *        (8% PT→UEL, 2% above UEL), removed double Personal Allowance deduction.
 *        Source: HMRC gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
 * — US: updated to 2026 federal tax brackets and standard deduction ($16,100 single),
 *        SS wage base $184,500, separated SS (6.2%) and Medicare (1.45% uncapped),
 *        additional Medicare 0.9% above $200k/yr.
 *        Source: IRS.gov/taxtopics/tc751 and IRS Rev. Proc. 2025-xx (2026 inflation adj.)
 * — EG: updated to 2026 tax brackets (Law 91/2005 as amended by Law 7/2024),
 *        personal exemption EGP 20,000/yr, social insurance cap EGP 16,700/month
 *        (NOSI annual +15% per Law 148/2019).
 *        Sources: Egyptian Tax Authority, NOSI (nosi.gov.eg), PwC Egypt 2026 guide.
 *        FINDING: Labour Law 14/2025 gratuity provisions — UNVERIFIED for payroll
 *        withholding impact; Egyptian gratuity is not deducted from salary here.
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
    taxName: "ضريبة الدخل", socialName: "التأمين الاجتماعي (NOSI)",
    hasTax: true,
    // Social insurance (Law 148/2019, NOSI): 11% employee, capped at EGP 16,700/month (2026)
    socialRate: 0.11, socialCap: 16700,
    allowances: { housing: 0.20, transport: 500, food: 300 },
    // Personal exemption: EGP 20,000/yr = ~EGP 1,666.67/month (Law 91/2005 Art.13, as amended)
    personalExemptionAnnual: 20000,
    // Annual tax brackets applied to (annual gross - social_insurance_annual - personal_exemption)
    // Source: Egyptian Tax Authority / PwC Egypt 2026; Law 91/2005 as amended by Law 7/2024
    annualBrackets: [
      { limit: 40000,   rate: 0 },
      { limit: 55000,   rate: 0.10 },
      { limit: 70000,   rate: 0.15 },
      { limit: 200000,  rate: 0.20 },
      { limit: 400000,  rate: 0.225 },
      { limit: 1200000, rate: 0.25 },
      { limit: Infinity,rate: 0.275 },
    ],
    note: "شرائح ضريبية مصر 2026 — قانون 91/2005 معدلاً بقانون 7/2024. الإعفاء الشخصي 20,000 جنيه سنوياً."
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
    /*
     * UK — England, Wales & Northern Ireland assumption.
     * Scotland has different bands (Starter 19%, Basic 20%, Intermediate 21%,
     * Higher 42%, Advanced 45%, Top 48%) and is NOT covered by these figures.
     * Source: HMRC gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
     * Tax year: 6 Apr 2026 – 5 Apr 2027.
     */
    id: "gb", code: "GB", name: "المملكة المتحدة", currency: "GBP", symbol: "£",
    taxName: "ضريبة الدخل (إنجلترا/ويلز/أيرلندا الشمالية)", socialName: "التأمين الوطني (NI Class 1)",
    hasTax: true,
    allowances: { housing: 0, transport: 0, food: 0 },
    // Personal Allowance (annual): £12,570. Taper: -£1 for every £2 above £100,000 adjusted net income.
    personalAllowanceAnnual: 12570,
    paFullTaperAt: 125140, // PA = 0 at £125,140+
    paTaperStart: 100000,
    // Income tax bands apply to (annual gross - effective personal allowance)
    // Bands are widths of taxable income above 0 (i.e., above the PA-reduced base)
    // Basic rate: first £37,700 of taxable income (£12,571–£50,270 gross)
    // Higher rate: next £74,870 (£50,271–£125,140 gross)
    // Additional rate: above £125,140 gross
    annualBrackets: [
      { limit: 37700,  rate: 0.20 }, // Basic rate
      { limit: 112570, rate: 0.40 }, // Higher rate (37700 + 74870)
      { limit: Infinity, rate: 0.45 },// Additional rate
    ],
    // National Insurance (Class 1 employee, category A) 2026-27:
    // 0%  : earnings up to Primary Threshold (£12,570/yr = £1,048/month)
    // 8%  : earnings above PT up to Upper Earnings Limit (£50,270/yr = £4,189/month)
    // 2%  : earnings above UEL
    niPrimaryThresholdAnnual: 12570,
    niUpperEarningsLimitAnnual: 50270,
    niRateMain: 0.08,
    niRateAboveUEL: 0.02,
    note: "إنجلترا/ويلز/أيرلندا الشمالية فقط — اسكتلندا لها شرائح مختلفة. ضريبة الدخل + NI 2026-27 (HMRC)."
  },
  {
    /*
     * US — Federal only (single filer assumption). State/local taxes not included.
     * Source: IRS.gov/taxtopics/tc751 (SS & Medicare rates)
     *         IRS Rev. Proc. 2025 (2026 inflation-adjusted brackets & standard deduction)
     * SS employee rate: 6.2% up to $184,500 wage base (2026)
     * Medicare employee rate: 1.45% on ALL wages (no wage cap)
     * Additional Medicare: 0.9% on wages above $200,000 for single filers
     * Federal standard deduction (single, 2026): $16,100
     */
    id: "us", code: "US", name: "الولايات المتحدة", currency: "USD", symbol: "$",
    taxName: "ضريبة الدخل الفيدرالية (Single Filer)", socialName: "الضمان الاجتماعي + Medicare (فيدرالي)",
    hasTax: true,
    allowances: { housing: 0, transport: 0, food: 0 },
    // Standard deduction 2026 (single filer): $16,100
    standardDeductionAnnual: 16100,
    // Federal income tax brackets 2026 — single filer (taxable income after std deduction)
    // Source: IRS inflation-adjusted figures for 2026 tax year
    annualBrackets: [
      { limit: 12400,  rate: 0.10 },
      { limit: 50400,  rate: 0.12 },
      { limit: 105700, rate: 0.22 },
      { limit: 201775, rate: 0.24 },
      { limit: 256225, rate: 0.32 },
      { limit: 640600, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ],
    // Social Security: 6.2% employee rate, $184,500 annual wage base (2026, IRS/SSA)
    ssRate: 0.062,
    ssWageBaseAnnual: 184500,
    // Medicare: 1.45% employee rate, no wage cap
    medicareRate: 0.0145,
    // Additional Medicare Tax: 0.9% on wages above $200,000 (single filer)
    additionalMedicareRate: 0.009,
    additionalMedicareThresholdAnnual: 200000,
    note: "فيدرالي فقط — ضريبة الدخل الفيدرالية (Single Filer 2026) + SS 6.2% (حد $184,500) + Medicare 1.45%. لا تشمل ضرائب الولايات."
  },
];

/* ─── Tax Calculation Helpers ───────────────────────────────────────────── */

/**
 * Apply progressive annual brackets to a taxable annual amount.
 * Brackets are cumulative upper limits of taxable income (not gross).
 * Returns annual tax amount.
 */
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

/**
 * Calculate monthly income tax for Pakistan (monthly brackets as before).
 * Pakistan brackets are monthly limits applied directly.
 */
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

/**
 * UK Income Tax (England/Wales/NI) — 2026-27.
 * @param {number} annualGross  Annual gross employment income.
 * @param {object} country      GB country config.
 * @returns {number} Annual income tax.
 *
 * Algorithm:
 *   1. Compute effective Personal Allowance (tapers £1 per £2 above £100,000).
 *   2. Taxable income = annualGross − effectivePA (≥ 0).
 *   3. Apply annualBrackets (widths, not cumulative limits) to taxable income.
 */
function calcUKIncomeTax(annualGross, country) {
  // 1. Personal Allowance taper
  let pa = country.personalAllowanceAnnual; // £12,570
  if (annualGross > country.paTaperStart) {
    const excess = annualGross - country.paTaperStart;
    pa = Math.max(0, pa - Math.floor(excess / 2));
  }
  // 2. Taxable income
  const taxable = Math.max(0, annualGross - pa);
  // 3. Apply brackets (annualBrackets store cumulative upper limits of taxable income)
  return applyAnnualBrackets(taxable, country.annualBrackets);
}

/**
 * UK Employee National Insurance (Class 1 A, 2026-27).
 * @param {number} annualGross  Annual gross employment income.
 * @param {object} country      GB country config.
 * @returns {number} Annual employee NI.
 *
 * Rates:
 *   0%  on earnings ≤ Primary Threshold (£12,570/yr)
 *   8%  on earnings > PT up to Upper Earnings Limit (£50,270/yr)
 *   2%  on earnings > UEL
 */
function calcUKNI(annualGross, country) {
  const pt  = country.niPrimaryThresholdAnnual;   // £12,570
  const uel = country.niUpperEarningsLimitAnnual;  // £50,270
  let ni = 0;
  // Band PT→UEL at 8%
  if (annualGross > pt) {
    ni += (Math.min(annualGross, uel) - pt) * country.niRateMain;
  }
  // Band above UEL at 2%
  if (annualGross > uel) {
    ni += (annualGross - uel) * country.niRateAboveUEL;
  }
  return Math.max(0, ni);
}

/**
 * US Federal Payroll Taxes (2026 — single filer).
 * Returns { federalTax, ss, medicare, total } — all annual.
 * @param {number} annualGross  Annual gross employment income.
 * @param {object} country      US country config.
 */
function calcUSPayroll(annualGross, country) {
  // Social Security: 6.2% up to $184,500 wage base
  const ssBase = Math.min(annualGross, country.ssWageBaseAnnual);
  const ss = ssBase * country.ssRate;

  // Medicare: 1.45% on ALL wages (no cap)
  const medicare = annualGross * country.medicareRate;

  // Additional Medicare: 0.9% above $200,000
  const additionalMedicare = annualGross > country.additionalMedicareThresholdAnnual
    ? (annualGross - country.additionalMedicareThresholdAnnual) * country.additionalMedicareRate
    : 0;

  // Federal income tax: apply brackets to (annualGross - standard deduction)
  const taxable = Math.max(0, annualGross - country.standardDeductionAnnual);
  const federalTax = applyAnnualBrackets(taxable, country.annualBrackets);

  return {
    federalTax,
    ss,
    medicare: medicare + additionalMedicare,
    total: federalTax + ss + medicare + additionalMedicare,
  };
}

/**
 * Egypt Income Tax (Law 91/2005 as amended, 2026).
 * @param {number} annualGross        Annual gross employment income (EGP).
 * @param {number} annualSocialInsurance  Annual employee social insurance deduction.
 * @param {object} country            EG country config.
 * @returns {number} Annual income tax.
 *
 * Taxable = annualGross - annualSocialInsurance - personalExemption(20,000)
 */
function calcEGIncomeTax(annualGross, annualSocialInsurance, country) {
  const taxable = Math.max(0, annualGross - annualSocialInsurance - country.personalExemptionAnnual);
  return applyAnnualBrackets(taxable, country.annualBrackets);
}

/**
 * Generic monthly social insurance (SA legacy path, EG, PK EOBI).
 */
function calcSocial(monthlyGross, country) {
  if (country.socialFixed) return country.socialFixed;
  if (!country.socialRate) return 0;
  const base = country.socialCap ? Math.min(monthlyGross, country.socialCap) : monthlyGross;
  return base * country.socialRate;
}

const nn = (v) => Math.max(0, Number(v) || 0);

/** Keeps signs / digits / % in a stable left-to-right order inside RTL text. */
function Num({ children }) {
  return <span className="sc-ltr">{children}</span>;
}

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  sym,
  placeholder = "0",
  big = false,
  type = "number",
  min = "0",
  max,
  disabled = false,
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
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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

  // Saudi GOSI specific state
  const [employeeCategory, setEmployeeCategory] = useState("legacy"); // "legacy" | "new" | "expat" | "gcc"
  const [contributionDate, setContributionDate] = useState(() => {
    // Current date in YYYY-MM-DD
    const now = new Date();
    return now.toISOString().substring(0, 10);
  });
  const [period, setPeriod] = useState("monthly"); // monthly | annual
  const [housingValuationMode, setHousingValuationMode] = useState("cash"); // "cash" | "inKind" | "none"
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

    // For Saudi Arabia: cash housing adds to bank cash earnings.
    // In-kind housing provides accommodation directly (not added as bank cash),
    // but its statutory value (basic / 6) enters the GOSI contribution base.
    const effectiveCashHousing = country.id === "sa"
      ? (housingValuationMode === "cash" ? housing : 0)
      : housing;

    const transport = nn(transportAllowance);
    const food = nn(foodAllowance);
    const other = nn(otherAllowances);
    const totalAllowances = effectiveCashHousing + transport + food + other;
    const totalGross = gross + totalAllowances;

    // Saudi-specific GOSI handling
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
      incomeTax = 0; // No income tax in Saudi Arabia

    } else if (country.id === "gb") {
      // ── UK: income tax + NI calculated annually, divided to monthly ──────
      // Gross used for UK tax = monthly gross × 12 (allowances not included in
      // UK PAYE calculations as they are employer supplements here).
      const annualGross = gross * 12;
      const annualTax = calcUKIncomeTax(annualGross, country);
      const annualNI  = calcUKNI(annualGross, country);
      incomeTax = annualTax / 12;
      const monthlyNI = annualNI / 12;
      gosi = {
        employeeTotal: monthlyNI,
        employerTotal: 0,
        employeeBreakdown: monthlyNI > 0 ? [{ label: country.socialName, value: monthlyNI }] : [],
        employerBreakdown: [],
        breakdown: monthlyNI > 0 ? [{ label: country.socialName, value: monthlyNI }] : [],
      };

    } else if (country.id === "us") {
      // ── US: federal income tax + SS + Medicare calculated annually ────────
      const annualGross = gross * 12;
      const usPayroll  = calcUSPayroll(annualGross, country);
      incomeTax = usPayroll.federalTax / 12;
      const monthlySocial = (usPayroll.ss + usPayroll.medicare) / 12;
      const socialBreakdown = [
        { label: "الضمان الاجتماعي (SS 6.2%)", value: usPayroll.ss / 12 },
        { label: "Medicare (1.45%+)", value: usPayroll.medicare / 12 },
      ].filter(b => b.value > 0);
      gosi = {
        employeeTotal: monthlySocial,
        employerTotal: 0,
        employeeBreakdown: socialBreakdown,
        employerBreakdown: [],
        breakdown: socialBreakdown,
      };

    } else if (country.id === "eg") {
      // ── Egypt: social insurance (monthly, capped at EGP 16,700), then tax ─
      const monthlySI = calcSocial(gross, country); // 11% capped at 16,700
      const annualGross = gross * 12;
      const annualSI    = monthlySI * 12;
      const annualTax   = calcEGIncomeTax(annualGross, annualSI, country);
      incomeTax = annualTax / 12;
      gosi = {
        employeeTotal: monthlySI,
        employerTotal: 0,
        employeeBreakdown: monthlySI > 0 ? [{ label: country.socialName, value: monthlySI }] : [],
        employerBreakdown: [],
        breakdown: monthlySI > 0 ? [{ label: country.socialName, value: monthlySI }] : [],
      };

    } else {
      // ── Generic path: Pakistan and any future additions ───────────────────
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
      employeeBreakdown: (gosi.employeeBreakdown || []).map((item) => ({
        label: item.label,
        value: item.value * mult,
      })),
      employerBreakdown: (gosi.employerBreakdown || []).map((item) => ({
        label: item.label,
        value: item.value * mult,
      })),
      gosiNote: gosi.note,
      contributoryWage: (gosi.contributoryWage || 0) * mult,
    };
  }, [
    country,
    grossSalary,
    housingAllowance,
    transportAllowance,
    foodAllowance,
    otherAllowances,
    otherDeductions,
    period,
    employeeCategory,
    contributionDate,
    housingValuationMode,
    employeeAge,
  ]);

  const sym = country?.symbol || "";

  function fmt(n) {
    return `${sym} ${Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // Employee deductions only: ensure employer contributions are NEVER placed under employee salary deductions!
  const deductionItems = result
    ? [
      { label: country?.taxName || "ضريبة الدخل", value: result.incomeTax },
      ... (result.employeeBreakdown || []),
      { label: "خصومات أخرى", value: result.extraDeductions },
    ]
    : [];

  const netPct = result ? Math.min(100, Math.max(0, 100 - result.effectiveTaxRate)) : 0;
  const housingPct = country?.allowances?.housing;
  const housingHint =
    housingPct > 0 && housingPct < 1 ? `متعارف عليه: ${Math.round(housingPct * 100)}%` : "";

  const allowanceFields = [
    {
      id: "sc-transport",
      label: "بدل النقل",
      value: transportAllowance,
      setter: setTransportAllowance,
      hint: "",
    },
    {
      id: "sc-food",
      label: "بدل الطعام",
      value: foodAllowance,
      setter: setFoodAllowance,
      hint: "",
    },
    {
      id: "sc-other",
      label: "بدلات أخرى",
      value: otherAllowances,
      setter: setOtherAllowances,
      hint: "",
    },
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
          {pageDesc || "احسب راتبك الصافي بدقة بعد الضرائب والتأمينات الاجتماعية والبدلات."}
        </p>
      </header>

      <div className="sc-grid">
        {/* ─── Inputs ─── */}
        <div className="sc-col sc-noprint">
          {/* 1. Country & GOSI Category */}
          <section className="sc-card" aria-labelledby="sc-s1">
            <h2 id="sc-s1" className="sc-h2">
              <span className="sc-num" aria-hidden="true">1</span>
              الدولة / نظام الضرائب والتأمينات
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

            {/* Saudi Arabia GOSI Controls */}
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
                    {
                      value: "legacy",
                      label: "مواطن سعودي — النظام السابق (مستمر قبل 3 يوليو 2024 / معاشات 9% + ساند 0.75%)",
                    },
                    {
                      value: "new",
                      label: "مواطن سعودي — النظام الجديد (ملتحق بعد 3 يوليو 2024 / تدرج معاشات 9% إلى 11%)",
                    },
                    {
                      value: "expat",
                      label: "مقيم غير سعودي (وافد — أخطار مهنية 2% على المنشأة فقط دون خصم من الراتب)",
                    },
                    {
                      value: "gcc",
                      label: "مواطن خليجي (GCC — نظام مد الحماية التأمينية)",
                    },
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
            <div className="sc-title-row">
              <h2 id="sc-s2" className="sc-h2">
                <span className="sc-num" aria-hidden="true">2</span>
                الراتب الأساسي
              </h2>
              <div className="sc-seg" role="group" aria-label="فترة العرض">
                <button
                  type="button"
                  aria-pressed={period === "monthly"}
                  onClick={() => setPeriod("monthly")}
                >
                  شهري
                </button>
                <button
                  type="button"
                  aria-pressed={period === "annual"}
                  onClick={() => setPeriod("annual")}
                >
                  سنوي
                </button>
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

          {/* 3. Allowances */}
          <section className="sc-card" aria-labelledby="sc-s3">
            <h2 id="sc-s3" className="sc-h2">
              <span className="sc-num" aria-hidden="true">3</span>
              البدلات الشهرية
            </h2>

            {countryId === "sa" && (
              <div className="sc-housing-mode-wrap">
                <SelectField
                  id="sc-housing-mode"
                  label="طريقة احتساب بدل السكن"
                  hint="يدخل بدل السكن في وعاء احتساب اشتراك التأمينات الاجتماعية (GOSI)"
                  value={housingValuationMode}
                  onChange={setHousingValuationMode}
                  options={[
                    {
                      value: "cash",
                      label: "بدل سكن نقدي (يُدفع في الحساب البنكي ويخضع للتأمينات)",
                    },
                    {
                      value: "inKind",
                      label: "سكن عيني موفر من المنشأة (يُقدّر للتأمينات بأجر شهرين سنوياً)",
                    },
                    {
                      value: "none",
                      label: "لا يوجد بدل سكن (الراتب الأساسي فقط يخضع للتأمينات)",
                    },
                  ]}
                />
                {housingValuationMode === "inKind" && (
                  <p className="sc-help sc-help-amber">
                    ℹ السكن العيني يُحتسب للتأمينات بقيمة (الأساسي ÷ 6 = {fmt(nn(grossSalary) / 6)} شهرياً) ولا يُضاف كحوالة نقدية لراتبك البنكي.
                  </p>
                )}
              </div>
            )}

            <div className="sc-two">
              {/* Render cash housing input when applicable */}
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
                  hint={f.hint}
                  value={f.value}
                  onChange={f.setter}
                  sym={sym}
                />
              ))}
            </div>
          </section>

          {/* 4. Extra deductions */}
          <section className="sc-card" aria-labelledby="sc-s4">
            <h2 id="sc-s4" className="sc-h2">
              <span className="sc-num" aria-hidden="true">4</span>
              خصومات إضافية شهرية
            </h2>
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

              {/* Earnings */}
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

              {/* Deductions: ONLY actual employee salary deductions */}
              <div className="sc-block">
                <p className="sc-block-title"><span aria-hidden="true">−</span> الخصومات من الراتب</p>
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

              {/* Employer Contributions: clearly separated, NOT deducted from employee */}
              {result.employerBreakdown && result.employerBreakdown.length > 0 && result.employerTotal > 0 && (
                <div className="sc-block sc-employer-block">
                  <div className="sc-employer-header">
                    <p className="sc-block-title">
                      <span aria-hidden="true">🏢</span> مساهمات المنشأة (صاحب العمل)
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

              {/* GCC or other official note */}
              {result.gosiNote && (
                <div className="sc-note-box" role="status">
                  <span className="sc-tag" aria-hidden="true">i</span>
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
        <span className="sc-tag" aria-hidden="true">!</span>
        <span>
          <span className="sc-sr">تنبيه: </span>
          الأرقام تقديرية للأغراض التخطيطية والاسترشادية فقط. تختلف الخصومات الفعلية بحسب تاريخ التسجيل بالتأمينات والتصنيف النظامي للمنشأة والبدلات المسجلة في عقد العمل الموثق.
        </span>
      </p>
    </div>
  );
}

/**
 * Local styles, built only on the global Ink & Signal tokens from app/layout.js
 * (--bg, --surface, --border, --text, --text-2, --text-3, --orange*, --on-orange).
 * Fallbacks equal the light values so the component also works standalone.
 */
function SalaryStyles() {
  return (
    <style>{`
      .sc-root{
        --sc-ink:var(--text,#0D0D0D); --sc-text2:var(--text-2,#555555); --sc-text3:var(--text-3,#6B6B66);
        --sc-surface:var(--surface,#FFFFFF); --sc-bg:var(--bg,#F5F5F2); --sc-line:var(--border,#D4D4CE);
        --sc-orange:var(--orange,#FF5B04); --sc-orange-hover:var(--orange-hover,#FF7A33); --sc-on:var(--on-orange,#0D0D0D);
        max-width:64rem; margin:0 auto; padding:2rem 1rem; color:var(--sc-ink);
      }
      @media (min-width:640px){ .sc-root{ padding:3rem 1.5rem; } }

      .sc-ltr{ direction:ltr; unicode-bidi:isolate; display:inline-block; }
      .sc-sr{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
      .sc-root :focus-visible{ outline:3px solid var(--sc-ink); outline-offset:2px; }

      /* Header */
      .sc-header{ text-align:center; margin-bottom:2.5rem; display:grid; gap:1rem; justify-items:center; }
      .sc-kicker-tag{ margin:0; padding:.25rem .875rem; border-radius:999px; background:var(--sc-ink); color:var(--sc-bg); font-size:.8125rem; font-weight:700; }
      .sc-h1{ margin:0; font-size:clamp(1.5rem,5vw,2.25rem); font-weight:700; line-height:1.3; }
      .sc-lead{ margin:0; max-width:38rem; font-size:1rem; line-height:1.9; color:var(--sc-text2); }

      .sc-grid{ display:grid; grid-template-columns:minmax(0,1fr); gap:2rem; }
      @media (min-width:1024px){ .sc-grid{ grid-template-columns:minmax(0,3fr) minmax(0,2fr); align-items:start; } }
      .sc-col{ display:grid; gap:1.5rem; min-width:0; }
      @media (min-width:1024px){ .sc-sticky{ position:sticky; top:1rem; } }

      /* Cards */
      .sc-card{ background:var(--sc-surface); border:1px solid var(--sc-line); border-radius:1rem; padding:1.25rem; display:grid; gap:1rem; }
      .sc-card-flush{ padding:0; gap:0; overflow:hidden; }
      .sc-h2{ margin:0; display:flex; align-items:center; gap:.625rem; font-size:1.125rem; font-weight:700; }
      .sc-num{
        flex:none; width:1.875rem; height:1.875rem; display:inline-flex; align-items:center; justify-content:center;
        border-radius:50%; background:var(--sc-ink); color:var(--sc-bg); font-size:.875rem; font-weight:600;
      }
      .sc-title-row{ display:flex; align-items:center; justify-content:space-between; gap:.75rem; flex-wrap:wrap; }
      .sc-two{ display:grid; gap:1rem; grid-template-columns:minmax(0,1fr); }
      @media (min-width:640px){ .sc-two{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
      .sc-help{ margin:0; font-size:.875rem; line-height:1.8; color:var(--sc-text2); }

      /* Country picker */
      .sc-countries{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.625rem; }
      @media (min-width:640px){ .sc-countries{ grid-template-columns:repeat(3,minmax(0,1fr)); } }
      .sc-country{
        display:grid; gap:.125rem; text-align:start; min-height:4.25rem; padding:.625rem .75rem;
        border:1.5px solid var(--sc-text3); border-radius:.75rem; background:var(--sc-surface); color:var(--sc-ink);
        font-family:inherit; cursor:pointer; transition:background-color .15s, border-color .15s;
      }
      .sc-country:hover{ border-color:var(--sc-orange); }
      .sc-country[aria-pressed="true"]{ background:var(--sc-orange); border-color:var(--sc-orange); color:var(--sc-on); }
      .sc-country[aria-pressed="true"]:hover{ background:var(--sc-orange-hover); border-color:var(--sc-orange-hover); }
      .sc-country-top{ display:flex; align-items:center; justify-content:space-between; }
      .sc-code{ border:1.5px solid currentColor; border-radius:.25rem; padding:0 .375rem; font-size:.75rem; font-weight:700; letter-spacing:0; line-height:1.6; }
      .sc-check{ font-weight:700; font-size:1rem; }
      .sc-country-name{ font-size:.9375rem; font-weight:700; line-height:1.5; }
      .sc-sub{ font-size:.8125rem; font-weight:600; line-height:1.5; }
      .sc-country:not([aria-pressed="true"]) .sc-sub{ color:var(--sc-text2); }

      .sc-note-line{
        margin:0; display:flex; gap:.625rem; align-items:flex-start; border-radius:.75rem;
        background:var(--sc-bg); border:1px dashed var(--sc-text3); padding:.75rem; font-size:.875rem; line-height:1.8; color:var(--sc-text2);
      }
      .sc-tag{
        flex:none; width:1.375rem; height:1.375rem; display:inline-flex; align-items:center; justify-content:center;
        border:1.5px solid currentColor; border-radius:50%; font-size:.8125rem; font-weight:700; color:var(--sc-ink);
      }

      /* Saudi GOSI Form Controls */
      .sc-sa-section{
        margin-top:1.25rem; padding-top:1.25rem; border-top:1px solid var(--sc-line);
        display:flex; flex-direction:column; gap:1rem;
      }
      .sc-subhead{ font-size:.875rem; font-weight:700; color:var(--sc-ink); margin:0; }
      .sc-housing-mode-wrap{ margin-bottom:1rem; display:flex; flex-direction:column; gap:.75rem; }

      /* Segmented toggle */
      .sc-seg{ display:flex; border:1.5px solid var(--sc-text3); border-radius:.625rem; overflow:hidden; }
      .sc-seg button{
        min-height:2.75rem; padding:.375rem 1.125rem; border:0; background:var(--sc-surface); color:var(--sc-ink);
        font-size:.9375rem; font-weight:700; font-family:inherit; cursor:pointer;
      }
      .sc-seg button:hover{ background:var(--sc-bg); }
      .sc-seg button + button{ border-inline-start:1.5px solid var(--sc-text3); }
      .sc-seg button[aria-pressed="true"]{ background:var(--sc-ink); color:var(--sc-bg); }

      /* Fields */
      .sc-field{ display:grid; gap:.5rem; align-content:start; min-width:0; }
      .sc-label{ display:flex; justify-content:space-between; gap:.5rem; flex-wrap:wrap; font-size:1rem; font-weight:600; line-height:1.6; }
      .sc-hint{ font-size:.875rem; font-weight:500; color:var(--sc-text2); }
      .sc-input-wrap{ display:flex; min-height:3rem; border:1.5px solid var(--sc-text3); border-radius:.625rem; background:var(--sc-surface); overflow:hidden; }
      .sc-input-wrap:hover{ border-color:var(--sc-ink); }
      .sc-input-wrap:focus-within{ border-color:var(--sc-orange); box-shadow:0 0 0 3px var(--sc-orange); }
      .sc-sym{
        flex:none; padding:0 .875rem; display:inline-flex; align-items:center; background:var(--sc-bg);
        border-inline-end:1.5px solid var(--sc-text3); font-size:.875rem; font-weight:600; color:var(--sc-text2);
      }
      .sc-input{
        flex:1; min-width:0; border:0; background:transparent; color:var(--sc-ink);
        padding:.625rem .875rem; font-size:0.9375rem; font-weight:700; font-family:inherit; text-align:start;
      }
      .sc-input-big{ font-size:1.25rem; font-weight:700; padding:.75rem .875rem; }
      .sc-input::placeholder{ color:var(--sc-text3); font-weight:500; }
      .sc-input:focus-visible{ outline:none; }
      .sc-disabled{ opacity:.6; background:var(--sc-bg); }

      .sc-select{
        cursor:pointer; background-color:var(--sc-surface);
        background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23555555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat:no-repeat; background-position:left 0.75rem center; padding-left:2.25rem;
        appearance:none; -webkit-appearance:none;
      }

      /* Employer block */
      .sc-employer-block{
        margin:0; padding:1rem 1.25rem; background:rgba(13, 13, 13, 0.03);
        border-bottom:1px solid var(--sc-line); display:grid; gap:.5rem;
      }
      .sc-employer-header{ display:flex; align-items:center; justify-content:space-between; gap:.5rem; }
      .sc-employer-badge{ font-size:.75rem; font-weight:700; background:var(--sc-bg); border:1px solid var(--sc-line); color:var(--sc-text2); padding:2px 8px; border-radius:4px; }
      .sc-note-box{
        padding:1rem 1.25rem; background:#FFF7ED; border-bottom:1px solid #FFEDD5;
        font-size:.875rem; line-height:1.6; color:#9A3412; display:flex; align-items:flex-start; gap:.625rem;
      }
      .sc-help-amber{ color:#9A3412; background:#FFFBEB; padding:8px 12px; border-radius:.5rem; border:1px solid #FEF3C7; }

      /* Result panel: always orange with --on-orange text */
      .sc-result{ background:var(--sc-orange); color:var(--sc-on); border-radius:1rem; padding:1.5rem 1.25rem; display:grid; gap:1rem; }
      .sc-result .sc-ltr{ max-width:100%; }
      .sc-result-label{ margin:0; font-size:.9375rem; font-weight:700; }
      .sc-big{ margin:0; font-size:2.5rem; font-weight:700; line-height:1.1; overflow-wrap:anywhere; }
      @media (min-width:640px){ .sc-big{ font-size:2.5rem; } }
      .sc-stats{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.625rem; }
      .sc-stat{ border:1.5px solid var(--sc-on); border-radius:.75rem; padding:.625rem; text-align:center; }
      .sc-stat p{ margin:0; font-size:.875rem; font-weight:600; }
      .sc-stat strong{ font-size:1rem; font-weight:700; }
      .sc-barbox{ background:#FFFFFF; color:#0D0D0D; border-radius:.75rem; padding:.75rem; display:grid; gap:.5rem; }
      .sc-track{ height:.75rem; border-radius:999px; background:#E6E6E1; overflow:hidden; }
      .sc-fill{ height:100%; background:#0D0D0D; border-radius:999px; }
      .sc-bar-text{ margin:0; font-size:.875rem; font-weight:700; }
      .sc-actions{ display:flex; gap:.5rem; }
      .sc-btn{
        flex:1; min-height:2.75rem; padding:.5rem .75rem; background:var(--sc-on); color:#FFFFFF; border:1.5px solid var(--sc-on);
        border-radius:.75rem; font-size:.9375rem; font-weight:700; font-family:inherit; cursor:pointer; transition:background-color .15s, color .15s;
      }
      .sc-btn:hover{ background:transparent; color:var(--sc-on); }
      .sc-result :focus-visible{ outline:3px solid var(--sc-on); outline-offset:3px; }

      /* Payslip */
      .sc-slip-title{ margin:0; padding:1rem 1.25rem; border-bottom:1px solid var(--sc-line); font-size:1rem; font-weight:700; }
      .sc-block{ padding:1rem 1.25rem; border-bottom:1px solid var(--sc-line); display:grid; gap:.5rem; }
      .sc-block-title{ margin:0; font-size:.9375rem; font-weight:700; display:flex; gap:.5rem; align-items:center; }
      .sc-block-title span{
        width:1.5rem; height:1.5rem; display:inline-flex; align-items:center; justify-content:center;
        border-radius:50%; border:1.5px solid currentColor; font-weight:700;
      }
      .sc-dl{ margin:0; display:grid; }
      .sc-dl-row{
        display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap; padding:.5rem 0;
        border-bottom:1px solid var(--sc-line); font-size:.9375rem; line-height:1.6;
      }
      .sc-dl-row dt{ margin:0; color:var(--sc-text2); font-size:1rem; }
      .sc-dl-row dd{ margin:0; font-weight:700; font-size:1rem; }
      .sc-dl-flat{ border-bottom:0; }
      .sc-dl-total{ border-bottom:0; border-top:1.5px solid var(--sc-ink); margin-top:.25rem; padding-top:.625rem; font-size:1rem; }
      .sc-dl-total dt{ color:var(--sc-ink); font-weight:700; }
      .sc-ded{ display:grid; gap:.125rem; }
      .sc-mini{ height:.5rem; border-radius:999px; background:var(--sc-bg); overflow:hidden; }
      .sc-mini-fill{ height:100%; background:var(--sc-ink); border-radius:999px; }

      .sc-net{
        display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;
        padding:1rem 1.25rem; background:var(--sc-orange); color:var(--sc-on); font-size:1.0625rem;
      }
      .sc-net span,.sc-net strong{ font-weight:700; }
      .sc-eff{ padding:1rem 1.25rem; text-align:center; }
      .sc-eff p{ margin:0; font-size:.875rem; color:var(--sc-text2); }
      .sc-eff strong{ display:block; font-size:1.75rem; font-weight:700; margin:.125rem 0; }

      /* Quick comparison */
      .sc-quick{ border:1px dashed var(--sc-text3); border-radius:1rem; padding:1rem 1.25rem; display:grid; gap:.5rem; }
      .sc-quick-title{ margin:0; font-size:1rem; font-weight:700; }
      .sc-dl-plain .sc-dl-row{ padding:.25rem 0; }

      /* Disclaimer */
      .sc-disclaimer{
        margin:2rem 0 0; padding:.875rem 1rem; border:1px dashed var(--sc-text3); border-radius:.75rem;
        display:flex; gap:.625rem; align-items:flex-start; font-size:.875rem; line-height:1.8; color:var(--sc-text2);
      }

      @media (prefers-reduced-motion:reduce){ .sc-root *{ transition:none !important; } }

      /* Print: results only, plain black on white */
      @media print{
        .sc-noprint{ display:none !important; }
        .sc-root{ color:#000; padding:0; }
        .sc-grid{ grid-template-columns:minmax(0,1fr); }
        .sc-sticky{ position:static; }
        .sc-result,.sc-net{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        .sc-card,.sc-disclaimer,.sc-quick{ border-color:#000; color:#000; background:#fff; }
        .sc-dl-row dt,.sc-disclaimer,.sc-eff p{ color:#000; }
      }
    `}</style>
  );
}