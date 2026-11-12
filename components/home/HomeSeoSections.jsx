/**
 * HomeSeoSections.jsx
 *
 * Server component — rendered to static HTML on every request.
 * Contains: answer-first intro paragraph, link groups (Saudi tools, UAE tools,
 * Islamic tools), official sources block, FAQ accordion (CSS-only, no JS),
 * and FAQPage JSON-LD.
 *
 * Organisation + WebSite JSON-LD are NOT here — they live in app/layout.js.
 */

import Link from "next/link";
import { SITE_URL, SITE_ORG_ID } from "@/lib/siteConfig";
import { HOME_LOWER_CSS } from "@/components/home/homeLowerStyles";

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "ما هو Qemlo وماذا يقدّم؟",
    a: "Qemlo منصة أدوات وحاسبات عربية مجانية تخدم موظفي وأصحاب الأعمال في السعودية والإمارات وسائر دول الخليج. تشمل المكتبة الحالية أكثر من 36 أداة: حاسبات الرواتب ومكافأة نهاية الخدمة والمخالصة النهائية وفترة الإنذار وضريبة الشركات والقيمة المضافة وأوامر الشراء وفواتير ضريبية، فضلاً عن أدوات إسلامية كالميراث والزكاة والكفارات وتكلفة العمرة. جميع الأدوات تعمل داخل المتصفح وبدون تسجيل.",
  },
  {
    q: "كيف أحسب مكافأة نهاية الخدمة في السعودية؟",
    a: "في المملكة العربية السعودية تُحسب المكافأة وفق المواد (84 و85 و87) من نظام العمل: نصف أجر شهري عن كل سنة من السنوات الخمس الأولى، وأجر شهر كامل عن كل سنة بعدها. في حالة الاستقالة قبل اكتمال سنتين لا يُستحق شيء؛ ومن سنتين إلى خمس سنوات يُستحق ثلث المكافأة، ومن خمس إلى عشر سنوات ثلثان، وبعد عشر سنوات المكافأة كاملة. استخدم حاسبة المخالصة النهائية للسعودية للحصول على التفاصيل الكاملة.",
  },
  {
    q: "كيف أحسب مكافأة نهاية الخدمة في الإمارات؟",
    a: "وفق المادة (51) من قانون العمل الاتحادي رقم 33 لسنة 2021، تُحسب المكافأة على الراتب الأساسي بواقع أجر 21 يوماً عن كل سنة من السنوات الخمس الأولى، وأجر 30 يوماً عن كل سنة تالية. لا يُطبَّق أي خصم للاستقالة في ظل القانون الجديد. يُمكنك حساب المبلغ الكامل بما يشمل بدل الإجازة والإنذار عبر حاسبة المخالصة النهائية للإمارات.",
  },
  {
    q: "هل تعمل الأدوات على الجوال؟",
    a: "نعم، جميع أدوات Qemlo مصممة للعمل بشكل كامل على الجوال والتابلت والحاسوب دون الحاجة إلى تطبيق منفصل أو تسجيل دخول. تُجرى جميع الحسابات محلياً داخل المتصفح لحماية سرية بياناتك.",
  },
  {
    q: "هل الأدوات مجانية بالكامل؟",
    a: "نعم، جميع أدوات Qemlo مجانية تماماً وبلا حدود استخدام. لا يوجد اشتراك مدفوع ولا قيود على عدد الحسابات.",
  },
];

// ─── Link groups ───────────────────────────────────────────────────────────────
// `label` is the visible anchor text; `note` is a muted qualifier shown after it.
const SA_LINKS = [
  { href: "/ar/sa/final-settlement-calculator", label: "حاسبة المخالصة النهائية" },
  { href: "/salary-calculator/saudi",           label: "حاسبة الراتب الصافي", note: "GOSI وساند" },
  { href: "/ar/sa/annual-leave-calculator",     label: "حاسبة بدل الإجازات السنوية" },
  { href: "/overtime-calculator/saudi",         label: "حاسبة العمل الإضافي", note: "المادة 107" },
  { href: "/vat-calculator/saudi",              label: "حاسبة ضريبة القيمة المضافة", note: "15%" },
  { href: "/ar/sa/article-77-calculator",       label: "حاسبة المادة 77", note: "الفصل التعسفي" },
];

