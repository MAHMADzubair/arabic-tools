import AnnualLeaveCalculator from "@/components/AnnualLeaveCalculator";
import RelatedBusinessTools from "@/components/business/RelatedBusinessTools";
import OfficialSource from "@/components/business/OfficialSource";
import Link from "next/link";
import { SITE_URL } from "@/lib/siteConfig";

// ─── Metadata (unchanged) ─────────────────────────────────────────────────────
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
    canonical: "/annual-leave-calculator",
  },
  openGraph: {
    title: "حاسبة بدل الإجازات السنوية 2026 | رصيد الإجازة والتعويض النقدي",
    description:
      "احسب أجر الإجازة السنوية والتعويض النقدي عن رصيد الإجازات المتبقية بدقة وفق أنظمة العمل في السعودية والإمارات والكويت ومصر.",
    type: "website",
    locale: "ar_AR",
  },
};

// ─── JSON-LD (unchanged) ──────────────────────────────────────────────────────
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
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "حاسبة بدل الإجازات السنوية", item: `${SITE_URL}/annual-leave-calculator` },
  ],
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const STEPS = [
  "اختر دولة العمل لتطبيق القوانين الخاصة بها تلقائياً (السعودية، الإمارات، الكويت، مصر).",
  "أدخل الراتب الشهري المعتمد (الراتب الفعلي الشامل للبدلات أو الراتب الأساسي وفق اشتراطات الدولة).",
  "حدد سنوات الخدمة في المنشأة لمعرفة ما إذا كنت تستحق الشريحة العادية (21 يوماً) أو شريحة الأقدمية (30 يوماً).",
  "أدخل عدد أيام رصيد الإجازات المتبقية التي لم تستنفدها.",
  "تُظهر لك الحاسبة فوراً قيمة أجر اليوم، وقيمة إجازتك السنوية كاملة، وإجمالي التعويض النقدي المستحق الصرف.",
];

const LAWS = [
  {
    code: "SA",
    title: "نظام العمل السعودي (م/109 و111)",
    desc: "21 يوماً للسنوات الـ 5 الأولى، وتزاد إلى 30 يوماً بعد 5 سنوات. يُحسب التعويض على الأجر الفعلي.",
  },
  {
    code: "AE",
    title: "قانون العمل الإماراتي (م/29)",
    desc: "30 يوماً تقويمياً عن كل سنة خدمة كاملة. يُحسب تعويض الرصيد عند نهاية الخدمة على الراتب الأساسي.",
  },
  {
    code: "KW",
    title: "قانون العمل الكويتي (م/70)",
    desc: "30 يوم عمل مدفوعة الأجر عن كل سنة. يُقسم الأجر الشهري على 26 يوماً لحساب أجر اليوم.",
  },
  {
    code: "EG",
    title: "قانون العمل المصري (م/47)",
    desc: "21 يوماً، وتزاد إلى 30 يوماً لمن أمضى 10 سنوات في الخدمة أو تجاوز سن الخمسين عاماً.",
  },
];

