/**
 * tests/uaePOInvoiceComponent.test.js
 * Day 5 Final QA — REAL rendered-component integration tests.
 *
 * Uses the EXISTING project tooling: jsdom (tests/setup.js),
 * @testing-library/react@16, React 19 — same pattern as Day 4's
 * tests/final-settlement-calculator.test.js. No new dependencies added.
 *
 * Renders the actual <UaePurchaseOrderGenerator /> and
 * <UaeVatInvoiceGenerator /> components and verifies:
 *   - PO over-discount: preview/print disabled, then enabled after correction
 *   - Invoice number unconfirmed: preview/print disabled
 *   - Invoice number confirmed: preview/print enabled
 *   - PO prefill banner visible and accepted import
 *   - Correct seller/buyer mapping and line item values
 *   - Import rejected for empty/missing/malformed line payloads
 *   - No demo/preset line items remain after rejected import
 */
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { strict as assert } from "assert";
import { test, afterEach, beforeEach } from "node:test";
import React from "react";

// Make React available globally for the classic JSX transform (components use
// the automatic runtime in Next.js, but tsx test runner uses classic which
// needs React in scope). This does NOT affect production code or builds.
globalThis.React = React;

import UaePurchaseOrderGenerator from "../components/UaePurchaseOrderGenerator.jsx";
import UaeVatInvoiceGenerator from "../components/UaeVatInvoiceGenerator.jsx";

// ─── Environment setup ────────────────────────────────────────────────────────

// Mock localStorage — jsdom throws SecurityError for opaque origins, so always override
const _store = {};
const _lsMock = {
  getItem: (key) => _store[key] ?? null,
  setItem: (key, val) => { _store[key] = String(val); },
  removeItem: (key) => { delete _store[key]; },
  clear: () => { Object.keys(_store).forEach((k) => delete _store[k]); },
};
Object.defineProperty(global.window, 'localStorage', {
  value: _lsMock,
  writable: true,
  configurable: true,
});
// Components use bare `localStorage` (not `window.localStorage`) — must also set global
global.localStorage = _lsMock;

// Mock window.print (called by handlePrint in both components)
if (!global.window.print) global.window.print = () => {};

// Mock window.open (called by handleOpenInvoice in PO component)
if (!global.window.open) global.window.open = () => {};

// Reset store and mock print tracking before each test
let _printCallCount = 0;
beforeEach(() => {
  Object.keys(_store).forEach((k) => delete _store[k]);
  _printCallCount = 0;
  global.window.print = () => { _printCallCount++; };
});

afterEach(() => cleanup());

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const VALID_PREFILL = {
  seller: {
    name: "شركة التوريدات التقنية ذ.م.م",
    address: "شارع المرور، أبوظبي",
    emirate: "أبوظبي",
    trn: "100123456789012",
    email: "sales@tech.ae",
    phone: "+97125000001",
    cr: "",
  },
  buyer: {
    name: "شركة الأفق للتقنية",
    address: "شارع الشيخ زايد، دبي",
    emirate: "دبي",
    trn: "100987654321098",
    vatRegistered: "yes",
  },
  details: {
    invoiceNumber: "INV-2026-1001",
    issueDate: "2026-10-15",
    supplyDate: "",
    currency: "AED",
    notes: "مرجع أمر الشراء / PO Ref: PO-2026-1001",
  },
  lines: [
    { id: 401, name: "خادم سحابي", qty: "2", unitPrice: "5000", discount: "200", vatRateId: "5" },
    { id: 402, name: "تراخيص برمجية", qty: "5", unitPrice: "800", discount: "0", vatRateId: "0" },
  ],
};

// Preset demo seller name (from PRESETS.full in invoice component)
const DEMO_SELLER = "شركة النخيل للتجارة ذ.م.م";

// ─── SECTION 1: PO over-discount rendered component tests ─────────────────────

