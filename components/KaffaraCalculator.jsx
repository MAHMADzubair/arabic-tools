"use client";

import { useState, useMemo } from "react";

// Types of Kaffarah and Fidya
const kaffaraTypes = [
  {
    id: "fasting_fidya",
    title: "فدية الصيام (عجز دائم أو مرض)",
    icon: "🌙",
    shortDesc: "إطعام مسكين واحد عن كل يوم أفطره المريض المزمن أو الشيخ الكبير.",
    ruleType: "taam_per_day", // 1 مسكين لكل يوم
    personsPerUnit: 1,
    unitLabel: "عدد أيام الإفطار",
    defaultUnits: 30,
    rulingNote: "تجب على من عجز عن الصيام عجزاً كلياً مستمراً لكبر سن أو مرض لا يُرجى برؤه.",
    fastingAlternative: null, // لا صيام عليه لأنه عاجز أصلاً
  },
  {
    id: "yameen_kaffara",
    title: "كفارة اليمين المنعقدة",
    icon: "✋",
    shortDesc: "إطعام 10 مساكين أو كسوتهم، ومن عجز صام 3 أيام.",
    ruleType: "fixed_persons",
    personsPerUnit: 10,
    unitLabel: "عدد الأيمان المنكوث بها",
    defaultUnits: 1,
    rulingNote: "كفارة مخيرة: إطعام 10 مساكين أو كسوتهم، فإن عجز تماماً صام 3 أيام.",
    fastingAlternative: "صيام 3 أيام عند العجز المالي التام",
  },
  {
    id: "nadhr_kaffara",
    title: "كفارة النذر المعلق",
    icon: "📜",
    shortDesc: "إطعام 10 مساكين (حكمها ككفارة اليمين تماماً).",
    ruleType: "fixed_persons",
    personsPerUnit: 10,
    unitLabel: "عدد النذور التي لم تفِ بها",
    defaultUnits: 1,
    rulingNote: "قال رسول الله ﷺ: 'كفارة النذر كفارة يمين'.",
    fastingAlternative: "صيام 3 أيام عند العجز المالي التام",
  },
  {
    id: "ramadan_major",
    title: "كفارة الجماع في نهار رمضان",
    icon: "⚠️",
    shortDesc: "كفارة مغلظة مرتبة: صيام شهرين متتابعين، فإن عجز فإطعام 60 مسكيناً.",
    ruleType: "fixed_persons",
    personsPerUnit: 60,
    unitLabel: "عدد الأيام المنتهكة",
    defaultUnits: 1,
    rulingNote: "كفارة مرتبة شرعاً: عتق رقبة، فإن لم يجد فصيام شهرين متتابعين (60 يوماً)، فإن عجز فإطعام 60 مسكيناً.",
    fastingAlternative: "صيام شهرين متتابعين (60 يوماً) وهو الأصل قبل الإطعام",
  },
  {
    id: "ihram_fidyah",
    title: "فدية محظورات الإحرام (الأذى)",
    icon: "🕋",
    shortDesc: "إطعام 6 مساكين، أو صيام 3 أيام، أو ذبح شاة (فدية من صيام أو صدقة أو نسك).",
    ruleType: "fixed_persons",
    personsPerUnit: 6,
    unitLabel: "عدد المحظورات المرتكبة",
    defaultUnits: 1,
    rulingNote: "تجب عند ارتكاب محظور من محظورات الإحرام لعذر (كحلق الرأس أو التطيب أو لبس المخيط). وهي على التخيير.",
    fastingAlternative: "صيام 3 أيام أو ذبح شاة بالحرم",
  },
];

