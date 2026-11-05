import FinalSettlementCalculator from "@/components/FinalSettlementCalculator";
import Link from "next/link";
import GeoAnswerSummary from "@/components/GeoAnswerSummary";
import { SITE_URL, SITE_ORG_ID, DEFAULT_OG_IMAGE } from "@/lib/siteConfig";

// حدّث هذا التاريخ فقط بعد مراجعة فعلية للنصوص والنسب
const LAST_REVIEWED = "نوفمبر 2026";

const PATH = "/ar/sa/final-settlement-calculator";
const TITLE = "حاسبة المخالصة النهائية في السعودية 2026 | نهاية الخدمة والإجازة";
const DESC =
  "احسب مخالصتك النهائية في السعودية: مكافأة نهاية الخدمة وبدل الإجازات وآخر راتب وبدل الإشعار، مع نموذج مخالصة قابل للطباعة. مجاني وبدون تسجيل.";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: `${SITE_URL}${PATH}`,
    type: "website",
    locale: "ar_SA",
    images: [DEFAULT_OG_IMAGE],
  },
};

// ─── FAQ (single source for visible text AND JSON-LD) ─────────────────────────
const FAQ = [
  {
    q: "كيف تُحسب مكافأة نهاية الخدمة في السعودية وفق المادة 84؟",
    a: "وفق المادة (84) من نظام العمل السعودي: يستحق العامل نصف أجر شهري عن كل سنة من السنوات الخمس الأولى، وأجر شهر كامل عن كل سنة تزيد على ذلك. السنوات الكسرية تحتسب بالتناسب. مثال: موظف راتبه 10,000 ر.س وخدمته 7 سنوات = (10,000 × 0.5 × 5) + (10,000 × 1 × 2) = 25,000 + 20,000 = 45,000 ر.س.",
  },
  {
    q: "هل يستحق المستقيل مكافأة نهاية الخدمة كاملة في السعودية؟",
    a: "وفق المادة (85): المستقيل قبل سنتين لا يستحق مكافأة. من سنتين إلى أقل من 5 سنوات يستحق ثلث المكافأة. من 5 إلى أقل من 10 سنوات يستحق ثلثيها. بعد 10 سنوات فأكثر يستحقها كاملة. أما في حالات الإنهاء من صاحب العمل أو انتهاء العقد فيستحق الموظف المكافأة كاملة بصرف النظر عن مدة الخدمة.",
  },
  {
    q: "ما هي مدة مهلة الإشعار في نظام العمل السعودي؟",
    a: "وفق المادة (75) بعد تعديلات فبراير 2025، وللعقد غير محدد المدة بأجر شهري: 30 يوماً على الأقل إذا أنهى العامل العقد، و60 يوماً على الأقل إذا أنهاه صاحب العمل. وللأجر غير الشهري 30 يوماً لأي من الطرفين. ومن لا يلتزم بالمهلة يدفع للطرف الآخر مبلغاً يعادل أجر مدة الإشعار (المادة 76).",
  },
  {
    q: "كيف يُحسب بدل الإجازة السنوية غير المستنفدة عند ترك العمل؟",
    a: "وفق المادة (111) من نظام العمل: عند ترك العمل يستحق الموظف تعويضاً نقدياً عن أيام إجازاته السنوية التي لم يأخذها. يُحسب الأجر اليومي بقسمة الراتب الشهري على 30 (أو الأساس المتفق عليه)، ثم يُضرب الناتج في عدد أيام الإجازة المستحقة. مثال: راتب 9,000 ر.س و20 يوم إجازة = (9,000 ÷ 30) × 20 = 6,000 ر.س.",
  },
  {
    q: "ما الأجر المعتمد لحساب مكافأة نهاية الخدمة: الأساسي أم الإجمالي؟",
    a: "تُحسب المكافأة على آخر أجر للعامل، وهو في تعريف نظام العمل يشمل الأجر الأساسي وما يُضاف إليه من بدلات وعلاوات ثابتة. وقد تُعرّف بعض العقود أو اللوائح عناصر الأجر بصورة مختلفة، فراجع عقدك والنص الرسمي. تتيح الحاسبة إدخال الأساسي والبدلات كلاً على حدة.",
  },
  {
    q: "ما الفرق بين المخالصة النهائية ومكافأة نهاية الخدمة؟",
    a: "مكافأة نهاية الخدمة بند واحد من بنود المخالصة النهائية. أما المخالصة فتجمع المكافأة مع الراتب الأخير المستحق وبدل رصيد الإجازات وبدل مهلة الإشعار عند استحقاقه، إضافةً إلى أي مبالغ أخرى أو خصومات وفق العقد والأنظمة. تعرض الحاسبة هذه البنود منفصلة، والنتيجة تقديرية وليست وثيقة مخالصة رسمية.",
  },
  {
    q: "كيف تتم الاستقالة بعد تعديلات نظام العمل 2025؟",
    a: "وفق المادة 79 مكرر المضافة بالتعديلات، يُعدّ طلب الاستقالة مقبولاً إذا مضت 30 يوماً دون رد من صاحب العمل، وله تأجيل القبول مدة لا تزيد على 60 يوماً بإيضاح مسبب مكتوب قبل انتهاء الثلاثين. راجع النص الرسمي لتفاصيل الحالات والاستثناءات.",
  },
  {
    q: "هل أوقّع نموذج المخالصة النهائية قبل التأكد من المبالغ؟",
    a: "لا يُنصح بذلك. قارن كل بند في المخالصة مع عقدك وكشف حسابك، لأن التوقيع قد يترتب عليه التنازل عن مطالبات لاحقة. في حال وجود خلاف راجع المنصة الرسمية للتسوية الودية أو متخصصاً قانونياً قبل التوقيع.",
  },
];

