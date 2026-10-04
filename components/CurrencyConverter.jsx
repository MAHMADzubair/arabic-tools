"use client";

import { useState, useCallback, useId } from "react";

// ⚠️ Fixed, hand-entered rates. Review them before publishing (see notes).
const FIXED_RATES = {
  USD: 1, SAR: 3.75, AED: 3.6725, EUR: 0.92, GBP: 0.79,
  PKR: 278.5, EGP: 48.5, KWD: 0.307, QAR: 3.64,
  BHD: 0.376, OMR: 0.385, JOD: 0.709,
};

const currencies = [
  { code: "USD", label: "دولار أمريكي", flag: "🇺🇸" },
  { code: "SAR", label: "ريال سعودي", flag: "🇸🇦" },
  { code: "AED", label: "درهم إماراتي", flag: "🇦🇪" },
  { code: "EUR", label: "يورو", flag: "🇪🇺" },
  { code: "GBP", label: "جنيه إسترليني", flag: "🇬🇧" },
  { code: "PKR", label: "روبية باكستانية", flag: "🇵🇰" },
  { code: "EGP", label: "جنيه مصري", flag: "🇪🇬" },
  { code: "KWD", label: "دينار كويتي", flag: "🇰🇼" },
  { code: "QAR", label: "ريال قطري", flag: "🇶🇦" },
  { code: "BHD", label: "دينار بحريني", flag: "🇧🇭" },
  { code: "OMR", label: "ريال عماني", flag: "🇴🇲" },
  { code: "JOD", label: "دينار أردني", flag: "🇯🇴" },
];

const QUICK_PAIRS = [
  { from: "USD", to: "SAR" },
  { from: "USD", to: "AED" },
  { from: "SAR", to: "AED" },
  { from: "EUR", to: "SAR" },
  { from: "GBP", to: "AED" },
  { from: "USD", to: "PKR" },
];

// ─── Logic (unchanged) ───────────────────────────────────────────────────────
function convert(amount, from, to) {
  if (!amount || isNaN(amount)) return "";
  const inUSD = parseFloat(amount) / FIXED_RATES[from];
  return (inUSD * FIXED_RATES[to]).toFixed(4);
}

