"use client";

import { useState, useMemo } from "react";

const CURRENCIES = [
  { id: "SAR", symbol: "ر.س", name: "ريال سعودي" },
  { id: "AED", symbol: "د.إ", name: "درهم إماراتي" },
  { id: "KWD", symbol: "د.ك", name: "دينار كويتي" },
  { id: "QAR", symbol: "ر.ق", name: "ريال قطري" },
  { id: "EGP", symbol: "ج.م", name: "جنيه مصري" },
  { id: "USD", symbol: "$", name: "دولار أمريكي" },
  { id: "EUR", symbol: "€", name: "يورو" },
];

const PRESETS = [
  { label: "📈 أسهم وصناديق استثمارية", initial: 100000, final: 145000, years: 3, months: 0, income: 12000, expenses: 2000 },
  { label: "🏢 عقار تأجيري وتمليك", initial: 600000, final: 750000, years: 5, months: 0, income: 150000, expenses: 35000 },
  { label: "📢 حملة تسويقية وإعلانية", initial: 10000, final: 32000, years: 0, months: 3, income: 0, expenses: 1000 },
  { label: "🚀 مشروع ريادي ناشئ", initial: 250000, final: 600000, years: 4, months: 0, income: 0, expenses: 20000 },
];

function fmt(n, sym) {
  return `${Number(n).toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${sym}`;
}

