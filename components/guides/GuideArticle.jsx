import Link from "next/link";
import { SITE_URL, SITE_ORG_ID } from "@/lib/siteConfig";
import { editorialFontClass } from "@/lib/editorialFonts";
import { formatArabicDate } from "@/lib/changelog";

/**
 * components/guides/GuideArticle.jsx
 *
 * Data-driven renderer for long-form guides, matching the design of
 * /guides/zakat-al-fitr-2027 (warm paper theme, hero band with answer card,
 * single reading column with side notes, numbered sources).
 *
 * Inline text mini-markup (in any string field):
 *   **bold**          → <strong>
 *   [^2]              → superscript link to source 2
 *   [label](/path)    → internal link
 *   `123`             → monospace number
 */

const green = "text-[var(--guide-green)]";
const pCls = "mt-4 text-[17px] leading-[2.15] [text-wrap:pretty] sm:text-[18px]";

const TOKEN = /(\*\*[^*]+\*\*|\[\^\d+\]|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g;

export function Rich({ text }) {
  if (!text) return null;
  const parts = String(text).split(TOKEN).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("[^")) {
      const n = part.slice(2, -1);
      return (
        <sup key={i} className={`font-bold ${green}`}>
          <a href="#sources" className="text-inherit no-underline" aria-label={`المصدر ${n}`}>{n}</a>
        </sup>
      );
    }
    if (part.startsWith("`")) return <span key={i} className="q-mono">{part.slice(1, -1)}</span>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <Link key={i} href={link[2]} className="font-semibold text-[var(--accent-text)] underline decoration-1 underline-offset-4">
          {link[1]}
        </Link>
      );
    }
    return part;
  });
}

