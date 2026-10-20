/*
 * lib/gosiEngine.js
 * Pure calculation engine for Saudi GOSI contributions.
 * All monetary values are kept with two-decimal (halala) precision.
 * Compliant with the Saudi Social Insurance Law (Royal Decree M/273 dated 26/12/1445H,
 * Cabinet Decision No. 1022, effective 3 July 2024) and the Unemployment Insurance Law
 * (SANED, Royal Decree M/18 dated 12/03/1435H).
 */

/**
 * Determine the pension contribution rate (percentage) for a given date
 * according to the new Social Insurance Law (Royal Decree M/273 dated 26/12/1445H,
 * effective 3 Jul 2024) and the official GOSI Contributions Guide (awareness.gosi.gov.sa/pdf/Contributions.pdf).
 * Returns a value: 0.09, 0.095, 0.10, 0.105, or 0.11.
 *
 * Official step-up schedule (for new-system contributors):
 * • 3 Jul 2024 – 30 Jun 2025 : 9.00 %
 * • 1 Jul 2025 – 30 Jun 2026 : 9.50 %
 * • 1 Jul 2026 – 30 Jun 2027 : 10.00 %
 * • 1 Jul 2027 – 30 Jun 2028 : 10.50 %
 * • 1 Jul 2028 onward        : 11.00 % (Official GOSI Contributions Guide, Page 4; visually confirmed 19-Oct-2026)
 */
export function pensionRateForDate(date) {
  let d = date;
  if (!d) {
    d = new Date();
  } else if (typeof d === "string") {
    // If YYYY-MM or YYYY-MM-DD
    const parts = d.split("-").map(Number);
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const year = parts[0];
      const month = parts[1] - 1;
      const day = parts[2] || 1;
      d = new Date(year, month, day);
    } else {
      d = new Date(d);
    }
  }

  if (!(d instanceof Date) || isNaN(d.getTime())) {
    d = new Date();
  }

  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed: 0 = Jan, 5 = Jun, 6 = Jul
  const day = d.getDate();
  const dateKey = year * 10000 + (month + 1) * 100 + day;

  if (dateKey >= 20280701) return 0.11;
  if (dateKey >= 20270701) return 0.105;
  if (dateKey >= 20260701) return 0.10;
  if (dateKey >= 20250701) return 0.095;
  return 0.09;
}

/**
 * Helper to round halalas cleanly to 2 decimal places.
 */
function roundHalala(amount) {
  return Number((Math.round((amount + Number.EPSILON) * 100) / 100).toFixed(2));
}

/**
 * Calculate GOSI contributions.
 * @param {Object} opts
 *   basic: number (basic salary) – SAR
 *   housing: number (housing allowance cash value) – SAR
 *   housingValuationMode: "cash" | "inKind" | "none" (default: "cash")
 *   employeeCategory: "legacy" | "new" | "expat" | "gcc" (default: "legacy")
 *   contributionDate: Date | string (effective date for rate step-up in new system)
 *   age: number | null (employee age for SANED eligibility)
 *   isFirstTimeRegistration: boolean (default: false; true if employee is enrolling in SANED for the first time)
 *   hasPriorRegistration: boolean (default: true; set false if employee has no prior SANED subscription)
 * @returns {Object} with:
 *   employeeTotal – total employee deduction (pension + SANED)
 *   employerTotal – total employer contribution (pension + SANED + hazard)
 *   employeeBreakdown – array of { label, value } for employee deductions
 *   employerBreakdown – array of { label, value } for employer contributions
 *   breakdown – combined array of all breakdown items for backwards compatibility
 *   employeePension – employee pension amount
 *   employeeSanned – employee SANED amount
 *   employerPension – employer pension amount
 *   employerSanned – employer SANED amount
 *   employerHazard – employer hazard amount
 *   contributoryWage – calculated contributory wage (basic + housing)
 *   pensionBase – contributory wage after applying pension floor (1,500) and cap (45,000)
 *   hazardBase – contributory wage after applying hazard floor (400) and cap (45,000)
 *   employeePensionRate – applied employee pension rate
 *   employerPensionRate – applied employer pension rate
 *   note – optional informational note (e.g., for GCC nationals)
 */
