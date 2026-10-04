"use client";

import { useState, useMemo, useEffect, useId } from "react";

/* ─── Hijri Months Reference ──────────────────────────────────────────────── */
const HIJRI_MONTHS = [
  { id: 1, name: "محرم", en: "Muharram", days: 30, sacred: true },
  { id: 2, name: "صفر", en: "Safar", days: 29, sacred: false },
  { id: 3, name: "ربيع الأول", en: "Rabi' al-Awwal", days: 30, sacred: false },
  { id: 4, name: "ربيع الآخر", en: "Rabi' al-Thani", days: 29, sacred: false },
  { id: 5, name: "جمادى الأولى", en: "Jumada al-Ula", days: 30, sacred: false },
  { id: 6, name: "جمادى الآخرة", en: "Jumada al-Akhirah", days: 29, sacred: false },
  { id: 7, name: "رجب", en: "Rajab", days: 30, sacred: true },
  { id: 8, name: "شعبان", en: "Sha'ban", days: 29, sacred: false },
  { id: 9, name: "رمضان", en: "Ramadan", days: 30, sacred: false, holy: true },
  { id: 10, name: "شوال", en: "Shawwal", days: 29, sacred: false },
  { id: 11, name: "ذو القعدة", en: "Dhu al-Qi'dah", days: 30, sacred: true },
  { id: 12, name: "ذو الحجة", en: "Dhu al-Hijjah", days: 29, sacred: true, holy: true },
];

const GREGORIAN_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const WEEK_DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const ISLAMIC_EVENTS = [
  { month: 1, day: 1, title: "رأس السنة الهجرية", desc: "أول يوم في العام الهجري الجديد" },
  { month: 1, day: 10, title: "يوم عاشوراء", desc: "اليوم العاشر من محرم وسنة صيامه" },
  { month: 3, day: 12, title: "ذكرى المولد النبوي الشريف", desc: "12 ربيع الأول" },
  { month: 7, day: 27, title: "ذكرى الإسراء والمعراج", desc: "27 رجب" },
  { month: 8, day: 15, title: "ليلة النصف من شعبان", desc: "15 شعبان" },
  { month: 9, day: 1, title: "غرة شهر رمضان المبارك", desc: "بداية شهر الصيام والقرآن" },
  { month: 9, day: 27, title: "تحري ليلة القدر", desc: "إحدى الليالي الوترية المباركة" },
  { month: 10, day: 1, title: "عيد الفطر المبارك", desc: "أول أيام عيد الفطر السعيد" },
  { month: 12, day: 8, title: "يوم التروية", desc: "بداية مناسك الحج المباركة" },
  { month: 12, day: 9, title: "يوم عرفة", desc: "أعظم أيام الحج وصيام لغير الحاج" },
  { month: 12, day: 10, title: "عيد الأضحى المبارك", desc: "أول أيام النحر وعيد المسلمين" },
  { month: 12, day: 11, title: "أيام التشريق", desc: "11-13 ذو الحجة" },
];

/* ─── Conversion engine (unchanged) ───────────────────────────────────────── */
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

/* Today as a UTC-midnight date built from the user's LOCAL calendar day,
   so the date is not off by one in the first hours after local midnight. */
function todayLocalAsUTC() {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
}

const pad = (n) => String(n).padStart(2, "0");

function describe(gDate) {
  const h = gregorianToHijri(gDate);
  const gy = gDate.getUTCFullYear();
  const gm = gDate.getUTCMonth() + 1;
  const gd = gDate.getUTCDate();
  return {
    ...h,
    gy, gm, gd,
    dayOfWeek: WEEK_DAYS[gDate.getUTCDay()],
    hijriDigits: `${h.hy}/${pad(h.hm)}/${pad(h.hd)} هـ`,
    gregorianDigits: `${gy}-${pad(gm)}-${pad(gd)} م`,
  };
}

