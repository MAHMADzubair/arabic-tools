/**
 * lib/overtimeCalc.js
 * Pure overtime math shared by components/OvertimeCalculator.jsx and its tests.
 *
 * Saudi Arabia (Labour Law, Article 107): each overtime hour is paid the
 * actual hourly wage (basic + regular allowances) plus 50% of the basic
 * hourly wage. Monthly divisor 240 (30 days x 8 hours). The same rate applies
 * to ordinary overtime and to hours worked on rest days and public holidays.
 *
 * Other countries: hourly wage from the monthly BASIC salary entered, times the
 * country's day / night / rest-day multiplier:
 * - UAE (Decree-Law 33/2021 Art. 19): +25%; 10 pm-4 am +50%; rest day +50%. Divisor 240.
 * - Kuwait (Law 6/2010 Art. 66-67): +25%; rest day +50%; no separate night premium.
 *   Divisor 208 (26 working days x 8 hours).
 * - Qatar (Law 14/2004 Art. 74-75): +25%; 9 pm-6 am +50%; rest day +150% of basic.
 * - Egypt (Labour Law 14/2025): +35% day, +70% night; rest day / holiday double pay.
 */

export const OVERTIME_COUNTRIES = [
  {
    id: "sa", code: "SA", name: "السعودية", currency: "SAR",
    dayMultiplier: 1.5, nightMultiplier: 1.5, weekendMultiplier: 1.5,
    lawNote: "نظام العمل السعودي (م/107): أجر الساعة الفعلي + 50% من أجر الساعة الأساسي، ويُعامل العمل في أيام الراحة والأعياد معاملة العمل الإضافي.",
    hoursDivisor: 240,
  },
  {
    id: "ae", code: "AE", name: "الإمارات", currency: "AED",
    dayMultiplier: 1.25, nightMultiplier: 1.5, weekendMultiplier: 1.5,
    lawNote: "قانون العمل الإماراتي (م/19): على الأجر الأساسي + 25%، و+ 50% بين 10 مساءً و4 فجراً، ويوم الراحة يوم بديل أو + 50%.",
    hoursDivisor: 240,
  },
  {
    id: "kw", code: "KW", name: "الكويت", currency: "KWD",
    dayMultiplier: 1.25, nightMultiplier: 1.25, weekendMultiplier: 1.5,
    lawNote: "قانون العمل الكويتي (م/66 و67): أجر الساعة + 25%، و+ 50% يوم الراحة الأسبوعية. لا ينص القانون على زيادة خاصة للعمل الليلي. أجر الساعة = الأجر ÷ 208.",
    hoursDivisor: 208,
  },
  {
    id: "qa", code: "QA", name: "قطر", currency: "QAR",
    dayMultiplier: 1.25, nightMultiplier: 1.5, weekendMultiplier: 2.5,
    lawNote: "قانون العمل القطري (م/74 و75): الأجر الأساسي + 25%، و+ 50% بين 9 مساءً و6 صباحاً (عدا عمال المناوبة)، ويوم الراحة الأسبوعية + 150%.",
    hoursDivisor: 240,
  },
  {
    id: "eg", code: "EG", name: "مصر", currency: "EGP",
    dayMultiplier: 1.35, nightMultiplier: 1.7, weekendMultiplier: 2.0,
    lawNote: "قانون العمل المصري رقم 14 لسنة 2025: أجر الساعة + 35% نهاراً و+ 70% ليلاً، ومثلا الأجر عن العمل يوم الراحة أو العطلة.",
    hoursDivisor: 240,
  },
];

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
