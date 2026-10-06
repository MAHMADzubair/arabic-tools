"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CATEGORIES, getActiveTools } from "@/lib/registry";

// Top quick tools
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

const COUNTRIES = [
  { href: "/ar/sa", id: "sa", label: "السعودية", flag: "🇸🇦" },
  { href: "/ar/ae", id: "ae", label: "الإمارات", flag: "🇦🇪" },
];

// Ink & Signal header. Uses the global tokens (--bg, --surface, --text, --card, --orange ...).
const CSS = `
.hd{display:contents}
.hd *{box-sizing:border-box}
.hd a,.hd button,.hd input{font:inherit}
.hd-bar{position:sticky;top:0;z-index:40;padding:10px 12px 0;pointer-events:none}
.hd-bar>*{pointer-events:auto}
.hd-wrap{max-width:64rem;margin:0 auto}
.hd-top{position:relative}
.hd-pill{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 8px 7px 10px;border:2px solid var(--border);border-radius:22px;color:var(--text);
  background:var(--surface);background:color-mix(in srgb,var(--surface) 86%,transparent);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);
  box-shadow:0 10px 30px -16px rgba(0,0,0,.45);transition:border-color .2s}
.hd-pill:hover{border-color:var(--text-3)}
.hd-logo{display:flex;align-items:center;gap:10px;color:var(--text);text-decoration:none;flex:none}
.hd-mark{width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;border-radius:12px;overflow:hidden;background:var(--surface);border:1.5px solid var(--border);transition:transform .25s;flex-shrink:0}
.hd-logo:hover .hd-mark{transform:scale(1.08)}
.hd-logo-img{width:100%;height:100%;object-fit:cover;display:block}
.hd-logo-dark{display:none}
@media(prefers-color-scheme: dark){
  :root:not([data-theme="light"]) .hd-logo-light{display:none}
  :root:not([data-theme="light"]) .hd-logo-dark{display:block}
}
:root[data-theme="dark"] .hd-logo-light{display:none}
:root[data-theme="dark"] .hd-logo-dark{display:block}
.hd-name{display:block;font-size:17px;font-weight:800;line-height:1.2}
.hd-count{display:none;font-size:11px;color:var(--text-3)}
@media(min-width:640px){.hd-count{display:block}}
.hd-nav{display:none;align-items:center;gap:4px}
@media(min-width:768px){.hd-nav{display:flex}.hd-mob{display:none!important}}
.hd-link{color:var(--text-2);text-decoration:none;font-size:13px;font-weight:700;padding:8px 12px;border-radius:999px;white-space:nowrap;transition:background .15s,color .15s}
.hd-link:hover{background:var(--bg);color:var(--text)}
.hd-link[aria-current="page"]{background:var(--text);color:var(--bg)}
.hd-seg{display:flex;gap:2px;padding:3px;border:2px solid var(--border);border-radius:999px;margin-inline-end:6px}
.hd-seg a{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;color:var(--text);text-decoration:none;font-size:13px;font-weight:800;transition:background .15s,color .15s}
.hd-seg a:hover{background:var(--text);color:var(--bg)}
.hd-all{display:inline-flex;align-items:center;gap:8px;min-height:42px;padding:6px 8px 6px 14px;border:0;border-radius:999px;background:var(--text);color:var(--bg);font-size:13px;font-weight:800;cursor:pointer;white-space:nowrap;transition:background .15s,color .15s}
.hd-all:hover{background:var(--orange);color:var(--on-orange)}
.hd-all b{display:inline-grid;place-items:center;min-width:26px;height:26px;padding:0 8px;border-radius:999px;background:var(--orange);color:var(--on-orange);font-size:12px;font-weight:900}
.hd-all:hover b{background:var(--on-orange);color:var(--orange)}
.hd-bars{width:18px;height:18px}
.hd :focus-visible{outline:3px solid var(--orange);outline-offset:2px}
/* progress line */
.hd-prog{height:3px;margin:6px 14px 0;border-radius:3px;background:var(--orange);transform-origin:right;transform:scaleX(0);transition:transform .1s linear}
/* quick chips (mobile) */
.hd-quick{display:flex;gap:8px;overflow-x:auto;padding:8px 2px 2px;max-height:56px;opacity:1;scrollbar-width:none;transition:max-height .25s,opacity .2s,padding .25s;
  -webkit-mask-image:linear-gradient(to right,transparent 0,#000 14px,#000 calc(100% - 14px),transparent 100%);mask-image:linear-gradient(to right,transparent 0,#000 14px,#000 calc(100% - 14px),transparent 100%)}
.hd-quick::-webkit-scrollbar{display:none}
.hd-bar.is-scrolled .hd-quick{max-height:0;opacity:0;padding-top:0;padding-bottom:0}
@media(min-width:768px){.hd-quick{display:none}}
.hd-chip{flex:none;display:inline-flex;align-items:center;gap:6px;min-height:38px;padding:0 14px;border:2px solid var(--border);border-radius:999px;background:var(--surface);color:var(--text);text-decoration:none;font-size:13px;font-weight:700;white-space:nowrap;cursor:pointer}
.hd-chip:active{background:var(--bg)}
.hd-chip.is-country{border-color:var(--text);font-weight:800}
.hd-chip[aria-current="page"]{background:var(--text);color:var(--bg);border-color:var(--text)}
/* mega menu */
.hd-scrim{position:fixed;inset:0;z-index:-1}
.hd-menu{position:absolute;inset-inline:0;top:calc(100% + 10px);z-index:50;background:var(--surface);border:2px solid var(--border);border-radius:26px;padding:16px;color:var(--text);max-height:min(74vh,600px);overflow:auto;box-shadow:0 30px 60px -24px rgba(0,0,0,.55);animation:hd-pop .18s ease-out}
@keyframes hd-pop{from{opacity:0;transform:translateY(-8px) scale(.98)}to{opacity:1;transform:none}}
.hd-sr{display:flex;align-items:center;gap:10px;padding:0 14px;height:52px;border:2px solid var(--text-3);border-radius:16px;background:var(--bg);position:sticky;top:0;z-index:2}
.hd-sr:focus-within{border-color:var(--text)}
.hd-sr svg{width:20px;height:20px;flex:none;color:var(--text-3)}
.hd-sr input{flex:1;min-width:0;border:0;background:none;color:var(--text);font-size:15px;font-weight:600;outline:0;height:100%}
.hd-sr input::placeholder{color:var(--text-3)}
.hd-kbd{flex:none;border:1px solid var(--border);border-radius:7px;padding:1px 8px;font-size:12px;font-weight:800;color:var(--text-3)}
.hd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:22px 20px;margin-top:18px}
.hd-cath{display:flex;align-items:center;gap:8px;margin:0 0 6px;padding-bottom:8px;border-bottom:2px dotted var(--border);font-size:13px;font-weight:900;color:var(--text)}
.hd-cath span:last-child{margin-inline-start:auto;font-size:11px;color:var(--text-3);font-weight:700}
.hd-item{position:relative;display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:12px;color:var(--text);text-decoration:none;font-size:13px;font-weight:700;line-height:1.35;transition:background .12s}
.hd-item:hover{background:var(--bg)}
.hd-item::before{content:"";position:absolute;inset-inline-start:0;top:9px;bottom:9px;width:3px;border-radius:3px;background:var(--orange);opacity:0;transition:opacity .12s}
.hd-item:hover::before{opacity:1}
.hd-item[aria-current="page"]{background:var(--bg);font-weight:900}
.hd-ic{flex:none;width:30px;height:30px;display:grid;place-items:center;border-radius:9px;background:var(--card);color:var(--card-text);font-size:15px;transition:background .12s,color .12s}
.hd-item:hover .hd-ic,.hd-dm:hover .hd-ic{background:var(--orange);color:var(--on-orange)}
.hd-empty{text-align:center;padding:36px 0;font-size:14px;color:var(--text-2)}
/* drawer */
.hd-over{position:fixed;inset:0;z-index:60}
@media(min-width:768px){.hd-over{display:none}}
.hd-back{position:absolute;inset:0;background:rgba(0,0,0,.6);animation:hd-fade .2s}
@keyframes hd-fade{from{opacity:0}to{opacity:1}}
.hd-drawer{position:absolute;inset-block:0;inset-inline-end:0;width:min(100%,26rem);display:flex;flex-direction:column;background:var(--surface);color:var(--text);border-inline-start:2px solid var(--border);animation:hd-slide .26s cubic-bezier(.2,.8,.2,1)}
@keyframes hd-slide{from{transform:translateX(-100%)}to{transform:none}}
.hd-dh{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:14px 16px}
.hd-x{display:grid;place-items:center;width:42px;height:42px;border:2px solid var(--border);border-radius:14px;background:none;color:var(--text);cursor:pointer;font-weight:900}
.hd-x:hover{background:var(--text);color:var(--bg)}
.hd-ds{padding:0 16px 10px}
.hd-jump{display:flex;gap:8px;overflow-x:auto;padding:2px 16px 12px;scrollbar-width:none;border-bottom:2px dotted var(--border)}
.hd-jump::-webkit-scrollbar{display:none}
.hd-dl{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:22px;overscroll-behavior:contain}
.hd-dm{position:relative;display:flex;align-items:center;gap:12px;min-height:52px;padding:6px 8px;border-radius:14px;color:var(--text);text-decoration:none;font-size:15px;font-weight:700;line-height:1.35}
.hd-dm:active{background:var(--bg)}
.hd-dm[aria-current="page"]{background:var(--bg);font-weight:900}
.hd-dm .hd-ic{width:38px;height:38px;border-radius:12px;font-size:19px}
.hd-df{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px 16px;border-top:2px solid var(--border)}
.hd-df a{display:flex;align-items:center;justify-content:center;gap:6px;min-height:46px;border:2px solid var(--text);border-radius:14px;color:var(--text);text-decoration:none;font-size:14px;font-weight:800}
.hd-df a.hd-home{grid-column:1/-1;border-color:var(--orange);background:var(--orange);color:var(--on-orange)}
@media(prefers-reduced-motion:reduce){.hd *{animation:none!important;transition:none!important}}
/* mobile: minimal header (logo + one small button), no extra effects */
@media(max-width:767px){
.hd-bar{padding:8px 10px 0}
.hd-pill{-webkit-backdrop-filter:none;backdrop-filter:none;background:var(--surface);box-shadow:none;border-radius:14px;padding:6px 8px 6px 10px}
.hd-pill:hover{border-color:var(--border)}
.hd-logo:hover .hd-mark{transform:none}
.hd-mark{width:34px;height:34px;font-size:16px;border-radius:10px}
.hd-name{font-size:15px}
.hd-quick,.hd-prog{display:none}
.hd-mob .hd-all,.hd-mob .hd-all:hover{min-height:38px;padding:0 12px;background:transparent;color:var(--text);border:2px solid var(--border)}
.hd-mob .hd-all b{display:none}
.hd-back,.hd-drawer{animation:none}
.hd-over{height:100dvh}
.hd-drawer{width:100%}
.hd-df{padding-bottom:calc(16px + env(safe-area-inset-bottom))}
.hd-df a span{display:none}
.hd *{-webkit-tap-highlight-color:transparent}
}
@media print{.hd-bar{display:none}}
`;

