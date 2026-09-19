"use client";

import { useMemo, useState } from "react";

const SILVER_NISAB_GRAMS = 595;
const ZAKAT_RATE = 0.025;

const currencyOptions = [
  { code: "SAR", label: "ريال سعودي" },
  { code: "AED", label: "درهم إماراتي" },
  { code: "USD", label: "دولار أمريكي" },
  { code: "PKR", label: "روبية باكستانية" },
  { code: "EGP", label: "جنيه مصري" },
  { code: "KWD", label: "دينار كويتي" },
];

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
  const [silverPricePerGram, setSilverPricePerGram] = useState("");
  const [assets, setAssets] = useState(emptyAssets);
  const [liabilities, setLiabilities] = useState(emptyLiabilities);

  const totals = useMemo(() => {
    const totalAssets = Object.values(assets).reduce((s, v) => s + toNumber(v), 0);
    const totalLiabilities = Object.values(liabilities).reduce((s, v) => s + toNumber(v), 0);
    const netWealth = Math.max(totalAssets - totalLiabilities, 0);
    const nisabThreshold = toNumber(silverPricePerGram) * SILVER_NISAB_GRAMS;
    const meetsNisab = nisabThreshold > 0 && netWealth >= nisabThreshold;
    const zakatDue = meetsNisab ? netWealth * ZAKAT_RATE : 0;
    return { totalAssets, totalLiabilities, netWealth, nisabThreshold, meetsNisab, zakatDue };
  }, [assets, liabilities, silverPricePerGram]);

  const fmt = (n) => n.toLocaleString("ar-EG", { maximumFractionDigits: 2 });

  return (
    <div className="mx-auto max-w-lg">
      {/* Page header */}
      <div className="mb-6 rounded-2xl bg-hero-gradient p-6 text-white shadow-result">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-2xl">🕌</span>
          <h1 className="text-2xl font-extrabold">حاسبة الزكاة</h1>
        </div>
        <p className="text-sm text-white/80">
          احسب زكاة مالك بدقة بناءً على نصاب الفضة الحالي
        </p>
      </div>

      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card sm:p-7">
        {/* Currency + Silver price */}
        <SectionTitle>إعدادات الحساب</SectionTitle>

        <Field label="العملة">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="input flex-1"
          >
            {currencyOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label} ({c.code})
              </option>
            ))}
          </select>
        </Field>

        <Field label={`سعر جرام الفضة (${currency})`}>
          <input
            type="number"
            inputMode="decimal"
            placeholder="مثال: 3.2"
            value={silverPricePerGram}
            onChange={(e) => setSilverPricePerGram(e.target.value)}
            className="input flex-1 text-right"
          />
        </Field>
        <p className="mb-5 -mt-1 text-xs text-ink-muted">
          النصاب = سعر جرام الفضة × ٥٩٥ جرام
        </p>

        {/* Assets */}
        <SectionTitle>الأصول (ما تملكه)</SectionTitle>
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
        <SectionTitle className="mt-2">الالتزامات (ما تدين به)</SectionTitle>
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
        <div className="mt-6 rounded-xl border border-brand-border bg-brand-light p-4 space-y-2">
          <ResultLine label="إجمالي الأصول" value={`${fmt(totals.totalAssets)} ${currency}`} />
          <ResultLine label="إجمالي الالتزامات" value={`${fmt(totals.totalLiabilities)} ${currency}`} />
          <div className="border-t border-brand-border pt-2">
            <ResultLine label="صافي المال الزكوي" value={`${fmt(totals.netWealth)} ${currency}`} bold />
          </div>
          <ResultLine
            label="حد النصاب"
            value={totals.nisabThreshold > 0 ? `${fmt(totals.nisabThreshold)} ${currency}` : "أدخل سعر الفضة"}
          />
        </div>

        {/* Verdict */}
        {totals.nisabThreshold > 0 && (
          <div className={`mt-4 rounded-xl p-5 text-center ${totals.meetsNisab ? "bg-hero-gradient text-white shadow-result" : "bg-accent-light border border-accent"}`}>
            {totals.meetsNisab ? (
              <>
                <p className="mb-1 text-sm opacity-80">✓ مالك بلغ النصاب — الزكاة واجبة</p>
                <p className="text-3xl font-extrabold">
                  {fmt(totals.zakatDue)} {currency}
                </p>
                <p className="mt-1 text-sm opacity-80">مقدار الزكاة الواجبة عليك</p>
              </>
            ) : (
              <p className="font-semibold text-accent-dark">
                ⚠️ مالك لم يبلغ النصاب — لا زكاة واجبة عليك هذا الحول
              </p>
            )}
          </div>
        )}

        <p className="mt-5 text-[11px] leading-relaxed text-ink-muted">
          هذه الأداة للمساعدة في التقدير فقط. للحالات المعقدة يُفضل استشارة عالم شرعي أو مختص زكاة.
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ children, className = "" }) {
  return (
    <h2 className={`mb-3 mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand ${className}`}>
      <span className="flex-1 border-t border-brand-border" />
      {children}
      <span className="flex-1 border-t border-brand-border" />
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
