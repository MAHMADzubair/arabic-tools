"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import BrandValueGrid from "./BrandValueGrid";

// Lazy-load HomeSearchDialog: excluded from initial JS bundle.
// The dialog only renders when searchOpen === true, so users who never open
// search never download it. The Ctrl+K / Cmd+K listener below is tiny and
// stays in the initial bundle so the keyboard shortcut always works.
const HomeSearchDialog = dynamic(() => import("./HomeSearchDialog"), { ssr: false });

const CHIP_CLASS =
  "qemlo-chip rounded-full px-3.5 py-1 font-semibold transition-colors bg-[#EAEAE5] text-[#444] lg:border lg:border-white/15 lg:bg-white/5 lg:text-[#DDD] hover:border-[#FF5B04] hover:text-[#FF5B04]";

const CARD_CLASS =
  "qemlo-mobile-tool-card group relative flex flex-col items-center justify-center rounded-[20px] p-4 text-center transition-all hover:scale-[1.02] lg:flex-row lg:items-center lg:justify-start lg:text-start lg:p-3 lg:hover:bg-white/10";

const ICON_ACCENT =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FF5B04] text-white shadow-md shadow-orange-500/25 mb-2 lg:mb-0 lg:me-2.5 lg:h-10 lg:w-10 lg:rounded-xl";

const ICON_DARK =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1A1A1A] text-white shadow-sm mb-2 lg:mb-0 lg:me-2.5 lg:h-10 lg:w-10 lg:rounded-xl lg:border lg:border-white/10";

const QUICK_CHIPS = [
  { href: "/salary-calculator", label: "الراتب" },
  { href: "/kaffara-calculator", label: "الكفارات" },
  { href: "/ar/sa/final-settlement-calculator", label: "المخالصة" },
];

const svgProps = {
  className: "h-5 w-5",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
};

