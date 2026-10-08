import { SITE_URL } from "@/lib/siteConfig";

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
    // Saudi Arabia cluster
    "/salary-calculator/saudi",
    "/gratuity-calculator/saudi",
    "/overtime-calculator/saudi",
    "/vat-calculator/saudi",
    // UAE cluster
    "/salary-calculator/uae",
    "/gratuity-calculator/uae",
    "/overtime-calculator/uae",
    "/vat-calculator/uae",
    // Kuwait, Qatar & Egypt
    "/gratuity-calculator/kuwait",
    "/gratuity-calculator/qatar",
    "/gratuity-calculator/egypt",
    "/salary-calculator/egypt",
  ];

  // Saudi /ar/sa/ deep-linked tool pages
  const saudiDeepPages = [
    "/ar/sa/final-settlement-calculator",
    "/ar/sa/annual-leave-calculator",
    "/ar/sa/article-77-calculator",
    "/ar/sa/vat-registration-checker",
    "/ar/sa/e-invoice-generator",
    "/ar/sa/quotation-generator",
  ];

  // UAE /ar/ae/ deep-linked tool pages
  const uaeDeepPages = [
    "/ar/ae/final-settlement-calculator",
    "/ar/ae/notice-period-calculator",
    "/ar/ae/vat-registration-checker",
    "/ar/ae/corporate-tax-calculator",
    "/ar/ae/small-business-relief-checker",
    "/ar/ae/vat-invoice-generator",
    "/ar/ae/e-invoicing-readiness-checker",
    "/ar/ae/quotation-generator",
    "/ar/ae/purchase-order-generator",
  ];

  // Business tool pages
  const businessPages = [
    "/ar/business/ai-sales-closer",
  ];

  const homePage = {
    url: SITE_URL,
    changeFrequency: "weekly",
    priority: 1.0,
  };

  // Country landing pages (/ar/sa, /ar/ae, etc.)
  // Matches generateStaticParams in app/ar/[country]/page.js — codes: sa, ae, qa, kw, om, bh
  const countryPages = ["sa", "ae", "qa", "kw", "om", "bh"].map((code) => ({
    url: `${SITE_URL}/ar/${code}`,
    changeFrequency: "weekly",
    priority: 0.95,
  }));

  const saudiDeepRoutes = saudiDeepPages.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const uaeDeepRoutes = uaeDeepPages.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const countryToolRoutes = countryToolPages.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const toolPages = toolRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const businessRoutes = businessPages.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  // Static / legal / trust pages — lowest crawl priority
  // Note: /disclaimer added 2026-10 (was missing despite having a real page)
  const staticPages = [
    "/about", "/contact", "/privacy", "/terms", "/disclaimer",
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  // Priority order: home → country hubs → Saudi tools → UAE tools
  //   → country tool sub-pages → business → general tools → static
  return [
    homePage,
    ...countryPages,
    ...saudiDeepRoutes,
    ...uaeDeepRoutes,
    ...countryToolRoutes,
    ...businessRoutes,
    ...toolPages,
    ...staticPages,
  ];
}
