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
