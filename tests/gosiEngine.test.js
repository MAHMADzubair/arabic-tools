// tests/gosiEngine.test.js
// Simple deterministic tests for the GOSI calculation engine.

import { calculateGOSI } from "../lib/gosiEngine.js";

function assertEqual(actual, expected, description) {
  if (actual !== expected) {
    console.error(`❌ ${description}: expected ${expected}, got ${actual}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ ${description}`);
  }
}

// Helper to create a Date for July of a given year (effective rate change).
function julyDate(year) {
  return new Date(year, 6, 3); // 3 July
}

// Test 1: Legacy Saudi employee, basic 10000, housing 2500.
const legacy = calculateGOSI({
  basic: 10000,
  housing: 2500,
  employeeCategory: "legacy",
  contributionDate: new Date(), // ignored for legacy
});
// Expected calculations:
// Contributory wage = 12500, pensionBase = 12500 (capped at 45000, above floor 1500)
// Employee pension = 12500 * 0.09 = 1125.00
// Employee SANED = 12500 * 0.0075 = 93.75
// Employee total = 1218.75
assertEqual(legacy.employeeTotal, 1218.75, "Legacy employee total employee contribution");
// Employer calculations:
// Employer pension = 1125.00, Employer SANED = 93.75
// Hazard base uses its own floor of 400, but since contributory > 400, hazardBase = 12500
// Employer hazard = 12500 * 0.02 = 250.00
// Employer total = 1125 + 93.75 + 250 = 1468.75
assertEqual(legacy.employerTotal, 1468.75, "Legacy employee employer total");

// Test 2: New system employee, contribution date July 2025 (rate 9% + 0.5% * 1 = 9.5%).
const new2025 = calculateGOSI({
  basic: 8000,
  housing: 2000,
  employeeCategory: "new",
  contributionDate: julyDate(2025),
});
// Contributory = 10000, pensionBase = 10000, rate = 0.095
// Employee pension = 10000 * 0.095 = 950.00
// Employee SANED = 10000 * 0.0075 = 75.00
// Employee total = 1025.00
assertEqual(new2025.employeeTotal, 1025.00, "New employee 2025 employee total");
// Employer: pension 950, SANED 75, hazard = 10000 * 0.02 = 200 => total 1225.00
assertEqual(new2025.employerTotal, 1225.00, "New employee 2025 employer total");

// Test 3: Minimum wage floor applies (basic 1000, housing 200).
const minFloor = calculateGOSI({
  basic: 1000,
  housing: 200,
  employeeCategory: "new",
  contributionDate: julyDate(2024), // first rate 9%
});
// Contributory = 1200, pensionBase uses floor 1500, employee pension = 1500 * 0.09 = 135.00
// Employee SANED = 1500 * 0.0075 = 11.25 => total 146.25
assertEqual(minFloor.employeeTotal, 146.25, "Minimum floor employee total");
// Employer: pension 135, SANED 11.25, hazardBase floor 400 => hazard = 400 * 0.02 = 8.00
// Employer total = 135 + 11.25 + 8 = 154.25
assertEqual(minFloor.employerTotal, 154.25, "Minimum floor employer total");

console.log("All GOSI engine tests completed.");