const AE_LINKS = [
  { href: "/ar/ae/final-settlement-calculator", label: "حاسبة المخالصة النهائية" },
  { href: "/ar/ae/notice-period-calculator",    label: "حاسبة فترة الإنذار", note: "قانون العمل 33" },
  { href: "/salary-calculator/uae",             label: "حاسبة الراتب بالدرهم" },
  { href: "/vat-calculator/uae",                label: "حاسبة ضريبة القيمة المضافة", note: "5%" },
  { href: "/ar/ae/corporate-tax-calculator",    label: "حاسبة ضريبة الشركات", note: "9%" },
  { href: "/ar/ae/purchase-order-generator",    label: "نموذج أمر الشراء", note: "LPO" },
];

const ISLAMIC_LINKS = [
  { href: "/inheritance-calculator", label: "حاسبة الميراث الشرعية" },
  { href: "/zakat-calculator",       label: "حاسبة الزكاة" },
  { href: "/kaffara-calculator",     label: "حاسبة الكفارات" },
  { href: "/umrah-calculator",       label: "حاسبة تكلفة العمرة" },
  { href: "/zakat-al-fitr",          label: "حاسبة زكاة الفطر" },
];

const GROUPS = [
  { flag: "🇸🇦", title: "أدوات السعودية", sub: "نظام العمل · ZATCA · GOSI", hub: "/ar/sa", links: SA_LINKS },
  { flag: "🇦🇪", title: "أدوات الإمارات", sub: "قانون العمل 33 · FTA", hub: "/ar/ae", links: AE_LINKS },
  { flag: "☪️", title: "أدوات إسلامية", sub: "الميراث · الزكاة · الكفارات", links: ISLAMIC_LINKS },
];

// ─── Official sources ──────────────────────────────────────────────────────────
const OFFICIAL_SOURCES = [
  { label: "وزارة الموارد البشرية — السعودية",          href: "https://hrsd.gov.sa",  domain: "hrsd.gov.sa" },
  { label: "هيئة الزكاة والضريبة والجمارك",             href: "https://zatca.gov.sa", domain: "zatca.gov.sa" },
  { label: "وزارة الموارد البشرية والتوطين — الإمارات", href: "https://mohre.gov.ae", domain: "mohre.gov.ae" },
  { label: "الهيئة الاتحادية للضرائب",                  href: "https://tax.gov.ae",   domain: "tax.gov.ae" },
  { label: "هيئة الأوراق المالية والسلع",               href: "https://sca.gov.ae",   domain: "sca.gov.ae" },
];

// ─── JSON-LD ───────────────────────────────────────────────────────────────────
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

