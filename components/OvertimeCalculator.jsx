"use client";

/**
 * components/OvertimeCalculator.jsx
 * Qemlo redesign — glossy orange / ink, SVG icons, 26px radius, dark + light.
 * Calculation logic is IDENTICAL to the previous version.
 * Theme: reads global tokens (--bg, --surface, --border, --text, --text-2, --text-3,
 * --orange, --on-orange) and the older --c-* tokens, with prefers-color-scheme fallback.
 */
import { useState, useMemo, useId } from "react";

const COUNTRIES = [
  {
    id: "sa", code: "SA", name: "السعودية", currency: "SAR",
    dayMultiplier: 1.5, nightMultiplier: 1.5, weekendMultiplier: 1.5,
    lawNote: "نظام العمل السعودي (م/107): أجر الساعة + 50% من الأجر الأساسي",
    hoursDivisor: 240,
  },
  {
    id: "ae", code: "AE", name: "الإمارات", currency: "AED",
    dayMultiplier: 1.25, nightMultiplier: 1.5, weekendMultiplier: 1.5,
    lawNote: "قانون العمل الإماراتي (م/19): أجر الساعة + 25% نهاراً، و + 50% ليلاً والعطل",
    hoursDivisor: 240,
  },
  {
    id: "kw", code: "KW", name: "الكويت", currency: "KWD",
    dayMultiplier: 1.25, nightMultiplier: 1.5, weekendMultiplier: 1.5,
    lawNote: "قانون العمل الكويتي (م/34): أجر الساعة + 25% نهاراً و + 50% للعطل والليل",
    hoursDivisor: 208,
  },
  {
    id: "qa", code: "QA", name: "قطر", currency: "QAR",
    dayMultiplier: 1.25, nightMultiplier: 1.5, weekendMultiplier: 1.5,
    lawNote: "قانون العمل القطري (م/74): أجر الساعة + 25% نهاراً و + 50% ليلاً",
    hoursDivisor: 240,
  },
  {
    id: "eg", code: "EG", name: "مصر", currency: "EGP",
    dayMultiplier: 1.35, nightMultiplier: 1.7, weekendMultiplier: 2.0,
    lawNote: "قانون العمل المصري (م/85): أجر الساعة + 35% نهاراً، و + 70% ليلاً",
    hoursDivisor: 240,
  },
];

