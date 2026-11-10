/**
 * tests/annualLeaveCalc.test.mjs
 * Tests the REAL annual-leave math (lib/annualLeaveCalc.js) used by
 * components/AnnualLeaveCalculator.jsx, plus guards for the Saudi page.
 * Saudi Labour Law: Art. 109 (21 / 30 days), Art. 111 (unused leave pay, pro rata).
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { annualEntitlementDays, calculateAnnualLeave, leaveBalance, toNum } from "../lib/annualLeaveCalc.js";

const SA = { standardDays: 21, seniorDays: 30, seniorThresholdYears: 5, monthDivisor: 30 };
const AE = { standardDays: 30, seniorDays: 30, seniorThresholdYears: 0, firstYearDays: 24, monthDivisor: 30 };
const KW = { standardDays: 30, seniorDays: 30, seniorThresholdYears: 0, monthDivisor: 26 };
const EG = { standardDays: 21, seniorDays: 30, seniorThresholdYears: 10, firstYearDays: 15, monthDivisor: 30 };
const near = (a, b, eps = 0.005) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

test("Saudi Art. 109: 21 days below five years, 30 days from five years", () => {
  assert.equal(annualEntitlementDays(SA, 0), 21);
  assert.equal(annualEntitlementDays(SA, 4.99), 21);
  assert.equal(annualEntitlementDays(SA, 5), 30);
  assert.equal(annualEntitlementDays(SA, 12), 30);
  assert.equal(annualEntitlementDays(SA, ""), 21);
});

test("Other countries keep their own thresholds", () => {
  assert.equal(annualEntitlementDays(AE, 1), 30);
  assert.equal(annualEntitlementDays(EG, 9), 21);
  assert.equal(annualEntitlementDays(EG, 10), 30);
});

test("Egypt Law 14 of 2025: 15 days in the first year, 21 from the second", () => {
  assert.equal(annualEntitlementDays(EG, 0.5), 15);
  assert.equal(annualEntitlementDays(EG, 0.99), 15);
  assert.equal(annualEntitlementDays(EG, 1), 21);
});

test("UAE Art. 29: under one year accrues 2 days a month (24 a year), then 30", () => {
  assert.equal(annualEntitlementDays(AE, 0.75), 24);
  assert.equal(annualEntitlementDays(AE, 1), 30);
  near(leaveBalance({ entitlement: annualEntitlementDays(AE, 0.75), monthsWorked: 9 }).accrued, 18);
});

test("Saudi has no first-year rule: 21 days from day one", () => {
  assert.equal(annualEntitlementDays(SA, 0.5), 21);
});

test("Saudi Art. 111: default example = 9,000 / 30 x 15 days = 4,500", () => {
  const r = calculateAnnualLeave({ rule: SA, salary: "9000", yearsOfService: "6", unusedDays: "15" });
  assert.equal(r.annualEntitlement, 30);
  assert.equal(r.daysInMonth, 30);
  near(r.dailyWage, 300);
  near(r.fullAnnualLeavePay, 9000);
  near(r.unusedBalanceCompensation, 4500);
});

test("Saudi: under five years the full-leave pay uses 21 days", () => {
  const r = calculateAnnualLeave({ rule: SA, salary: 10000, yearsOfService: 3, unusedDays: 18 });
  near(r.dailyWage, 333.333);
  near(r.fullAnnualLeavePay, 7000);
  near(r.unusedBalanceCompensation, 6000);
});

test("Kuwait divides by 26; missing divisor falls back to 30", () => {
  near(calculateAnnualLeave({ rule: KW, salary: 2600, yearsOfService: 1, unusedDays: 10 }).unusedBalanceCompensation, 1000);
  const { monthDivisor, ...noDivisor } = SA;
  assert.equal(calculateAnnualLeave({ rule: noDivisor, salary: 3000, yearsOfService: 1, unusedDays: 1 }).daysInMonth, 30);
});

test("Empty, negative or junk input never gives NaN or a negative amount", () => {
  for (const salary of ["", "abc", "-5", null, undefined]) {
    const r = calculateAnnualLeave({ rule: SA, salary, yearsOfService: "x", unusedDays: "-3" });
    for (const v of Object.values(r)) assert.ok(Number.isFinite(v) && v >= 0, String(v));
    assert.equal(r.unusedBalanceCompensation, 0);
  }
  assert.equal(toNum("-1"), 0);
});

test("Balance helper: pro rata for part of a year (8 months of 21 days = 14 days)", () => {
  const r = leaveBalance({ entitlement: 21, monthsWorked: 8, carriedDays: 0, takenDays: 0 });
  near(r.accrued, 14);
  near(r.monthlyRate, 1.75);
  near(r.balance, 14);
  near(leaveBalance({ entitlement: 30, monthsWorked: 1 }).monthlyRate, 2.5);
});

test("Balance helper: carried + accrued - taken, months capped at 12, never negative", () => {
  near(leaveBalance({ entitlement: 30, monthsWorked: 6, carriedDays: 5, takenDays: 8 }).balance, 12);
  near(leaveBalance({ entitlement: 21, monthsWorked: 20, carriedDays: 0, takenDays: 0 }).accrued, 21);
  assert.equal(leaveBalance({ entitlement: 21, monthsWorked: 2, carriedDays: 0, takenDays: 30 }).balance, 0);
  assert.equal(leaveBalance({}).balance, 0);
});

// ── Component + Saudi page guards ───────────────────────────────────────────
const calc = fs.readFileSync("components/AnnualLeaveCalculator.jsx", "utf8");
const page = fs.readFileSync("app/ar/sa/annual-leave-calculator/page.js", "utf8");
const pageCss = fs.readFileSync("lib/toolPageCss.js", "utf8");

test("Component uses the shared lib and keeps no private copy of the formula", () => {
  assert.match(calc, /from "\.\.\/lib\/annualLeaveCalc"/);
  assert.match(calc, /calculateAnnualLeave\(/);
  assert.doesNotMatch(calc, /dailyWage \* uDays/);
});

test("Saudi page: locked to Saudi Arabia, one H1 that names the country", () => {
  assert.match(page, /lockedCountry="sa"/);
  assert.match(page, /title="حاسبة بدل الإجازات السنوية في السعودية"/);
  assert.equal((calc.match(/<h1 /g) || []).length, 1);
  assert.doesNotMatch(page, /<h1/);
});

test("Saudi page and calculator follow the site theme toggle, not only the OS", () => {
  for (const [name, src, cls] of [["page css", pageCss, ".fp"], ["calculator", calc, ".alc"]]) {
    assert.ok(src.includes(`:root:not([data-theme="light"]) ${cls}`), `${name}: OS-dark rule must respect data-theme`);
    assert.ok(src.includes(`:root[data-theme="dark"] ${cls}`), `${name}: must support data-theme="dark"`);
  }
  assert.doesNotMatch(page, /bg-white|text-emerald|bg-emerald/, "no hard-coded light-only colours");
});

test("Saudi page wording stays within what the law says", () => {
  assert.doesNotMatch(page, /21 يوماً<\/strong> تقويمياً|يوماً تقويمياً/, "Art. 109 does not say calendar days");
  assert.match(page, /المادة \(110\)/);
  assert.match(page, /90 يوماً/);
  assert.match(page, /21 × 8 ÷ 12 = /);
});

test("Saudi page SEO: structured data, short title, description length, back-link", () => {
  for (const type of ["FAQPage", "BreadcrumbList", "WebApplication", "WebPage", "HowTo"]) {
    assert.ok(page.includes(`"@type": "${type}"`), `missing ${type}`);
  }
  for (const ld of ["faqJsonLd", "breadcrumbJsonLd", "appJsonLd", "webPageJsonLd", "howToJsonLd"]) {
    assert.ok(page.includes(`JSON.stringify(${ld})`), `${ld} must be rendered`);
  }
  const title = page.match(/const TITLE = "([^"]+)"/)[1];
  const desc = page.match(/const DESC =\s*"([^"]+)"/)[1];
  assert.ok((title + " | Qemlo").length <= 62, `title length ${(title + " | Qemlo").length}`);
  assert.ok(desc.length >= 110 && desc.length <= 160, `description length ${desc.length}`);
  assert.match(page, /dateModified: LAST_REVIEWED_ISO/);
  assert.ok(page.includes('href="/annual-leave-calculator"'));
  assert.ok(page.includes('href="/ar/sa"') && !page.includes('href="/ar/sa/"'));
  assert.ok(!page.includes('"ar-AE"'));
});

// ── Multi-country page guards ───────────────────────────────────────────────
const globalPage = fs.readFileSync("app/annual-leave-calculator/page.js", "utf8");

test("Multi-country page: Egypt cites Law 14 of 2025, not the repealed Law 12 of 2003 Art. 47", () => {
  assert.match(globalPage, /قانون العمل 14 لسنة 2025/);
  assert.doesNotMatch(globalPage, /المصري \(م\/47\)/);
  assert.match(calc, /قانون العمل المصري رقم 14 لسنة 2025/);
  assert.doesNotMatch(calc, /قانون العمل المصري \(م\/47\)/);
});

test("Multi-country page: UAE encashment on basic salary, Kuwait on 26 days", () => {
  assert.match(globalPage, /basis: "الراتب الأساسي فقط"/);
  assert.match(globalPage, /daily: "26"/);
});

test("Multi-country page: shared theme-aware design, structured data, snippet lengths, Saudi link", () => {
  assert.match(globalPage, /TOOL_PAGE_CSS/);
  assert.doesNotMatch(globalPage, /AnnualLeavePageStyles|ap-main/);
  for (const ld of ["faqJsonLd", "breadcrumbJsonLd", "appJsonLd", "webPageJsonLd", "howToJsonLd"]) {
    assert.ok(globalPage.includes(`JSON.stringify(${ld})`), `${ld} must be rendered`);
  }
  const title = globalPage.match(/const TITLE = "([^"]+)"/)[1];
  const desc = globalPage.match(/const DESC =\s*"([^"]+)"/)[1];
  assert.ok((title + " | Qemlo").length <= 62, `title length ${(title + " | Qemlo").length}`);
  assert.ok(desc.length >= 110 && desc.length <= 160, `description length ${desc.length}`);
  assert.ok(globalPage.includes('href: "/ar/sa/annual-leave-calculator"'));
  assert.doesNotMatch(globalPage, /<h1/);
});
