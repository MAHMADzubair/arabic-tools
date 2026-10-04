"use client";

import { useState, useMemo, useId } from "react";

// Types of Kaffarah and Fidya
const kaffaraTypes = [
  {
    id: "fasting_fidya",
    title: "فدية الصيام (عجز دائم أو مرض)",
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
  { code: "KSA", country: "السعودية", cost: 15, currency: "SAR", note: "وجبة مشبعة أو نصف صاع أرز (10 - 20 ر.س)" },
  { code: "UAE", country: "الإمارات", cost: 15, currency: "AED", note: "قيمة وجبة الإطعام المعتمدة (15 د.إ)" },
  { code: "EGY", country: "مصر", cost: 35, currency: "EGP", note: "الحد الأدنى المعلن من دار الإفتاء المصرية" },
  { code: "QAR", country: "قطر", cost: 15, currency: "QAR", note: "إدارة صندوق الزكاة القطرية" },
  { code: "KWD", country: "الكويت", cost: 1.5, currency: "KWD", note: "بيت الزكاة الكويتي (دينار ونصف)" },
  { code: "JOR", country: "الأردن", cost: 1.5, currency: "JOD", note: "دائرة الإفتاء العام الأردنية" },
  { code: "OMN", country: "عمان", cost: 1.5, currency: "OMR", note: "وزارة الأوقاف والشؤون الدينية" },
  { code: "GLOBAL", country: "أوروبا / أمريكا", cost: 10, currency: "USD", note: "المراكز الإسلامية في الخارج (10$ للوجبة)" },
];

function formatNumber(n, decimals = 1) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Arabic number agreement for "مسكين" (1: مسكين واحد، 2: مسكينان، 3-10: مساكين، 11+: مسكيناً)
function masakeen(n) {
  if (n === 1) return "مسكين واحد";
  if (n === 2) return "مسكينان";
  if (n >= 3 && n <= 10) return `${n} مساكين`;
  return `${n} مسكيناً`;
}

export default function KaffaraCalculator() {
  const unitsId = useId();
  const costId = useId();

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

  // Calculations (unchanged)
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
    let text = `تقرير حساب ${activeType.title}\n`;
    text += `------------------------------------\n`;
    text += `النوع: ${activeType.title}\n`;
    text += `${activeType.unitLabel}: ${result.units}\n`;
    text += `عدد المساكين الواجب إطعامهم: ${masakeen(result.totalPersonsToFeed)}\n\n`;

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

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const bigResult =
    calcMode === "cash"
      ? `${formatNumber(result.totalCash, 2)} ${currency}`
      : `${formatNumber(result.totalFoodKg)} كجم`;

  return (
    <div className="kf" dir="rtl">
      <style>{css}</style>

      <header className="kf-head">
        <p className="kf-kicker">حساب الفدية والكفارات الشرعية</p>
        <h1 className="kf-h1">حاسبة الكفارات والفدية الشرعية</h1>
        <p className="kf-lead">
          احسب مقدار كفارة اليمين، وفدية صيام رمضان للعاجز والمريض، وكفارة النذر، وفدية محظورات الإحرام،
          عيناً بالأرز (بالكيلوجرام) أو نقداً بالعملة.
        </p>
      </header>

      <div className="kf-grid">
        {/* ── Inputs ─────────────────────────────────────────────────────────── */}
        <div className="kf-col">
          <section className="kf-box" aria-labelledby="kf-s1">
            <h2 className="kf-h2" id="kf-s1">
              <span className="kf-num">1</span>
              <span>اختر نوع الكفارة أو الفدية</span>
            </h2>

            <div className="kf-stack" role="group" aria-labelledby="kf-s1">
              {kaffaraTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className="kf-type"
                  aria-pressed={selectedTypeId === type.id}
                  onClick={() => handleTypeSelect(type)}
                >
                  <span className="kf-type-top">
                    <span className="kf-type-title">{type.title}</span>
                    <span className="kf-tag">
                      {type.personsPerUnit === 1 ? "مسكين/يوم" : `${type.personsPerUnit} مساكين`}
                    </span>
                  </span>
                  <span className="kf-type-desc">{type.shortDesc}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="kf-box" aria-labelledby="kf-s2">
            <h2 className="kf-h2" id="kf-s2">
              <span className="kf-num">2</span>
              <span>العدد وطريقة الإخراج</span>
            </h2>

            <div className="kf-stack kf-stack-lg">
              <div>
                <label className="kf-label" htmlFor={unitsId}>{activeType.unitLabel}</label>
                <div className="kf-stepper">
                  <button
                    type="button"
                    className="kf-btn"
                    aria-label={`إنقاص: ${activeType.unitLabel}`}
                    onClick={() => setUnitsCount((u) => Math.max(1, u - 1))}
                  >
                    −
                  </button>
                  <input
                    id={unitsId}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={unitsCount}
                    onChange={(e) => setUnitsCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="kf-input kf-center"
                  />
                  <button
                    type="button"
                    className="kf-btn"
                    aria-label={`زيادة: ${activeType.unitLabel}`}
                    onClick={() => setUnitsCount((u) => u + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <fieldset className="kf-fieldset">
                <legend className="kf-label">طريقة إخراج الإطعام</legend>
                <div className="kf-seg kf-seg-2">
                  <button
                    type="button"
                    className="kf-btn kf-btn-tall"
                    aria-pressed={calcMode === "cash"}
                    onClick={() => setCalcMode("cash")}
                  >
                    <span>نقداً بالقيمة</span>
                    <span className="kf-btn-sub">تكلفة وجبة مسكين</span>
                  </button>
                  <button
                    type="button"
                    className="kf-btn kf-btn-tall"
                    aria-pressed={calcMode === "food"}
                    onClick={() => setCalcMode("food")}
                  >
                    <span>طعاماً عيناً</span>
                    <span className="kf-btn-sub">أرز بالكيلوجرام</span>
                  </button>
                </div>
              </fieldset>

              {calcMode === "cash" && (
                <div className="kf-stack kf-cash">
                  <fieldset className="kf-fieldset">
                    <legend className="kf-label">متوسط تكلفة وجبة المسكين حسب الدولة</legend>
                    <div className="kf-seg kf-seg-countries">
                      {countryMealPresets.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          className="kf-btn kf-btn-tall"
                          aria-pressed={selectedCountryCode === c.code && !isCustomMealCost}
                          onClick={() => handleCountrySelect(c)}
                        >
                          <span>{c.country}</span>
                          <span className="kf-btn-sub">{c.cost} {c.currency}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <div className="kf-row">
                      <label className="kf-label kf-label-flush" htmlFor={costId}>
                        قيمة الوجبة الواحدة ({currency})
                      </label>
                      <button
                        type="button"
                        className="kf-link"
                        onClick={() => setIsCustomMealCost(!isCustomMealCost)}
                      >
                        {isCustomMealCost ? "استعادة التلقائي" : "تعديل يدوي"}
                      </button>
                    </div>
                    <input
                      id={costId}
                      type="number"
                      inputMode="decimal"
                      min="1"
                      step="any"
                      value={isCustomMealCost ? customCostInput : mealCost}
                      onChange={(e) => {
                        setIsCustomMealCost(true);
                        setCustomCostInput(e.target.value);
                      }}
                      className="kf-input"
                    />
                    <p className="kf-small">{activeCountry.note}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── Output ─────────────────────────────────────────────────────────── */}
        <div className="kf-col">
          <section className="kf-result" aria-live="polite" aria-labelledby="kf-res-label">
            <p className="kf-result-label" id="kf-res-label">
              {calcMode === "cash"
                ? `المبلغ المطلوب نقداً لإطعام ${masakeen(result.totalPersonsToFeed)}`
                : `إجمالي الأرز المطلوب لإطعام ${masakeen(result.totalPersonsToFeed)}`}
            </p>
            <p className="kf-result-big"><bdi>{bigResult}</bdi></p>
            <p className="kf-result-foot">
              المستحقون: {masakeen(result.totalPersonsToFeed)} ({result.units} × {activeType.personsPerUnit})
            </p>
          </section>

          <section className="kf-box" aria-labelledby="kf-s3">
            <div className="kf-res-head">
              <h2 className="kf-h2 kf-h2-flush" id="kf-s3">تفاصيل الحساب</h2>
              <button type="button" className="kf-btn" onClick={handleCopy}>
                {copied ? "تم النسخ" : "نسخ التقرير"}
              </button>
            </div>
            <p className="kf-sr" role="status">{copied ? "تم نسخ التقرير" : ""}</p>

            <dl className="kf-rows">
              <div>
                <dt>النوع المحدد</dt>
                <dd>{activeType.title}</dd>
              </div>
              <div>
                <dt>المقدار الواجب لكل مسكين</dt>
                <dd>
                  {calcMode === "cash"
                    ? <>وجبة مشبعة (<bdi>{result.currentRate} {currency}</bdi>)</>
                    : "نصف صاع (≈ 1.35 كجم أرز)"}
                </dd>
              </div>
              <div>
                <dt>إجمالي الحبوب بالصاع النبوي</dt>
                <dd><bdi>{formatNumber(result.totalSaFood, 1)}</bdi> صاع (نصف صاع × {result.totalPersonsToFeed})</dd>
              </div>
              <div className="kf-rows-total">
                <dt>إجمالي المطلوب إخراجه</dt>
                <dd><bdi>{calcMode === "cash" ? `${formatNumber(result.totalCash, 2)} ${currency}` : `${formatNumber(result.totalFoodKg)} كجم أرز`}</bdi></dd>
              </div>
            </dl>

            <div className="kf-ruling">
              <h3 className="kf-ruling-title">الحكم والضابط الشرعي</h3>
              <p>{activeType.rulingNote}</p>
            </div>

            {activeType.fastingAlternative && (
              <div className="kf-alt">
                <h3 className="kf-ruling-title">تنبيه: حكم العجز المالي التام</h3>
                <p>{activeType.fastingAlternative}</p>
                <p className="kf-small">
                  لا يُنتقل إلى الصيام في كفارة اليمين إلا عند العجز المالي الحقيقي عن إطعام أو كسوة 10 مساكين.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Styles: Ink & Signal ──────────────────────────────────────────────────────
// Reads the site's --c-* tokens when present, with the palette as fallback.
// Orange is only ever a background, always with black text.
const css = `
.kf{
  --i-bg:var(--c-bg,#F5F5F2);
  --i-ink:var(--c-ink,#0D0D0D);
  --i-mute:var(--c-mute,#55554F);
  --i-soft:var(--c-soft,#DEDED8);
  --i-accent:var(--c-accent,#FF6A1A);
  --i-on-accent:#0D0D0D;
  background:var(--i-bg);color:var(--i-ink);
  max-width:64rem;margin:0 auto;padding:2rem 1rem 3rem;line-height:1.6;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]) .kf{
    --i-bg:var(--c-bg,#0D0D0D);--i-ink:var(--c-ink,#F5F5F2);
    --i-mute:var(--c-mute,#B4B4AD);--i-soft:var(--c-soft,#2A2A27);
  }
}
:root[data-theme="dark"] .kf{
  --i-bg:var(--c-bg,#0D0D0D);--i-ink:var(--c-ink,#F5F5F2);
  --i-mute:var(--c-mute,#B4B4AD);--i-soft:var(--c-soft,#2A2A27);
}
.kf *{box-sizing:border-box}
.kf h1,.kf h2,.kf h3,.kf p,.kf dl,.kf dd{margin:0;padding:0}
.kf button,.kf input,.kf select{font:inherit;color:inherit}
.kf :focus-visible{outline:3px solid var(--i-ink);outline-offset:2px}
.kf bdi{unicode-bidi:isolate;font-variant-numeric:tabular-nums}

.kf-head{margin-bottom:2rem;max-width:44rem}
.kf-kicker{font-size:.85rem;font-weight:700;color:var(--i-mute);margin-bottom:.35rem}
.kf-h1{font-size:clamp(2rem,5vw,3rem);font-weight:900;line-height:1.15;margin-bottom:.75rem}
.kf-lead{color:var(--i-mute);max-width:38rem}

.kf-grid{display:grid;gap:1.5rem;grid-template-columns:minmax(0,1fr)}
@media (min-width:1024px){.kf-grid{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}}
.kf-col{display:grid;gap:1.5rem;min-width:0}

.kf-box{border:2px solid var(--i-ink);border-radius:4px;padding:1.25rem}
.kf-h2{display:flex;align-items:center;gap:.65rem;font-size:1.1rem;font-weight:800;margin-bottom:1rem}
.kf-h2-flush{margin-bottom:0}
.kf-num{display:inline-flex;flex:none;width:1.75rem;height:1.75rem;align-items:center;justify-content:center;background:var(--i-ink);color:var(--i-bg);font-size:.85rem;font-weight:800;border-radius:2px}
.kf-stack{display:grid;gap:.6rem}
.kf-stack-lg{gap:1.25rem}
.kf-cash{border-top:2px solid var(--i-ink);padding-top:1rem;gap:1rem}

.kf-label{display:block;font-size:.8rem;font-weight:700;margin-bottom:.35rem;padding:0}
.kf-label-flush{margin-bottom:0}
.kf-fieldset{border:0;margin:0;padding:0;min-width:0}
.kf-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.kf-input{width:100%;border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);padding:.6rem .75rem;font-size:.95rem;font-weight:700;min-height:2.75rem}
.kf-center{text-align:center}
.kf-small{margin-top:.35rem;font-size:.78rem;color:var(--i-mute)}
.kf-row{display:flex;justify-content:space-between;align-items:center;gap:.75rem;margin-bottom:.35rem}
.kf-link{border:0;background:none;padding:.25rem 0;font-size:.8rem;font-weight:700;text-decoration:underline;cursor:pointer}

.kf-btn{border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);padding:.45rem .75rem;font-size:.8rem;font-weight:700;cursor:pointer;min-height:2.5rem}
.kf-btn:hover{background:var(--i-soft)}
.kf-btn[aria-pressed="true"]{background:var(--i-ink);color:var(--i-bg)}
.kf-btn-tall{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.1rem;line-height:1.35}
.kf-btn-sub{font-size:.7rem;font-weight:500}
.kf-seg{display:grid;gap:.4rem}
.kf-seg-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.kf-seg-countries{grid-template-columns:repeat(2,minmax(0,1fr))}
@media (min-width:640px){.kf-seg-countries{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media (min-width:1024px){.kf-seg-countries{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (min-width:1200px){.kf-seg-countries{grid-template-columns:repeat(4,minmax(0,1fr))}}
.kf-stepper{display:grid;grid-template-columns:2.75rem minmax(0,1fr) 2.75rem;gap:.4rem}
.kf-stepper .kf-btn{padding:0;font-size:1.1rem}

.kf-type{display:grid;gap:.25rem;width:100%;text-align:start;border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);padding:.75rem;cursor:pointer}
.kf-type:hover{background:var(--i-soft)}
.kf-type[aria-pressed="true"]{background:var(--i-ink);color:var(--i-bg)}
.kf-type-top{display:flex;justify-content:space-between;align-items:center;gap:.75rem}
.kf-type-title{font-size:.9rem;font-weight:800}
.kf-type-desc{font-size:.78rem;line-height:1.5}
.kf-tag{flex:none;border:2px solid currentColor;border-radius:2px;padding:0 .45rem;font-size:.72rem;font-weight:700;line-height:1.5;white-space:nowrap}

.kf-result{background:var(--i-accent);color:var(--i-on-accent);border:2px solid var(--i-ink);border-radius:4px;padding:1.5rem}
.kf-result-label{font-size:.9rem;font-weight:700}
.kf-result-big{font-size:clamp(2rem,6vw,3.25rem);font-weight:900;line-height:1.15;margin:.35rem 0 1rem}
.kf-result-foot{border-top:2px solid var(--i-on-accent);padding-top:.75rem;font-size:.9rem;font-weight:600}

.kf-res-head{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:space-between;align-items:center;margin-bottom:1rem}
.kf-rows{border:2px solid var(--i-ink);border-radius:4px}
.kf-rows>div{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.25rem 1rem;padding:.7rem .85rem;border-bottom:2px solid var(--i-ink);font-size:.88rem}
.kf-rows>div:last-child{border-bottom:0}
.kf-rows dt{font-weight:600;color:var(--i-mute)}
.kf-rows dd{font-weight:800}
.kf-rows-total{background:var(--i-soft)}
.kf-rows-total dt{color:var(--i-ink);font-weight:800}

.kf-ruling{margin-top:1.25rem;border:2px solid var(--i-ink);border-inline-start-width:8px;border-radius:4px;padding:.85rem 1rem;font-size:.88rem}
.kf-alt{margin-top:1rem;border:2px dashed var(--i-ink);border-radius:4px;padding:.85rem 1rem;font-size:.88rem}
.kf-ruling-title{font-size:.9rem;font-weight:800;margin-bottom:.25rem}
`;