import UaeNoticePeriodCalculator from "@/components/UaeNoticePeriodCalculator";
import Link from "next/link";
import GeoAnswerSummary from "@/components/GeoAnswerSummary";
import { TOOL_PAGE_CSS } from "@/lib/toolPageCss";
import { SITE_URL, SITE_NAME, SITE_ORG_ID, SITE_WEBSITE_ID, DEFAULT_OG_IMAGE } from "@/lib/siteConfig";

const PATH = "/ar/ae/notice-period-calculator";
const LAST_REVIEWED = "نوفمبر 2026";
const LAST_REVIEWED_ISO = "2026-11-10";
const TITLE = "حاسبة فترة الإنذار في الإمارات 2026 | بدل الإنذار";
const DESC =
  "احسب آخر يوم عمل وبدل الإنذار في الإمارات وفق المادة 43: مهلة من 30 إلى 90 يوماً، والبدل = الأيام غير المنفذة × (آخر أجر ÷ 30). للقطاع الخاص بأجر شهري. مجاناً.";

// المصادر الرسمية (تُعرض في الصفحة وتدخل في البيانات المنظمة)
const SOURCES = [
  {
    href: "https://www.mohre.gov.ae/assets/download/e82f7872/Federal%20Decree-Law%20No.%2033%20of%202021%20Regarding%20the%20Regulation%20of%20Employment%20Relationship%20and%20its%20amendments_638990571068264034.pdf.aspx",
    name: "النص الموحّد للمرسوم بقانون اتحادي رقم (33) لسنة 2021 وتعديلاته واللائحة التنفيذية — وزارة الموارد البشرية والتوطين (MOHRE)",
  },
  { href: "https://uaelegislation.gov.ae/en/legislations/1541", name: "بوابة التشريعات الإماراتية — النص التشريعي وحالة التحديث" },
  {
    href: "https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/job-offers-and-work-permits-and-contracts/terminating-employment-contracts",
    name: "حكومة الإمارات — إنهاء عقود العمل وفترة الإنذار",
  },
  { href: "https://www.mohre.gov.ae/", name: "وزارة الموارد البشرية والتوطين (MOHRE)" },
];

// ─── Metadata ───────────────────────────────────────────────────────────────
export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: {
    canonical: PATH,
    languages: { "ar-AE": PATH },
  },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: `${SITE_URL}${PATH}`,
    siteName: SITE_NAME,
    type: "website",
    locale: "ar_AE",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

// Shared answer for notice period waiver FAQ
const noticeWaiverAnswer = "تتراوح مدة الإنذار المتفق عليها أصلاً بين 30 و90 يوماً. وتسمح المادة (43/2) للطرفين بالاتفاق على الإعفاء من شرط الإنذار أو تخفيض مدته مع الحفاظ على حقوق العامل عن مدة الإنذار المتفق عليها، ويجب أن تكون المدة متساوية للطرفين ما لم يكن الاختلاف لصالح العامل. لذلك لا يعني اختيار الإعفاء تلقائياً أن بدل الإنذار يساوي صفراً؛ بل يجب مراجعة الاتفاق المكتوب والحقوق التي يحفظها.";

