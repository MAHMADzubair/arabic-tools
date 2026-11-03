"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { getCatalogTools, CATEGORIES } from "@/lib/registry";

// Country filter tabs shown at the top of the search dialog
const COUNTRY_TABS = [
  { code: null, label: "الكل" },
  { code: "sa",  label: "🇸🇦 السعودية" },
  { code: "ae",  label: "🇦🇪 الإمارات" },
  { code: "qa",  label: "🇶🇦 قطر" },
  { code: "kw",  label: "🇰🇼 الكويت" },
  { code: "om",  label: "🇴🇲 عُمان" },
  { code: "bh",  label: "🇧🇭 البحرين" },
];

export default function HomeSearchDialog({ isOpen, onClose, defaultCountry = null }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Country filter: null = all, "sa" / "ae" / etc.
  const [activeCountry, setActiveCountry] = useState(defaultCountry);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const tabsRef = useRef(null);

  const tools = useMemo(() => getCatalogTools(), []);

  // When dialog opens, reset to defaultCountry
  useEffect(() => {
    if (isOpen) {
      setActiveCountry(defaultCountry);
    }
  }, [isOpen, defaultCountry]);

  // ── Tools filtered by country tab + text query ────────────────────────────
  const countryFiltered = useMemo(() => {
    if (!activeCountry) return tools;
    return tools.filter(
      (t) => t.countries.length === 0 || t.countries.includes(activeCountry)
    );
  }, [tools, activeCountry]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countryFiltered.slice(0, 12);
    return countryFiltered.filter(
      (t) =>
        t.nameAr.toLowerCase().includes(q) ||
        (t.descAr && t.descAr.toLowerCase().includes(q)) ||
        (t.nameEn && t.nameEn.toLowerCase().includes(q)) ||
        (t.badge && t.badge.toLowerCase().includes(q))
    );
  }, [countryFiltered, query]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset selectedIndex when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length, activeCountry]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        window.location.href = filtered[selectedIndex].href;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  const activeTabLabel = COUNTRY_TABS.find((t) => t.code === activeCountry)?.label ?? "الكل";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="البحث عن أدوات وحاسبات"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--border,#333)] bg-[#161616] text-[#F5F5F2] shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Search Input Bar ── */}
        <div className="relative flex items-center border-b border-[#2A2A2A] px-4 py-3 sm:px-6">
          <svg
            className="h-5 w-5 text-[#8E8E89] shrink-0 ms-1 me-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={`ابحث بين ${countryFiltered.length} أداة${activeCountry ? ` (${activeTabLabel})` : ""}...`}
            className="w-full bg-transparent text-base sm:text-lg text-[#F5F5F2] placeholder-[#666] outline-none"
            aria-label="ابحث في الأدوات"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#8E8E89] hover:bg-white/10 hover:text-white transition-colors"
            aria-label="إغلاق البحث"
          >
            <kbd className="hidden sm:inline-block rounded border border-[#333] px-2 py-0.5 text-xs text-[#888]">
              Esc
            </kbd>
            <span className="sm:hidden text-lg px-2">✕</span>
          </button>
        </div>

        {/* ── Country Filter Tabs ── */}
        <div
          ref={tabsRef}
          className="flex gap-1.5 overflow-x-auto px-3 pt-3 pb-2 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
          role="tablist"
          aria-label="تصفية حسب الدولة"
        >
          {COUNTRY_TABS.map((tab) => {
            const isActive = tab.code === activeCountry;
            return (
              <button
                key={tab.code ?? "all"}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCountry(tab.code)}
                className={`flex-none rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#FF5B04] text-[#0D0D0D]"
                    : "bg-white/[0.07] text-[#B5B5B0] hover:bg-white/15 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Results List ── */}
        <div
          ref={resultsRef}
          className="max-h-[52vh] overflow-y-auto p-2 sm:p-3 divide-y divide-[#222]"
        >
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-[#888]">
              <p className="text-base font-semibold">لم نعثر على أداة مطابقة</p>
              <p className="mt-1 text-sm text-[#666]">
                {activeCountry
                  ? `جرّب تغيير الدولة أو كلمة بحث أخرى`
                  : `جرّب كلمة مثل «راتب» أو «زكاة» أو «فاتورة»`}
              </p>
            </div>
          ) : (
            filtered.map((tool, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  onClick={onClose}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3.5 rounded-2xl p-3 text-start transition-colors ${
                    isSelected
                      ? "bg-[#252525] text-white"
                      : "hover:bg-[#1E1E1E] text-[#DDD]"
                  }`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2A2A2A] text-xl">
                    {tool.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[15px] sm:text-base leading-snug">
                        {tool.nameAr}
                      </span>
                      {tool.badge && (
                        <span className="rounded-full bg-[#FF5B04]/20 px-2 py-0.5 text-[11px] font-bold text-[#FF5B04]">
                          {tool.badge}
                        </span>
                      )}
                      {/* Country tags */}
                      {!activeCountry && tool.countries.length > 0 && tool.countries.length <= 3 && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#8E8E89] uppercase">
                          {tool.countries.join(" · ")}
                        </span>
                      )}
                    </div>
                    {tool.descAr && (
                      <p className="mt-0.5 truncate text-xs text-[#888]">
                        {tool.descAr}
                      </p>
                    )}
                  </div>
                  <span className="hidden sm:inline-block text-xs text-[#666] shrink-0">
                    انتقال ←
                  </span>
                </Link>
              );
            })
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-[#222] bg-[#121212] px-4 py-2.5 text-xs text-[#777]">
          <span>
            {filtered.length} نتيجة
            {activeCountry ? ` · ${activeTabLabel}` : ""}
          </span>
          <div className="hidden sm:flex items-center gap-3">
            <span>↑↓ للتنقل</span>
            <span>↵ للاختيار</span>
            <span>Esc للإغلاق</span>
          </div>
        </div>
      </div>
    </div>
  );
}
