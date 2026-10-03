import AiSalesCloserPage from "@/components/AiSalesCloserPage";
import { SITE_URL } from "@/lib/siteConfig";

const BASE_URL = SITE_URL;
const PAGE_URL = `${BASE_URL}/ar/business/ai-sales-closer`;

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: "AI Sales Closer للعربي | استعادة مبيعات واتساب للمتاجر",
  description:
    "اكتشف أسباب خسارة المبيعات على واتساب، صنف العملاء، تابع الفرص تلقائياً، وحلل الاعتراضات لمتاجر سلة وشوبيفاي وزد. برنامج تجريبي محدود — متاجر سعودية.",
  keywords: [
    "AI sales closer",
    "استعادة مبيعات واتساب",
    "تحليل اعتراضات العملاء",
    "متابعة العملاء تلقائياً",
    "متاجر سلة واتساب",
    "WhatsApp sales recovery",
    "lost sales analysis arabic",
    "سلة شوبيفاي زد واتساب",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "AI Sales Closer | اكتشف لماذا تخسر المبيعات على واتساب",
    description:
      "حلل محادثات واتساب، اكتشف اعتراضات العملاء، وتابع الفرص الضائعة تلقائياً — لمتاجر سلة وShopify وZid.",
    url: PAGE_URL,
    type: "website",
    locale: "ar_SA",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ─── JSON-LD ──────────────────────────────────────────────────────────────────
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "AI Sales Closer", item: PAGE_URL },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AI Sales Closer للعربي",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  offers: { "@type": "Offer", price: "0", priceCurrency: "SAR" },
  description:
    "نظام ذكاء اصطناعي لاكتشاف أسباب خسارة مبيعات واتساب واستعادة العملاء تلقائياً لمتاجر سلة وShopify وZid.",
  inLanguage: "ar",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "هل هذا مجرد شات بوت؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا. المنتج يركز على تحليل أسباب خسارة المبيعات وتصنيف العملاء واستعادة الفرص الضائعة — وليس مجرد ردود آلية.",
      },
    },
    {
      "@type": "Question",
      name: "هل يرسل خصومات تلقائياً؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا. كل رد تلقائي يعمل وفق القواعد والعروض التي يحددها صاحب المتجر مسبقاً فقط.",
      },
    },
    {
      "@type": "Question",
      name: "هل يتكامل مع سلة وShopify؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "التكاملات مخططة وستُعلَن عند الإطلاق. لا يوجد تكامل مباشر حالياً — المرحلة الحالية هي برنامج تجريبي للتحقق من الفكرة.",
      },
    },
    {
      "@type": "Question",
      name: "هل النظام متاح الآن؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "حالياً في مرحلة التحقق وجمع طلبات البرنامج التجريبي. المشاركون الأوائل يحصلون على وصول مبكر عند الإطلاق.",
      },
    },
  ],
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AiSalesCloserRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <AiSalesCloserPage />
    </>
  );
}
