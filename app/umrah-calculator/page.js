import UmrahCalculator from "@/components/UmrahCalculator";
import Link from "next/link";
import GeoAnswerSummary from "@/components/GeoAnswerSummary";
import { SITE_URL, SITE_ORG_ID, DEFAULT_OG_IMAGE } from "@/lib/siteConfig";

// حدّث هذا التاريخ فقط بعد مراجعة فعلية للأسعار وأسعار الصرف داخل الأداة
const LAST_REVIEWED = "نوفمبر 2026";

const PATH = "/umrah-calculator";
const TITLE = "حاسبة تكلفة العمرة 2026 | الطيران والفندق والتأشيرة";
const DESC =
  "احسب تكلفة العمرة لك ولعائلتك حسب بلد السفر والموسم ونجوم الفندق: الطيران والتأشيرة والإقامة والطعام والنقل مع تفصيل كل بند. مجاني وبدون تسجيل.";

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

// ─── FAQ (مصدر واحد للنص الظاهر وللـ JSON-LD) ──────────────────────────────────
const FAQ = [
  {
    q: "كم تكلفة العمرة؟",
    a: "لا يوجد رقم ثابت، فالتكلفة تتغير بحسب بلد السفر وعدد المسافرين وعدد الأيام والموسم ونجوم الفندق ودرجة الطيران وخطة الوجبات. أدخل هذه الخيارات في الحاسبة لتحصل على تقدير إجمالي وتكلفة للفرد مع تفصيل كل بند.",
  },
  {
    q: "ما العوامل التي تؤثر على تكلفة العمرة؟",
    a: "أهمها الموسم (رمضان وآخر عشر ليالٍ ترفع أسعار الفنادق والطيران بوضوح)، ثم فئة الفندق وعدد الليالي، ثم تذكرة الطيران من بلدك، ثم الطعام والنقل الداخلي والتأشيرة. كما يؤثر عدد المسافرين لأن الفندق يُحسب لكل غرفة وليس لكل شخص.",
  },
  {
    q: "هل تشمل الحاسبة تكلفة التأشيرة؟",
    a: "نعم، يمكنك تضمين تكلفة التأشيرة أو إلغاؤها بمفتاح خاص. تختلف شروط التأشيرة ورسومها بحسب جنسية المسافر وطريقة الحجز، فتحقق منها عبر الجهات الرسمية مثل منصة نسك أو وزارة الحج والعمرة.",
  },
  {
    q: "متى ترتفع أسعار العمرة؟",
    a: "ترتفع غالباً في رمضان وفي آخر عشر ليالٍ منه، وفي مواسم الإجازات. تفترض الحاسبة مضاعفات تقديرية للموسم (مثلاً ×3.5 للفندق في رمضان و×5 في آخر عشر ليالٍ)، وهي افتراضات للتخطيط وليست أسعاراً فعلية.",
  },
  {
    q: "هل الأسعار في الحاسبة دقيقة؟",
    a: "هي تقديرات مبنية على متوسطات وأسعار صرف ثابتة داخل الأداة، وقد تختلف عن أسعار شركات الطيران والفنادق وقت الحجز. استخدمها لوضع ميزانية أولية ثم قارن العروض الفعلية قبل الحجز.",
  },
  {
    q: "هل تتوقف العمرة خلال موسم الحج؟",
    a: "قد تُعلِّق الجهات الرسمية إصدار تصاريح العمرة خلال موسم الحج. تابع إعلانات وزارة الحج والعمرة ومنصة نسك للتأكد من المواعيد المتاحة قبل حجز الرحلة.",
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

// بدون offers وبدون تقييمات: أداة مجانية
const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "حاسبة تكلفة العمرة",
  url: `${SITE_URL}${PATH}`,
  inLanguage: "ar",
  operatingSystem: "All",
  applicationCategory: "TravelApplication",
  isAccessibleForFree: true,
  description: DESC,
  publisher: { "@id": SITE_ORG_ID },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "حاسبة تكلفة العمرة", item: `${SITE_URL}${PATH}` },
  ],
};

