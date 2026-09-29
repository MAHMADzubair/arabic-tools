import UaeSbrChecker from "@/components/UaeSbrChecker";
import Link from "next/link";

export const metadata = {
  title: "حاسبة تسهيلات الأعمال الصغيرة الإمارات 2026 | حد 3 ملايين درهم",
  description:
    "تحقق من الأهلية التقديرية لتسهيلات الأعمال الصغيرة في ضريبة الشركات الإماراتية: حد 3,000,000 درهم، الإيرادات السابقة، QFZP، المجموعات متعددة الجنسيات، وانتهاء المدة في 31 ديسمبر 2026 وفق FTA.",
  keywords: [
    "تسهيلات الأعمال الصغيرة الإمارات",
    "Small Business Relief UAE",
    "حد 3 ملايين درهم ضريبة الشركات",
    "أهلية تسهيلات الأعمال الصغيرة",
    "ضريبة الشركات الإمارات",
    "FTA Small Business Relief",
    "QFZP ضريبة الشركات",
    "حاسبة ضريبة الشركات الإمارات 2026",
  ],
  alternates: { canonical: "https://arabic-tools-xi.vercel.app/ar/ae/small-business-relief-checker" },
  openGraph: {
    title: "حاسبة تسهيلات الأعمال الصغيرة الإمارات 2026 | حد 3 ملايين درهم",
    description: "تحقق من أهليتك التقديرية لتسهيلات الأعمال الصغيرة في ضريبة الشركات الإماراتية وفق FTA.",
    url: "https://arabic-tools-xi.vercel.app/ar/ae/small-business-relief-checker",
    type: "website",
    locale: "ar_AE",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ما هي تسهيلات الأعمال الصغيرة في ضريبة الشركات الإماراتية؟",
      acceptedAnswer: { "@type": "Answer", text: "تسهيلات الأعمال الصغيرة هي آلية اختيارية في إطار ضريبة الشركات الإماراتية تتيح للأشخاص المقيمين المؤهلين اختيار معاملة ضريبية مبسّطة. الشخص المؤهل الذي يختار التسهيل قد يُعامَل كأن ليس لديه دخل خاضع للضريبة للفترة المؤهلة. هي اختيار وليست إعفاءً تلقائياً." },
    },
    {
      "@type": "Question",
      name: "ما هو حد 3 ملايين درهم في تسهيلات الأعمال الصغيرة؟",
      acceptedAnswer: { "@type": "Answer", text: "يجب ألا تتجاوز إيرادات الشخص 3,000,000 درهم في الفترة الضريبية الحالية ولا في أي فترة ضريبية سابقة ذات صلة. إذا تجاوزت الإيرادات هذا الحد في أي فترة فلا يحق الاستفادة من التسهيل." },
    },
    {
      "@type": "Question",
      name: "هل يجب ألا تتجاوز الإيرادات الحد في السنوات السابقة أيضاً؟",
      acceptedAnswer: { "@type": "Answer", text: "نعم. شرط الإيرادات يسري على الفترة الحالية وعلى كل فترة ضريبية سابقة ذات صلة. إذا تجاوزت الإيرادات 3,000,000 درهم في أي فترة سابقة فلا يُسمح باختيار التسهيل في الفترة الحالية." },
    },
    {
      "@type": "Question",
      name: "من لا يحق له اختيار تسهيلات الأعمال الصغيرة؟",
      acceptedAnswer: { "@type": "Answer", text: "لا يحق اختيار التسهيل لـ: (1) الأشخاص غير المقيمين، (2) الأشخاص المؤهلين القائمين في المناطق الحرة (QFZP)، (3) الأعضاء في مجموعات متعددة الجنسيات تتجاوز إيراداتها العالمية الموحدة 3.15 مليار درهم، (4) من تتجاوز إيراداتهم حد 3 ملايين درهم." },
    },
    {
      "@type": "Question",
      name: "هل شركات المناطق الحرة مؤهلة لتسهيلات الأعمال الصغيرة؟",
      acceptedAnswer: { "@type": "Answer", text: "الأشخاص المؤهلون القائمون في المناطق الحرة (QFZP) غير مؤهلين لاختيار تسهيلات الأعمال الصغيرة. أما منشآت المناطق الحرة التي لا تستوفي شروط QFZP فتخضع للقواعد المعيارية وقد تكون مؤهلة." },
    },
    {
      "@type": "Question",
      name: "إلى متى تستمر تسهيلات الأعمال الصغيرة؟",
      acceptedAnswer: { "@type": "Answer", text: "وفق التوجيهات الحالية لـ FTA، تسري تسهيلات الأعمال الصغيرة على الفترات الضريبية التي تنتهي في أو قبل 31 ديسمبر 2026. الفترات الضريبية التي تنتهي بعد هذا التاريخ لا تقع ضمن النطاق الزمني الحالي للتسهيل." },
    },
    {
      "@type": "Question",
      name: "هل التسهيل إعفاء ضريبي تلقائي؟",
      acceptedAnswer: { "@type": "Answer", text: "لا. تسهيلات الأعمال الصغيرة ليست إعفاءً تلقائياً. الشخص المؤهل يجب أن يختار التسهيل بشكل صريح عند تقديم الإقرار الضريبي لدى الهيئة الاتحادية للضرائب. كما أن التزامات التسجيل والإيداع قد تبقى سارية." },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: "https://arabic-tools-xi.vercel.app" },
    { "@type": "ListItem", position: 2, name: "🇦🇪 أدوات الإمارات", item: "https://arabic-tools-xi.vercel.app/ar/ae" },
    { "@type": "ListItem", position: 3, name: "حاسبة تسهيلات الأعمال الصغيرة", item: "https://arabic-tools-xi.vercel.app/ar/ae/small-business-relief-checker" },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "حاسبة أهلية تسهيلات الأعمال الصغيرة في الإمارات 2026",
  operatingSystem: "All",
  applicationCategory: "BusinessApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
  description: "أداة تقديرية للتحقق من أهلية تسهيلات الأعمال الصغيرة في ضريبة الشركات الإماراتية وفق FTA — حد 3,000,000 درهم.",
};

