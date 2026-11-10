/**
 * tests/uaeNoticeCalc.test.mjs
 * Tests the REAL UAE notice-period math (lib/uaeNoticeCalc.js) used by
 * components/UaeNoticePeriodCalculator.jsx, plus guards for the page design and SEO.
 * Law: Federal Decree-Law No. 33 of 2021, Art. 43 (30-90 days; pay in lieu =
 * last wage for the unserved days), Art. 67 (month = 30 days).
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { addDays, getDaysDiff, isInvalidNumericInput, noticeCompensation, toNum } from "../lib/uaeNoticeCalc.js";

const near = (a, b, eps = 0.005) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

test("Page examples: 60/60 = 0; 40 of 60 at 9,000 = 6,000; 10 of 30 at 12,000 = 8,000", () => {
  assert.equal(noticeCompensation({ requiredDays: 60, servedDays: 60, monthlyWage: 9000 }).compensation, 0);
  const ex2 = noticeCompensation({ requiredDays: 60, servedDays: 40, monthlyWage: 9000 });
  assert.equal(ex2.remainingDays, 20);
  near(ex2.dailyWage, 300);
  near(ex2.compensation, 6000);
  const ex3 = noticeCompensation({ requiredDays: 30, servedDays: 10, monthlyWage: "12,000" });
  near(ex3.dailyWage, 400);
  near(ex3.compensation, 8000);
});

test("No notice served at all = wage for the whole period (90 days at 9,000 = 27,000)", () => {
  near(noticeCompensation({ requiredDays: 90, servedDays: 0, monthlyWage: 9000 }).compensation, 27000);
});

test("Served more than required never gives a negative amount", () => {
  const r = noticeCompensation({ requiredDays: 30, servedDays: 45, monthlyWage: 9000 });
  assert.equal(r.remainingDays, 0);
  assert.equal(r.compensation, 0);
});

test("Junk input never gives NaN", () => {
  for (const v of ["", "abc", "-5", null, undefined]) {
    const r = noticeCompensation({ requiredDays: v, servedDays: v, monthlyWage: v });
    for (const x of Object.values(r)) assert.ok(Number.isFinite(x) && x >= 0, String(x));
  }
  assert.equal(toNum("1,500"), 1500);
  assert.equal(toNum("-1"), 0);
});

test("Last working day: notice date + notice days, across month and leap-year ends", () => {
  assert.equal(addDays("2026-01-01", 30), "2026-01-31");
  assert.equal(addDays("2026-01-31", 30), "2026-03-02");
  assert.equal(addDays("2028-02-01", 30), "2028-03-02");
  assert.equal(addDays("2026-12-15", 60), "2027-02-13");
  assert.equal(addDays("", 30), "");
});

test("Served days from two dates; reverse order is negative and empty is 0", () => {
  assert.equal(getDaysDiff("2026-01-01", "2026-01-31"), 30);
  assert.equal(getDaysDiff("2026-03-01", "2026-03-29"), 28); // spans the March DST change in many zones
  assert.equal(getDaysDiff("2026-02-10", "2026-02-01"), -9);
  assert.equal(getDaysDiff("", "2026-02-01"), 0);
  assert.equal(getDaysDiff(addDays("2026-05-01", 90), "2026-05-01"), -90);
});

test("Invalid numeric input is flagged; blank is not", () => {
  assert.equal(isInvalidNumericInput(""), false);
  assert.equal(isInvalidNumericInput("9,000"), false);
  assert.equal(isInvalidNumericInput("-1"), true);
  assert.equal(isInvalidNumericInput("abc"), true);
});

// ── Component + page guards ─────────────────────────────────────────────────
const calc = fs.readFileSync("components/UaeNoticePeriodCalculator.jsx", "utf8");
const page = fs.readFileSync("app/ar/ae/notice-period-calculator/page.js", "utf8");

test("Component uses the lib and keeps no private copy of the money formula", () => {
  assert.match(calc, /from "\.\.\/lib\/uaeNoticeCalc"/);
  assert.match(calc, /noticeCompensation\(/);
  assert.doesNotMatch(calc, /const dailyWage = wage \/ 30/);
});

test("One-tap scope confirm sets exactly the six safe answers, and each stays editable", () => {
  const fn = calc.slice(calc.indexOf("const confirmAllScope"), calc.indexOf("};", calc.indexOf("const confirmAllScope")));
  for (const call of [
    'setIsPrivateSector("yes")', 'setIsExcludedCategory("no")', 'setIsDifcAdgm("no")',
    'setIsProbation("no")', 'setIsTerminationDuringLeave("no")', 'setIsNoNoticeStatutoryCase("no")',
  ]) assert.ok(fn.includes(call), call);
  assert.match(calc, /نعم، تنطبق كلها/);
  assert.match(calc, /<details className="nc-scope">/);
  assert.match(calc, /<Seg id="nc-private"/);
});

test("Page is on the shared theme-aware design, without light-only colours", () => {
  assert.match(page, /TOOL_PAGE_CSS/);
  assert.doesNotMatch(page, /bg-white|emerald|bg-slate|bg-sand/);
  assert.equal((calc.match(/<h1 /g) || []).length, 1);
  assert.doesNotMatch(page, /<h1/);
});

test("Page states that the job-search day under Art. 43/5 is unpaid", () => {
  assert.match(page, /المادة \(43\/5\)/);
  assert.match(page, /دون أجر/);
});

test("Page SEO: structured data, title and description length", () => {
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
});