// ─── المحتوى ───────────────────────────────────────────────────────────────────
const STEPS = [
  "اختر بلد السفر لتُحدَّد عملة الحساب وأسعار الطيران والتأشيرة والطعام والنقل الافتراضية.",
  "حدّد عدد البالغين والأطفال وعدد الأيام.",
  "اختر الموسم: عادي أو رمضان أو موسم الحج أو آخر عشر ليالٍ.",
  "اختر فئة الفندق (من نجمتين إلى خمس نجوم) وخطة الوجبات ودرجة الطيران.",
  "فعّل أو ألغِ تضمين التأشيرة وأضف أي مشتريات إضافية تتوقعها.",
  "اقرأ الإجمالي وتكلفة الفرد وتفصيل كل بند ونسبته من المجموع.",
];

const METHOD = [
  ["الطيران", "سعر التذكرة الافتراضي لبلدك × مضاعف الموسم × عدد المسافرين (درجة الأعمال ×3.5)."],
  ["الفندق", "سعر الليلة × مضاعف الموسم × عدد الليالي، لغرفة واحدة لكل مسافرَين."],
  ["الطعام", "متوسط الوجبات اليومي × خطة الوجبات (نصف إقامة ×1.5، إقامة كاملة ×2) × الأيام × المسافرين."],
  ["النقل والتأشيرة", "تكلفة النقل اليومية × الأيام × المسافرين، وتكلفة التأشيرة × المسافرين إن فُعِّلت."],
  ["التسوق", "مبلغ افتراضي للبلد يُضاف إليه ما تُدخله من مشتريات إضافية."],
];

// مثال محسوب بقيم الأداة الافتراضية: الإمارات، مسافران بالغان، 10 أيام، موسم عادي، فندق 4 نجوم، بدون وجبات فندقية، اقتصادية
const EXAMPLE = [
  ["الطيران", "1,800 × 2 مسافر", "3,600"],
  ["التأشيرة", "320 × 2 مسافر", "640"],
  ["الفندق", "750 ر.س × 10 ليالٍ = 7,500 ر.س تُحوَّل بسعر صرف الأداة، غرفة واحدة", "7,345"],
  ["الطعام", "300 × 10 أيام × 2 مسافر", "6,000"],
  ["النقل", "120 × 10 أيام × 2 مسافر", "2,400"],
  ["التسوق", "مبلغ افتراضي للبلد", "2,000"],
];
const EXAMPLE_TOTAL = "21,985 د.إ";
const EXAMPLE_PER = "10,993 د.إ";

const RELATED = [
  { href: "/currency-converter", title: "محول العملات", desc: "حوّل ميزانيتك بين العملات قبل الحجز" },
  { href: "/zakat-al-fitr", title: "حاسبة زكاة الفطر", desc: "احسب زكاة الفطر لأفراد أسرتك" },
  { href: "/kaffara-calculator", title: "حاسبة الكفارات والفدية", desc: "احسب الكفارات والفدية وفق نوعها" },
];

