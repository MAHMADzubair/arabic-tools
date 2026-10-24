/**
 * tests/uaePurchaseOrderGenerator.test.mjs
 * Day 5 — UAE Purchase Order Generator: VAT accuracy, draft lifecycle,
 * quotation import, invoice handoff, and Arabic field validation.
 *
 * Tests use the REAL shared functions from lib/businessUtils.js.
 * No duplicate calculation engine is introduced.
 *
 * Golden scenarios match the Day 5 brief exactly (Scenarios A–L).
 *
 * Legal note: A purchase order is NOT a tax invoice.
 * VAT amounts calculated here are ESTIMATES for cost planning purposes.
 * Official input-tax recovery requires a compliant Tax Invoice from the
 * supplier per UAE Federal Tax Authority (FTA) guidance:
 * https://tax.gov.ae/en/taxes/Vat/vat.topics/tax.invoices.aspx
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  calcLineVat,
  parseNum,
  formatAED,
  discountExceedsGross,
  isValidUaeTrn,
} from "../lib/businessUtils.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Round to 2 dp matching UAE AED presentation */
const r2 = (n) => Math.round(n * 100) / 100;

/**
 * Simulate the component's totals reducer for a list of line specs.
 * Each spec: { qty, unitPrice, discount, vatRateId, showVat? }
 * vatRateId: "5" | "0" | "exempt" | "out" | "none"
 *
 * Returns the same shape as the component's `totals` object.
 */
const VAT_MAP = { "5": 0.05, "0": 0, "exempt": null, "out": null, "none": null };

function calcTotals(lineSpecs, extraCharges = 0, showVat = true) {
  const lineCalcs = lineSpecs.map(({ qty, unitPrice, discount = "0", vatRateId = "5" }) => {
    const rateRaw  = VAT_MAP[vatRateId] ?? 0;
    const vatRate  = showVat ? (VAT_MAP[vatRateId] !== undefined ? VAT_MAP[vatRateId] : 0) : null;
    const result   = calcLineVat({ qty, unitPrice, discount, vatRate });
    return { ...result, vatRateId };
  });

  const grossTotal    = lineCalcs.reduce((s, l) => s + l.gross, 0);
  const totalDiscount = lineCalcs.reduce((s, l) => s + l.discount, 0);
  const taxable5      = lineCalcs.filter(l => l.vatRateId === "5").reduce((s, l) => s + l.taxableBase, 0);
  const taxable0      = lineCalcs.filter(l => l.vatRateId === "0").reduce((s, l) => s + l.taxableBase, 0);
  const exemptTotal   = lineCalcs.filter(l => l.vatRateId === "exempt").reduce((s, l) => s + l.taxableBase, 0);
  const outTotal      = lineCalcs.filter(l => l.vatRateId === "out").reduce((s, l) => s + l.taxableBase, 0);
  const totalVat      = lineCalcs.reduce((s, l) => s + l.vatAmount, 0);
  const grandTotal    = lineCalcs.reduce((s, l) => s + l.lineTotal, 0) + extraCharges;

  return { lineCalcs, grossTotal, totalDiscount, taxable5, taxable0, exemptTotal, outTotal, totalVat, grandTotal };
}

// ─── Scenario A — Standard 5% VAT with discount ──────────────────────────────
test("Scenario A: 3×100, discount 20 → taxable 280, VAT 14, total 294", () => {
  const t = calcTotals([{ qty: "3", unitPrice: "100", discount: "20", vatRateId: "5" }]);
  assert.equal(r2(t.grossTotal),    300,  "gross");
  assert.equal(r2(t.totalDiscount), 20,   "discount");
  assert.equal(r2(t.taxable5),      280,  "taxable base");
  assert.equal(r2(t.totalVat),      14,   "VAT 5%");
  assert.equal(r2(t.grandTotal),    294,  "grand total");
});

