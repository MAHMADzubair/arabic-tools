/** SEO Sprint 7: server-rendered quick unit conversions, with factual parity. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { getCatalogTools, getActiveTools } from "../lib/registry.js";

const page = fs.readFileSync("app/unit-converter/page.js", "utf8");
const client = fs.readFileSync("components/UnitConverter.jsx", "utf8");
const quick = page.match(/const quickConversions = \[([\s\S]*?)\n\];/);
assert.ok(quick, "Expected a static quick conversion list in the server page");

function baseRate(id) {
  // Source unit ids here contain only alphanumeric characters.
  assert.match(id, /^[A-Za-z0-9]+$/);
  const match = client.match(new RegExp('\\{ id: "' + id + '",[^\\n]*rateToBase: ([\\d.]+) \\}'));
  assert.ok(match, "Missing live converter unit rate for " + id);
  return Number(match[1]);
}

test("unit converter is still one of the 15 selected tools and all routes remain active", () => {
  assert.equal(getCatalogTools().length, 15);
  assert.equal(getActiveTools().length, 36);
  assert.ok(getCatalogTools().some(t => t.href === "/unit-converter"));
});

test("six quick answers are static server-rendered content and preserve calculator guide", () => {
  assert.equal((quick[1].match(/\blabel: "/g) || []).length, 6);
  assert.equal((quick[1].match(/\bresult: "/g) || []).length, 6);
  assert.match(page, /aria-labelledby="unit-quick-answers-title"/);
  assert.match(page, /\{quickConversions\.map\(\(item\) => \(/);
  assert.match(page, /<h3 className=/);
  assert.match(page, /<UnitConverter \/>/);
  assert.match(page, /<ToolGuideSection \{\.\.\.guideData\} \/>/);
  assert.ok(page.indexOf("<UnitConverter />") < page.indexOf("unit-quick-answers-title"));
  assert.ok(page.indexOf("unit-quick-answers-title") < page.indexOf("<ToolGuideSection"));
  assert.match(page, /canonical: "\/unit-converter"/);
});

test("displayed static factors match unchanged interactive unit definitions", () => {
  assert.ok(Math.abs(baseRate("in") / baseRate("cm") - 2.54) < 1e-10);
  assert.ok(Math.abs(baseRate("mi") / baseRate("km") - 1.609344) < 1e-10);
  assert.ok(Math.abs(baseRate("lb") / baseRate("kg") - 0.45359237) < 1e-10);
  assert.ok(Math.abs(baseRate("ha") / baseRate("m2") - 10000) < 1e-10);
  assert.ok(Math.abs(baseRate("gal") / baseRate("L") - 3.78541) < 1e-10);
  for (const answer of [
    "1 in = 2.54 cm",
    "1 mi = 1.609344 km",
    "1 lb ≈ 0.4536 kg",
    "32°F = 0°C",
    "1 ha = 10,000 m²",
    "1 US gal ≈ 3.78541 L",
  ]) assert.ok(quick[1].includes(answer), "Missing or changed answer: " + answer);
  assert.match(client, /else if \(from === "F"\) c = \(\(val - 32\) \* 5\) \/ 9;/);
  assert.equal(((32 - 32) * 5) / 9, 0);
});

test("SEO scope is only the public page: no new tool, no auto redirect or indexing restriction", () => {
  assert.doesNotMatch(page, /noindex|redirect\(|notFound\(|robots:/);
  assert.match(page, /currentPath: "\/unit-converter"/);
  assert.match(page, /keywords: \[/);
  assert.match(page, /<h2 id="unit-quick-answers-title"/);
});
