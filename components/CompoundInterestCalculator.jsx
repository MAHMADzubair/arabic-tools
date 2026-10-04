"use client";

import { useState, useMemo, useId } from "react";

const FREQUENCIES = [
  { id: "daily",     name: "يومياً",   n: 365 },
  { id: "monthly",   name: "شهرياً",   n: 12  },
  { id: "quarterly", name: "ربع سنوي", n: 4   },
  { id: "semi",      name: "نصف سنوي", n: 2   },
  { id: "annually",  name: "سنوياً",   n: 1   },
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
  { label: "توفير طارئ",    principal: 10000,  rate: 4, years: 5,  contrib: 500,  freq: "monthly"   },
  { label: "تقاعد 20 سنة",  principal: 50000,  rate: 7, years: 20, contrib: 1000, freq: "monthly"   },
  { label: "تعليم الأبناء", principal: 20000,  rate: 5, years: 15, contrib: 800,  freq: "monthly"   },
  { label: "استثمار قصير",  principal: 100000, rate: 6, years: 3,  contrib: 0,    freq: "quarterly" },
];

// Western digits (9,000). For Arabic-Hindi digits change "en-US" to "ar-EG".
const num = (n) => Math.round(n).toLocaleString("en-US");

function Money({ v, sym }) {
  return (
    <>
      <span className="ci-num">{num(v)}</span> <span>{sym}</span>
    </>
  );
}

