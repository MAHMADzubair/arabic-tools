/** SEO Sprint 4: FAQ sync and explanatory intent, with legal calculation safeguards. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const uae = fs.readFileSync("app/ar/ae/notice-period-calculator/page.js", "utf8");
const saudi = fs.readFileSync("app/ar/sa/final-settlement-calculator/page.js", "utf8");
const noticeFaqMatch = uae.match(/const noticeFaqs = \[([\s\S]*?)\n\];/);
assert.ok(noticeFaqMatch, "Expected one source-of-truth for UAE notice FAQ data");
const noticeFaqs = noticeFaqMatch[1];

test("UAE FAQ schema and visible content are built from one FAQ source", () => {
  assert.match(uae, /mainEntity: noticeFaqs\.map\(\(\{ q, a \}\) => \(\{/);
  assert.match(uae, /\{noticeFaqs\.map\(\(item, i\) => \(/);
  assert.equal((noticeFaqs.match(/\bq: "/g) ?? []).length, 6);
  assert.match(noticeFaqs, /ما الفرق بين مدة الإنذار وبدل الإنذار في الإمارات/);
  assert.match(noticeFaqs, /noticeWaiverAnswer/);
  assert.match(noticeFaqs, /ما هي فترة الإنذار القانونية/);
});

test("UAE copy does not imply official government approval", () => {
  assert.doesNotMatch(uae, /حاسبات معتمدة ومتكاملة/);
  assert.match(uae, /ليست أدوات معتمدة رسمياً من جهة حكومية/);
  assert.match(uae, /disclaimer="هذه الأداة تقديرية استرشادية/);
});

test("Saudi FAQ distinguishes full settlement from the gratuity component", () => {
  assert.match(saudi, /ما الفرق بين المخالصة النهائية ومكافأة نهاية الخدمة في السعودية/);
  assert.match(saudi, /مكافأة نهاية الخدمة بند واحد من بنود المخالصة النهائية/);
  assert.match(saudi, /\{faqJsonLd\.mainEntity\.map\(\(faq\) => \(/);
});

test("SEO canonicals, software application URLs and calculators stay intact", () => {
  assert.match(uae, /canonical: "\/ar\/ae\/notice-period-calculator"/);
  assert.match(saudi, /canonical: "\/ar\/sa\/final-settlement-calculator"/);
  assert.match(uae, /url: \`\$\{SITE_URL\}\/ar\/ae\/notice-period-calculator\`/);
  assert.match(saudi, /url: \`\$\{SITE_URL\}\/ar\/sa\/final-settlement-calculator\`/);
  assert.match(uae, /<UaeNoticePeriodCalculator \/>/);
  assert.match(saudi, /<FinalSettlementCalculator \/>/);
  assert.match(uae, /href="\/ar\/ae\/final-settlement-calculator"/);
  assert.match(saudi, /\{RELATED\.map\(\(t\) => \(/);
});
