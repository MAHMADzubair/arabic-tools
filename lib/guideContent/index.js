/**
 * lib/guideContent/index.js — data-driven guides rendered by app/guides/[slug].
 * Newest first. The bespoke Zakat al-Fitr guide lives at its own static route.
 */
import zatcaWave25 from "./zatca-wave-25.js";
import saudiEndOfService from "./saudi-end-of-service.js";
import saudiOvertime from "./saudi-overtime.js";
import saudiGosi2026 from "./saudi-gosi-2026.js";
import saudiArticle77 from "./saudi-article-77.js";
import saudiVatRegistration from "./saudi-vat-registration.js";
import saudiAnnualLeave from "./saudi-annual-leave.js";
import uaeEinvoicing2027 from "./uae-einvoicing-2027.js";
import uaeSmallBusinessRelief from "./uae-small-business-relief.js";
import uaeGratuity from "./uae-gratuity.js";
import uaeNoticePeriod from "./uae-notice-period.js";

export const GUIDE_CONTENT = [
  zatcaWave25,
  uaeEinvoicing2027,
  saudiEndOfService,
  uaeGratuity,
  saudiOvertime,
  saudiGosi2026,
  uaeSmallBusinessRelief,
  saudiArticle77,
  uaeNoticePeriod,
  saudiVatRegistration,
  saudiAnnualLeave,
];

export function getGuide(slug) {
  return GUIDE_CONTENT.find((g) => g.slug === slug) || null;
}
