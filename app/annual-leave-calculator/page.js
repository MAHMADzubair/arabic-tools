import AnnualLeaveCalculator from "@/components/AnnualLeaveCalculator";
import GeoAnswerSummary from "@/components/GeoAnswerSummary";
import Link from "next/link";
import { TOOL_PAGE_CSS } from "@/lib/toolPageCss";
import { SITE_URL, SITE_NAME, SITE_ORG_ID, SITE_WEBSITE_ID, DEFAULT_OG_IMAGE } from "@/lib/siteConfig";

const PATH = "/annual-leave-calculator";
const LAST_REVIEWED = "نوفمبر 2026";
const LAST_REVIEWED_ISO = "2026-11-10";
const TITLE = "حاسبة بدل الإجازات السنوية 2026 | السعودية والإمارات";
const DESC =
  "احسب رصيد الإجازة السنوية وبدلها عند ترك العمل في السعودية والإمارات والكويت ومصر: الاستحقاق السنوي وأجر اليوم والتعويض، وفق قانون كل دولة. مجاناً.";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: `${SITE_URL}${PATH}`,
    siteName: SITE_NAME,
    type: "website",
    locale: "ar_AR",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

// ─── قواعد الدول (مصدر واحد للجدول والبيانات المنظمة) ─────────────────────────
// الدولة، الاستحقاق، أساس البدل، أجر اليوم، السند
const COUNTRY_RULES = [
  {
    code: "SA",
    name: "السعودية",
    days: "21 يوماً، و30 يوماً بعد 5 سنوات متصلة",
    basis: "الأجر الفعلي (الأساسي + البدلات)",
    daily: "30",
    law: "نظام العمل، المادتان 109 و111",
  },
  {
    code: "AE",
    name: "الإمارات",
    days: "30 يوماً عن كل سنة، ويومان عن كل شهر بين 6 و12 شهراً",
    basis: "الراتب الأساسي فقط",
    daily: "30",
    law: "المرسوم بقانون 33 لسنة 2021، المادة 29",
  },
  {
    code: "KW",
    name: "الكويت",
    days: "30 يوم عمل",
    basis: "الأجر",
    daily: "26",
    law: "قانون العمل 6 لسنة 2010، المواد 70 إلى 74",
  },
  {
    code: "EG",
    name: "مصر",
    days: "15 يوماً في السنة الأولى، و21 من الثانية، و30 بعد 10 سنوات أو سن الخمسين",
    basis: "الأجر الشامل",
    daily: "30",
    law: "قانون العمل 14 لسنة 2025",
  },
];

