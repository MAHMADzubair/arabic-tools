"use client";

/**
 * components/BmiCalculator.jsx
 * Qemlo redesign v2 — glossy orange / ink, SVG icons, arc gauge, steppers,
 * sticky mobile result bar, dark + light, mobile-first.
 * Calculation logic is IDENTICAL to the original (BMI, WHO categories, ideal weight,
 * BMR Mifflin-St Jeor, TDEE, water, copy text).
 */
import { useState, useMemo, useId } from "react";

/* ─── WHO BMI Categories ─────────────────────────────────────────────────── */
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

/* Gauge scale: BMI 14 → 0, BMI 42 → 100 */
const G_MIN = 14;
const G_MAX = 42;
const pct = (v) => ((Math.min(G_MAX, Math.max(G_MIN, v)) - G_MIN) / (G_MAX - G_MIN)) * 100;
const GAUGE_STOPS = [14, 18.5, 25, 30, 35, 42];
const GAUGE_TICKS = [18.5, 25, 30, 35];

/* Arc geometry (semicircle, low BMI on the right to match RTL reading) */
const CX = 120, CY = 120, R = 90;
const polar = (p, r) => {
  const t = p * Math.PI;
  return [CX + r * Math.cos(t), CY - r * Math.sin(t)];
};
const arcPath = (p1, p2, r) => {
  const [x1, y1] = polar(p1, r);
  const [x2, y2] = polar(p2, r);
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 0 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const ICONS = {
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  ruler: <><path d="M3 17 17 3l4 4L7 21z" /><path d="m7 13 2 2M10 10l2 2M13 7l2 2" /></>,
  bolt: <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7z" />,
  flame: <path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z" />,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  drop: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="3" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  print: <><path d="M7 9V4h10v5" /><rect x="4" y="9" width="16" height="8" rx="2" /><path d="M7 14h10v6H7z" /></>,
  alert: <><path d="M12 3 2.5 20h19L12 3z" /><path d="M12 10v4M12 17h.01" /></>,
  sparkle: <path d="m12 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />,
  heart: <path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  arrow: <path d="m6 9 6 6 6-6" />,
  scale: <><rect x="3.5" y="4" width="17" height="16" rx="4" /><path d="M8 10a4 4 0 0 1 8 0M12 10l1.5-2" /></>,
};

function Icon({ name, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {ICONS[name]}
    </svg>
  );
}

function CardTitle({ icon, children }) {
  return (
    <span className="bmi-h2">
      <span className="bmi-tile"><Icon name={icon} /></span>
      <span>{children}</span>
    </span>
  );
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const round1 = (v) => Math.round(v * 10) / 10;

/** Number input with − / + buttons (big touch targets on mobile). */
function Stepper({ id, value, min, max, step = 1, onChange, label }) {
  const bump = (d) => onChange(round1(clamp((Number(value) || min) + d, min, max)));
  return (
    <div className="bmi-step">
      <button type="button" className="bmi-step-btn" aria-label={`زيادة ${label}`} onClick={() => bump(step)}>
        <Icon name="plus" size={18} />
      </button>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bmi-input bmi-num"
      />
      <button type="button" className="bmi-step-btn" aria-label={`تقليل ${label}`} onClick={() => bump(-step)}>
        <Icon name="minus" size={18} />
      </button>
    </div>
  );
}

export default function BmiCalculator() {
  const uid = useId();
  const gid = `g${uid.replace(/[^a-zA-Z0-9]/g, "")}`;
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

  const isActivePreset = (p) =>
    p.gender === gender && p.height === Number(height) && p.weight === Number(weight) &&
    p.age === Number(age) && p.activity === activity;

  const handleCopy = () => {
    if (!stats) return;
    const text = `📊 تقرير فحص مؤشر كتلة الجسم (BMI):
• مؤشر كتلة الجسم: ${stats.bmi} (${stats.category.label})
• الطول: ${height} سم | الوزن: ${weight} كجم | الجنس: ${gender === "male" ? "ذكر" : "أنثى"}
• نطاق الوزن الطبيعي المثالي: من ${stats.minIdealWeight} إلى ${stats.maxIdealWeight} كجم
• حالة الوزن: ${stats.weightStatus === "ideal"
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

  // Display-only helpers
  const hPct = ((clamp(Number(height) || 100, 100, 230) - 100) / 130) * 100;
  const wPct = ((clamp(Number(weight) || 30, 30, 200) - 30) / 170) * 100;

  let scale = null;
  if (stats) {
    const w = Number(weight);
    const lo = Math.min(w, stats.minIdealWeight) - 6;
    const hi = Math.max(w, stats.maxIdealWeight) + 6;
    const at = (v) => ((v - lo) / (hi - lo)) * 100;
    scale = { zoneStart: at(stats.minIdealWeight), zoneWidth: at(stats.maxIdealWeight) - at(stats.minIdealWeight), me: at(w) };
  }

  const gap = 0.012;
  const needleDeg = stats ? -(stats.gaugePercent / 100) * 180 : 0;

  return (
    <div className="bmi" dir="rtl">
      <style>{CSS}</style>

      {/* Header */}
      <header className="bmi-head">
        <p className="bmi-badge"><Icon name="bolt" size={14} />معايير منظمة الصحة العالمية (WHO)</p>
        <h1 className="bmi-title">حاسبة مؤشر كتلة الجسم (BMI) والوزن المثالي</h1>
        <p className="bmi-sub">
          احسب مؤشر كتلة جسمك بدقة، وتعرف على وزنك المثالي ونطاق السعرات اليومية واحتياج الماء بأسلوب علمي وصحي متكامل.
        </p>
      </header>

      {/* Presets */}
      <section className="bmi-presets" aria-label="نماذج للتجربة السريعة">
        <p className="bmi-label bmi-with-ico"><span className="bmi-ico"><Icon name="sparkle" size={18} /></span>نماذج وحالات شائعة للتجربة السريعة</p>
        <div className="bmi-chips">
          {PRESETS.map((p, idx) => (
            <button key={idx} type="button" onClick={() => handleApplyPreset(p)} className="bmi-chip" aria-pressed={isActivePreset(p)}>
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
            <legend className="bmi-legend"><CardTitle icon="user">الجنس والعمر</CardTitle></legend>
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
              <Stepper id={`${uid}-age`} value={age} min={10} max={120} onChange={setAge} label="العمر" />
            </div>
          </fieldset>

          {/* 2 */}
          <fieldset className="bmi-card">
            <legend className="bmi-legend"><CardTitle icon="ruler">الطول والوزن الحالي</CardTitle></legend>
            <div className="bmi-grid2">
              <div className="bmi-field">
                <div className="bmi-line">
                  <label className="bmi-label" htmlFor={`${uid}-height`}>الطول (سم)</label>
                  <strong className="bmi-val bmi-num">{height} سم</strong>
                </div>
                <input
                  type="range"
                  min="100"
                  max="230"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="bmi-range"
                  style={{ "--p": `${hPct}%` }}
                  aria-label="الطول بالسنتيمتر (شريط التمرير)"
                />
                <Stepper id={`${uid}-height`} value={height} min={100} max={230} onChange={setHeight} label="الطول" />
              </div>

              <div className="bmi-field">
                <div className="bmi-line">
                  <label className="bmi-label" htmlFor={`${uid}-weight`}>الوزن (كجم)</label>
                  <strong className="bmi-val bmi-num">{weight} كجم</strong>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="bmi-range"
                  style={{ "--p": `${wPct}%` }}
                  aria-label="الوزن بالكيلوغرام (شريط التمرير)"
                />
                <Stepper id={`${uid}-weight`} value={weight} min={30} max={250} onChange={setWeight} label="الوزن" />
              </div>
            </div>
          </fieldset>

          {/* 3 */}
          <fieldset className="bmi-card">
            <legend className="bmi-legend"><CardTitle icon="flame">مستوى النشاط البدني اليومي</CardTitle></legend>
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

          {/* Sticky mini result (mobile/tablet only) */}
          {stats && (
            <a href={`#${gid}-result`} className="bmi-mini bmi-noprint" aria-label="الانتقال إلى النتيجة">
              <span className="bmi-mini-num bmi-num">{stats.bmi}</span>
              <span className="bmi-mini-txt">
                <small>مؤشر كتلة الجسم</small>
                <strong>{stats.category.label}</strong>
              </span>
              <span className="bmi-mini-go"><Icon name="arrow" size={18} /></span>
            </a>
          )}
        </div>

        {/* ───────── Results ───────── */}
        <div className="bmi-stack bmi-sticky">
          <section id={`${gid}-result`} className="bmi-result" aria-live="polite" aria-label="النتيجة">
            <p className="bmi-result-top">
              <span>مؤشر كتلة الجسم (BMI)</span>
              <span className="bmi-tag">{gender === "male" ? "ذكر" : "أنثى"}</span>
            </p>

            {stats ? (
              <>
                {/* Arc gauge */}
                <div className="bmi-gauge">
                  <div className="bmi-arc">
                    <svg viewBox="0 0 240 134" role="img" aria-label={`مؤشر كتلة الجسم ${stats.bmi} — ${stats.category.label}`}>
                      <defs>
                        <linearGradient id={`${gid}-g`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0" stopColor="#FFB070" />
                          <stop offset="1" stopColor="#FF5B04" />
                        </linearGradient>
                      </defs>
                      {GAUGE_STOPS.slice(0, -1).map((s, i, arr) => {
                        const p1 = pct(s) / 100 + (i > 0 ? gap : 0);
                        const p2 = pct(GAUGE_STOPS[i + 1]) / 100 - (i < arr.length - 1 ? gap : 0);
                        return (
                          <path
                            key={s}
                            d={arcPath(p1, p2, R)}
                            fill="none"
                            strokeWidth="16"
                            stroke={i === activeIdx ? `url(#${gid}-g)` : "#2E2E2B"}
                          />
                        );
                      })}
                      {GAUGE_TICKS.map((t) => {
                        const [x, y] = polar(pct(t) / 100, R + 17);
                        return (
                          <text key={t} x={x} y={y + 3} textAnchor="middle" fontSize="10" fontWeight="800" fill="#B4B4AC">{t}</text>
                        );
                      })}
                      <g className="bmi-needle" style={{ transform: `rotate(${needleDeg}deg)`, transformOrigin: `${CX}px ${CY}px` }}>
                        <line x1={CX + R - 26} y1={CY} x2={CX + R + 9} y2={CY} stroke="#F5F5F2" strokeWidth="4" strokeLinecap="round" />
                      </g>
                    </svg>
                    <div className="bmi-arc-c">
                      <span className="bmi-big-n bmi-num">{stats.bmi}</span>
                      <span className="bmi-unit">كجم/م²</span>
                    </div>
                  </div>
                  <p className="bmi-cat">{stats.category.label}</p>
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
                <Icon name={copied ? "check" : "copy"} size={18} />
                {copied ? "تم نسخ التقرير" : "نسخ النتيجة"}
              </button>
              <button type="button" onClick={() => window.print()} className="bmi-btn">
                <Icon name="print" size={18} />
                طباعة
              </button>
              <span className="bmi-sr" role="status">{copied ? "تم نسخ التقرير" : ""}</span>
            </div>
          </section>

          {stats && (
            <section className="bmi-card" aria-label="الوزن المثالي">
              <h2 className="bmi-h2-wrap"><CardTitle icon="target">الوزن المثالي لطولك ({height} سم)</CardTitle></h2>

              <div className="bmi-range-box">
                <span className="bmi-label">نطاق الوزن الطبيعي الصحي</span>
                <strong className="bmi-num">{stats.minIdealWeight} – {stats.maxIdealWeight} <small>كجم</small></strong>

                <div className="bmi-scale" aria-hidden="true">
                  <div className="bmi-zone" style={{ insetInlineStart: `${scale.zoneStart}%`, width: `${scale.zoneWidth}%` }} />
                  <span className="bmi-me" style={{ insetInlineStart: `${scale.me}%` }}><i>{weight}</i></span>
                </div>

                <span className="bmi-hint">
                  متوسط الوزن المثالي الموصى به: <strong className="bmi-num">{stats.midpointIdealWeight} كجم</strong>
                </span>
              </div>

              <p className={`bmi-status bmi-status--${stats.weightStatus}`}>
                <span className="bmi-ico"><Icon name="scale" size={20} /></span>
                <span>
                  {stats.weightStatus === "ideal"
                    ? "وزنك الحالي مثالي تماماً"
                    : stats.weightStatus === "lose"
                      ? `تحتاج لخسارة ${stats.diffWeight} كجم`
                      : `تحتاج لزيادة ${stats.diffWeight} كجم`}
                </span>
              </p>

              <div className="bmi-tiles">
                <div className="bmi-stat">
                  <span className="bmi-ico"><Icon name="drop" size={20} /></span>
                  <small>احتياج الماء اليومي</small>
                  <strong>{stats.waterLiters} لتر</strong>
                  <em>({stats.waterGlasses} أكواب)</em>
                </div>
                <div className="bmi-stat">
                  <span className="bmi-ico"><Icon name="flame" size={20} /></span>
                  <small>الأيض الأساسي (BMR)</small>
                  <strong className="bmi-num">{stats.bmr}</strong>
                  <em>سعرة</em>
                </div>
              </div>
            </section>
          )}

          {stats && (
            <section className="bmi-card" aria-label="السعرات الحرارية اليومية">
              <h2 className="bmi-h2-wrap"><CardTitle icon="heart">دليل السعرات الحرارية اليومية</CardTitle></h2>
              <dl className="bmi-cals">
                {[
                  { t: "تثبيت الوزن الحالي", s: "احتياج الطاقة اليومي (TDEE)", v: stats.tdee },
                  { t: "خسارة الوزن (0.5 كجم/أسبوع)", s: "عجز صحي 500 سعرة يومياً", v: stats.loseCalories },
                  { t: "زيادة الوزن وبناء العضلات", s: "فائض صحي 500 سعرة يومياً", v: stats.gainCalories },
                ].map((c) => (
                  <div className="bmi-cal" key={c.t}>
                    <dt>
                      <strong>{c.t}</strong>
                      <span>{c.s}</span>
                    </dt>
                    <dd><span className="bmi-num">{c.v}</span> سعرة</dd>
                    <div className="bmi-cal-bar" aria-hidden="true">
                      <i style={{ width: `${Math.max(4, Math.min(100, (c.v / stats.gainCalories) * 100))}%` }} />
                    </div>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>

      <p className="bmi-disclaimer">
        <span className="bmi-ico"><Icon name="alert" size={18} /></span>
        <span>
          تنبيه طبي: مؤشر كتلة الجسم هو معيار استرشادي عام وفق منظمة الصحة العالمية (WHO)، ولا يفرّق بدقة بين كتلة الدهون والكتلة العضلية (خاصة للرياضيين والحوامل). استشر طبيباً أو أخصائي تغذية لخطة شخصية.
        </span>
      </p>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const CSS = `
.bmi{
  --f-bg:#F5F5F2; --f-surface:#FFFFFF; --f-line:#E1E1DA; --f-ink:#0D0D0D; --f-t2:#55554F; --f-t3:#8A8A82;
  --f-soft:rgba(13,13,13,.04); --f-shadow:0 1px 0 rgba(255,255,255,.9) inset, 0 12px 32px -18px rgba(13,13,13,.28);
}
@media (prefers-color-scheme:dark){
  .bmi{
    --f-bg:#0D0D0D; --f-surface:#171717; --f-line:#2A2A27; --f-ink:#F5F5F2; --f-t2:#B4B4AC; --f-t3:#7C7C75;
    --f-soft:rgba(255,255,255,.05); --f-shadow:0 1px 0 rgba(255,255,255,.06) inset, 0 16px 36px -20px rgba(0,0,0,.9);
  }
}
.bmi{
  --c-ink:var(--text,var(--ink,var(--f-ink)));
  --c-soft:var(--text-2,var(--ink-soft,var(--f-t2)));
  --c-dim:var(--text-3,var(--f-t3));
  --c-surface:var(--surface,var(--f-surface));
  --c-bg:var(--bg,var(--f-bg));
  --c-line:var(--border,var(--line,var(--f-line)));
  --c-orange:var(--orange,var(--signal,#FF5B04));
  --c-on:var(--on-orange,var(--on-signal,#0D0D0D));
  --c-gloss:linear-gradient(165deg,#FF9A52 0%,#FF5B04 46%,#E14600 100%);
  --c-gloss-sh:inset 0 1px 0 rgba(255,255,255,.5), inset 0 -3px 8px rgba(120,30,0,.25), 0 14px 28px -12px rgba(255,91,4,.6);
  --c-r:26px; --c-r-sm:16px;
  max-width:64rem; margin-inline:auto; padding:1.25rem .75rem 2.5rem; color:var(--c-ink); font-family:inherit; line-height:1.6;
  overflow-x:clip;
}
@media (min-width:640px){ .bmi{ padding:3rem 1.5rem 4rem; } }
.bmi *,.bmi *::before,.bmi *::after{ box-sizing:border-box; }
.bmi h1,.bmi h2,.bmi p,.bmi dl,.bmi dd{ margin:0; }
.bmi :focus-visible{ outline:3px solid var(--c-orange); outline-offset:2px; }
.bmi-result :focus-visible{ outline-color:#0D0D0D; }
.bmi-sr{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
.bmi-num{ direction:ltr; unicode-bidi:isolate; font-variant-numeric:tabular-nums; }
.bmi-ico{ flex:none; display:inline-flex; color:var(--c-orange); }
.bmi-with-ico{ display:flex; align-items:center; gap:.5rem; }

/* Header */
.bmi-head{ margin-block-end:1.5rem; display:grid; gap:.75rem; justify-items:start; }
.bmi-badge{ display:inline-flex; align-items:center; gap:.375rem; padding:.375rem 1rem; border-radius:999px; background:var(--c-gloss); color:var(--c-on); box-shadow:var(--c-gloss-sh); font-size:.8125rem; font-weight:800; }
.bmi-title{ font-size:clamp(1.5rem,5.5vw,2.5rem); font-weight:800; line-height:1.3; }
.bmi-sub{ max-width:60ch; font-size:.9375rem; line-height:1.9; color:var(--c-soft); }

/* Presets */
.bmi-presets{ margin-block-end:1.25rem; padding:1rem; border:1px dashed var(--c-dim); border-radius:var(--c-r); background:var(--c-surface); display:grid; gap:.75rem; min-width:0; }
.bmi-chips{ display:flex; flex-wrap:wrap; gap:.5rem; }
.bmi-chip{
  min-height:2.75rem; padding:.375rem .875rem; font:inherit; font-size:.8125rem; font-weight:700; text-align:start; white-space:nowrap;
  color:var(--c-ink); background:var(--c-bg); border:1.5px solid var(--c-line); border-radius:999px; cursor:pointer;
  transition:border-color .15s, background-color .15s, color .15s, transform .15s;
}
.bmi-chip:hover{ border-color:var(--c-orange); transform:translateY(-1px); }
.bmi-chip[aria-pressed="true"]{ background:var(--c-gloss); color:var(--c-on); border-color:transparent; box-shadow:var(--c-gloss-sh); }
@media (max-width:639px){
  .bmi-chips{ flex-wrap:nowrap; overflow-x:auto; margin-inline:-1rem; padding:.25rem 1rem .5rem; scroll-snap-type:x proximity; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
  .bmi-chips::-webkit-scrollbar{ display:none; }
  .bmi-chip{ flex:none; scroll-snap-align:start; }
}

/* Layout */
.bmi-cols{ display:grid; gap:1.25rem; grid-template-columns:minmax(0,1fr); }
@media (min-width:900px){ .bmi-cols{ grid-template-columns:minmax(0,3fr) minmax(0,2fr); gap:1.75rem; align-items:start; } }
.bmi-stack{ display:grid; gap:1.25rem; min-width:0; align-content:start; }
@media (min-width:900px){ .bmi-sticky{ position:sticky; top:1.5rem; } }

/* Cards */
.bmi-card{
  margin:0; padding:1rem; background:var(--c-surface); border:1px solid var(--c-line); border-radius:var(--c-r);
  display:grid; gap:1rem; min-width:0; box-shadow:var(--f-shadow); transition:border-color .2s, box-shadow .2s;
}
@media (min-width:640px){ .bmi-card{ padding:1.5rem; } }
.bmi-card:hover{ border-color:var(--c-orange); box-shadow:0 0 0 3px color-mix(in srgb,var(--c-orange) 20%,transparent), var(--f-shadow); }
.bmi-legend{ padding:0; width:100%; float:inline-start; margin-block-end:.25rem; }
fieldset.bmi-card > legend + *{ clear:both; }
.bmi-h2-wrap{ font-size:1rem; }
.bmi-h2{ display:flex; align-items:center; gap:.75rem; font-size:1.0625rem; font-weight:800; line-height:1.5; }
.bmi-tile{
  flex:none; width:2.5rem; height:2.5rem; display:inline-flex; align-items:center; justify-content:center;
  border-radius:14px; background:var(--c-gloss); color:var(--c-on); box-shadow:var(--c-gloss-sh);
}
.bmi-label{ font-size:.875rem; font-weight:700; }
.bmi-hint{ font-size:.8125rem; line-height:1.8; color:var(--c-soft); }
.bmi-field{ display:grid; gap:.75rem; min-width:0; }
.bmi-line{ display:flex; justify-content:space-between; align-items:center; gap:.5rem; }
.bmi-val{ padding:.125rem .75rem; border-radius:999px; background:#0D0D0D; color:#FF9A52; font-size:.8125rem; font-weight:800; }
@media (prefers-color-scheme:dark){ .bmi-val{ background:#2A2A27; } }
.bmi-grid2{ display:grid; gap:1.5rem; grid-template-columns:minmax(0,1fr); }
@media (min-width:560px){ .bmi-grid2{ grid-template-columns:repeat(2,minmax(0,1fr)); gap:1.25rem; } }

/* Inputs + stepper */
.bmi-input{
  width:100%; min-width:0; min-height:3.25rem; padding:.5rem .5rem; font:inherit; font-size:1rem; font-weight:800;
  color:var(--c-ink); background:var(--c-bg); border:1.5px solid var(--c-line); border-radius:var(--c-r-sm);
  transition:border-color .15s, box-shadow .15s;
}
.bmi-input:hover{ border-color:var(--c-dim); }
.bmi-input:focus-visible{ outline:none; border-color:var(--c-orange); box-shadow:0 0 0 4px color-mix(in srgb,var(--c-orange) 28%,transparent); }
input.bmi-num{ text-align:center; }
.bmi-step{ display:grid; grid-template-columns:3.25rem minmax(0,1fr) 3.25rem; gap:.5rem; align-items:stretch; }
.bmi-step-btn{
  min-height:3.25rem; display:inline-flex; align-items:center; justify-content:center; padding:0;
  color:var(--c-ink); background:var(--c-surface); border:1.5px solid var(--c-line); border-radius:var(--c-r-sm); cursor:pointer;
  transition:border-color .15s, background-color .15s, color .15s; touch-action:manipulation;
}
.bmi-step-btn:hover{ border-color:var(--c-orange); color:var(--c-orange); }
.bmi-step-btn:active{ background:var(--c-gloss); color:var(--c-on); border-color:transparent; }
.bmi-step input[type=number]::-webkit-outer-spin-button,.bmi-step input[type=number]::-webkit-inner-spin-button{ -webkit-appearance:none; margin:0; }
.bmi-step input[type=number]{ -moz-appearance:textfield; appearance:textfield; }

/* Range slider (orange progress) */
.bmi-range{ -webkit-appearance:none; appearance:none; width:100%; height:2.25rem; background:transparent; cursor:pointer; touch-action:pan-y; }
.bmi-range::-webkit-slider-runnable-track{ height:.5rem; border-radius:999px; background:linear-gradient(to left,var(--c-orange) var(--p,50%),var(--c-line) var(--p,50%)); }
.bmi-range::-moz-range-track{ height:.5rem; border-radius:999px; background:var(--c-line); }
.bmi-range::-moz-range-progress{ height:.5rem; border-radius:999px; background:var(--c-orange); }
.bmi-range::-webkit-slider-thumb{
  -webkit-appearance:none; width:1.75rem; height:1.75rem; margin-top:-.625rem; border-radius:50%; border:3px solid #fff;
  background:var(--c-gloss); box-shadow:0 4px 12px -2px rgba(255,91,4,.7);
}
.bmi-range::-moz-range-thumb{ width:1.5rem; height:1.5rem; border-radius:50%; border:3px solid #fff; background:var(--c-gloss); box-shadow:0 4px 12px -2px rgba(255,91,4,.7); }
.bmi-range:focus-visible{ outline-offset:4px; border-radius:999px; }

/* Selectable options */
.bmi-seg{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.25rem; padding:.25rem; border:1px solid var(--c-line); border-radius:999px; background:var(--c-bg); }
.bmi-acts{ display:grid; gap:.5rem; }
.bmi-opt{
  position:relative; min-height:3rem; padding:.625rem .875rem; font:inherit; font-size:.9375rem; font-weight:800; text-align:center;
  color:var(--c-ink); background:var(--c-surface); border:1.5px solid var(--c-line); border-radius:var(--c-r-sm); cursor:pointer;
  transition:border-color .15s, transform .15s;
}
.bmi-seg .bmi-opt{ border:0; border-radius:999px; background:transparent; }
.bmi-opt--row{ display:flex; flex-direction:column; align-items:flex-start; gap:.125rem; text-align:start; overflow:hidden; }
@media (min-width:480px){ .bmi-opt--row{ flex-direction:row; justify-content:space-between; align-items:center; gap:.75rem; } }
.bmi-opt--row span{ font-size:.8125rem; font-weight:600; color:var(--c-soft); }
.bmi-opt:hover{ border-color:var(--c-orange); }
.bmi-seg .bmi-opt:hover{ background:var(--f-soft); }
.bmi-opt[aria-checked="true"]{ background:var(--c-gloss); color:var(--c-on); border-color:transparent; box-shadow:var(--c-gloss-sh); }
.bmi-opt[aria-checked="true"] span{ color:inherit; opacity:.85; }
.bmi-opt[aria-checked="true"]::before{ content:""; position:absolute; inset:0 0 55% 0; background:linear-gradient(180deg,rgba(255,255,255,.3),rgba(255,255,255,0)); pointer-events:none; }

/* Sticky mini result (hidden on desktop) */
.bmi-mini{
  position:sticky; bottom:.75rem; z-index:5; display:flex; align-items:center; gap:.75rem; padding:.625rem .75rem;
  background:#0D0D0D; color:#F5F5F2; border:1px solid #2E2E2B; border-radius:20px; text-decoration:none;
  box-shadow:0 18px 40px -12px rgba(0,0,0,.55);
}
.bmi-mini-num{ flex:none; min-width:3.5rem; padding:.375rem .5rem; text-align:center; border-radius:14px; background:var(--c-gloss); color:#0D0D0D; font-size:1.375rem; font-weight:800; line-height:1.2; box-shadow:var(--c-gloss-sh); }
.bmi-mini-txt{ flex:1; min-width:0; display:grid; line-height:1.4; }
.bmi-mini-txt small{ font-size:.75rem; color:#B4B4AC; }
.bmi-mini-txt strong{ font-size:.875rem; font-weight:800; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.bmi-mini-go{ flex:none; width:2.25rem; height:2.25rem; display:inline-flex; align-items:center; justify-content:center; border-radius:50%; background:#2A2A27; color:#FF9A52; }
@media (min-width:900px){ .bmi-mini{ display:none; } }

/* Result (glossy orange, ink text) */
.bmi-result{
  position:relative; overflow:hidden; padding:1.25rem 1rem; background:var(--c-gloss); color:#0D0D0D;
  border-radius:var(--c-r); display:grid; gap:1rem; box-shadow:var(--c-gloss-sh); scroll-margin-top:1rem;
}
@media (min-width:640px){ .bmi-result{ padding:1.5rem; } }
.bmi-result::before{ content:""; position:absolute; inset:0 0 62% 0; pointer-events:none; background:linear-gradient(180deg,rgba(255,255,255,.34),rgba(255,255,255,0)); }
.bmi-result>*{ position:relative; }
.bmi-result-top{ display:flex; justify-content:space-between; align-items:center; gap:.5rem; font-size:.9375rem; font-weight:800; }
.bmi-tag{ padding:.125rem .75rem; font-size:.8125rem; font-weight:800; border:1.5px solid #0D0D0D; border-radius:999px; background:rgba(255,255,255,.2); }

.bmi-gauge{ display:grid; gap:.25rem; padding:1rem .75rem .875rem; border-radius:22px; background:#0D0D0D; color:#F5F5F2; text-align:center; }
.bmi-arc{ position:relative; width:100%; max-width:22rem; margin-inline:auto; }
.bmi-arc svg{ display:block; width:100%; height:auto; overflow:visible; }
.bmi-needle{ transition:transform .6s cubic-bezier(.2,.8,.2,1); }
.bmi-arc-c{ position:absolute; inset-inline:0; bottom:3%; display:grid; justify-items:center; line-height:1; }
.bmi-big-n{ font-size:clamp(2.5rem,13vw,3.5rem); font-weight:800; }
.bmi-unit{ margin-top:.25rem; font-size:.75rem; font-weight:700; color:#B4B4AC; }
.bmi-cat{ font-size:1.0625rem; font-weight:800; line-height:1.5; color:#FF9A52; padding-top:.25rem; }

.bmi-advice{ padding:.75rem .875rem; font-size:.875rem; line-height:1.9; border:1.5px solid rgba(13,13,13,.55); border-radius:var(--c-r-sm); background:rgba(255,255,255,.14); }

.bmi-actions{ display:flex; flex-wrap:wrap; gap:.5rem; }
.bmi-btn{
  flex:1 1 9rem; display:inline-flex; align-items:center; justify-content:center; gap:.5rem; min-height:3rem; padding:.5rem .875rem;
  font:inherit; font-size:.9375rem; font-weight:800; color:#0D0D0D; background:transparent;
  border:1.5px solid #0D0D0D; border-radius:var(--c-r-sm); cursor:pointer; transition:background-color .15s, color .15s;
}
.bmi-btn:hover{ background:rgba(13,13,13,.12); }
.bmi-btn--ink{ background:#0D0D0D; color:#fff; }
.bmi-btn--ink:hover{ background:transparent; color:#0D0D0D; }

/* Ideal weight */
.bmi-range-box{ display:grid; gap:.5rem; padding:1rem; text-align:center; border:1px dashed var(--c-dim); border-radius:var(--c-r-sm); background:var(--f-soft); }
.bmi-range-box strong{ font-size:1.625rem; font-weight:800; }
.bmi-range-box small{ font-size:.8125rem; font-weight:600; }
.bmi-scale{ position:relative; height:.75rem; margin:1.25rem .25rem .5rem; border-radius:999px; background:var(--c-line); }
.bmi-zone{ position:absolute; top:0; bottom:0; border-radius:999px; background:var(--c-gloss); }
.bmi-me{ position:absolute; top:50%; width:0; height:0; }
.bmi-me i{
  position:absolute; bottom:.55rem; transform:translateX(-50%); padding:.0625rem .5rem; border-radius:8px; background:#0D0D0D; color:#F5F5F2;
  font-style:normal; font-size:.75rem; font-weight:800; white-space:nowrap; direction:ltr;
}
[dir="rtl"] .bmi-me i{ transform:translateX(50%); }
.bmi-me::before{ content:""; position:absolute; top:-.55rem; width:.875rem; height:.875rem; transform:translateX(-50%); border-radius:50%; background:#0D0D0D; border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,.4); }
[dir="rtl"] .bmi-me::before{ transform:translateX(50%); }
.bmi-status{ display:flex; align-items:center; gap:.625rem; padding:.75rem .875rem; border-radius:var(--c-r-sm); background:var(--f-soft); border:1px solid var(--c-line); font-size:.9375rem; font-weight:800; }
.bmi-status--ideal{ border-color:var(--c-orange); }
.bmi-tiles{ display:grid; gap:.75rem; grid-template-columns:repeat(2,minmax(0,1fr)); }
.bmi-stat{ display:grid; gap:.125rem; justify-items:start; padding:.875rem; border:1px solid var(--c-line); border-radius:var(--c-r-sm); background:var(--c-bg); min-width:0; }
.bmi-stat small{ font-size:.8125rem; color:var(--c-soft); line-height:1.5; }
.bmi-stat strong{ font-size:1.25rem; font-weight:800; line-height:1.3; }
.bmi-stat em{ font-style:normal; font-size:.8125rem; color:var(--c-soft); }

/* Calories */
.bmi-cals{ margin:0; display:grid; }
.bmi-cal{ display:grid; grid-template-columns:minmax(0,1fr) auto; gap:.5rem 1rem; align-items:center; padding-block:.875rem; border-block-start:1px dashed var(--c-line); }
.bmi-cal dt{ display:grid; gap:.125rem; min-width:0; font-size:.9375rem; }
.bmi-cal dt span{ font-size:.8125rem; color:var(--c-soft); }
.bmi-cal dd{ font-size:1.0625rem; font-weight:800; white-space:nowrap; text-align:end; }
.bmi-cal-bar{ grid-column:1 / -1; height:.5rem; border-radius:999px; background:var(--f-soft); border:1px solid var(--c-line); overflow:hidden; }
.bmi-cal-bar i{ display:block; height:100%; border-radius:999px; background:var(--c-gloss); }

.bmi-disclaimer{
  margin:1.75rem auto 0; max-width:70ch; padding:.875rem 1rem; display:flex; gap:.625rem; align-items:flex-start;
  border:1px dashed var(--c-dim); border-radius:var(--c-r-sm); font-size:.8125rem; line-height:1.9; color:var(--c-soft);
}

/* Small phones */
@media (max-width:420px){
  .bmi-card,.bmi-presets,.bmi-result{ border-radius:22px; }
  .bmi-tiles{ grid-template-columns:minmax(0,1fr); }
  .bmi-step{ grid-template-columns:3rem minmax(0,1fr) 3rem; }
  .bmi-btn{ flex:1 1 100%; }
  .bmi-cal{ grid-template-columns:minmax(0,1fr); }
  .bmi-cal dd{ text-align:start; }
}
@media (prefers-reduced-motion:reduce){ .bmi *{ transition:none !important; } .bmi-chip:hover{ transform:none; } }
@media print{
  .bmi-noprint,.bmi-presets,.bmi-mini{ display:none !important; }
  .bmi-result,.bmi-gauge,.bmi-tile,.bmi-zone,.bmi-cal-bar i,.bmi-badge,.bmi-arc svg{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .bmi-card:hover{ box-shadow:none; }
}
`;