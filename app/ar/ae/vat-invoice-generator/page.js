import UaeVatInvoiceGenerator from "@/components/UaeVatInvoiceGenerator";
import Link from "next/link";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata = {
  title: "مولد الفاتورة الضريبية الإمارات 2026 | فاتورة VAT قابلة للطباعة",
  description:
    "أنشئ فاتورة ضريبية إماراتية قابلة للطباعة، احسب 5% VAT، واستخدم فحصاً مبدئياً لاكتمال حقول الفاتورة الكاملة أو المبسطة.",
  keywords: [
    "فاتورة ضريبية الإمارات",
    "مولد فاتورة VAT الإمارات",
    "فاتورة ضريبية كاملة",
    "فاتورة ضريبية مبسطة",
    "FTA tax invoice UAE",
    "UAE VAT invoice generator",
    "حساب ضريبة القيمة المضافة الإمارات",
    "نموذج فاتورة ضريبية",
    "رقم ضريبي TRN الإمارات",
    "فاتورة 5% الإمارات",
  ],
  alternates: {
    canonical: "https://arabic-tools-xi.vercel.app/ar/ae/vat-invoice-generator",
  },
  openGraph: {
    title: "مولد الفاتورة الضريبية الإمارات 2026 | فاتورة VAT قابلة للطباعة",
    description:
      "أنشئ فاتورة ضريبية إماراتية قابلة للطباعة، احسب 5% VAT، وافحص اكتمال الحقول المطلوبة للفاتورة الكاملة أو المبسطة.",
    url: "https://arabic-tools-xi.vercel.app/ar/ae/vat-invoice-generator",
    type: "website",
    locale: "ar_AE",
  },
};

