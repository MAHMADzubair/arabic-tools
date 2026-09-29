"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Analytics helper ────────────────────────────────────────────────────────
function track(event, params = {}) {
  if (typeof window !== "undefined" && typeof window.trackEvent === "function") {
    window.trackEvent(event, params);
  }
}

// ─── Section observer for analytics ─────────────────────────────────────────
function useInViewTrack(eventName, params = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let fired = false;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !fired) {
        fired = true;
        track(eventName, params);
        obs.disconnect();
      }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [eventName]);
  return ref;
}

// ─── Small UI helpers ────────────────────────────────────────────────────────
function SectionBadge({ children }) {
  return (
    <span className="inline-block rounded-full bg-brand/10 border border-brand/20 px-3 py-1 text-xs font-black text-brand mb-3">
      {children}
    </span>
  );
}

function SectionTitle({ children, className = "" }) {
  return <h2 className={`text-2xl sm:text-3xl font-black text-ink leading-tight ${className}`}>{children}</h2>;
}

function PrimaryBtn({ children, onClick, className = "", type = "button" }) {
  return (
    <button type={type} onClick={onClick}
      className={`rounded-2xl bg-brand hover:bg-brand-dark text-white font-black px-7 py-3.5 text-sm shadow-result transition-all hover:scale-[1.02] active:scale-[0.98] ${className}`}>
      {children}
    </button>
  );
}

