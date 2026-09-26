import AnnualLeaveCalculator from "@/components/AnnualLeaveCalculator";
import Link from "next/link";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: "حاسبة بدل الإجازات السنوية 2026 | رصيد الإجازة والتعويض النقدي",
  description:
    "احسب رصيد إجازتك السنوية وأجر أيام الإجازة والتعويض النقدي عن الإجازات غير المستنفدة عند ترك العمل وفق قوانين العمل في السعودية (م/109 و111)، الإمارات، الكويت، ومصر.",
  keywords: [
    "حاسبة بدل الإجازات السنوية",
    "حساب رصيد الإجازات",
    "بدل الإجازة في نظام العمل السعودي",
    "المادة 111 نظام العمل",
    "تعويض الإجازات غير المستنفدة",
    "رصيد الإجازات السنوية الإمارات",
    "بدل الإجازة عند نهاية الخدمة",
  ],
  alternates: {
    canonical: "https://arabic-tools-xi.vercel.app/annual-leave-calculator",
  },
  openGraph: {
    title: "حاسبة بدل الإجازات السنوية 2026 | رصيد الإجازة والتعويض النقدي",
    description:
      "احسب أجر الإجازة السنوية والتعويض النقدي عن رصيد الإجازات المتبقية بدقة وفق أنظمة العمل في السعودية والإمارات والكويت ومصر.",
    type: "website",
    locale: "ar_AR",
  },
};

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "كم عدد أيام الإجازة السنوية المستحقة للعامل في نظام العمل السعودي؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وفق المادة (109) من نظام العمل السعودي: يستحق العامل إجازة سنوية مدفوعة الأجر لا تقل عن 21 يوماً عن كل سنة في السنوات الخمس الأولى من خدمته، وتُزاد إلى 30 يوماً كاملة إذا أمضى العامل 5 سنوات متصلة لدى نفس صاحب العمل.",
      },
    },
    {
      "@type": "Question",
      name: "كيف يُحسب التعويض النقدي عن رصيد الإجازة السنوية غير المستنفدة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وفق المادة (111) من نظام العمل السعودي وما يماثلها في القوانين الخليجية: يستحق العامل عند انتهاء خدمته بدلاً نقدياً عن أيام الإجازات السنوية المتراكمة التي لم يستنفدها. يُحسب بقسمة الراتب الشهري المعتمد على 30 للحصول على الأجر اليومي، ثم ضرب الناتج في عدد أيام الرصيد المتبقية.",
      },
    },
    {
      "@type": "Question",
      name: "هل يُعتمد الراتب الأساسي أم الراتب الفعلي الشامل لحساب بدل الإجازة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "في السعودية، تنص المادة (111) ومستقر أحكام المحاكم العمالية على أن بدل الإجازة يُحسب على أساس 'الأجر الفعلي' الأخير (الراتب الأساسي مضافاً إليه البدلات الثابتة كالسكن والنقل). أما في دولة الإمارات فيُحسب بدل الرصيد عند نهاية الخدمة على أساس الراتب الأساسي فقط وفق المادة (29) من قانون العمل الاتحادي.",
      },
    },
    {
      "@type": "Question",
      name: "متى يجب على صاحب العمل دفع أجر الإجازة السنوية؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "يُلزم نظام العمل صاحب العمل بدفع أجر الإجازة السنوية للعامل مقدماً قبل بداية تمتعه بالإجازة، وذلك لتغطية نفقات العامل وأسرته خلال فترة راحته السنوية.",
      },
    },
    {
      "@type": "Question",
      name: "هل يسقط حق العامل في بدل الإجازات السنوية إذا لم يطلبها؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا يسقط حق العامل في التعويض المالي عن الإجازات غير المستنفدة طالما ظلت العلاقة العمالية قائمة، وعند ترك العمل أو انتهاء العقد يُلزم صاحب العمل بتسوية كامل الرصيد المتراكم نقداً ضمن المخالصة النهائية.",
      },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: "https://arabic-tools-xi.vercel.app" },
    { "@type": "ListItem", position: 2, name: "حاسبة بدل الإجازات السنوية", item: "https://arabic-tools-xi.vercel.app/annual-leave-calculator" },
  ],
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AnnualLeavePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="min-h-screen bg-page-bg py-6 sm:py-10" dir="rtl">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-3xl px-4 pb-4">
          <nav className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Link href="/" className="hover:text-brand transition-colors">الرئيسية</Link>
            <span>›</span>
            <span className="text-ink font-semibold">حاسبة بدل الإجازات السنوية</span>
          </nav>
        </div>

        {/* ── PART 1: Calculator ── */}
        <div className="mx-auto max-w-3xl px-4">
          <AnnualLeaveCalculator />
        </div>

        {/* ── Complete Settlement Cross-Link Banner ── */}
        <div className="mx-auto max-w-3xl px-4 mt-8">
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-50 via-white to-brand-surface p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">📋</span>
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">تصفية شاملة لجميع مستحقاتك</p>
                <h3 className="text-base font-extrabold text-ink mt-0.5">هل تُنهي خدمتك وتحتاج لمخالصة نهائية كاملة؟</h3>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  احسب بدل الإجازة + مكافأة نهاية الخدمة + راتب آخر شهر + تعويض الإشعار مع طباعة وثيقة مخالصة رسمية.
                </p>
              </div>
            </div>
            <Link
              href="/ar/sa/final-settlement-calculator"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all"
            >
              <span>حاسبة المخالصة النهائية</span>
              <span>←</span>
            </Link>
          </div>
        </div>

        {/* ── PART 2: 300-500 words Explanation ── */}
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-6">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-ink">
                📖 ما هي حاسبة بدل الإجازات السنوية وما أهميتها القانونية؟
              </h2>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                تُعدّ <strong className="text-ink">الإجازة السنوية مدفوعة الأجر</strong> حقاً إنسانياً وقانونياً جوهرياً كفلته جميع تشريعات العمل العربية والدولية. والهدف منها هو ضمان تجديد نشاط العامل وراحته الذهنية والبدنية بعد عام كامل من العمل والإنتاج. غير أن الكثير من العمال لا يتمكنون من استنفاد كامل أيام إجازاتهم خلال السنة التعاقدية لأسباب تتعلق بضغط العمل أو متطلبات المنشأة.
              </p>
              <p>
                عند انتهاء علاقة العمل أو الاستقالة، يُلزم القانون صاحب العمل بتعويض العامل نقدياً عن كامل رصيد الإجازات المتبقي لديه. توفر هذه الحاسبة أداة دقيقة لحساب استحقاقك السنوي من الأيام، وقيمة الأجر اليومي، وإجمالي المبلغ المستحق لك كبدل رصيد إجازات وفق نصوص أنظمة العمل في السعودية، الإمارات، الكويت، ومصر.
              </p>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-ink mb-3">🔢 كيفية استخدام الحاسبة خطوة بخطوة</h3>
              <ol className="space-y-2 text-sm text-ink-secondary list-none">
                {[
                  ["١", "اختر دولة العمل لتطبيق القوانين الخاصة بها تلقائياً (السعودية، الإمارات، الكويت، مصر)."],
                  ["٢", "أدخل الراتب الشهري المعتمد (الراتب الفعلي الشامل للبدلات أو الراتب الأساسي وفق اشتراطات الدولة)."],
                  ["٣", "حدد سنوات الخدمة في المنشأة لمعرفة ما إذا كنت تستحق الشريحة العادية (21 يوماً) أو شريحة الأقدمية (30 يوماً)."],
                  ["٤", "أدخل عدد أيام رصيد الإجازات المتبقية التي لم تستنفدها."],
                  ["٥", "تُظهر لك الحاسبة فوراً قيمة أجر اليوم، وقيمة إجازتك السنوية كاملة، وإجمالي التعويض النقدي المستحق الصرف."],
                ].map(([n, text]) => (
                  <li key={n} className="flex gap-2.5 items-start">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-brand text-white text-[11px] font-extrabold flex items-center justify-center mt-0.5">
                      {n}
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Practical Example */}
            <div className="rounded-xl bg-gradient-to-br from-brand-surface to-emerald-50/40 border border-brand-border p-5">
              <h3 className="text-base font-extrabold text-ink mb-3">📊 مثال عملي بالأرقام: موظف في الرياض</h3>
              <div className="text-sm text-ink-secondary space-y-2">
                <p>
                  <strong>البيانات:</strong> موظف يعمل في المملكة العربية السعودية براتب فعلي 12,000 ريال (أساسي + سكن + مواصلات)، أمضى في العمل 6 سنوات ولديه رصيد إجازات متبقٍ قدره 18 يوماً:
                </p>
                <div className="space-y-1.5 mt-3">
                  <div className="flex justify-between bg-white p-2.5 rounded-lg border border-brand-border/60 text-xs">
                    <span>الاستحقاق السنوي (خدمة أكثر من 5 سنوات م/109):</span>
                    <strong className="text-ink">30 يوماً / سنة</strong>
                  </div>
                  <div className="flex justify-between bg-white p-2.5 rounded-lg border border-brand-border/60 text-xs">
                    <span>قيمة أجر اليوم (12,000 ÷ 30):</span>
                    <strong className="text-brand-dark">400.00 ر.س</strong>
                  </div>
                  <div className="flex justify-between bg-brand text-white p-2.5 rounded-lg text-sm font-bold">
                    <span>التعويض المستحق عن 18 يوماً (18 × 400):</span>
                    <span>7,200.00 ر.س</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal References */}
            <div>
              <h3 className="text-base font-extrabold text-ink mb-3">⚖️ السند القانوني المقارن بين الدول</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    flag: "🇸🇦",
                    title: "نظام العمل السعودي (م/109 و111)",
                    desc: "21 يوماً للسنوات الـ 5 الأولى، وتزاد إلى 30 يوماً بعد 5 سنوات. يُحسب التعويض على الأجر الفعلي.",
                  },
                  {
                    flag: "🇦🇪",
                    title: "قانون العمل الإماراتي (م/29)",
                    desc: "30 يوماً تقويمياً عن كل سنة خدمة كاملة. يُحسب تعويض الرصيد عند نهاية الخدمة على الراتب الأساسي.",
                  },
                  {
                    flag: "🇰🇼",
                    title: "قانون العمل الكويتي (م/70)",
                    desc: "30 يوم عمل مدفوعة الأجر عن كل سنة. يُقسم الأجر الشهري على 26 يوماً لحساب أجر اليوم.",
                  },
                  {
                    flag: "🇪🇬",
                    title: "قانون العمل المصري (م/47)",
                    desc: "21 يوماً، وتزاد إلى 30 يوماً لمن أمضى 10 سنوات في الخدمة أو تجاوز سن الخمسين عاماً.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-brand-border/70 bg-slate-50/70 p-3.5 space-y-1">
                    <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <span>{item.flag}</span>
                      <span>{item.title}</span>
                    </p>
                    <p className="text-xs text-ink-muted leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PART 3: FAQ Section ── */}
        <section className="mx-auto max-w-3xl px-4 pb-8">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card">
            <h2 className="text-xl font-extrabold text-ink mb-6 border-b border-brand-border pb-4">
              ❓ الأسئلة الشائعة حول الإجازات السنوية وبدل الرصيد
            </h2>

            <div className="space-y-5">
              {faqJsonLd.mainEntity.map((faq, i) => (
                <div key={i} className="border-b border-brand-border/60 last:border-0 pb-5 last:pb-0">
                  <h3 className="text-sm font-extrabold text-ink mb-2">{faq.name}</h3>
                  <p className="text-sm text-ink-secondary leading-relaxed">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PART 4: Related Tools ── */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-ink mb-1">🔗 أدوات عمالية ومالية ذات صلة</h2>
              <p className="text-xs text-ink-muted">
                استكمل حسابات مستحقاتك الوظيفية بهذه الأدوات الشاملة
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  href: "/ar/sa/final-settlement-calculator",
                  icon: "📋",
                  title: "حاسبة المخالصة النهائية",
                  desc: "تصفية شاملة لجميع مستحقات نهاية الخدمة والبدلات مع وثيقة رسمية للطباعة",
                  badge: "شاملة",
                },
                {
                  href: "/gratuity-calculator",
                  icon: "🏆",
                  title: "حاسبة مكافأة نهاية الخدمة",
                  desc: "احسب مكافأة نهاية الخدمة لـ 7 دول عربية وفق نصوص القوانين والاستقالة",
                  badge: "7 دول",
                },
                {
                  href: "/overtime-calculator",
                  icon: "⏱️",
                  title: "حاسبة الأوفرتايم",
                  desc: "احسب أجر الساعات الإضافية 125% و150% وفق أنظمة العمل الخليجية",
                  badge: "150%",
                },
                {
                  href: "/salary-calculator",
                  icon: "💼",
                  title: "حاسبة الراتب الصافي",
                  desc: "احسب صافي راتبك بعد التأمينات والضرائب لـ 6 دول عربية",
                  badge: "GOSI / تأمينات",
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
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-light text-brand-dark">
                        {tool.badge}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed">{tool.desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Last Reviewed */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-ink-muted flex items-start gap-2">
              <span className="text-base">📅</span>
              <p>
                <strong className="text-ink">آخر مراجعة قانونية:</strong> 2026م — استناداً لمواد أنظمة العمل الرسمية المقارنة في السعودية والإمارات والكويت ومصر.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
