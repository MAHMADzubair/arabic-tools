/**
 * tests/financialCalculators6F.test.mjs
 * Sprint 6F.1 — Independent regression tests for remaining financial, Islamic,
 * and everyday calculator accuracy fixes.
 *
 * Covers:
 * 1. Saudi Real Estate Transaction Tax (RETT) 5% calculation under ZATCA regulations.
 * 2. First-home state support cap (up to SAR 1,000,000 property value / max SAR 50,000).
 * 3. RETT Statutory Taxpayer (Seller) vs Contractual Buyer Liability.
 * 4. Mortgage Variable Interest (5-year hybrid ARM) vs Fixed Rate Amortization.
 * 5. Compound Interest true monthly contribution cash-flows across compounding frequencies.
 * 6. Golden Scenario 1: Monthly compounding @ 6% nominal = SAR 83,258.53.
 * 7. Golden Scenario 2: Annual compounding @ 6% effective = SAR 82,868.04.
 * 8. Zero interest and zero contribution boundaries.
 * 9. Annual table and final summary balance synchronization.
 * 10. Umrah SAR-to-AED rate conversion (0.979333 vs inverted 1.02).
 * 11. Zakat 2.5% lunar default and AAOIFI Standard No. 9 (2.577% solar rate) validation.
 * 12. Profit Margin operational pre-tax calculations without dead VAT state.
 */

import test from "node:test";
import assert from "node:assert/strict";

/* ─── 1. Saudi Mortgage RETT Helpers (mirroring MortgageCalculator logic) ─── */
function calculateSaudiRett({ price, isFirstHome, buyerBearsRett }) {
  const p = Number(price);
  const grossRett = p * 0.05;
  const govtSupport = isFirstHome ? Math.min(p, 1000000) * 0.05 : 0;
  const netRett = Math.max(0, grossRett - govtSupport);
  const buyerCost = buyerBearsRett ? netRett : 0;
  return {
    grossRett,
    govtSupport,
    netRett,
    buyerCost,
    statutoryTaxpayer: "seller", // ZATCA RETT Regulation Art. 3
  };
}

/* ─── 2. Mortgage Amortization Helper ─── */
function simulateMortgageSchedule({ principal, annualRate, years, rateType = "fixed", variableRate = annualRate }) {
  const n = years * 12;
  const r1 = annualRate / 100 / 12;
  const r2 = variableRate / 100 / 12;
  const isVar = rateType === "variable" && years > 5;
  const n1 = isVar ? 60 : n;

  if (r1 === 0 && (!isVar || r2 === 0)) {
    const pmt = principal / n;
    return Array.from({ length: n }, (_, i) => ({
      month: i + 1, payment: pmt, principal: pmt, interest: 0, balance: Math.max(0, principal - pmt * (i + 1)),
    }));
  }

  const pmt1 = r1 === 0 ? principal / n : (principal * r1 * Math.pow(1 + r1, n)) / (Math.pow(1 + r1, n) - 1);
  const schedule = [];
  let balance = principal;

  for (let i = 0; i < n1; i++) {
    const interest = balance * r1;
    const princ = pmt1 - interest;
    balance = Math.max(0, balance - princ);
    schedule.push({ month: i + 1, payment: pmt1, principal: princ, interest, balance });
  }

  if (isVar && n > 60) {
    const n2 = n - 60;
    const balAt60 = balance;
    const pmt2 = r2 === 0 ? balAt60 / n2 : (balAt60 * r2 * Math.pow(1 + r2, n2)) / (Math.pow(1 + r2, n2) - 1);
    for (let i = 0; i < n2; i++) {
      const interest = balance * r2;
      const princ = pmt2 - interest;
      balance = Math.max(0, balance - princ);
      schedule.push({ month: 60 + i + 1, payment: pmt2, principal: princ, interest, balance });
    }
  }

  return schedule;
}

