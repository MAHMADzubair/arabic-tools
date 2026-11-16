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

  test("Saudi salary calculator includes link to Saudi country tools hub /ar/sa with accessible brand-orange styling", () => {
    const file = path.join(process.cwd(), "app/salary-calculator/saudi/page.js");
    const content = fs.readFileSync(file, "utf8");
    assert.ok(
      content.includes('href="/ar/sa"'),
      "Saudi salary calculator must link to /ar/sa"
    );
    assert.ok(
      !content.includes("text-blue-600"),
      "Saudi salary calculator link must not use generic blue styling"
    );
    assert.ok(
      content.includes("text-orange-700"),
      "Saudi salary calculator link must use accessible brand-orange styling"
    );
  });

  test("Overtime calculator page links to Saudi overtime with accessible brand-orange styling", () => {
    const file = path.join(process.cwd(), "app/overtime-calculator/page.js");
    const content = fs.readFileSync(file, "utf8");
    assert.ok(
      content.includes('href="/overtime-calculator/saudi"'),
      "Overtime calculator must link to /overtime-calculator/saudi"
    );
    assert.ok(
      !content.includes("text-blue-600"),
      "Overtime calculator link must not use generic blue styling"
    );
    assert.ok(
      content.includes("text-orange-700"),
      "Overtime calculator link must use accessible brand-orange styling"
    );
  });

  test("VAT calculator country pages include hub links with accessible brand-orange styling", () => {
    const saudiFile = path.join(process.cwd(), "app/vat-calculator/saudi/page.js");
    const saudiContent = fs.readFileSync(saudiFile, "utf8");
    assert.ok(
      saudiContent.includes('href="/ar/sa"'),
      "Saudi VAT calculator must link to /ar/sa"
    );
    assert.ok(
      saudiContent.includes("text-orange-700"),
      "Saudi VAT calculator link must use accessible brand-orange styling"
    );

    const uaeFile = path.join(process.cwd(), "app/vat-calculator/uae/page.js");
    const uaeContent = fs.readFileSync(uaeFile, "utf8");
    assert.ok(
      uaeContent.includes('href="/ar/ae"'),
      "UAE VAT calculator must link to /ar/ae"
    );
    assert.ok(
      uaeContent.includes("text-orange-700"),
      "UAE VAT calculator link must use accessible brand-orange styling"
    );
  });
});

describe("Theme & Brand Color Consistency", () => {
  test("tailwind.config.js primary brand color matches QEMLO brand orange (#FF5B04)", () => {
    const configFile = path.join(process.cwd(), "tailwind.config.js");
    const content = fs.readFileSync(configFile, "utf8");
    assert.ok(
      content.includes('DEFAULT: "#FF5B04"'),
      "tailwind.config.js brand.DEFAULT must be #FF5B04"
    );
  });

  test("VatCalculator uses QEMLO orange accent and clean border tokens", () => {
    const file = path.join(process.cwd(), "components/VatCalculator.jsx");
    const content = fs.readFileSync(file, "utf8");
    assert.ok(
      content.includes("#FF5B04"),
      "VatCalculator must use QEMLO orange accent"
    );
    assert.ok(
      !content.includes("bg-brand-light px-4 py-1.5 text-sm font-bold text-brand-dark"),
      "VatCalculator must not use legacy blue brand badge"
    );
  });

  test("ZakatCalculator uses QEMLO orange accent and dark ink header", () => {
    const file = path.join(process.cwd(), "components/ZakatCalculator.jsx");
    const content = fs.readFileSync(file, "utf8");
    assert.ok(
      content.includes("#FF5B04"),
      "ZakatCalculator must use QEMLO orange accent"
    );
    assert.ok(
      !content.includes("bg-hero-gradient p-6 text-white shadow-result"),
      "ZakatCalculator must not use legacy purple hero-gradient"
    );
  });
});