const noticeFaqs = [
  {
    q: "ما هي فترة الإنذار القانونية في قانون العمل الإماراتي رقم 33 لسنة 2021؟",
    a: "وفق المادة (43)، يجب أن يكون الإخطار خطياً، وتتراوح مدة الإنذار المتفق عليها في عقود العمل الخاضعة للقانون الاتحادي بين 30 و90 يوماً. ويظل العقد سارياً خلال المهلة ويستحق العامل أجره الأخير عنها.",
  },
  {
    q: "كيف يُحسب بدل الإنذار للموظف الذي يتقاضى راتباً شهرياً؟",
    a: "لأغراض هذا التقدير للعامل الشهري: الأجر اليومي التقديري = آخر أجر شهري ÷ 30، لأن المادة (67) تعتبر الشهر 30 يوماً؛ ثم يُضرب الأجر اليومي في عدد الأيام المتبقية غير المنفذة. ويجب إدخال الأجر وفق تعريفه القانوني، لا الأساسي وحده.",
  },
  {
    q: "من يدفع بدل الإنذار: صاحب العمل أم الموظف؟",
    a: "يدفع البدل الطرف الذي لم يلتزم بمهلة الإنذار وفق المادة (43/3)، وليس بالضرورة الطرف الذي بدأ إنهاء العقد. فإذا منع صاحب العمل العامل من إكمال المهلة، يكون صاحب العمل هو الطرف المخل؛ وإذا غادر العامل قبل إكمال المهلة دون اتفاق، يكون العامل هو الطرف المخل. ويُحدد الطرف المسؤول بحسب الوقائع والاتفاق.",
  },
  {
    q: "هل يجوز الاتفاق على إعفاء أو تخفيض فترة الإنذار؟",
    a: noticeWaiverAnswer,
  },
  {
    q: "هل يمكن استخدام الحاسبة أثناء فترة التجربة؟",
    a: "لا. هذه الحاسبة لا تحسب فترة التجربة. تخضع الحالات للمادة (9): إخطار صاحب العمل للعامل قبل 14 يوماً على الأقل؛ وإخطار العامل قبل شهر إذا انتقل إلى صاحب عمل آخر داخل الدولة؛ أو قبل 14 يوماً على الأقل إذا كان العامل الأجنبي سيغادر الدولة. وقد تترتب التزامات أخرى بحسب الحالة.",
  },
  {
    q: "هل تنطبق الحاسبة على موظفي DIFC أو ADGM والقطاع الحكومي والعمالة المنزلية؟",
    a: "لا. الحاسبة مخصصة لعقود القطاع الخاص الخاضعة لقانون العمل الاتحادي فقط. موظفو الجهات الحكومية، والعاملون في القوات المسلحة والشرطة والأمن، والعمالة المنزلية مستثنون من نطاق هذا القانون أو يخضعون لتشريعات أخرى؛ كما أن DIFC وADGM لهما أطر عمل مستقلة. تتوقف الحاسبة عند اختيار هذه الفئات أو عدم التأكد من النطاق.",
  },
  {
    q: "هل تدعم الحاسبة الرواتب الأسبوعية أو اليومية أو بالساعة أو بالقطعة؟",
    a: "لا، النسخة الحالية تدعم الأجر الشهري فقط. تنص المادة (43/4) على أساس الأجر الأخير للموظفين الشهريين والأسبوعيين واليوميين وبالساعة، وعلى متوسط الأجر اليومي للعامل بالقطعة. لا تستخدم قسمة الراتب الشهري على 30 للحالات غير الشهرية.",
  },
  {
    q: "ما الفرق بين مدة الإنذار وبدل الإنذار في الإمارات؟",
    a: "مدة الإنذار هي المهلة المتفق عليها التي يستمر خلالها عقد العمل. أما بدل الإنذار فهو التعويض عن كامل المهلة أو الجزء المتبقي الذي لم يلتزم به الطرف المسؤول. إذا نُفذت المهلة كاملة، فلا توجد أيام غير منفذة في هذا التقدير.",
  },
  {
    q: "كيف تؤثر الإجازة على بدء فترة الإنذار؟",
    a: "وفق المادة (35)، إذا رغب أي من الطرفين في إنهاء العقد أثناء إجازة العامل، فلا تبدأ مهلة الإنذار المتفق عليها إلا من اليوم التالي لموعد عودة العامل المجدول من الإجازة، ما لم يتفق الطرفان على خلاف ذلك. لا تحسب هذه النسخة هذا التوقيت أو الاتفاقات المختلفة؛ لذلك تتوقف عن إصدار رقم آلي عند تأكيد أن الإشعار قُدم أثناء الإجازة أو عند عدم التأكد.",
  },
  {
    q: "هل تشمل الحاسبة حالات الفصل أو ترك العمل دون إنذار؟",
    a: "لا. تسمح المادة (44) لصاحب العمل بالفصل دون إنذار في حالات محددة وبعد تحقيق خطي وقرار فصل مكتوب ومسبب، بينما تجيز المادة (45) للعامل ترك العمل دون إنذار مع الاحتفاظ بحقوقه في حالات محددة وبشروطها. هذه الحاسبة تقدّر حالات المادة (43) فقط ولا تقرر انطباق استثناءات المادتين (44) و(45)؛ راجع النص الرسمي ووزارة الموارد البشرية والتوطين (MOHRE).",
  },
  {
    q: "هل يستحق العامل أجره خلال فترة الإنذار؟",
    a: "نعم. وفق المادة (43) يظل عقد العمل سارياً طوال فترة الإنذار، ويستحق العامل أجره كاملاً عنها على أساس آخر أجر كان يتقاضاه، ويؤدي عمله خلالها إذا طلب صاحب العمل ذلك.",
  },
  {
    q: "هل يحق للعامل التغيب للبحث عن عمل خلال فترة الإنذار؟",
    a: "نعم، إذا كان صاحب العمل هو من أنهى العقد. تجيز المادة (43/5) للعامل التغيب يوم عمل واحداً في الأسبوع خلال فترة الإنذار للبحث عن عمل آخر، ويكون يوم الغياب دون أجر. ووفق ما تنشره وزارة الموارد البشرية والتوطين، يُخطر العامل صاحب العمل قبل يوم الغياب بثلاثة أيام على الأقل.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: noticeFaqs.map(({ q, a }) => ({
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
    { "@type": "ListItem", position: 2, name: "أدوات الإمارات", item: `${SITE_URL}/ar/ae` },
    { "@type": "ListItem", position: 3, name: "حاسبة فترة الإنذار", item: `${SITE_URL}${PATH}` },
  ],
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}${PATH}#app`,
  name: "حاسبة فترة الإنذار في الإمارات",
  alternateName: ["حاسبة بدل الإنذار", "حاسبة مهلة الإخطار في الإمارات", "UAE notice period calculator"],
  url: `${SITE_URL}${PATH}`,
  inLanguage: "ar",
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript",
  applicationCategory: "BusinessApplication",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "AED" },
  description: DESC,
  dateModified: LAST_REVIEWED_ISO,
  areaServed: { "@type": "Country", name: "AE" },
  featureList: [
    "آخر يوم عمل متوقع من تاريخ الإشعار ومدة الإنذار",
    "الأيام غير المنفذة من فترة الإنذار",
    "بدل الإنذار التقديري وفق المادة 43 للأجر الشهري",
    "تحديد الطرف الذي يدفع البدل",
    "فحص النطاق: التجربة، الإجازة، DIFC وADGM، المادتان 44 و45",
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
  inLanguage: "ar-AE",
  isPartOf: { "@id": SITE_WEBSITE_ID },
  publisher: { "@id": SITE_ORG_ID },
  dateModified: LAST_REVIEWED_ISO,
  mainEntity: { "@id": `${SITE_URL}${PATH}#app` },
  about: [
    { "@type": "Thing", name: "فترة الإنذار" },
    { "@type": "Thing", name: "بدل الإنذار" },
    { "@type": "Legislation", name: "المرسوم بقانون اتحادي رقم (33) لسنة 2021 بشأن تنظيم علاقات العمل", legislationJurisdiction: "AE" },
  ],
  citation: SOURCES.map((s) => ({ "@type": "CreativeWork", name: s.name, url: s.href })),
  speakable: { "@type": "SpeakableSpecification", cssSelector: [".fp-def", ".fp-quick"] },
};

