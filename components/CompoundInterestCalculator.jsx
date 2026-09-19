"use client";

import { useState, useMemo } from "react";

const FREQUENCIES = [
  { id: "daily",     name: "يومياً",         n: 365 },
  { id: "monthly",   name: "شهرياً",         n: 12  },
  { id: "quarterly", name: "ربع سنوي",       n: 4   },
  { id: "semi",      name: "نصف سنوي",       n: 2   },
  { id: "annually",  name: "سنوياً",         n: 1   },
];

const CURRENCIES = [
  { id: "sar", symbol: "ر.س", name: "ريال سعودي" },
  { id: "aed", symbol: "د.إ", name: "درهم إماراتي" },
  { id: "usd", symbol: "$",   name: "دولار أمريكي" },
  { id: "gbp", symbol: "£",   name: "جنيه إسترليني" },
  { id: "eur", symbol: "€",   name: "يورو" },
  { id: "egp", symbol: "ج.م", name: "جنيه مصري" },
  { id: "pkr", symbol: "₨",   name: "روبية باكستانية" },
];

const PRESETS = [
  { label: "توفير طارئ", principal: 10000, rate: 4,   years: 5,  contrib: 500,  freq: "monthly"  },
  { label: "تقاعد 20 سنة", principal: 50000, rate: 7,  years: 20, contrib: 1000, freq: "monthly"  },
  { label: "تعليم الأبناء", principal: 20000, rate: 5, years: 15, contrib: 800,  freq: "monthly"  },
  { label: "استثمار قصير", principal: 100000,rate: 6,  years: 3,  contrib: 0,    freq: "quarterly"},
];

function fmt(n, sym) {
  return `${sym} ${Math.round(n).toLocaleString("ar-EG")}`;
}

function buildYearlyTable(principal, rate, freqN, years, monthlyContrib) {
  const r = rate / 100 / freqN;
  const contribPerPeriod = monthlyContrib * (12 / freqN);
  const rows = [];
  let balance = principal;
  let totalContribs = principal;
  for (let y = 1; y <= years; y++) {
    const startBal = balance;
    for (let p = 0; p < freqN; p++) {
      balance = balance * (1 + r) + contribPerPeriod;
      totalContribs += contribPerPeriod;
    }
    const interest = balance - totalContribs;
    rows.push({ year: y, balance, totalContribs, totalInterest: interest });
  }
  return rows;
}

