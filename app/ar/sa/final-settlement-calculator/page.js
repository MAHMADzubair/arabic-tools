import FinalSettlementCalculator from "@/components/FinalSettlementCalculator";
import Link from "next/link";
import GeoAnswerSummary from "@/components/GeoAnswerSummary";
import { SITE_URL } from "@/lib/siteConfig";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: "حاسبة المخالصة النهائية في السعودية 2026 | مكافأة وإجازة وإشعار",
  description:
    "قدّر مستحقاتك عبر حاسبة المخالصة النهائية في السعودية 2026: راتب آخر شهر، مكافأة نهاية الخدمة، بدل رصيد الإجازات السنوية، تعويض مهلة الإشعار، والإضافات والخصومات لصافي التصفية.",
  keywords: [
    "حاسبة المخالصة النهائية السعودية",
    "حساب مكافأة نهاية الخدمة",
    "المادة 84 نظام العمل",
    "المادة 85 نظام العمل",
    "بدل الإجازة السنوية",
    "مهلة الإشعار السعودية",
    "نموذج مخالصة نهائية",
    "EOSB Saudi Arabia",
    "final settlement calculator Saudi",
    "حساب نهاية الخدمة",
  ],
  alternates: {
    canonical: "/ar/sa/final-settlement-calculator",
    languages: {
      "ar-SA": "/ar/sa/final-settlement-calculator",
      "ar-AE": "/ar/ae/final-settlement-calculator",
    },
  },
  openGraph: {
    title: "حاسبة المخالصة النهائية في السعودية 2026 | مكافأة وإجازة وإشعار",
    description:
      "قدّر مستحقاتك عبر حاسبة المخالصة النهائية في السعودية 2026: راتب آخر شهر، مكافأة نهاية الخدمة، بدل رصيد الإجازات، تعويض مهلة الإشعار وفق نظام العمل السعودي.",
    url: `${SITE_URL}/ar/sa/final-settlement-calculator`,
    type: "website",
    locale: "ar_SA",
  },
};

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "كيف تُحسب مكافأة نهاية الخدمة في السعودية وفق المادة 84؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وفق المادة (84) من نظام العمل السعودي: يستحق العامل نصف أجر شهري عن كل سنة من السنوات الخمس الأولى، وأجر شهر كامل عن كل سنة تزيد على ذلك. السنوات الكسرية تحتسب بالتناسب. مثال: موظف راتبه 10,000 ر.س وخدمته 7 سنوات = (10,000 × 0.5 × 5) + (10,000 × 1 × 2) = 25,000 + 20,000 = 45,000 ر.س.",
      },
    },
    {
      "@type": "Question",
      name: "هل يستحق المستقيل مكافأة نهاية الخدمة كاملة في السعودية؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وفق المادة (85): المستقيل قبل سنتين لا يستحق شيئاً. بين سنتين و5 سنوات يستحق ثلث المكافأة. بين 5 و10 سنوات يستحق ثلثي المكافأة. بعد 10 سنوات يستحق المكافأة كاملة. أما في حالات الإنهاء من صاحب العمل أو التقاعد أو الإنهاء بالتراضي فيستحق الموظف المكافأة كاملة بصرف النظر عن مدة الخدمة.",
      },
    },
    {
      "@type": "Question",
      name: "ما هي مدة مهلة الإشعار في نظام العمل السعودي؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وفق المادة (75) من نظام العمل: في عقود غير محددة المدة مع الرواتب الشهرية، مهلة الإشعار 30 يوماً إذا كان الموظف هو من يُخطر بترك العمل، و60 يوماً إذا كان صاحب العمل هو من يُنهي الخدمة. الطرف الذي لا يلتزم بمهلة الإشعار يلتزم بدفع مقابل الأجر عن المدة المتبقية.",
      },
    },
    {
      "@type": "Question",
      name: "كيف يُحسب بدل الإجازة السنوية غير المستنفدة عند ترك العمل؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وفق المادة (111) من نظام العمل: عند ترك العمل يستحق الموظف تعويضاً نقدياً كاملاً عن جميع أيام إجازاته السنوية التي لم يأخذها. يُحسب الأجر اليومي بقسمة الراتب الشهري على 30 (أو الأساس المتفق عليه)، ثم ضرب الناتج في عدد أيام الإجازة المستحقة. مثال: راتب 9,000 ر.س و20 يوم إجازة = (9,000 ÷ 30) × 20 = 300 × 20 = 6,000 ر.س.",
      },
    },
    {
      "@type": "Question",
      name: "ما الأجر المعتمد لحساب مكافأة نهاية الخدمة في السعودية — الأساسي أم الإجمالي؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "أشارت وزارة الموارد البشرية والتنمية الاجتماعية إلى أن المكافأة تُحتسب على الأجر الفعلي المستحق للعامل، والذي يشمل الراتب الأساسي والبدلات الثابتة الدورية (سكن، نقل، بدلات أخرى). ويُنصح دائماً بمراجعة نص عقد العمل ولوائح المنشأة لتحديد التعريف الدقيق للأجر المعتمد.",
      },
    },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "حاسبة المخالصة النهائية في السعودية 2026",
  operatingSystem: "All",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "SAR",
  },
  description:
    "احسب مخالصتك وتصفية مستحقاتك بدقة وفق نظام العمل السعودي 2026: مكافأة نهاية الخدمة، رصيد الإجازات، آخر راتب، وبدل الإشعار مع طباعة نموذج مخالصة قابل للطباعة.",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "أدوات السعودية", item: `${SITE_URL}/ar/sa/` },
    { "@type": "ListItem", position: 3, name: "حاسبة المخالصة النهائية", item: `${SITE_URL}/ar/sa/final-settlement-calculator` },
  ],
};

