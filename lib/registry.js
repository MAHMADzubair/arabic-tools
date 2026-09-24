/**
 * ═══════════════════════════════════════════════════════════════
 *  CENTRAL TOOL REGISTRY  —  lib/registry.js
 *  Single source of truth for every tool on the site.
 *
 *  To add a new tool:
 *    1. Add one object to TOOLS below.
 *    2. Done. Homepage, search, counts, related tools all update automatically.
 *
 *  Tool schema:
 *  {
 *    id:        string   — unique kebab-case slug
 *    nameAr:    string   — Arabic display name
 *    nameEn:    string   — English display name (for SEO / en nav)
 *    descAr:    string   — Short Arabic description (shown on cards)
 *    icon:      string   — Emoji icon
 *    category:  string   — Must match a CATEGORIES id
 *    href:      string   — Next.js route  e.g. "/salary-calculator"
 *    status:    "active" | "coming-soon" | "beta"
 *    countries: string[] — ISO-2 country codes, empty = global
 *    featured:  boolean  — Show in hero/featured strip
 *    badge:     string|null — "جديد" | "بيتا" | null
 *  }
 * ═══════════════════════════════════════════════════════════════
 */

// ─── Categories ───────────────────────────────────────────────────────────────

export const CATEGORIES = [
  {
    id: "gulf",
    icon: "🏜️",
    nameAr: "أدوات الخليج",
    nameEn: "Gulf Tools",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    comingSoonDesc: null,
  },
  {
    id: "finance",
    icon: "💰",
    nameAr: "المال والاستثمار",
    nameEn: "Finance",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    comingSoonDesc: null,
  },
  {
    id: "islamic",
    icon: "🌙",
    nameAr: "الأدوات الإسلامية",
    nameEn: "Islamic Tools",
    color: "from-teal-500 to-emerald-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
    comingSoonDesc: null,
  },
  {
    id: "everyday",
    icon: "🌐",
    nameAr: "الحياة اليومية",
    nameEn: "Everyday Tools",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    comingSoonDesc: null,
  },
  {
    id: "business",
    icon: "💼",
    nameAr: "الأعمال",
    nameEn: "Business",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    comingSoonDesc: "أدوات تحليل الأعمال وإدارة المشاريع والميزانيات",
  },
  {
    id: "media",
    icon: "🎬",
    nameAr: "الوسائط",
    nameEn: "Media",
    color: "from-purple-500 to-violet-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    comingSoonDesc: "أدوات تحرير الفيديو والصوت وإدارة المحتوى الرقمي",
  },
  {
    id: "pdf",
    icon: "📄",
    nameAr: "PDF",
    nameEn: "PDF",
    color: "from-red-500 to-rose-600",
    bg: "bg-red-50",
    border: "border-red-200",
    comingSoonDesc: "دمج وتقسيم وضغط وتحويل ملفات PDF بسهولة",
  },
  {
    id: "image",
    icon: "🖼️",
    nameAr: "الصور",
    nameEn: "Image",
    color: "from-pink-500 to-fuchsia-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    comingSoonDesc: "ضغط وتحويل وتعديل الصور بدون برامج",
  },
  {
    id: "text",
    icon: "✍️",
    nameAr: "النصوص",
    nameEn: "Text",
    color: "from-sky-500 to-cyan-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    comingSoonDesc: "عد الكلمات وتنسيق النصوص وترجمتها وتحليلها",
  },
  {
    id: "developer",
    icon: "👨‍💻",
    nameAr: "المطورين",
    nameEn: "Developer",
    color: "from-slate-600 to-gray-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    comingSoonDesc: "أدوات JSON وBase64 والألوان وتوليد الكود",
  },
];

// ─── Tools ────────────────────────────────────────────────────────────────────
// ↓ ADD NEW TOOLS HERE — everything else updates automatically ↓

