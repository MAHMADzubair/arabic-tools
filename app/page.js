import Script from "next/script";
import { CATEGORIES, getToolsByCategory, getToolCount } from "@/lib/registry";

export const metadata = {
  title: "أدوات عربية مجانية | حاسبات ومحولات وأدوات PDF وصور ومال",
  description:
    "المنصة الشاملة للأدوات والحاسبات العربية المجانية: حاسبات مالية، أدوات الخليج، حاسبات إسلامية، ومحولات يومية مبنية على المصادر الرسمية وبدون تسجيل وبأعلى معايير الخصوصية.",
  openGraph: {
    title: "أدوات عربية مجانية | حاسبات ومحولات وأدوات PDF وصور ومال",
    description:
      "المنصة الشاملة للأدوات والحاسبات العربية المجانية: حاسبات مالية، أدوات الخليج، حاسبات إسلامية، ومحولات يومية مبنية على المصادر الرسمية وبدون تسجيل.",
    siteName: "أدوات عربية",
    locale: "ar_AR",
    type: "website",
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
body{background:var(--bg);color:var(--text)}
.tear{height:12px;background:conic-gradient(from -45deg at bottom,#0000,var(--card) 1deg 90deg,#0000 91deg) 50%/16px 100%}
:focus-visible{outline:2px solid var(--text);outline-offset:3px}
html{scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}

/* Sections land below the site's sticky header */
.cat-sec{scroll-margin-top:calc(var(--hd-h) + 12px)}

/* ── Category strip: NOT sticky, scrolls away with the page ── */
.cat-strip{border-block:1px solid var(--border);background:var(--bg);padding:14px 0}
.marquee{display:flex;gap:12px;overflow-x:auto;padding:6px 20px;
  scrollbar-width:none;-ms-overflow-style:none;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;
  -webkit-mask-image:linear-gradient(to right,transparent 0,#000 40px,#000 calc(100% - 40px),transparent 100%);
  mask-image:linear-gradient(to right,transparent 0,#000 40px,#000 calc(100% - 40px),transparent 100%)}
.marquee::-webkit-scrollbar{display:none}

/* Stylish pill chip */
.pill{flex:none;display:inline-flex;align-items:center;gap:10px;height:52px;padding-block:0;padding-inline:7px 16px;
  border:2px solid var(--border);border-radius:999px;background:var(--surface);color:var(--text);text-decoration:none;
  white-space:nowrap;box-shadow:0 1px 0 var(--border);
  transition:border-color .18s,transform .18s,box-shadow .18s,background .18s}
.pill:hover,.pill:focus-visible{border-color:var(--orange);transform:translateY(-3px);box-shadow:0 8px 0 -4px var(--orange)}
.pill-plate{display:grid;place-items:center;width:36px;height:36px;border-radius:999px;background:var(--card);color:var(--card-text);font-size:18px;line-height:1;transition:background .18s,color .18s,transform .18s}
.pill:hover .pill-plate,.pill:focus-visible .pill-plate{background:var(--orange);color:var(--on-orange);transform:rotate(-8deg) scale(1.06)}
.pill-name{font-size:14px;font-weight:900}
.pill-count{display:inline-grid;place-items:center;min-width:24px;height:24px;padding:0 7px;border-radius:999px;background:var(--orange);color:var(--on-orange);font-size:12px;font-weight:900}
.pill-soon{border-style:dashed;border-color:var(--text-3);box-shadow:none}
.pill-soon .pill-plate{background:transparent;color:var(--text);border:2px dashed var(--text-3)}
.pill-soon .pill-count{background:transparent;color:var(--text);border:2px solid var(--text-3)}
@media(min-width:768px){
  .marquee{gap:14px}
  .pill{height:58px;gap:12px;padding-inline:8px 20px}
  .pill-plate{width:42px;height:42px;font-size:21px}
  .pill-name{font-size:15px}
}

.clamp-2{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}

/* Features strip: faint ruled-paper texture + hover lift (decorative only) */
.feat-strip{background-image:repeating-linear-gradient(0deg,transparent 0 31px,color-mix(in srgb,var(--text) 5%,transparent) 31px 32px)}
.feat-card{transition:border-color .2s,transform .2s}
.feat-card:hover{transform:translateY(-4px)}
.feat-card:hover .feat-plate{transform:rotate(-6deg) scale(1.06)}
.feat-plate{transition:transform .2s}
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

const toolsLabel = (n) => `${n.toLocaleString("ar-EG")} ${n <= 10 ? "أدوات" : "أداة"}`;

function Pill({ item, dup }) {
  return (
    <a
      href={`#${item.id}`}
      aria-hidden={dup ? "true" : undefined}
      tabIndex={dup ? -1 : undefined}
      className={`pill${item.soon ? " pill-soon" : ""}`}
    >
      <span className="pill-plate" aria-hidden="true">{item.icon}</span>
      <span className="pill-name">{item.name}</span>
      {!dup && <span className="sr-only">، {item.label}</span>}
      <span className="pill-count" aria-hidden="true">{item.count}</span>
    </a>
  );
}

export default function HomePage() {
  const totalTools = getToolCount();

  const activeCategories = CATEGORIES.map((cat) => ({
    ...cat,
    tools: getToolsByCategory(cat.id),
  })).filter((cat) => cat.tools.length > 0);

  const upcomingCategories = CATEGORIES.filter(
    (cat) => getToolsByCategory(cat.id).length === 0
  );

  const stats = [
    { value: totalTools.toLocaleString("ar-EG"), label: "أداة وحاسبة متخصصة" },
    { value: CATEGORIES.length.toLocaleString("ar-EG"), label: "تصنيف شامل" },
    { value: "٠", label: "تسجيل مطلوب" },
  ];

  const navItems = [
    ...activeCategories.map((c) => ({
      id: c.id,
      icon: c.icon,
      name: c.nameAr,
      count: c.tools.length.toLocaleString("ar-EG"),
      label: toolsLabel(c.tools.length),
    })),
    ...(upcomingCategories.length > 0
      ? [
        {
          id: "upcoming",
          soon: true,
          icon: "🚀",
          name: "قريباً",
          count: upcomingCategories.length.toLocaleString("ar-EG"),
          label: `${upcomingCategories.length.toLocaleString("ar-EG")} أقسام`,
        },
      ]
      : []),
  ];

  return (
    <div className="bg-[var(--bg)] text-[var(--text)]">
      <style dangerouslySetInnerHTML={{ __html: TOKENS_CSS }} />

      {/* ── Hero ── */}
      <section className="border-b border-[var(--border)] px-4 py-14 sm:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <h1 className="text-4xl font-black leading-[1.3] tracking-tight sm:text-5xl lg:text-6xl">
              كل حساباتك
              <br />
              في مكان واحد،
              <br />
              <span className="underline decoration-[var(--orange)] decoration-[6px] underline-offset-[14px]">
                بلا تسجيل
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-[var(--text-2)] sm:text-lg">
              حاسبات ومحولات مالية وإسلامية ويومية مبنية للمستخدم العربي. تُحسب الأرقام داخل متصفحك، والخدمة مجانية تماماً.
            </p>
            <a
              href={`#${activeCategories[0]?.id ?? "upcoming"}`}
              className="mt-8 inline-block rounded-xl bg-[var(--orange)] px-7 py-3.5 text-base font-black text-[var(--on-orange)] transition-colors hover:bg-[var(--orange-hover)] active:bg-[var(--orange-press)]"
            >
              تصفح الأدوات
            </a>
          </div>

          {/* Receipt: a live "statement" of what the site holds */}
          <div className="mx-auto w-full max-w-sm lg:rotate-[-1.5deg]" aria-label="ملخص الموقع">
            <div className="bg-[var(--card)] px-6 pt-6 text-[var(--card-text)]">
              <div className="flex items-baseline justify-between border-b border-dashed border-[var(--card-muted)] pb-3">
                <p className="text-lg font-black">كشف الأدوات</p>
                <p className="text-xs text-[var(--card-muted)]">أدوات عربية</p>
              </div>
              <ul className="py-3">
                {activeCategories.map((cat) => (
                  <li key={cat.id}>
                    <a href={`#${cat.id}`} className="flex items-baseline gap-2 py-1.5 text-sm hover:underline">
                      <span className="shrink-0 font-semibold">{cat.nameAr}</span>
                      <span className="flex-1 border-b border-dotted border-[var(--card-muted)]" aria-hidden="true" />
                      <span className="shrink-0 font-black tabular-nums">{cat.tools.length.toLocaleString("ar-EG")}</span>
                    </a>
                  </li>
                ))}
                <li className="flex items-baseline gap-2 py-1.5 text-sm">
                  <span className="shrink-0 font-semibold">تسجيل مطلوب</span>
                  <span className="flex-1 border-b border-dotted border-[var(--card-muted)]" aria-hidden="true" />
                  <span className="shrink-0 font-black">٠</span>
                </li>
                <li className="flex items-baseline gap-2 py-1.5 text-sm">
                  <span className="shrink-0 font-semibold">رسوم الاستخدام</span>
                  <span className="flex-1 border-b border-dotted border-[var(--card-muted)]" aria-hidden="true" />
                  <span className="shrink-0 font-black">٠</span>
                </li>
              </ul>
              <div className="-mx-6 flex items-center justify-between bg-[var(--orange)] px-6 py-4 text-[var(--on-orange)]">
                <span className="font-black">{stats[0].label}</span>
                <span className="text-3xl font-black tabular-nums">{stats[0].value}</span>
              </div>
              <p className="py-4 text-center text-xs text-[var(--card-muted)]">
                {stats[1].value} تصنيفات · تُحدَّث القائمة مع كل أداة جديدة
              </p>
            </div>
            <div className="tear" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ── Category strip (auto-scrolling, not sticky) ── */}
      <nav dir="rtl" aria-label="تصنيفات الأدوات" className="cat-strip">
        <div data-marquee className="mx-auto max-w-5xl">
          <div data-n={navItems.length} className="marquee">
            {[false, true].map((dup) =>
              navItems.map((item) => <Pill key={`${dup}-${item.id}`} item={item} dup={dup} />)
            )}
          </div>
        </div>
      </nav>

      {/* ── Categories ── */}
      <main className="mx-auto max-w-5xl space-y-14 px-4 py-12 sm:py-16">
        {/* Full Active Sections */}
        {activeCategories.map((cat) => (
          <section key={cat.id} id={cat.id} className="cat-sec">
            {/* Section header */}
            <div className="mb-6 flex items-end gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--card)] text-xl text-[var(--card-text)]">
                {cat.icon}
              </div>
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-3">
                <h2 className="text-xl font-black text-[var(--text)] sm:text-2xl">
                  {cat.nameAr}
                </h2>
                <span className="text-xs font-semibold text-[var(--text-3)]">
                  {cat.nameEn}
                </span>
              </div>
              <div className="mb-2 flex-1 border-b-2 border-dotted border-[var(--border)]" aria-hidden="true" />
              <span className="mb-1 shrink-0 rounded-md bg-[var(--orange)] px-2.5 py-0.5 text-xs font-black text-[var(--on-orange)]">
                {cat.tools.length} أدوات
              </span>
            </div>

            <ul className="grid list-none grid-cols-1 gap-px overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--border)] p-0 lg:grid-cols-2 lg:[&>li:last-child:nth-child(odd)]:col-span-2">
              {cat.tools.map((tool) => (
                <ToolItem key={tool.id} tool={tool} />
              ))}
            </ul>
          </section>
        ))}

        {/* Compact Coming Soon Section */}
        {upcomingCategories.length > 0 && (
          <section id="upcoming" className="cat-sec pt-2">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--card)] text-2xl text-[var(--card-text)]">
                    🚀
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[var(--text)] sm:text-2xl">
                      قريباً في أدوات عربية
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--text-2)] sm:text-sm">
                      نعمل على تطوير باقة متكاملة من الأدوات الرقمية لتغطية كافة احتياجاتك
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 self-start rounded-full bg-[var(--orange)] px-3 py-1 text-xs font-bold text-[var(--on-orange)] sm:self-auto">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--on-orange)]" />
                  <span>{upcomingCategories.length} أقسام قيد التطوير</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] p-4 transition-colors hover:border-[var(--text)]"
                  >
                    <div>
                      <div className="mb-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{cat.icon}</span>
                          <div>
                            <h3 className="text-sm font-bold text-[var(--text)] sm:text-base">
                              {cat.nameAr}
                            </h3>
                            <span className="text-[11px] font-semibold text-[var(--text-3)]">
                              {cat.nameEn}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-3)]">
                          قريباً
                        </span>
                      </div>
                      {cat.comingSoonDesc && (
                        <p className="text-xs leading-relaxed text-[var(--text-2)]">
                          {cat.comingSoonDesc}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-2.5 text-[11px] font-medium text-[var(--text-3)]">
                      <span>جاري إعداد الأدوات</span>
                      <span className="opacity-0 transition-opacity group-hover:opacity-100">⚡</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── Features Strip ── */}
      <FeaturesStrip />

      <Script id="cat-strip" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: STRIP_SCRIPT }} />
    </div>
  );
}

