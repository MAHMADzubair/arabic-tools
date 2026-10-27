import React from "react";
import { ArrowUpRight, ArrowDownRight } from "./Icons";

export default function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendDirection = "up",
  source,
  highlight = false,
  badge,
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-200 ${
        highlight
          ? "border-[#FF5B04]/40 bg-gradient-to-b from-[#1C1613] to-[#121212] shadow-lg shadow-[#FF5B04]/5"
          : "border-[#262626] bg-[#161616] hover:border-[#383838]"
      }`}
    >
      {/* Top row: Title and Source */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#A3A39E]">
          {title}
        </span>
        {source && (
          <span className="rounded bg-[#202020] px-2 py-0.5 text-[10px] font-medium text-[#73736C]">
            {source}
          </span>
        )}
      </div>

      {/* Value row */}
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <span className="text-2xl font-bold tracking-tight text-[#F5F5F2] sm:text-3xl">
          {value}
        </span>
        {badge}
      </div>

      {/* Bottom row: Trend and Subtitle */}
      {(trend || subtitle) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                trendDirection === "up"
                  ? "text-emerald-400"
                  : trendDirection === "down"
                  ? "text-rose-400"
                  : "text-[#A3A39E]"
              }`}
            >
              {trendDirection === "up" ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : trendDirection === "down" ? (
                <ArrowDownRight className="h-3.5 w-3.5" />
              ) : null}
              {trend}
            </span>
          )}
          {subtitle && <span className="text-[#73736C]">{subtitle}</span>}
        </div>
      )}

      {/* Subtle orange accent stripe on highlighted cards */}
      {highlight && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#FF5B04] to-transparent" />
      )}
    </div>
  );
}
