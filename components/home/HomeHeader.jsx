"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import QemloMark from "./QemloMark";
import HomeSearchDialog from "./HomeSearchDialog";
import { getCatalogToolCount } from "@/lib/registry";

const GCC_COUNTRIES = [
  { code: "sa", name: "السعودية", currency: "SAR", currencyName: "ريال سعودي",  flag: "🇸🇦", href: "/ar/sa" },
  { code: "ae", name: "الإمارات", currency: "AED", currencyName: "درهم إماراتي", flag: "🇦🇪", href: "/ar/ae" },
  { code: "qa", name: "قطر",      currency: "QAR", currencyName: "ريال قطري",    flag: "🇶🇦", href: "/ar/qa" },
  { code: "kw", name: "الكويت",   currency: "KWD", currencyName: "دينار كويتي",  flag: "🇰🇼", href: "/ar/kw" },
  { code: "om", name: "عُمان",    currency: "OMR", currencyName: "ريال عماني",   flag: "🇴🇲", href: "/ar/om" },
  { code: "bh", name: "البحرين",  currency: "BHD", currencyName: "دينار بحريني", flag: "🇧🇭", href: "/ar/bh" },
];

// ─── Admin / internal paths that should never show the header ─────────────────
function shouldHideHeader(path) {
  if (!path) return false;
  return (
    path === "/owner-access" ||
    path.startsWith("/admin") ||
    path.startsWith("/internal")
  );
}

