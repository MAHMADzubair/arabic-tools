// tests/gosiEngine.test.js
// Independent golden regression tests for Saudi GOSI calculation engine.
// All expected values are independently calculated according to official Saudi GOSI rules.
// Legal Authority:
// • Saudi Social Insurance Law: Royal Decree M/273 dated 26/12/1445H (Cabinet Decision No. 1022)
// • Official GOSI Contributions Guide: awareness.gosi.gov.sa/pdf/Contributions.pdf (Page 5)
// • Unemployment Insurance Law (SANED): Royal Decree M/18 dated 12/03/1435H

import test from "node:test";
import assert from "node:assert/strict";
import { calculateGOSI, pensionRateForDate } from "../lib/gosiEngine.js";

test("GOSI Golden Scenario 1: Legacy Saudi, SAR 10,000, SANED eligible", () => {
  // Contributory = 10,000 (Pension base = 10,000, Hazard base = 10,000)
  // Employee pension (9%) = 900.00
  // Employee SANED (0.75%) = 75.00
  // Employee total = 975.00
  // Employer pension (9%) = 900.00
  // Employer SANED (0.75%) = 75.00
  // Employer hazard (2%) = 200.00
  // Employer total = 1,175.00
  const result = calculateGOSI({
    basic: 10000,
    housing: 0,
    employeeCategory: "legacy",
    contributionDate: new Date(2026, 9, 1),
  });

  assert.equal(result.employeePension, 900.00);
  assert.equal(result.employeeSanned, 75.00);
  assert.equal(result.employeeTotal, 975.00);
  assert.equal(result.employerHazard, 200.00);
  assert.equal(result.employerPension, 900.00);
  assert.equal(result.employerSanned, 75.00);
  assert.equal(result.employerTotal, 1175.00);
});

test("GOSI Golden Scenario 2: New Saudi, October 2026, SAR 10,000, SANED eligible", () => {
  // Oct 2026 falls in [1 Jul 2026 – 30 Jun 2027] -> pension rate = 10.00%
  // Employee pension (10%) = 1,000.00
  // Employee SANED (0.75%) = 75.00
  // Employee total = 1,075.00
  // Employer hazard (2%) = 200.00
  // Employer total = 1,000 + 75 + 200 = 1,275.00
  const result = calculateGOSI({
    basic: 10000,
    housing: 0,
    employeeCategory: "new",
    contributionDate: new Date(2026, 9, 15),
  });

  assert.equal(result.employeePension, 1000.00);
  assert.equal(result.employeeSanned, 75.00);
  assert.equal(result.employeeTotal, 1075.00);
  assert.equal(result.employerHazard, 200.00);
  assert.equal(result.employerPension, 1000.00);
  assert.equal(result.employerSanned, 75.00);
  assert.equal(result.employerTotal, 1275.00);
});

test("GOSI Golden Scenario 3: Standard non-Saudi expatriate, SAR 10,000", () => {
  // Expatriates pay 0 pension and 0 SANED.
  // Employer pays only 2% occupational hazards (SAR 200).
  const result = calculateGOSI({
    basic: 10000,
    housing: 0,
    employeeCategory: "expat",
    contributionDate: new Date(2026, 9, 1),
  });

  assert.equal(result.employeePension, 0.00);
  assert.equal(result.employeeSanned, 0.00);
  assert.equal(result.employeeTotal, 0.00);
  assert.equal(result.employerPension, 0.00);
  assert.equal(result.employerSanned, 0.00);
  assert.equal(result.employerHazard, 200.00);
  assert.equal(result.employerTotal, 200.00);
});

test("GOSI Golden Scenario 4: Legacy Saudi, SAR 50,000 contributory wage, SANED eligible", () => {
  // Contributory = 50,000 -> capped at 45,000 for both pension & hazard
  // Pension base = 45,000
  // Hazard base = 45,000
  // Employee pension (9%) = 4,050.00
  // Employee SANED (0.75%) = 337.50
  // Employee total = 4,387.50
  // Employer hazard (2%) = 900.00 (NOT 1,000)
  // Employer total = 4,050 + 337.50 + 900 = 5,287.50
  const result = calculateGOSI({
    basic: 40000,
    housing: 10000,
    employeeCategory: "legacy",
  });

  assert.equal(result.contributoryWage, 50000.00);
  assert.equal(result.pensionBase, 45000);
  assert.equal(result.hazardBase, 45000);
  assert.equal(result.employeePension, 4050.00);
  assert.equal(result.employeeSanned, 337.50);
  assert.equal(result.employeeTotal, 4387.50);
  assert.equal(result.employerHazard, 900.00);
  assert.equal(result.employerTotal, 5287.50);
});

