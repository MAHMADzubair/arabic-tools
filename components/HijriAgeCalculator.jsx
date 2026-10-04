"use client";

import { useState, useMemo, useEffect, useId } from "react";

/* ─── Hijri Months Reference ──────────────────────────────────────────────── */
const HIJRI_MONTHS = [
  { id: 1, name: "محرم", days: 30 },
  { id: 2, name: "صفر", days: 29 },
  { id: 3, name: "ربيع الأول", days: 30 },
  { id: 4, name: "ربيع الآخر", days: 29 },
  { id: 5, name: "جمادى الأولى", days: 30 },
  { id: 6, name: "جمادى الآخرة", days: 29 },
  { id: 7, name: "رجب", days: 30 },
  { id: 8, name: "شعبان", days: 29 },
  { id: 9, name: "رمضان", days: 30 },
  { id: 10, name: "شوال", days: 29 },
  { id: 11, name: "ذو القعدة", days: 30 },
  { id: 12, name: "ذو الحجة", days: 30 },
];

const WEEK_DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const ZODIAC_SIGNS = [
  { name: "الجدي", start: [12, 22], end: [1, 19], symbol: "♑" },
  { name: "الدلو", start: [1, 20], end: [2, 18], symbol: "♒" },
  { name: "الحوت", start: [2, 19], end: [3, 20], symbol: "♓" },
  { name: "الحمل", start: [3, 21], end: [4, 19], symbol: "♈" },
  { name: "الثور", start: [4, 20], end: [5, 20], symbol: "♉" },
  { name: "الجوزاء", start: [5, 21], end: [6, 20], symbol: "♊" },
  { name: "السرطان", start: [6, 21], end: [7, 22], symbol: "♋" },
  { name: "الأسد", start: [7, 23], end: [8, 22], symbol: "♌" },
  { name: "العذراء", start: [8, 23], end: [9, 22], symbol: "♍" },
  { name: "الميزان", start: [9, 23], end: [10, 22], symbol: "♎" },
  { name: "العقرب", start: [10, 23], end: [11, 21], symbol: "♏" },
  { name: "القوس", start: [11, 22], end: [12, 21], symbol: "♐" },
];

function getZodiac(month, day) {
  for (const z of ZODIAC_SIGNS) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if (sm === 12 && em === 1) {
      if ((month === 12 && day >= sd) || (month === 1 && day <= ed)) return z;
    } else {
      if ((month === sm && day >= sd) || (month === em && day <= ed)) return z;
    }
  }
  return ZODIAC_SIGNS[0];
}

/* ─── Umm Al-Qura Date Conversions (engine unchanged) ─────────────────────── */
function gregorianToHijri(date) {
  try {
    const fmt = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      timeZone: "UTC",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const parts = fmt.formatToParts(date);
    const hy = parseInt(parts.find((p) => p.type === "year")?.value.replace(/[^0-9]/g, "") || "1400", 10);
    const hm = parseInt(parts.find((p) => p.type === "month")?.value.replace(/[^0-9]/g, "") || "1", 10);
    const hd = parseInt(parts.find((p) => p.type === "day")?.value.replace(/[^0-9]/g, "") || "1", 10);
    return { hy, hm, hd };
  } catch (e) {
    const jd = Math.floor(date.getTime() / 86400000) + 2440587.5;
    const l = Math.floor(jd - 1948440 + 10632);
    const n = Math.floor((l - 1) / 10631);
    const l2 = Math.floor(l - 10631 * n + 354);
    const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
    const l3 = Math.floor(l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29);
    const hm = Math.floor((24 * l3) / 709);
    const hd = Math.floor(l3 - Math.floor((709 * hm) / 24));
    const hy = Math.floor(30 * n + j - 30);
    return { hy, hm, hd };
  }
}