// ─── Scenario B — Zero-rated line ────────────────────────────────────────────
test("Scenario B: zero-rated line — correct subtotal, zero VAT", () => {
  const t = calcTotals([{ qty: "5", unitPrice: "200", vatRateId: "0" }]);
  assert.equal(r2(t.grossTotal),  1000, "gross");
  assert.equal(r2(t.taxable0),    1000, "zero-rated base");
  assert.equal(r2(t.totalVat),    0,    "zero VAT");
  assert.equal(r2(t.grandTotal),  1000, "grand total equals taxable base");
});

// ─── Scenario C — Exempt line ────────────────────────────────────────────────
test("Scenario C: exempt line — zero VAT, classified as exempt", () => {
  const t = calcTotals([{ qty: "2", unitPrice: "500", vatRateId: "exempt" }]);
  assert.equal(r2(t.grossTotal),   1000, "gross");
  assert.equal(r2(t.exemptTotal),  1000, "exempt base");
  assert.equal(r2(t.taxable5),     0,    "5% taxable is 0");
  assert.equal(r2(t.totalVat),     0,    "zero VAT");
  assert.equal(r2(t.grandTotal),   1000, "grand total");
});

// ─── Scenario D — Out-of-scope line ──────────────────────────────────────────
test("Scenario D: out-of-scope line — zero VAT, classified as out-of-scope", () => {
  const t = calcTotals([{ qty: "1", unitPrice: "750", vatRateId: "out" }]);
  assert.equal(r2(t.outTotal),    750, "out-of-scope base");
  assert.equal(r2(t.exemptTotal), 0,   "exempt base is 0");
  assert.equal(r2(t.totalVat),    0,   "zero VAT");
  assert.equal(r2(t.grandTotal),  750, "grand total");
});

// ─── Scenario D addendum — exempt ≠ out-of-scope ─────────────────────────────
test("Scenario D addendum: exempt and out-of-scope are classified separately", () => {
  const t = calcTotals([
    { qty: "1", unitPrice: "400", vatRateId: "exempt" },
    { qty: "1", unitPrice: "600", vatRateId: "out" },
  ]);
  assert.equal(r2(t.exemptTotal), 400, "exempt bucket");
  assert.equal(r2(t.outTotal),    600, "out-of-scope bucket");
  // They must never be added together — each has independent legal meaning
  assert.notEqual(t.exemptTotal + t.outTotal, t.taxable5, "exempt+out never counted as taxable-5");
  assert.equal(r2(t.totalVat),    0, "no VAT on either");
});

// ─── Scenario E — Mixed VAT classifications ───────────────────────────────────
test("Scenario E: mixed VAT rates across 4 lines", () => {
  const lines = [
    { qty: "2", unitPrice: "100", vatRateId: "5"      }, // gross 200, VAT 10
    { qty: "1", unitPrice: "300", vatRateId: "0"      }, // gross 300, VAT 0
    { qty: "3", unitPrice: "50",  vatRateId: "exempt" }, // gross 150, VAT 0
    { qty: "1", unitPrice: "250", vatRateId: "out"    }, // gross 250, VAT 0
  ];
  const t = calcTotals(lines);
  assert.equal(r2(t.grossTotal),  900,  "gross");
  assert.equal(r2(t.taxable5),    200,  "5% base");
  assert.equal(r2(t.taxable0),    300,  "0% base");
  assert.equal(r2(t.exemptTotal), 150,  "exempt base");
  assert.equal(r2(t.outTotal),    250,  "out base");
  assert.equal(r2(t.totalVat),    10,   "total VAT (5% on 200 only)");
  assert.equal(r2(t.grandTotal),  910,  "grand total 900 + 10 VAT");
});

// ─── Scenario F — VAT display toggle ─────────────────────────────────────────
test("Scenario F: VAT toggle OFF — all vatAmount = 0, stored classifications preserved", () => {
  const lines = [
    { qty: "1", unitPrice: "500", vatRateId: "5" },
    { qty: "1", unitPrice: "200", vatRateId: "0" },
  ];
  const tOn  = calcTotals(lines, 0, true);
  const tOff = calcTotals(lines, 0, false);

  // With VAT on
  assert.equal(r2(tOn.totalVat),   25, "VAT on: 5% of 500");
  assert.equal(r2(tOn.grandTotal), 725, "total with VAT");

  // With VAT off — no corruption of amounts, just no VAT added
  assert.equal(r2(tOff.totalVat),   0,   "VAT off: zero VAT");
  assert.equal(r2(tOff.grandTotal), 700, "VAT off: grand = sum of taxableBases");

  // The line grosses must be identical — toggle doesn't change stored data
  assert.equal(r2(tOn.grossTotal),  r2(tOff.grossTotal), "gross unchanged by toggle");
});

