/**
 * lib/guideContent/index.js — data-driven guides rendered by app/guides/[slug].
 * Newest first. The bespoke Zakat al-Fitr guide lives at its own static route.
 */
import zatcaWave25 from "./zatca-wave-25.js";
import saudiEndOfService from "./saudi-end-of-service.js";
import saudiOvertime from "./saudi-overtime.js";

export const GUIDE_CONTENT = [zatcaWave25, saudiEndOfService, saudiOvertime];

export function getGuide(slug) {
  return GUIDE_CONTENT.find((g) => g.slug === slug) || null;
}
