/**
 * lib/businessUtils.js
 * Shared utility functions for all business/tax/invoice tools.
 *
 * Rules:
 *  - NO country-specific legal formulas here
 *  - NO VAT rates (SA=15%, UAE=5%) — those live in each component
 *  - NO threshold amounts — those live in each component/checker
 *  - Safe for import in both "use client" components and server modules
 */

// ─── Number formatting ────────────────────────────────────────────────────────

/**
 * Format a number as a currency string with 2 decimal places.
 * @param {number|string} n   - The value to format
 * @param {string}       locale - BCP 47 locale tag, e.g. "ar-SA" or "ar-AE"
 * @returns {string}
 */
export function formatCurrency(n, locale = "ar-AE") {
  return Number(n || 0).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Convenience: format in Saudi Arabic locale (SAR invoices) */
export const formatSAR = (n) => formatCurrency(n, "ar-SA");

/** Convenience: format in UAE Arabic locale (AED invoices) */
export const formatAED = (n) => formatCurrency(n, "ar-AE");

// ─── Safe numeric parsing ─────────────────────────────────────────────────────

/**
 * Parse a user-entered number string safely.
 * Strips commas, rejects NaN and negatives → returns 0 as floor.
 * @param {string|number} v
 * @returns {number}
 */
export function parseNum(v) {
  const n = parseFloat(String(v ?? "").replace(/,/g, ""));
  return isNaN(n) || n < 0 ? 0 : n;
}

/**
 * Parse a positive number; negative values are clamped to 0.
 * Alias for parseNum — use when intent is explicit.
 */
export const safePositive = parseNum;

// ─── VAT line calculation ─────────────────────────────────────────────────────

/**
 * Calculate per-line VAT amounts.
 *
 * @param {object} params
 * @param {string|number} params.qty        - Quantity
 * @param {string|number} params.unitPrice  - Unit price
 * @param {string|number} params.discount   - Discount amount (on whole line, not per unit)
 * @param {number|null}   params.vatRate    - Decimal rate (e.g. 0.05 for 5%, null for exempt/out)
 * @returns {{ gross, taxableBase, vatAmount, lineTotal }}
 */
export function calcLineVat({ qty, unitPrice, discount, vatRate }) {
  const q   = parseNum(qty);
  const p   = parseNum(unitPrice);
  const d   = parseNum(discount);
  const gross       = q * p;
  const taxableBase = Math.max(0, gross - d);
  const vatAmount   = vatRate !== null && vatRate !== undefined ? taxableBase * vatRate : 0;
  const lineTotal   = taxableBase + vatAmount;
  return { gross, taxableBase, discount: d, vatAmount, lineTotal };
}

// ─── Discount validation ──────────────────────────────────────────────────────

/**
 * Returns true when the entered discount exceeds the line gross value.
 * Use to show a UI warning to the user.
 */
export function discountExceedsGross(qty, unitPrice, discount) {
  const gross = parseNum(qty) * parseNum(unitPrice);
  return parseNum(discount) > gross;
}

// ─── TRN / VAT number validation ─────────────────────────────────────────────

/**
 * Validate a Saudi VAT number (TIN).
 * Rule: exactly 15 digits, must start with 3.
 * This is a FORMAT check only — not an official ZATCA verification.
 */
export function isValidSaudiVatNumber(v) {
  return /^3\d{14}$/.test(String(v || "").trim());
}

/**
 * Validate a UAE Tax Registration Number (TRN).
 * Rule: exactly 15 digits (any digits).
 * This is a FORMAT check only — not an official FTA/EmaraTax verification.
 */
export function isValidUaeTrn(v) {
  return /^\d{15}$/.test(String(v || "").trim());
}

// ─── Completeness check helpers ───────────────────────────────────────────────

/**
 * Build a completeness check result object.
 * @param {"ok"|"warning"|"missing"} status
 * @param {string} label - Human-readable field name
 * @param {string|null} [hint] - Extra guidance shown below the label
 */
export function makeCheck(status, label, hint = null) {
  return { status, label, hint };
}

export const checkOk      = (label)       => makeCheck("ok",      label);
export const checkWarn    = (label, hint) => makeCheck("warning", label, hint);
export const checkMissing = (label, hint) => makeCheck("missing", label, hint);

/**
 * Calculate completeness percentage and bar color class.
 * @param {Array<{status:string}>} checks
 * @returns {{ okCount, warnCount, missCount, completePct, barColor }}
 */
export function calcCompleteness(checks) {
  const okCount   = checks.filter((c) => c.status === "ok").length;
  const warnCount = checks.filter((c) => c.status === "warning").length;
  const missCount = checks.filter((c) => c.status === "missing").length;
  const completePct = checks.length > 0 ? Math.round((okCount / checks.length) * 100) : 0;
  const barColor =
    completePct === 100 ? "bg-emerald-500" :
    completePct >= 70   ? "bg-amber-500"   :
                          "bg-rose-500";
  return { okCount, warnCount, missCount, completePct, barColor };
}

// ─── Date formatting ──────────────────────────────────────────────────────────

/**
 * Format an ISO date string for printing/display.
 * Falls back gracefully if value is empty.
 */
export function formatPrintDate(iso, locale = "ar-AE") {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Form style constants ─────────────────────────────────────────────────────
// Exported so all invoice/business components use identical styling.

export const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition";

export const selectCls = inputCls + " cursor-pointer";

export const labelCls = "block text-xs font-bold text-ink-secondary mb-1";

// Step number heading badge (used in multi-step forms)
export const stepBadgeCls =
  "w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0";
