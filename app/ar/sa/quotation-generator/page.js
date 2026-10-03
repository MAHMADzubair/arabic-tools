import SaudiQuotationGenerator from "@/components/SaudiQuotationGenerator";
import Link from "next/link";
import RelatedBusinessTools from "@/components/business/RelatedBusinessTools";
import { SITE_URL } from "@/lib/siteConfig";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata = {
  title: "مولد عرض سعر السعودية 2026 | نموذج Quotation مجاني",
  description:
    "أنشئ عرض سعر احترافي بالعربية والإنجليزية في السعودية، أضف المنتجات والخدمات والخصومات وضريبة القيمة المضافة 15% واطبع النموذج للعميل.",
  keywords: [
    "عرض سعر السعودية",
    "مولد عرض سعر",
    "نموذج quotation السعودية",
    "عرض سعر احترافي بالعربية",
    "Saudi quotation generator",
    "quote template Saudi Arabia Arabic",
    "عرض أسعار خدمات السعودية",
    "نموذج عرض سعر مجاني",
    "عرض سعر مع VAT 15% السعودية",
    "عرض سعر للمستقلين السعودية",
  ],
  alternates: {
    canonical: "/ar/sa/quotation-generator",
  },
  openGraph: {
    title: "مولد عرض سعر السعودية 2026 | نموذج Quotation مجاني",
    description:
      "أنشئ عرض سعر احترافي بالعربية والإنجليزية مع حساب ضريبة 15% وخصومات وشروط دفع، واطبعه مباشرة.",
    url: `${SITE_URL}/ar/sa/quotation-generator`,
    type: "website",
    locale: "ar_SA",
  },
};

// ─── Structured Data ──────────────────────────────────────────────────────────

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية",           item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "🇸🇦 أدوات السعودية", item: `${SITE_URL}/ar/sa` },
    { "@type": "ListItem", position: 3, name: "مولد عرض السعر",     item: `${SITE_URL}/ar/sa/quotation-generator` },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "مولد عرض السعر في السعودية",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "SAR" },
  description:
    "أداة مجانية لإنشاء عروض أسعار احترافية بالعربية والإنجليزية للشركات والمستقلين في المملكة العربية السعودية مع دعم ضريبة القيمة المضافة 15%.",
  inLanguage: "ar",
  url: `${SITE_URL}/ar/sa/quotation-generator`,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ما هو عرض السعر؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "عرض السعر (Quotation) هو وثيقة تجارية يُقدمها البائع أو مزود الخدمة للعميل المحتمل، توضح تفاصيل السلع أو الخدمات المطلوبة وأسعارها وشروط التعامل وصلاحية العرض. هو مستند تجاري وليس فاتورة ضريبية، ولا يُعد فاتورة إلكترونية معتمدة من هيئة الزكاة والضريبة والجمارك.",
      },
    },
    {
      "@type": "Question",
      name: "ما الفرق بين عرض السعر والفاتورة الضريبية في السعودية؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "عرض السعر مستند تجاري يُعدّ قبل إتمام الصفقة لغرض التفاوض والموافقة، وليس له أثر ضريبي قانوني. الفاتورة الضريبية تُصدر بعد اكتمال التوريد من منشأة مسجلة في ضريبة القيمة المضافة، وتُتيح للمستلم استرداد ضريبة المدخلات، ويجب أن تستوفي متطلبات منظومة ZATCA فاتورة.",
      },
    },
    {
      "@type": "Question",
      name: "هل يمكن إضافة ضريبة 15% إلى عرض السعر؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، يمكن إظهار ضريبة القيمة المضافة 15% في عرض السعر لإعطاء العميل صورة كاملة عن التكلفة الإجمالية. إضافة ضريبة القيمة المضافة إلى عرض السعر لا تجعل المستند فاتورة ضريبية معتمدة من هيئة الزكاة والضريبة والجمارك.",
      },
    },
    {
      "@type": "Question",
      name: "هل عرض السعر يُعتبر فاتورة إلكترونية معتمدة من ZATCA؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا. الفاتورة الإلكترونية المعتمدة من ZATCA تتطلب استيفاء متطلبات منظومة فاتورة: إنشاء وتخزين الفاتورة بصيغة رقمية منظمة، ورمز QR، وشهادة CSID للمرحلة الثانية. عرض السعر مستند تجاري مختلف تماماً ولا يرتبط بمنظومة ZATCA فاتورة.",
      },
    },
    {
      "@type": "Question",
      name: "كم مدة صلاحية عرض السعر؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا يوجد تحديد قانوني لمدة صلاحية عرض السعر في المملكة العربية السعودية. الممارسة الشائعة تتراوح بين 7 و30 يوماً. يُنصح بتحديد مدة الصلاحية بوضوح في العرض حتى لا تلتزم بالسعر لأجل غير محدد.",
      },
    },
    {
      "@type": "Question",
      name: "ما البيانات التي يجب أن يتضمنها عرض السعر الاحترافي؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "يجب أن يتضمن عرض السعر الاحترافي: اسم وبيانات المورد (وربما رقمه الضريبي إن كان مسجلاً)، اسم وبيانات العميل، رقم العرض وتاريخه وتاريخ انتهاء الصلاحية، وصف تفصيلي للبنود والكميات والأسعار، الخصومات، مبلغ ضريبة القيمة المضافة 15% إن طُبّقت، الإجمالي النهائي، وشروط الدفع والتسليم والضمان.",
      },
    },
  ],
};

