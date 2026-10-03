import { SITE_URL } from "@/lib/siteConfig";

const BASE_URL = SITE_URL;

/** @type {import('next').MetadataRoute.Robots} */
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/internal/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
