import SalaryCalculator from "../../components/SalaryCalculator";
import Link from "next/link";
import ToolGuideSection from "../../components/ToolGuideSection";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/siteConfig";

export const metadata = {
  title: "حاسبة الراتب الصافي 2026 | ضريبة الدخل والتأمينات لـ 6 دول",
  description:
    "احسب راتبك الصافي بدقة بعد خصم ضرائب الدخل والتأمينات الاجتماعية (GOSI) والبدلات للسعودية والإمارات ومصر وباكستان وبريطانيا وأمريكا.",
  keywords: ["حاسبة الراتب", "صافي الراتب", "ضريبة الدخل", "GOSI", "net salary", "حاسبة الأجر"],
  alternates: {
    canonical: "/salary-calculator",
  },
  openGraph: {
    title: "حاسبة الراتب الصافي 2026 | ضريبة الدخل والتأمينات لـ 6 دول",
    description:
      "احسب راتبك الصافي بعد خصم ضرائب الدخل والتأمينات للسعودية والإمارات ومصر وباكستان وبريطانيا وأمريكا.",
    url: `${SITE_URL}/salary-calculator`,
    type: "website",
    locale: "ar_AR",
    images: [DEFAULT_OG_IMAGE],
  },
};

const guideData = {
  currentPath: "/salary-calculator",
  lastUpdated: "يناير 2026م (محدث بأنظمة التأمينات الاجتماعية والشرائح الضريبية الرسمية)",
  disclaimerNotice: {
    title: "تنبيه حول الاستقطاعات الإلزامية والبدلات المعفاة:",
    text: "تعتمد الحاسبة الشرائح الضريبية المعلنة رسمياً ونسب التأمينات الأساسية. قد تختلف مستحقاتك الصافية الفعلية في مسير الرواتب بسبب وجود اشتراكات تأمين صحي عائلي، أو أقساط قروض بنكية موصولة بالنظام الآلي، أو صناديق ادخار داخلية للشركات، أو بدلات معفاة مشروطة بفواتير نفقات فعلية.",
  },
  aboutTitle: "ما هي حاسبة الراتب الصافي وكيف تستخدمها؟",
  aboutContent: [
    "حاسبة الراتب الصافي (Net Pay Calculator) هي أداة مالية تحسب ما يصل إلى يدك فعلياً من راتبك الإجمالي بعد خصم جميع الاستقطاعات الإلزامية كضريبة الدخل والتأمينات الاجتماعية والتأمين الصحي. تعتمد الحاسبة على أنظمة ضريبية حقيقية من 6 دول مختلفة.",
    "في دول الخليج كالسعودية والإمارات، لا توجد ضريبة دخل شخصية على الرواتب. ويُخصم من راتب الموظف السعودي المشمول بساند 9.75% في نظام التأمينات السابق (9% معاشات + 0.75% ساند). وفي النظام الجديد خلال 2026 تبلغ مساهمة الموظف الإجمالية 10.25% من يناير إلى يونيو (9.5% معاشات + 0.75% ساند)، و10.75% من يوليو إلى ديسمبر (10% معاشات + 0.75% ساند). وتُحسب على الراتب الأساسي وبدل السكن ضمن السقف النظامي، مع اختلاف التطبيق وفق نظام الاشتراك وفئة الموظف.",
    "أما في دول كمصر وباكستان والمملكة المتحدة والولايات المتحدة، فتوجد شرائح ضريبية تصاعدية تعني أن كل جزء إضافي من الراتب يُخضع لنسبة ضريبية أعلى بعد استبعاد حد الإعفاء الشخصي المقرر قانوناً.",
    "تدعم الحاسبة بنود البدلات الشائعة كبدل السكن (الذي يمثل عادة 25% من الأساسي)، وبدل النقل، وبدل الطعام، وتتيح إدخال الخصومات الإضافية لتعطيك قسيمة راتب واقعية دقيقة.",
  ],
  legalSources: [
    {
      country: "المملكة العربية السعودية",
      lawName: "نظام التأمينات الاجتماعية ونظام ساند",
      date: "المرسوم الملكي م/273 (26/12/1445هـ) ونظام ساند م/18 (GOSI)",
      details:
        "يُستقطع 9% لفرع المعاشات في النظام السابق (متدرج حتى 11% في النظام الجديد) + 0.75% لنظام ساند، وتُطبق على الراتب الأساسي + بدل السكن، بحد أقصى 45,000 ريال، دون أي ضريبة دخل شخصية.",
    },
    {
      country: "جمهورية مصر العربية",
      lawName: "قانون الضريبة على الدخل رقم 91 لسنة 2005 وتعديلاته",
      date: "القانون رقم 7 لسنة 2024 وقانون التأمينات 148 لسنة 2019",
      details:
        "تطبيق الشرائح التصاعدية لضريبة كسب العمل بعد استبعاد الإعفاء الشخصي، واستقطاع 11% للتأمينات الاجتماعية لحصة الموظف من الأجر التأميني.",
    },
    {
      country: "دولة الإمارات ودول الخليج",
      lawName: "النظام الضريبي للأفراد والرواتب",
      date: "الهيئة الاتحادية للضرائب (FTA)",
      details:
        "لا تُفرض أي ضريبة دخل شخصية على رواتب وأجور الموظفين والعمال في القطاعين الحكومي والخاص في دولة الإمارات وسائر دول مجلس التعاون.",
    },
    {
      country: "باكستان (FBR)",
      lawName: "Finance Act 2024/2025 - Salary Tax Slabs",
      date: "Federal Board of Revenue (FBR)",
      details:
        "الشرائح الضريبية الرسمية للدخل المكتسب من الرواتب وتحديثات معدلات الاقتطاع الشهري عند المنبع (Withholding Tax).",
    },
  ],
  stepsTitle: "خطوات استخدام حاسبة الراتب:",
  // Numbers removed from titles: ToolGuideSection renders its own numbered tile.
  steps: [
    { title: "اختر الدولة", desc: "حدد الدولة التي تعمل بها لتطبيق نظامها الضريبي والتأميني المعتمد." },
    { title: "أدخل الراتب الأساسي", desc: "أدخل راتبك الأساسي الشهري المنصوص عليه في عقد العمل." },
    { title: "أضف البدلات", desc: "أدخل بدل السكن والنقل والطعام وأي بدلات نقدية أخرى تتقاضاها." },
    { title: "أدخل الخصومات الإضافية", desc: "أضف أي خصومات طوعية أو أقساط قروض داخلية إن وجدت." },
    { title: "اقرأ قسيمة الراتب المفصلة", desc: "شاهد صافي راتبك، وإجمالي الخصومات، والنسبة المئوية المستقطعة." },
  ],
  example: {
    title: "مثال عملي بالأرقام: موظف سعودي في القطاع الخاص (النظام السابق)",
    scenario: "موظف سعودي خاضع لنظام التأمينات السابق ومشمول بساند، براتب أساسي 12,000 ريال + بدل سكن 3,000 ريال + بدل نقل 1,000 ريال (إجمالي الراتب 16,000 ريال):",
    calculation: [
      { label: "الراتب الأساسي", value: "12,000.00 ر.س" },
      { label: "بدل السكن (يخضع للتأمينات)", value: "3,000.00 ر.س" },
      { label: "بدل النقل (لا يخضع للتأمينات)", value: "1,000.00 ر.س" },
      { label: "وعاء التأمينات (أساسي + سكن)", value: "15,000.00 ر.س" },
      { label: "استقطاع التأمينات وساند (9.75% GOSI – النظام السابق)", value: "- 1,462.50 ر.س" },
      { label: "ضريبة الدخل", value: "0.00 ر.س (صفر)" },
    ],
    result: "صافي الراتب المستلم في الحساب البنكي = 16,000 - 1,462.50 = 14,537.50 ريال سعودي شهرياً.",
  },
  testCases: [
    {
      tag: "حالة 1: موظف سعودي في القطاع الخاص (9.75% GOSI – النظام السابق)",
      title: "مهندس سعودي: أساسي 10,000 ريال، سكن 2,500 ريال، نقل 800 ريال",
      scenario: "موظف سعودي خاضع للنظام السابق ومشمول بساند: إجمالي الراتب = 13,300 ر.س. وعاء التأمينات الخاضع للخصم = 10,000 + 2,500 = 12,500 ر.س. بدل النقل معفى من GOSI.",
      steps: [
        { label: "إجمالي الراتب التعاقدي", value: "13,300.00 ر.س" },
        { label: "وعاء التأمينات (أساسي + سكن)", value: "12,500.00 ر.س" },
        { label: "خصم التأمينات وساند GOSI (9.75% – النظام السابق)", value: "1,218.75 ر.س" },
        { label: "ضريبة الدخل في السعودية", value: "0.00 ر.س" },
      ],
      verifiedResult: "الراتب الصافي = 13,300 - 1,218.75 = 12,081.25 ريال سعودي. هذا مثال للنظام السابق مع سريان ساند؛ تختلف النسب وفق النظام وتاريخ الاشتراك.",
    },
    {
      tag: "حالة 2: موظف في مصر مع الضريبة التصاعدية والتأمينات",
      title: "محاسب في القاهرة براتب إجمالي 20,000 جنيه شهرياً",
      scenario: "الراتب الإجمالي 20,000 ج.م شهرياً (240,000 ج.م سنوياً) بعد تطبيق حصة التأمينات وخصم الشريحة المعفاة وضريبة كسب العمل التصاعدية.",
      steps: [
        { label: "الراتب الإجمالي الشهري", value: "20,000.00 ج.م" },
        { label: "حصة الموظف في التأمينات (11%)", value: "تُخصم من الأجر التأميني" },
        { label: "حد الإعفاء الشخصي السنوي", value: "مخصوم بقوة القانون" },
        { label: "ضريبة كسب العمل", value: "تُحسب بالشرائح التصاعدية" },
      ],
      verifiedResult: "تعرض الحاسبة قسيمة الراتب الصافي المفصلة متوافقة مع أحدث جداول مصلحة الضرائب المصرية.",
    },
  ],
  faqs: [
    {
      question: "ما الفرق بين الراتب الإجمالي والراتب الصافي؟",
      answer: "الراتب الإجمالي (Gross Salary) هو المبلغ الكامل المتفق عليه في العقد قبل أي خصومات. الراتب الصافي (Net Pay) هو ما تحصل عليه فعلياً في حسابك البنكي بعد خصم ضريبة الدخل، والتأمينات الاجتماعية، والتأمين الصحي، وأي خصومات أخرى. الفرق بينهما يُسمى 'وعاء الخصومات' أو 'معدل الاستقطاع الإجمالي'.",
    },
    {
      question: "هل يُخصم التأمين الاجتماعي (GOSI) من الموظفين غير السعوديين؟",
      answer: "لا، نظام GOSI لفرع المعاشات في السعودية يُطبق على المواطنين السعوديين ومواطني دول مجلس التعاون. المقيمون الأجانب يخضعون لفرع الأخطار المهنية الذي تسدده المنشأة بالكامل بنسبة 2%، ولا يُستقطع من راتب الموظف الوافد أي خصم لصالح التأمينات.",
    },
    {
      question: "كيف تعمل الشرائح الضريبية التصاعدية؟",
      answer: "الضريبة التصاعدية تعني أن كل 'شريحة' من دخلك تُضرب في نسبة مختلفة. مثلاً: أول مبلغ معفى بالكامل، والشريحة التالية تُضرب في 2.5٪ أو 10٪ فقط، وهكذا. لا يعني زيادة راتبك ودخولك شريحة أعلى أن كامل دخلك يُضرب في النسبة الجديدة — بل فقط الجزء الزائد الواقع ضمن تلك الشريحة.",
    },
    {
      question: "ما هي البدلات التي تخضع لاستقطاع التأمينات بالسعودية؟",
      answer: "بموجب نظام التأمينات الاجتماعية السعودي، يخضع للخصم فقط: الراتب الأساسي + بدل السكن (سواء دُفع نقداً أو عيناً مقدراً بأجر شهرين). أما بدل النقل، وبدل الهاتف، وبدل الخطر، والمكافآت، وساعات العمل الإضافي فلا يُستقطع منها تأمينات.",
    },
  ],
};