const RELATED = [
  {
    href: "/ar/sa/final-settlement-calculator",
    title: "حاسبة المخالصة النهائية",
    desc: "تصفية شاملة لجميع مستحقات نهاية الخدمة والبدلات مع نموذج مخالصة نهائية قابل للطباعة",
    badge: "شاملة",
  },
  {
    href: "/gratuity-calculator",
    title: "حاسبة مكافأة نهاية الخدمة",
    desc: "احسب مكافأة نهاية الخدمة لـ 7 دول عربية وفق نصوص القوانين والاستقالة",
    badge: "7 دول",
  },
  {
    href: "/overtime-calculator",
    title: "حاسبة الأوفرتايم",
    desc: "احسب أجر الساعات الإضافية 125% و150% وفق أنظمة العمل الخليجية",
    badge: "150%",
  },
  {
    href: "/salary-calculator",
    title: "حاسبة الراتب الصافي",
    desc: "احسب صافي راتبك بعد التأمينات والضرائب لـ 6 دول عربية",
    badge: "GOSI / تأمينات",
  },
];

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
      <AnnualLeavePageStyles />

      <main className="ap-main" dir="rtl">
        {/* Breadcrumb */}
        <div className="ap-wrap ap-crumb-wrap">
          <nav aria-label="مسار التنقل" className="ap-crumb">
            <Link href="/">الرئيسية</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">حاسبة بدل الإجازات السنوية</span>
          </nav>
        </div>

        {/* Calculator */}
        <div className="ap-wrap">
          <AnnualLeaveCalculator />
        </div>

        {/* Cross-link banner */}
        <aside className="ap-wrap ap-gap-lg" aria-labelledby="ap-banner-title">
          <div className="ap-banner">
            <div className="ap-banner-text">
              <p className="ap-kicker">تصفية شاملة لجميع مستحقاتك</p>
              <h2 id="ap-banner-title" className="ap-banner-title">
                هل تُنهي خدمتك وتحتاج لمخالصة نهائية كاملة؟
              </h2>
              <p className="ap-banner-desc">
                احسب بدل الإجازة + مكافأة نهاية الخدمة + راتب آخر شهر + تعويض الإشعار مع إنشاء نموذج مخالصة نهائية قابل للطباعة.
              </p>
            </div>
            <Link href="/ar/sa/final-settlement-calculator" className="ap-btn">
              حاسبة المخالصة النهائية
            </Link>
          </div>
        </aside>

        {/* Explanation */}
        <section className="ap-wrap ap-gap-xl" aria-labelledby="ap-about-title">
          <div className="ap-card">
            <header className="ap-card-head">
              <h2 id="ap-about-title" className="ap-h2">
                ما هي حاسبة بدل الإجازات السنوية وما أهميتها القانونية؟
              </h2>
            </header>

            <div className="ap-body">
              <div className="ap-prose">
                <p>
                  تُعدّ <strong>الإجازة السنوية مدفوعة الأجر</strong> حقاً إنسانياً وقانونياً جوهرياً كفلته جميع تشريعات العمل العربية والدولية. والهدف منها هو ضمان تجديد نشاط العامل وراحته الذهنية والبدنية بعد عام كامل من العمل والإنتاج. غير أن الكثير من العمال لا يتمكنون من استنفاد كامل أيام إجازاتهم خلال السنة التعاقدية لأسباب تتعلق بضغط العمل أو متطلبات المنشأة.
                </p>
                <p>
                  عند انتهاء علاقة العمل أو الاستقالة، يُلزم القانون صاحب العمل بتعويض العامل نقدياً عن كامل رصيد الإجازات المتبقي لديه. توفر هذه الحاسبة أداة دقيقة لحساب استحقاقك السنوي من الأيام، وقيمة الأجر اليومي، وإجمالي المبلغ المستحق لك كبدل رصيد إجازات وفق نصوص أنظمة العمل في السعودية، الإمارات، الكويت، ومصر.
                </p>
              </div>

              {/* Steps */}
              <div>
                <h3 className="ap-h3">كيفية استخدام الحاسبة خطوة بخطوة</h3>
                <ol className="ap-steps">
                  {STEPS.map((text, i) => (
                    <li key={i} className="ap-step">
                      <span className="ap-num" aria-hidden="true">{i + 1}</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Example */}
              <div className="ap-example">
                <h3 className="ap-h3 ap-h3-flush">مثال عملي بالأرقام: موظف في الرياض</h3>
                <p className="ap-prose-sm">
                  <strong>البيانات:</strong> موظف يعمل في المملكة العربية السعودية براتب فعلي 12,000 ريال (أساسي + سكن + مواصلات)، أمضى في العمل 6 سنوات ولديه رصيد إجازات متبقٍ قدره 18 يوماً:
                </p>
                <dl className="ap-calc">
                  <div className="ap-calc-row">
                    <dt>الاستحقاق السنوي (خدمة أكثر من 5 سنوات م/109):</dt>
                    <dd>30 يوماً / سنة</dd>
                  </div>
                  <div className="ap-calc-row">
                    <dt>قيمة أجر اليوم (12,000 ÷ 30):</dt>
                    <dd>400.00 ر.س</dd>
                  </div>
                  <div className="ap-calc-row ap-calc-total">
                    <dt>التعويض المستحق عن 18 يوماً (18 × 400):</dt>
                    <dd>7,200.00 ر.س</dd>
                  </div>
                </dl>
              </div>

              {/* Legal comparison */}
              <div>
                <h3 className="ap-h3">السند القانوني المقارن بين الدول</h3>
                <ul className="ap-laws">
                  {LAWS.map((item) => (
                    <li key={item.code} className="ap-law">
                      <p className="ap-law-title">
                        <span className="ap-code" aria-hidden="true">{item.code}</span>
                        <span>{item.title}</span>
                      </p>
                      <p className="ap-law-desc">{item.desc}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="ap-wrap ap-gap-lg" aria-labelledby="ap-faq-title">
          <div className="ap-card">
            <header className="ap-card-head">
              <h2 id="ap-faq-title" className="ap-h2">
                الأسئلة الشائعة حول الإجازات السنوية وبدل الرصيد
              </h2>
            </header>
            <div>
              {faqJsonLd.mainEntity.map((faq, i) => (
                <div key={i} className="ap-faq">
                  <h3 className="ap-faq-q">{faq.name}</h3>
                  <p className="ap-faq-a">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related tools + source */}
        <section className="ap-wrap ap-gap-lg ap-last">
          <RelatedBusinessTools
            tools={RELATED}
            title="أدوات عمالية ومالية ذات صلة"
            subtitle="استكمل حسابات مستحقاتك الوظيفية بهذه الأدوات الشاملة"
          />
          <OfficialSource
            sourceText="أنظمة العمل الرسمية المقارنة في السعودية والإمارات والكويت ومصر"
            lastUpdated="2026م"
          />
        </section>
      </main>
    </>
  );
}

// ─── Ink & Signal page styles ────────────────────────────────────────────────
function AnnualLeavePageStyles() {
  return (
    <style>{`
      .ap-main{
        --ap-ink:#0a0a0a; --ap-paper:#ffffff; --ap-text2:#404040; --ap-orange:#ff5a1f;
        min-height:100vh; background:var(--ap-paper); color:var(--ap-ink);
        padding:1.5rem 0 0;
      }
      @media (min-width:640px){ .ap-main{ padding-top:2.5rem; } }
      @media (prefers-color-scheme: dark){
        :root:not([data-theme="light"]) .ap-main{
          --ap-ink:#f5f5f5; --ap-paper:#0a0a0a; --ap-text2:#d4d4d4;
        }
      }
      :root[data-theme="dark"] .ap-main{
        --ap-ink:#f5f5f5; --ap-paper:#0a0a0a; --ap-text2:#d4d4d4;
      }

      .ap-wrap{ max-width:48rem; margin:0 auto; padding:0 1rem; }
      .ap-gap-lg{ margin-top:2rem; }
      .ap-gap-xl{ margin-top:2rem; }
      .ap-last{ padding-bottom:3rem; display:grid; gap:1rem; }
      .ap-main a:focus-visible{ outline:3px solid var(--ap-orange); outline-offset:2px; }

      /* Breadcrumb */
      .ap-crumb-wrap{ padding-bottom:1rem; }
      .ap-crumb{ display:flex; gap:.5rem; align-items:center; font-size:.75rem; color:var(--ap-text2); }
      .ap-crumb a{ color:var(--ap-ink); text-decoration:underline; text-underline-offset:3px; }
      .ap-crumb [aria-current]{ font-weight:800; color:var(--ap-ink); }

      /* Banner (orange panel, black text) */
      .ap-banner{
        display:flex; flex-direction:column; gap:1rem; align-items:flex-start;
        background:var(--ap-orange); color:#0a0a0a;
        border:2px solid var(--ap-ink); padding:1.25rem;
      }
      @media (min-width:640px){
        .ap-banner{ flex-direction:row; align-items:center; justify-content:space-between; }
      }
      .ap-kicker{ margin:0; font-size:.6875rem; font-weight:800; letter-spacing:.04em; }
      .ap-banner-title{ margin:.25rem 0 0; font-size:1.0625rem; font-weight:800; }
      .ap-banner-desc{ margin:.5rem 0 0; font-size:.75rem; line-height:1.7; }
      .ap-btn{
        flex:none; display:inline-block; padding:.625rem 1rem;
        background:#0a0a0a; color:#ffffff; border:2px solid #0a0a0a;
        font-size:.75rem; font-weight:800; text-decoration:none;
      }
      .ap-btn:hover{ background:#ffffff; color:#0a0a0a; }
      .ap-banner .ap-btn:focus-visible{ outline:3px solid #0a0a0a; outline-offset:3px; }

      /* Cards */
      .ap-card{ border:2px solid var(--ap-ink); background:var(--ap-paper); }
      .ap-card-head{ padding:1rem 1.25rem; border-bottom:2px solid var(--ap-ink); }
      .ap-h2{ margin:0; font-size:1.25rem; font-weight:800; line-height:1.5; }
      .ap-h3{ margin:0 0 .75rem; font-size:1rem; font-weight:800; }
      .ap-h3-flush{ margin-bottom:.5rem; }
      .ap-body{ padding:1.25rem; display:grid; gap:1.75rem; }
      @media (min-width:640px){ .ap-body{ padding:1.5rem 2rem; } .ap-card-head{ padding:1.25rem 2rem; } }

      .ap-prose{ display:grid; gap:.75rem; font-size:.875rem; line-height:1.9; color:var(--ap-text2); }
      .ap-prose p,.ap-prose-sm{ margin:0; }
      .ap-prose strong,.ap-prose-sm strong{ color:var(--ap-ink); font-weight:800; }
      .ap-prose-sm{ font-size:.8125rem; line-height:1.8; color:var(--ap-text2); }

      /* Steps */
      .ap-steps{ list-style:none; margin:0; padding:0; display:grid; gap:.625rem; }
      .ap-step{ display:flex; gap:.75rem; align-items:flex-start; font-size:.875rem; line-height:1.8; color:var(--ap-text2); }
      .ap-num{
        flex:none; width:1.5rem; height:1.5rem; margin-top:.125rem;
        display:inline-flex; align-items:center; justify-content:center;
        border:2px solid var(--ap-ink); color:var(--ap-ink);
        font-size:.75rem; font-weight:800;
      }

      /* Worked example */
      .ap-example{ border:2px dashed var(--ap-ink); padding:1.25rem; }
      .ap-calc{ margin:.75rem 0 0; display:grid; border:2px solid var(--ap-ink); }
      .ap-calc-row{
        display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap;
        padding:.625rem .75rem; border-bottom:1px solid var(--ap-ink);
        font-size:.75rem;
      }
      .ap-calc-row:last-child{ border-bottom:0; }
      .ap-calc-row dt{ margin:0; color:var(--ap-text2); }
      .ap-calc-row dd{ margin:0; font-weight:800; color:var(--ap-ink); }
      .ap-calc-total{ background:var(--ap-orange); font-size:.875rem; }
      .ap-calc-total dt,.ap-calc-total dd{ color:#0a0a0a; font-weight:800; }

      /* Laws */
      .ap-laws{ list-style:none; margin:0; padding:0; display:grid; grid-template-columns:1fr; border:2px solid var(--ap-ink); }
      .ap-law{ padding:.875rem; border-bottom:1px solid var(--ap-ink); }
      .ap-law:last-child{ border-bottom:0; }
      .ap-law-title{ margin:0; display:flex; gap:.5rem; align-items:center; font-size:.75rem; font-weight:800; }
      .ap-code{
        flex:none; padding:0 .375rem; border:2px solid var(--ap-ink);
        font-size:.625rem; font-weight:800; letter-spacing:.04em; line-height:1.6;
      }
      .ap-law-desc{ margin:.375rem 0 0; font-size:.75rem; line-height:1.8; color:var(--ap-text2); }
      @media (min-width:640px){
        .ap-laws{ grid-template-columns:1fr 1fr; }
        .ap-law:nth-child(odd){ border-inline-end:1px solid var(--ap-ink); }
        .ap-law:nth-last-child(-n+2){ border-bottom:0; }
      }

      /* FAQ */
      .ap-faq{ padding:1.125rem 1.25rem; border-bottom:1px solid var(--ap-ink); }
      .ap-faq:last-child{ border-bottom:0; }
      .ap-faq-q{ margin:0 0 .5rem; font-size:.875rem; font-weight:800; line-height:1.7;
        border-inline-start:6px solid var(--ap-orange); padding-inline-start:.625rem; }
      .ap-faq-a{ margin:0; font-size:.875rem; line-height:1.9; color:var(--ap-text2); }
      @media (min-width:640px){ .ap-faq{ padding:1.25rem 2rem; } }

      @media print{
        .ap-banner{ background:none; border-color:#000; color:#000; }
        .ap-banner .ap-btn,.ap-calc-total{ background:none; color:#000; }
        .ap-main{ color:#000; }
      }
    `}</style>
  );
}