export default function RoiCalculator() {
  const [currency, setCurrency] = useState("SAR");

  // Inputs
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [finalValue, setFinalValue] = useState(150000);
  const [investYears, setInvestYears] = useState(3);
  const [investMonths, setInvestMonths] = useState(0);

  // Additional income/expenses
  const [recurringIncome, setRecurringIncome] = useState(15000); // e.g. dividends or rental cashflow
  const [additionalExpenses, setAdditionalExpenses] = useState(3000); // maintenance, management fees

  const [copied, setCopied] = useState(false);

  const sym = CURRENCIES.find((c) => c.id === currency)?.symbol || "ر.س";

  // Calculations
  const stats = useMemo(() => {
    const init = Math.max(0, Number(initialInvestment) || 0);
    const finalVal = Math.max(0, Number(finalValue) || 0);
    const y = Math.max(0, Number(investYears) || 0);
    const m = Math.max(0, Math.min(11, Number(investMonths) || 0));
    const totalYears = y + m / 12;

    const income = Math.max(0, Number(recurringIncome) || 0);
    const exp = Math.max(0, Number(additionalExpenses) || 0);

    // Total Inflow = Final Value + Extra Incomes
    const totalReturn = finalVal + income;
    // Total Outflow = Initial + Extra Expenses
    const totalCost = init + exp;

    // Net Profit
    const netProfit = totalReturn - totalCost;

    // Total ROI %
    const totalRoi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

    // Annualized ROI (Compound Annual Growth Rate - CAGR)
    let cagr = 0;
    if (totalYears > 0 && totalCost > 0 && totalReturn > 0) {
      cagr = (Math.pow(totalReturn / totalCost, 1 / totalYears) - 1) * 100;
    }

    // Simple Annualized ROI
    const simpleAnnualRoi = totalYears > 0 ? totalRoi / totalYears : totalRoi;

    // Multiple of Money (MoM)
    const multiple = totalCost > 0 ? (totalReturn / totalCost).toFixed(2) : "0.00";

    // Visual Percentage breakdown
    const initShare = totalReturn > 0 ? Math.min(100, (init / totalReturn) * 100) : 50;
    const profitShare = totalReturn > 0 ? Math.max(0, (netProfit / totalReturn) * 100) : 0;

    // Performance assessment
    let rating = { label: "متوسط", color: "text-amber-600", bg: "bg-amber-100 text-amber-900", tip: "العائد يتماشى مع متوسط عوائد السوق التقليدية." };
    if (netProfit < 0) {
      rating = { label: "خسارة استثمارية", color: "text-rose-600", bg: "bg-rose-100 text-rose-900", tip: "العائد سلبي، ينبغي إعادة تقييم استراتيجية الاستثمار وتخفيف التكاليف." };
    } else if (cagr >= 20 || totalRoi >= 100) {
      rating = { label: "استثنائي وفائق", color: "text-emerald-600", bg: "bg-emerald-100 text-emerald-900", tip: "أداء استثماري استثنائي يتجاوز متوسط مؤشرات الأسواق العالمية بكثير!" };
    } else if (cagr >= 10 || totalRoi >= 30) {
      rating = { label: "جيد جداً وقوي", color: "text-teal-600", bg: "bg-teal-100 text-teal-900", tip: "عائد ممتاز يتفوق على معدلات التضخم وعوائد الودائع البنكية." };
    }

    return {
      init,
      finalVal,
      income,
      exp,
      totalYears: Number(totalYears.toFixed(2)),
      totalCost,
      totalReturn,
      netProfit,
      totalRoi: Number(totalRoi.toFixed(2)),
      cagr: Number(cagr.toFixed(2)),
      simpleAnnualRoi: Number(simpleAnnualRoi.toFixed(2)),
      multiple,
      initShare: Number(initShare.toFixed(1)),
      profitShare: Number(profitShare.toFixed(1)),
      rating,
    };
  }, [initialInvestment, finalValue, investYears, investMonths, recurringIncome, additionalExpenses]);

  const handleApplyPreset = (p) => {
    setInitialInvestment(p.initial);
    setFinalValue(p.final);
    setInvestYears(p.years);
    setInvestMonths(p.months);
    setRecurringIncome(p.income);
    setAdditionalExpenses(p.expenses);
  };

  const handleCopy = () => {
    if (!stats) return;
    const text = `📊 تقرير العائد على الاستثمار (ROI):
• رأس المال المستثمر: ${fmt(stats.init, sym)}
• القيمة النهائية المستردة: ${fmt(stats.finalVal, sym)}
• الأرباح الدورية (توزيعات/إيجار): ${fmt(stats.income, sym)}
• مدة الاستثمار: ${stats.totalYears} سنة
• صافي الأرباح المحققة: ${fmt(stats.netProfit, sym)}
• إجمالي العائد على الاستثمار (Total ROI): ${stats.totalRoi}%
• معدل النمو السنوي المركب (CAGR): ${stats.cagr}% سنوياً
• مضاعف رأس المال: ${stats.multiple}x
• تقييم الأداء: ${stats.rating.label}

تم الحساب عبر حاسبة العائد على الاستثمار | الأدوات العربية`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12" dir="rtl">
      {/* Header */}
      <div className="mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-sm font-bold text-brand-dark">
          <span>💼</span>
          <span>حاسبة العائد على الاستثمار ROI و CAGR</span>
        </div>
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
          حاسبة العائد على الاستثمار (ROI Calculator)
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-ink-secondary sm:text-base">
          احسب صافي أرباحك الاستثمارية، ومعدل العائد السنوي المركب (CAGR)، ومضاعف رأس المال لمشاريعك العقارية والتجارية وحملاتك التسويقية.
        </p>
      </div>

      {/* Currency & Presets */}
      <div className="mb-6 rounded-2xl border border-brand-border bg-brand-surface/40 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold text-ink-muted">⚡ نماذج استثمارية جاهزة للتجربة:</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-secondary">العملة:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-xl border border-brand-border bg-white px-3 py-1 text-xs font-bold text-ink focus:border-brand focus:outline-none shadow-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.symbol} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="rounded-xl border border-brand-border bg-white px-3 py-1.5 text-xs font-medium text-ink-secondary hover:border-brand hover:text-brand-dark transition-all shadow-sm"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ─── Left Inputs Column (3 cols) ─── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Core Capital Inputs */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">💰</span>
              1. رأس المال والقيمة المستردة
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-secondary">المبلغ المستثمر مبدئياً (Initial Cost)</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2.5 pr-10 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-secondary">القيمة النهائية المستردة (Final Value)</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={finalValue}
                    onChange={(e) => setFinalValue(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2.5 pr-10 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-secondary">فترة الاستثمار (بالسنوات)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={investYears}
                  onChange={(e) => setInvestYears(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-brand-surface/40 px-4 py-2.5 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-secondary">أشهر إضافية (0 - 11)</label>
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={investMonths}
                  onChange={(e) => setInvestMonths(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-brand-surface/40 px-4 py-2.5 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cashflows & Extra Incomes/Expenses */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">💵</span>
              2. العوائد والمصاريف الدورية الإضافية
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-secondary">
                  إجمالي التوزيعات النقدية / الإيجارات المستلمة
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={recurringIncome}
                    onChange={(e) => setRecurringIncome(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2.5 pr-10 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-secondary">
                  مصاريف إضافية (صيانة، إدارة، ضرائب)
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={additionalExpenses}
                    onChange={(e) => setAdditionalExpenses(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2.5 pr-10 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Educational Note */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-950 space-y-2 leading-relaxed">
            <p className="font-bold flex items-center gap-1 text-sm">
              <span>💡</span>
              <span>ما الفرق بين العائد الإجمالي (ROI) ومعدل النمو السنوي المركب (CAGR)؟</span>
            </p>
            <p>
              • <strong>العائد الإجمالي (Total ROI):</strong> يقيس الربح الكلي على مدار كامل فترة الاستثمار كنسبة مئوية، دون النظر لطول المدة الزمنية.
            </p>
            <p>
              • <strong>معدل النمو السنوي المركب (CAGR):</strong> يقيس النمو الفعلي لكل سنة بمفردها مع إعادة استثمار الأرباح، وهو المعيار الذهبي للمقارنة العادلة بين استثمارات مختلفة الآجال.
            </p>
          </div>

        </div>

        {/* ─── Right Results Column (2 cols) ─── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">

            {/* Main ROI Card */}
            <div className="rounded-2xl bg-hero-gradient p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-200">إجمالي العائد على الاستثمار (ROI)</span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
                  {stats ? `${stats.multiple}x ضعف` : "—"}
                </span>
              </div>

              <div>
                <p className="text-4xl font-black tracking-tight">
                  {stats.totalRoi >= 0 ? `+${stats.totalRoi}%` : `${stats.totalRoi}%`}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs font-bold text-emerald-200">
                  <span className="bg-white/20 px-2.5 py-1 rounded-lg">
                    صافي الربح: {fmt(stats.netProfit, sym)}
                  </span>
                  <span className="bg-white/15 px-2.5 py-1 rounded-lg">
                    السنوي المركب: {stats.cagr}%
                  </span>
                </div>
              </div>

              {/* Visual Breakdown Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] text-white/90 font-bold">
                  <span>رأس المال ({stats.initShare}%)</span>
                  <span>الأرباح المحققة ({stats.profitShare}%)</span>
                </div>
                <div className="h-3 w-full rounded-full bg-white/30 overflow-hidden flex">
                  <div className="h-full bg-white/50" style={{ width: `${stats.initShare}%` }} title="رأس المال" />
                  <div className="h-full bg-emerald-400" style={{ width: `${stats.profitShare}%` }} title="الأرباح" />
                </div>
              </div>

              {/* Rating Card */}
              <div className="rounded-xl bg-white/15 p-3 text-xs leading-relaxed backdrop-blur-sm">
                <span className="font-bold text-amber-300">📊 تقييم الأداء: </span>
                {stats.rating.label} — {stats.rating.tip}
              </div>

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

            {/* Financial Details Table */}
            <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
              <h3 className="text-sm font-bold text-ink">مؤشرات الأداء المالي</h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-brand-border/30">
                  <span className="text-ink-secondary">إجمالي رأس المال والتكاليف</span>
                  <span className="font-bold text-ink">{fmt(stats.totalCost, sym)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-border/30">
                  <span className="text-ink-secondary">إجمالي المردود والأرباح الدورية</span>
                  <span className="font-bold text-ink">{fmt(stats.totalReturn, sym)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-border/30">
                  <span className="text-ink-secondary">صافي الربح الفعلي</span>
                  <span className={`font-black text-sm ${stats.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {fmt(stats.netProfit, sym)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-border/30">
                  <span className="text-ink-secondary">معدل العائد السنوي المركب (CAGR)</span>
                  <span className="font-bold text-brand-dark">{stats.cagr}% سنوياً</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-border/30">
                  <span className="text-ink-secondary">معدل العائد البسيط السنوي</span>
                  <span className="font-bold text-ink">{stats.simpleAnnualRoi}% سنوياً</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-ink-secondary">مضاعف الاستثمار (Investment Multiple)</span>
                  <span className="font-bold text-brand-dark text-sm">{stats.multiple}x</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink-muted">
        💼 أداة استرشادية لتقييم الجدوى الاقتصادية وعوائد الأصول الاستثمارية. استشر مستشاراً مالياً مرخصاً لقرارات الاستثمار الكبرى.
      </p>
    </div>
  );
}
