"use client";

import { useEffect, useMemo, useState } from "react";

const SILVER_NISAB_GRAMS = 595;
const GOLD_NISAB_GRAMS = 85;
const ZAKAT_RATE = 0.025;

const currencyOptions = [
  { code: "SAR", label: "ريال سعودي" },
  { code: "AED", label: "درهم إماراتي" },
  { code: "USD", label: "دولار أمريكي" },
  { code: "PKR", label: "روبية باكستانية" },
  { code: "EGP", label: "جنيه مصري" },
  { code: "KWD", label: "دينار كويتي" },
];

// Fallback prices per gram (24K Gold & Silver)
const FALLBACK_SILVER_PRICES = {
  SAR: 3.20,
  AED: 1.17,
  USD: 0.32,
  PKR: 89.0,
  EGP: 15.8,
  KWD: 0.098,
};

const FALLBACK_GOLD_PRICES = {
  SAR: 320.0,
  AED: 313.0,
  USD: 85.0,
  PKR: 23800.0,
  EGP: 4150.0,
  KWD: 26.2,
};

// Exchange rates vs USD
const USD_RATES = {
  SAR: 3.75,
  AED: 3.67,
  USD: 1.0,
  PKR: 278.0,
  EGP: 49.0,
  KWD: 0.307,
};

const emptyAssets = {
  cash: "",
  bankSavings: "",
  goldValue: "",
  silverValue: "",
  investments: "",
  businessInventory: "",
  receivables: "",
};

const emptyLiabilities = {
  shortTermDebt: "",
  billsDue: "",
};

const assetLabels = {
  cash: "النقد المتوفر",
  bankSavings: "المدخرات البنكية",
  goldValue: "قيمة الذهب",
  silverValue: "قيمة الفضة",
  investments: "الاستثمارات والأسهم",
  businessInventory: "بضاعة التجارة",
  receivables: "ديون متوقع تحصيلها",
};

const liabilityLabels = {
  shortTermDebt: "ديون قصيرة الأجل",
  billsDue: "فواتير مستحقة",
};