// ─── Content data ───────────────────────────────────────────────────────────
const STEPS = [
  "أكد أن العمل في القطاع الخاص الخاضع للقانون الاتحادي، وأنك لست ضمن الفئات المستثناة أو DIFC/ADGM، وأن فترة التجربة انتهت، وأن الإشعار لم يُقدم أثناء الإجازة، ولا تستند الحالة إلى استثناء المادتين (44) أو (45). إذا انطبقت كلها اضغط «نعم، تنطبق كلها».",
  "اختر الطرف الذي بدأ إنهاء العقد، ثم حدد الطرف الذي لم يلتزم بإكمال فترة الإنذار؛ فقد يختلف الطرفان.",
  "حدد تاريخ الإشعار وفترة الإنذار المتفق عليها في العقد (30 إلى 90 يوماً).",
  "أدخل الأيام المنفذة أو آخر يوم عمل فعلي، ثم آخر أجر شهري إجمالي.",
  "لا تستخدم النتيجة إذا كان الأجر أسبوعياً أو يومياً أو بالساعة أو بالقطعة، أو عند وجود اتفاق إعفاء/تخفيض خاص أو حالة إنهاء دون إنذار.",
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "كيف تحسب بدل الإنذار في الإمارات",
  inLanguage: "ar",
  step: STEPS.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
};

