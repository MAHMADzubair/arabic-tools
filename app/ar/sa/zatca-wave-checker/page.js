/**
 * app/ar/sa/zatca-wave-checker/page.js
 *
 * ZATCA Wave Eligibility Checker — حاسبة موجات زاتكا (المجموعات)
 *
 * Architecture: 4-part page standard (calculator → explanation → FAQ → related tools)
 * Stack: Next.js App Router | Tailwind | Arabic RTL
 *
 * SEO targets:
 *   "في أي موجة أنا زاتكا", "حاسبة الموجة زاتكا", "حاسبة المجموعة 25 زاتكا",
 *   "هل منشأتي مشمولة بالمرحلة الثانية", "الموجة 25 الفوترة الإلكترونية"
 */

import ZatcaWaveChecker from "@/components/ZatcaWaveChecker";
import Link from "next/link";
import RelatedBusinessTools from "@/components/business/RelatedBusinessTools";
import GeoAnswerSummary from "@/components/GeoAnswerSummary";
import { SITE_URL, SITE_ORG_ID } from "@/lib/siteConfig";
import {
  ZATCA_WAVE25_ANNOUNCEMENT_URL,
  ZATCA_VAT_REGISTRATION_GUIDE_URL,
  ZATCA_PORTAL_URL,
  WAVE_DATA_LAST_VERIFIED,
  WAVES,
} from "@/lib/zatcaWaveConfig";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title:
    "حاسبة موجة زاتكا 25 | فحص المجموعات 23–25 للفوترة الإلكترونية",
  description:
    "اعرف في أي موجة من الفوترة الإلكترونية أنت: أدخل الإيرادات الخاضعة للضريبة للأعوام 2022–2025، وافحص المجموعات 23–25 وموعد الربط المعلن للموجة 25 في 1 فبراير 2027.",
  keywords: [
    "في أي موجة أنا زاتكا",
    "حاسبة موجات زاتكا",
    "حاسبة المجموعة 25 زاتكا",
    "حاسبة موجة زاتكا 25",
    "الموجة 25 الفوترة الإلكترونية",
    "هل منشأتي مشمولة بالمرحلة الثانية",
    "كيف أعرف الموجة الخاصة بي زاتكا",
    "المجموعة الخامسة والعشرون فاتورة",
    "موعد الربط مع منصة فاتورة 2027",
    "ZATCA wave 25 eligibility",
    "الفوترة الإلكترونية المرحلة الثانية",
  ],
  alternates: {
    canonical: `${SITE_URL}/ar/sa/zatca-wave-checker`,
    languages: {
      "ar-SA": `${SITE_URL}/ar/sa/zatca-wave-checker`,
    },
  },
  openGraph: {
    title:
      "حاسبة موجة زاتكا 25 | هل منشأتك مشمولة؟ | Qemlo",
    description:
      "أداة مجانية لفحص المجموعات 23–25 وفق الإيرادات الخاضعة للضريبة للأعوام 2022–2025، مع توضيح موعد الربط المعلن للموجة 25.",
    url: `${SITE_URL}/ar/sa/zatca-wave-checker`,
    type: "website",
    locale: "ar_SA",
    siteName: "Qemlo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

// ─── JSON-LD: FAQPage ──────────────────────────────────────────────────────────
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ما المقصود بالإيرادات الخاضعة للضريبة عند احتساب موجة زاتكا؟ هل هي الربح؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "المقصود نظاماً هو إجمالي الإيرادات الخاضعة لضريبة القيمة المضافة كما يتم الإفصاح عنها في إقراراتك الضريبية الدورية المقدمة لهيئة الزكاة والضريبة والجمارك (ZATCA)، وليس صافي الربح. لتحديد الإيرادات الدقيقة الواجب احتسابها، يجب الاعتماد حصراً على إقرارات ضريبة القيمة المضافة الخاصة بمنشأتك والأدلة الرسمية الصادرة عن الهيئة.",
      },
    },
    {
      "@type": "Question",
      name: "هل يكفي تجاوز الحد في سنة واحدة فقط للاندراج في موجة زاتكا؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، يكفي تجاوز حد الإيرادات في أي سنة واحدة من السنوات المعتمدة لكل موجة. لا يُشترط تجاوز الحد في جميع السنوات. فمثلاً، إذا تجاوزت 187,500 ريال في عام 2023 فقط وانخفضت إيراداتك لاحقاً، فإنك مشمول بالموجة 25.",
      },
    },
    {
      "@type": "Question",
      name: "هل تشمل الموجة 25 إيرادات سنة 2025؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، أعلنت هيئة الزكاة والضريبة والجمارك رسمياً اعتماد سنوات 2022، 2023، 2024، و2025 كسنوات معتمدة للمجموعة الخامسة والعشرين (الموجة 25). في المقابل، اقتصرت المجموعتان 23 و24 على سنوات 2022 و2023 و2024 فقط دون إدراج سنة 2025.",
      },
    },
    {
      "@type": "Question",
      name: "ماذا يحدث إذا كانت إيراداتي مساوية تماماً للحد المحدد (مثلاً 187,500 ريال)؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "الإيرادات المساوية تماماً للحد لا تُدخلك الموجة. شرط الاندراج هو تجاوز الحد (أكثر من)، وليس المساواة أو الزيادة. أي أن 187,500 ريال بالضبط لا تُدرجك في الموجة 25، بينما 187,501 ريال تُدرجك.",
      },
    },
    {
      "@type": "Question",
      name: "لم يصلني إشعار من زاتكا — هل هذا يعني أنني غير مشمول بالموجة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا، عدم وصول الإشعار لا يعني بالضرورة أنك غير مشمول. قد يتأخر الإشعار أو يذهب إلى مجلد البريد العشوائي، أو قد تكون بيانات الاتصال في بوابة زاتكا غير محدثة. إذا كانت إيراداتك تتجاوز الحد في السنوات المعتمدة، فأنت مشمول نظاماً بصرف النظر عن وصول الإشعار. تحقق من حسابك على بوابة فاتورة، أو اتصل بزاتكا على 19993.",
      },
    },
    {
      "@type": "Question",
      name: "منشأتي غير مسجلة في ضريبة القيمة المضافة — هل تشملني الموجة 25؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "عدم التسجيل وحده لا يكفي للحكم بأن المنشأة خارج نطاق الالتزام. هذه الحاسبة تحدد الموجة بعد التحقق من وضع التسجيل؛ فالمقيم الذي تجاوزت توريداته الخاضعة للضريبة 375,000 ريال خلال فترة 12 شهراً يلزمه التسجيل الإلزامي. ويكون التسجيل الاختياري متاحاً عند تجاوز التوريدات الخاضعة للضريبة أو النفقات الخاضعة للضريبة 187,500 ريال خلال 12 شهراً. أما غير المقيمين الملزمون بسداد ضريبة القيمة المضافة في المملكة فتسري عليهم قواعد تسجيل خاصة دون حد مالي. تحقق من وضع منشأتك مباشرة لدى زاتكا قبل اعتبارها خارج النطاق.",
      },
    },
    {
      "@type": "Question",
      name: "سجلت اختيارياً في ضريبة القيمة المضافة — هل أنا مشمول بالموجات؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، المنشآت المسجلة اختيارياً في ضريبة القيمة المضافة مشمولة بمتطلبات الفوترة الإلكترونية — سواء الإلزامية (المرحلة الأولى) أو الربط والتكامل (المرحلة الثانية) — شريطة أن تتجاوز إيراداتها الحد المعتمد لكل موجة.",
      },
    },
    {
      "@type": "Question",
      name: "ما موعد بدء الربط الإلزامي مع منصة فاتورة للموجة 25؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "أعلنت هيئة الزكاة والضريبة والجمارك أن الربط والتكامل للمجموعة الخامسة والعشرين (الموجة 25) مع نظام فاتورة يبدأ اعتباراً من 1 فبراير 2027م. استخدم هذا التاريخ للتخطيط، وراجع إشعار الهيئة الرسمي الخاص بمنشأتك؛ فهذه الحاسبة تقديرية ولا تحل محل الإشعار.",
      },
    },
    {
      "@type": "Question",
      name: "ماذا لو انخفضت إيراداتي بشكل كبير بعد السنة التي تجاوزت فيها الحد؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "الانخفاض اللاحق في الإيرادات لا يُخرجك من الموجة. متى تجاوزت الحد في أي من السنوات المعتمدة، فأنت مشمول بالموجة. المعيار هو ما حدث تاريخياً، وليس الوضع الحالي.",
      },
    },
    {
      "@type": "Question",
      name: "ما الفرق بين المرحلة الأولى والمرحلة الثانية من الفوترة الإلكترونية؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "المرحلة الأولى (الإصدار والحفظ): كانت تُلزم جميع المنشآت الخاضعة للضريبة بإصدار فواتير إلكترونية برمز QR وحقظها. المرحلة الثانية (الربط والتكامل): تُلزم المنشآت بربط أنظمة الفوترة الإلكترونية مباشرة بمنصة فاتورة عبر API، وإصدار الفواتير بصيغة XML مع ختم تشفيري. تُطبق على موجات بحسب حجم الإيرادات.",
      },
    },
    {
      "@type": "Question",
      name: "كيف أحدد بنود الإيرادات المعتمدة لاحتساب موجة زاتكا؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "يجب الرجوع مباشرة إلى إقرارات ضريبة القيمة المضافة الدورية المعتمدة لمنشأتك على بوابة هيئة الزكاة والضريبة والجمارك (ZATCA)، واتباع التعليمات والأدلة الإرشادية الرسمية الصادرة عن الهيئة بشأن تحديد الإيرادات الخاضعة للضريبة، أو استشارة مستشارك الضريبي المرخص، وتجنب الاعتماد على أرقام المبيعات الإجمالية أو الدفاتر غير الضريبية.",
      },
    },
    {
      "@type": "Question",
      name: "متى تُرسل زاتكا الإشعارات الرسمية للمنشآت المستهدفة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "تلتزم هيئة الزكاة والضريبة والجمارك بإرسال إشعارات رسمية للمنشآت المستهدفة قبل موعد الربط بـ 6 أشهر على الأقل، عبر البريد الإلكتروني المسجل في بوابة زاتكا. تأكد من تحديث بيانات الاتصال في حسابك على البوابة لاستلام الإشعارات في وقتها.",
      },
    },
  ],
};

