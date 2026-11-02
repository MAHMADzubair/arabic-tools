import UaeNoticePeriodCalculator from "@/components/UaeNoticePeriodCalculator";
import Link from "next/link";
import GeoAnswerSummary from "@/components/GeoAnswerSummary";
import { SITE_URL, SITE_ORG_ID } from "@/lib/siteConfig";
// Shared answer for notice period waiver FAQ
const noticeWaiverAnswer = "تتراوح مدة الإنذار المتفق عليها أصلاً بين 30 و90 يوماً. وتسمح المادة (43/2) للطرفين بالاتفاق على الإعفاء من شرط الإنذار أو تخفيض مدته مع الحفاظ على حقوق العامل عن مدة الإنذار المتفق عليها، ويجب أن تكون المدة متساوية للطرفين ما لم يكن الاختلاف لصالح العامل. لذلك لا يعني اختيار الإعفاء تلقائياً أن بدل الإنذار يساوي صفراً؛ بل يجب مراجعة الاتفاق المكتوب والحقوق التي يحفظها.";
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
    canonical: "/ar/ae/notice-period-calculator",
  },
  openGraph: {
    title: "حاسبة فترة الإنذار في الإمارات 2026 | آخر يوم وبدل الإنذار",
    description:
      "احسب آخر يوم عمل وبدل الإنذار التقديري للموظفين بأجر شهري في القطاع الخاص الإماراتي وفق المادة 43، مع استثناء فترة التجربة وDIFC وADGM.",
    url: `${SITE_URL}/ar/ae/notice-period-calculator`,
    type: "website",
    locale: "ar_AE",
  },
};

