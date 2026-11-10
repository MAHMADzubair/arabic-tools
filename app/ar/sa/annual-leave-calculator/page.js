import AnnualLeaveCalculator from "@/components/AnnualLeaveCalculator";
import Link from "next/link";
import GeoAnswerSummary from "@/components/GeoAnswerSummary";
import { TOOL_PAGE_CSS } from "@/lib/toolPageCss";
import { SITE_URL, SITE_NAME, SITE_ORG_ID, SITE_WEBSITE_ID, DEFAULT_OG_IMAGE } from "@/lib/siteConfig";

const PATH = "/ar/sa/annual-leave-calculator";
const LAST_REVIEWED = "نوفمبر 2026";
const LAST_REVIEWED_ISO = "2026-11-10";
const TITLE = "حاسبة بدل الإجازات السنوية في السعودية 2026";
const DESC =
  "احسب رصيد إجازتك السنوية وبدل الإجازة عند نهاية الخدمة في السعودية: 21 أو 30 يوماً وفق المادتين 109 و111 من نظام العمل، على الأجر الفعلي ÷ 30. مجاناً.";

// المصدر الرسمي (يُعرض في الصفحة ويدخل في البيانات المنظمة)
const HRSD_URL = "https://www.hrsd.gov.sa";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: {
    canonical: PATH,
    languages: { "ar-SA": PATH },
  },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: `${SITE_URL}${PATH}`,
    siteName: SITE_NAME,
    type: "website",
    locale: "ar_SA",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

