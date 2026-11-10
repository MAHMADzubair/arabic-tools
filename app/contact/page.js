import Link from "next/link";
import { FOUNDER, founderSchema } from "@/lib/founder";
import ContactForm from "./ContactForm";
import CopyEmailButton from "./CopyEmailButton";
import { SITE_URL, SITE_ORG_ID } from "@/lib/siteConfig";
import { editorialFontClass } from "@/lib/editorialFonts";
import { getLatestChange, formatArabicDate, COUNTRY_LABELS } from "@/lib/changelog";

const CONTACT_EMAIL = "contact@qemlo.com";
// Temporary number; replace with the UAE number when available.
const WHATSAPP_DISPLAY = "+92 313 1700400";
const WHATSAPP_URL = "https://wa.me/923131700400";
const PAGE_UPDATED = "2026-11-09";

export const metadata = {
  title: "تواصل معنا — أبلغ عن خطأ أو اقترح أداة",
  description:
    "راسل فريق Qemlo على contact@qemlo.com للإبلاغ عن خطأ في حاسبة، أو قرار رسمي جديد، أو لاقتراح أداة. نرد بالعربية أو الإنجليزية خلال 24 ساعة في أيام العمل.",
  alternates: { canonical: "/contact" },
};

const TOPICS = [
  {
    title: "خطأ في نتيجة حاسبة",
    text: "أرسل رابط الأداة، والأرقام التي أدخلتها، والرقم الذي توقعته ومن أين جاء. هذه البلاغات نبدأ بها دائماً.",
  },
  {
    title: "نسبة أو موعد تغيّر رسمياً",
    text: "قرار جديد من التأمينات الاجتماعية أو زاتكا أو وزارة الموارد البشرية؟ رابط القرار المنشور يكفي.",
  },
  {
    title: "أداة تحتاجها ولا تجدها",
    text: "اشرح المسألة التي تحسبها اليوم يدوياً، وفي أي دولة، ومن سيستخدم الأداة.",
  },
  {
    title: "شراكة أو إعلان",
    text: "لبرامج المحاسبة ومزودي الفوترة الإلكترونية والشركات العاملة في السعودية والإمارات.",
  },
];

const FAQ = [
  {
    q: "متى أتلقى الرد؟",
    a: "خلال 24 ساعة في أيام العمل عادةً. بلاغات الأخطاء الحسابية تأتي أولاً لأنها تؤثر على كل من يستخدم الأداة.",
  },
  {
    q: "هل نتيجة الحاسبة ملزمة قانونياً؟",
    a: "لا. النتيجة تقدير مبني على النظام المنشور، والمرجع النهائي هو الجهة الرسمية أو عقدك أو الجهة القضائية المختصة.",
  },
  {
    q: "هل تحفظون الأرقام التي أدخلها في الحاسبات؟",
    a: "لا. الحساب يجري في متصفحك ولا يُرسل إلينا. ما تكتبه في رسالتك نستخدمه للرد فقط.",
  },
  {
    q: "هل الأدوات مجانية؟",
    a: "نعم، كل الأدوات مجانية وبدون تسجيل أو حساب.",
  },
  {
    q: "بأي لغة أكتب؟",
    a: "بالعربية أو الإنجليزية، ونرد باللغة نفسها.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": `${SITE_URL}/contact#webpage`,
      url: `${SITE_URL}/contact`,
      name: "تواصل مع فريق Qemlo",
      inLanguage: "ar",
      dateModified: PAGE_UPDATED,
      about: { "@id": SITE_ORG_ID },
      mainEntity: {
        "@id": SITE_ORG_ID,
        "@type": "Organization",
        email: CONTACT_EMAIL,
        founder: founderSchema(SITE_URL),
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: CONTACT_EMAIL,
            telephone: "+923131700400",
            availableLanguage: ["ar", "en"],
          },
        ],
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/contact#faq`,
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
        { "@type": "ListItem", position: 2, name: "تواصل معنا", item: `${SITE_URL}/contact` },
      ],
    },
  ],
};

