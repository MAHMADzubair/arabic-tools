/** Focus-15 related-tools clusters for multi-country salary & overtime pages. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { getCatalogTools, getActiveTools } from "../lib/registry.js";

const source = fs.readFileSync("components/ToolGuideSection.jsx", "utf8");
const chosen = new Set(getCatalogTools().map(t => t.href));

function cluster(name) {
  const start = source.indexOf("const " + name + " = [");
  assert.ok(start > 0, "Missing cluster " + name);
  const end = source.indexOf("];", start);
  assert.ok(end > start, "Unclosed cluster " + name);
  const body = source.slice(start, end);
  return [...body.matchAll(/\bhref:\s*"(\/[^"]+)"/g)].map(m => m[1]);
}

test("salary and overtime related-tool clusters use only the curated 15", () => {
  assert.equal(getCatalogTools().length, 15);
  assert.equal(getActiveTools().length, 36);
  for (const name of ["salaryFocus15Tools", "overtimeFocus15Tools"]) {
    const routes = cluster(name);
    assert.ok(routes.length >= 4, name + " must have useful choices");
    assert.equal(new Set(routes).size, routes.length, name + " has duplicate links");
    for (const route of routes) {
      assert.ok(chosen.has(route), name + ": not selected in focus-15 catalog: " + route);
    }
  }
});

test("regional labour pages retain existing full country-specific related links", () => {
  for (const entry of [
    '"/salary-calculator/saudi": saudiCuratedTools',
    '"/gratuity-calculator/saudi": saudiCuratedTools',
    '"/overtime-calculator/saudi": saudiCuratedTools',
    '"/salary-calculator/uae": uaeCuratedTools',
    '"/gratuity-calculator/uae": uaeCuratedTools',
    '"/overtime-calculator/uae": uaeCuratedTools',
  ]) {
    assert.ok(source.includes(entry), "Missing regional mapping: " + entry);
  }
});

test("general salary and overtime pages expose focus clusters with contextual anchors", () => {
  assert.ok(source.includes('"/salary-calculator": salaryFocus15Tools'));
  assert.ok(source.includes('"/overtime-calculator": overtimeFocus15Tools'));
  assert.ok(cluster("salaryFocus15Tools").includes("/ar/sa/final-settlement-calculator"));
  assert.ok(cluster("salaryFocus15Tools").includes("/ar/ae/notice-period-calculator"));
  assert.ok(cluster("overtimeFocus15Tools").includes("/ar/sa/annual-leave-calculator"));
  assert.ok(!cluster("salaryFocus15Tools").includes("/salary-calculator"), "No self link");
  assert.ok(!cluster("overtimeFocus15Tools").includes("/overtime-calculator"), "No self link");
  assert.match(source, /<a href=\{tool\.href\} className="tg-tool">/);
});

test("SEO canonicals and calculator logic on both pages remain unchanged", () => {
  const salary = fs.readFileSync("app/salary-calculator/page.js", "utf8");
  const overtime = fs.readFileSync("app/overtime-calculator/page.js", "utf8");
  assert.match(salary, /canonical: "\/salary-calculator"/);
  assert.match(overtime, /canonical: "\/overtime-calculator"/);
  assert.match(salary, /<SalaryCalculator/);
  assert.match(overtime, /<OvertimeCalculator/);
});
