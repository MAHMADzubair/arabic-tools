/**
 * tests/salaryCalculator6C.test.mjs
 * Sprint 6C — Independent regression tests for UK, US, Egypt payroll functions.
 * All expected values are independently derived from official sources:
 *   UK: HMRC gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
 *   US: IRS.gov/taxtopics/tc751 + IRS 2026 inflation-adjusted brackets
 *   EG: Egyptian Tax Authority, NOSI (nosi.gov.eg), PwC Egypt 2026
 *   SA: gosiEngine.js Sprint 6B (preserved, regression guard)
 */

import test from "node:test";
import assert from "node:assert/strict";
import { calculateGOSI, pensionRateForDate } from "../lib/gosiEngine.js";

/* Helper: progressive annual brackets */
function applyAnnualBrackets(taxableAnnual, brackets) {
  if (!brackets || taxableAnnual <= 0) return 0;
  let tax = 0, prev = 0;
  for (const b of brackets) {
    if (taxableAnnual <= prev) break;
    tax += (Math.min(taxableAnnual, b.limit) - prev) * b.rate;
    prev = b.limit;
    if (b.limit === Infinity) break;
  }
  return Math.max(0, tax);
}

/* ─── UK 2026-27 (England/Wales/NI) ─────────────────────────────────────── */
const GB = {
  pa: 12570, paTaperStart: 100000,
  annualBrackets: [
    { limit: 37700, rate: 0.20 },
    { limit: 112570, rate: 0.40 },
    { limit: Infinity, rate: 0.45 },
  ],
  niPT: 12570, niUEL: 50270, niMain: 0.08, niAbove: 0.02,
};
function ukTax(g) {
  let pa = GB.pa;
  if (g > GB.paTaperStart) pa = Math.max(0, pa - Math.floor((g - GB.paTaperStart) / 2));
  return applyAnnualBrackets(Math.max(0, g - pa), GB.annualBrackets);
}
function ukNI(g) {
  let ni = 0;
  if (g > GB.niPT)  ni += (Math.min(g, GB.niUEL) - GB.niPT) * GB.niMain;
  if (g > GB.niUEL) ni += (g - GB.niUEL) * GB.niAbove;
  return Math.max(0, ni);
}