// Same three links and the same wording as before; only the text after "—" is split into a desc line.
const focusLinks = [
  {
    href: "/ar/sa/final-settlement-calculator",
    chip: "SA",
    title: "المخالصة النهائية في السعودية",
    desc: "احسب مستحقات نهاية العمل",
    icon: "file",
  },
  {
    href: "/ar/sa/annual-leave-calculator",
    chip: "SA",
    title: "الإجازات السنوية في السعودية",
    desc: "احسب رصيد الإجازات المتبقية",
    icon: "calendar",
  },
  {
    href: "/ar/ae/notice-period-calculator",
    chip: "AE",
    title: "فترة الإنذار في الإمارات",
    desc: "احسب آخر يوم عمل وبدل الإنذار",
    icon: "clock",
  },
];

function TileIcon({ name }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    focusable: "false",
  };
  if (name === "file") {
    return (
      <svg {...common}>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    );
  }
  if (name === "calendar") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

const focusCss = `
.sal-focus{
  --sf-bg:var(--surface,#FFFFFF);
  --sf-ink:var(--ink,var(--text,#0D0D0D));
  --sf-line:var(--line,var(--border,#D4D4CE));
  --sf-signal:var(--signal,var(--orange,#FF5B04));
  max-width:64rem;margin:0 auto;padding:20px 16px;
}
.sal-focus__panel{
  background:var(--sf-bg);color:var(--sf-ink);
  border:1px solid var(--sf-line);border-radius:26px;
  padding:20px;
}
.sal-focus__title{margin:0 0 16px;font-size:1.125rem;line-height:1.5;font-weight:800;color:var(--sf-ink)}
.sal-focus__grid{display:grid;grid-template-columns:1fr;gap:12px}
.sal-focus__card{
  display:flex;align-items:center;gap:14px;min-height:72px;
  padding:14px;border:1px solid var(--sf-line);border-radius:16px;
  background:var(--sf-bg);color:var(--sf-ink);text-decoration:none;
  transition:border-color .15s ease,transform .15s ease;
}
.sal-focus__card:hover{border-color:var(--sf-signal)}
.sal-focus__card:focus-visible{outline:3px solid var(--sf-ink);outline-offset:3px}
.sal-focus__tile{
  flex:0 0 auto;width:48px;height:48px;border-radius:14px;
  display:grid;place-items:center;color:#0D0D0D;
  background:linear-gradient(145deg,#FFA25C 0%,#FF5B04 100%);
  box-shadow:inset 0 1.5px 0 rgba(255,255,255,.55),0 6px 14px -6px rgba(255,91,4,.6);
}
.sal-focus__body{flex:1 1 auto;min-width:0}
.sal-focus__row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.sal-focus__chip{
  display:inline-block;padding:2px 8px;border-radius:999px;
  border:1px solid var(--sf-ink);font-size:.7rem;font-weight:800;
  letter-spacing:.04em;line-height:1.5;color:var(--sf-ink);
}
.sal-focus__name{font-size:.95rem;font-weight:800;line-height:1.5;overflow-wrap:anywhere}
.sal-focus__desc{display:block;margin-top:2px;font-size:.85rem;line-height:1.6;opacity:.75;overflow-wrap:anywhere}
.sal-focus__arrow{flex:0 0 auto;color:var(--sf-ink);transform:scaleX(-1)}
@media (min-width:640px){
  .sal-focus__panel{padding:24px}
  .sal-focus__grid{grid-template-columns:repeat(3,1fr)}
  .sal-focus__card{flex-direction:column;align-items:flex-start;min-height:0;padding:18px;gap:12px}
  .sal-focus__arrow{display:none}
}
@media (prefers-reduced-motion:reduce){
  .sal-focus__card{transition:none}
}
@media print{
  .sal-focus{display:none}
}
`;

