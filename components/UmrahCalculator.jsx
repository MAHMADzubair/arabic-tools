"use client";

/**
 * components/UmrahCalculator.jsx
 * Qemlo tool style: glossy orange + ink, SVG icons, 26px cards, 16px controls,
 * light/dark, mobile-first. Data tables, multipliers and the cost formula are
 * unchanged; only presentation and component structure were improved.
 */

import { useState, useMemo, useId } from "react";

const COUNTRIES = [
  { id: "pk", name: "باكستان", currency: "PKR", symbol: "₨", flight: 85000, visa: 15000, dailyFood: 2500, transport: 1200, shopping: 20000 },
  { id: "eg", name: "مصر", currency: "EGP", symbol: "£", flight: 12000, visa: 3000, dailyFood: 450, transport: 200, shopping: 4000 },
  { id: "sa", name: "المملكة العربية السعودية", currency: "SAR", symbol: "ر.س", flight: 800, visa: 0, dailyFood: 120, transport: 60, shopping: 1000 },
  { id: "ae", name: "الإمارات العربية المتحدة", currency: "AED", symbol: "د.إ", flight: 1800, visa: 320, dailyFood: 300, transport: 120, shopping: 2000 },
  { id: "gb", name: "المملكة المتحدة", currency: "GBP", symbol: "£", flight: 650, visa: 150, dailyFood: 80, transport: 35, shopping: 400 },
  { id: "us", name: "الولايات المتحدة الأمريكية", currency: "USD", symbol: "$", flight: 1100, visa: 150, dailyFood: 100, transport: 40, shopping: 500 },
  { id: "my", name: "ماليزيا", currency: "MYR", symbol: "RM", flight: 3800, visa: 600, dailyFood: 350, transport: 150, shopping: 2000 },
  { id: "bd", name: "بنغلاديش", currency: "BDT", symbol: "৳", flight: 55000, visa: 15000, dailyFood: 2000, transport: 800, shopping: 15000 },
];

const SEASONS = [
  { id: "regular", name: "العادي (الموسم العادي)", flightMult: 1, hotelMult: 1 },
  { id: "ramadan", name: "رمضان", flightMult: 2.2, hotelMult: 3.5 },
  { id: "dhul_hijja", name: "ذو الحجة (العطلة الأخيرة)", flightMult: 1.6, hotelMult: 2.2 },
  { id: "last_10", name: "آخر 10 أيام (الموسم الأخير)", flightMult: 3.0, hotelMult: 5.0 },
];

const HOTELS = [
  { id: "budget", name: "فندق اقتصادي / 2 نجوم", sarPerNight: 150, desc: "فندق بأسعار معقولة ومرافق بسيطة", stars: 2 },
  { id: "3star", name: "فندق 3 نجوم", sarPerNight: 350, desc: "فندق متوسط المستوى مع خدمات جيدة", stars: 3 },
  { id: "4star", name: "فندق 4 نجوم", sarPerNight: 750, desc: "فندق فاخر مع مرافق متميزة", stars: 4 },
  { id: "5star", name: "فندق 5 نجوم", sarPerNight: 1800, desc: "فندق خمس نجوم مع أفضل الخدمات", stars: 5 },
];

const MEAL_PLANS = [
  { id: "self", name: "بدون وجبات", mult: 1 },
  { id: "half", name: "نصف إقامة", mult: 1.5 },
  { id: "full", name: "إقامة كاملة", mult: 2.0 },
];

const FLIGHT_CLASSES = [
  { id: "economy", name: "اقتصادية" },
  { id: "business", name: "أعمال (×3.5)" },
];

const SAR_TO = { pk: 75, eg: 13, sa: 1, ae: 3.6725 / 3.75, gb: 0.21, us: 0.27, my: 1.26, bd: 32 };

function fmt(num, symbol) {
  return `${symbol} ${Math.round(num).toLocaleString("ar-EG")}`;
}

