import Link from "next/link";
import { SITE_URL, SITE_ORG_ID } from "@/lib/siteConfig";
import { editorialFontClass } from "@/lib/editorialFonts";
import { getChangelogStats, formatArabicDate, formatArabicMonth } from "@/lib/changelog";
import { PAGE_UPDATED as TOOL_PAGES } from "@/lib/pageDates.generated";

export const metadata = {
  title: "عن Qemlo | حاسبات عربية تُريك كيف خرج الرقم",
  description:
    "Qemlo موقع عربي مجاني لحسابات العمل والضريبة والزكاة في السعودية والإمارات. كل حاسبة تعرض خطواتها ومصدرها الرسمي، وكل تصحيح نسجّله علناً بتاريخه.",
  alternates: { canonical: "/about" },
};

// Keep this aligned with the public email destination on the Contact page.
const CONTACT_EMAIL = "contact@qemlo.com";
const PAGE_UPDATED = "2026-11-10";

const AUTHORITIES = [
  "وزارة الموارد البشرية والتنمية الاجتماعية",
  "المؤسسة العامة للتأمينات الاجتماعية",
  "هيئة الزكاة والضريبة والجمارك",
  "وزارة الموارد البشرية والتوطين",
  "الهيئة الاتحادية للضرائب",
  "وزارة المالية الإماراتية",
  "اللجنة الدائمة للإفتاء",
  "مجلس الإمارات للإفتاء الشرعي",
];

const RULES = [
  {
    n: "١",
    title: "المصدر قبل المعادلة.",
    text: "نبدأ من نص النظام أو قرار الجهة أو الفتوى المنشورة. لا نبني أداة على مقال أو على حاسبة أخرى.",
  },
  {
    n: "٢",
    title: "الخطوات أمامك.",
    text: "كل نتيجة معها طريقة حسابها، لتراجعها بنفسك أو تعرضها على محاسبك أو مديرك.",
  },
  {
    n: "٣",
    title: "الخطأ يُكتب، لا يُخفى.",
    text: "حين نخطئ أو يتغيّر قرار، نعدّل الأداة ونكتب ما كان قبل التعديل وما صار بعده، بتاريخه.",
  },
];

// Real worked example from /overtime-calculator/saudi (basic 9,600 + allowances 2,400, 16 hours).
const RECEIPT = [
  ["أجر الساعة الفعلي", "12,000 ÷ 240 = 50.00"],
  ["+ نصف أجر الساعة الأساسي", "9,600 ÷ 240 ÷ 2 = 20.00"],
  ["× 16 ساعة إضافية", "70.00 × 16"],
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${SITE_URL}/about#webpage`,
      url: `${SITE_URL}/about`,
      name: "عن Qemlo",
      inLanguage: "ar",
      dateModified: PAGE_UPDATED,
      mainEntity: {
        "@id": SITE_ORG_ID,
        "@type": "Organization",
        name: "Qemlo",
        url: SITE_URL,
        email: CONTACT_EMAIL,
        founder: { "@type": "Person", name: "محمد أحمد", alternateName: "Muhammad Ahmad", jobTitle: "مؤسس Qemlo" },
        publishingPrinciples: `${SITE_URL}/changelog`,
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "عن Qemlo", item: `${SITE_URL}/about` },
      ],
    },
  ],
};

const eyebrow = "m-0 text-sm font-bold text-[var(--accent-text)]";
const h2Cls = "q-serif m-0 text-[28px] font-bold leading-[1.5] md:text-[38px]";
const gap = "mt-[72px] md:mt-28";

function Stat({ value, label, accent }) {
  return (
    <div className="min-w-0">
      <p className={`q-serif m-0 text-[64px] font-bold leading-[1.1] md:text-[96px] ${accent ? "text-[var(--orange)]" : ""}`}>{value}</p>
      <p className="mt-2 text-[15px] leading-[1.7] text-[var(--text-2)]">{label}</p>
    </div>
  );
}

