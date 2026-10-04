"use client";

/**
 * components/RoiCalculator.jsx
 * Ink & Signal: ROI / CAGR calculator.
 * The useMemo calculation block is unchanged, except `rating` no longer
 * carries color classes (it now has a `loss` flag instead).
 */
import { useState, useMemo } from "react";

const CURRENCIES = [
  { id: "SAR", symbol: "ر.س", name: "ريال سعودي" },
  { id: "AED", symbol: "د.إ", name: "درهم إماراتي" },
  { id: "KWD", symbol: "د.ك", name: "دينار كويتي" },
  { id: "QAR", symbol: "ر.ق", name: "ريال قطري" },
  { id: "EGP", symbol: "ج.م", name: "جنيه مصري" },
  { id: "USD", symbol: "$", name: "دولار أمريكي" },
  { id: "EUR", symbol: "€", name: "يورو" },
];

const PRESETS = [
  { label: "أسهم وصناديق استثمارية", initial: 100000, final: 145000, years: 3, months: 0, income: 12000, expenses: 2000 },
  { label: "عقار تأجيري وتمليك", initial: 600000, final: 750000, years: 5, months: 0, income: 150000, expenses: 35000 },
  { label: "حملة تسويقية وإعلانية", initial: 10000, final: 32000, years: 0, months: 3, income: 0, expenses: 1000 },
  { label: "مشروع ريادي ناشئ", initial: 250000, final: 600000, years: 4, months: 0, income: 0, expenses: 20000 },
];

function fmt(n, sym) {
  return `${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${sym}`;
}

/** Keeps signs / digits / % in a stable left-to-right order inside RTL text. */
function Num({ children }) {
  return <span className="ro-ltr">{children}</span>;
}

function MoneyField({ id, label, value, onChange, sym }) {
  return (
    <div className="ro-field">
      <label htmlFor={id} className="ro-label">{label}</label>
      <div className="ro-input-wrap">
        <span className="ro-sym" aria-hidden="true">{sym}</span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="ro-input"
        />
      </div>
    </div>
  );
}

function NumField({ id, label, value, onChange, max }) {
  return (
    <div className="ro-field">
      <label htmlFor={id} className="ro-label">{label}</label>
      <div className="ro-input-wrap">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min="0"
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="ro-input"
        />
      </div>
    </div>
  );
}

