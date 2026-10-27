import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

test("Homepage Header & Hero: No public admin login links in homepage components", () => {
  const homeHeaderCode = fs.readFileSync(
    path.join(rootDir, "components/home/HomeHeader.jsx"),
    "utf8"
  );
  assert.equal(
    homeHeaderCode.includes("/admin"),
    false,
    "HomeHeader must never contain /admin link"
  );
  assert.equal(
    homeHeaderCode.includes("دخول المشرف"),
    false,
    "HomeHeader must never contain 'دخول المشرف' public admin login"
  );
});

test("Homepage Header: 6 GCC country hubs are properly configured", () => {
  const homeHeaderCode = fs.readFileSync(
    path.join(rootDir, "components/home/HomeHeader.jsx"),
    "utf8"
  );
  const expectedCodes = ["sa", "ae", "qa", "kw", "om", "bh"];
  for (const code of expectedCodes) {
    assert.ok(
      homeHeaderCode.includes(`/ar/${code}`),
      `HomeHeader must link to GCC hub /ar/${code}`
    );
  }
});

test("Global Header: Homepage collision guard is present", () => {
  const globalHeaderCode = fs.readFileSync(
    path.join(rootDir, "components/Header.jsx"),
    "utf8"
  );
  assert.ok(
    globalHeaderCode.includes('if (pathname === "/") return null;'),
    "components/Header.jsx must return null on pathname === '/' to avoid duplicate headers"
  );
});

test("Homepage Hero: Exact verified H1 headline and copy structure", () => {
  const homeHeroCode = fs.readFileSync(
    path.join(rootDir, "components/home/HomeHero.jsx"),
    "utf8"
  );
  assert.ok(
    homeHeroCode.includes("حاسبات الخليج المجانية"),
    "HomeHero must contain 'حاسبات الخليج المجانية'"
  );
  assert.ok(
    homeHeroCode.includes("في مكان واحد"),
    "HomeHero must contain 'في مكان واحد'"
  );
  assert.ok(
    homeHeroCode.includes("id=\"hero-title\""),
    "HomeHero must have id='hero-title' for aria-labelledby"
  );
});

test("Homepage Semantics: No nested <main> tag in app/page.js", () => {
  const pageCode = fs.readFileSync(path.join(rootDir, "app/page.js"), "utf8");
  assert.equal(
    pageCode.includes("<main"),
    false,
    "app/page.js must not contain nested <main> (already provided by RootLayout)"
  );
  assert.ok(
    pageCode.includes('id="tools"'),
    "app/page.js must have id='tools' container for in-page anchors"
  );
});
