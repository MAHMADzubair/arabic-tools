"use client";

import { useState, useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  Data (unchanged logic). `flag` emoji replaced by a 2-letter code   */
/*  because flag emoji render as plain letters on Windows.             */
/* ------------------------------------------------------------------ */
const countryPresets = [
  { code: "KSA", short: "SA", country: "السعودية", rate: 15, currency: "SAR" },
  { code: "UAE", short: "AE", country: "الإمارات", rate: 5, currency: "AED" },
  { code: "BHR", short: "BH", country: "البحرين", rate: 10, currency: "BHD" },
  { code: "OMN", short: "OM", country: "عمان", rate: 5, currency: "OMR" },
  { code: "EGY", short: "EG", country: "مصر", rate: 14, currency: "EGP" },
  { code: "JOR", short: "JO", country: "الأردن", rate: 16, currency: "JOD" },
];

const quickRates = [5, 10, 14, 15];

function toNumber(val) {
  const n = parseFloat(val);
  return isNaN(n) || n < 0 ? 0 : n;
}

// Western digits (1,000.00) to match the rest of the Qemlo UI.
// To get Arabic-Indic digits back, use "ar-SA" here.
function formatCurrency(val, currency) {
  return `${val.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

/* ------------------------------------------------------------------ */
/*  Inline SVG icons (24 grid, stroke 1.8, currentColor). No emoji.    */
/* ------------------------------------------------------------------ */
const ICONS = {
  receipt: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h8" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
    </>
  ),
};

function Icon({ name, size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICONS[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared class strings (Tailwind). Light = default, dark = `dark:`   */
/*  which follows the device setting (prefers-color-scheme).           */
/* ------------------------------------------------------------------ */
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5B04]";

const muted = "text-[#55554F] dark:text-[#BFB8B0]";

const card =
  "rounded-[28px] p-6 sm:p-8 bg-gradient-to-b from-white to-[#F6F2EB] ring-1 ring-black/10 " +
  "shadow-[inset_0_1px_0_#fff,0_14px_30px_rgba(60,30,10,0.10)] " +
  "dark:from-white/[0.09] dark:to-white/[0.03] dark:ring-white/10 " +
  "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_14px_30px_rgba(0,0,0,0.4)]";

const fieldLabel = `mb-2 block text-sm font-bold ${muted}`;

const fieldBase =
  "w-full rounded-2xl bg-white font-bold text-[#0D0D0D] ring-1 ring-black/15 outline-none transition " +
  "placeholder:font-normal placeholder:text-[#8A8A82] focus:ring-2 focus:ring-[#FF5B04] " +
  "dark:bg-black/30 dark:text-[#F5F5F2] dark:ring-white/15 dark:placeholder:text-[#8A8A82] motion-reduce:transition-none";

const pillBase =
  `inline-flex h-11 items-center gap-2 rounded-full ps-2 pe-4 text-sm font-bold transition motion-reduce:transition-none ${focusRing}`;
const pillActive =
  "bg-gradient-to-b from-[#FF8A3D] to-[#FF5B04] text-[#0D0D0D] " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_18px_rgba(255,91,4,0.26)]";
const pillIdle =
  "bg-white text-[#0D0D0D] ring-1 ring-black/10 shadow-[inset_0_1px_0_#fff] hover:ring-[#FF5B04]/60 " +
  "dark:bg-white/[0.07] dark:text-[#F5F5F2] dark:ring-white/15 " +
  "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]";

export default function VatCalculator({
  initialCountry = "KSA",
  pageTitle = null,
  pageDesc = null,
  pageBadge = null,
}) {
  const defaultPreset =
    countryPresets.find((c) => c.code === initialCountry) || countryPresets[0];

  // Calculation mode: 'add' (غير شامل -> شامل) or 'extract' (شامل -> استخراج غير الشامل)
  const [calcMode, setCalcMode] = useState("add");

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

  const handleCountrySelect = (preset) => {
    setSelectedCountry(preset.code);
    setIsCustomRate(false);
    setVatRate(preset.rate);
    setCustomRateInput(preset.rate.toString());
    setCurrency(preset.currency);
  };

  const handleCustomRateChange = (val) => {
    setIsCustomRate(true);
    setSelectedCountry("CUSTOM");
    setCustomRateInput(val);
    setVatRate(toNumber(val));
  };

  // Calculations (unchanged)
  const result = useMemo(() => {
    const amount = toNumber(amountInput);
    const rateDecimal = vatRate / 100;

    let baseAmount = 0; // المبلغ قبل الضريبة
    let vatAmount = 0; // قيمة الضريبة
    let totalAmount = 0; // المبلغ الإجمالي شامل الضريبة

    if (calcMode === "add") {
      baseAmount = amount;
      vatAmount = baseAmount * rateDecimal;
      totalAmount = baseAmount + vatAmount;
    } else {
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

  const basePct = (result.baseAmount / (result.totalAmount || 1)) * 100;
  const vatPct = (result.vatAmount / (result.totalAmount || 1)) * 100;

  const handleCopy = async () => {
    const text =
      `تفاصيل احتساب ضريبة القيمة المضافة (${result.rate}%)\n` +
      `------------------------------------\n` +
      `وضع الحساب: ${calcMode === "add" ? "إضافة الضريبة (السعر غير شامل)" : "استخراج الضريبة (السعر شامل)"}\n` +
      `المبلغ قبل الضريبة: ${formatCurrency(result.baseAmount, currency)}\n` +
      `نسبة الضريبة: ${result.rate}%\n` +
      `مبلغ الضريبة: ${formatCurrency(result.vatAmount, currency)}\n` +
      `المبلغ الإجمالي شامل الضريبة: ${formatCurrency(result.totalAmount, currency)}\n` +
      `------------------------------------\n` +
      `حُسبت بواسطة: Qemlo`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  const modes = [
    { id: "add", icon: "plus", title: "إضافة الضريبة", hint: "السعر الأصلي غير شامل" },
    { id: "extract", icon: "minus", title: "استخراج الضريبة", hint: "السعر النهائي شامل" },
  ];

  return (
    <section
      dir="rtl"
      aria-labelledby="vat-title"
      className="mx-auto max-w-5xl px-4 py-10 text-[#0D0D0D] sm:py-14 dark:text-[#F5F5F2]"
    >
      {/* ---------------------------- Header ---------------------------- */}
      <header className="mb-10 text-center sm:mb-12">
        <p className="mb-4 inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-xs font-bold text-[#55554F] ring-1 ring-black/10 shadow-[inset_0_1px_0_#fff] dark:bg-white/[0.07] dark:text-[#E9E6E0] dark:ring-white/15 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
          <Icon name="receipt" size={16} className="text-[#FF5B04]" />
          <span>{pageBadge || "أداة حساب ضريبة القيمة المضافة"}</span>
        </p>

        <h1
          id="vat-title"
          className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl"
        >
          {pageTitle || "حاسبة ضريبة القيمة المضافة (VAT)"}
        </h1>

        <p className={`mx-auto max-w-2xl text-sm leading-loose sm:text-base ${muted}`}>
          {pageDesc || (
            <>
              أضف ضريبة القيمة المضافة إلى السعر أو استخرجها من السعر الشامل. اختر الدولة
              لتطبيق النسبة المناسبة (15% في السعودية، 5% في الإمارات وغيرها).
            </>
          )}
        </p>

        {/* Country presets */}
        <div
          role="group"
          aria-label="نسبة الضريبة حسب الدولة"
          className="mt-8 flex flex-wrap items-center justify-center gap-2.5"
        >
          {countryPresets.map((c) => {
            const active = selectedCountry === c.code && !isCustomRate;
            return (
              <button
                key={c.code}
                type="button"
                aria-pressed={active}
                onClick={() => handleCountrySelect(c)}
                className={`${pillBase} ${active ? pillActive : pillIdle}`}
              >
                <span
                  dir="ltr"
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ${active
                      ? "bg-[#0D0D0D] text-[#FF8A3D]"
                      : "bg-black/[0.06] text-[#0D0D0D] dark:bg-white/10 dark:text-[#F5F5F2]"
                    }`}
                >
                  {c.short}
                </span>
                <span>{c.country}</span>
                <span className="text-xs font-semibold opacity-70">{c.rate}%</span>
              </button>
            );
          })}

          <button
            type="button"
            aria-pressed={isCustomRate}
            onClick={() => {
              setIsCustomRate(true);
              setSelectedCountry("CUSTOM");
            }}
            className={`${pillBase} ${isCustomRate ? pillActive : pillIdle}`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full ${isCustomRate
                  ? "bg-[#0D0D0D] text-[#FF8A3D]"
                  : "bg-black/[0.06] text-[#0D0D0D] dark:bg-white/10 dark:text-[#F5F5F2]"
                }`}
            >
              <Icon name="gear" size={16} />
            </span>
            <span>نسبة مخصصة</span>
          </button>
        </div>
      </header>

      {/* ---------------------------- Grid ---------------------------- */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* ------------------------ Inputs card ------------------------ */}
        <div className="lg:col-span-6">
          <div className={card}>
            <h2 className="mb-6 flex items-center gap-3 text-lg font-bold">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#FFB07A] to-[#FF5B04] text-[#0D0D0D] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                <Icon name="sliders" size={20} />
              </span>
              <span>خيارات حساب الضريبة</span>
            </h2>

            {/* Mode switcher */}
            <div className="mb-6">
              <span id="mode-label" className={fieldLabel}>
                طريقة الحساب
              </span>
              <div
                role="radiogroup"
                aria-labelledby="mode-label"
                className="grid grid-cols-2 gap-1.5 rounded-2xl bg-black/[0.06] p-1.5 ring-1 ring-black/5 dark:bg-black/40 dark:ring-white/10"
              >
                {modes.map((m) => {
                  const on = calcMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setCalcMode(m.id)}
                      className={`flex min-h-[64px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2.5 text-center transition motion-reduce:transition-none ${focusRing} ${on
                          ? "bg-gradient-to-b from-[#FF9A4D] to-[#FF5B04] text-[#0D0D0D] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_18px_rgba(255,91,4,0.26)]"
                          : `${muted} hover:text-[#0D0D0D] dark:hover:text-[#F5F5F2]`
                        }`}
                    >
                      <span className="flex items-center gap-1.5 text-sm font-bold">
                        <Icon name={m.icon} size={16} />
                        {m.title}
                      </span>
                      <span className={`text-[11px] font-medium ${on ? "text-[#0D0D0D]/75" : "opacity-80"}`}>
                        {m.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label htmlFor="vat-amount" className={fieldLabel}>
                {calcMode === "add"
                  ? "المبلغ الأساسي (قبل الضريبة)"
                  : "المبلغ الإجمالي (شامل الضريبة)"}
              </label>
              <div className="relative">
                <input
                  id="vat-amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="مثال: 1000"
                  className={`${fieldBase} h-14 px-4 pe-20 text-xl tabular-nums`}
                />
                <span
                  dir="ltr"
                  className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 rounded-full bg-black/[0.06] px-3 py-1 text-xs font-bold text-[#55554F] dark:bg-white/10 dark:text-[#E9E6E0]"
                >
                  {currency}
                </span>
              </div>
            </div>

            {/* VAT rate */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor={isCustomRate ? "vat-custom" : undefined} className="text-sm font-bold text-[#55554F] dark:text-[#BFB8B0]">
                  نسبة الضريبة المطبقة (%)
                </label>
                {isCustomRate && (
                  <span className="rounded-full bg-[#FF5B04]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#B83A00] dark:bg-[#FF5B04]/15 dark:text-[#FF9A5C]">
                    نسبة مخصصة
                  </span>
                )}
              </div>

              {isCustomRate ? (
                <div className="relative">
                  <input
                    id="vat-custom"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.1"
                    value={customRateInput}
                    onChange={(e) => handleCustomRateChange(e.target.value)}
                    placeholder="أدخل النسبة المئوية (مثال: 15)"
                    className={`${fieldBase} h-12 px-4 pe-12 text-base tabular-nums`}
                  />
                  <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#55554F] dark:text-[#BFB8B0]">
                    %
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {quickRates.map((rate) => {
                    const on = vatRate === rate && !isCustomRate;
                    return (
                      <button
                        key={rate}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setVatRate(rate);
                          setCustomRateInput(rate.toString());
                        }}
                        className={`h-11 rounded-xl text-sm font-bold tabular-nums transition motion-reduce:transition-none ${focusRing} ${on
                            ? "bg-[#FF5B04]/10 text-[#B83A00] ring-2 ring-[#FF5B04] dark:bg-[#FF5B04]/15 dark:text-[#FF9A5C]"
                            : "bg-white text-[#0D0D0D] ring-1 ring-black/10 hover:ring-[#FF5B04]/60 dark:bg-white/[0.07] dark:text-[#F5F5F2] dark:ring-white/15"
                          }`}
                      >
                        {rate}%
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="vat-currency" className={fieldLabel}>
                العملة المعروضة
              </label>
              <select
                id="vat-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`${fieldBase} h-12 px-4 text-sm font-semibold`}
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

        {/* ------------------------ Result panel ------------------------ */}
        <div className="lg:col-span-6">
          <div className="relative h-full overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#241A14_0%,#0D0D0D_65%)] p-6 text-[#F5F5F2] ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_30px_60px_rgba(60,30,10,0.30)] sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_320px_at_15%_0%,rgba(255,91,4,0.22),transparent_70%)]"
            />

            <div className="relative">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold sm:text-2xl">تفاصيل الفاتورة الضريبية</h2>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold transition motion-reduce:transition-none ${focusRing} ${copied
                      ? "bg-gradient-to-b from-[#FF8A3D] to-[#FF5B04] text-[#0D0D0D]"
                      : "bg-white/10 text-[#F5F5F2] ring-1 ring-white/15 hover:bg-white/15"
                    }`}
                >
                  <Icon name={copied ? "check" : "copy"} size={18} />
                  <span>{copied ? "تم النسخ" : "نسخ الفاتورة"}</span>
                </button>
              </div>

              {/* Total */}
              <div
                aria-live="polite"
                aria-atomic="true"
                className="mb-6 rounded-3xl bg-gradient-to-br from-[#FFA25A] via-[#FF5B04] to-[#DB4600] p-6 text-center text-[#0D0D0D] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_16px_34px_rgba(255,91,4,0.25)]"
              >
                <p className="text-sm font-bold text-[#0D0D0D]/85">
                  المبلغ النهائي المستحق (شامل الضريبة)
                </p>
                <p className="mt-2 break-words text-4xl font-extrabold tabular-nums sm:text-5xl" dir="ltr">
                  {formatCurrency(result.totalAmount, currency)}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#0D0D0D]/80">
                  نسبة الضريبة المطبقة: {result.rate}%
                </p>
              </div>

              {/* Breakdown */}
              <dl className="divide-y divide-white/10 border-y border-white/10">
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <dt className="text-sm font-semibold text-[#BFB8B0]">المبلغ قبل الضريبة (الأساسي)</dt>
                  <dd className="text-base font-bold tabular-nums" dir="ltr">
                    {formatCurrency(result.baseAmount, currency)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <dt className="text-sm font-semibold text-[#BFB8B0]">مبلغ الضريبة ({result.rate}%)</dt>
                  <dd className="text-base font-bold tabular-nums text-[#FF9A5C]" dir="ltr">
                    +{formatCurrency(result.vatAmount, currency)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <dt className="text-sm font-bold">الإجمالي الكلي شامل الضريبة</dt>
                  <dd className="text-lg font-extrabold tabular-nums" dir="ltr">
                    {formatCurrency(result.totalAmount, currency)}
                  </dd>
                </div>
              </dl>

              {/* Breakdown bar */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#BFB8B0]">
                  <span>أصل المبلغ: {basePct.toFixed(1)}%</span>
                  <span>الضريبة: {vatPct.toFixed(1)}%</span>
                </div>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    style={{ width: `${Math.max(5, basePct)}%` }}
                    className="bg-[#F5F5F2] transition-all duration-300 motion-reduce:transition-none"
                    title="المبلغ الأصلي"
                  />
                  <div
                    style={{ width: `${Math.max(2, vatPct)}%` }}
                    className="bg-[#FF5B04] transition-all duration-300 motion-reduce:transition-none"
                    title="الضريبة"
                  />
                </div>
                <div className="mt-3 flex items-center justify-center gap-6 text-xs font-bold text-[#BFB8B0]">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F5F5F2]" />
                    أصل المبلغ
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF5B04]" />
                    قيمة الضريبة
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}