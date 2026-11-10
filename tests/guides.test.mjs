import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { GUIDES } from "../lib/guides.js";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("every guide has a page, a sitemap entry and stays out of the tool trust bar", () => {
  const sitemap = read("app/sitemap.js");
  const dates = read("scripts/update-page-dates.mjs");
  for (const g of GUIDES) {
    assert.match(g.updated, /^\d{4}-\d{2}-\d{2}$/);
    const staticPage = existsSync(new URL(`../app${g.href}/page.js`, import.meta.url));
    assert.ok(staticPage || existsSync(new URL("../app/guides/[slug]/page.js", import.meta.url)), g.href);
    if (staticPage) {
      assert.ok(sitemap.includes(`"${g.href}"`), `${g.href} missing from sitemap`);
      assert.ok(dates.includes(`"${g.href}"`), `${g.href} must be excluded from tool dates`);
    }
  }
  assert.ok(sitemap.includes('"/guides"'));
  assert.match(sitemap, /GUIDES\.filter/);
});

test("zakat al-fitr 2027 guide: sourced figures, honest 2027 status, schema", () => {
  const page = read("app/guides/zakat-al-fitr-2027/page.js");
  assert.match(page, /SA_KG = 3;/);
  assert.match(page, /AE_KG = 2\.5;/);
  assert.match(page, /AE_CASH_2026 = 25;/);
  assert.match(page, /لم تُعلن بعد/);
  assert.match(page, /"@type": "Article"/);
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /"@type": "BreadcrumbList"/);
  assert.match(page, /canonical: PATH/);
  assert.match(page, /href="\/zakat-al-fitr"/);
  for (const href of ["/zakat-calculator", "/kaffara-calculator", "/date-converter"]) {
    assert.ok(existsSync(new URL(`../app${href}/page.js`, import.meta.url)), href);
  }
});

test("zakat al-fitr calculator matches the guide's sourced figures", () => {
  const calc = read("components/ZakatFitrCalculator.jsx");
  assert.match(calc, /SA_SA_KG = 3;/);
  assert.doesNotMatch(calc, /saWeightKg: 2\./);
  assert.match(calc, /مجلس الإمارات للإفتاء الشرعي/);
  assert.doesNotMatch(calc, /الهيئة العامة للشؤون الإسلامية/);
  const page = read("app/zakat-al-fitr/page.js");
  assert.doesNotMatch(page, /13\.5/);
  assert.match(page, /guides\/zakat-al-fitr-2027/);
});
