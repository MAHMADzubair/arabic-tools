// tests/verify-adsense.mjs
// Verifies that the Google AdSense verification script is correctly embedded in Next.js generated pages.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const EXPECTED_CLIENT_ID = "ca-pub-4706954030329423";
const EXPECTED_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${EXPECTED_CLIENT_ID}`;

console.log("================================================================");
console.log("QEMLO GOOGLE ADSENSE VERIFICATION TEST SUITE");
console.log(`Expected Client ID: ${EXPECTED_CLIENT_ID}`);
console.log(`Expected Script URL: ${EXPECTED_URL}`);
console.log("================================================================\n");

const pagesToCheck = [
  "index.html",
  "about.html",
  "contact.html",
  "ar/ae/notice-period-calculator.html",
  "ar/ae/purchase-order-generator.html",
  "ar/sa/final-settlement-calculator.html",
  "ar/sa/annual-leave-calculator.html",
  "umrah-calculator.html",
  "vat-calculator.html",
  "salary-calculator.html",
  "terms.html",
  "privacy.html",
];

const appDir = path.join(process.cwd(), ".next", "server", "app");
assert.ok(fs.existsSync(appDir), ".next/server/app directory must exist. Run npm run build first.");

let passed = 0;
let failed = 0;

for (const pageRel of pagesToCheck) {
  const filePath = path.join(appDir, pageRel);
  if (!fs.existsSync(filePath)) {
    console.warn(`[WARN] Page file not found at ${filePath}`);
    continue;
  }

  const html = fs.readFileSync(filePath, "utf8");

  // Verify the script tag or preload tag contains the exact AdSense client URL
  const hasScriptUrl = html.includes(EXPECTED_URL);
  const hasClientId = html.includes(EXPECTED_CLIENT_ID);
  const hasCrossorigin = html.includes("crossorigin");

  if (hasScriptUrl && hasClientId) {
    passed++;
    console.log(`[PASS] ${pageRel} contains AdSense client ${EXPECTED_CLIENT_ID}`);
  } else {
    failed++;
    console.error(`[FAIL] ${pageRel} missing AdSense verification script!`);
  }
}

console.log(`\nAdSense Verification Test Complete: ${passed} passed, ${failed} failed.`);
assert.equal(failed, 0, "All checked pages must include Google AdSense verification script.");
