import UaeCorporateTaxCalculator from "@/components/UaeCorporateTaxCalculator";
import Link from "next/link";
import GeoAnswerSummary from "@/components/GeoAnswerSummary";
import { SITE_URL, SITE_ORG_ID } from "@/lib/siteConfig";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: "حاسبة ضريبة الشركات الإمارات 2026 | Corporate Tax Calculator UAE",
  description:
    "احسب ضريبة الشركات التقديرية في الإمارات وفق معدل 0% حتى 375,000 درهم و9% على الدخل الخاضع للضريبة فوق هذا الحد، مع شرح Small Business Relief وتحديث 2029.",
  keywords: [
    "حاسبة ضريبة الشركات الإمارات",
    "ضريبة الشركات 9% الإمارات",
    "حد ضريبة الشركات 375000",
    "Small Business Relief UAE",
    "ضريبة الشركات للشركات الصغيرة الإمارات",
    "UAE Corporate Tax Calculator",
    "Corporate Tax UAE 2026",
    "FTA Corporate Tax",
    "حساب ضريبة الشركات في الإمارات",
  ],
  alternates: { canonical: "/ar/ae/corporate-tax-calculator" },
  openGraph: {
    title: "حاسبة ضريبة الشركات الإمارات 2026 | Corporate Tax Calculator UAE",
    description:
      "احسب ضريبة الشركات 0% و9% مع تسهيلات الأعمال الصغيرة (ممتدة حتى 2029) وقواعد المناطق الحرة وفق FTA.",
    url: `${SITE_URL}/ar/ae/corporate-tax-calculator`,
    type: "website",
    locale: "ar_AE",
  },
};

// ─── Structured Data ──────────────────────────────────────────────────────────

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية",           item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "🇦🇪 أدوات الإمارات", item: `${SITE_URL}/ar/ae` },
    { "@type": "ListItem", position: 3, name: "حاسبة ضريبة الشركات في الإمارات", item: `${SITE_URL}/ar/ae/corporate-tax-calculator` },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "حاسبة ضريبة الشركات في الإمارات 2026 — UAE Corporate Tax Calculator",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
  publisher: { "@id": SITE_ORG_ID },
  description:
    "أداة مجانية لتقدير ضريبة الشركات الإماراتية: 0% على أول 375,000 درهم من الدخل الخاضع للضريبة، و9% على ما يزيد، مع فحص تسهيلات الأعمال الصغيرة وقواعد المناطق الحرة.",
  inLanguage: "ar",
  url: `${SITE_URL}/ar/ae/corporate-tax-calculator`,
};