const h2Cls = "q-serif m-0 text-[28px] font-bold leading-[1.5] sm:text-[34px]";
const sideCol = "min-w-0 md:w-[30%] md:flex-none";

export default function ContactPage() {
  const latest = getLatestChange();

  return (
    <div className={`${editorialFontClass} bg-[var(--bg)] text-[var(--text)]`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="mx-auto max-w-[1180px] px-5 pt-5 sm:px-7">
        <nav aria-label="مسار التنقل" className="flex gap-2 text-[13px] text-[var(--text-2)]">
          <Link href="/" className="text-[var(--text-2)] hover:text-[var(--text)]">الرئيسية</Link>
          <span aria-hidden="true">‹</span>
          <span>تواصل معنا</span>
        </nav>

        {/* Hero */}
        <section className="mt-7 flex flex-col gap-12 md:mt-14 md:flex-row md:items-end md:gap-[72px]">
          <div className="order-2 min-w-0 md:order-1 md:flex-1">
            <p className="mb-3.5 text-sm font-bold text-[var(--accent-text)]">تواصل</p>
            <h1 className="q-serif m-0 text-[40px] font-bold leading-[1.35] [text-wrap:balance] md:text-[56px]">
              وجدت رقماً لا يبدو صحيحاً؟ اكتب لنا.
            </h1>
            <p className="mt-6 max-w-[620px] text-[17px] leading-[2] text-[var(--text-2)] [text-wrap:pretty] sm:text-[19px]">
              Qemlo فريق صغير يبني حاسبات عربية للسعودية والإمارات. أسرع طريق إلينا هو البريد أو النموذج أسفل الصفحة، ونرد بالعربية أو الإنجليزية خلال 24 ساعة في أيام العمل. كل بلاغ عن خطأ حسابي نراجعه مقابل المصدر الرسمي قبل أن نرد.
            </p>
          </div>

          <div className="order-1 min-w-0 rounded border border-[var(--border)] border-t-[3px] border-t-[var(--orange)] bg-[var(--surface)] px-6 pb-5 pt-6 shadow-[0_18px_40px_-24px_rgba(13,13,13,0.25)] md:order-2 md:w-[380px] md:flex-none">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <p className="m-0 text-sm font-semibold text-[var(--text-2)]">راسلنا مباشرة</p>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-[13px] font-semibold">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--success)]" />
                نرد خلال 24 ساعة
              </span>
            </div>
            <div className="mt-4 text-right">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                dir="ltr"
                className="q-mono inline-block break-all border-b-2 border-[var(--orange)] pb-0.5 text-[24px] font-medium text-[var(--text)] no-underline sm:text-[27px]"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="mt-3.5 flex items-center gap-2.5 text-[15px] text-[var(--text)] no-underline">
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" className="flex-none">
                <path fill="#25D366" d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.3 21.7l4.8-1.3A9.8 9.8 0 1 0 12 2.2z" />
                <path fill="#FFFFFF" d="M9.1 7.1c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.9 4.5 3.9 2.2.9 2.7.7 3.1.7.5 0 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.5-1.4-1.8-.2-.3 0-.4.1-.5l.4-.4.2-.4v-.4l-.9-2.2z" />
              </svg>
              <span>أو على واتساب:</span>
              <span dir="ltr" className="q-mono border-b border-[var(--border)]">{WHATSAPP_DISPLAY}</span>
            </a>
            <div className="mt-5 flex gap-2.5">
              <CopyEmailButton email={CONTACT_EMAIL} />
              <a href="#contact-form" className="inline-flex min-h-[46px] flex-1 basis-0 items-center justify-center rounded-[10px] border border-[var(--border)] px-3.5 text-[15px] font-semibold text-[var(--text)] no-underline">
                استخدم النموذج ↓
              </a>
            </div>
            <div className="mt-5 flex items-start gap-2.5 border-t border-dashed border-[var(--border)] pt-4">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 flex-none">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <p className="m-0 text-sm leading-[1.9] text-[var(--text-2)]">
                يقرأ كل رسالة شخص من الفريق. لا نطلب أبداً رقم هويتك أو بياناتك البنكية.
              </p>
            </div>
          </div>
        </section>

        {/* Latest update strip */}
        <section aria-label="آخر تحديث" className="mt-14 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-y border-[var(--border)] py-4 text-[15px] leading-[1.9]">
          <span className="text-[13px] font-bold text-[var(--accent-text)]">آخر تحديث لأدواتنا</span>
          <span className="min-w-0 flex-1 basis-[300px]">
            <strong>{latest.title} — {COUNTRY_LABELS[latest.country]}.</strong>{" "}
            <time dateTime={latest.date} className="q-mono text-[13px] text-[var(--text-2)]">{formatArabicDate(latest.date)}</time>
          </span>
          <Link href="/changelog" className="font-semibold text-[var(--accent-text)]">سجل التحديثات كاملاً ←</Link>
        </section>

        {/* Topics */}
        <section aria-labelledby="topics" className="mt-20 flex flex-col gap-8 md:mt-[104px] md:flex-row md:gap-[72px]">
          <div className={sideCol}>
            <h2 id="topics" className={h2Cls}>بماذا نستطيع مساعدتك؟</h2>
            <p className="mt-3 text-base leading-[1.9] text-[var(--text-2)]">اكتب السبب في عنوان رسالتك؛ هذا وحده يختصر وقت الرد.</p>
          </div>
          <ol className="m-0 min-w-0 flex-1 list-none border-t border-[var(--border)] p-0">
            {TOPICS.map((t, i) => (
              <li key={t.title} className="flex flex-wrap items-baseline gap-x-8 gap-y-2 border-b border-[var(--border)] py-6">
                <span className="q-mono w-8 text-sm text-[var(--accent-text)]">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1 basis-[300px]">
                  <h3 className="m-0 text-[21px] font-bold">{t.title}</h3>
                  <p className="mt-1.5 text-base leading-[1.9] text-[var(--text-2)]">{t.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Form + sample report */}
        <section id="contact-form" aria-labelledby="form-title" className="mt-20 flex scroll-mt-24 flex-col gap-12 md:mt-[104px] md:flex-row md:items-start md:gap-16">
          <div className="min-w-0 flex-1">
            <h2 id="form-title" className={h2Cls}>أرسل رسالتك</h2>
            <ContactForm />
          </div>
          <aside aria-labelledby="sample" className="min-w-0 rounded border border-[var(--border)] bg-[var(--surface)] px-7 py-8 shadow-[0_18px_40px_-24px_rgba(13,13,13,0.25)] md:w-[380px] md:flex-none">
            <p id="sample" className="m-0 text-[13px] font-bold text-[var(--accent-text)]">مثال على بلاغ يُحل بسرعة</p>
            <div className="mt-4 text-base leading-[2.1]">
              <p className="m-0"><strong>الموضوع:</strong> خطأ في نتيجة حاسبة</p>
              <p className="m-0"><strong>الأداة:</strong> حاسبة المخالصة النهائية — السعودية</p>
              <p className="m-0"><strong>ما أدخلته:</strong> راتب أساسي 8,000 ريال، خدمة 6 سنوات و3 أشهر، السبب: استقالة.</p>
              <p className="m-0"><strong>ما توقعته:</strong> ثلثا المكافأة، لأن الخدمة بين 5 و10 سنوات وفق المادة 85 من نظام العمل.</p>
              <p className="m-0"><strong>ما ظهر لي:</strong> الرقم الذي عرضته الأداة.</p>
            </div>
            <p className="mt-5 border-t border-dashed border-[var(--border)] pt-4 text-sm leading-[1.9] text-[var(--text-2)]">
              بلاغ بهذا الشكل نتحقق منه في دقائق بدل أيام.
            </p>
          </aside>
        </section>

        {/* What happens next + founder */}
        <section aria-labelledby="after" className="mt-20 border-y border-[var(--border)] py-12 md:mt-[104px]">
          <h2 id="after" className="m-0 text-[15px] font-bold text-[var(--text-2)]">ماذا يحدث بعد أن ترسل؟</h2>
          <p className="q-serif mt-3.5 max-w-[900px] text-[22px] font-semibold leading-[1.9] [text-wrap:pretty] sm:text-[28px]">
            نقرأ رسالتك، ثم نقارنها بالنظام أو القرار المنشور لدى الجهة المختصة، ثم نرد عليك. وإن كان الخطأ عندنا نصلح الأداة ونسجّل التصحيح بتاريخه في{" "}
            <Link href="/changelog" className="text-[var(--accent-text)] underline decoration-1 underline-offset-[6px]">سجل التحديثات</Link>.
          </p>
          <div className="mt-7 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG avatar */}
            <img src={FOUNDER.avatar} alt="" width={60} height={60} className="h-[60px] w-[60px] flex-none rounded-full" />
            <div>
              <p className="m-0 text-[17px] font-bold">{FOUNDER.nameAr}</p>
              <p className="mt-0.5 text-sm leading-[1.8] text-[var(--text-2)]">مؤسس Qemlo — يقرأ كل بلاغ ويراجعه بنفسه</p>
            </div>
          </div>
        </section>

        {/* Limits + sources */}
        <section className="mt-[72px] grid gap-12 md:grid-cols-2 md:gap-[72px]">
          <div>
            <h2 className="m-0 text-[22px] font-bold">ما لا نستطيع فعله</h2>
            <ul className="mt-4 list-disc ps-5 text-base leading-[2.1] text-[var(--text-2)]">
              <li>تقديم استشارة قانونية أو مالية أو شرعية لحالتك بعينها.</li>
              <li>مخاطبة جهة عملك أو أي جهة حكومية نيابة عنك.</li>
              <li>اعتماد نتيجة الحاسبة كوثيقة رسمية؛ هي تقدير للتوعية.</li>
            </ul>
          </div>
          <div>
            <h2 className="m-0 text-[22px] font-bold">على ماذا نراجع أدواتنا</h2>
            <p className="mt-4 text-base leading-[2.1] text-[var(--text-2)]">
              في السعودية: وزارة الموارد البشرية والتنمية الاجتماعية، والمؤسسة العامة للتأمينات الاجتماعية، وهيئة الزكاة والضريبة والجمارك. في الإمارات: وزارة الموارد البشرية والتوطين، والهيئة الاتحادية للضرائب، ووزارة المالية. تذكر صفحة كل أداة مصدرها الرسمي.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq" className="mt-20 flex flex-col gap-8 md:mt-[104px] md:flex-row md:gap-[72px]">
          <div className={sideCol}>
            <h2 id="faq" className={h2Cls}>أسئلة قبل أن تكتب</h2>
          </div>
          <dl className="m-0 min-w-0 flex-1 border-t border-[var(--border)]">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border-b border-[var(--border)] py-[22px]">
                <dt className="text-[19px] font-bold">{q}</dt>
                <dd className="mt-2 text-base leading-[1.9] text-[var(--text-2)]">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-16 pb-16 text-sm text-[var(--text-2)]">
          آخر تحديث للصفحة: <time dateTime={PAGE_UPDATED}>{formatArabicDate(PAGE_UPDATED)}</time>
        </p>

        {/* Mobile sticky contact */}
        <div className="sticky bottom-0 z-20 -mx-5 border-t border-[var(--border)] bg-[var(--bg)] px-4 py-3 md:hidden">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex min-h-[52px] items-center justify-center rounded-xl bg-[var(--orange)] text-[17px] font-bold text-[var(--on-orange)] no-underline"
          >
            راسلنا الآن
          </a>
        </div>
      </main>
    </div>
  );
}
