import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { SUBSIDY, NEXT_STEPS, NEXT_STEPS_FAQ, INVOICING_SYSTEMS, ZATCA_SOLUTION_PROVIDERS_URL } from "../lib/wave25NextSteps.js";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("next-steps content is sourced and complete", () => {
  assert.equal(SUBSIDY.maxSar, 2500);
  assert.equal(SUBSIDY.criteria.length, 4);
  assert.equal(NEXT_STEPS.length, 3);
  assert.ok(NEXT_STEPS_FAQ.length >= 4);
  assert.match(ZATCA_SOLUTION_PROVIDERS_URL, /^https:\/\/zatca\.gov\.sa\//);
  assert.ok(INVOICING_SYSTEMS.length >= 4);
});

test("checker renders next steps only for eligible results; page adds FAQ + HowTo schema", () => {
  const checker = read("components/ZatcaWaveChecker.jsx");
  assert.match(checker, /result\.status === "eligible" && \(\s*<Wave25NextSteps/);
  const page = read("app/ar/sa/zatca-wave-checker/page.js");
  assert.match(page, /\.\.\.NEXT_STEPS_FAQ\.map/);
  assert.match(page, /"@type": "HowTo"/);
});

test("lead API requires contact consent, keeps share consent separate, never fakes success", () => {
  const api = read("app/api/wave25-help/route.js");
  assert.match(api, /if \(!consentContact\) errors\.consentContact/);
  assert.match(api, /consent_share: consentShare/);
  assert.match(api, /status: 503/);
  assert.ok(existsSync(new URL("../supabase/migrations/003_wave25_leads.sql", import.meta.url)));
  const form = read("components/zatca/Wave25NextSteps.jsx");
  assert.match(form, /res\.ok && data\.success/);
  assert.match(read("app/privacy/page.js"), /id[=:] *"help-requests"/);
});

test("referral model is disclosed: independence from ZATCA, possible referral fee, user's free choice", () => {
  const form = read("components/zatca/Wave25NextSteps.jsx");
  assert.match(form, /id="w25-disclosure"/);
  assert.match(form, /ليست تابعة لهيئة الزكاة والضريبة والجمارك/);
  assert.match(form, /عمولة إحالة/);
  assert.match(form, /الدليل الرسمي/);
  const privacy = read("app/privacy/page.js");
  assert.match(privacy, /عمولة إحالة/);
  assert.match(privacy, /وليست مقابل بياناتك/);
});