// ─── JSON-LD Structured Data ─────────────────────────────────────────────────
const noticeFaqs = [
  {
    q: "ما هي فترة الإنذار القانونية في قانون العمل الإماراتي رقم 33 لسنة 2021؟",
    a: "وفق المادة (43)، يجب أن يكون الإخطار خطياً، وتتراوح مدة الإنذار المتفق عليها في عقود العمل الخاضعة للقانون الاتحادي بين 30 و90 يوماً. ويظل العقد سارياً خلال المهلة ويستحق العامل أجره الأخير عنها.",
  },
  {
    q: "كيف يُحسب بدل الإنذار للموظف الذي يتقاضى راتباً شهرياً؟",
    a: "لأغراض هذا التقدير للعامل الشهري: الأجر اليومي التقديري = آخر أجر شهري ÷ 30، لأن المادة (67) تعتبر الشهر 30 يوماً؛ ثم يُضرب الأجر اليومي في عدد الأيام المتبقية غير المنفذة. ويجب إدخال الأجر وفق تعريفه القانوني، لا الأساسي وحده.",
  },
  {
    q: "من يدفع بدل الإنذار: صاحب العمل أم الموظف؟",
    a: "يدفع البدل الطرف الذي لم يلتزم بمهلة الإنذار وفق المادة (43/3)، وليس بالضرورة الطرف الذي بدأ إنهاء العقد. فإذا منع صاحب العمل العامل من إكمال المهلة، يكون صاحب العمل هو الطرف المخل؛ وإذا غادر العامل قبل إكمال المهلة دون اتفاق، يكون العامل هو الطرف المخل. ويُحدد الطرف المسؤول بحسب الوقائع والاتفاق.",
  },
  {
    q: "هل يجوز الاتفاق على إعفاء أو تخفيض فترة الإنذار؟",
    a: noticeWaiverAnswer,
  },
  {
    q: "هل يمكن استخدام الحاسبة أثناء فترة التجربة؟",
    a: "لا. هذه الحاسبة لا تحسب فترة التجربة. تخضع الحالات للمادة (9): إخطار صاحب العمل للعامل قبل 14 يوماً على الأقل؛ وإخطار العامل قبل شهر إذا انتقل إلى صاحب عمل آخر داخل الدولة؛ أو قبل 14 يوماً على الأقل إذا كان العامل الأجنبي سيغادر الدولة. وقد تترتب التزامات أخرى بحسب الحالة.",
  },
  {
    q: "هل تنطبق الحاسبة على موظفي DIFC أو ADGM والقطاع الحكومي؟",
    a: "لا. الحاسبة مخصصة لعقود القطاع الخاص الخاضعة لقانون العمل الاتحادي. قد تخضع الجهات الحكومية وDIFC وADGM لأطر قانونية مختلفة، ولذلك تتوقف الحاسبة عن إصدار تقدير عند اختيار هذه الحالات أو عدم التأكد من النطاق.",
  },
  {
    q: "هل تدعم الحاسبة الرواتب الأسبوعية أو اليومية أو بالساعة أو بالقطعة؟",
    a: "لا، النسخة الحالية تدعم الأجر الشهري فقط. تنص المادة (43/4) على أساس الأجر الأخير للموظفين الشهريين والأسبوعيين واليوميين وبالساعة، وعلى متوسط الأجر اليومي للعامل بالقطعة. لا تستخدم قسمة الراتب الشهري على 30 للحالات غير الشهرية.",
  },
  {
    q: "ما الفرق بين مدة الإنذار وبدل الإنذار في الإمارات؟",
    a: "مدة الإنذار هي المهلة المتفق عليها التي يستمر خلالها عقد العمل. أما بدل الإنذار فهو التعويض عن كامل المهلة أو الجزء المتبقي الذي لم يلتزم به الطرف المسؤول. إذا نُفذت المهلة كاملة، فلا توجد أيام غير منفذة في هذا التقدير.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: noticeFaqs.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "حاسبة فترة الإنذار في الإمارات 2026",
  url: `${SITE_URL}/ar/ae/notice-period-calculator`,
  operatingSystem: "All",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "AED",
  },
  description:
    "احسب فترة الإنذار في الإمارات، آخر يوم عمل، الأيام غير المنفذة وبدل الإنذار التقديري للموظف أو صاحب العمل وفق بيانات عقد العمل.",
  publisher: { "@id": SITE_ORG_ID },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "أدوات الإمارات", item: `${SITE_URL}/ar/ae` },
    {
      "@type": "ListItem",
      position: 3,
      name: "حاسبة فترة الإنذار",
      item: `${SITE_URL}/ar/ae/notice-period-calculator`,
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

        {/* GEO Answer Summary */}
        <GeoAnswerSummary
          whatItDoes="تحسب مدة فترة الإنذار وتاريخ آخر يوم عمل وبدل الإنذار التقديري للموظف أو صاحب العمل"
          appliesTo="دولة الإمارات العربية المتحدة — عقود العمل في القطاع الخاص"
          keyRule="تتراوح مدة الإنذار المتفق عليها في عقد العمل بين 30 و90 يوماً وفق المادة 43، ويجوز الاتفاق على الإعفاء منها أو تخفيضها مع حفظ حقوق العامل."
          authority="وزارة الموارد البشرية والتوطين (MOHRE)"
          authorityUrl="https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/job-offers-and-work-permits-and-contracts/terminating-employment-contracts"
          lastReviewed="نوفمبر 2026"
          disclaimer="هذه الأداة تقديرية استرشادية — راجع عقد العمل أو MOHRE للتحقق من شروط الإنذار المتفق عليها."
        />

        {/* Contextual Link to Final Settlement Calculator */}
        <section className="mx-auto max-w-4xl px-4 pb-6 no-print print:hidden">
          <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  احسب جميع مستحقات نهاية العمل
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  احسب تصفية كاملة: مكافأة نهاية الخدمة، آخر راتب، بدل رصيد الإجازات، وبدل الإنذار في وثيقة موحدة.
                </p>
              </div>
            </div>
            <Link
              href="/ar/ae/final-settlement-calculator"
              className="shrink-0 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 transition shadow"
            >
              الانتقال إلى UAE Final Settlement Calculator ←
            </Link>
          </div>
        </section>

        {/* ── PART 2: Comprehensive Explanation (Structured SEO Content) ────────── */}
        <section className="mx-auto max-w-4xl px-4 py-6 no-print print:hidden">
          <article className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-bold text-ink">
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
                حددت المادة (43) من قانون العمل الإماراتي رقم 33 لسنة 2021 نطاقاً واضحاً لمهلة الإنذار في عقود العمل الخاضعة للقانون الاتحادي:
              </p>
              <ul className="list-disc list-inside text-sm text-ink-secondary mt-1.5 space-y-1">
                <li><strong>الحد الأدنى:</strong> 30 يوماً تقويمياً.</li>
                <li><strong>الحد الأقصى:</strong> 90 يوماً تقويمياً.</li>
              </ul>
              <p className="text-xs text-ink-muted mt-1.5">
                تتراوح مدة الإنذار المتفق عليها أصلاً في عقد العمل بين 30 و90 يوماً وفقاً للمادة (43). ويجوز للطرفين الاتفاق على الإعفاء من شرط الإنذار أو تخفيض مدته، مع الحفاظ على كامل حقوق العامل عن فترة الإنذار المتفق عليها في العقد.
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
                هذا التقدير مخصص للعامل الذي يتقاضى أجراً شهرياً: يُستخدم آخر أجر وفق تعريف المادة (1)، أي الأجر الأساسي مضافاً إليه البدلات النقدية والمزايا العينية المقررة كجزء من الأجر في العقد أو القانون. لا تخلط بينه وبين أساس مكافأة نهاية الخدمة الذي يعتمد على الأجر الأساسي.
              </p>
              <p className="text-xs text-ink-muted">
                وفق المادة (67)، الشهر في تطبيق القانون يساوي 30 يوماً؛ لذلك تستخدم الحاسبة قسمة الأجر الشهري على 30. أما الأجر الأسبوعي أو اليومي أو بالساعة أو بالقطعة فيخضع للمادة (43/4) ولا تدعمه هذه النسخة.
              </p>
            </div>

            {/* 5. من يدفع بدل الإنذار؟ */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">من يدفع بدل الإنذار؟</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                تنص المادة (43/3) على أن الطرف الذي لا يلتزم بفترة الإنذار يدفع للطرف الآخر بدل الإنذار، حتى لو لم ينتج عن عدم الالتزام ضرر. تحديد الطرف المسؤول يعتمد على من لم ينفذ المهلة فعلياً، وليس فقط على من بدأ إنهاء العقد.
              </p>
              <ul className="list-disc list-inside text-sm text-ink-secondary mt-1 space-y-1">
                <li><strong>إذا طلب صاحب العمل من العامل المغادرة قبل إكمال المهلة</strong> دون اتفاق يحفظ الحقوق: يكون صاحب العمل هو الطرف الذي لم يلتزم، ويُقدّر البدل لصالح العامل.</li>
                <li><strong>إذا غادر العامل قبل إكمال المهلة</strong> دون اتفاق يحفظ الحقوق: يكون العامل هو الطرف الذي لم يلتزم، ويُقدّر البدل لصالح صاحب العمل.</li>
              </ul>
              <p className="text-xs text-ink-muted">مجرد كون صاحب العمل أو العامل هو من بدأ إنهاء العقد لا يكفي وحده لتحديد الطرف المخل؛ يجب مراجعة الإخطار والاتفاق والوقائع.</p>
            </div>

            {/* 6. ماذا يحدث عند تنفيذ جزء فقط من الإنذار؟ */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">ماذا يحدث عند تنفيذ جزء فقط من الإنذار؟</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                وفقاً للمادة 43، يكون التعويض مساوياً لأجر العامل عن الجزء المتبقي غير المنفذ فقط، ولا يُلزم الطرف المخل بالتعويض عن كامل مدة الإنذار إذا كان قد نُفذ جزء منها بالفعل.
              </p>
            </div>

            {/* 7. الاتفاق على الإعفاء أو تخفيض المهلة */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">هل يمكن إعفاء الطرفين من فترة الإنذار أو تخفيضها؟</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                تسمح المادة (43/2) بالاتفاق على الإعفاء من شرط الإنذار أو تخفيض مدته، مع الحفاظ على حقوق العامل عن مدة الإنذار المتفق عليها، وتكون المدة متساوية للطرفين ما لم يكن الاختلاف لصالح العامل. لذلك لا يعني الإعفاء تلقائياً سقوط جميع الحقوق أو أن بدل الإنذار يساوي صفراً. يجب قراءة الاتفاق المكتوب وتحديد ما تم حفظه من حقوق؛ ولهذا لا تصدر الحاسبة رقماً آلياً عند اختيار وجود اتفاق إعفاء أو تخفيض.
              </p>
            </div>

            {/* 8. هل تختلف القواعد أثناء فترة التجربة؟ */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">هل تختلف القواعد أثناء فترة التجربة؟</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                نعم. تخضع فترة التجربة لأحكام المادة (9)، ولا تستخدم هذه الحاسبة لحسابها:
              </p>
              <ul className="list-disc list-inside text-xs text-ink-secondary mt-1 space-y-1">
                <li>إذا أنهى صاحب العمل العقد أثناء التجربة: إخطار خطي لا يقل عن 14 يوماً.</li>
                <li>إذا رغب العامل بترك العمل للالتحاق بعمل آخر بالدولة: إخطار قبل شهر مع التزام صاحب العمل الجديد بالتعويض.</li>
                <li>إذا رغب العامل الأجنبي بمغادرة الدولة: إخطار قبل 14 يوماً على الأقل.</li>
              </ul>
              <p className="text-xs text-ink-muted mt-2">إذا لم يلتزم أي طرف بمتطلبات المادة (9)، فقد يستحق الطرف الآخر تعويضاً يعادل أجر مهلة الإخطار أو الجزء المتبقي منها. هذه الحالة خارج نطاق الحاسبة الحالية.</p>
            </div>

            {/* 8. هل تختلف القواعد في DIFC وADGM؟ */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">هل تختلف القواعد في DIFC وADGM؟</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">
                نعم. تخضع DIFC وADGM لأطر عمل مستقلة عن قانون العمل الاتحادي، كما قد تخضع بعض الجهات الحكومية لقواعد مختلفة. لذلك لا تصدر الحاسبة نتيجة عند اختيار هذه الجهات أو عدم التأكد من نطاق العمل.
              </p>
            </div>

            {/* 9. كيفية استخدام الحاسبة */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">كيفية استخدام الحاسبة</h3>
              <ol className="list-decimal list-inside text-sm text-ink-secondary space-y-1">
                <li>أكد أن العمل في القطاع الخاص الخاضع للقانون الاتحادي، وخارج DIFC وADGM، وبعد فترة التجربة.</li>
                <li>اختر الطرف الذي بدأ إنهاء العقد، ثم حدد الطرف الذي لم يلتزم بإكمال فترة الإنذار؛ فقد يختلف الطرفان.</li>
                <li>حدد تاريخ الإشعار وفترة الإنذار المتفق عليها في العقد (30 إلى 90 يوماً).</li>
                <li>أدخل الأيام المنفذة أو آخر يوم عمل فعلي، ثم آخر أجر شهري إجمالي.</li>
                <li>لا تستخدم النتيجة إذا كان الأجر أسبوعياً أو يومياً أو بالساعة أو بالقطعة، أو عند وجود اتفاق إعفاء/تخفيض خاص.</li>
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
                    بدأ صاحب العمل إنهاء العقد، وهو أيضاً الطرف الذي لم يلتزم بإكمال المهلة: آخر أجر شهري 12,000 درهم (الأجر اليومي التقديري 400 درهم) | المتبقي: 20 يوماً | <strong>التعويض التقديري: 8,000 درهم لصالح الموظف</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* 11. المصادر الرسمية */}
            <div>
              <h3 className="text-base font-bold text-ink mb-1.5">المصادر الرسمية</h3>
              <ul className="list-disc list-inside text-xs text-ink-secondary leading-relaxed space-y-1">
                <li>
                  <a href="https://www.uaelegislation.gov.ae/en/legislations/1541/download" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    المرسوم بقانون اتحادي رقم (33) لسنة 2021 — بوابة التشريعات الإماراتية (المواد 1 و9 و43 و67)
                  </a>
                </li>
                <li>
                  <a href="https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/job-offers-and-work-permits-and-contracts/terminating-employment-contracts" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    حكومة الإمارات — إنهاء عقود العمل وفترة الإنذار
                  </a>
                </li>
                <li>
                  <a href="https://www.mohre.gov.ae/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    وزارة الموارد البشرية والتوطين (MOHRE)
                  </a>
                </li>
              </ul>
              <p className="text-xs text-ink-muted mt-2">المادة (43/4) تميز بين الأجر الشهري والأسبوعي واليومي وبالساعة، وتحدد متوسط الأجر اليومي للعامل بالقطعة؛ الحاسبة الحالية لا تدعم إلا الأجر الشهري.</p>
            </div>

            {/* 12. آخر تحديث */}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-xs text-ink-muted">
              <span><strong>آخر مراجعة قانونية:</strong> نوفمبر 2026</span>
              <span>المواد 1 و9 و43 و67 من المرسوم 33 لسنة 2021</span>
            </div>
          </article>
        </section>

        {/* ── PART 3: FAQ Section ──────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-4 py-4 no-print print:hidden">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <div className="border-b border-brand-border pb-4 mb-6">
              <h2 className="text-xl font-bold text-ink">
                ❓ الأسئلة الشائعة حول فترة الإنذار وبدل الإشعار بالإمارات
              </h2>
              <p className="text-xs text-ink-muted mt-1">
                إجابات مبنية على المصادر الرسمية المتاحة من وزارة الموارد البشرية والتوطين
              </p>
            </div>

            <div className="space-y-5">
              {noticeFaqs.map((item, i) => (
                <div key={i} className="border-b border-brand-border pb-5 last:border-b-0 last:pb-0">
                  <h3 className="text-sm font-bold text-ink mb-2">س: {item.q}</h3>
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
              <h2 className="text-lg font-bold text-ink">🔗 أدوات وحاسبات عمالية ذات صلة بدولة الإمارات</h2>
              <p className="text-xs text-ink-muted mt-1">حاسبات تقديرية مساعدة لفهم مستحقات العمل في الإمارات — وليست أدوات معتمدة رسمياً من جهة حكومية</p>
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
                  badgeColor: "bg-emerald-700 text-white font-bold",
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
