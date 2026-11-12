import Script from "next/script";
import { CATEGORIES, getCatalogToolsByCategory, getCatalogToolCount } from "@/lib/registry";
import HomeHero from "@/components/home/HomeHero";
import HomeSeoSections from "@/components/home/HomeSeoSections";
import CategoryBrowseShowcase from "@/components/home/CategoryBrowseShowcase";
import WorldClockSection from "@/components/home/WorldClockSection";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/siteConfig";

export const metadata = {
  title: "Qemlo | حاسبات الرواتب ونهاية الخدمة والضرائب للسعودية والإمارات",
  description:
    "أدوات عربية مجانية: حاسبة مكافأة نهاية الخدمة والمخالصة النهائية وفترة الإنذار وضريبة الشركات والراتب الصافي، إضافة إلى الميراث والكفارات وتكلفة العمرة. بدون تسجيل.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Qemlo | حاسبات الرواتب ونهاية الخدمة والضرائب للسعودية والإمارات",
    description:
      "أدوات عربية مجانية: حاسبة مكافأة نهاية الخدمة والمخالصة النهائية وفترة الإنذار وضريبة الشركات والراتب الصافي، إضافة إلى الميراث والكفارات وتكلفة العمرة. بدون تسجيل.",
    siteName: "Qemlo",
    locale: "ar_AR",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qemlo | حاسبات الرواتب ونهاية الخدمة والضرائب للسعودية والإمارات",
    description:
      "أدوات عربية مجانية: حاسبة مكافأة نهاية الخدمة والمخالصة النهائية وفترة الإنذار وضريبة الشركات والراتب الصافي، إضافة إلى الميراث والكفارات وتكلفة العمرة. بدون تسجيل.",
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F5F2" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0D0D" },
  ],
};

// Ink & Signal tokens: inline, so no separate CSS file is needed
const TOKENS_CSS = `
:root{
  color-scheme:light dark;
  --bg:#F5F5F2; --surface:#FFFFFF; --border:#D4D4CE;
  --text:#0D0D0D; --text-2:#555555; --text-3:#6B6B66;
  --card:#0D0D0D; --card-text:#FFFFFF; --card-muted:#B5B5B0;
  --card-border:#2A2A2A; --card-field:#1A1A1A; --card-field-text:#FFFFFF;
  --tab-hover:rgba(255,255,255,.10);
  --orange:#FF5B04; --orange-hover:#FF7A33; --orange-press:#E64F00; --on-orange:#0D0D0D;
  --success:#137A47; --warning:#8A5A00; --error:#C8321F;
  /* measured by the script: height of the site's sticky header */
  --hd-h:72px;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#0D0D0D; --surface:#161616; --border:#2A2A2A;
    --text:#F5F5F2; --text-2:#B5B5B0; --text-3:#8E8E89;
    --card:#CFCFCA; --card-text:#0D0D0D; --card-muted:#4A4A47;
    --card-border:#A9A9A4; --card-field:#E6E6E1; --card-field-text:#0D0D0D;
    --tab-hover:rgba(13,13,13,.10);
    --success:#4ADE80; --warning:#FBBF24; --error:#FF7A6B;
  }
}
:root[data-theme="dark"]{
  --bg:#0D0D0D; --surface:#161616; --border:#2A2A2A;
  --text:#F5F5F2; --text-2:#B5B5B0; --text-3:#8E8E89;
  --card:#CFCFCA; --card-text:#0D0D0D; --card-muted:#4A4A47;
  --card-border:#A9A9A4; --card-field:#E6E6E1; --card-field-text:#0D0D0D;
  --tab-hover:rgba(13,13,13,.10);
  --success:#4ADE80; --warning:#FBBF24; --error:#FF7A6B;
}
*,*::before,*::after{box-sizing:border-box}
html,body{
  max-width:100%;
  overflow-x:hidden;
  width:100%;
}
.home-root{
  width:100%;
  max-width:100%;
  overflow-x:hidden;
  contain:paint;
}
body{background:var(--bg);color:var(--text)}
.tear{height:12px;background:conic-gradient(from -45deg at bottom,#0000,var(--card) 1deg 90deg,#0000 91deg) 50%/16px 100%}
:focus-visible{outline:2px solid var(--text);outline-offset:3px}
html{scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}

/* Sections land below the site's sticky header */
.cat-sec{scroll-margin-top:calc(var(--hd-h) + 12px)}

/* ── Category strip: NOT sticky, scrolls away with the page ── */
.cat-strip{border-block:1px solid var(--border);background:var(--bg);padding:14px 0;
  width:100%;max-width:100%;box-sizing:border-box;
  position:relative;overflow:hidden;contain:paint}
[data-marquee]{width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;position:relative}
.marquee{display:flex;gap:12px;overflow-x:auto;overflow-y:hidden;
  padding:6px 16px;width:100%;box-sizing:border-box;min-width:0;
  scrollbar-width:none;-ms-overflow-style:none;
  overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;
  -webkit-mask-image:linear-gradient(to right,transparent 0,#000 20px,#000 calc(100% - 20px),transparent 100%);
  mask-image:linear-gradient(to right,transparent 0,#000 20px,#000 calc(100% - 20px),transparent 100%)}
.marquee::-webkit-scrollbar{display:none}

/* Stylish pill chip */
.pill{flex:none;display:inline-flex;align-items:center;gap:10px;height:52px;padding-block:0;padding-inline:7px 16px;
  border:2px solid var(--border);border-radius:999px;background:var(--surface);color:var(--text);text-decoration:none;
  white-space:nowrap;box-shadow:0 1px 0 var(--border);
  transition:border-color .18s,transform .18s,box-shadow .18s,background .18s}
.pill:hover,.pill:focus-visible{border-color:var(--orange);transform:translateY(-3px);box-shadow:0 8px 0 -4px var(--orange)}
.pill-plate{display:grid;place-items:center;width:36px;height:36px;border-radius:999px;background:var(--card);color:var(--card-text);font-size:18px;line-height:1;transition:background .18s,color .18s,transform .18s}
.pill:hover .pill-plate,.pill:focus-visible .pill-plate{background:var(--orange);color:var(--on-orange);transform:rotate(-8deg) scale(1.06)}
.pill-name{font-size:14px;font-weight:700;line-height:1.4;letter-spacing:normal}
.pill-count{display:inline-grid;place-items:center;min-width:24px;height:24px;padding:0 7px;border-radius:999px;background:var(--orange);color:var(--on-orange);font-size:12px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums}
.pill-soon{border-style:dashed;border-color:var(--text-3);box-shadow:none}
.pill-soon .pill-plate{background:transparent;color:var(--text);border:2px dashed var(--text-3)}
.pill-soon .pill-count{background:transparent;color:var(--text);border:2px solid var(--text-3)}
@media(min-width:768px){
  .marquee{gap:14px;padding:6px 20px}
  .pill{height:58px;gap:12px;padding-inline:8px 20px}
  .pill-plate{width:42px;height:42px;font-size:21px}
  .pill-name{font-size:15px;font-weight:700}
}

.clamp-2{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}

/* Sprint 5A.2: 320px hero h1 floor — scoped to this page’s hero only.  */
/* Does NOT affect h1 on tool pages or any other page.                    */
@media (max-width: 360px) {
  .hero-h1 { font-size: 1.75rem; line-height: 1.3; }
}

`;

