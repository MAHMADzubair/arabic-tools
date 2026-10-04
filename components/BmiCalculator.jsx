"use client";

import { useState, useMemo, useId } from "react";

/* ─── WHO BMI Categories (text and ranges unchanged; colour fields removed) ─ */
const BMI_CATEGORIES = [
  { min: 0, max: 18.5, label: "نقص في الوزن (نحافة)", advice: "وزنك أقل من المعدل الطبيعي، يُنصح بزيادة السعرات الصحية وبناء الكتلة العضلية." },
  { min: 18.5, max: 24.9, label: "وزن طبيعي ومثالي", advice: "تهانينا! وزنك في النطاق الصحي المثالي، حافظ على نمط حياتك المتوازن." },
  { min: 25, max: 29.9, label: "وزن زائد (مرحلة ما قبل السمنة)", advice: "لديك زيادة في الوزن عن المعدل الصحي، يُنصح بزيادة النشاط البدني وتقليل السكريات." },
  { min: 30, max: 34.9, label: "سمنة من الدرجة الأولى", advice: "مرحلة سمنة أولى؛ ينبغي اتباع نظام غذائي محسوب السعرات لتفادي المخاطر الصحية." },
  { min: 35, max: 39.9, label: "سمنة من الدرجة الثانية", advice: "سمنة متوسطة إلى شديدة؛ يُفضل استشارة أخصائي تغذية وطبيب لتنظيم خطة نزول آمنة." },
  { min: 40, max: 100, label: "سمنة مفرطة خطيرة (درجة ثالثة)", advice: "سمنة مفرطة تتطلب تدخلاً طبياً عاجلاً لتفادي أمراض القلب والسكري وارتفاع الضغط." },
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

/* Gauge: BMI 14 → 0%, BMI 42 → 100%. Segments are derived from the same
   scale as the pointer so the pointer always lands in the right segment. */
const G_MIN = 14;
const G_MAX = 42;
const pct = (v) => ((Math.min(G_MAX, Math.max(G_MIN, v)) - G_MIN) / (G_MAX - G_MIN)) * 100;
const GAUGE_STOPS = [14, 18.5, 25, 30, 35, 42];
const GAUGE_TICKS = [18.5, 25, 30, 35];

export default function BmiCalculator() {
  const uid = useId();
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const [age, setAge] = useState(30);
  const [activity, setActivity] = useState(1.375);
  const [copied, setCopied] = useState(false);

  // ─── Calculations (unchanged) ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const hM = Number(height) / 100;
    const wKg = Number(weight);
    const aY = Number(age) || 25;

    if (hM <= 0 || wKg <= 0) return null;

    const bmi = wKg / (hM * hM);
    const roundedBmi = Number(bmi.toFixed(1));

    const category =
      BMI_CATEGORIES.find((c) => roundedBmi >= c.min && roundedBmi <= c.max) ||
      BMI_CATEGORIES[BMI_CATEGORIES.length - 1];

    const minIdealWeight = Number((18.5 * hM * hM).toFixed(1));
    const maxIdealWeight = Number((24.9 * hM * hM).toFixed(1));
    const midpointIdealWeight = Number(((minIdealWeight + maxIdealWeight) / 2).toFixed(1));

    let diffWeight = 0;
    let weightStatus = "ideal";
    if (wKg < minIdealWeight) {
      diffWeight = Number((minIdealWeight - wKg).toFixed(1));
      weightStatus = "gain";
    } else if (wKg > maxIdealWeight) {
      diffWeight = Number((wKg - maxIdealWeight).toFixed(1));
      weightStatus = "lose";
    }

    let bmr;
    if (gender === "male") {
      bmr = 10 * wKg + 6.25 * Number(height) - 5 * aY + 5;
    } else {
      bmr = 10 * wKg + 6.25 * Number(height) - 5 * aY - 161;
    }
    const roundedBmr = Math.round(bmr);

    const tdee = Math.round(roundedBmr * Number(activity));
    const loseCalories = tdee - 500;
    const gainCalories = tdee + 500;

    const waterLiters = (wKg * 0.035).toFixed(1);
    const waterGlasses = Math.round((wKg * 0.035 * 1000) / 250);

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
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const activeSeg = stats
    ? GAUGE_STOPS.slice(0, -1).findIndex((s, i) => stats.bmi >= s && stats.bmi < GAUGE_STOPS[i + 1])
    : -1;
  const activeIdx = stats && stats.bmi >= GAUGE_STOPS[GAUGE_STOPS.length - 2] ? 4 : activeSeg;

  return (
    <div className="bmi" dir="rtl">
      <style>{CSS}</style>

      {/* Header */}
      <header className="bmi-head">
        <p className="bmi-badge">معايير منظمة الصحة العالمية (WHO)</p>
        <h1 className="bmi-title">حاسبة مؤشر كتلة الجسم (BMI) والوزن المثالي</h1>
        <p className="bmi-sub">
          احسب مؤشر كتلة جسمك بدقة، وتعرف على وزنك المثالي ونطاق السعرات اليومية واحتياج الماء بأسلوب علمي وصحي متكامل.
        </p>
      </header>

      {/* Presets */}
      <section className="bmi-presets" aria-label="نماذج للتجربة السريعة">
        <p className="bmi-label">نماذج وحالات شائعة للتجربة السريعة</p>
        <div className="bmi-chips">
          {PRESETS.map((p, idx) => (
            <button key={idx} type="button" onClick={() => handleApplyPreset(p)} className="bmi-chip">
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <div className="bmi-cols">
        {/* ───────── Inputs ───────── */}
        <div className="bmi-stack">
          {/* 1 */}
          <fieldset className="bmi-card">
            <legend className="bmi-h2">الجنس والعمر</legend>
            <div className="bmi-seg" role="radiogroup" aria-label="الجنس">
              <button type="button" role="radio" aria-checked={gender === "male"} onClick={() => setGender("male")} className="bmi-opt">
                ذكر
              </button>
              <button type="button" role="radio" aria-checked={gender === "female"} onClick={() => setGender("female")} className="bmi-opt">
                أنثى
              </button>
            </div>
            <div className="bmi-field">
              <label className="bmi-label" htmlFor={`${uid}-age`}>العمر (بالسنوات)</label>
              <input
                id={`${uid}-age`}
                type="number"
                inputMode="numeric"
                min="10"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="bmi-input bmi-num"
              />
            </div>
          </fieldset>

          {/* 2 */}
          <fieldset className="bmi-card">
            <legend className="bmi-h2">الطول والوزن الحالي</legend>
            <div className="bmi-grid2">
              <div className="bmi-field">
                <div className="bmi-line">
                  <label className="bmi-label" htmlFor={`${uid}-height`}>الطول (سم)</label>
                  <strong className="bmi-num">{height} سم</strong>
                </div>
                <input
                  type="range"
                  min="100"
                  max="230"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="bmi-range"
                  aria-label="الطول بالسنتيمتر (شريط التمرير)"
                />
                <input
                  id={`${uid}-height`}
                  type="number"
                  inputMode="decimal"
                  min="100"
                  max="230"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="bmi-input bmi-num"
                />
              </div>

              <div className="bmi-field">
                <div className="bmi-line">
                  <label className="bmi-label" htmlFor={`${uid}-weight`}>الوزن (كجم)</label>
                  <strong className="bmi-num">{weight} كجم</strong>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="bmi-range"
                  aria-label="الوزن بالكيلوغرام (شريط التمرير)"
                />
                <input
                  id={`${uid}-weight`}
                  type="number"
                  inputMode="decimal"
                  min="30"
                  max="250"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bmi-input bmi-num"
                />
              </div>
            </div>
          </fieldset>

          {/* 3 */}
          <fieldset className="bmi-card">
            <legend className="bmi-h2">مستوى النشاط البدني اليومي</legend>
            <div className="bmi-acts" role="radiogroup" aria-label="مستوى النشاط البدني">
              {ACTIVITY_LEVELS.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  role="radio"
                  aria-checked={activity === act.id}
                  onClick={() => setActivity(act.id)}
                  className="bmi-opt bmi-opt--row"
                >
                  <strong>{act.label}</strong>
                  <span>{act.desc}</span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* ───────── Results ───────── */}
        <div className="bmi-stack bmi-sticky">
          {/* Main result: orange panel, ink text */}
          <section className="bmi-result" aria-live="polite" aria-label="النتيجة">
            <p className="bmi-result-top">
              <span>مؤشر كتلة الجسم (BMI)</span>
              <span className="bmi-tag">{gender === "male" ? "ذكر" : "أنثى"}</span>
            </p>

            {stats ? (
              <>
                <p className="bmi-big">
                  <span className="bmi-num">{stats.bmi}</span>
                  <span className="bmi-unit">كجم/م²</span>
                </p>
                <p className="bmi-cat">{stats.category.label}</p>

                {/* Gauge */}
                <div className="bmi-gauge" aria-hidden="true">
                  <div className="bmi-ticks">
                    {GAUGE_TICKS.map((t) => (
                      <span key={t} className="bmi-num" style={{ insetInlineStart: `${pct(t)}%` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="bmi-bar">
                    {GAUGE_STOPS.slice(0, -1).map((s, i) => (
                      <i
                        key={s}
                        className={i === activeIdx ? "is-active" : ""}
                        style={{ width: `${pct(GAUGE_STOPS[i + 1]) - pct(s)}%` }}
                      />
                    ))}
                    <b className="bmi-pointer" style={{ insetInlineStart: `${stats.gaugePercent}%` }} />
                  </div>
                </div>

                <p className="bmi-advice">
                  <strong>التوجيه الطبي: </strong>
                  {stats.category.advice}
                </p>
              </>
            ) : (
              <p className="bmi-advice">أدخل الطول والوزن لعرض النتيجة.</p>
            )}

            <div className="bmi-actions bmi-noprint">
              <button type="button" onClick={handleCopy} className="bmi-btn bmi-btn--ink">
                {copied ? "تم نسخ التقرير" : "نسخ النتيجة"}
              </button>
              <button type="button" onClick={() => window.print()} className="bmi-btn">
                طباعة
              </button>
              <span className="bmi-sr" role="status">{copied ? "تم نسخ التقرير" : ""}</span>
            </div>
          </section>

          {stats && (
            <section className="bmi-card" aria-label="الوزن المثالي">
              <h2 className="bmi-h2">الوزن المثالي لطولك ({height} سم)</h2>
              <p className="bmi-range-box">
                <span className="bmi-label">نطاق الوزن الطبيعي الصحي</span>
                <strong className="bmi-num">{stats.minIdealWeight} – {stats.maxIdealWeight} <small>كجم</small></strong>
                <span className="bmi-hint">
                  متوسط الوزن المثالي الموصى به: <strong className="bmi-num">{stats.midpointIdealWeight} كجم</strong>
                </span>
              </p>
              <dl className="bmi-rows">
                <div className="bmi-row">
                  <dt>حالة وزنك الحالي</dt>
                  <dd>
                    {stats.weightStatus === "ideal"
                      ? "مثالي تماماً"
                      : stats.weightStatus === "lose"
                      ? `تحتاج لخسارة ${stats.diffWeight} كجم`
                      : `تحتاج لزيادة ${stats.diffWeight} كجم`}
                  </dd>
                </div>
                <div className="bmi-row">
                  <dt>احتياج الماء اليومي</dt>
                  <dd>{stats.waterLiters} لتر ({stats.waterGlasses} أكواب)</dd>
                </div>
              </dl>
            </section>
          )}

          {stats && (
            <section className="bmi-card" aria-label="السعرات الحرارية اليومية">
              <h2 className="bmi-h2">دليل السعرات الحرارية اليومية</h2>
              <dl className="bmi-cals">
                <div className="bmi-cal">
                  <dt>
                    <strong>تثبيت الوزن الحالي</strong>
                    <span>احتياج الطاقة اليومي (TDEE)</span>
                  </dt>
                  <dd><span className="bmi-num">{stats.tdee}</span> سعرة</dd>
                </div>
                <div className="bmi-cal">
                  <dt>
                    <strong>خسارة الوزن (0.5 كجم/أسبوع)</strong>
                    <span>عجز صحي 500 سعرة يومياً</span>
                  </dt>
                  <dd><span className="bmi-num">{stats.loseCalories}</span> سعرة</dd>
                </div>
                <div className="bmi-cal">
                  <dt>
                    <strong>زيادة الوزن وبناء العضلات</strong>
                    <span>فائض صحي 500 سعرة يومياً</span>
                  </dt>
                  <dd><span className="bmi-num">{stats.gainCalories}</span> سعرة</dd>
                </div>
              </dl>
              <p className="bmi-hint">
                معدل الأيض الأساسي لجسمك أثناء الراحة (BMR) هو <strong className="bmi-num">{stats.bmr} سعرة</strong>.
              </p>
            </section>
          )}
        </div>
      </div>

      <p className="bmi-disclaimer">
        تنبيه طبي: مؤشر كتلة الجسم هو معيار استرشادي عام وفق منظمة الصحة العالمية (WHO)، ولا يفرّق بدقة بين كتلة الدهون والكتلة العضلية (خاصة للرياضيين والحوامل). استشر طبيباً أو أخصائي تغذية لخطة شخصية.
      </p>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
// Colours come from --c-* on .bmi. If your tokens.css already defines the
// underlying names, delete the fallback values and map them in one place.
const CSS = `
.bmi {
  --c-surface: var(--surface, #FFFFFF);
  --c-ink: var(--ink, #0D0D0D);
  --c-ink-soft: var(--ink-soft, #4A4A46);
  --c-line: var(--line, #D9D9D3);
  --c-signal: var(--signal, #FF6A1A);
  --c-on-ink: var(--on-ink, #FFFFFF);
  --c-on-signal: var(--on-signal, #0D0D0D);

  max-width: 64rem;
  margin-inline: auto;
  padding: 2rem 1rem;
  color: var(--c-ink);
  font-family: inherit;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .bmi {
    --c-surface: var(--surface, #181816);
    --c-ink: var(--ink, #F5F5F2);
    --c-ink-soft: var(--ink-soft, #B4B4AD);
    --c-line: var(--line, #34342F);
    --c-on-ink: var(--on-ink, #0D0D0D);
  }
}
:root[data-theme="dark"] .bmi {
  --c-surface: var(--surface, #181816);
  --c-ink: var(--ink, #F5F5F2);
  --c-ink-soft: var(--ink-soft, #B4B4AD);
  --c-line: var(--line, #34342F);
  --c-on-ink: var(--on-ink, #0D0D0D);
}
.bmi *, .bmi *::before, .bmi *::after { box-sizing: border-box; }

.bmi-head { margin-block-end: 1.5rem; padding-inline-start: 0.9rem; border-inline-start: 4px solid var(--c-ink); }
.bmi-badge { display: inline-block; margin: 0 0 0.6rem; padding: 0.2rem 0.7rem; font-size: 0.78rem; font-weight: 700; border: 1px solid var(--c-ink); border-radius: 999px; }
.bmi-title { margin: 0; font-size: 1.6rem; font-weight: 800; line-height: 1.4; }
@media (min-width: 640px) { .bmi-title { font-size: 2rem; } }
.bmi-sub { margin: 0.5rem 0 0; max-width: 60ch; font-size: 0.92rem; line-height: 1.8; color: var(--c-ink-soft); }

.bmi-presets { margin-block-end: 1.5rem; padding: 0.9rem 1rem; border: 1px solid var(--c-line); border-radius: 12px; background: var(--c-surface); }
.bmi-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-block-start: 0.5rem; }
.bmi-chip {
  min-height: 40px; padding: 0.35rem 0.8rem; font: inherit; font-size: 0.82rem; font-weight: 600;
  color: var(--c-ink); background: var(--c-surface); border: 2px solid var(--c-line); border-radius: 999px; cursor: pointer;
  transition: background-color .15s, color .15s, border-color .15s;
}
.bmi-chip:hover { background: var(--c-ink); color: var(--c-on-ink); border-color: var(--c-ink); }

.bmi-cols { display: grid; gap: 1.25rem; }
@media (min-width: 900px) { .bmi-cols { grid-template-columns: 3fr 2fr; align-items: start; } }
.bmi-stack { display: grid; gap: 1.25rem; min-width: 0; }
@media (min-width: 900px) { .bmi-sticky { position: sticky; top: 1.5rem; } }

.bmi-card { margin: 0; padding: 1.1rem; background: var(--c-surface); border: 1px solid var(--c-line); border-radius: 14px; display: grid; gap: 1rem; min-width: 0; }
.bmi-h2 { margin: 0; padding: 0; font-size: 1rem; font-weight: 800; }
fieldset.bmi-card > legend.bmi-h2 { float: inline-start; width: 100%; padding: 0; margin-block-end: 0.25rem; }
fieldset.bmi-card > legend.bmi-h2 + * { clear: both; }

.bmi-label { font-size: 0.82rem; font-weight: 700; }
.bmi-hint { font-size: 0.8rem; line-height: 1.7; color: var(--c-ink-soft); }
.bmi-field { display: grid; gap: 0.5rem; min-width: 0; }
.bmi-line { display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem; }
.bmi-grid2 { display: grid; gap: 1rem; }
@media (min-width: 560px) { .bmi-grid2 { grid-template-columns: 1fr 1fr; } }

.bmi-num { direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; }
.bmi-input {
  width: 100%; min-height: 44px; padding: 0.5rem 0.75rem; font: inherit; font-size: 0.95rem;
  color: var(--c-ink); background: var(--c-surface); border: 2px solid var(--c-line); border-radius: 10px;
}
.bmi-input:hover { border-color: var(--c-ink-soft); }
input.bmi-num { text-align: center; }
.bmi-range { width: 100%; accent-color: var(--c-ink); cursor: pointer; }

/* Selectable options */
.bmi-seg { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.bmi-acts { display: grid; gap: 0.5rem; }
.bmi-opt {
  min-height: 46px; padding: 0.6rem 0.8rem; font: inherit; font-size: 0.92rem; font-weight: 700; text-align: center;
  color: var(--c-ink); background: var(--c-surface); border: 2px solid var(--c-line); border-radius: 10px; cursor: pointer;
  transition: background-color .15s, color .15s, border-color .15s;
}
.bmi-opt--row { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; text-align: start; }
.bmi-opt--row span { font-size: 0.78rem; font-weight: 500; color: var(--c-ink-soft); }
.bmi-opt:hover { border-color: var(--c-ink); }
.bmi-opt[aria-checked="true"] { color: var(--c-on-ink); background: var(--c-ink); border-color: var(--c-ink); }
.bmi-opt[aria-checked="true"] span { color: inherit; opacity: 0.85; }

/* Result: orange is a background only, text stays ink */
.bmi-result { padding: 1.25rem; background: var(--c-signal); color: var(--c-on-signal); border-radius: 14px; display: grid; gap: 0.9rem; }
.bmi-result-top { display: flex; justify-content: space-between; align-items: center; margin: 0; font-size: 0.85rem; font-weight: 700; }
.bmi-tag { padding: 0.1rem 0.65rem; font-size: 0.78rem; font-weight: 800; border: 2px solid var(--c-on-signal); border-radius: 999px; }
.bmi-big { margin: 0; display: flex; align-items: baseline; gap: 0.5rem; }
.bmi-big .bmi-num { font-size: 3.4rem; font-weight: 800; line-height: 1; }
.bmi-unit { font-size: 0.9rem; font-weight: 700; }
.bmi-cat { margin: 0; font-size: 1.05rem; font-weight: 800; }

.bmi-gauge { display: grid; gap: 0.35rem; }
.bmi-ticks { position: relative; height: 1rem; font-size: 0.72rem; font-weight: 700; }
.bmi-ticks span { position: absolute; transform: translateX(-50%); }
[dir="rtl"] .bmi-ticks span { transform: translateX(50%); }
.bmi-bar { position: relative; display: flex; height: 0.9rem; gap: 2px; direction: rtl; }
.bmi-bar i { display: block; height: 100%; background: rgba(13, 13, 13, 0.25); border-radius: 3px; }
.bmi-bar i.is-active { background: var(--c-on-signal); }
.bmi-pointer {
  position: absolute; top: -5px; width: 4px; height: calc(100% + 10px);
  background: var(--c-on-signal); border: 1px solid var(--c-signal); border-radius: 2px;
  transform: translateX(50%); transition: inset-inline-start .3s;
}

.bmi-advice { margin: 0; padding: 0.7rem 0.8rem; font-size: 0.85rem; line-height: 1.8; border: 2px solid var(--c-on-signal); border-radius: 10px; }

.bmi-actions { display: flex; gap: 0.5rem; }
.bmi-btn {
  flex: 1; min-height: 44px; padding: 0.5rem 0.9rem; font: inherit; font-size: 0.9rem; font-weight: 700;
  color: var(--c-on-signal); background: transparent; border: 2px solid var(--c-on-signal); border-radius: 10px; cursor: pointer;
}
.bmi-btn:hover { background: rgba(13, 13, 13, 0.12); }
.bmi-btn--ink { background: var(--c-on-signal); color: var(--c-signal); }
.bmi-btn--ink:hover { background: var(--c-on-signal); opacity: 0.88; }
.bmi-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* Ideal weight + calories */
.bmi-range-box { margin: 0; display: grid; gap: 0.25rem; padding: 0.8rem; text-align: center; border: 2px solid var(--c-line); border-radius: 10px; }
.bmi-range-box strong { font-size: 1.5rem; font-weight: 800; }
.bmi-range-box small { font-size: 0.8rem; font-weight: 500; }
.bmi-rows, .bmi-cals { margin: 0; }
.bmi-row, .bmi-cal { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding-block: 0.65rem; border-block-start: 1px solid var(--c-line); font-size: 0.88rem; }
.bmi-row dt { color: var(--c-ink-soft); }
.bmi-row dd, .bmi-cal dd { margin: 0; font-weight: 700; }
.bmi-cal dt { display: grid; gap: 0.1rem; }
.bmi-cal dt span { font-size: 0.76rem; color: var(--c-ink-soft); }
.bmi-cal dd { font-size: 1rem; white-space: nowrap; }

.bmi-disclaimer { margin: 2rem auto 0; max-width: 70ch; padding-inline-start: 0.8rem; border-inline-start: 2px solid var(--c-line); font-size: 0.8rem; line-height: 1.8; color: var(--c-ink-soft); }

/* Focus, motion, print */
.bmi button:focus-visible, .bmi input:focus-visible {
  outline: 3px solid var(--c-signal); outline-offset: 2px;
}
.bmi-result button:focus-visible { outline-color: var(--c-on-signal); }
@media (prefers-reduced-motion: reduce) { .bmi * { transition: none !important; } }
@media print { .bmi-noprint { display: none !important; } }
`;