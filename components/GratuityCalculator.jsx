"use client";

import { useState, useMemo, useEffect, useId } from "react";

/* ─── Country Labour Law Configs (calc logic unchanged) ───────────────────── */
const COUNTRIES = [
  {
    id: "sa",
    name: "السعودية",
    currency: "SAR",
    symbol: "ر.س",
    law: "نظام العمل السعودي (المادتان 84 و85)",
    minYearsNote: "تُستحق من اليوم الأول عند الإنهاء، وبعد سنتين عند الاستقالة",
    defaultWageType: "total",
    calc: (months, salary, reason) => {
      const years = months / 12;
      if (years <= 0) return { amount: 0, fullAmount: 0, percent: 0, note: "يرجى تحديد مدة خدمة صالحة" };

      const y1 = Math.min(years, 5);
      const y2 = Math.max(0, years - 5);
      const fullGratuity = salary * 0.5 * y1 + salary * 1.0 * y2;

      let percentage = 1.0;
      let note = "استحقاق كامل للمكافأة (المادة 84)";

      if (reason === "resign") {
        if (years < 2) {
          percentage = 0;
          note = "لا يستحق العامل مكافأة إذا استقال قبل إتمام سنتين (المادة 85)";
        } else if (years < 5) {
          percentage = 1 / 3;
          note = "يستحق ثلث المكافأة (33.3٪) للاستقالة بين سنتين و5 سنوات";
        } else if (years < 10) {
          percentage = 2 / 3;
          note = "يستحق ثلثي المكافأة (66.7٪) للاستقالة بين 5 و10 سنوات";
        } else {
          percentage = 1.0;
          note = "يستحق المكافأة كاملة (100٪) للاستقالة بعد 10 سنوات خدمة";
        }
      } else if (reason === "female_special") {
        percentage = 1.0;
        note = "استحقاق كامل استثنائي (المادة 87): خلال 6 أشهر من الزواج أو 3 أشهر من الوضع";
      }

      const finalAmount = fullGratuity * percentage;
      return {
        amount: Math.round(finalAmount),
        fullAmount: Math.round(fullGratuity),
        percent: Math.round(percentage * 100),
        y1Portion: Math.round(salary * 0.5 * y1),
        y2Portion: Math.round(salary * 1.0 * y2),
        note,
      };
    },
    tiers: [
      { label: "السنوات الـ 5 الأولى", rate: "نصف أجر شهري عن كل سنة" },
      { label: "السنوات التالية (بعد الـ 5)", rate: "أجر شهر كامل عن كل سنة" },
      { label: "حالة الاستقالة (أقل من سنتين)", rate: "لا يستحق شيئاً" },
      { label: "حالة الاستقالة (2 إلى 5 سنوات)", rate: "ثلث المكافأة (33.3٪)" },
      { label: "حالة الاستقالة (5 إلى 10 سنوات)", rate: "ثلثا المكافأة (66.7٪)" },
      { label: "حالة الاستقالة (أكثر من 10 سنوات)", rate: "المكافأة كاملة (100٪)" },
    ],
  },
  {
    id: "ae",
    name: "الإمارات",
    currency: "AED",
    symbol: "د.إ",
    law: "مرسوم بقانون اتحادي رقم 33 لسنة 2021",
    minYearsNote: "يشترط إتمام سنة عمل كاملة مستمرة",
    defaultWageType: "basic",
    calc: (months, salary, reason) => {
      const years = months / 12;
      if (years < 1) {
        return { amount: 0, fullAmount: 0, percent: 0, y1Portion: 0, y2Portion: 0, note: "لا يستحق مكافأة لخدمة أقل من سنة كاملة (المادة 51)" };
      }

      const dailyWage = salary / 30;
      const y1 = Math.min(years, 5);
      const y2 = Math.max(0, years - 5);

      const y1Val = dailyWage * 21 * y1;
      const y2Val = dailyWage * 30 * y2;
      let gratuity = y1Val + y2Val;

      const cap = salary * 24;
      const isCapped = gratuity > cap;
      if (isCapped) gratuity = cap;

      return {
        amount: Math.round(gratuity),
        fullAmount: Math.round(y1Val + y2Val),
        percent: 100,
        y1Portion: Math.round(y1Val),
        y2Portion: Math.round(y2Val),
        note: isCapped
          ? "تم تطبيق الحد الأقصى القانوني للمكافأة (أجر سنتين - 24 شهراً)"
          : "21 يوماً عن كل سنة للأولى حتى 5، و30 يوماً لكل سنة تالية (الراتب الأساسي)",
      };
    },
    tiers: [
      { label: "السنوات 1 إلى 5", rate: "21 يوم أجر أساسي عن كل سنة" },
      { label: "أكثر من 5 سنوات", rate: "30 يوم أجر أساسي عن كل سنة إضافية" },
      { label: "الحد الأقصى القانوني", rate: "أجر سنتين (24 شهراً أساسياً)" },
      { label: "الاستقالة في القانون الجديد", rate: "لا خصم على المستحقات بعد إتمام سنة" },
    ],
  },
  {
    id: "kw",
    name: "الكويت",
    currency: "KWD",
    symbol: "د.ك",
    law: "قانون العمل في القطاع الأهلي رقم 6 لسنة 2010",
    minYearsNote: "يشترط إتمام سنة خدمة كاملة للمستحقات",
    defaultWageType: "basic",
    calc: (months, salary, reason) => {
      const years = months / 12;
      if (years < 1) {
        return { amount: 0, fullAmount: 0, percent: 0, y1Portion: 0, y2Portion: 0, note: "لا تستحق مكافأة لخدمة أقل من سنة" };
      }

      const dailyWage = salary / 26;
      const y1 = Math.min(years, 5);
      const y2 = Math.max(0, years - 5);

      const y1Val = dailyWage * 15 * y1;
      const y2Val = salary * 1.0 * y2;
      let fullGratuity = y1Val + y2Val;

      const cap = salary * 18;
      if (fullGratuity > cap) fullGratuity = cap;

      let percentage = 1.0;
      let note = "استحقاق كامل للمكافأة (المادة 51)";

      if (reason === "resign") {
        if (years < 3) {
          percentage = 0;
          note = "لا يستحق العامل مكافأة إذا استقال قبل 3 سنوات خدمة";
        } else if (years < 5) {
          percentage = 0.5;
          note = "يستحق نصف المكافأة (50٪) للاستقالة بين 3 و5 سنوات";
        } else if (years < 10) {
          percentage = 2 / 3;
          note = "يستحق ثلثي المكافأة (66.7٪) للاستقالة بين 5 و10 سنوات";
        } else {
          percentage = 1.0;
          note = "يستحق المكافأة كاملة (100٪) للاستقالة بعد 10 سنوات";
        }
      }

      const finalAmount = fullGratuity * percentage;
      return {
        amount: Math.round(finalAmount),
        fullAmount: Math.round(fullGratuity),
        percent: Math.round(percentage * 100),
        y1Portion: Math.round(y1Val),
        y2Portion: Math.round(y2Val),
        note,
      };
    },
    tiers: [
      { label: "السنوات الـ 5 الأولى", rate: "15 يوم أجر (على أساس 26 يوم/شهر)" },
      { label: "السنوات التالية", rate: "شهر أجر كامل عن كل سنة" },
      { label: "الحد الأقصى القانوني", rate: "أجر سنة ونصف (18 شهراً)" },
      { label: "الاستقالة (3 إلى 5 سنوات)", rate: "50٪ من المكافأة" },
      { label: "الاستقالة (5 إلى 10 سنوات)", rate: "ثلثا المكافأة (66.7٪)" },
      { label: "الاستقالة (10 سنوات فأكثر)", rate: "المكافأة كاملة (100٪)" },
    ],
  },
  {
    id: "qa",
    name: "قطر",
    currency: "QAR",
    symbol: "ر.ق",
    law: "قانون العمل القطري رقم 14 لسنة 2004",
    minYearsNote: "يشترط إتمام سنة خدمة كاملة مستمرة",
    defaultWageType: "basic",
    calc: (months, salary, reason) => {
      const years = months / 12;
      if (years < 1) {
        return { amount: 0, fullAmount: 0, percent: 0, y1Portion: 0, y2Portion: 0, note: "يشترط إتمام سنة خدمة كاملة (المادة 54)" };
      }

      const weeklyWage = salary / (52 / 12);
      const gratuity = weeklyWage * 3 * years;

      return {
        amount: Math.round(gratuity),
        fullAmount: Math.round(gratuity),
        percent: 100,
        y1Portion: Math.round(gratuity),
        y2Portion: 0,
        note: "أجر 3 أسابيع أساسية عن كل سنة خدمة مستمرة (المادة 54)",
      };
    },
    tiers: [
      { label: "الحد الأدنى للخدمة", rate: "سنة كاملة مستمرة" },
      { label: "معدل المكافأة السنوي", rate: "3 أسابيع أجر أساسي عن كل سنة" },
      { label: "أجزاء السنة", rate: "تُحتسب بنسبة المدة المقضية" },
    ],
  },
  {
    id: "om",
    name: "عُمان",
    currency: "OMR",
    symbol: "ر.ع",
    law: "قانون العمل العُماني الجديد (مرسوم سلطاني 53/2023)",
    minYearsNote: "تُحتسب لغير العمانيين غير الخاضعين لصندوق الحماية",
    defaultWageType: "basic",
    calc: (months, salary, reason) => {
      const years = months / 12;
      if (years <= 0) return { amount: 0, fullAmount: 0, percent: 0, y1Portion: 0, y2Portion: 0, note: "حدد مدة الخدمة" };

      const gratuity = salary * 1.0 * years;

      return {
        amount: Math.round(gratuity),
        fullAmount: Math.round(gratuity),
        percent: 100,
        y1Portion: Math.round(gratuity),
        y2Portion: 0,
        note: "أجر شهر أساسي كامل عن كل سنة خدمة وفق القانون الجديد 2023",
      };
    },
    tiers: [
      { label: "القانون الجديد 2023", rate: "أجر شهر كامل عن كل سنة خدمة" },
      { label: "أجزاء السنة", rate: "تُحتسب بنسبة ما قضاه الموظف" },
    ],
  },
  {
    id: "bh",
    name: "البحرين",
    currency: "BHD",
    symbol: "د.ب",
    law: "قانون العمل في القطاع الأهلي رقم 36 لسنة 2012",
    minYearsNote: "يشترط إتمام سنة خدمة كاملة (المادة 116)",
    defaultWageType: "basic",
    calc: (months, salary, reason) => {
      const years = months / 12;
      if (years < 1) {
        return { amount: 0, fullAmount: 0, percent: 0, y1Portion: 0, y2Portion: 0, note: "يشترط إتمام سنة خدمة كاملة" };
      }

      const y1 = Math.min(years, 3);
      const y2 = Math.max(0, years - 3);

      const y1Val = salary * 0.5 * y1;
      const y2Val = salary * 1.0 * y2;
      const gratuity = y1Val + y2Val;

      return {
        amount: Math.round(gratuity),
        fullAmount: Math.round(gratuity),
        percent: 100,
        y1Portion: Math.round(y1Val),
        y2Portion: Math.round(y2Val),
        note: "نصف أجر شهري عن أول 3 سنوات، وأجر شهر كامل عن كل سنة تالية",
      };
    },
    tiers: [
      { label: "السنوات الـ 3 الأولى", rate: "نصف أجر شهر عن كل سنة" },
      { label: "السنوات التالية (بعد 3)", rate: "أجر شهر كامل عن كل سنة" },
      { label: "الاستحقاق الجزئي", rate: "يُحسب بنسبة المدة المقضية" },
    ],
  },
  {
    id: "eg",
    name: "مصر",
    currency: "EGP",
    symbol: "ج.م",
    law: "قانون العمل المصري رقم 12 لسنة 2003 (المادة 126)",
    minYearsNote: "عند بلوغ سن الستين أو انتهاء عقد العمل القانوني",
    defaultWageType: "basic",
    calc: (months, salary, reason) => {
      const years = months / 12;
      if (years < 1) {
        return { amount: 0, fullAmount: 0, percent: 0, y1Portion: 0, y2Portion: 0, note: "يشترط إتمام سنة خدمة كاملة" };
      }

      const y1 = Math.min(years, 5);
      const y2 = Math.max(0, years - 5);

      const y1Val = salary * 0.5 * y1;
      const y2Val = salary * 1.0 * y2;
      const gratuity = y1Val + y2Val;

      return {
        amount: Math.round(gratuity),
        fullAmount: Math.round(gratuity),
        percent: 100,
        y1Portion: Math.round(y1Val),
        y2Portion: Math.round(y2Val),
        note: "نصف أجر شهر عن كل سنة من السنوات الـ 5 الأولى، وشهر كامل بعدها",
      };
    },
    tiers: [
      { label: "السنوات الـ 5 الأولى", rate: "نصف أجر شهري عن كل سنة" },
      { label: "السنوات التالية", rate: "أجر شهر كامل عن كل سنة" },
    ],
  },
];

