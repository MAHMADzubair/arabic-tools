import test from "node:test";
import assert from "node:assert/strict";

import { metadata as adminMetadata } from "../app/admin/layout.jsx";
import robots from "../app/robots.js";
import { getActiveTools, CATEGORIES } from "../lib/registry.js";

// ── 1. Admin Indexing and Robot Protection ───────────────────────────────────

test("Layout Isolation: Admin metadata enforces strict noindex & nofollow", () => {
  assert.ok(adminMetadata, "Admin layout must define metadata");
  assert.equal(adminMetadata.robots.index, false, "Must disallow search indexation");
  assert.equal(adminMetadata.robots.follow, false, "Must disallow link following");
  assert.equal(adminMetadata.robots.nocache, true, "Must disallow search caching");
  assert.equal(adminMetadata.robots.googleBot.index, false, "Must disallow googlebot");
  assert.ok(adminMetadata.title.includes("Command Center"), "Title must identify Command Center");
});

test("Layout Isolation: robots.txt disallows /admin/ route on production", () => {
  const origVercel = process.env.VERCEL_ENV;
  delete process.env.VERCEL_ENV;

  try {
    const rules = robots().rules;
    const prodRule = rules.find((r) => r.userAgent === "*");
    assert.ok(prodRule, "Must have wildcard user agent rule");
    assert.ok(
      prodRule.disallow.includes("/admin/"),
      "robots.txt MUST include /admin/ in disallow list"
    );
  } finally {
    if (origVercel) process.env.VERCEL_ENV = origVercel;
  }
});

// ── 2. Dynamic Tool Registry Synchronization ─────────────────────────────────

test("Dynamic Registry: Discovers all registered active tools", () => {
  const tools = getActiveTools();
  assert.ok(Array.isArray(tools), "Must return tools array");
  assert.ok(tools.length >= 30, `Expected at least 30 tools, found ${tools.length}`);

  for (const tool of tools) {
    assert.ok(tool.id, `Tool must have id: ${JSON.stringify(tool)}`);
    assert.ok(tool.nameEn, `Tool ${tool.id} must have English name`);
    assert.ok(tool.nameAr, `Tool ${tool.id} must have Arabic name`);
    assert.ok(tool.href.startsWith("/"), `Tool ${tool.id} href must be a valid path`);
    assert.ok(tool.category, `Tool ${tool.id} must have a category`);
    assert.ok(
      CATEGORIES.some((c) => c.id === tool.category),
      `Tool ${tool.id} category ${tool.category} must exist in CATEGORIES`
    );
  }
});

test("Dynamic Registry: All categories have valid English and Arabic labels", () => {
  assert.ok(CATEGORIES.length >= 8, "Expected at least 8 categories");
  for (const cat of CATEGORIES) {
    assert.ok(cat.id, "Category must have id");
    assert.ok(cat.nameEn, `Category ${cat.id} must have nameEn`);
    assert.ok(cat.nameAr, `Category ${cat.id} must have nameAr`);
  }
});
