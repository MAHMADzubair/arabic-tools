import test from "node:test";
import assert from "node:assert/strict";
import {
  BUSINESS_TYPE,
  TRANSACTION_TYPE,
  evaluateEInvoicingReadiness,
} from "../lib/uaeEInvoicingConfig.js";

function evaluateB2COnly(revenue) {
  return evaluateEInvoicingReadiness({
    businessType: BUSINESS_TYPE.PRIVATE,
    revenue,
    transactionTypes: [TRANSACTION_TYPE.B2C],
  });
}

test("B2C-only sales are flagged for scope review, not declared exempt", () => {
  const result = evaluateB2COnly(8_000_000);

  assert.equal(result.inScope, true);
  assert.equal(result.scopeNeedsReview, true);
  assert.equal(result.timeline.id, "phase2_small");
  assert.match(result.scopeNoteAr, /تتلقى سلعاً أو خدمات من منشآت أخرى/);
});

test("B2C-only businesses above AED 50m receive a potential phase-one timeline with a scope warning", () => {
  const result = evaluateB2COnly(60_000_000);

  assert.equal(result.inScope, true);
  assert.equal(result.scopeNeedsReview, true);
  assert.equal(result.timeline.id, "phase1_large");
});

test("B2B and B2G transaction selections do not trigger the B2C-only scope warning", () => {
  const result = evaluateEInvoicingReadiness({
    businessType: BUSINESS_TYPE.PRIVATE,
    revenue: 8_000_000,
    transactionTypes: [TRANSACTION_TYPE.B2B, TRANSACTION_TYPE.B2C],
  });

  assert.equal(result.inScope, true);
  assert.equal(result.scopeNeedsReview, false);
});