// ─── Components ────────────────────────────────────────────────────────────────

// Grouped list row (thumb-friendly): one rounded sheet per category, hairline dividers,
// 72px+ rows, icon + name + 2-line description + chevron. Two columns on large screens.
function ToolItem({ tool }) {
  return (
    <li className="bg-[var(--surface)]">
      <a
        href={tool.href}
        className="group flex min-h-[4.75rem] items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-[var(--bg)] active:bg-[var(--bg)] sm:gap-4 sm:px-5 sm:py-4"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--card)] text-2xl text-[var(--card-text)] transition-colors group-hover:bg-[var(--orange)] group-hover:text-[var(--on-orange)] sm:h-14 sm:w-14">
          {tool.icon}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[15px] font-extrabold leading-snug text-[var(--text)] sm:text-base">
              {tool.nameAr}
            </span>
            {tool.badge && (
              <span className="rounded-md bg-[var(--orange)] px-1.5 py-0.5 text-[10px] font-black text-[var(--on-orange)] sm:text-xs">
                {tool.badge}
              </span>
            )}
          </span>
          <span className="clamp-2 mt-1 block text-xs leading-5 text-[var(--text-2)] sm:text-sm sm:leading-6">
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

// ─── Features strip ───────────────────────────────────────────────────────────
// Light mode: white strip, light cards. Dark mode: black strip, dark cards.
// Orange is used only as fills (icon plate, top bar, hover border), never as text.