export default function UaeSbrPage() {
  return (
    <>
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
            <span className="text-ink font-semibold">تسهيلات الأعمال الصغيرة</span>
          </nav>
        </div>

        {/* Calculator */}
        <div className="mx-auto max-w-3xl px-4 py-4">
          <UaeSbrChecker />
        </div>

        {/* SEO Content */}
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">📖 ما هي تسهيلات الأعمال الصغيرة في الإمارات؟</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>تسهيلات الأعمال الصغيرة (Small Business Relief) آلية اختيارية أُدرجت ضمن نظام <strong className="text-ink">ضريبة الشركات الإماراتية</strong> بموجب القرار الوزاري رقم (73) لسنة 2023. تتيح للأشخاص المقيمين المؤهلين اختيار معاملة ضريبية مبسّطة، إذ قد يُعامَل الشخص المؤهل الذي يختار التسهيل كأنه لم يحقق دخلاً خاضعاً للضريبة للفترة المؤهلة وفق شروط التسهيل المقررة.</p>
              <p><strong className="text-ink">مهم:</strong> هذا تسهيل اختياري وليس إعفاءً تلقائياً. يجب تقديم الاختيار عند تقديم الإقرار الضريبي، والتزامات التسجيل قد تبقى سارية.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                <h3 className="text-sm font-extrabold text-emerald-950">💰 ما هو حد 3 ملايين درهم؟</h3>
                <p className="text-xs text-emerald-900 leading-relaxed">يجب ألا تتجاوز الإيرادات <strong>3,000,000 درهم</strong> في الفترة الضريبية الحالية ولا في أي فترة سابقة ذات صلة. الإيرادات هنا إجمالي الدخل قبل خصم المصروفات.</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 space-y-2">
                <h3 className="text-sm font-extrabold text-rose-950">📅 إلى متى يستمر التسهيل؟</h3>
                <p className="text-xs text-rose-900 leading-relaxed">وفق التوجيهات الحالية لـ FTA، التسهيل يسري على الفترات التي <strong>تنتهي في أو قبل 31 ديسمبر 2026</strong>. الفترات اللاحقة خارج النطاق الحالي.</p>
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 space-y-2">
                <h3 className="text-sm font-extrabold text-purple-950">🏙️ شركات المناطق الحرة</h3>
                <p className="text-xs text-purple-900 leading-relaxed">الأشخاص المؤهلون في المناطق الحرة (<strong>QFZP</strong>) غير مؤهلين لهذا التسهيل. منشآت المناطق الحرة غير المصنفة كـ QFZP قد تكون مؤهلة.</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
                <h3 className="text-sm font-extrabold text-amber-950">🌐 المجموعات متعددة الجنسيات</h3>
                <p className="text-xs text-amber-900 leading-relaxed">الأعضاء في مجموعات متعددة الجنسيات بإيرادات عالمية موحدة <strong>تتجاوز 3.15 مليار درهم</strong> غير مؤهلين للتسهيل.</p>
              </div>
            </div>
            <p className="text-[11px] text-ink-muted border-t border-brand-border pt-3">آخر تحديث: سبتمبر 2026م — المصدر: الهيئة الاتحادية للضرائب، دولة الإمارات العربية المتحدة.</p>
          </div>
        </section>

        {/* Worked Examples */}
        <section className="mx-auto max-w-3xl px-4 py-2">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-5">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">🔢 أمثلة عملية</h2>
            </div>
            <div className="space-y-4">
              {[
                { title: "مثال 1 — شركة مقيمة، إيرادات 2.2 مليون", scenario: "إيرادات الفترة الحالية: 2,200,000 د.إ | أعلى إيرادات سابقة: 2,600,000 د.إ | ليس QFZP | ليس MNE | فترة تنتهي ديسمبر 2024", result: "قد تكون مؤهلاً لتسهيلات الأعمال الصغيرة", color: "text-emerald-700", note: "كل الشروط مستوفاة — التسهيل اختياري يُقدَّم مع الإقرار." },
                { title: "مثال 2 — إيرادات حالية 3.4 مليون", scenario: "إيرادات الفترة الحالية: 3,400,000 د.إ", result: "غير مؤهل — الإيرادات تتجاوز حد 3,000,000 درهم", color: "text-rose-700", note: "تجاوز إيرادات الفترة الحالية سبب مباشر لعدم الأهلية." },
                { title: "مثال 3 — فترة سابقة 3.2 مليون", scenario: "إيرادات حالية: 2,500,000 د.إ | فترة سابقة: 3,200,000 د.إ", result: "غير مؤهل — فترة سابقة تجاوزت الحد", color: "text-rose-700", note: "شرط الإيرادات يسري على كل الفترات السابقة أيضاً." },
                { title: "مثال 4 — منشأة QFZP", scenario: "منشأة في منطقة حرة مصنفة كـ QFZP", result: "غير مؤهل — QFZP مستبعد من التسهيل", color: "text-rose-700", note: "الأشخاص المؤهلون في المناطق الحرة لا يحق لهم اختيار التسهيل." },
                { title: "مثال 5 — فترة تنتهي مارس 2027", scenario: "فترة ضريبية تنتهي: 31 مارس 2027 | إيرادات: 1,500,000 د.إ", result: "الفترة الضريبية خارج النطاق الزمني الحالي للتسهيل", color: "text-slate-700", note: "التسهيل يسري على الفترات المنتهية في أو قبل 31 ديسمبر 2026 فقط." },
              ].map((ex, i) => (
                <div key={i} className="rounded-xl border border-brand-border/80 p-4 space-y-1">
                  <h3 className="text-xs font-extrabold text-ink">{ex.title}</h3>
                  <p className="text-xs text-ink-secondary">{ex.scenario}</p>
                  <p className={`text-xs font-black ${ex.color}`}>النتيجة: {ex.result}</p>
                  <p className="text-[11px] text-ink-muted">{ex.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
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

        {/* Related Tools */}
        <section className="mx-auto max-w-3xl px-4 py-4 pb-12">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <div className="border-b border-brand-border pb-4 mb-5">
              <h2 className="text-lg font-extrabold text-ink">🔗 أدوات وحاسبات ذات صلة</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { href: "/ar/ae/corporate-tax-calculator", icon: "🏛️", title: "حاسبة ضريبة الشركات في الإمارات", desc: "احسب ضريبة الشركات التقديرية 0% و9% مع QFZP والشخص الطبيعي.", badge: "FTA CT", badgeColor: "bg-indigo-100 text-indigo-800" },
                { href: "/ar/ae/vat-registration-checker", icon: "🏢", title: "حاسبة أهلية التسجيل في ضريبة القيمة المضافة", desc: "هل تحتاج للتسجيل في ضريبة القيمة المضافة؟ حد 375,000 درهم.", badge: "FTA VAT", badgeColor: "bg-purple-100 text-purple-800" },
                { href: "/vat-calculator/uae", icon: "🧾", title: "حاسبة ضريبة القيمة المضافة 5%", desc: "احسب ضريبة الـ 5% أو استخرج السعر الأصلي من أي فاتورة.", badge: "5% VAT", badgeColor: "bg-blue-100 text-blue-800" },
                { href: "/ar/ae", icon: "🇦🇪", title: "مجمع أدوات وحاسبات الإمارات", desc: "الدليل الشامل لكافة الحاسبات المخصصة لدولة الإمارات.", badge: "الشامل", badgeColor: "bg-emerald-700 text-white font-black" },
              ].map((tool) => (
                <Link key={tool.href} href={tool.href}
                  className="group flex items-start gap-3 rounded-xl border border-brand-border bg-white p-4 hover:border-brand hover:shadow-md transition-all">
                  <span className="text-2xl shrink-0 mt-0.5">{tool.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-bold text-ink group-hover:text-brand transition-colors">{tool.title}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tool.badgeColor}`}>{tool.badge}</span>
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
