import { CATEGORIES, getToolsByCategory, getToolCount, categoryHasTools } from "@/lib/registry";

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
  --bg:#F5F5F2; --surface:#FFFFFF; --border:#D4D4CE;
  --text:#0D0D0D; --text-2:#555555; --text-3:#6B6B66;
  --card:#0D0D0D; --card-text:#FFFFFF; --card-muted:#B5B5B0;
  --card-border:#2A2A2A; --card-field:#1A1A1A; --card-field-text:#FFFFFF;
  --tab-hover:rgba(255,255,255,.10);
  --orange:#FF5B04; --orange-hover:#FF7A33; --orange-press:#E64F00; --on-orange:#0D0D0D;
  --success:#137A47; --warning:#8A5A00; --error:#C8321F;
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
/* ledger-paper hero background: thin horizontal rules */
.register{background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 47px,var(--border) 47px,var(--border) 48px)}
:focus-visible{outline:2px solid var(--text);outline-offset:3px}
html{scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}
`;

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

  return (
    <div className="bg-[var(--bg)] text-[var(--text)]">
      <style dangerouslySetInnerHTML={{ __html: TOKENS_CSS }} />
      {/* ── Hero ── */}
      <section className="register border-b border-[var(--border)] px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card)] text-center text-[var(--card-text)]">
          <div className="px-5 pb-8 pt-10 sm:px-10 sm:pt-14">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[var(--orange)] px-4 py-1.5 text-sm font-bold text-[var(--on-orange)]">
              <span>✨</span>
              <span>{totalTools} أداة مجانية — بدون تسجيل</span>
            </div>
            <h1 className="mb-4 text-3xl font-black leading-[1.35] tracking-tight sm:text-5xl sm:leading-[1.3]">
              أدوات عربية شاملة
              <br />
              <span className="inline-block rounded-lg bg-[var(--orange)] px-3 text-[var(--on-orange)]">
                سريعة ودقيقة
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-base leading-8 text-[var(--card-muted)] sm:text-lg">
              {totalTools} أداة ومحول مالي وإسلامي ويومي مبنية للمستخدم العربي — مصنّفة في {CATEGORIES.length.toLocaleString("ar-EG")} تصنيفات، دقيقة وسريعة ومجانية تماماً.
            </p>
          </div>

          <div className="grid grid-cols-3 divide-x divide-x-reverse divide-[var(--card-border)] border-t border-[var(--card-border)]">
            {stats.map((s) => (
              <div key={s.label} className="px-2 py-5 text-center">
                <p className="text-2xl font-black sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-[var(--card-muted)] sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Nav Pills ── */}
      <nav className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const hasTools = categoryHasTools(cat.id);
            return (
              <a
                key={cat.id}
                href={hasTools ? `#${cat.id}` : "#upcoming"}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs font-bold text-[var(--text-2)] transition-colors hover:border-[var(--text)] hover:text-[var(--text)]"
              >
                <span>{cat.icon}</span>
                <span>{cat.nameAr}</span>
                {!hasTools && (
                  <span className="rounded-full bg-[var(--bg)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-3)]">
                    قريباً
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </nav>

      {/* ── Categories ── */}
      <main className="mx-auto max-w-5xl space-y-14 px-4 py-12 sm:py-16">
        {/* Full Active Sections */}
        {activeCategories.map((cat) => (
          <section key={cat.id} id={cat.id} className="scroll-mt-20">
            {/* Section header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--card)] text-xl text-[var(--card-text)]">
                {cat.icon}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-[var(--text)] sm:text-2xl">
                  {cat.nameAr}
                </h2>
                <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs font-semibold text-[var(--text-3)]">
                  {cat.nameEn}
                </span>
                <span className="rounded-full bg-[var(--orange)] px-2.5 py-0.5 text-xs font-bold text-[var(--on-orange)]">
                  {cat.tools.length} أدوات
                </span>
              </div>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cat.tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        ))}

        {/* Compact Coming Soon Section */}
        {upcomingCategories.length > 0 && (
          <section id="upcoming" className="scroll-mt-20 pt-2">
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
      <section className="border-y border-[var(--card-border)] bg-[var(--card)] px-4 py-10 text-[var(--card-text)]">
        <div className="mx-auto grid max-w-4xl gap-8 text-center sm:grid-cols-3">
          <Feature icon="⚡" title="سريع وفوري" desc="النتائج تظهر فور الإدخال وبدون انتظار" />
          <Feature
            icon="🔒"
            title="أمان وسرية الحسابات"
            desc="تتم جميع العمليات الحسابية محلياً داخل متصفحك لحماية سرية أرقامك"
          />
          <Feature icon="📱" title="يعمل على كل الأجهزة" desc="متوافق مع الجوال والتابلت والحاسوب" />
        </div>
      </section>
    </div>
  );
}

// ─── Components ────────────────────────────────────────────────────────────────

function ToolCard({ tool }) {
  return (
    <a
      href={tool.href}
      className="group relative flex cursor-pointer flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors duration-200 hover:border-[var(--text)]"
    >
      {tool.badge && (
        <span className="absolute end-4 top-4 rounded-full bg-[var(--orange)] px-2 py-0.5 text-xs font-bold text-[var(--on-orange)]">
          {tool.badge}
        </span>
      )}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--card)] text-2xl text-[var(--card-text)] transition-colors group-hover:bg-[var(--orange)] group-hover:text-[var(--on-orange)]">
        {tool.icon}
      </div>
      <h3 className="mb-2 text-lg font-extrabold text-[var(--text)]">
        {tool.nameAr}
      </h3>
      <p className="flex-1 text-sm leading-7 text-[var(--text-2)]">{tool.descAr}</p>
      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[var(--text)] underline-offset-4 group-hover:underline sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        <span>ابدأ الآن</span>
        <span>←</span>
      </div>
    </a>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-3xl">{icon}</span>
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm leading-7 text-[var(--card-muted)]">{desc}</p>
    </div>
  );
}