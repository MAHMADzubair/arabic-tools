import { CATEGORIES, getToolsByCategory, getToolCount, categoryHasTools } from "@/lib/registry";

export const metadata = {
  title: "أدوات عربية مجانية | حاسبات ومحولات وأدوات PDF وصور ومال",
  description:
    "المنصة الشاملة للأدوات والحاسبات العربية المجانية: حاسبات مالية، أدوات الخليج، حاسبات إسلامية، ومحولات يومية دقيقة وسريعة 100% بدون تسجيل وبأعلى معايير الخصوصية.",
  openGraph: {
    title: "أدوات عربية مجانية | حاسبات ومحولات وأدوات PDF وصور ومال",
    description:
      "المنصة الشاملة للأدوات والحاسبات العربية المجانية: حاسبات مالية، أدوات الخليج، حاسبات إسلامية، ومحولات يومية دقيقة وسريعة 100% بدون تسجيل.",
    siteName: "أدوات عربية",
    locale: "ar_AR",
    type: "website",
  },
};

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
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-hero-gradient px-4 py-16 sm:py-24">
        <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center text-white">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <span>✨</span>
            <span>{totalTools} أداة مجانية — بدون تسجيل</span>
          </div>
          <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            أدوات عربية شاملة
            <br />
            <span className="text-accent">سريعة ودقيقة</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            {totalTools} أداة ومحول مالي وإسلامي ويومي مبنية للمستخدم العربي — مصنّفة في {CATEGORIES.length.toLocaleString("ar-EG")} تصنيفات، دقيقة وسريعة ومجانية تماماً.
          </p>

          <div className="flex justify-center gap-6 sm:gap-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold sm:text-3xl">{s.value}</p>
                <p className="text-xs text-white/70 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Nav Pills ── */}
      <nav className="sticky top-0 z-20 border-b border-brand-border bg-white/95 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const hasTools = categoryHasTools(cat.id);
            return (
              <a
                key={cat.id}
                href={hasTools ? `#${cat.id}` : "#upcoming"}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-ink-secondary shadow-sm transition-all hover:border-brand-300 hover:bg-brand-light hover:text-brand"
              >
                <span>{cat.icon}</span>
                <span>{cat.nameAr}</span>
                {!hasTools && (
                  <span className="rounded-full bg-ink-subtle px-1.5 py-0.5 text-[10px] font-bold text-ink-muted">
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
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-xl shadow-md`}
              >
                {cat.icon}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
                  {cat.nameAr}
                </h2>
                <span className="rounded-full border border-brand-border px-2 py-0.5 text-xs font-semibold text-ink-muted">
                  {cat.nameEn}
                </span>
                <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-bold text-brand">
                  {cat.tools.length} أدوات
                </span>
              </div>
              <div className={`h-px flex-1 bg-gradient-to-l ${cat.color} opacity-20`} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cat.tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        ))}

        {/* Compact Coming Soon Section */}
        {upcomingCategories.length > 0 && (
          <section id="upcoming" className="scroll-mt-20 pt-2">
            <div className="rounded-3xl border border-brand-border/80 bg-gradient-to-b from-white to-brand-surface/40 p-6 sm:p-8 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hero-gradient text-2xl shadow-sm text-white">
                    🚀
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-ink">
                      قريباً في أدوات عربية
                    </h2>
                    <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
                      نعمل على تطوير باقة متكاملة من الأدوات الرقمية لتغطية كافة احتياجاتك
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">
                  <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                  <span>{upcomingCategories.length} أقسام قيد التطوير</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-dashed border-brand-border bg-white p-4 transition-all hover:border-brand hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{cat.icon}</span>
                          <div>
                            <h3 className="font-bold text-ink text-sm sm:text-base">
                              {cat.nameAr}
                            </h3>
                            <span className="text-[11px] font-semibold text-ink-muted">
                              {cat.nameEn}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-ink-muted">
                          قريباً
                        </span>
                      </div>
                      {cat.comingSoonDesc && (
                        <p className="text-xs text-ink-secondary leading-relaxed">
                          {cat.comingSoonDesc}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-ink-muted font-medium">
                      <span>جاري إعداد الأدوات</span>
                      <span className="text-brand opacity-0 group-hover:opacity-100 transition-opacity">⚡</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── Features Strip ── */}
      <section className="border-y border-brand-border bg-white px-4 py-10">
        <div className="mx-auto grid max-w-4xl gap-6 text-center sm:grid-cols-3">
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
      className="group relative flex flex-col rounded-2xl border border-brand-border bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover cursor-pointer"
    >
      {tool.badge && (
        <span className="absolute left-4 top-4 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">
          {tool.badge}
        </span>
      )}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-2xl shadow-sm group-hover:bg-brand-100">
        {tool.icon}
      </div>
      <h3 className="mb-2 text-lg font-bold text-ink group-hover:text-brand">
        {tool.nameAr}
      </h3>
      <p className="flex-1 text-sm leading-relaxed text-ink-secondary">{tool.descAr}</p>
      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand sm:opacity-0 transition-opacity group-hover:opacity-100">
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
      <h3 className="font-bold text-ink">{title}</h3>
      <p className="text-sm text-ink-secondary">{desc}</p>
    </div>
  );
}
