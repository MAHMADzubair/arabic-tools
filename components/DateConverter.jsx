"use client";

import { useState, useMemo, useEffect } from "react";

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
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const WEEK_DAYS = [
  "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"
];

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

/* ─── Conversion Engine using Intl Umm Al-Qura ────────────────────────────── */
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
  { label: "🌙 غرة رمضان 1448 هـ", mode: "h2g", hy: 1448, hm: 9, hd: 1 },
  { label: "🕋 يوم عرفة 1448 هـ", mode: "h2g", hy: 1448, hm: 12, hd: 9 },
  { label: "🇸🇦 اليوم الوطني السعودي (23 سبتمبر)", mode: "g2h", date: "2026-09-23" },
  { label: "🇸🇦 يوم التأسيس السعودي (22 فبراير)", mode: "g2h", date: "2026-02-22" },
  { label: "✨ رأس السنة الهجرية 1449 هـ", mode: "h2g", hy: 1449, hm: 1, hd: 1 },
];

export default function DateConverter() {
  const [conversionDirection, setConversionDirection] = useState("h2g"); // "h2g" | "g2h"

  // Hijri input state
  const [hijriDay, setHijriDay] = useState(8);
  const [hijriMonth, setHijriMonth] = useState(4);
  const [hijriYear, setHijriYear] = useState(1448);

  // Gregorian input state
  const [gregorianDate, setGregorianDate] = useState("2026-09-19");

  const [copied, setCopied] = useState(false);

  // Initialize with today's real date
  useEffect(() => {
    const today = new Date();
    const todayH = gregorianToHijri(today);
    setHijriDay(todayH.hd);
    setHijriMonth(todayH.hm);
    setHijriYear(todayH.hy);
    setGregorianDate(today.toISOString().slice(0, 10));
  }, []);

  // Set today action
  const handleSetToday = () => {
    const today = new Date();
    const todayH = gregorianToHijri(today);
    setHijriDay(todayH.hd);
    setHijriMonth(todayH.hm);
    setHijriYear(todayH.hy);
    setGregorianDate(today.toISOString().slice(0, 10));
  };

  // Switch direction
  const handleSwap = () => {
    if (conversionDirection === "h2g") {
      setConversionDirection("g2h");
    } else {
      setConversionDirection("h2g");
    }
  };

  // Compute conversion
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

    // Check for Islamic event
    const event = ISLAMIC_EVENTS.find(
      (ev) => ev.month === sourceH.hm && ev.day === sourceH.hd
    );

    // Formatted textual dates
    const hijriFullStr = `${dayOfWeek}، ${sourceH.hd} ${hMonthObj.name} ${sourceH.hy} هـ`;
    const gregorianFullStr = `${dayOfWeek}، ${gd} ${gMonthName} (${gm}) ${gy} م`;

    // Numerical representations
    const hijriDigits = `${sourceH.hy}/${String(sourceH.hm).padStart(2, "0")}/${String(sourceH.hd).padStart(2, "0")} هـ`;
    const gregorianDigits = `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")} م`;

    // Day of year
    const startOfYear = new Date(Date.UTC(gy, 0, 1));
    const dayOfYear = Math.floor((sourceGDate.getTime() - startOfYear.getTime()) / 86400000) + 1;
    const isLeapYear = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
    const daysRemainingYear = (isLeapYear ? 366 : 365) - dayOfYear;

    return {
      sourceH,
      sourceGDate,
      hy: sourceH.hy,
      hm: sourceH.hm,
      hd: sourceH.hd,
      hMonthName: hMonthObj.name,
      hMonthObj,
      gy,
      gm,
      gd,
      gMonthName,
      dayOfWeek,
      event,
      hijriFullStr,
      gregorianFullStr,
      hijriDigits,
      gregorianDigits,
      dayOfYear,
      daysRemainingYear,
    };
  }, [conversionDirection, hijriYear, hijriMonth, hijriDay, gregorianDate]);

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
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12" dir="rtl">
      {/* Header */}
      <div className="mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-sm font-bold text-brand-dark">
          <span>🔄</span>
          <span>محول التاريخ الهجري والميلادي الفوري</span>
        </div>
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
          تحويل التاريخ الهجري والميلادي
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-ink-secondary sm:text-base">
          حوّل أي تاريخ بين التقويمين الهجري والميلادي بدقة متناهية وفق تقويم أم القرى الرسمي المعتمد، مع إظهار اسم اليوم والمناسبات الإسلامية المرافقة.
        </p>
      </div>

      {/* Live Today's Date Banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl backdrop-blur-sm">
            📆
          </span>
          <div>
            <p className="text-xs font-semibold text-emerald-100">تاريخ اليوم الحالي:</p>
            <p className="text-sm sm:text-base font-bold">
              {result ? `${result.dayOfWeek}: ${result.hijriDigits} الموافق ${result.gregorianDigits}` : "جاري التحميل..."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSetToday}
          className="rounded-xl bg-white/20 hover:bg-white/30 px-3.5 py-1.5 text-xs font-bold transition-all"
        >
          📍 تعيين تاريخ اليوم
        </button>
      </div>

      {/* Presets */}
      <div className="mb-6 rounded-2xl border border-brand-border bg-brand-surface/40 p-3 sm:p-4">
        <p className="mb-2 text-xs font-bold text-ink-muted">⚡ مناسبات ومحطات سريعة للتحويل:</p>
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

          {/* Converter Card */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-5">
            {/* Direction Header & Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border/40 pb-4">
              <div>
                <h2 className="text-base font-bold text-ink flex items-center gap-2">
                  <span>{conversionDirection === "h2g" ? "🌙 من هجري إلى ميلادي" : "☀️ من ميلادي إلى هجري"}</span>
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  {conversionDirection === "h2g"
                    ? "أدخل التاريخ الهجري لعرض المقابل بالميلادي"
                    : "أدخل التاريخ الميلادي لعرض المقابل بالهجري"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSwap}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand bg-brand-light px-3 py-1.5 text-xs font-bold text-brand-dark hover:bg-brand hover:text-white transition-all shadow-sm"
              >
                <span>🔄</span>
                <span>تبديل الاتجاه</span>
              </button>
            </div>

            {/* Inputs based on direction */}
            {conversionDirection === "h2g" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {/* Day */}
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

                  {/* Month */}
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

                  {/* Year */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink-secondary">السنة الهجرية</label>
                    <input
                      type="number"
                      min="1300"
                      max="1500"
                      value={hijriYear}
                      onChange={(e) => setHijriYear(e.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface/40 p-2.5 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-brand-surface/50 p-3 text-xs text-ink-secondary border border-brand-border/40">
                  <span className="font-bold text-brand-dark">ℹ️ معلومة الشهر: </span>
                  شهر {result.hMonthName} هو الشهر رقم ({result.hm}) في السنة الهجرية،{" "}
                  {result.hMonthObj.sacred ? "وهو من الأشهر الحُرُم المعظمة." : "ويعتمد على رؤية هلال الشهر."}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary">اختر التاريخ الميلادي</label>
                  <input
                    type="date"
                    value={gregorianDate}
                    onChange={(e) => setGregorianDate(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 p-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Islamic Event Banner if applicable */}
          {result.event && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 text-emerald-950 shadow-sm flex items-start gap-3">
              <span className="text-2xl">🕌</span>
              <div>
                <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-900 mb-1 inline-block">
                  مناسبة إسلامية هامة
                </span>
                <p className="text-sm font-extrabold">{result.event.title}</p>
                <p className="text-xs text-emerald-800 mt-0.5">{result.event.desc}</p>
              </div>
            </div>
          )}

          {/* Hijri Month Calendar Preview */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                <span>📅</span>
                <span>أيام شهر {result.hMonthName} ({result.hy} هـ)</span>
              </h3>
              <span className="text-xs text-ink-muted">تقويم أم القرى</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center text-xs pt-2">
              {WEEK_DAYS.map((wd) => (
                <span key={wd} className="py-1 font-bold text-ink-muted text-[11px]">
                  {wd.replace("ال", "")}
                </span>
              ))}
              {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setConversionDirection("h2g");
                    setHijriDay(d);
                  }}
                  className={`rounded-lg py-2 text-xs font-bold transition-all ${
                    d === result.hd
                      ? "bg-brand text-white shadow-sm"
                      : "bg-brand-surface/50 text-ink hover:bg-brand-light hover:text-brand-dark"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ─── Right Results Column (2 cols) ─── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">

            {/* Main Result Card */}
            <div className="rounded-2xl bg-hero-gradient p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-200">النتيجة المقابلة الدقيقة</span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
                  {conversionDirection === "h2g" ? "☀️ التاريخ الميلادي" : "🌙 التاريخ الهجري"}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold opacity-80 mb-1">{result.dayOfWeek}</p>
                <p className="text-2xl font-black tracking-tight leading-snug">
                  {conversionDirection === "h2g" ? result.gregorianFullStr : result.hijriFullStr}
                </p>
                <p className="mt-1 text-sm text-emerald-100 font-mono">
                  {conversionDirection === "h2g" ? result.gregorianDigits : result.hijriDigits}
                </p>
              </div>

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

            {/* Comparison Details Card */}
            <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
              <h3 className="text-sm font-bold text-ink">تفاصيل ومقارنة التاريخين</h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-brand-border/40">
                  <span className="text-ink-secondary">يوم الأسبوع</span>
                  <span className="font-bold text-brand-dark">{result.dayOfWeek}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-border/40">
                  <span className="text-ink-secondary">التاريخ بالهجري</span>
                  <span className="font-bold text-ink">{result.hijriDigits}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-border/40">
                  <span className="text-ink-secondary">التاريخ بالميلادي</span>
                  <span className="font-bold text-ink">{result.gregorianDigits}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-border/40">
                  <span className="text-ink-secondary">ترتيب اليوم في السنة الميلادية</span>
                  <span className="font-bold text-ink">اليوم رقم {result.dayOfYear}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-ink-secondary">أيام متبقية لنهاية العام</span>
                  <span className="font-bold text-ink">{result.daysRemainingYear} يوم</span>
                </div>
              </div>
            </div>

            {/* Month Info Card */}
            <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-2 text-xs leading-relaxed text-ink-secondary">
              <p className="font-bold text-ink">💡 هل تعلم؟</p>
              <p>
                التقويم الهجري يعتمد على دورة القمر، لذا فإن دورة الفصول تتقدم بمقدار 11 يوماً كل عام بالنسبة للتقويم الميلادي الشمسي، مما يجعل رمضان والأشهر الفضيلة تطوف على كافة فصول السنة (شتاءً، ربيعاً، صيفاً، وخريفاً) كل 33 عاماً.
              </p>
            </div>

          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink-muted">
        🌙 التحويل مطابق للتقويم الرسمي في المملكة العربية السعودية (تقويم أم القرى) وفق الحسابات الفلكية الشرعية المعتمدة.
      </p>
    </div>
  );
}
