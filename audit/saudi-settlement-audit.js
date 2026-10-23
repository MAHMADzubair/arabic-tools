const fs = require('fs');
// Helper functions extracted from component
function toNum(v) { const n = parseFloat(String(v)); return isNaN(n) || n < 0 ? 0 : n; }
function fmt(n) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function todayLocal() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function parseLocal(str) { if (!str) return new Date(NaN); const [y,m,d] = str.split('-').map(Number); return new Date(y, (m||1)-1, d||1); }
function calcServiceMonths(startStr, endStr) {
  const s = parseLocal(startStr);
  const e = parseLocal(endStr);
  if (isNaN(s)||isNaN(e)||e<=s) return 0;
  const years = e.getFullYear() - s.getFullYear();
  const months = e.getMonth() - s.getMonth();
  const days = e.getDate() - s.getDate();
  let totalMonths = years*12 + months;
  if (days >= 0) totalMonths += days/30; else { const dim = new Date(e.getFullYear(), e.getMonth(), 0).getDate(); totalMonths -= 1; totalMonths += (dim + days) / dim; }
  return Math.max(0,totalMonths);
}
function getLastMonthDays(dateStr) { const d = parseLocal(dateStr); return isNaN(d) ? 0 : d.getDate(); }
function formatDuration(totalMonths) { const years = Math.floor(totalMonths/12); const months = Math.floor(totalMonths%12); const days = Math.round(((totalMonths%12)-months)*30); const parts=[]; if (years>0) parts.push(`${years} ${years===1?'سنة':'سنوات'}`); if (months>0) parts.push(`${months} ${months===1?'شهر':'أشهر'}`); if (days>0 && years===0) parts.push(`${days} يوماً`); return parts.length? parts.join(' و') : 'أقل من شهر'; }
function calc(params) {
  const {
    basicSalary='8000', housingAllowance='2000', transportAllowance='1000', otherAllowances='0', monthlyDivisor='30',
    joiningDate='2021-01-01', lastWorkingDate='2023-01-01', customLastMonthDays='', contractType='indefinite',
    terminationReason='resign', unusedLeaveDays='0', leaveWageBase='actual', noticeRequired='30', noticeServed='30',
    noticeBeneficiary='employer', unpaidSalary='0', overtimeAmount='0', bonuses='0', otherAdditions='0', loans='0',
    companyAssets='0', otherDeductions='0'
  } = params;
  const basic = toNum(basicSalary);
  const totalWage = basic + toNum(housingAllowance) + toNum(transportAllowance) + toNum(otherAllowances);
  const divisor = toNum(monthlyDivisor) || 30;
  const dailyWage = totalWage / divisor;
  const serviceMonths = calcServiceMonths(joiningDate, lastWorkingDate);
  const serviceYears = serviceMonths / 12;
  const defaultDaysWorked = Math.min(getLastMonthDays(lastWorkingDate), divisor);
  const daysWorked = customLastMonthDays!=='' ? toNum(customLastMonthDays) : defaultDaysWorked;
  const lastMonthPay = dailyWage * daysWorked;
  const y1 = Math.min(serviceYears,5);
  const y2 = Math.max(0, serviceYears-5);
  const fullGratuity = totalWage * 0.5 * y1 + totalWage * 1.0 * y2;
  let esobPercent = 1.0;
  if (['terminate','retire','mutual','fixed_expired'].includes(terminationReason)) {
    // full
  } else if (terminationReason==='female_special') {
    // full special
  } else if (terminationReason==='resign') {
    if (serviceYears < 2) esobPercent = 0;
    else if (serviceYears <= 5) esobPercent = 1/3;
    else if (serviceYears < 10) esobPercent = 2/3;
    else esobPercent = 1.0;
  }
  const eosb = fullGratuity * esobPercent;
  const leaveDays = toNum(unusedLeaveDays);
  const leaveBase = leaveWageBase==='basic' ? basic : totalWage;
  const leaveDailyRate = leaveBase / divisor;
  const leavePay = leaveDays * leaveDailyRate;
  let noticePay = 0; let missedDays = 0; let noticeNote='';
  if (contractType==='indefinite') {
    const required = toNum(noticeRequired);
    const served = Math.min(toNum(noticeServed), required);
    missedDays = Math.max(0, required - served);
    noticePay = dailyWage * missedDays;
    if (required===0) noticeNote='لم تُحدد مهلة إشعار';
    else if (missedDays===0) noticeNote='فترة الإشعار خُدمت كاملة — لا تعويض إضافي';
    else noticeNote = noticeBeneficiary==='employee' ? `${missedDays} يوم اشعار غير مخدوم — تعويض للموظف (+)` : `${missedDays} يوم اشعار غير مخدوم — خصم لصاحب العمل (-)`;
  } else {
    noticeNote='عقد محدد المدة — احكام مهلة الاشعار (م/75) لا تنطبق';
  }
  const noticeAddition = contractType==='indefinite' && noticeBeneficiary==='employee' ? noticePay : 0;
  const noticeDeduction = contractType==='indefinite' && noticeBeneficiary==='employer' ? noticePay : 0;
  const addTotal = toNum(unpaidSalary)+toNum(overtimeAmount)+toNum(bonuses)+toNum(otherAdditions);
  const dedBase = toNum(loans)+toNum(companyAssets)+toNum(otherDeductions);
  const totalDeductions = dedBase + noticeDeduction;
  const grossDues = lastMonthPay + eosb + leavePay + noticeAddition + addTotal;
  const netSettlement = grossDues - totalDeductions;
  return {basic,totalWage,serviceYears,serviceMonths,serviceDurationLabel:formatDuration(serviceMonths),daysWorked,lastMonthPay,fullGratuity,eosb,esobPercent,leaveDays,leavePay,noticePay,noticeNote,missedDays,noticeAddition,noticeDeduction,addTotal,dedBase,totalDeductions,grossDues,netSettlement};
}
function runCases() {
  const cases = [
    {name:'Resign 2 years exact', terminationReason:'resign', joiningDate:'2021-01-01', lastWorkingDate:'2023-01-01'},
    {name:'Resign 5 years exact', terminationReason:'resign', joiningDate:'2018-01-01', lastWorkingDate:'2023-01-01'},
    {name:'Resign 10 years exact', terminationReason:'resign', joiningDate:'2013-01-01', lastWorkingDate:'2023-01-01'},
    {name:'Terminate (employer) 3 years', terminationReason:'terminate', joiningDate:'2020-01-01', lastWorkingDate:'2023-01-01'},
    {name:'Female special 4 years', terminationReason:'female_special', joiningDate:'2019-01-01', lastWorkingDate:'2023-01-01'},
    {name:'Fixed contract 3 years', terminationReason:'fixed_expired', contractType:'fixed', joiningDate:'2020-01-01', lastWorkingDate:'2023-01-01'}
  ];
  for (const c of cases) {
    const res = calc(c);
    console.log(c.name, JSON.stringify({serviceYears: res.serviceYears.toFixed(2), net: fmt(res.netSettlement), gross: fmt(res.grossDues), eosb: fmt(res.eosb), leavePay: fmt(res.leavePay), noticePay: fmt(res.noticePay) }));
  }
}
runCases();
