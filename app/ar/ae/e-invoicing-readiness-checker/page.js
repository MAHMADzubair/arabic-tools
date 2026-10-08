import UaeEInvoicingChecker from "@/components/UaeEInvoicingChecker";
import Link from "next/link";
import { SITE_URL, SITE_ORG_ID } from "@/lib/siteConfig";
import {
  MOF_EINVOICING_URL_EN,
  MOF_EINVOICING_URL_AR,
  MOF_ASP_DIRECTORY_URL,
  FTA_PORTAL_URL,
} from "@/lib/uaeEInvoicingConfig";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata = {
  title: "حاسبة جاهزية الفوترة الإلكترونية في الإمارات 2026-2027 | Qemlo",
  description:
    "تحقق من موعد تطبيق الفوترة الإلكترونية على شركتك في الإمارات، واعرف موعد اختيار مزود الخدمة المعتمد ASP ومستوى جاهزية نظامك وفق المتطلبات الرسمية الحالية.",
  keywords: [
    "الفوترة الإلكترونية في الإمارات",
    "الفاتورة الإلكترونية الإمارات",
    "الفوترة الإلكترونية الإمارات 2026",
    "الفوترة الإلكترونية الإمارات 2027",
    "موعد تطبيق الفوترة الإلكترونية في الإمارات",
    "مزود خدمة معتمد ASP الإمارات",
    "جاهزية الفوترة الإلكترونية",
    "نظام الفوترة الإلكترونية الإمارات",
    "Peppol الإمارات",
    "PINT-AE",
    "UAE e-Invoicing",
    "UAE e-Invoicing 2027",
    "eInvoicing UAE",
    "ASP UAE",
    "Peppol UAE",
    "PINT AE",
  ],
  alternates: {
    canonical: "/ar/ae/e-invoicing-readiness-checker",
  },
  openGraph: {
    title: "حاسبة جاهزية الفوترة الإلكترونية في الإمارات 2026-2027 | Qemlo",
    description:
      "تحقق من موعد تطبيق الفوترة الإلكترونية على شركتك في الإمارات، وموعد اختيار مزود الخدمة المعتمد ASP، ومستوى الجاهزية التشغيلية للأنظمة والبيانات.",
    url: `${SITE_URL}/ar/ae/e-invoicing-readiness-checker`,
    type: "website",
    locale: "ar_AE",
  },
};

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "🇦🇪 أدوات الإمارات", item: `${SITE_URL}/ar/ae` },
    {
      "@type": "ListItem",
      position: 3,
      name: "حاسبة جاهزية الفوترة الإلكترونية في الإمارات",
      item: `${SITE_URL}/ar/ae/e-invoicing-readiness-checker`,
    },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "حاسبة جاهزية الفوترة الإلكترونية في الإمارات — UAE E-Invoicing Readiness Checker",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
  publisher: { "@id": SITE_ORG_ID },
  description:
    "أداة تفاعلية مجانية لفحص الجداول الزمنية لتطبيق الفوترة الإلكترونية في الإمارات وتحديد مواعيد تعيين مزودي الخدمة المعتمدين ASPs وتقييم الجاهزية التشغيلية للشركات.",
  inLanguage: "ar",
  url: `${SITE_URL}/ar/ae/e-invoicing-readiness-checker`,
};

