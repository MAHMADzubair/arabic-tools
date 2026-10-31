import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { getCatalogTools } from "../lib/registry.js";
const content = fs.readFileSync("app/inheritance-calculator/page.js", "utf8");
test("inheritance search snippet is concise, relevant and caveated", () => {
  assert.match(content, /حاسبة الميراث الشرعية 2026 \| حساب نصيب الورثة وتقسيم التركة/);
  assert.match(content, /نتائج إرشادية، وراجع المختص/);
  assert.doesNotMatch(content, /دقة فائقة وفق أحكام القرآن الكريم وإجماع المذاهب الأربعة/);
});
test("canonical stays unchanged and inheritance remains in focus catalog", () => {
  assert.match(content, /canonical: "\/inheritance-calculator"/);
  assert.ok(getCatalogTools().some(t => t.href === "/inheritance-calculator"));
});
