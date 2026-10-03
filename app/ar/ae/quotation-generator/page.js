import UaeQuotationGenerator from "@/components/UaeQuotationGenerator";
import Link from "next/link";
import RelatedBusinessTools from "@/components/business/RelatedBusinessTools";
import { SITE_URL } from "@/lib/siteConfig";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata = {
  title: "مولد عرض سعر الإمارات 2026 | نموذج Quotation مجاني",
  description:
    "أنشئ عرض سعر احترافي بالعربية والإنجليزية في الإمارات، أضف المنتجات والخدمات والخصومات وضريبة VAT واطبع نموذجاً جاهزاً للعميل.",
  keywords: [
    "عرض سعر الإمارات",
    "مولد عرض سعر",
    "نموذج quotation الإمارات",
    "عرض سعر احترافي بالعربية",
    "UAE quotation generator",
    "quote template UAE Arabic",
    "عرض أسعار خدمات الإمارات",
    "نموذج عرض سعر مجاني",
    "عرض سعر مع VAT الإمارات",
  ],
  alternates: {
    canonical: "/ar/ae/quotation-generator",
  },
  openGraph: {
    title: "مولد عرض سعر الإمارات 2026 | نموذج Quotation مجاني",
    description:
      "أنشئ عرض سعر احترافي بالعربية والإنجليزية مع حساب VAT وخصومات وشروط دفع، واطبعه مباشرة.",
    url: `${SITE_URL}/ar/ae/quotation-generator`,
    type: "website",
    locale: "ar_AE",
  },
};

// ─── Structured Data ──────────────────────────────────────────────────────────

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية",          item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "🇦🇪 أدوات الإمارات", item: `${SITE_URL}/ar/ae` },
    { "@type": "ListItem", position: 3, name: "مولد عرض السعر",    item: `${SITE_URL}/ar/ae/quotation-generator` },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "مولد عرض السعر في الإمارات",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
  description:
    "أداة مجانية لإنشاء عروض أسعار احترافية بالعربية والإنجليزية للشركات والمستقلين في الإمارات.",
  inLanguage: "ar",
  url: `${SITE_URL}/ar/ae/quotation-generator`,
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
        text: "عرض السعر (Quotation) هو وثيقة تجارية يُقدمها البائع أو مزود الخدمة للعميل المحتمل، توضح تفاصيل السلع أو الخدمات المطلوبة وأسعارها وشروط التعامل وصلاحية العرض. هو مستند تجاري وليس فاتورة ضريبية.",
      },
    },
    {
      "@type": "Question",
      name: "ما الفرق بين عرض السعر والفاتورة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "عرض السعر مستند تجاري مقدِّم للأسعار قبل إتمام الصفقة، وليس له أثر قانوني ضريبي. الفاتورة الضريبية تُصدر بعد اكتمال التوريد من منشأة مسجلة في ضريبة القيمة المضافة، ولها أثر قانوني يُتيح استرداد ضريبة المدخلات. لا يمكن استخدام عرض السعر بديلاً عن الفاتورة الضريبية.",
      },
    },
    {
      "@type": "Question",
      name: "هل يمكن إضافة VAT إلى عرض السعر؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، يمكن إظهار ضريبة القيمة المضافة في عرض السعر لإعطاء العميل صورة كاملة عن التكلفة الإجمالية. لكن إضافة VAT لعرض السعر لا يجعله فاتورة ضريبية. الفاتورة الضريبية تتطلب استيفاء متطلبات محددة بموجب قانون ضريبة القيمة المضافة الإماراتي.",
      },
    },
    {
      "@type": "Question",
      name: "كم مدة صلاحية عرض السعر؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا يوجد تحديد قانوني لمدة صلاحية عرض السعر في الإمارات. الممارسة الشائعة تتراوح بين 7 و30 يوماً. ينصح بتحديد مدة الصلاحية بوضوح في العرض حتى يتمكن العميل من اتخاذ قراره، وحتى لا تلتزم بالسعر لفترة غير محددة.",
      },
    },
    {
      "@type": "Question",
      name: "ماذا يجب أن يتضمن عرض السعر؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "يجب أن يتضمن عرض السعر الاحترافي: اسم وبيانات البائع، اسم وبيانات العميل، رقم العرض وتاريخه وصلاحيته، وصف تفصيلي للبنود والكميات والأسعار، الخصومات، مبلغ VAT إن طُبّق، الإجمالي النهائي، شروط الدفع والتسليم، وتوقيع الإعداد والاعتماد.",
      },
    },
  ],
};

// ─── Related tools data ────────────────────────────────────────────────────────

