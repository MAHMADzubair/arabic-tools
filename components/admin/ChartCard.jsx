"use client";
import React, { useState } from "react";

export default function ChartCard({
  title,
  subtitle,
  data = [], // [{ label: "Mon", value: 120, secondary: 80 }]
  height = 200,
  type = "area", // "area" | "bar"
  color = "#FF5B04",
  badge,
  source,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-[#262626] bg-[#161616] p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F2]">{title}</h3>
        <div className="mt-8 flex h-40 items-center justify-center text-xs text-[#73736C]">
          No chart data available for this range
        </div>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  // Chart coordinate mapping
  const svgWidth = 600;
  const svgHeight = height;
  const paddingX = 20;
  const paddingY = 24;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1 || 1)) * chartW;
    const y = paddingY + chartH - ((d.value - minVal) / range) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY + chartH} L ${points[0].x} ${paddingY + chartH} Z`;

  return (
    <div className="rounded-xl border border-[#262626] bg-[#161616] p-5">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222222] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F5F5F2]">{title}</h3>
            {badge}
          </div>
          {subtitle && <p className="mt-0.5 text-xs text-[#A3A39E]">{subtitle}</p>}
        </div>
        {source && (
          <span className="rounded bg-[#202020] px-2 py-0.5 text-[10px] font-medium text-[#73736C]">
            {source}
          </span>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative mt-4">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full overflow-visible"
          style={{ height: `${height}px` }}
        >
          <defs>
            <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={svgWidth - paddingX}
            y2={paddingY}
            stroke="#262626"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={paddingY + chartH / 2}
            x2={svgWidth - paddingX}
            y2={paddingY + chartH / 2}
            stroke="#262626"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={paddingY + chartH}
            x2={svgWidth - paddingX}
            y2={paddingY + chartH}
            stroke="#262626"
          />

          {type === "area" && (
            <>
              {/* Gradient Area fill */}
              <path d={areaD} fill={`url(#grad-${title})`} />
              {/* Stroke line */}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Data points */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIndex === i ? "5" : "3"}
                  fill={hoveredIndex === i ? "#FFFFFF" : color}
                  stroke="#161616"
                  strokeWidth="2"
                  className="transition-all duration-150 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
            </>
          )}

          {type === "bar" && (
            <>
              {points.map((p, i) => {
                const barW = Math.max(8, chartW / points.length - 12);
                const barH = paddingY + chartH - p.y;
                return (
                  <rect
                    key={i}
                    x={p.x - barW / 2}
                    y={p.y}
                    width={barW}
                    height={barH}
                    rx="3"
                    fill={hoveredIndex === i ? "#FF7326" : color}
                    className="transition-all duration-150 cursor-pointer opacity-90 hover:opacity-100"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </>
          )}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="pointer-events-none absolute -top-8 rounded bg-[#202020] border border-[#333333] px-2.5 py-1 text-xs shadow-xl text-[#F5F5F2]"
            style={{
              left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            <span className="font-bold text-[#FF5B04]">
              {points[hoveredIndex].value.toLocaleString()}
            </span>
            <span className="ml-1 text-[11px] text-[#A3A39E]">
              ({points[hoveredIndex].label})
            </span>
          </div>
        )}

        {/* X-axis labels */}
        <div className="mt-2 flex justify-between px-4 text-[11px] text-[#73736C]">
          {data.map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
