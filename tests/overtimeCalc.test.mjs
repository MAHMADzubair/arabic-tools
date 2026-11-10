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

// ── Country rules (lib/overtimeCalc.js OVERTIME_COUNTRIES) ──────────────────
import { OVERTIME_COUNTRIES } from "../lib/overtimeCalc.js";
const OT = Object.fromEntries(OVERTIME_COUNTRIES.map((c) => [c.id, c]));

test("UAE Art. 19: basic hourly x1.25 day, x1.5 night (10pm-4am) and rest day", () => {
  const r = calculateOvertime({ country: OT.ae, salary: 7200, dayHours: 10, nightHours: 2, weekendHours: 8 });
  assert.equal(r.hourlyWage, 30);
  assert.equal(r.dayAmount, 375);
  assert.equal(r.nightAmount, 90);
  assert.equal(r.weekendAmount, 360);
});

test("Kuwait Art. 66-67: divisor 208, +25%, rest day +50%, no extra night rate", () => {
  const r = calculateOvertime({ country: OT.kw, salary: 416, dayHours: 4, nightHours: 4, weekendHours: 8 });
  assert.equal(r.hourlyWage, 2);
  assert.equal(r.dayRate, 2.5);
  assert.equal(r.nightRate, 2.5);
  assert.equal(r.weekendRate, 3);
});

test("Qatar Art. 74-75: +25% day, +50% night, rest day basic +150%", () => {
  const r = calculateOvertime({ country: OT.qa, salary: 4800, dayHours: 1, nightHours: 1, weekendHours: 1 });
  assert.equal(r.hourlyWage, 20);
  assert.equal(r.dayRate, 25);
  assert.equal(r.nightRate, 30);
  assert.equal(r.weekendRate, 50);
});

test("Egypt Law 14/2025: +35% day, +70% night, double on rest days; law note cites the new law", () => {
  const r = calculateOvertime({ country: OT.eg, salary: 9600, dayHours: 1, nightHours: 1, weekendHours: 1 });
  assert.equal(r.hourlyWage, 40);
  assert.equal(r.dayRate, 54);
  assert.equal(r.nightRate, 68);
  assert.equal(r.weekendRate, 80);
  assert.match(OT.eg.lawNote, /14 لسنة 2025/);
});

test("Non-Saudi countries ignore allowances (overtime is on basic wage)", () => {
  const a = calculateOvertime({ country: OT.ae, salary: 7200, allowances: 3000, dayHours: 10 });
  assert.equal(a.dayAmount, 375);
});
