"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
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

const COUNTRIES = [
  { href: "/ar/sa", id: "sa", label: "السعودية" },
  { href: "/ar/ae", id: "ae", label: "الإمارات" },
];

const CSS = `
.hd{--bg:var(--c-bg,#F5F5F2);--ink:var(--c-ink,#0D0D0D);--ac:var(--c-accent,#FF6A1A);--sf:var(--c-surface,#FFFFFF);--mu:var(--c-muted,#55554F);--ln:var(--c-line,#0D0D0D)}
@media (prefers-color-scheme:dark){.hd{--bg:var(--c-bg,#0D0D0D);--ink:var(--c-ink,#F5F5F2);--sf:var(--c-surface,#161616);--mu:var(--c-muted,#A8A8A0);--ln:var(--c-line,#F5F5F2)}}
.hd *{box-sizing:border-box}
.hd a,.hd button{font:inherit}
.hd-bar{position:sticky;top:0;z-index:40;background:var(--bg);color:var(--ink);border-bottom:2px solid var(--ln)}
.hd-in{max-width:64rem;margin:0 auto;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.hd-logo{display:flex;align-items:center;gap:10px;color:var(--ink);text-decoration:none;flex:none}
.hd-mark{width:36px;height:36px;display:grid;place-items:center;background:var(--ac);color:#0D0D0D;border:2px solid var(--ln);font-weight:900;font-size:18px}
.hd-name{display:block;font-size:17px;font-weight:900;line-height:1.2}
.hd-count{display:none;font-size:11px;color:var(--mu)}
@media(min-width:640px){.hd-count{display:block}}
.hd-nav{display:none;align-items:center;gap:6px}
@media(min-width:768px){.hd-nav{display:flex}.hd-mob{display:none!important}}
.hd-link,.hd-btn,.hd-chip{color:var(--ink);text-decoration:none;font-size:13px;font-weight:700;padding:6px 10px;background:none;border:1px solid transparent;cursor:pointer;min-height:36px;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.hd-link:hover{border-color:var(--ln)}
.hd-link[aria-current="page"],.hd-chip[aria-current="page"]{border-bottom:3px solid var(--ln);font-weight:900}
.hd-country{border:1px solid var(--ln)}
.hd-country:hover,.hd-chip:hover{background:var(--ink);color:var(--bg)}
.hd-btn{border:2px solid var(--ln);background:var(--ac);color:#0D0D0D;font-weight:800}
.hd-btn:hover{background:var(--ink);color:var(--bg)}
.hd a:focus-visible,.hd button:focus-visible,.hd input:focus-visible{outline:3px solid var(--ac);outline-offset:2px}
.hd-rel{position:relative}
.hd-scrim{position:fixed;inset:0;z-index:40;background:transparent}
.hd-menu{position:absolute;left:0;top:calc(100% + 8px);z-index:50;width:min(520px,90vw);background:var(--sf);border:2px solid var(--ln);padding:16px;color:var(--ink)}
.hd-menu-h{display:flex;justify-content:space-between;align-items:center;gap:8px;border-bottom:2px solid var(--ln);padding-bottom:8px;margin-bottom:12px;font-size:13px;font-weight:900}
.hd-x{background:none;border:1px solid var(--ln);color:var(--ink);width:36px;height:36px;display:grid;place-items:center;cursor:pointer;font-weight:900}
.hd-x:hover{background:var(--ink);color:var(--bg)}
.hd-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-height:380px;overflow-y:auto;padding:2px}
.hd-cat{margin:0 0 6px;padding-bottom:4px;border-bottom:1px solid var(--ln);font-size:12px;font-weight:800;color:var(--mu)}
.hd-item{display:block;color:var(--ink);text-decoration:none;font-size:13px;font-weight:600;padding:6px 8px;border-inline-start:3px solid transparent;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hd-item:hover{border-inline-start-color:var(--ac);background:var(--bg)}
.hd-item[aria-current="page"]{border-inline-start-color:var(--ln);font-weight:900}
.hd-quick{display:flex;gap:6px;overflow-x:auto;padding:8px 16px;border-top:1px solid var(--ln);scrollbar-width:none}
.hd-quick::-webkit-scrollbar{display:none}
@media(min-width:768px){.hd-quick{display:none}}
.hd-chip{flex:none;border:1px solid var(--ln);font-size:12px;padding:4px 10px;min-height:36px}
.hd-over{position:fixed;inset:0;z-index:50;display:flex;justify-content:flex-end}
@media(min-width:768px){.hd-over{display:none}}
.hd-back{position:absolute;inset:0;background:rgba(13,13,13,.7)}
.hd-drawer{position:relative;z-index:1;width:100%;max-width:24rem;height:100%;background:var(--sf);color:var(--ink);border-inline-end:2px solid var(--ln);display:flex;flex-direction:column;margin-inline-end:auto}
.hd-dh{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 16px;border-bottom:2px solid var(--ln)}
.hd-ds{padding:12px 16px;border-bottom:1px solid var(--ln)}
.hd-field{width:100%;border:1px solid var(--ln);background:var(--bg);color:var(--ink);padding:10px 12px;font-size:14px;border-radius:0;min-height:44px}
.hd-lbl{display:block;font-size:12px;font-weight:700;margin-bottom:6px}
.hd-dl{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:20px}
.hd-df{padding:12px 16px;border-top:2px solid var(--ln)}
.hd-home{display:block;text-align:center;background:var(--ac);color:#0D0D0D;border:2px solid var(--ln);padding:10px;font-weight:800;font-size:14px;text-decoration:none;min-height:44px}
.hd-home:hover{background:var(--ink);color:var(--bg)}
.hd-dm{display:block;color:var(--ink);text-decoration:none;font-size:14px;font-weight:700;padding:10px;min-height:44px;border-inline-start:3px solid transparent}
.hd-dm:hover{border-inline-start-color:var(--ac);background:var(--bg)}
.hd-dm[aria-current="page"]{border-inline-start-color:var(--ln);font-weight:900}
.hd-empty{text-align:center;padding:32px 0;font-size:13px;color:var(--mu)}
@media print{.hd-bar{display:none}}
`;

