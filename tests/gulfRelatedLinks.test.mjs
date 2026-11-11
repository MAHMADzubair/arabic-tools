/**
 * tests/gulfRelatedLinks.test.mjs
 * Focused regression tests for SEO Day 10: Saudi & UAE Contextual Internal Linking.
 *
 * Validates:
 * 1. Saudi Salary, Gratuity, and Overtime pages recommend strictly curated Saudi payroll/labour tools.
 * 2. Saudi pages do not recommend UAE-only payroll tools or unrelated generic tools.
 * 3. UAE Salary, Gratuity, and Overtime pages recommend strictly curated UAE payroll/labour tools.
 * 4. UAE pages do not recommend Saudi-only payroll tools or unrelated generic tools.
 * 5. No self-links or duplicate destinations on any targeted route.
 * 6. HTML anchor elements with valid crawlable href attributes are rendered in DOM.
 * 7. Non-targeted routes preserve their existing global-tool recommendation behavior.
 * 8. All linked destinations in the Gulf clusters exist as actual routes on disk.
 */

import { render, cleanup } from "@testing-library/react";
import { strict as assert } from "node:assert";
import { test, describe, afterEach } from "node:test";
import React from "react";
import fs from "node:fs";
import path from "node:path";
import ToolGuideSection, { TARGETED_GULF_ROUTES } from "../components/ToolGuideSection.jsx";

afterEach(() => cleanup());

const mockGuideBase = {
  aboutTitle: "دليل الأداة التجريبي",
  aboutContent: ["محتوى تجريبي للتحقق من الروابط الداخلية."],
  faqs: [{ question: "سؤال تجريبي؟", answer: "إجابة تجريبية." }],
};

const SAUDI_CLUSTER_HREFS = [
  "/salary-calculator/saudi",
  "/gratuity-calculator/saudi",
  "/overtime-calculator/saudi",
  "/ar/sa/final-settlement-calculator",
  "/ar/sa/annual-leave-calculator",
  "/ar/sa/article-77-calculator",
];

const UAE_CLUSTER_HREFS = [
  "/salary-calculator/uae",
  "/gratuity-calculator/uae",
  "/overtime-calculator/uae",
  "/ar/ae/final-settlement-calculator",
  "/ar/ae/notice-period-calculator",
];

describe("SEO Day 10: Saudi Contextual Internal Linking", () => {
  const saudiTargetRoutes = [
    "/salary-calculator/saudi",
    "/gratuity-calculator/saudi",
    "/overtime-calculator/saudi",
  ];

  for (const route of saudiTargetRoutes) {
    test(`Saudi route ${route} renders exactly 5 curated Saudi payroll links without self-links or UAE tools`, () => {
      const { container } = render(
        React.createElement(ToolGuideSection, {
          ...mockGuideBase,
          currentPath: route,
        })
      );

      const navEl = container.querySelector('nav[aria-labelledby="tg-related"]');
      assert.ok(navEl, `Related tools nav should be rendered for ${route}`);

      const anchors = Array.from(navEl.querySelectorAll("a.tg-tool"));
      assert.equal(anchors.length, 5, `Expected exactly 5 related tool recommendations for ${route}, got ${anchors.length}`);

      const hrefs = anchors.map((a) => a.getAttribute("href"));

      // 1. No self-links
      assert.ok(!hrefs.includes(route), `Route ${route} must not recommend itself (no self-link)`);

      // 2. No duplicate destinations
      const uniqueHrefs = new Set(hrefs);
      assert.equal(uniqueHrefs.size, 5, `Expected 5 unique destinations for ${route}, got duplicates`);

      // 3. Every link is a valid member of the Saudi cluster
      for (const href of hrefs) {
        assert.ok(
          SAUDI_CLUSTER_HREFS.includes(href),
          `Saudi route ${route} recommended unexpected link: ${href}`
        );
      }

      // 4. Must not recommend UAE-only payroll tools
      for (const uaeHref of UAE_CLUSTER_HREFS) {
        assert.ok(
          !hrefs.includes(uaeHref),
          `Saudi route ${route} must NOT recommend UAE tool: ${uaeHref}`
        );
      }

      // 5. Must not recommend unrelated catalogue tools (e.g. zakat, bmi, umrah, loan)
      const genericForbidden = ["/zakat-calculator", "/bmi-calculator", "/umrah-calculator", "/loan-calculator", "/inheritance-calculator"];
      for (const forbidden of genericForbidden) {
        assert.ok(
          !hrefs.includes(forbidden),
          `Saudi route ${route} must NOT recommend generic tool: ${forbidden}`
        );
      }

      // 6. Each anchor contains valid crawlable text and attributes
      for (const a of anchors) {
        const title = a.querySelector(".tg-tool-title")?.textContent?.trim();
        const desc = a.querySelector(".tg-text")?.textContent?.trim();
        assert.ok(title && title.length > 5, `Anchor for ${a.getAttribute("href")} must have descriptive title`);
        assert.ok(desc && desc.length > 10, `Anchor for ${a.getAttribute("href")} must have descriptive summary`);
      }
    });
  }
});

