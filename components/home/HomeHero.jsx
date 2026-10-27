"use client";

import { useState } from "react";
import Link from "next/link";
import HomeHeader from "./HomeHeader";
import BrandValueGrid from "./BrandValueGrid";
import HomeSearchDialog from "./HomeSearchDialog";

export default function HomeHero({ toolCount = 36 }) {
  const [searchOpen, setSearchOpen] = useState(false);

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

        {/* ── Integrated Header (Non-sticky, Logo on the Right) ── */}
        <HomeHeader />

        {/* ── Hero Content Body (Generous, balanced side padding) ── */}
        <div className="relative z-10 px-6 pt-6 pb-10 sm:px-10 sm:pt-8 sm:pb-12 lg:px-14 xl:px-16">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-14 max-w-[1240px] mx-auto">
            {/* ══════════════════════════════════════════════════════════════
                RIGHT SIDE IN RTL: HERO TEXT, H1, CTAS (FIRST CHILD IN RTL)
               ══════════════════════════════════════════════════════════════ */}
            <div className="text-center lg:text-start max-w-xl mx-auto lg:mx-0">
              {/* Kicker Pill */}
              <div className="qemlo-hero-kicker inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-[#F5F5F2] backdrop-blur-md transition-colors">
                <span className="h-2 w-2 rounded-full bg-[#FF5B04] animate-pulse" />
                <span>منصة أدوات عربية · مجانية · بلا تسجيل</span>
              </div>

              {/* H1 Heading */}
              <h1
                id="hero-title"
                className="qemlo-hero-title mt-6 text-3xl font-black leading-[1.25] tracking-tight sm:text-5xl lg:text-[54px] xl:text-[58px] transition-colors"
              >
                حاسبات الخليج المجانية
                <br />
                <span className="relative inline-block mt-2">
                  <span>في مكان واحد</span>
                  {/* Glowing orange underline bar matching boards */}
                  <span
                    className="absolute -bottom-2 inset-x-0 h-2.5 sm:h-3 rounded-full bg-[#FF5B04] shadow-[0_0_16px_rgba(255,91,4,0.85)]"
                    aria-hidden="true"
                  />
                </span>
              </h1>

              {/* Subtitle */}
              <p className="qemlo-hero-subtitle mt-6 text-base font-normal leading-relaxed text-[#B5B5B0] sm:text-lg sm:leading-8 max-w-xl mx-auto lg:mx-0 transition-colors">
                حاسبة الراتب ونهاية الخدمة والزكاة وضريبة القيمة المضافة والقروض
                لدول الخليج، مجانًا وبدون تسجيل.
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

            {/* ══════════════════════════════════════════════════════════════
                LEFT SIDE IN RTL: THE INTERACTIVE TOOL WINDOW CARD
               ══════════════════════════════════════════════════════════════ */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              {/* Outer Card: White on mobile (<lg), Dark Glass on desktop (lg+) */}
              <div className="qemlo-mobile-tool-container qemlo-hero-tool-window relative rounded-[32px] p-4 sm:p-6 shadow-2xl transition-all border lg:backdrop-blur-2xl">
                {/* Floating 'فاتورة جاهزة' badge: only visible on desktop where background is dark */}
                <div className="hidden lg:block absolute -top-3.5 start-6 z-20">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF8A3D] to-[#FF5B04] px-3.5 py-1 text-xs font-bold text-[#0D0D0D] shadow-md">
                    <span>فاتورة جاهزة</span>
                    <span>✓</span>
                  </span>
                </div>

                {/* Search Bar Input (White pill with orange search button on right and Ctrl K on left) */}
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
                  {/* In RTL: First child is on the RIGHT -> Orange Search Icon + Placeholder Text */}
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
                    <span style={{ color: "#333333" }} className="truncate text-xs sm:text-sm font-semibold">
                      ابحث في {toolCount} أداة...
                    </span>
                  </div>

                  {/* In RTL: Second child is on the LEFT -> Ctrl K badge */}
                  <div className="flex items-center shrink-0 ms-2">
                    <kbd className="hidden sm:inline-block rounded-md border border-[#D5D5CF] bg-[#F2F1EC] px-2 py-0.5 text-[11px] text-[#555] font-mono font-semibold">
                      Ctrl K
                    </kbd>
                  </div>
                </div>

                {/* Quick Chips */}
                <div className="mt-3.5 flex items-center justify-center gap-2 text-xs">
                  <Link
                    href="/salary-calculator"
                    className="qemlo-chip rounded-full px-3.5 py-1 font-semibold transition-colors bg-[#EAEAE5] text-[#444] lg:border lg:border-white/15 lg:bg-white/5 lg:text-[#DDD] hover:border-[#FF5B04] hover:text-[#FF5B04]"
                  >
                    الراتب
                  </Link>
                  <Link
                    href="/zakat-calculator"
                    className="qemlo-chip rounded-full px-3.5 py-1 font-semibold transition-colors bg-[#EAEAE5] text-[#444] lg:border lg:border-white/15 lg:bg-white/5 lg:text-[#DDD] hover:border-[#FF5B04] hover:text-[#FF5B04]"
                  >
                    الزكاة
                  </Link>
                  <Link
                    href="/gratuity-calculator"
                    className="qemlo-chip rounded-full px-3.5 py-1 font-semibold transition-colors bg-[#EAEAE5] text-[#444] lg:border lg:border-white/15 lg:bg-white/5 lg:text-[#DDD] hover:border-[#FF5B04] hover:text-[#FF5B04]"
                  >
                    نهاية الخدمة
                  </Link>
                </div>

                {/* 2x3 Tools Grid: White cards & center-aligned on Mobile, Dark glass horizontal on Desktop */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Card 1: حاسبات (رواتب وضرائب وزكاة) */}
                  <Link
                    href="/salary-calculator"
                    className="qemlo-mobile-tool-card group relative flex flex-col items-center justify-center rounded-[20px] p-4 text-center transition-all hover:scale-[1.02] lg:flex-row lg:items-center lg:justify-start lg:text-start lg:p-3 lg:hover:bg-white/10"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FF5B04] text-white shadow-md shadow-orange-500/25 mb-2 lg:mb-0 lg:me-2.5 lg:h-10 lg:w-10 lg:rounded-xl">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="16" y1="14" x2="16" y2="18" /><path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01" /></svg>
                    </span>
                    <div className="min-w-0 flex-1 text-center lg:text-start">
                      <h3 className="text-sm font-bold leading-tight">
                        حاسبات
                      </h3>
                      <p className="mt-0.5 text-[11px] truncate font-semibold">
                        رواتب وضرائب وزكاة
                      </p>
                    </div>
                  </Link>

                  {/* Card 2: فواتير وعروض (جاهزة للطباعة) */}
                  <Link
                    href="/ar/sa/e-invoice-generator"
                    className="qemlo-mobile-tool-card group relative flex flex-col items-center justify-center rounded-[20px] p-4 text-center transition-all hover:scale-[1.02] lg:flex-row lg:items-center lg:justify-start lg:text-start lg:p-3 lg:hover:bg-white/10"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1A1A1A] text-white shadow-sm mb-2 lg:mb-0 lg:me-2.5 lg:h-10 lg:w-10 lg:rounded-xl lg:border lg:border-white/10">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                    </span>
                    <div className="min-w-0 flex-1 text-center lg:text-start">
                      <h3 className="text-sm font-bold leading-tight">
                        فواتير وعروض
                      </h3>
                      <p className="mt-0.5 text-[11px] truncate font-semibold">
                        جاهزة للطباعة
                      </p>
                    </div>
                  </Link>

                  {/* Card 3: محولات (عملات ووحدات) */}
                  <Link
                    href="/currency-converter"
                    className="qemlo-mobile-tool-card group relative flex flex-col items-center justify-center rounded-[20px] p-4 text-center transition-all hover:scale-[1.02] lg:flex-row lg:items-center lg:justify-start lg:text-start lg:p-3 lg:hover:bg-white/10"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1A1A1A] text-white shadow-sm mb-2 lg:mb-0 lg:me-2.5 lg:h-10 lg:w-10 lg:rounded-xl lg:border lg:border-white/10">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                    </span>
                    <div className="min-w-0 flex-1 text-center lg:text-start">
                      <h3 className="text-sm font-bold leading-tight">
                        محولات
                      </h3>
                      <p className="mt-0.5 text-[11px] truncate font-semibold">
                        عملات ووحدات
                      </p>
                    </div>
                  </Link>

                  {/* Card 4: مساعد ذكي (لمتاجر واتساب) */}
                  <Link
                    href="/ar/business/ai-sales-closer"
                    className="qemlo-mobile-tool-card group relative flex flex-col items-center justify-center rounded-[20px] p-4 text-center transition-all hover:scale-[1.02] lg:flex-row lg:items-center lg:justify-start lg:text-start lg:p-3 lg:hover:bg-white/10"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FF5B04] text-white shadow-md shadow-orange-500/25 mb-2 lg:mb-0 lg:me-2.5 lg:h-10 lg:w-10 lg:rounded-xl">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" /></svg>
                    </span>
                    <div className="min-w-0 flex-1 text-center lg:text-start">
                      <h3 className="text-sm font-bold leading-tight">
                        مساعد ذكي
                      </h3>
                      <p className="mt-0.5 text-[11px] truncate font-semibold">
                        لمتاجر واتساب
                      </p>
                    </div>
                  </Link>

                  {/* Card 5: التواريخ (هجري وميلادي) */}
                  <Link
                    href="/date-converter"
                    className="qemlo-mobile-tool-card group relative flex flex-col items-center justify-center rounded-[20px] p-4 text-center transition-all hover:scale-[1.02] lg:flex-row lg:items-center lg:justify-start lg:text-start lg:p-3 lg:hover:bg-white/10"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FF5B04] text-white shadow-md shadow-orange-500/25 mb-2 lg:mb-0 lg:me-2.5 lg:h-10 lg:w-10 lg:rounded-xl">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    </span>
                    <div className="min-w-0 flex-1 text-center lg:text-start">
                      <h3 className="text-sm font-bold leading-tight">
                        التواريخ
                      </h3>
                      <p className="mt-0.5 text-[11px] truncate font-semibold">
                        هجري وميلادي
                      </p>
                    </div>
                  </Link>

                  {/* Card 6: PDF وصور (قريباً) */}
                  <div className="qemlo-mobile-tool-card relative flex flex-col items-center justify-center rounded-[20px] p-4 text-center opacity-85 lg:flex-row lg:items-center lg:justify-start lg:text-start lg:p-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1A1A1A] text-white shadow-sm mb-2 lg:mb-0 lg:me-2.5 lg:h-10 lg:w-10 lg:rounded-xl lg:border lg:border-white/10">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    </span>
                    <div className="min-w-0 flex-1 text-center lg:text-start">
                      <h3 className="text-sm font-bold leading-tight">
                        PDF وصور
                      </h3>
                      <p className="mt-0.5 text-[11px] truncate font-semibold">
                        قريباً
                      </p>
                    </div>
                  </div>
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

          {/* ══════════════════════════════════════════════════════════════
              BOTTOM 4 WHITE VALUE CARDS (MATCHING SCREENSHOT 1 & 2)
             ══════════════════════════════════════════════════════════════ */}
          <div className="max-w-[1240px] mx-auto w-full">
            <BrandValueGrid />
          </div>
        </div>
      </div>

      {/* Accessible Search Dialog */}
      <HomeSearchDialog
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </section>
  );
}