// 10 FAQs — visible accordion + FAQPage schema
const faqs = [
  {
    q: "ما هي نسبة ضريبة الشركات في الإمارات؟",
    a: "تُطبَّق ضريبة الشركات في الإمارات بنسبتين: 0% على الدخل الخاضع للضريبة حتى 375,000 درهم، و9% على الجزء الذي يتجاوز هذا المبلغ. سرت هذه النسب على الفترات الضريبية التي تبدأ في أو بعد 1 يونيو 2023 بموجب المرسوم بقانون اتحادي رقم (47) لسنة 2022.",
  },
  {
    q: "هل أول 375,000 درهم معفاة تماماً؟",
    a: "نعم، أول 375,000 درهم من الدخل الخاضع للضريبة يُعامَل بنسبة 0% — أي لا تُستحق ضريبة عليه. فقط الجزء الذي يتجاوز 375,000 درهم يخضع لنسبة 9%. هذا يختلف عن نظام يُعفي أول 375,000 درهم ويُطبّق 9% على كامل الدخل.",
  },
  {
    q: "هل 375,000 درهم تعني الإيرادات أم الأرباح (الدخل الخاضع)؟",
    a: "375,000 درهم تعني الدخل الخاضع للضريبة (Taxable Income) — وليس الإيرادات. الدخل الخاضع للضريبة هو الدخل بعد خصم المصروفات المعتمدة ضريبياً والتعديلات المقررة. شركة إيراداتها 5 ملايين درهم لكن دخلها الخاضع 300,000 درهم — ضريبتها صفر. هذا التمييز بالغ الأهمية.",
  },
  {
    q: "ما هي تسهيلات الأعمال الصغيرة (Small Business Relief) في الإمارات؟",
    a: "تسهيلات الأعمال الصغيرة تتيح للأشخاص المقيمين المؤهلين الذين لا تتجاوز إيراداتهم 3,000,000 درهم اختيار معاملة ضريبية مبسّطة. هي اختيار (election) وليست إعفاءً تلقائياً. الأشخاص المؤهلون في المناطق الحرة (QFZP) وأعضاء مجموعات متعددة الجنسيات كبيرة مستثنون.",
  },
  {
    q: "هل تم تمديد تسهيلات الأعمال الصغيرة بعد 2026؟",
    a: "نعم. بموجب القرار الوزاري رقم (131) لسنة 2026 الصادر من وزارة المالية الإماراتية، تم تمديد تسهيلات الأعمال الصغيرة لتشمل الفترات الضريبية التي تنتهي في أو قبل 31 ديسمبر 2029 — بدلاً من 31 ديسمبر 2026 السابقة. الحد الإيرادي يبقى 3,000,000 درهم.",
  },
  {
    q: "هل شركة المنطقة الحرة تدفع 0% ضريبة دائماً؟",
    a: "ليس بالضرورة. الشخص المؤهل في المنطقة الحرة (QFZP) يستفيد من 0% على دخله المؤهل فقط، بشرط استيفاء متطلبات الجوهر الاقتصادي وأنواع الأنشطة وحدود de minimis. الدخل غير المؤهل يخضع لنسبة 9% كاملة دون تطبيق نطاق الـ 375,000 درهم. تحقق وضع QFZP يتطلب تقييماً تفصيلياً.",
  },
  {
    q: "متى يجب تقديم إقرار ضريبة الشركات؟",
    a: "عموماً، يجب تقديم الإقرار الضريبي وسداد الضريبة المستحقة خلال 9 أشهر من نهاية الفترة الضريبية. مثال: إذا انتهت الفترة الضريبية في 31 ديسمبر 2025، يكون الموعد النهائي للتقديم في 30 سبتمبر 2026. تحقق من التواريخ الدقيقة عبر بوابة EmaraTax.",
  },
  {
    q: "هل أحتاج إلى التسجيل لضريبة الشركات حتى لو كانت الضريبة صفر؟",
    a: "نعم. التسجيل في ضريبة الشركات التزام قانوني على معظم الأشخاص الخاضعين بصرف النظر عن مستوى الدخل أو مقدار الضريبة. حتى الشركات التي تندرج ضمن نطاق الإعفاء (0%) تُلزَم بالتسجيل وتقديم إقرار ضريبي. تحقق من متطلبات التسجيل المحددة عبر بوابة EmaraTax.",
  },
  {
    q: "هل هذه الحاسبة معتمدة من الهيئة الاتحادية للضرائب FTA؟",
    a: "لا. هذه أداة مساعدة تُجري تقديراً استرشادياً بناءً على المعدلات والأحكام المنشورة من FTA. هي غير مرتبطة بالهيئة الاتحادية للضرائب ولا تُصدر إقرارات ضريبية أو قرارات رسمية. للالتزام الضريبي الرسمي راجع EmaraTax أو مستشارك الضريبي.",
  },
  {
    q: "هل نتيجة الحاسبة هي المبلغ النهائي المستحق؟",
    a: "لا. النتيجة تقديرية وتعتمد على البيانات التي تُدخلها. الضريبة الفعلية المستحقة تتأثر بعوامل عديدة منها: التعديلات الضريبية الدقيقة، خسائر الضريبة المرحّلة، الدخل المعفى، قيود الفائدة، أسعار التحويل، وقواعد التجميع. قد تختلف النتيجة النهائية بحسب هذه التعديلات.",
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
    href: "/ar/ae/small-business-relief-checker",
    icon: "🏷️",
    title: "حاسبة أهلية تسهيلات الأعمال الصغيرة",
    desc: "فحص مفصّل لأهليتك للتسهيلات: حد الـ 3 مليون درهم وشروط التمديد حتى 2029.",
    badge: "SBR 2029",
    badgeColor: "bg-emerald-100 text-emerald-800",
    cta: "تحقق من أهليتك للتسهيل →",
  },
  {
    href: "/ar/ae/vat-registration-checker",
    icon: "🏢",
    title: "حاسبة أهلية التسجيل في ضريبة القيمة المضافة",
    desc: "هل تحتاج لمعرفة وضع التسجيل في ضريبة القيمة المضافة؟ حد 375,000 درهم.",
    badge: "FTA VAT",
    badgeColor: "bg-purple-100 text-purple-800",
  },
  {
    href: "/ar/ae/vat-invoice-generator",
    icon: "🧾",
    title: "مولد الفاتورة الضريبية في الإمارات",
    desc: "أنشئ فاتورة ضريبية كاملة أو مبسطة مع احتساب 5% VAT وفق FTA.",
    badge: "FTA VAT",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  {
    href: "/ar/ae/purchase-order-generator",
    icon: "📦",
    title: "مولد أمر الشراء LPO في الإمارات",
    desc: "أنشئ نموذج LPO احترافي لتوثيق المشتريات والمصروفات.",
    badge: "LPO",
    badgeColor: "bg-indigo-100 text-indigo-800",
  },
  {
    href: "/ar/ae/quotation-generator",
    icon: "📋",
    title: "مولد عرض السعر في الإمارات",
    desc: "أنشئ عروض أسعار احترافية لتوثيق الإيرادات المتوقعة.",
    badge: "Business",
    badgeColor: "bg-amber-100 text-amber-800",
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

export default function UaeCorporateTaxPage() {
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
            <span className="text-ink font-semibold">حاسبة ضريبة الشركات</span>
          </nav>
        </div>

        {/* ── Page Hero — H1 ──────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-2">
          <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-indigo-800 px-6 py-7 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-4xl shrink-0 mt-0.5">🏛️</span>
              <div>
                <h1 className="text-2xl font-black leading-snug sm:text-3xl">
                  حاسبة ضريبة الشركات في الإمارات 2026
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-200 max-w-xl">
                  قدّر ضريبة الشركات التقديرية وفق معدلَي 0% و9% — مع فحص تسهيلات الأعمال الصغيرة
                  (ممتدة حتى 2029) وقواعد المناطق الحرة (QFZP) والشخص الطبيعي.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  {["0% حتى 375,000 AED", "9% على الزيادة", "SBR ≤ 3M AED", "QFZP", "شخص طبيعي"].map((tag) => (
                    <span key={tag} className="rounded-full bg-white/20 px-3 py-1">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── GEO Answer Summary ───────────────────────────────────────────── */}
        <GeoAnswerSummary
          whatItDoes="تقدير ضريبة الشركات الإماراتية المستحقة مع فحص أهلية تسهيلات الأعمال الصغيرة وقواعد المناطق الحرة والشخص الطبيعي"
          appliesTo="دولة الإمارات العربية المتحدة — الشركات والأشخاص الطبيعيون الخاضعون لضريبة الشركات"
          keyRule="0% على الدخل الخاضع حتى 375,000 درهم — 9% على ما يزيد — SBR لإيرادات ≤ 3,000,000 درهم (ممتدة حتى 31 ديسمبر 2029)"
          authority="الهيئة الاتحادية للضرائب (FTA) + وزارة المالية الإماراتية"
          authorityUrl="https://tax.gov.ae"
          lastReviewed="أكتوبر 2026"
          disclaimer="هذه الأداة تقديرية استرشادية — راجع بوابة EmaraTax أو مستشارك الضريبي للالتزام الرسمي."
        />

        {/* ── PART 1: Tool ──────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 py-4">
          <UaeCorporateTaxCalculator />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            PART 2: Editorial Content
        ══════════════════════════════════════════════════════════════════ */}
        <div className="mx-auto max-w-3xl px-4 space-y-6 pb-4">

          {/* ── Section 1: How CT is calculated ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">📐</span>
              كيف تُحسب ضريبة الشركات في الإمارات؟
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                تُطبّق ضريبة الشركات الإماراتية نظام الشرائح الضريبية على{" "}
                <strong className="text-ink">الدخل الخاضع للضريبة</strong>، لا على الإيرادات الإجمالية:
              </p>
            </div>

            {/* Rate bands */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-emerald-700">0%</span>
                  <span className="text-xs font-bold text-emerald-800">على أول 375,000 درهم</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  أول 375,000 درهم من الدخل الخاضع للضريبة لا تُستحق عليها أي ضريبة.
                </p>
              </div>
              <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-rose-700">9%</span>
                  <span className="text-xs font-bold text-rose-800">على الزيادة فوق 375,000 درهم</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  9% تُطبَّق فقط على الجزء الذي يتجاوز 375,000 درهم — لا على كامل الدخل.
                </p>
              </div>
            </div>

            {/* Worked calculation */}
            <div className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
              <p className="text-xs font-extrabold text-indigo-900 mb-3">مثال توضيحي: دخل خاضع للضريبة = 1,000,000 درهم</p>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between"><span className="font-sans text-ink-secondary">أول 375,000 درهم × 0%</span><span className="font-bold text-emerald-700">= 0 درهم</span></div>
                <div className="flex justify-between"><span className="font-sans text-ink-secondary">(1,000,000 − 375,000) = 625,000 درهم × 9%</span><span className="font-bold text-rose-700">= 56,250 درهم</span></div>
                <div className="flex justify-between border-t border-indigo-200 pt-1.5 mt-1.5"><span className="font-sans font-bold text-ink">ضريبة الشركات التقديرية الإجمالية</span><span className="font-black text-indigo-800">= 56,250 درهم</span></div>
                <div className="flex justify-between"><span className="font-sans text-ink-muted">المعدل الفعلي</span><span className="text-ink-secondary">5.625% (أقل من 9% لأن نطاق 0% يُخفّض المعدل الكلي)</span></div>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-ink-muted">
              المصدر: المرسوم بقانون اتحادي رقم (47) لسنة 2022 — الهيئة الاتحادية للضرائب (FTA).
            </p>
          </section>

          {/* ── Section 2: Revenue ≠ Taxable Income — PROMINENT ── */}
          <section className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-amber-950 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              الإيرادات ≠ الدخل الخاضع للضريبة — فرق جوهري
            </h2>
            <p className="text-sm text-amber-900 mb-5 leading-relaxed">
              هذا الخلط من أكثر الأخطاء شيوعاً. لكل مصطلح حد مختلف وغرض مختلف:
            </p>

            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs border-collapse min-w-[420px]">
                <thead>
                  <tr className="bg-amber-100 text-amber-950">
                    <th className="border border-amber-300 px-3 py-2.5 text-right font-extrabold">المصطلح</th>
                    <th className="border border-amber-300 px-3 py-2.5 text-center font-extrabold">ما يعنيه</th>
                    <th className="border border-amber-300 px-3 py-2.5 text-center font-extrabold">الحد المرتبط به</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-amber-200 px-3 py-2 font-bold text-ink">الإيرادات (Revenue)</td>
                    <td className="border border-amber-200 px-3 py-2 text-center text-ink-secondary">إجمالي المبيعات والدخل قبل أي خصومات</td>
                    <td className="border border-amber-200 px-3 py-2 text-center font-bold text-emerald-700">3,000,000 درهم — حد تسهيلات الأعمال الصغيرة (SBR)</td>
                  </tr>
                  <tr className="bg-amber-50/50">
                    <td className="border border-amber-200 px-3 py-2 font-bold text-ink">الدخل الخاضع للضريبة (Taxable Income)</td>
                    <td className="border border-amber-200 px-3 py-2 text-center text-ink-secondary">الدخل بعد خصم المصروفات المعتمدة والتعديلات الضريبية</td>
                    <td className="border border-amber-200 px-3 py-2 text-center font-bold text-rose-700">375,000 درهم — حد معدل 0% في ضريبة الشركات</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl border border-amber-300 bg-white p-3">
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>مثال:</strong> شركة إيراداتها <strong>5,000,000 درهم</strong> لكن بعد خصم تكاليف التشغيل والمصروفات المعتمدة ضريبياً يصبح دخلها الخاضع
                للضريبة <strong>300,000 درهم</strong> — ضريبتها صفر (0%) لأنها دون حد 375,000 درهم،
                وهي في الوقت ذاته لا تؤهلها إيراداتها الـ 5M لتسهيلات الأعمال الصغيرة المحدودة بـ 3M.
              </p>
            </div>
          </section>

          {/* ── Section 3: Small Business Relief — Updated 2029 ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
              <h2 className="text-xl font-extrabold text-ink flex items-center gap-2">
                <span className="text-2xl">🏷️</span>
                تسهيلات الأعمال الصغيرة (Small Business Relief) — تحديث 2026
              </h2>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 shrink-0">
                ✓ ممتدة حتى 31 ديسمبر 2029
              </span>
            </div>

            {/* Update box */}
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 mb-5">
              <p className="text-xs text-emerald-900 leading-relaxed">
                <strong>تحديث أكتوبر 2026:</strong> بموجب القرار الوزاري رقم (131) لسنة 2026 الصادر من وزارة المالية الإماراتية،
                تم تمديد تسهيلات الأعمال الصغيرة لتشمل الفترات الضريبية التي تنتهي في أو قبل{" "}
                <strong>31 ديسمبر 2029</strong> — بدلاً من 31 ديسمبر 2026 السابقة. الحد الإيرادي يبقى 3,000,000 درهم.
              </p>
            </div>

            {/* Comparison table */}
            <div className="overflow-x-auto -mx-1 mb-5">
              <table className="w-full text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-100 text-ink">
                    <th className="border border-slate-200 px-3 py-2.5 text-right font-extrabold w-1/4">المعيار</th>
                    <th className="border border-slate-200 px-3 py-2.5 text-center font-extrabold">⚖️ القواعد العامة لضريبة الشركات</th>
                    <th className="border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-center font-extrabold text-emerald-900">🏷️ مع تسهيلات الأعمال الصغيرة</th>
                  </tr>
                </thead>
                <tbody className="text-ink-secondary">
                  {[
                    ["الأساس",              "الدخل الخاضع للضريبة بعد التعديلات الكاملة", "معالجة ضريبية مبسّطة مع إعفاء من بعض التعديلات"],
                    ["الحد",                "لا حد إيرادي — يسري على الجميع",            "إيرادات ≤ 3,000,000 درهم"],
                    ["من يؤهَّل؟",          "الجميع الخاضعون لضريبة الشركات",             "أشخاص مقيمون — يستثنى QFZP والمجموعات الكبيرة"],
                    ["الدخل الخاضع",        "0% أول 375k — 9% ما يزيد",                  "معالجة مبسّطة — راجع FTA للتفاصيل"],
                    ["تقديم الإقرار",        "إقرار ضريبي كامل",                           "إقرار ضريبي مبسّط (مطلوب — ليس إعفاءً من الإقرار)"],
                    ["فترة السريان",         "دائمة",                                       "فترات تنتهي في أو قبل 31 ديسمبر 2029"],
                  ].map(([label, general, sbr], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="border border-slate-200 px-3 py-2 font-bold text-ink">{label}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center">{general}</td>
                      <td className="border border-emerald-100 px-3 py-2 text-center text-emerald-800">{sbr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>تنبيه:</strong> تسهيلات الأعمال الصغيرة اختيار (election) تقدمه لدى FTA — وليست إعفاءً تلقائياً.
                المؤهلون لا يزالون ملزمين بتقديم إقرار ضريبي مبسّط. استشر مستشارك الضريبي لتحديد أهليتك قبل الاختيار.
              </p>
            </div>

            <div className="mt-4">
              <Link href="/ar/ae/small-business-relief-checker"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 transition-colors">
                <span>🏷️</span><span>فحص أهليتك لتسهيلات الأعمال الصغيرة ←</span>
              </Link>
            </div>
          </section>

          {/* ── Section 4: What is taxable income ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              ما هو الدخل الخاضع للضريبة؟
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                الدخل الخاضع للضريبة (Taxable Income) هو الدخل المحاسبي للمنشأة بعد إجراء التعديلات
                المقررة بموجب قانون ضريبة الشركات. هو عادةً يختلف عن صافي الربح المحاسبي.
              </p>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 text-xs">
              {[
                { icon: "➕", label: "الدخل المحاسبي (نقطة البداية)",         color: "emerald", note: "صافي الربح وفق البيانات المالية المُعدَّة بمعايير مقبولة" },
                { icon: "➖", label: "الدخل المعفى",                          color: "blue",    note: "كأرباح المشاركة وبعض الدخل من المجموعات" },
                { icon: "➕", label: "المصروفات غير القابلة للخصم",          color: "rose",    note: "كالغرامات وبعض التبرعات وفائدة القروض بحدود معينة" },
                { icon: "✎",  label: "التعديلات الضريبية الأخرى",             color: "amber",   note: "قيود الفائدة، خسائر الضريبة، أسعار التحويل..." },
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-2 rounded-lg border p-2.5 ${
                  item.color === "emerald" ? "border-emerald-200 bg-emerald-50/40" :
                  item.color === "blue"    ? "border-blue-200    bg-blue-50/40"    :
                  item.color === "rose"    ? "border-rose-200    bg-rose-50/40"    :
                  "border-amber-200 bg-amber-50/40"
                }`}>
                  <span className="text-base shrink-0">{item.icon}</span>
                  <div>
                    <span className="font-bold text-ink text-xs">{item.label}</span>
                    <p className="text-ink-muted mt-0.5 text-[11px] leading-relaxed">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/40 p-3">
              <p className="text-xs text-indigo-900 leading-relaxed">
                <strong>هذه الحاسبة تُجري تقديراً بسيطاً.</strong> الحساب الدقيق للدخل الخاضع للضريبة يتطلب تطبيق جميع
                التعديلات القانونية ذات الصلة وقد يكون معقداً. للتقدير الأدق راجع{" "}
                <a href="https://tax.gov.ae/en/taxes/corporate.tax.aspx" target="_blank" rel="noopener noreferrer"
                  className="text-indigo-700 hover:underline font-bold">دليل الدخل الخاضع للضريبة من FTA ←</a>
              </p>
            </div>
          </section>

          {/* ── Section 5: Free Zone treatment ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">🏙️</span>
              معاملة شركات المناطق الحرة (QFZP)
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                لا تُعامَل جميع شركات المناطق الحرة معاملةً موحدة في ضريبة الشركات.
                الشخص المؤهل في المنطقة الحرة (Qualifying Free Zone Person — QFZP) يخضع لنظام
                خاص يختلف جوهرياً عن النظام المعياري:
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2">
                <h3 className="text-sm font-extrabold text-emerald-900">الدخل المؤهل (Qualifying Income)</h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  يخضع لنسبة <strong>0%</strong> — من الأنشطة المؤهلة المحددة (معاملات بين المناطق الحرة، بعض الأنشطة الدولية، إدارة الممتلكات الفكرية المؤهلة...).
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 space-y-2">
                <h3 className="text-sm font-extrabold text-rose-900">الدخل غير المؤهل</h3>
                <p className="text-xs text-rose-800 leading-relaxed">
                  يخضع لنسبة <strong>9% كاملة</strong> — بدون تطبيق نطاق الإعفاء 375,000 درهم على هذا الجزء.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>⚠️ تحذير:</strong> الحصول على وضع QFZP ليس تلقائياً. يستلزم استيفاء شروط متعددة
                تشمل: الجوهر الاقتصادي الكافي (Adequate Substance)، نوع الأنشطة المؤهلة، حدود الدخل
                غير المؤهل (de minimis)، التوافق مع قواعد أسعار التحويل، والامتثال لمتطلبات التقارير.
                لا تفترض وضع QFZP دون تقييم متخصص. هذه الحاسبة لا تُحقق من استيفاء شروط QFZP.
              </p>
              <p className="mt-2 text-[11px] text-amber-800">
                للتفاصيل الكاملة: راجع دليل الأشخاص المؤهلين في المناطق الحرة الصادر من الهيئة الاتحادية للضرائب.
              </p>
            </div>
          </section>

          {/* ── Section 6: Who is this calculator for ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              لمن تُفيد هذه الحاسبة؟
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2">
                <h3 className="text-sm font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <span>✅</span>الحالات المناسبة للحاسبة
                </h3>
                <ul className="text-xs text-emerald-800 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>شركات البر الرئيسي الإماراتية (شركات ذ.م.م وغيرها)</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>الأشخاص الاعتباريون الخاضعون للمعدلات المعيارية</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>تقدير سريع قبل مراجعة المستشار الضريبي</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>التخطيط الضريبي الأولي وسيناريوهات الميزانية</span></li>
                </ul>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-2">
                <h3 className="text-sm font-extrabold text-amber-900 flex items-center gap-1.5">
                  <span>⚠️</span>الحالات التي تحتاج خبرة متخصصة
                </h3>
                <ul className="text-xs text-amber-800 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>الأشخاص المؤهلون في المناطق الحرة (QFZP) — الشروط معقدة</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>مجموعات الضريبة الموحدة (Tax Groups)</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>الأشخاص المعفيون (هيئات حكومية، صناديق معيّنة)</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>المنشآت ذات المنشآت الدائمة الأجنبية المعقدة</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>الحالات التي تنطوي على أسعار التحويل أو خسائر ضريبية كبيرة</span></li>
                </ul>
              </div>
            </div>
          </section>

          {/* ── Section 7: Filing deadline ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">📅</span>
              متى يجب تقديم إقرار ضريبة الشركات؟
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                عموماً، يجب تقديم الإقرار الضريبي لضريبة الشركات وسداد الضريبة المستحقة خلال{" "}
                <strong className="text-ink">9 أشهر</strong> من تاريخ انتهاء الفترة الضريبية.
              </p>
            </div>
            <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-2">
              <p className="text-xs font-extrabold text-indigo-900">مثال توضيحي:</p>
              <div className="text-xs text-indigo-800 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">الفترة الضريبية تنتهي:</span>
                  <span>31 ديسمبر 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">الموعد النهائي للإقرار والسداد:</span>
                  <span>30 سبتمبر 2026</span>
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>تنبيه:</strong> قد تختلف المواعيد الدقيقة بحسب تاريخ بدء الفترة الضريبية لمنشأتك.
                تحقق من المواعيد النهائية المحددة لحالتك عبر بوابة EmaraTax أو مستشارك الضريبي.
                التأخر في التقديم يعرّض المنشأة لغرامات مقررة من FTA.
              </p>
            </div>
          </section>

          {/* ── Section 8: Worked examples ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-1 flex items-center gap-2">
              <span className="text-2xl">🔢</span>
              أمثلة عملية
            </h2>
            <p className="text-xs text-ink-muted mb-5">مثال توضيحي — الأرقام افتراضية</p>

            <div className="space-y-4">
              {/* Example A */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">مثال أ — ضمن نطاق 0%</span>
                </div>
                <p className="text-xs text-ink-secondary">شركة استشارات: دخل خاضع للضريبة = 300,000 درهم.</p>
                <div className="rounded-lg bg-white border border-emerald-100 p-3 text-xs font-mono space-y-1">
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">300,000 × 0%</span><span className="font-bold text-emerald-700">= 0 درهم</span></div>
                  <div className="flex justify-between border-t pt-1"><span className="font-sans font-bold text-ink">ضريبة الشركات التقديرية</span><span className="font-black text-emerald-700">0 درهم</span></div>
                </div>
                <p className="text-[11px] text-emerald-800 bg-emerald-50 rounded p-1.5 font-bold">
                  → الدخل الخاضع أقل من 375,000 درهم — نسبة 0% تُطبَّق على كامل الدخل.
                </p>
              </div>

              {/* Example B */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-4 space-y-2">
                <span className="text-xs font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">مثال ب — فوق 375,000 درهم</span>
                <p className="text-xs text-ink-secondary">مورّد تجاري: دخل خاضع للضريبة = 1,000,000 درهم.</p>
                <div className="rounded-lg bg-white border border-rose-100 p-3 text-xs font-mono space-y-1">
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">375,000 × 0%</span><span className="font-bold text-emerald-700">= 0 درهم</span></div>
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">625,000 × 9%</span><span className="font-bold text-rose-700">= 56,250 درهم</span></div>
                  <div className="flex justify-between border-t pt-1"><span className="font-sans font-bold text-ink">ضريبة الشركات التقديرية</span><span className="font-black text-rose-700">56,250 درهم</span></div>
                  <div className="flex justify-between"><span className="font-sans text-ink-muted">المعدل الفعلي</span><span className="text-ink-secondary">5.625%</span></div>
                </div>
              </div>

              {/* Example C */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 space-y-2">
                <span className="text-xs font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">مثال ج — شركة صغيرة وتسهيلات الأعمال الصغيرة</span>
                <p className="text-xs text-ink-secondary">
                  شركة مقيمة في البر الرئيسي: إيرادات 2,400,000 درهم (أقل من 3M) — دخل خاضع 500,000 درهم.
                </p>
                <div className="rounded-lg bg-white border border-amber-100 p-3 text-xs space-y-2">
                  <div className="space-y-1 font-mono">
                    <div className="flex justify-between"><span className="font-sans text-ink-secondary">بالقواعد العامة: (500,000 − 375,000) × 9%</span><span className="font-bold text-rose-700">= 11,250 درهم</span></div>
                  </div>
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-xs text-amber-800 leading-relaxed">
                    <strong>تسهيلات الأعمال الصغيرة:</strong> إذا كانت الإيرادات في الفترة الحالية وكل فترة سابقة
                    ذات صلة ≤ 3,000,000 درهم، وكانت الشركة تستوفي بقية الشروط، <em>قد تكون مؤهلة</em> لاختيار
                    التسهيلات. النتيجة الضريبية في هذه الحالة تختلف — راجع FTA للتأكيد.
                  </div>
                </div>
                <p className="text-[11px] text-amber-800 bg-amber-50 rounded p-1.5 font-bold">
                  → استخدم حاسبة تسهيلات الأعمال الصغيرة لفحص الأهلية بدقة.
                </p>
              </div>
            </div>
          </section>

          {/* ── Section 9: Official Sources ── */}
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
                  title: "FTA — ضريبة الشركات في الإمارات (الصفحة الرئيسية)",
                  url: "https://tax.gov.ae/en/taxes/corporate.tax.aspx",
                  desc: "المعدلات والإطار القانوني وإرشادات الامتثال الرئيسية.",
                },
                {
                  title: "FTA — الأسئلة الشائعة حول ضريبة الشركات",
                  url: "https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.faq.aspx",
                  desc: "إجابات الهيئة الرسمية على أسئلة ضريبة الشركات.",
                },
                {
                  title: "FTA — موضوعات ضريبة الشركات (دليل الدخل الخاضع، SBR، QFZP)",
                  url: "https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.topics.aspx",
                  desc: "أدلة إرشادية تفصيلية حول حساب الدخل الخاضع وتسهيلات الأعمال الصغيرة والمناطق الحرة.",
                },
                {
                  title: "وزارة المالية — القرار الوزاري رقم (131) لسنة 2026 (تمديد SBR حتى 2029)",
                  url: "https://mof.gov.ae/en/news/ministry-of-finance-extends-small-business-relief-for-corporate-tax/",
                  desc: "الإعلان الرسمي عن تمديد تسهيلات الأعمال الصغيرة من 31 ديسمبر 2026 إلى 31 ديسمبر 2029.",
                },
                {
                  title: "المرسوم بقانون اتحادي رقم (47) لسنة 2022 — قانون ضريبة الشركات",
                  url: "https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.legislation.aspx",
                  desc: "النص القانوني الأساسي لضريبة الشركات في دولة الإمارات.",
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
              <p className="text-xs text-ink-muted mt-1">أكثر الأسئلة تكراراً حول ضريبة الشركات الإماراتية</p>
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
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <div className="border-b border-brand-border pb-4 mb-5">
              <h2 className="text-lg font-extrabold text-ink">🔗 أدوات ضريبية وتجارية ذات صلة — الإمارات</h2>
              <p className="text-xs text-ink-muted mt-1">منظومة متكاملة من الأدوات لإدارة الالتزامات الضريبية والتجارية</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedTools.map((tool) => (
                <Link key={tool.href} href={tool.href}
                  className="group flex items-start gap-3 rounded-xl border border-brand-border bg-white p-4 hover:border-brand hover:shadow-md transition-all">
                  <span className="text-2xl shrink-0 mt-0.5">{tool.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-bold text-ink group-hover:text-brand transition-colors">{tool.title}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tool.badgeColor}`}>{tool.badge}</span>
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed">{tool.desc}</p>
                    {tool.cta && <p className="text-xs font-bold text-indigo-600 mt-1">{tool.cta}</p>}
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
