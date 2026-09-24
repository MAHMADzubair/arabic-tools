"use client";

import { useState, useMemo } from "react";

const COUNTRIES = [
  {
    id: "sa",
    name: "🇸🇦 السعودية",
    currency: "SAR",
    dayMultiplier: 1.5, // 100% + 50% (نظام العمل م 107)
    nightMultiplier: 1.5,
    weekendMultiplier: 1.5,
    lawNote: "نظام العمل السعودي (م/107): أجر الساعة + 50% من الأجر الأساسي",
    hoursDivisor: 240, // 30 days * 8 hours
  },
  {
    id: "ae",
    name: "🇦🇪 الإمارات",
    currency: "AED",
    dayMultiplier: 1.25, // 100% + 25% (قانون 33 م 19)
    nightMultiplier: 1.5, // 100% + 50% (من 10 مساءً إلى 4 صباحاً)
    weekendMultiplier: 1.5,
    lawNote: "قانون العمل الإماراتي (م/19): أجر الساعة + 25% نهاراً، و + 50% ليلاً والعطل",
    hoursDivisor: 240,
  },
  {
    id: "kw",
    name: "🇰🇼 الكويت",
    currency: "KWD",
    dayMultiplier: 1.25,
    nightMultiplier: 1.5,
    weekendMultiplier: 1.5,
    lawNote: "قانون العمل الكويتي (م/34): أجر الساعة + 25% نهاراً و + 50% للعطل والليل",
    hoursDivisor: 208, // 26 days * 8 hours
  },
  {
    id: "qa",
    name: "🇶🇦 قطر",
    currency: "QAR",
    dayMultiplier: 1.25,
    nightMultiplier: 1.5,
    weekendMultiplier: 1.5,
    lawNote: "قانون العمل القطري (م/74): أجر الساعة + 25% نهاراً و + 50% ليلاً",
    hoursDivisor: 240,
  },
  {
    id: "eg",
    name: "🇪🇬 مصر",
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

export default function OvertimeCalculator() {
  const [countryId, setCountryId] = useState("sa");
  const [salary, setSalary] = useState("8000");
  const [dayHours, setDayHours] = useState("10");
  const [nightHours, setNightHours] = useState("0");
  const [weekendHours, setWeekendHours] = useState("0");

  const country = COUNTRIES.find((c) => c.id === countryId) || COUNTRIES[0];

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
    n.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 rounded-2xl bg-hero-gradient p-6 text-white shadow-result">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏱️</span>
            <h1 className="text-2xl font-extrabold">حاسبة العمل الإضافي (أوفر تايم)</h1>
          </div>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
            وفق قوانين العمل 2026
          </span>
        </div>
        <p className="text-sm text-white/80">
          احسب أجر ساعات العمل الإضافية النهارية والليلية والعطلات بدقة تامة
        </p>
      </div>

      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card sm:p-7 space-y-4">
        {/* Country Selection */}
        <div>
          <label className="mb-2 block text-xs font-bold text-ink-secondary">دولة العمل والنظام القانوني</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {COUNTRIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCountryId(c.id)}
                className={`rounded-xl border p-2.5 text-right transition-all ${
                  countryId === c.id
                    ? "border-brand bg-brand-light font-bold text-brand-dark shadow-sm"
                    : "border-brand-border bg-white text-ink-secondary hover:border-brand-200 text-xs"
                }`}
              >
                <span className="text-xs">{c.name}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-brand-dark font-medium bg-brand-surface/70 p-2 rounded-lg">
            📜 {country.lawNote}
          </p>
        </div>

        {/* Salary Input */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-secondary">
            الراتب الشهري الأساسي ({country.currency})
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              inputMode="decimal"
              placeholder="مثال: 8000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="input w-full text-right pl-12"
            />
            <span className="absolute left-3 text-xs font-semibold text-ink-muted">
              {country.currency}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-ink-muted">
            أجر الساعة الأساسي = {fmt(results.hourlyWage)} {country.currency} (مبني على {country.hoursDivisor} ساعة عمل شهرية)
          </p>
        </div>

        {/* Overtime Hours Inputs */}
        <div className="rounded-xl border border-brand-border/80 bg-slate-50/70 p-4 space-y-3">
          <span className="text-xs font-bold text-ink block">ساعات العمل الإضافي المنجزة هذا الشهر:</span>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-ink-secondary block mb-1">
                ☀️ ساعات نهارية
              </label>
              <input
                type="number"
                min="0"
                value={dayHours}
                onChange={(e) => setDayHours(e.target.value)}
                className="input w-full text-center text-xs"
              />
              <span className="text-[10px] text-ink-muted block mt-1 text-center">
                × {country.dayMultiplier * 100}%
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-ink-secondary block mb-1">
                🌙 ساعات ليلية
              </label>
              <input
                type="number"
                min="0"
                value={nightHours}
                onChange={(e) => setNightHours(e.target.value)}
                className="input w-full text-center text-xs"
              />
              <span className="text-[10px] text-ink-muted block mt-1 text-center">
                × {country.nightMultiplier * 100}%
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-ink-secondary block mb-1">
                🎉 عطلات وأعياد
              </label>
              <input
                type="number"
                min="0"
                value={weekendHours}
                onChange={(e) => setWeekendHours(e.target.value)}
                className="input w-full text-center text-xs"
              />
              <span className="text-[10px] text-ink-muted block mt-1 text-center">
                × {country.weekendMultiplier * 100}%
              </span>
            </div>
          </div>
        </div>

        {/* Results Box */}
        {results.totalHours > 0 && (
          <div className="rounded-xl border border-brand-border bg-brand-light p-4 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-ink-secondary">إجمالي ساعات العمل الإضافي:</span>
              <span className="font-bold text-ink">{results.totalHours} ساعة</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-secondary">أجر الساعة الإضافية العادية:</span>
              <span className="font-bold text-ink">{fmt(results.dayRate)} {country.currency}</span>
            </div>
            <div className="border-t border-brand-border/60 pt-2 flex justify-between text-base">
              <span className="font-bold text-brand-dark">صافي بدل العمل الإضافي المستحق:</span>
              <span className="font-extrabold text-brand text-lg">
                {fmt(results.totalOvertimePay)} {country.currency}
              </span>
            </div>
            <div className="flex justify-between text-xs text-ink-muted pt-1 border-t border-brand-border/40">
              <span>إجمالي الراتب مع العمل الإضافي:</span>
              <span className="font-bold text-ink">{fmt(results.totalSalaryWithOvertime)} {country.currency}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
