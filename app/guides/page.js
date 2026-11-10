import Link from "next/link";
import { SITE_URL } from "@/lib/siteConfig";
import { editorialFontClass } from "@/lib/editorialFonts";
import { GUIDES } from "@/lib/guides";
import { formatArabicDate } from "@/lib/changelog";

export const metadata = {
  title: "الأدلة — شروحات عملية بالأرقام للسعودية والإمارات",
  description:
    "أدلة Qemlo: شروحات عربية عملية تجمع ما قررته الجهات الرسمية في السعودية والإمارات بالأرقام والمصادر، مع أمثلة محسوبة وروابط للحاسبات.",
  alternates: { canonical: "/guides" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  url: `${SITE_URL}/guides`,
  name: "أدلة Qemlo",
  inLanguage: "ar",
  hasPart: GUIDES.map((g) => ({ "@type": "Article", headline: g.title, url: `${SITE_URL}${g.href}`, dateModified: g.updated })),
};

export default function GuidesIndex() {
  return (
    <div className={`${editorialFontClass} bg-[var(--guide-bg)] text-[var(--text)]`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="mx-auto max-w-[1120px] px-5 pb-20 pt-10 sm:px-7 md:pt-14">
        <p className="mb-3.5 text-sm font-bold text-[var(--guide-green)]">الأدلة</p>
        <h1 className="q-serif m-0 max-w-[760px] text-[36px] font-bold leading-[1.4] [text-wrap:balance] md:text-[52px]">
          شروحات عملية، بالأرقام والمصادر.
        </h1>
        <p className="mt-5 max-w-[620px] text-[17px] leading-[2] text-[var(--text-2)] sm:text-[19px]">
          كل دليل يجمع ما قررته الجهة الرسمية في السعودية والإمارات، ويحسبه بمثال، ويذكر مصدره. نحدّث الدليل حين يتغيّر الرقم ونسجّل ذلك في سجل التحديثات.
        </p>
        <ul className="m-0 mt-12 list-none border-t border-[var(--guide-line)] p-0">
          {GUIDES.map((g) => (
            <li key={g.slug} className="border-b border-[var(--guide-line)] py-7">
              <p className="m-0 text-[13px] font-bold text-[var(--guide-green)]">{g.kicker}</p>
              <h2 className="q-serif m-0 mt-1.5 text-[24px] font-bold leading-[1.6] sm:text-[30px]">
                <Link href={g.href} className="text-[var(--text)] no-underline hover:underline">{g.title}</Link>
              </h2>
              <p className="mt-2 max-w-[680px] text-base leading-[1.95] text-[var(--text-2)]">{g.summary}</p>
              <p className="mt-2 text-[13px] text-[var(--text-2)]">
                حُدّث في <time dateTime={g.updated}>{formatArabicDate(g.updated)}</time> · {g.minutes} دقائق قراءة
              </p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
