# QEMLO — Day 5 Audit: UAE Purchase Order Generator
**Date:** October 23, 2026  
**Branch:** `day5-uae-purchase-order-audit`  
**Tool URL:** https://qemlo.com/ar/ae/purchase-order-generator  
**Auditor:** Kiro AI (Senior Next.js Engineer / UAE VAT Researcher / Arabic SEO Specialist)

---

## BEFORE-CHANGES AUDIT (Phase 1)

### Files Inspected

| File | Status |
|---|---|
| `components/UaePurchaseOrderGenerator.jsx` | Fully audited |
| `app/ar/ae/purchase-order-generator/page.js` | Fully audited |
| `lib/businessUtils.js` | Fully audited |
| `lib/countryBusinessConfig.js` | Fully audited |
| `app/sitemap.js` | Verified — PO page present at priority 0.9 |

### Capabilities Present ✅

- Buyer information (name, address, emirate, TRN, contact, phone, email)
- Supplier information (same fields)
- UAE TRN fields with 15-digit format validation (format only — not FTA registry)
- Purchase order number (auto-generated) and dates (issue + delivery)
- Line items: description, SKU, qty, unit, unit price
- Per-line discount with UI warning when discount exceeds gross
- VAT classification per line: 5%, 0%, Exempt, Out-of-scope, No VAT
- Additional charges: shipping, installation, custom
- Payment terms, delivery address, warranty, returns, payment method
- Order status (draft / sent / confirmed / cancelled)
- Print preview with bilingual (Arabic/English) A4-formatted document
- Save as PDF via browser print dialog
- Local draft storage (DRAFT_KEY = `uae_purchase_order_draft_v1`)
- Restore / clear draft with safe try/catch
- Import from UAE Quotation Generator (`PREFILL_KEY = uae_po_prefill_v1`)
- Completeness checker with progress bar
- Open VAT Invoice Generator handoff

### Issues Identified (Pre-Fix)

#### 🔴 BUG-01: Invoice Handoff — Naive String Replace

**Location:** `handleOpenInvoice()` in `UaePurchaseOrderGenerator.jsx`

```js
// BEFORE (broken for LPO-* prefixes):
invoiceNumber: poDetails.poNumber.replace("PO-", "INV-")
// LPO-2026-0001 → "LINVO-2026-0001" ❌
```

A `.replace("PO-", "INV-")` call on `"LPO-2026-0001"` produces `"LINVO-2026-0001"` — a corrupted reference. The `replace` call acts on the first occurrence of the substring `"PO-"` inside the string, not just the prefix.

**Severity:** Medium — produces a misleading invoice reference that may confuse users.

#### 🟡 BUG-02: Additional Charges — Missing VAT Treatment Notice

**Location:** Step 5 (Charges) form + preview table charge rows

Additional charges (shipping, installation, custom) are added to the grand total as raw amounts with no VAT. However:
- The form field label says simply `المبلغ (AED)` with no indication of VAT treatment.
- In the preview table, charge rows show only the amount and an em-dash for # — no note that VAT was not additionally applied.
- This creates visual ambiguity: a user seeing shipping on the same table as 5% VAT line items might assume the tool also applied VAT to the charge.

**Severity:** Medium — financial accuracy and legal ambiguity.

#### 🟡 BUG-03: H1 Duplication

**Location:** Component `<header>` renders `<h1 className="po-h1">`, while the page hero (`page.js`) already contains an `<h1>`.

Two H1s on a single page degrades SEO signals and violates heading hierarchy best practice.

**Severity:** Low-Medium — SEO and accessibility.

#### 🟡 BUG-04: Mobile Tap Targets Below 44px

**Location:** `.po-btn-sm` CSS rule: `padding:.25rem .625rem` → ~28px height.

WCAG 2.5.5 recommends 44×44px minimum tap target. The "حفظ المسودة", "استعادة", "مسح المسودة" small buttons do not meet this.

**Severity:** Low — mobile accessibility.

---

## PHASE 2 — VAT ACCURACY VERIFICATION

### `calcLineVat()` — Verified Correct ✅

```
gross       = qty × unitPrice
taxableBase = Math.max(0, gross − discount)   ← clamped, never negative
vatAmount   = vatRate !== null ? taxableBase × vatRate : 0
lineTotal   = taxableBase + vatAmount
```