export default function HomeHeader() {
  const pathname = usePathname();
  const catalogToolCount = getCatalogToolCount();

  const [mobileCountryOpen, setMobileCountryOpen] = useState(false);
  const [searchOpen, setSearchOpen]               = useState(false);
  const [searchCountry, setSearchCountry]         = useState(null); // country pre-set when opening search
  const [profileOpen, setProfileOpen]             = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]       = useState(false);
  const [selectedCountry, setSelectedCountry]     = useState("sa");
  const [theme, setTheme]                         = useState("dark");
  const [scrolled, setScrolled]                   = useState(false);

  const profileRef = useRef(null);
  const isHomePage = pathname === "/";

  // ── Theme: sync from localStorage / html attr ────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    try {
      const saved = localStorage.getItem("qemlo_theme") || localStorage.getItem("theme");
      const attr  = document.documentElement.getAttribute("data-theme");
      const initial = saved || attr || "dark";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    } catch { /* safe */ }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("qemlo_theme", next);
      localStorage.setItem("theme", next);
    } catch { /* safe */ }
  };

  // ── Selected country: sync from localStorage ──────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    try {
      const saved = localStorage.getItem("qemlo_country");
      if (saved && GCC_COUNTRIES.some((c) => c.code === saved)) {
        setSelectedCountry(saved);
      }
    } catch { /* safe */ }
  }, []);

  const handleCountrySelect = (code) => {
    setSelectedCountry(code);
    try { localStorage.setItem("qemlo_country", code); } catch { /* safe */ }
    setMobileCountryOpen(false);
    setMobileMenuOpen(false);
  };

  // ── Scroll: add shadow / compact class ───────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 60);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchCountry(null);
        setSearchOpen((p) => !p);
      } else if (e.key === "Escape") {
        setMobileCountryOpen(false);
        setProfileOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Click outside → close profile popover ───────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Body scroll lock when overlays are open ──────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    document.body.style.overflow =
      mobileMenuOpen || mobileCountryOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen, mobileCountryOpen]);

  // ── Close menus on route change ──────────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileCountryOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const currentCountryObj =
    GCC_COUNTRIES.find((c) => c.code === selectedCountry) || GCC_COUNTRIES[0];

  // ── "جميع الأدوات" target:
  //    On homepage → scroll to #tools section
  //    On other pages → navigate to homepage
  const allToolsHref = isHomePage ? "#tools" : "/#tools";

  // Helper: open search pre-filtered by a country code
  const openSearchForCountry = (code) => {
    setSearchCountry(code);
    setSearchOpen(true);
    setMobileMenuOpen(false);
  };

  // Open search with no country filter
  const openSearch = () => {
    setSearchCountry(null);
    setSearchOpen(true);
  };

  // Keep hook order stable across route transitions; hide only after all hooks run.
  if (shouldHideHeader(pathname)) return null;

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER BAR — sticky, sits above everything
         ═══════════════════════════════════════════════════════════════════ */}
      <header
        className={`sticky top-0 z-40 w-full px-3 pt-2 pb-2 sm:px-4 lg:px-6 transition-all duration-200 ${
          scrolled ? "pt-1 pb-1" : ""
        }`}
      >
        <div className="qemlo-glossy-pill flex w-full items-center justify-between rounded-full px-4 py-2 sm:px-6 sm:py-2.5">

          {/* ── LOGO ──────────────────────────────────────────────────── */}
          <div className="flex items-center flex-shrink-0">
            <Link
              href="/"
              className="flex items-center transition-transform hover:scale-105"
              aria-label="Qemlo — الرئيسية"
            >
              <QemloMark
                size={44}
                tailColor={theme === "light" ? "#0D0D0D" : "#FFFFFF"}
                dotColor="#FF5B04"
              />
            </Link>
          </div>

          {/* ── DESKTOP CENTER NAV ────────────────────────────────────── */}
          <nav
            className="hidden lg:flex items-center justify-center flex-1 mx-4 xl:mx-8 gap-3.5 xl:gap-5 text-[14px] xl:text-[15px] font-semibold whitespace-nowrap"
            aria-label="التنقل الرئيسي"
          >
            {/* Home */}
            <Link
              href="/"
              className={`qemlo-header-nav-link py-1 transition-colors ${
                isHomePage
                  ? "text-[#FF5B04] font-bold border-b-2 border-[#FF5B04]"
                  : "text-[#F5F5F2]/90 hover:text-[#FF5B04]"
              }`}
            >
              الرئيسية
            </Link>

            {/* Country links:
                Click on desktop opens search pre-filtered by that country
                (holding the link href so it still navigates on right-click/middle-click) */}
            {GCC_COUNTRIES.map((c) => {
              const isActive =
                pathname === c.href || pathname?.startsWith(c.href + "/");
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => openSearchForCountry(c.code)}
                  className={`qemlo-header-nav-link py-1 transition-colors bg-transparent border-none cursor-pointer ${
                    isActive || selectedCountry === c.code
                      ? "text-[#FF5B04] font-bold border-b-2 border-[#FF5B04]"
                      : "text-[#F5F5F2]/90 hover:text-[#FF5B04]"
                  }`}
                  aria-label={`عرض أدوات ${c.name}`}
                  title={`عرض أدوات ${c.name}`}
                >
                  {c.name}
                </button>
              );
            })}

            {/* About */}
            <Link
              href="/about"
              className={`qemlo-header-nav-link py-1 transition-colors ${
                pathname === "/about"
                  ? "text-[#FF5B04] font-bold"
                  : "text-[#F5F5F2]/90 hover:text-[#FF5B04]"
              }`}
            >
              من نحن
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              className={`qemlo-header-nav-link py-1 transition-colors ${
                pathname === "/contact"
                  ? "text-[#FF5B04] font-bold"
                  : "text-[#F5F5F2]/90 hover:text-[#FF5B04]"
              }`}
            >
              اتصل بنا
            </Link>
          </nav>

          {/* ── DESKTOP RIGHT ACTIONS ─────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">

            {/* Search button */}
            <button
              type="button"
              onClick={openSearch}
              className="qemlo-header-action-btn flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-2 text-xs font-medium text-white/90 hover:bg-white/15 transition-all"
              aria-label="البحث عن أداة"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF5B04] text-[#0D0D0D]">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <span className="font-bold">بحث</span>
              <kbd className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-white/60 font-mono">
                Ctrl K
              </kbd>
            </button>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="qemlo-header-action-btn flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white hover:bg-white/15 hover:border-[#FF5B04]/40 transition-all active:scale-95"
              aria-label={theme === "light" ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"}
              title={theme === "light" ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"}
            >
              {theme === "light" ? (
                <svg className="h-4 w-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-[#FF5B04]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              )}
            </button>

            {/* Profile popover */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="qemlo-header-action-btn flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white hover:bg-white/15 transition-all"
                aria-label="قائمة الحساب"
                aria-expanded={profileOpen}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    <p className="mb-2">حفظ السجلات والمزامنة السحابية قيد التطوير وستتاح لاحقاً.</p>
                    <span className="inline-block rounded-md bg-[#FF5B04]/15 px-2 py-1 text-[11px] font-bold text-[#FF5B04]">
                      الاستخدام مجاني 100% حالياً
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* All tools CTA */}
            <a
              href={allToolsHref}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-b from-[#FF8A3D] to-[#FF5B04] px-6 py-2.5 text-xs font-bold text-[#0D0D0D] shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              جميع الأدوات
            </a>
          </div>

          {/* ── MOBILE CONTROLS ───────────────────────────────────────── */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Country selector pill */}
            <button
              type="button"
              onClick={() => setMobileCountryOpen(true)}
              className="qemlo-header-action-btn flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition-transform active:scale-95"
              aria-label={`تغيير الدولة: حالياً ${currentCountryObj.name}`}
            >
              <span className="flex h-4 w-4 items-center justify-center text-[#FF5B04]">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20" />
                </svg>
              </span>
              <span className="text-[13px] font-bold text-[#F5F5F2]">
                {currentCountryObj.name}
              </span>
              <svg className="h-3 w-3 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* Search button */}
            <button
              type="button"
              onClick={openSearch}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF5B04] text-[#0D0D0D] shadow-md transition-transform active:scale-95"
              aria-label="بحث"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="qemlo-header-action-btn flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-transform active:scale-95"
              aria-label="القائمة"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE: COUNTRY SELECTION MODAL
         ═══════════════════════════════════════════════════════════════════ */}
      {mobileCountryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="اختيار الدولة"
          onClick={(e) => { if (e.target === e.currentTarget) setMobileCountryOpen(false); }}
        >
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#141414] p-5 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div>
                <h3 className="text-base font-bold text-[#F5F5F2]">اختر دولتك</h3>
                <p className="text-xs text-[#8E8E89] mt-0.5">لتصفية الأدوات حسب الدولة</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileCountryOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80"
                aria-label="إغلاق"
              >✕</button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2">
              {/* All tools option */}
              <button
                type="button"
                onClick={() => {
                  setMobileCountryOpen(false);
                  openSearchForCountry(null); // null = all tools
                }}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#CCC] hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  <div className="text-start">
                    <p className="text-sm font-bold text-[#F5F5F2]">جميع الأدوات</p>
                    <p className="text-[11px] text-[#8E8E89]">عرض كل الأدوات المتاحة</p>
                  </div>
                </div>
              </button>

              {GCC_COUNTRIES.map((c) => {
                const isSelected = selectedCountry === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      handleCountrySelect(c.code);
                      openSearchForCountry(c.code);
                    }}
                    className={`flex items-center justify-between rounded-2xl border p-3 transition-all text-start w-full ${
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
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    ) : (
                      <span className="text-xs text-white/40 uppercase font-mono font-bold">{c.code.toUpperCase()}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE: HAMBURGER DRAWER
         ═══════════════════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="قائمة الهاتف"
        >
          <div className="flex h-full w-full max-w-sm flex-col bg-[#141414] text-[#F5F5F2] shadow-2xl p-5 overflow-y-auto">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <QemloMark size={36} tailColor="#FFFFFF" dotColor="#FF5B04" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white"
                aria-label="إغلاق القائمة"
              >✕</button>
            </div>

            {/* Search */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); openSearch(); }}
                className="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-[#888]"
              >
                <span>ابحث في {catalogToolCount} أداة مختارة...</span>
                <svg className="h-4 w-4 text-[#888]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </div>

            {/* Free badge */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center">
              <p className="text-xs font-semibold text-[#B5B5B0]">
                جميع الأدوات والحاسبات مجانية بالكامل وبلا تسجيل
              </p>
            </div>

            {/* Theme toggle */}
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
              <span className="text-xs font-bold text-[#F5F5F2]">المظهر</span>
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

            {/* Country grid — clicking opens search filtered by that country */}
            <div className="mt-5">
              <p className="mb-2.5 text-xs font-bold text-[#8E8E89]">أدوات دول الخليج</p>
              <div className="grid grid-cols-2 gap-2">
                {GCC_COUNTRIES.map((c) => {
                  const isSelected = selectedCountry === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => { handleCountrySelect(c.code); openSearchForCountry(c.code); }}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-bold transition-colors ${
                        isSelected
                          ? "border-[#FF5B04] bg-[#FF5B04]/10 text-white"
                          : "border-white/10 bg-white/5 text-[#CCC]"
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main nav pages */}
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm font-semibold hover:bg-white/10">
                <span>الرئيسية</span><span>🏠</span>
              </Link>
            </div>

            {/* Categories */}
            <div className="mt-4 flex flex-col gap-2">
              <p className="mb-1 text-xs font-bold text-[#8E8E89]">التصنيفات</p>
              <a href="/#gulf"    onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm font-semibold hover:bg-white/10">
                <span>حاسبات الخليج</span><span>💰</span>
              </a>
              <a href="/#islamic" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm font-semibold hover:bg-white/10">
                <span>الأدوات الإسلامية</span><span>🌙</span>
              </a>
              <a href="/#business" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm font-semibold hover:bg-white/10">
                <span>الأعمال والشركات</span><span>💼</span>
              </a>
              <Link href="/ar/ae/purchase-order-generator" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm font-semibold hover:bg-white/10">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#FF5B04] px-1.5 py-0.5 text-[10px] font-bold text-[#0D0D0D]">أعمال</span>
                  <span>أمر الشراء</span>
                </div>
                <span>📦</span>
              </Link>
            </div>

            {/* Info links */}
            <div className="mt-4 flex flex-col gap-2">
              <p className="mb-1 text-xs font-bold text-[#8E8E89]">معلومات عنا</p>
              <Link href="/about"   onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm font-semibold hover:bg-white/10">
                <span>من نحن</span><span>ℹ️</span>
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm font-semibold hover:bg-white/10">
                <span>اتصل بنا</span><span>✉️</span>
              </Link>
            </div>

            {/* CTA */}
            <div className="mt-auto pt-6">
              <a
                href={allToolsHref}
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#FF8A3D] to-[#FF5B04] py-3.5 text-sm font-bold text-[#0D0D0D]"
              >
                تصفح جميع الأدوات ←
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Search Dialog ── */}
      <HomeSearchDialog
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        defaultCountry={searchCountry}
      />
    </>
  );
}