const CSS = `
.fp{--bg:var(--c-bg,#F5F5F2);--ink:var(--c-ink,#0D0D0D);--ac:var(--c-accent,#FF5B04);--sf:var(--c-surface,#FFFFFF);--mu:var(--c-muted,#55554F);--ln:var(--c-line,#D9D9D3);background:var(--bg);color:var(--ink);min-height:100vh;font-size:15px;line-height:1.75}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .fp{--bg:var(--c-bg,#0D0D0D);--ink:var(--c-ink,#F5F5F2);--sf:var(--c-surface,#181816);--mu:var(--c-muted,#B4B4AD);--ln:var(--c-line,#34342F)}}
:root[data-theme="dark"] .fp{--bg:var(--c-bg,#0D0D0D);--ink:var(--c-ink,#F5F5F2);--sf:var(--c-surface,#181816);--mu:var(--c-muted,#B4B4AD);--ln:var(--c-line,#34342F)}
.fp *{box-sizing:border-box}
.fp h2,.fp h3,.fp p,.fp ol,.fp ul{margin:0;padding:0}
.fp-wrap{max-width:48rem;margin:0 auto;padding-inline:16px}
.fp a{color:inherit}
.fp a:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
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
.fp-steps li::before{content:counter(s);flex:none;width:28px;height:28px;display:grid;place-items:center;border-radius:10px;color:#0D0D0D;background:linear-gradient(160deg,#FF8A3D,#FF5B04 55%,#E64F00);font-weight:800;font-size:13px}
.fp-list{list-style:none;display:flex;flex-direction:column;gap:10px}
.fp-list li{display:grid;gap:2px;border:1px solid var(--ln);border-radius:16px;padding:12px 14px;font-size:14px}
.fp-list b{font-weight:800}
.fp-list span{font-size:13px;color:var(--mu)}
.fp-ex{border:1px solid var(--ln);border-radius:20px;background:var(--bg);padding:20px}
.fp-exr{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--ln);font-size:14px}
.fp-exr small{display:block;font-size:12px;color:var(--mu)}
.fp-exr b{white-space:nowrap;direction:ltr;unicode-bidi:isolate}
.fp-net{display:flex;justify-content:space-between;gap:12px;margin-top:12px;padding:12px 16px;border-radius:16px;background:linear-gradient(160deg,#FF8A3D,#FF5B04 55%,#E64F00);color:#0D0D0D;font-weight:800;font-size:16px}
.fp-net span:last-child{direction:ltr;unicode-bidi:isolate}
.fp-fn{margin-top:12px;font-size:12px;color:var(--mu)}
.fp-note{border:1px solid var(--ln);border-radius:18px;background:var(--bg);padding:16px 18px;font-size:13.5px}
.fp-faq>div{padding:18px 0;border-bottom:1px solid var(--ln)}
.fp-faq>div:first-child{padding-top:0}
.fp-faq>div:last-child{border-bottom:0;padding-bottom:0}
.fp-faq h3{font-size:15px;font-weight:800;margin-bottom:6px}
.fp-faq p{font-size:14px}
.fp-g3{display:grid;gap:12px;grid-template-columns:1fr}
@media(min-width:640px){.fp-g3{grid-template-columns:repeat(3,1fr)}}
.fp-lk{display:flex;flex-direction:column;gap:6px;text-decoration:none;background:var(--sf);border:1px solid var(--ln);border-inline-start:6px solid var(--ac);border-radius:16px;padding:14px 16px;min-height:44px}
.fp-lk:hover{background:var(--ink);color:var(--bg)}
.fp-lk:hover p{color:var(--bg)}
.fp-lk h3{font-size:14px;font-weight:800;margin:0}
.fp-lk p{font-size:12px;color:var(--mu)}
.fp-rev{border:1px dashed var(--ln);border-radius:16px;padding:14px 16px;font-size:12px}
.fp-rev a{font-weight:800;text-decoration:underline;text-underline-offset:3px}
.fp-bot{padding-bottom:48px}
@media print{.fp-crumb{display:none}}
`;

