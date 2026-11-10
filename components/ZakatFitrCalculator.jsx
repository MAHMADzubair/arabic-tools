"use client";

/**
 * components/ZakatFitrCalculator.jsx
 * Qemlo tool style: glossy orange + ink, SVG icons, 26px cards, 16px controls,
 * light/dark, mobile-first. Rates, food weights and the calculation are
 * unchanged; only presentation, accessibility and one copy-text label changed.
 */

import { useState, useMemo, useId, useRef } from "react";

// Indicative cash value per person. Only UAE is an official figure we verified (UAE Fatwa Council, 1447H/2026).
// Saudi Arabia: the Permanent Committee requires food, not cash; the SAR value is a rice-price estimate for agency (tawkeel).
// Other countries: earlier-year figures; the user can override the amount.
const countryCashRates = [
  { code: "KSA", country: "السعودية", flag: "🇸🇦", value: 25, currency: "SAR", note: "تقدير لثمن صاع الأرز (20 - 30 ر.س) عند توكيل جهة تشتريه عنك. اللجنة الدائمة للإفتاء تنص على إخراجها طعاماً لا نقداً." },
  { code: "UAE", country: "الإمارات", flag: "🇦🇪", value: 25, currency: "AED", note: "تقدير مجلس الإمارات للإفتاء الشرعي لعام 1447هـ / 2026. قيمة 2027 لم تُعلن بعد." },
  { code: "EGY", country: "مصر", flag: "🇪🇬", value: 35, currency: "EGP", note: "قيمة استرشادية من عام سابق (الحد الأدنى المعلن من دار الإفتاء المصرية). تحقق من إعلان هذا العام وعدّل المبلغ." },
  { code: "QAR", country: "قطر", flag: "🇶🇦", value: 20, currency: "QAR", note: "قيمة استرشادية من عام سابق (إدارة صندوق الزكاة القطرية). تحقق من إعلان هذا العام وعدّل المبلغ." },
  { code: "KWD", country: "الكويت", flag: "🇰🇼", value: 2.5, currency: "KWD", note: "قيمة استرشادية من عام سابق (بيت الزكاة الكويتي (ديناران ونصف)). تحقق من إعلان هذا العام وعدّل المبلغ." },
  { code: "JOR", country: "الأردن", flag: "🇯🇴", value: 2.0, currency: "JOD", note: "قيمة استرشادية من عام سابق (دائرة الإفتاء العام الأردنية). تحقق من إعلان هذا العام وعدّل المبلغ." },
  { code: "OMN", country: "عمان", flag: "🇴🇲", value: 2.5, currency: "OMR", note: "قيمة استرشادية من عام سابق (وزارة الأوقاف والشؤون الدينية). تحقق من إعلان هذا العام وعدّل المبلغ." },
  { code: "GLOBAL", country: "أوروبا / أمريكا", flag: "🌍", value: 12, currency: "USD", note: "قيمة استرشادية من عام سابق (المجالس الإسلامية في المهجر (10 - 15 دولار)). تحقق من إعلان هذا العام وعدّل المبلغ." },
];

// Weight of one sa' per person: Saudi Permanent Committee estimate (~3 kg of any staple).
const SA_SA_KG = 3;
const SA_NOTE = "بتقدير اللجنة الدائمة للإفتاء في السعودية: الصاع نحو 3 كغ من الأرز أو غيره من قوت البلد.";
const stapleFoodTypes = [
  { id: "rice", name: "أرز (قوت أهل الخليج الأغلب)", saWeightKg: SA_SA_KG, note: `${SA_NOTE} وفي الإمارات حدّد مجلس الإفتاء الشرعي 2.5 كغ من الأرز عن الفرد.` },
  { id: "wheat", name: "قمح / دقيق (بر)", saWeightKg: SA_SA_KG, note: SA_NOTE },
  { id: "dates", name: "تمر", saWeightKg: SA_SA_KG, note: SA_NOTE },
  { id: "raisins", name: "زبيب", saWeightKg: SA_SA_KG, note: SA_NOTE },
  { id: "barley", name: "شعير", saWeightKg: SA_SA_KG, note: SA_NOTE },
];

