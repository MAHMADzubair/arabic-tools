import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const PUB = "4706954030329423";

test("ads.txt and the site verification meta use the same publisher ID", () => {
  assert.match(read("public/ads.txt"), new RegExp(`google\\.com, pub-${PUB}, DIRECT, f08c47fec0942fa0`));
  assert.match(read("app/layout.js"), new RegExp(`ca-pub-${PUB}`));
});

test("privacy policy carries the disclosures AdSense requires", () => {
  const p = read("app/privacy/page.js");
  assert.match(p, /Google AdSense/);
  assert.match(p, /الموردين\s*\n?\s*الخارجيين|موردين آخرين/);
  assert.match(p, /adssettings\.google\.com/);
  assert.match(p, /aboutads\.info/);
  assert.match(p, /policies\.google\.com\/technologies\/partner-sites/);
  assert.match(p, /Google Analytics/);
  assert.match(p, /المنطقة الاقتصادية الأوروبية/);
  assert.match(p, /دون 13 عاماً/);
  assert.doesNotMatch(p, /DART/, "DART naming is retired");
  assert.doesNotMatch(p, /new Date\(\)/, "last-updated must be a fixed date");
});

test("admin, internal and api paths stay out of the index", () => {
  const r = read("app/robots.js");
  for (const path of ["/api/", "/internal/", "/admin/"]) assert.ok(r.includes(`"${path}"`), path);
  assert.match(read("app/owner-access/page.jsx"), /index: false/);
});
