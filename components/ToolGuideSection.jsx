"use client";

/**
 * components/ToolGuideSection.jsx
 * Qemlo style: shared guide section (about, sources, steps, example,
 * test cases, FAQ, related tools).
 * allTools, the curated lists, TARGETED_GULF_ROUTES, props, state and both
 * JSON-LD blocks are unchanged.
 * Changes: local styling (glossy orange tiles, 26px cards, 16px controls),
 * SVG icons, 48px FAQ buttons with aria-controls (answers stay in the DOM via
 * `hidden` for SEO), print shows every answer, mobile-first layout.
 */
import React, { useState } from "react";
import { SITE_URL, SITE_ORG_ID } from "@/lib/siteConfig";

const allTools = [
  { href: "/zakat-calculator", title: "حاسبة الزكاة", desc: "احسب زكاتك بدقة بناءً على نصاب الفضة الحالي مع دعم الأصول والالتزامات." },
  { href: "/inheritance-calculator", title: "حاسبة الميراث الشرعية", desc: "احسب توزيع التركة الشرعية بدقة وفق الفرائض والعصبات والعول والرد." },
  { href: "/loan-calculator", title: "حاسبة القروض والتمويل", desc: "احسب القسط الشهري وإجمالي الفائدة وجدول السداد الكامل لأي قرض أو تمويل." },
  { href: "/currency-converter", title: "محول العملات الفوري", desc: "حوّل بين الريال والدرهم والدولار واليورو وأكثر من ١٢ عملة بأسعار محدثة." },
  { href: "/vat-calculator", title: "حاسبة ضريبة القيمة المضافة", desc: "احسب الضريبة المضافة (١٥٪ أو ٥٪) أو استخرج السعر الأصلي بسهولة." },
  { href: "/zakat-al-fitr", title: "حاسبة زكاة الفطر", desc: "احسب صاع زكاة الفطر بالكيلوجرام (أرز وحبوب) أو نقداً لجميع أفراد الأسرة." },
  { href: "/kaffara-calculator", title: "حاسبة الكفارات والفدية", desc: "احسب كفارة اليمين وفدية صيام رمضان والنذر عيناً بالأرز أو نقداً." },
  { href: "/umrah-calculator", title: "حاسبة تكلفة العمرة", desc: "قدّر تكلفة رحلتك للعمرة شاملاً الطيران والفندق والتأشيرة والطعام لأي عدد من المسافرين." },
  { href: "/salary-calculator", title: "حاسبة الراتب الصافي", desc: "احسب صافي راتبك بعد الضرائب والتأمينات لـ 6 دول مع تفصيل كامل للبدلات والخصومات." },
  { href: "/salary-calculator/saudi", title: "حاسبة الراتب الصافي في السعودية", desc: "احسب صافي راتبك الشهري في المملكة العربية السعودية بعد استقطاع التأمينات (GOSI) وساند." },
  { href: "/salary-calculator/uae", title: "حاسبة الراتب في الإمارات", desc: "احسب صافي راتبك الشهري بالدرهم الإماراتي مع توضيح رسوم التأمين ضد التعطل (ILOE)." },
  { href: "/mortgage-calculator", title: "حاسبة التمويل العقاري", desc: "احسب قسط الرهن العقاري وجدول السداد الكامل مع الدفعة الأولى والتأمين والرسوم." },
  { href: "/compound-interest", title: "حاسبة الفائدة المركبة", desc: "احسب نمو استثمارك مع الفائدة المركبة والمساهمات الشهرية مع مخطط النمو السنوي." },
  { href: "/gratuity-calculator", title: "حاسبة مكافأة نهاية الخدمة", desc: "احسب مكافأة نهاية الخدمة القانونية لـ 7 دول عربية وفق أحدث قوانين العمل ومواد الاستقالة والفصل." },
  { href: "/gratuity-calculator/saudi", title: "حاسبة مكافأة نهاية الخدمة في السعودية", desc: "احسب مكافأة نهاية الخدمة لموظفي القطاع الخاص في السعودية وفق المادتين (84 و85) من نظام العمل." },
  { href: "/gratuity-calculator/uae", title: "حاسبة مكافأة نهاية الخدمة في الإمارات", desc: "احسب مكافأة نهاية الخدمة في الإمارات وفق المادة (51) من قانون العمل الاتحادي 33 لسنة 2021." },
  { href: "/ar/sa/final-settlement-calculator", title: "حاسبة المخالصة النهائية بالسعودية", desc: "تصفية كاملة لمستحقات العامل: نهاية الخدمة، آخر راتب، رصيد الإجازات، ومهلة الإشعار مع نموذج مخالصة قابل للطباعة." },
  { href: "/ar/sa/vat-registration-checker", title: "حاسبة أهلية ضريبة القيمة المضافة بالسعودية", desc: "تحقق من التزامك بالتسجيل الإلزامي (375 ألف ريال) أو الاختياري (187.5 ألف) وفق معايير ZATCA." },
  { href: "/ar/sa/e-invoice-generator", title: "مولد الفاتورة الإلكترونية السعودية", desc: "أنشئ نموذج فاتورة إلكترونية سعودية قابل للطباعة: فاتورة ضريبية B2B وفاتورة مبسطة B2C مع احتساب VAT 15%." },
  { href: "/hijri-age-calculator", title: "حاسبة العمر بالهجري", desc: "احسب عمرك الدقيق بالهجري والميلادي وفق تقويم أم القرى مع موعد يوم ميلادك القادم وإحصائيات حياتك." },
  { href: "/date-converter", title: "محول التاريخ الهجري والميلادي", desc: "حوّل بين التاريخين الهجري والميلادي بدقة تقويم أم القرى مع معرفة تاريخ اليوم والمناسبات الإسلامية." },
  { href: "/bmi-calculator", title: "حاسبة مؤشر كتلة الجسم (BMI)", desc: "احسب كتلة جسمك والوزن المثالي واحتياج السعرات اليومية والماء وفق معايير منظمة الصحة العالمية." },
  { href: "/profit-margin-calculator", title: "حاسبة هامش الربح والتسعير", desc: "احسب هامش الربح والمارك اب وسعر البيع الأمثل لمتجرك مع تكاليف الشحن وعمولات الدفع والإعلانات." },
  { href: "/roi-calculator", title: "حاسبة العائد على الاستثمار (ROI)", desc: "احسب العائد على الاستثمار ومعدل النمو السنوي المركب (CAGR) ومضاعف رأس المال للمشاريع والعقارات." },
  { href: "/unit-converter", title: "محول الوحدات الشامل", desc: "حوّل بين مقاييس الطول والوزن ودرجة الحرارة والمساحة والحجم بين النظامين المتري والإمبراطوري." },
  { href: "/overtime-calculator/saudi", title: "حاسبة العمل الإضافي في السعودية", desc: "احسب أجر العمل الإضافي في السعودية وفق المادة (107): أجر الساعة الفعلي + 50% من أجر الساعة الأساسي." },
  { href: "/overtime-calculator/uae", title: "حاسبة العمل الإضافي في الإمارات", desc: "احسب أجر ساعات العمل الإضافي في الإمارات وفق المادة (19): 125% نهاراً و150% ليلاً والعطلات." },
];