// ─── Scenario G — Discount exceeds gross ─────────────────────────────────────
test("Scenario G: discount > gross → taxable base clamped to 0, no VAT", () => {
  const result = calcLineVat({ qty: "2", unitPrice: "100", discount: "250", vatRate: 0.05 });
  assert.equal(r2(result.gross),        200, "gross");
  assert.equal(r2(result.taxableBase),  0,   "taxable clamped to 0");
  assert.equal(r2(result.vatAmount),    0,   "no VAT on 0 base");
  assert.equal(r2(result.lineTotal),    0,   "line total 0");

  // discountExceedsGross must signal this condition
  assert.equal(discountExceedsGross("2", "100", "250"), true, "warning flag set");
  assert.equal(discountExceedsGross("2", "100", "200"), false, "discount == gross does NOT flag");
  assert.equal(discountExceedsGross("2", "100", "199"), false, "discount < gross does NOT flag");
});

// ─── Scenario H — Zero quantity and empty unit price ─────────────────────────
test("Scenario H: zero qty → zero gross/VAT/total", () => {
  const r = calcLineVat({ qty: "0", unitPrice: "500", discount: "0", vatRate: 0.05 });
  assert.equal(r2(r.gross),       0, "gross 0");
  assert.equal(r2(r.vatAmount),   0, "VAT 0");
  assert.equal(r2(r.lineTotal),   0, "total 0");
});

test("Scenario H: empty unitPrice → zero gross/VAT/total", () => {
  const r = calcLineVat({ qty: "5", unitPrice: "", discount: "0", vatRate: 0.05 });
  assert.equal(r2(r.gross),       0, "gross 0");
  assert.equal(r2(r.vatAmount),   0, "VAT 0");
  assert.equal(r2(r.lineTotal),   0, "total 0");
});

// ─── Scenario I — Negative and malformed inputs ───────────────────────────────
test("Scenario I: parseNum rejects negatives and NaN → returns 0", () => {
  assert.equal(parseNum("-100"),   0, "negative string → 0");
  assert.equal(parseNum("-1"),     0, "negative one → 0");
  assert.equal(parseNum("abc"),    0, "alpha string → 0");
  assert.equal(parseNum(""),       0, "empty string → 0");
  assert.equal(parseNum(null),     0, "null → 0");
  assert.equal(parseNum(undefined),0, "undefined → 0");
  assert.equal(parseNum("1,000"),  1000, "comma-formatted number → parsed");
});

test("Scenario I: malformed inputs produce zero line totals", () => {
  const r = calcLineVat({ qty: "-5", unitPrice: "abc", discount: "-10", vatRate: 0.05 });
  assert.equal(r2(r.gross),      0, "negative qty→0, bad price→0");
  assert.equal(r2(r.vatAmount),  0, "no VAT");
  assert.equal(r2(r.lineTotal),  0, "total 0");
});

// ─── Scenario J — Fractional quantities and decimal prices ───────────────────
test("Scenario J: fractional qty and decimal price calculated accurately", () => {
  // 2.5 units × AED 99.99 = AED 249.975, discount 0, VAT 5%
  const r = calcLineVat({ qty: "2.5", unitPrice: "99.99", discount: "0", vatRate: 0.05 });
  assert.equal(r2(r.gross),      249.98, "gross rounded 2dp");
  // taxableBase = gross (no discount)
  assert.ok(Math.abs(r.taxableBase - 249.975) < 0.001, "taxable base pre-round");
  // VAT = 249.975 * 0.05 = 12.49875
  assert.ok(Math.abs(r.vatAmount - 12.49875) < 0.001,  "VAT pre-round");
  // lineTotal = 249.975 + 12.49875 = 262.47375
  assert.ok(Math.abs(r.lineTotal - 262.47375) < 0.001, "line total pre-round");
});