test("PO rendered: over-discount disables preview and print buttons", () => {
  render(React.createElement(UaePurchaseOrderGenerator));

  // The PO component starts with one line (qty=1, unitPrice="", discount=0)
  // Set unit price to 100 so gross = 1×100 = 100
  const priceInput = screen.getByLabelText("سعر الوحدة (AED)");
  fireEvent.change(priceInput, { target: { value: "100" } });

  // Set discount to 150 (exceeds gross of 100)
  const discInput = screen.getByLabelText("الخصم (AED)");
  fireEvent.change(discInput, { target: { value: "150" } });

  // Verify the over-discount warning is visible
  assert.ok(screen.queryByText("الخصم يتجاوز قيمة البند"), "per-line discount warning visible");

  // Verify the blocking error is visible
  assert.ok(screen.queryByText("لا يمكن معاينة أو طباعة أمر الشراء"), "blocking error visible");

  // Verify the preview buttons are disabled (tab bar + action button both have this text)
  const previewBtns = screen.getAllByRole("button", { name: "معاينة أمر الشراء" });
  assert.ok(previewBtns.every((b) => b.disabled), "all preview buttons disabled");

  // Verify the print button is disabled
  const printBtns = screen.getAllByRole("button", { name: "طباعة / PDF" });
  assert.ok(printBtns.every((b) => b.disabled), "all print buttons disabled");
});

test("PO rendered: correcting discount re-enables preview and print buttons", () => {
  render(React.createElement(UaePurchaseOrderGenerator));

  // Set up over-discount condition
  const priceInput = screen.getByLabelText("سعر الوحدة (AED)");
  fireEvent.change(priceInput, { target: { value: "100" } });
  const discInput = screen.getByLabelText("الخصم (AED)");
  fireEvent.change(discInput, { target: { value: "150" } });

  // Verify disabled
  const previewBtns = screen.getAllByRole("button", { name: "معاينة أمر الشراء" });
  assert.ok(previewBtns.every((b) => b.disabled), "disabled before correction");

  // Correct the discount to 50 (below gross)
  fireEvent.change(discInput, { target: { value: "50" } });

  // Verify buttons re-enabled
  const previewBtnsAfter = screen.getAllByRole("button", { name: "معاينة أمر الشراء" });
  assert.ok(previewBtnsAfter.every((b) => !b.disabled), "preview re-enabled after correction");
  const printBtns = screen.getAllByRole("button", { name: "طباعة / PDF" });
  assert.ok(printBtns.every((b) => !b.disabled), "print re-enabled after correction");

  // Verify blocking error is gone
  assert.ok(!screen.queryByText("لا يمكن معاينة أو طباعة أمر الشراء"), "blocking error removed");
});

test("PO rendered: discount exactly equal to gross does NOT block (boundary)", () => {
  render(React.createElement(UaePurchaseOrderGenerator));

  const priceInput = screen.getByLabelText("سعر الوحدة (AED)");
  fireEvent.change(priceInput, { target: { value: "100" } });
  const discInput = screen.getByLabelText("الخصم (AED)");
  fireEvent.change(discInput, { target: { value: "100" } });

  // discount == gross → not over → buttons enabled
  const previewBtns = screen.getAllByRole("button", { name: "معاينة أمر الشراء" });
  assert.ok(previewBtns.every((b) => !b.disabled), "disc==gross: preview enabled");
  const printBtns = screen.getAllByRole("button", { name: "طباعة / PDF" });
  assert.ok(printBtns.every((b) => !b.disabled), "disc==gross: print enabled");

  // No blocking error
  assert.ok(!screen.queryByText("لا يمكن معاينة أو طباعة أمر الشراء"), "no blocking error at boundary");
});

// ─── SECTION 2: Invoice number confirmation rendered tests ────────────────────

test("Invoice rendered: unconfirmed invoice number blocks preview and print", () => {
  render(React.createElement(UaeVatInvoiceGenerator));

  // The component starts with preset invoice number "INV-2026-001" but
  // invoiceNumberConfirmed = false → canExportInvoice = false
  // Verify the preview and print buttons are disabled
  const previewBtns = screen.getAllByRole("button", { name: "معاينة الفاتورة" });
  // One of these is the tab bar (always enabled), one is the action button (disabled)
  const disabledPreview = previewBtns.filter((b) => b.disabled);
  assert.equal(disabledPreview.length, 1, "one preview button disabled (the action button)");

  const printBtn = screen.getByRole("button", { name: "طباعة / حفظ PDF" });
  assert.equal(printBtn.disabled, true, "print button disabled");

  // Verify the Arabic blocking explanation is visible
  assert.ok(screen.queryByText(/تأكيد رقم الفاتورة/), "Arabic confirmation hint visible");
});