// ─── HERO SECTION ────────────────────────────────────────────────────────────
function HeroSection({ onCTAClick }) {
  return (
    <section className="relative overflow-hidden bg-hero-gradient text-white py-20 sm:py-28 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-300 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/30 px-4 py-1.5 text-xs font-bold text-white/90">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-2 w-2 bg-emerald-400" /></span>
          برنامج تجريبي مفتوح — أماكن محدودة
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl font-black leading-tight text-white">
          اكتشف أين تضيع<br />
          <span className="text-amber-300">مبيعاتك على واتساب</span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
          حلل المحادثات، اكتشف اعتراضات العملاء، تابع العملاء الصامتين، واعرف المبيعات التي كان يمكن استعادتها.
        </p>

        {/* Supporting line */}
        <p className="text-sm text-white/70 max-w-xl mx-auto">
          حوّل محادثات واتساب الضائعة إلى فرص بيع قابلة للقياس
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button onClick={() => { track("pilot_cta_click", { location: "hero" }); onCTAClick(); }}
            className="rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black px-8 py-4 text-base shadow-result transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto">
            انضم إلى البرنامج التجريبي ←
          </button>
          <a href="#how-it-works"
            className="rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold px-7 py-4 text-sm transition-all w-full sm:w-auto text-center">
            شاهد كيف يعمل ▾
          </a>
        </div>

        {/* Trust note */}
        <p className="text-xs text-white/55 pt-1">بدون التزام — برنامج تجريبي محدود للمتاجر السعودية</p>

        {/* Platform pills */}
        <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
          {["سلة", "Shopify", "Zid", "واتساب بيزنس"].map(p => (
            <span key={p} className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs text-white/75">{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PROBLEM SECTION ─────────────────────────────────────────────────────────
const PROBLEMS = [
  { icon: "💸", title: "العميل يسأل عن السعر ثم يختفي",       desc: "يحدث يومياً — ولا أحد يعرف لماذا توقف." },
  { icon: "🤔", title: "«بفكر» ولا يتابعه أحد",                desc: "كثير من هؤلاء العملاء قد لا يعودون بدون متابعة مناسبة." },
  { icon: "🚚", title: "سؤال عن التوصيل بدون رد سريع",         desc: "التأخر في الرد يكلّف البيع." },
  { icon: "💳", title: "توقف قبل إتمام الدفع",                 desc: "كان على وشك الشراء — ثم اختفى." },
  { icon: "😴", title: "المندوب ينسى المتابعة",                desc: "المتابعة اليدوية لا تتوسع مع الحجم." },
  { icon: "🔁", title: "نفس الاعتراض يتكرر ولا أحد يلاحظه",   desc: "بيانات ذهبية تضيع في كل محادثة." },
];

function ProblemSection() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="text-center space-y-2">
          <SectionBadge>المشكلة</SectionBadge>
          <SectionTitle>كم عملية بيع تخسرها دون أن تعرف؟</SectionTitle>
          <p className="text-ink-secondary text-sm max-w-xl mx-auto mt-2">كل محادثة واتساب تحتوي على بيانات — لكن معظمها يضيع دون تحليل أو متابعة.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROBLEMS.map(({ icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-brand-border bg-slate-50/70 p-5 space-y-2 hover:shadow-card-hover hover:border-brand/40 transition-all">
              <span className="text-3xl">{icon}</span>
              <p className="text-sm font-extrabold text-ink">{title}</p>
              <p className="text-xs text-ink-secondary leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "١", icon: "🔗", title: "اربط واتساب ومتجرك",
    desc: "تكامل مخطط مع سلة وShopify وZid — سيكون متاحاً عند الإطلاق.",
    tag: "قريباً",
    platforms: ["سلة", "Shopify", "Zid"],
  },
  {
    num: "٢", icon: "🧠", title: "الذكاء الاصطناعي يفهم المحادثات",
    desc: "يكتشف نية الشراء، الاعتراض على السعر، القلق من التوصيل، وحالات الصمت.",
    signals: ["نية الشراء", "اعتراض السعر", "قلق التوصيل", "مشكلة الدفع", "عدم الثقة", "الصمت"],
  },
  {
    num: "٣", icon: "🎯", title: "يصنف العملاء",
    labels: [
      { txt: "ساخن 🔥",   bg: "bg-rose-100 text-rose-800 border-rose-200" },
      { txt: "دافئ ☀️",   bg: "bg-amber-100 text-amber-800 border-amber-200" },
      { txt: "بارد 🧊",   bg: "bg-blue-100 text-blue-800 border-blue-200" },
    ],
  },
  {
    num: "٤", icon: "📩", title: "ينشئ متابعة مناسبة",
    flows: ["متابعة بعد ساعتين من الصمت", "رد على اعتراض السعر", "تذكير باكتمال الطلب", "تسخين تدريجي للعميل البارد"],
  },
  {
    num: "٥", icon: "📊", title: "يعرض سبب خسارة المبيعات",
    desc: "تقارير واضحة: أكثر الاعتراضات تكراراً، العملاء الضائعين، الفرص القابلة للاستعادة.",
  },
];

function HowItWorksSection() {
  const ref = useInViewTrack("demo_section_view");
  return (
    <section id="how-it-works" ref={ref} className="py-16 sm:py-20 px-4 bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="text-center space-y-2">
          <SectionBadge>كيف يعمل</SectionBadge>
          <SectionTitle>٥ خطوات من المحادثة إلى المبيعة المستعادة</SectionTitle>
        </div>
        <div className="space-y-4">
          {STEPS.map((s) => (
            <div key={s.num} className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6 flex gap-4 hover:shadow-card transition-all">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white font-black text-base">{s.num}</div>
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xl">{s.icon}</span>
                  <p className="text-sm sm:text-base font-extrabold text-ink">{s.title}</p>
                  {s.tag && <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5">{s.tag}</span>}
                </div>
                {s.desc && <p className="text-xs text-ink-secondary leading-relaxed">{s.desc}</p>}
                {s.platforms && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {s.platforms.map(p => (
                      <span key={p} className="rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-ink-secondary px-2.5 py-0.5">{p} — قريباً</span>
                    ))}
                  </div>
                )}
                {s.signals && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {s.signals.map(sig => (
                      <span key={sig} className="rounded-full bg-brand/10 border border-brand/20 text-[11px] font-bold text-brand px-2 py-0.5">{sig}</span>
                    ))}
                  </div>
                )}
                {s.labels && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {s.labels.map(l => (
                      <span key={l.txt} className={`rounded-full border text-xs font-black px-3 py-1 ${l.bg}`}>{l.txt}</span>
                    ))}
                  </div>
                )}
                {s.flows && (
                  <ul className="space-y-1 pt-1">
                    {s.flows.map(f => <li key={f} className="text-xs text-ink-secondary flex items-center gap-1.5"><span className="text-brand font-black">→</span>{f}</li>)}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── DEMO DASHBOARD (SAMPLE DATA ONLY) ───────────────────────────────────────
function DemoDashboard() {
  const FUNNEL = [
    { label: "إجمالي محادثات واتساب",        val: "1,284", pct: 100, color: "bg-brand" },
    { label: "عميل جاد أبدى اهتماماً",        val: "327",   pct: 25,  color: "bg-indigo-400" },
    { label: "استلموا معلومات المنتج",         val: "184",   pct: 56,  color: "bg-violet-400" },
    { label: "سألوا عن السعر",                val: "91",    pct: 49,  color: "bg-amber-400" },
    { label: "اختفوا بعد السعر",              val: "63",    pct: 69,  color: "bg-rose-400" },
    { label: "سألوا عن التوصيل",              val: "28",    pct: 31,  color: "bg-orange-400" },
    { label: "توقفوا قبل إتمام الدفع",         val: "17",    pct: 19,  color: "bg-red-500" },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="text-center space-y-2">
          <SectionBadge>تحليل خسارة المبيعات</SectionBadge>
          <SectionTitle>لماذا خسرت هذه المبيعات؟</SectionTitle>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800 mt-2">
            ⚠️ بيانات تجريبية — نموذج توضيحي فقط
          </div>
        </div>

        {/* Funnel */}
        <div className="rounded-2xl border border-brand-border bg-slate-50 p-5 sm:p-6 space-y-3">
          <p className="text-xs font-extrabold text-ink-secondary mb-4">مسار المحادثات (نموذج بيانات تجريبية):</p>
          {FUNNEL.map(({ label, val, pct, color }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-ink-secondary font-bold">{label}</span>
                <span className="text-sm font-black text-ink">{val}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Insight cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-5 space-y-2 text-center">
            <p className="text-3xl font-black text-rose-700">31%</p>
            <p className="text-xs font-extrabold text-rose-900">أكثر سبب لخسارة المبيعات</p>
            <p className="text-xs text-rose-700">اعتراض السعر</p>
            <p className="text-[10px] text-rose-500/70 mt-1">بيانات نموذجية</p>
          </div>
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 space-y-2 text-center">
            <p className="text-3xl font-black text-amber-700">37</p>
            <p className="text-xs font-extrabold text-amber-900">عميل جاهز للشراء</p>
            <p className="text-xs text-amber-700">لم يحصل على متابعة</p>
            <p className="text-[10px] text-amber-500/70 mt-1">بيانات نموذجية</p>
          </div>
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 space-y-2 text-center">
            <p className="text-3xl font-black text-emerald-700">54</p>
            <p className="text-xs font-extrabold text-emerald-900">فرصة قابلة للاستعادة</p>
            <p className="text-xs text-emerald-700">مثال تقديري فقط</p>
            <p className="text-[10px] text-emerald-500/70 mt-1">بيانات نموذجية</p>
          </div>
        </div>

        {/* Objection categories */}
        <div className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6 space-y-4">
          <p className="text-sm font-extrabold text-ink">ما الذي يمنع العميل من الشراء؟</p>
          <p className="text-[10px] text-ink-muted">بيانات نموذجية توضيحية</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "السعر",              pct: 31, color: "bg-rose-500" },
              { label: "التوصيل",            pct: 22, color: "bg-orange-400" },
              { label: "الثقة بالمتجر",      pct: 15, color: "bg-amber-400" },
              { label: "توفر المنتج",        pct: 12, color: "bg-violet-400" },
              { label: "مشكلة الدفع",        pct: 9,  color: "bg-pink-400" },
              { label: "تأخر الرد",          pct: 7,  color: "bg-blue-400" },
              { label: "عدم المتابعة",       pct: 3,  color: "bg-slate-400" },
              { label: "العميل غير جاهز",    pct: 1,  color: "bg-slate-300" },
            ].map(({ label, pct, color }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-ink-secondary">{label}</span>
                  <span className="text-[11px] font-black text-ink">{pct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct * 3.2}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── RECOVERY AUTOMATION ─────────────────────────────────────────────────────
function RecoverySection() {
  const FLOWS = [
    { trigger: 'العميل يصمت بعد الرد',     action: 'متابعة تلقائية بعد ساعتين', icon: '🔔', color: 'border-blue-200 bg-blue-50' },
    { trigger: '"غالي شوي"',               action: 'رد على اعتراض السعر (وفق قواعد المتجر)', icon: '💬', color: 'border-amber-200 bg-amber-50' },
    { trigger: '"بفكر"',                   action: 'متابعة مؤجلة تدريجية', icon: '⏰', color: 'border-violet-200 bg-violet-50' },
    { trigger: 'بدأ عملية الشراء ولم يكمل', action: 'تذكير باكتمال الطلب', icon: '🛒', color: 'border-emerald-200 bg-emerald-50' },
    { trigger: 'عميل عالي القيمة',          action: 'تنبيه فوري للمندوب', icon: '⭐', color: 'border-rose-200 bg-rose-50' },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="text-center space-y-2">
          <SectionBadge>الاستعادة التلقائية</SectionBadge>
          <SectionTitle>استعد العملاء تلقائياً</SectionTitle>
          <p className="text-xs text-ink-secondary mt-2">جميع الردود التلقائية تعمل وفق قواعد يحددها صاحب المتجر فقط.</p>
        </div>
        <div className="space-y-3">
          {FLOWS.map(({ trigger, action, icon, color }) => (
            <div key={trigger} className={`rounded-2xl border ${color} p-4 sm:p-5 flex items-center gap-4`}>
              <span className="text-2xl shrink-0">{icon}</span>
              <div className="flex-1 grid sm:grid-cols-2 gap-1 sm:gap-4 items-center">
                <div>
                  <p className="text-[10px] font-bold text-ink-muted mb-0.5">الحالة</p>
                  <p className="text-sm font-extrabold text-ink">{trigger}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-ink-muted mb-0.5">الإجراء التلقائي</p>
                  <p className="text-sm font-bold text-brand">{action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 leading-relaxed">
          ⚠️ <strong>مهم:</strong> لا يرسل النظام خصومات أو عروضاً بشكل مستقل. كل رد تلقائي يعمل حصراً وفق القواعد والعروض التي يحددها صاحب المتجر مسبقاً.
        </div>
      </div>
    </section>
  );
}

// ─── MERCHANT CONTROL ────────────────────────────────────────────────────────
function MerchantControlSection() {
  const CONTROLS = [
    "الخصومات والعروض المسموح بها",
    "توقيت المتابعة",
    "نبرة الردود",
    "تحويل فوري لمندوب بشري",
    "العملاء والفئات المستثناة",
    "المنتجات والأقسام المخصصة",
    "ساعات العمل والمواعيد",
    "حدود الردود التلقائية",
  ];
  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="text-center space-y-2">
          <SectionBadge>التحكم الكامل</SectionBadge>
          <SectionTitle>أنت تتحكم بالقواعد</SectionTitle>
          <p className="text-ink-secondary text-sm max-w-xl mx-auto">النظام لا يتصرف باستقلالية — كل شيء يعمل وفق الحدود التي تحددها.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CONTROLS.map(c => (
            <div key={c} className="rounded-2xl border border-brand-border bg-slate-50 p-4 text-center space-y-2">
              <span className="text-2xl">⚙️</span>
              <p className="text-xs font-bold text-ink leading-snug">{c}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-brand/30 bg-brand/5 p-5 space-y-2">
          <p className="text-sm font-extrabold text-ink flex items-center gap-2"><span>🤝</span><span>متى يتدخل فريق المبيعات؟</span></p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {["عميل عالي القيمة", "عميل غاضب", "طلب تسعير مخصص", "مشكلة دفع", "توصيل عاجل", "اعتراض متكرر"].map(s => (
              <div key={s} className="flex items-center gap-1.5 text-xs text-ink-secondary"><span className="text-brand font-black">→</span>{s}</div>
            ))}
          </div>
          <p className="text-xs font-bold text-brand mt-2">⚡ تنبيه فوري لمندوب المبيعات</p>
        </div>
      </div>
    </section>
  );
}

// ─── DASHBOARD PREVIEW ───────────────────────────────────────────────────────
function DashboardPreview() {
  const WIDGETS = [
    { label: "عملاء ساخنون",         val: "23",    icon: "🔥", color: "border-rose-200 bg-rose-50 text-rose-800"     },
    { label: "عملاء دافئون",         val: "58",    icon: "☀️", color: "border-amber-200 bg-amber-50 text-amber-800"  },
    { label: "عملاء بارد",           val: "143",   icon: "🧊", color: "border-blue-200 bg-blue-50 text-blue-800"     },
    { label: "متابعات فائتة",        val: "12",    icon: "⏰", color: "border-slate-200 bg-slate-50 text-slate-700"  },
    { label: "عملاء تمت استعادتهم",  val: "9",     icon: "✅", color: "border-emerald-200 bg-emerald-50 text-emerald-800" },
    { label: "الاعتراض الأكثر تكراراً", val: "السعر", icon: "📌", color: "border-violet-200 bg-violet-50 text-violet-800" },
  ];
  return (
    <section className="py-16 sm:py-20 px-4 bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="text-center space-y-2">
          <SectionBadge>لوحة التحكم</SectionBadge>
          <SectionTitle>كل شيء في مكان واحد</SectionTitle>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
            واجهة تجريبية — بيانات نموذجية فقط
          </div>
        </div>
        <div className="rounded-3xl border-2 border-brand/20 bg-white shadow-result overflow-hidden">
          <div className="bg-brand px-5 py-3 flex items-center gap-2">
            <span className="text-white font-black text-sm">AI Sales Closer</span>
            <span className="mr-auto rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] text-white/80 font-bold">واجهة تجريبية</span>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {WIDGETS.map(({ label, val, icon, color }) => (
              <div key={label} className={`rounded-2xl border p-4 space-y-1 ${color}`}>
                <p className="text-xl">{icon}</p>
                <p className="text-2xl font-black">{val}</p>
                <p className="text-[11px] font-bold leading-snug opacity-80">{label}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-brand-border px-5 py-3 flex items-center justify-between">
            <p className="text-[11px] text-ink-muted">آخر تحديث: للتو</p>
            <p className="text-[11px] font-bold text-brand">بيانات نموذجية — ليست نتائج حقيقية</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── IDEAL CUSTOMER ──────────────────────────────────────────────────────────
function IdealCustomerSection() {
  const WHO = [
    { icon: "🛍️", label: "متاجر سلة",               desc: "تستقبل استفسارات واتساب يومياً" },
    { icon: "🛒", label: "متاجر Shopify",             desc: "تعتمد على واتساب لإغلاق المبيعات" },
    { icon: "🏪", label: "متاجر Zid",                desc: "فرق مبيعات صغيرة تتعامل مع حجم كبير" },
    { icon: "💬", label: "متاجر تعتمد على واتساب",    desc: "واتساب هو قناة المبيعات الرئيسية" },
    { icon: "👥", label: "فرق مبيعات صغيرة",          desc: "لا وقت لمتابعة كل عميل يدوياً" },
    { icon: "📈", label: "متاجر في مرحلة النمو",       desc: "تريد قياس وتحسين أداء المبيعات" },
  ];
  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="text-center space-y-2">
          <SectionBadge>الفئة المستهدفة</SectionBadge>
          <SectionTitle>لمن هذا المنتج؟</SectionTitle>
          <p className="text-ink-secondary text-sm max-w-xl mx-auto">نبحث تحديداً عن متاجر سعودية تعتمد على واتساب كقناة مبيعات رئيسية.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {WHO.map(({ icon, label, desc }) => (
            <div key={label} className="rounded-2xl border border-brand-border bg-slate-50 p-5 space-y-2 hover:border-brand/40 hover:shadow-card transition-all">
              <span className="text-3xl">{icon}</span>
              <p className="text-sm font-extrabold text-ink">{label}</p>
              <p className="text-xs text-ink-secondary leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── INTEGRATIONS ────────────────────────────────────────────────────────────
function IntegrationsSection() {
  const PLATFORMS = [
    { name: "سلة",                icon: "🛍️", status: "قريباً" },
    { name: "Shopify",            icon: "🛒", status: "قريباً" },
    { name: "Zid",                icon: "🏪", status: "قريباً" },
    { name: "واتساب بيزنس",       icon: "💬", status: "قريباً" },
  ];
  return (
    <section className="py-12 px-4 bg-slate-50">
      <div className="mx-auto max-w-4xl space-y-6 text-center">
        <SectionBadge>التكاملات</SectionBadge>
        <SectionTitle>يتكامل مع أدوات متجرك</SectionTitle>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          {PLATFORMS.map(({ name, icon, status }) => (
            <div key={name} className="rounded-2xl border border-brand-border bg-white px-6 py-4 flex items-center gap-3 shadow-card">
              <span className="text-2xl">{icon}</span>
              <div className="text-right">
                <p className="text-sm font-extrabold text-ink">{name}</p>
                <p className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 mt-0.5 inline-block">{status}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-muted">لا يوجد تكامل مباشر في الوقت الحالي — سيتم الإعلان عند الإطلاق</p>
      </div>
    </section>
  );
}

// ─── PILOT OFFER ─────────────────────────────────────────────────────────────
function PilotOfferSection({ onCTAClick }) {
  return (
    <section className="py-16 sm:py-20 px-4 bg-hero-gradient text-white">
      <div className="mx-auto max-w-4xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/30 px-4 py-1.5 text-xs font-bold">
          <span>🚀</span> برنامج تجريبي محدود
        </div>
        <SectionTitle className="text-white">نبحث عن متاجر سعودية رائدة</SectionTitle>
        <p className="text-white/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          نبحث عن عدد محدود من المتاجر السعودية لتجربة النظام والمشاركة في تطوير أول نسخة — مقابل وصول مبكر وتأثير مباشر على المنتج.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-right">
          {[
            "وصول مبكر قبل الإطلاق العام",
            "دعم مباشر في الإعداد",
            "قناة تواصل مباشرة مع الفريق",
            "فرصة تسعير خاص للمشاركين الأوائل",
            "تأثير مباشر على خارطة المنتج",
            "أماكن محدودة جداً",
          ].map(b => (
            <div key={b} className="flex items-start gap-2 text-xs text-white/85">
              <span className="text-emerald-400 font-black mt-0.5 shrink-0">✓</span>{b}
            </div>
          ))}
        </div>
        <button onClick={() => { track("pilot_cta_click", { location: "pilot_section" }); onCTAClick(); }}
          className="rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black px-8 py-4 text-base shadow-result transition-all hover:scale-[1.02] inline-block">
          اطلب الوصول المبكر ←
        </button>
      </div>
    </section>
  );
}

// ─── WAITLIST FORM ────────────────────────────────────────────────────────────
const PLATFORM_OPTIONS = [
  { val: "salla",   label: "سلة" },
  { val: "shopify", label: "Shopify" },
  { val: "zid",     label: "Zid" },
  { val: "other",   label: "أخرى" },
];
const VOLUME_OPTIONS = [
  { val: "lt_100",   label: "أقل من 100 محادثة" },
  { val: "100_500",  label: "100 – 500 محادثة" },
  { val: "500_2000", label: "500 – 2000 محادثة" },
  { val: "gt_2000",  label: "أكثر من 2000 محادثة" },
];
const PROBLEM_OPTIONS = [
  { val: "no_followup",    label: "عدم المتابعة مع العملاء" },
  { val: "price_objection", label: "اعتراض السعر" },
  { val: "slow_response",  label: "تأخر الرد" },
  { val: "cart_abandon",   label: "التخلي قبل إتمام الدفع" },
  { val: "unknown_loss",   label: "صعوبة معرفة سبب خسارة البيع" },
  { val: "other",          label: "أخرى" },
];

function WaitlistForm({ formRef }) {
  const [form, setForm] = useState({ name:"", storeName:"", email:"", whatsapp:"", platform:"", volume:"", problem:"", trialInterest:"", _honey:"" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    track("pilot_form_submitted", { platform: form.platform, problem: form.problem });
    try {
      const res = await fetch("/api/pilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.errors) setErrors(data.errors);
        else setErrors({ _global: "حدث خطأ — يرجى المحاولة مرة أخرى" });
        setStatus("error");
        track("pilot_form_error", { reason: data.error || "validation", platform: form.platform });
      } else {
        setStatus("success");
      }
    } catch {
      setErrors({ _global: "تعذّر الإرسال — يرجى التحقق من الاتصال والمحاولة مرة أخرى" });
      setStatus("error");
      track("pilot_form_error", { reason: "network", platform: form.platform });
    }
  };

  const inputCls = (key) =>
    `w-full rounded-xl border ${errors[key] ? "border-rose-400 bg-rose-50" : "border-brand-border bg-white"} px-3.5 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none transition-colors`;

  const selectCls = (key) =>
    `w-full rounded-xl border ${errors[key] ? "border-rose-400 bg-rose-50" : "border-brand-border bg-white"} px-3.5 py-2.5 text-sm font-bold text-ink focus:border-brand focus:outline-none appearance-none cursor-pointer`;

  if (status === "success") {
    return (
      <div ref={formRef} className="rounded-3xl border-2 border-emerald-400 bg-emerald-50 p-10 text-center space-y-4">
        <p className="text-5xl">✅</p>
        <h3 className="text-xl font-black text-emerald-900">تم استلام طلبك</h3>
        <p className="text-sm text-emerald-800 leading-relaxed max-w-sm mx-auto">سنراجع بيانات متجرك ونتواصل معك عند بدء البرنامج التجريبي. نقدّر مشاركتك معنا.</p>
        <p className="text-xs text-emerald-600">تم تسجيل طلبك بنجاح — لا توجد التزامات.</p>
      </div>
    );
  }

  return (
    <div ref={formRef} className="rounded-3xl border-2 border-brand/30 bg-white shadow-result p-6 sm:p-8 space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-black text-ink">اطلب الوصول المبكر</h3>
        <p className="text-xs text-ink-secondary">أماكن محدودة — نتواصل معك شخصياً عند البدء</p>
      </div>
      {errors._global && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-bold">{errors._global}</div>
      )}
      {/* Honeypot */}
      <input type="text" name="_honey" value={form._honey} onChange={e => set("_honey", e.target.value)}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0 }} tabIndex={-1} autoComplete="off" aria-hidden />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-1">الاسم *</label>
            <input type="text" value={form.name} onChange={e => { set("name", e.target.value); track("pilot_form_started"); }}
              placeholder="اسمك الكريم" className={inputCls("name")} />
            {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-1">اسم المتجر *</label>
            <input type="text" value={form.storeName} onChange={e => set("storeName", e.target.value)}
              placeholder="اسم متجرك" className={inputCls("storeName")} />
            {errors.storeName && <p className="text-[11px] text-rose-600 mt-1">{errors.storeName}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-1">البريد الإلكتروني *</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
              placeholder="email@example.com" dir="ltr" className={inputCls("email")} />
            {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-1">رقم واتساب *</label>
            <input type="tel" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)}
              placeholder="+966 5x xxx xxxx" dir="ltr" className={inputCls("whatsapp")} />
            {errors.whatsapp && <p className="text-[11px] text-rose-600 mt-1">{errors.whatsapp}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-secondary mb-1">المنصة المستخدمة *</label>
          <select value={form.platform} onChange={e => { set("platform", e.target.value); track("platform_selected", { platform: e.target.value }); }} className={selectCls("platform")}>
            <option value="">اختر المنصة</option>
            {PLATFORM_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
          </select>
          {errors.platform && <p className="text-[11px] text-rose-600 mt-1">{errors.platform}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-secondary mb-1">عدد محادثات واتساب التقريبي شهرياً *</label>
          <select value={form.volume} onChange={e => set("volume", e.target.value)} className={selectCls("volume")}>
            <option value="">اختر النطاق</option>
            {VOLUME_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
          </select>
          {errors.volume && <p className="text-[11px] text-rose-600 mt-1">{errors.volume}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-secondary mb-1">أكبر مشكلة حالياً *</label>
          <select value={form.problem} onChange={e => { set("problem", e.target.value); track("problem_selected", { problem: e.target.value }); }} className={selectCls("problem")}>
            <option value="">اختر المشكلة الرئيسية</option>
            {PROBLEM_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
          </select>
          {errors.problem && <p className="text-[11px] text-rose-600 mt-1">{errors.problem}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-secondary mb-2">هل ترغب في تجربة نسخة تجريبية؟ *</label>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {[{ val: "yes", label: "نعم، أريد التجربة" }, { val: "maybe", label: "ربما — أخبرني أكثر" }].map(o => (
              <button key={o.val} type="button" onClick={() => set("trialInterest", o.val)}
                className={`rounded-xl border p-2.5 text-xs font-bold transition-all ${form.trialInterest === o.val ? "border-brand bg-brand-light text-brand-dark shadow-sm" : "border-brand-border bg-white text-ink-secondary hover:border-brand"}`}>
                {o.label}
              </button>
            ))}
          </div>
          {errors.trialInterest && <p className="text-[11px] text-rose-600 mt-1">{errors.trialInterest}</p>}
        </div>

        <button type="submit" disabled={status === "loading"}
          className="w-full rounded-2xl bg-brand hover:bg-brand-dark text-white font-black px-7 py-3.5 text-sm shadow-result transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed">
          {status === "loading" ? "⏳ جارٍ الإرسال..." : "اطلب الوصول المبكر ←"}
        </button>

        <p className="text-[10px] text-ink-muted text-center leading-relaxed">
          بإرسال هذا الطلب أنت توافق على التواصل معك حول البرنامج التجريبي. لا توجد التزامات مالية.
        </p>
      </form>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "هل هذا مجرد شات بوت؟", a: "لا. هذا المنتج ليس شات بوتاً. التركيز الأساسي هو تحليل أسباب خسارة المبيعات في محادثات واتساب، تصنيف العملاء، واستعادة الفرص الضائعة تلقائياً وفق قواعد يحددها صاحب المتجر." },
  { q: "هل يرسل خصومات تلقائياً؟", a: "لا. لا يمتلك النظام صلاحية تقديم خصومات أو عروض بشكل مستقل. كل رد تلقائي يعمل حصراً وفق العروض والقواعد التي يحددها صاحب المتجر مسبقاً." },
  { q: "هل يتكامل مع سلة وShopify؟", a: "التكاملات مع سلة وShopify وZid مخططة وستُعلَن عند الإطلاق. لا يوجد تكامل مباشر في الوقت الحالي — هذه مرحلة التحقق من الفكرة." },
  { q: "هل يمكن لفريقي التدخل يدوياً؟", a: "نعم. يوفر النظام إمكانية تحويل المحادثة لمندوب بشري في أي لحظة — بشكل تلقائي للحالات الحرجة أو يدوياً عند الحاجة." },
  { q: "هل يدعم العربية؟", a: "نعم. المنتج مُصمَّم أساساً للأسواق العربية وخاصةً السوق السعودية — العربية هي اللغة الأساسية." },
  { q: "هل يحلل أسباب خسارة المبيعات؟", a: "نعم، هذه إحدى الميزات الجوهرية. النظام يكتشف الأنماط المتكررة عبر المحادثات لتحديد الأسباب الرئيسية لعدم إتمام الشراء." },
  { q: "هل النظام متاح الآن؟", a: "حالياً نحن في مرحلة التحقق من الفكرة وجمع طلبات البرنامج التجريبي. سيحصل المشاركون الأوائل على وصول مبكر عند الإطلاق." },
];

function FaqSection() {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <SectionBadge>الأسئلة الشائعة</SectionBadge>
          <SectionTitle>أجوبة سريعة</SectionTitle>
        </div>
        <div className="space-y-2">
          {FAQS.map(({ q, a }, i) => (
            <div key={i} className="rounded-2xl border border-brand-border overflow-hidden">
              <button type="button" onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-right hover:bg-slate-50 transition-colors">
                <span className="text-sm font-extrabold text-ink">{q}</span>
                <span className="text-brand font-black shrink-0 mr-3">{open === i ? "▲" : "▼"}</span>
              </button>
              {open === i && (
                <div className="px-4 sm:px-5 pb-4 text-xs text-ink-secondary leading-relaxed border-t border-brand-border bg-slate-50/50 pt-3">
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── ROOT EXPORT ──────────────────────────────────────────────────────────────
export default function AiSalesCloserPage() {
  const formRef = useRef(null);
  const formSectionRef = useRef(null);

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => track("pilot_form_started"), 500);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-white">
      <HeroSection onCTAClick={scrollToForm} />
      <ProblemSection />
      <HowItWorksSection />
      <DemoDashboard />
      <RecoverySection />
      <MerchantControlSection />
      <DashboardPreview />
      <IdealCustomerSection />
      <IntegrationsSection />
      <PilotOfferSection onCTAClick={scrollToForm} />

      {/* Waitlist form section */}
      <section id="waitlist" ref={formSectionRef} className="py-16 sm:py-24 px-4 bg-slate-50">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <SectionBadge>برنامج تجريبي محدود</SectionBadge>
            <SectionTitle>انضم إلى قائمة الانتظار</SectionTitle>
            <p className="text-ink-secondary text-sm">بدون التزامات — نتواصل معك شخصياً عند بدء البرنامج</p>
          </div>
          <WaitlistForm formRef={formRef} />
        </div>
      </section>

      <FaqSection />

      {/* Footer note */}
      <div className="py-6 px-4 bg-white border-t border-brand-border text-center space-y-1">
        <p className="text-xs text-ink-muted">منتج قيد التطوير — هذه صفحة تحقق من الفكرة وليست إطلاقاً رسمياً.</p>
        <Link href="/" className="text-xs text-brand hover:underline font-bold">← العودة إلى أدوات عربية</Link>
      </div>
    </div>
  );
}

