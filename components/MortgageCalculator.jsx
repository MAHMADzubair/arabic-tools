"use client";

import { useState, useMemo, useId } from "react";

/* ─── Country presets ────────────────────────────────────────────────────── */
const COUNTRIES = [
  { id: "sa", name: "السعودية",  currency: "SAR", symbol: "ر.س", rate: 4.5,  years: 25, downPct: 10, stamp: 0,   insurance: 0.5, note: "لا توجد رسوم تسجيل عقاري للمسكن الأول" },
  { id: "ae", name: "الإمارات",  currency: "AED", symbol: "د.إ", rate: 4.75, years: 25, downPct: 20, stamp: 4,   insurance: 0.4, note: "رسوم DLD 4٪ على قيمة العقار" },
  { id: "eg", name: "مصر",        currency: "EGP", symbol: "ج.م", rate: 27.5, years: 20, downPct: 20, stamp: 3,   insurance: 0.5, note: "معدلات متغيرة — راجع البنك" },
  { id: "pk", name: "باكستان",   currency: "PKR", symbol: "₨",  rate: 19.5, years: 20, downPct: 30, stamp: 3,   insurance: 0.5, note: "معدلات البنك الحكومي الحالية" },
  { id: "gb", name: "المملكة المتحدة", currency: "GBP", symbol: "£",  rate: 4.2,  years: 25, downPct: 10, stamp: 5,   insurance: 0.3, note: "SDLT تنطبق فوق £250,000" },
  { id: "us", name: "الولايات المتحدة", currency: "USD", symbol: "$",  rate: 6.8,  years: 30, downPct: 20, stamp: 1.5, insurance: 0.8, note: "PMI يُلغى عند 20٪ دفعة أولى" },
];

const RATE_TYPES = [
  { id: "fixed",    name: "ثابت", desc: "قسط ثابت طوال المدة" },
  { id: "variable", name: "متغير (5 ثابت + متغير)", desc: "ثابت 5 سنوات ثم يتغير" },
];

/* ─── Amortisation schedule ──────────────────────────────────────────────── */
function buildSchedule(principal, annualRate, years) {
  const n = years * 12;
  const r = annualRate / 100 / 12;
  if (r === 0) {
    const pmt = principal / n;
    return Array.from({ length: n }, (_, i) => ({
      month: i + 1, payment: pmt, principal: pmt, interest: 0, balance: principal - pmt * (i + 1),
    }));
  }
  const pmt = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  let balance = principal;
  return Array.from({ length: n }, (_, i) => {
    const interest = balance * r;
    const princ = pmt - interest;
    balance -= princ;
    return { month: i + 1, payment: pmt, principal: princ, interest, balance: Math.max(0, balance) };
  });
}

/* ─── Small UI pieces ────────────────────────────────────────────────────── */
function Range({ label, valueText, min, max, step, value, onChange, minText, midText, maxText }) {
  const id = useId();
  return (
    <div>
      <div className="mg-row">
        <label className="mg-label mg-label-flush" htmlFor={id}>{label}</label>
        <span className="mg-value"><bdi>{valueText}</bdi></span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="mg-range"
      />
      <div className="mg-range-marks" aria-hidden="true">
        <span>{minText}</span>
        {midText && <span>{midText}</span>}
        <span>{maxText}</span>
      </div>
    </div>
  );
}