// 10 Comprehensive FAQs — Mirrored in Visible Accordion & Schema
const faqs = [
  {
    q: "ما هي الفوترة الإلكترونية في الإمارات؟",
    a: "الفوترة الإلكترونية في دولة الإمارات هي منظومة متكاملة لتبادل الفواتير الضريبية والإشعارات الدائنة والمدينة بين البائع والمشتري بتنسيق بيانات منظمة (Structured Electronic Data) بصيغة XML، عبر شبكة Peppol وباستخدام مزودي خدمات معتمدين (ASPs) مرخصين من وزارة المالية، مع إبلاغ آلي مباشر لجهات الضرائب.",
  },
  {
    q: "متى يبدأ تطبيق الفوترة الإلكترونية في الإمارات؟",
    a: "تُطبق الفوترة الإلكترونية تدريجياً على مراحل: المرحلة الأولى للمنشآت الخاصة بإيرادات سنوية تبلغ 50 مليون درهم أو أكثر، ويكون موعد الإلزام الفعلي في 1 يناير 2027 (مع تمديد موعد تعيين مزود ASP إلى 30 أكتوبر 2026). المرحلة الثانية للمنشآت ذات الإيرادات الأقل من 50 مليون درهم تبدأ في 1 يوليو 2027 (تعيين ASP بحلول 31 مارس 2027). أما الجهات الحكومية فتبدأ في 1 أكتوبر 2027.",
  },
  {
    q: "متى يجب على الشركات التي تتجاوز إيراداتها 50 مليون درهم اختيار ASP؟",
    a: "الموعد الرسمي النهائي الحالي لتعيين مزود خدمة معتمد (ASP) للمنشآت التي تبلغ إيراداتها 50 مليون درهم أو أكثر هو 30 أكتوبر 2026، وذلك بعد التمديد الرسمي الصادر عن وزارة المالية الإماراتية للقرار الوزاري رقم 244 لسنة 2025 الذي كان ينص سابقاً على 31 يوليو 2026.",
  },
  {
    q: "متى تبدأ الفوترة الإلكترونية للشركات التي تقل إيراداتها عن 50 مليون درهم؟",
    a: "الشركات التي تقل إيراداتها السنوية عن 50 مليون درهم مُلزمة بتعيين مزود خدمة معتمد بحلول 31 مارس 2027، وسيكون التطبيق والتشغيل الإلزامي الكامل للفواتير الإلكترونية بدءاً من 1 يوليو 2027.",
  },
  {
    q: "هل ملف PDF يعتبر فاتورة إلكترونية في الإمارات؟",
    a: "قطعاً لا. ملفات PDF والمستندات المطبوعة والمسحوبة ضوئياً (Scanned) ورسائل البريد الإلكتروني لا تُعتبر فواتير إلكترونية بموجب النظام الإماراتي المعتمد. يجب أن تكون الفاتورة صادرة بتنسيق بيانات منظمة وقابلة للقراءة الآلية آلياً عبر الحواسيب بصيغة XML المتوافقة مع معيار PINT-AE.",
  },
  {
    q: "هل الفوترة الإلكترونية إلزامية لمعاملات B2C مع الأفراد؟",
    a: "معاملات الأعمال مع المستهلكين الأفراد (B2C) تقع حالياً خارج النطاق الإلزامي لمنظومة الفوترة الإلكترونية في المرحلة الحالية حتى يصدر قرار وزاري يحدد موعد وضوابط شمولها. ولا يُعد هذا إعفاءً دائماً بل مرحلياً، وقد تتغير المتطلبات مستقبلاً بقرار من الوزير.",
  },
  {
    q: "ما هو مزود الخدمة المعتمد ASP وما هو دوره؟",
    a: "مزود الخدمة المعتمد (Accredited Service Provider - ASP) هو كيان تقني مرخص رسمياً من وزارة المالية يعمل كنقطة وصول (Access Point) لربط النظام المحاسبي للمنشأة بشبكة Peppol ونظام الفوترة الوطني. يتولى الـ ASP التحقق من صحة الفاتورة وهيكليتها وتشفيرها ونقلها الآمن بين البائع والمشتري والإبلاغ الضريبي.",
  },
  {
    q: "ما هو نظام Peppol وكيف يُستخدم في الإمارات؟",
    a: "نظام Peppol (Pan-European Public Procurement On-Line) هو شبكة ومعيار عالمي مفتوح للتبادل الآمن للمستندات الإلكترونية بين المنشآت والجهات الحكومية حول العالم وفق نموذج النقاط الأربع (4-Corner Model). اعتمدت دولة الإمارات إطار Peppol كأساس بنيوي لمنظومة الفوترة الإلكترونية الوطنية لضمان المرونة والتوافق الدولي.",
  },
  {
    q: "ما هي مواصفة PINT-AE للفوترة الإلكترونية؟",
    a: "مواصفة PINT-AE (Peppol International Invoice - UAE Extension) هي التوصيف الفني القياسي الإماراتي المعتمد لهيكلة بيانات فواتير XML. تحدد هذه المواصفة الحقول الإلزامية مثل أرقام الـ TRN، وأكواد تصنيف السلع والخدمات، وتفاصيل الضرائب والعملات المتوافقة مع تشريعات ضريبة القيمة المضافة في دولة الإمارات.",
  },
  {
    q: "هل منصة Qemlo مزود خدمة معتمد (ASP)؟",
    a: "لا. منصة Qemlo ليست مزود خدمة معتمد (ASP) ولا تقدم خدمات ربط مباشر بنظام الضرائب ولا تصدر اعتمادات امتثال رسمية. هذه الحاسبة هي أداة إرشادية وتثقيفية مجانية لمساعدة الشركات وأصحاب الأعمال على فهم مواعيد الإلزام وتقييم جاهزيتهم التشغيلية استناداً للمصادر الرسمية المنشورة.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

// ─── Related UAE Business Tools ───────────────────────────────────────────────

const relatedTools = [
  {
    href: "/ar/ae/vat-registration-checker",
    icon: "🏢",
    title: "حاسبة أهلية التسجيل في ضريبة القيمة المضافة",
    desc: "تحقق من التزام نشاطك بالتسجيل الإلزامي (375 ألف درهم) أو الاختياري (187.5 ألف درهم).",
    badge: "FTA VAT",
    badgeColor: "bg-purple-100 text-purple-800",
  },
  {
    href: "/ar/ae/vat-invoice-generator",
    icon: "🧾",
    title: "مولد الفاتورة الضريبية في الإمارات",
    desc: "أنشئ نموذج فاتورة ضريبية كاملة أو مبسطة مع احتساب 5% VAT وفحص الحقول الإلزامية.",
    badge: "نموذج قابل للطباعة",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  {
    href: "/ar/ae/corporate-tax-calculator",
    icon: "🏛️",
    title: "حاسبة ضريبة الشركات في الإمارات",
    desc: "احسب ضريبة الشركات 9% فوق 375,000 درهم وتعرف على أحكام تسهيلات الأعمال الصغيرة.",
    badge: "FTA CT",
    badgeColor: "bg-indigo-100 text-indigo-800",
  },
  {
    href: "/ar/ae/small-business-relief-checker",
    icon: "🏷️",
    title: "حاسبة تسهيلات الأعمال الصغيرة (SBR)",
    desc: "تحقق من أهلية الإعفاء من ضريبة الشركات للمنشآت بإيرادات لا تتجاوز 3,000,000 درهم.",
    badge: "SBR 2026",
    badgeColor: "bg-emerald-100 text-emerald-800",
  },
  {
    href: "/ar/ae/final-settlement-calculator",
    icon: "📋",
    title: "حاسبة المخالصة النهائية الشاملة",
    desc: "تصفية مستحقات الموظف ومكافأة نهاية الخدمة وبدل الإجازات وفق قانون العمل الإماراتي.",
    badge: "قانون 33",
    badgeColor: "bg-amber-100 text-amber-800",
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function UaeEInvoicingReadinessCheckerPage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12 space-y-12" dir="rtl">
        {/* ── Breadcrumb Navigation ─────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-3)]">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-[var(--text)] transition-colors">
                الرئيسية
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/ar/ae" className="hover:text-[var(--text)] transition-colors">
                🇦🇪 أدوات الإمارات
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span className="text-[var(--text)] font-bold" aria-current="page">
                حاسبة جاهزية الفوترة الإلكترونية
              </span>
            </li>
          </ol>
        </nav>

        {/* ── Hero Section ──────────────────────────────────────────────────── */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--card)] px-3 py-1 text-xs font-black text-[var(--card-text)]">
              <span>⚡</span>
              <span>أدوات الامتثال الضريبي والأعمال</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] font-bold text-[var(--text-2)]">
              <span>🗓️</span>
              <span>محدّث وفق المتطلبات الرسمية المتاحة — أكتوبر 2026</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[var(--text)] leading-tight">
            حاسبة جاهزية الفوترة الإلكترونية في الإمارات
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-[var(--text-2)] max-w-3xl">
            أداة تفاعلية متخصصة لمساعدة الشركات ومنشآت الأعمال في دولة الإمارات العربية المتحدة على تحديد جدولها الزمني الإلزامي لتطبيق الفوترة الإلكترونية، ومعرفة الموعد النهائي لتعيين مزود الخدمة المعتمد (ASP)، وتقييم الجاهزية التشغيلية للأنظمة والبيانات استناداً إلى قرارات وزارة المالية والهيئة الاتحادية للضرائب.
          </p>

          {/* Quick Regulatory Highlights Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 text-center">
              <span className="text-[11px] font-bold text-[var(--text-3)] block mb-0.5">
                المنظومة التقنية
              </span>
              <span className="text-sm font-black text-[var(--text)]">Peppol / PINT-AE</span>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 text-center">
              <span className="text-[11px] font-bold text-[var(--text-3)] block mb-0.5">
                موعد تعيين ASP (50M+)
              </span>
              <span className="text-sm font-black text-[var(--orange)]">30 أكتوبر 2026</span>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 text-center">
              <span className="text-[11px] font-bold text-[var(--text-3)] block mb-0.5">
                بدء الإلزام (المرحلة 1)
              </span>
              <span className="text-sm font-black text-[var(--text)]">1 يناير 2027</span>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 text-center">
              <span className="text-[11px] font-bold text-[var(--text-3)] block mb-0.5">
                نطاق المستهلكين B2C
              </span>
              <span className="text-sm font-black text-[var(--text-2)]">مؤجل حالياً</span>
            </div>
          </div>
        </header>

        {/* ── Interactive Checker Assessment Tool ───────────────────────────── */}
        <section aria-labelledby="interactive-checker-heading">
          <h2 id="interactive-checker-heading" className="sr-only">
            تقييم جاهزية الفوترة الإلكترونية
          </h2>
          <UaeEInvoicingChecker />
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* ── EDITORIAL & COMPREHENSIVE COMPLIANCE GUIDE ─────────────────────── */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-12 pt-6 border-t border-[var(--border)]">
          {/* 1. ما هي الفوترة الإلكترونية */}
          <article className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text)]">
              ما هي الفوترة الإلكترونية في دولة الإمارات؟
            </h2>
            <div className="text-sm leading-relaxed text-[var(--text-2)] space-y-3">
              <p>
                الفوترة الإلكترونية (E-Invoicing) في دولة الإمارات هي نقلة نوعية من الفواتير الورقية أو ملفات PDF الثابتة إلى تبادل آلي وفوري للبيانات الرقمية المنظمة (Structured Data) بين الأنظمة المحاسبية للمنشآت التجارية. يتم تبادل هذه الفواتير عبر شبكة موحدة ومعتمدة برعاية وزارة المالية والهيئة الاتحادية للضرائب (FTA).
              </p>
              <p>
                تعتمد المنظومة الإماراتية على بنية <strong>شبكة Peppol</strong> ونموذج النقاط الأربع (Four-Corner Model)، حيث ترسل المنشأة المصدرة بيانات الفاتورة من برنامجها المحاسبي إلى مزود خدمة معتمد (ASP)، الذي يقوم بدوره بالتحقق من مطابقة الفاتورة وإرسالها إلى الـ ASP الخاص بالمستلم، بالتزامن مع إشعار جهات التحصيل الضريبي إلكترونياً.
              </p>
            </div>
          </article>

          {/* 2. هل ملف PDF يعتبر فاتورة إلكترونية؟ */}
          <article className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 sm:p-8 space-y-3">
            <div className="inline-flex items-center gap-2 text-rose-700 font-extrabold text-xs">
              <span>⚠️</span>
              <span>مفهوم تنظيمي جوهري</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-rose-950">
              هل ملف PDF يعتبر فاتورة إلكترونية في الإمارات؟
            </h2>
            <div className="text-sm leading-relaxed text-rose-900 space-y-3">
              <p>
                <strong>الجواب القاطع هو: لا.</strong> ملفات PDF والمستندات النصية كـ Word والصور الممسوحة ضوئياً ورسائل البريد الإلكتروني لا تُعد فواتير إلكترونية بموجب التعريف القانوني والتنظيمي المعتمد في دولة الإمارات.
              </p>
              <p>
                الفاتورة الإلكترونية بموجب المنظومة هي <strong>بيانات رقمية مهيكلة بصيغة XML</strong> مقروءة ومُعالجة آلياً بواسطة البرمجيات والأنظمة دون أي تدخل بشري لإدخال البيانات. بينما صُممت ملفات PDF لتكون مقروءة بالعين البشرية فقط، وتفتقر للهيكلة التي تتيح التدقيق الآلي والتحقق الفوري من صحة العمليات الحسابية والضرائب عبر شبكة Peppol.
              </p>
            </div>
          </article>

          {/* 3. الجدول الزمني الرسمي للإلزام */}
          <article className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text)]">
              متى تصبح الفوترة الإلكترونية إلزامية في الإمارات؟
            </h2>
            <p className="text-sm leading-relaxed text-[var(--text-2)]">
              حددت وزارة المالية الإماراتية تطبيق المنظومة وفق خطة تدريجية مرحلية قائمة على حجم الإيرادات السنوية ونوع المنشأة. وفيما يلي الجدول الزمني الرسمي المعتمد:
            </p>

            {/* Responsive Comparison Table */}
            <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg)] text-[var(--text)] font-extrabold">
                    <th className="p-3.5 sm:p-4">فئة المنشأة / الكيان</th>
                    <th className="p-3.5 sm:p-4">معيار الإيرادات السنوية</th>
                    <th className="p-3.5 sm:p-4 text-[var(--orange)]">الموعد النهائي لاختيار مزود ASP</th>
                    <th className="p-3.5 sm:p-4">موعد التطبيق والتشغيل الإلزامي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[var(--text-2)]">
                  <tr className="hover:bg-[var(--bg)]/50 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-[var(--text)]">
                      المنشآت الخاصة الكبرى (المرحلة الأولى)
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono">50,000,000 درهم أو أكثر</td>
                    <td className="p-3.5 sm:p-4 font-bold text-[var(--orange)]">
                      30 أكتوبر 2026 <span className="text-[10px] text-[var(--text-3)] block font-normal">(تمديد رسمي من 31 يوليو)</span>
                    </td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-600">1 يناير 2027</td>
                  </tr>
                  <tr className="hover:bg-[var(--bg)]/50 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-[var(--text)]">
                      المنشآت الخاصة (المرحلة الثانية)
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono">أقل من 50,000,000 درهم</td>
                    <td className="p-3.5 sm:p-4 font-bold">31 مارس 2027</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-600">1 يوليو 2027</td>
                  </tr>
                  <tr className="hover:bg-[var(--bg)]/50 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-[var(--text)]">الجهات والمؤسسات الحكومية</td>
                    <td className="p-3.5 sm:p-4">كافة المعاملات الحكومية</td>
                    <td className="p-3.5 sm:p-4 font-bold">31 مارس 2027</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-600">1 أكتوبر 2027</td>
                  </tr>
                  <tr className="hover:bg-[var(--bg)]/50 transition-colors bg-amber-50/30">
                    <td className="p-3.5 sm:p-4 font-bold text-[var(--text)]">
                      معاملات المستهلكين الأفراد (B2C)
                    </td>
                    <td className="p-3.5 sm:p-4">نقاط البيع والتجزئة المباشرة للأفراد</td>
                    <td className="p-3.5 sm:p-4 font-bold text-amber-700" colSpan={2}>
                      خارج النطاق الإلزامي حالياً حتى يصدر قرار وزاري يحدد ذلك
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[var(--text-3)]">
              * ملاحظة هامة: المنشآت التي تمارس نشاطاً مختلطاً (B2B و B2C) تكون ملزمة بتطبيق النظام على معاملاتها مع الشركات والجهات الحكومية في المواعيد المقررة أعلاه.
            </p>
          </article>

          {/* 4. ما هو مزود الخدمة المعتمد ASP؟ */}
          <article className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text)]">
              ما هو مزود الخدمة المعتمد (ASP) وما هي أدواره؟
            </h2>
            <div className="text-sm leading-relaxed text-[var(--text-2)] space-y-3">
              <p>
                مزود الخدمة المعتمد (Accredited Service Provider - ASP) هو شركة تقنية رخصتها وزارة المالية رسمياً لتعمل كـ <strong>نقطة وصول (Access Point)</strong> معتمدة لشبكة الفوترة الإلكترونية. لا يمكن للمنشآت التجارية إرسال فواتيرها الإلكترونية مباشرة إلى الأنظمة الحكومية بمفردها، بل يجب أن تمر الفواتير حصراً من خلال أحد مزودي الخدمة المعتمدين.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <span className="font-extrabold text-sm text-[var(--text)] block mb-1">
                    1. التحقق من الهيكلية
                  </span>
                  <p className="text-xs text-[var(--text-3)]">
                    التأكد من مطابقة بيانات الفاتورة لمعايير مواصفة PINT-AE واكتمال الحقول الإلزامية كأرقام الـ TRN والأسعار.
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <span className="font-extrabold text-sm text-[var(--text)] block mb-1">
                    2. التشفير والتبادل الآمن
                  </span>
                  <p className="text-xs text-[var(--text-3)]">
                    توقيع الفاتورة وتشفيرها ونقلها الآمن عبر شبكة Peppol إلى مزود الخدمة المعتمد الخاص بالمشتري.
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <span className="font-extrabold text-sm text-[var(--text)] block mb-1">
                    3. الإبلاغ الضريبي المباشر
                  </span>
                  <p className="text-xs text-[var(--text-3)]">
                    إرسال بيانات الفاتورة بصورة فورية ومؤتمتة إلى منصة الفوترة المركزية لوزارة المالية والجهات الضريبية.
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <a
                  href={MOF_ASP_DIRECTORY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-xs text-[var(--orange)] hover:underline"
                >
                  <span>استعراض دليل مزودي الخدمات المعتمدين الرسمي لدى وزارة المالية</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </article>

          {/* 5. Peppol & PINT-AE */}
          <article className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text)]">
              ما هو إطار Peppol وما هي مواصفة PINT-AE؟
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm leading-relaxed text-[var(--text-2)]">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-2">
                <h3 className="text-base font-extrabold text-[var(--text)] flex items-center gap-2">
                  <span>🌐</span>
                  <span>إطار وشبكة Peppol العالمية</span>
                </h3>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">
                  شبكة Peppol هي شبكة تبادل مستندات عالمية معتمدة في عشرات الدول. تتيح للأنظمة المحاسبية المختلفة (مثل SAP و Oracle و Odoo و Zoho) التحدث بلغة تقنية واحدة عبر شبكة آمنة، دون الحاجة لبناء تكامل مخصص لكل عميل ومورد على حدة.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-2">
                <h3 className="text-base font-extrabold text-[var(--text)] flex items-center gap-2">
                  <span>📄</span>
                  <span>مواصفة PINT-AE المخصصة للإمارات</span>
                </h3>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">
                  مواصفة PINT-AE هي التخصيص الإماراتي لفاتورة Peppol الدولية (Peppol International Invoice). تحدد هيكل مستند XML، بما في ذلك متطلبات ضريبة القيمة المضافة 5%، والرقم الضريبي (TRN)، والتصنيف السلعي، والإعفاءات الضريبية وفق تشريعات الدولة.
                </p>
              </div>
            </div>
          </article>

          {/* 6. الفرق بين الفاتورة الورقية/PDF والفوترة الإلكترونية المنظمة */}
          <article className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text)]">
              الفرق بين الفاتورة الورقية / PDF والفاتورة الإلكترونية المنظمة
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg)] text-[var(--text)] font-extrabold">
                    <th className="p-3.5 sm:p-4">وجه المقارنة</th>
                    <th className="p-3.5 sm:p-4 text-rose-700">الفاتورة الورقية / ملف PDF</th>
                    <th className="p-3.5 sm:p-4 text-emerald-700">الفاتورة الإلكترونية المنظمة (UAE eInvoice)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[var(--text-2)]">
                  <tr className="hover:bg-[var(--bg)]/50">
                    <td className="p-3.5 sm:p-4 font-bold text-[var(--text)]">صيغة البيانات</td>
                    <td className="p-3.5 sm:p-4">نص مرئي غير مهيكل (PDF, Word, صورة)</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700">بيانات رقمية مهيكلة بصيغة XML (PINT-AE)</td>
                  </tr>
                  <tr className="hover:bg-[var(--bg)]/50">
                    <td className="p-3.5 sm:p-4 font-bold text-[var(--text)]">طريقة التبادل</td>
                    <td className="p-3.5 sm:p-4">تسليم يدوي أو مرفق بريد إلكتروني</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700">تبادل آلي عبر شبكة Peppol ومزود خدمة معتمد ASP</td>
                  </tr>
                  <tr className="hover:bg-[var(--bg)]/50">
                    <td className="p-3.5 sm:p-4 font-bold text-[var(--text)]">الإبلاغ الضريبي</td>
                    <td className="p-3.5 sm:p-4">إقرار ضريبي دوري لاحق وتدقيق يدوي</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700">إبلاغ آلي لحظي مباشر لجهات الضرائب بالتزامن مع الإرسال</td>
                  </tr>
                  <tr className="hover:bg-[var(--bg)]/50">
                    <td className="p-3.5 sm:p-4 font-bold text-[var(--text)]">التدقيق في إدخال البيانات</td>
                    <td className="p-3.5 sm:p-4">يتطلب إدخالاً يدوياً وعرضة للأخطاء</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700">معالجة آلية متكاملة ومباشرة بين برامج الـ ERP</td>
                  </tr>
                  <tr className="hover:bg-[var(--bg)]/50">
                    <td className="p-3.5 sm:p-4 font-bold text-[var(--text)]">الحالة القانونية</td>
                    <td className="p-3.5 sm:p-4 text-rose-700">غير متوافقة مع منظومة الفوترة الإلزامية</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700">متوافقة رسمياً مع المنظومة الاتحادية</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          {/* 7. كيف تستعد شركتك للفوترة الإلكترونية */}
          <article className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text)]">
              كيف تستعد شركتك للفوترة الإلكترونية في الإمارات؟
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-[var(--text-2)]">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--orange)] text-[var(--on-orange)] font-extrabold text-xs mb-2">
                  1
                </span>
                <h3 className="font-bold text-[var(--text)] text-sm mb-1">
                  تدقيق البرامج المحاسبية والـ ERP
                </h3>
                <p className="leading-relaxed text-[var(--text-3)] text-xs">
                  تواصل مع مزود نظامك المحاسبي الحالي لمعرفة مدى جاهزية البرنامج للتكامل مع واجهات API ودعم تصدير ملفات فواتير PINT-AE.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--orange)] text-[var(--on-orange)] font-extrabold text-xs mb-2">
                  2
                </span>
                <h3 className="font-bold text-[var(--text)] text-sm mb-1">
                  اختيار مزود خدمة معتمد (ASP) مبكراً
                </h3>
                <p className="leading-relaxed text-[var(--text-3)] text-xs">
                  لا تنتظر الموعد النهائي لاختيار الـ ASP. ابدأ في مقارنة عروض المزودين المعتمدين والتأكد من توافق حلولهم مع طبيعة أعمالك.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--orange)] text-[var(--on-orange)] font-extrabold text-xs mb-2">
                  3
                </span>
                <h3 className="font-bold text-[var(--text)] text-sm mb-1">
                  تنقية وتحديث السجلات الأساسية (Master Data)
                </h3>
                <p className="leading-relaxed text-[var(--text-3)] text-xs">
                  قم بمطابقة الأسماء القانونية، والعناوين الكاملة، وأرقام الـ TRN لجميع عملائك ومورديك المسجلين لتجنب رفض الفواتير تقنياً.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--orange)] text-[var(--on-orange)] font-extrabold text-xs mb-2">
                  4
                </span>
                <h3 className="font-bold text-[var(--text)] text-sm mb-1">
                  إجراء اختبارات تجريبية في بيئة Sandbox
                </h3>
                <p className="leading-relaxed text-[var(--text-3)] text-xs">
                  قم بإجراء اختبارات إرسال واستقبال كاملة لعينات من فواتيرك عبر البيئة التجريبية للـ ASP قبل حلول موعد التشغيل الفعلي.
                </p>
              </div>
            </div>
          </article>

          {/* 8. المصادر الرسمية */}
          <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏛️</span>
              <h2 className="text-lg sm:text-xl font-black text-[var(--text)]">
                المصادر الرسمية والتشريعات المعتمدة
              </h2>
            </div>
            <p className="text-xs text-[var(--text-2)] leading-relaxed">
              تستند هذه الأداة وجميع البيانات المذكورة إلى القرارات الوزارية والنشرات التوجيهية المنشورة رسمياً في دولة الإمارات العربية المتحدة:
            </p>

            <ul className="space-y-2.5 text-xs text-[var(--text-2)]">
              <li className="flex items-start gap-2">
                <span className="text-[var(--orange)] font-bold mt-0.5">•</span>
                <div>
                  <a
                    href={MOF_EINVOICING_URL_AR}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[var(--text)] hover:text-[var(--orange)] transition-colors underline underline-offset-4"
                  >
                    بوابة الفوترة الإلكترونية — وزارة المالية بدولة الإمارات العربية المتحدة (باللغة العربية)
                  </a>
                  <span className="text-[var(--text-3)] block text-[11px] mt-0.5">
                    المرجع الرئيسي لبرنامج الفوترة الإلكترونية الوطني ومواعيد التطبيق واللوائح المنظمة.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-[var(--orange)] font-bold mt-0.5">•</span>
                <div>
                  <a
                    href={MOF_ASP_DIRECTORY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[var(--text)] hover:text-[var(--orange)] transition-colors underline underline-offset-4"
                  >
                    قائمة مزودي الخدمات المعتمدين (Accredited Service Providers - ASPs) — وزارة المالية
                  </a>
                  <span className="text-[var(--text-3)] block text-[11px] mt-0.5">
                    الدليل الرسمي للمزودين المعتمدين والمؤهلين لربط المنشآت بشبكة الفوترة الإلكترونية.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-[var(--orange)] font-bold mt-0.5">•</span>
                <div>
                  <a
                    href={FTA_PORTAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[var(--text)] hover:text-[var(--orange)] transition-colors underline underline-offset-4"
                  >
                    الهيئة الاتحادية للضرائب (FTA) — البوابة الرسمية
                  </a>
                  <span className="text-[var(--text-3)] block text-[11px] mt-0.5">
                    الجهة الاتحادية المسؤولة عن إدارة وتحصيل الضرائب وضريبة القيمة المضافة وضريبة الشركات.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-2">
                <span className="text-[var(--orange)] font-bold mt-0.5">•</span>
                <div>
                  <span className="font-bold text-[var(--text)]">
                    القرار الوزاري رقم 244 لسنة 2025 وقرارات التمديد الوزارية الصادرة لعام 2026
                  </span>
                  <span className="text-[var(--text-3)] block text-[11px] mt-0.5">
                    القرارات المحددة للجدول الزمني الإلزامي وتمديد مهلة تعيين الـ ASP للمنشآت الكبرى حتى 30 أكتوبر 2026.
                  </span>
                </div>
              </li>
            </ul>
          </article>

          {/* 9. الأسئلة الشائعة (FAQ) */}
          <article className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">❓</span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text)]">
                الأسئلة الشائعة حول الفوترة الإلكترونية في الإمارات
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4.5 transition-colors open:border-[var(--orange)]/60"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs sm:text-sm font-extrabold text-[var(--text)] marker:hidden [&::-webkit-details-marker]:hidden">
                    <span>{faq.q}</span>
                    <span className="shrink-0 text-base text-[var(--text-3)] group-open:rotate-180 transition-transform">
                      ↓
                    </span>
                  </summary>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--text-2)] border-t border-[var(--border)]/60 pt-3">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </article>

          {/* 10. أدوات إماراتية ذات صلة */}
          <article className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <h2 className="text-lg font-black text-[var(--text)]">
                أدوات إماراتية ذات صلة في Qemlo
              </h2>
              <Link href="/ar/ae" className="text-xs font-bold text-[var(--orange)] hover:underline">
                تصفح كل أدوات الإمارات ←
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--orange)] hover:shadow-sm transition-all"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg)] text-xl group-hover:scale-105 transition-transform">
                    {tool.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h3 className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--orange)] transition-colors truncate">
                        {tool.title}
                      </h3>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[var(--text-3)] line-clamp-2">
                      {tool.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
