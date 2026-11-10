/**
 * lib/annualLeaveCalc.js
 * Annual-leave math used by components/AnnualLeaveCalculator.jsx.
 * Kept outside the component so tests run against the real code.
 *
 * Saudi rules: Labour Law Art. 109 (21 days, 30 after five continuous years) and
 * Art. 111 (pay for unused leave at end of service, pro rata for part of a year).
 */

export function toNum(v) {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

/** Days of annual leave per year for a country rule and completed years of service. */
export function annualEntitlementDays(rule, years) {
  const y = toNum(years);
  return rule.seniorThresholdYears > 0 && y >= rule.seniorThresholdYears
    ? rule.seniorDays
    : rule.standardDays;
}

/**
 * @param {{ rule: {standardDays:number, seniorDays:number, seniorThresholdYears:number, monthDivisor?:number},
 *           salary: string|number, yearsOfService: string|number, unusedDays: string|number }} i
 */
export function calculateAnnualLeave({ rule, salary, yearsOfService, unusedDays }) {
  const s = toNum(salary);
  const uDays = toNum(unusedDays);
  const annualEntitlement = annualEntitlementDays(rule, yearsOfService);
  const daysInMonth = rule.monthDivisor || 30;
  const dailyWage = s > 0 ? s / daysInMonth : 0;
  return {
    annualEntitlement,
    daysInMonth,
    dailyWage,
    fullAnnualLeavePay: dailyWage * annualEntitlement,
    unusedBalanceCompensation: dailyWage * uDays,
  };
}

/**
 * Estimated leave balance: carried-over days + days earned so far this leave year
 * (entitlement x months / 12, months capped at 12) - days already taken. Never negative.
 */
export function leaveBalance({ entitlement, monthsWorked, carriedDays, takenDays }) {
  const months = Math.min(toNum(monthsWorked), 12);
  const accrued = (toNum(entitlement) * months) / 12;
  const balance = Math.max(0, toNum(carriedDays) + accrued - toNum(takenDays));
  return { months, accrued, monthlyRate: toNum(entitlement) / 12, balance };
}