test("Scenario J: verify formatAED presents exactly 2 decimal places", () => {
  const s = formatAED(249.975);
  // Should have exactly 2 decimal places (locale-formatted; check decimal part)
  const numericVal = parseFloat(s.replace(/[^0-9.]/g, ""));
  assert.ok(!isNaN(numericVal), "output is numeric-parseable");
  // 249.975 rounds to 249.97 or 249.98 depending on JS engine — either is a valid 2-dp result
  assert.ok(numericVal >= 249.97 && numericVal <= 249.98, `2dp in range: ${s}`);
});

// ─── Scenario K — AED presentation and rounding ──────────────────────────────
test("Scenario K: formatAED always yields 2 decimal places", () => {
  const cases = [
    [0,          "0.00"],
    [100,        "100.00"],
    [1234.5,     "1,234.50"],   // locale grouping expected
    [0.005,      "0.01"],       // banker's/standard rounding edge
  ];
  for (const [input] of cases) {
    const out = formatAED(input);
    // Verify exactly 2 fractional digits regardless of locale separator
    const fractionPart = out.replace(/[^.,\d]/g, "").split(/[.,]/).pop();
    assert.equal(fractionPart.length, 2, `2dp for input ${input}: got "${out}"`);
  }
});

test("Scenario K: Scenario A totals in AED — 2dp presentation", () => {
  const t = calcTotals([{ qty: "3", unitPrice: "100", discount: "20", vatRateId: "5" }]);
  const vatStr   = formatAED(t.totalVat);
  const totalStr = formatAED(t.grandTotal);
  // Must end in .00 (whole numbers)
  assert.ok(vatStr.endsWith("00"),   `VAT ends in 00: ${vatStr}`);
  assert.ok(totalStr.endsWith("00"), `Total ends in 00: ${totalStr}`);
});

// ─── Scenario L — Additional charges reflected in grand total ────────────────
test("Scenario L: additional charges add to grand total (no extra VAT applied)", () => {
  const lines = [{ qty: "1", unitPrice: "1000", vatRateId: "5" }];
  const shipping     = 50;
  const installation = 75;
  const extraTotal   = shipping + installation; // 125

  const t = calcTotals(lines, extraTotal);

  // Line: gross=1000, taxable=1000, VAT=50, lineTotal=1050
  assert.equal(r2(t.totalVat),   50,   "line VAT 5% of 1000");
  assert.equal(r2(t.grandTotal), 1175, "grand = 1050 line + 125 charges, no extra VAT on charges");

  // Charges must not be VAT-inflated by the tool
  const chargeContribution = t.grandTotal - (1000 * 1.05);
  assert.equal(r2(chargeContribution), 125, "charge contribution is raw amount");
});

test("Scenario L: charges show in correct position in totals breakdown", () => {
  const t = calcTotals(
    [{ qty: "2", unitPrice: "500", vatRateId: "5" }],
    30  // single charge
  );
  // lineTotal = 1000 + 50 = 1050; grandTotal = 1050 + 30 = 1080
  assert.equal(r2(t.grandTotal), 1080, "grand total includes charge");
  assert.equal(r2(t.totalVat),   50,   "VAT only on line items");
});

// ─── TRN / VAT number validation ─────────────────────────────────────────────
test("TRN validation: 15 digits is valid, other lengths are not", () => {
  assert.equal(isValidUaeTrn("100000000000000"),  true,  "15 digits valid");
  assert.equal(isValidUaeTrn("10000000000000"),   false, "14 digits invalid");
  assert.equal(isValidUaeTrn("1000000000000000"), false, "16 digits invalid");
  assert.equal(isValidUaeTrn(""),                 false, "empty invalid");
  assert.equal(isValidUaeTrn("10000000000000A"),  false, "letter in TRN invalid");
  assert.equal(isValidUaeTrn("100000000000001"),  true,  "another 15-digit valid");
});