/* ─── Icons (SVG) ─────────────────────────────────────────────────────────── */
const ICONS = {
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.4c1.8.8 3 2.7 3 5.6" />
    </>
  ),
  hotel: <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M2 21h20M8 7h4M8 11h4M8 15h4" />,
  plane: (
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  ),
  utensils: (
    <>
      <path d="M6 3v7a2 2 0 0 0 2 2v9M10 3v7a2 2 0 0 1-2 2M8 3v7" />
      <path d="M17 21V3c-2.5 1.5-4 4.5-4 8 0 1.5 1 2.5 2.5 2.5H17" />
    </>
  ),
  bus: (
    <>
      <rect x="4" y="3" width="16" height="14" rx="3" />
      <path d="M4 11h16M8 21v-4M16 21v-4M8 14h.01M16 14h.01" />
    </>
  ),
  id: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 16c.6-1.6 1.7-2.3 3-2.3s2.4.7 3 2.3M15 10h3M15 14h3" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.5 11.5h10.5L21 7H6" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5v.01" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2.5 20h19z" />
      <path d="M12 10v4.5M12 17.5v.01" />
    </>
  ),
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="currentColor" />,
  arrow: <path d="M12 5v14m0 0 5-5m-5 5-5-5" />,
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
function UmrahStyles() {
  return (
    <style>{`
      .uc-root{
        --uc-bg:var(--bg,#F5F5F2);
        --uc-surface:var(--surface,#FFFFFF);
        --uc-surface-2:var(--surface-2,#ECECE7);
        --uc-border:var(--border,#D4D4CE);
        --uc-text:var(--text,#0D0D0D);
        --uc-text-2:var(--text-2,#555555);
        --uc-muted:var(--muted,#6B6B66);
        --uc-ink:#0D0D0D;
        --uc-ink-text:#F5F5F2;
        --uc-orange:var(--orange,#FF5B04);
        --uc-on-orange:#0D0D0D;
        --uc-warning:#8A5A00;
        --uc-gloss:linear-gradient(180deg,#FF8A3D 0%,#FF5B04 52%,#E64F00 100%);
        --uc-gloss-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 0 rgba(0,0,0,.12),0 10px 22px -10px rgba(255,91,4,.65);
        --uc-ring:color-mix(in srgb,var(--uc-orange) 22%,transparent);
      }
      @media (prefers-color-scheme:dark){
        :root:not([data-theme="light"]) .uc-root{
          --uc-bg:var(--bg,#0D0D0D);
          --uc-surface:var(--surface,#161616);
          --uc-surface-2:var(--surface-2,#1D1D1D);
          --uc-border:var(--border,#2A2A2A);
          --uc-text:var(--text,#F5F5F2);
          --uc-text-2:var(--text-2,#B5B5B0);
          --uc-muted:var(--muted,#8E8E89);
          --uc-warning:#FBBF24;
        }
      }
      :root[data-theme="dark"] .uc-root{
        --uc-bg:var(--bg,#0D0D0D);
        --uc-surface:var(--surface,#161616);
        --uc-surface-2:var(--surface-2,#1D1D1D);
        --uc-border:var(--border,#2A2A2A);
        --uc-text:var(--text,#F5F5F2);
        --uc-text-2:var(--text-2,#B5B5B0);
        --uc-muted:var(--muted,#8E8E89);
        --uc-warning:#FBBF24;
      }

      .uc-root{
        color:var(--uc-text);max-width:1080px;margin:0 auto;line-height:1.6;
        padding:clamp(16px,4vw,40px) clamp(14px,4vw,24px) 48px;
      }
      .uc-root *,.uc-root *::before,.uc-root *::after{box-sizing:border-box}
      .uc-root :focus-visible{outline:2px solid var(--uc-orange);outline-offset:3px}
      .uc-root button{font:inherit}

      /* Header */
      .uc-head{display:grid;justify-items:center;gap:12px;text-align:center;margin-bottom:24px}
      .uc-badge{
        display:inline-flex;align-items:center;gap:8px;padding-block:5px;padding-inline:6px 14px;border-radius:999px;
        background:var(--uc-gloss);color:var(--uc-on-orange);font-size:.8125rem;font-weight:800;box-shadow:var(--uc-gloss-shadow);
      }
      .uc-badge-ico{width:26px;height:26px;border-radius:999px;flex:none;display:grid;place-items:center;background:var(--uc-ink);color:var(--uc-orange)}
      .uc-h1{margin:0;font-size:clamp(1.5rem,5.2vw,2.5rem);line-height:1.3;font-weight:800;text-wrap:balance}
      .uc-sub{margin:0;max-width:38rem;color:var(--uc-text-2);font-size:clamp(.875rem,2.4vw,1rem);line-height:1.8;text-wrap:balance}

      /* Layout */
      .uc-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:16px}
      .uc-form{display:grid;gap:16px;min-width:0;align-content:start}
      .uc-aside{display:grid;gap:16px;min-width:0;align-content:start}
      @media (min-width:960px){
        .uc-grid{grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:20px;align-items:start}
        .uc-aside{position:sticky;top:16px}
      }
      .uc-two{display:grid;grid-template-columns:minmax(0,1fr);gap:16px}
      @media (min-width:600px){.uc-two{grid-template-columns:repeat(2,minmax(0,1fr))}}

      /* Cards */
      .uc-card{
        background:var(--uc-surface);border:1px solid var(--uc-border);border-radius:26px;
        padding:clamp(16px,3.5vw,24px);min-width:0;transition:border-color .2s,box-shadow .2s;
      }
      @media (hover:hover){
        .uc-card:hover{border-color:color-mix(in srgb,var(--uc-orange) 55%,var(--uc-border));box-shadow:0 0 0 4px var(--uc-ring)}
      }
      .uc-title{display:flex;align-items:center;gap:10px;margin:0 0 16px;font-size:1rem;line-height:1.5;font-weight:800}
      .uc-tile{
        width:36px;height:36px;border-radius:12px;flex:none;display:grid;place-items:center;
        background:var(--uc-gloss);color:var(--uc-on-orange);box-shadow:var(--uc-gloss-shadow);
      }

      /* Option cards */
      .uc-opts{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(var(--min,150px),1fr))}
      .uc-opt{
        position:relative;display:grid;gap:4px;align-content:start;min-width:0;min-height:64px;
        padding:12px 14px;border-radius:16px;text-align:start;cursor:pointer;
        border:1px solid var(--uc-border);background:var(--uc-surface-2);color:var(--uc-text);
        transition:border-color .2s,box-shadow .2s,transform .2s;
      }
      .uc-opt:active{transform:scale(.98)}
      @media (hover:hover){.uc-opt:not(.is-on):hover{border-color:var(--uc-orange);transform:translateY(-2px)}}
      .uc-opt.is-on{border-color:transparent;background:var(--uc-gloss);color:var(--uc-on-orange);box-shadow:var(--uc-gloss-shadow)}
      .uc-opt-top{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:22px}
      .uc-code{
        padding:1px 8px;border-radius:999px;font-size:.6875rem;font-weight:800;line-height:1.7;
        background:var(--uc-surface);color:var(--uc-text-2);border:1px solid var(--uc-border);
      }
      .uc-opt.is-on .uc-code{background:var(--uc-ink);color:var(--uc-ink-text);border-color:transparent}
      .uc-check{
        width:22px;height:22px;border-radius:999px;display:grid;place-items:center;flex:none;
        background:var(--uc-ink);color:var(--uc-orange);
      }
      .uc-opt-name{font-size:.875rem;font-weight:800;line-height:1.5;overflow-wrap:anywhere}
      .uc-opt-desc{font-size:.75rem;line-height:1.6;color:var(--uc-muted)}
      .uc-opt.is-on .uc-opt-desc{color:rgba(13,13,13,.75)}
      .uc-stars{display:inline-flex;gap:2px;color:var(--uc-orange)}
      .uc-opt.is-on .uc-stars{color:var(--uc-ink)}
      .uc-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}
      .uc-pill{
        padding:1px 8px;border-radius:999px;font-size:.6875rem;font-weight:700;line-height:1.7;
        background:var(--uc-surface);border:1px solid var(--uc-border);color:var(--uc-text-2);
      }
      .uc-opt.is-on .uc-pill{background:rgba(13,13,13,.14);border-color:transparent;color:var(--uc-on-orange)}

      /* Counters */
      .uc-counters{display:grid;gap:10px}
      .uc-cbox{
        display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;
        border-radius:16px;background:var(--uc-surface-2);border:1px solid var(--uc-border);
      }
      .uc-clabel{font-size:.8125rem;font-weight:700;color:var(--uc-text-2)}
      .uc-counter{display:inline-flex;align-items:center;gap:6px}
      .uc-cbtn{
        width:44px;height:44px;border-radius:14px;display:grid;place-items:center;cursor:pointer;
        border:1px solid var(--uc-border);background:var(--uc-surface);color:var(--uc-orange);
        transition:border-color .2s,transform .2s,opacity .2s;
      }
      .uc-cbtn:active{transform:scale(.92)}
      .uc-cbtn:disabled{opacity:.4;cursor:not-allowed}
      @media (hover:hover){.uc-cbtn:not(:disabled):hover{border-color:var(--uc-orange)}}
      .uc-cval{min-width:40px;text-align:center;font-size:1.25rem;font-weight:800;font-variant-numeric:tabular-nums}
      @media (min-width:640px){
        .uc-counters{grid-template-columns:repeat(3,minmax(0,1fr))}
        .uc-cbox{flex-direction:column;align-items:flex-start;gap:10px}
        .uc-counter{align-self:stretch;justify-content:space-between}
      }

      /* Toggle + input */
      .uc-row{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px}
      .uc-row-text{min-width:0}
      .uc-row-title{margin:0;font-size:.9375rem;font-weight:800}
      .uc-row-sub{margin:2px 0 0;font-size:.8125rem;color:var(--uc-muted);line-height:1.6}
      .uc-switch{
        position:relative;flex:none;width:56px;height:32px;border-radius:999px;cursor:pointer;
        border:1px solid var(--uc-border);background:var(--uc-surface-2);transition:background .2s,border-color .2s;
      }
      .uc-switch::after{
        content:"";position:absolute;top:3px;inset-inline-start:3px;width:24px;height:24px;border-radius:999px;
        background:var(--uc-text-2);transition:inset-inline-start .2s,background .2s;
      }
      .uc-switch[aria-checked="true"]{background:var(--uc-gloss);border-color:transparent;box-shadow:var(--uc-gloss-shadow)}
      .uc-switch[aria-checked="true"]::after{inset-inline-start:calc(100% - 27px);background:var(--uc-ink)}
      .uc-label{display:block;margin-bottom:6px;font-size:.8125rem;font-weight:700;color:var(--uc-text-2)}
      .uc-inwrap{position:relative}
      .uc-input{
        width:100%;min-height:52px;padding-block:0;padding-inline:16px 64px;border-radius:16px;
        border:1px solid var(--uc-border);background:var(--uc-surface-2);color:var(--uc-text);
        font:inherit;font-size:1.125rem;font-weight:800;font-variant-numeric:tabular-nums;text-align:start;
        transition:border-color .2s,background .2s,box-shadow .2s;
      }
      .uc-input:focus{outline:none;background:var(--uc-surface);border-color:var(--uc-orange);box-shadow:0 0 0 4px var(--uc-ring)}
      .uc-suffix{
        position:absolute;inset-inline-end:14px;top:50%;transform:translateY(-50%);pointer-events:none;
        font-size:.8125rem;font-weight:800;color:var(--uc-muted);
      }

      /* Result */
      .uc-result{
        position:relative;overflow:hidden;border-radius:26px;padding:clamp(18px,4vw,28px);
        display:grid;gap:10px;background:var(--uc-gloss);color:var(--uc-on-orange);
        box-shadow:0 18px 40px -18px rgba(255,91,4,.6),inset 0 1px 0 rgba(255,255,255,.5);scroll-margin-top:16px;
      }
      .uc-result::before{
        content:"";position:absolute;inset:0 0 55% 0;pointer-events:none;
        background:linear-gradient(180deg,rgba(255,255,255,.3),rgba(255,255,255,0));
      }
      .uc-result::after{
        content:"";position:absolute;inset-inline-end:-54px;top:-54px;width:170px;height:170px;
        border:30px solid rgba(13,13,13,.07);border-radius:999px;pointer-events:none;
      }
      .uc-result > *{position:relative;z-index:1}
      .uc-rlabel{margin:0;font-size:.8125rem;font-weight:800}
      .uc-total{
        margin:0;font-size:clamp(1.9rem,8vw,2.75rem);font-weight:800;line-height:1.15;letter-spacing:-.01em;
        font-variant-numeric:tabular-nums;overflow-wrap:anywhere;unicode-bidi:plaintext;
      }
      .uc-rsub{margin:0;font-size:.8125rem;font-weight:600;opacity:.85}
      .uc-per{margin-top:6px;padding:14px 16px;border-radius:18px;background:var(--uc-ink);color:var(--uc-ink-text)}
      .uc-per-label{margin:0;font-size:.75rem;opacity:.75}
      .uc-per-value{margin:2px 0 0;font-size:clamp(1.375rem,5vw,1.75rem);font-weight:800;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;unicode-bidi:plaintext}
      .uc-per-value b{color:var(--uc-orange);font-weight:800}

      /* Breakdown */
      .uc-items{display:grid;gap:14px}
      .uc-item-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px}
      .uc-item-name{display:flex;align-items:center;gap:8px;min-width:0;font-size:.8125rem;font-weight:700;color:var(--uc-text-2)}
      .uc-mini-ico{
        width:26px;height:26px;border-radius:9px;flex:none;display:grid;place-items:center;
        background:var(--uc-surface-2);color:var(--uc-orange);border:1px solid var(--uc-border);
      }
      .uc-item-val{font-size:.875rem;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap;unicode-bidi:plaintext}
      .uc-bar{height:8px;border-radius:999px;overflow:hidden;background:var(--uc-ink)}
      .uc-bar-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#FF8A3D,#FF5B04);transition:width .5s ease}
      .uc-pct{margin:4px 0 0;font-size:.6875rem;color:var(--uc-muted)}

      .uc-warn{
        display:grid;gap:6px;margin-top:18px;padding:14px;border-radius:16px;font-size:.8125rem;line-height:1.7;
        background:color-mix(in srgb,var(--uc-warning) 9%,var(--uc-surface));
        border:1px solid color-mix(in srgb,var(--uc-warning) 35%,var(--uc-border));
        color:var(--uc-text);
      }
      .uc-warn-head{display:flex;align-items:center;gap:8px;margin:0;font-weight:800;color:var(--uc-warning)}
      .uc-warn p{margin:0}

      .uc-season{text-align:center;display:grid;gap:2px;padding:16px}
      .uc-season .k{font-size:.75rem;color:var(--uc-muted)}
      .uc-season .v{font-size:1.0625rem;font-weight:800}
      .uc-season .m{font-size:.8125rem;font-weight:700;color:var(--uc-orange)}

      .uc-foot{
        display:flex;gap:8px;align-items:flex-start;justify-content:center;margin:24px auto 0;max-width:42rem;
        text-align:center;font-size:.75rem;line-height:1.8;color:var(--uc-muted);
      }
      .uc-foot svg{flex:none;margin-top:4px}

      /* Mobile summary bar (sticks inside the form column only) */
      .uc-mini{
        position:sticky;bottom:12px;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:12px;
        padding:10px 12px 10px 14px;border-radius:20px;background:var(--uc-ink);color:var(--uc-ink-text);
        border:1px solid #2A2A2A;box-shadow:0 14px 30px -12px rgba(0,0,0,.55);
      }
      .uc-mini-l{min-width:0}
      .uc-mini-k{display:block;font-size:.6875rem;opacity:.7}
      .uc-mini-v{display:block;font-size:1.125rem;font-weight:800;color:var(--uc-orange);font-variant-numeric:tabular-nums;overflow-wrap:anywhere;unicode-bidi:plaintext}
      .uc-mini-a{
        flex:none;display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;border-radius:14px;
        background:var(--uc-gloss);color:var(--uc-on-orange);font-size:.8125rem;font-weight:800;text-decoration:none;
      }
      @media (min-width:960px){.uc-mini{display:none}}

      @media (prefers-reduced-motion:reduce){
        .uc-root *,.uc-root *::before,.uc-root *::after{transition:none!important;animation:none!important}
      }
      @media print{
        .uc-root{padding:0;max-width:none}
        .uc-noprint{display:none!important}
        .uc-grid{display:block}
        .uc-aside{position:static}
        .uc-result{background:#fff!important;color:#000!important;border:1.5px solid #000;box-shadow:none!important}
        .uc-result::before,.uc-result::after{display:none}
        .uc-per{background:#fff!important;color:#000!important;border:1px solid #000}
        .uc-per-value b{color:#000!important}
      }
    `}</style>
  );
}

