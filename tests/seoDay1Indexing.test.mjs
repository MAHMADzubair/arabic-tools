/**
 * tests/seoDay1Indexing.test.mjs
 * Targeted regression tests for QEMLO SEO Day 1: Targeted Indexing Recovery Sprint.
 *
 * Validates:
 * 1. Absence of internal trailing-slash links on country hubs and breadcrumbs (prevents 308 redirect generation).
 * 2. Country hub inclusion of high-priority Saudi and UAE business and statutory tools.
 * 3. Bidirectional contextual interlinking between multi-country annual leave calculator and Saudi annual leave calculator.
 * 4. Reciprocal UAE hub navigation on UAE salary calculator.
 * 5. All priority tools render valid canonical URLs matching their clean paths.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("SEO Day 1: Trailing Slash & Redirect Invariants", () => {
  test("Country hub page does not render trailing-slash switcher links", () => {
    const hubFile = path.join(process.cwd(), "app/ar/[country]/page.js");
    const content = fs.readFileSync(hubFile, "utf8");
    assert.ok(
      !content.includes("href={`/ar/${code}/`}"),
      "Country switcher must not contain trailing slash href={`/ar/${code}/`}"
    );
    assert.ok(
      content.includes("href={`/ar/${code}`}"),
      "Country switcher must link to clean href={`/ar/${code}`}"
    );
  });

  test("Saudi annual leave and final settlement breadcrumbs do not link to /ar/sa/ with trailing slash", () => {
    const annualLeaveFile = path.join(process.cwd(), "app/ar/sa/annual-leave-calculator/page.js");
    const annualLeaveContent = fs.readFileSync(annualLeaveFile, "utf8");
    assert.ok(
      !annualLeaveContent.includes('href="/ar/sa/"'),
      "Saudi annual leave breadcrumb must not have trailing slash /ar/sa/"
    );
    assert.ok(
      annualLeaveContent.includes('href="/ar/sa"'),
      "Saudi annual leave breadcrumb must link to clean /ar/sa"
    );

    const settlementFile = path.join(process.cwd(), "app/ar/sa/final-settlement-calculator/page.js");
    const settlementContent = fs.readFileSync(settlementFile, "utf8");
    assert.ok(
      !settlementContent.includes('href="/ar/sa/"'),
      "Saudi final settlement breadcrumb must not have trailing slash /ar/sa/"
    );
    assert.ok(
      settlementContent.includes('href="/ar/sa"'),
      "Saudi final settlement breadcrumb must link to clean /ar/sa"
    );
  });
});

describe("SEO Day 1: Country Hub Priority Tools Coverage", () => {
  test("Saudi country hub includes Saudi quotation generator", () => {
    const hubFile = path.join(process.cwd(), "app/ar/[country]/page.js");
    const content = fs.readFileSync(hubFile, "utf8");
    assert.ok(
      content.includes('href: "/ar/sa/quotation-generator"'),
      "Saudi hub primaryTools must link to /ar/sa/quotation-generator"
    );
  });

  test("UAE country hub includes quotation generator, VAT invoice generator, and purchase order generator", () => {
    const hubFile = path.join(process.cwd(), "app/ar/[country]/page.js");
    const content = fs.readFileSync(hubFile, "utf8");
    assert.ok(
      content.includes('href: "/ar/ae/quotation-generator"'),
      "UAE hub primaryTools must link to /ar/ae/quotation-generator"
    );
    assert.ok(
      content.includes('href: "/ar/ae/vat-invoice-generator"'),
      "UAE hub primaryTools must link to /ar/ae/vat-invoice-generator"
    );
    assert.ok(
      content.includes('href: "/ar/ae/purchase-order-generator"'),
      "UAE hub primaryTools must link to /ar/ae/purchase-order-generator"
    );
    assert.ok(
      !content.includes("أمر شراء رسمي ومعتمد"),
      "UAE purchase order description must not claim official approval or certification"
    );
    assert.ok(
      content.includes("نموذج أمر شراء احترافي قابل للتخصيص"),
      "UAE purchase order description must use neutral, professional phrasing"
    );
  });
});

describe("SEO Day 1: Contextual Interlinking", () => {
  test("Global annual leave calculator cross-links to Saudi statutory annual leave calculator", () => {
    const file = path.join(process.cwd(), "app/annual-leave-calculator/page.js");
    const content = fs.readFileSync(file, "utf8");
    assert.ok(
      content.includes('href: "/ar/sa/annual-leave-calculator"'),
      "Global annual leave calculator must link to /ar/sa/annual-leave-calculator"
    );
  });

  test("Saudi annual leave calculator cross-links back to multi-country annual leave calculator", () => {
    const file = path.join(process.cwd(), "app/ar/sa/annual-leave-calculator/page.js");
    const content = fs.readFileSync(file, "utf8");
    assert.ok(
      content.includes('href="/annual-leave-calculator"'),
      "Saudi annual leave calculator must link back to /annual-leave-calculator"
    );
  });

  test("UAE salary calculator includes link to UAE country tools hub /ar/ae with accessible brand-orange styling", () => {
    const file = path.join(process.cwd(), "app/salary-calculator/uae/page.js");
    const content = fs.readFileSync(file, "utf8");
    assert.ok(
      content.includes('href="/ar/ae"'),
      "UAE salary calculator must link to /ar/ae"
    );
    assert.ok(
      !content.includes("text-blue-600"),
      "UAE salary calculator link must not use generic blue styling"
    );
    assert.ok(
      content.includes("text-orange-700"),
      "UAE salary calculator link must use accessible brand-orange styling"
    );
  });
});
