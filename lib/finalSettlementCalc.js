/**
 * lib/finalSettlementCalc.js
 * Pure Saudi final-settlement math shared by components/FinalSettlementCalculator.jsx
 * and its tests (the tests used to keep their own copy of this logic, which could not
 * catch a bug in the real calculator).
 *
 * Saudi Labour Law:
 *  - Art. 84: end-of-service award = half a month's last wage for each of the first
 *    5 years, a full month's wage for each year after that; part-years pro rata.
 *  - Art. 85 (resignation): under 2 years -> nothing; 2 up to and including 5 years ->
 *    one third; more than 5 and under 10 -> two thirds; 10 or more -> full.
 *  - Art. 87: full award for a woman who ends the contract within 6 months of marriage
 *    or 3 months of childbirth (and for resignation caused by force majeure).
 *  - Art. 75 / 76 (as amended 2025): unserved notice is paid as wage for the missing days.
 *  - Art. 80 dismissal (award forfeited) is out of scope for the calculator.
 */

export function toNum(v) {
  const n = parseFloat(String(v));
  return isNaN(n) || n < 0 ? 0 : n;
}

/** Parse YYYY-MM-DD as a local date so timezone never shifts the day */
export function parseLocal(str) {
  if (!str) return new Date(NaN);
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function calcServiceMonths(startStr, endStr) {
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

/**
 * Default number of paid days in the last month.
 * A last working day that is the last calendar day of its month means the employee worked
 * the whole month, so it is paid as a full month (the divisor). Before this, 28 Feb was
 * paid as 28/30 of a month.
 */
export function lastMonthDefaultDays(dateStr, divisor = 30) {
  const d = parseLocal(dateStr);
  if (isNaN(d)) return 0;
  const lastDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  if (d.getDate() === lastDayOfMonth) return divisor;
  return Math.min(d.getDate(), divisor);
}

/** Article 84 award and the Article 85 / 87 share that applies to the termination reason. */
export function saudiEosb(serviceYears, totalWage, terminationReason) {
  const y1 = Math.min(serviceYears, 5);
  const y2 = Math.max(0, serviceYears - 5);
  const fullGratuity = totalWage * 0.5 * y1 + totalWage * 1.0 * y2;

  let esobPercent = 1.0;
  let esobNote = "";
  if (["terminate", "retire", "mutual", "fixed_expired"].includes(terminationReason)) {
    esobNote = "استحقاق كامل (100٪) وفق المادة (84) — يسري على الإنهاء الاعتيادي؛ الفصل التأديبي بموجب المادة (80) يُسقط المكافأة وخارج نطاق الحاسبة";
  } else if (terminationReason === "female_special") {
    esobNote = "استحقاق كامل استثنائي بموجب المادة (87) من نظام العمل";
  } else if (terminationReason === "resign") {
    if (serviceYears < 2) {
      esobPercent = 0;
      esobNote = "لا يستحق مكافأة — الاستقالة قبل اكتمال سنتين خدمة (م/85)";
    } else if (serviceYears <= 5) {
      esobPercent = 1 / 3;
      esobNote = "ثلث المكافأة (33.3٪) — استقالة بين سنتين ولا تزيد على 5 سنوات (م/85)";
    } else if (serviceYears < 10) {
      esobPercent = 2 / 3;
      esobNote = "ثلثا المكافأة (66.7٪) — استقالة أكثر من 5 سنوات وأقل من 10 سنوات (م/85)";
    } else {
      esobNote = "المكافأة كاملة (100٪) — الاستقالة بعد 10 سنوات أو أكثر (م/85)";
    }
  }
  return { y1, y2, fullGratuity, esobPercent, esobNote, eosb: fullGratuity * esobPercent };
}

export function calculateFinalSettlement(i) {
  const basic = toNum(i.basicSalary);
  const totalWage = basic + toNum(i.housingAllowance) + toNum(i.transportAllowance) + toNum(i.otherAllowances);
  const divisor = toNum(i.monthlyDivisor) || 30;
  const dailyWage = totalWage / divisor;

  const serviceMonths = calcServiceMonths(i.joiningDate, i.lastWorkingDate);
  const serviceYears = serviceMonths / 12;

  const defaultDaysWorked = lastMonthDefaultDays(i.lastWorkingDate, divisor);
  const daysWorked = i.customLastMonthDays !== "" && i.customLastMonthDays != null ? toNum(i.customLastMonthDays) : defaultDaysWorked;
  const lastMonthPay = dailyWage * daysWorked;

  const { y1, y2, fullGratuity, esobPercent, esobNote, eosb } = saudiEosb(serviceYears, totalWage, i.terminationReason);

  const leaveDays = toNum(i.unusedLeaveDays);
  const leaveBase = i.leaveWageBase === "basic" ? basic : totalWage;
  const leaveDailyRate = leaveBase / divisor;
  const leavePay = leaveDays * leaveDailyRate;

  let noticePay = 0;
  let noticeNote = "";
  let missedDays = 0;
  if (i.contractType === "indefinite") {
    const required = toNum(i.noticeRequired);
    const served = Math.min(toNum(i.noticeServed), required);
    missedDays = Math.max(0, required - served);
    noticePay = dailyWage * missedDays;
    if (required === 0) noticeNote = "لم تُحدد مهلة إشعار";
    else if (missedDays === 0) noticeNote = "فترة الإشعار خُدمت كاملة — لا تعويض إضافي";
    else
      noticeNote =
        i.noticeBeneficiary === "employee"
          ? `${missedDays} يوم إشعار غير مخدوم — تعويض للموظف (+)`
          : `${missedDays} يوم إشعار غير مخدوم — خصم لصاحب العمل (-)`;
  } else {
    noticeNote = "عقد محدد المدة — أحكام مهلة الإشعار (م/75) لا تنطبق";
  }

  const noticeAddition = i.contractType === "indefinite" && i.noticeBeneficiary === "employee" ? noticePay : 0;
  const noticeDeduction = i.contractType === "indefinite" && i.noticeBeneficiary === "employer" ? noticePay : 0;

  const addTotal = toNum(i.unpaidSalary) + toNum(i.overtimeAmount) + toNum(i.bonuses) + toNum(i.otherAdditions);
  const dedBase = toNum(i.loans) + toNum(i.companyAssets) + toNum(i.otherDeductions);
  const totalDeductions = dedBase + noticeDeduction;

  const grossDues = lastMonthPay + eosb + leavePay + noticeAddition + addTotal;
  const netSettlement = grossDues - totalDeductions;

  return {
    totalWage, basic, daily: dailyWage, divisor,
    serviceMonths, serviceYears,
    daysWorked, lastMonthPay,
    eosb, fullGratuity, esobPercent, esobNote, y1, y2,
    y1Full: totalWage * 0.5 * y1, y2Full: totalWage * 1.0 * y2,
    leaveDays, leaveDailyRate, leavePay, leaveBase,
    noticePay, noticeNote, missedDays, noticeAddition, noticeDeduction,
    addTotal, dedBase, dedTotal: totalDeductions,
    unpaidSalary: toNum(i.unpaidSalary), overtimeAmount: toNum(i.overtimeAmount),
    bonuses: toNum(i.bonuses), otherAdditions: toNum(i.otherAdditions),
    loans: toNum(i.loans), companyAssets: toNum(i.companyAssets), otherDeductions: toNum(i.otherDeductions),
    grossDues, netSettlement,
  };
}
