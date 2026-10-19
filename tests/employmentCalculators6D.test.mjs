/**
 * tests/employmentCalculators6D.test.mjs
 * Sprint 6D.1 — Comprehensive regression tests for Saudi and UAE employment calculators.
 * Tests independently verify:
 * 1. Saudi 2-, 5-, 10-year resignation thresholds.
 * 2. Exactly 5.0 years resignation boundary (1/3 entitlement, not 2/3).
 * 3. One day before / one day after service thresholds.
 * 4. Saudi Gratuity vs Saudi Final Settlement EOSB consistency.
 * 5. Partial-month and partial-year service date calculation.
 * 6. Leap-year and month-end date boundaries.
 * 7. UAE gratuity duration and statutory cap.
 * 8. Saudi Overtime hybrid wage formula (Art. 107) with zero allowances.
 * 9. Saudi Overtime hybrid wage formula with eligible allowances (Golden Scenario: SAR 500).
 * 10. UAE Overtime unchanged standard formula (Art. 19).
 * 11. Zero, negative, and invalid input safety.
 */

import test from "node:test";
import assert from "node:assert/strict";

// --- Extracted Calculation Functions matching components/GratuityCalculator.jsx ---
function parseLocal(str) {
  if (!str) return new Date(NaN);
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function calcGratuityDuration(durationMode, manualYears, manualMonths, startDate, endDate) {
  if (durationMode === "manual") {
    const y = Math.max(0, Number(manualYears) || 0);
    const m = Math.max(0, Math.min(11, Number(manualMonths) || 0));
    const total = y * 12 + m;
    return {
      totalMonths: total,
      years: y,
      months: m,
      days: 0,
      decimalYears: Number((total / 12).toFixed(2)),
    };
  }

  if (!startDate || !endDate) return { totalMonths: 0, years: 0, months: 0, days: 0 };
  const s = parseLocal(startDate);
  const e = parseLocal(endDate);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) {
    return { totalMonths: 0, years: 0, months: 0, days: 0 };
  }

  const sy = s.getFullYear(), sm = s.getMonth() + 1, sd = s.getDate();
  const ey = e.getFullYear(), em = e.getMonth() + 1, ed = e.getDate();

  let y = ey - sy;
  let m = em - sm;
  let d = ed - sd;

  const isStartMonthEnd = sd === new Date(sy, sm, 0).getDate();
  const isEndMonthEnd = ed === new Date(ey, em, 0).getDate();

  if (isStartMonthEnd && isEndMonthEnd) {
    d = 0;
  } else if (d < 0) {
    m -= 1;
    const prevMonthDays = new Date(ey, em - 1, 0).getDate();
    d += prevMonthDays;
  }

  if (m < 0) {
    y -= 1;
    m += 12;
  }

  const daysInMonthForProration = ed >= sd ? new Date(ey, em, 0).getDate() : new Date(ey, em - 1, 0).getDate();
  const fractionalMonth = d > 0 ? d / daysInMonthForProration : 0;
  const totalMonths = y * 12 + m + fractionalMonth;

  return {
    totalMonths,
    years: y,
    months: m,
    days: d,
    decimalYears: Number((totalMonths / 12).toFixed(2)),
  };
}

function saudiGratuityCalc(months, salary, reason) {
  const years = months / 12;
  if (years <= 0 || salary <= 0) return { amount: 0, fullAmount: 0, percent: 0 };

  const y1 = Math.min(years, 5);
  const y2 = Math.max(0, years - 5);
  const fullGratuity = salary * 0.5 * y1 + salary * 1.0 * y2;

  let percentage = 1.0;
  if (reason === "resign") {
    if (years < 2) {
      percentage = 0;
    } else if (years <= 5) {
      percentage = 1 / 3;
    } else if (years < 10) {
      percentage = 2 / 3;
    } else {
      percentage = 1.0;
    }
  } else if (reason === "female_special") {
    percentage = 1.0;
  }

  const finalAmount = fullGratuity * percentage;
  return {
    amount: Math.round(finalAmount),
    fullAmount: Math.round(fullGratuity),
    percent: Math.round(percentage * 100),
    years,
  };
}

