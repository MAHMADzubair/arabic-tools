/**
 * tests/finalSettlementPageSeo.test.mjs
 * Guards for the Saudi final-settlement page: theme handling, legal wording that must
 * match the calculator, and the SEO / answer-engine building blocks.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync("app/ar/sa/final-settlement-calculator/page.js", "utf8");
const calc = fs.readFileSync("components/FinalSettlementCalculator.jsx", "utf8");
const geo = fs.readFileSync("components/GeoAnswerSummary.jsx", "utf8");

test("Page, calculator and summary box all follow the site theme toggle, not only the OS", () => {
  for (const [name, src, cls] of [["page", page, ".fp"], ["calculator", calc, ".fs"], ["geo", geo, ".geo"]]) {
    assert.ok(src.includes(`:root:not([data-theme="light"]) ${cls}`), `${name}: OS-dark rule must respect data-theme="light"`);
    assert.ok(src.includes(`:root[data-theme="dark"] ${cls}`), `${name}: must support data-theme="dark"`);
  }
  // A bare OS-only dark rule is what caused the half-dark page.
  assert.doesNotMatch(page, /prefers-color-scheme:dark\)\{\.fp\{/);
  assert.doesNotMatch(geo, /prefers-color-scheme:dark\)\{\.geo\{/);
});

test("Article 85 wording matches the calculator: exactly 5 years is one third", () => {
  assert.match(page, /\["من سنتين إلى 5 سنوات", "ثلث المكافأة", "1\/3"\]/);
  assert.match(page, /\["أكثر من 5 سنوات وأقل من 10", "ثلثا المكافأة", "2\/3"\]/);
  assert.doesNotMatch(page, /من 5 إلى أقل من 10 سنوات/);
  assert.doesNotMatch(page, /إلى أقل من 5 سنوات/);
});

test("Payment deadline (Art. 88) is covered in content and FAQ", () => {
  assert.match(page, /متى يجب صرف المخالصة النهائية بعد انتهاء العقد؟/);
  assert.match(page, /المادة \(88\)/);
  assert.match(page, /أسبوع على الأكثر/);
  assert.match(page, /لا تزيد على أسبوعين/);
});

test("Page does not present itself as an official government calculator", () => {
  assert.match(page, /هل هذه الحاسبة هي الحاسبة العمالية الرسمية؟/);
  assert.match(page, /حاسبة مستقلة استرشادية/);
});

test("Structured data: FAQ, breadcrumb, app, web page (dated, with sources) and how-to", () => {
  for (const type of ["FAQPage", "BreadcrumbList", "WebApplication", "WebPage", "HowTo"]) {
    assert.ok(page.includes(`"@type": "${type}"`), `missing ${type}`);
  }
  assert.match(page, /dateModified: LAST_REVIEWED_ISO/);
  assert.match(page, /const LAST_REVIEWED_ISO = "\d{4}-\d{2}-\d{2}"/);
  assert.match(page, /SpeakableSpecification/);
  assert.match(page, /step: STEPS\.map/);
  for (const ld of ["faqJsonLd", "breadcrumbJsonLd", "appJsonLd", "webPageJsonLd", "howToJsonLd"]) {
    assert.ok(page.includes(`JSON.stringify(${ld})`), `${ld} must be rendered`);
  }
  assert.match(page, /https:\/\/www\.hrsd\.gov\.sa/);
});

test("Title stays short enough with the site suffix; description within snippet length", () => {
  const title = page.match(/const TITLE = "([^"]+)"/)[1];
  const desc = page.match(/const DESC =\s*"([^"]+)"/)[1];
  assert.ok((title + " | Qemlo").length <= 62, `title too long: ${(title + " | Qemlo").length}`);
  assert.ok(desc.length >= 110 && desc.length <= 160, `description length ${desc.length}`);
  assert.match(page, /twitter: \{/);
});

test("Calculator: one H1, labelled sections, desktop result panel, optional print details", () => {
  assert.equal((calc.match(/<h1>/g) || []).length, 1);
  assert.doesNotMatch(calc, /aria-labelledby="s1"/);
  for (const n of [1, 2, 3, 4, 5, 6]) assert.ok(calc.includes(`aria-labelledby="fs-s${n}"`), `section ${n} label`);
  assert.match(calc, /position:sticky/);
  assert.match(calc, /<details className="fs-opt">/);
  assert.match(calc, /IntersectionObserver/);
});
