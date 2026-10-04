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




function VatCalculatorStyles() {
  return (
    <style>{`
      .vat-root{
        --vat-bg:#F5F5F2;
        --vat-surface:#FFFFFF;
        --vat-surface-2:#ECECE7;
        --vat-border:#D4D4CE;
        --vat-text:#0D0D0D;
        --vat-text-2:#555555;
        --vat-muted:#6B6B66;
        --vat-ink:#0D0D0D;
        --vat-ink-text:#FFFFFF;
        --vat-ink-muted:#B5B5B0;
        --vat-orange:#FF5B04;
        --vat-orange-hover:#FF7A33;
        --vat-orange-press:#E64F00;
        --vat-on-orange:#0D0D0D;
        --vat-success:#137A47;
        --vat-warning:#8A5A00;
        --vat-error:#C8321F;
      }

      @media (prefers-color-scheme:dark){
        :root:not([data-theme="light"]) .vat-root{
          --vat-bg:#0D0D0D;
          --vat-surface:#161616;
          --vat-surface-2:#1D1D1D;
          --vat-border:#2A2A2A;
          --vat-text:#F5F5F2;
          --vat-text-2:#B5B5B0;
          --vat-muted:#8E8E89;
          --vat-ink:#F5F5F2;
          --vat-ink-text:#0D0D0D;
          --vat-ink-muted:#555555;
          --vat-success:#4ADE80;
          --vat-warning:#FBBF24;
          --vat-error:#FF7A6B;
        }
      }

      :root[data-theme="dark"] .vat-root{
        --vat-bg:#0D0D0D;
        --vat-surface:#161616;
        --vat-surface-2:#1D1D1D;
        --vat-border:#2A2A2A;
        --vat-text:#F5F5F2;
        --vat-text-2:#B5B5B0;
        --vat-muted:#8E8E89;
        --vat-ink:#F5F5F2;
        --vat-ink-text:#0D0D0D;
        --vat-ink-muted:#555555;
        --vat-success:#4ADE80;
        --vat-warning:#FBBF24;
        --vat-error:#FF7A6B;
      }

      .vat-root{color:var(--vat-text)}
      .vat-root :focus-visible{
        outline:2px solid var(--vat-orange);
        outline-offset:3px;
      }

      .vat-card{
        background:var(--vat-surface);
        border:1px solid var(--vat-border);
      }

      .vat-input{
        background:var(--vat-surface);
        border:1px solid var(--vat-border);
        color:var(--vat-text);
      }

      .vat-input:focus{
        border-color:var(--vat-orange);
        box-shadow:0 0 0 3px color-mix(in srgb,var(--vat-orange) 15%,transparent);
        outline:none;
      }

      .vat-selected{
        background:var(--vat-orange)!important;
        border-color:var(--vat-orange)!important;
        color:var(--vat-on-orange)!important;
      }

      .vat-secondary{
        background:var(--vat-surface);
        border:1px solid var(--vat-border);
        color:var(--vat-text);
      }

      .vat-secondary:hover{
        border-color:var(--vat-orange);
      }

      .vat-step{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        width:28px;
        height:28px;
        flex:none;
        border-radius:8px;
        background:var(--vat-orange);
        color:var(--vat-on-orange);
        font-size:.75rem;
        font-weight:900;
      }

      .vat-result{
        position:relative;
        overflow:hidden;
        background:var(--vat-ink);
        color:var(--vat-ink-text);
        border:1px solid var(--vat-border);
      }

      .vat-result::after{
        content:"";
        position:absolute;
        inset-inline-end:-46px;
        top:-46px;
        width:160px;
        height:160px;
        border:30px solid var(--vat-orange);
        border-radius:999px;
        opacity:.12;
        pointer-events:none;
      }

      .vat-result-chip{
        background:var(--vat-orange);
        color:var(--vat-on-orange);
      }

      .vat-bar{
        background:var(--vat-surface-2);
      }

      .vat-bar-base{
        background:var(--vat-text);
      }

      .vat-bar-tax{
        background:var(--vat-orange);
      }
    `}</style>
  );
}

