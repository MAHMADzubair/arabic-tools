/**
 * tests/egyptGratuityRegression.test.mjs
 * QEMLO — Egypt Gratuity Regression & Evidence Gate Test Suite
 *
 * Validates:
 * 1. Egypt configuration updated to Law No. 14 of 2025, Article 172 (and removal of Law 12 of 2003 / Art 126).
 * 2. Mathematical calculation behavior:
 *    - 0.5 month wage for each of the first 5 qualifying years.
 *    - 1.0 month wage for each subsequent year.
 *    - Fractional-year calculations (e.g., 3 months, 6 months, 5.5 years) computed proportionally as mathematical estimates.
 *    - Zero and negative month boundary checks.
 * 3. Behavioral change from years < 1 to years <= 0:
 *    - Sub-annual durations now return prorated amounts instead of being cut off at zero.
 * 4. Safe and qualified legal messaging:
 *    - No false claims that Article 172 explicitly contains fractional-year wording.
 *    - Pre-18 service wording matches paragraph 2 of Article 172 without adding unsupported insurance conditions.
 *    - Clear separation of Article 172 gratuity from Article 165 judicial compensation for employer unjustified termination.
 *    - Hypothetical nature of calculations explicitly stated; calculator does not verify insurance records.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Exact Egypt calc logic from components/GratuityCalculator.jsx
function egyptGratuityCalc(months, salary, reason) {
  const years = months / 12;
  if (years <= 0) {
    return {
      amount: 0,
      fullAmount: 0,
      percent: 0,
      y1Portion: 0,
      y2Portion: 0,
      note: "يرجى تحديد مدة خدمة صالحة",
    };
  }

  const y1 = Math.min(years, 5);
  const y2 = Math.max(0, years - 5);

  const y1Val = salary * 0.5 * y1;
  const y2Val = salary * 1.0 * y2;
  const gratuity = y1Val + y2Val;

  let note = "تقدير افتراضي واسترشادي (المادة 172): تُستحق المكافأة عن العمل بعد سن الستين دون حقوق تأمينية، وللمتدرج والعامل عن سنوات الخدمة السابقة على سن 18 عند بلوغها (احتساب كسور السنة تقدير حسابي استرشادي لعدم ورود نص صريح بالمادة)";
  if (reason === "resign") {
    note = "تقدير افتراضي واسترشادي: الاستقالة العادية قبل سن التقاعد تخضع لنظام المعاشات (قانون 148 لسنة 2019)، وتقتصر مكافأة المادة (172) على المدد المؤهلة قانوناً أو المزايا الرضائية";
  } else if (reason === "terminate") {
    note = "تقدير افتراضي واسترشادي: لمكافأة المادة (172) عن المدد المؤهلة. أما التعويض عن إنهاء صاحب العمل لعقد غير محدد المدة لسبب غير مشروع فيخضع لحكم قضائي وفق المادة (165) بما لا يقل عن أجر شهرين/سنة";
  }

  return {
    amount: Math.round(gratuity),
    fullAmount: Math.round(gratuity),
    percent: 100,
    y1Portion: Math.round(y1Val),
    y2Portion: Math.round(y2Val),
    note,
  };
}

test("Calculation Behavior: Sub-annual service (6 months) yields prorated mathematical estimate with qualified note", () => {
  // 6 months = 0.5 year -> 0.5 * 0.5 * 8,000 = 2,000 EGP
  const res = egyptGratuityCalc(6, 8000, "retire");
  assert.equal(res.amount, 2000);
  assert.equal(res.fullAmount, 2000);
  assert.equal(res.percent, 100);
  assert.equal(res.y1Portion, 2000);
  assert.equal(res.y2Portion, 0);
  assert.ok(res.note.includes("المادة 172"));
  assert.ok(res.note.includes("كسور السنة تقدير حسابي استرشادي"));
  assert.ok(res.note.includes("لعدم ورود نص صريح بالمادة"));
});

test("Calculation Behavior: Sub-annual service (3 months) yields exact quarter-year proportional estimate", () => {
  // 3 months = 0.25 year -> 0.25 * 0.5 * 12,000 = 1,500 EGP
  const res = egyptGratuityCalc(3, 12000, "retire");
  assert.equal(res.amount, 1500);
  assert.equal(res.fullAmount, 1500);
  assert.equal(res.y1Portion, 1500);
  assert.equal(res.y2Portion, 0);
});

test("Calculation Behavior: Exactly 1 year yields exactly half month salary", () => {
  // 12 months = 1 year -> 1 * 0.5 * 10,000 = 5,000 EGP
  const res = egyptGratuityCalc(12, 10000, "retire");
  assert.equal(res.amount, 5000);
  assert.equal(res.fullAmount, 5000);
  assert.equal(res.y1Portion, 5000);
  assert.equal(res.y2Portion, 0);
});

test("Calculation Behavior: Boundary check - 0 months and negative months return 0 without error", () => {
  const zeroRes = egyptGratuityCalc(0, 10000, "retire");
  assert.equal(zeroRes.amount, 0);
  assert.equal(zeroRes.fullAmount, 0);
  assert.equal(zeroRes.percent, 0);
  assert.equal(zeroRes.y1Portion, 0);
  assert.equal(zeroRes.y2Portion, 0);
  assert.ok(zeroRes.note.includes("يرجى تحديد مدة خدمة صالحة"));

  const negRes = egyptGratuityCalc(-5, 10000, "retire");
  assert.equal(negRes.amount, 0);
  assert.ok(negRes.note.includes("يرجى تحديد مدة خدمة صالحة"));
});

test("Calculation Behavior: Exactly 5 years at EGP 8,000 yields exactly EGP 20,000 (0.5 month per year)", () => {
  const res = egyptGratuityCalc(60, 8000, "retire");
  // 5 * 0.5 * 8,000 = 20,000
  assert.equal(res.amount, 20000);
  assert.equal(res.y1Portion, 20000);
  assert.equal(res.y2Portion, 0);
  assert.equal(res.percent, 100);
});

test("Calculation Behavior: 8 years at EGP 6,000 yields EGP 33,000 (5 yrs @ half + 3 yrs @ full)", () => {
  const res = egyptGratuityCalc(96, 6000, "retire");
  // Tier 1: 5 * 3,000 = 15,000
  // Tier 2: 3 * 6,000 = 18,000
  // Total = 33,000
  assert.equal(res.amount, 33000);
  assert.equal(res.y1Portion, 15000);
  assert.equal(res.y2Portion, 18000);
});

test("Calculation Behavior: 10 years at EGP 8,000 yields exactly EGP 60,000", () => {
  const res = egyptGratuityCalc(120, 8000, "retire");
  // Tier 1: 5 * 4,000 = 20,000
  // Tier 2: 5 * 8,000 = 40,000
  // Total = 60,000
  assert.equal(res.amount, 60000);
  assert.equal(res.y1Portion, 20000);
  assert.equal(res.y2Portion, 40000);
});

test("Calculation Behavior: Cross-tier partial year (5.5 years / 66 months at EGP 10,000) calculates correctly", () => {
  const res = egyptGratuityCalc(66, 10000, "retire");
  // Tier 1 (5 yrs): 5 * 5,000 = 25,000
  // Tier 2 (0.5 yr): 0.5 * 10,000 = 5,000
  // Total = 30,000
  assert.equal(res.amount, 30000);
  assert.equal(res.y1Portion, 25000);
  assert.equal(res.y2Portion, 5000);
});

test("Reason Logic: Notes accurately reflect legal scope for retire, resign, and terminate", () => {
  const retireRes = egyptGratuityCalc(60, 5000, "retire");
  assert.ok(retireRes.note.includes("المادة 172"));
  assert.ok(retireRes.note.includes("تقدير افتراضي واسترشادي"));
  assert.ok(retireRes.note.includes("بعد سن الستين"));
  assert.ok(retireRes.note.includes("سن 18"));
  assert.ok(retireRes.note.includes("لعدم ورود نص صريح بالمادة"));

  const resignRes = egyptGratuityCalc(60, 5000, "resign");
  assert.ok(resignRes.note.includes("قانون 148 لسنة 2019"));
  assert.ok(resignRes.note.includes("الاستقالة العادية"));

  const termRes = egyptGratuityCalc(60, 5000, "terminate");
  assert.ok(termRes.note.includes("المادة (165)"));
  assert.ok(termRes.note.includes("غير محدد المدة لسبب غير مشروع"));
  assert.ok(termRes.note.includes("أجر شهرين/سنة"));
});

test("Component Source Integrity: GratuityCalculator.jsx has no false fractional claims, no legacy laws, and accurate pre-18 wording", () => {
  const compPath = path.resolve(process.cwd(), "components/GratuityCalculator.jsx");
  const content = fs.readFileSync(compPath, "utf-8");

  // Citations
  assert.ok(content.includes("قانون العمل المصري رقم 14 لسنة 2025 (المادة 172)"));
  assert.ok(!content.includes("قانون العمل المصري رقم 12 لسنة 2003"));
  assert.ok(!content.includes("المادة 126"));
  assert.ok(content.includes("165"));
  assert.ok(content.includes("172"));

  // No false statutory claim that Article 172 explicitly contains fractional wording
  assert.ok(!content.includes("وتُحسب عن كسور السنة بنسبتها دون اشتراط حد أدنى لسنة كاملة"));
  assert.ok(!content.includes("مع استحقاق نسبي لكسور السنة"));

  // Qualified fractional year note present
  assert.ok(content.includes("لا تتضمن المادة (172) نصاً صريحاً يقرر استحقاق المكافأة عن كسور السنة"));
  assert.ok(content.includes("تقدير حسابي استرشادي"));

  // Pre-18 text has no unsupported insurance condition
  assert.ok(content.includes("سنوات الخدمة السابقة على سن 18"));
  assert.ok(!content.includes("السابقة على سن الثامنة عشرة إذا لم تكن له عنها حقوق في تأمين الشيخوخة"));

  // Article 165 distinction
  assert.ok(content.includes("غير محدد المدة لسبب غير مشروع"));
  assert.ok(content.includes("بما لا يقل عن أجر شهرين عن كل سنة"));
  assert.ok(content.includes("تعويض قضائي مستقل"));
});

test("Page Source Integrity: egypt/page.js contains accurate citations, qualified fractional treatment, and no unsupported conditions", () => {
  const pagePath = path.resolve(process.cwd(), "app/gratuity-calculator/egypt/page.js");
  const content = fs.readFileSync(pagePath, "utf-8");

  // Citations
  assert.ok(content.includes("قانون العمل 14 لسنة 2025"));
  assert.ok(content.includes("المادة (172)"));
  assert.ok(content.includes("المادة (165)"));
  assert.ok(!content.includes("قانون العمل المصري رقم 12 لسنة 2003"));
  assert.ok(!content.includes("المادة (126)"));

  // No false statutory claim that Article 172 explicitly mentions fractions
  assert.ok(!content.includes("ينص صريح القانون على أن المكافأة تُستحق أيضاً عن كسور السنة"));
  assert.ok(!content.includes("مع استحقاق المكافأة عن كسور السنة بنسبة ما قضاه منها دون اشتراط قضاء سنة كاملة"));

  // Qualified fractional treatment present
  assert.ok(content.includes("ولا تتضمن المادة نصاً صريحاً بشأن كسور السنة"));
  assert.ok(content.includes("لا تتضمن المادة (172) من قانون العمل 14 لسنة 2025 نصاً صريحاً"));
  assert.ok(content.includes("عدم يقين قانوني"));

  // Pre-18 text does not add unsupported insurance conditions
  assert.ok(!content.includes("قبل سن 18 غير المغطاة تأمينياً"));
  assert.ok(!content.includes("السابقة على سن الثامنة عشرة إذا لم تكن له عنها حقوق تأمينية"));
  assert.ok(content.includes("الخدمة السابقة على سن 18 للمتدرج والعامل عند بلوغ هذه السن"));
});
