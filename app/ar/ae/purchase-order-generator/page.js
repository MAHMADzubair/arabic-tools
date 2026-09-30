import UaePurchaseOrderGenerator from "@/components/UaePurchaseOrderGenerator";
import Link from "next/link";
import RelatedBusinessTools from "@/components/business/RelatedBusinessTools";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata = {
  title: "مولد أمر شراء الإمارات 2026 | نموذج Purchase Order مجاني",
  description:
    "أنشئ أمر شراء احترافي بالعربية والإنجليزية في الإمارات، أضف المورد والمنتجات والكميات والأسعار وضريبة VAT واطبع نموذج PO جاهزاً.",
  keywords: [
    "أمر شراء الإمارات",
    "مولد أمر شراء",
    "نموذج purchase order الإمارات",
    "PO generator UAE Arabic",
    "أمر شراء احترافي بالعربية",
    "UAE purchase order template",
    "نموذج PO مجاني الإمارات",
    "أمر شراء مع VAT الإمارات",
  ],
  alternates: {
    canonical: "https://arabic-tools-xi.vercel.app/ar/ae/purchase-order-generator",
  },
  openGraph: {
    title: "مولد أمر شراء الإمارات 2026 | نموذج Purchase Order مجاني",
    description:
      "أنشئ أمر شراء احترافي بالعربية والإنجليزية مع حساب VAT وخصومات وشروط تسليم ودفع، واطبعه مباشرة.",
    url: "https://arabic-tools-xi.vercel.app/ar/ae/purchase-order-generator",
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
    { "@type": "ListItem", position: 3, name: "مولد أمر الشراء",    item: "https://arabic-tools-xi.vercel.app/ar/ae/purchase-order-generator" },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "مولد أمر الشراء في الإمارات",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
  description:
    "أداة مجانية لإنشاء أوامر شراء احترافية بالعربية والإنجليزية للشركات والمتاجر وفرق المشتريات في الإمارات.",
  inLanguage: "ar",
  url: "https://arabic-tools-xi.vercel.app/ar/ae/purchase-order-generator",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ما هو أمر الشراء (Purchase Order)؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "أمر الشراء هو وثيقة تجارية رسمية تُصدرها الشركة المشترية للمورد، تُحدد فيها السلع أو الخدمات المطلوبة والكميات والأسعار وشروط التسليم والدفع. هو التزام قانوني من المشتري بشراء ما هو مذكور في الأمر، ويُعد الأساس للعلاقة التعاقدية بين الطرفين.",
      },
    },
    {
      "@type": "Question",
      name: "ما الفرق بين أمر الشراء وعرض السعر؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "عرض السعر يُصدره المورد للمشتري بناءً على طلب، ويُحدد فيه الأسعار المقترحة دون التزام. أمر الشراء يُصدره المشتري للمورد ويُمثل قبولاً رسمياً للعرض والتزاماً بالشراء. يبدأ عادةً المورد تنفيذ العمل أو الشحن فقط بعد استلام أمر الشراء.",
      },
    },
    {
      "@type": "Question",
      name: "ما الفرق بين أمر الشراء والفاتورة الضريبية؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "أمر الشراء يُصدره المشتري قبل التوريد لتأكيد الطلب، بينما الفاتورة الضريبية يُصدرها المورد بعد إتمام التوريد كمطالبة بالدفع. الفاتورة الضريبية لها أثر ضريبي قانوني (تُتيح استرداد ضريبة المدخلات)، بينما أمر الشراء مجرد وثيقة تجارية.",
      },
    },
    {
      "@type": "Question",
      name: "هل يمكن إضافة VAT إلى أمر الشراء؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، يمكن إدراج ضريبة القيمة المضافة في أمر الشراء لإظهار التكلفة الإجمالية المتوقعة، خاصة عندما يكون المورد مسجلاً في ضريبة القيمة المضافة. لكن أمر الشراء ليس فاتورة ضريبية ولا يُعد مستنداً لاسترداد ضريبة المدخلات. الفاتورة الضريبية من المورد هي المستند المعتمد لذلك.",
      },
    },
    {
      "@type": "Question",
      name: "ما البيانات التي يجب أن يتضمنها أمر الشراء الاحترافي؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "يجب أن يتضمن أمر الشراء: اسم وبيانات الشركة المشترية، اسم وبيانات المورد، رقم أمر الشراء وتاريخ الإصدار، تاريخ التسليم المتوقع، وصف تفصيلي للبنود والكميات والأسعار، الخصومات، ضريبة VAT إن طُبّقت، الإجمالي النهائي، شروط الدفع والتسليم، ومرجع عرض السعر إن وجد.",
      },
    },
    {
      "@type": "Question",
      name: "متى تستخدم الشركات أمر الشراء؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "تستخدم الشركات أوامر الشراء لإنشاء سجل رسمي للمشتريات، ومراقبة الإنفاق، ومنع الطلبات غير المصرح بها. تُستخدم بشكل شائع في: الحصول على البضائع من الموردين، توظيف مقاولي الخدمات، شراء الأصول والمعدات، وأي معاملة تجارية تحتاج إلى توثيق رسمي قبل بدء التوريد.",
      },
    },
  ],
};