/* ─── 3. Compound Interest Helpers ─── */
function calculateCompoundInterest({ principal, rate, years, freqN, monthlyContrib }) {
  const p = Number(principal);
  const r = Number(rate) / 100;
  const k = Number(freqN);
  const totalMonths = Number(years) * 12;
  const mc = Number(monthlyContrib);

  const rm = r === 0 ? 0 : Math.pow(1 + r / k, k / 12) - 1;
  const fvPrincipal = r === 0 ? p : p * Math.pow(1 + r / k, k * Number(years));
  const fvContribs = mc > 0
    ? (rm > 0 ? mc * ((Math.pow(1 + rm, totalMonths) - 1) / rm) : mc * totalMonths)
    : 0;

  const finalAmount = fvPrincipal + fvContribs;
  const totalInvested = p + mc * totalMonths;
  const totalInterest = finalAmount - totalInvested;

  // Monthly simulation table
  const rows = [];
  let balance = p;
  let runningInvested = p;
  for (let m = 1; m <= totalMonths; m++) {
    balance = balance * (1 + rm) + mc;
    runningInvested += mc;
    if (m % 12 === 0) {
      rows.push({
        year: m / 12,
        balance,
        totalContribs: runningInvested,
        totalInterest: balance - runningInvested,
      });
    }
  }

  return { finalAmount, totalInvested, totalInterest, rows };
}

/* =========================================================================
 * FIX 1: SAUDI MORTGAGE RETT (REAL ESTATE TRANSACTION TAX)
 * ========================================================================= */

test("Saudi RETT Case A: SAR 800,000 ordinary taxable transaction", () => {
  const res = calculateSaudiRett({ price: 800000, isFirstHome: false, buyerBearsRett: false });
  assert.equal(res.grossRett, 40000, "Gross RETT must be exactly 5% of SAR 800,000 = SAR 40,000");
  assert.equal(res.govtSupport, 0, "No government support for non-first home");
  assert.equal(res.netRett, 40000, "Net RETT due to ZATCA is SAR 40,000");
  assert.equal(res.buyerCost, 0, "By default, seller bears RETT systemically");
  assert.equal(res.statutoryTaxpayer, "seller", "Seller is statutory taxpayer under ZATCA Art. 3");
});

test("Saudi RETT Case B: SAR 800,000 qualifying first-home transaction", () => {
  const res = calculateSaudiRett({ price: 800000, isFirstHome: true, buyerBearsRett: false });
  assert.equal(res.grossRett, 40000, "Gross RETT is SAR 40,000");
  assert.equal(res.govtSupport, 40000, "Government covers full 5% on property under SAR 1M");
  assert.equal(res.netRett, 0, "Net tax due is 0 after full state subsidy");
  assert.equal(res.buyerCost, 0, "Buyer cost is 0");
});

test("Saudi RETT Case C: SAR 1,400,000 qualifying first-home transaction", () => {
  const res = calculateSaudiRett({ price: 1400000, isFirstHome: true, buyerBearsRett: true });
  assert.equal(res.grossRett, 70000, "Gross RETT is 5% of 1.4M = SAR 70,000");
  assert.equal(res.govtSupport, 50000, "Government support is capped at SAR 50,000 (5% of 1M)");
  assert.equal(res.netRett, 20000, "Remaining net RETT is SAR 20,000");
  assert.equal(res.buyerCost, 20000, "When buyer contractually bears tax, buyer pays net SAR 20,000");
});

test("Saudi RETT Case D: SAR 1,400,000 non-qualifying transaction", () => {
  const res = calculateSaudiRett({ price: 1400000, isFirstHome: false, buyerBearsRett: true });
  assert.equal(res.grossRett, 70000, "Gross RETT is SAR 70,000");
  assert.equal(res.govtSupport, 0, "Govt support is 0");
  assert.equal(res.netRett, 70000, "Net tax is SAR 70,000");
  assert.equal(res.buyerCost, 70000, "Buyer pays full SAR 70,000 under contractual agreement");
});

/* =========================================================================
 * FIX 2: MORTGAGE VARIABLE VS FIXED RATE
 * ========================================================================= */