const relatedTools = [
  {
    href: "/ar/ae/purchase-order-generator",
    icon: "📦",
    title: "مولد أمر الشراء في الإمارات",
    desc: "بعد موافقة العميل أو المورد، أنشئ أمر شراء رسمي بالعربية والإنجليزية.",
    badge: "Business",
    badgeColor: "bg-indigo-100 text-indigo-800",
    cta: "أنشئ أمر شراء →",
  },
  {
    href: "/ar/ae/vat-invoice-generator",
    icon: "🧾",
    title: "مولد الفاتورة الضريبية في الإمارات",
    desc: "أنشئ فاتورة ضريبية كاملة أو مبسطة مع احتساب 5% VAT وفحص اكتمال الحقول.",
    badge: "FTA VAT",
    badgeColor: "bg-indigo-100 text-indigo-800",
    cta: "حوّل عرض سعرك إلى فاتورة →",
  },
  {
    href: "/ar/ae/vat-registration-checker",
    icon: "🏢",
    title: "التحقق من أهلية التسجيل في ضريبة القيمة المضافة",
    desc: "هل تحتاج للتسجيل الإلزامي (375,000 درهم) أو الاختياري (187,500 درهم)؟",
    badge: "FTA",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  {
    href: "/vat-calculator/uae",
    icon: "🧮",
    title: "حاسبة ضريبة القيمة المضافة الإمارات 5%",
    desc: "احسب قيمة الـ VAT أو استخرج السعر الأصلي من أي مبلغ.",
    badge: "FTA 5%",
    badgeColor: "bg-purple-100 text-purple-800",
  },
  {
    href: "/ar/ae/corporate-tax-calculator",
    icon: "🏛️",
    title: "حاسبة ضريبة الشركات الإمارات",
    desc: "قدّر ضريبة الشركات: 0% على أول 375,000 درهم و9% على ما يزيد.",
    badge: "FTA CT",
    badgeColor: "bg-amber-100 text-amber-800",
  },
  {
    href: "/profit-margin-calculator",
    icon: "📈",
    title: "حاسبة هامش الربح والتسعير",
    desc: "احسب هامش الربح ومعدل الزيادة على التكلفة لتسعير خدماتك ومنتجاتك.",
    badge: "تسعير",
    badgeColor: "bg-emerald-100 text-emerald-800",
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

export default function UaeQuotationGeneratorPage() {
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
            <span className="text-ink font-semibold">مولد عرض السعر</span>
          </nav>
        </div>

        {/* ── PART 1: Tool ── */}
        <UaeQuotationGenerator />

        {/* ── PART 2: SEO Content ── */}
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">

            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">📖 دليل عرض السعر الاحترافي في الإمارات</h2>
              <p className="text-xs text-ink-muted mt-1">للمستقلين والشركات الصغيرة والمتوسطة والمقاولين</p>
            </div>

            {/* What is a quotation */}
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <h3 className="text-base font-extrabold text-ink">ما هو عرض السعر؟</h3>
              <p>
                عرض السعر (Quotation أو Quote) هو وثيقة تجارية يُقدمها البائع أو مزود الخدمة للعميل المحتمل،
                توضح تفاصيل السلع أو الخدمات المطلوبة وأسعارها وشروط التعامل وصلاحية العرض.
                هو مرحلة ما قبل الفاتورة في دورة البيع، ويُستخدم لأخذ موافقة العميل قبل بدء التنفيذ.
              </p>
            </div>

            {/* Quote vs Invoice */}
            <div className="space-y-3">
              <h3 className="text-base font-extrabold text-ink">ما الفرق بين عرض السعر والفاتورة الضريبية؟</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
                  <h4 className="text-sm font-extrabold text-amber-900 flex items-center gap-2"><span>📋</span><span>عرض السعر</span></h4>
                  <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside leading-relaxed">
                    <li>مستند تجاري قبل إتمام الصفقة</li>
                    <li>لا أثر ضريبي قانوني</li>
                    <li>لا يُتيح استرداد ضريبة المدخلات</li>
                    <li>يتضمن VAT للتوضيح فقط</li>
                    <li>يصدر من أي منشأة حتى غير المسجلة</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-2">
                  <h4 className="text-sm font-extrabold text-indigo-900 flex items-center gap-2"><span>🧾</span><span>الفاتورة الضريبية</span></h4>
                  <ul className="text-xs text-indigo-800 space-y-1 list-disc list-inside leading-relaxed">
                    <li>مستند قانوني بعد التوريد</li>
                    <li>أثر ضريبي ملزم (VAT)</li>
                    <li>تُتيح استرداد ضريبة المدخلات</li>
                    <li>تستلزم TRN المورد والعميل (B2B)</li>
                    <li>تصدر من منشآت مسجلة في VAT فقط</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Required fields */}
            <div className="space-y-3">
              <h3 className="text-base font-extrabold text-ink">ماذا يجب أن يتضمن عرض السعر الاحترافي؟</h3>
              <div className="grid gap-2 sm:grid-cols-2 text-xs">
                {[
                  { icon: "✅", label: "اسم وبيانات البائع / المزود" },
                  { icon: "✅", label: "اسم وبيانات العميل" },
                  { icon: "✅", label: "رقم العرض وتاريخ الإصدار" },
                  { icon: "✅", label: "تاريخ انتهاء الصلاحية" },
                  { icon: "✅", label: "وصف تفصيلي للبنود والكميات" },
                  { icon: "✅", label: "الأسعار والخصومات والإجمالي" },
                  { icon: "✅", label: "شروط الدفع والتسليم" },
                  { icon: "✅", label: "ضريبة VAT (إن طُبّقت)" },
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
              <h3 className="text-base font-extrabold text-blue-900">هل يمكن إضافة VAT إلى عرض السعر؟</h3>
              <p className="text-xs text-blue-800 leading-relaxed">
                نعم، يُنصح بإظهار VAT في عرض السعر لإعطاء العميل صورة واضحة عن التكلفة الإجمالية، خاصة إذا كانت منشأتك مسجلة في ضريبة القيمة المضافة.
                <span className="font-bold"> لكن إضافة VAT لعرض السعر لا يجعله فاتورة ضريبية. </span>
                الفاتورة الضريبية مستند منفصل يستلزم استيفاء متطلبات محددة.
              </p>
            </div>

            {/* How to use */}
            <div className="space-y-3">
              <h3 className="text-base font-extrabold text-ink">كيفية إنشاء عرض سعر احترافي بهذه الأداة</h3>
              <ol className="space-y-2 text-sm text-ink-secondary leading-relaxed">
                {[
                  "أدخل بيانات عرض السعر (الرقم، التاريخ، الصلاحية، العملة)",
                  "أضف بيانات منشأتك أو معلومات العمل الحر",
                  "أدخل بيانات العميل",
                  "أضف بنود الخدمات أو المنتجات مع الكميات والأسعار والخصومات",
                  "فعّل VAT إذا كنت مسجلاً أو تريد إظهار الضريبة",
                  "أضف أي رسوم إضافية (شحن، خدمة)",
                  "حدد الشروط والأحكام (دفع، تسليم، ضمان)",
                  "احفظ المسودة، ثم انتقل للمعاينة وتحقق من النتيجة",
                  "اطبع أو احفظ كـ PDF وأرسله للعميل",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-[11px] text-ink-muted border-t border-brand-border pt-3">
              هذه الأداة للأغراض التجارية التنظيمية فقط — ليست مرتبطة بهيئة الضرائب الاتحادية FTA ولا تحمل اعتمادها.
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
            <div className="space-y-3">
              <div className="rounded-xl border border-brand-border/80 p-4 space-y-2">
                <h3 className="text-sm font-extrabold text-ink">مثال — مشروع موقع إلكتروني احترافي</h3>
                <div className="text-xs text-ink-secondary space-y-1">
                  <div className="grid grid-cols-3 gap-2 font-bold text-ink border-b border-slate-200 pb-1 mb-2">
                    <span>البند</span><span className="text-left" dir="ltr">السعر</span><span className="text-left" dir="ltr">الإجمالي</span>
                  </div>
                  {[
                    ["تصميم واجهة الموقع (UI/UX)", "4,000 درهم × 1", "4,000.00 درهم"],
                    ["تطوير وبرمجة الموقع", "6,000 درهم × 1 (خصم 500)", "5,500.00 درهم"],
                    ["استضافة سنوية + دومين", "800 درهم × 1", "800.00 درهم"],
                  ].map(([name, price, total], i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                      <span>{name}</span>
                      <span dir="ltr" className="text-left">{price}</span>
                      <span dir="ltr" className="text-left font-bold text-ink">{total}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-ink-secondary"><span>المجموع قبل VAT</span><span dir="ltr">10,300.00 درهم</span></div>
                  <div className="flex justify-between text-blue-700 font-bold"><span>ضريبة القيمة المضافة 5%</span><span dir="ltr">515.00 درهم</span></div>
                  <div className="flex justify-between text-indigo-700 font-black text-sm border-t border-slate-200 pt-1 mt-1"><span>الإجمالي النهائي</span><span dir="ltr">10,815.00 درهم</span></div>
                </div>
                <p className="text-[11px] text-ink-muted mt-2">الشروط: 50% دفعة مقدمة، 50% عند التسليم — صالح لمدة 15 يوماً</p>
              </div>
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
            title="🔗 أدوات ضريبية وتجارية ذات صلة بدولة الإمارات"
            subtitle="سلسلة أدوات متكاملة للأعمال الصغيرة والمتوسطة في الإمارات"
            tools={relatedTools}
          />
        </section>

      </main>
    </>
  );
}