// Curated contextual internal linking clusters for Gulf payroll / labour calculators
const saudiCuratedTools = [
  { href: "/salary-calculator/saudi", title: "حاسبة الراتب الصافي في السعودية", desc: "احسب صافي راتبك الشهري في المملكة العربية السعودية بعد استقطاع التأمينات (GOSI) وساند." },
  { href: "/gratuity-calculator/saudi", title: "حاسبة مكافأة نهاية الخدمة في السعودية", desc: "احسب مكافأة نهاية الخدمة لموظفي القطاع الخاص في السعودية وفق المادتين (84 و85) من نظام العمل." },
  { href: "/overtime-calculator/saudi", title: "حاسبة العمل الإضافي في السعودية", desc: "احسب أجر العمل الإضافي في السعودية وفق المادة (107): أجر الساعة الفعلي + 50% من أجر الساعة الأساسي." },
  { href: "/ar/sa/final-settlement-calculator", title: "حاسبة المخالصة النهائية بالسعودية", desc: "تصفية كاملة لمستحقات العامل: نهاية الخدمة، آخر راتب، رصيد الإجازات، ومهلة الإشعار مع نموذج مخالصة قابل للطباعة." },
  { href: "/ar/sa/annual-leave-calculator", title: "حاسبة بدل الإجازات السنوية بالسعودية", desc: "احسب رصيد إجازتك السنوية وأجر أيام الإجازة والتعويض النقدي عن رصيد الإجازات غير المستنفدة بموجب نظام العمل." },
  { href: "/ar/sa/article-77-calculator", title: "حاسبة تعويض المادة 77 (إنهاء العقد)", desc: "احسب التعويض المالي لإنهاء عقد العمل لسبب غير مشروع بموجب المادة (77) من نظام العمل السعودي." },
];

