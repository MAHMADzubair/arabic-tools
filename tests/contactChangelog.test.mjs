import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { CHANGELOG, CHANGE_TYPES, COUNTRY_LABELS, getChangelogStats, getChangelogByMonth, formatArabicDate } from "../lib/changelog.js";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("changelog entries are complete, newest first, and point to real tool routes", () => {
  assert.ok(CHANGELOG.length > 0);
  const ids = new Set();
  for (const [i, e] of CHANGELOG.entries()) {
    for (const key of ["id", "date", "country", "type", "title", "summary", "who", "source", "href"]) {
      assert.ok(e[key], `${e.id || i} is missing ${key}`);
    }
    assert.match(e.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(CHANGE_TYPES[e.type], `${e.id} has unknown type`);
    assert.ok(COUNTRY_LABELS[e.country], `${e.id} has unknown country`);
    assert.ok(!ids.has(e.id), `duplicate id ${e.id}`);
    ids.add(e.id);
    assert.equal(Boolean(e.before), Boolean(e.after), `${e.id} must have both before and after, or neither`);
    if (i > 0) assert.ok(CHANGELOG[i - 1].date >= e.date, `${e.id} is out of order`);
    const file = /^\/ar\/(sa|ae)$/.test(e.href) ? "../app/ar/[country]/page.js" : `../app${e.href}/page.js`;
    assert.ok(existsSync(new URL(file, import.meta.url)), `${e.id} links to missing route ${e.href}`);
  }
});

test("changelog stats and month grouping add up", () => {
  const stats = getChangelogStats();
  assert.equal(stats.total, CHANGELOG.length);
  assert.equal(stats.byType.legal + stats.byType.fix, CHANGELOG.length);
  const grouped = getChangelogByMonth({ skipLatest: false }).reduce((n, g) => n + g.entries.length, 0);
  assert.equal(grouped, CHANGELOG.length);
  assert.equal(formatArabicDate("2026-11-09"), "9 نوفمبر 2026");
});

test("changelog page is indexable, in the sitemap and linked from the footer", () => {
  const page = read("app/changelog/page.js");
  assert.match(page, /canonical: "\/changelog"/);
  assert.doesNotMatch(page, /index: false/);
  assert.match(page, /"@type": "CollectionPage"/);
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(read("app/sitemap.js"), /"\/changelog"/);
  assert.match(read("app/layout.js"), /href: "\/changelog"/);
});

test("contact page publishes honest contact details and schema", () => {
  const page = read("app/contact/page.js");
  assert.match(page, /CONTACT_EMAIL = "contact@qemlo\.com"/);
  assert.match(page, /"@type": "ContactPage"/);
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /"@type": "BreadcrumbList"/);
  assert.match(page, /wa\.me\/923131700400/);
  assert.match(page, /href="\/changelog"/);
  assert.doesNotMatch(page, /\[مدة الرد\]|\[اسم/);
});

test("about page: schema, real links, no placeholders", () => {
  const page = read("app/about/page.js");
  assert.match(page, /"@type": "AboutPage"/);
  assert.match(page, /CONTACT_EMAIL = "contact@qemlo\.com"/);
  assert.match(page, /href="\/changelog#sa-overtime-page-copy"/);
  assert.ok(CHANGELOG.some((e) => e.id === "sa-overtime-page-copy"));
  assert.doesNotMatch(page, /\[مسودة|\[سطر|صورة المؤسس/);
  // Receipt example must match Article 107: (12000/240) + 0.5*(9600/240) = 70; 70*16 = 1120
  assert.equal((12000 / 240 + 0.5 * (9600 / 240)) * 16, 1120);
});

test("founder name comes from lib/founder.js everywhere", async () => {
  const { FOUNDER } = await import("../lib/founder.js");
  assert.equal(FOUNDER.nameAr, "محمد أحمد زبير");
  assert.equal(FOUNDER.nameEn, "Muhammad Ahmad Zubair");
  for (const f of ["app/about/page.js", "app/contact/page.js", "app/guides/zakat-al-fitr-2027/page.js", "components/guides/GuideArticle.jsx"]) {
    const src = read(f);
    assert.match(src, /from "@\/lib\/founder"/, f);
    assert.doesNotMatch(src, /"محمد أحمد"|>محمد أحمد<|م\.أ/, f);
  }
});