// الحالة، الطرف المخل، الاتجاه
const WHO_PAYS = [
  ["صاحب العمل طلب من العامل المغادرة قبل إكمال المهلة دون اتفاق يحفظ الحقوق", "صاحب العمل", "لصالح العامل"],
  ["العامل غادر قبل إكمال المهلة دون اتفاق يحفظ الحقوق", "العامل", "لصالح صاحب العمل"],
  ["نُفذت المهلة كاملة", "لا أحد", "لا بدل"],
];

const EXAMPLES = [
  {
    title: "المثال 1: استقالة موظف مع التزام كامل بالإنذار",
    rows: [["آخر أجر", "9,000 درهم"], ["مدة الإنذار / المنفذ", "60 / 60 يوماً"]],
    result: "0 درهم (لا تعويض مستحق)",
  },
  {
    title: "المثال 2: استقالة موظف مع مغادرة مبكرة (خدم 40 من 60)",
    rows: [["الأجر اليومي", "300 درهم", "9,000 ÷ 30"], ["الأيام غير المنفذة", "20 يوماً", "60 − 40"]],
    result: "6,000 درهم لصالح صاحب العمل",
  },
  {
    title: "المثال 3: إنهاء من صاحب العمل (خدم 10 من 30)",
    note: "بدأ صاحب العمل إنهاء العقد، وهو أيضاً الطرف الذي لم يلتزم بإكمال المهلة.",
    rows: [["الأجر اليومي", "400 درهم", "12,000 ÷ 30"], ["الأيام غير المنفذة", "20 يوماً", "30 − 10"]],
    result: "8,000 درهم لصالح الموظف",
  },
];

const PROBATION = [
  "إذا أنهى صاحب العمل العقد أثناء التجربة: إخطار خطي لا يقل عن 14 يوماً.",
  "إذا رغب العامل بالانتقال إلى صاحب عمل آخر داخل الدولة: إخطار خطي قبل شهر على الأقل، ويتحمل صاحب العمل الجديد تكاليف الاستقدام أو التعاقد مع العامل ما لم يُتفق على غير ذلك.",
  "إذا رغب العامل الأجنبي بمغادرة الدولة: إخطار خطي قبل 14 يوماً على الأقل؛ وإذا عاد إلى الدولة وحصل على تصريح عمل جديد خلال 3 أشهر، يتحمل صاحب العمل الجديد تكاليف الاستقدام وفق المادة (9/4)، ما لم يُتفق على غير ذلك.",
];

const ARTICLES = [
  { art: "المادة 43", title: "مهلة الإنذار وبدلها", desc: "إخطار خطي من 30 إلى 90 يوماً، والطرف الذي لا يلتزم يدفع أجر المهلة أو الجزء المتبقي منها." },
  { art: "المادة 9", title: "فترة التجربة", desc: "مهل مختلفة: 14 يوماً أو شهر بحسب الحالة. خارج نطاق الحاسبة." },
  { art: "المادة 35", title: "الإنهاء أثناء الإجازة", desc: "تبدأ المهلة من اليوم التالي لموعد العودة المجدول، ما لم يُتفق على خلاف ذلك." },
  { art: "المادتان 44 و45", title: "الإنهاء دون إنذار", desc: "حالات محددة حصراً بشروط وإجراءات خاصة. خارج نطاق الحاسبة." },
  { art: "المادة 67", title: "حساب الشهر", desc: "الشهر 30 يوماً، لذلك الأجر اليومي = الأجر الشهري ÷ 30." },
  { art: "المادة 1", title: "تعريف الأجر", desc: "الأساسي مضافاً إليه البدلات المقررة كجزء من الأجر، وهو أساس بدل الإنذار." },
];