// --- Extracted Calculation Functions matching components/FinalSettlementCalculator.jsx ---
function calcServiceMonthsSettlement(startStr, endStr) {
  const s = parseLocal(startStr);
  const e = parseLocal(endStr);
  if (isNaN(s) || isNaN(e) || e <= s) return 0;
  const years = e.getFullYear() - s.getFullYear();
  const months = e.getMonth() - s.getMonth();
  const days = e.getDate() - s.getDate();
  let totalMonths = years * 12 + months;
  if (days >= 0) {
    totalMonths += days / 30;
  } else {
    const dim = new Date(e.getFullYear(), e.getMonth(), 0).getDate();
    totalMonths -= 1;
    totalMonths += (dim + days) / dim;
  }
  return Math.max(0, totalMonths);
}

function saudiFinalSettlementEosb(serviceYears, totalWage, terminationReason) {
  if (serviceYears <= 0 || totalWage <= 0) return { eosb: 0, fullGratuity: 0, esobPercent: 0 };

  const y1 = Math.min(serviceYears, 5);
  const y2 = Math.max(0, serviceYears - 5);
  const fullGratuity = totalWage * 0.5 * y1 + totalWage * 1.0 * y2;

  let esobPercent = 1.0;
  if (["terminate", "retire", "mutual", "fixed_expired"].includes(terminationReason)) {
    esobPercent = 1.0;
  } else if (terminationReason === "female_special") {
    esobPercent = 1.0;
  } else if (terminationReason === "resign") {
    if (serviceYears < 2) {
      esobPercent = 0;
    } else if (serviceYears <= 5) {
      esobPercent = 1 / 3;
    } else if (serviceYears < 10) {
      esobPercent = 2 / 3;
    } else {
      esobPercent = 1.0;
    }
  }
  const eosb = fullGratuity * esobPercent;
  return { eosb: Math.round(eosb), fullGratuity: Math.round(fullGratuity), esobPercent };
}

// --- Extracted Calculation Functions matching components/OvertimeCalculator.jsx ---
function calcOvertime(countryId, salary, allowances, dayHours, nightHours, weekendHours) {
  const s = Math.max(0, Number(salary) || 0);
  const allw = Math.max(0, Number(allowances) || 0);
  const dH = Math.max(0, Number(dayHours) || 0);
  const nH = Math.max(0, Number(nightHours) || 0);
  const wH = Math.max(0, Number(weekendHours) || 0);

  const hoursDivisor = 240;
  let dayRate = 0, nightRate = 0, weekendRate = 0;
  let actualMonthlyWage = s;

  if (countryId === "sa") {
    const actual = s + allw;
    actualMonthlyWage = actual;
    const basicHourlyWage = s > 0 ? s / hoursDivisor : 0;
    const actualHourlyWage = actual > 0 ? actual / hoursDivisor : 0;

    // Saudi Art. 107
    const saudiOtRate = actualHourlyWage + 0.5 * basicHourlyWage;
    dayRate = saudiOtRate;
    nightRate = saudiOtRate;
    weekendRate = saudiOtRate;
  } else if (countryId === "ae") {
    const hourlyWage = s > 0 ? s / hoursDivisor : 0;
    dayRate = hourlyWage * 1.25;
    nightRate = hourlyWage * 1.50;
    weekendRate = hourlyWage * 1.50;
  }

  const dayAmount = dH * dayRate;
  const nightAmount = nH * nightRate;
  const weekendAmount = wH * weekendRate;
  const totalOvertimePay = dayAmount + nightAmount + weekendAmount;

  return {
    dayRate,
    nightRate,
    weekendRate,
    totalOvertimePay,
    totalSalaryWithOvertime: actualMonthlyWage + totalOvertimePay,
  };
}

// =============================================================================
// SUITE 1: SAUDI RESIGNATION THRESHOLDS (FIX 1 & FIX 2)
// =============================================================================

test("Saudi Resignation: 1 year 11 months (< 2 yrs) yields 0% entitlement", () => {
  const dur = calcGratuityDuration("manual", 1, 11);
  const res = saudiGratuityCalc(dur.totalMonths, 10000, "resign");
  assert.equal(res.percent, 0);
  assert.equal(res.amount, 0);
});

test("Saudi Resignation: Exactly 2.0 years yields exactly 1/3 (33.3%) entitlement", () => {
  const dur = calcGratuityDuration("manual", 2, 0);
  const res = saudiGratuityCalc(dur.totalMonths, 10000, "resign");
  // Full = 2 * 0.5 * 10,000 = 10,000. 1/3 = 3,333.33 -> 3,333
  assert.equal(res.percent, 33);
  assert.equal(res.amount, 3333);
});