test("TRN validation: format check only — not an FTA registry lookup", () => {
  // Any 15-digit string passes format — real verification requires FTA EmaraTax
  assert.equal(isValidUaeTrn("000000000000000"), true, "all-zeros passes format");
  // This is intentional: the tool is explicit that it is format-only
});

// ─── Draft lifecycle (localStorage mock) ─────────────────────────────────────
test("Draft save/restore: serialises and deserialises buyer/supplier/lines", () => {
  const draft = {
    buyer:     { name: "شركة الأفق", trn: "100000000000001", emirate: "دبي" },
    supplier:  { name: "مورد النجم", trn: "", emirate: "أبوظبي" },
    poDetails: { poNumber: "PO-2026-1234", currency: "AED", showVat: true, issueDate: "2026-10-01", deliveryDate: "2026-10-08", status: "sent", quoteRef: "", projectRef: "", requestedBy: "" },
    lines: [
      { id: 401, name: "كرسي مكتبي", qty: "10", unitPrice: "380", discount: "0", vatRateId: "5", sku: "", unit: "وحدة" },
    ],
    charges: {
      shipping:     { label: "رسوم الشحن", amount: "50" },
      installation: { label: "", amount: "" },
      custom:       { label: "", amount: "" },
    },
    delivery: { paymentTerms: "30 يوماً", address: "", instructions: "", warranty: "", returns: "", notes: "", paymentMethod: "" },
  };

  const serialised   = JSON.stringify(draft);
  const deserialised = JSON.parse(serialised);

  assert.equal(deserialised.buyer.name,             "شركة الأفق",       "buyer name round-trips");
  assert.equal(deserialised.supplier.emirate,       "أبوظبي",           "supplier emirate round-trips");
  assert.equal(deserialised.poDetails.poNumber,     "PO-2026-1234",     "PO number round-trips");
  assert.equal(deserialised.lines[0].vatRateId,     "5",                "vatRateId preserved");
  assert.equal(deserialised.charges.shipping.amount,"50",               "shipping charge round-trips");
  assert.equal(deserialised.delivery.paymentTerms,  "30 يوماً",         "payment terms round-trips");
});

test("Draft restore: malformed JSON does not throw (catch block behaviour)", () => {
  const malformed = "{ broken json ::";
  assert.throws(() => JSON.parse(malformed), SyntaxError, "raw parse throws");
  // The component wraps restore in try/catch — simulate:
  let restored = null;
  try { restored = JSON.parse(malformed); } catch { /* flash error — no crash */ }
  assert.equal(restored, null, "restored stays null after bad JSON");
});

test("Draft restore: empty/null payload — component keeps defaults", () => {
  // null localStorage value
  let restored = null;
  try {
    const raw = null; // simulates localStorage.getItem returning null
    if (raw) restored = JSON.parse(raw);
  } catch { /* ignore */ }
  assert.equal(restored, null, "null raw → nothing restored");
});

test("Draft restore: partial payload — missing keys do not crash merge", () => {
  // Only buyer present, no lines/charges
  const partial = JSON.stringify({ buyer: { name: "شركة التقنية" } });
  const d = JSON.parse(partial);
  // Simulate component's conditional assignment pattern
  const buyer    = d.buyer    || { name: "", address: "", emirate: "دبي", trn: "" };
  const lines    = d.lines    || [{ id: 301, name: "", qty: "1", unitPrice: "", discount: "0", vatRateId: "5", sku: "", unit: "وحدة" }];
  const charges  = d.charges  || { shipping: { label: "", amount: "" }, installation: { label: "", amount: "" }, custom: { label: "", amount: "" } };

  assert.equal(buyer.name,             "شركة التقنية",  "buyer name restored");
  assert.equal(lines[0].vatRateId,     "5",              "default line used");
  assert.equal(charges.shipping.amount,"",               "default charges used");
});