function hijriToGregorian(hYear, hMonth, hDay) {
  const approxGYear = Math.round((hYear - 1) * 0.970229 + 622.54);
  const start = new Date(Date.UTC(approxGYear - 1, 0, 1));
  const end = new Date(Date.UTC(approxGYear + 2, 0, 1));

  const fmt = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
    timeZone: "UTC",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  let low = start.getTime();
  let high = end.getTime();

  while (low <= high) {
    const mid = low + Math.floor((high - low) / (2 * 86400000)) * 86400000;
    const parts = fmt.formatToParts(new Date(mid));
    const hy = parseInt(parts.find((p) => p.type === "year")?.value.replace(/[^0-9]/g, "") || "0", 10);
    const hm = parseInt(parts.find((p) => p.type === "month")?.value.replace(/[^0-9]/g, "") || "0", 10);
    const hd = parseInt(parts.find((p) => p.type === "day")?.value.replace(/[^0-9]/g, "") || "0", 10);

    if (hy === hYear && hm === hMonth && hd === hDay) {
      return new Date(mid);
    }

    const currentVal = hy * 10000 + hm * 100 + hd;
    const targetVal = hYear * 10000 + hMonth * 100 + hDay;

    if (currentVal < targetVal) {
      low = mid + 86400000;
    } else {
      high = mid - 86400000;
    }
  }
  return new Date(low);
}

const PRESETS = [
  { label: "مواليد 1415 هـ (شعبان)", mode: "hijri", hy: 1415, hm: 8, hd: 15 },
  { label: "مواليد 1420 هـ (رمضان)", mode: "hijri", hy: 1420, hm: 9, hd: 1 },
  { label: "مواليد 1400 هـ (محرم)", mode: "hijri", hy: 1400, hm: 1, hd: 1 },
  { label: "مواليد 2000 م (يناير)", mode: "gregorian", date: "2000-01-01" },
  { label: "مواليد 1990 م (أكتوبر)", mode: "gregorian", date: "1990-10-15" },
];