Behaviour with `showVat = false`: `vatRate` is passed as `null` → `vatAmount = 0`, `lineTotal = taxableBase`. Stored `vatRateId` on each line is **preserved** — the toggle does not corrupt classifications.

### VAT Classification Buckets — Verified Distinct ✅

| ID | Rate | Bucket |
|---|---|---|
| `"5"` | 0.05 | `taxable5` |
| `"0"` | 0 | `taxable0` |
| `"exempt"` | null | `exemptTotal` |
| `"out"` | null | `outTotal` |
| `"none"` | null | _(no bucket, just no VAT)_ |

Zero-rated (0%) and Exempt are legally distinct in UAE VAT law. Zero-rated supplies qualify for input tax recovery; exempt supplies do not. The tool's separate bucketing is correct.

### Additional Charges Tax Treatment — Documented Assumption

Additional charges are added **as entered** to the grand total — no VAT is computed on them by the tool. This is a deliberate conservative design:

- **Justified:** The VAT treatment of ancillary charges (shipping, installation) depends on whether they are a separate supply or incidental to the main supply. Automatically applying 5% to all charges would be misleading for zero-rated, exempt, or mixed supplies.
- **Required action:** UI must make this explicit to the user — added via FIX-02.

### Golden Scenario Results (All Pass ✅)

| Scenario | Description | Result |
|---|---|---|
| A | 3×100, disc 20 → VAT 14, total 294 | ✅ Pass |
| B | Zero-rated line: subtotal correct, VAT=0 | ✅ Pass |
| C | Exempt: zero VAT, exempt bucket | ✅ Pass |
| D | Out-of-scope: zero VAT, out bucket | ✅ Pass |
| D+ | Exempt ≠ out-of-scope (separate buckets) | ✅ Pass |
| E | Mixed 5%/0%/exempt/out — totals correct | ✅ Pass |
| F | VAT toggle off/on — no corruption | ✅ Pass |
| G | Discount > gross → taxable clamped to 0 | ✅ Pass |
| H | Zero qty / empty price → zeros | ✅ Pass |
| I | Negative/NaN/null inputs → 0 | ✅ Pass |
| J | Fractional qty + decimal price accurate | ✅ Pass |
| K | AED 2dp presentation always valid | ✅ Pass |
| L | Charges in grand total, no extra VAT | ✅ Pass |

---

## PHASE 3 — DRAFT AND WORKFLOW RELIABILITY

### Draft Lifecycle ✅

- `saveDraft`: serialises all state to `localStorage`; wrapped in try/catch.
- `restoreDraft`: `_lineId` advanced past max restored ID before restoring → **no duplicate React keys**.
- `clearDraft`: wrapped in try/catch → no crash on restricted storage.
- Malformed JSON: caught silently, user sees flash message.
- Partial payloads (missing keys): component conditional assignment pattern protects against undefined access.

### Quotation Import ✅

- Lines receive fresh IDs via `newLineId()` → no collision with original quotation line IDs.
- `vatRateId`, `discount`, `unitPrice`, `qty`, `sku` all preserved from quotation payload.
- Buyer/supplier roles preserved correctly (quotation supplier → PO supplier, quotation buyer → PO buyer).

### Invoice Handoff — Fixed ✅

**BEFORE:** `poDetails.poNumber.replace("PO-", "INV-")` → corrupted for LPO-* prefixes.

**AFTER:** `deriveDraftInvoiceNumber()` uses regex `/^(L?PO[-_]?)/i` to strip the leading prefix before prepending `INV-`.

```
PO-2026-1234  → INV-2026-1234  ✅
LPO-2026-0001 → INV-2026-0001  ✅  (was LINVO-2026-0001 ❌)
po-2026-9999  → INV-2026-9999  ✅
ORD-2026-5555 → INV-ORD-2026-5555  ✅  (unknown prefix preserved intact)
```

The PO number is also preserved as a cross-reference note in the invoice payload:
```
مرجع أمر الشراء / PO Ref: PO-2026-1234
```

**Legal note preserved:** The component already contains a disclosure that a PO is not a tax invoice. The derived invoice number is labelled as a draft reference. A compliant sequential invoice number must be assigned by the supplier's invoicing system.

---

## PHASE 4 — ARABIC UX AND MOBILE POLISH

