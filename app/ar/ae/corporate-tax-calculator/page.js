import UaeCorporateTaxCalculator from "@/components/UaeCorporateTaxCalculator";
import Link from "next/link";

export const metadata = {
  title: "حاسبة ضريبة الشركات في الإمارات 2026 | 0% و9%",
  description:
    "احسب ضريبة الشركات في الإمارات: نسبة 0% على أول 375,000 درهم و9% على ما يزيد، مع تسهيلات الأعمال الصغيرة وقواعد QFZP والشخص الطبيعي وفق الهيئة الاتحادية للضرائب FTA.",
  keywords: [
    "ضريبة الشركات الإمارات",
    "حاسبة ضريبة الشركات",
    "نسبة 9% ضريبة الشركات",
    "تسهيلات الأعمال الصغيرة",
    "QFZP منطقة حرة",
    "شخص طبيعي ضريبة الشركات",
    "375000 درهم ضريبة",
    "UAE Corporate Tax calculator",
    "FTA corporate tax",
    "ضريبة الشركات دبي 2026",
  ],
  alternates: { canonical: "https://arabic-tools-xi.vercel.app/ar/ae/corporate-tax-calculator" },
  openGraph: {
    title: "حاسبة ضريبة الشركات في الإمارات 2026 | 0% و9%",
    description: "احسب ضريبة الشركات 0% و9% مع تسهيلات الأعمال الصغيرة وقواعد المناطق الحرة وفق FTA.",
    url: "https://arabic-tools-xi.vercel.app/ar/ae/corporate-tax-calculator",
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
      name: "ما هي نسبة ضريبة الشركات في الإمارات؟",
      acceptedAnswer: { "@type": "Answer", text: "تُطبّق ضريبة الشركات في الإمارات بنسبتين: 0% على الدخل الخاضع للضريبة حتى 375,000 درهم، و9% على ما يتجاوز هذا المبلغ. سرت هذه النسب على الفترات الضريبية التي تبدأ في أو بعد 1 يونيو 2023." },
    },
    {
      "@type": "Question",
      name: "كيف يعمل حد 375,000 درهم في ضريبة الشركات؟",
      acceptedAnswer: { "@type": "Answer", text: "أول 375,000 درهم من الدخل الخاضع للضريبة يخضع لنسبة 0% (صفر بالمئة). أي مبلغ يتجاوز هذا الحد يخضع لنسبة 9%. مثال: دخل مليون درهم → 375,000 بنسبة 0% + 625,000 بنسبة 9% = ضريبة 56,250 درهم." },
    },
    {
      "@type": "Question",
      name: "ما الفرق بين الإيرادات والدخل الخاضع للضريبة؟",
      acceptedAnswer: { "@type": "Answer", text: "الإيرادات هي إجمالي المبيعات والدخل قبل خصم أي مصروفات. الدخل الخاضع للضريبة هو الدخل بعد خصم المصروفات المعتمدة ضريبياً والتعديلات المقررة. ضريبة الشركات تُحسب على الدخل الخاضع للضريبة وليس على الإيرادات." },
    },
    {
      "@type": "Question",
      name: "ما هي تسهيلات الأعمال الصغيرة في ضريبة الشركات الإماراتية؟",
      acceptedAnswer: { "@type": "Answer", text: "تسهيلات الأعمال الصغيرة تتيح للأشخاص المقيمين الذين لا تتجاوز إيراداتهم 3,000,000 درهم في الفترة الضريبية الحالية وفي كل فترة سابقة ذات صلة اختيار معاملة ضريبية مبسّطة. هي اختيار (election) وليست إعفاءً تلقائياً. وفق التوجيهات الحالية لـ FTA، تسري على الفترات الضريبية التي تنتهي في أو قبل 31 ديسمبر 2026." },
    },
    {
      "@type": "Question",
      name: "متى يخضع الشخص الطبيعي لضريبة الشركات في الإمارات؟",
      acceptedAnswer: { "@type": "Answer", text: "يدخل الشخص الطبيعي في نطاق ضريبة الشركات عندما يتجاوز دوران نشاطه التجاري الإماراتي 1,000,000 درهم في السنة الميلادية. لا تُحتسب الرواتب ودخل الاستثمار الشخصي ودخل الاستثمار العقاري المؤهل ضمن هذا الدوران." },
    },
    {
      "@type": "Question",
      name: "كيف تُعامل الشركات في المناطق الحرة (QFZP) ضريبياً؟",
      acceptedAnswer: { "@type": "Answer", text: "الشخص المؤهل في المنطقة الحرة (QFZP) يستفيد من نسبة 0% على دخله المؤهل. أما الدخل غير المؤهل فيخضع لنسبة 9% كاملة دون تطبيق نطاق إعفاء 375,000 درهم. يستلزم وضع QFZP استيفاء شروط متعددة تشمل الجوهر الاقتصادي وأنواع الأنشطة." },
    },
    {
      "@type": "Question",
      name: "ما هو المعدل الفعلي لضريبة الشركات في الإمارات؟",
      acceptedAnswer: { "@type": "Answer", text: "المعدل الفعلي يختلف حسب مستوى الدخل. للدخل دون 375,000 درهم المعدل الفعلي 0%. كلما زاد الدخل عن هذا الحد اقترب المعدل الفعلي من 9% دون أن يتجاوزه. مثال: دخل مليون درهم → معدل فعلي 5.625%." },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: "https://arabic-tools-xi.vercel.app" },
    { "@type": "ListItem", position: 2, name: "🇦🇪 أدوات الإمارات", item: "https://arabic-tools-xi.vercel.app/ar/ae" },
    { "@type": "ListItem", position: 3, name: "حاسبة ضريبة الشركات في الإمارات", item: "https://arabic-tools-xi.vercel.app/ar/ae/corporate-tax-calculator" },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "حاسبة ضريبة الشركات في الإمارات 2026",
  operatingSystem: "All",
  applicationCategory: "BusinessApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
  description: "حاسبة تقديرية لضريبة الشركات في الإمارات: نسبة 0% على أول 375,000 درهم و9% على ما يزيد وفق FTA.",
};

