"use client";

/**
 * components/KaffaraCalculator.jsx
 * Qemlo style: glossy orange + ink, 26px cards, 16px controls, SVG icons.
 * The calculation block (useMemo) and the report text are unchanged.
 * Changes: design and responsive layout, accessibility, mobile sticky bar,
 * copy fallback, free typing in the count field, and data/notes refreshed
 * after checking 2026 fatwa sources (see hand-off notes).
 */
import { useState, useMemo, useId, useEffect, useRef } from "react";
import { kaffaraTypes, countryMealPresets } from "@/lib/kaffaraData";

/* ─── Icons (inline SVG, no emoji) ──────────────────────────────────────── */

const ICONS = {
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  scale: (<><path d="M12 3v18M6 21h12M5 7h14" /><path d="M5 7l-3 7a3.5 3.5 0 0 0 6 0z" /><path d="M19 7l-3 7a3.5 3.5 0 0 0 6 0z" /></>),
  scroll: (<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h6" /></>),
  sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>),
  kaaba: (<><path d="M4 8l8-4 8 4v10l-8 4-8-4z" /><path d="M4 8l8 4 8-4M12 12v10" /></>),
  coins: (<><circle cx="9" cy="9" r="6" /><path d="M15.5 9.5A6 6 0 1 1 9.5 15.5" /><path d="M9 7v4" /></>),
  bowl: (<><path d="M3 11h18a9 9 0 0 1-18 0z" /><path d="M8 7c0-1.5 1-2 1-3.5M13 7c0-1.5 1-2 1-3.5" /></>),
  users: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8" /></>),
  minus: <path d="M5 12h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  copy: (<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>),
  info: (<><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>),
  alert: (<><path d="M12 3l10 18H2z" /><path d="M12 10v5" /><path d="M12 18h.01" /></>),
  book: (<><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5" /></>),
};

function Icon({ name, size = 20 }) {
  return (
    <svg className="kf-ico" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {ICONS[name]}
    </svg>
  );
}

/* ─── Data ──────────────────────────────────────────────────────────────── */



function formatNumber(n, decimals = 1) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Whole amounts without trailing ".00"
function formatMoney(n) {
  const r = Math.round(n * 100) / 100;
  return formatNumber(r, Number.isInteger(r) ? 0 : 2);
}

// Arabic number agreement for "مسكين" (1: مسكين واحد، 2: مسكينان، 3-10: مساكين، 11+: مسكيناً)
function masakeen(n) {
  if (n === 1) return "مسكين واحد";
  if (n === 2) return "مسكينان";
  if (n >= 3 && n <= 10) return `${n} مساكين`;
  return `${n} مسكيناً`;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function KaffaraCalculator() {
  const unitsId = useId();
  const costId = useId();

  // Active type
  const [selectedTypeId, setSelectedTypeId] = useState("fasting_fidya");

  // Units count (number of days, oaths, etc.)
  const [unitsCount, setUnitsCount] = useState(30);
  const [unitsText, setUnitsText] = useState("30");

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
  const copyTimer = useRef(null);
  const resultRef = useRef(null);
  useEffect(() => () => clearTimeout(copyTimer.current), []);

  // Selected type object
  const activeType = kaffaraTypes.find((t) => t.id === selectedTypeId) || kaffaraTypes[0];

  // Selected country object
  const activeCountry = countryMealPresets.find((c) => c.code === selectedCountryCode) || countryMealPresets[0];

  const setUnits = (n) => { setUnitsCount(n); setUnitsText(String(n)); };

  // Handle type change
  const handleTypeSelect = (type) => {
    setSelectedTypeId(type.id);
    setUnits(type.defaultUnits);
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

  // Copy summary (text unchanged)
  const handleCopy = async () => {
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

    let ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); ok = true; }
    } catch (e) { ok = false; }
    if (!ok) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", "");
        ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch (e) { ok = false; }
    }
    if (ok) {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 3000);
    }
  };

  const scrollToResult = () => {
    const el = resultRef.current;
    if (!el) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const bigNumber = calcMode === "cash" ? formatMoney(result.totalCash) : formatNumber(result.totalFoodKg);
  const bigUnit = calcMode === "cash" ? currency : "كجم";

  return (
    <div className="kf" dir="rtl">
      <style>{css}</style>

      {/* Header */}
      <header className="kf-hero kf-noprint">
        <div className="kf-hero-top">
          <span className="kf-tile kf-tile-lg kf-gloss"><Icon name="scale" size={26} /></span>
          <p className="kf-badge"><span className="kf-dot" aria-hidden="true" />حساب الفدية والكفارات الشرعية</p>
        </div>
        <div>
          <h1 className="kf-h1">حاسبة الكفارات والفدية الشرعية</h1>
          <p className="kf-lead">
            احسب مقدار كفارة اليمين، وفدية صيام رمضان للعاجز والمريض، وكفارة النذر، وفدية محظورات الإحرام،
            عيناً بالأرز (بالكيلوجرام) أو نقداً بالعملة.
          </p>
        </div>
        <ul className="kf-chips" aria-label="طرق الإخراج">
          <li className="kf-chip"><Icon name="coins" size={16} />نقداً بالقيمة</li>
          <li className="kf-chip"><Icon name="bowl" size={16} />عيناً بالأرز</li>
          <li className="kf-chip"><Icon name="users" size={16} />عدد المساكين تلقائياً</li>
        </ul>
      </header>

      <div className="kf-layout">
        {/* ── Inputs ─────────────────────────────────────────────────────── */}
        <div className="kf-main kf-noprint">
          <section className="kf-card" aria-labelledby="kf-s1">
            <div className="kf-sec-head">
              <span className="kf-tile kf-gloss"><Icon name="book" size={20} /></span>
              <h2 className="kf-h2" id="kf-s1">اختر نوع الكفارة أو الفدية</h2>
            </div>

            <div className="kf-types" role="group" aria-labelledby="kf-s1">
              {kaffaraTypes.map((type) => {
                const on = selectedTypeId === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    className="kf-type"
                    aria-pressed={on}
                    onClick={() => handleTypeSelect(type)}
                  >
                    <span className="kf-tile"><Icon name={type.icon} size={20} /></span>
                    <span className="kf-type-body">
                      <span className="kf-type-top">
                        <span className="kf-type-title">{type.title}</span>
                        {on && <span className="kf-type-check" aria-hidden="true"><Icon name="check" size={18} /></span>}
                      </span>
                      <span className="kf-type-desc">{type.shortDesc}</span>
                      <span className="kf-tag">
                        {type.personsPerUnit === 1 ? "مسكين لكل يوم" : `${type.personsPerUnit} مساكين`}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="kf-card" aria-labelledby="kf-s2">
            <div className="kf-sec-head">
              <span className="kf-tile kf-gloss"><Icon name="users" size={20} /></span>
              <h2 className="kf-h2" id="kf-s2">العدد وطريقة الإخراج</h2>
            </div>

            <div className="kf-stack">
              <div>
                <label className="kf-label" htmlFor={unitsId}>{activeType.unitLabel}</label>
                <div className="kf-stepper">
                  <button
                    type="button"
                    className="kf-btn kf-btn-icon"
                    aria-label={`إنقاص: ${activeType.unitLabel}`}
                    onClick={() => setUnits(Math.max(1, unitsCount - 1))}
                  >
                    <Icon name="minus" size={20} />
                  </button>
                  <input
                    id={unitsId}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={unitsText}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setUnitsText(raw);
                      const n = parseInt(raw, 10);
                      if (n >= 1) setUnitsCount(n);
                    }}
                    onBlur={() => setUnitsText(String(unitsCount))}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="kf-input kf-center"
                  />
                  <button
                    type="button"
                    className="kf-btn kf-btn-icon"
                    aria-label={`زيادة: ${activeType.unitLabel}`}
                    onClick={() => setUnits(unitsCount + 1)}
                  >
                    <Icon name="plus" size={20} />
                  </button>
                </div>
              </div>

              <fieldset className="kf-fieldset">
                <legend className="kf-label">طريقة إخراج الإطعام</legend>
                <div className="kf-seg kf-seg-2">
                  <button
                    type="button"
                    className="kf-mode"
                    aria-pressed={calcMode === "cash"}
                    onClick={() => setCalcMode("cash")}
                  >
                    <span className="kf-tile"><Icon name="coins" size={20} /></span>
                    <span className="kf-mode-body">
                      <span className="kf-mode-t">نقداً بالقيمة</span>
                      <span className="kf-mode-s">تكلفة وجبة مسكين</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="kf-mode"
                    aria-pressed={calcMode === "food"}
                    onClick={() => setCalcMode("food")}
                  >
                    <span className="kf-tile"><Icon name="bowl" size={20} /></span>
                    <span className="kf-mode-body">
                      <span className="kf-mode-t">طعاماً عيناً</span>
                      <span className="kf-mode-s">أرز بالكيلوجرام</span>
                    </span>
                  </button>
                </div>
              </fieldset>

              {calcMode === "cash" && (
                <div className="kf-stack kf-cash">
                  <fieldset className="kf-fieldset">
                    <legend className="kf-label">متوسط تكلفة وجبة المسكين حسب الدولة</legend>
                    <div className="kf-countries">
                      {countryMealPresets.map((c) => {
                        const on = selectedCountryCode === c.code && !isCustomMealCost;
                        return (
                          <button
                            key={c.code}
                            type="button"
                            className="kf-country"
                            aria-pressed={on}
                            onClick={() => handleCountrySelect(c)}
                          >
                            <span className="kf-country-n">{c.country}</span>
                            <span className="kf-country-c"><bdi>{c.cost} {c.currency}</bdi></span>
                          </button>
                        );
                      })}
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
                    <div className="kf-input-wrap">
                      <input
                        id={costId}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="any"
                        dir="ltr"
                        value={isCustomMealCost ? customCostInput : mealCost}
                        onChange={(e) => {
                          setIsCustomMealCost(true);
                          setCustomCostInput(e.target.value);
                        }}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="kf-input kf-input-bare"
                        aria-describedby={`${costId}-note`}
                      />
                      <span className="kf-sym" aria-hidden="true">{currency}</span>
                    </div>
                    <p className="kf-small" id={`${costId}-note`}>{activeCountry.note}</p>
                  </div>
                </div>
              )}

              {calcMode === "food" && (
                <aside className="kf-note">
                  <span className="kf-mark" aria-hidden="true"><Icon name="info" size={14} /></span>
                  <p className="kf-note-text">تُحسب الحبوب بالأرز: نصف صاع لكل مسكين (≈ <bdi>{kgRicePerPerson}</bdi> كجم). غيّر إلى «نقداً» إن كانت جهتك تعتمد قيمة محددة.</p>
                </aside>
              )}
            </div>
          </section>
        </div>

        {/* ── Output (sticky on desktop) ─────────────────────────────────── */}
        <div className="kf-aside" ref={resultRef}>
          <section className="kf-result" aria-labelledby="kf-res-label">
            <div className="kf-result-head kf-gloss" aria-live="polite" aria-atomic="true">
              <p className="kf-result-label" id="kf-res-label">
                {calcMode === "cash"
                  ? `المبلغ المطلوب نقداً لإطعام ${masakeen(result.totalPersonsToFeed)}`
                  : `إجمالي الأرز المطلوب لإطعام ${masakeen(result.totalPersonsToFeed)}`}
              </p>
              <p className="kf-fig">
                <bdi className="kf-pop" key={`${bigNumber}-${bigUnit}`}>{bigNumber}</bdi>
                <span className="kf-cur">{bigUnit}</span>
              </p>
            </div>
            <p className="kf-result-foot">
              <Icon name="users" size={18} />
              <span>المستحقون: {masakeen(result.totalPersonsToFeed)} (<bdi>{result.units} × {activeType.personsPerUnit}</bdi>)</span>
            </p>
          </section>

          <section className="kf-card" aria-labelledby="kf-s3">
            <div className="kf-res-head kf-noprint">
              <div className="kf-sec-head">
                <span className="kf-tile kf-gloss"><Icon name="scroll" size={20} /></span>
                <h2 className="kf-h2" id="kf-s3">تفاصيل الحساب</h2>
              </div>
              <button type="button" className="kf-btn kf-btn-sm" onClick={handleCopy}>
                <Icon name={copied ? "check" : "copy"} size={16} />
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

            <aside className="kf-ruling">
              <h3 className="kf-ruling-title"><Icon name="book" size={16} />الحكم والضابط الشرعي</h3>
              <p>{activeType.rulingNote}</p>
              {activeType.extraNote && <p className="kf-small">{activeType.extraNote}</p>}
            </aside>

            {activeType.fastingAlternative && (
              <aside className="kf-alt">
                <h3 className="kf-ruling-title"><Icon name="alert" size={16} />تنبيه: حكم العجز المالي التام</h3>
                <p>{activeType.fastingAlternative}</p>
                <p className="kf-small">
                  لا يُنتقل إلى الصيام في كفارة اليمين إلا عند العجز المالي الحقيقي عن إطعام أو كسوة 10 مساكين.
                </p>
              </aside>
            )}

            <aside className="kf-note">
              <span className="kf-mark" aria-hidden="true"><Icon name="info" size={14} /></span>
              <p className="kf-note-text">
                <strong>اختلاف المقادير:</strong> يختلف مقدار الإطعام بحسب المذهب والجهة المفتية. تقدّر الحاسبة نصف صاع من الأرز
                (≈ 1.35 كجم) للمسكين. للمقارنة: يحدد مجلس الإمارات للإفتاء الشرعي 3.25 كجم من البر لكل مسكين لعام 2026،
                وتذكر دار الإفتاء المصرية أن المد عند الشافعية ≈ 510 جم. اعتمد ما تفتي به جهتك.
              </p>
            </aside>
          </section>
        </div>
      </div>

      {/* Mobile sticky result bar */}
      <div className="kf-bar kf-noprint">
        <div className="kf-bar-info">
          <span className="kf-bar-l">المطلوب إخراجه</span>
          <span className="kf-bar-v"><bdi>{bigNumber}</bdi> {bigUnit}</span>
        </div>
        <button type="button" className="kf-btn kf-btn-orange kf-gloss" onClick={scrollToResult}>التفاصيل</button>
      </div>
    </div>
  );
}

// ─── Styles: Qemlo (glossy orange + ink) ───────────────────────────────────────
// Reads the site's --bg / --surface / --orange tokens when present, with fallbacks.
const css = `
.kf{
  --k-bg:var(--bg,#f3f3f1); --k-surface:var(--surface,#ffffff); --k-orange:var(--orange,#ff5a1f);
  --k-ink:#0a0a0a; --k-on-ink:#ffffff; --k-on-orange:#0a0a0a;
  --k-text2:#4a4a47; --k-soft:#efefec; --k-line:rgba(10,10,10,.14);
  --k-r-card:26px; --k-r-ctl:16px;
  --k-shadow:0 1px 0 rgba(10,10,10,.04),0 14px 34px -20px rgba(10,10,10,.28);
  max-width:70rem; margin:0 auto; padding:.875rem .75rem calc(6.5rem + env(safe-area-inset-bottom,0px));
  color:var(--k-ink); background:var(--k-bg); font-family:inherit; line-height:1.6; display:grid; gap:1rem;
  -webkit-text-size-adjust:100%; text-size-adjust:100%; overflow-wrap:break-word;
}
@media (min-width:720px){ .kf{ padding:1.5rem; border-radius:32px; } }
@media (min-width:960px){ .kf{ padding-bottom:1.5rem; } }
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]) .kf{
    --k-bg:var(--bg,#0b0b0c); --k-surface:var(--surface,#161618);
    --k-ink:#f5f5f4; --k-on-ink:#0a0a0a; --k-text2:#c6c6c2; --k-soft:#202023; --k-line:rgba(255,255,255,.16);
    --k-shadow:0 1px 0 rgba(255,255,255,.04),0 14px 34px -20px rgba(0,0,0,.8);
  }
}
:root[data-theme="dark"] .kf{
  --k-bg:var(--bg,#0b0b0c); --k-surface:var(--surface,#161618);
  --k-ink:#f5f5f4; --k-on-ink:#0a0a0a; --k-text2:#c6c6c2; --k-soft:#202023; --k-line:rgba(255,255,255,.16);
  --k-shadow:0 1px 0 rgba(255,255,255,.04),0 14px 34px -20px rgba(0,0,0,.8);
}
.kf *,.kf *::before,.kf *::after{ box-sizing:border-box; }
.kf h1,.kf h2,.kf h3,.kf p,.kf dl,.kf dd,.kf ul{ margin:0; padding:0; }
:where(.kf) :where(button,input){ font:inherit; color:inherit; }
.kf :focus-visible{ outline:3px solid var(--k-orange); outline-offset:3px; }
.kf bdi{ unicode-bidi:isolate; font-variant-numeric:tabular-nums; }
.kf-ico{ flex:none; display:block; }
.kf-sr{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
.kf-stack{ display:grid; gap:1.25rem; }

/* Glossy orange */
.kf-gloss{
  background:var(--k-orange);
  background:linear-gradient(180deg,color-mix(in srgb,var(--k-orange) 76%,#fff) 0%,var(--k-orange) 48%,color-mix(in srgb,var(--k-orange) 84%,#000) 100%);
  color:var(--k-on-orange);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 0 rgba(0,0,0,.14),0 10px 22px -12px rgba(255,90,31,.7);
  print-color-adjust:exact; -webkit-print-color-adjust:exact;
}
.kf :focus-visible.kf-gloss{ outline-color:var(--k-ink); }

/* Hero */
.kf-hero{ display:grid; gap:1rem; padding:1.25rem; background:var(--k-surface); border:1px solid var(--k-line); border-radius:var(--k-r-card); box-shadow:var(--k-shadow); }
@media (min-width:640px){ .kf-hero{ padding:1.75rem; } }
.kf-hero-top{ display:flex; align-items:center; justify-content:space-between; gap:.75rem; flex-wrap:wrap; }
.kf-badge{ display:inline-flex; align-items:center; gap:.5rem; padding:.375rem .875rem; border-radius:999px; background:var(--k-ink); color:var(--k-on-ink); font-size:.8125rem; font-weight:700; }
.kf-dot{ width:.5rem; height:.5rem; border-radius:50%; background:var(--k-orange); }
.kf-h1{ font-size:clamp(1.375rem,5vw,2rem); font-weight:800; line-height:1.45; }
.kf-lead{ margin-top:.375rem; font-size:.9375rem; line-height:1.9; color:var(--k-text2); max-width:44rem; }
.kf-chips{ list-style:none; display:flex; flex-wrap:wrap; gap:.5rem; }
.kf-chip{ display:inline-flex; align-items:center; gap:.4rem; padding:.375rem .875rem; border-radius:999px; background:var(--k-soft); border:1px solid var(--k-line); font-size:.875rem; font-weight:600; }

/* Tiles */
.kf-tile{ flex:none; width:2.5rem; height:2.5rem; border-radius:14px; display:grid; place-items:center; }
.kf-tile-lg{ width:3.25rem; height:3.25rem; border-radius:18px; }

/* Layout */
.kf-layout{ display:grid; gap:1rem; min-width:0; }
.kf-main{ display:grid; gap:1rem; min-width:0; align-content:start; }
.kf-aside{ display:grid; gap:1rem; min-width:0; align-content:start; scroll-margin-top:1rem; }
@media (min-width:960px){
  .kf-layout{ grid-template-columns:minmax(0,1fr) 24rem; column-gap:1.25rem; align-items:start; }
  .kf-aside{
    position:sticky; top:1rem; max-height:calc(100vh - 2rem); max-height:calc(100dvh - 2rem);
    overflow-y:auto; overscroll-behavior:contain; padding:.25rem; margin:-.25rem;
  }
}

/* Cards */
.kf-card{ background:var(--k-surface); border:1px solid var(--k-line); border-radius:var(--k-r-card); padding:1.125rem; display:grid; gap:1rem; box-shadow:var(--k-shadow); min-width:0; }
@media (min-width:640px){ .kf-card{ padding:1.5rem; } }
.kf-sec-head{ display:flex; align-items:center; gap:.75rem; min-width:0; }
.kf-h2{ font-size:1.0625rem; font-weight:800; line-height:1.5; }
.kf-res-head{ display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:.75rem; }

/* Type cards */
.kf-types{ display:grid; gap:.625rem; grid-template-columns:minmax(0,1fr); }
@media (min-width:640px){ .kf-types{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
.kf-types > .kf-type:last-child:nth-child(odd){ grid-column:1 / -1; }
.kf-type{
  display:grid; grid-template-columns:auto minmax(0,1fr); gap:.75rem; align-items:start; text-align:start; width:100%;
  padding:.875rem; border:1px solid var(--k-line); border-radius:20px; background:var(--k-surface); color:var(--k-ink);
  cursor:pointer; -webkit-tap-highlight-color:transparent; transition:border-color .15s;
}
.kf-type:hover{ border-color:var(--k-ink); }
.kf-type .kf-tile{ background:var(--k-soft); color:var(--k-ink); }
.kf-type-body{ display:grid; gap:.375rem; min-width:0; }
.kf-type-top{ display:flex; align-items:flex-start; justify-content:space-between; gap:.5rem; }
.kf-type-title{ font-size:.9375rem; font-weight:800; line-height:1.55; }
.kf-type-check{ flex:none; }
.kf-type-desc{ font-size:.8125rem; line-height:1.75; color:var(--k-text2); }
.kf-tag{ justify-self:start; padding:.125rem .625rem; border-radius:999px; border:1.5px solid currentColor; font-size:.75rem; font-weight:700; line-height:1.6; }
.kf-type[aria-pressed="true"],.kf-mode[aria-pressed="true"]{
  background:var(--k-orange);
  background:linear-gradient(180deg,color-mix(in srgb,var(--k-orange) 76%,#fff) 0%,var(--k-orange) 48%,color-mix(in srgb,var(--k-orange) 84%,#000) 100%);
  color:var(--k-on-orange); border-color:transparent;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 0 rgba(0,0,0,.14),0 10px 22px -12px rgba(255,90,31,.7);
}
.kf-type[aria-pressed="true"] .kf-tile,.kf-mode[aria-pressed="true"] .kf-tile{ background:#0a0a0a; color:#fff; }
.kf-type[aria-pressed="true"] .kf-type-desc,.kf-mode[aria-pressed="true"] .kf-mode-s{ color:#2a2a2a; }
.kf-type[aria-pressed="true"]:focus-visible,.kf-mode[aria-pressed="true"]:focus-visible{ outline-color:var(--k-ink); }

/* Fields */
.kf-label{ display:block; font-size:.9375rem; font-weight:800; margin-bottom:.4rem; padding:0; line-height:1.6; }
.kf-label-flush{ margin-bottom:0; }
.kf-fieldset{ border:0; margin:0; padding:0; min-width:0; }
.kf-small{ margin-top:.4rem; font-size:.8125rem; line-height:1.8; color:var(--k-text2); }
.kf-row{ display:flex; justify-content:space-between; align-items:center; gap:.75rem; margin-bottom:.4rem; }
.kf-link{ min-height:44px; padding:0; background:none; border:0; font-size:.875rem; font-weight:800; text-decoration:underline; text-underline-offset:4px; cursor:pointer; }
.kf-input{
  width:100%; min-height:3.25rem; border:1.5px solid var(--k-line); border-radius:var(--k-r-ctl); background:var(--k-surface); color:var(--k-ink);
  padding:0 1rem; font-size:1.125rem; font-weight:800; -moz-appearance:textfield; appearance:textfield;
  transition:border-color .15s, box-shadow .15s;
}
.kf-input:hover{ border-color:color-mix(in srgb,var(--k-ink) 50%,transparent); }
.kf-input:focus{ outline:none; border-color:var(--k-orange); box-shadow:0 0 0 4px color-mix(in srgb,var(--k-orange) 28%,transparent); }
.kf-input::-webkit-outer-spin-button,.kf-input::-webkit-inner-spin-button{ -webkit-appearance:none; margin:0; }
.kf-center{ text-align:center; font-size:1.25rem; }
.kf-input-wrap{
  display:flex; align-items:stretch; min-height:3.25rem; border-radius:var(--k-r-ctl); border:1.5px solid var(--k-line);
  background:var(--k-surface); overflow:hidden; transition:border-color .15s, box-shadow .15s;
}
.kf-input-wrap:hover{ border-color:color-mix(in srgb,var(--k-ink) 50%,transparent); }
.kf-input-wrap:focus-within{ border-color:var(--k-orange); box-shadow:0 0 0 4px color-mix(in srgb,var(--k-orange) 28%,transparent); }
.kf-input-bare{ flex:1; min-width:0; border:0; border-radius:0; background:transparent; text-align:right; min-height:0; }
.kf-input-bare:hover,.kf-input-bare:focus{ border:0; box-shadow:none; }
.kf-sym{ flex:none; display:grid; place-items:center; padding:0 1rem; background:var(--k-soft); border-inline-start:1px solid var(--k-line); font-size:.875rem; font-weight:800; color:var(--k-text2); }
.kf-stepper{ display:grid; grid-template-columns:3.25rem minmax(0,1fr) 3.25rem; gap:.5rem; }

/* Buttons */
.kf-btn{
  display:inline-flex; align-items:center; justify-content:center; gap:.5rem; min-height:48px; padding:0 1.125rem;
  border-radius:var(--k-r-ctl); border:1.5px solid var(--k-ink); background:var(--k-surface); color:var(--k-ink);
  font-size:.9375rem; font-weight:700; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:background-color .15s, transform .1s;
}
.kf-btn:hover{ background:var(--k-soft); }
.kf-btn:active{ transform:translateY(1px); }
.kf-btn-icon{ padding:0; min-height:3.25rem; }
.kf-btn-sm{ min-height:44px; padding:0 .875rem; font-size:.875rem; }
.kf-btn-orange{ border-color:rgba(0,0,0,.22); }
.kf-btn-orange:hover{ background:var(--k-orange); filter:brightness(1.05); }

/* Mode + countries */
.kf-seg{ display:grid; gap:.5rem; }
.kf-seg-2{ grid-template-columns:repeat(2,minmax(0,1fr)); }
@media (max-width:479px){ .kf-seg-2{ grid-template-columns:minmax(0,1fr); } }
.kf-mode{
  display:grid; grid-template-columns:auto minmax(0,1fr); gap:.75rem; align-items:center; text-align:start; min-height:4rem;
  padding:.625rem .875rem; border:1px solid var(--k-line); border-radius:20px; background:var(--k-surface); color:var(--k-ink);
  cursor:pointer; -webkit-tap-highlight-color:transparent; transition:border-color .15s;
}
.kf-mode:hover{ border-color:var(--k-ink); }
.kf-mode .kf-tile{ background:var(--k-soft); color:var(--k-ink); }
.kf-mode-body{ display:grid; gap:.0625rem; min-width:0; }
.kf-mode-t{ font-size:.9375rem; font-weight:800; }
.kf-mode-s{ font-size:.8125rem; color:var(--k-text2); }
.kf-cash{ border-top:1px solid var(--k-line); padding-top:1.25rem; gap:1.25rem; }
.kf-countries{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.5rem; }
@media (min-width:640px){ .kf-countries{ grid-template-columns:repeat(4,minmax(0,1fr)); } }
.kf-country{
  display:grid; gap:.0625rem; justify-items:center; align-content:center; min-height:3.75rem; padding:.5rem; text-align:center;
  border:1px solid var(--k-line); border-radius:var(--k-r-ctl); background:var(--k-surface); color:var(--k-ink); cursor:pointer;
  -webkit-tap-highlight-color:transparent; transition:border-color .15s;
}
.kf-country:hover{ border-color:var(--k-ink); }
.kf-country-n{ font-size:.875rem; font-weight:800; line-height:1.5; }
.kf-country-c{ font-size:.8125rem; font-weight:600; color:var(--k-text2); }
.kf-country[aria-pressed="true"]{ background:var(--k-ink); color:var(--k-on-ink); border-color:var(--k-ink); }
.kf-country[aria-pressed="true"] .kf-country-c{ color:var(--k-on-ink); }
.kf-country[aria-pressed="true"] .kf-country-n::before{ content:"✓"; margin-inline-end:.3rem; }

/* Notes */
.kf-note{
  display:flex; gap:.625rem; align-items:flex-start; padding:.75rem .875rem; border-radius:var(--k-r-ctl);
  background:var(--k-soft); border:1px solid var(--k-line); border-inline-start:5px solid var(--k-orange);
}
.kf-note-text{ font-size:.875rem; line-height:1.9; color:var(--k-text2); }
.kf-note-text strong{ color:var(--k-ink); }
.kf-mark{ flex:none; width:1.5rem; height:1.5rem; display:grid; place-items:center; border-radius:50%; background:var(--k-ink); color:var(--k-on-ink); margin-top:.125rem; }

/* Result */
.kf-result{ border-radius:var(--k-r-card); overflow:hidden; background:var(--k-surface); border:1px solid var(--k-line); box-shadow:var(--k-shadow); }
.kf-result-head{ padding:1.25rem; display:grid; gap:.375rem; }
.kf-result-label{ font-size:.9375rem; font-weight:800; line-height:1.6; }
.kf-fig{ display:flex; align-items:baseline; flex-wrap:wrap; gap:.5rem; font-size:clamp(2.25rem,10vw,3rem); font-weight:800; line-height:1.2; overflow-wrap:anywhere; }
.kf-pop{ animation:kf-pop .35s ease-out; display:inline-block; }
.kf-cur{ font-size:1.0625rem; font-weight:800; }
.kf-result-foot{ display:flex; align-items:flex-start; gap:.5rem; padding:.875rem 1.25rem; font-size:.9375rem; font-weight:700; line-height:1.7; }
.kf-result-foot .kf-ico{ margin-top:.2rem; }
@keyframes kf-pop{ from{ opacity:.35; transform:translateY(5px); } to{ opacity:1; transform:none; } }

/* Details */
.kf-rows{ border:1px solid var(--k-line); border-radius:var(--k-r-ctl); overflow:hidden; }
.kf-rows > div{ display:flex; flex-wrap:wrap; justify-content:space-between; gap:.25rem 1rem; padding:.75rem .875rem; border-bottom:1px solid var(--k-line); font-size:.9rem; }
.kf-rows > div:last-child{ border-bottom:0; }
.kf-rows dt{ font-weight:600; color:var(--k-text2); }
.kf-rows dd{ font-weight:800; overflow-wrap:anywhere; }
.kf-rows-total{ background:var(--k-soft); }
.kf-rows-total dt{ color:var(--k-ink); font-weight:800; }
.kf-ruling{ border:1px solid var(--k-line); border-inline-start:5px solid var(--k-orange); border-radius:var(--k-r-ctl); padding:.875rem 1rem; font-size:.9rem; line-height:1.9; display:grid; gap:.25rem; }
.kf-alt{ border:1.5px dashed color-mix(in srgb,var(--k-ink) 45%,transparent); border-radius:var(--k-r-ctl); padding:.875rem 1rem; font-size:.9rem; line-height:1.9; display:grid; gap:.25rem; }
.kf-ruling-title{ display:flex; align-items:center; gap:.5rem; font-size:.9375rem; font-weight:800; }

/* Mobile sticky bar */
.kf-bar{
  position:fixed; left:0; right:0; bottom:0; z-index:30; display:flex; align-items:center; justify-content:space-between; gap:.75rem;
  padding:.625rem .875rem calc(.625rem + env(safe-area-inset-bottom,0px)); background:var(--k-surface);
  border-top:1px solid var(--k-line); box-shadow:0 -12px 30px -18px rgba(0,0,0,.45);
}
.kf-bar-info{ display:grid; min-width:0; }
.kf-bar-l{ font-size:.8125rem; font-weight:600; color:var(--k-text2); }
.kf-bar-v{ font-size:1.25rem; font-weight:800; overflow-wrap:anywhere; }
@media (min-width:960px){ .kf-bar{ display:none; } }

@media (prefers-reduced-motion:reduce){
  .kf *,.kf *::before,.kf *::after{ animation:none !important; transition:none !important; scroll-behavior:auto !important; }
}

@media print{
  .kf-noprint,.kf-bar{ display:none !important; }
  .kf{ padding:0; max-width:none; border-radius:0; background:#fff; color:#000; --k-ink:#000; --k-surface:#fff; --k-text2:#000; --k-line:#000; --k-soft:#fff; }
  .kf-layout{ display:block; }
  .kf-aside{ position:static; max-height:none; overflow:visible; margin:0; padding:0; }
  .kf-card,.kf-result{ box-shadow:none; }
  .kf-rows,.kf-ruling,.kf-alt{ break-inside:avoid; }
}
`;