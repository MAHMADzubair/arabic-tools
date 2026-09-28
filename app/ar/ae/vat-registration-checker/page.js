import UaeVatRegistrationChecker from "@/components/UaeVatRegistrationChecker";
import Link from "next/link";
import { FTA_OFFICIAL_URL, FTA_REGISTRATION_URL } from "@/lib/uaeVatRegistrationConfig";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: "حاسبة التسجيل في ضريبة القيمة المضافة الإمارات 2026 | حد 375,000 درهم",
  description:
    "احسب أهليتك للتسجيل في ضريبة القيمة المضافة بالإمارات: حد التسجيل الإلزامي 375,000 درهم وحد الاختياري 187,500 درهم خلال آخر 12 شهراً والـ 30 يوماً القادمة للمقيمين وغير المقيمين وفق الهيئة الاتحادية للضرائب FTA.",
  keywords: [
    "التسجيل في ضريبة القيمة المضافة الإمارات",
    "حد التسجيل الإلزامي 375000 درهم",
    "حد التسجيل الاختياري 187500 درهم",
    "ضريبة القيمة المضافة الإمارات",
    "الهيئة الاتحادية للضرائب FTA",
    "حاسبة أهلية التسجيل الضريبي",
    "VAT registration UAE",
    "FTA VAT threshold",
    "تسجيل ضريبة القيمة المضافة دبي",
    "EmaraTax تسجيل",
  ],
  alternates: {
    canonical: "https://arabic-tools-xi.vercel.app/ar/ae/vat-registration-checker",
  },
  openGraph: {
    title: "حاسبة التسجيل في ضريبة القيمة المضافة الإمارات 2026 | حد 375,000 درهم",
    description:
      "احسب أهليتك للتسجيل في ضريبة القيمة المضافة بالإمارات: حد الإلزامي 375,000 درهم والاختياري 187,500 درهم وفق الهيئة الاتحادية للضرائب.",
    url: "https://arabic-tools-xi.vercel.app/ar/ae/vat-registration-checker",
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
      name: "ما هو حد التسجيل الإلزامي في ضريبة القيمة المضافة في الإمارات؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "حد التسجيل الإلزامي في دولة الإمارات هو 375,000 درهم إماراتي. يلتزم أي شخص أو منشأة مقيمة تمارس نشاطاً اقتصادياً بالتسجيل لدى الهيئة الاتحادية للضرائب (FTA) إذا تجاوزت توريداتها الخاضعة للضريبة وواردتها هذا المبلغ خلال الاثني عشر شهراً الماضية، أو كان يُتوقع تجاوزه خلال الثلاثين يوماً القادمة.",
      },
    },
    {
      "@type": "Question",
      name: "ما هو حد التسجيل الاختياري في ضريبة القيمة المضافة بالإمارات؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "حد التسجيل الاختياري هو 187,500 درهم إماراتي (50% من حد الإلزام). إذا تجاوزت التوريدات الخاضعة أو الواردات أو المصروفات الخاضعة هذا الحد خلال الـ 12 شهراً الماضية أو يُتوقع تجاوزه خلال الـ 30 يوماً القادمة، يحق التسجيل الاختياري. أبرز فائدته: استرداد ضريبة المدخلات (5%) على المشتريات والتكاليف التشغيلية.",
      },
    },
    {
      "@type": "Question",
      name: "كيف يعمل اختبار آخر 12 شهراً لتحديد التسجيل الإلزامي؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "يُحتسب إجمالي التوريدات الخاضعة للضريبة والواردات خلال أي فترة مدتها 12 شهراً متتالية. إذا تجاوز هذا الإجمالي 375,000 درهم في نهاية أي شهر، وجب التسجيل. يتم الاحتساب بأثر رجعي — أي تُجمع التوريدات من الشهر الحالي والـ 11 شهراً التي سبقته.",
      },
    },
    {
      "@type": "Question",
      name: "كيف يعمل اختبار الـ 30 يوماً القادمة في الإمارات؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "إذا توقعت منشأتك أن تتجاوز توريداتها الخاضعة للضريبة أو واردتها 375,000 درهم خلال الـ 30 يوماً القادمة (بناءً على عقود مؤكدة أو توقعات موثقة)، يجب التسجيل قبل بدء تلك التوريدات. هذا الاختبار يختلف عن السعودية التي تستخدم نافذة 12 شهراً للتوقعات المستقبلية.",
      },
    },
    {
      "@type": "Question",
      name: "هل تختلف قواعد التسجيل لغير المقيمين في الإمارات؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم. لا ينطبق حد الـ 375,000 درهم على غير المقيمين. إذا قدّم شخص غير مقيم توريدات خاضعة للضريبة داخل الإمارات ولم يكن هناك طرف آخر مسجل مسؤول عن احتساب الضريبة (كآلية الاحتساب العكسي)، وجب التسجيل فور بدء هذه التوريدات بصرف النظر عن قيمتها.",
      },
    },
    {
      "@type": "Question",
      name: "هل تدخل المصروفات في حساب التسجيل في الإمارات؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، لأغراض التسجيل الاختياري فقط. إذا تجاوزت مصروفاتك الخاضعة للضريبة (مشتريات، إيجارات تجارية، خدمات مهنية...) 187,500 درهم خلال الـ 12 شهراً الماضية أو يُتوقع تجاوزها خلال الـ 30 يوماً القادمة، تصبح مؤهلاً للتسجيل الاختياري حتى لو كانت مبيعاتك أقل من هذا الحد.",
      },
    },
    {
      "@type": "Question",
      name: "ما الفرق بين التوريدات المعفاة والتوريدات بنسبة صفرية في الإمارات؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "التوريدات الصفرية (كالصادرات والرعاية الصحية والتعليم) هي توريدات خاضعة للضريبة بنسبة 0%؛ تُحتسب في حدود التسجيل ويحق استرداد ضريبة مدخلاتها. أما التوريدات المعفاة (كإيجار العقارات السكنية وبعض الخدمات المالية) فلا تُحتسب في حدود التسجيل ولا يجوز المطالبة باسترداد ضريبة مدخلاتها.",
      },
    },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "حاسبة أهلية التسجيل في ضريبة القيمة المضافة في الإمارات",
  operatingSystem: "All",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "AED",
  },
  description:
    "أداة فحص أهلية التسجيل في ضريبة القيمة المضافة في الإمارات وفق لوائح الهيئة الاتحادية للضرائب FTA وحدود 375,000 و 187,500 درهم.",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: "https://arabic-tools-xi.vercel.app" },
    { "@type": "ListItem", position: 2, name: "🇦🇪 أدوات الإمارات", item: "https://arabic-tools-xi.vercel.app/ar/ae" },
    {
      "@type": "ListItem",
      position: 3,
      name: "حاسبة أهلية التسجيل في ضريبة القيمة المضافة",
      item: "https://arabic-tools-xi.vercel.app/ar/ae/vat-registration-checker",
    },
  ],
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UaeVatRegistrationCheckerPage() {
  return (
    <>
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }} />

      <main className="min-h-screen bg-page-bg" dir="rtl">

        {/* Breadcrumb */}
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Link href="/" className="hover:text-brand transition-colors">الرئيسية</Link>
            <span>›</span>
            <Link href="/ar/ae" className="hover:text-brand transition-colors">🇦🇪 أدوات الإمارات</Link>
            <span>›</span>
            <span className="text-ink font-semibold">حاسبة أهلية التسجيل في ضريبة القيمة المضافة</span>
          </nav>
        </div>

        {/* ── PART 1: Calculator ─────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 py-4">
          <UaeVatRegistrationChecker />
        </div>

        {/* ── PART 2: SEO Content ────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">
                📖 ما هو حد التسجيل في ضريبة القيمة المضافة في الإمارات؟
              </h2>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                تُطبّق دولة الإمارات العربية المتحدة ضريبة القيمة المضافة بنسبة 5% منذ يناير 2018،
                وتُشرف على تطبيقها <strong className="text-ink">الهيئة الاتحادية للضرائب (FTA)</strong> بموجب
                المرسوم بقانون اتحادي رقم (8) لسنة 2017. تُعدّ{" "}
                <strong className="text-ink">حاسبة أهلية التسجيل في ضريبة القيمة المضافة</strong>{" "}
                أداة استرشادية تساعد المنشآت والأفراد في تقييم التزامهم بالتسجيل وفق الحدود المنشورة من الهيئة الاتحادية للضرائب.
              </p>
              <p>
                تقدير ما إذا كانت بياناتك تشير إلى وجوب التسجيل أمر بالغ الأهمية؛ إذ يُعرّض التأخر المنشأة لغرامات مالية
                مقررة بموجب جداول العقوبات الصادرة عن FTA.
              </p>
            </div>

            {/* Mandatory threshold */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-5 space-y-2">
              <h3 className="text-base font-extrabold text-rose-950 flex items-center gap-2">
                <span>🚨</span><span>متى يصبح التسجيل إلزامياً؟</span>
              </h3>
              <p className="text-xs sm:text-sm text-rose-900 leading-relaxed">
                يصبح التسجيل إلزامياً لأي منشأة مقيمة في حالتين:
              </p>
              <ul className="text-xs sm:text-sm text-rose-900 space-y-1.5 list-disc list-inside">
                <li>
                  إذا تجاوزت التوريدات الخاضعة للضريبة والواردات{" "}
                  <strong>375,000 درهم</strong> خلال أي 12 شهراً ماضية (اختبار تاريخي).
                </li>
                <li>
                  إذا كان يُتوقع أن تتجاوز التوريدات الخاضعة والواردات{" "}
                  <strong>375,000 درهم</strong> خلال الـ 30 يوماً القادمة (اختبار مستقبلي — بناءً على عقود أو توقعات موثقة).
                </li>
              </ul>
            </div>

            {/* Voluntary threshold */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5 space-y-2">
              <h3 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
                <span>⭐</span><span>متى يمكن التسجيل اختيارياً؟</span>
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                إذا لم تُستوفَ شروط الإلزام لكن:
              </p>
              <ul className="text-xs sm:text-sm text-amber-900 space-y-1.5 list-disc list-inside">
                <li>
                  التوريدات الخاضعة والواردات <strong>أو</strong> المصروفات الخاضعة للضريبة تجاوزت{" "}
                  <strong>187,500 درهم</strong> خلال آخر 12 شهراً، أو يُتوقع تجاوزها خلال الـ 30 يوماً القادمة.
                </li>
              </ul>
              <p className="text-xs text-amber-800 mt-1">
                <strong>الفائدة الرئيسية:</strong> استرداد ضريبة المدخلات (5%) على المشتريات والتكاليف التشغيلية وتعزيز المصداقية التجارية B2B.
              </p>
            </div>

            {/* Comparison table */}
            <div>
              <h3 className="text-sm font-extrabold text-ink mb-3">هل تختلف القواعد لغير المقيمين؟</h3>
              <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4">
                <p className="text-xs text-purple-900 leading-relaxed">
                  نعم. لا ينطبق حد الـ 375,000 درهم على غير المقيمين. الشخص غير المقيم الذي يقدّم
                  توريدات خاضعة داخل الإمارات يلتزم بالتسجيل فور بدء هذه التوريدات، ما لم يكن هناك
                  مشتر مسجل في الإمارات مسؤول عن احتساب الضريبة بموجب آلية الاحتساب العكسي.
                </p>
              </div>
            </div>

            {/* Included vs excluded */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                <h4 className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                  <span>✅</span><span>ما يُدرج في الحساب:</span>
                </h4>
                <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
                  <li>التوريدات بنسبة 5% (المعيارية).</li>
                  <li>التوريدات بنسبة 0% (صادرات، صحة، تعليم، نقل دولي).</li>
                  <li>الواردات الخاضعة للضريبة (عبر الاحتساب العكسي للمستورد).</li>
                  <li>المصروفات الخاضعة (لأغراض التسجيل الاختياري فقط).</li>
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <h4 className="text-xs font-black text-ink flex items-center gap-1.5">
                  <span>❌</span><span>ما لا يُدرج في الحساب:</span>
                </h4>
                <ul className="text-xs text-ink-secondary space-y-1 list-disc list-inside">
                  <li>التوريدات المعفاة (إيجار سكني، بعض الخدمات المالية).</li>
                  <li>توريدات خارج نطاق الضريبة.</li>
                  <li>الأصول الرأسمالية المباعة (بحسب ظروف التوريد).</li>
                </ul>
              </div>
            </div>

            {/* Last updated */}
            <p className="text-[11px] text-ink-muted border-t border-brand-border pt-3">
              آخر تحديث: يناير 2026م — المصدر: الهيئة الاتحادية للضرائب، دولة الإمارات العربية المتحدة.
            </p>
          </div>
        </section>

        {/* ── PART 3: Worked Examples ────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-2">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-5">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">🔢 أمثلة عملية</h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  title: "مثال 1 — تسجيل إلزامي (التوريدات السابقة)",
                  scenario: "مورّد تجزئة بدبي: توريدات خاضعة خلال آخر 12 شهراً = 420,000 درهم",
                  result: "التسجيل الإلزامي مطلوب",
                  resultColor: "text-rose-700",
                  note: "تجاوزت التوريدات حد 375,000 درهم خلال الـ 12 شهراً الماضية.",
                },
                {
                  title: "مثال 2 — تسجيل إلزامي (التوقعات المستقبلية)",
                  scenario: "شركة استشارات حصلت على عقد بقيمة 400,000 درهم يُنجز خلال 30 يوماً",
                  result: "التسجيل الإلزامي مطلوب",
                  resultColor: "text-rose-700",
                  note: "التوريدات المتوقعة خلال الـ 30 يوماً تتجاوز 375,000 درهم.",
                },
                {
                  title: "مثال 3 — تسجيل اختياري (مصروفات)",
                  scenario: "مصنع صغير: مبيعات 150,000 درهم، مصروفات خاضعة 210,000 درهم",
                  result: "مؤهل للتسجيل الاختياري",
                  resultColor: "text-amber-700",
                  note: "المصروفات تجاوزت حد الاختياري 187,500 درهم رغم أن المبيعات لم تتجاوزه.",
                },
                {
                  title: "مثال 4 — دون الحد",
                  scenario: "مطعم صغير: توريدات 100,000 درهم، مصروفات 50,000 درهم",
                  result: "غير ملزم بالتسجيل حالياً",
                  resultColor: "text-emerald-700",
                  note: "لم تتجاوز أي قيمة حدود التسجيل الإلزامي أو الاختياري.",
                },
                {
                  title: "مثال 5 — غير مقيم",
                  scenario: "شركة أجنبية تبيع خدمات تقنية مباشرةً لأفراد في الإمارات",
                  result: "حالة خاصة: قد يكون التسجيل الإلزامي مطلوباً",
                  resultColor: "text-purple-700",
                  note: "لا ينطبق حد الـ 375,000 درهم — التسجيل مطلوب بصرف النظر عن قيمة التوريدات.",
                },
              ].map((ex, i) => (
                <div key={i} className="rounded-xl border border-brand-border/80 p-4 space-y-1">
                  <h3 className="text-xs font-extrabold text-ink">{ex.title}</h3>
                  <p className="text-xs text-ink-secondary">{ex.scenario}</p>
                  <p className={`text-xs font-black ${ex.resultColor}`}>النتيجة: {ex.result}</p>
                  <p className="text-[11px] text-ink-muted">{ex.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PART 4: FAQ ────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-5">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">❓ الأسئلة الشائعة</h2>
            </div>
            <div className="space-y-5">
              {faqJsonLd.mainEntity.map((item, i) => (
                <div key={i} className="border-b border-brand-border pb-5 last:border-b-0 last:pb-0">
                  <h3 className="text-sm font-extrabold text-ink mb-2">س: {item.name}</h3>
                  <p className="text-sm text-ink-secondary leading-relaxed">ج: {item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PART 5: Related UAE Tools ──────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-4 pb-12">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <div className="border-b border-brand-border pb-4 mb-5">
              <h2 className="text-lg font-extrabold text-ink">🔗 أدوات وحاسبات ذات صلة بدولة الإمارات</h2>
              <p className="text-xs text-ink-muted mt-1">حاسبات عمالية ومالية وضريبية مخصصة لبيئة العمل الإماراتية</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  href: "/vat-calculator/uae",
                  icon: "🧾",
                  title: "حاسبة ضريبة القيمة المضافة في الإمارات 5%",
                  desc: "احسب ضريبة الـ 5% أو استخرج السعر الأصلي من أي فاتورة إماراتية وفق FTA.",
                  badge: "FTA 5%",
                  badgeColor: "bg-purple-100 text-purple-800",
                },
                {
                  href: "/ar/ae/final-settlement-calculator",
                  icon: "📋",
                  title: "حاسبة المخالصة النهائية في الإمارات",
                  desc: "تصفية كاملة: مكافأة نهاية الخدمة، آخر راتب، رصيد الإجازات، وبدل الإنذار.",
                  badge: "قانون 33",
                  badgeColor: "bg-emerald-100 text-emerald-800",
                },
                {
                  href: "/ar/ae/notice-period-calculator",
                  icon: "⏳",
                  title: "حاسبة فترة الإنذار في الإمارات",
                  desc: "احسب تاريخ آخر يوم عمل والأيام غير المنفذة وبدل الإنذار وفق المادة 43.",
                  badge: "المادة 43",
                  badgeColor: "bg-blue-100 text-blue-800",
                },
                {
                  href: "/gratuity-calculator/uae",
                  icon: "🎖️",
                  title: "حاسبة مكافأة نهاية الخدمة في الإمارات",
                  desc: "احسب المكافأة وفق المادة 51 مع سقف السنتين وقواعد الحساب التفصيلية.",
                  badge: "المادة 51",
                  badgeColor: "bg-amber-100 text-amber-800",
                },
                {
                  href: "/ar/ae",
                  icon: "🇦🇪",
                  title: "مجمع أدوات وحاسبات الإمارات",
                  desc: "الدليل الشامل لكافة الحاسبات العمالية والمالية والضريبية المخصصة للإمارات.",
                  badge: "الشامل",
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
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-bold text-ink group-hover:text-brand transition-colors">
                        {tool.title}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
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
