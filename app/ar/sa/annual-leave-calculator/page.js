import AnnualLeaveCalculator from "@/components/AnnualLeaveCalculator";
import Link from "next/link";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://arabic-tools-xi.vercel.app";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: "حاسبة بدل الإجازات السنوية في السعودية 2026 | المادتان 109 و111 نظام العمل",
  description:
    "احسب رصيد إجازتك السنوية وأجر أيام الإجازة والتعويض النقدي عن رصيد الإجازات المتبقية عند نهاية الخدمة وفق المادتين (109 و111) من نظام العمل السعودي الصادر بالمرسوم الملكي م/51.",
  keywords: [
    "حاسبة بدل الإجازات السنوية السعودية",
    "المادة 109 نظام العمل السعودي",
    "المادة 111 نظام العمل",
    "حساب رصيد الإجازات السنوية",
    "تعويض الإجازات غير المستنفدة",
    "بدل الإجازة عند نهاية الخدمة",
    "أجر الإجازة السنوية بالأجر الفعلي",
  ],
  alternates: {
    canonical: `${BASE_URL}/ar/sa/annual-leave-calculator`,
  },
  openGraph: {
    title: "حاسبة بدل الإجازات السنوية في السعودية 2026 | نظام العمل السعودي",
    description:
      "احسب أجر الإجازة السنوية والتعويض النقدي عن رصيد الإجازات المتبقية بدقة وفق نظام العمل السعودي (الأجر الفعلي وقاسم 30 يوماً).",
    url: `${BASE_URL}/ar/sa/annual-leave-calculator`,
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
      name: "كم عدد أيام الإجازة السنوية المستحقة للعامل في نظام العمل السعودي؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وفق المادة (109) من نظام العمل السعودي الصادر بالمرسوم الملكي (م/51): يستحق العامل إجازة سنوية مدفوعة الأجر لا تقل عن 21 يوماً عن كل سنة قضاها في الخدمة، وتُزاد إلى 30 يوماً كاملة متصلة إذا أمضى العامل 5 سنوات متصلة في خدمة نفس صاحب العمل.",
      },
    },
    {
      "@type": "Question",
      name: "كيف يُحسب التعويض النقدي عن رصيد الإجازة السنوية غير المستنفدة بموجب المادة 111؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "تنص المادة (111) من نظام العمل على أن العامل يستحق عند انتهاء خدمته أجراً عن أيام الإجازة المستحقة له ولم يستنفدها. يُحسب التعويض بقسمة الراتب الفعلي الأخير (الأساسي + البدلات الثابتة كالسكن والنقل) على 30 للحصول على أجر اليوم الواحد، ثم ضربه في عدد أيام الرصيد المتبقية.",
      },
    },
    {
      "@type": "Question",
      name: "هل يُحسب بدل الإجازة على الراتب الأساسي أم الراتب الفعلي الشامل للبدلات؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "يُحسب بدل الإجازة السنوية والتعويض عنها على أساس 'الأجر الفعلي' الأخير للعامل، وهو الراتب الأساسي مضافاً إليه جميع البدلات المعتادة الثابتة المقررة كبدل السكن وبدل النقل، عملاً بالمادة (2) وأحكام المحاكم العمالية وقرارات وزارة الموارد البشرية والتنمية الاجتماعية.",
      },
    },
    {
      "@type": "Question",
      name: "هل يجوز تأجيل الإجازة السنوية أو النزول عنها بمقابل مالي أثناء استمرار العقد؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وفق نظام العمل السعودي، لا يجوز للعامل التنازل عن إجازته السنوية أو تقاضي بدل نقدي عنها أثناء سريان عقد العمل بهدف التمتع بالراحة الجسدية. ولكن يجوز لصاحب العمل تأجيل إجازة العامل بعد نهاية سنتها لـ 90 يوماً كحد أقصى بظروف العمل، وبموافقة العامل كتابياً يجوز تأجيلها لنهاية السنة التالية فقط.",
      },
    },
    {
      "@type": "Question",
      name: "ما العلاقة بين حاسبة رصيد الإجازات وحاسبة المخالصة النهائية؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "بدل رصيد الإجازات السنوية غير المستنفدة هو أحد البنود الأربعة الأساسية المكونة لـ 'حاسبة المخالصة النهائية' في السعودية؛ حيث تدمج المخالصة رصيد الإجازات مع كسر راتب الشهر الأخير ومكافأة نهاية الخدمة (م 84/85) وبدل مهلة الإشعار في وثيقة موحدة.",
      },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "أدوات السعودية", item: `${BASE_URL}/ar/sa/` },
    { "@type": "ListItem", position: 3, name: "حاسبة بدل الإجازات السنوية", item: `${BASE_URL}/ar/sa/annual-leave-calculator` },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "حاسبة بدل الإجازات السنوية في السعودية 2026",
  operatingSystem: "All",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "SAR",
  },
  description:
    "احسب رصيد إجازتك السنوية وأجر أيام الإجازة والتعويض النقدي عن رصيد الإجازات المتبقية في نظام العمل السعودي (المادتان 109 و111).",
};

