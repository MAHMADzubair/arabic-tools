import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  MOF_EINVOICING_MD197_URL,
  MOF_EINVOICING_CD173_URL,
} from "../lib/uaeEInvoicingConfig.js";

const page = fs.readFileSync("app/ar/ae/e-invoicing-readiness-checker/page.js", "utf8");

test("UAE e-invoicing penalties reflect Cabinet Decision 173/2026, not the repealed 106/2025 wording", () => {
  assert.ok(page.includes("قرار مجلس الوزراء رقم 173 لسنة 2026"));
  assert.ok(page.includes("50,000 درهم خلال أي 12 شهراً متتالياً"));
  assert.ok(page.includes("250 درهماً عن كل يوم أو جزء منه"));
  assert.ok(!page.includes("5,000 درهم عن كل شهر أو جزء منه من التأخر في تطبيق نظام الفوترة الإلكترونية"));
});

test("UAE e-invoicing content reflects the verified MD197/2026 changes", () => {
  assert.ok(page.includes("24 شهراً تبدأ في 1 يناير 2027"));
  assert.ok(page.includes("14 يوم عمل من تاريخ المعاملة التجارية"));
  assert.ok(page.includes("أزال التعديل شرط أن يكون التخزين داخل دولة الإمارات"));
});

test("official Ministry of Finance PDFs are wired into the page sources", () => {
  assert.match(MOF_EINVOICING_MD197_URL, /Ministerial-Decision-No.-197-of-2026/);
  assert.match(MOF_EINVOICING_CD173_URL, /Cabinet-Decision-No.-173-of-2026/);
  assert.ok(page.includes("MOF_EINVOICING_MD197_URL"));
  assert.ok(page.includes("MOF_EINVOICING_CD173_URL"));
});
