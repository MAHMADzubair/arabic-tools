/**
 * lib/siteConfig.js
 *
 * Single source of truth for the production domain.
 *
 * To switch to a custom domain, set ONE environment variable:
 *   NEXT_PUBLIC_SITE_URL=https://your-custom-domain.com
 *
 * No other file should hardcode the hostname.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://qemlo.com";

export const SITE_NAME = "Qemlo";

/** Stable canonical @id for the Qemlo Organization entity */
export const SITE_ORG_ID = `${SITE_URL}/#organization`;

/** Stable canonical @id for the Qemlo WebSite entity */
export const SITE_WEBSITE_ID = `${SITE_URL}/#website`;

/** Official global Open Graph / social preview image */
export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/brand/qemlo-og.png`,
  width: 1200,
  height: 630,
  alt: "Qemlo — أدوات وحاسبات رقمية للأفراد والأعمال",
};

