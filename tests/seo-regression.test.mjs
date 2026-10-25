// tests/seo-regression.test.mjs
// Automated regression test for QEMLO Day 6 SEO audit
// Verifies sitemap URL count, existence of priority pages, and hreflang correctness.

import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL?.replace(/\/$/, "") || "https://qemlo.com";
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;

async function fetchXml(url) {
  const res = await fetch(url);
  assert.equal(res.status, 200, `Expected 200 from ${url}`);
  return await res.text();
}

async function getUrlsFromSitemap() {
  const xml = await fetchXml(SITEMAP_URL);
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map(m => m[1].trim());
}

async function main() {
  const urls = await getUrlsFromSitemap();
  // Expected total URLs (including all tools & static pages)
  assert.equal(urls.length, 60, `Sitemap should contain 60 URLs, found ${urls.length}`);

  const priority = [
    "/ar/ae/quotation-generator",
    "/ar/ae/vat-registration-checker",
    "/ar/sa/annual-leave-calculator",
    "/gratuity-calculator/saudi",
    "/gratuity-calculator/uae",
    "/salary-calculator/saudi",
    "/salary-calculator/uae",
    "/overtime-calculator/saudi",
    "/overtime-calculator/uae",
  ];

  for (const p of priority) {
    const full = `${BASE_URL}${p}`;
    const res = await fetch(full, { redirect: "manual" });
    assert.equal(res.status, 200, `${p} should return 200`);
  }

  // Verify hreflang on Saudi annual‑leave page (no ar‑AE alternate)
  const annualUrl = `${BASE_URL}/ar/sa/annual-leave-calculator`;
  const html = await (await fetch(annualUrl)).text();
  const hreflangs = [...html.matchAll(/<link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
  const langs = hreflangs.map(m => m[1]);
  assert.ok(!langs.includes("ar-AE"), "Saudi annual‑leave should NOT have ar-AE hreflang alternate");
  console.log("✅ SEO regression tests passed");
}

main().catch(err => {
  console.error("❌ SEO regression test failed", err);
  process.exit(1);
});