// ─── JSON-LD ──────────────────────────────────────────────────────────────────
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

// بدون offers وبدون تقييمات: أداة مجانية
const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "حاسبة المخالصة النهائية في السعودية",
  url: `${SITE_URL}${PATH}`,
  inLanguage: "ar",
  operatingSystem: "All",
  applicationCategory: "FinanceApplication",
  isAccessibleForFree: true,
  description: DESC,
  publisher: { "@id": SITE_ORG_ID },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "أدوات السعودية", item: `${SITE_URL}/ar/sa` },
    { "@type": "ListItem", position: 3, name: "حاسبة المخالصة النهائية", item: `${SITE_URL}${PATH}` },
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

// المثال يطابق الحاسبة: 6 سنوات و4 أشهر = 6.333 سنة
const EXAMPLE = [
  ["آخر راتب مستحق", "(11,000 ÷ 30) × 15 يوم", "5,500.00 ر.س"],
  ["مكافأة نهاية الخدمة", "(11,000 × 0.5 × 5) + (11,000 × 1 × 1.333)", "42,166.67 ر.س"],
  ["بدل الإجازة", "(11,000 ÷ 30) × 18 يوم", "6,600.00 ر.س"],
  ["بدل مهلة الإشعار", "(11,000 ÷ 30) × 60 يوم", "22,000.00 ر.س"],
];
const EXAMPLE_NET = "76,266.67 ر.س";

const RESIGN = [
  ["أقل من سنتين", "لا مكافأة", "0"],
  ["من سنتين إلى أقل من 5 سنوات", "ثلث المكافأة", "1/3"],
  ["من 5 إلى أقل من 10 سنوات", "ثلثا المكافأة", "2/3"],
  ["10 سنوات فأكثر", "المكافأة كاملة", "1"],
];

const ARTICLES = [
  { art: "المادة 84", title: "مكافأة نهاية الخدمة", desc: "نصف شهر عن كل سنة في أول 5 سنوات. شهر كامل عن كل سنة بعدها. السنوات الكسرية بالتناسب." },
  { art: "المادة 85", title: "تدرج الاستقالة", desc: "قبل سنتين: لا مكافأة. 2-5 سنوات: ثلث. 5-10 سنوات: ثلثان. 10+ سنوات: كاملة." },
  { art: "المادة 111", title: "بدل الإجازة السنوية", desc: "تعويض نقدي عن الإجازات السنوية غير المستنفدة عند ترك العمل." },
  { art: "المادتان 75 و76", title: "مهلة الإشعار", desc: "30 يوماً (إشعار العامل) أو 60 يوماً (إنهاء صاحب العمل) للأجر الشهري، وبدل الإشعار عند عدم الالتزام." },
];

