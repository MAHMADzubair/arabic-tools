import UaeNoticePeriodCalculator from "@/components/UaeNoticePeriodCalculator";
import Link from "next/link";

// ─── Metadata ────────────────────────────────────────────────────────────────
export const metadata = {
  title: "حاسبة فترة الإنذار في الإمارات 2026 | آخر يوم وبدل الإنذار",
  description:
    "احسب فترة الإنذار في الإمارات، آخر يوم عمل، الأيام غير المنفذة وبدل الإنذار التقديري للموظف أو صاحب العمل وفق بيانات عقد العمل والمادة 43 من قانون العمل رقم 33 لسنة 2021.",
  keywords: [
    "حاسبة فترة الإنذار في الإمارات",
    "فترة الإنذار قانون العمل الإماراتي",
    "المادة 43 قانون العمل الإماراتي",
    "بدل الإنذار في الإمارات",
    "حساب آخر يوم عمل في الإمارات",
    "الاستقالة وفترة الإنذار الإمارات",
    "تعويض مهلة الإخطار دبي أبوظبي",
    "MOHRE notice period calculator",
    "UAE notice period calculation",
    "إنهاء عقد العمل فترة التجربة الإمارات",
  ],
  alternates: {
    canonical: "https://arabic-tools-xi.vercel.app/ar/ae/notice-period-calculator",
  },
  openGraph: {
    title: "حاسبة فترة الإنذار في الإمارات 2026 | آخر يوم وبدل الإنذار",
    description:
      "احسب فترة الإنذار في الإمارات، آخر يوم عمل، الأيام غير المنفذة وبدل الإنذار التقديري للموظف أو صاحب العمل وفق بيانات عقد العمل والمادة 43.",
    url: "https://arabic-tools-xi.vercel.app/ar/ae/notice-period-calculator",
    type: "website",
    locale: "ar_AE",
  },
};

// ─── JSON-LD Structured Data ─────────────────────────────────────────────────
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ما هي فترة الإنذار القانونية في قانون العمل الإماراتي الجديد رقم 33 لسنة 2021؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وفقاً للمادة (43) من قانون العمل الإماراتي، يجوز لأي من طرفي عقد العمل إنهاؤه لسبب مشروع بشرط إخطار الطرف الآخر خطياً، وتتراوح مدة الإنذار المتفق عليها في عقد العمل وجوباً بين 30 يوماً كحد أدنى و90 يوماً كحد أقصى.",
      },
    },
    {
      "@type": "Question",
      name: "كيف يُحسب بدل الإنذار في حال عدم الالتزام بالمهلة كاملة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "يُحسب بدل الإنذار بقسمة آخر أجر شهري شامل كان يتقاضاه العامل على 30 للحصول على الأجر اليومي، ثم ضرب الناتج في عدد الأيام غير المنفذة من فترة الإنذار. يلتزم الطرف المخل (سواء كان الموظف أو صاحب العمل) بسداد هذا البدل للطرف الآخر.",
      },
    },
    {
      "@type": "Question",
      name: "من يدفع بدل الإنذار: صاحب العمل أم الموظف؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "يدفع البدل الطرف الذي أخل بمهلة الإنذار: فإذا أنهى صاحب العمل العقد فوراً أو طلب من الموظف المغادرة دون إكمال الإنذار، يُلزم صاحب العمل بدفع التعويض للموظف (+). أما إذا استقال الموظف وغادر العمل فوراً أو قبل انتهاء المدة المقررة، يُلزم الموظف بدفع التعويض لصاحب العمل (-) ويُخصم عادة من مستحقات تصفية نهاية الخدمة.",
      },
    },
    {
      "@type": "Question",
      name: "هل يجوز الاتفاق على فترة إنذار تقل عن 30 يوماً أو تزيد عن 90 يوماً؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "الأصل القانوني الآمر بنص المادة 43 يمنع الاتفاق على مدة تقل عن 30 يوماً أو تزيد عن 90 يوماً في العقود المحددة المدة العادية. ومع ذلك، يجوز للطرفين لاحقاً وباتفاق كتابي صريح الإعفاء من الإنذار أو تقليص مدته مع الحفاظ على حقوق العامل.",
      },
    },
    {
      "@type": "Question",
      name: "هل تنطبق قواعد المادة 43 على الموظفين في فترة التجربة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا تنطبق قواعد المادة 43 بالكامل على فترة التجربة؛ إذ تخضع فترة التجربة للمادة (9) من قانون العمل: يشترط إخطار صاحب العمل للعامل بـ 14 يوماً خطياً للإنهاء، ويشترط إخطار العامل لصاحب العمل بشهر إذا كان سينتقل لصاحب عمل آخر داخل الإمارات، أو بـ 14 يوماً إذا كان يرغب بمغادرة الدولة.",
      },
    },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "حاسبة فترة الإنذار في الإمارات 2026",
  operatingSystem: "All",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "AED",
  },
  description:
    "أداة مجانية لحساب فترة الإنذار وتاريخ آخر يوم عمل وبدل الإنذار التقديري للأيام غير المنفذة بموجب المادة 43 من قانون العمل الإماراتي.",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: "https://arabic-tools-xi.vercel.app" },
    { "@type": "ListItem", position: 2, name: "أدوات الإمارات", item: "https://arabic-tools-xi.vercel.app/ar/ae" },
    {
      "@type": "ListItem",
      position: 3,
      name: "حاسبة فترة الإنذار",
      item: "https://arabic-tools-xi.vercel.app/ar/ae/notice-period-calculator",
    },
  ],
};

