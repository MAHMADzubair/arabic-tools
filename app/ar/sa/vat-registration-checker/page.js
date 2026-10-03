import VatRegistrationChecker from "@/components/VatRegistrationChecker";
import Link from "next/link";
import { ZATCA_OFFICIAL_URL } from "@/lib/vatRegistrationConfig";
import RelatedBusinessTools from "@/components/business/RelatedBusinessTools";
import GeoAnswerSummary from "@/components/GeoAnswerSummary";
import { SITE_URL } from "@/lib/siteConfig";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: "حاسبة التسجيل في ضريبة القيمة المضافة السعودية 2026 | حد 375,000 ريال",
  description:
    "احسب وتأكد من أهليتك في التسجيل في ضريبة القيمة المضافة بالسعودية: فحص حد التسجيل الإلزامي 375,000 ريال وحد التسجيل الاختياري 187,500 ريال واستبعاد التوريدات المعفاة وفق ZATCA.",
  keywords: [
    "التسجيل في ضريبة القيمة المضافة",
    "حد التسجيل الإلزامي 375000",
    "التسجيل الاختياري 187500",
    "ضريبة القيمة المضافة السعودية",
    "هيئة الزكاة والضريبة والجمارك",
    "حاسبة أهلية ضريبة القيمة المضافة",
    "VAT registration Saudi Arabia",
    "ZATCA VAT threshold",
    "تسجيل المنشآت في الضريبة",
  ],
  alternates: {
    canonical: "/ar/sa/vat-registration-checker",
  },
  openGraph: {
    title: "حاسبة التسجيل في ضريبة القيمة المضافة السعودية 2026 | حد 375,000 ريال",
    description:
      "احسب وتأكد من أهليتك في التسجيل في ضريبة القيمة المضافة بالسعودية: فحص حد التسجيل الإلزامي 375,000 ريال وحد التسجيل الاختياري 187,500 ريال واستبعاد التوريدات المعفاة وفق ZATCA.",
    url: `${SITE_URL}/ar/sa/vat-registration-checker`,
    type: "website",
    locale: "ar_SA",
  },
};

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ما هو حد التسجيل الإلزامي في ضريبة القيمة المضافة بالسعودية؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "حد التسجيل الإلزامي في المملكة العربية السعودية هو 375,000 ريال سعودي. يلتزم أي شخص أو منشأة مقيمة تمارس نشاطاً اقتصادياً بالتسجيل لدى هيئة الزكاة والضريبة والجمارك (ZATCA) إذا تجاوزت توريداتها الخاضعة للضريبة هذا المبلغ خلال الاثني عشر شهراً الماضية، أو كان يُتوقع أن تتجاوزه خلال الاثني عشر شهراً القادمة.",
      },
    },
    {
      "@type": "Question",
      name: "ما هو حد التسجيل الاختياري وما فائدته للمنشآت الصغيرة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "حد التسجيل الاختياري هو 187,500 ريال سعودي (نصف الحد الإلزامي). إذا تجاوزت التوريدات السنوية أو المصروفات الخاضعة للضريبة هذا الحد، يحق للمنشأة التسجيل اختيارياً. الفائدة الكبرى تكمن في حق استرداد وخصم ضريبة المدخلات (ضريبة المشتريات والمصروفات الرأسمالية والتشغيلية)، والتعامل بسلاسة مع كبرى الشركات المشترطة للرقم الضريبي.",
      },
    },
    {
      "@type": "Question",
      name: "ما هي التوريدات المستبعدة من احتساب حد الـ 375,000 ريال؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا تدخل التوريدات المعفاة من الضريبة (مثل إيجار العقارات السكنية وبعض الخدمات المالية المحددة بهامش الربح)، ولا التوريدات الواقعة خارج نطاق الضريبة، ولا المبالغ الناتجة عن مبيعات الأصول الرأسمالية (كالمركبات أو المعدات المستعملة التابعة للشركة) في احتساب سقف حد التسجيل.",
      },
    },
    {
      "@type": "Question",
      name: "كيف يتم تسجيل المنشآت والأشخاص غير المقيمين في ضريبة القيمة المضافة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا ينطبق حد الـ 375,000 ريال على الأشخاص غير المقيمين. إذا كان الشخص أو المنشأة غير المقيمة ملزمة بسداد الضريبة عن توريدات خاضعة للضريبة داخل المملكة، وجب عليها التسجيل الإلزامي فوراً بصرف النظر عن حجم المبيعات، ويتم ذلك إما مباشرة عبر بوابة ZATCA أو بتعيين ممثل ضريبي معتمد ومقيم داخل المملكة.",
      },
    },
    {
      "@type": "Question",
      name: "ما هي المهلة الزمنية لتقديم طلب التسجيل بعد تجاوز الحد الإلزامي؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "يجب تقديم طلب التسجيل في ضريبة القيمة المضافة إلى هيئة الزكاة والضريبة والجمارك في موعد أقصاه نهاية الشهر التالي للشهر الذي تجاوزت فيه التوريدات حد الـ 375,000 ريال لتجنب الوقوع في مخالفات عدم التسجيل وغراماتها النظامية المقررة.",
      },
    },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "حاسبة أهلية التسجيل في ضريبة القيمة المضافة في السعودية",
  operatingSystem: "All",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "SAR",
  },
  description:
    "أداة فحص أهلية التسجيل في ضريبة القيمة المضافة في السعودية وفق لوائح هيئة الزكاة والضريبة والجمارك ZATCA وحدود 375,000 و 187,500 ريال.",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "🇸🇦 أدوات السعودية", item: `${SITE_URL}/ar/sa` },
    {
      "@type": "ListItem",
      position: 3,
      name: "حاسبة أهلية التسجيل في ضريبة القيمة المضافة",
      item: `${SITE_URL}/ar/sa/vat-registration-checker`,
    },
  ],
};

