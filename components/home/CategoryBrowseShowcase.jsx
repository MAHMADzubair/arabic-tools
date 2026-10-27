"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { CATEGORIES, getToolsByCategory } from "@/lib/registry";

// Professional inline SVGs for all categories instead of emojis
function getCategorySvg(id) {
  switch (id) {
    case "gulf":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M4 10l8-7 8 7" />
        </svg>
      );
    case "finance":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      );
    case "islamic":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    case "everyday":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "business":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    default:
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
  }
}

// Professional SVGs for individual tools
function getToolSvg(id) {
  if (id.includes("salary") || id.includes("overtime")) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    );
  }
  if (id.includes("gratuity") || id.includes("final-settlement") || id.includes("settlement")) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    );
  }
  if (id.includes("leave") || id.includes("vacation")) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  if (id.includes("vat") || id.includes("tax") || id.includes("invoice")) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="16" y1="14" x2="16" y2="18" />
        <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
    </svg>
  );
}

export default function CategoryBrowseShowcase() {
  const activeCategories = CATEGORIES.map((cat) => ({
    ...cat,
    tools: getToolsByCategory(cat.id),
  })).filter((cat) => cat.tools.length > 0);

  const [selectedCatId, setSelectedCatId] = useState(
    activeCategories[0]?.id || "gulf"
  );

  const carouselRef = useRef(null);

  const currentCategory =
    activeCategories.find((c) => c.id === selectedCatId) || activeCategories[0];

  const tools = currentCategory?.tools || [];

  // Carousel navigation handlers in RTL:
  // Clicking right arrow navigates to next items (positive scroll in RTL), left arrow goes back.
  const scrollCards = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = 300;
    carouselRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section
      dir="rtl"
      aria-labelledby="browse-category-title"
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12"
    >
      {/* ── Heading Row (Simple and clean) ── */}
      <div className="mb-6 text-center lg:text-start">
        <h2
          id="browse-category-title"
          className="text-2xl font-black tracking-tight text-[var(--text)] sm:text-3xl"
        >
          تصفح حسب القسم
        </h2>
        <p className="mt-1 text-xs font-semibold text-[var(--text-3)] sm:text-sm">
          اسحب لاختيار قسم، ثم افتح أدواته
        </p>
      </div>

      {/* ── Desktop Category Chips Strip (Centered Alignment) ── */}
      <div className="hidden lg:flex items-center justify-center gap-3 pb-4">
        {activeCategories.map((cat) => {
          const isSelected = cat.id === selectedCatId;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCatId(cat.id)}
              className={`group flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-bold transition-all ${
                isSelected
                  ? "bg-[#FF5B04] text-[#0D0D0D] shadow-lg shadow-orange-500/25 ring-2 ring-orange-500/50"
                  : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[#FF5B04]"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  isSelected ? "bg-black/15 text-black" : "bg-[var(--bg)] text-[var(--text)]"
                }`}
              >
                {getCategorySvg(cat.id)}
              </span>
              <span>{cat.nameAr}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-black ${
                  isSelected
                    ? "bg-black text-white"
                    : "bg-[var(--bg)] text-[var(--text-3)]"
                }`}
              >
                {cat.tools.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Mobile Rotating Marquee Slider (Continuous smooth infinite loop, NO scrollbar line) ── */}
      <div className="block lg:hidden overflow-hidden w-full pb-2 select-none -webkit-mask-image-linear-gradient">
        <div className="qemlo-mobile-marquee gap-2.5">
          {[...activeCategories, ...activeCategories].map((cat, idx) => {
            const isSelected = cat.id === selectedCatId;
            return (
              <button
                key={`${cat.id}-${idx}`}
                type="button"
                onClick={() => setSelectedCatId(cat.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-[#FF5B04] text-[#0D0D0D] shadow-md shadow-orange-500/30"
                    : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    isSelected ? "bg-black/15 text-black" : "bg-[var(--bg)] text-[var(--text)]"
                  }`}
                >
                  {getCategorySvg(cat.id)}
                </span>
                <span>{cat.nameAr}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    isSelected
                      ? "bg-black text-white"
                      : "bg-[var(--bg)] text-[var(--text-3)]"
                  }`}
                >
                  {cat.tools.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MAIN DISPLAY CARD (Matching Desktop & Mobile Boards)
         ══════════════════════════════════════════════════════════════ */}
      <div className="mt-4 rounded-[28px] sm:rounded-[36px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 shadow-xl">
        {/* ── DESKTOP LAYOUT (lg+): Banner Card on Right + Exactly 3 Tool Cards on Left ── */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6 items-stretch">
          {/* Left 8 Cols: Most Used Tools Header & Exactly 3 Cards */}
          <div className="col-span-8 flex flex-col justify-between">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--text)]">
                  الأدوات الأكثر استخداماً
                </h3>
                <p className="text-xs text-[var(--text-3)]">
                  ابدأ من هنا، أو اعرض كل أدوات القسم
                </p>
              </div>

              {/* The Single Unified Carousel Navigation Arrows with corrected RTL direction */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollCards("right")}
                  aria-label="السابق"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] transition hover:bg-[#FF5B04] hover:text-black"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => scrollCards("left")}
                  aria-label="التالي"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] transition hover:bg-[#FF5B04] hover:text-black"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Exactly 3 Tool Cards in View (Smooth scroll if more) */}
            <div
              ref={carouselRef}
              className="no-scrollbar grid grid-flow-col auto-cols-[calc((100%-2rem)/3)] gap-4 overflow-x-auto pb-2 scroll-smooth"
            >
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative flex flex-col justify-between rounded-[22px] border border-[var(--border)] bg-[var(--bg)] p-4 transition-all hover:-translate-y-1 hover:border-[#FF5B04] hover:shadow-lg"
                >
                  <div>
                    {/* Badge & SVG Icon */}
                    <div className="flex items-center justify-between">
                      <span className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-3)]">
                        {tool.badge || "عام"}
                      </span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF8A3D] to-[#FF5B04] text-white shadow-md shadow-orange-500/20">
                        {getToolSvg(tool.id)}
                      </span>
                    </div>

                    {/* Tool Name & Description */}
                    <h4 className="mt-3.5 text-sm font-bold text-[var(--text)] group-hover:text-[#FF5B04] transition-colors leading-tight line-clamp-1">
                      {tool.nameAr}
                    </h4>
                    <p className="mt-1 text-xs text-[var(--text-2)] line-clamp-2 leading-relaxed">
                      {tool.descAr}
                    </p>
                  </div>

                  {/* Open Tool Link Arrow */}
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#FF5B04] pt-2 border-t border-[var(--border)]">
                    <span>افتح الأداة</span>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right 4 Cols: Big Orange Category Spotlight Banner */}
          <div className="col-span-4 relative flex flex-col justify-between overflow-hidden rounded-[26px] bg-gradient-to-b from-[#FF7A29] to-[#FF5B04] p-6 text-white shadow-xl shadow-orange-500/20">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20 text-white backdrop-blur-md">
                  {getCategorySvg(currentCategory.id)}
                </span>
                <h3 className="text-2xl font-black tracking-tight text-white">
                  {currentCategory.nameAr}
                </h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/90 font-medium">
                رواتب ونهاية خدمة وضرائب لدول الخليج، كلها في مكان واحد.
              </p>

              {/* GCC flags/country indicator badges */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-black/80 me-1">
                  6 دول:
                </span>
                {["SA", "AE", "QA", "KW", "OM", "BH"].map((code) => (
                  <span
                    key={code}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[10px] font-mono font-bold text-white"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>

            {/* Big Action Button & Count */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/20">
              <a
                href={`#${currentCategory.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white transition hover:bg-neutral-900"
              >
                <span>عرض الكل</span>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </a>
              <div className="text-end leading-none">
                <span className="text-3xl font-black">{tools.length}</span>
                <span className="ms-1 text-xs font-bold text-white/80">أداة</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE LAYOUT (< lg): Exactly matches the mobile screenshot ── */}
        <div className="block lg:hidden">
          {/* Category Title Header with Icon on Left */}
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="text-lg font-black text-[var(--text)]">
                {currentCategory.nameAr}
              </h3>
              <p className="text-xs font-medium text-[var(--text-3)]">
                رواتب وضرائب وعمل
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF8A3D] to-[#FF5B04] text-white shadow-md shadow-orange-500/25">
              {getCategorySvg(currentCategory.id)}
            </span>
          </div>

          {/* Vertical Stack of Tools (Thumb-friendly with Chevron and Pill badge) */}
          <div className="divide-y divide-[var(--border)]">
            {tools.slice(0, 4).map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="group flex items-center justify-between py-3.5 transition hover:bg-[var(--bg)] px-1 rounded-xl"
              >
                {/* Right side in RTL: SVG Icon + Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF8A3D] to-[#FF5B04] text-white shadow-sm">
                    {getToolSvg(tool.id)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[var(--text)] truncate">
                        {tool.nameAr}
                      </h4>
                      <span className="rounded-md bg-[var(--bg)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-3)]">
                        {tool.badge || "عام"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--text-3)] truncate">
                      {tool.descAr}
                    </p>
                  </div>
                </div>

                {/* Left side in RTL: Circular Chevron Button pointing Left in RTL */}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg)] text-[var(--text-3)] group-hover:text-[var(--text)] transition">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>

          {/* Full-width Big Orange Button at Bottom */}
          <div className="mt-5 pt-3">
            <a
              href={`#${currentCategory.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF8A3D] to-[#FF5B04] py-3.5 text-sm font-bold text-[#0D0D0D] shadow-lg shadow-orange-500/25 transition active:scale-[0.98]"
            >
              <span>عرض كل {currentCategory.nameAr} ({tools.length})</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