export const TOOLS = [

  // ── Gulf Tools ──────────────────────────────────────────────────────────────
  {
    id: "salary-calculator",
    nameAr: "حاسبة الراتب الصافي",
    nameEn: "Net Salary Calculator",
    descAr: "احسب صافي راتبك بعد الضرائب والتأمينات لـ 6 دول مع تفصيل كامل للبدلات والخصومات.",
    icon: "💰",
    category: "gulf",
    href: "/salary-calculator",
    status: "active",
    countries: ["sa", "ae", "kw", "qa", "bh", "om", "eg"],
    featured: true,
    badge: null,
  },
  {
    id: "gratuity-calculator",
    nameAr: "حاسبة مكافأة نهاية الخدمة",
    nameEn: "Gratuity Calculator",
    descAr: "احسب مستحقات نهاية الخدمة لـ 7 دول عربية وفق أحدث قوانين العمل مع حالات الاستقالة والفصل والتقاعد.",
    icon: "🎖️",
    category: "gulf",
    href: "/gratuity-calculator",
    status: "active",
    countries: ["sa", "ae", "kw", "qa", "bh", "om", "eg"],
    featured: true,
    badge: null,
  },
  {
    id: "overtime-calculator",
    nameAr: "حاسبة الأوفرتايم",
    nameEn: "Overtime Calculator",
    descAr: "احسب أجر ساعات العمل الإضافي وفق قوانين العمل الخليجية لكل دولة.",
    icon: "⏱️",
    category: "gulf",
    href: "/overtime-calculator",
    status: "active",
    countries: ["sa", "ae", "kw", "qa", "bh", "om"],
    featured: false,
    badge: null,
  },
  {
    id: "vat-calculator",
    nameAr: "حاسبة ضريبة القيمة المضافة",
    nameEn: "VAT Calculator",
    descAr: "احسب الضريبة المضافة (١٥٪ أو ٥٪) أو استخرج السعر الأصلي بدقة.",
    icon: "🧾",
    category: "gulf",
    href: "/vat-calculator",
    status: "active",
    countries: ["sa", "ae"],
    featured: false,
    badge: null,
  },

  // ── Finance ─────────────────────────────────────────────────────────────────
  {
    id: "loan-calculator",
    nameAr: "حاسبة القروض",
    nameEn: "Loan Calculator",
    descAr: "احسب القسط الشهري وإجمالي الفائدة وجدول السداد الكامل لأي قرض.",
    icon: "🏦",
    category: "finance",
    href: "/loan-calculator",
    status: "active",
    countries: [],
    featured: true,
    badge: null,
  },
  {
    id: "mortgage-calculator",
    nameAr: "حاسبة التمويل العقاري",
    nameEn: "Mortgage Calculator",
    descAr: "احسب قسط الرهن العقاري وجدول السداد الكامل مع الدفعة الأولى والتأمين والرسوم.",
    icon: "🏠",
    category: "finance",
    href: "/mortgage-calculator",
    status: "active",
    countries: [],
    featured: false,
    badge: null,
  },
  {
    id: "compound-interest",
    nameAr: "حاسبة الفائدة المركبة",
    nameEn: "Compound Interest Calculator",
    descAr: "اكتشف قوة المضاعفة — احسب نمو استثمارك مع المساهمات الشهرية ومخطط النمو السنوي.",
    icon: "📈",
    category: "finance",
    href: "/compound-interest",
    status: "active",
    countries: [],
    featured: false,
    badge: null,
  },
  {
    id: "roi-calculator",
    nameAr: "حاسبة العائد على الاستثمار (ROI)",
    nameEn: "ROI Calculator",
    descAr: "احسب العائد على الاستثمار وصافي الأرباح ومعدل النمو السنوي المركب ومضاعف رأس المال.",
    icon: "💼",
    category: "finance",
    href: "/roi-calculator",
    status: "active",
    countries: [],
    featured: false,
    badge: null,
  },
  {
    id: "profit-margin-calculator",
    nameAr: "حاسبة هامش الربح والتسعير",
    nameEn: "Profit Margin Calculator",
    descAr: "احسب هامش الربح والمارك اب وسعر البيع لمتجرك مع تكاليف الشحن وعمولات الدفع والإعلانات.",
    icon: "📊",
    category: "finance",
    href: "/profit-margin-calculator",
    status: "active",
    countries: [],
    featured: false,
    badge: null,
  },
  {
    id: "currency-converter",
    nameAr: "محول العملات",
    nameEn: "Currency Converter",
    descAr: "حوّل بين الريال والدرهم والدولار واليورو وأكثر من ١٢ عملة فوراً.",
    icon: "💱",
    category: "finance",
    href: "/currency-converter",
    status: "active",
    countries: [],
    featured: false,
    badge: null,
  },

  // ── Islamic Tools ────────────────────────────────────────────────────────────
  {
    id: "zakat-calculator",
    nameAr: "حاسبة الزكاة",
    nameEn: "Zakat Calculator",
    descAr: "احسب زكاتك بدقة بناءً على نصاب الفضة الحالي مع دعم الأصول والالتزامات.",
    icon: "🕌",
    category: "islamic",
    href: "/zakat-calculator",
    status: "active",
    countries: [],
    featured: true,
    badge: null,
  },
  {
    id: "zakat-al-fitr",
    nameAr: "حاسبة زكاة الفطر",
    nameEn: "Zakat al-Fitr Calculator",
    descAr: "احسب صاع زكاة الفطر بالكيلوجرام (أرز وحبوب) أو نقداً للأسرة.",
    icon: "🌾",
    category: "islamic",
    href: "/zakat-al-fitr",
    status: "active",
    countries: [],
    featured: false,
    badge: null,
  },
  {
    id: "kaffara-calculator",
    nameAr: "حاسبة الكفارات والفدية",
    nameEn: "Kaffara Calculator",
    descAr: "احسب كفارة اليمين وفدية صيام رمضان والنذر عيناً بالأرز أو نقداً.",
    icon: "📜",
    category: "islamic",
    href: "/kaffara-calculator",
    status: "active",
    countries: [],
    featured: false,
    badge: null,
  },
  {
    id: "umrah-calculator",
    nameAr: "حاسبة تكلفة العمرة",
    nameEn: "Umrah Cost Calculator",
    descAr: "قدّر تكلفة رحلة العمرة شاملاً الطيران والفندق والتأشيرة والطعام لأي عدد من المسافرين.",
    icon: "🕋",
    category: "islamic",
    href: "/umrah-calculator",
    status: "active",
    countries: [],
    featured: false,
    badge: null,
  },
  {
    id: "inheritance-calculator",
    nameAr: "حاسبة الميراث",
    nameEn: "Inheritance Calculator",
    descAr: "احسب توزيع التركة بدقة وفق الفرائض والعصبات والعول والرد الشرعي.",
    icon: "⚖️",
    category: "islamic",
    href: "/inheritance-calculator",
    status: "active",
    countries: [],
    featured: false,
    badge: null,
  },

  // ── Everyday Tools ───────────────────────────────────────────────────────────
  {
    id: "hijri-age-calculator",
    nameAr: "حاسبة العمر بالهجري",
    nameEn: "Hijri Age Calculator",
    descAr: "احسب عمرك الدقيق بالهجري والميلادي وفق تقويم أم القرى مع موعد ميلادك القادم.",
    icon: "🌙",
    category: "everyday",
    href: "/hijri-age-calculator",
    status: "active",
    countries: [],
    featured: false,
    badge: null,
  },
  {
    id: "date-converter",
    nameAr: "محول التاريخ الهجري والميلادي",
    nameEn: "Hijri Date Converter",
    descAr: "حوّل بين التاريخين الهجري والميلادي بدقة تقويم أم القرى مع معرفة تاريخ اليوم وأسماء الأيام.",
    icon: "🔄",
    category: "everyday",
    href: "/date-converter",
    status: "active",
    countries: [],
    featured: false,
    badge: null,
  },
  {
    id: "bmi-calculator",
    nameAr: "حاسبة مؤشر كتلة الجسم (BMI)",
    nameEn: "BMI Calculator",
    descAr: "احسب مؤشر كتلة جسمك والوزن المثالي واحتياج السعرات والماء وفق معايير منظمة الصحة العالمية.",
    icon: "⚖️",
    category: "everyday",
    href: "/bmi-calculator",
    status: "active",
    countries: [],
    featured: false,
    badge: null,
  },
  {
    id: "unit-converter",
    nameAr: "محول الوحدات الشامل",
    nameEn: "Unit Converter",
    descAr: "حوّل بين مقاييس الطول والوزن ودرجة الحرارة والمساحة والحجم بين النظامين المتري والإمبراطوري.",
    icon: "📐",
    category: "everyday",
    href: "/unit-converter",
    status: "active",
    countries: [],
    featured: false,
    badge: null,
  },

];

