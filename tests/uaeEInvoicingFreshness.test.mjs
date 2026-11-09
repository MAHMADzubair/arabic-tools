import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../app/ar/ae/e-invoicing-readiness-checker/page.js", import.meta.url), "utf8");
const config = readFileSync(new URL("../lib/uaeEInvoicingConfig.js", import.meta.url), "utf8");
const registry = readFileSync(new URL("../lib/registry.js", import.meta.url), "utf8");
const component = readFileSync(new URL("../components/UaeEInvoicingChecker.jsx", import.meta.url), "utf8");

test("UAE e-invoicing page cites the current ASP accreditation decision", () => {
  assert.ok(config.includes("MOF_ASP_ACCREDITATION_FRAMEWORK_URL"));
  assert.ok(page.includes("القرار الوزاري رقم 168 لسنة 2026"));
  assert.ok(page.includes("1 أكتوبر 2026"));
  assert.ok(page.includes("قائمة ASP الرسمية الحالية"));
});

test("UAE e-invoicing sources include the FTA October 2026 deadline reminder", () => {
  assert.ok(config.includes("FTA_EINVOICING_DEADLINE_NOTICE_URL"));
  assert.ok(page.includes("25 أكتوبر 2026"));
  assert.ok(page.includes("30 أكتوبر 2026"));
  assert.ok(page.includes("1 يناير 2027"));
});

test("UAE e-invoicing FAQ states the official monthly-delay penalty", () => {
  assert.ok(page.includes("5,000 درهم"));
  assert.ok(page.includes("عن كل شهر أو جزء منه"));
  assert.ok(page.includes("عدم تعيين مزود خدمة معتمد"));
  assert.ok(config.includes("FTA_EINVOICING_DEADLINE_NOTICE_URL"));
});

test("UAE e-invoicing content is marked reviewed in November 2026", () => {
  assert.ok(config.includes("Last Regulatory Review: November 2026"));
  assert.ok(page.includes("نوفمبر 2026"));
  assert.ok(component.includes("آخر مراجعة (نوفمبر 2026)"));
});

test("related SBR tool card reflects the official 2029 extension", () => {
  assert.ok(page.includes('badge: "SBR 2029"'));
  assert.ok(page.includes("للفترات الضريبية المنتهية حتى 31 ديسمبر 2029"));
  assert.equal(page.includes('badge: "SBR 2026"'), false);
});

test("registry no longer labels the UAE e-invoicing checker as newly launched in 2026", () => {
  assert.ok(registry.includes('badge: "إلزام 2026–2027"'));
  assert.equal(registry.includes('badge: "جديد 2026"'), false);
});
