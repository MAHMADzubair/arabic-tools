const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://arabic-tools-xi.vercel.app";

export default function sitemap() {
  // General tool routes (global scope)
  const toolRoutes = [
    "/zakat-calculator", "/zakat-al-fitr", "/kaffara-calculator",
    "/inheritance-calculator", "/umrah-calculator", "/loan-calculator",
    "/mortgage-calculator", "/salary-calculator", "/gratuity-calculator",
    "/compound-interest", "/profit-margin-calculator", "/roi-calculator",
    "/hijri-age-calculator", "/date-converter", "/bmi-calculator",
    "/unit-converter", "/currency-converter", "/vat-calculator",
    "/overtime-calculator", "/annual-leave-calculator",
  ];

  // Country-specific sub-pages (high SEO priority — country revenue cluster)
  const countryToolPages = [
    // Saudi Arabia cluster (legacy /tool/saudi routes)
    "/salary-calculator/saudi",
    "/gratuity-calculator/saudi",
    "/overtime-calculator/saudi",
    "/vat-calculator/saudi",
    // UAE cluster
    "/salary-calculator/uae",
    "/gratuity-calculator/uae",
    "/overtime-calculator/uae",
    "/vat-calculator/uae",
    // Kuwait, Qatar & Egypt gratuity and salary
    "/gratuity-calculator/kuwait",
    "/gratuity-calculator/qatar",
    "/gratuity-calculator/egypt",
    "/salary-calculator/egypt",
  ];

  // Saudi /ar/sa/ deep-linked tool pages — highest revenue cluster
  const saudiDeepPages = [
    "/ar/sa/final-settlement-calculator",
    "/ar/sa/annual-leave-calculator",
  ];

  const now = new Date();

  const homePage = {
    url: BASE_URL,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1.0,
  };

  // Country landing pages (/ar/sa, /ar/ae, etc.)
  const countryPages = ["sa", "ae", "qa", "kw", "om", "bh"].map((code) => ({
    url: `${BASE_URL}/ar/${code}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.95,
  }));

  // Saudi deep tool pages — between country pages and generic tools in priority
  const saudiDeepRoutes = saudiDeepPages.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  // Country-specific tool pages (e.g. /gratuity-calculator/saudi)
  const countryToolRoutes = countryToolPages.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  // General tools
  const toolPages = toolRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Static / legal pages — lowest crawl priority
  const staticPages = ["/about", "/privacy", "/contact", "/terms", "/disclaimer"].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  // Priority order: home → country landing → Saudi deep tools → country tool routes → general tools → static
  return [
    homePage,
    ...countryPages,
    ...saudiDeepRoutes,
    ...countryToolRoutes,
    ...toolPages,
    ...staticPages,
  ];
}