export default function AboutPage() {
  const stats = getChangelogStats();
  const toolCount = Object.keys(TOOL_PAGES).length;

  return (
    <div className={`${editorialFontClass} bg-[var(--bg)] text-[var(--text)]`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero (always dark) ── */}
      <div
        className="overflow-hidden bg-[#141413] text-[#F4F3EF]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      >
        <section className="relative mx-auto flex max-w-[1160px] flex-col gap-16 px-5 pb-16 pt-9 sm:px-8 md:flex-row md:items-center md:gap-[72px] md:pb-[104px] md:pt-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-[120px] top-10 h-[620px] w-[620px] rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(255,106,26,0.30), rgba(255,106,26,0))" }}
          />

          <div className="relative min-w-0 md:flex-1">
            <p className="m-0 mb-5 inline-flex items-center gap-2.5 rounded-full border border-[#3A3935] py-1.5 pl-3.5 pr-1.5 text-[13px] font-semibold text-[#C9C7BE]">
              <span className="rounded-full bg-[var(--orange)] px-2.5 py-0.5 font-bold text-[#111110]">من نحن</span>
              حاسبات عربية للسعودية والإمارات
            </p>
            <h1 className="q-serif m-0 text-[42px] font-bold leading-[1.28] [text-wrap:balance] md:text-[80px]">
              الرقم وحده لا يكفي.
              <br />
              <span className="text-[var(--orange)]">نُريك كيف خرج.</span>
            </h1>
            <p className="mt-6 max-w-[540px] text-[17px] leading-[2.05] text-[#C9C7BE] [text-wrap:pretty] md:text-xl md:leading-[2.05]">
              كل حاسبة في Qemlo تكتب خطواتها أمامك، وتذكر المادة أو القرار الذي بُنيت عليه. وحين نخطئ نصحّح علناً.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex min-h-[56px] items-center gap-2.5 rounded-[14px] bg-[var(--orange)] px-7 text-[17px] font-bold text-[#111110] no-underline shadow-[0_14px_30px_-12px_rgba(255,106,26,0.7)] transition-colors hover:bg-[var(--orange-hover)]"
              >
                جرّب حاسبة الآن <span aria-hidden="true">←</span>
              </Link>
              <Link
                href="/changelog"
                className="inline-flex min-h-[56px] items-center rounded-[14px] border border-[#4A4944] px-[22px] text-base font-semibold text-[#F4F3EF] no-underline hover:border-[#8E8C84]"
              >
                سجل تصحيحاتنا
              </Link>
            </div>
            <dl className="m-0 mt-12 flex max-w-[560px] flex-wrap gap-x-7 gap-y-5">
              {[
                [toolCount, "حاسبة وأداة"],
                [AUTHORITIES.length, "جهات رسمية نراجع عليها"],
                [0, "تسجيل أو رسوم"],
              ].map(([v, l]) => (
                <div key={l} className="min-w-[120px] flex-1 border-[var(--orange)] ps-4 [border-inline-start-width:2px]">
                  <dd className="q-mono m-0 text-[26px] leading-[1.2] text-[#F4F3EF]">{v}</dd>
                  <dt className="mt-0.5 text-[13px] leading-[1.6] text-[#A8A69D]">{l}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Receipt illustration */}
          <div className="relative mx-auto w-full min-w-0 max-w-[460px] md:mx-0 md:w-[440px] md:flex-none" aria-label="مثال: نتيجة بلا شرح مقابل نتيجة Qemlo مع خطواتها ومصدرها">
            <div className="-mb-[26px] w-[250px] -rotate-[4deg] rounded-xl border border-dashed border-[#55534D] bg-[#24231F] px-[18px] pb-10 pt-4 ms-7">
              <p className="m-0 text-xs font-bold text-[#8E8C84]">نتيجة بلا شرح</p>
              <p className="q-mono m-0 mt-1 text-[28px] text-[#77756E] line-through decoration-[var(--orange)] decoration-[3px]">960 ر.س</p>
              <p className="m-0 mt-0.5 text-xs text-[#8E8C84]">من أين جاء الرقم؟</p>
            </div>
            <div className="relative rotate-[1.2deg] [filter:drop-shadow(0_34px_44px_rgba(0,0,0,0.55))]">
              <div className="rounded-t-[10px] bg-[#FFFDF7] px-6 pb-5 pt-6 text-[#111110]">
                <div className="flex items-center justify-between gap-2.5 border-b-2 border-dashed border-[#CFCBBE] pb-3.5">
                  <div>
                    <p className="m-0 text-xs text-[#6E6D67]">حاسبة العمل الإضافي · السعودية</p>
                    <p className="m-0 mt-0.5 text-[17px] font-bold">كيف خرج الرقم</p>
                  </div>
                  <span aria-hidden="true" className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-[#111110] text-lg font-bold text-[var(--orange)]">Q</span>
                </div>
                <ol className="m-0 list-none border-b border-dashed border-[#CFCBBE] p-0 pb-1.5 pt-2">
                  {RECEIPT.map(([label, value], i) => (
                    <li key={label} className="flex items-center gap-2.5 py-[9px] text-sm leading-[1.6]">
                      <span aria-hidden="true" className="q-mono inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#111110] text-[11px] text-[#FFFDF7]">{i + 1}</span>
                      <span className="min-w-0 flex-1">{label}</span>
                      <span dir="ltr" className="q-mono whitespace-nowrap">{value}</span>
                    </li>
                  ))}
                </ol>
                <div className="flex items-end justify-between gap-3 pt-3.5">
                  <div>
                    <p className="m-0 text-xs font-bold text-[#6E6D67]">المستحق</p>
                    <p className="q-mono m-0 text-[34px] font-bold leading-[1.15] md:text-[42px]">
                      1,120.00<span className="text-[15px] font-medium"> ر.س</span>
                    </p>
                  </div>
                  <span className="-rotate-[9deg] rounded-lg border-[2.5px] border-[#C2410C] px-3 py-[5px] text-center text-xs font-bold leading-[1.5] text-[#C2410C] opacity-90">
                    المصدر
                    <br />
                    نظام العمل · م 107
                  </span>
                </div>
              </div>
              <div
                aria-hidden="true"
                className="h-3"
                style={{
                  background:
                    "linear-gradient(135deg, #FFFDF7 6px, transparent 0) 0 0 / 12px 12px repeat-x, linear-gradient(225deg, #FFFDF7 6px, transparent 0) 0 0 / 12px 12px repeat-x",
                }}
              />
            </div>
            <p className="mt-[22px] text-center text-[13px] text-[#A8A69D]">
              مثال حقيقي من{" "}
              <Link href="/overtime-calculator/saudi" className="text-[#C9C7BE] underline underline-offset-4">حاسبة العمل الإضافي</Link>: أساسي 9,600 وبدلات 2,400
            </p>
          </div>
        </section>
      </div>

      <main className="mx-auto max-w-[1160px] px-5 sm:px-8">
        {/* ── Numbers ── */}
        <section aria-label="الموقع بالأرقام" className={`${gap} grid grid-cols-2 gap-x-10 gap-y-9 md:grid-cols-4`}>
          <Stat value={toolCount} label="حاسبة وأداة منشورة" />
          <Stat value={stats.total} label={`تحديثات مسجّلة علناً منذ ${formatArabicMonth(stats.since)}`} />
          <Stat value={stats.byType.fix} label="منها تصحيحات لأخطائنا نحن" accent />
          <Stat value={0} label="تسجيل، رسوم، أو أرقام نحفظها" />
        </section>

        {/* ── Rules ── */}
        <section aria-labelledby="rules" className={gap}>
          <h2 id="rules" className={`${eyebrow} mb-7`}>ثلاث قواعد لا نتنازل عنها</h2>
          <ol className="m-0 list-none border-b border-[var(--border)] p-0">
            {RULES.map((r) => (
              <li key={r.n} className="flex flex-wrap items-baseline gap-x-10 gap-y-2 border-t border-[var(--border)] py-7 md:py-10">
                <span aria-hidden="true" className="q-serif w-14 text-[56px] font-bold leading-none text-[var(--orange)] md:w-[110px] md:text-[88px]">{r.n}</span>
                <div className="min-w-0 flex-1 basis-[320px]">
                  <h3 className="q-serif m-0 text-[26px] font-bold leading-[1.5] md:text-4xl md:leading-[1.5]">{r.title}</h3>
                  <p className="mt-2.5 max-w-[620px] text-[17px] leading-[2] text-[var(--text-2)]">{r.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Proof ── */}
        <section aria-labelledby="proof" className={`${gap} flex flex-col gap-8 md:flex-row md:items-center md:gap-16`}>
          <div className="min-w-0 md:w-[38%] md:flex-none">
            <p className={`${eyebrow} mb-2.5`}>مثال حقيقي</p>
            <h2 id="proof" className={h2Cls}>هكذا يبدو تصحيح عندنا.</h2>
            <p className="mt-3.5 text-[17px] leading-[2.05] text-[var(--text-2)]">
              في 10 نوفمبر 2026 وجدنا أن شرح حاسبة العمل الإضافي السعودية يتجاهل البدلات. صحّحنا النص والأمثلة وكتبنا ذلك في السجل.
            </p>
            <Link href="/changelog#sa-overtime-page-copy" className="mt-3.5 inline-block font-bold text-[var(--accent-text)]">
              كل التصحيحات في سجل التحديثات ←
            </Link>
          </div>
          <div className="min-w-0 flex-1 overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_48px_-28px_rgba(13,13,13,0.35)]">
            <p className="m-0 flex flex-wrap gap-x-3.5 gap-y-1 border-b border-[var(--border)] px-[22px] py-3 text-[13px] text-[var(--text-2)]">
              <time dateTime="2026-11-10" className="q-mono">2026-11-10</time>
              <span>السعودية</span>
              <span className="font-bold text-[var(--accent-text)]">تصحيح</span>
            </p>
            <div className="grid sm:grid-cols-2">
              <div className="border-[var(--border)] px-[22px] py-5 max-sm:border-b sm:[border-inline-end-width:1px]">
                <p className="m-0 text-xs font-bold text-[var(--text-2)]">قبل</p>
                <p className="q-mono m-0 mt-1.5 text-[28px] text-[var(--text-2)] line-through">960 ر.س</p>
                <p className="m-0 mt-1 text-sm text-[var(--text-2)]">16 ساعة × 60، على الأساسي فقط</p>
              </div>
              <div className="px-[22px] py-5">
                <p className="m-0 text-xs font-bold text-[var(--accent-text)]">بعد</p>
                <p className="q-mono m-0 mt-1.5 text-[28px] font-bold">1,120 ر.س</p>
                <p className="m-0 mt-1 text-sm text-[var(--text-2)]">16 ساعة × 70، مع بدلات 2,400</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Founder ── */}
        <section aria-labelledby="founder" className={`${gap} flex flex-col gap-9 md:flex-row md:items-start md:gap-[72px]`}>
          <div className="min-w-0 md:w-[260px] md:flex-none">
            <div aria-hidden="true" className="q-serif flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[var(--text)] text-[40px] font-bold text-[var(--orange)]">
              م.أ
            </div>
            <p className="q-serif m-0 mt-4 text-[28px] font-bold">محمد أحمد</p>
            <p className="m-0 text-[15px] text-[var(--text-2)]">مؤسس Qemlo</p>
            <a href={`mailto:${CONTACT_EMAIL}`} dir="ltr" className="q-mono mt-2 inline-block text-sm text-[var(--text-2)] underline underline-offset-4">
              {CONTACT_EMAIL}
            </a>
          </div>
          <div className="min-w-0 max-w-[680px] flex-1">
            <p className={`${eyebrow} mb-2.5`}>التزام المؤسس</p>
            <h2 id="founder" className={h2Cls}>أقرأ كل بلاغ بنفسي.</h2>
            <p className="mt-[18px] text-lg leading-[2.15] [text-wrap:pretty]">
              Qemlo مشروع صغير، وهذا يعني أن من يبني الأداة هو نفسه من يقرأ رسالتك حين تخبرنا أن رقماً لا يبدو صحيحاً. نراجع بلاغك مقابل النص الرسمي، ونرد عليك خلال 24 ساعة في أيام العمل.
            </p>
            <p className="mt-[18px] text-lg leading-[2.15] [text-wrap:pretty]">
              ونحن نخطئ. منذ {formatArabicMonth(stats.since)} سجّلنا {stats.byType.fix} تصحيحات لأخطاء في أدواتنا وشروحها، وكل واحد منها مكتوب علناً بما كان قبله وما صار بعده. نفضّل أن ترى أخطاءنا مكتوبة على أن تثق بنا ثقة عمياء.
            </p>
          </div>
        </section>

        {/* ── Authorities ── */}
        <section aria-labelledby="auth" className={gap}>
          <h2 id="auth" className={`${eyebrow} mb-[18px]`}>الجهات التي نراجع أدواتنا على ما تنشره</h2>
          <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
            {AUTHORITIES.map((a) => (
              <li key={a} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">{a}</li>
            ))}
          </ul>
          <p className="mt-3.5 text-sm leading-[1.9] text-[var(--text-2)]">
            لسنا تابعين لأي من هذه الجهات ولا نمثّلها. نتائج الأدوات تقدير للتوعية، وليست وثيقة رسمية ولا استشارة مالية أو قانونية أو شرعية. التفاصيل في{" "}
            <Link href="/disclaimer" className="font-semibold text-[var(--text)] underline underline-offset-4">إخلاء المسؤولية</Link> و
            <Link href="/terms" className="font-semibold text-[var(--text)] underline underline-offset-4">شروط الاستخدام</Link>.
          </p>
        </section>

        {/* ── Privacy + funding ── */}
        <section className={`${gap} grid gap-9 border-t border-[var(--border)] pt-10 md:grid-cols-2 md:gap-[72px]`}>
          <div>
            <h2 className="m-0 text-[21px] font-bold">خصوصيتك</h2>
            <p className="mt-3 text-base leading-[2.1] text-[var(--text-2)]">
              الحساب يجري في متصفحك. لا نطلب حساباً ولا بريداً، ولا نحفظ الأرقام التي تدخلها في الحاسبات. التفاصيل في{" "}
              <Link href="/privacy" className="font-semibold text-[var(--text)] underline underline-offset-4">سياسة الخصوصية</Link>.
            </p>
          </div>
          <div>
            <h2 className="m-0 text-[21px] font-bold">كيف يموَّل الموقع</h2>
            <p className="mt-3 text-base leading-[2.1] text-[var(--text-2)]">
              الأدوات مجانية وستبقى كذلك. قد نعرض إعلانات لتغطية التكاليف، ولن يؤثر أي معلن في نتيجة حاسبة أو في ترتيب الأدوات.
            </p>
          </div>
        </section>

        <p className="mt-10 text-sm text-[var(--text-2)]">
          آخر تحديث للصفحة: <time dateTime={PAGE_UPDATED}>{formatArabicDate(PAGE_UPDATED)}</time>
        </p>
      </main>

      {/* ── CTA band ── */}
      <section className="mt-[72px] bg-[var(--orange)] text-[#111110] md:mt-28">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-x-12 gap-y-6 px-5 py-12 sm:px-8 md:py-[72px]">
          <p className="q-serif m-0 min-w-0 flex-1 basis-[460px] text-[26px] font-bold leading-[1.6] [text-wrap:balance] md:text-4xl md:leading-[1.6]">
            رأيت رقماً لا يطابق المصدر؟ هذا بالضبط ما نريد أن نسمعه.
          </p>
          <Link href="/contact" className="inline-flex min-h-[56px] items-center rounded-xl bg-[#111110] px-[30px] text-[17px] font-bold text-[#F4F3EF] no-underline">
            اكتب لنا
          </Link>
        </div>
      </section>
    </div>
  );
}
