import Link from "next/link";
import ChangelogTimeline from "./ChangelogTimeline";
import { SITE_URL, SITE_ORG_ID } from "@/lib/siteConfig";
import { editorialFontClass } from "@/lib/editorialFonts";
import {
  CHANGELOG,
  CHANGE_TYPES,
  COUNTRY_LABELS,
  formatArabicDate,
  formatArabicMonth,
  getChangelogStats,
  getLatestChange,
} from "@/lib/changelog";

const stats = getChangelogStats();

export const metadata = {
  title: "سجل التحديثات — كل تغيير في حاسبات Qemlo بتاريخه ومصدره",
  description:
    "سجل علني لكل تعديل يغيّر نتيجة حاسبة في Qemlo أو نصها النظامي في السعودية والإمارات ومصر: ما الذي تغيّر، ومن يتأثر، والقرار الرسمي الذي استندنا إليه.",
  alternates: { canonical: "/changelog" },
};

const FAQ = [
  {
    q: "حسبتُ قبل التصحيح، هل تتغيّر نتيجتي تلقائياً؟",
    a: "لا. لا نحفظ الأرقام التي تدخلها، لذلك أعد الحساب في الأداة نفسها لتحصل على النتيجة المصححة.",
  },
  {
    q: "كيف أعرف أن أداة ما محدّثة؟",
    a: "كل تغيير يمس نتيجة أداة أو نصها النظامي يُسجَّل في هذه الصفحة بتاريخه ومصدره، وصفحة الأداة نفسها تذكر مصدرها الرسمي.",
  },
  {
    q: "ماذا لو صدر قرار جديد ولم يظهر هنا؟",
    a: "أرسل لنا رابط القرار. نراجعه مقابل الأداة ونرد عليك خلال 24 ساعة في أيام العمل.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/changelog#webpage`,
      url: `${SITE_URL}/changelog`,
      name: "سجل التحديثات",
      inLanguage: "ar",
      dateModified: stats.lastUpdated,
      publisher: { "@id": SITE_ORG_ID },
      mainEntity: {
        "@type": "ItemList",
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        numberOfItems: CHANGELOG.length,
        itemListElement: CHANGELOG.map((e, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "CreativeWork",
            "@id": `${SITE_URL}/changelog#${e.id}`,
            name: e.title,
            description: e.summary,
            dateModified: e.date,
            about: { "@type": "WebPage", url: `${SITE_URL}${e.href}` },
          },
        })),
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/changelog#faq`,
      mainEntity: FAQ.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "سجل التحديثات", item: `${SITE_URL}/changelog` },
      ],
    },
  ],
};

const h2Cls = "q-serif m-0 text-[28px] font-bold leading-[1.5] sm:text-[30px]";

