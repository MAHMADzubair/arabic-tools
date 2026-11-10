/**
 * lib/overtimeCalc.js
 * Pure overtime math shared by components/OvertimeCalculator.jsx and its tests.
 *
 * Saudi Arabia (Labour Law, Article 107): each overtime hour is paid the
 * actual hourly wage (basic + regular allowances) plus 50% of the basic
 * hourly wage. Monthly divisor 240 (30 days x 8 hours). The same rate applies
 * to ordinary overtime and to hours worked on rest days and public holidays.
 *
 * Other countries: hourly wage from the monthly salary entered, times the
 * country's day / night / rest-day multiplier.
 */

function toNum(v) {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

export function saudiOvertimeHourlyRate(basicMonthly, allowancesMonthly = 0, divisor = 240) {
  const basic = toNum(basicMonthly);
  const actual = basic + toNum(allowancesMonthly);
  if (!divisor) return 0;
  return actual / divisor + 0.5 * (basic / divisor);
}

export function calculateOvertime({ country, salary, allowances = 0, dayHours = 0, nightHours = 0, weekendHours = 0 }) {
  const s = toNum(salary);
  const dH = toNum(dayHours);
  const nH = toNum(nightHours);
  const wH = toNum(weekendHours);
  const divisor = country.hoursDivisor;

  let hourlyWage, basicHourlyWage, actualHourlyWage, actualMonthlyWage;
  let dayRate, nightRate, weekendRate;

  if (country.id === "sa") {
    const allw = toNum(allowances);
    actualMonthlyWage = s + allw;
    basicHourlyWage = s > 0 ? s / divisor : 0;
    actualHourlyWage = actualMonthlyWage > 0 ? actualMonthlyWage / divisor : 0;
    hourlyWage = basicHourlyWage;
    const saudiOtRate = saudiOvertimeHourlyRate(s, allw, divisor);
    dayRate = saudiOtRate;
    nightRate = saudiOtRate;
    weekendRate = saudiOtRate;
  } else {
    actualMonthlyWage = s;
    hourlyWage = s > 0 ? s / divisor : 0;
    basicHourlyWage = hourlyWage;
    actualHourlyWage = hourlyWage;
    dayRate = hourlyWage * country.dayMultiplier;
    nightRate = hourlyWage * country.nightMultiplier;
    weekendRate = hourlyWage * country.weekendMultiplier;
  }

  const dayAmount = dH * dayRate;
  const nightAmount = nH * nightRate;
  const weekendAmount = wH * weekendRate;
  const totalOvertimePay = dayAmount + nightAmount + weekendAmount;

  return {
    hourlyWage, basicHourlyWage, actualHourlyWage, actualMonthlyWage,
    dayRate, nightRate, weekendRate,
    dayAmount, nightAmount, weekendAmount,
    totalOvertimePay,
    totalSalaryWithOvertime: actualMonthlyWage + totalOvertimePay,
    totalHours: dH + nH + wH,
  };
}
