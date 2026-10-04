"use client";

import { useState, useMemo, useId } from "react";

const COUNTRIES = [
  {
    id: "sa",
    name: "السعودية",
    currency: "SAR",
    dayMultiplier: 1.5, // 100% + 50% (نظام العمل م 107)
    nightMultiplier: 1.5,
    weekendMultiplier: 1.5,
    lawNote: "نظام العمل السعودي (م/107): أجر الساعة + 50% من الأجر الأساسي",
    hoursDivisor: 240, // 30 days * 8 hours
  },
  {
    id: "ae",
    name: "الإمارات",
    currency: "AED",
    dayMultiplier: 1.25, // 100% + 25% (قانون 33 م 19)
    nightMultiplier: 1.5, // 100% + 50% (من 10 مساءً إلى 4 صباحاً)
    weekendMultiplier: 1.5,
    lawNote: "قانون العمل الإماراتي (م/19): أجر الساعة + 25% نهاراً، و + 50% ليلاً والعطل",
    hoursDivisor: 240,
  },
  {
    id: "kw",
    name: "الكويت",
    currency: "KWD",
    dayMultiplier: 1.25,
    nightMultiplier: 1.5,
    weekendMultiplier: 1.5,
    lawNote: "قانون العمل الكويتي (م/34): أجر الساعة + 25% نهاراً و + 50% للعطل والليل",
    hoursDivisor: 208, // 26 days * 8 hours
  },
  {
    id: "qa",
    name: "قطر",
    currency: "QAR",
    dayMultiplier: 1.25,
    nightMultiplier: 1.5,
    weekendMultiplier: 1.5,
    lawNote: "قانون العمل القطري (م/74): أجر الساعة + 25% نهاراً و + 50% ليلاً",
    hoursDivisor: 240,
  },
  {
    id: "eg",
    name: "مصر",
    currency: "EGP",
    dayMultiplier: 1.35, // 100% + 35% نهاراً
    nightMultiplier: 1.70, // 100% + 70% ليلاً
    weekendMultiplier: 2.0, // أجر مضاعف في العطل الرسمية
    lawNote: "قانون العمل المصري (م/85): أجر الساعة + 35% نهاراً، و + 70% ليلاً",
    hoursDivisor: 240,
  },
];