// ─── Icons ────────────────────────────────────────────────────────────────────
function Ico({ children, size = 22, sw = 1.8 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
const Chevron = () => (
  <span className="hl-arr"><Ico size={16} sw={2}><path d="M15 6l-6 6 6 6" /></Ico></span>
);

const FEATURES = [
  { title: "سريع وفوري", desc: "النتائج تظهر فور الإدخال، بدون انتظار أو إعادة تحميل.", icon: <path d="M13 2 4 14h7l-1 8 9-12h-7z" /> },
  { title: "أمان وسرية الحسابات", desc: "تتم جميع العمليات الحسابية محلياً داخل متصفحك لحماية سرية أرقامك.", icon: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></> },
  { title: "يعمل على كل الأجهزة", desc: "متوافق مع الجوال والتابلت والحاسوب، دون تطبيق منفصل.", icon: <><rect x="2" y="4" width="14" height="10" rx="1.5" /><path d="M6 18h6M9 14v4" /><rect x="17.5" y="8" width="4.5" height="10" rx="1.2" /></> },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomeSeoSections({ toolCount }) {
  return (
    <section
      aria-label="دليل أدوات Qemlo والأسئلة الشائعة"
      dir="rtl"
      className="hl w-full bg-[var(--bg)] text-[var(--text)]"
    >
      <style dangerouslySetInnerHTML={{ __html: HOME_LOWER_CSS }} />
      {/* FAQPage JSON-LD — no duplicate of Organization/WebSite (those are in layout.js) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ── Why Qemlo ── */}
      <div className="hl-sec" style={{ paddingTop: 40 }}>
        <div className="hl-why" aria-labelledby="features-title">
          <div className="hl-wrap">
            <div className="hl-why-head">
              <div>
                <span className="hl-eyebrow">لماذا Qemlo؟</span>
                <h2 id="features-title" className="hl-h2">
                  حسابات دقيقة في ثوانٍ —<br className="hl-br" /> بلا تسجيل، وبلا رسوم.
                </h2>
                <p className="hl-lead">كل أداة مبنية على النص الرسمي للنظام، وتعمل بالكامل داخل متصفحك.</p>
              </div>
              <ul className="hl-stats">
                {toolCount ? (
                  <li className="hl-stat"><b dir="ltr">{toolCount}+</b><span>أداة مجانية</span></li>
                ) : null}
                <li className="hl-stat"><b>2</b><span>السعودية والإمارات</span></li>
                <li className="hl-stat"><b>0</b><span>تسجيل مطلوب</span></li>
              </ul>
            </div>
            <ul className="hl-feats">
              {FEATURES.map((f) => (
                <li key={f.title} className="hl-feat">
                  <span className="hl-feat-ic"><Ico>{f.icon}</Ico></span>
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Tools directory + official sources ── */}
      <div className="hl-sec" style={{ paddingTop: 8 }}>
        <div className="hl-wrap">
          {/* Intro paragraph (answer-first for AEO/GEO) */}
          <div className="hl-intro">
            <span className="hl-eyebrow">دليل الأدوات</span>
            <h2 className="hl-h2">ما هي أدوات Qemlo؟</h2>
            <p className="hl-lead">
              Qemlo مكتبة أدوات وحاسبات عربية مجانية موجّهة للموظفين وأصحاب الأعمال في{" "}
              <strong>السعودية والإمارات</strong> وسائر دول الخليج. تشمل المكتبة الحالية
              حاسبات الرواتب ومكافأة نهاية الخدمة والمخالصة النهائية وفترة الإنذار
              والعمل الإضافي والإجازات السنوية وضرائب الشركات والقيمة المضافة،
              فضلاً عن أدوات إسلامية كالميراث والزكاة والكفارات وتكلفة العمرة.
              جميع الأدوات مبنية على المصادر الرسمية، تعمل داخل المتصفح،{" "}
              <strong>بدون تسجيل وبدون رسوم</strong>.
            </p>
          </div>

          <div className="hl-groups">
            {GROUPS.map((g) => (
              <div key={g.title} className="hl-group">
                <div className="hl-g-head">
                  <span className="hl-flag" aria-hidden="true">{g.flag}</span>
                  <div>
                    <h3>{g.title}</h3>
                    <small>{g.sub}</small>
                  </div>
                  {g.hub ? (
                    <Link href={g.hub} className="hl-g-all" aria-label={`عرض كل ${g.title}`}>
                      عرض الكل ←
                    </Link>
                  ) : null}
                </div>
                <ul className="hl-list">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href}>
                        <span className="hl-t">
                          {l.label}
                          {l.note ? <em> · {l.note}</em> : null}
                        </span>
                        <Chevron />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Official sources */}
          <div className="hl-trust">
            <div className="hl-trust-h">
              <span className="hl-shield">
                <Ico size={20} sw={1.9}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></Ico>
              </span>
              <div>
                <h3>المصادر الرسمية التي تستند إليها الأدوات</h3>
                <p>النصوص المنشورة من وزارات العمل والهيئات الضريبية</p>
              </div>
            </div>
            <ul className="hl-chips">
              {OFFICIAL_SOURCES.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="hl-chip">
                    {s.label} <span className="hl-chip-d">{s.domain}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="hl-disc">
              تعتمد حاسبات Qemlo على النصوص الرسمية المنشورة من وزارات العمل والهيئات الضريبية في دول الخليج. النتائج تقديرية ولا تُغني عن الاستشارة القانونية أو مراجعة جهة العمل.
            </p>
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="hl-sec" style={{ paddingTop: 8 }}>
        <div className="hl-wrap hl-faq-grid">
          <div className="hl-faq-side">
            <span className="hl-eyebrow">لديك سؤال؟</span>
            <h2 className="hl-h2" id="faq">الأسئلة الشائعة</h2>
            <p>إجابات مختصرة عن Qemlo وأكثر الحسابات استخداماً في السعودية والإمارات.</p>
            <Link href="/contact" className="hl-faq-cta">تواصل معنا ←</Link>
          </div>
          <div className="hl-faq-list">
            {FAQS.map((faq, i) => (
              <details key={i}>
                <summary>
                  <span className="hl-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span className="hl-q">{faq.q}</span>
                  <span className="hl-pm" aria-hidden="true">
                    <Ico size={14} sw={2.4}><path d="M12 5v14M5 12h14" /></Ico>
                  </span>
                </summary>
                <div className="hl-a">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