const relatedTools = [
  {
    href: "/ar/ae/quotation-generator",
    icon: "📋",
    title: "مولد عرض السعر في الإمارات",
    desc: "أنشئ عرض سعر احترافي قبل إصدار أمر الشراء، ثم حوّله مباشرة.",
    badge: "Business",
    badgeColor: "bg-amber-100 text-amber-800",
    cta: "أنشئ عرض سعر أولاً →",
  },
  {
    href: "/ar/ae/vat-invoice-generator",
    icon: "🧾",
    title: "مولد الفاتورة الضريبية في الإمارات",
    desc: "بعد إتمام التوريد، أنشئ فاتورة ضريبية كاملة أو مبسطة مع 5% VAT.",
    badge: "FTA VAT",
    badgeColor: "bg-indigo-100 text-indigo-800",
    cta: "أصدر الفاتورة بعد التوريد →",
  },
  {
    href: "/ar/ae/vat-registration-checker",
    icon: "🏢",
    title: "التحقق من أهلية التسجيل في ضريبة القيمة المضافة",
    desc: "تحقق من التزام مورديك أو شركتك بالتسجيل في VAT.",
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
    href: "/ar/ae",
    icon: "🇦🇪",
    title: "مجمع أدوات وحاسبات الإمارات",
    desc: "جميع الأدوات الضريبية والعمالية والمالية المخصصة للسوق الإماراتي.",
    badge: "الشامل",
    badgeColor: "bg-emerald-700 text-white font-black",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UaePurchaseOrderGeneratorPage() {
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
            <span className="text-ink font-semibold">مولد أمر الشراء</span>
          </nav>
        </div>

        {/* ── PART 1: Tool ── */}
        <UaePurchaseOrderGenerator />

        {/* ── PART 2: SEO Content ── */}
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">

            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">📖 دليل أمر الشراء للشركات في الإمارات</h2>
              <p className="text-xs text-ink-muted mt-1">للشركات والمتاجر وفرق المشتريات والمقاولين</p>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <h3 className="text-base font-extrabold text-ink">ما هو أمر الشراء؟</h3>
              <p>
                أمر الشراء (Purchase Order / PO) هو وثيقة تجارية رسمية تُصدرها الشركة المشترية للمورد،
                تُحدد فيها السلع أو الخدمات المطلوبة والكميات والأسعار وشروط التسليم والدفع.
                يُعد التزاماً رسمياً من المشتري ويُشكّل أساس العلاقة التعاقدية.
              </p>
            </div>

            {/* Document chain */}
            <div className="space-y-3">
              <h3 className="text-base font-extrabold text-ink">دورة المستندات التجارية: عرض السعر ← أمر الشراء ← الفاتورة</h3>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                {[
                  { icon: "📋", title: "عرض السعر", desc: "المورد يُقدم الأسعار", color: "border-amber-200 bg-amber-50/60", tc: "text-amber-900" },
                  { icon: "→", title: "", desc: "", color: "border-transparent bg-transparent", tc: "text-ink-muted flex items-center justify-center text-xl" },
                  { icon: "📦", title: "أمر الشراء", desc: "المشتري يُؤكد الطلب", color: "border-indigo-200 bg-indigo-50/60", tc: "text-indigo-900" },
                  { icon: "→", title: "", desc: "", color: "border-transparent bg-transparent", tc: "text-ink-muted flex items-center justify-center text-xl" },
                  { icon: "🧾", title: "الفاتورة", desc: "المورد يُطالب بالدفع", color: "border-emerald-200 bg-emerald-50/60", tc: "text-emerald-900" },
                ].map((step, i) => (
                  step.title ? (
                    <div key={i} className={`flex-1 rounded-xl border ${step.color} p-3 text-center`}>
                      <p className="text-xl mb-1">{step.icon}</p>
                      <p className={`text-xs font-extrabold ${step.tc}`}>{step.title}</p>
                      <p className="text-[11px] text-ink-muted">{step.desc}</p>
                    </div>
                  ) : (
                    <div key={i} className={`hidden sm:flex items-center ${step.tc}`}>{step.icon}</div>
                  )
                ))}
              </div>
            </div>

            {/* Required fields */}
            <div className="space-y-3">
              <h3 className="text-base font-extrabold text-ink">ما البيانات التي يجب أن يتضمنها أمر الشراء؟</h3>
              <div className="grid gap-2 sm:grid-cols-2 text-xs">
                {[
                  { icon: "✅", label: "رقم أمر الشراء التسلسلي وتاريخ الإصدار" },
                  { icon: "✅", label: "اسم وبيانات الشركة المشترية" },
                  { icon: "✅", label: "اسم وبيانات المورد" },
                  { icon: "✅", label: "تاريخ التسليم المتوقع" },
                  { icon: "✅", label: "وصف تفصيلي للبنود والكميات والأسعار" },
                  { icon: "✅", label: "الخصومات وضريبة VAT إن طُبّقت" },
                  { icon: "✅", label: "شروط الدفع والتسليم" },
                  { icon: "✅", label: "مرجع عرض السعر إن وجد" },
                  { icon: "✅", label: "توقيع المُعِد والمعتمد وإقرار المورد" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                    <span className="text-emerald-600 shrink-0">{item.icon}</span>
                    <span className="text-ink-secondary">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* VAT in PO */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
              <h3 className="text-base font-extrabold text-blue-900">هل يمكن إضافة VAT إلى أمر الشراء؟</h3>
              <p className="text-xs text-blue-800 leading-relaxed">
                نعم، يمكن إدراج VAT 5% في أمر الشراء لإظهار التكلفة الإجمالية المتوقعة.
                <span className="font-bold"> لكن أمر الشراء ليس فاتورة ضريبية. </span>
                لاسترداد ضريبة المدخلات، تحتاج إلى الفاتورة الضريبية الرسمية من المورد بعد إتمام التوريد.
              </p>
            </div>

            {/* How to use */}
            <div className="space-y-3">
              <h3 className="text-base font-extrabold text-ink">كيفية إنشاء أمر شراء احترافي بهذه الأداة</h3>
              <ol className="space-y-2 text-sm text-ink-secondary leading-relaxed">
                {[
                  "أدخل رقم أمر الشراء، تاريخ الإصدار، وتاريخ التسليم المتوقع",
                  "أضف بيانات شركتك (المشتري) والمورد",
                  "أضف بنود الطلب مع الوصف والكميات والأسعار وكود الصنف SKU",
                  "أضف الخصومات وفعّل VAT إذا كان المورد مسجلاً",
                  "أضف الرسوم الإضافية (شحن، تركيب) إن وجدت",
                  "حدد شروط التسليم والدفع والضمان",
                  "استخدم فحص الاكتمال للتأكد من اكتمال الحقول الأساسية",
                  "احفظ المسودة، راجع المعاينة، ثم اطبع أو احفظ PDF",
                  "أرسله للمورد للإقرار والتوقيع",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-[11px] text-ink-muted border-t border-brand-border pt-3">
              هذه الأداة للأغراض التجارية التنظيمية فقط — ليست مرتبطة بالهيئة الاتحادية للضرائب (FTA) ولا تحمل اعتمادها.
            </p>
          </div>
        </section>

        {/* ── PART 3: Worked Example ── */}
        <section className="mx-auto max-w-3xl px-4 py-2">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-4">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">🔢 مثال توضيحي عملي</h2>
              <p className="text-xs text-ink-muted mt-1">أمر شراء لمعدات مكتبية</p>
            </div>
            <div className="rounded-xl border border-brand-border/80 p-4 space-y-2">
              <h3 className="text-sm font-extrabold text-ink">مثال — شراء كراسي مكتبية</h3>
              <div className="text-xs text-ink-secondary space-y-1">
                <div className="grid grid-cols-3 gap-2 font-bold text-ink border-b border-slate-200 pb-1 mb-2">
                  <span>البند</span><span className="text-left" dir="ltr">السعر</span><span className="text-left" dir="ltr">الإجمالي</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                  <span>كرسي مكتبي مع ظهر داعم</span>
                  <span dir="ltr" className="text-left">250 درهم × 10</span>
                  <span dir="ltr" className="text-left font-bold text-ink">2,500.00 درهم</span>
                </div>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between text-ink-secondary"><span>المجموع قبل الخصم</span><span dir="ltr">2,500.00 درهم</span></div>
                <div className="flex justify-between text-rose-700"><span>خصم</span><span dir="ltr">- 100.00 درهم</span></div>
                <div className="flex justify-between text-ink-secondary"><span>القيمة الخاضعة لـ 5%</span><span dir="ltr">2,400.00 درهم</span></div>
                <div className="flex justify-between text-blue-700 font-bold"><span>ضريبة القيمة المضافة 5%</span><span dir="ltr">120.00 درهم</span></div>
                <div className="flex justify-between text-indigo-700 font-black text-sm border-t border-slate-200 pt-1 mt-1"><span>الإجمالي النهائي</span><span dir="ltr">2,520.00 درهم</span></div>
              </div>
              <p className="text-[11px] text-ink-muted mt-2">
                شروط الدفع: 50% مقدماً و50% عند التسليم — التسليم خلال 7 أيام عمل — <span className="font-bold">مثال توضيحي فقط</span>
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
            title="🔗 أدوات تجارية وضريبية ذات صلة بدولة الإمارات"
            subtitle="سلسلة متكاملة: عرض سعر → أمر شراء → فاتورة ضريبية"
            tools={relatedTools}
          />
        </section>

      </main>
    </>
  );
}
