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
const SA_LINKS = [
  { href: "/ar/sa/final-settlement-calculator", label: "حاسبة المخالصة النهائية — السعودية" },
  { href: "/salary-calculator/saudi",           label: "حاسبة الراتب الصافي — GOSI وساند" },
  { href: "/ar/sa/annual-leave-calculator",     label: "حاسبة بدل الإجازات السنوية — السعودية" },
  { href: "/overtime-calculator/saudi",         label: "حاسبة العمل الإضافي — المادة 107" },
  { href: "/vat-calculator/saudi",              label: "حاسبة ضريبة القيمة المضافة 15% — السعودية" },
  { href: "/ar/sa/article-77-calculator",       label: "حاسبة المادة 77 — تعويض الفصل التعسفي" },
];

const AE_LINKS = [
  { href: "/ar/ae/final-settlement-calculator",   label: "حاسبة المخالصة النهائية — الإمارات" },
  { href: "/ar/ae/notice-period-calculator",      label: "حاسبة فترة الإنذار — قانون العمل 33" },
  { href: "/salary-calculator/uae",               label: "حاسبة الراتب بالدرهم — الإمارات" },
  { href: "/vat-calculator/uae",                  label: "حاسبة ضريبة القيمة المضافة 5% — الإمارات" },
  { href: "/ar/ae/corporate-tax-calculator",      label: "حاسبة ضريبة الشركات 9% — الإمارات" },
  { href: "/ar/ae/purchase-order-generator",      label: "نموذج أمر الشراء LPO" },
];

const ISLAMIC_LINKS = [
  { href: "/inheritance-calculator", label: "حاسبة الميراث الشرعية" },
  { href: "/zakat-calculator",       label: "حاسبة الزكاة" },
  { href: "/kaffara-calculator",     label: "حاسبة الكفارات" },
  { href: "/umrah-calculator",       label: "حاسبة تكلفة العمرة" },
  { href: "/zakat-al-fitr",          label: "حاسبة زكاة الفطر" },
];

// ─── Official sources ──────────────────────────────────────────────────────────
const OFFICIAL_SOURCES = [
  { label: "وزارة الموارد البشرية — السعودية",           href: "https://hrsd.gov.sa" },
  { label: "هيئة الزكاة والضريبة والجمارك (ZATCA)",       href: "https://zatca.gov.sa" },
  { label: "وزارة الموارد البشرية والتوطين — الإمارات",  href: "https://mohre.gov.ae" },
  { label: "الهيئة الاتحادية للضرائب (FTA)",              href: "https://tax.gov.ae" },
  { label: "هيئة الأوراق المالية والسلع (SCA)",           href: "https://sca.gov.ae" },
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomeSeoSections() {
  return (
    <section
      aria-label="دليل أدوات Qemlo والأسئلة الشائعة"
      dir="rtl"
      className="w-full bg-[var(--bg)] text-[var(--text)]"
    >
      {/* FAQPage JSON-LD — no duplicate of Organization/WebSite (those are in layout.js) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 space-y-14">

        {/* ── Intro paragraph (answer-first for AEO/GEO) ── */}
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold leading-snug mb-4 sm:text-3xl">
            ما هي أدوات Qemlo؟
          </h2>
          <p className="text-base leading-relaxed text-[var(--text-2)] sm:text-lg">
            Qemlo مكتبة أدوات وحاسبات عربية مجانية موجّهة للموظفين وأصحاب الأعمال في{" "}
            <strong>السعودية والإمارات</strong> وسائر دول الخليج. تشمل المكتبة الحالية
            حاسبات الرواتب ومكافأة نهاية الخدمة والمخالصة النهائية وفترة الإنذار
            والعمل الإضافي والإجازات السنوية وضرائب الشركات والقيمة المضافة،
            فضلاً عن أدوات إسلامية كالميراث والزكاة والكفارات وتكلفة العمرة.
            جميع الأدوات مبنية على المصادر الرسمية، تعمل داخل المتصفح،{" "}
            <strong>بدون تسجيل وبدون رسوم</strong>.
          </p>
        </div>

        {/* ── Link groups ── */}
        <div className="grid gap-10 sm:grid-cols-3">

          {/* Saudi */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span aria-hidden="true">🇸🇦</span> أدوات السعودية
            </h3>
            <ul className="space-y-2.5 list-none p-0">
              {SA_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm font-medium text-[var(--text-2)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--orange)] hover:decoration-[var(--orange)] transition-colors leading-snug"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* UAE */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span aria-hidden="true">🇦🇪</span> أدوات الإمارات
            </h3>
            <ul className="space-y-2.5 list-none p-0">
              {AE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm font-medium text-[var(--text-2)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--orange)] hover:decoration-[var(--orange)] transition-colors leading-snug"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Islamic */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span aria-hidden="true">☪️</span> أدوات إسلامية
            </h3>
            <ul className="space-y-2.5 list-none p-0">
              {ISLAMIC_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm font-medium text-[var(--text-2)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--orange)] hover:decoration-[var(--orange)] transition-colors leading-snug"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Official sources ── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h3 className="text-base font-bold mb-4 text-[var(--text)]">
            المصادر الرسمية التي تستند إليها الأدوات
          </h3>
          <ul className="grid gap-2 sm:grid-cols-2 list-none p-0">
            {OFFICIAL_SOURCES.map((s) => (
              <li key={s.href} className="flex items-center gap-2">
                <span aria-hidden="true" className="text-[var(--orange)] text-xs">●</span>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--text-2)] hover:text-[var(--orange)] transition-colors"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[var(--text-3)] leading-relaxed">
            تعتمد حاسبات Qemlo على النصوص الرسمية المنشورة من وزارات العمل والهيئات الضريبية في دول الخليج. النتائج تقديرية ولا تُغني عن الاستشارة القانونية أو مراجعة جهة العمل.
          </p>
        </div>

        {/* ── FAQ ── */}
        <div>
          <h2 className="text-2xl font-bold leading-snug mb-6 sm:text-3xl" id="faq">
            الأسئلة الشائعة
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-semibold text-[var(--text)] list-none select-none hover:bg-[var(--bg)] transition-colors">
                  <span className="text-sm leading-snug sm:text-base">{faq.q}</span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-[var(--orange)] transition-transform group-open:rotate-45 text-xl leading-none"
                  >
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-[var(--text-2)] border-t border-[var(--border)]">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