function toNum(v) {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

function HoursField({ label, value, onChange, multiplier }) {
  const id = useId();
  return (
    <div>
      <label className="ot-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={`${id}-m`}
        className="ot-input ot-center"
      />
      <p className="ot-mult" id={`${id}-m`}>× <bdi>{Math.round(multiplier * 100)}%</bdi></p>
    </div>
  );
}

export default function OvertimeCalculator({ initialCountry = "sa" }) {
  const salaryId = useId();

  const [countryId, setCountryId] = useState(initialCountry);
  const [salary, setSalary] = useState("8000");
  const [dayHours, setDayHours] = useState("10");
  const [nightHours, setNightHours] = useState("0");
  const [weekendHours, setWeekendHours] = useState("0");

  const country = COUNTRIES.find((c) => c.id === countryId) || COUNTRIES[0];

  // Calculation logic (unchanged)
  const results = useMemo(() => {
    const s = toNum(salary);
    const dH = toNum(dayHours);
    const nH = toNum(nightHours);
    const wH = toNum(weekendHours);

    // Hourly wage = Monthly basic wage / monthly standard hours
    const hourlyWage = s > 0 ? s / country.hoursDivisor : 0;

    const dayRate = hourlyWage * country.dayMultiplier;
    const nightRate = hourlyWage * country.nightMultiplier;
    const weekendRate = hourlyWage * country.weekendMultiplier;

    const dayAmount = dH * dayRate;
    const nightAmount = nH * nightRate;
    const weekendAmount = wH * weekendRate;

    const totalOvertimePay = dayAmount + nightAmount + weekendAmount;
    const totalSalaryWithOvertime = s + totalOvertimePay;
    const totalHours = dH + nH + wH;

    return {
      hourlyWage,
      dayRate,
      nightRate,
      weekendRate,
      dayAmount,
      nightAmount,
      weekendAmount,
      totalOvertimePay,
      totalSalaryWithOvertime,
      totalHours,
    };
  }, [salary, dayHours, nightHours, weekendHours, country]);

  const fmt = (n) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="ot" dir="rtl">
      <style>{css}</style>

      <header className="ot-head">
        <p className="ot-kicker">وفق قوانين العمل 2026</p>
        <h1 className="ot-h1">حاسبة العمل الإضافي (أوفر تايم)</h1>
        <p className="ot-lead">
          احسب أجر ساعات العمل الإضافية النهارية والليلية والعطلات وفق الأنظمة المعتمدة.
        </p>
      </header>

      <div className="ot-box">
        {/* Country Selection */}
        <fieldset className="ot-fieldset">
          <legend className="ot-label">دولة العمل والنظام القانوني</legend>
          <div className="ot-seg">
            {COUNTRIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className="ot-btn"
                aria-pressed={countryId === c.id}
                onClick={() => setCountryId(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
          <p className="ot-note">{country.lawNote}</p>
        </fieldset>

        {/* Salary Input */}
        <div>
          <label className="ot-label" htmlFor={salaryId}>
            الراتب الشهري الأساسي ({country.currency})
          </label>
          <div className="ot-suffix-wrap">
            <input
              id={salaryId}
              type="number"
              inputMode="decimal"
              placeholder="مثال: 8000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="ot-input"
              style={{ paddingInlineEnd: "3.5rem" }}
            />
            <span className="ot-suffix" aria-hidden="true">{country.currency}</span>
          </div>
          <p className="ot-small">
            أجر الساعة الأساسي = <bdi>{fmt(results.hourlyWage)} {country.currency}</bdi> (مبني على <bdi>{country.hoursDivisor}</bdi> ساعة عمل شهرية)
          </p>
        </div>

        {/* Overtime Hours Inputs */}
        <fieldset className="ot-fieldset ot-hours">
          <legend className="ot-label">ساعات العمل الإضافي المنجزة هذا الشهر</legend>
          <div className="ot-three">
            <HoursField label="ساعات نهارية" value={dayHours} onChange={setDayHours} multiplier={country.dayMultiplier} />
            <HoursField label="ساعات ليلية" value={nightHours} onChange={setNightHours} multiplier={country.nightMultiplier} />
            <HoursField label="عطلات وأعياد" value={weekendHours} onChange={setWeekendHours} multiplier={country.weekendMultiplier} />
          </div>
        </fieldset>

        {/* Results */}
        {results.totalHours > 0 ? (
          <section className="ot-result" aria-live="polite" aria-labelledby="ot-res-label">
            <p className="ot-result-label" id="ot-res-label">صافي بدل العمل الإضافي المستحق</p>
            <p className="ot-result-big"><bdi>{fmt(results.totalOvertimePay)} {country.currency}</bdi></p>
            <dl className="ot-result-rows">
              <div>
                <dt>إجمالي ساعات العمل الإضافي</dt>
                <dd><bdi>{results.totalHours}</bdi> ساعة</dd>
              </div>
              <div>
                <dt>أجر الساعة الإضافية العادية</dt>
                <dd><bdi>{fmt(results.dayRate)} {country.currency}</bdi></dd>
              </div>
              <div>
                <dt>إجمالي الراتب مع العمل الإضافي</dt>
                <dd><bdi>{fmt(results.totalSalaryWithOvertime)} {country.currency}</bdi></dd>
              </div>
            </dl>
          </section>
        ) : (
          <p className="ot-empty" role="status">أدخل عدد الساعات الإضافية لإظهار النتيجة.</p>
        )}
      </div>
    </div>
  );
}

// ─── Styles: Ink & Signal ──────────────────────────────────────────────────────
// Reads the site's --c-* tokens when present, with the palette as fallback.
// Orange is only ever a background, always with black text.
const css = `
.ot{
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
  :root:not([data-theme="light"]) .ot{
    --i-bg:var(--c-bg,#0D0D0D);--i-ink:var(--c-ink,#F5F5F2);
    --i-mute:var(--c-mute,#B4B4AD);--i-soft:var(--c-soft,#2A2A27);
  }
}
:root[data-theme="dark"] .ot{
  --i-bg:var(--c-bg,#0D0D0D);--i-ink:var(--c-ink,#F5F5F2);
  --i-mute:var(--c-mute,#B4B4AD);--i-soft:var(--c-soft,#2A2A27);
}
.ot *{box-sizing:border-box}
.ot h1,.ot p,.ot dl,.ot dd{margin:0;padding:0}
.ot button,.ot input{font:inherit;color:inherit}
.ot :focus-visible{outline:3px solid var(--i-ink);outline-offset:2px}
.ot bdi{unicode-bidi:isolate;font-variant-numeric:tabular-nums}

.ot-head{margin-bottom:1.75rem}
.ot-kicker{font-size:.85rem;font-weight:700;color:var(--i-mute);margin-bottom:.35rem}
.ot-h1{font-size:clamp(1.9rem,5vw,2.6rem);font-weight:900;line-height:1.15;margin-bottom:.6rem}
.ot-lead{color:var(--i-mute)}

.ot-box{border:2px solid var(--i-ink);border-radius:4px;padding:1.25rem;display:grid;gap:1.5rem}
@media (min-width:640px){.ot-box{padding:1.75rem}}
.ot-fieldset{border:0;margin:0;padding:0;min-width:0}
.ot-label{display:block;font-size:.8rem;font-weight:700;margin-bottom:.4rem;padding:0}
.ot-small{margin-top:.4rem;font-size:.78rem;color:var(--i-mute)}
.ot-note{margin-top:.75rem;border:2px dashed var(--i-ink);border-radius:4px;padding:.5rem .7rem;font-size:.8rem;font-weight:600}

.ot-seg{display:grid;gap:.4rem;grid-template-columns:repeat(2,minmax(0,1fr))}
@media (min-width:560px){.ot-seg{grid-template-columns:repeat(3,minmax(0,1fr))}}
.ot-btn{border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);padding:.45rem .75rem;font-size:.85rem;font-weight:700;cursor:pointer;min-height:2.6rem}
.ot-btn:hover{background:var(--i-soft)}
.ot-btn[aria-pressed="true"]{background:var(--i-ink);color:var(--i-bg)}

.ot-input{width:100%;border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);padding:.6rem .75rem;font-size:.95rem;font-weight:700;min-height:2.75rem}
.ot-center{text-align:center}
.ot-suffix-wrap{position:relative}
.ot-suffix{position:absolute;inset-inline-end:.75rem;top:50%;transform:translateY(-50%);font-size:.75rem;font-weight:700;color:var(--i-mute);pointer-events:none}

.ot-hours{border:2px solid var(--i-ink);border-radius:4px;padding:1rem}
.ot-hours .ot-label{padding:0 .35rem}
.ot-three{display:grid;gap:.75rem;grid-template-columns:repeat(3,minmax(0,1fr))}
@media (max-width:420px){.ot-three{grid-template-columns:minmax(0,1fr)}}
.ot-mult{margin-top:.3rem;text-align:center;font-size:.78rem;font-weight:700;color:var(--i-mute)}

.ot-result{background:var(--i-accent);color:var(--i-on-accent);border:2px solid var(--i-ink);border-radius:4px;padding:1.25rem 1.5rem}
.ot-result-label{font-size:.9rem;font-weight:700}
.ot-result-big{font-size:clamp(2rem,7vw,3rem);font-weight:900;line-height:1.15;margin:.2rem 0 1rem}
.ot-result-rows{border-top:2px solid var(--i-on-accent)}
.ot-result-rows>div{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.15rem 1rem;padding:.5rem 0;border-bottom:1px solid var(--i-on-accent);font-size:.9rem}
.ot-result-rows>div:last-child{border-bottom:0;padding-bottom:0}
.ot-result-rows dt{font-weight:600}
.ot-result-rows dd{font-weight:800}
.ot-empty{border:2px dashed var(--i-ink);border-radius:4px;padding:1rem;text-align:center;font-weight:700;font-size:.9rem}
`;