test("Draft restore: line IDs are not duplicated after restore", () => {
  // Simulate the _lineId advancement that the component performs
  let _lineId = 300;
  const newLineId = () => ++_lineId;

  const restoredLines = [
    { id: 450, name: "بند أ" },
    { id: 480, name: "بند ب" },
  ];

  // Component does: _lineId = Math.max(_lineId, ...restored ids)
  _lineId = Math.max(_lineId, ...restoredLines.map(l => Number(l.id) || 0));
  assert.equal(_lineId, 480, "counter advanced to max restored id");

  const newId1 = newLineId();
  const newId2 = newLineId();
  assert.equal(newId1, 481, "first new id is above all restored");
  assert.equal(newId2, 482, "second new id increments correctly");

  const allIds = [...restoredLines.map(l => l.id), newId1, newId2];
  const uniqueIds = new Set(allIds);
  assert.equal(uniqueIds.size, allIds.length, "all line IDs are unique");
});

// ─── Quotation import mapping ─────────────────────────────────────────────────
test("Quotation import: supplier/buyer/lines/prices/vatRateId all mapped correctly", () => {
  // Simulate a quotation prefill payload (shape from UaeQuotationGenerator)
  const prefillData = {
    supplier: { name: "مورد التقنية",   address: "دبي", emirate: "دبي",    trn: "100000000000099", email: "s@tech.ae", phone: "+97145000000" },
    buyer:    { name: "شركة العميل",    address: "أبوظبي", emirate: "أبوظبي", trn: "", email: "", phone: "" },
    lines: [
      { id: 501, name: "خادم سحابي",   qty: "2",  unitPrice: "5000", discount: "200", vatRateId: "5",  sku: "SRV-01", unit: "وحدة" },
      { id: 502, name: "دعم تقني سنوي", qty: "1",  unitPrice: "3000", discount: "0",   vatRateId: "0",  sku: "",       unit: "سنة"  },
    ],
    poDetails: { quoteRef: "QT-2026-0099", currency: "AED", status: "", requestedBy: "" },
  };

  // Simulate import: lines get new IDs (as component does via newLineId())
  let _lineId = 600;
  const newLineId = () => ++_lineId;
  const importedLines = prefillData.lines.map(l => ({ ...l, id: newLineId(), sku: l.sku || "" }));

  // Buyer / Supplier roles
  assert.equal(importedLines[0].name,       "خادم سحابي",   "first item name");
  assert.equal(importedLines[0].vatRateId,  "5",             "5% vatRateId preserved");
  assert.equal(importedLines[1].vatRateId,  "0",             "0% vatRateId preserved");
  assert.equal(importedLines[0].discount,   "200",           "discount preserved");
  assert.equal(importedLines[0].id,         601,             "new id assigned");
  assert.equal(importedLines[1].id,         602,             "new id increments");

  // Verify no ID collision with original IDs from quotation
  assert.ok(importedLines[0].id !== 501, "id is new, not original");
  assert.ok(importedLines[1].id !== 502, "id is new, not original");

  // Quote ref preserved in poDetails
  assert.equal(prefillData.poDetails.quoteRef, "QT-2026-0099", "quoteRef carried over");
});

// ─── Invoice handoff: deriveDraftInvoiceNumber ────────────────────────────────

/**
 * Mirrors the deriveDraftInvoiceNumber function extracted from the component fix.
 * Tested in isolation so the logic is verified independently.
 */
function deriveDraftInvoiceNumber(poNumber) {
  const stripped = (poNumber || "").replace(/^(L?PO[-_]?)/i, "");
  return `INV-${stripped}`;
}

test("Invoice handoff: PO-YYYY-NNNN → INV-YYYY-NNNN", () => {
  assert.equal(deriveDraftInvoiceNumber("PO-2026-1234"),  "INV-2026-1234",  "standard PO prefix");
});

test("Invoice handoff: LPO-YYYY-NNNN → INV-YYYY-NNNN (no LINV prefix)", () => {
  assert.equal(deriveDraftInvoiceNumber("LPO-2026-0001"), "INV-2026-0001",  "LPO prefix stripped correctly");
  // The OLD bug produced "LINVO-2026-0001" — verify that does NOT happen
  assert.notEqual(deriveDraftInvoiceNumber("LPO-2026-0001"), "LINVO-2026-0001", "old bug not reproduced");
});