function track(country, from) {
  if (typeof window !== "undefined" && typeof window.trackEvent === "function") {
    window.trackEvent("country_switched", { country, from });
  }
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const dropBtnRef = useRef(null);
  const menuBtnRef = useRef(null);
  const deskSearchRef = useRef(null);
  const mobSearchRef = useRef(null);
  const listRef = useRef(null);

  const activeTools = useMemo(() => getActiveTools(), []);
  const count = activeTools.length.toLocaleString("en-US");

  const activeCategories = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        ...cat,
        tools: activeTools.filter((t) => t.category === cat.id),
      })).filter((cat) => cat.tools.length > 0),
    [activeTools]
  );

  // Scroll: compact the bar (desktop) + reading progress line
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScrolled(y > 60);
        setProgress(max > 0 ? Math.min(y / max, 1) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // Escape closes; "/" opens search (desktop panel or mobile drawer)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (mobileMenuOpen) { setMobileMenuOpen(false); menuBtnRef.current?.focus(); }
        if (desktopDropdownOpen) { setDesktopDropdownOpen(false); dropBtnRef.current?.focus(); }
        return;
      }
      const t = e.target;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
      if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (window.matchMedia("(min-width:768px)").matches) {
          setDesktopDropdownOpen(true);
          setTimeout(() => deskSearchRef.current?.focus(), 30);
        } else {
          setMobileMenuOpen(true);
          setTimeout(() => mobSearchRef.current?.focus(), 80);
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen, desktopDropdownOpen]);

  // Close menus on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setDesktopDropdownOpen(false);
    setSearchQuery("");
  }, [pathname]);

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

  const cur = (href) => (pathname === href ? "page" : undefined);
  const jumpTo = (id) => listRef.current?.querySelector(`#hd-sec-${id}`)?.scrollIntoView({ block: "start", behavior: "smooth" });

  return (
    <div className="hd">
      <style>{CSS}</style>

      <header className={`hd-bar${scrolled ? " is-scrolled" : ""}`}>
        <div className="hd-wrap">
          <div className="hd-top">
            <div className="hd-pill">
              {/* Logo */}
              <Link href="/" className="hd-logo" aria-label="Qemlo — الصفحة الرئيسية">
                <span className="hd-mark" aria-hidden="true">
                  <Image
                    src="/logo.png"
                    alt="Qemlo"
                    width={40}
                    height={40}
                    className="hd-logo-img hd-logo-light"
                    priority
                  />
                  <Image
                    src="/logo-dark.png"
                    alt="Qemlo"
                    width={40}
                    height={40}
                    className="hd-logo-img hd-logo-dark"
                    priority
                  />
                </span>
                <span>
                  <span className="hd-name">Qemlo</span>
                  <span className="hd-count">{count} أداة وحاسبة مجانية</span>
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hd-nav" aria-label="التنقل الرئيسي">
                <div className="hd-seg">
                  {COUNTRIES.map((c) => (
                    <Link key={c.id} href={c.href} onClick={() => track(c.id, "header_desktop")}>
                      <span aria-hidden="true">{c.flag}</span>
                      {c.label}
                    </Link>
                  ))}
                </div>
                {TOP_TOOLS.slice(0, 5).map((t) => (
                  <Link key={t.href} href={t.href} className="hd-link" aria-current={cur(t.href)}>
                    {t.label}
                  </Link>
                ))}
                <button
                  ref={dropBtnRef}
                  type="button"
                  className="hd-all"
                  aria-expanded={desktopDropdownOpen}
                  aria-controls="hd-all-tools"
                  onClick={() => {
                    setDesktopDropdownOpen(!desktopDropdownOpen);
                    setTimeout(() => deskSearchRef.current?.focus(), 30);
                  }}
                >
                  جميع الأدوات
                  <b>{count}</b>
                </button>
              </nav>

              {/* Mobile menu button */}
              <div className="hd-mob">
                <button
                  ref={menuBtnRef}
                  type="button"
                  className="hd-all"
                  aria-haspopup="dialog"
                  aria-expanded={mobileMenuOpen}
                  onClick={() => setMobileMenuOpen(true)}
                >
                  الأدوات
                  <b>{count}</b>
                  <svg className="hd-bars" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                    <path d="M4 7h16M4 12h16M4 17h10" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Desktop mega menu */}
            {desktopDropdownOpen && (
              <>
                <div className="hd-scrim" onClick={() => setDesktopDropdownOpen(false)} />
                <div id="hd-all-tools" className="hd-menu">
                  <div className="hd-sr">
                    <SearchIcon />
                    <input
                      ref={deskSearchRef}
                      type="search"
                      aria-label="ابحث عن أداة أو حاسبة"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`ابحث بين ${count} أداة، مثال: الزكاة`}
                    />
                    <span className="hd-kbd" aria-hidden="true">/</span>
                  </div>
                  {filteredCategories.length === 0 ? (
                    <div className="hd-empty" role="status">لا توجد أدوات مطابقة لبحثك. جرّب كلمة أقصر.</div>
                  ) : (
                    <div className="hd-grid">
                      {filteredCategories.map((cat) => (
                        <div key={cat.id}>
                          <h3 className="hd-cath">
                            <span aria-hidden="true">{cat.icon}</span>
                            <span>{cat.nameAr}</span>
                            <span>{cat.tools.length.toLocaleString("en-US")}</span>
                          </h3>
                          {cat.tools.map((t) => (
                            <Link key={t.href} href={t.href} className="hd-item" aria-current={cur(t.href)}
                              onClick={() => setDesktopDropdownOpen(false)}>
                              <span className="hd-ic" aria-hidden="true">{t.icon}</span>
                              <span>{t.nameAr}</span>
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile quick chips (hidden on mobile by CSS, kept for easy re-enable) */}
          <nav className="hd-quick" aria-label="أدوات سريعة">
            {COUNTRIES.map((c) => (
              <Link key={c.id} href={c.href} className="hd-chip is-country" onClick={() => track(c.id, "header_mobile")}>
                <span aria-hidden="true">{c.flag}</span>
                {c.label}
              </Link>
            ))}
            {TOP_TOOLS.map((t) => (
              <Link key={t.href} href={t.href} className="hd-chip" aria-current={cur(t.href)}>
                {t.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hd-prog" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="hd-over" role="dialog" aria-modal="true" aria-label="قائمة الأدوات">
          <div className="hd-back" onClick={() => setMobileMenuOpen(false)} />
          <div className="hd-drawer">
            <div className="hd-dh">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="hd-mark" style={{ width: 36, height: 36, fontSize: 17 }} aria-hidden="true">ع</span>
                <span>
                  <b style={{ display: "block", fontSize: 16 }}>Qemlo</b>
                  <span style={{ fontSize: 11, color: "var(--text-3)" }}>{count} أداة وحاسبة مجانية</span>
                </span>
              </div>
              <button type="button" className="hd-x" aria-label="إغلاق القائمة"
                onClick={() => { setMobileMenuOpen(false); menuBtnRef.current?.focus(); }}>
                ✕
              </button>
            </div>

            <div className="hd-ds">
              <div className="hd-sr" style={{ position: "static" }}>
                <SearchIcon />
                <input
                  ref={mobSearchRef}
                  type="search"
                  aria-label="ابحث عن أداة أو حاسبة"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث، مثال: الزكاة"
                />
              </div>
            </div>

            {!searchQuery.trim() && (
              <div className="hd-jump" aria-label="الانتقال إلى قسم">
                {activeCategories.map((cat) => (
                  <button key={cat.id} type="button" className="hd-chip" onClick={() => jumpTo(cat.id)}>
                    <span aria-hidden="true">{cat.icon}</span>
                    {cat.nameAr}
                  </button>
                ))}
              </div>
            )}

            <div className="hd-dl" ref={listRef}>
              {filteredCategories.length === 0 ? (
                <div className="hd-empty" role="status">لا توجد أدوات مطابقة لبحثك. جرّب كلمة أقصر.</div>
              ) : (
                filteredCategories.map((cat) => (
                  <section key={cat.id} id={`hd-sec-${cat.id}`}>
                    <h3 className="hd-cath">
                      <span aria-hidden="true">{cat.icon}</span>
                      <span>{cat.nameAr}</span>
                      <span>{cat.tools.length.toLocaleString("en-US")}</span>
                    </h3>
                    {cat.tools.map((t) => (
                      <Link key={t.href} href={t.href} className="hd-dm" aria-current={cur(t.href)}
                        onClick={() => setMobileMenuOpen(false)}>
                        <span className="hd-ic" aria-hidden="true">{t.icon}</span>
                        <span>{t.nameAr}</span>
                      </Link>
                    ))}
                  </section>
                ))
              )}
            </div>

            <div className="hd-df">
              {COUNTRIES.map((c) => (
                <Link key={c.id} href={c.href} onClick={() => { track(c.id, "header_drawer"); setMobileMenuOpen(false); }}>
                  <span aria-hidden="true">{c.flag}</span>
                  {c.label}
                </Link>
              ))}
              <Link href="/" className="hd-home" onClick={() => setMobileMenuOpen(false)}>الصفحة الرئيسية</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}