test("Invoice rendered: confirming the invoice number enables preview and print", () => {
  render(React.createElement(UaeVatInvoiceGenerator));

  // Initially disabled
  const printBtn = screen.getByRole("button", { name: "طباعة / حفظ PDF" });
  assert.equal(printBtn.disabled, true, "print disabled before confirmation");

  // Find and check the confirmation checkbox
  const checkbox = screen.getByRole("checkbox");
  fireEvent.click(checkbox);

  // After confirmation, buttons should be enabled
  const printBtnAfter = screen.getByRole("button", { name: "طباعة / حفظ PDF" });
  assert.equal(printBtnAfter.disabled, false, "print enabled after confirmation");

  // Preview action button should also be enabled
  const previewBtns = screen.getAllByRole("button", { name: "معاينة الفاتورة" });
  const disabledPreview = previewBtns.filter((b) => b.disabled);
  assert.equal(disabledPreview.length, 0, "no preview buttons disabled after confirmation");
});

test("Invoice rendered: editing invoice number resets confirmation (re-locks gate)", () => {
  render(React.createElement(UaeVatInvoiceGenerator));

  // Confirm the number
  const checkbox = screen.getByRole("checkbox");
  fireEvent.click(checkbox);

  // Verify enabled
  let printBtn = screen.getByRole("button", { name: "طباعة / حفظ PDF" });
  assert.equal(printBtn.disabled, false, "print enabled after first confirmation");

  // Edit the invoice number
  const invInput = screen.getByDisplayValue("INV-2026-001");
  fireEvent.change(invInput, { target: { value: "INV-2026-999" } });

  // Confirmation should be reset → buttons re-disabled
  printBtn = screen.getByRole("button", { name: "طباعة / حفظ PDF" });
  assert.equal(printBtn.disabled, true, "print re-disabled after editing number");

  // Checkbox should be visible again (unconfirmed state)
  const checkboxAgain = screen.getByRole("checkbox");
  assert.equal(checkboxAgain.checked, false, "checkbox unchecked after edit");
});

// ─── SECTION 3: PO prefill import — banner, accept, and field mapping ─────────

test("Invoice rendered: PO prefill banner appears when localStorage key is set", async () => {
  _store["uae_invoice_prefill_v1"] = JSON.stringify(VALID_PREFILL);

  render(React.createElement(UaeVatInvoiceGenerator));

  // useEffect runs after render — wait for the banner to appear
  await waitFor(() => {
    assert.ok(screen.queryByText("تم اكتشاف بيانات من مولد أمر الشراء الإماراتي"),
      "import banner visible");
  });
});

test("Invoice rendered: accepted import maps PO supplier→seller, PO buyer→buyer", async () => {
  _store["uae_invoice_prefill_v1"] = JSON.stringify(VALID_PREFILL);

  render(React.createElement(UaeVatInvoiceGenerator));

  // Wait for banner
  await waitFor(() => {
    assert.ok(screen.queryByText("تم اكتشاف بيانات من مولد أمر الشراء الإماراتي"),
      "banner visible before import");
  });

  // Verify current seller is the DEMO preset
  assert.ok(screen.queryByDisplayValue(DEMO_SELLER), "seller is demo preset before import");

  // Click import
  const importBtn = screen.getByRole("button", { name: "استيراد بيانات أمر الشراء" });
  fireEvent.click(importBtn);

  // After import, seller should be the PO supplier name
  await waitFor(() => {
    assert.ok(screen.queryByDisplayValue(VALID_PREFILL.seller.name),
      "seller is PO supplier after import");
  });

  // Verify demo seller is gone
  assert.ok(!screen.queryByDisplayValue(DEMO_SELLER), "demo seller replaced");

  // Verify buyer is PO buyer
  assert.ok(screen.queryByDisplayValue(VALID_PREFILL.buyer.name),
    "buyer is PO buyer after import");

  // Verify banner is gone (payload cleared)
  assert.ok(!screen.queryByText("تم اكتشاف بيانات من مولد أمر الشراء الإماراتي"),
    "banner hidden after import");
});