/* ─── Small components (defined outside to keep state/focus stable) ───────── */
function Counter({ label, value, setValue, min = 0 }) {
  return (
    <div className="uc-cbox">
      <span className="uc-clabel">{label}</span>
      <div className="uc-counter" role="group" aria-label={label}>
        <button
          type="button"
          className="uc-cbtn"
          onClick={() => setValue(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`إنقاص ${label}`}
        >
          <Icon name="minus" size={18} />
        </button>
        <output className="uc-cval" aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          className="uc-cbtn"
          onClick={() => setValue(value + 1)}
          aria-label={`زيادة ${label}`}
        >
          <Icon name="plus" size={18} />
        </button>
      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <section className="uc-card">
      <h2 className="uc-title">
        <span className="uc-tile" aria-hidden="true">
          <Icon name={icon} />
        </span>
        <span>{title}</span>
      </h2>
      {children}
    </section>
  );
}

function CheckBadge() {
  return (
    <span className="uc-check" aria-hidden="true">
      <Icon name="check" size={13} />
    </span>
  );
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function UmrahCalculator() {
  const uid = useId();
  const [countryId, setCountryId] = useState("pk");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [days, setDays] = useState(10);
  const [seasonId, setSeasonId] = useState("regular");
  const [hotelId, setHotelId] = useState("4star");
  const [mealId, setMealId] = useState("self");
  const [flightClass, setFlightClass] = useState("economy");
  const [includeVisa, setIncludeVisa] = useState(true);
  const [extraShopping, setExtraShopping] = useState(0);

  const country = COUNTRIES.find((c) => c.id === countryId);
  const season = SEASONS.find((s) => s.id === seasonId);
  const hotel = HOTELS.find((h) => h.id === hotelId);
  const meal = MEAL_PLANS.find((m) => m.id === mealId);
  const sarRate = SAR_TO[countryId] || 1;
  const travelers = adults + children;

  const result = useMemo(() => {
    if (!country || !season || !hotel || !meal) return null;
    const baseFlight = country.flight * season.flightMult;
    const flightCost = baseFlight * (flightClass === "business" ? 3.5 : 1) * travelers;
    const visaCost = includeVisa ? country.visa * travelers : 0;
    const hotelSAR = hotel.sarPerNight * season.hotelMult * days;
    const hotelCost = hotelSAR * sarRate * Math.ceil(travelers / 2);
    const foodCost = country.dailyFood * meal.mult * days * travelers;
    const transportCost = country.transport * days * travelers;
    const shoppingCost = country.shopping + Number(extraShopping);
    const total = flightCost + visaCost + hotelCost + foodCost + transportCost + shoppingCost;
    return {
      flight: flightCost,
      visa: visaCost,
      hotel: hotelCost,
      food: foodCost,
      transport: transportCost,
      shopping: shoppingCost,
      total,
      perPerson: total / travelers,
    };
  }, [country, season, hotel, meal, adults, children, days, flightClass, includeVisa, extraShopping, sarRate, travelers]);

  const sym = country?.symbol || "";
  const items = result
    ? [
      { label: "تكلفة الطيران", value: result.flight, icon: "plane" },
      { label: "تكلفة التأشيرة", value: result.visa, icon: "id" },
      { label: "تكلفة الفندق", value: result.hotel, icon: "hotel" },
      { label: "تكلفة الطعام", value: result.food, icon: "utensils" },
      { label: "تكلفة النقل", value: result.transport, icon: "bus" },
      { label: "تكلفة التسوق", value: result.shopping, icon: "cart" },
    ]
    : [];

  return (
    <div className="uc-root" dir="rtl">
      <UmrahStyles />

      <header className="uc-head">
        <div className="uc-badge">
          <span className="uc-badge-ico" aria-hidden="true">
            <Icon name="moon" size={14} />
          </span>
          <span>تكلفة العمرة المتوقعة</span>
        </div>
        <h1 className="uc-h1">أداة حساب تكلفة العمرة</h1>
        <p className="uc-sub">
          احسب تكلفة رحلتك للعمرة مع جميع المتغيرات مثل الطيران، الفنادق، الطعام، والتسوق.
        </p>
      </header>

      <div className="uc-grid">
        <div className="uc-form uc-noprint">
          {/* Country */}
          <Section icon="globe" title="الدولة">
            <div className="uc-opts" style={{ "--min": "140px" }}>
              {COUNTRIES.map((c) => {
                const on = countryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setCountryId(c.id)}
                    className={`uc-opt${on ? " is-on" : ""}`}
                  >
                    <span className="uc-opt-top">
                      <span className="uc-code">{c.currency}</span>
                      {on && <CheckBadge />}
                    </span>
                    <span className="uc-opt-name">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Travelers & Days */}
          <Section icon="users" title="عدد الأشخاص و الأيام">
            <div className="uc-counters">
              <Counter label="عدد البالغين" value={adults} setValue={setAdults} min={1} />
              <Counter label="عدد الأطفال" value={children} setValue={setChildren} min={0} />
              <Counter label="عدد الأيام" value={days} setValue={setDays} min={3} />
            </div>
          </Section>

          {/* Season */}
          <Section icon="moon" title="الموسم">
            <div className="uc-opts" style={{ "--min": "200px" }}>
              {SEASONS.map((s) => {
                const on = seasonId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSeasonId(s.id)}
                    className={`uc-opt${on ? " is-on" : ""}`}
                  >
                    <span className="uc-opt-top">
                      <span className="uc-opt-name">{s.name}</span>
                      {on && <CheckBadge />}
                    </span>
                    {s.id !== "regular" && (
                      <span className="uc-meta">
                        <span className="uc-pill">فندق ×{s.hotelMult}</span>
                        <span className="uc-pill">طيران ×{s.flightMult}</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Hotel */}
          <Section icon="hotel" title="الفنادق">
            <div className="uc-opts" style={{ "--min": "200px" }}>
              {HOTELS.map((h) => {
                const on = hotelId === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setHotelId(h.id)}
                    className={`uc-opt${on ? " is-on" : ""}`}
                  >
                    <span className="uc-opt-top">
                      <span className="uc-stars" aria-hidden="true">
                        {Array.from({ length: h.stars }, (_, i) => (
                          <Icon key={i} name="star" size={13} />
                        ))}
                      </span>
                      {on && <CheckBadge />}
                    </span>
                    <span className="uc-opt-name">{h.name}</span>
                    <span className="uc-opt-desc">{h.desc}</span>
                    <span className="uc-meta">
                      <span className="uc-pill">{h.sarPerNight.toLocaleString("ar-EG")} ر.س / ليلة</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Flight & Meal */}
          <div className="uc-two">
            <Section icon="plane" title="الطيران">
              <div className="uc-opts" style={{ "--min": "100%" }}>
                {FLIGHT_CLASSES.map((f) => {
                  const on = flightClass === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setFlightClass(f.id)}
                      className={`uc-opt${on ? " is-on" : ""}`}
                    >
                      <span className="uc-opt-top">
                        <span className="uc-opt-name">{f.name}</span>
                        {on && <CheckBadge />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section icon="utensils" title="خطة الوجبات">
              <div className="uc-opts" style={{ "--min": "100%" }}>
                {MEAL_PLANS.map((m) => {
                  const on = mealId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setMealId(m.id)}
                      className={`uc-opt${on ? " is-on" : ""}`}
                    >
                      <span className="uc-opt-top">
                        <span className="uc-opt-name">{m.name}</span>
                        {on && <CheckBadge />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>
          </div>

          {/* Extra options */}
          <Section icon="cart" title="خيارات إضافية">
            <div className="uc-row">
              <div className="uc-row-text">
                <p className="uc-row-title" id={`${uid}-visa`}>تضمين التأشيرة</p>
                <p className="uc-row-sub">
                  {fmt((country?.visa || 0) * travelers, sym)} إجمالي تكلفة التأشيرات لجميع المسافرين
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={includeVisa}
                aria-labelledby={`${uid}-visa`}
                onClick={() => setIncludeVisa(!includeVisa)}
                className="uc-switch"
              />
            </div>

            <label className="uc-label" htmlFor={`${uid}-shop`}>
              المشتريات الإضافية ({sym})
            </label>
            <div className="uc-inwrap">
              <input
                id={`${uid}-shop`}
                type="number"
                inputMode="decimal"
                min="0"
                value={extraShopping}
                onChange={(e) => setExtraShopping(e.target.value)}
                placeholder="0"
                className="uc-input"
              />
              <span className="uc-suffix" aria-hidden="true">{country?.currency}</span>
            </div>
          </Section>

          {/* Mobile summary bar */}
          {result && (
            <div className="uc-mini" role="status">
              <div className="uc-mini-l">
                <span className="uc-mini-k">الإجمالي · {travelers} أشخاص</span>
                <span className="uc-mini-v">{fmt(result.total, sym)}</span>
              </div>
              <a className="uc-mini-a" href={`#${uid}-results`}>
                <span>التفاصيل</span>
                <Icon name="arrow" size={16} />
              </a>
            </div>
          )}
        </div>

        {/* Results */}
        <aside className="uc-aside" aria-label="النتيجة">
          <div className="uc-result" id={`${uid}-results`}>
            <p className="uc-rlabel">النتيجة الإجمالية</p>
            <p className="uc-total">{result ? fmt(result.total, sym) : "—"}</p>
            <p className="uc-rsub">
              الإجمالي ({travelers} أشخاص · {days} أيام)
            </p>
            {result && (
              <div className="uc-per">
                <p className="uc-per-label">السعر للفرد</p>
                <p className="uc-per-value">
                  <b>{fmt(result.perPerson, sym)}</b>
                </p>
              </div>
            )}
          </div>

          {result && (
            <section className="uc-card">
              <h3 className="uc-title">
                <span className="uc-tile" aria-hidden="true">
                  <Icon name="receipt" />
                </span>
                <span>تفصيل التكلفة</span>
              </h3>

              <div className="uc-items">
                {items.map((item) => {
                  const pct = Math.round((item.value / result.total) * 100);
                  return (
                    <div key={item.label}>
                      <div className="uc-item-top">
                        <span className="uc-item-name">
                          <span className="uc-mini-ico" aria-hidden="true">
                            <Icon name={item.icon} size={14} />
                          </span>
                          <span>{item.label}</span>
                        </span>
                        <span className="uc-item-val">{fmt(item.value, sym)}</span>
                      </div>
                      <div
                        className="uc-bar"
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={item.label}
                      >
                        <div className="uc-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="uc-pct">{pct}% من المجموع</p>
                    </div>
                  );
                })}
              </div>

              <div className="uc-warn uc-noprint">
                <p className="uc-warn-head">
                  <Icon name="alert" size={16} />
                  <span>ملاحظة</span>
                </p>
                {seasonId === "last_10" && (
                  <p>• قد تصل تكلفة الفندق إلى {season.hotelMult} أضعاف السعر في الموسم العادي</p>
                )}
                {seasonId === "ramadan" && <p>• في شهر رمضان قد ترتفع أسعار الطيران والفنادق</p>}
                <p>• يرجى مراجعة الأسعار قبل الحجز</p>
                <p>• يرجى مراجعة الشروط والأحكام قبل الحجز</p>
              </div>
            </section>
          )}

          <div className="uc-card uc-season">
            <span className="k">موسم</span>
            <span className="v">{season?.name}</span>
            {season?.id !== "regular" && <span className="m">×{season.hotelMult} مضاعف الموسم</span>}
          </div>
        </aside>
      </div>

      <p className="uc-foot uc-noprint">
        <Icon name="info" size={14} />
        <span>ملاحظة: الأسعار تقديرية وقد تختلف حسب تغير أسعار الصرف.</span>
      </p>
    </div>
  );
}