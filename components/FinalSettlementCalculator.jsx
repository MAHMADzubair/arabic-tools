"use client";

import { useState, useMemo, useEffect, useRef, useId } from "react";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function toNum(v) {
  const n = parseFloat(String(v));
  return isNaN(n) || n < 0 ? 0 : n;
}

function fmt(n) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Local (not UTC) YYYY-MM-DD */
function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Parse YYYY-MM-DD as a local date so timezone never shifts the day */
function parseLocal(str) {
  if (!str) return new Date(NaN);
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function calcServiceMonths(startStr, endStr) {
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

function getLastMonthDays(dateStr) {
  const d = parseLocal(dateStr);
  return isNaN(d) ? 0 : d.getDate();
}

function formatDuration(totalMonths) {
  const years = Math.floor(totalMonths / 12);
  const months = Math.floor(totalMonths % 12);
  const days = Math.round(((totalMonths % 12) - months) * 30);
  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "سنة" : "سنوات"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "شهر" : "أشهر"}`);
  if (days > 0 && years === 0) parts.push(`${days} يوماً`);
  return parts.length ? parts.join(" و") : "أقل من شهر";
}

const REASONS = [
  { id: "terminate", label: "فسخ من صاحب العمل" },
  { id: "resign", label: "استقالة الموظف" },
  { id: "retire", label: "تقاعد / بلوغ السن" },
  { id: "mutual", label: "إنهاء بالتراضي" },
  { id: "fixed_expired", label: "انتهاء عقد محدد" },
  { id: "female_special", label: "استثناء المرأة (م/87)" },
];

// ─── Styles (tokens: --c-* with fallbacks) ─────────────────────────────────────
const CSS = `
.fs{--bg:var(--c-bg,#F5F5F2);--ink:var(--c-ink,#0D0D0D);--ac:var(--c-accent,#FF6A1A);--sf:var(--c-surface,#FFFFFF);--mu:var(--c-muted,#55554F);--ln:var(--c-line,#0D0D0D);--er:var(--error,#B42318);color:var(--ink);font-size:15px;line-height:1.6}
@media (prefers-color-scheme:dark){.fs{--bg:var(--c-bg,#0D0D0D);--ink:var(--c-ink,#F5F5F2);--sf:var(--c-surface,#161616);--mu:var(--c-muted,#A8A8A0);--ln:var(--c-line,#F5F5F2);--er:var(--error,#FF8A80)}}
.fs *{box-sizing:border-box}
.fs h1,.fs h2,.fs h3{margin:0;line-height:1.25}
.fs-stack{display:flex;flex-direction:column;gap:20px}
.fs-card{background:var(--sf);border:2px solid var(--ln);padding:20px;display:flex;flex-direction:column;gap:16px}
.fs-head{display:flex;align-items:center;gap:12px;border-bottom:2px solid var(--ln);padding-bottom:12px}
.fs-num{width:32px;height:32px;flex:none;display:grid;place-items:center;background:var(--ink);color:var(--bg);font-weight:800;font-size:14px}
.fs-head h2{font-size:18px;font-weight:800}
.fs-grid{display:grid;gap:12px;grid-template-columns:1fr}
@media(min-width:640px){.fs-g2{grid-template-columns:1fr 1fr}.fs-g3{grid-template-columns:1fr 1fr 1fr}}
.fs-label{display:block;font-size:13px;font-weight:700;margin-bottom:6px}
.fs-note-s{margin:6px 0 0;font-size:12px;color:var(--mu)}
.fs-in{width:100%;border:1px solid var(--ln);background:var(--bg);color:var(--ink);padding:10px 12px;font:inherit;font-size:15px;border-radius:0;min-height:44px}
.fs-in:focus-visible,.fs-btn:focus-visible,.fs-tg:focus-visible{outline:3px solid var(--ac);outline-offset:2px}
.fs-tgrid{display:grid;gap:8px;grid-template-columns:1fr 1fr}
@media(min-width:640px){.fs-t3{grid-template-columns:1fr 1fr 1fr}}
.fs-tg{border:1px solid var(--ln);background:var(--sf);color:var(--ink);padding:10px 12px;text-align:right;font:inherit;font-size:13px;font-weight:600;cursor:pointer;min-height:44px}
.fs-tg small{display:block;font-weight:400;font-size:11px;color:var(--mu);margin-top:2px}
.fs-tg[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink);font-weight:800}
.fs-tg[aria-pressed="true"] small{color:var(--bg);opacity:.8}
.fs-note{border:1px solid var(--ln);padding:12px 14px;font-size:13px}
.fs-note.warn{border-style:dashed}
.fs-note.bad{border-width:3px;border-color:var(--er);color:var(--er);font-weight:700}
.fs-note.fix{border-width:3px}
.fs-box{border:1px solid var(--ln);background:var(--bg);padding:14px;display:flex;flex-direction:column;gap:8px;font-size:14px}
.fs-row{display:flex;justify-content:space-between;gap:12px;align-items:baseline}
.fs-row b{white-space:nowrap}
.fs-total{border:2px solid var(--ln);padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:12px;font-weight:800}
.fs-total span:last-child{font-size:22px;font-weight:900}
.fs-sub{font-size:13px;font-weight:800;margin:0 0 10px}
.fs-sub.ded{color:var(--er)}
.fs-res{border:2px solid var(--ln);background:var(--sf)}
.fs-hero{background:var(--ac);color:#0D0D0D;padding:24px;border-bottom:2px solid var(--ln)}
.fs-hero p{margin:0}
.fs-hero .big{font-size:clamp(34px,8vw,52px);font-weight:900;line-height:1.1;margin-top:6px}
.fs-hero .big span{font-size:22px;font-weight:800}
.fs-bd{padding:20px;display:flex;flex-direction:column;gap:6px}
.fs-line{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--ln)}
.fs-line .t{font-weight:700;font-size:14px}
.fs-line .s{font-size:12px;color:var(--mu);margin-top:2px}
.fs-line .a{font-weight:800;white-space:nowrap}
.fs-line.gross{border-top:2px solid var(--ln);border-bottom:2px solid var(--ln);background:var(--bg);padding-inline:10px}
.fs-line.ded .t,.fs-line.ded .a{color:var(--er)}
.fs-line.net{background:var(--ac);color:#0D0D0D;border:2px solid var(--ln);padding:14px 12px;margin-top:8px}
.fs-line.net .t,.fs-line.net .a{font-size:17px;font-weight:900;color:#0D0D0D}
.fs-acts{display:flex;flex-wrap:wrap;gap:10px;padding:16px 20px 20px;border-top:2px solid var(--ln)}
.fs-btn{border:2px solid var(--ln);background:var(--sf);color:var(--ink);padding:10px 16px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;min-height:44px}
.fs-btn:hover{background:var(--ink);color:var(--bg)}
.fs-btn.pri{background:var(--ac);color:#0D0D0D}
.fs-btn.pri:hover{background:var(--ink);color:var(--bg)}
.fs-exp{width:100%;text-align:right;background:none;border:0;border-top:2px solid var(--ln);color:var(--ink);padding:14px 20px;font:inherit;font-size:14px;font-weight:800;cursor:pointer;display:flex;justify-content:space-between;min-height:44px}
.fs-exp:focus-visible{outline:3px solid var(--ac);outline-offset:-3px}
.fs-calcs{padding:0 20px 20px;display:flex;flex-direction:column;gap:10px}
.fs-calc{border:1px solid var(--ln);padding:12px;background:var(--bg)}
.fs-calc p{margin:0}
.fs-calc .f{font-size:12px;margin:4px 0;word-break:break-word}
.fs-calc .l{font-size:12px;color:var(--mu)}
.fs-disc{margin:0 20px 16px;border:1px dashed var(--ln);padding:12px 14px;font-size:12px}
.fs-modal{position:fixed;inset:0;z-index:50;background:rgba(13,13,13,.75);overflow-y:auto;padding:16px;display:flex;justify-content:center;align-items:flex-start}
.fs-sheet{width:100%;max-width:720px;background:#fff;color:#0D0D0D;border:2px solid #0D0D0D}
.fs-bar{position:sticky;top:0;background:#fff;border-bottom:2px solid #0D0D0D;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;gap:8px;z-index:2;flex-wrap:wrap}
.fs-bar .fs-btn{background:#fff;color:#0D0D0D;border-color:#0D0D0D;padding:6px 12px;min-height:40px}
.fs-bar .fs-btn.pri{background:#FF6A1A}
.fs-bar .fs-btn:hover{background:#0D0D0D;color:#fff}
.fs-paper{padding:28px;display:flex;flex-direction:column;gap:22px;color:#0D0D0D;background:#fff;font-size:14px}
.fs-paper h3{font-size:14px;font-weight:800;border-bottom:1px solid #0D0D0D;padding-bottom:4px;margin-bottom:10px}
.fs-paper table{width:100%;border-collapse:collapse}
.fs-paper th,.fs-paper td{border:1px solid #0D0D0D;padding:8px 10px;text-align:right}
.fs-paper thead th{background:#0D0D0D;color:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.fs-paper tr.g td{background:#EDEDEA;font-weight:800;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.fs-paper tfoot td{background:#FF6A1A;color:#0D0D0D;font-weight:900;border-width:2px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.fs-info{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px}
.fs-info small{display:block;font-size:11px;font-weight:700;color:#55554F}
.fs-sig{display:grid;grid-template-columns:1fr 1fr;gap:40px;text-align:center;font-size:12px}
.fs-sig .ln{border-bottom:2px solid #0D0D0D;height:44px;margin:8px 8px 6px}
@media print{
  body *{visibility:hidden}
  #settlement-document,#settlement-document *{visibility:visible}
  #settlement-document{position:absolute;inset:0;width:100%;padding:12mm}
}
@media (prefers-reduced-motion:reduce){.fs *{transition:none!important}}
`;

// ─── Sub-components ────────────────────────────────────────────────────────────
function SectionHeader({ num, title }) {
  return (
    <div className="fs-head">
      <div className="fs-num" aria-hidden="true">{num}</div>
      <h2>{title}</h2>
    </div>
  );
}

function Field({ label, note, children }) {
  const id = useId();
  return (
    <div>
      <label className="fs-label" htmlFor={id}>{label}</label>
      {children(id)}
      {note && <p className="fs-note-s">{note}</p>}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <Field label={label}>
      {(id) => (
        <input id={id} type="text" className="fs-in" value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

function NumInput({ label, value, onChange, note }) {
  return (
    <Field label={label} note={note}>
      {(id) => (
        <input id={id} type="number" inputMode="decimal" min="0" className="fs-in" value={value}
          onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

function DateInput({ label, value, onChange }) {
  return (
    <Field label={label}>
      {(id) => (
        <input id={id} type="date" className="fs-in" value={value}
          onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

function ToggleGroup({ label, options, value, onChange, cols3 }) {
  return (
    <div role="group" aria-label={label}>
      <span className="fs-label">{label}</span>
      <div className={`fs-tgrid ${cols3 ? "fs-t3" : ""}`}>
        {options.map((o) => (
          <button key={o.id} type="button" className="fs-tg" aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}>
            {o.label}
            {o.desc && <small>{o.desc}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Line({ label, sub, amount, type }) {
  const ded = type === "deduct";
  return (
    <div className={`fs-line ${type === "gross" ? "gross" : ""} ${ded ? "ded" : ""} ${type === "net" ? "net" : ""}`}>
      <div>
        <p className="t" style={{ margin: 0 }}>{label}</p>
        {sub ? <p className="s" style={{ margin: 0 }}>{sub}</p> : null}
      </div>
      <p className="a" style={{ margin: 0 }}>
        {ded && amount > 0 ? "−" : ""}{fmt(Math.abs(amount))} ر.س
      </p>
    </div>
  );
}

function CalcExplain({ title, formula, law }) {
  return (
    <div className="fs-calc">
      <p style={{ fontSize: 13, fontWeight: 800 }}>{title}</p>
      <p className="f">{formula}</p>
      <p className="l">{law}</p>
    </div>
  );
}

function DocRow({ label, value, cls }) {
  return (
    <tr className={cls}>
      <td>{label}</td>
      <td>{value}</td>
    </tr>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function FinalSettlementCalculator() {
  const [employeeName, setEmployeeName] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [position, setPosition] = useState("");

  const [contractType, setContractType] = useState("indefinite");
  const [terminationReason, setTerminationReason] = useState("terminate");
  const [joiningDate, setJoiningDate] = useState("2021-01-01");
  const [lastWorkingDate, setLastWorkingDate] = useState("");
  const [customLastMonthDays, setCustomLastMonthDays] = useState("");

  const [basicSalary, setBasicSalary] = useState("8000");
  const [housingAllowance, setHousingAllowance] = useState("2000");
  const [transportAllowance, setTransportAllowance] = useState("1000");
  const [otherAllowances, setOtherAllowances] = useState("0");
  const [monthlyDivisor, setMonthlyDivisor] = useState("30");

  const [unusedLeaveDays, setUnusedLeaveDays] = useState("0");
  const [leaveWageBase, setLeaveWageBase] = useState("actual");

  const [noticeRequired, setNoticeRequired] = useState("60");
  const [noticeServed, setNoticeServed] = useState("0");
  const [noticeBeneficiary, setNoticeBeneficiary] = useState("employee");

  const [unpaidSalary, setUnpaidSalary] = useState("0");
  const [overtimeAmount, setOvertimeAmount] = useState("0");
  const [bonuses, setBonuses] = useState("0");
  const [otherAdditions, setOtherAdditions] = useState("0");

  const [loans, setLoans] = useState("0");
  const [companyAssets, setCompanyAssets] = useState("0");
  const [otherDeductions, setOtherDeductions] = useState("0");

  const [showDocument, setShowDocument] = useState(false);
  const [expandedCalc, setExpandedCalc] = useState(false);
  const [copied, setCopied] = useState(false);
  const [calcDate, setCalcDate] = useState("");

  // Client-only dates (avoids hydration mismatch and UTC off-by-one)
  useEffect(() => {
    setLastWorkingDate(todayLocal());
    setCalcDate(new Date().toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric" }));
  }, []);

  const handleTerminationChange = (rId) => {
    setTerminationReason(rId);
    if (rId === "resign") {
      setNoticeBeneficiary("employer");
      setNoticeRequired("30");
    } else if (rId === "terminate") {
      setNoticeBeneficiary("employee");
      setNoticeRequired("60");
    }
  };

  const track = (name, data) => {
    if (typeof window !== "undefined" && typeof window.trackEvent === "function") {
      window.trackEvent(name, data);
    }
  };

  // ─── Calculation (unchanged except daysWorked cap) ───────────────────────────
  const calc = useMemo(() => {
    const basic = toNum(basicSalary);
    const totalWage = basic + toNum(housingAllowance) + toNum(transportAllowance) + toNum(otherAllowances);
    const divisor = toNum(monthlyDivisor) || 30;
    const dailyWage = totalWage / divisor;

    const serviceMonths = calcServiceMonths(joiningDate, lastWorkingDate);
    const serviceYears = serviceMonths / 12;

    const defaultDaysWorked = Math.min(getLastMonthDays(lastWorkingDate), divisor);
    const daysWorked = customLastMonthDays !== "" ? toNum(customLastMonthDays) : defaultDaysWorked;
    const lastMonthPay = dailyWage * daysWorked;

    const y1 = Math.min(serviceYears, 5);
    const y2 = Math.max(0, serviceYears - 5);
    const fullGratuity = totalWage * 0.5 * y1 + totalWage * 1.0 * y2;

    let esobPercent = 1.0;
    let esobNote = "";
    if (["terminate", "retire", "mutual", "fixed_expired"].includes(terminationReason)) {
      esobNote = "استحقاق كامل (100٪) وفق المادة (84) من نظام العمل";
    } else if (terminationReason === "female_special") {
      esobNote = "استحقاق كامل استثنائي بموجب المادة (87) من نظام العمل";
    } else if (terminationReason === "resign") {
      if (serviceYears < 2) {
        esobPercent = 0;
        esobNote = "لا يستحق مكافأة — الاستقالة قبل اكتمال سنتين خدمة (م/85)";
      } else if (serviceYears < 5) {
        esobPercent = 1 / 3;
        esobNote = "ثلث المكافأة (33.3٪) — استقالة بين سنتين و5 سنوات (م/85)";
      } else if (serviceYears < 10) {
        esobPercent = 2 / 3;
        esobNote = "ثلثا المكافأة (66.7٪) — استقالة بين 5 و10 سنوات (م/85)";
      } else {
        esobNote = "المكافأة كاملة (100٪) — الاستقالة بعد 10 سنوات أو أكثر (م/85)";
      }
    }
    const eosb = fullGratuity * esobPercent;

    const leaveDays = toNum(unusedLeaveDays);
    const leaveBase = leaveWageBase === "basic" ? basic : totalWage;
    const leaveDailyRate = leaveBase / divisor;
    const leavePay = leaveDays * leaveDailyRate;

    let noticePay = 0;
    let noticeNote = "";
    let missedDays = 0;
    if (contractType === "indefinite") {
      const required = toNum(noticeRequired);
      const served = Math.min(toNum(noticeServed), required);
      missedDays = Math.max(0, required - served);
      noticePay = dailyWage * missedDays;
      if (required === 0) noticeNote = "لم تُحدد مهلة إشعار";
      else if (missedDays === 0) noticeNote = "فترة الإشعار خُدمت كاملة — لا تعويض إضافي";
      else
        noticeNote =
          noticeBeneficiary === "employee"
            ? `${missedDays} يوم اشعار غير مخدوم — تعويض للموظف (+)`
            : `${missedDays} يوم اشعار غير مخدوم — خصم لصاحب العمل (-)`;
    } else {
      noticeNote = "عقد محدد المدة — احكام مهلة الاشعار (م/75) لا تنطبق";
    }

    const noticeAddition = contractType === "indefinite" && noticeBeneficiary === "employee" ? noticePay : 0;
    const noticeDeduction = contractType === "indefinite" && noticeBeneficiary === "employer" ? noticePay : 0;

    const addTotal = toNum(unpaidSalary) + toNum(overtimeAmount) + toNum(bonuses) + toNum(otherAdditions);
    const dedBase = toNum(loans) + toNum(companyAssets) + toNum(otherDeductions);
    const totalDeductions = dedBase + noticeDeduction;

    const grossDues = lastMonthPay + eosb + leavePay + noticeAddition + addTotal;
    const netSettlement = grossDues - totalDeductions;

    return {
      totalWage, basic, daily: dailyWage, divisor,
      serviceMonths, serviceYears, serviceDurationLabel: formatDuration(serviceMonths),
      daysWorked, lastMonthPay,
      eosb, fullGratuity, esobPercent, esobNote, y1, y2,
      y1Full: totalWage * 0.5 * y1, y2Full: totalWage * 1.0 * y2,
      leaveDays, leaveDailyRate, leavePay, leaveBase,
      noticePay, noticeNote, missedDays, noticeAddition, noticeDeduction,
      addTotal, dedBase, dedTotal: totalDeductions,
      unpaidSalary: toNum(unpaidSalary), overtimeAmount: toNum(overtimeAmount),
      bonuses: toNum(bonuses), otherAdditions: toNum(otherAdditions),
      loans: toNum(loans), companyAssets: toNum(companyAssets), otherDeductions: toNum(otherDeductions),
      grossDues, netSettlement,
    };
  }, [
    basicSalary, housingAllowance, transportAllowance, otherAllowances, monthlyDivisor,
    joiningDate, lastWorkingDate, customLastMonthDays, terminationReason, contractType,
    unusedLeaveDays, leaveWageBase, noticeRequired, noticeServed, noticeBeneficiary,
    unpaidSalary, overtimeAmount, bonuses, otherAdditions, loans, companyAssets, otherDeductions,
  ]);

  // Tracking: calculator_used once; result_generated debounced (not per keystroke)
  const usedRef = useRef(false);
  useEffect(() => {
    if (usedRef.current) return;
    usedRef.current = true;
    track("calculator_used", { tool: "final-settlement" });
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      track("result_generated", {
        tool: "final-settlement",
        termination_reason: terminationReason,
        contract_type: contractType,
        net_amount: Math.round(calc.netSettlement),
        eosb: Math.round(calc.eosb),
        leave_pay: Math.round(calc.leavePay),
      });
    }, 2000);
    return () => clearTimeout(t);
  }, [calc.netSettlement, terminationReason, contractType]);

  const shareText = useMemo(
    () => `ملخص تصفية المخالصة النهائية (Saudi Final Settlement):
• مدة الخدمة: ${calc.serviceDurationLabel} (${calc.serviceYears.toFixed(2)} سنة)
• الأجر الفعلي الشهري: ${fmt(calc.totalWage)} ر.س
• مكافأة نهاية الخدمة (م/84 و85): ${fmt(calc.eosb)} ر.س
• آخر راتب مستحق: ${fmt(calc.lastMonthPay)} ر.س
• بدل رصيد الإجازات (م/111): ${fmt(calc.leavePay)} ر.س
• بدل مهلة الإشعار: ${calc.noticeAddition > 0 ? `+${fmt(calc.noticeAddition)} ر.س (للموظف)` : calc.noticeDeduction > 0 ? `-${fmt(calc.noticeDeduction)} ر.س (خصم)` : "0 ر.س"}
• إجمالي الخصومات (سلف وعهد): -${fmt(calc.dedBase)} ر.س
═════════════════════════
صافي المخالصة النهائية المستحقة: ${fmt(calc.netSettlement)} ر.س

احسب مخالصتك وأنشئ نموذجك التقديري مجاناً:
${process.env.NEXT_PUBLIC_SITE_URL || "https://arabic-tools-xi.vercel.app"}/ar/sa/final-settlement-calculator`,
    [calc]
  );

  const reasonLabel = REASONS.find((r) => r.id === terminationReason)?.label || "";
  const gratuityStatus =
    calc.esobPercent === 1 ? { cls: "", mark: "✓ مستحقة كاملة" } :
    calc.esobPercent === 0 ? { cls: "bad", mark: "✗ غير مستحقة" } :
    { cls: "warn", mark: "! مستحقة جزئياً" };

  return (
    <div className="fs fs-stack">
      <style>{CSS}</style>

      {/* Header */}
      <div className="fs-card" style={{ borderWidth: 3 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 900 }}>حاسبة المخالصة النهائية في السعودية</h1>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--mu)" }}>
              تصفية كاملة لجميع مستحقات العامل وفق المواد 75 و84 و85 و111 من نظام العمل
            </p>
          </div>
          <span style={{ border: "1px solid var(--ln)", padding: "4px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
            محدث 2026 — نظام العمل السعودي
          </span>
        </div>
      </div>

      {/* 1 */}
      <section className="fs-card" aria-labelledby="s1">
        <SectionHeader num="1" title="بيانات الموظف والعقد" />
        <div className="fs-grid fs-g2">
          <TextInput label="اسم الموظف (للنموذج)" value={employeeName} onChange={setEmployeeName} placeholder="محمد علي الزهراني" />
          <TextInput label="اسم جهة العمل / الشركة" value={employerName} onChange={setEmployerName} placeholder="شركة الخليج للمقاولات" />
          <TextInput label="المسمى الوظيفي" value={position} onChange={setPosition} placeholder="مهندس مدني أول" />
          <TextInput label="رقم الهوية الوطنية / الإقامة" value={employeeId} onChange={setEmployeeId} placeholder="1xxxxxxxxx" />
        </div>

        <ToggleGroup
          label="نوع العقد"
          value={contractType}
          onChange={setContractType}
          options={[
            { id: "indefinite", label: "عقد غير محدد المدة", desc: "مفتوح بدون تاريخ انتهاء" },
            { id: "fixed", label: "عقد محدد المدة", desc: "بتاريخ انتهاء مسبق" },
          ]}
        />

        <ToggleGroup
          label="سبب إنهاء العلاقة العمالية"
          value={terminationReason}
          onChange={handleTerminationChange}
          options={REASONS}
          cols3
        />

        <div className="fs-grid fs-g3">
          <DateInput label="تاريخ الالتحاق بالعمل" value={joiningDate} onChange={setJoiningDate} />
          <DateInput label="آخر يوم عمل فعلي" value={lastWorkingDate} onChange={setLastWorkingDate} />
          <NumInput
            label="أيام عمل الشهر الأخير (لآخر راتب)"
            value={customLastMonthDays !== "" ? customLastMonthDays : calc.daysWorked}
            onChange={setCustomLastMonthDays}
            note="تُحتسب تلقائياً من تاريخ الخروج، ويمكن تعديلها"
          />
        </div>

        {calc.serviceMonths > 0 && (
          <div className="fs-box fs-row" style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600 }}>مدة الخدمة المحتسبة</span>
            <span style={{ textAlign: "right" }}>
              <b>{calc.serviceDurationLabel}</b>
              <span className="fs-note-s" style={{ display: "block", margin: 0 }}>({calc.serviceYears.toFixed(3)} سنة)</span>
            </span>
          </div>
        )}
      </section>

      {/* 2 */}
      <section className="fs-card">
        <SectionHeader num="2" title="هيكل الراتب والأجر الفعلي" />
        <div className="fs-grid fs-g2">
          <NumInput label="الراتب الأساسي الشهري (ر.س)" value={basicSalary} onChange={setBasicSalary} />
          <NumInput label="بدل السكن الشهري (ر.س)" value={housingAllowance} onChange={setHousingAllowance} />
          <NumInput label="بدل النقل الشهري (ر.س)" value={transportAllowance} onChange={setTransportAllowance} />
          <NumInput label="بدلات ثابتة دورية أخرى (ر.س)" value={otherAllowances} onChange={setOtherAllowances} />
        </div>

        <div>
          <ToggleGroup
            label="قاسم الشهر لحساب الأجر اليومي"
            value={monthlyDivisor}
            onChange={setMonthlyDivisor}
            cols3
            options={[
              { id: "30", label: "÷30", desc: "الأشيع بالسعودية" },
              { id: "26", label: "÷26", desc: "بعض العقود" },
              { id: "22", label: "÷22", desc: "أيام العمل الفعلية" },
            ]}
          />
          <p className="fs-note-s">
            ÷30 هو الأساس الافتراضي الأكثر استخداماً في عقود العمل السعودية. يمكن تغييره إن نصّ العقد على خلاف ذلك.
          </p>
        </div>

        <div className="fs-grid fs-g3">
          {[
            ["الأجر الفعلي الإجمالي", calc.totalWage, true],
            ["الأجر اليومي", calc.daily, false],
            ["أجر الساعة (÷8)", calc.daily / 8, false],
          ].map(([l, v, hi]) => (
            <div key={l} className="fs-box" style={{ borderWidth: hi ? 3 : 1, gap: 2 }}>
              <span style={{ fontSize: 12, color: "var(--mu)" }}>{l}</span>
              <b style={{ fontSize: 16 }}>{fmt(v)} ر.س</b>
            </div>
          ))}
        </div>
      </section>

      {/* 3 */}
      <section className="fs-card">
        <SectionHeader num="3" title="مكافأة نهاية الخدمة — المادتان 84 و 85" />
        <div className="fs-box">
          <div className="fs-row">
            <span>السنوات الأولى (حتى 5 سنوات): {calc.y1.toFixed(2)} سنة × نصف شهر</span>
            <b>{fmt(calc.y1Full)} ر.س</b>
          </div>
          {calc.y2 > 0 && (
            <div className="fs-row">
              <span>السنوات التالية (بعد 5): {calc.y2.toFixed(2)} سنة × شهر كامل</span>
              <b>{fmt(calc.y2Full)} ر.س</b>
            </div>
          )}
          <div className="fs-row" style={{ borderTop: "1px solid var(--ln)", paddingTop: 8, fontWeight: 800 }}>
            <span>المكافأة الأصلية (100٪)</span>
            <b>{fmt(calc.fullGratuity)} ر.س</b>
          </div>
          {calc.esobPercent < 1 && (
            <div className="fs-row" style={{ color: "var(--er)", fontWeight: 700 }}>
              <span>نسبة الاستحقاق المطبقة</span>
              <b>× {(calc.esobPercent * 100).toFixed(1)}٪</b>
            </div>
          )}
        </div>

        <div className={`fs-note ${gratuityStatus.cls}`} role="status">
          <b>{gratuityStatus.mark}</b> — {calc.esobNote}
        </div>

        <div className="fs-total">
          <span>مكافأة نهاية الخدمة المستحقة</span>
          <span>{fmt(calc.eosb)} ر.س</span>
        </div>
      </section>

      {/* 4 */}
      <section className="fs-card">
        <SectionHeader num="4" title="بدل رصيد الإجازة السنوية — المادة 111" />
        <NumInput label="رصيد الإجازة السنوية غير المستنفد (بالأيام)" value={unusedLeaveDays} onChange={setUnusedLeaveDays} />
        <div>
          <ToggleGroup
            label="أساس حساب بدل الإجازة"
            value={leaveWageBase}
            onChange={setLeaveWageBase}
            options={[
              { id: "actual", label: "الأجر الفعلي الإجمالي", desc: "الأشمل — المعتمد قضائياً غالباً" },
              { id: "basic", label: "الراتب الأساسي فقط", desc: "بعض العقود تنص عليه" },
            ]}
          />
          <p className="fs-note-s">
            المادة (111) تُلزم بتعويض نقدي عن الإجازات غير المستنفدة. تعتمد المحاكم العمالية غالباً الأجر الفعلي الإجمالي.
          </p>
        </div>
        {calc.leaveDays > 0 && (
          <div className="fs-box">
            <div className="fs-row">
              <span>أجر اليوم المحتسب ({leaveWageBase === "basic" ? "الأساسي" : "الإجمالي"})</span>
              <b>{fmt(calc.leaveDailyRate)} ر.س</b>
            </div>
            <div className="fs-row">
              <span>الحساب: {calc.leaveDays} يوم × {fmt(calc.leaveDailyRate)} ر.س</span>
              <b>{fmt(calc.leavePay)} ر.س</b>
            </div>
          </div>
        )}
      </section>

      {/* 5 */}
      <section className="fs-card">
        <SectionHeader num="5" title="بدل مهلة الإشعار — المادتان 75 و 76" />
        {contractType === "fixed" ? (
          <div className="fs-note warn">
            <b>! عقد محدد المدة:</b> لا تنطبق أحكام مهلة الإشعار القياسية وفق المادتين (75) و(76) من نظام العمل.
          </div>
        ) : (
          <>
            <div className="fs-note">
              <b>المادة (75):</b> للعقد غير المحدد مع الراتب الشهري — مهلة الاشعار 30 يوماً (استقالة الموظف) او 60 يوماً (انهاء صاحب العمل). الطرف المخل بالمهلة يلتزم بتعويض الطرف الاخر بأجر المدة غير المخدومة.
            </div>

            <ToggleGroup
              label="التعويض لصالح"
              value={noticeBeneficiary}
              onChange={setNoticeBeneficiary}
              options={[
                { id: "employee", label: "للموظف (اضافة +)", desc: "عند انهاء المنشأة للعقد دون اعطاء الموظف مهلة الاشعار كاملة" },
                { id: "employer", label: "لصاحب العمل (خصم −)", desc: "عند استقالة الموظف وتركه العمل فوراً قبل انقضاء مهلة الاشعار" },
              ]}
            />

            <div className="fs-grid fs-g2">
              <NumInput
                label="مهلة الاشعار المطلوبة نظاماً (بالايام)"
                value={noticeRequired}
                onChange={setNoticeRequired}
                note="30 يوماً للاستقالة — 60 يوماً لانهاء صاحب العمل (الحد الادنى)"
              />
              <NumInput label="فترة الاشعار المخدومة فعلياً (بالايام)" value={noticeServed} onChange={setNoticeServed} />
            </div>

            {calc.missedDays > 0 ? (
              <div className={`fs-note ${noticeBeneficiary === "employer" ? "fix" : ""}`}>
                <div className="fs-row"><span>ايام الاشعار غير المخدومة</span><b>{calc.missedDays} يوم</b></div>
                <div className="fs-row" style={{ marginTop: 6 }}>
                  <span>{noticeBeneficiary === "employee" ? "تعويض يُضاف لمستحقات الموظف (+)" : "تعويض يُخصم من مستحقات الموظف (−)"}</span>
                  <b style={{ fontSize: 17 }}>{noticeBeneficiary === "employer" ? "−" : "+"}{fmt(calc.noticePay)} ر.س</b>
                </div>
              </div>
            ) : (
              <div className="fs-note"><b>✓</b> {calc.noticeNote || "فترة الاشعار خُدمت كاملة"}</div>
            )}
          </>
        )}
      </section>

      {/* 6 */}
      <section className="fs-card">
        <SectionHeader num="6" title="مستحقات وخصومات أخرى" />
        <div>
          <p className="fs-sub">إضافات ومستحقات أخرى (+)</p>
          <div className="fs-grid fs-g2">
            <NumInput label="رواتب متأخرة غير مصروفة (ر.س)" value={unpaidSalary} onChange={setUnpaidSalary} />
            <NumInput label="بدل أوفر تايم مستحق (ر.س)" value={overtimeAmount} onChange={setOvertimeAmount} />
            <NumInput label="مكافآت ومنح مستحقة (ر.س)" value={bonuses} onChange={setBonuses} />
            <NumInput label="إضافات أخرى (ر.س)" value={otherAdditions} onChange={setOtherAdditions} />
          </div>
        </div>
        <div style={{ borderTop: "2px solid var(--ln)", paddingTop: 16 }}>
          <p className="fs-sub ded">خصومات واستقطاعات (−)</p>
          <div className="fs-grid fs-g2">
            <NumInput label="سلف وقروض مستحقة للشركة (ر.س)" value={loans} onChange={setLoans} />
            <NumInput label="عهد وأصول شركة غير مُردودة (ر.س)" value={companyAssets} onChange={setCompanyAssets} />
            <NumInput label="خصومات أخرى (ر.س)" value={otherDeductions} onChange={setOtherDeductions} />
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="fs-res" aria-live="polite">
        <div className="fs-hero">
          <p style={{ fontSize: 14, fontWeight: 700 }}>إجمالي المخالصة النهائية الصافية</p>
          <p className="big">{fmt(calc.netSettlement)} <span>ر.س</span></p>
        </div>

        <div className="fs-bd">
          <Line label="آخر راتب مستحق" sub={`${calc.daysWorked} يوماً × ${fmt(calc.daily)} ر.س/يوم`} amount={calc.lastMonthPay} />
          <Line label="مكافأة نهاية الخدمة" sub={calc.esobNote} amount={calc.eosb} />
          <Line
            label="بدل رصيد الإجازة السنوية"
            sub={calc.leaveDays > 0 ? `${calc.leaveDays} يوم × ${fmt(calc.leaveDailyRate)} ر.س` : "لم تُدخل أيام إجازة"}
            amount={calc.leavePay}
          />
          {calc.noticeAddition > 0 && <Line label="بدل مهلة الاشعار (لصالح الموظف)" sub={calc.noticeNote} amount={calc.noticeAddition} />}
          {calc.noticePay === 0 && <Line label="بدل مهلة الاشعار" sub={calc.noticeNote} amount={0} />}
          {calc.addTotal > 0 && <Line label="مستحقات اخرى" amount={calc.addTotal} />}
          <Line label="اجمالي المستحقات" amount={calc.grossDues} type="gross" />
          {calc.noticeDeduction > 0 && (
            <Line label="خصم مهلة الاشعار غير المخدومة (لصاحب العمل)" sub={`${calc.missedDays} يوماً غير مخدومة`} amount={calc.noticeDeduction} type="deduct" />
          )}
          {calc.dedBase > 0 && <Line label="اجمالي الخصومات الاخرى" sub="سلف وعهد مستحقة" amount={calc.dedBase} type="deduct" />}
          <Line label="صافي المخالصة النهائية المستحقة" amount={calc.netSettlement} type="net" />
        </div>

        <button type="button" className="fs-exp" aria-expanded={expandedCalc} onClick={() => setExpandedCalc(!expandedCalc)}>
          <span>كيف تم الحساب؟ — تفصيل الفورمولا القانونية</span>
          <span aria-hidden="true">{expandedCalc ? "−" : "+"}</span>
        </button>
        {expandedCalc && (
          <div className="fs-calcs">
            <CalcExplain
              title="1. آخر راتب مستحق"
              formula={`(${fmt(calc.totalWage)} ر.س ÷ ${calc.divisor}) × ${calc.daysWorked} يوم = ${fmt(calc.lastMonthPay)} ر.س`}
              law="حساب نسبي للأجر اليومي عن أيام الشهر الأخير المعمولة فعلاً"
            />
            <CalcExplain
              title="2. مكافأة نهاية الخدمة"
              formula={`أول 5 سنوات: ${fmt(calc.totalWage)} × 0.5 × ${calc.y1.toFixed(2)} = ${fmt(calc.y1Full)} ر.س${
                calc.y2 > 0 ? ` | بعد 5 سنوات: ${fmt(calc.totalWage)} × 1.0 × ${calc.y2.toFixed(2)} = ${fmt(calc.y2Full)} ر.س` : ""
              } | نسبة الاستحقاق ${(calc.esobPercent * 100).toFixed(1)}٪ → ${fmt(calc.eosb)} ر.س`}
              law="المادة (84) للحساب الأساسي — المادة (85) لتدرج الاستقالة — المادة (87) لاستثناء المرأة"
            />
            <CalcExplain
              title="3. بدل رصيد الإجازة السنوية"
              formula={`${calc.leaveDays} يوم × (${fmt(calc.leaveBase)} ر.س ÷ ${calc.divisor}) = ${calc.leaveDays} × ${fmt(calc.leaveDailyRate)} = ${fmt(calc.leavePay)} ر.س`}
              law="المادة (111) من نظام العمل: حق تعويض نقدي كامل عن الإجازات السنوية غير المستنفدة عند ترك العمل"
            />
            {calc.noticePay > 0 && (
              <CalcExplain
                title="4. بدل مهلة الإشعار"
                formula={`${calc.missedDays} يوم غير مخدوم × ${fmt(calc.daily)} ر.س/يوم = ${fmt(calc.noticePay)} ر.س`}
                law="المادتان (75) و(76): حق التعويض عن فترة الإشعار غير المخدومة في العقود غير المحددة المدة"
              />
            )}
            <CalcExplain
              title="5. الاجمالي والصافي"
              formula={`اجمالي المستحقات ${fmt(calc.grossDues)} - اجمالي الخصومات ${fmt(calc.dedTotal)} = صافي المخالصة ${fmt(calc.netSettlement)} ر.س`}
              law="التصفية الاجمالية النهائية لجميع حقوق ومديونيات الطرفين"
            />
          </div>
        )}

        <div className="fs-disc">
          <b>ملاحظة وإخلاء مسؤولية قانوني:</b> هذه الحاسبة تقديرية واسترشادية لتصفية مستحقات العامل وفق المواد (75، 84، 85، 111) من نظام العمل السعودي الصادر بالمرسوم الملكي (م/51) وتعديلاته. ليست بديلاً عن الاستشارة القانونية أو التسوية الرسمية المعتمدة من جهة العمل. للنزاعات العمالية، يُرجى الرجوع لمنصة <b>ودي</b> التابعة لوزارة الموارد البشرية والتنمية الاجتماعية (hrsd.gov.sa). <b>تاريخ آخر مراجعة:</b> 2026م.
        </div>

        <div className="fs-acts">
          <button type="button" className="fs-btn pri" onClick={() => {
            setShowDocument(true);
            track("print_download_clicked", { tool: "final-settlement", action: "view_document", net_settlement: Math.round(calc.netSettlement) });
          }}>
            إنشاء نموذج مخالصة نهائية قابل للطباعة
          </button>
          <button type="button" className="fs-btn" onClick={() => {
            track("print_download_clicked", { tool: "final-settlement", action: "print_pdf", net_settlement: Math.round(calc.netSettlement) });
            setShowDocument(true);
            setTimeout(() => window.print(), 150);
          }}>
            طباعة
          </button>
          <button type="button" className="fs-btn" onClick={() => {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
            track("share_clicked", { tool: "final-settlement", method: "whatsapp" });
          }}>
            مشاركة عبر واتساب
          </button>
          <button type="button" className="fs-btn" onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(shareText);
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
              track("share_clicked", { tool: "final-settlement", method: "clipboard" });
            }
          }}>
            {copied ? "✓ تم النسخ" : "نسخ الملخص"}
          </button>
        </div>
      </section>

      {/* Document modal (always black on white for clean print) */}
      {showDocument && (
        <div className="fs-modal" role="dialog" aria-modal="true" aria-label="نموذج مخالصة نهائية">
          <div className="fs-sheet">
            <div className="fs-bar">
              <b style={{ fontSize: 14 }}>نموذج مخالصة نهائية تقديرية</b>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="fs-btn pri" onClick={() => {
                  track("print_download_clicked", { tool: "final-settlement", action: "modal_print_pdf", net_settlement: Math.round(calc.netSettlement) });
                  window.print();
                }}>طباعة / PDF</button>
                <button type="button" className="fs-btn" onClick={() => setShowDocument(false)}>إغلاق</button>
              </div>
            </div>

            <div className="fs-paper" id="settlement-document">
              <div style={{ textAlign: "center", borderBottom: "3px solid #0D0D0D", paddingBottom: 16 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900 }}>نموذج مخالصة نهائية تقديرية</h2>
                <p style={{ margin: "6px 0 0", fontSize: 13 }}>Estimated Final Employment Settlement Statement</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#55554F" }}>
                  وفق أحكام نظام العمل السعودي الصادر بالمرسوم الملكي رقم (م/51) وتعديلاته 2026
                </p>
              </div>

              <div>
                <h3>بيانات الأطراف وفترة العقد</h3>
                <div className="fs-info">
                  {[
                    ["اسم الموظف", employeeName || "—"],
                    ["جهة العمل / الشركة", employerName || "—"],
                    ["المسمى الوظيفي", position || "—"],
                    ["رقم الهوية / الإقامة", employeeId || "—"],
                    ["تاريخ الالتحاق", joiningDate],
                    ["آخر يوم عمل", lastWorkingDate],
                    ["مدة الخدمة الكاملة", calc.serviceDurationLabel],
                    ["سبب إنهاء الخدمة", reasonLabel],
                  ].map(([l, v]) => (
                    <div key={l}><small>{l}</small><b>{v}</b></div>
                  ))}
                </div>
              </div>

              <div>
                <h3>بيان المستحقات والخصومات التفصيلي</h3>
                <table>
                  <thead><tr><th>البند</th><th>المبلغ (ر.س)</th></tr></thead>
                  <tbody>
                    <DocRow label="1. آخر راتب مستحق (نسبي)" value={fmt(calc.lastMonthPay)} />
                    <DocRow label="2. مكافأة نهاية الخدمة" value={fmt(calc.eosb)} />
                    <DocRow label="3. بدل رصيد الإجازة السنوية" value={fmt(calc.leavePay)} />
                    {calc.noticeAddition > 0 && <DocRow label="4. بدل مهلة الإشعار (لصالح الموظف +)" value={fmt(calc.noticeAddition)} />}
                    {calc.noticePay === 0 && <DocRow label="4. بدل مهلة الإشعار" value="0.00" />}
                    {calc.unpaidSalary > 0 && <DocRow label="رواتب متأخرة غير مصروفة" value={fmt(calc.unpaidSalary)} />}
                    {calc.overtimeAmount > 0 && <DocRow label="بدل أوفر تايم مستحق" value={fmt(calc.overtimeAmount)} />}
                    {calc.bonuses > 0 && <DocRow label="مكافآت ومنح" value={fmt(calc.bonuses)} />}
                    {calc.otherAdditions > 0 && <DocRow label="إضافات أخرى" value={fmt(calc.otherAdditions)} />}
                    <DocRow label="إجمالي المستحقات" value={fmt(calc.grossDues)} cls="g" />
                    {calc.noticeDeduction > 0 && <DocRow label="(−) خصم مهلة الإشعار (لصاحب العمل)" value={`(${fmt(calc.noticeDeduction)})`} />}
                    {calc.loans > 0 && <DocRow label="(−) سلف وقروض مستحقة" value={`(${fmt(calc.loans)})`} />}
                    {calc.companyAssets > 0 && <DocRow label="(−) عهد وأصول شركة" value={`(${fmt(calc.companyAssets)})`} />}
                    {calc.otherDeductions > 0 && <DocRow label="(−) خصومات أخرى" value={`(${fmt(calc.otherDeductions)})`} />}
                  </tbody>
                  <tfoot>
                    <tr><td>صافي المخالصة النهائية المستحقة</td><td>{fmt(calc.netSettlement)} ر.س</td></tr>
                  </tfoot>
                </table>
              </div>

              <div style={{ border: "1px solid #0D0D0D", padding: "10px 14px", fontSize: 12 }}>
                <p style={{ margin: 0 }}><b>أساس الحساب:</b> الأجر الفعلي الإجمالي = {fmt(calc.totalWage)} ر.س/شهر | قاسم الشهر: ÷{calc.divisor} | الأجر اليومي: {fmt(calc.daily)} ر.س</p>
                <p style={{ margin: "4px 0 0" }}><b>مدة الخدمة:</b> {calc.serviceYears.toFixed(3)} سنة ({calc.serviceDurationLabel})</p>
              </div>

              <div>
                <h3>التوقيعات والإقرار</h3>
                <p style={{ fontSize: 12, margin: "0 0 18px" }}>
                  بتوقيع هذا النموذج التقديري، يُقرّ الطرفان باستلام وتسليم جميع المستحقات المبيّنة أعلاه وبراءة كل منهما تجاه الآخر من أي مطالبات عمالية تتعلق بفترة الخدمة المنتهية، ما لم يُنصّ صراحة على خلاف ذلك.
                </p>
                <div className="fs-sig">
                  <div>
                    <b>توقيع الموظف واستلام المبلغ</b>
                    <div className="ln" />
                    <div>{employeeName || "الاسم"}</div>
                    <div>التاريخ: ___________</div>
                  </div>
                  <div>
                    <b>توقيع وختم جهة العمل</b>
                    <div className="ln" />
                    <div>{employerName || "الجهة"}</div>
                    <div>التاريخ: ___________</div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #0D0D0D", paddingTop: 12, textAlign: "center", fontSize: 11 }}>
                <p style={{ margin: 0 }}>تاريخ إصدار النموذج: {calcDate}</p>
                <p style={{ margin: "4px 0" }}>أُنشئت بواسطة حاسبة المخالصة النهائية — منصة الأدوات العربية</p>
                <p style={{ margin: 0, fontWeight: 700 }}>
                  تنبيه قانوني: الحسابات والوثائق الناتجة هي نماذج تقديرية استرشادية مبنية على المدخلات، ولا تُعد مستنداً رسمياً حكومياً أو بديلاً عن السجلات الرسمية لصاحب العمل أو الاستشارة القانونية المتخصصة.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}