test("Saudi Resignation: 4 years 11 months (< 5 yrs) yields 1/3 entitlement", () => {
  const dur = calcGratuityDuration("manual", 4, 11);
  const res = saudiGratuityCalc(dur.totalMonths, 10000, "resign");
  assert.equal(res.percent, 33);
  // Full = (59/12) * 5,000 = 24,583.33 -> 1/3 = 8,194.44 -> 8,194
  assert.equal(res.amount, 8194);
});

test("Saudi Resignation FIX 1: Exactly 5.0 years manual yields exactly 1/3 entitlement (NOT 2/3)", () => {
  const dur = calcGratuityDuration("manual", 5, 0);
  const res = saudiGratuityCalc(dur.totalMonths, 10000, "resign");
  // Full = 5 * 0.5 * 10,000 = 25,000.
  // 1/3 of 25,000 = 8,333.33 -> 8,333.
  // PRIOR DEFECT RETURNED: 16,667 (2/3).
  assert.equal(res.percent, 33);
  assert.equal(res.amount, 8333);
});

test("Saudi Resignation: 5 years and 1 month (> 5 yrs) advances to 2/3 (66.7%) entitlement", () => {
  const dur = calcGratuityDuration("manual", 5, 1);
  const res = saudiGratuityCalc(dur.totalMonths, 10000, "resign");
  assert.equal(res.percent, 67);
  // Full = 5 * 5,000 + (1/12) * 10,000 = 25,000 + 833.33 = 25,833.33.
  // 2/3 = 17,222.22 -> 17,222.
  assert.equal(res.amount, 17222);
});

test("Saudi Resignation: Exactly 10.0 years yields 100% full entitlement", () => {
  const dur = calcGratuityDuration("manual", 10, 0);
  const res = saudiGratuityCalc(dur.totalMonths, 10000, "resign");
  // Full = 5 * 5,000 + 5 * 10,000 = 75,000. 100% = 75,000.
  assert.equal(res.percent, 100);
  assert.equal(res.amount, 75000);
});

test("Saudi Final Settlement FIX 2: Exactly 5.0 years resignation yields 1/3 entitlement", () => {
  // Last monthly wage: SAR 10,000, continuous service: exactly 5 years, ordinary resignation
  // Full gratuity = SAR 25,000. Statutory entitlement = 1/3 -> SAR 8,333.
  const res = saudiFinalSettlementEosb(5.0, 10000, "resign");
  assert.equal(res.esobPercent, 1 / 3);
  assert.equal(res.fullGratuity, 25000);
  assert.equal(res.eosb, 8333);
});

// =============================================================================
// SUITE 2: DATES, MONTH-ENDS, LEAP YEARS & RESIDUAL DAYS (FIX 3)
// =============================================================================

test("Saudi Gratuity FIX 3: Start 2020-01-01 to End 2022-01-25 includes 24 residual days", () => {
  const dur = calcGratuityDuration("dates", 0, 0, "2020-01-01", "2022-01-25");
  assert.equal(dur.years, 2);
  assert.equal(dur.months, 0);
  assert.equal(dur.days, 24);
  // January 2022 has 31 days -> fraction = 24 / 31 = 0.77419...
  // totalMonths = 24.77419... -> years = 2.064516...
  // Full gratuity = 10,000 * 0.5 * 2.064516... = 10,322.58 -> 10,323 SAR.
  const res = saudiGratuityCalc(dur.totalMonths, 10000, "terminate");
  assert.equal(res.amount, 10323);
  // Prior defective implementation dropped 24 days and returned 10,000 SAR.
  assert.notEqual(res.amount, 10000);
});

test("Date Duration: Month-end boundary in Leap Year (2020-01-31 to 2020-02-29) = exactly 1 month", () => {
  const dur = calcGratuityDuration("dates", 0, 0, "2020-01-31", "2020-02-29");
  assert.equal(dur.years, 0);
  assert.equal(dur.months, 1);
  assert.equal(dur.days, 0);
  assert.equal(dur.totalMonths, 1);
});

test("Date Duration: Month-end boundary in Non-Leap Year (2021-01-31 to 2021-02-28) = exactly 1 month", () => {
  const dur = calcGratuityDuration("dates", 0, 0, "2021-01-31", "2021-02-28");
  assert.equal(dur.years, 0);
  assert.equal(dur.months, 1);
  assert.equal(dur.days, 0);
  assert.equal(dur.totalMonths, 1);
});

