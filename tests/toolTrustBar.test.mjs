import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { PAGE_UPDATED } from "../lib/pageDates.generated.js";
import { getToolTrust, MANUAL_REVIEWS } from "../lib/toolTrust.js";

test("every dated route is a real page with a valid date", () => {
  assert.ok(Object.keys(PAGE_UPDATED).length >= 40);
  for (const [route, date] of Object.entries(PAGE_UPDATED)) {
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/, route);
    assert.ok(existsSync(new URL(`../app${route}/page.js`, import.meta.url)), route);
  }
  for (const [route, date] of Object.entries(MANUAL_REVIEWS)) {
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/, route);
    assert.ok(PAGE_UPDATED[route], `${route} reviewed but not an indexed tool`);
  }
});

test("trust bar data resolves for tools and stays empty elsewhere", () => {
  const ei = getToolTrust("/ar/ae/e-invoicing-readiness-checker");
  assert.equal(ei.updated, PAGE_UPDATED["/ar/ae/e-invoicing-readiness-checker"]);
  assert.ok(ei.source);
  assert.equal(ei.change.id, "uae-einvoicing-md197-cd173");
  assert.equal(getToolTrust("/overtime-calculator/saudi").change, null);
  assert.equal(getToolTrust("/contact"), null);
  assert.equal(getToolTrust("/"), null);
  assert.equal(getToolTrust("/admin"), null);
});

test("root layout renders the trust bar inside main", () => {
  assert.match(readFileSync(new URL("../app/layout.js", import.meta.url), "utf8"), /<main id="main"[^>]*><ToolTrustBar \/>/);
});
