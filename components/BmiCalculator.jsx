"use client";

import { useState, useMemo } from "react";

/* ─── WHO BMI Categories ─────────────────────────────────────────────────── */
const BMI_CATEGORIES = [
  { min: 0, max: 18.5, label: "نقص في الوزن (نحافة)", color: "text-amber-500", bg: "bg-amber-500", badgeBg: "bg-amber-100 text-amber-900 border-amber-300", advice: "وزنك أقل من المعدل الطبيعي، يُنصح بزيادة السعرات الصحية وبناء الكتلة العضلية." },
  { min: 18.5, max: 24.9, label: "وزن طبيعي ومثالي", color: "text-emerald-500", bg: "bg-emerald-500", badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300", advice: "تهانينا! وزنك في النطاق الصحي المثالي، حافظ على نمط حياتك المتوازن." },
  { min: 25, max: 29.9, label: "وزن زائد (مرحلة ما قبل السمنة)", color: "text-orange-500", bg: "bg-orange-500", badgeBg: "bg-orange-100 text-orange-900 border-orange-300", advice: "لديك زيادة في الوزن عن المعدل الصحي، يُنصح بزيادة النشاط البدني وتقليل السكريات." },
  { min: 30, max: 34.9, label: "سمنة من الدرجة الأولى", color: "text-rose-500", bg: "bg-rose-500", badgeBg: "bg-rose-100 text-rose-900 border-rose-300", advice: "مرحلة سمنة أولى؛ ينبغي اتباع نظام غذائي محسوب السعرات لتفادي المخاطر الصحية." },
  { min: 35, max: 39.9, label: "سمنة من الدرجة الثانية", color: "text-red-600", bg: "bg-red-600", badgeBg: "bg-red-100 text-red-900 border-red-300", advice: "سمنة متوسطة إلى شديدة؛ يُفضل استشارة أخصائي تغذية وطبيب لتنظيم خطة نزول آمنة." },
  { min: 40, max: 100, label: "سمنة مفرطة خطيرة (درجة ثالثة)", color: "text-purple-600", bg: "bg-purple-600", badgeBg: "bg-purple-100 text-purple-900 border-purple-300", advice: "سمنة مفرطة تتطلب تدخلاً طبياً عاجلاً لتفادي أمراض القلب والسكري وارتفاع الضغط." },
];

const ACTIVITY_LEVELS = [
  { id: 1.2, label: "خامل / قليل الحركة", desc: "عمل مكتبي بدون تمارين رياضية" },
  { id: 1.375, label: "نشاط خفيف", desc: "تمارين خفيفة 1-3 أيام أسبوعياً" },
  { id: 1.55, label: "نشاط متوسط", desc: "تمارين متوسطة 3-5 أيام أسبوعياً" },
  { id: 1.725, label: "نشاط عالي", desc: "تمارين شاقة 6-7 أيام أسبوعياً" },
  { id: 1.9, label: "رياضي محترف", desc: "تدريبات بدنية مكثفة مرتين يومياً" },
];

const PRESETS = [
  { label: "رجل 175 سم / 72 كجم (مثالي)", gender: "male", height: 175, weight: 72, age: 30, activity: 1.375 },
  { label: "امرأة 162 سم / 56 كجم (مثالي)", gender: "female", height: 162, weight: 56, age: 28, activity: 1.375 },
  { label: "شاب 170 سم / 52 كجم (نحافة)", gender: "male", height: 170, weight: 52, age: 22, activity: 1.2 },
  { label: "رجل 178 سم / 96 كجم (سمنة)", gender: "male", height: 178, weight: 96, age: 38, activity: 1.2 },
];

export default function BmiCalculator() {
  const [gender, setGender] = useState("male"); // "male" | "female"
  const [height, setHeight] = useState(175); // cm
  const [weight, setWeight] = useState(75); // kg
  const [age, setAge] = useState(30); // years
  const [activity, setActivity] = useState(1.375); // multiplier
  const [copied, setCopied] = useState(false);

  // Calculations
  const stats = useMemo(() => {
    const hM = Number(height) / 100;
    const wKg = Number(weight);
    const aY = Number(age) || 25;

    if (hM <= 0 || wKg <= 0) return null;

    // BMI Formula
    const bmi = wKg / (hM * hM);
    const roundedBmi = Number(bmi.toFixed(1));

    // Category
    const category =
      BMI_CATEGORIES.find((c) => roundedBmi >= c.min && roundedBmi <= c.max) ||
      BMI_CATEGORIES[BMI_CATEGORIES.length - 1];

    // Ideal Weight Range (BMI 18.5 - 24.9)
    const minIdealWeight = Number((18.5 * hM * hM).toFixed(1));
    const maxIdealWeight = Number((24.9 * hM * hM).toFixed(1));
    const midpointIdealWeight = Number(((minIdealWeight + maxIdealWeight) / 2).toFixed(1));

    // Weight Difference
    let diffWeight = 0;
    let weightStatus = "ideal"; // "gain" | "lose" | "ideal"
    if (wKg < minIdealWeight) {
      diffWeight = Number((minIdealWeight - wKg).toFixed(1));
      weightStatus = "gain";
    } else if (wKg > maxIdealWeight) {
      diffWeight = Number((wKg - maxIdealWeight).toFixed(1));
      weightStatus = "lose";
    }

    // Basal Metabolic Rate (BMR) - Mifflin-St Jeor Formula
    let bmr;
    if (gender === "male") {
      bmr = 10 * wKg + 6.25 * Number(height) - 5 * aY + 5;
    } else {
      bmr = 10 * wKg + 6.25 * Number(height) - 5 * aY - 161;
    }
    const roundedBmr = Math.round(bmr);

    // Total Daily Energy Expenditure (TDEE)
    const tdee = Math.round(roundedBmr * Number(activity));
    const loseCalories = tdee - 500;
    const gainCalories = tdee + 500;

    // Daily Water Intake (approx 35 ml per kg)
    const waterLiters = (wKg * 0.035).toFixed(1);
    const waterGlasses = Math.round((wKg * 0.035 * 1000) / 250);

    // Gauge percentage for visual bar (clamped 10 to 45 BMI mapped to 0-100%)
    const gaugePercent = Math.min(100, Math.max(0, ((bmi - 14) / (42 - 14)) * 100));

    return {
      bmi: roundedBmi,
      category,
      minIdealWeight,
      maxIdealWeight,
      midpointIdealWeight,
      diffWeight,
      weightStatus,
      bmr: roundedBmr,
      tdee,
      loseCalories,
      gainCalories,
      waterLiters,
      waterGlasses,
      gaugePercent,
    };
  }, [gender, height, weight, age, activity]);

  const handleApplyPreset = (p) => {
    setGender(p.gender);
    setHeight(p.height);
    setWeight(p.weight);
    setAge(p.age);
    setActivity(p.activity);
  };

  const handleCopy = () => {
    if (!stats) return;
    const text = `📊 تقرير فحص مؤشر كتلة الجسم (BMI):
• مؤشر كتلة الجسم: ${stats.bmi} (${stats.category.label})
• الطول: ${height} سم | الوزن: ${weight} كجم | الجنس: ${gender === "male" ? "ذكر" : "أنثى"}
• نطاق الوزن الطبيعي المثالي: من ${stats.minIdealWeight} إلى ${stats.maxIdealWeight} كجم
• حالة الوزن: ${
      stats.weightStatus === "ideal"
        ? "وزنك مثالي تماماً"
        : stats.weightStatus === "lose"
        ? `تحتاج لخسارة ${stats.diffWeight} كجم للوصول للنطاق الطبيعي`
        : `تحتاج لزيادة ${stats.diffWeight} كجم للوصول للنطاق الطبيعي`
    }
• السعرات الحرارية اليومية للحفاظ على الوزن: ${stats.tdee} سعرة
• سعرات إنقاص الوزن (-0.5 كجم/أسبوع): ${stats.loseCalories} سعرة
• احتياج الماء اليومي: ${stats.waterLiters} لتر (${stats.waterGlasses} أكواب)

تم الحساب عبر حاسبة مؤشر كتلة الجسم | الأدوات العربية`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12" dir="rtl">
      {/* Header */}
      <div className="mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-sm font-bold text-brand-dark">
          <span>⚖️</span>
          <span>معايير منظمة الصحة العالمية (WHO)</span>
        </div>
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
          حاسبة مؤشر كتلة الجسم (BMI) والوزن المثالي
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-ink-secondary sm:text-base">
          احسب مؤشر كتلة جسمك بدقة، وتعرف على وزنك المثالي ونطاق السعرات اليومية واحتياج الماء بأسلوب علمي وصحي متكامل.
        </p>
      </div>

      {/* Quick Presets */}
      <div className="mb-6 rounded-2xl border border-brand-border bg-brand-surface/40 p-3 sm:p-4">
        <p className="mb-2 text-xs font-bold text-ink-muted">⚡ نماذج وحالات شائعة للتجربة السريعة:</p>
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

          {/* Gender & Age Selection */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">👤</span>
              1. الجنس والعمر
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`rounded-xl border p-3 text-center text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  gender === "male"
                    ? "border-brand bg-brand-light text-brand-dark shadow-sm"
                    : "border-brand-border bg-brand-surface/40 text-ink-secondary hover:bg-white"
                }`}
              >
                <span>👨</span>
                <span>ذكر</span>
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`rounded-xl border p-3 text-center text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  gender === "female"
                    ? "border-brand bg-brand-light text-brand-dark shadow-sm"
                    : "border-brand-border bg-brand-surface/40 text-ink-secondary hover:bg-white"
                }`}
              >
                <span>👩</span>
                <span>أنثى</span>
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink-secondary">العمر (بالسنوات)</label>
              <input
                type="number"
                min="10"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-brand-surface/40 px-4 py-2.5 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Height & Weight Inputs */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">📏</span>
              2. الطول والوزن الحالي
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Height */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-ink-secondary">الطول (سم)</span>
                  <span className="font-bold text-brand-dark text-sm">{height} سم</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="230"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-brand cursor-pointer"
                />
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">سم</span>
                  <input
                    type="number"
                    min="100"
                    max="230"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2 pr-10 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-ink-secondary">الوزن (كجم)</span>
                  <span className="font-bold text-brand-dark text-sm">{weight} كجم</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full accent-brand cursor-pointer"
                />
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">كجم</span>
                  <input
                    type="number"
                    min="30"
                    max="250"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2 pr-10 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Level */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">🏃</span>
              3. مستوى النشاط البدني اليومي
            </h2>
            <div className="space-y-1.5">
              {ACTIVITY_LEVELS.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setActivity(act.id)}
                  className={`w-full rounded-xl border p-3 text-right text-xs transition-all flex items-center justify-between ${
                    activity === act.id
                      ? "border-brand bg-brand-light/70 text-brand-dark shadow-sm"
                      : "border-brand-border bg-brand-surface/30 text-ink-secondary hover:bg-white"
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm block">{act.label}</span>
                    <span className="text-[11px] text-ink-muted">{act.desc}</span>
                  </div>
                  {activity === act.id && <span className="text-base font-black">✓</span>}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ─── Right Results Column (2 cols) ─── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">

            {/* Main BMI Result Card */}
            <div className="rounded-2xl bg-hero-gradient p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-200">مؤشر كتلة الجسم (BMI)</span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
                  {gender === "male" ? "👨 ذكر" : "👩 أنثى"}
                </span>
              </div>

              {stats && (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tight">{stats.bmi}</span>
                    <span className="text-sm font-semibold opacity-90">كجم/م²</span>
                  </div>
                  <div className="mt-2 inline-block rounded-xl bg-white/20 px-3 py-1 text-sm font-bold backdrop-blur-sm">
                    {stats.category.label}
                  </div>
                </div>
              )}

              {/* Visual Scale Indicator */}
              {stats && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] text-white/80 font-bold">
                    <span>16 نحافة</span>
                    <span>18.5 مثالي</span>
                    <span>25 زيادة</span>
                    <span>30 سمنة</span>
                  </div>
                  <div className="relative h-3 w-full rounded-full bg-white/30 overflow-hidden">
                    <div className="flex h-full w-full">
                      <div className="h-full bg-amber-400 w-[18%]" title="نحافة" />
                      <div className="h-full bg-emerald-400 w-[25%]" title="مثالي" />
                      <div className="h-full bg-orange-400 w-[20%]" title="وزن زائد" />
                      <div className="h-full bg-rose-500 w-[17%]" title="سمنة 1" />
                      <div className="h-full bg-red-600 w-[20%]" title="سمنة مفرطة" />
                    </div>
                  </div>
                  {/* Gauge Pointer */}
                  <div className="relative w-full h-2">
                    <div
                      className="absolute -top-1 w-2.5 h-2.5 bg-white border border-brand-dark rounded-full shadow-md transition-all duration-300"
                      style={{ right: `${stats.gaugePercent}%`, transform: "translateX(50%)" }}
                    />
                  </div>
                </div>
              )}

              {stats && (
                <div className="rounded-xl bg-white/15 p-3 text-xs leading-relaxed backdrop-blur-sm">
                  <span className="font-bold text-amber-300">🩺 التوجيه الطبي: </span>
                  {stats.category.advice}
                </div>
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

            {/* Ideal Weight Analysis Card */}
            {stats && (
              <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
                <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>الوزن المثالي لطولك ({height} سم)</span>
                </h3>

                <div className="rounded-xl bg-brand-surface/50 p-3 text-center border border-brand-border/40">
                  <p className="text-xs text-ink-secondary">نطاق الوزن الطبيعي الصحي:</p>
                  <p className="text-xl font-black text-brand-dark mt-0.5">
                    {stats.minIdealWeight} - {stats.maxIdealWeight} <span className="text-xs font-normal">كجم</span>
                  </p>
                  <p className="text-[11px] text-ink-muted mt-1">
                    متوسط الوزن المثالي الموصى به: <strong>{stats.midpointIdealWeight} كجم</strong>
                  </p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-brand-border/30">
                    <span className="text-ink-secondary">حالة وزنك الحالي:</span>
                    <span className="font-bold text-ink">
                      {stats.weightStatus === "ideal"
                        ? "✅ مثالي تماماً"
                        : stats.weightStatus === "lose"
                        ? `تحتاج لخسارة ${stats.diffWeight} كجم`
                        : `تحتاج لزيادة ${stats.diffWeight} كجم`}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-ink-secondary">احتياج الماء اليومي:</span>
                    <span className="font-bold text-brand-dark">
                      {stats.waterLiters} لتر ({stats.waterGlasses} أكواب)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Calories Breakdown Card */}
            {stats && (
              <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
                <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                  <span>🔥</span>
                  <span>دليل السعرات الحرارية اليومية</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-brand-surface/60">
                    <div>
                      <span className="font-bold text-ink block">تثبيت الوزن الحالي</span>
                      <span className="text-[10px] text-ink-muted">احتياج الطاقة اليومي (TDEE)</span>
                    </div>
                    <span className="text-sm font-black text-brand-dark">{stats.tdee} سعرة</span>
                  </div>

                  <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div>
                      <span className="font-bold text-emerald-950 block">خسارة الوزن (0.5 كجم/أسبوع)</span>
                      <span className="text-[10px] text-emerald-700">عجز صحي 500 سعرة يومياً</span>
                    </div>
                    <span className="text-sm font-black text-emerald-800">{stats.loseCalories} سعرة</span>
                  </div>

                  <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-amber-50 border border-amber-200">
                    <div>
                      <span className="font-bold text-amber-950 block">زيادة الوزن وبناء العضلات</span>
                      <span className="text-[10px] text-amber-700">فائض صحي 500 سعرة يومياً</span>
                    </div>
                    <span className="text-sm font-black text-amber-800">{stats.gainCalories} سعرة</span>
                  </div>
                </div>

                <p className="text-[10px] text-ink-muted leading-relaxed pt-1">
                  * معدل الأيض الأساسي لجسمك أثناء الراحة (BMR) هو <strong>{stats.bmr} سعرة</strong>.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink-muted">
        ⚠️ تنبيه طبي: مؤشر كتلة الجسم هو معيار استرشادي عام وفق منظمة الصحة العالمية (WHO)، ولا يفرّق بدقة بين كتلة الدهون والكتلة العضلية (خاصة للرياضيين والحوامل). استشر طبيباً أو أخصائي تغذية لخطة شخصية.
      </p>
    </div>
  );
}
