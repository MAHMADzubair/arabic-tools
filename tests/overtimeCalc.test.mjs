import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateOvertime, saudiOvertimeHourlyRate } from "../lib/overtimeCalc.js";

const SA = { id: "sa", hoursDivisor: 240, dayMultiplier: 1.5, nightMultiplier: 1.5, weekendMultiplier: 1.5 };
const AE = { id: "ae", hoursDivisor: 240, dayMultiplier: 1.25, nightMultiplier: 1.5, weekendMultiplier: 1.5 };
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test("Article 107 rate = actual hourly (basic + allowances) + 50% of basic hourly", () => {
  close(saudiOvertimeHourlyRate(9600, 2400), 70); // 50 + 20
  close(saudiOvertimeHourlyRate(6000, 1500), 43.75); // 31.25 + 12.5
  close(saudiOvertimeHourlyRate(8000, 0), 50); // no allowances -> exactly 150% of basic
});

test("Saudi page examples: engineer 16 h and Eid 8 h", () => {
  const eng = calculateOvertime({ country: SA, salary: "9600", allowances: "2400", dayHours: "16" });
  close(eng.dayRate, 70);
  close(eng.totalOvertimePay, 1120);
  close(eng.actualMonthlyWage, 12000);
  close(eng.totalSalaryWithOvertime, 13120);
  const eid = calculateOvertime({ country: SA, salary: "6000", allowances: "1500", weekendHours: "8" });
  close(eid.totalOvertimePay, 350);
});

test("allowances raise Saudi overtime above 150% of basic", () => {
  const without = calculateOvertime({ country: SA, salary: 8000, allowances: 0, dayHours: 10 });
  const withAllw = calculateOvertime({ country: SA, salary: 8000, allowances: 3000, dayHours: 10 });
  close(without.totalOvertimePay, 500);
  close(withAllw.totalOvertimePay, 625); // (11000/240 + 0.5*8000/240) * 10
});

test("Saudi applies the same rate to night and holiday hours", () => {
  const r = calculateOvertime({ country: SA, salary: 9600, allowances: 2400, dayHours: 1, nightHours: 1, weekendHours: 1 });
  close(r.nightRate, r.dayRate);
  close(r.weekendRate, r.dayRate);
  close(r.totalOvertimePay, 210);
});

test("bad input is treated as zero, other countries ignore allowances", () => {
  const r = calculateOvertime({ country: SA, salary: "-5", allowances: "abc", dayHours: "" });
  close(r.totalOvertimePay, 0);
  const ae = calculateOvertime({ country: AE, salary: 9000, allowances: 5000, dayHours: 8, weekendHours: 8 });
  close(ae.dayRate, 46.875);
  close(ae.totalOvertimePay, 8 * 46.875 + 8 * 56.25);
});