const RELATED = [
  { href: "/ar/ae/final-settlement-calculator", title: "حاسبة المخالصة النهائية في الإمارات", desc: "تصفية شاملة: مكافأة نهاية الخدمة، آخر راتب، رصيد الإجازات، وبدل الإنذار في نموذج قابل للطباعة.", tag: "الخطوة التالية" },
  { href: "/gratuity-calculator/uae", title: "حاسبة مكافأة نهاية الخدمة في الإمارات", desc: "المادة 51: على الأجر الأساسي مع سقف السنتين، ودون خصم عند الاستقالة." },
  { href: "/salary-calculator/uae", title: "حاسبة الراتب الصافي في الإمارات (WPS)", desc: "الراتب الشهري الصافي المحول بالدرهم عبر نظام حماية الأجور." },
  { href: "/overtime-calculator/uae", title: "حاسبة العمل الإضافي في الإمارات", desc: "أجر الساعات الإضافية النهارية والليلية والعطلات وفق المادة 19." },
  { href: "/vat-calculator/uae", title: "حاسبة ضريبة القيمة المضافة 5%", desc: "أضف الضريبة أو استخرج السعر قبل الضريبة." },
  { href: "/ar/ae", title: "كل أدوات الإمارات", desc: "الحاسبات العمالية والمالية والضريبية لدولة الإمارات." },
];

// يُكمل الأنماط المشتركة: يسمح بتثبيت لوحة النتيجة على الشاشات العريضة
// (globals.css يضع overflow-x:hidden على html و body معاً فيتعطل position:sticky).
const PAGE_CSS = `
@media(min-width:960px){body{overflow-x:clip}}
.fp .nc-root{background:transparent;padding-inline:0;padding-top:0}
.fp-who td:nth-child(2),.fp-who td:nth-child(3){white-space:nowrap}
@media(max-width:560px){
  .fp-who thead{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
  .fp-who tr{display:grid;grid-template-columns:1fr auto;gap:4px 10px;padding:12px 14px;border-bottom:1px solid var(--ln)}
  .fp-who tr:last-child{border-bottom:0}
  .fp-who td{padding:0;border:0}
  .fp-who td:first-child{grid-column:1/-1}
  .fp-who td:nth-child(2){color:var(--mu);font-size:13px}
  .fp-who td:nth-child(3){font-weight:800}
}
.fp-exg{display:grid;gap:12px}
@media(min-width:720px){.fp-exg{grid-template-columns:repeat(3,minmax(0,1fr))}}
.fp-exg .fp-ex{display:flex;flex-direction:column;gap:6px;padding:16px}
.fp-exg .fp-ex b.t{font-size:14px;font-weight:800}
.fp-exg .fp-exr{flex-direction:column;gap:2px;padding:8px 0}
.fp-exg .fp-exr span{font-size:12.5px;color:var(--mu)}
.fp-exg .fp-net{margin-top:auto;flex-direction:column;gap:2px}
.fp-exg .fp-net span:first-child{font-size:12px}
`;

