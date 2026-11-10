/**
 * SEO Focus 15 — homepage discoverability regression checks.
 * These assertions protect curated navigation only; the other live URLs remain accessible.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { getCatalogTools, getCatalogToolCount, getActiveTools } from "../lib/registry.js";

const read = (file) => fs.readFileSync(file, "utf8");
const hero = read("components/home/HomeHero.jsx");
const header = read("components/home/HomeHeader.jsx");
const search = read("components/home/HomeSearchDialog.jsx");
const home = read("app/page.js");

test("curated catalog has 16 and full active registry retains 37", () => {
  assert.equal(getCatalogToolCount(), 16);
  assert.equal(getActiveTools().length, 37);
});

test("homepage search modal only lists the curated catalog", () => {
  assert.match(search, /import \{ getCatalogTools, CATEGORIES \} from "@\/lib\/registry"/);
  assert.match(search, /getCatalogTools\(\)/);
  assert.doesNotMatch(search, /getActiveTools\(\)/);
});

test("homepage hero and mobile header do not advertise old 36 count", () => {
  assert.match(home, /<HomeHero toolCount=\{totalTools\} \/>/);
  assert.match(home, /const totalTools = getCatalogToolCount\(\)/);
  assert.match(header, /getCatalogToolCount\(\)/);
  assert.doesNotMatch(hero, /36\s*\}/);
  assert.doesNotMatch(header, /ابحث في 36 أداة/);
});

test("hero's promoted tools all belong to the focus catalog", () => {
  const selectedHrefs = new Set(getCatalogTools().map((t) => t.href));
  // Hero links are data-driven now: chips/cards use `href: "/..."`, anchors use `href="#tools"`.
  const hrefs = [...hero.matchAll(/href(?:="|: ")(\/[^"#?]+)"/g)].map((m) => m[1]);
  assert.ok(hrefs.length >= 8, "Hero should retain meaningful crawlable tool links");
  for (const href of hrefs) {
    assert.ok(selectedHrefs.has(href), "non-focus tool promoted in hero: " + href);
  }
  for (const excluded of [
    "/ar/business/ai-sales-closer", "/ar/sa/e-invoice-generator",
    "/currency-converter", "/date-converter", "/zakat-calculator",
    "/gratuity-calculator"
  ]) {
    assert.ok(!hrefs.includes(excluded), "excluded tool should not be a hero shortcut: " + excluded);
  }
});

test("home metadata remains canonical and references actual promoted tool topics", () => {
  assert.match(home, /canonical: "\/"/);
  assert.match(home, /حاسبات الرواتب ونهاية الخدمة والضرائب للسعودية والإمارات/);
  assert.match(home, /فترة الإنذار/);
});

test("mobile menu focus links and category anchor are current", () => {
  assert.doesNotMatch(header, /href="\/ar\/business\/ai-sales-closer"/);
  assert.doesNotMatch(header, /href="#finance"/);
  assert.match(header, /href="\/#gulf"/);
  assert.match(header, /href="\/ar\/ae\/purchase-order-generator"/);
});


test("two page-specific CTR experiments remain descriptive, non-spammy and canonical", () => {
  const umrah = read("app/umrah-calculator/page.js");
  const vat = read("app/vat-calculator/page.js");
  assert.match(umrah, /حاسبة تكلفة العمرة 2026 \| الطيران والفندق والتأشيرة/);
  assert.match(umrah, /تقديري/);
  assert.match(umrah, /const PATH = "\/umrah-calculator"/);
  assert.match(umrah, /canonical: PATH/);
  assert.match(vat, /حاسبة ضريبة القيمة المضافة \| السعودية 15% والإمارات 5%/);
  assert.match(vat, /استخرج قيمتها من الإجمالي الشامل/);
  assert.match(vat, /canonical: "\/vat-calculator"/);
});
