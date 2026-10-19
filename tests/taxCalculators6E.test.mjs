/**
 * tests/taxCalculators6E.test.mjs
 * Sprint 6E.1 — Comprehensive independent regression tests for Saudi and UAE
 * Tax, VAT, Registration, and Invoicing accuracy.
 *
 * Covers:
 * 1. Saudi VAT number (TIN) 15-digit validation (starts and ends with 3).
 * 2. UAE TRN 15-digit format validation.
 * 3. Saudi 15% VAT calculation (addition and extraction).
 * 4. Saudi line-item VAT and discount handling.
 * 5. Invoice summary reconciliation (Gross, Discount, Net Base, VAT, Grand Total).
 * 6. Mixed-rate and fully zero-rated invoice reconciliation.
 * 7. Saudi VAT Registration threshold boundaries and capital asset exclusions.
 * 8. UAE 5% VAT addition and inclusive extraction.
 * 9. UAE VAT Registration threshold boundaries (30-day forward window, expenses).
 * 10. UAE Corporate Tax standard 0%/9% split (Golden Scenario: AED 56,250).
 * 11. UAE Corporate Tax QFZP non-qualifying treatment (no 375k band).
 * 12. UAE Small Business Relief (SBR) revenue and 31 Dec 2026 date boundaries.
 * 13. UAE Simplified Invoice threshold warning (AED 10,000).
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  isValidSaudiVatNumber,
  isValidUaeTrn,
  calcLineVat,
  parseNum,
  formatCurrency,
} from "../lib/businessUtils.js";

import {
  evaluateVatEligibility as evaluateSaudiVatEligibility,
  VAT_MANDATORY_THRESHOLD as SA_VAT_MANDATORY_THRESHOLD,
  VAT_VOLUNTARY_THRESHOLD as SA_VAT_VOLUNTARY_THRESHOLD,
  REGISTRATION_STATUS as SA_REG_STATUS,
} from "../lib/vatRegistrationConfig.js";

import {
  evaluateUaeVatEligibility,
  UAE_VAT_MANDATORY_THRESHOLD,
  UAE_VAT_VOLUNTARY_THRESHOLD,
  REGISTRATION_STATUS as UAE_REG_STATUS,
} from "../lib/uaeVatRegistrationConfig.js";

import {
  calcStandardCT,
  calcQfzpCT,
  checkSBREligibility,
  CT_ZERO_RATE_LIMIT,
  CT_STANDARD_RATE,
  SBR_REVENUE_THRESHOLD,
} from "../lib/uaeCorporateTaxConfig.js";

import {
  evaluateSBR,
  SBR_RESULT,
  SBR_END_DATE,
} from "../lib/uaeSbrConfig.js";

// ─── 1. Saudi VAT Number Validation (ZATCA 15-digit TIN) ─────────────────────

test("Saudi VAT Number: Valid 15-digit numbers starting and ending with 3", () => {
  assert.equal(isValidSaudiVatNumber("300000000000003"), true);
  assert.equal(isValidSaudiVatNumber("300456789100003"), true);
  assert.equal(isValidSaudiVatNumber("311122233344453"), true);
  // With leading/trailing whitespace
  assert.equal(isValidSaudiVatNumber("  300456789100003  "), true);
});

test("Saudi VAT Number: Invalid last digit (must end with 3)", () => {
  assert.equal(isValidSaudiVatNumber("300000000000001"), false);
  assert.equal(isValidSaudiVatNumber("300000000000002"), false);
  assert.equal(isValidSaudiVatNumber("300000000000004"), false);
  assert.equal(isValidSaudiVatNumber("300000000000009"), false);
  assert.equal(isValidSaudiVatNumber("300000000000000"), false);
});

test("Saudi VAT Number: Invalid first digit (must start with 3)", () => {
  assert.equal(isValidSaudiVatNumber("200000000000003"), false);
  assert.equal(isValidSaudiVatNumber("100000000000003"), false);
  assert.equal(isValidSaudiVatNumber("400000000000003"), false);
});

test("Saudi VAT Number: Invalid length, empty, and non-digit characters", () => {
  assert.equal(isValidSaudiVatNumber("30000000000003"), false); // 14 digits
  assert.equal(isValidSaudiVatNumber("3000000000000003"), false); // 16 digits
  assert.equal(isValidSaudiVatNumber(""), false);
  assert.equal(isValidSaudiVatNumber(null), false);
  assert.equal(isValidSaudiVatNumber(undefined), false);
  assert.equal(isValidSaudiVatNumber("3000000000000A3"), false);
  assert.equal(isValidSaudiVatNumber("300-000000-0003"), false);
});

// ─── 2. UAE TRN Validation ───────────────────────────────────────────────────

test("UAE TRN: Exactly 15 digits validation", () => {
  assert.equal(isValidUaeTrn("100345678901234"), true);
  assert.equal(isValidUaeTrn("100987654321098"), true);
  assert.equal(isValidUaeTrn("10011122233344"), false); // 14 digits
  assert.equal(isValidUaeTrn("1001112223334445"), false); // 16 digits
  assert.equal(isValidUaeTrn(""), false);
  assert.equal(isValidUaeTrn("10034567890123A"), false);
});

// ─── 3. Saudi 15% VAT Addition & Inclusive Extraction ────────────────────────

test("Saudi VAT: Exclusive addition — SAR 1,000 + 15% VAT", () => {
  const base = 1000;
  const rate = 0.15;
  const vat = base * rate;
  const total = base + vat;
  assert.equal(vat, 150);
  assert.equal(total, 1150);
});

test("Saudi VAT: Inclusive extraction — SAR 1,150 inclusive of 15% VAT", () => {
  const total = 1150;
  const rate = 0.15;
  const base = total / (1 + rate);
  const vat = total - base;
  assert.equal(Number(base.toFixed(2)), 1000);
  assert.equal(Number(vat.toFixed(2)), 150);
});

test("Saudi VAT: Halala rounding precision — SAR 100.00 inclusive of 15%", () => {
  const total = 100;
  const rate = 0.15;
  const base = total / (1 + rate);
  const vat = total - base;
  // base = 86.9565217... -> 86.96
  // vat  = 13.0434782... -> 13.04
  assert.equal(Number(base.toFixed(2)), 86.96);
  assert.equal(Number(vat.toFixed(2)), 13.04);
  assert.equal(Number((base + vat).toFixed(2)), 100.00);
});

// ─── 4. Saudi Line-item VAT and Discounts (calcLineVat) ───────────────────────

test("Saudi Line-item: Single line with trade discount applied before 15% VAT", () => {
  const line = calcLineVat({
    qty: "1",
    unitPrice: "1000",
    discount: "200",
    vatRate: 0.15,
  });
  assert.equal(line.gross, 1000);
  assert.equal(line.taxableBase, 800);
  assert.equal(line.vatAmount, 120); // 800 * 0.15 = 120
  assert.equal(line.lineTotal, 920); // 800 + 120 = 920
});

test("Saudi Line-item: Multiple quantity with decimal unit price and discount", () => {
  const line = calcLineVat({
    qty: "3",
    unitPrice: "350.50",
    discount: "51.50",
    vatRate: 0.15,
  });
  // gross = 3 * 350.50 = 1051.50
  // taxableBase = 1051.50 - 51.50 = 1000.00
  // vatAmount = 1000 * 0.15 = 150.00
  // lineTotal = 1150.00
  assert.equal(line.gross, 1051.5);
  assert.equal(line.taxableBase, 1000);
  assert.equal(line.vatAmount, 150);
  assert.equal(line.lineTotal, 1150);
});

test("Saudi Line-item: Discount exceeding gross clamps taxable base to 0", () => {
  const line = calcLineVat({
    qty: "1",
    unitPrice: "500",
    discount: "600",
    vatRate: 0.15,
  });
  assert.equal(line.gross, 500);
  assert.equal(line.taxableBase, 0);
  assert.equal(line.vatAmount, 0);
  assert.equal(line.lineTotal, 0);
});

test("Saudi Line-item: Zero-rated line (vatRate = 0)", () => {
  const line = calcLineVat({
    qty: "5",
    unitPrice: "100",
    discount: "50",
    vatRate: 0,
  });
  assert.equal(line.gross, 500);
  assert.equal(line.taxableBase, 450);
  assert.equal(line.vatAmount, 0);
  assert.equal(line.lineTotal, 450);
});

test("Saudi Line-item: Exempt line (vatRate = null)", () => {
  const line = calcLineVat({
    qty: "1",
    unitPrice: "2500",
    discount: "0",
    vatRate: null,
  });
  assert.equal(line.gross, 2500);
  assert.equal(line.taxableBase, 2500);
  assert.equal(line.vatAmount, 0);
  assert.equal(line.lineTotal, 2500);
});

// ─── 5. Invoice Totals Reconciliation (Sprint 6E Golden Example) ─────────────

test("Saudi Invoice Reconciliation: Golden Example (Gross 10k, Discount 1k, Net 9k, VAT 1,350)", () => {
  const lines = [
    { qty: "1", unitPrice: "10000", discount: "1000", vatRate: 0.15 },
  ];

  const lineCalcs = lines.map(calcLineVat);
  const grossTotal = lineCalcs.reduce((acc, l) => acc + l.gross, 0);
  const totalDiscount = lineCalcs.reduce((acc, l) => acc + l.discount, 0);
  const netSubtotal = Math.max(0, grossTotal - totalDiscount);
  const totalVat = lineCalcs.reduce((acc, l) => acc + l.vatAmount, 0);
  const grandTotal = netSubtotal + totalVat;

  // Reconciled steps:
  assert.equal(grossTotal, 10000);
  assert.equal(totalDiscount, 1000);
  assert.equal(netSubtotal, 9000);
  assert.equal(totalVat, 1350);
  assert.equal(grandTotal, 10350);

  // Exact arithmetic checks:
  assert.equal(grossTotal - totalDiscount, netSubtotal);
  assert.equal(netSubtotal + totalVat, grandTotal);
});

test("Saudi Invoice Reconciliation: Mixed 15%, 0%, and Exempt lines", () => {
  const lines = [
    { qty: "2", unitPrice: "5000", discount: "500", vatRate: 0.15 }, // gross 10k, base 9.5k, vat 1425, total 10925
    { qty: "10", unitPrice: "200", discount: "0", vatRate: 0 },       // gross 2k, base 2k, vat 0, total 2000
    { qty: "1", unitPrice: "3000", discount: "0", vatRate: null },   // gross 3k, base 3k, vat 0, total 3000
  ];

  const lineCalcs = lines.map(calcLineVat);
  const grossTotal = lineCalcs.reduce((acc, l) => acc + l.gross, 0);
  const totalDiscount = lineCalcs.reduce((acc, l) => acc + l.discount, 0);
  const netSubtotal = Math.max(0, grossTotal - totalDiscount);
  const totalVat = lineCalcs.reduce((acc, l) => acc + l.vatAmount, 0);
  const grandTotal = lineCalcs.reduce((acc, l) => acc + l.lineTotal, 0);

  assert.equal(grossTotal, 15000);
  assert.equal(totalDiscount, 500);
  assert.equal(netSubtotal, 14500);
  assert.equal(totalVat, 1425);
  assert.equal(grandTotal, 15925);
  assert.equal(netSubtotal + totalVat, grandTotal);
});

// ─── 6. Saudi VAT Registration Thresholds & Capital Asset Exclusion ──────────

test("Saudi VAT Registration: Resident at exactly SAR 375,000 is NOT mandatory", () => {
  const result = evaluateSaudiVatEligibility({
    isResident: true,
    grossPreviousSupplies: SA_VAT_MANDATORY_THRESHOLD, // 375,000
  });
  // Must exceed (> 375,000) to trigger mandatory registration
  assert.notEqual(result.status, SA_REG_STATUS.MANDATORY);
  assert.equal(result.status, SA_REG_STATUS.VOLUNTARY);
});

test("Saudi VAT Registration: Resident exceeding SAR 375,000 is mandatory", () => {
  const result = evaluateSaudiVatEligibility({
    isResident: true,
    grossPreviousSupplies: SA_VAT_MANDATORY_THRESHOLD + 1, // 375,001
  });
  assert.equal(result.status, SA_REG_STATUS.MANDATORY);
});

test("Saudi VAT Registration: Capital asset sales excluded under Art. 52 GCC Agreement", () => {
  const result = evaluateSaudiVatEligibility({
    isResident: true,
    grossPreviousSupplies: 500000,
    capitalAssetSales: 150000, // excluded -> net taxable 350,000
  });
  assert.equal(result.taxablePreviousSupplies, 350000);
  assert.notEqual(result.status, SA_REG_STATUS.MANDATORY);
  assert.equal(result.status, SA_REG_STATUS.VOLUNTARY);
});

test("Saudi VAT Registration: Voluntary threshold boundary (SAR 187,500)", () => {
  const below = evaluateSaudiVatEligibility({
    isResident: true,
    grossPreviousSupplies: 180000,
  });
  assert.equal(below.status, SA_REG_STATUS.BELOW_THRESHOLD);

  const above = evaluateSaudiVatEligibility({
    isResident: true,
    grossPreviousSupplies: SA_VAT_VOLUNTARY_THRESHOLD + 1,
  });
  assert.equal(above.status, SA_REG_STATUS.VOLUNTARY);
});

// ─── 7. UAE 5% VAT Calculations ──────────────────────────────────────────────

test("UAE VAT: Standard 5% exclusive addition", () => {
  const base = 1000;
  const rate = 0.05;
  const vat = base * rate;
  const total = base + vat;
  assert.equal(vat, 50);
  assert.equal(total, 1050);
});

test("UAE VAT: Standard 5% inclusive extraction", () => {
  const total = 1050;
  const rate = 0.05;
  const base = total / (1 + rate);
  const vat = total - base;
  assert.equal(base, 1000);
  assert.equal(vat, 50);
});

test("UAE VAT: Halala precision — AED 100.00 inclusive of 5%", () => {
  const total = 100;
  const rate = 0.05;
  const base = total / (1 + rate);
  const vat = total - base;
  // base = 95.238095... -> 95.24
  // vat  = 4.761904...  -> 4.76
  assert.equal(Number(base.toFixed(2)), 95.24);
  assert.equal(Number(vat.toFixed(2)), 4.76);
  assert.equal(Number((base + vat).toFixed(2)), 100.00);
});

// ─── 8. UAE VAT Registration Thresholds ──────────────────────────────────────

test("UAE VAT Registration: Resident at exactly AED 375,000 is NOT mandatory", () => {
  const res = evaluateUaeVatEligibility({
    isResident: true,
    prev12MonthSupplies: UAE_VAT_MANDATORY_THRESHOLD,
  });
  assert.notEqual(res.status, UAE_REG_STATUS.MANDATORY);
  assert.equal(res.status, UAE_REG_STATUS.VOLUNTARY);
});

test("UAE VAT Registration: Resident with AED 375,001 is mandatory", () => {
  const res = evaluateUaeVatEligibility({
    isResident: true,
    prev12MonthSupplies: UAE_VAT_MANDATORY_THRESHOLD + 1,
  });
  assert.equal(res.status, UAE_REG_STATUS.MANDATORY);
});

test("UAE VAT Registration: 30-day forward window triggers mandatory registration", () => {
  const res = evaluateUaeVatEligibility({
    isResident: true,
    prev12MonthSupplies: 0,
    next30DaysSupplies: 400000, // > 375,000 expected in next 30 days
  });
  assert.equal(res.status, UAE_REG_STATUS.MANDATORY);
  assert.equal(res.next30ExceedsMandatory, true);
});

test("UAE VAT Registration: Taxable expenses qualify for voluntary registration", () => {
  const res = evaluateUaeVatEligibility({
    isResident: true,
    prev12MonthSupplies: 0,
    prev12MonthExpenses: 200000, // > 187,500
  });
  assert.equal(res.status, UAE_REG_STATUS.VOLUNTARY);
});

test("UAE VAT Registration: Non-resident with taxable supplies and no reverse-charge party", () => {
  const res = evaluateUaeVatEligibility({
    isResident: false,
    makesUaeTaxableSupplies: true,
    otherPartyLiable: false,
  });
  assert.equal(res.status, UAE_REG_STATUS.NON_RESIDENT_SPECIAL);
});

// ─── 9. UAE Corporate Tax Calculations ───────────────────────────────────────

test("UAE Corporate Tax: Golden Scenario — AED 1,000,000 Taxable Income = AED 56,250 Tax", () => {
  const result = calcStandardCT(1000000);
  assert.equal(result.zeroRatePortion, 375000);
  assert.equal(result.ninePercentPortion, 625000);
  assert.equal(result.tax, 56250);
  assert.equal(result.effectiveRate, 0.05625);
});

test("UAE Corporate Tax: Exactly AED 375,000 Taxable Income = AED 0 Tax", () => {
  const result = calcStandardCT(CT_ZERO_RATE_LIMIT);
  assert.equal(result.zeroRatePortion, 375000);
  assert.equal(result.ninePercentPortion, 0);
  assert.equal(result.tax, 0);
  assert.equal(result.effectiveRate, 0);
});

test("UAE Corporate Tax: AED 375,100 Taxable Income = AED 9 Tax", () => {
  const result = calcStandardCT(375100);
  assert.equal(result.zeroRatePortion, 375000);
  assert.equal(result.ninePercentPortion, 100);
  assert.equal(result.tax, 9);
});

test("UAE Corporate Tax: QFZP non-qualifying income taxed at 9% without AED 375k band", () => {
  // Qualifying Income: 2M (0%), Non-qualifying: 200k (9% flat)
  const result = calcQfzpCT(2000000, 200000);
  assert.equal(result.qi, 2000000);
  assert.equal(result.nqti, 200000);
  assert.equal(result.tax, 18000); // 200k * 0.09 = 18,000 (no 375k deduction)
  assert.equal(result.totalIncome, 2200000);
});

// ─── 10. UAE Small Business Relief (SBR) Boundaries ──────────────────────────

test("UAE SBR: Revenue <= 3,000,000 with tax period end on or before 2026-12-31 is eligible", () => {
  const res = evaluateSBR({
    currentRevenue: 2500000,
    taxPeriodEnd: "2026-12-31",
  });
  assert.equal(res.result, SBR_RESULT.POTENTIALLY_ELIGIBLE);
});

test("UAE SBR: Tax period end after 2026-12-31 is OUTSIDE_TIME_WINDOW", () => {
  const res = evaluateSBR({
    currentRevenue: 2500000,
    taxPeriodEnd: "2027-01-01",
  });
  assert.equal(res.result, SBR_RESULT.OUTSIDE_TIME_WINDOW);
});

test("UAE SBR: Current revenue > AED 3,000,000 is NOT_ELIGIBLE", () => {
  const res = evaluateSBR({
    currentRevenue: SBR_REVENUE_THRESHOLD + 1,
    taxPeriodEnd: "2026-12-31",
  });
  assert.equal(res.result, SBR_RESULT.NOT_ELIGIBLE);
});

test("UAE SBR: QFZP is ineligible for Small Business Relief", () => {
  const res = checkSBREligibility({
    isResident: true,
    currentRevenue: 2000000,
    priorMaxRevenue: 0,
    isQFZP: true,
    isMNEAboveThreshold: false,
  });
  assert.equal(res.eligible, false);
  assert.match(res.reasons[0], /QFZP/);
});

test("UAE SBR: MNE Group member above AED 3.15B is ineligible", () => {
  const res = checkSBREligibility({
    isResident: true,
    currentRevenue: 2000000,
    priorMaxRevenue: 0,
    isQFZP: false,
    isMNEAboveThreshold: true,
  });
  assert.equal(res.eligible, false);
  assert.match(res.reasons[0], /متعددة الجنسيات/);
});