test("Invoice rendered: imported line items show correct names and VAT rates", async () => {
  _store["uae_invoice_prefill_v1"] = JSON.stringify(VALID_PREFILL);

  render(React.createElement(UaeVatInvoiceGenerator));

  await waitFor(() => {
    assert.ok(screen.queryByText("تم اكتشاف بيانات من مولد أمر الشراء الإماراتي"));
  });

  // Before import, the form has preset lines with "خدمات استشارية هندسية" and "مواد بناء"
  assert.ok(screen.queryByDisplayValue("خدمات استشارية هندسية"), "preset line 1 before import");
  assert.ok(screen.queryByDisplayValue("مواد بناء — خرسانة مسلحة"), "preset line 2 before import");

  // Click import
  fireEvent.click(screen.getByRole("button", { name: "استيراد بيانات أمر الشراء" }));

  // After import, lines should be from PO payload
  await waitFor(() => {
    assert.ok(screen.queryByDisplayValue("خادم سحابي"), "PO line 1 name after import");
    assert.ok(screen.queryByDisplayValue("تراخيص برمجية"), "PO line 2 name after import");
  });

  // Verify preset line names are gone
  assert.ok(!screen.queryByDisplayValue("خدمات استشارية هندسية"), "preset line 1 replaced");
  assert.ok(!screen.queryByDisplayValue("مواد بناء — خرسانة مسلحة"), "preset line 2 replaced");
});

// ─── SECTION 4: Import validation — reject malformed/incomplete payloads ───────

test("Invoice rendered: import rejected when lines array is empty", async () => {
  const payload = { ...VALID_PREFILL, lines: [] };
  _store["uae_invoice_prefill_v1"] = JSON.stringify(payload);

  render(React.createElement(UaeVatInvoiceGenerator));

  await waitFor(() => {
    assert.ok(screen.queryByText("تم اكتشاف بيانات من مولد أمر الشراء الإماراتي"));
  });

  // Verify current seller is demo preset
  assert.ok(screen.queryByDisplayValue(DEMO_SELLER), "seller is demo before rejected import");

  // Click import
  fireEvent.click(screen.getByRole("button", { name: "استيراد بيانات أمر الشراء" }));

  // Verify Arabic error message appears
  await waitFor(() => {
    assert.ok(screen.queryByText(/تعذّر الاستيراد: لا توجد بنود/),
      "Arabic rejection error visible");
  });

  // Verify seller is STILL the demo preset (unchanged)
  assert.ok(screen.queryByDisplayValue(DEMO_SELLER),
    "seller unchanged after rejected import");

  // Verify banner is still visible (payload NOT cleared)
  assert.ok(screen.queryByText("تم اكتشاف بيانات من مولد أمر الشراء الإماراتي"),
    "banner still visible after rejection");
});

test("Invoice rendered: import rejected when lines property is missing", async () => {
  const payload = { seller: VALID_PREFILL.seller, buyer: VALID_PREFILL.buyer, details: VALID_PREFILL.details };
  _store["uae_invoice_prefill_v1"] = JSON.stringify(payload);

  render(React.createElement(UaeVatInvoiceGenerator));

  await waitFor(() => {
    assert.ok(screen.queryByText("تم اكتشاف بيانات من مولد أمر الشراء الإماراتي"));
  });

  fireEvent.click(screen.getByRole("button", { name: "استيراد بيانات أمر الشراء" }));

  await waitFor(() => {
    assert.ok(screen.queryByText(/تعذّر الاستيراد: لا توجد بنود/),
      "rejection error for missing lines");
  });

  // Form data unchanged
  assert.ok(screen.queryByDisplayValue(DEMO_SELLER), "demo seller preserved");
});