export default function UaeNoticePeriodCalculatorPage() {
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

        <nav className="fp-wrap fp-wide fp-crumb no-print" aria-label="مسار التنقل">
          <ol>
            <li><Link href="/">الرئيسية</Link></li>
            <li><Link href="/ar/ae">أدوات الإمارات</Link></li>
            <li aria-current="page">حاسبة فترة الإنذار في الإمارات</li>
          </ol>
        </nav>

        {/* الحاسبة (تحتوي على H1 الصفحة الوحيد) */}
        <div className="fp-wrap fp-wide" style={{ paddingTop: 16, paddingBottom: 16 }}>
          <UaeNoticePeriodCalculator />
        </div>

        <GeoAnswerSummary
          whatItDoes="تحسب مدة فترة الإنذار وتاريخ آخر يوم عمل وبدل الإنذار التقديري للموظف أو صاحب العمل"
          appliesTo="القطاع الخاص الخاضع للقانون الاتحادي — موظفون بأجر شهري بعد التجربة، باستثناء الجهات الحكومية والعمالة المنزلية والقوات المسلحة والشرطة والأمن وDIFC وADGM"
          keyRule="تتراوح مدة الإنذار المتفق عليها في عقد العمل بين 30 و90 يوماً وفق المادة 43، ويجوز الاتفاق على الإعفاء منها أو تخفيضها مع حفظ حقوق العامل."
          authority="حكومة الإمارات — وزارة الموارد البشرية والتوطين (MOHRE)"
          authorityUrl={SOURCES[2].href}
          lastReviewed={LAST_REVIEWED}
          disclaimer="تقدير إرشادي للموظفين بأجر شهري في القطاع الخاص الخاضع للقانون الاتحادي بعد فترة التجربة فقط. لا يشمل الجهات الحكومية أو العمالة المنزلية أو القوات المسلحة أو الشرطة أو الأمن أو DIFC أو ADGM."
        />

        {/* 1) التعريف + المدة + المعادلة + من يدفع */}
        <section className="fp-wrap fp-sec no-print">
          <div className="fp-card">
            <div>
              <h2 className="fp-h2">ما هي فترة الإنذار في الإمارات وكيف يُحسب بدلها؟</h2>
              <p className="fp-p fp-def" style={{ marginTop: 14 }}>
                <strong>فترة الإنذار</strong> (Notice Period) هي المهلة التي يجب على أي من طرفي عقد العمل إخطار الطرف الآخر بها خطياً قبل إنهاء علاقة العمل لسبب مشروع، وتتراوح وفق المادة (43) من المرسوم بقانون اتحادي رقم 33 لسنة 2021 بين <strong>30 و90 يوماً</strong>. يظل العقد سارياً طوال المهلة ويستحق العامل أجره كاملاً عنها. وإذا لم يلتزم أحد الطرفين بالمهلة دفع للآخر <strong>بدل الإنذار</strong>: أجر العامل عن كامل المهلة أو الجزء غير المنفذ منها.
              </p>
            </div>

            <div className="fp-quick">
              <b>معادلة بدل الإنذار (للأجر الشهري)</b>
              <p>بدل الإنذار = الأيام غير المنفذة × (آخر أجر شهري شامل ÷ 30)</p>
            </div>

            <div>
              <h3 className="fp-h3">كم مدة الإنذار القانونية؟</h3>
              <ul className="fp-ul">
                <li><span><strong>الحد الأدنى:</strong> 30 يوماً تقويمياً.</span></li>
                <li><span><strong>الحد الأقصى:</strong> 90 يوماً تقويمياً.</span></li>
              </ul>
              <p className="fp-p" style={{ marginTop: 10 }}>
                تتراوح مدة الإنذار المتفق عليها أصلاً في عقد العمل بين 30 و90 يوماً وفقاً للمادة (43). ويجوز للطرفين الاتفاق على الإعفاء من شرط الإنذار أو تخفيض مدته، مع الحفاظ على كامل حقوق العامل عن فترة الإنذار المتفق عليها في العقد.
              </p>
            </div>

            <div>
              <h3 className="fp-h3">كيف يُحسب آخر يوم عمل؟</h3>
              <p className="fp-p">يُحسب آخر يوم عمل المتوقع بإضافة عدد أيام مهلة الإنذار المتفق عليها إلى تاريخ تسليم الإخطار الخطي:</p>
              <div className="fp-quick" style={{ marginTop: 10 }}>
                <p>تاريخ بدء سريان الإنذار + مدة الإنذار التعاقدية = آخر يوم عمل المتوقع</p>
              </div>
              <p className="fp-fn">
                تنبيه المادة (35): إذا قُدم إشعار الإنهاء أثناء إجازة العامل، فلا تبدأ المهلة المتفق عليها إلا في اليوم التالي لموعد عودة العامل المجدول، ما لم يتفق الطرفان على خلاف ذلك. لذلك يجب عدم استخدام تاريخ تقديم الإشعار مباشرةً كأول يوم للإنذار في هذه الحالة؛ وتتوقف الحاسبة عن إصدار تقدير آلي لها.
              </p>
            </div>

            <div>
              <h3 className="fp-h3">على أي أجر يُحسب بدل الإنذار؟</h3>
              <p className="fp-p">
                هذا التقدير مخصص للعامل الذي يتقاضى أجراً شهرياً: يُستخدم آخر أجر وفق تعريف المادة (1)، أي الأجر الأساسي مضافاً إليه البدلات النقدية والمزايا العينية المقررة كجزء من الأجر في العقد أو القانون. لا تخلط بينه وبين أساس مكافأة نهاية الخدمة الذي يعتمد على الأجر الأساسي.
              </p>
              <p className="fp-p">
                وفق المادة (67)، الشهر في تطبيق القانون يساوي 30 يوماً؛ لذلك تستخدم الحاسبة قسمة الأجر الشهري على 30. أما الأجر الأسبوعي أو اليومي أو بالساعة أو بالقطعة فيخضع للمادة (43/4) ولا تدعمه هذه النسخة.
              </p>
            </div>

            <div>
              <h3 className="fp-h3">من يدفع بدل الإنذار؟</h3>
              <p className="fp-p">
                تنص المادة (43/3) على أن الطرف الذي لا يلتزم بفترة الإنذار يدفع للطرف الآخر بدل الإنذار، حتى لو لم ينتج عن عدم الالتزام ضرر. تحديد الطرف المسؤول يعتمد على من لم ينفذ المهلة فعلياً، وليس فقط على من بدأ إنهاء العقد.
              </p>
              <div className="fp-tw" style={{ marginTop: 10 }}>
                <table className="fp-t fp-who">
                  <thead>
                    <tr><th>الحالة</th><th>الطرف المخل</th><th>البدل</th></tr>
                  </thead>
                  <tbody>
                    {WHO_PAYS.map(([c, party, dir]) => (
                      <tr key={c}><td>{c}</td><td>{party}</td><td>{dir}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="fp-fn">مجرد كون صاحب العمل أو العامل هو من بدأ إنهاء العقد لا يكفي وحده لتحديد الطرف المخل؛ يجب مراجعة الإخطار والاتفاق والوقائع.</p>
            </div>

            <div>
              <h3 className="fp-h3">ماذا يحدث عند تنفيذ جزء فقط من الإنذار؟</h3>
              <p className="fp-p">
                وفقاً للمادة 43، يكون التعويض مساوياً لأجر العامل عن الجزء المتبقي غير المنفذ فقط، ولا يُلزم الطرف المخل بالتعويض عن كامل مدة الإنذار إذا كان قد نُفذ جزء منها بالفعل.
              </p>
            </div>

            <div>
              <h3 className="fp-h3">أمثلة عملية بالأرقام</h3>
              <div className="fp-exg">
                {EXAMPLES.map((ex) => (
                  <div key={ex.title} className="fp-ex">
                    <b className="t">{ex.title}</b>
                    {ex.note ? <p className="fp-fn" style={{ marginTop: 0 }}>{ex.note}</p> : null}
                    {ex.rows.map(([k, v, f]) => (
                      <div key={k} className="fp-exr">
                        <span>{k}{f ? <> (<bdi dir="ltr">{f}</bdi>)</> : null}</span>
                        <b>{v}</b>
                      </div>
                    ))}
                    <div className="fp-net"><span>النتيجة</span><span>{ex.result}</span></div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="fp-h3">كيفية استخدام الحاسبة</h3>
              <ol className="fp-steps">
                {STEPS.map((s) => (
                  <li key={s}><span>{s}</span></li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 2) الحالات الخاصة */}
        <section className="fp-wrap fp-sec no-print">
          <div className="fp-card">
            <div>
              <h2 className="fp-h2">حالات لا تحسبها هذه الأداة</h2>
              <p className="fp-p" style={{ marginTop: 14 }}>تتوقف الحاسبة عن إصدار رقم آلي في الحالات التالية، لأن لكل منها قواعد مستقلة.</p>
            </div>

            <div>
              <h3 className="fp-h3">هل يمكن إعفاء الطرفين من فترة الإنذار أو تخفيضها؟</h3>
              <p className="fp-p">
                تسمح المادة (43/2) بالاتفاق على الإعفاء من شرط الإنذار أو تخفيض مدته، مع الحفاظ على حقوق العامل عن مدة الإنذار المتفق عليها، وتكون المدة متساوية للطرفين ما لم يكن الاختلاف لصالح العامل. لذلك لا يعني الإعفاء تلقائياً سقوط جميع الحقوق أو أن بدل الإنذار يساوي صفراً. يجب قراءة الاتفاق المكتوب وتحديد ما تم حفظه من حقوق؛ ولهذا لا تصدر الحاسبة رقماً آلياً عند اختيار وجود اتفاق إعفاء أو تخفيض.
              </p>
            </div>

            <div>
              <h3 className="fp-h3">هل تختلف القواعد أثناء فترة التجربة؟</h3>
              <p className="fp-p">نعم. تخضع فترة التجربة لأحكام المادة (9)، ولا تستخدم هذه الحاسبة لحسابها:</p>
              <ul className="fp-ul" style={{ marginTop: 10 }}>
                {PROBATION.map((t) => (
                  <li key={t}><span>{t}</span></li>
                ))}
              </ul>
              <p className="fp-fn">إذا لم يلتزم أي طرف بمتطلبات المادة (9)، فقد يستحق الطرف الآخر تعويضاً يعادل أجر مهلة الإخطار أو الجزء المتبقي منها. هذه الحالة خارج نطاق الحاسبة الحالية.</p>
            </div>

            <div>
              <h3 className="fp-h3">هل تختلف القواعد في DIFC وADGM؟</h3>
              <p className="fp-p">
                نعم. تخضع DIFC وADGM لأطر عمل مستقلة عن قانون العمل الاتحادي، كما قد تخضع بعض الجهات الحكومية لقواعد مختلفة. لذلك لا تصدر الحاسبة نتيجة عند اختيار هذه الجهات أو عدم التأكد من نطاق العمل.
              </p>
            </div>

            <div>
              <h3 className="fp-h3">متى لا تُستخدم حاسبة المادة (43)؟</h3>
              <p className="fp-p">
                تنظم المادتان (44) و(45) حالات مستقلة عن مهلة المادة (43). يجوز لصاحب العمل الفصل دون إنذار في الحالات المحددة حصراً بالمادة (44)، بعد إجراء تحقيق خطي وإصدار قرار فصل مكتوب ومسبب وتسليمه للعامل. كما يجوز للعامل ترك العمل دون إنذار مع الاحتفاظ بحقوقه عند تحقق إحدى حالات المادة (45)، مثل إخلال صاحب العمل بالتزاماته بعد إبلاغ الوزارة وعدم إزالة المخالفة، أو الاعتداء أو التحرش مع مراعاة إجراءات الإبلاغ، أو وجود خطر جسيم لم يُزل، أو تكليفه بعمل مختلف جوهرياً دون موافقته الخطية إلا في حالات الضرورة.
              </p>
              <p className="fp-p">
                لا تقرر هذه الحاسبة ما إذا كانت الوقائع تحقق أياً من تلك الاستثناءات. إذا كان أحد الطرفين يستند إلى المادة (44) أو (45)، أو لم تكن متأكداً، فتوقف عن استخدام التقدير الآلي وراجع النص التشريعي وMOHRE.
              </p>
            </div>

            <div>
              <h3 className="fp-h3">المواد القانونية ذات الصلة</h3>
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
        <section className="fp-wrap fp-sec no-print">
          <div className="fp-card">
            <h2 className="fp-h2">الأسئلة الشائعة حول فترة الإنذار وبدل الإنذار في الإمارات</h2>
            <div className="fp-faq">
              {noticeFaqs.map((item, i) => (
                <div key={i}>
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4) أدوات مرتبطة + المراجعة والمصادر */}
        <section className="fp-wrap fp-sec fp-bot no-print">
          <div className="fp-card">
            <div className="fp-chain">
              <h2>أدوات عمالية مرتبطة في الإمارات</h2>
              <p>حاسبات تقديرية مساعدة لفهم مستحقات العمل في الإمارات — وليست أدوات معتمدة رسمياً من جهة حكومية.</p>
              <div className="fp-g2">
                {RELATED.map((t) => (
                  <Link key={t.href} href={t.href} className="fp-lk">
                    <span className="t">{t.title}{t.tag ? <span className="fp-tag">{t.tag}</span> : null}</span>
                    <p>{t.desc}</p>
                    <span className="go">افتح ←</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="fp-rev">
              <p>
                <strong>آخر مراجعة قانونية:</strong> <time dateTime={LAST_REVIEWED_ISO}>{LAST_REVIEWED}</time>. المرجع: المواد 1 و9 و35 و43 و44 و45 و67 من المرسوم بقانون اتحادي رقم 33 لسنة 2021. المادة (43/4) تميز بين الأجر الشهري والأسبوعي واليومي وبالساعة، وتحدد متوسط الأجر اليومي للعامل بالقطعة؛ الحاسبة الحالية لا تدعم إلا الأجر الشهري. وعند اختلاف النص الإنجليزي عن العربي، يُعتد بالنص العربي وفق المادة (66).
              </p>
              <p style={{ marginTop: 8 }}><strong>المصادر الرسمية:</strong></p>
              <ul className="fp-src">
                {SOURCES.map((s) => (
                  <li key={s.href}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.name}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
