import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CHANGELOG, getLastChangeDates, withChangelogLastmod } from "../lib/changelog.js";

const SITE = "https://qemlo.com";

test("each page's lastmod is its newest changelog date", () => {
  const dates = getLastChangeDates();
  for (const e of CHANGELOG) {
    assert.ok(dates[e.href], `${e.href} has no date`);
    assert.ok(dates[e.href] >= e.date, `${e.href}: ${dates[e.href]} is older than entry ${e.id} (${e.date})`);
    assert.match(dates[e.href], /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("only pages with a logged change get lastmod, and never a future date", () => {
  const logged = CHANGELOG[0].href;
  const out = withChangelogLastmod(
    [{ url: SITE }, { url: `${SITE}${logged}` }, { url: `${SITE}/bmi-calculator` }, { url: `${SITE}/changelog` }],
    SITE
  );
  const today = new Date().toISOString().slice(0, 10);
  assert.equal(out[0].lastModified, undefined, "home has no logged change");
  assert.equal(out[1].lastModified, CHANGELOG[0].date);
  assert.equal(out[2].lastModified, undefined, "a page with no logged change must not claim a date");
  assert.equal(out[3].lastModified, CHANGELOG[0].date, "/changelog changes with its newest entry");
  for (const e of out) if (e.lastModified) assert.ok(e.lastModified <= today, `${e.url} lastmod is in the future`);
});

test("app/sitemap.js sends its output through withChangelogLastmod", () => {
  const src = readFileSync(new URL("../app/sitemap.js", import.meta.url), "utf8");
  assert.match(src, /withChangelogLastmod\(/);
  assert.doesNotMatch(src, /lastModified:\s*new Date\(\)/, "no build-time lastmod");
});
