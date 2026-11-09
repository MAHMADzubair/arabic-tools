import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = readFileSync(new URL("../lib/zatcaWaveConfig.js", import.meta.url), "utf8");
const component = readFileSync(new URL("../components/ZatcaWaveChecker.jsx", import.meta.url), "utf8");
const page = readFileSync(new URL("../app/ar/sa/zatca-wave-checker/page.js", import.meta.url), "utf8");

test("Wave 25 countdown date is exported from the canonical wave record", () => {
  assert.match(
    config,
    /export const WAVE25_START_ISO = `\$\{WAVES\.find\(\(wave\) => wave\.number === 25\)\.mandateDate\}T00:00:00\+03:00`;/,
  );
  assert.match(component, /Date\.parse\(WAVE25_START_ISO\)/);
});

test("Wave 25 uses neutral wording for the published integration date", () => {
  assert.ok(config.includes('mandateLabel: "موعد الربط المعلن مع منصة فاتورة"'));
  assert.ok(page.includes("موعد الربط المعلن للموجة 25 في 1 فبراير 2027"));
  assert.ok(page.includes("يبدأ اعتباراً من 1 فبراير 2027م"));
  assert.equal(page.includes("آخر موعد للموجة 25"), false);
  assert.equal(page.includes("في موعد أقصاه 1 فبراير 2027"), false);
});

test("An unregistered answer is not presented as an exemption", () => {
  assert.ok(component.includes("لا تعتبر"));
  assert.ok(component.includes("إعفاءً من التسجيل أو الفوترة الإلكترونية"));
  assert.ok(component.includes("إيرادات خاضعة للضريبة {year}م"));
  assert.ok(component.includes("لا صافي الربح أو"));
  assert.ok(page.includes("عدم التسجيل وحده لا يكفي"));
});

test("VAT thresholds use taxable supplies/expenses and a 12-month period", () => {
  assert.ok(page.includes("375,000 ريال خلال فترة 12 شهراً"));
  assert.ok(page.includes("187,500 ريال خلال 12 شهراً"));
  assert.ok(page.includes("غير المقيمين الملزمون بسداد ضريبة القيمة المضافة"));
  assert.equal(page.includes("متوقعاً أن تتجاوزها"), false);
  assert.equal(component.includes("توقع تجاوزه"), false);
});
test("ZATCA page metadata targets Wave 25 Arabic search intent", () => {
  assert.ok(page.includes("حاسبة موجة زاتكا 25"));
  assert.ok(page.includes("فحص المجموعات 23–25"));
  assert.ok(page.includes("الإيرادات الخاضعة للضريبة للأعوام 2022–2025"));
  assert.ok(page.includes("إعلان زاتكا للموجة 25"));
  assert.ok(page.includes("دليل المجموعات الضريبية وحدود التسجيل في VAT"));
  assert.ok(config.includes("ZATCA_WAVE25_ANNOUNCEMENT_URL"));
  assert.ok(config.includes("ZATCA_VAT_REGISTRATION_GUIDE_URL"));
});