function toNum(v) {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const ICONS = {
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" /></>,
  wallet: <><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a1 1 0 0 1 1 1v2" /><path d="M3 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3" /><path d="M21 9.5h-4a2.5 2.5 0 0 0 0 5h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5z" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  bolt: <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7z" />,
};

function Icon({ name, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {ICONS[name]}
    </svg>
  );
}

function HoursField({ label, icon, value, onChange, multiplier }) {
  const id = useId();
  return (
    <div className="ot-hour">
      <label className="ot-hour-label" htmlFor={id}>
        <span className="ot-chip"><Icon name={icon} size={16} /></span>
        {label}
      </label>
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
  const allowancesId = useId();

  const [countryId, setCountryId] = useState(initialCountry);
  const [salary, setSalary] = useState("8000");
  const [allowances, setAllowances] = useState("0");
  const [dayHours, setDayHours] = useState("10");
  const [nightHours, setNightHours] = useState("0");
  const [weekendHours, setWeekendHours] = useState("0");

  const country = COUNTRIES.find((c) => c.id === countryId) || COUNTRIES[0];

  const results = useMemo(() => {
    const s = toNum(salary);
    const dH = toNum(dayHours);
    const nH = toNum(nightHours);
    const wH = toNum(weekendHours);

    let hourlyWage = 0;
    let basicHourlyWage = 0;
    let actualHourlyWage = 0;
    let actualMonthlyWage = s;
    let dayRate = 0;
    let nightRate = 0;
    let weekendRate = 0;

    if (country.id === "sa") {
      const basic = s;
      const allw = toNum(allowances);
      const actual = basic + allw;
      actualMonthlyWage = actual;

      basicHourlyWage = basic > 0 ? basic / country.hoursDivisor : 0;
      actualHourlyWage = actual > 0 ? actual / country.hoursDivisor : 0;

      // Saudi Art. 107: OT rate = actual hourly wage + 50% of basic hourly wage
      const saudiOtRate = actualHourlyWage + 0.5 * basicHourlyWage;
      hourlyWage = basicHourlyWage;
      dayRate = saudiOtRate;
      nightRate = saudiOtRate;
      weekendRate = saudiOtRate;
    } else {
      hourlyWage = s > 0 ? s / country.hoursDivisor : 0;
      basicHourlyWage = hourlyWage;
      actualHourlyWage = hourlyWage;

      dayRate = hourlyWage * country.dayMultiplier;
      nightRate = hourlyWage * country.nightMultiplier;
      weekendRate = hourlyWage * country.weekendMultiplier;
    }

    const dayAmount = dH * dayRate;
    const nightAmount = nH * nightRate;
    const weekendAmount = wH * weekendRate;

    const totalOvertimePay = dayAmount + nightAmount + weekendAmount;
    const totalSalaryWithOvertime = actualMonthlyWage + totalOvertimePay;
    const totalHours = dH + nH + wH;

    return {
      hourlyWage, basicHourlyWage, actualHourlyWage, actualMonthlyWage,
      dayRate, nightRate, weekendRate,
      dayAmount, nightAmount, weekendAmount,
      totalOvertimePay, totalSalaryWithOvertime, totalHours,
    };
  }, [salary, allowances, dayHours, nightHours, weekendHours, country]);

  const fmt = (n) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="ot" dir="rtl">
      <style>{css}</style>

      <header className="ot-head">
        <p className="ot-kicker"><Icon name="bolt" size={14} /> وفق قوانين العمل 2026</p>
        <h1 className="ot-h1">حاسبة العمل الإضافي (أوفر تايم)</h1>
        <p className="ot-lead">
          احسب أجر ساعات العمل الإضافية النهارية والليلية والعطلات وفق الأنظمة المعتمدة.
        </p>
      </header>

      <div className="ot-box">
        {/* Country */}
        <fieldset className="ot-fieldset">
          <legend className="ot-title"><span className="ot-tile"><Icon name="globe" /></span> دولة العمل والنظام القانوني</legend>
          <div className="ot-seg">
            {COUNTRIES.map((c) => {
              const on = countryId === c.id;
              return (
                <button key={c.id} type="button" className="ot-btn" aria-pressed={on} onClick={() => setCountryId(c.id)}>
                  <span className="ot-btn-top">
                    <span className="ot-code" aria-hidden="true">{c.code}</span>
                    {on && <Icon name="check" size={16} />}
                  </span>
                  <span className="ot-btn-name">{c.name}</span>
                </button>
              );
            })}
          </div>
          <p className="ot-note"><span className="ot-ico"><Icon name="info" size={18} /></span><span>{country.lawNote}</span></p>
        </fieldset>

        {/* Salary */}
        <div className="ot-sect">
          <label className="ot-title" htmlFor={salaryId}>
            <span className="ot-tile"><Icon name="wallet" /></span>
            الراتب الشهري الأساسي ({country.currency})
          </label>
          <div className="ot-suffix-wrap">
            <input
              id={salaryId}
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="مثال: 8000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="ot-input ot-big"
              style={{ paddingInlineEnd: "4rem" }}
            />
            <span className="ot-suffix" aria-hidden="true">{country.currency}</span>
          </div>
          <p className="ot-small">
            أجر الساعة الأساسي = <bdi>{fmt(results.hourlyWage)} {country.currency}</bdi> (مبني على <bdi>{country.hoursDivisor}</bdi> ساعة عمل شهرية)
          </p>
        </div>

        {/* Allowances (SA only) */}
        {country.id === "sa" && (
          <div className="ot-sect">
            <label className="ot-title" htmlFor={allowancesId}>
              <span className="ot-tile"><Icon name="wallet" /></span>
              البدلات الشهرية الثابتة الخاضعة للأجر الفعلي (سكن، نقل، أخرى) ({country.currency})
            </label>
            <div className="ot-suffix-wrap">
              <input
                id={allowancesId}
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="مثال: 3000"
                value={allowances}
                onChange={(e) => setAllowances(e.target.value)}
                className="ot-input ot-big"
                style={{ paddingInlineEnd: "4rem" }}
              />
              <span className="ot-suffix" aria-hidden="true">{country.currency}</span>
            </div>
            <p className="ot-small">
              الأجر الفعلي = <bdi>{fmt(results.actualMonthlyWage)} {country.currency}</bdi> (أجر الساعة الفعلي = <bdi>{fmt(results.actualHourlyWage)} {country.currency}</bdi> + 50٪ من الأساسي = <bdi>{fmt(results.basicHourlyWage * 0.5)} {country.currency}</bdi>)
            </p>
          </div>
        )}

        {/* Hours */}
        <fieldset className="ot-fieldset ot-hours">
          <legend className="ot-title"><span className="ot-tile"><Icon name="clock" /></span> ساعات العمل الإضافي المنجزة هذا الشهر</legend>
          <div className="ot-three">
            <HoursField label="ساعات نهارية" icon="sun" value={dayHours} onChange={setDayHours} multiplier={country.dayMultiplier} />
            <HoursField label="ساعات ليلية" icon="moon" value={nightHours} onChange={setNightHours} multiplier={country.nightMultiplier} />
            <HoursField label="عطلات وأعياد" icon="calendar" value={weekendHours} onChange={setWeekendHours} multiplier={country.weekendMultiplier} />
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
                <dt>
                  {country.id === "sa"
                    ? "أجر الساعة الإضافية (الفعلي + 50٪ من الأساسي)"
                    : "أجر الساعة الإضافية العادية"}
                </dt>
                <dd><bdi>{fmt(results.dayRate)} {country.currency}</bdi></dd>
              </div>
              {country.id === "sa" && (
                <div>
                  <dt>إجمالي الأجر الشهري الفعلي (الأساسي + البدلات)</dt>
                  <dd><bdi>{fmt(results.actualMonthlyWage)} {country.currency}</bdi></dd>
                </div>
              )}
              <div>
                <dt>إجمالي الراتب مع العمل الإضافي</dt>
                <dd><bdi>{fmt(results.totalSalaryWithOvertime)} {country.currency}</bdi></dd>
              </div>
            </dl>
          </section>
        ) : (
          <p className="ot-empty" role="status">
            <Icon name="clock" size={18} /> أدخل عدد الساعات الإضافية لإظهار النتيجة.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const css = `
.ot{
  --f-bg:#F5F5F2; --f-surface:#FFFFFF; --f-line:#E1E1DA; --f-ink:#0D0D0D; --f-t2:#55554F; --f-t3:#8A8A82;
  --f-soft:rgba(13,13,13,.04); --f-shadow:0 1px 0 rgba(255,255,255,.9) inset, 0 12px 32px -18px rgba(13,13,13,.28);
}
@media (prefers-color-scheme:dark){
  .ot{
    --f-bg:#0D0D0D; --f-surface:#171717; --f-line:#2A2A27; --f-ink:#F5F5F2; --f-t2:#B4B4AC; --f-t3:#7C7C75;
    --f-soft:rgba(255,255,255,.05); --f-shadow:0 1px 0 rgba(255,255,255,.06) inset, 0 16px 36px -20px rgba(0,0,0,.9);
  }
}
.ot{
  --i-ink:var(--text,var(--c-ink,var(--f-ink)));
  --i-mute:var(--text-2,var(--c-mute,var(--f-t2)));
  --i-dim:var(--text-3,var(--f-t3));
  --i-surface:var(--surface,var(--f-surface));
  --i-bg:var(--bg,var(--c-bg,var(--f-bg)));
  --i-line:var(--border,var(--f-line));
  --i-orange:var(--orange,#FF5B04);
  --i-on:var(--on-orange,#0D0D0D);
  --i-gloss:linear-gradient(165deg,#FF9A52 0%,#FF5B04 46%,#E14600 100%);
  --i-gloss-sh:inset 0 1px 0 rgba(255,255,255,.5), inset 0 -3px 8px rgba(120,30,0,.25), 0 14px 28px -12px rgba(255,91,4,.6);
  --i-r:26px; --i-r-sm:16px;
  color:var(--i-ink); max-width:42rem; margin:0 auto; padding:2rem 1rem 3rem; line-height:1.6;
}
@media (min-width:640px){ .ot{ padding:3rem 1.5rem 4rem; } }
.ot *{box-sizing:border-box}
.ot h1,.ot p,.ot dl,.ot dd{margin:0;padding:0}
.ot button,.ot input{font:inherit;color:inherit}
.ot :focus-visible{outline:3px solid var(--i-orange);outline-offset:2px}
.ot bdi{unicode-bidi:isolate;font-variant-numeric:tabular-nums}

/* Header */
.ot-head{margin-bottom:1.75rem;display:grid;gap:.75rem;justify-items:start}
.ot-kicker{display:inline-flex;align-items:center;gap:.375rem;padding:.375rem 1rem;border-radius:999px;background:var(--i-gloss);color:var(--i-on);font-size:.8125rem;font-weight:800;box-shadow:var(--i-gloss-sh)}
.ot-h1{font-size:clamp(1.6rem,5vw,2.375rem);font-weight:800;line-height:1.25}
.ot-lead{color:var(--i-mute)}

/* Container */
.ot-box{background:var(--i-surface);border:1px solid var(--i-line);border-radius:var(--i-r);padding:1.25rem;display:grid;gap:1.5rem;box-shadow:var(--f-shadow)}
@media (min-width:640px){.ot-box{padding:1.75rem}}
.ot-fieldset{border:0;margin:0;padding:0;min-width:0}
.ot-sect{display:grid;gap:.625rem}

/* Titles */
.ot-title{display:flex;align-items:center;gap:.75rem;font-size:1rem;font-weight:800;line-height:1.5;padding:0;margin-bottom:.75rem}
.ot-sect .ot-title{margin-bottom:0}
.ot-tile{flex:none;width:2.5rem;height:2.5rem;display:inline-flex;align-items:center;justify-content:center;border-radius:14px;background:var(--i-gloss);color:var(--i-on);box-shadow:var(--i-gloss-sh)}
.ot-small{font-size:.8125rem;color:var(--i-mute);line-height:1.8}
.ot-ico{flex:none;display:inline-flex;margin-top:.15rem;color:var(--i-orange)}
.ot-note{margin-top:.75rem;display:flex;gap:.625rem;align-items:flex-start;border:1px dashed var(--i-dim);border-radius:var(--i-r-sm);background:var(--f-soft);padding:.75rem .875rem;font-size:.875rem;line-height:1.8;color:var(--i-mute)}

/* Country picker */
.ot-seg{display:grid;gap:.625rem;grid-template-columns:repeat(2,minmax(0,1fr))}
@media (min-width:560px){.ot-seg{grid-template-columns:repeat(3,minmax(0,1fr))}}
.ot-btn{position:relative;overflow:hidden;display:grid;gap:.125rem;text-align:start;min-height:4.25rem;padding:.75rem .875rem;border:1.5px solid var(--i-line);border-radius:20px;background:var(--i-surface);cursor:pointer;transition:border-color .15s,transform .15s}
.ot-btn:hover{border-color:var(--i-orange);transform:translateY(-2px)}
.ot-btn[aria-pressed="true"]{background:var(--i-gloss);border-color:transparent;color:var(--i-on);box-shadow:var(--i-gloss-sh)}
.ot-btn[aria-pressed="true"]::before{content:"";position:absolute;inset:0 0 55% 0;background:linear-gradient(180deg,rgba(255,255,255,.32),rgba(255,255,255,0));pointer-events:none}
.ot-btn-top{position:relative;display:flex;align-items:center;justify-content:space-between}
.ot-code{border:1.5px solid currentColor;border-radius:8px;padding:0 .4rem;font-size:.75rem;font-weight:800;line-height:1.6}
.ot-btn-name{position:relative;font-size:.9375rem;font-weight:800}

/* Inputs */
.ot-input{width:100%;border:1.5px solid var(--i-line);border-radius:var(--i-r-sm);background:var(--i-bg);padding:.6rem .875rem;font-size:.9375rem;font-weight:700;min-height:3.25rem;transition:border-color .15s,box-shadow .15s}
.ot-input:hover{border-color:var(--i-dim)}
.ot-input:focus-visible{outline:none;border-color:var(--i-orange);box-shadow:0 0 0 4px color-mix(in srgb,var(--i-orange) 28%,transparent)}
.ot-big{font-size:1.375rem;font-weight:800;min-height:3.5rem}
.ot-center{text-align:center}
.ot-suffix-wrap{position:relative}
.ot-suffix{position:absolute;inset-inline-end:.875rem;top:50%;transform:translateY(-50%);font-size:.75rem;font-weight:800;color:var(--i-mute);pointer-events:none}

/* Hours */
.ot-hours{border:1px dashed var(--i-dim);border-radius:var(--i-r);padding:1.125rem;background:var(--f-soft)}
.ot-hours .ot-title{padding:0 .375rem;margin-bottom:0}
.ot-three{display:grid;gap:.875rem;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:.875rem}
@media (max-width:480px){.ot-three{grid-template-columns:minmax(0,1fr)}}
.ot-hour{display:grid;gap:.5rem;align-content:start}
.ot-hour-label{display:flex;align-items:center;gap:.5rem;font-size:.875rem;font-weight:700}
.ot-chip{flex:none;width:1.75rem;height:1.75rem;display:inline-flex;align-items:center;justify-content:center;border-radius:10px;background:#0D0D0D;color:#FF7A33}
@media (prefers-color-scheme:dark){.ot-chip{background:#2A2A27}}
.ot-mult{text-align:center;font-size:.8125rem;font-weight:800;color:var(--i-orange)}

/* Result */
.ot-result{position:relative;overflow:hidden;background:var(--i-gloss);color:var(--i-on);border-radius:var(--i-r);padding:1.5rem 1.25rem;box-shadow:var(--i-gloss-sh)}
.ot-result::before{content:"";position:absolute;inset:0 0 60% 0;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.34),rgba(255,255,255,0))}
.ot-result>*{position:relative}
.ot-result-label{font-size:.9375rem;font-weight:800}
.ot-result-big{font-size:clamp(2rem,8vw,3rem);font-weight:800;line-height:1.15;margin:.25rem 0 1rem;overflow-wrap:anywhere}
.ot-result-rows{border-top:1.5px solid rgba(13,13,13,.55)}
.ot-result-rows>div{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.15rem 1rem;padding:.625rem 0;border-bottom:1px solid rgba(13,13,13,.3);font-size:.9rem}
.ot-result-rows>div:last-child{border-bottom:0;padding-bottom:0}
.ot-result-rows dt{font-weight:600}
.ot-result-rows dd{font-weight:800}
.ot-empty{display:flex;align-items:center;justify-content:center;gap:.5rem;border:1px dashed var(--i-dim);border-radius:var(--i-r);padding:1.125rem;font-weight:700;font-size:.9rem;color:var(--i-mute);background:var(--f-soft)}

@media (prefers-reduced-motion:reduce){.ot *{transition:none!important}.ot-btn:hover{transform:none}}
`;