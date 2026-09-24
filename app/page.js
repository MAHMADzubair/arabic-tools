// ─── Data ─────────────────────────────────────────────────────────────────────

const categories = [
  {
    id: "gulf",
    icon: "🏜️",
    titleAr: "أدوات الخليج",
    titleEn: "Gulf Tools",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    tools: [
      {
        href: "/salary-calculator",
        title: "حاسبة الراتب الصافي",
        desc: "احسب صافي راتبك بعد الضرائب والتأمينات لـ 6 دول مع تفصيل كامل للبدلات والخصومات.",
        icon: "💰",
      },
      {
        href: "/gratuity-calculator",
        title: "حاسبة مكافأة نهاية الخدمة",
        desc: "احسب مستحقات نهاية الخدمة لـ 7 دول عربية وفق أحدث قوانين العمل مع حالات الاستقالة والفصل والتقاعد.",
        icon: "🎖️",
      },
      {
        href: "/overtime-calculator",
        title: "حاسبة الأوفرتايم",
        desc: "احسب أجر ساعات العمل الإضافي وفق قوانين العمل الخليجية لكل دولة.",
        icon: "⏱️",
      },
      {
        href: "/vat-calculator",
        title: "حاسبة ضريبة القيمة المضافة",
        desc: "احسب الضريبة المضافة (١٥٪ أو ٥٪) أو استخرج السعر الأصلي بدقة.",
        icon: "🧾",
      },
    ],
    comingSoon: false,
  },
  {
    id: "finance",
    icon: "💰",
    titleAr: "المال والاستثمار",
    titleEn: "Finance",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    tools: [
      {
        href: "/loan-calculator",
        title: "حاسبة القروض",
        desc: "احسب القسط الشهري وإجمالي الفائدة وجدول السداد الكامل لأي قرض.",
        icon: "🏦",
      },
      {
        href: "/mortgage-calculator",
        title: "حاسبة التمويل العقاري",
        desc: "احسب قسط الرهن العقاري وجدول السداد الكامل مع الدفعة الأولى والتأمين والرسوم.",
        icon: "🏠",
      },
      {
        href: "/compound-interest",
        title: "حاسبة الفائدة المركبة",
        desc: "اكتشف قوة المضاعفة — احسب نمو استثمارك مع المساهمات الشهرية ومخطط النمو السنوي.",
        icon: "📈",
      },
      {
        href: "/roi-calculator",
        title: "حاسبة العائد على الاستثمار (ROI)",
        desc: "احسب العائد على الاستثمار وصافي الأرباح ومعدل النمو السنوي المركب ومضاعف رأس المال.",
        icon: "💼",
      },
      {
        href: "/profit-margin-calculator",
        title: "حاسبة هامش الربح والتسعير",
        desc: "احسب هامش الربح والمارك اب وسعر البيع لمتجرك مع تكاليف الشحن وعمولات الدفع والإعلانات.",
        icon: "📊",
      },
      {
        href: "/currency-converter",
        title: "محول العملات",
        desc: "حوّل بين الريال والدرهم والدولار واليورو وأكثر من ١٢ عملة فوراً.",
        icon: "💱",
      },
    ],
    comingSoon: false,
  },
  {
    id: "islamic",
    icon: "🌙",
    titleAr: "الأدوات الإسلامية",
    titleEn: "Islamic Tools",
    color: "from-teal-500 to-emerald-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
    tools: [
      {
        href: "/zakat-calculator",
        title: "حاسبة الزكاة",
        desc: "احسب زكاتك بدقة بناءً على نصاب الفضة الحالي مع دعم الأصول والالتزامات.",
        icon: "🕌",
      },
      {
        href: "/zakat-al-fitr",
        title: "حاسبة زكاة الفطر",
        desc: "احسب صاع زكاة الفطر بالكيلوجرام (أرز وحبوب) أو نقداً للأسرة.",
        icon: "🌾",
      },
      {
        href: "/kaffara-calculator",
        title: "حاسبة الكفارات والفدية",
        desc: "احسب كفارة اليمين وفدية صيام رمضان والنذر عيناً بالأرز أو نقداً.",
        icon: "📜",
      },
      {
        href: "/umrah-calculator",
        title: "حاسبة تكلفة العمرة",
        desc: "قدّر تكلفة رحلة العمرة شاملاً الطيران والفندق والتأشيرة والطعام لأي عدد من المسافرين.",
        icon: "🕋",
      },
      {
        href: "/inheritance-calculator",
        title: "حاسبة الميراث",
        desc: "احسب توزيع التركة بدقة وفق الفرائض والعصبات والعول والرد الشرعي.",
        icon: "⚖️",
      },
    ],
    comingSoon: false,
  },
  {
    id: "everyday",
    icon: "🌐",
    titleAr: "الحياة اليومية",
    titleEn: "Everyday Tools",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    tools: [
      {
        href: "/hijri-age-calculator",
        title: "حاسبة العمر بالهجري",
        desc: "احسب عمرك الدقيق بالهجري والميلادي وفق تقويم أم القرى مع موعد ميلادك القادم.",
        icon: "🌙",
      },
      {
        href: "/date-converter",
        title: "محول التاريخ الهجري والميلادي",
        desc: "حوّل بين التاريخين الهجري والميلادي بدقة تقويم أم القرى مع معرفة تاريخ اليوم وأسماء الأيام.",
        icon: "🔄",
      },
      {
        href: "/bmi-calculator",
        title: "حاسبة مؤشر كتلة الجسم (BMI)",
        desc: "احسب مؤشر كتلة جسمك والوزن المثالي واحتياج السعرات والماء وفق معايير منظمة الصحة العالمية.",
        icon: "⚖️",
      },
      {
        href: "/unit-converter",
        title: "محول الوحدات الشامل",
        desc: "حوّل بين مقاييس الطول والوزن ودرجة الحرارة والمساحة والحجم بين النظامين المتري والإمبراطوري.",
        icon: "📐",
      },
    ],
    comingSoon: false,
  },
  {
    id: "business",
    icon: "💼",
    titleAr: "الأعمال",
    titleEn: "Business",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    tools: [],
    comingSoon: true,
    comingSoonDesc: "أدوات تحليل الأعمال وإدارة المشاريع والميزانيات",
  },
  {
    id: "media",
    icon: "🎬",
    titleAr: "الوسائط",
    titleEn: "Media",
    color: "from-purple-500 to-violet-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    tools: [],
    comingSoon: true,
    comingSoonDesc: "أدوات تحرير الفيديو والصوت وإدارة المحتوى الرقمي",
  },
  {
    id: "pdf",
    icon: "📄",
    titleAr: "PDF",
    titleEn: "PDF",
    color: "from-red-500 to-rose-600",
    bg: "bg-red-50",
    border: "border-red-200",
    tools: [],
    comingSoon: true,
    comingSoonDesc: "دمج وتقسيم وضغط وتحويل ملفات PDF بسهولة",
  },
  {
    id: "image",
    icon: "🖼️",
    titleAr: "الصور",
    titleEn: "Image",
    color: "from-pink-500 to-fuchsia-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    tools: [],
    comingSoon: true,
    comingSoonDesc: "ضغط وتحويل وتعديل الصور بدون برامج",
  },
  {
    id: "text",
    icon: "✍️",
    titleAr: "النصوص",
    titleEn: "Text",
    color: "from-sky-500 to-cyan-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    tools: [],
    comingSoon: true,
    comingSoonDesc: "عد الكلمات وتنسيق النصوص وترجمتها وتحليلها",
  },
  {
    id: "developer",
    icon: "👨‍💻",
    titleAr: "المطورين",
    titleEn: "Developer",
    color: "from-slate-600 to-gray-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    tools: [],
    comingSoon: true,
    comingSoonDesc: "أدوات JSON وBase64 والألوان وتوليد الكود",
  },
];