const CHAIN = [
  { href: "/gratuity-calculator/saudi", title: "حاسبة مكافأة نهاية الخدمة", desc: "تفصيل المادتين 84 و85 وتدرج الاستقالة وسنوات الخدمة." },
  { href: "/ar/sa/annual-leave-calculator", title: "حاسبة بدل الإجازات", desc: "التعويض النقدي لرصيد الإجازات وفق المادتين 109 و111." },
  { href: "/salary-calculator/saudi", title: "حاسبة الراتب الصافي", desc: "استقطاعات التأمينات الاجتماعية GOSI وساند وصافي الراتب." },
];

const RELATED = [
  { href: "/ar/sa/article-77-calculator", title: "حاسبة تعويض المادة 77", desc: "تعويض الفصل التعسفي والإنهاء غير المشروع", badge: "المادة 77" },
  { href: "/overtime-calculator/saudi", title: "حاسبة الأوفر تايم", desc: "أجر الساعات الإضافية 150٪ وفق المادة 107", badge: "150%" },
  { href: "/vat-calculator/saudi", title: "حاسبة ضريبة القيمة المضافة", desc: "ضريبة القيمة المضافة 15٪ في السعودية", badge: "15% VAT" },
  { href: "/ar/sa", title: "أدوات المملكة العربية السعودية", desc: "جميع الحاسبات المالية والعمالية للسعودية في مكان واحد", badge: "" },
];

