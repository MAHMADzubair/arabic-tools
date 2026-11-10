/**
 * tests/finalSettlementCalc.test.mjs
 * Tests the REAL Saudi final-settlement math (lib/finalSettlementCalc.js), which
 * components/FinalSettlementCalculator.jsx calls. No local copies of the formulas.
 *
 * Law references: Saudi Labour Law Art. 84 (award), 85 (resignation thresholds),
 * 87 (woman / force majeure), 75-76 (notice, paid as wage for the missing days).
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateFinalSettlement,
  calcServiceMonths,
  lastMonthDefaultDays,
  saudiEosb,
  toNum,
} from "../lib/finalSettlementCalc.js";

// Wage used in most cases: 8,000 basic + 2,000 housing = 10,000 total, 30-day month.
const base = {
  basicSalary: "8000",
  housingAllowance: "2000",
  transportAllowance: "",
  otherAllowances: "",
  monthlyDivisor: "30",
  joiningDate: "2020-01-01",
  lastWorkingDate: "2025-01-01",
  customLastMonthDays: "0",
  terminationReason: "terminate",
  contractType: "indefinite",
  unusedLeaveDays: "0",
  leaveWageBase: "actual",
  noticeRequired: "0",
  noticeServed: "0",
  noticeBeneficiary: "employee",
  unpaidSalary: "",
  overtimeAmount: "",
  bonuses: "",
  otherAdditions: "",
  loans: "",
  companyAssets: "",
  otherDeductions: "",
};
const run = (over = {}) => calculateFinalSettlement({ ...base, ...over });
const near = (a, b, eps = 0.01) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

// ── Art. 84 ─────────────────────────────────────────────────────────────────

test("Art. 84: 5 years, employer terminates -> half a month per year = 25,000", () => {
  const r = run();
  near(r.serviceYears, 5);
  near(r.fullGratuity, 25000);
  near(r.eosb, 25000);
  assert.equal(r.esobPercent, 1);
});

test("Art. 84: 8 years -> 5 x half month + 3 x full month = 55,000", () => {
  const r = run({ lastWorkingDate: "2028-01-01" });
  near(r.serviceYears, 8);
  near(r.fullGratuity, 55000);
  near(r.y1Full, 25000);
  near(r.y2Full, 30000);
});

test("Art. 84: part-years are pro rata (6 months = 2,500)", () => {
  const r = run({ lastWorkingDate: "2020-07-01" });
  near(r.serviceYears, 0.5);
  near(r.eosb, 2500);
});

// ── Art. 85 resignation thresholds ──────────────────────────────────────────

test("Art. 85: resignation just under 2 years -> nothing", () => {
  const r = run({ terminationReason: "resign", lastWorkingDate: "2021-12-30" });
  assert.ok(r.serviceYears < 2);
  assert.equal(r.esobPercent, 0);
  assert.equal(r.eosb, 0);
});

test("Art. 85: resignation at exactly 2 years -> one third", () => {
  const r = run({ terminationReason: "resign", lastWorkingDate: "2022-01-01" });
  near(r.serviceYears, 2);
  near(r.esobPercent, 1 / 3, 1e-9);
  near(r.eosb, 10000 / 3);
});

test("Art. 85: resignation at exactly 5 years -> still one third (not two thirds)", () => {
  const r = run({ terminationReason: "resign", lastWorkingDate: "2025-01-01" });
  near(r.serviceYears, 5);
  near(r.esobPercent, 1 / 3, 1e-9);
  near(r.eosb, 25000 / 3);
});

test("Art. 85: resignation one day over 5 years -> two thirds", () => {
  const r = run({ terminationReason: "resign", lastWorkingDate: "2025-01-02" });
  assert.ok(r.serviceYears > 5);
  near(r.esobPercent, 2 / 3, 1e-9);
});

test("Art. 85: resignation just under 10 years -> two thirds; at 10 years -> full", () => {
  const under = run({ terminationReason: "resign", lastWorkingDate: "2029-12-30" });
  near(under.esobPercent, 2 / 3, 1e-9);
  const ten = run({ terminationReason: "resign", lastWorkingDate: "2030-01-01" });
  near(ten.serviceYears, 10);
  assert.equal(ten.esobPercent, 1);
  near(ten.eosb, 75000); // 5 x 5,000 + 5 x 10,000
});

test("Art. 87: female_special gets the full award even with short service", () => {
  const r = run({ terminationReason: "female_special", lastWorkingDate: "2021-01-01" });
  assert.equal(r.esobPercent, 1);
  near(r.eosb, 5000);
});

test("Mutual / retirement / fixed-term end -> full award", () => {
  for (const reason of ["mutual", "retire", "fixed_expired"]) {
    assert.equal(run({ terminationReason: reason }).esobPercent, 1, reason);
  }
});

test("saudiEosb mirrors calculateFinalSettlement", () => {
  const e = saudiEosb(7, 10000, "resign");
  near(e.esobPercent, 2 / 3, 1e-9);
  near(e.fullGratuity, 25000 + 20000);
});

// ── Service-length boundaries ───────────────────────────────────────────────

test("Leap-year start: 29 Feb 2024 -> 28 Feb 2026 is just under 2 years, so resignation pays 0", () => {
  const m = calcServiceMonths("2024-02-29", "2026-02-28");
  assert.ok(m > 23.9 && m < 24, String(m));
  const r = run({ joiningDate: "2024-02-29", lastWorkingDate: "2026-02-28", terminationReason: "resign" });
  assert.equal(r.eosb, 0);
});

test("End date before or equal to start -> 0 service", () => {
  assert.equal(calcServiceMonths("2025-01-01", "2025-01-01"), 0);
  assert.equal(calcServiceMonths("2025-02-01", "2025-01-01"), 0);
  assert.equal(calcServiceMonths("", "2025-01-01"), 0);
});

// ── Last-month pay (month-end fix) ──────────────────────────────────────────

test("Last working day = last day of month is paid as a full month (28 Feb, 30 Apr, 31 May)", () => {
  assert.equal(lastMonthDefaultDays("2026-02-28"), 30);
  assert.equal(lastMonthDefaultDays("2026-04-30"), 30);
  assert.equal(lastMonthDefaultDays("2026-05-31"), 30);
  const r = run({ customLastMonthDays: "", lastWorkingDate: "2026-02-28" });
  assert.equal(r.daysWorked, 30);
  near(r.lastMonthPay, 10000);
});

test("Last working day mid-month is paid by calendar day", () => {
  assert.equal(lastMonthDefaultDays("2026-05-15"), 15);
  assert.equal(lastMonthDefaultDays("2026-02-27"), 27);
  const r = run({ customLastMonthDays: "", lastWorkingDate: "2026-02-27" });
  near(r.lastMonthPay, 9000);
});

test("Divisor 26: month-end pays 26 days, never more than the divisor", () => {
  assert.equal(lastMonthDefaultDays("2026-05-31", 26), 26);
  assert.equal(lastMonthDefaultDays("2026-05-28", 26), 26);
  const r = run({ customLastMonthDays: "", lastWorkingDate: "2026-05-31", monthlyDivisor: "26" });
  near(r.lastMonthPay, 10000);
});

test("Manual last-month days override the default", () => {
  const r = run({ customLastMonthDays: "12", lastWorkingDate: "2026-05-31" });
  assert.equal(r.daysWorked, 12);
  near(r.lastMonthPay, 4000);
});

// ── Leave pay ───────────────────────────────────────────────────────────────

test("Unused leave: 10 days at total wage vs basic wage only", () => {
  near(run({ unusedLeaveDays: "10" }).leavePay, 3333.33);
  near(run({ unusedLeaveDays: "10", leaveWageBase: "basic" }).leavePay, 2666.67);
});

// ── Notice (Art. 75/76) ─────────────────────────────────────────────────────

test("Employer terminates, 60 days notice not given -> employee is owed 20,000", () => {
  const r = run({ noticeRequired: "60", noticeServed: "0", noticeBeneficiary: "employee" });
  assert.equal(r.missedDays, 60);
  near(r.noticePay, 20000);
  near(r.noticeAddition, 20000);
  assert.equal(r.noticeDeduction, 0);
});

test("Employee resigns, 30 days notice not served -> 10,000 deducted for the employer", () => {
  const r = run({ terminationReason: "resign", noticeRequired: "30", noticeServed: "0", noticeBeneficiary: "employer" });
  near(r.noticeDeduction, 10000);
  assert.equal(r.noticeAddition, 0);
});

test("Notice fully served -> no notice pay; over-served is capped at required", () => {
  const r = run({ noticeRequired: "30", noticeServed: "45" });
  assert.equal(r.missedDays, 0);
  assert.equal(r.noticePay, 0);
});

test("Fixed-term contract -> notice rules do not apply", () => {
  const r = run({ contractType: "fixed", noticeRequired: "60", noticeServed: "0" });
  assert.equal(r.noticePay, 0);
  assert.equal(r.noticeAddition, 0);
  assert.equal(r.noticeDeduction, 0);
});

// ── Net settlement ──────────────────────────────────────────────────────────

test("Net settlement: award + leave + notice + additions - deductions", () => {
  const r = run({
    unusedLeaveDays: "3",            // 1,000
    noticeRequired: "60",            // +20,000 (employer terminated, no notice)
    noticeServed: "0",
    unpaidSalary: "5000",
    overtimeAmount: "500",
    loans: "2000",
  });
  near(r.eosb, 25000);
  near(r.grossDues, 25000 + 1000 + 20000 + 5500);
  near(r.dedTotal, 2000);
  near(r.netSettlement, 49500);
});

test("Resigning employee with notice not served: deduction can make net smaller than the award", () => {
  const r = run({
    terminationReason: "resign",
    lastWorkingDate: "2025-01-02",
    noticeRequired: "30",
    noticeServed: "0",
    noticeBeneficiary: "employer",
  });
  near(r.netSettlement, r.grossDues - 10000);
});

// ── Input safety ────────────────────────────────────────────────────────────

test("Empty / negative / junk inputs never produce NaN", () => {
  const r = calculateFinalSettlement({});
  for (const [k, v] of Object.entries(r)) {
    if (typeof v === "number") assert.ok(Number.isFinite(v), `${k} = ${v}`);
  }
  assert.equal(r.netSettlement, 0);
  const neg = run({ basicSalary: "-500", unusedLeaveDays: "abc", loans: "-9" });
  for (const [k, v] of Object.entries(neg)) {
    if (typeof v === "number") assert.ok(Number.isFinite(v), `${k} = ${v}`);
  }
  assert.equal(toNum("-5"), 0);
  assert.equal(toNum("x"), 0);
});
