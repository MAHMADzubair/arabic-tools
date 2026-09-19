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
  { label: "🛒 متجر إلكتروني (سلة/زد)", cost: 60, price: 140, shipping: 25, gatewayFee: 2.5, adSpend: 15, vat: 15 },
  { label: "🏪 تجارة تجزئة وسوبرماركت", cost: 80, price: 105, shipping: 0, gatewayFee: 1.0, adSpend: 0, vat: 15 },
  { label: "📦 دروب شيبينغ (Dropshipping)", cost: 45, price: 120, shipping: 15, gatewayFee: 3.0, adSpend: 30, vat: 0 },
  { label: "💼 خدمات واستشارات", cost: 200, price: 650, shipping: 0, gatewayFee: 2.0, adSpend: 50, vat: 15 },
];

function fmt(n, sym) {
  return `${Number(n).toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${sym}`;
}

export default function ProfitMarginCalculator() {
  const [currency, setCurrency] = useState("SAR");
  const [calcMode, setCalcMode] = useState("cost_price"); // "cost_price" | "target_margin" | "target_markup"

  // Base inputs
  const [costPrice, setCostPrice] = useState(100);
  const [sellingPrice, setSellingPrice] = useState(160);
  const [targetMargin, setTargetMargin] = useState(35); // %
  const [targetMarkup, setTargetMarkup] = useState(60); // %

  // Advanced E-commerce Costs Toggle
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [shippingCost, setShippingCost] = useState(20);
  const [paymentGatewayPct, setPaymentGatewayPct] = useState(2.5); // %
  const [adSpendPerUnit, setAdSpendPerUnit] = useState(15);
  const [vatRate, setVatRate] = useState(15); // %

  const [copied, setCopied] = useState(false);

  const sym = CURRENCIES.find((c) => c.id === currency)?.symbol || "ر.س";

  // Calculations
  const stats = useMemo(() => {
    const cost = Math.max(0, Number(costPrice) || 0);
    let rev = 0;

    if (calcMode === "cost_price") {
      rev = Math.max(0, Number(sellingPrice) || 0);
    } else if (calcMode === "target_margin") {
      const mPct = Math.min(99.9, Math.max(0, Number(targetMargin) || 0)) / 100;
      rev = mPct < 1 ? cost / (1 - mPct) : cost * 2;
    } else if (calcMode === "target_markup") {
      const muPct = Math.max(0, Number(targetMarkup) || 0) / 100;
      rev = cost * (1 + muPct);
    }

    // Basic Margin & Markup
    const grossProfit = rev - cost;
    const marginPct = rev > 0 ? (grossProfit / rev) * 100 : 0;
    const markupPct = cost > 0 ? (grossProfit / cost) * 100 : 0;

    // Advanced fees & net profit
    let totalShipping = 0;
    let totalGateway = 0;
    let totalAds = 0;
    let totalVat = 0;

    if (showAdvanced) {
      totalShipping = Math.max(0, Number(shippingCost) || 0);
      totalGateway = (rev * Math.max(0, Number(paymentGatewayPct) || 0)) / 100;
      totalAds = Math.max(0, Number(adSpendPerUnit) || 0);
      // VAT on sale price (if applicable) or on fee
      totalVat = (rev * Math.max(0, Number(vatRate) || 0)) / (100 + Math.max(0, Number(vatRate) || 0));
    }

    const totalAdditionalFees = totalShipping + totalGateway + totalAds;
    const totalExpenses = cost + totalAdditionalFees;
    const netProfitBeforeVat = rev - totalExpenses;
    const netProfit = rev - totalExpenses;
    const netMarginPct = rev > 0 ? (netProfit / rev) * 100 : 0;

    // Visual Percentage shares of Revenue
    const costShare = rev > 0 ? Math.min(100, Math.max(0, (cost / rev) * 100)) : 0;
    const feesShare = rev > 0 ? Math.min(100, Math.max(0, (totalAdditionalFees / rev) * 100)) : 0;
    const profitShare = rev > 0 ? Math.max(0, 100 - costShare - feesShare) : 0;

    return {
      cost,
      rev,
      grossProfit,
      marginPct: Number(marginPct.toFixed(2)),
      markupPct: Number(markupPct.toFixed(2)),
      totalShipping,
      totalGateway,
      totalAds,
      totalAdditionalFees,
      totalExpenses,
      netProfit,
      netMarginPct: Number(netMarginPct.toFixed(2)),
      costShare: Number(costShare.toFixed(1)),
      feesShare: Number(feesShare.toFixed(1)),
      profitShare: Number(profitShare.toFixed(1)),
    };
  }, [
    calcMode,
    costPrice,
    sellingPrice,
    targetMargin,
    targetMarkup,
    showAdvanced,
    shippingCost,
    paymentGatewayPct,
    adSpendPerUnit,
    vatRate,
  ]);

  const handleApplyPreset = (p) => {
    setCalcMode("cost_price");
    setCostPrice(p.cost);
    setSellingPrice(p.price);
    setShowAdvanced(true);
    setShippingCost(p.shipping);
    setPaymentGatewayPct(p.gatewayFee);
    setAdSpendPerUnit(p.adSpend);
    setVatRate(p.vat);
  };

  const handleCopy = () => {
    if (!stats) return;
    const text = `📊 تقرير تسعير وهامش الربح:
• سعر التكلفة: ${fmt(stats.cost, sym)}
• سعر البيع المقترح: ${fmt(stats.rev, sym)}
• إجمالي الربح الأساسي: ${fmt(stats.grossProfit, sym)}
• هامش الربح (Profit Margin): ${stats.marginPct}%
• نسبة الزيادة على التكلفة (Markup): ${stats.markupPct}%
${
  showAdvanced
    ? `• إجمالي المصاريف والعمولات الإضافية: ${fmt(stats.totalAdditionalFees, sym)}
• صافي الربح الفعلي بعد المصاريف: ${fmt(stats.netProfit, sym)}
• هامش الربح الصافي الحقيقي: ${stats.netMarginPct}%`
    : ""
}

تم الحساب عبر حاسبة هامش الربح | الأدوات العربية`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12" dir="rtl">
      {/* Header */}
      <div className="mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-sm font-bold text-brand-dark">
          <span>📈</span>
          <span>حاسبة التسعير وهوامش الأرباح</span>
        </div>
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
          حاسبة هامش الربح والتسعير (Margin & Markup)
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-ink-secondary sm:text-base">
          احسب هامش ربحك الحقيقي، ونسبة المارك اب، وسعر البيع الأمثل لمنتجاتك مع احتساب تكاليف الشحن والإعلانات وبوابات الدفع الإلكتروني.
        </p>
      </div>

      {/* Currency & Presets Bar */}
      <div className="mb-6 rounded-2xl border border-brand-border bg-brand-surface/40 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold text-ink-muted">⚡ نماذج تسعير شائعة للتجربة:</p>
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

          {/* Mode Selector */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">🧮</span>
              1. اختر طريقة الحساب والتسعير
            </h2>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setCalcMode("cost_price")}
                className={`rounded-xl border p-3 text-center text-xs font-bold transition-all ${
                  calcMode === "cost_price"
                    ? "border-brand bg-brand-light text-brand-dark shadow-sm"
                    : "border-brand-border bg-brand-surface/40 text-ink-secondary hover:bg-white"
                }`}
              >
                معرفة الهامش من سعر البيع
              </button>
              <button
                type="button"
                onClick={() => setCalcMode("target_margin")}
                className={`rounded-xl border p-3 text-center text-xs font-bold transition-all ${
                  calcMode === "target_margin"
                    ? "border-brand bg-brand-light text-brand-dark shadow-sm"
                    : "border-brand-border bg-brand-surface/40 text-ink-secondary hover:bg-white"
                }`}
              >
                تحديد السعر بهامش الربح %
              </button>
              <button
                type="button"
                onClick={() => setCalcMode("target_markup")}
                className={`rounded-xl border p-3 text-center text-xs font-bold transition-all ${
                  calcMode === "target_markup"
                    ? "border-brand bg-brand-light text-brand-dark shadow-sm"
                    : "border-brand-border bg-brand-surface/40 text-ink-secondary hover:bg-white"
                }`}
              >
                تحديد السعر بالمارك اب %
              </button>
            </div>

            {/* Inputs based on mode */}
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              {/* Cost Price */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-secondary">تكلفة المنتج / الخدمة (Cost)</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2.5 pr-10 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {calcMode === "cost_price" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary">سعر البيع النهائي (Revenue / Price)</label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2.5 pr-10 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {calcMode === "target_margin" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary">هامش الربح المستهدف (Margin %)</label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">%</span>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      step="any"
                      value={targetMargin}
                      onChange={(e) => setTargetMargin(e.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2.5 pr-10 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {calcMode === "target_markup" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary">نسبة المارك اب المستهدفة (Markup %)</label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">%</span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={targetMarkup}
                      onChange={(e) => setTargetMarkup(e.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2.5 pr-10 pl-3 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advanced E-commerce & Operations Fees */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">📦</span>
                2. تكاليف التجارة الإلكترونية والتشغيل (اختياري)
              </h2>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-bold text-brand hover:underline"
              >
                {showAdvanced ? "إخفاء التفاصيل ▲" : "تفعيل التكاليف ▼"}
              </button>
            </div>

            {showAdvanced && (
              <div className="grid gap-3 sm:grid-cols-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary">تكلفة الشحن والتوصيل</label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
                    <input
                      type="number"
                      min="0"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2 pr-8 pl-2 text-xs font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary">عمولة بوابة الدفع (مدى/فيزا)</label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">%</span>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={paymentGatewayPct}
                      onChange={(e) => setPaymentGatewayPct(e.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2 pr-8 pl-2 text-xs font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-secondary">تكلفة الإعلانات لكل طلب (CAC)</label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">{sym}</span>
                    <input
                      type="number"
                      min="0"
                      value={adSpendPerUnit}
                      onChange={(e) => setAdSpendPerUnit(e.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface/40 py-2 pr-8 pl-2 text-xs font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Education Box: Margin vs Markup */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-950 space-y-2 leading-relaxed">
            <p className="font-bold flex items-center gap-1 text-sm">
              <span>💡</span>
              <span>الفرق الجوهري بين هامش الربح (Margin) والمارك اب (Markup):</span>
            </p>
            <p>
              • <strong>هامش الربح (Profit Margin):</strong> نسبة الربح المحسوبة من <u>سعر البيع النهائي</u>. (لا يمكن أن يتجاوز 100%).
            </p>
            <p>
              • <strong>المارك اب (Markup):</strong> نسبة الزيادة المضافة فوق <u>سعر التكلفة الأصلي</u>. (يمكن أن يتجاوز 100% و 500%).
            </p>
            <p className="font-semibold text-blue-900 pt-1">
              مثال: منتج تكلفته 100 وبيع بـ 200: ربحك 100، المارك اب = 100%، بينما هامش الربح = 50% فقط!
            </p>
          </div>

        </div>

        {/* ─── Right Results Column (2 cols) ─── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">

            {/* Main Result Card */}
            <div className="rounded-2xl bg-hero-gradient p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-200">
                  {showAdvanced ? "صافي الربح الفعلي بعد المصاريف" : "إجمالي الربح الأساسي"}
                </span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
                  سعر البيع: {fmt(stats.rev, sym)}
                </span>
              </div>

              <div>
                <p className="text-4xl font-black tracking-tight">
                  {fmt(showAdvanced ? stats.netProfit : stats.grossProfit, sym)}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs font-bold text-emerald-200">
                  <span className="bg-white/20 px-2.5 py-1 rounded-lg">
                    الهامش: {showAdvanced ? stats.netMarginPct : stats.marginPct}%
                  </span>
                  <span className="bg-white/15 px-2.5 py-1 rounded-lg">
                    المارك اب: {stats.markupPct}%
                  </span>
                </div>
              </div>

              {/* Visual Breakdown Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] text-white/90 font-bold">
                  <span>التكلفة ({stats.costShare}%)</span>
                  {showAdvanced && <span>المصاريف ({stats.feesShare}%)</span>}
                  <span>الربح ({stats.profitShare}%)</span>
                </div>
                <div className="h-3 w-full rounded-full bg-white/30 overflow-hidden flex">
                  <div className="h-full bg-rose-400" style={{ width: `${stats.costShare}%` }} title="تكلفة المنتج" />
                  {showAdvanced && (
                    <div className="h-full bg-amber-400" style={{ width: `${stats.feesShare}%` }} title="المصاريف الإضافية" />
                  )}
                  <div className="h-full bg-emerald-400" style={{ width: `${stats.profitShare}%` }} title="صافي الربح" />
                </div>
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
              <h3 className="text-sm font-bold text-ink">تفاصيل ومؤشرات التسعير</h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-brand-border/30">
                  <span className="text-ink-secondary">سعر التكلفة الأصلي</span>
                  <span className="font-bold text-ink">{fmt(stats.cost, sym)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-border/30">
                  <span className="text-ink-secondary">سعر البيع المقترح</span>
                  <span className="font-bold text-brand-dark text-sm">{fmt(stats.rev, sym)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-border/30">
                  <span className="text-ink-secondary">إجمالي الربح الإجمالي</span>
                  <span className="font-bold text-emerald-600">{fmt(stats.grossProfit, sym)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-border/30">
                  <span className="text-ink-secondary">هامش الربح الإجمالي (Margin)</span>
                  <span className="font-bold text-ink">{stats.marginPct}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-brand-border/30">
                  <span className="text-ink-secondary">نسبة المارك اب (Markup)</span>
                  <span className="font-bold text-ink">{stats.markupPct}%</span>
                </div>

                {showAdvanced && (
                  <>
                    <div className="flex justify-between py-1.5 border-b border-brand-border/30 text-ink-muted">
                      <span>الشحن والتوصيل</span>
                      <span>- {fmt(stats.totalShipping, sym)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-brand-border/30 text-ink-muted">
                      <span>عمولة بوابة الدفع ({paymentGatewayPct}%)</span>
                      <span>- {fmt(stats.totalGateway, sym)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-brand-border/30 text-ink-muted">
                      <span>تكلفة الإعلانات</span>
                      <span>- {fmt(stats.totalAds, sym)}</span>
                    </div>
                    <div className="flex justify-between py-2 text-sm font-black text-brand-dark bg-brand-light/50 px-3 rounded-xl">
                      <span>صافي الربح في جيبك</span>
                      <span>{fmt(stats.netProfit, sym)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink-muted">
        💼 تم تصميم الحاسبة لمساعدة أصحاب المتاجر الإلكترونية والشركات ورواد الأعمال على اتخاذ قرارات تسعيرية مدروسة ومربحة.
      </p>
    </div>
  );
}