const REASONS = [
  { id: "terminate", name: "إنهاء من صاحب العمل", desc: "فصل، انتهاء عقد محدد، أو إلغاء وظيفة" },
  { id: "resign", name: "استقالة الموظف", desc: "ترك العمل طوعاً بناءً على طلب العامل" },
  { id: "retire", name: "التقاعد وبلوغ السن", desc: "بلوغ سن التقاعد القانوني أو التقاعد المبكر" },
  { id: "mutual", name: "اتفاق مشترك / قوة قاهرة", desc: "إنهاء العقد بالتراضي أو لظروف قاهرة" },
  { id: "female_special", name: "استثناء المرأة العاملة (سعودية)", desc: "خلال 6 أشهر من الزواج أو 3 أشهر من الوضع" },
];

const PRESETS = [
  { label: "السعودية: استقالة بعد 4 سنوات", country: "sa", reason: "resign", years: 4, months: 0, salary: 10000, housing: 2500, transport: 1000 },
  { label: "السعودية: انتهاء خدمة بعد 8 سنوات", country: "sa", reason: "terminate", years: 8, months: 0, salary: 14000, housing: 3500, transport: 1000 },
  { label: "الإمارات: موظف أكمل 6 سنوات", country: "ae", reason: "terminate", years: 6, months: 0, salary: 18000, housing: 4000, transport: 1500 },
  { label: "الكويت: استقالة بعد 7 سنوات", country: "kw", reason: "resign", years: 7, months: 0, salary: 1200, housing: 300, transport: 100 },
];

