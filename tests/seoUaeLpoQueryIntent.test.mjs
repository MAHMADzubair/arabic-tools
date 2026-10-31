import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("app/ar/ae/purchase-order-generator/page.js", "utf8");

test("UAE PO page addresses GSC LPO meaning and abbreviation queries", () => {
  assert.match(source, /ما معنى LPO وما اختصاره في الإمارات/);
  assert.match(source, /Local Purchase Order/);
});

test("LPO number answer is visible in the shared FAQ data and not misrepresented as official", () => {
  assert.match(source, /ما معنى رقم LPO \(LPO Number\) وكيف يتم اختياره/);
  assert.match(source, /ليس هذا الرقم رقم تسجيل حكومي أو رقم ضريبة TRN/);
  assert.match(source, /\{faqs\.map\(\(item, i\) => \(/);
  assert.match(source, /mainEntity: faqs\.map\(\(f\) => \(/);
});

test("existing SEO canonical and functional code references are preserved", () => {
  assert.match(source, /canonical: "\/ar\/ae\/purchase-order-generator"/);
  assert.match(source, /UaePurchaseOrderGenerator/);
  assert.match(source, /RelatedBusinessTools/);
});
