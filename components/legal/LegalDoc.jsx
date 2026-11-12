/**
 * components/legal/LegalDoc.jsx — shared editorial layout for Privacy, Terms
 * and Disclaimer (same family as About / Contact / Guides).
 * Server component; colours come from the site tokens so dark mode follows
 * the theme toggle.
 */
import Link from "next/link";
import { editorialFontClass } from "@/lib/editorialFonts";

const CSS = `
.lg{background:var(--bg);color:var(--text)}
.lg-main{max-width:1120px;margin:0 auto;padding:20px 20px 72px}
.lg-crumb{display:flex;gap:8px;font-size:13px;color:var(--text-2)}
.lg-crumb a{color:var(--text-2);text-decoration:none}
.lg-crumb a:hover{color:var(--text)}
.lg-head{margin-top:36px;max-width:720px}
.lg-eyebrow{margin:0 0 12px;font-size:14px;font-weight:700;color:var(--accent-text)}
.lg-h1{margin:0;font-size:40px;line-height:1.35;font-weight:700}
.lg-lede{margin:18px 0 0;font-size:17px;line-height:2;color:var(--text-2)}
.lg-meta{margin-top:18px;display:flex;flex-wrap:wrap;gap:8px 18px;font-size:13px;color:var(--text-2)}
.lg-meta b{color:var(--text);font-weight:700}
.lg-sum{margin-top:28px;max-width:720px;border:1px solid var(--border);border-top:3px solid var(--orange);background:var(--surface);border-radius:6px;padding:18px 20px}
.lg-sum h2{margin:0 0 10px;font-size:15px;font-weight:800}
.lg-sum ul{margin:0;padding:0;list-style:none;display:grid;gap:8px}
.lg-sum li{position:relative;padding-inline-start:20px;font-size:15px;line-height:1.85;color:var(--text-2)}
.lg-sum li::before{content:"";position:absolute;inset-inline-start:2px;top:.8em;width:7px;height:7px;border-radius:2px;background:var(--orange)}
.lg-grid{margin-top:40px;display:grid;gap:32px}
.lg-toc{border:1px solid var(--border);border-radius:6px;padding:14px 16px;background:var(--surface)}
.lg-toc p{margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:.02em;color:var(--text-2)}
.lg-toc ol{margin:0;padding:0;list-style:none;display:grid;gap:2px;counter-reset:t}
.lg-toc a{display:flex;gap:10px;padding:6px 4px;border-radius:4px;font-size:14px;line-height:1.6;color:var(--text);text-decoration:none}
.lg-toc a:hover{background:var(--bg)}
.lg-toc a span{color:var(--text-2);font-family:var(--font-qmono),ui-monospace,monospace;font-size:12px;min-width:20px;padding-top:2px}
.lg-body{min-width:0;max-width:720px}
.lg-sec{padding:28px 0;border-top:1px solid var(--border);scroll-margin-top:96px}
.lg-sec:first-child{border-top:0;padding-top:0}
.lg-sec h2{margin:0 0 14px;display:flex;align-items:baseline;gap:12px;font-size:24px;line-height:1.5;font-weight:700}
.lg-sec h2 .n{flex:none;font-family:var(--font-qmono),ui-monospace,monospace;font-size:14px;font-weight:500;color:var(--accent-text)}
.lg-sec p{margin:0 0 14px;font-size:17px;line-height:2;color:var(--text-2)}
.lg-sec p:last-child{margin-bottom:0}
.lg-sec strong{color:var(--text)}
.lg-sec ul{margin:0;padding:0;list-style:none;display:grid;gap:10px}
.lg-sec li{position:relative;padding-inline-start:22px;font-size:16px;line-height:1.95;color:var(--text-2)}
.lg-sec li::before{content:"—";position:absolute;inset-inline-start:0;color:var(--text-3)}
.lg-sec a{color:var(--accent-text);font-weight:700;text-decoration:underline;text-underline-offset:3px}
.lg-note{margin-top:14px;border-inline-start:3px solid var(--orange);background:var(--surface);padding:12px 16px;border-radius:0 6px 6px 0}
.lg-note p{font-size:15px;line-height:1.9}
.lg-foot{margin-top:40px;max-width:720px;display:flex;flex-wrap:wrap;gap:10px}
.lg-foot a{border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:999px;padding:8px 14px;font-size:14px;text-decoration:none}
.lg-foot a:hover{border-color:var(--text-2)}
@media (min-width:900px){
  .lg-main{padding:28px 28px 96px}
  .lg-head{margin-top:56px}
  .lg-h1{font-size:54px}
  .lg-lede{font-size:19px}
  .lg-grid{grid-template-columns:260px minmax(0,1fr);gap:64px;align-items:start}
  .lg-toc{position:sticky;top:96px;border:0;background:transparent;padding:0}
}
`;

/**
 * @param {{ eyebrow:string, title:string, lede:string, updated:string,
 *   summary?:string[], sections:{id:string,title:string,body:import("react").ReactNode}[],
 *   crumb:string, jsonLd?:object }} props
 */
export default function LegalDoc({ eyebrow, title, lede, updated, summary, sections, crumb, jsonLd }) {
  return (
    <div className={`lg ${editorialFontClass}`}>
      <style>{CSS}</style>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <main className="lg-main">
        <nav aria-label="مسار التنقل" className="lg-crumb">
          <Link href="/">الرئيسية</Link>
          <span aria-hidden="true">‹</span>
          <span>{crumb}</span>
        </nav>

        <header className="lg-head">
          <p className="lg-eyebrow">{eyebrow}</p>
          <h1 className="lg-h1 q-serif">{title}</h1>
          <p className="lg-lede">{lede}</p>
          <div className="lg-meta">
            <span>آخر تحديث: <b>{updated}</b></span>
            <span>للاستفسار: <a href="mailto:contact@qemlo.com" style={{ color: "var(--accent-text)", fontWeight: 700 }}>contact@qemlo.com</a></span>
          </div>
        </header>

        {summary?.length ? (
          <aside className="lg-sum" aria-labelledby="lg-sum-title">
            <h2 id="lg-sum-title">باختصار</h2>
            <ul>{summary.map((s) => <li key={s}>{s}</li>)}</ul>
          </aside>
        ) : null}

        <div className="lg-grid">
          <nav className="lg-toc" aria-label="محتويات الصفحة">
            <p>المحتويات</p>
            <ol>
              {sections.map((s, i) => (
                <li key={s.id}><a href={`#${s.id}`}><span>{String(i + 1).padStart(2, "0")}</span>{s.title}</a></li>
              ))}
            </ol>
          </nav>

          <div className="lg-body">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="lg-sec" aria-labelledby={`${s.id}-h`}>
                <h2 id={`${s.id}-h`} className="q-serif"><span className="n">{String(i + 1).padStart(2, "0")}</span>{s.title}</h2>
                {s.body}
              </section>
            ))}
          </div>
        </div>

        <nav className="lg-foot" aria-label="صفحات قانونية أخرى">
          <Link href="/privacy">سياسة الخصوصية</Link>
          <Link href="/terms">شروط الاستخدام</Link>
          <Link href="/disclaimer">إخلاء المسؤولية</Link>
          <Link href="/about">من نحن</Link>
          <Link href="/contact">تواصل معنا</Link>
        </nav>
      </main>
    </div>
  );
}
