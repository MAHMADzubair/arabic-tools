"use client";

import { useState, useMemo } from "react";

/* ─── Unit Conversion Definitions ─────────────────────────────────────────── */
const UNIT_CATEGORIES = {
  length: {
    id: "length",
    name: "📏 الطول والمسافة",
    baseUnit: "m",
    units: [
      { id: "m", name: "متر", symbol: "م / m", rateToBase: 1 },
      { id: "km", name: "كيلومتر", symbol: "كم / km", rateToBase: 1000 },
      { id: "cm", name: "سنتيمتر", symbol: "سم / cm", rateToBase: 0.01 },
      { id: "mm", name: "مليمتر", symbol: "ملم / mm", rateToBase: 0.001 },
      { id: "mi", name: "ميل", symbol: "mi", rateToBase: 1609.344 },
      { id: "yd", name: "ياردة", symbol: "yd", rateToBase: 0.9144 },
      { id: "ft", name: "قدم", symbol: "قدم / ft", rateToBase: 0.3048 },
      { id: "in", name: "بوصة (إنش)", symbol: "بوصة / in", rateToBase: 0.0254 },
    ],
    presets: [
      { label: "1 ميل إلى كيلومتر", val: 1, from: "mi", to: "km" },
      { label: "100 متر إلى أقدام", val: 100, from: "m", to: "ft" },
      { label: "1 بوصة إلى سنتيمتر", val: 1, from: "in", to: "cm" },
      { label: "175 سم إلى أقدام وإنش", val: 175, from: "cm", to: "ft" },
    ],
  },
  weight: {
    id: "weight",
    name: "⚖️ الوزن والكتلة",
    baseUnit: "kg",
    units: [
      { id: "kg", name: "كيلوجرام", symbol: "كجم / kg", rateToBase: 1 },
      { id: "g", name: "جرام", symbol: "جم / g", rateToBase: 0.001 },
      { id: "mg", name: "مليجرام", symbol: "ملجم / mg", rateToBase: 0.000001 },
      { id: "t", name: "طن متري", symbol: "طن / t", rateToBase: 1000 },
      { id: "lb", name: "رطل (باوند)", symbol: "رطل / lb", rateToBase: 0.45359237 },
      { id: "oz", name: "أونصة (أوقية)", symbol: "أونصة / oz", rateToBase: 0.028349523125 },
      { id: "st", name: "ستون (Stone)", symbol: "st", rateToBase: 6.35029318 },
    ],
    presets: [
      { label: "1 كيلوجرام إلى باوند", val: 1, from: "kg", to: "lb" },
      { label: "150 باوند إلى كجم", val: 150, from: "lb", to: "kg" },
      { label: "1 أونصة إلى جرام", val: 1, from: "oz", to: "g" },
      { label: "1 طن إلى كيلوجرام", val: 1, from: "t", to: "kg" },
    ],
  },
  temperature: {
    id: "temperature",
    name: "🌡️ درجة الحرارة",
    isTemp: true,
    units: [
      { id: "C", name: "درجة مئوية", symbol: "°C" },
      { id: "F", name: "فهرنهايت", symbol: "°F" },
      { id: "K", name: "كلفن", symbol: "K" },
    ],
    presets: [
      { label: "درجة غليان الماء (100°C)", val: 100, from: "C", to: "F" },
      { label: "درجة حرارة الجسم (37°C)", val: 37, from: "C", to: "F" },
      { label: "درجة تجمد الماء (0°C)", val: 0, from: "C", to: "F" },
      { label: "100 فهرنهايت إلى مئوية", val: 100, from: "F", to: "C" },
    ],
  },
  area: {
    id: "area",
    name: "📐 المساحة",
    baseUnit: "m2",
    units: [
      { id: "m2", name: "متر مربع", symbol: "م²", rateToBase: 1 },
      { id: "km2", name: "كيلومتر مربع", symbol: "كم²", rateToBase: 1000000 },
      { id: "donum", name: "دونم (بلاد الشام/العراق)", symbol: "دونم", rateToBase: 1000 },
      { id: "feddan", name: "فدان (مصر)", symbol: "فدان", rateToBase: 4200.83 },
      { id: "ha", name: "هكتار", symbol: "ha", rateToBase: 10000 },
      { id: "acre", name: "فدان غربي (Acre)", symbol: "ac", rateToBase: 4046.856 },
      { id: "ft2", name: "قدم مربع", symbol: "قدم²", rateToBase: 0.092903 },
    ],
    presets: [
      { label: "1 دونم إلى متر مربع", val: 1, from: "donum", to: "m2" },
      { label: "1 هكتار إلى دونم", val: 1, from: "ha", to: "donum" },
      { label: "1 فدان إلى متر مربع", val: 1, from: "feddan", to: "m2" },
      { label: "500 متر مربع إلى أقدام²", val: 500, from: "m2", to: "ft2" },
    ],
  },
  volume: {
    id: "volume",
    name: "🧪 الحجم والسعة",
    baseUnit: "L",
    units: [
      { id: "L", name: "لتر", symbol: "لتر / L", rateToBase: 1 },
      { id: "mL", name: "مليلتر", symbol: "مل / mL", rateToBase: 0.001 },
      { id: "gal", name: "جالون أمريكي", symbol: "gal", rateToBase: 3.78541 },
      { id: "cup", name: "كوب قياسي", symbol: "كوب", rateToBase: 0.24 },
      { id: "floz", name: "أونصة سائلة", symbol: "fl oz", rateToBase: 0.0295735 },
      { id: "m3", name: "متر مكعب", symbol: "م³", rateToBase: 1000 },
    ],
    presets: [
      { label: "1 جالون أمريكي إلى لتر", val: 1, from: "gal", to: "L" },
      { label: "2 لتر إلى أكواب", val: 2, from: "L", to: "cup" },
      { label: "1 متر مكعب إلى لتر", val: 1, from: "m3", to: "L" },
      { label: "500 مل إلى لتر", val: 500, from: "mL", to: "L" },
    ],
  },
};