const stats = [
  { value: "١٩", label: "أداة وحاسبة متخصصة" },
  { value: "١٠", label: "تصنيف شامل" },
  { value: "٠", label: "تسجيل مطلوب" },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-hero-gradient px-4 py-16 sm:py-24">
        <div className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center text-white">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <span>✨</span>
            <span>١٩ أداة مجانية — بدون تسجيل</span>
          </div>
          <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            أدوات عربية شاملة
            <br />
            <span className="text-accent">سريعة ودقيقة</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            ١٩ أداة ومحول مالي وإسلامي ويومي مبنية للمستخدم العربي — مصنّفة في ١٠ تصنيفات، دقيقة وسريعة ومجانية تماماً.
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
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-ink-secondary shadow-sm transition-all hover:border-brand-300 hover:bg-brand-light hover:text-brand"
            >
              <span>{cat.icon}</span>
              <span>{cat.titleAr}</span>
              {cat.comingSoon && (
                <span className="rounded-full bg-ink-subtle px-1.5 py-0.5 text-[10px] font-bold text-ink-muted">
                  قريباً
                </span>
              )}
            </a>
          ))}
        </div>
      </nav>

      {/* ── Categories ── */}
      <main className="mx-auto max-w-5xl space-y-14 px-4 py-12 sm:py-16">
        {categories.map((cat) => (
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
                  {cat.titleAr}
                </h2>
                <span className="rounded-full border border-brand-border px-2 py-0.5 text-xs font-semibold text-ink-muted">
                  {cat.titleEn}
                </span>
                {cat.comingSoon ? (
                  <span className="rounded-full bg-ink-subtle px-2.5 py-0.5 text-xs font-bold text-ink-secondary">
                    قريباً
                  </span>
                ) : (
                  <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-bold text-brand">
                    {cat.tools.length} أدوات
                  </span>
                )}
              </div>
              <div className={`h-px flex-1 bg-gradient-to-l ${cat.color} opacity-20`} />
            </div>

            {cat.comingSoon ? (
              <ComingSoonCard cat={cat} />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cat.tools.map((tool) => (
                  <ToolCard key={tool.href} tool={tool} />
                ))}
              </div>
            )}
          </section>
        ))}
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
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-2xl shadow-sm group-hover:bg-brand-100">
        {tool.icon}
      </div>
      <h3 className="mb-2 text-lg font-bold text-ink group-hover:text-brand">
        {tool.title}
      </h3>
      <p className="flex-1 text-sm leading-relaxed text-ink-secondary">{tool.desc}</p>
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
        قسم <span className="text-brand">{cat.titleAr}</span> قادم قريباً
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