// ─── Helper Functions ─────────────────────────────────────────────────────────

/** All active (live) tools */
export function getActiveTools() {
  return TOOLS.filter((t) => t.status === "active");
}

/** All tools in a category (active only) */
export function getToolsByCategory(categoryId) {
  return TOOLS.filter((t) => t.category === categoryId && t.status === "active");
}

/** Count of active tools */
export function getToolCount() {
  return getActiveTools().length;
}

/** Featured tools across all categories */
export function getFeaturedTools() {
  return TOOLS.filter((t) => t.featured && t.status === "active");
}

/** Tools in same category, excluding self — for Related Tools sections */
export function getRelatedTools(toolId, limit = 4) {
  const tool = TOOLS.find((t) => t.id === toolId);
  if (!tool) return [];
  return TOOLS.filter(
    (t) => t.id !== toolId && t.category === tool.category && t.status === "active"
  ).slice(0, limit);
}

/** Lookup a single tool by its route href */
export function getToolByHref(href) {
  return TOOLS.find((t) => t.href === href) ?? null;
}

/** Lookup a single tool by id */
export function getToolById(id) {
  return TOOLS.find((t) => t.id === id) ?? null;
}

/** Lookup a category by id */
export function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) ?? null;
}

/** Tools filtered by country code */
export function getToolsByCountry(countryCode) {
  return TOOLS.filter(
    (t) => t.status === "active" && t.countries.includes(countryCode)
  );
}