const PRESETS = [
  { label: "غرة رمضان 1448 هـ", mode: "h2g", hy: 1448, hm: 9, hd: 1 },
  { label: "يوم عرفة 1448 هـ", mode: "h2g", hy: 1448, hm: 12, hd: 9 },
  { label: "اليوم الوطني السعودي (23 سبتمبر)", mode: "g2h", date: "2026-09-23" },
  { label: "يوم التأسيس السعودي (22 فبراير)", mode: "g2h", date: "2026-02-22" },
  { label: "رأس السنة الهجرية 1449 هـ", mode: "h2g", hy: 1449, hm: 1, hd: 1 },
];

export default function DateConverter() {
  const uid = useId();
  const [conversionDirection, setConversionDirection] = useState("h2g"); // "h2g" | "g2h"

  const [hijriDay, setHijriDay] = useState(8);
  const [hijriMonth, setHijriMonth] = useState(4);
  const [hijriYear, setHijriYear] = useState(1448);
  const [gregorianDate, setGregorianDate] = useState("2026-09-19");

  const [today, setToday] = useState(null); // real today (set on the client)
  const [copied, setCopied] = useState(false);

  const applyToday = () => {
    const t = todayLocalAsUTC();
    const d = describe(t);
    setToday(d);
    setHijriDay(d.hd);
    setHijriMonth(d.hm);
    setHijriYear(d.hy);
    setGregorianDate(t.toISOString().slice(0, 10));
  };

  useEffect(() => {
    applyToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Conversion (unchanged) ────────────────────────────────────────────────
  const result = useMemo(() => {
    let sourceH, sourceGDate;

    if (conversionDirection === "h2g") {
      const hy = Number(hijriYear) || 1448;
      const hm = Number(hijriMonth) || 1;
      const hd = Number(hijriDay) || 1;
      sourceH = { hy, hm, hd };
      sourceGDate = hijriToGregorian(hy, hm, hd);
    } else {
      const [gy, gm, gd] = gregorianDate.split("-").map(Number);
      sourceGDate = new Date(Date.UTC(gy || 2026, (gm || 1) - 1, gd || 1));
      sourceH = gregorianToHijri(sourceGDate);
    }

    const gy = sourceGDate.getUTCFullYear();
    const gm = sourceGDate.getUTCMonth() + 1;
    const gd = sourceGDate.getUTCDate();
    const dayOfWeek = WEEK_DAYS[sourceGDate.getUTCDay()];

    const hMonthObj = HIJRI_MONTHS.find((m) => m.id === sourceH.hm) || HIJRI_MONTHS[0];
    const gMonthName = GREGORIAN_MONTHS[gm - 1];

    const event = ISLAMIC_EVENTS.find((ev) => ev.month === sourceH.hm && ev.day === sourceH.hd);

    const hijriFullStr = `${dayOfWeek}، ${sourceH.hd} ${hMonthObj.name} ${sourceH.hy} هـ`;
    const gregorianFullStr = `${dayOfWeek}، ${gd} ${gMonthName} (${gm}) ${gy} م`;

    const hijriDigits = `${sourceH.hy}/${pad(sourceH.hm)}/${pad(sourceH.hd)} هـ`;
    const gregorianDigits = `${gy}-${pad(gm)}-${pad(gd)} م`;

    const startOfYear = new Date(Date.UTC(gy, 0, 1));
    const dayOfYear = Math.floor((sourceGDate.getTime() - startOfYear.getTime()) / 86400000) + 1;
    const isLeapYear = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
    const daysRemainingYear = (isLeapYear ? 366 : 365) - dayOfYear;

    return {
      sourceH, sourceGDate,
      hy: sourceH.hy, hm: sourceH.hm, hd: sourceH.hd,
      hMonthName: hMonthObj.name, hMonthObj,
      gy, gm, gd, gMonthName,
      dayOfWeek, event,
      hijriFullStr, gregorianFullStr, hijriDigits, gregorianDigits,
      dayOfYear, daysRemainingYear,
    };
  }, [conversionDirection, hijriYear, hijriMonth, hijriDay, gregorianDate]);

  // Real length of the shown month and weekday of its first day, from the same
  // Umm al-Qura engine (so the mini calendar lines up with the real weekdays).
  const monthInfo = useMemo(() => {
    const first = hijriToGregorian(result.hy, result.hm, 1);
    const d30 = hijriToGregorian(result.hy, result.hm, 30);
    const back = gregorianToHijri(d30);
    const length = back.hm === result.hm && back.hd === 30 ? 30 : 29;
    return { firstDay: first.getUTCDay(), length };
  }, [result.hy, result.hm]);

  const dayOutOfMonth = conversionDirection === "h2g" && Number(hijriDay) > monthInfo.length;

  const handleApplyPreset = (p) => {
    if (p.mode === "h2g") {
      setConversionDirection("h2g");
      setHijriYear(p.hy);
      setHijriMonth(p.hm);
      setHijriDay(p.hd);
    } else {
      setConversionDirection("g2h");
      setGregorianDate(p.date);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `📅 نتيجة تحويل التاريخ:
• التاريخ بالهجري: ${result.hijriFullStr} (${result.hijriDigits})
• التاريخ بالميلادي: ${result.gregorianFullStr} (${result.gregorianDigits})
• يوم الأسبوع: ${result.dayOfWeek}
${result.event ? `• مناسبة إسلامية: ${result.event.title} - ${result.event.desc}\n` : ""}
تم التحويل عبر محول التاريخ الهجري والميلادي | الأدوات العربية`;
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isH2G = conversionDirection === "h2g";

  return (
    <div className="dc" dir="rtl">
      <style>{CSS}</style>

      {/* Header */}
      <header className="dc-head">
        <p className="dc-badge">محول التاريخ الهجري والميلادي الفوري</p>
        <h1 className="dc-title">تحويل التاريخ الهجري والميلادي</h1>
        <p className="dc-sub">
          حوّل أي تاريخ بين التقويمين الهجري والميلادي وفق تقويم أم القرى الرسمي، مع إظهار اسم اليوم والمناسبات الإسلامية المرافقة.
        </p>
      </header>

      {/* Today */}
      <section className="dc-today" aria-label="تاريخ اليوم">
        <div>
          <p className="dc-label">تاريخ اليوم الحالي</p>
          <p className="dc-today-v">
            {today ? (
              <>
                {today.dayOfWeek}: <span className="dc-num">{today.hijriDigits}</span> الموافق{" "}
                <span className="dc-num">{today.gregorianDigits}</span>
              </>
            ) : (
              "جاري التحميل..."
            )}
          </p>
        </div>
        <button type="button" onClick={applyToday} className="dc-btn">تعيين تاريخ اليوم</button>
      </section>

      {/* Presets */}
      <section className="dc-presets" aria-label="مناسبات سريعة">
        <p className="dc-label">مناسبات ومحطات سريعة للتحويل</p>
        <div className="dc-chips">
          {PRESETS.map((p, idx) => (
            <button key={idx} type="button" onClick={() => handleApplyPreset(p)} className="dc-chip">
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <div className="dc-cols">
        {/* ───────── Inputs ───────── */}
        <div className="dc-stack">
          <section className="dc-card" aria-label="المحول">
            <fieldset className="dc-fs">
              <legend className="dc-h2">اتجاه التحويل</legend>
              <div className="dc-seg" role="radiogroup" aria-label="اتجاه التحويل">
                <button type="button" role="radio" aria-checked={isH2G} onClick={() => setConversionDirection("h2g")} className="dc-opt">
                  من هجري إلى ميلادي
                </button>
                <button type="button" role="radio" aria-checked={!isH2G} onClick={() => setConversionDirection("g2h")} className="dc-opt">
                  من ميلادي إلى هجري
                </button>
              </div>
              <p className="dc-hint">
                {isH2G ? "أدخل التاريخ الهجري لعرض المقابل بالميلادي" : "أدخل التاريخ الميلادي لعرض المقابل بالهجري"}
              </p>
            </fieldset>

            {isH2G ? (
              <>
                <div className="dc-grid3">
                  <div className="dc-field">
                    <label className="dc-label" htmlFor={`${uid}-d`}>اليوم (1 - 30)</label>
                    <select id={`${uid}-d`} value={hijriDay} onChange={(e) => setHijriDay(Number(e.target.value))} className="dc-input dc-num">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="dc-field">
                    <label className="dc-label" htmlFor={`${uid}-m`}>الشهر الهجري</label>
                    <select id={`${uid}-m`} value={hijriMonth} onChange={(e) => setHijriMonth(Number(e.target.value))} className="dc-input">
                      {HIJRI_MONTHS.map((m) => (
                        <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="dc-field">
                    <label className="dc-label" htmlFor={`${uid}-y`}>السنة الهجرية</label>
                    <input
                      id={`${uid}-y`}
                      type="number"
                      inputMode="numeric"
                      min="1300"
                      max="1500"
                      value={hijriYear}
                      onChange={(e) => setHijriYear(e.target.value)}
                      className="dc-input dc-num"
                    />
                  </div>
                </div>

                {dayOutOfMonth && (
                  <p className="dc-warn" role="alert">
                    شهر {result.hMonthName} {result.hy} هـ فيه {monthInfo.length} يوماً فقط، فالنتيجة المعروضة لأقرب تاريخ وليست لليوم {hijriDay}.
                  </p>
                )}

                <p className="dc-info">
                  <strong>معلومة الشهر: </strong>
                  شهر {result.hMonthName} هو الشهر رقم (<span className="dc-num">{result.hm}</span>) في السنة الهجرية،{" "}
                  {result.hMonthObj.sacred ? "وهو من الأشهر الحُرُم المعظمة." : "ويعتمد على رؤية هلال الشهر."}
                </p>
              </>
            ) : (
              <div className="dc-field">
                <label className="dc-label" htmlFor={`${uid}-g`}>اختر التاريخ الميلادي</label>
                <input
                  id={`${uid}-g`}
                  type="date"
                  value={gregorianDate}
                  onChange={(e) => setGregorianDate(e.target.value)}
                  className="dc-input dc-num"
                />
              </div>
            )}
          </section>

          {/* Event */}
          {result.event && (
            <section className="dc-event" aria-label="مناسبة إسلامية">
              <span className="dc-tag">مناسبة إسلامية هامة</span>
              <p className="dc-event-t">{result.event.title}</p>
              <p className="dc-hint">{result.event.desc}</p>
            </section>
          )}

          {/* Month calendar */}
          <section className="dc-card" aria-label="أيام الشهر الهجري">
            <div className="dc-line">
              <h2 className="dc-h2">أيام شهر {result.hMonthName} (<span className="dc-num">{result.hy}</span> هـ)</h2>
              <span className="dc-hint">تقويم أم القرى</span>
            </div>
            <div className="dc-cal">
              {WEEK_DAYS.map((wd) => (
                <span key={wd} className="dc-wd">{wd.replace("ال", "")}</span>
              ))}
              {Array.from({ length: monthInfo.firstDay }, (_, i) => (
                <span key={`b${i}`} aria-hidden="true" />
              ))}
              {Array.from({ length: monthInfo.length }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={d === result.hd}
                  onClick={() => {
                    setConversionDirection("h2g");
                    setHijriYear(result.hy);
                    setHijriMonth(result.hm);
                    setHijriDay(d);
                  }}
                  className="dc-day dc-num"
                >
                  {d}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* ───────── Results ───────── */}
        <div className="dc-stack dc-sticky">
          <section className="dc-result" aria-live="polite" aria-label="النتيجة">
            <p className="dc-result-top">
              <span>النتيجة المقابلة الدقيقة</span>
              <span className="dc-tag-o">{isH2G ? "التاريخ الميلادي" : "التاريخ الهجري"}</span>
            </p>
            <p className="dc-result-day">{result.dayOfWeek}</p>
            <p className="dc-big">{isH2G ? result.gregorianFullStr : result.hijriFullStr}</p>
            <p className="dc-digits dc-num">{isH2G ? result.gregorianDigits : result.hijriDigits}</p>

            <div className="dc-actions dc-noprint">
              <button type="button" onClick={handleCopy} className="dc-rbtn dc-rbtn--ink">
                {copied ? "تم نسخ التقرير" : "نسخ النتيجة"}
              </button>
              <button type="button" onClick={() => window.print()} className="dc-rbtn">طباعة</button>
              <span className="dc-sr" role="status">{copied ? "تم نسخ التقرير" : ""}</span>
            </div>
          </section>

          <section className="dc-card" aria-label="تفاصيل ومقارنة التاريخين">
            <h2 className="dc-h2">تفاصيل ومقارنة التاريخين</h2>
            <dl className="dc-rows">
              <div className="dc-row"><dt>يوم الأسبوع</dt><dd>{result.dayOfWeek}</dd></div>
              <div className="dc-row"><dt>التاريخ بالهجري</dt><dd className="dc-num">{result.hijriDigits}</dd></div>
              <div className="dc-row"><dt>التاريخ بالميلادي</dt><dd className="dc-num">{result.gregorianDigits}</dd></div>
              <div className="dc-row"><dt>ترتيب اليوم في السنة الميلادية</dt><dd>اليوم رقم <span className="dc-num">{result.dayOfYear}</span></dd></div>
              <div className="dc-row"><dt>أيام متبقية لنهاية العام</dt><dd><span className="dc-num">{result.daysRemainingYear}</span> يوم</dd></div>
            </dl>
          </section>

          <p className="dc-info">
            <strong>هل تعلم؟ </strong>
            التقويم الهجري يعتمد على دورة القمر، لذا فإن دورة الفصول تتقدم بمقدار 11 يوماً كل عام بالنسبة للتقويم الميلادي الشمسي، مما يجعل رمضان والأشهر الفضيلة تطوف على كافة فصول السنة (شتاءً، ربيعاً، صيفاً، وخريفاً) كل 33 عاماً.
          </p>
        </div>
      </div>

      <p className="dc-disclaimer">
        التحويل مطابق للتقويم الرسمي في المملكة العربية السعودية (تقويم أم القرى) وفق الحسابات الفلكية الشرعية المعتمدة.
      </p>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
// Colours come from --c-* on .dc. If your tokens.css already defines the
// underlying names, delete the fallback values and map them in one place.
const CSS = `
.dc {
  --c-surface: var(--surface, #FFFFFF);
  --c-ink: var(--ink, #0D0D0D);
  --c-ink-soft: var(--ink-soft, #4A4A46);
  --c-line: var(--line, #D9D9D3);
  --c-signal: var(--signal, #FF6A1A);
  --c-on-ink: var(--on-ink, #FFFFFF);
  --c-on-signal: var(--on-signal, #0D0D0D);
  --c-warning: var(--warning, #8A5A00);

  max-width: 64rem;
  margin-inline: auto;
  padding: 2rem 1rem;
  color: var(--c-ink);
  font-family: inherit;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .dc {
    --c-surface: var(--surface, #181816);
    --c-ink: var(--ink, #F5F5F2);
    --c-ink-soft: var(--ink-soft, #B4B4AD);
    --c-line: var(--line, #34342F);
    --c-on-ink: var(--on-ink, #0D0D0D);
    --c-warning: var(--warning, #F2B84B);
  }
}
:root[data-theme="dark"] .dc {
  --c-surface: var(--surface, #181816);
  --c-ink: var(--ink, #F5F5F2);
  --c-ink-soft: var(--ink-soft, #B4B4AD);
  --c-line: var(--line, #34342F);
  --c-on-ink: var(--on-ink, #0D0D0D);
  --c-warning: var(--warning, #F2B84B);
}
.dc *, .dc *::before, .dc *::after { box-sizing: border-box; }
.dc-num { direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; }

.dc-head { margin-block-end: 1.25rem; padding-inline-start: 0.9rem; border-inline-start: 4px solid var(--c-ink); }
.dc-badge { display: inline-block; margin: 0 0 0.6rem; padding: 0.2rem 0.7rem; font-size: 0.78rem; font-weight: 700; border: 1px solid var(--c-ink); border-radius: 999px; }
.dc-title { margin: 0; font-size: 1.6rem; font-weight: 800; line-height: 1.4; }
@media (min-width: 640px) { .dc-title { font-size: 2rem; } }
.dc-sub { margin: 0.5rem 0 0; max-width: 60ch; font-size: 0.92rem; line-height: 1.8; color: var(--c-ink-soft); }

.dc-today { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; margin-block-end: 1.25rem; padding: 0.9rem 1rem; color: var(--c-on-ink); background: var(--c-ink); border-radius: 12px; }
.dc-today .dc-label { color: inherit; opacity: 0.85; }
.dc-today-v { margin: 0.2rem 0 0; font-size: 0.95rem; font-weight: 800; }
.dc-today .dc-btn { color: var(--c-on-ink); background: transparent; border-color: var(--c-on-ink); }
.dc-today .dc-btn:hover { background: var(--c-signal); color: var(--c-on-signal); border-color: var(--c-signal); }

.dc-presets { margin-block-end: 1.5rem; padding: 0.9rem 1rem; border: 1px solid var(--c-line); border-radius: 12px; background: var(--c-surface); }
.dc-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-block-start: 0.5rem; }
.dc-chip, .dc-btn {
  min-height: 40px; padding: 0.35rem 0.85rem; font: inherit; font-size: 0.82rem; font-weight: 700;
  color: var(--c-ink); background: var(--c-surface); border: 2px solid var(--c-line); border-radius: 999px; cursor: pointer;
  transition: background-color .15s, color .15s, border-color .15s;
}
.dc-btn { border-radius: 10px; }
.dc-chip:hover { background: var(--c-ink); color: var(--c-on-ink); border-color: var(--c-ink); }

.dc-cols { display: grid; gap: 1.25rem; }
@media (min-width: 900px) { .dc-cols { grid-template-columns: 3fr 2fr; align-items: start; } }
.dc-stack { display: grid; gap: 1.25rem; min-width: 0; }
@media (min-width: 900px) { .dc-sticky { position: sticky; top: 1.5rem; } }

.dc-card { margin: 0; padding: 1.1rem; background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 14px; display: grid; gap: 1rem; min-width: 0; }
.dc-fs { border: 0; margin: 0; padding: 0; min-width: 0; display: grid; gap: 0.6rem; }
.dc-h2 { margin: 0; padding: 0; font-size: 1rem; font-weight: 800; }
.dc-line { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.dc-label { margin: 0; font-size: 0.82rem; font-weight: 700; }
.dc-hint { margin: 0; font-size: 0.8rem; line-height: 1.7; color: var(--c-ink-soft); }
.dc-field { display: grid; gap: 0.4rem; min-width: 0; }
.dc-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; }
@media (max-width: 460px) { .dc-grid3 { grid-template-columns: 1fr; } }

.dc-input {
  width: 100%; min-height: 46px; padding: 0.5rem 0.7rem; font: inherit; font-size: 0.95rem; font-weight: 600;
  color: var(--c-ink); background: var(--c-surface); border: 2px solid var(--c-line); border-radius: 10px;
}
.dc-input:hover { border-color: var(--c-ink-soft); }

.dc-seg { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.dc-opt {
  min-height: 46px; padding: 0.5rem 0.7rem; font: inherit; font-size: 0.9rem; font-weight: 700; text-align: center;
  color: var(--c-ink); background: var(--c-surface); border: 2px solid var(--c-line); border-radius: 10px; cursor: pointer;
  transition: background-color .15s, color .15s, border-color .15s;
}
.dc-opt:hover { border-color: var(--c-ink); }
.dc-opt[aria-checked="true"] { color: var(--c-on-ink); background: var(--c-ink); border-color: var(--c-ink); }

.dc-info { margin: 0; padding-inline-start: 0.8rem; border-inline-start: 2px solid var(--c-line); font-size: 0.82rem; line-height: 1.8; color: var(--c-ink-soft); }
.dc-warn { margin: 0; padding: 0.7rem 0.8rem; font-size: 0.82rem; line-height: 1.8; color: var(--c-warning); border: 2px dashed var(--c-warning); border-radius: 10px; }

.dc-event { padding: 1rem; border: 2px solid var(--c-ink); border-inline-start-width: 8px; border-radius: 12px; display: grid; gap: 0.3rem; background: var(--c-surface); }
.dc-tag { justify-self: start; padding: 0.1rem 0.6rem; font-size: 0.72rem; font-weight: 800; color: var(--c-on-ink); background: var(--c-ink); border-radius: 999px; }
.dc-event-t { margin: 0; font-size: 1.05rem; font-weight: 800; }

/* Calendar */
.dc-cal { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.35rem; text-align: center; }
.dc-wd { padding-block: 0.2rem; font-size: 0.72rem; font-weight: 700; color: var(--c-ink-soft); }
.dc-day {
  min-height: 40px; padding: 0; font: inherit; font-size: 0.85rem; font-weight: 700; text-align: center;
  color: var(--c-ink); background: var(--c-surface); border: 2px solid var(--c-line); border-radius: 8px; cursor: pointer;
}
.dc-day:hover { border-color: var(--c-ink); }
.dc-day[aria-pressed="true"] { color: var(--c-on-ink); background: var(--c-ink); border-color: var(--c-ink); }

/* Result: orange is a background only, text stays ink */
.dc-result { padding: 1.25rem; color: var(--c-on-signal); background: var(--c-signal); border-radius: 14px; display: grid; gap: 0.5rem; }
.dc-result-top { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin: 0; font-size: 0.82rem; font-weight: 700; }
.dc-tag-o { padding: 0.1rem 0.65rem; font-size: 0.76rem; font-weight: 800; border: 2px solid var(--c-on-signal); border-radius: 999px; }
.dc-result-day { margin: 0.6rem 0 0; font-size: 0.9rem; font-weight: 700; }
.dc-big { margin: 0; font-size: 1.6rem; font-weight: 800; line-height: 1.5; }
.dc-digits { margin: 0; font-size: 1rem; font-weight: 700; justify-self: start; }
.dc-actions { display: flex; gap: 0.5rem; margin-block-start: 0.6rem; }
.dc-rbtn {
  flex: 1; min-height: 44px; padding: 0.5rem 0.9rem; font: inherit; font-size: 0.9rem; font-weight: 700;
  color: var(--c-on-signal); background: transparent; border: 2px solid var(--c-on-signal); border-radius: 10px; cursor: pointer;
}
.dc-rbtn:hover { background: rgba(13, 13, 13, 0.12); }
.dc-rbtn--ink { background: var(--c-on-signal); color: var(--c-signal); }
.dc-rbtn--ink:hover { background: var(--c-on-signal); opacity: 0.88; }
.dc-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.dc-rows { margin: 0; }
.dc-row { display: flex; justify-content: space-between; gap: 1rem; padding-block: 0.65rem; border-block-start: 1px solid var(--c-line); font-size: 0.88rem; }
.dc-row dt { color: var(--c-ink-soft); }
.dc-row dd { margin: 0; font-weight: 700; }

.dc-disclaimer { margin: 2rem auto 0; max-width: 70ch; padding-inline-start: 0.8rem; border-inline-start: 2px solid var(--c-line); font-size: 0.8rem; line-height: 1.8; color: var(--c-ink-soft); }

/* Focus, motion, print */
.dc button:focus-visible, .dc input:focus-visible, .dc select:focus-visible { outline: 3px solid var(--c-signal); outline-offset: 2px; }
.dc-result button:focus-visible { outline-color: var(--c-on-signal); }
.dc-today button:focus-visible { outline-color: var(--c-signal); }
@media (prefers-reduced-motion: reduce) { .dc * { transition: none !important; } }
@media print { .dc-noprint { display: none !important; } }
`;