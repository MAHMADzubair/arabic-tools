import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const vat = fs.readFileSync("app/vat-calculator/page.js", "utf8");
const saudi = fs.readFileSync("app/vat-calculator/saudi/page.js", "utf8");
const uae = fs.readFileSync("app/vat-calculator/uae/page.js", "utf8");

test("main VAT page links to existing canonical Saudi/UAE VAT calculators", () => {
  assert.match(vat, /import Link from "next\/link"/);
  assert.match(vat, /href="\/vat-calculator\/saudi"/);
  assert.match(vat, /href="\/vat-calculator\/uae"/);
  assert.match(saudi, /canonical: "\/vat-calculator\/saudi"/);
  assert.match(uae, /canonical: "\/vat-calculator\/uae"/);
});

test("VAT internal link content matches GSC Saudi 15% intent without promising ranking gains", () => {
  assert.match(vat, /حاسبة الضريبة 15% في السعودية/);
  assert.match(vat, /حساب ضريبة القيمة المضافة/);
  assert.match(vat, /100 ريال قبل الضريبة يصبح 115 ريالاً/);
  assert.match(vat, /100 درهم قبل الضريبة يصبح 105 دراهم/);
  assert.match(vat, /aria-label="حاسبات ضريبة القيمة المضافة حسب الدولة"/);
});

test("main VAT canonical, existing guide, calculator and authoritative metadata remain intact", () => {
  assert.match(vat, /canonical: "\/vat-calculator"/);
  assert.match(vat, /<VatCalculator/);
  assert.match(vat, /<GeoSummary/);
  assert.match(vat, /<ToolGuideSection \{\.\.\.guideData\} \/>/);
  assert.match(vat, /السعودية 15% والإمارات 5%/);
});
