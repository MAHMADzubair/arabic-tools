import UaeNoticePeriodCalculator from "@/components/UaeNoticePeriodCalculator";
import Link from "next/link";

// ─── Metadata ────────────────────────────────────────────────────────────────
export const metadata = {
  title: "حاسبة فترة الإنذار في الإمارات 2026 | آخر يوم وبدل الإنذار",
  description:
    "احسب فترة الإنذار في الإمارات، آخر يوم عمل، الأيام غير المنفذة وبدل الإنذار التقديري للموظف أو صاحب العمل وفق بيانات عقد العمل.",
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
      "احسب فترة الإنذار في الإمارات، آخر يوم عمل، الأيام غير المنفذة وبدل الإنذار التقديري للموظف أو صاحب العمل وفق بيانات عقد العمل.",
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
    "احسب فترة الإنذار في الإمارات، آخر يوم عمل، الأيام غير المنفذة وبدل الإنذار التقديري للموظف أو صاحب العمل وفق بيانات عقد العمل.",
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
                  احسب جميع مستحقات نهاية العمل
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  احسب تصفية كاملة: مكافأة نهاية الخدمة، آخر راتب، بدل رصيد الإجازات، وبدل الإنذار في وثيقة موحدة.
                </p>
              </div>
            </div>
            <Link
              href="/ar/ae/final-settlement-calculator"
              className="shrink-0 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black px-4 py-2.5 transition shadow"
            >
              الانتقال إلى UAE Final Settlement Calculator ←
            </Link>
          </div>
        </section>

        {/* ── PART 2: Comprehensive Explanation (Structured SEO Content) ────────── */}
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

            {/* 1. ما هي فترة الإنذار في الإمارات؟ */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">ما هي فترة الإنذار في الإمارات؟</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                فترة الإنذار (Notice Period) هي المهلة الزمنية القانونية والتعاقدية الملزمة التي يجب على أي من طرفي عقد العمل (الموظف أو صاحب العمل) إخطار الطرف الآخر بها خطياً قبل إنهاء علاقة العمل لسبب مشروع. وتظل رابطة العمل سارية المفعول طوال فترة الإنذار، مع التزام العامل بأداء مهامه الوظيفية والتزام صاحب العمل بدفع الأجر الكامل.
              </p>
            </div>

            {/* 2. كم مدة الإنذار القانونية؟ */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">كم مدة الإنذار القانونية؟</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                حددت المادة (43) من قانون العمل الإماراتي رقم 33 لسنة 2021 نطاقاً واضحاً لمهلة الإنذار في عقود العمل محددة المدة:
              </p>
              <ul className="list-disc list-inside text-sm text-ink-secondary mt-1.5 space-y-1">
                <li><strong>الحد الأدنى:</strong> 30 يوماً تقويمياً.</li>
                <li><strong>الحد الأقصى:</strong> 90 يوماً تقويمياً.</li>
              </ul>
              <p className="text-xs text-ink-muted mt-1.5">
                أي اتفاق على مدة تقل عن 30 يوماً أو تزيد عن 90 يوماً في العقد يعتبر مخالفاً للنظام العام ما لم يكن متفقاً عليه لاحقاً لمصلحة الطرفين كتابةً.
              </p>
            </div>

            {/* 3. كيف يُحسب آخر يوم عمل؟ */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">كيف يُحسب آخر يوم عمل؟</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                يُحسب آخر يوم عمل المتوقع بإضافة عدد أيام مهلة الإنذار المتفق عليها إلى تاريخ تسليم الإخطار الخطي:
                <br />
                <code className="bg-slate-100 px-2 py-0.5 rounded text-ink font-mono text-xs mt-1 inline-block">
                  تاريخ تقديم الإشعار + مدة الإنذار التعاقدية = آخر يوم عمل المتوقع
                </code>
              </p>
            </div>

            {/* 4. كيف يُحسب بدل الإنذار؟ */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">كيف يُحسب بدل الإنذار؟</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                يُحسب بدل الإنذار وفق المعادلة المقررة نظاماً:
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-ink space-y-1 my-2">
                <div>الأجر اليومي = آخر أجر شهري شامل ÷ 30</div>
                <div>بدل الإنذار = الأيام غير المنفذة × الأجر اليومي</div>
              </div>
              <p className="text-xs text-ink-muted">
                ملاحظة جوهرية: يُعتمد <strong>آخر أجر</strong> (الأجر الإجمالي الشامل للأساسي والبدلات المستمرة كالسكن والانتقال) في احتساب بدل الإنذار، بخلاف مكافأة نهاية الخدمة التي تعتمد على الأساسي فقط.
              </p>
            </div>

            {/* 5. من يدفع بدل الإنذار؟ */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">من يدفع بدل الإنذار؟</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                يدفع التعويض الطرف الذي أخل بمهلة الإنذار المقررة في العقد:
              </p>
              <ul className="list-disc list-inside text-sm text-ink-secondary mt-1 space-y-1">
                <li><strong>إذا أنهى صاحب العمل العقد</strong> فوراً أو طلب من الموظف المغادرة قبل انتهاء المدة: يدفع صاحب العمل البدل للموظف <code>[+]</code>.</li>
                <li><strong>إذا استقال الموظف</strong> وغادر العمل دون إتمام فترة الإنذار: يلتزم الموظف بدفع البدل لصاحب العمل <code>[−]</code> ويُخصم عادة من مستحقات التصفية.</li>
              </ul>
            </div>

            {/* 6. ماذا يحدث عند تنفيذ جزء فقط من الإنذار؟ */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">ماذا يحدث عند تنفيذ جزء فقط من الإنذار؟</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                وفقاً للمادة 43، يكون التعويض مساوياً لأجر العامل عن الجزء المتبقي غير المنفذ فقط، ولا يُلزم الطرف المخل بالتعويض عن كامل مدة الإنذار إذا كان قد نُفذ جزء منها بالفعل.
              </p>
            </div>

            {/* 7. هل تختلف القواعد أثناء فترة التجربة؟ */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">هل تختلف القواعد أثناء فترة التجربة؟</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                نعم. تخضع فترة التجربة لأحكام المادة (9) من قانون العمل:
              </p>
              <ul className="list-disc list-inside text-xs text-ink-secondary mt-1 space-y-1">
                <li>إذا أنهى صاحب العمل العقد أثناء التجربة: إخطار خطي لا يقل عن 14 يوماً.</li>
                <li>إذا رغب العامل بترك العمل للالتحاق بعمل آخر بالدولة: إخطار قبل شهر مع التزام صاحب العمل الجديد بالتعويض.</li>
                <li>إذا رغب العامل بمغادرة الدولة: إخطار قبل 14 يوماً على الأقل.</li>
              </ul>
            </div>

            {/* 8. هل تختلف القواعد في DIFC وADGM؟ */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">هل تختلف القواعد في DIFC وADGM؟</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                نعم. تتمتع كل من مركز دبي المالي العالمي (DIFC) وسوق أبوظبي العالمي (ADGM) بأنظمة وقوانين عمل خاصة مستقلة تماماً عن وزارة الموارد البشرية والتوطين (MOHRE)، وتخضع لمدد إشعار تعاقدية وقانونية مختلفة.
              </p>
            </div>

            {/* 9. كيفية استخدام الحاسبة */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">كيفية استخدام الحاسبة</h3>
              <ol className="list-decimal list-inside text-sm text-ink-secondary space-y-1">
                <li>اختر الطرف المبادر بإنهاء العلاقة (الموظف أم صاحب العمل).</li>
                <li>حدد تاريخ تقديم الإشعار الرسمي عبر منتقي التواريخ.</li>
                <li>اختر فترة الإنذار التعاقدية (30، 45، 60، 90، أو مدة مخصصة).</li>
                <li>أدخل الأيام المنفذة إما بالعدد المباشر أو بتحديد آخر يوم عمل فعلي.</li>
                <li>أدخل آخر أجر شهري إجمالي للاطلاع فوراً على النتيجة والمخطط الزمني.</li>
              </ol>
            </div>

            {/* 10. مثال عملي */}
            <div>
              <h3 className="text-base font-bold text-ink mb-2">أمثلة عملية (Worked Examples)</h3>
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50 text-xs">
                  <div className="font-bold text-ink mb-1">المثال 1: استقالة موظف مع التزام كامل بالإنذار</div>
                  <p className="text-ink-secondary">
                    آخر أجر: 9,000 درهم | مدة الإنذار: 60 يوماً | الأيام المنفذة: 60 يوماً | <strong>النتيجة: 0 درهم (لا تعويض مستحق)</strong>.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50 text-xs">
                  <div className="font-bold text-ink mb-1">المثال 2: استقالة موظف مع مغادرة مبكرة (خدم 40 من 60)</div>
                  <p className="text-ink-secondary">
                    آخر أجر: 9,000 درهم (الأجر اليومي 300 درهم) | المتبقي: 20 يوماً | <strong>التعويض: 6,000 درهم مستحقة لصالح صاحب العمل</strong>.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50 text-xs">
                  <div className="font-bold text-ink mb-1">المثال 3: إنهاء من صاحب العمل (خدم 10 من 30)</div>
                  <p className="text-ink-secondary">
                    آخر أجر: 12,000 درهم (الأجر اليومي 400 درهم) | المتبقي: 20 يوماً | <strong>التعويض: 8,000 درهم مستحقة لصالح الموظف</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* 11. المصادر الرسمية */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">المصادر الرسمية</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                وزارة الموارد البشرية والتوطين (MOHRE) — المرسوم بقانون اتحادي رقم (33) لسنة 2021 بشأن تنظيم علاقات العمل، ولائحته التنفيذية الصادرة بقرار مجلس الوزراء رقم (1) لسنة 2022 — المادة (43) إنهاء عقد العمل وفترة الإنذار.
              </p>
            </div>

            {/* 12. آخر تحديث */}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-xs text-ink-muted">
              <span><strong>آخر تحديث:</strong> 2026</span>
              <span>مطابق للمرسوم 33 لسنة 2021 وقرارات MOHRE الحديثة</span>
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