export default function UaeCorporateTaxPage() {
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
            <span className="text-ink font-semibold">حاسبة ضريبة الشركات</span>
          </nav>
        </div>

        {/* Calculator */}
        <div className="mx-auto max-w-3xl px-4 py-4">
          <UaeCorporateTaxCalculator />
        </div>

        {/* SEO Content */}
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">📖 ما هي ضريبة الشركات في الإمارات؟</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>أقرّت دولة الإمارات العربية المتحدة <strong className="text-ink">ضريبة الشركات الاتحادية</strong> بموجب المرسوم بقانون اتحادي رقم (47) لسنة 2022، وسرت على الفترات الضريبية التي تبدأ في أو بعد 1 يونيو 2023. تشرف على تطبيقها <strong className="text-ink">الهيئة الاتحادية للضرائب (FTA)</strong>.</p>
              <p>تُعدّ هذه الحاسبة أداة استرشادية لتقدير الالتزام الضريبي وفق البيانات المدخلة — وليست إقراراً ضريبياً أو تحديداً رسمياً من FTA.</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-2">
              <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2"><span>💚</span><span>كم نسبة ضريبة الشركات؟</span></h3>
              <ul className="text-sm text-emerald-900 space-y-1.5 list-disc list-inside">
                <li><strong>0%</strong> على الدخل الخاضع للضريبة حتى وبما يشمل <strong>375,000 درهم</strong> (نطاق الضريبة بنسبة 0%).</li>
                <li><strong>9%</strong> على الدخل الخاضع للضريبة الذي يتجاوز <strong>375,000 درهم</strong>.</li>
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
                <h3 className="text-sm font-extrabold text-amber-950">🏷️ تسهيلات الأعمال الصغيرة</h3>
                <p className="text-xs text-amber-900 leading-relaxed">متاحة للأشخاص المقيمين الذين لا تتجاوز إيراداتهم 3,000,000 درهم في الفترة الحالية وكل فترة سابقة ذات صلة — وليست إعفاءً تلقائياً بل اختياراً يُقدَّم لدى FTA. وفق التوجيهات الحالية تسري على الفترات الضريبية التي تنتهي في أو قبل 31 ديسمبر 2026.</p>
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 space-y-2">
                <h3 className="text-sm font-extrabold text-purple-950">🏙️ المناطق الحرة (QFZP)</h3>
                <p className="text-xs text-purple-900 leading-relaxed">الشخص المؤهل في المنطقة الحرة يستفيد من 0% على دخله المؤهل و9% على دخله غير المؤهل بدون نطاق إعفاء 375,000 درهم على الجزء غير المؤهل.</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
                <h3 className="text-sm font-extrabold text-blue-950">👤 الشخص الطبيعي</h3>
                <p className="text-xs text-blue-900 leading-relaxed">يدخل في نطاق ضريبة الشركات عند تجاوز دوران نشاطه التجاري الإماراتي 1,000,000 درهم في السنة الميلادية — ��ا تُحتسب الرواتب والاستثمارات الشخصية.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <h3 className="text-sm font-extrabold text-ink">📊 الإيرادات ≠ الدخل الخاضع</h3>
                <p className="text-xs text-ink-secondary leading-relaxed">ضريبة الشركات تُحسب على <strong>الدخل الخاضع للضريبة</strong> وهو صافي الدخل بعد المصروفات والتعديلات المعتمدة — وليس على الإيرادات الإجمالية.</p>
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
                { title: "مثال 1 — دخل 300,000 درهم", scenario: "دخل خاضع للضريبة: 300,000 درهم", result: "ضريبة: 0 درهم (كامل الدخل ضمن نطاق الضريبة بنسبة 0%)", color: "text-emerald-700", note: "الدخل دون حد 375,000 درهم — يخضع لنسبة 0%." },
                { title: "مثال 2 — دخل مليون درهم", scenario: "دخل خاضع للضريبة: 1,000,000 درهم", result: "375,000 × 0% + 625,000 × 9% = 56,250 درهم", color: "text-rose-700", note: "معدل فعلي: 5.625%." },
                { title: "مثال 3 — إيرادات 2.4 مليون + SBR", scenario: "إيرادات: 2,400,000 درهم | دخل خاضع: 500,000 درهم", result: "الضريبة المعيارية: 11,250 درهم | قد يكون مؤهلاً لـ SBR", color: "text-amber-700", note: "الإيرادات أقل من 3 مليون — فحص SBR مطلوب." },
                { title: "مثال 4 — شخص طبيعي دوران 800,000 درهم", scenario: "دوران النشاط التجاري: 800,000 درهم", result: "قد لا يكون في نطاق ضريبة الشركات بناءً على هذا الشرط وحده", color: "text-emerald-700", note: "الدوران دون 1,000,000 درهم — مراجعة FTA مطلوبة للتأكيد." },
                { title: "مثال 5 — QFZP", scenario: "دخل مؤهل: 2,000,000 درهم | دخل غير مؤهل: 200,000 درهم", result: "2,000,000 × 0% + 200,000 × 9% = 18,000 درهم", color: "text-purple-700", note: "لا يطبق نطاق 375,000 على الدخل غير المؤهل لـ QFZP." },
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
                { href: "/ar/ae/small-business-relief-checker", icon: "🏷️", title: "حاسبة أهلية تسهيلات الأعمال الصغيرة", desc: "هل قد تكون مؤهلاً لتسهيلات الأعمال الصغيرة؟ فحص حد 3 مليون درهم والشروط.", badge: "SBR 2026", badgeColor: "bg-emerald-100 text-emerald-800" },
                { href: "/ar/ae/vat-registration-checker", icon: "🏢", title: "حاسبة أهلية التسجيل في ضريبة القيمة المضافة", desc: "هل تحتاج لمعرفة وضع التسجيل في ضريبة القيمة المضافة؟", badge: "FTA VAT", badgeColor: "bg-purple-100 text-purple-800" },
                { href: "/vat-calculator/uae", icon: "🧾", title: "حاسبة ضريبة القيمة المضافة 5%", desc: "احسب ضريبة الـ 5% أو استخرج السعر الأصلي من أي فاتورة.", badge: "5% FTA", badgeColor: "bg-blue-100 text-blue-800" },
                { href: "/ar/ae/final-settlement-calculator", icon: "📋", title: "حاسبة المخالصة النهائية في الإمارات", desc: "تصفية مستحقات نهاية الخدمة وفق قانون العمل 33.", badge: "قانون 33", badgeColor: "bg-emerald-100 text-emerald-800" },
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