// 1) Measures the site header height -> --hd-h (for scroll offset when you jump to a section).
// 2) Seamless auto-scroll: the pill list is rendered twice; when the first copy has scrolled past,
//    the position wraps by exactly one copy. Pauses on hover / touch / focus (you can still swipe
//    by hand). Disabled when the user prefers reduced motion.
const STRIP_SCRIPT = `
(function(){
  if(window.__strip)return; window.__strip=1;
  var root=document.documentElement,hdH=-1;
  function measure(){
    var hd=document.querySelector('.hd-bar');
    var h=hd?Math.round(hd.getBoundingClientRect().height):0;
    if(h!==hdH){hdH=h;root.style.setProperty('--hd-h',h+'px');}
  }
  window.addEventListener('resize',measure);
  window.addEventListener('load',measure);
  measure();

  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce)return;
  var SPEED=45,last=0;
  function tick(ts){
    var dt=Math.min(ts-last,64)/1000; last=ts;
    [].slice.call(document.querySelectorAll('[data-marquee]')).forEach(function(box){
      var t=box.querySelector('.marquee'); if(!t)return;
      var n=+t.getAttribute('data-n')||0, a=t.children[0], b=t.children[n]; if(!a||!b)return;
      var setW=Math.abs(b.offsetLeft-a.offsetLeft); if(!setW)return;
      var s=getComputedStyle(t).direction==='rtl'?-1:1;
      if(box.hasAttribute('data-hold')){box._x=Math.abs(t.scrollLeft);return;}
      if(box._x==null)box._x=Math.abs(t.scrollLeft);
      box._x=(box._x+SPEED*dt)%setW;
      t.scrollLeft=s*box._x;
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(function(ts){last=ts;tick(ts);});
  function box(e){return e.target&&e.target.closest?e.target.closest('[data-marquee]'):null;}
  document.addEventListener('mouseover',function(e){var b=box(e); if(b)b.setAttribute('data-hold','1');});
  document.addEventListener('mouseout',function(e){var b=box(e); if(b&&!(e.relatedTarget&&b.contains(e.relatedTarget)))b.removeAttribute('data-hold');});
  document.addEventListener('focusin',function(e){var b=box(e); if(b)b.setAttribute('data-hold','1');});
  document.addEventListener('focusout',function(e){var b=box(e); if(b)b.removeAttribute('data-hold');});
  document.addEventListener('touchstart',function(e){var b=box(e); if(b){b.setAttribute('data-hold','1');if(b._t)clearTimeout(b._t);}},{passive:true});
  document.addEventListener('touchend',function(e){var b=box(e); if(b){b._t=setTimeout(function(){b.removeAttribute('data-hold');},1500);}},{passive:true});
})();
`;

