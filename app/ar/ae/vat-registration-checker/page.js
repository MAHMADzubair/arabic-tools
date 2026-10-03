import UaeVatRegistrationChecker from "@/components/UaeVatRegistrationChecker";
import Link from "next/link";
import GeoAnswerSummary from "@/components/GeoAnswerSummary";
import RelatedBusinessTools from "@/components/business/RelatedBusinessTools";
import { SITE_URL } from "@/lib/siteConfig";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: "حاسبة التسجيل في ضريبة القيمة المضافة الإمارات | VAT Registration UAE 2026",
  description:
    "تحقق مما إذا كان نشاطك في الإمارات ملزماً أو مؤهلاً للتسجيل في VAT وفق حدود FTA: 375,000 درهم للتسجيل الإلزامي و187,500 درهم للتسجيل الاختياري.",
  keywords: [
    "حاسبة التسجيل في ضريبة القيمة المضافة الإمارات",
    "حد التسجيل الإلزامي VAT الإمارات",
    "حد التسجيل الاختياري VAT الإمارات",
    "375000 درهم ضريبة القيمة المضافة",
    "187500 درهم تسجيل اختياري",
    "VAT Registration UAE",
    "FTA VAT Registration",
    "UAE VAT Registration Threshold",
    "EmaraTax تسجيل ضريبة القيمة المضافة",
  ],
  alternates: {
    canonical: "/ar/ae/vat-registration-checker",
  },
  openGraph: {
    title: "حاسبة التسجيل في ضريبة القيمة المضافة الإمارات | VAT Registration UAE 2026",
    description:
      "تحقق من التزام نشاطك بالتسجيل في ضريبة القيمة المضافة في الإمارات: 375,000 درهم إلزامي و187,500 درهم اختياري وفق الهيئة الاتحادية للضرائب FTA.",
    url: `${SITE_URL}/ar/ae/vat-registration-checker`,
    type: "website",
    locale: "ar_AE",
  },
};

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية",           item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "🇦🇪 أدوات الإمارات", item: `${SITE_URL}/ar/ae` },
    { "@type": "ListItem", position: 3, name: "حاسبة التسجيل في ضريبة القيمة المضافة", item: `${SITE_URL}/ar/ae/vat-registration-checker` },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "حاسبة التسجيل في ضريبة القيمة المضافة في الإمارات — UAE VAT Registration Checker",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
  description:
    "أداة مجانية لفحص أهلية التسجيل في ضريبة القيمة المضافة بالإمارات وفق حدود الهيئة الاتحادية للضرائب: 375,000 درهم للتسجيل الإلزامي و187,500 درهم للاختياري.",
  inLanguage: "ar",
  url: `${SITE_URL}/ar/ae/vat-registration-checker`,
};