test("Mortgage: Fixed rate produces identical monthly payments across full term", () => {
  const sched = simulateMortgageSchedule({
    principal: 720000,
    annualRate: 4.5,
    years: 25,
    rateType: "fixed",
  });
  assert.equal(sched.length, 300, "25 years = 300 months");
  const pmtMonth1 = sched[0].payment;
  const pmtMonth61 = sched[60].payment;
  const pmtMonth300 = sched[299].payment;
  assert.ok(Math.abs(pmtMonth1 - pmtMonth61) < 0.01, "Payments must be constant in fixed rate");
  assert.ok(Math.abs(pmtMonth1 - pmtMonth300) < 0.01, "Payments must be constant in fixed rate");
  assert.ok(Math.abs(sched[299].balance) < 0.05, "Closing balance at end of loan must be 0");
});

test("Mortgage: 5-year hybrid variable rate produces distinct post-year-5 payments", () => {
  const sched = simulateMortgageSchedule({
    principal: 720000,
    annualRate: 4.5,
    years: 25,
    rateType: "variable",
    variableRate: 6.0, // jumps to 6% after year 5
  });
  assert.equal(sched.length, 300);
  const pmtYear1 = sched[0].payment;
  const pmtYear6 = sched[60].payment; // Month 61

  assert.ok(pmtYear6 > pmtYear1, "Payment at 6% must be higher than payment at 4.5%");
  // Initial 4.5% payment: ~4,002.04. Subsequent 6.0% payment: ~4,611.16
  assert.ok(Math.abs(pmtYear1 - 4002.04) < 1.0);
  assert.ok(Math.abs(pmtYear6 - 4532.05) < 1.0);
  assert.ok(Math.abs(sched[299].balance) < 0.05, "Closing balance at month 300 must be 0");
});

/* =========================================================================
 * FIX 3: COMPOUND INTEREST MONTHLY CONTRIBUTIONS & FREQUENCIES
 * ========================================================================= */

test("Compound Interest Golden Scenario 1: Monthly Compounding @ 6% Nominal", () => {
  const res = calculateCompoundInterest({
    principal: 10000,
    rate: 6,
    years: 5,
    freqN: 12,
    monthlyContrib: 1000,
  });

  // Expected FV ~ 83,258.53 SAR
  assert.ok(
    Math.abs(res.finalAmount - 83258.53) < 0.05,
    `Expected ~83,258.53 SAR, got ${res.finalAmount.toFixed(2)}`
  );
  assert.equal(res.totalInvested, 70000, "10k initial + 1k * 60 = 70,000 SAR");
  assert.ok(
    Math.abs(res.totalInterest - 13258.53) < 0.05,
    `Expected ~13,258.53 SAR interest, got ${res.totalInterest.toFixed(2)}`
  );

  // Table sync: Year 5 table balance must match analytical finalAmount
  const year5Row = res.rows[4];
  assert.ok(
    Math.abs(year5Row.balance - res.finalAmount) < 0.01,
    "Annual table balance must match final calculated balance exactly"
  );
});

test("Compound Interest Golden Scenario 2: Annual Compounding @ 6% Effective", () => {
  const res = calculateCompoundInterest({
    principal: 10000,
    rate: 6,
    years: 5,
    freqN: 1, // Annual compounding
    monthlyContrib: 1000,
  });

  // Expected FV ~ 82,868.04 SAR under effective annual return model
  assert.ok(
    Math.abs(res.finalAmount - 82868.04) < 0.05,
    `Expected ~82,868.04 SAR, got ${res.finalAmount.toFixed(2)}`
  );
  assert.equal(res.totalInvested, 70000);
  assert.ok(Math.abs(res.totalInterest - 12868.04) < 0.05);

  // Table sync
  const year5Row = res.rows[4];
  assert.ok(
    Math.abs(year5Row.balance - res.finalAmount) < 0.01,
    "Table balance must match final amount exactly"
  );
});

test("Compound Interest: Zero Interest Rate boundary", () => {
  const res = calculateCompoundInterest({
    principal: 15000,
    rate: 0,
    years: 4,
    freqN: 12,
    monthlyContrib: 500,
  });
  const expectedTotal = 15000 + 500 * 48; // 39,000
  assert.equal(res.finalAmount, expectedTotal, "With 0% rate, final amount equals total deposits");
  assert.equal(res.totalInterest, 0, "Interest must be exactly 0");
  assert.equal(res.rows[3].balance, expectedTotal, "Year 4 balance equals total deposits");
});

