/**
 * lib/countryBusinessConfig.js
 * Country-specific PRESENTATION config for business/invoice tools.
 *
 * Rules:
 *  ✅ Include: labels, authority names, currency codes, locale strings,
 *              portal URLs, flag emojis, TRN field names
 *  ❌ Exclude: legal formulas, threshold amounts, VAT rate percentages,
 *              registration window rules — those live in each component
 */

export const COUNTRY_BUSINESS_CONFIG = {
  sa: {
    countryCode:    "sa",
    nameAr:         "المملكة العربية السعودية",
    flag:           "🇸🇦",
    currency:       "SAR",
    currencyLabel:  "ريال سعودي",
    locale:         "ar-SA",
    taxAuthorityAr: "هيئة الزكاة والضريبة والجمارك",
    taxAuthorityEn: "ZATCA",
    taxPortalUrl:   "https://zatca.gov.sa",
    trnFieldLabel:  "الرقم الضريبي",         // SA calls it "الرقم الضريبي"
    trnHint:        "15 رقماً يبدأ بـ 3",
    trnPlaceholder: "3XXXXXXXXXXXXXX",
    taxSystemName:  "ZATCA فاتورة",
    eInvoicingUrl:  "https://zatca.gov.sa/ar/E-Invoicing/Pages/default.aspx",
    sourceText:     "هيئة الزكاة والضريبة والجمارك — المملكة العربية السعودية",
  },

  ae: {
    countryCode:    "ae",
    nameAr:         "الإمارات العربية المتحدة",
    flag:           "🇦🇪",
    currency:       "AED",
    currencyLabel:  "درهم إماراتي",
    locale:         "ar-AE",
    taxAuthorityAr: "الهيئة الاتحادية للضرائب",
    taxAuthorityEn: "FTA",
    taxPortalUrl:   "https://tax.gov.ae",
    trnFieldLabel:  "الرقم الضريبي TRN",     // UAE calls it "TRN"
    trnHint:        "15 رقماً (تحقق شكلي فقط)",
    trnPlaceholder: "100XXXXXXXXXXXX",
    taxSystemName:  "EmaraTax",
    eInvoicingUrl:  "https://tax.gov.ae/en/e-invoicing",
    sourceText:     "الهيئة الاتحادية للضرائب (FTA) — دولة الإمارات العربية المتحدة",
  },
};

/** Convenience getter with safe fallback */
export function getCountryBusinessConfig(countryCode) {
  return COUNTRY_BUSINESS_CONFIG[countryCode] ?? COUNTRY_BUSINESS_CONFIG.ae;
}

/** UAE Emirates list — used in seller/buyer emirate dropdowns */
export const EMIRATES = [
  "أبوظبي",
  "دبي",
  "الشارقة",
  "عجمان",
  "أم القيوين",
  "رأس الخيمة",
  "الفجيرة",
];