// ─── FAQ (مصدر واحد للقسم المرئي ولبيانات FAQPage) ────────────────────────────
const FAQ = [
  {
    q: "كم عدد أيام الإجازة السنوية المستحقة للعامل في نظام العمل السعودي؟",
    a: "وفق المادة (109) من نظام العمل السعودي الصادر بالمرسوم الملكي (م/51): يستحق العامل إجازة سنوية مدفوعة الأجر لا تقل عن 21 يوماً عن كل سنة، وتُزاد إلى مدة لا تقل عن 30 يوماً إذا أمضى 5 سنوات متصلة في خدمة صاحب العمل نفسه.",
  },
  {
    q: "كيف يُحسب بدل الإجازة السنوية عند نهاية الخدمة؟",
    a: "تنص المادة (111) من نظام العمل على أن العامل يستحق أجراً عن أيام الإجازة المستحقة التي لم يستنفدها إذا ترك العمل. يُحسب البدل بقسمة الأجر الفعلي الأخير (الأساسي + البدلات الثابتة كالسكن والنقل) على 30 للحصول على أجر اليوم، ثم ضربه في عدد أيام الرصيد المتبقية. مثال: 9,000 ÷ 30 = 300 ر.س لليوم، و15 يوماً × 300 = 4,500 ر.س.",
  },
  {
    q: "كم يوماً يتراكم من الإجازة السنوية كل شهر؟",
    a: "بقسمة الاستحقاق السنوي على 12: نحو 1.75 يوم عن كل شهر عمل لمن استحقاقه 21 يوماً، و2.5 يوم عن كل شهر لمن استحقاقه 30 يوماً. هذا تقدير حسابي يستند إلى قاعدة النسبة في المادة (111)، وقد تعتمد المنشأة طريقة احتساب أدق بالأيام.",
  },
  {
    q: "هل يستحق العامل بدل إجازة عن جزء من السنة؟",
    a: "نعم. تنص المادة (111) على أن العامل يستحق أجرة الإجازة عن أجزاء السنة بنسبة ما قضاه منها في العمل. مثال: من عمل 8 أشهر من سنة استحقاقها 21 يوماً يستحق 21 × 8 ÷ 12 = 14 يوماً.",
  },
  {
    q: "هل يُحسب بدل الإجازة على الراتب الأساسي أم الأجر الفعلي الشامل للبدلات؟",
    a: "يُحسب بدل الإجازة السنوية والتعويض عنها على أساس الأجر الفعلي الأخير للعامل، وهو الراتب الأساسي مضافاً إليه البدلات الثابتة المعتادة كبدل السكن وبدل النقل، عملاً بتعريف الأجر في المادة (2) من نظام العمل. إذا نصّ عقدك على أساس مختلف فراجع العقد.",
  },
  {
    q: "هل يجوز تأجيل الإجازة السنوية أو التنازل عنها بمقابل مالي أثناء العقد؟",
    a: "وفق المادة (109) يجب أن يتمتع العامل بإجازته في سنة استحقاقها، ولا يجوز له التنازل عنها أو تقاضي بدل نقدي عنها أثناء سريان العقد. ووفق المادة (110) يجوز لصاحب العمل تأجيل الإجازة بعد نهاية سنتها مدة لا تزيد على 90 يوماً إذا اقتضت ظروف العمل، ولا يجوز التأجيل أكثر من ذلك إلا بموافقة العامل كتابةً وبما لا يتعدى نهاية السنة التالية.",
  },
  {
    q: "متى يُدفع أجر الإجازة السنوية؟",
    a: "تنص المادة (109) على أن أجر الإجازة السنوية يُدفع مقدماً، أي قبل أن يبدأ العامل إجازته. أما بدل الرصيد غير المستنفد فيُصرف ضمن المخالصة النهائية عند انتهاء العلاقة العمالية.",
  },
  {
    q: "ما العلاقة بين بدل الإجازات والمخالصة النهائية؟",
    a: "بدل رصيد الإجازات غير المستنفدة هو أحد بنود المخالصة النهائية في السعودية، إلى جانب آخر راتب مستحق ومكافأة نهاية الخدمة (المادتان 84 و85) وبدل مهلة الإشعار إن استُحق. لحساب البنود كلها معاً استخدم حاسبة المخالصة النهائية.",
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
    { "@type": "ListItem", position: 2, name: "أدوات السعودية", item: `${SITE_URL}/ar/sa` },
    { "@type": "ListItem", position: 3, name: "حاسبة بدل الإجازات السنوية", item: `${SITE_URL}${PATH}` },
  ],
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}${PATH}#app`,
  name: "حاسبة بدل الإجازات السنوية في السعودية",
  alternateName: ["حاسبة رصيد الإجازات", "حاسبة تعويض الإجازات"],
  url: `${SITE_URL}${PATH}`,
  inLanguage: "ar",
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript",
  applicationCategory: "BusinessApplication",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "SAR" },
  description: DESC,
  dateModified: LAST_REVIEWED_ISO,
  areaServed: { "@type": "Country", name: "SA" },
  featureList: [
    "الاستحقاق السنوي: 21 أو 30 يوماً وفق المادة 109",
    "أجر اليوم على أساس الأجر الفعلي ÷ 30",
    "بدل الرصيد غير المستنفد وفق المادة 111",
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
  inLanguage: "ar-SA",
  isPartOf: { "@id": SITE_WEBSITE_ID },
  publisher: { "@id": SITE_ORG_ID },
  dateModified: LAST_REVIEWED_ISO,
  mainEntity: { "@id": `${SITE_URL}${PATH}#app` },
  about: [
    { "@type": "Thing", name: "الإجازة السنوية" },
    { "@type": "Thing", name: "بدل الإجازات" },
    { "@type": "Legislation", name: "نظام العمل السعودي (المرسوم الملكي م/51) وتعديلاته", legislationJurisdiction: "SA" },
  ],
  citation: [
    { "@type": "CreativeWork", name: "وزارة الموارد البشرية والتنمية الاجتماعية — نظام العمل", url: HRSD_URL },
  ],
  speakable: { "@type": "SpeakableSpecification", cssSelector: [".fp-def", ".fp-quick"] },
};

// ─── Content data ─────────────────────────────────────────────────────────────
const STEPS = [
  "أدخل الأجر الفعلي الشهري: الراتب الأساسي مضافاً إليه البدلات الثابتة كالسكن والنقل.",
  "أدخل عدد سنوات الخدمة ليتحدد الاستحقاق السنوي تلقائياً: 21 يوماً، أو 30 يوماً بعد 5 سنوات متصلة.",
  "أدخل رصيد الإجازة المتبقي بالأيام. إذا لم تعرفه افتح «لا تعرف رصيدك؟ احسبه».",
  "اقرأ النتيجة: أجر اليوم، أجر الإجازة السنوية الكاملة، وبدل الرصيد المتبقي، ثم انسخها عند الحاجة.",
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "كيف تحسب بدل الإجازة السنوية في السعودية",
  inLanguage: "ar",
  step: STEPS.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
};

