const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://arabic-tools-xi.vercel.app";

export default function sitemap() {
  const toolRoutes = [
    "/zakat-calculator", "/zakat-al-fitr", "/kaffara-calculator",
    "/inheritance-calculator", "/umrah-calculator", "/loan-calculator",
    "/mortgage-calculator", "/salary-calculator", "/gratuity-calculator",
    "/compound-interest", "/profit-margin-calculator", "/roi-calculator",
    "/hijri-age-calculator", "/date-converter", "/bmi-calculator",
    "/unit-converter", "/currency-converter", "/vat-calculator",
    "/overtime-calculator",
  ];

  const now = new Date();

  const homePage = { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 };

  const countryPages = ["sa","ae","qa","kw","om","bh"].map((code) => ({
    url: `${BASE_URL}/ar/${code}/`,
    lastModified: now, changeFrequency: "weekly", priority: 0.9,
  }));

  const toolPages = toolRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.8,
  }));

  const staticPages = ["/about","/privacy","/contact","/terms","/disclaimer"].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.5,
  }));

  return [homePage, ...countryPages, ...toolPages, ...staticPages];
}