// ─── FAQ (مصدر واحد للقسم المرئي ولبيانات FAQPage) ────────────────────────────
const FAQ = [
  {
    q: "كم عدد أيام الإجازة السنوية المستحقة للعامل في نظام العمل السعودي؟",
    a: "وفق المادة (109) من نظام العمل السعودي: يستحق العامل إجازة سنوية مدفوعة الأجر لا تقل عن 21 يوماً، وتُزاد إلى ما لا يقل عن 30 يوماً إذا أمضى العامل 5 سنوات متصلة لدى صاحب العمل نفسه.",
  },
  {
    q: "كيف يُحسب التعويض النقدي عن رصيد الإجازة السنوية غير المستنفدة؟",
    a: "يُقسم الأجر الشهري المعتمد على عدد أيام الشهر في قانون الدولة للحصول على أجر اليوم (30 في السعودية والإمارات ومصر، و26 في الكويت)، ثم يُضرب أجر اليوم في عدد أيام الرصيد غير المستنفد. مثال سعودي: 12,000 ÷ 30 = 400 ريال، و18 يوماً × 400 = 7,200 ريال.",
  },
  {
    q: "هل يُعتمد الراتب الأساسي أم الراتب الفعلي الشامل لحساب بدل الإجازة؟",
    a: "يختلف ذلك بين الدول. في السعودية يُحسب على الأجر الفعلي الأخير (الأساسي مضافاً إليه البدلات الثابتة كالسكن والنقل). أما في الإمارات فيُحسب بدل الرصيد عند نهاية الخدمة على الراتب الأساسي فقط وفق المادة (29) من قانون العمل الاتحادي والمادة (19) من لائحته التنفيذية.",
  },
  {
    q: "كم الإجازة السنوية في قانون العمل المصري الجديد؟",
    a: "وفق قانون العمل رقم 14 لسنة 2025 المعمول به منذ 1 سبتمبر 2025: 15 يوماً في السنة الأولى من الخدمة، و21 يوماً اعتباراً من السنة الثانية، و30 يوماً لمن أمضى 10 سنوات في الخدمة أو تجاوز سن الخمسين، و45 يوماً للأشخاص ذوي الإعاقة. ولا تدخل العطلات الرسمية والأسبوعية ضمن الإجازة.",
  },
  {
    q: "هل يستحق العامل في الإمارات إجازة قبل إتمام السنة الأولى؟",
    a: "نعم. وفق المادة (29) يستحق العامل الذي أمضى أكثر من 6 أشهر وأقل من سنة يومين عن كل شهر. وبعد إتمام السنة يستحق 30 يوماً عن كل سنة. وعند ترك العمل يُصرف بدل الأيام غير المستخدمة، بما فيها كسور السنة، على أساس الراتب الأساسي.",
  },
  {
    q: "لماذا يُقسم الراتب على 26 في الكويت؟",
    a: "لأن الإجازة السنوية في قانون العمل الكويتي محسوبة بأيام العمل (30 يوم عمل)، فيُحسب أجر يوم العمل بقسمة الأجر الشهري على 26 يوماً، وهو ما تعتمده هذه الحاسبة لموظفي الكويت.",
  },
  {
    q: "متى يجب على صاحب العمل دفع أجر الإجازة السنوية؟",
    a: "تُلزم قوانين العمل في السعودية والإمارات والكويت صاحب العمل بدفع أجر الإجازة السنوية مقدماً قبل أن يبدأ العامل إجازته. أما بدل الرصيد غير المستنفد فيُصرف ضمن المخالصة النهائية عند انتهاء العلاقة العمالية.",
  },
  {
    q: "هل يسقط حق العامل في بدل الإجازات السنوية إذا لم يطلبها؟",
    a: "الأصل أن البدل يُستحق عند ترك العمل عن الأيام التي لم يستخدمها العامل. لكن بعض القوانين تضع قيوداً؛ فمثلاً ينص قانون العمل المصري الجديد على سقوط الحق في البدل إذا رفض العامل الإجازة كتابة. راجع قانون دولتك وعقد العمل.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "حاسبة بدل الإجازات السنوية", item: `${SITE_URL}${PATH}` },
  ],
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}${PATH}#app`,
  name: "حاسبة بدل الإجازات السنوية",
  alternateName: ["حاسبة رصيد الإجازات", "حاسبة تعويض الإجازات", "حاسبة إجازة سنوية"],
  url: `${SITE_URL}${PATH}`,
  inLanguage: "ar",
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript",
  applicationCategory: "BusinessApplication",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description: DESC,
  dateModified: LAST_REVIEWED_ISO,
  areaServed: COUNTRY_RULES.map((c) => ({ "@type": "Country", name: c.code })),
  featureList: [
    "الاستحقاق السنوي حسب الدولة ومدة الخدمة",
    "أجر اليوم: ÷ 30 أو ÷ 26 في الكويت",
    "بدل رصيد الإجازة غير المستنفد",
    "تقدير الرصيد المتراكم عن جزء من السنة",
  ],
  publisher: { "@id": SITE_ORG_ID },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}${PATH}#webpage`,
  url: `${SITE_URL}${PATH}`,
  name: TITLE,
  description: DESC,
  inLanguage: "ar",
  isPartOf: { "@id": SITE_WEBSITE_ID },
  publisher: { "@id": SITE_ORG_ID },
  dateModified: LAST_REVIEWED_ISO,
  mainEntity: { "@id": `${SITE_URL}${PATH}#app` },
  about: [
    { "@type": "Thing", name: "الإجازة السنوية" },
    { "@type": "Thing", name: "بدل الإجازات" },
    ...COUNTRY_RULES.map((c) => ({ "@type": "Legislation", name: c.law, legislationJurisdiction: c.code })),
  ],
  speakable: { "@type": "SpeakableSpecification", cssSelector: [".fp-def", ".fp-quick"] },
};

// ─── Content data ─────────────────────────────────────────────────────────────
const STEPS = [
  "اختر دولة العمل لتطبيق قانونها تلقائياً (السعودية، الإمارات، الكويت، مصر).",
  "أدخل الراتب الشهري المعتمد: الأجر الفعلي في السعودية، أو الراتب الأساسي في الإمارات.",
  "أدخل سنوات الخدمة ليتحدد الاستحقاق السنوي حسب قانون الدولة.",
  "أدخل رصيد الإجازة المتبقي بالأيام، أو احسبه من «لا تعرف رصيدك؟ احسبه».",
  "اقرأ النتيجة: أجر اليوم، أجر الإجازة السنوية الكاملة، وبدل الرصيد المتبقي.",
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "كيف تحسب بدل الإجازة السنوية",
  inLanguage: "ar",
  step: STEPS.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
};

