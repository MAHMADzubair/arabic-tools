"use client";

import { useState, useCallback } from "react";

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

function convert(amount, from, to) {
  if (!amount || isNaN(amount)) return "";
  const inUSD = parseFloat(amount) / FIXED_RATES[from];
  return (inUSD * FIXED_RATES[to]).toFixed(4);
}

function fmt(val, decimals = 4) {
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return n.toLocaleString("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

function getCurrencyInfo(code) {
  return currencies.find((c) => c.code === code) || { code, label: code, flag: "" };
}

export default function CurrencyConverter() {
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
    <div className="mx-auto max-w-lg">
      {/* Page header */}
      <div className="mb-6 rounded-2xl bg-hero-gradient p-6 text-white shadow-result">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-2xl">💱</span>
          <h1 className="text-2xl font-extrabold">محول العملات</h1>
        </div>
        <p className="text-sm text-white/80">
          حوّل بين العملات العربية والعالمية فوراً — أسعار تقديرية
        </p>
      </div>

      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card sm:p-7">
        {/* Quick pairs */}
        <div className="mb-5 flex flex-wrap gap-2">
          {QUICK_PAIRS.map((pair) => (
            <button
              key={`${pair.from}-${pair.to}`}
              onClick={() => { setFrom(pair.from); setTo(pair.to); }}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition active:scale-95 ${
                from === pair.from && to === pair.to
                  ? "border-brand bg-brand text-white shadow-sm"
                  : "border-brand-border bg-brand-light text-brand hover:border-brand hover:bg-brand hover:text-white"
              }`}
            >
              {pair.from} ⇄ {pair.to}
            </button>
          ))}
        </div>

        {/* Converter card */}
        <div className="rounded-xl border border-brand-border bg-surface-secondary p-4 sm:p-5">
          {/* Amount */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-ink-muted">
              المبلغ
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="أدخل المبلغ"
              className="input w-full text-right text-xl font-bold"
            />
          </div>

          {/* From / Swap / To */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-ink-muted">من</label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="input w-full font-semibold"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap */}
            <button
              onClick={swap}
              className="mb-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-brand-border bg-white text-lg text-brand shadow-card transition hover:bg-brand hover:text-white active:scale-90"
              title="تبديل"
            >
              ⇄
            </button>

            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-ink-muted">إلى</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="input w-full font-semibold"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="mt-4 rounded-xl bg-hero-gradient p-5 text-center text-white shadow-result">
          <p className="mb-1 text-sm opacity-75">
            {amount || "1"} {fromInfo.flag} {from} =
          </p>
          <p className="text-4xl font-extrabold">{result ? fmt(result, 4) : "—"}</p>
          <p className="mt-1 text-sm opacity-80">
            {toInfo.flag} {to} — {toInfo.label}
          </p>
        </div>

        {/* Rate row */}
        {rate && (
          <div className="mt-3 flex flex-col gap-1 rounded-xl border border-brand-border bg-brand-light px-4 py-3 text-xs text-ink-secondary sm:flex-row sm:justify-between">
            <span>١ {from} = {fmt(rate, 4)} {to}</span>
            <span>١ {to} = {fmt(reverseRate, 4)} {from}</span>
          </div>
        )}

        {/* All currencies table */}
        {amount && parseFloat(amount) > 0 && (
          <div className="mt-5 overflow-hidden rounded-xl border border-brand-border">
            <div className="bg-hero-gradient px-4 py-2.5 text-sm font-bold text-white">
              {fmt(amount, 2)} {fromInfo.flag} {from} يساوي
            </div>
            <div className="divide-y divide-brand-border">
              {allResults.map((c) => (
                <div
                  key={c.code}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm transition ${
                    c.code === to ? "bg-brand-light font-bold text-brand" : "bg-white text-ink"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span>{c.label}</span>
                    <span className="text-xs text-ink-muted">({c.code})</span>
                  </span>
                  <span className="tabular-nums font-semibold">{fmt(c.converted, 3)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-5 text-[11px] leading-relaxed text-ink-muted">
          الأسعار المعروضة تقديرية وثابتة. للمعاملات المالية يُرجى مراجعة مزود الخدمة المالية.
        </p>
      </div>
    </div>
  );
}