export default function SalaryCalculatorPage() {
  return (
    <div className="py-6 sm:py-10">
      <style>{focusCss}</style>
      <SalaryCalculator
        pageTitle="حاسبة الراتب الصافي — متعددة الدول"
        pageBadge="حاسبة الراتب الصافي"
        pageDesc="احسب راتبك الصافي بعد الضرائب والتأمينات الاجتماعية والبدلات — يدعم السعودية والإمارات ومصر وباكستان وبريطانيا وأمريكا."
      />
      {/* Focus-15: next steps for salary users; preserve the shared global related-tools list. */}
      <nav aria-labelledby="salary-focus-links" className="sal-focus" dir="rtl">
        <div className="sal-focus__panel">
          <h2 id="salary-focus-links" className="sal-focus__title">
            بعد حساب الراتب: أدوات مستحقات الموظف ذات الصلة
          </h2>
          <div className="sal-focus__grid">
            {focusLinks.map((item) => (
              <Link key={item.href} href={item.href} className="sal-focus__card">
                <span className="sal-focus__tile">
                  <TileIcon name={item.icon} />
                </span>
                <span className="sal-focus__body">
                  <span className="sal-focus__row">
                    <span className="sal-focus__chip">{item.chip}</span>
                    <span className="sal-focus__name">{item.title}</span>
                  </span>
                  <span className="sal-focus__desc">{item.desc}</span>
                </span>
                <svg
                  className="sal-focus__arrow"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <ToolGuideSection {...guideData} />
    </div>
  );
}