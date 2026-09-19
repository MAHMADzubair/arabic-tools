"use client";

import { useState, useMemo } from "react";

// Official approximate cash value recommendations by fatwa authorities per person
const countryCashRates = [
  { code: "KSA", country: "السعودية", flag: "🇸🇦", value: 25, currency: "SAR", note: "متوسط قيمة صاع الأرز الجيد (20 - 30 ر.س)" },
  { code: "UAE", country: "الإمارات", flag: "🇦🇪", value: 25, currency: "AED", note: "المعتمد رسمياً لدى الهيئة العامة للشؤون الإسلامية" },
  { code: "EGY", country: "مصر", flag: "🇪🇬", value: 35, currency: "EGP", note: "الحد الأدنى المعلن من دار الإفتاء المصرية" },
  { code: "QAR", country: "قطر", flag: "🇶🇦", value: 20, currency: "QAR", note: "إدارة صندوق الزكاة القطرية" },
  { code: "KWD", country: "الكويت", flag: "🇰🇼", value: 2.5, currency: "KWD", note: "بيت الزكاة الكويتي (ديناران ونصف)" },
  { code: "JOR", country: "الأردن", flag: "🇯🇴", value: 2.0, currency: "JOD", note: "دائرة الإفتاء العام الأردنية" },
  { code: "OMN", country: "عمان", flag: "🇴🇲", value: 2.5, currency: "OMR", note: "وزارة الأوقاف والشؤون الدينية" },
  { code: "GLOBAL", country: "أوروبا / أمريكا", flag: "🌍", value: 12, currency: "USD", note: "المجالس الإسلامية في المهجر (10 - 15 دولار)" },
];

// Average weight of 1 Prophetic Sa'a (صاع نبوي) by staple food type
const stapleFoodTypes = [
  { id: "rice", name: "أرز (قوت أهل الخليج الأغلب)", saWeightKg: 2.7, note: "الصاع يعادل 2.5 إلى 3 كجم من الأرز حسب الحبة" },
  { id: "wheat", name: "قمح / دقيق (بر)", saWeightKg: 2.4, note: "الصاع يعادل 2.25 إلى 2.5 كجم من الحنطة" },
  { id: "dates", name: "تمر", saWeightKg: 2.2, note: "الصاع يعادل 2.0 إلى 2.4 كجم من التمر الجاف" },
  { id: "raisins", name: "زبيب", saWeightKg: 2.1, note: "الصاع يعادل 2.0 إلى 2.3 كجم من الزبيب" },
  { id: "barley", name: "شعير", saWeightKg: 2.2, note: "الصاع يعادل 2.0 إلى 2.2 كجم" },
];

