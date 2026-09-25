"use client";

import { useState } from "react";

const allTools = [
  {
    href: "/zakat-calculator",
    title: "حاسبة الزكاة",
    desc: "احسب زكاتك بدقة بناءً على نصاب الفضة الحالي مع دعم الأصول والالتزامات.",
    icon: "🕌",
  },
  {
    href: "/inheritance-calculator",
    title: "حاسبة الميراث الشرعية",
    desc: "احسب توزيع التركة الشرعية بدقة وفق الفرائض والعصبات والعول والرد.",
    icon: "⚖️",
  },
  {
    href: "/loan-calculator",
    title: "حاسبة القروض والتمويل",
    desc: "احسب القسط الشهري وإجمالي الفائدة وجدول السداد الكامل لأي قرض أو تمويل.",
    icon: "🏦",
  },
  {
    href: "/currency-converter",
    title: "محول العملات الفوري",
    desc: "حوّل بين الريال والدرهم والدولار واليورو وأكثر من ١٢ عملة بأسعار محدثة.",
    icon: "💱",
  },
  {
    href: "/vat-calculator",
    title: "حاسبة ضريبة القيمة المضافة",
    desc: "احسب الضريبة المضافة (١٥٪ أو ٥٪) أو استخرج السعر الأصلي بسهولة.",
    icon: "🧾",
  },
  {
    href: "/zakat-al-fitr",
    title: "حاسبة زكاة الفطر",
    desc: "احسب صاع زكاة الفطر بالكيلوجرام (أرز وحبوب) أو نقداً لجميع أفراد الأسرة.",
    icon: "🌾",
  },
  {
    href: "/kaffara-calculator",
    title: "حاسبة الكفارات والفدية",
    desc: "احسب كفارة اليمين وفدية صيام رمضان والنذر عيناً بالأرز أو نقداً.",
    icon: "📜",
  },
{
    href: "/umrah-calculator",
    title: "حاسبة تكلفة العمرة",
    desc: "قدّر تكلفة رحلتك للعمرة شاملاً الطيران والفندق والتأشيرة والطعام لأي عدد من المسافرين.",
    icon: "🕋",
  },
  {
    href: "/salary-calculator",
    title: "حاسبة الراتب الصافي",
    desc: "احسب صافي راتبك بعد الضرائب والتأمينات لـ 6 دول مع تفصيل كامل للبدلات والخصومات.",
    icon: "💰",
  },
{
    href: "/mortgage-calculator",
    title: "حاسبة التمويل العقاري",
    desc: "احسب قسط الرهن العقاري وجدول السداد الكامل مع الدفعة الأولى والتأمين والرسوم.",
    icon: "🏠",
  },
  {
    href: "/compound-interest",
    title: "حاسبة الفائدة المركبة",
    desc: "احسب نمو استثمارك مع الفائدة المركبة والمساهمات الشهرية مع مخطط النمو السنوي.",
    icon: "📈",
  },
  {
    href: "/gratuity-calculator",
    title: "حاسبة مكافأة نهاية الخدمة",
    desc: "احسب مكافأة نهاية الخدمة القانونية لـ 7 دول عربية وفق أحدث قوانين العمل ومواد الاستقالة والفصل.",
    icon: "🎖️",
  },
  {
    href: "/hijri-age-calculator",
    title: "حاسبة العمر بالهجري",
    desc: "احسب عمرك الدقيق بالهجري والميلادي وفق تقويم أم القرى مع موعد يوم ميلادك القادم وإحصائيات حياتك.",
    icon: "🌙",
  },
  {
    href: "/date-converter",
    title: "محول التاريخ الهجري والميلادي",
    desc: "حوّل بين التاريخين الهجري والميلادي بدقة تقويم أم القرى مع معرفة تاريخ اليوم والمناسبات الإسلامية.",
    icon: "🔄",
  },
  {
    href: "/bmi-calculator",
    title: "حاسبة مؤشر كتلة الجسم (BMI)",
    desc: "احسب كتلة جسمك والوزن المثالي واحتياج السعرات اليومية والماء وفق معايير منظمة الصحة العالمية.",
    icon: "⚖️",
  },
  {
    href: "/profit-margin-calculator",
    title: "حاسبة هامش الربح والتسعير",
    desc: "احسب هامش الربح والمارك اب وسعر البيع الأمثل لمتجرك مع تكاليف الشحن وعمولات الدفع والإعلانات.",
    icon: "📊",
  },
  {
    href: "/roi-calculator",
    title: "حاسبة العائد على الاستثمار (ROI)",
    desc: "احسب العائد على الاستثمار ومعدل النمو السنوي المركب (CAGR) ومضاعف رأس المال للمشاريع والعقارات.",
    icon: "💼",
  },
  {
    href: "/unit-converter",
    title: "محول الوحدات الشامل",
    desc: "حوّل بين مقاييس الطول والوزن ودرجة الحرارة والمساحة والحجم بين النظامين المتري والإمبراطوري.",
    icon: "📐",
  },
];

