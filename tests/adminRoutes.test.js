// tests/adminRoutes.test.js
// Dedicated automated test suite verifying server-side data loading (fetchLeadsDirect),
// robots.txt preview-protection vs production configuration, and next.config.js headers.

import test from "node:test";
import assert from "node:assert/strict";
import { config } from "dotenv";
config({ path: ".env.local" });

import { fetchLeadsDirect } from "../lib/leadsData.js";
import robots from "../app/robots.js";
import nextConfig from "../next.config.js";

// ── 1. Direct Server Data Access: fetchLeadsDirect() ──────────────────────────

test("Server Data Access: fetchLeadsDirect queries Supabase directly without HTTP self-fetch", async () => {
  const result = await fetchLeadsDirect();
  assert.equal(typeof result, "object", "Must return an object");
  assert.ok(Array.isArray(result.leads), "Must return leads array");
  assert.equal(result.source, "supabase", "Data source must be direct supabase query");
  assert.equal(result.error, undefined, "Must have no query errors");
});

test("Server Data Access: fetchLeadsDirect fails safely when DB is unconfigured", async () => {
  const origUrl = process.env.SUPABASE_URL;
  const origKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const result = await fetchLeadsDirect();
    assert.deepEqual(result.leads, [], "Must return empty leads on DB failure");
    assert.equal(result.source, "error", "Must indicate error source");
    assert.ok(result.error, "Must include error message");
  } finally {
    if (origUrl) process.env.SUPABASE_URL = origUrl;
    if (origKey) process.env.SUPABASE_SERVICE_ROLE_KEY = origKey;
  }
});

// ── 2. Search Indexing: Preview vs Production Isolation ───────────────────────

test("Robots.txt: Completely disallows all crawlers on Preview deployments", () => {
  const originalVercelEnv = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = "preview";

  try {
    const previewRobots = robots();
    assert.deepEqual(
      previewRobots.rules,
      [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
      "Preview MUST disallow / for all user agents"
    );
    assert.equal(previewRobots.sitemap, undefined, "Preview must NOT expose sitemap in robots.txt");
  } finally {
    if (originalVercelEnv) {
      process.env.VERCEL_ENV = originalVercelEnv;
    } else {
      delete process.env.VERCEL_ENV;
    }
  }
});

test("Robots.txt: Preserves valid crawl rules and sitemap on Production", () => {
  const originalVercelEnv = process.env.VERCEL_ENV;
  delete process.env.VERCEL_ENV;

  try {
    const prodRobots = robots();
    assert.deepEqual(
      prodRobots.rules,
      [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/api/", "/internal/"],
        },
      ],
      "Production must allow / and disallow /api/ and /internal/"
    );
    assert.ok(prodRobots.sitemap.includes("/sitemap.xml"), "Production must link to sitemap.xml");
  } finally {
    if (originalVercelEnv) {
      process.env.VERCEL_ENV = originalVercelEnv;
    }
  }
});

// ── 3. Security Headers: Preview X-Robots-Tag ─────────────────────────────────

test("next.config.js: Injects X-Robots-Tag: noindex, nofollow on Preview deployments", async () => {
  const originalVercelEnv = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = "preview";

  try {
    const headersList = await nextConfig.headers();
    const globalHeaderRule = headersList.find((h) => h.source === "/(.*)");
    assert.ok(globalHeaderRule, "Global header rule must exist");

    const robotsTag = globalHeaderRule.headers.find((h) => h.key === "X-Robots-Tag");
    assert.ok(robotsTag, "X-Robots-Tag must be present in Preview headers");
    assert.equal(robotsTag.value, "noindex, nofollow");
  } finally {
    if (originalVercelEnv) {
      process.env.VERCEL_ENV = originalVercelEnv;
    } else {
      delete process.env.VERCEL_ENV;
    }
  }
});

test("next.config.js: Does NOT inject X-Robots-Tag on Production", async () => {
  const originalVercelEnv = process.env.VERCEL_ENV;
  delete process.env.VERCEL_ENV;

  try {
    const headersList = await nextConfig.headers();
    const globalHeaderRule = headersList.find((h) => h.source === "/(.*)");
    assert.ok(globalHeaderRule, "Global header rule must exist");

    const robotsTag = globalHeaderRule.headers.find((h) => h.key === "X-Robots-Tag");
    assert.equal(robotsTag, undefined, "X-Robots-Tag must NOT be injected on production");
  } finally {
    if (originalVercelEnv) {
      process.env.VERCEL_ENV = originalVercelEnv;
    }
  }
});