const num = (n) => Number(n).toLocaleString("en-US");
const monthName = (id) => HIJRI_MONTHS.find((m) => m.id === id)?.name || "";
const localStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/* ─── Styles (tokens: --c-* with fallbacks) ───────────────────────────────── */
const CSS = `
.ha{--bg:var(--c-bg,#F5F5F2);--ink:var(--c-ink,#0D0D0D);--ac:var(--c-accent,#FF6A1A);--sf:var(--c-surface,#FFFFFF);--mu:var(--c-muted,#55554F);--ln:var(--c-line,#0D0D0D);--er:var(--error,#B42318);color:var(--ink);font-size:15px;line-height:1.6}
@media (prefers-color-scheme:dark){.ha{--bg:var(--c-bg,#0D0D0D);--ink:var(--c-ink,#F5F5F2);--sf:var(--c-surface,#161616);--mu:var(--c-muted,#A8A8A0);--ln:var(--c-line,#F5F5F2);--er:var(--error,#FF8A80)}}
.ha *{box-sizing:border-box}
.ha h1,.ha h2,.ha h3{margin:0;line-height:1.25}
.ha-col{display:flex;flex-direction:column;gap:20px}
.ha-grid{display:grid;gap:24px;grid-template-columns:1fr}
@media(min-width:1024px){.ha-grid{grid-template-columns:3fr 2fr;align-items:start}.ha-sticky{position:sticky;top:96px}}
.ha-card{background:var(--sf);border:2px solid var(--ln);padding:20px;display:flex;flex-direction:column;gap:14px}
.ha-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border-bottom:2px solid var(--ln);padding-bottom:10px}
.ha-head h2,.ha-head h3{font-size:17px;font-weight:800}
.ha-g3{display:grid;gap:10px;grid-template-columns:1fr 1.4fr 1fr}
.ha-lbl{display:block;font-size:13px;font-weight:700;margin-bottom:6px}
.ha-in{width:100%;border:1px solid var(--ln);background:var(--bg);color:var(--ink);padding:10px 12px;font:inherit;font-size:15px;border-radius:0;min-height:44px}
.ha-in:focus-visible,.ha-tg:focus-visible,.ha-btn:focus-visible{outline:3px solid var(--ac);outline-offset:2px}
.ha-tg{border:1px solid var(--ln);background:var(--sf);color:var(--ink);padding:6px 12px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;min-height:40px}
.ha-tg[aria-pressed="true"]{background:var(--ink);color:var(--bg);font-weight:800}
.ha-seg{display:inline-flex;border:1px solid var(--ln)}
.ha-seg .ha-tg{border:0}
.ha-seg .ha-tg+.ha-tg{border-inline-start:1px solid var(--ln)}
.ha-box{border:1px solid var(--ln);background:var(--bg);padding:12px 14px;font-size:13px}
.ha-box p{margin:0}
.ha-row{display:flex;justify-content:space-between;gap:12px;align-items:baseline;flex-wrap:wrap}
.ha-note{border:1px dashed var(--ln);padding:10px 14px;font-size:12px}
.ha-note.bad{border:3px solid var(--er);color:var(--er);font-weight:700}
.ha-hero{background:var(--ac);color:#0D0D0D;border:2px solid var(--ln);padding:22px;display:flex;flex-direction:column;gap:14px}
.ha-hero p{margin:0}
.ha-big{font-size:clamp(44px,8vw,60px);font-weight:900;line-height:1}
.ha-btn{border:2px solid var(--ln);background:var(--sf);color:var(--ink);padding:10px 14px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;min-height:44px;text-align:center}
.ha-btn:hover{background:var(--ink);color:var(--bg)}
.ha-hero .ha-btn{background:#fff;color:#0D0D0D;border-color:#0D0D0D}
.ha-hero .ha-btn:hover{background:#0D0D0D;color:#fff}
.ha-tiles{display:grid;gap:10px;grid-template-columns:1fr 1fr}
@media(min-width:640px){.ha-t3{grid-template-columns:repeat(3,1fr)}}
.ha-tile{border:1px solid var(--ln);background:var(--bg);padding:12px;text-align:center}
.ha-tile span{display:block;font-size:12px;color:var(--mu)}
.ha-tile b{display:block;font-size:20px;font-weight:900;margin-top:2px}
.ha-ms{display:grid;gap:12px;grid-template-columns:1fr}
@media(min-width:640px){.ha-ms{grid-template-columns:1fr 1fr}}
.ha-m{border:1px dashed var(--ln);padding:12px 14px;display:flex;flex-direction:column;gap:6px;font-size:13px}
.ha-m.on{border:3px solid var(--ln);background:var(--bg)}
.ha-m h4{margin:0;font-size:14px;font-weight:800}
.ha-m p{margin:0;font-size:12px;color:var(--mu)}
.ha-tag{align-self:flex-start;border:1px solid var(--ln);padding:0 8px;font-size:11px;font-weight:800}
.ha-m.on .ha-tag{background:var(--ink);color:var(--bg)}
.ha-line{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--ln);font-size:13px}
.ha-line:last-child{border-bottom:0}
.ha-line b{border:1px solid var(--ln);padding:0 8px;white-space:nowrap}
.ha-sub{margin:0;font-size:14px;font-weight:800}
@media print{.ha-noprint{display:none!important}.ha-sticky{position:static}}
@media (prefers-reduced-motion:reduce){.ha *{transition:none!important}}
`;

/* ─── Small components ────────────────────────────────────────────────────── */
function Field({ label, children }) {
  const id = useId();
  return (
    <div>
      <label className="ha-lbl" htmlFor={id}>{label}</label>
      {children(id)}
    </div>
  );
}

