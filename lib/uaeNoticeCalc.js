/**
 * lib/uaeNoticeCalc.js
 * Date and money math for the UAE notice-period calculator
 * (components/UaeNoticePeriodCalculator.jsx). Kept outside the component so
 * tests run against the real code.
 *
 * UAE Federal Decree-Law No. 33 of 2021, Art. 43: notice 30-90 days; the party
 * that does not observe it pays the worker's wage for the whole notice period or
 * the unserved part, on the basis of the last wage (Art. 43/4). Monthly-paid
 * workers: daily wage = monthly wage / 30 (Art. 67 counts the month as 30 days).
 */

export function toNum(v) {
  const n = parseFloat(String(v).replace(/,/g, ""));
  return isNaN(n) || n < 0 ? 0 : n;
}

export function isInvalidNumericInput(value) {
  const raw = String(value ?? "").trim().replace(/,/g, "");
  if (!raw) return false;
  const n = Number(raw);
  return !Number.isFinite(n) || n < 0;
}

/** Add Gregorian calendar days to a date string without browser-timezone drift. */
export function addDays(dateStr, days) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day || !Number.isFinite(Number(days))) return "";
  const d = new Date(Date.UTC(year, month - 1, day + Number(days)));
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    String(d.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

/** Calculate Gregorian calendar day difference independent of browser timezone. */
export function getDaysDiff(startStr, endStr) {
  if (!startStr || !endStr) return 0;
  const [sy, sm, sd] = startStr.split("-").map(Number);
  const [ey, em, ed] = endStr.split("-").map(Number);
  if (![sy, sm, sd, ey, em, ed].every(Number.isFinite)) return 0;
  const start = Date.UTC(sy, sm - 1, sd);
  const end = Date.UTC(ey, em - 1, ed);
  return Math.round((end - start) / 86400000);
}

/**
 * Pay in lieu of notice for a monthly-paid worker.
 * @returns {{ remainingDays:number, dailyWage:number, compensation:number }}
 */
export function noticeCompensation({ requiredDays, servedDays, monthlyWage }) {
  const remainingDays = Math.max(toNum(requiredDays) - toNum(servedDays), 0);
  const dailyWage = toNum(monthlyWage) / 30;
  return { remainingDays, dailyWage, compensation: remainingDays * dailyWage };
}
