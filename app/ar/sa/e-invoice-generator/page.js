import EInvoiceGenerator from "@/components/EInvoiceGenerator";
import Link from "next/link";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: "مولد الفاتورة الإلكترونية السعودية 2026 | فاتورة ضريبية وVAT | أدوات عربية",
  description:
    "أنشئ نموذج فاتورة إلكترونية سعودية قابل للطباعة: فاتورة ضريبية B2B وفاتورة ضريبية مبسطة B2C مع احتساب ضريبة القيمة المضافة 15% وفق متطلبات منظومة ZATCA فاتورة 2026.",
  keywords: [
    "فاتورة إلكترونية سعودية",
    "مولد الفاتورة الإلكترونية",
    "فاتورة ضريبية",
    "فاتورة ضريبية مبسطة",
    "ZATCA فاتورة",
    "ضريبة القيمة المضافة 15%",
    "Saudi e-invoice generator",
    "VAT invoice Saudi Arabia",
    "منظومة فاتورة الإلكترونية",
    "هيئة الزكاة والضريبة والجمارك",
    "فاتورة ضريبية B2B",
    "فاتورة ضريبية مبسطة B2C",
    "نموذج فاتورة قابل للطباعة",
  ],
  alternates: {
    canonical: "https://arabic-tools-xi.vercel.app/ar/sa/e-invoice-generator",
  },
  openGraph: {
    title: "مولد الفاتورة الإلكترونية السعودية 2026 | فاتورة ضريبية وVAT",
    description:
      "أنشئ نموذج فاتورة إلكترونية سعودية قابل للطباعة: فاتورة ضريبية B2B وفاتورة مبسطة B2C مع احتساب VAT 15% وفق منظومة ZATCA فاتورة.",
    url: "https://arabic-tools-xi.vercel.app/ar/sa/e-invoice-generator",
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
      name: "ما هي الفاتورة الإلكترونية في السعودية ومتى أصبحت إلزامية؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "الفاتورة الإلكترونية في المملكة العربية السعودية هي فاتورة تُنشأ وتُخزن وتُرسل بصيغة رقمية منظمة وفق اشتراطات هيئة الزكاة والضريبة والجمارك (ZATCA). أصبحت الفاتورة الإلكترونية إلزامية للمرحلة الأولى (مرحلة التوليد) في ديسمبر 2021 لجميع الأشخاص الخاضعين لضريبة القيمة المضافة في المملكة. تشمل الفاتورة الضريبية للمعاملات بين الأعمال (B2B) والفاتورة الضريبية المبسطة للمستهلكين (B2C).",
      },
    },
    {
      "@type": "Question",
      name: "ما الفرق بين الفاتورة الضريبية والفاتورة الضريبية المبسطة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "الفاتورة الضريبية (B2B) تُستخدم في المعاملات بين الشركات المسجلة في ضريبة القيمة المضافة، وتشترط في الغالب ذكر الرقم الضريبي للمشتري. أما الفاتورة الضريبية المبسطة (B2C) فتُستخدم مع المستهلكين النهائيين غير المسجلين في الضريبة، وتشترط إضافة رمز الاستجابة السريعة (QR Code) وفق متطلبات المرحلة الأولى من منظومة فاتورة.",
      },
    },
    {
      "@type": "Question",
      name: "ما هي البيانات الإلزامية في الفاتورة الإلكترونية السعودية؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وفق متطلبات ZATCA الأساسية، يجب أن تتضمن الفاتورة: اسم المورد والرقم الضريبي للمورد، اسم المشتري والرقم الضريبي للمشتري (في الفاتورة الضريبية)، رقم الفاتورة وتاريخ الإصدار، وصف السلع أو الخدمات، الكمية والسعر، نسبة الضريبة وقيمتها، والمجموع الكلي شامل الضريبة. تشمل الفاتورة المبسطة إضافةً رمز QR.",
      },
    },
    {
      "@type": "Question",
      name: "ما هي المرحلة الأولى والمرحلة الثانية من الفوترة الإلكترونية في السعودية؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "المرحلة الأولى (مرحلة التوليد) بدأت في ديسمبر 2021 وتشترط توليد الفواتير إلكترونياً وتخزينها وإضافة رمز QR للفواتير المبسطة. المرحلة الثانية (مرحلة التكامل) بدأت تدريجياً على شكل موجات من يناير 2023 وتستهدف دافعي الضرائب بالتسلسل وتشترط الربط المباشر مع منصة ZATCA فاتورة (Fatoora) مسبقاً قبل إصدار كل فاتورة.",
      },
    },
    {
      "@type": "Question",
      name: "هل هذا المولد يُنتج فواتير معتمدة رسمياً من ZATCA؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا. هذا المولد ينتج نماذج فواتير إلكترونية قابلة للطباعة لأغراض التخطيط والمراجعة والتوثيق الداخلي. الفاتورة الإلكترونية المعتمدة رسمياً تتطلب الربط بمنظومة ZATCA فاتورة (Fatoora) عبر API معتمد. يُنصح بالرجوع إلى هيئة الزكاة والضريبة والجمارك والاستعانة بحلول فوترة إلكترونية معتمدة لضمان الامتثال الكامل.",
      },
    },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "مولد الفاتورة الإلكترونية السعودية",
  operatingSystem: "All",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "SAR",
  },
  description:
    "أداة لإنشاء نماذج فواتير إلكترونية سعودية قابلة للطباعة: فاتورة ضريبية B2B وفاتورة مبسطة B2C مع حساب ضريبة القيمة المضافة 15% وفحص اكتمال الحقول المطلوبة.",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: "https://arabic-tools-xi.vercel.app" },
    { "@type": "ListItem", position: 2, name: "🇸🇦 أدوات السعودية", item: "https://arabic-tools-xi.vercel.app/ar/sa" },
    {
      "@type": "ListItem",
      position: 3,
      name: "مولد الفاتورة الإلكترونية السعودية",
      item: "https://arabic-tools-xi.vercel.app/ar/sa/e-invoice-generator",
    },
  ],
};