export default function RoiCalculator() {
  const [currency, setCurrency] = useState("SAR");

  // Inputs
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [finalValue, setFinalValue] = useState(150000);
  const [investYears, setInvestYears] = useState(3);
  const [investMonths, setInvestMonths] = useState(0);

  // Additional income/expenses
  const [recurringIncome, setRecurringIncome] = useState(15000);
  const [additionalExpenses, setAdditionalExpenses] = useState(3000);

  const [copied, setCopied] = useState(false);

  const sym = CURRENCIES.find((c) => c.id === currency)?.symbol || "ر.س";

  // Calculations
  const stats = useMemo(() => {
    const init = Math.max(0, Number(initialInvestment) || 0);
    const finalVal = Math.max(0, Number(finalValue) || 0);
    const y = Math.max(0, Number(investYears) || 0);
    const m = Math.max(0, Math.min(11, Number(investMonths) || 0));
    const totalYears = y + m / 12;

    const income = Math.max(0, Number(recurringIncome) || 0);
    const exp = Math.max(0, Number(additionalExpenses) || 0);

    const totalReturn = finalVal + income;
    const totalCost = init + exp;
    const netProfit = totalReturn - totalCost;
    const totalRoi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

    let cagr = 0;
    if (totalYears > 0 && totalCost > 0 && totalReturn > 0) {
      cagr = (Math.pow(totalReturn / totalCost, 1 / totalYears) - 1) * 100;
    }

    const simpleAnnualRoi = totalYears > 0 ? totalRoi / totalYears : totalRoi;
    const multiple = totalCost > 0 ? (totalReturn / totalCost).toFixed(2) : "0.00";

    const initShare = totalReturn > 0 ? Math.min(100, (init / totalReturn) * 100) : 50;
    const profitShare = totalReturn > 0 ? Math.max(0, (netProfit / totalReturn) * 100) : 0;

    let rating = { label: "متوسط", loss: false, tip: "العائد يتماشى مع متوسط عوائد السوق التقليدية." };
    if (netProfit < 0) {
      rating = { label: "خسارة استثمارية", loss: true, tip: "العائد سلبي، ينبغي إعادة تقييم استراتيجية الاستثمار وتخفيف التكاليف." };
    } else if (cagr >= 20 || totalRoi >= 100) {
      rating = { label: "استثنائي وفائق", loss: false, tip: "أداء استثماري استثنائي يتجاوز متوسط مؤشرات الأسواق العالمية بكثير." };
    } else if (cagr >= 10 || totalRoi >= 30) {
      rating = { label: "جيد جداً وقوي", loss: false, tip: "عائد ممتاز يتفوق على معدلات التضخم وعوائد الودائع البنكية." };
    }

    return {
      init,
      finalVal,
      income,
      exp,
      totalYears: Number(totalYears.toFixed(2)),
      totalCost,
      totalReturn,
      netProfit,
      totalRoi: Number(totalRoi.toFixed(2)),
      cagr: Number(cagr.toFixed(2)),
      simpleAnnualRoi: Number(simpleAnnualRoi.toFixed(2)),
      multiple,
      initShare: Number(initShare.toFixed(1)),
      profitShare: Number(profitShare.toFixed(1)),
      rating,
    };
  }, [initialInvestment, finalValue, investYears, investMonths, recurringIncome, additionalExpenses]);

  // CAGR is meaningless with no duration: show a dash instead of 0%
  const hasCagr = stats.totalYears > 0 && stats.totalCost > 0 && stats.totalReturn > 0;
  const cagrText = hasCagr ? `${stats.cagr}%` : "—";
  const roiText = `${stats.totalRoi >= 0 ? "+" : ""}${stats.totalRoi}%`;

  const handleApplyPreset = (p) => {
    setInitialInvestment(p.initial);
    setFinalValue(p.final);
    setInvestYears(p.years);
    setInvestMonths(p.months);
    setRecurringIncome(p.income);
    setAdditionalExpenses(p.expenses);
  };

  const handleCopy = async () => {
    const text = `تقرير العائد على الاستثمار (ROI):
- رأس المال المستثمر: ${fmt(stats.init, sym)}
- القيمة النهائية المستردة: ${fmt(stats.finalVal, sym)}
- الأرباح الدورية (توزيعات/إيجار): ${fmt(stats.income, sym)}
- المصاريف الإضافية: ${fmt(stats.exp, sym)}
- مدة الاستثمار: ${stats.totalYears} سنة
- صافي الأرباح المحققة: ${fmt(stats.netProfit, sym)}
- إجمالي العائد على الاستثمار (Total ROI): ${stats.totalRoi}%
- معدل النمو السنوي المركب (CAGR): ${cagrText}
- مضاعف رأس المال: ${stats.multiple}x
- تقييم الأداء: ${stats.rating.label}

تم الحساب عبر حاسبة العائد على الاستثمار | الأدوات العربية`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked: do nothing */
    }
  };

  return (
    <div className="ro-root" dir="rtl">
      <RoiStyles />

      {/* Header */}
      <header className="ro-header ro-noprint">
        <p className="ro-kicker-tag">ROI · CAGR</p>
        <h1 className="ro-h1">حاسبة العائد على الاستثمار (ROI Calculator)</h1>
        <p className="ro-lead">
          احسب صافي أرباحك الاستثمارية، ومعدل العائد السنوي المركب (CAGR)، ومضاعف رأس المال لمشاريعك العقارية والتجارية وحملاتك التسويقية.
        </p>
      </header>

      {/* Currency & presets */}
      <section className="ro-box ro-noprint" aria-label="العملة والنماذج الجاهزة">
        <div className="ro-bar-row">
          <p className="ro-small-title">نماذج استثمارية جاهزة للتجربة:</p>
          <div className="ro-cur">
            <label htmlFor="roi-currency" className="ro-label">العملة:</label>
            <select
              id="roi-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="ro-select"
            >
              {CURRENCIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.symbol} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="ro-presets">
          {PRESETS.map((p, idx) => (
            <button key={idx} type="button" onClick={() => handleApplyPreset(p)} className="ro-preset">
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <div className="ro-grid">
        {/* ─── Inputs ─── */}
        <div className="ro-col ro-noprint">
          <section className="ro-card" aria-labelledby="roi-s1">
            <h2 id="roi-s1" className="ro-h2">
              <span className="ro-num" aria-hidden="true">1</span>
              رأس المال والقيمة المستردة
            </h2>
            <div className="ro-two">
              <MoneyField
                id="roi-initial"
                label="المبلغ المستثمر مبدئياً (Initial Cost)"
                value={initialInvestment}
                onChange={setInitialInvestment}
                sym={sym}
              />
              <MoneyField
                id="roi-final"
                label="القيمة النهائية المستردة (Final Value)"
                value={finalValue}
                onChange={setFinalValue}
                sym={sym}
              />
              <NumField
                id="roi-years"
                label="فترة الاستثمار (بالسنوات)"
                value={investYears}
                onChange={setInvestYears}
                max="50"
              />
              <NumField
                id="roi-months"
                label="أشهر إضافية (0 - 11)"
                value={investMonths}
                onChange={setInvestMonths}
                max="11"
              />
            </div>
          </section>

          <section className="ro-card" aria-labelledby="roi-s2">
            <h2 id="roi-s2" className="ro-h2">
              <span className="ro-num" aria-hidden="true">2</span>
              العوائد والمصاريف الدورية الإضافية
            </h2>
            <div className="ro-two">
              <MoneyField
                id="roi-income"
                label="إجمالي التوزيعات النقدية / الإيجارات المستلمة"
                value={recurringIncome}
                onChange={setRecurringIncome}
                sym={sym}
              />
              <MoneyField
                id="roi-exp"
                label="مصاريف إضافية (صيانة، إدارة، ضرائب)"
                value={additionalExpenses}
                onChange={setAdditionalExpenses}
                sym={sym}
              />
            </div>
          </section>

          <aside className="ro-note">
            <p className="ro-note-title">ما الفرق بين العائد الإجمالي (ROI) ومعدل النمو السنوي المركب (CAGR)؟</p>
            <p>
              <strong>العائد الإجمالي (Total ROI):</strong> يقيس الربح الكلي على مدار كامل فترة الاستثمار كنسبة مئوية، دون النظر لطول المدة الزمنية.
            </p>
            <p>
              <strong>معدل النمو السنوي المركب (CAGR):</strong> يقيس النمو الفعلي لكل سنة بمفردها مع إعادة استثمار الأرباح، وهو المعيار الأنسب للمقارنة العادلة بين استثمارات مختلفة الآجال.
            </p>
          </aside>
        </div>

        {/* ─── Results ─── */}
        <div className="ro-col ro-sticky">
          <section className="ro-result" aria-live="polite" aria-labelledby="roi-result-title">
            <div className="ro-result-top">
              <h2 id="roi-result-title" className="ro-result-label">إجمالي العائد على الاستثمار (ROI)</h2>
              <span className="ro-mult"><Num>{stats.multiple}x</Num></span>
            </div>

            <p className="ro-big"><Num>{roiText}</Num></p>

            <div className="ro-chips">
              <span className="ro-chip">
                صافي الربح: <Num>{fmt(stats.netProfit, sym)}</Num>
              </span>
              <span className="ro-chip">
                السنوي المركب: <Num>{cagrText}</Num>
              </span>
            </div>

            {/* Breakdown bar */}
            <div className="ro-barbox">
              <div
                className="ro-track"
                role="img"
                aria-label={`رأس المال ${stats.initShare}% والأرباح ${stats.profitShare}% من إجمالي المردود`}
              >
                <div className="ro-seg-cap" style={{ width: `${stats.initShare}%` }} />
                <div className="ro-seg-profit" style={{ width: `${stats.profitShare}%` }} />
              </div>
              <ul className="ro-legend">
                <li><span className="ro-sw ro-sw-cap" aria-hidden="true" /> رأس المال (<Num>{stats.initShare}%</Num>)</li>
                <li><span className="ro-sw ro-sw-profit" aria-hidden="true" /> الأرباح المحققة (<Num>{stats.profitShare}%</Num>)</li>
              </ul>
            </div>

            <p className={`ro-rating ${stats.rating.loss ? "ro-rating-loss" : ""}`}>
              {stats.rating.loss && <span className="ro-tag" aria-hidden="true">!</span>}
              <span>
                <strong>تقييم الأداء:</strong> {stats.rating.label} — {stats.rating.tip}
              </span>
            </p>

            <div className="ro-actions ro-noprint">
              <button type="button" onClick={handleCopy} className="ro-btn">
                {copied ? "تم نسخ التقرير" : "نسخ النتيجة"}
              </button>
              <button type="button" onClick={() => window.print()} className="ro-btn ro-btn-ghost">
                طباعة
              </button>
            </div>
          </section>

          <section className="ro-card ro-card-flush" aria-labelledby="roi-kpi">
            <h3 id="roi-kpi" className="ro-kpi-title">مؤشرات الأداء المالي</h3>
            <dl className="ro-dl">
              <div className="ro-dl-row">
                <dt>إجمالي رأس المال والتكاليف</dt>
                <dd><Num>{fmt(stats.totalCost, sym)}</Num></dd>
              </div>
              <div className="ro-dl-row">
                <dt>إجمالي المردود والأرباح الدورية</dt>
                <dd><Num>{fmt(stats.totalReturn, sym)}</Num></dd>
              </div>
              <div className="ro-dl-row">
                <dt>صافي الربح الفعلي</dt>
                <dd className="ro-strong">
                  {stats.netProfit < 0 && <span className="ro-loss-tag">خسارة</span>}
                  <Num>{fmt(stats.netProfit, sym)}</Num>
                </dd>
              </div>
              <div className="ro-dl-row">
                <dt>معدل العائد السنوي المركب (CAGR)</dt>
                <dd><Num>{cagrText}</Num>{hasCagr && " سنوياً"}</dd>
              </div>
              <div className="ro-dl-row">
                <dt>معدل العائد البسيط السنوي</dt>
                <dd><Num>{stats.simpleAnnualRoi}%</Num> سنوياً</dd>
              </div>
              <div className="ro-dl-row">
                <dt>مضاعف الاستثمار (Investment Multiple)</dt>
                <dd className="ro-strong"><Num>{stats.multiple}x</Num></dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <p className="ro-disclaimer">
        <span className="ro-tag" aria-hidden="true">!</span>
        <span>
          <span className="ro-sr">تنبيه: </span>
          أداة استرشادية لتقييم الجدوى الاقتصادية وعوائد الأصول الاستثمارية. استشر مستشاراً مالياً مرخصاً لقرارات الاستثمار الكبرى.
        </span>
      </p>
    </div>
  );
}

/**
 * Local styles. Map the --ro-* fallbacks to your real Ink & Signal tokens.
 */
function RoiStyles() {
  return (
    <style>{`
      .ro-root{
        --ro-ink:#0a0a0a; --ro-paper:#ffffff; --ro-muted:#f0f0f0;
        --ro-text2:#404040; --ro-orange:#ff5a1f;
        max-width:64rem; margin:0 auto; padding:2rem 1rem;
        color:var(--ro-ink); background:var(--ro-paper);
      }
      @media (min-width:640px){ .ro-root{ padding:3rem 1rem; } }
      @media (prefers-color-scheme: dark){
        :root:not([data-theme="light"]) .ro-root{
          --ro-ink:#f5f5f5; --ro-paper:#0a0a0a; --ro-muted:#1a1a1a; --ro-text2:#d4d4d4;
        }
      }
      :root[data-theme="dark"] .ro-root{
        --ro-ink:#f5f5f5; --ro-paper:#0a0a0a; --ro-muted:#1a1a1a; --ro-text2:#d4d4d4;
      }

      .ro-ltr{ direction:ltr; unicode-bidi:isolate; display:inline-block; }
      .ro-sr{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
      .ro-root :focus-visible{ outline:3px solid var(--ro-orange); outline-offset:2px; }

      /* Header */
      .ro-header{ text-align:center; margin-bottom:2rem; display:grid; gap:.75rem; justify-items:center; }
      .ro-kicker-tag{
        margin:0; padding:.125rem .75rem; border:2px solid var(--ro-ink);
        font-size:.75rem; font-weight:800; letter-spacing:.06em;
      }
      .ro-h1{ margin:0; font-size:1.875rem; font-weight:800; line-height:1.4; }
      @media (min-width:640px){ .ro-h1{ font-size:2.25rem; } }
      .ro-lead{ margin:0; max-width:42rem; font-size:.9375rem; line-height:1.9; color:var(--ro-text2); }

      /* Boxes & cards */
      .ro-box{ border:2px solid var(--ro-ink); padding:1rem; margin-bottom:1.5rem; display:grid; gap:.75rem; }
      .ro-bar-row{ display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:.75rem; }
      .ro-small-title{ margin:0; font-size:.75rem; font-weight:800; }
      .ro-cur{ display:flex; align-items:center; gap:.5rem; }
      .ro-presets{ display:flex; flex-wrap:wrap; gap:.5rem; }

      .ro-preset,.ro-select{
        border:2px solid var(--ro-ink); background:var(--ro-paper); color:var(--ro-ink);
        padding:.375rem .75rem; font-size:.75rem; font-weight:700; font-family:inherit; cursor:pointer;
      }
      .ro-preset:hover{ background:var(--ro-orange); color:#0a0a0a; }

      .ro-grid{ display:grid; grid-template-columns:1fr; gap:1.5rem; }
      @media (min-width:1024px){ .ro-grid{ grid-template-columns:3fr 2fr; align-items:start; } }
      .ro-col{ display:grid; gap:1.25rem; }
      @media (min-width:1024px){ .ro-sticky{ position:sticky; top:1rem; } }

      .ro-card{ border:2px solid var(--ro-ink); padding:1.25rem; display:grid; gap:1rem; }
      .ro-card-flush{ padding:0; gap:0; }
      .ro-h2{ margin:0; display:flex; align-items:center; gap:.625rem; font-size:1rem; font-weight:800; }
      .ro-num{
        flex:none; width:1.75rem; height:1.75rem; display:inline-flex;
        align-items:center; justify-content:center;
        border:2px solid var(--ro-ink); font-size:.8125rem; font-weight:800;
      }
      .ro-two{ display:grid; gap:1rem; grid-template-columns:1fr; }
      @media (min-width:640px){ .ro-two{ grid-template-columns:1fr 1fr; } }

      /* Fields */
      .ro-field{ display:grid; gap:.375rem; align-content:start; }
      .ro-label{ font-size:.75rem; font-weight:800; line-height:1.6; }
      .ro-input-wrap{ display:flex; border:2px solid var(--ro-ink); background:var(--ro-paper); }
      .ro-input-wrap:focus-within{ outline:3px solid var(--ro-orange); outline-offset:2px; }
      .ro-sym{
        flex:none; padding:0 .75rem; display:inline-flex; align-items:center;
        background:var(--ro-muted); border-inline-end:2px solid var(--ro-ink);
        font-size:.75rem; font-weight:800;
      }
      .ro-input{
        flex:1; min-width:0; border:0; background:transparent; color:var(--ro-ink);
        padding:.625rem .75rem; font-size:.875rem; font-weight:700; font-family:inherit;
      }
      .ro-input:focus-visible{ outline:none; }

      /* Note (informational) */
      .ro-note{
        border:2px solid var(--ro-ink); border-inline-start:6px solid var(--ro-orange);
        padding:1rem; font-size:.75rem; line-height:1.9; color:var(--ro-text2); display:grid; gap:.5rem;
      }
      .ro-note p{ margin:0; }
      .ro-note strong{ color:var(--ro-ink); font-weight:800; }
      .ro-note-title{ font-size:.8125rem; font-weight:800; color:var(--ro-ink); }

      /* Result panel (orange, black text) */
      .ro-result{
        background:var(--ro-orange); color:#0a0a0a; border:2px solid var(--ro-ink);
        padding:1.25rem; display:grid; gap:1rem;
      }
      .ro-result-top{ display:flex; align-items:center; justify-content:space-between; gap:.5rem; }
      .ro-result-label{ margin:0; font-size:.75rem; font-weight:800; }
      .ro-mult{ border:2px solid #0a0a0a; padding:0 .5rem; font-size:.75rem; font-weight:800; }
      .ro-big{ margin:0; font-size:2.5rem; font-weight:900; line-height:1.2; }
      .ro-chips{ display:flex; flex-wrap:wrap; gap:.5rem; }
      .ro-chip{ border:2px solid #0a0a0a; padding:.25rem .625rem; font-size:.75rem; font-weight:800; }

      .ro-barbox{ background:#ffffff; border:2px solid #0a0a0a; padding:.75rem; display:grid; gap:.5rem; }
      .ro-track{ display:flex; height:1rem; border:2px solid #0a0a0a; background:#ffffff; overflow:hidden; }
      .ro-seg-cap{ background:#0a0a0a; height:100%; }
      .ro-seg-profit{ background:#ff5a1f; height:100%; border-inline-start:2px solid #0a0a0a; }
      .ro-legend{ list-style:none; margin:0; padding:0; display:flex; flex-wrap:wrap; gap:.25rem 1rem; font-size:.6875rem; font-weight:700; }
      .ro-legend li{ display:flex; align-items:center; gap:.375rem; }
      .ro-sw{ width:.75rem; height:.75rem; border:2px solid #0a0a0a; display:inline-block; }
      .ro-sw-cap{ background:#0a0a0a; }
      .ro-sw-profit{ background:#ff5a1f; }

      .ro-rating{
        margin:0; padding:.75rem; border:2px solid #0a0a0a; background:#ffffff;
        font-size:.75rem; line-height:1.8; display:flex; gap:.5rem; align-items:flex-start;
      }
      .ro-rating-loss{ border-style:dashed; }
      .ro-tag{
        flex:none; width:1.25rem; height:1.25rem; display:inline-flex;
        align-items:center; justify-content:center; font-weight:800;
        border:2px solid currentColor;
      }

      .ro-actions{ display:flex; gap:.5rem; }
      .ro-btn{
        flex:1; padding:.5rem .75rem; background:#0a0a0a; color:#ffffff;
        border:2px solid #0a0a0a; font-size:.75rem; font-weight:800; font-family:inherit; cursor:pointer;
      }
      .ro-btn:hover{ background:#ffffff; color:#0a0a0a; }
      .ro-btn-ghost{ flex:none; background:transparent; color:#0a0a0a; }
      .ro-result .ro-btn:focus-visible{ outline:3px solid #0a0a0a; outline-offset:3px; }

      /* KPI list */
      .ro-kpi-title{ margin:0; padding:.875rem 1.25rem; border-bottom:2px solid var(--ro-ink); font-size:.875rem; font-weight:800; }
      .ro-dl{ margin:0; display:grid; }
      .ro-dl-row{
        display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;
        padding:.625rem 1.25rem; border-bottom:1px solid var(--ro-ink); font-size:.75rem;
      }
      .ro-dl-row:last-child{ border-bottom:0; }
      .ro-dl-row dt{ margin:0; color:var(--ro-text2); }
      .ro-dl-row dd{ margin:0; font-weight:800; display:flex; align-items:center; gap:.5rem; }
      .ro-strong{ font-size:.875rem; }
      .ro-loss-tag{ border:2px dashed var(--ro-ink); padding:0 .375rem; font-size:.625rem; font-weight:800; }

      /* Disclaimer */
      .ro-disclaimer{
        margin:2rem 0 0; padding:.75rem 1rem; border:2px dashed var(--ro-ink);
        display:flex; gap:.5rem; align-items:flex-start;
        font-size:.75rem; line-height:1.8; color:var(--ro-text2);
      }

      /* Print: results only */
      @media print{
        .ro-noprint{ display:none !important; }
        .ro-root{ color:#000; background:none; padding:0; }
        .ro-grid{ grid-template-columns:1fr; }
        .ro-sticky{ position:static; }
        .ro-result{ -webkit-print-color-adjust:exact; print-color-adjust:exact; border-color:#000; }
        .ro-card,.ro-disclaimer{ border-color:#000; color:#000; }
        .ro-dl-row dt,.ro-disclaimer{ color:#000; }
      }
    `}</style>
  );
}