// 10 FAQs — visible accordion + FAQPage schema
const faqs = [
  {
    q: "ما هو حد التسجيل الإلزامي في ضريبة القيمة المضافة في الإمارات؟",
    a: "حد التسجيل الإلزامي هو 375,000 درهم إماراتي. يلتزم أي شخص أو منشأة مقيمة تمارس نشاطاً اقتصادياً بالتسجيل لدى الهيئة الاتحادية للضرائب (FTA) إذا تجاوزت توريداتها الخاضعة للضريبة وواردتها هذا المبلغ خلال أي 12 شهراً ماضية، أو كان يُتوقع تجاوزه خلال الـ 30 يوماً القادمة.",
  },
  {
    q: "ما هو حد التسجيل الاختياري في الإمارات؟",
    a: "حد التسجيل الاختياري هو 187,500 درهم (50% من حد الإلزام). إذا تجاوزت التوريدات الخاضعة أو الواردات أو المصروفات الخاضعة للضريبة هذا الحد خلال آخر 12 شهراً أو يُتوقع تجاوزه خلال الـ 30 يوماً القادمة، يحق التسجيل الاختياري. الميزة الرئيسية: استرداد ضريبة المدخلات (5%) على التكاليف التشغيلية.",
  },
  {
    q: "هل أحسب آخر 12 شهراً أم السنة التقويمية؟",
    a: "يُحتسب الاختبار على أي 12 شهراً متتالية، وليس السنة التقويمية بالضرورة. أي: اجمع التوريدات الخاضعة خلال الشهر الحالي والـ 11 شهراً التي سبقته. إذا تجاوز المجموع 375,000 درهم في نهاية أي شهر، وجب التسجيل.",
  },
  {
    q: "ماذا لو كنت سأتجاوز الحد خلال 30 يوماً فقط؟",
    a: "يُطبّق اختبار التوقعات المستقبلية على نافذة 30 يوماً فقط في الإمارات — وهذا يختلف عن بعض أنظمة ضريبة القيمة المضافة الأخرى. إذا كان لديك عقود موقعة أو أوامر شراء تُشير إلى أن توريداتك ستتجاوز 375,000 درهم خلال الـ 30 يوماً القادمة، يجب التسجيل قبل بدء هذه التوريدات.",
  },
  {
    q: "هل النفقات تدخل في حساب حد التسجيل؟",
    a: "المصروفات الخاضعة للضريبة تدخل في حساب حد التسجيل الاختياري فقط (187,500 درهم). تشمل: المشتريات التجارية الخاضعة، الإيجارات التجارية، الخدمات المهنية الخاضعة. أما حد التسجيل الإلزامي (375,000 درهم) فيُحسب على التوريدات الخاضعة والواردات فقط، لا المصروفات.",
  },
  {
    q: "هل غير المقيم يخضع لحد الـ 375,000 درهم؟",
    a: "لا. لا ينطبق حد الـ 375,000 درهم على غير المقيمين. الشخص غير المقيم الذي يقدّم توريدات خاضعة للضريبة داخل الإمارات يلتزم بالتسجيل فور بدء هذه التوريدات، بصرف النظر عن قيمتها، ما لم يكن هناك مشترٍ مسجل في الإمارات مسؤول عن احتساب الضريبة بموجب آلية الاحتساب العكسي.",
  },
  {
    q: "هل أحتاج إلى عقود أو أوامر شراء لإثبات الإيرادات المتوقعة؟",
    a: "نعم. إذا كنت تتقدم بطلب تسجيل استناداً إلى توقع تجاوز حد الـ 30 يوماً، قد تطلب الهيئة الاتحادية للضرائب أدلة داعمة مثل العقود الموقعة وأوامر الشراء المختومة وغيرها من وثائق تُثبت الإيرادات المتوقعة. يُنصح بالاحتفاظ بنسخ من أوامر الشراء (LPO) والعقود عند تقديم الطلب.",
  },
  {
    q: "هل المؤسسات الفردية المتعددة تحتاج أرقام TRN منفصلة؟",
    a: "وفق إرشادات الهيئة الاتحادية للضرائب، لا ينبغي معاملة المؤسسات الفردية المتعددة المملوكة للشخص الطبيعي نفسه كمنشآت منفصلة لأغراض التسجيل في VAT؛ إذ قد يُحسب الحد بناءً على إجمالي نشاطات الشخص الطبيعي مجتمعةً. راجع إرشادات FTA المختصة أو مستشارك الضريبي لتحديد المتطلب الدقيق لحالتك.",
  },
  {
    q: "ماذا يحدث بعد قبول طلب التسجيل في VAT؟",
    a: "بعد موافقة FTA على الطلب، يُصدر للمنشأة شهادة التسجيل في ضريبة القيمة المضافة متضمنةً الرقم الضريبي (TRN) المكوّن من 15 رقماً. يُتاح للمنشأة بعدها إصدار الفواتير الضريبية، وتحصيل VAT من العملاء، والمطالبة باسترداد ضريبة المدخلات، وتقديم الإقرارات الضريبية الدورية عبر بوابة EmaraTax.",
  },
  {
    q: "هل هذه الأداة معتمدة من الهيئة الاتحادية للضرائب FTA؟",
    a: "لا. هذه أداة مساعدة تُجري فحصاً أولياً للأهلية بناءً على البيانات المُدخلة وحدود التسجيل المنشورة من FTA. هي غير مرتبطة بالهيئة الاتحادية للضرائب ولا تُصدر قرارات تسجيل رسمية. قرار التسجيل النهائي يعود دائماً لـ FTA. راجع بوابة EmaraTax أو مستشارك الضريبي للإجراء الرسمي.",
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

// ─── Related Tools ────────────────────────────────────────────────────────────
const relatedTools = [
  {
    href: "/ar/ae/vat-invoice-generator",
    icon: "🧾",
    title: "مولد الفاتورة الضريبية في الإمارات",
    desc: "بعد التسجيل، أنشئ نموذج فاتورة ضريبية كاملة أو مبسطة مع احتساب 5% VAT.",
    badge: "FTA VAT",
    badgeColor: "bg-blue-100 text-blue-800",
    cta: "خطوة ما بعد التسجيل →",
  },
  {
    href: "/vat-calculator/uae",
    icon: "🧮",
    title: "حاسبة ضريبة القيمة المضافة الإمارات 5%",
    desc: "احسب قيمة VAT أو استخرج السعر الأصلي من أي مبلغ إجمالي.",
    badge: "FTA 5%",
    badgeColor: "bg-purple-100 text-purple-800",
  },
  {
    href: "/ar/ae/purchase-order-generator",
    icon: "📦",
    title: "مولد أمر الشراء LPO في الإمارات",
    desc: "أنشئ نموذج LPO لإثبات الإيرادات المتوقعة عند تقديم طلب التسجيل.",
    badge: "LPO",
    badgeColor: "bg-indigo-100 text-indigo-800",
    cta: "ادعم طلب التسجيل بـ LPO →",
  },
  {
    href: "/ar/ae/quotation-generator",
    icon: "📋",
    title: "مولد عرض السعر في الإمارات",
    desc: "أنشئ عرض سعر احترافي — قد يُستخدم كوثيقة داعمة في ملف التسجيل.",
    badge: "Business",
    badgeColor: "bg-amber-100 text-amber-800",
  },
  {
    href: "/ar/ae/corporate-tax-calculator",
    icon: "🏛️",
    title: "حاسبة ضريبة الشركات في الإمارات",
    desc: "قدّر ضريبة الشركات: 0% على أول 375,000 درهم و9% على ما يزيد.",
    badge: "FTA CT",
    badgeColor: "bg-indigo-100 text-indigo-800",
  },
  {
    href: "/ar/ae",
    icon: "🇦🇪",
    title: "مجمع أدوات وحاسبات الإمارات",
    desc: "جميع الأدوات الضريبية والعمالية والمالية المخصصة للسوق الإماراتي.",
    badge: "الشامل",
    badgeColor: "bg-emerald-700 text-white font-black",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UaeVatRegistrationCheckerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <main className="min-h-screen bg-page-bg" dir="rtl">

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-ink-muted" aria-label="breadcrumb">
            <Link href="/" className="hover:text-brand transition-colors">الرئيسية</Link>
            <span aria-hidden="true">›</span>
            <Link href="/ar/ae" className="hover:text-brand transition-colors">🇦🇪 أدوات الإمارات</Link>
            <span aria-hidden="true">›</span>
            <span className="text-ink font-semibold">حاسبة التسجيل في ضريبة القيمة المضافة</span>
          </nav>
        </div>

        {/* ── Page Hero — H1 ──────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-2">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-700 to-blue-800 px-6 py-7 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-4xl shrink-0 mt-0.5">🏢</span>
              <div>
                <h1 className="text-2xl font-black leading-snug sm:text-3xl">
                  حاسبة التسجيل في ضريبة القيمة المضافة في الإمارات
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-indigo-100 max-w-xl">
                  تحقق مما إذا كان نشاطك ملزماً أو مؤهلاً للتسجيل في VAT وفق حدود الهيئة الاتحادية
                  للضرائب — 375,000 درهم للتسجيل الإلزامي و187,500 درهم للاختياري.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  {["375,000 AED إلزامي", "187,500 AED اختياري", "مقيم وغير مقيم", "آخر 12 شهراً", "30 يوماً القادمة"].map((tag) => (
                    <span key={tag} className="rounded-full bg-white/20 px-3 py-1">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── GEO Answer Summary ───────────────────────────────────────────── */}
        <GeoAnswerSummary
          whatItDoes="تحدد مستوى الالتزام بالتسجيل في ضريبة القيمة المضافة (إلزامي أو اختياري أو دون الحد) بناءً على حجم التوريدات والمصروفات"
          appliesTo="دولة الإمارات العربية المتحدة — المنشآت والأفراد الذين يمارسون نشاطاً اقتصادياً"
          keyRule="التسجيل الإلزامي عند تجاوز 375,000 درهم — الاختياري من 187,500 درهم — وفق لوائح FTA المنشورة"
          authority="الهيئة الاتحادية للضرائب (FTA)"
          authorityUrl="https://tax.gov.ae"
          lastReviewed="أكتوبر 2026"
          disclaimer="هذه الأداة تقديرية استرشادية — راجع بوابة EmaraTax أو مستشارك الضريبي للتحقق من الالتزام الرسمي."
        />

        {/* ── PART 1: Tool ──────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 py-4">
          <UaeVatRegistrationChecker />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            PART 2: Editorial Content
        ══════════════════════════════════════════════════════════════════ */}
        <div className="mx-auto max-w-3xl px-4 space-y-6 pb-4">

          {/* ── Section 1: Threshold explanation ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">📏</span>
              ما هو حد التسجيل في ضريبة القيمة المضافة في الإمارات؟
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                تُطبّق دولة الإمارات نظام ضريبة القيمة المضافة (VAT) بنسبة 5% منذ يناير 2018 بموجب
                المرسوم بقانون اتحادي رقم (8) لسنة 2017. وقد حدّدت الهيئة الاتحادية للضرائب (FTA)
                حدّين للتسجيل يعتمد كلاهما على حجم التوريدات الخاضعة للضريبة والواردات خلال فترات محددة.
              </p>
              <p>
                يختلف نظام الإمارات في اختبار التوقعات المستقبلية عن بعض الأنظمة الأخرى: فبينما تستخدم
                بعض الدول نافذة 12 شهراً للتوقعات، تستخدم الإمارات نافذة <strong className="text-ink">30 يوماً فقط</strong> — مما يعني أن التسجيل مطلوب في حال توقع تجاوز الحد خلال الشهر القادم بناءً على أدلة موثقة.
              </p>
            </div>

            {/* Threshold comparison table */}
            <div className="mt-6 overflow-x-auto -mx-1">
              <table className="w-full text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-indigo-50 text-indigo-900">
                    <th className="border border-indigo-200 px-3 py-2.5 text-right font-extrabold w-1/4">الحالة</th>
                    <th className="border border-rose-200 bg-rose-50 px-3 py-2.5 text-center font-extrabold text-rose-900">🚨 إلزامي</th>
                    <th className="border border-amber-200 bg-amber-50 px-3 py-2.5 text-center font-extrabold text-amber-900">⭐ اختياري</th>
                    <th className="border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-center font-extrabold text-emerald-900">✅ دون الحد</th>
                  </tr>
                </thead>
                <tbody className="text-ink-secondary">
                  {[
                    ["الحد",           "> 375,000 درهم",             "> 187,500 درهم",              "< 187,500 درهم"],
                    ["ما يُحسب",       "التوريدات الخاضعة + الواردات", "التوريدات أو الواردات أو المصروفات الخاضعة", "—"],
                    ["الفترة الزمنية", "آخر 12 شهراً أو الـ 30 يوماً القادمة", "آخر 12 شهراً أو الـ 30 يوماً القادمة", "—"],
                    ["النتيجة",        "التسجيل مطلوب قانوناً",      "يحق التقدم للتسجيل",          "لا التزام حالياً"],
                    ["استرداد المدخلات", "نعم — بعد التسجيل",        "نعم — فائدة رئيسية",           "لا"],
                  ].map(([label, mandatory, voluntary, below], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="border border-slate-200 px-3 py-2 font-bold text-ink">{label}</td>
                      <td className="border border-rose-100   px-3 py-2 text-center text-rose-800">{mandatory}</td>
                      <td className="border border-amber-100  px-3 py-2 text-center text-amber-800">{voluntary}</td>
                      <td className="border border-emerald-100 px-3 py-2 text-center text-emerald-800">{below}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-[11px] text-ink-muted">
              المصدر: الهيئة الاتحادية للضرائب (FTA) — المرسوم بقانون اتحادي رقم (8) لسنة 2017 ولائحته التنفيذية.
            </p>
          </section>

          {/* ── Section 2: What counts toward threshold ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">🔢</span>
              ما الذي يدخل في حساب حد التسجيل؟
            </h2>
            <p className="text-sm text-ink-secondary mb-4 leading-relaxed">
              ليس كل دخل أو إيراد يُحتسب نحو حد التسجيل — الفهم الدقيق لما يُدرج وما يُستثنى ضروري
              لتجنب التسجيل المبكر غير اللازم أو التأخر عن التسجيل الواجب.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                <h3 className="text-sm font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <span>✅</span><span>يُدرج في الحساب:</span>
                </h3>
                <ul className="text-xs text-emerald-800 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span><strong>التوريدات بنسبة 5%</strong> — المبيعات والخدمات الخاضعة للمعدل القياسي.</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span><strong>التوريدات بنسبة 0%</strong> — الصادرات، بعض المواد الغذائية، الرعاية الصحية، التعليم، النقل الدولي.</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span><strong>الواردات الخاضعة</strong> — البضائع والخدمات المستوردة الخاضعة للضريبة.</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5 text-amber-700">•</span><span className="text-amber-800"><strong>المصروفات الخاضعة</strong> — لأغراض التسجيل الاختياري (187,500 درهم) فقط.</span></li>
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <h3 className="text-sm font-extrabold text-ink flex items-center gap-1.5">
                  <span>❌</span><span>لا يُدرج في الحساب:</span>
                </h3>
                <ul className="text-xs text-ink-secondary space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span><strong>التوريدات المعفاة</strong> — إيجار العقارات السكنية، بعض الخدمات المالية المحددة.</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span><strong>التوريدات خارج نطاق الضريبة</strong> — التي لا تخضع لمنظومة VAT أصلاً.</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span><strong>الأصول الرأسمالية</strong> المباعة في بعض الحالات — استشر مختصاً للتفاصيل.</span></li>
                </ul>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
              <p className="text-xs text-blue-900 leading-relaxed">
                <strong>فرق جوهري:</strong> التوريدات الصفرية (0%) تُحتسب في الحد وتُتيح استرداد ضريبة المدخلات، بينما
                التوريدات المعفاة لا تُحتسب في الحد ولا تُتيح استرداد ضريبة المدخلات المنسوبة إليها.
                هذا التمييز بالغ الأثر على قرار التسجيل وحساباته.
              </p>
            </div>
          </section>

          {/* ── Section 3: Resident vs Non-resident ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">🌐</span>
              ما الفرق بين المقيم وغير المقيم في التسجيل لـ VAT؟
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
                <h3 className="text-sm font-extrabold text-indigo-900 flex items-center gap-2">
                  <span>🇦🇪</span>المنشأة المقيمة في الإمارات
                </h3>
                <ul className="text-xs text-indigo-800 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>تخضع لاختبار الحد: 375,000 درهم إلزامي / 187,500 درهم اختياري.</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>يُحسب الحد على التوريدات الخاضعة والواردات خلال 12 شهراً أو توقع 30 يوماً.</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>التسجيل عبر بوابة EmaraTax بعد التحقق من استيفاء الحد.</span></li>
                </ul>
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 space-y-3">
                <h3 className="text-sm font-extrabold text-purple-900 flex items-center gap-2">
                  <span>🌍</span>المنشأة غير المقيمة
                </h3>
                <ul className="text-xs text-purple-800 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span><strong>لا ينطبق</strong> حد الـ 375,000 درهم على غير المقيمين.</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>إذا قدّمت توريدات خاضعة داخل الإمارات ولا يوجد طرف آخر مسؤول عن الضريبة، يجب التسجيل فور بدء التوريدات بصرف النظر عن قيمتها.</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>إذا كان المشتري مسجلاً في UAE ويُطبّق آلية الاحتساب العكسي، قد لا يلزم التسجيل المستقل.</span></li>
                </ul>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/60 p-3">
              <p className="text-xs text-rose-900 leading-relaxed">
                <strong>⚠️ تحذير مهم:</strong> قاعدة "لا تسجيل دون 375,000 درهم" تنطبق على المقيمين فقط.
                غير المقيمين الذين يقدّمون خدمات رقمية أو توريدات أخرى مباشرةً داخل الإمارات قد يكونون
                ملزمين بالتسجيل بصرف النظر عن قيمة التوريدات. استشر مختصاً ضريبياً لتحديد وضعك.
              </p>
            </div>
          </section>

          {/* ── Section 4: Worked Examples ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-1 flex items-center gap-2">
              <span className="text-2xl">🔢</span>
              أمثلة عملية
            </h2>
            <p className="text-xs text-ink-muted mb-5">مثال توضيحي — الأرقام افتراضية</p>

            <div className="space-y-4">
              {/* Example A */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">مثال أ — التسجيل الإلزامي (تاريخي)</span>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  مورّد معدات مكتبية في دبي: توريدات خاضعة خلال الأشهر الـ 12 الماضية = 35,000 درهم/شهر.
                </p>
                <div className="rounded-lg bg-white border border-rose-100 p-3 text-xs font-mono space-y-1">
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">35,000 × 12 شهراً</span><span className="font-bold">= 420,000 درهم</span></div>
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">الحد الإلزامي</span><span className="font-bold">375,000 درهم</span></div>
                  <div className="flex justify-between border-t pt-1"><span className="font-sans font-bold text-rose-800">الزيادة عن الحد</span><span className="font-black text-rose-700">+ 45,000 درهم</span></div>
                </div>
                <p className="text-[11px] text-rose-800 bg-rose-50 rounded p-1.5 font-bold">
                  → تجاوزت التوريدات حد 375,000 درهم خلال الـ 12 شهراً الماضية — التسجيل الإلزامي واجب.
                </p>
              </div>

              {/* Example B */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 space-y-2">
                <span className="text-xs font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">مثال ب — التسجيل الاختياري</span>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  مستشار تسويق: مبيعات سنوية 240,000 درهم، مصروفات خاضعة (إيجار مكتب + خدمات) = 50,000 درهم.
                </p>
                <div className="rounded-lg bg-white border border-amber-100 p-3 text-xs font-mono space-y-1">
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">التوريدات</span><span className="font-bold">240,000 درهم</span></div>
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">الحد الإلزامي 375,000</span><span className="font-bold text-ink-muted">لم يُتجاوز</span></div>
                  <div className="flex justify-between border-t pt-1"><span className="font-sans font-bold text-amber-800">الحد الاختياري 187,500</span><span className="font-black text-amber-700">تجاوزت بـ 52,500 ↑</span></div>
                </div>
                <p className="text-[11px] text-amber-800 bg-amber-50 rounded p-1.5 font-bold">
                  → فوق الاختياري لكن دون الإلزامي — يحق التقدم للتسجيل الاختياري للاستفادة من استرداد ضريبة المدخلات.
                </p>
              </div>

              {/* Example C */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-4 space-y-2">
                <span className="text-xs font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">مثال ج — اختبار الـ 30 يوماً القادمة</span>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  شركة مقاولات وقّعت عقداً بقيمة 420,000 درهم يبدأ تنفيذه خلال أسبوعين ويُنجز كاملاً خلال 30 يوماً.
                </p>
                <div className="rounded-lg bg-white border border-rose-100 p-3 text-xs font-mono space-y-1">
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">قيمة العقد الموقع</span><span className="font-bold">420,000 درهم</span></div>
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">نافذة التوقع</span><span className="font-bold">30 يوماً</span></div>
                  <div className="flex justify-between border-t pt-1"><span className="font-sans font-bold text-rose-800">الحد الإلزامي</span><span className="font-black text-rose-700">375,000 — مُتجاوَز</span></div>
                </div>
                <p className="text-[11px] text-rose-800 bg-rose-50 rounded p-1.5 font-bold">
                  → اختبار الـ 30 يوماً يُفعَّل — يجب التسجيل قبل بدء التوريد. الدليل: العقد الموقع أو أمر الشراء (LPO).
                </p>
              </div>
            </div>
          </section>

          {/* ── Section 5: Supporting Documents ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">📁</span>
              ما المستندات التي قد تحتاجها للتسجيل في VAT؟
            </h2>
            <p className="text-sm text-ink-secondary mb-4 leading-relaxed">
              بحسب نوع الطلب وحالة المنشأة، قد تطلب الهيئة الاتحادية للضرائب مستندات داعمة لإثبات
              النشاط التجاري الفعلي أو الإيرادات المتوقعة. المستندات التالية أمثلة شائعة:
            </p>
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              {[
                { icon: "🧾", label: "فواتير المبيعات والمشتريات",              note: "لإثبات النشاط الفعلي" },
                { icon: "📦", label: "أوامر الشراء المحلية (LPO)",               note: "لإثبات التوريدات المتوقعة (30 يوماً)" },
                { icon: "📄", label: "عقود مع العملاء أو الموردين",              note: "لإثبات الإيرادات المتوقعة" },
                { icon: "🏠", label: "عقد إيجار أو ملكية مقر الأعمال",          note: "إثبات الوجود التجاري في الإمارات" },
                { icon: "🏗️", label: "شهادات إتمام المشاريع",                   note: "للمقاولين والشركات الإنشائية" },
                { icon: "🏦", label: "خطاب مصرفي أو كشف حساب",                  note: "في بعض أنواع الطلبات" },
                { icon: "🛃", label: "وثائق جمارك أو استيراد",                  note: "إذا كانت الواردات أساس الطلب" },
                { icon: "📊", label: "توقعات الإيرادات الموثقة",                 note: "عند الاعتماد على اختبار الـ 30 يوماً" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                  <span className="text-base shrink-0">{item.icon}</span>
                  <div>
                    <span className="font-bold text-ink">{item.label}</span>
                    <p className="text-ink-muted mt-0.5">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>ملاحظة:</strong> قائمة المستندات المطلوبة قد تختلف بحسب طبيعة الطلب (تسجيل إلزامي / اختياري / غير مقيم)
                وقد تطلب FTA مستندات إضافية عند المراجعة. تحقق من قائمة FTA الرسمية عبر بوابة EmaraTax قبل تقديم الطلب.
              </p>
            </div>

            {/* Cross-link to PO generator */}
            <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl shrink-0">📦</span>
                <div>
                  <p className="text-xs font-extrabold text-indigo-900">
                    هل تحتاج إلى أمر شراء (LPO) لإثبات إيراداتك المتوقعة؟
                  </p>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    أنشئ نموذج LPO احترافي يُمكن تقديمه كوثيقة داعمة في ملف التسجيل.
                  </p>
                </div>
              </div>
              <Link href="/ar/ae/purchase-order-generator"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 transition-colors">
                <span>📦</span><span>مولد نموذج LPO ←</span>
              </Link>
            </div>
          </section>

          {/* ── Section 6: EmaraTax Registration Process ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">💻</span>
              كيف يتم التسجيل في VAT عبر بوابة EmaraTax؟
            </h2>
            <p className="text-sm text-ink-secondary mb-5 leading-relaxed">
              يتم تقديم طلب التسجيل في ضريبة القيمة المضافة إلكترونياً عبر بوابة EmaraTax الرسمية
              للهيئة الاتحادية للضرائب. فيما يلي الخطوات الرئيسية:
            </p>
            <ol className="space-y-3">
              {[
                { n: "١", title: "إنشاء حساب أو تسجيل الدخول",      desc: "سجّل دخولك إلى بوابة EmaraTax على tax.gov.ae أو أنشئ حساباً جديداً إذا لم يكن لديك واحد." },
                { n: "٢", title: "إنشاء ملف الشخص الخاضع للضريبة",  desc: "أنشئ ملف 'Taxable Person' لنشاطك التجاري وأدخل البيانات الأساسية للمنشأة." },
                { n: "٣", title: "الوصول إلى حساب الشخص الخاضع",    desc: "ادخل إلى حساب الشخص الخاضع للضريبة ضمن لوحة التحكم." },
                { n: "٤", title: "اختيار التسجيل في ضريبة القيمة المضافة", desc: "اختر خدمة 'VAT Registration' من قائمة الخدمات الضريبية المتاحة." },
                { n: "٥", title: "استكمال نموذج الطلب",               desc: "أدخل تفاصيل النشاط، حجم التوريدات، وبيانات المسؤولين وأصحاب الحصص وفق المطلوب." },
                { n: "٦", title: "رفع المستندات الداعمة",              desc: "أرفق الفواتير والعقود وأوامر الشراء وغيرها من الوثائق المطلوبة." },
                { n: "٧", title: "تقديم الطلب ومتابعته",              desc: "قدّم الطلب وراقب حالته عبر البوابة. تتولى FTA مراجعة الطلب وقد تطلب معلومات إضافية." },
              ].map((step) => (
                <li key={step.n} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {step.n}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">{step.title}</p>
                    <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
              <p className="text-xs text-indigo-900 flex-1 leading-relaxed">
                <strong>بعد القبول:</strong> تُصدر FTA شهادة التسجيل في VAT متضمنةً الرقم الضريبي (TRN) المكوّن من 15 رقماً.
                يُمكّنك ذلك من إصدار الفواتير الضريبية، وتحصيل VAT، واسترداد ضريبة المدخلات، وتقديم الإقرارات الدورية.
              </p>
              <a href="https://tax.gov.ae/en/services/vat.registration.aspx" target="_blank" rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 transition-colors">
                <span>🔗</span><span>بوابة FTA للتسجيل ←</span>
              </a>
            </div>
          </section>

          {/* ── Section 7: Sole establishments + deregistration note ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-ink mb-3 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                تنبيهات خاصة — المؤسسات الفردية والإلغاء
              </h2>
            </div>

            {/* Sole establishments */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
              <h3 className="text-sm font-extrabold text-amber-900 flex items-center gap-2">
                <span>🏪</span>أصحاب المؤسسات الفردية المتعددة
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                وفق إرشادات الهيئة الاتحادية للضرائب، لا ينبغي معاملة المؤسسات الفردية المتعددة المملوكة
                للشخص الطبيعي ذاته كمنشآت منفصلة لأغراض التسجيل في ضريبة القيمة المضافة. قد يُحسب
                الحد (375,000 درهم) على إجمالي نشاطات الشخص الطبيعي مجتمعةً، لا على كل مؤسسة منفردةً.
                إذا كنت تمتلك أكثر من مؤسسة فردية، راجع إرشادات FTA أو استشر مختصاً ضريبياً لتحديد وضعك.
              </p>
            </div>

            {/* Deregistration note */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <h3 className="text-sm font-extrabold text-ink flex items-center gap-2">
                <span>🔄</span>إلغاء التسجيل في VAT
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                إلغاء التسجيل في ضريبة القيمة المضافة (VAT Deregistration) إجراء منفصل بشروط وضوابط
                مختلفة عن التسجيل. لمزيد من المعلومات حول شروط الإلغاء، راجع الصفحة الرسمية للهيئة
                الاتحادية للضرائب.
              </p>
            </div>

            {/* Disclaimer */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
              <p className="text-xs text-indigo-900 leading-relaxed">
                <strong>تنبيه:</strong> هذه الأداة لا تتخذ قرار التسجيل نيابةً عن الهيئة الاتحادية للضرائب.
                النتيجة مبنية على البيانات التي تُدخلها وعلى حدود التسجيل المنشورة.
                قد تتطلب الحالات الخاصة — كالمجموعات ذات الأطراف المرتبطة، والمؤسسات الفردية المتعددة،
                وغير المقيمين — مراجعة مستشار ضريبي متخصص أو الرجوع مباشرةً إلى FTA.
              </p>
            </div>
          </section>

          {/* ── Section 8: Official Sources ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              المصادر الرسمية
            </h2>
            <p className="text-sm text-ink-secondary mb-4 leading-relaxed">
              المعلومات الواردة في هذه الصفحة مستندة إلى المصادر الرسمية التالية:
            </p>
            <div className="space-y-2">
              {[
                {
                  title: "FTA — خدمة التسجيل في ضريبة القيمة المضافة (EmaraTax)",
                  url: "https://tax.gov.ae/en/services/vat.registration.aspx",
                  desc: "بوابة التسجيل الرسمية للهيئة الاتحادية للضرائب مع شروط الأهلية والمستندات المطلوبة.",
                },
                {
                  title: "FTA — التسجيل في ضريبة القيمة المضافة",
                  url: "https://tax.gov.ae/en/content/registration.for.vat.aspx",
                  desc: "الدليل الرسمي لمتطلبات التسجيل الإلزامي والاختياري وشروط غير المقيمين.",
                },
                {
                  title: "FTA — الأسئلة الشائعة حول ضريبة القيمة المضافة",
                  url: "https://tax.gov.ae/en/taxes/vat/vat.faqs.aspx",
                  desc: "إجابات الهيئة الرسمية على الأسئلة المتعلقة بالتسجيل والحدود والتوريدات.",
                },
                {
                  title: "FTA — الدليل الإرشادي لضريبة القيمة المضافة في الإمارات",
                  url: "https://tax.gov.ae/en/taxes/vat/guides.aspx",
                  desc: "الأحكام الشاملة لـ VAT بما فيها أحكام التسجيل والإلغاء والحسابات.",
                },
                {
                  title: "المرسوم بقانون اتحادي رقم (8) لسنة 2017 ولائحته التنفيذية",
                  url: "https://tax.gov.ae/en/legislation/vat/legislation.aspx",
                  desc: "النص القانوني الأساسي لضريبة القيمة المضافة في دولة الإمارات.",
                },
              ].map((src, i) => (
                <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors group">
                  <span className="text-lg shrink-0 mt-0.5">🔗</span>
                  <div>
                    <p className="text-xs font-bold text-indigo-700 group-hover:underline">{src.title}</p>
                    <p className="text-[11px] text-ink-muted mt-0.5">{src.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>

        </div>{/* end editorial content */}

        {/* ── PART 3: FAQ ──────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-2">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-5">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">❓ الأسئلة الشائعة</h2>
              <p className="text-xs text-ink-muted mt-1">أكثر الأسئلة تكراراً حول التسجيل في ضريبة القيمة المضافة الإماراتية</p>
            </div>
            <div className="space-y-0">
              {faqs.map((item, i) => (
                <details key={i}
                  className="group border-b border-brand-border last:border-b-0 py-4 cursor-pointer"
                  open={i === 0}>
                  <summary className="flex items-center justify-between gap-3 font-bold text-ink text-sm list-none select-none">
                    <span>{item.q}</span>
                    <span className="text-brand font-black text-lg transition-transform group-open:rotate-45 shrink-0">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-ink-secondary leading-relaxed pr-4">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── PART 4: Related Tools ────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-6 pb-12">
          <RelatedBusinessTools
            title="🔗 أدوات ضريبية وتجارية ذات صلة — الإمارات"
            subtitle="بعد التسجيل: أنشئ الفواتير، احسب VAT، واستخدم أوامر الشراء كوثائق داعمة"
            tools={relatedTools}
          />
        </section>

      </main>
    </>
  );
}
