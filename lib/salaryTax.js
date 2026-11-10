/**
 * lib/salaryTax.js
 * Country tax and social-insurance rules for components/SalaryCalculator.jsx.
 * Kept outside the component so tests run against the real code.
 * Saudi GOSI lives in lib/gosiEngine.js.
 *
 * Sources checked Nov 2026:
 * - Egypt: Income Tax Law 91/2005 as amended by Law 7/2024 (brackets, EGP 20,000 personal
 *   exemption, loss of lower brackets above EGP 600,000); Social Insurance Law 148/2019,
 *   employee 11% on the insurable wage, EGP 2,700 floor and EGP 16,700 cap from Jan 2026 (NOSI).
 * - Pakistan: Finance Act 2026 salaried slabs for tax year 2027 (1 Jul 2026 - 30 Jun 2027),
 *   surcharge abolished; EOBI employee share 1% of the minimum wage (varies by province).
 * - UK: HMRC 2026-27 (England, Wales, NI). US: IRS Rev. Proc. 2025-32, SSA 2026 wage base.
 */

export const COUNTRIES = [
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
    note: "لا توجد ضريبة دخل على الرواتب في الإمارات. للمواطنين الإماراتيين اشتراك تقاعد يُقتطع من الراتب ولا تحسبه هذه الحاسبة.",
  },
  {
    id: "eg", code: "EG", name: "مصر", currency: "EGP", symbol: "ج.م",
    taxName: "ضريبة الدخل", socialName: "التأمين الاجتماعي (NOSI)",
    hasTax: true,
    // Law 148/2019 (NOSI): 11% employee on the insurable wage, EGP 2,700 floor, 16,700 cap (Jan 2026)
    socialRate: 0.11, socialCap: 16700, socialFloor: 2700,
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
    note: "شرائح ضريبة كسب العمل — قانون 91/2005 معدلاً بالقانون 7/2024: إعفاء شخصي 20,000 جنيه سنوياً، ويفقد صاحب الدخل الخاضع فوق 600,000 جنيه الشرائح الأدنى. التأمينات 11% من أجر الاشتراك (2,700 إلى 16,700 جنيه).",
  },
  {
    id: "pk", code: "PK", name: "باكستان", currency: "PKR", symbol: "₨",
    taxName: "ضريبة الدخل", socialName: "EOBI",
    hasTax: true, socialRate: 0, socialFixed: 400, socialCap: 0,
    allowances: { housing: 0.45, transport: 0.10, food: 0 },
    // Finance Act 2026, salaried individuals, tax year 2027 (annual taxable income)
    annualBrackets: [
      { limit: 600000, rate: 0 },
      { limit: 1200000, rate: 0.01 },
      { limit: 2200000, rate: 0.11 },
      { limit: 3200000, rate: 0.20 },
      { limit: 4100000, rate: 0.25 },
      { limit: 5600000, rate: 0.29 },
      { limit: 7000000, rate: 0.32 },
      { limit: Infinity, rate: 0.35 },
    ],
    note: "شرائح الرواتب 2026-27 (قانون المالية 2026، من 1 يوليو 2026) وأُلغيت الضريبة الإضافية. EOBI نحو 1% من الحد الأدنى للأجور (حوالي 400 روبية) ويختلف حسب الإقليم.",
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

export function applyAnnualBrackets(taxableAnnual, brackets) {
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

export function calcUKIncomeTax(annualGross, country) {
  let pa = country.personalAllowanceAnnual;
  if (annualGross > country.paTaperStart) {
    const excess = annualGross - country.paTaperStart;
    pa = Math.max(0, pa - Math.floor(excess / 2));
  }
  const taxable = Math.max(0, annualGross - pa);
  return applyAnnualBrackets(taxable, country.annualBrackets);
}

export function calcUKNI(annualGross, country) {
  const pt = country.niPrimaryThresholdAnnual;
  const uel = country.niUpperEarningsLimitAnnual;
  let ni = 0;
  if (annualGross > pt) ni += (Math.min(annualGross, uel) - pt) * country.niRateMain;
  if (annualGross > uel) ni += (annualGross - uel) * country.niRateAboveUEL;
  return Math.max(0, ni);
}

export function calcUSPayroll(annualGross, country) {
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

/**
 * Egypt (Law 7/2024): above EGP 600,000 of annual net taxable income the lower brackets
 * fall away. 600-700k: no 0% band (first 55k at 10%); 700-800k: first 70k at 15%;
 * 800-900k: first 200k at 20%; 900k-1.2m: first 400k at 22.5%; above 1.2m: first 1.2m at 25%.
 */
export function egyptBracketsFor(taxableAnnual, brackets) {
  const t = taxableAnnual;
  let start;
  if (t <= 600000) return brackets;
  if (t <= 700000) start = 55000;
  else if (t <= 800000) start = 70000;
  else if (t <= 900000) start = 200000;
  else if (t <= 1200000) start = 400000;
  else start = 1200000;
  const firstRate = brackets.find((b) => b.limit === start).rate;
  return [{ limit: start, rate: firstRate }, ...brackets.filter((b) => b.limit > start)];
}

export function calcEGIncomeTax(annualGross, annualSocialInsurance, country) {
  const taxable = Math.max(0, annualGross - annualSocialInsurance - country.personalExemptionAnnual);
  return applyAnnualBrackets(taxable, egyptBracketsFor(taxable, country.annualBrackets));
}

export function calcPKIncomeTax(annualGross, country) {
  return applyAnnualBrackets(annualGross, country.annualBrackets);
}

/** Monthly employee social contribution for countries without a dedicated engine. */
export function calcSocial(monthlyGross, country) {
  if (country.socialFixed) return country.socialFixed;
  if (!country.socialRate || monthlyGross <= 0) return 0;
  let base = monthlyGross;
  if (country.socialFloor) base = Math.max(base, country.socialFloor);
  if (country.socialCap) base = Math.min(base, country.socialCap);
  return base * country.socialRate;
}
