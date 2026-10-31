/**
 * SEO Focus 15 — homepage discoverability regression checks.
 * These assertions protect curated navigation only; other 21 live URLs remain accessible.
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

test("curated catalog still has 15 and full active registry retains 36", () => {
  assert.equal(getCatalogToolCount(), 15);
  assert.equal(getActiveTools().length, 36);
});

test("homepage search modal only lists the curated 15", () => {
  assert.match(search, /import \{ getCatalogTools \} from "@\/lib\/registry"/);
  assert.match(search, /getCatalogTools\(\)/);
  assert.doesNotMatch(search, /getActiveTools\(\)/);
});

test("homepage hero and mobile header do not advertise old 36 count", () => {
  assert.match(hero, /toolCount = 15/);
  assert.match(header, /getCatalogToolCount\(\)/);
  assert.doesNotMatch(hero, /36\s*\}/);
  assert.doesNotMatch(header, /ابحث في 36 أداة/);
  assert.match(home, /15 أداة عربية مجانية/);
});

test("hero's promoted tools all belong to focus 15 catalog", () => {
  const selectedHrefs = new Set(getCatalogTools().map((t) => t.href));
  const hrefs = [...hero.matchAll(/href="(\/[^"#?]+)"/g)].map((m) => m[1]);
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
  assert.match(home, /حاسبات الراتب والعمرة وأدوات السعودية والإمارات/);
  assert.match(home, /فترة الإنذار/);
});

test("mobile menu focus links and category anchor are current", () => {
  assert.doesNotMatch(header, /href="\/ar\/business\/ai-sales-closer"/);
  assert.doesNotMatch(header, /href="#finance"/);
  assert.match(header, /href="#gulf"/);
  assert.match(header, /href="\/ar\/ae\/purchase-order-generator"/);
});
