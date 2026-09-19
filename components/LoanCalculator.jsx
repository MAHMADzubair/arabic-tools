"use client";

import { useMemo, useState } from "react";

const currencyOptions = [
  { code: "SAR", label: "ريال سعودي" },
  { code: "AED", label: "درهم إماراتي" },
  { code: "USD", label: "دولار أمريكي" },
  { code: "PKR", label: "روبية باكستانية" },
  { code: "EGP", label: "جنيه مصري" },
  { code: "KWD", label: "دينار كويتي" },
];

function toNum(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function calcLoan(principal, annualRate, months) {
  if (!principal || !months) return null;
  const p = principal;
  const n = months;

  if (annualRate === 0) {
    const monthly = p / n;
    return {
      monthlyPayment: monthly,
      totalPayment: monthly * n,
      totalInterest: 0,
      schedule: Array.from({ length: n }, (_, i) => ({
        month: i + 1,
        payment: monthly,
        principal: monthly,
        interest: 0,
        balance: Math.max(p - monthly * (i + 1), 0),
      })),
    };
  }

  const r = annualRate / 100 / 12;
  const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = monthly * n;
  const totalInterest = totalPayment - p;

  let balance = p;
  const schedule = [];
  for (let i = 1; i <= n; i++) {
    const interest = balance * r;
    const principalPaid = monthly - interest;
    balance = Math.max(balance - principalPaid, 0);
    schedule.push({ month: i, payment: monthly, principal: principalPaid, interest, balance });
  }

  return { monthlyPayment: monthly, totalPayment, totalInterest, schedule };
}

export default function LoanCalculator() {
  const [currency, setCurrency] = useState("SAR");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);

  const totalMonths = toNum(years) * 12 + toNum(months);
  const result = useMemo(
    () => calcLoan(toNum(principal), toNum(rate), totalMonths),
    [principal, rate, totalMonths]
  );

  const fmt = (n) =>
    n.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const hasResult = result !== null && toNum(principal) > 0 && totalMonths > 0;
  const interestPct = hasResult
    ? +((result.totalInterest / result.totalPayment) * 100).toFixed(1)
    : 0;
  const principalPct = hasResult
    ? +((toNum(principal) / result.totalPayment) * 100).toFixed(1)
    : 0;

  return (
    <div className="mx-auto max-w-lg">
      {/* Page header */}
      <div className="mb-6 rounded-2xl bg-hero-gradient p-6 text-white shadow-result">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-2xl">🏦</span>
          <h1 className="text-2xl font-extrabold">حاسبة القروض</h1>
        </div>
        <p className="text-sm text-white/80">
          احسب القسط الشهري وإجمالي الفائدة وجدول السداد لأي قرض أو رهن عقاري
        </p>
      </div>

      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card sm:p-7">
        {/* Currency */}
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

        {/* Principal */}
        <Field label="مبلغ القرض">
          <input
            type="number"
            inputMode="decimal"
            placeholder="مثال: 500,000"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="input flex-1 text-right"
          />
        </Field>

        {/* Rate */}
        <Field label="معدل الفائدة السنوي (%)">
          <input
            type="number"
            inputMode="decimal"
            placeholder="مثال: 5.5"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="input flex-1 text-right"
          />
        </Field>

        {/* Duration */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-ink-secondary">مدة القرض</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="input w-full text-right"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted">سنة</span>
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                min="0"
                max="11"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                className="input w-full text-right"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted">شهر</span>
            </div>
          </div>
          {totalMonths > 0 && (
            <p className="mt-1.5 text-xs text-ink-muted">إجمالي المدة: {totalMonths} شهراً</p>
          )}
        </div>

        {/* Results */}
        {hasResult && (
          <div className="mt-2 space-y-3">
            {/* Monthly highlight */}
            <div className="rounded-xl bg-hero-gradient p-5 text-center text-white shadow-result">
              <p className="mb-1 text-sm opacity-80">القسط الشهري</p>
              <p className="text-4xl font-extrabold">{fmt(result.monthlyPayment)}</p>
              <p className="mt-1 text-sm opacity-80">{currency}</p>
            </div>

            {/* Breakdown */}
            <div className="rounded-xl border border-brand-border bg-brand-light p-4 space-y-2">
              <ResultLine label="مبلغ القرض الأصلي" value={`${fmt(toNum(principal))} ${currency}`} />
              <ResultLine label="إجمالي الفوائد" value={`${fmt(result.totalInterest)} ${currency}`} />
              <div className="border-t border-brand-border pt-2">
                <ResultLine label="إجمالي المدفوعات" value={`${fmt(result.totalPayment)} ${currency}`} bold />
              </div>
              <ResultLine label="نسبة الفائدة" value={`${interestPct}%`} />
            </div>

            {/* Progress bar */}
            <div className="rounded-xl border border-brand-border bg-white p-4">
              <p className="mb-2 text-xs font-semibold text-ink-muted">توزيع المدفوعات</p>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-tertiary">
                <div
                  className="bg-brand-600 transition-all duration-700"
                  style={{ width: `${principalPct}%` }}
                />
                <div
                  className="bg-accent transition-all duration-700"
                  style={{ width: `${interestPct}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-ink-secondary">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-brand-600 inline-block" />
                  رأس المال ({principalPct}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent inline-block" />
                  الفوائد ({interestPct}%)
                </span>
              </div>
            </div>

            {/* Schedule toggle */}
            <button
              onClick={() => setShowSchedule((v) => !v)}
              className="w-full rounded-xl border border-brand-border py-2.5 text-sm font-semibold text-brand transition hover:bg-brand-light active:scale-95"
            >
              {showSchedule ? "إخفاء جدول السداد ▲" : "عرض جدول السداد كاملاً ▼"}
            </button>

            {/* Amortization */}
            {showSchedule && (
              <div className="overflow-x-auto rounded-xl border border-brand-border">
                <table className="w-full min-w-[420px] text-xs">
                  <thead>
                    <tr className="bg-hero-gradient text-white">
                      <th className="px-3 py-2.5 text-center">الشهر</th>
                      <th className="px-3 py-2.5 text-right">القسط</th>
                      <th className="px-3 py-2.5 text-right">الأصل</th>
                      <th className="px-3 py-2.5 text-right">الفائدة</th>
                      <th className="px-3 py-2.5 text-right">الرصيد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((row, i) => (
                      <tr key={row.month} className={i % 2 === 0 ? "bg-white" : "bg-brand-50"}>
                        <td className="px-3 py-2 text-center font-bold text-brand">{row.month}</td>
                        <td className="px-3 py-2 text-right">{fmt(row.payment)}</td>
                        <td className="px-3 py-2 text-right">{fmt(row.principal)}</td>
                        <td className="px-3 py-2 text-right text-accent-dark">{fmt(row.interest)}</td>
                        <td className="px-3 py-2 text-right">{fmt(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <p className="mt-6 text-[11px] leading-relaxed text-ink-muted">
          هذه الأداة للمساعدة في التقدير فقط. النتائج قد تختلف عن عروض البنوك الفعلية.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
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
