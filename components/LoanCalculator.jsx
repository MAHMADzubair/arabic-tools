"use client";

import { useMemo, useState, useId } from "react";

const currencyOptions = [
  { code: "SAR", label: "ريال سعودي" },
  { code: "AED", label: "درهم إماراتي" },
  { code: "USD", label: "دولار أمريكي" },
  { code: "PKR", label: "روبية باكستانية" },
  { code: "EGP", label: "جنيه مصري" },
  { code: "KWD", label: "دينار كويتي" },
];

function toNum(v) {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

// Conventional Loan Calculation (Reducing Balance / Amortization)
function calcConventional(p, annualRate, n) {
  if (annualRate === 0) {
    const monthly = p / n;
    return {
      monthlyPayment: monthly,
      totalPayment: p,
      totalProfitOrInterest: 0,
      schedule: Array.from({ length: n }, (_, i) => ({
        month: i + 1,
        payment: monthly,
        principal: monthly,
        profitOrInterest: 0,
        balance: Math.max(p - monthly * (i + 1), 0),
      })),
    };
  }

  const r = annualRate / 100 / 12;
  const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = monthly * n;
  const totalProfitOrInterest = totalPayment - p;

  let balance = p;
  const schedule = [];
  for (let i = 1; i <= n; i++) {
    const interest = balance * r;
    const principalPaid = monthly - interest;
    balance = Math.max(balance - principalPaid, 0);
    schedule.push({
      month: i,
      payment: monthly,
      principal: principalPaid,
      profitOrInterest: interest,
      balance,
    });
  }

  return { monthlyPayment: monthly, totalPayment, totalProfitOrInterest, schedule };
}

// Islamic Murabaha Financing Calculation (Flat Profit Margin)
function calcMurabaha(p, annualProfitRate, n) {
  const years = n / 12;
  const totalProfit = p * (annualProfitRate / 100) * years;
  const totalPayment = p + totalProfit;
  const monthlyPayment = totalPayment / n;

  const monthlyPrincipal = p / n;
  const monthlyProfit = totalProfit / n;

  let balance = totalPayment;
  const schedule = [];
  for (let i = 1; i <= n; i++) {
    balance = Math.max(balance - monthlyPayment, 0);
    schedule.push({
      month: i,
      payment: monthlyPayment,
      principal: monthlyPrincipal,
      profitOrInterest: monthlyProfit,
      balance,
    });
  }

  return {
    monthlyPayment,
    totalPayment,
    totalProfitOrInterest: totalProfit,
    schedule,
  };
}

export default function LoanCalculator() {
  const currencyId = useId();
  const earlyId = useId();

  const [financeType, setFinanceType] = useState("murabaha"); // 'murabaha' | 'conventional'
  const [currency, setCurrency] = useState("SAR");
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("4.5");
  const [years, setYears] = useState("5");
  const [months, setMonths] = useState("0");
  const [showSchedule, setShowSchedule] = useState(false);
  const [showEarlyRepay, setShowEarlyRepay] = useState(false);
  const [earlyRepayMonth, setEarlyRepayMonth] = useState("24");

  const totalMonths = toNum(years) * 12 + toNum(months);

  const result = useMemo(() => {
    const p = toNum(principal);
    const r = toNum(rate);
    if (p <= 0 || totalMonths <= 0) return null;

    if (financeType === "murabaha") {
      return calcMurabaha(p, r, totalMonths);
    }
    return calcConventional(p, r, totalMonths);
  }, [financeType, principal, rate, totalMonths]);

  // Early Repayment calculation
  const earlyRepayCalc = useMemo(() => {
    if (!result || !result.schedule || result.schedule.length === 0) return null;
    const targetMonth = Math.min(Math.max(1, parseInt(earlyRepayMonth) || 1), totalMonths);
    const row = result.schedule[targetMonth - 1];
    if (!row) return null;

    const remainingMonths = totalMonths - targetMonth;
    if (remainingMonths <= 0) return null;

    // Remaining principal balance
    let remainingPrincipal = 0;
    if (financeType === "murabaha") {
      const p = toNum(principal);
      remainingPrincipal = p - (p / totalMonths) * targetMonth;
    } else {
      remainingPrincipal = row.balance;
    }

    // Statutory compensation: Max 3 months profit/interest (Central Bank regulations: SAMA/CBUAE)
    const monthlyCost = result.totalProfitOrInterest / totalMonths;
    const bankPenalty = monthlyCost * Math.min(3, remainingMonths);
    const earlySettlementAmount = remainingPrincipal + bankPenalty;
    const savings = Math.max(0, result.totalPayment - (row.payment * targetMonth + earlySettlementAmount));

    return {
      targetMonth,
      remainingMonths,
      remainingPrincipal,
      bankPenalty,
      earlySettlementAmount,
      savings,
    };
  }, [result, earlyRepayMonth, totalMonths, financeType, principal]);

  const fmt = (n) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const hasResult = result !== null && toNum(principal) > 0 && totalMonths > 0;
  const profitPct = hasResult
    ? +((result.totalProfitOrInterest / result.totalPayment) * 100).toFixed(1)
    : 0;
  const principalPct = hasResult
    ? +((toNum(principal) / result.totalPayment) * 100).toFixed(1)
    : 0;

  const profitWord = financeType === "murabaha" ? "الربح" : "الفائدة";

  return (
    <div className="ln" dir="rtl">
      <style>{css}</style>

      <header className="ln-head">
        <p className="ln-kicker">مرابحة إسلامية وتناقصي</p>
        <h1 className="ln-h1">حاسبة التمويل والقروض</h1>
        <p className="ln-lead">
          احسب القسط الشهري، وهامش الربح، والسداد المبكر، وجدول السداد الكامل.
        </p>
      </header>

      <div className="ln-box">
        {/* Finance type */}
        <fieldset className="ln-fieldset">
          <legend className="ln-label">نوع صيغة التمويل</legend>
          <div className="ln-seg">
            <button
              type="button"
              className="ln-type"
              aria-pressed={financeType === "murabaha"}
              onClick={() => setFinanceType("murabaha")}
            >
              <span className="ln-type-title">تمويل مرابحة إسلامي</span>
              <span className="ln-type-desc">
                هامش ربح سنوي ثابت معتمد لدى البنوك الإسلامية (الراجحي، الإنماء، دبي الإسلامي)
              </span>
            </button>
            <button
              type="button"
              className="ln-type"
              aria-pressed={financeType === "conventional"}
              onClick={() => setFinanceType("conventional")}
            >
              <span className="ln-type-title">تمويل بفائدة متناقصة</span>
              <span className="ln-type-desc">
                نظام الفائدة المتناقصة السنوية (APR / Amortization) المعمول به في البنوك التجارية
              </span>
            </button>
          </div>
        </fieldset>

        <div className="ln-stack">
          <div>
            <label className="ln-label" htmlFor={currencyId}>العملة</label>
            <select
              id={currencyId}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="ln-input"
            >
              {currencyOptions.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <NumField
            label="مبلغ التمويل أو القرض"
            suffix={currency}
            placeholder="مثال: 100000"
            value={principal}
            onChange={setPrincipal}
          />

          <NumField
            label={financeType === "murabaha" ? "نسبة هامش الربح السنوي" : "معدل الفائدة السنوي"}
            suffix="%"
            step="0.05"
            placeholder={financeType === "murabaha" ? "مثال: 4.25" : "مثال: 5.5"}
            value={rate}
            onChange={setRate}
            note={
              financeType === "murabaha"
                ? "نسبة الربح الثابتة المتفق عليها سنوياً على أصل التمويل"
                : "معدل النسبة السنوي الفعلي (APR) المتناقص شهرياً"
            }
          />

          <fieldset className="ln-fieldset">
            <legend className="ln-label">مدة السداد</legend>
            <div className="ln-two">
              <NumField label="سنوات" mode="numeric" placeholder="0" value={years} onChange={setYears} compact />
              <NumField label="أشهر" mode="numeric" placeholder="0" value={months} onChange={setMonths} compact />
            </div>
          </fieldset>
        </div>

        {hasResult && (
          <div className="ln-out">
            {/* Main result */}
            <section className="ln-result" aria-live="polite" aria-labelledby="ln-res-label">
              <p className="ln-result-label" id="ln-res-label">القسط الشهري</p>
              <p className="ln-result-big"><bdi>{fmt(result.monthlyPayment)} {currency}</bdi></p>
              <dl className="ln-result-rows">
                <div>
                  <dt>{financeType === "murabaha" ? "إجمالي أرباح المرابحة" : "إجمالي الفائدة المدفوعة"}</dt>
                  <dd><bdi>{fmt(result.totalProfitOrInterest)} {currency}</bdi></dd>
                </div>
                <div>
                  <dt>إجمالي المبلغ المسدد بالكامل</dt>
                  <dd><bdi>{fmt(result.totalPayment)} {currency}</bdi></dd>
                </div>
                <div>
                  <dt>عدد الأقساط الشهرية</dt>
                  <dd><bdi>{totalMonths}</bdi> شهر</dd>
                </div>
              </dl>
            </section>

            {/* Ratio bar */}
            <div>
              <div className="ln-ratio-labels">
                <span>أصل التمويل: <bdi>{principalPct}%</bdi></span>
                <span>{profitWord}: <bdi>{profitPct}%</bdi></span>
              </div>
              <div
                className="ln-bar"
                role="img"
                aria-label={`أصل التمويل ${principalPct}% و${profitWord} ${profitPct}%`}
              >
                <div className="ln-bar-a" style={{ flex: `${principalPct} 1 0` }} />
                <div className="ln-bar-b" style={{ flex: `${profitPct} 1 0` }} />
              </div>
            </div>

            {/* Early repayment */}
            <section className="ln-early" aria-labelledby="ln-early-title">
              <div className="ln-row">
                <h2 className="ln-h2" id="ln-early-title">حاسبة السداد المبكر وتوفير الأرباح</h2>
                <button
                  type="button"
                  className="ln-btn"
                  aria-expanded={showEarlyRepay}
                  aria-controls="ln-early-body"
                  onClick={() => setShowEarlyRepay(!showEarlyRepay)}
                >
                  {showEarlyRepay ? "إخفاء" : "احسب التوفير"}
                </button>
              </div>

              {showEarlyRepay && (
                <div id="ln-early-body" className="ln-early-body">
                  {earlyRepayCalc ? (
                    <>
                      <div className="ln-early-input">
                        <label className="ln-label ln-label-flush" htmlFor={earlyId}>
                          ترغب في السداد المبكر عند الشهر رقم
                        </label>
                        <input
                          id={earlyId}
                          type="number"
                          inputMode="numeric"
                          min="1"
                          max={totalMonths - 1}
                          value={earlyRepayMonth}
                          onChange={(e) => setEarlyRepayMonth(e.target.value)}
                          className="ln-input ln-center"
                        />
                      </div>

                      <dl className="ln-rows">
                        <div>
                          <dt>أصل التمويل المتبقي</dt>
                          <dd><bdi>{fmt(earlyRepayCalc.remainingPrincipal)} {currency}</bdi></dd>
                        </div>
                        <div>
                          <dt>تعويض البنك النظامي (أرباح 3 أشهر كحد أقصى)</dt>
                          <dd><bdi>{fmt(earlyRepayCalc.bankPenalty)} {currency}</bdi></dd>
                        </div>
                        <div className="ln-rows-total">
                          <dt>مبلغ المخالصة النهائية للسداد المبكر</dt>
                          <dd><bdi>{fmt(earlyRepayCalc.earlySettlementAmount)} {currency}</bdi></dd>
                        </div>
                      </dl>

                      <p className="ln-saving">
                        وفّرت بإسقاط أرباح الأشهر المتبقية: <bdi>{fmt(earlyRepayCalc.savings)} {currency}</bdi>
                      </p>
                    </>
                  ) : (
                    <p className="ln-small">لا يتوفر سداد مبكر لأن مدة التمويل شهر واحد أو أقل.</p>
                  )}
                </div>
              )}
            </section>

            {/* Schedule */}
            <div>
              <button
                type="button"
                className="ln-btn ln-btn-full"
                aria-expanded={showSchedule}
                aria-controls="ln-schedule"
                onClick={() => setShowSchedule((v) => !v)}
              >
                {showSchedule ? "إخفاء جدول السداد" : "عرض جدول السداد الشهري الكامل"}
              </button>

              {showSchedule && (
                <div id="ln-schedule" className="ln-table-wrap" tabIndex={0} role="region" aria-label="جدول السداد الشهري">
                  <table className="ln-table">
                    <caption className="ln-sr">جدول السداد الشهري</caption>
                    <thead>
                      <tr>
                        <th scope="col">الشهر</th>
                        <th scope="col">القسط</th>
                        <th scope="col">الأصل</th>
                        <th scope="col">{profitWord}</th>
                        <th scope="col">الرصيد المتبقي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.map((row) => (
                        <tr key={row.month}>
                          <th scope="row">{row.month}</th>
                          <td>{fmt(row.payment)}</td>
                          <td>{fmt(row.principal)}</td>
                          <td>{fmt(row.profitOrInterest)}</td>
                          <td>{fmt(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="ln-disclaimer">
          هذه الأداة للمساعدة في التقدير والتخطيط. قد تختلف النسب الفعلية وعروض البنوك وفق شروط التمويل وتاريخ تحويل الراتب والرسوم الإدارية.
        </p>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange, suffix, placeholder, step, note, mode = "decimal", compact }) {
  const id = useId();
  return (
    <div>
      <label className="ln-label" htmlFor={id}>{label}</label>
      <div className="ln-suffix-wrap">
        <input
          id={id}
          type="number"
          inputMode={mode}
          step={step}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="ln-input"
          style={suffix ? { paddingInlineEnd: "3.5rem" } : undefined}
        />
        {suffix && <span className="ln-suffix" aria-hidden="true">{suffix}</span>}
      </div>
      {note && !compact && <p className="ln-small">{note}</p>}
    </div>
  );
}

// ─── Styles: Ink & Signal ──────────────────────────────────────────────────────
// Reads the site's --c-* tokens when present, with the palette as fallback.
// Orange is only ever a background, always with black text.
const css = `
.ln{
  --i-bg:var(--c-bg,#F5F5F2);
  --i-ink:var(--c-ink,#0D0D0D);
  --i-mute:var(--c-mute,#55554F);
  --i-soft:var(--c-soft,#DEDED8);
  --i-accent:var(--c-accent,#FF6A1A);
  --i-on-accent:#0D0D0D;
  background:var(--i-bg);color:var(--i-ink);
  max-width:40rem;margin:0 auto;padding:2rem 1rem 3rem;line-height:1.6;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]) .ln{
    --i-bg:var(--c-bg,#0D0D0D);--i-ink:var(--c-ink,#F5F5F2);
    --i-mute:var(--c-mute,#B4B4AD);--i-soft:var(--c-soft,#2A2A27);
  }
}
:root[data-theme="dark"] .ln{
  --i-bg:var(--c-bg,#0D0D0D);--i-ink:var(--c-ink,#F5F5F2);
  --i-mute:var(--c-mute,#B4B4AD);--i-soft:var(--c-soft,#2A2A27);
}
.ln *{box-sizing:border-box}
.ln h1,.ln h2,.ln p,.ln dl,.ln dd{margin:0;padding:0}
.ln button,.ln input,.ln select{font:inherit;color:inherit}
.ln :focus-visible{outline:3px solid var(--i-ink);outline-offset:2px}
.ln bdi{unicode-bidi:isolate;font-variant-numeric:tabular-nums}

.ln-head{margin-bottom:1.75rem}
.ln-kicker{font-size:.85rem;font-weight:700;color:var(--i-mute);margin-bottom:.35rem}
.ln-h1{font-size:clamp(1.9rem,5vw,2.6rem);font-weight:900;line-height:1.15;margin-bottom:.6rem}
.ln-lead{color:var(--i-mute)}

.ln-box{border:2px solid var(--i-ink);border-radius:4px;padding:1.25rem;display:grid;gap:1.5rem}
@media (min-width:640px){.ln-box{padding:1.75rem}}
.ln-stack{display:grid;gap:1.1rem}
.ln-two{display:grid;gap:.75rem;grid-template-columns:repeat(2,minmax(0,1fr))}
.ln-fieldset{border:0;margin:0;padding:0;min-width:0}
.ln-label{display:block;font-size:.8rem;font-weight:700;margin-bottom:.35rem;padding:0}
.ln-label-flush{margin-bottom:0}
.ln-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.ln-small{margin-top:.35rem;font-size:.78rem;color:var(--i-mute)}
.ln-input{width:100%;border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);padding:.6rem .75rem;font-size:.95rem;font-weight:700;min-height:2.75rem}
.ln-center{text-align:center}
.ln-suffix-wrap{position:relative}
.ln-suffix{position:absolute;inset-inline-end:.75rem;top:50%;transform:translateY(-50%);font-size:.75rem;font-weight:700;color:var(--i-mute);pointer-events:none}

.ln-seg{display:grid;gap:.5rem;grid-template-columns:minmax(0,1fr)}
@media (min-width:560px){.ln-seg{grid-template-columns:repeat(2,minmax(0,1fr))}}
.ln-type{display:grid;gap:.3rem;align-content:start;text-align:start;border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);padding:.8rem;cursor:pointer}
.ln-type:hover{background:var(--i-soft)}
.ln-type[aria-pressed="true"]{background:var(--i-ink);color:var(--i-bg)}
.ln-type-title{font-size:.9rem;font-weight:800}
.ln-type-desc{font-size:.75rem;line-height:1.5}

.ln-btn{border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);padding:.45rem .85rem;font-size:.8rem;font-weight:700;cursor:pointer;min-height:2.5rem}
.ln-btn:hover{background:var(--i-soft)}
.ln-btn[aria-expanded="true"]{background:var(--i-ink);color:var(--i-bg)}
.ln-btn-full{width:100%}

.ln-out{display:grid;gap:1.25rem;border-top:2px solid var(--i-ink);padding-top:1.5rem}
.ln-result{background:var(--i-accent);color:var(--i-on-accent);border:2px solid var(--i-ink);border-radius:4px;padding:1.25rem 1.5rem}
.ln-result-label{font-size:.9rem;font-weight:700}
.ln-result-big{font-size:clamp(2rem,7vw,3rem);font-weight:900;line-height:1.15;margin:.2rem 0 1rem}
.ln-result-rows{border-top:2px solid var(--i-on-accent)}
.ln-result-rows>div{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.15rem 1rem;padding:.5rem 0;border-bottom:1px solid var(--i-on-accent);font-size:.9rem}
.ln-result-rows>div:last-child{border-bottom:0;padding-bottom:0}
.ln-result-rows dt{font-weight:600}
.ln-result-rows dd{font-weight:800}

.ln-ratio-labels{display:flex;justify-content:space-between;gap:1rem;font-size:.8rem;font-weight:700;margin-bottom:.4rem}
.ln-bar{display:flex;height:1.5rem;border:2px solid var(--i-ink);border-radius:4px;overflow:hidden}
.ln-bar-a{background:var(--i-ink)}
.ln-bar-b{background:var(--i-accent);border-inline-start:2px solid var(--i-bg)}

.ln-early{border:2px dashed var(--i-ink);border-radius:4px;padding:1rem}
.ln-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:space-between;align-items:center}
.ln-h2{font-size:.95rem;font-weight:800}
.ln-early-body{display:grid;gap:1rem;margin-top:1rem;padding-top:1rem;border-top:2px solid var(--i-ink)}
.ln-early-input{display:grid;gap:.5rem;grid-template-columns:minmax(0,1fr) 6rem;align-items:center}
.ln-rows{border:2px solid var(--i-ink);border-radius:4px}
.ln-rows>div{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.2rem 1rem;padding:.65rem .8rem;border-bottom:2px solid var(--i-ink);font-size:.85rem}
.ln-rows>div:last-child{border-bottom:0}
.ln-rows dt{font-weight:600;color:var(--i-mute)}
.ln-rows dd{font-weight:800}
.ln-rows-total{background:var(--i-soft)}
.ln-rows-total dt{color:var(--i-ink);font-weight:800}
.ln-saving{border:2px solid var(--i-ink);border-inline-start-width:8px;border-radius:4px;padding:.7rem .9rem;font-size:.9rem;font-weight:800}

.ln-table-wrap{margin-top:1rem;max-height:20rem;overflow:auto;border:2px solid var(--i-ink);border-radius:4px}
.ln-table{width:100%;border-collapse:collapse;font-size:.8rem;text-align:start;font-variant-numeric:tabular-nums;min-width:30rem}
.ln-table th,.ln-table td{padding:.5rem .6rem;text-align:start;border-bottom:1px solid var(--i-ink)}
.ln-table thead th{position:sticky;top:0;background:var(--i-ink);color:var(--i-bg);font-weight:800}
.ln-table tbody th{font-weight:800}
.ln-table tbody tr:nth-child(even){background:var(--i-soft)}

.ln-disclaimer{border:2px solid var(--i-ink);border-inline-start-width:8px;border-radius:4px;padding:.8rem 1rem;font-size:.8rem;color:var(--i-mute)}
`;