const FEATURES = [
  {
    title: "سريع وفوري",
    desc: "النتائج تظهر فور الإدخال وبدون انتظار",
    tag: "بدون انتظار",
    icon: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  },
  {
    title: "أمان وسرية الحسابات",
    desc: "تتم جميع العمليات الحسابية محلياً داخل متصفحك لحماية سرية أرقامك",
    tag: "داخل متصفحك",
    icon: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <path d="M12 14.5v2.5" />
      </>
    ),
  },
  {
    title: "يعمل على كل الأجهزة",
    desc: "متوافق مع الجوال والتابلت والحاسوب",
    tag: "جوال · تابلت · حاسوب",
    icon: (
      <>
        <rect x="2" y="4" width="14" height="10" rx="1.5" />
        <path d="M6 18h6M9 14v4" />
        <rect x="17.5" y="8" width="4.5" height="10" rx="1.2" />
      </>
    ),
  },
];

function FeaturesStrip() {
  return (
    <section
      aria-labelledby="features-title"
      className="feat-strip border-t-4 border-[var(--orange)] bg-[var(--surface)] px-4 py-14 text-[var(--text)] sm:py-16"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="features-title"
          className="mb-10 text-center text-2xl font-black sm:text-3xl"
        >
          لماذا{" "}
          <span className="underline decoration-[var(--orange)] decoration-[5px] underline-offset-[10px]">
            أدوات عربية؟
          </span>
        </h2>

        <ul className="grid list-none gap-4 p-0 sm:grid-cols-3 sm:gap-5">
          {FEATURES.map((f) => (
            <li
              key={f.title}
              className="feat-card group relative flex flex-col gap-3 overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[var(--bg)] p-6 text-[var(--text)] hover:border-[var(--orange)]"
            >
              {/* Orange corner bar */}
              <span
                className="absolute inset-x-0 top-0 h-1.5 bg-[var(--orange)]"
                aria-hidden="true"
              />

              {/* Orange icon plate with ink icon */}
              <span
                className="feat-plate mt-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--orange)] text-[var(--on-orange)]"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="28"
                  height="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {f.icon}
                </svg>
              </span>

              <h3 className="text-xl font-extrabold leading-snug">{f.title}</h3>
              <p className="flex-1 text-sm leading-7 text-[var(--text-2)]">{f.desc}</p>

              {/* Tag */}
              <span className="mt-1 inline-block self-start rounded-full border border-[var(--text-3)] px-3 py-1 text-[11px] font-bold text-[var(--text-2)]">
                {f.tag}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}