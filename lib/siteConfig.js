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

export const SITE_NAME = "أدوات عربية";
