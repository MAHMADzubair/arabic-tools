/**
 * lib/toolTrust.js
 *
 * Single source of truth for the trust line shown above every indexed tool:
 *   - updated:  last change to the page (generated from git, see scripts/update-page-dates.mjs)
 *   - reviewed: date the owner checked the tool against its official source (manual, below)
 *   - source:   official authority the tool follows
 *   - change:   latest public changelog entry for the tool, if any
 */
import { PAGE_UPDATED } from "./pageDates.generated.js";
import { CHANGELOG } from "./changelog.js";

/**
 * Manual review log. Add a route ONLY after checking the tool's numbers and
 * wording against the official source yourself. Format: "YYYY-MM-DD".
 */
export const MANUAL_REVIEWS = {
  // "/overtime-calculator/saudi": "2026-11-10",
};

const SA_HR = "وزارة الموارد البشرية والتنمية الاجتماعية";
const SA_TAX = "هيئة الزكاة والضريبة والجمارك";
const AE_HR = "وزارة الموارد البشرية والتوطين";
const AE_TAX = "الهيئة الاتحادية للضرائب ووزارة المالية";

const SOURCES = {
  "/ar/sa/final-settlement-calculator": SA_HR,
  "/ar/sa/annual-leave-calculator": SA_HR,
  "/ar/sa/article-77-calculator": SA_HR,
  "/gratuity-calculator/saudi": SA_HR,
  "/overtime-calculator/saudi": SA_HR,
  "/salary-calculator/saudi": "المؤسسة العامة للتأمينات الاجتماعية",
  "/ar/sa/vat-registration-checker": SA_TAX,
  "/ar/sa/zatca-wave-checker": SA_TAX,
  "/ar/sa/e-invoice-generator": SA_TAX,
  "/ar/sa/quotation-generator": SA_TAX,
  "/vat-calculator/saudi": SA_TAX,
  "/ar/ae/final-settlement-calculator": AE_HR,
  "/ar/ae/notice-period-calculator": AE_HR,
  "/gratuity-calculator/uae": AE_HR,
  "/overtime-calculator/uae": AE_HR,
  "/salary-calculator/uae": AE_HR,
  "/ar/ae/vat-registration-checker": AE_TAX,
  "/ar/ae/corporate-tax-calculator": AE_TAX,
  "/ar/ae/small-business-relief-checker": AE_TAX,
  "/ar/ae/e-invoicing-readiness-checker": AE_TAX,
  "/ar/ae/vat-invoice-generator": AE_TAX,
  "/ar/ae/quotation-generator": AE_TAX,
  "/ar/ae/purchase-order-generator": AE_TAX,
  "/vat-calculator/uae": AE_TAX,
  "/gratuity-calculator/egypt": "قانون العمل المصري رقم 14 لسنة 2025",
};

export function getToolTrust(pathname) {
  if (!pathname) return null;
  const route = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const updated = PAGE_UPDATED[route];
  if (!updated) return null;
  const change = CHANGELOG.find((e) => e.href === route) || null;
  return {
    route,
    updated,
    reviewed: MANUAL_REVIEWS[route] || null,
    source: SOURCES[route] || null,
    change,
  };
}
