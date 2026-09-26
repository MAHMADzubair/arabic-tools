const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://arabic-tools-xi.vercel.app";

/** @type {import('next').MetadataRoute.Robots} */
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",          // Block all API routes from crawling
          "/_next/",        // Next.js internal assets
          "/static/",       // Static assets (already served differently)
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