// Average cost of feeding 1 poor person per day by country (وجبة إطعام مسكين)
const countryMealPresets = [
  { code: "KSA", country: "السعودية", flag: "🇸🇦", cost: 15, currency: "SAR", note: "وجبة مشبعة أو نصف صاع أرز (10 - 20 ر.س)" },
  { code: "UAE", country: "الإمارات", flag: "🇦🇪", cost: 15, currency: "AED", note: "قيمة وجبة الإطعام المعتمدة (15 د.إ)" },
  { code: "EGY", country: "مصر", flag: "🇪🇬", cost: 35, currency: "EGP", note: "الحد الأدنى المعلن من دار الإفتاء المصرية" },
  { code: "QAR", country: "قطر", flag: "🇶🇦", cost: 15, currency: "QAR", note: "إدارة صندوق الزكاة القطرية" },
  { code: "KWD", country: "الكويت", flag: "🇰🇼", cost: 1.5, currency: "KWD", note: "بيت الزكاة الكويتي (دينار ونصف)" },
  { code: "JOR", country: "الأردن", flag: "🇯🇴", cost: 1.5, currency: "JOD", note: "دائرة الإفتاء العام الأردنية" },
  { code: "OMN", country: "عمان", flag: "🇴🇲", cost: 1.5, currency: "OMR", note: "وزارة الأوقاف والشؤون الدينية" },
  { code: "GLOBAL", country: "أوروبا / أمريكا", flag: "🌍", cost: 10, currency: "USD", note: "المراكز الإسلامية في الخارج (10$ للوجبة)" },
];

