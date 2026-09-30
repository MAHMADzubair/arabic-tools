/**
 * components/business/RelatedBusinessTools.jsx
 * Reusable related tools grid for business/tax tool pages.
 * Server-safe (no "use client").
 *
 * Props:
 *   tools   — Array<{ href, icon, title, desc, badge, badgeColor, cta? }>
 *   title?  — Section heading (default: "🔗 أدوات ذات صلة")
 *   subtitle? — Sub-heading
 *   className?
 *
 * Each tool item:
 *   href        — Next.js route
 *   icon        — emoji string
 *   title       — Arabic label
 *   desc        — Short Arabic description
 *   badge       — Short badge text
 *   badgeColor  — Tailwind classes e.g. "bg-blue-100 text-blue-800"
 *   cta?        — Optional call-to-action line (shown below desc in indigo)
 */
import Link from "next/link";

export default function RelatedBusinessTools({
  tools = [],
  title = "🔗 أدوات ذات صلة",
  subtitle = "",
  className = "",
}) {
  if (!tools.length) return null;

  return (
    <div className={`rounded-2xl border border-brand-border bg-white p-6 sm:p-8 shadow-card ${className}`}>
      <div className="border-b border-brand-border pb-4 mb-5">
        <h2 className="text-lg font-extrabold text-ink">{title}</h2>
        {subtitle && <p className="text-xs text-ink-muted mt-1">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex items-start gap-3 rounded-xl border border-brand-border bg-white p-4 hover:border-brand hover:shadow-md transition-all"
          >
            <span className="text-2xl shrink-0 mt-0.5">{tool.icon}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-sm font-bold text-ink group-hover:text-brand transition-colors">
                  {tool.title}
                </span>
                {tool.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">{tool.desc}</p>
              {tool.cta && (
                <p className="text-xs font-bold text-indigo-600 mt-1">{tool.cta}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