// ─── Content data ─────────────────────────────────────────────────────────────
const STEPS = [
  "أدخل بيانات الموظف وجهة العمل للنموذج القابل للطباعة (اختياري للحساب).",
  "حدد نوع العقد (محدد / غير محدد) وسبب إنهاء الخدمة — هذان الخياران يحددان نسبة مكافأة نهاية الخدمة.",
  "أدخل تاريخَي الالتحاق وآخر يوم عمل لحساب مدة الخدمة تلقائياً.",
  "أدخل هيكل الراتب الكامل (أساسي + بدلات). اختر قاسم الشهر المناسب (÷30 الأكثر شيوعاً).",
  "أدخل رصيد الإجازة السنوية غير المستنفدة وأساس الاحتساب.",
  "أدخل مهلة الإشعار المطلوبة والمخدومة وحدد الطرف المستحق للتعويض.",
  "أضف أي مستحقات أخرى (رواتب متأخرة، أوفر تايم) أو خصومات (سلف، عهد).",
  "اقرأ تفصيل المخالصة في لوحة النتائج، ثم أنشئ نموذج المخالصة القابل للطباعة والتوقيع.",
];

// Example matches the calculator: 6 years 4 months = 6.333 years
const EXAMPLE = [
  ["آخر راتب مستحق", "(11,000 ÷ 30) × 15 يوم", "5,500.00 ر.س"],
  ["مكافأة نهاية الخدمة", "(11,000 × 0.5 × 5) + (11,000 × 1 × 1.333)", "42,166.67 ر.س"],
  ["بدل الإجازة", "(11,000 ÷ 30) × 18 يوم", "6,600.00 ر.س"],
  ["بدل مهلة الإشعار", "(11,000 ÷ 30) × 60 يوم", "22,000.00 ر.س"],
];
const EXAMPLE_NET = "76,266.67 ر.س";

