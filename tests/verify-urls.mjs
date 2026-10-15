// tests/verify-urls.mjs
// Verifies all indexable public URLs generated in sitemap.xml against the running Next.js production server.
import assert from "node:assert/strict";

const BASE_URL = "http://localhost:3005";
const PRODUCTION_ORIGIN = "https://qemlo.com";

async function main() {
  console.log("Fetching sitemap.xml from running server...");
  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
  assert.equal(sitemapRes.status, 200, "sitemap.xml must return HTTP 200");
  const sitemapXml = await sitemapRes.text();

  // Extract all <loc> URLs
  const locMatches = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)];
  const urls = locMatches.map((m) => m[1].trim());

  console.log(`Discovered ${urls.length} URLs in sitemap.xml.\n`);

  let passedCount = 0;
  let failedCount = 0;
  const failureDetails = [];

  for (const prodUrl of urls) {
    const urlObj = new URL(prodUrl);
    const localUrl = `${BASE_URL}${urlObj.pathname}`;

    try {
      const res = await fetch(localUrl, { redirect: "manual" });
      const status = res.status;
      const html = await res.text();

      const errors = [];

      // 1. HTTP 200
      if (status !== 200) {
        errors.push(`Expected HTTP 200, got ${status}`);
      }

      // 2. Canonical tag checks
      const canonicalMatches = [
        ...html.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/gi),
        ...html.matchAll(/<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/gi),
      ];
      // Deduplicate exact regex overlap if any
      const uniqueCanonicals = Array.from(new Set(canonicalMatches.map((m) => m[1])));

      if (uniqueCanonicals.length === 0) {
        errors.push("Missing <link rel=\"canonical\"> tag");
      } else if (uniqueCanonicals.length > 1) {
        errors.push(`Multiple canonical tags found (${uniqueCanonicals.length}): ${uniqueCanonicals.join(", ")}`);
      } else {
        const canonicalHref = uniqueCanonicals[0];
        const expectedCanonical = `${PRODUCTION_ORIGIN}${urlObj.pathname === "/" ? "" : urlObj.pathname}`;
        // Normalize trailing slashes
        const normActual = canonicalHref.replace(/\/$/, "");
        const normExpected = expectedCanonical.replace(/\/$/, "");

        if (normActual !== normExpected) {
          errors.push(`Canonical mismatch: got "${canonicalHref}", expected "${expectedCanonical}"`);
        }
      }

      // 3. Title tag check
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      if (!titleMatch || !titleMatch[1].trim()) {
        errors.push("Missing or empty <title>");
      } else {
        const title = titleMatch[1];
        if (title.includes("Qemlo | Qemlo") || title.includes("| Qemlo |")) {
          errors.push(`Duplicate title suffix detected: "${title}"`);
        }
      }

      // 4. Meta description check
      const descMatch = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
      if (!descMatch || !descMatch[1].trim()) {
        errors.push("Missing or empty <meta name=\"description\">");
      }

      // 5. No unintended noindex check
      const robotsMatch = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
      if (robotsMatch && robotsMatch[1].toLowerCase().includes("noindex")) {
        errors.push(`Unintended noindex directive found: ${robotsMatch[1]}`);
      }

      if (errors.length === 0) {
        passedCount++;
        console.log(`[PASS] ${urlObj.pathname} (HTTP 200, 1 canonical, valid title & desc)`);
      } else {
        failedCount++;
        console.error(`[FAIL] ${urlObj.pathname}`);
        for (const err of errors) {
          console.error(`       - ${err}`);
        }
        failureDetails.push({ path: urlObj.pathname, errors });
      }
    } catch (fetchErr) {
      failedCount++;
      console.error(`[FAIL] ${urlObj.pathname} - Fetch error: ${fetchErr.message}`);
      failureDetails.push({ path: urlObj.pathname, errors: [fetchErr.message] });
    }
  }

  // Also verify robots.txt
  console.log("\nVerifying /robots.txt...");
  const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
  assert.equal(robotsRes.status, 200, "robots.txt must return HTTP 200");
  const robotsTxt = await robotsRes.text();
  assert.match(robotsTxt, /sitemap:\s*https:\/\/qemlo\.com\/sitemap\.xml/i, "robots.txt must link to production sitemap");
  console.log("[PASS] /robots.txt correctly serves sitemap link");

  // Also verify redirect from old final-settlement-calculator
  console.log("\nVerifying legacy redirect /final-settlement-calculator...");
  const redirRes = await fetch(`${BASE_URL}/final-settlement-calculator`, { redirect: "manual" });
  assert.equal(redirRes.status, 308, "Redirect must return 308 permanent redirect");
  const location = redirRes.headers.get("location");
  assert.equal(location, "/ar/sa/final-settlement-calculator", "Redirect destination must be /ar/sa/final-settlement-calculator");
  console.log("[PASS] /final-settlement-calculator -> /ar/sa/final-settlement-calculator (308 Permanent)");

  console.log(`\n========================================`);
  console.log(`SEO URL VERIFICATION SUMMARY`);
  console.log(`Total URLs Tested: ${urls.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`========================================`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification script error:", err);
  process.exit(1);
});
