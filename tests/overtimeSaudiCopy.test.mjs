import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../app/overtime-calculator/saudi/page.js", import.meta.url), "utf8");
const component = readFileSync(new URL("../components/OvertimeCalculator.jsx", import.meta.url), "utf8");

// Article 107: actual hourly wage + 50% of basic hourly wage, monthly divisor 240.
const otRate = (basic, allowances) => (basic + allowances) / 240 + 0.5 * (basic / 240);

test("Saudi overtime examples match Article 107 with allowances", () => {
  assert.equal(otRate(9600, 2400), 70);
  assert.equal(16 * otRate(9600, 2400), 1120);
  assert.equal(otRate(6000, 1500), 43.75);
  assert.equal(8 * otRate(6000, 1500), 350);
  assert.match(page, /1,120\.00 ريال/);
  assert.match(page, /350\.00 ريال/);
});

test("Saudi overtime page no longer presents 150% of basic as the rule", () => {
  assert.doesNotMatch(page, /بنسبة 150%/);
  assert.doesNotMatch(page, /\(150%\)/);
  assert.doesNotMatch(page, /40 × 1\.5 بموجب/);
  const guide = readFileSync(new URL("../components/ToolGuideSection.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(guide, /السعودية وفق المادة \(107\) من نظام العمل بنسبة 150%/);
});

test("calculator uses the shared Article 107 function and Saudi rate label", () => {
  assert.match(component, /calculateOvertime\(/);
  assert.match(component, /from "@\/lib\/overtimeCalc"/);
  assert.match(component, /أجر فعلي \+ 50% أساسي/);
});

test("Saudi related-tool labels elsewhere do not claim a flat 150%", () => {
  const leave = readFileSync(new URL("../app/ar/sa/annual-leave-calculator/page.js", import.meta.url), "utf8");
  const settlement = readFileSync(new URL("../app/ar/sa/final-settlement-calculator/page.js", import.meta.url), "utf8");
  assert.doesNotMatch(leave, /الأوفر تايم بنسبة 150%/);
  assert.doesNotMatch(settlement, /الإضافية 150٪ وفق المادة 107/);
});