describe("SEO Day 10: UAE Contextual Internal Linking", () => {
  const uaeTargetRoutes = [
    "/salary-calculator/uae",
    "/gratuity-calculator/uae",
    "/overtime-calculator/uae",
  ];

  for (const route of uaeTargetRoutes) {
    test(`UAE route ${route} renders exactly 4 curated UAE payroll links without self-links or Saudi tools`, () => {
      const { container } = render(
        React.createElement(ToolGuideSection, {
          ...mockGuideBase,
          currentPath: route,
        })
      );

      const navEl = container.querySelector('nav[aria-labelledby="tg-related"]');
      assert.ok(navEl, `Related tools nav should be rendered for ${route}`);

      const anchors = Array.from(navEl.querySelectorAll("a.tg-tool"));
      assert.equal(anchors.length, 4, `Expected exactly 4 related tool recommendations for ${route}, got ${anchors.length}`);

      const hrefs = anchors.map((a) => a.getAttribute("href"));

      // 1. No self-links
      assert.ok(!hrefs.includes(route), `Route ${route} must not recommend itself (no self-link)`);

      // 2. No duplicate destinations
      const uniqueHrefs = new Set(hrefs);
      assert.equal(uniqueHrefs.size, 4, `Expected 4 unique destinations for ${route}, got duplicates`);

      // 3. Every link is a valid member of the UAE cluster
      for (const href of hrefs) {
        assert.ok(
          UAE_CLUSTER_HREFS.includes(href),
          `UAE route ${route} recommended unexpected link: ${href}`
        );
      }

      // 4. Must not recommend Saudi-only payroll tools
      for (const saudiHref of SAUDI_CLUSTER_HREFS) {
        assert.ok(
          !hrefs.includes(saudiHref),
          `UAE route ${route} must NOT recommend Saudi tool: ${saudiHref}`
        );
      }

      // 5. Must not recommend unrelated catalogue tools
      const genericForbidden = ["/zakat-calculator", "/bmi-calculator", "/umrah-calculator", "/loan-calculator", "/inheritance-calculator"];
      for (const forbidden of genericForbidden) {
        assert.ok(
          !hrefs.includes(forbidden),
          `UAE route ${route} must NOT recommend generic tool: ${forbidden}`
        );
      }

      // 6. Each anchor contains valid crawlable text and attributes
      for (const a of anchors) {
        const title = a.querySelector(".tg-tool-title")?.textContent?.trim();
        const desc = a.querySelector(".tg-text")?.textContent?.trim();
        assert.ok(title && title.length > 5, `Anchor for ${a.getAttribute("href")} must have descriptive title`);
        assert.ok(desc && desc.length > 10, `Anchor for ${a.getAttribute("href")} must have descriptive summary`);
      }
    });
  }
});

describe("Topic clusters replace the generic 26-link dump", () => {
  test("/zakat-calculator links its Islamic cluster, including the Zakat al-Fitr 2027 guide", () => {
    const { container } = render(
      React.createElement(ToolGuideSection, { ...mockGuideBase, currentPath: "/zakat-calculator" })
    );
    const navEl = container.querySelector('nav[aria-labelledby="tg-related"]');
    assert.ok(navEl);
    const hrefs = Array.from(navEl.querySelectorAll("a.tg-tool")).map((a) => a.getAttribute("href"));
    assert.equal(hrefs.length, 6);
    assert.ok(!hrefs.includes("/zakat-calculator"), "Should not link to self");
    assert.ok(hrefs.includes("/guides/zakat-al-fitr-2027"));
    assert.ok(hrefs.includes("/zakat-al-fitr"));
    assert.ok(!hrefs.includes("/bmi-calculator"), "No off-topic tools");
  });

  test("/vat-calculator links the Saudi tax cluster, led by the ZATCA wave checker", () => {
    const { container } = render(
      React.createElement(ToolGuideSection, { ...mockGuideBase, currentPath: "/vat-calculator" })
    );
    const hrefs = Array.from(container.querySelectorAll('nav[aria-labelledby="tg-related"] a.tg-tool')).map((a) => a.getAttribute("href"));
    assert.equal(hrefs[0], "/ar/sa/zatca-wave-checker");
    assert.equal(hrefs.length, 5);
  });

  test("/salary-calculator links the labour cluster", () => {
    const { container } = render(
      React.createElement(ToolGuideSection, { ...mockGuideBase, currentPath: "/salary-calculator" })
    );
    const hrefs = Array.from(container.querySelectorAll('nav[aria-labelledby="tg-related"] a.tg-tool')).map((a) => a.getAttribute("href"));
    assert.equal(hrefs.length, 5);
    assert.ok(hrefs.includes("/ar/sa/final-settlement-calculator"));
  });

  test("an unmapped route still falls back to the global list", () => {
    const { container } = render(
      React.createElement(ToolGuideSection, { ...mockGuideBase, currentPath: "/some-new-tool" })
    );
    const anchors = container.querySelectorAll('nav[aria-labelledby="tg-related"] a.tg-tool');
    assert.equal(anchors.length, 27);
  });
});

describe("SEO Day 10: Destination Route Existence on Disk", () => {
  const allCuratedDestinations = Array.from(
    new Set([
      ...SAUDI_CLUSTER_HREFS,
      ...UAE_CLUSTER_HREFS,
      ...Object.values(TARGETED_GULF_ROUTES).flat().map((t) => t.href),
    ])
  );

  for (const dest of allCuratedDestinations) {
    test(`Curated destination ${dest} exists in app directory`, () => {
      // e.g. /salary-calculator/saudi -> app/salary-calculator/saudi/page.js
      // /ar/sa/final-settlement-calculator -> app/ar/sa/final-settlement-calculator/page.js
      const relPath = dest.replace(/^\//, "");
      const fullPath = path.join(process.cwd(), "app", relPath, "page.js");
      assert.ok(
        fs.existsSync(fullPath),
        `Route file for destination ${dest} must exist on disk at ${fullPath}`
      );
    });
  }
});
