/**
 * components/business/RelatedBusinessTools.jsx
 * Ink & Signal: related tools grid for business/tax tool pages.
 * Server-safe (no "use client").
 *
 * Props (unchanged): tools, title?, subtitle?, className?
 * Each tool: { href, icon, title, desc, badge, badgeColor, cta? }
 * Note: `icon` and `badgeColor` are accepted but ignored (no emoji / no color-coding).
 */
import Link from "next/link";

export default function RelatedBusinessTools({
  tools = [],
  title = "أدوات ذات صلة",
  subtitle = "",
  className = "",
}) {
  if (!tools.length) return null;

  return (
    <section className={`rt-box ${className}`} dir="rtl" aria-labelledby="rt-title">
      <RelatedToolsStyles />
      <header className="rt-head">
        <h2 id="rt-title" className="rt-title">{title}</h2>
        {subtitle && <p className="rt-sub">{subtitle}</p>}
      </header>

      <ul className="rt-grid">
        {tools.map((tool, i) => (
          <li key={tool.href} className="rt-cell">
            <Link href={tool.href} className="rt-card">
              <span className="rt-num" aria-hidden="true">{i + 1}</span>
              <span className="rt-main">
                <span className="rt-row">
                  <span className="rt-name">{tool.title}</span>
                  {tool.badge && <span className="rt-badge">{tool.badge}</span>}
                </span>
                <span className="rt-desc">{tool.desc}</span>
                {tool.cta && <span className="rt-cta">{tool.cta}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Local styles. Map the --rt-* fallbacks to your real Ink & Signal tokens.
 */
function RelatedToolsStyles() {
  return (
    <style>{`
      .rt-box{
        --rt-ink:#0a0a0a; --rt-paper:#ffffff; --rt-text2:#404040; --rt-orange:#ff5a1f;
        border:2px solid var(--rt-ink); background:var(--rt-paper);
        color:var(--rt-ink);
      }
      @media (prefers-color-scheme: dark){
        :root:not([data-theme="light"]) .rt-box{
          --rt-ink:#f5f5f5; --rt-paper:#0a0a0a; --rt-text2:#d4d4d4;
        }
      }
      :root[data-theme="dark"] .rt-box{
        --rt-ink:#f5f5f5; --rt-paper:#0a0a0a; --rt-text2:#d4d4d4;
      }

      .rt-head{ padding:1rem 1.25rem; border-bottom:2px solid var(--rt-ink); }
      .rt-title{ margin:0; font-size:1.125rem; font-weight:800; }
      .rt-sub{ margin:.25rem 0 0; font-size:.75rem; color:var(--rt-text2); }

      .rt-grid{
        list-style:none; margin:0; padding:0;
        display:grid; grid-template-columns:1fr;
      }
      .rt-cell{ border-bottom:1px solid var(--rt-ink); }
      .rt-cell:last-child{ border-bottom:0; }

      .rt-card{
        display:flex; gap:.75rem; align-items:flex-start; height:100%;
        padding:1rem 1.25rem; color:inherit; text-decoration:none;
      }
      .rt-card:hover{ background:var(--rt-orange); color:#0a0a0a; }
      .rt-card:hover .rt-desc,
      .rt-card:hover .rt-name{ color:#0a0a0a; }
      .rt-card:hover .rt-num,
      .rt-card:hover .rt-badge{ border-color:#0a0a0a; color:#0a0a0a; }
      .rt-card:focus-visible{ outline:3px solid var(--rt-orange); outline-offset:-3px; }

      .rt-num{
        flex:none; width:1.75rem; height:1.75rem; display:inline-flex;
        align-items:center; justify-content:center;
        border:2px solid var(--rt-ink); font-weight:800; font-size:.8125rem;
      }
      .rt-main{ display:flex; flex-direction:column; gap:.25rem; min-width:0; }
      .rt-row{ display:flex; flex-wrap:wrap; align-items:center; gap:.5rem; }
      .rt-name{
        font-weight:800; font-size:.875rem;
        text-decoration:underline; text-underline-offset:3px;
        text-decoration-thickness:1px;
      }
      .rt-card:hover .rt-name{ text-decoration-thickness:2px; }
      .rt-badge{
        border:1px solid var(--rt-ink); padding:0 .375rem;
        font-size:.625rem; font-weight:800; line-height:1.5;
      }
      .rt-desc{ font-size:.75rem; line-height:1.7; color:var(--rt-text2); }
      .rt-cta{
        align-self:flex-start; font-size:.75rem; font-weight:800;
        border-bottom:3px solid var(--rt-orange);
      }
      .rt-card:hover .rt-cta{ border-bottom-color:#0a0a0a; }

      @media (min-width:640px){
        .rt-grid{ grid-template-columns:1fr 1fr; }
        .rt-cell:nth-child(odd){ border-inline-end:1px solid var(--rt-ink); }
        .rt-cell:nth-last-child(-n+2):nth-child(odd),
        .rt-cell:last-child{ border-bottom:0; }
        .rt-cell:nth-last-child(2):nth-child(odd){ border-bottom:0; }
      }

      @media print{
        .rt-box{ border-color:#000; color:#000; }
        .rt-card:hover{ background:none; }
      }
    `}</style>
  );
}