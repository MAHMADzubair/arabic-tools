"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { getCatalogTools } from "@/lib/registry";

export default function HomeSearchDialog({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const tools = useMemo(() => getCatalogTools(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tools.slice(0, 10);
    return tools.filter(
      (t) =>
        t.nameAr.toLowerCase().includes(q) ||
        (t.descAr && t.descAr.toLowerCase().includes(q)) ||
        (t.nameEn && t.nameEn.toLowerCase().includes(q)) ||
        (t.badge && t.badge.toLowerCase().includes(q))
    );
  }, [tools, query]);

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
        {/* Search Input Bar */}
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
            placeholder={`ابحث بين ${tools.length} أداة وحاسبة: الراتب، العمرة، فترة الإنذار...`}
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

        {/* Results List */}
        <div
          ref={resultsRef}
          className="max-h-[60vh] overflow-y-auto p-2 sm:p-3 divide-y divide-[#222]"
        >
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#888]">
              <p className="text-base font-semibold">لم نعثر على أداة مطابقة لبحثك</p>
              <p className="mt-1 text-sm text-[#666]">جرّب كلمة بحث أخرى مثل «راتب» أو «زكاة» أو «فاتورة»</p>
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
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[15px] sm:text-base leading-snug">
                        {tool.nameAr}
                      </span>
                      {tool.badge && (
                        <span className="rounded-full bg-[#FF5B04]/20 px-2 py-0.5 text-[11px] font-bold text-[#FF5B04]">
                          {tool.badge}
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

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-[#222] bg-[#121212] px-4 py-2.5 text-xs text-[#777]">
          <span>{filtered.length} نتيجة متاحة</span>
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