const ARTICLES = [
  { art: "المادة 84", title: "مكافأة نهاية الخدمة — الحساب الأساسي", desc: "نصف شهر عن كل سنة في أول 5 سنوات. شهر كامل عن كل سنة بعدها. السنوات الكسرية بالتناسب." },
  { art: "المادة 85", title: "تدرج الاستقالة", desc: "قبل سنتين: لا مكافأة. 2-5 سنوات: ثلث. 5-10 سنوات: ثلثان. 10+ سنوات: كاملة." },
  { art: "المادة 111", title: "بدل الإجازة السنوية", desc: "تعويض نقدي كامل عن جميع الإجازات السنوية المتراكمة غير المستنفدة عند ترك العمل." },
  { art: "المادة 75/76", title: "مهلة الإشعار", desc: "30 يوماً (إشعار الموظف) أو 60 يوماً (إنهاء صاحب العمل) للعقود غير المحددة المدة برواتب شهرية." },
];

const CHAIN = [
  { href: "/gratuity-calculator/saudi", title: "حاسبة مكافأة نهاية الخدمة", desc: "حساب تفصيلي للمادتين 84 و 85 وتدرج الاستقالة وسنوات الخدمة." },
  { href: "/overtime-calculator/saudi", title: "حاسبة الأوفر تايم السعودي", desc: "حساب الساعات الإضافية بنسبة 150٪ وفق المادة 107 من نظام العمل." },
  { href: "/salary-calculator/saudi", title: "حاسبة الراتب الصافي", desc: "حساب استقطاعات التأمينات الاجتماعية GOSI وساند وصافي الراتب." },
];

const RELATED = [
  { href: "/ar/sa/article-77-calculator", title: "حاسبة تعويض المادة 77", desc: "احسب تعويض الفصل التعسفي والإنهاء غير المشروع (حد شهرين)", badge: "المادة 77" },
  { href: "/ar/sa/annual-leave-calculator", title: "حاسبة رصيد الإجازات السنوية", desc: "احسب التعويض النقدي لرصيد الإجازات وفق المادتين 109 و111", badge: "المادة 111" },
  { href: "/gratuity-calculator/saudi", title: "حاسبة مكافأة نهاية الخدمة", desc: "احسب مكافأتك بالتفصيل وفق المادة 84 و85 مع سيناريوهات مختلفة", badge: "السعودية" },
  { href: "/salary-calculator/saudi", title: "حاسبة الراتب الصافي السعودي", desc: "احسب صافي راتبك بعد GOSI وساند وجميع الاستقطاعات", badge: "GOSI" },
  { href: "/overtime-calculator/saudi", title: "حاسبة الأوفر تايم السعودي", desc: "احسب أجر الساعات الإضافية 150٪ وفق المادة 107", badge: "150%" },
  { href: "/vat-calculator/saudi", title: "حاسبة ضريبة القيمة المضافة", desc: "احسب ضريبة القيمة المضافة 15٪ للمملكة العربية السعودية", badge: "15% VAT" },
  { href: "/loan-calculator", title: "حاسبة القرض الشخصي", desc: "احسب قسطك الشهري وإجمالي الفوائد لأي قرض", badge: "" },
  { href: "/ar/sa/", title: "مجمع أدوات المملكة العربية السعودية", desc: "جميع الحاسبات المالية والعمالية المخصصة للسعودية في مكان واحد", badge: "مجمع" },
];