// ─── Calculation helper (unchanged) ──────────────────────────────────────────
function buildYearlyTable(principal, rate, freqN, years, monthlyContrib) {
  const r = rate / 100 / freqN;
  const contribPerPeriod = monthlyContrib * (12 / freqN);
  const rows = [];
  let balance = principal;
  let totalContribs = principal;
  for (let y = 1; y <= years; y++) {
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
  const uid = useId();
  const [currencyId, setCurrencyId] = useState("sar");
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(10);
  const [freqId, setFreqId] = useState("monthly");
  const [monthlyContrib, setMonthlyContrib] = useState(500);
  const [showTable, setShowTable] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [rate2, setRate2] = useState(8);

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

  // ─── Calculation (unchanged) ───────────────────────────────────────────────
  const result = useMemo(() => {
    if (!freq) return null;
    const p = Number(principal);
    const r = Number(rate) / 100 / freq.n;
    const n = Number(years) * freq.n;
    const mc = Number(monthlyContrib) * (12 / freq.n);

    const fvPrincipal = p * Math.pow(1 + r, n);
    const fvContribs = mc > 0 && r > 0 ? mc * ((Math.pow(1 + r, n) - 1) / r) : mc * n;
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
  const p0 = Number(principal);
  const hasPrincipal = p0 > 0;

  return (
    <div className="ci" dir="rtl">
      <style>{CSS}</style>

      {/* Header */}
      <header className="ci-head">
        <p className="ci-badge">حاسبة الفائدة المركبة</p>
        <h1 className="ci-title">حاسبة الفائدة المركبة والنمو الاستثماري</h1>
        <p className="ci-sub">
          اكتشف قوة الفائدة المركبة — احسب نمو استثمارك مع المساهمات الشهرية على مدى السنوات.
        </p>
      </header>

      {/* Presets */}
      <div className="ci-chips" role="group" aria-label="نماذج سريعة">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" onClick={() => loadPreset(p)} className="ci-chip">
            {p.label}
          </button>
        ))}
      </div>

      <div className="ci-cols">
        {/* ───────── Inputs ───────── */}
        <div className="ci-stack">
          {/* Currency */}
          <fieldset className="ci-card">
            <legend className="ci-h2">العملة</legend>
            <div className="ci-wrap" role="radiogroup" aria-label="العملة">
              {CURRENCIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={currencyId === c.id}
                  onClick={() => setCurrencyId(c.id)}
                  className="ci-opt"
                >
                  {c.symbol} {c.name}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Settings */}
          <fieldset className="ci-card">
            <legend className="ci-h2">إعدادات الاستثمار</legend>

            <div className="ci-field">
              <label className="ci-label" htmlFor={`${uid}-principal`}>رأس المال الابتدائي ({sym})</label>
              <input
                id={`${uid}-principal`}
                type="number"
                inputMode="decimal"
                min="0"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="ci-input ci-input--lg ci-num"
              />
            </div>

            <div className="ci-field">
              <div className="ci-line">
                <label className="ci-label" htmlFor={`${uid}-contrib`}>مساهمة شهرية إضافية ({sym})</label>
                <span className="ci-hint">اختياري</span>
              </div>
              <input
                id={`${uid}-contrib`}
                type="number"
                inputMode="decimal"
                min="0"
                value={monthlyContrib}
                onChange={(e) => setMonthlyContrib(e.target.value)}
                className="ci-input ci-num"
              />
            </div>

            <div className="ci-field">
              <div className="ci-line">
                <label className="ci-label" htmlFor={`${uid}-rate`}>معدل الفائدة / العائد السنوي</label>
                <output htmlFor={`${uid}-rate`} className="ci-val ci-num">{rate}%</output>
              </div>
              <input
                id={`${uid}-rate`}
                type="range"
                min="0.5"
                max="30"
                step="0.5"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="ci-range"
              />
              <div className="ci-scale"><span>0.5% (توفير)</span><span>7% (استثمار)</span><span>30% (مخاطر عالية)</span></div>
            </div>

            <div className="ci-field">
              <div className="ci-line">
                <label className="ci-label" htmlFor={`${uid}-years`}>مدة الاستثمار</label>
                <output htmlFor={`${uid}-years`} className="ci-val">{years} سنة</output>
              </div>
              <input
                id={`${uid}-years`}
                type="range"
                min="1"
                max="50"
                step="1"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="ci-range"
              />
              <div className="ci-scale"><span>1 سنة</span><span>25 سنة</span><span>50 سنة</span></div>
            </div>
          </fieldset>

          {/* Frequency */}
          <fieldset className="ci-card">
            <legend className="ci-h2">تكرار الاحتساب (Compounding)</legend>
            <div className="ci-freq" role="radiogroup" aria-label="تكرار الاحتساب">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={freqId === f.id}
                  onClick={() => setFreqId(f.id)}
                  className="ci-opt"
                >
                  {f.name}
                </button>
              ))}
            </div>
            <p className="ci-hint">الاحتساب الشهري أعطى نتائج أعلى من السنوي عند نفس المعدل</p>
          </fieldset>

          {/* Compare */}
          <section className="ci-card" aria-label="مقارنة معدلين">
            <div className="ci-line">
              <h2 className="ci-h2" id={`${uid}-cmp`}>مقارنة معدلين مختلفين</h2>
              <button
                type="button"
                role="switch"
                aria-checked={compareMode}
                aria-labelledby={`${uid}-cmp`}
                onClick={() => setCompareMode(!compareMode)}
                className="ci-switch"
              >
                <span className="ci-knob" />
              </button>
            </div>
            {compareMode && (
              <div className="ci-field">
                <div className="ci-line">
                  <label className="ci-label" htmlFor={`${uid}-rate2`}>المعدل الثاني للمقارنة</label>
                  <output htmlFor={`${uid}-rate2`} className="ci-val ci-num">{rate2}%</output>
                </div>
                <input
                  id={`${uid}-rate2`}
                  type="range"
                  min="0.5"
                  max="30"
                  step="0.5"
                  value={rate2}
                  onChange={(e) => setRate2(e.target.value)}
                  className="ci-range"
                />
              </div>
            )}
          </section>
        </div>

        {/* ───────── Results ───────── */}
        <div className="ci-stack ci-sticky">
          {/* Orange result panel */}
          <section className="ci-result" aria-live="polite" aria-label="النتيجة">
            <p className="ci-result-label">القيمة النهائية بعد {years} سنة</p>
            <p className="ci-big">{result ? <Money v={result.finalAmount} sym={sym} /> : "—"}</p>

            {result && (
              <>
                <div className="ci-grid2">
                  <div className="ci-mini">
                    <p>إجمالي المُستثمَر</p>
                    <strong><Money v={result.totalInvested} sym={sym} /></strong>
                  </div>
                  <div className="ci-mini">
                    <p>الأرباح المركبة</p>
                    <strong><Money v={result.totalInterest} sym={sym} /></strong>
                  </div>
                </div>

                <div className="ci-split" aria-hidden="true">
                  <div className="ci-line ci-split-labels">
                    <span>رأس المال</span>
                    <span>الأرباح <span className="ci-num">{((result.totalInterest / result.finalAmount) * 100).toFixed(1)}%</span></span>
                  </div>
                  <div className="ci-track">
                    <i style={{ width: `${(result.totalInvested / result.finalAmount) * 100}%` }} />
                  </div>
                </div>

                {compareMode && result.result2 && (
                  <div className="ci-compare">
                    <p className="ci-compare-h">مقارنة عند <span className="ci-num">{rate2}%</span></p>
                    <p className="ci-compare-v"><Money v={result.result2.finalAmount} sym={sym} /></p>
                    <p className="ci-compare-d">
                      الفرق: <Money v={Math.abs(result.result2.finalAmount - result.finalAmount)} sym={sym} />
                      {result.result2.finalAmount > result.finalAmount ? " (أعلى)" : " (أقل)"}
                    </p>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Multiplier */}
          {result && (
            <section className="ci-card ci-center" aria-label="معامل التضاعف">
              <p className="ci-hint">معامل التضاعف</p>
              <p className="ci-mult ci-num">
                {hasPrincipal ? `×${(result.finalAmount / p0).toFixed(2)}` : "—"}
              </p>
              {hasPrincipal && (
                <p className="ci-hint">
                  كل 1 {sym} من رأس المال الابتدائي أصبح{" "}
                  <strong className="ci-num">{(result.finalAmount / p0).toFixed(2)}</strong> {sym}
                </p>
              )}
              <p className="ci-note">
                <strong>قاعدة 72: </strong>
                {Number(rate) > 0 ? (
                  <>
                    يتضاعف رأس المال كل <strong className="ci-num">{(72 / Number(rate)).toFixed(1)}</strong> سنة عند معدل <span className="ci-num">{rate}%</span>
                  </>
                ) : (
                  "أدخل معدلاً أكبر من صفر."
                )}
              </p>
            </section>
          )}

          {/* Breakdown */}
          {result && (
            <section className="ci-card" aria-label="تفصيل المكونات">
              <h2 className="ci-h2">تفصيل المكونات</h2>
              {[
                { label: "رأس المال الابتدائي", value: p0, cls: "k1" },
                { label: "مجموع المساهمات الشهرية", value: result.totalInvested - p0, cls: "k2" },
                { label: "الأرباح المركبة", value: result.totalInterest, cls: "k3" },
              ]
                .filter((item) => item.value > 0)
                .map((item) => (
                  <div key={item.label} className="ci-brk">
                    <div className="ci-line">
                      <span className="ci-hint">{item.label}</span>
                      <strong><Money v={item.value} sym={sym} /></strong>
                    </div>
                    <div className="ci-meter" aria-hidden="true">
                      <i className={item.cls} style={{ width: `${(item.value / result.finalAmount) * 100}%` }} />
                    </div>
                  </div>
                ))}
            </section>
          )}
        </div>
      </div>

      {/* Growth chart */}
      {result && (
        <section className="ci-card ci-chart" aria-label="مخطط النمو السنوي">
          <div className="ci-line">
            <h2 className="ci-h2">مخطط النمو السنوي</h2>
            <button
              type="button"
              onClick={() => setShowTable(!showTable)}
              aria-expanded={showTable}
              className="ci-btn"
            >
              {showTable ? "إخفاء الجدول" : "عرض الجدول التفصيلي"}
            </button>
          </div>

          <div className="ci-legend">
            <span><i className="k1" /> رأس المال والمساهمات</span>
            <span><i className="k3" /> الأرباح المركبة</span>
          </div>

          <div className="ci-bars" role="list" aria-label="القيمة الكلية في نهاية كل سنة">
            <span className="ci-ymax ci-num" aria-hidden="true">{num(maxBalance)} {sym}</span>
            {result.table.map((row) => {
              const investedPct = Math.min((row.totalContribs / maxBalance) * 100, (row.balance / maxBalance) * 100);
              const interestPct = Math.max(0, (row.balance / maxBalance) * 100 - investedPct);
              return (
                <div
                  key={row.year}
                  className="ci-bar"
                  role="listitem"
                  tabIndex={0}
                  aria-label={`سنة ${row.year}: ${num(row.balance)} ${sym}`}
                >
                  <div className="ci-bar-stack">
                    <i className="k3" style={{ height: `${interestPct}%` }} />
                    <i className="k1" style={{ height: `${investedPct}%` }} />
                  </div>
                  <span className="ci-bar-year ci-num">{row.year}</span>
                  <div className="ci-tip" aria-hidden="true">
                    <strong><Money v={row.balance} sym={sym} /></strong>
                    <span>سنة {row.year}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {showTable && (
            <div className="ci-tablewrap">
              <table className="ci-table">
                <thead>
                  <tr>
                    <th scope="col">السنة</th>
                    <th scope="col">إجمالي المُستثمَر</th>
                    <th scope="col">الأرباح المتراكمة</th>
                    <th scope="col">القيمة الكلية</th>
                    <th scope="col">نسبة النمو</th>
                  </tr>
                </thead>
                <tbody>
                  {result.table.map((row) => (
                    <tr key={row.year}>
                      <th scope="row" className="ci-num">{row.year}</th>
                      <td><Money v={row.totalContribs} sym={sym} /></td>
                      <td><Money v={row.totalInterest} sym={sym} /></td>
                      <td className="ci-strong"><Money v={row.balance} sym={sym} /></td>
                      <td className="ci-num">
                        {hasPrincipal ? `+${(((row.balance - p0) / p0) * 100).toFixed(1)}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <p className="ci-disclaimer">
        تنبيه: هذه حسابات نظرية افتراضية بمعدل ثابت. العوائد الفعلية تتفاوت مع السوق والضرائب والتضخم. تذكر أن الفائدة المركبة محرمة شرعياً في المعاملات الإسلامية — استخدم هذه الأداة لتقدير عوائد الاستثمارات الحلال كالأسهم والصناديق الشرعية.
      </p>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
// Colours come from --c-* on .ci. If your tokens.css already defines the
// underlying names, delete the fallback values and map them in one place.
const CSS = `
.ci {
  --c-surface: var(--surface, #FFFFFF);
  --c-ink: var(--ink, #0D0D0D);
  --c-ink-soft: var(--ink-soft, #4A4A46);
  --c-line: var(--line, #D9D9D3);
  --c-signal: var(--signal, #FF6A1A);
  --c-on-ink: var(--on-ink, #FFFFFF);
  --c-on-signal: var(--on-signal, #0D0D0D);
  --c-mid: var(--mid, #8C8C85);

  max-width: 64rem;
  margin-inline: auto;
  padding: 2rem 1rem;
  color: var(--c-ink);
  font-family: inherit;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .ci {
    --c-surface: var(--surface, #181816);
    --c-ink: var(--ink, #F5F5F2);
    --c-ink-soft: var(--ink-soft, #B4B4AD);
    --c-line: var(--line, #34342F);
    --c-on-ink: var(--on-ink, #0D0D0D);
    --c-mid: var(--mid, #7A7A73);
  }
}
:root[data-theme="dark"] .ci {
  --c-surface: var(--surface, #181816);
  --c-ink: var(--ink, #F5F5F2);
  --c-ink-soft: var(--ink-soft, #B4B4AD);
  --c-line: var(--line, #34342F);
  --c-on-ink: var(--on-ink, #0D0D0D);
  --c-mid: var(--mid, #7A7A73);
}
.ci *, .ci *::before, .ci *::after { box-sizing: border-box; }

.ci-head { margin-block-end: 1.25rem; padding-inline-start: 0.9rem; border-inline-start: 4px solid var(--c-ink); }
.ci-badge { display: inline-block; margin: 0 0 0.6rem; padding: 0.2rem 0.7rem; font-size: 0.78rem; font-weight: 700; border: 1px solid var(--c-ink); border-radius: 999px; }
.ci-title { margin: 0; font-size: 1.6rem; font-weight: 800; line-height: 1.4; }
@media (min-width: 640px) { .ci-title { font-size: 2rem; } }
.ci-sub { margin: 0.5rem 0 0; max-width: 60ch; font-size: 0.92rem; line-height: 1.8; color: var(--c-ink-soft); }

.ci-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-block-end: 1.5rem; }
.ci-chip {
  min-height: 40px; padding: 0.35rem 0.9rem; font: inherit; font-size: 0.82rem; font-weight: 600;
  color: var(--c-ink); background: var(--c-surface); border: 2px solid var(--c-line); border-radius: 999px; cursor: pointer;
  transition: background-color .15s, color .15s, border-color .15s;
}
.ci-chip:hover { background: var(--c-ink); color: var(--c-on-ink); border-color: var(--c-ink); }

.ci-cols { display: grid; gap: 1.25rem; }
@media (min-width: 900px) { .ci-cols { grid-template-columns: 3fr 2fr; align-items: start; } }
.ci-stack { display: grid; gap: 1.25rem; min-width: 0; }
@media (min-width: 900px) { .ci-sticky { position: sticky; top: 1.5rem; } }

.ci-card { margin: 0; padding: 1.1rem; background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 14px; display: grid; gap: 1rem; min-width: 0; }
.ci-center { text-align: center; }
.ci-h2 { margin: 0; padding: 0; font-size: 1rem; font-weight: 800; }
fieldset.ci-card > legend.ci-h2 { float: inline-start; width: 100%; margin-block-end: 0.25rem; }
fieldset.ci-card > legend.ci-h2 + * { clear: both; }

.ci-label { font-size: 0.82rem; font-weight: 700; }
.ci-hint { margin: 0; font-size: 0.8rem; line-height: 1.7; color: var(--c-ink-soft); }
.ci-field { display: grid; gap: 0.5rem; min-width: 0; }
.ci-line { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; }
.ci-val { font-size: 0.95rem; font-weight: 800; }
.ci-scale { display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--c-ink-soft); }
.ci-num { direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; }
input.ci-num { text-align: center; }

.ci-input {
  width: 100%; min-height: 44px; padding: 0.5rem 0.75rem; font: inherit; font-size: 0.95rem;
  color: var(--c-ink); background: var(--c-surface); border: 2px solid var(--c-line); border-radius: 10px;
}
.ci-input--lg { min-height: 52px; font-size: 1.15rem; font-weight: 800; }
.ci-input:hover { border-color: var(--c-ink-soft); }
.ci-range { width: 100%; accent-color: var(--c-ink); cursor: pointer; }

/* Selectable options */
.ci-wrap { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.ci-freq { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
@media (min-width: 560px) { .ci-freq { grid-template-columns: repeat(5, 1fr); } }
.ci-opt {
  min-height: 44px; padding: 0.45rem 0.8rem; font: inherit; font-size: 0.85rem; font-weight: 700; text-align: center;
  color: var(--c-ink); background: var(--c-surface); border: 2px solid var(--c-line); border-radius: 10px; cursor: pointer;
  transition: background-color .15s, color .15s, border-color .15s;
}
.ci-opt:hover { border-color: var(--c-ink); }
.ci-opt[aria-checked="true"] { color: var(--c-on-ink); background: var(--c-ink); border-color: var(--c-ink); }

/* Switch */
.ci-switch { position: relative; flex: none; width: 52px; height: 30px; padding: 0; background: var(--c-line); border: 2px solid var(--c-ink); border-radius: 999px; cursor: pointer; transition: background-color .15s; }
.ci-knob { position: absolute; top: 3px; inset-inline-start: 3px; width: 20px; height: 20px; background: var(--c-ink); border-radius: 50%; transition: inset-inline-start .15s; }
.ci-switch[aria-checked="true"] { background: var(--c-signal); }
.ci-switch[aria-checked="true"] .ci-knob { inset-inline-start: 25px; }

/* Result: orange is a background only, text stays ink */
.ci-result { padding: 1.25rem; background: var(--c-signal); color: var(--c-on-signal); border-radius: 14px; display: grid; gap: 0.9rem; }
.ci-result-label { margin: 0; font-size: 0.9rem; font-weight: 700; }
.ci-big { margin: 0; font-size: 2.2rem; font-weight: 800; line-height: 1.25; overflow-wrap: anywhere; }
.ci-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
.ci-mini { padding: 0.7rem; border: 2px solid var(--c-on-signal); border-radius: 10px; }
.ci-mini p { margin: 0; font-size: 0.75rem; font-weight: 600; }
.ci-mini strong { font-size: 0.95rem; font-weight: 800; }
.ci-split-labels { font-size: 0.78rem; font-weight: 600; margin-block-end: 0.35rem; }
.ci-track { display: flex; height: 0.7rem; background: rgba(13, 13, 13, 0.2); border-radius: 999px; overflow: hidden; }
.ci-track i { display: block; height: 100%; background: var(--c-on-signal); }
.ci-compare { padding: 0.8rem; border: 2px dashed var(--c-on-signal); border-radius: 10px; }
.ci-compare p { margin: 0; }
.ci-compare-h { font-size: 0.8rem; font-weight: 700; }
.ci-compare-v { font-size: 1.4rem; font-weight: 800; }
.ci-compare-d { font-size: 0.8rem; }

.ci-mult { margin: 0; font-size: 2.4rem; font-weight: 800; line-height: 1.2; }
.ci-note { margin: 0; padding: 0.65rem 0.8rem; font-size: 0.82rem; line-height: 1.8; text-align: start; border: 2px solid var(--c-line); border-radius: 10px; }

/* Breakdown + chart colours: ink, mid-grey, orange (fills only) */
.k1 { background: var(--c-ink); }
.k2 { background: var(--c-mid); }
.k3 { background: var(--c-signal); }
.ci-brk { display: grid; gap: 0.3rem; font-size: 0.85rem; }
.ci-meter { height: 0.5rem; background: var(--c-line); border-radius: 999px; overflow: hidden; }
.ci-meter i { display: block; height: 100%; }

/* Chart */
.ci-chart { margin-block-start: 1.5rem; padding: 1.25rem; }
.ci-btn {
  min-height: 40px; padding: 0.35rem 0.9rem; font: inherit; font-size: 0.82rem; font-weight: 700;
  color: var(--c-ink); background: var(--c-surface); border: 2px solid var(--c-ink); border-radius: 10px; cursor: pointer;
}
.ci-btn:hover { background: var(--c-ink); color: var(--c-on-ink); }
.ci-legend { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.8rem; }
.ci-legend span { display: inline-flex; align-items: center; gap: 0.4rem; }
.ci-legend i { display: inline-block; width: 0.8rem; height: 0.8rem; border-radius: 2px; }

.ci-bars { position: relative; display: flex; align-items: flex-end; gap: 3px; height: 11rem; padding-block-start: 1.2rem; overflow-x: auto; overflow-y: visible; padding-block-end: 0.2rem; }
.ci-ymax { position: absolute; inset-block-start: 0; inset-inline-end: 0; font-size: 0.72rem; color: var(--c-ink-soft); }
.ci-bar { position: relative; flex: 1 0 18px; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 0.2rem; border-radius: 4px; }
.ci-bar-stack { width: 100%; flex: 1; display: flex; flex-direction: column; justify-content: flex-end; }
.ci-bar-stack i { display: block; width: 100%; }
.ci-bar-stack i.k3 { border-top-left-radius: 3px; border-top-right-radius: 3px; }
.ci-bar-year { font-size: 0.7rem; color: var(--c-ink-soft); }
.ci-tip {
  position: absolute; bottom: 1.6rem; inset-inline-start: 50%; transform: translateX(50%);
  display: none; z-index: 5; padding: 0.35rem 0.6rem; white-space: nowrap; font-size: 0.75rem;
  color: var(--c-on-ink); background: var(--c-ink); border-radius: 8px;
}
.ci-tip span { display: block; opacity: 0.85; }
.ci-bar:hover .ci-tip, .ci-bar:focus-visible .ci-tip { display: block; }

.ci-tablewrap { overflow-x: auto; border: 1px solid var(--c-line); border-radius: 10px; }
.ci-table { width: 100%; min-width: 520px; border-collapse: collapse; font-size: 0.82rem; }
.ci-table th, .ci-table td { padding: 0.65rem 0.8rem; text-align: start; }
.ci-table thead th { font-weight: 800; border-block-end: 2px solid var(--c-ink); }
.ci-table tbody tr { border-block-start: 1px solid var(--c-line); }
.ci-table tbody tr:nth-child(even) { background: color-mix(in srgb, var(--c-line) 35%, transparent); }
.ci-table tbody th { font-weight: 800; }
.ci-strong { font-weight: 800; }

.ci-disclaimer { margin: 2rem auto 0; max-width: 70ch; padding-inline-start: 0.8rem; border-inline-start: 2px solid var(--c-line); font-size: 0.8rem; line-height: 1.8; color: var(--c-ink-soft); }

/* Focus + motion */
.ci button:focus-visible, .ci input:focus-visible, .ci .ci-bar:focus-visible {
  outline: 3px solid var(--c-signal); outline-offset: 2px;
}
.ci-result button:focus-visible { outline-color: var(--c-on-signal); }
@media (prefers-reduced-motion: reduce) { .ci * { transition: none !important; } }
`;