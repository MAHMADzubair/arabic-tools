/*
 * lib/gosiEngine.js
 * Pure calculation engine for Saudi GOSI contributions.
 * All monetary values are kept with two‑decimal (halala) precision.
 */

/**
 * Determine the pension contribution rate (percentage) for a given date
 * according to the new Social Insurance Law (effective 3 Jul 2024).
 * Returns a value like 0.09, 0.095, 0.10, … up to 0.11.
 */
// Official rate schedule (inclusive dates):
// • 3 Jul 2024 – 30 Jun 2025 : 9.00 %
// • 1 Jul 2025 – 30 Jun 2026 : 9.50 %
// • 1 Jul 2026 – 30 Jun 2027 : 10.00 %
// • 1 Jul 2027 – 13 Jul 2028 : 10.50 %
// • 14 Jul 2028 onward        : 11.00 % (capped)
function pensionRateForDate(date) {
  const schedules = [
    { start: new Date(2024, 6, 3), end: new Date(2025, 5, 30), rate: 0.09 },
    { start: new Date(2025, 6, 1), end: new Date(2026, 5, 30), rate: 0.095 },
    { start: new Date(2026, 6, 1), end: new Date(2027, 5, 30), rate: 0.10 },
    { start: new Date(2027, 6, 1), end: new Date(2028, 6, 13), rate: 0.105 },
    { start: new Date(2028, 6, 14), end: null, rate: 0.11 },
  ];
  for (const s of schedules) {
    if (date >= s.start && (s.end === null || date <= s.end)) {
      return s.rate;
    }
  }
  // Fallback – should not happen
  return 0.09;
}
// Rate schedule handled by the schedules array above.


/**
 * Calculate GOSI contributions.
 * @param {Object} opts
 *   basic: number (basic salary) – SAR
 *   housing: number (housing allowance cash value) – SAR (used only when valuationMode === 'cash')
 *   housingValuationMode: "cash" | "inKind" | "none"
 *   employeeCategory: "legacy" | "new" | "expat" | "gcc"
 *   contributionDate: Date – the month for which the contribution is calculated
 *   age: number | null – employee age for SANED eligibility (optional)
 * @returns {Object} with:
 *   employeeTotal – total employee contribution (pension + SANED)
 *   employerTotal – total employer contribution (pension + SANED + hazard)
 *   breakdown – array of { label, value } for UI rendering (SAR, two decimals)
 *   note – optional Arabic message when contributions cannot be calculated
 */
export function calculateGOSI({
  basic,
  housing,
  housingValuationMode = "cash",
  employeeCategory,
  contributionDate,
  age = null,
}) {
  // Determine the contributory wage according to housing valuation mode
  let housingForContrib = 0;
  if (housingValuationMode === "cash") {
    // Cash allowance is directly added
    housingForContrib = housing;
  } else if (housingValuationMode === "inKind") {
    // Employer‑provided accommodation is valued at two months of basic salary per year
    // Monthly contribution = (2 * basic) / 12 = basic / 6
    housingForContrib = basic / 6;
  } // "none" results in 0

  const contributory = basic + housingForContrib;
  const pensionFloor = 1500;
  const hazardFloor = 400;
  const cap = 45000;

  const pensionBase = Math.max(pensionFloor, Math.min(contributory, cap));
  const hazardBase = contributory < pensionFloor ? hazardFloor : contributory;

  const sannedRate = 0.0075; // 0.75% each side
  const hazardRate = 0.02; // 2% employer only

  // ---- Category handling ---------------------------------------------------
  // Legacy and New‑system Saudi follow the standard schedule.
  // Expatriate (non‑Saudi) follows the same pension schedule but is **not**
  // eligible for SANED (unemployment insurance).
  // GCC nationals – we cannot assume a rate; we return a note instead.
  let employeePensionRate = 0;
  let employerPensionRate = 0;
  let includeSanned = true; // SANED applicability

  if (employeeCategory === "legacy") {
    employeePensionRate = employerPensionRate = 0.09;
  } else if (employeeCategory === "new") {
    const rate = pensionRateForDate(contributionDate);
    employeePensionRate = employerPensionRate = rate;
  } else if (employeeCategory === "expat") {
    const rate = pensionRateForDate(contributionDate);
    employeePensionRate = employerPensionRate = rate;
    includeSanned = false; // expatriates do not pay SANED
  } else if (employeeCategory === "gcc") {
    // No deterministic calculation – return a clear note.
    return {
      employeeTotal: 0,
      employerTotal: 0,
      breakdown: [],
      note: "يرجى مراجعة الجهة الرسمية لتحديد مقدار مساهمة الضمان الاجتماعي للجنسية الخليجية.",
    };
  }

  // ---- SANED eligibility (age) -------------------------------------------
  // Official SANED applies to Saudi employees aged 21‑60 inclusive.
  // If age is supplied and falls outside this range, SANED is omitted.
  let sanedApplicable = includeSanned;
  if (age !== null && typeof age === "number") {
    if (age < 21 || age > 60) {
      sanedApplicable = false;
    }
  }

  const employeePension = Number((pensionBase * employeePensionRate).toFixed(2));
  const employeeSanned = sanedApplicable ? Number((pensionBase * sannedRate).toFixed(2)) : 0;
  const employeeTotal = Number((employeePension + employeeSanned).toFixed(2));

  const employerPension = Number((pensionBase * employerPensionRate).toFixed(2));
  const employerSanned = sanedApplicable ? Number((pensionBase * sannedRate).toFixed(2)) : 0;
  const employerHazard = Number((hazardBase * hazardRate).toFixed(2));
  const employerTotal = Number((employerPension + employerSanned + employerHazard).toFixed(2));

  const breakdown = [];
  breakdown.push({ label: "معاشات (الموظف)", value: employeePension });
  if (sanedApplicable) {
    breakdown.push({ label: "ساند (الموظف)", value: employeeSanned });
  }
  breakdown.push({ label: "معاشات (المنشأة)", value: employerPension });
  if (sanedApplicable) {
    breakdown.push({ label: "ساند (المنشأة)", value: employerSanned });
  }
  breakdown.push({ label: "المخاطر المهنية (المنشأة)", value: employerHazard });

  return {
    employeeTotal,
    employerTotal,
    breakdown,
    employeePension,
    employeeSanned,
    employerPension,
    employerSanned,
    employerHazard,
    contributoryWage: Number(contributory.toFixed(2)),
    note: undefined,
  };
}