// مدة الخدمة، الاستحقاق السنوي، التراكم الشهري التقريبي
const ENTITLEMENT = [
  ["أقل من 5 سنوات", "21 يوماً", "1.75 يوم"],
  ["5 سنوات متصلة فأكثر", "30 يوماً", "2.5 يوم"],
];

// مثال يطابق القيم الافتراضية في الحاسبة
const EXAMPLE = [
  ["الاستحقاق السنوي", "أكمل 5 سنوات متصلة", "30 يوماً"],
  ["أجر اليوم الواحد", "9,000 ÷ 30", "300.00 ر.س"],
  ["أجر الإجازة السنوية الكاملة", "30 × 300", "9,000.00 ر.س"],
];

const ARTICLES = [
  { art: "المادة 109", title: "مدة الإجازة السنوية", desc: "لا تقل عن 21 يوماً، وتزاد إلى ما لا يقل عن 30 يوماً بعد 5 سنوات متصلة، ويُدفع أجرها مقدماً." },
  { art: "المادة 110", title: "تأجيل الإجازة", desc: "لصاحب العمل تأجيلها حتى 90 يوماً بعد نهاية سنتها، وما زاد يحتاج موافقة العامل كتابةً وحتى نهاية السنة التالية." },
  { art: "المادة 111", title: "بدل الرصيد عند ترك العمل", desc: "أجر عن أيام الإجازة المستحقة غير المستنفدة، وعن أجزاء السنة بنسبة ما قضاه العامل منها في العمل." },
  { art: "المادة 2", title: "الأجر الفعلي", desc: "الأجر الأساسي مضافاً إليه سائر الزيادات المستحقة كالبدلات، وهو أساس حساب أجر الإجازة." },
];

const RELATED = [
  { href: "/ar/sa/final-settlement-calculator", title: "حاسبة المخالصة النهائية", desc: "تصفية شاملة: الإجازات + المكافأة + آخر راتب + الإشعار", tag: "الخطوة التالية" },
  { href: "/gratuity-calculator/saudi", title: "حاسبة نهاية الخدمة", desc: "المادتان 84 و85 بحالات الاستقالة والفسخ" },
  { href: "/salary-calculator/saudi", title: "حاسبة الراتب في السعودية", desc: "صافي الراتب بعد خصم التأمينات" },
  { href: "/overtime-calculator/saudi", title: "حاسبة العمل الإضافي", desc: "أجر الساعة الفعلي + 50% من الأساسي (م/107)" },
];

// يُكمل الأنماط المشتركة: يسمح بتثبيت لوحة النتيجة على الشاشات العريضة
// (globals.css يضع overflow-x:hidden على html و body معاً فيتعطل position:sticky).
const PAGE_CSS = `
@media(min-width:960px){body{overflow-x:clip}}
.fp .alc{max-width:none}
/* the shared reset zeroes p/h spacing inside .fp; restore the calculator's own */
.fp .alc-note{padding:.75rem .9rem}
.fp .alc-legal{padding-inline:.4rem}
.fp .alc-sec-hint{margin-top:.1rem}
.fp .alc-sub{margin-top:.3rem}
.fp .fp-fn{margin-top:10px}
.fp-net span:last-child{white-space:nowrap}
@media(max-width:560px){.fp-t.al-t th,.fp-t.al-t td{padding-inline:10px}.fp-t.al-t td:first-child{min-width:0}}
`;

