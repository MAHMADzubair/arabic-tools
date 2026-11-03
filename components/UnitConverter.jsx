"use client";

/**
 * components/UnitConverter.jsx
 * Qemlo tool style: glossy orange + ink, SVG icons, 26px cards, 16px controls,
 * light/dark, mobile-first. Conversion logic and data model are unchanged
 * (rateToBase / convertTemp); only presentation, formatting and a few
 * factor-precision fixes were made.
 */

import { useState, useMemo, useId, useRef } from "react";

/* ─── Unit Conversion Definitions ─────────────────────────────────────────── */
const UNIT_CATEGORIES = {
  length: {
    id: "length",
    icon: "ruler",
    name: "الطول والمسافة",
    baseUnit: "m",
    units: [
      { id: "m", name: "متر", symbol: "م / m", rateToBase: 1 },
      { id: "km", name: "كيلومتر", symbol: "كم / km", rateToBase: 1000 },
      { id: "cm", name: "سنتيمتر", symbol: "سم / cm", rateToBase: 0.01 },
      { id: "mm", name: "مليمتر", symbol: "ملم / mm", rateToBase: 0.001 },
      { id: "mi", name: "ميل", symbol: "mi", rateToBase: 1609.344 },
      { id: "yd", name: "ياردة", symbol: "yd", rateToBase: 0.9144 },
      { id: "ft", name: "قدم", symbol: "قدم / ft", rateToBase: 0.3048 },
      { id: "in", name: "بوصة (إنش)", symbol: "بوصة / in", rateToBase: 0.0254 },
    ],
    presets: [
      { label: "1 ميل إلى كيلومتر", val: 1, from: "mi", to: "km" },
      { label: "100 متر إلى أقدام", val: 100, from: "m", to: "ft" },
      { label: "1 بوصة إلى سنتيمتر", val: 1, from: "in", to: "cm" },
      { label: "175 سم إلى أقدام وإنش", val: 175, from: "cm", to: "ft" },
    ],
  },
  weight: {
    id: "weight",
    icon: "scale",
    name: "الوزن والكتلة",
    baseUnit: "kg",
    units: [
      { id: "kg", name: "كيلوجرام", symbol: "كجم / kg", rateToBase: 1 },
      { id: "g", name: "جرام", symbol: "جم / g", rateToBase: 0.001 },
      { id: "mg", name: "مليجرام", symbol: "ملجم / mg", rateToBase: 0.000001 },
      { id: "t", name: "طن متري", symbol: "طن / t", rateToBase: 1000 },
      { id: "lb", name: "رطل (باوند)", symbol: "رطل / lb", rateToBase: 0.45359237 },
      { id: "oz", name: "أونصة (أوقية)", symbol: "أونصة / oz", rateToBase: 0.028349523125 },
      { id: "st", name: "ستون (Stone)", symbol: "st", rateToBase: 6.35029318 },
    ],
    presets: [
      { label: "1 كيلوجرام إلى باوند", val: 1, from: "kg", to: "lb" },
      { label: "150 باوند إلى كجم", val: 150, from: "lb", to: "kg" },
      { label: "1 أونصة إلى جرام", val: 1, from: "oz", to: "g" },
      { label: "1 طن إلى كيلوجرام", val: 1, from: "t", to: "kg" },
    ],
  },
  temperature: {
    id: "temperature",
    icon: "thermo",
    name: "درجة الحرارة",
    isTemp: true,
    units: [
      { id: "C", name: "درجة مئوية", symbol: "°C" },
      { id: "F", name: "فهرنهايت", symbol: "°F" },
      { id: "K", name: "كلفن", symbol: "K" },
    ],
    presets: [
      { label: "درجة غليان الماء (100°C)", val: 100, from: "C", to: "F" },
      { label: "درجة حرارة الجسم (37°C)", val: 37, from: "C", to: "F" },
      { label: "درجة تجمد الماء (0°C)", val: 0, from: "C", to: "F" },
      { label: "100 فهرنهايت إلى مئوية", val: 100, from: "F", to: "C" },
    ],
  },
  area: {
    id: "area",
    icon: "area",
    name: "المساحة",
    baseUnit: "m2",
    units: [
      { id: "m2", name: "متر مربع", symbol: "م²", rateToBase: 1 },
      { id: "km2", name: "كيلومتر مربع", symbol: "كم²", rateToBase: 1000000 },
      {
        id: "donum",
        name: "دونم (متري)",
        symbol: "دونم",
        rateToBase: 1000,
        note: "الدونم المتري = 1000 م² (الشام وتركيا والإمارات). في العراق يساوي الدونم 2500 م².",
      },
      {
        id: "feddan",
        name: "فدان (مصر)",
        symbol: "فدان",
        rateToBase: 4200.83,
        note: "الفدان المصري = 24 قيراطًا ويُعتمد غالبًا 4200.83 م² (يُقرَّب أحيانًا إلى 4200 م²). يختلف حجمه في سوريا.",
      },
      { id: "ha", name: "هكتار", symbol: "ha", rateToBase: 10000 },
      { id: "acre", name: "فدان غربي (Acre)", symbol: "ac", rateToBase: 4046.8564224 },
      { id: "ft2", name: "قدم مربع", symbol: "قدم²", rateToBase: 0.09290304 },
    ],
    presets: [
      { label: "1 دونم إلى متر مربع", val: 1, from: "donum", to: "m2" },
      { label: "1 هكتار إلى دونم", val: 1, from: "ha", to: "donum" },
      { label: "1 فدان إلى متر مربع", val: 1, from: "feddan", to: "m2" },
      { label: "500 متر مربع إلى أقدام²", val: 500, from: "m2", to: "ft2" },
    ],
  },
  volume: {
    id: "volume",
    icon: "flask",
    name: "الحجم والسعة",
    baseUnit: "L",
    units: [
      { id: "L", name: "لتر", symbol: "لتر / L", rateToBase: 1 },
      { id: "mL", name: "مليلتر", symbol: "مل / mL", rateToBase: 0.001 },
      { id: "gal", name: "جالون أمريكي", symbol: "gal", rateToBase: 3.785411784 },
      {
        id: "cup",
        name: "كوب قياسي",
        symbol: "كوب",
        rateToBase: 0.24,
        note: "الكوب هنا = 240 مل (كوب الملصقات الغذائية). الكوب الأمريكي القانوني = 236.59 مل.",
      },
      { id: "floz", name: "أونصة سائلة", symbol: "fl oz", rateToBase: 0.0295735295625 },
      { id: "m3", name: "متر مكعب", symbol: "م³", rateToBase: 1000 },
    ],
    presets: [
      { label: "1 جالون أمريكي إلى لتر", val: 1, from: "gal", to: "L" },
      { label: "2 لتر إلى أكواب", val: 2, from: "L", to: "cup" },
      { label: "1 متر مكعب إلى لتر", val: 1, from: "m3", to: "L" },
      { label: "500 مل إلى لتر", val: 500, from: "mL", to: "L" },
    ],
  },
};