const EXAMPLE = [
  ["الاستحقاق السنوي", "أكمل 5 سنوات متصلة", "30 يوماً"],
  ["أجر اليوم الواحد", "12,000 ÷ 30", "400.00 ر.س"],
  ["أجر الإجازة السنوية الكاملة", "30 × 400", "12,000.00 ر.س"],
];

const RELATED = [
  { href: "/ar/sa/annual-leave-calculator", title: "حاسبة بدل الإجازات السنوية بالسعودية", desc: "وفق المادتين 109 و111 من نظام العمل السعودي بالأجر الفعلي", tag: "السعودية" },
  { href: "/ar/sa/final-settlement-calculator", title: "حاسبة المخالصة النهائية", desc: "تصفية شاملة لمستحقات نهاية الخدمة مع نموذج قابل للطباعة" },
  { href: "/gratuity-calculator", title: "حاسبة مكافأة نهاية الخدمة", desc: "مكافأة نهاية الخدمة لعدة دول عربية حسب القانون وسبب الإنهاء" },
  { href: "/overtime-calculator", title: "حاسبة العمل الإضافي", desc: "أجر الساعات الإضافية وفق أنظمة العمل الخليجية" },
  { href: "/salary-calculator", title: "حاسبة الراتب الصافي", desc: "صافي الراتب بعد التأمينات لعدة دول عربية" },
];

// يُكمل الأنماط المشتركة: تثبيت لوحة النتيجة على الشاشات العريضة
// (globals.css يضع overflow-x:hidden على html و body معاً فيتعطل position:sticky).
const PAGE_CSS = `
@media(min-width:960px){body{overflow-x:clip}}
.fp .alc{max-width:none}
.fp .alc-note{padding:.75rem .9rem}
.fp .alc-legal{padding-inline:.4rem}
.fp .alc-sec-hint{margin-top:.1rem}
.fp .alc-sub{margin-top:.3rem}
.fp .fp-fn{margin-top:10px}
.fp-cr td:first-child{white-space:nowrap}
.fp-cr td:last-child{white-space:normal;min-width:9rem}
@media(max-width:640px){
  .fp-cr thead{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
  .fp-cr tr{display:grid;grid-template-columns:1fr auto;gap:4px 10px;padding:12px 14px;border-bottom:1px solid var(--ln)}
  .fp-cr tr:last-child{border-bottom:0}
  .fp-cr td{padding:0;border:0}
  .fp-cr td:nth-child(2),.fp-cr td:nth-child(3),.fp-cr td:nth-child(5){grid-column:1/-1}
  .fp-cr td:nth-child(3),.fp-cr td:nth-child(5){color:var(--mu);font-size:13px}
  .fp-cr td:nth-child(4){grid-row:1;grid-column:2;font-weight:800}
}
`;

