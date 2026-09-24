import { CATEGORIES, getToolsByCategory, getToolCount, categoryHasTools } from "@/lib/registry";

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const totalTools = getToolCount();

  const stats = [
    { value: totalTools.toLocaleString("ar-EG"), label: "أداة وحاسبة متخصصة" },
    { value: "١٠", label: "تصنيف شامل" },
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
            {totalTools} أداة ومحول مالي وإسلامي ويومي مبنية للمستخدم العربي — مصنّفة في ١٠ تصنيفات، دقيقة وسريعة ومجانية تماماً.
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
                href={`#${cat.id}`}
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
        {CATEGORIES.map((cat) => {
          const tools = getToolsByCategory(cat.id);
          const hasTools = tools.length > 0;

          return (
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
                  {hasTools ? (
                    <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-bold text-brand">
                      {tools.length} أدوات
                    </span>
                  ) : (
                    <span className="rounded-full bg-ink-subtle px-2.5 py-0.5 text-xs font-bold text-ink-secondary">
                      قريباً
                    </span>
                  )}
                </div>
                <div className={`h-px flex-1 bg-gradient-to-l ${cat.color} opacity-20`} />
              </div>

              {hasTools ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              ) : (
                <ComingSoonCard cat={cat} />
              )}
            </section>
          );
        })}
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

function ComingSoonCard({ cat }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-dashed ${cat.border} ${cat.bg} px-8 py-10 text-center`}
    >
      <div className="pointer-events-none absolute -top-6 -right-6 text-[80px] opacity-10 select-none">
        {cat.icon}
      </div>
      <div
        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.color} text-3xl shadow-md`}
      >
        {cat.icon}
      </div>
      <p className="mb-1 text-base font-bold text-ink">
        قسم <span className="text-brand">{cat.nameAr}</span> قادم قريباً
      </p>
      {cat.comingSoonDesc && (
        <p className="text-sm text-ink-secondary">{cat.comingSoonDesc}</p>
      )}
      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink-subtle px-4 py-1.5 text-xs font-bold text-ink-muted opacity-60">
        <span>🔔</span>
        <span>سيتم الإطلاق قريباً</span>
      </div>
    </div>
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