function toNumber(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

export default function ZakatCalculator() {
  const [currency, setCurrency] = useState("SAR");
  const [nisabStandard, setNisabStandard] = useState("silver"); // 'silver' | 'gold'
  const [gramPrice, setGramPrice] = useState("");
  const [assets, setAssets] = useState(emptyAssets);
  const [liabilities, setLiabilities] = useState(emptyLiabilities);
  const [priceStatus, setPriceStatus] = useState("idle"); // idle | loading | live | fallback | manual
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isManual, setIsManual] = useState(false);

  // Fetch live metal price when currency or standard changes
  useEffect(() => {
    if (isManual) return;

    setPriceStatus("loading");
    setGramPrice("");

    const metal = nisabStandard === "gold" ? "gold" : "silver";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    fetch(`https://api.metals.live/v1/spot/${metal}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("non-ok");
        return res.json();
      })
      .then((data) => {
        clearTimeout(timeout);
        const pricePerOz =
          data?.[0]?.[metal] ?? data?.price ?? data?.[metal] ?? null;
        if (!pricePerOz || isNaN(pricePerOz)) throw new Error("bad data");

        // Convert troy oz → gram, then USD → selected currency
        const pricePerGramUSD = pricePerOz / 31.1035;
        const converted = pricePerGramUSD * USD_RATES[currency];
        const rounded = Math.round(converted * 100) / 100;
        setGramPrice(String(rounded));
        setLastUpdated(new Date());
        setPriceStatus("live");
      })
      .catch(() => {
        clearTimeout(timeout);
        const fallback =
          nisabStandard === "gold"
            ? FALLBACK_GOLD_PRICES[currency]
            : FALLBACK_SILVER_PRICES[currency];
        setGramPrice(String(fallback));
        setLastUpdated(null);
        setPriceStatus("fallback");
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [currency, nisabStandard, isManual]);

  const handlePriceChange = (e) => {
    setIsManual(true);
    setGramPrice(e.target.value);
    setPriceStatus("manual");
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
    setIsManual(false);
  };

  const handleStandardChange = (standard) => {
    setNisabStandard(standard);
    setIsManual(false);
  };

  const handleRefetch = () => {
    setIsManual(false);
    setPriceStatus("idle");
  };

  const totals = useMemo(() => {
    const totalAssets = Object.values(assets).reduce((s, v) => s + toNumber(v), 0);
    const totalLiabilities = Object.values(liabilities).reduce((s, v) => s + toNumber(v), 0);
    const netWealth = Math.max(totalAssets - totalLiabilities, 0);
    const grams = nisabStandard === "gold" ? GOLD_NISAB_GRAMS : SILVER_NISAB_GRAMS;
    const nisabThreshold = toNumber(gramPrice) * grams;
    const meetsNisab = nisabThreshold > 0 && netWealth >= nisabThreshold;
    const zakatDue = meetsNisab ? netWealth * ZAKAT_RATE : 0;
    return { totalAssets, totalLiabilities, netWealth, nisabThreshold, meetsNisab, zakatDue, grams };
  }, [assets, liabilities, gramPrice, nisabStandard]);

  const fmt = (n) => n.toLocaleString("ar-EG", { maximumFractionDigits: 2 });

  const formatTime = (date) => {
    if (!date) return null;
    return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="mx-auto max-w-lg" dir="rtl">
      {/* Page header */}
      <div className="mb-6 rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1C1917] via-[#0D0D0D] to-[#262626] p-6 text-white shadow-xl shadow-black/20">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕌</span>
            <h1 className="text-2xl font-bold">حاسبة الزكاة الشرعية</h1>
          </div>
          <span className="rounded-full bg-[#FF5B04]/20 border border-[#FF5B04]/40 px-2.5 py-0.5 text-[11px] font-bold text-[#FF8A3D]">
            1447هـ / 2026م
          </span>
        </div>
        <p className="text-sm text-white/80">
          احسب زكاة مالك بدقة وفق نصاب الفضة أو الذهب المعتمد شرعياً
        </p>
      </div>

      <div className="rounded-2xl border border-[#D4D4CE] bg-white p-5 shadow-sm sm:p-7">
        {/* Nisab Standard Selection Toggle */}
        <SectionTitle>معيار النصاب الشرعي</SectionTitle>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleStandardChange("silver")}
            className={`rounded-xl border p-3 text-right transition-all ${
              nisabStandard === "silver"
                ? "border-[#FF5B04] bg-[#FFF7ED] font-bold text-[#0D0D0D] shadow-sm ring-2 ring-orange-500/20"
                : "border-[#D4D4CE] bg-white text-[#555555] hover:border-[#FF5B04]/50"
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-[#0D0D0D]">🥈 نصاب الفضة</span>
              <span className="text-[10px] text-[#6B6B66]">595 جرام</span>
            </div>
            <p className="text-[11px] leading-tight text-[#555555]">
              الأحوط وأنفع للفقراء (دار الإفتاء المصرية، الأوقاف بالإمارات، جمهور المذاهب)
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleStandardChange("gold")}
            className={`rounded-xl border p-3 text-right transition-all ${
              nisabStandard === "gold"
                ? "border-[#FF5B04] bg-[#FFF7ED] font-bold text-[#0D0D0D] shadow-sm ring-2 ring-orange-500/20"
                : "border-[#D4D4CE] bg-white text-[#555555] hover:border-[#FF5B04]/50"
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-[#0D0D0D]">🥇 نصاب الذهب</span>
              <span className="text-[10px] text-[#6B6B66]">85 جرام (24K)</span>
            </div>
            <p className="text-[11px] leading-tight text-[#555555]">
              أثبت قيمة لواقع النقود (كبار العلماء واللجنة الدائمة بالسعودية، ومجمع الفقه)
            </p>
          </button>
        </div>

        {/* Currency + Price */}
        <Field label="العملة">
          <select
            value={currency}
            onChange={handleCurrencyChange}
            className="input flex-1"
          >
            {currencyOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label} ({c.code})
              </option>
            ))}
          </select>
        </Field>

        {/* Gram Price Field with status badge */}
        <div className="mb-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <label className="text-sm font-medium text-ink-secondary">
              سعر جرام {nisabStandard === "gold" ? "الذهب عيار 24" : "الفضة"} ({currency})
            </label>
            <div className="relative flex flex-1 items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                placeholder={priceStatus === "loading" ? "جارٍ التحديث…" : "0.00"}
                value={gramPrice}
                onChange={handlePriceChange}
                disabled={priceStatus === "loading"}
                className="input flex-1 text-right disabled:opacity-50"
              />
              {priceStatus === "loading" && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              )}
            </div>
          </div>

          {/* Status row */}
          <div className="mt-1.5 flex items-center justify-between">
            <p className="text-xs text-ink-muted">
              النصاب = سعر الجرام × {totals.grams} جرام ={" "}
              <strong className="text-ink">
                {totals.nisabThreshold > 0 ? `${fmt(totals.nisabThreshold)} ${currency}` : "..."}
              </strong>
            </p>
            <div className="flex items-center gap-2">
              {priceStatus === "live" && lastUpdated && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  مباشر · {formatTime(lastUpdated)}
                </span>
              )}
              {priceStatus === "fallback" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  ⚠ سعر تقريبي
                </span>
              )}
              {priceStatus === "manual" && (
                <button
                  type="button"
                  onClick={handleRefetch}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand hover:bg-brand-100"
                >
                  ↻ تحديث تلقائي
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Assets */}
        <SectionTitle>الأصول الزكوية (ما تملكه)</SectionTitle>
        {Object.keys(emptyAssets).map((key) => (
          <Field key={key} label={assetLabels[key]}>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={assets[key]}
              onChange={(e) => setAssets((p) => ({ ...p, [key]: e.target.value }))}
              className="input flex-1 text-right"
            />
          </Field>
        ))}

        {/* Liabilities */}
        <SectionTitle className="mt-2">الالتزامات الواجبة (ما تدين به حالاً)</SectionTitle>
        {Object.keys(emptyLiabilities).map((key) => (
          <Field key={key} label={liabilityLabels[key]}>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={liabilities[key]}
              onChange={(e) => setLiabilities((p) => ({ ...p, [key]: e.target.value }))}
              className="input flex-1 text-right"
            />
          </Field>
        ))}

        {/* Results */}
        <div className="mt-6 rounded-xl border border-[#D4D4CE] bg-[#F5F5F2] p-4 space-y-2">
          <ResultLine label="إجمالي الأصول الزكوية" value={`${fmt(totals.totalAssets)} ${currency}`} />
          <ResultLine label="إجمالي الالتزامات المخصومة" value={`${fmt(totals.totalLiabilities)} ${currency}`} />
          <div className="border-t border-[#D4D4CE] pt-2">
            <ResultLine label="صافي الوعاء الزكوي" value={`${fmt(totals.netWealth)} ${currency}`} bold />
          </div>
          <ResultLine
            label={`حد النصاب الشرعي (${nisabStandard === "gold" ? "الذهب 85g" : "الفضة 595g"})`}
            value={
              priceStatus === "loading"
                ? "جارٍ التحديث…"
                : totals.nisabThreshold > 0
                ? `${fmt(totals.nisabThreshold)} ${currency}`
                : "أدخل سعر الجرام"
            }
          />
        </div>

        {/* Verdict */}
        {totals.nisabThreshold > 0 && (
          <div className="mt-4">
            {totals.meetsNisab ? (
              <div className="rounded-xl bg-gradient-to-r from-[#FF7A29] to-[#FF5B04] p-5 text-center text-[#0D0D0D] shadow-lg shadow-orange-500/20">
                <p className="mb-1 text-sm font-bold text-[#0D0D0D]/90">✓ بلغ مالك النصاب الشرعي وحال عليه الحول — الزكاة واجبة</p>
                <p className="text-3xl font-extrabold text-[#0D0D0D]">
                  {fmt(totals.zakatDue)} {currency}
                </p>
                <p className="mt-1 text-sm font-bold text-[#0D0D0D]/80">مقدار الزكاة الواجب إخراجها (2.5%)</p>
              </div>
            ) : (
              <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-5 text-center">
                <p className="font-bold text-[#9A3412]">
                  ⚠️ لم يبلغ مالك حد النصاب ({fmt(totals.nisabThreshold)} {currency}) — لا زكاة واجبة عليك هذا الحول
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 rounded-xl border border-[#D4D4CE] bg-[#F5F5F2]/70 p-3 text-[11px] leading-relaxed text-[#6B6B66] space-y-1.5">
          <p>
            <strong className="text-[#0D0D0D]">تنويه شرعي معتمد (النصاب):</strong> الخلاف بين اعتبار نصاب الذهب أو الفضة خلاف فقهي معتبر بين كبار العلماء المعاصرين. اختيارك للفضة أحوط للفقراء، واختيارك للذهب أعدل لواقع التضخم المعاصر.
          </p>
          <p>
            <strong className="text-[#0D0D0D]">أساس الحول (القمري vs الشمسي):</strong> يُحسب هذا المقدار بنسبة 2.5٪ الافتراضية وفق الحول القمري (الهجري 354 يوماً) وهو الأصل الشرعي للزكاة. أما إذا كانت حساباتك الزكوية أو ميزانيات شركتك مبنية على السنة المالية الشمسية (الميلادية 365 يوماً)، فإن النسبة المعتمدة وفق معيار أيوفي الشرعي رقم (9) ومجمع الفقه الإسلامي الدولي هي <strong>2.577٪</strong> (أو 2.5٪ × 365 / 354) لجبر فارق الـ 11 يوماً بين السنتين.
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children, className = "" }) {
  return (
    <h2 className={`mb-3 mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0D0D0D] ${className}`}>
      <span className="flex-1 border-t border-[#D4D4CE]" />
      {children}
      <span className="flex-1 border-t border-[#D4D4CE]" />
    </h2>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <label className="text-sm font-medium text-ink-secondary">{label}</label>
      {children}
    </div>
  );
}

function ResultLine({ label, value, bold }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-ink-secondary">{label}</span>
      <span className={bold ? "font-bold text-ink" : "text-ink"}>{value}</span>
    </div>
  );
}
