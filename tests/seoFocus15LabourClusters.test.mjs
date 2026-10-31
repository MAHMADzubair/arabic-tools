/** SEO Sprint 3: contextual focus-15 links without disturbing old SEO related lists. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { getCatalogTools, getActiveTools } from "../lib/registry.js";

const salary = fs.readFileSync("app/salary-calculator/page.js", "utf8");
const overtime = fs.readFileSync("app/overtime-calculator/page.js", "utf8");
const guide = fs.readFileSync("components/ToolGuideSection.jsx", "utf8");
const focusLinks = new Set(getCatalogTools().map(t => t.href));

function nextStepLinks(source, headingId) {
  const start = source.indexOf('aria-labelledby="' + headingId + '"');
  assert.ok(start > 0, "Missing contextual focus navigation " + headingId);
  const end = source.indexOf("</nav>", start);
  assert.ok(end > start, "Missing close of focus navigation");
  return [...source.slice(start, end).matchAll(/<Link href="(\/[^"]+)"/g)].map(m => m[1]);
}

test("all context links are unique members of the selected 15 and do not self-link", () => {
  assert.equal(getCatalogTools().length, 15);
  assert.equal(getActiveTools().length, 36);
  for (const [source,id,currentPath] of [
    [salary,"salary-focus-links","/salary-calculator"],
    [overtime,"overtime-focus-links","/overtime-calculator"],
  ]) {
    const links = nextStepLinks(source,id);
    assert.equal(links.length, 3, "Three meaningful next-step links expected for " + id);
    assert.equal(new Set(links).size, links.length, "Duplicate focus link");
    assert.ok(!links.includes(currentPath), "No self links");
    for (const href of links) assert.ok(focusLinks.has(href), "Link outside selected 15: " + href);
  }
});

test("salary page links to three directly relevant selected employment tools", () => {
  const links = nextStepLinks(salary,"salary-focus-links");
  assert.deepEqual(links, [
    "/ar/sa/final-settlement-calculator",
    "/ar/sa/annual-leave-calculator",
    "/ar/ae/notice-period-calculator",
  ]);
  assert.match(salary, /<SalaryCalculator/);
  assert.match(salary, /canonical: "\/salary-calculator"/);
});

test("overtime page links to selected salary, Saudi settlement and UAE notice", () => {
  const links = nextStepLinks(overtime,"overtime-focus-links");
  assert.deepEqual(links, [
    "/salary-calculator",
    "/ar/sa/final-settlement-calculator",
    "/ar/ae/notice-period-calculator",
  ]);
  assert.match(overtime, /<OvertimeCalculator/);
  assert.match(overtime, /canonical: "\/overtime-calculator"/);
});

test("previous shared global and regional related-tool behavior remains untouched", () => {
  assert.ok(guide.includes('const relatedTools = curatedList'));
  assert.ok(guide.includes(': allTools.filter((tool) => tool.href !== currentPath)'));
  assert.ok(guide.includes('"/salary-calculator/saudi": saudiCuratedTools'));
  assert.ok(guide.includes('"/salary-calculator/uae": uaeCuratedTools'));
  assert.ok(!guide.includes('"/salary-calculator": salaryFocus15Tools'));
  assert.ok(!guide.includes('"/overtime-calculator": overtimeFocus15Tools'));
  assert.ok(salary.includes("<ToolGuideSection {...guideData} />"));
  assert.ok(overtime.includes("<ToolGuideSection {...guideData} />"));
});