### RTL Alignment ✅
- `po-root` has `dir="rtl"`, `po-doc-body` has `dir="rtl"`.
- Numeric/LTR fields use `dir="ltr"` individually.
- Currency amounts use `.po-ltr` wrapper.

### Mobile Layout ✅
- `po-two` grid switches from 1-col to 2-col at `min-width:640px` (sm breakpoint).
- `po-line-grid` and `po-line-grid4` do the same.
- `po-doc-parties` is 1-col on mobile, 2-col on ≥640px.

### Tap Target Fix (FIX-04) ✅
- `.po-btn-sm` changed from `padding:.25rem .625rem` (~28px height) to `padding:.375rem .875rem; min-height:2.75rem` (~44px height).

### Print / A4 Layout ✅
- `@media print` hides all `.po-noprint` elements.
- `break-inside:avoid` on doc boxes and signature area.
- Document header uses `print-color-adjust:exact` for brand orange background.
- `po-doc-scroll: overflow:visible` in print mode prevents table clipping.

### Dark Mode ✅
- `.po-root` variables respond to `prefers-color-scheme:dark` and `[data-theme="dark"]`.
- Printed document uses fixed `--d-ink:#0a0a0a` (never inverted by OS).

### H1 Duplication Fix (FIX-03) ✅
- Component `<h1>` demoted to `<p role="heading" aria-level="2">` — page hero retains the sole H1.

---

## PHASE 5 — UAE ARABIC SEO AUDIT

### Metadata Assessment

| Item | Status | Notes |
|---|---|---|
| Title | ✅ | "نموذج أمر شراء الإمارات \| مولد LPO PDF جاهز 2026" — primary keyword in title |
| Description | ✅ | Keyword-rich, action-oriented, under 160 chars |
| Canonical | ✅ | Relative `/ar/ae/purchase-order-generator` — Next.js resolves to absolute |
| hreflang | ✅ | No alternate versions exist; no hreflang set (correct) |
| OpenGraph | ✅ | title, description, url, type, locale all present |
| BreadcrumbList JSON-LD | ✅ | 3 levels, all URLs valid |
| SoftwareApplication JSON-LD | ✅ | name, category, OS, price, publisher, inLanguage all present |
| FAQPage JSON-LD | ✅ | 8 FAQs, all mirrored from visible page content |
| Sitemap | ✅ | Present in `uaeDeepPages` at priority 0.9 |
| H1 | ✅ (after fix) | Single H1 in page hero; component heading demoted |
| H2s | ✅ | Multiple H2s in editorial sections, clear hierarchy |
| Internal links | ✅ | Links to quotation generator, VAT invoice, VAT registration, UAE hub |
| Year "2026" in title | ✅ | Current as of October 2026 |

### FAQ Quality Review

All 8 FAQs are factually accurate and appropriately scoped:
- FAQ 2 correctly distinguishes PO from Tax Invoice.
- FAQ 3 correctly states VAT on PO is a cost estimate, not an official charge.
- FAQ 7 correctly references FTA and notes PO alone doesn't guarantee registration approval.
- No keyword stuffing detected.
- No false claims of government certification or official FTA approval.

---

## PHASE 6 — DOCUMENT COMPLIANCE AND TRUST

### Disclosure Coverage

| Disclosure | Location | Status |
|---|---|---|
| "أمر الشراء ليس فاتورة ضريبية" | GEO answer block (page) | ✅ |
| VAT amounts in PO are estimates | FAQ 3 answer | ✅ |
| Not affiliated with FTA | GEO answer block | ✅ |
| Tool is not FTA certified | GEO answer block | ✅ |
| TRN validation is format-only | TrnField hint text | ✅ |
| PO not a substitute for Tax Invoice | Component form note | ✅ |
| Print disclaimer on document | Preview footer | ✅ |
| Charges VAT treatment | ⚠️ **Added by FIX-02** | ✅ |
| Invoice number is draft reference | **Added by FIX-01** (notes field) | ✅ |

### Legal Classification Accuracy

- **Purchase Order (PO/LPO):** Correctly described as a commercial document issued by buyer, not a tax invoice.
- **Zero-rated vs Exempt:** Maintained as distinct buckets — correct UAE VAT treatment.
- **E-invoicing:** Tool does not claim to produce UAE structured e-invoices. Browser-generated PDFs are not compliant PEPPOL/FTA e-invoices.
- **FTA TRN:** Clearly labelled as format-check only.

