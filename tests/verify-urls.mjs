// tests/verify-urls.mjs
// Verifies all indexable public URLs generated in sitemap.xml against the Next.js production or local server.
import assert from "node:assert/strict";

const rawBase = process.env.BASE_URL || "http://localhost:3000";
const BASE_URL = rawBase.replace(/\/$/, "");
const PRODUCTION_ORIGIN = "https://qemlo.com";

const isLocalhost = BASE_URL.includes("localhost") || BASE_URL.includes("127.0.0.1");
const executionTargetType = isLocalhost ? "LOCAL SERVER (localhost)" : "REMOTE / PRODUCTION DOMAIN";

async function main() {
  console.log(`================================================================`);
  console.log(`QEMLO SEO & URL VERIFICATION SUITE`);
  console.log(`Target: ${BASE_URL} [${executionTargetType}]`);
  console.log(`Production Canonical Baseline: ${PRODUCTION_ORIGIN}`);
  console.log(`================================================================\n`);

  console.log("Fetching sitemap.xml from target server...");
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
    const targetUrl = `${BASE_URL}${urlObj.pathname}`;

    try {
      const res = await fetch(targetUrl, { redirect: "manual" });
      const status = res.status;
      const html = await res.text();

      const errors = [];

      // 1. HTTP 200 and page content validity
      if (status !== 200) {
        errors.push(`Expected HTTP 200, got ${status}`);
      }
      if (html.length < 200) {
        errors.push(`Page payload unexpectedly small (${html.length} bytes)`);
      }
      if (html.includes("Application error: a client-side exception has occurred")) {
        errors.push("React runtime crash detected in HTML");
      }

      // 2. Canonical tag checks: verify ACTUAL tag count, not only distinct URLs
      // Matches <link rel="canonical" href="..."> and <link href="..." rel="canonical">
      const canonicalTagMatches = [
        ...html.matchAll(/<link(?=[^>]*\srel=["']canonical["'])(?=[^>]*\shref=["']([^"']*)["'])[^>]*>/gi),
      ];
      const actualCanonicalCount = canonicalTagMatches.length;

      if (actualCanonicalCount === 0) {
        errors.push("Missing <link rel=\"canonical\"> tag");
      } else if (actualCanonicalCount > 1) {
        errors.push(`Multiple canonical tags found in HTML (${actualCanonicalCount} tags)`);
      } else {
        const canonicalHref = canonicalTagMatches[0][1];
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

      // 4. Meta description check: verify presence and uniqueness
      const descMatches = [
        ...html.matchAll(/<meta(?=[^>]*\sname=["']description["'])(?=[^>]*\scontent=["']([^"']*)["'])[^>]*>/gi),
      ];
      if (descMatches.length === 0) {
        errors.push("Missing <meta name=\"description\"> tag");
      } else if (descMatches.length > 1) {
        errors.push(`Duplicate meta description tags found in HTML (${descMatches.length} tags)`);
      } else {
        const descContent = descMatches[0][1].trim();
        if (!descContent) {
          errors.push("Empty meta description content");
        }
      }

      // 5. No unintended noindex check on organic pages
      const robotsMatches = [
        ...html.matchAll(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/gi),
      ];
      for (const rMatch of robotsMatches) {
        if (rMatch[1].toLowerCase().includes("noindex")) {
          errors.push(`Unintended noindex directive found on public page: ${rMatch[1]}`);
        }
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

  // 6. Verify robots.txt
  console.log("\nVerifying /robots.txt...");
  const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
  assert.equal(robotsRes.status, 200, "robots.txt must return HTTP 200");
  const robotsTxt = await robotsRes.text();
  assert.match(robotsTxt, /sitemap:\s*https:\/\/qemlo\.com\/sitemap\.xml/i, "robots.txt must link to production sitemap");
  console.log("[PASS] /robots.txt correctly serves production sitemap link");

  // 7. Verify legacy redirect from old final-settlement-calculator
  console.log("\nVerifying legacy redirect /final-settlement-calculator...");
  const redirRes = await fetch(`${BASE_URL}/final-settlement-calculator`, { redirect: "manual" });
  assert.equal(redirRes.status, 308, "Redirect must return 308 permanent redirect");
  const location = redirRes.headers.get("location");
  assert.equal(location, "/ar/sa/final-settlement-calculator", "Redirect destination must be /ar/sa/final-settlement-calculator");
  console.log("[PASS] /final-settlement-calculator -> /ar/sa/final-settlement-calculator (308 Permanent)");

  console.log(`\n================================================================`);
  console.log(`SEO URL VERIFICATION SUMMARY`);
  console.log(`Execution Environment: ${executionTargetType} (${BASE_URL})`);
  console.log(`Total URLs Tested: ${urls.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`================================================================`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification script error:", err);
  process.exit(1);
});