export default function VatCalculator({

  initialCountry = "KSA",

  pageTitle = null,

  pageDesc = null,

  pageBadge = null,

}) {

  const defaultPreset = countryPresets.find((c) => c.code === initialCountry) || countryPresets[0];



  // Calculation mode: 'add' (غير شامل -> شامل) or 'extract' (شامل -> استخراج غير الشامل)

  const [calcMode, setCalcMode] = useState("add"); *// 'add' | 'extract'*



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



    let baseAmount = 0; *// المبلغ قبل الضريبة*

    let vatAmount = 0; *// قيمة الضريبة*

    let totalAmount = 0; *// المبلغ الإجمالي شامل الضريبة*



    if (calcMode === "add") {

      // المبلغ المدخل غير شامل الضريبة -> نضيف الضريبة

      baseAmount = amount;

      vatAmount = baseAmount \* rateDecimal;

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

    <div className="vat-root mx-auto max-w-4xl px-4 py-8 sm:py-12" dir="rtl">
      <VatCalculatorStyles />

      {/\* Header \*/}

      <div className="mb-8 text-center sm:mb-12">

        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--vat-orange)] bg-[var(--vat-orange)] px-4 py-1.5 text-sm font-black text-[#0D0D0D]">

          <span className="vat-step" aria-hidden="true">VAT</span>

          <span>{pageBadge || "أداة حساب ضريبة القيمة المضافة"}</span>

        </div>

        <h1 className="mb-3 text-3xl font-extrabold text-[var(--vat-text)] sm:text-5xl">

          {pageTitle || "حاسبة ضريبة القيمة المضافة (VAT)"}

        </h1>

        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[var(--vat-text-2)] sm:text-base">

          {pageDesc || (

            <>

              أضف ضريبة القيمة المضافة إلى السعر أو استخرجها من السعر الشامل — اختر الدولة

              لتطبيق النسبة المناسبة (١٥٪ في السعودية، ٥٪ في الإمارات وغيرها).

            </>

          )}

        </p>



        {/\* Country Quick Presets \*/}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">

          <span className="text-xs font-bold text-[var(--vat-muted)]">نسبة الضريبة حسب الدولة:</span>

          {countryPresets.map((c) => (

            <button

              key={c.code}

              type="button"

              onClick={() => handleCountrySelect(c)}

              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${

                selectedCountry === c.code && !isCustomRate

                  ? "vat-selected"

                  : "border-[var(--vat-border)] bg-[var(--vat-surface)] text-[var(--vat-text)] hover:border-[var(--vat-orange)]/50 hover:bg-[var(--vat-surface-2)]"

              }`}

            >

              <span>{c.flag}</span>

              <span>{c.country}</span>

              <span className={selectedCountry === c.code && !isCustomRate ? "text-[#0D0D0D]" : "text-[var(--vat-orange)]"}>

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

                ? "vat-selected"

                : "border-[var(--vat-border)] bg-[var(--vat-surface)] text-[var(--vat-text)] hover:border-[var(--vat-orange)]/50 hover:bg-[var(--vat-surface-2)]"

            }`}

          >

            نسبة مخصصة

          </button>

        </div>

      </div>



      {/\* Main Calculator Grid \*/}

      <div className="grid gap-8 lg:grid-cols-12">

        {/\* Left Inputs (6 cols) \*/}

        <div className="space-y-6 lg:col-span-6">

          <div className="vat-card rounded-3xl p-6 sm:p-8">

            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-[var(--vat-text)] sm:text-lg">

              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--vat-orange)] text-[var(--vat-orange)] text-sm">

                ⚙️

              </span>

              <span>خيارات حساب الضريبة</span>

            </h2>



            {/\* Mode Switcher Tabs \*/}

            <div className="mb-6">

              <label className="mb-2 block text-xs font-bold text-[var(--vat-text-2)]">

                طريقة الحساب المطلوبة:

              </label>

              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[var(--vat-surface-2)] p-1.5 border border-[var(--vat-border)]">

                <button

                  type="button"

                  onClick={() => setCalcMode("add")}

                  className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-3 text-xs font-bold transition ${

                    calcMode === "add"

                      ? "vat-selected"

                      : "text-[var(--vat-text-2)] hover:text-[var(--vat-text)]"

                  }`}

                >

                  <span className="text-sm">إضافة الضريبة</span>

                  <span className="text-[10px] font-normal text-[var(--vat-muted)]">

                    (السعر الأصلي غير شامل)

                  </span>

                </button>

                <button

                  type="button"

                  onClick={() => setCalcMode("extract")}

                  className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-3 text-xs font-bold transition ${

                    calcMode === "extract"

                      ? "vat-selected"

                      : "text-[var(--vat-text-2)] hover:text-[var(--vat-text)]"

                  }`}

                >

                  <span className="text-sm">استخراج الضريبة</span>

                  <span className="text-[10px] font-normal text-[var(--vat-muted)]">

                    (السعر النهائي شامل)

                  </span>

                </button>

              </div>

            </div>



            {/\* Amount Input \*/}

            <div className="mb-5">

              <label className="mb-1.5 block text-xs font-bold text-[var(--vat-text-2)]">

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

                  className="vat-input w-full rounded-2xl px-4 py-3 text-lg font-bold"

                />

                <span className="absolute left-4 top-3.5 text-xs font-bold text-[var(--vat-muted)]">

                  {currency}

                </span>

              </div>

            </div>



            {/\* VAT Rate setting \*/}

            <div className="mb-5">

              <div className="mb-1.5 flex items-center justify-between">

                <label className="text-xs font-bold text-[var(--vat-text-2)]">

                  نسبة الضريبة المطبقة (%)

                </label>

                {isCustomRate && (

                  <span className="text-[11px] font-semibold text-[var(--vat-orange)]">

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

                    className="vat-input w-full rounded-xl px-3 py-2 text-sm font-bold"

                  />

                  <span className="absolute left-3 top-2.5 text-xs font-bold text-[var(--vat-muted)]">

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

                          ? "vat-selected"

                          : "vat-secondary"

                      }`}

                    >

                      {rate}%

                    </button>

                  ))}

                </div>

              )}

            </div>



            {/\* Quick Currency selector \*/}

            <div>

              <label className="mb-1.5 block text-xs font-bold text-[var(--vat-text-2)]">

                العملة المعروضة

              </label>

              <select

                value={currency}

                onChange={(e) => setCurrency(e.target.value)}

                className="vat-input w-full rounded-xl px-3 py-2 text-xs font-semibold"

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



        {/\* Right Output Card (6 cols) \*/}

        <div className="space-y-6 lg:col-span-6">

          <div className="vat-card rounded-3xl p-6 sm:p-8">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <span className="vat-result-chip inline-block rounded-full px-3 py-1 text-xs font-black">

                  النتيجة الحسابية

                </span>

                <h2 className="mt-1 text-2xl font-black text-[var(--vat-ink-text)]">

                  تفاصيل الفاتورة الضريبية

                </h2>

              </div>

              <button

                type="button"

                onClick={handleCopy}

                className="rounded-xl border border-[var(--vat-border)] bg-transparent px-3.5 py-1.5 text-xs font-bold text-[var(--vat-ink-text)] transition hover:border-[var(--vat-orange)]"

              >

                <span>{copied ? "✓ تم النسخ!" : "نسخ الفاتورة"}</span>

              </button>

            </div>



            {/\* Large Highlight Box: Total Amount \*/}

            <div className="mb-6 rounded-2xl border border-[var(--vat-border)] bg-gradient-to-br from-brand-surface via-white to-brand-light/30 p-5 text-center">

              <p className="text-xs font-bold text-[var(--vat-muted)]">

                المبلغ النهائي المستحق (شامل الضريبة)

              </p>

              <p className="mt-1 text-3xl font-black text-[var(--vat-ink-text)] sm:text-4xl">

                {formatCurrency(result.totalAmount, currency)}

              </p>

              <p className="mt-1 text-xs font-semibold text-[var(--vat-orange)]">

                نسبة الضريبة المطبقة: {result.rate}%

              </p>

            </div>



            {/\* Breakdown Invoice Mockup \*/}

            <div className="space-y-3 rounded-2xl border border-[var(--vat-border)] bg-[color-mix(in_srgb,var(--vat-ink-text)_6%,transparent)] p-4 font-mono text-xs">

              <div className="flex items-center justify-between border-b border-[var(--vat-border)]/60 pb-2">

                <span className="font-sans font-bold text-[var(--vat-text-2)]">

                  المبلغ قبل الضريبة (الأساسي):

                </span>

                <span className="font-bold text-[var(--vat-text)] text-sm">

                  {formatCurrency(result.baseAmount, currency)}

                </span>

              </div>



              <div className="flex items-center justify-between border-b border-[var(--vat-border)]/60 pb-2">

                <span className="font-sans font-bold text-[var(--vat-text-2)] flex items-center gap-1">

                  <span>مبلغ الضريبة ({result.rate}%):</span>

                </span>

                <span className="font-bold text-rose-600 text-sm">

                  +{formatCurrency(result.vatAmount, currency)}

                </span>

              </div>



              <div className="flex items-center justify-between pt-1">

                <span className="font-sans font-extrabold text-[var(--vat-text)]">

                  الإجمالي الكلي شامل الضريبة:

                </span>

                <span className="font-black text-[var(--vat-orange)] text-base">

                  {formatCurrency(result.totalAmount, currency)}

                </span>

              </div>

            </div>



            {/\* Visual breakdown bar \*/}

            <div className="mt-6">

              <div className="mb-2 flex items-center justify-between text-xs font-bold text-[var(--vat-muted)]">

                <span>نسبة أصل المبلغ: {((result.baseAmount / (result.totalAmount || 1)) \* 100).toFixed(1)}%</span>

                <span>نسبة الضريبة: {((result.vatAmount / (result.totalAmount || 1)) \* 100).toFixed(1)}%</span>

              </div>

              <div className="vat-bar flex h-3.5 w-full overflow-hidden rounded-full">

                <div

                  style={{

                    width: `${Math.max(5, (result.baseAmount / (result.totalAmount || 1)) \* 100)}%`,

                  }}

                  className="vat-bar-base transition-all duration-300"

                  title="المبلغ الأصلي"

                />

                <div

                  style={{

                    width: `${Math.max(2, (result.vatAmount / (result.totalAmount || 1)) \* 100)}%`,

                  }}

                  className="vat-bar-tax transition-all duration-300"

                  title="الضريبة"

                />

              </div>

              <div className="mt-2 flex items-center justify-center gap-6 text-[11px] font-bold">

                <div className="flex items-center gap-1.5">

                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--vat-ink-text)]" />

                  <span className="text-[var(--vat-text-2)]">أصل المبلغ</span>

                </div>

                <div className="flex items-center gap-1.5">

                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--vat-orange)]" />

                  <span className="text-[var(--vat-text-2)]">قيمة الضريبة</span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}