// ─── JSON-LD: WebApplication ───────────────────────────────────────────────────
const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "حاسبة موجة زاتكا 25 — أداة فحص المجموعات 23–25 للفوترة الإلكترونية",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript",
  inLanguage: "ar-SA",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "SAR",
  },
  description:
    "أداة مجانية لتحديد موجة (مجموعة) الفوترة الإلكترونية المرحلة الثانية لمنشأتك وفق معايير هيئة الزكاة والضريبة والجمارك — المجموعات 23 و24 و25.",
  url: `${SITE_URL}/ar/sa/zatca-wave-checker`,
  publisher: { "@id": SITE_ORG_ID },
};

// ─── JSON-LD: BreadcrumbList ───────────────────────────────────────────────────
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "الرئيسية",
      item: `${SITE_URL}`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "أدوات السعودية",
      item: `${SITE_URL}/ar/sa`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "حاسبة موجات زاتكا",
      item: `${SITE_URL}/ar/sa/zatca-wave-checker`,
    },
  ],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function SectionCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6 dark:bg-white/[0.04] dark:border-white/10 ${className}`}
    >
      {children}
    </div>
  );
}

function H2({ children, id }) {
  return (
    <h2
      id={id}
      className="text-xl font-bold text-ink border-b border-brand-border pb-4 dark:text-[#F5F5F2] dark:border-white/10"
    >
      {children}
    </h2>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────
export default function ZatcaWaveCheckerPage() {
  return (
    <>
      {/* ── JSON-LD Structured Data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="min-h-screen bg-page-bg" dir="rtl">
        {/* ── Breadcrumb ── */}
        <div className="mx-auto max-w-6xl px-4 pt-4 pb-1">
          <nav
            className="flex items-center gap-1.5 text-xs text-ink-muted"
            aria-label="مسار التنقل"
          >
            <Link href="/" className="hover:text-brand transition-colors">
              الرئيسية
            </Link>
            <span aria-hidden="true" className="select-none text-ink-muted/60">‹</span>
            <Link
              href="/ar/sa"
              className="hover:text-brand transition-colors"
            >
              أدوات السعودية
            </Link>
            <span aria-hidden="true" className="select-none text-ink-muted/60">‹</span>
            <span className="text-ink font-semibold dark:text-[#F5F5F2]">
              حاسبة موجات زاتكا
            </span>
          </nav>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            PART 1 — Interactive Calculator (above the fold)
        ════════════════════════════════════════════════════════════════════ */}
        <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
          <ZatcaWaveChecker />
        </div>

        {/* ── GEO Answer Summary (AI / snippet extraction) ── */}
        <GeoAnswerSummary
          whatItDoes="تحدد الموجة (المجموعة) الخاصة بمنشأتك في المرحلة الثانية للفوترة الإلكترونية بناءً على إيراداتها الخاضعة لضريبة القيمة المضافة في الأعوام 2022–2025"
          appliesTo="المملكة العربية السعودية — المنشآت المسجلة في ضريبة القيمة المضافة"
          keyRule="الموجة 25 (المجموعة الخامسة والعشرون): إيرادات خاضعة للضريبة تتجاوز 187,500 ريال في أي من 2022–2025 — موعد الربط المعلن يبدأ من 1 فبراير 2027"
          authority="هيئة الزكاة والضريبة والجمارك (ZATCA)"
          authorityUrl={ZATCA_PORTAL_URL}
          lastReviewed={WAVE_DATA_LAST_VERIFIED}
          disclaimer="هذه الأداة استرشادية — الإشعار الرسمي من زاتكا هو المرجع النهائي لتحديد موجتك."
        />

        {/* ════════════════════════════════════════════════════════════════════
            PART 2 — Explanation (300-500 words)
        ════════════════════════════════════════════════════════════════════ */}
        <section
          className="mx-auto max-w-5xl px-4 py-8"
          aria-label="شرح الأداة"
        >
          <SectionCard>
            {/* H2: كيف أعرف في أي موجة أنا */}
            <H2 id="how-to-know">📋 كيف أعرف في أي موجة (مجموعة) أنا من الفوترة الإلكترونية؟</H2>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary dark:text-[#BFB8B0]">
              <p>
                تُطبق هيئة الزكاة والضريبة والجمارك{" "}
                <strong className="text-ink dark:text-[#F5F5F2]">المرحلة الثانية من الفوترة الإلكترونية</strong>{" "}
                (مرحلة الربط والتكامل) على المنشآت بشكل تدريجي عبر{" "}
                <strong className="text-ink dark:text-[#F5F5F2]">موجات (مجموعات)</strong>{" "}
                مرتبة حسب حجم الإيرادات، بدءاً من الأعلى إيراداً ثم التدرج للأصغر. المعيار الوحيد للتحديد هو:{" "}
                <strong className="text-ink dark:text-[#F5F5F2]">هل تجاوزت إيراداتك الخاضعة لضريبة القيمة المضافة الحد المقرر في أي سنة من السنوات المعتمدة؟</strong>
              </p>
              <p>
                المقصود بالإيرادات هنا <strong className="text-ink dark:text-[#F5F5F2]">الإيرادات الخاضعة لضريبة القيمة المضافة</strong> كما تظهر في إقراراتك الضريبية — وليست صافي الأرباح ولا إجمالي المبيعات. التوريدات المعفاة من الضريبة (كإيجار العقارات السكنية) تُستبعد من الحساب.
              </p>
            </div>

            {/* H2: شروط الموجة 25 */}
            <H2 id="wave25-criteria">📌 شروط الموجة 25 — المجموعة الخامسة والعشرون</H2>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary dark:text-[#BFB8B0]">
              <p>
                أعلنت زاتكا في{" "}
                <strong className="text-ink dark:text-[#F5F5F2]">24 يوليو 2026</strong>{" "}
                عن المجموعة الخامسة والعشرين، وهي من أوسع الموجات نطاقاً لأن حدها الأدنى يساوي حد التسجيل الاختياري في ضريبة القيمة المضافة (187,500 ريال)، مما يشمل شريحة واسعة من المنشآت الصغيرة والمتوسطة.
              </p>
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:bg-amber-950/20 dark:border-amber-800 space-y-2">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-200">معايير الاندراج في الموجة 25:</p>
                <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                  <li>مسجل في ضريبة القيمة المضافة (إلزامياً أو اختيارياً).</li>
                  <li>
                    تجاوزت إيراداتك الخاضعة للضريبة{" "}
                    <strong>187,500 ريال</strong> في أي من{" "}
                    <strong>2022 أو 2023 أو 2024 أو 2025</strong>.
                  </li>
                  <li>يكفي تجاوز الحد في سنة واحدة فقط.</li>
                  <li>المساواة للحد (187,500 بالضبط) لا تُدخلك الموجة.</li>
                </ul>
              </div>
            </div>

            {/* H2: حد الإيرادات والسنوات المعتمدة */}
            <H2 id="revenue-table">📊 حد الإيرادات والسنوات المعتمدة لكل موجة</H2>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm border-collapse" role="table">
                <caption className="sr-only">جدول موجات الفوترة الإلكترونية — الحدود والسنوات والمواعيد</caption>
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5">
                    <th className="text-right p-3 font-bold text-ink dark:text-[#F5F5F2] border border-slate-200 dark:border-white/10 text-xs">
                      الموجة
                    </th>
                    <th className="text-right p-3 font-bold text-ink dark:text-[#F5F5F2] border border-slate-200 dark:border-white/10 text-xs">
                      الاسم الرسمي
                    </th>
                    <th className="text-right p-3 font-bold text-ink dark:text-[#F5F5F2] border border-slate-200 dark:border-white/10 text-xs">
                      حد الإيرادات (ريال)
                    </th>
                    <th className="text-right p-3 font-bold text-ink dark:text-[#F5F5F2] border border-slate-200 dark:border-white/10 text-xs">
                      السنوات المعتمدة
                    </th>
                    <th className="text-right p-3 font-bold text-ink dark:text-[#F5F5F2] border border-slate-200 dark:border-white/10 text-xs">
                      موعد الربط
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {WAVES.map((wave) => (
                    <tr
                      key={wave.id}
                      className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.03]"
                    >
                      <td className="p-3 font-bold text-[#FF5B04] border border-slate-200 dark:border-white/10 text-xs">
                        {wave.number}
                      </td>
                      <td className="p-3 text-ink dark:text-[#F5F5F2] border border-slate-200 dark:border-white/10 text-xs">
                        {wave.nameAr}
                      </td>
                      <td
                        className="p-3 font-bold text-ink dark:text-[#F5F5F2] border border-slate-200 dark:border-white/10 text-xs"
                        dir="ltr"
                      >
                        &gt; {wave.thresholdFormatted}
                      </td>
                      <td className="p-3 text-ink-secondary dark:text-[#BFB8B0] border border-slate-200 dark:border-white/10 text-xs">
                        {wave.qualifyYears.join(" / ")}
                      </td>
                      <td className="p-3 font-bold text-ink dark:text-[#F5F5F2] border border-slate-200 dark:border-white/10 text-xs">
                        {wave.mandateDateAr}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-ink-muted dark:text-[#8A8A82]">
              * المصدر: هيئة الزكاة والضريبة والجمارك (zatca.gov.sa) — آخر مراجعة:{" "}
              {WAVE_DATA_LAST_VERIFIED}. الحد = أكثر من (لا يشمل المساواة).
            </p>

            {/* H2: موعد الربط مع منصة فاتورة */}
            <H2 id="fatoora-mandate">🔗 موعد الربط مع منصة فاتورة: متى يبدأ الإلزام؟</H2>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary dark:text-[#BFB8B0]">
              <p>
                موعد الربط المعلن للموجة 25 هو <strong className="text-ink dark:text-[#F5F5F2]">1 فبراير 2027</strong>. ينص قرار الهيئة (1448-99-238) على الالتزام بالربط «بداية من تاريخ 1/2/2027م»، أي أن كل فاتورة تصدرها من ذلك اليوم يجب أن تمر عبر منصة فاتورة. فالمطلوب أن يكون نظامك مربوطاً ومختبراً قبله، لا أن تبدأ العمل عليه في ذلك اليوم.
              </p>
              <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 dark:bg-blue-950/20 dark:border-blue-800">
                <p className="text-xs font-bold text-blue-800 dark:text-blue-200 mb-2">لماذا البدء المبكر مهم؟</p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                  <li>الربط التقني مع منصة فاتورة عبر API يستلزم تجهيز النظام واختباره، وقد يستغرق أشهراً.</li>
                  <li>اختيار مزود حلول فاتورة معتمد من زاتكا والتعاقد معه يحتاج وقتاً.</li>
                  <li>تُرسل زاتكا إشعاراً رسمياً قبل الموعد بـ 6 أشهر على الأقل.</li>
                </ul>
              </div>
            </div>

            {/* H2: الفرق بين المرحلة الأولى والثانية */}
            <H2 id="phase-difference">⚖️ الفرق بين المرحلة الأولى والمرحلة الثانية من الفوترة الإلكترونية</H2>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 space-y-2 dark:bg-emerald-950/20 dark:border-emerald-800">
                <p className="font-bold text-emerald-800 dark:text-emerald-200 text-xs">
                  ✅ المرحلة الأولى (الإصدار والحفظ)
                </p>
                <ul className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1 list-disc list-inside">
                  <li>بدأت ديسمبر 2021 لجميع المنشآت الخاضعة للضريبة.</li>
                  <li>إصدار فواتير إلكترونية برمز QR وحفظها.</li>
                  <li>وقف الفواتير الورقية واليدوية.</li>
                  <li>لا يُشترط الاتصال المباشر بزاتكا لحظة الإصدار.</li>
                </ul>
              </div>
              <div className="rounded-xl border border-orange-300 bg-orange-50 p-4 space-y-2 dark:bg-orange-950/20 dark:border-orange-800">
                <p className="font-bold text-orange-800 dark:text-orange-200 text-xs">
                  🔗 المرحلة الثانية (الربط والتكامل)
                </p>
                <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1 list-disc list-inside">
                  <li>تُطبق تدريجياً حسب الموجات والإيرادات.</li>
                  <li>الربط المباشر بمنصة فاتورة عبر API.</li>
                  <li>فواتير B2B: مسح (Clearance) قبل التسليم.</li>
                  <li>فواتير B2C: إبلاغ (Reporting) خلال 24 ساعة.</li>
                  <li>صيغة XML مع ختم تشفيري ومعرف UUID.</li>
                </ul>
              </div>
            </div>

            {/* Official sources & last verified */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-ink-muted flex flex-col gap-3 dark:bg-white/[0.03] dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-base" aria-hidden="true">🏛️</span>
                <p>
                  <strong className="text-ink dark:text-[#F5F5F2]">المصادر الرسمية:</strong>{" "}
                  إعلان زاتكا للموجة 25، ودليل الهيئة للمجموعات الضريبية (الإصدار الثالث، مايو 2026) الذي يتضمن أقسام التسجيل في ضريبة القيمة المضافة.
                </p>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <a href={ZATCA_WAVE25_ANNOUNCEMENT_URL} target="_blank" rel="noopener noreferrer" className="text-brand font-bold underline hover:text-brand-dark dark:text-[#FF8A3D]">
                  إعلان زاتكا للموجة 25 ←
                </a>
                <a href={ZATCA_VAT_REGISTRATION_GUIDE_URL} target="_blank" rel="noopener noreferrer" className="text-brand font-bold underline hover:text-brand-dark dark:text-[#FF8A3D]">
                  دليل المجموعات الضريبية وحدود التسجيل في VAT (English; العربية هي المرجع) ←
                </a>
              </div>
            </div>
            <div className="text-[11px] text-ink-muted border-t border-slate-200 dark:border-white/10 pt-3 flex items-center justify-between">
              <span>📅 آخر مراجعة وتحقق من البيانات: {WAVE_DATA_LAST_VERIFIED}</span>
              <span>منصة Qemlo — أدوات مالية وضريبية عربية</span>
            </div>
          </SectionCard>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            PART 3 — FAQ Section (FAQPage schema, People Also Ask)
        ════════════════════════════════════════════════════════════════════ */}
        <section
          className="mx-auto max-w-5xl px-4 pb-8"
          aria-label="الأسئلة الشائعة"
        >
          <SectionCard>
            <H2 id="faq">❓ الأسئلة الشائعة حول موجات الفوترة الإلكترونية (زاتكا)</H2>
            <div className="space-y-5">
              {faqJsonLd.mainEntity.map((faq, i) => (
                <div
                  key={i}
                  className="border-b border-brand-border/60 dark:border-white/10 last:border-0 pb-5 last:pb-0"
                >
                  <h3 className="text-sm font-bold text-ink dark:text-[#F5F5F2] mb-2">
                    {faq.name}
                  </h3>
                  <p className="text-sm text-ink-secondary dark:text-[#BFB8B0] leading-relaxed">
                    {faq.acceptedAnswer.text}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            PART 4 — Related Tools (internal links)
        ════════════════════════════════════════════════════════════════════ */}
        <section className="mx-auto max-w-5xl px-4 pb-12">
          <RelatedBusinessTools
            title="📌 أدوات مالية وضريبية مرتبطة بالمملكة العربية السعودية"
            subtitle="تصفح حاسبات الأعمال والضرائب والفوترة المصممة للسوق السعودي"
            tools={[
              {
                href: "/ar/sa/vat-registration-checker",
                icon: "📋",
                title: "حاسبة أهلية التسجيل في ضريبة القيمة المضافة",
                desc: "تحقق من حد التسجيل الإلزامي أو الاختياري بناءً على التوريدات أو النفقات الخاضعة للضريبة خلال 12 شهراً.",
                badge: "ZATCA",
                badgeColor: "bg-blue-100 text-blue-700",
              },
              {
                href: "/ar/sa/e-invoice-generator",
                icon: "🧾",
                title: "مولد الفاتورة الإلكترونية السعودية",
                desc: "أنشئ فاتورة إلكترونية سعودية متوافقة مع زاتكا (B2B وB2C) مع احتساب ضريبة القيمة المضافة 15% تلقائياً.",
                badge: "فاتورة ZATCA",
                badgeColor: "bg-indigo-100 text-indigo-700",
              },
              {
                href: "/vat-calculator/saudi",
                icon: "🧮",
                title: "حاسبة ضريبة القيمة المضافة 15%",
                desc: "احسب ضريبة القيمة المضافة 15% أو استخرجها من السعر الشامل لمنتجاتك وخدماتك.",
                badge: "VAT 15%",
                badgeColor: "bg-purple-100 text-purple-700",
              },
              {
                href: "/ar/sa/final-settlement-calculator",
                icon: "📋",
                title: "حاسبة المخالصة النهائية الشاملة",
                desc: "احسب كافة مستحقات الموظف عند انتهاء الخدمة: مكافأة نهاية الخدمة، بدل الإجازات، وبدل الإشعار.",
                badge: "نظام العمل",
                badgeColor: "bg-emerald-100 text-emerald-700",
              },
              {
                href: "/ar/sa/article-77-calculator",
                icon: "⚖️",
                title: "حاسبة تعويض المادة 77",
                desc: "احسب تعويض إنهاء العقد لسبب غير مشروع مع تطبيق حد الشهرين الأدنى.",
                badge: "المادة 77",
                badgeColor: "bg-rose-100 text-rose-700",
              },
              {
                href: "/ar/sa",
                icon: "🇸🇦",
                title: "جميع أدوات المملكة العربية السعودية",
                desc: "دليل ومجمع الحاسبات العمالية والضريبية والمالية المخصصة للسوق السعودي في مكان واحد.",
                badge: "المجمع الشامل",
                badgeColor: "bg-emerald-600 text-white font-bold",
              },
            ]}
          />
        </section>
      </main>
    </>
  );
}