const TOOL_CARDS = [
  {
    href: "/salary-calculator",
    title: "حاسبات",
    sub: "رواتب وضرائب وإجازات",
    accent: true,
    icon: (
      <svg {...svgProps}>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="16" y1="14" x2="16" y2="18" />
        <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
  },
  {
    href: "/ar/ae/purchase-order-generator",
    title: "أوامر الشراء",
    sub: "نموذج LPO للطباعة",
    accent: false,
    icon: (
      <svg {...svgProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: "/unit-converter",
    title: "محولات",
    sub: "أطوال وأوزان",
    accent: false,
    icon: (
      <svg {...svgProps}>
        <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    href: "/ar/ae/notice-period-calculator",
    title: "فترة الإنذار",
    sub: "قانون العمل الإماراتي",
    accent: true,
    icon: (
      <span aria-hidden="true" className="text-xl">
        ⏳
      </span>
    ),
  },
  {
    href: "/umrah-calculator",
    title: "تكلفة العمرة",
    sub: "ميزانية الرحلة",
    accent: true,
    icon: (
      <span aria-hidden="true" className="text-xl">
        🕋
      </span>
    ),
  },
  {
    href: "/inheritance-calculator",
    title: "الميراث",
    sub: "توزيع التركة شرعًا",
    accent: false,
    icon: (
      <span aria-hidden="true" className="text-xl">
        ⚖️
      </span>
    ),
  },
];

export default function HomeHero({ toolCount = 15 }) {
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K shortcut — tiny listener, always in initial bundle.
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section
      aria-labelledby="hero-title"
      className="relative w-full max-w-full mx-auto px-0 pt-0 pb-6 sm:pb-10"
    >
      {/* ── Main Hero Panel (Full-width Deep Ink with Ambient Radial Glows in dark, Soft Warm Cream in light) ── */}
      <div className="qemlo-hero-panel relative w-full overflow-hidden rounded-b-[24px] sm:rounded-b-[32px] border-b border-white/10 bg-[#0D0D0D] text-white shadow-2xl transition-colors duration-300">
        {/* Ambient Radial Orange Glow (top-right and bottom-left) */}
        <div
          className="qemlo-hero-glow-1 pointer-events-none absolute -top-32 -start-32 h-[550px] w-[550px] rounded-full bg-[radial-gradient(circle,rgba(255,91,4,0.25)_0%,rgba(13,13,13,0)_70%)] blur-3xl transition-all"
          aria-hidden="true"
        />
        <div
          className="qemlo-hero-glow-2 pointer-events-none absolute -bottom-32 -end-32 h-[550px] w-[550px] rounded-full bg-[radial-gradient(circle,rgba(255,91,4,0.18)_0%,rgba(13,13,13,0)_70%)] blur-3xl transition-all"
          aria-hidden="true"
        />

        {/* ── Hero Content Body ── */}
        <div className="relative z-10 px-6 pt-6 pb-10 sm:px-10 sm:pt-8 sm:pb-12 lg:px-14 xl:px-16">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-14 max-w-[1240px] mx-auto">
            {/* ══ RIGHT SIDE IN RTL: HERO TEXT, H1, CTAS ══ */}
            <div className="text-center lg:text-start max-w-xl mx-auto lg:mx-0">
              {/* Kicker Pill */}
              <div className="qemlo-hero-kicker inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-[#F5F5F2] backdrop-blur-md transition-colors">
                <span className="h-2 w-2 rounded-full bg-[#FF5B04] animate-pulse" />
                <span>منصة أدوات عربية · مجانية · بلا تسجيل</span>
              </div>

              {/* H1 Heading (SEO: high-intent terms) */}
              <h1
                id="hero-title"
                className="qemlo-hero-title mt-6 text-3xl font-black leading-[1.25] tracking-tight sm:text-5xl lg:text-[50px] xl:text-[54px] transition-colors"
              >
                حاسبات الرواتب ونهاية الخدمة والضرائب
                <br />
                <span className="relative inline-block mt-2">
                  <span>للسعودية والإمارات</span>
                  {/* Glowing orange underline bar */}
                  <span
                    className="absolute -bottom-2 inset-x-0 h-2.5 sm:h-3 rounded-full bg-[#FF5B04] shadow-[0_0_16px_rgba(255,91,4,0.85)]"
                    aria-hidden="true"
                  />
                </span>
              </h1>

              {/* Subtitle */}
              <p className="qemlo-hero-subtitle mt-6 text-base font-normal leading-relaxed text-[#B5B5B0] sm:text-lg sm:leading-8 max-w-xl mx-auto lg:mx-0 transition-colors">
                احسب مكافأة نهاية الخدمة والمخالصة النهائية وفترة الإنذار وضريبة الشركات
                والميراث وتكلفة العمرة، مجانًا وبدون تسجيل.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="#tools"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#FF8A3D] to-[#FF5B04] px-9 py-4 text-base font-bold text-[#0D0D0D] shadow-xl shadow-orange-500/25 transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  <span>ابدأ الآن</span>
                  <span>←</span>
                </a>
                <a
                  href="#tools"
                  className="qemlo-hero-secondary-btn w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 text-base font-bold text-white hover:bg-white/15 transition-all"
                >
                  استكشف الأدوات
                </a>
              </div>

              {/* Feature Checkmarks Row */}
              <div className="qemlo-hero-badges mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-5 sm:gap-7 text-xs sm:text-sm font-semibold text-[#8E8E89] transition-colors">
                <span className="flex items-center gap-1.5">
                  <span className="text-[#FF5B04]">✓</span>
                  مجاني
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[#FF5B04]">✓</span>
                  بدون تسجيل
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[#FF5B04]">✓</span>
                  يعمل على كل جهاز
                </span>
              </div>
            </div>

            {/* ══ LEFT SIDE IN RTL: THE INTERACTIVE TOOL WINDOW CARD ══ */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="qemlo-mobile-tool-container qemlo-hero-tool-window relative rounded-[32px] p-4 sm:p-6 shadow-2xl transition-all border lg:backdrop-blur-2xl">
                {/* Floating badge: only visible on desktop */}
                <div className="hidden lg:block absolute -top-3.5 start-6 z-20">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF8A3D] to-[#FF5B04] px-3.5 py-1 text-xs font-bold text-[#0D0D0D] shadow-md">
                    <span>فاتورة جاهزة</span>
                    <span>✓</span>
                  </span>
                </div>

                {/* Search Bar */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSearchOpen(true);
                    }
                  }}
                  style={{ backgroundColor: "#FFFFFF", color: "#0D0D0D" }}
                  className="qemlo-search-pill group flex cursor-pointer items-center justify-between rounded-full border border-orange-500/30 px-3.5 py-2.5 shadow-sm transition-transform hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#FF5B04] text-white shadow-md shadow-orange-500/30">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                      </svg>
                    </span>
                    <span
                      style={{ color: "#333333" }}
                      className="truncate text-xs sm:text-sm font-semibold"
                    >
                      ابحث في {toolCount} أداة مختارة...
                    </span>
                  </div>

                  <div className="flex items-center shrink-0 ms-2">
                    <kbd className="hidden sm:inline-block rounded-md border border-[#D5D5CF] bg-[#F2F1EC] px-2 py-0.5 text-[11px] text-[#555] font-mono font-semibold">
                      Ctrl K
                    </kbd>
                  </div>
                </div>

                {/* Quick Chips */}
                <div className="mt-3.5 flex items-center justify-center gap-2 text-xs">
                  {QUICK_CHIPS.map((chip) => (
                    <Link key={chip.href} href={chip.href} className={CHIP_CLASS}>
                      {chip.label}
                    </Link>
                  ))}
                </div>

                {/* 2x3 Tools Grid (all six cards are real links; no "coming soon" placeholders) */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                  {TOOL_CARDS.map((card) => (
                    <Link key={card.href} href={card.href} className={CARD_CLASS}>
                      <span className={card.accent ? ICON_ACCENT : ICON_DARK}>
                        {card.icon}
                      </span>
                      <div className="min-w-0 flex-1 text-center lg:text-start">
                        <h3 className="text-sm font-bold leading-tight">{card.title}</h3>
                        <p className="mt-0.5 text-[11px] truncate font-semibold">
                          {card.sub}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Bottom GCC Countries Chip */}
                <div className="mt-4 flex items-center justify-center">
                  <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-semibold text-[#8E8E89]">
                    6 دول خليجية
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 4 value cards */}
          <div className="max-w-[1240px] mx-auto w-full">
            <BrandValueGrid />
          </div>
        </div>
      </div>

      {/* Accessible Search Dialog */}
      <HomeSearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </section>
  );
}