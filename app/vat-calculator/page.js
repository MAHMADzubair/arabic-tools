/**
 * app/vat-calculator/page.jsx  (server component, no "use client")
 * Qemlo style: metadata, guideData, VatCalculator props, GeoSummary props and
 * all copy are unchanged, except:
 *  - FAQ 2 (Saudi exempt / zero-rated supplies) rewritten to separate exempt
 *    from zero-rated and to mention RETT on residential sales.
 *  - GeoSummary lastReviewed updated to "نوفمبر 2026".
 * Changes: the two quick-link chips and the country-guides section are
 * restyled (Tailwind slate/orange/white utilities replaced by local tokens so
 * dark mode works), flag emoji replaced by country-code chips, "←" glyphs
 * replaced by SVG arrows, both link groups use next/link, 48px tap targets.
 */
import VatCalculator from "@/components/VatCalculator";
import ToolGuideSection from "@/components/ToolGuideSection";
import GeoSummary from "@/components/business/GeoSummary";
import Link from "next/link";

export const metadata = {
  title: "حاسبة ضريبة القيمة المضافة | السعودية 15% والإمارات 5%",
  description:
    "احسب ضريبة القيمة المضافة VAT للسعودية 15% والإمارات 5% مع خيارات لدول عربية أخرى. أضف الضريبة إلى السعر أو استخرج قيمتها من الإجمالي الشامل فوراً.",
  alternates: {
    canonical: "/vat-calculator",
  },
};

