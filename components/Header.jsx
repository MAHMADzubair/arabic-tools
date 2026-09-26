"use client";

import { useState, useEffect, useMemo } from "react";
import { CATEGORIES, getActiveTools } from "@/lib/registry";

// Top quick tools for desktop bar
const TOP_TOOLS = [
  { href: "/salary-calculator", label: "الراتب" },
  { href: "/gratuity-calculator", label: "نهاية الخدمة" },
  { href: "/zakat-calculator", label: "الزكاة" },
  { href: "/loan-calculator", label: "القروض" },
  { href: "/hijri-age-calculator", label: "العمر" },
  { href: "/date-converter", label: "تحويل التاريخ" },
  { href: "/bmi-calculator", label: "BMI" },
  { href: "/profit-margin-calculator", label: "هامش الربح" },
  { href: "/unit-converter", label: "محول الوحدات" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeTools = useMemo(() => getActiveTools(), []);
  const toolCount = activeTools.length;

  const activeCategories = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      ...cat,
      tools: activeTools.filter((t) => t.category === cat.id),
    })).filter((cat) => cat.tools.length > 0);
  }, [activeTools]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Filter tools by search
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return activeCategories;
    return activeCategories
      .map((cat) => ({
        ...cat,
        tools: cat.tools.filter(
          (t) =>
            t.nameAr.toLowerCase().includes(query) ||
            (t.nameEn && t.nameEn.toLowerCase().includes(query)) ||
            (t.descAr && t.descAr.toLowerCase().includes(query)) ||
            cat.nameAr.toLowerCase().includes(query)
        ),
      }))
      .filter((cat) => cat.tools.length > 0);
  }, [activeCategories, searchQuery]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brand-border bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-hero-gradient shadow-sm group-hover:shadow-md transition-all">
              <span className="text-white text-base font-black">ع</span>
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-brand-dark block leading-tight">
                أدوات عربية
              </span>
              <span className="text-[10px] text-ink-muted hidden sm:block">
                {toolCount.toLocaleString("ar-EG")} أداة وحاسبة مجانية
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <a
              href="/ar/sa/"
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-200/80 px-2.5 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 shadow-2xs"
            >
              <span>🇸🇦</span>
              <span>السعودية</span>
            </a>
            <a
              href="/ar/ae/"
              className="inline-flex items-center gap-1 rounded-xl bg-red-50 border border-red-200/80 px-2.5 py-1.5 text-xs font-bold text-red-800 transition hover:bg-red-100 shadow-2xs"
            >
              <span>🇦🇪</span>
              <span>الإمارات</span>
            </a>
            {TOP_TOOLS.slice(0, 5).map((t) => (
              <a
                key={t.href}
                href={t.href}
                className="rounded-xl px-2.5 py-1.5 text-xs font-bold text-ink-secondary transition hover:bg-brand-light hover:text-brand-dark"
              >
                {t.label}
              </a>
            ))}

            {/* Desktop 'All Tools' Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)}
                className="inline-flex items-center gap-1 rounded-xl bg-brand-light px-3 py-1.5 text-xs font-bold text-brand-dark hover:bg-brand hover:text-white transition-all shadow-sm"
              >
                <span>جميع الأدوات ({toolCount.toLocaleString("ar-EG")})</span>
                <span className="text-[10px]">▼</span>
              </button>

              {desktopDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDesktopDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 z-50 w-[520px] rounded-2xl border border-brand-border bg-white p-4 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                      <span className="text-xs font-black text-brand-dark">
                        دليل جميع الأدوات ({toolCount} أداة)
                      </span>
                      <button
                        type="button"
                        onClick={() => setDesktopDropdownOpen(false)}
                        className="text-xs text-ink-muted hover:text-ink font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto p-1">
                      {activeCategories.map((cat) => (
                        <div key={cat.id} className="space-y-1.5">
                          <h4 className="text-[11px] font-bold text-ink-muted pb-0.5 border-b border-brand-border/40 flex items-center gap-1">
                            <span>{cat.icon}</span>
                            <span>{cat.nameAr}</span>
                          </h4>
                          <div className="space-y-1">
                            {cat.tools.map((t) => (
                              <a
                                key={t.href}
                                href={t.href}
                                onClick={() => setDesktopDropdownOpen(false)}
                                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-ink hover:bg-brand-light hover:text-brand-dark transition-all"
                              >
                                <span>{t.icon}</span>
                                <span className="truncate">{t.nameAr}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-bold text-brand-dark hover:bg-brand-light transition-all"
              aria-label="فتح قائمة الأدوات"
            >
              <span>☰</span>
              <span>الأدوات ({toolCount.toLocaleString("ar-EG")})</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Quick Bar */}
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto px-4 py-1.5 border-t border-brand-border/40 bg-brand-surface/30 scrollbar-none">
          <a
            href="/ar/sa/"
            className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200/80"
          >
            🇸🇦 السعودية
          </a>
          <a
            href="/ar/ae/"
            className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-800 border border-red-200/80"
          >
            🇦🇪 الإمارات
          </a>
          {TOP_TOOLS.map((t) => (
            <a
              key={t.href}
              href={t.href}
              className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-ink-secondary border border-brand-border/60 hover:bg-brand-light hover:text-brand-dark"
            >
              {t.label}
            </a>
          ))}
        </div>
      </header>

      {/* ─── Mobile Slide-out Drawer Menu ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative mr-auto w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-brand-border bg-brand-surface/50">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hero-gradient">
                  <span className="text-white text-xs font-black">ع</span>
                </div>
                <div>
                  <span className="text-sm font-bold text-ink block">أدوات عربية</span>
                  <span className="text-[10px] text-ink-muted">
                    {toolCount.toLocaleString("ar-EG")} أداة وحاسبة مجانية
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-surface text-ink hover:bg-rose-50 hover:text-rose-600 transition-all text-sm font-bold"
                aria-label="إغلاق القائمة"
              >
                ✕
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="p-3 border-b border-brand-border/60 bg-white">
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن أي أداة أو حاسبة..."
                  className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2 pr-9 pl-3 text-xs font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Tools List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-xs text-ink-muted">
                  لا توجد أدوات مطابقة لبحثك
                </div>
              ) : (
                filteredCategories.map((cat) => (
                  <div key={cat.id} className="space-y-2">
                    <h3 className="text-xs font-bold text-brand-dark pb-1 border-b border-brand-border/60 flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      <span>{cat.nameAr}</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-1.5">
                      {cat.tools.map((t) => (
                        <a
                          key={t.href}
                          href={t.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl p-2.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand-dark transition-all border border-transparent hover:border-brand-border"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-surface text-base shrink-0">
                            {t.icon}
                          </span>
                          <span className="truncate">{t.nameAr}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-brand-border bg-brand-surface/40 text-center">
              <a
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-block w-full rounded-xl bg-hero-gradient text-white py-2 text-xs font-bold shadow-sm"
              >
                🏠 الصفحة الرئيسية
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