export default function HomePage() {
  const totalTools = getCatalogToolCount();

  const activeCategories = CATEGORIES.map((cat) => ({
    ...cat,
    tools: getCatalogToolsByCategory(cat.id),
  })).filter((cat) => cat.tools.length > 0);

  return (
    <div className="home-root w-full max-w-full overflow-x-hidden bg-[var(--bg)] text-[var(--text)]">
      <style dangerouslySetInnerHTML={{ __html: TOKENS_CSS }} />

      {/* ── Hero ── */}
      <HomeHero toolCount={totalTools} />

      {/* ── World Clock — live times for Gulf + global cities ── */}
      <WorldClockSection />

      {/* ── Category Browse Showcase (Interactive Desktop & Mobile Component) ── */}
      <CategoryBrowseShowcase />

      {/* ── Categories ── */}
      <div id="tools" className="mx-auto max-w-5xl min-w-0 space-y-12 px-4 py-10 sm:space-y-14 sm:py-16">
        {/* Full Active Sections */}
        {activeCategories.map((cat) => (
          <section key={cat.id} id={cat.id} className="cat-sec min-w-0">
            {/* Section header */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-6 sm:flex-nowrap sm:items-end">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--card)] text-lg text-[var(--card-text)] sm:h-11 sm:w-11 sm:text-xl">
                  {cat.icon}
                </div>
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 sm:gap-x-3">
                  <h2 className="text-xl font-bold leading-tight text-[var(--text)] sm:text-2xl">
                    {cat.nameAr}
                  </h2>
                  <span dir="ltr" className="text-xs font-medium text-[var(--text-3)]" style={{ unicodeBidi: "isolate" }}>
                    {cat.nameEn}
                  </span>
                </div>
              </div>
              <div className="hidden flex-1 border-b-2 border-dotted border-[var(--border)] sm:mb-2 sm:block" aria-hidden="true" />
              <span className="shrink-0 rounded-md bg-[var(--orange)] px-2.5 py-0.5 text-xs font-bold text-[var(--on-orange)] sm:mb-1">
                {cat.tools.length} أدوات
              </span>
            </div>

            <ul className="grid list-none min-w-0 grid-cols-1 gap-px overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--border)] p-0 lg:grid-cols-2 lg:[&>li:last-child:nth-child(odd)]:col-span-2">
              {cat.tools.map((tool) => (
                <ToolItem key={tool.id} tool={tool} />
              ))}
            </ul>
          </section>
        ))}

      </div>

      {/* ── SEO Answer-First, Curated Links & FAQ ── */}
      <HomeSeoSections toolCount={totalTools} />

      <Script id="cat-strip" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: STRIP_SCRIPT }} />
    </div>
  );
}

// ─── Components ────────────────────────────────────────────────────────────────

// Grouped list row (thumb-friendly): one rounded sheet per category, hairline dividers,
// 72px+ rows, icon + name + 2-line description + chevron. Two columns on large screens.
function ToolItem({ tool }) {
  return (
    <li className="min-w-0 bg-[var(--surface)]">
      <a
        href={tool.href}
        className="group flex min-h-[4.75rem] items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-[var(--bg)] active:bg-[var(--bg)] sm:gap-4 sm:px-5 sm:py-4"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--card)] text-2xl text-[var(--card-text)] transition-colors group-hover:bg-[var(--orange)] group-hover:text-[var(--on-orange)] sm:h-14 sm:w-14">
          {tool.icon}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-[15px] font-bold leading-snug text-[var(--text)] sm:text-base sm:leading-normal">
              {tool.nameAr}
            </h3>
            {tool.badge && (
              <span className="shrink-0 rounded-md bg-[var(--orange)] px-2 py-0.5 text-[10px] font-bold text-[var(--on-orange)] sm:text-xs">
                {tool.badge}
              </span>
            )}
          </span>
          <span className="clamp-2 mt-1.5 block text-xs leading-relaxed text-[var(--text-2)] sm:text-sm sm:leading-6">
            {tool.descAr}
          </span>
        </span>

        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 shrink-0 text-[var(--text-3)] transition-transform group-hover:-translate-x-1 group-hover:text-[var(--text)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </a>
    </li>
  );
}