// ─── Structured Data ──────────────────────────────────────────────────────────

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية",          item: "https://arabic-tools-xi.vercel.app" },
    { "@type": "ListItem", position: 2, name: "🇦🇪 أدوات الإمارات", item: "https://arabic-tools-xi.vercel.app/ar/ae" },
    { "@type": "ListItem", position: 3, name: "مولد الفاتورة الضريبية", item: "https://arabic-tools-xi.vercel.app/ar/ae/vat-invoice-generator" },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "مولد الفاتورة الضريبية في الإمارات",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
  description:
    "أداة مجانية لإنشاء نموذج فاتورة ضريبية إماراتية قابل للطباعة مع حساب 5% VAT وفحص اكتمال الحقول وفق متطلبات هيئة الضرائب الاتحادية FTA.",
  inLanguage: "ar",
  url: "https://arabic-tools-xi.vercel.app/ar/ae/vat-invoice-generator",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ما هي الفاتورة الضريبية في الإمارات؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "الفاتورة الضريبية هي وثيقة رسمية تُصدرها منشأة مسجلة في ضريبة القيمة المضافة لإثبات توريد سلع أو خدمات خاضعة للضريبة. تُعدّ الفاتورة الضريبية حقاً للمستلم المسجل في استرداد ضريبة المدخلات (Input Tax) وفق أحكام المرسوم بقانون اتحادي رقم 8 لسنة 2017 ولائحته التنفيذية.",
      },
    },
    {
      "@type": "Question",
      name: "ما الفرق بين الفاتورة الضريبية الكاملة والمبسطة في الإمارات؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "الفاتورة الكاملة تتضمن تفاصيل كاملة عن المورد والعميل والبنود، وتُستخدم في المعاملات بين الشركات B2B أو عند تجاوز قيمة المعاملة 10,000 درهم. الفاتورة المبسطة تُستخدم عادةً للمستهلك النهائي أو في معاملات لا تتجاوز 10,000 درهم لعميل مسجل، وتتضمن عدداً أقل من البيانات الإلزامية. راجع اللائحة التنفيذية لضريبة القيمة المضافة المادة 59 للتفاصيل.",
      },
    },
    {
      "@type": "Question",
      name: "ما الفرق بين معدل 0% والمعفى من ضريبة القيمة المضافة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "معدل الصفر (0%) يعني أن التوريد خاضع للضريبة بمعدل صفر، ويحق للمورد استرداد ضريبة المدخلات المرتبطة به. أما الإعفاء، فيعني أن التوريد لا يخضع للضريبة ولا يحق للمورد استرداد ضريبة المدخلات المنسوبة إليه. التمييز بينهما مهم جداً للإقرارات الضريبية وحساب ضريبة المدخلات القابلة للاسترداد.",
      },
    },
    {
      "@type": "Question",
      name: "هل ملف PDF يُعدّ فاتورة إلكترونية في الإمارات؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا. الفاتورة الإلكترونية e-Invoice في الإمارات هي بيانات منظمة (Structured Data) يتم تبادلها إلكترونياً والإبلاغ عنها عبر المنظومة الرسمية المعتمدة من هيئة الضرائب الاتحادية. ملفات PDF والمستندات المطبوعة والصور والنسخ الممسوحة ضوئياً لا تُعدّ فواتير إلكترونية بموجب هذا الإطار.",
      },
    },
    {
      "@type": "Question",
      name: "كيف تُحسب ضريبة القيمة المضافة 5% على بند في الفاتورة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "تُحسب الضريبة على القيمة الخاضعة للضريبة بعد الخصم. مثال: الكمية 10 وحدات × سعر الوحدة 1,000 درهم = 10,000 درهم. بعد خصم 500 درهم تصبح القاعدة الخاضعة 9,500 درهم. الضريبة = 9,500 × 5% = 475 درهم. الإجمالي = 9,975 درهم.",
      },
    },
    {
      "@type": "Question",
      name: "ما هي البيانات الإلزامية في الفاتورة الضريبية الكاملة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وفق المادة 59 من اللائحة التنفيذية، يجب أن تتضمن الفاتورة الكاملة: عبارة 'فاتورة ضريبية'، اسم المورد وعنوانه ورقمه الضريبي TRN، اسم العميل وعنوانه ورقمه الضريبي (إذا كان مسجلاً)، رقم الفاتورة التسلسلي الفريد، تاريخ الإصدار، تاريخ التوريد إذا اختلف عن تاريخ الإصدار، وصف البنود والكميات وسعر الوحدة، المجموع الخاضع للضريبة، مبلغ الضريبة، والمجموع الكلي.",
      },
    },
    {
      "@type": "Question",
      name: "هل هذه الأداة تُصدر فاتورة معتمدة من هيئة الضرائب الاتحادية؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا. هذه الأداة تُنشئ نموذج فاتورة ضريبية قابل للطباعة فقط، وهي غير مرتبطة بهيئة الضرائب الاتحادية ولا تُصدر فواتير إلكترونية ضمن المنظومة الرسمية. الفحص المقدم هو فحص مبدئي لاكتمال الحقول فقط. يُنصح بمراجعة مستشارك الضريبي للتأكد من الامتثال.",
      },
    },
  ],
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UaeVatInvoiceGeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <main className="min-h-screen bg-page-bg" dir="rtl">

        {/* Breadcrumb */}
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Link href="/" className="hover:text-brand transition-colors">الرئيسية</Link>
            <span>›</span>
            <Link href="/ar/ae" className="hover:text-brand transition-colors">🇦🇪 أدوات الإمارات</Link>
            <span>›</span>
            <span className="text-ink font-semibold">مولد الفاتورة الضريبية</span>
          </nav>
        </div>

        {/* ── PART 1: Calculator ── */}
        <UaeVatInvoiceGenerator />

        {/* ── PART 2: SEO Content ── */}
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">

            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">📖 دليل الفاتورة الضريبية في الإمارات</h2>
              <p className="text-xs text-ink-muted mt-1">وفق متطلبات هيئة الضرائب الاتحادية FTA — اللائحة التنفيذية لضريبة القيمة المضافة، المادة 59</p>
            </div>

            {/* What is a tax invoice */}
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <h3 className="text-base font-extrabold text-ink">ما هي الفاتورة الضريبية؟</h3>
              <p>
                الفاتورة الضريبية وثيقة قانونية تُصدرها منشأة مسجلة في ضريبة القيمة المضافة عند توريد سلع أو خدمات خاضعة للضريبة.
                تُتيح للمستلم المسجل المطالبة بضريبة المدخلات (Input Tax Credit)، وتُشكّل أداة الإثبات الأساسية في إجراءات التدقيق الضريبي.
              </p>
              <p>
                يُلزم المرسوم بقانون اتحادي رقم 8 لسنة 2017 ولائحته التنفيذية كلَّ منشأة مسجلة بإصدار فاتورة ضريبية خلال 14 يوماً من تاريخ التوريد.
              </p>
            </div>

            {/* Full vs Simplified */}
            <div className="space-y-3">
              <h3 className="text-base font-extrabold text-ink">الفاتورة الكاملة والمبسطة — متى تستخدم كلاً منهما؟</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-2">
                  <h4 className="text-sm font-extrabold text-indigo-900 flex items-center gap-2">
                    <span>📄</span><span>فاتورة ضريبية كاملة</span>
                  </h4>
                  <ul className="text-xs text-indigo-800 space-y-1 leading-relaxed list-disc list-inside">
                    <li>معاملات بين شركات B2B</li>
                    <li>قيمة المعاملة تتجاوز 10,000 درهم لعميل مسجل</li>
                    <li>عندما يحتاج العميل لاسترداد ضريبة المدخلات</li>
                    <li>تتضمن TRN المورد والعميل والبيانات الكاملة</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                  <h4 className="text-sm font-extrabold text-emerald-900 flex items-center gap-2">
                    <span>🧾</span><span>فاتورة ضريبية مبسطة</span>
                  </h4>
                  <ul className="text-xs text-emerald-800 space-y-1 leading-relaxed list-disc list-inside">
                    <li>المستهلك النهائي (غير مسجل)</li>
                    <li>قيمة المعاملة ≤ 10,000 درهم لعميل مسجل</li>
                    <li>التجزئة والمطاعم والخدمات اليومية</li>
                    <li>بيانات أقل — لكن TRN المورد إلزامي</li>
                  </ul>
                </div>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                <p className="text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold">تنبيه: </span>
                  تحقق من انطباق شروط الفاتورة المبسطة على حالتك. إذا تجاوزت قيمة الفاتورة 10,000 درهم وكان العميل مسجلاً ضريبياً، فيجب إصدار فاتورة كاملة.
                </p>
              </div>
            </div>

            {/* Required fields */}
            <div className="space-y-3">
              <h3 className="text-base font-extrabold text-ink">البيانات الإلزامية في الفاتورة الكاملة (المادة 59)</h3>
              <div className="grid gap-2 sm:grid-cols-2 text-xs">
                {[
                  { icon: "✅", label: 'عبارة "فاتورة ضريبية / Tax Invoice"' },
                  { icon: "✅", label: "اسم المورد وعنوانه والرقم الضريبي TRN" },
                  { icon: "✅", label: "اسم العميل وعنوانه وTRN (للمسجلين)" },
                  { icon: "✅", label: "رقم الفاتورة التسلسلي الفريد" },
                  { icon: "✅", label: "تاريخ الإصدار وتاريخ التوريد (إذا اختلفا)" },
                  { icon: "✅", label: "وصف البنود والكميات وسعر الوحدة" },
                  { icon: "✅", label: "قيمة الخصومات (إن وجدت)" },
                  { icon: "✅", label: "المجموع قبل الضريبة ومبلغ الضريبة" },
                  { icon: "✅", label: "الإجمالي النهائي شامل الضريبة بالدرهم" },
                  { icon: "✅", label: "معدل الضريبة المطبق على كل بند" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                    <span className="text-emerald-600 shrink-0">{item.icon}</span>
                    <span className="text-ink-secondary leading-relaxed">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* VAT categories */}
            <div className="space-y-3">
              <h3 className="text-base font-extrabold text-ink">فئات ضريبة القيمة المضافة — الفرق بين 0% والمعفى</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    color: "border-blue-200 bg-blue-50/60",
                    titleColor: "text-blue-900",
                    title: "5% — خاضعة للضريبة",
                    desc: "المعدل القياسي. يجب تحصيل الضريبة من العميل وتوريدها لهيئة الضرائب. يحق للمورد استرداد ضريبة المدخلات المرتبطة.",
                  },
                  {
                    color: "border-emerald-200 bg-emerald-50/60",
                    titleColor: "text-emerald-900",
                    title: "0% — صفرية المعدل",
                    desc: "التوريد خاضع للضريبة بمعدل صفر (كالصادرات وبعض المواد الغذائية). يحق للمورد استرداد ضريبة المدخلات كاملاً.",
                  },
                  {
                    color: "border-amber-200 bg-amber-50/60",
                    titleColor: "text-amber-900",
                    title: "معفاة — Exempt",
                    desc: "التوريد معفى من الضريبة (كالخدمات المالية والإيجار السكني). لا يحق استرداد ضريبة المدخلات المنسوبة لهذه التوريدات.",
                  },
                  {
                    color: "border-slate-200 bg-slate-50/60",
                    titleColor: "text-slate-900",
                    title: "خارج النطاق — Out of Scope",
                    desc: "توريدات لا تخضع لنظام ضريبة القيمة المضافة الإماراتي أصلاً (كالتحويلات خارج الإمارات في حالات معينة).",
                  },
                ].map((cat, i) => (
                  <div key={i} className={`rounded-xl border ${cat.color} p-4 space-y-1`}>
                    <h4 className={`text-xs font-extrabold ${cat.titleColor}`}>{cat.title}</h4>
                    <p className="text-xs text-ink-secondary leading-relaxed">{cat.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* e-Invoicing section */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-5 space-y-3">
              <h3 className="text-base font-extrabold text-rose-950 flex items-center gap-2">
                <span>📡</span><span>الفوترة الإلكترونية في الإمارات — ما الفرق؟</span>
              </h3>
              <div className="space-y-2 text-xs text-rose-900 leading-relaxed">
                <p>
                  أطلقت الإمارات منظومة الفوترة الإلكترونية (e-Invoicing) التي تتضمن تبادل بيانات الفاتورة بشكل منظم (Structured Data)
                  عبر مزودي خدمة معتمدين (PEPPOL أو الأطر المعادلة)، والإبلاغ عنها إلكترونياً لهيئة الضرائب الاتحادية.
                </p>
                <p>
                  <span className="font-black">هذا المولد لا يُنشئ فاتورة إلكترونية</span> بالمعنى التقني للمنظومة الإماراتية.
                  ملفات PDF والمستندات المطبوعة ورسائل البريد الإلكتروني <span className="font-bold">لا تُعدّ فواتير إلكترونية</span> وفق هذا الإطار.
                </p>
              </div>
              <a href="https://tax.gov.ae/en/e-invoicing" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-900 underline">
                اقرأ أكثر عن نظام الفوترة الإلكترونية الإماراتي — FTA ←
              </a>
            </div>

            {/* How to use */}
            <div className="space-y-3">
              <h3 className="text-base font-extrabold text-ink">كيفية استخدام الأداة</h3>
              <ol className="space-y-2 text-sm text-ink-secondary leading-relaxed">
                {[
                  "اختر نوع الفاتورة — كاملة أو مبسطة",
                  "أدخل بيانات المنشأة المُصدِرة بما فيها الرقم الضريبي TRN (15 رقماً)",
                  "أدخل بيانات العميل وحدد هل هو مسجل في ضريبة القيمة المضافة أم لا",
                  "أضف بنود الفاتورة مع تحديد نسبة الضريبة لكل بند (5% / 0% / معفاة / خارج النطاق)",
                  "راجع الإجماليات المحسوبة تلقائياً والفحص المبدئي لاكتمال الحقول",
                  "انتقل لتبويب المعاينة ثم اضغط طباعة للحصول على نسخة A4",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Source */}
            <p className="text-[11px] text-ink-muted border-t border-brand-border pt-3">
              آخر تحديث: سبتمبر 2026م — المصدر: الهيئة الاتحادية للضرائب (FTA)، دولة الإمارات العربية المتحدة.
              المادة 59 من اللائحة التنفيذية لضريبة القيمة المضافة — المرسوم بقانون اتحادي رقم 8 لسنة 2017.
              هذه الأداة للأغراض التعليمية فقط — ليست مرتبطة بهيئة الضرائب الاتحادية ولا تحمل اعتمادها.
            </p>
          </div>
        </section>

        {/* ── PART 3: Worked Examples ── */}
        <section className="mx-auto max-w-3xl px-4 py-2">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-5">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">🔢 أمثلة عملية</h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  title: "مثال 1 — فاتورة ضريبية كاملة (B2B، أكثر من 10,000 درهم)",
                  scenario: "شركة استشارات تُصدر فاتورة لشركة أخرى مسجلة: 10 ساعات × 1,500 درهم = 15,000 درهم. خصم 500 درهم. القاعدة الخاضعة: 14,500 درهم.",
                  calc: "الضريبة 5% = 14,500 × 5% = 725 درهم. الإجمالي = 15,225 درهم.",
                  note: "يجب إصدار فاتورة كاملة مع TRN المورد والعميل لأن القيمة تتجاوز 10,000 درهم والعميل مسجل.",
                  resultColor: "text-indigo-700",
                },
                {
                  title: "مثال 2 — فاتورة ضريبية مبسطة (B2C، أقل من 10,000 درهم)",
                  scenario: "مطعم يُصدر فاتورة لزبون غير مسجل: وجبة 1,200 درهم + مشروبات 100 درهم = 1,300 درهم.",
                  calc: "الضريبة 5% = 1,300 × 5% = 65 درهم. الإجمالي = 1,365 درهم.",
                  note: "يمكن إصدار فاتورة مبسطة لأن العميل غير مسجل. TRN المورد إلزامي حتى في الفاتورة المبسطة.",
                  resultColor: "text-emerald-700",
                },
                {
                  title: "مثال 3 — فاتورة مختلطة (5% و0% ومعفاة)",
                  scenario: "شركة توريد: بضائع إلكترونيات 15,000 درهم (5%) + صادرات غذائية 5,000 درهم (0%) + خدمة مالية 800 درهم (معفاة).",
                  calc: "ضريبة الإلكترونيات: 15,000 × 5% = 750 درهم. الصادرات: 0 درهم. الخدمة المعفاة: 0 درهم. إجمالي الضريبة = 750 درهم. الإجمالي الكلي = 21,550 درهم.",
                  note: "كل فئة تظهر منفصلة في الفاتورة. ضريبة المدخلات قابلة للاسترداد للبنود الخاضعة والصفرية فقط — ليس للمعفاة.",
                  resultColor: "text-amber-700",
                },
              ].map((ex, i) => (
                <div key={i} className="rounded-xl border border-brand-border/80 p-4 space-y-1.5">
                  <h3 className="text-sm font-extrabold text-ink">{ex.title}</h3>
                  <p className="text-xs text-ink-secondary leading-relaxed">{ex.scenario}</p>
                  <p className={`text-xs font-black ${ex.resultColor}`}>{ex.calc}</p>
                  <p className="text-[11px] text-ink-muted leading-relaxed">{ex.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PART 4: FAQ ── */}
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

        {/* ── PART 5: Related Tools ── */}
        <section className="mx-auto max-w-3xl px-4 py-4 pb-12">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <div className="border-b border-brand-border pb-4 mb-5">
              <h2 className="text-lg font-extrabold text-ink">🔗 أدوات ضريبية وعمالية ذات صلة بدولة الإمارات</h2>
              <p className="text-xs text-ink-muted mt-1">حاسبات ضريبية ومالية وعمالية مخصصة للسوق الإماراتي</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  href: "/ar/ae/vat-registration-checker",
                  icon: "🏢",
                  title: "التحقق من أهلية التسجيل في ضريبة القيمة المضافة",
                  desc: "هل تحتاج للتسجيل الإلزامي (375,000 درهم) أو الاختياري (187,500 درهم)؟",
                  badge: "FTA",
                  badgeColor: "bg-blue-100 text-blue-800",
                  cta: "التحقق قبل إصدار الفاتورة →",
                },
                {
                  href: "/ar/ae/corporate-tax-calculator",
                  icon: "🏛️",
                  title: "حاسبة ضريبة الشركات الإمارات",
                  desc: "قدّر ضريبة الشركات: 0% على أول 375,000 درهم و9% على ما يزيد.",
                  badge: "FTA CT",
                  badgeColor: "bg-indigo-100 text-indigo-800",
                  cta: null,
                },
                {
                  href: "/ar/ae/small-business-relief-checker",
                  icon: "🏷️",
                  title: "تسهيلات الأعمال الصغيرة في ضريبة الشركات",
                  desc: "هل تستوفي شروط الإعفاء بحد الإيرادات 3,000,000 درهم حتى 2026؟",
                  badge: "SBR 2026",
                  badgeColor: "bg-emerald-100 text-emerald-800",
                  cta: null,
                },
                {
                  href: "/ar/ae/final-settlement-calculator",
                  icon: "📋",
                  title: "حاسبة المخالصة النهائية الإمارات",
                  desc: "احسب مكافأة نهاية الخدمة وجميع مستحقات الموظف وفق قانون العمل الإماراتي.",
                  badge: "قانون 33",
                  badgeColor: "bg-amber-100 text-amber-800",
                  cta: null,
                },
                {
                  href: "/ar/ae/notice-period-calculator",
                  icon: "⏳",
                  title: "حاسبة فترة الإنذار الإمارات",
                  desc: "احسب مدة الإنذار وبدله وتاريخ آخر يوم عمل وفق المادة 43.",
                  badge: "المادة 43",
                  badgeColor: "bg-rose-100 text-rose-800",
                  cta: null,
                },
                {
                  href: "/ar/ae",
                  icon: "🇦🇪",
                  title: "مجمع أدوات وحاسبات الإمارات",
                  desc: "جميع الأدوات الضريبية والعمالية والمالية المخصصة للسوق الإماراتي في مكان واحد.",
                  badge: "الشامل",
                  badgeColor: "bg-emerald-700 text-white font-black",
                  cta: null,
                },
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
