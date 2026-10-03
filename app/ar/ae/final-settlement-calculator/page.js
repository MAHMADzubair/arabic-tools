import UaeFinalSettlementCalculator from "@/components/UaeFinalSettlementCalculator";
import Link from "next/link";
import GeoSummary from "@/components/business/GeoSummary";
import { SITE_URL } from "@/lib/siteConfig";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: "حاسبة المخالصة النهائية في الإمارات 2026 | مكافأة وإجازة وإنذار",
  description:
    "قدّر مستحقات التصفية عبر حاسبة المخالصة النهائية في الإمارات 2026: مكافأة نهاية الخدمة (قانون العمل 33)، راتب آخر شهر، بدل رصيد الإجازات السنوية، تعويض مهلة الإنذار، والاستقطاعات والخصومات لصافي التصفية العمالية بالدرهم الإماراتي.",
  keywords: [
    "حاسبة المخالصة النهائية في الإمارات",
    "تصفية مستحقات نهاية الخدمة الإمارات",
    "حساب مكافأة نهاية الخدمة قانون العمل 33",
    "بدل رصيد الإجازات السنوية الإمارات",
    "تعويض مهلة الإنذار الإمارات",
    "حاسبة نهاية الخدمة دبي أبوظبي",
    "قانون العمل الإماراتي الجديد",
    "MOHRE final settlement calculator",
    "UAE end of service gratuity",
    "نموذج مخالصة نهائية الإمارات",
  ],
  alternates: {
    canonical: "/ar/ae/final-settlement-calculator",
  },
  openGraph: {
    title: "حاسبة المخالصة النهائية في الإمارات 2026 | مكافأة وإجازة وإنذار",
    description:
      "قدّر مستحقات التصفية عبر حاسبة المخالصة النهائية في الإمارات 2026: مكافأة نهاية الخدمة (قانون العمل 33)، راتب آخر شهر، بدل رصيد الإجازات، وبدل مهلة الإنذار.",
    url: `${SITE_URL}/ar/ae/final-settlement-calculator`,
    type: "website",
    locale: "ar_AE",
  },
};

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ما هي المخالصة النهائية في الإمارات وما البنود التي تشملها؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "المخالصة النهائية وتصفية المستحقات في الإمارات هي التسوية المالية الشاملة التي يلتزم صاحب العمل بدفعها للعامل خلال 14 يوماً من انتهاء العقد وفق قانون العمل رقم 33 لسنة 2021. تشمل: الراتب المستحق عن آخر فترة عمل، مكافأة نهاية الخدمة، المقابل النقدي لرصيد الإجازات السنوية غير المستنفدة، بدل مهلة الإنذار (إن وُجد إخلال)، وأي مستحقات إضافية مخصوماً منها السلف والعهد والالتزامات المالية.",
      },
    },
    {
      "@type": "Question",
      name: "كيف تُحسب مكافأة نهاية الخدمة في قانون العمل الإماراتي الجديد رقم 33 لسنة 2021؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وفق المادة (51) من قانون العمل الإماراتي: يستحق العامل الوافد في القطاع الخاص بعد إتمام سنة كاملة مكافأة تُحسب على الراتب الأساسي: أجر 21 يوماً عن كل سنة من السنوات الخمس الأولى، وأجر 30 يوماً عن كل سنة تالية للسنوات الخمس الأولى. وتُحتسب كسور السنة بالتناسب شريطة إكمال السنة الأولى، وبحد أقصى لا يتجاوز إجمالي المكافأة أجر سنتين كاملتين (24 شهراً أساسياً).",
      },
    },
    {
      "@type": "Question",
      name: "هل يُخصم جزء من مكافأة نهاية الخدمة في حال استقالة الموظف بالإمارات؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا. ألغى قانون العمل الاتحادي الجديد رقم 33 لسنة 2021 الخصومات القديمة للاستقالة (التي كانت تخفض المكافأة للثلث أو الثلثين في القانون القديم رقم 8 لسنة 1980). في القانون الحالي يستحق الموظف المستقيل مكافأته كاملة دون أي خصم بمجرد إتمامه سنة خدمة متواصلة.",
      },
    },
    {
      "@type": "Question",
      name: "على أي راتب يُحسب بدل رصيد الإجازات السنوية غير المستخدمة عند ترك العمل؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "يُحسب التعويض النقدي عن رصيد الإجازات السنوية غير المستنفدة عند انتهاء الخدمة استناداً إلى الراتب الأساسي فقط، بقسمة الراتب الأساسي على 30 يوماً وضرب الناتج في عدد أيام الإجازة المتبقية والمستحقة للعامل.",
      },
    },
    {
      "@type": "Question",
      name: "كيف يُحسب تعويض بدل مهلة الإنذار ومن الطرف الذي يدفعه؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "يُحسب بدل الإنذار على أساس الراتب الإجمالي الأخير كاملاً (شاملاً الأساسي والبدلات كالسكن والنقل). إذا أنهى صاحب العمل العقد دون التزام بالإنذار فيلتزم بدفع تعويض الإنذار للموظف، وإذا ترك الموظف العمل دون إنذار يُخصم بدل الإنذار من مستحقاته لصالح المنشأة.",
      },
    },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "حاسبة المخالصة النهائية في الإمارات 2026",
  operatingSystem: "All",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "AED",
  },
  description:
    "حاسبة شاملة لتقدير وتصفية مستحقات نهاية الخدمة في الإمارات وفق قانون العمل الاتحادي رقم 33 لسنة 2021: مكافأة نهاية الخدمة، رصيد الإجازات، آخر راتب، وبدل الإنذار مع نموذج قابل للطباعة.",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "🇦🇪 أدوات الإمارات", item: `${SITE_URL}/ar/ae` },
    {
      "@type": "ListItem",
      position: 3,
      name: "حاسبة المخالصة النهائية في الإمارات",
      item: `${SITE_URL}/ar/ae/final-settlement-calculator`,
    },
  ],
};