// ─── Styles (tokens: --c-* with fallbacks) ────────────────────────────────────
const CSS = `
.fp{--bg:var(--c-bg,#F5F5F2);--ink:var(--c-ink,#0D0D0D);--ac:var(--c-accent,#FF6A1A);--sf:var(--c-surface,#FFFFFF);--mu:var(--c-muted,#55554F);--ln:var(--c-line,#0D0D0D);background:var(--bg);color:var(--ink);min-height:100vh;font-size:15px;line-height:1.7}
@media (prefers-color-scheme:dark){.fp{--bg:var(--c-bg,#0D0D0D);--ink:var(--c-ink,#F5F5F2);--sf:var(--c-surface,#161616);--mu:var(--c-muted,#A8A8A0);--ln:var(--c-line,#F5F5F2)}}
.fp *{box-sizing:border-box}
.fp h2,.fp h3,.fp h4,.fp p,.fp ol{margin:0;padding:0}
.fp-wrap{max-width:48rem;margin:0 auto;padding-inline:16px}
.fp a{color:inherit}
.fp a:focus-visible{outline:3px solid var(--ac);outline-offset:2px}
.fp-crumb{padding-top:16px;padding-bottom:4px}
.fp-crumb ol{list-style:none;display:flex;flex-wrap:wrap;gap:6px;font-size:13px;color:var(--mu)}
.fp-crumb li+li::before{content:"/";margin-inline-end:6px}
.fp-crumb a{text-decoration:underline;text-underline-offset:3px}
.fp-crumb [aria-current]{color:var(--ink);font-weight:800}
.fp-card{background:var(--sf);border:2px solid var(--ln);padding:24px;display:flex;flex-direction:column;gap:24px}
@media(min-width:640px){.fp-card{padding:32px}}
.fp-sec{padding-top:32px}
.fp-h2{font-size:22px;font-weight:900;line-height:1.3;border-bottom:2px solid var(--ln);padding-bottom:14px}
.fp-h3{font-size:16px;font-weight:800;margin-bottom:12px}
.fp-p{font-size:14px;color:var(--ink)}
.fp-p+.fp-p{margin-top:12px}
.fp-steps{list-style:none;display:flex;flex-direction:column;gap:10px;counter-reset:s}
.fp-steps li{display:flex;gap:12px;align-items:flex-start;font-size:14px;counter-increment:s}
.fp-steps li::before{content:counter(s);flex:none;width:26px;height:26px;display:grid;place-items:center;background:var(--ink);color:var(--bg);font-weight:800;font-size:13px}
.fp-ex{border:2px solid var(--ln);background:var(--bg);padding:20px}
.fp-exr{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--ln);font-size:14px}
.fp-exr small{display:block;font-size:12px;color:var(--mu)}
.fp-exr b{white-space:nowrap}
.fp-net{display:flex;justify-content:space-between;gap:12px;margin-top:12px;padding:12px;background:var(--ac);color:#0D0D0D;border:2px solid var(--ln);font-weight:900;font-size:16px}
.fp-fn{margin-top:12px;font-size:12px;color:var(--mu)}
.fp-g2{display:grid;gap:12px;grid-template-columns:1fr}
@media(min-width:640px){.fp-g2{grid-template-columns:1fr 1fr}.fp-g3{grid-template-columns:repeat(3,1fr)}}
.fp-g3{display:grid;gap:12px;grid-template-columns:1fr}
.fp-art{border:1px solid var(--ln);padding:16px;display:flex;flex-direction:column;gap:6px}
.fp-tag{align-self:flex-start;background:var(--ink);color:var(--bg);font-size:12px;font-weight:800;padding:0 10px}
.fp-art b{font-size:14px}
.fp-art p{font-size:13px;color:var(--mu)}
.fp-faq>div{padding:18px 0;border-bottom:1px solid var(--ln)}
.fp-faq>div:first-child{padding-top:0}
.fp-faq>div:last-child{border-bottom:0;padding-bottom:0}
.fp-faq h3{font-size:15px;font-weight:800;margin-bottom:6px}
.fp-faq p{font-size:14px}
.fp-chain{border:3px solid var(--ln);background:var(--bg);padding:20px}
.fp-chain h2{font-size:18px;font-weight:900}
.fp-chain>p{font-size:13px;color:var(--mu);margin:4px 0 16px}
.fp-lk{display:flex;flex-direction:column;gap:6px;text-decoration:none;background:var(--sf);border:1px solid var(--ln);border-inline-start:6px solid var(--ac);padding:14px 16px;min-height:44px}
.fp-lk:hover{background:var(--ink);color:var(--bg)}
.fp-lk:hover p{color:var(--bg)}
.fp-lk h3,.fp-lk .t{font-size:14px;font-weight:800;margin:0;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.fp-lk p{font-size:12px;color:var(--mu)}
.fp-lk .go{font-size:12px;font-weight:800;text-decoration:underline;text-underline-offset:3px}
.fp-b{border:1px solid currentColor;font-size:11px;font-weight:800;padding:0 8px}
.fp-rev{border:1px dashed var(--ln);padding:14px 16px;font-size:12px}
.fp-rev a{font-weight:800;text-decoration:underline;text-underline-offset:3px}
.fp-bot{padding-bottom:48px}
@media print{.fp-crumb{display:none}}
`;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FinalSettlementPage() {
  return (
    <>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }} />

      <main className="fp" dir="rtl">
        <style>{CSS}</style>

        {/* Breadcrumb */}
        <nav className="fp-wrap fp-crumb" aria-label="مسار التنقل">
          <ol>
            <li><Link href="/">الرئيسية</Link></li>
            <li><Link href="/ar/sa/">أدوات السعودية</Link></li>
            <li aria-current="page">حاسبة المخالصة النهائية</li>
          </ol>
        </nav>

        {/* PART 1: Calculator */}
        <div className="fp-wrap" style={{ paddingTop: 16, paddingBottom: 16 }}>
          <FinalSettlementCalculator />
        </div>

        {/* GEO Answer Summary */}
        <GeoAnswerSummary
          whatItDoes="تصفية شاملة لمستحقات العامل عند نهاية الخدمة: مكافأة نهاية الخدمة، كسر آخر راتب، رصيد الإجازات، وبدل مهلة الإشعار"
          appliesTo="المملكة العربية السعودية — عقود العمل في القطاع الخاص"
          keyRule="المادتان 84 و85 للمكافأة — المادة 111 للإجازات — المادتان 75 و76 لمهلة الإشعار"
          authority="وزارة الموارد البشرية والتنمية الاجتماعية"
          authorityUrl="https://hrsd.gov.sa"
          lastReviewed="سبتمبر 2026"
          disclaimer="هذه الأداة تقديرية استرشادية — نتائجها لا تُعدّ مخالصة رسمية. راجع متخصصاً عند الحاجة."
        />

        {/* PART 2: Editorial explanation */}
        <section className="fp-wrap fp-sec">
          <div className="fp-card">
            <h2 className="fp-h2">ما هي المخالصة النهائية وما أهميتها القانونية؟</h2>

            <div>
              <p className="fp-p">
                <strong>المخالصة النهائية</strong> هي التصفية الشاملة لجميع الحقوق المالية المتبادلة بين العامل وصاحب العمل عند انتهاء علاقة العمل. تشمل كل ما استحقه العامل من مستحقات طوال مدة خدمته، وما قد يكون على العامل من ديون ومديونيات لصاحب العمل. في المملكة العربية السعودية، يُعدّ إنجاز المخالصة بصورة صحيحة ودقيقة أمراً بالغ الأهمية، إذ يحمي كلا الطرفين من النزاعات العمالية ودعاوى المطالبة المستقبلية.
              </p>
              <p className="fp-p">
                نظام العمل السعودي الصادر بالمرسوم الملكي (م/51) يُنظّم حقوق العامل عند انتهاء الخدمة. تستند هذه الحاسبة إلى القواعد المنشورة في المادتين (84) و(85) الخاصتين بمكافأة نهاية الخدمة، والمادة (111) الخاصة ببدل الإجازة السنوية، والمادتين (75) و(76) الخاصتين بمهلة الإشعار — وفق المصادر الرسمية المتاحة. تُعدّ نتائجها تقديرية ولا تُغني عن مراجعة متخصص في حالات النزاع.
              </p>
            </div>

            <div>
              <h3 className="fp-h3">كيفية الاستخدام — خطوة بخطوة</h3>
              <ol className="fp-steps">
                {STEPS.map((text) => (
                  <li key={text}><span>{text}</span></li>
                ))}
              </ol>
            </div>

            <div className="fp-ex">
              <h3 className="fp-h3">مثال عملي بالأرقام</h3>
              <p className="fp-p" style={{ marginBottom: 12 }}>
                <strong>الحالة:</strong> موظف راتبه الأساسي 8,000 ر.س + بدل سكن 2,000 ر.س + بدل نقل 1,000 ر.س (إجمالي 11,000 ر.س)، خدم 6 سنوات و4 أشهر، أُنهيت خدمته من صاحب العمل، لديه 18 يوم إجازة غير مستنفدة، لم تُخدَم مهلة الإشعار (60 يوماً).
              </p>
              <div>
                {EXAMPLE.map(([label, formula, amount]) => (
                  <div key={label} className="fp-exr">
                    <span><b>{label}</b><small>{formula}</small></span>
                    <b>{amount}</b>
                  </div>
                ))}
              </div>
              <div className="fp-net"><span>صافي المخالصة</span><span>{EXAMPLE_NET}</span></div>
              <p className="fp-fn">
                * المثال توضيحي. قد يتفاوت الناتج الفعلي بحسب آخر يوم عمل (تاريخ الشهر) والبنود التعاقدية المحددة.
              </p>
            </div>

            <div>
              <h3 className="fp-h3">المواد القانونية المستند إليها</h3>
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

        {/* PART 3: FAQ */}
        <section className="fp-wrap fp-sec">
          <div className="fp-card">
            <h2 className="fp-h2">الأسئلة الشائعة حول المخالصة النهائية في السعودية</h2>
            <div className="fp-faq">
              {faqJsonLd.mainEntity.map((faq) => (
                <div key={faq.name}>
                  <h3>{faq.name}</h3>
                  <p>{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PART 4: Related tools */}
        <section className="fp-wrap fp-sec fp-bot">
          <div className="fp-card">
            <div className="fp-chain">
              <h2>سلسلة أدوات سوق العمل والموظف السعودي (Saudi Tool Chain)</h2>
              <p>تتكامل هذه الحاسبة الشاملة مع الحاسبات المتخصصة الثلاث لحساب كل بند بدقة وتفصيل مستقل:</p>
              <div className="fp-g3">
                {CHAIN.map((c) => (
                  <Link key={c.href} href={c.href} className="fp-lk">
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                    <span className="go">فتح الأداة ←</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="fp-h3" style={{ fontSize: 18, marginBottom: 4 }}>أدوات مالية وإدارية أخرى ذات صلة</h2>
              <p className="fp-fn" style={{ marginTop: 0, marginBottom: 16 }}>حاسبات مساندة لإدارة مستحقاتك المالية والضريبية</p>
              <div className="fp-g2">
                {RELATED.map((t) => (
                  <Link key={t.href + t.title} href={t.href} className="fp-lk">
                    <span className="t">
                      {t.title}
                      {t.badge && <span className="fp-b">{t.badge}</span>}
                    </span>
                    <p>{t.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="fp-rev">
              <p>
                <strong>تاريخ آخر مراجعة قانونية:</strong> 2026م — متوافق مع نظام العمل السعودي الصادر بالمرسوم الملكي رقم (م/51) وتعديلاته الصادرة بالمرسوم الملكي رقم (م/14) واللوائح التنفيذية لوزارة الموارد البشرية والتنمية الاجتماعية (
                <a href="https://www.hrsd.gov.sa" target="_blank" rel="noopener noreferrer">hrsd.gov.sa</a>
                ). الحاسبة استرشادية، ويُنصح دائماً بالرجوع للمنصة العمالية الرسمية (ودي) في حال وجود نزاع تعاقدي.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}