export default function VatRegistrationCheckerPage() {
  return (
    <>
      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />

      <main className="min-h-screen bg-page-bg" dir="rtl">
        {/* Breadcrumb Navigation */}
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Link href="/" className="hover:text-brand transition-colors">
              الرئيسية
            </Link>
            <span>›</span>
            <Link href="/ar/sa" className="hover:text-brand transition-colors">
              🇸🇦 أدوات السعودية
            </Link>
            <span>›</span>
            <span className="text-ink font-semibold">حاسبة أهلية التسجيل في ضريبة القيمة المضافة</span>
          </nav>
        </div>

        {/* ── PART 1: Interactive Calculator (Above the Fold) ────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 py-4">
          <VatRegistrationChecker />
        </div>

        {/* GEO Answer Summary */}
        <GeoAnswerSummary
          whatItDoes="تحدد مستوى الالتزام بالتسجيل في ضريبة القيمة المضافة (إلزامي أو اختياري أو معفى) بناءً على حجم التوريدات"
          appliesTo="المملكة العربية السعودية — المنشآت الخاضعة لضريبة القيمة المضافة"
          keyRule="التسجيل الإلزامي عند تجاوز 375,000 ريال — الاختياري من 187,500 ريال — وفق لوائح ZATCA المنشورة"
          authority="هيئة الزكاة والضريبة والجمارك (ZATCA)"
          authorityUrl="https://zatca.gov.sa"
          lastReviewed="سبتمبر 2026"
          disclaimer="هذه الأداة تقديرية استرشادية — راجع بوابة ZATCA أو مستشارك الضريبي للتحقق من الالتزام الرسمي."
        />

        {/* ── PART 2: Comprehensive Explanation (300-500 Words) ────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">
                📖 ما هي أداة فحص أهلية التسجيل في ضريبة القيمة المضافة وما أهميتها؟
              </h2>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                تُعد <strong className="text-ink">حاسبة أهلية التسجيل في ضريبة القيمة المضافة</strong> أداة استرشادية ذكية مخصصة لرواد الأعمال، والشركات الناشئة، والمنشآت متناهية الصغر والصغيرة في المملكة العربية السعودية. تهدف الأداة إلى تقييم وضع المنشأة النظامي تجاه التزامات ضريبة القيمة المضافة (VAT) المقررة من <strong>هيئة الزكاة والضريبة والجمارك (ZATCA)</strong> بموجب اللائحة التنفيذية لنظام ضريبة القيمة المضافة الصادرة بالقرار الوزاري رقم (3839).
              </p>
              <p>
                تكمن أهمية الفحص الدوري في تجنب الوقوع تحت طائلة الغرامات المالية الصارمة التي تفرضها الهيئة على المنشآت المتأخرة عن التسجيل الإلزامي، مع تمكين المنشآت الواعدة من استغلال حق التسجيل الاختياري لاسترداد ضريبة المدخلات على تكاليف التأسيس والمشتريات التشغيلية.
              </p>
            </div>

            {/* When is registration mandatory? */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-5 space-y-2">
              <h3 className="text-base font-extrabold text-rose-950 flex items-center gap-2">
                <span>🚨</span>
                <span>متى يصبح التسجيل في ضريبة القيمة المضافة إلزامياً؟</span>
              </h3>
              <p className="text-xs sm:text-sm text-rose-900 leading-relaxed">
                يصبح التسجيل إلزامياً في الحالتين الآتيتين للمقيمين:
              </p>
              <ul className="text-xs sm:text-sm text-rose-900 space-y-1.5 list-disc list-inside">
                <li>
                  إذا تجاوزت التوريدات السنوية الخاضعة للضريبة <strong>375,000 ريال سعودي</strong> في نهاية أي شهر عن الاثني عشر شهراً السابقة (نظرة تاريخية بأثر رجعي).
                </li>
                <li>
                  إذا كان متوقعاً أن تتجاوز التوريدات الخاضعة للضريبة <strong>375,000 ريال سعودي</strong> في نهاية أي شهر عن الاثني عشر شهراً القادمة (نظرة مستقبلية وفق العقود والتنبؤات المالية).
                </li>
              </ul>
            </div>

            {/* When is registration voluntary? */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5 space-y-2">
              <h3 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
                <span>⭐</span>
                <span>متى يمكن التسجيل اختيارياً في الضريبة؟</span>
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                تمنح لوائح ZATCA ميزة التسجيل الاختياري للمنشآت التي لم تصل إلى حد الإلزام (375 ألف ريال)، بشرط:
              </p>
              <ul className="text-xs sm:text-sm text-amber-900 space-y-1.5 list-disc list-inside">
                <li>
                  تجاوز التوريدات الخاضعة للضريبة أو المصروفات الخاضعة للضريبة مبلغ <strong>187,500 ريال سعودي</strong> خلال الـ 12 شهراً الماضية أو توقع تجاوزها في الـ 12 شهراً القادمة.
                </li>
                <li>
                  <strong>الفائدة العملية:</strong> حق استرداد ضريبة الـ 15% المدفوعة على المعدات والمواد الخام والإيجارات التجارية والمصاريف المهنية.
                </li>
              </ul>
            </div>

            {/* What is included vs excluded? */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                <h4 className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                  <span>✅</span>
                  <span>ما يدخل في احتساب حد التسجيل:</span>
                </h4>
                <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
                  <li>كافة التوريدات الخاضعة لنسبة الضريبة الأساسية (15%).</li>
                  <li>التوريدات الخاضعة لنسبة الصفر (كالصادرات من السلع والخدمات والنقل الدولي).</li>
                  <li>السلع والخدمات المستلمة الخاضعة لآلية الاحتساب العكسي.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <h4 className="text-xs font-black text-ink flex items-center gap-1.5">
                  <span>❌</span>
                  <span>ما يُستبعد ولا يدخل في حساب الحد:</span>
                </h4>
                <ul className="text-xs text-ink-secondary space-y-1 list-disc list-inside">
                  <li>التوريدات المعفاة (كإيجار العقارات السكنية والخدمات المالية المحددة).</li>
                  <li>التوريدات الخارجة عن نطاق الضريبة في المملكة.</li>
                  <li>متحصلات مبيعات الأصول الرأسمالية القديمة للمنشأة.</li>
                </ul>
              </div>
            </div>

            {/* Non-resident registration */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-5 space-y-2">
              <h3 className="text-base font-extrabold text-purple-950 flex items-center gap-2">
                <span>🌐</span>
                <span>التسجيل في ضريبة القيمة المضافة لغير المقيمين</span>
              </h3>
              <p className="text-xs sm:text-sm text-purple-900 leading-relaxed">
                تنص المادة (5) من نظام ضريبة القيمة المضافة ولائحته التنفيذية على أنه <strong>لا ينطبق حد الإعفاء أو حد التسجيل الإلزامي (375 ألف ريال) على الأشخاص والشركات غير المقيمة</strong> داخل المملكة. إذا كنت كياناً أجنبياً وتقوم بتقديم توريدات خاضعة للضريبة داخل المملكة دون أن يلتزم العميل باحتسابها عكسياً، فإنك ملزم بالتسجيل فوراً من أول ريال لتوريد محلي، عبر بوابة الهيئة أو بتعيين ممثل ضريبي مقيم في السعودية.
              </p>
            </div>

            {/* Step-by-step Guide */}
            <div>
              <h3 className="text-base font-extrabold text-ink mb-3">🔢 كيفية استخدام الحاسبة — خطوة بخطوة</h3>
              <ol className="space-y-2 text-sm text-ink-secondary list-none">
                {[
                  ["١", "حدد صفة الإقامة: مقيم في المملكة أو غير مقيم."],
                  ["٢", "أدخل إجمالي توريداتك (مبيعاتك) خلال آخر 12 شهراً الماضية."],
                  ["٣", "أدخل الاستبعادات إن وُجدت (التوريدات المعفاة، الأصول الرأسمالية) ليتم خصمها تلقائياً."],
                  ["٤", "أدخل التوريدات المتوقعة خلال الـ 12 شهراً القادمة بناءً على العقود والخطط."],
                  ["٥", "أدخل مصروفاتك الخاضعة للضريبة إن كنت ترغب بفحص إمكانية التسجيل الاختياري."],
                  ["٦", "اقرأ النتيجة الفورية والمؤشر البصري والفرق المتبقي مع رابط التوجيه لـ ZATCA."],
                ].map(([num, text]) => (
                  <li key={num} className="flex gap-2.5 items-start">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-brand text-white text-[11px] font-extrabold flex items-center justify-center mt-0.5">
                      {num}
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Worked Numerical Examples */}
            <div>
              <h3 className="text-base font-extrabold text-ink mb-3">📊 4 أمثلة عملية بالأرقام لحالات التسجيل</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 space-y-1.5">
                  <span className="text-[11px] font-black text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full">
                    مثال 1: تسجيل إلزامي
                  </span>
                  <p className="text-xs font-bold text-ink mt-1">توريدات خاضعة: 420,000 ريال</p>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    تجاوزت التوريدات حد الـ 375,000 ريال بمقدار 45,000 ريال. النتيجة: <strong>التسجيل الإلزامي مطلوب فوراً</strong> وتقديم الإقرارات الضريبية الدورية.
                  </p>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-1.5">
                  <span className="text-[11px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                    مثال 2: تسجيل اختياري
                  </span>
                  <p className="text-xs font-bold text-ink mt-1">توريدات خاضعة: 250,000 ريال</p>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    أقل من حد الـ 375,000 ريال ولكنها تجاوزت حد الـ 187,500 ريال. النتيجة: <strong>مؤهل للتسجيل الاختياري</strong> لاسترداد ضريبة المدخلات.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1.5">
                  <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                    مثال 3: دون حد التسجيل
                  </span>
                  <p className="text-xs font-bold text-ink mt-1">توريدات خاضعة: 150,000 ريال ومصروفات 40 ألف</p>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    لم تصل التوريدات ولا المصروفات لحد الـ 187,500 ريال. النتيجة: <strong>غير ملزم بالتسجيل حالياً</strong> مع المتابعة الدورية.
                  </p>
                </div>

                <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 space-y-1.5">
                  <span className="text-[11px] font-black text-purple-800 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-full">
                    مثال 4: استبعاد التوريدات المعفاة
                  </span>
                  <p className="text-xs font-bold text-ink mt-1">إجمالي 450 ألف منها 100 ألف إيجار سكني معفى</p>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    التوريدات الخاضعة الصافية = 450,000 − 100,000 = <strong>350,000 ريال</strong>. النتيجة: <strong>لا تصنف كإلزامي</strong> بل اختيارية، لأن الإجمالي قبل الاستبعاد خادع.
                  </p>
                </div>
              </div>
            </div>

            {/* Official Source & Last Updated */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-ink-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🏛️</span>
                <p>
                  <strong className="text-ink">المصادر الرسمية:</strong> هيئة الزكاة والضريبة والجمارك (ZATCA) — اللائحة التنفيذية لنظام ضريبة القيمة المضافة بالمملكة العربية السعودية.
                </p>
              </div>
              <a
                href={ZATCA_OFFICIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand font-bold underline hover:text-brand-dark shrink-0"
              >
                دليل خدمات ZATCA الإلكترونية ←
              </a>
            </div>

            <div className="text-[11px] text-ink-muted border-t border-slate-200 pt-3 flex items-center justify-between">
              <span>📅 تاريخ آخر مراجعة وتحديث: 2026م</span>
              <span>منصة الأدوات العربية — حاسبات الأعمال والضرائب</span>
            </div>
          </div>
        </section>

        {/* ── PART 3: FAQ Section (People Also Ask) ─────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 pb-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-6 border-b border-brand-border pb-4">
              ❓ الأسئلة الشائعة حول التسجيل في ضريبة القيمة المضافة بالسعودية
            </h2>

            <div className="space-y-5">
              {faqJsonLd.mainEntity.map((faq, i) => (
                <div key={i} className="border-b border-brand-border/60 last:border-0 pb-5 last:pb-0">
                  <h3 className="text-sm font-extrabold text-ink mb-2">{faq.name}</h3>
                  <p className="text-sm text-ink-secondary leading-relaxed">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PART 4: Related Tools (Business & Saudi VAT Cluster) ──────────────── */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <RelatedBusinessTools
            title="📌 أدوات مالية وضريبية ذات صلة بالمملكة العربية السعودية"
            subtitle="تصفح الحاسبات المتكاملة لمنظومة الأعمال والفوترة والضرائب في السعودية"
            tools={[
              { href: "/vat-calculator/saudi", icon: "🧾", title: "حاسبة ضريبة القيمة المضافة 15%", desc: "احسب ضريبة الـ 15% أو افصل السعر الأصلي لبيانات منظومة فاتورة والفوترة الإلكترونية.", badge: "ZATCA 15%", badgeColor: "bg-purple-100 text-purple-700" },
              { href: "/ar/sa/e-invoice-generator", icon: "🧾", title: "مولد الفاتورة الإلكترونية السعودية", desc: "هل أصبحت مؤهلاً أو ملزماً بالتسجيل؟ → أنشئ نموذج فاتورة إلكترونية سعودية (B2B أو B2C) مع احتساب VAT 15%.", badge: "ZATCA فاتورة", badgeColor: "bg-indigo-100 text-indigo-700" },
              { href: "/ar/sa/final-settlement-calculator", icon: "📋", title: "حاسبة المخالصة النهائية الشاملة", desc: "تصفية كاملة لمستحقات العامل: نهاية الخدمة، آخر راتب، بدل الإجازات، وبدل الإشعار.", badge: "نظام العمل", badgeColor: "bg-emerald-100 text-emerald-700" },
              { href: "/ar/sa/article-77-calculator", icon: "⚖️", title: "حاسبة تعويض المادة 77", desc: "حساب تعويض إنهاء العقد لسبب غير مشروع مع تطبيق حد الشهرين الأدنى للموظف أو المنشأة.", badge: "المادة 77", badgeColor: "bg-rose-100 text-rose-700" },
              { href: "/salary-calculator/saudi", icon: "💼", title: "حاسبة الراتب الصافي والتأمينات GOSI", desc: "احسب صافي الراتب بعد استقطاعات التأمينات وساند ومسيرات حماية الأجور.", badge: "GOSI", badgeColor: "bg-blue-100 text-blue-700" },
              { href: "/profit-margin-calculator", icon: "📈", title: "حاسبة هامش الربح والتسعير", desc: "احسب هامش الربح الإجمالي والصافي ومعدل الزيادة على التكلفة لمنتجاتك وخدماتك.", badge: "أعمال", badgeColor: "bg-amber-100 text-amber-700" },
              { href: "/ar/sa", icon: "🇸🇦", title: "مجمع أدوات وحاسبات السعودية", desc: "دليل الحاسبات العمالية، والضريبية، والمالية المخصصة للمملكة في مكان واحد.", badge: "المجمع الشامل", badgeColor: "bg-emerald-600 text-white font-black" },
            ]}
          />
        </section>
      </main>
    </>
  );
}