/** Check if a category has any active tools (used to toggle coming-soon) */
export function categoryHasTools(categoryId) {
  return TOOLS.some((t) => t.category === categoryId && t.status === "active");
}

// ─── Countries ────────────────────────────────────────────────────────────────
// GCC + Arab countries for country-specific landing pages (/ar/[country]/)

export const COUNTRIES = {
  sa: {
    code: "sa",
    nameAr: "المملكة العربية السعودية",
    nameEn: "Saudi Arabia",
    flag: "🇸🇦",
    currency: "ريال سعودي (SAR)",
    vatRate: "١٥٪",
    laborLaw: "نظام العمل السعودي",
    color: "from-green-600 to-green-800",
    bg: "bg-green-50",
    border: "border-green-200",
    metaDesc: "أدوات مالية وحاسبات مخصصة للمملكة العربية السعودية — راتب، مكافأة، ضريبة القيمة المضافة وأكثر.",
  },
  ae: {
    code: "ae",
    nameAr: "الإمارات العربية المتحدة",
    nameEn: "UAE",
    flag: "🇦🇪",
    currency: "درهم إماراتي (AED)",
    vatRate: "٥٪",
    laborLaw: "قانون العمل الإماراتي",
    color: "from-red-600 to-red-800",
    bg: "bg-red-50",
    border: "border-red-200",
    metaDesc: "أدوات مالية وحاسبات مخصصة للإمارات العربية المتحدة — راتب، مكافأة، ضريبة القيمة المضافة وأكثر.",
  },
  qa: {
    code: "qa",
    nameAr: "قطر",
    nameEn: "Qatar",
    flag: "🇶🇦",
    currency: "ريال قطري (QAR)",
    vatRate: "لا ضريبة",
    laborLaw: "قانون العمل القطري",
    color: "from-maroon-600 to-purple-900",
    bg: "bg-purple-50",
    border: "border-purple-200",
    metaDesc: "أدوات مالية وحاسبات مخصصة لقطر — راتب، مكافأة نهاية الخدمة، وأكثر.",
  },
  kw: {
    code: "kw",
    nameAr: "الكويت",
    nameEn: "Kuwait",
    flag: "🇰🇼",
    currency: "دينار كويتي (KWD)",
    vatRate: "لا ضريبة",
    laborLaw: "قانون العمل الكويتي",
    color: "from-green-500 to-black",
    bg: "bg-green-50",
    border: "border-green-200",
    metaDesc: "أدوات مالية وحاسبات مخصصة للكويت — راتب، مكافأة نهاية الخدمة، وأكثر.",
  },
  om: {
    code: "om",
    nameAr: "سلطنة عُمان",
    nameEn: "Oman",
    flag: "🇴🇲",
    currency: "ريال عُماني (OMR)",
    vatRate: "٥٪",
    laborLaw: "قانون العمل العُماني",
    color: "from-red-700 to-green-700",
    bg: "bg-red-50",
    border: "border-red-200",
    metaDesc: "أدوات مالية وحاسبات مخصصة لسلطنة عُمان — راتب، مكافأة نهاية الخدمة، وأكثر.",
  },
  bh: {
    code: "bh",
    nameAr: "البحرين",
    nameEn: "Bahrain",
    flag: "🇧🇭",
    currency: "دينار بحريني (BHD)",
    vatRate: "١٠٪",
    laborLaw: "قانون العمل البحريني",
    color: "from-red-500 to-white",
    bg: "bg-red-50",
    border: "border-red-200",
    metaDesc: "أدوات مالية وحاسبات مخصصة للبحرين — راتب، مكافأة نهاية الخدمة، وأكثر.",
  },
};

/** All supported country codes */
export const COUNTRY_CODES = Object.keys(COUNTRIES);

/** Lookup a country by its ISO-2 code */
export function getCountryById(code) {
  return COUNTRIES[code] ?? null;
}

/** All active tools for a given country code */
export function getToolsForCountry(code) {
  return TOOLS.filter(
    (t) => t.status === "active" && (t.countries.includes(code) || t.countries.length === 0)
  );
}

/** Tools explicitly tagged to a country (not global tools) */
export function getCountrySpecificTools(code) {
  return TOOLS.filter(
    (t) => t.status === "active" && t.countries.includes(code)
  );
}
