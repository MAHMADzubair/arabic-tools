"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, getCatalogToolsByCategory } from "@/lib/registry";

// ─── Category SVG icons ────────────────────────────────────────────────────────
function CategoryIcon({ id, className = "h-6 w-6" }) {
  switch (id) {
    case "gulf":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M4 10l8-7 8 7" />
        </svg>
      );
    case "finance":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      );
    case "islamic":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    case "everyday":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "business":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
  }
}

// ─── Tool SVG icons (by tool id keywords) ─────────────────────────────────────
function ToolIcon({ id, className = "h-5 w-5" }) {
  if (id.includes("salary")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    );
  }
  if (id.includes("overtime")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  if (id.includes("vat") || id.includes("tax") || id.includes("invoice")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    );
  }
  if (id.includes("gratuity") || id.includes("settlement") || id.includes("final")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    );
  }
  if (id.includes("leave") || id.includes("annual")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
      </svg>
    );
  }
  if (id.includes("notice") || id.includes("article-77") || id.includes("article-43")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
  if (id.includes("corporate") || id.includes("business") || id.includes("quotation") || id.includes("purchase")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    );
  }
  if (id.includes("loan") || id.includes("mortgage") || id.includes("compound") || id.includes("roi")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }
  if (id.includes("zakat") || id.includes("kaffara") || id.includes("hijri") || id.includes("umrah") || id.includes("inheritance")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  if (id.includes("bmi") || id.includes("unit") || id.includes("date") || id.includes("currency")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    );
  }
  // default
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="2" x2="9" y2="4" />
      <line x1="15" y1="2" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="22" />
      <line x1="15" y1="20" x2="15" y2="22" />
      <line x1="20" y1="9" x2="22" y2="9" />
      <line x1="20" y1="14" x2="22" y2="14" />
      <line x1="2" y1="9" x2="4" y2="9" />
      <line x1="2" y1="14" x2="4" y2="14" />
    </svg>
  );
}

// ─── Arrow icon ────────────────────────────────────────────────────────────────
function ArrowIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* RTL: points left (←) */}
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

// ─── Single Tool Card ──────────────────────────────────────────────────────────
function ToolCard({ tool }) {
  return (
    <li>
      <Link
        href={tool.href}
        className="
          group flex items-center gap-4 rounded-2xl
          bg-[var(--card-tool-bg)] border border-[var(--card-tool-border)]
          p-4 sm:p-5
          transition-all duration-200
          hover:border-[var(--orange)] hover:shadow-[0_4px_24px_-4px_rgba(255,91,4,0.18)]
          hover:-translate-y-0.5
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]
        "
      >
        {/* Icon plate */}
        <span
          className="
            flex h-12 w-12 sm:h-14 sm:w-14 shrink-0
            items-center justify-center rounded-xl sm:rounded-2xl
            bg-[var(--orange)] text-[var(--on-orange)]
            transition-transform duration-200
            group-hover:scale-105
          "
          aria-hidden="true"
        >
          <ToolIcon id={tool.id} className="h-5 w-5 sm:h-6 sm:w-6" />
        </span>

        {/* Text */}
        <span className="min-w-0 flex-1">
          {/* Title + optional badge */}
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5">
            <span className="text-[15px] sm:text-base font-bold leading-snug text-[var(--card-tool-text)]">
              {tool.nameAr}
            </span>
            {tool.badge && (
              <span className="shrink-0 rounded-md bg-[var(--orange)] px-2 py-0.5 text-[10px] sm:text-xs font-bold text-[var(--on-orange)]">
                {tool.badge}
              </span>
            )}
          </span>
          {/* Description */}
          <span className="block text-xs sm:text-sm leading-relaxed text-[var(--card-tool-muted)] line-clamp-2">
            {tool.descAr}
          </span>
        </span>

        {/* Arrow */}
        <span
          className="
            flex h-8 w-8 shrink-0 items-center justify-center
            rounded-full border border-[var(--card-tool-border)]
            text-[var(--card-tool-muted)]
            transition-all duration-200
            group-hover:border-[var(--orange)] group-hover:text-[var(--orange)] group-hover:bg-[var(--orange)]/10
            group-hover:-translate-x-0.5
          "
          aria-hidden="true"
        >
          <ArrowIcon className="h-4 w-4" />
        </span>
      </Link>
    </li>
  );
}

