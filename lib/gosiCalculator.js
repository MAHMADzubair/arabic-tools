/*
 * lib/gosiCalculator.js
 * Pure calculation engine for Saudi GOSI contributions.
 * All monetary values are kept with two‑decimal (halala) precision.
 */

/**
 * Determine the pension contribution rate (percentage) for a given date
 * according to the new Social Insurance Law (effective 3 Jul 2024).
 * Returns a value like 0.09, 0.095, 0.10, … up to 0.11.
 */
function pensionRateForDate(date) {
  // The first rate (9 %) is effective from 3 Jul 2024.
  const start = new Date(2024, 6, 3); // months are 0‑based
  if (date < start) return 0.09; // fallback, should not happen for new system
  // Calculate whole years since start (each July 1st the rate steps up).
  const years = date.getFullYear() - 2024;
  // If the month/day is before July 1 of the current year, subtract one.
  const month = date.getMonth(); // 0‑based
  const day = date.getDate();
  let effectiveYears = years;
  if (month < 6 || (month === 6 && day < 1)) {
    effectiveYears = years - 1;
  }
  // Rate = 9% + 0.5% * effectiveYears, capped at 11%.
  const rate = 0.09 + 0.005 * effectiveYears;
  return Math.min(rate, 0.11);
}

/**
 * Calculate GOSI contributions.
 * @param {Object} opts
 *   basic: number (basic salary) – SAR
 *   housing: number (housing allowance cash value) – SAR
 *   employeeCategory: "legacy" | "new" – determines which schedule applies
 *   contributionDate: Date – the month for which the contribution is calculated
 * @returns {Object} with:
 *   employeeTotal – total employee contribution (pension + SANED)
 *   employerTotal – total employer contribution (pension + SANED + hazard)
 *   breakdown – array of { label, value } for UI rendering (values are SAR, two decimals)
 */
export function calculateGOSI({ basic, housing, employeeCategory, contributionDate }) {
  // ----------- 1. Compute contributory wage (basic + housing) -----------
  const contributory = basic + housing;
  // Apply floor/ceil per branch (pension branch floor 1,500 SAR, hazard floor 400 SAR)
  const pensionFloor = 1500;
  const hazardFloor = 400;
  const cap = 45000;

  // Apply floor for pension branch only (used for pension & SANED rates)
  const pensionBase = Math.max(pensionFloor, Math.min(contributory, cap));
  // Hazard base uses its own floor but same cap
  const hazardBase = Math.max(hazardFloor, Math.min(contributory, cap));

  // ----------- 2. Determine rates -----------------------------------
  let employeePensionRate = 0;
  let employerPensionRate = 0;
  const sannedRate = 0.0075; // 0.75 % each side
  const hazardRate = 0.02; // 2 % employer only

  if (employeeCategory === "legacy") {
    // Legacy rates are fixed at 9 % each side
    employeePensionRate = 0.09;
    employerPensionRate = 0.09;
  } else {
    // New system – use phased schedule based on contributionDate
    const rate = pensionRateForDate(contributionDate);
    employeePensionRate = rate;
    employerPensionRate = rate;
  }

  // ----------- 3. Compute contributions ------------------------------
  // Employee side
  const employeePension = Number((pensionBase * employeePensionRate).toFixed(2));
  const employeeSanned = Number((pensionBase * sannedRate).toFixed(2));
  const employeeTotal = Number((employeePension + employeeSanned).toFixed(2));

  // Employer side – includes hazard
  const employerPension = Number((pensionBase * employerPensionRate).toFixed(2));
  const employerSanned = Number((pensionBase * sannedRate).toFixed(2));
  const employerHazard = Number((hazardBase * hazardRate).toFixed(2));
  const employerTotal = Number((employerPension + employerSanned + employerHazard).toFixed(2));

  // ----------- 4. Build breakdown for UI ---------------------------
  const breakdown = [];
  // Employee items
  breakdown.push({ label: "معاشات (الموظف)", value: employeePension });
  breakdown.push({ label: "ساند (الموظف)", value: employeeSanned });
  // Employer items
  breakdown.push({ label: "معاشات (المنشأة)", value: employerPension });
  breakdown.push({ label: "ساند (المنشأة)", value: employerSanned });
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
    contributoryWage: Number(contributory.toFixed(2))
  };
}