export default function CompoundInterestCalculator() {
  const [currencyId,   setCurrencyId]   = useState("sar");
  const [principal,    setPrincipal]    = useState(10000);
  const [rate,         setRate]         = useState(6);
  const [years,        setYears]        = useState(10);
  const [freqId,       setFreqId]       = useState("monthly");
  const [monthlyContrib, setMonthlyContrib] = useState(500);
  const [showTable,    setShowTable]    = useState(false);
  const [compareMode,  setCompareMode]  = useState(false);
  const [rate2,        setRate2]        = useState(8);

  const currency = CURRENCIES.find((c) => c.id === currencyId);
  const freq = FREQUENCIES.find((f) => f.id === freqId);
  const sym = currency?.symbol || "ر.س";

  const loadPreset = (p) => {
    setPrincipal(p.principal);
    setRate(p.rate);
    setYears(p.years);
    setMonthlyContrib(p.contrib);
    setFreqId(p.freq);
  };

  const result = useMemo(() => {
    if (!freq) return null;
    const p = Number(principal);
    const r = Number(rate) / 100 / freq.n;
    const n = Number(years) * freq.n;
    const mc = Number(monthlyContrib) * (12 / freq.n);

    // FV = P*(1+r)^n + PMT * [((1+r)^n - 1) / r]
    const fvPrincipal = p * Math.pow(1 + r, n);
    const fvContribs  = mc > 0 && r > 0
      ? mc * ((Math.pow(1 + r, n) - 1) / r)
      : mc * n;
    const finalAmount = fvPrincipal + fvContribs;
    const totalInvested = p + mc * n;
    const totalInterest = finalAmount - totalInvested;
    const table = buildYearlyTable(p, Number(rate), freq.n, Number(years), Number(monthlyContrib));

    let result2 = null;
    if (compareMode) {
      const r2 = Number(rate2) / 100 / freq.n;
      const fvP2 = p * Math.pow(1 + r2, n);
      const fvC2 = mc > 0 && r2 > 0 ? mc * ((Math.pow(1 + r2, n) - 1) / r2) : mc * n;
      const final2 = fvP2 + fvC2;
      result2 = { finalAmount: final2, totalInterest: final2 - totalInvested };
    }

    return { finalAmount, totalInterest, totalInvested, table, result2 };
  }, [principal, rate, years, freqId, freq, monthlyContrib, compareMode, rate2]);

  const maxBalance = result ? Math.max(...result.table.map((r) => r.balance)) : 1;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12" dir="rtl">
      {/* Header */}
      <div className="mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-sm font-bold text-brand-dark">
          <span>📈</span><span>حاسبة الفائدة المركبة</span>
        </div>
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
          حاسبة الفائدة المركبة والنمو الاستثماري
        </h1>
        <p className="mx-auto max-w-xl text-sm text-ink-secondary sm:text-base">
          اكتشف قوة الفائدة المركبة — احسب نمو استثمارك مع المساهمات الشهرية على مدى السنوات.
        </p>
      </div>

      {/* Quick presets */}
      <div className="mb-6 flex flex-wrap gap-2 justify-center">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" onClick={() => loadPreset(p)}
            className="rounded-full border border-brand-border bg-white px-4 py-1.5 text-xs font-semibold text-ink-secondary hover:border-brand hover:bg-brand-light hover:text-brand-dark transition-all shadow-sm">
            ⚡ {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ─── Inputs ─── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Currency */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">💱</span>
              العملة
            </h2>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((c) => (
                <button key={c.id} type="button" onClick={() => setCurrencyId(c.id)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                    currencyId === c.id
                      ? "border-brand bg-brand-light text-brand-dark shadow-sm"
                      : "border-brand-border bg-brand-surface/40 text-ink-secondary hover:bg-white"
                  }`}>
                  {c.symbol} {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Principal + Rate + Years */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">💵</span>
              إعدادات الاستثمار
            </h2>

            {/* Principal */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-secondary">رأس المال الابتدائي ({sym})</label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
                <input type="number" min="0" value={principal} onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-3 pr-10 pl-4 text-base font-extrabold text-ink focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20" />
              </div>
            </div>

            {/* Monthly contribution */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-ink-secondary">مساهمة شهرية إضافية ({sym})</label>
                <span className="text-xs text-ink-muted">اختياري</span>
              </div>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
                <input type="number" min="0" value={monthlyContrib} onChange={(e) => setMonthlyContrib(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2.5 pr-10 pl-4 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none" />
              </div>
            </div>

            {/* Rate */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-ink-secondary">معدل الفائدة / العائد السنوي</label>
                <span className="text-sm font-extrabold text-brand">{rate}٪</span>
              </div>
              <input type="range" min="0.5" max="30" step="0.5" value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full accent-brand cursor-pointer" />
              <div className="flex justify-between text-[10px] text-ink-muted">
                <span>0.5٪ (توفير)</span><span>7٪ (استثمار)</span><span>30٪ (مخاطر عالية)</span>
              </div>
            </div>

            {/* Years */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-ink-secondary">مدة الاستثمار</label>
                <span className="text-sm font-extrabold text-brand">{years} سنة</span>
              </div>
              <input type="range" min="1" max="50" step="1" value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full accent-brand cursor-pointer" />
              <div className="flex justify-between text-[10px] text-ink-muted">
                <span>1 سنة</span><span>25 سنة</span><span>50 سنة</span>
              </div>
            </div>
          </div>

          {/* Compounding frequency */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">🔄</span>
              تكرار الاحتساب (Compounding)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {FREQUENCIES.map((f) => (
                <button key={f.id} type="button" onClick={() => setFreqId(f.id)}
                  className={`rounded-xl border p-2.5 text-xs font-semibold text-center transition-all ${
                    freqId === f.id
                      ? "border-brand bg-brand-light text-brand-dark shadow-sm"
                      : "border-brand-border bg-brand-surface/40 text-ink-secondary hover:bg-white"
                  }`}>
                  {f.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-muted">الاحتساب الشهري أعطى نتائج أعلى من السنوي عند نفس المعدل</p>
          </div>

          {/* Compare mode */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">⚖️</span>
                مقارنة معدلين مختلفين
              </h2>
              <button type="button" onClick={() => setCompareMode(!compareMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${compareMode ? "bg-brand" : "bg-gray-200"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${compareMode ? "-translate-x-6" : "-translate-x-1"}`} />
              </button>
            </div>
            {compareMode && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold text-ink-secondary">المعدل الثاني للمقارنة</label>
                  <span className="text-sm font-extrabold text-accent">{rate2}٪</span>
                </div>
                <input type="range" min="0.5" max="30" step="0.5" value={rate2}
                  onChange={(e) => setRate2(e.target.value)}
                  className="w-full accent-accent cursor-pointer" />
              </div>
            )}
          </div>
        </div>

        {/* ─── Results ─── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">

            {/* Hero card */}
            <div className="rounded-2xl bg-hero-gradient p-6 text-white shadow-lg space-y-3">
              <p className="text-sm font-medium opacity-80">القيمة النهائية بعد {years} سنة</p>
              <p className="text-4xl font-extrabold tracking-tight">
                {result ? fmt(result.finalAmount, sym) : "—"}
              </p>
              {result && (
                <>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                      <p className="text-[10px] opacity-80">إجمالي المُستثمَر</p>
                      <p className="text-sm font-bold">{fmt(result.totalInvested, sym)}</p>
                    </div>
                    <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                      <p className="text-[10px] opacity-80">الأرباح المركبة</p>
                      <p className="text-sm font-bold">{fmt(result.totalInterest, sym)}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs opacity-80">
                      <span>رأس المال</span>
                      <span>الأرباح {((result.totalInterest / result.finalAmount) * 100).toFixed(1)}٪</span>
                    </div>
                    <div className="h-2.5 flex rounded-full overflow-hidden bg-white/20">
                      <div className="bg-white/90"
                        style={{ width: `${(result.totalInvested / result.finalAmount) * 100}%` }} />
                      <div className="bg-accent flex-1" />
                    </div>
                  </div>
                  {compareMode && result.result2 && (
                    <div className="mt-3 rounded-xl border border-white/20 bg-white/10 p-3 space-y-1">
                      <p className="text-xs font-bold opacity-90">⚖️ مقارنة عند {rate2}٪</p>
                      <p className="text-xl font-extrabold">{fmt(result.result2.finalAmount, sym)}</p>
                      <p className="text-xs opacity-80">
                        فرق: {fmt(Math.abs(result.result2.finalAmount - result.finalAmount), sym)}
                        {result.result2.finalAmount > result.finalAmount ? " ✅ أعلى" : " ⬇️ أقل"}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Multiplier */}
            {result && (
              <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card text-center space-y-2">
                <p className="text-xs text-ink-muted">معامل التضاعف</p>
                <p className="text-4xl font-extrabold text-brand">
                  ×{(result.finalAmount / Number(principal)).toFixed(2)}
                </p>
                <p className="text-xs text-ink-muted">
                  كل ريال استثمرته أصبح{" "}
                  <span className="font-bold text-brand">
                    {(result.finalAmount / Number(principal)).toFixed(2)} ريال
                  </span>
                </p>
                <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900">
                  <span className="font-bold">قاعدة 72: </span>
                  يتضاعف رأس المال كل{" "}
                  <span className="font-bold">{(72 / Number(rate)).toFixed(1)} سنة</span>
                  {" "}عند معدل {rate}٪
                </div>
              </div>
            )}

            {/* Summary breakdown */}
            {result && (
              <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-2">
                <h3 className="text-sm font-bold text-ink">تفصيل المكونات</h3>
                {[
                  { label: "رأس المال الابتدائي", value: Number(principal), color: "bg-brand" },
                  { label: "مجموع المساهمات الشهرية", value: result.totalInvested - Number(principal), color: "bg-brand-300" },
                  { label: "الأرباح المركبة", value: result.totalInterest, color: "bg-accent" },
                ].filter(item => item.value > 0).map((item) => (
                  <div key={item.label} className="space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-secondary">{item.label}</span>
                      <span className="font-bold text-ink">{fmt(item.value, sym)}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-surface">
                      <div className={`h-full rounded-full ${item.color} transition-all`}
                        style={{ width: `${(item.value / result.finalAmount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Growth Chart (visual bars) */}
      {result && (
        <div className="mt-10 rounded-2xl border border-brand-border bg-white p-5 sm:p-6 shadow-card space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold text-ink">📊 مخطط النمو السنوي</h3>
            <button type="button" onClick={() => setShowTable(!showTable)}
              className="rounded-xl border border-brand-border bg-brand-surface/40 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-white transition-colors">
              {showTable ? "إخفاء الجدول" : "عرض الجدول التفصيلي"}
            </button>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-1 h-40 overflow-x-auto pb-6 relative">
            {/* Y-axis label */}
            <div className="absolute right-0 top-0 text-[9px] text-ink-muted">{fmt(maxBalance, sym)}</div>
            {result.table.map((row) => {
              const investedPct = (row.totalContribs / maxBalance) * 100;
              const totalPct    = (row.balance / maxBalance) * 100;
              return (
                <div key={row.year} className="flex flex-col items-center gap-0.5 flex-1 min-w-[18px] group relative">
                  <div className="relative w-full flex flex-col justify-end" style={{ height: "128px" }}>
                    {/* Interest portion */}
                    <div className="w-full rounded-t-sm bg-accent transition-all"
                      style={{ height: `${Math.max(0, totalPct - investedPct) * 1.28}px` }} />
                    {/* Invested portion */}
                    <div className="w-full bg-brand transition-all"
                      style={{ height: `${Math.min(investedPct, totalPct) * 1.28}px` }} />
                  </div>
                  <span className="text-[9px] text-ink-muted">{row.year}</span>
                  {/* Tooltip */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-ink text-white text-[10px] rounded-lg px-2 py-1.5 whitespace-nowrap shadow-lg">
                    <p className="font-bold">{fmt(row.balance, sym)}</p>
                    <p className="opacity-80">سنة {row.year}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-brand" />رأس المال والمساهمات</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-accent" />الأرباح المركبة</span>
          </div>

          {/* Detailed table */}
          {showTable && (
            <div className="overflow-x-auto rounded-xl border border-brand-border mt-4">
              <table className="w-full text-xs">
                <thead className="bg-brand-surface/60">
                  <tr>
                    <th className="p-3 text-right font-bold text-ink-secondary">السنة</th>
                    <th className="p-3 text-right font-bold text-ink-secondary">إجمالي المُستثمَر</th>
                    <th className="p-3 text-right font-bold text-ink-secondary">الأرباح المتراكمة</th>
                    <th className="p-3 text-right font-bold text-ink-secondary">القيمة الكلية</th>
                    <th className="p-3 text-right font-bold text-ink-secondary">نسبة النمو</th>
                  </tr>
                </thead>
                <tbody>
                  {result.table.map((row, idx) => (
                    <tr key={idx} className={`border-t border-brand-border/40 ${idx % 2 === 0 ? "bg-white" : "bg-brand-surface/20"}`}>
                      <td className="p-3 font-bold text-ink">{row.year}</td>
                      <td className="p-3 text-ink-secondary">{fmt(row.totalContribs, sym)}</td>
                      <td className="p-3 text-accent font-semibold">{fmt(row.totalInterest, sym)}</td>
                      <td className="p-3 font-extrabold text-brand">{fmt(row.balance, sym)}</td>
                      <td className="p-3 font-semibold text-green-700">
                        +{(((row.balance - Number(principal)) / Number(principal)) * 100).toFixed(1)}٪
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-ink-muted">
        ⚠️ هذه حسابات نظرية افتراضية بمعدل ثابت. العوائد الفعلية تتفاوت مع السوق والضرائب والتضخم. تذكر أن الفائدة المركبة محرمة شرعياً في المعاملات الإسلامية — استخدم هذه الأداة لتقدير عوائد الاستثمارات الحلال كالأسهم والصناديق الشرعية.
      </p>
    </div>
  );
}