// ─── Related tools ─────────────────────────────────────────────────────────────

const relatedTools = [
  {
    href: "/ar/sa/e-invoice-generator",
    icon: "🧾",
    title: "مولد الفاتورة الإلكترونية السعودية",
    desc: "أنشئ فاتورة ضريبية B2B أو مبسطة B2C مع احتساب VAT 15% وفق متطلبات ZATCA فاتورة.",
    badge: "ZATCA فاتورة",
    badgeColor: "bg-indigo-100 text-indigo-700",
    cta: "حوّل عرض سعرك إلى فاتورة →",
  },
  {
    href: "/ar/sa/vat-registration-checker",
    icon: "🏢",
    title: "حاسبة أهلية التسجيل في ضريبة القيمة المضافة",
    desc: "تحقق من الالتزام بالتسجيل الإلزامي (375,000 ريال) أو الاختياري (187,500 ريال) في VAT.",
    badge: "ZATCA",
    badgeColor: "bg-purple-100 text-purple-700",
  },
  {
    href: "/vat-calculator/saudi",
    icon: "🧮",
    title: "حاسبة ضريبة القيمة المضافة 15%",
    desc: "احسب ضريبة الـ 15% أو استخرج السعر الأصلي من أي مبلغ لفواتيرك.",
    badge: "VAT 15%",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    href: "/ar/sa/article-77-calculator",
    icon: "⚖️",
    title: "حاسبة تعويض المادة 77",
    desc: "احسب تعويض إنهاء العقد التعسفي وفق نظام العمل السعودي.",
    badge: "المادة 77",
    badgeColor: "bg-rose-100 text-rose-700",
  },
  {
    href: "/profit-margin-calculator",
    icon: "📈",
    title: "حاسبة هامش الربح والتسعير",
    desc: "احسب هامش الربح ومعدل الزيادة على التكلفة لتسعير خدماتك ومنتجاتك بدقة.",
    badge: "تسعير",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    href: "/ar/sa",
    icon: "🇸🇦",
    title: "مجمع أدوات وحاسبات السعودية",
    desc: "الدليل الشامل لكافة الحاسبات العمالية والمالية والضريبية المخصصة للمملكة.",
    badge: "المجمع الشامل",
    badgeColor: "bg-emerald-600 text-white font-black",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SaudiQuotationGeneratorPage() {
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
            <Link href="/ar/sa" className="hover:text-brand transition-colors">🇸🇦 أدوات السعودية</Link>
            <span>›</span>
            <span className="text-ink font-semibold">مولد عرض السعر</span>
          </nav>
        </div>

        {/* ── PART 1: Tool ── */}
        <SaudiQuotationGenerator />

        {/* ── PART 2: SEO Content ── */}
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">

            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">📖 دليل عرض السعر الاحترافي في السعودية</h2>
              <p className="text-xs text-ink-muted mt-1">للمستقلين والشركات الصغيرة والمتوسطة والمقاولين في المملكة</p>
            </div>

            {/* What is a quotation */}
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <h3 className="text-base font-extrabold text-ink">ما هو عرض السعر؟</h3>
              <p>
                عرض السعر (Quotation أو Quote) هو وثيقة تجارية يُقدمها البائع أو مزود الخدمة للعميل المحتمل،
                توضح تفاصيل السلع أو الخدمات المطلوبة وأسعارها وشروط التعامل وصلاحية العرض.
                هو مرحلة ما قبل الفاتورة في دورة البيع، ويُستخدم لأخذ موافقة العميل قبل بدء التنفيذ.
              </p>
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                <p className="text-xs text-amber-900 font-bold leading-relaxed">
                  ⚠️ لا يُعد عرض السعر فاتورة ضريبية، ولا يرتبط بمنظومة ZATCA فاتورة، ولا يُعد فاتورة إلكترونية معتمدة.
                </p>
              </div>
            </div>

            {/* Quote vs Invoice */}
            <div className="space-y-3">
              <h3 className="text-base font-extrabold text-ink">ما الفرق بين عرض السعر والفاتورة الضريبية؟</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
                  <h4 className="text-sm font-extrabold text-amber-900 flex items-center gap-2"><span>📋</span><span>عرض السعر</span></h4>
                  <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside leading-relaxed">
                    <li>مستند تجاري قبل إتمام الصفقة</li>
                    <li>لا أثر ضريبي قانوني ملزم</li>
                    <li>لا يُتيح استرداد ضريبة المدخلات</li>
                    <li>يصدر من أي منشأة حتى غير المسجلة</li>
                    <li>ليس جزءاً من منظومة ZATCA فاتورة</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-2">
                  <h4 className="text-sm font-extrabold text-indigo-900 flex items-center gap-2"><span>🧾</span><span>الفاتورة الضريبية</span></h4>
                  <ul className="text-xs text-indigo-800 space-y-1 list-disc list-inside leading-relaxed">
                    <li>مستند قانوني بعد التوريد</li>
                    <li>أثر ضريبي ملزم (VAT 15%)</li>
                    <li>تُتيح استرداد ضريبة المدخلات</li>
                    <li>تستلزم TRN المورد والمشتري (B2B)</li>
                    <li>تلتزم بمتطلبات ZATCA فاتورة</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Required fields */}
            <div className="space-y-3">
              <h3 className="text-base font-extrabold text-ink">ما البيانات التي يجب أن يتضمنها عرض السعر؟</h3>
              <div className="grid gap-2 sm:grid-cols-2 text-xs">
                {[
                  { icon: "✅", label: "اسم وبيانات البائع أو المزود" },
                  { icon: "✅", label: "اسم وبيانات العميل" },
                  { icon: "✅", label: "رقم العرض التسلسلي وتاريخ الإصدار" },
                  { icon: "✅", label: "تاريخ انتهاء الصلاحية" },
                  { icon: "✅", label: "وصف تفصيلي للبنود والكميات" },
                  { icon: "✅", label: "الأسعار والخصومات والإجمالي" },
                  { icon: "✅", label: "ضريبة VAT 15% إن طُبّقت" },
                  { icon: "✅", label: "شروط الدفع والتسليم والضمان" },
                  { icon: "✅", label: "خانة إعداد واعتماد العميل" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                    <span className="text-emerald-600 shrink-0">{item.icon}</span>
                    <span className="text-ink-secondary">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* VAT in quotations */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
              <h3 className="text-base font-extrabold text-blue-900">هل يمكن إضافة ضريبة 15% إلى عرض السعر؟</h3>
              <p className="text-xs text-blue-800 leading-relaxed">
                نعم، يُنصح بإظهار ضريبة القيمة المضافة 15% في عرض السعر لإعطاء العميل صورة واضحة عن التكلفة الإجمالية.
                <span className="font-bold"> لكن إضافة الضريبة لعرض السعر لا تجعله فاتورة ضريبية. </span>
                الفاتورة الضريبية مستند منفصل يستلزم استيفاء متطلبات ZATCA فاتورة.
              </p>
            </div>

            {/* How to use */}
            <div className="space-y-3">
              <h3 className="text-base font-extrabold text-ink">كيفية إنشاء عرض سعر احترافي بهذه الأداة</h3>
              <ol className="space-y-2 text-sm text-ink-secondary leading-relaxed">
                {[
                  "أدخل بيانات عرض السعر (الرقم، التاريخ، الصلاحية، العملة)",
                  "أضف بيانات منشأتك أو معلومات العمل الحر والرقم الضريبي إن توفّر",
                  "أدخل بيانات العميل",
                  "أضف بنود الخدمات أو المنتجات مع الكميات والأسعار والخصومات",
                  "فعّل ضريبة القيمة المضافة 15% إذا كنت مسجلاً أو تريد إظهارها",
                  "أضف أي رسوم إضافية (توصيل، تركيب، خدمة)",
                  "حدد الشروط والأحكام (دفع، تسليم، ضمان، إلغاء)",
                  "احفظ المسودة، ثم انتقل للمعاينة وراجع النتيجة",
                  "اطبع أو احفظ كـ PDF وأرسله للعميل",
                  "بعد قبول العميل، استخدم زر 'تحويل إلى فاتورة' لنقل البيانات لمولد الفاتورة",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-[11px] text-ink-muted border-t border-brand-border pt-3">
              هذه الأداة للأغراض التجارية التنظيمية فقط — ليست مرتبطة بهيئة الزكاة والضريبة والجمارك (ZATCA) ولا تحمل اعتمادها.
            </p>
          </div>
        </section>

        {/* ── PART 3: Worked Example ── */}
        <section className="mx-auto max-w-3xl px-4 py-2">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-4">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">🔢 مثال توضيحي عملي</h2>
              <p className="text-xs text-ink-muted mt-1">عرض سعر لمشروع تصميم وتطوير موقع إلكتروني</p>
            </div>
            <div className="rounded-xl border border-brand-border/80 p-4 space-y-2">
              <h3 className="text-sm font-extrabold text-ink">مثال — تطوير موقع إلكتروني احترافي</h3>
              <div className="text-xs text-ink-secondary space-y-1">
                <div className="grid grid-cols-3 gap-2 font-bold text-ink border-b border-slate-200 pb-1 mb-2">
                  <span>البند</span><span className="text-left" dir="ltr">السعر</span><span className="text-left" dir="ltr">الإجمالي</span>
                </div>
                {[
                  ["تصميم واجهة الموقع", "4,000 ريال × 1", "4,000.00 ريال"],
                  ["تطوير وبرمجة الموقع", "6,000 ريال × 1 (خصم 500)", "5,500.00 ريال"],
                ].map(([name, price, total], i) => (
                  <div key={i} className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                    <span>{name}</span>
                    <span dir="ltr" className="text-left">{price}</span>
                    <span dir="ltr" className="text-left font-bold text-ink">{total}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between text-ink-secondary"><span>المجموع الفرعي قبل الضريبة</span><span dir="ltr">9,500.00 ريال</span></div>
                <div className="flex justify-between text-blue-700 font-bold"><span>ضريبة القيمة المضافة 15%</span><span dir="ltr">1,425.00 ريال</span></div>
                <div className="flex justify-between text-indigo-700 font-black text-sm border-t border-slate-200 pt-1 mt-1"><span>الإجمالي النهائي</span><span dir="ltr">10,925.00 ريال</span></div>
              </div>
              <p className="text-[11px] text-ink-muted mt-2">
                الشروط: 50% مقدماً و50% عند الإنجاز — صالح لمدة 15 يوماً — <span className="font-bold">مثال توضيحي فقط</span>
              </p>
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
          <RelatedBusinessTools
            title="🔗 أدوات ضريبية وتجارية ذات صلة بالمملكة العربية السعودية"
            subtitle="سلسلة أدوات متكاملة للأعمال الصغيرة والمتوسطة في المملكة"
            tools={relatedTools}
          />
        </section>

      </main>
    </>
  );
}