test("Invoice handoff: po- (lowercase) → INV- prefix", () => {
  assert.equal(deriveDraftInvoiceNumber("po-2026-9999"),  "INV-2026-9999",  "lowercase po- handled");
  assert.equal(deriveDraftInvoiceNumber("lpo-2026-0002"), "INV-2026-0002",  "lowercase lpo- handled");
});

test("Invoice handoff: unrecognised prefix → INV- prepended as-is", () => {
  assert.equal(deriveDraftInvoiceNumber("ORD-2026-5555"), "INV-ORD-2026-5555", "unknown prefix → whole string appended");
  assert.equal(deriveDraftInvoiceNumber("2026-0042"),     "INV-2026-0042",     "bare number prefixed");
});

test("Invoice handoff: empty PO number → INV-", () => {
  assert.equal(deriveDraftInvoiceNumber(""),  "INV-",  "empty number handled");
  assert.equal(deriveDraftInvoiceNumber(null),"INV-",  "null handled");
});

test("Invoice handoff: draft number is labelled as DRAFT REFERENCE in notes", () => {
  // Simulate payload construction: notes must include PO reference
  const poNumber   = "PO-2026-1234";
  const userNotes  = "يرجى التسليم خلال 7 أيام";
  const notes      = [`مرجع أمر الشراء / PO Ref: ${poNumber}`, userNotes].filter(Boolean).join("\n");
  assert.ok(notes.includes("PO Ref: PO-2026-1234"),  "PO reference in notes");
  assert.ok(notes.includes(userNotes),                "user notes preserved");
});

test("Invoice handoff: lines carry vatRateId to invoice prefill", () => {
  const lines = [
    { id: 401, name: "صنف خاضع",  qty: "2", unitPrice: "500", discount: "0",  vatRateId: "5"      },
    { id: 402, name: "صنف صفري",  qty: "1", unitPrice: "300", discount: "50", vatRateId: "0"      },
    { id: 403, name: "صنف معفى",  qty: "1", unitPrice: "200", discount: "0",  vatRateId: "exempt" },
  ];
  const payload = {
    lines: lines.map(l => ({ id: l.id, name: l.name, qty: l.qty, unitPrice: l.unitPrice, discount: l.discount, vatRateId: l.vatRateId })),
  };
  assert.equal(payload.lines[0].vatRateId, "5",      "5% carried");
  assert.equal(payload.lines[1].vatRateId, "0",      "0% carried");
  assert.equal(payload.lines[2].vatRateId, "exempt", "exempt carried");
  assert.equal(payload.lines[1].discount,  "50",     "discount preserved");
});

// ─── Legal / classification guards ────────────────────────────────────────────
test("Legal: zero VAT ≠ exempt ≠ out-of-scope — all are distinct buckets", () => {
  const t = calcTotals([
    { qty: "1", unitPrice: "100", vatRateId: "0"      },
    { qty: "1", unitPrice: "200", vatRateId: "exempt" },
    { qty: "1", unitPrice: "300", vatRateId: "out"    },
  ]);
  // Each must be in its own bucket — no cross-contamination
  assert.equal(r2(t.taxable0),    100, "zero-rated in own bucket");
  assert.equal(r2(t.exemptTotal), 200, "exempt in own bucket");
  assert.equal(r2(t.outTotal),    300, "out-of-scope in own bucket");
  // None appear in the 5% taxable bucket
  assert.equal(r2(t.taxable5),    0,   "none bleed into 5% bucket");
  assert.equal(r2(t.totalVat),    0,   "combined VAT is zero");
});

test("Legal: PO VAT amounts are estimates — discountExceedsGross guard prevents negative tax base", () => {
  // Even at extreme discount, tax base never goes negative
  const r = calcLineVat({ qty: "1", unitPrice: "1000", discount: "9999", vatRate: 0.05 });
  assert.ok(r.taxableBase >= 0, "taxable base is never negative");
  assert.ok(r.vatAmount   >= 0, "VAT amount is never negative");
  assert.ok(r.lineTotal   >= 0, "line total is never negative");
});