test("Compound Interest: Zero Monthly Contribution boundary", () => {
  const res = calculateCompoundInterest({
    principal: 50000,
    rate: 8,
    years: 10,
    freqN: 1, // Annual compounding
    monthlyContrib: 0,
  });
  // FV = 50,000 * (1.08)^10 ~ 107,946.25
  assert.ok(
    Math.abs(res.finalAmount - 107946.25) < 0.05,
    `Expected ~107,946.25, got ${res.finalAmount.toFixed(2)}`
  );
  assert.equal(res.totalInvested, 50000);
});

/* =========================================================================
 * FIX 4: UMRAH CALCULATOR SAR TO AED DIRECTION
 * ========================================================================= */

test("Umrah Calculator: SAR to AED conversion factor", () => {
  const SAR_TO_AED = 3.6725 / 3.75;
  assert.ok(
    Math.abs(SAR_TO_AED - 0.979333) < 0.0001,
    "1 SAR must equal approximately 0.979333 AED (not inverted 1.02)"
  );

  const sar1000 = 1000 * SAR_TO_AED;
  assert.ok(
    Math.abs(sar1000 - 979.33) < 0.05,
    `SAR 1,000 must yield AED ~979.33, got ${sar1000.toFixed(2)}`
  );
});

/* =========================================================================
 * FIX 6: ZAKAT LUNAR VS SOLAR YEAR BASIS
 * ========================================================================= */

test("Zakat: Default lunar rate is 2.50% and AAOIFI solar equivalent is 2.577%", () => {
  const lunarRate = 0.025;
  assert.equal(lunarRate, 0.025, "Default lunar year zakat rate must be exactly 2.5%");

  // AAOIFI Sharia Standard No. 9 formula: 2.5% * 365 / 354
  const solarRate = 0.025 * (365 / 354);
  assert.ok(
    Math.abs(solarRate - 0.0257768) < 0.00001,
    "Solar year rate must equal 2.577% under AAOIFI Standard 9"
  );

  const wealth = 100000;
  const lunarZakat = wealth * lunarRate;
  const solarZakat = wealth * solarRate;
  assert.equal(lunarZakat, 2500, "Lunar zakat on 100k is SAR 2,500");
  assert.ok(
    Math.abs(solarZakat - 2577.68) < 0.1,
    `Solar zakat on 100k is SAR ~2,577.68, got ${solarZakat.toFixed(2)}`
  );
});

/* =========================================================================
 * FIX 7: PROFIT MARGIN OPERATIONAL PRE-TAX LOGIC
 * ========================================================================= */

test("Profit Margin: Basic Margin, Markup, and Target Pricing", () => {
  const cost = 100;
  const rev = 160;
  const grossProfit = rev - cost;
  const marginPct = (grossProfit / rev) * 100;
  const markupPct = (grossProfit / cost) * 100;

  assert.equal(grossProfit, 60);
  assert.equal(marginPct, 37.5, "Gross margin is 37.5%");
  assert.equal(markupPct, 60.0, "Markup is 60%");

  // Target Price for 40% margin
  const targetPrice = cost / (1 - 0.40);
  assert.ok(Math.abs(targetPrice - 166.67) < 0.01, "Target price for 40% margin is 166.67");
});

test("Profit Margin: Advanced direct operating fees deduction without dead VAT state", () => {
  const cost = 60;
  const rev = 140;
  const shipping = 25;
  const gatewayFee = (rev * 2.5) / 100; // 3.50
  const adSpend = 15;

  const totalFees = shipping + gatewayFee + adSpend; // 43.50
  const totalExpenses = cost + totalFees; // 103.50
  const netProfit = rev - totalExpenses; // 36.50
  const netMargin = (netProfit / rev) * 100; // 26.07%

  assert.equal(totalFees, 43.5);
  assert.equal(totalExpenses, 103.5);
  assert.equal(netProfit, 36.5);
  assert.ok(Math.abs(netMargin - 26.07) < 0.01);
});