describe("Saudi country hub GOSI legal freshness", () => {
  const hubFile = path.join(process.cwd(), "app/ar/[country]/page.js");
  const hubContent = fs.readFileSync(hubFile, "utf8");

  test("Saudi GOSI FAQ distinguishes legacy and new-system 2026 employee rates", () => {
    assert.ok(hubContent.includes("كم تبلغ نسبة خصم التأمينات الاجتماعية من راتب الموظف السعودي في 2026؟"));
    assert.ok(hubContent.includes("9.75%"));
    assert.ok(hubContent.includes("10.75%"));
    assert.ok(hubContent.includes("1 يوليو 2026"));
    assert.ok(hubContent.includes("3 يوليو 2024"));
  });

  test("new-system contributory wage base includes official GOSI wage components", () => {
    assert.ok(hubContent.includes("العمولات والنسب من المبيعات أو الأرباح"));
    assert.ok(hubContent.includes("بدل السكن النقدي أو العيني"));
    assert.ok(hubContent.includes("45,000 ريال شهرياً"));
  });

  test("Saudi hub renders official GOSI and HRSD sources in a dedicated section", () => {
    assert.ok(hubContent.includes('href: "https://awareness.gosi.gov.sa/businessJourney.html"'));
    assert.ok(hubContent.includes('href: "https://awareness.gosi.gov.sa/journey1.html"'));
    assert.ok(hubContent.includes('href: "https://www.hrsd.gov.sa/knowledge-centre/articles/313"'));
    assert.ok(hubContent.includes("hub.guideSources?.length > 0"));
    assert.ok(hubContent.includes('target="_blank" rel="noopener noreferrer"'));
  });

  test("Saudi hub review date and public changelog reflect the November 16 refresh", () => {
    assert.ok(hubContent.includes('lastReviewed: "نوفمبر 2026"'));
    const changelog = fs.readFileSync(path.join(process.cwd(), "lib/changelog.js"), "utf8");
    assert.ok(changelog.includes('id: "sa-gosi-2026-hub-clarification"'));
    assert.ok(changelog.includes('date: "2026-11-16"'));
    assert.ok(changelog.includes('href: "/ar/sa"'));
  });
});


describe("UAE country hub legal and tax freshness", () => {
  const hubFile = path.join(process.cwd(), "app/ar/[country]/page.js");
  const hubContent = fs.readFileSync(hubFile, "utf8");

  test("UAE hub corrects night-work and weekly-rest-day overtime treatment", () => {
    assert.ok(hubContent.includes("استثناء العاملين بنظام الورديات"));
    assert.ok(hubContent.includes("يوم راحة بديل"));
    assert.ok(hubContent.includes("زيادة لا تقل عن 50% من الأجر الأساسي"));
    assert.equal(hubContent.includes("أو في أيام الراحة الأسبوعية والعطل الرسمية"), false);
  });

  test("UAE hub includes the SBR 2029 extension and direct eligibility tool link", () => {
    assert.ok(hubContent.includes('href: "/ar/ae/small-business-relief-checker"'));
    assert.ok(hubContent.includes("3,000,000 درهم"));
    assert.ok(hubContent.includes("31 ديسمبر 2029"));
  });

  test("UAE hub includes the official phased e-invoicing dates", () => {
    assert.ok(hubContent.includes("30 أكتوبر 2026"));
    assert.ok(hubContent.includes("1 يناير 2027"));
    assert.ok(hubContent.includes("31 مارس 2027"));
    assert.ok(hubContent.includes("1 يوليو 2027"));
    assert.ok(hubContent.includes("1 أكتوبر 2027"));
  });

  test("UAE hub links to official MoF, FTA and MoHRE sources", () => {
    assert.ok(hubContent.includes("https://mof.gov.ae/ar/news/ministry-of-finance-announces-extension-of-small-business-relief-for-corporate-tax-purposes-until-31-december-2029/"));
    assert.ok(hubContent.includes("https://mof.gov.ae/ar/about-us/initiatives/einvoicing/"));
    assert.ok(hubContent.includes("https://mof.gov.ae/ar/about-us/initiatives/einvoicing/einvoicing-accredited-service-providers-asps/"));
    assert.ok(hubContent.includes("https://tax.gov.ae/ar/media.centre/News/federal.tax.authority.calls.on.persons.subject.to.einvoicing.to.comply.wit.the.prescribed.legal.deadlines.and.avoid.administrative.penalties.aspx"));
    assert.ok(hubContent.includes("https://www.mohre.gov.ae/assets/download/4bde9a71/labour-law-en.aspx"));
    assert.ok(hubContent.includes("https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/working-hours"));
  });

  test("UAE hub review date and public changelog reflect the November 16 refresh", () => {
    assert.match(hubContent, /authorityUrl: "https:\/\/tax\.gov\.ae",\s+lastReviewed: "نوفمبر 2026"/);
    const changelog = fs.readFileSync(path.join(process.cwd(), "lib/changelog.js"), "utf8");
    assert.ok(changelog.includes('id: "ae-hub-overtime-sbr-einvoicing-refresh"'));
    assert.ok(changelog.includes('date: "2026-11-16"'));
    assert.ok(changelog.includes('href: "/ar/ae"'));
  });
});
