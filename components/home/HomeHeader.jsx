"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import QemloMark from "./QemloMark";
import HomeSearchDialog from "./HomeSearchDialog";

const GCC_COUNTRIES = [
  { code: "sa", name: "السعودية", currency: "SAR", currencyName: "ريال سعودي", flag: "🇸🇦", href: "/ar/sa" },
  { code: "ae", name: "الإمارات", currency: "AED", currencyName: "درهم إماراتي", flag: "🇦🇪", href: "/ar/ae" },
  { code: "qa", name: "قطر", currency: "QAR", currencyName: "ريال قطري", flag: "🇶🇦", href: "/ar/qa" },
  { code: "kw", name: "الكويت", currency: "KWD", currencyName: "دينار كويتي", flag: "🇰🇼", href: "/ar/kw" },
  { code: "om", name: "عُمان", currency: "OMR", currencyName: "ريال عماني", flag: "🇴🇲", href: "/ar/om" },
  { code: "bh", name: "البحرين", currency: "BHD", currencyName: "دينار بحريني", flag: "🇧🇭", href: "/ar/bh" },
];

export default function HomeHeader() {
  const [mobileCountryOpen, setMobileCountryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("sa");
  const [theme, setTheme] = useState("dark");

  const profileRef = useRef(null);

  // Sync theme from localStorage / html attribute
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("qemlo_theme") || localStorage.getItem("theme");
      const currentAttr = document.documentElement.getAttribute("data-theme");
      const initial = savedTheme || currentAttr || "dark";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    } catch {
      // safe fallback
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("qemlo_theme", nextTheme);
      localStorage.setItem("theme", nextTheme);
    } catch {
      // safe fallback
    }
  };

  // Sync selected country from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("qemlo_country");
      if (saved && GCC_COUNTRIES.some((c) => c.code === saved)) {
        setSelectedCountry(saved);
      }
    } catch {
      // safe fallback
    }
  }, []);

  const handleCountrySelect = (code) => {
    setSelectedCountry(code);
    try {
      localStorage.setItem("qemlo_country", code);
    } catch {
      // safe fallback
    }
    setMobileCountryOpen(false);
    setMobileMenuOpen(false);
  };

  // Keyboard shortcut Ctrl/Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setMobileCountryOpen(false);
        setProfileOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close profile popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent scroll when mobile menu or country picker is open
  useEffect(() => {
    if (mobileMenuOpen || mobileCountryOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, mobileCountryOpen]);

  const currentCountryObj =
    GCC_COUNTRIES.find((c) => c.code === selectedCountry) || GCC_COUNTRIES[0];

  return (
    <>
      <header className="relative z-30 w-full px-3 pt-3 pb-2 sm:px-6 lg:px-8 sm:pt-4">
        <div className="qemlo-glossy-pill mx-auto flex w-full max-w-[1400px] items-center justify-between rounded-full px-4 py-2 sm:px-6 sm:py-2.5">
          {/* ══════════════════════════════════════════════════════════════
              RIGHT SIDE IN RTL: LOGO (FIRST IN DOM)
             ══════════════════════════════════════════════════════════════ */}
          <div className="flex items-center flex-shrink-0">
            <Link
              href="/"
              className="flex items-center transition-transform hover:scale-105"
              aria-label="Qemlo — الرئيسية"
            >
              <QemloMark size={44} tailColor={theme === "light" ? "#0D0D0D" : "#FFFFFF"} dotColor="#FF5B04" />
            </Link>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              CENTER IN RTL: NAVIGATION MENU (CENTER ALIGNED)
             ══════════════════════════════════════════════════════════════ */}
          <nav
            className="hidden lg:flex items-center justify-center flex-1 mx-4 xl:mx-8 gap-3.5 xl:gap-5 text-[14px] xl:text-[15px] font-semibold whitespace-nowrap"
            aria-label="التنقل الرئيسي"
          >
            {/* Home */}
            <Link
              href="/"
              className="qemlo-header-nav-link py-1 text-[#F5F5F2]/90 hover:text-[#FF5B04] transition-colors"
            >
              الرئيسية
            </Link>

            {/* GCC Countries */}
            {GCC_COUNTRIES.map((c) => {
              const isSelected = selectedCountry === c.code;
              return (
                <Link
                  key={c.code}
                  href={c.href}
                  onClick={() => handleCountrySelect(c.code)}
                  className={`qemlo-header-nav-link py-1 transition-colors ${
                    isSelected
                      ? "text-[#FF5B04] font-bold border-b-2 border-[#FF5B04]"
                      : "text-[#F5F5F2]/90 hover:text-[#FF5B04]"
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}

            {/* About Us */}
            <Link
              href="/about"
              className="qemlo-header-nav-link py-1 text-[#F5F5F2]/90 hover:text-[#FF5B04] transition-colors"
            >
              من نحن
            </Link>

            {/* Contact Us */}
            <Link
              href="/contact"
              className="qemlo-header-nav-link py-1 text-[#F5F5F2]/90 hover:text-[#FF5B04] transition-colors"
            >
              اتصل بنا
            </Link>
          </nav>

          {/* ══════════════════════════════════════════════════════════════
              LEFT SIDE IN RTL: SEARCH, PROFILE, ALL TOOLS (PC ONLY)
              (Country popup removed on PC per user request)
             ══════════════════════════════════════════════════════════════ */}
          <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
            {/* Search Pill Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="qemlo-header-action-btn flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-2 text-xs font-medium text-white/90 hover:bg-white/15 transition-all"
              aria-label="البحث عن أداة"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF5B04] text-[#0D0D0D]">
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <span className="font-bold">بحث</span>
              <kbd className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-white/60 font-mono">
                Ctrl K
              </kbd>
            </button>

            {/* Light / Dark Mode Toggle Button (Where Country button was) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="qemlo-header-action-btn flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white hover:bg-white/15 hover:border-[#FF5B04]/40 transition-all active:scale-95"
              aria-label={theme === "light" ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"}
              title={theme === "light" ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"}
            >
              {theme === "light" ? (
                /* Moon icon for switching to dark mode */
                <svg
                  className="h-4 w-4 text-white/90 transition-transform hover:rotate-12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              ) : (
                /* Sun icon for switching to light mode */
                <svg
                  className="h-4 w-4 text-[#FF5B04] transition-transform hover:rotate-45"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              )}
            </button>

            {/* Profile Circular Button (Strictly No Admin Link) */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="qemlo-header-action-btn flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white hover:bg-white/15 transition-all"
                aria-label="قائمة الحساب"
                aria-expanded={profileOpen}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute end-0 top-full mt-2 w-72 rounded-2xl border border-white/15 bg-[#161616] p-4 text-start text-[#F5F5F2] shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 z-50">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg">
                      👤
                    </div>
                    <div>
                      <p className="text-sm font-bold">مرحباً بك في Qemlo</p>
                      <p className="text-xs text-[#8E8E89]">كل الأدوات متاحة بلا تسجيل</p>
                    </div>
                  </div>
                  <div className="pt-3 text-xs leading-relaxed text-[#B5B5B0]">
                    <p className="mb-2">
                      حفظ السجلات والمزامنة السحابية قيد التطوير وستتاح لاحقاً.
                    </p>
                    <span className="inline-block rounded-md bg-[#FF5B04]/15 px-2 py-1 text-[11px] font-bold text-[#FF5B04]">
                      الاستخدام مجاني 100% حالياً
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Glossy Orange All Tools Button */}
            <a
              href="#tools"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-b from-[#FF8A3D] to-[#FF5B04] px-6 py-2.5 text-xs font-bold text-[#0D0D0D] shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              جميع الأدوات
            </a>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              MOBILE CONTROLS (LEFT SIDE IN RTL)
             ══════════════════════════════════════════════════════════════ */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Functional Country Selector Pill on Mobile */}
            <button
              type="button"
              onClick={() => setMobileCountryOpen(true)}
              className="qemlo-header-action-btn flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition-transform active:scale-95"
              aria-label={`تغيير الدولة: حالياً ${currentCountryObj.name}`}
            >
              <span className="flex h-4 w-4 items-center justify-center text-[#FF5B04]">
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20" />
                </svg>
              </span>
              <span className="text-[13px] font-bold text-[#F5F5F2] qemlo-country-name">
                {currentCountryObj.name}
              </span>
              <svg
                className="h-3 w-3 text-white/60 qemlo-country-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* Orange round search button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF5B04] text-[#0D0D0D] shadow-md transition-transform active:scale-95"
              aria-label="بحث"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>

            {/* Hamburger round button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="qemlo-header-action-btn flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-transform active:scale-95"
              aria-label="القائمة"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Country Selection Modal / Bottom-Sheet ── */}
      {mobileCountryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="اختيار الدولة"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileCountryOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#141414] p-5 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div>
                <h3 className="text-base font-bold text-[#F5F5F2]">اختر دولتك</h3>
                <p className="text-xs text-[#8E8E89] mt-0.5">
                  لتخصيص الأنظمة والرواتب والعملة
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileCountryOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/15 transition-colors"
                aria-label="إغلاق نافذة الدول"
              >
                ✕
              </button>
            </div>

            {/* Countries List */}
            <div className="mt-4 grid grid-cols-1 gap-2">
              {GCC_COUNTRIES.map((c) => {
                const isSelected = selectedCountry === c.code;
                return (
                  <Link
                    key={c.code}
                    href={c.href}
                    onClick={() => handleCountrySelect(c.code)}
                    className={`flex items-center justify-between rounded-2xl border p-3 transition-all ${
                      isSelected
                        ? "border-[#FF5B04] bg-[#FF5B04]/15 text-white shadow-sm shadow-orange-500/20"
                        : "border-white/10 bg-white/[0.04] text-[#CCC] hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.flag}</span>
                      <div className="text-start">
                        <p className={`text-sm font-bold ${isSelected ? "text-[#FF5B04]" : "text-[#F5F5F2]"}`}>
                          {c.name}
                        </p>
                        <p className="text-[11px] text-[#8E8E89]">
                          {c.currencyName} ({c.currency})
                        </p>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF5B04] text-[#0D0D0D]">
                        <svg
                          className="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    ) : (
                      <span className="text-xs text-white/40 uppercase font-mono font-bold">{c.code}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Menu Drawer ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="قائمة الهاتف"
        >
          <div className="flex h-full w-full max-w-sm flex-col bg-[#141414] text-[#F5F5F2] shadow-2xl p-5 overflow-y-auto">
            {/* Top Bar: Logo on right, Close on left */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <QemloMark size={36} tailColor="#FFFFFF" dotColor="#FF5B04" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white"
                aria-label="إغلاق القائمة"
              >
                ✕
              </button>
            </div>

            {/* Search Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-[#888]"
              >
                <span>ابحث في 36 أداة...</span>
                <svg
                  className="h-4 w-4 text-[#888]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </div>

            {/* Mobile Guest Info (NO Admin login!) */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center">
              <p className="text-xs font-semibold text-[#B5B5B0]">
                جميع الأدوات والحاسبات مجانية بالكامل وبلا تسجيل
              </p>
            </div>

            {/* Theme Toggle in Mobile Drawer */}
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
              <span className="text-xs font-bold text-[#F5F5F2]">المظهر (Light / Dark)</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/15 transition-all"
                aria-label="تبديل المظهر"
              >
                {theme === "light" ? (
                  <>
                    <svg className="h-3.5 w-3.5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                    <span>الوضع الليلي</span>
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5 text-[#FF5B04]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </svg>
                    <span>الوضع النهاري</span>
                  </>
                )}
              </button>
            </div>

            {/* Country Selector in Drawer */}
            <div className="mt-5">
              <p className="mb-2.5 text-xs font-bold text-[#8E8E89]">
                حاسبات دول الخليج (6 دول)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {GCC_COUNTRIES.map((c) => {
                  const isSelected = selectedCountry === c.code;
                  return (
                    <Link
                      key={c.code}
                      href={c.href}
                      onClick={() => handleCountrySelect(c.code)}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-bold transition-colors ${
                        isSelected
                          ? "border-[#FF5B04] bg-[#FF5B04]/10 text-white"
                          : "border-white/10 bg-white/5 text-[#CCC]"
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span>{c.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Main Navigation Pages */}
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm font-semibold hover:bg-white/10"
              >
                <span>الرئيسية</span>
                <span>🏠</span>
              </Link>
            </div>

            {/* Navigation Categories */}
            <div className="mt-4 flex flex-col gap-2">
              <p className="mb-1 text-xs font-bold text-[#8E8E89]">التصنيفات</p>
              <a
                href="#finance"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm font-semibold hover:bg-white/10"
              >
                <span>المال والاستثمار</span>
                <span>💰</span>
              </a>
              <a
                href="#islamic"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm font-semibold hover:bg-white/10"
              >
                <span>الأدوات الإسلامية</span>
                <span>🌙</span>
              </a>
              <a
                href="#business"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm font-semibold hover:bg-white/10"
              >
                <span>الأعمال والشركات</span>
                <span>💼</span>
              </a>
              <Link
                href="/ar/business/ai-sales-closer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm font-semibold hover:bg-white/10"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#FF5B04] px-1.5 py-0.2 text-[10px] font-bold text-[#0D0D0D]">
                    جديد
                  </span>
                  <span>الذكاء الاصطناعي</span>
                </div>
                <span>🤖</span>
              </Link>
            </div>

            {/* Information Links */}
            <div className="mt-4 flex flex-col gap-2">
              <p className="mb-1 text-xs font-bold text-[#8E8E89]">معلومات عنا</p>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm font-semibold hover:bg-white/10"
              >
                <span>من نحن</span>
                <span>ℹ️</span>
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm font-semibold hover:bg-white/10"
              >
                <span>اتصل بنا</span>
                <span>✉️</span>
              </Link>
            </div>

            {/* Bottom CTA Button */}
            <div className="mt-auto pt-6">
              <a
                href="#tools"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#FF8A3D] to-[#FF5B04] py-3.5 text-sm font-bold text-[#0D0D0D]"
              >
                تصفح جميع الأدوات ←
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Accessible Search Dialog */}
      <HomeSearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