test("Invoice rendered: import rejected when seller name is missing", async () => {
  const payload = { ...VALID_PREFILL, seller: { ...VALID_PREFILL.seller, name: "" } };
  _store["uae_invoice_prefill_v1"] = JSON.stringify(payload);

  render(React.createElement(UaeVatInvoiceGenerator));

  await waitFor(() => {
    assert.ok(screen.queryByText("تم اكتشاف بيانات من مولد أمر الشراء الإماراتي"));
  });

  fireEvent.click(screen.getByRole("button", { name: "استيراد بيانات أمر الشراء" }));

  await waitFor(() => {
    assert.ok(screen.queryByText(/تعذّر الاستيراد: بيانات المورد غير مكتملة/),
      "rejection error for missing seller name");
  });

  assert.ok(screen.queryByDisplayValue(DEMO_SELLER), "demo seller preserved after seller rejection");
});

test("Invoice rendered: import rejected when buyer name is missing", async () => {
  const payload = { ...VALID_PREFILL, buyer: { ...VALID_PREFILL.buyer, name: "" } };
  _store["uae_invoice_prefill_v1"] = JSON.stringify(payload);

  render(React.createElement(UaeVatInvoiceGenerator));

  await waitFor(() => {
    assert.ok(screen.queryByText("تم اكتشاف بيانات من مولد أمر الشراء الإماراتي"));
  });

  fireEvent.click(screen.getByRole("button", { name: "استيراد بيانات أمر الشراء" }));

  await waitFor(() => {
    assert.ok(screen.queryByText(/تعذّر الاستيراد: بيانات العميل غير مكتملة/),
      "rejection error for missing buyer name");
  });
});

test("Invoice rendered: import rejected when line items lack names", async () => {
  const payload = {
    ...VALID_PREFILL,
    lines: [
      { id: 1, name: "صندوق موجود", qty: "1", unitPrice: "100", discount: "0", vatRateId: "5" },
      { id: 2, name: "", qty: "2", unitPrice: "50", discount: "0", vatRateId: "5" }, // no name
    ],
  };
  _store["uae_invoice_prefill_v1"] = JSON.stringify(payload);

  render(React.createElement(UaeVatInvoiceGenerator));

  await waitFor(() => {
    assert.ok(screen.queryByText("تم اكتشاف بيانات من مولد أمر الشراء الإماراتي"));
  });

  fireEvent.click(screen.getByRole("button", { name: "استيراد بيانات أمر الشراء" }));

  await waitFor(() => {
    assert.ok(screen.queryByText(/تعذّر الاستيراد.*بدون وصف/),
      "rejection error for unnamed line items");
  });

  // Preset lines preserved (not replaced)
  assert.ok(screen.queryByDisplayValue("خدمات استشارية هندسية"), "preset line 1 preserved");
});

test("Invoice rendered: dismissed import keeps form data and does not remove key", async () => {
  _store["uae_invoice_prefill_v1"] = JSON.stringify(VALID_PREFILL);

  render(React.createElement(UaeVatInvoiceGenerator));

  await waitFor(() => {
    assert.ok(screen.queryByText("تم اكتشاف بيانات من مولد أمر الشراء الإماراتي"));
  });

  // Click dismiss
  fireEvent.click(screen.getByRole("button", { name: "تجاهل" }));

  // Banner should be hidden (dismissed)
  assert.ok(!screen.queryByText("تم اكتشاف بيانات من مولد أمر الشراء الإماراتي"),
    "banner hidden after dismiss");

  // Form data should be unchanged (still preset)
  assert.ok(screen.queryByDisplayValue(DEMO_SELLER), "demo seller preserved after dismiss");

  // localStorage key should NOT be removed (still available for re-import on reload)
  assert.ok(_store["uae_invoice_prefill_v1"], "localStorage key preserved after dismiss");
});

test("Invoice rendered: valid import clears localStorage key (no re-import on reload)", async () => {
  _store["uae_invoice_prefill_v1"] = JSON.stringify(VALID_PREFILL);

  render(React.createElement(UaeVatInvoiceGenerator));

  await waitFor(() => {
    assert.ok(screen.queryByText("تم اكتشاف بيانات من مولد أمر الشراء الإماراتي"));
  });

  fireEvent.click(screen.getByRole("button", { name: "استيراد بيانات أمر الشراء" }));

  await waitFor(() => {
    assert.ok(screen.queryByDisplayValue(VALID_PREFILL.seller.name), "import succeeded");
  });

  // Key should be removed
  assert.ok(!_store["uae_invoice_prefill_v1"], "localStorage key cleared after successful import");
});