export default function UaeNoticePeriodCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="min-h-screen bg-sand pb-16" dir="rtl">
        {/* Breadcrumb Nav */}
        <div className="border-b border-brand-border bg-white no-print print:hidden">
          <div className="mx-auto max-w-4xl px-4 py-2.5 sm:px-6">
            <nav className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Link href="/" className="hover:text-brand transition">الرئيسية</Link>
              <span>/</span>
              <Link href="/ar/ae" className="hover:text-brand transition">أدوات الإمارات 🇦🇪</Link>
              <span>/</span>
              <span className="font-bold text-ink">حاسبة فترة الإنذار في الإمارات</span>
            </nav>
          </div>
        </div>

        {/* ── PART 1: Interactive Tool Above the Fold ──────────────────────────── */}
        <section className="pt-2 pb-6">
          <UaeNoticePeriodCalculator />
        </section>

        {/* Contextual Link to Final Settlement Calculator */}
        <section className="mx-auto max-w-4xl px-4 pb-6 no-print print:hidden">
          <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              <div>
                <h3 className="text-sm font-extrabold text-emerald-950">
                  هل تريد حساب جميع مستحقات نهاية الخدمة والتصفية الشاملة؟
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  احسب مكافأة نهاية الخدمة (م 51)، رصيد الإجازات، آخر راتب، وبدل الإنذار مجمعة في نموذج مخالصة موحد.
                </p>
              </div>
            </div>
            <Link
              href="/ar/ae/final-settlement-calculator"
              className="shrink-0 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black px-4 py-2.5 transition shadow"
            >
              الانتقال إلى حاسبة المخالصة النهائية ←
            </Link>
          </div>
        </section>

        {/* ── PART 2: Comprehensive Explanation (300-500 words) ────────────────── */}
        <section className="mx-auto max-w-4xl px-4 py-6 no-print print:hidden">
          <article className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">
                دليل وأحكام فترة الإنذار في قانون العمل الإماراتي (المرسوم 33 لسنة 2021)
              </h2>
              <p className="text-xs text-ink-muted mt-1">
                سند المادة (43) وضوابط احتساب آخر يوم عمل وبدل مهلة الإخطار في القطاع الخاص
              </p>
            </div>

            {/* Section 1: What is the tool & Why it matters */}
            <div>
              <h3 className="text-base font-bold text-ink mb-2">ما هي الأداة وما أهميتها؟</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                تُعد <strong>حاسبة فترة الإنذار في الإمارات</strong> أداة متخصصة ومصممة بدقة لمساعدة موظفي وأرباب العمل في القطاع الخاص على التحديد الدقيق لتواريخ سريان مهلة الإنذار، وتاريخ آخر يوم عمل تعاقدي، وحساب التعويض المالي المقابل للأيام غير المنفذة (بدل الإنذار). وتكتسب هذه الأداة أهمية كبرى عند انتهاء رابطة العمل، نظراً لأن عدم مراعاة مدد الإخطار القانونية يترتب عليه التزام مالي فوري يلزم الطرف المخل بتعويض الطرف المتضرر عن كامل المدة أو الجزء المتبقي منها.
              </p>
            </div>

            {/* Section 2: Step by Step Guide */}
            <div>
              <h3 className="text-base font-bold text-ink mb-2">كيفية الاستخدام خطوة بخطوة</h3>
              <ol className="list-decimal list-inside text-sm text-ink-secondary space-y-1.5 leading-relaxed">
                <li>
                  <strong>تأكيد النطاق ونظام العمل:</strong> تحقق من خضوع المنشأة لقانون العمل الاتحادي الصادر عن وزارة الموارد البشرية والتوطين (MOHRE)، مع تحديد ما إذا كان الموظف قد اجتاز فترة التجربة بنجاح.
                </li>
                <li>
                  <strong>تحديد الطرف المبادر:</strong> اختر ما إذا كانت الاستقالة مقدمة من الموظف أو أن قرار إنهاء العقد صادر من صاحب العمل، لتحديد اتجاه التعويض تلقائياً.
                </li>
                <li>
                  <strong>إدخال تاريخ الإشعار ومدة الإنذار:</strong> حدد تاريخ تسليم الإخطار الخطي، والمدة التعاقدية المتفق عليها (30، 45، 60، أو 90 يوماً).
                </li>
                <li>
                  <strong>تسجيل الأيام المنفذة والأجر الأخير:</strong> أدخل عدد الأيام التي قضاها الموظف في العمل فعلياً أو حدد تاريخ المغادرة، واكتب آخر أجر إجمالي شامل للبدلات.
                </li>
                <li>
                  <strong>استعراض النتيجة والطباعة:</strong> احصل فوراً على تاريخ آخر يوم عمل، والأيام المتبقية، وقيمة بدل الإنذار التقديري، مع إمكانية استخراج ملخص جاهز للطباعة.
                </li>
              </ol>
            </div>

            {/* Section 3: Legal Basis & Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-ink-secondary">
              <div>
                <h4 className="font-extrabold text-ink text-sm mb-1.5">⚖️ المادة (43) - إنهاء عقد العمل</h4>
                <p className="leading-relaxed">
                  ألزمت المادة طرفي العقد بوجوب توجيه إخطار خطي لا تقل مدته عن 30 يوماً ولا تزيد عن 90 يوماً. ويبقى عقد العمل سارياً طوال مهلة الإنذار ويستحق العامل أجره كاملاً عن هذه المدة وفقاً لآخر أجر كان يتقاضاه.
                </p>
              </div>
              <div>
                <h4 className="font-extrabold text-ink text-sm mb-1.5">💵 احتساب بدل الإنذار والأجر الأخير</h4>
                <p className="leading-relaxed">
                  يُحسب بدل الإنذار وفقاً لـ <strong>آخر أجر</strong> (الأجر الإجمالي الشامل للأساسي والبدلات كالسكن والانتقال) مقسوماً على 30 يوماً. ولا يجوز الخلط بينه وبين مكافأة نهاية الخدمة التي تُحسب على الأساسي فقط.
                </p>
              </div>
            </div>

            {/* Section 4: Worked Real-World Examples */}
            <div>
              <h3 className="text-base font-bold text-ink mb-3">أمثلة عملية بالأرقام (3 حالات واقعية)</h3>
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 p-4 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-ink">الحالة 1: استقالة موظف مع التزام كامل بالإنذار</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">لا تعويض (0 AED)</span>
                  </div>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    موظف راتبه الإجمالي 9,000 درهم، مدة إنذاره التعاقدية 60 يوماً، داوم طوال الـ 60 يوماً كاملة حتى تاريخ نهاية الإنذار. النتيجة: استحقاقه لراتبه الشهري كاملاً خلال المدة، ولا يترتب أي بدل إنذار على أي طرف.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-ink">الحالة 2: استقالة موظف مع مغادرة مبكرة (تنفيذ جزئي)</span>
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">6,000 AED لصالح الشركة</span>
                  </div>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    موظف راتبه 9,000 درهم، إنذاره 60 يوماً، خدم منها 40 يوماً فقط وانقطع عن العمل. الأجر اليومي = 9,000 ÷ 30 = 300 درهم. الأيام غير المنفذة = 20 يوماً. التعويض المستحق = 20 × 300 = 6,000 درهم يلتزم الموظف بسدادها لصاحب العمل.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-ink">الحالة 3: إنهاء فوري من صاحب العمل (إخلال المنشأة)</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">8,000 AED لصالح الموظف</span>
                  </div>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    قررت الشركة إنهاء عقد موظف أجره 12,000 درهم ومهلة إنذاره 30 يوماً، وطلبت منه التوقف بعد 10 أيام فقط. الأجر اليومي = 12,000 ÷ 30 = 400 درهم. الأيام المتبقية = 20 يوماً. التعويض = 20 × 400 = 8,000 درهم تدفعها الشركة للموظف كبدل إنذار.
                  </p>
                </div>
              </div>
            </div>

            {/* Jurisdictions & Special Notes */}
            <div className="rounded-xl border border-brand-border bg-slate-50 p-4 text-xs text-ink-secondary space-y-2">
              <h4 className="font-bold text-ink text-sm">💡 ضوابط مهمة وحالات خاصة:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>فترة التجربة:</strong> تخضع للمادة (9) بقواعد إنذار خاصة (14 يوماً من صاحب العمل، وشهر أو 14 يوماً من العامل بحسب المغادرة أو الانتقال)، ولا تطبق عليها حدود المادة 43 العادية.
                </li>
                <li>
                  <strong>المناطق الحرة المالية (DIFC / ADGM):</strong> تتمتع بقوانين عمل مستقلة، وتحكمها لوائح خاصة لعقود العمل تختلف عن وزارة الموارد البشرية والتوطين.
                </li>
                <li>
                  <strong>يوم البحث عن عمل:</strong> إذا كان الإنهاء من قبل صاحب العمل، يحق للعامل التغيب يوماً في الأسبوع بدون أجر للبحث عن عمل شريطة إخطار الشركة مسبقاً بثلاثة أيام (م 43 ب 5).
                </li>
              </ul>
            </div>
          </article>
        </section>

        {/* ── PART 3: FAQ Section ──────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-4 py-4 no-print print:hidden">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <div className="border-b border-brand-border pb-4 mb-6">
              <h2 className="text-xl font-extrabold text-ink">
                ❓ الأسئلة الشائعة حول فترة الإنذار وبدل الإشعار بالإمارات
              </h2>
              <p className="text-xs text-ink-muted mt-1">
                إجابات شاملة ومطابقة لأحدث قرارات وزارة الموارد البشرية والتوطين
              </p>
            </div>

            <div className="space-y-5">
              {[
                {
                  q: "ما هي فترة الإنذار القانونية في قانون العمل الإماراتي الجديد رقم 33 لسنة 2021؟",
                  a: "وفقاً للمادة (43) من قانون العمل الإماراتي، يجوز لأي من طرفي عقد العمل إنهاؤه لسبب مشروع بشرط إخطار الطرف الآخر خطياً، وتتراوح مدة الإنذار المتفق عليها في عقد العمل وجوباً بين 30 يوماً كحد أدنى و90 يوماً كحد أقصى.",
                },
                {
                  q: "كيف يُحسب بدل الإنذار في حال عدم الالتزام بالمهلة كاملة؟",
                  a: "يُحسب بدل الإنذار بقسمة آخر أجر شهري شامل كان يتقاضاه العامل على 30 للحصول على الأجر اليومي، ثم ضرب الناتج في عدد الأيام غير المنفذة من فترة الإنذار. يلتزم الطرف المخل (سواء كان الموظف أو صاحب العمل) بسداد هذا البدل للطرف الآخر.",
                },
                {
                  q: "من يدفع بدل الإنذار: صاحب العمل أم الموظف؟",
                  a: "يدفع البدل الطرف الذي أخل بمهلة الإنذار: فإذا أنهى صاحب العمل العقد فوراً أو طلب من الموظف المغادرة دون إكمال الإنذار، يُلزم صاحب العمل بدفع التعويض للموظف (+). أما إذا استقال الموظف وغادر العمل فوراً أو قبل انتهاء المدة المقررة، يُلزم الموظف بدفع التعويض لصاحب العمل (-) ويُخصم عادة من مستحقات تصفية نهاية الخدمة.",
                },
                {
                  q: "هل يجوز الاتفاق على فترة إنذار تقل عن 30 يوماً أو تزيد عن 90 يوماً؟",
                  a: "الأصل القانوني الآمر بنص المادة 43 يمنع الاتفاق على مدة تقل عن 30 يوماً أو تزيد عن 90 يوماً في العقود المحددة المدة العادية. ومع ذلك، يجوز للطرفين لاحقاً وباتفاق كتابي صريح الإعفاء من الإنذار أو تقليص مدته مع الحفاظ على حقوق العامل.",
                },
                {
                  q: "هل تنطبق قواعد المادة 43 على الموظفين في فترة التجربة؟",
                  a: "لا تنطبق قواعد المادة 43 بالكامل على فترة التجربة؛ إذ تخضع فترة التجربة للمادة (9) من قانون العمل: يشترط إخطار صاحب العمل للعامل بـ 14 يوماً خطياً للإنهاء، ويشترط إخطار العامل لصاحب العمل بشهر إذا كان سينتقل لصاحب عمل آخر داخل الإمارات، أو بـ 14 يوماً إذا كان يرغب بمغادرة الدولة.",
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

        {/* ── PART 4: Related Tools ─────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-4 py-4 pb-12 no-print print:hidden">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <div className="border-b border-brand-border pb-4 mb-5">
              <h2 className="text-lg font-extrabold text-ink">🔗 أدوات وحاسبات عمالية ذات صلة بدولة الإمارات</h2>
              <p className="text-xs text-ink-muted mt-1">حاسبات معتمدة ومتكاملة لبيئة العمل وقوانين العمل والضرائب الإماراتية</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  href: "/ar/ae/final-settlement-calculator",
                  icon: "📋",
                  title: "حاسبة المخالصة النهائية في الإمارات",
                  desc: "تصفية شاملة لجميع مستحقات العامل: مكافأة نهاية الخدمة، آخر راتب، رصيد الإجازات، وبدل الإنذار في نموذج قابل للطباعة.",
                  badge: "تصفية شاملة",
                  badgeColor: "bg-emerald-100 text-emerald-800 font-bold",
                },
                {
                  href: "/gratuity-calculator/uae",
                  icon: "🎖️",
                  title: "حاسبة مكافأة نهاية الخدمة في الإمارات",
                  desc: "احسب مكافأة نهاية الخدمة تفصيلياً وفق المادة 51 مع سقف السنتين وإلغاء خصومات الاستقالة.",
                  badge: "المادة 51",
                  badgeColor: "bg-amber-100 text-amber-800 font-bold",
                },
                {
                  href: "/salary-calculator/uae",
                  icon: "💰",
                  title: "حاسبة الراتب الصافي في الإمارات (WPS)",
                  desc: "احسب الراتب الشهري الصافي المحول بالدرهم الإماراتي عبر نظام حماية الأجور WPS بدون ضرائب دخل.",
                  badge: "نظام WPS",
                  badgeColor: "bg-emerald-100 text-emerald-800 font-bold",
                },
                {
                  href: "/overtime-calculator/uae",
                  icon: "⏱️",
                  title: "حاسبة العمل الإضافي في الإمارات (125% و 150%)",
                  desc: "احسب أجر ساعات الأوفرتايم النهارية والليلية والعطلات الأسبوعية وفق المادة 19 من قانون العمل.",
                  badge: "المادة 19",
                  badgeColor: "bg-blue-100 text-blue-800 font-bold",
                },
                {
                  href: "/vat-calculator/uae",
                  icon: "🧾",
                  title: "حاسبة ضريبة القيمة المضافة 5%",
                  desc: "احسب ضريبة الـ 5% المعتمدة من الهيئة الاتحادية للضرائب FTA أو استخرج السعر قبل الضريبة.",
                  badge: "FTA 5%",
                  badgeColor: "bg-purple-100 text-purple-800 font-bold",
                },
                {
                  href: "/ar/ae",
                  icon: "🇦🇪",
                  title: "مجمع أدوات وحاسبات الإمارات الشامل",
                  desc: "الدليل الشامل لكافة الحاسبات العمالية والمالية والضريبية المخصصة لدولة الإمارات 2026.",
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
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tool.badgeColor}`}>
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
