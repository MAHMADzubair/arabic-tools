import Article77Calculator from "@/components/Article77Calculator";
import Link from "next/link";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://arabic-tools-xi.vercel.app";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: "حاسبة تعويض المادة 77 في السعودية 2026 | الفصل لسبب غير مشروع",
  description:
    "احسب تعويض إنهاء عقد العمل لسبب غير مشروع (الفصل التعسفي) بدقة وفق المادة (77) من نظام العمل السعودي الصادر بالمرسوم الملكي م/51، للعقود محددة وغير محددة المدة مع تطبيق حد الشهرين الأدنى.",
  keywords: [
    "تعويض المادة 77 نظام العمل",
    "حاسبة المادة 77 السعودية",
    "الفصل التعسفي نظام العمل السعودي",
    "تعويض انهاء العقد لسبب غير مشروع",
    "المادة 77 من نظام العمل",
    "كم تعويض الفصل التعسفي",
    "الحد الادنى للمادة 77 شهرين",
  ],
  alternates: {
    canonical: `${BASE_URL}/ar/sa/article-77-calculator`,
  },
  openGraph: {
    title: "حاسبة تعويض المادة 77 في السعودية 2026 | الفصل لسبب غير مشروع",
    description:
      "احسب تعويض إنهاء عقد العمل التعسفي: 15 يوماً عن كل سنة خدمة أو أجر المدة المتبقية بحد أدنى أجر شهرين وفق نظام العمل السعودي.",
    url: `${BASE_URL}/ar/sa/article-77-calculator`,
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
      name: "ما هو تعويض المادة 77 من نظام العمل السعودي وكيف يُحسب؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "المادة (77) هي النص القانوني المنظم للتعويض المالي المستحق عند قيام أحد طرفي عقد العمل بإنهائه لسبب غير مشروع (دون مسوغ قانوني نظامي). يُحسب التعويض في العقد غير محدد المدة بأجر 15 يوماً عن كل سنة خدمة، وفي العقد محدد المدة بأجر المدة المتبقية من العقد، مع اشتراط ألا يقل التعويض في كلتا الحالتين عن أجر شهرين كاملين للعامل.",
      },
    },
    {
      "@type": "Question",
      name: "ما هو الحد الأدنى للتعويض المقرر بموجب المادة (77)؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "تنص الفقرة (3) من المادة (77) صراحة على أنه: 'يجب ألا يقل التعويض المشار إليه في الفقرتين (1) و(2) من هذه المادة عن أجر العامل لمدة شهرين'. فلو كان ناتج الحساب الرياضي لموظف خدم سنة واحدة يعادل نصف شهر فقط، يُرفع التعويض وجوباً بحكم النظام ليصبح أجر شهرين كاملين.",
      },
    },
    {
      "@type": "Question",
      name: "هل يُلزم العامل بدفع تعويض لصاحب العمل إذا استقال دون سبب مشروع؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم؛ نص المادة (77) جاء عاماً ومتبادلاً لحماية الطرفين، حيث ينص على: 'ما لم يتضمن العقد تعويضاً محدداً مقابل إنهائه من أحد الطرفين لسبب غير مشروع، يستحق الطرف المتضرر من إنهاء العقد تعويضاً...'. فإذا فسخ العامل العقد محدد المدة دون سبب مشروع وترك العمل، يحق للمنشأة مطالبته بأجر المدة المتبقية أو إثبات الضرر لدى المحكمة العمالية.",
      },
    },
    {
      "@type": "Question",
      name: "هل يستحق العامل مكافأة نهاية الخدمة بالإضافة إلى تعويض المادة (77)؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، استقر قضاء المحاكم العمالية في المملكة على أن تعويض المادة (77) هو تعويض جابر للضرر الناتج عن الإنهاء غير المشروع للعقد، ولا يسقط حق العامل في مستحقاته النظامية الأخرى المقررة، كـ مكافأة نهاية الخدمة (م/84)، وبدل رصيد الإجازات السنوية (م/111)، وبدل مهلة الإشعار، ورواتبه المتأخرة، وتُجمع كلها في سند المخالصة النهائية.",
      },
    },
    {
      "@type": "Question",
      name: "هل يجوز الاتفاق في عقد العمل على تعويض أكبر أو أقل من المادة 77؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، بدأت المادة 77 بعبارة 'ما لم يتضمن العقد تعويضاً محدداً مقابل إنهائه'، مما يعني أن الشرط الجزائي المتفق عليه في العقد يُقدَّم على التعويض النظامي، شريطة ألا يخالف القواعد الآمرة التي تحمي الطرف الضعيف في العقد أو يؤدي إلى غبن فاحش.",
      },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "أدوات السعودية", item: `${BASE_URL}/ar/sa` },
    { "@type": "ListItem", position: 3, name: "حاسبة المادة 77 (الفصل غير المشروع)", item: `${BASE_URL}/ar/sa/article-77-calculator` },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "حاسبة تعويض المادة 77 في السعودية 2026",
  operatingSystem: "All",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "SAR",
  },
  description:
    "احسب تعويض إنهاء عقد العمل لسبب غير مشروع في نظام العمل السعودي (المادة 77): 15 يوماً عن كل سنة، أو أجر المدة المتبقية، مع تطبيق حد الشهرين الأدنى.",
};