function track(country, from) {
  if (typeof window !== "undefined" && typeof window.trackEvent === "function") {
    window.trackEvent("country_switched", { country, from });
  }
}

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropBtnRef = useRef(null);
  const menuBtnRef = useRef(null);

  const activeTools = useMemo(() => getActiveTools(), []);
  const toolCount = activeTools.length;
  const count = toolCount.toLocaleString("en-US");

  const activeCategories = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        ...cat,
        tools: activeTools.filter((t) => t.category === cat.id),
      })).filter((cat) => cat.tools.length > 0),
    [activeTools]
  );

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Escape closes whichever menu is open and returns focus to its trigger
  useEffect(() => {
    if (!mobileMenuOpen && !desktopDropdownOpen) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuBtnRef.current?.focus();
      }
      if (desktopDropdownOpen) {
        setDesktopDropdownOpen(false);
        dropBtnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen, desktopDropdownOpen]);

  // Close menus on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setDesktopDropdownOpen(false);
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

  return (
    <div className="hd">
      <style>{CSS}</style>

      <header className="hd-bar">
        <div className="hd-in">
          {/* Logo */}
          <a href="/" className="hd-logo" aria-label="أدوات عربية — الصفحة الرئيسية">
            <span className="hd-mark" aria-hidden="true">ع</span>
            <span>
              <span className="hd-name">أدوات عربية</span>
              <span className="hd-count">{count} أداة وحاسبة مجانية</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hd-nav" aria-label="التنقل الرئيسي">
            {COUNTRIES.map((c) => (
              <a key={c.id} href={c.href} className="hd-link hd-country" onClick={() => track(c.id, "header_desktop")}>
                {c.label}
              </a>
            ))}
            {TOP_TOOLS.slice(0, 5).map((t) => (
              <a key={t.href} href={t.href} className="hd-link" aria-current={cur(t.href)}>
                {t.label}
              </a>
            ))}

            {/* All Tools dropdown */}
            <div className="hd-rel">
              <button
                ref={dropBtnRef}
                type="button"
                className="hd-btn"
                aria-expanded={desktopDropdownOpen}
                aria-controls="hd-all-tools"
                onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)}
              >
                جميع الأدوات ({count})
                <span aria-hidden="true">{desktopDropdownOpen ? "▲" : "▼"}</span>
              </button>

              {desktopDropdownOpen && (
                <>
                  <div className="hd-scrim" onClick={() => setDesktopDropdownOpen(false)} />
                  <div id="hd-all-tools" className="hd-menu">
                    <div className="hd-menu-h">
                      <span>دليل جميع الأدوات ({count} أداة)</span>
                      <button type="button" className="hd-x" aria-label="إغلاق القائمة" onClick={() => setDesktopDropdownOpen(false)}>
                        ✕
                      </button>
                    </div>
                    <div className="hd-cols">
                      {activeCategories.map((cat) => (
                        <div key={cat.id}>
                          <h3 className="hd-cat">{cat.nameAr}</h3>
                          {cat.tools.map((t) => (
                            <a key={t.href} href={t.href} className="hd-item" aria-current={cur(t.href)}
                              onClick={() => setDesktopDropdownOpen(false)}>
                              {t.nameAr}
                            </a>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="hd-mob">
            <button
              ref={menuBtnRef}
              type="button"
              className="hd-btn"
              aria-haspopup="dialog"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
            >
              <span aria-hidden="true">☰</span>
              الأدوات ({count})
            </button>
          </div>
        </div>

        {/* Mobile quick bar */}
        <nav className="hd-quick" aria-label="أدوات سريعة">
          {COUNTRIES.map((c) => (
            <a key={c.id} href={c.href} className="hd-chip" style={{ borderWidth: 2, fontWeight: 800 }}
              onClick={() => track(c.id, "header_mobile")}>
              {c.label}
            </a>
          ))}
          {TOP_TOOLS.map((t) => (
            <a key={t.href} href={t.href} className="hd-chip" aria-current={cur(t.href)}>
              {t.label}
            </a>
          ))}
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="hd-over" role="dialog" aria-modal="true" aria-label="قائمة الأدوات">
          <div className="hd-back" onClick={() => setMobileMenuOpen(false)} />
          <div className="hd-drawer">
            <div className="hd-dh">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="hd-mark" style={{ width: 32, height: 32, fontSize: 15 }} aria-hidden="true">ع</span>
                <span>
                  <b style={{ display: "block", fontSize: 15 }}>أدوات عربية</b>
                  <span style={{ fontSize: 11, color: "var(--mu)" }}>{count} أداة وحاسبة مجانية</span>
                </span>
              </div>
              <button type="button" className="hd-x" aria-label="إغلاق القائمة"
                onClick={() => { setMobileMenuOpen(false); menuBtnRef.current?.focus(); }}>
                ✕
              </button>
            </div>

            <div className="hd-ds">
              <label className="hd-lbl" htmlFor="hd-search">ابحث عن أداة أو حاسبة</label>
              <input
                id="hd-search"
                type="search"
                className="hd-field"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="مثال: الزكاة"
              />
            </div>

            <div className="hd-dl">
              {filteredCategories.length === 0 ? (
                <div className="hd-empty" role="status">لا توجد أدوات مطابقة لبحثك. جرّب كلمة أقصر.</div>
              ) : (
                filteredCategories.map((cat) => (
                  <section key={cat.id}>
                    <h3 className="hd-cat" style={{ fontSize: 13, color: "var(--ink)", borderBottomWidth: 2 }}>{cat.nameAr}</h3>
                    {cat.tools.map((t) => (
                      <a key={t.href} href={t.href} className="hd-dm" aria-current={cur(t.href)}
                        onClick={() => setMobileMenuOpen(false)}>
                        {t.nameAr}
                      </a>
                    ))}
                  </section>
                ))
              )}
            </div>

            <div className="hd-df">
              <a href="/" className="hd-home" onClick={() => setMobileMenuOpen(false)}>الصفحة الرئيسية</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}