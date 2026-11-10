/**
 * tests/salaryTax.test.mjs
 * Tests the REAL salary tax rules (lib/salaryTax.js) used by components/SalaryCalculator.jsx.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  COUNTRIES, applyAnnualBrackets, egyptBracketsFor, calcEGIncomeTax, calcPKIncomeTax,
  calcSocial, calcUKIncomeTax, calcUKNI, calcUSPayroll,
} from "../lib/salaryTax.js";

const C = Object.fromEntries(COUNTRIES.map((c) => [c.id, c]));
const near = (a, b, eps = 0.01) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

test("Pakistan Finance Act 2026 slabs (tax year 2027)", () => {
  const pk = C.pk;
  assert.equal(calcPKIncomeTax(600000, pk), 0);
  near(calcPKIncomeTax(1200000, pk), 6000);
  near(calcPKIncomeTax(2200000, pk), 116000);
  near(calcPKIncomeTax(2500000, pk), 176000);          // 116,000 + 20% of 300,000
  near(calcPKIncomeTax(3200000, pk), 316000);
  near(calcPKIncomeTax(4100000, pk), 541000);
  near(calcPKIncomeTax(5600000, pk), 976000);
  near(calcPKIncomeTax(7000000, pk), 1424000);
  near(calcPKIncomeTax(8000000, pk), 1774000);          // 1,424,000 + 35% of 1,000,000
});

test("Egypt: standard brackets up to EGP 600,000 of taxable income", () => {
  const eg = C.eg;
  // 20,000 a month total pay: insurable wage capped at 16,700 -> 1,837 a month
  near(calcSocial(20000, eg), 1837);
  const tax = calcEGIncomeTax(240000, 1837 * 12, eg);
  near(tax, 29341.2);                                   // taxable 197,956
});

test("Egypt Law 7/2024: lower brackets fall away above EGP 600,000", () => {
  const b = C.eg.annualBrackets;
  assert.deepEqual(egyptBracketsFor(650000, b)[0], { limit: 55000, rate: 0.10 });
  assert.deepEqual(egyptBracketsFor(750000, b)[0], { limit: 70000, rate: 0.15 });
  assert.deepEqual(egyptBracketsFor(850000, b)[0], { limit: 200000, rate: 0.20 });
  assert.deepEqual(egyptBracketsFor(1000000, b)[0], { limit: 400000, rate: 0.225 });
  assert.deepEqual(egyptBracketsFor(1500000, b)[0], { limit: 1200000, rate: 0.25 });
  near(applyAnnualBrackets(750000, egyptBracketsFor(750000, b)), 169000);
  near(applyAnnualBrackets(1500000, egyptBracketsFor(1500000, b)), 300000 + 82500);
});

test("Egypt social insurance: 11% with EGP 2,700 floor and 16,700 cap", () => {
  near(calcSocial(2000, C.eg), 297);
  near(calcSocial(10000, C.eg), 1100);
  near(calcSocial(50000, C.eg), 1837);
  assert.equal(calcSocial(0, C.eg), 0);
});

test("UK 2026-27: GBP 50,000 -> income tax 7,486 and NI 2,994.40", () => {
  near(calcUKIncomeTax(50000, C.gb), 7486);
  near(calcUKNI(50000, C.gb), 2994.4);
  // Personal allowance gone at 125,140
  near(calcUKIncomeTax(125140, C.gb), 37700 * 0.2 + (112570 - 37700) * 0.4 + (125140 - 112570) * 0.45);
});

test("US 2026 single filer: USD 85,000 -> federal 9,870, SS 5,270, Medicare 1,232.50", () => {
  const r = calcUSPayroll(85000, C.us);
  near(r.federalTax, 9870);
  near(r.ss, 5270);
  near(r.medicare, 1232.5);
  near(calcUSPayroll(300000, C.us).ss, 184500 * 0.062);  // capped at the wage base
});

test("Saudi and UAE: no income tax configured", () => {
  assert.equal(C.sa.hasTax, false);
  assert.equal(C.ae.hasTax, false);
  assert.match(C.ae.note, /للمواطنين الإماراتيين اشتراك تقاعد/);
});

test("Component taxes total pay (allowances included) and uses the lib", () => {
  const calc = fs.readFileSync("components/SalaryCalculator.jsx", "utf8");
  assert.match(calc, /from "@\/lib\/salaryTax"/);
  assert.doesNotMatch(calc, /const COUNTRIES = \[/);
  assert.doesNotMatch(calc, /calcTaxPK/);
  assert.match(calc, /const annualGross = totalGross \* 12;/);
  assert.match(calc, /calcSocial\(totalGross, country\)/);
  assert.match(calc, /calcEGIncomeTax\(totalGross \* 12/);
});