export default function AnnualLeavePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />

      <main className="fp" dir="rtl">
        <style>{TOOL_PAGE_CSS}</style>
        <style>{PAGE_CSS}</style>

        <nav className="fp-wrap fp-wide fp-crumb" aria-label="مسار التنقل">
          <ol>
            <li><Link href="/">الرئيسية</Link></li>
            <li aria-current="page">حاسبة بدل الإجازات السنوية</li>
          </ol>
        </nav>

        {/* الحاسبة (تحتوي على H1 الصفحة الوحيد) */}
        <div className="fp-wrap fp-wide" style={{ paddingTop: 16, paddingBottom: 16 }}>
          <AnnualLeaveCalculator />
        </div>

        <GeoAnswerSummary
          whatItDoes="تحسب الاستحقاق السنوي من الإجازة وأجر اليوم وبدل رصيد الإجازة غير المستنفد عند ترك العمل"
          appliesTo="عقود العمل في القطاع الخاص في السعودية والإمارات والكويت ومصر"
          keyRule="بدل الإجازة = (الأجر الشهري المعتمد ÷ 30، أو ÷ 26 في الكويت) × أيام الرصيد غير المستنفد. أساس الأجر يختلف: الفعلي في السعودية، والأساسي في الإمارات."
          authority="جهات العمل الرسمية في كل دولة"
          lastReviewed={LAST_REVIEWED}
          disclaimer="هذه الأداة تقديرية استرشادية. راجع عقد العمل ولوائح المنشأة وقانون دولتك قبل الاعتماد على الرقم."
        />

        {/* 1) التعريف + المعادلة + مقارنة الدول + الخطوات + المثال */}
        <section className="fp-wrap fp-sec">
          <div className="fp-card">
            <div>
              <h2 className="fp-h2">ما هو بدل الإجازات السنوية وكيف يُحسب؟</h2>
              <p className="fp-p fp-def" style={{ marginTop: 14 }}>
                <strong>بدل الإجازات السنوية</strong> هو المبلغ النقدي الذي يستحقه العامل عن أيام إجازته السنوية التي لم يستخدمها عند انتهاء علاقة العمل. يُحسب بقسمة الأجر الشهري المعتمد على عدد أيام الشهر في قانون الدولة (30، أو 26 في الكويت)، ثم ضرب أجر اليوم في عدد أيام الرصيد. ويختلف أساس الأجر: الأجر الفعلي في السعودية، والراتب الأساسي في الإمارات.
              </p>
            </div>

            <div className="fp-quick">
              <b>معادلة بدل الإجازة</b>
              <p>بدل الإجازة = (الأجر الشهري المعتمد ÷ أيام الشهر) × عدد أيام الرصيد غير المستنفد</p>
            </div>

            <div>
              <h3 className="fp-h3">الإجازة السنوية وبدلها في كل دولة</h3>
              <div className="fp-tw">
                <table className="fp-t fp-cr">
                  <thead>
                    <tr><th>الدولة</th><th>الاستحقاق السنوي</th><th>أساس البدل</th><th>يُقسم الأجر على</th><th>السند</th></tr>
                  </thead>
                  <tbody>
                    {COUNTRY_RULES.map((c) => (
                      <tr key={c.code}>
                        <td><b>{c.name}</b></td>
                        <td>{c.days}</td>
                        <td>{c.basis}</td>
                        <td>{c.daily}</td>
                        <td>{c.law}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="fp-fn">العقد أو لائحة المنشأة قد يمنحان أياماً أكثر من الحد الأدنى القانوني.</p>
            </div>

            <div>
              <h3 className="fp-h3">كيفية الاستخدام — خطوة بخطوة</h3>
              <ol className="fp-steps">
                {STEPS.map((s) => (
                  <li key={s}><span>{s}</span></li>
                ))}
              </ol>
            </div>

            <div className="fp-ex">
              <h3 className="fp-h3" style={{ marginBottom: 8 }}>مثال عملي بالأرقام: موظف في الرياض</h3>
              <p className="fp-p" style={{ fontSize: 14 }}>
                <strong>الحالة:</strong> أجره الفعلي 12,000 ريال (أساسي + سكن + مواصلات)، خدم 6 سنوات، وله رصيد 18 يوماً غير مستخدم عند انتهاء خدمته.
              </p>
              <div style={{ marginTop: 10 }}>
                {EXAMPLE.map(([label, formula, amount]) => (
                  <div key={label} className="fp-exr">
                    <span>{label}<small dir={/[؀-ۿ]/.test(formula) ? "rtl" : "ltr"} style={{ textAlign: "right" }}>{formula}</small></span>
                    <b>{amount}</b>
                  </div>
                ))}
              </div>
              <div className="fp-net"><span>بدل رصيد 18 يوماً</span><span>7,200.00 ر.س</span></div>
              <p className="fp-fn">* المثال توضيحي. لو كان الموظف في الإمارات لحُسب البدل على راتبه الأساسي وحده.</p>
            </div>
          </div>
        </section>

        {/* 2) الأسئلة الشائعة */}
        <section className="fp-wrap fp-sec">
          <div className="fp-card">
            <h2 className="fp-h2">الأسئلة الشائعة حول الإجازات السنوية وبدل الرصيد</h2>
            <div className="fp-faq">
              {FAQ.map((item) => (
                <div key={item.q}>
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3) أدوات مرتبطة + المراجعة */}
        <section className="fp-wrap fp-sec fp-bot">
          <div className="fp-card">
            <div className="fp-chain">
              <h2>أدوات عمالية ومالية ذات صلة</h2>
              <p>استكمل حساب مستحقاتك الوظيفية بهذه الأدوات.</p>
              <div className="fp-g2">
                {RELATED.map((t) => (
                  <Link key={t.href} href={t.href} className="fp-lk">
                    <span className="t">{t.title}{t.tag ? <span className="fp-tag">{t.tag}</span> : null}</span>
                    <p>{t.desc}</p>
                    <span className="go">افتح الحاسبة ←</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="fp-rev">
              <p>
                <strong>آخر تحديث للمحتوى:</strong> <time dateTime={LAST_REVIEWED_ISO}>{LAST_REVIEWED}</time>. المراجع: نظام العمل السعودي (المادتان 109 و111)، والمرسوم بقانون اتحادي 33 لسنة 2021 في الإمارات (المادة 29) ولائحته التنفيذية (المادة 19)، وقانون العمل الكويتي 6 لسنة 2010 (المواد 70 إلى 74)، وقانون العمل المصري 14 لسنة 2025. الحاسبة استرشادية وليست بديلاً عن الجهات الرسمية أو المشورة القانونية.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