test("GOSI Golden Scenario 5: New Saudi, October 2026, SAR 50,000 contributory wage, SANED eligible", () => {
  // Contributory = 50,000 -> capped at 45,000
  // Rate in Oct 2026 = 10%
  // Employee pension (10%) = 4,500.00
  // Employee SANED (0.75%) = 337.50
  // Employee total = 4,837.50
  // Employer hazard (2%) = 900.00
  // Employer total = 4,500 + 337.50 + 900 = 5,737.50
  const result = calculateGOSI({
    basic: 50000,
    housing: 0,
    employeeCategory: "new",
    contributionDate: new Date(2026, 9, 1),
  });

  assert.equal(result.employeePension, 4500.00);
  assert.equal(result.employeeSanned, 337.50);
  assert.equal(result.employeeTotal, 4837.50);
  assert.equal(result.employerHazard, 900.00);
  assert.equal(result.employerTotal, 5737.50);
});

test("GOSI Fix 2: SAR 1,200 contributory wage (independent hazard floor vs pension floor)", () => {
  // Contributory = 1,200
  // Pension base: floor 1,500 applies -> 1,500
  // Hazard base: within [400, 45000] -> 1,200 (MUST NOT return 400!)
  // Employer hazards at 2% = 24.00 (MUST NOT return 8.00)
  const resultLegacy = calculateGOSI({
    basic: 1000,
    housing: 200,
    employeeCategory: "legacy",
  });

  assert.equal(resultLegacy.contributoryWage, 1200.00);
  assert.equal(resultLegacy.pensionBase, 1500);
  assert.equal(resultLegacy.hazardBase, 1200);
  assert.equal(resultLegacy.employeePension, 135.00); // 1,500 * 0.09
  assert.equal(resultLegacy.employeeSanned, 11.25);  // 1,500 * 0.0075
  assert.equal(resultLegacy.employeeTotal, 146.25);
  assert.equal(resultLegacy.employerHazard, 24.00);   // 1,200 * 0.02

  // For expatriate at 1,200:
  const resultExpat = calculateGOSI({
    basic: 1200,
    housing: 0,
    employeeCategory: "expat",
  });
  assert.equal(resultExpat.employeeTotal, 0);
  assert.equal(resultExpat.employerHazard, 24.00);
});

test("GOSI SAR 400 hazard minimum boundary (wage below 400)", () => {
  // Contributory = 300
  // Hazard base: floor 400 applies -> 400
  // Employer hazard = 400 * 0.02 = 8.00
  const result = calculateGOSI({
    basic: 300,
    housing: 0,
    employeeCategory: "expat",
  });
  assert.equal(result.contributoryWage, 300.00);
  assert.equal(result.hazardBase, 400);
  assert.equal(result.employerHazard, 8.00);
});

test("GOSI SAR 1,500 pension minimum boundary", () => {
  // Exactly 1,500
  const result = calculateGOSI({
    basic: 1500,
    housing: 0,
    employeeCategory: "legacy",
  });
  assert.equal(result.pensionBase, 1500);
  assert.equal(result.hazardBase, 1500);
  assert.equal(result.employeePension, 135.00);
  assert.equal(result.employerHazard, 30.00);
});

test("GOSI SAR 45,000 contribution cap boundary", () => {
  // Exactly 45,000
  const result = calculateGOSI({
    basic: 45000,
    housing: 0,
    employeeCategory: "legacy",
  });
  assert.equal(result.pensionBase, 45000);
  assert.equal(result.hazardBase, 45000);
  assert.equal(result.employerHazard, 900.00);
});