function formatNumber(n, decimals = 1) {
  return n.toLocaleString("ar-SA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function KaffaraCalculator() {
  // Active type
  const [selectedTypeId, setSelectedTypeId] = useState("fasting_fidya");

  // Units count (number of days, oaths, etc.)
  const [unitsCount, setUnitsCount] = useState(30);

  // Calculation mode: 'cash' (نقداً بالقيمة) or 'food' (عيناً بالأرز/الحبوب)
  const [calcMode, setCalcMode] = useState("cash");

  // Country & Cash rate
  const [selectedCountryCode, setSelectedCountryCode] = useState("KSA");
  const [mealCost, setMealCost] = useState(15);
  const [currency, setCurrency] = useState("SAR");
  const [isCustomMealCost, setIsCustomMealCost] = useState(false);
  const [customCostInput, setCustomCostInput] = useState("15");

  // Staple Food settings: 1 person gets 1/2 Sa'a (نصف صاع) = ~1.35 kg rice
  const kgRicePerPerson = 1.35; // نصف صاع أرز

  // Copy state
  const [copied, setCopied] = useState(false);

  // Selected type object
  const activeType = kaffaraTypes.find((t) => t.id === selectedTypeId) || kaffaraTypes[0];

  // Selected country object
  const activeCountry = countryMealPresets.find((c) => c.code === selectedCountryCode) || countryMealPresets[0];

  // Handle type change
  const handleTypeSelect = (type) => {
    setSelectedTypeId(type.id);
    setUnitsCount(type.defaultUnits);
  };

  // Handle country change
  const handleCountrySelect = (c) => {
    setSelectedCountryCode(c.code);
    setIsCustomMealCost(false);
    setMealCost(c.cost);
    setCustomCostInput(c.cost.toString());
    setCurrency(c.currency);
  };

  // Calculations
  const result = useMemo(() => {
    const units = Math.max(1, parseInt(unitsCount) || 1);
    const totalPersonsToFeed = units * activeType.personsPerUnit;

    // Food in KG (Half Sa'a per person)
    const totalFoodKg = totalPersonsToFeed * kgRicePerPerson;
    const totalSaFood = totalPersonsToFeed * 0.5; // نصف صاع لكل مسكين

    // Cash calculation
    const currentRate = isCustomMealCost ? (parseFloat(customCostInput) || 0) : mealCost;
    const totalCash = totalPersonsToFeed * currentRate;

    return {
      units,
      totalPersonsToFeed,
      totalFoodKg,
      totalSaFood,
      currentRate,
      totalCash,
    };
  }, [unitsCount, activeType, kgRicePerPerson, isCustomMealCost, customCostInput, mealCost]);

  // Copy summary
  const handleCopy = () => {
    let text = `📜 تقرير حساب ${activeType.title}\n`;
    text += `------------------------------------\n`;
    text += `النوع: ${activeType.title}\n`;
    text += `${activeType.unitLabel}: ${result.units}\n`;
    text += `عدد المساكين الواجب إطعامهم: ${result.totalPersonsToFeed} مساكين\n\n`;

    if (calcMode === "food") {
      text += `الإخراج عيناً طعاماً (أرز):\n`;
      text += `المقدار لكل مسكين: نصف صاع (≈ ${kgRicePerPerson} كجم أرز)\n`;
      text += `إجمالي الأرز المطلوب: ${formatNumber(result.totalFoodKg)} كجم (${formatNumber(result.totalSaFood, 1)} صاع نبوي)\n`;
    } else {
      text += `الإخراج نقداً بالقيمة:\n`;
      text += `تكلفة إطعام المسكين: ${result.currentRate} ${currency}\n`;
      text += `إجمالي المبلغ المستحق نقداً: ${formatNumber(result.totalCash, 2)} ${currency}\n`;
    }

    if (activeType.fastingAlternative) {
      text += `\nالبديل عند العجز المالي: ${activeType.fastingAlternative}\n`;
    }

    text += `\nالحكم والضابط الشرعي: ${activeType.rulingNote}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 text-center sm:mb-12">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-sm font-bold text-brand-dark">
          <span>⚖️</span>
          <span>حساب الفدية والكفارات الشرعية</span>
        </div>
        <h1 className="mb-3 text-3xl font-extrabold text-ink sm:text-5xl">
          حاسبة الكفارات والفدية الشرعية
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
          احسب مقدار كفارة اليمين، فدية صيام رمضان للعاجز والمريض، كفارة النذر، وفدية محظورات الإحرام،
          سواء عيناً بالأرز والطعام (بالكيلوجرام) أو نقداً بالريال والعملات العربية.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Inputs (6 cols) */}
        <div className="space-y-6 lg:col-span-6">
          {/* Card 1: Select Type */}
          <div className="rounded-3xl border border-brand-border bg-white p-5 shadow-card sm:p-6 space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink sm:text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-brand text-sm">
                📌
              </span>
              <span>اختر نوع الكفارة أو الفدية</span>
            </h2>

            <div className="space-y-2">
              {kaffaraTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeSelect(type)}
                  className={`w-full text-right p-3 rounded-2xl border transition ${
                    selectedTypeId === type.id
                      ? "border-brand bg-brand-light/60 text-brand-dark ring-2 ring-brand/20 shadow-sm"
                      : "border-brand-border bg-white text-ink hover:bg-brand-surface"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <span>{type.icon}</span>
                      <span>{type.title}</span>
                    </div>
                    <span className="rounded-lg bg-white px-2 py-0.5 text-[11px] font-extrabold text-brand shadow-sm">
                      {type.personsPerUnit === 1
                        ? "مسكين/يوم"
                        : `${type.personsPerUnit} مساكين`}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                    {type.shortDesc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Units Count & Cash/Food Mode */}
          <div className="rounded-3xl border border-brand-border bg-white p-5 shadow-card sm:p-6 space-y-4">
            {/* Units Input */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-secondary">
                {activeType.unitLabel}:
              </label>
              <div className="flex items-center rounded-xl border border-brand-border bg-brand-surface p-1">
                <button
                  type="button"
                  onClick={() => setUnitsCount((u) => Math.max(1, u - 1))}
                  className="px-3.5 py-2 text-lg font-bold text-ink hover:text-brand"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={unitsCount}
                  onChange={(e) => setUnitsCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-transparent text-center text-base font-black text-ink focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setUnitsCount((u) => u + 1)}
                  className="px-3.5 py-2 text-lg font-bold text-ink hover:text-brand"
                >
                  +
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-secondary">
                طريقة إخراج الإطعام:
              </label>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-brand-surface p-1.5 border border-brand-border">
                <button
                  type="button"
                  onClick={() => setCalcMode("cash")}
                  className={`flex flex-col items-center justify-center rounded-xl py-2 px-3 text-xs font-bold transition ${
                    calcMode === "cash"
                      ? "bg-white text-brand shadow-sm"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  <span>💵 نقداً بالقيمة</span>
                  <span className="text-[10px] font-normal text-ink-muted">(تكلفة وجبة مسكين)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode("food")}
                  className={`flex flex-col items-center justify-center rounded-xl py-2 px-3 text-xs font-bold transition ${
                    calcMode === "food"
                      ? "bg-white text-brand shadow-sm"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  <span>🌾 طعاماً عيناً</span>
                  <span className="text-[10px] font-normal text-ink-muted">(أرز بالكيلوجرام)</span>
                </button>
              </div>
            </div>

            {/* Cash Options if cash mode */}
            {calcMode === "cash" && (
              <div className="space-y-3 border-t border-brand-border/60 pt-3">
                <label className="block text-xs font-bold text-ink-secondary">
                  متوسط تكلفة وجبة المسكين حسب الدولة:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {countryMealPresets.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleCountrySelect(c)}
                      className={`p-1.5 rounded-xl border text-xs font-bold transition ${
                        selectedCountryCode === c.code && !isCustomMealCost
                          ? "border-brand bg-brand text-white shadow-sm ring-2 ring-brand/20"
                          : "border-brand-border bg-white text-ink hover:bg-brand-surface"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{c.flag}</span>
                        <span className="truncate">{c.country}</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 ${selectedCountryCode === c.code && !isCustomMealCost ? "text-accent" : "text-brand"}`}>
                        {c.cost} {c.currency}
                      </p>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-ink-secondary">
                      قيمة الوجبة الواحدة ({currency}):
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomMealCost(!isCustomMealCost)}
                      className="text-[11px] font-bold text-brand hover:underline"
                    >
                      {isCustomMealCost ? "استعادة التلقائي" : "تعديل يدوي"}
                    </button>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={isCustomMealCost ? customCostInput : mealCost}
                    onChange={(e) => {
                      setIsCustomMealCost(true);
                      setCustomCostInput(e.target.value);
                    }}
                    className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm font-bold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                  <p className="mt-1 text-[11px] text-ink-muted">
                    {activeCountry.note}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Output Card (6 cols) */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-card sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="inline-block rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand-dark">
                  النتيجة الواجبة شرعاً
                </span>
                <h2 className="mt-1 text-2xl font-black text-ink">
                  إجمالي المقدار المطلوب
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
                {calcMode === "cash"
                  ? `المبلغ المطلوب نقداً لإطعام ${result.totalPersonsToFeed} مساكين`
                  : `إجمالي الأرز والحبوب المطلوبة لإطعام ${result.totalPersonsToFeed} مساكين`}
              </p>

              <p className="mt-2 text-3xl font-black text-brand-dark sm:text-4xl">
                {calcMode === "cash"
                  ? `${formatNumber(result.totalCash, 2)} ${currency}`
                  : `${formatNumber(result.totalFoodKg)} كيلوجرام`}
              </p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
                <span>🍽️ المستحقون:</span>
                <span>إطعام {result.totalPersonsToFeed} مسكيناً ({result.units} × {activeType.personsPerUnit})</span>
              </div>
            </div>

            {/* Breakdown details */}
            <div className="space-y-3 rounded-2xl border border-brand-border bg-brand-surface/40 p-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                <span className="font-sans font-bold text-ink-secondary">
                  النوع المحدد:
                </span>
                <span className="font-bold text-ink text-sm">
                  {activeType.title}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                <span className="font-sans font-bold text-ink-secondary">
                  المقدار الواجب لكل مسكين:
                </span>
                <span className="font-bold text-brand text-sm">
                  {calcMode === "cash"
                    ? `وجبة مشبعة (${result.currentRate} ${currency})`
                    : `نصف صاع (≈ 1.35 كجم أرز)`}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                <span className="font-sans font-bold text-ink-secondary">
                  إجمالي الحبوب بالأصوع النبوية:
                </span>
                <span className="font-bold text-ink text-sm">
                  {formatNumber(result.totalSaFood, 1)} صاع نبوي (نصف صاع × {result.totalPersonsToFeed})
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-sans font-extrabold text-ink">
                  إجمالي المطلوب إخراجه:
                </span>
                <span className="font-black text-brand text-base">
                  {calcMode === "cash"
                    ? `${formatNumber(result.totalCash, 2)} ${currency}`
                    : `${formatNumber(result.totalFoodKg)} كجم أرز`}
                </span>
              </div>
            </div>

            {/* Alternative for inability (صيام الأيام عند العجز) */}
            {activeType.fastingAlternative && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-900">
                <h4 className="font-extrabold mb-1 flex items-center gap-1.5 text-amber-950">
                  <span>⚠️</span>
                  <span>حكم العجز المالي التام:</span>
                </h4>
                <p>
                  {activeType.fastingAlternative}
                </p>
                <p className="mt-1 text-[11px] text-amber-800/90 font-medium">
                  ملاحظة: لا يُنتقل إلى الصيام في كفارة اليمين إلا عند العجز المالي الحقيقي عن إطعام أو كسوة 10 مساكين.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