const uaeCuratedTools = [
  { href: "/salary-calculator/uae", title: "حاسبة الراتب في الإمارات", desc: "احسب صافي راتبك الشهري بالدرهم الإماراتي مع تفصيل الراتب الأساسي والبدلات ورسوم التأمين ضد التعطل (ILOE)." },
  { href: "/gratuity-calculator/uae", title: "حاسبة مكافأة نهاية الخدمة في الإمارات", desc: "احسب مكافأة نهاية الخدمة في الإمارات وفق المادة (51) من قانون العمل الاتحادي 33 لسنة 2021 دون أي خصم للاستقالة." },
  { href: "/overtime-calculator/uae", title: "حاسبة العمل الإضافي في الإمارات", desc: "احسب أجر ساعات العمل الإضافي في الإمارات وفق المادة (19): 125% نهاراً و150% ليلاً والعطلات." },
  { href: "/ar/ae/final-settlement-calculator", title: "حاسبة المخالصة النهائية في الإمارات", desc: "تصفية شاملة لجميع مستحقات العامل في الإمارات: مكافأة نهاية الخدمة، آخر راتب، رصيد الإجازات، وبدل الإنذار مع نموذج قابل للطباعة." },
  { href: "/ar/ae/notice-period-calculator", title: "حاسبة فترة الإنذار وبدل الإشعار", desc: "احسب مدة الإنذار وتاريخ آخر يوم عمل والأيام غير المنفذة وبدل الإنذار التقديري وفق المادة (43) من قانون العمل الإماراتي." },
];

// Topic clusters: every page links to its own topic instead of one generic list.
// Pages that rank (zakat-al-fitr, kaffara, inheritance) feed the pages that earn
// (ZATCA wave checker) and the seasonal guide, and vice versa.
const T = Object.fromEntries(allTools.map((t) => [t.href, t]));
const EXTRA = {
  "/guides/zakat-al-fitr-2027": { href: "/guides/zakat-al-fitr-2027", title: "دليل زكاة الفطر 1448هـ / 2027", desc: "مقدارها ووقتها وقيمتها النقدية في كل دولة، بإجابات مختصرة ومصادر رسمية." },
  "/ar/sa/zatca-wave-checker": { href: "/ar/sa/zatca-wave-checker", title: "هل منشأتك في الموجة 25 من الفوترة الإلكترونية؟", desc: "تحقق خلال دقيقة إن كان يلزمك الربط مع منصة فاتورة قبل 1 فبراير 2027." },
  "/ar/sa/annual-leave-calculator": { href: "/ar/sa/annual-leave-calculator", title: "حاسبة بدل الإجازات السنوية بالسعودية", desc: "احسب رصيد إجازتك وبدلها النقدي وفق المادة 109 و111 من نظام العمل." },
  "/ar/sa/article-77-calculator": { href: "/ar/sa/article-77-calculator", title: "حاسبة تعويض المادة 77", desc: "احسب التعويض عند إنهاء العقد لسبب غير مشروع في السعودية." },
  "/ar/sa/quotation-generator": { href: "/ar/sa/quotation-generator", title: "مولد عرض السعر في السعودية", desc: "أنشئ عرض سعر احترافي بضريبة 15% وحمّله PDF مجاناً." },
  "/annual-leave-calculator": { href: "/annual-leave-calculator", title: "حاسبة الإجازة السنوية للدول العربية", desc: "احسب بدل الإجازة السنوية في السعودية والإمارات ومصر وغيرها." },
  "/ar/ae/vat-registration-checker": { href: "/ar/ae/vat-registration-checker", title: "التسجيل في ضريبة القيمة المضافة الإمارات", desc: "تحقق من حد 375,000 درهم للتسجيل الإلزامي و187,500 للاختياري." },
  "/ar/ae/corporate-tax-calculator": { href: "/ar/ae/corporate-tax-calculator", title: "حاسبة ضريبة الشركات الإمارات", desc: "احسب ضريبة الشركات 9% فوق 375,000 درهم مع حالات الإعفاء." },
  "/ar/ae/vat-invoice-generator": { href: "/ar/ae/vat-invoice-generator", title: "مولد الفاتورة الضريبية الإمارات", desc: "أنشئ فاتورة ضريبية 5% متوافقة مع الهيئة الاتحادية للضرائب." },
};
Object.assign(EXTRA, {
  "/vat-calculator/uae": { href: "/vat-calculator/uae", title: "حاسبة ضريبة القيمة المضافة الإمارات 5%", desc: "أضف ضريبة 5% أو استخرجها من السعر الشامل بالدرهم." },
  "/overtime-calculator": { href: "/overtime-calculator", title: "حاسبة العمل الإضافي (الأوفر تايم)", desc: "احسب أجر الساعات الإضافية في السعودية والإمارات والكويت وقطر ومصر." },
});
const pick = (...hrefs) =>
  hrefs.map((h) => {
    const tool = T[h] || EXTRA[h];
    if (!tool) throw new Error(`ToolGuideSection cluster: unknown route ${h}`);
    return tool;
  });