export default function SaudiAnnualLeavePage() {
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
            <li><Link href="/ar/sa">أدوات السعودية</Link></li>
            <li aria-current="page">حاسبة بدل الإجازات السنوية</li>
          </ol>
        </nav>

        {/* الحاسبة (تحتوي على H1 الصفحة الوحيد) */}
        <div className="fp-wrap fp-wide" style={{ paddingTop: 16, paddingBottom: 16 }}>
          <AnnualLeaveCalculator
            lockedCountry="sa"
            title="حاسبة بدل الإجازات السنوية في السعودية"
            subtitle="احسب رصيد إجازتك وأجر الإجازة وبدل الرصيد غير المستنفد وفق المادتين 109 و111 من نظام العمل."
          />
        </div>

        <GeoAnswerSummary
          whatItDoes="تحسب رصيد الإجازات السنوية المستحق والتعويض النقدي عن الرصيد المتبقي عند نهاية الخدمة"
          appliesTo="المملكة العربية السعودية — عقود العمل في القطاع الخاص"
          keyRule="21 يوماً سنوياً (أقل من 5 سنوات) — 30 يوماً (5 سنوات فأكثر) — وفق المادتين 109 و111"
          authority="وزارة الموارد البشرية والتنمية الاجتماعية"
          authorityUrl={HRSD_URL}
          lastReviewed={LAST_REVIEWED}
          disclaimer="هذه الأداة تقديرية استرشادية. راجع عقد العمل ولوائح المنشأة للتحقق من الأجر الفعلي المعتمد."
        />

        {/* 1) التعريف + المعادلة + الاستحقاق + الخطوات + المثال */}
        <section className="fp-wrap fp-sec">
          <div className="fp-card">
            <div>
              <h2 className="fp-h2">ما هو بدل الإجازات السنوية وكيف يُحسب؟</h2>
              <p className="fp-p fp-def" style={{ marginTop: 14 }}>
                <strong>بدل الإجازات السنوية</strong> (ويُسمى أيضاً تعويض رصيد الإجازات) هو المبلغ النقدي الذي يستحقه العامل عن أيام إجازته السنوية التي لم يستنفدها عند انتهاء علاقة العمل. يُحسب في السعودية بقسمة الأجر الفعلي الشهري على 30 ثم ضرب الناتج في عدد أيام الرصيد المتبقية.
              </p>
              <p className="fp-p">
                حددت المادة (109) من نظام العمل السعودي الصادر بالمرسوم الملكي (م/51) الإجازة السنوية بما لا يقل عن <strong>21 يوماً</strong> مدفوعة الأجر، تُزاد إلى ما لا يقل عن <strong>30 يوماً</strong> إذا أمضى العامل 5 سنوات متصلة لدى صاحب العمل نفسه. وأوجبت المادة (111) صرف أجر الأيام المستحقة غير المستنفدة عند ترك العمل، بما فيها أجزاء السنة بنسبة ما قضاه العامل منها.
              </p>
            </div>

            <div className="fp-quick">
              <b>معادلة بدل الإجازة</b>
              <p>بدل الإجازة = (الأجر الفعلي الشهري ÷ 30) × عدد أيام الرصيد غير المستنفد</p>
            </div>

            <div>
              <h3 className="fp-h3">كم يوماً تستحق في السنة؟</h3>
              <div className="fp-tw">
                <table className="fp-t al-t">
                  <thead>
                    <tr><th>مدة الخدمة</th><th>الاستحقاق</th><th>كل شهر</th></tr>
                  </thead>
                  <tbody>
                    {ENTITLEMENT.map(([period, days, monthly]) => (
                      <tr key={period}><td><b>{period}</b></td><td>{days}</td><td>{monthly}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="fp-fn">عمود «كل شهر» تقدير حسابي للتراكم (الاستحقاق ÷ 12) يستند إلى قاعدة النسبة في المادة (111). العقد أو لائحة المنشأة قد يمنحان أياماً أكثر.</p>
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
              <h3 className="fp-h3" style={{ marginBottom: 8 }}>مثال عملي بالأرقام</h3>
              <p className="fp-p" style={{ fontSize: 14 }}>
                <strong>الحالة:</strong> موظف أجره الفعلي 9,000 ر.س شهرياً، خدم 6 سنوات، وله رصيد إجازة غير مستنفد مقداره 15 يوماً عند انتهاء خدمته.
              </p>
              <div style={{ marginTop: 10 }}>
                {EXAMPLE.map(([label, formula, amount]) => (
                  <div key={label} className="fp-exr">
                    <span>{label}<small dir={/[\u0600-\u06FF]/.test(formula) ? "rtl" : "ltr"} style={{ textAlign: "right" }}>{formula}</small></span>
                    <b>{amount}</b>
                  </div>
                ))}
              </div>
              <div className="fp-net"><span>بدل رصيد 15 يوماً</span><span>4,500.00 ر.س</span></div>
              <p className="fp-fn">* المثال توضيحي ويطابق القيم الافتراضية في الحاسبة.</p>
            </div>
          </div>
        </section>

        {/* 2) جزء السنة + التأجيل */}
        <section className="fp-wrap fp-sec">
          <div className="fp-card">
            <div>
              <h2 className="fp-h2">رصيد الإجازة عن جزء من السنة</h2>
              <p className="fp-p" style={{ marginTop: 14 }}>
                لا يشترط إتمام السنة لاستحقاق البدل. وفق المادة (111) يستحق العامل أجرة الإجازة عن أجزاء السنة بنسبة ما قضاه منها في العمل. مثال: من عمل <strong>8 أشهر</strong> من سنة استحقاقها 21 يوماً يستحق 21 × 8 ÷ 12 = <strong>14 يوماً</strong>. يمكنك تقدير ذلك من خيار «لا تعرف رصيدك؟ احسبه» داخل الحاسبة.
              </p>
            </div>

            <div>
              <h2 className="fp-h2">تأجيل الإجازة وترحيلها</h2>
              <ul className="fp-ul" style={{ marginTop: 14 }}>
                <li><span><strong>الأصل:</strong> يتمتع العامل بإجازته في سنة استحقاقها، ولا يجوز التنازل عنها أو تقاضي بدل نقدي عنها أثناء سريان العقد (المادة 109).</span></li>
                <li><span><strong>تأجيل صاحب العمل:</strong> يجوز بعد نهاية سنة الاستحقاق مدة لا تزيد على 90 يوماً إذا اقتضت ظروف العمل (المادة 110).</span></li>
                <li><span><strong>تأجيل أطول:</strong> يحتاج موافقة العامل كتابةً، وبما لا يتعدى نهاية السنة التالية لسنة الاستحقاق (المادة 110).</span></li>
              </ul>
            </div>

            <div>
              <h3 className="fp-h3">المواد النظامية ذات الصلة</h3>
              <div className="fp-g2">
                {ARTICLES.map((a) => (
                  <div key={a.art} className="fp-art">
                    <span className="fp-tag">{a.art}</span>
                    <b>{a.title}</b>
                    <p>{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3) الأسئلة الشائعة */}
        <section className="fp-wrap fp-sec">
          <div className="fp-card">
            <h2 className="fp-h2">الأسئلة الشائعة حول بدل الإجازة السنوية في السعودية</h2>
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

        {/* 4) أدوات مرتبطة + المراجعة والمصادر */}
        <section className="fp-wrap fp-sec fp-bot">
          <div className="fp-card">
            <div className="fp-chain">
              <h2>حاسبات مرتبطة ببدل الإجازات</h2>
              <p>بدل الإجازة بند واحد من مستحقات نهاية الخدمة. أكمل الحساب بهذه الأدوات.</p>
              <div className="fp-g2">
                {RELATED.map((t) => (
                  <Link key={t.href} href={t.href} className="fp-lk">
                    <span className="t">{t.title}{t.tag ? <span className="fp-tag">{t.tag}</span> : null}</span>
                    <p>{t.desc}</p>
                    <span className="go">افتح الحاسبة ←</span>
                  </Link>
                ))}
                <Link href="/annual-leave-calculator" className="fp-lk">
                  <span className="t">حاسبة بدل الإجازات لعدة دول</span>
                  <p>احسب بدل الإجازات لموظفي الإمارات والكويت ومصر</p>
                  <span className="go">افتح الحاسبة ←</span>
                </Link>
              </div>
            </div>

            <div className="fp-rev">
              <p>
                <strong>آخر تحديث للمحتوى:</strong> <time dateTime={LAST_REVIEWED_ISO}>{LAST_REVIEWED}</time>. المرجع: نظام العمل السعودي الصادر بالمرسوم الملكي (م/51) وتعديلاته، المواد (2) و(109) و(110) و(111). الحاسبة استرشادية وليست بديلاً عن الجهات الرسمية أو المشورة القانونية.
              </p>
              <p style={{ marginTop: 8 }}><strong>المصدر الرسمي:</strong></p>
              <ul className="fp-src">
                <li><a href={HRSD_URL} target="_blank" rel="noopener noreferrer">وزارة الموارد البشرية والتنمية الاجتماعية — نظام العمل (hrsd.gov.sa)</a></li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