export default function SaudiAnnualLeavePage() {
  return (
    <>
      {/* JSON-LD Schemas */}
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
            <Link href="/ar/sa/" className="hover:text-brand transition-colors">
              🇸🇦 أدوات السعودية
            </Link>
            <span>›</span>
            <span className="text-ink font-semibold">حاسبة بدل الإجازات السنوية</span>
          </nav>
        </div>

        {/* ── PART 1: Calculator on Top ─────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 py-4">
          <AnnualLeaveCalculator />
        </div>

        {/* ── PART 2: 300-500 words Editorial Explanation ─────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">
                🏖️ ما هو بدل الإجازات السنوية في نظام العمل السعودي؟
              </h2>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                يُعدّ حق العامل في الإجازة السنوية مدفوعة الأجر أحد أهم الضمانات القانونية المنصوص عليها في <strong className="text-ink">نظام العمل السعودي الصادر بالمرسوم الملكي رقم (م/51)</strong>. حددت المادة (109) استحقاق العامل الأدنى بـ <strong>21 يوماً</strong> تقويمياً مدفوعة الأجر عن كل عام يقضيه في العمل، وتزاد وجوباً إلى <strong>30 يوماً</strong> كاملة إذا أكمل العامل 5 سنوات متصلة في خدمة نفس صاحب العمل.
              </p>
              <p>
                وعند انتهاء العلاقة العمالية، سواءً بسبب الاستقالة أو انتهاء العقد أو فسخه، أوجبت <strong className="text-ink">المادة (111)</strong> من نظام العمل أن يُصرف للعامل بدل نقدي عن كامل رصيد الإجازات السنوية المتراكمة المستحقة التي لم يستنفدها خلال فترة خدمته، بما في ذلك كسور السنة بنسبة ما قضاه منها في العمل.
              </p>
            </div>

            {/* How to use */}
            <div className="rounded-xl border border-brand-border bg-brand-surface/40 p-4 space-y-2">
              <h3 className="text-sm font-extrabold text-ink">
                📋 كيفية استخدام الحاسبة خطوة بخطوة:
              </h3>
              <ol className="list-decimal list-inside text-xs leading-relaxed text-ink-secondary space-y-1.5">
                <li>
                  <strong>أدخل الراتب الفعلي الشهري:</strong> الراتب الأساسي مضافاً إليه بدلات السكن والنقل الثابتة (وفق المادة 2).
                </li>
                <li>
                  <strong>حدد عدد سنوات الخدمة:</strong> لتحديد استحقاقك السنوي تلقائياً (21 يوماً لأقل من 5 سنوات، أو 30 يوماً لـ 5 سنوات فأكثر).
                </li>
                <li>
                  <strong>أدخل رصيد الأيام المتبقية:</strong> عدد أيام الإجازات السنوية المتراكمة التي لم تأخذها حتى آخر يوم عمل.
                </li>
                <li>
                  <strong>راجع النتائج الفورية:</strong> أجر اليوم الواحد، وأجر فترة الإجازة السنوية، وصافي التعويض النقدي المستحق لمستند المخالصة.
                </li>
              </ol>
            </div>

            {/* Numeric Example */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
              <h3 className="text-sm font-extrabold text-emerald-900">
                🔢 مثال عملي بالأرقام وفق المادة (111):
              </h3>
              <div className="text-xs leading-relaxed text-emerald-800 space-y-1">
                <p>• موظف في شركة بالرياض راتبه الأساسي 7,500 ر.س وبدل السكن 1,500 ر.س وبدل النقل 1,000 ر.س (إجمالي الأجر الفعلي = <strong>10,000 ر.س</strong>).</p>
                <p>• أمضى في المنشأة <strong>6 سنوات</strong>، وله رصيد إجازات لم يُستنفد مقداره <strong>18 يوماً</strong> عند انتهاء خدمته.</p>
                <p>• الأجر اليومي = 10,000 ÷ 30 = <strong>333.33 ر.س</strong>.</p>
                <p>• بدل رصيد الإجازة النقدي المستحق = 18 × 333.33 = <strong className="text-emerald-950 font-black">6,000.00 ر.س</strong> يُصرف بالكامل في المخالصة النهائية دون أي استقطاعات.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── PART 3: FAQ Section (الأسئلة الشائعة) ────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 pb-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <h2 className="text-xl font-extrabold text-ink border-b border-brand-border pb-4">
              ❓ الأسئلة الشائعة حول بدل الإجازة السنوية في السعودية
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
              🔗 أدوات وحاسبات سعودية ذات صلة
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
                    <p className="text-[11px] text-ink-muted">تصفية شاملة: الإجازات + المكافأة + آخر راتب</p>
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
                    <p className="text-sm font-bold text-ink group-hover:text-brand">حاسبة نهاية الخدمة</p>
                    <p className="text-[11px] text-ink-muted">المادتان 84 و85 بحالات الاستقالة والفسخ</p>
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
                    <p className="text-[11px] text-ink-muted">صافي الراتب بعد خصم التأمينات وساند 10%</p>
                  </div>
                </div>
                <span className="text-brand font-bold">←</span>
              </Link>

              <Link
                href="/overtime-calculator/saudi"
                className="group flex items-center justify-between rounded-xl border border-brand-border p-3.5 hover:border-brand hover:bg-brand-surface/30 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">⏱️</span>
                  <div>
                    <p className="text-sm font-bold text-ink group-hover:text-brand">حاسبة العمل الإضافي</p>
                    <p className="text-[11px] text-ink-muted">أجر ساعات الأوفر تايم بنسبة 150% (م/107)</p>
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
