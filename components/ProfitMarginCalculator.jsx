"use client";

import { useState, useMemo, useId } from "react";

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
  { label: "متجر إلكتروني (سلة/زد)", cost: 60, price: 140, shipping: 25, gatewayFee: 2.5, adSpend: 15, vat: 15 },
  { label: "تجارة تجزئة وسوبرماركت", cost: 80, price: 105, shipping: 0, gatewayFee: 1.0, adSpend: 0, vat: 15 },
  { label: "دروب شيبينغ (Dropshipping)", cost: 45, price: 120, shipping: 15, gatewayFee: 3.0, adSpend: 30, vat: 0 },
  { label: "خدمات واستشارات", cost: 200, price: 650, shipping: 0, gatewayFee: 2.0, adSpend: 50, vat: 15 },
];

function fmt(n, sym) {
  return `${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${sym}`;
}

function NumField({ label, value, onChange, suffix, min = "0", max, step }) {
  const id = useId();
  return (
    <div>
      <label className="pm-label" htmlFor={id}>{label}</label>
      <div className="pm-suffix-wrap">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pm-input"
          style={{ paddingInlineEnd: "3.5rem" }}
        />
        <span className="pm-suffix" aria-hidden="true">{suffix}</span>
      </div>
    </div>
  );
}

export default function ProfitMarginCalculator() {
  const currencyId = useId();

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

  // Calculations (unchanged)
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
    const text = `تقرير تسعير وهامش الربح:
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
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const headlineProfit = showAdvanced ? stats.netProfit : stats.grossProfit;
  const headlineMargin = showAdvanced ? stats.netMarginPct : stats.marginPct;

  const modes = [
    { id: "cost_price", label: "معرفة الهامش من سعر البيع" },
    { id: "target_margin", label: "تحديد السعر بهامش الربح %" },
    { id: "target_markup", label: "تحديد السعر بالمارك اب %" },
  ];

  return (
    <div className="pm" dir="rtl">
      <style>{css}</style>

      <header className="pm-head">
        <p className="pm-kicker">حاسبة التسعير وهوامش الأرباح</p>
        <h1 className="pm-h1">حاسبة هامش الربح والتسعير (Margin &amp; Markup)</h1>
        <p className="pm-lead">
          احسب هامش ربحك الحقيقي ونسبة المارك اب وسعر البيع الأمثل لمنتجاتك، مع احتساب تكاليف الشحن والإعلانات وبوابات الدفع الإلكتروني.
        </p>
      </header>

      {/* Currency & Presets */}
      <section className="pm-bar-top pm-noprint" aria-label="العملة والنماذج الجاهزة">
        <div className="pm-presets" role="group" aria-label="نماذج تسعير شائعة للتجربة">
          <span className="pm-small pm-bold">نماذج تسعير شائعة للتجربة:</span>
          {PRESETS.map((p, idx) => (
            <button key={idx} type="button" className="pm-btn" onClick={() => handleApplyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="pm-currency">
          <label className="pm-label pm-label-flush" htmlFor={currencyId}>العملة</label>
          <select
            id={currencyId}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="pm-input pm-select"
          >
            {CURRENCIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.symbol} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="pm-grid">
        {/* ─── Inputs ─── */}
        <div className="pm-col pm-noprint">
          <section className="pm-box" aria-labelledby="pm-s1">
            <h2 className="pm-h2" id="pm-s1"><span className="pm-num">1</span><span>اختر طريقة الحساب والتسعير</span></h2>

            <div className="pm-stack">
              <fieldset className="pm-fieldset">
                <legend className="pm-sr">طريقة الحساب</legend>
                <div className="pm-seg">
                  {modes.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="pm-btn pm-btn-tall"
                      aria-pressed={calcMode === m.id}
                      onClick={() => setCalcMode(m.id)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="pm-two">
                <NumField
                  label="تكلفة المنتج / الخدمة (Cost)"
                  suffix={sym}
                  step="any"
                  value={costPrice}
                  onChange={setCostPrice}
                />

                {calcMode === "cost_price" && (
                  <NumField
                    label="سعر البيع النهائي (Revenue / Price)"
                    suffix={sym}
                    step="any"
                    value={sellingPrice}
                    onChange={setSellingPrice}
                  />
                )}
                {calcMode === "target_margin" && (
                  <NumField
                    label="هامش الربح المستهدف (Margin %)"
                    suffix="%"
                    min="1"
                    max="99"
                    step="any"
                    value={targetMargin}
                    onChange={setTargetMargin}
                  />
                )}
                {calcMode === "target_markup" && (
                  <NumField
                    label="نسبة المارك اب المستهدفة (Markup %)"
                    suffix="%"
                    min="1"
                    step="any"
                    value={targetMarkup}
                    onChange={setTargetMarkup}
                  />
                )}
              </div>
            </div>
          </section>

          <section className="pm-box" aria-labelledby="pm-s2">
            <div className="pm-row">
              <h2 className="pm-h2 pm-h2-flush" id="pm-s2"><span className="pm-num">2</span><span>تكاليف التجارة الإلكترونية والتشغيل (اختياري)</span></h2>
              <button
                type="button"
                className="pm-btn"
                aria-expanded={showAdvanced}
                aria-controls="pm-adv"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? "إخفاء التفاصيل" : "تفعيل التكاليف"}
              </button>
            </div>

            {showAdvanced && (
              <div id="pm-adv" className="pm-three">
                <NumField label="تكلفة الشحن والتوصيل" suffix={sym} value={shippingCost} onChange={setShippingCost} />
                <NumField label="عمولة بوابة الدفع (مدى/فيزا)" suffix="%" step="0.1" value={paymentGatewayPct} onChange={setPaymentGatewayPct} />
                <NumField label="تكلفة الإعلانات لكل طلب (CAC)" suffix={sym} value={adSpendPerUnit} onChange={setAdSpendPerUnit} />
              </div>
            )}
          </section>

          <aside className="pm-edu" aria-labelledby="pm-edu">
            <h2 className="pm-edu-title" id="pm-edu">الفرق الجوهري بين هامش الربح (Margin) والمارك اب (Markup)</h2>
            <p>
              <strong>هامش الربح (Profit Margin):</strong> نسبة الربح المحسوبة من <u>سعر البيع النهائي</u>، ولا يمكن أن يتجاوز 100%.
            </p>
            <p>
              <strong>المارك اب (Markup):</strong> نسبة الزيادة المضافة فوق <u>سعر التكلفة الأصلي</u>، ويمكن أن يتجاوز 100% و500%.
            </p>
            <p className="pm-bold">
              مثال: منتج تكلفته 100 وبيع بـ 200: ربحك 100، المارك اب = 100%، بينما هامش الربح = 50% فقط.
            </p>
          </aside>
        </div>

        {/* ─── Results ─── */}
        <div className="pm-col">
          <div className="pm-sticky">
            <section className="pm-result" aria-live="polite" aria-labelledby="pm-res-label">
              <p className="pm-result-label" id="pm-res-label">
                {showAdvanced ? "صافي الربح الفعلي بعد المصاريف" : "إجمالي الربح الأساسي"}
              </p>
              <p className="pm-result-big"><bdi>{fmt(headlineProfit, sym)}</bdi></p>
              <p className="pm-result-sub">سعر البيع: <bdi>{fmt(stats.rev, sym)}</bdi></p>

              <div className="pm-result-cells">
                <div>
                  <p className="pm-result-sm">الهامش</p>
                  <p className="pm-result-val"><bdi>{headlineMargin}%</bdi></p>
                </div>
                <div>
                  <p className="pm-result-sm">المارك اب</p>
                  <p className="pm-result-val"><bdi>{stats.markupPct}%</bdi></p>
                </div>
              </div>

              {headlineProfit < 0 && (
                <p className="pm-warn" role="alert">
                  تنبيه: سعر البيع أقل من إجمالي التكاليف، والنتيجة خسارة.
                </p>
              )}
            </section>

            {/* Distribution */}
            <section className="pm-box" aria-labelledby="pm-dist">
              <h2 className="pm-h2 pm-h2-sm" id="pm-dist">توزيع سعر البيع</h2>
              <div
                className="pm-bar"
                role="img"
                aria-label={`التكلفة ${stats.costShare}% ${showAdvanced ? `والمصاريف ${stats.feesShare}% ` : ""}والربح ${stats.profitShare}%`}
              >
                <div className="pm-bar-seg" data-t="0" style={{ flex: `${stats.costShare} 1 0` }} />
                {showAdvanced && <div className="pm-bar-seg" data-t="2" style={{ flex: `${stats.feesShare} 1 0` }} />}
                <div className="pm-bar-seg" data-t="1" style={{ flex: `${stats.profitShare} 1 0` }} />
              </div>
              <ul className="pm-legend">
                <li><span className="pm-sw" data-t="0" aria-hidden="true" />التكلفة <bdi>({stats.costShare}%)</bdi></li>
                {showAdvanced && <li><span className="pm-sw" data-t="2" aria-hidden="true" />المصاريف <bdi>({stats.feesShare}%)</bdi></li>}
                <li><span className="pm-sw" data-t="1" aria-hidden="true" />الربح <bdi>({stats.profitShare}%)</bdi></li>
              </ul>
            </section>

            {/* Details */}
            <section className="pm-box" aria-labelledby="pm-det">
              <div className="pm-row pm-row-wrap">
                <h2 className="pm-h2 pm-h2-sm pm-h2-flush" id="pm-det">تفاصيل ومؤشرات التسعير</h2>
                <div className="pm-actions pm-noprint">
                  <button type="button" className="pm-btn" onClick={handleCopy}>
                    {copied ? "تم نسخ التقرير" : "نسخ النتيجة"}
                  </button>
                  <button type="button" className="pm-btn" onClick={() => window.print()}>
                    طباعة
                  </button>
                </div>
              </div>
              <p className="pm-sr" role="status">{copied ? "تم نسخ التقرير" : ""}</p>

              <dl className="pm-rows">
                <div><dt>سعر التكلفة الأصلي</dt><dd><bdi>{fmt(stats.cost, sym)}</bdi></dd></div>
                <div><dt>سعر البيع المقترح</dt><dd><bdi>{fmt(stats.rev, sym)}</bdi></dd></div>
                <div><dt>إجمالي الربح الإجمالي</dt><dd><bdi>{fmt(stats.grossProfit, sym)}</bdi></dd></div>
                <div><dt>هامش الربح الإجمالي (Margin)</dt><dd><bdi>{stats.marginPct}%</bdi></dd></div>
                <div><dt>نسبة المارك اب (Markup)</dt><dd><bdi>{stats.markupPct}%</bdi></dd></div>
                {showAdvanced && (
                  <>
                    <div><dt>الشحن والتوصيل</dt><dd><bdi>− {fmt(stats.totalShipping, sym)}</bdi></dd></div>
                    <div><dt>عمولة بوابة الدفع (<bdi>{paymentGatewayPct}%</bdi>)</dt><dd><bdi>− {fmt(stats.totalGateway, sym)}</bdi></dd></div>
                    <div><dt>تكلفة الإعلانات</dt><dd><bdi>− {fmt(stats.totalAds, sym)}</bdi></dd></div>
                    <div className="pm-rows-total"><dt>صافي الربح في جيبك</dt><dd><bdi>{fmt(stats.netProfit, sym)}</bdi></dd></div>
                  </>
                )}
              </dl>
            </section>
          </div>
        </div>
      </div>

      <p className="pm-foot">
        صُممت الحاسبة لمساعدة أصحاب المتاجر الإلكترونية والشركات ورواد الأعمال على اتخاذ قرارات تسعيرية مدروسة.
      </p>
    </div>
  );
}

// ─── Styles: Ink & Signal ──────────────────────────────────────────────────────
// Reads the site's --c-* tokens when present, with the palette as fallback.
// Orange is only ever a background, always with black text.
const css = `
.pm{
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
  :root:not([data-theme="light"]) .pm{
    --i-bg:var(--c-bg,#0D0D0D);--i-ink:var(--c-ink,#F5F5F2);
    --i-mute:var(--c-mute,#B4B4AD);--i-soft:var(--c-soft,#2A2A27);
  }
}
:root[data-theme="dark"] .pm{
  --i-bg:var(--c-bg,#0D0D0D);--i-ink:var(--c-ink,#F5F5F2);
  --i-mute:var(--c-mute,#B4B4AD);--i-soft:var(--c-soft,#2A2A27);
}
.pm *{box-sizing:border-box}
.pm h1,.pm h2,.pm p,.pm dl,.pm dd,.pm ul{margin:0;padding:0}
.pm ul{list-style:none}
.pm button,.pm input,.pm select{font:inherit;color:inherit}
.pm :focus-visible{outline:3px solid var(--i-ink);outline-offset:2px}
.pm bdi{unicode-bidi:isolate;font-variant-numeric:tabular-nums}

.pm-head{margin-bottom:1.75rem;max-width:44rem}
.pm-kicker{font-size:.85rem;font-weight:700;color:var(--i-mute);margin-bottom:.35rem}
.pm-h1{font-size:clamp(1.9rem,5vw,2.8rem);font-weight:900;line-height:1.2;margin-bottom:.75rem}
.pm-lead{color:var(--i-mute);max-width:38rem}

.pm-bar-top{display:grid;gap:1rem;margin-bottom:1.5rem;border:2px solid var(--i-ink);border-radius:4px;padding:1rem}
@media (min-width:768px){.pm-bar-top{grid-template-columns:minmax(0,1fr) auto;align-items:end}}
.pm-presets{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}
.pm-currency{display:grid;gap:.3rem}
.pm-select{min-height:2.5rem;padding:.35rem .6rem;font-size:.85rem}

.pm-grid{display:grid;gap:1.5rem;grid-template-columns:minmax(0,1fr)}
@media (min-width:1024px){.pm-grid{grid-template-columns:minmax(0,3fr) minmax(0,2fr);align-items:start}}
.pm-col{display:grid;gap:1.5rem;min-width:0}
.pm-sticky{display:grid;gap:1.5rem}
@media (min-width:1024px){.pm-sticky{position:sticky;top:1rem}}

.pm-box{border:2px solid var(--i-ink);border-radius:4px;padding:1.25rem}
.pm-h2{display:flex;align-items:center;gap:.65rem;font-size:1.05rem;font-weight:800;margin-bottom:1rem}
.pm-h2-sm{font-size:.95rem;margin-bottom:.75rem}
.pm-h2-flush{margin-bottom:0}
.pm-num{display:inline-flex;flex:none;width:1.75rem;height:1.75rem;align-items:center;justify-content:center;background:var(--i-ink);color:var(--i-bg);font-size:.85rem;font-weight:800;border-radius:2px}
.pm-stack{display:grid;gap:1.1rem}
.pm-two{display:grid;gap:1rem;grid-template-columns:minmax(0,1fr)}
@media (min-width:560px){.pm-two{grid-template-columns:repeat(2,minmax(0,1fr))}}
.pm-three{display:grid;gap:1rem;margin-top:1rem;grid-template-columns:minmax(0,1fr)}
@media (min-width:640px){.pm-three{grid-template-columns:repeat(3,minmax(0,1fr))}}
.pm-fieldset{border:0;margin:0;padding:0;min-width:0}
.pm-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.pm-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:space-between;align-items:center}
.pm-row-wrap{margin-bottom:.9rem}
.pm-actions{display:flex;gap:.5rem}

.pm-label{display:block;font-size:.8rem;font-weight:700;margin-bottom:.35rem;padding:0}
.pm-label-flush{margin-bottom:0}
.pm-small{font-size:.78rem;color:var(--i-mute)}
.pm-bold{font-weight:700}
.pm-input{width:100%;border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);padding:.6rem .75rem;font-size:.95rem;font-weight:700;min-height:2.75rem}
.pm-suffix-wrap{position:relative}
.pm-suffix{position:absolute;inset-inline-end:.75rem;top:50%;transform:translateY(-50%);font-size:.75rem;font-weight:700;color:var(--i-mute);pointer-events:none}

.pm-btn{border:2px solid var(--i-ink);border-radius:4px;background:var(--i-bg);padding:.45rem .75rem;font-size:.8rem;font-weight:700;cursor:pointer;min-height:2.5rem}
.pm-btn:hover{background:var(--i-soft)}
.pm-btn[aria-pressed="true"],.pm-btn[aria-expanded="true"]{background:var(--i-ink);color:var(--i-bg)}
.pm-btn-tall{display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.35}
.pm-seg{display:grid;gap:.4rem;grid-template-columns:minmax(0,1fr)}
@media (min-width:640px){.pm-seg{grid-template-columns:repeat(3,minmax(0,1fr))}}

.pm-edu{border:2px solid var(--i-ink);border-inline-start-width:8px;border-radius:4px;padding:1rem 1.25rem;display:grid;gap:.5rem;font-size:.85rem}
.pm-edu-title{font-size:.95rem;font-weight:800}

.pm-result{background:var(--i-accent);color:var(--i-on-accent);border:2px solid var(--i-ink);border-radius:4px;padding:1.25rem 1.5rem;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pm-result-label{font-size:.9rem;font-weight:700}
.pm-result-big{font-size:clamp(2rem,6vw,2.75rem);font-weight:900;line-height:1.15;margin:.2rem 0 .25rem}
.pm-result-sub{font-size:.85rem;font-weight:600;margin-bottom:1rem}
.pm-result-cells{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem}
.pm-result-cells>div{border:2px solid var(--i-on-accent);border-radius:4px;padding:.55rem .7rem}
.pm-result-sm{font-size:.75rem;font-weight:600}
.pm-result-val{font-size:1.05rem;font-weight:800}
.pm-warn{margin-top:.9rem;border:2px dashed var(--i-on-accent);border-radius:4px;padding:.5rem .7rem;font-size:.85rem;font-weight:800}

.pm-bar{display:flex;height:1.6rem;border:2px solid var(--i-ink);border-radius:4px;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pm-bar-seg{min-width:0;border-inline-start:2px solid var(--i-bg)}
.pm-bar-seg:first-child{border-inline-start:0}
.pm-bar-seg[data-t="0"],.pm-sw[data-t="0"]{background:var(--i-ink)}
.pm-bar-seg[data-t="1"],.pm-sw[data-t="1"]{background:var(--i-accent)}
.pm-bar-seg[data-t="2"],.pm-sw[data-t="2"]{background:var(--i-soft)}
.pm-legend{display:flex;flex-wrap:wrap;gap:.4rem 1rem;margin-top:.75rem;font-size:.8rem;font-weight:700}
.pm-legend li{display:flex;align-items:center;gap:.4rem}
.pm-sw{display:inline-block;width:.9rem;height:.9rem;border:2px solid var(--i-ink);border-radius:2px;-webkit-print-color-adjust:exact;print-color-adjust:exact}

.pm-rows{border:2px solid var(--i-ink);border-radius:4px}
.pm-rows>div{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.15rem 1rem;padding:.55rem .8rem;border-bottom:1px solid var(--i-ink);font-size:.85rem}
.pm-rows>div:last-child{border-bottom:0}
.pm-rows dt{font-weight:600;color:var(--i-mute)}
.pm-rows dd{font-weight:800}
.pm-rows-total{background:var(--i-soft)}
.pm-rows-total dt{color:var(--i-ink);font-weight:800}

.pm-foot{margin-top:2rem;border:2px solid var(--i-ink);border-inline-start-width:8px;border-radius:4px;padding:.8rem 1rem;font-size:.8rem;color:var(--i-mute)}

@media print{
  .pm-noprint{display:none !important}
  .pm{padding:0}
  .pm-grid{grid-template-columns:minmax(0,1fr)}
  .pm-sticky{position:static}
}
`;