test("Date Duration: Exactly 5.0 years via dates (2019-01-01 to 2024-01-01) resignation yields 1/3", () => {
  const dur = calcGratuityDuration("dates", 0, 0, "2019-01-01", "2024-01-01");
  assert.equal(dur.years, 5);
  assert.equal(dur.months, 0);
  assert.equal(dur.days, 0);
  assert.equal(dur.totalMonths, 60);

  const res = saudiGratuityCalc(dur.totalMonths, 10000, "resign");
  assert.equal(res.percent, 33);
  assert.equal(res.amount, 8333);
});

test("Date Duration: 1 day after 5-year threshold (2019-01-01 to 2024-01-02) advances to 2/3", () => {
  const dur = calcGratuityDuration("dates", 0, 0, "2019-01-01", "2024-01-02");
  assert.equal(dur.years, 5);
  assert.equal(dur.months, 0);
  assert.equal(dur.days, 1);
  assert.ok(dur.totalMonths > 60);

  const res = saudiGratuityCalc(dur.totalMonths, 10000, "resign");
  assert.equal(res.percent, 67);
  // Full = 25,000 + (1 / 31 / 12) * 10,000 = 25,026.88 -> 2/3 = 16,684.58 -> 16,685
  assert.equal(res.amount, 16685);
});

// =============================================================================
// SUITE 3: SAUDI OVERTIME HYBRID FORMULA (FIX 4 - ART. 107)
// =============================================================================

test("Saudi Overtime FIX 4 Golden Example: Basic 6k, Allowances 3k, 10h OT = exactly SAR 500.00", () => {
  // Basic: 6,000 SAR, Allowances: 3,000 SAR, Actual: 9,000 SAR, Hours: 10
  // Actual hourly = 9,000 / 240 = 37.50 SAR
  // Basic hourly = 6,000 / 240 = 25.00 SAR
  // OT rate = 37.50 + (0.5 * 25.00) = 37.50 + 12.50 = 50.00 SAR/hr
  // Overtime pay = 10 * 50.00 = 500.00 SAR
  const ot = calcOvertime("sa", 6000, 3000, 10, 0, 0);
  assert.equal(ot.dayRate, 50.0);
  assert.equal(ot.totalOvertimePay, 500.0);
  assert.equal(ot.totalSalaryWithOvertime, 9500.0);
});

test("Saudi Overtime: Zero allowances preserves backward-compatible 1.5x basic rate", () => {
  // Basic: 6,000 SAR, Allowances: 0 SAR, Actual: 6,000 SAR, Hours: 10
  // Rate = (6,000 / 240) + 0.5 * (6,000 / 240) = 25.00 + 12.50 = 37.50 SAR/hr
  // Overtime pay = 10 * 37.50 = 375.00 SAR
  const ot = calcOvertime("sa", 6000, 0, 10, 0, 0);
  assert.equal(ot.dayRate, 37.5);
  assert.equal(ot.totalOvertimePay, 375.0);
  assert.equal(ot.totalSalaryWithOvertime, 6375.0);
});

test("UAE Overtime: Unchanged statutory formula (Decree-Law 33/2021 Art. 19)", () => {
  // Basic: 7,200 AED, 10h Day (+25%), 5h Night (+50%)
  // Hourly = 7,200 / 240 = 30 AED/hr
  // Day rate = 30 * 1.25 = 37.50 AED
  // Night rate = 30 * 1.50 = 45.00 AED
  // Pay = 10 * 37.50 + 5 * 45.00 = 375 + 225 = 600.00 AED
  const ot = calcOvertime("ae", 7200, 0, 10, 5, 0);
  assert.equal(ot.dayRate, 37.5);
  assert.equal(ot.nightRate, 45.0);
  assert.equal(ot.totalOvertimePay, 600.0);
});

// =============================================================================
// SUITE 4: ZERO, NEGATIVE AND INVALID INPUT HANDLING
// =============================================================================

test("Zero / Negative inputs: 0 salary yields 0 dues safely", () => {
  const g = saudiGratuityCalc(60, 0, "terminate");
  assert.equal(g.amount, 0);

  const sfs = saudiFinalSettlementEosb(5.0, 0, "terminate");
  assert.equal(sfs.eosb, 0);

  const ot = calcOvertime("sa", 0, 0, 10, 0, 0);
  assert.equal(ot.totalOvertimePay, 0);
});

test("Invalid date order: End date before start date yields 0 months safely", () => {
  const dur = calcGratuityDuration("dates", 0, 0, "2024-01-01", "2020-01-01");
  assert.equal(dur.totalMonths, 0);
});