export default function ChangelogPage() {
  const latest = getLatestChange();

  return (
    <div className={`${editorialFontClass} bg-[var(--bg)] text-[var(--text)]`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="mx-auto max-w-[1180px] px-5 pb-20 pt-5 sm:px-7">
        <nav aria-label="مسار التنقل" className="flex gap-2 text-[13px] text-[var(--text-2)]">
          <Link href="/" className="text-[var(--text-2)] hover:text-[var(--text)]">الرئيسية</Link>
          <span aria-hidden="true">‹</span>
          <span>سجل التحديثات</span>
        </nav>

        {/* Hero */}
        <section className="mt-7 flex flex-col gap-10 md:mt-14 md:flex-row md:items-end md:gap-[72px]">
          <div className="min-w-0 md:flex-1">
            <p className="mb-3.5 text-sm font-bold text-[var(--accent-text)]">سجل التحديثات</p>
            <h1 className="q-serif m-0 text-[36px] font-bold leading-[1.4] [text-wrap:balance] md:text-[56px]">
              كل تغيير في أدواتنا، بتاريخه ومصدره.
            </h1>
            <p className="mt-6 max-w-[640px] text-[17px] leading-[2] text-[var(--text-2)] [text-wrap:pretty] sm:text-[19px]">
              هذه الصفحة سجلّ علني لكل تعديل يغيّر نتيجة حاسبة في Qemlo أو نصّها النظامي: ما الذي كان قبله، ومن يتأثر به، والقرار الرسمي الذي استندنا إليه. وحين نخطئ نكتب ذلك هنا بوضوح.
            </p>
          </div>
          <div className="min-w-0 border-t-[3px] border-[var(--orange)] pt-[18px] md:w-[320px] md:flex-none">
            <p className="m-0 text-sm text-[var(--text-2)]">منذ {formatArabicMonth(stats.since)}</p>
            <div className="mt-2.5 flex gap-7">
              <div>
                <p className="q-mono m-0 text-[40px] leading-[1.2]">{stats.total}</p>
                <p className="m-0 mt-0.5 text-[13px] text-[var(--text-2)]">تحديثات</p>
              </div>
              <div>
                <p className="q-mono m-0 text-[40px] leading-[1.2] text-[var(--accent-text)]">{stats.byType.legal}</p>
                <p className="m-0 mt-0.5 text-[13px] text-[var(--text-2)]">بسبب قرارات جديدة</p>
              </div>
              <div>
                <p className="q-mono m-0 text-[40px] leading-[1.2] text-[var(--error)]">{stats.byType.fix}</p>
                <p className="m-0 mt-0.5 text-[13px] text-[var(--text-2)]">تصحيحات لأخطائنا</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-[var(--text-2)]">
              آخر تحديث: <time dateTime={stats.lastUpdated} className="q-mono text-[var(--text)]">{formatArabicDate(stats.lastUpdated)}</time>
            </p>
          </div>
        </section>

        {/* Featured latest */}
        <article
          id={latest.id}
          aria-labelledby="latest-title"
          className="mt-[72px] flex scroll-mt-24 flex-col gap-7 rounded border border-[var(--border)] bg-[var(--surface)] px-5 py-6 shadow-[0_18px_40px_-24px_rgba(13,13,13,0.25)] sm:px-11 sm:py-10 md:flex-row md:gap-14"
        >
          <div className="min-w-0 md:flex-1">
            <p className="m-0 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] text-[var(--text-2)]">
              <span className="rounded-[3px] bg-[var(--orange)] px-2.5 py-px font-bold text-[var(--on-orange)]">الأحدث</span>
              <time dateTime={latest.date} className="q-mono">{latest.date}</time>
              <span>{COUNTRY_LABELS[latest.country]}</span>
              <span className="font-bold text-[var(--accent-text)]">{CHANGE_TYPES[latest.type].label}</span>
            </p>
            <h2 id="latest-title" className="q-serif mt-3.5 text-[26px] font-bold leading-[1.5] [text-wrap:balance] sm:text-[34px]">
              {latest.title}
            </h2>
            <p className="mt-3 text-[17px] leading-[2] text-[var(--text-2)] [text-wrap:pretty]">{latest.summary}</p>
            {latest.action && (
              <p className="mt-4 text-[15px] leading-[1.9]">
                <strong>ماذا تفعل الآن:</strong> <span className="text-[var(--text-2)]">{latest.action}</span>
              </p>
            )}
            <p className="mt-1 text-sm leading-[1.9] text-[var(--text-2)]">المصدر: {latest.source}</p>
          </div>
          <div className="flex min-w-0 flex-col self-center md:w-[320px] md:flex-none">
            {latest.before && (
              <div className="border-b border-[var(--border)] py-4">
                <p className="m-0 text-xs font-bold text-[var(--text-2)]">قبل</p>
                <p className="mt-1 text-[17px] text-[var(--text-2)] line-through decoration-[var(--text-3)]">{latest.before}</p>
              </div>
            )}
            {latest.after && (
              <div className="py-4">
                <p className="m-0 text-xs font-bold text-[var(--accent-text)]">بعد</p>
                <p className="mt-1 text-[19px] font-bold">{latest.after}</p>
              </div>
            )}
            <Link
              href={latest.href}
              className="mt-1.5 inline-flex min-h-[48px] items-center justify-center rounded-[10px] bg-[var(--text)] text-[15px] font-bold text-[var(--bg)] no-underline"
            >
              {latest.cta || "افتح الأداة"}
            </Link>
          </div>
        </article>

        <ChangelogTimeline skipId={latest.id} />

        {/* Policy */}
        <section className="mt-[72px] flex flex-col gap-8 border-t border-[var(--border)] pt-12 md:flex-row md:gap-[72px]">
          <h2 className={`${h2Cls} min-w-0 md:w-[28%] md:flex-none`}>ما الذي يدخل هذا السجل؟</h2>
          <div className="grid min-w-0 flex-1 gap-8 sm:grid-cols-2 sm:gap-12">
            <div>
              <h3 className="m-0 text-lg font-bold">نسجّل دائماً</h3>
              <ul className="mt-2.5 list-disc ps-5 text-base leading-[2.1] text-[var(--text-2)]">
                <li>تغيّر نسبة أو حد أو موعد بقرار رسمي.</li>
                <li>خطأ عندنا غيّر نتيجة حاسبة، مهما كان صغيراً.</li>
                <li>تغيّر في من تنطبق عليه الأداة.</li>
              </ul>
            </div>
            <div>
              <h3 className="m-0 text-lg font-bold">لا نسجّل</h3>
              <ul className="mt-2.5 list-disc ps-5 text-base leading-[2.1] text-[var(--text-2)]">
                <li>تغييرات التصميم والألوان.</li>
                <li>تحسينات السرعة التي لا تمس النتيجة.</li>
                <li>تصحيح إملائي لا يغيّر المعنى.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq" className="mt-20 flex flex-col gap-8 md:mt-[88px] md:flex-row md:gap-[72px]">
          <h2 id="faq" className={`${h2Cls} min-w-0 md:w-[28%] md:flex-none`}>أسئلة عن التحديثات</h2>
          <dl className="m-0 min-w-0 flex-1 border-t border-[var(--border)]">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border-b border-[var(--border)] py-[22px]">
                <dt className="text-[19px] font-bold">{q}</dt>
                <dd className="mt-2 text-base leading-[1.9] text-[var(--text-2)]">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* CTA */}
        <section className="mt-20 flex flex-wrap items-center justify-between gap-x-12 gap-y-5 border-y border-[var(--border)] py-11 md:mt-[88px]">
          <p className="q-serif m-0 min-w-0 flex-1 basis-[420px] text-[22px] font-semibold leading-[1.8] sm:text-[26px]">
            لاحظت قراراً لم نسجّله، أو رقماً لا يطابق المصدر؟
          </p>
          <Link
            href="/contact"
            className="inline-flex min-h-[52px] items-center rounded-xl bg-[var(--orange)] px-7 text-[17px] font-bold text-[var(--on-orange)] no-underline"
          >
            اكتب لنا
          </Link>
        </section>
      </main>
    </div>
  );
}
