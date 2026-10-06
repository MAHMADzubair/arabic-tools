import UaeVatInvoiceGenerator from "@/components/UaeVatInvoiceGenerator";
import Link from "next/link";
import { SITE_URL, SITE_ORG_ID } from "@/lib/siteConfig";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata = {
  title: "مولد فاتورة ضريبية الإمارات 2026 | VAT Invoice PDF",
  description:
    "أنشئ فاتورة ضريبية في الإمارات بالدرهم AED مع ضريبة VAT 5% وحقول TRN والفاتورة الكاملة أو المبسطة، ثم اطبعها أو احفظها PDF.",
  keywords: [
    "مولد فاتورة ضريبية الإمارات",
    "نموذج فاتورة ضريبية الإمارات",
    "فاتورة ضريبية PDF الإمارات",
    "فاتورة ضريبية 5%",
    "فاتورة ضريبية كاملة الإمارات",
    "فاتورة ضريبية مبسطة الإمارات",
    "UAE VAT Invoice Generator",
    "FTA Tax Invoice UAE",
    "Tax Invoice PDF UAE",
  ],
  alternates: {
    canonical: "/ar/ae/vat-invoice-generator",
  },
  openGraph: {
    title: "مولد فاتورة ضريبية الإمارات 2026 | VAT Invoice PDF",
    description:
      "أنشئ فاتورة ضريبية في الإمارات بالدرهم AED مع VAT 5% وحقول TRN والفاتورة الكاملة أو المبسطة — اطبعها أو احفظها PDF.",
    url: `${SITE_URL}/ar/ae/vat-invoice-generator`,
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
    { "@type": "ListItem", position: 3, name: "مولد الفاتورة الضريبية", item: `${SITE_URL}/ar/ae/vat-invoice-generator` },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "مولد الفاتورة الضريبية في الإمارات — UAE VAT Invoice Generator",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
  publisher: { "@id": SITE_ORG_ID },
  description:
    "أداة مجانية لإنشاء نموذج فاتورة ضريبية قابل للطباعة للأعمال في الإمارات، مع دعم الفاتورة الكاملة والمبسطة وحساب VAT 5% وفحص مبدئي لاكتمال الحقول.",
  inLanguage: "ar",
  url: `${SITE_URL}/ar/ae/vat-invoice-generator`,
};

// 10 FAQs — visible on page and mirrored in schema
const faqs = [
  {
    q: "ما هي الفاتورة الضريبية في الإمارات؟",
    a: "الفاتورة الضريبية وثيقة تُصدرها منشأة مسجلة في ضريبة القيمة المضافة عند توريد سلع أو خدمات خاضعة للضريبة. تُتيح للمستلم المسجل المطالبة بضريبة المدخلات (Input Tax Credit)، وتُشكّل المستند المحوري في أي تدقيق ضريبي. أساسها القانوني: المرسوم بقانون اتحادي رقم 8 لسنة 2017 ولائحته التنفيذية.",
  },
  {
    q: "ما الفرق بين الفاتورة الضريبية الكاملة والمبسطة؟",
    a: "الفاتورة الكاملة تُصدر عند تجاوز قيمة التوريد 10,000 درهم لعميل مسجل في VAT، أو في كل معاملة يطلب فيها المستلم المسجل فاتورة كاملة لاسترداد ضريبة المدخلات. الفاتورة المبسطة تُستخدم في توريدات للمستهلك النهائي غير المسجل، أو حين تكون القيمة دون 10,000 درهم وفق شروط المادة 59 من اللائحة التنفيذية.",
  },
  {
    q: "هل يجب أن تحتوي الفاتورة على رقم TRN؟",
    a: "نعم. الرقم الضريبي للمورد (TRN) إلزامي في كلا النوعين — الكاملة والمبسطة. أما TRN العميل فيُشترط في الفاتورة الكاملة فقط إذا كان العميل مسجلاً في ضريبة القيمة المضافة. الرقم الضريبي الإماراتي مكوّن من 15 رقماً.",
  },
  {
    q: "كيف تُحسب ضريبة القيمة المضافة 5% على بند في الفاتورة؟",
    a: "تُحسب الضريبة على القيمة الخاضعة بعد الخصم. مثال: 10 وحدات × 1,000 درهم = 10,000 درهم. بعد خصم 500 درهم، القاعدة = 9,500 درهم. الضريبة = 9,500 × 5% = 475 درهم. الإجمالي = 9,975 درهم.",
  },
  {
    q: "ما الفرق بين معدل 0% والمعفى من الضريبة؟",
    a: "معدل الصفر (0%) يعني أن التوريد خاضع للضريبة لكن بمعدل صفر — كالصادرات وبعض المواد الغذائية. يحق للمورد استرداد ضريبة المدخلات المرتبطة به. أما الإعفاء، فيعني أن التوريد لا يخضع للضريبة أصلاً — كالخدمات المالية والإيجار السكني — ولا يحق معه استرداد ضريبة المدخلات. التمييز بينهما يؤثر مباشرة على قيمة الضريبة القابلة للاسترداد.",
  },
  {
    q: "هل ملف PDF يُعدّ فاتورة إلكترونية e-Invoice في الإمارات؟",
    a: "لا. الفاتورة الإلكترونية e-Invoice في الإمارات هي بيانات منظمة (Structured Data) بصيغة XML تُبادَل عبر مزود خدمة معتمد (ASP) وتُبلَّغ إلكترونياً للهيئة الاتحادية للضرائب. ملفات PDF والمستندات المطبوعة والصور ورسائل البريد الإلكتروني ليست فواتير إلكترونية بموجب هذا الإطار، حتى لو أُرسلت إلكترونياً.",
  },
  {
    q: "متى تبدأ الفوترة الإلكترونية الإلزامية في الإمارات؟",
    a: "انطلق البرنامج التجريبي والتطوعي في 1 يوليو 2026. المنشآت ذات الإيرادات السنوية ≥ 50 مليون درهم مُلزمة بالتطبيق من 1 يناير 2027 (بعد تعيين مزود ASP قبل 30 أكتوبر 2026). المنشآت الأصغر: 1 يوليو 2027. الجهات الحكومية: 1 أكتوبر 2027. مصدر: وزارة المالية الإماراتية، القرار الوزاري رقم 66 لسنة 2026.",
  },
  {
    q: "هل يمكن حفظ الفاتورة بصيغة PDF؟",
    a: "نعم. انتقل إلى تبويب «معاينة الفاتورة» ثم اضغط «طباعة». في نافذة الطباعة، اختر «حفظ كـ PDF» بدلاً من طابعة فعلية. تتم جميع العمليات محلياً في متصفحك دون رفع أي بيانات لخوادم.",
  },
  {
    q: "هل هذه الأداة معتمدة من هيئة الضرائب الاتحادية FTA؟",
    a: "لا. هذه أداة مساعدة تُنشئ نموذج فاتورة ضريبية قابل للطباعة بناءً على الحقول المنشورة في اللائحة التنفيذية. هي غير مرتبطة بالهيئة الاتحادية للضرائب ولا تُصدر فواتير إلكترونية ضمن المنظومة الرسمية. يُنصح بمراجعة مستشارك الضريبي للتحقق من انطباق المتطلبات على معاملتك.",
  },
  {
    q: "ما الفرق بين الفاتورة الضريبية والفاتورة الإلكترونية e-Invoice؟",
    a: "الفاتورة الضريبية مستند يُثبت توريداً خاضعاً لـ VAT وفق شروط المادة 59. الفاتورة الإلكترونية هي طريقة تبادل هذا المستند بتنسيق بيانات منظمة (XML) عبر شبكة PEPPOL أو ما يعادلها والإبلاغ عنها آلياً لجهة الضريبة. كل فاتورة إلكترونية هي فاتورة ضريبية، لكن ليس كل فاتورة ضريبية (مطبوعة أو PDF) هي فاتورة إلكترونية.",
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

// ─── Related tools ────────────────────────────────────────────────────────────

const relatedTools = [
  {
    href: "/ar/ae/quotation-generator",
    icon: "📋",
    title: "مولد عرض السعر في الإمارات",
    desc: "قبل إصدار الفاتورة، أنشئ عرض سعر احترافي وأرسله للعميل للموافقة.",
    badge: "الخطوة الأولى",
    badgeColor: "bg-amber-100 text-amber-800",
    cta: "عرض سعر → أمر شراء → فاتورة →",
  },
  {
    href: "/ar/ae/purchase-order-generator",
    icon: "📦",
    title: "مولد أمر الشراء LPO في الإمارات",
    desc: "أنشئ نموذج أمر شراء (LPO) بعد الموافقة على عرض السعر قبل إصدار الفاتورة.",
    badge: "LPO",
    badgeColor: "bg-indigo-100 text-indigo-800",
    cta: "→ أمر الشراء → الفاتورة الضريبية",
  },
  {
    href: "/ar/ae/vat-registration-checker",
    icon: "🏢",
    title: "حاسبة أهلية التسجيل في ضريبة القيمة المضافة",
    desc: "هل يلزمك التسجيل الإلزامي (375,000 درهم) أو الاختياري (187,500 درهم)؟",
    badge: "FTA",
    badgeColor: "bg-blue-100 text-blue-800",
    cta: "تحقق قبل إصدار الفاتورة →",
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
    href: "/ar/ae/corporate-tax-calculator",
    icon: "🏛️",
    title: "حاسبة ضريبة الشركات الإمارات",
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

export default function UaeVatInvoiceGeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <main className="min-h-screen bg-page-bg" dir="rtl">

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-ink-muted" aria-label="breadcrumb">
            <Link href="/" className="hover:text-brand transition-colors">الرئيسية</Link>
            <span aria-hidden="true">›</span>
            <Link href="/ar/ae" className="hover:text-brand transition-colors">🇦🇪 أدوات الإمارات</Link>
            <span aria-hidden="true">›</span>
            <span className="text-ink font-semibold">مولد الفاتورة الضريبية</span>
          </nav>
        </div>

        {/* ── Page Hero — H1 ─────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-2">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-700 to-violet-800 px-6 py-7 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-4xl shrink-0 mt-0.5">🧾</span>
              <div>
                <h1 className="text-2xl font-black leading-snug sm:text-3xl">
                  مولد فاتورة ضريبية في الإمارات — VAT 5% جاهزة للطباعة
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-indigo-100 max-w-xl">
                  أنشئ نموذج فاتورة ضريبية بالدرهم الإماراتي — كاملة أو مبسطة — مع حساب ضريبة القيمة
                  المضافة 5% وفحص مبدئي لاكتمال الحقول وفق اللائحة التنفيذية. اطبعها أو احفظها PDF
                  مجاناً وبدون تسجيل.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  {["AED درهم إماراتي", "VAT 5% / 0% / معفاة", "كاملة ومبسطة", "TRN المورد والعميل", "PDF + طباعة"].map((tag) => (
                    <span key={tag} className="rounded-full bg-white/20 px-3 py-1">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── GEO Answer Summary ──────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 pb-2">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs leading-relaxed shadow-sm" dir="rtl">
            <p className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider mb-2">ملخص الأداة</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex gap-2">
                <span className="shrink-0 font-extrabold text-indigo-700 w-36">ماذا تفعل الأداة؟</span>
                <span className="text-ink-secondary">تنشئ نموذج فاتورة ضريبية قابل للطباعة للأعمال في الإمارات.</span>
              </div>
              <div className="flex gap-2">
                <span className="shrink-0 font-extrabold text-indigo-700 w-36">العملة:</span>
                <span className="text-ink-secondary">الدرهم الإماراتي AED (مع دعم USD وEUR وغيرهما).</span>
              </div>
              <div className="flex gap-2">
                <span className="shrink-0 font-extrabold text-indigo-700 w-36">الضريبة القياسية:</span>
                <span className="text-ink-secondary">5% للتوريدات الخاضعة للمعدل القياسي — مع دعم 0% ومعفاة وخارج النطاق.</span>
              </div>
              <div className="flex gap-2">
                <span className="shrink-0 font-extrabold text-indigo-700 w-36">أنواع الفاتورة:</span>
                <span className="text-ink-secondary">كاملة (Full) ومبسطة (Simplified) حسب الحالة.</span>
              </div>
              <div className="flex gap-2">
                <span className="shrink-0 font-extrabold text-indigo-700 w-36">تنبيه مهم:</span>
                <span className="text-ink-secondary font-semibold">PDF أو صورة أو بريد إلكتروني ليس فاتورة إلكترونية e-Invoice ضمن المنظومة الإماراتية.</span>
              </div>
              <div className="flex gap-2">
                <span className="shrink-0 font-extrabold text-indigo-700 w-36">الجهة المرجعية:</span>
                <a href="https://tax.gov.ae" target="_blank" rel="noopener noreferrer"
                  className="text-indigo-700 hover:underline">الهيئة الاتحادية للضرائب — FTA</a>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <span className="shrink-0 font-extrabold text-indigo-700 w-36">آخر مراجعة:</span>
                <span className="text-ink-secondary">أكتوبر 2026</span>
              </div>
            </div>
            <p className="mt-2 pt-2 border-t border-indigo-100 text-[11px] text-ink-muted">
              ⚠️ هذه أداة مساعدة — ليست مرتبطة بالهيئة الاتحادية للضرائب ولا تُصدر فواتير إلكترونية ضمن المنظومة الرسمية.
            </p>
          </div>
        </div>

        {/* ── PART 1: Tool ── */}
        <UaeVatInvoiceGenerator />

        {/* ══════════════════════════════════════════════════════════════════
            PART 2: Editorial Content
        ══════════════════════════════════════════════════════════════════ */}
        <div className="mx-auto max-w-3xl px-4 space-y-6 pb-4">

          {/* ── Section 1: ما هي الفاتورة الضريبية ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">📄</span>
              ما هي الفاتورة الضريبية في الإمارات؟
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                الفاتورة الضريبية وثيقة تُصدرها منشأة مسجلة في ضريبة القيمة المضافة عند توريد سلع أو
                خدمات خاضعة للضريبة. تُتيح للمستلم المسجل المطالبة بضريبة المدخلات (Input Tax Credit)،
                وتُشكّل المستند المرجعي في أي إجراء تدقيق من قِبل الهيئة الاتحادية للضرائب.
              </p>
              <p>
                أساسها القانوني: <strong className="text-ink">المرسوم بقانون اتحادي رقم 8 لسنة 2017</strong> ولائحته التنفيذية،
                وتحديداً <strong className="text-ink">المادة 59</strong> التي تُحدد البيانات الإلزامية للفاتورة الكاملة والمبسطة.
                يُلزم النظام كل منشأة مسجلة بإصدار الفاتورة خلال{" "}
                <strong className="text-ink">14 يوماً</strong> من تاريخ التوريد.
              </p>
              <p>
                تُختلف الفاتورة الضريبية عن فاتورة التسوية التجارية العادية في كونها مستنداً ذا أثر
                ضريبي قانوني — أي أنها تُتيح أو تُقيّد حق استرداد الضريبة لدى الطرفين.
              </p>
            </div>
          </section>

          {/* ── Section 2: Full vs Simplified ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">⚖️</span>
              الفاتورة الكاملة والمبسطة — متى تستخدم كلاً منهما؟
            </h2>
            <p className="text-sm text-ink-secondary mb-5 leading-relaxed">
              وفق المادة 59 من اللائحة التنفيذية لضريبة القيمة المضافة، يُصدر المورد المسجل نوعين
              من الفاتورة حسب طبيعة المعاملة:
            </p>
            <div className="grid gap-4 sm:grid-cols-2 mb-5">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-3">
                <h3 className="text-sm font-extrabold text-indigo-900 flex items-center gap-2">
                  <span>📄</span>فاتورة ضريبية كاملة — Full Tax Invoice
                </h3>
                <ul className="text-xs text-indigo-800 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>قيمة التوريد تتجاوز <strong>10,000 درهم</strong> لعميل مسجل في VAT</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>العميل المسجل يحتاج لاسترداد ضريبة المدخلات</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>يشترط TRN المورد وTRN العميل والبيانات الكاملة</span></li>
                </ul>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
                <h3 className="text-sm font-extrabold text-emerald-900 flex items-center gap-2">
                  <span>🧾</span>فاتورة ضريبية مبسطة — Simplified Tax Invoice
                </h3>
                <ul className="text-xs text-emerald-800 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>التوريد للمستهلك النهائي <strong>غير المسجل</strong> في VAT</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>أو قيمة التوريد ≤ 10,000 درهم وفق شروط المادة 59</span></li>
                  <li className="flex items-start gap-1.5"><span className="shrink-0 mt-0.5">•</span><span>TRN المورد إلزامي — بيانات العميل التفصيلية غير مطلوبة</span></li>
                </ul>
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>تنبيه مهم:</strong> إذا تجاوزت قيمة الفاتورة 10,000 درهم وكان العميل مسجلاً في
                ضريبة القيمة المضافة، فالفاتورة الكاملة هي المتطلب الصحيح. الأداة تُنبّهك تلقائياً
                عند اختيار الفاتورة المبسطة في هذه الحالة. راجع المادة 59 من اللائحة التنفيذية
                أو مستشارك الضريبي للتأكد من انطباق الشروط على معاملتك.
              </p>
            </div>
          </section>

          {/* ── Section 3: Mandatory fields ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              البيانات الإلزامية في الفاتورة الضريبية الكاملة (المادة 59)
            </h2>
            <p className="text-sm text-ink-secondary mb-4 leading-relaxed">
              تُساعدك هذه الأداة على إدخال الحقول الأساسية. التحقق النهائي من استيفاء جميع
              المتطلبات يبقى مسؤولية المنشأة أو مستشارها الضريبي.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              {[
                { icon: "✅", label: 'عبارة "فاتورة ضريبية / Tax Invoice"',         note: "عنوان الوثيقة" },
                { icon: "✅", label: "اسم المورد وعنوانه والرقم الضريبي TRN",         note: "15 رقماً" },
                { icon: "✅", label: "اسم العميل وعنوانه وTRN إذا كان مسجلاً",       note: "الفاتورة الكاملة" },
                { icon: "✅", label: "رقم الفاتورة التسلسلي الفريد",                  note: "غير قابل للتكرار" },
                { icon: "✅", label: "تاريخ الإصدار",                                 note: "مطلوب دائماً" },
                { icon: "✅", label: "تاريخ التوريد (إذا اختلف عن الإصدار)",          note: "يُضاف عند الاختلاف" },
                { icon: "✅", label: "وصف البنود والكميات وسعر الوحدة",              note: "لكل بند" },
                { icon: "✅", label: "الخصومات لكل بند (إن وجدت)",                  note: "قبل احتساب الضريبة" },
                { icon: "✅", label: "معدل الضريبة المطبق على كل بند",               note: "5% / 0% / معفاة / خ.ن" },
                { icon: "✅", label: "المبلغ الخاضع للضريبة لكل معدل",              note: "مجموع كل فئة" },
                { icon: "✅", label: "مبلغ الضريبة المحصلة",                        note: "بالدرهم الإماراتي" },
                { icon: "✅", label: "الإجمالي الكلي شامل الضريبة",                 note: "AED" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                  <span className="text-emerald-600 shrink-0 text-base">{item.icon}</span>
                  <div>
                    <span className="font-bold text-ink">{item.label}</span>
                    <p className="text-ink-muted mt-0.5">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 4: VAT categories ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">🔢</span>
              فئات ضريبة القيمة المضافة في الإمارات
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  color: "border-blue-200 bg-blue-50/60", tc: "text-blue-900",
                  title: "5% — خاضعة للمعدل القياسي",
                  desc: "المعدل الأساسي على معظم توريدات السلع والخدمات في الإمارات. تُحصَّل من العميل وتُورَّد لهيئة الضرائب. يحق للمورد استرداد ضريبة المدخلات المرتبطة بها.",
                },
                {
                  color: "border-emerald-200 bg-emerald-50/60", tc: "text-emerald-900",
                  title: "0% — صفرية المعدل",
                  desc: "التوريد خاضع للضريبة لكن بمعدل صفر — يشمل الصادرات الدولية وبعض المواد الغذائية الأساسية والأدوية وخدمات النقل الدولي. يحق للمورد استرداد ضريبة المدخلات كاملاً.",
                },
                {
                  color: "border-amber-200 bg-amber-50/60", tc: "text-amber-900",
                  title: "معفاة — Exempt",
                  desc: "التوريد لا يخضع للضريبة — يشمل الخدمات المالية المحددة وإيجار العقار السكني. لا يحق للمورد استرداد ضريبة المدخلات المنسوبة لهذه التوريدات. التمييز عن 0% أثره على المطالبات الضريبية.",
                },
                {
                  color: "border-slate-200 bg-slate-50/60", tc: "text-slate-900",
                  title: "خارج النطاق — Out of Scope",
                  desc: "توريدات لا تندرج ضمن نطاق ضريبة القيمة المضافة الإماراتية أصلاً — كبعض التحويلات التي تُعدّ خارج النظام الضريبي. لا ضريبة ولا حق استرداد مدخلات.",
                },
              ].map((cat, i) => (
                <div key={i} className={`rounded-xl border ${cat.color} p-4 space-y-1.5`}>
                  <h3 className={`text-xs font-extrabold ${cat.tc}`}>{cat.title}</h3>
                  <p className="text-xs text-ink-secondary leading-relaxed">{cat.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 5: PDF vs Tax Invoice vs e-Invoice comparison ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">📡</span>
              ما الفرق بين الفاتورة الضريبية والفاتورة الإلكترونية في الإمارات؟
            </h2>
            <p className="text-sm text-ink-secondary mb-5 leading-relaxed">
              ثلاثة مفاهيم مختلفة كثيراً ما يقع فيها الخلط — الجدول التالي يُوضح الفروق الجوهرية:
            </p>

            <div className="overflow-x-auto -mx-1 mb-5">
              <table className="w-full text-xs border-collapse min-w-[540px]">
                <thead>
                  <tr className="bg-indigo-50 text-indigo-900">
                    <th className="border border-indigo-200 px-3 py-2.5 text-right font-extrabold w-1/4">المعيار</th>
                    <th className="border border-indigo-200 px-3 py-2.5 text-center font-extrabold">📄 فاتورة ضريبية (PDF/مطبوعة)</th>
                    <th className="border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-center font-extrabold text-emerald-900">⚡ فاتورة إلكترونية e-Invoice</th>
                  </tr>
                </thead>
                <tbody className="text-ink-secondary">
                  {[
                    ["الغرض",             "إثبات التوريد الضريبي",                  "إثبات التوريد + إبلاغ آلي للجهة الضريبية"],
                    ["التنسيق",           "PDF، ورق، صورة",                         "بيانات منظمة XML عبر شبكة PEPPOL"],
                    ["بيانات منظمة؟",     "لا",                                     "نعم — قابلة للمعالجة الآلية"],
                    ["إبلاغ FTA آلياً؟", "لا — يدوي عبر الإقرار الضريبي",          "نعم — عبر مزود خدمة معتمد (ASP)"],
                    ["هل هذا المولد يُنشئه؟", "نعم — نموذج قابل للطباعة",           "لا — هذه الأداة لا تُنتج e-Invoice"],
                  ].map(([criterion, pdf, einv], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="border border-slate-200 px-3 py-2 font-bold text-ink">{criterion}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center">{pdf}</td>
                      <td className="border border-emerald-100 px-3 py-2 text-center">{einv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-4 space-y-2">
              <p className="text-xs font-extrabold text-rose-900 flex items-center gap-1.5">
                <span>⚠️</span><span>ما ليس فاتورة إلكترونية e-Invoice</span>
              </p>
              <ul className="space-y-1 text-xs text-rose-800 leading-relaxed">
                {[
                  "ملف PDF مرسل بالبريد الإلكتروني",
                  "مستند Word أو Excel",
                  "صورة أو مسح ضوئي (scan) لفاتورة ورقية",
                  "بريد إلكتروني يحتوي على بيانات الفاتورة",
                  "أي نموذج مطبوع، بصرف النظر عن كيفية إرساله",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="text-rose-500 font-black">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-rose-700 pt-1">
                مصدر: إطار الفوترة الإلكترونية الإماراتي — وزارة المالية والهيئة الاتحادية للضرائب.
              </p>
            </div>
          </section>

          {/* ── Section 6: e-Invoicing Timeline Oct 2026 ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-2 flex items-center gap-2">
              <span className="text-2xl">📅</span>
              الوضع الراهن للفوترة الإلكترونية — أكتوبر 2026
            </h2>
            <p className="text-xs text-ink-muted mb-5">
              وفق القرار الوزاري رقم 244 لسنة 2025 وتعديله بالقرار الوزاري رقم 66 لسنة 2026 — وزارة المالية الإماراتية
            </p>

            {/* Timeline table */}
            <div className="overflow-x-auto -mx-1 mb-5">
              <table className="w-full text-xs border-collapse min-w-[540px]">
                <thead>
                  <tr className="bg-slate-100 text-ink">
                    <th className="border border-slate-200 px-3 py-2.5 text-right font-extrabold">الفئة</th>
                    <th className="border border-slate-200 px-3 py-2.5 text-center font-extrabold">موعد تعيين ASP</th>
                    <th className="border border-slate-200 px-3 py-2.5 text-center font-extrabold">بدء التطبيق الإلزامي</th>
                    <th className="border border-slate-200 px-3 py-2.5 text-center font-extrabold">الوضع الآن</th>
                  </tr>
                </thead>
                <tbody className="text-ink-secondary">
                  <tr className="bg-white">
                    <td className="border border-slate-200 px-3 py-2 font-bold text-ink">إيرادات سنوية ≥ 50 مليون درهم</td>
                    <td className="border border-slate-200 px-3 py-2 text-center font-bold text-amber-700">30 أكتوبر 2026 ⬅️</td>
                    <td className="border border-slate-200 px-3 py-2 text-center font-bold text-red-700">1 يناير 2027</td>
                    <td className="border border-emerald-100 px-3 py-2 text-center">
                      <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 font-bold">الموعد قادم</span>
                    </td>
                  </tr>
                  <tr className="bg-slate-50/60">
                    <td className="border border-slate-200 px-3 py-2 font-bold text-ink">إيرادات سنوية &lt; 50 مليون درهم</td>
                    <td className="border border-slate-200 px-3 py-2 text-center">31 مارس 2027</td>
                    <td className="border border-slate-200 px-3 py-2 text-center font-bold text-slate-700">1 يوليو 2027</td>
                    <td className="border border-slate-100 px-3 py-2 text-center">
                      <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 font-bold">مرحلة لاحقة</span>
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-slate-200 px-3 py-2 font-bold text-ink">الجهات الحكومية</td>
                    <td className="border border-slate-200 px-3 py-2 text-center">31 مارس 2027</td>
                    <td className="border border-slate-200 px-3 py-2 text-center font-bold text-slate-700">1 أكتوبر 2027</td>
                    <td className="border border-slate-100 px-3 py-2 text-center">
                      <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 font-bold">مرحلة لاحقة</span>
                    </td>
                  </tr>
                  <tr className="bg-slate-50/60">
                    <td className="border border-slate-200 px-3 py-2 font-bold text-ink">معاملات B2C</td>
                    <td className="border border-slate-200 px-3 py-2 text-center">—</td>
                    <td className="border border-slate-200 px-3 py-2 text-center">مستثناة حالياً</td>
                    <td className="border border-slate-100 px-3 py-2 text-center">
                      <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 font-bold">خارج النطاق الآن</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <div className="flex items-start gap-2 rounded-xl border border-indigo-200 bg-indigo-50/40 p-3">
                <span className="text-indigo-500 font-bold shrink-0 mt-0.5">ℹ</span>
                <p className="text-xs text-indigo-900 leading-relaxed">
                  <strong>البرنامج التجريبي والتطوعي:</strong> انطلق من 1 يوليو 2026 للمنشآت التي استوفت
                  المتطلبات التقنية وانضمت بموافقتها. الفوترة الإلكترونية تشمل معاملات B2B وB2G وG2B وG2G.
                </p>
              </div>
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <span className="text-amber-600 font-bold shrink-0 mt-0.5">⚠</span>
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>تعديل مهم (القرار 66/2026):</strong> مُدِّد موعد تعيين مزود الخدمة المعتمد (ASP)
                  من 31 يوليو 2026 إلى <strong>30 أكتوبر 2026</strong> للفئة الأولى (≥ 50 مليون درهم).
                  موعد البدء الإلزامي في 1 يناير 2027 لم يتغير.
                </p>
              </div>
            </div>

            {/* Official sources inline */}
            <div className="mt-4 space-y-2">
              {[
                {
                  title: "وزارة المالية — بوابة الفوترة الإلكترونية",
                  url: "https://mof.gov.ae/en/e-invoicing/",
                  desc: "البوابة الرسمية لبرنامج الفوترة الإلكترونية الإماراتي.",
                },
                {
                  title: "قرار وزارة المالية رقم 66 لسنة 2026 — التعديل",
                  url: "https://mof.gov.ae/en/news/ministry-of-finance-announces-targeted-amendments-to-einvoicing-system-decisions/",
                  desc: "الإعلان الرسمي عن تمديد موعد ASP إلى 30 أكتوبر 2026.",
                },
                {
                  title: "الهيئة الاتحادية للضرائب — الفوترة الإلكترونية",
                  url: "https://tax.gov.ae/en/e-invoicing",
                  desc: "إرشادات FTA ومتطلبات التسجيل في منظومة الفوترة الإلكترونية.",
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

          {/* ── Section 7: Worked Examples ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-1 flex items-center gap-2">
              <span className="text-2xl">🔢</span>
              أمثلة عملية
            </h2>
            <p className="text-xs text-ink-muted mb-5">مثال توضيحي — الأسماء والأرقام افتراضية</p>

            <div className="space-y-4">
              {/* Example 1 */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-extrabold text-indigo-900">مثال 1 — فاتورة كاملة B2B (أكثر من 10,000 درهم)</h3>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">فاتورة كاملة</span>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  شركة استشارات هندسية تُصدر فاتورة لشركة مقاولات مسجلة:
                  10 ساعات × 1,500 درهم = 15,000 درهم. خصم 500 درهم. القاعدة الخاضعة: 14,500 درهم.
                </p>
                <div className="rounded-lg bg-white border border-indigo-100 p-3 text-xs space-y-1 font-mono">
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">الإجمالي قبل الخصم</span><span className="font-bold">15,000.00 AED</span></div>
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">الخصم</span><span className="font-bold text-rose-600">- 500.00 AED</span></div>
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">القاعدة الخاضعة (5%)</span><span className="font-bold">14,500.00 AED</span></div>
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">ضريبة القيمة المضافة 5%</span><span className="font-bold text-blue-700">725.00 AED</span></div>
                  <div className="flex justify-between border-t pt-1"><span className="font-sans font-bold text-ink">الإجمالي النهائي</span><span className="font-black text-indigo-800">15,225.00 AED</span></div>
                </div>
                <p className="text-[11px] text-amber-800 bg-amber-50 rounded p-1.5">
                  يشترط إصدار فاتورة كاملة مع TRN المورد وTRN العميل — القيمة تتجاوز 10,000 درهم والعميل مسجل.
                </p>
              </div>

              {/* Example 2 */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-extrabold text-emerald-900">مثال 2 — فاتورة مبسطة B2C</h3>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">فاتورة مبسطة</span>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  مطعم يُصدر فاتورة لزبون غير مسجل في VAT: وجبة 1,200 درهم + مشروبات 100 درهم.
                </p>
                <div className="rounded-lg bg-white border border-emerald-100 p-3 text-xs space-y-1 font-mono">
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">إجمالي الخدمات</span><span className="font-bold">1,300.00 AED</span></div>
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">ضريبة القيمة المضافة 5%</span><span className="font-bold text-blue-700">65.00 AED</span></div>
                  <div className="flex justify-between border-t pt-1"><span className="font-sans font-bold text-ink">الإجمالي</span><span className="font-black text-emerald-800">1,365.00 AED</span></div>
                </div>
                <p className="text-[11px] text-emerald-800 bg-emerald-50 rounded p-1.5">
                  فاتورة مبسطة مقبولة — العميل غير مسجل. TRN المورد إلزامي حتى في الفاتورة المبسطة.
                </p>
              </div>

              {/* Example 3 */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-extrabold text-amber-900">مثال 3 — فاتورة مختلطة (5% و0% ومعفاة)</h3>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">مختلطة</span>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  شركة توريد: إلكترونيات 15,000 AED (5%) + صادرات غذائية 5,000 AED (0%) + خدمة مالية 800 AED (معفاة).
                </p>
                <div className="rounded-lg bg-white border border-amber-100 p-3 text-xs space-y-1 font-mono">
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">إلكترونيات 15,000 × 5%</span><span className="font-bold text-blue-700">750.00 AED ضريبة</span></div>
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">صادرات 5,000 × 0%</span><span className="font-bold text-emerald-700">0.00 AED ضريبة</span></div>
                  <div className="flex justify-between"><span className="font-sans text-ink-secondary">خدمة مالية (معفاة)</span><span className="font-bold text-amber-700">0.00 AED ضريبة</span></div>
                  <div className="flex justify-between border-t pt-1"><span className="font-sans font-bold text-ink">الإجمالي شامل الضريبة</span><span className="font-black text-amber-800">21,550.00 AED</span></div>
                </div>
                <p className="text-[11px] text-amber-800 bg-amber-50 rounded p-1.5">
                  كل فئة تظهر منفصلة في الفاتورة. ضريبة المدخلات قابلة للاسترداد للبنود الخاضعة (5%) والصفرية فقط — ليس للمعفاة.
                </p>
              </div>
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
                  title: "الهيئة الاتحادية للضرائب — الدليل الإرشادي لضريبة القيمة المضافة",
                  url: "https://tax.gov.ae/en/taxes/vat/guides.aspx",
                  desc: "الأحكام الشاملة لـ VAT في الإمارات بما فيها اشتراطات الفاتورة.",
                },
                {
                  title: "FTA — متطلبات الفاتورة الضريبية (المادة 59)",
                  url: "https://tax.gov.ae/en/taxes/vat/taxinvoice.aspx",
                  desc: "الحقول الإلزامية للفاتورة الكاملة والمبسطة وشروط إصدارهما.",
                },
                {
                  title: "الهيئة الاتحادية للضرائب — الفوترة الإلكترونية",
                  url: "https://tax.gov.ae/en/e-invoicing",
                  desc: "إطار e-Invoice الإماراتي ومتطلبات التسجيل مع مزود ASP معتمد.",
                },
                {
                  title: "وزارة المالية — بوابة الفوترة الإلكترونية الإماراتية",
                  url: "https://mof.gov.ae/en/e-invoicing/",
                  desc: "البوابة الرسمية لبرنامج الفوترة الإلكترونية — جداول التطبيق والمزودون المعتمدون.",
                },
                {
                  title: "وزارة المالية — القرار الوزاري رقم 66 لسنة 2026 (التعديل)",
                  url: "https://mof.gov.ae/en/news/ministry-of-finance-announces-targeted-amendments-to-einvoicing-system-decisions/",
                  desc: "تعديل موعد تعيين ASP من 31 يوليو 2026 إلى 30 أكتوبر 2026 للفئة ≥ 50 مليون درهم.",
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

        {/* ── PART 3: FAQ ─────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-2">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-5">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">❓ الأسئلة الشائعة</h2>
              <p className="text-xs text-ink-muted mt-1">أكثر الأسئلة تكراراً حول الفاتورة الضريبية الإماراتية</p>
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

        {/* ── PART 4: Related Tools ──────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-6 pb-12">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <div className="border-b border-brand-border pb-4 mb-5">
              <h2 className="text-lg font-extrabold text-ink">🔗 أدوات ضريبية وتجارية ذات صلة — الإمارات</h2>
              <p className="text-xs text-ink-muted mt-1">دورة وثائق الأعمال: عرض سعر → أمر شراء → فاتورة ضريبية → حاسبات VAT</p>
            </div>

            {/* Workflow strip */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-5 text-xs">
              {[
                { icon: "📋", label: "عرض السعر",       href: "/ar/ae/quotation-generator",       color: "border-amber-200  bg-amber-50",   tc: "text-amber-900"  },
                { arrow: true },
                { icon: "📦", label: "أمر الشراء LPO",  href: "/ar/ae/purchase-order-generator",  color: "border-indigo-200 bg-indigo-50",  tc: "text-indigo-900" },
                { arrow: true },
                { icon: "🧾", label: "الفاتورة الضريبية", href: null,                              color: "border-indigo-400 bg-indigo-100", tc: "text-indigo-900" },
                { arrow: true },
                { icon: "🧮", label: "حاسبة VAT",       href: "/vat-calculator/uae",              color: "border-purple-200 bg-purple-50",  tc: "text-purple-900" },
              ].map((step, i) =>
                step.arrow ? (
                  <div key={i} className="hidden sm:flex items-center text-ink-muted font-black">→</div>
                ) : step.href ? (
                  <Link key={i} href={step.href}
                    className={`flex-1 rounded-xl border ${step.color} p-2.5 text-center hover:opacity-80 transition-opacity`}>
                    <p className="text-lg mb-0.5">{step.icon}</p>
                    <p className={`font-extrabold ${step.tc}`}>{step.label}</p>
                  </Link>
                ) : (
                  <div key={i}
                    className={`flex-1 rounded-xl border-2 ${step.color} p-2.5 text-center`}>
                    <p className="text-lg mb-0.5">{step.icon}</p>
                    <p className={`font-extrabold ${step.tc}`}>{step.label}</p>
                    <p className="text-[10px] font-bold text-indigo-600">أنت هنا</p>
                  </div>
                )
              )}
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
