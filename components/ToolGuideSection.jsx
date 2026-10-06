"use client";

/**
 * components/ToolGuideSection.jsx
 * Ink & Signal: shared guide section (about, sources, steps, example,
 * test cases, FAQ, related tools).
 * Props and JSON-LD are unchanged. Changes: styling is local (no Tailwind
 * color classes), emoji icons removed, FAQ gets aria-controls, answers stay
 * in the DOM (via `hidden`) for SEO.
 */
import { useState } from "react";
import { SITE_URL, SITE_ORG_ID } from "@/lib/siteConfig";

const allTools = [
  { href: "/zakat-calculator", title: "حاسبة الزكاة", desc: "احسب زكاتك بدقة بناءً على نصاب الفضة الحالي مع دعم الأصول والالتزامات." },
  { href: "/inheritance-calculator", title: "حاسبة الميراث الشرعية", desc: "احسب توزيع التركة الشرعية بدقة وفق الفرائض والعصبات والعول والرد." },
  { href: "/loan-calculator", title: "حاسبة القروض والتمويل", desc: "احسب القسط الشهري وإجمالي الفائدة وجدول السداد الكامل لأي قرض أو تمويل." },
  { href: "/currency-converter", title: "محول العملات الفوري", desc: "حوّل بين الريال والدرهم والدولار واليورو وأكثر من ١٢ عملة بأسعار محدثة." },
  { href: "/vat-calculator", title: "حاسبة ضريبة القيمة المضافة", desc: "احسب الضريبة المضافة (١٥٪ أو ٥٪) أو استخرج السعر الأصلي بسهولة." },
  { href: "/zakat-al-fitr", title: "حاسبة زكاة الفطر", desc: "احسب صاع زكاة الفطر بالكيلوجرام (أرز وحبوب) أو نقداً لجميع أفراد الأسرة." },
  { href: "/kaffara-calculator", title: "حاسبة الكفارات والفدية", desc: "احسب كفارة اليمين وفدية صيام رمضان والنذر عيناً بالأرز أو نقداً." },
  { href: "/umrah-calculator", title: "حاسبة تكلفة العمرة", desc: "قدّر تكلفة رحلتك للعمرة شاملاً الطيران والفندق والتأشيرة والطعام لأي عدد من المسافرين." },
  { href: "/salary-calculator", title: "حاسبة الراتب الصافي", desc: "احسب صافي راتبك بعد الضرائب والتأمينات لـ 6 دول مع تفصيل كامل للبدلات والخصومات." },
  { href: "/mortgage-calculator", title: "حاسبة التمويل العقاري", desc: "احسب قسط الرهن العقاري وجدول السداد الكامل مع الدفعة الأولى والتأمين والرسوم." },
  { href: "/compound-interest", title: "حاسبة الفائدة المركبة", desc: "احسب نمو استثمارك مع الفائدة المركبة والمساهمات الشهرية مع مخطط النمو السنوي." },
  { href: "/gratuity-calculator", title: "حاسبة مكافأة نهاية الخدمة", desc: "احسب مكافأة نهاية الخدمة القانونية لـ 7 دول عربية وفق أحدث قوانين العمل ومواد الاستقالة والفصل." },
  { href: "/ar/sa/final-settlement-calculator", title: "حاسبة المخالصة النهائية بالسعودية", desc: "تصفية كاملة لمستحقات العامل: نهاية الخدمة، آخر راتب، رصيد الإجازات، ومهلة الإشعار مع نموذج مخالصة قابل للطباعة." },
  { href: "/ar/sa/vat-registration-checker", title: "حاسبة أهلية ضريبة القيمة المضافة بالسعودية", desc: "تحقق من التزامك بالتسجيل الإلزامي (375 ألف ريال) أو الاختياري (187.5 ألف) وفق معايير ZATCA." },
  { href: "/ar/sa/e-invoice-generator", title: "مولد الفاتورة الإلكترونية السعودية", desc: "أنشئ نموذج فاتورة إلكترونية سعودية قابل للطباعة: فاتورة ضريبية B2B وفاتورة مبسطة B2C مع احتساب VAT 15%." },
  { href: "/hijri-age-calculator", title: "حاسبة العمر بالهجري", desc: "احسب عمرك الدقيق بالهجري والميلادي وفق تقويم أم القرى مع موعد يوم ميلادك القادم وإحصائيات حياتك." },
  { href: "/date-converter", title: "محول التاريخ الهجري والميلادي", desc: "حوّل بين التاريخين الهجري والميلادي بدقة تقويم أم القرى مع معرفة تاريخ اليوم والمناسبات الإسلامية." },
  { href: "/bmi-calculator", title: "حاسبة مؤشر كتلة الجسم (BMI)", desc: "احسب كتلة جسمك والوزن المثالي واحتياج السعرات اليومية والماء وفق معايير منظمة الصحة العالمية." },
  { href: "/profit-margin-calculator", title: "حاسبة هامش الربح والتسعير", desc: "احسب هامش الربح والمارك اب وسعر البيع الأمثل لمتجرك مع تكاليف الشحن وعمولات الدفع والإعلانات." },
  { href: "/roi-calculator", title: "حاسبة العائد على الاستثمار (ROI)", desc: "احسب العائد على الاستثمار ومعدل النمو السنوي المركب (CAGR) ومضاعف رأس المال للمشاريع والعقارات." },
  { href: "/unit-converter", title: "محول الوحدات الشامل", desc: "حوّل بين مقاييس الطول والوزن ودرجة الحرارة والمساحة والحجم بين النظامين المتري والإمبراطوري." },
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

  const relatedTools = allTools.filter((tool) => tool.href !== currentPath);
  const currentTool = allTools.find((tool) => tool.href === currentPath);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: currentTool ? currentTool.title : aboutTitle,
    description: currentTool ? currentTool.desc : aboutTitle,
    url: `${SITE_URL}${currentPath}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": SITE_ORG_ID },
  };

  return (
    <div className="tg-root" dir="rtl">
      <GuideStyles />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />

      {/* 1. About */}
      <section className="tg-section" aria-labelledby="tg-about">
        <header className="tg-head">
          {lastUpdated && <p className="tg-tag">آخر مراجعة للمحتوى: {lastUpdated}</p>}
          <h2 id="tg-about" className="tg-h2">{aboutTitle}</h2>
        </header>

        <div className="tg-card">
          {disclaimerNotice && (
            <aside className="tg-notice">
              <p className="tg-notice-title">
                <span className="tg-mark" aria-hidden="true">!</span>
                {disclaimerNotice.title || "تنبيه فقهي ونظامي هام:"}
              </p>
              <p className="tg-text">{disclaimerNotice.text}</p>
            </aside>
          )}

          <div className="tg-prose">
            {aboutContent.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {legalSources && legalSources.length > 0 && (
            <div className="tg-block">
              <h3 className="tg-h3">السند النظامي والمرجعي</h3>
              <div className="tg-grid2">
                {legalSources.map((ls, idx) => (
                  <article key={idx} className="tg-box">
                    <div className="tg-box-top">
                      <span className="tg-strong">{ls.authority || ls.country}</span>
                      {ls.date && <span className="tg-small">{ls.date}</span>}
                    </div>
                    <h4 className="tg-h4">{ls.lawName}</h4>
                    <p className="tg-text">{ls.details}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {steps && steps.length > 0 && (
            <div className="tg-block">
              <h3 className="tg-h3">{stepsTitle || "كيفية استخدام الأداة خطوة بخطوة"}</h3>
              <ol className="tg-grid2 tg-steps">
                {steps.map((s, i) => (
                  <li key={i} className="tg-box tg-step">
                    <span className="tg-num" aria-hidden="true">{i + 1}</span>
                    <div>
                      <h4 className="tg-h4">{s.title}</h4>
                      <p className="tg-text">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {example && (
            <div className="tg-block">
              <section className="tg-example" aria-labelledby="tg-ex">
                <h3 id="tg-ex" className="tg-h3">{example.title || "مثال تطبيقي عملي بالأرقام"}</h3>
                <p className="tg-strong">{example.scenario}</p>
                <dl className="tg-calc">
                  {example.calculation.map((step, idx) => (
                    <div key={idx} className="tg-calc-row">
                      <dt>{step.label}</dt>
                      <dd>{step.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="tg-result">{example.result}</p>
              </section>
            </div>
          )}
        </div>
      </section>

      {/* Test cases */}
      {testCases && testCases.length > 0 && (
        <section className="tg-section" aria-labelledby="tg-tests">
          <header className="tg-head">
            <h2 id="tg-tests" className="tg-h2">أمثلة تطبيقية بالأرقام (Test Cases)</h2>
            <p className="tg-text">مسائل نظامية تم حلها يدوياً لتوضيح طريقة الحساب. النتائج تقديرية حسب المدخلات.</p>
          </header>

          <div className="tg-grid2">
            {testCases.map((tc, idx) => (
              <article key={idx} className="tg-card tg-case">
                <div className="tg-box-top">
                  <span className="tg-tag">{tc.tag || `حالة ${idx + 1}`}</span>
                  <span className="tg-small">نتيجة تقديرية</span>
                </div>
                <h3 className="tg-h4">{tc.title}</h3>
                <p className="tg-text">{tc.scenario}</p>
                <dl className="tg-calc">
                  {tc.steps.map((st, sIdx) => (
                    <div key={sIdx} className="tg-calc-row">
                      <dt>{st.label}</dt>
                      <dd>{st.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="tg-result">{tc.verifiedResult}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 2. FAQ */}
      <section className="tg-section" aria-labelledby="tg-faq">
        <header className="tg-head">
          <h2 id="tg-faq" className="tg-h2">الأسئلة الأكثر تكراراً (FAQ)</h2>
          <p className="tg-text">إجابات على أبرز الاستفسارات المتكررة</p>
        </header>

        <div className="tg-faq">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="tg-faq-item">
                <h3 className="tg-faq-q">
                  <button
                    type="button"
                    id={`tg-q${idx}`}
                    aria-expanded={isOpen}
                    aria-controls={`tg-a${idx}`}
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  >
                    <span>{faq.question}</span>
                    <span className="tg-sign" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                  </button>
                </h3>
                {/* Always in DOM for SEO; hidden when collapsed */}
                <div id={`tg-a${idx}`} role="region" aria-labelledby={`tg-q${idx}`} hidden={!isOpen} className="tg-faq-a">
                  <p className="tg-text">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Related tools */}
      <nav className="tg-section tg-last" aria-labelledby="tg-related">
        <header className="tg-head">
          <h2 id="tg-related" className="tg-h2 tg-h2-sm">أدوات عربية ذات صلة</h2>
          <p className="tg-text">استكشف باقي حاسباتنا المجانية المصممة لتسهيل حساباتك اليومية</p>
        </header>

        <ul className="tg-grid3">
          {relatedTools.map((tool) => (
            <li key={tool.href}>
              <a href={tool.href} className="tg-tool">
                <span className="tg-tool-title">{tool.title}</span>
                <span className="tg-text">{tool.desc}</span>
                <span className="tg-tool-cta">جرّب الأداة الآن</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/**
 * Local styles. Map the --tg-* fallbacks to your real Ink & Signal tokens.
 */
function GuideStyles() {
  return (
    <style>{`
      .tg-root{
        --tg-ink:#0a0a0a; --tg-paper:#ffffff; --tg-muted:#f0f0f0;
        --tg-text2:#404040; --tg-orange:#ff5a1f;
        max-width:64rem; margin:4rem auto 0; padding:3rem 1rem 0;
        border-top:2px solid var(--tg-ink);
        color:var(--tg-ink); background:var(--tg-paper);
        display:grid; gap:4rem;
      }
      @media (min-width:640px){ .tg-root{ margin-top:6rem; padding-top:4rem; } }
      @media (prefers-color-scheme: dark){
        :root:not([data-theme="light"]) .tg-root{
          --tg-ink:#f5f5f5; --tg-paper:#0a0a0a; --tg-muted:#1a1a1a; --tg-text2:#d4d4d4;
        }
      }
      :root[data-theme="dark"] .tg-root{
        --tg-ink:#f5f5f5; --tg-paper:#0a0a0a; --tg-muted:#1a1a1a; --tg-text2:#d4d4d4;
      }
      .tg-root :focus-visible{ outline:3px solid var(--tg-orange); outline-offset:2px; }

      .tg-section{ display:grid; gap:1.5rem; }
      .tg-last{ padding-bottom:2rem; }
      .tg-head{ display:grid; gap:.5rem; justify-items:center; text-align:center; }
      .tg-h2{ margin:0; font-size:1.5rem; font-weight:800; line-height:1.5; }
      @media (min-width:640px){ .tg-h2{ font-size:1.875rem; } }
      .tg-h2-sm{ font-size:1.25rem; }
      .tg-h3{ margin:0; font-size:1rem; font-weight:800; }
      .tg-h4{ margin:0; font-size:.875rem; font-weight:800; line-height:1.6; }
      .tg-text{ margin:0; font-size:.75rem; line-height:1.9; color:var(--tg-text2); }
      .tg-small{ font-size:.6875rem; color:var(--tg-text2); }
      .tg-strong{ font-size:.8125rem; font-weight:800; }

      .tg-tag{
        display:inline-block; margin:0; padding:.125rem .75rem;
        border:2px solid var(--tg-ink); font-size:.75rem; font-weight:800;
      }
      .tg-mark{
        flex:none; width:1.25rem; height:1.25rem; display:inline-flex;
        align-items:center; justify-content:center; border:2px solid currentColor; font-weight:800;
      }

      /* Cards */
      .tg-card{ border:2px solid var(--tg-ink); padding:1.25rem; display:grid; gap:1.5rem; align-content:start; }
      @media (min-width:640px){ .tg-card{ padding:2rem; } }
      .tg-case{ padding:1.25rem; gap:.75rem; }
      .tg-box{ border:2px solid var(--tg-ink); padding:1rem; display:grid; gap:.375rem; align-content:start; }
      .tg-box-top{ display:flex; justify-content:space-between; align-items:center; gap:.5rem; flex-wrap:wrap; }
      .tg-block{ border-top:2px solid var(--tg-ink); padding-top:1.5rem; display:grid; gap:1rem; }
      .tg-grid2{ display:grid; gap:.75rem; grid-template-columns:1fr; margin:0; padding:0; list-style:none; }
      @media (min-width:640px){ .tg-grid2{ grid-template-columns:1fr 1fr; } }
      .tg-grid3{ display:grid; gap:1rem; grid-template-columns:1fr; margin:0; padding:0; list-style:none; }
      @media (min-width:640px){ .tg-grid3{ grid-template-columns:repeat(2,1fr); } }
      @media (min-width:900px){ .tg-grid3{ grid-template-columns:repeat(3,1fr); } }

      .tg-prose{ display:grid; gap:1rem; }
      .tg-prose p{ margin:0; font-size:.9375rem; line-height:2; color:var(--tg-text2); max-width:70ch; }

      /* Disclaimer notice */
      .tg-notice{
        border:2px solid var(--tg-ink); border-inline-start:6px solid var(--tg-orange);
        padding:.875rem 1rem; display:grid; gap:.375rem;
      }
      .tg-notice-title{ margin:0; display:flex; align-items:center; gap:.5rem; font-size:.8125rem; font-weight:800; }

      /* Steps */
      .tg-step{ grid-template-columns:auto 1fr; gap:.75rem; align-items:start; }
      .tg-num{
        width:1.75rem; height:1.75rem; display:inline-flex; align-items:center; justify-content:center;
        border:2px solid var(--tg-ink); font-size:.8125rem; font-weight:800;
      }

      /* Example + calc rows */
      .tg-example{ border:2px dashed var(--tg-ink); padding:1.25rem; display:grid; gap:.75rem; }
      .tg-calc{ margin:0; border:2px solid var(--tg-ink); }
      .tg-calc-row{
        display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap;
        padding:.375rem .75rem; border-top:1px solid var(--tg-ink); font-size:.75rem;
      }
      .tg-calc-row:first-child{ border-top:0; }
      .tg-calc-row dt{ margin:0; color:var(--tg-text2); }
      .tg-calc-row dd{ margin:0; font-weight:800; direction:ltr; unicode-bidi:isolate; }
      .tg-result{
        margin:0; padding:.625rem .75rem; background:var(--tg-orange); color:#0a0a0a;
        border:2px solid var(--tg-ink); font-size:.8125rem; font-weight:800; line-height:1.8;
        print-color-adjust:exact; -webkit-print-color-adjust:exact;
      }

      /* FAQ */
      .tg-faq{ display:grid; gap:.75rem; }
      .tg-faq-item{ border:2px solid var(--tg-ink); }
      .tg-faq-q{ margin:0; }
      .tg-faq-q button{
        width:100%; display:flex; justify-content:space-between; align-items:center; gap:1rem;
        padding:1rem 1.25rem; border:0; background:var(--tg-paper); color:var(--tg-ink);
        font-family:inherit; font-size:.9375rem; font-weight:800; text-align:start; cursor:pointer;
      }
      .tg-faq-q button:hover{ background:var(--tg-muted); }
      .tg-faq-q button[aria-expanded="true"]{ background:var(--tg-ink); color:var(--tg-paper); }
      .tg-sign{ flex:none; font-size:1.125rem; font-weight:900; line-height:1; }
      .tg-faq-a{ padding:1rem 1.25rem; border-top:2px solid var(--tg-ink); }
      .tg-faq-a[hidden]{ display:none; }
      .tg-faq-a .tg-text{ font-size:.8125rem; max-width:70ch; }

      /* Related tools */
      .tg-tool{
        height:100%; box-sizing:border-box; display:grid; gap:.5rem; align-content:start;
        padding:1.25rem; border:2px solid var(--tg-ink); color:var(--tg-ink);
        background:var(--tg-paper); text-decoration:none;
      }
      .tg-tool:hover{ background:var(--tg-muted); }
      .tg-tool:hover .tg-tool-title{ text-decoration:underline; text-underline-offset:4px; }
      .tg-tool-title{ font-size:.9375rem; font-weight:800; line-height:1.6; }
      .tg-tool-cta{
        margin-top:.25rem; padding-top:.5rem; border-top:2px solid var(--tg-orange);
        font-size:.75rem; font-weight:800;
      }
    `}</style>
  );
}