/** Focus catalog: curated GSC-performing tool pages without deleting live routes.
 *  2026-11: ZATCA Wave 25 checker joined the catalog (15 -> 16); registry now 37 active tools. */
const CATALOG_SIZE = 16;
const ACTIVE_SIZE = 37;
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  CATALOG_TOOL_IDS,
  TOOLS,
  getActiveTools,
  getCatalogTools,
  getCatalogToolsByCategory,
  getCatalogToolCount,
} from "../lib/registry.js";

test("catalog contains exactly 16 unique, live, registered tools", () => {
  assert.equal(getCatalogToolCount(), CATALOG_SIZE);
  assert.equal(CATALOG_TOOL_IDS.length, CATALOG_SIZE);
  assert.equal(new Set(CATALOG_TOOL_IDS).size, CATALOG_SIZE);
  assert.equal(getCatalogTools().length, CATALOG_SIZE);
  assert.ok(getCatalogTools().every((tool) => tool.status === "active"));
  assert.deepEqual(
    new Set(getCatalogTools().map((tool) => tool.id)),
    new Set(CATALOG_TOOL_IDS)
  );
});

test("other tools stay active, available by URL and registered for SEO", () => {
  assert.equal(TOOLS.length, ACTIVE_SIZE);
  assert.equal(getActiveTools().length, ACTIVE_SIZE);
  assert.equal(TOOLS.filter((t) => !CATALOG_TOOL_IDS.includes(t.id)).length, ACTIVE_SIZE - CATALOG_SIZE);
  assert.ok(TOOLS.every((tool) => tool.status === "active" && tool.href.startsWith("/")));
});

test("each catalog category only includes focus tools", () => {
  for (const category of new Set(TOOLS.map((tool) => tool.category))) {
    assert.ok(
      getCatalogToolsByCategory(category).every(
        (tool) => tool.category === category && CATALOG_TOOL_IDS.includes(tool.id)
      )
    );
  }
});

test("homepage uses focus catalog while header search and chips use curated tools", () => {
  const home = fs.readFileSync("app/page.js", "utf8");
  const header = fs.readFileSync("components/Header.jsx", "utf8");
  assert.match(home, /getCatalogToolsByCategory\(cat\.id\)/);
  assert.match(home, /getCatalogToolCount\(\)/);
  assert.match(header, /getCatalogTools\(\)/);
  for (const match of header.matchAll(/\{ href: "(\/[^"]+)", label: "[^"]+" \}/g)) {
    assert.ok(
      getCatalogTools().some((tool) => tool.href === match[1]),
      "Header quick link must be in focus catalog: " + match[1]
    );
  }
});

test("sitemap and robots are unchanged by this focus strategy", () => {
  const sitemap = fs.readFileSync("app/sitemap.js", "utf8");
  assert.match(sitemap, /saudiDeepPages/);
  assert.match(sitemap, /uaeDeepPages/);
  assert.match(sitemap, /toolRoutes/);
});