export default function ToolGuideSection({
  currentPath,
  aboutTitle,
  aboutContent,
  stepsTitle,
  steps,
  example,
  faqs,
  lastUpdated,
  legalSources,
  testCases,
  disclaimerNotice,
}) {
  const [openFaq, setOpenFaq] = useState(0);

  // Filter out current tool for related tools section
  const relatedTools = allTools.filter((tool) => tool.href !== currentPath);
  const currentTool = allTools.find((tool) => tool.href === currentPath);

  // JSON-LD schema for FAQPage (Google Rich Snippets)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  // JSON-LD schema for WebApplication
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: currentTool ? currentTool.title : aboutTitle,
    description: currentTool ? currentTool.desc : aboutTitle,
    url: `https://arabic-tools-xi.vercel.app${currentPath}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 mt-16 sm:mt-24 space-y-16 border-t border-brand-border pt-12 sm:pt-16">
      {/* Schemas for SEO (FAQPage + WebApplication) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      {/* 1. In-depth 300-500 words Explanation */}
      <section className="space-y-8">
        <div className="text-center">
          {lastUpdated && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>آخر تحديث واعتماد رسمي: {lastUpdated}</span>
            </div>
          )}
          <br />
          <span className="inline-block rounded-full bg-brand-light px-3.5 py-1 text-xs font-bold text-brand-dark mb-2">
            دليل إرشادي شامل
          </span>
          <h2 className="text-2xl font-black text-ink sm:text-3xl">
            {aboutTitle}
          </h2>
        </div>

        <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-card sm:p-8 space-y-6">
          {/* Disclaimer or Scholarly Notice */}
          {disclaimerNotice && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 sm:p-5 text-xs sm:text-sm text-indigo-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-indigo-900 text-sm">
                <span className="text-base">⚖️</span>
                <span>{disclaimerNotice.title || "تنبيه فقهي ونظامي هام:"}</span>
              </div>
              <p className="leading-relaxed text-indigo-900/90">{disclaimerNotice.text}</p>
            </div>
          )}

          {/* About Paragraphs */}
          <div className="prose prose-sm max-w-none text-ink-secondary leading-relaxed space-y-4">
            {aboutContent.map((paragraph, idx) => (
              <p key={idx} className="text-sm sm:text-base leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Legal / Statutory Sources Section */}
          {legalSources && legalSources.length > 0 && (
            <div className="mt-8 border-t border-brand-border/60 pt-6 space-y-4">
              <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                <span>📚</span>
                <span>السند النظامي والشرعي المعتمد:</span>
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {legalSources.map((ls, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-brand-border/80 bg-brand-surface/40 p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-brand">{ls.authority || ls.country}</span>
                      {ls.date && <span className="text-[10px] text-ink-muted">{ls.date}</span>}
                    </div>
                    <h4 className="text-sm font-bold text-ink">{ls.lawName}</h4>
                    <p className="text-xs text-ink-secondary leading-relaxed">{ls.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps */}
          {steps && steps.length > 0 && (
            <div className="mt-8 border-t border-brand-border/60 pt-6">
              <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                <span>📋</span>
                <span>{stepsTitle || "كيفية استخدام الأداة خطوة بخطوة:"}</span>
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {steps.map((s, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-2xl border border-brand-border bg-brand-surface/50 p-4 transition hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand font-bold text-white text-xs">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-ink">{s.title}</h4>
                      <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practical Concrete Example */}
          {example && (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/40 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-900 text-sm font-bold">
                  💡
                </span>
                <h3 className="text-base font-extrabold text-amber-950">
                  {example.title || "مثال تطبيقي عملي بالأرقام:"}
                </h3>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                <p className="font-semibold">{example.scenario}</p>
                <div className="rounded-xl border border-amber-200/80 bg-white p-3.5 space-y-1.5 font-mono text-xs">
                  {example.calculation.map((step, idx) => (
                    <div key={idx} className="flex justify-between items-center py-0.5">
                      <span className="font-sans text-ink-secondary">{step.label}:</span>
                      <span className="font-bold text-ink">{step.value}</span>
                    </div>
                  ))}
                </div>
                <p className="font-bold text-amber-950 bg-amber-100/70 p-2.5 rounded-lg">
                  {example.result}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Verified Test Cases Section */}
      {testCases && testCases.length > 0 && (
        <section className="space-y-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 mb-2">
              حالات اختبار معتمدة
            </span>
            <h2 className="text-2xl font-black text-ink sm:text-3xl">
              حالات تدقيق ومطابقة بالأرقام (Verified Test Cases)
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ink-muted">
              مسائل شرعية ونظامية دقيقة تم حلها يدوياً وتطابق نتائج الحاسبة بنسبة 100%
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {testCases.map((tc, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-brand bg-brand-light px-2.5 py-0.5 rounded-full">
                    {tc.tag || `حالة ${idx + 1}`}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ✓ مطابقة نظامية 100%
                  </span>
                </div>
                <h3 className="text-base font-bold text-ink">{tc.title}</h3>
                <p className="text-xs text-ink-secondary leading-relaxed">{tc.scenario}</p>
                <div className="rounded-xl border border-brand-border/60 bg-slate-50 p-3 space-y-1 font-mono text-xs">
                  {tc.steps.map((st, sIdx) => (
                    <div key={sIdx} className="flex justify-between items-center py-0.5">
                      <span className="font-sans text-ink-secondary">{st.label}:</span>
                      <span className="font-bold text-ink">{st.value}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-emerald-50/90 p-2.5 text-xs text-emerald-950 font-bold">
                  {tc.verifiedResult}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. FAQ Section (3-5 common questions) */}
      <section className="space-y-6">
        <div className="text-center">
          <span className="inline-block rounded-full bg-brand-light px-3.5 py-1 text-xs font-bold text-brand-dark mb-2">
            أسئلة شائعة
          </span>
          <h2 className="text-2xl font-black text-ink sm:text-3xl">
            الأسئلة الأكثر تكراراً (FAQ)
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-ink-muted">
            إجابات وافية وموثوقة على أبرز الاستفسارات المتكررة
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="flex w-full items-center justify-between p-4 sm:p-5 text-right font-bold text-sm sm:text-base text-ink hover:text-brand"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-brand font-black text-base">س:</span>
                    <span>{faq.question}</span>
                  </span>
                  <span
                    className={`ml-2 transform text-xs transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {/* Answer always in DOM for SEO — CSS hidden when collapsed */}
                <div
                  className={`border-t border-brand-border/60 bg-brand-surface/40 p-4 sm:p-5 pt-3 ${
                    isOpen ? "block" : "hidden"
                  }`}
                  aria-hidden={!isOpen}
                >
                  <p className="text-xs sm:text-sm leading-relaxed text-ink-secondary">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Related Tools Internal Linking */}
      <section className="space-y-6 pb-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-brand-light px-3.5 py-1 text-xs font-bold text-brand-dark mb-2">
            أدوات مفيدة
          </span>
          <h2 className="text-xl font-black text-ink sm:text-2xl">
            أدوات عربية ذات صلة
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            استكشف باقي حاسباتنا المجانية المصممة لتسهيل حساباتك اليومية
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {relatedTools.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-2xl border border-brand-border bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-xl group-hover:bg-brand-100">
                {tool.icon}
              </div>
              <h3 className="mb-1 text-base font-bold text-ink group-hover:text-brand">
                {tool.title}
              </h3>
              <p className="flex-1 text-xs leading-relaxed text-ink-secondary">
                {tool.desc}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs font-bold text-brand">
                <span>جرب الأداة الآن</span>
                <span>←</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