const guideData = {
  currentPath: "/vat-calculator",
  aboutTitle: "دليل ضريبة القيمة المضافة (VAT) وطرق احتسابها وإضافتها واستخراجها",
  aboutContent: [
    "ضريبة القيمة المضافة (Value Added Tax أو اختصاراً VAT) هي ضريبة استهلاك غير مباشرة تُفرض على معظم توريدات السلع والخدمات في كل مرحلة من مراحل سلسلة التوريد، بدءاً من الإنتاج والتصنيع ووصولاً إلى بيع السلعة النهائية للمستهلك. ويتحمل المستهلك النهائي التكلفة الفعلية للضريبة، بينما تقوم الشركات والمنشآت المسجلة بتحصيلها وتوريدها للهيئات الضريبية الحكومية.",
    "تختلف النسبة الأساسية لضريبة القيمة المضافة بين الدول العربية؛ ففي المملكة العربية السعودية، تم رفع النسبة الأساسية إلى 15% اعتباراً من يوليو 2020 تحت إشراف هيئة الزكاة والضريبة والجمارك (ZATCA)، بينما تطبق دولة الإمارات العربية المتحدة وسلطنة عمان نسبة 5%، ومملكة البحرين 10%، وجمهورية مصر العربية 14%، والمملكة الأردنية الهاشمية 16%.",
    "تعتمد طريقة الحساب الرياضية على وضع الفاتورة: إذا كان السعر معلناً بدون ضريبة وترغب في إضافة الضريبة، فإن المعادلة هي: (مبلغ الضريبة = السعر الأصلي × نسبة الضريبة)، ويكون الإجمالي شامل الضريبة هو: (السعر الأصلي + مبلغ الضريبة) أو اختصاراً (السعر الأصلي × 1.15 في حالة نسبة 15%).",
    "أما إذا كان السعر الإجمالي شاملاً الضريبة بالفعل وترغب في استخراج أصل السعر وقيمة الضريبة المضمنة فيه، فإن المعادلة الصحيحة هي: (السعر قبل الضريبة = السعر الإجمالي ÷ (1 + نسبة الضريبة)). ففي السعودية مثلاً: يُقسم المبلغ الإجمالي على 1.15، ثم تُطرح النتيجة من الإجمالي للحصول على مبلغ الضريبة المستقطع.",
  ],
  stepsTitle: "كيفية استخدام حاسبة ضريبة القيمة المضافة خطوة بخطوة:",
  steps: [
    {
      title: "تحديد وضع الحساب",
      desc: "اختر 'إضافة الضريبة' إذا كان السعر لديك لا يشمل الضريبة، أو اختر 'استخراج الضريبة' إذا كان السعر النهائي مع الضريبة وتريد معرفة أصل السعر.",
    },
    {
      title: "إدخال المبلغ المالي",
      desc: "اكتب المبلغ المراد حسابه في خانة الإدخال، واختر العملة التقديرية (مثل الريال السعودي أو الدرهم الإماراتي أو الجنيه).",
    },
    {
      title: "اختيار نسبة الضريبة أو الدولة",
      desc: "انقر على زر الدولة السريع (السعودية 15%، الإمارات 5%، مصر 14%...) أو حدد أي نسبة مخصصة تناسب نشاطك.",
    },
    {
      title: "معاينة الفاتورة ونسخ التقرير",
      desc: "ستظهر لك فوراً تفاصيل الفاتورة: السعر قبل الضريبة، قيمة الضريبة الصافية، والإجمالي النهائي، مع إمكانية نسخ التقرير بضغطة زر.",
    },
  ],
  example: {
    title: "مثال تطبيقي عملي بالأرقام (إضافة واستخراج الضريبة 15%):",
    scenario:
      "اشترى عميل جهازاً إلكترونياً بسعر 2,000 ريال سعودي غير شامل الضريبة، واشترى منتجاً آخر من متجر بسعر 1,150 ريال سعودي شامل الضريبة، ويريد معرفة الحسابين بدقة:",
    calculation: [
      { label: "الحالة الأولى (إضافة 15% على 2,000 ريال)", value: "2,000 × 0.15 = 300 ريال ضريبة" },
      { label: "إجمالي الحالة الأولى شامل الضريبة", value: "2,000 + 300 = 2,300.00 ريال سعودي" },
      { label: "الحالة الثانية (استخراج أصل سعر 1,150 ريال الشامل)", value: "1,150 ÷ 1.15 = 1,000.00 ريال (أصل السعر)" },
      { label: "قيمة الضريبة المضمنة في الحالة الثانية", value: "1,150 - 1,000 = 150.00 ريال سعودي ضريبة" },
    ],
    result:
      "في الشراء الأول يدفع العميل 2,300 ريال (منها 300 ريال ضريبة)، وفي الشراء الثاني كان أصل السعر 1,000 ريال والضريبة المسددة 150 ريالاً.",
  },
  faqs: [
    {
      question: "كيف أستخرج السعر قبل الضريبة من مبلغ شامل الضريبة 15%؟",
      answer:
        "لاستخراج السعر قبل الضريبة من مبلغ شامل الضريبة بنسبة 15%، قسّم المبلغ الإجمالي على 1.15. الناتج هو السعر الأصلي قبل الضريبة. والفرق بين المبلغ الإجمالي والسعر الأصلي هو قيمة ضريبة القيمة المضافة.",
    },
    {
      question: "ما هي السلع والخدمات المعفاة أو الخاضعة لنسبة الصفر من ضريبة القيمة المضافة في السعودية؟",
      answer:
        "التوريدات الخاضعة لنسبة الصفر تشمل: الصادرات إلى خارج دول مجلس التعاون، والنقل الدولي، والأدوية والمعدات الطبية المؤهلة المعتمدة من هيئة الغذاء والدواء، والتعليم الأهلي المؤهل والرعاية الصحية الخاصة المقدمة للمواطنين السعوديين وفق ضوابط الهيئة (تتحمل الدولة الضريبة عنهم). أما التوريدات المعفاة فتشمل: تأجير العقارات السكنية، وبعض الخدمات المالية المحددة مثل الحسابات الجارية وعقود التأمين على الحياة. وتجدر الإشارة إلى أن بيع العقار السكني لا يخضع لضريبة القيمة المضافة، لكنه يخضع لضريبة التصرفات العقارية بنسبة 5%.",
    },
    {
      question: "متى تكون المنشأة ملزمة بالتسجيل في ضريبة القيمة المضافة؟",
      answer:
        "في السعودية، يكون التسجيل إلزامياً لأي منشأة تتجاوز إيراداتها السنوية الخاضعة للضريبة 375,000 ريال سعودي. ويكون التسجيل اختيارياً إذا تراوحت الإيرادات السنوية بين 187,500 ريال و 375,000 ريال، بينما تُعفى المنشآت التي تقل إيراداتها عن 187,500 ريال.",
    },
    {
      question: "ما الفرق بين التوريدات المعفاة والتوريدات الخاضعة لنسبة الصفر (0%)؟",
      answer:
        "التوريدات الخاضعة لنسبة الصفر تتيح للمنشأة استرداد ضريبة المدخلات التي دفعتها على مشترياتها، بينما التوريدات المعفاة تماماً لا تفرض ضريبة على العميل ولكنها في الوقت نفسه لا تسمح للمنشأة بخصم أو استرداد ضريبة المدخلات الخاصة بها.",
    },
    {
      question: "هل تطبق ضريبة القيمة المضافة على التجارة الإلكترونية والشراء من الخارج؟",
      answer:
        "نعم، تطبق ضريبة القيمة المضافة على مشتريات التجارة الإلكترونية والسلع المستوردة من خارج البلاد عند وصولها عبر الجمارك أو عبر المتاجر العالمية المسجلة في النظام الضريبي المحلي، وتُحصّل بنفس النسبة المعتمدة (15% في السعودية).",
    },
  ],
};

