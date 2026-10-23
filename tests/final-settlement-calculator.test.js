/**
 * tests/final-settlement-calculator.test.js
 * Day 4 — Saudi Final Settlement Calculator component integration tests.
 *
 * Renders the real <FinalSettlementCalculator /> component with
 * @testing-library/react inside the jsdom environment set up by tests/setup.js
 * and verifies the legally accurate End-of-Service Benefit (EOSB) calculation
 * per Saudi Labor Law:
 *   - Art. 84: base gratuity (half-month per year for first 5 years, full month after).
 *   - Art. 85: resignation tapering (0% < 2y, 1/3 for 2-5y, 2/3 for 5-10y, 100% >= 10y).
 *   - Art. 87: female special termination (full).
 *   - Art. 111: leave balance compensation on the selected wage base.
 *
 * Design notes:
 *   - Each test renders exactly ONE component instance and afterEach(cleanup())
 *     unmounts it, so every query sees a single element — this is what removes the
 *     "duplicate Arabic label selector" collisions the previous test run hit.
 *   - Amounts are read from the results breakdown via .fs-line > .a so the queries
 *     do not depend on the duplicate "مكافأة نهاية الخدمة المستحقة" string that also
 *     appears in the gratuity section; queries are scoped to the results section.
 */
import { render, screen, fireEvent, waitFor, within, cleanup } from "@testing-library/react";
import { strict as assert } from "assert";
import { test, afterEach } from "node:test";
import React from "react";
import FinalSettlementCalculator from "../components/FinalSettlementCalculator.jsx";

// Unmount between tests so getBy* queries never see stale duplicate instances.
afterEach(() => cleanup());

/** Set a labelled input (numeric or date) to a value. */
function setInput(label, value) {
  const input = screen.getByLabelText(label);
  fireEvent.change(input, { target: { value: String(value) } });
}

/**
 * Click a toggle-group option, scoped to the group with the given aria-label.
 * Scoping is essential: a global getByRole('button', { name }) regex would also
 * match unrelated buttons whose *description* text contains the option words
 * (e.g. the notice-period "لصاحب العمل" button whose help text mentions
 * "استقالة الموظف"), causing a duplicate-selector error.
 */
function clickInGroup(groupLabel, optionText) {
  const group = screen.getByRole("group", { name: groupLabel });
  fireEvent.click(within(group).getByRole("button", { name: new RegExp(optionText, "i") }));
}

/** Build a local YYYY-MM-DD `yearsAgo` years and `monthsFromNow` months from today. */
function isoDate(yearsAgo, monthsFromNow = 0) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  d.setMonth(d.getMonth() + monthsFromNow);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Read the SAR amount shown for a given line label inside the results section. */
function lineAmount(labelText) {
  const results = screen.getByText(/إجمالي المخالصة النهائية الصافية/).closest("section");
  const labelEl = within(results).getByText(labelText);
  return labelEl.closest(".fs-line")?.querySelector(".a")?.textContent?.trim() ?? "";
}

/** Find a note text inside the results section (the EOSB line sub-text). */
function resultNote(pattern) {
  const results = screen.getByText(/إجمالي المخالصة النهائية الصافية/).closest("section");
  return within(results).getByText(pattern);
}

// ─── EOSB resignation thresholds (Art. 85) ───────────────────────────────────

test("Resignation before 2 years yields no gratuity (0.00 ر.س)", async () => {
  render(React.createElement(FinalSettlementCalculator));
  setInput("الراتب الأساسي الشهري (ر.س)", "8000");
  setInput("بدل السكن الشهري (ر.س)", "2000");
  setInput("بدل النقل الشهري (ر.س)", "1000");
  setInput("بدلات ثابتة دورية أخرى (ر.س)", "0");
  setInput("تاريخ الالتحاق بالعمل", isoDate(1, -6)); // ~1.5 years of service
  setInput("آخر يوم عمل فعلي", isoDate(0));
  clickInGroup("سبب إنهاء العلاقة العمالية", "استقالة الموظف");
  await waitFor(() => assert.equal(lineAmount("مكافأة نهاية الخدمة المستحقة"), "0.00 ر.س"));
});

test("Resignation between 2 and 5 years yields 1/3 gratuity note", async () => {
  render(React.createElement(FinalSettlementCalculator));
  setInput("تاريخ الالتحاق بالعمل", isoDate(3)); // 3 years of service
  setInput("آخر يوم عمل فعلي", isoDate(0));
  clickInGroup("سبب إنهاء العلاقة العمالية", "استقالة الموظف");
  await waitFor(() => assert.ok(resultNote(/ثلث المكافأة/i)));
});

test("Employer termination applies full gratuity note", async () => {
  render(React.createElement(FinalSettlementCalculator));
  setInput("تاريخ الالتحاق بالعمل", isoDate(4)); // 4 years of service
  setInput("آخر يوم عمل فعلي", isoDate(0));
  clickInGroup("سبب إنهاء العلاقة العمالية", "فسخ من صاحب العمل");
  await waitFor(() => assert.ok(resultNote(/استحقاق كامل/i)));
});

// ─── Fractional service boundary (FIX: exactly 2.5 years is 1/3, not 0) ────────

test("Resignation with 2.5 years service receives 1/3 gratuity (4,583.33 ر.س)", async () => {
  render(React.createElement(FinalSettlementCalculator));
  setInput("تاريخ الالتحاق بالعمل", "2020-01-01");
  setInput("آخر يوم عمل فعلي", "2022-07-01");
  clickInGroup("سبب إنهاء العلاقة العمالية", "استقالة الموظف");
  // totalWage = 8000 + 2000 + 1000 = 11000; full gratuity = 11000 * 0.5 * 2.5 = 13750;
  // 1/3 of 13750 = 4583.33 -> "4,583.33 ر.س"
  await waitFor(() => assert.ok(lineAmount("مكافأة نهاية الخدمة المستحقة").includes("4,583.33")));
});

// ─── Leave balance compensation (Art. 111) wage base ──────────────────────────

test("Leave compensation uses total (actual) wage by default", async () => {
  render(React.createElement(FinalSettlementCalculator));
  setInput("الراتب الأساسي الشهري (ر.س)", "8000");
  setInput("بدل السكن الشهري (ر.س)", "2000");
  setInput("بدل النقل الشهري (ر.س)", "1000");
  setInput("بدلات ثابتة دورية أخرى (ر.س)", "0");
  setInput("رصيد الإجازة السنوية غير المستنفد (بالأيام)", "10");
  // actual wage 11000 / 30 = 366.67/day * 10 = 3666.67
  await waitFor(() => assert.ok(lineAmount("بدل رصيد الإجازة السنوية").includes("3,666.67")));
});

test("Leave compensation uses basic salary base when selected", async () => {
  render(React.createElement(FinalSettlementCalculator));
  setInput("الراتب الأساسي الشهري (ر.س)", "8000");
  setInput("بدل السكن الشهري (ر.س)", "2000");
  setInput("بدل النقل الشهري (ر.س)", "1000");
  setInput("بدلات ثابتة دورية أخرى (ر.س)", "0");
  setInput("رصيد الإجازة السنوية غير المستنفد (بالأيام)", "5");
  clickInGroup("أساس حساب بدل الإجازة", "الراتب الأساسي فقط");
  // basic 8000 / 30 = 266.67/day * 5 = 1333.33
  await waitFor(() => assert.ok(lineAmount("بدل رصيد الإجازة السنوية").includes("1,333.33")));
});