// Western digits (9,000.00). For Arabic-Hindi digits change "en-US" to "ar-EG".
function fmt(val, decimals = 4) {
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

function getCurrencyInfo(code) {
  return currencies.find((c) => c.code === code) || { code, label: code, flag: "" };
}

export default function CurrencyConverter() {
  const uid = useId();
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("SAR");

  const result = convert(amount, from, to);
  const rate = convert(1, from, to);
  const reverseRate = convert(1, to, from);

  const swap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to]);

  const fromInfo = getCurrencyInfo(from);
  const toInfo = getCurrencyInfo(to);

  const allResults = currencies
    .filter((c) => c.code !== from)
    .map((c) => ({ ...c, converted: convert(amount || 1, from, c.code) }));

  return (
    <div className="cc">
      <style>{CSS}</style>

      {/* Header */}
      <header className="cc-head">
        <h1 className="cc-title">محول العملات</h1>
        <p className="cc-sub">حوّل بين العملات العربية والعالمية فوراً — أسعار تقديرية</p>
      </header>

      <div className="cc-card">
        {/* Quick pairs */}
        <div className="cc-chips" role="group" aria-label="أزواج سريعة">
          {QUICK_PAIRS.map((pair) => {
            const active = from === pair.from && to === pair.to;
            return (
              <button
                key={`${pair.from}-${pair.to}`}
                type="button"
                aria-pressed={active}
                onClick={() => { setFrom(pair.from); setTo(pair.to); }}
                className="cc-chip"
              >
                <span className="cc-num">{pair.from} ⇄ {pair.to}</span>
              </button>
            );
          })}
        </div>

        {/* Inputs */}
        <div className="cc-box">
          <div className="cc-field">
            <label className="cc-label" htmlFor={`${uid}-amount`}>المبلغ</label>
            <input
              id={`${uid}-amount`}
              type="number"
              inputMode="decimal"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="أدخل المبلغ"
              className="cc-input cc-input--lg cc-num"
            />
          </div>

          <div className="cc-pair">
            <div className="cc-field">
              <label className="cc-label" htmlFor={`${uid}-from`}>من</label>
              <select id={`${uid}-from`} value={from} onChange={(e) => setFrom(e.target.value)} className="cc-input">
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.label}</option>
                ))}
              </select>
            </div>

            <button type="button" onClick={swap} className="cc-swap" aria-label="تبديل العملتين" title="تبديل">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 4v14M7 4 3 8M7 4l4 4" />
                <path d="M17 20V6M17 20l-4-4M17 20l4-4" />
              </svg>
            </button>

            <div className="cc-field">
              <label className="cc-label" htmlFor={`${uid}-to`}>إلى</label>
              <select id={`${uid}-to`} value={to} onChange={(e) => setTo(e.target.value)} className="cc-input">
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Result: the one orange moment */}
        <section className="cc-result" aria-live="polite" aria-label="النتيجة">
          <p className="cc-result-top">
            <span className="cc-num">{amount || "1"} {fromInfo.flag} {from}</span> =
          </p>
          <p className="cc-big cc-num">{result ? fmt(result, 4) : "—"}</p>
          <p className="cc-result-bot">
            {toInfo.flag} <span className="cc-num">{to}</span> — {toInfo.label}
          </p>
        </section>

        {/* Rate row */}
        {rate && (
          <p className="cc-rates">
            <span className="cc-num">1 {from} = {fmt(rate, 4)} {to}</span>
            <span className="cc-num">1 {to} = {fmt(reverseRate, 4)} {from}</span>
          </p>
        )}

        {/* All currencies */}
        {amount && parseFloat(amount) > 0 && (
          <section className="cc-list" aria-label="التحويل إلى كل العملات">
            <h2 className="cc-list-head">
              <span className="cc-num">{fmt(amount, 2)} {fromInfo.flag} {from}</span> يساوي
            </h2>
            <ul className="cc-rows">
              {allResults.map((c) => (
                <li key={c.code} className={`cc-row${c.code === to ? " is-active" : ""}`}>
                  <span className="cc-name">
                    <span aria-hidden="true">{c.flag}</span>
                    <span>{c.label}</span>
                    <span className="cc-code cc-num">({c.code})</span>
                  </span>
                  <span className="cc-amt cc-num">{fmt(c.converted, 3)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="cc-note">
          الأسعار المعروضة تقديرية وثابتة. للمعاملات المالية يُرجى مراجعة مزود الخدمة المالية.
        </p>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
// Colours come from --c-* on .cc. If your tokens.css already defines the
// underlying names, delete the fallback values and map them in one place.
const CSS = `
.cc {
  --c-surface: var(--surface, #FFFFFF);
  --c-ink: var(--ink, #0D0D0D);
  --c-ink-soft: var(--ink-soft, #4A4A46);
  --c-line: var(--line, #D9D9D3);
  --c-signal: var(--signal, #FF6A1A);
  --c-on-ink: var(--on-ink, #FFFFFF);
  --c-on-signal: var(--on-signal, #0D0D0D);

  max-width: 32rem;
  margin-inline: auto;
  color: var(--c-ink);
  font-family: inherit;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .cc {
    --c-surface: var(--surface, #181816);
    --c-ink: var(--ink, #F5F5F2);
    --c-ink-soft: var(--ink-soft, #B4B4AD);
    --c-line: var(--line, #34342F);
    --c-on-ink: var(--on-ink, #0D0D0D);
  }
}
:root[data-theme="dark"] .cc {
  --c-surface: var(--surface, #181816);
  --c-ink: var(--ink, #F5F5F2);
  --c-ink-soft: var(--ink-soft, #B4B4AD);
  --c-line: var(--line, #34342F);
  --c-on-ink: var(--on-ink, #0D0D0D);
}
.cc *, .cc *::before, .cc *::after { box-sizing: border-box; }

.cc-head { margin-block-end: 1.25rem; padding-inline-start: 0.9rem; border-inline-start: 4px solid var(--c-ink); }
.cc-title { margin: 0; font-size: 1.6rem; font-weight: 800; line-height: 1.3; }
.cc-sub { margin: 0.4rem 0 0; font-size: 0.9rem; line-height: 1.7; color: var(--c-ink-soft); }

.cc-card { display: grid; gap: 1.1rem; padding: 1.25rem; background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 14px; }
@media (min-width: 640px) { .cc-card { padding: 1.75rem; } }

.cc-num { direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; }
input.cc-num { text-align: center; }

/* Quick pairs */
.cc-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.cc-chip {
  min-height: 40px; padding: 0.3rem 0.85rem; font: inherit; font-size: 0.8rem; font-weight: 700;
  color: var(--c-ink); background: var(--c-surface); border: 2px solid var(--c-line); border-radius: 999px; cursor: pointer;
  transition: background-color .15s, color .15s, border-color .15s;
}
.cc-chip:hover { border-color: var(--c-ink); }
.cc-chip[aria-pressed="true"] { color: var(--c-on-ink); background: var(--c-ink); border-color: var(--c-ink); }

/* Inputs */
.cc-box { display: grid; gap: 1rem; padding: 1rem; border: 1px solid var(--c-line); border-radius: 12px; }
.cc-field { display: grid; gap: 0.4rem; min-width: 0; }
.cc-label { font-size: 0.82rem; font-weight: 700; }
.cc-input {
  width: 100%; min-height: 46px; padding: 0.5rem 0.75rem; font: inherit; font-size: 0.95rem; font-weight: 600;
  color: var(--c-ink); background: var(--c-surface); border: 2px solid var(--c-line); border-radius: 10px;
}
.cc-input--lg { min-height: 54px; font-size: 1.4rem; font-weight: 800; }
.cc-input:hover { border-color: var(--c-ink-soft); }

.cc-pair { display: grid; gap: 0.75rem; align-items: end; }
@media (min-width: 480px) { .cc-pair { grid-template-columns: 1fr auto 1fr; } }
.cc-swap {
  display: grid; place-items: center; width: 46px; height: 46px; justify-self: center; padding: 0;
  color: var(--c-on-ink); background: var(--c-ink); border: 2px solid var(--c-ink); border-radius: 50%; cursor: pointer;
  transition: background-color .15s, color .15s;
}
.cc-swap:hover { background: var(--c-signal); color: var(--c-on-signal); }
@media (max-width: 479px) { .cc-swap svg { transform: rotate(90deg); } }

/* Result: orange is a background only, text stays ink */
.cc-result { padding: 1.25rem; text-align: center; background: var(--c-signal); color: var(--c-on-signal); border-radius: 14px; }
.cc-result-top { margin: 0; font-size: 0.9rem; font-weight: 700; }
.cc-big { margin: 0.2rem 0; font-size: 2.4rem; font-weight: 800; line-height: 1.25; overflow-wrap: anywhere; }
.cc-result-bot { margin: 0; font-size: 0.9rem; font-weight: 700; }

.cc-rates { display: flex; flex-direction: column; gap: 0.25rem; margin: 0; padding: 0.7rem 1rem; font-size: 0.82rem; font-weight: 600; border: 2px solid var(--c-line); border-radius: 10px; }
@media (min-width: 480px) { .cc-rates { flex-direction: row; justify-content: space-between; } }

/* List */
.cc-list { border: 1px solid var(--c-line); border-radius: 12px; overflow: hidden; }
.cc-list-head { margin: 0; padding: 0.7rem 1rem; font-size: 0.9rem; font-weight: 800; color: var(--c-on-ink); background: var(--c-ink); }
.cc-rows { margin: 0; padding: 0; list-style: none; }
.cc-row { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; padding: 0.65rem 1rem; font-size: 0.88rem; border-block-start: 1px solid var(--c-line); }
.cc-row:first-child { border-block-start: 0; }
.cc-row.is-active { background: var(--c-signal); color: var(--c-on-signal); font-weight: 800; border-block-start-color: var(--c-ink); }
.cc-name { display: flex; align-items: center; gap: 0.5rem; min-width: 0; }
.cc-code { font-size: 0.75rem; color: var(--c-ink-soft); }
.cc-row.is-active .cc-code { color: inherit; }
.cc-amt { font-weight: 700; white-space: nowrap; }

.cc-note { margin: 0; padding-inline-start: 0.7rem; border-inline-start: 2px solid var(--c-line); font-size: 0.78rem; line-height: 1.8; color: var(--c-ink-soft); }

/* Focus + motion */
.cc button:focus-visible, .cc input:focus-visible, .cc select:focus-visible {
  outline: 3px solid var(--c-signal); outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) { .cc * { transition: none !important; } }
`;