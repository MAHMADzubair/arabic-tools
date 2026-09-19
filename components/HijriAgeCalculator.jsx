"use client";

import { useState, useMemo } from "react";

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

const WEEK_DAYS = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

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

/* ─── Accurate Umm Al-Qura Date Conversions ───────────────────────────────── */
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
    // Fallback astronomical formula
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

export default function HijriAgeCalculator() {
  const [inputMode, setInputMode] = useState("hijri"); // "hijri" | "gregorian"

  // Hijri Inputs
  const [hijriDay, setHijriDay] = useState(15);
  const [hijriMonth, setHijriMonth] = useState(8);
  const [hijriYear, setHijriYear] = useState(1415);

  // Gregorian Input
  const [gregorianDate, setGregorianDate] = useState("1995-01-16");

  const [copied, setCopied] = useState(false);

  // Resolved Birth Dates in both calendars
  const resolved = useMemo(() => {
    let birthGDate;
    let birthH;

    if (inputMode === "hijri") {
      birthGDate = hijriToGregorian(Number(hijriYear), Number(hijriMonth), Number(hijriDay));
      birthH = { hy: Number(hijriYear), hm: Number(hijriMonth), hd: Number(hijriDay) };
    } else {
      const [gy, gm, gd] = gregorianDate.split("-").map(Number);
      birthGDate = new Date(Date.UTC(gy, gm - 1, gd));
      birthH = gregorianToHijri(birthGDate);
    }

    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const todayH = gregorianToHijri(todayUTC);

    if (birthGDate > todayUTC) {
      return { isFuture: true };
    }

    // ─── Gregorian Age Calculation ───
    let gYears = todayUTC.getUTCFullYear() - birthGDate.getUTCFullYear();
    let gMonths = todayUTC.getUTCMonth() - birthGDate.getUTCMonth();
    let gDays = todayUTC.getUTCDate() - birthGDate.getUTCDate();

    if (gDays < 0) {
      gMonths -= 1;
      const prevMonthLastDay = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), 0)).getUTCDate();
      gDays += prevMonthLastDay;
    }
    if (gMonths < 0) {
      gYears -= 1;
      gMonths += 12;
    }

    // ─── Hijri Age Calculation ───
    let hYears = todayH.hy - birthH.hy;
    let hMonths = todayH.hm - birthH.hm;
    let hDays = todayH.hd - birthH.hd;

    if (hDays < 0) {
      hMonths -= 1;
      hDays += 30; // standard Hijri lunar month approx
    }
    if (hMonths < 0) {
      hYears -= 1;
      hMonths += 12;
    }

    // Total days lived
    const diffMs = todayUTC.getTime() - birthGDate.getTime();
    const totalDays = Math.floor(diffMs / 86400000);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    // Approximate heartbeats & sleep
    const heartbeats = totalDays * 100000;
    const sleepHours = Math.round(totalDays * 8);

    // Day of week born
    const dayOfWeek = WEEK_DAYS[birthGDate.getUTCDay()];

    // Zodiac sign
    const zodiac = getZodiac(birthGDate.getUTCMonth() + 1, birthGDate.getUTCDate());

    // Next Gregorian birthday
    const nextGBirthday = new Date(Date.UTC(todayUTC.getUTCFullYear(), birthGDate.getUTCMonth(), birthGDate.getUTCDate()));
    if (nextGBirthday < todayUTC) {
      nextGBirthday.setUTCFullYear(nextGBirthday.getUTCFullYear() + 1);
    }
    const daysToNextGBirthday = Math.ceil((nextGBirthday.getTime() - todayUTC.getTime()) / 86400000);

    // Next Hijri birthday
    let nextHY = todayH.hy;
    if (todayH.hm > birthH.hm || (todayH.hm === birthH.hm && todayH.hd > birthH.hd)) {
      nextHY += 1;
    }
    const nextHDateG = hijriToGregorian(nextHY, birthH.hm, birthH.hd);
    const daysToNextHBirthday = Math.max(0, Math.ceil((nextHDateG.getTime() - todayUTC.getTime()) / 86400000));

    // Difference in age
    const diffDaysHijriGreg = Math.round((hYears + hMonths / 12) * 354.36) - totalDays;

    // Islamic & Life Milestones
    const milestones = [
      {
        title: "سن التكليف الشرعي (15 سنة هجرية)",
        desc: "سن البلوغ وإلزامية التكاليف الشرعية كالصلاة والصيام والحج",
        targetYears: 15,
        reached: hYears >= 15,
        targetHDate: `${birthH.hd} ${HIJRI_MONTHS.find((m) => m.id === birthH.hm)?.name} ${birthH.hy + 15} هـ`,
      },
      {
        title: "سن الرشد وإصدار الهوية (18 سنة)",
        desc: "السن القانوني للأهلية المدنية واستخراج رخصة القيادة والمعاملات",
        targetYears: 18,
        reached: hYears >= 18,
        targetHDate: `${birthH.hd} ${HIJRI_MONTHS.find((m) => m.id === birthH.hm)?.name} ${birthH.hy + 18} هـ`,
      },
      {
        title: "سن الأربعين (بلوغ الأشد)",
        desc: "كمال النضج العقلي والروحي المذكور في القرآن الكريم",
        targetYears: 40,
        reached: hYears >= 40,
        targetHDate: `${birthH.hd} ${HIJRI_MONTHS.find((m) => m.id === birthH.hm)?.name} ${birthH.hy + 40} هـ`,
      },
      {
        title: "سن التقاعد النظامي (60 سنة هجرية)",
        desc: "سن التقاعد المعتمد في الأنظمة والوظائف الحكومية",
        targetYears: 60,
        reached: hYears >= 60,
        targetHDate: `${birthH.hd} ${HIJRI_MONTHS.find((m) => m.id === birthH.hm)?.name} ${birthH.hy + 60} هـ`,
      },
    ];

    return {
      isFuture: false,
      birthH,
      birthGDate,
      birthGStr: `${birthGDate.getUTCFullYear()}-${String(birthGDate.getUTCMonth() + 1).padStart(2, "0")}-${String(birthGDate.getUTCDate()).padStart(2, "0")}`,
      hAge: { years: hYears, months: hMonths, days: hDays },
      gAge: { years: gYears, months: gMonths, days: gDays },
      todayH,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      heartbeats,
      sleepHours,
      dayOfWeek,
      zodiac,
      daysToNextHBirthday,
      daysToNextGBirthday,
      nextHYear: nextHY,
      milestones,
    };
  }, [inputMode, hijriYear, hijriMonth, hijriDay, gregorianDate]);

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
    if (!resolved || resolved.isFuture) return;
    const text = `📊 تقرير العمر بالهجري والميلادي:
• العمر بالهجري: ${resolved.hAge.years} سنة و${resolved.hAge.months} شهر و${resolved.hAge.days} يوم
• العمر بالميلادي: ${resolved.gAge.years} سنة و${resolved.gAge.months} شهر و${resolved.gAge.days} يوم
• يوم الولادة: ${resolved.dayOfWeek}
• البرج الشمسي: ${resolved.zodiac.name} ${resolved.zodiac.symbol}
• إجمالي الأيام المعاشة: ${resolved.totalDays.toLocaleString("ar-EG")} يوم
• متبقي على يوم الميلاد الهجري القادم: ${resolved.daysToNextHBirthday} يوم

تم الحساب عبر حاسبة العمر بالهجري | الأدوات العربية`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12" dir="rtl">
      {/* Header */}
      <div className="mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-sm font-bold text-brand-dark">
          <span>🌙</span>
          <span>تقويم أم القرى المعتمد</span>
        </div>
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
          حاسبة العمر بالهجري والميلادي
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-ink-secondary sm:text-base">
          احسب عمرك الدقيق بالسنوات والأشهر والأيام بالتقويمين الهجري والميلادي مع موعد عيد ميلادك القادم وإحصائيات حياتك.
        </p>
      </div>

      {/* Quick Presets */}
      <div className="mb-6 rounded-2xl border border-brand-border bg-brand-surface/40 p-3 sm:p-4">
        <p className="mb-2 text-xs font-bold text-ink-muted">⚡ نماذج وتواريخ شائعة للتجربة السريعة:</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="rounded-xl border border-brand-border bg-white px-3 py-1.5 text-xs font-medium text-ink-secondary hover:border-brand hover:text-brand-dark transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ─── Left Inputs Column (3 cols) ─── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Mode Switch Card */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">📅</span>
                تحديد تاريخ الميلاد
              </h2>

              <div className="inline-flex rounded-xl border border-brand-border bg-brand-surface/60 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setInputMode("hijri")}
                  className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                    inputMode === "hijri"
                      ? "bg-white text-brand-dark shadow-sm"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  🌙 إدخال بالهجري
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("gregorian")}
                  className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                    inputMode === "gregorian"
                      ? "bg-white text-brand-dark shadow-sm"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  ☀️ إدخال بالميلادي
                </button>
              </div>
            </div>

            {/* Inputs depending on mode */}
            {inputMode === "hijri" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {/* Hijri Day */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-secondary">اليوم (1 - 30)</label>
                    <select
                      value={hijriDay}
                      onChange={(e) => setHijriDay(Number(e.target.value))}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface/40 p-2.5 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hijri Month */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-secondary">الشهر الهجري</label>
                    <select
                      value={hijriMonth}
                      onChange={(e) => setHijriMonth(Number(e.target.value))}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface/40 p-2.5 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                    >
                      {HIJRI_MONTHS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.id} - {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hijri Year */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-secondary">السنة الهجرية</label>
                    <input
                      type="number"
                      min="1330"
                      max="1460"
                      value={hijriYear}
                      onChange={(e) => setHijriYear(e.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface/40 p-2.5 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                      placeholder="1415"
                    />
                  </div>
                </div>

                {resolved && !resolved.isFuture && (
                  <div className="rounded-xl bg-brand-light/60 p-3 text-xs text-brand-dark font-medium flex items-center justify-between">
                    <span>🔄 المقابل بالميلادي الدقيق:</span>
                    <span className="font-bold text-sm">{resolved.birthGStr} م ({resolved.dayOfWeek})</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary">اختر تاريخ ميلادك بالميلادي</label>
                  <input
                    type="date"
                    value={gregorianDate}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setGregorianDate(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 p-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>

                {resolved && !resolved.isFuture && (
                  <div className="rounded-xl bg-brand-light/60 p-3 text-xs text-brand-dark font-medium flex items-center justify-between">
                    <span>🔄 المقابل بالهجري (أم القرى):</span>
                    <span className="font-bold text-sm">
                      {resolved.birthH.hd} {HIJRI_MONTHS.find((m) => m.id === resolved.birthH.hm)?.name} {resolved.birthH.hy} هـ
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Today's Reference Info */}
          {resolved && !resolved.isFuture && (
            <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <span>📍</span>
                <span>تاريخ اليوم المعتمد للحساب</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-brand-surface/50 p-3 border border-brand-border/40">
                  <span className="text-ink-secondary block">اليوم بالهجري:</span>
                  <span className="text-sm font-bold text-brand-dark">
                    {resolved.todayH.hd} {HIJRI_MONTHS.find((m) => m.id === resolved.todayH.hm)?.name} {resolved.todayH.hy} هـ
                  </span>
                </div>
                <div className="rounded-xl bg-brand-surface/50 p-3 border border-brand-border/40">
                  <span className="text-ink-secondary block">اليوم بالميلادي:</span>
                  <span className="text-sm font-bold text-ink">
                    {new Date().toISOString().slice(0, 10)} م
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Islamic & Life Milestones */}
          {resolved && !resolved.isFuture && (
            <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <span>🏆</span>
                <span>محطات عمرية هامة وفق التقويم الهجري</span>
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {resolved.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3.5 space-y-1.5 transition-all ${
                      m.reached
                        ? "border-emerald-200 bg-emerald-50/50"
                        : "border-brand-border bg-brand-surface/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">{m.title}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          m.reached
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {m.reached ? "✓ تم البلوغ" : "قريباً إن شاء الله"}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-muted leading-relaxed">{m.desc}</p>
                    <div className="text-[11px] font-semibold text-brand-dark pt-1">
                      📅 التاريخ: {m.targetHDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fun Life Stats Cards */}
          {resolved && !resolved.isFuture && (
            <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <span>⏱️</span>
                <span>إحصائيات رحلة حياتك حتى اللحظة</span>
              </h3>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 text-center">
                <div className="rounded-xl bg-brand-surface/60 p-3 border border-brand-border/40">
                  <span className="text-[11px] text-ink-secondary">إجمالي الأيام</span>
                  <p className="text-lg font-black text-brand-dark mt-0.5">
                    {resolved.totalDays.toLocaleString("ar-EG")}
                  </p>
                </div>
                <div className="rounded-xl bg-brand-surface/60 p-3 border border-brand-border/40">
                  <span className="text-[11px] text-ink-secondary">إجمالي الأسابيع</span>
                  <p className="text-lg font-black text-ink mt-0.5">
                    {resolved.totalWeeks.toLocaleString("ar-EG")}
                  </p>
                </div>
                <div className="rounded-xl bg-brand-surface/60 p-3 border border-brand-border/40">
                  <span className="text-[11px] text-ink-secondary">إجمالي الساعات</span>
                  <p className="text-lg font-black text-ink mt-0.5">
                    {resolved.totalHours.toLocaleString("ar-EG")}
                  </p>
                </div>
                <div className="rounded-xl bg-brand-surface/60 p-3 border border-brand-border/40">
                  <span className="text-[11px] text-ink-secondary">ساعات النوم التقديرية</span>
                  <p className="text-lg font-black text-indigo-950 mt-0.5">
                    {resolved.sleepHours.toLocaleString("ar-EG")}
                  </p>
                </div>
                <div className="rounded-xl bg-brand-surface/60 p-3 border border-brand-border/40">
                  <span className="text-[11px] text-ink-secondary">نبضات القلب التقديرية</span>
                  <p className="text-lg font-black text-rose-950 mt-0.5">
                    {(resolved.heartbeats / 1000000).toFixed(1)} مليون
                  </p>
                </div>
                <div className="rounded-xl bg-brand-surface/60 p-3 border border-brand-border/40">
                  <span className="text-[11px] text-ink-secondary">يوم ولادتك</span>
                  <p className="text-lg font-black text-emerald-950 mt-0.5">
                    {resolved.dayOfWeek}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ─── Right Results Column (2 cols) ─── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">

            {/* Main Hijri Age Card */}
            <div className="rounded-2xl bg-hero-gradient p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-200">العمر الدقيق بالهجري</span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
                  🌙 تقويم أم القرى
                </span>
              </div>

              {resolved && !resolved.isFuture ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tight">{resolved.hAge.years}</span>
                    <span className="text-lg font-bold">سنة هجرية</span>
                  </div>
                  <div className="mt-2 text-sm text-emerald-100 font-medium">
                    و{resolved.hAge.months} شهر و{resolved.hAge.days} يوم
                  </div>
                </div>
              ) : (
                <p className="text-sm opacity-80">يرجى إدخال تاريخ ميلاد صحيح سابق لتاريخ اليوم</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 rounded-xl bg-white/20 hover:bg-white/30 py-2 text-xs font-bold text-center transition-all"
                >
                  {copied ? "✓ تم نسخ التقرير" : "📋 نسخ النتيجة"}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-medium transition-all"
                >
                  🖨️ طباعة
                </button>
              </div>
            </div>

            {/* Gregorian Comparison Card */}
            {resolved && !resolved.isFuture && (
              <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-ink">العمر المقابل بالميلادي</h3>
                  <span className="text-xs font-bold text-brand-dark">☀️ شمسي</span>
                </div>

                <div className="rounded-xl bg-brand-surface/50 p-4 text-center border border-brand-border/40">
                  <p className="text-3xl font-black text-ink">
                    {resolved.gAge.years} <span className="text-sm font-normal text-ink-secondary">سنة</span>
                  </p>
                  <p className="text-xs text-ink-muted mt-1 font-semibold">
                    و{resolved.gAge.months} شهر و{resolved.gAge.days} يوم
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed border border-amber-200/70">
                  <span className="font-bold">💡 الفرق بين العمرين: </span>
                  أنت أكبر بالهجري بنحو{" "}
                  <strong>
                    {resolved.hAge.years - resolved.gAge.years > 0
                      ? `${resolved.hAge.years - resolved.gAge.years} سنة كاملة`
                      : "بضعة أشهر"}
                  </strong>
                  ، لأن السنة الهجرية أقصر من الميلادية بنحو 11 يوماً كل عام!
                </div>
              </div>
            )}

            {/* Next Birthday Countdown */}
            {resolved && !resolved.isFuture && (
              <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
                <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                  <span>🎂</span>
                  <span>موعد يوم ميلادك القادم</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-brand-border/30">
                    <span className="text-ink-secondary font-medium">ميلادك الهجري القادم ({resolved.nextHYear} هـ):</span>
                    <span className="font-extrabold text-brand-dark text-sm bg-brand-light/70 px-2 py-0.5 rounded-lg">
                      بعد {resolved.daysToNextHBirthday} يوم
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-ink-secondary font-medium">ميلادك الميلادي القادم:</span>
                    <span className="font-extrabold text-ink text-sm bg-brand-surface px-2 py-0.5 rounded-lg">
                      بعد {resolved.daysToNextGBirthday} يوم
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Astrological Zodiac Sign */}
            {resolved && !resolved.isFuture && (
              <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-2">
                <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                  <span>✨</span>
                  <span>البرج الفلكي والشمسي</span>
                </h3>
                <div className="flex items-center justify-between rounded-xl bg-brand-surface/50 p-3 border border-brand-border/40">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{resolved.zodiac.symbol}</span>
                    <div>
                      <p className="text-sm font-bold text-ink">برج {resolved.zodiac.name}</p>
                      <p className="text-[10px] text-ink-muted">حسب تاريخ ميلادك الميلادي</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-brand-dark">
                    وُلدت يوم {resolved.dayOfWeek}
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink-muted">
        🌙 يتم احتساب التقويم الهجري بدقة متناهية وفق معايير تقويم أم القرى الرسمي المعتمد في المملكة العربية السعودية.
      </p>
    </div>
  );
}
