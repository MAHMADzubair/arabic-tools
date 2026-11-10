import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { GUIDE_CONTENT } from "../lib/guideContent/index.js";

const routeExists = (href) => {
  const path = href.split("#")[0];
  if (/^\/ar\/(sa|ae)$/.test(path)) return existsSync(new URL("../app/ar/[country]/page.js", import.meta.url));
  if (GUIDE_CONTENT.some((g) => g.href === path)) return true;
  return existsSync(new URL(`../app${path}/page.js`, import.meta.url));
};

const allText = (g) => JSON.stringify(g);

test("every data guide is complete and internally consistent", () => {
  const slugs = new Set();
  for (const g of GUIDE_CONTENT) {
    for (const k of ["slug", "href", "crumb", "kicker", "title", "seoTitle", "description", "lead", "published", "updated", "minutes", "answer", "sections", "faq", "sources"]) {
      assert.ok(g[k], `${g.slug}: missing ${k}`);
    }
    assert.equal(g.href, `/guides/${g.slug}`);
    assert.ok(!slugs.has(g.slug)); slugs.add(g.slug);
    assert.match(g.updated, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(g.description.length >= 120 && g.description.length <= 320, `${g.slug}: description length ${g.description.length}`);
    assert.ok(g.faq.length >= 3, `${g.slug}: needs FAQ`);
    // every [^n] must point to an existing source
    for (const m of allText(g).matchAll(/\[\^(\d+)\]/g)) {
      assert.ok(Number(m[1]) >= 1 && Number(m[1]) <= g.sources.length, `${g.slug}: [^${m[1]}] has no source`);
    }
    // every internal link must resolve
    const links = [...allText(g).matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]);
    for (const b of g.sections.flatMap((s) => s.blocks)) if (b.href) links.push(b.href);
    for (const [href] of g.related || []) links.push(href);
    for (const href of links) assert.ok(routeExists(href), `${g.slug}: broken link ${href}`);
    for (const s of g.sources) if (s.url) assert.match(s.url, /^https:\/\//);
  }
});

test("worked figures in Saudi labour guides follow the law", () => {
  const ot = (basic, allw) => (basic + allw) / 240 + 0.5 * (basic / 240);
  assert.equal(ot(9600, 2400), 70);
  assert.equal(ot(9600, 2400) * 16, 1120);
  assert.equal(ot(4000, 1500), 31.25);
  assert.equal(ot(6000, 1500), 43.75);
  assert.equal(ot(12000, 3000), 87.5);

  const eos = (wage, years) => wage * (0.5 * Math.min(years, 5) + Math.max(0, years - 5));
  const resign = (years) => (years < 2 ? 0 : years <= 5 ? 1 / 3 : years < 10 ? 2 / 3 : 1);
  assert.equal(eos(8000, 7), 36000);
  assert.equal(eos(8000, 6.25), 30000);
  assert.equal(Math.round(eos(8000, 6.25) * resign(6.25)), 20000);
  assert.equal(eos(1, 7) * resign(7), 3);
});

test("worked figures in the second batch of guides follow the law", () => {
  // GOSI: contributory wage = basic + housing, floor 1,500, cap 45,000
  const base = (basic, housing) => Math.max(1500, Math.min(basic + housing, 45000));
  assert.equal(base(8000, 2000), 10000);
  assert.equal(Math.round(base(8000, 2000) * 0.0975), 975);
  assert.equal(Math.round(base(8000, 2000) * 0.1075), 1075);
  assert.equal(base(50000, 5000), 45000);

  // Saudi Art. 77: 15 days per year, minimum two months
  const art77 = (wage, years) => Math.max((wage / 30) * 15 * years, wage * 2);
  assert.equal(art77(9000, 6), 27000);
  assert.equal(art77(9000, 2), 18000);

  // Saudi annual leave compensation: monthly ÷ 30 × days
  assert.equal((7500 / 30) * 18, 4500);
  assert.equal((12000 / 30) * 21, 8400);

  // UAE Art. 51: 21 days for first five years, 30 thereafter, basic ÷ 30, cap 24 months
  const uae = (basic, years) => Math.min((basic / 30) * (21 * Math.min(years, 5) + 30 * Math.max(0, years - 5)), basic * 24);
  assert.equal(uae(9000, 3), 18900);
  assert.equal(uae(12000, 8), 78000);
  assert.equal(Math.round(uae(10000, 2)), 14000);
  assert.equal(Math.round(uae(10000, 10)), 85000);

  // UAE corporate tax: 0% to 375,000, 9% above
  assert.equal((500000 - 375000) * 0.09, 11250);
});