const islamicCluster = pick("/zakat-al-fitr", "/guides/zakat-al-fitr-2027", "/zakat-calculator", "/kaffara-calculator", "/inheritance-calculator", "/umrah-calculator", "/hijri-age-calculator");
const saudiTaxCluster = pick("/ar/sa/zatca-wave-checker", "/vat-calculator", "/ar/sa/vat-registration-checker", "/ar/sa/e-invoice-generator", "/ar/sa/quotation-generator", "/profit-margin-calculator");
const uaeTaxCluster = pick("/vat-calculator/uae", "/ar/ae/vat-registration-checker", "/ar/ae/corporate-tax-calculator", "/ar/ae/vat-invoice-generator", "/profit-margin-calculator", "/salary-calculator/uae");
const financeCluster = pick("/loan-calculator", "/mortgage-calculator", "/compound-interest", "/roi-calculator", "/profit-margin-calculator", "/currency-converter", "/zakat-calculator");
const everydayCluster = pick("/unit-converter", "/bmi-calculator", "/currency-converter", "/date-converter", "/hijri-age-calculator", "/umrah-calculator");
const labourCluster = pick("/ar/sa/final-settlement-calculator", "/salary-calculator", "/gratuity-calculator", "/overtime-calculator", "/annual-leave-calculator", "/ar/sa/article-77-calculator");

export const TARGETED_GULF_ROUTES = {
  "/zakat-al-fitr": islamicCluster,
  "/zakat-calculator": islamicCluster,
  "/kaffara-calculator": islamicCluster,
  "/inheritance-calculator": islamicCluster,
  "/hijri-age-calculator": islamicCluster,
  "/vat-calculator": saudiTaxCluster,
  "/vat-calculator/saudi": saudiTaxCluster,
  "/profit-margin-calculator": saudiTaxCluster,
  "/vat-calculator/uae": uaeTaxCluster,
  "/loan-calculator": financeCluster,
  "/mortgage-calculator": financeCluster,
  "/compound-interest": financeCluster,
  "/roi-calculator": financeCluster,
  "/currency-converter": everydayCluster,
  "/unit-converter": everydayCluster,
  "/bmi-calculator": everydayCluster,
  "/date-converter": everydayCluster,
  "/salary-calculator": labourCluster,
  "/salary-calculator/egypt": labourCluster,
  "/gratuity-calculator": labourCluster,
  "/gratuity-calculator/egypt": labourCluster,
  "/gratuity-calculator/kuwait": labourCluster,
  "/gratuity-calculator/qatar": labourCluster,
  "/overtime-calculator": labourCluster,
  "/salary-calculator/saudi": saudiCuratedTools,
  "/gratuity-calculator/saudi": saudiCuratedTools,
  "/overtime-calculator/saudi": saudiCuratedTools,
  "/salary-calculator/uae": uaeCuratedTools,
  "/gratuity-calculator/uae": uaeCuratedTools,
  "/overtime-calculator/uae": uaeCuratedTools,
};

// ─── Icons ───────────────────────────────────────────────────────────────────
const ICONS = {
  book: (
    <>
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15Z" />
      <path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3M9 7.5h6" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16M7 20h10M5 7h14" />
      <path d="m5 7-3 6a3 3 0 0 0 6 0L5 7ZM19 7l-3 6a3 3 0 0 0 6 0l-3-6Z" />
    </>
  ),
  list: <path d="M9 6.5h11M9 12h11M9 17.5h11M4 6.5h.01M4 12h.01M4 17.5h.01" />,
  calc: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="3" />
      <path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  help: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.6a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.8M12 16.8h.01" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="2" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="2" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 2.8 19.5h18.4L12 4Z" />
      <path d="M12 10v4.5M12 17.5h.01" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  arrow: <path d="M19 12H5m6-6-6 6 6 6" />,
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  );
}

function Head({ icon, id, title, sub, tag }) {
  return (
    <header className="tg-head">
      <span className="tg-tile"><Icon name={icon} size={22} /></span>
      <div className="tg-head-text">
        {tag ? <p className="tg-tag">{tag}</p> : null}
        <h2 id={id} className="tg-h2">{title}</h2>
        {sub ? <p className="tg-text">{sub}</p> : null}
      </div>
    </header>
  );
}