export default function Article77Page() {
  return (
    <>
      {/* Schemas */}
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
        {/* Breadcrumb */}
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
            <span className="text-ink font-semibold">حاسبة تعويض المادة 77</span>
          </nav>
        </div>

        {/* ── PART 1: Calculator on Top ─────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Article77Calculator />
        </div>

        {/* ── PART 2: 300-500 words Editorial Explanation ─────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">
                📖 ما هي المادة 77 من نظام العمل السعودي وما أحكامها؟
              </h2>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                تُعدّ <strong className="text-ink">المادة (77) من نظام العمل السعودي الصادر بالمرسوم الملكي رقم (م/51)</strong> النص الجوهري الفاصل في قضايا النزاعات العمالية الناتجة عن إنهاء العلاقة التعاقدية لسبب غير مشروع، وهو ما يُعرف شائعاً بـ <strong className="text-ink">الفصل التعسفي</strong>. وضعت هذه المادة معايير مالية إلزامية لجبر الضرر الذي يلحق بأحد طرفي العقد عندما يُخلّ الطرف الآخر بالالتزام التعاقدي دون مسوغ نظامي معتبر بموجب المادة (80) أو المادة (81).
              </p>
              <p>
                يقوم التعويض النظامي في المادة 77 على التفرقة الدقيقة بين حالتين رئيستَين:
              </p>
              <ul className="list-disc list-inside space-y-1 pr-2">
                <li>
                  <strong>العقد غير محدد المدة:</strong> يستحق الطرف المتضرر أجر <strong>15 يوماً</strong> عن كل سنة قضاها العامل في الخدمة (محسوبة بنسبة كسور السنة أيضاً).
                </li>
                <li>
                  <strong>العقد محدد المدة:</strong> يستحق الطرف المتضرر أجر <strong>كامل المدة الباقية</strong> من العقد حتى تاريخ انتهائه المتفق عليه.
                </li>
              </ul>
              <p>
                وجاءت الفقرة (3) من المادة لتضع صمام أمان حاسم: <strong>"يجب ألا يقل التعويض عن أجر العامل لمدة شهرين"</strong>، وهذا يعني أنه حتى لو كان العامل قد خدم أشهراً معدودة أو بقيت أيام قليلة، فإن الحد الأدنى القانوني الذي لا يجوز النزول عنه هو أجر شهرين كاملين.
              </p>
            </div>

            {/* How to use */}
            <div className="rounded-xl border border-brand-border bg-brand-surface/40 p-4 space-y-2">
              <h3 className="text-sm font-extrabold text-ink">
                📋 كيفية استخدام الحاسبة خطوة بخطوة:
              </h3>
              <ol className="list-decimal list-inside text-xs leading-relaxed text-ink-secondary space-y-1.5">
                <li>
                  <strong>اختر نوع العقد:</strong> محدد المدة (ينتهي بتاريخ معين) أو غير محدد المدة.
                </li>
                <li>
                  <strong>حدد الطرف المنهي للعقد:</strong> صاحب العمل (لصالح الموظف) أو العامل (لصالح المنشأة).
                </li>
                <li>
                  <strong>أدخل مفردات الراتب:</strong> الراتب الأساسي والبدلات الثابتة لحساب الأجر الفعلي.
                </li>
                <li>
                  <strong>أدخل المدة:</strong> سنوات الخدمة (لغير محدد المدة) أو المدة المتبقية بالأشهر (لمحدد المدة).
                </li>
                <li>
                  <strong>استخرج النتيجة الفورية:</strong> تظهر لك قيمة التعويض، وسند الاحتساب، وما إذا طُبِّق حد الشهرين الأدنى، مع إمكانية المشاركة الفورية عبر واتساب.
                </li>
              </ol>
            </div>

            {/* Numeric Example */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
              <h3 className="text-sm font-extrabold text-emerald-900">
                🔢 مثال عملي بالأرقام وفق المادة (77):
              </h3>
              <div className="text-xs leading-relaxed text-emerald-800 space-y-1">
                <p>• موظف سعودي بعقد غير محدد المدة، راتبه الأساسي 8,000 ر.س وبدل السكن 2,000 ر.س (إجمالي الأجر الفعلي = <strong>10,000 ر.س</strong>).</p>
                <p>• أنهت الشركة خدماته دون سبب مشروع بعد <strong>سنة ونصف (1.5 سنة)</strong> خدمة.</p>
                <p>• الحساب الأولي: 1.5 سنة × أجر 15 يوماً (5,000 ر.س) = <strong>7,500 ر.س</strong>.</p>
                <p>• فحص الحد الأدنى: أجر شهرين = 2 × 10,000 = <strong>20,000 ر.س</strong>.</p>
                <p>• <strong className="text-emerald-950 font-black">التعويض الملزم نظاماً: 20,000 ر.س</strong> بحكم تطبيق الحد الأدنى الإلزامي الوارد في الفقرة (3) من المادة 77، بالإضافة إلى استحقاقه الكامل لمكافأة نهاية الخدمة وبدل الإجازات.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── PART 3: FAQ Section (الأسئلة الشائعة) ────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 pb-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <h2 className="text-xl font-extrabold text-ink border-b border-brand-border pb-4">
              ❓ الأسئلة الأكثر شيوعاً حول تعويض الفصل التعسفي (المادة 77)
            </h2>
            <div className="space-y-4">
              {faqJsonLd.mainEntity.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-brand-border/60 bg-brand-surface/30 p-4 space-y-1.5"
                >
                  <h3 className="text-sm font-bold text-ink">{item.name}</h3>
                  <p className="text-xs leading-relaxed text-ink-secondary">
                    {item.acceptedAnswer.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PART 4: Related Saudi Tools (أدوات ذات صلة) ──────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-4">
            <h2 className="text-base font-extrabold text-ink">
              🔗 أدوات وحاسبات منظومة العمل السعودية المتكاملة
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/ar/sa/final-settlement-calculator"
                className="group flex items-center justify-between rounded-xl border-2 border-brand/20 bg-brand-surface p-3.5 hover:border-brand transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">📋</span>
                  <div>
                    <p className="text-sm font-bold text-ink group-hover:text-brand">حاسبة المخالصة النهائية</p>
                    <p className="text-[11px] text-ink-muted">تصفية شاملة: آخر راتب + مكافأة + إجازات + إشعار</p>
                  </div>
                </div>
                <span className="text-brand font-bold">←</span>
              </Link>

              <Link
                href="/gratuity-calculator/saudi"
                className="group flex items-center justify-between rounded-xl border border-brand-border p-3.5 hover:border-brand hover:bg-brand-surface/30 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🎖️</span>
                  <div>
                    <p className="text-sm font-bold text-ink group-hover:text-brand">حاسبة مكافأة نهاية الخدمة</p>
                    <p className="text-[11px] text-ink-muted">المادتان 84 و85 بحالات الاستقالة والفسخ والتقاعد</p>
                  </div>
                </div>
                <span className="text-brand font-bold">←</span>
              </Link>

              <Link
                href="/ar/sa/annual-leave-calculator"
                className="group flex items-center justify-between rounded-xl border border-brand-border p-3.5 hover:border-brand hover:bg-brand-surface/30 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🏖️</span>
                  <div>
                    <p className="text-sm font-bold text-ink group-hover:text-brand">حاسبة رصيد الإجازات السنوية</p>
                    <p className="text-[11px] text-ink-muted">المادتان 109 و111 بالأجر الفعلي وقاسم 30</p>
                  </div>
                </div>
                <span className="text-brand font-bold">←</span>
              </Link>

              <Link
                href="/salary-calculator/saudi"
                className="group flex items-center justify-between rounded-xl border border-brand-border p-3.5 hover:border-brand hover:bg-brand-surface/30 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">💰</span>
                  <div>
                    <p className="text-sm font-bold text-ink group-hover:text-brand">حاسبة الراتب في السعودية</p>
                    <p className="text-[11px] text-ink-muted">صافي الراتب بعد استقطاع التأمينات وساند 10%</p>
                  </div>
                </div>
                <span className="text-brand font-bold">←</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
