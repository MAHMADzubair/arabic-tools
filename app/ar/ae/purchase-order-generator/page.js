import UaePurchaseOrderGenerator from "@/components/UaePurchaseOrderGenerator";
import Link from "next/link";
import RelatedBusinessTools from "@/components/business/RelatedBusinessTools";
import { SITE_URL, SITE_ORG_ID } from "@/lib/siteConfig";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata = {
  title: "نموذج أمر شراء الإمارات | مولد LPO PDF جاهز 2026",
  description:
    "أنشئ نموذج أمر شراء LPO في الإمارات بالدرهم AED، مع بيانات المورد والأصناف وضريبة القيمة المضافة وشروط التسليم، ثم اطبعه أو احفظه PDF.",
  keywords: [
    "نموذج أمر شراء الإمارات",
    "LPO الإمارات",
    "نموذج LPO جاهز",
    "نموذج أمر شراء بالعربي",
    "نموذج أمر شراء مع ضريبة القيمة المضافة",
    "Purchase Order UAE",
    "أمر شراء PDF",
    "نموذج أمر شراء بالإنجليزي",
  ],
  alternates: {
    canonical: "/ar/ae/purchase-order-generator",
  },
  openGraph: {
    title: "نموذج أمر شراء الإمارات | مولد LPO PDF جاهز 2026",
    description:
      "أنشئ نموذج أمر شراء LPO في الإمارات بالدرهم AED مع بيانات المورد والأصناف وضريبة القيمة المضافة، واطبعه أو احفظه PDF مباشرة.",
    url: `${SITE_URL}/ar/ae/purchase-order-generator`,
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
    { "@type": "ListItem", position: 3, name: "مولد نموذج أمر الشراء LPO", item: `${SITE_URL}/ar/ae/purchase-order-generator` },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "مولد نموذج أمر شراء الإمارات — LPO Generator",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
  publisher: { "@id": SITE_ORG_ID },
  description:
    "أداة مجانية لإنشاء نماذج أوامر شراء (Purchase Order / LPO) بالعربية والإنجليزية للشركات في الإمارات، مع دعم ضريبة القيمة المضافة 5% والطباعة وحفظ PDF.",
  inLanguage: "ar",
  url: `${SITE_URL}/ar/ae/purchase-order-generator`,
};

// 8 FAQs — visible on page and mirrored in schema
const faqs = [
  {
    q: "ما هو LPO في الإمارات؟",
    a: "LPO اختصار لـ Local Purchase Order، أي أمر الشراء المحلي. يُستخدم هذا المصطلح على نطاق واسع في بيئة الأعمال الإماراتية والخليجية للإشارة إلى وثيقة الشراء الرسمية التي يُصدرها المشتري للمورد المحلي. لا يختلف في جوهره عن مصطلح Purchase Order (PO)، لكنه يُعني تحديداً التوريد داخل الدولة.",
  },
  {
    q: "هل أمر الشراء هو نفسه الفاتورة الضريبية؟",
    a: "لا. أمر الشراء يُصدره المشتري قبل التوريد لتأكيد الطلب وشروطه. الفاتورة الضريبية يُصدرها المورد بعد إتمام التوريد كمطالبة بالدفع، ولها أثر ضريبي قانوني يُتيح استرداد ضريبة المدخلات. استخدام أمر الشراء لا يُغني عن الفاتورة الضريبية الصادرة من المورد المسجل في VAT.",
  },
  {
    q: "هل يجب إضافة 5% VAT على أمر الشراء؟",
    a: "ليس إلزامياً، لكنه مفيد. يمكن إدراج VAT 5% في أمر الشراء لإظهار التكلفة الإجمالية المتوقعة، لا سيما عندما يكون المورد مسجلاً في ضريبة القيمة المضافة. أمر الشراء الذي يتضمن VAT هو تقدير للتكلفة الكلية — وليس مستنداً ضريبياً. الأثر الضريبي يُثبت دائماً بالفاتورة الضريبية الرسمية من المورد.",
  },
  {
    q: "هل يمكن حفظ أمر الشراء بصيغة PDF؟",
    a: "نعم. بعد إدخال البيانات، انتقل إلى تبويب «معاينة أمر الشراء» ثم انقر «طباعة / PDF». في نافذة الطباعة اختر «حفظ كـ PDF» لحفظ نسخة كاملة. الأداة تعمل محلياً في متصفحك ولا ترفع بياناتك لأي خادم.",
  },
  {
    q: "ما الفرق بين عرض السعر وأمر الشراء؟",
    a: "عرض السعر يُصدره المورد للمشتري بناءً على استفسار، ويحدد الأسعار المقترحة دون التزام بالتنفيذ. أمر الشراء يُصدره المشتري للمورد ويمثل قبولاً رسمياً لشروط العرض. يبدأ المورد عادةً تجهيز البضاعة أو تنفيذ الخدمة فقط بعد استلام أمر الشراء. الأداة تدعم استيراد بيانات عرض السعر مباشرة لإنشاء أمر الشراء.",
  },
  {
    q: "هل أمر الشراء إلزامي لكل شركة في الإمارات؟",
    a: "لا يوجد نص قانوني اتحادي يُلزم جميع الشركات باستخدام أوامر الشراء في كل معاملة. لكن كثيراً من الشركات والجهات الحكومية والمصانع تشترطه كإجراء داخلي لضبط الإنفاق ومنع المشتريات غير المرخصة وتوثيق الالتزامات التعاقدية.",
  },
  {
    q: "هل يمكن استخدام أمر الشراء عند التسجيل في VAT؟",
    a: "أشارت الهيئة الاتحادية للضرائب (FTA) في إرشادات التسجيل في ضريبة القيمة المضافة إلى أن المتقدمين قد يحتاجون لتقديم مستندات داعمة تُثبت نشاطهم التجاري كالفواتير وأوامر الشراء المحلية والعقود. لكن أمر الشراء وحده لا يضمن قبول طلب التسجيل — القرار يعود للهيئة وفق كامل ملف الطلب.",
  },
  {
    q: "هل يمكن تحويل عرض السعر إلى أمر شراء مباشرة؟",
    a: "نعم، باستخدام مولد عرض السعر الإماراتي على هذا الموقع. بعد إنشاء عرض السعر، انقر «تحويل إلى أمر شراء» وسيتم نقل بيانات المورد والأصناف والأسعار تلقائياً إلى هذا المولد. يوفر ذلك وقتاً ويُقلل أخطاء إعادة الإدخال اليدوي.",
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
    href: "/ar/ae/quotation-generator",
    icon: "📋",
    title: "مولد عرض السعر في الإمارات",
    desc: "أنشئ عرض سعر احترافي قبل إصدار أمر الشراء، ثم حوّله مباشرة بنقرة واحدة.",
    badge: "الخطوة الأولى",
    badgeColor: "bg-amber-100 text-amber-800",
    cta: "عرض السعر → أمر الشراء →",
  },
  {
    href: "/ar/ae/vat-invoice-generator",
    icon: "🧾",
    title: "مولد الفاتورة الضريبية في الإمارات",
    desc: "بعد إتمام التوريد، أنشئ فاتورة ضريبية كاملة B2B أو مبسطة B2C مع 5% VAT.",
    badge: "FTA VAT",
    badgeColor: "bg-indigo-100 text-indigo-800",
    cta: "→ أمر الشراء → الفاتورة الضريبية",
  },
  {
    href: "/ar/ae/vat-registration-checker",
    icon: "🏢",
    title: "حاسبة أهلية التسجيل في ضريبة القيمة المضافة",
    desc: "تحقق من التزام مورديك أو شركتك بالتسجيل في VAT وفق حدود FTA.",
    badge: "FTA",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  {
    href: "/vat-calculator/uae",
    icon: "🧮",
    title: "حاسبة ضريبة القيمة المضافة الإمارات 5%",
    desc: "احسب قيمة الـ VAT أو استخرج السعر الأصلي من أي مبلغ إجمالي.",
    badge: "FTA 5%",
    badgeColor: "bg-purple-100 text-purple-800",
  },
  {
    href: "/ar/ae",
    icon: "🇦🇪",
    title: "مجمع أدوات وحاسبات الإمارات",
    desc: "جميع الأدوات الضريبية والعمالية والمالية المخصصة للسوق الإماراتي في مكان واحد.",
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

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-ink-muted" aria-label="breadcrumb">
            <Link href="/" className="hover:text-brand transition-colors">الرئيسية</Link>
            <span aria-hidden="true">›</span>
            <Link href="/ar/ae" className="hover:text-brand transition-colors">🇦🇪 أدوات الإمارات</Link>
            <span aria-hidden="true">›</span>
            <span className="text-ink font-semibold">مولد نموذج أمر الشراء LPO</span>
          </nav>
        </div>

        {/* ── Page Hero — H1 ─────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-2">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 px-6 py-7 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-4xl shrink-0 mt-0.5">📦</span>
              <div>
                <h1 className="text-2xl font-black leading-snug sm:text-3xl">
                  مولد نموذج أمر شراء في الإمارات — LPO جاهز للطباعة
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-indigo-100 max-w-xl">
                  أنشئ نموذج أمر شراء (Purchase Order / LPO) بالدرهم الإماراتي مع بيانات المورد والأصناف
                  وضريبة القيمة المضافة وشروط التسليم — اطبعه أو احفظه PDF مجاناً وبدون تسجيل.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  {["AED درهم إماراتي", "VAT 5% اختياري", "PDF + طباعة", "عربي وإنجليزي", "بدون تسجيل"].map((tag) => (
                    <span key={tag} className="rounded-full bg-white/20 px-3 py-1">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── GEO Answer Block ───────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-4 pb-2">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs leading-relaxed shadow-sm" dir="rtl">
            <p className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider mb-2">ملخص الأداة</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex gap-2">
                <span className="shrink-0 font-extrabold text-indigo-700 w-36">ماذا تقدم هذه الأداة؟</span>
                <span className="text-ink-secondary">تنشئ نموذج أمر شراء (Purchase Order / LPO) مخصصاً للأعمال في الإمارات.</span>
              </div>
              <div className="flex gap-2">
                <span className="shrink-0 font-extrabold text-indigo-700 w-36">العملة:</span>
                <span className="text-ink-secondary">الدرهم الإماراتي AED (مع دعم USD وEUR وSAR).</span>
              </div>
              <div className="flex gap-2">
                <span className="shrink-0 font-extrabold text-indigo-700 w-36">الضريبة:</span>
                <span className="text-ink-secondary">يمكن إضافة ضريبة القيمة المضافة 5% على البنود عند الحاجة.</span>
              </div>
              <div className="flex gap-2">
                <span className="shrink-0 font-extrabold text-indigo-700 w-36">تنبيه مهم:</span>
                <span className="text-ink-secondary font-semibold">أمر الشراء ليس فاتورة ضريبية ولا يحل محل Tax Invoice الرسمية.</span>
              </div>
              <div className="flex gap-2">
                <span className="shrink-0 font-extrabold text-indigo-700 w-36">الجهة المرجعية:</span>
                <a href="https://tax.gov.ae" target="_blank" rel="noopener noreferrer"
                  className="text-indigo-700 hover:underline">
                  الهيئة الاتحادية للضرائب — UAE Federal Tax Authority (FTA)
                </a>
              </div>
              <div className="flex gap-2">
                <span className="shrink-0 font-extrabold text-indigo-700 w-36">آخر مراجعة:</span>
                <span className="text-ink-secondary">أكتوبر 2026</span>
              </div>
            </div>
            <p className="mt-2 pt-2 border-t border-indigo-100 text-[11px] text-ink-muted">
              ⚠️ هذه أداة مساعدة للأغراض التنظيمية — ليست مرتبطة بالهيئة الاتحادية للضرائب ولا تحمل اعتمادها الرسمي.
            </p>
          </div>
        </div>

        {/* ── PART 1: Tool ── */}
        <UaePurchaseOrderGenerator />

        {/* ══════════════════════════════════════════════════════════════════
            PART 2: Editorial Content
        ══════════════════════════════════════════════════════════════════ */}
        <div className="mx-auto max-w-3xl px-4 space-y-6 pb-4">

          {/* ── Section 1: ما هو أمر الشراء في الإمارات ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              ما هو أمر الشراء في الإمارات؟
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                أمر الشراء (Purchase Order أو اختصاراً PO) هو وثيقة تجارية تُصدرها الشركة المشترية وتُرسلها
                إلى المورد، توضح فيها السلع أو الخدمات المطلوبة، والكميات، والأسعار المتفق عليها، وشروط
                التسليم والدفع. عند قبول المورد لهذه الوثيقة، تُشكّل أساس الاتفاق التجاري بين الطرفين.
              </p>
              <p>
                في بيئة الأعمال الإماراتية، يُعد أمر الشراء ركيزة أساسية في دورة المشتريات، لا سيما في
                الشركات متوسطة وكبيرة الحجم والجهات الحكومية والمقاولين. يُساعد على ضبط الإنفاق، وتوثيق
                الالتزامات قبل بدء التوريد، ومنع المشتريات غير المعتمدة داخلياً.
              </p>
              <p>
                يختلف أمر الشراء عن الفاتورة الضريبية من حيث الجهة المُصدِرة والغرض والأثر القانوني
                والضريبي — وهو ما يُوضحه الجدول المقارن أدناه.
              </p>
            </div>
          </section>

          {/* ── Section 2: PO vs Quotation vs Invoice comparison ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">⚖️</span>
              ما الفرق بين أمر الشراء وعرض السعر والفاتورة؟
            </h2>
            <p className="text-sm text-ink-secondary mb-5 leading-relaxed">
              يتعامل كثير من أصحاب الأعمال مع هذه المستندات الثلاثة يومياً، غير أن الخلط بينها شائع.
              الجدول التالي يُوضح الفروق الجوهرية:
            </p>

            {/* Comparison table — responsive scroll on mobile */}
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs border-collapse min-w-[580px]">
                <thead>
                  <tr className="bg-indigo-50 text-indigo-900">
                    <th className="border border-indigo-200 px-3 py-2.5 text-right font-extrabold w-1/4">المعيار</th>
                    <th className="border border-amber-200 bg-amber-50 px-3 py-2.5 text-center font-extrabold text-amber-900">📋 عرض السعر</th>
                    <th className="border border-indigo-200 px-3 py-2.5 text-center font-extrabold">📦 أمر الشراء (PO/LPO)</th>
                    <th className="border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-center font-extrabold text-emerald-900">🧾 الفاتورة الضريبية</th>
                  </tr>
                </thead>
                <tbody className="text-ink-secondary">
                  {[
                    ["من يُصدره؟",         "المورد",                    "المشتري",                       "المورد"],
                    ["متى يُستخدم؟",       "قبل الاتفاق لعرض الأسعار", "بعد الاتفاق لتأكيد الطلب",     "بعد التوريد للمطالبة بالدفع"],
                    ["الغرض الأساسي",      "اقتراح الأسعار والشروط",   "توثيق الطلب وتفاصيله الرسمية",  "إثبات التوريد والمطالبة بالدفع"],
                    ["دور ضريبة VAT",      "إظهار VAT المتوقعة",        "إظهار VAT المتوقعة (تقديري)",   "VAT رسمية — أساس استرداد ضريبة المدخلات"],
                    ["هل يطلب الدفع؟",    "لا",                        "لا",                             "نعم"],
                    ["أثر ضريبي رسمي؟",   "لا",                        "لا",                             "نعم — مستند معتمد لدى FTA"],
                  ].map(([criterion, quotation, po, invoice], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="border border-slate-200 px-3 py-2 font-bold text-ink">{criterion}</td>
                      <td className="border border-amber-100 px-3 py-2 text-center">{quotation}</td>
                      <td className="border border-indigo-100 px-3 py-2 text-center">{po}</td>
                      <td className="border border-emerald-100 px-3 py-2 text-center">{invoice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Workflow arrow */}
            <div className="mt-5 flex flex-col sm:flex-row items-stretch gap-2 text-xs">
              {[
                { icon: "📋", title: "عرض السعر",     desc: "المورد يقترح الأسعار",    color: "border-amber-200  bg-amber-50/60",   tc: "text-amber-900"  },
                { arrow: true },
                { icon: "📦", title: "أمر الشراء",    desc: "المشتري يؤكد الطلب",      color: "border-indigo-200 bg-indigo-50/60",  tc: "text-indigo-900" },
                { arrow: true },
                { icon: "🧾", title: "الفاتورة الضريبية", desc: "المورد يطالب بالدفع",  color: "border-emerald-200 bg-emerald-50/60", tc: "text-emerald-900" },
              ].map((step, i) =>
                step.arrow ? (
                  <div key={i} className="hidden sm:flex items-center text-ink-muted text-xl font-black">→</div>
                ) : (
                  <div key={i} className={`flex-1 rounded-xl border ${step.color} p-3 text-center`}>
                    <p className="text-xl mb-1">{step.icon}</p>
                    <p className={`font-extrabold ${step.tc}`}>{step.title}</p>
                    <p className="text-ink-muted mt-0.5">{step.desc}</p>
                  </div>
                )
              )}
            </div>

            {/* Internal links for workflow steps */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <Link href="/ar/ae/quotation-generator"
                className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 font-bold hover:border-amber-400 transition-colors">
                <span>📋</span><span>مولد عرض السعر ←</span>
              </Link>
              <div className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-indigo-800 font-bold">
                <span>📦</span><span>أنت هنا — مولد LPO</span>
              </div>
              <Link href="/ar/ae/vat-invoice-generator"
                className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800 font-bold hover:border-emerald-400 transition-colors">
                <span>🧾</span><span>مولد الفاتورة الضريبية ←</span>
              </Link>
            </div>
          </section>

          {/* ── Section 3: ما معنى LPO ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">🏷️</span>
              ما معنى LPO في الإمارات؟
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                <strong className="text-ink">LPO</strong> هو اختصار لعبارة{" "}
                <strong className="text-ink">Local Purchase Order</strong>، وتعني حرفياً «أمر الشراء المحلي».
                يُستخدم هذا المصطلح على نطاق واسع في الإمارات ودول مجلس التعاون الخليجي للإشارة إلى
                وثيقة الطلب الرسمية الصادرة عن المشتري لمورد داخل الدولة أو المنطقة.
              </p>
              <p>
                من الناحية العملية، لا يختلف LPO في مضمونه عن PO (Purchase Order) — كلاهما يُحدد
                السلع أو الخدمات والكميات والأسعار وشروط التوريد. الفارق يكمن في الاستخدام:
                يُشير PO أحياناً إلى المشتريات الدولية، بينما يُحتفظ بمصطلح LPO للمعاملات المحلية
                أو الإقليمية.
              </p>
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>ملاحظة:</strong> LPO ليس مصطلحاً قانونياً مُعرَّفاً في تشريعات الإمارات الاتحادية.
                  هو مصطلح تجاري متعارف عليه في بيئة الأعمال، وتقبله الجهات الحكومية والشركات الكبرى
                  كمستند مشتريات داخلي رسمي.
                </p>
              </div>
            </div>
          </section>

          {/* ── Section 4: محتويات نموذج أمر الشراء ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              ماذا يجب أن يحتوي نموذج أمر الشراء؟
            </h2>
            <p className="text-sm text-ink-secondary mb-4 leading-relaxed">
              نموذج أمر الشراء الاحترافي يتضمن عناصر أساسية تضمن الوضوح لكلا الطرفين وتُسهّل
              عمليات المحاسبة ومتابعة التوريد:
            </p>
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              {[
                { icon: "🔢", label: "رقم أمر الشراء (PO/LPO Number)",    desc: "تسلسل رقمي فريد لكل أمر" },
                { icon: "📅", label: "تاريخ الإصدار وتاريخ التسليم",       desc: "توضيح الجدول الزمني للتوريد" },
                { icon: "🏢", label: "بيانات الشركة المشترية (Buyer)",     desc: "الاسم، العنوان، TRN إن وجد" },
                { icon: "🏭", label: "بيانات المورد (Supplier)",           desc: "الاسم، العنوان، TRN إن وجد" },
                { icon: "📍", label: "عنوان التسليم",                       desc: "قد يختلف عن عنوان الشركة" },
                { icon: "📦", label: "وصف الأصناف أو الخدمات",            desc: "اسم البند، SKU إن وجد" },
                { icon: "🔢", label: "الكميات ووحدات القياس",               desc: "قطعة، كغ، ساعة، يوم..." },
                { icon: "💰", label: "سعر الوحدة والإجمالي لكل بند",       desc: "بالعملة المتفق عليها (AED)" },
                { icon: "🏷️", label: "الخصومات إن وجدت",                  desc: "خصم قيمي أو نسبي لكل بند" },
                { icon: "🧾", label: "ضريبة القيمة المضافة (VAT)",         desc: "5% عند الاقتضاء — تقديري" },
                { icon: "🚚", label: "شروط التسليم وطريقة الشحن",          desc: "EXW, CIF, DAP أو وصف نصي" },
                { icon: "💳", label: "شروط الدفع",                         desc: "30 يوماً، فوري، مقدم جزئي..." },
                { icon: "📎", label: "مرجع عرض السعر (إن وجد)",            desc: "رقم القوتيشن المقابل" },
                { icon: "✍️", label: "حقول الاعتماد والتوقيع",             desc: "المُعِد والمعتمد وإقرار المورد" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                  <span className="text-base shrink-0">{item.icon}</span>
                  <div>
                    <span className="font-bold text-ink">{item.label}</span>
                    <p className="text-ink-muted mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 5: VAT على أمر الشراء ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">🧾</span>
              هل تضاف ضريبة القيمة المضافة على أمر الشراء؟
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                النسبة القياسية لضريبة القيمة المضافة في دولة الإمارات هي{" "}
                <strong className="text-ink">5%</strong> على معظم التوريدات الخاضعة للضريبة.
                يمكن إدراج VAT في نموذج أمر الشراء لإظهار التكلفة الإجمالية المتوقعة،
                خاصةً حين يكون المورد مسجلاً في ضريبة القيمة المضافة لدى الهيئة الاتحادية للضرائب (FTA).
              </p>

              {/* Key distinction box */}
              <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
                <p className="text-xs font-extrabold text-amber-900 mb-2 flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>تمييز ضريبي مهم — يجب معرفته</span>
                </p>
                <ul className="space-y-1.5 text-xs text-amber-800 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold shrink-0 mt-0.5">•</span>
                    <span>
                      <strong>أمر الشراء ليس فاتورة ضريبية.</strong>{" "}
                      VAT المدرجة فيه هي تقدير للتكلفة الكلية، لا إثبات ضريبي.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold shrink-0 mt-0.5">•</span>
                    <span>
                      لاسترداد ضريبة المدخلات (Input Tax Credit)، تحتاج إلى{" "}
                      <strong>الفاتورة الضريبية الرسمية</strong> من المورد المسجل في VAT — لا تُغني عنها أي وثيقة أخرى.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold shrink-0 mt-0.5">•</span>
                    <span>
                      بعض الأصناف معفاة أو خاضعة لنسبة الصفر (0%) — الأداة تدعم تصنيف كل بند
                      على حدة (5%، 0%، معفاة، خارج النطاق).
                    </span>
                  </li>
                </ul>
              </div>

              <p>
                للتحقق من وضع مورديك في VAT أو لحساب ضريبة القيمة المضافة على أي مبلغ، استخدم:{" "}
                <Link href="/ar/ae/vat-registration-checker" className="text-indigo-600 font-bold hover:underline">
                  حاسبة أهلية التسجيل في VAT ←
                </Link>
                {" "}أو{" "}
                <Link href="/vat-calculator/uae" className="text-indigo-600 font-bold hover:underline">
                  حاسبة ضريبة القيمة المضافة الإمارات ←
                </Link>
              </p>
            </div>
          </section>

          {/* ── Section 6: Realistic Example ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-1 flex items-center gap-2">
              <span className="text-2xl">🔢</span>
              مثال عملي على أمر شراء في الإمارات
            </h2>
            <p className="text-xs text-ink-muted mb-5">
              مثال توضيحي — الأسماء والأرقام افتراضية
            </p>

            {/* PO header */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 mb-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                <div className="flex gap-2">
                  <span className="font-bold text-ink w-28 shrink-0">رقم أمر الشراء:</span>
                  <span className="text-ink-secondary" dir="ltr">LPO-2026-0147</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-ink w-28 shrink-0">تاريخ الإصدار:</span>
                  <span className="text-ink-secondary" dir="ltr">15 أكتوبر 2026</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-ink w-28 shrink-0">المشتري:</span>
                  <span className="text-ink-secondary">شركة الأفق للتقنية ذ.م.م — دبي</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-ink w-28 shrink-0">المورد:</span>
                  <span className="text-ink-secondary">مؤسسة التوريدات المكتبية — أبوظبي</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-ink w-28 shrink-0">تاريخ التسليم:</span>
                  <span className="text-ink-secondary" dir="ltr">22 أكتوبر 2026</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-ink w-28 shrink-0">العملة:</span>
                  <span className="text-ink-secondary">AED — درهم إماراتي</span>
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div className="overflow-x-auto -mx-1 mb-4">
              <table className="w-full text-xs border-collapse min-w-[520px]">
                <thead>
                  <tr className="bg-slate-100 text-ink">
                    <th className="border border-slate-200 px-3 py-2 text-right font-extrabold">البند / الوصف</th>
                    <th className="border border-slate-200 px-3 py-2 text-center font-extrabold">الكمية</th>
                    <th className="border border-slate-200 px-3 py-2 text-center font-extrabold">سعر الوحدة</th>
                    <th className="border border-slate-200 px-3 py-2 text-center font-extrabold">الإجمالي</th>
                    <th className="border border-slate-200 px-3 py-2 text-center font-extrabold">VAT</th>
                  </tr>
                </thead>
                <tbody className="text-ink-secondary">
                  {[
                    ["كرسي مكتبي مع تحكم في الارتفاع",  "10 قطعة",  "380.00 AED",  "3,800.00 AED", "5%"],
                    ["مكتب خشبي L-شكل (160×120 سم)",     "5 قطعة",   "620.00 AED",  "3,100.00 AED", "5%"],
                    ["خزانة ملفات معدنية ذات 4 أدراج",   "8 قطعة",   "275.00 AED",  "2,200.00 AED", "5%"],
                  ].map(([desc, qty, unit, total, vat], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="border border-slate-200 px-3 py-2 font-medium text-ink">{desc}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center" dir="ltr">{qty}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center" dir="ltr">{unit}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center font-bold" dir="ltr">{total}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center">
                        <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 font-bold">{vat}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5 text-xs max-w-sm mr-auto">
              <div className="flex justify-between text-ink-secondary">
                <span>الإجمالي قبل الضريبة</span>
                <span dir="ltr" className="font-bold text-ink">9,100.00 AED</span>
              </div>
              <div className="flex justify-between text-blue-700 font-bold">
                <span>ضريبة القيمة المضافة 5%</span>
                <span dir="ltr">455.00 AED</span>
              </div>
              <div className="flex justify-between text-indigo-800 font-black text-sm border-t border-slate-200 pt-2 mt-2">
                <span>الإجمالي الكلي شامل VAT</span>
                <span dir="ltr">9,555.00 AED</span>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-slate-100 border border-slate-200 p-3 text-xs text-ink-muted">
              <strong>شروط:</strong> الدفع 30 يوماً من تاريخ استلام الفاتورة الضريبية —
              التسليم في مقر المشتري بدبي — الضمان وفق اتفاق الطرفين.
              <br />
              <span className="font-bold text-ink">⚠️ مثال توضيحي فقط — لا يمثل أي شركة حقيقية.</span>
            </div>
          </section>

          {/* ── Section 7: PO vs Purchase Requisition ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">🔄</span>
              الفرق بين أمر الشراء وطلب الشراء الداخلي (Purchase Requisition)
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                في بيئة الأعمال، كثيراً ما يلتبس هذان المصطلحان على المبتدئين في إدارة المشتريات:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <p className="text-sm font-extrabold text-ink flex items-center gap-2">
                    <span>📩</span>
                    طلب الشراء الداخلي — Purchase Requisition (PR)
                  </p>
                  <ul className="space-y-1 text-xs text-ink-secondary leading-relaxed">
                    <li>• وثيقة <strong>داخلية</strong> يُصدرها موظف أو قسم داخل الشركة.</li>
                    <li>• تُرفع إلى إدارة المشتريات أو المدير المختص لطلب الموافقة.</li>
                    <li>• لا تُرسل للمورد ولا أثر خارجي لها.</li>
                    <li>• تُمثل «طلب الإذن» للشراء.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-2">
                  <p className="text-sm font-extrabold text-ink flex items-center gap-2">
                    <span>📦</span>
                    أمر الشراء — Purchase Order / LPO
                  </p>
                  <ul className="space-y-1 text-xs text-ink-secondary leading-relaxed">
                    <li>• وثيقة <strong>خارجية</strong> تُصدرها الشركة المشترية وتُرسل للمورد.</li>
                    <li>• تصدر بعد الموافقة على طلب الشراء الداخلي.</li>
                    <li>• تُحدد الشروط التجارية الملزمة للطرفين بعد قبول المورد.</li>
                    <li>• تُمثل «تأكيد الطلب الرسمي» للمورد.</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-ink-muted">
                الدورة المعتادة: طلب الشراء الداخلي (PR) ← موافقة الإدارة ← إصدار أمر الشراء (PO/LPO) ← تأكيد المورد ← التوريد ← الفاتورة الضريبية.
              </p>
            </div>
          </section>

          {/* ── Section 8: PO في تسجيل VAT ── */}
          <section className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-4 flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              هل يمكن استخدام أمر الشراء لإثبات النشاط التجاري؟
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                أشارت الهيئة الاتحادية للضرائب (FTA) في إرشاداتها المتعلقة بالتسجيل في ضريبة
                القيمة المضافة إلى أن مقدمي طلبات التسجيل قد يُطلب منهم تقديم مستندات داعمة
                تُثبت ممارسة النشاط التجاري الفعلي، ومن هذه المستندات:
              </p>
              <ul className="space-y-1.5 text-sm leading-relaxed">
                {[
                  "الفواتير التجارية الصادرة أو المستلمة",
                  "أوامر الشراء المحلية (Local Purchase Orders)",
                  "العقود المبرمة مع الموردين أو العملاء",
                  "مستندات الاستيراد والتصدير",
                  "سجلات الحسابات المصرفية",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold shrink-0 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <p className="font-bold mb-1">تنبيه مهم:</p>
                <p className="leading-relaxed">
                  تقديم أمر شراء كمستند داعم لا يضمن قبول طلب التسجيل في VAT. القرار يعود
                  لهيئة الاتحادية للضرائب وفق مجمل الملف المقدم وتقييمها لمعايير التسجيل. 
                  للاستفسار، تفضل بزيارة البوابة الرسمية للهيئة.
                </p>
              </div>

              {/* Official sources */}
              <div className="mt-2 space-y-2">
                <p className="text-xs font-extrabold text-ink">المصادر الرسمية المرجعية:</p>
                <div className="space-y-2">
                  {[
                    {
                      title: "بوابة الهيئة الاتحادية للضرائب — التسجيل في ضريبة القيمة المضافة",
                      url:   "https://tax.gov.ae/en/taxes/vat/registration.aspx",
                      desc:  "إرشادات التسجيل الإلزامي والاختياري وشروط المستندات المطلوبة.",
                    },
                    {
                      title: "الدليل الإرشادي لضريبة القيمة المضافة في الإمارات (VAT Guide)",
                      url:   "https://tax.gov.ae/en/taxes/vat/guides.aspx",
                      desc:  "النسخة الرسمية الشاملة لأحكام VAT الإماراتية — الهيئة الاتحادية للضرائب.",
                    },
                    {
                      title: "متطلبات الفاتورة الضريبية وفق FTA",
                      url:   "https://tax.gov.ae/en/taxes/vat/taxinvoice.aspx",
                      desc:  "البيانات الإلزامية في الفاتورة الضريبية، والفرق بين الكاملة والمبسطة.",
                    },
                  ].map((src, i) => (
                    <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors group">
                      <span className="text-xl shrink-0 mt-0.5">🔗</span>
                      <div>
                        <p className="text-xs font-bold text-indigo-700 group-hover:underline">{src.title}</p>
                        <p className="text-[11px] text-ink-muted mt-0.5">{src.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-2">
                <Link href="/ar/ae/vat-registration-checker"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 transition-colors">
                  <span>🏢</span>
                  <span>تحقق من أهليتك للتسجيل في VAT ←</span>
                </Link>
              </div>
            </div>
          </section>

        </div>{/* end editorial content */}

        {/* ── PART 3: FAQ ─────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-2">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-5">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">❓ الأسئلة الشائعة</h2>
              <p className="text-xs text-ink-muted mt-1">أكثر الأسئلة تكراراً حول أوامر الشراء في الإمارات</p>
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
                  <p className="mt-3 text-sm text-ink-secondary leading-relaxed pr-4">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── PART 4: Related Tools ──────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 py-6 pb-12">
          <RelatedBusinessTools
            title="🔗 أدوات تجارية وضريبية ذات صلة — دولة الإمارات"
            subtitle="سلسلة وثائق الأعمال المتكاملة: عرض سعر → أمر شراء → فاتورة ضريبية"
            tools={relatedTools}
          />
        </section>

      </main>
    </>
  );
}
