/**
 * lib/guides.js — index of all guides under /guides (listing, sitemap, tests). Newest first.
 */
import { GUIDE_CONTENT } from "./guideContent/index.js";

const ZAKAT_FITR = {
  slug: "zakat-al-fitr-2027",
  href: "/guides/zakat-al-fitr-2027",
  country: "sa-ae",
  kicker: "دليل رمضان 1448هـ",
  title: "زكاة الفطر 2027: كم تُخرج، ومتى، وعن مَن؟",
  summary:
    "المقدار في السعودية غير المقدار في الإمارات، وحكم النقد مختلف. القولان بالأرقام، وحساب جاهز لأسرتك.",
  updated: "2026-11-10",
  minutes: 7,
};

export const GUIDES = [
  ...GUIDE_CONTENT.map((g) => ({
    slug: g.slug,
    href: g.href,
    country: g.country,
    kicker: g.kicker,
    title: g.title,
    summary: g.lead,
    updated: g.updated,
    minutes: g.minutes,
  })),
  ZAKAT_FITR,
];