export default function ToolGuideSection({
  currentPath,
  aboutTitle,
  aboutContent,
  stepsTitle,
  steps,
  example,
  faqs,
  lastUpdated,
  legalSources,
  testCases,
  disclaimerNotice,
}) {
  const [openFaq, setOpenFaq] = useState(0);

  const curatedList = TARGETED_GULF_ROUTES[currentPath];
  const relatedTools = curatedList
    ? curatedList.filter((tool) => tool.href !== currentPath)
    : allTools.filter((tool) => tool.href !== currentPath);
  const currentTool = (curatedList || allTools).find((tool) => tool.href === currentPath) || allTools.find((tool) => tool.href === currentPath);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  // Finance tools: salary, gratuity, VAT, leave, settlement, tax, loan, etc.
  // All others (religious, converters, BMI, generators): UtilitiesApplication.
  const FINANCE_PATHS = new Set([
    "/salary-calculator", "/salary-calculator/saudi", "/salary-calculator/uae",
    "/salary-calculator/egypt", "/salary-calculator/kuwait", "/salary-calculator/qatar",
    "/gratuity-calculator", "/gratuity-calculator/saudi", "/gratuity-calculator/uae",
    "/gratuity-calculator/kuwait", "/gratuity-calculator/qatar", "/gratuity-calculator/egypt",
    "/vat-calculator", "/vat-calculator/saudi", "/vat-calculator/uae",
    "/overtime-calculator", "/overtime-calculator/saudi", "/overtime-calculator/uae",
    "/ar/sa/final-settlement-calculator", "/ar/ae/final-settlement-calculator",
    "/ar/sa/annual-leave-calculator", "/annual-leave-calculator",
    "/ar/sa/article-77-calculator",
    "/loan-calculator", "/mortgage-calculator", "/compound-interest",
    "/profit-margin-calculator", "/roi-calculator",
    "/ar/ae/notice-period-calculator", "/ar/ae/corporate-tax-calculator",
    "/ar/ae/small-business-relief-checker", "/ar/ae/vat-registration-checker",
    "/ar/sa/vat-registration-checker",
  ]);

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: currentTool ? currentTool.title : aboutTitle,
    description: currentTool ? currentTool.desc : aboutTitle,
    url: `${SITE_URL}${currentPath}`,
    inLanguage: "ar",
    applicationCategory: FINANCE_PATHS.has(currentPath) ? "FinanceApplication" : "UtilitiesApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    publisher: { "@id": SITE_ORG_ID },
  };
  // Note: no offers, ratings, or reviews — free tool, no commercial transaction.

  return (
    <div className="tg-root" dir="rtl">
      <GuideStyles />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />

      {/* 1. About */}
      <section className="tg-section" aria-labelledby="tg-about">
        <Head
          icon="book"
          id="tg-about"
          title={aboutTitle}
          tag={lastUpdated ? `آخر مراجعة للمحتوى: ${lastUpdated}` : null}
        />

        <div className="tg-card">
          {disclaimerNotice && (
            <aside className="tg-notice">
              <span className="tg-notice-ic"><Icon name="alert" size={20} /></span>
              <div>
                <p className="tg-notice-title">{disclaimerNotice.title || "تنبيه فقهي ونظامي هام:"}</p>
                <p className="tg-text">{disclaimerNotice.text}</p>
              </div>
            </aside>
          )}

          <div className="tg-prose">
            {aboutContent.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {legalSources && legalSources.length > 0 && (
            <div className="tg-block">
              <h3 className="tg-h3"><Icon name="scale" size={18} /> السند النظامي والمرجعي</h3>
              <div className="tg-grid2">
                {legalSources.map((ls, idx) => (
                  <article key={idx} className="tg-box">
                    <div className="tg-box-top">
                      <span className="tg-chip">{ls.authority || ls.country}</span>
                      {ls.date && <span className="tg-small">{ls.date}</span>}
                    </div>
                    <h4 className="tg-h4">{ls.lawName}</h4>
                    <p className="tg-text">{ls.details}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {steps && steps.length > 0 && (
            <div className="tg-block">
              <h3 className="tg-h3"><Icon name="list" size={18} /> {stepsTitle || "كيفية استخدام الأداة خطوة بخطوة"}</h3>
              <ol className="tg-grid2 tg-steps">
                {steps.map((s, i) => (
                  <li key={i} className="tg-box tg-step">
                    <span className="tg-num" aria-hidden="true">{i + 1}</span>
                    <div>
                      <h4 className="tg-h4">{s.title}</h4>
                      <p className="tg-text">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {example && (
            <div className="tg-block">
              <section className="tg-example" aria-labelledby="tg-ex">
                <h3 id="tg-ex" className="tg-h3"><Icon name="calc" size={18} /> {example.title || "مثال تطبيقي عملي بالأرقام"}</h3>
                <p className="tg-strong">{example.scenario}</p>
                <dl className="tg-calc">
                  {example.calculation.map((step, idx) => (
                    <div key={idx} className="tg-calc-row">
                      <dt>{step.label}</dt>
                      <dd>{step.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="tg-result">{example.result}</p>
              </section>
            </div>
          )}
        </div>
      </section>

      {/* Test cases */}
      {testCases && testCases.length > 0 && (
        <section className="tg-section" aria-labelledby="tg-tests">
          <Head
            icon="check"
            id="tg-tests"
            title="أمثلة تطبيقية بالأرقام (Test Cases)"
            sub="مسائل نظامية تم حلها يدوياً لتوضيح طريقة الحساب. النتائج تقديرية حسب المدخلات."
          />

          <div className="tg-grid2">
            {testCases.map((tc, idx) => (
              <article key={idx} className="tg-card tg-case">
                <div className="tg-box-top">
                  <span className="tg-tag">{tc.tag || `حالة ${idx + 1}`}</span>
                  <span className="tg-small">نتيجة تقديرية</span>
                </div>
                <h3 className="tg-h4">{tc.title}</h3>
                <p className="tg-text">{tc.scenario}</p>
                <dl className="tg-calc">
                  {tc.steps.map((st, sIdx) => (
                    <div key={sIdx} className="tg-calc-row">
                      <dt>{st.label}</dt>
                      <dd>{st.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="tg-result">{tc.verifiedResult}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 2. FAQ */}
      <section className="tg-section" aria-labelledby="tg-faq">
        <Head icon="help" id="tg-faq" title="الأسئلة الأكثر تكراراً (FAQ)" sub="إجابات على أبرز الاستفسارات المتكررة" />

        <div className="tg-faq">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`tg-faq-item${isOpen ? " is-open" : ""}`}>
                <h3 className="tg-faq-q">
                  <button
                    type="button"
                    id={`tg-q${idx}`}
                    aria-expanded={isOpen}
                    aria-controls={`tg-a${idx}`}
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  >
                    <span>{faq.question}</span>
                    <span className="tg-sign" aria-hidden="true">
                      <Icon name={isOpen ? "minus" : "plus"} size={16} />
                    </span>
                  </button>
                </h3>
                {/* Always in DOM for SEO; hidden when collapsed */}
                <div id={`tg-a${idx}`} role="region" aria-labelledby={`tg-q${idx}`} hidden={!isOpen} className="tg-faq-a">
                  <p className="tg-text">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Related tools */}
      <nav className="tg-section tg-last" aria-labelledby="tg-related">
        <Head
          icon="grid"
          id="tg-related"
          title="أدوات عربية ذات صلة"
          sub="استكشف باقي حاسباتنا المجانية المصممة لتسهيل حساباتك اليومية"
        />

        <ul className="tg-grid3">
          {relatedTools.map((tool) => (
            <li key={tool.href}>
              <a href={tool.href} className="tg-tool">
                <span className="tg-tool-title">{tool.title}</span>
                <span className="tg-text">{tool.desc}</span>
                <span className="tg-tool-cta">
                  <span>جرّب الأداة الآن</span>
                  <Icon name="arrow" size={16} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/**
 * Local styles. Your global tokens win (--ink/--text, --surface, --line/--border,
 * --signal/--orange); the fallbacks keep the section standalone.
 */
function GuideStyles() {
  return (
    <style>{`
      .tg-root{
        --k-bg:var(--bg,#F5F5F2);
        --k-sf:var(--surface,#FFFFFF);
        --k-ink:var(--ink,var(--text,#0D0D0D));
        --k-mu:var(--ink-soft,var(--text-3,#4A4A46));
        --k-ln:var(--line,var(--border,#D9D9D3));
        --k-on-ink:var(--on-ink,#FFFFFF);
        --k-g1:#FF9B63; --k-g2:var(--signal,var(--orange,#FF6A1A)); --k-g3:#EE5A0B;
        --k-gloss:linear-gradient(160deg,var(--k-g1) 0%,var(--k-g2) 55%,var(--k-g3) 100%);
        max-width:64rem; margin:3rem auto 0; padding:0 1rem 2rem;
        color:var(--k-ink); font-family:inherit;
        display:grid; gap:3rem;
      }
      @media (min-width:640px){ .tg-root{ margin-top:4.5rem; gap:4rem; } }
      @media (prefers-color-scheme: dark){
        :root:not([data-theme="light"]) .tg-root{
          --k-bg:var(--bg,#0D0D0D); --k-sf:var(--surface,#181816); --k-ink:var(--ink,var(--text,#F5F5F2));
          --k-mu:var(--ink-soft,var(--text-3,#B4B4AD)); --k-ln:var(--line,var(--border,#34342F)); --k-on-ink:var(--on-ink,#0D0D0D);
        }
      }
      :root[data-theme="dark"] .tg-root{
        --k-bg:var(--bg,#0D0D0D); --k-sf:var(--surface,#181816); --k-ink:var(--ink,var(--text,#F5F5F2));
        --k-mu:var(--ink-soft,var(--text-3,#B4B4AD)); --k-ln:var(--line,var(--border,#34342F)); --k-on-ink:var(--on-ink,#0D0D0D);
      }
      .tg-root *,.tg-root *::before,.tg-root *::after{ box-sizing:border-box; }
      .tg-root :focus-visible{ outline:3px solid var(--k-ink); outline-offset:2px; }

      .tg-section{ display:grid; gap:1.25rem; min-width:0; }
      .tg-last{ padding-bottom:1rem; }

      /* Section head */
      .tg-head{ display:flex; align-items:center; gap:.85rem; }
      .tg-head-text{ min-width:0; display:grid; gap:.3rem; justify-items:start; }
      .tg-tile{
        flex:none; display:inline-grid; place-items:center; width:46px; height:46px;
        color:#0D0D0D; background:var(--k-gloss); border-radius:15px;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -2px 0 rgba(0,0,0,.12),0 4px 10px -4px rgba(238,90,11,.55);
      }
      .tg-h2{ margin:0; font-size:clamp(1.2rem,4.4vw,1.7rem); font-weight:800; line-height:1.4; overflow-wrap:anywhere; }
      .tg-h3{ margin:0; display:flex; align-items:center; gap:.5rem; font-size:1.02rem; font-weight:800; line-height:1.5; }
      .tg-h3 svg{ flex:none; }
      .tg-h4{ margin:0; font-size:.95rem; font-weight:800; line-height:1.6; overflow-wrap:anywhere; }
      .tg-text{ margin:0; font-size:.9rem; line-height:1.85; color:var(--k-mu); overflow-wrap:anywhere; }
      .tg-small{ font-size:.78rem; color:var(--k-mu); }
      .tg-strong{ margin:0; font-size:.9rem; font-weight:700; line-height:1.8; overflow-wrap:anywhere; }

      .tg-tag{
        display:inline-block; margin:0; padding:.2rem .8rem; font-size:.78rem; font-weight:700;
        color:var(--k-ink); background:var(--k-sf); border:1px solid var(--k-ln); border-radius:999px;
      }
      .tg-chip{
        display:inline-block; padding:.15rem .6rem; font-size:.78rem; font-weight:800;
        color:var(--k-on-ink); background:var(--k-ink); border-radius:9px;
      }

      /* Cards */
      .tg-card{
        display:grid; gap:1.5rem; align-content:start; min-width:0; padding:1.1rem;
        background:var(--k-sf); border:1px solid var(--k-ln); border-radius:26px;
      }
      @media (min-width:640px){ .tg-card{ padding:1.75rem; } }
      .tg-case{ padding:1.1rem; gap:.8rem; }
      @media (min-width:640px){ .tg-case{ padding:1.25rem; } }
      .tg-box{
        display:grid; gap:.4rem; align-content:start; min-width:0; padding:1rem;
        background:var(--k-bg); border:1px solid var(--k-ln); border-radius:18px;
      }
      .tg-box-top{ display:flex; justify-content:space-between; align-items:center; gap:.5rem; flex-wrap:wrap; }
      .tg-block{ display:grid; gap:1rem; padding-top:1.5rem; border-top:1px dashed var(--k-ln); }
      .tg-grid2{ display:grid; gap:.75rem; grid-template-columns:minmax(0,1fr); margin:0; padding:0; list-style:none; }
      @media (min-width:640px){ .tg-grid2{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
      .tg-grid3{ display:grid; gap:.75rem; grid-template-columns:minmax(0,1fr); margin:0; padding:0; list-style:none; }
      @media (min-width:640px){ .tg-grid3{ grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; } }
      @media (min-width:900px){ .tg-grid3{ grid-template-columns:repeat(3,minmax(0,1fr)); } }

      .tg-prose{ display:grid; gap:1rem; }
      .tg-prose p{ margin:0; max-width:70ch; font-size:.97rem; line-height:2; color:var(--k-mu); overflow-wrap:anywhere; }

      /* Disclaimer notice */
      .tg-notice{
        display:flex; gap:.75rem; padding:.9rem 1rem; background:var(--k-bg);
        border:1px solid var(--k-ln); border-inline-start:6px solid var(--k-g2); border-radius:18px;
      }
      .tg-notice-ic{ flex:none; margin-top:.1rem; }
      .tg-notice-title{ margin:0 0 .25rem; font-size:.92rem; font-weight:800; }

      /* Steps (a real sequence, so numbered) */
      .tg-step{ grid-template-columns:auto minmax(0,1fr); gap:.8rem; align-items:start; }
      .tg-num{
        display:inline-grid; place-items:center; width:34px; height:34px; font-size:.9rem; font-weight:800;
        color:#0D0D0D; background:var(--k-gloss); border-radius:11px;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -2px 0 rgba(0,0,0,.12);
      }

      /* Example + calc rows */
      .tg-example{ display:grid; gap:.8rem; padding:1.1rem; border:1.5px dashed var(--k-ink); border-radius:20px; min-width:0; }
      .tg-calc{ margin:0; background:var(--k-bg); border:1px solid var(--k-ln); border-radius:16px; overflow:hidden; }
      .tg-calc-row{
        display:flex; justify-content:space-between; align-items:baseline; gap:.5rem 1rem; flex-wrap:wrap;
        padding:.6rem .9rem; font-size:.85rem;
      }
      .tg-calc-row + .tg-calc-row{ border-top:1px solid var(--k-ln); }
      .tg-calc-row dt{ margin:0; min-width:0; color:var(--k-mu); overflow-wrap:anywhere; }
      .tg-calc-row dd{ margin:0; font-weight:800; direction:ltr; unicode-bidi:isolate; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
      .tg-result{
        margin:0; padding:.8rem 1rem; font-size:.92rem; font-weight:800; line-height:1.8; color:#0D0D0D;
        background:var(--k-gloss); border-radius:16px; box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -2px 0 rgba(0,0,0,.1);
        overflow-wrap:anywhere; print-color-adjust:exact; -webkit-print-color-adjust:exact;
      }

      /* FAQ */
      .tg-faq{ display:grid; gap:.6rem; }
      .tg-faq-item{ background:var(--k-sf); border:1px solid var(--k-ln); border-radius:20px; overflow:hidden; }
      .tg-faq-item.is-open{ border-color:var(--k-ink); }
      .tg-faq-q{ margin:0; }
      .tg-faq-q button{
        width:100%; min-height:56px; display:flex; justify-content:space-between; align-items:center; gap:1rem;
        padding:.8rem 1.1rem; border:0; background:transparent; color:var(--k-ink);
        font-family:inherit; font-size:.97rem; font-weight:800; line-height:1.6; text-align:start; cursor:pointer;
      }
      .tg-faq-q button:hover{ background:var(--k-bg); }
      .tg-faq-q button:focus-visible{ outline-offset:-3px; }
      .tg-sign{
        flex:none; display:inline-grid; place-items:center; width:30px; height:30px;
        border:2px solid var(--k-ink); border-radius:50%;
      }
      .tg-faq-item.is-open .tg-sign{ color:#0D0D0D; background:var(--k-gloss); }
      .tg-faq-a{ padding:.9rem 1.1rem 1.1rem; border-top:1px dashed var(--k-ln); }
      .tg-faq-a[hidden]{ display:none; }
      .tg-faq-a .tg-text{ max-width:70ch; }

      /* Related tools */
      .tg-tool{
        height:100%; display:grid; gap:.5rem; align-content:start; padding:1.1rem;
        color:var(--k-ink); text-decoration:none; background:var(--k-sf);
        border:1px solid var(--k-ln); border-radius:22px;
        transition:border-color .15s, transform .15s;
      }
      .tg-tool:hover{ border-color:var(--k-ink); }
      .tg-tool:hover .tg-tool-title{ text-decoration:underline; text-underline-offset:4px; }
      .tg-tool-title{ font-size:.97rem; font-weight:800; line-height:1.6; overflow-wrap:anywhere; }
      .tg-tool-cta{
        display:inline-flex; align-items:center; gap:.4rem; align-self:end; margin-top:.35rem;
        padding-top:.65rem; border-top:1px dashed var(--k-ln); font-size:.82rem; font-weight:800;
      }
      @media (max-width:639px){ .tg-tool{ padding:1rem; } }

      @media (prefers-reduced-motion:reduce){ .tg-root *{ transition:none !important; } }

      /* Print: show every FAQ answer, drop related tools */
      @media print{
        .tg-faq-a[hidden]{ display:block !important; }
        .tg-last{ display:none !important; }
        .tg-card,.tg-faq-item,.tg-box{ break-inside:avoid; }
      }
    `}</style>
  );
}