function Switch({ label, hint, checked, onChange }) {
  const id = useId();
  return (
    <div className="mg-switch-row">
      <div>
        <p className="mg-switch-label" id={`${id}-l`}>{label}</p>
        <p className="mg-small"><bdi>{hint}</bdi></p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-l`}
        className="mg-btn mg-switch"
        onClick={() => onChange(!checked)}
      >
        {checked ? "مفعّل" : "معطّل"}
      </button>
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function MortgageCalculator() {
  const priceId = useId();

  const [countryId,   setCountryId]   = useState("sa");
  const [propPrice,   setPropPrice]   = useState(800000);
  const [downPct,     setDownPct]     = useState(10);
  const [interestRate,setInterestRate]= useState(4.5);
  const [loanYears,   setLoanYears]   = useState(25);
  const [rateType,    setRateType]    = useState("fixed");
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [includeStamp,     setIncludeStamp]     = useState(true);
  const [showSchedule,     setShowSchedule]     = useState(false);
  const [scheduleView,     setScheduleView]     = useState("yearly"); // yearly | monthly

  const country = COUNTRIES.find((c) => c.id === countryId);

  const handleCountryChange = (id) => {
    const c = COUNTRIES.find((x) => x.id === id);
    if (!c) return;
    setCountryId(id);
    setDownPct(c.downPct);
    setInterestRate(c.rate);
    setLoanYears(c.years);
  };

  // Calculation logic (unchanged)
  const result = useMemo(() => {
    if (!country || !propPrice) return null;
    const price   = Number(propPrice);
    const down    = price * (Number(downPct) / 100);
    const principal = price - down;
    if (principal <= 0) return null;

    const schedule = buildSchedule(principal, Number(interestRate), Number(loanYears));
    const pmt = schedule[0]?.payment || 0;
    const totalPaid = pmt * schedule.length;
    const totalInterest = totalPaid - principal;
    const stampFee   = includeStamp    ? price * (country.stamp / 100)   : 0;
    const insuranceFee = includeInsurance ? principal * (country.insurance / 100) : 0;
    const totalCost  = totalPaid + down + stampFee + insuranceFee;

    // Yearly summary
    const yearly = [];
    for (let y = 1; y <= Number(loanYears); y++) {
      const rows = schedule.filter((r) => r.month > (y - 1) * 12 && r.month <= y * 12);
      yearly.push({
        year: y,
        totalPayment: rows.reduce((s, r) => s + r.payment, 0),
        totalPrincipal: rows.reduce((s, r) => s + r.principal, 0),
        totalInterest: rows.reduce((s, r) => s + r.interest, 0),
        closingBalance: rows[rows.length - 1]?.balance || 0,
      });
    }

    return { principal, down, pmt, totalPaid, totalInterest, stampFee, insuranceFee, totalCost, schedule, yearly };
  }, [country, propPrice, downPct, interestRate, loanYears, includeInsurance, includeStamp]);

  const sym = country?.symbol || "";
  function fmt(n) { return `${sym} ${Math.round(n).toLocaleString("en-US")}`; }
  function fmtN(n) { return Math.round(n).toLocaleString("en-US"); }

  const interestPct = result ? ((result.totalInterest / result.totalPaid) * 100).toFixed(1) : 0;

  const summaryRows = result
    ? [
        { label: "قيمة العقار", value: fmt(Number(propPrice)) },
        { label: "الدفعة الأولى", value: fmt(result.down) },
        { label: "مبلغ القرض", value: fmt(result.principal) },
        { label: "إجمالي الأقساط", value: fmt(result.totalPaid) },
        { label: "إجمالي الفوائد", value: fmt(result.totalInterest) },
        result.stampFee > 0 && { label: "رسوم التسجيل", value: fmt(result.stampFee) },
        result.insuranceFee > 0 && { label: "تأمين الممتلكات (كامل)", value: fmt(result.insuranceFee) },
        { label: "التكلفة الإجمالية للتملك", value: fmt(result.totalCost), total: true },
      ].filter(Boolean)
    : [];

  return (
    <div className="mg" dir="rtl">
      <style>{css}</style>

      <header className="mg-head">
        <p className="mg-kicker">حاسبة التمويل العقاري</p>
        <h1 className="mg-h1">حاسبة الرهن والتمويل العقاري</h1>
        <p className="mg-lead">
          احسب قسطك الشهري، وإجمالي الفوائد، والتكلفة الكاملة لشراء العقار مع جدول سداد تفصيلي.
        </p>
      </header>

      <div className="mg-grid">
        {/* ─── Inputs ─── */}
        <div className="mg-col">
          {/* Country */}
          <section className="mg-box" aria-labelledby="mg-s1">
            <h2 className="mg-h2" id="mg-s1"><span className="mg-num">1</span><span>الدولة</span></h2>
            <div className="mg-seg mg-seg-3" role="group" aria-labelledby="mg-s1">
              {COUNTRIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="mg-btn"
                  aria-pressed={countryId === c.id}
                  onClick={() => handleCountryChange(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
            {country?.note && <p className="mg-note">{country.note}</p>}
          </section>

          {/* Property price + Down payment */}
          <section className="mg-box" aria-labelledby="mg-s2">
            <h2 className="mg-h2" id="mg-s2"><span className="mg-num">2</span><span>تفاصيل العقار والتمويل</span></h2>
            <div className="mg-stack">
              <div>
                <label className="mg-label" htmlFor={priceId}>قيمة العقار ({sym})</label>
                <div className="mg-suffix-wrap">
                  <input
                    id={priceId}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={propPrice}
                    onChange={(e) => setPropPrice(e.target.value)}
                    className="mg-input"
                    style={{ paddingInlineEnd: "3.5rem" }}
                  />
                  <span className="mg-suffix" aria-hidden="true">{sym}</span>
                </div>
              </div>

              <Range
                label="نسبة الدفعة الأولى"
                valueText={`${downPct}٪ = ${fmt(Number(propPrice) * downPct / 100)}`}
                min="5" max="80" step="5"
                value={downPct}
                onChange={(e) => setDownPct(e.target.value)}
                minText="5٪ (أدنى)" midText="20٪ (معياري)" maxText="80٪ (أعلى)"
              />

              {result && (
                <div className="mg-line">
                  <span>مبلغ القرض العقاري</span>
                  <strong><bdi>{fmt(result.principal)}</bdi></strong>
                </div>
              )}
            </div>
          </section>

          {/* Rate + Term */}
          <section className="mg-box" aria-labelledby="mg-s3">
            <h2 className="mg-h2" id="mg-s3"><span className="mg-num">3</span><span>معدل الفائدة ومدة القرض</span></h2>
            <div className="mg-stack mg-stack-lg">
              <div className="mg-two">
                <Range
                  label="معدل الفائدة السنوي"
                  valueText={`${interestRate}٪`}
                  min="1" max="35" step="0.25"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  minText="1٪" maxText="35٪"
                />
                <Range
                  label="مدة القرض"
                  valueText={`${loanYears} سنة`}
                  min="5" max="35" step="5"
                  value={loanYears}
                  onChange={(e) => setLoanYears(e.target.value)}
                  minText="5 سنوات" maxText="35 سنة"
                />
              </div>

              <fieldset className="mg-fieldset">
                <legend className="mg-label">نوع معدل الفائدة</legend>
                <div className="mg-seg mg-seg-2">
                  {RATE_TYPES.map((rt) => (
                    <button
                      key={rt.id}
                      type="button"
                      className="mg-btn mg-btn-tall"
                      aria-pressed={rateType === rt.id}
                      onClick={() => setRateType(rt.id)}
                    >
                      <span>{rt.name}</span>
                      <span className="mg-btn-sub">{rt.desc}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>

          {/* Fees toggles */}
          <section className="mg-box" aria-labelledby="mg-s4">
            <h2 className="mg-h2" id="mg-s4"><span className="mg-num">4</span><span>الرسوم والتأمين</span></h2>
            <div className="mg-stack mg-stack-lg">
              <Switch
                label={`رسوم التسجيل / الطوابع (${country?.stamp}٪)`}
                hint={result ? fmt(result.stampFee) : "—"}
                checked={includeStamp}
                onChange={setIncludeStamp}
              />
              <Switch
                label={`تأمين الممتلكات السنوي (${country?.insurance}٪)`}
                hint={result ? `${fmt(result.insuranceFee / Number(loanYears))} / سنة` : "—"}
                checked={includeInsurance}
                onChange={setIncludeInsurance}
              />
            </div>
          </section>
        </div>

        {/* ─── Results ─── */}
        <div className="mg-col">
          <div className="mg-sticky">
            {/* Monthly payment hero */}
            <section className="mg-result" aria-live="polite" aria-labelledby="mg-res-label">
              <p className="mg-result-label" id="mg-res-label">القسط الشهري</p>
              <p className="mg-result-big"><bdi>{result ? fmt(result.pmt) : "—"}</bdi></p>
              {result && (
                <>
                  <div className="mg-two mg-result-cells">
                    <div>
                      <p className="mg-result-sm">إجمالي الفوائد</p>
                      <p className="mg-result-val"><bdi>{fmt(result.totalInterest)}</bdi></p>
                    </div>
                    <div>
                      <p className="mg-result-sm">التكلفة الكاملة</p>
                      <p className="mg-result-val"><bdi>{fmt(result.totalCost)}</bdi></p>
                    </div>
                  </div>
                  <div className="mg-result-bar-wrap">
                    <div className="mg-result-sm mg-between">
                      <span>أصل القرض: <bdi>{(100 - interestPct).toFixed(1)}٪</bdi></span>
                      <span>فائدة: <bdi>{interestPct}٪</bdi></span>
                    </div>
                    <div
                      className="mg-bar"
                      role="img"
                      aria-label={`أصل القرض ${(100 - interestPct).toFixed(1)}٪ وفائدة ${interestPct}٪`}
                    >
                      <div className="mg-bar-a" style={{ flex: `${100 - interestPct} 1 0` }} />
                      <div className="mg-bar-b" style={{ flex: `${interestPct} 1 0` }} />
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* Summary */}
            {result && (
              <section className="mg-box" aria-labelledby="mg-sum">
                <h2 className="mg-h2 mg-h2-sm" id="mg-sum">ملخص التمويل</h2>
                <dl className="mg-rows">
                  {summaryRows.map((item) => (
                    <div key={item.label} className={item.total ? "mg-rows-total" : undefined}>
                      <dt>{item.label}</dt>
                      <dd><bdi>{item.value}</bdi></dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* Quick comparison */}
            {result && (
              <section className="mg-tip" aria-labelledby="mg-tip">
                <h2 className="mg-h2 mg-h2-sm" id="mg-tip">لو زدت الدفعة الأولى</h2>
                <dl className="mg-tip-rows">
                  {[25, 30, 40].map((pct) => {
                    if (pct <= Number(downPct)) return null;
                    const newPrincipal = Number(propPrice) * (1 - pct / 100);
                    const r = Number(interestRate) / 100 / 12;
                    const n = Number(loanYears) * 12;
                    const newPmt = r > 0 ? (newPrincipal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : newPrincipal / n;
                    return (
                      <div key={pct}>
                        <dt>عند {pct}٪ دفعة أولى</dt>
                        <dd><bdi>{sym} {Math.round(newPmt).toLocaleString("en-US")} / شهر</bdi></dd>
                      </div>
                    );
                  })}
                </dl>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Amortization Schedule */}
      {result && (
        <section className="mg-box mg-schedule" aria-labelledby="mg-sch">
          <div className="mg-row mg-row-wrap">
            <h2 className="mg-h2 mg-h2-flush" id="mg-sch">جدول السداد التفصيلي</h2>
            <div className="mg-actions">
              <div className="mg-seg mg-seg-2" role="group" aria-label="عرض الجدول">
                <button type="button" className="mg-btn" aria-pressed={scheduleView === "yearly"} onClick={() => setScheduleView("yearly")}>سنوي</button>
                <button type="button" className="mg-btn" aria-pressed={scheduleView === "monthly"} onClick={() => setScheduleView("monthly")}>شهري</button>
              </div>
              <button
                type="button"
                className="mg-btn"
                aria-expanded={showSchedule}
                aria-controls="mg-table"
                onClick={() => setShowSchedule(!showSchedule)}
              >
                {showSchedule ? "إخفاء" : "عرض الجدول"}
              </button>
            </div>
          </div>

          {showSchedule && (
            <div id="mg-table" className="mg-table-wrap" tabIndex={0} role="region" aria-label="جدول السداد">
              <table className="mg-table">
                <caption className="mg-sr">
                  {scheduleView === "yearly" ? "جدول السداد السنوي" : "جدول السداد الشهري"}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">{scheduleView === "yearly" ? "السنة" : "الشهر"}</th>
                    <th scope="col">القسط</th>
                    <th scope="col">الأصل</th>
                    <th scope="col">الفائدة</th>
                    <th scope="col">الرصيد المتبقي</th>
                  </tr>
                </thead>
                <tbody>
                  {(scheduleView === "yearly" ? result.yearly : result.schedule).map((row, idx) => (
                    <tr key={idx}>
                      <th scope="row">{scheduleView === "yearly" ? row.year : row.month}</th>
                      <td>{fmtN(scheduleView === "yearly" ? row.totalPayment : row.payment)}</td>
                      <td>{fmtN(scheduleView === "yearly" ? row.totalPrincipal : row.principal)}</td>
                      <td>{fmtN(scheduleView === "yearly" ? row.totalInterest : row.interest)}</td>
                      <td>{fmtN(scheduleView === "yearly" ? row.closingBalance : row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <p className="mg-disclaimer">
        تنبيه: الأرقام تقديرية للأغراض التخطيطية. لا تشمل رسوم الوساطة ورسوم التقييم العقاري وعمولات المصرف. استشر مستشاراً مالياً معتمداً قبل اتخاذ قرار الشراء.
      </p>
    </div>
  );
}

// ─── Styles: Ink & Signal ──────────────────────────────────────────────────────
// Reads the site's --c-* tokens when present, with the palette as fallback.
// Orange is only ever a background, always with black text.
const css = `
.mg{
  --i-bg:var(--c-bg,#F5F5F2);
  --i-ink:var(--c-ink,#0D0D0D);
  --i-mute:var(--c-mute,#55554F);
  --i-soft:var(--c-soft,#DEDED8);
  --i-accent:var(--c-accent,#FF6A1A);
  --i-on-accent:#0D0D0D;
  --i-light:#F5F5F2;
  background:var(--i-bg);color:var(--i-ink);
  max-width:64rem;margin:0 auto;padding:2rem 1rem 3rem;line-height:1.6;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]) .mg{
    --i-bg:var(--c-bg,#0D0D0D);--i-ink:var(--c-ink,#F5F5F2);
    --i-mute:var(--c-mute,#B4B4AD);--i-soft:var(--c-soft,#2A2A27);
  }
}
:root[data-theme="dark"] .mg{
  --i-bg:var(--c-bg,#0D0D0D);--i-ink:var(--c-ink,#F5F5F2);
  --i-mute:var(--c-mute,#B4B4AD);--i-soft:var(--c-soft,#2A2A27);
}
.mg *{box-sizing:border-box}
.mg h1,.mg h2,.mg p,.mg dl,.mg dd{margin:0;padding:0}
.mg button,.mg input,.mg select{font:inherit;color:inherit}
.mg :focus-visible{outline:3px solid var(--i-ink);outline-offset:2px}
.mg bdi{unicode-bidi:isolate;font-variant-numeric:tabular-nums}

.mg-head{margin-bottom:2rem;max-width:44rem}
.mg-kicker{font-size:.85rem;font-weight:700;color:var(--i-mute);margin-bottom:.35rem}
.mg-h1{font-size:clamp(2rem,5vw,3rem);font-weight:900;line-height:1.15;margin-bottom:.75rem}
.mg-lead{color:var(--i-mute);max-width:38rem}

.mg-grid{display:grid;gap:1.5rem;grid-template-columns:minmax(0,1fr)}
@media (min-width:1024px){.mg-grid{grid-template-columns:minmax(0,3fr) minmax(0,2fr);align-items:start}}
.mg-col{display:grid;gap:1.5rem;min-width:0}
.mg-sticky{display:grid;gap:1.5rem}
@media (min-width:1024px){.mg-sticky{position:sticky;top:1rem}}

.mg-box{border:2px solid var(--i-ink);border-radius:4px;padding:1.25rem}
.mg-h2{display:flex;align-items:center;gap:.65rem;font-size:1.1rem;font-weight:800;margin-bottom:1rem}
.mg-h2-sm{font-size:.95rem;margin-bottom:.75rem}
.mg-h2-flush{margin-bottom:0}
.mg-num{display:inline-flex;flex:none;width:1.75rem;height:1.75rem;align-items:center;justify-content:center;background:var(--i-ink);color:var(--i-bg);font-size:.85rem;font-weight:800;border-radius:2px}
.mg-stack{display:grid;gap:1.1rem}
.mg-stack-lg{gap:1.4rem}
.mg-two{display:grid;gap:1rem;grid-template-columns:minmax(0,1fr)}
@media (min-width:560px){.mg-two{grid-template-columns:repeat(2,minmax(0,1fr))}}
.mg-fieldset{border:0;margin:0;padding:0;min-width:0}
.mg-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

.mg-label{display:block;font-size:.8rem;font-weight:700;margin-bottom:.35rem;padding:0}
.mg-label-flush{margin-bottom:0}
.mg-small{font-size:.78rem;color:var(--i-mute)}
.mg-row{display:flex;justify-content:space-between;align-items:center;gap:.75rem;margin-bottom:.4rem}
.mg-row-wrap{flex-wrap:wrap;margin-bottom:0}
.mg-value{font-size:.85rem;font-weight:800}
.mg-input{width:100%;border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);padding:.6rem .75rem;font-size:.95rem;font-weight:700;min-height:2.75rem}
.mg-suffix-wrap{position:relative}
.mg-suffix{position:absolute;inset-inline-end:.75rem;top:50%;transform:translateY(-50%);font-size:.75rem;font-weight:700;color:var(--i-mute);pointer-events:none}
.mg-range{width:100%;accent-color:var(--i-accent);height:1.5rem;cursor:pointer}
.mg-range-marks{display:flex;justify-content:space-between;font-size:.7rem;color:var(--i-mute)}

.mg-btn{border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);padding:.45rem .75rem;font-size:.8rem;font-weight:700;cursor:pointer;min-height:2.5rem}
.mg-btn:hover{background:var(--i-soft)}
.mg-btn[aria-pressed="true"],.mg-btn[aria-expanded="true"],.mg-btn[aria-checked="true"]{background:var(--i-ink);color:var(--i-bg)}
.mg-btn-tall{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.1rem;line-height:1.35}
.mg-btn-sub{font-size:.7rem;font-weight:500}
.mg-seg{display:grid;gap:.4rem}
.mg-seg-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.mg-seg-3{grid-template-columns:repeat(2,minmax(0,1fr))}
@media (min-width:640px){.mg-seg-3{grid-template-columns:repeat(3,minmax(0,1fr))}}
.mg-note{margin-top:.75rem;border:2px dashed var(--i-ink);border-radius:4px;padding:.5rem .7rem;font-size:.8rem;font-weight:600}
.mg-line{display:flex;justify-content:space-between;gap:1rem;border:2px solid var(--i-ink);border-radius:4px;padding:.6rem .85rem;font-size:.85rem}

.mg-switch-row{display:flex;justify-content:space-between;align-items:center;gap:1rem}
.mg-switch-label{font-size:.88rem;font-weight:700}
.mg-switch{min-width:5rem}

.mg-result{background:var(--i-accent);color:var(--i-on-accent);border:2px solid var(--i-ink);border-radius:4px;padding:1.25rem 1.5rem}
.mg-result-label{font-size:.9rem;font-weight:700}
.mg-result-big{font-size:clamp(2rem,6vw,2.75rem);font-weight:900;line-height:1.15;margin:.2rem 0 1rem}
.mg-result-cells{grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem}
.mg-result-cells>div{border:2px solid var(--i-on-accent);border-radius:4px;padding:.6rem .7rem}
.mg-result-sm{font-size:.75rem;font-weight:600}
.mg-result-val{font-size:.95rem;font-weight:800}
.mg-between{display:flex;justify-content:space-between;gap:1rem}
.mg-result-bar-wrap{margin-top:1rem;display:grid;gap:.4rem}
.mg-bar{display:flex;height:1.4rem;border:2px solid var(--i-on-accent);border-radius:4px;overflow:hidden}
.mg-bar-a{background:var(--i-on-accent)}
.mg-bar-b{background:var(--i-light);border-inline-start:2px solid var(--i-on-accent)}

.mg-rows{border:2px solid var(--i-ink);border-radius:4px}
.mg-rows>div{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.15rem 1rem;padding:.55rem .8rem;border-bottom:1px solid var(--i-ink);font-size:.85rem}
.mg-rows>div:last-child{border-bottom:0}
.mg-rows dt{font-weight:600;color:var(--i-mute)}
.mg-rows dd{font-weight:800}
.mg-rows-total{background:var(--i-soft)}
.mg-rows-total dt{color:var(--i-ink);font-weight:800}

.mg-tip{border:2px dashed var(--i-ink);border-radius:4px;padding:1rem}
.mg-tip-rows>div{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.15rem 1rem;padding:.3rem 0;font-size:.85rem}
.mg-tip-rows dd{font-weight:800}

.mg-schedule{margin-top:2rem}
.mg-actions{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}
.mg-table-wrap{margin-top:1rem;max-height:26rem;overflow:auto;border:2px solid var(--i-ink);border-radius:4px}
.mg-table{width:100%;min-width:30rem;border-collapse:collapse;font-size:.8rem;font-variant-numeric:tabular-nums}
.mg-table th,.mg-table td{padding:.5rem .7rem;text-align:start;border-bottom:1px solid var(--i-ink)}
.mg-table thead th{position:sticky;top:0;background:var(--i-ink);color:var(--i-bg);font-weight:800}
.mg-table tbody th{font-weight:800}
.mg-table tbody tr:nth-child(even){background:var(--i-soft)}

.mg-disclaimer{margin-top:2rem;border:2px solid var(--i-ink);border-inline-start-width:8px;border-radius:4px;padding:.8rem 1rem;font-size:.8rem;color:var(--i-mute)}
`;