export function calculateGOSI({
  basic = 0,
  housing = 0,
  housingValuationMode = "cash",
  employeeCategory = "legacy",
  contributionDate = new Date(),
  age = null,
  isFirstTimeRegistration = false,
  hasPriorRegistration = true,
} = {}) {
  const numBasic = Math.max(0, Number(basic) || 0);
  const numHousing = Math.max(0, Number(housing) || 0);

  // ---- 1. Contributory Wage calculation -------------------------------------
  let housingForContrib = 0;
  if (housingValuationMode === "cash") {
    housingForContrib = numHousing;
  } else if (housingValuationMode === "inKind") {
    // Employer-provided in-kind accommodation:
    // Valued under GOSI rules as two months of basic salary per year => basic / 6 monthly
    housingForContrib = numBasic / 6;
  } // "none" results in 0

  const contributory = numBasic + housingForContrib;

  // Zero / invalid salary check: if contributory wage is zero, all contributions are zero
  if (contributory <= 0) {
    return {
      employeeTotal: 0,
      employerTotal: 0,
      employeeBreakdown: [],
      employerBreakdown: [],
      breakdown: [],
      employeePension: 0,
      employeeSanned: 0,
      employerPension: 0,
      employerSanned: 0,
      employerHazard: 0,
      contributoryWage: 0,
      pensionBase: 0,
      hazardBase: 0,
      employeePensionRate: 0,
      employerPensionRate: 0,
      note: undefined,
    };
  }

  // ---- 2. Official Statutory Floors and Cap ---------------------------------
  // Annuities (Pension) branch floor: SAR 1,500
  // Occupational Hazards branch floor: SAR 400
  // Maximum contributory wage cap (both branches): SAR 45,000
  const pensionFloor = 1500;
  const hazardFloor = 400;
  const cap = 45000;

  const pensionBase = Math.max(pensionFloor, Math.min(contributory, cap));
  const hazardBase = Math.max(hazardFloor, Math.min(contributory, cap));

  // ---- 3. Category handling & Rates -----------------------------------------
  // GCC nationals: Subject to the Unified Law for the Extension of Insurance Protection.
  // Each GCC country applies its own national rates. GOSI advises checking with authorities.
  if (employeeCategory === "gcc") {
    return {
      employeeTotal: 0,
      employerTotal: 0,
      employeeBreakdown: [],
      employerBreakdown: [],
      breakdown: [],
      employeePension: 0,
      employeeSanned: 0,
      employerPension: 0,
      employerSanned: 0,
      employerHazard: 0,
      contributoryWage: roundHalala(contributory),
      pensionBase,
      hazardBase,
      employeePensionRate: 0,
      employerPensionRate: 0,
      note: "يرجى مراجعة الجهة الرسمية لتحديد مقدار مساهمة التأمينات الاجتماعية للجنسية الخليجية (وفق نظام مد الحماية التأمينية).",
    };
  }

  let employeePensionRate = 0;
  let employerPensionRate = 0;
  let includeSanned = false;
  const sannedRate = 0.0075; // 0.75% each side (1.5% total)
  const hazardRate = 0.02;   // 2% employer only

  if (employeeCategory === "legacy") {
    // Legacy Saudi contributor (registered prior to 3 Jul 2024):
    // 9% employee pension + 9% employer pension
    employeePensionRate = 0.09;
    employerPensionRate = 0.09;
    includeSanned = true;
  } else if (employeeCategory === "new") {
    // New Saudi contributor (registered from 3 Jul 2024 onward):
    // Phased schedule step-up based on contribution date (Royal Decree M/273)
    const rate = pensionRateForDate(contributionDate);
    employeePensionRate = rate;
    employerPensionRate = rate;
    includeSanned = true;
  } else if (employeeCategory === "expat") {
    // Non-Saudi expatriate:
    // Covered ONLY under the Occupational Hazards branch (2% employer).
    // NO pension deductions (0%) and NO SANED (0%).
    employeePensionRate = 0;
    employerPensionRate = 0;
    includeSanned = false;
  }

  // ---- 4. SANED eligibility (Age verification & Legal distinctions) ---------
  // Under the Unemployment Insurance Law (SANED, Royal Decree M/18):
  // • Article 3(1): Initial registration applies to Saudi workers whose age is
  //   under 59 (دون سن التاسعة والخمسين).
  // • Article 3(2) & Executive Regulations: Existing contributors who registered
  //   prior to age 59 continue subscription while on the job until reaching age 60.
  // • Article 3(2): Subscription officially ceases upon reaching age 60 (سن الستين).
  // • There is no arbitrary lower limit like 21 (working age 18+ is fully eligible).
  let sanedApplicable = includeSanned;
  if (includeSanned && age !== null && age !== undefined && age !== "") {
    const numAge = Number(age);
    if (!isNaN(numAge)) {
      const isInitial = isFirstTimeRegistration || hasPriorRegistration === false;
      if (isInitial && numAge >= 59) {
        // First-time enrollment restricted to under 59
        sanedApplicable = false;
      } else if (numAge >= 60) {
        // Contributor subscription ceases at age 60
        sanedApplicable = false;
      }
    }
  }

  // ---- 5. Monetary Calculations --------------------------------------------
  const employeePension = roundHalala(pensionBase * employeePensionRate);
  const employeeSanned = sanedApplicable ? roundHalala(pensionBase * sannedRate) : 0;
  const employeeTotal = roundHalala(employeePension + employeeSanned);

  const employerPension = roundHalala(pensionBase * employerPensionRate);
  const employerSanned = sanedApplicable ? roundHalala(pensionBase * sannedRate) : 0;
  const employerHazard = roundHalala(hazardBase * hazardRate);
  const employerTotal = roundHalala(employerPension + employerSanned + employerHazard);

  // ---- 6. Clear Breakdown Construction -------------------------------------
  const employeeBreakdown = [];
  if (employeePension > 0 || (includeSanned && employeeCategory !== "expat")) {
    employeeBreakdown.push({ label: "معاشات (الموظف)", value: employeePension });
  }
  if (sanedApplicable) {
    employeeBreakdown.push({ label: "ساند (الموظف)", value: employeeSanned });
  }

  const employerBreakdown = [];
  if (employerPension > 0) {
    employerBreakdown.push({ label: "معاشات (المنشأة)", value: employerPension });
  }
  if (sanedApplicable) {
    employerBreakdown.push({ label: "ساند (المنشأة)", value: employerSanned });
  }
  employerBreakdown.push({ label: "المخاطر المهنية (المنشأة)", value: employerHazard });

  // Combined breakdown for any legacy callers
  const breakdown = [...employeeBreakdown, ...employerBreakdown];

  return {
    employeeTotal,
    employerTotal,
    employeeBreakdown,
    employerBreakdown,
    breakdown,
    employeePension,
    employeeSanned,
    employerPension,
    employerSanned,
    employerHazard,
    contributoryWage: roundHalala(contributory),
    pensionBase,
    hazardBase,
    employeePensionRate,
    employerPensionRate,
    note: undefined,
  };
}