function formatNumber(n, decimals = 1) {
  return n.toLocaleString("ar-SA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/* ─── Icons (SVG) ─────────────────────────────────────────────────────────── */
const ICONS = {
  wheat: (
    <>
      <path d="M12 21V7" />
      <path d="M12 7c-2.2 0-4-1.8-4-4 2.2 0 4 1.8 4 4zM12 7c2.2 0 4-1.8 4-4-2.2 0-4 1.8-4 4z" />
      <path d="M12 13c-2.2 0-4-1.8-4-4 2.2 0 4 1.8 4 4zM12 13c2.2 0 4-1.8 4-4-2.2 0-4 1.8-4 4z" />
      <path d="M12 19c-2.2 0-4-1.8-4-4 2.2 0 4 1.8 4 4zM12 19c2.2 0 4-1.8 4-4-2.2 0-4 1.8-4 4z" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.2 0-2.1-.5-2.6-1.3M12 6.5V8M12 16v1.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.4c1.8.8 3 2.7 3 5.6" />
    </>
  ),
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />,
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="3" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 21v-8" />
      <path d="M12 13c0-3.5-2.5-6-6.5-6 0 3.5 2.5 6 6.5 6zM12 15c0-3 2-5 5.5-5 0 3-2 5-5.5 5z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18M6 21h12M5 7h14" />
      <path d="m5 7-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5v.01" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </>
  ),
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
const css = `
.zf{
  --z-surface:var(--surface,#FFFFFF);
  --z-surface-2:var(--surface-2,#ECECE7);
  --z-border:var(--border,#D4D4CE);
  --z-text:var(--text,#0D0D0D);
  --z-text-2:var(--text-2,#555555);
  --z-muted:var(--muted,#6B6B66);
  --z-ink:#0D0D0D;
  --z-ink-text:#F5F5F2;
  --z-orange:var(--orange,#FF5B04);
  --z-on-orange:#0D0D0D;
  --z-gloss:linear-gradient(180deg,#FF8A3D 0%,#FF5B04 52%,#E64F00 100%);
  --z-gloss-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 0 rgba(0,0,0,.12),0 10px 22px -10px rgba(255,91,4,.65);
  --z-ring:color-mix(in srgb,var(--z-orange) 22%,transparent);
  color:var(--z-text);max-width:1080px;margin:0 auto;line-height:1.6;
  padding:clamp(16px,4vw,40px) clamp(14px,4vw,24px) 48px;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]) .zf{
    --z-surface:var(--surface,#161616);
    --z-surface-2:var(--surface-2,#1D1D1D);
    --z-border:var(--border,#2A2A2A);
    --z-text:var(--text,#F5F5F2);
    --z-text-2:var(--text-2,#B5B5B0);
    --z-muted:var(--muted,#8E8E89);
  }
}
:root[data-theme="dark"] .zf{
  --z-surface:var(--surface,#161616);
  --z-surface-2:var(--surface-2,#1D1D1D);
  --z-border:var(--border,#2A2A2A);
  --z-text:var(--text,#F5F5F2);
  --z-text-2:var(--text-2,#B5B5B0);
  --z-muted:var(--muted,#8E8E89);
}
.zf *,.zf *::before,.zf *::after{box-sizing:border-box}
.zf h1,.zf h2,.zf h3,.zf p,.zf dl,.zf dd{margin:0;padding:0}
.zf button,.zf input{font:inherit;color:inherit}
.zf :focus-visible{outline:2px solid var(--z-orange);outline-offset:3px}
.zf bdi{unicode-bidi:isolate;font-variant-numeric:tabular-nums}

/* Header */
.zf-head{display:grid;justify-items:center;gap:12px;text-align:center;margin-bottom:24px}
.zf-badge{display:inline-flex;align-items:center;gap:8px;padding-block:5px;padding-inline:6px 14px;border-radius:999px;background:var(--z-gloss);color:var(--z-on-orange);font-size:.8125rem;font-weight:800;box-shadow:var(--z-gloss-shadow)}
.zf-badge-ico{width:26px;height:26px;border-radius:999px;flex:none;display:grid;place-items:center;background:var(--z-ink);color:var(--z-orange)}
.zf-h1{font-size:clamp(1.75rem,5.5vw,2.75rem);font-weight:800;line-height:1.25;text-wrap:balance}
.zf-lead{max-width:40rem;color:var(--z-text-2);font-size:clamp(.875rem,2.4vw,1rem);line-height:1.8;text-wrap:balance}

/* Layout */
.zf-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:16px}
.zf-col{display:grid;gap:16px;min-width:0;align-content:start}
@media (min-width:960px){
  .zf-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px;align-items:start}
  .zf-aside{position:sticky;top:16px}
}

/* Cards */
.zf-box{background:var(--z-surface);border:1px solid var(--z-border);border-radius:26px;padding:clamp(16px,3.5vw,24px);min-width:0;transition:border-color .2s,box-shadow .2s}
@media (hover:hover){.zf-box:hover{border-color:color-mix(in srgb,var(--z-orange) 55%,var(--z-border));box-shadow:0 0 0 4px var(--z-ring)}}
.zf-h2{display:flex;align-items:center;gap:10px;margin-bottom:16px;font-size:1rem;line-height:1.5;font-weight:800}
.zf-tile{width:36px;height:36px;border-radius:12px;flex:none;display:grid;place-items:center;background:var(--z-gloss);color:var(--z-on-orange);box-shadow:var(--z-gloss-shadow)}
.zf-label{display:block;margin-bottom:8px;font-size:.8125rem;font-weight:700;color:var(--z-text-2)}
.zf-sub{margin:-6px 0 16px;font-size:.8125rem;line-height:1.8;color:var(--z-text-2)}
.zf-divider{margin-top:20px;padding-top:20px;border-top:1px solid var(--z-border)}

/* Mode switch */
.zf-modes{display:grid;gap:10px;grid-template-columns:minmax(0,1fr)}
@media (min-width:480px){.zf-modes{grid-template-columns:repeat(2,minmax(0,1fr))}}
.zf-opt{
  position:relative;display:grid;gap:4px;align-content:start;min-width:0;min-height:64px;padding:12px 14px;border-radius:16px;text-align:start;cursor:pointer;
  border:1px solid var(--z-border);background:var(--z-surface-2);color:var(--z-text);transition:border-color .2s,box-shadow .2s,transform .2s;
}
.zf-opt:active{transform:scale(.98)}
@media (hover:hover){.zf-opt:not(.is-on):hover{border-color:var(--z-orange);transform:translateY(-2px)}}
.zf-opt.is-on{border-color:transparent;background:var(--z-gloss);color:var(--z-on-orange);box-shadow:var(--z-gloss-shadow)}
.zf-opt-top{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:22px}
.zf-opt-name{display:flex;align-items:center;gap:8px;font-size:.875rem;font-weight:800;line-height:1.5}
.zf-opt-desc{font-size:.75rem;line-height:1.6;color:var(--z-muted)}
.zf-opt.is-on .zf-opt-desc{color:rgba(13,13,13,.75)}
.zf-check{width:22px;height:22px;border-radius:999px;display:grid;place-items:center;flex:none;background:var(--z-ink);color:var(--z-orange)}
.zf-code{padding:1px 8px;border-radius:999px;font-size:.6875rem;font-weight:800;line-height:1.7;background:var(--z-surface);color:var(--z-text-2);border:1px solid var(--z-border)}
.zf-opt.is-on .zf-code{background:var(--z-ink);color:var(--z-ink-text);border-color:transparent}
.zf-countries{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}
.zf-cval{font-size:.8125rem;font-weight:700;font-variant-numeric:tabular-nums;color:var(--z-text-2)}
.zf-opt.is-on .zf-cval{color:var(--z-on-orange)}

/* Rate input */
.zf-rate-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
.zf-rate-head .zf-label{margin:0}
.zf-link{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 10px;border-radius:12px;border:1px solid var(--z-border);background:var(--z-surface-2);font-size:.75rem;font-weight:800;cursor:pointer;transition:border-color .2s}
@media (hover:hover){.zf-link:hover{border-color:var(--z-orange)}}
.zf-inwrap{position:relative}
.zf-input{
  width:100%;min-height:52px;padding-block:0;padding-inline:16px 64px;border-radius:16px;border:1px solid var(--z-border);
  background:var(--z-surface-2);color:var(--z-text);font-size:1.125rem;font-weight:800;font-variant-numeric:tabular-nums;text-align:start;
  transition:border-color .2s,background .2s,box-shadow .2s;-moz-appearance:textfield;appearance:textfield;
}
.zf-input::-webkit-outer-spin-button,.zf-input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.zf-input:focus{outline:none;background:var(--z-surface);border-color:var(--z-orange);box-shadow:0 0 0 4px var(--z-ring)}
.zf-suffix{position:absolute;inset-inline-end:14px;top:50%;transform:translateY(-50%);pointer-events:none;font-size:.75rem;font-weight:800;color:var(--z-muted)}
.zf-note{display:flex;gap:10px;align-items:flex-start;margin-top:10px;padding:12px 14px;border-radius:16px;font-size:.8125rem;line-height:1.7;background:color-mix(in srgb,var(--z-orange) 10%,var(--z-surface));border:1px solid color-mix(in srgb,var(--z-orange) 35%,var(--z-border))}
.zf-note svg{flex:none;margin-top:3px;color:var(--z-orange)}

/* Food rows */
.zf-foods{display:grid;gap:10px}
.zf-food{
  position:relative;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;min-height:56px;padding:10px 14px;border-radius:16px;cursor:pointer;
  border:1px solid var(--z-border);background:var(--z-surface-2);font-size:.875rem;font-weight:700;transition:border-color .2s,transform .2s;
}
.zf-food input{position:absolute;opacity:0;inset:0;width:100%;height:100%;margin:0;cursor:pointer}
.zf-food:focus-within{outline:2px solid var(--z-orange);outline-offset:3px}
.zf-food:active{transform:scale(.99)}
@media (hover:hover){.zf-food:not(.is-on):hover{border-color:var(--z-orange)}}
.zf-food-l{display:flex;align-items:center;gap:10px;min-width:0}
.zf-dot{width:22px;height:22px;border-radius:999px;flex:none;display:grid;place-items:center;border:1.5px solid var(--z-border);background:var(--z-surface);color:var(--z-orange)}
.zf-food.is-on{border-color:transparent;background:var(--z-gloss);color:var(--z-on-orange);box-shadow:var(--z-gloss-shadow)}
.zf-food.is-on .zf-dot{background:var(--z-ink);border-color:var(--z-ink)}
.zf-pill{padding:1px 10px;border-radius:999px;font-size:.75rem;font-weight:800;line-height:1.7;white-space:nowrap;background:var(--z-surface);border:1px solid var(--z-border);color:var(--z-text)}
.zf-food.is-on .zf-pill{background:var(--z-ink);color:var(--z-ink-text);border-color:transparent}

/* Family */
.zf-self{
  position:relative;display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:56px;padding:0 14px;border-radius:16px;cursor:pointer;
  border:1px solid var(--z-border);background:var(--z-surface-2);font-size:.875rem;font-weight:800;transition:border-color .2s,background .2s;
}
.zf-self input{position:absolute;opacity:0;inset:0;width:100%;height:100%;margin:0;cursor:pointer}
.zf-self:focus-within{outline:2px solid var(--z-orange);outline-offset:3px}
.zf-self-l{display:flex;align-items:center;gap:10px}
.zf-switch{position:relative;flex:none;width:48px;height:28px;border-radius:999px;border:1px solid var(--z-border);background:var(--z-surface);transition:background .2s}
.zf-switch::after{content:"";position:absolute;top:3px;inset-inline-start:3px;width:20px;height:20px;border-radius:999px;background:var(--z-text-2);transition:inset-inline-start .2s,background .2s}
.zf-self.is-on{border-color:transparent;background:var(--z-gloss);color:var(--z-on-orange);box-shadow:var(--z-gloss-shadow)}
.zf-self.is-on .zf-switch{background:var(--z-ink);border-color:var(--z-ink)}
.zf-self.is-on .zf-switch::after{inset-inline-start:calc(100% - 23px);background:var(--z-orange)}
.zf-members{display:grid;gap:10px;grid-template-columns:minmax(0,1fr)}
@media (min-width:420px){.zf-members{grid-template-columns:repeat(2,minmax(0,1fr))}}
.zf-member{display:grid;gap:10px;padding:12px;border-radius:18px;background:var(--z-surface-2);border:1px solid var(--z-border);min-width:0}
.zf-member-top{display:flex;align-items:center;gap:8px;min-width:0}
.zf-mini-ico{width:28px;height:28px;border-radius:10px;flex:none;display:grid;place-items:center;background:var(--z-surface);border:1px solid var(--z-border);color:var(--z-orange)}
.zf-member-label{font-size:.75rem;font-weight:700;line-height:1.5}
.zf-counter{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;gap:6px}
.zf-cbtn{height:44px;border-radius:14px;display:grid;place-items:center;cursor:pointer;border:1px solid var(--z-border);background:var(--z-surface);color:var(--z-orange);transition:border-color .2s,transform .2s,opacity .2s}
.zf-cbtn:active{transform:scale(.92)}
.zf-cbtn:disabled{opacity:.4;cursor:not-allowed}
@media (hover:hover){.zf-cbtn:not(:disabled):hover{border-color:var(--z-orange)}}
.zf-cval{text-align:center;font-size:1.25rem;font-weight:800;font-variant-numeric:tabular-nums}

/* Result */
.zf-result{
  position:relative;overflow:hidden;border-radius:26px;padding:clamp(18px,4vw,28px);text-align:center;display:grid;gap:10px;justify-items:center;scroll-margin-top:16px;
  background:var(--z-gloss);color:var(--z-on-orange);box-shadow:0 18px 40px -18px rgba(255,91,4,.6),inset 0 1px 0 rgba(255,255,255,.5);
}
.zf-result::before{content:"";position:absolute;inset:0 0 55% 0;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.3),rgba(255,255,255,0))}
.zf-result::after{content:"";position:absolute;inset-inline-end:-54px;top:-54px;width:170px;height:170px;border:30px solid rgba(13,13,13,.07);border-radius:999px;pointer-events:none}
.zf-result > *{position:relative;z-index:1}
.zf-rtag{padding:3px 12px;border-radius:999px;background:var(--z-ink);color:var(--z-ink-text);font-size:.75rem;font-weight:800}
.zf-rlabel{font-size:.8125rem;font-weight:800}
.zf-rvalue{font-size:clamp(2rem,8vw,3rem);font-weight:800;line-height:1.15;letter-spacing:-.01em;overflow-wrap:anywhere;animation:zf-pop .28s ease-out}
@keyframes zf-pop{from{opacity:.35;transform:translateY(4px)}to{opacity:1;transform:none}}
.zf-rpill{display:inline-flex;align-items:center;gap:8px;max-width:100%;padding:6px 14px;border-radius:999px;background:var(--z-ink);color:var(--z-ink-text);font-size:.8125rem;font-weight:700;line-height:1.6}
.zf-rpill svg{flex:none;color:var(--z-orange)}
.zf-rvol{width:100%;padding:10px 14px;border-radius:16px;background:rgba(13,13,13,.12);font-size:.8125rem;font-weight:800;line-height:1.7;overflow-wrap:anywhere}

/* Breakdown */
.zf-head-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
.zf-head-row .zf-h2{margin-bottom:0}
.zf-copy{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 16px;border-radius:16px;border:0;cursor:pointer;background:var(--z-ink);color:var(--z-ink-text);font-size:.8125rem;font-weight:800;transition:transform .2s}
.zf-copy:active{transform:scale(.97)}
:root:not([data-theme="light"]) .zf-copy{border:1px solid var(--z-border)}
.zf-rows{display:grid;padding:4px 16px;border-radius:18px;background:var(--z-surface-2);border:1px solid var(--z-border)}
.zf-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--z-border);font-size:.8125rem}
.zf-row:last-child{border-bottom:0}
.zf-row dt{font-weight:700;color:var(--z-text-2);min-width:0}
.zf-row dd{font-weight:800;text-align:end;overflow-wrap:anywhere;font-size:.875rem}
.zf-row.is-total dt{color:var(--z-text)}
.zf-row.is-total dd{font-size:1rem}
.zf-tip{display:grid;gap:6px;margin-top:16px;padding:14px 16px;border-radius:18px;background:var(--z-surface-2);border:1px solid var(--z-border);font-size:.8125rem;line-height:1.8;color:var(--z-text-2)}
.zf-tip-title{display:flex;align-items:center;gap:8px;font-weight:800;color:var(--z-text)}
.zf-tip strong{color:var(--z-text)}

/* Mobile summary bar */
.zf-mini{
  position:sticky;bottom:12px;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:10px 12px 10px 14px;border-radius:20px;background:var(--z-ink);color:var(--z-ink-text);border:1px solid #2A2A2A;box-shadow:0 14px 30px -12px rgba(0,0,0,.55);
}
.zf-mini-l{min-width:0}
.zf-mini-k{display:block;font-size:.6875rem;opacity:.7}
.zf-mini-v{display:block;font-size:1.0625rem;font-weight:800;color:var(--z-orange);overflow-wrap:anywhere}
.zf-mini-a{flex:none;display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;border-radius:14px;background:var(--z-gloss);color:var(--z-on-orange);font-size:.8125rem;font-weight:800;text-decoration:none}
@media (min-width:960px){.zf-mini{display:none}}

.zf-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (prefers-reduced-motion:reduce){.zf *,.zf *::before,.zf *::after{transition:none!important;animation:none!important}}
@media print{
  .zf{padding:0;max-width:none}
  .zf-noprint{display:none!important}
  .zf-grid{display:block}
  .zf-aside{position:static}
  .zf-result{background:#fff!important;color:#000!important;border:1.5px solid #000;box-shadow:none!important;margin-bottom:12px}
  .zf-result::before,.zf-result::after{display:none}
  .zf-rpill,.zf-rtag{background:#000!important;color:#fff!important}
  .zf-box{box-shadow:none!important;break-inside:avoid}
}
`;

/* ─── Small components (outside to keep state/focus stable) ───────────────── */
function Section({ icon, title, children }) {
  return (
    <section className="zf-box">
      <h2 className="zf-h2">
        <span className="zf-tile" aria-hidden="true">
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
    <span className="zf-check" aria-hidden="true">
      <Icon name="check" size={13} />
    </span>
  );
}

function NumberSelector({ label, value, onChange, min = 0, icon }) {
  return (
    <div className="zf-member">
      <div className="zf-member-top">
        <span className="zf-mini-ico" aria-hidden="true">
          <Icon name={icon} size={15} />
        </span>
        <span className="zf-member-label">{label}</span>
      </div>
      <div className="zf-counter" role="group" aria-label={label}>
        <button
          type="button"
          className="zf-cbtn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`إنقاص: ${label}`}
        >
          <Icon name="minus" size={18} />
        </button>
        <output className="zf-cval" aria-live="polite">{value}</output>
        <button
          type="button"
          className="zf-cbtn"
          onClick={() => onChange(value + 1)}
          aria-label={`زيادة: ${label}`}
        >
          <Icon name="plus" size={18} />
        </button>
      </div>
    </div>
  );
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function ZakatFitrCalculator() {
  const uid = useId();

  // Mode: 'cash' (نقداً بالقيمة) or 'food' (عيناً بالأصناف والكيلوجرامات)
  const [outputMode, setOutputMode] = useState("cash");

  // Family Members Breakdown
  const [selfIncluded, setSelfIncluded] = useState(true);
  const [wivesCount, setWivesCount] = useState(1);
  const [sonsCount, setSonsCount] = useState(2);
  const [daughtersCount, setDaughtersCount] = useState(1);
  const [parentsCount, setParentsCount] = useState(0);
  const [workersCount, setWorkersCount] = useState(0);
  const [unbornCount, setUnbornCount] = useState(0); // الجنين في البطن (مستحبة)

  // Cash calculation settings
  const [selectedCountryCode, setSelectedCountryCode] = useState("KSA");
  const [cashRatePerPerson, setCashRatePerPerson] = useState(25);
  const [currency, setCurrency] = useState("SAR");
  const [isCustomCashRate, setIsCustomCashRate] = useState(false);
  const [customCashInput, setCustomCashInput] = useState("25");

  // Food calculation settings
  const [selectedFoodId, setSelectedFoodId] = useState("rice");

  // Copy feedback
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  // Active food item
  const activeFood = stapleFoodTypes.find((f) => f.id === selectedFoodId) || stapleFoodTypes[0];

  // Active country preset
  const activeCountry = countryCashRates.find((c) => c.code === selectedCountryCode) || countryCashRates[0];

  // Handle country preset change
  const handleCountryChange = (country) => {
    setSelectedCountryCode(country.code);
    setIsCustomCashRate(false);
    setCashRatePerPerson(country.value);
    setCustomCashInput(country.value.toString());
    setCurrency(country.currency);
  };

  // Calculations
  const calculation = useMemo(() => {
    const obligIndividuals =
      (selfIncluded ? 1 : 0) +
      Math.max(0, wivesCount) +
      Math.max(0, sonsCount) +
      Math.max(0, daughtersCount) +
      Math.max(0, parentsCount) +
      Math.max(0, workersCount);

    const voluntaryIndividuals = Math.max(0, unbornCount); // الجنين
    const totalIndividuals = obligIndividuals + voluntaryIndividuals;

    // Total Sa'a
    const totalSaObligatory = obligIndividuals * 1;
    const totalSaWithVoluntary = totalIndividuals * 1;

    // Total KG of staple food
    const kgPerPerson = activeFood.saWeightKg;
    const totalKgObligatory = obligIndividuals * kgPerPerson;
    const totalKgWithVoluntary = totalIndividuals * kgPerPerson;

    // Cash calculations
    const rate = isCustomCashRate ? (parseFloat(customCashInput) || 0) : cashRatePerPerson;
    const totalCashObligatory = obligIndividuals * rate;
    const totalCashWithVoluntary = totalIndividuals * rate;

    return {
      obligIndividuals,
      voluntaryIndividuals,
      totalIndividuals,
      kgPerPerson,
      totalSaObligatory,
      totalSaWithVoluntary,
      totalKgObligatory,
      totalKgWithVoluntary,
      rate,
      totalCashObligatory,
      totalCashWithVoluntary,
    };
  }, [
    selfIncluded,
    wivesCount,
    sonsCount,
    daughtersCount,
    parentsCount,
    workersCount,
    unbornCount,
    activeFood,
    cashRatePerPerson,
    isCustomCashRate,
    customCashInput,
  ]);

  // Copy details
  const handleCopy = async () => {
    let text = `تقرير حساب زكاة الفطر المباركة\n`;
    text += `------------------------------------\n`;
    text += `عدد الأفراد الواجب إخراجها عنهم: ${calculation.obligIndividuals} أفراد\n`;
    if (calculation.voluntaryIndividuals > 0) {
      text += `الأجنة في البطن (مستحبة): ${calculation.voluntaryIndividuals}\n`;
    }
    text += `إجمالي عدد الأفراد: ${calculation.totalIndividuals}\n\n`;

    if (outputMode === "food") {
      text += `الصنف المختار: ${activeFood.name}\n`;
      text += `وزن الصاع للشخص: ~${calculation.kgPerPerson} كجم\n`;
      text += `إجمالي الكمية المطلوبة: ${formatNumber(calculation.totalKgObligatory)} كجم عيناً طعاماً`;
      if (calculation.voluntaryIndividuals > 0) {
        text += ` (أو ${formatNumber(calculation.totalKgWithVoluntary)} كجم مع الجنين)`;
      }
    } else {
      text += `قيمة الصاع للشخص: ${calculation.rate} ${currency}\n`;
      text += `إجمالي الزكاة الواجبة نقداً: ${formatNumber(calculation.totalCashObligatory, 2)} ${currency}`;
      if (calculation.voluntaryIndividuals > 0) {
        text += ` (أو ${formatNumber(calculation.totalCashWithVoluntary, 2)} ${currency} مع الجنين)`;
      }
    }

    text += `\n------------------------------------\n`;
    text += `الوقت الشرعي: تُخرج قبل صلاة العيد، ويجوز إخراجها قبل العيد بيوم أو يومين.`;

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
    copyTimer.current = setTimeout(() => setCopied(false), 3000);
  };

  const mainValue =
    outputMode === "cash"
      ? `${formatNumber(calculation.totalCashObligatory, 2)} ${currency}`
      : `${formatNumber(calculation.totalKgObligatory)} كيلوجرام`;

  const resultsId = `${uid}-results`;

  return (
    <div className="zf" dir="rtl">
      <style>{css}</style>

      {/* Header */}
      <header className="zf-head">
        <div className="zf-badge">
          <span className="zf-badge-ico" aria-hidden="true">
            <Icon name="wheat" size={14} />
          </span>
          <span>طهور للصائم وطعمة للمساكين</span>
        </div>
        <h1 className="zf-h1">حاسبة زكاة الفطر المباركة</h1>
        <p className="zf-lead">
          احسب زكاة الفطر بدقة عنك وعن جميع أفراد أسرتك، سواء عيناً بالطعام والأرز (بالصاع والكيلوجرام)
          أو نقداً بالقيمة المعتمدة في الفتوى الرسمية لكل دولة.
        </p>
      </header>

      <div className="zf-grid">
        {/* ── Inputs ─────────────────────────────────────────────────────────── */}
        <div className="zf-col zf-noprint">
          {/* Output mode */}
          <Section icon="scale" title="كيف تفضل إخراج زكاة الفطر؟">
            <div className="zf-modes" role="group" aria-label="طريقة الإخراج">
              {[
                { id: "cash", icon: "coin", name: "نقداً بالقيمة المالية", desc: "(مذهب الحنفية ودور الإفتاء المعاصرة)" },
                { id: "food", icon: "wheat", name: "طعاماً عيناً (حبوب وأرز)", desc: "(مذهب الجمهور وفتوى السعودية)" },
              ].map((m) => {
                const on = outputMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setOutputMode(m.id)}
                    className={`zf-opt${on ? " is-on" : ""}`}
                  >
                    <span className="zf-opt-top">
                      <span className="zf-opt-name">
                        <Icon name={m.icon} size={18} />
                        <span>{m.name}</span>
                      </span>
                      {on && <CheckBadge />}
                    </span>
                    <span className="zf-opt-desc">{m.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Mode-specific settings */}
            {outputMode === "cash" ? (
              <div className="zf-divider">
                <p className="zf-label">اختر الدولة أو الفتوى المعتمدة لقيمة الصاع:</p>
                <div className="zf-countries" role="group" aria-label="الدولة">
                  {countryCashRates.map((c) => {
                    const on = selectedCountryCode === c.code && !isCustomCashRate;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        aria-pressed={on}
                        onClick={() => handleCountryChange(c)}
                        className={`zf-opt${on ? " is-on" : ""}`}
                      >
                        <span className="zf-opt-top">
                          <span className="zf-code">{c.currency}</span>
                          {on && <CheckBadge />}
                        </span>
                        <span className="zf-opt-name">{c.country}</span>
                        <span className="zf-cval">
                          <bdi>{c.value} {c.currency}</bdi>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Cash rate input */}
                <div style={{ marginTop: 20 }}>
                  <div className="zf-rate-head">
                    <label className="zf-label" htmlFor={`${uid}-rate`}>
                      قيمة الفرد الواحد ({currency}):
                    </label>
                    <button type="button" className="zf-link" onClick={() => setIsCustomCashRate(!isCustomCashRate)}>
                      <Icon name={isCustomCashRate ? "globe" : "edit"} size={14} />
                      <span>{isCustomCashRate ? "استعادة القيم المعتمدة" : "تعديل القيمة يدوياً"}</span>
                    </button>
                  </div>
                  <div className="zf-inwrap">
                    <input
                      id={`${uid}-rate`}
                      type="number"
                      inputMode="decimal"
                      min="1"
                      step="any"
                      value={isCustomCashRate ? customCashInput : cashRatePerPerson}
                      onChange={(e) => {
                        setIsCustomCashRate(true);
                        setCustomCashInput(e.target.value);
                      }}
                      className="zf-input"
                    />
                    <span className="zf-suffix" aria-hidden="true">{currency}</span>
                  </div>
                  <p className="zf-note">
                    <Icon name="info" size={16} />
                    <span>{activeCountry.note}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="zf-divider">
                <p className="zf-label" id={`${uid}-food`}>اختر نوع طعام القوت لإخراج الصاع عيناً:</p>
                <div className="zf-foods" role="radiogroup" aria-labelledby={`${uid}-food`}>
                  {stapleFoodTypes.map((food) => {
                    const on = selectedFoodId === food.id;
                    return (
                      <label key={food.id} className={`zf-food${on ? " is-on" : ""}`}>
                        <input
                          type="radio"
                          name={`${uid}-foodType`}
                          checked={on}
                          onChange={() => setSelectedFoodId(food.id)}
                        />
                        <span className="zf-food-l">
                          <span className="zf-dot" aria-hidden="true">
                            {on && <Icon name="check" size={13} />}
                          </span>
                          <span>{food.name}</span>
                        </span>
                        <span className="zf-pill">الصاع ≈ {food.saWeightKg} كجم</span>
                      </label>
                    );
                  })}
                </div>
                <p className="zf-note">
                  <Icon name="info" size={16} />
                  <span>{activeFood.note}</span>
                </p>
              </div>
            )}
          </Section>

          {/* Family Members */}
          <Section icon="users" title="تحديد أفراد الأسرة والمُعالين">
            <p className="zf-sub">
              تجب زكاة الفطر على المسلم عن نفسه وعمن تلزمه نفقته الشرعية وقت غروب شمس ليلة العيد.
            </p>

            <div style={{ display: "grid", gap: 12 }}>
              <label className={`zf-self${selfIncluded ? " is-on" : ""}`}>
                <input
                  type="checkbox"
                  checked={selfIncluded}
                  onChange={(e) => setSelfIncluded(e.target.checked)}
                />
                <span className="zf-self-l">
                  <Icon name="user" size={18} />
                  <span>صاحب الزكاة (نفسك)</span>
                </span>
                <span className="zf-switch" aria-hidden="true" />
              </label>

              <div className="zf-members">
                <NumberSelector label="الزوجة / الزوجات" value={wivesCount} onChange={setWivesCount} icon="heart" />
                <NumberSelector label="الوالدان المعالان" value={parentsCount} onChange={setParentsCount} icon="users" />
                <NumberSelector label="الأبناء (الذكور)" value={sonsCount} onChange={setSonsCount} icon="user" />
                <NumberSelector label="البنات (الإناث)" value={daughtersCount} onChange={setDaughtersCount} icon="user" />
                <NumberSelector label="العمالة / المكفولين (تبرعاً)" value={workersCount} onChange={setWorkersCount} icon="briefcase" />
                <NumberSelector label="الجنين في البطن (مستحبة)" value={unbornCount} onChange={setUnbornCount} icon="sprout" />
              </div>
            </div>
          </Section>

          {/* Mobile summary bar */}
          <div className="zf-mini" role="status">
            <div className="zf-mini-l">
              <span className="zf-mini-k">الإجمالي · {calculation.obligIndividuals} أفراد</span>
              <span className="zf-mini-v"><bdi>{mainValue}</bdi></span>
            </div>
            <a className="zf-mini-a" href={`#${resultsId}`}>
              <span>التفاصيل</span>
              <Icon name="arrow" size={16} />
            </a>
          </div>
        </div>

        {/* ── Results ────────────────────────────────────────────────────────── */}
        <aside className="zf-col zf-aside" aria-label="النتيجة">
          <div className="zf-result" id={resultsId}>
            <span className="zf-rtag">النتيجة الشرعية</span>
            <p className="zf-rlabel">
              {outputMode === "cash"
                ? "المبلغ الإجمالي الواجب إخراجه نقداً"
                : `إجمالي وزن الحبوب المطلوبة (${activeFood.name})`}
            </p>
            <p className="zf-rvalue" key={`${mainValue}-${outputMode}`}>
              <bdi>{mainValue}</bdi>
            </p>
            <p className="zf-rpill">
              <Icon name="scale" size={16} />
              <span>
                المقدار الشرعي: {calculation.totalSaObligatory} صاع نبوي ({calculation.obligIndividuals} أفراد)
              </span>
            </p>

            {calculation.voluntaryIndividuals > 0 && (
              <p className="zf-rvol">
                + يشمل إضافة الجنين استحباباً:{" "}
                <bdi>
                  {outputMode === "cash"
                    ? `${formatNumber(calculation.totalCashWithVoluntary, 2)} ${currency}`
                    : `${formatNumber(calculation.totalKgWithVoluntary)} كجم (${calculation.totalSaWithVoluntary} صاع)`}
                </bdi>
              </p>
            )}
          </div>

          <section className="zf-box">
            <div className="zf-head-row">
              <h2 className="zf-h2">
                <span className="zf-tile" aria-hidden="true">
                  <Icon name="receipt" />
                </span>
                <span>تفصيل الحساب</span>
              </h2>
              <button type="button" className="zf-copy zf-noprint" onClick={handleCopy}>
                <Icon name={copied ? "check" : "copy"} size={16} />
                <span>{copied ? "تم النسخ!" : "نسخ التقرير"}</span>
              </button>
            </div>
            <p className="zf-sr" role="status">{copied ? "تم نسخ التقرير" : ""}</p>

            <dl className="zf-rows">
              <div className="zf-row">
                <dt>عدد الأفراد الواجب إخراجها عنهم:</dt>
                <dd>{calculation.obligIndividuals} أفراد</dd>
              </div>

              <div className="zf-row">
                <dt>المقدار الواجب للشخص الواحد:</dt>
                <dd>
                  <bdi>
                    {outputMode === "cash"
                      ? `${calculation.rate} ${currency} (صاع)`
                      : `صاع نبوي (≈ ${calculation.kgPerPerson} كجم ${activeFood.name})`}
                  </bdi>
                </dd>
              </div>

              {calculation.voluntaryIndividuals > 0 && (
                <div className="zf-row">
                  <dt>الأجنة في البطن (مستحبة كفعل عثمان رضي الله عنه):</dt>
                  <dd>{calculation.voluntaryIndividuals} أجنة ({calculation.voluntaryIndividuals} صاع)</dd>
                </div>
              )}

              <div className="zf-row is-total">
                <dt>إجمالي الأصوع النبوية الواجبة:</dt>
                <dd>{calculation.totalSaObligatory} صاع</dd>
              </div>
            </dl>

            <div className="zf-tip">
              <h3 className="zf-tip-title">
                <Icon name="clock" size={18} />
                <span>توقيت إخراج زكاة الفطر المشروع:</span>
              </h3>
              <p>
                <strong>أفضل وقت:</strong> صباح يوم العيد قبل الخروج لصلاة العيد.
              </p>
              <p>
                <strong>وقت الجواز:</strong> يجوز إخراجها قبل العيد بيوم أو يومين (يوم 28 أو 29 رمضان) لتصل إلى الفقراء في وقتها المناسب.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}