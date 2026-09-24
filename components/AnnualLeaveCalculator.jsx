"use client";

import { useState, useMemo } from "react";

const COUNTRIES = [
  {
    id: "sa",
    name: "🇸🇦 السعودية",
    currency: "SAR",
    standardDays: 21,
    seniorDays: 30, // after 5 years
    seniorThresholdYears: 5,
    wageBasis: "الأجر الفعلي (الأساسي + البدلات)",
    lawNote: "نظام العمل السعودي (م/109 و111): 21 يوماً للسنوات الخمس الأولى و30 يوماً لمن أمضى 5 سنوات",
  },
  {
    id: "ae",
    name: "🇦🇪 الإمارات",
    currency: "AED",
    standardDays: 30,
    seniorDays: 30,
    seniorThresholdYears: 0,
    wageBasis: "الراتب الأساسي فقط لبدل الرصيد",
    lawNote: "قانون العمل الإماراتي (م/29): 30 يوماً تقويمياً عن كل سنة خدمة كاملة",
  },
  {
    id: "kw",
    name: "🇰🇼 الكويت",
    currency: "KWD",
    standardDays: 30,
    seniorDays: 30,
    seniorThresholdYears: 0,
    wageBasis: "الأجر على أساس 26 يوماً",
    lawNote: "قانون العمل الكويتي (م/70): 30 يوم عمل مدفوعة الأجر عن كل سنة",
  },
  {
    id: "eg",
    name: "🇪🇬 مصر",
    currency: "EGP",
    standardDays: 21,
    seniorDays: 30, // لمن أمضى 10 سنوات أو تجاوز سن الخمسين
    seniorThresholdYears: 10,
    wageBasis: "الأجر الشامل",
    lawNote: "قانون العمل المصري (م/47): 21 يوماً وتزاد إلى 30 يوماً لمن أمضى 10 سنوات أو بلغ سن الخمسين",
  },
];

function toNum(v) {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

export default function AnnualLeaveCalculator() {
  const [countryId, setCountryId] = useState("sa");
  const [salary, setSalary] = useState("9000");
  const [yearsOfService, setYearsOfService] = useState("6");
  const [unusedDays, setUnusedDays] = useState("15");

  const country = COUNTRIES.find((c) => c.id === countryId) || COUNTRIES[0];

  const results = useMemo(() => {
    const s = toNum(salary);
    const y = toNum(yearsOfService);
    const uDays = toNum(unusedDays);

    // Entitlement days per year based on service length
    const annualEntitlement =
      country.seniorThresholdYears > 0 && y >= country.seniorThresholdYears
        ? country.seniorDays
        : country.standardDays;

    // Daily wage calculation
    const daysInMonth = country.id === "kw" ? 26 : 30;
    const dailyWage = s > 0 ? s / daysInMonth : 0;

    // Value of full annual leave
    const fullAnnualLeavePay = dailyWage * annualEntitlement;

    // Encashment for unused balance
    const unusedBalanceCompensation = dailyWage * uDays;

    return {
      annualEntitlement,
      dailyWage,
      fullAnnualLeavePay,
      unusedBalanceCompensation,
      daysInMonth,
    };
  }, [salary, yearsOfService, unusedDays, country]);

  const fmt = (n) =>
    n.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 rounded-2xl bg-hero-gradient p-6 text-white shadow-result">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏖️</span>
            <h1 className="text-2xl font-extrabold">حاسبة بدل الإجازات السنوية</h1>
          </div>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
            رصيد وتعويض الإجازة
          </span>
        </div>
        <p className="text-sm text-white/80">
          احسب أجر الإجازة السنوية والتعويض النقدي عن رصيد الإجازات غير المستنفدة
        </p>
      </div>

      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card sm:p-7 space-y-4">
        {/* Country Selection */}
        <div>
          <label className="mb-2 block text-xs font-bold text-ink-secondary">دولة العمل</label>
          <div className="grid grid-cols-2 gap-2">
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

        {/* Salary */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-secondary">
            الراتب الشهري المعتمد للحساب ({country.currency})
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              inputMode="decimal"
              placeholder="مثال: 9000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="input w-full text-right pl-12"
            />
            <span className="absolute left-3 text-xs font-semibold text-ink-muted">
              {country.currency}
            </span>
          </div>
          <span className="text-[10px] text-ink-muted block mt-1">
            * يُعتمد {country.wageBasis}
          </span>
        </div>

        {/* Years of service & Unused Days */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-ink-secondary">
              سنوات الخدمة في المنشأة
            </label>
            <input
              type="number"
              min="0"
              value={yearsOfService}
              onChange={(e) => setYearsOfService(e.target.value)}
              className="input w-full text-center"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-ink-secondary">
              رصيد الإجازات المتبقي (أيام)
            </label>
            <input
              type="number"
              min="0"
              value={unusedDays}
              onChange={(e) => setUnusedDays(e.target.value)}
              className="input w-full text-center"
            />
          </div>
        </div>

        {/* Results */}
        <div className="rounded-xl border border-brand-border bg-brand-light p-4 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-ink-secondary">استحقاق الإجازة السنوي للعامل:</span>
            <span className="font-bold text-ink">{results.annualEntitlement} يوماً بالسنة</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-secondary">قيمة أجر اليوم الواحد:</span>
            <span className="font-bold text-ink">{fmt(results.dailyWage)} {country.currency}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-brand-border/60 pt-2">
            <span className="text-ink-secondary">أجر الإجازة السنوية الكاملة:</span>
            <span className="font-bold text-ink">{fmt(results.fullAnnualLeavePay)} {country.currency}</span>
          </div>
          <div className="border-t border-brand-border/60 pt-2 flex justify-between text-base">
            <span className="font-bold text-brand-dark">التعويض النقدي عن رصيد الأيام المتبقية:</span>
            <span className="font-extrabold text-brand text-lg">
              {fmt(results.unusedBalanceCompensation)} {country.currency}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-ink-muted leading-relaxed">
          وفقاً للأنظمة العمالية، يُسدد أجر الإجازة السنوية مقدماً قبل تمتع العامل بها، ويحق للعامل الحصول على تعويض نقدي كامل عن كافة أيام الإجازات التي لم يستنفدها عند ترك العمل.
        </p>
      </div>
    </div>
  );
}
