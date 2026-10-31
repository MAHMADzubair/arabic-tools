"use client";

import { useState, useMemo } from "react";

const countryPresets = [
  { code: "KSA", country: "السعودية", flag: "🇸🇦", rate: 15, currency: "SAR" },
  { code: "UAE", country: "الإمارات", flag: "🇦🇪", rate: 5, currency: "AED" },
  { code: "BHR", country: "البحرين", flag: "🇧🇭", rate: 10, currency: "BHD" },
  { code: "OMN", country: "عمان", flag: "🇴🇲", rate: 5, currency: "OMR" },
  { code: "EGY", country: "مصر", flag: "🇪🇬", rate: 14, currency: "EGP" },
  { code: "JOR", country: "الأردن", flag: "🇯🇴", rate: 16, currency: "JOD" },
];

function toNumber(val) {
  const n = parseFloat(val);
  return isNaN(n) || n < 0 ? 0 : n;
}

function formatCurrency(val, currency) {
  return `${val.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export default function VatCalculator({
  initialCountry = "KSA",
  pageTitle = null,
  pageDesc = null,
  pageBadge = null,
}) {
  const defaultPreset = countryPresets.find((c) => c.code === initialCountry) || countryPresets[0];

  // Calculation mode: 'add' (غير شامل -> شامل) or 'extract' (شامل -> استخراج غير الشامل)
  const [calcMode, setCalcMode] = useState("add"); // 'add' | 'extract'

  // Country / Rate selection
  const [selectedCountry, setSelectedCountry] = useState(defaultPreset.code);
  const [vatRate, setVatRate] = useState(defaultPreset.rate);
  const [isCustomRate, setIsCustomRate] = useState(false);
  const [customRateInput, setCustomRateInput] = useState(defaultPreset.rate.toString());

  // Amount
  const [amountInput, setAmountInput] = useState("1000");
  const [currency, setCurrency] = useState(defaultPreset.currency);

  // Copy status
  const [copied, setCopied] = useState(false);

  // Handle country preset change
  const handleCountrySelect = (preset) => {
    setSelectedCountry(preset.code);
    setIsCustomRate(false);
    setVatRate(preset.rate);
    setCustomRateInput(preset.rate.toString());
    setCurrency(preset.currency);
  };

  // Handle custom rate change
  const handleCustomRateChange = (val) => {
    setIsCustomRate(true);
    setSelectedCountry("CUSTOM");
    setCustomRateInput(val);
    setVatRate(toNumber(val));
  };

  // Perform calculations
  const result = useMemo(() => {
    const amount = toNumber(amountInput);
    const rateDecimal = vatRate / 100;

    let baseAmount = 0; // المبلغ قبل الضريبة
    let vatAmount = 0; // قيمة الضريبة
    let totalAmount = 0; // المبلغ الإجمالي شامل الضريبة

    if (calcMode === "add") {
      // المبلغ المدخل غير شامل الضريبة -> نضيف الضريبة
      baseAmount = amount;
      vatAmount = baseAmount * rateDecimal;
      totalAmount = baseAmount + vatAmount;
    } else {
      // المبلغ المدخل شامل الضريبة -> نستخرج أصل المبلغ وقيمة الضريبة
      totalAmount = amount;
      baseAmount = rateDecimal > -1 ? totalAmount / (1 + rateDecimal) : 0;
      vatAmount = totalAmount - baseAmount;
    }

    return {
      inputAmount: amount,
      baseAmount,
      vatAmount,
      totalAmount,
      rate: vatRate,
      effectiveRate: vatRate,
    };
  }, [amountInput, vatRate, calcMode]);

  // Copy breakdown
  const handleCopy = () => {
    const text = `🧾 تفاصيل احتساب ضريبة القيمة المضافة (${result.rate}%)\n` +
      `------------------------------------\n` +
      `وضع الحساب: ${calcMode === "add" ? "إضافة الضريبة (السعر غير شامل)" : "استخراج الضريبة (السعر شامل)"}\n` +
      `المبلغ قبل الضريبة: ${formatCurrency(result.baseAmount, currency)}\n` +
      `نسبة الضريبة: ${result.rate}%\n` +
      `مبلغ الضريبة: ${formatCurrency(result.vatAmount, currency)}\n` +
      `المبلغ الإجمالي شامل الضريبة: ${formatCurrency(result.totalAmount, currency)}\n` +
      `------------------------------------\n` +
      `حُسبت بواسطة: أدوات عربية`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12" dir="rtl">
      {/* Header */}
      <div className="mb-8 text-center sm:mb-12">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-4 py-1.5 text-xs font-bold text-[#9A3412]">
          <span>🧾</span>
          <span>{pageBadge || "أداة حساب ضريبة القيمة المضافة"}</span>
        </div>
        <h1 className="mb-3 text-3xl font-extrabold text-[#0D0D0D] sm:text-5xl">
          {pageTitle || "حاسبة ضريبة القيمة المضافة (VAT)"}
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#555555] sm:text-base">
          {pageDesc || (
            <>
              أضف ضريبة القيمة المضافة إلى السعر أو استخرجها من السعر الشامل — اختر الدولة
              لتطبيق النسبة المناسبة (١٥٪ في السعودية، ٥٪ في الإمارات وغيرها).
            </>
          )}
        </p>

        {/* Country Quick Presets */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-bold text-[#6B6B66]">نسبة الضريبة حسب الدولة:</span>
          {countryPresets.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => handleCountrySelect(c)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                selectedCountry === c.code && !isCustomRate
                  ? "border-[#FF5B04] bg-[#FF5B04] text-[#0D0D0D] shadow-sm ring-2 ring-orange-500/30"
                  : "border-[#D4D4CE] bg-white text-[#0D0D0D] hover:border-[#FF5B04]/50 hover:bg-[#F5F5F2]"
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.country}</span>
              <span className={selectedCountry === c.code && !isCustomRate ? "text-[#0D0D0D] font-extrabold" : "text-[#C2410C]"}>
                ({c.rate}%)
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setIsCustomRate(true);
              setSelectedCountry("CUSTOM");
            }}
            className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              isCustomRate
                ? "border-[#FF5B04] bg-[#FF5B04] text-[#0D0D0D] shadow-sm ring-2 ring-orange-500/30"
                : "border-[#D4D4CE] bg-white text-[#0D0D0D] hover:border-[#FF5B04]/50 hover:bg-[#F5F5F2]"
            }`}
          >
            ⚙️ نسبة مخصصة
          </button>
        </div>
      </div>

      {/* Main Calculator Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Inputs (6 cols) */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-2xl border border-[#D4D4CE] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-[#0D0D0D] sm:text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#D4D4CE] bg-[#F5F5F2] text-sm text-[#0D0D0D]">
                ⚙️
              </span>
              <span>خيارات حساب الضريبة</span>
            </h2>

            {/* Mode Switcher Tabs */}
            <div className="mb-6">
              <label className="mb-2 block text-xs font-bold text-[#555555]">
                طريقة الحساب المطلوبة:
              </label>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F5F5F2] p-1.5 border border-[#D4D4CE]">
                <button
                  type="button"
                  onClick={() => setCalcMode("add")}
                  className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-3 text-xs font-bold transition ${
                    calcMode === "add"
                      ? "bg-[#FF5B04] text-[#0D0D0D] shadow-sm font-extrabold"
                      : "text-[#555555] hover:text-[#0D0D0D]"
                  }`}
                >
                  <span className="text-sm">➕ إضافة الضريبة</span>
                  <span className={`text-[10px] font-normal ${calcMode === "add" ? "text-[#0D0D0D]/80" : "text-[#6B6B66]"}`}>
                    (السعر الأصلي غير شامل)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode("extract")}
                  className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-3 text-xs font-bold transition ${
                    calcMode === "extract"
                      ? "bg-[#FF5B04] text-[#0D0D0D] shadow-sm font-extrabold"
                      : "text-[#555555] hover:text-[#0D0D0D]"
                  }`}
                >
                  <span className="text-sm">➖ استخراج الضريبة</span>
                  <span className={`text-[10px] font-normal ${calcMode === "extract" ? "text-[#0D0D0D]/80" : "text-[#6B6B66]"}`}>
                    (السعر النهائي شامل)
                  </span>
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-5">
              <label className="mb-1.5 block text-xs font-bold text-[#555555]">
                {calcMode === "add"
                  ? "المبلغ الأساسي (قبل الضريبة)"
                  : "المبلغ الإجمالي (شامل الضريبة)"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="مثال: 1000"
                  className="w-full rounded-2xl border border-[#D4D4CE] bg-white px-4 py-3 text-lg font-bold text-[#0D0D0D] focus:border-[#FF5B04] focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
                <span className="absolute left-4 top-3.5 text-xs font-bold text-[#6B6B66]">
                  {currency}
                </span>
              </div>
            </div>

            {/* VAT Rate setting */}
            <div className="mb-5">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold text-[#555555]">
                  نسبة الضريبة المطبقة (%)
                </label>
                {isCustomRate && (
                  <span className="text-[11px] font-bold text-[#C2410C]">
                    نسبة مخصصة
                  </span>
                )}
              </div>

              {isCustomRate ? (
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={customRateInput}
                    onChange={(e) => handleCustomRateChange(e.target.value)}
                    placeholder="أدخل النسبة مئوية (مثال: 15)"
                    className="w-full rounded-xl border border-[#D4D4CE] bg-white px-3 py-2 text-sm font-bold text-[#0D0D0D] focus:border-[#FF5B04] focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-[#6B6B66]">
                    %
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 14, 15].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => {
                        setVatRate(rate);
                        setCustomRateInput(rate.toString());
                      }}
                      className={`rounded-xl border py-2 text-xs font-bold transition ${
                        vatRate === rate && !isCustomRate
                          ? "border-[#FF5B04] bg-[#FFF7ED] text-[#9A3412] ring-2 ring-orange-500/20"
                          : "border-[#D4D4CE] bg-white text-[#0D0D0D] hover:bg-[#F5F5F2]"
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Currency selector */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#555555]">
                العملة المعروضة
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-[#D4D4CE] bg-[#F5F5F2] px-3 py-2 text-xs font-semibold text-[#0D0D0D] focus:border-[#FF5B04] focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="AED">درهم إماراتي (AED)</option>
                <option value="BHD">دينار بحريني (BHD)</option>
                <option value="OMR">ريال عماني (OMR)</option>
                <option value="EGP">جنيه مصري (EGP)</option>
                <option value="JOD">دينار أردني (JOD)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="KWD">دينار كويتي (KWD)</option>
                <option value="QAR">ريال قطري (QAR)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Output Card (6 cols) */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-2xl border border-[#D4D4CE] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="inline-block rounded-full bg-[#0D0D0D] px-3 py-1 text-xs font-bold text-white">
                  النتيجة الحسابية
                </span>
                <h2 className="mt-1 text-2xl font-bold text-[#0D0D0D]">
                  تفاصيل الفاتورة الضريبية
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4D4CE] bg-[#F5F5F2] px-3.5 py-1.5 text-xs font-bold text-[#0D0D0D] transition hover:bg-[#EAEAE5]"
              >
                <span>{copied ? "✓ تم النسخ!" : "📋 نسخ الفاتورة"}</span>
              </button>
            </div>

            {/* Large Highlight Box: Total Amount */}
            <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#FF7A29] to-[#FF5B04] p-5 text-center text-[#0D0D0D] shadow-md shadow-orange-500/20 border border-orange-500/20">
              <p className="text-xs font-bold text-[#0D0D0D]/90">
                المبلغ النهائي المستحق (شامل الضريبة)
              </p>
              <p className="mt-1 text-3xl font-extrabold text-[#0D0D0D] sm:text-4xl">
                {formatCurrency(result.totalAmount, currency)}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#0D0D0D]/80">
                نسبة الضريبة المطبقة: {result.rate}%
              </p>
            </div>

            {/* Breakdown Invoice Mockup */}
            <div className="space-y-3 rounded-2xl border border-[#D4D4CE] bg-[#F5F5F2]/70 p-4 font-mono text-xs text-[#0D0D0D]">
              <div className="flex items-center justify-between border-b border-[#D4D4CE] pb-2">
                <span className="font-sans font-bold text-[#555555]">
                  المبلغ قبل الضريبة (الأساسي):
                </span>
                <span className="font-bold text-[#0D0D0D] text-sm">
                  {formatCurrency(result.baseAmount, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-[#D4D4CE] pb-2">
                <span className="font-sans font-bold text-[#555555] flex items-center gap-1">
                  <span>مبلغ الضريبة ({result.rate}%):</span>
                </span>
                <span className="font-bold text-[#C2410C] text-sm">
                  +{formatCurrency(result.vatAmount, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-sans font-bold text-[#0D0D0D]">
                  الإجمالي الكلي شامل الضريبة:
                </span>
                <span className="font-bold text-[#0D0D0D] text-base">
                  {formatCurrency(result.totalAmount, currency)}
                </span>
              </div>
            </div>

            {/* Visual breakdown bar */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#6B6B66]">
                <span>نسبة أصل المبلغ: {((result.baseAmount / (result.totalAmount || 1)) * 100).toFixed(1)}%</span>
                <span>نسبة الضريبة: {((result.vatAmount / (result.totalAmount || 1)) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-[#EAEAE5] shadow-inner">
                <div
                  style={{
                    width: `${Math.max(5, (result.baseAmount / (result.totalAmount || 1)) * 100)}%`,
                  }}
                  className="bg-[#0D0D0D] transition-all duration-300"
                  title="المبلغ الأصلي"
                />
                <div
                  style={{
                    width: `${Math.max(2, (result.vatAmount / (result.totalAmount || 1)) * 100)}%`,
                  }}
                  className="bg-[#FF5B04] transition-all duration-300"
                  title="الضريبة"
                />
              </div>
              <div className="mt-2 flex items-center justify-center gap-6 text-[11px] font-bold">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#0D0D0D]" />
                  <span className="text-[#555555]">أصل المبلغ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF5B04]" />
                  <span className="text-[#555555]">قيمة الضريبة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