function fmt(n, sym) {
  return `${Math.round(n).toLocaleString("en-US")} ${sym}`;
}

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseLocal(str) {
  if (!str) return new Date(NaN);
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/* ─── Styles (tokens: --c-* with fallbacks) ───────────────────────────────── */
const CSS = `
.gr{--bg:var(--c-bg,#F5F5F2);--ink:var(--c-ink,#0D0D0D);--ac:var(--c-accent,#FF6A1A);--sf:var(--c-surface,#FFFFFF);--mu:var(--c-muted,#55554F);--ln:var(--c-line,#0D0D0D);color:var(--ink);font-size:15px;line-height:1.6}
@media (prefers-color-scheme:dark){.gr{--bg:var(--c-bg,#0D0D0D);--ink:var(--c-ink,#F5F5F2);--sf:var(--c-surface,#161616);--mu:var(--c-muted,#A8A8A0);--ln:var(--c-line,#F5F5F2)}}
.gr *{box-sizing:border-box}
.gr h1,.gr h2,.gr h3{margin:0;line-height:1.25}
.gr-col{display:flex;flex-direction:column;gap:20px}
.gr-grid{display:grid;gap:24px;grid-template-columns:1fr}
@media(min-width:1024px){.gr-grid{grid-template-columns:3fr 2fr;align-items:start}.gr-sticky{position:sticky;top:96px}}
.gr-card{background:var(--sf);border:2px solid var(--ln);padding:20px;display:flex;flex-direction:column;gap:14px}
.gr-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border-bottom:2px solid var(--ln);padding-bottom:10px}
.gr-head h2{font-size:17px;font-weight:800}
.gr-g2{display:grid;gap:12px;grid-template-columns:1fr}
@media(min-width:640px){.gr-g2{grid-template-columns:1fr 1fr}.gr-c4{grid-template-columns:repeat(4,1fr)}}
.gr-c4{display:grid;gap:8px;grid-template-columns:1fr 1fr}
.gr-label{display:block;font-size:13px;font-weight:700;margin-bottom:6px}
.gr-in{width:100%;border:1px solid var(--ln);background:var(--bg);color:var(--ink);padding:10px 12px;font:inherit;font-size:15px;border-radius:0;min-height:44px}
.gr-pre{position:relative}
.gr-pre .gr-in{padding-inline-start:44px}
.gr-pre span{position:absolute;inset-inline-start:10px;top:50%;transform:translateY(-50%);font-size:12px;font-weight:800;color:var(--mu);pointer-events:none}
.gr-in:focus-visible,.gr-tg:focus-visible,.gr-btn:focus-visible,.gr a:focus-visible{outline:3px solid var(--ac);outline-offset:2px}
.gr-tg{border:1px solid var(--ln);background:var(--sf);color:var(--ink);padding:10px 12px;text-align:right;font:inherit;font-size:13px;font-weight:600;cursor:pointer;min-height:44px}
.gr-tg small{display:block;font-weight:400;font-size:11px;color:var(--mu);margin-top:2px}
.gr-tg[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink);font-weight:800}
.gr-tg[aria-pressed="true"] small{color:var(--bg);opacity:.8}
.gr-tg.c{text-align:center}
.gr-seg{display:inline-flex;border:1px solid var(--ln)}
.gr-seg .gr-tg{border:0;min-height:36px;font-size:12px;padding:6px 12px}
.gr-seg .gr-tg+.gr-tg{border-inline-start:1px solid var(--ln)}
.gr-reasons{display:grid;gap:8px;grid-template-columns:1fr}
@media(min-width:640px){.gr-reasons{grid-template-columns:1fr 1fr}}
.gr-box{border:1px solid var(--ln);background:var(--bg);padding:12px 14px;font-size:13px}
.gr-box p{margin:0}
.gr-box .m{font-size:12px;color:var(--mu);margin-top:2px}
.gr-row{display:flex;justify-content:space-between;gap:12px;align-items:baseline}
.gr-note{border:1px dashed var(--ln);padding:12px 14px;font-size:12px}
.gr-note p{margin:4px 0 0}
.gr-hero{background:var(--ac);color:#0D0D0D;border:2px solid var(--ln);padding:22px;display:flex;flex-direction:column;gap:14px}
.gr-hero p{margin:0}
.gr-big{font-size:clamp(32px,6vw,44px);font-weight:900;line-height:1.1}
.gr-law{border:2px solid #0D0D0D;background:rgba(255,255,255,.55);padding:10px 12px;font-size:13px}
.gr-btn{border:2px solid var(--ln);background:var(--sf);color:var(--ink);padding:10px 14px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;min-height:44px;text-align:center;text-decoration:none;display:inline-flex;justify-content:center;align-items:center}
.gr-btn:hover{background:var(--ink);color:var(--bg)}
.gr-hero .gr-btn{background:#fff;color:#0D0D0D;border-color:#0D0D0D}
.gr-hero .gr-btn:hover{background:#0D0D0D;color:#fff}
.gr-line{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid var(--ln);font-size:13px}
.gr-line b{white-space:nowrap}
.gr-final{display:flex;justify-content:space-between;gap:12px;padding:12px;border:2px solid var(--ln);background:var(--ac);color:#0D0D0D;font-weight:900;font-size:15px}
.gr-tier{display:flex;justify-content:space-between;gap:10px;align-items:baseline;padding:8px 0;border-bottom:1px solid var(--ln);font-size:12px}
.gr-tier:last-child{border-bottom:0}
.gr-tier b{border:1px solid var(--ln);padding:2px 8px;font-size:11px;text-align:left}
.gr-sub{margin:0 0 6px;font-size:14px;font-weight:800}
.gr-link{border:3px solid var(--ln);background:var(--sf);padding:16px;display:flex;flex-direction:column;gap:10px;font-size:13px}
.gr-link p{margin:0}
.gr-link a{background:var(--ac);color:#0D0D0D;border:2px solid var(--ln);padding:10px 14px;font-weight:800;text-align:center;text-decoration:none;min-height:44px;display:flex;align-items:center;justify-content:center}
.gr-link a:hover{background:var(--ink);color:var(--bg)}
@media print{.gr-noprint{display:none!important}.gr-sticky{position:static}}
@media (prefers-reduced-motion:reduce){.gr *{transition:none!important}}
`;

/* ─── Small components ────────────────────────────────────────────────────── */
function Field({ label, children }) {
  const id = useId();
  return (
    <div>
      <label className="gr-label" htmlFor={id}>{label}</label>
      {children(id)}
    </div>
  );
}

function MoneyField({ label, value, onChange, sym }) {
  return (
    <Field label={label}>
      {(id) => (
        <div className="gr-pre">
          <span aria-hidden="true">{sym}</span>
          <input id={id} type="number" inputMode="decimal" min="0" className="gr-in" value={value}
            onChange={(e) => onChange(e.target.value)} />
        </div>
      )}
    </Field>
  );
}

function PlainField({ label, type = "number", value, onChange, min, max }) {
  return (
    <Field label={label}>
      {(id) => (
        <input id={id} type={type} min={min} max={max} className="gr-in" value={value}
          onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

function Segmented({ label, value, onChange, options }) {
  return (
    <div className="gr-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" className="gr-tg c" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Head({ title, children }) {
  return (
    <div className="gr-head">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function GratuityCalculator({ initialCountry = "sa" }) {
  const [countryId, setCountryId] = useState(initialCountry);
  const [reasonId, setReasonId] = useState("terminate");
  const [wageBaseType, setWageBaseType] = useState("total");
  const [basicSalary, setBasicSalary] = useState(8000);
  const [housingAllw, setHousingAllw] = useState(2000);
  const [transportAllw, setTransportAllw] = useState(800);
  const [otherAllw, setOtherAllw] = useState(0);

  const [durationMode, setDurationMode] = useState("dates");
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState("");
  const [manualYears, setManualYears] = useState(5);
  const [manualMonths, setManualMonths] = useState(0);

  const [copied, setCopied] = useState(false);

  // Local date set on the client only (no UTC off-by-one, no hydration mismatch)
  useEffect(() => { setEndDate(todayLocal()); }, []);

  const country = COUNTRIES.find((c) => c.id === countryId) || COUNTRIES[0];
  const reason = REASONS.find((r) => r.id === reasonId) || REASONS[0];

  const selectCountry = (id) => {
    const c = COUNTRIES.find((x) => x.id === id) || COUNTRIES[0];
    setCountryId(c.id);
    setWageBaseType(c.defaultWageType);
    if (c.id !== "sa" && reasonId === "female_special") setReasonId("terminate");
  };

  const duration = useMemo(() => {
    if (durationMode === "manual") {
      const y = Math.max(0, Number(manualYears) || 0);
      const m = Math.max(0, Math.min(11, Number(manualMonths) || 0));
      const total = y * 12 + m;
      return {
        totalMonths: total, years: y, months: m,
        decimalYears: Number((total / 12).toFixed(2)),
        label: `${y} سنة ${m > 0 ? `و${m} شهر` : ""}`,
      };
    }

    if (!startDate || !endDate) return { totalMonths: 0, years: 0, months: 0, decimalYears: 0, label: "" };
    const s = parseLocal(startDate);
    const e = parseLocal(endDate);
    if (e <= s) return { totalMonths: 0, years: 0, months: 0, decimalYears: 0, label: "تاريخ النهاية يجب أن يكون بعد البداية" };

    let diffMonths = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    if (e.getDate() < s.getDate()) diffMonths -= 1;
    const safeMonths = Math.max(0, diffMonths);
    const y = Math.floor(safeMonths / 12);
    const m = safeMonths % 12;

    return {
      totalMonths: safeMonths, years: y, months: m,
      decimalYears: Number((safeMonths / 12).toFixed(2)),
      label: `${y} سنة ${m > 0 ? `و${m} شهر` : ""}`,
    };
  }, [durationMode, manualYears, manualMonths, startDate, endDate]);

  const bSalary = Math.max(0, Number(basicSalary) || 0);
  const hAllw = Math.max(0, Number(housingAllw) || 0);
  const tAllw = Math.max(0, Number(transportAllw) || 0);
  const oAllw = Math.max(0, Number(otherAllw) || 0);
  const totalSalary = bSalary + hAllw + tAllw + oAllw;
  const appliedSalary = wageBaseType === "total" ? totalSalary : bSalary;

  const result = useMemo(() => {
    if (duration.totalMonths <= 0 || appliedSalary <= 0) return null;
    return country.calc(duration.totalMonths, appliedSalary, reasonId);
  }, [country, duration.totalMonths, appliedSalary, reasonId]);

  const sym = country.symbol;

  const handleApplyPreset = (p) => {
    const c = COUNTRIES.find((x) => x.id === p.country) || COUNTRIES[0];
    setCountryId(c.id);
    setWageBaseType(c.defaultWageType);
    setReasonId(p.reason);
    setDurationMode("manual");
    setManualYears(p.years);
    setManualMonths(p.months);
    setBasicSalary(p.salary);
    setHousingAllw(p.housing);
    setTransportAllw(p.transport);
    setOtherAllw(0);
  };

  const handleCopy = () => {
    if (!result || !navigator.clipboard) return;
    const text = `نتيجة حساب مكافأة نهاية الخدمة:
• الدولة: ${country.name}
• سبب انتهاء الخدمة: ${reason.name}
• مدة الخدمة: ${duration.label} (${duration.decimalYears} سنة)
• أساس الراتب المعتمد: ${fmt(appliedSalary, sym)} (${wageBaseType === "total" ? "شامل البدلات" : "الأساسي فقط"})
• إجمالي المكافأة المستحقة: ${fmt(result.amount, sym)}
• نسبة الاستحقاق: ${result.percent}%
• ملاحظة: ${result.note}

تم الحساب عبر حاسبة مكافأة نهاية الخدمة | الأدوات العربية`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="gr mx-auto max-w-5xl px-4 py-8 sm:py-12" dir="rtl">
      <style>{CSS}</style>

      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "clamp(26px,5vw,38px)", fontWeight: 900 }}>حاسبة مكافأة نهاية الخدمة</h1>
        <p style={{ margin: "10px 0 0", maxWidth: 640, color: "var(--mu)" }}>
          احسب مستحقاتك القانونية وفق أنظمة العمل في 7 دول عربية وخليجية، مع حالات الاستقالة والفصل والتقاعد.
        </p>
      </header>

      {/* Presets */}
      <div className="gr-box gr-noprint" style={{ marginBottom: 24 }}>
        <p className="gr-sub">نماذج جاهزة للتجربة</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PRESETS.map((p) => (
            <button key={p.label} type="button" className="gr-btn" style={{ minHeight: 40, fontSize: 13, padding: "6px 12px" }}
              onClick={() => handleApplyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="gr-grid">
        {/* ─── Inputs ─── */}
        <div className="gr-col">
          {/* 1 */}
          <section className="gr-card">
            <Head title="1. اختر دولة العمل ونظام العمل المطبق" />
            <div className="gr-c4" role="group" aria-label="دولة العمل">
              {COUNTRIES.map((c) => (
                <button key={c.id} type="button" className="gr-tg c" aria-pressed={countryId === c.id}
                  onClick={() => selectCountry(c.id)}>
                  {c.name}
                </button>
              ))}
            </div>
            <div className="gr-box">
              <p style={{ fontWeight: 800 }}>{country.law}</p>
              <p className="m">{country.minYearsNote}</p>
            </div>
          </section>

          {/* 2 */}
          <section className="gr-card">
            <Head title="2. سبب إنهاء العلاقة التعاقدية" />
            <div className="gr-reasons" role="group" aria-label="سبب إنهاء العلاقة">
              {REASONS.filter((r) => r.id !== "female_special" || countryId === "sa").map((r) => (
                <button key={r.id} type="button" className="gr-tg" aria-pressed={reasonId === r.id}
                  onClick={() => setReasonId(r.id)}>
                  {r.name}
                  <small>{r.desc}</small>
                </button>
              ))}
            </div>
          </section>

          {/* 3 */}
          <section className="gr-card">
            <Head title="3. الراتب والبدلات الشهرية">
              <Segmented label="أساس الراتب" value={wageBaseType} onChange={setWageBaseType}
                options={[{ id: "total", label: "الراتب الإجمالي (الشامل)" }, { id: "basic", label: "الأساسي فقط" }]} />
            </Head>
            <div className="gr-g2">
              <MoneyField label="الراتب الأساسي" value={basicSalary} onChange={setBasicSalary} sym={sym} />
              <MoneyField label="بدل السكن" value={housingAllw} onChange={setHousingAllw} sym={sym} />
              <MoneyField label="بدل النقل / المواصلات" value={transportAllw} onChange={setTransportAllw} sym={sym} />
              <MoneyField label="بدلات أخرى ثابتة" value={otherAllw} onChange={setOtherAllw} sym={sym} />
            </div>
            <div className="gr-box gr-row" style={{ flexWrap: "wrap" }}>
              <span>وعاء الراتب المعتمد للحساب</span>
              <span style={{ textAlign: "right" }}>
                <b style={{ fontSize: 15 }}>{fmt(appliedSalary, sym)}</b>
                <span className="m" style={{ display: "block", fontSize: 11, color: "var(--mu)" }}>
                  {wageBaseType === "total" ? "إجمالي شامل البدلات" : "راتب أساسي فقط"}
                </span>
              </span>
            </div>
          </section>

          {/* 4 */}
          <section className="gr-card">
            <Head title="4. مدة الخدمة">
              <Segmented label="طريقة إدخال المدة" value={durationMode} onChange={setDurationMode}
                options={[{ id: "dates", label: "بالتواريخ" }, { id: "manual", label: "بالسنوات والأشهر" }]} />
            </Head>

            {durationMode === "dates" ? (
              <div className="gr-g2">
                <PlainField type="date" label="تاريخ بدء العمل (أول يوم عمل)" value={startDate} onChange={setStartDate} />
                <PlainField type="date" label="تاريخ انتهاء الخدمة (آخر يوم عمل)" value={endDate} onChange={setEndDate} />
              </div>
            ) : (
              <div className="gr-g2">
                <PlainField label="عدد السنوات الكاملة" value={manualYears} onChange={setManualYears} min="0" max="50" />
                <PlainField label="أشهر إضافية (كسور السنة: 0-11)" value={manualMonths} onChange={setManualMonths} min="0" max="11" />
              </div>
            )}

            {duration.label && (
              <div className="gr-box gr-row" role="status">
                <span>إجمالي مدة الخدمة المحسوبة</span>
                <b>
                  {duration.label}
                  {duration.decimalYears > 0 && <span style={{ fontWeight: 400, marginInlineStart: 6 }}>({duration.decimalYears} سنة)</span>}
                </b>
              </div>
            )}
          </section>
        </div>

        {/* ─── Results ─── */}
        <div className="gr-col gr-sticky" aria-live="polite">
          <section className="gr-hero">
            <div className="gr-row">
              <p style={{ fontSize: 13, fontWeight: 700 }}>صافي مكافأة نهاية الخدمة المستحقة</p>
              <p style={{ fontSize: 12, fontWeight: 800, border: "2px solid #0D0D0D", padding: "1px 10px" }}>{country.name}</p>
            </div>

            <div>
              <p className="gr-big">{result ? fmt(result.amount, sym) : "—"}</p>
              {result && result.percent < 100 && (
                <p style={{ marginTop: 6, fontSize: 12, fontWeight: 700 }}>
                  تخفيض استقالة: احتساب {result.percent}٪ من إجمالي المكافأة الأصلية {fmt(result.fullAmount, sym)}
                </p>
              )}
            </div>

            {result && (
              <div className="gr-law">
                <b>السند القانوني: </b>{result.note}
              </div>
            )}

            <div className="gr-noprint" style={{ display: "flex", gap: 8 }}>
              <button type="button" className="gr-btn" style={{ flex: 1 }} onClick={handleCopy}>
                {copied ? "✓ تم نسخ التقرير" : "نسخ النتيجة"}
              </button>
              <button type="button" className="gr-btn" onClick={() => window.print()}>طباعة</button>
            </div>
          </section>

          {result && result.amount > 0 && (
            <section className="gr-card">
              <h3 className="gr-sub">تفاصيل التوزيع والمستحقات</h3>
              <div>
                <div className="gr-line"><span>مدة الخدمة</span><b>{duration.label}</b></div>
                <div className="gr-line"><span>الراتب الشهري المحتسب</span><b>{fmt(appliedSalary, sym)}</b></div>
                {result.y1Portion > 0 && <div className="gr-line"><span>مكافأة الشريحة الأولى</span><b>{fmt(result.y1Portion, sym)}</b></div>}
                {result.y2Portion > 0 && <div className="gr-line"><span>مكافأة السنوات التالية</span><b>{fmt(result.y2Portion, sym)}</b></div>}
              </div>
              <div className="gr-final">
                <span>المبلغ المستحق للصرف</span>
                <span>{fmt(result.amount, sym)}</span>
              </div>
            </section>
          )}

          <section className="gr-card">
            <h3 className="gr-sub">جدول شرائح {country.name}</h3>
            <div>
              {country.tiers.map((t) => (
                <div key={t.label} className="gr-tier">
                  <span style={{ fontWeight: 600 }}>{t.label}</span>
                  <b>{t.rate}</b>
                </div>
              ))}
            </div>
          </section>

          {countryId === "sa" && reasonId === "resign" && (
            <div className="gr-note">
              <b>تنبيه المادة 85 من نظام العمل السعودي:</b>
              <p>• أقل من سنتين خدمة: <b>لا يستحق أي مكافأة</b>.</p>
              <p>• من 2 إلى 5 سنوات: يستحق <b>ثلث المكافأة فقط (33.3٪)</b>.</p>
              <p>• من 5 إلى 10 سنوات: يستحق <b>ثلثي المكافأة (66.7٪)</b>.</p>
              <p>• 10 سنوات فأكثر: يستحق <b>المكافأة كاملة (100٪)</b>.</p>
            </div>
          )}

          {countryId === "sa" && (
            <section className="gr-link gr-noprint">
              <p style={{ fontWeight: 800, fontSize: 14 }}>هل تحتاج إلى تصفية شاملة؟ (Complete Settlement)</p>
              <p style={{ color: "var(--mu)", fontSize: 12 }}>
                احسب كامل مستحقاتك: مكافأة نهاية الخدمة + راتب آخر شهر + بدل الإجازات (م/111) + مهلة الإشعار (م/75) + الخصومات، مع إنشاء نموذج مخالصة نهائية قابل للطباعة.
              </p>
              <a href="/ar/sa/final-settlement-calculator">الانتقال لحاسبة المخالصة النهائية بالسعودية</a>
            </section>
          )}
        </div>
      </div>

      <p className="gr-note" style={{ marginTop: 32 }}>
        <b>إخلاء مسؤولية:</b> هذه الأداة مخصصة للحسابات التقديرية وفق نصوص القوانين العامة. قد تختلف مستحقاتك النهائية باختلاف شروط عقد العمل ولوائح المنشأة الداخلية. يُنصح دائماً بمراجعة الإدارة المالية أو محامٍ عمالي مختص.
      </p>
    </div>
  );
}