test("GOSI Housing Modes: Cash vs In-kind vs None", () => {
  // Basic 12,000
  // Cash housing 3,000 -> Contributory = 15,000
  const resCash = calculateGOSI({
    basic: 12000,
    housing: 3000,
    housingValuationMode: "cash",
    employeeCategory: "legacy",
  });
  assert.equal(resCash.contributoryWage, 15000.00);

  // In-kind housing -> Valued at 2 months basic per year = basic / 6 = 2,000
  // Contributory = 12,000 + 2,000 = 14,000
  const resInKind = calculateGOSI({
    basic: 12000,
    housing: 0,
    housingValuationMode: "inKind",
    employeeCategory: "legacy",
  });
  assert.equal(resInKind.contributoryWage, 14000.00);
  assert.equal(resInKind.employerHazard, 280.00); // 14,000 * 0.02

  // None -> Contributory = 12,000
  const resNone = calculateGOSI({
    basic: 12000,
    housing: 5000, // ignored when "none"
    housingValuationMode: "none",
    employeeCategory: "legacy",
  });
  assert.equal(resNone.contributoryWage, 12000.00);
});

test("GOSI Pension Rate Schedule and June 30 / July 1 Step-Up Transitions", () => {
  // 3 Jul 2024 to 30 Jun 2025: 9.00%
  assert.equal(pensionRateForDate(new Date(2024, 6, 3)), 0.09);
  assert.equal(pensionRateForDate(new Date(2025, 5, 30)), 0.09); // 30 Jun 2025

  // 1 Jul 2025 to 30 Jun 2026: 9.50%
  assert.equal(pensionRateForDate(new Date(2025, 6, 1)), 0.095); // 1 Jul 2025
  assert.equal(pensionRateForDate(new Date(2026, 5, 30)), 0.095); // 30 Jun 2026

  // 1 Jul 2026 to 30 Jun 2027: 10.00%
  assert.equal(pensionRateForDate(new Date(2026, 6, 1)), 0.10); // 1 Jul 2026
  assert.equal(pensionRateForDate(new Date(2026, 9, 18)), 0.10); // Oct 2026
  assert.equal(pensionRateForDate(new Date(2027, 5, 30)), 0.10); // 30 Jun 2027

  // 1 Jul 2027 to 30 Jun 2028: 10.50%
  assert.equal(pensionRateForDate(new Date(2027, 6, 1)), 0.105); // 1 Jul 2027
  assert.equal(pensionRateForDate(new Date(2028, 5, 30)), 0.105); // 30 Jun 2028

  // 1 Jul 2028 onward (Royal Decree M/273 and GOSI Contributions Guide, Page 5):
  // Boundary verification for 30 June, 1 July, 13 July, and 14 July 2028:
  assert.equal(pensionRateForDate(new Date(2028, 5, 30)), 0.105); // 30 Jun 2028: 10.50%
  assert.equal(pensionRateForDate(new Date(2028, 6, 1)), 0.11);   // 1 Jul 2028: 11.00% (Effective date)
  assert.equal(pensionRateForDate(new Date(2028, 6, 13)), 0.11);  // 13 Jul 2028: 11.00%
  assert.equal(pensionRateForDate(new Date(2028, 6, 14)), 0.11);  // 14 Jul 2028: 11.00%
  assert.equal(pensionRateForDate(new Date(2030, 0, 1)), 0.11);

  // Full calculation verification across 30 June, 1 July, 13 July, 14 July 2028
  const res30Jun = calculateGOSI({
    basic: 10000,
    employeeCategory: "new",
    contributionDate: new Date(2028, 5, 30),
  });
  assert.equal(res30Jun.employeePensionRate, 0.105);
  assert.equal(res30Jun.employeePension, 1050.00);
  assert.equal(res30Jun.employeeTotal, 1125.00); // 1050 + 75

  const res01Jul = calculateGOSI({
    basic: 10000,
    employeeCategory: "new",
    contributionDate: new Date(2028, 6, 1),
  });
  assert.equal(res01Jul.employeePensionRate, 0.11);
  assert.equal(res01Jul.employeePension, 1100.00);
  assert.equal(res01Jul.employeeTotal, 1175.00); // 1100 + 75

  const res13Jul = calculateGOSI({
    basic: 10000,
    employeeCategory: "new",
    contributionDate: new Date(2028, 6, 13),
  });
  assert.equal(res13Jul.employeePensionRate, 0.11);
  assert.equal(res13Jul.employeePension, 1100.00);
  assert.equal(res13Jul.employeeTotal, 1175.00);

  const res14Jul = calculateGOSI({
    basic: 10000,
    employeeCategory: "new",
    contributionDate: new Date(2028, 6, 14),
  });
  assert.equal(res14Jul.employeePensionRate, 0.11);
  assert.equal(res14Jul.employeePension, 1100.00);
  assert.equal(res14Jul.employeeTotal, 1175.00);
});