// Country links used by both the quick chips and the guides section.
const COUNTRY_GUIDES = [
  {
    href: "/vat-calculator/saudi",
    code: "SA",
    rate: "15%",
    chip: "حاسبة ضريبة القيمة المضافة السعودية 15%",
    title: "حاسبة ضريبة القيمة المضافة السعودية 15%",
    desc: "احسب الضريبة بالريال السعودي: سعر 100 ريال قبل الضريبة يصبح 115 ريالاً عند إضافة 15%.",
    cta: "افتح حاسبة الضريبة السعودية",
  },
  {
    href: "/vat-calculator/uae",
    code: "AE",
    rate: "5%",
    chip: "حاسبة ضريبة القيمة المضافة الإمارات 5%",
    title: "حاسبة ضريبة القيمة المضافة الإمارات 5%",
    desc: "احسب الضريبة بالدرهم الإماراتي: سعر 100 درهم قبل الضريبة يصبح 105 دراهم عند إضافة 5%.",
    cta: "افتح حاسبة الضريبة الإماراتية",
  },
];

function Arrow({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M19 12H5m6-6-6 6 6 6" />
    </svg>
  );
}

function PercentIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M19 5 5 19" />
      <circle cx="7.5" cy="7.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  );
}

const CSS = `
.vp{
  --k-bg:var(--bg,#F5F5F2);
  --k-sf:var(--surface,#FFFFFF);
  --k-ink:var(--ink,var(--text,#0D0D0D));
  --k-mu:var(--ink-soft,var(--text-3,#4A4A46));
  --k-ln:var(--line,var(--border,#D9D9D3));
  --k-on-ink:var(--on-ink,#FFFFFF);
  --k-g1:#FF9B63; --k-g2:var(--signal,var(--orange,#FF6A1A)); --k-g3:#EE5A0B;
  --k-gloss:linear-gradient(160deg,var(--k-g1) 0%,var(--k-g2) 55%,var(--k-g3) 100%);
  color:var(--k-ink);
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]) .vp{
    --k-bg:var(--bg,#0D0D0D); --k-sf:var(--surface,#181816); --k-ink:var(--ink,var(--text,#F5F5F2));
    --k-mu:var(--ink-soft,var(--text-3,#B4B4AD)); --k-ln:var(--line,var(--border,#34342F)); --k-on-ink:var(--on-ink,#0D0D0D);
  }
}
:root[data-theme="dark"] .vp{
  --k-bg:var(--bg,#0D0D0D); --k-sf:var(--surface,#181816); --k-ink:var(--ink,var(--text,#F5F5F2));
  --k-mu:var(--ink-soft,var(--text-3,#B4B4AD)); --k-ln:var(--line,var(--border,#34342F)); --k-on-ink:var(--on-ink,#0D0D0D);
}
.vp *,.vp *::before,.vp *::after{box-sizing:border-box}
.vp :focus-visible{outline:3px solid var(--k-ink);outline-offset:2px}

.vp-code{
  display:inline-block;padding:.12rem .5rem;font-size:.72rem;font-weight:800;letter-spacing:.04em;
  color:var(--k-on-ink);background:var(--k-ink);border-radius:8px;
}

/* quick chips under the calculator */
.vp-chips{
  display:flex;flex-wrap:wrap;justify-content:center;gap:.6rem;
  max-width:42rem;margin:1rem auto 0;padding-inline:1rem;
}
.vp-chip{
  display:inline-flex;align-items:center;gap:.55rem;min-height:48px;padding:.5rem .9rem;
  font-size:.85rem;font-weight:700;line-height:1.5;text-align:start;text-decoration:none;
  color:var(--k-ink);background:var(--k-sf);border:2px solid var(--k-ln);border-radius:16px;
  transition:border-color .15s;
}
.vp-chip:hover{border-color:var(--k-ink)}
.vp-chip svg{flex:none}
@media (max-width:520px){.vp-chip{width:100%}}

/* country guides */
.vp-guides{max-width:64rem;margin:0 auto;padding:1.5rem 1rem}
@media (min-width:640px){.vp-guides{padding-inline:1.5rem}}
.vp-panel{
  display:grid;gap:1.25rem;padding:1.1rem;background:var(--k-sf);
  border:1px solid var(--k-ln);border-radius:26px;
}
@media (min-width:640px){.vp-panel{padding:1.75rem}}
.vp-head{display:flex;align-items:flex-start;gap:.85rem}
.vp-head-text{min-width:0}
.vp-tile{
  flex:none;display:inline-grid;place-items:center;width:46px;height:46px;color:#0D0D0D;
  background:var(--k-gloss);border-radius:15px;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -2px 0 rgba(0,0,0,.12),0 4px 10px -4px rgba(238,90,11,.55);
}
.vp-h2{margin:0;font-size:clamp(1.15rem,4.2vw,1.5rem);font-weight:800;line-height:1.5;overflow-wrap:anywhere}
.vp-lead{margin:.4rem 0 0;font-size:.92rem;line-height:1.9;color:var(--k-mu);overflow-wrap:anywhere}
.vp-grid{display:grid;gap:.75rem;grid-template-columns:minmax(0,1fr)}
@media (min-width:640px){.vp-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}}
.vp-card{
  position:relative;display:grid;gap:.6rem;align-content:start;padding:1.1rem;
  color:var(--k-ink);text-decoration:none;background:var(--k-bg);
  border:2px solid var(--k-ln);border-radius:22px;transition:border-color .15s;
}
.vp-card:hover{border-color:var(--k-ink)}
.vp-card-top{display:flex;align-items:center;justify-content:space-between;gap:.75rem}
.vp-rate{
  display:inline-grid;place-items:center;min-width:3.4rem;padding:.3rem .7rem;font-size:1.05rem;font-weight:800;
  direction:ltr;unicode-bidi:isolate;color:#0D0D0D;background:var(--k-gloss);border-radius:12px;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -2px 0 rgba(0,0,0,.12);
}
.vp-card h3{margin:0;font-size:1rem;font-weight:800;line-height:1.6;overflow-wrap:anywhere}
.vp-card p{margin:0;font-size:.88rem;line-height:1.85;color:var(--k-mu);overflow-wrap:anywhere}
.vp-cta{
  display:inline-flex;align-items:center;gap:.4rem;margin-top:.25rem;padding-top:.7rem;
  border-top:1px dashed var(--k-ln);font-size:.88rem;font-weight:800;
}
@media (prefers-reduced-motion:reduce){.vp *{transition:none!important}}
@media print{.vp-chips,.vp-guides{display:none!important}}
`;