export default function UaeFinalSettlementPage() {
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

      <main className="min-h-screen bg-page-bg print:bg-white print:p-0 print:m-0" dir="rtl">
        
        {/* Breadcrumb */}
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-1 no-print print:hidden">
          <nav className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Link href="/" className="hover:text-brand transition-colors">الرئيسية</Link>
            <span>›</span>
            <Link href="/ar/ae" className="hover:text-brand transition-colors">🇦🇪 أدوات الإمارات</Link>
            <span>›</span>
            <span className="text-ink font-semibold">حاسبة المخالصة النهائية</span>
          </nav>
        </div>

        {/* ── PART 1: Interactive Tool (Above the Fold) ────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 py-4 print:p-0 print:m-0 print:max-w-none">
          <UaeFinalSettlementCalculator />
        </div>

        {/* GEO / Answer-engine summary */}
        <GeoSummary
          whatItDoes="تحسب مستحقات نهاية الخدمة الشاملة للموظف في الإمارات: مكافأة نهاية الخدمة وآخر راتب ورصيد الإجازات وبدل الإنذار"
          appliesTo="دولة الإمارات العربية المتحدة — القطاع الخاص (عقود محددة وغير محددة)"
          keyRule="مكافأة نهاية الخدمة: 21 يوماً لكل سنة للسنوات الخمس الأولى ثم 30 يوماً للسنوات التالية — المرسوم 33 لسنة 2021 المادة 51"
          authority="وزارة الموارد البشرية والتوطين (MOHRE)"
          authorityUrl="https://www.mohre.gov.ae"
          lastReviewed="سبتمبر 2026"
          disclaimer="هذه الأداة استرشادية — نتائجها تقديرية. للنزاعات العمالية راجع بوابة تسوية النزاعات في MOHRE."
        />

        {/* ── PART 2: Comprehensive Explanation (300–500 Words) ────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-8 no-print print:hidden">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">
                📖 ما هي المخالصة النهائية في الإمارات وما أهميتها؟
              </h2>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                <strong className="text-ink">المخالصة النهائية وتصفية المستحقات العمالية (Final Settlement)</strong> في دولة الإمارات العربية المتحدة هي التسوية المالية الشاملة والختامية لحقوق الموظف عند انتهاء أو إنهاء علاقة العمل في القطاع الخاص، وفق أحكام <strong>المرسوم بقانون اتحادي رقم (33) لسنة 2021</strong> ولائحته التنفيذية الصادرة بالقرار الوزاري رقم (1) لسنة 2022.
              </p>
              <p>
                يُلزم القانون أصحاب العمل بتسوية كافة مستحقات العامل ومكافأة نهاية خدمته خلال مهلة أقصاها <strong>14 يوماً</strong> من تاريخ انتهاء العقد. تهدف هذه الحاسبة إلى توفير تقدير استرشادي دقيق ومفصل لكل بند من بنود التصفية قبل توقيع براءة الذمة أو اعتماد استمارة الإلغاء لدى وزارة الموارد البشرية والتوطين (MOHRE).
              </p>
            </div>

            {/* Core Settlement Components */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-3">
              <h3 className="text-sm font-extrabold text-emerald-950">ما الذي يدخل في حساب المخالصة النهائية؟</h3>
              <ul className="space-y-2 text-xs text-emerald-900 leading-relaxed list-disc list-inside">
                <li><strong className="text-ink">راتب آخر شهر:</strong> الأجر المستحق عن أيام العمل الفعلية في الشهر الأخير حتى تاريخ الانقطاع أو الإلغاء، محسوباً على الأجر الإجمالي.</li>
                <li><strong className="text-ink">مكافأة نهاية الخدمة:</strong> استحقاق العامل الوافد بعد إكمال سنة مستمرة (21 يوماً عن أول 5 سنوات و30 يوماً بعدها) على الراتب الأساسي.</li>
                <li><strong className="text-ink">بدل رصيد الإجازات السنوية:</strong> المقابل النقدي لأيام الإجازات المتراكمة غير المستنفدة محسوبة على الراتب الأساسي.</li>
                <li><strong className="text-ink">بدل مهلة الإنذار:</strong> تعويض يعادل الأجر الإجمالي عن مدة الإنذار المتبقية إذا تم إنهاء العقد دون التزام بمهلة الإنذار التعاقدية (30–90 يوماً).</li>
                <li><strong className="text-ink">مستحقات أخرى والخصومات:</strong> إضافة العمولات والرواتب المتأخرة وبدل تذكرة العودة (إن وجد استحقاقها)، وخصم السلف والقروض والعهد المسلمة.</li>
              </ul>
            </div>

            {/* Rules Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <h3 className="text-sm font-extrabold text-ink mb-2">⚖️ كيف تُحسب مكافأة نهاية الخدمة؟</h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  تنص المادة (51) على احتساب:
                  <br />• <strong>أجر 21 يوماً أساسياً</strong> عن كل سنة من السنوات الخمس الأولى.
                  <br />• <strong>أجر 30 يوماً أساسياً</strong> عن كل سنة تالية للسنوات الخمس.
                  <br />• تُحسب كسور السنة بالتناسب بعد إتمام سنة أولى كاملة.
                  <br />• يُشترط ألا يتجاوز إجمالي المكافأة <strong>أجر سنتين</strong> (24 شهراً أساسياً).
                  <br />• أُلغيت خصومات الاستقالة بالكامل في القانون الجديد.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <h3 className="text-sm font-extrabold text-ink mb-2">🏖️ كيف يُحسب بدل الإجازة والإنذار؟</h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  • <strong>بدل رصيد الإجازة:</strong> يُحسب بقسمة الراتب الأساسي على 30 يوماً وضرب الناتج في عدد أيام الإجازة المتبقية.
                  <br />• <strong>بدل مهلة الإنذار:</strong> يُحسب على الأجر الإجمالي كاملاً (الأساسي + البدلات). إذا أخل به صاحب العمل يُضاف لحساب العامل، وإذا أخل به العامل يُخصم من مستحقاته.
                </p>
              </div>
            </div>

            {/* When tool does not apply */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
              <h3 className="text-sm font-extrabold text-amber-950">⚠️ متى لا تنطبق هذه الحاسبة القياسية؟</h3>
              <ul className="space-y-1.5 text-xs text-amber-900 list-disc list-inside">
                <li><strong>المواطنون الإماراتيون:</strong> يخضعون لنظام الهيئة العامة للمعاشات (GPSSA) أو صندوق أبوظبي للتقاعد.</li>
                <li><strong>المناطق الحرة المالية (DIFC و ADGM):</strong> تطبق قوانين خاصة ونظام ادخار إلزامي كـ DEWS.</li>
                <li><strong>نظام الادخار البديل لمكافأة نهاية الخدمة:</strong> إذا كانت المنشأة مشتركة في صناديق الاستثمار المرخصة، تُدفع المستحقات عبر الصندوق الاستثماري مباشرة.</li>
                <li><strong>الدوام الجزئي والأنماط المرنة:</strong> يتطلب احتساب النسبة والتناسب بحسب ساعات العمل.</li>
              </ul>
            </div>

            {/* Step by Step */}
            <div>
              <h3 className="text-sm font-extrabold text-ink mb-3">🎯 خطوات استخدام الحاسبة</h3>
              <ol className="space-y-1.5 text-xs text-ink-secondary list-decimal list-inside">
                <li><strong className="text-ink">تحديد صفة الموظف:</strong> التحقق من كون الموظف وافداً يخضع لقانون العمل الاتحادي بالقطاع الخاص.</li>
                <li><strong className="text-ink">إدخال تواريخ الخدمة:</strong> تاريخ بدء العمل وآخر يوم عمل وأيام الإجازات غير المدفوعة.</li>
                <li><strong className="text-ink">تحديد الأجر:</strong> إدخال الراتب الأساسي والراتب الإجمالي الأخير.</li>
                <li><strong className="text-ink">تسوية آخر شهر والإجازات والإنذار:</strong> إدخال أيام العمل الأخيرة، ورصيد الإجازات المتبقية، وتفاصيل مهلة الإنذار.</li>
                <li><strong className="text-ink">إدراج الإضافات والاستقطاعات:</strong> تسجيل السلف أو العهد أو البدلات الأخرى، ثم الضغط على «معاينة نموذج المخالصة».</li>
              </ol>
            </div>

            {/* Practical Worked Example */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5 space-y-3">
              <h3 className="text-sm font-extrabold text-indigo-950">📊 مثال عملي تطبيقي بالأرقام</h3>
              <p className="text-xs text-indigo-900 leading-relaxed">
                موظف في شركة خاصة بدبي براتب أساسي <strong>6,000 درهم</strong>، وراتب إجمالي <strong>9,000 درهم</strong>، بلغت مدة خدمته <strong>4 سنوات كاملة</strong>، ولديه <strong>10 أيام إجازة سنوية غير مستخدمة</strong>، وتم الالتزام بفترة الإنذار كاملة، وله مستحقات إضافية <strong>1,000 درهم</strong>، وعليه سلفة متبقية <strong>500 درهم</strong>:
              </p>
              <div className="space-y-1.5 text-xs font-mono text-indigo-950 bg-white p-3 rounded-xl border border-indigo-100">
                <div className="flex justify-between border-b border-indigo-50 pb-1">
                  <span>أجر اليوم الأساسي (6,000 ÷ 30)</span>
                  <span className="font-bold">200.00 د.إ / يوم</span>
                </div>
                <div className="flex justify-between border-b border-indigo-50 pb-1">
                  <span>مكافأة 4 سنوات (4 × 21 يوماً × 200 درهم)</span>
                  <span className="font-bold">16,800.00 د.إ</span>
                </div>
                <div className="flex justify-between border-b border-indigo-50 pb-1">
                  <span>بدل رصيد الإجازات (10 أيام × 200 درهم)</span>
                  <span className="font-bold">2,000.00 د.إ</span>
                </div>
                <div className="flex justify-between border-b border-indigo-50 pb-1">
                  <span>مستحقات وإضافات أخرى</span>
                  <span className="font-bold">+ 1,000.00 د.إ</span>
                </div>
                <div className="flex justify-between border-b border-indigo-50 pb-1">
                  <span>استقطاع السلفة المتبقية</span>
                  <span className="font-bold text-rose-700">- 500.00 د.إ</span>
                </div>
                <div className="flex justify-between pt-1 font-black text-emerald-800 text-sm">
                  <span>صافي المخالصة النهائية المستحقة الصرف</span>
                  <span>19,300.00 درهم إماراتي</span>
                </div>
              </div>
            </div>

            {/* Official Sources */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-xs">
              <h3 className="font-extrabold text-ink">📚 المصادر الرسمية</h3>
              <p className="text-ink-muted">
                المصدر: وزارة الموارد البشرية والتوطين (MOHRE) والبوابة الرسمية لحكومة الإمارات — لا نُمثّل أي صفة حكومية رسمية.
              </p>
              <div className="space-y-1.5 pt-1">
                {[
                  {
                    label: "بوابة حكومة الإمارات — مكافأة نهاية الخدمة للعاملين بالقطاع الخاص",
                    url: "https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/end-of-service-benefits-for-employees-in-the-private-sector",
                  },
                  {
                    label: "بوابة حكومة الإمارات — إنهاء عقود العمل وفترات الإنذار",
                    url: "https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/job-offers-and-work-permits-and-contracts/terminating-employment-contracts",
                  },
                  {
                    label: "بوابة حكومة الإمارات — أنواع الإجازات واستحقاقات الإجازة السنوية",
                    url: "https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/types-of-leaves-and-entitlements-in-the-private-sector/annual-leave",
                  },
                ].map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-brand hover:underline"
                  >
                    <span>↗</span>
                    <span>{s.label}</span>
                  </a>
                ))}
              </div>
              <p className="text-[11px] text-ink-muted pt-2 border-t border-gray-200">
                آخر تحديث للمحتوى والقواعد: سبتمبر 2026م وفق قانون العمل الاتحادي رقم (33) لسنة 2021 والقرارات التنفيذية.
              </p>
            </div>
          </div>
        </section>

        {/* ── PART 3: FAQ ──────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-4 no-print print:hidden">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <div className="border-b border-brand-border pb-4 mb-6">
              <h2 className="text-xl font-extrabold text-ink">❓ الأسئلة الشائعة حول المخالصة النهائية بالإمارات</h2>
            </div>
            <div className="space-y-5">
              {[
                {
                  q: "ما هي المهلة المحددة لصاحب العمل لدفع مستحقات المخالصة النهائية بالإمارات؟",
                  a: "ألزمت المادة (53) من قانون العمل الإماراتي رقم 33 لسنة 2021 صاحب العمل بسداد جميع مستحقات ومكافأة نهاية الخدمة للعامل خلال مدة أقصاها 14 يوماً من تاريخ انتهاء عقد العمل.",
                },
                {
                  q: "هل يُلزم صاحب العمل بتوفير تذكرة عودة للموظف عند انتهاء العمل؟",
                  a: "يلتزم صاحب العمل بنفقات تذكرة العودة إلى موطن العامل أو أي مكان متفق عليه في حال مغادرته الدولة، ما لم يكن العامل قد التحق بعمل لدى منشأة أخرى داخل الدولة.",
                },
                {
                  q: "هل تدخل بدلات السكن والمواصلات في حساب مكافأة نهاية الخدمة بالإمارات؟",
                  a: "لا. تنص المادة (51) صراحة على أن مكافأة نهاية الخدمة تُحسب حصراً على 'الراتب الأساسي' الأخير، دون أي بدلات كالسكن أو الانتقال أو البدلات المتغيرة.",
                },
                {
                  q: "ما هو الحد الأقصى القانوني لمكافأة نهاية الخدمة في قانون العمل الإماراتي؟",
                  a: "اشترط قانون العمل الإماراتي ألا يتجاوز إجمالي مكافأة نهاية الخدمة المستحقة للعامل مهما بلغت سنوات خدمته أجر سنتين كاملتين (أي ما يعادل راتب 24 شهراً أساسياً).",
                },
                {
                  q: "هل هذا النموذج يُعتبر تسوية قانونية نهائية أو وثيقة صادرة عن MOHRE؟",
                  a: "لا. هذا النموذج تقديري وإرشادي يهدف لمساعدة الموظفين وأصحاب الأعمال على التدقيق المالي لحقوقهم، ولا يُعد وثيقة رسمية معتمدة من وزارة الموارد البشرية والتوطين أو بديلاً عن العقود والقرارات الرسمية.",
                },
              ].map((item, i) => (
                <div key={i} className="border-b border-brand-border pb-5 last:border-b-0 last:pb-0">
                  <h3 className="text-sm font-extrabold text-ink mb-2">س: {item.q}</h3>
                  <p className="text-sm text-ink-secondary leading-relaxed">ج: {item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contextual Link to Notice Period Calculator ───────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-2 no-print print:hidden">
          <div className="rounded-2xl border-2 border-blue-500/30 bg-blue-50/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⏳</span>
              <div>
                <h3 className="text-sm font-extrabold text-blue-950">
                  هل تريد حساب تاريخ نهاية فترة الإنذار وبدل الأيام غير المنفذة؟
                </h3>
                <p className="text-xs text-blue-800 mt-0.5">
                  احسب تاريخ آخر يوم عمل وبدل الإنذار المستحق للموظف أو صاحب العمل بدقة بموجب المادة (43).
                </p>
              </div>
            </div>
            <Link
              href="/ar/ae/notice-period-calculator"
              className="shrink-0 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-black px-4 py-2.5 transition shadow"
            >
              حاسبة فترة الإنذار في الإمارات ←
            </Link>
          </div>
        </section>

        {/* ── PART 4: Related Tools ─────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-4 pb-12 no-print print:hidden">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <div className="border-b border-brand-border pb-4 mb-5">
              <h2 className="text-lg font-extrabold text-ink">🔗 أدوات وحاسبات ذات صلة بدولة الإمارات</h2>
              <p className="text-xs text-ink-muted mt-1">حاسبات عمالية ومالية متكاملة لبيئة العمل الإماراتية</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  href: "/ar/ae/notice-period-calculator",
                  icon: "⏳",
                  title: "حاسبة فترة الإنذار في الإمارات",
                  desc: "احسب آخر يوم عمل والأيام غير المنفذة وبدل الإنذار للموظف أو الشركة وفق المادة 43.",
                  badge: "المادة 43",
                  badgeColor: "bg-blue-100 text-blue-800 font-bold",
                },
                {
                  href: "/gratuity-calculator/uae",
                  icon: "🎖️",
                  title: "حاسبة مكافأة نهاية الخدمة في الإمارات",
                  desc: "احسب بند مكافأة نهاية الخدمة تفصيلياً وفق المادة 51 مع سقف السنتين وقواعد الحساب.",
                  badge: "المادة 51",
                  badgeColor: "bg-amber-100 text-amber-800",
                },
                {
                  href: "/salary-calculator/uae",
                  icon: "💰",
                  title: "حاسبة الراتب الصافي في الإمارات (WPS)",
                  desc: "احسب راتبك الشهري الصافي المحول بالدرهم عبر مسيرات حماية الأجور WPS بدون ضرائب دخل.",
                  badge: "نظام WPS",
                  badgeColor: "bg-emerald-100 text-emerald-800",
                },
                {
                  href: "/overtime-calculator/uae",
                  icon: "⏱️",
                  title: "حاسبة الأوفرتايم في الإمارات (125% و 150%)",
                  desc: "احسب ساعات العمل الإضافي النهارية والليلية والعطلات الأسبوعية وفق المادة 19 من قانون العمل.",
                  badge: "المادة 19",
                  badgeColor: "bg-blue-100 text-blue-800",
                },
                {
                  href: "/vat-calculator/uae",
                  icon: "🧾",
                  title: "حاسبة ضريبة القيمة المضافة في الإمارات 5%",
                  desc: "احسب ضريبة الـ 5% وفق لوائح الهيئة الاتحادية للضرائب FTA أو استخرج السعر قبل الضريبة.",
                  badge: "FTA 5%",
                  badgeColor: "bg-purple-100 text-purple-800",
                },
                {
                  href: "/ar/ae",
                  icon: "🇦🇪",
                  title: "مجمع أدوات وحاسبات الإمارات",
                  desc: "الدليل الشامل لكافة الحاسبات العمالية والمالية والضريبية المخصصة لدولة الإمارات.",
                  badge: "المجمع الشامل",
                  badgeColor: "bg-emerald-700 text-white font-black",
                },
              ].map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex items-start gap-3 rounded-xl border border-brand-border bg-white p-4 hover:border-brand hover:shadow-md transition-all"
                >
                  <span className="text-2xl shrink-0 mt-0.5">{tool.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-ink group-hover:text-brand transition-colors">
                        {tool.title}
                      </span>
                      {tool.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tool.badgeColor}`}>
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed">{tool.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