test("GOSI SANED Age Boundary and Exclusions", () => {
  // Age 18: Legal labor age, SANED applies
  const res18 = calculateGOSI({
    basic: 10000,
    employeeCategory: "legacy",
    age: 18,
  });
  assert.equal(res18.employeeSanned, 75.00);

  // Age 20: SANED applies (no arbitrary age 21 barrier)
  const res20 = calculateGOSI({
    basic: 10000,
    employeeCategory: "legacy",
    age: 20,
  });
  assert.equal(res20.employeeSanned, 75.00);

  // Age 58: Below 59, SANED applies
  const res58 = calculateGOSI({
    basic: 10000,
    employeeCategory: "legacy",
    age: 58,
  });
  assert.equal(res58.employeeSanned, 75.00);

  // Age 59: Existing contributor continuation scenario (Article 3(2) & Executive Regs)
  const res59Continuation = calculateGOSI({
    basic: 10000,
    employeeCategory: "legacy",
    age: 59,
    hasPriorRegistration: true,
    isFirstTimeRegistration: false,
  });
  assert.equal(res59Continuation.employeeSanned, 75.00);
  assert.equal(res59Continuation.employeeTotal, 975.00);

  // Age 59: Initial / first-time registration scenario (Article 3(1) requires age < 59)
  const res59Initial = calculateGOSI({
    basic: 10000,
    employeeCategory: "legacy",
    age: 59,
    isFirstTimeRegistration: true,
  });
  assert.equal(res59Initial.employeeSanned, 0.00);
  assert.equal(res59Initial.employeeTotal, 900.00);

  // Age 60: Subscription cessation at age 60 under Article 3(2)
  const res60 = calculateGOSI({
    basic: 10000,
    employeeCategory: "legacy",
    age: 60,
  });
  assert.equal(res60.employeeSanned, 0.00);
  assert.equal(res60.employeeTotal, 900.00);

  // Age 65: Excluded (above 60)
  const res65 = calculateGOSI({
    basic: 10000,
    employeeCategory: "legacy",
    age: 65,
  });
  assert.equal(res65.employeeSanned, 0.00);
});

test("GOSI GCC National Treatment", () => {
  const resGcc = calculateGOSI({
    basic: 10000,
    employeeCategory: "gcc",
  });
  assert.equal(resGcc.employeeTotal, 0);
  assert.equal(resGcc.employerTotal, 0);
  assert.ok(resGcc.note && resGcc.note.includes("الخليجية"));
});

test("GOSI Zero and Invalid Inputs Handling", () => {
  const resZero = calculateGOSI({ basic: 0, housing: 0 });
  assert.equal(resZero.employeeTotal, 0);
  assert.equal(resZero.employerTotal, 0);
  assert.equal(resZero.contributoryWage, 0);

  const resNeg = calculateGOSI({ basic: -5000, housing: -1000 });
  assert.equal(resNeg.employeeTotal, 0);
  assert.equal(resNeg.employerTotal, 0);
  assert.equal(resNeg.contributoryWage, 0);
});

test("GOSI Employee and Employer Breakdown Separation", () => {
  const result = calculateGOSI({
    basic: 10000,
    housing: 2000,
    employeeCategory: "legacy",
  });
  // Contributory = 12,000
  // Employee deductions: 12,000 * (0.09 + 0.0075) = 1,170.00
  // Employer contributions: 12,000 * (0.09 + 0.0075 + 0.02) = 1,410.00
  assert.equal(result.employeeTotal, 1170.00);
  assert.equal(result.employerTotal, 1410.00);

  // Employee breakdown should only contain employee items
  const empLabels = result.employeeBreakdown.map((i) => i.label);
  assert.ok(empLabels.includes("معاشات (الموظف)"));
  assert.ok(empLabels.includes("ساند (الموظف)"));
  assert.ok(!empLabels.includes("معاشات (المنشأة)"));
  assert.ok(!empLabels.includes("المخاطر المهنية (المنشأة)"));

  // Employer breakdown should only contain employer items
  const emprLabels = result.employerBreakdown.map((i) => i.label);
  assert.ok(emprLabels.includes("معاشات (المنشأة)"));
  assert.ok(emprLabels.includes("ساند (المنشأة)"));
  assert.ok(emprLabels.includes("المخاطر المهنية (المنشأة)"));
  assert.ok(!emprLabels.includes("معاشات (الموظف)"));
});