function formatNumber(n, decimals = 1) {
  return n.toLocaleString("ar-SA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function ZakatFitrCalculator() {
  // Mode: 'cash' (نقداً بالقيمة) or 'food' (عيناً بالأصناف والكيلوجرامات)
  const [outputMode, setOutputMode] = useState("cash");

  // Family Members Breakdown
  const [selfIncluded, setSelfIncluded] = useState(true);
  const [wivesCount, setWivesCount] = useState(1);
  const [sonsCount, setSonsCount] = useState(2);
  const [daughtersCount, setDaughtersCount] = useState(1);
  const [parentsCount, setParentsCount] = useState(0);
  const [workersCount, setWorkersCount] = useState(0);
  const [unbornCount, setUnbornCount] = useState(0); // الجنين في البطن (مستحبة)

  // Cash calculation settings
  const [selectedCountryCode, setSelectedCountryCode] = useState("KSA");
  const [cashRatePerPerson, setCashRatePerPerson] = useState(25);
  const [currency, setCurrency] = useState("SAR");
  const [isCustomCashRate, setIsCustomCashRate] = useState(false);
  const [customCashInput, setCustomCashInput] = useState("25");

  // Food calculation settings
  const [selectedFoodId, setSelectedFoodId] = useState("rice");

  // Copy feedback
  const [copied, setCopied] = useState(false);

  // Active food item
  const activeFood = stapleFoodTypes.find((f) => f.id === selectedFoodId) || stapleFoodTypes[0];

  // Active country preset
  const activeCountry = countryCashRates.find((c) => c.code === selectedCountryCode) || countryCashRates[0];

  // Handle country preset change
  const handleCountryChange = (country) => {
    setSelectedCountryCode(country.code);
    setIsCustomCashRate(false);
    setCashRatePerPerson(country.value);
    setCustomCashInput(country.value.toString());
    setCurrency(country.currency);
  };

  // Calculations
  const calculation = useMemo(() => {
    const obligIndividuals =
      (selfIncluded ? 1 : 0) +
      Math.max(0, wivesCount) +
      Math.max(0, sonsCount) +
      Math.max(0, daughtersCount) +
      Math.max(0, parentsCount) +
      Math.max(0, workersCount);

    const voluntaryIndividuals = Math.max(0, unbornCount); // الجنين
    const totalIndividuals = obligIndividuals + voluntaryIndividuals;

    // Total Sa'a
    const totalSaObligatory = obligIndividuals * 1;
    const totalSaWithVoluntary = totalIndividuals * 1;

    // Total KG of staple food
    const kgPerPerson = activeFood.saWeightKg;
    const totalKgObligatory = obligIndividuals * kgPerPerson;
    const totalKgWithVoluntary = totalIndividuals * kgPerPerson;

    // Cash calculations
    const rate = isCustomCashRate ? (parseFloat(customCashInput) || 0) : cashRatePerPerson;
    const totalCashObligatory = obligIndividuals * rate;
    const totalCashWithVoluntary = totalIndividuals * rate;

    return {
      obligIndividuals,
      voluntaryIndividuals,
      totalIndividuals,
      kgPerPerson,
      totalSaObligatory,
      totalSaWithVoluntary,
      totalKgObligatory,
      totalKgWithVoluntary,
      rate,
      totalCashObligatory,
      totalCashWithVoluntary,
    };
  }, [
    selfIncluded,
    wivesCount,
    sonsCount,
    daughtersCount,
    parentsCount,
    workersCount,
    unbornCount,
    activeFood,
    cashRatePerPerson,
    isCustomCashRate,
    customCashInput,
  ]);

  // Copy details
  const handleCopy = () => {
    let text = `🌙 تقرير حساب زكاة الفطر المباركة\n`;
    text += `------------------------------------\n`;
    text += `عدد الأفراد الواجب إخراجها عنهم: ${calculation.obligIndividuals} أفراد\n`;
    if (calculation.voluntaryIndividuals > 0) {
      text += `الأجنة في البطن (مستحبة): ${calculation.voluntaryIndividuals}\n`;
    }
    text += `إجمالي عدد المستحقين: ${calculation.totalIndividuals} صاع\n\n`;

    if (outputMode === "food") {
      text += `الصنف المختار: ${activeFood.name}\n`;
      text += `وزن الصاع للشخص: ~${calculation.kgPerPerson} كجم\n`;
      text += `إجمالي الكمية المطلوبة: ${formatNumber(calculation.totalKgObligatory)} كجم عيناً طعاماً`;
      if (calculation.voluntaryIndividuals > 0) {
        text += ` (أو ${formatNumber(calculation.totalKgWithVoluntary)} كجم مع الجنين)`;
      }
    } else {
      text += `قيمة الصاع للشخص: ${calculation.rate} ${currency}\n`;
      text += `إجمالي الزكاة الواجبة نقداً: ${formatNumber(calculation.totalCashObligatory, 2)} ${currency}`;
      if (calculation.voluntaryIndividuals > 0) {
        text += ` (أو ${formatNumber(calculation.totalCashWithVoluntary, 2)} ${currency} مع الجنين)`;
      }
    }

    text += `\n------------------------------------\n`;
    text += `الوقت الشرعي: تُخرج قبل صلاة العيد، ويجوز إخراجها قبل العيد بيوم أو يومين.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 text-center sm:mb-12">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-sm font-bold text-brand-dark">
          <span>🌾</span>
          <span>طهور للصائم وطعمة للمساكين</span>
        </div>
        <h1 className="mb-3 text-3xl font-extrabold text-ink sm:text-5xl">
          حاسبة زكاة الفطر المباركة
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
          احسب زكاة الفطر بدقة عنك وعن جميع أفراد أسرتك، سواء عيناً بالطعام والأرز (بالصاع والكيلوجرام)
          أو نقداً بالقيمة المعتمدة في الفتوى الرسمية لكل دولة.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Inputs (6 cols) */}
        <div className="space-y-6 lg:col-span-6">
          {/* Output Mode Switcher */}
          <div className="rounded-3xl border border-brand-border bg-white p-5 shadow-card sm:p-6">
            <label className="mb-2 block text-xs font-bold text-ink-secondary">
              كيف تفضل إخراج زكاة الفطر؟
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-brand-surface p-1.5 border border-brand-border">
              <button
                type="button"
                onClick={() => setOutputMode("cash")}
                className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-3 text-xs font-bold transition ${
                  outputMode === "cash"
                    ? "bg-white text-brand shadow-sm"
                    : "text-ink-secondary hover:text-ink"
                }`}
              >
                <span className="text-sm">💵 نقداً بالقيمة المالية</span>
                <span className="text-[10px] font-normal text-ink-muted">
                  (مذهب الحنفية ودور الإفتاء المعاصرة)
                </span>
              </button>
              <button
                type="button"
                onClick={() => setOutputMode("food")}
                className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-3 text-xs font-bold transition ${
                  outputMode === "food"
                    ? "bg-white text-brand shadow-sm"
                    : "text-ink-secondary hover:text-ink"
                }`}
              >
                <span className="text-sm">🌾 طعاماً عيناً (حبوب وأرز)</span>
                <span className="text-[10px] font-normal text-ink-muted">
                  (مذهب الجمهور وفتوى السعودية)
                </span>
              </button>
            </div>

            {/* Mode-specific settings */}
            {outputMode === "cash" ? (
              <div className="mt-5 space-y-4 border-t border-brand-border/60 pt-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink-secondary">
                    اختر الدولة أو الفتوى المعتمدة لقيمة الصاع:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {countryCashRates.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleCountryChange(c)}
                        className={`flex items-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition text-right ${
                          selectedCountryCode === c.code && !isCustomCashRate
                            ? "border-brand bg-brand text-white shadow-sm ring-2 ring-brand/20"
                            : "border-brand-border bg-white text-ink hover:bg-brand-surface"
                        }`}
                      >
                        <span className="text-base">{c.flag}</span>
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate">{c.country}</p>
                          <p className={`text-[10px] ${selectedCountryCode === c.code && !isCustomCashRate ? "text-accent" : "text-brand"}`}>
                            {c.value} {c.currency}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Cash rate input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-ink-secondary">
                      قيمة الفرد الواحد ({currency}):
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCashRate(!isCustomCashRate)}
                      className="text-[11px] font-bold text-brand hover:underline"
                    >
                      {isCustomCashRate ? "استعادة القيم المعتمدة" : "تعديل القيمة يدوياً"}
                    </button>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={isCustomCashRate ? customCashInput : cashRatePerPerson}
                    onChange={(e) => {
                      setIsCustomCashRate(true);
                      setCustomCashInput(e.target.value);
                    }}
                    className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm font-bold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                  <p className="mt-1 text-[11px] text-ink-muted">
                    {activeCountry.note}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-3 border-t border-brand-border/60 pt-4">
                <label className="block text-xs font-bold text-ink-secondary">
                  اختر نوع طعام القوت لإخراج الصاع عيناً:
                </label>
                <div className="space-y-2">
                  {stapleFoodTypes.map((food) => (
                    <label
                      key={food.id}
                      className={`flex items-center justify-between rounded-xl border p-3 text-xs font-bold cursor-pointer transition ${
                        selectedFoodId === food.id
                          ? "border-brand bg-brand-light/60 text-brand-dark ring-2 ring-brand/20"
                          : "border-brand-border bg-white text-ink hover:bg-brand-surface"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="foodType"
                          checked={selectedFoodId === food.id}
                          onChange={() => setSelectedFoodId(food.id)}
                          className="h-4 w-4 text-brand focus:ring-brand"
                        />
                        <span>{food.name}</span>
                      </div>
                      <span className="rounded-lg bg-white px-2 py-0.5 text-xs text-brand font-black shadow-sm">
                        الصاع ≈ {food.saWeightKg} كجم
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Family Members Count Card */}
          <div className="rounded-3xl border border-brand-border bg-white p-5 shadow-card sm:p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink sm:text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand text-sm">
                👨‍👩‍👧‍👦
              </span>
              <span>تحديد أفراد الأسرة والمُعالين</span>
            </h2>

            <p className="text-xs text-ink-muted leading-relaxed">
              تجب زكاة الفطر على المسلم عن نفسه وعمن تلزمه نفقته الشرعية وقت غروب شمس ليلة العيد.
            </p>

            {/* Self checkbox */}
            <label className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-surface/50 p-3 text-xs font-bold text-ink cursor-pointer hover:bg-white">
              <span className="flex items-center gap-2">
                <span>👤</span>
                <span>صاحب الزكاة (نفسك)</span>
              </span>
              <input
                type="checkbox"
                checked={selfIncluded}
                onChange={(e) => setSelfIncluded(e.target.checked)}
                className="h-4 w-4 rounded text-brand focus:ring-brand"
              />
            </label>

            {/* Wives & Parents */}
            <div className="grid grid-cols-2 gap-3">
              <NumberSelector
                label="الزوجة / الزوجات"
                value={wivesCount}
                onChange={setWivesCount}
                min={0}
                icon="💍"
              />
              <NumberSelector
                label="الوالدان المعالان"
                value={parentsCount}
                onChange={setParentsCount}
                min={0}
                icon="👵"
              />
            </div>

            {/* Sons & Daughters */}
            <div className="grid grid-cols-2 gap-3">
              <NumberSelector
                label="الأبناء (الذكور)"
                value={sonsCount}
                onChange={setSonsCount}
                min={0}
                icon="👦"
              />
              <NumberSelector
                label="البنات (الإناث)"
                value={daughtersCount}
                onChange={setDaughtersCount}
                min={0}
                icon="👧"
              />
            </div>

            {/* Workers / Domestic & Unborn */}
            <div className="grid grid-cols-2 gap-3">
              <NumberSelector
                label="العمالة / المكفولين (تبرعاً)"
                value={workersCount}
                onChange={setWorkersCount}
                min={0}
                icon="🤝"
              />
              <NumberSelector
                label="الجنين في البطن (مستحبة)"
                value={unbornCount}
                onChange={setUnbornCount}
                min={0}
                icon="👶"
              />
            </div>
          </div>
        </div>

        {/* Right Output Card (6 cols) */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-card sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="inline-block rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand-dark">
                  النتيجة الشرعية
                </span>
                <h2 className="mt-1 text-2xl font-black text-ink">
                  إجمالي زكاة الفطر الواجبة
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand transition hover:bg-brand-100"
              >
                <span>{copied ? "✓ تم النسخ!" : "📋 نسخ التقرير"}</span>
              </button>
            </div>

            {/* Main Result Hero Box */}
            <div className="mb-6 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-surface via-white to-brand-light/30 p-6 text-center">
              <p className="text-xs font-bold text-ink-muted">
                {outputMode === "cash" ? "المبلغ الإجمالي الواجب إخراجه نقداً" : `إجمالي وزن الحبوب المطلوبة (${activeFood.name})`}
              </p>

              <p className="mt-2 text-3xl font-black text-brand-dark sm:text-4xl">
                {outputMode === "cash"
                  ? `${formatNumber(calculation.totalCashObligatory, 2)} ${currency}`
                  : `${formatNumber(calculation.totalKgObligatory)} كيلوجرام`}
              </p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
                <span>⚖️ المقدار الشرعي:</span>
                <span>{calculation.totalSaObligatory} صاع نبوي ({calculation.obligIndividuals} أفراد)</span>
              </div>

              {calculation.voluntaryIndividuals > 0 && (
                <p className="mt-3 text-xs font-semibold text-accent">
                  + يشمل إضافة الجنين استحباباً:{" "}
                  {outputMode === "cash"
                    ? `${formatNumber(calculation.totalCashWithVoluntary, 2)} ${currency}`
                    : `${formatNumber(calculation.totalKgWithVoluntary)} كجم (${calculation.totalSaWithVoluntary} صاع)`}
                </p>
              )}
            </div>

            {/* Breakdown List */}
            <div className="space-y-3 rounded-2xl border border-brand-border bg-brand-surface/40 p-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                <span className="font-sans font-bold text-ink-secondary">
                  عدد الأفراد الواجب إخراجها عنهم:
                </span>
                <span className="font-bold text-ink text-sm">
                  {calculation.obligIndividuals} أفراد
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                <span className="font-sans font-bold text-ink-secondary">
                  المقدار الواجب للشخص الواحد:
                </span>
                <span className="font-bold text-brand text-sm">
                  {outputMode === "cash"
                    ? `${calculation.rate} ${currency} (صاع)`
                    : `صاع نبوي (≈ ${calculation.kgPerPerson} كجم ${activeFood.name})`}
                </span>
              </div>

              {calculation.voluntaryIndividuals > 0 && (
                <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                  <span className="font-sans font-bold text-ink-secondary">
                    الأجنة في البطن (مستحبة كفعل عثمان رضي الله عنه):
                  </span>
                  <span className="font-bold text-accent text-sm">
                    {calculation.voluntaryIndividuals} أجنة ({calculation.voluntaryIndividuals} صاع)
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="font-sans font-extrabold text-ink">
                  إجمالي الأصوع النبوية الواجبة:
                </span>
                <span className="font-black text-brand text-base">
                  {calculation.totalSaObligatory} صاع
                </span>
              </div>
            </div>

            {/* Quick Jurisprudence Tip Banner */}
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs leading-relaxed text-emerald-900">
              <h4 className="font-extrabold mb-1 flex items-center gap-1.5 text-emerald-950">
                <span>⏰</span>
                <span>توقيت إخراج زكاة الفطر المشروع:</span>
              </h4>
              <p>
                <strong>أفضل وقت:</strong> صباح يوم العيد قبل الخروج لصلاة العيد.
                <br />
                <strong>وقت الجواز:</strong> يجوز إخراجها قبل العيد بيوم أو يومين (يوم 28 أو 29 رمضان) لتصل إلى الفقراء في وقتها المناسب.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberSelector({ label, value, onChange, min = 0, icon }) {
  return (
    <div className="rounded-xl border border-brand-border bg-white p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-sm">{icon}</span>
        <label className="text-[11px] font-bold text-ink truncate">{label}</label>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-surface">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="px-2.5 py-1 text-sm font-bold text-ink hover:text-brand"
        >
          -
        </button>
        <span className="text-xs font-bold text-ink">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="px-2.5 py-1 text-sm font-bold text-ink hover:text-brand"
        >
          +
        </button>
      </div>
    </div>
  );
}
