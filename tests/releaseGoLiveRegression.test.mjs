import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("release: root layout uses proven public shell without request-header pathname heuristics", () => {
  const layout = source("app/layout.js");
  assert.ok(!layout.includes("x-nextjs-pathname"));
  assert.ok(!layout.includes("require('next/headers')"));
  assert.ok(layout.includes("<Header />"));
  assert.ok(layout.includes("<Footer />"));
  assert.ok(layout.includes('lang="ar" dir="rtl"'));
});

test("release: Organization and WebSite structured data use real objects", () => {
  const layout = source("app/layout.js");
  assert.ok(layout.includes("const organizationJsonLd ="));
  assert.ok(layout.includes("const websiteJsonLd ="));
  assert.ok(layout.includes("JSON.stringify(organizationJsonLd)"));
  assert.ok(layout.includes("JSON.stringify(websiteJsonLd)"));
  assert.ok(layout.includes("SITE_ORG_ID"));
  assert.ok(layout.includes("SITE_WEBSITE_ID"));
});

test("release: preserve GA4 helper and AdSense account metadata", () => {
  const layout = source("app/layout.js");
  assert.ok(layout.includes("window.trackEvent"));
  assert.ok(layout.includes("google-adsense-account"));
  assert.ok(layout.includes("ADSENSE_PUB_ID"));
});

test("release: remove unused malformed public route group layout", () => {
  assert.equal(fs.existsSync(path.join(root, "app/(public)/layout.jsx")), false);
});

test("release: production admin interface and sensitive APIs remain blocked until MFA", () => {
  for (const file of [
    "app/admin/layout.jsx",
    "app/api/admin/auth/route.js",
    "app/api/admin/health/route.js",
  ]) {
    assert.ok(source(file).includes('process.env.VERCEL_ENV === "production"'), file);
  }
});

test("release: analytics pages do not present fabricated engagement statistics", () => {
  for (const file of [
    "app/admin/(dashboard)/journeys/page.jsx",
    "app/admin/(dashboard)/performance/page.jsx",
    "app/admin/(dashboard)/visitors/page.jsx",
    "app/admin/(dashboard)/tools/[toolId]/page.jsx",
  ]) {
    const code = source(file);
    assert.ok(code.includes("Setup Required"), file);
    for (const fabricated of ["74%", "72%", "2.8 Steps", "1.2s", "24ms", "68%", "28%"]) {
      assert.ok(!code.includes(fabricated), `${file} contains ${fabricated}`);
    }
  }
});