export default function VatCalculatorPage() {
  return (
    <div className="py-6 sm:py-10 vp">
      <style>{CSS}</style>

      {/* 1. Calculator on top */}
      <VatCalculator
        pageTitle="حاسبة ضريبة القيمة المضافة — متعددة الدول"
        pageBadge="أداة حساب VAT للدول العربية"
        pageDesc="أضف ضريبة القيمة المضافة إلى السعر أو استخرجها من السعر الشامل — يدعم السعودية (١٥٪)، الإمارات (٥٪)، البحرين (١٠٪)، مصر (١٤٪)، الأردن (١٦٪)."
      />

      <div className="vp-chips">
        {COUNTRY_GUIDES.map((c) => (
          <Link key={c.href} href={c.href} className="vp-chip">
            <span className="vp-code" aria-hidden="true">{c.code}</span>
            <span>{c.chip}</span>
            <Arrow size={16} />
          </Link>
        ))}
      </div>

      {/* GEO / Answer-engine summary */}
      <GeoSummary
        whatItDoes="تحسب ضريبة القيمة المضافة وتستخرجها لأي دولة عربية — السعودية 15%، الإمارات وعُمان 5%، البحرين 10%، مصر 14%، الأردن 16%"
        appliesTo="دول مجلس التعاون الخليجي ومصر والأردن"
        keyRule="المعادلة: السعر × النسبة للإضافة — أو الإجمالي ÷ (1 + النسبة) للاستخراج"
        authority="هيئات الضرائب الوطنية في كل دولة"
        lastReviewed="نوفمبر 2026"
        disclaimer="هذه الأداة استرشادية — تحقق مع مستشارك الضريبي أو الهيئة المختصة في بلدك لأي التزام رسمي."
      />

      {/* Country-specific search intent: visible, crawlable links to existing canonical VAT pages. */}
      <section aria-labelledby="vat-country-guides-heading" className="vp-guides" dir="rtl">
        <div className="vp-panel">
          <div className="vp-head">
            <span className="vp-tile"><PercentIcon /></span>
            <div className="vp-head-text">
              <h2 id="vat-country-guides-heading" className="vp-h2">
                حاسبة الضريبة 15% في السعودية وحاسبة VAT بنسبة 5% في الإمارات
              </h2>
              <p className="vp-lead">
                إذا كنت تريد حساب ضريبة القيمة المضافة لدولة محددة، اختر الحاسبة المخصصة أدناه.
                كل أداة تساعدك على إضافة الضريبة إلى السعر أو استخراجها من مبلغ شامل الضريبة.
              </p>
            </div>
          </div>
          <nav aria-label="حاسبات ضريبة القيمة المضافة حسب الدولة" className="vp-grid">
            {COUNTRY_GUIDES.map((c) => (
              <Link key={c.href} href={c.href} className="vp-card">
                <div className="vp-card-top">
                  <span className="vp-code" aria-hidden="true">{c.code}</span>
                  <span className="vp-rate" aria-hidden="true">{c.rate}</span>
                </div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
                <span className="vp-cta">
                  <span>{c.cta}</span>
                  <Arrow />
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* 2. Standardized Guide, FAQs, and Related Tools */}
      <ToolGuideSection {...guideData} />
    </div>
  );
}