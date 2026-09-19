const tools = [
  {
    href: "/zakat-calculator",
    title: "حاسبة الزكاة",
    desc: "احسب زكاتك بدقة بناءً على نصاب الفضة الحالي مع دعم الأصول والالتزامات.",
    icon: "🕌",
    live: true,
    badge: null,
  },
  {
    href: "/inheritance-calculator",
    title: "حاسبة الميراث",
    desc: "احسب توزيع التركة بدقة وفق الفرائض والعصبات والعول والرد الشرعي.",
    icon: "⚖️",
    live: true,
    badge: "جديد",
  },
  {
    href: "/loan-calculator",
    title: "حاسبة القروض",
    desc: "احسب القسط الشهري وإجمالي الفائدة وجدول السداد الكامل لأي قرض.",
    icon: "🏦",
    live: true,
    badge: null,
  },
  {
    href: "/currency-converter",
    title: "محول العملات",
    desc: "حوّل بين الريال والدرهم والدولار واليورو وأكثر من ١٢ عملة فوراً.",
    icon: "💱",
    live: true,
    badge: null,
  },
];

const stats = [
  { value: "٤", label: "أدوات مجانية" },
  { value: "١٢+", label: "عملة مدعومة" },
  { value: "٠", label: "تسجيل مطلوب" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero section */}
      <section className="relative overflow-hidden bg-hero-gradient px-4 py-16 sm:py-24">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center text-white">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <span>✨</span>
            <span>مجاني تماماً — بدون تسجيل</span>
          </div>
          <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            أدوات مالية عربية
            <br />
            <span className="text-accent">سريعة ودقيقة</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            حاسبات ومحولات مالية مبنية للمستخدم العربي — بدون تعقيد وبدون إعلانات.
          </p>

          {/* Stats */}
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

      {/* Tools grid */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-ink-muted">
          الأدوات المتاحة
        </h2>
        <p className="mb-10 text-center text-xl font-bold text-ink sm:text-2xl">
          اختر الأداة التي تحتاجها
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.href} tool={tool} />
          ))}
        </div>
      </section>

      {/* Features strip */}
      <section className="border-y border-brand-border bg-white px-4 py-10">
        <div className="mx-auto grid max-w-4xl gap-6 text-center sm:grid-cols-3">
          <Feature icon="⚡" title="سريع وفوري" desc="النتائج تظهر فور الإدخال بدون انتظار" />
          <Feature icon="🔒" title="خصوصية تامة" desc="لا يتم حفظ بياناتك على أي خادم" />
          <Feature icon="📱" title="يعمل على كل الأجهزة" desc="متوافق مع الجوال والتابلت والحاسوب" />
        </div>
      </section>
    </div>
  );
}

function ToolCard({ tool }) {
  return (
    <a
      href={tool.live ? tool.href : "#"}
      className={`group relative flex flex-col rounded-2xl border border-brand-border bg-white p-6 shadow-card transition-all duration-200 ${
        tool.live
          ? "hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover cursor-pointer"
          : "pointer-events-none opacity-60"
      }`}
    >
      {/* Icon */}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-2xl shadow-sm group-hover:bg-brand-100">
        {tool.icon}
      </div>

      {/* Badge */}
      {tool.badge && (
        <span className="absolute left-4 top-4 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">
          {tool.badge}
        </span>
      )}
      {!tool.live && (
        <span className="absolute left-4 top-4 rounded-full bg-ink-subtle px-2 py-0.5 text-xs font-semibold text-ink-secondary">
          قريباً
        </span>
      )}

      {/* Text */}
      <h3 className="mb-2 text-lg font-bold text-ink group-hover:text-brand">
        {tool.title}
      </h3>
      <p className="flex-1 text-sm leading-relaxed text-ink-secondary">{tool.desc}</p>

      {/* Arrow */}
      {tool.live && (
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
          <span>ابدأ الآن</span>
          <span>←</span>
        </div>
      )}
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
