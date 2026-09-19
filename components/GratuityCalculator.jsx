"use client";

import { useState, useMemo } from "react";

/* ─── Country Labour Law Configs ──────────────────────────────────────────── */
const COUNTRIES = [
  {
    id: "sa",
    name: "🇸🇦 السعودية",
    currency: "SAR",
    symbol: "ر.س",
    law: "نظام العمل السعودي (المادتان 84 و85)",
    minYearsNote: "تُستحق من اليوم الأول عند الإنهاء، وبعد سنتين عند الاستقالة",
    defaultWageType: "total", // Saudi Ministry often includes allowances
    calc: (months, salary, reason) => {
      const years = months / 12;
      if (years <= 0) return { amount: 0, fullAmount: 0, percent: 0, note: "يرجى تحديد مدة خدمة صالحة" };

      // Base gratuity calculation (Article 84)
      // Half month for each of the first 5 years
      const y1 = Math.min(years, 5);
      // One full month for each year beyond 5 years
      const y2 = Math.max(0, years - 5);

      const fullGratuity = (salary * 0.5 * y1) + (salary * 1.0 * y2);

      // Resignation deduction rules (Article 85)
      let percentage = 1.0;
      let note = "استحقاق كامل للمكافأة (المادة 84)";

      if (reason === "resign") {
        if (years < 2) {
          percentage = 0;
          note = "لا يستحق العامل مكافأة إذا استقال قبل إتمام سنتين (المادة 85)";
        } else if (years >= 2 && years < 5) {
          percentage = 1 / 3;
          note = "يستحق ثلث المكافأة (33.3٪) للاستقالة بين سنتين و5 سنوات";
        } else if (years >= 5 && years < 10) {
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
    name: "🇦🇪 الإمارات",
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

      // Cap at 2 years' salary
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
    name: "🇰🇼 الكويت",
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

      const dailyWage = salary / 26; // Kuwait labor law uses 26 working days
      const y1 = Math.min(years, 5);
      const y2 = Math.max(0, years - 5);

      const y1Val = dailyWage * 15 * y1;
      const y2Val = salary * 1.0 * y2;
      let fullGratuity = y1Val + y2Val;

      // Cap at 1.5 years' salary (18 months)
      const cap = salary * 18;
      if (fullGratuity > cap) fullGratuity = cap;

      let percentage = 1.0;
      let note = "استحقاق كامل للمكافأة (المادة 51)";

      if (reason === "resign") {
        if (years < 3) {
          percentage = 0;
          note = "لا يستحق العامل مكافأة إذا استقال قبل 3 سنوات خدمة";
        } else if (years >= 3 && years < 5) {
          percentage = 0.5;
          note = "يستحق نصف المكافأة (50٪) للاستقالة بين 3 و5 سنوات";
        } else if (years >= 5 && years < 10) {
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
    name: "🇶🇦 قطر",
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

      // 3 weeks' basic wage for each year
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
    name: "🇴🇲 عُمان",
    currency: "OMR",
    symbol: "ر.ع",
    law: "قانون العمل العُماني الجديد (مرسوم سلطاني 53/2023)",
    minYearsNote: "تُحتسب لغير العمانيين غير الخاضعين لصندوق الحماية",
    defaultWageType: "basic",
    calc: (months, salary, reason) => {
      const years = months / 12;
      if (years <= 0) return { amount: 0, fullAmount: 0, percent: 0, y1Portion: 0, y2Portion: 0, note: "حدد مدة الخدمة" };

      // Under 2023 law: full month per year from year 1
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
    name: "🇧🇭 البحرين",
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
    name: "🇪🇬 مصر",
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
  { id: "terminate", name: "🔴 إنهاء من صاحب العمل", desc: "فصل، انتهاء عقد محدد، أو إلغاء وظيفة" },
  { id: "resign", name: "🟡 استقالة الموظف", desc: "ترك العمل طوعاً بناءً على طلب العامل" },
  { id: "retire", name: "🟢 التقاعد وبلوغ السن", desc: "بلوغ سن التقاعد القانوني أو التقاعد المبكر" },
  { id: "mutual", name: "🔵 اتفاق مشترك / قوة قاهرة", desc: "إنهاء العقد بالتراضي أو لظروف قاهرة" },
  { id: "female_special", name: "🟣 استثناء المرأة العاملة (سعودية)", desc: "خلال 6 أشهر من الزواج أو 3 أشهر من الوضع" },
];

const PRESETS = [
  { label: "🇸🇦 موظف سعودي استقال بعد 4 سنوات", country: "sa", reason: "resign", years: 4, months: 0, salary: 10000, housing: 2500, transport: 1000 },
  { label: "🇸🇦 موظف انتهت خدمته بعد 8 سنوات", country: "sa", reason: "terminate", years: 8, months: 0, salary: 14000, housing: 3500, transport: 1000 },
  { label: "🇦🇪 موظف في دبي أكمل 6 سنوات", country: "ae", reason: "terminate", years: 6, months: 0, salary: 18000, housing: 4000, transport: 1500 },
  { label: "🇰🇼 موظف استقال بعد 7 سنوات بالكويت", country: "kw", reason: "resign", years: 7, months: 0, salary: 1200, housing: 300, transport: 100 },
];

function fmt(n, sym) {
  return `${Math.round(n).toLocaleString("ar-EG")} ${sym}`;
}

export default function GratuityCalculator() {
  const [countryId, setCountryId] = useState("sa");
  const [reasonId, setReasonId] = useState("terminate");
  const [wageBaseType, setWageBaseType] = useState("total"); // "total" | "basic"
  const [basicSalary, setBasicSalary] = useState(8000);
  const [housingAllw, setHousingAllw] = useState(2000);
  const [transportAllw, setTransportAllw] = useState(800);
  const [otherAllw, setOtherAllw] = useState(0);

  // Duration mode
  const [durationMode, setDurationMode] = useState("dates"); // "dates" | "manual"
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualYears, setManualYears] = useState(5);
  const [manualMonths, setManualMonths] = useState(0);

  const [copied, setCopied] = useState(false);

  const country = COUNTRIES.find((c) => c.id === countryId) || COUNTRIES[0];
  const reason = REASONS.find((r) => r.id === reasonId) || REASONS[0];

  // Calculate duration
  const duration = useMemo(() => {
    if (durationMode === "manual") {
      const y = Math.max(0, Number(manualYears) || 0);
      const m = Math.max(0, Math.min(11, Number(manualMonths) || 0));
      const total = y * 12 + m;
      return {
        totalMonths: total,
        years: y,
        months: m,
        decimalYears: Number((total / 12).toFixed(2)),
        label: `${y} سنة ${m > 0 ? `و${m} شهر` : ""}`,
      };
    }

    if (!startDate || !endDate) return { totalMonths: 0, years: 0, months: 0, decimalYears: 0, label: "" };
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e <= s) return { totalMonths: 0, years: 0, months: 0, decimalYears: 0, label: "تاريخ النهاية يجب أن يكون بعد البداية" };

    let diffMonths = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    if (e.getDate() < s.getDate()) {
      diffMonths -= 1;
    }
    const safeMonths = Math.max(0, diffMonths);
    const y = Math.floor(safeMonths / 12);
    const m = safeMonths % 12;

    return {
      totalMonths: safeMonths,
      years: y,
      months: m,
      decimalYears: Number((safeMonths / 12).toFixed(2)),
      label: `${y} سنة ${m > 0 ? `و${m} شهر` : ""}`,
    };
  }, [durationMode, manualYears, manualMonths, startDate, endDate]);

  // Wage computation
  const bSalary = Math.max(0, Number(basicSalary) || 0);
  const hAllw = Math.max(0, Number(housingAllw) || 0);
  const tAllw = Math.max(0, Number(transportAllw) || 0);
  const oAllw = Math.max(0, Number(otherAllw) || 0);
  const totalSalary = bSalary + hAllw + tAllw + oAllw;

  const appliedSalary = wageBaseType === "total" ? totalSalary : bSalary;

  // Calculation result
  const result = useMemo(() => {
    if (duration.totalMonths <= 0 || appliedSalary <= 0) return null;
    return country.calc(duration.totalMonths, appliedSalary, reasonId);
  }, [country, duration.totalMonths, appliedSalary, reasonId]);

  const sym = country.symbol;

  const handleApplyPreset = (p) => {
    setCountryId(p.country);
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
    if (!result) return;
    const text = `📊 نتيجة حساب مكافأة نهاية الخدمة:
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12" dir="rtl">
      {/* Header */}
      <div className="mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-sm font-bold text-brand-dark">
          <span>🎖️</span>
          <span>حاسبة مكافأة نهاية الخدمة 2025</span>
        </div>
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
          حاسبة مكافأة نهاية الخدمة
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-ink-secondary sm:text-base">
          احسب مستحقاتك القانونية بدقة متناهية وفق أنظمة العمل المحدثة لـ 7 دول عربية وخليجية مع حالات الاستقالة والفصل والتقاعد.
        </p>
      </div>

      {/* Quick Presets */}
      <div className="mb-6 rounded-2xl border border-brand-border bg-brand-surface/40 p-3 sm:p-4">
        <p className="mb-2 text-xs font-bold text-ink-muted">⚡ نماذج جاهزة وسريعة للتجربة:</p>
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

          {/* 1. Country Selection */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">🌍</span>
              1. اختر دولة العمل ونظام العمل المطبق
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {COUNTRIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCountryId(c.id);
                    setWageBaseType(c.defaultWageType);
                  }}
                  className={`rounded-xl border p-2.5 text-xs font-bold text-center transition-all ${
                    countryId === c.id
                      ? "border-brand bg-brand-light text-brand-dark shadow-sm"
                      : "border-brand-border bg-brand-surface/40 text-ink-secondary hover:bg-white"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-brand-surface/50 border border-brand-border/60 p-3 text-xs text-ink-secondary flex items-start gap-2">
              <span className="text-sm">⚖️</span>
              <div>
                <p className="font-bold text-brand-dark">{country.law}</p>
                <p className="text-[11px] text-ink-muted mt-0.5">{country.minYearsNote}</p>
              </div>
            </div>
          </div>

          {/* 2. Reason for Termination */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">📋</span>
              2. سبب إنهاء العلاقة التعاقدية
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {REASONS.filter(r => r.id !== "female_special" || countryId === "sa").map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReasonId(r.id)}
                  className={`rounded-xl border p-3 text-right text-xs font-semibold transition-all ${
                    reasonId === r.id
                      ? "border-brand bg-brand-light text-brand-dark shadow-sm"
                      : "border-brand-border bg-brand-surface/40 text-ink-secondary hover:bg-white"
                  }`}
                >
                  <p className="font-bold">{r.name}</p>
                  <p className="text-[10px] font-normal text-ink-muted mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Salary & Allowances */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">💵</span>
                3. الراتب والبدلات الشهرية
              </h2>

              {/* Wage base switch */}
              <div className="inline-flex rounded-xl border border-brand-border bg-brand-surface/60 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setWageBaseType("total")}
                  className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                    wageBaseType === "total"
                      ? "bg-white text-brand-dark shadow-sm"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  الراتب الإجمالي (الشامل)
                </button>
                <button
                  type="button"
                  onClick={() => setWageBaseType("basic")}
                  className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                    wageBaseType === "basic"
                      ? "bg-white text-brand-dark shadow-sm"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  الأساسي فقط
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-secondary">الراتب الأساسي*</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
                  <input
                    type="number"
                    min="0"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2.5 pr-10 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-secondary">بدل السكن</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
                  <input
                    type="number"
                    min="0"
                    value={housingAllw}
                    onChange={(e) => setHousingAllw(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2.5 pr-10 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-secondary">بدل النقل / المواصلات</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
                  <input
                    type="number"
                    min="0"
                    value={transportAllw}
                    onChange={(e) => setTransportAllw(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2.5 pr-10 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-secondary">بدلات أخرى ثابتة</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
                  <input
                    type="number"
                    min="0"
                    value={otherAllw}
                    onChange={(e) => setOtherAllw(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2.5 pr-10 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between rounded-xl bg-brand-surface/60 px-4 py-2.5 text-xs">
              <span className="text-ink-secondary">وعاء الراتب المعتمد للحساب:</span>
              <span className="font-extrabold text-brand-dark text-sm">
                {fmt(appliedSalary, sym)}
                <span className="text-[11px] font-normal text-ink-muted mr-1.5">
                  ({wageBaseType === "total" ? "إجمالي شامل البدلات" : "راتب أساسي فقط"})
                </span>
              </span>
            </div>
          </div>

          {/* 4. Duration */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">📅</span>
                4. مدة الخدمة
              </h2>
              <div className="inline-flex rounded-xl border border-brand-border bg-brand-surface/60 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setDurationMode("dates")}
                  className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                    durationMode === "dates"
                      ? "bg-white text-brand-dark shadow-sm"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  بالتواريخ
                </button>
                <button
                  type="button"
                  onClick={() => setDurationMode("manual")}
                  className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                    durationMode === "manual"
                      ? "bg-white text-brand-dark shadow-sm"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  بالسنوات والأشهر
                </button>
              </div>
            </div>

            {durationMode === "dates" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary">تاريخ بدء العمل (أول يوم عمل)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 px-4 py-2.5 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary">تاريخ انتهاء الخدمة (آخر يوم عمل)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 px-4 py-2.5 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary">عدد السنوات الكاملة</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={manualYears}
                    onChange={(e) => setManualYears(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 px-4 py-2.5 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary">أشهر إضافية (كسور السنة: 0-11)</label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={manualMonths}
                    onChange={(e) => setManualMonths(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 px-4 py-2.5 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {duration.label && (
              <div className="flex justify-between items-center rounded-xl bg-brand-light/70 px-4 py-2.5 text-sm font-bold">
                <span className="text-ink-secondary text-xs">إجمالي مدة الخدمة المحسوبة:</span>
                <span className="text-brand-dark">
                  {duration.label}
                  <span className="text-xs font-normal opacity-80 mr-1.5">({duration.decimalYears} سنة)</span>
                </span>
              </div>
            )}
          </div>

        </div>

        {/* ─── Right Results Column (2 cols) ─── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">

            {/* Main Result Card */}
            <div className="rounded-2xl bg-hero-gradient p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-emerald-200">صافي مكافأة نهاية الخدمة المستحقة</p>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
                  {country.name}
                </span>
              </div>

              <div>
                <p className="text-4xl font-black tracking-tight">
                  {result ? fmt(result.amount, sym) : "—"}
                </p>
                {result && result.percent < 100 && (
                  <p className="mt-1 text-xs text-amber-200 font-semibold">
                    (تخفيض استقالة: احتساب {result.percent}٪ من إجمالي المكافأة الأصلية {fmt(result.fullAmount, sym)})
                  </p>
                )}
              </div>

              {result && (
                <div className="rounded-xl bg-white/15 p-3 text-xs leading-relaxed backdrop-blur-sm">
                  <span className="font-bold text-amber-300">📌 السند القانوني: </span>
                  {result.note}
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

            {/* Visual Breakdown Card */}
            {result && result.amount > 0 && (
              <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
                <h3 className="text-sm font-bold text-ink">تفاصيل التوزيع والمستحقات</h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-brand-border/40">
                    <span className="text-ink-secondary">مدة الخدمة</span>
                    <span className="font-bold text-ink">{duration.label}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-brand-border/40">
                    <span className="text-ink-secondary">الراتب الشهري المحتسب</span>
                    <span className="font-bold text-ink">{fmt(appliedSalary, sym)}</span>
                  </div>
                  {result.y1Portion > 0 && (
                    <div className="flex justify-between py-1.5 border-b border-brand-border/40">
                      <span className="text-ink-secondary">مكافأة الشريحة الأولى</span>
                      <span className="font-bold text-ink">{fmt(result.y1Portion, sym)}</span>
                    </div>
                  )}
                  {result.y2Portion > 0 && (
                    <div className="flex justify-between py-1.5 border-b border-brand-border/40">
                      <span className="text-ink-secondary">مكافأة السنوات التالية</span>
                      <span className="font-bold text-ink">{fmt(result.y2Portion, sym)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 text-sm font-extrabold text-brand-dark bg-brand-light/40 px-3 rounded-xl">
                    <span>المبلغ المستحق للصرف</span>
                    <span>{fmt(result.amount, sym)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Country Legal Tiers */}
            <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                <span>📖</span>
                <span>جدول شرائح {country.name}</span>
              </h3>
              <div className="space-y-1.5">
                {country.tiers.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs py-1.5 border-b border-brand-border/30 last:border-0"
                  >
                    <span className="text-ink-secondary font-medium">{t.label}</span>
                    <span className="font-bold text-brand-dark text-[11px] bg-brand-light/60 px-2 py-0.5 rounded-md">
                      {t.rate}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Resignation Notice for Saudi Arabia */}
            {countryId === "sa" && reasonId === "resign" && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-1.5 leading-relaxed">
                <p className="font-bold flex items-center gap-1">
                  <span>⚠️</span>
                  <span>تنبيه المادة 85 من نظام العمل السعودي:</span>
                </p>
                <p>• أقل من سنتين خدمة: <strong>لا يستحق أي مكافأة</strong>.</p>
                <p>• من 2 إلى 5 سنوات: يستحق <strong>ثلث المكافأة فقط (33.3٪)</strong>.</p>
                <p>• من 5 إلى 10 سنوات: يستحق <strong>ثلثي المكافأة (66.7٪)</strong>.</p>
                <p>• 10 سنوات فأكثر: يستحق <strong>المكافأة كاملة (100٪)</strong>.</p>
              </div>
            )}

          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink-muted">
        ⚠️ إخلاء مسؤولية: هذه الأداة مخصصة للحسابات التقديرية وفق نصوص القوانين العامة. قد تختلف مستحقاتك النهائية باختلاف شروط عقد العمل ولوائح المنشأة الداخلية. يُنصح دائماً بمراجعة الإدارة المالية أو محامٍ عمالي مختص.
      </p>
    </div>
  );
}