/* ─── Temperature Converter Helpers ───────────────────────────────────────── */
function convertTemp(val, from, to) {
  let c;
  if (from === "C") c = val;
  else if (from === "F") c = ((val - 32) * 5) / 9;
  else if (from === "K") c = val - 273.15;

  if (to === "C") return c;
  if (to === "F") return (c * 9) / 5 + 32;
  if (to === "K") return c + 273.15;
  return c;
}

export default function UnitConverter() {
  const [activeCategory, setActiveCategory] = useState("length");
  const [inputValue, setInputValue] = useState(1);
  const [fromUnit, setFromUnit] = useState("km");
  const [toUnit, setToUnit] = useState("mi");
  const [copied, setCopied] = useState(false);

  const category = UNIT_CATEGORIES[activeCategory];

  // Handle switching category
  const handleSelectCategory = (catKey) => {
    setActiveCategory(catKey);
    const cat = UNIT_CATEGORIES[catKey];
    setFromUnit(cat.units[0].id);
    setToUnit(cat.units[1].id);
    setInputValue(1);
  };

  // Swap units
  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  // Convert single pair
  const conversionResult = useMemo(() => {
    const val = Number(inputValue);
    if (isNaN(val)) return 0;

    if (category.isTemp) {
      return convertTemp(val, fromUnit, toUnit);
    }

    const uFrom = category.units.find((u) => u.id === fromUnit);
    const uTo = category.units.find((u) => u.id === toUnit);
    if (!uFrom || !uTo) return 0;

    const baseVal = val * uFrom.rateToBase;
    return baseVal / uTo.rateToBase;
  }, [category, inputValue, fromUnit, toUnit]);

  // Convert to ALL units in category for matrix overview
  const allConversions = useMemo(() => {
    const val = Number(inputValue);
    if (isNaN(val)) return [];

    return category.units.map((u) => {
      let res;
      if (category.isTemp) {
        res = convertTemp(val, fromUnit, u.id);
      } else {
        const uFrom = category.units.find((item) => item.id === fromUnit);
        const baseVal = val * (uFrom?.rateToBase || 1);
        res = baseVal / u.rateToBase;
      }

      // Formatting
      let formatted;
      if (Math.abs(res) >= 1000000 || (Math.abs(res) < 0.0001 && res !== 0)) {
        formatted = res.toExponential(4);
      } else if (Number.isInteger(res)) {
        formatted = res.toLocaleString("ar-EG");
      } else {
        formatted = Number(res.toFixed(4)).toLocaleString("ar-EG");
      }

      return {
        unit: u,
        value: formatted,
        isCurrent: u.id === fromUnit,
      };
    });
  }, [category, inputValue, fromUnit]);

  const handleApplyPreset = (p) => {
    setFromUnit(p.from);
    setToUnit(p.to);
    setInputValue(p.val);
  };

  const handleCopy = () => {
    const uFrom = category.units.find((u) => u.id === fromUnit)?.name;
    const uTo = category.units.find((u) => u.id === toUnit)?.name;
    const text = `🔄 نتيجة تحويل الوحدات:
${inputValue} ${uFrom} = ${Number(conversionResult.toFixed(4)).toLocaleString("ar-EG")} ${uTo}

تم التحويل عبر محول الوحدات الشامل | الأدوات العربية`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const uFromObj = category.units.find((u) => u.id === fromUnit);
  const uToObj = category.units.find((u) => u.id === toUnit);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12" dir="rtl">
      {/* Header */}
      <div className="mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-sm font-bold text-brand-dark">
          <span>📐</span>
          <span>محول القياسات والوحدات الفيزيائية</span>
        </div>
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
          محول الوحدات الشامل (الطول، الوزن، الحرارة، المساحة)
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-ink-secondary sm:text-base">
          حوّل بدقة بين جميع أنظمة القياس العالمية (المترية والإمبراطورية الأمريكية) مع جدول تحويل فوري لكافة الوحدات.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {Object.values(UNIT_CATEGORIES).map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleSelectCategory(cat.id)}
            className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-sm ${
              activeCategory === cat.id
                ? "bg-brand text-white shadow-md scale-105"
                : "bg-white text-ink-secondary border border-brand-border hover:bg-brand-light hover:text-brand-dark"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Quick Presets */}
      <div className="mb-6 rounded-2xl border border-brand-border bg-brand-surface/40 p-3 sm:p-4">
        <p className="mb-2 text-xs font-bold text-ink-muted">⚡ تحويلات شائعة وسريعة:</p>
        <div className="flex flex-wrap gap-2">
          {category.presets.map((p, idx) => (
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

          {/* Interactive Converter Box */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <span>🔄</span>
                <span>تحويل فوري بين وحدتين</span>
              </h2>

              <button
                type="button"
                onClick={handleSwap}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand bg-brand-light px-3 py-1.5 text-xs font-bold text-brand-dark hover:bg-brand hover:text-white transition-all shadow-sm"
              >
                <span>تبديل الوحدتين</span>
                <span>⇄</span>
              </button>
            </div>

            {/* From Input */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-secondary">القيمة المراد تحويلها</label>
                <input
                  type="number"
                  step="any"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-brand-surface/40 px-4 py-2.5 text-base font-bold text-ink focus:border-brand focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink-secondary">من وحدة:</label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-brand-surface/40 px-3 py-2.5 text-sm font-bold text-ink focus:border-brand focus:bg-white focus:outline-none"
                >
                  {category.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* To Unit Selector */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-ink-secondary">إلى وحدة:</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-brand-surface/40 px-3 py-2.5 text-sm font-bold text-ink focus:border-brand focus:bg-white focus:outline-none"
              >
                {category.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Complete Category Conversion Grid (Matrix) */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <span>📋</span>
              <span>
                المقابل في جميع وحدات {category.name.replace(/^[^\s]+\s/, "")} لـ ({inputValue} {uFromObj?.name}):
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {allConversions.map((item) => (
                <div
                  key={item.unit.id}
                  onClick={() => setToUnit(item.unit.id)}
                  className={`cursor-pointer rounded-xl border p-3 transition-all ${
                    item.isCurrent
                      ? "border-brand bg-brand-light/60 text-brand-dark font-black shadow-sm"
                      : toUnit === item.unit.id
                      ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold"
                      : "border-brand-border/60 bg-brand-surface/30 hover:bg-white text-ink"
                  }`}
                >
                  <span className="text-[11px] text-ink-muted block">{item.unit.name} ({item.unit.symbol})</span>
                  <span className="text-sm sm:text-base font-extrabold block truncate mt-0.5">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ─── Right Results Column (2 cols) ─── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">

            {/* Main Result Card */}
            <div className="rounded-2xl bg-hero-gradient p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-200">النتيجة المحولة</span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
                  {uToObj?.symbol}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium opacity-80 mb-1">
                  {inputValue} {uFromObj?.name} تعادل:
                </p>
                <p className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  {Number(conversionResult.toFixed(4)).toLocaleString("ar-EG")}{" "}
                  <span className="text-lg font-normal opacity-90">{uToObj?.name}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 rounded-xl bg-white/20 hover:bg-white/30 py-2 text-xs font-bold text-center transition-all"
                >
                  {copied ? "✓ تم نسخ النتيجة" : "📋 نسخ النتيجة"}
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

            {/* Conversion Formula Info */}
            <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
                <span>💡</span>
                <span>معادلة وقاعدة التحويل</span>
              </h3>

              <div className="rounded-xl bg-brand-surface/60 p-3 text-xs leading-relaxed text-ink-secondary space-y-1.5">
                <p className="font-bold text-brand-dark">
                  1 {uFromObj?.name} = {(
                    category.isTemp
                      ? convertTemp(1, fromUnit, toUnit)
                      : (uFromObj?.rateToBase || 1) / (uToObj?.rateToBase || 1)
                  ).toFixed(4)}{" "}
                  {uToObj?.name}
                </p>
                <p className="text-[11px] text-ink-muted">
                  للتحويل من {uFromObj?.name} إلى {uToObj?.name}، يتم ضرب القيمة في معامل التحويل القياسي المعتمد في النظام الدولي للوحدات (SI).
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink-muted">
        📏 يعتمد المحول على المعايير الفيزيائية الرسمية للنظام الدولي للوحدات (SI) والمكتب الدولي للأوزان والمقاييس (BIPM).
      </p>
    </div>
  );
}
