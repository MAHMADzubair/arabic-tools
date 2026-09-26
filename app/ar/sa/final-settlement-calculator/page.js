import FinalSettlementCalculator from "@/components/FinalSettlementCalculator";
import Link from "next/link";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: "حاسبة المخالصة النهائية في السعودية 2026 | مكافأة وإجازة وإشعار",
  description:
    "احسب مستحقاتك بدقة عبر حاسبة المخالصة النهائية في السعودية 2026: تقدير راتب آخر شهر، مكافأة نهاية الخدمة، بدل رصيد الإجازات السنوية، تعويض مهلة الإشعار، والإضافات والخصومات لصافي التصفية.",
  keywords: [
    "حاسبة المخالصة النهائية السعودية",
    "حساب مكافأة نهاية الخدمة",
    "المادة 84 نظام العمل",
    "المادة 85 نظام العمل",
    "بدل الإجازة السنوية",
    "مهلة الإشعار السعودية",
    "نموذج مخالصة نهائية",
    "EOSB Saudi Arabia",
    "final settlement calculator Saudi",
    "حساب نهاية الخدمة",
  ],
  alternates: {
    canonical: "https://arabic-tools-xi.vercel.app/ar/sa/final-settlement-calculator",
  },
  openGraph: {
    title: "حاسبة المخالصة النهائية في السعودية 2026 | مكافأة وإجازة وإشعار",
    description:
      "احسب مستحقاتك بدقة عبر حاسبة المخالصة النهائية في السعودية 2026: تقدير راتب آخر شهر، مكافأة نهاية الخدمة، بدل رصيد الإجازات السنوية، تعويض مهلة الإشعار، والإضافات والخصومات لصافي التصفية.",
    url: "https://arabic-tools-xi.vercel.app/ar/sa/final-settlement-calculator",
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
      name: "كيف تُحسب مكافأة نهاية الخدمة في السعودية وفق المادة 84؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وفق المادة (84) من نظام العمل السعودي: يستحق العامل نصف أجر شهري عن كل سنة من السنوات الخمس الأولى، وأجر شهر كامل عن كل سنة تزيد على ذلك. السنوات الكسرية تحتسب بالتناسب. مثال: موظف راتبه 10,000 ر.س وخدمته 7 سنوات = (10,000 × 0.5 × 5) + (10,000 × 1 × 2) = 25,000 + 20,000 = 45,000 ر.س.",
      },
    },
    {
      "@type": "Question",
      name: "هل يستحق المستقيل مكافأة نهاية الخدمة كاملة في السعودية؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وفق المادة (85): المستقيل قبل سنتين لا يستحق شيئاً. بين سنتين و5 سنوات يستحق ثلث المكافأة. بين 5 و10 سنوات يستحق ثلثي المكافأة. بعد 10 سنوات يستحق المكافأة كاملة. أما في حالات الإنهاء من صاحب العمل أو التقاعد أو الإنهاء بالتراضي فيستحق الموظف المكافأة كاملة بصرف النظر عن مدة الخدمة.",
      },
    },
    {
      "@type": "Question",
      name: "ما هي مدة مهلة الإشعار في نظام العمل السعودي؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وفق المادة (75) من نظام العمل: في عقود غير محددة المدة مع الرواتب الشهرية، مهلة الإشعار 30 يوماً إذا كان الموظف هو من يُخطر بترك العمل، و60 يوماً إذا كان صاحب العمل هو من يُنهي الخدمة. الطرف الذي لا يُلتزم بمهلة الإشعار يلتزم بدفع مقابل الأجر عن المدة المتبقية.",
      },
    },
    {
      "@type": "Question",
      name: "كيف يُحسب بدل الإجازة السنوية غير المستنفدة عند ترك العمل؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وفق المادة (111) من نظام العمل: عند ترك العمل يستحق الموظف تعويضاً نقدياً كاملاً عن جميع أيام إجازاته السنوية التي لم يأخذها. يُحسب الأجر اليومي بقسمة الراتب الشهري على 30 (أو الأساس المتفق عليه)، ثم ضرب الناتج في عدد أيام الإجازة المستحقة. مثال: راتب 9,000 ر.س و20 يوم إجازة = (9,000 ÷ 30) × 20 = 300 × 20 = 6,000 ر.س.",
      },
    },
    {
      "@type": "Question",
      name: "ما الأجر المعتمد لحساب مكافأة نهاية الخدمة في السعودية — الأساسي أم الإجمالي؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "أشارت وزارة الموارد البشرية والتنمية الاجتماعية إلى أن المكافأة تُحتسب على الأجر الفعلي المستحق للعامل، والذي يشمل الراتب الأساسي والبدلات الثابتة الدورية (سكن، نقل، بدلات أخرى). ويُنصح دائماً بمراجعة نص عقد العمل ولوائح المنشأة لتحديد التعريف الدقيق للأجر المعتمد.",
      },
    },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "حاسبة المخالصة النهائية في السعودية 2026",
  operatingSystem: "All",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "SAR",
  },
  description:
    "احسب مخالصتك وتصفية مستحقاتك بدقة وفق نظام العمل السعودي 2026: مكافأة نهاية الخدمة، رصيد الإجازات، آخر راتب، وبدل الإشعار مع طباعة نموذج مخالصة قابل للطباعة.",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: "https://arabic-tools-xi.vercel.app" },
    { "@type": "ListItem", position: 2, name: "أدوات السعودية", item: "https://arabic-tools-xi.vercel.app/ar/sa/" },
    { "@type": "ListItem", position: 3, name: "حاسبة المخالصة النهائية", item: "https://arabic-tools-xi.vercel.app/ar/sa/final-settlement-calculator" },
  ],
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FinalSettlementPage() {
  return (
    <>
      {/* JSON-LD */}
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
            <Link href="/" className="hover:text-brand transition-colors">الرئيسية</Link>
            <span>›</span>
            <Link href="/ar/sa/" className="hover:text-brand transition-colors">🇸🇦 أدوات السعودية</Link>
            <span>›</span>
            <span className="text-ink font-semibold">حاسبة المخالصة النهائية</span>
          </nav>
        </div>

        {/* ── PART 1: Calculator ─────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 py-4">
          <FinalSettlementCalculator />
        </div>

        {/* ── PART 2: Editorial Explanation (300-500 words) ──────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">

            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">
                📖 ما هي المخالصة النهائية وما أهميتها القانونية؟
              </h2>
            </div>

            {/* What */}
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                <strong className="text-ink">المخالصة النهائية</strong> هي التصفية الشاملة لجميع الحقوق المالية المتبادلة بين العامل وصاحب العمل عند انتهاء علاقة العمل. تشمل كل ما استحقه العامل من مستحقات طوال مدة خدمته، وما قد يكون على العامل من ديون ومديونيات لصاحب العمل. في المملكة العربية السعودية، يُعدّ إنجاز المخالصة بصورة صحيحة ودقيقة أمراً بالغ الأهمية، إذ يحمي كلا الطرفين من النزاعات العمالية ودعاوى المطالبة المستقبلية.
              </p>
              <p>
                نظام العمل السعودي الصادر بالمرسوم الملكي (م/51) يُحدد بدقة حقوق العامل عند انتهاء الخدمة. وقد شهدت المواد الجوهرية المنظِّمة لهذه العلاقة — كالمادتين (84) و(85) الخاصتين بمكافأة نهاية الخدمة، والمادة (111) الخاصة ببدل الإجازة السنوية، والمادتين (75) و(76) الخاصتين بمهلة الإشعار — أحدث التعديلات النظامية لعام 2026 وفق النص الرسمي لوزارة الموارد البشرية والتنمية الاجتماعية. تعكس هذه الحاسبة هذه التعديلات للتأكد من دقة الحسابات.
              </p>
            </div>

            {/* How to use */}
            <div>
              <h3 className="text-base font-extrabold text-ink mb-3">🔢 كيفية الاستخدام — خطوة بخطوة</h3>
              <ol className="space-y-2 text-sm text-ink-secondary list-none">
                {[
                  ["١", "أدخل بيانات الموظف وجهة العمل للنموذج القابل للطباعة (اختياري للحساب)."],
                  ["٢", "حدد نوع العقد (محدد / غير محدد) وسبب إنهاء الخدمة — هذان الخياران يحددان نسبة مكافأة نهاية الخدمة."],
                  ["٣", "أدخل تاريخَي الالتحاق وآخر يوم عمل لحساب مدة الخدمة تلقائياً."],
                  ["٤", "أدخل هيكل الراتب الكامل (أساسي + بدلات). اختر قاسم الشهر المناسب (÷30 الأكثر شيوعاً)."],
                  ["٥", "أدخل رصيد الإجازة السنوية غير المستنفدة وأساس الاحتساب."],
                  ["٦", "أدخل مهلة الإشعار المطلوبة والمخدومة وحدد الطرف المستحق للتعويض."],
                  ["٧", "أضف أي مستحقات أخرى (رواتب متأخرة، أوفر تايم) أو خصومات (سلف، عهد)."],
                  ["٨", "اقرأ تفصيل المخالصة في لوحة النتائج، ثم أنشئ نموذج المخالصة القابل للطباعة والتوقيع."],
                ].map(([n, text]) => (
                  <li key={n} className="flex gap-2.5 items-start">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-brand text-white text-[11px] font-extrabold flex items-center justify-center mt-0.5">
                      {n}
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Practical Example */}
            <div className="rounded-xl bg-gradient-to-br from-brand-surface to-emerald-50/40 border border-brand-border p-5">
              <h3 className="text-base font-extrabold text-ink mb-4">📊 مثال عملي بالأرقام</h3>
              <div className="text-sm text-ink-secondary space-y-1.5 mb-4">
                <p>
                  <strong className="text-ink">الحالة:</strong> موظف راتبه الأساسي 8,000 ر.س + بدل سكن 2,000 ر.س + بدل نقل 1,000 ر.س (إجمالي 11,000 ر.س)، خدم 6 سنوات و4 أشهر، أُنهيت خدمته من صاحب العمل، لديه 18 يوم إجازة غير مستنفدة، لم تُخدَم مهلة الإشعار (60 يوماً).
                </p>
              </div>
              <div className="space-y-2">
                {[
                  ["آخر راتب مستحق", `(11,000 ÷ 30) × 15 يوم`, "5,500.00 ر.س"],
                  ["مكافأة نهاية الخدمة", `(11,000 × 0.5 × 5) + (11,000 × 1 × 1.33)`, "42,130.00 ر.س"],
                  ["بدل الإجازة", `(11,000 ÷ 30) × 18 يوم`, "6,600.00 ر.س"],
                  ["بدل مهلة الإشعار", `(11,000 ÷ 30) × 60 يوم`, "22,000.00 ر.س"],
                  ["صافي المخالصة", "", "76,230.00 ر.س"],
                ].map(([label, formula, amount], i) => (
                  <div
                    key={label}
                    className={`flex items-start justify-between gap-2 px-3 py-2 rounded-lg text-sm ${
                      i === 4 ? "bg-brand text-white font-extrabold" : "bg-white border border-brand-border/50"
                    }`}
                  >
                    <div>
                      <span className={i === 4 ? "text-white" : "text-ink font-semibold"}>{label}</span>
                      {formula && <span className="block text-[11px] text-ink-muted font-normal">{formula}</span>}
                    </div>
                    <span className={`shrink-0 font-bold ${i === 4 ? "text-white" : "text-brand-dark"}`}>
                      {amount}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-ink-muted">
                * المثال توضيحي. قد يتفاوت الناتج الفعلي بحسب آخر يوم عمل (تاريخ الشهر) والبنود التعاقدية المحددة.
              </p>
            </div>

            {/* Legal Framework */}
            <div>
              <h3 className="text-base font-extrabold text-ink mb-3">⚖️ المواد القانونية المستند إليها</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    art: "المادة 84",
                    title: "مكافأة نهاية الخدمة — الحساب الأساسي",
                    desc: "نصف شهر عن كل سنة في أول 5 سنوات. شهر كامل عن كل سنة بعدها. السنوات الكسرية بالتناسب.",
                    color: "border-emerald-200 bg-emerald-50",
                    badge: "bg-emerald-600",
                  },
                  {
                    art: "المادة 85",
                    title: "تدرج الاستقالة",
                    desc: "قبل سنتين: لا مكافأة. 2-5 سنوات: ثلث. 5-10 سنوات: ثلثان. 10+ سنوات: كاملة.",
                    color: "border-amber-200 bg-amber-50",
                    badge: "bg-amber-600",
                  },
                  {
                    art: "المادة 111",
                    title: "بدل الإجازة السنوية",
                    desc: "تعويض نقدي كامل عن جميع الإجازات السنوية المتراكمة غير المستنفدة عند ترك العمل.",
                    color: "border-teal-200 bg-teal-50",
                    badge: "bg-teal-600",
                  },
                  {
                    art: "المادة 75/76",
                    title: "مهلة الإشعار",
                    desc: "30 يوماً (إشعار الموظف) أو 60 يوماً (إنهاء صاحب العمل) للعقود غير المحددة المدة برواتب شهرية.",
                    color: "border-blue-200 bg-blue-50",
                    badge: "bg-blue-600",
                  },
                ].map((item) => (
                  <div key={item.art} className={`rounded-xl border p-4 ${item.color}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`rounded-full ${item.badge} text-white text-[10px] font-extrabold px-2 py-0.5`}>
                        {item.art}
                      </span>
                      <span className="text-xs font-bold text-ink">{item.title}</span>
                    </div>
                    <p className="text-xs text-ink-secondary leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PART 3: FAQ + JSON-LD ──────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 pb-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-6 border-b border-brand-border pb-4">
              ❓ الأسئلة الشائعة حول المخالصة النهائية في السعودية
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

        {/* ── PART 4: Related Tools & Tool Chain ──────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            
            {/* Dedicated Tool Chain */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-brand-surface border-2 border-brand/40 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔗</span>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-brand-dark">
                    سلسلة أدوات سوق العمل والموظف السعودي (Saudi Tool Chain)
                  </h2>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    تتكامل هذه الحاسبة الشاملة مع الحاسبات المتخصصة الثلاث لحساب كل بند بدقة وتفصيل مستقل:
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 mt-4">
                <Link
                  href="/gratuity-calculator/saudi"
                  className="rounded-xl border border-emerald-200 bg-white p-4 hover:border-brand hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🏆</span>
                    <h3 className="text-xs font-black text-ink group-hover:text-brand">حاسبة مكافأة نهاية الخدمة</h3>
                  </div>
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    حساب تفصيلي للمادتين 84 و 85 وتدرج الاستقالة وسنوات الخدمة.
                  </p>
                  <span className="mt-2 inline-block text-[10px] font-bold text-emerald-700">فتح الأداة ←</span>
                </Link>

                <Link
                  href="/overtime-calculator/saudi"
                  className="rounded-xl border border-amber-200 bg-white p-4 hover:border-brand hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">⏱️</span>
                    <h3 className="text-xs font-black text-ink group-hover:text-brand">حاسبة الأوفر تايم السعودي</h3>
                  </div>
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    حساب الساعات الإضافية بنسبة 150٪ وفق المادة 107 من نظام العمل.
                  </p>
                  <span className="mt-2 inline-block text-[10px] font-bold text-amber-700">فتح الأداة ←</span>
                </Link>

                <Link
                  href="/salary-calculator/saudi"
                  className="rounded-xl border border-blue-200 bg-white p-4 hover:border-brand hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">💼</span>
                    <h3 className="text-xs font-black text-ink group-hover:text-brand">حاسبة الراتب الصافي</h3>
                  </div>
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    حساب استقطاعات التأمينات الاجتماعية GOSI وساند وصافي الراتب.
                  </p>
                  <span className="mt-2 inline-block text-[10px] font-bold text-blue-700">فتح الأداة ←</span>
                </Link>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-ink mb-1">📌 أدوات مالية وإدارية أخرى ذات صلة</h2>
              <p className="text-xs text-ink-muted mb-4">
                حاسبات إضافية معتمدة لإدارة مستحقاتك المالية والضريبية
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  href: "/ar/sa/article-77-calculator",
                  icon: "⚖️",
                  title: "حاسبة تعويض المادة 77",
                  desc: "احسب تعويض الفصل التعسفي والإنهاء غير المشروع (حد شهرين)",
                  badge: "المادة 77",
                  badgeColor: "bg-rose-100 text-rose-700 font-bold",
                },
                {
                  href: "/ar/sa/annual-leave-calculator",
                  icon: "🏖️",
                  title: "حاسبة رصيد الإجازات السنوية",
                  desc: "احسب التعويض النقدي لرصيد الإجازات وفق المادتين 109 و111",
                  badge: "المادة 111",
                  badgeColor: "bg-sky-100 text-sky-700 font-bold",
                },
                {
                  href: "/gratuity-calculator/saudi",
                  icon: "🏆",
                  title: "حاسبة مكافأة نهاية الخدمة",
                  desc: "احسب مكافأتك بالتفصيل وفق المادة 84 و85 مع سيناريوهات مختلفة",
                  badge: "السعودية",
                  badgeColor: "bg-emerald-100 text-emerald-700",
                },
                {
                  href: "/salary-calculator/saudi",
                  icon: "💼",
                  title: "حاسبة الراتب الصافي السعودي",
                  desc: "احسب صافي راتبك بعد GOSI وساند وجميع الاستقطاعات",
                  badge: "GOSI",
                  badgeColor: "bg-blue-100 text-blue-700",
                },
                {
                  href: "/overtime-calculator/saudi",
                  icon: "⏱️",
                  title: "حاسبة الأوفر تايم السعودي",
                  desc: "احسب أجر الساعات الإضافية 150٪ وفق المادة 107",
                  badge: "150%",
                  badgeColor: "bg-amber-100 text-amber-700",
                },
                {
                  href: "/vat-calculator/saudi",
                  icon: "🧾",
                  title: "حاسبة ضريبة القيمة المضافة",
                  desc: "احسب ضريبة القيمة المضافة 15٪ للمملكة العربية السعودية",
                  badge: "15% VAT",
                  badgeColor: "bg-purple-100 text-purple-700",
                },
                {
                  href: "/loan-calculator",
                  icon: "🏦",
                  title: "حاسبة القرض الشخصي",
                  desc: "احسب قسطك الشهري وإجمالي الفوائد لأي قرض",
                  badge: "",
                  badgeColor: "",
                },
                {
                  href: "/ar/sa/",
                  icon: "🇸🇦",
                  title: "مجمع أدوات المملكة العربية السعودية",
                  desc: "جميع الحاسبات المالية والعمالية المخصصة للسعودية في مكان واحد",
                  badge: "مجمع",
                  badgeColor: "bg-emerald-600 text-white",
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

            {/* Last Reviewed */}
            <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-ink-muted flex items-start gap-2">
              <span className="text-base">📅</span>
              <p>
                <strong className="text-ink">تاريخ آخر مراجعة قانونية:</strong> 2026م — متوافق مع نظام العمل السعودي الصادر بالمرسوم الملكي رقم (م/51) وتعديلاته الصادرة بالمرسوم الملكي رقم (م/14) واللوائح التنفيذية لوزارة الموارد البشرية والتنمية الاجتماعية (
                <a href="https://www.hrsd.gov.sa" target="_blank" rel="noopener noreferrer" className="text-brand underline hover:text-brand-dark">
                  hrsd.gov.sa
                </a>
                ). الحاسبة استرشادية، ويُنصح دائماً بالرجوع للمنصة العمالية الرسمية (ودي) في حال وجود نزاع تعاقدي.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