export default function EInvoiceGeneratorPage() {
  return (
    <>
      {/* Structured Data JSON-LD */}
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

      <main className="min-h-screen bg-page-bg print:bg-white print:p-0 print:m-0" dir="rtl">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-1 no-print print:hidden">
          <nav className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Link href="/" className="hover:text-brand transition-colors">الرئيسية</Link>
            <span>›</span>
            <Link href="/ar/sa" className="hover:text-brand transition-colors">🇸🇦 أدوات السعودية</Link>
            <span>›</span>
            <span className="text-ink font-semibold">مولد الفاتورة الإلكترونية</span>
          </nav>
        </div>

        {/* ── PART 1: Interactive Tool (Above the Fold) ────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 py-4 print:p-0 print:m-0 print:max-w-none">
          <EInvoiceGenerator />
        </div>

        {/* ── PART 2: Comprehensive Explanation (300–500 Words) ────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-8 no-print print:hidden">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">
                📖 ما هي الفاتورة الإلكترونية في السعودية وما أهميتها؟
              </h2>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                <strong className="text-ink">الفاتورة الإلكترونية (E-Invoice)</strong> في المملكة العربية السعودية هي وثيقة مالية رقمية منظمة تُنشأ وتُخزن وتُشارك وفق اشتراطات{" "}
                <strong>هيئة الزكاة والضريبة والجمارك (ZATCA)</strong> ومنظومة <strong>فاتورة</strong>. ألزمت الهيئة جميع الأشخاص الخاضعين لضريبة القيمة المضافة في المملكة بالتحول للفوترة الإلكترونية على مرحلتين.
              </p>
              <p>
                تُستخدم هذه الأداة لإنشاء <strong>نموذج فاتورة إلكترونية قابل للطباعة</strong> يساعد في تنظيم بيانات الفاتورة ومراجعتها وتدريب الفريق المالي، إلا أن الامتثال الرسمي يستلزم استخدام حلول فوترة إلكترونية معتمدة ومرتبطة بمنصة ZATCA فاتورة.
              </p>
            </div>

            {/* Phase 1 & 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <h3 className="text-sm font-extrabold text-emerald-900 flex items-center gap-2 mb-2">
                  <span>🟢</span> المرحلة الأولى: التوليد
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  بدأت في <strong>4 ديسمبر 2021</strong>. تشترط توليد الفواتير إلكترونياً وتخزينها بصيغ منظمة (XML أو PDF/A-3) وإضافة رمز QR للفواتير المبسطة. تسري على جميع المنشآت الخاضعة لضريبة القيمة المضافة.
                </p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                <h3 className="text-sm font-extrabold text-blue-900 flex items-center gap-2 mb-2">
                  <span>🔵</span> المرحلة الثانية: التكامل
                </h3>
                <p className="text-xs text-blue-800 leading-relaxed">
                  بدأت تدريجياً من <strong>يناير 2023</strong> على شكل موجات حسب حجم الإيرادات. تستهدف المنشآت المحددة بالتسلسل وتشترط الربط المباشر مع منصة ZATCA (Fatoora) مسبقاً لكل فاتورة. لا تسري بالضرورة على كل دافع ضريبة بعد في هذا الوقت.
                </p>
              </div>
            </div>

            {/* Invoice types */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
              <h3 className="text-sm font-extrabold text-ink">الفرق بين الفاتورة الضريبية والفاتورة الضريبية المبسطة</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      {["البيان", "الفاتورة الضريبية (B2B)", "الفاتورة المبسطة (B2C)"].map(h => (
                        <th key={h} className="px-3 py-2 text-right font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      ["المستخدم", "بين منشآت مسجلة في الضريبة", "مع المستهلك النهائي"],
                      ["الرقم الضريبي للمشتري", "مطلوب عند تسجيل المشتري", "غير مطلوب"],
                      ["رمز QR", "اختياري في المرحلة الأولى", "إلزامي في المرحلة الأولى"],
                      ["ربط Fatoora (م. 2)", "مطلوب للمستهدفين", "مطلوب للمستهدفين"],
                    ].map(([label, b2b, b2c]) => (
                      <tr key={label} className="bg-white">
                        <td className="px-3 py-2 font-medium text-ink">{label}</td>
                        <td className="px-3 py-2 text-ink-secondary">{b2b}</td>
                        <td className="px-3 py-2 text-ink-secondary">{b2c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step by step */}
            <div>
              <h3 className="text-sm font-extrabold text-ink mb-3">🎯 كيفية استخدام مولد الفاتورة — خطوة بخطوة</h3>
              <ol className="space-y-2 text-sm text-ink-secondary list-decimal list-inside">
                <li><strong className="text-ink">اختر نوع الفاتورة:</strong> فاتورة ضريبية B2B أو فاتورة مبسطة B2C.</li>
                <li><strong className="text-ink">أدخل بيانات البائع:</strong> الاسم القانوني للمنشأة، الرقم الضريبي (15 رقماً يبدأ بـ 3)، العنوان.</li>
                <li><strong className="text-ink">أدخل بيانات المشتري:</strong> الاسم، والرقم الضريبي إن كان B2B وكان المشتري مسجلاً.</li>
                <li><strong className="text-ink">تفاصيل الفاتورة:</strong> رقم الفاتورة وتاريخ الإصدار.</li>
                <li><strong className="text-ink">أضف بنود الفاتورة:</strong> الاسم، الكمية، السعر، نسبة الضريبة (15%، 0%، معفاة، خارج النطاق)، والخصم.</li>
                <li><strong className="text-ink">راجع الإجماليات</strong> ثم اضغط «معاينة الفاتورة» أو «طباعة».</li>
              </ol>
            </div>

            {/* Practical example */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5">
              <h3 className="text-sm font-extrabold text-indigo-900 mb-3">📊 مثال عملي بالأرقام</h3>
              <p className="text-xs text-indigo-800 mb-3">
                منشأة تبيع خدمات استشارية بقيمة 10,000 ريال مع خصم 500 ريال وضريبة 15%:
              </p>
              <div className="space-y-1.5 text-xs font-mono text-indigo-900">
                {[
                  ["سعر الخدمة", "10,000.00 ريال"],
                  ["الخصم", "- 500.00 ريال"],
                  ["الوعاء الخاضع للضريبة", "9,500.00 ريال"],
                  ["ضريبة القيمة المضافة 15%", "+ 1,425.00 ريال"],
                  ["الإجمالي شامل الضريبة", "10,925.00 ريال"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between border-b border-indigo-100 pb-1">
                    <span>{l}</span>
                    <span className="font-bold">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Official sources */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-extrabold text-ink mb-2">📚 المصادر الرسمية</h3>
              <p className="text-xs text-ink-muted mb-2">
                المصدر: هيئة الزكاة والضريبة والجمارك (ZATCA) — لا نعبّر عن أي انتماء رسمي لهذه الجهة.
              </p>
              <div className="space-y-1">
                {[
                  {
                    label: "الفاتورة الإلكترونية — الصفحة الرئيسية",
                    url: "https://zatca.gov.sa/en/E-Invoicing/Pages/default.aspx",
                  },
                  {
                    label: "التحضير للمرحلة الأولى",
                    url: "https://zatca.gov.sa/en/E-Invoicing/PreparingYourBusiness/Phase1/Pages/How-to-prepare.aspx",
                  },
                  {
                    label: "المواصفات الفنية للفاتورة الإلكترونية",
                    url: "https://zatca.gov.sa/en/E-Invoicing/SystemsDevelopers/Pages/E-Invoice-specifications.aspx",
                  },
                ].map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-brand hover:underline"
                  >
                    <span>↗</span>
                    <span>{s.label}</span>
                  </a>
                ))}
              </div>
              <p className="text-xs text-ink-muted mt-3">آخر مراجعة للمحتوى: سبتمبر 2026</p>
            </div>
          </div>
        </section>

        {/* ── PART 3: FAQ ──────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-4 no-print print:hidden">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <div className="border-b border-brand-border pb-4 mb-6">
              <h2 className="text-xl font-extrabold text-ink">❓ الأسئلة الشائعة</h2>
            </div>
            <div className="space-y-5">
              {[
                {
                  q: "ما هي الفاتورة الإلكترونية في السعودية ومتى أصبحت إلزامية؟",
                  a: "الفاتورة الإلكترونية هي فاتورة تُنشأ وتُخزن وتُرسل بصيغة رقمية منظمة وفق اشتراطات ZATCA. أصبحت إلزامية للمرحلة الأولى في ديسمبر 2021 لجميع الخاضعين لضريبة القيمة المضافة في المملكة.",
                },
                {
                  q: "ما الفرق بين الفاتورة الضريبية والفاتورة الضريبية المبسطة؟",
                  a: "الفاتورة الضريبية تُستخدم في المعاملات بين الأعمال المسجلة (B2B) وتشترط الرقم الضريبي للمشتري عند انطباقه. الفاتورة المبسطة تُستخدم مع المستهلك النهائي (B2C) وتشترط رمز QR في المرحلة الأولى.",
                },
                {
                  q: "ما هي البيانات الإلزامية التي يجب أن تتضمنها الفاتورة الإلكترونية؟",
                  a: "اسم البائع والرقم الضريبي، اسم المشتري والرقم الضريبي (B2B)، رقم الفاتورة وتاريخها، وصف السلعة أو الخدمة، الكمية والسعر، نسبة الضريبة وقيمتها، والمجموع الكلي شامل الضريبة.",
                },
                {
                  q: "هل كل منشأة في السعودية ملزمة بالمرحلة الثانية (التكامل مع ZATCA)؟",
                  a: "لا. المرحلة الثانية تُطبَّق تدريجياً على موجات تستهدف دافعي الضرائب بحسب حجم الإيرادات. يُنصح بمتابعة إشعارات ZATCA لمعرفة موعد تضمين منشأتك في موجات التكامل.",
                },
                {
                  q: "هل هذا المولد يُنتج فواتير معتمدة رسمياً من ZATCA؟",
                  a: "لا. هذا المولد ينتج نماذج فواتير إرشادية قابلة للطباعة للمراجعة والتخطيط الداخلي. الفاتورة المعتمدة رسمياً تتطلب الربط المباشر بمنصة ZATCA فاتورة (Fatoora) عبر حلول فوترة إلكترونية معتمدة.",
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
        <section className="mx-auto max-w-3xl px-4 py-4 pb-12 no-print print:hidden">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <div className="border-b border-brand-border pb-4 mb-5">
              <h2 className="text-lg font-extrabold text-ink">🔗 أدوات ذات صلة</h2>
              <p className="text-xs text-ink-muted mt-1">أدوات ضريبية ومالية سعودية مكملة لهذه الأداة</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  href: "/ar/sa/vat-registration-checker",
                  icon: "🏢",
                  title: "حاسبة أهلية التسجيل في ضريبة القيمة المضافة",
                  desc: "هل أصبحت مؤهلاً أو ملزماً بالتسجيل في ضريبة القيمة المضافة؟ تحقق من حدود التوريدات 375,000 ريال.",
                  badge: "ZATCA",
                  badgeColor: "bg-purple-100 text-purple-700",
                },
                {
                  href: "/vat-calculator/saudi",
                  icon: "🧾",
                  title: "حاسبة ضريبة القيمة المضافة 15%",
                  desc: "احسب ضريبة القيمة المضافة 15% على فواتيرك بسرعة أو استخرج السعر الأصلي قبل الضريبة.",
                  badge: "VAT 15%",
                  badgeColor: "bg-blue-100 text-blue-700",
                },
                {
                  href: "/ar/sa/final-settlement-calculator",
                  icon: "📋",
                  title: "حاسبة المخالصة النهائية الشاملة",
                  desc: "تصفية كاملة لمستحقات العامل: نهاية الخدمة، آخر راتب، رصيد الإجازات، وبدل الإشعار.",
                  badge: "نظام العمل",
                  badgeColor: "bg-emerald-100 text-emerald-700",
                },
                {
                  href: "/profit-margin-calculator",
                  icon: "📈",
                  title: "حاسبة هامش الربح والتسعير",
                  desc: "احسب هامش الربح الإجمالي والصافي ومعدل الزيادة على التكلفة لمنتجاتك قبل الفوترة.",
                  badge: "أعمال",
                  badgeColor: "bg-amber-100 text-amber-700",
                },
                {
                  href: "/ar/sa",
                  icon: "🇸🇦",
                  title: "مجمع أدوات وحاسبات السعودية",
                  desc: "دليل الحاسبات العمالية والضريبية والمالية المخصصة للمملكة في مكان واحد.",
                  badge: "المجمع الشامل",
                  badgeColor: "bg-emerald-600 text-white font-black",
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
          </div>
        </section>
      </main>
    </>
  );
}