// ─── Styles (متناسق مع تصميم Qemlo: بطاقات 26px، شارات برتقالية) ─────────────
const CSS = `
.fp{--bg:var(--c-bg,#F5F5F2);--ink:var(--c-ink,#0D0D0D);--ac:var(--c-accent,#FF6A1A);--sf:var(--c-surface,#FFFFFF);--mu:var(--c-muted,#55554F);--ln:var(--c-line,#D9D9D3);background:var(--bg);color:var(--ink);min-height:100vh;font-size:15px;line-height:1.75}
@media (prefers-color-scheme:dark){.fp{--bg:var(--c-bg,#0D0D0D);--ink:var(--c-ink,#F5F5F2);--sf:var(--c-surface,#181816);--mu:var(--c-muted,#B4B4AD);--ln:var(--c-line,#34342F)}}
.fp *{box-sizing:border-box}
.fp h2,.fp h3,.fp h4,.fp p,.fp ol{margin:0;padding:0}
.fp-wrap{max-width:48rem;margin:0 auto;padding-inline:16px}
.fp a{color:inherit}
.fp a:focus-visible,.fp summary:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.fp-crumb{padding-top:16px;padding-bottom:4px}
.fp-crumb ol{list-style:none;display:flex;flex-wrap:wrap;gap:6px;font-size:13px;color:var(--mu)}
.fp-crumb li+li::before{content:"/";margin-inline-end:6px}
.fp-crumb a{text-decoration:underline;text-underline-offset:3px}
.fp-crumb [aria-current]{color:var(--ink);font-weight:700}
.fp-card{background:var(--sf);border:1px solid var(--ln);border-radius:26px;padding:22px;display:flex;flex-direction:column;gap:24px}
@media(min-width:640px){.fp-card{padding:32px}}
.fp-sec{padding-top:24px}
.fp-h2{font-size:22px;font-weight:800;line-height:1.35;padding-bottom:12px;border-bottom:1px solid var(--ln)}
.fp-h3{font-size:16px;font-weight:800;margin-bottom:12px}
.fp-p{font-size:14.5px}
.fp-p+.fp-p{margin-top:12px}
.fp-steps{list-style:none;display:flex;flex-direction:column;gap:10px;counter-reset:s}
.fp-steps li{display:flex;gap:12px;align-items:flex-start;font-size:14px;counter-increment:s}
.fp-steps li::before{content:counter(s);flex:none;width:28px;height:28px;display:grid;place-items:center;border-radius:10px;color:#0D0D0D;background:linear-gradient(160deg,#FF9B63,#FF6A1A 55%,#EE5A0B);font-weight:800;font-size:13px}
.fp-ex{border:1px solid var(--ln);border-radius:20px;background:var(--bg);padding:20px}
.fp-exr{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--ln);font-size:14px}
.fp-exr small{display:block;font-size:12px;color:var(--mu)}
.fp-exr b{white-space:nowrap}
.fp-net{display:flex;justify-content:space-between;gap:12px;margin-top:12px;padding:12px 16px;border-radius:16px;background:linear-gradient(160deg,#FF9B63,#FF6A1A 55%,#EE5A0B);color:#0D0D0D;font-weight:800;font-size:16px}
.fp-fn{margin-top:12px;font-size:12px;color:var(--mu)}
.fp-tw{overflow-x:auto;border:1px solid var(--ln);border-radius:16px}
.fp-t{width:100%;border-collapse:collapse;font-size:14px}
.fp-t th,.fp-t td{padding:12px 14px;text-align:start;border-bottom:1px solid var(--ln)}
.fp-t tr:last-child td{border-bottom:0}
.fp-t th{background:var(--bg);font-weight:800}
.fp-g2,.fp-g3{display:grid;gap:12px;grid-template-columns:1fr}
@media(min-width:640px){.fp-g2{grid-template-columns:1fr 1fr}.fp-g3{grid-template-columns:repeat(3,1fr)}}
.fp-art{border:1px solid var(--ln);border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:6px}
.fp-tag{align-self:flex-start;background:var(--ink);color:var(--bg);font-size:12px;font-weight:800;padding:1px 10px;border-radius:8px}
.fp-art b{font-size:14px}
.fp-art p{font-size:13px;color:var(--mu)}
.fp-faq>div{padding:18px 0;border-bottom:1px solid var(--ln)}
.fp-faq>div:first-child{padding-top:0}
.fp-faq>div:last-child{border-bottom:0;padding-bottom:0}
.fp-faq h3{font-size:15px;font-weight:800;margin-bottom:6px}
.fp-faq p{font-size:14px}
.fp-note{border:1px solid var(--ln);border-radius:18px;background:var(--bg);padding:16px 18px;font-size:13.5px}
.fp-chain{border:1px solid var(--ln);border-radius:22px;background:var(--bg);padding:20px}
.fp-chain h2{font-size:18px;font-weight:800}
.fp-chain>p{font-size:13px;color:var(--mu);margin:4px 0 16px}
.fp-lk{display:flex;flex-direction:column;gap:6px;text-decoration:none;background:var(--sf);border:1px solid var(--ln);border-inline-start:6px solid var(--ac);border-radius:16px;padding:14px 16px;min-height:44px}
.fp-lk:hover{background:var(--ink);color:var(--bg)}
.fp-lk:hover p{color:var(--bg)}
.fp-lk h3,.fp-lk .t{font-size:14px;font-weight:800;margin:0;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.fp-lk p{font-size:12px;color:var(--mu)}
.fp-lk .go{font-size:12px;font-weight:800;text-decoration:underline;text-underline-offset:3px}
.fp-b{border:1px solid currentColor;border-radius:8px;font-size:11px;font-weight:800;padding:0 8px}
.fp-rev{border:1px dashed var(--ln);border-radius:16px;padding:14px 16px;font-size:12px}
.fp-rev a{font-weight:800;text-decoration:underline;text-underline-offset:3px}
.fp-bot{padding-bottom:48px}
@media print{.fp-crumb{display:none}}
`;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FinalSettlementPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />

      <main className="fp" dir="rtl">
        <style>{CSS}</style>

        <nav className="fp-wrap fp-crumb" aria-label="مسار التنقل">
          <ol>
            <li><Link href="/">الرئيسية</Link></li>
            <li><Link href="/ar/sa">أدوات السعودية</Link></li>
            <li aria-current="page">حاسبة المخالصة النهائية</li>
          </ol>
        </nav>

        {/* الحاسبة (يجب أن يحتوي المكوّن على H1 واحد فقط: «حاسبة المخالصة النهائية في السعودية») */}
        <div className="fp-wrap" style={{ paddingTop: 16, paddingBottom: 16 }}>
          <FinalSettlementCalculator />
        </div>

        <GeoAnswerSummary
          whatItDoes="تصفية شاملة لمستحقات العامل عند نهاية الخدمة: مكافأة نهاية الخدمة، كسر آخر راتب، رصيد الإجازات، وبدل مهلة الإشعار"
          appliesTo="المملكة العربية السعودية — عقود العمل في القطاع الخاص"
          keyRule="المادتان 84 و85 للمكافأة — المادة 111 للإجازات — المادتان 75 و76 لمهلة الإشعار"
          authority="وزارة الموارد البشرية والتنمية الاجتماعية"
          authorityUrl="https://hrsd.gov.sa"
          lastReviewed={LAST_REVIEWED}
          disclaimer="هذه الأداة تقديرية استرشادية — نتائجها لا تُعدّ مخالصة رسمية. راجع متخصصاً عند الحاجة."
        />

        {/* 1) تعريف مباشر + طريقة الاستخدام + مثال */}
        <section className="fp-wrap fp-sec">
          <div className="fp-card">
            <h2 className="fp-h2">ما هي المخالصة النهائية وكيف تُحسب؟</h2>

            <div>
              <p className="fp-p">
                <strong>المخالصة النهائية</strong> هي تسوية مستحقات العامل عند انتهاء علاقة العمل، وتشمل عادةً مكافأة نهاية الخدمة وآخر راتب مستحق وتعويض رصيد الإجازات وبدل الإشعار إن وجد. أدخل بيانات خدمتك لتحسب الحاسبة كل بند على حدة وتعرض الإجمالي، ثم اطبع نموذج المخالصة. النتيجة تقديرية وفق نظام العمل السعودي وليست بديلاً عن الجهة الرسمية أو عقد العمل.
              </p>
              <p className="fp-p">
                تستند الحاسبة إلى نظام العمل الصادر بالمرسوم الملكي (م/51) وتعديلاته، وتحديداً المادتين (84) و(85) لمكافأة نهاية الخدمة، والمادة (111) لبدل الإجازة السنوية، والمادتين (75) و(76) لمهلة الإشعار، مع مراعاة تعديلات فبراير 2025.
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
                <strong>الحالة:</strong> موظف راتبه الأساسي 8,000 ر.س + بدل سكن 2,000 ر.س + بدل نقل 1,000 ر.س (إجمالي 11,000 ر.س)، خدم 6 سنوات و4 أشهر، أنهى صاحب العمل خدمته، ولديه 18 يوم إجازة غير مستنفدة، ولم تُخدَم مهلة الإشعار (60 يوماً).
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
              <p className="fp-fn">* المثال توضيحي. قد يتفاوت الناتج الفعلي بحسب آخر يوم عمل والبنود التعاقدية.</p>
            </div>
          </div>
        </section>

        {/* 2) مكافأة الاستقالة (جدول) */}
        <section className="fp-wrap fp-sec">
          <div className="fp-card">
            <h2 className="fp-h2">مكافأة نهاية الخدمة عند الاستقالة حسب مدة الخدمة</h2>
            <p className="fp-p">
              عند الإنهاء من صاحب العمل أو انتهاء العقد تُصرف المكافأة كاملة. أما عند استقالة العامل فتُصرف نسبة منها وفق المادة (85):
            </p>
            <div className="fp-tw">
              <table className="fp-t">
                <thead>
                  <tr><th>مدة الخدمة</th><th>المستحق عند الاستقالة</th><th>النسبة</th></tr>
                </thead>
                <tbody>
                  {RESIGN.map(([years, due, ratio]) => (
                    <tr key={years}><td>{years}</td><td>{due}</td><td>{ratio}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="fp-p">
              مثال: أجر 10,000 ر.س وخدمة 6 سنوات، المكافأة الكاملة 35,000 ر.س (25,000 عن أول 5 سنوات + 10,000 عن السنة السادسة). عند الاستقالة يستحق ثلثيها، أي نحو 23,333.33 ر.س. للتفصيل استخدم{" "}
              <Link href="/gratuity-calculator/saudi" style={{ fontWeight: 800 }}>حاسبة مكافأة نهاية الخدمة</Link>.
            </p>
          </div>
        </section>

        {/* 3) بدل الإجازات + نموذج المخالصة */}
        <section className="fp-wrap fp-sec">
          <div className="fp-card">
            <div>
              <h2 className="fp-h2">بدل الإجازات عند نهاية الخدمة</h2>
              <p className="fp-p" style={{ marginTop: 14 }}>
                يستحق العامل عند ترك العمل تعويضاً نقدياً عن الإجازات السنوية التي لم يستخدمها (المادة 111). يُحسب الأجر اليومي بقسمة الأجر الشهري على 30، ثم يُضرب في عدد الأيام المتبقية. لتفاصيل الاستحقاق السنوي (21 يوماً أو 30 يوماً بعد 5 سنوات) استخدم{" "}
                <Link href="/ar/sa/annual-leave-calculator" style={{ fontWeight: 800 }}>حاسبة بدل الإجازات في السعودية</Link>.
              </p>
            </div>

            <div>
              <h2 className="fp-h2">نموذج مخالصة نهائية للطباعة</h2>
              <p className="fp-p" style={{ marginTop: 14 }}>
                بعد حساب المستحقات يمكنك إنشاء نموذج مخالصة نهائية قابل للطباعة يتضمن بيانات الموظف وجهة العمل وتفصيل كل بند وخانات التوقيع. النموذج ملخص حسابي وليس نصاً قانونياً ملزماً.
              </p>
              <div className="fp-note" style={{ marginTop: 14 }}>
                <strong>قبل التوقيع:</strong> طابق كل بند مع عقدك وكشف حسابك. قد يترتب على توقيع المخالصة التنازل عن مطالبات لاحقة، ففي حال الخلاف راجع متخصصاً قانونياً أو المنصة الرسمية للتسوية الودية.
              </div>
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

        {/* 4) الأسئلة الشائعة */}
        <section className="fp-wrap fp-sec">
          <div className="fp-card">
            <h2 className="fp-h2">الأسئلة الشائعة حول المخالصة النهائية في السعودية</h2>
            <div className="fp-faq">
              {FAQ.map(({ q, a }) => (
                <div key={q}>
                  <h3>{q}</h3>
                  <p>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5) أدوات ذات صلة */}
        <section className="fp-wrap fp-sec fp-bot">
          <div className="fp-card">
            <div className="fp-chain">
              <h2>حاسبات مرتبطة بالمخالصة النهائية</h2>
              <p>كل بند من بنود المخالصة له حاسبة متخصصة بتفصيل أكبر:</p>
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
              <h2 className="fp-h3" style={{ fontSize: 18, marginBottom: 12 }}>أدوات عمالية ومالية أخرى</h2>
              <div className="fp-g2">
                {RELATED.map((t) => (
                  <Link key={t.href} href={t.href} className="fp-lk">
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
                <strong>آخر تحديث للمحتوى:</strong> {LAST_REVIEWED}. المرجع: نظام العمل السعودي الصادر بالمرسوم الملكي (م/51) وتعديلاته بالمرسوم (م/44) وتاريخ 8/2/1446هـ، السارية اعتباراً من 19 فبراير 2025م، ومنصات وزارة الموارد البشرية والتنمية الاجتماعية (
                <a href="https://www.hrsd.gov.sa" target="_blank" rel="noopener noreferrer">hrsd.gov.sa</a>
                ). الحاسبة استرشادية وليست بديلاً عن الجهات الرسمية أو المشورة القانونية.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}