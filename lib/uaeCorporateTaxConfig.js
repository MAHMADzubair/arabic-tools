/**
 * UAE CORPORATE TAX CONFIG & CALCULATION ENGINE
 * Federal Decree-Law No. 47 of 2022
 * Rates effective for financial years starting on/after 1 June 2023:
 *   0% on Taxable Income up to AED 375,000
 *   9% on Taxable Income above AED 375,000
 * Sources: https://tax.gov.ae/en/taxes/corporate.tax.aspx
 */

export const CT_ZERO_RATE_LIMIT            = 375000;
export const CT_STANDARD_RATE             = 0.09;
export const SBR_REVENUE_THRESHOLD        = 3000000;
export const NATURAL_PERSON_TURNOVER_LIMIT = 1000000;

export const FTA_CT_URL          = "https://tax.gov.ae/en/taxes/corporate.tax.aspx";
export const FTA_CT_RATES_URL    = "https://tax.gov.ae/en/faq.aspx?keyword=What+are+the+UAE+CT+rates%3F";
export const FTA_SBR_URL         = "https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.topics.aspx";
export const FTA_NATURAL_URL     = "https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.topics/basis.of.taxation.natural.person.aspx";

export const TAXPAYER_TYPE = {
  STANDARD:       "standard",
  NATURAL_PERSON: "natural_person",
  FREE_ZONE:      "free_zone",
  UNSURE:         "unsure",
};

export const CT_RESULT_STATE = {
  STANDARD:           "standard",
  SBR_ELIGIBLE:       "sbr_eligible",
  SBR_INELIGIBLE:     "sbr_ineligible",
  NATURAL_BELOW:      "natural_below",
  NATURAL_IN_SCOPE:   "natural_in_scope",
  QFZP_REGIME:        "qfzp_regime",
  FREE_ZONE_NOT_QFZP: "free_zone_not_qfzp",
  UNSURE:             "unsure",
};

export function sanitizeNumber(val) {
  if (val === null || val === undefined || val === "") return 0;
  const n = parseFloat(String(val).replace(/,/g, "").trim());
  return isNaN(n) || n < 0 ? 0 : n;
}

export function formatAED(num) {
  return Number(num || 0).toLocaleString("ar-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatAEDInt(num) {
  return Number(num || 0).toLocaleString("ar-AE", { maximumFractionDigits: 0 });
}

export function formatPercent(rate) {
  return (rate * 100).toLocaleString("ar-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Standard 0%/9% split */
export function calcStandardCT(taxableIncome) {
  const ti = Math.max(0, sanitizeNumber(taxableIncome));
  const zeroRatePortion    = Math.min(ti, CT_ZERO_RATE_LIMIT);
  const ninePercentPortion = Math.max(ti - CT_ZERO_RATE_LIMIT, 0);
  const tax                = ninePercentPortion * CT_STANDARD_RATE;
  const effectiveRate      = ti > 0 ? tax / ti : 0;
  return { ti, zeroRatePortion, ninePercentPortion, tax, effectiveRate };
}

/** QFZP split — no AED 375k band on non-qualifying taxable income */
export function calcQfzpCT(qualifyingIncome, nonQualifyingTaxableIncome) {
  const qi   = Math.max(0, sanitizeNumber(qualifyingIncome));
  const nqti = Math.max(0, sanitizeNumber(nonQualifyingTaxableIncome));
  const tax  = nqti * CT_STANDARD_RATE;
  const totalIncome  = qi + nqti;
  const effectiveRate = totalIncome > 0 ? tax / totalIncome : 0;
  return { qi, nqti, tax, totalIncome, effectiveRate };
}

/** Small Business Relief eligibility check */
export function checkSBREligibility({
  isResident,
  currentRevenue,
  priorMaxRevenue,
  isQFZP,
  isMNEAboveThreshold,
}) {
  const reasons = [];
  if (isResident === false)
    reasons.push("المنشأة غير مقيمة لأغراض ضريبة الشركات — شرط الإقامة غير مستوفٍ.");
  if (sanitizeNumber(currentRevenue) > SBR_REVENUE_THRESHOLD)
    reasons.push(`إيرادات الفترة الحالية (${formatAED(currentRevenue)} د.إ) تتجاوز حد ${formatAEDInt(SBR_REVENUE_THRESHOLD)} درهم.`);
  if (sanitizeNumber(priorMaxRevenue) > SBR_REVENUE_THRESHOLD)
    reasons.push(`إيرادات فترة سابقة (${formatAED(priorMaxRevenue)} د.إ) تتجاوز حد ${formatAEDInt(SBR_REVENUE_THRESHOLD)} درهم.`);
  if (isQFZP === true)
    reasons.push("الأشخاص المؤهلون في المناطق الحرة (QFZP) غير مؤهلين لتسهيلات الأعمال الصغيرة.");
  if (isMNEAboveThreshold === true)
    reasons.push("الانتماء لمجموعة متعددة الجنسيات بإيرادات موحدة تتجاوز 3.15 مليار درهم يُخرج المنشأة من نطاق التسهيل.");
  const eligible = reasons.length === 0 && isResident === true;
  return { eligible, reasons };
}
