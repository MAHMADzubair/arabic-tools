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
];

export default function ToolGuideSection({
  currentPath,
  aboutTitle,
  aboutContent,
  stepsTitle,
  steps,
  example,
  faqs,
}) {
  const [openFaq, setOpenFaq] = useState(0);

  // Filter out current tool for related tools section
  const relatedTools = allTools.filter((tool) => tool.href !== currentPath);

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

  return (
    <div className="mx-auto max-w-5xl px-4 mt-16 sm:mt-24 space-y-16 border-t border-brand-border pt-12 sm:pt-16">
      {/* FAQ Schema Script for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 1. In-depth 300-500 words Explanation */}
      <section className="space-y-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-brand-light px-3.5 py-1 text-xs font-bold text-brand-dark mb-2">
            دليل إرشادي شامل
          </span>
          <h2 className="text-2xl font-black text-ink sm:text-3xl">
            {aboutTitle}
          </h2>
        </div>

        <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-card sm:p-8 space-y-6">
          {/* About Paragraphs */}
          <div className="prose prose-sm max-w-none text-ink-secondary leading-relaxed space-y-4">
            {aboutContent.map((paragraph, idx) => (
              <p key={idx} className="text-sm sm:text-base leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

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

                {isOpen && (
                  <div className="border-t border-brand-border/60 bg-brand-surface/40 p-4 sm:p-5 pt-3">
                    <p className="text-xs sm:text-sm leading-relaxed text-ink-secondary">
                      {faq.answer}
                    </p>
                  </div>
                )}
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
            أدوات مالية وإسلامية ذات صلة
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