**Official references cited:**
- https://tax.gov.ae (FTA main portal)
- https://tax.gov.ae/en/taxes/Vat/vat.topics/tax.invoices.aspx (Tax Invoices guidance)

---

## CHANGES MADE

### `components/UaePurchaseOrderGenerator.jsx`

1. **FIX-01 (Invoice Handoff):** Replaced naive `.replace("PO-","INV-")` with `deriveDraftInvoiceNumber()` — regex strips `L?PO[-_]?` prefix case-insensitively before prepending `INV-`. PO number preserved as cross-reference note in invoice payload.

2. **FIX-02 (Charges VAT Notice):** Added dashed-border notice in Step 5 explaining that additional charge amounts are added as-entered with no extra VAT. Charge rows in the preview table now display `(رسوم إضافية — بدون VAT إضافي)` annotation.

3. **FIX-03 (H1 Duplication):** Component `<h1>` changed to `<p role="heading" aria-level="2">` — preserves visual styling while eliminating the duplicate H1.

4. **FIX-04 (Tap Targets):** `.po-btn-sm` padding increased to `.375rem .875rem; min-height:2.75rem` (~44px), meeting WCAG 2.5.5 advisory.

5. **Charge label copy:** Field label updated from `المبلغ (AED)` to `المبلغ (AED) — كما هو، بدون VAT إضافي` for immediate clarity.

### `tests/uaePurchaseOrderGenerator.test.mjs` (New file)

35 focused tests covering:
- All 12 required golden scenarios (A–L)
- Draft save/restore/partial/malformed lifecycle
- React key uniqueness after restore
- Quotation import field mapping
- Invoice handoff `deriveDraftInvoiceNumber()` (all prefix variants)
- Invoice payload preserves vatRateId and discount
- TRN format validation
- Legal classification guards (no cross-contamination between buckets)
- Negative/guard assertions (old LPO bug not reproduced)

---

## TEST RESULTS

### New PO Tests (isolated)
- **Tests:** 35 | **Pass:** 35 | **Fail:** 0 | **Skip:** 0

### Full Test Suite (`npm test`)
- **Tests:** 195 | **Pass:** 195 | **Fail:** 0 | **Skip:** 0

### Umrah Tests (`npm run test:umrah`)
- **Tests:** 5 | **Pass:** 5 | **Fail:** 0

### Production Build (`npm run build`)
- **Status:** ✅ Success
- **Exit Code:** 0
- **Compiled:** 72 static pages, 3 dynamic routes
- **PO Generator page:** `/ar/ae/purchase-order-generator` 12.2 kB (First Load 118 kB)

### Security Audit (`npm audit --omit=dev`)
- **2 vulnerabilities** (1 moderate, 1 high) in `postcss` dependency bundled inside `next`
- **Root cause:** `next@15.5.27` bundles `postcss <=8.5.22` (XSS via `</style>`, source map path traversal)
- **Fix:** `npm audit fix --force` would upgrade to `next@16.4.3` — a **breaking change** not approved for this sprint
- **Impact on this tool:** postcss vulnerabilities are build-time only; they do not affect the runtime UAE Purchase Order Generator functionality
- **Status:** Pre-existing vulnerability, not introduced by Day 5 changes. No action taken per non-negotiable rule 7 (no heavy dependency changes without justification)

---

## REMAINING CONSIDERATIONS

1. **postcss CVE in next bundle:** Upgrade to Next.js 16.x needs a dedicated sprint with regression testing across all 72 pages.
2. **Charges VAT treatment:** If the team wants to support per-charge VAT classification (e.g., shipping as a separate taxable supply), this would require a new line-item-style UI for charges — out of scope for Day 5 per non-negotiable rule 4.
3. **E-invoicing (UAE FTA):** The tool correctly clarifies it produces a browser PDF, not a PEPPOL-formatted e-invoice. If UAE e-invoicing mandate extends to smaller businesses, a dedicated e-invoicing tool will be required.
4. **FTA TRN live lookup:** Currently format-only. Live verification against EmaraTax API would require API access and is a separate feature.

---

*Audit prepared for QEMLO internal review. Not for public distribution as legal advice.*