function Head({ title, children, as: Tag = "h2" }) {
  return (
    <div className="ha-head">
      <Tag>{title}</Tag>
      {children}
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function HijriAgeCalculator() {
  const [inputMode, setInputMode] = useState("hijri");
  const [hijriDay, setHijriDay] = useState(15);
  const [hijriMonth, setHijriMonth] = useState(8);
  const [hijriYear, setHijriYear] = useState(1415);
  const [gregorianDate, setGregorianDate] = useState("1995-01-16");
  const [copied, setCopied] = useState(false);

  // "Now" is read on the client only: no hydration mismatch, local (not UTC) date
  const [now, setNow] = useState(null);
  useEffect(() => { setNow(new Date()); }, []);
  const todayStr = now ? localStr(now) : "";

  const resolved = useMemo(() => {
    if (!now) return null;

    let birthGDate;
    let birthH;
    let adjusted = false;

    if (inputMode === "hijri") {
      const hy = Number(hijriYear);
      if (!Number.isFinite(hy) || hy < 1330 || hy > 1460) return { invalid: true };
      birthGDate = hijriToGregorian(hy, Number(hijriMonth), Number(hijriDay));
      birthH = gregorianToHijri(birthGDate);
      // e.g. day 30 in a 29-day month: result is the nearest real date
      adjusted = birthH.hy !== hy || birthH.hm !== Number(hijriMonth) || birthH.hd !== Number(hijriDay);
    } else {
      if (!gregorianDate) return { invalid: true };
      const [gy, gm, gd] = gregorianDate.split("-").map(Number);
      birthGDate = new Date(Date.UTC(gy, gm - 1, gd));
      birthH = gregorianToHijri(birthGDate);
    }

    const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const todayH = gregorianToHijri(todayUTC);

    if (birthGDate > todayUTC) return { isFuture: true };

    // Gregorian age
    let gYears = todayUTC.getUTCFullYear() - birthGDate.getUTCFullYear();
    let gMonths = todayUTC.getUTCMonth() - birthGDate.getUTCMonth();
    let gDays = todayUTC.getUTCDate() - birthGDate.getUTCDate();
    if (gDays < 0) {
      gMonths -= 1;
      gDays += new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), 0)).getUTCDate();
    }
    if (gMonths < 0) {
      gYears -= 1;
      gMonths += 12;
    }

    // Hijri age
    let hYears = todayH.hy - birthH.hy;
    let hMonths = todayH.hm - birthH.hm;
    let hDays = todayH.hd - birthH.hd;
    if (hDays < 0) {
      hMonths -= 1;
      hDays += 30;
    }
    if (hMonths < 0) {
      hYears -= 1;
      hMonths += 12;
    }

    const totalDays = Math.floor((todayUTC.getTime() - birthGDate.getTime()) / 86400000);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const heartbeats = totalDays * 100000;
    const sleepHours = Math.round(totalDays * 8);
    const dayOfWeek = WEEK_DAYS[birthGDate.getUTCDay()];
    const zodiac = getZodiac(birthGDate.getUTCMonth() + 1, birthGDate.getUTCDate());

    const nextGBirthday = new Date(Date.UTC(todayUTC.getUTCFullYear(), birthGDate.getUTCMonth(), birthGDate.getUTCDate()));
    if (nextGBirthday < todayUTC) nextGBirthday.setUTCFullYear(nextGBirthday.getUTCFullYear() + 1);
    const daysToNextGBirthday = Math.ceil((nextGBirthday.getTime() - todayUTC.getTime()) / 86400000);

    let nextHY = todayH.hy;
    if (todayH.hm > birthH.hm || (todayH.hm === birthH.hm && todayH.hd > birthH.hd)) nextHY += 1;
    const nextHDateG = hijriToGregorian(nextHY, birthH.hm, birthH.hd);
    const daysToNextHBirthday = Math.max(0, Math.ceil((nextHDateG.getTime() - todayUTC.getTime()) / 86400000));

    const ms = (title, desc, years) => ({
      title, desc, reached: hYears >= years,
      targetHDate: `${birthH.hd} ${monthName(birthH.hm)} ${birthH.hy + years} هـ`,
    });
    const milestones = [
      ms("سن التكليف الشرعي (15 سنة هجرية)", "سن البلوغ وإلزامية التكاليف الشرعية كالصلاة والصيام والحج", 15),
      ms("سن الرشد وإصدار الهوية (18 سنة)", "السن القانوني للأهلية المدنية واستخراج رخصة القيادة والمعاملات", 18),
      ms("سن الأربعين (بلوغ الأشد)", "كمال النضج العقلي والروحي المذكور في القرآن الكريم", 40),
      ms("سن التقاعد النظامي (60 سنة هجرية)", "سن التقاعد المعتمد في الأنظمة والوظائف الحكومية", 60),
    ];

    return {
      adjusted,
      birthH,
      birthGStr: `${birthGDate.getUTCFullYear()}-${String(birthGDate.getUTCMonth() + 1).padStart(2, "0")}-${String(birthGDate.getUTCDate()).padStart(2, "0")}`,
      hAge: { years: hYears, months: hMonths, days: hDays },
      gAge: { years: gYears, months: gMonths, days: gDays },
      todayH, totalDays, totalWeeks, totalHours, heartbeats, sleepHours,
      dayOfWeek, zodiac, daysToNextHBirthday, daysToNextGBirthday,
      nextHYear: nextHY, milestones,
    };
  }, [now, inputMode, hijriYear, hijriMonth, hijriDay, gregorianDate]);

  const ok = resolved && !resolved.isFuture && !resolved.invalid;

  const handleApplyPreset = (p) => {
    if (p.mode === "hijri") {
      setInputMode("hijri");
      setHijriYear(p.hy);
      setHijriMonth(p.hm);
      setHijriDay(p.hd);
    } else {
      setInputMode("gregorian");
      setGregorianDate(p.date);
    }
  };

  const handleCopy = () => {
    if (!ok || !navigator.clipboard) return;
    const text = `تقرير العمر بالهجري والميلادي:
• العمر بالهجري: ${resolved.hAge.years} سنة و${resolved.hAge.months} شهر و${resolved.hAge.days} يوم
• العمر بالميلادي: ${resolved.gAge.years} سنة و${resolved.gAge.months} شهر و${resolved.gAge.days} يوم
• يوم الولادة: ${resolved.dayOfWeek}
• إجمالي الأيام المعاشة: ${num(resolved.totalDays)} يوم
• متبقي على يوم الميلاد الهجري القادم: ${resolved.daysToNextHBirthday} يوم

تم الحساب عبر حاسبة العمر بالهجري | الأدوات العربية`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const yearDiff = ok ? resolved.hAge.years - resolved.gAge.years : 0;

  return (
    <div className="ha mx-auto max-w-5xl px-4 py-8 sm:py-12" dir="rtl">
      <style>{CSS}</style>

      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "clamp(26px,5vw,38px)", fontWeight: 900 }}>حاسبة العمر بالهجري والميلادي</h1>
        <p style={{ margin: "10px 0 0", maxWidth: 640, color: "var(--mu)" }}>
          احسب عمرك الدقيق بالسنوات والأشهر والأيام بالتقويمين الهجري والميلادي مع موعد عيد ميلادك القادم وإحصائيات حياتك.
        </p>
      </header>

      {/* Presets */}
      <div className="ha-box ha-noprint" style={{ marginBottom: 24 }}>
        <p className="ha-sub" style={{ marginBottom: 8 }}>تواريخ شائعة للتجربة السريعة</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PRESETS.map((p) => (
            <button key={p.label} type="button" className="ha-btn" style={{ minHeight: 40, fontSize: 13, padding: "6px 12px" }}
              onClick={() => handleApplyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ha-grid">
        {/* ─── Inputs ─── */}
        <div className="ha-col">
          <section className="ha-card">
            <Head title="تحديد تاريخ الميلاد">
              <div className="ha-seg" role="group" aria-label="طريقة الإدخال">
                <button type="button" className="ha-tg" aria-pressed={inputMode === "hijri"} onClick={() => setInputMode("hijri")}>إدخال بالهجري</button>
                <button type="button" className="ha-tg" aria-pressed={inputMode === "gregorian"} onClick={() => setInputMode("gregorian")}>إدخال بالميلادي</button>
              </div>
            </Head>

            {inputMode === "hijri" ? (
              <>
                <div className="ha-g3">
                  <Field label="اليوم (1 - 30)">
                    {(id) => (
                      <select id={id} className="ha-in" value={hijriDay} onChange={(e) => setHijriDay(Number(e.target.value))}>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    )}
                  </Field>
                  <Field label="الشهر الهجري">
                    {(id) => (
                      <select id={id} className="ha-in" value={hijriMonth} onChange={(e) => setHijriMonth(Number(e.target.value))}>
                        {HIJRI_MONTHS.map((m) => (
                          <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
                        ))}
                      </select>
                    )}
                  </Field>
                  <Field label="السنة الهجرية">
                    {(id) => (
                      <input id={id} type="number" inputMode="numeric" min="1330" max="1460" className="ha-in"
                        value={hijriYear} placeholder="1415" onChange={(e) => setHijriYear(e.target.value)} />
                    )}
                  </Field>
                </div>

                {ok && (
                  <div className="ha-box ha-row">
                    <span>المقابل بالميلادي الدقيق</span>
                    <b>{resolved.birthGStr} م ({resolved.dayOfWeek})</b>
                  </div>
                )}
              </>
            ) : (
              <>
                <Field label="اختر تاريخ ميلادك بالميلادي">
                  {(id) => (
                    <input id={id} type="date" className="ha-in" value={gregorianDate} max={todayStr || undefined}
                      onChange={(e) => setGregorianDate(e.target.value)} />
                  )}
                </Field>

                {ok && (
                  <div className="ha-box ha-row">
                    <span>المقابل بالهجري (أم القرى)</span>
                    <b>{resolved.birthH.hd} {monthName(resolved.birthH.hm)} {resolved.birthH.hy} هـ</b>
                  </div>
                )}
              </>
            )}

            {resolved?.invalid && (
              <div className="ha-note bad" role="alert">
                أدخل سنة هجرية بين 1330 و1460 (أو تاريخاً ميلادياً صحيحاً) لعرض النتيجة.
              </div>
            )}
            {ok && resolved.adjusted && (
              <div className="ha-note" role="status" style={{ borderStyle: "solid", borderWidth: 3 }}>
                <b>تنبيه:</b> اليوم المختار غير موجود في هذا الشهر. النتيجة محسوبة لأقرب تاريخ حقيقي: {resolved.birthH.hd} {monthName(resolved.birthH.hm)} {resolved.birthH.hy} هـ.
              </div>
            )}
          </section>

          {ok && (
            <section className="ha-card">
              <Head as="h3" title="تاريخ اليوم المعتمد للحساب" />
              <div className="ha-tiles">
                <div className="ha-tile">
                  <span>اليوم بالهجري</span>
                  <b style={{ fontSize: 16 }}>{resolved.todayH.hd} {monthName(resolved.todayH.hm)} {resolved.todayH.hy} هـ</b>
                </div>
                <div className="ha-tile">
                  <span>اليوم بالميلادي</span>
                  <b style={{ fontSize: 16 }}>{todayStr} م</b>
                </div>
              </div>
            </section>
          )}

          {ok && (
            <section className="ha-card">
              <Head title="محطات عمرية هامة وفق التقويم الهجري" />
              <div className="ha-ms">
                {resolved.milestones.map((m) => (
                  <div key={m.title} className={`ha-m ${m.reached ? "on" : ""}`}>
                    <h4>{m.title}</h4>
                    <span className="ha-tag">{m.reached ? "✓ تم البلوغ" : "لم تُبلغ بعد"}</span>
                    <p>{m.desc}</p>
                    <b style={{ fontSize: 12 }}>التاريخ: {m.targetHDate}</b>
                  </div>
                ))}
              </div>
            </section>
          )}

          {ok && (
            <section className="ha-card">
              <Head title="إحصائيات رحلة حياتك حتى اللحظة" />
              <div className="ha-tiles ha-t3">
                <div className="ha-tile" style={{ borderWidth: 3 }}><span>إجمالي الأيام</span><b>{num(resolved.totalDays)}</b></div>
                <div className="ha-tile"><span>إجمالي الأسابيع</span><b>{num(resolved.totalWeeks)}</b></div>
                <div className="ha-tile"><span>إجمالي الساعات</span><b>{num(resolved.totalHours)}</b></div>
                <div className="ha-tile"><span>ساعات النوم التقديرية</span><b>{num(resolved.sleepHours)}</b></div>
                <div className="ha-tile"><span>نبضات القلب التقديرية</span><b>{(resolved.heartbeats / 1000000).toFixed(1)} مليون</b></div>
                <div className="ha-tile"><span>يوم ولادتك</span><b>{resolved.dayOfWeek}</b></div>
              </div>
            </section>
          )}
        </div>

        {/* ─── Results ─── */}
        <div className="ha-col ha-sticky" aria-live="polite">
          <section className="ha-hero">
            <div className="ha-row">
              <p style={{ fontSize: 13, fontWeight: 700 }}>العمر الدقيق بالهجري</p>
              <p style={{ fontSize: 12, fontWeight: 800, border: "2px solid #0D0D0D", padding: "1px 10px" }}>تقويم أم القرى</p>
            </div>

            {ok ? (
              <div>
                <p className="ha-big">{resolved.hAge.years} <span style={{ fontSize: 20, fontWeight: 800 }}>سنة هجرية</span></p>
                <p style={{ marginTop: 6, fontSize: 15, fontWeight: 700 }}>
                  و{resolved.hAge.months} شهر و{resolved.hAge.days} يوم
                </p>
              </div>
            ) : (
              <p style={{ fontSize: 14, fontWeight: 700 }}>
                {resolved === null ? "—" : resolved?.isFuture ? "تاريخ الميلاد يجب أن يسبق تاريخ اليوم." : "يرجى إدخال تاريخ ميلاد صحيح سابق لتاريخ اليوم."}
              </p>
            )}

            <div className="ha-noprint" style={{ display: "flex", gap: 8 }}>
              <button type="button" className="ha-btn" style={{ flex: 1 }} onClick={handleCopy} disabled={!ok}>
                {copied ? "✓ تم نسخ التقرير" : "نسخ النتيجة"}
              </button>
              <button type="button" className="ha-btn" onClick={() => window.print()}>طباعة</button>
            </div>
          </section>

          {ok && (
            <section className="ha-card">
              <Head as="h3" title="العمر المقابل بالميلادي" />
              <div className="ha-tile" style={{ padding: 16 }}>
                <b style={{ fontSize: 32 }}>{resolved.gAge.years} <span style={{ fontSize: 14, fontWeight: 400 }}>سنة</span></b>
                <span style={{ marginTop: 4 }}>و{resolved.gAge.months} شهر و{resolved.gAge.days} يوم</span>
              </div>
              <div className="ha-note">
                <b>الفرق بين العمرين:</b> أنت أكبر بالهجري بنحو{" "}
                <b>{yearDiff > 0 ? `${yearDiff} سنة كاملة` : "بضعة أشهر"}</b>
                ، لأن السنة الهجرية أقصر من الميلادية بنحو 11 يوماً كل عام.
              </div>
            </section>
          )}

          {ok && (
            <section className="ha-card">
              <Head as="h3" title="موعد يوم ميلادك القادم" />
              <div>
                <div className="ha-line">
                  <span>ميلادك الهجري القادم ({resolved.nextHYear} هـ)</span>
                  <b>بعد {num(resolved.daysToNextHBirthday)} يوم</b>
                </div>
                <div className="ha-line">
                  <span>ميلادك الميلادي القادم</span>
                  <b>بعد {num(resolved.daysToNextGBirthday)} يوم</b>
                </div>
              </div>
            </section>
          )}

          {ok && (
            <section className="ha-card">
              <Head as="h3" title="البرج الفلكي والشمسي" />
              <div className="ha-box ha-row" style={{ alignItems: "center" }}>
                <span>
                  <b style={{ fontSize: 24, marginInlineEnd: 8 }} aria-hidden="true">{resolved.zodiac.symbol}{"\uFE0E"}</b>
                  <b>برج {resolved.zodiac.name}</b>
                  <span style={{ display: "block", fontSize: 11, color: "var(--mu)" }}>حسب تاريخ ميلادك الميلادي</span>
                </span>
                <b style={{ fontSize: 12 }}>وُلدت يوم {resolved.dayOfWeek}</b>
              </div>
            </section>
          )}
        </div>
      </div>

      <p className="ha-note" style={{ marginTop: 32 }}>
        يتم احتساب التقويم الهجري وفق معايير تقويم أم القرى الرسمي في المملكة العربية السعودية.
      </p>
    </div>
  );
}