// ─── Category Card Section ─────────────────────────────────────────────────────
function CategoryCard({ category, tools, initialLimit = 8 }) {
  const [expanded, setExpanded] = useState(false);
  const visibleTools = expanded ? tools : tools.slice(0, initialLimit);
  const hiddenCount = tools.length - initialLimit;

  return (
    <section
      aria-labelledby={`cat-title-${category.id}`}
      className="
        rounded-3xl overflow-hidden
        border border-[var(--cat-border)]
        bg-[var(--cat-bg)]
      "
    >
      {/* ── Category Header ── */}
      <div className="flex items-center gap-4 px-5 py-5 sm:px-7 sm:py-6 border-b border-[var(--cat-border)]">
        {/* Icon */}
        <span
          className="
            flex h-12 w-12 sm:h-14 sm:w-14 shrink-0
            items-center justify-center rounded-xl sm:rounded-2xl
            bg-[var(--orange)] text-[var(--on-orange)]
          "
          aria-hidden="true"
        >
          <CategoryIcon id={category.id} className="h-5 w-5 sm:h-6 sm:w-6" />
        </span>

        {/* Title + subtitle */}
        <div className="min-w-0 flex-1">
          <h2
            id={`cat-title-${category.id}`}
            className="text-lg sm:text-xl font-bold leading-tight text-[var(--cat-text)]"
          >
            {category.nameAr}
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-[var(--cat-muted)] leading-relaxed line-clamp-1">
            {category.nameEn}
            {category.comingSoonDesc ? ` — ${category.comingSoonDesc}` : ""}
          </p>
        </div>

        {/* Tool count badge */}
        <span
          className="
            shrink-0 flex items-center justify-center
            min-w-[2.5rem] h-8 px-3
            rounded-full bg-[var(--orange)] text-[var(--on-orange)]
            text-xs font-bold
          "
          aria-label={`${tools.length} أداة`}
        >
          {tools.length.toLocaleString("ar-EG")} أداة
        </span>
      </div>

      {/* ── Tools Grid ── */}
      <ul
        className="
          grid list-none m-0 p-4 sm:p-5
          grid-cols-1 lg:grid-cols-2
          gap-3 sm:gap-4
        "
      >
        {visibleTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </ul>

      {/* ── Expand / Collapse ── */}
      {!expanded && hiddenCount > 0 && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <button
            onClick={() => setExpanded(true)}
            className="
              w-full flex items-center justify-center gap-2
              rounded-2xl border border-[var(--cat-border)]
              bg-[var(--cat-bg)] text-[var(--cat-muted)]
              py-3.5 text-sm font-semibold
              transition-all duration-200
              hover:border-[var(--orange)] hover:text-[var(--cat-text)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange)]
            "
            aria-expanded={expanded}
            aria-controls={`cat-tools-${category.id}`}
          >
            <span>عرض باقي الأدوات ({hiddenCount.toLocaleString("ar-EG")})</span>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}

// ─── CSS tokens for this component (injected once) ────────────────────────────
const CARD_TOKENS = `
.cat-tool-cards-root {
  /* light mode */
  --cat-bg: #FFFFFF;
  --cat-border: #E2E2DC;
  --cat-text: #0D0D0D;
  --cat-muted: #6B6B66;
  --card-tool-bg: #F8F8F5;
  --card-tool-border: #E2E2DC;
  --card-tool-text: #0D0D0D;
  --card-tool-muted: #6B6B66;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .cat-tool-cards-root {
    --cat-bg: #161616;
    --cat-border: #2A2A2A;
    --cat-text: #F5F5F2;
    --cat-muted: #8E8E89;
    --card-tool-bg: #1E1E1E;
    --card-tool-border: #2A2A2A;
    --card-tool-text: #F5F5F2;
    --card-tool-muted: #8E8E89;
  }
}
:root[data-theme="dark"] .cat-tool-cards-root {
  --cat-bg: #161616;
  --cat-border: #2A2A2A;
  --cat-text: #F5F5F2;
  --cat-muted: #8E8E89;
  --card-tool-bg: #1E1E1E;
  --card-tool-border: #2A2A2A;
  --card-tool-text: #F5F5F2;
  --card-tool-muted: #8E8E89;
}
`;

// ─── Main Export ───────────────────────────────────────────────────────────────
/**
 * CategoryToolCards
 *
 * Renders one card-block per active category, each containing:
 * - Category header (icon, name, tool count)
 * - Responsive 1–2 column tool grid
 * - "Show more" expand button when tools > initialLimit
 *
 * Props:
 *  categoryIds   — array of category ids to show; defaults to all active
 *  initialLimit  — max tools shown before "show more" (default: 8)
 *  className     — extra class on the wrapper div
 */
export default function CategoryToolCards({
  categoryIds,
  initialLimit = 8,
  className = "",
}) {
  const activeCats = CATEGORIES.map((cat) => ({
    ...cat,
    tools: getCatalogToolsByCategory(cat.id),
  })).filter((cat) => {
    if (cat.tools.length === 0) return false;
    if (categoryIds && categoryIds.length > 0) return categoryIds.includes(cat.id);
    return true;
  });

  return (
    <div className={`cat-tool-cards-root ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: CARD_TOKENS }} />
      <div className="space-y-6 sm:space-y-8">
        {activeCats.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            tools={cat.tools}
            initialLimit={initialLimit}
          />
        ))}
      </div>
    </div>
  );
}
