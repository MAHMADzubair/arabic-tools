"use client";

import { useState, useMemo } from "react";

/* ─── Country Tax Configs ────────────────────────────────────────────────── */
const COUNTRIES = [
  {
    id: "sa", name: "🇸🇦 السعودية", currency: "SAR", symbol: "ر.س",
    taxName: "ضريبة الدخل", socialName: "التأمينات الاجتماعية (جوسي)",
    hasTax: false, socialRate: 0.10, socialCap: 45000,
    allowances: { housing: 0.25, transport: 800, food: 500 },
    note: "لا توجد ضريبة دخل على الرواتب في السعودية"
  },
  {
    id: "ae", name: "🇦🇪 الإمارات", currency: "AED", symbol: "د.إ",
    taxName: "ضريبة الدخل", socialName: "الضمان الاجتماعي",
    hasTax: false, socialRate: 0, socialCap: 0,
    allowances: { housing: 0.25, transport: 600, food: 400 },
    note: "لا توجد ضريبة دخل على الرواتب في الإمارات"
  },
  {
    id: "eg", name: "🇪🇬 مصر", currency: "EGP", symbol: "ج.م",
    taxName: "ضريبة الدخل", socialName: "التأمين الاجتماعي",
    hasTax: true, socialRate: 0.11, socialCap: 12000,
    allowances: { housing: 0.20, transport: 500, food: 300 },
    brackets: [
      { limit: 15000/12, rate: 0 },
      { limit: 30000/12, rate: 0.025 },
      { limit: 45000/12, rate: 0.10 },
      { limit: 60000/12, rate: 0.15 },
      { limit: 200000/12, rate: 0.20 },
      { limit: 400000/12, rate: 0.225 },
      { limit: Infinity, rate: 0.25 },
    ],
    note: "شرائح ضريبية تصاعدية على الراتب الشهري"
  },
  {
    id: "pk", name: "🇵🇰 باكستان", currency: "PKR", symbol: "₨",
    taxName: "ضريبة الدخل", socialName: "EOBI",
    hasTax: true, socialRate: 0, socialFixed: 370, socialCap: 0,
    allowances: { housing: 0.45, transport: 0.10, food: 0 },
    brackets: [
      { limit: 50000, rate: 0 },
      { limit: 100000, rate: 0.05 },
      { limit: 183333, rate: 0.125 },
      { limit: 266667, rate: 0.225 },
      { limit: 341667, rate: 0.275 },
      { limit: Infinity, rate: 0.35 },
    ],
    note: "شرائح ضريبية 2024-25 (سنوي / 12)"
  },
  {
    id: "gb", name: "🇬🇧 المملكة المتحدة", currency: "GBP", symbol: "£",
    taxName: "ضريبة الدخل", socialName: "التأمين الوطني (NI)",
    hasTax: true, socialRate: 0.08, socialCap: 50270/12,
    allowances: { housing: 0, transport: 0, food: 0 },
    personalAllowance: 12570/12,
    brackets: [
      { limit: 12570/12, rate: 0 },
      { limit: 50270/12, rate: 0.20 },
      { limit: 125140/12, rate: 0.40 },
      { limit: Infinity, rate: 0.45 },
    ],
    note: "يشمل NI عند الدخل فوق £12,570 سنوياً"
  },
  {
    id: "us", name: "🇺🇸 الولايات المتحدة", currency: "USD", symbol: "$",
    taxName: "ضريبة الدخل الفيدرالية", socialName: "الضمان الاجتماعي + Medicare",
    hasTax: true, socialRate: 0.0765, socialCap: 168600/12,
    allowances: { housing: 0, transport: 0, food: 0 },
    standardDeduction: 14600/12,
    brackets: [
      { limit: 11600/12, rate: 0.10 },
      { limit: 47150/12, rate: 0.12 },
      { limit: 100525/12, rate: 0.22 },
      { limit: 191950/12, rate: 0.24 },
      { limit: 243725/12, rate: 0.32 },
      { limit: 609350/12, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ],
    note: "Federal + SS 6.2% + Medicare 1.45% (2024)"
  },
];

/* ─── Tax Calculation ────────────────────────────────────────────────────── */
function calcTax(gross, country) {
  if (!country.hasTax || !country.brackets) return 0;
  let taxable = gross;
  if (country.personalAllowance) taxable = Math.max(0, gross - country.personalAllowance);
  if (country.standardDeduction) taxable = Math.max(0, gross - country.standardDeduction);

  let tax = 0;
  let prev = 0;
  for (const bracket of country.brackets) {
    if (taxable <= prev) break;
    const inBracket = Math.min(taxable, bracket.limit) - prev;
    tax += inBracket * bracket.rate;
    prev = bracket.limit;
    if (bracket.limit === Infinity) break;
  }
  return Math.max(0, tax);
}

function calcSocial(gross, country) {
  if (country.socialFixed) return country.socialFixed;
  if (!country.socialRate) return 0;
  const base = country.socialCap ? Math.min(gross, country.socialCap) : gross;
  return base * country.socialRate;
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function SalaryCalculator({ initialCountry = "sa" }) {
  const [countryId, setCountryId] = useState(initialCountry);
  const [grossSalary, setGrossSalary] = useState(10000);
  const [housingAllowance, setHousingAllowance] = useState(0);
  const [transportAllowance, setTransportAllowance] = useState(0);
  const [foodAllowance, setFoodAllowance] = useState(0);
  const [otherAllowances, setOtherAllowances] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);
  const [period, setPeriod] = useState("monthly"); // monthly | annual
  const [showPayslip, setShowPayslip] = useState(false);

  const country = COUNTRIES.find((c) => c.id === countryId);

  // Auto-set allowances when country changes
  const handleCountryChange = (id) => {
    const c = COUNTRIES.find((x) => x.id === id);
    if (!c) return;
    setCountryId(id);
    // Reset allowances based on country presets
    if (c.allowances.housing < 1) {
      setHousingAllowance(Math.round(grossSalary * c.allowances.housing));
    } else {
      setHousingAllowance(0);
    }
    setTransportAllowance(
      c.allowances.transport < 1
        ? Math.round(grossSalary * c.allowances.transport)
        : c.allowances.transport || 0
    );
    setFoodAllowance(c.allowances.food || 0);
  };

  const result = useMemo(() => {
    if (!country || !grossSalary) return null;
    const gross = Number(grossSalary);
    const housing = Number(housingAllowance);
    const transport = Number(transportAllowance);
    const food = Number(foodAllowance);
    const other = Number(otherAllowances);
    const totalAllowances = housing + transport + food + other;
    const totalGross = gross + totalAllowances;

    const incomeTax = calcTax(gross, country);
    const socialInsurance = calcSocial(gross, country);
    const extraDeductions = Number(otherDeductions);
    const totalDeductions = incomeTax + socialInsurance + extraDeductions;
    const netPay = totalGross - totalDeductions;
    const effectiveTaxRate = totalGross > 0 ? (totalDeductions / totalGross) * 100 : 0;

    const mult = period === "annual" ? 12 : 1;

    return {
      grossBasic: gross * mult,
      totalAllowances: totalAllowances * mult,
      totalGross: totalGross * mult,
      incomeTax: incomeTax * mult,
      socialInsurance: socialInsurance * mult,
      extraDeductions: extraDeductions * mult,
      totalDeductions: totalDeductions * mult,
      netPay: netPay * mult,
      effectiveTaxRate,
      housing: housing * mult,
      transport: transport * mult,
      food: food * mult,
      other: other * mult,
    };
  }, [country, grossSalary, housingAllowance, transportAllowance, foodAllowance, otherAllowances, otherDeductions, period]);

  const sym = country?.symbol || "";

  function fmt(n) {
    return `${sym} ${Math.round(n).toLocaleString("ar-EG")}`;
  }

  const deductionItems = result
    ? [
        { label: country?.taxName || "ضريبة الدخل", value: result.incomeTax, color: "bg-red-400" },
        { label: country?.socialName || "التأمين الاجتماعي", value: result.socialInsurance, color: "bg-orange-400" },
        { label: "خصومات أخرى", value: result.extraDeductions, color: "bg-yellow-400" },
      ]
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12" dir="rtl">
      {/* Header */}
      <div className="mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-sm font-bold text-brand-dark">
          <span>💰</span><span>حاسبة الراتب الصافي</span>
        </div>
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
          حاسبة الراتب الصافي وصافي الأجر
        </h1>
        <p className="mx-auto max-w-xl text-sm text-ink-secondary sm:text-base">
          احسب راتبك الصافي بعد الضرائب والتأمينات الاجتماعية والبدلات لـ 6 دول.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ─── Left: Inputs ─── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Country */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">🌍</span>
              الدولة / نظام الضرائب
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {COUNTRIES.map((c) => (
                <button key={c.id} type="button" onClick={() => handleCountryChange(c.id)}
                  className={`rounded-xl border p-3 text-xs font-semibold text-right transition-all ${
                    countryId === c.id
                      ? "border-brand bg-brand-light text-brand-dark shadow-sm"
                      : "border-brand-border bg-brand-surface/40 text-ink-secondary hover:border-brand-200 hover:bg-white"
                  }`}>
                  <span>{c.name}</span>
                  <span className="block text-[10px] font-normal opacity-70 mt-0.5">
                    {c.hasTax ? `ضريبة تصاعدية` : "بدون ضريبة دخل"}
                  </span>
                </button>
              ))}
            </div>
            {country?.note && (
              <p className="text-xs text-brand-700 bg-brand-light/60 rounded-xl p-2.5">
                ℹ️ {country.note}
              </p>
            )}
          </div>

          {/* Period toggle + Gross Salary */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">💵</span>
                الراتب الأساسي
              </h2>
              <div className="flex rounded-xl border border-brand-border overflow-hidden text-xs font-semibold">
                <button type="button" onClick={() => setPeriod("monthly")}
                  className={`px-3 py-1.5 transition-colors ${period === "monthly" ? "bg-brand text-white" : "bg-white text-ink-secondary hover:bg-brand-light"}`}>
                  شهري
                </button>
                <button type="button" onClick={() => setPeriod("annual")}
                  className={`px-3 py-1.5 transition-colors ${period === "annual" ? "bg-brand text-white" : "bg-white text-ink-secondary hover:bg-brand-light"}`}>
                  سنوي
                </button>
              </div>
            </div>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-muted">{sym}</span>
              <input
                type="number" min="0" value={grossSalary}
                onChange={(e) => setGrossSalary(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-3 pr-10 pl-4 text-lg font-extrabold text-ink focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="الراتب الأساسي الشهري"
              />
            </div>
            <p className="text-xs text-ink-muted">أدخل الراتب الأساسي الشهري — ستُضاف البدلات أدناه</p>
          </div>

          {/* Allowances */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">➕</span>
              البدلات الشهرية
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "🏠 بدل السكن", value: housingAllowance, setter: setHousingAllowance, hint: country?.allowances?.housing < 1 ? `متعارف عليه: ${country.allowances.housing * 100}%` : "" },
                { label: "🚗 بدل النقل", value: transportAllowance, setter: setTransportAllowance, hint: "" },
                { label: "🍽 بدل الطعام", value: foodAllowance, setter: setFoodAllowance, hint: "" },
                { label: "🎁 بدلات أخرى", value: otherAllowances, setter: setOtherAllowances, hint: "" },
              ].map((field) => (
                <div key={field.label} className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary flex justify-between">
                    <span>{field.label}</span>
                    {field.hint && <span className="text-ink-muted">{field.hint}</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
                    <input type="number" min="0" value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2.5 pr-8 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extra Deductions */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">➖</span>
              خصومات إضافية شهرية
            </h2>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
              <input type="number" min="0" value={otherDeductions}
                onChange={(e) => setOtherDeductions(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2.5 pr-8 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                placeholder="قرض، تأمين صحي إضافي..."
              />
            </div>
          </div>
        </div>

        {/* ─── Right: Results ─── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">

            {/* Net Pay Hero */}
            <div className="rounded-2xl bg-hero-gradient p-6 text-white shadow-lg">
              <p className="text-sm font-medium opacity-80">صافي الراتب ({period === "monthly" ? "شهرياً" : "سنوياً"})</p>
              <p className="text-4xl font-extrabold tracking-tight mt-1">
                {result ? fmt(result.netPay) : "—"}
              </p>
              {result && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm text-center">
                    <p className="text-[10px] opacity-80">إجمالي الراتب</p>
                    <p className="text-sm font-bold">{fmt(result.totalGross)}</p>
                  </div>
                  <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm text-center">
                    <p className="text-[10px] opacity-80">إجمالي الخصومات</p>
                    <p className="text-sm font-bold">{fmt(result.totalDeductions)}</p>
                  </div>
                </div>
              )}
              {result && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full bg-white/80 rounded-full transition-all"
                      style={{ width: `${100 - result.effectiveTaxRate}%` }} />
                  </div>
                  <span className="text-xs font-bold opacity-90">
                    {(100 - result.effectiveTaxRate).toFixed(1)}٪ صافي
                  </span>
                </div>
              )}
            </div>

            {/* Breakdown */}
            {result && (
              <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
                <h3 className="text-sm font-bold text-ink">تفصيل قسيمة الراتب</h3>

                {/* Earnings */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wider">الإجمالي ＋</p>
                  {[
                    { label: "الراتب الأساسي", value: result.grossBasic },
                    result.housing > 0 && { label: "بدل السكن", value: result.housing },
                    result.transport > 0 && { label: "بدل النقل", value: result.transport },
                    result.food > 0 && { label: "بدل الطعام", value: result.food },
                    result.other > 0 && { label: "بدلات أخرى", value: result.other },
                  ].filter(Boolean).map((item) => (
                    <div key={item.label} className="flex justify-between text-xs py-1 border-b border-brand-border/40">
                      <span className="text-ink-secondary">{item.label}</span>
                      <span className="font-bold text-green-700">{fmt(item.value)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm py-1 font-bold">
                    <span className="text-ink">الإجمالي الكلي</span>
                    <span className="text-green-700">{fmt(result.totalGross)}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider">الخصومات －</p>
                  {deductionItems.filter((d) => d.value > 0).map((item) => (
                    <div key={item.label} className="space-y-0.5">
                      <div className="flex justify-between text-xs py-0.5">
                        <span className="text-ink-secondary">{item.label}</span>
                        <span className="font-bold text-red-600">({fmt(item.value)})</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-brand-surface">
                        <div className={`h-full rounded-full ${item.color} transition-all`}
                          style={{ width: `${(item.value / result.totalGross) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm py-1 font-bold border-t border-brand-border mt-2 pt-2">
                    <span className="text-ink">إجمالي الخصومات</span>
                    <span className="text-red-600">({fmt(result.totalDeductions)})</span>
                  </div>
                </div>

                {/* Net */}
                <div className="flex justify-between items-center rounded-xl bg-brand-light p-3">
                  <span className="text-sm font-extrabold text-brand-dark">💰 صافي الراتب</span>
                  <span className="text-base font-extrabold text-brand-dark">{fmt(result.netPay)}</span>
                </div>

                {/* Effective rate */}
                <div className="rounded-xl border border-brand-border bg-brand-surface/30 p-3 text-center">
                  <p className="text-xs text-ink-muted">معدل الخصم الفعلي</p>
                  <p className="text-2xl font-extrabold text-ink">{result.effectiveTaxRate.toFixed(1)}٪</p>
                  <p className="text-xs text-ink-muted mt-0.5">من إجمالي الراتب</p>
                </div>
              </div>
            )}

            {/* Period switch reminder */}
            {result && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 space-y-1">
                <p className="font-bold">📊 مقارنة سريعة</p>
                <div className="flex justify-between">
                  <span>صافي شهري:</span>
                  <span className="font-bold">{sym} {Math.round(result.netPay / (period === "annual" ? 12 : 1)).toLocaleString("ar-EG")}</span>
                </div>
                <div className="flex justify-between">
                  <span>صافي سنوي:</span>
                  <span className="font-bold">{sym} {Math.round(result.netPay * (period === "monthly" ? 12 : 1)).toLocaleString("ar-EG")}</span>
                </div>
                <div className="flex justify-between">
                  <span>صافي يومي (÷٣٠):</span>
                  <span className="font-bold">{sym} {Math.round(result.netPay / (period === "annual" ? 365 : 30)).toLocaleString("ar-EG")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink-muted">
        ⚠️ الأرقام تقديرية للأغراض التخطيطية فقط. تختلف الضرائب الفعلية بحسب وضعك الضريبي الكامل واستقطاعاتك المؤهلة. استشر محاسباً معتمداً.
      </p>
    </div>
  );
}