export default function UmrahCalculatorPage() {
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
            <li aria-current="page">حاسبة تكلفة العمرة</li>
          </ol>
        </nav>

        {/* الحاسبة (المكوّن يحتوي على H1 واحد: «حاسبة تكلفة العمرة») */}
        <UmrahCalculator />

        <GeoAnswerSummary
          whatItDoes="تقدير ميزانية رحلة العمرة: الطيران والتأشيرة والفندق والطعام والنقل والتسوق، مع إجمالي وتكلفة للفرد وتفصيل نسبة كل بند"
          appliesTo="المسافرون للعمرة من باكستان ومصر والسعودية والإمارات وبريطانيا وأمريكا وماليزيا وبنغلاديش"
          keyRule="الموسم (رمضان وآخر عشر ليالٍ) وفئة الفندق وعدد المسافرين هي أكبر ما يغيّر التكلفة"
          authority="وزارة الحج والعمرة (السعودية)"
          authorityUrl="https://www.haj.gov.sa"
          lastReviewed={LAST_REVIEWED}
          disclaimer="تقديرات استرشادية مبنية على افتراضات الأداة وأسعار صرف ثابتة وليست عرض سعر من أي مزود."
        />

        <section className="fp-wrap fp-sec">
          <div className="fp-card">
            <h2 className="fp-h2">كيف تحسب تكلفة العمرة؟</h2>

            <div>
              <p className="fp-p">
                <strong>حاسبة تكلفة العمرة</strong> أداة مجانية تقدّر ميزانية رحلتك حسب بلد السفر وعدد المسافرين وعدد الأيام والموسم ونجوم الفندق ودرجة الطيران وخطة الوجبات، وتعرض تفصيل الطيران والتأشيرة والإقامة والطعام والنقل والتسوق مع نسبة كل بند وتكلفة الفرد. الأرقام تقديرية مبنية على افتراضات الأداة وليست عرض سعر من أي مزود خدمة.
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

            <div>
              <h3 className="fp-h3">كيف تُحسب كل فئة؟</h3>
              <ul className="fp-list">
                {METHOD.map(([k, v]) => (
                  <li key={k}><b>{k}</b><span>{v}</span></li>
                ))}
              </ul>
            </div>

            <div className="fp-ex">
              <h3 className="fp-h3">مثال محسوب</h3>
              <p className="fp-p" style={{ marginBottom: 12 }}>
                <strong>الحالة:</strong> مسافران بالغان من الإمارات، 10 أيام في الموسم العادي، فندق 4 نجوم، طيران اقتصادي، بدون وجبات فندقية، مع التأشيرة (بالدرهم).
              </p>
              <div>
                {EXAMPLE.map(([label, formula, amount]) => (
                  <div key={label} className="fp-exr">
                    <span><b>{label}</b><small>{formula}</small></span>
                    <b>{amount}</b>
                  </div>
                ))}
              </div>
              <div className="fp-net"><span>الإجمالي</span><span>{EXAMPLE_TOTAL}</span></div>
              <p className="fp-fn">
                تكلفة الفرد نحو {EXAMPLE_PER}. المثال بالقيم الافتراضية الحالية للأداة وهو توضيحي، وقد تختلف الأسعار الفعلية عنه.
              </p>
            </div>

            <div className="fp-note">
              <strong>ملاحظات مهمة:</strong> تُحسب الأطفال بنفس تكلفة البالغين للطيران والتأشيرة والطعام، وقد تتوفر خصومات لدى شركات الطيران. وتُعلَّق تصاريح العمرة أحياناً خلال موسم الحج، فتحقق من المواعيد قبل الحجز.
            </div>
          </div>
        </section>

        <section className="fp-wrap fp-sec">
          <div className="fp-card">
            <h2 className="fp-h2">الأسئلة الشائعة حول تكلفة العمرة</h2>
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

        <section className="fp-wrap fp-sec fp-bot">
          <div className="fp-card">
            <div>
              <h2 className="fp-h3" style={{ fontSize: 18 }}>أدوات إسلامية ومالية ذات صلة</h2>
              <div className="fp-g3" style={{ marginTop: 12 }}>
                {RELATED.map((t) => (
                  <Link key={t.href} href={t.href} className="fp-lk">
                    <h3>{t.title}</h3>
                    <p>{t.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="fp-rev">
              <p>
                <strong>آخر تحديث للمحتوى:</strong> {LAST_REVIEWED}. للتأكد من شروط العمرة والتأشيرة ومواعيد التصاريح راجع الجهات الرسمية، مثل{" "}
                <a href="https://www.haj.gov.sa" target="_blank" rel="noopener noreferrer">وزارة الحج والعمرة</a>{" "}
                ومنصة{" "}
                <a href="https://nusuk.sa" target="_blank" rel="noopener noreferrer">نسك</a>. الحاسبة استرشادية وليست عرض سعر.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}