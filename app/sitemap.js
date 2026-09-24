const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://arabic-tools-xi.vercel.app";

/** @type {import('next').MetadataRoute.Sitemap} */
export default function sitemap() {
  // ── All 18 tool routes ──────────────────────────────────────────────
  const toolRoutes = [
    "/zakat-calculator",
    "/zakat-al-fitr",
    "/kaffara-calculator",
    "/inheritance-calculator",
    "/umrah-calculator",
    "/loan-calculator",
    "/mortgage-calculator",
    "/salary-calculator",
    "/gratuity-calculator",
    "/compound-interest",
    "/profit-margin-calculator",
    "/roi-calculator",
    "/hijri-age-calculator",
    "/date-converter",
    "/bmi-calculator",
    "/unit-converter",
    "/currency-converter",
    "/vat-calculator",
  ];

  const now = new Date();

  // ── Homepage ─────────────────────────────────────────────────────────
  const homePage = {
    url: BASE_URL,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1.0,
  };

  // ── Tool pages ───────────────────────────────────────────────────────
  const toolPages = toolRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // ── Static pages (Trust & Legal) ──────────────────────────────────
  const staticRoutes = ["/about", "/privacy", "/contact", "/terms", "/disclaimer"];
  const staticPages = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [homePage, ...toolPages, ...staticPages];
}