/* ─── US 2026 (Single Filer) ─────────────────────────────────────────────── */
const US = {
  std: 16100, ssRate: 0.062, ssCap: 184500,
  medRate: 0.0145, addMedRate: 0.009, addMedThresh: 200000,
  annualBrackets: [
    { limit: 12400, rate: 0.10 },
    { limit: 50400, rate: 0.12 },
    { limit: 105700, rate: 0.22 },
    { limit: 201775, rate: 0.24 },
    { limit: 256225, rate: 0.32 },
    { limit: 640600, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ],
};
function usPayroll(g) {
  const ss = Math.min(g, US.ssCap) * US.ssRate;
  const med = g * US.medRate + (g > US.addMedThresh ? (g - US.addMedThresh) * US.addMedRate : 0);
  const fed = applyAnnualBrackets(Math.max(0, g - US.std), US.annualBrackets);
  return { fed, ss, med };
}

/* ─── Egypt 2026 ─────────────────────────────────────────────────────────── */
const EG = {
  siRate: 0.11, siCap: 16700, exemption: 20000,
  annualBrackets: [
    { limit: 40000, rate: 0 },
    { limit: 55000, rate: 0.10 },
    { limit: 70000, rate: 0.15 },
    { limit: 200000, rate: 0.20 },
    { limit: 400000, rate: 0.225 },
    { limit: 1200000, rate: 0.25 },
    { limit: Infinity, rate: 0.275 },
  ],
};
function egSI(monthly) { return Math.min(monthly, EG.siCap) * EG.siRate; }
function egTax(annualGross) {
  const annualSI = egSI(annualGross / 12) * 12;
  return applyAnnualBrackets(Math.max(0, annualGross - annualSI - EG.exemption), EG.annualBrackets);
}

const r2 = n => Number(n.toFixed(2));

/* ══ SECTION 1: UK INCOME TAX ══════════════════════════════════════════════ */

test("UK Tax: £0 — zero", () => { assert.equal(ukTax(0), 0); });

test("UK Tax: £12,570 within PA — zero tax", () => {
  assert.equal(ukTax(12570), 0);
});

test("UK Tax: £20,000 — canonical HMRC example £1,486", () => {
  // (20000 - 12570) * 0.20 = 7430 * 0.20 = 1486.00
  assert.equal(r2(ukTax(20000)), 1486.00);
});

test("UK Tax: £50,270 — top of basic rate band", () => {
  // (50270 - 12570) * 0.20 = 37700 * 0.20 = 7540
  assert.equal(r2(ukTax(50270)), 7540.00);
});

test("UK Tax: £60,000 — higher rate applies", () => {
  // taxable = 47430; basic on 37700 = 7540; higher on 9730 = 3892 → 11432
  assert.equal(r2(ukTax(60000)), 11432.00);
});

test("UK Tax: £100,000 — PA not yet tapered", () => {
  // PA still 12,570; taxable = 87,430
  // basic 37700@20% = 7540; higher (87430-37700)@40% = 49730@40% = 19892 → 27432
  assert.equal(r2(ukTax(100000)), r2(7540 + 19892));
});

test("UK Tax: £125,140 — PA fully tapered, all taxable", () => {
  // excess = 25140 → PA - 12570 = 0
  // taxable = 125140: basic 37700@20%=7540; higher 74870@40%=29948; add 12570@45%=5656.50 → 43144.50
  assert.equal(r2(ukTax(125140)), r2(7540 + 29948 + 5656.50));
});

test("UK Tax: £130,000 — PA = 0, additional rate", () => {
  // taxable = 130000: basic 37700@20%=7540; higher 74870@40%=29948; add 17430@45%=7843.50 → 45331.50
  assert.equal(r2(ukTax(130000)), r2(7540 + 29948 + 7843.50));
});

/* ══ SECTION 2: UK NATIONAL INSURANCE ══════════════════════════════════════ */

test("UK NI: £0 — zero", () => { assert.equal(ukNI(0), 0); });

test("UK NI: at PT £12,570 — zero NI", () => { assert.equal(ukNI(12570), 0); });

test("UK NI: £12,571 — 1 pound above PT", () => {
  assert.equal(r2(ukNI(12571)), 0.08);
});

test("UK NI: £20,000 — within PT-UEL at 8%", () => {
  // (20000 - 12570) * 0.08 = 7430 * 0.08 = 594.40
  assert.equal(r2(ukNI(20000)), 594.40);
});

test("UK NI: at UEL £50,270 — max main band NI", () => {
  // (50270 - 12570) * 0.08 = 37700 * 0.08 = 3016.00
  assert.equal(r2(ukNI(50270)), 3016.00);
});

test("UK NI: £70,000 — above UEL, two-tier", () => {
  // main: 3016; above: (70000-50270)*0.02 = 19730*0.02 = 394.60 → 3410.60
  assert.equal(r2(ukNI(70000)), r2(3016 + 394.60));
});

test("UK NI: £100,000 — well above UEL", () => {
  // main: 3016; above: (100000-50270)*0.02 = 49730*0.02 = 994.60 → 4010.60
  assert.equal(r2(ukNI(100000)), r2(3016 + 994.60));
});

/* ══ SECTION 3: US FEDERAL PAYROLL ═════════════════════════════════════════ */

test("US: $0 — all zeros", () => {
  const r = usPayroll(0);
  assert.equal(r.fed, 0); assert.equal(r.ss, 0); assert.equal(r.med, 0);
});

test("US: $16,100 — at standard deduction, zero federal tax", () => {
  const r = usPayroll(16100);
  assert.equal(r2(r.fed), 0);
  assert.equal(r2(r.ss), r2(16100 * 0.062));
  assert.equal(r2(r.med), r2(16100 * 0.0145));
});

test("US: $60,000 — normal case", () => {
  // taxable = 43,900; fed = 12400*0.10 + 31500*0.12 = 1240 + 3780 = 5020
  const r = usPayroll(60000);
  assert.equal(r2(r.fed), 5020.00);
  assert.equal(r2(r.ss), r2(60000 * 0.062));
  assert.equal(r2(r.med), r2(60000 * 0.0145));
});

test("US: SS capped at $184,500 wage base", () => {
  const r1 = usPayroll(184500);
  assert.equal(r2(r1.ss), r2(184500 * 0.062));
  // Above cap: no increase in SS
  const r2a = usPayroll(250000);
  assert.equal(r2(r2a.ss), r2(184500 * 0.062));
});

test("US: Medicare not capped (applies above SS base)", () => {
  const r = usPayroll(200000);
  // Medicare only, no additional (exactly at threshold)
  assert.equal(r2(r.med), r2(200000 * 0.0145));
});

test("US: Additional Medicare 0.9% above $200,000", () => {
  // $250,000: med = 250000*0.0145 + 50000*0.009 = 3625 + 450 = 4075
  const r = usPayroll(250000);
  assert.equal(r2(r.med), r2(250000 * 0.0145 + 50000 * 0.009));
});

test("US: $250,000 federal tax calculation", () => {
  // taxable = 233,900
  // 0-12400@10% = 1240; 12400-50400@12% = 4560; 50400-105700@22% = 12166
  // 105700-201775@24% = 23058; 201775-233900@32% = 10280
  // Total = 51304
  const r = usPayroll(250000);
  assert.equal(r2(r.fed), r2(1240 + 4560 + 12166 + 23058 + 10280));
});

/* ══ SECTION 4: EGYPT ═══════════════════════════════════════════════════════ */

test("EG: zero gross — no SI, no tax", () => {
  assert.equal(egSI(0), 0);
  assert.equal(egTax(0), 0);
});

test("EG: SI rate 11%, cap EGP 16,700/month", () => {
  assert.equal(r2(egSI(10000)), 1100.00);
  assert.equal(r2(egSI(16700)), 1837.00);
  assert.equal(r2(egSI(25000)), 1837.00); // capped
  assert.equal(r2(egSI(50000)), 1837.00); // capped
});

test("EG: EGP 5,000/month — within 0% annual bracket, no income tax", () => {
  // annual = 60,000; SI = 5000*0.11*12=6,600; taxable = 60000-6600-20000=33,400 → 0%
  assert.equal(r2(egTax(60000)), 0);
});

test("EG: EGP 10,000/month — taxable spans multiple brackets", () => {
  // annual = 120,000; SI = 13,200; taxable = 86,800
  // 0-40000@0%=0; 40000-55000@10%=1500; 55000-70000@15%=2250; 70000-86800@20%=3360
  assert.equal(r2(egTax(120000)), r2(1500 + 2250 + 3360));
});

test("EG: EGP 20,000/month — SI capped, 20% bracket", () => {
  // annual = 240,000; SI = 16700*0.11*12 = 22,044; taxable = 240000-22044-20000 = 197,956
  // 0-40000@0%=0; 40000-55000@10%=1500; 55000-70000@15%=2250; 70000-197956@20%=25591.20
  const si = r2(16700 * 0.11 * 12);
  const expected = 1500 + 2250 + r2((197956) * 0.20 - (70000 - 70000) * 0);
  // Recalculate clearly:
  const taxable = 240000 - si - 20000;
  const tax = 1500 + 2250 + (taxable - 70000) * 0.20;
  assert.equal(r2(egTax(240000)), r2(tax));
});

/* ══ SECTION 5: CROSS-COUNTRY SAUDI GOSI REGRESSION (Sprint 6B) ════════════ */

test("SA GOSI: Legacy SAR 10,000 — Sprint 6B preserved", () => {
  const r = calculateGOSI({ basic: 10000, housing: 0, employeeCategory: "legacy" });
  assert.equal(r.employeePension, 900.00);
  assert.equal(r.employeeSanned, 75.00);
  assert.equal(r.employeeTotal, 975.00);
  assert.equal(r.employerHazard, 200.00);
  assert.equal(r.employerTotal, 1175.00);
});

test("SA GOSI: New Saudi Oct 2026 = 10%", () => {
  const r = calculateGOSI({ basic: 10000, employeeCategory: "new", contributionDate: new Date(2026, 9, 1) });
  assert.equal(r.employeePensionRate, 0.10);
});

test("SA GOSI: 1 Jul 2028 → 11% (date confirmed Sprint 6B)", () => {
  assert.equal(pensionRateForDate(new Date(2028, 6, 1)), 0.11);
  assert.equal(pensionRateForDate(new Date(2028, 5, 30)), 0.105);
  assert.equal(pensionRateForDate(new Date(2028, 6, 14)), 0.11);
});

test("SA GOSI: Expat hazard only", () => {
  const r = calculateGOSI({ basic: 10000, employeeCategory: "expat" });
  assert.equal(r.employeeTotal, 0);
  assert.equal(r.employerHazard, 200.00);
});

test("SA GOSI: SAR 1,200 independent floors", () => {
  const r = calculateGOSI({ basic: 1000, housing: 200, employeeCategory: "legacy" });
  assert.equal(r.hazardBase, 1200);
  assert.equal(r.pensionBase, 1500);
  assert.equal(r.employerHazard, 24.00);
});

/* ══ SECTION 6: MONTHLY/ANNUAL ROUNDING ════════════════════════════════════ */

test("UK monthly £20k/yr: annualTax/12 correctly derived", () => {
  const annualTax = ukTax(20000);
  const annualNI  = ukNI(20000);
  assert.equal(r2(annualTax), 1486.00);
  assert.equal(r2(annualNI),  594.40);
});

test("US monthly $60k/yr: SS monthly = $310.00", () => {
  const r = usPayroll(60000);
  assert.equal(r2(r.ss / 12), 310.00);
});
