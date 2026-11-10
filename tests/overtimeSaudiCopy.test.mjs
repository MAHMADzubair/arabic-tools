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

test("calculator keeps the Article 107 formula and Saudi rate label", () => {
  assert.match(component, /actualHourlyWage \+ 0\.5 \* basicHourlyWage/);
  assert.match(component, /أجر فعلي \+ 50% أساسي/);
});