function Block({ b }) {
  switch (b.type) {
    case "p":
      return <p className={`${pCls} ${b.muted ? "text-[var(--text-2)]" : ""}`}><Rich text={b.text} /></p>;
    case "callout":
      return (
        <div className="mt-6 rounded-md bg-[var(--guide-band)] px-5 py-[18px]">
          <p className={`m-0 text-[13px] font-bold ${green}`}>{b.title}</p>
          <p className="m-0 mt-1.5 text-[17px] leading-[2]"><Rich text={b.text} /></p>
        </div>
      );
    case "quote":
      return (
        <blockquote className="m-0 mt-8 border-r-[3px] border-[var(--guide-green)] py-1 pr-[22px]">
          <p className="q-serif m-0 text-[20px] font-semibold leading-[2] md:text-[23px]"><Rich text={b.text} /></p>
          {b.cite && <footer className="mt-2 text-sm text-[var(--text-2)]">{b.cite}</footer>}
        </blockquote>
      );
    case "list":
      return (
        <ul className="mt-4 list-disc space-y-2 ps-6 text-[17px] leading-[2] marker:text-[var(--guide-green)]">
          {b.items.map((it) => <li key={it}><Rich text={it} /></li>)}
        </ul>
      );
    case "steps":
      return (
        <ol className="m-0 mt-5 list-none border-t border-[var(--guide-line)] p-0">
          {b.items.map((it, i) => (
            <li key={it.title} className="flex gap-4 border-b border-[var(--guide-line)] py-[18px]">
              <span className={`q-mono flex-none pt-1 text-sm ${green}`}>{String(i + 1).padStart(2, "0")}</span>
              <p className="m-0 text-[17px] leading-[1.95]"><strong>{it.title}</strong> <span className="text-[var(--text-2)]"><Rich text={it.text} /></span></p>
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-[15px] sm:text-base">
            {b.caption && <caption className="mb-2 text-start text-sm text-[var(--text-2)]">{b.caption}</caption>}
            <thead>
              <tr className="border-b-2 border-[var(--guide-green)] text-[13px] text-[var(--text-2)]">
                {b.head.map((h) => <th key={h} scope="col" className="px-2.5 py-2 text-start">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, r) => (
                <tr key={r} className={`border-b border-[var(--guide-line)] ${b.highlight === r ? "bg-[var(--guide-band)]" : ""}`}>
                  {row.map((cell, c) =>
                    c === 0 ? (
                      <th key={c} scope="row" className="px-2.5 py-[11px] text-start font-semibold"><Rich text={cell} /></th>
                    ) : (
                      <td key={c} className="px-2.5 py-[11px] leading-[1.8]"><Rich text={cell} /></td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "calc":
      return (
        <div className="mt-6 overflow-hidden rounded-[10px] border border-[var(--guide-line)] bg-[var(--surface)]">
          <p className="m-0 border-b border-[var(--guide-line)] px-5 py-3 text-[15px] font-bold">{b.title}</p>
          <dl className="m-0 px-5 py-2">
            {b.rows.map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-dashed border-[var(--guide-line)] py-2.5 last:border-0">
                <dt className="text-[15px] text-[var(--text-2)]"><Rich text={k} /></dt>
                <dd dir="ltr" className="q-mono m-0 text-[15px]">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="m-0 bg-[var(--guide-band)] px-5 py-3.5 text-[16px] leading-[1.9]"><Rich text={b.result} /></p>
        </div>
      );
    case "timeline":
      return (
        <ol className="m-0 mt-7 list-none border-r-2 border-[var(--guide-line)] p-0">
          {b.items.map((t) => (
            <li key={t.when} className="relative pb-[26px] pr-[26px] last:pb-0">
              <span
                aria-hidden="true"
                className={`absolute -right-[7px] top-2 h-3 w-3 rounded-full border-2 ${t.hot ? "border-[var(--orange)] bg-[var(--orange)]" : "border-[var(--guide-green)] bg-[var(--guide-bg)]"}`}
              />
              <p className={`q-mono m-0 text-[13px] font-bold ${t.hot ? "text-[var(--accent-text)]" : green}`}>{t.when}</p>
              <p className="m-0 mt-1 text-[17px] leading-[1.95]"><Rich text={t.text} /></p>
            </li>
          ))}
        </ol>
      );
    case "cta":
      return (
        <Link
          href={b.href}
          className="mt-6 flex flex-wrap items-center justify-between gap-2.5 rounded-xl bg-[var(--orange)] px-[22px] py-[18px] text-[var(--on-orange)] no-underline"
        >
          <span>
            <strong className="text-lg">{b.title}</strong>
            {b.sub && <span className="block text-sm">{b.sub}</span>}
          </span>
          <span className="text-[17px] font-bold">{b.label || "احسب الآن"} ←</span>
        </Link>
      );
    case "faq":
      return (
        <dl className="m-0 mt-[18px] border-t border-[var(--guide-line)]">
          {b.items.map(({ q, a }) => (
            <div key={q} className="border-b border-[var(--guide-line)] py-5">
              <dt className="text-lg font-bold leading-[1.7]">{q}</dt>
              <dd className="m-0 mt-2 text-base leading-[2] text-[var(--text-2)]"><Rich text={a} /></dd>
            </div>
          ))}
        </dl>
      );
    default:
      return null;
  }
}

function Section({ s }) {
  return (
    <section id={s.id} aria-labelledby={`${s.id}-h`} className="mt-14 scroll-mt-24 flex flex-col gap-6 md:mt-20 md:flex-row md:items-start md:gap-16">
      <div className="min-w-0 md:max-w-[700px] md:flex-1">
        {s.kicker && <p className={`q-mono m-0 mb-1.5 text-[13px] ${green}`}>{s.kicker}</p>}
        <h2 id={`${s.id}-h`} className="q-serif m-0 text-[26px] font-bold leading-[1.5] md:text-[32px]">{s.title}</h2>
        {s.blocks.map((b, i) => <Block key={i} b={b} />)}
      </div>
      {s.note ? (
        <aside className="min-w-0 border-t border-[var(--guide-line)] pt-1.5 text-sm leading-[1.95] text-[var(--text-2)] md:w-[280px] md:flex-none">
          {s.note.title && <strong className="text-[var(--text)]">{s.note.title} </strong>}
          <Rich text={s.note.text} />
        </aside>
      ) : (
        <div className="hidden md:block md:w-[280px] md:flex-none" />
      )}
    </section>
  );
}

export function guideMetadata(g) {
  return {
    title: g.seoTitle,
    description: g.description,
    alternates: { canonical: g.href },
    openGraph: { title: g.title, description: g.lead, url: `${SITE_URL}${g.href}`, type: "article", locale: g.locale || "ar_SA" },
  };
}

export function guideJsonLd(g) {
  const plain = (t) => String(t).replace(/\*\*|`|\[\^\d+\]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${SITE_URL}${g.href}#article`,
        headline: g.title,
        description: g.description,
        inLanguage: "ar",
        datePublished: g.published,
        dateModified: g.updated,
        mainEntityOfPage: `${SITE_URL}${g.href}`,
        author: { "@type": "Person", name: "محمد أحمد", alternateName: "Muhammad Ahmad", url: `${SITE_URL}/about` },
        publisher: { "@id": SITE_ORG_ID },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}${g.href}#faq`,
        mainEntity: g.faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: plain(a) } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "الأدلة", item: `${SITE_URL}/guides` },
          { "@type": "ListItem", position: 3, name: g.crumb, item: `${SITE_URL}${g.href}` },
        ],
      },
    ],
  };
}

export default function GuideArticle({ g }) {
  return (
    <div className={`${editorialFontClass} bg-[var(--guide-bg)] text-[var(--text)]`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd(g)) }} />

      <div className="relative overflow-hidden border-b border-[var(--guide-line)] bg-[var(--guide-band)]">
        <svg aria-hidden="true" width="100%" height="100%" className="absolute inset-0 opacity-[0.12]">
          <defs>
            <pattern id="qstar" width="72" height="72" patternUnits="userSpaceOnUse">
              <g fill="none" stroke="var(--guide-green)" strokeWidth="1">
                <rect x="16" y="16" width="40" height="40" />
                <rect x="16" y="16" width="40" height="40" transform="rotate(45 36 36)" />
                <circle cx="36" cy="36" r="7" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#qstar)" />
        </svg>

        <div className="relative mx-auto max-w-[1120px] px-5 pb-9 pt-5 sm:px-7 md:pb-14 md:pt-6">
          <nav aria-label="مسار التنقل" className="flex flex-wrap gap-2 text-[13px] text-[var(--text-2)]">
            <Link href="/" className="text-[var(--text-2)]">الرئيسية</Link>
            <span aria-hidden="true">‹</span>
            <Link href="/guides" className="text-[var(--text-2)]">الأدلة</Link>
            <span aria-hidden="true">‹</span>
            <span>{g.crumb}</span>
          </nav>

          <div className="mt-9 flex flex-col gap-10 md:flex-row md:items-end md:gap-16">
            <div className="min-w-0 md:flex-1">
              <p className={`m-0 mb-3.5 text-sm font-bold ${green}`}>{g.kicker}</p>
              <h1 className="q-serif m-0 text-[32px] font-bold leading-[1.4] [text-wrap:balance] md:text-[50px]">{g.title}</h1>
              <p className="mt-5 max-w-[600px] text-[17px] leading-[2] text-[var(--text-2)] [text-wrap:pretty] sm:text-[19px]">{g.lead}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-[18px] gap-y-2 text-sm text-[var(--text-2)]">
                <span className="inline-flex items-center gap-2.5">
                  <span aria-hidden="true" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--guide-green)] text-xs font-bold text-[var(--guide-band)]">م.أ</span>
                  <span>كتبه <Link href="/about" className="font-bold text-[var(--text)] no-underline">محمد أحمد</Link></span>
                </span>
                <span>حُدّث في <time dateTime={g.updated} className="q-mono text-[var(--text)]">{formatArabicDate(g.updated)}</time></span>
                <span>{g.minutes} دقائق قراءة</span>
              </div>
            </div>

            <div className="min-w-0 overflow-hidden rounded-[14px] border border-[var(--guide-line)] bg-[var(--surface)] shadow-[0_24px_48px_-28px_rgba(31,92,74,0.45)] md:w-[380px] md:flex-none">
              <p className="m-0 bg-[var(--guide-green)] px-[22px] py-3 text-[13px] font-bold text-[var(--guide-band)]">{g.answer.header}</p>
              {g.answer.rows.map((r) => (
                <div key={r.label} className="border-b border-[var(--guide-line)] px-[22px] py-[16px]">
                  <p className="m-0 text-[13px] font-bold text-[var(--text-2)]">{r.label}</p>
                  <p className="q-mono m-0 mt-0.5 text-[30px] leading-[1.3] md:text-[34px]">{r.value}</p>
                  {r.note && <p className="m-0 text-sm text-[var(--text-2)]">{r.note}</p>}
                </div>
              ))}
              {g.answer.footer && <p className="m-0 px-[22px] py-3.5 text-sm leading-[1.8]"><Rich text={g.answer.footer} /></p>}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1120px] px-5 sm:px-7">
        <article>
          {g.notice && (
            <aside role="note" className="mt-10 flex max-w-[700px] items-start gap-3 border-[var(--accent-text)] bg-[var(--guide-band)] px-[18px] py-3.5 text-[15px] leading-[1.9] [border-inline-start-width:3px]">
              <span aria-hidden="true" className="flex-none font-bold text-[var(--accent-text)]">!</span>
              <p className="m-0"><Rich text={g.notice} /></p>
            </aside>
          )}

          {g.sections.map((s) => <Section key={s.id} s={s} />)}

          <Section s={{ id: "faq", title: "أسئلة شائعة", blocks: [{ type: "faq", items: g.faq }] }} />

          <section id="sources" aria-labelledby="sources-title" className="mt-14 max-w-[700px] scroll-mt-24 border-t-2 border-[var(--guide-green)] pt-[26px] md:mt-20">
            <h2 id="sources-title" className={`m-0 text-[15px] font-bold ${green}`}>المصادر</h2>
            <ol className="mt-3 list-decimal ps-[22px] text-sm leading-[2.05] text-[var(--text-2)]">
              {g.sources.map((s) => (
                <li key={s.label}>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[var(--text-2)] underline decoration-[var(--guide-line)] underline-offset-4">{s.label}</a>
                  ) : (
                    s.label
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-[18px] text-sm leading-[1.95] text-[var(--text-2)]">
              هذا الدليل للتوعية وليس استشارة قانونية أو ضريبية. وجدت خطأ أو رقماً تغيّر؟{" "}
              <Link href="/contact" className="font-semibold text-[var(--accent-text)]">اكتب لنا</Link> ونصحّحه ونسجّله في{" "}
              <Link href="/changelog" className="font-semibold text-[var(--accent-text)]">سجل التحديثات</Link>.
            </p>
          </section>
        </article>

        {g.related?.length > 0 && (
          <section className="mt-[72px] border-t border-[var(--guide-line)] pb-14 pt-8">
            <h2 className="m-0 text-[15px] font-bold text-[var(--text-2)]">أدوات وأدلة مرتبطة</h2>
            <div className="mt-2.5 grid gap-x-12 sm:grid-cols-3">
              {g.related.map(([href, label]) => (
                <Link key={href} href={href} className="border-b border-[var(--guide-line)] py-3.5 text-[17px] font-semibold text-[var(--text)] no-underline">
                  {label} ←
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