/* ─── Temperature Converter Helpers ───────────────────────────────────────── */
function convertTemp(val, from, to) {
  let c;
  if (from === "C") c = val;
  else if (from === "F") c = ((val - 32) * 5) / 9;
  else if (from === "K") c = val - 273.15;

  if (to === "C") return c;
  if (to === "F") return (c * 9) / 5 + 32;
  if (to === "K") return c + 273.15;
  return c;
}

const TEMP_FORMULAS = {
  "C>F": "°F = °C × 9/5 + 32",
  "C>K": "K = °C + 273.15",
  "F>C": "°C = (°F − 32) × 5/9",
  "F>K": "K = (°F − 32) × 5/9 + 273.15",
  "K>C": "°C = K − 273.15",
  "K>F": "°F = (K − 273.15) × 9/5 + 32",
};

/* ─── Number formatting ───────────────────────────────────────────────────── */
const AR = "ar-EG";
function formatValue(n) {
  if (typeof n !== "number" || !isFinite(n)) return "—";
  if (n === 0) return (0).toLocaleString(AR);
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 1e-4) return n.toExponential(4).replace(/\.?0+e/, "e");
  return Number(n.toFixed(4)).toLocaleString(AR, { maximumFractionDigits: 4 });
}

/* ─── Icons (SVG) ─────────────────────────────────────────────────────────── */
const ICONS = {
  swap: (
    <>
      <path d="M4 8h14l-3.5-3.5" />
      <path d="M20 16H6l3.5 3.5" />
    </>
  ),
  ruler: (
    <>
      <path d="M3 17 17 3l4 4L7 21z" />
      <path d="m7 13 2 2M10 10l2 2M13 7l2 2" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18M6 21h12M5 7h14" />
      <path d="m5 7-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z" />
    </>
  ),
  thermo: <path d="M14 14.76V4a2 2 0 0 0-4 0v10.76a4 4 0 1 0 4 0z" />,
  area: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M4 12h16M12 4v16" />
    </>
  ),
  flask: <path d="M9 3h6M10 3v6L4.6 18.6A2 2 0 0 0 6.4 21.5h11.2a2 2 0 0 0 1.8-2.9L14 9V3M7.5 15h9" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  print: (
    <>
      <path d="M7 9V3h10v6" />
      <path d="M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="7" y="14" width="10" height="7" rx="1" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5v.01" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  formula: (
    <>
      <path d="M5 5h9M5 19h9" />
      <path d="m14 5-5 7 5 7" />
      <path d="M17 10h4M17 14h4" />
    </>
  ),
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
function UnitConverterStyles() {
  return (
    <style>{`
      .uv-root{
        --uv-bg:var(--bg,#F5F5F2);
        --uv-surface:var(--surface,#FFFFFF);
        --uv-surface-2:var(--surface-2,#ECECE7);
        --uv-border:var(--border,#D4D4CE);
        --uv-text:var(--text,#0D0D0D);
        --uv-text-2:var(--text-2,#555555);
        --uv-muted:var(--muted,#6B6B66);
        --uv-ink:#0D0D0D;
        --uv-ink-text:#F5F5F2;
        --uv-orange:var(--orange,#FF5B04);
        --uv-on-orange:#0D0D0D;
        --uv-gloss:linear-gradient(180deg,#FF8A3D 0%,#FF5B04 52%,#E64F00 100%);
        --uv-gloss-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 0 rgba(0,0,0,.12),0 10px 22px -10px rgba(255,91,4,.65);
        --uv-ring:color-mix(in srgb,var(--uv-orange) 22%,transparent);
      }
      @media (prefers-color-scheme:dark){
        :root:not([data-theme="light"]) .uv-root{
          --uv-bg:var(--bg,#0D0D0D);
          --uv-surface:var(--surface,#161616);
          --uv-surface-2:var(--surface-2,#1D1D1D);
          --uv-border:var(--border,#2A2A2A);
          --uv-text:var(--text,#F5F5F2);
          --uv-text-2:var(--text-2,#B5B5B0);
          --uv-muted:var(--muted,#8E8E89);
        }
      }
      :root[data-theme="dark"] .uv-root{
        --uv-bg:var(--bg,#0D0D0D);
        --uv-surface:var(--surface,#161616);
        --uv-surface-2:var(--surface-2,#1D1D1D);
        --uv-border:var(--border,#2A2A2A);
        --uv-text:var(--text,#F5F5F2);
        --uv-text-2:var(--text-2,#B5B5B0);
        --uv-muted:var(--muted,#8E8E89);
      }

      .uv-root{
        color:var(--uv-text);
        max-width:1080px;
        margin:0 auto;
        padding:clamp(16px,4vw,40px) clamp(14px,4vw,24px) 48px;
        line-height:1.6;
      }
      .uv-root *,.uv-root *::before,.uv-root *::after{box-sizing:border-box}
      .uv-root :focus-visible{outline:2px solid var(--uv-orange);outline-offset:3px}
      .uv-root button{font:inherit}

      /* Header */
      .uv-head{display:grid;justify-items:center;gap:12px;text-align:center;margin-bottom:24px}
      .uv-badge{
        display:inline-flex;align-items:center;gap:8px;
        padding-block:5px;padding-inline:6px 14px;border-radius:999px;
        background:var(--uv-gloss);color:var(--uv-on-orange);
        font-size:.8125rem;font-weight:800;box-shadow:var(--uv-gloss-shadow);
      }
      .uv-badge-ico{
        width:26px;height:26px;border-radius:999px;flex:none;
        display:grid;place-items:center;background:var(--uv-ink);color:var(--uv-orange);
      }
      .uv-h1{margin:0;font-size:clamp(1.5rem,5.2vw,2.5rem);line-height:1.3;font-weight:800;text-wrap:balance}
      .uv-sub{margin:0;max-width:40rem;color:var(--uv-text-2);font-size:clamp(.875rem,2.4vw,1rem);line-height:1.8;text-wrap:balance}

      /* Category tabs */
      .uv-tabs{
        display:flex;gap:8px;margin-bottom:16px;padding:4px 2px 8px;
        overflow-x:auto;scroll-snap-type:x proximity;scrollbar-width:none;-webkit-overflow-scrolling:touch;
      }
      .uv-tabs::-webkit-scrollbar{display:none}
      .uv-tab{
        flex:none;scroll-snap-align:center;display:inline-flex;align-items:center;gap:8px;
        min-height:46px;padding:0 16px;border-radius:16px;cursor:pointer;
        border:1px solid var(--uv-border);background:var(--uv-surface);color:var(--uv-text);
        font-size:.875rem;font-weight:700;transition:border-color .2s,box-shadow .2s,transform .2s;
      }
      .uv-tab:active{transform:scale(.97)}
      .uv-tab.is-on{background:var(--uv-gloss);border-color:transparent;color:var(--uv-on-orange);box-shadow:var(--uv-gloss-shadow)}
      @media (hover:hover){.uv-tab:not(.is-on):hover{border-color:var(--uv-orange);box-shadow:0 0 0 4px var(--uv-ring)}}
      @media (min-width:720px){.uv-tabs{flex-wrap:wrap;justify-content:center;overflow:visible}}

      /* Cards */
      .uv-card{
        background:var(--uv-surface);border:1px solid var(--uv-border);border-radius:26px;
        padding:clamp(16px,3.5vw,24px);min-width:0;transition:border-color .2s,box-shadow .2s;
      }
      @media (hover:hover){
        .uv-card:hover{border-color:color-mix(in srgb,var(--uv-orange) 55%,var(--uv-border));box-shadow:0 0 0 4px var(--uv-ring)}
      }
      .uv-title{display:flex;align-items:center;gap:10px;margin:0 0 16px;font-size:1rem;line-height:1.5;font-weight:800}
      .uv-title > span:last-child{min-width:0}
      .uv-tile{
        width:36px;height:36px;border-radius:12px;flex:none;display:grid;place-items:center;
        background:var(--uv-gloss);color:var(--uv-on-orange);box-shadow:var(--uv-gloss-shadow);
      }

      /* Presets */
      .uv-presets{
        margin-bottom:16px;padding:14px;border-radius:22px;
        background:var(--uv-surface-2);border:1px solid var(--uv-border);
      }
      .uv-presets-label{display:flex;align-items:center;gap:6px;margin:0 0 10px;font-size:.8125rem;font-weight:700;color:var(--uv-muted)}
      .uv-chips{display:flex;flex-wrap:wrap;gap:8px}
      .uv-chip{
        min-height:40px;padding:0 14px;border-radius:14px;cursor:pointer;
        border:1px solid var(--uv-border);background:var(--uv-surface);color:var(--uv-text);
        font-size:.8125rem;font-weight:600;transition:border-color .2s,box-shadow .2s,transform .2s;
      }
      .uv-chip:active{transform:scale(.97)}
      .uv-chip.is-on{border-color:var(--uv-orange);background:color-mix(in srgb,var(--uv-orange) 12%,var(--uv-surface));font-weight:800}
      @media (hover:hover){.uv-chip:hover{border-color:var(--uv-orange)}}

      /* Layout */
      .uv-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:16px}
      .uv-conv{order:1}
      .uv-aside{order:2;display:grid;gap:16px;align-content:start;min-width:0}
      .uv-matrix{order:3}
      @media (min-width:960px){
        .uv-grid{grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:20px;align-items:start}
        .uv-conv{grid-column:1;grid-row:1}
        .uv-matrix{grid-column:1;grid-row:2}
        .uv-aside{grid-column:2;grid-row:1 / span 2;position:sticky;top:16px}
      }

      /* Fields */
      .uv-field{display:grid;gap:6px;min-width:0}
      .uv-label{font-size:.8125rem;font-weight:700;color:var(--uv-text-2)}
      .uv-input,.uv-select{
        width:100%;min-height:52px;padding:0 16px;border-radius:16px;
        border:1px solid var(--uv-border);background:var(--uv-surface-2);color:var(--uv-text);
        font:inherit;font-size:1rem;font-weight:700;
        transition:border-color .2s,background .2s,box-shadow .2s;
      }
      .uv-input:focus,.uv-select:focus{
        outline:none;background:var(--uv-surface);border-color:var(--uv-orange);box-shadow:0 0 0 4px var(--uv-ring);
      }
      .uv-input-big{
        min-height:64px;font-size:clamp(1.25rem,5vw,1.625rem);font-weight:800;
        font-variant-numeric:tabular-nums;text-align:start;
        -moz-appearance:textfield;appearance:textfield;
      }
      .uv-input-big::-webkit-outer-spin-button,.uv-input-big::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
      .uv-select-wrap{position:relative}
      .uv-select{appearance:none;-webkit-appearance:none;padding-inline-start:44px;text-overflow:ellipsis;cursor:pointer}
      .uv-select option{background:var(--uv-surface);color:var(--uv-text)}
      .uv-chev{position:absolute;inset-inline-start:14px;top:50%;transform:translateY(-50%);color:var(--uv-muted);pointer-events:none;display:grid}

      .uv-units{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;margin-top:16px}
      .uv-swap{
        --uv-r:90deg;justify-self:center;width:48px;height:48px;border:0;border-radius:999px;cursor:pointer;
        display:grid;place-items:center;background:var(--uv-gloss);color:var(--uv-on-orange);box-shadow:var(--uv-gloss-shadow);
        transition:transform .2s;
      }
      .uv-swap svg{transform:rotate(var(--uv-r));transition:transform .35s}
      .uv-swap:active{transform:scale(.94)}
      .uv-swap:active svg{transform:rotate(calc(var(--uv-r) + 180deg))}
      @media (min-width:600px){
        .uv-units{grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:end}
        .uv-swap{--uv-r:0deg;margin-bottom:2px}
      }

      .uv-note{
        display:flex;gap:10px;align-items:flex-start;margin-top:14px;padding:12px 14px;border-radius:16px;
        background:color-mix(in srgb,var(--uv-orange) 10%,var(--uv-surface));
        border:1px solid color-mix(in srgb,var(--uv-orange) 35%,var(--uv-border));
        font-size:.8125rem;line-height:1.7;
      }
      .uv-note svg{flex:none;margin-top:3px;color:var(--uv-orange)}

      /* Matrix */
      .uv-tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      @media (min-width:560px){.uv-tiles{grid-template-columns:repeat(3,minmax(0,1fr))}}
      .uv-tilebtn{
        position:relative;display:grid;gap:4px;align-content:start;min-width:0;min-height:84px;
        padding:12px 14px;border-radius:16px;text-align:start;cursor:pointer;
        border:1px solid var(--uv-border);background:var(--uv-surface-2);color:var(--uv-text);
        transition:border-color .2s,box-shadow .2s,transform .2s;
      }
      .uv-tilebtn:active{transform:scale(.98)}
      @media (hover:hover){.uv-tilebtn:hover{border-color:var(--uv-orange)}}
      .uv-tilebtn.is-from{border-color:var(--uv-orange);background:color-mix(in srgb,var(--uv-orange) 10%,var(--uv-surface))}
      .uv-tilebtn.is-to{border-color:transparent;background:var(--uv-gloss);color:var(--uv-on-orange);box-shadow:var(--uv-gloss-shadow)}
      .uv-tags{display:flex;gap:4px;flex-wrap:wrap;min-height:18px}
      .uv-tag{
        padding:1px 8px;border-radius:999px;font-size:.6875rem;font-weight:800;line-height:1.6;
        background:var(--uv-ink);color:var(--uv-ink-text);
      }
      .uv-tilebtn.is-from:not(.is-to) .uv-tag{background:var(--uv-orange);color:var(--uv-on-orange)}
      .uv-tname{font-size:.75rem;line-height:1.5;color:var(--uv-muted);overflow-wrap:anywhere}
      .uv-tilebtn.is-to .uv-tname{color:rgba(13,13,13,.75)}
      .uv-tval{
        font-size:clamp(.95rem,3.4vw,1.125rem);font-weight:800;line-height:1.4;
        font-variant-numeric:tabular-nums;overflow-wrap:anywhere;unicode-bidi:plaintext;
      }

      /* Result panel */
      .uv-result{
        position:relative;overflow:hidden;border-radius:26px;padding:clamp(18px,4vw,28px);
        display:grid;gap:14px;background:var(--uv-gloss);color:var(--uv-on-orange);
        box-shadow:0 18px 40px -18px rgba(255,91,4,.6),inset 0 1px 0 rgba(255,255,255,.5);
      }
      .uv-result::before{
        content:"";position:absolute;inset:0 0 55% 0;pointer-events:none;
        background:linear-gradient(180deg,rgba(255,255,255,.3),rgba(255,255,255,0));
      }
      .uv-result::after{
        content:"";position:absolute;inset-inline-end:-54px;top:-54px;width:170px;height:170px;
        border:30px solid rgba(13,13,13,.07);border-radius:999px;pointer-events:none;
      }
      .uv-result > *{position:relative;z-index:1}
      .uv-rtop{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .uv-rlabel{font-size:.8125rem;font-weight:800}
      .uv-symbol{
        padding:3px 12px;border-radius:999px;background:var(--uv-ink);color:var(--uv-ink-text);
        font-size:.75rem;font-weight:800;max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
      }
      .uv-rfrom{margin:0;font-size:.8125rem;font-weight:600;opacity:.85;overflow-wrap:anywhere}
      .uv-rvalue{
        margin:0;font-size:clamp(1.9rem,7vw,2.75rem);font-weight:800;line-height:1.15;letter-spacing:-.01em;
        font-variant-numeric:tabular-nums;overflow-wrap:anywhere;unicode-bidi:plaintext;
        animation:uv-pop .28s ease-out;
      }
      .uv-runit{display:block;margin-top:4px;font-size:1.0625rem;font-weight:700;letter-spacing:0}
      @keyframes uv-pop{from{opacity:.35;transform:translateY(4px)}to{opacity:1;transform:none}}
      .uv-actions{display:flex;flex-wrap:wrap;gap:8px;padding-top:4px}
      .uv-btn{
        flex:1 1 120px;min-height:48px;display:inline-flex;align-items:center;justify-content:center;gap:8px;
        padding:0 16px;border-radius:16px;border:0;cursor:pointer;font-size:.875rem;font-weight:800;
        transition:transform .2s,background .2s;
      }
      .uv-btn:active{transform:scale(.97)}
      .uv-btn-ink{background:var(--uv-ink);color:var(--uv-ink-text)}
      .uv-btn-soft{background:rgba(13,13,13,.12);color:var(--uv-on-orange)}
      @media (hover:hover){.uv-btn-soft:hover{background:rgba(13,13,13,.2)}}

      /* Formula */
      .uv-formula{display:grid;gap:8px;padding:14px;border-radius:16px;background:var(--uv-surface-2);font-size:.8125rem;line-height:1.8;color:var(--uv-text-2)}
      .uv-formula strong{color:var(--uv-text);font-size:.9375rem;font-weight:800;overflow-wrap:anywhere}
      .uv-code{
        display:block;padding:8px 12px;border-radius:12px;background:var(--uv-surface);border:1px solid var(--uv-border);
        color:var(--uv-text);font-weight:700;direction:ltr;text-align:left;overflow-x:auto;
      }
      .uv-foot{
        display:flex;gap:8px;align-items:flex-start;justify-content:center;margin:24px auto 0;max-width:42rem;
        text-align:center;font-size:.75rem;line-height:1.8;color:var(--uv-muted);
      }
      .uv-foot svg{flex:none;margin-top:4px}
      .uv-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

      @media (prefers-reduced-motion:reduce){
        .uv-root *,.uv-root *::before,.uv-root *::after{transition:none!important;animation:none!important}
      }

      @media print{
        .uv-root{padding:0;max-width:none}
        .uv-noprint{display:none!important}
        .uv-grid{display:block}
        .uv-aside{position:static}
        .uv-result{background:#fff!important;color:#000!important;border:1.5px solid #000;box-shadow:none!important}
        .uv-result::before,.uv-result::after{display:none}
        .uv-symbol{background:#000!important;color:#fff!important}
      }
    `}</style>
  );
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function UnitConverter() {
  const uid = useId();
  const [activeCategory, setActiveCategory] = useState("length");
  const [inputValue, setInputValue] = useState(1);
  const [fromUnit, setFromUnit] = useState("km");
  const [toUnit, setToUnit] = useState("mi");
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  const category = UNIT_CATEGORIES[activeCategory];

  // Handle switching category
  const handleSelectCategory = (catKey) => {
    setActiveCategory(catKey);
    const cat = UNIT_CATEGORIES[catKey];
    setFromUnit(cat.units[0].id);
    setToUnit(cat.units[1].id);
    setInputValue(1);
  };

  // Swap units
  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  // Convert single pair
  const conversionResult = useMemo(() => {
    const val = Number(inputValue);
    if (isNaN(val)) return 0;

    if (category.isTemp) {
      return convertTemp(val, fromUnit, toUnit);
    }

    const uFrom = category.units.find((u) => u.id === fromUnit);
    const uTo = category.units.find((u) => u.id === toUnit);
    if (!uFrom || !uTo) return 0;

    const baseVal = val * uFrom.rateToBase;
    return baseVal / uTo.rateToBase;
  }, [category, inputValue, fromUnit, toUnit]);

  // Convert to ALL units in category for matrix overview
  const allConversions = useMemo(() => {
    const val = Number(inputValue);
    if (isNaN(val)) return [];

    return category.units.map((u) => {
      let res;
      if (category.isTemp) {
        res = convertTemp(val, fromUnit, u.id);
      } else {
        const uFrom = category.units.find((item) => item.id === fromUnit);
        const baseVal = val * (uFrom?.rateToBase || 1);
        res = baseVal / u.rateToBase;
      }
      return { unit: u, value: formatValue(res) };
    });
  }, [category, inputValue, fromUnit]);

  const handleApplyPreset = (p) => {
    setFromUnit(p.from);
    setToUnit(p.to);
    setInputValue(p.val);
  };

  const uFromObj = category.units.find((u) => u.id === fromUnit);
  const uToObj = category.units.find((u) => u.id === toUnit);
  const shownInput = inputValue === "" ? 0 : inputValue;
  const resultText = formatValue(conversionResult);

  const handleCopy = async () => {
    const text = `نتيجة تحويل الوحدات:
${shownInput} ${uFromObj?.name} = ${resultText} ${uToObj?.name}

تم التحويل عبر محول الوحدات الشامل | الأدوات العربية`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        return;
      }
    }
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2500);
  };

  // Formula info
  const factor = category.isTemp
    ? null
    : (uFromObj?.rateToBase || 1) / (uToObj?.rateToBase || 1);
  const tempFormula = category.isTemp
    ? fromUnit === toUnit
      ? null
      : TEMP_FORMULAS[`${fromUnit}>${toUnit}`]
    : null;

  // Regional notes for the selected units (area / volume)
  const notes = [uFromObj, uToObj]
    .filter((u, i, arr) => u?.note && arr.findIndex((x) => x?.id === u.id) === i)
    .map((u) => u.note);

  return (
    <div className="uv-root" dir="rtl">
      <UnitConverterStyles />

      {/* Header */}
      <header className="uv-head">
        <div className="uv-badge">
          <span className="uv-badge-ico" aria-hidden="true">
            <Icon name="bolt" size={14} />
          </span>
          <span>محول القياسات والوحدات الفيزيائية</span>
        </div>
        <h1 className="uv-h1">محول الوحدات الشامل (الطول، الوزن، الحرارة، المساحة)</h1>
        <p className="uv-sub">
          حوّل بدقة بين جميع أنظمة القياس العالمية (المترية والإمبراطورية الأمريكية) مع جدول تحويل فوري لكافة الوحدات.
        </p>
      </header>

      {/* Category Tabs */}
      <div className="uv-tabs uv-noprint" role="group" aria-label="فئة الوحدات">
        {Object.values(UNIT_CATEGORIES).map((cat) => (
          <button
            key={cat.id}
            type="button"
            aria-pressed={activeCategory === cat.id}
            onClick={() => handleSelectCategory(cat.id)}
            className={`uv-tab${activeCategory === cat.id ? " is-on" : ""}`}
          >
            <Icon name={cat.icon} size={18} />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Quick Presets */}
      <section className="uv-presets uv-noprint" aria-label="تحويلات سريعة">
        <p className="uv-presets-label">
          <Icon name="bolt" size={14} />
          <span>تحويلات شائعة وسريعة</span>
        </p>
        <div className="uv-chips">
          {category.presets.map((p) => {
            const on =
              p.from === fromUnit && p.to === toUnit && String(p.val) === String(inputValue);
            return (
              <button
                key={p.label}
                type="button"
                aria-pressed={on}
                onClick={() => handleApplyPreset(p)}
                className={`uv-chip${on ? " is-on" : ""}`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="uv-grid">
        {/* Interactive Converter Box */}
        <section className="uv-card uv-conv uv-noprint">
          <h2 className="uv-title">
            <span className="uv-tile" aria-hidden="true">
              <Icon name="swap" />
            </span>
            <span>تحويل فوري بين وحدتين</span>
          </h2>

          <div className="uv-field">
            <label className="uv-label" htmlFor={`${uid}-value`}>
              القيمة المراد تحويلها
            </label>
            <input
              id={`${uid}-value`}
              type="number"
              inputMode="decimal"
              step="any"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="uv-input uv-input-big"
            />
          </div>

          <div className="uv-units">
            <div className="uv-field">
              <label className="uv-label" htmlFor={`${uid}-from`}>
                من وحدة
              </label>
              <div className="uv-select-wrap">
                <select
                  id={`${uid}-from`}
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="uv-select"
                >
                  {category.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
                <span className="uv-chev" aria-hidden="true">
                  <Icon name="chevron" size={18} />
                </span>
              </div>
            </div>

            <button type="button" onClick={handleSwap} className="uv-swap" aria-label="تبديل الوحدتين">
              <Icon name="swap" size={22} />
            </button>

            <div className="uv-field">
              <label className="uv-label" htmlFor={`${uid}-to`}>
                إلى وحدة
              </label>
              <div className="uv-select-wrap">
                <select
                  id={`${uid}-to`}
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="uv-select"
                >
                  {category.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
                <span className="uv-chev" aria-hidden="true">
                  <Icon name="chevron" size={18} />
                </span>
              </div>
            </div>
          </div>

          {notes.map((n) => (
            <div key={n} className="uv-note" role="note">
              <Icon name="info" size={16} />
              <span>{n}</span>
            </div>
          ))}
        </section>

        {/* Results + formula */}
        <aside className="uv-aside" aria-label="النتيجة">
          <div className="uv-result">
            <div className="uv-rtop">
              <span className="uv-rlabel">النتيجة المحولة</span>
              <span className="uv-symbol">{uToObj?.symbol}</span>
            </div>

            <p className="uv-rfrom">
              {shownInput} {uFromObj?.name} تعادل:
            </p>

            <p className="uv-rvalue" key={`${resultText}-${toUnit}`}>
              {resultText}
              <span className="uv-runit">{uToObj?.name}</span>
            </p>

            <div className="uv-actions uv-noprint">
              <button type="button" onClick={handleCopy} className="uv-btn uv-btn-ink" aria-live="polite">
                <Icon name={copied ? "check" : "copy"} size={18} />
                <span>{copied ? "تم نسخ النتيجة" : "نسخ النتيجة"}</span>
              </button>
              <button type="button" onClick={() => window.print()} className="uv-btn uv-btn-soft">
                <Icon name="print" size={18} />
                <span>طباعة</span>
              </button>
            </div>
          </div>

          <div className="uv-card uv-noprint">
            <h3 className="uv-title">
              <span className="uv-tile" aria-hidden="true">
                <Icon name="formula" />
              </span>
              <span>معادلة وقاعدة التحويل</span>
            </h3>

            <div className="uv-formula">
              {category.isTemp ? (
                <>
                  <strong>
                    1 {uFromObj?.name} = {formatValue(convertTemp(1, fromUnit, toUnit))} {uToObj?.name}
                  </strong>
                  {tempFormula ? (
                    <>
                      <span>الحرارة لا تُحوَّل بالضرب في معامل ثابت، بل بهذه المعادلة:</span>
                      <code className="uv-code">{tempFormula}</code>
                    </>
                  ) : (
                    <span>الوحدتان متطابقتان، فلا يلزم أي تحويل.</span>
                  )}
                </>
              ) : (
                <>
                  <strong>
                    1 {uFromObj?.name} = {formatValue(factor)} {uToObj?.name}
                  </strong>
                  <span>
                    للتحويل من {uFromObj?.name} إلى {uToObj?.name}، اضرب القيمة في معامل التحويل القياسي
                    المعتمد في النظام الدولي للوحدات (SI).
                  </span>
                  <code className="uv-code">
                    {"result = value × "}
                    {Number(factor.toPrecision(8))}
                  </code>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Complete Category Conversion Grid (Matrix) */}
        <section className="uv-card uv-matrix uv-noprint">
          <h3 className="uv-title">
            <span className="uv-tile" aria-hidden="true">
              <Icon name="grid" />
            </span>
            <span>
              المقابل في جميع وحدات {category.name} لـ ({shownInput} {uFromObj?.name})
            </span>
          </h3>

          <div className="uv-tiles">
            {allConversions.map((item) => {
              const isFrom = item.unit.id === fromUnit;
              const isTo = item.unit.id === toUnit;
              return (
                <button
                  key={item.unit.id}
                  type="button"
                  aria-pressed={isTo}
                  onClick={() => setToUnit(item.unit.id)}
                  className={`uv-tilebtn${isFrom ? " is-from" : ""}${isTo ? " is-to" : ""}`}
                >
                  <span className="uv-tags">
                    {isFrom && <span className="uv-tag">من</span>}
                    {isTo && <span className="uv-tag">إلى</span>}
                  </span>
                  <span className="uv-tname">
                    {item.unit.name} ({item.unit.symbol})
                  </span>
                  <span className="uv-tval">{item.value}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <p className="uv-foot uv-noprint">
        <Icon name="info" size={14} />
        <span>
          يعتمد المحول على المعايير الفيزيائية الرسمية للنظام الدولي للوحدات (SI) والمكتب الدولي للأوزان والمقاييس (BIPM).
        </span>
      </p>
    </div>
  );
}